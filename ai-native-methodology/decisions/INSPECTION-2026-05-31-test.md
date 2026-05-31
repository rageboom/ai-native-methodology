# test(chain4/gate#4 RED) 단계 점검 리포트 (2026-05-31)

> Workflow `test-stage-inspection` (27 agents) · 5 unit × 6차원 → finding 25 → actionable 22 → **confirmed 16 / refuted 6**.
> 자산 verdict: KEEP 15 / FIX 14 / CUT 0 / ADD 0. baseline 24/24.

## 종합

test = gate#4 **RED 의무** 단계. no-simulation 실runner·RED mandate·scenario(S2 per_tc_outcome) paradigm은 견고(KEEP 다수). confirmed 16 = 4 cluster.

- **A 템플릿 schema-invalid (T2/T3 / HIGH)** — test-spec.template.json meta.confidence object≠number + top/per-case $comment (systemic / discovery·spec·plan 교정됨·test 잔존). 실측 5 errors.
- **B evidence/coverage 필드명 drift (T1/T10/T4/T5)** — ★ evidence 3중 혼란: schema=`test_cases[].test_run_evidence`(per-TC) / skill·flow=`test_invocation_evidence`(top-level, ★ validator 3곳 read) / agent=`test_pass_evidence`(=impl-spec chain5 필드 cross-bleed). coverage: skill·agent·flow=`coverage_summary` vs test-spec schema=`coverage`(coverage_summary는 traceability/characterization schema의 실 필드).
- **C RED scenario 단언 (T7 / D3)** — agent가 "RED=무조건 all_fail" 단언하나 S2(AX전환 주 타깃)=per_tc_outcome(characterization GREEN + augmentation RED) / S3=snapshot_green. 도구(결정론)↔agent(LLM) axis 균열.
- **D 번호·라벨·README·runner (T6/T13/T12/T15 / T9/T14/T16)** — validator README chain/gate System Y 한 칸 밀림 / gate-eval prose chain3 / "5종물증 7필드"=실제 10필드 / README severity / runner framework·enum·adapter robustness.

### 적용 방침
- **적용**: T2/T3(템플릿) · T4/T5(coverage_summary→coverage, test-spec 맥락 안전) · T7(scenario-conditioned RED) · T6(README 번호) · T13(gate-eval prose) · T8(md --allow-execute) · T12(라벨 10) · T15(README severity) · T11(S2 test_intent 예시 add).
- **carry**: ★ **T1/T10 evidence 필드명 SSOT reconciliation** (test_run_evidence vs test_invocation_evidence vs test_pass_evidence — schema↔validator 3곳↔skill↔flow↔agent / validator가 schema-금지 필드를 read → naive rename 시 validator 파손 / 신중 다자 결단 필요). ★ **T9/T14/T16 test-runner framework/enum/adapter hardening** (moderate code).

## Confirmed findings (16)

#### [T1] HIGH · D2 Drift · fix · TG1-skills
- **제목**: test-run-test-evidence SKILL 이 schema 부재 필드(top-level test_invocation_evidence)에 기입을 지시 — schema-validator 회귀와 충돌
- **detail**: skills/test-run-test-evidence/SKILL.md:29,63,67-82 이 'test-spec.json 의 test_invocation_evidence 필드 in-place 채움' + 해당 top-level JSON 예시를 제시. 그러나 test-spec.schema.json 루트는 additionalProperties:false 이고 test_invocation_evidence 필드가 존재하지 않음(루트 props = meta/derivation_source/test_cases/coverage/chain_attempt). 5종 물증은 test-spec.schema.json:149 의 test_cases[].test_run_evidence(per-TC)에만 존재. 같은 skill step 5(:84-89)는 schema-validator 회귀를 의무화하므로, step 4 지시를 그대로 따르면 step 5 가 즉시 fail = 자기모순. flows/test.phase-flow.json:48 도 'test-spec.test_invocation_evidence' 로 동일 stale 표기. (impl-spec 쪽 대응 필드는 test_pass_evidence — test_invocation_evidence 아님 / impl-spec.schema.json:7,114. test_invocation_evidence 라는 토큰은 test-cmd.schema.json:75-84 의 description 매핑 설명에만 등장하는 개념어.)
- **권장**: skill step 4(:63) 및 예시(:67-82)를 'test-spec.json 의 각 test_cases[].test_run_evidence(per-TC) in-place 채움'으로 정정하고, 산출 절(:29)도 동일하게 수정. chain 5 측은 impl-spec.json test_pass_evidence 로 명시. flows/test.phase-flow.json:48 의 outputs 문자열도 test_cases[].test_run_evidence 로 동기화. (적용 제안)
- **검증(high)**: INCRIME (인정). All factual claims verified against source files.

VERIFIED:
1. test-spec.schema.json root = additionalProperties:false (line 8); root props ONLY meta/derivation_source/test_cases/coverage/chain_attempt (lines 10,13,22,221,275). No `test_invocation_evidence` at root.
2. 5종 물증 7필드 lives ONLY per-TC at test_cases[].test_run_evidence (line 149, required block 152).
3. skills/test-run-test-evidence/SKILL.md:29 산출 절 + :63 step 4 instruct in-place 채움 of test-spec.json `test_invocation_evidence`; example :66-81 shows a top-level `{"test_invocation_evidence":{...}}` shape — a field absent from the schema.
4. step 5 (:84-89) mandates `schema-validator test-spec.json`. Following step 4 l

