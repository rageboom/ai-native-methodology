# plan — dep-graph human trace-view (옵션 A+B) / view-time 렌더러

> 4원칙 1단계 산출. 사용자 결정: **옵션 A+B** (텍스트/Markdown stdout 뷰 + UC→TC coverage 매트릭스) + **정직 개명**(traceability-map / coverage-view / gate-review-lens — '설계도/blueprint' ❌). 옵션 C(시각 다이어그램)=carry.
> 상태: **plan 제시 → 사용자 go 대기** (3원칙 — 코드 착수 전 승인). 2026-06-03.

## 0. 한 줄 목적

dep-graph(artifact-graph.json / 운영 SSOT)를 **사람 gate 검토용**으로 view-time 렌더 — `navigate` 쿼리 단위가 아닌 **stage/scope 단위 조망 + UC→단계 coverage hole**을 stdout Markdown 으로. committed 산출물 0 / 의존성 0 / 새 그래프 순회 0.

## 1. 배경 — 진짜 gap (실측 근거)

- **LLM 절반 = YAGNI (실측 확인)**: `navigate --stage spec --json` 을 RealWorld(116노드)에 실행 → 이미 stage 단위 holistic 구조 뷰(44노드 backward/forward + top-3 root) emit. LLM 은 이미 served → **LLM 타깃 자산 신설 ❌**.
- **사람 gap = 실재**: 그 텍스트 출력은 AC별 인접 리스트 **평평한 덤프**. stats 요약·freshness·feature(scope)별 그룹핑·coverage hole 부재 → 사람 gate 검토 ergonomics 빈약. ADR-011 L54 가 정직하게 인정한 carry `C-on-demand-viz`(L29 DEFER)의 사람-눈 절반.
- **sanctioned 경로**: ADR-011 L29 — committed mirror(=v12.0.0 가 죽인 .md/.mermaid twin / drift) 아니라 **view-time 렌더**(graphviz DOT / md-render-on-read CLI)가 미래 경로로 명시됨. stdout 렌더 = 그 경로의 정확한 이행이지 mermaid-부활 아님 (binary 경계 = committed 산출물 생성 여부).

## 2. 산출물 (chain-driver 신규 서브커맨드)

```
node tools/chain-driver/src/cli.js trace-view --graph <path> [--scope <id>] [--stage <s>] [--no-matrix] [--json]
```

기본 stdout Markdown 출력 = 4 블록:

1. **freshness 배너** (최상단 / `checkGraphFreshness` 재사용) — stale 시 `⚠️ STALE — source 변경됨 / 재합성: resync-graph` prepend. **stale json 을 예쁘게 렌더하며 freshness 숨기면 false-health 재발**(poc-05 선례) → 비협상.
2. **stats 요약** (graph.stats 그대로 — 이미 합성됨) — `N nodes · E edges · by_state(active/drift/propose/deprecated) · by_kind · by_edge_type`.
3. **map 뷰 (옵션 A)** — scope_id 별 그룹핑, 각 그룹 내 UC→BHV→AC→TASK→TC→IMPL forward chain 인접 + state 배지. coverage hole(`⚠ UC-X → TC 없음`) 인라인.
4. **coverage 매트릭스 (옵션 B)** — 행=UC, 열=BHV/AC/TASK/TC/IMPL, 셀=✓/✗ (UC 의 forward reachable set 에 해당 subkind 노드 존재 여부). 그래프에 아예 없는 stage 열은 `– (해당 stage 미생성)`. `--no-matrix` 로 억제 가능(긴 그래프).

`--scope`/`--stage` = 기존 rollup 필터 재사용. `--json` = 구조화 출력(사람 텍스트 대신).

## 3. 구현 = thin formatter (새 순회 0)

| 데이터 | 재사용 함수 (cli.js 기존) |
|---|---|
| per-UC forward reachable (매트릭스 셀) | `analyzeImpact(graph, ucId, opts).forward` → subkind 버킷팅 |
| per-node backward/forward (map 인접) | `analyzeImpact` (cmdNavigateRollup 와 동일 호출) |
| top-3 impact root | `topKImpactRoot(graph, {k:3})` |
| stats | `graph.stats` (합성 시 precomputed) |
| freshness | `tools/_shared/graph-freshness.js#checkGraphFreshness` |
| 노드 title (선택) | `readSpecBody` 또는 node.title |

