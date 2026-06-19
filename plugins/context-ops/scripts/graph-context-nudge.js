#!/usr/bin/env node
// graph-context-nudge.js — Gap A 자동주입 (plan-living-graph-autowire §3): prompt-time 1-hop 그래프 컨텍스트 nudge.
//
// UserPromptSubmit hook(hooks.json) 이 `node ...graph-context-nudge.js` 로 호출. stdin event JSON 의 prompt 안
// 식별자(node id / title / code_pointer 심볼·파일)가 artifact-graph.json 노드에 결정론 매칭(matchPromptToNodes)되면,
// 그 노드들의 진짜 1-hop 이웃(≤8) + code_pointers 를 additionalContext 로 주입한다. NEVER blocks (exit 2 / deny ❌).
// 매칭 0(한글 산문 등 식별자 부재) = 침묵 no-op. routeEntry(같은 이벤트 sibling) 와 별개.
//
// 무거움 회피 (적대검증 major fix): navigate(analyzeImpact 전체 transitive closure + topKImpactRoot centrality) 재사용 ❌ —
//   순수 1-hop(incident edge 만 / transitive ❌ / centrality ❌) + 노드수 cap. 대형 그래프도 payload bound.
//   주입 = 포인터 지도(id·subkind·edge_type·코드앵커) / 본문·코드 덤프 ❌.
//
// Trust (DEC-2026-05-28 §4.2): 그래프 = reference-lens / SEARCH only / 결정적 chain gate inject ❌.
//   본 script 는 scripts/ (chain-driver gate 엔진과 분리) — additionalContext 만 / grep authoritative.
//
// Default ON (opt-out CONTEXT_OPS_GRAPH_NUDGE=0). codegraph-nudge.js 규약 동형:
//   always exit 0, stderr-only logs, stdout = hook JSON only, idempotent marker(once per session+prompt).

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { matchPromptToNodes } from '../tools/_shared/prompt-node-match.js';
import { baseFileForRead } from '../tools/_shared/ai-context-layout.js';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || resolve(SCRIPT_DIR, '..');
const MARKER_DIR = join(PLUGIN_ROOT, '.static-tools'); // gitignored marker dir (codegraph-nudge 와 공유 / prefix 분리)
const LENS = '(artifact-graph reference-lens · grep authoritative · gate-inject ❌)';
const NEIGHBOR_CAP = 8;

// ── pure helpers (exported for unit tests) ───────────────────────────────────

export function isOptedOut(envValue) {
	return ['0', 'false', 'no', 'off'].includes(String(envValue ?? '').trim().toLowerCase());
}

// 매칭 대상 노드 = deprecated 제외 (존재 컨텍스트 / active·drift·propose 포함).
export function selectMatchableNodes(graph) {
	return (graph?.nodes ?? []).filter((n) => n && n.state !== 'deprecated');
}

// origin id 들의 진짜 1-hop 이웃 (incident edge 만 / transitive·centrality ❌ = 무거움 회피).
//   반환: { origins:[node], neighbors:[{id,artifact_subkind,state,edge_type,dir}], truncated:int }
//   dir: 'out' = origin→neighbor(origin 이 edge.source) / 'in' = neighbor→origin(origin 이 edge.target).
export function oneHopNeighbors(graph, originIds, { cap = NEIGHBOR_CAP } = {}) {
	const nodeById = new Map((graph?.nodes ?? []).map((n) => [n.id, n]));
	const originSet = new Set(originIds);
	const origins = originIds.map((id) => nodeById.get(id)).filter(Boolean);
	const seen = new Map(); // neighborId → {id, artifact_subkind, state, edge_type, dir}
	for (const e of graph?.edges ?? []) {
		if (!e || typeof e.source !== 'string' || typeof e.target !== 'string') continue;
		let neighborId = null;
		let dir = null;
		if (originSet.has(e.source) && !originSet.has(e.target)) {
			neighborId = e.target;
			dir = 'out';
		} else if (originSet.has(e.target) && !originSet.has(e.source)) {
			neighborId = e.source;
			dir = 'in';
		} else {
			continue; // origin↔origin 또는 무관 edge
		}
		if (seen.has(neighborId)) continue;
		const n = nodeById.get(neighborId);
		seen.set(neighborId, {
			id: neighborId,
			artifact_subkind: n?.artifact_subkind ?? null,
			state: n?.state ?? null,
			edge_type: e.edge_type ?? null,
			dir,
		});
	}
	const all = [...seen.values()];
	return {
		origins,
		neighbors: all.slice(0, cap),
		truncated: Math.max(0, all.length - cap),
	};
}