#### [T2] HIGH · D2 Drift · fix · TA1-agent
- **제목**: test-spec.template.json schema-INVALID (ajv 2020 실측 5 error / _base-apply-template 골조 오염)
- **detail**: tools/schema-validator 동등 ajv(2020,strict:false)로 templates/test/test-spec.template.json 을 schemas/test-spec.schema.json 에 대해 검증 → VALID:false, 정확히 5 error: (1) instancePath='' additionalProperty '$comment' (template line 2 top-level $comment — test-spec.schema 는 top-level additionalProperties:false 이며 meta-confidence 와 달리 $comment prop 미선언). (2) '/meta/confidence' must be number — template line 8~11 confidence:{level:0.85,rationale:...} object, meta-confidence.schema.json line 51~56 confidence=number(0.0~0.98). (3~5) '/test_cases/0','/1','/2' additionalProperty '$comment' (template line 19,44,72 — test_cases.items additionalProperties:false). ★ discovery/spec/plan 템플릿은 meta.confidence=number(0.85)로 이미 교정·VALID 실측(discovery-spec/behavior-spec/acceptance-criteria/task-plan 4종 전부 VALID). test 만 systemic meta.confidence object≠number + $comment 잔존. 골조가 _base-apply-template 로 주입되므로 LLM 이 invalid shape 를 정상 골조로 학습.
- **권장**: templates/test/test-spec.template.json 교정 4건: (a) line 2 top-level '$comment' 키 삭제(test-spec.schema 는 strict, discovery 처럼 schema 에 $comment 추가하는 대안은 strict 정신 약화 → 삭제 권고). (b) line 8~12 meta.confidence object 를 number 로: "confidence": 0.85 (rationale 텍스트는 meta-confidence 에 confidence_breakdown/warnings 등으로 흡수하거나 삭제 — discovery/spec/plan 교정 패턴 동일). (c~d) line 19,44,72 test_cases[].$comment 3건 삭제(예시 설명은 .template.md 사람눈 측에 보존). 교정 후 ajv 재검증 VALID 확인.
- **검증(high)**: UPHELD. The finding's diagnosis is factually accurate against committed HEAD (v11.0.0), and its recommendation is the correct, already-validated fix.

EVIDENCE (replicated the exact tool: ajv 2020, strict:false, allErrors, the schema-validator at tools/schema-validator/src/cli.js):
- Committed HEAD version (`git show HEAD:.../test-spec.template.json`) validated against schemas/test-spec.schema.json → VALID:false with EXACTLY the 5 errors the finding lists: (1) instancePath '/' additionalProperty '$comment' (top-level), (2) '/meta/confidence' must be number, (3-5) '/test_cases/0','/1','/2' additionalProperty '$comment'. The finding matched these word-for-word.
- The systemic claim is correct:

#### [T3] HIGH · D2 Drift · fix · TA4-templates
- **제목**: test-spec.template.json schema-INVALID — meta.confidence object≠number + top-level/per-case $comment additionalProperties 위반 (확정 5 violations)
- **detail**: schema-validator 실측 (templates/test/test-spec.template.json --schema schemas/test-spec.schema.json): [additionalProperties] / + [type] /meta/confidence: must be number + [additionalProperties] /test_cases/0,1,2. 근본: (a) line8-12 confidence={level:0.85,rationale:...} 인데 meta-confidence.schema.json L51-56 confidence type:number(0.0~0.98) / (b) line2 top-level $comment 인데 test-spec.schema.json L8 root additionalProperties:false (허용 키=meta/derivation_source/test_cases/coverage/chain_attempt 만) / (c) test_cases items L29 additionalProperties:false 인데 각 케이스 $comment 보유. discovery·spec·plan 3 단계는 이미 confidence=bare 0.85 + meta.$comment 1개 패턴으로 교정 완료(실측 valid).골조 _base-apply-template 가 본 invalid shape 주입 시 LLM 이 object 형태를 학습 → 산출물 단계 gate#4 schema-validator fail 유발.
- **권장**: [적용 완료] confidence → bare 0.85. top-level $comment + 3 per-case $comment 제거 → 내용을 meta.$comment(meta-confidence.schema additionalProperties:true 영역) 단일 string 으로 통합(sibling 3 템플릿 canonical 패턴). 재검증 valid:1/invalid:0 + release-readiness 24/24 보존.
- **검증(high)**: CONFIRMED (not refuted). Diagnosis reproduced exactly via the actual schema-validator CLI. The committed HEAD (v11.0.0) version of templates/test/test-spec.template.json validated against schemas/test-spec.schema.json yields precisely the 5 claimed violations: [additionalProperties] / (top-level $comment vs root additionalProperties:false), [type] /meta/confidence: must be number (object {level,rationale} ≠ number per meta-confidence.schema.json L51-56), and [additionalProperties] /test_cases/0,1,2 (per-case $comment vs items L28 additionalProperties:false). Root cause as stated is accurate. The fix in the recommendation is the schema-sanctioned canonical sibling pattern: meta-confidence.sch

#### [T4] MED · D2 Drift · fix · TG1-skills
- **제목**: test-verify-coverage SKILL 이 schema 부재 필드(test-spec.coverage_summary)에 결과 기입을 지시
- **detail**: skills/test-verify-coverage/SKILL.md:102 'chain 4 → test-spec.coverage_summary 갱신'. test-spec.schema.json:221 의 실제 필드명은 coverage(루트 additionalProperties:false 라 coverage_summary 기입 시 schema-validator fail). test-agent.md:22 / flows 도 'coverage_summary' 어휘를 일부 사용하나 schema 진실원은 coverage. skill 입력부(:22)와 3 metric 표(:28-34)는 schema 의 coverage.link_coverage / test_pass_rate / line_coverage+branch_coverage 와 정합 — 결과 기입 필드명만 drift.
- **권장**: skill :102-103 을 'test-spec.coverage 갱신' / 'impl-spec.coverage 갱신' 으로 정정(test-spec.schema.json:221 coverage / impl-spec.schema.json coverage 정합). (적용 제안)
- **검증(high)**: INCONCEDO (finding 인정 / refuted=false). 실측 검증:

