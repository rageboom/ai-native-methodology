// state-store.js — ADR-CHAIN-005 §2 (atomic write + CAS) + §6 (forward-only migration).
//
// .ai-context/state.json read/write. tmp + fdatasync + rename.
// CAS: read-time version 기록 → mutate → write 시 version 일치 확인 → +1.
// Windows fallback: copyFile + unlink (rename EEXIST 회피).

import {
	readFileSync,
	existsSync,
	mkdirSync,
	statSync,
	renameSync,
	copyFileSync,
	unlinkSync,
	openSync,
	writeSync,
	fsyncSync,
	closeSync,
	readdirSync,
} from 'node:fs';
import { dirname, join, basename } from 'node:path';
import {
	bucketDirs,
	scopeDirPath as layoutScopeDirPath,
	scopeFileForRead,
	scopesRootPath,
	INTERVENTION_LOG_REL,
} from '../../_shared/ai-context-layout.js';

export const CURRENT_STATE_VERSION = '1.0';

const DEFAULT_STAGE_PROGRESS = () => ({
	analysis: { status: 'in_progress' },
	discovery: { status: 'pending' },
	spec: { status: 'pending' },
	plan: { status: 'pending' },
	test: { status: 'pending' },
	implement: { status: 'pending' },
});

const DEFAULT_STATE = (projectId) => ({
	// 정규 스키마 포인터 = $schema_ref (basename 라우팅 / 프로젝트-상대 / 이식성).
	// 레거시 $schema_origin(deprecated)의 깊은 ../ 상대경로는 프로젝트 밖을 가리켜 미해결이라 폐기.
	$schema_ref: 'schemas/state.schema.json',
	version: CURRENT_STATE_VERSION,
	project_id: projectId,
	current_chain: 'analysis',
	current_phase: 'input.0',
	current_scope: null,
	stage_progress: DEFAULT_STAGE_PROGRESS(),
	last_gate: null,
	pending_revisit: null,
	blocked: false,
	block_reason: null,
	lock_holder_pid: null,
	lock_acquired_at: null,
	revisit_ignore_globs: [],
	intervention_log_path: INTERVENTION_LOG_REL,
	scope_states: {},
});

export function statePath(projectRoot) {
	return join(projectRoot, '.ai-context', 'state.json');
}

function tmpPath(finalPath) {
	return `${finalPath}.tmp`;
}

export function ensureAimdDir(projectRoot) {
	// 3-버킷 골격 (.ai-context/ + base/ + scopes/ + runtime/) — DEC-2026-06-16.
	for (const dir of bucketDirs(projectRoot)) {
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	}
}

export function recoverTmpFiles(projectRoot) {
	const dir = join(projectRoot, '.ai-context');
	if (!existsSync(dir)) return [];
	const recovered = [];
	for (const name of readdirSync(dir)) {
		if (name.endsWith('.tmp')) {
			try {
				unlinkSync(join(dir, name));
				recovered.push(name);
			} catch {
				/* ignore */
			}
		}
	}
	return recovered;
}

