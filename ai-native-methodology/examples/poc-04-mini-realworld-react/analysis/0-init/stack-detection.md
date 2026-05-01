# stack-detection.md

> 분석 대상: `yurisldk/realworld-react-fsd` (HEAD `963b303` / 2026-04-25)
> 일자: 2026-05-02 (Stage 4 Day 1)
> 본 문서 = ADR-FE-001 §spectrum + ADR-FE-004 §Scenario detection 의무 적용 (workflow phase-0-input §3.4)

---

## 1. ★ Stack 사실 (package.json + 코드 직접 분석)

| 영역 | 사실 |
|---|---|
| Language | TypeScript 5.4.5 |
| Framework | React 19.2.4 (★ 최신) |
| Routing | react-router 7.13.0 (★ Data Router + middleware + Form action) |
| Server State | @tanstack/react-query 5.90.20 (★ 사내 FE 스택 일치) |
| Form / Validation | ★ React Router v7 `<Form>` + Zod (validateSchema) — RHF/Formik 미사용 |
| HTTP Client | fetch (apiFetch wrapper / orval 생성) |
| Code Generation | orval 8.3 + openapi-typescript 7.10 (★ OpenAPI 3.0.1 → Zod + React Query hooks 자동) |
| Mocking | msw 2.12 (★ ADR-FE-005 #4) |
| Build | Webpack 5.97 (★ Vite 아님) |
| Test | Jest 29 + @testing-library/react 16 |
| Linting | Biome 2.3 + ESLint 8.57 (airbnb + jsx-a11y) |
| CSS | Sass + mini-css-extract |
| Icons | react-icons 5.2 |

---

## 2. ★ ADR-FE-001 §spectrum Tier 결정

```yaml
spectrum_tier: 1
tier_label: "Modern SPA"
evidence:
  - React 19 (★ 최신 메이저 / Hooks + Suspense + Server Components 가능 stack)
  - TypeScript 5.4 (정적 타입 ★)
  - Feature-Sliced Design 약식 (3 layer / kebab-case slice)
  - 모듈 시스템 = ESM (import/export)
  - Build = Webpack 5 (Vite 아님 — 단 Tier 1 정합 / 빌드 도구 무관)
adr_fe_001_match: ✅ 100%
analysis_priority: ★ "Modern SPA 정통" — 본 방법론 1차 검증 대상
```

---

## 3. ★ ADR-FE-004 §BE/FE 분리 Scenario 결정

```yaml
scenario: "A"
scenario_label: "분리 default"
evidence:
  - frontend only (backend = https://api.realworld.io/api 외부 RealWorld 표준 backend)
  - openapi.yaml 분리 ground truth (★ Contract-First 정합)
  - orval generate = OpenAPI → FE codegen (★ schema/contract 분리 명시)
  - shared/api/generated/ = .gitignore (★ generated artifact 분리)
adr_fe_004_match: ✅ 100% (Scenario A)
verification_at_stage_6: "✅ ADR-FE-004 정합 — IR 4계층 L3 Contract 100% 분리 보장"
```

---

## 4. ★ ADR-FE-005 §권위 매개체 13 detection (★ Stage 7-pre)

| # | 매개체 (ADR-FE-005) | INPUT 사용 | 신호 |
|---|---|---|---|
| 1 | CEM v2.1 (Custom Elements Manifest) | ❌ | Web Components 미사용 |
| 2 | SCXML W3C REC | ❌ | state-map 부재 (★ Phase 5-2-b 수동 모델링) |
| 3 | DTCG v2025.10 | ❌ | design-tokens 부재 (★ Sass 직접 / Stage 5 carry) |
| 4 | MSW + OpenAPI 3.1 | ✅★ | ★ openapi.yaml 3.0.1 + msw 2.12 (★ ADR-FE-005 핵심 #4) |
| 5 | axe-core JSON | ❌ | Phase 6 npm install 의무 |
| 6 | TypeScript .d.ts | ✅ | tsc --emitDeclarationOnly 가능 (★ ts-morph 보조) |
| 7 | Storybook CSF v3 | ❌ | Storybook 미사용 (★ Stage 5 carry) |
| 8 | Playwright | ❌ | Phase 5-2-c npm install 의무 |
| 9 | WCAG 2.1 AA / 2.2 AA | △ | eslint-plugin-jsx-a11y (lint only / 진짜 axe-core 별도 필요) |
| 10 | WAI-ARIA 1.2 | △ | ARIA 사용 검출 미실시 (★ Phase 6 grep) |
| 11 | ICU MF1 / UTS#35 MF2 | ❌ | i18n 부재 (★ deliverable 11 N/A 가능성 ↑) |
| 12 | Pact spec v4 | ❌ | contract test 미사용 |
| 13 | **Zod (Stage 7-pre 신규)** | ✅★★★ | ★★★ zod 4.3 + ★ orval+OpenAPI auto-gen ★ deliverable 14 핵심 검증 시점 |

→ **검출 매개체 4종 우세 (#4 OAS+MSW / #6 .d.ts / #13 Zod / 부분 #9/#10 a11y lint)**.

---

## 5. ★ State 5 진실 detection

| 진실 | 본 fork | 패턴 |
|---|---|---|
| **#1 Server cache** | ✅ ★ | TanStack React Query (queryClient) — `~shared/api/queryClient.ts` |
| **#2 Client global** | △ | ★ 명시 store 없음 — Auth = `~shared/api/auth-storage.ts` (localStorage) + react-router middleware userContext |
| **#3 URL** | ✅ ★ | react-router v7 + `paths.ts` 명명 컨벤션 (article.paths.ts / home.paths.ts / profile.paths.ts / settings.paths.ts) |
| **#4 Form** | ✅ ★ | ★ react-router v7 `<Form method=POST>` + `actions/*.action.ts` 패턴 (RHF 아님) |
| **#5 DOM** | △ | shared/ui/global-progress-bar/use-fake-progress.ts (★ DOM-side animation state) |

**관찰**: 5 진실 모두 본 fork 에 존재 (#2 = 약식). Stage 5 본격 PoC 시 #2 (Client global) 패턴 검증 필요.

---

## 6. ★ Form Validation Source detection (★ deliverable 14 핵심)

```yaml
form_validation_sources:
  primary:
    library: "zod"
    version: "4.3.6"
    pattern: "★ orval auto-generated from OpenAPI 3.0.1"
    location: "src/shared/api/generated/schemas/*.zod.ts (★ .gitignore — openapi.yaml + orval.config.ts 직접 분석으로 대체)"
    evidence:
      - "orval.config.ts §schemas.type=zod"
      - "orval.config.ts §override.zod.generate.body=true"
      - "actions/user-login.action.ts → import LoginBody from '~shared/api/generated/schemas/loginBody.zod'"
      - "shared/api/validateSchema.ts → SafeParseSchema interface (Zod 호환)"

  secondary:
    library: "html5_native"
    pattern: "★ form-validation fallback 4 (research 결단)"
    evidence:
      - "login.ui.tsx → <input type=email required autoComplete=email> + <input type=password required>"

  tertiary: null  # RHF / Yup / Formik / class-validator / Ajv / Vest 미사용

deliverable_14_strategy:
  primary_extraction: "★ openapi.yaml + orval.config.ts 직접 분석 (★ generated 디렉토리 부재 회피)"
  secondary_extraction: "★ login.ui.tsx HTML5 native validation grep"
  br_auto_extraction_count_estimate: "★ Login + Register + Settings + Editor 4 form / 12~18 BR"
```

---

## 7. ★ TypeScript Type Source detection (★ deliverable 15 핵심)

```yaml
type_source_files:
  - location: "src/**/*.ts + src/**/*.tsx"
  - count: 64
  - explicit_interfaces: "추정 30~50개 (Phase 6 ts-morph 진짜 실행 시 정확 측정)"
  - generated_types: "★ src/shared/api/generated/ (OpenAPI → TS interface 자동 / clone 시 부재)"
  - openapi_yaml_components: "★ openapi.yaml §components.schemas 직접 분석 가능"

deliverable_15_strategy:
  primary_extraction: "★ ts-morph 진짜 실행 (in-scope 64 파일)"
  secondary_extraction: "★ openapi.yaml §components.schemas → TS interface 추정"
  framework_neutrality_score_estimate: "★ baseline 측정 — 사용자 정의 type 의 React 의존도 grep (props / React.FC / JSX.Element 9 키워드)"
```

---

## 8. ★ A11y / I18n / Static Security source detection

```yaml
a11y:
  source: "eslint-plugin-jsx-a11y (lint only)"
  axe_core_real_run_required: ✅ ★
  scope: "RealWorld 8 page × main viewport"
  deliverable_10_strategy: "★ Day 4 npm install + @axe-core/playwright 진짜 실행"

i18n:
  source: "❌ 부재"
  evidence:
    - "package.json deps 에 react-intl / react-i18next / formatjs 부재"
    - "코드 직접 hardcoded 영문 문자열 (login.ui.tsx 'Sign in' 등)"
  deliverable_11_strategy: "★ N/A — i18n 미적용 fork (★ Stage 5 carry / 다른 fork 검증)"

static_security:
  source: "OWASP Top 10 / React-specific 패턴"
  semgrep_real_run_required: ⏳ ★ Windows 환경 부재 (research 합의 carry)
  fallback: "★ 수동 grep (dangerouslySetInnerHTML / eval / innerHTML / window.* / process.env 노출)"
  deliverable_12_strategy: "★ Day 4 grep 기반 1차 + Semgrep carry 명시"
```

---

## 9. ★ 분석 결단 종합 (Phase 0 종결)

```yaml
poc_04_mini_classification:
  spectrum_tier: 1
  scenario: "A"
  fsd_compliance: "약식 (3 layer)"
  authority_carriers_detected: 4   # OAS+MSW / .d.ts / Zod / a11y-lint partial
  state_truths_detected: 5         # ★ 5/5 (모든 진실 존재)
  form_validation_source: "Zod (orval auto-gen) + HTML5 native"
  type_source: "TS 5.4 + OpenAPI 3.0.1 components"
  a11y_lint: "✅ jsx-a11y / 진짜 axe-core Day 4"
  i18n: "❌ 부재 (deliverable 11 N/A 가능성)"
  static_security: "⏳ Semgrep carry / grep fallback"

mini_scope_8_deliverable_feasibility:
  7_ui_ux: "★ 가능 (Login + Home + Article 3 page)"
  8_state_map: "★ 가능 (Login + Home tab 2 컴포넌트 수동 모델링)"
  9_visual_manifest: "★ 가능 (Day 4 Playwright 진짜 실행)"
  10_a11y_spec: "★ 가능 (Day 4 axe-core 진짜 실행)"
  11_i18n_spec: "❌ N/A (i18n 부재 — Stage 5 carry)"
  12_static_security_spec: "★ 부분 가능 (grep fallback / Semgrep carry)"
  14_form_validation_spec: "★ 가능 (★ openapi.yaml + Zod schema 분석 — ★ deliverable 14 핵심 입증)"
  15_type_spec: "★ 가능 (Day 4 ts-morph 진짜 실행)"

next_phase: "Phase 5-2-a (ui-base) — Login + Home + Article 3 page"
```

---

**End of stack-detection.md.**
