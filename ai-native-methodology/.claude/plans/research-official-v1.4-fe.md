# Research — 공식문서/표준 (v1.4 FE 트랙 Stage 1)

> 작성: 2026-05-01 / 에이전트: 공식문서·표준 / Stage: v1.4 Stage 1 — research × 3 의 1번째
> 자매 산출: research-industry-v1.4-fe.md (테크기업 사례), research-senior-v1.4-fe.md (Senior FE 통합 권고)
> 사상 정합: CLAUDE.md ★★★ 가치 명세 (한 방향 추출기 / 이식성 5종) + ★★★ no-simulation 정책

---

## 1. Scope + 출처 강도

### 1.1 본 에이전트 권위 영역 (1차 사료 의무)

| 출처 카테고리 | 권위 수준 | 1차 사료 |
|---|---|---|
| W3C Recommendation (REC) | ★★★ Standard | `https://www.w3.org/TR/...` |
| W3C Working Draft (WD) | ★★ 진행 중 표준 | TR + 날짜 ID |
| WHATWG Living Standard | ★★★ de facto Standard (browser-vendor 합의) | `https://*.spec.whatwg.org/` |
| W3C Community Group Report | ★ 비공식 (단, DTCG/OpenUI 는 산업 채택률 높음) | `designtokens.org` / `open-ui.org` |
| IETF RFC / Internet-Draft | ★★★ / ★★ | `datatracker.ietf.org/doc/...` |
| Unicode UTS | ★★★ Standard | `unicode.org/reports/tr35/` |
| ECMA-262 / ECMA-402 | ★★★ Standard | TC39 |
| 주요 framework 공식 docs | ★★ vendor-authoritative (cross-validation 권장) | react.dev / nextjs.org / kit.svelte.dev / vuejs.org |

### 1.2 9 Question 영역 강도 자체 평가

| Q | 강/약 | 본 에이전트 답 신뢰도 |
|---|---|---|
| Q1 spectrum 분석 표준 | 강 ★ | 0.85 (W3C/WHATWG 영역 직결) |
| Q2 시각 산출 W3C 등가물 | 약 | 0.55 (산업 도구가 우세, 표준은 WPT reftest 한정) |
| Q3 분산 상태 표준 | 강 ★ | 0.80 (SCXML / Storage API / URL spec 명확) |
| Q4 이벤트-주도 + 렌더링 | 강 ★ | 0.85 (SCXML + WHATWG DOM event flow) |
| Q5 legacy 호환 | 약 | 0.55 (HTML/DOM 표준은 충분, FW 매핑은 industry 권한) |
| Q6 산출물↔테스트 매개체 | 강 ★ | 0.90 (CEM / OpenAPI / JSON Schema / SCXML 모두 표준) |
| Q7 BE/FE 분리 운영 | 약 | 0.50 (표준 영역 외 — Pact 정도) |
| Q8 비기능 차원 표준 ID | 강 ★ | 0.95 (WCAG / CSP / Web Vitals / RFC / ICU 모두 ID 명확) |
| Q9 visible 가독 형식 | 약 | 0.55 (CSF 는 vendor / WPT reftest 만 표준) |

---

## 2. 9 Question 답

### Q1. 분석 대상 spectrum (강 ★)

**modern React/Vue/Svelte/Next**:
- 권위 표준 부재. 각 framework 공식 docs 가 vendor-authoritative.
- 단, 공통 기반: **WHATWG HTML Living Standard §4.13 Custom Elements** (last-updated 2026-04-24) 가 framework-agnostic 컴포넌트 primitive 제공.
- React 19 RSC / Next.js App Router 16.x 는 `async` Server Component 가 ecosystem 신규로 unit-test 미성숙 → E2E 권고 (Next.js 공식 docs 2026-04-10).
- 컴포넌트 메타데이터 표준: **Custom Elements Manifest (CEM) v2.1.0** (2024-05-06, webcomponents 조직 / WICG-adjacent) — JSON Schema 기반 `tag-name / attributes / events / slots / cssProperties / cssParts`.