→ 신규 모듈 = `src/trace-view.js` (formatter only / graph 알고리즘 import 만 / write 0). cli.js 에 `case 'trace-view'` 추가.

## 4. 5대 제약 정합 + 공통 의무

| 제약 | 정합 |
|---|---|
| json 단독 SSOT | ✓ read-only / SSOT 무변경 |
| on-demand only | ✓ **stdout only — 파일 write 0 / git commit 0** (committed mirror = mermaid-부활 = REJECT) |
| no-engineification | ✓ stateless CLI formatter / 의존성 0 / 서버·auto-render·stateful 엔진 ❌ |
| reference-lens | ✓ display-only / 어떤 결정적 gate(gate-eval/findings-aggregator/release-readiness)에도 inject ❌ |
| minimal-additive | ✓ MINOR / breaking 0 |

- **reference-lens 가드** = release-readiness 신규 check (check31 미러) — trace-view 출력이 어떤 gate 에도 소비되지 않음을 구조 검증(trace-view.js 가 gate 모듈에 import 안 됨 + spec/gate 토큰 0).
- **정직 명명** = 출력 헤더 `[traceability-map]` (not blueprint) + 문서에 "요구사항→구현 추적성 / 시스템 아키텍처 ❌ (아키텍처 슬라이스 = analysis-architecture 노드 1개뿐)" 명시.

## 5. §8.1 corroboration (단일 PoC 과적합 회피)

- **map 뷰 (A)**: node-list/adjacency/state 는 graph 형태 무관 → 4 도메인(RealWorld/ecommerce/poc-05/poc-16) 전부 실 render.
- **coverage 매트릭스 (B)**: 실측 chain leaf 분포 —
  - RealWorld: UC19 BHV19 AC25 TASK19 **TC25** IMPL0
  - ecommerce: UC22 BHV22 AC30 TASK22 **TC30** IMPL5
  - → **UC→TC 매트릭스 = RealWorld + ecommerce 2 distinct 실도메인 corroborate ✓** (§8.1 충족).
  - **IMPL 열 = ecommerce 1 실도메인뿐** (RealWorld IMPL 미생성) → 정직 표기(`IMPL 열: 실 corroboration = ecommerce 1 도메인`). v12.6.0 IMPL 1-도메인 옵션 2 선례 정합.
- **navel-gazing 가드**: 가치 입증 = RealWorld + ecommerce **실 render + 사람 gate 검토 use** 시연 (poc 자체 그래프 아님).

## 6. 범위 경계 — gold-plating 회피 (전부 carry)

- ❌ 시각 다이어그램(SVG/graphviz/vis-network) — 옵션 C / 사람이 텍스트 뷰 "조망 부족" 실측 호소 후 trigger.
- ❌ committed .md/.svg/.html mirror — v12.0.0 가 죽인 drift-repeat.
- ❌ LLM 타깃 blueprint 자산 — navigate --json + --with-spec 가 이미 served (실측).
- ❌ auto-render-on-write / 상시 서버 / stateful 엔진 — no-engineification + resync per-write Senior REJECT 선례.
- ❌ RTM/렌더를 gate 자동결정 입력 — reference-lens 위반.
- ❌ Mermaid emit (LLM-native subgraph) — 별도 carry(필요 시).

## 7. 리스크 + Lessons-applied

- **R1 false-health** (stale json 렌더) → freshness 배너 비협상 (poc-05 선례).
- **R2 self-referential drift** (레포 지배 실패모드 / memory feedback_self_referential_corrective_drift) → 실 소비자(RealWorld+ecommerce) 가치 입증 / poc 자체 그래프 입증 ❌.
- **R3 Senior 권위 ≠ 사실** (memory feedback_senior_fact_check_supplement) → Senior "RealWorld TC=0" 주장을 직접 실측으로 정정(실제 TC25) = §8.1 footing 이 Senior 판단보다 탄탄함 확인.
- **R4 매트릭스 폭증** (138 UC×subkind 가로스크롤 / rendering-tech 경고) → `--scope`/`--stage` 필터 + `--no-matrix` 옵션.
- **R5 CRLF** (Windows glyph-heavy / memory feedback_edit_tool_crlf_windows) → node 스크립트 편집 + byte-preserving.

