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

  // 라벨은 평이한 한국어로 (플러그인 내부용어는 풀어쓰고, 남길 고유명은 legend 참조)
  boxes: [
    // ── Z_FLOW : 6단계 (좌→우) ── analysis=회색(진입 전) / test=빨강 / implement=초록
    { id: 'analysis',  zone: 'Z_FLOW', label: 'analysis (분석)',   sub: '기존 코드에서 동작·규칙\n캐내기 / 입력 변환', color: 'pre' },
    { id: 'discovery', zone: 'Z_FLOW', label: 'discovery (발견)',  sub: '기능·의도 단위로\n찾아 정리 · 1단계' },
    { id: 'spec',      zone: 'Z_FLOW', label: 'spec (명세)',       sub: '행동 명세 + 합격 기준\n작성 · 2단계' },
    { id: 'plan',      zone: 'Z_FLOW', label: 'plan (계획)',       sub: '작업 분해·순서·설계\n결정·위험 · 3단계' },
    { id: 'test',      zone: 'Z_FLOW', label: 'test (테스트)',     sub: '합격 기준을 테스트로,\n먼저 다 실패 · 4단계', color: 'red' },
    { id: 'implement', zone: 'Z_FLOW', label: 'implement (구현)',  sub: '테스트 통과까지 실제\n코드 작성 · 5단계', color: 'green' },

    // ── Z_INPUT : 시작 시나리오 4종 (위→아래) ── S2 = 주 대상(강조)
    { id: 'in_s2', zone: 'Z_INPUT', label: 'S2 · AI 전환',          sub: '기존 코드 그대로 두고\n기능 확장 (주 대상)', emphasis: true },
    { id: 'in_s1', zone: 'Z_INPUT', label: 'S1 · 재작성',           sub: '기존 코드를 새 기술로\n다시 작성' },
    { id: 'in_s3', zone: 'Z_INPUT', label: 'S3 · 동작 기록',        sub: '지금 동작을 문서·\n스냅샷으로만 남김' },
    { id: 'in_gf', zone: 'Z_INPUT', label: '신규 빌드 (greenfield)', sub: '기획·디자인·계약만\n(기존 코드 없음)' },

    // ── Z_OUT : 산출물 4종 (위→아래) ── 추적표 = 강조
    { id: 'out_ctx',   zone: 'Z_OUT', label: '시스템 핵심 정보',      sub: '규칙·도메인·API·DB\n구조 파일' },
    { id: 'out_avoid', zone: 'Z_OUT', label: '조심할 점 모음',        sub: '피할 코드 패턴·\n전환 시 주의사항' },
    { id: 'out_chain', zone: 'Z_OUT', label: '단계별 명세+실제 코드',  sub: '발견~구현 명세 +\n테스트·구현 코드' },
    { id: 'out_trace', zone: 'Z_OUT', label: '추적표 (traceability)',  sub: '기능부터 구현까지\n앞뒤로 따라가기', emphasis: true },

    // ── Z_WHY : 핵심 사상 4 (좌→우 띠) ──
    { id: 'why_ctx',  zone: 'Z_WHY', label: '산출물은 "설명서"가 아니다', sub: 'AI 가 그대로 읽고\n쓰는 작업 자료' },
    { id: 'why_ax',   zone: 'Z_WHY', label: '정상 상태 = AI 운영(AX)',   sub: 'AI 가 개발·실행·수정·\n발전까지 맡음' },
    { id: 'why_ssot', zone: 'Z_WHY', label: '기준 원본은 json 한 벌',    sub: 'AI·도구가 바로 읽음\n(사람용 사본 안 만듦)' },
    { id: 'why_auto', zone: 'Z_WHY', label: '완전 자동화는 안 함',       sub: 'AI 자동 ~70~80% +\n사람이 단계마다 검토' },

    // ── Z_ASSET : 플러그인 구성 자산 4종 (좌→우 띠) ──
    { id: 'as_agent', zone: 'Z_ASSET', label: 'agents 6종',  sub: '단계마다 일 묶어주는\nAI 담당자' },
    { id: 'as_skill', zone: 'Z_ASSET', label: 'skills 57개', sub: '산출물 단위로\n추출·생성하는 작업' },
    { id: 'as_hook',  zone: 'Z_ASSET', label: 'hooks 4개',   sub: '불일치 감지·단계 안내·\n검문·영향 표시 자동' },
    { id: 'as_tool',  zone: 'Z_ASSET', label: 'tools 29개',  sub: '흐름 진행 + 검사기\n+ 추적 도구' },
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
    { from: 'out_trace', to: 'implement', style: 'dashed', color: '#6a1b9a' }, // 라벨은 out_trace 박스가 대신 설명(겹침 방지)

    // ── 자산이 흐름을 떠받침 (대표 점선 2개) ──
    { from: 'as_agent', to: 'analysis', label: 'AI 담당자가 단계 구동', style: 'dashed', color: '#475569' },
    { from: 'as_tool',  to: 'test',     label: '도구가 검문 자동 실행', style: 'dashed', color: '#475569' },

    // ── 되돌리기 loop = 이전 단계로 (빨강·굵게·깊은 U자로 또렷이) ──
    { from: 'implement', to: 'analysis', label: '↺ 되돌리기 = 이전 단계로 다시', style: 'dashed', color: '#dc2626', route: 'under', drop: 125, emphasis: true },
  ],

  // 인라인으로 못 푼 고유명/약어 풀이 (도식 하단 범례 박스)
  legend: [
    { term: '흐름 단계 영문', meaning: 'analysis(분석)는 선행, 이후 discovery·spec·plan·test·implement = 핵심 5단계' },
    { term: 'S1 / S2 / S3', meaning: '시작 시나리오 종류(S=Scenario): S1 재작성 · S2 AI전환 · S3 동작기록' },
    { term: 'AX (AI 운영)', meaning: 'AI 가 산출물을 컨텍스트로 프로젝트를 계속 굴리는 상태 = 이 방법론의 목표' },
    { term: '시스템 핵심 정보', meaning: '분석 산출 파일 — 비즈니스 규칙·도메인·API 명세·DB 구조' },
    { term: '추적표(traceability)', meaning: '기능→행동→합격기준→작업→테스트→구현을 앞뒤로 잇는 표' },
    { term: '테스트 먼저(RED→GREEN)', meaning: '구현 전 테스트를 다 실패시켜 두고 → 통과할 때까지 구현' },
    { term: '단일 진실 원본(SSOT)', meaning: '믿을 수 있는 단 하나의 기준 자료 (여기선 json)' },
    { term: '검문(gate)/되돌리기', meaning: '각 단계 끝의 사람 결정 지점, 되돌리기 = 이전 단계로 다시(revisit)' },
  ],

  // gate ◇ : 각 chain 단계(ch1~ch5) 위 번호 다이아 + go/stop 결정 박스
  gates: ['discovery', 'spec', 'plan', 'test', 'implement'],
  gateCaption: '◇ 각 단계 끝마다 AI 결과를 사람이 보고 통과/되돌리기 결정 (1~5단계)',
  gateGo:   '✓ 통과 → 다음 단계로',
  gateStop: '✗ 되돌리기 → 앞 단계 고쳐 다시',

  freeze: [], // 손편집으로 넘긴 요소 id (재생성에서 제외 + 기존 파일에서 보존)
};
