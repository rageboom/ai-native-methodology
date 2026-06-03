# DEC-2026-06-03-dep-graph-trace-view

> ★ **v12.8.0 MINOR**. dep-graph(artifact-graph.json / 운영 SSOT)를 **사람 gate #1~#5 검토용**으로 view-time 렌더 — `chain-driver trace-view` 신설 (옵션 A+B). 사람-눈 추적성 맵 + UC→단계 coverage 매트릭스 stdout Markdown. committed mirror ❌ (v12.0.0 ADR-011 sanctioned view-time 경로 = carry `C-on-demand-viz` 사람-눈 절반 이행).
> 상태: **승인 + 시행 완료** (2026-06-03 / 사용자 결정 "옵션 A+B / 정직 개명" → "진행 (추천 기본값으로)").

## 배경 — 사용자 질문

사용자: "지금 dep-graph 를 설계도로 그린다면 어떠한가? … 이 dep-graph 는 운영관점에서 너무 너무 중요하다. 이를 설계도나 문서 같은 것들이 있고 이를 LLM 이나 사용자가 확인 가능하면 좋겠다."

dep-graph 는 운영 SSOT(P0 = AX 운영)인데 **사람**의 gate #1~#5 검토가 raw json 위에서 일어남 — v12.0.0 ADR-011 L54 가 정직하게 인정한 ergonomics 저하 carry(`C-on-demand-viz` / L29 DEFER)의 사람-눈 절반. **LLM** 도 navigate 쿼리 단위라 전체 조망은 없었다.

## 진단 (실측 기반)

- **LLM 절반 = YAGNI (실측)**: `navigate --stage spec --json` 을 RealWorld(116노드)에 실행 → 이미 stage 단위 holistic 구조 뷰(44노드 backward/forward + top-3 root) emit. → LLM 타깃 자산 신설 ❌ (over-engineering).
- **사람 gap = 실재**: navigate text 출력은 AC별 인접 리스트 평평한 덤프 — stats 요약·freshness·feature 그룹핑·coverage hole 부재.
- **sanctioned 경로 = view-time 렌더** (committed mirror 아님): v12.0.0 이 죽인 것은 committed `.md`/`.mermaid` twin(drift)이지 사람 뷰가 아니다. ADR-011 L29 가 "on-demand viz (view-time rendering)" 를 미래 경로로 명시. binary 경계 = **committed 산출물 생성 여부**.

## 결정

**`chain-driver trace-view --graph <path> [--scope <id>] [--no-matrix] [--json]` 신설.** stdout Markdown 4블록:

1. **freshness 배너** (stale 시 ⚠️ / `checkGraphFreshness` 재사용) — false-health 가드 (poc-05 선례 / 비협상).
2. **stats 요약** (`graph.stats` 그대로).
3. **map 뷰 (옵션 A)** — feature 별 UC→BHV→AC→TASK→TC→IMPL 하류 인접 + state 배지 + `⚠ hole` 인라인.
4. **coverage 매트릭스 (옵션 B)** — 행=UC / 열=BHV·AC·TASK·TC·IMPL / 셀=✓(도달)·✗(미도달·stage 존재)·`–`(stage 부재). DO-178C RTM 차용.

구현 = **순수 formatter** (`tools/chain-driver/src/trace-view.js`) — 기존 `analyzeImpact`/`topKImpactRoot`/`graph.stats`/`checkGraphFreshness` 재사용 / 새 그래프 순회 0 / 의존성 0.

### 사용자 결정 2종
- **형태 = 옵션 A+B** (텍스트/Markdown stdout + coverage 매트릭스). 시각 다이어그램(옵션 C)은 carry.
- **명명 = 정직 개명** `[traceability-map]` — '설계도/blueprint' ❌. 그래프 내용 = 요구사항→구현 추적성이지 시스템 아키텍처가 아님 (아키텍처 슬라이스 = analysis-architecture 노드뿐 / audience-expectation mismatch 회피).

## 5대 제약 정합

| 제약 | 정합 |
|---|---|
| json 단독 SSOT | ✓ read-only / SSOT 무변경 |
| on-demand only | ✓ **stdout only — 파일 write 0 / git commit 0** (committed mirror = v12.0.0 가 죽인 drift-repeat = REJECT) |
| no-engineification | ✓ stateless CLI formatter / 서버·auto-render·stateful 엔진 ❌ |
| reference-lens | ✓ display-only / 어떤 결정적 gate(gate-eval/findings-aggregator/release-readiness)에도 inject ❌ |
| minimal-additive | ✓ MINOR / breaking 0 |

**회귀 가드 check33 `trace_view_reference_lens_trust`** (release-readiness 32→33 / check31 with-spec 동형): gate-decision 모듈(gate-eval + findings-aggregator)에 trace-view 토큰 0 + trace-view.js 가 gate 모듈 import 0 (★ import 문 정밀 매칭 — trust 설명 주석의 "gate-eval/findings-aggregator" substring false-positive 회피 / 첫 실측에서 자가 발견·수정) + reference_lens:true 라벨.