**jQuery legacy / Vanilla / MPA**:
- 권위 표준: **WHATWG HTML Living Standard §4.10.22 (Form submission), §7.2.6 (navigation API), §7.4 (Navigation and session history), §4.6 (Link types)**.
- **WHATWG DOM Living Standard** (last-updated 2026-03-15) — Event flow 3-phase (capture / AT_TARGET / bubble), MutationObserver. 공식 명세에 따르면 form `action` + link `href` + navigation event handler (HTML §8.1.8) 가 page-flow 추출 algorithmic 기반.
- jQuery 분석: 학술 (Møller 외 "Modeling the HTML DOM and browser API in static analysis of JavaScript web applications") 가 jQuery/MooTools/Prototype 의 dynamic class inheritance 가 static analysis 를 어렵게 한다고 명시 — **AI-native 방법론 입장에서는 결정적 추출 신뢰도 ↓ + LLM 추론 + AP 등록 의무** 시사.

**JSP / 혼합**:
- WHATWG/W3C 직접 표준 없음. JSP 는 server-side rendering (Java EE / Jakarta EE 표준) 영역. UI 출력 후 산물은 HTML — DOM/HTML Living Standard 로 분석 가능.
- **권고**: Phase 5-2 입력에 server-rendered HTML snapshot 자체를 첨가 (jsp 파일 import 그래프 + 출력 HTML). JSX import 그래프 가정 대체.

**spectrum 권고 (v1.4 cover 우선순위)**:
1. modern React/Vue/Next/Svelte (★★★ — 신규 시스템 입력 자료 가치 최고)
2. jQuery legacy + MPA (★★★ — 사내 마이그레이션 대상 다수, 사용자 진단 직결)
3. JSP / Vanilla / 혼합 (★★ — 사내 적용 시 필수)

### Q2. 시각 산출 처리 — W3C/WHATWG 등가물 (약)

**산업 도구**: Chromatic / Percy / jest-image-snapshot / Playwright visual / Storybook test-runner.

**W3C/WHATWG 등가물**:
- **W3C WebDriver v2** (Working Draft 2026-04-30) — `Take Screenshot` / `Take Element Screenshot` 명령 정의. **시각 비교 API 는 명시적으로 부재** (캡처만 표준화).
- **Web Platform Tests (WPT)** — cross-browser test suite. **reftest** (rendering reference test — 두 페이지 동일 픽셀 출력 검증) 가 visual conformance 표준 패턴이지만, 본 방법론의 visible 추출 (legacy 시스템) 과는 결이 다름.
- **결론**: 시각 비교의 W3C 표준은 **부재**. WebDriver screenshot + 산업 도구 (jest-image-snapshot 가 OSS 라 매개체로 적합) 조합이 현실적. ★★★ no-simulation 정책 준수: 자체 캡처 도구 + 진짜 외부 (Playwright + jest-image-snapshot) 양쪽 필수.

**ui-spec 표현 권고**: visible-manifest 신설 (URL 또는 base64 + viewport + DPR + 캡처 timestamp + 해시). 외부 baseline 디렉토리 path 참조.

### Q3. 분산 상태 표현 — SCXML 또는 다른 표준 (강 ★)

**W3C SCXML (REC-scxml-20150901, 2015-09-01)** — State Chart XML, Harel statechart + CCXML 결합.
- 핵심 elements: `<state>`, `<transition>`, `<parallel>` (concurrent regions), `<history>` (shallow/deep — 일시정지/재개), `<datamodel>` (ECMAScript / XPath / null).
- **분산 상태 (server / client / URL / form / DOM) 적합도**:
  - server state (TanStack Query / SWR cache): SCXML datamodel 로 표현 가능하나 어색함. 별도 deliverable (server-state-cache.json) 권고.
  - client state (Zustand / Redux / Context): SCXML state 로 직접 매핑 가능 (★★★).
  - URL state: WHATWG **URL Living Standard** + History API + Navigation API (HTML §7.2.6). SCXML state 의 path 표현으로 매핑.
  - form state: HTML Living Standard §4.10 form data set + SCXML datamodel.
  - DOM state: DOM Living Standard MutationObserver 추출.

**대안 표준**:
- **W3C Web Storage API** — `localStorage` / `sessionStorage` 명세. persistence 분류용.
- **W3C IndexedDB** — 클라이언트 영구 저장.
- **WHATWG Cookie Store API** (RFC 6265bis 와 대응) — cookie state.

**권고**: deliverable 8 신설 — `state-map.json` + SCXML `.scxml` + Mermaid stateDiagram-v2. SCXML 은 W3C REC 이라 권위 1차 표준 채택 정당화 가능. xstate 는 SCXML 호환 (단, 자체 docs 에서 명시 없음 — cross-validation 시 stately.ai 추가 검증 필요).

