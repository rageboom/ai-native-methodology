// migrate-layout.js — 구 `.ai-context/` 레이아웃 → 3-버킷(base/scopes/runtime) 인플레이스 이주.
// DEC-2026-06-16-ai-context-layout-restructure. `migrate`(state schema 버전)와 직교 — 파일시스템 전용.
//
// 멱등 + dry-run + 충돌거부. 루트 싱글톤(state.json·input.json·HANDOFF.md·baseline-*.json)은 이동 ❌.

import {
	existsSync,
	readdirSync,
	statSync,
	mkdirSync,
	renameSync,
	rmdirSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { AIMD, SEG, OLD } from '../../_shared/ai-context-layout.js';

const SCOPE_SLUG_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;

// 예약/비-scope 디렉토리 (최상위 scope 스캔에서 제외).
const RESERVED = new Set([SEG.base, SEG.scopes, SEG.runtime, OLD.base, OLD.config]);

// 루트 유지 파일 (이동 ❌).
function isRootKeepFile(name) {
	return (
		name === 'state.json' ||
		name === 'input.json' ||
		name === 'HANDOFF.md' ||
		/^baseline-.*\.json$/.test(name) // baseline 스냅샷 (커밋 대상)
	);
}

// runtime/ 으로 carve 할 운영/휘발 산출물 (output/ 하위 또는 최상위 공통 판정).
function isRuntimeArtifact(name) {
	return (
		name === 'evidence' ||
		name === 'tool-runs' ||
		name === 'layer-2-results' ||
		name === 'baseline-evidence' ||
		name === 'findings' ||
		name === 'intervention-log.jsonl' ||
		name === 'cascade-plan.json' ||
		name === 'cross-validation-report.json' ||
		/^findings.*\.(json|md)$/.test(name) ||
		/\.log$/.test(name)
	);
}

function safeIsDir(p) {
	try {
		return statSync(p).isDirectory();
	} catch {
		return false;
	}
}

/**
 * 이주 계획 산출 (디스크 무변경).
 * @returns {{moves: Array<{from,to,kind}>, collisions: Array, alreadyMigrated: boolean, noAimd: boolean}}
 */
export function planLayoutMigration(root) {
	const aimd = join(root, AIMD);
	const moves = [];
	if (!existsSync(aimd)) {
		return { moves, collisions: [], alreadyMigrated: false, noAimd: true };
	}
	const outDir = join(aimd, OLD.base);
	const hasOutput = existsSync(outDir);
	const hasBase = existsSync(join(aimd, SEG.base));

	// 1) output/ → base/ (carve runtime 먼저: 같은 항목이 base 로 끌려가지 않게 분기).
	if (hasOutput) {
		for (const name of readdirSync(outDir)) {
			const from = join(outDir, name);
			const bucket = isRuntimeArtifact(name) ? SEG.runtime : SEG.base;
			moves.push({ from, to: join(aimd, bucket, name), kind: bucket });
		}
	}

	// 2) 최상위 config/ → runtime/config/
	if (safeIsDir(join(aimd, OLD.config))) {
		moves.push({
			from: join(aimd, OLD.config),
			to: join(aimd, SEG.runtime, OLD.config),
			kind: 'runtime-config',
		});
	}

	// 3) 최상위 항목 스캔: runtime 산출물 → runtime/ , scope dir → scopes/<scope>/
	for (const name of readdirSync(aimd)) {
		if (RESERVED.has(name) || isRootKeepFile(name) || name.startsWith('.'))
			continue;
		if (name === OLD.config) continue; // 위에서 처리
		const full = join(aimd, name);
		if (isRuntimeArtifact(name)) {
			moves.push({ from: full, to: join(aimd, SEG.runtime, name), kind: 'runtime' });
			continue;
		}
		// scope 후보 = kebab-case 디렉토리.
		if (safeIsDir(full) && SCOPE_SLUG_RE.test(name)) {
			moves.push({ from: full, to: join(aimd, SEG.scopes, name), kind: 'scope' });
		}
		// 그 외(예: char-test-aggregate.xml 스크래치) = 미이동 (수동 청소 대상).
	}

	const collisions = moves.filter((m) => existsSync(m.to));
	const alreadyMigrated = hasBase && !hasOutput && moves.length === 0;
	return { moves, collisions, alreadyMigrated, noAimd: false };
}

/**
 * 이주 실행. dryRun=true 면 계획만 반환.
 * @returns {{applied:boolean, reason:string, moves:Array, collisions:Array}}
 */
export function applyLayoutMigration(root, { dryRun = false } = {}) {
	const plan = planLayoutMigration(root);
	if (plan.noAimd) return { ...plan, applied: false, reason: 'no .ai-context' };
	if (plan.alreadyMigrated)
		return { ...plan, applied: false, reason: 'already migrated' };
	if (plan.moves.length === 0)
		return { ...plan, applied: false, reason: 'nothing to migrate' };
	if (plan.collisions.length > 0)
		return { ...plan, applied: false, reason: 'collisions' };
	if (dryRun) return { ...plan, applied: false, reason: 'dry-run' };

	// 골격 보장.
	for (const d of [
		join(root, AIMD, SEG.base),
		join(root, AIMD, SEG.scopes),
		join(root, AIMD, SEG.runtime),
		join(root, AIMD, SEG.runtime, OLD.config),
	]) {
		mkdirSync(d, { recursive: true });
	}

	for (const m of plan.moves) {
		mkdirSync(dirname(m.to), { recursive: true });
		renameSync(m.from, m.to);
	}

	// 빈 구 디렉토리 정리 (output/ 등).
	for (const d of [join(root, AIMD, OLD.base), join(root, AIMD, OLD.config)]) {
		try {
			if (existsSync(d) && readdirSync(d).length === 0) rmdirSync(d);
		} catch {
			/* skip */
		}
	}

	return { ...plan, applied: true, reason: 'migrated' };
}
