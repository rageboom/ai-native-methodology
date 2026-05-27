# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:
- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

## [11.0.1] — 2026-05-27 PATCH — F-162 analysis-from-figma verbatim 검증 의무화 (외부 dogfood 발견)

> ★ δ Type 2 외부 consumer repo (mis-fe-admin EAM 통합권한조회) 실전 dogfood 에서 자연 표면화한 첫 corrective fix. `feedback_self_referential_corrective_drift.md` 가 명시적으로 기다리던 외부 채널 발견 → self-referential drift 아님 → 본 cycle fix 정당.

### 배경 (F-162)

`analysis-from-figma` 는 `discovery-from-figma` 가 가진 source-grounded 의무 (LLM 추론 금지 / node 실 인용 / grep_hit 검증) 를 **비대칭으로 결여**. `figma-extract.schema.json` 에 TEXT 노드의 verbatim 표시 텍스트 (`characters`) 를 담을 필드조차 없어, 라벨/버튼/헤더를 `get_metadata` layer name + OpenAPI 파라미터로 **추론**해 채우는 silent fallback 허용. 실 피해: consumer repo spec md 가 추론 라벨을 "✅ Figma 검증 완료" 로 GO-STOP gate 통과 → cycle 13 Figma MCP `get_design_context` 실 verbatim 추출 결과 spec ≠ Figma 갭 8건 실증.

### Fixed

- **`schemas/figma-extract.schema.json`**: `components[]` 에 `text_content` (verbatim 표시 텍스트 / TEXT 노드 의무) + `provenance` (`verbatim` | `inferred`) 필드 추가. `name` description 에 "레이어명 ≠ 표시 텍스트" 명시. (optional 추가라 기존 산출 호환 — PATCH)
- **`skills/analysis-from-figma/SKILL.md`**: 절차 2 verbatim 의무화 + 절차 3 silent skip 금지 (TEXT 노드 sub-frame `get_design_context` 재호출 의무) + provenance 태깅. "산출 자격 조건" 절 신설 (TEXT verbatim 의무 / inferred 금지 대상 / inferred 비율 > 0 시 finding+gate 노출). scope-out 의 "추정 ❌" 을 텍스트 라벨까지 확대.
- **`methodology-spec/finding-system.md`**: F-162 등록 (Status: resolved / schema+SKILL fix / validator 신설은 carry).

### Carry (δ 후속)

- analysis-figma 전용 source-grounded validator 신설 (`discovery-extraction-validator` 패턴 차용 / provenance=inferred 비율 임계 hard gate).
- 동형 비대칭 점검: `analysis-from-swagger` / `analysis-from-prompt` 등 다른 input-adapter 의 source-grounded 의무 일관성.

---

## [11.0.0] — 2026-05-26 MAJOR — v11.0.0 paradigm cascade 본격 시행 종결 (8 결단 + 5 chain stage 산출물 본격 통합)

