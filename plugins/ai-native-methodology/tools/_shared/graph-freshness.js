// graph-freshness.js — Loop A / A1 (docs/dependency-graph.md §3 Loop A) shared 프리미티브.
//   artifact-graph.json 의 synthesized_at 과 derived_from source mtime 비교 → stale 판정.
//   결정론 (fs mtime / git·child_process 무관 = SessionStart hot-path 경량). pure read — write·verdict 없음.
//
// 소비처 (DRY 단일 출처):
//   - code-pointer-validator (CLI A1 / release-readiness #16 / validator.js 가 re-export)
//   - chain-driver buildGraphSessionContext (SessionStart 배너 stale 노출 / B-minimal)
//
// DEC-2026-06-01-living-dep-graph-loops A1 / DEC-2026-06-03 C-living-graph-autotrigger.
//   display-only (non-gating) — stale 는 사람이 `traceability-matrix-builder --graph` 로 재합성 (자동 재합성 ❌).
//   ※ mtime 기반 (clone 직후 over-report 가능) → content-hash 정밀화는 별도 carry.

import { statSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

// A1 freshness — graph.synthesized_at vs derived_from source mtime. source 가 더 최신이면 stale.
//   (graph 파일 부재=absent 는 호출부가 파일 IO 단계에서 판단 / 본 함수는 로드된 graph 대상)
export function checkGraphFreshness(graph, { repoRoot = process.cwd() } = {}) {
	const synthAt = graph?.synthesized_at
		? Date.parse(graph.synthesized_at)
		: NaN;
	const sources = Array.isArray(graph?.derived_from) ? graph.derived_from : [];
	const staleSources = [];
	let newest = 0;
	for (const src of sources) {
		const full = isAbsolute(src) ? src : join(repoRoot, src);
		let mt;
		try {
			mt = statSync(full).mtimeMs;
		} catch {
			continue;
		} // source 부재 = skip
		if (mt > newest) newest = mt;
		if (!Number.isNaN(synthAt) && mt > synthAt) staleSources.push(src);
	}
	const stale = staleSources.length > 0;
	return {
		stale,
		synthesized_at: graph?.synthesized_at ?? null,
		newest_source_mtime: newest || null,
		stale_sources: staleSources,
		finding: stale
			? {
					kind: 'graph.stale',
					severity: 'medium',
					message: `artifact-graph stale — ${staleSources.length} 개 source 가 synthesized_at(${graph.synthesized_at ?? '?'}) 이후 변경: ${staleSources.slice(0, 5).join(', ')}${staleSources.length > 5 ? ' …' : ''}`,
					stale_sources: staleSources,
				}
			: null,
	};
}
