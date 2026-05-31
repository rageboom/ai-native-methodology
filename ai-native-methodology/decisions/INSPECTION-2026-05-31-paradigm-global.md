# 패러다임 글로벌 정합 mini-pass (2026-05-31)

> 6단계(analysis→implement) 점검 종합. 10 패러다임 × (a) enforce vs document-only, (b) 상호 충돌, (c) SSOT 일원성.
> 입력 = 6 stage 리포트(INSPECTION-2026-05-31-{analysis,discovery,spec,plan,test,implement}.md) 확정 finding 99건(confirmed) + 실측.

## 패러다임 enforce-vs-document 매트릭스

| # | 패러다임 | 강제 메커니즘 | 등급 | 점검 중 발견 |
|---|---|---|---|---|
| 1 | no-simulation | lint-no-simulation(chain-strict) + gate-eval Tier3 reject + static-runner evidence_trust + test-impl-pass `--allow-execute` | **ENFORCED (강)** | implement I5 static-runner "6 plugin" inflated-count = no-sim honesty 위반 → 정정. 그 외 견고. |
| 2 | honesty-tiers(3.1/3.2) | intent_certainty schema enum + discovery-extraction WARN / inflation-lint(warning-only) | **PARTIAL** | ★ **본 점검 최대 테마** — skill prose 가 validator 미구현 강제를 *과대 주장*: spec S7(chain.7대.unreferenced), discovery D4(decisions 거버넌스), implement I5. 모두 정정(구현 또는 정직-격하). |
| 3 | automation-boundary 70~80% | policy attestation + §8.1 cross-PoC corroboration (hard gate ❌) | **DOCUMENTED** | plan NFR severity_floor / SP authoring 이 문서뿐→일부 강제 결선(P8/P9). |
| 4 | two-eyes / dual-rendering | template .json+.md 쌍 + drift-validator artifact-pair | **ENFORCED** | ★ **#1 systemic 발견** — `meta.confidence` object≠number 가 **5/5 stage 템플릿**(.json은 invalid·.md는 정상 = two-eyes drift). 5종 전부 정정 + ★ **capstone check25 신설로 영구 lock**. |
| 5 | deterministic-axis 분리 | chain-driver 순수 결정론 gate-eval / skill=LLM 의미 + 신규 C12 gate | **ENFORCED (강)** | "enforcement without instruction" gap(SP P8, related_aps S13) + dispatch layer drift(C3/C12 root) → C12 결정론 gate 신설로 차단. implement I9 GREEN fail-OPEN(tests_total guard) → fail-closed 정정. |
| 6 | R1' analysis §3-A axis | sub-rule + §8.1 corroboration (단방향 추출률) | **CORROBORATED** | analysis 한정. 별 metric(chain harness 70~80%와 분모 다름) 인지 유지. |
| 7 | use-scenario taxonomy(S1/S2/S3/greenfield) | gate-eval SCENARIO_EXPECTED + work-unit-manifest.scenario | **ENFORCED** | ★ SEED-3 — scenario gate가 코드(gate-eval 8분기)엔 있으나 sdlc-4stage 매트릭스 *문서*엔 0 → 정정(S2). test RED 무조건 단언이 S2 per_tc_outcome 와 충돌 → scenario-conditioned(T7). |
| 8 | sub-axis evolution | paradigm process (DEC cascade) | **DOCUMENTED** | 점검 자체가 sub-axis 진화의 실행 사례. |
| 9 | SBE/Adzic dual-representation | behavior-spec formalizations + decision-table-validator + property_tests | **ENFORCED** | analysis(formal-spec)·spec(behavior)·test(property) 횡단. formal-spec-link-validator BE-mode 연산자 버그(S15) → 정정. |
| 10 | BR cross-consistency | br-cross-consistency-validator(L1 결정론+L2 LLM) + discovery-extraction br_id match | **ENFORCED** | discovery multi-path BR lookup 견고. BR-INTENT-* 폐기 prefix prose 잔존 → 정정(D2 sweep). |