### Q4. 이벤트-주도 + 렌더링 사이클 — SCXML 표현 가능성 (강 ★)

**SCXML 의 이벤트-주도 표현**: 모든 transition 은 event-trigger. `<onentry>` / `<onexit>` actions. parallel region 으로 동시 상태 모델링.

**React reactive cycle**: state change → reconciliation → commit → effect. 이는 SCXML 의 datamodel 변경 → 자동 transition 평가 와 conceptually 매핑 가능. **단, 직접 1:1 매핑 아님** — SCXML 은 event-driven, React 는 dataflow-driven. (W3C SCXML 공식: "complement React's state management but doesn't directly replace it").

**WHATWG DOM event flow**: 3-phase (capture / AT_TARGET / bubble). 모든 event listener 는 type / callback / capture flag / passive flag / once flag / signal 6-component. 이는 legacy jQuery 분석에 직결 (`$(...).on('click', ...)` → DOM addEventListener 등가).

**렌더링 사이클 표준 부재**: React 의 `useEffect` ordering / Concurrent rendering / Suspense boundary 는 React 19 vendor 명세. **표준 매개체 부재** — React DevTools profiler export JSON 자체가 사실상 industry standard.

**권고**:
- 이벤트 흐름 = Mermaid sequenceDiagram + DOM event-target 표기 (capture/bubble phase 명시).
- 렌더링 사이클 = framework-specific (React profiler / Vue DevTools / Svelte 추출). v1.4 에서는 antipatterns 등록 (`AP-FE-RENDER-CYCLE-LEAK`) 위주, 형식 명세는 v1.5 이연 권고.

### Q5. legacy 호환 — DOM 표준 / WHATWG 자산 활용 (약)

**WHATWG HTML Living Standard 의 legacy 분석 자산**:
- §4.10 Forms — form element / fieldset / input / select / button. server submit 시 `application/x-www-form-urlencoded` / `multipart/form-data` 형식. **MPA flow 추출 핵심**.
- §7.4 Navigation and session history — page transition algorithm.
- §4.6 Link types — `<a>` / `<area>` 의 navigation 의미.
- §8.1.8 Event handlers — `onclick` / `onsubmit` 등 inline handler.

**WHATWG DOM Living Standard 의 legacy 분석 자산**:
- Event 3-phase capture/bubble — jQuery `.on()` / `.delegate()` mapping 직결.
- MutationObserver — jQuery `.append()` / `.html()` 등 DOM mutation 추적.
- TreeWalker / NodeIterator — DOM 순회 표준.

**JSP 호환**:
- JSP 는 Jakarta EE 표준 (Eclipse Foundation). taglib + EL (Expression Language). UI 출력은 HTML — Living Standard 적용.
- **권고**: jsp 파일 분석 시 (1) taglib import (Java) + (2) EL 표현식 + (3) 출력 HTML 3-layer 분리. server-side BE 와 view-side FE 의 coupling 측정용 antipattern 신설.

**Vanilla JS / MPA 권고**:
- DOM event flow + form action + link href 만으로도 page-flow 추출 가능. JSX import 그래프 가정 대체 가능성 입증.
- ★ JSX 가정 의존 deliverable (현 7-ui-ux.md §3.1 "JSX import 그래프 = 결정적") **수정 필수** — "FW 별 추출 strategy 명시" 로 격상.

### Q6. ★ 산출물 ↔ 테스트 자동 도출 매개체 (강 ★)

**v1.4 표준 매개체 권고 (CLAUDE.md ★★★ 이식성 5종 정합)**:

