# Lifecycle Contract — SDLC 단계 간 산출물 인터페이스

본 문서는 본 방법론의 lifecycle stage 간 **data contract** 를 정의. **SDLC chain harness** = **v9.0 6-stage** (analysis→discovery→spec→plan→test→implement). analysis stage = 본 문서가 채운 부분.

## 본 방법론 가치 명세 (use-scenario taxonomy + AX 운영 정체성)

> **가장 큰 목적 (P0)**: 산출물 = LLM 의 운영 컨텍스트 그 자체. 방법론의 가장 큰 목적 중 하나 = 이 컨텍스트를 평생 유지·동기화하여 프로젝트를 **AX 로 운영**하는 것. 4 use-scenario(**S2 AX전환=주 타깃** / S1 재생성 / S3 특성화 / greenfield)는 bootstrap 입력만 다르고 모두 AX 운영으로 수렴. greenfield 도 입력어댑터 analysis 로 산출물 생성(처음부터 AX-native). 산출물 = 전 stage base + 기능추가 역동기화. SSOT = `use-scenario-taxonomy.md`.

```
INPUT (4 use-scenario):  S2 AX전환(주 타깃)/S1 재생성/S3 특성화 = legacy 코드 / greenfield = PRD·디자인·계약
  ↓ analysis stage = 리버스 엔지니어링(legacy) + 입력어댑터(공통 / greenfield 는 이것만 / 현 입력어댑터 자산 / 단방향 추출)
  ↓
OUTPUT chain:
  [CHAIN 1] discovery-spec (discovery stage)      ── go/stop gate #1
  [CHAIN 2] behavior-spec + acceptance-criteria + 산출물 통합  ── go/stop gate #2
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

### analysis stage = 두 패스 (리버스 엔지니어링[legacy] + 입력어댑터[greenfield])

analysis 는 legacy _코드_ 가 아니라 _입력_ 을 요구한다:

- **리버스 엔지니어링 패스** (S1/S2/S3 / legacy 코드 있음) — `analysis-input-collection` 진입 → source-inventory·characterization·sql-inventory 등 코드 기반 phase.
- **입력어댑터 패스** (greenfield / 코드 없음) — `analysis-greenfield-bootstrap` 진입 → `analysis-input-orchestrate` greenfield 분기로 PRD·디자인·계약 흡수 → 각 analysis skill 의 **greenfield code-optional mode** 로 산출물 subset(architecture/domain/business-rules/openapi/schema) 생성. legacy 전용 산출물(antipatterns/migration-cautions) = N/A (빈/정당화). swagger 채널은 `tools/greenfield-bootstrap` 가 swagger-extract→openapi.yaml 을 **결정적 승격**.
- 두 패스 모두 같은 산출물 → 같은 정상 상태(AX 운영)로 수렴. greenfield = 산출물이 빌드 부산물로 나오며 처음부터 AX-native.
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
| **spec** (chain 2)                        | [`agents/spec-agent.md`](../agents/spec-agent.md) (4 spec skill + 4 base = 8 skill 사전 주입)                                                                                            | `spec-compose-behavior-spec`, `spec-derive-acceptance-criteria`, `spec-derive-unit-spec`, `spec-integrate-deliverables`, `_base-build-traceability-matrix`                                                                                                                                                                                                                                                                                                                                                                                                            | `PostToolUse(spec lint)`                                         | `chain-coverage-validator`, `formal-spec-link-validator`, `schema-validator`                                                                                                      | DB schema 변경 사항 명시 (신규 stack schema 매핑 draft)                                                                                     |
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
| (a) 기존 코드         | `analysis-input-collection`  | git clone + Glob/Grep + baseline+ratchet                                                                                  | `input.json` (`.ai-context/` 루트 싱글톤)                                         |
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
| **`analysis-from-*`** (4)  | **최초 1회** (legacy baseline 수립)  | analysis 산출물 만들기 (visual-manifest / ui-state-map / inventory / domain 등 canonical global `.ai-context/base/`) | `analysis-from-{figma, swagger, prompt, plan-doc}`                                                      |
| **`discovery-from-*`** (4) | **신규 건마다** (scope 진입 trigger) | UC + intent + flow 추출 → discovery-spec(discovery 산출)                                                         | `discovery-from-{analysis-output, figma, swagger, nl-md}` |

같은 figma 파일이라도 (a) baseline 수립 시 = `analysis-from-figma`, (b) 신규 feature scope 진입 시 = `discovery-from-figma`. **다른 목적/다른 산출**. 둘 다 유지 = 중복 ❌ / 다른 axis ✅. `discovery-from-nl-md` 는 **NFR 1차 채널** (다른 채널은 부 / NL 만이 명시 NFR 표현).

## 단계 간 인터페이스 (data contract)

### chain 1 (발견) — discovery stage

1차 구현 = **legacy 시스템 재구축 single-case** (사용자 답변 1번 정합). use case 4종 분기 (legacy/신규/수정/버그) = carry.

1차 input (analysis stage 가 받은 산출물 → discovery stage 가 받음):

- 산출물 + 8 FE 산출물 (analysis stage 산출 / `<user-project>/.ai-context/base/`)
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

### chain 2 (스펙) — spec stage ("기존 산출물 + 신규 추가" 사용자 답변 3 정합)

input (spec stage 가 받음):

- discovery-spec.json
- analysis stage 산출물 (1~15 + 4.5)
- finding-system 누적

5 영역 강도 (spec stage):

| 기획 | 디자인 | FE  | BE  | DB  | 공통 |
| ---- | ------ | --- | --- | --- | ---- |
| 약   | 약     | 강  | 강  | 강  | 강   |

산출물 (spec stage 가 만듦):

- **behavior-spec.json** (deliverable 18 / `schemas/behavior-spec.schema.json`) — `formal-spec` phase 산출물 (state-machine / sequence / decision-table / invariant / property-test) 의 chain 2 격상 + discovery-spec.use_cases 흡수
- **acceptance-criteria.json** (deliverable 19 / `schemas/acceptance-criteria.schema.json`) — Gherkin (Given/When/Then) BDD 정합 / verifiable=true 의무 / MoSCoW (must/should/nice)
- **현 산출물 통합** (변경 ❌) — behavior-spec.cross_links 가 모든 산출물 reference (cross-link coverage 강제)

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

- **test-spec.json** (deliverable 20 / `schemas/test-spec.schema.json`) — TC-\* (테스트 케이스 메타) / type (unit/integration/contract/e2e/property) / **test_layer (unit/composition / v0.36.0)** / framework (jest/vitest/junit/pytest/playwright)
- **실 test 코드** (사용자 프로젝트 `<project>/test/` 또는 `__tests__/`) — RED 의무 (CHAIN 4 종결 시 모든 test fail / impl 부재)
- **5종 물증 7 필드** (no-simulation — runner_version + stdout + stderr + timestamp + pass/fail count + duration + reproduction + result_hash)

spec-test-link-validator = AC→TC 1:N 정합 + framework match (analysis-source-inventory) + coverage ≥ 0.85.

> **TDD/unit 층**: behavior 스레드와 나란히 **unit-spec.json** (deliverable 27 / `schemas/unit-spec.schema.json` / `UNIT-*`) 운반. **emit 단계 = spec (양 provenance)** — work-unit spec zone(`scopes/<scope>/spec/unit-spec.json` / 평면 `base/unit-spec.json` / behavior-spec·acceptance-criteria 와 동일 자리 / findings-aggregator scope-aware resolver `unit-spec.json→spec` 정합). **소스는 provenance 별**: S2(레거시)=analysis `code-graph ∩ domain.behaviors` 에서 발견(characterized_from_code / `spec-derive-unit-spec` skill / v0.50.0 배선) / greenfield·S1=`formal-spec.invariants` 에서 설계(designed_from_spec / 후속 carry). test 단계는 `test_layer=unit` TC 로 UNIT 을 검증(class_ref) + composition TC 의 `mocks[]` 로 mocking-soundness. 검증기 = `validateMockSoundness`(spec-test-link / test gate#4) + `validateUnitTestObligation`(plan-coverage / plan gate#3) = **v0.40.0 HARD 차단**(§8.1 3-도메인 충족 / provenance-무관 hygiene). 신뢰 분리: spec 파생 UNIT obligation·mock=게이트(HARD) / unit-coverage matrix ratio·code-graph method-axis·mutation=reference-lens·propose-only(영구 비-게이트). SSOT = `methodology-spec/policies/test-layering.md`.

### chain 5 (구현) — implement stage (i-strict / chain harness 안에서 round-trip 정식 허용)

input (implement stage 가 받음):

- test-spec.json + 실 test 코드 (RED)
- behavior-spec.json
- 산출물

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

### 분석 → 스펙 (analysis 자산 = chain 2 spec stage 의 input / "기존 산출물 + 신규 추가" 정합)

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
| 25  | recovered-adr                     | `recovered-adr.schema.json`        | 공통 (역추적 결정 / official·opt-in / legacy 한정)   |
| 26  | run-manifest                      | `run-manifest.schema.json`         | 공통 (운영 컨텍스트 / official·opt-in / runnable 한정) |

"기획" 트랙 산출물 = 본 stage 부재 (carry §기획→분석 input 참조).

> **#25 recovered-adr** (역공학 델타 #3) — 역추적한 과거 architecture 결정 + rationale abstention. `analysis-recovered-adr` skill 이 code/config/structure 증거에서 결정 복구(evidence ≥1 fail-closed) / WHY 복구불가 = `rationale.certainty=unverified-intent` 정직 abstain(날조 ❌ / schema observed⟹basis_evidence 강제). forward `task-plan.adrs[]` 의 backward 보완 / rationale 어휘 = discovery-spec intent_certainty 재사용(신규 enum ❌). cross-cutting aspect / **official·opt-in / legacy·brownfield 한정**(≥2 도메인 corroborated / 근거 ## 인용). **번호 = #25** (deliverables/ canonical sequence 다음 free / sibling run-manifest 는 #26 으로 정정 완료 = 델타 #2a #16↔error-mapping 충돌 해소).
> **#26 run-manifest** (역공학 델타 #2-a) — build/run/env positive 운영 manifest (migration-cautions negative 의 반대편). `analysis-run-manifest` skill 이 실 config(package.json/Dockerfile/compose/gradle/application.yml/.env.example)에서 source-grounded 추출. env value 미저장(name+is_secret만). cross-cutting aspect / **official·opt-in / runnable 산출물 한정**(≥2 paradigm corroborated / 근거 ## 인용). canonical doc = `deliverables/26-run-manifest.md` (#16 은 error-mapping / 표 순번 ≠ deliverables/ canonical 번호).

> **#3 domain — `verdict` 는 등록 BC 의 REQUIRED 필드** (`domain.schema.json#bounded_contexts[].items.required`). 각 BC 는 `verdict`(enum = `core | supporting | cross_cutting | read_model | operational`) + `verdict_basis`(`write_ops` / `read_ops` / `owned_aggregates` / `fan_in` / `decided_by` = `rule | human-override`) 를 명시해야 한다. **판별축 = 소유한 쓰기 aggregate** = `sql-inventory summary.by_type` 의 `insert + update + delete = write_ops`. `write_ops > 0` ⟹ `core | supporting`(쓰기 aggregate 소유 → per-BC `domains/<BC>/`) / `write_ops == 0` ⟹ `cross_cutting`(소유 없는 횡단·미등록 → `shared/cross-cutting/<module>/`) | `read_model`(타 BC aggregate 읽기 투영) | `operational`(배치). `write_ops` 하나로 대부분이 결정론 분리되고, 동률 셋(supporting/read_model/operational/cross_cutting)의 최종 택만 fan-in·역할 기반 `decided_by=human-override`. verdict↔write_ops 모순·`verdict_basis.write_ops`≠실제 = 게이트 차단(주관·stale 근거 봉쇄 / 근거 ## 인용).

