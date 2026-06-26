// ai-context-layout.js — `.ai-context/` 경로 구성 SSOT (root→path).
//
// DEC-2026-06-16-ai-context-layout-restructure.
//   레이아웃 = 3-버킷 + 루트 싱글톤:
//     .ai-context/
//     ├── state.json · input.json · HANDOFF.md · baseline-*.json   (루트 싱글톤)
//     ├── base/      (was output/) — analysis 정본: shared/ · domains/BC-*/ · index json
//     ├── scopes/    (was 최상위 평면) — <scope>/{manifest, discovery|spec|plan|test|impl/}
//     └── runtime/   — 휘발/운영: config/ · findings · intervention-log · tool-runs/ · evidence/ · layer-2-results/ · baseline-evidence/
//
// 역할 분리: `project-root.js` = path→root *파싱* SSOT / 본 모듈 = root→path *구성* SSOT (역연산).
//
// 비파괴(read-alias) 불변식:
//   *Path(...)     = 쓰기용. 디스크 무관, 항상 NEW 경로(base/scopes/runtime) 반환.
//   *ForRead(...)  = 읽기용. NEW 존재 시 NEW, 없으면 OLD 폴백(output/ 또는 최상위 scope), 둘 다 없으면 NEW.
//   → 배포된 구 레이아웃(.ai-context/output/, 최상위 <scope>/) 무손상. 새 쓰기는 NEW 로만.
//
// 의존: node 빌트인만 (순환 import 회피 — state-store/도구가 본 모듈을 import).

import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const AIMD = '.ai-context';

// NEW 세그먼트 — 이 문자열들의 유일한 거처.
export const SEG = Object.freeze({
	base: 'base', // was 'output'
	scopes: 'scopes', // was '' (최상위 평면)
	runtime: 'runtime', // 신규 버킷
});

// OLD 세그먼트 — alias resolver + migrate-layout 만 참조.
export const OLD = Object.freeze({
	base: 'output', // .ai-context/output/
	// scopes old = 최상위 (.ai-context/<scope>) → 세그먼트 없음
	config: 'config', // .ai-context/config/ (최상위)
});

/**
 * Read-alias resolver. NEW 존재 시 NEW, 아니면 OLD 존재 시 OLD, 둘 다 없으면 NEW.
 * (없을 때 NEW 반환 → 이후 mkdir/write 가 NEW 레이아웃에 떨어짐.)
 */
export function resolveRead(newPath, oldPath) {
	if (existsSync(newPath)) return newPath;
	if (oldPath && existsSync(oldPath)) return oldPath;
	return newPath;
}

// ── 루트 / 싱글톤 (불변 — .ai-context/ 직속) ────────────────────────────
export function aimdDir(root) {
	return join(root, AIMD);
}
export function statePath(root) {
	return join(root, AIMD, 'state.json');
}
export function inputPath(root) {
	return join(root, AIMD, 'input.json');
}
export function handoffPath(root) {
	return join(root, AIMD, 'HANDOFF.md');
}

// ── base/ (analysis 정본: shared/ · domains/BC-*/ · index json) ─────────
export function baseDirPath(root) {
	return join(root, AIMD, SEG.base);
}
export function baseDirForRead(root) {
	return resolveRead(join(root, AIMD, SEG.base), join(root, AIMD, OLD.base));
}
export function baseFilePath(root, ...parts) {
	return join(root, AIMD, SEG.base, ...parts);
}
export function baseFileForRead(root, ...parts) {
	return resolveRead(
		join(root, AIMD, SEG.base, ...parts),
		join(root, AIMD, OLD.base, ...parts),
	);
}

// analysis 산출물(7대 deliverable) canonical 파일명 — analysisOutputPresent probe 의 검사 대상.
//   chain 산출물(discovery-spec 등)·input.json 은 제외: input.json=analysis "시작"(started≠done) 신호이고
//   greenfield 는 input.json 부재 / chain 산출물은 analysis 가 아닌 하위 stage.
export const ANALYSIS_ARTIFACT_FILENAMES = Object.freeze([
	'architecture.json',
	'domain.json',
	'business-rules.json',
	'openapi.yaml',
	'schema.json',
	'db-schema.json', // schema.json 의 poc-16/18 호환 별칭
	'antipatterns.json',
	'ui-spec.json',
]);

/**
 * 분석(analysis stage) 산출물 존재 결정론 probe — `.ai-context/base/`(read-alias: `output/`)에
 * ANALYSIS_ARTIFACT_FILENAMES 중 하나라도 있으면 true.
 *
 * 진입 라우터(UserPromptSubmit)가 "분석 미완 프로젝트는 discovery 전 analysis 먼저"를 안내하는
 * 근거 신호. state.json 의 `stage_progress.analysis`는 chain 커서(initScopeChainState 가
 * scope 진입 시 complete 로 flip)일 뿐 "산출물 생산됨" 신호가 아니므로 그것과 별개 축.
 *
 * 순수 — fs 존재 + 상수 파일명만(LLM inject ❌ / STRONG-STOP). no-throw / root-guard.
 * OR-any 인 이유: greenfield·FE-first 는 산출물 subset(예: ui-spec 만)만 생성하므로 특정 1종
 * (architecture 등) require 시 false-negative 과다. baseFileForRead 가 NEW(base/)→OLD(output/)
 * alias 를 처리. 알려진 한계: 구형 nested 레이아웃(output/architecture/architecture.json)은
 * flat lookup 이 놓쳐 false-negative → "analysis 먼저" 안내(과보호 / 비차단이라 무해).
 *
 * @param {string} root 프로젝트 루트
 * @returns {boolean}
 */