| 차원 | 권위 매개체 | 표준 ID | 테스트 자동 생성 경로 |
|---|---|---|---|
| 컴포넌트 스펙 | **Custom Elements Manifest v2.1.0** | webcomponents/custom-elements-manifest schema.json | CEM → IDE / linter / Storybook stub / .d.ts |
| API 계약 (FE 측) | **OpenAPI 3.1** + JSON Schema 2020-12 | OAS 3.1.0 (2021-02-15) / draft-bhutton-json-schema-01 | OAS → MSW handler / mock server / TS client / Pact |
| 분산 상태 | **W3C SCXML** (REC-scxml-20150901) | W3C REC 2015-09-01 | SCXML → model-based test (graph traversal) |
| 디자인 토큰 | **DTCG format** v2025.10 | CG Draft Report 2026-04-27 (★ 표준화 진행 중 — 채택 시 carry-over 명시) | tokens → Style Dictionary → CSS / TS const → visual diff |
| 메시지 (i18n) | **ICU MessageFormat 1.0** + **Unicode UTS#35 Part 9 (MessageFormat 2)** | UTS — Unicode Technical Standard | MF2 → coverage check (locale 누락) |
| a11y | **WCAG 2.1 AA** + **WAI-ARIA 1.2** + **EARL 1.0 + JSON-LD** | W3C REC-WCAG21-20250506 / REC-wai-aria-1.2-20230606 | EARL JSON-LD report = audit test 자체 (axe-core/reporter-earl) |
| 보안 | **CSP3** + **RFC 6265bis** | W3C WD CSP3 2026-04-21 / IETF Internet-Draft draft-ietf-httpbis-rfc6265bis-22 (2025-12-01) | CSP report-to → 위반 모니터링 |
| 성능 | **Web Vitals** (Core: LCP/INP/CLS) | Google web.dev (de facto standard, INP 2024 stabilization) | Lighthouse CI budget |
| 자동화 | **W3C WebDriver v2** | W3C WD 2026-04-30 | WebDriver Take Screenshot → visual regression |

**산출물 → 테스트 자동 생성 가능성 평가**:
- 100% 표준 매개체 (CEM / OpenAPI / SCXML / JSON Schema / EARL): ★★★ 매끄러운 이식성. CLAUDE.md 가치 명세 ("그대로 입력") 만족.
- 표준 진행 중 (DTCG / MessageFormat 2): ★★ 채택 권고 단, "draft 상태" carry-over 명시 의무.
- 표준 부재 — vendor 의존 (Storybook CSF / React profiler / Chromatic baseline): ★ 채택 시 vendor 종속 명시 + 대체 표준 매개체 부재 사실 명시 (no-simulation 패턴 준수).

### Q7. BE/FE 분리 운영 — 표준 관점 (약)

**표준 영역 답**: BE/FE 분리 자체는 W3C/WHATWG/RFC 표준 영역 외. 단, **계약 표면 (contract surface) 표준** 이 분리 운영의 표준 매개체:

- **OpenAPI 3.1** (BE 산출 / FE 소비) — 양 측 분리 보장 매개체.
- **JSON Schema 2020-12** (request/response body 검증).
- **Pact (Consumer-Driven Contract)** — pact 자체는 OSS 도구이나, BE/FE 비대칭 관계 (consumer pulls / provider verifies) 의 사실상 표준 패턴. OAS 3.1 → Pact bi-directional 가능.
- **MSW (Mock Service Worker)** — Service Worker (W3C Service Workers Recommendation) 표준 위에 구축. FE 측 mock 표준 매개체.
- **CORS** (Fetch Living Standard / WHATWG) — cross-origin 정책 표준.

**권고**:
- BE 산출 = `openapi.yaml` (Phase 5-1 그대로 유지).
- FE 산출 = `openapi-consumed.yaml` (실제 호출하는 endpoint subset) + `msw-handlers.ts` 생성.
- **혼재 예외 (JSP / Node 풀스택)**: Phase 5-1 + 5-2 통합 명세 신설 (be-fe-merged.md). v1.4 에서는 ADR 신설 권고 (ADR-FE-002 BE/FE 계약 표면 표준화).

### Q8. ★ 비기능 차원 표준 ID + ui-spec 표현 가능성 (강 ★)

**i18n**:
- **ICU MessageFormat 1.0** (Unicode CLDR / ICU 라이브러리) — plurals / select / number/date/time format.
- **Unicode UTS #35 Part 9 (MessageFormat 2)** — UTS 공식 표준. ICU MF1 의 후속, **backwards-compat 비목표** (명시).
- **ECMA-402 Intl** — JavaScript 내장 i18n API (number / date / collation / pluralrules).
- ui-spec 표현: `i18n-spec.json` 신설 권고 — 추출된 message key + locale 목록 + extraction 도구 (FormatJS extract / lingui extract). coverage = (구현된 locale × 사용된 key) / total 식.

