# plan — G4 FE skill 보강 (R14 BE/FE 트랙 자산 대칭)

- **작성**: 2026-05-15 / 윤주스 (v1 초안)
- **scope**: charter §3 G4 (R14 BE/FE 산출물 비대칭 / FE skill 보강) 종결.
- **결정 배경**: charter §2 R14 ⚠️ = "BE skill 20+ vs FE skill 6 불균형". chain 2~4 (spec/test/impl) 에 FE 전용 패턴 (React/Vue 컴포넌트 / RTL / Playwright e2e) 부재. JSP/Thymeleaf 같은 Scenario C 분석 skill 부재.
- **전제**: 사내 배포 전 / 윤주스 1인 dogfooding ([[project_pre_deployment_stage]]) / Scenario A (React+TS+TanStack) default
- **의존 산출물**: `methodology-spec/be-fe-separation.md` / `skills/{implement,test}-generate-*` / `skills/analysis-*-fe` / `methodology-spec/migration-cautions-fe.md`

---

## 1. As-Is (현 FE 자산 실태 / 2026-05-15)

### 1.1 analysis stage FE 자산 (5 skill)

| skill | 영역 |
|---|---|
| `analysis-form-validation-fe` | form schema / zod validation 추출 |
| `analysis-type-spec-fe` | TypeScript 타입 spec |
| `analysis-ui-state-map-fe` | 상태 흐름 (XState/Redux/Zustand) |
| `analysis-ui-visual-manifest-fe` | 화면 visual manifest (Playwright 진짜 실행) |
| `analysis-from-figma` (★ v3.3.0 G2 추가) | Figma desktop selection 흡수 |

### 1.2 chain 2~4 의 framework 분기 실태 (★ 본 plan 핵심 발견)

기존 `implement-generate-impl-spec` / `test-generate-test-spec` 가 **이미 framework 분기 본문 패턴 보유**:

| skill | 현 framework 분기 본문 | FE 분기 |
|---|---|---|
| `implement-generate-impl-spec` | nestjs / spring / fastapi (BE 3종) | **❌ React / Vue 부재** |
| `test-generate-test-spec` | jest / vitest / junit5 / pytest | **⚠️ jest/vitest 있으나 RTL (React Testing Library) / userEvent / Playwright e2e 패턴 부재** |

### 1.3 Scenario × 자산 매트릭스 공백

| Scenario | 현 자산 | 공백 |
|---|---|---|
| **A 분리** (React+TS / default) | analysis 5 + 기존 chain skill 의 jest 분기 | **chain 4 impl React 컴포넌트 패턴 / RTL test / Playwright e2e** |
| **B 풀스택** (Next.js / Nuxt 등) | (A 와 공유) | **API route handler 양쪽 인식 skill / `/analyze-fullstack` 미구현 carry (be-fe-separation.md §4.1)** |
| **C JSP/Thymeleaf** (legacy) | (분기 부재) | **JSP/Thymeleaf 분석 skill 전체 부재 / state-map ❌ paradigm 따른 분석 skill** |

---

## 2. ★ paradigm 의제 (★ 사용자 결단 의무 / 메타 사상)

charter §3 G4 후속 표 = "FE-impl-react / FE-impl-vue / FE-test-jest / FE-test-playwright / design-html-template-analyze 신설" (5 skill).

그러나 §1.2 발견 = **기존 skill 본문 분기 패턴 보유**. 즉 5 skill 신설 안에 **중복 risk**. 3 후보 비교:

### 후보 A: 별도 skill 5종 신설 (charter §3 명시 안)

| 신규 skill | 본질 |
|---|---|
| `implement-react` | React 19 컴포넌트/hook/context impl 생성 |
| `implement-vue` | Vue 3 SFC impl 생성 |
| `test-jest` | (★ 중복 risk — 기존 `test-generate-test-spec` 의 jest 분기와) |
| `test-playwright` | Playwright e2e test 생성 |
| `analysis-html-template` | JSP/Thymeleaf/EJS 흡수 (Scenario C) |

**장점**: 단일 책임 명확 / 의미 ID paradigm 정합 / 명시 호출 가능.
**단점**: `test-jest` = 기존 분기와 중복 / skill 5개 추가 → 관리 부담 + drift-validator 추적 부담.

### 후보 B: 기존 skill 본문 분기 + Scenario C / Playwright 만 신설 (절충)