## §8.1 corroboration (단일 PoC 과적합 회피)

- **map 뷰 (A)**: graph 형태 무관 → 4 도메인(RealWorld/ecommerce/poc-05/poc-16) 전부 실 render.
- **coverage 매트릭스 (B)**: 실측 chain leaf 분포 —
  - RealWorld: UC19 BHV19 AC25 TASK19 **TC25** IMPL0 → UC→TC ✓ / IMPL 열 `–`(부재).
  - ecommerce: UC22 BHV22 AC30 TASK22 **TC30** IMPL5 → 풀체인 IMPL ✓.
  - poc-16(음성대조): UC10 BHV10 AC10 / TASK·TC·IMPL `–`.
  - → **UC→TC 매트릭스 = RealWorld + ecommerce 2 distinct 실도메인 corroborate ✓**.
  - **IMPL 열 = ecommerce 1 실도메인뿐** → 정직 표기(`impl_note`) / v12.6.0 IMPL 1-도메인 옵션 2 선례 정합.
- **navel-gazing 가드 (Senior 적대 0.78)**: 가치 입증 = RealWorld + ecommerce 실 render (poc 자체 그래프 아님).

★ **Senior 사실 정정** (memory `feedback_senior_fact_check_supplement`): Senior 가 "RealWorld TC=0 → 매트릭스 ecommerce 1 도메인뿐 → §8.1 위험" 주장 → 직접 실측으로 RealWorld TC=25 확인(정정) → §8.1 footing 이 Senior 판단보다 탄탄.

## 4원칙 추적

1. plan = `.claude/plans/dep-graph-trace-view.md` (현재 상태 전수 조사 + 설계).
2. research = 3-agent (테크기업 선례[dependency-cruiser/Nx/Structurizr/Backstage/Bazel/DO-178C RTM] + 렌더링 기술 사실확인[Mermaid/D2/Graphviz/cytoscape/vis-network] + Senior 적대 0.78 CONCERN/conditional-GO).
3. 사용자 승인 = "옵션 A+B / 정직 개명" 결정 → "진행 (추천 기본값으로)".
4. (실패 없음 / 첫 실측에서 check33 자가-false-positive 발견·수정).

## 검증 (no-simulation / 실 CLI)

- 새 test 18 (`trace-view.test.js`): extractFeature / map 그룹핑 / coverage 매트릭스 셀(✓/✗/–) / hole 탐지(합성 fixture) / stale 배너(false-health 가드 / tmp 파일) / IMPL 정직표기 / --no-matrix / --json(reference_lens) / scope 필터 / graceful 오류 + real cli.js subprocess.
- chain-driver 320 → **338** pass.
- release-readiness 32 → **33** (check33 신설) + self-test 33/33 + check33 discrimination it.
- 실 dogfood render: RealWorld(IMPL `–`) + ecommerce(IMPL ✓) + poc-16(음성대조).
- version 3-way 12.8.0 (plugin.json + package.json + CHANGELOG + CLAUDE.md + README).
- 부수: `docs/dependency-graph.md` §4-1 stale `matrix.{json,md,mermaid}` v12.0.0 doc-drift 정정 + §3 도구맵 + §4-5 사용법 추가.

## 대안 (검토 후 거부 / carry)

- **옵션 C — 시각 다이어그램** (SVG/graphviz 또는 인터랙티브 HTML / vis-network): '설계도' 욕구에 가장 근접하나 new dependency(graphviz 미설치 실측 = 환경의존 / vis-network 번들) + 파일생성 drift 경계 근접 + 최대 비용. → 사람이 텍스트 뷰 "조망 부족" 실측 호소 후 trigger (carry). Senior anti-pattern "graphviz engine in v1".
- **LLM 타깃 blueprint 자산** — navigate --stage --json + --with-spec 중복 = YAGNI.
- **committed .svg/.md mirror** — v12.0.0 가 죽인 drift-repeat = REJECT.
- **auto-render-on-write / 서버** — no-engineification + resync per-write Senior REJECT 선례.

## carry

- 시각 다이어그램(옵션 C) — 사람 텍스트뷰 조망 부족 실측 trigger.
- `--stage` 필터 (현재 navigate 경유 / trace-view 는 --scope 만).
- Mermaid subgraph emit (LLM-native PR/docs 첨부용).

## 참고

- `.claude/plans/dep-graph-trace-view.md` (plan)
- `docs/dependency-graph.md` §4-5 (사용법) / ADR-011 (json-only / view-time 경로) / DEC-2026-06-01-json-only-ax-native (C-on-demand-viz carry)
- `tools/chain-driver/src/trace-view.js` + `test/trace-view.test.js` / `scripts/release-readiness.js` check33
- DEC-2026-06-03-living-graph-spec-body (check31 with-spec trust 선례 / 동형)
