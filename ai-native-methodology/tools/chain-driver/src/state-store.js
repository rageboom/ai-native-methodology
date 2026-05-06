// state-store.js — ★ ADR-CHAIN-005 §2 (atomic write + CAS) + §6 (forward-only migration).
//
// .aimd/state.json read/write. tmp + fdatasync + rename.
// CAS: read-time version 기록 → mutate → write 시 version 일치 확인 → +1.
// Windows fallback: copyFile + unlink (rename EEXIST 회피).

import {
  readFileSync, existsSync, mkdirSync, statSync, renameSync,
  copyFileSync, unlinkSync, openSync, writeSync, fsyncSync, closeSync,
  readdirSync,
} from 'node:fs';
import { dirname, join, basename } from 'node:path';

export const CURRENT_STATE_VERSION = '1.0';

const DEFAULT_STATE = (projectId) => ({
  $schema_origin: '../../../schemas/state.schema.json',
  version: CURRENT_STATE_VERSION,
  project_id: projectId,
  current_chain: 'analysis',
  current_phase: 'P0.0',
  stage_progress: {
    analysis:  { status: 'in_progress' },
    planning:  { status: 'pending' },
    spec:      { status: 'pending' },
    test:      { status: 'pending' },
    implement: { status: 'pending' },
  },
  last_gate: null,
  pending_revisit: null,
  blocked: false,
  block_reason: null,
  lock_holder_pid: null,
  lock_acquired_at: null,
  revisit_ignore_globs: [],
  intervention_log_path: '.aimd/output/intervention-log.jsonl',
});

export function statePath(projectRoot) {
  return join(projectRoot, '.aimd', 'state.json');
}

function tmpPath(finalPath) {
  return `${finalPath}.tmp`;
}

export function ensureAimdDir(projectRoot) {
  const dir = join(projectRoot, '.aimd');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const out = join(dir, 'output');
  if (!existsSync(out)) mkdirSync(out, { recursive: true });
}

export function recoverTmpFiles(projectRoot) {
  const dir = join(projectRoot, '.aimd');
  if (!existsSync(dir)) return [];
  const recovered = [];
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.tmp')) {
      try {
        unlinkSync(join(dir, name));
        recovered.push(name);
      } catch { /* ignore */ }
    }
  }
  return recovered;
}

export function readState(projectRoot) {
  const path = statePath(projectRoot);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, 'utf-8');
  let json;
  try { json = JSON.parse(raw); }
  catch (e) { throw new StateCorruptError(`state.json parse failed: ${e.message}`); }
  if (typeof json.version !== 'string') {
    throw new StateCorruptError('state.json missing version field');
  }
  return json;
}

// Atomic write: tmp → fsync → rename (Windows fallback: copyFile + unlink).
export function atomicWrite(finalPath, contentString) {
  mkdirSync(dirname(finalPath), { recursive: true });
  const tmp = tmpPath(finalPath);
  const fd = openSync(tmp, 'w');
  try {
    writeSync(fd, contentString);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  try {
    renameSync(tmp, finalPath);
  } catch (e) {
    if (e && (e.code === 'EEXIST' || e.code === 'EPERM' || e.code === 'EACCES')) {
      // Windows fallback
      copyFileSync(tmp, finalPath);
      unlinkSync(tmp);
    } else {
      throw e;
    }
  }
}

// CAS write: read-time version 일치 확인 → +1 → write.
// `mutator(state)` returns updated state OR throws to abort.
export function writeStateCAS(projectRoot, mutator) {
  const path = statePath(projectRoot);
  const before = existsSync(path) ? readState(projectRoot) : null;
  const baselineVersion = before ? before.version : CURRENT_STATE_VERSION;

  const next = mutator(before ? structuredClone(before) : null);
  if (!next || typeof next !== 'object') {
    throw new Error('mutator must return state object');
  }

  // CAS check — between read and write, if file changed, abort.
  if (existsSync(path)) {
    const current = readState(projectRoot);
    if (current.version !== baselineVersion) {
      throw new StateCorruptError(
        `CAS conflict — read version ${baselineVersion} but current is ${current.version}`
      );
    }
  }

  // bump patch version on every write (CAS counter)
  next.version = bumpVersion(next.version || baselineVersion);
  atomicWrite(path, JSON.stringify(next, null, 2) + '\n');
  return next;
}

function bumpVersion(v) {
  // semver-ish: bump last numeric component. version is small monotonic counter for CAS.
  const parts = v.split('.').map((p) => Number(p));
  if (parts.some(isNaN)) return CURRENT_STATE_VERSION;
  parts[parts.length - 1] += 1;
  return parts.join('.');
}

// Lock helpers — single-writer assumption. 5 min stale auto-release.
const STALE_LOCK_MS = 5 * 60 * 1000;

export function acquireLock(projectRoot, pid = process.pid) {
  return writeStateCAS(projectRoot, (state) => {
    const now = new Date().toISOString();
    if (state && state.lock_holder_pid && state.lock_acquired_at) {
      const acquiredAt = new Date(state.lock_acquired_at).getTime();
      const stale = Date.now() - acquiredAt > STALE_LOCK_MS;
      if (!stale && state.lock_holder_pid !== pid) {
        throw new LockHeldError(`lock held by pid ${state.lock_holder_pid}`);
      }
    }
    state = state || {};
    state.lock_holder_pid = pid;
    state.lock_acquired_at = now;
    return state;
  });
}

export function releaseLock(projectRoot, pid = process.pid) {
  return writeStateCAS(projectRoot, (state) => {
    if (!state) return state;
    if (state.lock_holder_pid === pid) {
      state.lock_holder_pid = null;
      state.lock_acquired_at = null;
    }
    return state;
  });
}

// Migration registry — forward-only / 직전 1버전 호환만.
const MIGRATIONS = new Map();

export function registerMigration(fromVersion, toVersion, fn) {
  MIGRATIONS.set(`${fromVersion}->${toVersion}`, fn);
}

export function migrate(state, targetVersion = CURRENT_STATE_VERSION) {
  // version field is monotonic counter (e.g. 1.0, 1.1, 1.2 — same schema).
  // schema-breaking migration uses major bump (e.g. 1.x → 2.0).
  const fromMajor = state.version.split('.')[0];
  const toMajor = targetVersion.split('.')[0];
  if (fromMajor === toMajor) return state; // CAS counter only, no migration
  const key = `${fromMajor}.0->${toMajor}.0`;
  const fn = MIGRATIONS.get(key);
  if (!fn) {
    throw new MigrationRequiredError(
      `no migration registered for ${fromMajor}.0 → ${toMajor}.0. ` +
      `Run \`chain-driver migrate\` to register or abort.`
    );
  }
  return fn(structuredClone(state));
}

export function initState(projectRoot, projectId) {
  ensureAimdDir(projectRoot);
  const path = statePath(projectRoot);
  if (existsSync(path)) {
    throw new Error(`state.json already exists at ${path}`);
  }
  const initial = DEFAULT_STATE(projectId);
  atomicWrite(path, JSON.stringify(initial, null, 2) + '\n');
  return initial;
}

// Error types
export class StateCorruptError extends Error {
  constructor(msg) { super(msg); this.name = 'StateCorruptError'; this.exitCode = 4; }
}
export class LockHeldError extends Error {
  constructor(msg) { super(msg); this.name = 'LockHeldError'; this.exitCode = 1; }
}
export class MigrationRequiredError extends Error {
  constructor(msg) { super(msg); this.name = 'MigrationRequiredError'; this.exitCode = 4; }
}
