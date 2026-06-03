---
name: test-generate-test-spec
description: v2.0 chain 4 진입 skill. acceptance-criteria.AC-* 마다 실 test 코드 자동 생성 + test-spec.json 산출. RED 의무 (chain 4 종결 시 모든 test fail / impl 부재). framework = inventory.stack_signals 추론 (ADR-CHAIN-004 정합). QA-architect + test-engineer persona 책임.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# generate-test-spec

v2.0 chain 4 (test) 의 **진입 skill**. AC → TC 1:N forward link / 실 test 코드 자동 generate / RED 의무.

## 언제 사용

- chain 2 (spec) 종결 + gate #2 go 결단 후 의무.
- 사용자: "test 코드 만들어줘" / "chain 4 진입".

## 입력

- `<project>/.aimd/output/acceptance-criteria.json` (AC-\* 목록)
- `<project>/.aimd/output/behavior-spec.json` (BHV-\* + property_tests)
- `<project>/.aimd/output/inventory.json` (stack_signals → framework match)
- `<project>/.aimd/config/test-cmd.json` (ADR-CHAIN-004 §1 / 있으면 framework 명시)

## 산출물

- `<project>/.aimd/output/test-spec.json` (schemas/test-spec.schema.json 의무 / json 단독 / ADR-011)
- 실 test 코드:
  - jest/vitest: `<project>/<src>/**/*.test.{ts,js}`
  - junit5: `<project>/src/test/java/**/*Test.java`
  - pytest: `<project>/tests/**/test_*.py`
  - go-test: `<project>/<pkg>/*_test.go`

## RED 의무 (chain 4 종결 조건)

chain 4 종결 시 **모든 test fail 의무** (impl 부재). 한 test 라도 pass 하면 chain 4 → 5 진입 ❌:

- impl 이 이미 있으면 → chain 4 skip + chain 5 (test-impl-pass-validator) 직진.
- test-impl-pass-validator 가 본 단계에서 호출되면 expected_outcome="all-fail" 의무 (의도된 RED 상태 검증).

## 절차

1. **acceptance-criteria 로드** — AC-\* + verifiable=true filter.

2. **framework 추론** — `inventory.stack_signals` + `.aimd/config/test-cmd.json` 우선:
   - nodejs+jest → `jest` adapter
   - nodejs+vitest → `vitest` adapter
   - java+maven/gradle → `junit5` adapter
   - python+pytest → `pytest` adapter
   - 그 외 → `other` (사용자 명시 의무 / `--test-cmd` override)
   - **v11.0.0 — AC.layer 기반 framework 본격 분기** (DEC-2026-05-26-be-fe-산출물-분리 §3):
     - `layer=be` + REST API → `junit5` (Spring) / `jest+supertest` (NestJS) / `pytest+httpx` (FastAPI)
     - `layer=fe` + component → `vitest+RTL` (React 19) / `vitest+vue-test-utils` (Vue 3)
     - `layer=e2e` → `playwright` (POM paradigm / test-playwright skill 위임)
     - `layer=db` + migration → `testcontainers` + DB-specific runner

## v11.0.0 contract test 본격 (DEC-2026-05-26-contract-강제-양-axis §1 layer 3 hard gate)

AC.layer 가 `be` 또는 `fe` 면 contract test framework 본격 dispatch:

### BE contract test (AC.openapi_path + operationId 본격 의무)

| framework                 | 호출 시기                                           | source_evidence                            |
| ------------------------- | --------------------------------------------------- | ------------------------------------------ |
| **schemathesis**          | openapi.yaml → property-based test 자동 생성 + 실행 | `schemathesis run --url=... openapi.yaml`  |
| **dredd**                 | endpoint × payload × response 정합 검증             | `dredd openapi.yaml http://localhost:PORT` |
| **pact**                  | consumer-driven contract (FE+BE cross)              | pact broker integration                    |
| **spring-cloud-contract** | Spring + Groovy contract DSL                        | `mvn spring-cloud:generateTests`           |

TC.framework ∈ {schemathesis, dredd, pact, spring-cloud-contract} 시 `openapi_contract_ref` (path + operationId) 본격 required (test-spec.schema.json allOf if/then 강제).

### FE visual/a11y contract test (AC.state_map_ref + dtcg_token_ref + visual_manifest_ref 본격 의무)