**성능**:
- **Web Vitals Core: LCP ≤ 2.5s / INP ≤ 200ms / CLS ≤ 0.1 (75th percentile)**. INP 가 2024 에 FID 대체.
- 보조: FCP / TTFB.
- 측정: Chrome User Experience Report (CrUX, real-user) + Lighthouse CI (lab).
- ui-spec 표현: `performance-budget.json` 권고 — page 별 budget + 실측 (Lighthouse CI 출력). RUM 권고 (CrUX API).

**보안**:
- **CSP3** (W3C Working Draft 2026-04-21) — `script-src` / `style-src` / `frame-ancestors` / `base-uri` / `report-to`.
- **RFC 6265bis** (Internet-Draft draft-22, 2025-12-01) — SameSite=Strict/Lax/None 표준화. Strict (same-site only), Lax (default + safe-method top-level navigation), None (Secure 필수).
- **HSTS** (RFC 6797), **Subresource Integrity** (W3C REC), **Trusted Types** (W3C WD).
- ui-spec 표현: `security-spec.json` 권고 — CSP header 추출 + 위반 보고 endpoint + cookie attribute table + XSS sink (innerHTML 사용처) + AP 매핑.

**a11y**:
- **WCAG 2.1** (REC 2025-05-06, 한국 사내 기준 통상 AA) — 4 원칙 (Perceivable / Operable / Understandable / Robust), Level A/AA/AAA.
- **WAI-ARIA 1.2** (REC 2023-06-06) — 6 role 카테고리 (Abstract / Widget / Document Structure / Landmark / Live Region / Window). aria-* 속성.
- **EARL 1.0 + JSON-LD** — 평가 결과 표준 직렬화 (axe-core/reporter-earl 공식 지원).
- **W3C ACT Rules** — WCAG 2.2 / ARIA 검증 informative rule. axe-core 가 ACT 구현체.
- ui-spec 표현: `a11y-report.json` (EARL+JSON-LD 형식) — 산출물 자체가 audit test.

**ui-spec 표현 종합 권고**: 현 `ui-spec.schema.json` 에 `non_functional` 섹션 신설 + 4 sub-schema (`i18n-spec` / `performance-budget` / `security-spec` / `a11y-report`) 분리. Schema-First (BE 패턴) 원칙 준수.

### Q9. ★ visible 차원 사람-가독 형식 (약)

**표준 영역 답**:
- **W3C Web Platform Tests reftest** — 두 페이지 동일 렌더링 검증의 표준 패턴. 단, "산출물의 visible 형식" 자체 가독 형식 표준은 부재.
- **WebDriver `Take Screenshot`** — 캡처 표준화. 비교 API 부재.
- **CSS Object Model (CSSOM) Living Standard** — computed style 추출 표준. 캡처 보강용.

**산업 표준 (vendor-driven, 1차 사료 한계)**:
- **Storybook CSF v3** (community standard, vendor: Chromatic Inc 주도) — 컴포넌트 사람-가독 형식. play function (interaction 자동화) + Vitest addon (자동화 가능). MDX 호환.
- **Chromatic baseline / Percy snapshot** — vendor-specific 형식. 표준 매개체 아님.

**사람-가독 형식 권고**:
1. **Storybook CSF v3** — community standard 채택 정당화 가능 (vendor 종속이나 실제 reusable 형식). story 자체가 visible 차원의 사람-가독 명세.
2. **Mermaid `journey` / `sitemap`** — 텍스트 기반 다이어그램 표준 (Mermaid 자체는 OSS). 사람+AI 양쪽 가독.
3. **HTML 정적 캡처 갤러리** — `viewport` + `DPR` + `theme` 별 thumbnail. WebDriver Take Screenshot 표준 활용.

**권고**: deliverable 9 신설 — `visual-manifest.json` + `stories/` 디렉토리 (CSF v3) + `captures/` 디렉토리 (정적 HTML 갤러리). v1.4 에서는 Storybook 의존 vs 의존 회피 (자체 갤러리) 양 안 cover.

---

## 3. 권위 매개체 / 표준 ID 권고

