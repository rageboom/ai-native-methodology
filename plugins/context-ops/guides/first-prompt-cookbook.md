# First Prompt Cookbook — 자연어 → skill 매핑 표

본 가이드 = plugin install 후 사용자가 자기 의도를 자연어로 어떻게 표현하면 어떤 skill 자동 발동되는지.

skill description 매칭 = Claude Code 가 SKILL.md frontmatter 검색 / slash command 불필요.

## 1. Analysis stage (chain 1 진입 전)

### 1.1 입력 정리 + Inventory

| 자연어 prompt                                             | 발동 skill                                                          | 산출                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| "이 코드베이스 분석 시작" / "분석 시작" / "프로젝트 분석" | [`analysis-input-collection`](../skills/analysis-input-collection/) | `_manifest.yml`                             |
| "inventory 추출" / "코드베이스 인벤토리" / "파일 list"    | [`analysis-source-inventory`](../skills/analysis-source-inventory/) | `inventory.json` / `tree.md` / `stats.json` |

### 1.2 Architecture + DB

| 자연어 prompt                                           | 발동 skill                                                    | 산출                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| "아키텍처 분석" / "의존성 그래프" / "circular dep 검출" | [`analysis-architecture`](../skills/analysis-architecture/)   | `architecture.json` (json 단독 SSOT) / `circular-dependencies.md` |
| "DB schema 추출" / "ERD 만들어줘" / "DB 스키마 분석"    | [`analysis-db-schema-erd`](../skills/analysis-db-schema-erd/) | `schema.{json,sql}` (json 단독 SSOT)                              |

### 1.3 Domain + Rules (v2.4 dual representation)

| 자연어 prompt                                                 | 발동 skill                                                                              | 산출                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| "도메인 모델 추출" / "도메인 분석" / "BC 식별"                | [`analysis-domain-model`](../skills/analysis-domain-model/)                             | `domain.json` (json 단독 SSOT)                                          |
| "비즈니스 규칙 추출" / "BR 추출" / "rules 분석"               | [`analysis-business-rules`](../skills/analysis-business-rules/)                         | `rules.json` (json 단독 SSOT / natural_language + given/when/then dual) |
| "`formal-spec` phase 형식 명세 검증" / "drift 검증"           | [`analysis-formal-spec-validation`](../skills/analysis-formal-spec-validation/)         | drift / DMN / cross-link finding                                        |
| "characterization 추출" / "의도 vs 버그 분류"                 | [`analysis-characterization-test`](../skills/analysis-characterization-test/)           | `characterization-spec.json` (v2.1)                                     |
| "SQL inventory 추출" / "매퍼 SQL 정리"                        | [`analysis-sql-inventory`](../skills/analysis-sql-inventory/)                           | `sql-inventory.json` 12컬럼 (v2.2 / v2.3 migration_priority)            |
| **"비즈니스 규칙 의미 일관성 검증" / "BR cross-consistency"** | [`analysis-br-cross-consistency-check`](../skills/analysis-br-cross-consistency-check/) | **v2.5 신규 / Layer 1 결정적 + Layer 2 LLM (Sonnet 4.6 sub-agent)**     |

### 1.4 API + UI/State (FE)

| 자연어 prompt                                         | 발동 skill                                                                    | 산출                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| "OpenAPI 만들어줘" / "API 명세 추출" / "openapi.yaml" | [`analysis-openapi`](../skills/analysis-openapi/)                             | `openapi.yaml` (json/yaml 단독 SSOT) |
| "UI rules 추출" / "FE rules"                          | [`analysis-api-rule-mapping`](../skills/analysis-api-rule-mapping/)           | `business-rules.json` (FE 영역)      |
| "state-map 추출" / "FE state machine"                 | [`analysis-ui-state-map-fe`](../skills/analysis-ui-state-map-fe/)             | `state-map.json` (FE)                |
| "visual-manifest 추출" / "Playwright snapshot"        | [`analysis-ui-visual-manifest-fe`](../skills/analysis-ui-visual-manifest-fe/) | `visual-manifest.json` (binary)      |
| "form validation 추출" / "Zod / RHF 분석"             | [`analysis-form-validation-fe`](../skills/analysis-form-validation-fe/)       | `form-validation-spec.json`          |
| "type-spec 추출" / "TypeScript type 분석"             | [`analysis-type-spec-fe`](../skills/analysis-type-spec-fe/)                   | `type-spec.json` (ts-morph)          |
| "error-mapping 추출" / "BE error code 분석"           | [`analysis-error-mapping`](../skills/analysis-error-mapping/)                 | `error-mapping-spec.json`            |