| framework             | 호출 시기                                       | source_evidence                      |
| --------------------- | ----------------------------------------------- | ------------------------------------ |
| **axe-core**          | WCAG 2.2 accessibility auto-check               | `npx axe-core --tags wcag22aa`       |
| **playwright-visual** | screenshot diff (visual regression)             | `playwright test --update-snapshots` |
| **percy**             | hosted visual regression (Tier 2 / 사용자 환경) | `percy exec -- ...`                  |
| **chromatic**         | Storybook + visual regression (Tier 2)          | `chromatic --project-token=...`      |

TC.framework ∈ {playwright-visual, axe-core, percy, chromatic} 시 `visual_regression_ref` (screen + state_map_ref + dtcg_token_set) 본격 required.

no-simulation 본격 정합 — 진짜 도구 실행 의무 (R15 / R19 Tier 1/2 / Tier 3 simulated 영구 거부).

3. **각 AC 마다 1 TC 분해** — TC-{AC}-001:
   - test type 분포: unit (60%) / integration (25%) / contract (10%) / e2e (5%) (test pyramid 관행 권고).
   - source_file path 결정 (framework convention).
   - expected_outcome = "fail" (RED 의무 / impl 부재 가정).

   > **S2 augmentation 재동기화** (P4 양방향 역동기화 / DEC-2026-05-30-s2-augmentation-green-roundtrip): `test_intent=augmentation` TC 는 생성 시 `expected_outcome="fail"`(RED / 증강분 미구현). impl 완료 후엔 spec 의 `expected_outcome` 을 **fail→pass 로 재동기화**(증강분이 시스템 동작 = characterization-grade 승격). 재동기화 누락 시 S2 per_tc_outcome gate 가 actual(pass) ↔ expected(fail) 불일치를 `s2_outcome_mismatch` WARN 으로 신호(impl 이 spec 보다 앞섬 = drift) — 이 신호가 운영자에게 역동기화를 요구한다. RealWorld dogfood RED→GREEN round-trip 실측 (DELETE /user).

4. **실 test 코드 generate** — Gherkin → framework idiom. **test name 에 TC-id 포함 의무** (아래):
   - jest: `describe('UC-USER-001 / BHV-USER-001', () => { test('TC-USER-001 — happy path login', () => { ... }) })`
   - junit5: `@Test @DisplayName("TC-USER-001 — happy path login") void register_success() { ... }`
   - pytest: `def test_TC_USER_001_login_happy_path(): ...`

   > **TC-id-in-name 규약** (DEC-2026-05-30-s2-exec-corroboration / S2 RealWorld 2차 dogfood 실측): test 의 **display name 또는 메서드명에 TC-id 를 포함**하라. S2(AX전환) per_tc_outcome gate 는 실 runner 결과(JUnit/pytest XML 의 `name`)를 TC-id 로 상관(`test-impl-pass-validator correlateByTcId`)해 characterization(GREEN) ↔ augmentation(RED) 을 per-TC 대조한다. TC-id 가 주석에만 있으면 XML `name` 에 안 실려 상관 실패(missing_actual). JUnit5+Gradle 은 XML `name`=@DisplayName 이므로 **@DisplayName 에 TC-id 가 가장 안전** (메서드명은 하이픈 불가 — correlateByTcId 가 하이픈/언더스코어 정규화로 양쪽 허용). 풀-컨텍스트 통합 test(@SpringBootTest 등)는 격리 DB profile(@ActiveProfiles 등) 명시.

5. **property_tests 코드 generate** — behavior-spec.behaviors[].property_tests[].arbitrary_stub → fast-check / Hypothesis / jqwik 코드 채움.

6. **test-spec.json 채움** — TC-\* 목록 + 각 TC 의 ac_ref / bhv_ref / type / framework / source_file / expected_outcome.

7. **test_invocation_evidence 부재 명시** — chain 4 단계 = test 만 generate / runner 호출 ❌ (RED 의무 / chain 5 에서 호출). test-spec.json 의 `test_invocation_evidence` 는 빈 객체 또는 부재.

8. **자동 검증** (schema-validator + spec-test-link-validator):

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/schema-validator/src/cli.js .aimd/output/test-spec.json

   node ${CLAUDE_PLUGIN_ROOT}/tools/spec-test-link-validator/src/cli.js \
     --behavior   .aimd/output/behavior-spec.json \
     --acceptance .aimd/output/acceptance-criteria.json \
     --test-spec  .aimd/output/test-spec.json \
     --inventory  .aimd/output/inventory.json
   ```

9. **test-impl-pass-validator dry-run 호출** — 진짜 실행 ❌ / config 검증만:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/test-impl-pass-validator/src/cli.js \
     --project <project> \
     --inventory <project>/.aimd/output/inventory.json \
     --dry-run --json
   ```

