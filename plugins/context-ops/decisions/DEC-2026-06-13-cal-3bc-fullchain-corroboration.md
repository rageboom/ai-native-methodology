# DEC-2026-06-13 — cal(정산) 메뉴그룹 3 BC analysis+풀체인 dogfood: §8.1 corroboration + body-candidate 7건 평가(본체 코드 수정 0)

- **일자**: 2026-06-13 (corroboration / **버전 bump 없음** — 본체 코드 무변경)
- **카테고리**: corroboration / §8.1 ratchet — chain harness **analysis(chain0)+chains1~5 fresh** 3 BC datapoint (cal-salary/corpt/taxi)
- **상태**: 승인 (사용자[TF Lead] "cal 새 워크트리로 잡아서 풀체인 진행해줘 그리고 방법론 파인딩은 가장 마지막에 넣어줘")
- **관련**: `DEC-2026-06-13-resve-4bc-fullchain-corroboration`(직전 / chains1~5 only) · `DEC-2026-06-12-resve-multidomain-corroboration`(append-catalog F-1) · `DEC-2026-06-06-analysis-exit-gate` · memory `feedback_self_recorded_fact_validation` · `feedback_diagnose_before_design_check_existing` · `feedback_strict_exposes_drift` · `feedback_quality_priority`

---

## 1. 배경

ep-be-gea 예약(resve) 메뉴그룹 완주 후, **미분석 잔여 그룹 중 cal(총무정산)** 을 새 워크트리(`ep-be-gea-cal` / `feat/cal-domains-analysis` / base=context-ops-test)에서 시행. **resve 와 결정적 차이 = analysis(chain0)가 미존재** → resve 는 chain1 부터였으나 cal 은 **코드-고고학 analysis(7대 산출물 일부 + shared 카탈로그 append) 부터 fresh** 시행 후 chains 1~5. 목적 = (a) AX 운영 컨텍스트 모듈 완성, (b) **analysis-stage 포함 풀파이프라인의 추가 BC 일반화(§8.1)** 검증, (c) 방법론 본체 개선 후보 수집·평가.

BC 분할 = 소스 패키지(정산 메뉴그룹 하위 3 서브도메인) + 캠페인 선례(sub-menu=BC) → 3 BC. taxi 는 own BC(고유 FIP 연동 API 경로 + 유비쿼터스 언어)이나 **corpt 정산 테이블 직접 write + biztrip/wlfr read = cross-cutting 결합**을 caution/AP 로 명시(폴딩 ❌).

## 2. 시행 (paradigm — author/merge/gate 분리)

- **Phase 0a (Workflow 3 병렬 analysis author)**: BC당 analysis leaf(business-rules.json + openapi.yaml + sql-inventory.json) + shared 카탈로그 fragment(bounded_context+use_cases / bc_files index / caution_group / antipatterns / ubiquitous_language) 작성 + self-validate. 소스 직접 정독 → 실 file:line evidence.
- **Phase 0b (inline 순차 머지)**: fragment 를 `append-catalog.js`(appendBoundedContext / appendBcFileToIndex / appendCautionGroup + antipatterns upsert) 로 shared 에 결정론 머지(sibling 보존 / total_rules 재계산). schema-validate → analysis exit-gate#0 per BC.
- **Phase A (Workflow 3 병렬 chain author)**: chains 1~4 + draft impl-spec + draft JUnit characterization 테스트 + self-validate(schema/discovery-extraction/chain-coverage/plan-coverage/spec-test-link/traceability/graph-integrity). manifest 는 메인이 사전생성(read-only).
- **Phase B (inline 순차)**: gradle 통합 1회 실행(3 char 클래스 / BUILD SUCCESSFUL) → 실 JUnit evidence backfill(impl-spec.test_pass_evidence 10필드 + test-spec real-candidate TC.test_run_evidence / result_hash 실측) → matrix/graph 재생성(--scope-id) → test-cmd contract 배선 → findings-aggregator 3 BC × 5 stage gate(state.json scope 임시주입).

## 3. 결과 (전부 실측)

