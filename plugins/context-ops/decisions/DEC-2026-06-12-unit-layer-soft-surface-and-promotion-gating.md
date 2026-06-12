# DEC-2026-06-12-unit-layer-soft-surface-and-promotion-gating

- **일자**: 2026-06-12 (LEVER C 시행 = 본체 tool additive behavior / **버전 bump 보류** — release 시 사용자 결단 / MINOR 후보)
- **카테고리**: §8.1 ratchet 후속 — unit 층 **soft 표시 강화(NOW)** + **HARD flip 5조건 게이팅(GATED)**. LEVER A/B/C 분리 승급.
- **상태**: 승인 (사용자[TF Lead] "가장 추천 일감 하나 골라서 진행" + GAP-aware 결단 위임). plan workflow 7 agents(LEVER A/B/C 정밀분석 + GAP-4 실측 + Senior + 업계 4사) → **3-입력 전부 CONDITIONAL-GO 수렴**.
- **관계**: `DEC-2026-06-11-unit-layer-corroboration-poc18` §carry(line 48)가 예고한 **"하드게이트 flip = 별도 promotion DEC(미래)"** 의 그 DEC. 단 결론 = 전면 flip ❌ → NOW+GATED 분리.

## 맥락 (왜)

corroboration DEC 가 §8.1 precondition(≥2 distinct 도메인 = ep-be-gea + poc-18)을 **충족**시켰고 LEVER A/B/C flip 을 "별도 의도적 결단"으로 예고. 본 세션 = 그 결단. 위임받은 GAP-aware 판단을 위해 plan workflow 로 (1) LEVER A/B/C 코드 site 정밀분석 (2) GAP-4 현재값 실측 (3) Senior + 업계 4사 검토를 병렬 수행.

**3-입력 전부 CONDITIONAL-GO 수렴**:

- **GAP-4 실측**: 4종 전부 `changed_since_dec=false`(현재 사실과 정확히 일치 / 정정 불요). precondition_met=true 이나 GAP 이 보수적 flip 보류 사유로 여전히 유효.
- **Senior(CONDITIONAL-GO)**: 하드게이트가 강제할 `designed_from_spec`(RED→GREEN test-first) 코드경로가 두 corroboration PoC 모두 `characterized_from_code` 단일 provenance라 **실코드로 단 한 번도 안 돌았음**(matrix meta $comment line8 + charter R21 carry + unit-spec meta 3중 자기일치). 미실증 경로를 prod 차단으로 들이미는 것 = 품질1순위·재작업최소화2순위 위반. STOP 아닌 이유 = 스캐폴딩 완성 + 비-공허성(RED 1 high→GREEN 0) 입증 + soft=무회귀 → 조건 충족 후 flip.
- **업계 4사(CONDITIONAL-GO)**: Google(신규코드 델타 ratchet 조건 selective blocking) / Uber(critical 태그 + flake 안정성 precondition) / Stryker OSS(break=null 기본 advisory + incremental baseline) / Meta(privacy 도메인도 human-review advisory) = 전부 **"advisory-default, blocking은 조건부"** 수렴. 전면 flip = "체크박스화 + CI 마찰" 역효과.

## 결정

1. **[NOW / GO — 시행 완료] 안전 표시 강화 — LEVER C.** `findings-aggregator transformTraceabilityMatrix` 에 `unit_coverage` axis 배선:
   - reference-lens pass-through 5필드(`traceability_unit_obligation_ratio`/`unit_total`/`unit_tested`/`method_axis_corroboration`/`mutation_score`) — `mergeFindings` allowlist 밖 = `sources[].findings` 에만 = **gate 무진입**(`traceability_forward_coverage` 와 동형).
   - `obligation_satisfied_ratio < threshold` → **medium advisory**(forward_coverage gap 과 동형 / gate-eval medium=non-blocking / schema:236 "게이트 후보 / 현 soft").
   - `method_axis_corroboration`·`mutation_score` = **영구 reference-lens only**(DEC-2026-05-28 code-graph/mutation 게이트 주입 금지 불변 / `feedback_chain_driver_deterministic_axis`).
   - 전부 additive·non-blocking 무회귀. **criteria_total 42 불변**.
2. **[GATED / 보류] HARD flip** — LEVER B(plan-coverage `validator.js:482` medium→high) + LEVER A step[C](mock-soundness `validator_high` HARD_BLOCK 합류 / severity ceiling 복원 + ms.findings→result.findings merge)는 아래 **5조건 전부 충족 + 후속 promotion DEC** 발행 전 실행 금지.
3. **[GATED / churn 회피로 NOW 제외] LEVER A step[A]+[B]**(findings-aggregator `--unit-spec` 배선 + spec-test-link 단일 JSON 통합)도 GATED 로 이월. 이유: NOW 에 넣으면 mock-soundness severity `high→medium→high` 되돌림 churn(재작업2순위 위반) + spec-test-link 2-객체 stdout JSON.parse silent-regression 함정([A] 단독 = additive 아님). HARD flip 시 일괄 시행이 정합.

