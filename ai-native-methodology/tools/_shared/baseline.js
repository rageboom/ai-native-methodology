// ADR-010 (Baseline + Ratchet) 공용 모듈 — drift-validator + decision-table-validator + static-runner 3 도구가 import.
// 본 모듈은 Sprint 5+ Phase C 에서 drift-validator/src/baseline.js 로부터 이전됨 (결합도 ↓ / 도구 간 일관 적용).
//
// finding 객체 fingerprint 변환 + baseline 파일 read/write/diff + severity 별 ratchet 정책.
// finding 형식 호환:
//   - drift-validator: { kind, json, mermaid, severity, message, ... }
//   - decision-table-validator: { kind, severity, table_index, location, column_index, ... }
//   - static-runner: { kind, severity, file, line, ... } (Phase D — Semgrep + SARIF import finding 어댑터 거쳐서 / R19 Tier 1+2)

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/**
 * finding 객체에서 결정적 fingerprint 생성.
 * 입력 필드 (모두 optional): kind / json / mermaid / field / location / table_index / column_index / file / line.
 */
export function fingerprint(finding) {
	const key = JSON.stringify({
		kind: finding.kind,
		json: finding.json ?? null,
		mermaid: finding.mermaid ?? null,
		field: finding.field ?? null,
		location: finding.location ?? null,
		table_index: finding.table_index ?? null,
		column_index: finding.column_index ?? null,
		file: finding.file ?? null,
		line: finding.line ?? null,
	});
	return createHash('sha256').update(key).digest('hex').slice(0, 16);
}

/**
 * baseline 파일 read. 형식:
 *   { generated_at, source_commit_sha, findings: [{ fingerprint, kind, severity, ..., grandfathered }] }
 */
export function readBaseline(path) {
	if (!path || !existsSync(path))
		return { fingerprints: new Set(), meta: null };
	const text = readFileSync(path, 'utf-8');
	let data;
	try {
		data = JSON.parse(text);
	} catch (e) {
		throw new Error(`baseline parse error: ${e.message}`);
	}
	const fps = new Set();
	for (const f of data.findings ?? []) {
		if (f.fingerprint) fps.add(f.fingerprint);
	}
	return { fingerprints: fps, meta: data };
}

/**
 * findings 분류 — baseline 에 있으면 grandfathered, 아니면 novel.
 * finding 객체에 fingerprint 필드를 inplace 추가 (subsequent 호출 일관 보장).
 */
export function classifyAgainstBaseline(findings, baseline) {
	const grandfathered = [];
	const novel = [];
	for (const f of findings) {
		const fp = f.fingerprint ?? fingerprint(f);
		f.fingerprint = fp;
		if (baseline.fingerprints.has(fp)) {
			grandfathered.push(f);
		} else {
			novel.push(f);
		}
	}
	return { grandfathered, novel };
}

/**
 * 신규 baseline 작성 — 모든 findings 등재.
 */
export function writeBaseline(path, findings, sourceCommitSha = 'unknown') {
	const data = {
		generated_at: new Date().toISOString().split('T')[0],
		source_commit_sha: sourceCommitSha,
		findings_count: findings.length,
		findings: findings.map((f) => ({
			fingerprint: f.fingerprint ?? fingerprint(f),
			kind: f.kind,
			severity: f.severity,
			json: f.json ?? null,
			mermaid: f.mermaid ?? null,
			location: f.location ?? null,
			table_index: f.table_index ?? null,
			column_index: f.column_index ?? null,
			file: f.file ?? null,
			line: f.line ?? null,
			grandfathered: true,
		})),
	};
	writeFileSync(path, JSON.stringify(data, null, 2));
	return data;
}

/**
 * Severity 별 ratchet 강도 (ADR-010 §2.3).
 */
export const SEVERITY_RATCHET = {
	critical: { baseline_allowed: false, novel_blocks: true }, // baseline 등재 ❌
	breaking: { baseline_allowed: true, novel_blocks: true }, // novel 차단
	high: { baseline_allowed: true, novel_blocks: true },
	medium: { baseline_allowed: true, novel_blocks: true },
	low: { baseline_allowed: true, novel_blocks: false }, // novel 도 경고만
	'non-breaking': { baseline_allowed: true, novel_blocks: false },
	info: { baseline_allowed: true, novel_blocks: false },
	positive: { baseline_allowed: true, novel_blocks: false },
};