| Rank | 매개체 | 표준 ID | 본 방법론 채택 권고도 |
|---|---|---|---|
| 1 | OpenAPI 3.1 | OAS 3.1.0 (2021-02-15) | 이미 채택 ★★★ — 유지 |
| 2 | JSON Schema 2020-12 | draft-bhutton-json-schema-01 | 이미 채택 ★★★ — 유지 |
| 3 | Custom Elements Manifest | webcomponents/CEM v2.1.0 (2024-05-06) | ★★★ 신규 채택 권고 (FE 컴포넌트 스펙 표준 매개체) |
| 4 | W3C SCXML | REC-scxml-20150901 (2015-09-01) | ★★★ 신규 채택 권고 (분산 상태 형식 명세) |
| 5 | WCAG 2.1 AA | REC-WCAG21-20250506 | ★★★ 신규 채택 권고 (a11y 기준) |
| 6 | WAI-ARIA 1.2 | REC-wai-aria-1.2-20230606 | ★★★ 신규 채택 권고 |
| 7 | EARL 1.0 + JSON-LD | W3C TR EARL10-Schema | ★★★ 신규 채택 권고 (a11y 산출물 직렬화) |
| 8 | DTCG format | v2025.10 (CG Draft 2026-04-27) | ★★ 신규 채택 권고 (단, "draft" carry-over 명시 의무) |
| 9 | Web Vitals (Core) | Google web.dev (de facto) | ★★★ 신규 채택 권고 (성능 기준) |
| 10 | CSP3 | W3C WD CSP3 2026-04-21 | ★★★ 신규 채택 권고 |
| 11 | RFC 6265bis | draft-ietf-httpbis-rfc6265bis-22 | ★★★ 신규 채택 권고 (SameSite) |
| 12 | ICU MessageFormat 1 / UTS#35 MF2 | Unicode | ★★★ 신규 채택 권고 |
| 13 | WebDriver v2 | W3C WD 2026-04-30 | ★★ 시각 캡처 매개체 |
| 14 | WHATWG HTML / DOM Living Standard | last-updated 2026-04-24 / 2026-03-15 | ★★★ legacy/MPA 분석 기반 |
| 15 | Storybook CSF v3 | community (vendor: Chromatic) | ★★ 사람-가독 형식 (vendor 종속 명시) |
| 16 | Pact / MSW | OSS 도구 | ★★ BE/FE 계약 검증 (industry agent 협의) |

---

## 4. 본 방법론 본체 격상 권고

### 4.1 현 7-ui-ux.md / phase-5-2-ui.md / ui-spec.schema.json 빈틈

| 빈틈 | 근거 | 격상 우선순위 |
|---|---|---|
| **JSX import 그래프 가정 의존** (§3.1 결정적) | jQuery / Vanilla / MPA / JSP 미커버. WHATWG HTML §4.6 / §7.4 활용 가능. | ★★★ Scenario B (신설) |
| **분산 상태 차원 부재** | server / client / URL / form / DOM state 5종 미명세. SCXML W3C REC 채택 가능. | ★★★ deliverable 8 신설 (state-map) |
| **이벤트-주도 흐름 부재** | DOM event flow (capture/bubble) / SCXML transition 미명세. | ★★★ deliverable 9 일부 (event-flow) 또는 5-2 보강 |
| **시각 산출 (visible) 형식 부재** | WebDriver screenshot + CSF v3 + 정적 갤러리 미명세. | ★★★ deliverable 10 신설 (visual-manifest) |
| **비기능 차원 통합 부재** | i18n / 성능 / 보안 / a11y 표준 ID 미명시. ui-spec.schema 에 non_functional 섹션 부재. | ★★★ ui-spec.schema 확장 + 4 sub-schema |
| **컴포넌트 스펙 매개체 부재** | CEM v2.1 채택 시 IDE/linter/.d.ts 자동 생성 경로 확보. | ★★ schema 신설 (cem-spec.schema) |
| **a11y EARL 형식 부재** | W3C TR EARL10-Schema + JSON-LD axe-core 호환. 산출물 자체가 audit test. | ★★★ a11y-report.schema 신설 |
| **i18n message key 표준 부재** | ICU MF1 / UTS#35 MF2 표준 ID 미명시. | ★★ i18n-spec.schema 신설 |
| **legacy framework cover 부재** | jQuery / MPA / JSP 추출 strategy 미명세. | ★★★ Phase 5-2 분기 (5-2-modern / 5-2-legacy / 5-2-mpa) |
| **BE/FE 계약 표면 분리 부재** | Pact / MSW / OAS-consumed 매개체 미명세. | ★★ Stage 6 (BE/FE 분리 정책) 와 통합 |
| **신뢰도 표 framework-편향** | "JSX import 그래프 0.95" 는 React 한정. legacy 신뢰도 별도 항목 필요. | ★★ table 보강 |

