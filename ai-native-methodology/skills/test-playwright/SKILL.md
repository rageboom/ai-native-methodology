---
name: test-playwright
description: Use when chain 4 test generation for e2e scenarios via Playwright. Reads acceptance-criteria.AC-*, generates Page Object (locator only) + spec.ts (assertion only / web-first) test files following POM paradigm. Track = FE / Scenario B 풀스택 e2e. Stage = test (chain 4). RED 의무 (impl 부재 시 모든 e2e fail / runner 사용자 명시 호출 / auto-invoke ❌).
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# test-playwright — e2e test 생성 (Playwright POM paradigm)

`test-generate-test-spec` 의 e2e 분기 위임. browser runner + 별도 install + POM 본질 = 별도 skill.

> **단일 책임**: e2e test 생성 (POM 분리 / web-first assertion / parallel). unit/integration test 는 `test-generate-test-spec` 본문 분기 (jest/vitest+RTL/Vue Test Utils).

## 사전 조건 (★ 의무)

- **`@playwright/test` 1.4x 이상 설치** + **`npx playwright install` browser binary download** (chromium/firefox/webkit)
- 미설치 시 **state.blocked + 사용자 안내** (skill 강행 ❌ / auto-install 도 ❌ — 사용자 결단 의무)
- chain 2 (spec) 종결 + gate #2 go 결단 후
- inventory.json 안 FE 트랙 또는 Scenario B 풀스택 signal

## 절차

1. **Playwright 설치 확인** — `npx playwright --version` / 미설치 시 state.blocked + 사용자 안내.
2. **acceptance-criteria 로드** — AC-* 중 e2e 적합 type filter (browser interaction 포함 / 또는 사용자 명시 `e2e: true` flag).
3. **POM 디렉토리 구조** — 표준:
   ```
   tests/e2e/
   ├── pages/                  # Page Object (locator only / assertion ❌)
   │   ├── login.page.ts
   │   └── user-list.page.ts
   ├── fixtures/               # 공유 fixture / test data
   ├── *.spec.ts               # test (assertion only / page object import)
   └── playwright.config.ts
   ```
4. **Page Object 생성** — locator 만 (action method + 명시적 locator wrapper):
   ```ts
   // tests/e2e/pages/login.page.ts
   import { type Page, type Locator } from '@playwright/test';
   export class LoginPage {
     readonly emailInput: Locator;
     readonly passwordInput: Locator;
     readonly submitButton: Locator;
     constructor(private readonly page: Page) {
       this.emailInput = page.getByLabel(/email/i);
       this.passwordInput = page.getByLabel(/password/i);
       this.submitButton = page.getByRole('button', { name: /login/i });
     }
     async goto() { await this.page.goto('/login'); }
     async submit(email: string, password: string) {
       await this.emailInput.fill(email);
       await this.passwordInput.fill(password);
       await this.submitButton.click();
     }
   }
   ```
5. **spec.ts 생성** — assertion only / Page Object 호출 / web-first assertion:
   ```ts
   // tests/e2e/login.spec.ts
   import { test, expect } from '@playwright/test';
   import { LoginPage } from './pages/login.page';

   test.describe.configure({ mode: 'parallel' });  // ★ parallel 본격
   test.describe('UC-USER-001 / BHV-USER-001', () => {
     test('AC-USER-001 — login happy path', async ({ page }) => {
       const loginPage = new LoginPage(page);
       await loginPage.goto();
       await loginPage.submit('user@example.com', 'password');
       // ★ web-first assertion (auto-retry)
       await expect(page).toHaveURL(/\/dashboard/);
       await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
     });
   });
   ```
6. **playwright.config.ts** — parallel + shard 권장:
   ```ts
   export default defineConfig({
     testDir: './tests/e2e',
     fullyParallel: true,
     // shard CLI: --shard=1/4 (CI 분산)
     use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
     projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
   });
   ```
7. **test-spec.json 갱신** — e2e TC-* type 명시 (`type: "e2e"` + `framework: "playwright"` + `source_file: "tests/e2e/*.spec.ts"`).
8. **RED 의무** — impl 부재 시 모든 e2e fail / runner 호출 = chain 5 (test-impl-pass-validator) 시점 / 본 chain 4 = generate 만.

## paradigm 명문화 (★ research 갱신)

- **POM 분리 의무** — locator = page object 안 / **assertion = test 안 (Page Object 안 assertion 금지)**
- **web-first assertion 우선** — `expect(page).toHaveURL()` / `toHaveText` / `toBeVisible` (auto-retry until timeout). 단순 `expect(x).toBe(y)` 보다 우선.
- **parallel 기본 활성** — file 단위 ON / `test.describe.configure({ mode: 'parallel' })` 로 test 단위
- **shard CLI 지원** — `--shard=1/4` (CI 분산)

## 산출물

- `tests/e2e/pages/**/*.page.ts` (Page Object)
- `tests/e2e/**/*.spec.ts` (test)
- `tests/e2e/playwright.config.ts` (config)
- `test-spec.json` 갱신 (e2e TC-* + framework=playwright)

## 본체 명세 참조

- `methodology-spec/plugin-charter.md` §1 R14 + §3 G4
- `methodology-spec/be-fe-separation.md` §3 Scenario A + §4 Scenario B (e2e 가능 영역)
- `skills/test-generate-test-spec/SKILL.md` (본 skill 의 e2e 위임 명시)
- Playwright 공식: https://playwright.dev/docs/pom + https://playwright.dev/docs/best-practices

## When NOT to invoke

- unit / integration test → `test-generate-test-spec` 본문 분기 (jest/vitest+RTL/Vue Test Utils)
- Playwright 미설치 → state.blocked (auto-install ❌)
- Scenario C (JSP) — server-side rendering 의 e2e 는 가능하지만 본 skill 1차 scope 외 (carry / 사용자 명시 호출 시 가능)
- LLM auto-invoke runner ❌ — `npx playwright test` 는 사용자 명시 호출 의무 (no-simulation 정합)