/**
 * ratchet mode 검증 — novel 결함이 차단 조건 충족하면 fail.
 */
export function ratchetCheck({ grandfathered, novel }) {
	const blocked = novel.filter((f) => {
		const policy = SEVERITY_RATCHET[f.severity];
		return policy?.novel_blocks ?? true;
	});
	return {
		grandfathered_count: grandfathered.length,
		novel_count: novel.length,
		blocked_count: blocked.length,
		pass: blocked.length === 0,
		blocked,
	};
}

// ─────────────────────────────────────────────────────────────────────
// v2.1.0 carry C-v2.1.0-5 — Coverage trend baseline (phase characterization ratchet 자동 검증)
// findings-based ratchet 와 다른 단일 metric (coverage_ratio) trend 정합성 검증.
// ─────────────────────────────────────────────────────────────────────

/**
 * coverage baseline 파일 read.
 * 형식: { generated_at, source_commit_sha, coverage_ratio, coverage_strategy, project_id }
 * 부재 시 null 반환 (legacy 진입 첫 측정 = baseline 없음 정합 / pass).
 */
export function readCoverageBaseline(path) {
	if (!path || !existsSync(path)) return null;
	const text = readFileSync(path, 'utf-8');
	try {
		return JSON.parse(text);
	} catch (e) {
		throw new Error(`coverage baseline parse error: ${e.message}`);
	}
}

/**
 * coverage baseline 작성.
 */
export function writeCoverageBaseline(
	path,
	{
		coverage_ratio,
		coverage_strategy,
		project_id,
		source_commit_sha = 'unknown',
	},
) {
	const data = {
		generated_at: new Date().toISOString().split('T')[0],
		source_commit_sha,
		project_id: project_id ?? null,
		coverage_strategy,
		coverage_ratio,
	};
	writeFileSync(path, JSON.stringify(data, null, 2));
	return data;
}

/**
 * ratchet trend check — current coverage ≥ baseline coverage 검증.
 *   baseline 없음 = 첫 측정 → pass + recommend write
 *   current < baseline = trend negative → fail (block)
 *   current >= baseline = trend positive (또는 equal / 단조 비감소) → pass
 *
 * @param {number} currentRatio — 현재 측정 coverage_ratio
 * @param {object|null} baseline — readCoverageBaseline 결과
 * @param {object} options — { tolerance: 0.01 } (소수점 fluctuation 흡수 / default ε=0.01)
 */
export function coverageTrendCheck(
	currentRatio,
	baseline,
	{ tolerance = 0.01 } = {},
) {
	if (baseline === null) {
		return {
			pass: true,
			reason: 'no_baseline_first_run',
			message: 'baseline 없음 — 첫 측정 (--write-coverage-baseline 권장)',
			current: currentRatio,
			baseline: null,
			delta: null,
		};
	}
	const baselineRatio =
		typeof baseline === 'number' ? baseline : (baseline.coverage_ratio ?? 0);
	const delta = currentRatio - baselineRatio;
	if (delta < -tolerance) {
		return {
			pass: false,
			reason: 'trend_negative',
			message: `coverage regressed: current ${(currentRatio * 100).toFixed(1)}% < baseline ${(baselineRatio * 100).toFixed(1)}% (delta -${(Math.abs(delta) * 100).toFixed(1)}%p / tolerance ${(tolerance * 100).toFixed(1)}%p)`,
			current: currentRatio,
			baseline: baselineRatio,
			delta,
		};
	}
	return {
		pass: true,
		reason:
			delta < 0
				? 'trend_within_tolerance'
				: delta === 0
					? 'trend_flat'
					: 'trend_positive',
		message: `coverage trend ✅ — current ${(currentRatio * 100).toFixed(1)}% vs baseline ${(baselineRatio * 100).toFixed(1)}% (delta ${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(1)}%p)`,
		current: currentRatio,
		baseline: baselineRatio,
		delta,
	};
}
