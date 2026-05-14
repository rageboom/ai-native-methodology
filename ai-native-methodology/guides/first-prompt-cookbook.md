# First Prompt Cookbook — 자연어 → skill 매핑 표 (★ chain harness validated / v2.5.1)

본 가이드 = plugin install 후 사용자가 자기 의도를 자연어로 어떻게 표현하면 어떤 skill 자동 발동되는지.

★ ★ skill description 매칭 = Claude Code 가 SKILL.md frontmatter 검색 / slash command 불필요.

> **갱신 이력**: v2.0.0 작성 → v2.5.1 정합 갱신 (★ 모든 skill path 1-depth + category prefix paradigm / `skills/<category>-<name>/SKILL.md` / Claude Code plugin 표준 정합 / + analysis-br-cross-consistency-check 신규 v2.5).

## 1. Analysis stage (chain 1 진입 전 / v1.x 자산)

### 1.1 입력 정리 + Inventory

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "이 코드베이스 분석 시작" / "분석 시작" / "프로젝트 분석" | [`analysis-phase-0-input`](../skills/analysis-phase-0-input/) | `_manifest.yml` |
| "inventory 추출" / "코드베이스 인벤토리" / "파일 list" | [`analysis-phase-1-inventory`](../skills/analysis-phase-1-inventory/) | `inventory.json` / `tree.md` / `stats.json` |

### 1.2 Architecture + DB

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "아키텍처 분석" / "의존성 그래프" / "circular dep 검출" | [`analysis-phase-2-architecture`](../skills/analysis-phase-2-architecture/) | `architecture.{json,md}` / `dependency-graph.mermaid` / `circular-dependencies.md` |
| "DB schema 추출" / "ERD 만들어줘" / "DB 스키마 분석" | [`analysis-phase-5-schema-erd`](../skills/analysis-phase-5-schema-erd/) | `schema.{json,sql}` / `erd.mermaid` |

### 1.3 Domain + Rules (★ v2.4 dual representation)

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "도메인 모델 추출" / "도메인 분석" / "BC 식별" | [`analysis-phase-3-domain`](../skills/analysis-phase-3-domain/) | `domain.{json,md}` |
| "비즈니스 규칙 추출" / "BR 추출" / "rules 분석" | [`analysis-phase-4-rules`](../skills/analysis-phase-4-rules/) | `rules.{json,md}` (★ natural_language + given/when/then dual) |
| "Phase 4.5 형식 명세 검증" / "drift 검증" | [`analysis-phase-4-5-cross-validation`](../skills/analysis-phase-4-5-cross-validation/) | drift / DMN / cross-link finding |
| "characterization 추출" / "의도 vs 버그 분류" | [`analysis-phase-4-7-characterization`](../skills/analysis-phase-4-7-characterization/) | `characterization-spec.json` (v2.1) |
| "SQL inventory 추출" / "매퍼 SQL 정리" | [`analysis-phase-4-8-sql-inventory`](../skills/analysis-phase-4-8-sql-inventory/) | `sql-inventory.json` 12컬럼 (v2.2 / v2.3 migration_priority) |
| **"비즈니스 규칙 의미 일관성 검증" / "BR cross-consistency"** | [`analysis-br-cross-consistency-check`](../skills/analysis-br-cross-consistency-check/) | **★ v2.5 신규 / Layer 1 결정적 + Layer 2 LLM (Sonnet 4.6 sub-agent)** |

