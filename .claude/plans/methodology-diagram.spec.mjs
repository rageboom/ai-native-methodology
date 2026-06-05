// methodology-diagram.spec.mjs
// AI-Native 방법론 "한눈에" 개요 도식의 선언적 정의.
// 이 파일만 편집하면 됨 — 좌표/화살표/배치는 gen-methodology-diagram.mjs 가 자동 계산.
// 빌드: node gen-methodology-diagram.mjs  →  methodology-diagram.excalidraw
//
// 편집 방법:
//   · 박스 추가  → boxes 에 한 줄:  { id:"x", zone:"Z_FLOW", label:"제목", sub:"부제" }
//   · 화살표 추가 → arrows 에 한 줄: { from:"x", to:"y", label:"라벨", style:"dashed" }
//   · zone 내부 박스는 zone.cols 열로 자동 줄바꿈(wrap). 좌표 충돌 없음.
//
// ── 점진적 빌드 단계 (전체 완성: STEP 0~7) ──
//   STEP 0~7 ✅  zone 5개 / 흐름 6박스 / 화살표·gate / 입력 / 산출물 / 사상 / 자산 / revisit

export default {
  title: 'AI-Native 개발 방법론 — 한눈에',

  // [배경, 테두리] — zone/box 가 color 이름으로 참조
  palette: {
    why:   ['#fff3cd', '#b45309'],  // 사상 (황)
    input: ['#fce4ec', '#ad1457'],  // 입력 (분홍)
    flow:  ['#dbeafe', '#1e40af'],  // 흐름 (파랑)
    pre:   ['#e5e7eb', '#374151'],  // chain 진입 전 (회색)
    red:   ['#fee2e2', '#b91c1c'],  // test RED (빨강)
    green: ['#d1fae5', '#047857'],  // implement GREEN (초록)
    out:   ['#f3e5f5', '#6a1b9a'],  // 산출물 (자주)
    asset: ['#f1f5f9', '#475569'],  // 자산 (회청)
    gate:  ['#fff3cd', '#b45309'],  // gate ◇ (황)
  },

  // page 격자: row/col = 위치, span = 가로 점유 column 수(띠), cols = 내부 박스 그리드 열 수
  zones: [
    { id: 'Z_WHY',   title: '왜 다른가 — 산출물이 곧 운영 컨텍스트',   row: 0, col: 0, color: 'why',   cols: 4, span: 3 },
    { id: 'Z_INPUT', title: '무엇으로 시작 — 입력 4종, 한 곳 수렴',    row: 1, col: 0, color: 'input', cols: 1 },
    { id: 'Z_FLOW',  title: '어떻게 흐르나 — 6단계, 각 끝에 사람 결단', row: 1, col: 1, color: 'flow',  cols: 6 },
    { id: 'Z_OUT',   title: '무엇이 남나 — 이식 가능한 컨텍스트',      row: 1, col: 2, color: 'out',   cols: 1 },
    { id: 'Z_ASSET', title: '플러그인이 떠받친다 — 결정론 검증으로',   row: 2, col: 0, color: 'asset', cols: 4, span: 3 },
  ],

  boxes: [
    // ── Z_FLOW : 6단계 (좌→우) ── analysis=회색(진입 전) / test=빨강 / implement=초록
    { id: 'analysis',  zone: 'Z_FLOW', label: 'analysis',  sub: '코드 고고학·입력 어댑터', color: 'pre' },
    { id: 'discovery', zone: 'Z_FLOW', label: 'discovery', sub: 'UC 발견 · ch1' },
    { id: 'spec',      zone: 'Z_FLOW', label: 'spec',      sub: '행위명세+AC · ch2' },
    { id: 'plan',      zone: 'Z_FLOW', label: 'plan',      sub: 'task·ADR·NFR · ch3' },
    { id: 'test',      zone: 'Z_FLOW', label: 'test',      sub: '실 test·RED · ch4', color: 'red' },
    { id: 'implement', zone: 'Z_FLOW', label: 'implement', sub: '실 impl·GREEN · ch5', color: 'green' },

    // ── Z_INPUT : 입력 4종 (위→아래) ── S2 = 주 타깃(강조)
    { id: 'in_s2', zone: 'Z_INPUT', label: 'S2 · AX 전환',  sub: 'legacy 코드+의도 (주 타깃)', emphasis: true },
    { id: 'in_s1', zone: 'Z_INPUT', label: 'S1 · 재생성',   sub: 'legacy → 신규 스택' },
    { id: 'in_s3', zone: 'Z_INPUT', label: 'S3 · 특성화',   sub: '문서·스냅샷만' },
    { id: 'in_gf', zone: 'Z_INPUT', label: 'greenfield',   sub: 'PRD·디자인·계약 (코드 X)' },

    // ── Z_OUT : 산출물 4종 (위→아래) ── traceability = 강조
    { id: 'out_ctx',   zone: 'Z_OUT', label: '시스템 컨텍스트',   sub: 'rules·domain·openapi·schema' },
    { id: 'out_avoid', zone: 'Z_OUT', label: '주의 자산',        sub: 'antipatterns·migration' },
    { id: 'out_chain', zone: 'Z_OUT', label: 'chain별 spec+실코드', sub: 'discovery~impl + test·impl 코드' },
    { id: 'out_trace', zone: 'Z_OUT', label: 'traceability-matrix', sub: 'UC→BHV→AC→TASK→TC→IMPL 양방향', emphasis: true },

    // ── Z_WHY : 핵심 사상 4 (좌→우 띠) ──
    { id: 'why_ctx',  zone: 'Z_WHY', label: '산출물 = "설명서"가 아니다', sub: 'LLM 이 그대로 쓰는 운영 컨텍스트' },
    { id: 'why_ax',   zone: 'Z_WHY', label: '정상상태 = AX 운영',        sub: 'LLM 이 develop·run·modify·evolve' },
    { id: 'why_eyes', zone: 'Z_WHY', label: '두 눈 렌더링',              sub: 'AI: .json·yaml + 사람: .mermaid·md' },
    { id: 'why_auto', zone: 'Z_WHY', label: '자동화 70~80% 선',         sub: 'AI ≥85% · 사람 gate ≤15% · 100% X' },

    // ── Z_ASSET : 플러그인 자산 4 (좌→우 띠) ──
    { id: 'as_agent', zone: 'Z_ASSET', label: 'agents 6',  sub: 'stage별 orchestrator' },
    { id: 'as_skill', zone: 'Z_ASSET', label: 'skills 60', sub: '사용자 호출 (stage·aspect별)' },
    { id: 'as_hook',  zone: 'Z_ASSET', label: 'hooks 4',   sub: 'drift·stage권고·gate차단·영향마킹' },
    { id: 'as_tool',  zone: 'Z_ASSET', label: 'tools 35',  sub: 'chain-driver + gate validator + 추적' },
  ],

  arrows: [
    // ── Z_FLOW : 6단계 forward (좌→우) ──
    { from: 'analysis', to: 'discovery' },
    { from: 'discovery', to: 'spec' },
    { from: 'spec', to: 'plan' },
    { from: 'plan', to: 'test' },
    { from: 'test', to: 'implement' },

    // ── 입력 4종 → analysis 로 수렴 ──
    { from: 'in_s2', to: 'analysis' },
    { from: 'in_s1', to: 'analysis' },
    { from: 'in_s3', to: 'analysis' },
    { from: 'in_gf', to: 'analysis' },

    // ── implement → 산출물 ── + traceability 가 전 단계 추적
    { from: 'implement', to: 'out_ctx' },
    { from: 'out_trace', to: 'implement', label: '전 단계 양방향 추적', style: 'dashed', color: '#6a1b9a' },

    // ── 자산이 흐름을 떠받침 (대표 점선 2개) ──
    { from: 'as_agent', to: 'analysis', label: 'agents 가 stage 구동', style: 'dashed', color: '#475569' },
    { from: 'as_tool',  to: 'test',     label: 'hooks·tools 가 gate 강제', style: 'dashed', color: '#475569' },

    // ── revisit loop (사람 결단 시 이전 stage로) ──
    { from: 'implement', to: 'analysis', label: 'revisit (사람 결단 시 되돌아감)', style: 'dashed', color: '#1e40af', route: 'under' },
  ],

  // gate ◇ 배지: 각 chain 단계(ch1~ch5) 끝의 사람 결단 지점
  gates: ['discovery', 'spec', 'plan', 'test', 'implement'],
  gateCaption: '◇ = 각 stage(ch1~ch5) 끝의 gate · AI 생성 → 사람이 go/stop 결단',

  freeze: [], // 손편집으로 넘긴 요소 id (재생성에서 제외 + 기존 파일에서 보존)
};
