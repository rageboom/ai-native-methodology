# skills/ — 44 skill (★ chain harness validated)

본 디렉토리 = plugin install 후 **자연어 prompt 매칭 시 자동 발동**되는 skill. Claude Code 가 각 SKILL.md 의 `description` frontmatter 를 검색하여 자동 호출.

## 디렉토리 분류 (4 카테고리 / 44 skill)

| 카테고리 | skill 수 | 역할 | 호출 cadence |
|---|---|---|---|
| [`_base/`](./_base/) | **5** | chain harness 공용 utility | 다른 skill 안에서 sub-invoke |
| [`analysis/`](./analysis/) | **18** | analysis stage (chain 1 진입 전 / Phase 0~6 + aspect 4) | 자연어 prompt + 코드베이스 시그널 자동 매칭 |
| [`planning/`](./planning/) | **3** | chain 1 / legacy → planning-spec | "기획 단계 시작" / chain-driver next |
| [`spec/`](./spec/) | **3** | chain 2 / behavior + acceptance + 7대 통합 | "behavior spec" / gate #1 통과 후 |
| [`test/`](./test/) | **3** | chain 3 / test-spec + 실 test (RED) | "test spec 생성 RED" / gate #2 통과 후 |
| [`implement/`](./implement/) | **2** | chain 4 / impl-spec + 실 impl (GREEN) | "impl spec 생성 GREEN" / gate #3 통과 후 |
| [`design/`](./design/) | 0 (carry) | design stage 미채움 (v2.x carry) | — |

## _base 공용 skill (5)

| skill | 역할 | 호출자 |
|---|---|---|
| [`apply-template`](./_base/apply-template/) | 산출물 template instantiate | 모든 phase / chain skill |
| [`apply-baseline-ratchet`](./_base/apply-baseline-ratchet/) | ADR-010 baseline + ratchet | drift / decision-table / static-runner |
| [`build-traceability-matrix`](./_base/build-traceability-matrix/) | UC→BHV→AC→TC→IMPL+commit_hash matrix | release |
| [`invoke-go-stop-gate`](./_base/invoke-go-stop-gate/) | gate #1~#4 호출 + state.blocked 감지 | chain 1~4 종결 |
| [`log-finding`](./_base/log-finding/) | finding 등록·분류 | 모든 검증 단계 |

## analysis stage skill 자연어 prompt 표 (18)

| 자연어 prompt | 발동 skill |
|---|---|
| "이 코드베이스 분석 시작" | [`phase-0-input`](./analysis/phase-0-input/) |
| "inventory 추출해줘" | [`phase-1-inventory`](./analysis/phase-1-inventory/) |
| "아키텍처 분석" | [`phase-2-architecture`](./analysis/phase-2-architecture/) |
| "도메인 모델 추출" | [`phase-3-domain`](./analysis/phase-3-domain/) |
| "비즈니스 규칙 추출" | [`phase-4-rules`](./analysis/phase-4-rules/) |
| "Phase 4.5 형식 명세 검증" | [`phase-4-5-cross-validation`](./analysis/phase-4-5-cross-validation/) |
| "OpenAPI 만들어줘" (BE) | [`phase-5-openapi`](./analysis/phase-5-openapi/) |
| "DB schema + ERD" (DB) | [`phase-5-schema-erd`](./analysis/phase-5-schema-erd/) |
| "rules 추출" | [`phase-5-rules`](./analysis/phase-5-rules/) |
| "state-map 추출" (FE) | [`phase-5-state-map`](./analysis/phase-5-state-map/) |
| "visual-manifest 추출" (FE) | [`phase-5-visual-manifest`](./analysis/phase-5-visual-manifest/) |
| "form-validation 추출" (FE) | [`phase-5-form-validation`](./analysis/phase-5-form-validation/) |
| "type-spec 추출" (FE) | [`phase-5-type-spec`](./analysis/phase-5-type-spec/) |
| "error-mapping 추출" | [`phase-5-error-mapping`](./analysis/phase-5-error-mapping/) |
| "antipattern 정리" | [`phase-6-quality`](./analysis/phase-6-quality/) |
| "a11y 검증" | [`aspect-a11y`](./analysis/aspect-a11y/) |
| "i18n 검증" | [`aspect-i18n`](./analysis/aspect-i18n/) |
| "정적 보안 검증" | [`aspect-static-security`](./analysis/aspect-static-security/) |
| "legacy spectrum 분류" | [`aspect-legacy`](./analysis/aspect-legacy/) |