## (a) 결론 — enforce vs document
- **강 ENFORCED (5)**: no-simulation, deterministic-axis, two-eyes, use-scenario, SBE, BR-cross (실 validator/gate/schema). 본 점검이 이들의 *사각*(template invalid / scenario doc drift / GREEN fail-open / skill over-claim)을 발견·정정하고 **2 신규 결정론 gate(C12 agent-skills / check25 template-schema) + 1 fail-closed 보강(I9)** 으로 강화.
- **PARTIAL (1)**: honesty-tiers — intent_certainty/inflation은 부분 강제이나, *skill prose 가 강제력을 과대 주장*하는 패턴이 6단계 전반 반복(self-recorded-fact-validation 정확 적용 대상). 정직-격하 또는 구현으로 정정.
- **DOCUMENTED (3)**: automation-boundary, R1', sub-axis — 정책/corroboration. 의도된 비강제(metric 분모 차이 / process). 유지.

## (b) 상호 충돌
**근본 충돌 없음.** 단 하나의 반복 *긴장*: **deterministic-axis ∩ honesty-tiers** — "도구=결정론 / skill=LLM" 원칙상 skill 은 validator 가 *실제로* 강제하는 것만 "강제"로 적어야 하는데, 여러 skill 이 미구현 강제를 단언(S7/D4/I5). 이것이 본 점검의 systemic 축이며, 정정 원칙 = **구현(C12/D4/check25/S13) 또는 정직-격하(S7/C9/I5)** 2지선다. → 충돌이 아니라 *정합 의무*로 수렴.

## (c) SSOT 일원성
- 정책 SSOT 3종(`policies/{no-simulation,honesty-tiers,automation-boundary}.md`) 존재·canonical 확인 (v11.17.0 dedup 정합).
- chain/gate 번호 SSOT = System Y (gate#N=chain N). ★ v11.17.0 "System Y 정합" 선언이 **implement/test stage prose 다수 누락**(I4/I6/I11~I17, T6/T13) — 대부분 정정, shared-runner prose(test-impl-pass-validator)는 carry(F-I05).
- 산출물 골조 SSOT = schema (template 은 schema 파생). ★ check25 로 template⊆schema 영구 강제.

## 누적 carry (deliberate / 별도 묶음)
| id | item | 사유 |
|---|---|---|
| F-S07 | gate-consistency 강화(drift-validator 가 gate 매트릭스/validator 목록 비교) | C12류 결정론 gate / SEED-3·S10 구조 차단 |
| F-T05/F-I05 | **evidence 필드명 SSOT reconciliation** (test_run_evidence vs test_invocation_evidence vs test_pass_evidence) + s2-outcome-check producer 미배선 + shared-runner prose sweep | schema↔validator 3곳↔skill↔flow↔agent 다자 / validator가 schema-금지 필드 read → 신중 |
| F-T06 | test-runner framework/enum/adapter hardening (FRAMEWORK_HINTS / report_format enum / adapter) + S2 test_intent 템플릿 scaffold | moderate code 묶음 |
| F-X01 | code-graph.schema.json draft-07 $ref 로드 실패 | analysis schema 이슈 |
| F-X02 | skill-citation-validator 가 decisions/INSPECTION-* 점검 리포트를 scan(finding-quote false-positive) | validator scope = shipped skills 제한 검토 |

## 종합 verdict
6단계 자산 총 ~155 점검 / **confirmed 99 / refuted 53 / CUT 0**. 배포 플러그인은 이미 "프레임워크다움"(결정론 골조)이 견고했고, 본 점검은 (1) **5/5 템플릿 schema-invalid** (LLM 학습 base 오염), (2) **skill prose 의 validator 강제 과대주장** (honesty-tier), (3) **System Y 번호 prose 잔존**, (4) **결정론 사각**(C12 dispatch drift / I9 GREEN fail-open / SEED-3 scenario doc) 을 정정하고 **3 신규 결정론 gate**(C12 agent-skills / check25 template-schema / I9 fail-closed)로 "누가 돌려도 같은 품질"(req8)을 한 단계 끌어올렸다. CUT 0 = 자산 군더더기 없음. 검증: **release-readiness 25/25 · workspace test all-pass · 0 stale · drift 0 · 미커밋**.