**파일 위치 컨벤션** (사용자 프로젝트):

```
<user-project>/
├── .ai-context/
│   ├── input.json           # analysis-input-collection skill 메타 (user project file 명 = manifest phase ID axis / 짧음 형식)
│   ├── baseline-<date>.json         # baseline+ratchet
│   ├── findings.md                  # finding 누적
│   └── output/                      # canonical-global 1 세트 (read model 불변 / zone = storage-layout / v0.41.0)
│       │                            #   ── 진입점(well-known basename / 디렉토리 이동만·rename ❌) ──
│       ├── business-rules.json      # 분할 index (bc_files[] → domains/<BC>/business-rules.json)
│       ├── antipatterns.json        # 카탈로그 (item.bc_scope: BC-id|cross_cutting / SOFT logical split)
│       ├── migration-cautions.json  # 카탈로그 (caution.bc_scope 동형)
│       ├── shared/                  # ZONE 1 — repo-wide + cross-cutting (각 1벌 / analysis 1회 / read-only / 병렬 = read-only 공유)
│       │   ├── inventory.json
│       │   ├── architecture.json
│       │   ├── schema.json          # DB (단일 물리 스키마 / DB-always-on)
│       │   ├── scope-carve.json     # reference-lens (도메인 후보 산출 → 도메인으로 못 쪼갬 / gate-inject ❌)
│       │   ├── code-graph.json      # reference-lens (applies_to:all / gate-inject ❌ / 구조질문 탐색 우선=policies/codegraph-navigation-first.md)
│       │   ├── recovered-adr.json   # repo-wide arch 결정 (legacy·brownfield / official·opt-in)
│       │   ├── run-manifest.json    # build/run/env 운영 컨텍스트 (official·opt-in / runnable 한정)
│       │   ├── error-mapping-spec.json   # app-wide HTTP 에러 계약
│       │   ├── legacy-spectrum.json      # 공통
│       │   ├── static-security-spec.json # BE+FE cross-cutting
│       │   ├── cross-cutting/        # verdict=cross_cutting 관심사의 정규 home (소유 없는 횡단 / 미등록)
│       │   │   └── <module>/         #   예: athrt, base — write_ops==0 → BC 미등록 / domains/<BC>/ 샤드 없음
│       │   └── domain.json          # BC 카탈로그(repo-wide) — stakeholders/business_intent/ubiquitous_language + bounded_contexts[]
│       │                            #   (≥2 BC + 병렬 압력 시 per-BC 블록 샤딩 = 차기 / 현 1-BC = whole)
│       ├── domains/                 # ZONE 2 — per-BC 샤드 (각 도메인이 자기 폴더만 write → 병렬·누적 무충돌)
│       │   └── <BC>/                #   예: BC-EVENT (BC id = architecture.json source)
│       │       ├── business-rules.json   # leaf (top-level index 가 가리킴)
│       │       ├── openapi.yaml          # BC-scoped paths (tag-grouped) / BE
│       │       ├── formal-spec.json
│       │       ├── characterization/     # spec + coverage + snapshots/ + evidence/ (디렉토리 통째 이동)
│       │       ├── sql-inventory/        # json + legacy-xml-staging/ + evidence/ (디렉토리 통째 이동)
│       │       ├── state-map.json        # FE per-BC (visual-manifest/a11y/i18n/form-validation/type-spec 동형)
│       │       ├── antipatterns.json     # 도메인-local AP (bc_scope=<BC> / cross_cutting 은 top-level 카탈로그 유지)
│       │       └── migration-cautions.json  # 도메인-local MC (동형)
│       └── tool-runs/               # 진짜 도구 raw 출력 보존 (shared / per-BC companion 은 domains/<BC>/ 동거 가능)
```