| 작업 | 위치 |
|---|---|
| React/Vue 컴포넌트 분기 추가 | `implement-generate-impl-spec` 본문 §기술스택분기 |
| RTL / userEvent 분기 추가 | `test-generate-test-spec` 본문 §기술스택분기 |
| **`test-playwright` 신설** | e2e 는 unit 과 본질 다름 (실제 브라우저 / 별도 runner) → 별도 skill |
| **`analysis-html-template` 신설** | JSP/Thymeleaf 흡수 = analysis stage 신규 영역 |

**신규 skill 2종 만** + 기존 본문 분기 확장 2건.
**장점**: 중복 회피 / 기존 framework 분기 paradigm 정합 / 작업량 ↓.
**단점**: implement / test skill 의 본문이 커짐 / FE 만 호출 의도 시 명시성 ↓.

### 후보 C: 별도 skill 3종 (impl-react / impl-vue / test-playwright) + 기존 분기 추가 (RTL) + analysis-html-template 신설

| 신설 | 본문 분기 |
|---|---|
| `implement-react` / `implement-vue` / `test-playwright` / `analysis-html-template` (4 신설) | `test-generate-test-spec` 본문에 RTL 패턴 추가 |

**장점**: impl/Vue/playwright/JSP 모두 명시 skill / 단일 책임 정합 / `test-jest` 중복만 회피.
**단점**: 4 skill 추가 / RTL 만 본문 분기 = 일관성 약함.

### 추천 = ★ 후보 C

근거:
1. **단일 책임 paradigm 정합** (G2 LL-G2-03 = paradigm 결단 시 책임 합산 의무) — impl React/Vue 는 본격 generate skill 차원 의무 (BE impl 도 nestjs/spring/fastapi 별도 분기 본문이지만 React = library 컨벤션 + hook 차이 + jsx vs tsx 등으로 본문 비대해질 risk).
2. **test-jest 중복 회피** — 기존 `test-generate-test-spec` 이 이미 jest/vitest 분기 보유. RTL 패턴만 본문 분기 추가가 효율.
3. **test-playwright 별도** — e2e 는 unit 과 본질 다름 (browser runner / 별도 `npx playwright install`). 별도 skill 정합.
4. **analysis-html-template** — Scenario C 본질 신규 영역 / 별도 skill 의무.

---

## 3. skill 명세 (후보 C 채택 가정)

### 3-A. implement-react

| 항목 | 내용 |
|---|---|
| description trigger | "Use when chain 4 impl generation for React 19 components / hooks / contexts. Reads test-spec + behavior-spec + acceptance-criteria, generates React component files. Track = FE. RTL test 100% pass 의무." |
| 입력 | test-spec.json + behavior-spec.json + acceptance-criteria.json + inventory.json (React 19 / TanStack / Tailwind 등 stack signals) |
| 산출 | `src/**/*.{tsx,jsx}` (component) + `src/**/*.hook.ts` + impl-spec.json (FE 트랙 entry) |
| paradigm (★ research 갱신) | (1) **`forwardRef` deprecated** / ref prop 직접 받기 default / ESLint `no-forward-ref` rule 활성 / (2) functional component default + **class component 분기 보존** (class 도 ref 전달 가능 mechanism 다름 / class 폐기 ❌) / (3) React 19 신규 hooks 본격 흡수: `useActionState` (form action + pending 통합) / `useOptimistic` / `useFormStatus` / `use()` API (Promise + Context 조건부 read) |
| schema marker | `impl-spec.json` 안 `react_version: "19"` 명시 의무 (drift-validator 추적용 / LL-G4-03) |
| allowed-tools | Read, Glob, Grep, Bash, Write, Edit |
| GREEN 의무 | RTL test 100% pass (test-impl-pass-validator) |

### 3-B. implement-vue

| 항목 | 내용 |
|---|---|
| description trigger | "Use when chain 4 impl generation for Vue 3 SFC. Reads test-spec + behavior-spec, generates .vue files (composition API). Track = FE." |
| 입력 | 동일 |
| 산출 | `src/**/*.vue` (SFC) + impl-spec.json |
| paradigm | Composition API default / `<script setup>` 우선 / Options API legacy 분기만 |

### 3-C. test-playwright