★ aspect skill 4종 = 코드베이스 시그널 (`package.json` react / `pom.xml` spring-boot 등) 자동 매칭. cross_cutting (phase 무관).

## chain harness skill (chain 1~4 / 11)

| chain | skill | 산출 |
|---|---|---|
| 1 | [`planning/extract-from-legacy`](./planning/extract-from-legacy/) | analysis 자산 → planning-spec.{json,md} 추출 |
| 1 | [`planning/decompose-use-cases`](./planning/decompose-use-cases/) | UC-* 분해 |
| 1 | [`planning/identify-business-intent`](./planning/identify-business-intent/) | 비즈니스 의도 식별 |
| 2 | [`spec/compose-behavior-spec`](./spec/compose-behavior-spec/) | BHV-* (executable contract) |
| 2 | [`spec/derive-acceptance-criteria`](./spec/derive-acceptance-criteria/) | Gherkin BDD AC-* |
| 2 | [`spec/integrate-7대-deliverables`](./spec/integrate-7대-deliverables/) | analysis 7대 산출물 통합 |
| 3 | [`test/generate-test-spec`](./test/generate-test-spec/) | TC-* + 실 test code |
| 3 | [`test/run-test-evidence`](./test/run-test-evidence/) | 5종 물증 (★ 진짜 도구 실행 / RED 의무) |
| 3 | [`test/verify-coverage`](./test/verify-coverage/) | AC→TC ≥ 0.85 |
| 4 | [`implement/generate-impl-spec`](./implement/generate-impl-spec/) | IMPL-* + 실 impl code |
| 4 | [`implement/verify-test-pass`](./implement/verify-test-pass/) | 100% test pass + result_hash 정규화 |

## skills-axis 정책 (★ phase ID ≠ skills 디렉토리 axis)

skills 디렉토리의 `phase-N` prefix = 산출물 번호 그룹 axis (예: `phase-2-architecture` = 산출물 #2 / manifest phase 3 의 skill). 정책 명문 = [`../methodology-spec/skills-axis.md`](../methodology-spec/skills-axis.md). drift-validator `--check-chain-layout` 으로 3-way 정합 자동 검증.

## 호출 메커니즘 (★ ★ ★ D21' suppressOutput=true)

- plugin install 후 Claude Code 가 SKILL.md `description` 필드 검색
- 자연어 prompt 매칭 시 자동 호출 (slash command 불필요)
- chain harness gate 통과 의무 — gate 미통과 시 다음 skill 호출 차단 (state.blocked + cli exit 2 + PreToolUse deny)
- LLM "통과한 척" 시뮬레이션 ❌ — D21' 정합 (`hooks/hooks.json` UserPromptSubmit + PreToolUse)

## 참조

- [`../agents/README.md`](../agents/README.md) — 5 chain agent + analysis (각 agent 의 skill 위치)
- [`../flows/sdlc-4stage-flow.json`](../flows/sdlc-4stage-flow.json) — chain harness master SSOT
- [`../tools/chain-driver/`](../tools/chain-driver/) — chain harness driver (skill auto-invoke)
- ADR-CHAIN-005 — driver state machine + D21' (suppressOutput=true)
- DEC-2026-05-06-sub-plan-4-종결 — 13 chain skill 정식 등재 record