**zone 규약 (v0.41.0 / SOFT·opt-in)**:

- **read model 불변**: zone = **storage-layout** 변경일 뿐. canonical-global READ model(논리적으로 1 세트 / scope 는 참조·무복사 / DEC-2026-06-07)은 그대로. 샤드는 합쳐서 1 세트(business-rules index+leaf 선례 동형 / `sharding_contradicts_canonical=false`). per-scope 복사본 ❌(= 폐기된 `*.subset.json` anti-pattern 부활 금지).
- **공통(shared/)** = repo-wide + cross-cutting 구조 사실 → analysis 1회 산출·read-only. 병렬 분석 시 **읽기만** = 무충돌.
- **도메인(domains/<BC>/)** = per-BC 샤드 → 각 도메인이 **자기 폴더만 write** = 도메인 간·병렬(worktree) 무충돌. 도메인 추가 = 디렉토리 add(머지 깔끔).
- **cross_cutting 의 정규 home = `shared/cross-cutting/<module>/`** = `write_ops==0` 인 소유 없는 횡단 관심사(인증·기반·공유 lookup 류)의 단일 거처. **불변식: `verdict==cross_cutting` ⟹ `domains/<BC>/` 샤드 없음(BC 미등록)** = 쓰기 aggregate 를 소유하지 않으므로 per-BC 등록 대상이 아니다. 같은 개념이 `shared/cross-cutting/<module>/` 와 `domains/<BC>/` 양쪽에 동시 등재되면 **이중분류**(athrt/base 류) — 한쪽만 정본. 횡단→BC 승격(읽기 lookup 이 실제 쓰기 aggregate 를 갖게 됨)이 일어나면 `shared/cross-cutting/<module>/` 쌍둥이는 **삭제**가 정합(stale concern 잔존 ❌).
- **verdict 별 기대 산출물(tier)**: 등록 BC 가 verdict 에 따라 **어느 산출물 묶음을 갖길 기대하는지**가 다르다. `core | supporting` ⟹ per-BC 전체 산출물(domains/<BC>/ 의 business-rules / openapi / formal-spec / characterization / sql-inventory + FE-track) / `read_model` ⟹ 읽기·쿼리 산출물(읽기 투영·조회 모델만 / 쓰기 aggregate·쓰기 규칙 없음) / `operational` ⟹ operational-task(배치 잡 / 스케줄 / 운영 절차) / `cross_cutting` ⟹ `shared/cross-cutting/` 만(per-BC 샤드 없음 / 위 불변식). tier 와 실제 산출물 묶음의 불일치(예: `cross_cutting` 인데 per-BC 샤드 존재, `read_model` 인데 쓰기 규칙 존재)는 게이트가 surface 한다.
- **명시-tier 원칙(추론 금지)**: BC 의 tier 는 **단일 `domain.json` 파일이 존재한다는 사실만으로 full-leaf(전체 산출물 보유)를 추론하지 않는다.** tier(=기대 산출물 묶음)는 verdict 와 함께 **명시 선언**되어야 한다. 특히 use_cases-backfill 로 채워진 leaf(use_cases 만 역채움된 domain 샤드)는 그 자체로 full-leaf 주장이 아니다 — 명시 선언이 없으면 미충족 tier 로 취급(파일 유무 ≠ tier 충족).
- **병렬 worktree → fragment-only → post-merge 직렬 rollup (MANDATORY)**: 병렬 worktree/CLI 분석은 **자기 `domains/<BC>/` fragment 만 write** 하고 shared top-level 누적기 4종(`business-rules.json` index·`migration-cautions.json`·findings·`domain.json#bounded_contexts[]`)은 **직접 수정 ❌**(병렬 N개 동시 append = 머지 충돌). 누적은 머지 후 **`${CLAUDE_PLUGIN_ROOT}/tools/bc-accumulator-rollup/src/cli.js --bc-dir <output>/domains/<BC> --output-root <output>` 직렬 1회**(결정론·멱등·sibling 보존 / `--dry-run` 미리보기). 이 규약 전까지 충돌-0 은 **방법론 강제가 아닌 작업자 규율**(memory `resve-analysis-zone-discipline`)에 의존했음 — 본 도구가 그 규율을 결정론 단계로 격상.
- **진입점 basename 불변**: `business-rules.json`(index) / `antipatterns.json` / `migration-cautions.json` 은 top-level 유지. **디렉토리 이동만, 파일명 rename ❌**(drift-validator baseline / traceability ANALYSIS_FILENAMES / sync CANONICAL_ANALYSIS_FILES 연쇄 churn 회피).
- **set-level 인덱스 = `work-unit-manifest.analysis_refs.artifacts`** (name→repo-rel-path 맵 / findings-aggregator gate#0 가 결정론 resolve). 산출물이 shared/ 든 domains/<BC>/ 든 manifest 가 가리키는 경로로 검증기 fleet 자동 추종.
- **backward-compat**: 평면 레이아웃(`output/<artifact>.json`)도 **계속 valid**. 로더·경로해석은 manifest 우선 → 없으면 평면 fallback. 마이그레이션은 점진(opt-in). 검증 스키마 무변경 / 신규는 additive only.
- **§8.1**: 디렉토리 zone = **≥4-domain corroborated**(EVENT/RESV-GOLF/REQMNG/WLFR exercised — degenerate 탈출). post-merge 직렬 rollup 규약은 **`bc-accumulator-rollup` 2-domain dogfood corroborated**(BC-REQMNG: total_rules 60→96 / BC-WLFR: 60→185·findings 0→40 버킷 재계산·멱등·sibling 보존·live shared 무접촉) → SOFT→**격상**. 단 `bc_scope` 필드 auto-split·HARD gate 는 여전히 deferred(F14 불변). **FE-track per-BC 배치(state-map/visual-manifest/a11y/i18n/form-validation/type-spec → domains/<BC>/)는 미검증 carry**(검증 dogfood = ep-be-gea BE-only / FE PoC 부재 → BE 동형 원칙 적용일 뿐).

**G3 — 작업 단위 (scope) 폴더 + manifest 자동 생성**:

```
<user-project>/.ai-context/
├── output/                          # ↑ canonical global = scope 와 무관 (위 layout 그대로)
├── <scope>/                         # G3 — feature/도메인 작업 단위 (사용자 자유 명명 / kebab-case)
│   ├── manifest.json                #   scope 전체 status / analysis_refs / sync_state
│   │                                #   (scope = canonical full 참조 / 슬라이싱 = drift BC-hash·validation scope-token / 사본 ❌ / 근거 ## 인용)
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
- **멀티모듈 repo 배치 규칙** = Gradle/Maven 멀티모듈·모노레포에서도 `.ai-context/` 는 **repo 루트 단일**. 개별 모듈 내부 분산 ❌. 근거 3:
  1. **scope(응집 단위) ≠ 모듈(배포 단위).** scope = feature 는 모듈을 관통(한 feature 의 도메인이 공유-core 에, REST 얼굴이 web 모듈에, 배치 얼굴이 batch 모듈에) → 모듈 안에 두면 한 feature 산출물이 쪼개진다.
  2. **글로벌 산출물은 모듈 무소속.** `output/` canonical global(inventory / code-graph / schema / 공유-kernel)은 repo 전체를 기술 → 어느 한 모듈 소속 불가.
  3. **living-sync · dep-graph federation 이 단일 트리 가정.** cross-scope 의존 그래프·양방향 역동기화·drift 추적이 `.ai-context/scopes/<scope>/` 단일 트리 위에서 동작 (모듈 분산 시 cross-scope 연결 단절).
  - **예외(모듈별 `.ai-context/` 허용)** = 모듈이 **독립 배포 + 독립 도메인**(마이크로서비스 모노레포 / 모듈마다 자기 DB·도메인). 판별 축 = "모듈 = 배포축(shared-core+entrypoints)" → repo 루트 / "모듈 = 도메인축(독립 서비스)" → 모듈별. 멀티 entrypoint 가 한 core 를 공유하는 패턴은 **repo 루트**.
  - **JS/TS 워크스페이스(FE) 모노레포 sub-case** = pnpm/npm/yarn workspaces · nx · turbo 등에서 판별 축 = **"독립 빌드·배포 아티팩트"**(BE 의 "자기 DB" 대응물). 각 `apps/<app>` 가 **자체 번들러 설정**(vite/webpack/next + 자기 `tsconfig`·`package.json`)으로 **별도 배포 번들**(독립 SPA)을 생성하면 → 그 앱은 마이크로서비스에 상응하는 **예외 → 앱별 `apps/<app>/.ai-context/`**(co-located / repo 루트 단일 ❌). 빌드 단위 = 분석·codegraph 인덱싱 단위가 일치해 cross-app 그래프 노이즈가 제거된다. **공유 워크스페이스 라이브러리**(`apps/common` / `packages/*`)는 런타임 공유 코어가 **아니라 빌드타임 소스 의존성**(각 번들에 컴파일 인입) → "한 core 공유 → repo 루트" 로 **오판 금지**(레이아웃을 루트로 끌어내리지 않음). 공유 lib 는 shared-kernel 로 1회 분석하거나 cross-app 참조. **참조 altitude**: 앱-내부 소스 참조 = 앱 루트 상대(`src/...`) → `.ai-context` 가 앱과 함께 이동/복제 가능(self-contained / gea 단일-repo 동형) / 외부 앱·공유 lib 참조 = repo-상대 보존. 기존 `analysis-scope-carve --scope-root apps/<app>`(git log pathspec 한정)와 정합 — 분석을 앱에 한정 + 그 앱 산출물은 `apps/<app>/.ai-context/`. corroboration = mis-fe-admin(apps/tlm + apps/eam / **FE 첫 PoC**).

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
- scope 슬라이싱 근거: DEC-2026-06-07-subset-retire + DEC-2026-06-10-subset-slicing-corollary-supersede (scope = canonical full 참조 / 슬라이싱 = drift BC-hash·validation scope-token / subsetAnalysisRefs prefix 필터 retire)
- #25/#26 official 격상 근거: DEC-2026-06-10-reverse-eng-delta-2a-3-promotion (recovered-adr #25 / run-manifest #26 draft→official opt-in / ≥2 도메인 corroborated)
- FE 워크스페이스 모노레포 per-app `.ai-context/` 근거: DEC-2026-06-24-fe-workspace-monorepo-per-app-ai-context (mis-fe-admin apps/tlm + apps/eam corroboration)
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
- BC verdict 분류·write_ops 판별축·cross-cutting home·tier·명시-tier 근거: DEC-2026-06-15-bc-verdict-classification (`../decisions/DEC-2026-06-15-bc-verdict-classification.md`) — verdict REQUIRED(`schemas/domain.schema.json#bounded_contexts[].items.required`) + verdict-consistency-validator (VC1 미등록 / VC2 verdict↔write_ops 모순 / VC3 이중분류 / VC4 stale concern) analysis gate#0 강제
- 이중분류·read-only 누수 reframe 근거: DEC-2026-06-15-analysis-zone-orphan-propose / DEC-2026-06-12-sql-embedded-static-residual-reframe
- FE 워크스페이스(JS/TS 모노레포) 앱별 `.ai-context/` 배치 sub-case 근거: DEC-2026-06-24-fe-workspace-monorepo-per-app-ai-context (`../decisions/DEC-2026-06-24-fe-workspace-monorepo-per-app-ai-context.md`)