### 1.4 API + UI/State (FE)

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "OpenAPI 만들어줘" / "API 명세 추출" / "openapi.yaml" | [`analysis-phase-5-openapi`](../skills/analysis-phase-5-openapi/) | `openapi.yaml` + `api.md` |
| "UI rules 추출" / "FE rules" | [`analysis-phase-5-rules`](../skills/analysis-phase-5-rules/) | `rules.json` (FE 영역) |
| "state-map 추출" / "FE state machine" | [`analysis-phase-5-state-map`](../skills/analysis-phase-5-state-map/) | `state-map.json` (FE) |
| "visual-manifest 추출" / "Playwright snapshot" | [`analysis-phase-5-visual-manifest`](../skills/analysis-phase-5-visual-manifest/) | `visual-manifest.json` (binary) |
| "form validation 추출" / "Zod / RHF 분석" | [`analysis-phase-5-form-validation`](../skills/analysis-phase-5-form-validation/) | `form-validation-spec.json` |
| "type-spec 추출" / "TypeScript type 분석" | [`analysis-phase-5-type-spec`](../skills/analysis-phase-5-type-spec/) | `type-spec.json` (ts-morph) |
| "error-mapping 추출" / "BE error code 분석" | [`analysis-phase-5-error-mapping`](../skills/analysis-phase-5-error-mapping/) | `error-mapping-spec.json` |

### 1.5 Quality (Phase 6)

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "antipattern 정리" / "안티패턴 통합" / "AP 도출" | [`analysis-phase-6-quality`](../skills/analysis-phase-6-quality/) | `antipatterns.json` / `avoid-list.md` / `migration-cautions.md` |

### 1.6 Aspect (cross-cutting / phase 무관)

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "a11y 검증" / "WCAG 2.2 AA 검증" / "접근성 검증" | [`analysis-aspect-a11y`](../skills/analysis-aspect-a11y/) | `a11y-spec.json` (axe-core) |
| "i18n 검증" / "다국어 분석" | [`analysis-aspect-i18n`](../skills/analysis-aspect-i18n/) | `i18n-spec.json` |
| "정적 보안 검증" / "Semgrep 실행" / "OWASP 검증" | [`analysis-aspect-static-security`](../skills/analysis-aspect-static-security/) | `static-security-spec.json` (★ 진짜 도구) |
| "legacy spectrum 분류" / "Strangler 분류" | [`analysis-aspect-legacy`](../skills/analysis-aspect-legacy/) | `legacy-spectrum.json` |

★ aspect skill = 코드베이스 시그널 (`package.json` react / `pom.xml` spring-boot 등) 자동 매칭.

## 2. Chain harness stage (★ v2.0 / v2.5 Layer 2 통합)

### 2.1 Chain 1 (planning) ★ v2.5: Layer 2 LLM 의무 통과

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "기획 단계 시작" / "planning 진입" / "use case 추출" | [`planning-extract-from-legacy`](../skills/planning-extract-from-legacy/) | `planning-spec.{json,md}` |
| "use case 분해" / "UC decompose" / "story 분해" | [`planning-decompose-use-cases`](../skills/planning-decompose-use-cases/) | UC-* 분해 |
| "비즈니스 의도 식별" / "domain priority" / "intent 추출" | [`planning-identify-business-intent`](../skills/planning-identify-business-intent/) | intent-tag + domain priority |

★ ★ v2.5: chain 1 gate 진입 시 chain-driver 가 `br-cross-consistency-validator` Layer 1 결정적 + Layer 2 LLM (Sonnet 4.6 sub-agent invocation) 양쪽 통과 강제. `semantic_drift_detected` 또는 `confidence_cap_exceeded` finding 발생 시 chain 진입 차단.

### 2.2 Chain 2 (spec)

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "behavior spec 만들어" / "BHV 도출" / "executable contract" | [`spec-compose-behavior-spec`](../skills/spec-compose-behavior-spec/) | `behavior-spec.{json,md}` (BHV-*) |
| "acceptance criteria 도출" / "Gherkin 작성" / "AC 추출" | [`spec-derive-acceptance-criteria`](../skills/spec-derive-acceptance-criteria/) | `acceptance-criteria.{json,md}` (AC-*) |
| "7대 통합" / "deliverables 통합" / "spec 통합" | [`spec-integrate-7대-deliverables`](../skills/spec-integrate-7대-deliverables/) | analysis 7대 산출물 통합 |