10. **gate #4 호출** — `_base-invoke-go-stop-gate` (cluster 5~6 / RED 상태 명시).

## no-simulation — runner 호출 의무 ❌ (chain 4 단계)

본 skill 단계 = test 코드 generate **만**. 진짜 runner 호출은 chain 5 (test-impl-pass-validator). chain 4 에서 진짜 runner 실행 시:

- impl 부재 → 모든 test fail 의무 (RED 확정).
- impl 일부 존재 → chain 5 직진 권고 (chain 4 skip).

## AC 의 test_case_refs backward 채움

본 skill step 6 종결 시 acceptance-criteria.json 을 in-place edit — 각 AC 의 test_case_refs 배열에 본 chain 4 산출 TC-\* ID 추가. chain 2 → 4 forward+backward link 완성.

## v8.8.0+ test_carry_from 처리 (G-006 보강)

### 배경

mis-fe-admin DWPD-1774 5 stage 실증 테스트 §G-006 — chain 4 진입 시 v1 cycle 1~13 의 test 12 파일이 살아있어 test stage 가 **"fresh-write" 가 아닌 "carry-from-iter-N"** 케이스. plugin v8.7.4 의 test-spec.json 산출물 표기 명세에 carry 케이스 부재 → 사용자 ad-hoc 표기 + chain 5 진입 시 GREEN 검증 게이트가 carry test 의 정합성 확인 path 부재.

### test-spec.json 신설 필드

| 필드                                   | 타입           | 의미                                                                                                                         |
| -------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `meta.generation_mode`                 | enum           | `fresh-write` (default / 전체 신규 generate) \| `carry-from-iter` (이전 iter test 인계) \| `hybrid` (일부 carry + 일부 신규) |
| `tests[].carry_from`                   | object \| null | TC 단위 carry 정보. null = 본 chain 4 신규 generate.                                                                         |
| `tests[].carry_from.iter_path`         | string         | 이전 iter 의 path (예: `.aimd/output/iter-3/test-spec.json`)                                                                 |
| `tests[].carry_from.tc_id_prior`       | string         | 이전 iter 의 TC ID (rename 가능)                                                                                             |
| `tests[].carry_from.source_file_prior` | string         | 이전 iter 의 test 파일 경로                                                                                                  |
| `tests[].carry_from.rationale`         | string         | carry 사유 (예: "AC-USER-001 의미 불변 + framework 동일 vitest 14.x")                                                        |
| `tests[].carry_from.equivalence_check` | enum           | `manual-confirmed` (사용자 검토) \| `automated-diff-passed` (validator 자동) \| `pending` (gate stop)                        |
| `meta.carry_count`                     | integer        | carry 모드 TC 수 (audit signal)                                                                                              |
| `meta.fresh_count`                     | integer        | 신규 TC 수                                                                                                                   |

### generation_mode 분기

- **`fresh-write`** (default) — chain 4 진입 시 모든 TC 가 acceptance-criteria 기반 신규 generate. `tests[].carry_from: null` 의무.
- **`carry-from-iter`** — chain 4 진입 전 이전 iter test 가 살아있고, acceptance-criteria 가 그 iter 와 동일 (또는 superset) 정합. 모든 TC `carry_from` 필드 채움. AC ↔ carried TC 의미 정합 검증 의무 (아래 합격 게이트).
- **`hybrid`** — 일부 TC 만 carry / 나머지 신규. mixed mode.

### 합격 게이트 — carry TC 정합 검증 (v8.8.0+ 신규)

각 carry TC 마다 acceptance-criteria 와의 의미 정합 검증 의무:

1. **AC ID match** — `tests[].ac_ref` ∈ 현재 chain 의 acceptance-criteria.AC-\* 의무.
2. **Gherkin assertion match** — carried test 의 assertion 이 AC.gherkin.then 과 의미 정합 (`equivalence_check` enum 명시 의무).
3. **framework match** — `tests[].framework` = `inventory.stack_signals` 의 framework 일치 (drift 시 carry path reject).
4. **commit_hash 인용** — `carry_from.iter_path` 가 git 추적 path 면 commit hash + branch 인용 권고 (evidence).

### spec-test-link-validator 신규 finding (v8.8.0+)

- `test.carry-from-missing-equivalence-check` (high) — `carry_from` 필드 있는데 `equivalence_check: pending` 시 gate #4 stop.
- `test.carry-from-iter-path-not-found` (critical) — `carry_from.iter_path` 가 디스크 부재 시 reject.
- `test.carry-from-ac-ref-orphan` (critical) — carried TC 의 `ac_ref` 가 현재 acceptance-criteria 에 없음 → 의미 drift 표면화.
- `test.generation-mode-meta-missing` (medium) — `meta.generation_mode` 부재 시 default=`fresh-write` 가정 + warning emit.