export function readState(projectRoot) {
	const path = statePath(projectRoot);
	if (!existsSync(path)) return null;
	const raw = readFileSync(path, 'utf-8');
	let json;
	try {
		json = JSON.parse(raw);
	} catch (e) {
		throw new StateCorruptError(`state.json parse failed: ${e.message}`);
	}
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
		if (
			e &&
			(e.code === 'EEXIST' || e.code === 'EPERM' || e.code === 'EACCES')
		) {
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
// Senior F5#1 chaos test 발견 — caller 가 외부에서 read 한 시점의 baseline 을
//   `options.expectedVersion` 으로 전달하면, mutator 호출 시점의 disk 값과 비교하여
//   외부 race 를 detect. 미전달 시 함수 내부 read 만으로 best-effort CAS (단일 process 정합).
export function writeStateCAS(projectRoot, mutator, options = {}) {
	const path = statePath(projectRoot);
	const before = existsSync(path) ? readState(projectRoot) : null;
	const baselineVersion = before ? before.version : CURRENT_STATE_VERSION;

	// Strict CAS — caller-supplied expectedVersion vs disk before mutator runs.
	if (
		options.expectedVersion !== undefined &&
		before &&
		before.version !== options.expectedVersion
	) {
		throw new StateCorruptError(
			`CAS conflict — caller expected version ${options.expectedVersion} but disk has ${before.version} (external write detected)`,
		);
	}

	const next = mutator(before ? structuredClone(before) : null);
	if (!next || typeof next !== 'object') {
		throw new Error('mutator must return state object');
	}

	// Re-check after mutator — defends against in-flight concurrent writes.
	if (existsSync(path)) {
		const current = readState(projectRoot);
		if (current.version !== baselineVersion) {
			throw new StateCorruptError(
				`CAS conflict — baseline ${baselineVersion} but disk advanced to ${current.version} during mutator`,
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
				`Run \`chain-driver migrate\` to register or abort.`,
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

// scope_states[scope] 가 없으면 기본값으로 초기화 (idempotent).
// options.inheritGlobal=true: 이전 버전에서 upgrade 하는 기존 scope 에 대해
//   전역 chain state 를 복사한다 (신규 scope 는 analysis 에서 시작).
// CAS 뮤테이터 안에서 호출 — caller 가 이미 clone 된 state 를 넘김.
export function initScopeChainState(state, scope, options = {}) {
	if (!state.scope_states) state.scope_states = {};
	if (!Object.hasOwn(state.scope_states, scope)) {
		if (options.inheritGlobal) {
			// Upgrade path: scope 가 이미 활성 상태였으나 scope_states 미생성 버전에서 왔음.
			// 전역 chain state 를 그대로 승계해 진행 상태 손실 방지.
			state.scope_states[scope] = {
				current_chain: state.current_chain,
				stage_progress: structuredClone(state.stage_progress),
				last_gate: state.last_gate ? structuredClone(state.last_gate) : null,
			};
		} else {
			state.scope_states[scope] = {
				current_chain: 'analysis',
				stage_progress: DEFAULT_STAGE_PROGRESS(),
				last_gate: null,
			};
		}
	}
	return state;
}

// 활성 scope 의 chain 필드를 반환 (scope 없으면 전역 필드 fallback).
// { current_chain, stage_progress, last_gate, scoped: boolean }
export function getActiveScopeChain(state) {
	const scope = state.current_scope;
	if (scope && state.scope_states && Object.hasOwn(state.scope_states, scope)) {
		return { ...state.scope_states[scope], scoped: true, scope };
	}
	return {
		current_chain: state.current_chain,
		stage_progress: state.stage_progress,
		last_gate: state.last_gate,
		scoped: false,
		scope: null,
	};
}

// Error types
export class StateCorruptError extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'StateCorruptError';
		this.exitCode = 4;
	}
}
export class LockHeldError extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'LockHeldError';
		this.exitCode = 1;
	}
}
export class MigrationRequiredError extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'MigrationRequiredError';
		this.exitCode = 4;
	}
}

// ── G3 R5/R7 산출물 폴더 자동 + manifest 이중 렌더링 ─────────────────────
//
// scope = feature/도메인 작업 단위 (사용자 자유 명명 / kebab-case).
// layout = .ai-context/<scope>/{discovery,spec,plan,test,impl}/manifest.{json,md} + scope root manifest.
// canonical global .ai-context/output/ 5 이식성 산출물 은 scope 횡단 공통 (분리).
// M4 sync = drift 자동 감지 / cascade 는 사용자 명시 호출 (sync.js).
//
// import 방향 = state-store → work-unit (단방향). 순환 회피.

import {
	STAGES as STAGES_LIST,
	createScopeManifest,
	createStageManifest,
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
		throw new Error(
			`invalid scope slug "${slug}": must match ${SCOPE_SLUG_RE} (kebab-case / ASCII / no path)`,
		);
	}
	return true;
}