export function analysisOutputPresent(root) {
	if (!root || typeof root !== 'string') return false;
	return ANALYSIS_ARTIFACT_FILENAMES.some((f) =>
		existsSync(baseFileForRead(root, f)),
	);
}

// ── scopes/<scope>/[<stage>/] ───────────────────────────────────────────
export function scopesRootPath(root) {
	return join(root, AIMD, SEG.scopes);
}
export function scopeDirPath(root, scope, stage) {
	const tail = stage ? [scope, stage] : [scope];
	return join(root, AIMD, SEG.scopes, ...tail);
}
export function scopeDirForRead(root, scope, stage) {
	const tail = stage ? [scope, stage] : [scope];
	return resolveRead(
		join(root, AIMD, SEG.scopes, ...tail),
		join(root, AIMD, ...tail), // OLD = 최상위 .ai-context/<scope>[/<stage>]
	);
}
export function scopeFilePath(root, scope, stage, file) {
	const tail = stage ? [scope, stage, file] : [scope, file];
	return join(root, AIMD, SEG.scopes, ...tail);
}
export function scopeFileForRead(root, scope, stage, file) {
	const tail = stage ? [scope, stage, file] : [scope, file];
	return resolveRead(
		join(root, AIMD, SEG.scopes, ...tail),
		join(root, AIMD, ...tail),
	);
}

// ── runtime/ (휘발/운영) ────────────────────────────────────────────────
export function runtimeDirPath(root) {
	return join(root, AIMD, SEG.runtime);
}
export function runtimeFilePath(root, ...parts) {
	return join(root, AIMD, SEG.runtime, ...parts);
}
// 구 runtime 산출물은 output/ 밑에 있었으므로 OLD 폴백 = output/.
export function runtimeFileForRead(root, ...parts) {
	return resolveRead(
		join(root, AIMD, SEG.runtime, ...parts),
		join(root, AIMD, OLD.base, ...parts),
	);
}
export function configDirPath(root) {
	return join(root, AIMD, SEG.runtime, OLD.config);
}
// config 만은 구 위치가 최상위 .ai-context/config/.
export function configFileForRead(root, file) {
	return resolveRead(
		join(root, AIMD, SEG.runtime, OLD.config, file),
		join(root, AIMD, OLD.config, file),
	);
}
export function evidenceDirPath(root) {
	return join(root, AIMD, SEG.runtime, 'evidence');
}
export function evidenceDirForRead(root) {
	return resolveRead(
		join(root, AIMD, SEG.runtime, 'evidence'),
		join(root, AIMD, OLD.base, 'evidence'),
	);
}
export function toolRunsDirPath(root) {
	return join(root, AIMD, SEG.runtime, 'tool-runs');
}
export function findingsFilePath(root, stage) {
	return join(root, AIMD, SEG.runtime, `findings-${stage}.json`);
}
export function findingsFileForRead(root, stage) {
	return resolveRead(
		join(root, AIMD, SEG.runtime, `findings-${stage}.json`),
		join(root, AIMD, OLD.base, `findings-${stage}.json`),
	);
}

// ── intervention-log (NEW 기본값 + 구 경로 read-alias) ──────────────────
export const INTERVENTION_LOG_REL = `${AIMD}/${SEG.runtime}/intervention-log.jsonl`;
export const INTERVENTION_LOG_REL_OLD = `${AIMD}/${OLD.base}/intervention-log.jsonl`;
/**
 * 우선순위: state.json 에 설정된 경로(파일 존재 시) → NEW 기본값 → 구 기본값 → NEW.
 * @param {string} root 프로젝트 루트
 * @param {string} [stateConfigured] state.intervention_log_path (root-상대)
 */
export function interventionLogPathForRead(root, stateConfigured) {
	const candidates = [
		stateConfigured && join(root, stateConfigured),
		join(root, INTERVENTION_LOG_REL),
		join(root, INTERVENTION_LOG_REL_OLD),
	].filter(Boolean);
	return candidates.find(existsSync) ?? join(root, INTERVENTION_LOG_REL);
}

// ── gate-review-passage (Phase 1 / DEC-2026-06-25-gate-review-bypass-guard) ──
//   plan-review-server 가 discovery/spec/plan phase 검토 spawn 시 "presented" 마커를 쓰고,
//   chain-driver next 가 actor provenance(user vs llm_assumed) 도출에 read 한다.
//   advisory only (Phase 1 / deny ❌). LLM 이 직접 쓸 수 있는 파일 = speedbump (정직 한계).
//   위조 불가 신호는 plan-review-server(서버 프로세스 기록)가 spawn 됐을 때만 = "브라우저 검토가 실제로 떴다"의 증거.
export const GATE_REVIEW_PASSAGE_FILE = 'gate-review-passage.json';
export function gateReviewPassagePath(root) {
	return join(root, AIMD, SEG.runtime, GATE_REVIEW_PASSAGE_FILE);
}
export function gateReviewPassageForRead(root) {
	return runtimeFileForRead(root, GATE_REVIEW_PASSAGE_FILE);
}

// ── 디렉토리 보장 (3-버킷 골격) ─────────────────────────────────────────
//   호출부(state-store.ensureAimdDir)가 mkdirSync 를 주입 — 본 모듈은 경로만 제공.
export function bucketDirs(root) {
	return [
		join(root, AIMD),
		baseDirPath(root),
		scopesRootPath(root),
		runtimeDirPath(root),
	];
}