### Auto Mode 흐름 (정합)

Auto Mode 활성 시 — 이전 iter test 가 살아있으면 `generation_mode: carry-from-iter` 1차 default 적용 + `equivalence_check: pending` set + gate #4 cluster 에서 사용자 일괄 confirm 의무 (G-005 의 `decisions[].source: AI-default` 와 동일 paradigm).

## 70~80% 한계 명시

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

자동 generate ≥ 70% / 사용자 검토 ≤ 30% (test = framework convention 차이 ↑ / sandbox 부재 검증 ❌). property test arbitrary 는 사용자 검토 의무. v8.8.0+ — carry mode 시 `equivalence_check: manual-confirmed` 가 사용자 검토 비중 ↑.

## 인용

- ADR-CHAIN-001 §3 (no-simulation 강화 / RED 의무)
- ADR-CHAIN-004 §1 (framework match / inventory 추론)
- test-spec.schema.json (deliverable 20)
- master plan §B chain 4
- DEC-2026-05-06-round-trip-부분-허용 (revisit:spec 가능)

## 기술 스택 분기

각 framework 별 generate 본문 (skills-axis 정합 — 디렉토리 분리 ❌ / 본문 분기):

### jest (nodejs)

```ts
import { describe, test, expect } from '@jest/globals';
describe('UC-USER-001 / BHV-USER-001', () => {
	test('AC-USER-001 — login happy path', async () => {
		// arrange / act / assert (Gherkin Given/When/Then)
	});
});
```

### vitest

```ts
import { describe, test, expect } from 'vitest';
// 위 jest 와 동일 (호환 API)
```

### jest + RTL (React 19 컴포넌트 / v3.4.0 G4 / FE 트랙)

권장 버전: `@testing-library/react` 16.x / `@testing-library/user-event` 14.x / `@testing-library/jest-dom` 6.x

```ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

describe('UC-USER-001 / BHV-USER-001', () => {
  test('AC-USER-001 — login form submit', async () => {
    const user = userEvent.setup();  // v14 의무 (setup 먼저)
    render(<LoginForm />);
    // getByRole 1순위 / getByLabelText 2순위 (form input)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');  // await 의무
    await user.click(screen.getByRole('button', { name: /login/i }));       // await 의무
    // 비동기 등장 요소 = findBy* (await 의무)
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
```

**paradigm 명문화**:

- `userEvent.setup()` 의무 (v14) / 모든 user 액션 = `await user.*` async 의무
- `screen.getByRole` 1순위 / `getByLabelText` 2순위 / `getByTestId` 최후 (다른 query 불가 시)
- 비동기 element = `findBy*` (Promise) / sync 즉시 = `getBy*` (없으면 throw) / null 허용 = `queryBy*`

### vitest + Vue Test Utils (Vue 3 SFC / v3.4.0 G4 / FE 트랙)

권장: `@vue/test-utils` 2.x (Vue 3 전용) / vitest 1.x / Composition API + `<script setup>` 우선 (Vue 2 legacy 분기는 carry)

```ts
import { mount } from '@vue/test-utils';
import { describe, test, expect } from 'vitest';
import LoginForm from './LoginForm.vue';

describe('UC-USER-001 / BHV-USER-001', () => {
	test('AC-USER-001 — login form submit', async () => {
		const wrapper = mount(LoginForm);
		await wrapper.find('input[type="email"]').setValue('user@example.com');
		await wrapper.find('button[type="submit"]').trigger('click');
		expect(wrapper.text()).toContain('로그인');
	});
});
```

### Playwright e2e (FE 트랙 / Scenario B 풀스택 / v3.4.0 G4)

e2e 본질 다름 (browser runner / 별도 install / POM 분리) → **별도 skill `test-playwright` 위임**. 본 skill 안 본문 분기 ❌. e2e TC-\* 생성 시 `test-playwright` skill 명시 호출 의무.

### junit5

```java
@DisplayName("UC-USER-001 / BHV-USER-001")
class UserLoginTest {
  @Test @DisplayName("AC-USER-001 — login happy path")
  void testLoginHappyPath() { /* ... */ }
}
```

### pytest

```python
class TestUcUser001:
    """UC-USER-001 / BHV-USER-001"""
    def test_ac_user_001_login_happy_path(self):
        """AC-USER-001 — login happy path"""
        # ...
```