### 2.3 Chain 3 (test / RED 의무)

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "test spec 생성" / "TC 도출" / "test case 분해" | [`test-generate-test-spec`](../skills/test-generate-test-spec/) | `test-spec.{json,md}` (TC-*) |
| "test code RED" / "test 실 실행 RED" / "5종 물증 RED" | [`test-run-test-evidence`](../skills/test-run-test-evidence/) | 실 test code + 5종 물증 (★ no-simulation) |
| "AC→TC coverage 검증" / "test coverage 검증" | [`test-verify-coverage`](../skills/test-verify-coverage/) | coverage finding |

### 2.4 Chain 4 (impl / GREEN 의무)

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "impl spec 생성" / "구현 코드 작성" / "impl GREEN" | [`implement-generate-impl-spec`](../skills/implement-generate-impl-spec/) | `impl-spec.{json,md}` (IMPL-*) + 실 impl code |
| "test pass 검증" / "100% GREEN" / "test runner 실 실행" | [`implement-verify-test-pass`](../skills/implement-verify-test-pass/) | 실 test runner + 5종 물증 (★ --allow-execute) |

### 2.5 Release matrix

| 자연어 prompt | 발동 skill | 산출 |
|---|---|---|
| "traceability matrix" / "release matrix" / "matrix 산출" | [`_base-build-traceability-matrix`](../skills/_base-build-traceability-matrix/) | `matrix.{json,md,mermaid}` (UC→BHV→AC→TC→IMPL+commit_hash) |

## 3. Skill auto-invoke 매커니즘

```
사용자 자연어 prompt
  ↓
Claude Code 가 모든 SKILL.md description 검색
  ↓
매칭 skill 자동 발동 (★ slash command 불필요)
  ↓
chain harness gate 통과 의무 검증 (state.json + chain-driver)
  ↓ (★ v2.5: chain 1 gate 진입 시 Layer 2 LLM sub-agent invocation)
다음 stage 진입
```

★ ★ ★ **D21' 정합** — UserPromptSubmit hook 이 chain stage 매칭 prompt 감지 후 chain-driver hooks-bridge 호출 → suggest-skill stderr 권고. LLM "권고를 즉시 따르는 척" 차단 (`suppressOutput=true`).

## 4. 매칭 안 될 때

### Tip 1. 명시적 키워드 사용

자연어 매칭 폭이 좁은 prompt → 명시적 키워드 추가:
- ❌ "rules 만들어줘" — domain rules / FE rules 가 모호
- ✅ "비즈니스 규칙 추출" → `analysis-phase-4-rules`
- ✅ "FE form validation 추출" → `analysis-phase-5-form-validation`

### Tip 2. Skill 명시 호출

slash command 부재 환경 = 명시 path (★ v2.5.1 1-depth + prefix paradigm):
```
@skills/analysis-phase-2-architecture/SKILL.md
@skills/planning-extract-from-legacy/SKILL.md
@skills/analysis-br-cross-consistency-check/SKILL.md
```

### Tip 3. Description 보강 finding 등재

자주 쓰는 표현이 매칭 안 되면 finding 등재 → skill description 보강 carry.

## 5. 참조

- [`getting-started.md`](./getting-started.md) — 10분 walkthrough
- [`chain-harness-guide.md`](./chain-harness-guide.md) — chain harness mental model
- [`common-errors.md`](./common-errors.md) — FAQ
- [`../README.md`](../README.md) §사용법 — skill description trigger 전체 표

> ★ v2.5.1 paradigm: 모든 skill 디렉토리 = `skills/<category>-<name>/SKILL.md` 1-depth + category prefix. Claude Code plugin 표준 정합 (1-depth scan) + lifecycle organize 사상은 `methodology-spec/skills-axis.md` 별도 axis 보존.
