# Lifecycle Contract — SDLC 단계 간 산출물 인터페이스

본 문서는 본 방법론의 lifecycle stage 간 **data contract** 를 정의. **SDLC chain harness** = **v9.0 6-stage** (analysis→discovery→spec→plan→test→implement). analysis stage = 본 문서가 채운 부분.

## 본 방법론 가치 명세 (use-scenario taxonomy + AX 운영 정체성)

> **가장 큰 목적 (P0)**: 산출물 = LLM 의 운영 컨텍스트 그 자체. 방법론의 가장 큰 목적 중 하나 = 이 컨텍스트를 평생 유지·동기화하여 프로젝트를 **AX 로 운영**하는 것. 4 use-scenario(**S2 AX전환=주 타깃** / S1 재생성 / S3 특성화 / greenfield)는 bootstrap 입력만 다르고 모두 AX 운영으로 수렴. greenfield 도 입력어댑터 analysis 로 산출물 생성(처음부터 AX-native). 산출물 = 전 stage base + 기능추가 역동기화. SSOT = `use-scenario-taxonomy.md`.

```
INPUT (4 use-scenario):  S2 AX전환(주 타깃)/S1 재생성/S3 특성화 = legacy 코드 / greenfield = PRD·디자인·계약
  ↓ analysis stage = 코드-고고학(legacy) + 입력어댑터(공통 / greenfield 는 이것만 / 현 입력어댑터 자산 / 단방향 추출)
  ↓
OUTPUT chain:
  [CHAIN 1] discovery-spec (discovery stage)      ── go/stop gate #1
  [CHAIN 2] behavior-spec + acceptance-criteria + 7대 산출물 통합  ── go/stop gate #2
  [CHAIN 3] task-plan (task 분해 / ADR / NFR / risk)  ── go/stop gate #3
  [CHAIN 4] test-spec + 실 test 코드 (RED 의무)  ── go/stop gate #4
  [CHAIN 5] impl-spec + 실 impl 코드 (GREEN / 100% test pass)  ── go/stop gate #5
  ↓
USE: AI 자동 생성 + 사용자 검토 (i-strict) / prod 시스템 + traceability-matrix
```

**SDLC 6-stage chain harness**. round-trip = chain harness gate 안에서 정식 허용. harness 외부 자동 코드 생성 = ❌ scope 외부.