### 1.5 Quality (Phase 6)

| 자연어 prompt                                    | 발동 skill                                                                | 산출                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| "antipattern 정리" / "안티패턴 통합" / "AP 도출" | [`analysis-quality-antipattern`](../skills/analysis-quality-antipattern/) | `antipatterns.json` / `migration-cautions.json` (json 단독 SSOT) |

### 1.6 Aspect (cross-cutting / phase 무관)

| 자연어 prompt                                    | 발동 skill                                                                      | 산출                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------- |
| "a11y 검증" / "WCAG 2.2 AA 검증" / "접근성 검증" | [`analysis-aspect-a11y`](../skills/analysis-aspect-a11y/)                       | `a11y-spec.json` (axe-core)             |
| "i18n 검증" / "다국어 분석"                      | [`analysis-aspect-i18n`](../skills/analysis-aspect-i18n/)                       | `i18n-spec.json`                        |
| "정적 보안 검증" / "Semgrep 실행" / "OWASP 검증" | [`analysis-aspect-static-security`](../skills/analysis-aspect-static-security/) | `static-security-spec.json` (진짜 도구) |
| "legacy spectrum 분류" / "Strangler 분류"        | [`analysis-aspect-legacy`](../skills/analysis-aspect-legacy/)                   | `legacy-spectrum.json`                  |

aspect skill = 코드베이스 시그널 (`package.json` react / `pom.xml` spring-boot 등) 자동 매칭.

## 2. Chain harness stage (Layer 2 통합)

> **진입 기본값 = discovery (입구·라우터)**: 분석 외 **모든 작업의 시작은 discovery** 다. stage 를 명시하지 않은 자연어 변경요청("예약 취소 기능 추가해줘" / "이 버그 고쳐줘")은 `hooks-bridge.routeEntry` 가 `discovery-from-nl-md` 로 폴백한다(이전엔 silent pass-through 였음). discovery 가 의도를 ground 한 뒤, 룰 변경이면 analysis 로 상향 라우팅한다(`living-sync-operating-model §4`). **skip-ahead 차단**: discovery 미진입 상태에서 spec/plan/test/impl 산출물을 직접 쓰려 하면(예: discovery 없이 `behavior-spec.json` write) PreToolUse 가 결정론적으로 차단(exit 2 / orphan 방지) — `discovery-from-nl-md` 진입 또는 `chain-driver next` 정식 전진으로 풀린다. (참고: `chain-driver route` 명령은 *이미 만들어진* discovery-spec 의 매핑을 그래프 origin 으로 바꾸는 post-discovery 라우터 — prompt→discovery **진입** 라우팅과 별개.)

### 2.1 Chain 1 (discovery) — Layer 2 LLM 의무 통과

| 자연어 prompt                                                            | 발동 skill                                                                            | 산출                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------- |
| "발견 단계 시작" / "기획 단계 시작" / "discovery 진입" / "use case 추출" | [`discovery-from-analysis-output`](../skills/discovery-from-analysis-output/)         | `discovery-spec.json` (json 단독 SSOT) |
| "Swagger/OpenAPI 에서 추출"                                              | [`discovery-from-swagger`](../skills/discovery-from-swagger/)                         | UC + intent (API spec 입력 어댑터)     |
| "Figma 에서 추출"                                                        | [`discovery-from-figma`](../skills/discovery-from-figma/)                             | UC + intent (디자인 입력 어댑터)       |
| "기획문서/자연어 md 에서 추출"                                           | [`discovery-from-nl-md`](../skills/discovery-from-nl-md/)                             | UC + intent (NL 입력 어댑터)           |
| "use case 분해" / "UC decompose" / "story 분해"                          | [`discovery-decompose-use-cases`](../skills/discovery-decompose-use-cases/)           | UC-\* 분해                             |
| "비즈니스 의도 식별" / "domain priority" / "intent 추출"                 | [`discovery-identify-business-intent`](../skills/discovery-identify-business-intent/) | intent-tag + domain priority           |

chain 1 gate 진입 시 chain-driver 가 `br-cross-consistency-validator` Layer 1 결정적 + Layer 2 LLM (Sonnet 4.6 sub-agent invocation) 양쪽 통과 강제. `semantic_drift_detected` 또는 `confidence_cap_exceeded` finding 발생 시 chain 진입 차단.