| BC | UC | BR | AC | TASK | ADR | TC | real GREEN(method) | carry | gate 1~5 |
|---|---|---|---|---|---|---|---|---|---|
| SALARY | 7 | 16 | 16 | 9 | 3 | 16 | 4 | 12 | GO ✅ |
| CORPT | 6 | 15 | 15 | 7 | 3 | 15 | 5 | 10 | GO ✅ |
| TAXI | 5 | 19 | 19 | 8 | 3 | 19 | 4 | 15 | GO ✅ |

- **13 real JUnit GREEN(fail 0)** = test-impl-pass-validator gate 레벨 실 gradle(13/13 / no-simulation R19). static-runner=evidence_missing(semgrep 미설치 soft).
- 3 BC × 5 stage gate 전부 critical/high/medium=0 GO. graph-integrity orphan=0/cycle=0. matrix forward·backward 100%. analysis exit-gate#0 GO×3.
- shared 카탈로그: BR index 126→**176**(+50 BR) / antipatterns +14 / caution_group +3 / ubiquitous_language +25 = 전부 append(sibling 보존).

## 4. 방법론 finding

### F1 — §8.1 corroboration (PRIMARY / analysis-stage 포함 fresh)
v0.42.x 본체(append-catalog 다중-BC writer / 결정론 검증기 / chain-driver)가 **cal 3 BC 에서 새 본체 결함 0**으로 견딤. **resve 와 달리 analysis(chain0)부터 fresh** 시행 → 코드-고고학 + 카탈로그 append + analysis exit-gate#0 까지 일반화 확인. 누적 datapoint = event/golf/mtrm/healing/helium/hlum/**cal-salary/corpt/taxi** = **9 BC**. 골프 단일 PoC 과적합 아님 강하게 재입증.

### F2 — body-candidate 7건 평가 → **본체 코드 수정 0건 확정** (액면수용 금지 / 실측 검증)
sub-agent narrative 의 본체 후보를 `feedback_self_recorded_fact_validation` + `feedback_diagnose_before_design_check_existing` 에 따라 실측 검증:

| 후보 | 실측 | 판정 |
|---|---|---|
| #5 golf behavior-spec derivation_source `behavior_spec_path` 가 현 schema 위반(SALARY 에이전트) | golf behavior-spec = `{discovery_spec_path, analysis_artifacts[]}` + 현 v0.42.1 schema **VALID**. 에이전트가 자기 behavior-spec 초기 오작성(behavior_spec_path 혼입)→스키마 거부→**golf 탓 오귀착**(behavior-spec ↔ acceptance-criteria derivation_source 혼동). **resve run 과 동일 hallucination 재발** | ❌ REJECT — golf 템플릿 정상. 검증기가 에이전트 자기오류 정확 차단(positive process 신호) |
| #1 business-rules category enum 에 `state_transition` 부재(3 BC + golf) | enum=[validation,policy,calculation,authorization,**workflow**,integration,fe_*]. golf STATE BR=workflow / cal STATE BR=workflow+tag["STATE"] = **event/golf/resve/cal 일관 작동 규약** | 🟡 defer — 작동하는 규약 / enum 변경 시 기존 다수 BR 마이그레이션 churn / §8.1 enrichment ≠ defect (deferred backlog) |
| #2 migration-cautions category enum 에 `risk` 부재 | enum=[database,…,preservation,…,other]. 3 caution_group `risk`→`other` 정정(머지 중 실측). other 작동 | 🟡 defer — enrichment 후보(migration-caution 은 본질 risk-flavored / signal 손실 경미) |
| #3 antipatterns DOMAIN/API/FE → formal_spec_links 의무 conditional (AP-CALTAXI-004 reject) | 설계대로 작동(v1.4 의도). AP-CALTAXI-004(SQL-embedded 정산정책)는 본질 **DB** antipattern → DOMAIN→DB 재분류(정확 + formal-spec 날조 회피 / ADR-011 정합) | ❌ 비-defect — 정상 동작 / AP 정정으로 해소 |
| #4 sql-inventory carry_flags enum 에 orphan/dead-code/cross-bc-ownership 부재 | scope-decision-carry(+note) 로 우회. 작동 | 🟡 defer — enrichment 후보(레거시 역공학 미사용 statement·경계교차 신호) |
| #6 analysis api-extension 이 service-only 컨트롤러(별도 정산대상 API) 미수집 | 본 run 은 수기 legacy 추출이라 에이전트가 발견분 직접 기재 = N/A. 자동 api-extension 어댑터의 이론적 갭 | 🟢 관찰 기록 — 자동 adapter 도입 시 후보 |
| #7 plan-coverage-validator 가 operationId presence 만 검사(openapi cross-file 실재성 미검증) | 검증기 코드 주석에 **명시된 v11.x carry**(codegraph STEP6 openapi 정적검증 확장 후보). 알려진 deferred 항목 | 🟢 기존 carry corroboration — 신규 defect 아님 |