| 항목 | 내용 |
|---|---|
| description trigger | "Use when chain 3 test generation for e2e scenarios via Playwright. Reads acceptance-criteria.AC-*, generates *.spec.ts files (browser runner) following Page Object Model. Track = FE / 또는 Scenario B (Next.js full-stack e2e)." |
| 입력 | acceptance-criteria.json + behavior-spec.json + inventory (Playwright 설치 여부) |
| 의존 (★ research) | `@playwright/test` 1.4x 이상 + `npx playwright install` (browser binary 별도 download) |
| 산출 | `tests/e2e/pages/**/*.page.ts` (Page Object — locator only / assertion ❌) + `tests/e2e/**/*.spec.ts` (test — assertion only) + test-spec.json (e2e TC-* type 명시) |
| paradigm (★ research 갱신) | **POM 분리 의무** — locator = page object 안 / **assertion = test 안 (Page Object 안 assertion 금지)** + **web-first assertion** (`expect(page).toHaveURL()` / `toHaveText` / `toBeVisible` auto-retry) + parallel 기본 활성 (`test.describe.configure({ mode: 'parallel' })`) + shard CLI (`--shard=1/4`) |
| RED 의무 | impl 부재 시 모든 e2e fail / Playwright runner 사용자 명시 호출 (auto-invoke ❌ / no-simulation 정합) |

### 3-D. analysis-html-template

| 항목 | 내용 |
|---|---|
| description trigger | "Use when project contains JSP / Thymeleaf / EJS / ERB / Razor server-rendered templates. Extracts template hierarchy + form actions + scriptlet warnings + XSS risk markers using external static analyzers (no LLM simulation). Track = Scenario C (JSP) — state-map ❌ / server-side state 본질." |
| 입력 | 분석 대상 레포 (.jsp / .html with templating directives) |
| 의존 (★ research / no-simulation 의무) | **진짜 외부 도구 실 실행 의무** — JSP scriptlet 검출 = SonarQube `Web:JspScriptletCheck` + `rspec-1459` (`<%= %>` 표현식) + `rspec-1932` (java.sql / java.io 직접 import) / 또는 PMD JSP ruleset / 또는 `jsp-lint`. LLM 양심 count ❌ (Senior STRONG-STOP risk / `feedback_no_static_tool_simulation` 정합) |
| 기준점 | JSP 2.0 / Servlet 2.4 (J2EE 1.4 / 2003) — scriptlet de facto deprecated 이후 |
| 산출 | `.aimd/<scope>/planning/html-template-extract.json` (template hierarchy + form actions + XSS marker + scriptlet finding from external tool) |
| paradigm | JSP form action ↔ Spring @RequestMapping cross-link (be-fe-separation.md §5.1) |
| scope-out | state-map (server-side / BE rules 가 담당) / form action 분산 공식 rule 부재 → 자체 grep 기반 자체 rule (출처 미확인 / 사용자 결단 carry) |
| scriptlet threshold | **scriptlet 0 absolute 채택 ✅** (2026-05-15 사용자 결단 / 사내 정책 — JSP 2.0 이후 scriptlet 사용 절대 금지 paradigm 정합) |
| 매핑 phase | **신규 phase `template-analyze` 신설 채택 ✅** (2026-05-15 사용자 결단 / input phase 부담 ↓ / Scenario C 만 활성 / drift-validator 3-way 추적 명확) |

### 3-E. test-generate-test-spec 본문 분기 추가 (RTL)

기존 skill 본문 `## 기술 스택 분기` 섹션에 추가. (★ research 갱신 — userEvent v14 async paradigm + `screen.getByRole` 1순위 명문화):

```ts
### jest + RTL (React 19 컴포넌트)
// 권장 버전: @testing-library/react 16.x / @testing-library/user-event 14.x / @testing-library/jest-dom 6.x
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

describe('UC-USER-001 / BHV-USER-001', () => {
  test('AC-USER-001 — login form submit', async () => {
    const user = userEvent.setup();  // ★ v14 의무 (setup 먼저)
    render(<LoginForm />);
    // ★ getByRole 1순위 / getByLabelText 2순위 (form input)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');  // ★ await 의무
    await user.click(screen.getByRole('button', { name: /login/i }));      // ★ await 의무
    // 비동기 등장 요소 = findBy* (await 의무)
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

### vitest + Vue Test Utils (Vue 3 SFC)
// 권장: @vue/test-utils 2.x (Vue 3 전용) / vitest 1.x
import { mount } from '@vue/test-utils';
import LoginForm from './LoginForm.vue';

test('AC-USER-001 — login form submit', async () => {
  const wrapper = mount(LoginForm);
  await wrapper.find('input[type="email"]').setValue('user@example.com');
  await wrapper.find('button[type="submit"]').trigger('click');
  expect(wrapper.text()).toContain('로그인');
});
```

