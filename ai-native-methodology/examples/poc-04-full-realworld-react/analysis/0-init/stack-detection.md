# stack-detection.md (PoC #04 full / Stage 5 Sprint 5-1)

> 분석 대상: yurisldk/realworld-react-fsd HEAD `963b303` (Stage 4 와 동일)
> 일자: 2026-05-02 (Sprint 5-1)
> 본 문서 = ADR-FE-001 §spectrum + ADR-FE-004 §Scenario detection 의무 + Stage 5 본격 분석 입력

---

## 1. Stack 사실 (Stage 4 일치 / 새 capture)

| 영역              | 사실                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| Language          | TypeScript 5.4.5                                                              |
| Framework         | React 19.2.4                                                                  |
| Routing           | react-router 7.13.0 (Data Router + middleware + Form action)                  |
| Server State      | @tanstack/react-query 5.90.20                                                 |
| Form / Validation | React Router v7 `<Form>` + Zod (validateSchema) — RHF/Formik 미사용           |
| HTTP Client       | fetch (apiFetch wrapper / orval)                                              |
| Code Generation   | orval 8.3 + openapi-typescript 7.10 (OpenAPI 3.0.1 → Zod + React Query hooks) |
| Mocking           | msw 2.12                                                                      |
| Build             | Webpack 5.97                                                                  |
| Test              | Jest 29 + @testing-library/react 16                                           |
| Linting           | Biome 2.3 + ESLint 8.57 + jsx-a11y 6.5                                        |
| CSS               | Sass + mini-css-extract                                                       |
| Icons             | react-icons 5.2                                                               |

---

## 2. ADR-FE-001 §spectrum Tier (Stage 4 결과 재확인 / 새 capture)

```yaml
spectrum_tier: 1
tier_label: "Modern SPA"
adr_fe_001_match: ✅ 100%
evidence:
  - React 19 (최신 / Hooks + Suspense + Server Components 가능)
  - TypeScript 5.4 strict
  - Feature-Sliced Design 약식 (app/pages/shared 3 layer)
  - Build Webpack 5 (Vite 아님 / 본 방법론 영향 0 — 빌드 도구 무관)
analysis_priority: "Modern SPA 정통" — Stage 5 본격 검증 대상
```

---

## 3. ADR-FE-004 §Scenario A 분리 default (Stage 4 일치)

```yaml
scenario: 'A'
scenario_label: '분리 default'
adr_fe_004_match: ✅ 100%
evidence:
  - frontend only (backend = https://api.realworld.io/api 외부)
  - openapi.yaml 분리 ground truth (Contract-First)
  - orval generate = OpenAPI → FE codegen (schema/contract 분리)
  - shared/api/generated/ = .gitignore (generated artifact 분리)
verification_at_stage_6: '✅ ADR-FE-004 정합 / IR 4계층 L3 Contract 100% 분리'
```

---

## 4. ADR-FE-005 §13 매개체 detection (Stage 4 일치 + Stage 5 검증 의무)

| #   | 매개체                | INPUT 사용                      | Stage 5 진짜 실행 의무                                   |
| --- | --------------------- | ------------------------------- | -------------------------------------------------------- |
| 1   | CEM v2.1              | ❌                              | N/A                                                      |
| 2   | SCXML W3C REC         | ❌ (수동 모델링)                | Sprint 5-2 state-map.json 산출 시 SCXML+XState 호환      |
| 3   | DTCG v2025.10         | ❌                              | Sprint 5-3 carry (Stage 7)                               |
| 4   | MSW + OpenAPI 3.1     | ✅openapi.yaml 3.0.1 + msw 2.12 | ✅ Sprint 5-2 (api 산출 본격)                            |
| 5   | axe-core JSON         | ⏳                              | ✅ Sprint 5-3 진짜 실행 의무                             |
| 6   | TypeScript .d.ts      | ✅ tsc                          | ✅ Sprint 5-3 ts-morph 진짜 실행 의무                    |
| 7   | Storybook CSF v3      | ❌                              | N/A (Stage 7 carry)                                      |
| 8   | Playwright            | ⏳                              | ✅ Sprint 5-3 4 viewport 의무                            |
| 9   | WCAG 2.1/2.2 AA       | △ (jsx-a11y lint)               | ✅ Sprint 5-3 axe-core 진짜 실행                         |
| 10  | WAI-ARIA 1.2          | △                               | ✅ Sprint 5-3 grep + axe                                 |
| 11  | ICU MF1/MF2           | ❌                              | ❌ deliverable 11 carry (G1 결단 D 정합)                 |
| 12  | Pact v4               | ❌                              | N/A                                                      |
| 13  | **Zod (Stage 7-pre)** | ✅ zod 4.3 + orval auto-gen     | ✅ Sprint 5-2 form-validation-spec 본격 (deliverable 14) |