## 시행 (무엇 — NOW 만 / 전부 additive)

- `tools/findings-aggregator/src/aggregator.js` `transformTraceabilityMatrix` — `unit_coverage` 분기 + pass-through 5필드 + obligation gap→medium. 기존 4매핑(red/yellow/forwardGap/forward·threshold pass-through) 무수정.
- `tools/findings-aggregator/test/transform-traceability.test.js` — 신규 3 케이스(ratio≥threshold→medium 무증가+필드 채움 / ratio<threshold→medium+1·critical=high=0 / unit_coverage 부재→필드 null·medium 무회귀).

## STOP (검증 — no-simulation)

- 실 test: findings-aggregator **64/64 GREEN**(61→64 / +3 LEVER C). poc-18 medium 무회귀(obligation_satisfied_ratio=1 ≥ 0.85 → gap=0).
- **release-readiness 42/42** (criteria_total 42 불변 / 신규 check 추가 ❌ / README·version·CHANGELOG 무변경 = sync check intact).
- mergeFindings allowlist 실측(aggregator.js:212-247) — 신규 `traceability_unit_*` 미등재 = top-level 무진입 = gate 무영향 확인. gate-eval medium=non-blocking 확인(critical/high/coverage_pct/evidence_missing/llm 만 block).
- 모든 sub-agent narrative 를 액면 수용 않고 실코드 직접 재확인(diagnose-before-design / self-recorded-fact 검증).

## 정직 GAP (flip 판단 입력 / GAP-4 실측 — 전부 changed_since_dec=false)

1. **provenance 편중** — poc-18 2 UNIT 둘 다 `characterized_from_code`. `designed_from_spec`(RED→GREEN) 브랜치 schema 구조만 지원·실코드 미실증(matrix meta $comment line8). 하드게이트가 강제할 바로 그 경로 미실증.
2. **재현성 비대칭** — 2 도메인 중 ep-be-gea 외부·commit❌·재현0(narrative 의존 / 재실측 불가), poc-18 만 in-repo. s2 격상 선례(DEC-2026-06-01)는 양쪽 in-corpus 였음.
3. **breadth 얇음** — mock-soundness 실증 = 단일 협력자 UNIT-ENCRYPTION-001 1 finding(RED→GREEN 0).
4. **matrix forward 0.833→0.714**(=5/7 / yellow 2셀 = 미구현 USER 슬라이스 / 날조 IMPL 미생성 — 무회귀).

## flip 5조건 (decision_points DP3 / Senior + 업계 합성)

1. **[필수]** `designed_from_spec` provenance UNIT 의 greenfield/S1 PoC 에서 RED→GREEN 실코드 E2E 실증(하드게이트가 강제할 그 경로 / 후보 = `test-layering.md §81` greenfield 예제 numpy-financial 등).
2. **[필수]** in-repo 재현가능 2nd 도메인 확보 — flip 의 2nd corroboration 다리가 ep-be-gea(외부·재현0)에 걸쳐선 안 됨(①이 동시 충족 가능).
3. **[강력 권장]** `mutation_score` 1회 측정(PIT/Stryker) — characterization 핀이 버그를 박제(green-but-mask) 안 했는지(Fowler / DEC-2026-06-03-s2 §2.2).
4. **[breadth]** mock-soundness ≥2 협력자 + ≥1 waived 케이스로 확장(현 1 협력자 = 얇음 / GAP③).
5. **[절차]** 후속 promotion DEC 발행 + release-readiness count coupling — step[C] 의 trust-invariant 충돌(check34 동형 "advisory→high 누설 차단") 해소용 unit-mock reference-lens 신규 trust check → **criteria_total 42→43** + expected-ids + pass-count + `release-readiness.test.js:45,312,731` 3곳 동시 갱신 + `npm run test:release` 풀런(`feedback_release_readiness_count_coupling` — targeted 미검출). + REQUIRED_VALIDATORS_PER_STAGE 편입 + 8 SSOT doc(STATUS/INDEX/tdd-unit-thread/lifecycle-contract/test-layering.md:97/27-unit-spec.md/CHANGELOG/task-plan.schema:136) reword.

## carry

- HARD flip(LEVER B + LEVER A step[A][B][C]) = 위 5조건 충족 후 후속 promotion DEC.
- trust 불변식 보존: spec 파생 UNIT 만 게이트 후보 / code-graph method-axis·mutation = 영구 reference-lens(DEC-2026-05-28 / check34/36/37/39 무수정).
- 버전 bump + CHANGELOG = release 시(LEVER C 본체 tool additive behavior = MINOR 후보 / 미커밋).

DEC-2026-06-12-unit-layer-soft-surface-and-promotion-gating. Follows `DEC-2026-06-11-unit-layer-corroboration-poc18` §carry(line 48).
