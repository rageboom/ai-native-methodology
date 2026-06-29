#!/usr/bin/env node
// graph-context-nudge.js — Gap A 자동주입 (plan-living-graph-autowire §3): prompt-time 1-hop 그래프 컨텍스트 nudge.
//
// UserPromptSubmit hook(hooks.json) 이 `node ...graph-context-nudge.js` 로 호출. stdin event JSON 의 prompt 안
// 식별자(node id / title / code_pointer 심볼·파일)가 artifact-graph.json 노드에 결정론 매칭(matchPromptToNodes)되면,
// 그 노드들의 진짜 1-hop 이웃(≤8) + code_pointers 를 additionalContext 로 주입한다. NEVER blocks (exit 2 / deny ❌).
// 매칭 0(식별자 부재) = dep-graph 1-hop 주입 no-op (단 구조적 코드 질문이면 아래 nav-first 발동). routeEntry(같은 이벤트 sibling) 와 별개.
//
// codegraph navigation-first (DEC-2026-06-26 / 그래프-부재 확장 DEC-2026-06-29): artifact 매칭 0 또는 그래프 부재(둘 다 순수 코드 질문)이고 구조적 코드 질문이면,
//   codegraph MCP 도구(callers/callees/trace/impact/...)를 "탐색 첫 수"로 권유(비차단). 실측(transcript 0.17%)
//   상 탐색 자리서 codegraph 미사용 → grep authoritative·gate 비주입은 불변인 채 탐색 첫 수만 격상.
//   독립 opt-out CONTEXT_OPS_CODEGRAPH_NAV=0. policies/codegraph-navigation-first.md.
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

// ── codegraph navigation-first (DEC-2026-06-26 / policies/codegraph-navigation-first.md) ──────
// artifact-graph 매칭 0(순수 코드 질문)일 때, 구조적 코드 질문이면 codegraph MCP 도구를 "첫 수"로 권유.
// 두 축 분리: 탐색 첫 수 격상(신규) / gate 비주입·grep authoritative(불변 — DEC-2026-05-28 §4.2).
//   intent 키워드(ko+en) × code-signal(식별자꼴 토큰 또는 코드 명사) 동시 충족 시에만 매칭 = 오탐 억제.
//   비차단·additive 라 키워드 sanity 레이어로 충분(결정 비탑재 → Adzic SBE 키워드 함정 비해당).

