# DEC-2026-06-13 — resve 하위도메인 4종 풀체인 dogfood: §8.1 corroboration + body-candidate 4건 평가(본체 코드 수정 0)

- **일자**: 2026-06-13 (corroboration / **버전 bump 없음** — 본체 코드 무변경)
- **카테고리**: corroboration / §8.1 ratchet — chain harness 6 BC datapoint (event/golf + mtrm/healing/helium/hlum)
- **상태**: 승인 (사용자[TF Lead] "나머지 진행 안했던 체인 다 진행 해줘. 멈추지 말고 다하고 방법론 findings는 모아서 마지막에 해줘")
- **관련**: `DEC-2026-06-12-golf-chain-validator-wiring`(BC-1/3/5 본체 픽스) · `DEC-2026-06-12-resve-multidomain-corroboration` · `DEC-2026-06-12-sql-embedded-static-residual-reframe`(천장 reframe) · memory `feedback_self_recorded_fact_validation` · `feedback_diagnose_before_design_check_existing` · `feedback_quality_priority`

---

## 1. 배경

`resv-golf` 풀체인(chain 1~5) 완주 후, ep-be-gea 예약(resve) 메뉴그룹의 **나머지 4개 BC**(BC-RESV-MTRM/HEALING/HELIUM/HLUM)를 golf 과 동일 미러로 chain 1~5 까지 시행. analysis(chain0)는 기완료(`output/domains/BC-RESV-*/` + `shared/`). 목적 = (a) AX 운영 컨텍스트 모듈 단위 완성, (b) v0.42.x 본체 + golf BC-1/3/5 픽스의 **추가 BC 일반화(§8.1 과적합 회피)** 검증, (c) 방법론 본체 개선 후보 수집·평가.

## 2. 시행 (paradigm — author/gate 분리)

- **Phase A (Workflow 4 병렬 author / 충돌 없음 = 별도 per-scope dir + gradle 미실행)**: BC당 chain 1~4 + draft impl-spec + draft JUnit characterization 테스트 작성 + 개별 검증기 self-validate(schema / discovery-extraction / chain-coverage / plan-coverage / spec-test-link / traceability-matrix-builder / graph-integrity = 전부 explicit-path / state.json 무접촉).
- **Phase B (inline 순차)**: gradle 통합 1회 실행(`:ep-be-gea-core:test` 4 char 클래스) → 실 JUnit evidence backfill(impl-spec.test_pass_evidence + test-spec real-candidate TC.test_run_evidence / result_hash 실측) → matrix/graph 재생성(`--scope-id`) → test-cmd contract 배선 → findings-aggregator 게이트 4 BC × 5 stage(state.json scope 임시주입→복원).
- **산출**: 4 × (manifest + discovery + spec[behavior+acceptance] + plan + test + impl[impl-spec+matrix+graph] + 각 stage findings = 14 json) + 4 JUnit characterization 클래스(20 test method).

## 3. 결과 (전부 실측)

| BC | UC | BR | AC | TASK | ADR | TC | real GREEN | carry | gate 1~5 |
|---|---|---|---|---|---|---|---|---|---|
| MTRM | 7 | 20 | 20 | 13 | 3 | 20 | 7 | 13 | GO ✅ |
| HEALING | 6 | 19 | 20 | 12 | 3 | 20 | 5 | 15 | GO ✅ |
| HELIUM | 7 | 16 | 16 | 9 | 3 | 16 | 5 | 11 | GO ✅ |
| HLUM | 4 | 11 | 11 | 6 | 2 | 11 | 3 | 8 | GO ✅ |

- **20 real JUnit GREEN(fail 0)** = findings-aggregator `test-impl-pass-validator`가 test-cmd contract 로 **gate 레벨 실 gradle 실행**(20/20) — 침묵 skip·날조 아님(no-simulation R19). `static-runner` = evidence_missing(semgrep 미설치 / soft carry / critical·high 아님).
- 4 BC × 5 stage gate 전부 **critical/high=0 GO**. graph-integrity 4 BC 전부 orphan=0/cycle=0/unknown_edge=0. matrix forward·backward 100%.

## 4. 방법론 finding

### F1 — §8.1 corroboration (PRIMARY)
v0.42.x 본체 + golf BC-1/3/5 deterministic 픽스(discovery-extraction index-aware / findings-aggregator graph-integrity args / traceability-matrix-builder scope-id cross-BC 차단)가 **4개 추가 BC에서 새 본체 결함 0**으로 견딤. 누적 **6 BC datapoint**(event/golf/mtrm/healing/helium/hlum) = 골프 단일 PoC 과적합 아님이 강하게 입증.