**paradigm 명문화 (★ research 흡수)**:
- userEvent.setup() 의무 (v14) / 모든 user 액션 = `await user.*` async 의무
- `screen.getByRole` 1순위 / `getByLabelText` 2순위 / `getByTestId` 최후 (다른 query 불가 시)
- 비동기 element = `findBy*` (Promise) / sync 즉시 = `getBy*` (없으면 throw) / null 허용 = `queryBy*`

---

## 4. 부수 갱신

| 자산 | 갱신 |
|---|---|
| `skills/implement-react/SKILL.md` | 신설 |
| `skills/implement-vue/SKILL.md` | 신설 |
| `skills/test-playwright/SKILL.md` | 신설 |
| `skills/analysis-html-template/SKILL.md` | 신설 |
| `skills/test-generate-test-spec/SKILL.md` | RTL + Vue Test Utils 본문 분기 추가 |
| `schemas/html-template-extract.schema.json` | 신설 (Scenario C 분석 산출) |
| `tools/schema-validator/test/html-template-extract.test.js` | 신설 (5 case) |
| `methodology-spec/plugin-charter.md` §2 R14 | ⚠️→✅ + 자산 표 갱신 (FE 5 → 9 / chain 2~4 분기 보강) |
| `methodology-spec/plugin-charter.md` §3 G4 | 종결 (잔여 G5 > G1) |
| `methodology-spec/skills-axis.md` | implement 2 → 4 / test 3 → 4 / analysis 27 → 28 |
| `methodology-spec/be-fe-separation.md` §3.1 / §5.1 | 신규 skill 인용 추가 |
| `flows/test.phase-flow.json` | `test-playwright` skill mapping (e2e tier) |
| `flows/implement.phase-flow.json` | `implement-react` / `implement-vue` skill mapping |
| `flows/analysis.phase-flow.json` | `analysis-html-template` skill mapping (phase 0 또는 신규 phase) |
| `decisions/DEC-2026-05-15-g4-fe-skill-track-종결.md` | 신설 |
| `decisions/STATUS.md` | session 17차 entry |
| `CHANGELOG.md` | v3.4.0 MINOR entry |
| `.claude-plugin/plugin.json` | 3.3.0 → 3.4.0 |

---

## 5. 시행 순서 (4원칙 cycle)

### 5.1 신설 우선순위

| 순위 | 자산 | 근거 |
|------|------|------|
| 1 | **test-generate-test-spec 본문 분기 추가 (RTL + Vue Test Utils)** | 기존 skill 확장 (작은 변화 / 회귀 risk ↓) |
| 2 | **analysis-html-template skill 신설** + schema + test | Scenario C 본질 신규 영역 / 의존 0 |
| 3 | **test-playwright skill 신설** | e2e 본질 / 의존 = Playwright 설치 (사용자 환경) |
| 4 | **implement-react skill 신설** | chain 4 FE impl 진입 / RTL test 정합 |
| 5 | **implement-vue skill 신설** | (5) 와 sibling / Vue 3 SFC paradigm |
| 6 | **부수 갱신** + commit + tag v3.4.0 | 8 자산 통합 갱신 + release |

### 5.2 4원칙 cycle

- [x] **1원칙** 깊은 숙지 + plan 작성 (본 문서 v1)
- [ ] **2원칙** research (선택) — 가벼운 sub-agent 1회:
  - 공식: React 19 ref paradigm / RTL best practice / Playwright Page Object Model / JSP scriptlet anti-pattern
  - Senior: 후보 C 채택 정당성 / `test-jest` 중복 회피 정합성 / paradigm 책임 합산 ([[feedback_sub_axis_evolution_paradigm]])
- [ ] **3원칙** 사용자 승인 (§7 결단 묶음)
- [ ] **4원칙** §5.1 순차 신설 / 각 step RED→GREEN cycle

---

## 6. blocker / 미해명 사항