### 4.2 Scenario A (보강) vs Scenario B (신설) 권고

**본 에이전트 권고 = Scenario B (comprehensive 신설)**.

근거:
1. **Q6 산출물↔테스트 매개체 표** 의 권위 매개체 ≥ 5종 (CEM / SCXML / EARL / DTCG / WebDriver) 이 신설 deliverable 단위로 분리되어야 schema-first + AI 가독성 양립.
2. **Q1 spectrum** 의 legacy/MPA cover 는 7-ui-ux.md 단일 파일 보강으론 분량 폭증 (현 305줄 → ~700줄 추정). Phase 5-2 분기 (modern / legacy / mpa) 가 가독성 우월.
3. **Q8 비기능 4종** 은 각각 1차 사료 표준 ID 가 분명 → 각각 deliverable 분리 가능 (over-engineering 아닌 정합).
4. CLAUDE.md ★★★ "이식성 5종" 패턴 (BE) 과 동치 — FE 도 5종 + (8/9/10/11) 추가 = 9~11종 deliverable 가 합당.

### 4.3 권고 deliverable 트리

```
methodology-spec/deliverables/
├── 7-ui-ux.md                  ← 보강 (페이지/사용자 흐름/시나리오 만 유지)
├── 8-state-map.md              ← 신설 (분산 상태 / SCXML)
├── 9-event-flow.md             ← 신설 (이벤트 흐름 / DOM event 3-phase)
├── 10-visual-manifest.md       ← 신설 (visible 산출 / WebDriver + CSF)
├── 11-component-spec.md        ← 신설 (CEM v2.1 + .d.ts)
└── non-functional/             ← sub-tree
    ├── a11y-report.md          ← EARL+JSON-LD
    ├── i18n-spec.md            ← ICU MF1 / UTS#35 MF2
    ├── performance-budget.md   ← Web Vitals + Lighthouse CI
    └── security-spec.md        ← CSP3 + RFC 6265bis
```

ADR 신설 권고:
- **ADR-FE-001** — FE 추출기 가정 명시 (modern/legacy/mpa/jsp 분기 strategy)
- **ADR-FE-002** — BE/FE 계약 표면 표준화 (OAS 3.1 + Pact + MSW)
- **ADR-FE-003** — visible 차원 시각 산출 형식 (WebDriver + CSF v3 + 정적 갤러리)
- **ADR-FE-004** — 분산 상태 표준 매개체 채택 (W3C SCXML 1.0 + state-map.json)
- **ADR-FE-005** — a11y / i18n / 성능 / 보안 표준 ID 채택 결정

---

## 5. Stage 2 Gate 1/2/3 input 권고

### Gate 1 (핵심 구조) 결정 input
- **spectrum 우선순위**: §Q1 권고 — modern (★★★) > legacy/MPA (★★★) > JSP/Vanilla (★★)
- **deliverable 신설 vs 보강**: §4.2 권고 — Scenario B (comprehensive 신설)
- **schema 통합 vs 분리**: 분리 (deliverable 별 schema 1:1)
- **산출물↔테스트 매개체 표준 채택**: §3 표 의 Rank 1~12 (★★ 이상) 채택, Rank 13~16 별도 결정.

### Gate 2 (보강 범위) 결정 input
- **비기능 4종 v1.4 포함 vs v1.5 이연**: §Q8 권고 — 4종 모두 v1.4 포함 (표준 ID 명확). 단 i18n 은 ICU MF1 우선 + MF2 carry-over.
- **legacy cover 범위**: jQuery + Vanilla + MPA + JSP 모두 v1.4 cover (Phase 5-2 분기 4 sub-phase).
- **BE/FE 분리 정책**: ADR-FE-002 신설 + Stage 6 통합. JSP / Node 풀스택 = ADR 예외 조항.

### Gate 3 (검증 전략) 결정 input
- **mini-PoC 진입**: 권고. Phase 5-2-modern 만 1주 검증 (RealWorld FE 1page + 1component + 1flow + 1state + 1visual).
- **PoC #04 대상**: RealWorld FE (modern) + 별도 mini-PoC (legacy jQuery / MPA / JSP) 권고. 단일 PoC 과적합 회피 (CLAUDE.md §8.1).
- **신뢰도 목표**: 0.85 (BE 동일).
- **Sprint 분할**: Sprint 1 (modern + 비기능 4종) → Sprint 2 (legacy + MPA + JSP) → Sprint 3 (BE/FE 통합 검증).