**timing 분리**: `discovery-from-{analysis-output, figma, swagger, nl-md}` 4종 = **scope 진입 시** UC 추출용. 같은 figma/swagger/NL 소스를 **최초 1회 baseline 수립** 시 쓰려면 `analysis-from-{figma, swagger, prompt, plan-doc}` (analysis stage / Track=FE 등). 두 set 평행 유지 / 다른 timing+책임. `discovery-from-nl-md` = NFR 1차 채널. 자세한 paradigm = `methodology-spec/lifecycle-contract.md` §Input 어댑터 timing 분리.

#### 2.1.1 discovery 가 잘 ground 하는 prompt 쓰는 법 (grounding 레버)

discovery 는 당신 의도를 **실제 존재하는 것**(코드 / 분석 산출물)에 grep 으로 앵커링한다 (`source_grounded_evidence` / `grep_hit_count > 0` 의무 — AI 환각 차단). 그래서 **프로젝트가 실제 쓰는 용어**로 말할수록 기존 노드에 잘 연결되고, 신규 기능은 (없던 노드라) **고립이 아니라 기존에 연결된 새 노드로 태어난다**. 같은 의도라도 아래 6 레버를 챙기면 grounding 품질이 크게 오른다.

| 레버                                       | 약한 prompt          | 강한 prompt (잘 ground)                        |
| ------------------------------------------ | -------------------- | ---------------------------------------------- |
| ① 프로젝트 실제 도메인 용어                | "그거 고쳐줘"        | "**주문(Order)**의 **취소(Cancel)**"           |
| ② actor + entity + trigger (= UC 1단위)    | "취소 개선"          | "**고객이 / 주문을 / 배송 전 부분취소**할 수 있어야" |
| ③ 비즈니스 규칙 명시                       | "잘 되게"            | "미배송 품목만 취소 / 환불은 원결제수단 원복"  |
| ④ 기존 연결점 짚기 (cross_link seed)       | (없음)               | "기존 **전체취소(UC-ORDER-003)**와 충돌 없게"  |
| ⑤ 신규 / 수정 구분                         | 모호                 | "**신규**" 또는 "기존 X **수정**"              |
| ⑥ 출처 가리키기                            | (없음)               | "swagger `POST /orders/{id}/cancel`" / "기획서 3.2절" / figma 프레임 |

**종합 예시**

- ❌ `"취소 기능 좀 개선해줘"` — ground 단서 빈약 → 얕은 UC 1개.
- ✅ `"고객이 배송 전 주문을 부분 취소할 수 있게 해줘(신규). 미배송 품목만 취소, 환불은 원결제수단 원복. 기존 전체취소(주문/취소 도메인)랑 충돌 없게."`

**왜 효과 있나**: ② = discovery 가 UC 를 쪼개는 단위(`discovery-decompose-use-cases`: 1 actor + 1 entity + 1 trigger)와 일치 → 깔끔히 1 UC 매핑. ①④⑥ = grep 앵커 제공 → 기존 노드 cross_link 생존(고립 노드 ❌). ③ = `business_rules_intent` → 하류 AC / test 로 흐름. 신규 노드는 discovery 에서 `propose` 로 태어나 gate #1 사람 확인 후 그래프에 박히며, 이후 그 id 로 `chain-driver navigate` 의존성 조회가 가능해진다.

### 2.2 Chain 2 (spec)

| 자연어 prompt                                               | 발동 skill                                                                      | 산출                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| "behavior spec 만들어" / "BHV 도출" / "executable contract" | [`spec-compose-behavior-spec`](../skills/spec-compose-behavior-spec/)           | `behavior-spec.json` (json 단독 SSOT / BHV-\*)      |
| "acceptance criteria 도출" / "Gherkin 작성" / "AC 추출"     | [`spec-derive-acceptance-criteria`](../skills/spec-derive-acceptance-criteria/) | `acceptance-criteria.json` (json 단독 SSOT / AC-\*) |
| "산출물 통합" / "deliverables 통합" / "spec 통합"              | [`spec-integrate-deliverables`](../skills/spec-integrate-deliverables/)         | analysis 산출물 통합                            |

### 2.3 Chain 3 (plan / gate #3)

| 자연어 prompt             | 발동 skill                                                              | 산출                                                     |
| ------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| "plan / 계획 / task 분해" | [`plan-decompose-and-sequence`](../skills/plan-decompose-and-sequence/) | `task-plan.json` (json 단독 SSOT / tasks / dependencies) |
| "ADR / 아키텍처 결정"     | [`plan-architect-decisions`](../skills/plan-architect-decisions/)       | ADR (alternatives ≥3) + integration points               |
| "risk / NFR allocation"   | [`plan-risk-and-nfr`](../skills/plan-risk-and-nfr/)                     | risks[] + nfr_allocation[] (hard gate)                   |