**70~80% 한계 = 명시 잔존**. AI 자동화 ≥ 85% / 사람 검토 (gate #1~#5) ≤ 15% / 100% 자동화 ❌ 명시.

## SDLC stage 흐름

```
분석 (analysis)  →  발견 (discovery)  →  스펙 (spec)  →  계획 (plan)  →  테스트 (test)  →  구현 (implement)
   chain 0 (단방향추출)  chain 1          chain 2         chain 3         chain 4         chain 5
   gate #0 (soft)       gate #1          gate #2         gate #3         gate #4         gate #5
```

design stage = carry (1차 = analysis 자산 deliverable 7~9 reuse / sub-plan 분할 정책 정합).
1차 구현 = legacy single-case (use case 4종 분기 = carry).

### analysis stage = 두 패스 (코드-고고학[legacy] + 입력어댑터[greenfield])

analysis 는 legacy _코드_ 가 아니라 _입력_ 을 요구한다:

- **코드-고고학 패스** (S1/S2/S3 / legacy 코드 있음) — `analysis-input-collection` 진입 → source-inventory·characterization·sql-inventory 등 코드 기반 phase.
- **입력어댑터 패스** (greenfield / 코드 없음) — `analysis-greenfield-bootstrap` 진입 → `analysis-input-orchestrate` greenfield 분기로 PRD·디자인·계약 흡수 → 각 analysis skill 의 **greenfield code-optional mode** 로 7대 산출물 subset(architecture/domain/business-rules/openapi/schema) 생성. legacy 전용 산출물(antipatterns/migration-cautions) = N/A (빈/정당화). swagger 채널은 `tools/greenfield-bootstrap` 가 swagger-extract→openapi.yaml 을 **결정적 승격**.
- 두 패스 모두 같은 7대 산출물 → 같은 정상 상태(AX 운영)로 수렴. greenfield = 산출물이 빌드 부산물로 나오며 처음부터 AX-native.
- 정직 한계: greenfield AI code-optional mode = swagger 1채널 dogfood 입증 / figma·PRD 2nd 채널 = carry. DB schema 합성(entity→table) = carry. (≥2 PoC corroboration 의무.)

## 5 영역 axis

매 stage 가 5 영역 (`기획 / 디자인 / FE / BE / DB`) 을 다른 강도로 다룸. 강 = stage 의 핵심 / 약 = 부수 / ❌ = 적용 안 됨.

| Stage                                                                  | 기획 | 디자인                 | FE  | BE  | DB  | 공통 |
| ---------------------------------------------------------------------- | ---- | ---------------------- | --- | --- | --- | ---- |
| **analysis (chain 진입 전)**                                           | ❌   | 약 (deliverable 7~9)   | 강  | 강  | 강  | 강   |
| **discovery (chain 1)**                                                | 강   | 강                     | 약  | 약  | 약  | 약   |
| **spec (chain 2)**                                                     | 약   | 약                     | 강  | 강  | 강  | 강   |
| **plan (chain 3)** gate #3 (HOW / task·ADR·NFR·risk)                   | 약   | 약                     | 약  | 약  | 약  | 강   |
| **design** ☐ carry                                                     | 약   | 강                     | 강  | 약  | 약  | 약   |
| **test (chain 4)**                                                     | ❌   | 약 (visual-regression) | 강  | 강  | 강  | 강   |
| **implement (chain 5)** (i-strict / chain harness 안에서 round-trip 정식 허용) | ❌   | 약                     | 강  | 강  | 강  | 강   |

각 stage 의 5 영역 매트릭스 상세 = 본 §자산 매핑 매트릭스 + `skills-axis.md` §4 chain stage axis 표 cross-link (1-depth).

## 기술 스택 분기 axis (정책 선언)

기술 스택별 차이 (Spring / NestJS / React / Hexagonal / Express / FastAPI / Rails / Prisma / TypeORM / JPA / Zustand / Redux / Zod / Yup / etc.) = SKILL.md 본문 분기로 표현 (analysis stage `analysis-source-inventory` 패턴 차용 — `Java/Spring / Node/NestJS / Python` 본문 절차 분기). 디렉토리 분리 ❌ / frontmatter enum ❌ / 본문 분기 dominant.

## 자산 매핑 매트릭스

본 매트릭스 = stage 진입 시 사용자가 어떤 자산 (agent / skill / hook / tool/validator) 을 호출할지 단일 SSOT. charter §3 G5 종결. **stage 별 sub-agent 5종 실 path 명시**.

### 본 매트릭스 (stage × asset 6 column / 9 row)

| Stage / Cross-cut                         | Agent                                                                                                                                                                                           | Skill                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Hook                                                             | Tool / Validator                                                                                                                                                                  | DB 자산 입력                                                                                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **input** (analysis 진입)                 | [`agents/analysis-agent.md`](../agents/analysis-agent.md) (입력 6 skill 책임 통합)                                                                                                         | `analysis-input-collection`, `analysis-input-orchestrate`, `analysis-greenfield-bootstrap` (scenario=greenfield 진입점), `analysis-from-{prompt,swagger,plan-doc,figma}` (부 매트릭스 §자산 매핑 매트릭스 detail 참조)                                                                                                                                                                                                                                                                                                            | `SessionStart` (chain-driver hooks-bridge / D21' suppressOutput) | `greenfield-bootstrap` (swagger-extract→openapi.yaml elevation + N-A / 결정적), input-summary.schema.json validation                                                   | (DB 자산 수집 진입점만 — analysis stage 가 수집 / greenfield 는 legacy-only DB 자산 N/A)                                               |
| **analysis** (chain 1 sub)                | [`agents/analysis-agent.md`](../agents/analysis-agent.md) (22 analysis skill + 6 input skill + 3 base = 31 skill 사전 주입)                                                              | `analysis-source-inventory`, `analysis-db-schema-erd`, `analysis-architecture`, `analysis-domain-model`, `analysis-business-rules`, `analysis-openapi`, `analysis-api-rule-mapping`, `analysis-error-mapping`, `analysis-quality-antipattern`, `analysis-formal-spec-validation`, `analysis-characterization-test`, `analysis-sql-inventory`, `analysis-form-validation-fe`, `analysis-type-spec-fe`, `analysis-ui-state-map-fe`, `analysis-ui-visual-manifest-fe`, `analysis-br-cross-consistency-check`, `analysis-html-template` | `PostToolUse(Write/Edit → lint)`, `Stop(rollup)`                 | `drift-validator`, `schema-validator`, `formal-spec-link-validator`, `spectral-runner` (사용자 명시 호출), `static-runner`, `decision-table-validator`                            | **전체 DB 자산 의무** — Tables DDL + Views + Functions + Stored Procedures + ERD + 도메인 노트 모두 입력 자산 (`db-assets-always-on.md` §3) |
| **discovery** (chain 1)                   | [`agents/discovery-agent.md`](../agents/discovery-agent.md) (6 discovery skill + 4 base = 10 skill 사전 주입)                                                                            | `discovery-from-analysis-output`, `discovery-from-swagger`, `discovery-from-figma`, `discovery-from-nl-md`, `discovery-decompose-use-cases`, `discovery-identify-business-intent`, `_base-build-traceability-matrix`, `_base-apply-template`, `_base-log-finding`, `_base-invoke-go-stop-gate`                                                                                                                                                                                                                                               | `PreToolUse(deny secrets)`, `Stop(gate-1 evidence)`              | `discovery-extraction-validator`, `br-cross-consistency-validator`, `schema-validator`                                                                                            | scope 관련 DB 자산 — `analysis_refs.db_tables/db_procedures/db_functions/db_views` 역인덱스 자동 첨부 (work-unit-manifest.schema)  |
| **spec** (chain 2)                        | [`agents/spec-agent.md`](../agents/spec-agent.md) (3 spec skill + 4 base = 7 skill 사전 주입)                                                                                            | `spec-compose-behavior-spec`, `spec-derive-acceptance-criteria`, `spec-integrate-deliverables`, `_base-build-traceability-matrix`                                                                                                                                                                                                                                                                                                                                                                                                            | `PostToolUse(spec lint)`                                         | `chain-coverage-validator`, `formal-spec-link-validator`, `schema-validator`                                                                                                      | DB schema 변경 사항 명시 (신규 stack schema 매핑 draft)                                                                                     |
| **plan** (chain 3 / gate #3) | [`agents/plan-agent.md`](../agents/plan-agent.md) (gate #3 / 3 plan skill + 4 base = 7 skill 사전 주입)                                                                   | `plan-decompose-and-sequence`, `plan-architect-decisions`, `plan-risk-and-nfr`, `_base-build-traceability-matrix`, `_base-apply-template`, `_base-log-finding`, `_base-invoke-go-stop-gate`                                                                                                                                                                                                                                                                                                                                                  | `PreToolUse(deny)`, `Stop(gate-3 evidence)`                      | `plan-coverage-validator` (SP 분류 hard gate), `schema-validator`                                                                                                       | **SP 전환 결단 의무** — `task-plan.sp_conversions[]` 4 분류 (α/β/γ/δ) 결단 (`sp-conversion-policy.md` §4 정합 / γ 시 adr_ref required) |
| **test** (chain 4)                        | [`agents/test-agent.md`](../agents/test-agent.md) (4 test skill + 4 base = 8 skill 사전 주입)                                                                                            | `test-generate-test-spec` (jest/vitest/junit5/pytest/RTL/Vue Test Utils 본문 분기), `test-run-test-evidence`, `test-verify-coverage`, `test-playwright` (e2e POM)                                                                                                                                                                                                                                                                                                                                                                   | `PreToolUse(test-cmd require)`, `Stop(RED evidence)`             | `test-impl-pass-validator (dry-run)`, `spec-test-link-validator`, `schema-validator`, `lint-no-simulation (chain-strict)`                                                         | test fixture DB schema (test DB / mock / in-memory)                                                                                         |
| **implement** (chain 5)                   | [`agents/implement-agent.md`](../agents/implement-agent.md) (4 implement skill + 4 base = 8 skill 사전 주입)                                                                             | `implement-generate-impl-spec` (nestjs/spring/fastapi 본문 분기), `implement-verify-test-pass`, `implement-react` (React 19), `implement-vue` (Vue 3)                                                                                                                                                                                                                                                                                                                                                                      | `PreToolUse(commit_hash require)`, `Stop(GREEN gate-5)`          | `test-impl-pass-validator (--allow-execute)`, `static-runner (R19 Tier 1 in-plugin Semgrep+PMD + Tier 2 SARIF import)`, `lint-no-simulation`, `traceability-matrix-builder`, `schema-validator` | 신규 stack DB schema migration script 산출 + legacy↔신규 1:1 매핑 + numeric/row equivalence oracle 검증 (sp-conversion-policy §5.2 / §6.2)  |
| **design** (PLACEHOLDER)                  | [`agents/design-agent.md`](../agents/design-agent.md) (PLACEHOLDER / `skills: []` / dispatch 무의미)                                                                                            | (carry — `design-wireframe-spec`, `design-component-spec`, `design-tokens-extract`, `design-visual-regression`, `design-a11y-prep`)                                                                                                                                                                                                                                                                                                                                                                                                    | (carry)                                                          | (carry — Playwright snapshot / DTCG validator)                                                                                                                              | ❌ (적용 외)                                                                                                                                |
| **cross-cut** (traceability)              | [`agents/_base-senior-engineer.md`](../agents/_base-senior-engineer.md) (gate 검토 시 critique)                                                                                                 | `_base-build-traceability-matrix`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | (Stop 동일)                                                      | `traceability-matrix-builder`, `chain-coverage-validator`                                                                                                                         | DB axis traceability (analysis*refs.db*\* ↔ task-plan.sp_conversions ↔ impl migration script forward+backward link)                         |
| **cross-cut** (aspects)                   | [`agents/_base-industry-case-researcher.md`](../agents/_base-industry-case-researcher.md) + [`agents/_base-official-docs-checker.md`](../agents/_base-official-docs-checker.md) (research 트랙) | `analysis-aspect-a11y`, `analysis-aspect-i18n`, `analysis-aspect-static-security`, `analysis-aspect-legacy`                                                                                                                                                                                                                                                                                                                                                                                                                                  | (PostToolUse 동일)                                               | (각 aspect 자체 외부 도구 — Tier 1 in-plugin: axe-core / i18n-lint / Semgrep / PMD / Tier 2: PMD SARIF import / 진짜 실행 의무)                                               | ❌ (적용 외 — aspect 별 자체 source)                                                                                                        |

### spike 자산 (paradigm 가능 입증 / 보존)

- [`archive/v4-spike/_spike-planning-agent.md`](../archive/v4-spike/_spike-planning-agent.md) (EXPERIMENTAL / archive 이동 / paradigm 가능 입증 source — agents/ 폴더 가시화 ↓ + 역사 기록 보존)

### 부 매트릭스: input 5종 (R8 입력 axis) detail

본 매트릭스 의 **input row** 단일 항목을 R8 입력 axis 로 펼침. orchestrator 는 BCDE 4 skill 자동 dispatch.

| R8 종류               | skill                        | 의존 도구                                                                                                                         | 산출 schema                                                             |
| --------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| (a) 기존 코드         | `analysis-input-collection`  | git clone + Glob/Grep + baseline+ratchet                                                                                  | `input.json` (`.ai-context/<scope>/`)                                         |
| (b) Figma             | `analysis-from-figma`        | `mcp__figma-desktop__get_design_context` + `get_metadata` + `get_variable_defs` + `get_screenshot` (사전조건 = desktop selection) | `figma-extract.schema.json`                                             |
| (c) Swagger / OpenAPI | `analysis-from-swagger`      | `@readme/openapi-parser` (3.1 + 3.0 + 2.0 / `$ref` resolve)                                                                       | `swagger-extract.schema.json`                                           |
| (d) plan-doc          | `analysis-from-plan-doc`     | Read (PDF 20p cap) + markdown parser (remark) + adm-zip + csv-parse                                                               | `plan-doc-extract.schema.json`                                          |
| (e) 자연어 prompt     | `analysis-from-prompt`       | (Claude 의미 추출만 / 외부 의존 0)                                                                                                | `prompt-extract.schema.json`                                            |
| (orchestrator)        | `analysis-input-orchestrate` | (BCDE 4 skill 자동 dispatch + merge + cross-ref + conflict 정량 산식 / Hybrid 2-B + 2-A escalate)                                 | `input-summary.schema.json` (cross_refs + conflicts + score_components) |

### Scenario × stage 매트릭스 (be-fe-separation.md §6 정합)

본 매트릭스 의 stage 별 자산이 Scenario A (분리 default / React+TS) / B (JS 풀스택 / Next.js 등) / C (JSP 등 server-rendered) 에 어떻게 적용되는지 = `methodology-spec/be-fe-separation.md` §1~§6 참조. 본 자산 매핑 매트릭스 와 Scenario 매트릭스 = cross-link (axis 분리).

### 사용 가이드

- 사용자가 "어떤 chain stage 진입할까?" → 본 매트릭스 row 선택 → skill / hook / tool column 인용
- 입력 시점에 R8 5종 중 어느 입력인지 → 부 매트릭스 참조 → 해당 skill 호출 (또는 orchestrate 가 자동 dispatch)
- agent persona = 매트릭스 column "Agent" 인용 (`agents/<stage>-agent.md`)

### Input 어댑터 timing 분리 (analysis-from-_ ↔ discovery-from-_)

**같은 source(figma/swagger/NL md)지만 timing+책임이 다른 두 set 평행 유지** (baseline-delta 운영 모델 정합):

| set                        | timing                               | 책임                                                                                                             | skill                                                                                                                    |
| -------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **`analysis-from-*`** (4)  | **최초 1회** (legacy baseline 수립)  | analysis 산출물 만들기 (visual-manifest / ui-state-map / inventory / domain 등 canonical global `.ai-context/output/`) | `analysis-from-{figma, swagger, prompt, plan-doc}`                                                      |
| **`discovery-from-*`** (4) | **신규 건마다** (scope 진입 trigger) | UC + intent + flow 추출 → discovery-spec(discovery 산출)                                                         | `discovery-from-{analysis-output, figma, swagger, nl-md}` |

같은 figma 파일이라도 (a) baseline 수립 시 = `analysis-from-figma`, (b) 신규 feature scope 진입 시 = `discovery-from-figma`. **다른 목적/다른 산출**. 둘 다 유지 = 중복 ❌ / 다른 axis ✅. `discovery-from-nl-md` 는 **NFR 1차 채널** (다른 채널은 부 / NL 만이 명시 NFR 표현).

## 단계 간 인터페이스 (data contract)

### chain 1 (발견) — discovery stage

1차 구현 = **legacy 시스템 재구축 single-case** (사용자 답변 1번 정합). use case 4종 분기 (legacy/신규/수정/버그) = carry.

1차 input (analysis stage 가 받은 산출물 → discovery stage 가 받음):

- 7대 산출물 + 8 FE 산출물 (analysis stage 산출 / `<user-project>/.ai-context/output/`)
- finding-system 누적
- antipatterns + migration-cautions

후속 carry (use case 4종 별 input 분기):

- (a) legacy 재구축: 위 (1차 정의)
- (b) 신규 PRD: 사용자 작성 PRD.md / story.json
- (c) 수정 / (d) 버그: 위 + change-set spec

5 영역 강도 (discovery stage):

| 기획 | 디자인 | FE  | BE  | DB  | 공통 |
| ---- | ------ | --- | --- | --- | ---- |
| 강   | 강     | 약  | 약  | 약  | 약   |

산출물 (discovery stage 가 만듦):

- **discovery-spec.json** (deliverable 17 / `schemas/discovery-spec.schema.json`)

기존 placeholder (PRD / story / domain-priority) = discovery-spec.json 의 sub-section 으로 흡수 (1차 = legacy-extraction 모드 / 후속 use case 분기 시 source_format 분기 정책).

### chain 2 (스펙) — spec stage ("현 7대 + 신규 추가" 사용자 답변 3 정합)

input (spec stage 가 받음):

- discovery-spec.json
- analysis stage 7대 + 8 FE 산출물 (1~15 + 4.5)
- finding-system 누적

5 영역 강도 (spec stage):

| 기획 | 디자인 | FE  | BE  | DB  | 공통 |
| ---- | ------ | --- | --- | --- | ---- |
| 약   | 약     | 강  | 강  | 강  | 강   |

산출물 (spec stage 가 만듦):

- **behavior-spec.json** (deliverable 18 / `schemas/behavior-spec.schema.json`) — `formal-spec` phase 산출물 (state-machine / sequence / decision-table / invariant / property-test) 의 chain 2 격상 + discovery-spec.use_cases 흡수
- **acceptance-criteria.json** (deliverable 19 / `schemas/acceptance-criteria.schema.json`) — Gherkin (Given/When/Then) BDD 정합 / verifiable=true 의무 / MoSCoW (must/should/nice)
- **현 7대 산출물 통합** (변경 ❌) — behavior-spec.cross_links 가 모든 7대 산출물 reference (cross-link coverage 강제)

chain-coverage-validator = AC-_ / BHV-_ / UC-\* 정합 ≥ 0.85 ratchet.

### chain 3 (계획) — plan stage

plan stage = spec 이후 **HOW 명시** (task 분해 / 의존성 / 순서 / ADR / NFR allocation / risk / rollback). plan-agent = 3 plan skill + 4 base 주입. hard gate = **gate #3 활성** (chain 3 = gate #3 1:1). 근거: `flows/plan.phase-flow.json`.

input (plan stage 가 받음):

- behavior-spec.json + acceptance-criteria.json
- analysis stage architecture/domain (implicit 의존 추론 source)

5 영역 강도 (plan stage):

| 기획 | 디자인 | FE  | BE  | DB  | 공통 |
| ---- | ------ | --- | --- | --- | ---- |
| 약   | 약     | 약  | 약  | 약  | 강   |

산출물 (plan stage 가 만듦):

- **task-plan.json** (`schemas/task-plan.schema.json` / tasks[] / dependencies[] / adrs[] (alternatives ≥3) / nfr_allocation[] / risks[]) — discovery 산출 `discovery-spec.json` 과 명독 분리
- 운영 정책: task granularity 1~3 AC 묶음 / ADR 5 자동 판정 기준 / NFR hard gate / risk 3중 망 / estimation_ai+estimation_human 분리
- **contract 강제 양 axis**: BE task (`layer=='be'`) = `openapi_endpoint_ref` (swagger operationId 연결) 의무 / FE task (`layer=='fe'`) = `component_ref` + state-map + visual-manifest + DTCG token 연결 의무. task-plan.schema.json if/then 강제 / plan-coverage-validator BE↔FE 1:1 matching 검증.

plan hard gate = **gate #3 활성** (gate #1~#5 = discovery/spec/plan/test/implement / chain N = gate #N 1:1 / analysis = soft exit gate #0 [opt-in fail-closed / §3-A axis 별개] / `plan-coverage-validator` NFR allocation hard gate).

### chain 4 (테스트) — test stage

input (test stage 가 받음):

- behavior-spec.json + acceptance-criteria.json
- analysis stage 산출물 1~15
- (carry) component-spec.json / DTCG token (design stage carry)

5 영역 강도 (test stage):

| 기획 | 디자인                 | FE  | BE  | DB  | 공통 |
| ---- | ---------------------- | --- | --- | --- | ---- |
| ❌   | 약 (visual-regression) | 강  | 강  | 강  | 강   |

산출물 (test stage 가 만듦):

- **test-spec.json** (deliverable 20 / `schemas/test-spec.schema.json`) — TC-\* (테스트 케이스 메타) / type (unit/integration/contract/e2e/property) / framework (jest/vitest/junit/pytest/playwright)
- **실 test 코드** (사용자 프로젝트 `<project>/test/` 또는 `__tests__/`) — RED 의무 (CHAIN 4 종결 시 모든 test fail / impl 부재)
- **5종 물증 7 필드** (no-simulation — runner_version + stdout + stderr + timestamp + pass/fail count + duration + reproduction + result_hash)

spec-test-link-validator = AC→TC 1:N 정합 + framework match (analysis-source-inventory) + coverage ≥ 0.85.

### chain 5 (구현) — implement stage (i-strict / chain harness 안에서 round-trip 정식 허용)

input (implement stage 가 받음):

- test-spec.json + 실 test 코드 (RED)
- behavior-spec.json
- 7대 산출물

5 영역 강도 (implement stage):

| 기획 | 디자인 | FE  | BE  | DB  | 공통 |
| ---- | ------ | --- | --- | --- | ---- |
| ❌   | 약     | 강  | 강  | 강  | 강   |

산출물 (implement stage 가 만듦):

- **impl-spec.json** (deliverable 21 / `schemas/impl-spec.schema.json`) — IMPL-\* / framework / source_files / commit_hash
- **실 impl 코드** (사용자 프로젝트) — GREEN 의무 (모든 test 100% pass)
- **5종 물증 7 필드** (no-simulation — chain 4 (test) 의 5종 물증 + impl_test_pass_rate 100% + coverage_report + linter)
- **production code + 빌드 artifact**

test-impl-pass-validator = 진짜 runner 호출 / 100% pass / 5종 물증 7 필드 / chain harness 의 핵심 enforcement.

**70~80% 한계** = 명시 잔존 / gate #5 사용자 검토 ≤ 15% / 100% 자동화 ❌ 명시.

### cross-cutting — traceability-matrix (deliverable 22 / `schemas/traceability-matrix.schema.json`)

매 chain stage 종결 시 갱신 의무. UC-_ → BHV-_ → AC-\* → **TASK-\*** (plan stage layer) → TC-_ → IMPL-_ + commit_hash forward+backward link. coverage ≥ 0.85 ratchet.

### 분석 → 스펙 (analysis 자산 = chain 2 spec stage 의 input / "현 7대 + 신규 추가" 정합)

본 문서가 채우는 핵심 인터페이스. 분석 stage 출력 = 다음 단계의 입력.

**산출물 1~15** (`methodology-spec/deliverables/<NN>-*.md`):

| #   | 산출물                            | Schema                             | 트랙 (6 enum: `공통 / BE / FE / DB / 기획 / 디자인`) |
| --- | --------------------------------- | ---------------------------------- | ---------------------------------------------------- |
| 1   | inventory                         | `inventory.schema.json`            | 공통                                                 |
| 2   | architecture                      | `architecture.schema.json`         | 공통                                                 |
| 3   | domain                            | `domain.schema.json`               | 공통                                                 |
| 4   | rules                             | `business-rules.schema.json`       | BE+FE                                                |
| 5-a | openapi                           | `openapi-extension.schema.json`    | BE                                                   |
| 5-b | schema + erd                      | `db-schema.schema.json`            | DB                                                   |
| 6   | finding-list                      | (`finding-system.md` 형식)         | 공통                                                 |
| 7   | ui-ux                             | (`deliverable 7-ui-ux.md` 형식)    | FE+디자인                                            |
| 7'  | antipatterns + migration-cautions | `antipatterns.schema.json`         | 공통                                                 |
| 8   | state-map                         | `state-map.schema.json`            | FE+디자인                                            |
| 9   | visual-manifest                   | `visual-manifest.schema.json`      | FE+디자인                                            |
| 10  | a11y                              | `a11y-spec.schema.json`            | FE+디자인                                            |
| 11  | i18n                              | `i18n-spec.schema.json`            | FE                                                   |
| 12  | static-security                   | `static-security-spec.schema.json` | BE+FE                                                |
| 13  | legacy                            | `legacy-spectrum.schema.json`      | 공통                                                 |
| 14  | form-validation-spec              | `form-validation-spec.schema.json` | FE                                                   |
| 15  | type-spec                         | `type-spec.schema.json`            | FE (TS)                                              |
| 16  | run-manifest                      | `run-manifest.schema.json`         | 공통 (운영 컨텍스트 / 1차 draft opt-in)              |

"기획" 트랙 산출물 = 본 stage 부재 (carry §기획→분석 input 참조).

> **#16 run-manifest** (역공학 델타 #2-a) — build/run/env positive 운영 manifest (migration-cautions negative 의 반대편). `analysis-run-manifest` skill 이 실 config(package.json/Dockerfile/compose/gradle/application.yml/.env.example)에서 source-grounded 추출. env value 미저장(name+is_secret만). cross-cutting aspect / 1차 draft (≥2 PoC corroboration 후 MANDATORY 검토 / 결정 = decisions/INDEX.md).

**파일 위치 컨벤션** (사용자 프로젝트):

```
<user-project>/
├── .ai-context/
│   ├── input.json           # analysis-input-collection skill 메타 (user project file 명 = manifest phase ID axis / 짧음 형식)
│   ├── baseline-<date>.json         # baseline+ratchet
│   ├── findings.md                  # finding 누적
│   └── output/                      # 분석 stage 산출물 (15종 중 해당분)
│       ├── inventory.json
│       ├── architecture.json
│       ├── domain.json
│       ├── business-rules.json      # 분할 index (bc_files[] / well-known 진입점)
│       ├── business-rules/          # per-BC leaf (BR-split STEP 3) — <BC-slug>.json
│       ├── openapi.yaml             # BE
│       ├── schema.json              # DB
│       ├── state-map.json           # FE
│       ├── visual-manifest.json     # FE
│       ├── a11y-spec.json           # FE
│       ├── i18n-spec.json           # FE
│       ├── static-security-spec.json # BE+FE
│       ├── legacy-spectrum.json     # 공통
│       ├── form-validation-spec.json # FE
│       ├── type-spec.json           # FE (TS)
│       ├── run-manifest.json        # 공통 (build/run/env 운영 컨텍스트 / 1차 draft)
│       ├── antipatterns.json        # 공통
│       ├── migration-cautions.json   # 공통
│       └── tool-runs/               # 진짜 도구 raw 출력 보존
```

**G3 — 작업 단위 (scope) 폴더 + manifest 자동 생성**:

```
<user-project>/.ai-context/
├── output/                          # ↑ canonical global = scope 와 무관 (위 layout 그대로)
├── <scope>/                         # G3 — feature/도메인 작업 단위 (사용자 자유 명명 / kebab-case)
│   ├── manifest.json                #   scope 전체 status / analysis_refs / sync_state
│   │                                #   (scope 슬라이스 = subsetAnalysisRefs in-memory 참조 필터 / 사본 파일 ❌)
│   ├── discovery/                  #   chain 1 (discovery-spec)
│   │   ├── discovery-spec.json
│   │   └── manifest.json
│   ├── spec/                        #   chain 2 (behavior-spec + acceptance-criteria + traceability-matrix)
│   ├── plan/                        #   chain 3 (task-plan / gate #3)
│   ├── test/                        #   chain 4 (test-spec + 실 test 코드 / RED)
│   └── impl/                        #   chain 5 (impl-spec + 실 impl 코드 / GREEN)
└── <scope-2>/                       # 운영 누적 시 N 개로 증가
```

규칙:

- **scope slug** = kebab-case / `^[a-z0-9][a-z0-9-]{1,63}$` / ASCII only (`id-conventions.md` §scope slug 정합).
- **stage 폴더명** = `discovery` / `spec` / `plan` / `test` / `impl` (chain prefix ❌ / 의미 ID paradigm 정합).
- **manifest** = `manifest.json` 단독 (단일 진실 SSOT / json-only handoff).
- **M4 sync** = canonical global 변경 시 SessionStart hook 이 `sync_state.drift_detected=true` 자동 set / cascade 는 사용자 명시 `chain-driver sync --scope <s>` 호출 시만 (안전 · 통제 · 자동 균형).

CLI:

- `chain-driver init <project> --scope <slug>` — scope 폴더 + 5 stage manifest 자동 생성
- `chain-driver next <project>` — gate 통과 시 stage 전이 + manifest status 갱신
- `chain-driver query <project> [--scope] [--stage] [--ref] [--stale]` — lookup (역인덱스 + drift filter)
- `chain-driver sync <project> [--scope <s>]` — `--scope` 없으면 markDrift summary / 있으면 cascade

근거: `methodology-spec/plugin-charter.md` §1 R5/R7 + §A.2 manifest 정의.

### design stage (☐ carry / 1차 = analysis 자산 reuse)

design stage = carry (1차 = analysis 자산 deliverable 7~9 reuse / 분리 ❌). master plan §K-3 carry 정합.

design stage 기존 자산 (analysis stage 안에 일부 포함됨 / 분리 시):

- `deliverables/7-ui-ux.md` (FE+디자인 cross-cutting)
- `deliverables/8-state-map.md` (FE 동적 행동)
- `deliverables/9-visual-manifest.md` (Playwright snapshot binary 진실)
- 이중 렌더링 FE 적용 ADR (DTCG 2025.10 W3C spec / 하단 인용)
- 권위 매개체 채택 ADR (권위 매개체 13 / 하단 인용)

design stage 산출물 (정식 분리 시):

- wireframe spec
- component-spec.json
- DTCG token (`design-tokens.json` 단독 / json-only handoff)

## 가치 경계 충돌 deferral (resolved)

**resolved** — (i-strict) 채택 = **(i) round-trip 부분 허용**.

원본 deferral:

- 본 방법론 가치 명세 = "한 방향 추출기 / round-trip 영구 scope 제외"
- vs 사용자 시나리오 6번 = "구현부분은 없고 테스트 코드 만드는 부분은 아직 안되어 있지만 추상화만 해놓자" → carry 신호
- 두 옵션: (i) round-trip 부분 허용 / (ii) 영구 scope 보존

상세:

- 사용자 진술: "분석해서 산출물 내고 그걸로 스팩문서 만들고 테스트 코드 만들고 그걸 기준으로 코드를 구현하는걸 목적으로 해... A로 하고 싶다."

retract 영역 (chain harness 안에서 정식 허용):

- ✅ 산출물 → 신규 코드 자동 생성 (chain 5 / implement)
- ✅ "신규 시스템 자동 생성" 주장 (chain 통과 시)
- ✅ round-trip 정확도 정량 측정 (test coverage / impl test pass rate)

보존 영역:

- ❌ AI 시뮬 (no-simulation 동일 / 강화 — chain 단계 5종 물증 7 필드)
- ✅ F-074 단방향 round-trip (CHAIN 1 → CHAIN 2 흡수)
- ✅ 70~80% 한계 인정 (명시 잔존 / gate별 사용자 검토 ≤ 15%)
- ✅ §8.1 strict ≥ 2 PoC corroboration (strict 임계 보존)

## Runtime 메커니즘

### analysis stage

- skill description trigger: 코드베이스 시그널 기반 자동 발동
- formal-spec-link-validator: cross-link 정합 (분석 stage 내부)
- drift-validator: handoff/layout 정합 (JSON-only handoff + artifact-registry detector)
- decision-table-validator: DMN 5-check
- spectral-runner: OpenAPI 정합
- static-runner: 외부 정적 분석 hook — R19 Tier 1 (in-plugin 자동실행: Semgrep + PMD / DEC-2026-06-07) + Tier 2 (사용자 환경 SARIF import / allowlist=PMD / orthogonal)
- schema-validator: Ajv 8 (FE 트랙)

### chain harness (6-stage)

master plan `~/.claude/plans/a-stateful-gadget.md` §H sequencing 정합:

- **chain stage axis** (`flows/sdlc-4stage-flow.json`) — stages + revisit_edges + sub_flow 통합
- **6 도구** — discovery-extraction-validator / chain-coverage-validator / spec-test-link-validator / **test-impl-pass-validator** (진짜 runner 호출) / traceability-matrix-builder / chain-revisit-detector
- **6 schema** — discovery-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / traceability-matrix
- **chain ADR** — go/stop gate UX / revisit loop (하단 인용)
- **chain skill + agent + flow**
- **hooks** — PostToolUse / PreToolUse / UserPromptSubmit
- **`.ai-context/state.json`** (사용자 프로젝트 chain stage 추적)

### carry

- design stage 채움
- use case 4종 entry flow 분기
- 사후 review/refactor stage (옵션 B)

## 인용

- 결단: DEC-2026-05-06-v2.0-i-strict-채택 (round-trip 부분 허용 / §가치 경계 충돌 deferral resolve)
- 결단: DEC-2026-06-06-analysis-exit-gate (analysis soft exit gate #0 / SEED-1 partially-reversed)
- 결단: DEC-2026-05-06-round-trip-부분-허용 (DEC-2026-04-29-round-trip-스코프-아웃 partial retract / 4 항목 중 2 retract)
- 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 (discovery 개칭 + plan stage 도입)
- 결단: DEC-2026-05-23-discovery-stage-v9
- 결단: DEC-2026-05-25-axis-a-phase-4-4-prime (gate #3 활성)
- 결단: DEC-2026-05-26-v11-paradigm-결단 (`../decisions/DEC-2026-05-26-v11-paradigm-결단.md`)
- plan stage 운영 정책 근거: DEC-2026-05-21 §8
- contract 강제 양 axis 근거: DEC-2026-05-26-v11-paradigm-결단 #8
- discovery-spec rename 근거: DEC-2026-05-26-discovery-spec-rename
- input/discovery 어댑터 평행 근거: DEC-2026-05-26-input-skill-roles
- discovery-from-\* 본체 근거: DEC-2026-05-26-discovery-input-bodies
- use-scenario taxonomy 근거: DEC-2026-05-30-use-scenario-taxonomy (`../decisions/DEC-2026-05-30-use-scenario-taxonomy.md`)
- 자산 매핑 매트릭스 종결: DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 → DEC-2026-05-17-v4-multi-agent-paradigm-채택
- G3 scope 폴더 근거: DEC-2026-05-15-g3-scope-folder-종결
- spike planning agent: DEC-2026-05-17-spike-planning-agent-실험 (commit `8605652`)
- ADR: ADR-010 (baseline+ratchet coverage)
- ADR: ADR-011 (json-only handoff)
- ADR: ADR-CHAIN-001 / ADR-CHAIN-002 (go/stop gate UX) / ADR-CHAIN-003 (revisit loop)
- ADR: ADR-FE-002 이중-렌더링-FE-적용 (`../docs/adr/ADR-FE-002-이중-렌더링-FE-적용.md`)
- ADR: ADR-FE-005 권위-매개체-채택 (`../docs/adr/ADR-FE-005-권위-매개체-12-채택.md`)
- schema: `schemas/discovery-spec.schema.json` / `behavior-spec.schema.json` / `acceptance-criteria.schema.json` / `task-plan.schema.json` / `test-spec.schema.json` / `impl-spec.schema.json` / `traceability-matrix.schema.json`
- flow: `flows/sdlc-4stage-flow.json` / `flows/plan.phase-flow.json`
- master plan: `~/.claude/plans/a-stateful-gadget.md`
- 외부 권위: DTCG 2025.10 (W3C Design Tokens) / WCAG 2.2 / React 19 / Vue 3