// intent → 권할 codegraph MCP 도구 (구체적인 것 먼저 평가).
const NAV_INTENTS = [
	{ intent: 'callers', tool: 'codegraph_callers', re: /누가\s*(호출|쓰|사용)|어디(서|에서)\s*호출|호출(하는|처|되는)|사용처|쓰이는\s*곳|callers?|called\s+by|who\s+calls|usages?/i },
	{ intent: 'callees', tool: 'codegraph_callees', re: /무엇을\s*호출|뭘\s*호출|callees?|what\s+does\s+.*\bcall/i },
	{ intent: 'impact', tool: 'codegraph_impact', re: /영향(을|도|받|범위|이)|바꾸면|고치면|변경(하면|시)|수정하면|깨지|impact|what\s+breaks|affected|blast\s*radius/i },
	{ intent: 'trace', tool: 'codegraph_trace', re: /흐름|플로우|어떻게\s*(동작|작동|도달|이어|흘러)|추적|트레이스|호출\s*경로|trace|\bflow\b|call\s*path|how\s+does\s+.*(work|reach|flow)/i },
	{ intent: 'locate', tool: 'codegraph_search', re: /어디(에)?\s*(정의|있|선언|구현)|정의\s*(위치|어디|된|부)|구현\s*(어디|위치)|where\s+is\b|defined\s+(in|where)|선언(된|부)/i },
	{ intent: 'context', tool: 'codegraph_context', re: /어떻게\s*구현|어떤\s*구조|아키텍처|architecture|how\s+is\s+.*implemented|구현\s*방식/i },
];
// code-signal: 파일경로 / CamelCase·camelCase / snake_case / 함수호출꼴 / 코드 명사.
// 한글 명사는 \b 미사용(JS 비유니코드 \b 는 한글에 부착 안 됨) / 영어 명사만 \b 로 substring 오탐 차단.
const CODE_SIGNAL = /[A-Za-z_$][\w$]*\.(?:ts|tsx|js|jsx|java|py|go|rs|kt|rb|php|c|cs|swift|vue|scala)\b|[A-Za-z][a-z0-9]+[A-Z][A-Za-z0-9]*|[a-z][a-z0-9]+_[a-z0-9_]+|[A-Za-z_$][\w$]*\s*\(|함수|메서드|메소드|클래스|심볼|모듈|컴포넌트|엔드포인트|핸들러|미들웨어|변수명|필드명|\b(?:function|method|class|symbol|module|component|endpoint|handler|middleware|variable|field)\b/;

export function detectStructuralCodeQuestion(prompt) {
	if (!prompt || typeof prompt !== 'string') return null;
	if (!CODE_SIGNAL.test(prompt)) return null; // 코드 신호 부재 = 비코드 산문 = 침묵(오탐 억제)
	for (const it of NAV_INTENTS) {
		if (it.re.test(prompt)) return { intent: it.intent, tool: it.tool };
	}
	return null;
}

const NAV_GUIDE = {
	callers: '누가/어디서 호출 → `mcp__codegraph__codegraph_callers`',
	callees: '무엇을 호출 → `mcp__codegraph__codegraph_callees`',
	impact: '변경 영향 범위 → `mcp__codegraph__codegraph_impact`',
	trace: '흐름/호출 경로 추적 → `mcp__codegraph__codegraph_trace` (동적 디스패치 hop 포함)',
	locate: '심볼 정의/위치 → `mcp__codegraph__codegraph_search` · `codegraph_context`',
	context: '구조 이해 → `mcp__codegraph__codegraph_context`',
};
const CG_LENS = '(codegraph reference-lens · grep authoritative · gate-inject ❌)';

export function buildCodegraphNavContext({ intent } = {}) {
	const guide = NAV_GUIDE[intent] || NAV_GUIDE.context;
	return [
		`💡 구조적 코드 질문 — codegraph 먼저 ${CG_LENS}`,
		`→ ${guide}`,
		'호출그래프·흐름·영향은 codegraph 가 grep 보다 강함. 정확 검증·리터럴 매칭은 grep/Read 가 권위.',
	].join('\n');
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
		// 그래프 부재여도 nav-first(순수 코드 질문 권유)는 살아야 한다 — 그래프 부재 = 가장 전형적 순수 코드 질문.
		// dep-graph 1-hop 주입(아래 매칭>0 분기)만 그래프 필수. graph 부재 시 matches=[] 로 nav-first 분기에 자연 합류.
		const matches = graph
			? matchPromptToNodes(prompt, selectMatchableNodes(graph), { topN: 5, includeTitle: true })
			: [];
		if (matches.length === 0) {
			// 순수 코드 질문 후보(그래프 부재 OR 그래프 존재하나 artifact 매칭 0) → 구조적 코드 질문이면 codegraph 첫 수 권유 (비차단).
			// 독립 opt-out: CONTEXT_OPS_CODEGRAPH_NAV=0 (artifact-graph nudge 는 유지). 전체 off 는 CONTEXT_OPS_GRAPH_NUDGE=0.
			if (isOptedOut(process.env.CONTEXT_OPS_CODEGRAPH_NAV)) return process.exit(0);
			const detection = detectStructuralCodeQuestion(prompt);
			if (!detection) return process.exit(0); // 구조 코드질문 아님(또는 비코드 산문) = 기존대로 침묵
			const navMarker = markerPath(evt.session_id || 'nosession', `cgnav::${prompt}`);
			if (existsSync(navMarker)) return process.exit(0);
			process.stdout.write(buildHookOutput(buildCodegraphNavContext(detection)));
			try { mkdirSync(MARKER_DIR, { recursive: true }); writeFileSync(navMarker, ''); } catch {}
			return process.exit(0);
		}

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