gate #3 (plan-coverage-validator / NFR allocation hard gate + ADR alternatives ≥3 + dependency cycle / chain 3 = gate #3 1:1).

### 2.4 Chain 4 (test / RED 의무)

| 자연어 prompt                                         | 발동 skill                                                      | 산출                                      |
| ----------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------- |
| "test spec 생성" / "TC 도출" / "test case 분해"       | [`test-generate-test-spec`](../skills/test-generate-test-spec/) | `test-spec.json` (json 단독 SSOT / TC-\*) |
| "test code RED" / "test 실 실행 RED" / "5종 물증 RED" | [`test-run-test-evidence`](../skills/test-run-test-evidence/)   | 실 test code + 5종 물증 (no-simulation)   |
| "AC→TC coverage 검증" / "test coverage 검증"          | [`test-verify-coverage`](../skills/test-verify-coverage/)       | coverage finding                          |

### 2.5 Chain 5 (impl / GREEN 의무)

| 자연어 prompt                                           | 발동 skill                                                                | 산출                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| "impl spec 생성" / "구현 코드 작성" / "impl GREEN"      | [`implement-generate-impl-spec`](../skills/implement-generate-impl-spec/) | `impl-spec.json` (json 단독 SSOT / IMPL-\*) + 실 impl code |
| "test pass 검증" / "100% GREEN" / "test runner 실 실행" | [`implement-verify-test-pass`](../skills/implement-verify-test-pass/)     | 실 test runner + 5종 물증 (--allow-execute)                |

### 2.6 Release matrix

| 자연어 prompt                                            | 발동 skill                                                                      | 산출                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| "traceability matrix" / "release matrix" / "matrix 산출" | [`_base-build-traceability-matrix`](../skills/_base-build-traceability-matrix/) | `matrix.json` (json 단독 SSOT / UC→BHV→AC→TC→IMPL+commit_hash) |

## 3. Skill auto-invoke 매커니즘

```
사용자 자연어 prompt
  ↓
Claude Code 가 모든 SKILL.md description 검색
  ↓
매칭 skill 자동 발동 (slash command 불필요)
  ↓
chain harness gate 통과 의무 검증 (state.json + chain-driver)
  ↓ (chain 1 gate 진입 시 Layer 2 LLM sub-agent invocation)
다음 stage 진입
```

**D21' 정합** — UserPromptSubmit hook 이 chain stage 매칭 prompt 감지 후 chain-driver hooks-bridge 호출 → suggest-skill stderr 권고. LLM "권고를 즉시 따르는 척" 차단 (`suppressOutput=true`).

## 4. 매칭 안 될 때

### Tip 1. 명시적 키워드 사용

자연어 매칭 폭이 좁은 prompt → 명시적 키워드 추가:

- ❌ "rules 만들어줘" — domain rules / FE rules 가 모호
- ✅ "비즈니스 규칙 추출" → `analysis-business-rules`
- ✅ "FE form validation 추출" → `analysis-form-validation-fe`

> Tip 1 = *어떤 skill 이 발동하나* (description 매칭). discovery 가 의도를 *그래프 노드에 얼마나 잘 ground 하나* 는 별개 문제 → grounding 레버는 [§2.1.1](#211-discovery-가-잘-ground-하는-prompt-쓰는-법-grounding-레버).

### Tip 2. Skill 명시 호출

slash command 부재 환경 = 명시 path (1-depth + category prefix paradigm):

```
@skills/analysis-architecture/SKILL.md
@skills/discovery-from-analysis-output/SKILL.md
@skills/analysis-br-cross-consistency-check/SKILL.md
```

### Tip 3. Description 보강 finding 등재

자주 쓰는 표현이 매칭 안 되면 finding 등재 → skill description 보강 carry.

## 5. 참조

- [`getting-started.md`](./getting-started.md) — 10분 walkthrough
- [`chain-harness-guide.md`](./chain-harness-guide.md) — chain harness mental model
- [`common-errors.md`](./common-errors.md) — FAQ
- [`../README.md`](../README.md) §사용법 — skill description trigger 전체 표

> skill 디렉토리 paradigm: 모든 skill = `skills/<category>-<name>/SKILL.md` 1-depth + category prefix. Claude Code plugin 표준 정합 (1-depth scan) + lifecycle organize 사상은 `methodology-spec/skills-axis.md` 별도 axis 보존.

## 인용

- 버전 변천사 / skill rename: `CHANGELOG.md` · `decisions/INDEX.md`
