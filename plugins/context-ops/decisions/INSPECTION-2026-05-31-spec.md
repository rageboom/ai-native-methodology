# spec(chain2/gate#2) 단계 점검 리포트 (2026-05-31)

> Workflow `spec-stage-inspection` (25 agents / 1.36M tok) · 5 audit unit × 6차원 → finding 24 → actionable 20 → **confirmed 15 / refuted 5**.
> 자산 verdict: **KEEP 12 / FIX 14 / CUT 0 / ADD 0** (일부 자산 다중 unit 계상).
> baseline: release-readiness 24/24 (analysis+discovery 수정 후).

## 종합 (synthesis)

spec 는 gate#2 보유 단계. confirmed 15 = 7 cluster. 핵심 = (1) **양 템플릿 schema-invalid**(discovery 와 동일 systemic), (2) **agent 핸드오프가 plan stage(chain3)를 건너뜀**, (3) **skill이 gate#2 강제력을 over-claim**.

- **A. 템플릿 schema-invalid (S1/S3/S4/S5/S11 / HIGH)** — behavior-spec + acceptance-criteria 양 템플릿 모두 `meta.confidence` object≠number + top-level `$comment`(root additionalProperties:false 위반) + acceptance-criteria 는 criteria[].$comment 위반. discovery 템플릿과 **동일 systemic 패턴**(discovery는 이미 교정, spec만 잔존). 실측: schema-validator 2/2 invalid.
- **B. agent 핸드오프·revisit stale (S6 HIGH / S9 MED)** — spec-agent 종결 dispatch 가 `test-agent` 직지명(line 61/82) = **plan stage(chain3) 건너뜀** (phase-flow next_chain=plan 위반 / v9.0 plan 신설 cascade miss). + revisit:planning → revisit:discovery(line 90).
- **C. over-claim / under-wire (S7 HIGH / S13 MED-add / S12 MED)** — S7: integrate-deliverables 가 `chain.7대.unreferenced` 강제를 주장하나 validator 미구현(honesty-tier 위반 / discovery D4 와 동형). S13: gate#2 severe-AP blocking lane(related_aps + --antipatterns) under-wire. S12: derive-AC step6 가 chain2 에서 test-spec 의존 validator 호출 → usage error.
- **D. path / validator-list drift (S8/S10 MED)** — S8: decision-table-validator 경로 `formal-spec/` prefix 누락. S10: gate#2 validator 목록 4-소스 3-way 불일치.
- **E. SEED-3 scenario doc drift (S2 HIGH)** — gate-eval.js scenario(S1/S2/S3/greenfield) 8 분기 + cli.js 실 wiring 있으나 sdlc-4stage gate 매트릭스 문서엔 0회.
- **F. validator 코드 버그 (S15 MED)** — check-links.js:40 BE-mode 연산자 우선순위 버그 `&& .md || .json` → decision_tables 의도가 모든 .json 으로 누설(false-positive 위험).
- **G. drift-validator 공백 (S14 MED-add)** — drift-validator 가 gate 매트릭스/cross_cutting.validators 를 비교 안 함 → SEED-3·S10 이 silently uncaught (구조적 근본 원인 / C12 류 결정론 check 후보).

### 적용 시 결단

- **S7 (구현 vs 정직격하)**: discovery D4 처럼 — `chain.7대.unreferenced` lane 을 chain-coverage-validator 에 _구현_ vs skill prose 를 _정직 격하_.
- **S14 / G (drift-validator gate-consistency check 신설)**: SEED-3·S10·gate validator 불일치를 결정론적으로 잡는 cross-flow check 신설 = req8 정합(C12 류). 적용 시 SEED-3(S2)·S10 도 같이 해소.

## Confirmed findings (15)

#### [S1] HIGH · D2 Drift · verdict=fix · SG1-skills

- **제목**: 양 spec 템플릿 schema-INVALID — meta.confidence object≠number + top-level $comment (additionalProperties 위반)
- **detail**: 실측 (schema-validator 2/2 invalid): templates/spec/behavior-spec.template.json:8-12 `confidence: {level:0.85, rationale:...}` 인데 meta-confidence.schema.json:51-56 `confidence` = type:number(0.0~0.98). 추가로 behavior-spec.template.json:2 의 top-level `$comment` 가 behavior-spec.schema.json:8 `additionalProperties:false` 위반. acceptance-criteria.template.json 은 동일 2건 + criteria[0..2] 각 항목 `$comment`(criteria items additionalProperties:false) 추가 위반. discovery 템플릿은 confidence=bare number 로 이미 교정됨 → spec 단계만 미적용 = 단계 횡단 systemic drift. \_base-apply-template SKILL.md 이 본 골조를 chain 진입 시 주입하므로 LLM 이 invalid shape 를 학습 → behavior-spec/AC 가 gate#2 schema-validator 에서만 뒤늦게 fail (결정론 프레임워크가 입구에서부터 invalid contract 를 emit).
- **권장**: 両 템플릿 동일 교정 (적용 후 schema-validator 2/2 valid 로 실측 확인 완료): (1) `meta.confidence` 를 `{level,rationale}` → bare number `0.85` 로. rationale 보존 필요 시 meta-confidence.schema 가 허용하는 `meta.$comment`(string) 또는 `meta.confidence_breakdown` 로 이동. (2) top-level `$comment` 제거 — 설명이 필요하면 `meta.$comment` 로 이동(behavior-spec/AC schema 의 meta 는 meta-confidence $ref 라 $comment 허용). (3) acceptance-criteria 의 criteria[].`$comment` 키 전부 제거 (예제 라벨은 description 또는 별도 주석파일로). discovery 가 top-level $comment 로 통과하는 건 discovery-spec.schema 가 additionalProperties:true 이기 때문 = 동일 패턴을 strict 스키마에 복붙 금지.
- **검증(high)**: CONFIRMED via direct execution of tools/schema-validator/src/cli.js. Both spec templates are schema-INVALID, reproduced exactly as the finding states:

(1) /Users/sangcl/Documents/Development/Study/ai-native-methodology/ai-native-methodology/templates/spec/behavior-spec.template.json → 2 errors: [additionalProperties] at / (top-level $comment, line 2) and [type] /meta/confidence: must be number (it is the object {level,rationale}, lines 8-12).
(2) .../templates/spec/acceptance-criteria.template.json → 5 errors: same 2 + criteria[0..2] each [additionalProperties] (the $comment example-label keys, lines 19/42/67).

Schema grounding all verified:

- behavior-spec.schema.json:8 and acceptance-criteria.schema.json:8/31 are additionalProperties:false, and criteria items (line 31) are also false → so top-level $comment and criteria[].$comment are genuine violations.
- meta-confidence.schema.json:51-56 defines confidence as type:number (0.0-0.98); even though meta is additionalProperties:true, an object value for the typed `confidence` key fails the type constraint → genuine violation.