// additionalContext 텍스트 (포인터 지도 / 본문·코드 덤프 ❌).
export function buildGraphContext({ origins, neighbors, truncated }) {
	const lines = [`💡 dep-graph 컨텍스트 ${LENS}`];
	for (const o of origins) {
		const flags = o.state && o.state !== 'active' ? ` [${o.state}]` : '';
		lines.push(`매칭 노드: ${o.id} (${o.artifact_subkind ?? '?'})${flags}`);
		for (const cp of (o.code_pointers ?? []).slice(0, 3)) {
			if (!cp?.path) continue;
			const loc = cp.path + (cp.line ? `:${cp.line}` : '');
			lines.push(`  코드앵커: ${loc}${cp.symbol ? ` (${cp.symbol})` : ''}`);
		}
	}
	if (neighbors.length) {
		lines.push(`1-hop 이웃 (≤${NEIGHBOR_CAP}):`);
		for (const nb of neighbors) {
			const arrow = nb.dir === 'out' ? '→' : '←';
			const flags = nb.state && nb.state !== 'active' ? ` [${nb.state}]` : '';
			lines.push(`  ${arrow} ${nb.edge_type ?? '?'}  ${nb.id} (${nb.artifact_subkind ?? '?'})${flags}`);
		}
		if (truncated > 0) lines.push(`  … (+${truncated} more)`);
	}
	lines.push('→ 변경 전 위 의존성 확인 / 상세는 chain-driver navigate. 실코드·grep 이 권위.');
	return lines.join('\n');
}

export function buildHookOutput(additionalContext) {
	return JSON.stringify({
		hookSpecificOutput: {
			hookEventName: 'UserPromptSubmit',
			additionalContext,
		},
	});
}

// ── I/O (only runs on direct invocation) ─────────────────────────────────────

function loadGraph(projectDir) {
	// loadArtifactGraphSafe(cli.js) 와 동일 resolver: base/(신규) → output/(구) 폴백.
	const p = baseFileForRead(projectDir, 'artifact-graph.json');
	if (!existsSync(p)) return null;
	try {
		return JSON.parse(readFileSync(p, 'utf-8'));
	} catch {
		return null;
	}
}

function markerPath(sessionId, prompt) {
	const h = createHash('sha1').update(`${sessionId}::${prompt}`).digest('hex').slice(0, 12);
	return join(MARKER_DIR, `.graphnudge-${h}`);
}

function main() {
	try {
		if (isOptedOut(process.env.CONTEXT_OPS_GRAPH_NUDGE)) return process.exit(0);

		let raw = '';
		try { raw = readFileSync(0, 'utf8'); } catch { return process.exit(0); }
		let evt;
		try { evt = JSON.parse(raw); } catch { return process.exit(0); }

		const prompt = evt.prompt;
		if (!prompt || typeof prompt !== 'string') return process.exit(0);

		const projectDir = evt.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
		const graph = loadGraph(projectDir);
		if (!graph) return process.exit(0); // 그래프 부재 = no-op (env-graceful)

		const matches = matchPromptToNodes(prompt, selectMatchableNodes(graph), {
			topN: 5,
			includeTitle: true,
		});
		if (matches.length === 0) return process.exit(0); // 식별자 0(한글 산문 등) = 침묵

		// once per (session, prompt) — 동일 prompt 재제출 시 재주입 방지.
		const marker = markerPath(evt.session_id || 'nosession', prompt);
		if (existsSync(marker)) return process.exit(0);

		const hood = oneHopNeighbors(graph, matches.map((m) => m.node_id));
		process.stdout.write(buildHookOutput(buildGraphContext(hood)));
		try { mkdirSync(MARKER_DIR, { recursive: true }); writeFileSync(marker, ''); } catch {}
	} catch {
		// never block a prompt — swallow and exit clean.
	}
	process.exit(0);
}

const isDirectInvocation = (() => {
	try { return import.meta.url === pathToFileURL(process.argv[1]).href; } catch { return false; }
})();
if (isDirectInvocation) main();