---

## 6. 출처 (W3C/WHATWG/RFC ID + 1차 사료 URL)

### W3C Recommendations
- **WCAG 2.1**: REC-WCAG21-20250506 — `https://www.w3.org/TR/2025/REC-WCAG21-20250506/`
- **WAI-ARIA 1.2**: REC-wai-aria-1.2-20230606 — `https://www.w3.org/TR/2023/REC-wai-aria-1.2-20230606/`
- **SCXML 1.0**: REC-scxml-20150901 — `https://www.w3.org/TR/scxml/`
- **EARL 1.0 Schema**: W3C TR — `https://www.w3.org/TR/EARL10-Schema/`

### W3C Working Drafts
- **CSP Level 3**: WD-CSP3-20260421 — `https://www.w3.org/TR/2026/WD-CSP3-20260421/`
- **WebDriver v2**: WD 2026-04-30 — `https://www.w3.org/TR/webdriver2/`

### W3C Community Group Reports
- **Design Tokens (DTCG)**: v2025.10 (Draft 2026-04-27) — `https://www.designtokens.org/TR/drafts/format/`
- **Open UI**: W3C Community Group — `https://open-ui.org/`

### WHATWG Living Standards (last-updated 기준)
- **HTML Living Standard**: 2026-04-24 — `https://html.spec.whatwg.org/multipage/`
- **DOM Living Standard**: 2026-03-15 — `https://dom.spec.whatwg.org/`
- **Custom Elements (HTML §4.13)**: 2026-04-24 — `https://html.spec.whatwg.org/multipage/custom-elements.html`

### IETF
- **RFC 6265** (Cookies, 2011-04) — `https://datatracker.ietf.org/doc/html/rfc6265`
- **RFC 6265bis** (Internet-Draft, draft-22, 2025-12-01) — `https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/`
- **RFC 2119** (Requirement Levels) — IETF
- **JSON Schema Draft 2020-12**: draft-bhutton-json-schema-01 — `https://json-schema.org/draft/2020-12/json-schema-core`

### Unicode / ECMA
- **Unicode UTS #35 Part 9 (MessageFormat 2)** — `https://www.unicode.org/reports/tr35/tr35-messageFormat.html`
- **ECMA-262 / ECMA-402** — TC39

### OpenAPI
- **OpenAPI 3.1.0** (2021-02-15) — `https://spec.openapis.org/oas/v3.1.0`

### Industry standards (1차 사료 한정)
- **Custom Elements Manifest v2.1.0** (2024-05-06) — `https://github.com/webcomponents/custom-elements-manifest`
- **Web Vitals** — `https://web.dev/articles/vitals`
- **Storybook CSF** — `https://github.com/ComponentDriven/csf` + `https://storybook.js.org/docs/api/csf/`
- **Web Platform Tests** — `https://web-platform-tests.org/`
- **axe-core EARL Reporter** — `https://www.npmjs.com/package/@axe-core/reporter-earl`

### Framework 공식 docs (vendor-authoritative)
- **React 19 Suspense** — `https://react.dev/reference/react/Suspense`
- **Next.js Testing** (16.2.4, 2026-04-10) — `https://nextjs.org/docs/app/guides/testing`

---

## 7. 추가 research 필요 (본 에이전트 한계 영역)

- React 19 Server Components testing 공식 권고 — Next.js docs 가 "E2E 권고" 만 명시. Vitest / RTL 미지원 사항 추가 검증 필요.
- XState ↔ SCXML 호환성 — stately.ai 공식 docs 부재. Senior agent 검증 위임.
- Pact ↔ OAS 3.1 bi-directional 가능 여부 — docs.pact.io 본 fetch 에서 미커버. Industry agent 검증 위임.
- WPT reftest 의 visible 차원 활용 가능성 — 본 fetch 에서 부재 확인. 추가 fetch 필요.
- Storybook CSF v3 의 vendor 종속도 정량 — community standard 라 명시되나 ChromaticInc 의존 측정 필요. Industry agent 위임.

(시뮬레이션 절대 금지 — CLAUDE.md ★★★ 정책. 본 영역은 다른 에이전트 / 추가 raw fetch 에 위임.)