> ★ ★ ★ ★ ★ session 48차 paradigm SSOT 확립 + session 49차 schema/skill body cascade + 본 session 안 Phase 2f-prime + sub-phase + Phase 3 + Phase 4 + Phase 5 본격 시행 종결. v11.0.0 MAJOR breaking — `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename + BE/FE 산출물 분리 paradigm 본격 + Epic/Story/Task(OP-*)/Sub-task(TASK-*) 4-level cascade + ticket=plan stage 한 곳 (R20-prime) + contract 강제 양 axis (BE swagger / FE state-map+DTCG).
>
> ## 8 결단 본격 시행 종결
>
> | # | 결단 | 시행 |
> |---|---|---|
> | 1 | `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename | ✅ schema/skill/tool/PoC 모두 cascade |
> | 2 | BE/FE 산출물 분리 paradigm (stage 별 axis 다름) | ✅ schema if/then 강제 본격 |
> | 3 | ticket = plan stage 한 곳 (R20→R20-prime) | ✅ skills/ticket-sync SKILL.md 본문 재설계 |
> | 4 | UC 유지 (User Story 추가 부재) | ✅ |
> | 5 | Epic = FE 화면 단위 (또는 BE-domain) | ✅ task-plan.epic_refs 본격 |
> | 6 | Story = cross-cut anchor (BE+FE/DB/E2E) | ✅ task-plan.story_refs + AC.story_ref |
> | 7 | OP-* (Story sibling Task entity) 신설 + TASK-*=Sub-task 명시 | ✅ operational-task.schema.json + task-plan.op_task_refs |
> | 8 | contract 강제 양 axis (BE swagger / FE state-map+DTCG) | ✅ schema if/then layer 1/2/3 hard gate |
>
> ## 본 session 시행 (Phase 2f-prime + sub-phase + Phase 3 + Phase 4 + Phase 5)
>
> ### Phase 2f-prime — `skills/ticket-sync/SKILL.md` 본문 재설계
> - 5 stage matrix (analysis/planning/spec/test/implement) × 2 phase 본격 폐기
> - **plan stage 단일** 4-level cascade 일괄 (Epic + Story + OP-* + TASK-*) 본문 본격
> - phase enum: `enter` / `exit` / `update-test-red` / `update-impl-green`
> - stage paradigm 위반 시 reject (`F-TICKETSYNC-012 stage_paradigm_violation`) 본격 정합
> - 환경 resolve prelude (DWPD issuetype_map / parent_strategy / epic_link_customfield_id / Sub-task auto-inherit B14 / Structure 자동 B15) 본격 보존
>
> ### sub-phase — `tools/planning-extraction-validator` → `tools/discovery-extraction-validator` rename
> - `git mv tools/planning-extraction-validator tools/discovery-extraction-validator`
> - workspace npm rename + package.json name + bin name 본격
> - chain-driver REQUIRED_VALIDATORS_PER_STAGE.discovery 본격
> - flows + scripts/release-readiness + 활성 docs 모두 cascade
> - backward-compat alias (`--planning` flag / `transformPlanningExtraction` function alias / dispatchValidator case 'planning-extraction-validator') 본격 보존
>
> ### Phase 3 — template body 본격 채움
> - `templates/planning/` → `templates/discovery/` rename (`git mv`)
> - `templates/spec/` 신설
> - **13 신규 template body** (`.json` + `.md` 이중 렌더링 / ADR-008 v2):
>   - `templates/discovery/discovery-spec.template.{json,md}` (2)
>   - `templates/spec/behavior-spec.template.{json,md}` + `acceptance-criteria.template.{json,md}` (4)
>   - `templates/plan/task-plan.template.{json,md}` + `epic-story-op.template.md` (3)
>   - `templates/test/test-spec.template.{json,md}` (2)
>   - `templates/implement/impl-spec.template.{json,md}` (2)
> - `templates/README.md` 본격 갱신 (5 chain stage 본격 활성)
> - `skills/_base-apply-template/SKILL.md` 인식 artifact list 21 → 27 (analysis 21 + chain 6) 본격 확장 + chain stage prerequisite 명시
>
> ### Phase 4 — 10 PoC sweep 본격
> - `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename × **10 PoC** (poc-03 / poc-04-mini / poc-05 / poc-06 / poc-07 / poc-08 / poc-09 / poc-10 / poc-11 / poc-14)
> - `derivation_source.planning_spec_path` → `discovery_spec_path` sed batch × 10 PoC (acceptance-criteria + behavior-spec + task-plan)
> - release-readiness `poc_corroboration` discovery-spec.json 우선 인식 본격
> - release-readiness `ANALYSIS_VALIDATOR_TARGETS` set 안 discovery-spec.json 본격 추가 + planning-spec.json legacy carry
> - `analysis_validator_violation` 본격 해소 (20 violations → 0)
> - `validators_violation` poc-05 chain-coverage cmd discovery-spec.json 본격 전환
>
> ### Phase 5 — v11.0.0 release
> - CHANGELOG entry 본 표기
> - version 3-way sync 10.1.1 → 11.0.0
> - workspace test 746/746 pass ✅
> - release-readiness **22/22 ready** ✅
> - skill-citation 0 stale ✅
>
> ## breaking change scope (★ v11.0.0 MAJOR 자격)
>
> ### 직접 breaking
> - 산출물 file 명 `planning-spec.{json,md}` → `discovery-spec.{json,md}` (10 PoC + active doc 정합)
> - schema `derivation_source.planning_spec_path` → `discovery_spec_path` (behavior-spec / acceptance-criteria / task-plan)
> - workspace tool `tools/planning-extraction-validator` → `tools/discovery-extraction-validator` (npm package + bin name)
> - `templates/planning/` → `templates/discovery/` + `templates/spec/` 신설
> - `methodology-spec/deliverables/17-planning-spec.md` → `17-discovery-spec.md`
> - skills/ticket-sync SKILL.md 본문 paradigm 본격 재설계 (5 stage matrix 폐기 / plan 단일 본격)
>
> ### backward-compat carry
> - tools/discovery-extraction-validator/src/cli.js — `--planning` flag alias 보존 (deprecated / 차기 v12.x retract)
> - tools/findings-aggregator — `transformPlanningExtraction` function alias + `'planning-extraction-validator'` dispatchValidator case 보존
> - release-readiness `poc_corroboration` discovery-spec.json OR planning-spec.json (legacy 둘다 인식)
>
> ## STOP-3 + paradigm 적합 점검
>
> | STOP-3 | 상태 |
> |---|---|
> | workspace test 746/746 pass | ✅ |
> | release-readiness 22/22 ready | ✅ (analysis_validator_violation 해소 + poc_corroboration 갱신) |
> | skill-citation 0 stale (245 active doc) | ✅ |
> | version 3-way 11.0.0 | ✅ (CHANGELOG + plugin.json + version-check 3-way) |
> | breaking 본격 (MAJOR 자격) | ✅ (8 결단 본격 cascade) |
>
> ★ ★ ★ ★ ★ **paradigm 본격 진전** (self-referential corrective drift ❌) — v11.0.0 MAJOR 본격 cascade 종결. session 48차 paradigm SSOT → session 49차 schema/skill body cascade → 본 session Phase 2f-prime + Phase 3 + Phase 4 + Phase 5 종결. self-celebration inflation ❌ — 본격 prod 가치 진전 paradigm 결단 8종 시행 종결.
>
> ## Lessons Learned (자산화)
>
> - **LL-v110-04** (template skill citation false-positive) — template 안 placeholder ADR/UC/BHV ID 가 skill-citation-validator 의 `\bADR-(?:[A-Z]+-)?\d{1,3}\b` 패턴 매칭 → 실 ADR 부재 시 stale citation 오류. 해소 = `ADR-<scope>-NNN` 등 `<` 포함 placeholder syntax 사용 (FP_LINE regex `<[a-z-]+>` 정합).
> - **LL-v110-05** (1 session 안 MAJOR release cascade 본격 자격) — paradigm 본격 진전 (8 결단 시행) + ≥ 22/22 release-readiness + ≥ 745+ workspace test + 0 stale citation + 3-way version sync 동시 충족 시 본격 자격. LL-v930-02 cap (1 session 1 MAJOR) 본격 정합.

---

## [10.1.1] — 2026-05-26 PATCH — C-v4.1-poc-재실행 부분 종결 (5 PoC task-plan 생성 / plan-agent e2e 입증)

> 사용자 "마지막 carry 처리하자" → option A 채택 (5 가능 PoC 전부 + spec 부재 5 = 서브-carry). additive PoC artifact / methodology 무변경 / breaking 0 = PATCH.
>
> v10.0.0 plan-agent 본격 구현 후에도 미해소였던 C-v4.1-poc-재실행 carry. 점검 결과 5 PoC (poc-03/04-mini/05/11/14) 만 prerequisite (behavior-spec + AC) 보유. 나머지 5 PoC (poc-06/07/08/09/10) 는 spec stage 미실행 = 서브-carry.
>
> | PoC | tasks | ADRs | risks | NFR | 특성 |
> |---|---|---|---|---|---|
> | poc-04-mini | 1 | 1 | 2 | 3 | FE Login + JWT (Zod ADR) |
> | poc-05 | 2 | 1 | 4 | 4 | signup + login (argon2 ADR) |
> | poc-03 | 2 | 2 | 4 | 4 | RealWorld NestJS (argon2 + JWT ADR) |
> | poc-14 | 4 | 2 | 4 | 4 | user + todo (IDOR 차단) |
> | poc-11 | 6 | 2 | 5 | 4 | ★ 사내 EFI-WEB billing characterization mode |
> | **합계** | **15** | **7** | **18** | **19** | — |
>
> - **schema 정합**: task-plan.schema.json VALID 5/5 (task granularity 1-3 AC / ADR alternatives ≥3 / risks severity enum / NFR ISO 25010:2023 9 characteristic).
> - **Type 1 self-run corroboration ≥ 5** (§8.1 strict ≥ 2 충족 / chain harness plan stage e2e 입증 / 다른 도메인+stack 단일 PoC 과적합 회피).
> - **STOP-3**: release-readiness 20/20 (보존) + skill-citation 0 stale + version 3-way 10.1.1 + breaking 0 = PATCH.
> - **잔여 서브-carry**: poc-06/07/08/09/10 (spec stage 미실행 / 각 PoC × behavior-spec + AC 실행 의무 = task-plan 보다 더 heavy / v10.x).
>
> DEC-2026-05-26-poc-task-plan-5. Partial resolve C-v4.1-poc-재실행 (5/9 = 56%).

## [10.1.0] — 2026-05-26 MINOR — discovery-from-{figma, swagger, nl-md} 3 SKILL.md body 본격 구현 (DEC-2026-05-26-input-skill-roles §2 carry 종결)

> 사용자 "잔여 적용" 결단 (v10.0.4 trigger carry 보류 권고 override) → option α 본격. additive doc / breaking 0 / 신규 기능 = MINOR.
>
> v10.0.4 가 paradigm (analysis-from-* baseline ↔ discovery-from-* scope 진입 timing/책임 분리) 만 명문화하고 `discovery-from-{figma, swagger, nl-md}` 3종은 light placeholder 로 두었던 것을 **본격 SKILL.md body 작성**. `discovery-from-analysis-output` (v9.0.0 본격 / 137 line) pattern 정합 / 책임 범위·입력·산출·no-simulation·절차·인용 6 섹션.
>
> | skill | source 채널 | UC 추출 | NFR axis | line |
> |---|---|---|---|---|
> | `discovery-from-figma` | figma file + selected frame | MCP 4 도구 → frame nodes → 사용자 flow | 부 (a11y/responsive/transition) | ~70 |
> | `discovery-from-swagger` | openapi.yaml / swagger.json | OpenAPI parse → operation 별 summary/description → UC + I/O contract + schema constraint | 부 (security/rate-limit/SLA) | ~65 |
> | `discovery-from-nl-md` | markdown 기획문서 / in-conversation NL | structural parse (heading/paragraph/sentence index) → 사용자 flow 패턴 | ★ **1차 채널** (NL 만이 명시 NFR) | ~80 |
>
> 각 entry source_grounded_evidence 의무: figma=`figma:<file_id>:<node_id>` / swagger=`openapi:<path>:<operationId>` / nl-md=`doc:<filepath>:<para>:<sentence>` 또는 `prompt:<message_id>:<line>`. 산출 = `.aimd/output/planning-spec.json`. LLM fabrication ❌ (특히 nl-md NFR — verbatim quote 권장 + `planning-extraction-validator` grep_hit_count > 0 강제).
>
> - **동반 doc 갱신**: `methodology-spec/lifecycle-contract.md` §Input 어댑터 timing 분리 (4 모두 본격) + `guides/first-prompt-cookbook.md` §2.1 timing note + `decisions/DEC-2026-05-26-input-skill-roles.md` §2 carry resolved 표기.
> - **STOP-3**: release-readiness 20/20 (보존) + skill-citation 0 stale + version 3-way 10.1.0 + breaking 0 = MINOR.
> - **잔여 carry**: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy validation / v10.x / Type 1 self-run).
>
> DEC-2026-05-26-discovery-input-bodies. Resolves DEC-2026-05-26-input-skill-roles §2 carry.

## [10.0.4] — 2026-05-26 PATCH — C-v4.1-input-skill-이관 결단 종결 (analysis-from-* ↔ discovery-from-* timing 분리 paradigm / option α light)

> 사용자 "최초에 분석은 analysis 에서 하는데 한번 분석이 끝난 프로젝트는 그냥 다양한 input 을 받도록 하고 싶다" → option α light 채택. additive doc / breaking 0.
>
> **paradigm 명문화** (baseline-delta 운영 모델 입력 측면 / v10.0.1 정합):
>
> | set | timing | 책임 | skill |
> |---|---|---|---|
> | `analysis-from-*` (4) | 최초 1회 (legacy baseline 수립) | analysis 산출물 (visual-manifest / inventory / domain 등 canonical global) | `analysis-from-{figma, swagger, prompt, plan-doc}` ★ 모두 본격 구현 |
> | `discovery-from-*` (4) | 신규 건마다 (scope 진입 trigger) | UC + intent + flow → planning-spec | `discovery-from-{analysis-output(★본격), figma(light placeholder), swagger(light), nl-md(light)}` |
>
> 같은 source(figma/swagger/NL md) 라도 baseline 시 vs scope 진입 시 = **다른 목적/다른 산출**. 양쪽 set 평행 유지 / 중복 ❌ / 다른 axis ✅.
>
> - **시행** (additive doc / breaking 0):
>   - `skills/discovery-from-{figma, swagger, nl-md}/SKILL.md` 3 placeholder description 갱신 (paradigm 반영 + analysis-from-* timing 분리 명시 + use case 트리거 carry 표기).
>   - `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 다음에 **§Input 어댑터 timing 분리** 신설 (두 set 평행 표).
>   - `guides/first-prompt-cookbook.md` §2.1 discovery 섹션 timing 분리 note.
>   - `decisions/DEC-2026-05-21-chain-discovery-plan-stage-도입.md` carry 표 `C-v4.1-input-skill-이관` ✅ 종결 표기 + option α light 결단 명시.
> - **STOP-3**: release-readiness 20/20 ready (보존) + skill-citation 0 stale + version 3-way 10.0.4 + breaking 0 = PATCH.
> - **잔여 carry (use case 트리거 의존)**: `discovery-from-{figma, swagger, nl-md}` 본격 구현 = 해당 채널로 scope 진입하는 실 사용자 등장 시 별도 PATCH/MINOR. 현 사내 배포 전 단계 ROI 정합 (light placeholder 유지). 그 외: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy / v10.x).
>
> DEC-2026-05-26-input-skill-roles. Resolves C-v4.1-input-skill-이관.

## [10.0.3] — 2026-05-26 PATCH — 잔여 carry quick wins 종결 (macOS env test fix + session-재시작-검증 표기)

