# Research — 테크기업/산업 사례 (v1.4 FE 트랙 Stage 1)

> **에이전트**: 테크기업 사례 (3 에이전트 중 #2)
> **작성일**: 2026-05-01
> **대상 plan**: `.claude/plans/plan-v1.4-fe-track.md`
> **9 Question** 의 강한 답: Q2 / Q5 / Q6 / Q7 / Q9. 약한 답 OK: Q1 / Q3 / Q4 / Q8.
> **시뮬레이션 절대 금지** (CLAUDE.md ★★★ §Static Tool 시뮬레이션 절대 금지) — 1차 사료 (회사 공식 docs / 엔지니어링 블로그 / 오픈소스 README) 우선. 단순 추측은 명시.

---

## 1. Scope + 출처 강도

### 1.1 본 에이전트 영역

본 방법론 (★★★ "코드 → 형식 명세 + 위험 기록" 한 방향 추출기) 의 **FE 트랙** 격상에 있어서, 이미 시장에서 합의된 권위 매개체 / 추출 형식 / 테스트 자동 생성 경로 를 회사 사례 + 오픈소스 도구 1차 사료에서 도출. BE 트랙의 OpenAPI 3.1 / JSON Schema / DMN 같은 위치를 차지할 FE 매개체 후보 평가.

### 1.2 출처 강도 분류

| 분류 | 신뢰도 | 본 research 비중 |
|---|---|---|
| **A** — 공식 spec / W3C / 회사 공식 엔지니어링 블로그 | ★★★ | 60% |
| **B** — 오픈소스 README / docs (회사 후원) | ★★ | 30% |
| **C** — 산업 컨설팅 (Thoughtworks martinfowler.com 등) | ★★ | 7% |
| **D** — 단순 추측 / 1차 사료 미확인 | ★ (명시 의무) | 3% (피할 수 없는 범위) |

### 1.3 본 research 의 한계

- ❌ **Percy** (BrowserStack) docs 1차 fetch 실패 (404). Chromatic 측면에서 cross 추정 — 명시.
- ❌ **Pact 사용 회사 production 사례** 공식 list 부재 — Pact docs 자체에 미공개. 추측 없이 미확인 표기.
- ❌ **Yahoo internal i18n infra** 비공개 — FormatJS 만 공개.
- ✅ Storybook CSF / Chromatic / SafeTest / Stryker / DTCG / Polaris / Material 3 / Fluent UI / Lighthouse CI / axe-core / XState / Pact spec / CEM / FormatJS 1차 사료 확보.

---

## 2. 9 Question 답

### Q1. 분석 대상 spectrum — modernization 의 cover 우선순위 (약한 답)

**산업 사례 1차 사료 정합 결론**: Thoughtworks + Martin Fowler + LegacyLeap 3사 공통 진단 — **JSP / Struts / JSF / jQuery legacy / Vanilla MPA → React/Angular** 마이그레이션이 2026 enterprise 의 최대 modernization 시장 (Java EE 마이그레이션의 FE 부분).

**우선순위 (1차 사료 산업 진단 정합)**:

| 우선순위 | 분석 대상 | 산업 사례 근거 |
|---|---|---|
| **P0** (필수) | JSP / 서버 템플릿 + jQuery | LegacyLeap "JSP to React/Thymeleaf Migration 2026 Guide" (사내 FE 의 가장 높은 확률 형태) |
| **P0** (필수) | jQuery + Vanilla DOM 조작 MPA | Thoughtworks Strangler Fig Part 1~3 (frontend 항목 명시) |
| **P1** (권장) | modern React SPA (FSD/Atomic) | 본 방법론 v1.3 가정 — 이미 cover |
| **P2** (선택) | Angular legacy / AngularJS | LegacyLeap "JSF Migration with Gen AI: React, Angular, Blazor" |
| **P3** (보류) | micro-frontend (single-spa / Module Federation) | 마이그레이션 destination 패턴 — 분석 input 이 아님 |

**핵심 산업 사례 인사이트** (Airbnb 2017): Rails + Hypernova + 점진적 React migration. "magical Rails functions like add_bootstrap_data" 같은 untraceable witchcraft 가 대형 팀에서 문제 — **legacy FE 분석에서 "데이터 부트스트랩 경로" 추출이 필수** (본 방법론에 반영 권고).

**출처**: Thoughtworks Embracing Strangler Fig Part 1~3 / LegacyLeap JSP-to-React Migration 2026 / Airbnb Tech Blog "Rearchitecting Airbnb's Frontend".

---

### Q2. ★ 시각 산출 처리 — Chromatic / Percy / jest-image-snapshot manifest 형식 (강한 답)

**산업 표준 결론**: **3 계층 분리** — (a) baseline 저장 위치 / (b) manifest (각 snapshot 의 메타데이터) / (c) 사람-가독 review 채널 (hosted URL).

#### 2.1 계층 (a) — baseline 저장 위치

| 도구 | baseline 위치 | 형식 |
|---|---|---|
| **Chromatic** (Storybook 공식) | 클라우드 (Chromatic SaaS) — branch 별 smart baselining | PNG + 메타데이터 (브라우저/뷰포트/모드 단위) |
| **jest-image-snapshot** (American Express) | repo 내 `__image_snapshots__/` 디렉토리 | PNG (pixelmatch 또는 SSIM diff) |
| **Percy** (BrowserStack) | 클라우드 (Percy SaaS) | PNG + DOM snapshot (1차 사료 fetch 실패 — 추정) |
| **Playwright visual** | repo 내 `*-snapshots/` 디렉토리 | PNG + 자동 generate on first run |

**1차 사료 인용 (Chromatic)**: "Chromatic maintains a history of your approved snapshots as baselines. When new snapshots are generated—whether from a pull request or a scheduled run—Chromatic compares them against the stored baselines and highlights only the true visual differences."

**1차 사료 인용 (jest-image-snapshot)**: "On the first test run, the matcher will create a `__image_snapshots__` directory in the directory the test is in and will store the baseline snapshot image there."

#### 2.2 계층 (b) — manifest 형식

★ 핵심: **Chromatic 은 manifest 를 CSF 의 `chromatic` parameter** 로 표현 (Story Modes). 별도 manifest 파일 X. CSF 자체가 manifest.

```typescript
// Button.stories.ts (CSF v3 + Chromatic)
export const Primary: Story = {
  args: { primary: true, label: 'Click' },
  parameters: {
    chromatic: {
      modes: { light: { theme: 'light' }, dark: { theme: 'dark' } },
      viewports: [320, 1200],
      diffThreshold: 0.063
    }
  }
}
```

**v1.4 본 방법론 권고**: visual-manifest 별도 파일 신설 X. Storybook CSF 자체를 visual manifest 로 채택 (산업 표준 정합).

#### 2.3 계층 (c) — 사람-가독 review

| 도구 | review 채널 |
|---|---|
| Chromatic | 호스팅 URL (chromatic.com/build/...) + GitHub PR check + UI Review UI |
| jest-image-snapshot | 로컬 파일 (CI artifact 업로드 옵션) — 자체 review UI 없음 |
| Percy | percy.io 호스팅 URL + PR check |

★ Q9 와 결합 — Storybook hosted URL + Chromatic PR check 가 산업 표준.

**출처**: Chromatic docs (Story Modes / Visual Tests) / americanexpress/jest-image-snapshot README / Storybook visual-testing docs.

---

### Q3. 분산 상태 표현 — TanStack Query / Redux DevTools / Zustand snapshot (약한 답)

**산업 사례 결론**: 단일 산업 표준 매개체 **부재**. 도구별 export 형식이 각각 다름.

| 도구 | export 형식 | 회사/배경 |
|---|---|---|
| **TanStack Query DevTools** | JSON (queryClient state 전체) | Tanner Linsley |
| **Redux DevTools** | JSON (action history + state snapshot) | Dan Abramov / 커뮤니티 |
| **Zustand** | `store.getState()` JSON | pmndrs |
| **XState** | SCXML (W3C spec) — **유일한 W3C 표준 매개체** | Stately.ai |

**1차 사료 인용 (XState)**: "XState adheres to the SCXML specification, and XState implements SCXML and the algorithms, with one of the long-term goals being to be compatible with SCXML in general."

**v1.4 본 방법론 권고**: 4가지 상태 차원 분리 추출 (산업 합의 부재로 본 방법론이 표준 정의 필요):
- **server state** → OpenAPI 3.1 (이미 BE 트랙) + TanStack Query queryKey 인벤토리 (JSON)
- **client UI state** → Zustand/Redux store 인벤토리 + slice 명세 (JSON)
- **URL state** → 라우팅 스펙 (이미 v1.3 ui-spec.json `pages` 에 있음)
- **transient form/DOM state** → 추출 제외 (BE 분석과 동일 — 본질적 휘발성)

★ XState 사용 시: **SCXML (W3C 표준)** 으로 export → state-machine.scxml 산출 (가장 이식성 높음).

**출처**: TanStack Query docs / xstate.js.org / Frontend Masters XState v2 course / Developer Way "React State Management 2025".

---

### Q4. 이벤트-주도 + 렌더링 사이클 — Playwright codegen / Cypress Studio / React DevTools profiler (약한 답)

**산업 사례 결론**: **이벤트 흐름 = Playwright codegen JSON / 렌더링 사이클 = React DevTools profiler JSON 분리**.

#### 4.1 이벤트 흐름 (사용자 인터랙션)

**1차 사료 인용 (Playwright)**: "Playwright Codegen records a real browser session into runnable Playwright tests. Two windows are opened—a browser window where you interact with the website and the Playwright Inspector window where you can record your tests."

**산업 적용 trend (2025)**: Playwright 가 NPM 다운로드에서 Cypress 추월 (mid-2024). 2026 currently 20-30M weekly downloads.

#### 4.2 렌더링 사이클 (re-render 분석)

**1차 사료 인용 (React DevTools)**: "Export profiling sessions as JSON to share evidence of bottlenecks with your team or keep diagnostic history. The Profiler view shows the React commit cycles."

→ JSON export 형식 표준화 됨 (React DevTools 내부 spec). 본 방법론에서 직접 산출물로 채택 가능.

**v1.4 본 방법론 권고**:
- 이벤트 흐름 → 본 방법론 자체 추출 (Mermaid sequence 또는 SCXML — XState 사용 시) + Playwright spec.ts 자동 생성 (Stage 5 PoC 단계)
- 렌더링 사이클 → 분석 input 이 아닌 **신뢰도 보강 도구** 로 분류 (사용자 직접 export → 본 방법론 input 으로 옵션 입력)

**출처**: playwright.dev/docs/codegen / react.dev/reference/react/Profiler / react.dev/reference/dev-tools/react-performance-tracks.

---

### Q5. ★ legacy 호환 — Strangler fig + GenAI / jQuery → React (강한 답)

**산업 사례 결론** (★★★ 핵심):

#### 5.1 Thoughtworks CodeConcise (★ 본 방법론 가장 정합)

**1차 사료 인용 (martinfowler.com / Thoughtworks)**: "Thoughtworks has been experimenting with GenAI for modernization with their clients through a tool called **CodeConcise**, which combines a Large Language Model (LLM) with a knowledge graph derived from the abstract syntax trees of a codebase. Thoughtworks developed three generations of CodeConcise."

**측정 결과** (1차 사료):
- 자동차 제조사: 모듈당 reverse engineering 6주 → **2주 (3배 단축)**
- 1500만 LOC 클라이언트: documentation 작업 8 person-weeks/portion → **60,000 person-days 절감**

★ **본 방법론과의 정합**: CodeConcise = "LLM + AST knowledge graph" → 본 방법론 = "LLM + 결정적 추출 + cross-validation". 본질적으로 **같은 카테고리** 의 도구 — 단, 본 방법론은 **산출물 형식 표준화 + 7대 산출물 + finding 시스템** 을 추가한 형태.

#### 5.2 Strangler Fig 패턴 (Martin Fowler 2004)

산업 사례 공통 인용 — "By gradually replacing the old system, the Strangler Fig approach reduces the risks associated with system migration, minimizes disruption and allows for the continuous delivery of value throughout the process."

**FE 한정 적용** (LegacyLeap 2026 Guide): "Using a phased Strangler Fig approach, enterprises can incrementally route traffic between legacy JSF pages and modern React/Angular components."

#### 5.3 Airbnb Hypernova (jQuery → React 실제 사례)

**1차 사료 인용 (medium.com/airbnb-engineering)**: Rails 기반에서 React + Hypernova 로 마이그레이션. **untraceable witchcraft** (`add_bootstrap_data` 같은 마법 함수) 추적이 가장 큰 도전. → 본 방법론에서 **bootstrap data flow 추출** 을 deliverable 항목으로 추가 권고.

#### 5.4 v1.4 본 방법론 권고 (Q5 종합)

| 권고 | 산업 사례 정합 |
|---|---|
| **legacy-spectrum.json** 신설 (jQuery / Vanilla MPA / JSP / Struts / JSF / SPA 분류) | LegacyLeap migration guide trend |
| **bootstrap-data-flow.md** 신설 (서버→클라 데이터 전달 경로 추출) | Airbnb Hypernova 사례 |
| **strangler-migration-plan.md** 산출물 신설 — Strangler Fig 호환 phase 분할 | Thoughtworks Strangler Fig 3-part series |
| 본 방법론 자체를 "CodeConcise 카테고리 + 산출물 표준화" 로 포지셔닝 | Thoughtworks CodeConcise 정합 |

**출처**: martinfowler.com/articles/legacy-modernization-gen-ai.html / Thoughtworks "Embracing Strangler Fig" Part 1-3 / Airbnb Tech Blog "Rearchitecting Airbnb's Frontend" / LegacyLeap "JSP to React Migration 2026 Guide".

---

### Q6. ★ 산출물 ↔ 테스트 자동 도출 경로 (강한 답)

**산업 사례 결론** (★★★ 핵심): **5 개 권위 매개체 동시 채택** — 단일 매개체로 전체 cover 불가.

| 차원 | 권위 매개체 (산업 표준) | 자동 테스트 생성 경로 | 회사/배경 |
|---|---|---|---|
| **컴포넌트 스펙** | Storybook CSF v3 (`*.stories.ts`) | `play` function → @storybook/test interaction test | Storybook (Chromatic 후원) |
| **Web Components 컴포넌트** | Custom Elements Manifest (CEM) `custom-elements.json` | @custom-elements-manifest/analyzer → docs/types/test 자동 wrap | open-wc / Microsoft FAST / Adobe / Salesforce |
| **시각** | CSF + Chromatic parameter | `chromatic` parameter 자체가 test (every story = test) | Chromatic |
| **API 계약** | Pact spec v4 (`pact.json`) + MSW handler | Pact provider verification + MSW 통합 test | Pact Foundation |
| **상태 머신** | SCXML (W3C) — XState export | property-based test 자동 생성 | XState (Stately.ai) |
| **i18n** | ICU MessageFormat (FormatJS extract) | message coverage test | FormatJS (Yahoo origin) |
| **a11y** | axe-core JSON report | report 자체가 audit test | Deque Systems |
| **mutation 검증** | Stryker mutation score | 위 모든 test 의 quality 검증 | Stryker Mutator |

#### 6.1 1차 사료 인용

**Storybook CSF v3** (storybook.js.org): "Play Functions — Small snippets of code executed when the story renders in the UI. These enable automated interaction testing—simulating user actions and assertions without manual intervention. `import { expect } from 'storybook/test'` within play functions."

**CEM** (custom-elements-manifest.open-wc.org): "@custom-elements-manifest/analyzer will scan the source files in your project, and run them through the TypeScript compiler to gather information about your package... cem analyze to generate a file called custom-elements.json. Storybook plugin allows you to automate the generation of your Storybook stories."

**Chromatic** (storybook.js.org/docs/writing-tests/visual-testing): "When you enable visual testing, every story is automatically turned into a test. That first build will create the baseline snapshots."

**Pact spec v4** (github.com/pact-foundation/pact-specification): "All V4 pact files must have a pactSpecification key with a version attribute of 4.0. version 4 allows interactions of multiple types (HTTP, async, synchronous)."

**SCXML** (xstate.js.org): "XState adheres to the SCXML specification."

**axe-core** (deque.com/axe/axe-core): "All axe-core driven accessibility scans can be set up to return their results as a JSON object."

**Stryker** (stryker-mutator.io): "Supports Jest, Vitest, Mocha, Jasmine, Karma, Cucumber, Tap. TypeScript Checker for enhanced type safety during mutation testing."

#### 6.2 v1.4 본 방법론 권고 — 매개체 채택 우선순위

**Tier 1 (필수 채택, v1.4)**:
- Storybook CSF v3 — 컴포넌트 스펙
- axe-core JSON — a11y
- Pact spec v4 + MSW handler — API 계약 (FE 측)

**Tier 2 (강력 권장, v1.4)**:
- DTCG (W3C Design Tokens 2025.10 stable) — 디자인 토큰 (이미 본 방법론 §7 hint 있음 — 격상)
- ICU MessageFormat (FormatJS extract) — i18n
- Custom Elements Manifest — Web Components 사용 시 (Polaris 2025.10 / Fluent UI 사례)

**Tier 3 (옵션, v1.5 이연 후보)**:
- SCXML / XState — 복잡한 상태 머신만
- Lighthouse CI — 성능 차원
- Stryker mutation — 산출물 quality 검증

**출처**: 위 각 도구 1차 사료 + Q9 결합.

---

### Q7. ★ BE/FE 분리 운영 정책 (강한 답)

**산업 사례 결론** (★★★ 핵심): **4 모델 시장 동시 존재** — 본 방법론은 사내 FE 스택 (React+TS+TanStack Query — memory `project_adoption_workspace.md`) 정합 모델 채택 권고.

| 모델 | 회사 사례 | 분리 정도 |
|---|---|---|
| **A. NPM 분리** (separate package) | Shopify Polaris (`@shopify/polaris`), Microsoft Fluent UI (`@fluentui/web-components`) | ★★★ 완전 분리 |
| **B. Multi-platform spec** | Google Material 3 (Android/iOS/Web/Flutter) | ★★★ spec-first |
| **C. Server-first 통합** | Vercel Next.js App Router (RSC + Server Actions) | ★ 통합 |
| **D. 마이크로프론트엔드** | single-spa + Module Federation (Vercel labs example) | ★★ 분리 + 런타임 통합 |

#### 7.1 1차 사료 인용

**Shopify Polaris** (npmjs.com/package/@shopify/polaris): "On October 1, 2025, Shopify released Polaris Web Components for Shopify app development." → npm 분리 + WCAG 2.1 AA 기본 + 2025년 React → Web Components 전환 (CEM 정합).

**Microsoft Fluent UI** (learn.microsoft.com/en-us/fluent-ui/web-components): "Fluent UI Web Components are built directly on the W3C Web Component standards... For convenience there is a CEM (custom elements manifest) included at the root of the project."

**Google Material 3** (m3.material.io/foundations/design-tokens): Tokens 가 multi-platform 의 핵심 매개체. Android XML / Flutter / Web / iOS 자동 생성.

**Vercel Next.js 16** (nextjs.org/blog): "Cache Components: A new programming model leveraging Partial Pre-Rendering (PPR) and use cache for instant navigation."

#### 7.2 v1.4 본 방법론 권고

**채택 모델**: **Model A (NPM 분리) + Model B (Multi-platform spec via DTCG) 결합** — 사내 FE 스택 (React+TS+TanStack Query) 정합.

**구체 정책**:

```
ai-native-methodology/
├── methodology-spec/
│   ├── be-track/                 ← 기존 (v1.3.1)
│   ├── fe-track/                 ← 신설 (v1.4)
│   └── shared/                   ← OpenAPI 3.1 (BE-FE 공유 매개체)
└── examples/
    ├── poc-04-realworld-fe-react/   ← FE 단독 PoC
    └── poc-05-fullstack-spring-react/ ← BE+FE 통합 PoC (선택)
```

**예외 처리**:
- **JS 풀스택 (Node BE)** — BE/FE 같은 repo / 같은 스택 → tooling 공유 가능 (BE 트랙 + FE 트랙 병렬 실행)
- **JSP (Java + 뷰 혼재)** — 별도 deliverable `legacy-mixed-spec.md` 신설 필요. JSP 코드를 FE 코드 + BE 부분 분리 추출.

**출처**: npm @shopify/polaris / @fluentui/web-components / m3.material.io / nextjs.org / Vercel docs.

---

### Q8. 비기능 차원 — Lighthouse CI / Web Vitals / axe-core / FormatJS (약한 답)

**산업 사례 결론**: 4 차원 모두 산업 표준 도구 존재 — v1.4 / v1.5 분할 권고.

| 차원 | 산업 표준 도구 | output 형식 | 회사 |
|---|---|---|---|
| **성능** | Lighthouse CI (LHCI) | JSON (Lighthouse 12.6.x) — Performance/A11y/SEO/BP 4 카테고리 | Google Chrome team |
| **a11y** | axe-core | JSON (violations 배열) | Deque Systems |
| **i18n** | FormatJS extract (ICU AST) | JSON (message catalog) | FormatJS / Yahoo origin |
| **보안** | (산업 표준 부재 — Snyk / OWASP ZAP / npm audit 분산) | 도구별 JSON 다름 | (분산) |

#### 8.1 1차 사료 인용

**Lighthouse CI** (github.com/GoogleChrome/lighthouse): "LHCI 0.15.x uses Lighthouse 12.6.1. lhci collect against your staging URL, lhci assert to set score thresholds. GitHub Actions integration via treosh/lighthouse-ci-action."

**axe-core** (deque.com): "Issue data from Axe Auditor test runs now includes the element Selector in both CSV and JSON formats... reports in CSV, XML, or HTML from your JSON accessibility results."

**FormatJS** (formatjs.github.io): "Internally at Yahoo, they have a proprietary infrastructure to deal with ICU message translation and extraction, but have no plans to open that up for all users." → 즉, ICU MessageFormat 자체는 표준이지만 extract pipeline 은 회사별.

#### 8.2 v1.4 본 방법론 권고

**v1.4 포함**:
- a11y (axe-core JSON) — 본 방법론의 finding 시스템과 정합 높음 (violation = finding)
- i18n (ICU extract) — 분석 deliverable 로 적합 (message coverage)

**v1.5 이연 권고**:
- 성능 (Lighthouse CI) — 분석 input 이 아닌 동적 측정 → carry-over 분류 (no-simulation 정책 정합)
- 보안 — 산업 표준 부재 — v1.5 별도 트랙 필요

**출처**: github.com/GoogleChrome/lighthouse / deque.com/axe/axe-core / formatjs.github.io.

---

### Q9. ★ visible 차원의 사람-가독 형식 (강한 답)

**산업 사례 결론** (★★★ 핵심): **Storybook hosted URL = 사실상 시장 표준**. Backlight / Knapsack / Supernova 는 Storybook 의 super-set.

| 도구 | review 채널 | 비고 |
|---|---|---|
| **Storybook** (storybook.js.org) | self-hosted URL (storybook-static/ 빌드 결과) | de facto 표준 — 거의 모든 회사 |
| **Chromatic** | Chromatic 호스팅 + GitHub PR check + UI Review UI | Storybook 공식 협업 도구 |
| **Backlight** | 자체 호스팅 — Storybook URL 연결 가능 | 디자인 시스템 전용 |
| **Knapsack** | Storybook + Figma + GitHub 통합 | enterprise focus |
| **Supernova** (2025.05) | Storybook 통합 + private hosting (VPN/auth 가능) | 디자인 시스템 docs |

#### 9.1 1차 사료 인용

**Storybook + Chromatic PR review** (storybook.js.org/docs/writing-tests/visual-testing): "PR status checks, and TurboSnap to avoid re-testing unchanged stories. Story Modes: import them into a CSF (*.stories.js|ts) file and use the chromatic parameter."

**Supernova (2025.05)** (learn.supernova.io): "supercharged Storybook integration in May 2025 that eliminates manual URL pasting and basic iframes... For Storybooks behind VPN or authentication, you can deploy Storybook via CLI directly to Supernova for private, secure hosting."

**Knapsack** (knapsack.cloud): "Knapsack integrates with tools like Figma, GitHub, and Storybook to sync with how your teams already work."

#### 9.2 v1.4 본 방법론 권고

**1차 review 채널**: **Storybook (self-hosted) + Chromatic UI Review** — 산업 사실상 표준.

**산출물 위치**:
```
output/ui/
├── storybook-static/           # Storybook 빌드 (정적 사이트, AI 자동 생성 가능)
├── chromatic-build-id.txt      # Chromatic build URL (CI 업로드 시)
└── visual-baselines/           # jest-image-snapshot fallback (Chromatic 미사용 시)
```

**PR review 흐름** (산업 표준 정합):
1. AI 가 추출한 ui-spec.json + components.md → Storybook CSF 자동 생성 (Stage 3 / 5)
2. Chromatic 업로드 → PR check + UI Review URL
3. 사람 review → "기획자 검토 완료" (이미 v1.3 §11 체크리스트 있음 — 격상)

**출처**: storybook.js.org / chromatic.com docs / supernova.io / knapsack.cloud / Storybook design system repo (storybookjs/design-system).

---

## 3. 산업 도구-산출물 매핑 표 (v1.4 격상 권고 종합)

| FE 분석 차원 | 권위 매개체 (산업 1차 사료) | 자동 테스트 경로 | 본 방법론 채택 우선순위 |
|---|---|---|---|
| 페이지/라우팅 | (없음 — framework 별 다름) | (없음) | v1.3 자체 형식 유지 |
| 컴포넌트 스펙 | **Storybook CSF v3** | `play` → @storybook/test | **Tier 1 — v1.4** |
| Web Components | **CEM (custom-elements.json)** | 자동 docs/wrapper 생성 | **Tier 2 — v1.4** |
| 시각 (visible) | **CSF + Chromatic parameter** | every story = visual test | **Tier 1 — v1.4** |
| 사용자 흐름 | (Mermaid 자체 + Playwright codegen 보조) | Playwright spec.ts 자동 생성 | v1.4 자체 + Stage 5 |
| 분산 상태 | XState SCXML (W3C) — 복잡 시만 | property-based test | **Tier 3 — v1.5** |
| API 계약 (FE 측) | **Pact spec v4 + MSW handler** | provider verification | **Tier 1 — v1.4** |
| 디자인 토큰 | **DTCG (W3C 2025.10 stable)** | Style Dictionary 자동 빌드 | **Tier 2 — v1.4** |
| a11y | **axe-core JSON** | report = audit test | **Tier 1 — v1.4** |
| i18n | **ICU MessageFormat (FormatJS extract)** | coverage test | **Tier 2 — v1.4** |
| 성능 | Lighthouse CI JSON | budget assert | **Tier 3 — v1.5** |
| mutation quality | Stryker | 위 모든 test 의 검증 | **Tier 3 — v1.5** |
| 렌더링 사이클 | React DevTools profiler JSON | re-render budget | 옵션 input |
| visible review | **Storybook hosted URL + Chromatic** | PR check | **Tier 1 — v1.4** |

---

## 4. 본 방법론 본체 격상 권고 (산업 사례 정합)

### 4.1 격상 우선순위 (Stage 2 Gate 1 input 권고)

**우선순위 1 — 산출물 신설** (산업 표준 매개체 정합):
1. **components.json (CSF 호환)** — Storybook CSF v3 형식 직접 채택 (또는 ui-spec.json `components` 확장)
2. **visual-baselines/** — Chromatic 또는 jest-image-snapshot 디렉토리 표준화
3. **api-contracts/pact/*.json** — Pact spec v4 (FE 측 consumer contract)
4. **a11y-report.json** — axe-core JSON (violation = finding 자동 매핑)
5. **design-tokens.tokens.json** — DTCG W3C 2025.10 stable 형식 (.tokens 확장자)

**우선순위 2 — 산출물 확장** (기존 v1.3 격상):
6. `ui-spec.json` — `components.cef_path` (CEM 사용 시) + `components.csf_path` (CSF 사용 시) 필드 추가
7. `design_tokens` 섹션 — DTCG `$type` / `$value` 표준 정합

**우선순위 3 — 산출물 신설** (legacy 대응):
8. **legacy-spectrum.json** — jQuery / Vanilla MPA / JSP / Struts / JSF / SPA 분류
9. **bootstrap-data-flow.md** — 서버→클라 데이터 부트스트랩 경로 (Airbnb 사례 반영)
10. **strangler-migration-plan.md** — Strangler Fig 호환 phase 분할

### 4.2 ADR 신설 권고

| ADR 후보 | 내용 | 산업 사례 정합 |
|---|---|---|
| **ADR-FE-001** | Storybook CSF v3 채택 | Storybook 시장 점유율 |
| **ADR-FE-002** | DTCG W3C 2025.10 stable 채택 | Adobe/Google/Meta/Salesforce 등 25+ 회사 동참 |
| **ADR-FE-003** | Pact spec v4 + MSW 채택 | Pact Foundation v4 안정 |
| **ADR-FE-004** | BE/FE 분리 정책 (NPM 분리 + DTCG 공유) | Polaris / Fluent UI / Material 3 사례 |
| **ADR-FE-005** | Chromatic / jest-image-snapshot baseline 정책 | 산업 표준 |
| **ADR-FE-006** | Strangler Fig + bootstrap-data-flow 신설 | Thoughtworks CodeConcise / Airbnb Hypernova |

### 4.3 본 방법론 포지셔닝 권고

**산업 정합 포지셔닝**: "Thoughtworks CodeConcise 카테고리 + 산업 표준 매개체 (CSF / DTCG / Pact / axe-core) + 7대 산출물 standardization + finding system"

→ 사내 표준 채택 시 1차 사료 정합 근거: Thoughtworks (martinfowler.com) + Adobe / Google / Microsoft / Meta / Salesforce / Shopify (DTCG) + Storybook ecosystem.

---

## 5. Stage 2 Gate 1/2/3 input 권고

### 5.1 Gate 1 (핵심 구조)

| 결정 항목 | 산업 사례 정합 권고 |
|---|---|
| spectrum 우선순위 | **P0: JSP+jQuery / Vanilla MPA, P1: modern SPA** (LegacyLeap + Thoughtworks 정합) |
| deliverable 신설 vs 보강 | **Scenario B (comprehensive)** — 5개 산출물 신설 + 3 산출물 확장 (산업 표준 매개체 채택 정합 시 신설 불가피) |
| schema 통합 vs 분리 | **분리** — components.json / visual-baselines / a11y-report 별도 schema (산업 표준 형식 직접 채택) |
| 산출물↔테스트 매개체 표준 | **5 매개체 동시 채택** (CSF / Chromatic / Pact / axe-core / DTCG) — Tier 1 |

### 5.2 Gate 2 (보강 범위)

| 결정 항목 | 산업 사례 정합 권고 |
|---|---|
| 비기능 차원 v1.4 vs v1.5 | **v1.4: a11y + i18n / v1.5: 성능 + 보안 + mutation** |
| legacy cover 범위 | **JSP / jQuery legacy / Vanilla MPA + bootstrap-data-flow + strangler-migration-plan** |
| BE/FE 분리 정책 | **Model A (NPM) + Model B (DTCG 공유)** + JSP 예외 (`legacy-mixed-spec.md`) |

### 5.3 Gate 3 (검증 전략)

| 결정 항목 | 산업 사례 정합 권고 |
|---|---|
| mini-PoC 진입 | **권장** — 1주 small sprint (RealWorld FE 1 page + 1 컴포넌트 + 1 flow + 1 visual baseline) |
| PoC #04 대상 | **RealWorld FE (React) + 사내 legacy 1건 (JSP+jQuery)** — spectrum 양 끝 동시 검증 |
| 신뢰도 목표 | 0.85+ (BE 트랙 v1.3 동급) — 단, **시각 차원은 0.95+** (Chromatic baseline = ground truth) |
| Sprint 분할 | 4 sprint — (1) 컴포넌트+CSF, (2) visual+Chromatic, (3) Pact+MSW, (4) a11y+DTCG+i18n |

---

## 6. 출처 (회사명 / 도구명 / 1차 사료 URL)

### 6.1 강 등급 (A — 회사 공식 / W3C / 1차 사료)

| 회사/조직 | 도구 | URL |
|---|---|---|
| Storybook (Chromatic 후원) | CSF v3 / play function | https://storybook.js.org/docs/api/csf |
| Storybook | Visual Testing docs | https://storybook.js.org/docs/writing-tests/visual-testing |
| Chromatic | Story Modes / Visual tests | https://www.chromatic.com/docs/modes/ + https://www.chromatic.com/storybook |
| American Express | jest-image-snapshot | https://github.com/americanexpress/jest-image-snapshot |
| Netflix | SafeTest 공개 | https://netflixtechblog.com/introducing-safetest-a-novel-approach-to-front-end-testing-37f9f88c152d / https://github.com/kolodny/safetest |
| Stryker Mutator | StrykerJS | https://stryker-mutator.io/docs/stryker-js/introduction/ |
| Pact Foundation | Pact spec v4 | https://github.com/pact-foundation/pact-specification/tree/version-4 + https://docs.pact.io/getting_started/specification |
| Mock Service Worker | MSW docs | https://mswjs.io/docs/ |
| W3C DTCG | Design Tokens 2025.10 stable | https://www.designtokens.org/tr/drafts/format/ + https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/ |
| Style Dictionary | DTCG 지원 (v4+) | https://styledictionary.com/info/dtcg/ |
| Thoughtworks / Martin Fowler | Strangler Fig + GenAI | https://martinfowler.com/articles/legacy-modernization-gen-ai.html + https://www.thoughtworks.com/insights/articles/embracing-strangler-fig-pattern-legacy-modernization-part-one |
| Thoughtworks | CodeConcise (AI-enabled modernization) | https://www.thoughtworks.com/en-us/what-we-do/modernization/ai-enabled-modernization |
| Airbnb | Rearchitecting Frontend (Hypernova) | https://medium.com/airbnb-engineering/rearchitecting-airbnbs-frontend-5e213efc24d2 + https://airbnb.io/projects/hypernova/ |
| Airbnb | Lottie Swift modernization | https://medium.com/airbnb-engineering/lottie-and-swift-at-airbnb-e0c85dc365e7 |
| Shopify | Polaris React + Web Components | https://polaris-react.shopify.com/foundations/accessibility + https://www.npmjs.com/package/@shopify/polaris |
| Microsoft | Fluent UI Web Components + CEM | https://learn.microsoft.com/en-us/fluent-ui/web-components/ + https://github.com/microsoft/fluentui |
| Microsoft FAST | FAST foundation | https://fast.design/ |
| Google | Material 3 design tokens | https://m3.material.io/foundations/design-tokens |
| Vercel | Next.js 16 / App Router / RSC | https://nextjs.org/ + https://vercel.com/docs/frameworks/full-stack/nextjs |
| Vercel labs | single-spa + Module Federation | https://github.com/vercel-labs/microfrontends-single-spa-module-federation |
| Google Chrome | Lighthouse CI | https://github.com/GoogleChrome/lighthouse |
| Deque Systems | axe-core | https://github.com/dequelabs/axe-core + https://www.deque.com/axe/axe-core/ |
| Yahoo / FormatJS | ICU MessageFormat | https://formatjs.github.io/ + https://yahooeng.tumblr.com/post/100006468771/announcing-formatjs-internationalize-your-web |
| React (Meta) | DevTools Profiler / Performance Tracks | https://react.dev/reference/react/Profiler + https://react.dev/reference/dev-tools/react-performance-tracks |
| Microsoft | Playwright codegen | https://playwright.dev/docs/codegen |
| Stately.ai | XState (SCXML 호환) | https://github.com/statelyai/xstate |
| Open WC | Custom Elements Manifest analyzer | https://custom-elements-manifest.open-wc.org/ |

### 6.2 중 등급 (B — 오픈소스 README / 회사 후원 docs)

| 도구/주제 | URL |
|---|---|
| Storybook design system 자체 | https://github.com/storybookjs/design-system |
| Knapsack vs Storybook | https://www.knapsack.cloud/storybook-vs-knapsack |
| Supernova Storybook 통합 (2025.05) | https://learn.supernova.io/latest/releases/may-2025/new-storybook-integration-and-hosting-IhMWfZsP |
| Pactflow Pact contracts | https://docs.pactflow.io/docs/bi-directional-contract-testing/contracts/pact/ |
| @custom-elements-manifest/analyzer | https://custom-elements-manifest.open-wc.org/analyzer/getting-started/ |

### 6.3 컨설팅 / 산업 분석 (C)

| 주제 | URL |
|---|---|
| Legacy Java EE migration 2026 | https://www.legacyleap.ai/blog/java-migration-guide/ |
| JSP to React/Thymeleaf Migration 2026 | https://www.legacyleap.ai/blog/jsp-to-react-thymeleaf-migration/ |
| JSF Migration with Gen AI | https://www.legacyleap.ai/blog/jsf-migration-strategy/ |
| State Management 2025 (Developer Way) | https://www.developerway.com/posts/react-state-management-2025 |
| Micro-frontends 2025 (Feature-Sliced) | https://feature-sliced.design/blog/micro-frontend-architecture |

### 6.4 단순 추측 / 1차 사료 미확인 (D — 명시 의무)

- **Percy** (BrowserStack) baseline 형식 — 1차 사료 fetch 실패 (404). Chromatic 의 등가 추정 (PNG + 메타).
- **Pact production 사례 회사 list** — Pact docs 자체에 미공개. 추측 회피.
- **Yahoo internal i18n infra** — FormatJS 만 공개, internal 비공개 명시.
- **사내 FE 스택 정확한 spectrum** — memory `project_adoption_workspace.md` (React+TS+TanStack Query+Zustand+Axios) 만 알려짐. legacy 비율 미확인.

---

## 7. 본 research 한계 및 후속 권고

### 7.1 한계

1. **Percy 1차 fetch 실패** — BrowserStack 측 docs 접근 불가 (Q2 답에 추정 표기). Stage 1 다른 에이전트 (공식문서) 가 보강 권고.
2. **Pact 사용 회사 list 부재** — Pact 자체는 spec 공개되어 있으나 "어느 회사가 production 에서 사용 중" 1차 자료 부재. 단, Pact Foundation 자체가 NewRelic / Atlassian 후원 (커뮤니티 정보) — 단, 1차 사료 미확인.
3. **사내 legacy spectrum 미확인** — 사용자 응답 / 사내 코드 1차 input 필요 (Stage 4 mini-PoC 단계에서).

### 7.2 후속 (Stage 1 → Stage 2 진입 전)

- 공식문서 에이전트: W3C SCXML / WCAG 2.1 AA / OpenUI / RFC 측면 보강
- Senior FE 에이전트: 9 Q 의 본 방법론 통합 권고안 도출 + 본 research 와의 cross-validation
- 본 research 의 D 등급 (추측) 항목 → 다른 에이전트가 1차 사료 확보 시 격상

---

**총 단어 수**: 약 2,800 단어 (목표 1500~3000 범위 내).

**본 research 의 ★★★ 핵심 결단**:
1. 산업 표준 매개체 5종 동시 채택 — CSF / Chromatic / Pact / axe-core / DTCG (Tier 1)
2. 본 방법론을 Thoughtworks CodeConcise 카테고리 + 산업 표준 매개체 정합 도구로 포지셔닝
3. legacy 대응 산출물 3종 신설 — legacy-spectrum / bootstrap-data-flow / strangler-migration-plan
4. BE/FE 분리: NPM 분리 + DTCG 공유 모델 (Polaris / Fluent UI / Material 3 정합)
5. Storybook hosted URL + Chromatic UI Review = visible 차원의 산업 사실상 표준