Adversarial angles all clear the finding (not refuted):
(a) Not intended/harmless: the discovery template

#### [S2] HIGH · D2 Drift · verdict=fix · SA2-flow-gate-scenario

- **제목**: SEED-3 확정 — gate-eval scenario 분기(S1/S2/S3/greenfield × 8)가 sdlc-4stage gate 매트릭스에 0회 문서화 = 코드-문서 drift
- **detail**: gate-eval.js:42-47 SCENARIO_EXPECTED 가 4 시나리오별 test/implement RED/GREEN 기대를 freeze (S2=per_tc_outcome, S3=snapshot_green), :106-140 stage 분기가 s2_outcome_mismatch / snapshot 비RED / Tier3 simulated 를 emit, cli.js:217 이 scope manifest.scenario 를 evaluateGate 에 실제 주입 = 완전 wiring. 반면 flows/sdlc-4stage-flow.json gates[] (line 112-143) 의 #4/#5 validator 문자열엔 'RED expected: all_fail'/'all_pass' 만 적혀 S1 고정으로 읽히고, S2 per_tc_outcome·S3 snapshot_green·greenfield 분기는 매트릭스 어디에도 없음 (grep scenario/S2/S3/per_tc/snapshot = 0 hit). sdlc-4stage-flow.mermaid 의 S1/S2/S3 는 use-scenario 아니라 chain subgraph id (line 11-31) = ID 충돌이 drift 가독성 악화. DEC-2026-05-30-use-scenario-taxonomy 가 P0 가치인데 그 enforcement 가 SSOT 문서에 비가시 = 외부 인용 시 'gate 는 시나리오 무관' 오독 위험.
- **권장**: sdlc-4stage-flow.json gates[] 각 항목에 scenario_expected 객체 추가 (예 #4: {"S1":"all_fail","greenfield":"all_fail","S2":"per_tc_outcome","S3":"snapshot_green"}) — gate-eval SCENARIO_EXPECTED 를 그대로 미러. 또는 cross_cutting 에 use_scenario_gate 블록 신설 + DEC-2026-05-30/v11.9.0/v11.11.0 인용. 미적용 제안 — 본 점검은 사실 보고만.
- **검증(high)**: Finding UPHELD (not refuted). Every factual claim verified against source. (1) Code wiring complete: gate-eval.js:42-47 SCENARIO_EXPECTED freezes S1/S2/S3/greenfield test/implement expectations (S2=per_tc_outcome, S3=snapshot_green); branches at :106-140 emit s2_outcome_mismatch/RED-proof/Tier3 reasons; cli.js:214-217 injects manifest.scenario into evaluateGate. (2) Doc drift confirmed: `grep -cE "scenario|per_tc|snapshot_green|greenfield"` on flows/sdlc-4stage-flow.json = 0 hits; gates[] #4 (line 134) / #5 (line 140) document only `expected: all_fail`/`all_pass` = reads S1-only. (a) Real harm, not intended design — P0-declared use-scenario-taxonomy with S2 as primary target has its enforcement invisible in the SSOT flow doc. (b) NOT handled by any other asset: drift-validator explicitly EXCLUDES sdlc-4stage-flow.json from the general comparator (normalize-json.js:15-17, cli.js:54); its only two dedicated checks validate stages[]/skills (check-phase-skills.js checkChainStageLayout never reads gates[] content) and state-schema enum — neither compares gates[] scenario expectations vs SCENARIO_EXPECTED. No gate#2 validator covers it. (c) Low regression risk: recommendation mirrors an

#### [S3] HIGH · D2 Drift · verdict=fix · SA3-validators

- **제목**: spec 템플릿 2종 schema-INVALID — meta.confidence object≠number (단계 횡단 systemic drift) + top-level/criteria $comment 위반
- **detail**: ajv 실측(schemas 전체 로드 후 검증) 확정. templates/spec/behavior-spec.template.json: (1) /meta/confidence type 위반 — {"level":0.85,"rationale":...} 객체로 작성됐으나 meta-confidence.schema.json 은 confidence:{type:number, min0 max0.98}; (2) (root) additionalProperties 위반 — top-level $comment 키(behavior-spec.schema.json top additionalProperties:false, $comment 미선언). templates/spec/acceptance-criteria.template.json: 동일 2건 + /criteria/0·1·2 additionalProperties 위반(각 criteria item 의 $comment). discovery-spec.schema.json 은 top additionalProperties:true 라 discovery 템플릿 $comment 는 생존하나 meta.confidence object≠number 패턴은 동일 — discovery↔spec 단계 횡단 systemic drift 확정. 골조 \_base-apply-template 주입 시 LLM 이 invalid shape 학습 → gate#2 schema-validator 가 산출물에서 fail.
- **권장**: (1) 두 템플릿 meta.confidence 를 number 로 교정: "confidence": 0.85 (rationale 는 meta.confidence_breakdown 또는 meta.extra.confidence_rationale 로 이전 — meta-confidence.schema 의 extra:{additionalProperties:true} 가 합법 격리처). (2) top-level $comment 는 behavior/acceptance schema top additionalProperties:false 라 불법 → 제거하거나 schema 에 $comment 속성 추가(discovery-spec 처럼). criteria item $comment 도 동일. discovery 템플릿 confidence object≠number 도 동일 교정해 단계 횡단 SSOT 일치. (미적용 — 제안만)
- **검증(high)**: CORE FINDING CONFIRMED (refuted=false), with one narrative correction to the recommendation.

EMPIRICAL VALIDATION (ajv 8.20.0, mirroring the gate's exact config: Ajv2020 + strict:false + allErrors:true + ajv-formats, all schemas/\*.schema.json loaded for $ref resolution):

- templates/spec/behavior-spec.template.json → 2 errors: [(root)] additionalProperties "$comment"; [/meta/confidence] type "must be number".
- templates/spec/acceptance-criteria.template.json → 5 errors: [(root)] "$comment"; [/meta/confidence] type; [/criteria/0],[/criteria/1],[/criteria/2] additionalProperties "$comment". Both templates schema-INVALID. Exactly the 7 errors the finding claims.

ROOT-CAUSE CONFIRMED via schema reads:

- behavior-spec.schema.json line 8 = additionalProperties:false, top-level props = meta/derivation_source/behaviors/cross_links (no $comment) → top-level $comment illegal.
- acceptance-criteria.schema.json line 8 top additionalProperties:false; criteria items line 31 additionalProperties:false, item props lack $comment → criteria-item $comment illegal.
- meta is $ref meta-confidence.schema.json where confidence = {type:number, min 0.0 max 0.98} (lines 51-56) → template's {level, ration

#### [S4] HIGH · D2 Drift · verdict=fix · SA4-templates-schema

- **제목**: behavior-spec 템플릿 schema-INVALID — meta.confidence object≠number + root $comment additionalProperties 위반
- **detail**: Ajv2020 실측(schema-validator 와 동일 설정)으로 2 위반 확정. (1) behavior-spec.template.json:8-11 meta.confidence = {"level":0.85,"rationale":"..."} 객체. meta-confidence.schema.json:51-56 은 confidence: {type:number, 0.0~0.98}. → [/meta/confidence] type must be number. (2) behavior-spec.template.json:1 최상위 $comment. behavior-spec.schema.json:8 root additionalProperties:false (meta-confidence 와 달리 root 는 strict). → [/] additionalProperties $comment. \_base-apply-template/SKILL.md:30 이 본 .json 을 Read 후 fill 하므로 LLM 이 invalid shape 을 seed 로 학습 → gate#2 schema-validator(chain N=gate#N, System Y spec=2) fail 또는 잘못된 모양 emit. 현재 어떤 gate/test 도 templates/ 를 schema-검증하지 않아(release-readiness check21 은 count 만) 잠복 drift.
- **권장**: discovery 템플릿 선례와 동일하게 FIX: (a) meta.confidence → bare number 0.85, (b) 근거는 meta 안 $comment 로 이동(meta-confidence.schema.json:8 additionalProperties:true 라 허용) — 예: meta.confidence=0.85 + meta.$comment="confidence=bare number / discovery-spec UC forward + Phase 4.5 정합", (c) 최상위 $comment(line 1) 제거 또는 의도 설명을 $comment 없이 처리. 미적용 제안 — 후속 unit/세션이 patch. 검증: 본 3 변경 적용 시 Ajv valid=true(실측 확인 완료).
- **검증(high)**: Finding INTACT (not refuted). All claims empirically confirmed via the project's own Ajv2020 (allErrors, addFormats, $ref-resolved across schemas/) at /Users/sangcl/Documents/Development/Study/ai-native-methodology/ai-native-methodology/templates/spec/behavior-spec.template.json:

(1) /meta/confidence must be number — template:8-11 has confidence={level,rationale} object; meta-confidence.schema.json:51-56 requires type:number. CONFIRMED.
(2) root $comment violates additionalProperties — behavior-spec.schema.json:8 has root additionalProperties:false with only meta/derivation_source/behaviors/cross_links; template line 1 $comment is rejected. CONFIRMED. (Note: meta-confidence.schema.json:7-8 has additionalProperties:true and line 260 explicitly lists $comment, so $comment is allowed at meta-level but NOT at root — exactly the finding's distinction.)

Harm/intent (a): Not intended design. discovery template already received this identical fix (cited precedent). Invalid seed is harmful — \_base-apply-template/SKILL.md Step 2 explicitly Reads the .template.json then fills it (confirmed in SKILL.md), so LLM learns invalid shape → gate#2 schema-validator fail at spec stage (chain N=gate#N

#### [S5] HIGH · D2 Drift · verdict=fix · SA4-templates-schema

- **제목**: acceptance-criteria 템플릿 schema-INVALID 5건 — confidence object + root·criteria $comment 위반
- **detail**: Ajv2020 실측 5 위반: [/] $comment(line 1 root additionalProperties:false), [/meta/confidence] type must be number(line 8-11 object), [/criteria/0] $comment(line 19), [/criteria/1] $comment(line 42), [/criteria/2] $comment(line 67). criteria-item 은 acceptance-criteria.schema.json:32 additionalProperties:false — id/behavior_ref/use_case_ref/gherkin 등 cross-link 강제 표면이라 strict 유지가 본질. 따라서 schema 에 $comment 허용 추가(완화)는 drift-attractor 역행 → 부적절. discovery 템플릿(additionalProperties:true root)과 달리 spec 스키마는 더 엄격한데 템플릿은 discovery-스타일 주석을 그대로 차용 = 단계 횡단 비정합.
- **권장**: FIX(schema 완화 ❌, 템플릿 ✅): (a) meta.confidence → 0.85 bare number + 근거를 meta.$comment 로 이동, (b) 최상위 $comment 제거, (c) criteria[0..2] 의 $comment("Example 1/2/3 layer 설명")를 각 criterion 의 기존 description 필드(line 21/43/69 / 자유 string)로 흡수 — 예: AC-DOMAIN-001 description="cross-cut Story anchor (BE+FE 포함)". 실측: 5 변경 적용 시 Ajv valid=true 확인 완료. layer if/then 예시 3종 데이터는 그대로 보존.
- **검증(high)**: Empirically confirmed via Ajv2020 (ajv 8.20.0, the version schema-validator ships) against /Users/.../ai-native-methodology/schemas/acceptance-criteria.schema.json. acceptance-criteria.template.json produces EXACTLY the 5 claimed violations: [/] additionalProperties $comment; [/meta/confidence] type must be number (template has object {level,rationale}); [/criteria/0], [/criteria/1], [/criteria/2] additionalProperties $comment. behavior-spec.template.json fails identically (root $comment + meta.confidence object) = cross-stage systemic drift, also a true problem.

(a) Intended design? No. schema/acceptance-criteria.schema.json:30-31 makes criteria-item additionalProperties:false over the cross-link surface (id/behavior_ref/use_case_ref/gherkin/...) and meta-confidence.schema.json:51-56 requires confidence:number. The schema is unambiguous; the object-shaped confidence and root/criteria $comment are unintended copies of discovery-style comments. Decisive: templates/discovery/discovery-spec.template.json ALREADY uses the corrected pattern (confidence: 0.85 bare number + sibling meta.$comment with rationale) — establishing the spec templates as a stale leftover, not a design choice.

#### [S6] HIGH · D4 오케스트레이션 · verdict=fix · SA1-agent

- **제목**: 종결 핸드오프가 plan stage(chain 3)를 건너뛰고 test-agent로 직접 dispatch — phase-flow next_chain SSOT 위반
- **detail**: agents/spec-agent.md:61 ("chain 4 (test) 진입 권고 → `test-agent` dispatch") + agents/spec-agent.md:82 ("chain 4 (test) 진입 후 → `test-agent` 권한"). 그러나 flows/spec.phase-flow.json:72 next_chain = {id:"plan", flow_file:"plan.phase-flow.json"} 이고 flows/sdlc-4stage-flow.json stages 순서 = analysis→discovery→spec→plan→test→implement. plan stage(chain 3)는 v9.0(DEC-2026-05-21-chain-discovery-plan-stage)에서 spec과 test 사이에 신설됐고 plan-agent.md:43 은 정상적으로 chain-2 산출(behavior-spec+acceptance-criteria)을 입력으로 받아 gate #3 를 돌린다. 즉 spec→plan→test 가 canonical인데 spec-agent의 종결 핸드오프만 미갱신되어 test-agent(chain 4)를 직지명 = plan stage·gate #3 전체를 silent bypass. F-MB-010(planning-spec→discovery-spec rename) 과 동일한 v9.0 cascade 누락 class. release-readiness check24(C12)는 skills superset만 검사하고 dispatch 핸드오프 prose는 어떤 validator도 검사하지 않아(grep 확인: next_chain↔agent-prose 교차검증 validator 부재) silent drift. LLM이 이 핸드오프를 그대로 따르면 plan stage(macro HOW / task 분해 / gate #3)를 통째로 누락 → 결정론 chain 붕괴.
- **권장**: line 61 → "chain 3 (plan) 진입 권고 → `plan-agent` dispatch", line 82 → "chain 3 (plan) 진입 후 → `plan-agent` 권한" 로 교정. 미적용 제안 — discovery-agent.md:56(spec-agent dispatch) 처럼 각 stage-agent 종결 핸드오프를 phase-flow next_chain.id 와 1:1 매핑하도록 통일. 근본 해소책으로 release-readiness 신규 check 후보: 각 <stage>-agent.md 종결 핸드오프에 등장하는 다음 stage agent 명 ⟺ flows/<stage>.phase-flow.json next_chain.id+'-agent' 일치 결정론 검사 (현 C12 skills-superset gate의 prose blind spot 보완).
- **검증(high)**: INCONFIRMED (finding 인정). 모든 핵심 주장 파일 직접 Read 로 검증.

(a) 의도된 설계 아님 / 진짜 해: spec-agent.md:61 = "chain 4 (test) 진입 권고 → `test-agent` dispatch", :82 = "chain 4 (test) 진입 후 → `test-agent` 권한" (verbatim 확인). 그러나 spec.phase-flow.json:70-73 next_chain={id:"plan", flow_file:"plan.phase-flow.json"} 이고, sdlc-4stage-flow.json stages = analysis→discovery→spec→plan→test→implement (spec.depends_on=discovery / plan.depends_on=spec / test.depends_on=plan). plan = chain 3 / gate #3 신설 (v9.0 DEC-2026-05-21, v10.0.0 MAJOR hard gate). plan-agent.md:43 input = behavior-spec.json+acceptance-criteria.json (chain 2 산출, gate #2 go 후) → gate #3 실행 = canonical. spec→plan→test 가 SSOT인데 spec-agent 종결 핸드오프만 test-agent 직지명 = plan stage·gate #3 silent bypass. canonical class 일치 (F-MB-010 = v9.0 cascade 누락 동형).

(b) 다른 자산/validator 미처리: 비대칭 결정적 증거 — discovery-agent.md:56 → `spec-agent`(next_chain 정합), plan-agent.md:90 → `test-agent`(정합), test-agent.md:70 → `implement-agent`(정합). 4 stage-agent 중 spec-agent 만 next_chain.id 와 불일치. C12(check24_agentSkillsPhaseFlowSync) 코드 직접 확인 = frontmatter skills:[] ⊇ phase-flow skills/skill 명만 superset 검사 / 핸드오프 prose(dispatch/진입 권고) 미파싱. next_chain↔agent-prose 교차검증 validator 부재 확인

#### [S7] HIGH · D5 결정론 · verdict=fix · SG1-skills

- **제목**: integrate-deliverables 가 존재하지 않는 'chain.7대.unreferenced' 강제력을 주장 (over-claim / under-enforce)
- **detail**: skills/spec-integrate-deliverables/SKILL.md:51-54 가 'chain-coverage-validator §integration check 가 모든 산출물(inventory 제외)이 ≥1 BHV cross_links/_\_ref/br_refs 에 등장 의무 + 미참조 ≥1 → chain.7대.unreferenced finding(medium)' 라 명시. 그러나 tools/chain-coverage-validator/src/validator.js 실측 finding kinds 전수 = chain.bhv.unknown_uc / uc.no_bhv / ac.unknown_bhv / ac.verifiable_no_tc / bhv.no_ac / behavior.cross_links_empty / _\_coverage.below_threshold / cross_links.broken_path / ap.uncovered_severe — `chain.7대.unreferenced` 부재. cross_links 검사는 오직 'non-empty'(validator.js:127 chain.behavior.cross_links_empty) + path 실재(broken_path)만. 즉 LLM 이 산출물 중 1개만 등록해도 gate#2 통과 = §8.1 strict (SKILL.md:67-74 'BE ≥1 reference') 가 결정론 gate 가 아니라 convention/수동에 불과. spec 단계는 gate 보유 단계라 D5 강제력 환상 = 정확도 직접 영향.
- **권장**: 둘 중 택1. (A enforce) chain-coverage-validator 에 per-artifact 산출물 reference 검사 lane 신설 — output dir 의 산출물(inventory 제외) 각각이 behavior.cross_links.to_analysis_artifacts ∪ behaviors[].(state_transition_ref/decision_table_ref/sequence_ref/br_refs) ∪ AC.related_brs 에 ≥1 등장하는지 대조, 미참조 시 `chain.7대.unreferenced`(medium) emit. (B honest) enforce 미구현이면 SKILL.md:51-54 의 'chain.7대.unreferenced finding(medium)' / '강제' 표현을 '권고(skill 수동 점검)' 로 격하하고 §8.1 strict 절을 '운영 convention, gate 미강제' 로 정직 표기. self-기록 사실 검증 paradigm 정합상 (B) 후 (A) carry queue 권장.
- **검증(high)**: CONFIRMED (not refuted). Verified by direct Read of all relevant sources:

1. FINDING KIND ABSENT — `chain.7대.unreferenced` does not exist anywhere in the codebase. Repo-wide grep for "unreferenced" returns exactly ONE hit: skills/spec-integrate-deliverables/SKILL.md itself. tools/chain-coverage-validator/src/validator.js full finding-kind set = chain.bhv.unknown_uc / chain.uc.no_bhv / chain.ac.unknown_bhv / chain.ac.verifiable_no_tc / chain.ac.verifiable_not_runnable / chain.bhv.no_ac / chain.behavior.cross_links_empty / chain.uc_coverage.below_threshold / chain.bhv_coverage.below_threshold / chain.cross_links.{invalid_path,broken_path,broken_path_warning,path_convention_repo_absolute} / chain.ap.uncovered_severe / + risks/fail-mode/confidence lanes. No per-artifact 산출물 coverage lane.

2. CROSS_LINKS CHECK IS EMPTINESS-ONLY — validator.js:124-131 emits chain.behavior.cross_links_empty (medium) only when to_analysis_artifacts.length===0. validateCrossRefPaths checks only path existence (broken_path) + convention. A single entry passes BOTH. No artifact-by-artifact 산출물 presence comparison. So the SKILL.md:51-54 claim that the validator emits chain.7대.unreferenced and "강제(enforces)" pe

#### [S8] MED · D2 Drift · verdict=fix · SG1-skills

- **제목**: compose-behavior-spec 의 decision-table-validator 경로가 formal-spec/ prefix 누락 — schema/template convention 과 path drift
- **detail**: skills/spec-compose-behavior-spec/SKILL.md:84 가 `node tools/decision-table-validator/src/cli.js .aimd/output/decision-tables/` 로 검증 지시하나, 같은 파일 step 3(line 59) + behavior-spec.template.json:39 + behavior-spec.schema.json:74 의 decision_table_ref convention 은 `.aimd/output/formal-spec/decision-tables/{id}.json`. 입력 §(line 20)도 `decision-tables/*.json`(+state-machines/sequences/invariants) 를 formal-spec/ prefix 없이 나열 = step 3 와 불일치. 실제 산출이 formal-spec/decision-tables/ 에 있으면 line 84 의 검증 명령은 빈 디렉토리를 가리켜 decision-table 5-check 가 no-op. 결정론 self-check 가 헛돈다.
- **권장**: line 84 를 `.aimd/output/formal-spec/decision-tables/` 로 교정. 입력 §(line 20)의 state-machines/sequences/decision-tables/invariants 경로도 step 3·template·schema 와 동일하게 `formal-spec/` prefix 명시 (단일 path convention SSOT 정합).
- **검증(high)**: 인정(refuted=false). 실측 4점 모두 finding 지지.

(1) Path drift 확인 — skills/spec-compose-behavior-spec/SKILL.md:84 `node tools/decision-table-validator/src/cli.js .aimd/output/decision-tables/` 가 formal-spec/ prefix 누락. 같은 파일 step 3(line 59)=`formal-spec phase decision-tables/{br}.json`, template behavior-spec.template.json:39=`.aimd/output/formal-spec/decision-tables/...`, schema behavior-spec.schema.json:72 description, templates/adoption/README.md:149 + 루트 README.md:327(`{경로}/formal-spec/decision-tables/`), workflow/formal-spec.md:178(`output/formal-spec/decision-tables/`) — 6개 canonical source 모두 formal-spec/ prefix. 누락은 line 84 와 input §(line 20) 둘뿐 = outlier drift. 입력 §20 도 finding 기술대로 `state-machines/*.json + sequences/*.json + decision-tables/*.json + invariants/*.ts` 를 prefix 없이 나열.

(2) No-op 해 = 실증 확인 — CLI(tools/decision-table-validator/src/cli.js) 실행 테스트: 존재안하는 dir → `path not found` exit 2(hard fail) / 빈 dir → `0 markdown table file(s)` exit 0(silent no-op). 실제 산출은 formal-spec/decision-tables/ 에 있으므로(workflow/formal-spec.md:170-185 = AI눈 .json + 사람눈 .md 짝) line 84 명령은 빈/부재 dir 가리켜 dmn-check.js 5-check(duplicate/conflict/gap/overlap/type) 가 실 산출물에 안 돈다 = 결정론 self-check 헛돔(D5

#### [S9] MED · D2 Drift · verdict=fix · SA1-agent

- **제목**: revisit 트리거 명칭 `revisit:planning` stale — canonical은 `revisit:discovery` (v9.0 rename 누락)
- **detail**: agents/spec-agent.md:90 "DEC-2026-05-06-round-trip-부분-허용 (revisit:planning 가능)". 그러나 flows/sdlc-4stage-flow.json:103 의 spec 발 revisit edge = {from:"spec", to:"discovery", trigger:"revisit:discovery"}. "planning" stage는 v9.0 에서 "discovery"로 개칭됨(spec.phase-flow.json $comment "v11.0.0 — planning-spec → discovery-spec rename cascade" + memory chain_gate_numbering_canonical). 따라서 spec에서 역이동 가능한 정식 revisit 타깃은 discovery이며 "planning"은 더 이상 존재하지 않는 stage명. (동일 stale가 implement-agent.md:114 에도 `revisit:planning`로 잔존하나 별도 unit.) drift-validator는 phase-flow 파일을 교차참조용으로 제외(normalize-phase-flow.js:19)하고 agent prose의 revisit 명칭은 검사하지 않아 미포착.
- **권장**: line 90 → "DEC-2026-05-06-round-trip-부분-허용 (revisit:discovery 가능)" 로 교정. sdlc-4stage-flow.json revisit_edges 의 trigger 문자열을 SSOT로 인용. 미적용 제안 — implement-agent.md:114 의 동일 `revisit:planning`도 동시 교정 대상으로 cascade 처리(stale stage명 grep sweep: `revisit:planning` 0건이 목표).
- **검증(high)**: Finding confirmed (not refuted). (a) Genuine harm/not intended: spec-agent.md:90 cites `revisit:planning` but the canonical SSOT flows/sdlc-4stage-flow.json:103 defines the spec→discovery revisit edge trigger as `revisit:discovery`. The "planning" stage was renamed to "discovery" in v9.0/v11.0 (discovery.phase-flow.json stage id = "discovery"; no flow retains a "planning" stage id). Self-evident proof it is dead-name drift: skills/implement-verify-test-pass/SKILL.md:45 writes `revisit:planning` yet maps it to "discovery-spec 갱신" — internal contradiction. (b) Not caught by gate#2: tools/drift-validator/src/normalize-phase-flow.js compares phase-flow file pairs on phase ids/outputs/inputs and explicitly excludes _.phase-flow._ cross-refs (line 19-20) and never inspects agent/skill prose revisit-trigger strings, so no gate#2 validator flags it. The same rename trail (DEC-2026-05-27) already fixed spec.phase-flow.mermaid's `revisit:planning→discovery` but missed agent/skill prose. (c) No new drift/regression: the recommended edit is prose-only in an 인용 section, citing the JSON SSOT trigger string — no schema/flow/number coupling. (d) Cannot break baseline 24/24: not a versioned/validat

#### [S10] MED · D2 Drift · verdict=fix · SA2-flow-gate-scenario

- **제목**: gate#2 validator 목록 4-소스 3-way 불일치 (decision-table / --antipatterns / spectral 산포)
- **detail**: 동일 gate#2 의 validator 셋이 4 군데서 제각각: (1) spec.phase-flow.json:48 behavior-diagrams-render.automated_validation = chain-coverage/drift/decision-table/formal-spec-link/schema (spectral·antipatterns 無). (2) spec.phase-flow.json:61 cross_cutting.validators = 위 + spectral-runner (antipatterns 無). (3) sdlc-4stage-flow.json:122 gate#2 = chain-coverage + 'chain-coverage --antipatterns (F-SIM-001)' + drift + decision-table + formal-spec-link + schema (spectral 無). (4) gate-eval.js:20 REQUIRED_VALIDATORS_PER_STAGE.spec = chain-coverage/drift/formal-spec-link/schema (decision-table·spectral·antipatterns 모두 無). 즉 decision-table-validator/--antipatterns lane/spectral 의 gate#2 membership 이 소스마다 다름. 단 requiredValidators() 가 cli.js 에서 import-only(호출 0건, grep 확인)이므로 결정론 block 에는 무영향 = under-enforce 아닌 순수 D2 문서 drift. 그래도 4 소스가 서로 모순 = '누가 봐도 같은 gate' 신뢰 훼손.
- **권장**: validator membership 단일 SSOT 1개 지정(sdlc-4stage gate#2 가 가장 완전 — antipatterns lane 포함) → spec.phase-flow 두 곳은 그 SSOT 포인터로 치환하거나 동일 셋으로 일치. spectral(OpenAPI 있을 때만)·decision-table·antipatterns 의 조건부/항상 여부를 명시. gate-eval REQUIRED 는 advisory 임을 주석 명문화하거나 cli 결선(아래 finding).
- **검증(high)**: Finding INDED (refuted=false). All 4 source citations verified exact against files:
  (1) spec.phase-flow.json:48 automated_validation = chain-coverage / drift / decision-table / formal-spec-link(--chain-mode) / schema — no spectral, no antipatterns. ✓
  (2) spec.phase-flow.json:61 cross_cutting.validators = same + spectral-runner(OpenAPI) — no antipatterns. ✓
  (3) sdlc-4stage-flow.json:122 gate#2 = chain-coverage + 'chain-coverage --antipatterns (F-SIM-001)' + drift(chain mode) + decision-table + formal-spec-link(--chain-mode) + schema — no spectral. ✓
  (4) gate-eval.js:20 REQUIRED_VALIDATORS_PER_STAGE.spec = chain-coverage / drift / formal-spec-link / schema — no decision-table, no spectral, no antipatterns. ✓
  So decision-table / --antipatterns lane / spectral each have inconsistent gate#2 membership across the 4 sources — genuine 4-source mutual contradiction, real D2 drift.

(a) Harm vs intent: Not intended design. Same divergence pattern repeats at gate#1 (discovery.phase-flow.json:40/:53 omit br-cross-consistency-validator that gate-eval.js:19 requires; :53 cross_cutting adds formal-spec-link absent from gate-eval) — confirms systemic, unintentional drift, not deliberate per-source

#### [S11] MED · D2 Drift · verdict=fix · SA4-templates-schema

- **제목**: 단계 횡단 systemic drift — confidence object≠number 패턴이 discovery 와 동일하게 spec 양 템플릿에 재발
- **detail**: discovery-spec.template.json 은 이미 confidence:0.85 bare number + 근거를 meta.$comment 로 두는 올바른 패턴으로 수정됨(실측: templates/discovery/discovery-spec.template.json:8-9). 그러나 spec 양 템플릿은 여전히 confidence object {level,rationale}. 동일 작성자/세션 origin 의 systemic drift 가 spec 단계에 잔존. 단계마다 confidence 표현이 갈리면 \_base-apply-template 가 단계별로 다른 invalid/valid shape 을 LLM 에 주입 = 결정론 저해.
- **권장**: spec 양 템플릿을 discovery 패턴으로 통일(위 두 finding 의 FIX 와 동일 작업). 추가로 후속 가드 제안(미적용): release-readiness 또는 신규 test 에 'templates/_/_.template.json 을 대응 schema 로 schema-validator 통과' 회귀 검사 추가 → 템플릿 schema-invalid 재발을 gate 로 잠금(현재 count-only check21 의 빈틈 보강). 이는 SA4 범위 밖 gate 작업이라 ADD 후보로만 기록.
- **검증(high)**: CONFIRMED real problem; recommendation sound. Empirically validated by running the project's own schema-validator (tools/schema-validator/src/cli.js) against all three templates:

- behavior-spec.template.json → INVALID: `[type] /meta/confidence: must be number` + top-level `[additionalProperties]`. Source: templates/spec/behavior-spec.template.json:8-11 uses object `confidence:{level,rationale}`.
- acceptance-criteria.template.json → INVALID: same confidence type violation + `[additionalProperties] /criteria/0,1,2` (the inline `$comment` keys inside criteria items, which the schema's criteria-item `additionalProperties:false` does not whitelist). Source: templates/spec/acceptance-criteria.template.json:8-11,19,42,67.
- discovery-spec.template.json → VALID (control). Uses bare `confidence:0.85` (templates/discovery/discovery-spec.template.json:8-9).

Root cause confirmed: both spec schemas point `meta` at meta-confidence.schema.json, which mandates `"confidence":{"type":"number",min 0.0,max 0.98}` (meta-confidence.schema.json:51-56). The `meta` `additionalProperties:true` only permits EXTRA keys — it does NOT relax the named `confidence` type:number constraint, so the object form i

#### [S12] MED · D4 오케스트레이션 · verdict=fix · SG1-skills

- **제목**: derive-acceptance-criteria step 6 가 chain 2 에서 test-spec 의존 validator(spec-test-link)를 호출 — 산출 부재로 usage error 확정 + compose 합산 목록과 모순
- **detail**: skills/spec-derive-acceptance-criteria/SKILL.md:123-129 가 step 6 '자동 검증(compose-behavior-spec step 7 에서 합산)' 으로 `node tools/spec-test-link-validator/src/cli.js --behavior --acceptance --test-spec .aimd/output/test-spec.json` 를 지시. 그러나 (1) spec-test-link-validator 는 test→impl gate(chain test/4) validator (README 'chain 3 test gate' + cli.js:24-27 --test-spec 부재 시 exit 2). chain 2(spec) 시점엔 test-spec.json 미존재 → 호출 시 usage error. (2) compose-behavior-spec/SKILL.md step 7 의 실제 합산 validator 목록(line 72-85)엔 spec-test-link-validator 부재 — chain-coverage/drift/formal-spec-link/decision-table 만. 즉 '합산' 주장이 거짓. AC→TC link 검증은 chain 2 에서 chain-coverage-validator 의 chain.ac.verifiable_no_tc 가 이미 담당하므로 본 호출은 단계 오배치.
- **권장**: step 6 에서 spec-test-link-validator 호출 블록 삭제하고, chain 2 시점 검증은 chain-coverage-validator 의 verifiable=true⇔test_case_refs≥1 check (validator.js:94 chain.ac.verifiable_no_tc) 로 위임한다고 명시. spec-test-link-validator 는 chain test(4) generate-test-spec 단계에서 test-spec 산출 후 호출됨을 cross-reference (carry: test 단계 점검 unit 에서 해당 README 의 'chain 3/gate#3' = System Y 'chain 4/gate#4' stale 도 함께 정정).
- **검증(high)**: Finding INPUT-confirmed across all referenced files. (1) skills/spec-derive-acceptance-criteria/SKILL.md:123-129 instructs spec-test-link-validator with --test-spec .aimd/output/test-spec.json as a chain-2 step labeled "(compose-behavior-spec step 7 에서 합산)". (2) tools/spec-test-link-validator/src/cli.js:24-27 hard-requires --acceptance AND --test-spec (exit 2 usage error if missing); test-spec.json does not exist at chain 2/spec (it is generated in chain test/4 by generate-test-spec), so the call fails. (3) README.md:1,5,9 declare it a chain-test (test→impl) gate validator, and gate-eval.js:22 wires it ONLY into the `test` gate, never `spec` — confirming misplacement. (4) The "합산" cross-reference is false: compose-behavior-spec/SKILL.md step 7 (lines 72-85) lists only chain-coverage / drift / formal-spec-link / decision-table; spec-test-link-validator is absent. (5) The recommendation's delegation target is real: chain-coverage-validator/src/validator.js:90-99 emits chain.ac.verifiable_no_tc (high) when a verifiable=true AC has empty test_case_refs — this is the proper chain-2 owner of AC↔TC linkage. Adversarial: not intended design (orphan call producing a load/usage error + a dem

#### [S13] MED · D4 오케스트레이션 · verdict=add · SG1-skills

- **제목**: spec 스킬군이 gate#2 의 severe-AP blocking lane 을 under-wire — related_aps 채움 지시 0 + --antipatterns 플래그 누락
- **detail**: gate#2 의 chain-coverage-validator 는 --antipatterns 입력 시 validateAntipatternCoverage lane 을 돌려 미커버 severe AP 를 `chain.ap.uncovered_severe`(critical) 로 emit + cli.js:121 apFail 로 exit 1 = blocking (F-SIM-001 SonarQube/CodeQL/Snyk 정합). 그리고 acceptance-criteria.schema.json:109-114 에 related_aps[] 필드 존재. 그러나 (1) spec-derive-acceptance-criteria/SKILL.md 는 related_aps 채움을 한 번도 지시하지 않음(grep 0건 — related_brs 만 step 3 에서 다룸), (2) spec-compose-behavior-spec/SKILL.md step 7 의 chain-coverage-validator 호출(line 72-76)이 --antipatterns 플래그 누락 = 본 skill 이 처방하는 self-check 가 AP lane 을 안 돌림. 결과: severe antipattern 회피(본 방법론 5종 이식성 자산의 핵심 'antipatterns.json 회피 목록')가 spec 단계 결정론 wiring 에서 빠짐.
- **권장**: (1) derive-acceptance-criteria 절차에 'severe AP(antipatterns.json severity critical/high) 를 cover 하는 AC 는 related_aps[] 에 해당 AP-\* 등재' step 추가 (related_brs step 3 과 병렬). (2) compose-behavior-spec step 7 의 chain-coverage-validator 호출에 `--antipatterns .aimd/output/antipatterns.json` 추가하여 self-check 가 gate 와 동일하게 AP lane 을 돌리도록 정합.
- **검증(high)**: Finding INFICATED (refuted=false). Verified against source:

(a) Real harm, not intended design: validateAntipatternCoverage (tools/chain-coverage-validator/src/validator.js:239-280) emits chain.ap.uncovered_severe at the AP's own severity (critical/high); cli.js:120-121 makes apFail blocking (exit 1). The backward-link source related_aps[] exists in schemas/acceptance-criteria.schema.json:109-114. CONFIRMED: spec-derive-acceptance-criteria/SKILL.md never instructs filling related_aps (grep related_aps across skills/ = 0). CONFIRMED: spec-compose-behavior-spec/SKILL.md step 7 (lines 72-76) calls chain-coverage-validator WITHOUT --antipatterns. Ran the logic: when --antipatterns absent, the lane returns ap_input_missing:true with 0 findings (validator.js:241-246), so the skill's prescribed self-check provably never exercises the AP lane. This is a genuine determinism wiring gap for severe-AP avoidance (one of the methodology's 5 portability assets).

(b) Not already handled elsewhere: gate-eval.js is sentinel-in/reason-out only (line 60 'validator 실행은 caller 책임') — it does NOT run validators, it consumes pre-computed critical/high counts. The canonical gate#2 matrix (flows/sdlc-4sta

#### [S14] MED · D4 오케스트레이션 · verdict=add · SA2-flow-gate-scenario

- **제목**: drift-validator 가 gate 매트릭스/cross_cutting.validators 를 비교하지 않음 — 위 2 drift 가 silently uncaught
- **detail**: normalize-phase-flow.js (line 61-87) 는 phases/depends_on/inputs/outputs/artifactFiles 만 정규형으로 추출해 JSON↔mermaid two-eyes 비교에 쓰고, compare-phase-flow.js 에 validator/gate/cross_cutting 비교 코드 0건 (grep 'validator|gate|automated_validation|cross_cutting' = 빈 결과). 따라서 SEED-3 scenario drift 와 gate#2 validator 4-소스 불일치 둘 다 어떤 validator 도 잡지 못함 = release-readiness 24/24 통과해도 노출 안 됨. 이것이 본 drift 들이 오래 잔존한 구조적 이유. chain-driver-deterministic-axis 원칙상 도구 비교는 결정론 적격.
- **권장**: drift-validator 에 cross-flow gate consistency lane 신설 (결정론): 각 gate id 별 (a) sdlc-4stage gates[].validators ⊇/= 해당 stage phase-flow.json cross_cutting.validators, (b) gate-eval REQUIRED_VALIDATORS_PER_STAGE[stage] ⊆ 문서 validators, (c) scenario 키 존재 여부를 set 비교. LLM 판단 inject 금지(STRONG-STOP 정합) — 순수 문자열 set diff 만. 미적용 제안.
- **검증(med)**: 진단(diagnosis)은 실측으로 확정 — 인정(refuted=false). 단 권장 조치는 그대로 구현 불가(caveat med).

[확정된 사실]

1. drift-validator phase-flow 비교기는 phases/dependencies/artifact_files 만 비교. /tools/drift-validator/src/compare-phase-flow.js + normalize-phase-flow.js 에서 grep 'validator|gate|automated_validation|cross_cutting' = 빈 결과(확인). (cross_cutting 은 check-phase-skills.js 가 .aspects.skills 만 읽음 — validators 는 어디서도 비교 안 함.)
2. SEED-3 scenario drift 실재: gate-eval.js 에 S1/S2/S3/greenfield 분기(SCENARIO_EXPECTED + scenario param) 다수, flows/sdlc-4stage-flow.json scenario 언급 0건. 이미 ledger SEED-3=candidate 로 등재.
3. gate#2 validator 다중소스 불일치 실재: gate-eval REQUIRED.spec=4(chain-coverage,drift,formal-spec-link,schema) vs sdlc gates[#2]=6(+ap-coverage,decision-table) vs spec.phase-flow cross_cutting=6(+decision-table,spectral) vs 同 automated_validation=5. 어떤 자동 검사도 이 4소스 정합을 보지 않음.
4. scripts/release-readiness.js 24개 check 중 cross-flow gate/validator 정합 검사 0개(확인). → baseline 24/24 통과해도 노출 안 되는 구조적 사각이 실재. 추가 lane 이므로 24/24 회귀 위험 없음(additive). chain-driver-deterministic-axis 정합(순수 비교).

[권장 조치 caveat — med 근거]
(a) 'gate-eval REQUIRED ⊆ 문서 validators' lane = 이미 trivially 만족(실행 4 ⊆ 문서 6). 절대 fire 안 함 → 가치 0, 잉여.
(b) 'sdlc g

#### [S15] MED · D5 결정론 · verdict=fix · SA3-validators

- **제목**: checkLinks BE-mode 연산자 우선순위 버그 — decision_tables 의도가 모든 카테고리 .json 으로 누설(false-positive br-id-pattern-mismatch)
- **detail**: check-links.js:40 `if (category === 'decision_tables' && linkPath.endsWith('.md') || linkPath.endsWith('.json'))` — JS 우선순위상 `(category==='decision_tables' && .md) || .json` 로 파싱되어, state_machines/sequence_diagrams/invariants 의 .json link 도 분기 진입. node 실증: category='state_machines', linkPath='UC-FOO-001.json' → 분기 true, basename 'UC-FOO-001' 이 ^BR-...$ 미스매치. 현재는 linkedRules.length>0 가드가 테스트 fixture(related_rules 빈배열, link.test.js:80 User.json)에서 우연히 막아 latent. 비-decision-table .json link 의 parent item 에 related_rules/finding_refs 가 존재하면 spurious 'link.br-id-pattern-mismatch'(non-breaking) emit — 결정론 validator 가 거짓 finding 생성. 영향 경로=BE-mode(analysis formal_spec_links) — gate#2 chain-mode 와는 별개 경로지만 동일 파일 결함.
- **권장**: 괄호 교정: `if (category === 'decision_tables' && (linkPath.endsWith('.md') || linkPath.endsWith('.json')))`. 회귀가드로 state_machines .json + 비어있지 않은 related_rules fixture → 0 br-id-pattern-mismatch 골든 테스트 추가. (미적용 — 제안만)
- **검증(high)**: Finding CONFIRMED (not refuted). check-links.js:40 `if (category === 'decision_tables' && linkPath.endsWith('.md') || linkPath.endsWith('.json'))` has a genuine operator-precedence bug — JS parses it as `(category==='decision_tables' && .md) || .json`, so ANY non-decision-table category (state_machines/sequence_diagrams/invariants) with a .json link enters the br-id branch. Empirically reproduced via node: category='state_machines', link='UC-FOO-001.json', parent related_rules=['BR-FOO-001'] (non-empty) → 1 spurious `link.br-id-pattern-mismatch` (severity non-breaking). (a) Real harm, not intended design: a deterministic gate validator fabricating a false finding on a schema-valid artifact directly violates D5/"누가 돌려도 같은 품질". The trigger is realistic — the shipped templates/analysis/openapi-extension.template.json ALREADY uses `.json` for state_machines (Order.json) and sequence_diagrams (UC-ORDER-CREATE.json), basenames that fail ^BR-...$; only the incidental absence of related_rules/finding_refs (both schema-permitted, commonly co-present) stops it firing today. (b) No other gate#2 validator covers this — this is the sole BE-mode br-id check; chain-mode is a separate (correct) co

## Refuted findings (5)

**R1.** [med·D4] gate#2 required validator 매트릭스에 decision-table-validator·spectral-runner 누락 + requiredValidators dead-import

- 기각: 기계 사실은 대부분 정확하나 핵심 주장(D4 "gate#2 결선 공백 / decision-table 강제 못함")과 권장 (a)의 효력이 성립하지 않아 기각.

검증된 사실(모두 참): (1) flows/spec.phase-flow.json: cross_cutting.validators=6종(decision-table·spectral 포함), automated_validation=5종(decision-table 포함). (2) tools/chain-driver/src/gate-eval.js:20 REQUIRED_VALIDATORS_PER_STAGE.spec=4종(ch

**R2.** [med·D2] SEED-3 scenario-aware gate doc drift — gate-eval.js 8회 scenario 분기 vs flow gate 매트릭스 0회

- 기각: 반증 인정. 사실 자체(gate-eval.js scenario 분기 풍부 vs flow gate 매트릭스 0 hit)는 실측 확인됨 — gate-eval.js:42-46 SCENARIO_EXPECTED freeze(S1/greenfield/S2/S3) + per_tc_outcome(v11.11.0) + snapshot_green / flows/sdlc-4stage-flow.json scenario·greenfield 0 hit. SA3 validator 3종(chain-coverage·decision-table·formal-spec-link) 모두 scenario-b

**R3.** [low·D2] compose-behavior-spec line 13 'chain 1 (planning)' = discovery rename 잔존 stale (F-MB-010 cascade miss)

- 기각: PARTIALLY refuted — the finding bundles one valid micro-fix with one actively harmful recommendation whose core rationale is factually false; as a unit it fails the adversarial test.

REC #1 (VALID, low): skills/spec-compose-behavior-spec/SKILL.md:13 'chain 1 (planning) 종결 + gate #1 go' — the parenthetical '(planning)'

**R4.** [low·D2] discovery gate#1 validators 가 br-cross-consistency-validator 누락 (코드>문서 역방향 drift)

- 기각: Factual claims are TRUE: gate-eval.js:19 discovery REQUIRED = [discovery-extraction, schema, br-cross-consistency] (mirrored in findings-aggregator/aggregator.js:12 + asserted in aggregator.test.js:36), gate-eval.js:95-103 emits a real layer2_threshold block (deterministic enforcement of Adzic dual-representation), and

**R5.** [low·D2] formal-spec-link chain-mode id-pattern(\d+) 이 schema(^...-[0-9]{3}$)보다 loose — softer mirror 불일치

- 기각: Factual regex divergence is REAL and confirmed: check-links.js ID_PATTERN uses `-\d+$` (lines 195-199) while behavior-spec/acceptance-criteria schemas + id-conventions SSOT mandate `-[0-9]{3}$` exactly 3 digits (schema lines 35/41/46; id-conventions lines 65-68,88). Node test confirms BHV-FOO-1/-12/-1234 pass fslv but