function validateStage(stage) {
	if (!STAGES_LIST.includes(stage)) {
		throw new Error(
			`invalid stage "${stage}": must be one of ${STAGES_LIST.join('|')}`,
		);
	}
}

export function scopeDirPath(projectRoot, scope, stage) {
	validateScopeSlug(scope);
	if (stage !== undefined && stage !== null) validateStage(stage);
	// 쓰기 경로 = NEW (.ai-context/scopes/<scope>[/<stage>]) — DEC-2026-06-16.
	return layoutScopeDirPath(projectRoot, scope, stage);
}

export function ensureScopeDir(projectRoot, scope, scenario) {
	validateScopeSlug(scope);
	ensureAimdDir(projectRoot);

	const scopeDir = layoutScopeDirPath(projectRoot, scope);
	if (!existsSync(scopeDir)) mkdirSync(scopeDir, { recursive: true });

	// Seed scope manifest (idempotent — only when absent). v11.9.0 scenario passthrough (use-scenario taxonomy).
	const scopeManifestPath = join(scopeDir, 'manifest.json');
	if (!existsSync(scopeManifestPath)) {
		writeManifest(
			projectRoot,
			scope,
			null,
			createScopeManifest(scope, scenario),
		);
	}

	// 4 stage dirs + seeds (idempotent).
	for (const stage of STAGES_LIST) {
		const stageDir = join(scopeDir, stage);
		if (!existsSync(stageDir)) mkdirSync(stageDir, { recursive: true });
		const stageManifestPath = join(stageDir, 'manifest.json');
		if (!existsSync(stageManifestPath)) {
			writeManifest(
				projectRoot,
				scope,
				stage,
				createStageManifest(scope, stage),
			);
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
	return enriched;
}

export function readManifest(projectRoot, scope, stage) {
	validateScopeSlug(scope);
	if (stage !== undefined && stage !== null) validateStage(stage);
	// 읽기 = alias (NEW scopes/ 우선, 없으면 구 최상위 scope) — 배포된 구 manifest 호환.
	const path = scopeFileForRead(projectRoot, scope, stage, 'manifest.json');
	if (!existsSync(path)) return null;
	return JSON.parse(readFileSync(path, 'utf-8'));
}

// 비-scope 디렉토리명 (구·신 레이아웃 공통 — deny-list 정밀화로 config/evidence/findings 오분류 결함 제거).
const NON_SCOPE_DIRS = new Set([
	'output',
	'base',
	'scopes',
	'runtime',
	'config',
	'evidence',
	'findings',
	'tool-runs',
	'layer-2-results',
	'baseline-evidence',
]);

export function listScopes(projectRoot) {
	// NEW 레이아웃: scopes/ 직접 readdir (allow-list — 오분류 구조적 불가) — DEC-2026-06-16.
	const scopesRoot = scopesRootPath(projectRoot);
	if (existsSync(scopesRoot)) {
		const out = [];
		for (const name of readdirSync(scopesRoot)) {
			try {
				if (
					statSync(join(scopesRoot, name)).isDirectory() &&
					SCOPE_SLUG_RE.test(name)
				) {
					out.push(name);
				}
			} catch {
				/* skip */
			}
		}
		return out;
	}
	// OLD 레이아웃 폴백: 최상위 deny-list (정밀화 — runtime/base/evidence/findings 등 제외).
	const aimdDir = join(projectRoot, '.ai-context');
	if (!existsSync(aimdDir)) return [];
	const scopes = [];
	for (const name of readdirSync(aimdDir)) {
		if (
			NON_SCOPE_DIRS.has(name) ||
			name.startsWith('.') ||
			name.endsWith('.json') ||
			name.endsWith('.md') ||
			name.endsWith('.tmp')
		)
			continue;
		const full = join(aimdDir, name);
		try {
			if (statSync(full).isDirectory() && SCOPE_SLUG_RE.test(name)) {
				scopes.push(name);
			}
		} catch {
			/* skip */
		}
	}
	return scopes;
}