> 사용자 "남은 carry 처리하자" → 잔여 4 carry 정밀 점검 → Quick wins(env + session-LL) 채택. corrective / breaking 0.
>
> - **env test fix**: `tools/chain-coverage-validator/src/validator.js` `autoDetectProjectRoot` cross-platform path normalization. POSIX `dirname()` 이 `\` 를 path separator 로 안 봐서 Windows path 입력 시 `'.'` 반환 → dirname **전** backslash→slash 정규화로 해소. → `node --test tools/chain-coverage-validator/test/validator.test.js` **38/38 pass** (이전 37/38) / **release-readiness 19/20 → 20/20 ready**.
> - **C-v4.1-session-재시작-검증 종결 표기**: DEC-2026-05-21 carry 표 안 해당 row 에 ✅ + LL-v4-04 자산화 location 명시 (DEC-05-17 + DEC-05-21 등재 완료 / protocol 자산 = 별도 코드/문서 작업 없음).
> - **STOP-3**: workspace all pass + release-readiness **20/20** + skill-citation 0 stale + version 3-way 10.0.3 + breaking 0 = PATCH.
> - **잔여 carry (사용자 결단 보류)**: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy / v10.x) + C-v4.1-input-skill-이관 (figma·swagger 실 중복 / discovery-from-figma 는 v4.1 PLACEHOLDER 그대로 / 3 옵션 결단 의무).
>
> DEC-2026-05-26-quick-carry-close.

## [10.0.2] — 2026-05-26 PATCH — v10.0.0 gate 재번호 prose+flow coherence (이전 session WIP 통합 + prose 전면 정합)

> v10.0.0 이 machine 층(stage-graph gate map #1~#5)만 하고 **개별 phase-flow gate phase + plan agent/skills/templates + guides·README·lifecycle prose** 를 미정합으로 남긴 drift 청산. corrective / breaking 0.
>
> **발견 경위**: 사용자 "WIP부터 같이 들여다보자" → working tree 의 이전 session 중단 작업(plan-stage gate 정합 WIP) 분석 → v10.0.0 의 chain N = gate #N 가 phase-flow 렌더링 + plan agent/skills + guides·README·lifecycle prose 까지 전파 안 됨 발견. drift-validator 가 chain-flow master mermaid + 개별 phase-flow gate 번호 vs stage-graph map 정합 을 안 봐 v10.0.0/v10.0.1 STOP-3 통과한 잔존 (제 v9.0.1 코herence redux 패턴).
>
> **번호 규칙 확정**: chain N = gate #N 1:1 (#1 discovery / #2 spec / **#3 plan** / #4 test / #5 implement) / "gate id ≠ chain" framing 폐기 / plan placeholder · deferred 표기 전면 해제.
>
> - **WIP 통합** (이전 session 중단 작업 / 정합 + 정확): `flows/plan.phase-flow.{json,mermaid}`(plan **gate-3 phase 추가** / 다른 flow 와 구조 대칭) + `flows/test.phase-flow.{json,mermaid}`(gate-3 → **#4**) + `flows/implement.phase-flow.{json,mermaid}`(gate-4 → **#5**) + `agents/plan-agent.md`("gate #plan/deferred" → "gate #3 hard gate 활성") + `skills/plan-{decompose-and-sequence,risk-and-nfr}/SKILL.md` + `templates/README.md` + `templates/plan/`(신규).
> - **prose 정합 11 파일**:
>   - `methodology-spec/lifecycle-contract.md`: OUTPUT block(plan #3 / test #4 / impl #5) + 5영역 plan row 본격 + 매핑 매트릭스 plan row 본격(skills 7 + gate #3 + plan-coverage-validator) + data-contract plan 절 placeholder 해제 + tree + traceability TASK layer + gate #1~#4 → #1~#5.
>   - `methodology-spec/skills-axis.md`: §4·§7.2·§9.2 plan placeholder 해제 (plan-agent skills 7 / chain 3 본격).
>   - `methodology-spec/id-conventions.md`: plan ID = task-plan TASK-*/ADR-*.
>   - `methodology-spec/deliverables/22-traceability-matrix.md`: gate #1~#5 + TASK layer.
>   - `README.md`: CHAIN block(plan #3 / test #4 / impl #5) + scenario plan step 본격 + validator block(gate #1~#5 + plan-coverage-validator) + tree placeholder 해제.
>   - guides 4종: `chain-harness-guide.md` mermaid + sequenceDiagram + "gate id ≠ chain" 폐기 / `getting-started.md` 5-5 plan 본격 + gate 번호 / `first-prompt-cookbook.md` 2.3 Chain 3 plan skill-map / `common-errors.md`(검증).
>   - briefing 2종: `01-main.md` flow 다이어그램 + skill tree + "5번의 게이트" / `slides/methodology-deck.md` value block + flow + chain 책임 표 + revisit 8 + asset 표 + multiagent.
>   - `flows/README.md`: master SSOT "5 gate (chain N = gate #N)" + plan.phase-flow 본격.
> - **STOP-3**: drift state-flow(6=6) + chain-layout(5 stage / **31 phase** = +1 plan gate-3) + phase-flow 짝(plan/test/implement) 0 breaking + release-readiness 19/20(env fail 1 = macOS Windows-path test / 본 PATCH 무관) + skill-citation 0 stale + version 3-way 10.0.2 + breaking 0 = PATCH.
>
> DEC-2026-05-26-gate-renumber-coherence. Resolves v10.0.0 phase-flow + prose drift 잔존 (machine 층 완성 후 렌더링/prose 미정합).

## [10.0.1] — 2026-05-26 PATCH — baseline-delta 운영 모델 문서화 (v4.1 폐기 브랜치 carry 점검 → 실행)

> 사용자 "정리해줘 그리고 carry 실행해줘". 폐기된 v4.1 브랜치(feat/v4.1-*) 개념을 현 main(v10.0.0)과 대조한 결과, discovery/plan stage·hooks 정합·plan-agent·traceability 확장은 v9.0.0~v10.0.0 에서 모두 완성. **유일 미해소 깨끗한 doc carry = DEC-2026-05-21 `C-v4.1-baseline-delta-운영-문서화`** 실행. additive doc / breaking 0.
>
> - **신설**: `methodology-spec/baseline-delta-operating-model.md` — "초기 1회 full analysis + 신규 건 delta 갱신" 운영 모델.
>   - 두 baseline axis 구분: 분석 baseline(canonical global `.aimd/output/`) vs 품질 baseline(`baseline-<date>.json` / ADR-010 ratchet).
>   - 운영 cadence 3단계: 초기 full 1회 → 신규 건 scope delta(`related_artifacts` 상속 / 재분석 ❌) → 레거시 변경 시 변경 영역만 재분석 + M4 `sync_state` + `chain-driver sync` 통제 cascade.
>   - baseline carry 규약: 단일 source 참조 / drift 자동감지·cascade 수동 / 품질 baseline 단조(ratchet up) / iter-N carry(`inherited_from.carry_artifacts`).
>   - 70~80% axis 정합 (운영 모델 = process cadence / metric 불변).
> - **carry resolve**: DEC-2026-05-21 carry 표 `C-v4.1-baseline-delta-운영-문서화` ✅ 종결 표기 + DEC-2026-05-26-baseline-delta-operating-model 신설.
> - **STOP-3**: workspace 737/737(보존) + release-readiness target 10.0.1 + skill-citation 0 stale + version 3-way 10.0.1 + breaking 0 = PATCH.
> - **carry (점검 중 식별)**: poc-재실행(기존 PoC plan-spec 추가 / v10.x) + input-skill-이관(`analysis-from-*` ↔ `discovery-from-*` 공존 처분 결단) + lifecycle-contract plan placeholder prose drift(v10.0.0 잔존 점검).
>
> DEC-2026-05-26-baseline-delta-operating-model. Resolves DEC-2026-05-21 §carry C-v4.1-baseline-delta-운영-문서화.

## [10.0.0] — 2026-05-25 MAJOR — Phase 4-4' axis A plan stage paradigm 본격 구현 (★ ★ gate 번호 재정렬 widespread breaking / chain N = gate #N 1:1 INTERNAL CONVENTION) + cooling-off paradigm 영구 폐기 재확인

> session 47차 / 본 conversation 안 5 commit cluster 통합 + 1 release ceremony.
>
> **trigger 발화 chain** (★ paradigm dispute → 본격 시행):
> 1. 사용자 "이번 session 에서 뭐하면 되나" → "Phase 4-4' 준비 (plan 작성만)"
> 2. plan-mode 시행 → `~/.claude/plans/jiggly-mapping-hopper.md` 작성 완료
> 3. ExitPlanMode 후 사용자 "진행" → ★ paradigm STRONG-STOP signal 보고 → option A (차기 session 시행)
> 4. 사용자 "cooling-off 를 왜하는건가?" → ★ ★ paradigm 메타 dispute
> 5. 사용자 "cooling-off 아예 없애도 되는거 아닌가?" → AskUserQuestion ★ A. 폐기 + ★ B. 본 conversation Cluster 2~5 시행
>
> **★ ★ ★ ★ ★ ★ ★ paradigm 본격 결단** (★ session 47차 prod 가치 진전):
> - **cooling-off paradigm 영구 폐기 재확인** (DEC-2026-05-25-cooling-off-영구-폐기-재확인) — v2.2.0 (2026-05-08) "패기해줘" 폐기 → v9.x 재도입 cycle (19일 만) → v10.0.0 폐기 재확인 / paradigm-without-teeth 본격 입증 (actual 발동 case 0 / 사용자 push back 2회 / 본 레포 cadence 5 release/1day)
> - **chain N = gate #N 1:1 INTERNAL CONVENTION 본격 정합** (DO-178C SOI / IEC 62304 isomorphic 사상 / 직접 standard 표기 ❌ / official-docs-checker REVISE-1 흡수)
>
> **시행 — 5 Cluster commit (★ widespread breaking)**:
>
> | Cluster | scope | commit |
> |---|---|---|
> | 1 (★ 외부 session) | B1+B2 stage-graph.js gate 재번호 (plan='#3' / test='#4' / impl='#5') + state.schema.json enum +'#5' / +'plan' | `e5c8672` |
> | 2 | B4+B5 sdlc-4stage-flow.json revisit_edges 8→9 + gate 재번호 + plan.phase-flow.json placeholder=false + 2 DEC 신설 + INDEX 갱신 | `676f948` |
> | 3 | B3+B6 ADR-CHAIN-001 chain 4단계→5단계 + ADR-CHAIN-002 4 gate→5 gate + plan gate prompt | `142852e` |
> | 4 | B7 F-CHA-001 trio integration test 6 시나리오 신규 (validator critical + cli exit 1 + hooks deny + trio 통합 + gate enum 정합 + requiredValidators) | `568bcb2` |
> | 5 | B8 CLAUDE.md + README + agents-axis + chain-driver/README sweep + release-readiness #18+#19+#20 신규 criterion | `4e28619` |
>
> **★ ★ ★ ★ ★ ★ ★ STOP-3 달성**:
> - workspace test **737/737 pass** (731 → 737 / +6 / F-CHA-001 trio integration test 신규)
> - **release-readiness 20/20 ready:true** (17 → 20 / #18 gate_enum_consistency + #19 legacy_4_stage_expression_absent + #20 plan_gate_operational 신규)
> - drift-validator 7 pair / 0 breaking / state-flow consistency PASS / chain layout PASS
> - skill-citation 0 stale (★ DEC-2026-05-25-axis-a-phase-4-4-prime 신설로 회복)
> - version 3-way 10.0.0 (CHANGELOG / plugin.json / package.json)
>
> **★ BREAKING CHANGE**:
> - gate.id enum 의미 재할당 — test '#3'→'#4' / implement '#4'→'#5' / plan '#3' 신규
> - state.json 영속 last_gate.stage='plan' 신규 진입 자격 (외부 사용자 state.json reset 또는 manual migration 의무 / 실측 poc-14: last_gate=null 영향 ❌)
> - plan.phase-flow.json version 0.1.0-placeholder → 1.0.0
> - cooling-off ≥24h paradigm = ★ ★ 영구 폐기 재확인 (★ 재도입 자격 ≥2 PoC corroboration + Adzic SBE strict 정합 의무 / 사실상 ❌)
>
> **★ ★ ★ paradigm 메타 인지** (★ session 47차 paradigm 진화 본격):
> - **LL-v1000-01** — cooling-off paradigm-without-teeth 본격 입증 (actual 발동 case 0 / 사용자 push back 2회 / DEC-2026-05-08 "패기해줘" 19일 만 재도입 cycle 차단)
> - **LL-v1000-02** — paradigm 부활 cycle = self-referential corrective drift 의 본격 paradigm 사례 (★ AI 가 ★ 영구 폐기된 paradigm 을 ★ 19일 만 재도입 carry note 안에 표기 = paradigm honesty 위배)
> - **LL-v1000-03** — 사용자 메타 질문 = STRONG-STOP signal + ★ paradigm dispute 자격 (Auto Mode 안에서도 메타 dispute 자격 보고 의무)
> - **LL-v1000-04** — paradigm 격상 자격 = ≥2 PoC corroboration + Adzic SBE strict 정합 의무 (1 사건 일반화 + AI persona 권고 + industry case 단순 인용 = paradigm 격상 자격 부재)
> - **LL-v1000-05** — INTERNAL CONVENTION paradigm framing 본격 정합 (chain N = gate #N 1:1 / DO-178C SOI / IEC 62304 isomorphic / 직접 standard 표기 ❌ / official-docs-checker REVISE-1 흡수)
>
> **★ session 안 4 release cap (LL-v930-02) 정합**: session 47차 = ★ 본 v10.0.0 release **1회** (Cluster 1 외부 session e5c8672 + Cluster 2~5 본 conversation = 통합 1 release).
>
> **차기 carry**:
> - Phase 4-5 (v10.1.0 MAJOR / ticket subsystem 6-stage migration / Type 2 외부 사용자 ≥1 corroboration trigger 의무 / deadline 없음 / OSS 채택 의존)
> - methodology-spec/ + decisions/ + schemas/ + history doc + skill SKILL.md 안 "4단계" 표현 잔존 (≈25 files / historical SSOT 보존 / 별 patch release carry 자격)
> - DEC-2026-05-25-axis-a-phase-4-4-prime + DEC-2026-05-25-cooling-off-영구-폐기-재확인 2 DEC SSOT 보존
>
> Resolves F-CHA-001 본격 해소 (Senior BLOCKER-2 trio integration test 6/6 pass) + F-CHA-003 5 axis 본격 해소 (gate 번호 재정렬 + state.schema enum + flows + ADR + RR criterion).

---

## [9.3.0] — 2026-05-25 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-4 minimal (★ gate #plan trio enforcement 본격 활성 / Senior BLOCKER-2 잔여 본격 해소 / additive only / breaking 0)

> session 46차 연속 4번째 release / v9.2.0 직후 사용자 "다음 진행" + "B cooling-off retract" + "추천 (옵션 1 minimal)" 결단 → Phase 4-4 minimal scope 본격 시행.
>
> **★ ★ paradigm 메타 인지** (LL-v930-01): decision_cadence_24h_cooling_off paradigm retract 자격 본격 ✓ — minimal scope (additive only / breaking 0) + Senior BLOCKER-2 잔여 본격 해소 + 사용자 명시 결단 trigger. ★ ★ Phase 4-4 full scope (Cluster 1 X gate 번호 재정렬 widespread breaking) = ★ retract 자격 ❌ / 별 session v10.0.0 MAJOR cooling-off 의무.
>
> **시행** (additive only / breaking 0 / Senior BLOCKER-2 잔여 본격 해소):
> - **stage-graph.js `getGateForStage('plan')` = null → '#plan'** (1 line / generic trio mechanism 본격 작동 자격 확보 / 번호 부여 ❌ / Cluster 1 X 재번호 = Phase 4-4' v10.0.0 MAJOR carry)
> - **test +1** — `tools/chain-driver/test/stage-graph.test.js` line 41 갱신 + v9.3.0 신규 test (★ '#plan' string ID + Cluster 1 번호 부여 ❌ 정합 검증)
> - **DEC-2026-05-25-axis-a-phase-4-4 신설** (Phase 4-4 minimal scope SSOT)
>
> **★ 본격 변경 ❌ axis** (LL-v911-01 minimal scope 정합 / Phase 4-4' + 4-5 carry):
> - gate 번호 재정렬 (Cluster 1 X / discovery #1 / spec #2 / plan #3 / test #4 / impl #5) = Phase 4-4' v10.0.0 MAJOR carry
> - flows/sdlc-4stage-flow.json revisit_edges 갱신 (8 → 10) = Phase 4-4' carry
> - ADR-CHAIN-002 §1 gate UX prose 갱신 = Phase 4-4' carry
> - state.schema.json gate enum 갱신 = Phase 4-4' carry
> - ticket subsystem 6-stage migration = Phase 4-5 carry
>
> **STOP-3**: workspace 730 → **731/731 pass** (chain-driver 224 → 225 / +1) + skill-citation 0 stale + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.3.0 + breaking 0 = MINOR.
>
> **3 LL 자산화**:
> - **LL-v930-01** — cooling-off retract 자격 paradigm 본격 입증 (decision_cadence "큰 구조 결단만 24h / additive only 즉시" 정합 / Senior BLOCKER-2 잔여 minimal scope retract 자격 ✓ / full scope = 별 session 의무)
> - **LL-v930-02** — session 안 4 release 연속 cadence 본격 paradigm (★ session 43차 4 release self-referential corrective cycle 와 본격 차이 = paradigm-level prod 가치 진전 vs doc drift fix / ★ 단 4 release cap 본격 의무)
> - **LL-v930-03** — Node.js assert API 정합 paradigm (assert.notMatch ❌ / assert.doesNotMatch ✅ / test 작성 시 본격 API 정합 검증 의무)
>
> **본 session 누적 4 release** = v9.1.0 + v9.1.1 + v9.2.0 + v9.3.0.
>
> **carry (Phase 4-4' + 4-5 / 차기 session)**:
> - Phase 4-4' (v10.0.0 MAJOR / ★ ★ cooling-off ≥24h 의무 / structural / widespread breaking) — gate 번호 재정렬 (Cluster 1 X) + flows revisit_edges 갱신 + ADR-CHAIN-002 prose + state.schema gate enum
> - Phase 4-5 (v10.1.0 MAJOR / breaking + ★ ★ Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> DEC-2026-05-25-axis-a-phase-4-4. Resolves F-CHA-001 부분 해소 (plan gate ID 신설로 generic trio mechanism 본격 활성 자격 / 통합 test = Phase 4-4' carry) + F-CHA-003 Phase 4-4 minimal 부분 해소.

---

## [9.2.0] — 2026-05-25 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-3 시행 (★ DO-178C 6 layer 격상 / additive only / breaking 0)

> session 46차 연속 진입 (v9.1.1 직후) / 사용자 결단 "진행" → Phase 4-3 본격 시행. 5 release 분산 cadence (Phase 4-1~4-5).
>
> **★ ★ ★ Cluster 3 결단 본격 시행** — **AC → TASK → TC** paradigm 정합 (DO-178C 5 tier → 6 layer 격상 / System Req ↔ HLR ↔ LLR ↔ Source ↔ Test → UC ↔ BHV ↔ AC ↔ **TASK** ↔ TC ↔ IMPL).
>
> **시행** (additive only / breaking 0 / Senior risk #4 본격 흡수):
> - **A6 `schemas/traceability-matrix.schema.json` cell.task_id additive** — pattern `^TASK-[A-Z0-9_-]+-[0-9]{3}$` / optional (required ❌) / additionalProperties:false strict 정합 (properties 안 추가)
> - **A6 `tools/traceability-matrix-builder/src/builder.js` TASK layer 매핑** — `chain.taskPlan ?? null` optional input + `taskByAC` index (1 AC = 1 task / first-match / 1~3 AC 묶음 paradigm 정합) + cell.task_id 채움 (taskPlan 있을 때만) + derived_from 안 'task-plan.json' 추가
> - **test +3** — `tools/traceability-matrix-builder/test/builder.test.js`:
>   1. backward compat (taskPlan 부재 시 cell.task_id 부재 / 회귀 0)
>   2. green cell + task_id (taskPlan 입력 시 cell.task_id 채움)
>   3. yellow cell + task_id (impl missing 시 task_id 채움 / Senior risk #4 — additive only)
> - **DEC-2026-05-25-axis-a-phase-4-3 신설** (Phase 4-3 SSOT)
>
> **★ Senior risk #4 본격 흡수** (LL-v920-01): DO-178C 6 layer 격상 시 기존 PoC ratchet 분모 미영향 본격 보장 = task_id optional + first-match 매핑 + cell-level 추가만 (required ❌ / 분모 변경 ❌). 기존 PoC #05 + #14 회귀 0 본격 보장.
>
> **STOP-3**: workspace 727 → **730/730 pass** (traceability-matrix-builder 82 → 85 / +3 TASK layer test) + skill-citation 0 stale + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.2.0 + breaking 0 = MINOR.
>
> **3 LL 자산화**:
> - **LL-v920-01** — TASK layer additive only paradigm 본격 입증 (Senior risk #4 회피 / DO-178C 6 layer 격상 + 기존 PoC 분모 미영향 본격 보장)
> - **LL-v920-02** — schema field add MINOR cadence paradigm 본격 입증 (optional schema field + properties 안 추가 + required 불포함 = backward compat / criterion add precedent 동형)
> - **LL-v920-03** — 3 release 연속 cadence 본격 입증 (session 46차 v9.1.0 + v9.1.1 + v9.2.0 / additive only / cooling-off ❌ 자격 본격 / Phase 4-4 v10.0.0 MAJOR = structural / cooling-off ≥24h 의무)
>
> **본 session 누적 3 release** = v9.1.0 (Phase 4-1) + v9.1.1 (Phase 4-2) + v9.2.0 (Phase 4-3).
>
> **carry (Phase 4-4~4-5 / 차기 session)**:
> - Phase 4-4 (v10.0.0 MAJOR / ★ cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 + revisit_edges + gate #plan trio enforcement (★ Senior BLOCKER-2 잔여)
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + ★ ★ Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> DEC-2026-05-25-axis-a-phase-4-3. Resolves F-CHA-003 Phase 4-3 부분 해소 (traceability TASK layer 종결 / 5 axis 종결 / gate trio + ticket migration = Phase 4-4+4-5 carry).

---

## [9.1.1] — 2026-05-25 PATCH — axis A plan stage paradigm 본격 구현 Phase 4-2 시행 (additive only / breaking 0)

> session 46차 연속 진입 (v9.1.0 직후) / 사용자 결단 "gogo" → Phase 4-2 본격 시행. 5 release 분산 cadence (Phase 4-1~4-5).
>
> **시행** (minimal scope / additive only / breaking 0):
> - **A4 `agents/plan-agent.md` body** (placeholder → body) — frontmatter `skills:` 7 skill 사전 주입 (3 plan-* + 4 base utility / spec-agent.md 동형 paradigm) / 책임 범위 + Absolute priorities 7개 + 호출 절차 8 step + 산출 자산 4종
> - **A5 `tools/chain-driver/src/gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.plan 추가** — `plan: ['plan-coverage-validator', 'schema-validator']` 1 line additive
> - **test +1** — `tools/chain-driver/test/gate-eval.test.js` `requiredValidators('plan')` 본격 검증 test 신규
> - **DEC-2026-05-25-axis-a-phase-4-2 신설** (Phase 4-2 SSOT)
>
> **★ minimal scope 본격 결단** (LL-v911-01):
> - hooks-bridge.js TRIGGER_PATTERNS = 이미 v9.0.0 안 plan stage 등록 ✅ (추가 시행 ❌)
> - stage-graph.js getGateForStage('plan') = null 유지 (★ Cluster 1 X 재번호 = Phase 4-4 v10.0.0 MAJOR carry)
> - gate-eval outcome enforcement plan 분기 = ★ plan-coverage-validator 자체 안 본격 작동 / gate-eval generic findings (critical/high/medium/coverage_pct) 본격 작동 = 추가 분기 ❌
>
> **STOP-3**: workspace 726 → **727/727 pass** (chain-driver 223→224 / +1 신규 plan validator test) + skill-citation-validator **0 stale** (plan-agent body 신규 cross-ref 모두 existing) + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.1.1 + breaking 0 = PATCH.
>
> **2 LL 자산화**:
> - **LL-v911-01** — minimal scope Phase 본격 진입 paradigm (A4 body + A5 1 line additive / 본격 변경 ❌ axis 본격 식별 = quality risk 회피 + roll-back 자격 본격 보장)
> - **LL-v911-02** — 후속 Phase 의 자연 cadence 본격 입증 (Phase 4-1 의 자연 후속 = 같은 session 안 본격 연속 시행 자격 / "gogo" 결단 / additive only / cooling-off ❌ / 별도 DEC + 별도 release entry = paradigm 정합)
>
> **carry (Phase 4-3~4-5 / 차기 session)**:
> - Phase 4-3 (v9.x MINOR / additive) — A6 traceability subtask_ids.chain3_plan additive
> - Phase 4-4 (v10.0.0 MAJOR / cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 + revisit_edges + gate #plan trio enforcement (★ Senior BLOCKER-2 잔여 carry)
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> DEC-2026-05-25-axis-a-phase-4-2. Resolves: F-CHA-003 Phase 4-2 부분 해소 (agent body + validator 등록 완료 / gate trio enforcement + traceability layer = Phase 4-3~4-4 carry).

---

## [9.1.0] — 2026-05-25 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-1 시행 (★ ★ ★ ★ ★ paradigm-level / additive only / breaking 0)

> session 46차 / 사용자 결단 "PoC 안 할꺼야 / 플러그인 적용 못했던 것 위주" + "axis A 본격 paradigm 명시 직접 응답" + "β cadence" + "진행" → ★ ★ paradigm-level 결단 (45차 carry "ζ-1 의식적 제외" 본격 retract). 4원칙 ladder full (Phase 1.1~1.6 깊이 숙지 + plan.md 작성 / Phase 2 3 agent 병렬 토론 / Phase 3 묶음 결단 Cluster 1~8 / Phase 4-1 본격 시행).
>
> **Phase 2 3 agent 본격 결과**:
> - Senior **REVISE-2 @ 0.81** — 2 BLOCKER (Phase 4-3 v10.0.0 scope 본격 과대 → 분리 cadence / gate #plan trio enforcement silent sink → exit code contract 명시) + 5 risk + Cluster 4 수정
> - 공식 docs **REVISE-1/2/3** (BLOCKING ❌) — DO-178C 6 layer GREEN + severity_floor 사내 해석 명시 / Nygard ADR 5 기준 "≥30% task 영향" 오귀인 → 사내 구체화 + 보안/규제 axis 추가 / ISO 25010 SQuaRE 8 → 9 (2023 Safety 신설) / estimation 표준 외 신설 paradigm
> - Industry **isomorphic GREEN** + REVISE-1 — 6 production cases (GitHub Copilot Workspace Task→Spec→Plan→Code / Cursor Plan Mode Shift+Tab / Aider /ask↔/code + Architect mode / AWS AI-DLC Workflow / ThoughtWorks GenAI for forward engineering / GitHub Community #142971) / Plan stage 산업 production 다수 isomorphic 본격 입증
>
> **Cluster 1~8 본격 결단** (사용자 묶음 결단 / Phase 3 종결):
> - 1 (gate 번호): X (재번호) + 분리 cadence — Phase 4-4 단독 v10.0.0 carry
> - 2 (NFR severity floor): high+critical + 사내 해석 표기 — DO-178C GREEN
> - 3 (TASK 위치): AC→TASK→TC — DO-178C 6 layer 정합
> - 4 (cross-cut): task→ADR + AC↔NFR 양방향 + task→RISK + adr→behavior 역방향 — Senior REVISE-2
> - 5 (ticket 동반): 분리 carry (v10.1.0 MAJOR) — Senior BLOCKER-1
> - **6 (산출물 명명)** ★ 사용자 명시: **`task-plan.json`** (Senior 권고) — discovery (planning-spec) ↔ plan (task-plan) 명독 분리
> - **7 (ADR 5 기준 출처)** ★ 사용자 명시: Nygard 5 category 기반 사내 구체화 + 보안/규제 axis 추가
> - **8 (Type 2 carry deadline)** ★ 사용자 명시: v10.1.0 release 자격 = Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> **Phase 4-1 본격 시행** (additive only / breaking 0 / Senior REVISE 흡수 + 공식 docs REVISE 흡수 + Industry REVISE 흡수):
>
> - **A1 `schemas/task-plan.schema.json` 신설** — planning-spec.schema.json template 차용 / meta + derivation_source + tasks[] + adrs[] + risks[] + nfr_allocation[] + rollback_strategy + cross_links / additionalProperties:false strict / task granularity schema-level enforce (ac_refs.maxItems:3) / alternatives ≥3 schema-level enforce / ISO 25010:2023 SQuaRE 9 enum (Safety 신설) / Nygard 5 category + security_compliance enum
> - **A2 `tools/plan-coverage-validator` workspace 신설 (npm 21번째)** — exit code contract (0=ok / 1=blocking / 2=usage-error / Senior BLOCKER-2 흡수) + 5 validator 함수 (validateTaskCoverage + validateNfrAllocation + validateTaskGranularity + validateDependencyCycle + validateRiskSeverity) + **28/28 test pass** (5 suite 23 unit + 1 suite 5 Senior BLOCKER-2 integration scenario)
> - **A3 plan-* 3 skill body** (placeholder → body) — `plan-decompose-and-sequence` (task 분해 + DAG topological sort) + `plan-architect-decisions` (ADR 작성 / Nygard 5 category 사내 구체화 + 보안/규제 axis) + `plan-risk-and-nfr` (3중 망 risk + NFR allocation hard gate + rollback)
> - **DEC-2026-05-25-axis-a-phase-4-1 신설** (★ 본 release 의 paradigm SSOT)
>
> **STOP-3**: workspace **726/726 pass** (698 → 698+28 / 무회귀) + skill-citation-validator **0 stale** (DEC 신설 후 7 dead-link 해소) + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.1.0 + breaking 0 = MINOR.
>
> **carry (Phase 4-2~4-5 / 차기 session)**:
> - Phase 4-2 (v9.x PATCH / additive) — A4 plan-agent body + A5 chain-driver stage-graph/gate-eval plan 분기
> - Phase 4-3 (v9.x MINOR / additive) — A6 traceability-matrix subtask_ids.chain3_plan additive
> - Phase 4-4 (v10.0.0 MAJOR / cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 + revisit_edges
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> **4 LL 자산화**:
> - **LL-v910-01** — self-referential corrective drift retract paradigm 본격 입증 (45차 carry "ζ-1 의식적 제외" 의 본격 retract / 사용자 명시 결단 trigger + paradigm-level scope + release-readiness criterion add 가 아닌 stage 본격 신설)
> - **LL-v910-02** — β cadence 본격 활용 paradigm (paradigm-level 결단 시 Phase 1~3 본 session / Phase 4 시행 차기 session default / 단 사용자 명시 "진행" 시 retract 자격 — additive only scope 한정)
> - **LL-v910-03** — Senior BLOCKER-2 exit code contract paradigm 본격 입증 (plan-coverage-validator exit code contract 본격 명시 + ≥ 5 통합 test 의무 = drift-validator silent sink LL-v903-01 + chain-coverage-validator default projectRoot LL-v904-01 동형 paradigm 회피)
> - **LL-v910-04** — 3 agent 병렬 토론 본격 paradigm 입증 (Senior REVISE-2 + 공식 docs REVISE-1/2/3 + Industry isomorphic GREEN 3 axis 본격 토론 정합 / Senior 2 BLOCKER 흡수 → Phase 4-3 v10.0.0 scope 본격 축소)
>
> DEC-2026-05-25-axis-a-phase-4-1. Resolves: F-CHA-003 (plan stage paradigm 위배) Phase 4-1 부분 해소 (schema + validator + skill body / agent body + gate + traceability = Phase 4-2~4-5 carry).

---

## [9.0.6] — 2026-05-24 MINOR — Phase 2 LL-v903 follow-up 묶음 (LL-v903-01 scope-out + LL-v903-03 release-readiness #17 marketplace.json stage sync + LL-v906-01/02 자산화)

> v9.0.5 release 직후 사용자 결단 "진행 하자" → "A. 모두 순차 (3 release)" → Phase 2 = 본 v9.0.6 MINOR. additive criterion / breaking 0. criterion add precedent v8.6.0/v8.9.0 일관 MINOR.
>
> **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v5 / 5회 연속 재발)**: v9.0.3 carry note "LL-v903-01 drift-validator silent sink → exit ≥ 1 hard gate 전환" 시행 직전 사실 검증 시 ★ ★ ★ 사실 오류 발견 — `tools/drift-validator/src/cli.js:292` `process.exit(totals.breaking > 0 || totals.errors > 0 ? 1 : 0)` ★ 이미 hard gate. v9.0.3 점검 명령 `node ... 2>&1 | tail -30; echo "EXIT=$?"` 의 `$?` = ★ tail 의 exit code (= 0 / 정상), drift-validator 자체 exit code 가 아님 (bash pipe + tail exit code misunderstand).
>
> **사용자 묶음 결단**: D1 LL-v903-01 scope-out (★ 사실 오류 / 이미 hard gate) / D2 LL-v903-03 시행 — release-readiness check17 신설 / D3 silent test sink 정정 (release-readiness.test.js 13→17) / D4 v9.0.6 MINOR release.
>
> **시행** (additive criterion / breaking 0):
> - **LL-v903-03 시행**: `scripts/release-readiness.js` `check17_marketplaceStageSync()` 함수 신설 + main results array 추가. 검사 대상 = `.claude-plugin/marketplace.json` `plugins[0].description`. 검사 axes 3종: ① "6단계 chain harness" 또는 "6-stage chain harness" 표기 (regex) ② 5 stage name (discovery/spec/plan/test/implement) 모두 포함 ③ legacy "planning →" 미포함. delegated_to = MAJOR stage change cascade enforcement.
> - **LL-v906-02 silent test sink 정정**: `scripts/test/release-readiness.test.js` 가 hard-coded 13 → 실 16/17 stale 누적 carry 발견. workspace test (`npm test --workspaces`) 가 `scripts/test/` 미포함 = silent test sink. **시행**: hard-coded 13 → 17 갱신 (3 location) + criterion ids array 4 추가 (code_pointer_coverage + graph_integrity + preflight_tools + marketplace_stage_sync). 10/14 fail → **14/14 pass** ✅.
> - **release ceremony**: plugin.json + package.json 9.0.5 → 9.0.6 (3-way sync) + CHANGELOG 본 entry + DEC-2026-05-24-v906-marketplace-stage-sync-check + INDEX 최상단 + STATUS session 43차 v9.0.6 entry + CLAUDE.md sync.
>
> **STOP-3**: workspace 698/698 pass (보존 / scripts/test/ 미포함 = LL-v906-02 carry) + release-readiness.test.js **14/14 pass** (10→14 / 4 fail fix) + release-readiness **17/17 ready:true** (16→17 / check17 신설 통과) + chain-coverage-validator 38/38 (보존) + skill-citation 0 stale (보존) + drift-validator 0 breaking (보존) + version 3-way 9.0.6 + breaking 0 = MINOR.
>
> **3 LL 자산화**:
> - **LL-v906-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v5 (5회 연속 재발 / LL-fsim-11 + LL-v902-01 + LL-v903-01(scope-out 본격 입증) + LL-v904-01 + LL-v905-01 정합 / paradigm enforcement 본격 입증대 v5 / ★ carry note 자체도 검증 의무 / bash pipe + exit code 사실 misunderstand 회피 cadence)
> - **LL-v906-02** — silent test sink paradigm 본격 발견 (`scripts/test/` workspace test 외 / `npm test --workspaces` 미포함 → release-readiness.test.js stale 누적 carry / v+1 carry — workspace 통합 또는 hook gate enforcement)
> - **LL-v906-03** — criterion add cadence paradigm 본격 정착 (v8.6.0 #14 preflight + v8.9.0 #15 graph + v8.9.0 #16 code-pointer + v9.0.6 #17 marketplace = MINOR 일관 / semver 정합 additive)
>
> **차기 session carry** (deadline 없음):
> - F-MB-POC-002 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / cooling-off ≥ 24h)
> - LL-v906-02 follow-up (`scripts/test/` silent sink — workspace 통합 또는 hook gate)
> - F-SIM-003 strict_mode v+1 default 전환 = v9.0.7 Phase 3 (본 session 안 시행 중)
>
> DEC-2026-05-24-v906-marketplace-stage-sync-check. Resolves LL-v903-03 + LL-v903-01 (scope-out).

## [9.0.5] — 2026-05-24 PATCH — Phase 1 F-MB-POC-001 5 PoC sweep (v7.0.0 rules.json → business-rules.json rename PoC 산출물 미전파 / 시행 직전 사실 검증 보강 paradigm 재발 v4)

> v9.0.4 release 직후 사용자 결단 "진행 하자" → "A. 모두 순차 (3 release)" 묶음 결단 → Phase 1 = 본 v9.0.5 PATCH. additive doc / breaking 0.
>
> **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v4 / 4회 연속 재발)**: v9.0.4 carry note "poc-03 산출물 drift 별 plan" single PoC 가정이 시행 직전 사실 검증 시 5 PoC 광범위 drift 로 진화 (poc-03 + 06/07/08/11 모두 v7.0.0 `rules.json` → `business-rules.json` rename 미전파 / F-PA-002 의 PoC 산출물 axis sub-finding) + poc-08/11 더 깊은 별 convention drift 추가 발견 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker).
>
> **사용자 묶음 결단**: D1 5 PoC sweep / D2 poc-08+11 잔여 = F-MB-POC-002 carry (Y 옵션 / Senior 의도 의문 cooling-off 권장) / D3 v9.0.5 PATCH release.
>
> **시행** (additive doc / breaking 0):
> - **poc-03 special case** (2 종류 drift): `examples/poc-03-realworld-nestjs/.aimd/output/{planning,behavior,test}-spec.json` `examples/poc-03-realworld-nestjs/` repo-absolute prefix 제거 + `output/rules/rules.json` → `output/rules/business-rules.json` (replace_all sweep)
> - **poc-06/07/08 + poc-11**: `examples/poc-{06,07,08}-*/​.aimd/output/planning-spec.json` + `examples/poc-11-*/​.aimd/output/{planning,behavior}-spec.json` `input/rules.json` → `input/business-rules.json` (replace_all sweep)
> - **release ceremony**: plugin.json + package.json 9.0.4 → 9.0.5 + CHANGELOG 본 entry + DEC-2026-05-24-v905-poc-rules-rename-sweep + INDEX 최상단 + STATUS session 43차 v9.0.5 entry + CLAUDE.md sync.
>
> **★ ★ ★ self-corroboration ≥ 3 PoC full fix (§8.1 strict 정합 ✓)**:
> | PoC | v9.0.4 baseline | v9.0.5 after |
> |---|---|---|
> | poc-03 | 14 broken | **0 broken** ✅ |
> | poc-06 | 2 broken | **0 broken** ✅ |
> | poc-07 | 2 broken | **0 broken** ✅ |
> | poc-08 | 10 broken | 9 broken (1 fix / path 안 메타 embed 9 잔여 → F-MB-POC-002 carry) |
> | poc-11 | 11 broken | 7 broken (4 fix / "[source absolute]" prefix 7 잔여 → F-MB-POC-002 carry) |
>
> **STOP-3**: workspace 698/698 pass (보존) + chain-coverage-validator 38/38 (보존) + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift-validator 0 breaking (보존) + version 3-way 9.0.5 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
> - **LL-v905-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v4 (LL-fsim-11 + LL-v902-01 + LL-v903-01 + LL-v904-01 정합 / 4회 연속 재발 / paradigm enforcement 본격 입증대 v4)
> - **LL-v905-02** — Senior 의도 의문 cooling-off paradigm 본격 정착 (poc-11 "[source absolute]" prefix marker / Adzic SBE 함정 회피 cadence)
> - **LL-v905-03** — partial fix + carry 명시 paradigm (§8.1 strict 충족 + 잔여 별 axis)
>
> **차기 session carry** (deadline 없음):
> - F-MB-POC-002 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / Senior 의도 의문 cooling-off ≥ 24h)
> - LL-v903-01 + LL-v903-03 follow-up = v9.0.6 Phase 2 (drift-validator hard gate + release-readiness #1 marketplace.json grep)
> - F-SIM-003 strict_mode v+1 default 전환 = v9.0.7 Phase 3 (본 v9.0.5 fix 후 자연 가능)
>
> DEC-2026-05-24-v905-poc-rules-rename-sweep. Resolves F-MB-POC-001.

## [9.0.4] — 2026-05-24 PATCH — G axis F-SIM-003 carry corrective + 시행 직전 사실 검증 보강 paradigm 본격 재발 v3 (F-MB-VAL-001 chain-coverage-validator default projectRoot 결함)

> v9.0.3 release 직후 사용자 결단 "다음 session carry G axis 진행하자" → cooling-off skip (precedent: v8.14.1) + 본 v9.0.4 PATCH. additive tool fix / breaking 0.
>
> **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v3 / v9.0.2 + v9.0.3 동형 패턴 cadence 본격 정착)**: v9.0.3 carry note "F-SIM-003 v+1 default strict_mode 전환 carry / poc-05 14 broken paths" 시행 직전 사실 검증 시 더 깊은 fact-mismatch 발견 — 5 PoC (poc-03/04-mini/05/14/06/07) cross-ref convention 모두 PoC root 기준 일관 + chain-coverage-validator default projectRoot = `dirname(behavior)` = `.aimd/output/` 이라 path resolution 시 `output/output/...` 중복 prefix 발생 = ★ 본격 도구 default 결함. 1차 strict_mode 전환 carry 는 별 axis valid 후보 (본 fix 전 전환 시 false positive 격상 = Adzic SBE 함정).
>
> **사용자 묶음 결단**: D1 fix 옵션 B-1 default auto-detect / D2 finding ID F-MB-VAL-001 별 등재 / D3 v9.0.4 PATCH release ceremony / D4 strict_mode v+1 default 전환 carry 별 axis 보존.
>
> **시행** (additive tool fix / breaking 0):
> - **F-MB-VAL-001** (medium / 도구 default 결함): `tools/chain-coverage-validator/src/validator.js` 안 `autoDetectProjectRoot(specPath)` 함수 신설 + export. `.aimd/output/<file>.json` 패턴 자동 감지 → `dirname(p)/../..` = PoC root (Windows backslash + Unix slash 모두 처리). fallback (non-`.aimd/output/`): dirname(p) backward-compat.
> - `tools/chain-coverage-validator/src/cli.js`: `dirname` import 제거 + `autoDetectProjectRoot` import + line 66 default 변경 + help text 갱신.
> - `tools/chain-coverage-validator/test/validator.test.js`: 신규 describe block 4 test 추가 (autoDetectProjectRoot Unix + Windows + fallback + null 방어). 34 → 38 pass.
> - `tools/chain-coverage-validator/package.json`: version 0.2.0 → 0.3.0 + description 갱신.
> - **release ceremony**: plugin.json + package.json 9.0.3 → 9.0.4 (3-way sync) + CHANGELOG 본 entry + CLAUDE.md sync + DEC-2026-05-24-v904-fsim-003-deeper-fact + INDEX 최상단 + STATUS session 43차 v9.0.4 entry.
>
> **★ ★ ★ 본격 fix 입증**: poc-05 직접 invoke (비명시 `--project-root`) **14 broken paths → 0** ✅. PoC self-corroboration ≥ 2 (poc-05 14→0 + poc-04-mini 0 회귀 ❌ + poc-14 0 회귀 ❌) = §8.1 strict 정합 ✓.
>
> **★ ★ 부산물 발견 (별 axis carry)**: poc-03 비명시 invoke 시 본 fix 후에도 잔여 broken paths = ① rules.json → business-rules.json v7.0.0 rename 미전파 + ② cross_links repo-absolute convention 사용 → **F-MB-POC-001 후보** (별 plan / 본 v9.0.4 외).
>
> **STOP-3**: workspace 694/694 → **698/698 pass** + chain-coverage-validator 34/34 → 38/38 + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift-validator analysis.phase-flow 0 breaking (보존) + version 3-way 9.0.4 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
> - **LL-v904-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v3 (LL-fsim-11 + LL-v902-01 정합 / 3회 연속 재발 / paradigm enforcement 본격 입증대 / main agent self-fact-check 의무 + carry note ambiguity 해소 cadence 본격 정착 v3)
> - **LL-v904-02** — silent sink paradigm deeper layer (LL-v903-01 확장 / 결정적 도구 enforcement 가 본격 hook gate cascade 안 될 때 silent sink 잔존 / chain-coverage-validator direct invoke + release-readiness #1 marketplace.json 모두 v+1 carry 후보)
> - **LL-v904-03** — PoC self-corroboration ≥ 2 paradigm 본격 입증 (§8.1 strict 정합 / 도구 fix → 다중 PoC 직접 invoke → 회귀 0 입증 + 부산물 carry 명시 cadence)
>
> **차기 session carry** (deadline 없음):
> - F-SIM-003 strict_mode v+1 default 전환 (별 axis 본격 보존 / 본 v9.0.4 fix 후 자연 가능 / cooling-off ≥ 24h 권장)
> - F-MB-POC-001 poc-03 산출물 drift 별 plan
> - LL-v903-01 follow-up (drift-validator phase-flow breaking exit ≥ 1 v+1)
> - LL-v903-03 follow-up (release-readiness #1 marketplace.json grep v+1)
>
> DEC-2026-05-24-v904-fsim-003-deeper-fact. Resolves F-MB-VAL-001.

## [9.0.3] — 2026-05-24 PATCH — 6-stage chain harness L1 결정적 점검 carry corrective (F-MB-DRIFT-001 + F-MB-DOC-003 / forward-only / additive doc / breaking 0)

> v9.0.2 release 직후 session 43차 L1 결정적 점검 (범위 = 전체 chain e2e 6-stage / 11 axis / 사용자 결단 "분석부터 시작 되는 플로우 점검") 의 후속 시행. 사용자 결단 "1" (의제 1 = 즉시 fix / PATCH / additive doc / cooling-off ❌) → 본 v9.0.3 PATCH. corrective / breaking 0.
>
> **L1 점검 결과**: 8/11 green + 3 ⚠️ silent drift 표면.
>
> | axis | 결과 | drift |
> |---|---|---|
> | C. drift-validator analysis.phase-flow | ⚠️ | 2 breaking — `template-analyze` phase JSON/mermaid 2-way drift (v3.4.0 G4 신설 후 ~6개월 carry / drift-validator emit breaking 하지만 exit 0 = release-readiness gate cascade 안 됨 = silent drift sink) |
> | G. chain-coverage poc-05 cross-refs | ⚠️ | 14 MEDIUM broken paths (strict_mode=false 통과 / F-SIM-003 v+1 default carry / 본 v9.0.3 범위 외 / 별도 plan carry) |
> | K. doc-drift tool/schema count | ⚠️ | 4 area — CLAUDE.md "17종"→실측 20 / "39종"→실측 44 / package.json "16 tools"→20 / marketplace.json "4단계 planning"→6단계 discovery (v9.0 미반영 = plugin install 첫 표면 drift) |
>
> **사용자 묶음 결단**: D1 F-MB-DRIFT-001 시행 / D2 F-MB-DOC-003 시행 / D3 v9.0.3 PATCH release ceremony / D4 G axis F-SIM-003 별도 plan carry (cooling-off ≥ 24h 권장).
>
> **시행** (additive doc / breaking 0):
> - **F-MB-DRIFT-001** (medium / 6개월 silent mermaid drift): `flows/analysis.phase-flow.mermaid` 안 subgraph `P_template_analyze["Phase template-analyze — ★ v3.4.0 G4 (Scenario C only)"]` 신설 + dependency edge `P_input --> P_template_analyze` 추가. **검증**: `node tools/drift-validator/src/cli.js flows/analysis.phase-flow.json` → 0 breaking / 0 non-breaking / 0 info ✅ (시행 직후 실측).
> - **F-MB-DOC-003** (low / 4-area count drift): `CLAUDE.md` line 97 (39→44 + dep-graph 3 부연) + line 99 (17→20 + sql-inventory-validator v8.7 rename + inflation-lint + code-pointer-validator + graph-integrity-validator v8.9.0 P1~P4 enumerate 추가) / `package.json:6` description "16 tools workspace" → "20 tools workspace" + 4 신설 도구 enumerate / `.claude-plugin/marketplace.json:11` description "SDLC 4단계 chain harness (legacy 분석 → planning → spec → test → impl) + chain 4 gate" → "SDLC 6단계 chain harness (legacy 분석 → discovery → spec → plan → test → implement / ★ v9.0 6-stage) + chain 1~5 gate (#1~#4 / plan placeholder)".
> - **release ceremony**: plugin.json + package.json 9.0.2 → 9.0.3 (3-way sync) + CHANGELOG 본 entry + CLAUDE.md sync + DEC-2026-05-24-v903-l1-flow-audit-carry-corrective + INDEX 최상단 + STATUS session 43차 v9.0.3 entry.
>
> **STOP-3**: workspace **694/694** + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift analysis.phase-flow 0 breaking ✅ + version 3-way 9.0.3 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
> - **LL-v903-01** — silent drift sink paradigm 본격 표면화 (drift-validator phase-flow breaking 시 exit 0 = warn-level → release-readiness gate 에 cascade 안 됨 = 6개월 carry 가능 / 후속 carry = exit ≥ 1 hard gate 전환 v+1)
> - **LL-v903-02** — L1 결정적 점검 paradigm enforcement 본격 표면화 cadence (11 axis 결정적 도구 일괄 실행 + 횡단 cross-check = sub-agent 비용 0 + 양심 의존 0% + drift 자동 표면 / paradigm 안정점 본격 재도달 v4 / v9.0.2 동형 패턴 cadence 본격 정착)
> - **LL-v903-03** — marketplace.json description = plugin install 첫 표면 (사용자 1차 접점) / MAJOR release 시 sweep 의무화 carry / release-readiness #1 marketplace.json description grep 추가 후보 v+1
>
> **차기 session carry**: G axis F-SIM-003 strict_mode 별도 plan (cooling-off ≥ 24h / poc-05 산출물 vs 도구 path resolution base 분리 검증 후 결단) + LL-v903-01 follow-up (drift-validator phase-flow breaking exit ≥ 1 v+1) + LL-v903-03 follow-up (release-readiness #1 marketplace.json grep v+1).
>
> DEC-2026-05-24-v903-l1-flow-audit-carry-corrective. Resolves F-MB-DRIFT-001 + F-MB-DOC-003.

## [9.0.2] — 2026-05-24 PATCH — paradigm + dep-graph L2 audit carry corrective (F-PA-DRIFT-001 + F-MB-DOC-002 / forward-only / Senior fact-check paradigm 재발)

> v9.0.1 release 직후 session 42차 L2 audit (paradigm + dep-graph / 14/16 PASS + 2 doc-only drift carry) 의 후속 시행. 사용자 결단 "캐리 실행" → 본 v9.0.2 PATCH. corrective / breaking 0.
>
> **시행 직전 사실 검증 보강 결과 (LL-fsim-11 paradigm 본격 재발)**: F-MB-DOC-002 가 1차로 단순 ambiguity (CLAUDE.md "5종" vs 실측 4) 로 등재됐으나, 시행 직전 사실 검증 시 더 깊은 fact-mismatch 발견 — `b9615d0` commit message + `DEC-2026-05-23-dep-graph-p1-p4 §3.1` + `STATUS` 32차 entry 안 "schema 5 신설 (...discovery-output + plan-spec)" claim 자체가 사실 오류. `discovery-output.schema.json` + `plan-spec.schema.json` = git history 안 전혀 부재 (never created). `cycle-carry.schema.json` = v8.8.0 commit `4523116` 신설 (별 axis carry resolution_kind 추적 / dep-graph history doc 안 5종 list 안 명시 ❌). → v8.9.0 시점 의도 5 / 실 b9615d0 stat = 3 + v8.8.0 cycle-carry carry-over 1 = 현 4종.
>
> **사용자 묶음 결단**: D1 F-PA-DRIFT-001 시행 / D2 F-MB-DOC-002 옵션 B (forward-only / history doc immutable / LL-i-52 paradigm 정합) / D3 v9.0.2 PATCH release ceremony.
>
> **시행** (additive doc / breaking 0):
> - **F-PA-DRIFT-001** (file 내적 drift 해소): `methodology-spec/finding-system.md:474` F-SIM-012 status `"open (v8.4.0 carry)"` → `"closed v8.14.4"` + `DEC-2026-05-23-fsim-012-014-close §1` cross-link / `:476` F-SIM-014 동일 패턴 (DEC §2 cross-link).
> - **F-MB-DOC-002** (forward-only 정정): `CLAUDE.md` line 132 v8.9.0 entry `"schema 5 + validator 2"` → `"schema 4 (★ v9.0.2 정정 / 실 b9615d0 stat = artifact-graph-node + edge + code-pointer 3 신설 + v8.8.0 cycle-carry carry-over 1 = 현 4종 / v8.9.0 commit message + DEC §3.1 "schema 5 신설" claim = 사실 오류 / discovery-output + plan-spec 본 적 없음 — history doc immutable 보존 / DEC-2026-05-24-v902-audit-carry-corrective) + validator 2 + ..."`. history doc (`b9615d0` commit message + `DEC-2026-05-23-dep-graph-p1-p4 §3.1` + `STATUS` 32차 entry) 변경 ❌ (audit-time 기록 보존 / LL-i-52 immutable paradigm 정합).
> - **release ceremony**: plugin.json + package.json 9.0.1 → 9.0.2 (3-way sync) + CHANGELOG 본 entry + CLAUDE.md sync + DEC-2026-05-24-v902-audit-carry-corrective + INDEX 최상단 + STATUS session 42차 v9.0.2 entry.
>
> **STOP-3**: workspace **694/694** + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift 3-way + version 3-way 9.0.2 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
> - **LL-v902-01** — main agent 시행 직전 사실 검증 paradigm 본격 재발 (LL-fsim-11 정합 / Senior 사실 검증 보강 본격 입증대 / L2 audit 의 "ambiguity" finding 이 실 fact-mismatch 로 진화한 case)
> - **LL-v902-02** — history doc immutable forward-only correction paradigm (LL-i-52 본격 재적용 / commit message + DEC + STATUS 의 fact-wrong claim 보존 + CLAUDE.md 만 정정 / 새 reader 추적 = 본 DEC 안)
> - **LL-v902-03** — L2 audit + 시행 분리 paradigm 본격 입증대 (audit → 결단 → 사실 검증 보강 → 시행 cadence / paradigm 안정점 본격 재도달 v3)
>
> DEC-2026-05-24-v902-audit-carry-corrective. Resolves F-PA-DRIFT-001 + F-MB-DOC-002 (session 42차 audit carry).

## [9.0.1] — 2026-05-23 PATCH — v9.0.0 coherence (prose + machine SSOT drift 정합 / planning→discovery + plan 전파)

> v9.0.0 이 런타임 SSOT(state.schema / stage-graph / sdlc.json stages)만 마이그레이션하고 **prose 14파일 + briefing 3파일 + sdlc-4stage-flow.mermaid + phase-flow chain 링크**를 구버전(4·5단계 / "planning")으로 남긴 drift 청산. corrective / breaking 0.
>
> **실 결함 포함**: `lifecycle-contract.md` 의 dead link(`agents/planning-agent.md` — discovery-agent.md 로 git mv 됨) + `chain-harness-guide.md` 의 state enum 모순(`"planning"`/`"done"` vs state.schema `current_chain` 6-stage). skill-citation-validator 가 prose 링크를 안 봐서 v9.0.0 STOP-3 통과했던 잔존.
>
> **사용자 결단**: ① coherence docs 먼저(PATCH) ② briefing/ 포함 ③ machine SSOT(mermaid + phase-flow 링크) 포함.
>
> **번호 규칙**: discovery=chain1/gate#1 · spec=2/#2 · plan=3/**gate deferred** · test=4/#3 · implement=5/#4 (gate 번호 ≠ chain 번호).
>
> - **prose 6-stage 정합 (14)**: `lifecycle-contract.md`(dead link→discovery-agent.md + flow 다이어그램 순서 + 자산 매핑 매트릭스 plan row(9) + data-contract plan 절 신설 + scope tree + 전 chain/gate 재번호) · `skills-axis.md`(§4·§7.2·§9.2 표 — discovery 6 + plan + count 55) · `plugin-charter.md`(R3/R7/R10/R11/R12/R13 + revisit_edges 8종) · `id-conventions.md` · `agents-axis.md` · `deliverables/17-planning-spec.md` · `flows/README.md`(dead ref planning.phase-flow→discovery) · `README.md`(stage 줄 + CHAIN 블록 + tree) · guides 4종(`chain-harness-guide.md` state enum→current_chain 6-stage + mermaid 재작성 + matcher / `first-prompt-cookbook.md` / `getting-started.md` / `common-errors.md`).
> - **briefing 3종**: `01-main.md`(skill·flow tree + 트리거 + flow 다이어그램) · `02-first-5min.md` · `slides/methodology-deck.md`(flow 섹션 + chain 책임 표 + revisit + asset 매핑 + 멀티에이전트).
> - **machine SSOT**: `sdlc-4stage-flow.mermaid` 6-stage 재작성(Planning→Discovery + plan subgraph S3 + revisit 8종 + S0~S5 chain 정합) · `spec/plan/test/implement.phase-flow.json` previous/next chain 링크 정합(dead ref `planning.phase-flow.json` 제거 + plan 경유) + chain 번호(test 3→4 · implement 4→5) + `expected_outcome_chain3/4`→`chain4/5`.
> - **KEEP (reuse/history)**: `planning-spec.json`·`planning-spec.schema.json` 산출물명 + `planning-extraction-validator` 도구 + `subtask_ids.chain1_planning` schema key + `finding-system.md`·`briefing/04-version-history.md` audit history + ticket 서브시스템(`ticket-sync` skill stage=planning + traceability schema 4-chain key).
> - **STOP-3**: workspace **694/694** + release-readiness **16/16** + skill-citation **235 doc 0 stale** + drift state-flow(6=6)+chain-layout(5)+phase-flow 짝 0 breaking + chain-driver 223/223 + version 3-way 9.0.1 + breaking 0 = PATCH.
> - **carry**: plan-agent 본격 구현(plan-* skill 3 + plan-spec schema + plan hard gate) = v9.x+ / README·briefing version·stat refresh(v3.6.9·v8.2.0 → v9.0.x) / ticket 서브시스템 6-stage 마이그레이션(breaking) / templates/planning 폴더 rename.
>
> DEC-2026-05-23-coherence-docs-6stage. Resolves DEC-2026-05-23-discovery-stage-v9 §carry (prose coherence).

## [9.0.0] — 2026-05-23 MAJOR — discovery stage 재통합 (6-stage chain harness / planning→discovery 개칭 + plan 신설)

> DEC-2026-05-21 설계(옵션 A "개칭 + 확장")를 현 main 위에 **machine SSOT 까지 완성**. 기존 `feat/v4.1-hooks-carry-note` 브랜치는 문서·skill·agent 만 바꾸고 state/flows/tooling 을 안 건드려 미완성·drift 상태였음 (그래서 raw merge 시 drift+citation 깨짐 → abort 후 본 재통합).
>
> **breaking**: `state.schema.json` stage enum (`planning`→`discovery` + `plan` 추가) → 기존 state.json 무효화 + skill command-surface rename (planning-*→discovery-*). v7.0.0/v8.0.0 rename 선례 정합 = MAJOR.
>
> **사용자 묶음 결단**: MAJOR v9.0.0 / fresh 재적용(stale 브랜치 merge ❌) / 기존 schema reuse(신규 0) / plan gate deferred(placeholder / gate #1~#4 유지) / chain 1~5 순차 재배치.
>
> **chain**: `analysis → discovery → spec → plan → test → implement`. discovery = planning 개칭 + 입력 어댑터 4종(analysis-output/swagger/figma/nl-md). plan = HOW 단계(task/ADR/NFR/risk) placeholder (plan-agent skills:[] / hard gate deferred).
>
> - **machine SSOT**: `state.schema.json` 6-stage(enum/required/StageRecord/gate/revisit) / `sdlc-4stage-flow.json`(파일명 reuse) stages 6 + revisit_edges 8 + gate #1~#4 / `flows/planning.phase-flow`→`discovery.phase-flow`(git mv) + `plan.phase-flow` 신설(+mermaid 각) / `drift-validator` CHAIN_STAGES / `chain-driver` 8 src(stage-graph STAGES+gate map / state-store / gate-eval / cli MANIFEST_STAGES / hooks-bridge trigger / work-unit / revisit-detect) + **223 test 갱신**.
> - **skills/agents**: 3 rename(planning-*→`discovery-decompose-use-cases`/`discovery-from-analysis-output`/`discovery-identify-business-intent`) + 6 신설 placeholder(`discovery-from-figma`/`nl-md`/`swagger` + `plan-architect-decisions`/`decompose-and-sequence`/`risk-and-nfr`) + `discovery-agent`(planning-agent 흡수) + `plan-agent` placeholder.
> - **schema reuse(신규 0)**: discovery 산출물 = `planning-spec.json`(파일명 reuse) / 어댑터 schema = 기존 `figma-extract`·`prompt-extract`(+`plan-doc-extract`)·`swagger-extract`(+`openapi-extension`)·`intent-classification` 재사용 / plan-spec = defer(placeholder).
> - **기타**: PoC state.json 3 마이그레이션(planning→discovery + plan / poc-11·06 go-eligible→go 정정) / hooks matcher discovery·plan / DEC-2026-05-23-discovery-stage-v9 + DEC-2026-05-21 등재 / CLAUDE.md 6-stage + plugin.json desc.
> - **STOP-3**: workspace **694/694** pass / drift state-flow(6 enum=6 flow)+chain-layout(5 chain stage / 0 missing) / chain-driver 223/223 / skill-citation 235 doc 0 stale / release-readiness **16/16 ready** / version 3-way 9.0.0 = MAJOR.
> - **carry**: plan-agent 본격 구현(plan-* skill 3 + plan-spec schema + plan hard gate) = v9.x+.

---

## Archive

> v8.x 이하 entry 모두 → [`CHANGELOG-HISTORY.md`](CHANGELOG-HISTORY.md) 이전 (★ ★ ★ v9.0.0 paradigm boundary cleanup / 2026-05-25 / 6-stage chain harness 시작점 cutoff). 직전 cutoff = v7.0.0 이하 (v8.13.2 / 2026-05-23). v2.3.x and earlier split = 2026-05-14. v1.3.x and earlier split = 2026-05-06.
