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
  current_phase: 'input.0',
  current_scope: null,
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
//
// ★ Senior F5#1 chaos test 발견 — caller 가 외부에서 read 한 시점의 baseline 을
//   `options.expectedVersion` 으로 전달하면, mutator 호출 시점의 disk 값과 비교하여
//   외부 race 를 detect. 미전달 시 함수 내부 read 만으로 best-effort CAS (단일 process 정합).
export function writeStateCAS(projectRoot, mutator, options = {}) {
  const path = statePath(projectRoot);
  const before = existsSync(path) ? readState(projectRoot) : null;
  const baselineVersion = before ? before.version : CURRENT_STATE_VERSION;

  // ★ Strict CAS — caller-supplied expectedVersion vs disk before mutator runs.
  if (options.expectedVersion !== undefined && before
      && before.version !== options.expectedVersion) {
    throw new StateCorruptError(
      `CAS conflict — caller expected version ${options.expectedVersion} but disk has ${before.version} (external write detected)`
    );
  }

  const next = mutator(before ? structuredClone(before) : null);
  if (!next || typeof next !== 'object') {
    throw new Error('mutator must return state object');
  }

  // ★ Re-check after mutator — defends against in-flight concurrent writes.
  if (existsSync(path)) {
    const current = readState(projectRoot);
    if (current.version !== baselineVersion) {
      throw new StateCorruptError(
        `CAS conflict — baseline ${baselineVersion} but disk advanced to ${current.version} during mutator`
      );
    }
  }

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

// ── ★ ★ G3 R5/R7 산출물 폴더 자동 + manifest 이중 렌더링 ─────────────────────
//
// scope = feature/도메인 작업 단위 (사용자 자유 명명 / kebab-case).
// layout = .aimd/<scope>/{planning,spec,test,impl}/manifest.{json,md} + scope root manifest.
// canonical global .aimd/output/ 5 이식성 산출물 은 scope 횡단 공통 (분리).
// M4 sync = drift 자동 감지 / cascade 는 사용자 명시 호출 (sync.js).
//
// import 방향 = state-store → work-unit (단방향). 순환 회피.

import {
  STAGES as STAGES_LIST,
  createScopeManifest,
  createStageManifest,
  renderManifestMd,
} from './work-unit.js';

const SCOPE_SLUG_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;

export function validateScopeSlug(slug) {
  if (typeof slug !== 'string') {
    throw new Error(`invalid scope slug: expected string, got ${typeof slug}`);
  }
  if (slug.length < 2 || slug.length > 64) {
    throw new Error(`invalid scope slug "${slug}": length must be 2..64`);
  }
  if (!SCOPE_SLUG_RE.test(slug)) {
    throw new Error(`invalid scope slug "${slug}": must match ${SCOPE_SLUG_RE} (kebab-case / ASCII / no path)`);
  }
  return true;
}

function validateStage(stage) {
  if (!STAGES_LIST.includes(stage)) {
    throw new Error(`invalid stage "${stage}": must be one of ${STAGES_LIST.join('|')}`);
  }
}

export function scopeDirPath(projectRoot, scope, stage) {
  validateScopeSlug(scope);
  if (stage !== undefined && stage !== null) validateStage(stage);
  return stage
    ? join(projectRoot, '.aimd', scope, stage)
    : join(projectRoot, '.aimd', scope);
}

export function ensureScopeDir(projectRoot, scope) {
  validateScopeSlug(scope);
  ensureAimdDir(projectRoot);

  const scopeDir = join(projectRoot, '.aimd', scope);
  if (!existsSync(scopeDir)) mkdirSync(scopeDir, { recursive: true });

  // Seed scope manifest (idempotent — only when absent).
  const scopeManifestPath = join(scopeDir, 'manifest.json');
  if (!existsSync(scopeManifestPath)) {
    writeManifest(projectRoot, scope, null, createScopeManifest(scope));
  }

  // 4 stage dirs + seeds (idempotent).
  for (const stage of STAGES_LIST) {
    const stageDir = join(scopeDir, stage);
    if (!existsSync(stageDir)) mkdirSync(stageDir, { recursive: true });
    const stageManifestPath = join(stageDir, 'manifest.json');
    if (!existsSync(stageManifestPath)) {
      writeManifest(projectRoot, scope, stage, createStageManifest(scope, stage));
    }
  }
}

export function writeManifest(projectRoot, scope, stage, manifest) {
  validateScopeSlug(scope);
  if (stage !== undefined && stage !== null) validateStage(stage);
  const dir = scopeDirPath(projectRoot, scope, stage);
  mkdirSync(dir, { recursive: true });

  const now = new Date().toISOString();
  const path = join(dir, 'manifest.json');
  const existing = existsSync(path)
    ? JSON.parse(readFileSync(path, 'utf-8'))
    : null;

  const enriched = {
    ...manifest,
    scope,
    ...(stage ? { stage } : {}),
    created_at: manifest.created_at || (existing && existing.created_at) || now,
    updated_at: now,
  };

  atomicWrite(path, JSON.stringify(enriched, null, 2) + '\n');
  atomicWrite(join(dir, 'manifest.md'), renderManifestMd(enriched));
  return enriched;
}

export function readManifest(projectRoot, scope, stage) {
  validateScopeSlug(scope);
  if (stage !== undefined && stage !== null) validateStage(stage);
  const path = join(scopeDirPath(projectRoot, scope, stage), 'manifest.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function listScopes(projectRoot) {
  const aimdDir = join(projectRoot, '.aimd');
  if (!existsSync(aimdDir)) return [];
  const scopes = [];
  for (const name of readdirSync(aimdDir)) {
    if (name === 'output' || name.startsWith('.') || name.endsWith('.json') || name.endsWith('.md') || name.endsWith('.tmp')) continue;
    const full = join(aimdDir, name);
    try {
      if (statSync(full).isDirectory() && SCOPE_SLUG_RE.test(name)) {
        scopes.push(name);
      }
    } catch { /* skip */ }
  }
  return scopes;
}