→ **Stage 5 진짜 검증 매개체 = 7종** (#4 + #5 + #6 + #8 + #9 + #10 + #13).

---

## 5. State 5 진실 (Stage 5 의무 — 모두 본격 산출)

| 진실                 | 본 fork                                 | Stage 5 산출                                                                           |
| -------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| **#1 Server cache**  | ✅ TanStack React Query                 | ✅ Sprint 5-2 state-map.json (Article + Comment + Tag + User feed)                     |
| **#2 Client global** | △ auth-storage + userContext middleware | ✅ Sprint 5-2 state-map.json (Stage 4 약식 → 본격)                                     |
| **#3 URL**           | ✅ react-router v7 + paths.ts           | ✅ Sprint 5-2 state-map.json (Home + Profile + Settings + Article + Editor + Page-404) |
| **#4 Form**          | ✅ react-router v7 `<Form>` + actions/  | ✅ Sprint 5-2 state-map.json (Login + Register + Settings + Editor + Comment)          |
| **#5 DOM**           | △ use-fake-progress + optimistic count  | ✅ Sprint 5-2 state-map.json (Stage 4 부분 → 본격)                                     |

---

## 6. Form Validation Source (Sprint 5-2 deliverable 14 본격)

```yaml
form_validation_sources_v2:
  primary:
    library: 'zod'
    version: '4.3.6'
    pattern: 'orval auto-gen from OpenAPI 3.0.1'
    schemas_in_openapi: 14 # openapi.yaml § components.schemas 정량
    estimated_validation_count: '67+ (Stage 4 측정값)'

  secondary:
    library: 'zod-mini (URL params)'
    pattern: 'Stage 4 신규 발견 / Stage 5 의무 검증'
    schemas:
      [
        'PaginationSchema',
        'HomeArticleFilterSchema (home.state.ts)',
        'profile.state.ts (Stage 5 신규 분석)',
      ]

  tertiary:
    library: 'html5_native'
    pattern: 'form-validation fallback / type=email + required + minLength'
    estimated_count: '20+ (5 form × 평균 4 field)'

deliverable_14_strategy_stage_5:
  primary_extraction: 'ts-morph + openapi.yaml 직접 파싱 (Stage 4 검증 패턴 재사용)'
  secondary_extraction: 'zod-mini AST grep (home.state + profile.state)'
  tertiary_extraction: 'HTML5 native regex grep'
  br_auto_extraction_target: '80+ BR (Stage 4 = 72 BR / Stage 5 본격 80+)'
  _url_params_validation_pattern_validation: 'Stage 4 신규 패턴 → Stage 5 정식화 검증'
  _schema_validator_적용: 'Sprint 5-3 form-validation-spec.schema.json Ajv 8 검증 (Stage 4 schema validator 부재 → Stage 5 본체 격상)'
```

---

## 7. TypeScript Type Source (Sprint 5-3 deliverable 15 본격)

```yaml
type_source_files: 64
explicit_types_estimate: '46 (Stage 4 측정값) / Stage 5 ratchet 정식 0.95+ target'
generated_types: 'src/shared/api/generated/ (orval / clone 시 부재)'
openapi_yaml_components: 14 # 직접 분석 가능

deliverable_15_strategy_stage_5:
  primary_extraction: 'ts-morph 진짜 실행 (Stage 4 검증 / 64 파일)'
  framework_neutrality_score_target: '1.0 유지 (Stage 4 baseline / Stage 5 ratchet 단조 비감소)'
  react_idiom_count_target: 'in IR = 0 (Stage 4 baseline / strict 의무)'
  _schema_validator_적용: 'Sprint 5-3 type-spec.schema.json Ajv 8 검증'
```

---

## 8. A11y / Static Security / I18n source (Sprint 5-3 본격)

```yaml
a11y:
  source: 'eslint-plugin-jsx-a11y (lint) + axe-core 진짜 실행 (Sprint 5-3)'
  scope: '8 page × 4 viewport (Stage 4 1 page × 2 viewport → Stage 5 본격)'
  estimated_violations: '8+ (Stage 4 1 unique = html-has-lang / Stage 5 본격 더 많음)'

static_security:
  source: 'Sprint 5-3 Semgrep CLI Docker 진짜 실행 의무 (G2 결단)'
  scope: 'src/**/*.ts/.tsx 64 파일 + p/owasp-top-ten + p/react + p/javascript + p/typescript ruleset'
  fallback: 'Stage 4 grep (7 OWASP rule 적용 / 1 medium violation = JWT XSS)'

i18n:
  source: '❌ 부재 / G1 D 결단 = deliverable 11 carry (Stage 7 release note 명시)'
  reason: 'react-i18next / @lingui / @formatjs 부재 / hardcoded 영문 문자열 / Stage 4 일치'
```

---

## 9. Stage 5 본격 결단 종합

```yaml
poc_04_full_classification:
  spectrum_tier: 1
  scenario: 'A'
  fsd_compliance: '약식 3 layer'
  authority_carriers_detected: 7 # Stage 5 진짜 검증 매개체
  state_truths_detected: 5
  form_validation_source: 'Zod (orval auto-gen) + Zod-mini URL + HTML5 native'
  type_source: 'TS 5.4 + OpenAPI 3.0.1 components'
  i18n: '❌ carry (G1 D 결단)'

stage_5_obligatory_deliverable_11:
  - 1_architecture: 'Sprint 5-3 (FSD layer + dependency graph)'
  - 3_api: 'Sprint 5-2 (openapi.yaml 21 endpoint + cross-link 본격)'
  - 5_rules: 'Sprint 5-3 (form-validation BR 통합 + 사람 작성 BR)'
  - 6_antipatterns: 'Sprint 5-3 (cross-PoC isomorphic AP-FE-* 정식 / G4 임계 ≥ 3)'
  - 7_ui_ux: 'Sprint 5-2 (8 page 전체 / scenarios 30+ SCN)'
  - 8_state_map: 'Sprint 5-2 (8+ SM / 5 진실 전부)'
  - 9_visual_manifest: 'Sprint 5-3 (8 page × 4 viewport = 32 snapshot)'
  - 10_a11y_spec: 'Sprint 5-3 (전체 page WCAG 2.2 AA)'
  - 12_static_security: 'Sprint 5-3 (Semgrep Docker 진짜 실행)'
  - 14_form_validation_spec: 'Sprint 5-2 (80+ BR)'
  - 15_type_spec: 'Sprint 5-3 (ratchet 정식)'

stage_5_carry:
  - 11_i18n_spec: 'G1 D 결단 / Stage 7 release note 명시'

stage_5_본체_도구_격상_after_patterns_check:
  - drift_validator_FE: 'Sprint 5-3 진입 시 patterns ≥ 2 확인 후 격상 (G2)'
  - schema_validator_Ajv_8: 'Sprint 5-3 진입 시 신설 (form-validation + type-spec 검증)'
  - formal_spec_link_validator_FE_확장: 'Stage 5 종결 후 carry'

next_phase: 'Sprint 5-1 종결 + 사용자 승인 게이트 → Sprint 5-2 진입'
```

---

**End of stack-detection.md.**