부수: **#8 code-pointer-validator strict 가 진짜 drift 차단(positive)** — SALARY 4 carry TC(010-013)가 미생성 2차 특성화 테스트 클래스(에이전트가 2번째 서비스용 클래스 계획만 하고 god-method carry라 미작성) 참조 → implement gate high=4. **BC 단일 특성화 클래스로 source_file 일관 정정**(다른 12 carry TC 규약 일치 / 빈 클래스 날조 ❌ = §8.1). `feedback_strict_exposes_drift` 실증.

### F3 — operability 천장 일관 + taxi cross-BC write sub-flavor
real-tested AC ratio(SALARY 4/16·CORPT 6/15·TAXI 4/19) = god-method + SQL-embedded + cross-BC 천장 9 BC 재확인. **taxi** 는 resve hlum(read-only SQL-embedded)과 또 다른 sub-flavor = **cross-BC write 결합**(corpt 정산 테이블 직접 write / MC-CALTAXI-002 / AP-CALTAXI-002). 결정론 환원 불가 = 사람 gate + characterization 존재 이유.

## 5. 본체 무변경 근거 (quality 1순위)
검증된 본체 결함 0 → **날조 fix 금지**. 가장 "고가치" 후보(#5)가 **resve 에 이어 또 hallucination**이었고 self-recorded-fact-validation 으로 차단된 것이 본 run 핵심 process 신호. enum-enrichment 후보(#1/#2/#4)는 일관 작동 규약 = enrichment ≠ defect → deferred backlog(다중-BC corroboration count 누적 기록 / 향후 §8.1 충족 시 결정). 따라서 버전 bump·CHANGELOG·schema·코드 변경 모두 없음 — DEC + STATUS 기록만.

## 6. STOP (검증 물증)
- 3 BC analysis leaf(business-rules/openapi/sql-inventory) + 4 shared 카탈로그(domain/BR-index/migration-cautions/antipatterns) + 3 manifest + 18 chain json(6×3) 전부 schema VALID.
- 13/13 JUnit GREEN(fail 0) 실 gradle(BUILD SUCCESSFUL 46s) / result_hash 3건 실측(SALARY 6d9dfddc…/CORPT 841ae818…/TAXI fecb14ff…).
- 3 BC × 5 stage findings-aggregator gate 전부 critical/high/medium=0 GO + analysis exit-gate#0 GO×3.
- graph-integrity 3 BC orphan 0 / matrix forward·backward 100%.
- body-candidate #5 hallucination 차단(golf behavior-spec 현 schema VALID 실측) / #8 strict drift 차단·정정.

## 7. carry / 다음
- ① deferred body-enrichment backlog(비-defect / §8.1 누적 후 결정): business-rules category `state_transition`(workflow 우회 9 BC) · migration-cautions category `risk` · sql-inventory carry_flags `cross-bc/orphan` · state-transition BR→workflow+STATE-tag 규약 문서화(id-conventions). 모두 작동 규약이라 긴급도 낮음.
- ② ep-be-gea 잔여 미분석 메뉴그룹: **req**(신청류 fo6+bo6 = 최대) / **issue**(출입·방문) — 사용자 결단(별도 워크트리).
- ③ ep-be-gea-cal worktree push(GHE only) = 사용자 결단.

> **보안**: 사내 source PoC = 외부 격리(공개 rageboom commit ❌ / ep-be-gea-cal GHE only). 본 DEC = 마스킹 codename(cal-salary/corpt/taxi)만 / 사내 패키지 경로·실 메서드명·file:line 전사 금지.
