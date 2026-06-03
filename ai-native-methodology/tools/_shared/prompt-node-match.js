// prompt-node-match.js — ★ 결정론 prompt → 그래프 노드 매칭 (substring / 임베딩 ❌ = carry).
//   dep-graph 의도③ (a) NL 라우팅 (navigate --prompt) + context-federator (codegraph federation) 공용 코어.
//
//   ★ 결정론 only (feedback_chain_driver_deterministic_axis / STRONG-STOP):
//     prompt 안에 등장하는 식별자(node id / title / code_pointer 심볼·파일 stem)를 substring 매칭해 후보 랭킹.
//     의미·동의어·임베딩(예: "로그인"↔"signin") 매칭 ❌ = propose-only carry. 한글 산문+식별자 0 = 빈 결과(정직).
//
//   ★ 후보(candidates) = 호출부가 선별해 주입 (pure / 필터 책임 호출부):
//     - context-federator: selectOriginNodes(graph) = TIER1 + active/drift + code_pointers≥1 (codegraph join 대상) / includeTitle=false.
//     - chain-driver navigate: traversable(active/drift) 전체 (id/title 로 아무 노드나 해소) / includeTitle=true.
//
//   ★ includeTitle: title(사람 라벨) 매칭 포함 여부. navigate 의 chain 노드(code_pointers_na)는 title 없으면
//     "회원가입" 같은 자연어가 빈결과 → navigate=true 필수. federator=false 로 기존 거동 byte-identical 보존.
//
//   DEC-2026-06-03-living-graph-nl-routing. graph-freshness.js _shared 추출 선례 동형.

import { basename, extname } from 'node:path';

// 점수 가중 (확정): id-full 5 / id-part 1 / title 2 / symbol 3 / file 2.
//   ★ title=2 (symbol=3 보다 낮음 / Senior should_consider — 흔한 2글자 한글 title 우연 substring noise 완화).
const W_ID_FULL = 5;
const W_ID_PART = 1;
const W_TITLE = 2;
const W_SYMBOL = 3;
const W_FILE = 2;

// prompt → 노드 매칭. 반환: [{ node_id, score, matched:[reasons] }] (score desc, 동점 node_id asc / 결정론).
//   candidates = 노드 배열 (호출부 선별). topN = 상위 N. includeTitle = title 매칭 포함.
export function matchPromptToNodes(prompt, candidates, { topN = 5, includeTitle = false } = {}) {
  const p = String(prompt ?? '').toLowerCase();
  if (!p.trim()) return [];
  const scored = [];
  for (const node of (Array.isArray(candidates) ? candidates : [])) {
    if (!node || typeof node.id !== 'string') continue;
    let score = 0;
    const matched = [];
    const idLc = node.id.toLowerCase();
    if (p.includes(idLc)) {
      score += W_ID_FULL; matched.push(`id:${node.id}`);
    } else {
      for (const part of idLc.split(/[-_./]/).filter((x) => x.length >= 3)) {
        if (p.includes(part)) { score += W_ID_PART; matched.push(`id-part:${part}`); }
      }
    }
    if (includeTitle && typeof node.title === 'string') {
      const t = node.title.toLowerCase();
      if (t.length >= 2 && p.includes(t)) { score += W_TITLE; matched.push(`title:${node.title}`); }
    }
    for (const cp of (node.code_pointers ?? [])) {
      if (cp?.symbol) {
        const s = cp.symbol.toLowerCase();
        if (s.length >= 3 && p.includes(s)) { score += W_SYMBOL; matched.push(`symbol:${cp.symbol}`); }
      }
      if (cp?.path) {
        const base = basename(cp.path).toLowerCase();
        const stem = basename(cp.path, extname(cp.path)).toLowerCase();
        if (base.length >= 3 && p.includes(base)) { score += W_FILE; matched.push(`file:${base}`); }
        else if (stem.length >= 3 && p.includes(stem)) { score += W_FILE; matched.push(`file:${stem}`); }
      }
    }
    if (score > 0) scored.push({ node_id: node.id, score, matched });
  }
  scored.sort((a, b) => b.score - a.score || a.node_id.localeCompare(b.node_id));
  return scored.slice(0, topN);
}

// 자동 탐색 판정 (navigate top-1) — strong(top.score >= STRONG) AND unique-top(동점 아님).
//   tie 또는 약매칭(약신호 단독)은 오답 권위화 차단 → 호출부가 list-only 로 degrade (Senior must-fix).
export const STRONG_MATCH_THRESHOLD = 3;
export function isConfidentTop(matches) {
  if (!Array.isArray(matches) || matches.length === 0) return false;
  const top = matches[0];
  if (top.score < STRONG_MATCH_THRESHOLD) return false;
  if (matches.length > 1 && matches[1].score === top.score) return false; // tie
  return true;
}