### F2 — body-candidate 4건 평가 → **본체 코드 수정 0건 확정**
sub-agent narrative 가 보고한 본체 후보를 **액면 수용 금지 / 실측 검증**(memory `feedback_self_recorded_fact_validation` + `feedback_diagnose_before_design_check_existing`):

| 후보 | 실측 | 판정 |
|---|---|---|
| #1 golf behavior-spec derivation_source "stale"(스키마 위반) | schema-validator = **valid**. golf 은 `{discovery_spec_path, analysis_artifacts[]}`로 현 스키마 정합. agent 가 behavior-spec ↔ acceptance-criteria(`{behavior_spec_path, discovery_spec_path}`) derivation_source 를 **혼동한 hallucination** | ❌ REJECT (액면 수용 시 멀쩡한 SSOT 템플릿 훼손할 뻔) |
| #2 impl-spec result_hash PENDING placeholder 거부 | 패턴 `^sha256:[a-f0-9]{64}$` 는 사실이나, canonical flow 는 impl-spec 을 **실행 후** 작성 → 내 병렬-author 워크플로우의 transient artifact일 뿐 본체 갭 아님 | ❌ 비-본체 (핸드오프 doc 문구만 수정) |
| #3 manifest dead-pointer(미존재 파일 참조) | 4 manifest artifact 경로 **전부 실재**(15/15·15/15·15/15·11/11). agent 가 자기 올바른 처리(실재 파일만 기재)를 후보로 오기재 | ❌ REJECT |
| #4 HLUM read-only SQL-embedded carry sub-flavor | 정당한 reframe 데이터포인트 | ✅ reframe 보강 (코드 변경 ❌) |

**#4 reframe 보강** (`DEC-2026-06-12-sql-embedded-static-residual-reframe` 확장): operability 천장은 ≥2 flavor — (a) **god-method 깊이**(다중 협력자 mock·private 분기 / golf·mtrm·healing·helium), (b) **read-only SQL-embedded 조회**(영속 변경 0 / 본질 BR 이 MyBatis WHERE·CASE 에 매장 / hlum). 둘 다 결정론 환원 불가 = 사람 gate + characterization 의 존재 이유. hlum carry 8/11(73%) ≈ golf 19/25(76%)이나 사유가 god-method 깊이가 **아니라** read-only SQL-embedded.

### F3 — operability 천장 일관
real-tested AC ratio(mtrm 2/20·healing 3/20·helium 3/16·hlum 3/11) = god-method + SQL-embedded 천장 4 BC 재확인. **20 real method**(golf 8 대비) = cross-BC 실행 신호 강화. 얕은 가드(순수 술어 ReservationRepeatValidator / 단일 협력자 isChargeEmployee / command.validate() 필수값)만 unit 특성화 가능, 깊은 god-method·SQL·외부연동(전자결재·MS Graph·분산락)은 carry.

## 5. 본체 무변경 근거 (quality 1순위)
검증된 본체 결함 0 → **날조 fix 금지**. 가장 "고가치" 후보(#1)가 hallucination 이었고 self-recorded-fact-validation 으로 차단된 것이 본 run 의 핵심 process 신호. 본체 격상은 진짜 갭이 있을 때만(diagnose-before-design). 따라서 버전 bump·CHANGELOG·schema 변경 모두 없음 — DEC + STATUS 기록만.

## 6. STOP (검증 물증)
- 4 manifest schema valid(stage=implement) + 28 chain json(7×4) schema-valid.
- 20/20 JUnit GREEN(fail 0) 실 gradle / result_hash 4건 실측(mtrm 091e96ac…/healing e5ba0bb7…/helium 1b99229b…/hlum 747ecd0e…).
- 4 BC × 5 stage findings-aggregator gate 전부 critical/high=0 GO (test-impl-pass 실행 20/20).
- graph-integrity 4 BC orphan 0 / matrix forward·backward 100%.

## 7. carry / 다음
- ① 핸드오프 doc(private) §impl 문구: result_hash placeholder = `sha256:0{64}` all-zero sentinel + meta.warnings 'placeholder' 명시(구 `PENDING-PHASE-B` 리터럴은 스키마 위반)로 정정.
- ② ep-be-gea 예약 외 메뉴그룹(biztrip/welfare 등) 미분석 — 사용자 결단.
- ③ 양 remote push(ep-be-gea→GHE / methodology→rageboom+GHE) = 사용자 결단(GHE VPN 의존).

> **보안**: 사내 source PoC = 외부 격리(공개 rageboom commit ❌ / ep-be-gea GHE only). 본 DEC = 마스킹 codename(mtrm/healing/helium/hlum)만 / 사내 패키지 경로·실 메서드명·file:line 전사 금지.