## 8. 검증 계획 (no-simulation / 실 CLI)

1. 새 unit/통합 test (trace-view formatter + freshness 배너 + 매트릭스 셀 정확도 + `--no-matrix`/`--scope`/`--stage` + `--json`).
2. 실 dogfood render — RealWorld + ecommerce 실 그래프에 `trace-view` 실행, 출력 eyeball (coverage hole 정확성 + stale 배너 음성대조).
3. release-readiness 신규 check (reference-lens 가드) + 기존 회귀(chain-driver test + workspace 전체 + release-readiness 전 check green).
4. version 3-way(plugin.json + package + CHANGELOG + CLAUDE.md) MINOR.
5. dep-graph 운영 문서(`docs/dependency-graph.md`) §4 에 trace-view 사용법 추가 + §3 도구맵 (★ 부수: §4-1 의 stale `matrix.{json,md,mermaid}` 문구 정정 = v12.0.0 잔여 doc-drift / 별도 확인).

## 9. 미해결 — 사용자 확인 포인트

- 서브커맨드/출력 이름: `trace-view` 제안 (honest naming). 다른 선호?
- coverage 매트릭스 기본 ON + `--no-matrix` opt-out vs 기본 OFF + `--matrix` opt-in?
- §5 IMPL 열 정직표기 방식(1-도메인 명시) 수용 여부.

## 10. 시행 완료 (2026-06-03 / v12.8.0)

- 사용자 결정: 옵션 A+B + 정직 개명 → "진행 (추천 기본값으로)".
- 산출: `tools/chain-driver/src/trace-view.js` (formatter) + cli.js 배선(import/parseArgs `--no-matrix`/cmdTraceView/dispatch/usage) + `test/trace-view.test.js`(18) + release-readiness check33 + self-test 33 + DEC-2026-06-03-dep-graph-trace-view + INDEX + CHANGELOG + CLAUDE/README + docs §3·§4-5.
- 검증: chain-driver 320→338 / release-readiness **33/33 release-ready** (전체 workspace 포함) / 2 실도메인 render(RealWorld IMPL `–` + ecommerce IMPL ✓) / 음성대조 poc-16 / git diff clean(CRLF 노이즈 0).

### Lessons Learned

- **LL-1 check 자가-false-positive**: check33 첫 실측 = trace-view.js 의 trust 설명 **주석**("gate-eval/findings-aggregator 에 inject ❌")을 import 로 오인(substring 매칭). → import 문 정밀 정규식(`^\s*import…from…`)으로 수정. 가드 작성 시 "설명 주석에 등장하는 금지 토큰" 함정 — 항상 구조(import 문) 매칭.
- **LL-2 CRLF diff 거짓경보**: `git -c core.autocrlf=false diff` 로 강제 점검 시 working tree CRLF(정상 autocrlf checkout)가 전 파일 변경처럼 보임 → 착시. **점검은 repo 실제 설정(autocrlf=true)으로** = 실제 변경만 노출. memory `feedback_edit_tool_crlf_windows` 와 별개 (이번엔 Edit 툴이 CRLF 보존 정상 / override 가 노이즈 생성).
- **LL-3 Senior 권위 ≠ 사실**: Senior "RealWorld TC=0" 주장 → 직접 실측 TC=25 정정 → 옵션 B §8.1 footing 이 Senior 판단보다 탄탄(2 실도메인). memory `feedback_senior_fact_check_supplement` 재확인.
- **LL-4 DEC 파일 = citation 선결**: CHANGELOG/CLAUDE/docs 에 DEC-id 인용 시 `decisions/DEC-*.md` 파일 선생성 의무 (check13 skill-citation-validator repo-wide dead-link 차단).