1. test-spec.schema.json:7-8 — root `required`=["meta","derivation_source","test_cases","coverage"] + root `additionalProperties:false`. 실제 필드명 = `coverage` (line 221). `coverage_summary` 어휘는 test-spec.schema.json 전체에 0건 (grep NONE). → test-spec 인스턴스에 `coverage_summary` 기입 시 schema-validator 가 unknown root property 로 fail (gate#4 schema-validator 차단). 즉 SKILL.md:102 'chain 4 → test-spec.coverage_summary 갱신' 은 실재 drift.

2. SKILL 입력부(:20-22)와 3 metric 표(:28-34)는 schema 의 coverage.link_coverage / test_pass_rate / line+branch_coverage 와 정합 — finding 의 '결과 기입 필드명만 drift' 진단 정확.

3. 동일 drift 가 flows/test.phase-flow.json:57 (outputs: test-spec.covera

#### [T5] MED · D2 Drift · fix · TA1-agent
- **제목**: coverage_summary — schema 미존재 산출 키 (canonical=coverage)
- **detail**: agents/test-agent.md line 22 test-verify-coverage 산출 'coverage_summary (0.85 → 0.90 → 0.95)'. test-spec.schema.json 산출 키는 'coverage'(line 221 / required top-level / link_coverage.threshold ratchet 0.85~0.95). 'coverage_summary' 키 schema 부재. flows/test.phase-flow.json line 57 도 'test-spec.coverage_summary' 동일 drift(unit 밖 동반 정정 권고). 호출 절차 step 5(line 58~61)는 link_coverage/test_pass_rate/line+branch 3 metric 정확 — 표 한 줄만 stale.
- **권장**: agent line 22 'coverage_summary' → 'coverage.link_coverage (ratchet 0.85→0.90→0.95)'. 동반: flows/test.phase-flow.json coverage-measure phase outputs 'test-spec.coverage_summary' → 'test-spec.coverage' (unit 밖이나 같은 drift family — global mini-pass 에서 동시 정정 권고).
- **검증(high)**: CONFIRMED (not refuted). Verified facts: (1) agents/test-agent.md line 22 lists test-verify-coverage output as 'coverage_summary (0.85 → 0.90 → 0.95)'. (2) schemas/test-spec.schema.json canonical key = 'coverage' (line 221, top-level required=[meta, derivation_source, test_cases, coverage], top-level additionalProperties:false), with coverage.link_coverage.threshold ratchet 0.85–0.95 (lines 236–240). 'coverage_summary' is NOT a property of test-spec.schema.json → emitting it would be a hard schema violation. (3) flows/test.phase-flow.json line 57 coverage-measure phase outputs 'test-spec.coverage_summary' = same drift on the same test-spec artifact (companion fix correctly scoped out-of-unit

#### [T6] MED · D2 Drift · fix · TA3-validators-schema
- **제목**: chain/gate 번호 stale — 두 validator README + gate-eval/cli prose 가 System Y(test=chain4/gate#4, impl=chain5/gate#5) 미반영(한 칸 밀림)
- **detail**: System Y canonical(2026-05-31 / v11.17.0 / project_chain_gate_numbering_canonical)은 test=chain4/gate#4, implement=chain5/gate#5. 그러나: (a) test-impl-pass-validator/README.md 제목+L5+L13+L50 'chain 4 (impl) gate #4' — 본 validator 가 impl stage 에서 쓰일 때는 gate#5 여야 함; (b) spec-test-link-validator/README.md 제목+L5 'chain 3 (test) gate #3' (test=chain4/gate#4 여야), L50 'test-impl-pass = gate#4/chain4(impl)'; (c) gate-eval.js L10 주석 'chain 3/4 only', L111 'chain 3 expected all_fail', L120 'chain 3 (S2)' — test stage 인데 chain 3 표기(chain 4 여야), L128 'chain 4 expected all_pass' — impl stage 인데 chain 4(chain 5 여야); (d) cli.js L2 'chain 4 (impl → done) gate' + L384 '✅ ...(gate #4 통과)'. 모두 한 칸 밀린 stale. prose-only(validator 로직은 stage 문자열 'test'/'implement' 로 동작하므로 기능 영향 0)이나 외부 인용 시 axis 혼동 + System Y 0-stale baseline 회귀.
- **권장**: stale 번호 일괄 정정: test-impl-pass-validator README/cli.js prose 의 'chain 4 (impl)/gate #4' → 'chain 5 (implement)/gate #5' (단 본 validator 는 test+implement 공유이므로 '공유 runner / test=gate#4 RED·implement=gate#5 GREEN, RED/GREEN 판정은 gate-eval 책임' 로 서술); spec-test-link-validator README 'chain 3 (test)/gate #3' → 'chain 4 (test)/gate #4'; gate-eval.js L111/L120 'chain 3' → 'chain 4', L128 'chain 4' → 'chain 5', L10 주석 'chain 3/4' → 'chain 4/5'. (미적용 — 제안만. discovery/spec/plan 점검 시 발견된 동종 stale 와 batch 가능.)
- **검증(high)**: ACCEPTED (refuted=false). All four cited stale loci verified against System Y canonical (project_chain_gate_numbering_canonical: test=chain4/gate#4, implement=chain5/gate#5; "chain N = gate #N" 1:1):

(a) /Users/.../tools/test-impl-pass-validator/README.md L1 "chain 4 (impl) gate" + body "chain 4 (impl) stage 종결 시" — System X stale; this validator is shared (test gate#4 RED + implement gate#5 GREEN), framed only as impl.
(b) /Users/.../tools/spec-test-link-validator/README.md L1 "chain 3 (test) gate validator" + L5 "chain 3 (test → impl) gate #3" + L50 forward-ref "test-impl-pass = gate #4 / chain 4 (impl)" — should be chain 4/gate#4 (this stage) and chain 5/gate#5 (forward ref).
(c) /Users/

#### [T7] MED · D3 패러다임 · fix · TA1-agent
- **제목**: 무조건 'RED=모든 test fail' 단언 — S2 per_tc_outcome / S3 snapshot_green 와 충돌
- **detail**: agents/test-agent.md line 3,11 'RED 의무(impl 부재 / 모든 test fail)' + line 34 'chain 4 종결 시 모든 test fail (impl 부재). pass_count=0 의무' + line 56 'RED 검증(fail_count>0)'. 그러나 tools/chain-driver/src/gate-eval.js SCENARIO_EXPECTED(v11.11.0/DEC-2026-05-30-s2-gate-slice): S1/greenfield={test:'all_fail'}, S2(★주 타깃 AX전환)={test:'per_tc_outcome'}(characterization expected_outcome='pass' GREEN + augmentation='fail' RED 혼합 / s2-outcome-check.js + test-spec.schema test_intent 필드), S3={test:'snapshot_green'}(RED 강제 ❌). agent 의 무조건 all_fail/pass_count=0 단언은 S2·S3 에서 false. test 단계가 scenario 분기 가장 강하게 작용하는데 agent 본문에 scenario 분기 0 언급(siblings spec/plan/discovery 도 0 — 방법론 전반 패턴이나 test 단계는 RED invariant 단언까지 해 충돌이 실질적).
- **권장**: agent line 3/11/34/56 RED 단언을 scenario-conditioned 로 완화: 'RED 의무 = S1 재생성 / greenfield 한정 (모든 test fail). ★ S2 AX전환 = per_tc_outcome (characterization TC expected_outcome=pass GREEN + augmentation TC=fail RED 혼합 / test_intent 라벨 의무) / S3 특성화 = snapshot_green'. 호출 절차 step 4(test-run-test-evidence)에 'scenario=S2 시 per-TC expected_outcome ↔ 실 runner 결과 일치 검사(outcome_mismatches=0)' 한 줄 추가. gate-eval / s2-outcome-check 인용.
- **검증(high)**: CONFIRMED (refuted=false, high). All technical claims verified against source. test-agent.md asserts an unconditional RED invariant: line 3/11 "RED 의무 (impl 부재 / 모든 test fail)", line 34 "chain 4 종결 시 모든 test fail (impl 부재). test_pass_evidence.fail_count > 0 + pass_count = 0 의무", line 56 "RED 검증 (fail_count > 0)". But tools/chain-driver/src/gate-eval.js SCENARIO_EXPECTED (v11.11.0 / DEC-2026-05-30-s2-gate-slice, lines 42-46) defines: S1/greenfield={test:'all_fail'}, S2(★주 타깃 AX전환)={test:'per_tc_outcome'}, S3={test:'snapshot_green'}. The supporting machinery exists and is wired: tools/test-impl-pass-validator/src/s2-outcome-check.js is present; schemas/test-spec.schema.json has test_intent (li

#### [T8] MED · D4 오케스트레이션 · fix · TA4-templates
- **제목**: .md 검증 섹션 — RED evidence 의 --allow-execute 의무 미언급 + lint-no-simulation(chain-strict) gate#4 validator 누락
- **detail**: test-spec.template.md(pre-fix) line78 = 'test-impl-pass-validator (gate#4/RED) — 모든 test fail 입증 (--dry-run 시 placeholder ❌)'. 실측: test-impl-pass-validator/src/cli.js L261-263 ADR-CHAIN-004 §4 = RED evidence 는 --allow-execute(진짜 실행 동의) 의무 / --dry-run 은 config 검증만(실행 ❌). test.phase-flow.json L50 automated_validation 도 '--allow-execute / expected: all_fail' 로 정합. 그러나 .md 는 no-simulation 의 load-bearing flag(--allow-execute)를 언급하지 않고 --dry-run 만 언급 → 사람 검토자에게 RED 물증 생성 경로 오해 소지. 또한 flow validators(L71) + automated_validation(L50) 에 lint-no-simulation(chain-strict) 등록인데 .md 검증 섹션 3개 validator 목록에서 누락 — test 단계 no-simulation 강제 nucleus 인 게이트가 사람 눈 렌더에서 비가시.
- **권장**: [적용 완료] line78 에 'RED evidence 는 --allow-execute(실 runner / ADR-CHAIN-004 §4) 의무 / --dry-run=config 검증만→RED evidence ❌' 명시 + 검증 목록에 lint-no-simulation(chain-strict / gate#4 / Tier3 simulated 영구 reject) 항목 추가. 두 눈(AI 눈 phase-flow ↔ 사람 눈 .md) 정합 회복.
- **검증(high)**: 인정(refuted=false). 모든 load-bearing 주장 실측 검증됨.

1) Pre-fix 결함 실재 — git diff HEAD 확인: pre-fix line78 = `tools/test-impl-pass-validator/ (gate #4 / RED) — 모든 test fail 입증 (--dry-run 시 placeholder ❌)`. --allow-execute 미언급, --dry-run 만 언급. /Users/sangcl/.../tools/test-impl-pass-validator/src/cli.js L261-267 = `--allow-execute` 의무(ADR-CHAIN-004 §4) hard-require / L269-284 = --dry-run 은 config 검증만 + `process.exit(0)` 강제(실행 ❌). 즉 --dry-run 으로는 RED evidence(fail_count>0) 영원히 생성 불가. pre-fix .md 가 사람 검토자를 비실행 경로로 오도 = 실 D4/D5 two-eyes drift.

2) lint-no-simulation 누락 실재 — pre-fix .md 검증 섹션 = validator 3개만. flows/test.phase-flow.json L50 automated_validation + L71 cross_cutting.validators 양쪽에 `lint-no-s

#### [T9] MED · D5 결정론 · fix · TG1-skills
- **제목**: spec-test-link-validator FRAMEWORK_HINTS 에 v11.0.0 contract/visual framework 부재 — skill·schema 가 1급 승격한 framework 가 false-positive framework_mismatch 유발
- **detail**: test-generate-test-spec/SKILL.md:59-79 와 test-spec.schema.json:48-50,189-217(allOf if/then) 이 schemathesis/dredd/pact/spring-cloud-contract(BE contract) + playwright-visual/axe-core/percy/chromatic(FE visual) + testcontainers 를 1급으로 승격(open enum + required if/then). 그러나 tools/spec-test-link-validator/src/validator.js:11-23 FRAMEWORK_HINTS 는 junit5/jest/vitest/pytest/playwright/cypress/supertest 수준만 보유 — contract/visual framework 전부 누락. validator.js:84-95 는 stack hint 매칭 framework 가 allowed set 에 있으면 통과/없으면 chain.tc.framework_mismatch(medium) emit. 결과: 정당한 contract/visual TC 가 medium finding 으로 오탐 → gate #4 잡음(차단은 아님, high/critical 아니라). 결정론 axis 에서 'skill 이 시키는 정상 framework 가 validator 에서 오탐'은 누가 돌려도 같은 품질 원칙에 위배.
- **권장**: validator.js:11-23 FRAMEWORK_HINTS 확장: nodejs/typescript/react 에 playwright-visual/axe-core/percy/chromatic/testcontainers, java/spring 에 spring-cloud-contract, 공통(또는 별도 contract 그룹) schemathesis/dredd/pact 추가. 또는 schema open-enum 정신에 맞춰 contract/visual framework 는 stack-hint 매칭에서 제외(allowlist bypass)하고 if/then 충족(openapi_contract_ref / visual_regression_ref)만 검사하도록 분기. (적용 제안 — 본 finding 은 skill 이 promote 한 역량이 tooling 에서 under-enforced 임을 드러냄)
- **검증(high)**: CONFIRMED (인정). 모든 사실 주장 실측 검증됨.

증거:
- schema (test-spec.schema.json:45-50, 96-148, 189-217): v11.0.0 MAJOR 가 contract framework(schemathesis/dredd/pact/spring-cloud-contract) + visual framework(playwright-visual/axe-core/percy/chromatic) 를 open-enum hint + type enum(contract/visual/a11y) + allOf if/then(openapi_contract_ref / visual_regression_ref required) 로 1급 승격.
- skill (test-generate-test-spec/SKILL.md:55-81): LLM 에게 이 framework 들을 명시적으로 dispatch 하라고 지시 (BE/FE contract test 표 + "본격 required").
- validator (validator.js:11-23): FRAMEWORK_HINTS 는 junit5/jest/vitest/pytest/playwright/cypress/supertest 수준만 — contract/visual framework 전부 누락.
- validator.js:84-95: allowed.size>0 일 때 allowed

#### [T10] MED · D5 결정론 · fix · TA1-agent
- **제목**: test_pass_evidence = chain 5(impl-spec/GREEN) 필드명을 chain 4(test/RED) agent 가 사용 (cross-stage bleed)
- **detail**: agents/test-agent.md line 34 'test_pass_evidence.fail_count > 0 + pass_count = 0 의무' + line 82 '.aimd/output/test_pass_evidence.json (5종 물증 7 필드 + RED)'. 그런데 'test_pass_evidence' 는 schemas/impl-spec.schema.json line 7 required + line 114 정의 필드 = chain 5(GREEN, fail_count const 0) 산출. chain 4(RED, fail_count>0) agent 가 GREEN-evidence 필드명을 차용. test-spec.schema.json per-TC 필드는 'test_run_evidence'(line 149) / skill·phase-flow 는 'test_invocation_evidence' / standalone 파일은 .aimd/output/evidence/test-invocation-evidence.json(test-run-test-evidence SKILL line 26,49). 결과: agent 가 가리키는 .aimd/output/test_pass_evidence.json 표준 산출 경로·필드명 어디에도 없음. no-simulation/RED paradigm 관점에서 GREEN 필드명 차용은 LLM 을 fail_count=0(GREEN) shape 로 유인할 미세 위험.
- **권장**: agent line 34 'test_pass_evidence.fail_count' → 'test-spec.json test_cases[].test_run_evidence.fail_count'(schema canonical) 또는 standalone 'test-invocation-evidence.json'. line 82 산출 자산 '.aimd/output/test_pass_evidence.json' → '.aimd/output/evidence/test-invocation-evidence.json (5종 물증 + RED / test-spec.json test_run_evidence in-place 채움)'. ★ 부수: schema 의 test_run_evidence vs skill/flow 의 test_invocation_evidence 불일치는 schema↔skill drift 로 TA1-agent unit 밖 (paradigm_notes 참조) — agent 정정 시 어느 쪽을 canonical 로 가리킬지는 그 drift 해소에 종속.
- **검증(high)**: CONFIRMED (인정 / refuted=false). 모든 사실 claim 실측 검증 통과. (1) agents/test-agent.md:34 = `test_pass_evidence.fail_count > 0 + pass_count = 0` / :82 = 산출 `.aimd/output/test_pass_evidence.json`. (2) `test_pass_evidence` 는 chain 5 전용 필드 = impl-spec.schema.json:7(required)/:114(정의)/:126(`fail_count` **const 0** = GREEN). test-spec.schema.json 에는 top-level `test_pass_evidence` 부재. (3) test-spec.schema canonical per-TC 필드 = `test_run_evidence`(:149) — 템플릿(templates/test/test-spec.template.json:26,53,82)도 동일. (4) skill/flow 는 `test_invocation_evidence`(test.phase-flow.json:48 / test-run-test-evidence SKILL:26,29,49,63,67 / test-generate-test-spec SKILL:101), standalone 파일 = `.aimd/output/evidence/test-i

#### [T11] MED · D5 결정론 · add · TA4-templates
- **제목**: S2(AX전환=주 타깃) per_tc_outcome 의 test_intent(characterization/augmentation) 템플릿 미스캐폴드
- **detail**: test-spec.schema.json L71-75 test_intent enum[characterization,augmentation] = v11.11.0 S2 gate(C-use-scenario-s2-gate) 용 필드. sdlc-4stage-flow.json L135 scenario_expected.S2='per_tc_outcome' + L136 $comment 가 'v11.11.0 characterization GREEN + augmentation RED 분리'를 명시 = gate-eval SCENARIO_EXPECTED 미러. 그러나 templates/test/test-spec.template.json·.md 어디에도 test_intent 언급 0 / 3 예시 모두 expected_outcome:fail(S1·greenfield style)만. 주 타깃 시나리오(S2)의 가장 강한 결정론 신호(characterization↔expected_outcome=pass / augmentation↔fail 정합)를 operator 가 템플릿에서 학습할 scaffold 부재. (schema 상 optional 이라 schema-valid 는 유지 / 목적적합 gap).
- **권장**: test_cases 에 S2 예시 1건 ADD 권장: test_intent='characterization' + expected_outcome='pass'(legacy 코드 존재 → GREEN) 1건 + test_intent='augmentation' + expected_outcome='fail'(신규 증강 RED) 1건 분리. .md 3절/검증 섹션에 per_tc_outcome 분기 + test_intent↔expected_outcome 정합 1줄 추가. (본 임무 초점은 확정 schema-invalid 교정이라 ADD 는 미적용 / 권고로 기록.)
- **검증(high)**: All four core claims verified against source files. (1) test-spec.schema.json L71-75 holds test_intent enum [characterization, augmentation], attributed to v11.11.0 S2 gate (C-use-scenario-s2-gate). (2) sdlc-4stage-flow.json L135 maps S2='per_tc_outcome' and L136 $comment mirrors the 'characterization GREEN + augmentation RED 분리' narrative. (3) grep over BOTH templates/test/test-spec.template.json and .template.md returns exit 1 (zero matches) for test_intent / characterization / augmentation / per_tc_outcome — confirmed scaffold absence. (4) All 3 template examples (json L24/L46/L73, md L26 et al.) are expected_outcome='fail' (S1/greenfield style), none use test_intent.

Decisively, the S2 

#### [T12] LOW · D1 목적적합 · fix · TA1-agent
- **제목**: '5종 물증 7 필드' 라벨 — schema required = 10 필드 (자기 열거도 10개)
- **detail**: agents/test-agent.md line 3,11,21,35,55,68 '5종 물증 7 필드'. test-spec.schema.json test_run_evidence.required = 10 필드(test_runner_version/test_runner_stdout_path/invocation_timestamp/duration_ms/pass_count/fail_count/skip_count/reproduction_command/result_hash/report_format). 더욱이 agent line 21 가 괄호 안에 정확히 10개를 나열하면서 라벨은 '7 필드' — 자기모순. '5종 물증'(5 evidence kinds)은 방법론 공통 coined term 이라 보존 무방하나 '7 필드' 수치는 schema·자기열거 양쪽과 불일치.
- **권장**: '5종 물증 7 필드' → '5종 물증 10 필드'(또는 수치 제거 '5종 물증 필드'). schema test_run_evidence.required(10) 와 정합. line 21 괄호 열거가 이미 10개이므로 라벨만 정정. lifecycle-contract / impl-spec(동일 evidence 필드)도 같은 라벨 사용 시 global mini-pass 에서 동시 점검 권고.
- **검증(high)**: ACCEPTED. Verified against source. test-spec.schema.json test_run_evidence.required is exactly 10 fields (test_runner_version, test_runner_stdout_path, invocation_timestamp, duration_ms, pass_count, fail_count, skip_count, reproduction_command, result_hash, report_format) — confirmed by parsing the schema (required.length=10). agents/test-agent.md uses '5종 물증 7 필드' on lines 3,11,21,35,55,68, and line 21's own parenthetical enumeration lists exactly 10 fields — a genuine self-contradiction inside the same file (label says 7, its own list shows 10). The '5종 물증' (5 evidence kinds) coined term is fine to keep; the finding correctly isolates the '7 필드' numeral as the defect.

Provenance confirms 

#### [T13] LOW · D2 Drift · fix · TA2-flow-gate
- **제목**: test.phase-flow.json + gate-eval block detail 의 'chain 3' narrative stale (System Y 한 칸 밀림)
- **detail**: test=chain4/gate#4 canonical(System Y, v11.17.0 정합)인데 prose 2처에 'chain 3' 잔존: (a) gate-eval.js line 111 detail `chain 3 expected all_fail (RED) for scenario ...` + line 120 detail `chain 3 (S2 AX전환) per-TC ...` — gate 동작/decision 엔 무영향(field·severityRank 검사라 gate-safe / 정책 SSOT dedup paradigm 정합)이나 사용자 노출 reason 문자열이 stale. (b) test.phase-flow.json 의 $comment(line2)·구조 필드는 이미 'chain 4'/'gate #3→#4 재번호' 로 교정돼 정합 — flow 본체는 clean. 즉 잔여는 gate-eval 의 2 detail 문자열뿐. discovery 단계 점검에서 본 spec-test-link 류 case 점검과 동류 — prose-only stale, validator gate 결정엔 무해.
- **권장**: gate-eval.js line 111 'chain 3 expected' → 'chain 4 (test) expected', line 120 'chain 3 (S2 AX전환)' → 'chain 4 (test, S2 AX전환)' 로 prose 정정. 코드 동작 불변(문자열만) — 단독 또는 다음 prose-stale 묶음 release 에 동봉. severityRank/code 키는 불변 유지(결정론 axis 보호).
- **검증(high)**: UPHELD. Verified at /Users/sangcl/Documents/Development/Study/ai-native-methodology/ai-native-methodology/tools/chain-driver/src/gate-eval.js. (1) Stale confirmed: lines 111 ("chain 3 expected all_fail (RED)") and 120 ("chain 3 (S2 AX전환)") are both inside the `stage === 'test'` block (line 106) — per System Y canonical (v11.17.0: test=chain4/gate#4) these "chain 3" labels are one-off stale. (2) Gate-safe confirmed: gate decision uses only the `code` field (line 165 `reasons[0].code`, line 185 `r.code === 'validator_critical'||'validator_high'`); the `detail` field is a pure human-facing string never consumed in any decision branch. So the prose fix changes zero behavior — release-readiness 2

#### [T14] LOW · D2 Drift · fix · TA3-validators-schema
- **제목**: report_format enum 분기 — test-cmd.schema(hyphen)와 test-spec.schema(underscore) 교집합 0 / cli.js 가 testCmd.report_format 를 evidence 로 직통
- **detail**: test-cmd.schema report_format enum = [sarif-2.1.0, junit-xml, json, stdout-regex] (하이픈/dot). test-spec.schema test_run_evidence.report_format enum = [sarif_2_1_0, junit_xml, jest_json, pytest_json, vitest_json, lcov, cobertura_xml, jacoco_xml] (언더스코어). 교집합 0 — 어떤 값도 양쪽 동시 valid 불가. cli.js buildEvidence L208 'report_format: testCmd.report_format ?? json' 가 test-cmd 값(하이픈)을 그대로 evidence.report_format 으로 transcribe. 만약 이 evidence 가 test-spec.json test_run_evidence 로 옮겨지면 schema-validator 가 reject. (현재는 evidence 가 별도 test-invocation-evidence.json 으로 기록되고 agent 가 test-spec 로 transcribe 하므로 즉시 깨지진 않으나, 두 schema 가 같은 개념(report_format)을 다른 표기로 정의 = 잠재 drift 트랩. default 'json'(test-cmd) 도 test-spec enum 에 없음.)
- **권장**: 두 schema 의 report_format 을 단일 표기로 통일(권장: test-spec 의 underscore SARIF/OASIS 표기 sarif_2_1_0/junit_xml 로 수렴) 하거나, cli.js buildEvidence 에 명시적 매핑 테이블(junit-xml→junit_xml, sarif-2.1.0→sarif_2_1_0, json→framework별 *_json) 추가. 동시에 test-cmd default 'json' → framework-aware default(jest→jest_json 등) 또는 test-spec enum 에 'json' 포함 검토. (미적용 — 제안만.)
- **검증(med)**: INDNG STANDS (refuted=false), low/fix. Core enum facts verified: test-cmd.schema report_format enum=[sarif-2.1.0,junit-xml,json,stdout-regex] (L62-67, default 'json') vs test-spec.schema test_run_evidence.report_format enum=[sarif_2_1_0,junit_xml,jest_json,pytest_json,vitest_json,lcov,cobertura_xml,jacoco_xml] (L175-179) → intersection = 0, and the test-cmd default 'json' is absent from the test-spec enum. cli.js L208 'report_format: testCmd.report_format ?? json' transcribes the hyphen/default value into the standalone evidence object — verified.

The finding's "immediate break" pathway correctly does NOT fire (finding concedes this): the CLI emits a free-standing test-invocation-evidence.j

#### [T15] LOW · D2 Drift · fix · TA3-validators-schema
- **제목**: spec-test-link-validator README outputs 표 ↔ validator.js emit severity 불일치 (unknown_bhv: README high vs 코드 critical)
- **detail**: spec-test-link-validator/README.md L33 'chain.tc.unknown_bhv | high'. validator.js L55-62 emit 은 severity:'critical'. README L28 은 '권위 = validator.js emit 상수. kind 명은 validator.js 와 일치 의무' 라 자기 규약을 선언하나 severity 가 어긋남. exit code 는 critical/high 둘 다 ≥1 시 exit 1(strict)이라 gate 동작 영향은 0 이나, 문서 권위 규약 위반 + operator 가 unknown_bhv 를 high(go-with-warnings 후보)로 오판할 소지.
- **권장**: README L33 'chain.tc.unknown_bhv | high' → 'critical' 로 정정(validator.js L58 권위 일치). (미적용 — 제안만.)
- **검증(high)**: INCONELY 인정(refuted=false). 핵심 사실 100% 검증됨. README.md L33 `chain.tc.unknown_bhv | high` ↔ validator.js L55-62 emit `severity:'critical'`(L58) 불일치 실측 확인. README L28 이 스스로 `★ 권위 = src/validator.js emit 상수` 자기 규약을 선언하므로 "의도된 설계/harmless"가 아니라 README 자체 contract 위반 = 진짜 D2 doc drift.

4 관점 적용: (a) 의도 설계 ❌ — README 자기 권위 규약을 자기 위반. (b) gate#4 validator 처리 ❌ — 프로젝트 정책(policy_ssot_consolidation: validator는 prose 아닌 field/경로 검사)상 어떤 validator도 README prose 표 ↔ code emit 상수를 대조하지 않음 = gate 사각지대. (c) 신규 회귀 ❌ — README 최종수정 5/18, v11.17.0 baseline 작업의 회귀 아닌 기존 정적 drift. (d) 24/24 ❌ — prose이므로 release-readiness 영향 0.

gate-impact 0 주장도 정확: cli.js L46 `fail = some(critical || high)` → critical/high 둘 다 ex

#### [T16] LOW · D4 오케스트레이션 · fix · TA3-validators-schema
- **제목**: framework 추론 ↔ 실행 adapter 불일치 — load-test-cmd 가 mocha/go-test 추론 가능하나 cli.js 가 'unsupported framework' throw
- **detail**: load-test-cmd.js STACK_INFERENCE(L8-17)는 inventory.stack_signals 에서 mocha(L11), go-test(L16) 를 framework 로 추론. test-cmd.schema enum 도 mocha/go-test/rspec/phpunit/cargo-test/dotnet-test 를 허용. 그러나 cli.js selectAdapter(L94-102)는 jest/vitest/junit5/pytest 만 parser 매핑, 나머지는 default(parser:null). parseRunnerOutput(L157-181)에서 framework!=='other' && adapter.parser==null → L180 throw 'unsupported framework: mocha/go-test'. 즉 inventory 추론이 성공해 mocha/go-test contract 를 만들어도 실행 단계에서 exit 1. README L60 은 'mocha/cargo/dotnet/phpunit/go-test = v2.1+ carry' 로 정직 표기하나, 추론 테이블·schema enum 이 실행 불가 framework 를 advertise = 사용자에게 '지원되는 듯' 오인 유발. (실 PoC 는 jest/vitest/junit5/pytest 한정이라 즉시 폭발은 낮음 → low.)
- **권장**: 택1: (a) load-test-cmd STACK_INFERENCE 에서 mocha/go-test 행을 'other + stdout_parser 권고' 로 변환하거나 추론 제외하고 명시 의무로 전환; (b) cli.js selectAdapter 의 default 분기에서 framework∉{지원 4종, other} 시 명확 에러('framework X = v2.1+ carry / framework:other + stdout_parser 로 우회') 로 throw 메시지 개선; (c) test-cmd.schema enum 에 미지원 framework 옆 description 으로 'v2.1+ carry — 실행 시 other+stdout_parser 필요' 명시. (미적용 — 제안만.)
- **검증(high)**: Finding is accurate and confirmed by file Read. Verified chain: (1) load-test-cmd.js STACK_INFERENCE L11/L16 genuinely infers framework:'mocha' and framework:'go-test' from inventory.stack_signals; (2) test-cmd.schema.json enum L16-28 advertises go-test/rspec/phpunit/mocha/cargo-test/dotnet-test; (3) cli.js selectAdapter L94-102 maps ONLY jest/vitest/junit5/pytest, default returns parser:null; (4) parseRunnerOutput L157-181 — for framework!=='other' with adapter.parser==null reaches L180 `throw new Error('unsupported framework: '+framework)`, caught at L311-316 → exit 1. So an inferred/schema-valid mocha or go-test contract advertises 'supported' but explodes at execution. README L60 honestl

## Refuted (6)

**R1.** [high·D2] test-spec.template.json 이 schema-INVALID — _base-apply-template 가 잘못된 shape 를 골조로 주입
  - 기각: REFUTED — finding's central factual claims are contradicted by the actual file at v11.17.0. Direct ajv 2020 validation (resolving $ref→meta-confidence via $id) returns VALID:true, 0 errors; the repo's own canonical schema-validator CLI agrees (valid:

**R2.** [high·D2] test-spec.template.json schema-INVALID — 실 validator 5 violation 재현 (골조 invalid shape 학습 위험)
  - 기각: REFUTED. The finding's core claim — that `node tools/schema-validator/src/cli.js templates/test/test-spec.template.json --schema schemas/test-spec.schema.json` yields `invalid:1, 5 errors` — does NOT reproduce. I ran it twice: result is `valid: 1, in

**R3.** [high·D2] test-spec.template.json schema-INVALID 5위반 (확정 / AJV 실측) — meta.confidence object≠number + $comment 4건 additionalProperties 위반
  - 기각: REFUTED. The finding claims test-spec.template.json is schema-INVALID with 5 AJV violations, but both the real gate#4 schema-validator (tools/schema-validator/src/cli.js) and an independent AJV-2020 harness report VALID:true against schemas/test-spec

**R4.** [med·D4] S2 per_tc_outcome 생산자 s2-outcome-check.js 가 validator CLI 에 미배선 — outcome_mismatches 결정론 공급 경로 부재
  - 기각: 기각 — finding 의 구조적 관찰은 모두 사실이나(검증 완료), fix-now gate finding 으로의 격상은 의도된 설계를 drift 로 오인한 것.

[사실 확인 — finding 정확]
- test-impl-pass-validator/src/cli.js: scenario/per_tc/--scenario 키워드 0건. ok100=fail_count===0&&pass_count>0 (impl GREEN 기준). reconcileOu

**R5.** [med·D5] S2 per_tc_outcome gate = 프로듀서 단선 — s2-outcome-check.js 가 cli.js 에 미배선 → outcome_mismatches 실제 emit 안 됨
  - 기각: 기각(refuted). 사실 관찰은 정확하나 "프로듀서 단선 = 실제 미검증 dead-on-the-wire" 프레이밍과 1차 권장(chain-driver --test-spec 자동 배선)이 의도된 설계 + 정직 WARN 라벨링 + 실 dogfood 입증에 의해 반증됨.

검증한 사실(finding 의 facts 部는 정확): test-impl-pass-validator/src/cli.js 는 s2-outcome-check 미import (gre

**R6.** [low·D4] .aimd/config/test-cmd.json — phase-flow input 인데 agent input 확인 목록 누락
  - 기각: 기각. 핵심 권장(agent step 1 input 목록에 .aimd/config/test-cmd.json 추가)이 정착된 cross-agent 규약과 충돌하고, 이미 올바른 level(skill)에서 처리됨.

(1) 사실 확인된 부분: flows/test.phase-flow.json:13 framework-detect.inputs 에 test-cmd.json 포함 + outputs(line14)=[framework_resolved, test