| # | blocker | 영향 | 해소 경로 |
|---|---|---|---|
| B1 | Playwright runner 의존 — 사용자 환경에 Playwright 설치 의무 | `test-playwright` 실 호출 시 미설치면 state.blocked | SKILL.md 사전조건 명시 + `npx playwright install` 안내 |
| B2 | React 19 ref paradigm 추정 — forwardRef 폐기 사실 신뢰도 | `implement-react` 생성 코드 정확도 | 2원칙 research 공식 확인 |
| B3 | Vue 3 vs Vue 2 분기 — legacy Vue 2 패턴 별도 | `implement-vue` 본문 분기 vs Vue 2 별도 skill | 1차 = Vue 3 만 / Vue 2 legacy 분기 carry |
| B4 | JSP scriptlet 안티패턴 검출 — LLM 양심 의존 risk (Senior STRONG-STOP / no-simulation violation) | `analysis-html-template` 산출 신뢰도 + -5%p 패널티 risk | **진짜 외부 도구 실 실행 의무** (SonarQube `Web:JspScriptletCheck` `rspec-1459` `rspec-1932` / 또는 PMD JSP ruleset / 또는 `jsp-lint`) — SKILL.md 사전조건 명시 + 미설치 시 state.blocked + 사용자 안내 |
| B5 | `test-jest` 후보 폐기 정합성 — charter §3 G4 표와 본 plan 의 차이 | charter 본문 vs 본 plan 의 paradigm 차이 | 본 plan 채택 시 charter §3 G4 표 갱신 의무 |

---

## 7. 사용자 결단 (2026-05-15 본 session)

1. **paradigm 후보** = **C 채택** ✅ (4 skill + RTL/Vue Test Utils 본문 분기 / `test-jest` 중복 회피)
2. **신설 우선순위 §5.1** = OK ✅
3. **2원칙 research** = 진행 ✅ (가벼운 sub-agent 3 트랙 병렬)
4. **version 라벨** = v3.4.0 MINOR bump ✅
5. **Vue 1차 지원** = **Vue 3 만** ✅ (Vue 2 legacy = carry / `<script setup>` 우선 / Options API legacy 분기만 본문에 명시)
6. **Scenario B `/analyze-fullstack` 통합 명령어** = **별도 G6 carry** (본 plan scope 외 / be-fe-separation.md §4.1 D25 carry 유지)

---

## 8. Lessons Learned (사전 등재)

- **LL-G4-01**: charter §3 후속 표는 "후보 안" — 본격 1원칙 plan 단계에서 기존 자산과 중복 평가 의무 (G4 의 `test-jest` 중복 risk = 메타 발견).
- **LL-G4-02**: paradigm 분리 vs 본문 분기 결단 시 **자산 비대화 risk** + **drift-validator 추적 부담** + **명시 호출 명확성** 3축 평가 의무.
- **LL-G4-03 (★ 2원칙 Senior 흡수)**: framework 본문 분기 안 paradigm 충돌 (예: React 18 forwardRef vs React 19 ref prop) 발생 시 **RED test fixture = paradigm 판단 기준**. drift-validator 가 본문 분기 일관성 추적할 수 있도록 schema marker (예: `react_version: "19"`) 명시 의무. version-pinned paradigm marker 부재 시 LLM 양심 결단 위험 ↑.
- **LL-G4-04 (★ 2원칙 research 사실 정정)**: charter 본문 + plan 작성 시 외부 framework 사실 (React 19 forwardRef 폐기 / userEvent v14 async / Playwright POM assertion 분리 등) 추정 ❌ — research 트랙으로 실 fetch 의무. plan 의 "class 분기 폐기" 같은 잘못된 추정 = research 흡수로 정정.
- **LL-G4-05 (★ Senior STRONG-STOP 흡수)**: 정성 검출 (scriptlet count / form action 분산 등) 은 **반드시 진짜 외부 도구 실행** (PMD / SonarQube / 등). LLM 본문 분기에서 "내가 보기에 N 개" 같은 양심 정량 = no-simulation 정책 violation -5%p 패널티.

---

## 9. 참고

- [[project_methodology_scope]] — chain harness paradigm
- [[feedback_sub_axis_evolution_paradigm]] — axis 별 sub-axis 진화 paradigm
- [[feedback_quality_priority]] — 품질 1순위 / 재작업 최소화 2순위
- `methodology-spec/plugin-charter.md` §1 R14 + §3 G4
- `methodology-spec/be-fe-separation.md` (3 Scenario × IR 4계층)
- `methodology-spec/migration-cautions-fe.md` (FE-specific 함정)
- `skills/implement-generate-impl-spec/SKILL.md` (기존 framework 분기 본문)
- `skills/test-generate-test-spec/SKILL.md` (기존 jest/vitest 분기)
- `decisions/DEC-2026-05-15-g2-orchestrate-skill-분리-채택.md` (paradigm 진화 sibling)
