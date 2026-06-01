# plan-s2-gate-block-upgrade — S2(AX전환) gate WARN→block 격상 (ecommerce 2nd distinct domain corroboration)

> session 66차. 4원칙 Phase 1 산출물. 직전 v11.32.0(FE 앵커) 완결 → 진짜 분기점 → 사용자 "자율 가능" 첫 항목 = S2 gate WARN→block (도구 실제 실행).

## 0. 한 줄 요약

S2(주 타깃 / AX전환) gate 의 `s2_outcome_mismatch` 를 **WARN(go-with-warnings 허용) → block(hard-block / 'go' 거부)** 으로 격상. 자격 게이트 = **§8.1 ≥2 distinct domain S2 execution corroboration**. 현 1/2(RealWorld) → **ecommerce(NestJS/Prisma/jest / e-commerce 도메인)** 로 2nd distinct domain 실측 corroboration 확보 후 격상.

## 1. 배경 / 현 상태 (Phase 1 깊은 숙지)

### 1.1 S2 gate 메커니즘 (실측 확인)
- `tools/chain-driver/src/gate-eval.js`:
  - `SCENARIO_EXPECTED.S2 = { test: 'per_tc_outcome', implement: 'all_pass' }` (L45).
  - test stage: `expected.test === 'per_tc_outcome' && findings.outcome_mismatches > 0` → reason `s2_outcome_mismatch` (L118-123).
  - `severityRank.s2_outcome_mismatch = 2` (L162 / coverage_threshold·layer2_threshold 수준 = WARN).
  - `applyUserDecision`: blocked 시 'go' 가 `hasCriticalOrHigh`(= `validator_critical` || `validator_high`)일 때만 거부. s2_outcome_mismatch(rank 2)는 거부 집합 밖 → **'go' → go-with-warnings 허용** (L192-201).
- `tools/test-impl-pass-validator/src/s2-outcome-check.js`:
  - `reconcileOutcomes(testCases, actualByTcId)` → `{outcome_mismatches, evaluated, missing_actual, details}` (순수 함수).
  - `correlateByTcId(testResults, testCases)` → test-name(@DisplayName/method)에서 TC-id substring 상관 (`normalizeForMatch` 대문자+비영숫자제거).

### 1.2 격상 자격 게이트 (SSOT)
- `methodology-spec/use-scenario-taxonomy.md` §5 `C-use-scenario-s2-gate`: "**잔여(carry ①) = WARN→block 격상 (2nd distinct domain 후)**" / 자격 = "§8.1 ≥2 **distinct domain** (현 1/2 / RealWorld execution-grade)".
- `DEC-2026-05-30-s2-exec-corroboration.md` carry 1: "WARN→block 격상 = 2nd distinct domain S2 execution corroboration 후 (gate-eval `s2_outcome_mismatch` severityRank 2→격상)".

### 1.3 1차 corroboration (RealWorld / 기보유)
- v11.11.0(Track α / 구조적) + v11.13.0(execution / 실 JUnit XML / 25 char GREEN + 1 aug RED + 음성대조) + v11.14.0(augmentation GREEN round-trip / carry ② RESOLVED).
- = RealWorld 단일 도메인(Spring Boot 2.6 / Java / JUnit5 / blog·social 도메인). execution-grade.

### 1.4 ecommerce 가능성 (실측 확인 — make-or-break PASS)
- clone 존재: `_dogfood-ecommerce/ecommerce-backend` (NestJS 8 / Prisma 3.14 / jest 28.1.1).
- **node_modules 존재 + jest 재실행 성공 (no-simulation / 본 세션 직접 실행)**: `npx jest` → **56 passed / 5 suites / 0 fail** (session 64 로그 신뢰 아닌 자가 검증).
- test-spec(`.aimd/output/test-spec.json`) **이미 S2 형태**: `test_intent: characterization` ×30 + `expected_outcome: pass` ×30, warnings 에 "brownfield S2(AX전환)" 명시.
- **단 "augmentation arm 없음(현 scope)" 명시** = 빠진 조각.
- 5 unit spec (auth/category/product/purchase/user .service.spec.ts).

### 1.5 distinct domain 강도 (§8.1)
| axis | RealWorld | ecommerce |
|---|---|---|
| 문제 도메인 | blog/social | **e-commerce** (distinct) |
| 언어/스택 | Java / Spring Boot | **TypeScript / NestJS** (distinct) |
| ORM | MyBatis 3 | **Prisma** (distinct) |
| test runner | JUnit5 + Gradle | **jest + ts-jest** (distinct) |
→ 문제 도메인 + 스택 모두 distinct = carry 가 요구한 "타 distinct OSS"보다 강함(carry 예시는 same-stack Spring 이었음).

## 2. 빠진 조각 → 본 세션 작업

1. **augmentation arm (RED 실측)** — ecommerce 에 부재한 기능 1종 = `PurchaseService.refund()` (refund/환불 미구현 — `purchase.service.ts` 메서드 = create/findAll/findOne/review/update/remove/calculateTotalPrice / refund 부재). RealWorld `DELETE /user`(AccountDeletionAugTest) 동형. 신규 jest spec 작성 → 실행 RED(method 부재 / 의도된 신규 동작 미구현) → `expected_outcome=fail` ↔ `actual=fail` → match=true.
2. **gate 파이프라인 실측 실행** — 실 methodology 모듈 import 한 harness(`.aimd/s2-exec-harness.mjs` 동형): `correlateByTcId`(char 56 + aug RED) → `reconcileOutcomes` → `outcome_mismatches=0` → `evaluateGate('test', findings, 'S2')` → **blocked=false / go-eligible**.
3. **음성대조** — characterization 1건 회귀 가정(→fail) → outcome_mismatches=1 → gate primary `s2_outcome_mismatch` 탐지.
4. **evidence 파일** — `_dogfood-ecommerce/.../.aimd/s2-gate-2nd-domain-probe.md` (실 jest 출력 + gate 파이프라인 결과 + 음성대조).

## 3. WARN→block 격상 (본체 코드 / 자격 충족 후)

| 영역 | 변경 |
|---|---|
| `gate-eval.js applyUserDecision` | `hasCriticalOrHigh` 거부 집합에 `s2_outcome_mismatch` 추가 (또는 별도 hard-block 집합) → S2 mismatch 시 'go' 거부 (hard-block). |
| `gate-eval.js severityRank` | `s2_outcome_mismatch: 2 → 1` (validator_high 수준 / primary_reason 정렬 정합). |
| `gate-eval.js` 주석 | "corroboration 0 동안 WARN ... ≥2 후 격상" → "≥2 distinct domain corroboration 충족(RealWorld+ecommerce) → block 격상" 갱신. |
| `tools/chain-driver/test/scenario.test.js` | L136-141 "s2_outcome_mismatch = WARN → go-with-warnings" 테스트를 **hard-block(go 거부)** 으로 반전 + 신규 케이스(go → block / user_override_rejected). |
| DEC 신규 | `DEC-2026-06-01-s2-gate-block-upgrade.md` (자격 충족 근거 + ecommerce evidence + breaking 판정). |
| `use-scenario-taxonomy.md` §5 | `C-use-scenario-s2-gate` carry ① **RESOLVED** (WARN→block 격상 / ≥2 distinct domain 충족). |
| `DEC-2026-05-30-s2-exec-corroboration.md` | carry 1 RESOLVED 표기(역링크). |
| CHANGELOG / INDEX / STATUS | 갱신. |

## 4. 핵심 미해결 결정 (Phase 2 research + Phase 3 사용자)

1. **MINOR vs MAJOR?** — WARN→block 은 S2 gate override 계약 변경(이전 'go' 가능 → 거부). 단 WARN 은 명시적 임시 상태("corroboration 0 동안 WARN")였고 격상은 계획된 maturation. → MINOR(correctness maturation / 의도된 승격)인가 MAJOR(gate 계약 변경)인가? **Senior 판단 + 사용자 결단**.
2. **격상 메커니즘** — `hasCriticalOrHigh` 집합에 추가가 맞나, 별도 `hardBlockCodes` 집합 신설이 깔끔한가? (layer2_threshold/findings_unverified 는 WARN 유지 의도 → s2 만 분리 격상).
3. **2/2 충분성** — §8.1 ≥2 distinct domain 이 hard-block 격상에 충분한가, 아니면 ≥3? (intent_certainty/cooling-off 폐기 paradigm 정합 — speculative hardening 회피 vs 충족 후 즉시 격상).
4. **round-trip GREEN 필요?** — 2nd domain 에 augmentation impl→GREEN round-trip(session 57 RealWorld 동형)까지 할지, 아니면 execution corroboration(char GREEN + aug RED + gate)만으로 충분한지. carry ②(round-trip)는 이미 RESOLVED(RealWorld) → 2nd domain 은 carry ①(execution corroboration) 범위로 한정 검토.

## 5. §8.1 정직성 / self-referential drift 점검

- **self-referential 아님 근거**: corroboration = 실 외부 repo(ecommerce) 실 jest 실행 측정. 격상은 §8.1 임계 충족의 합법적 귀결. prod 가치 = **주 타깃 S2 gate 가 advisory→enforcing** = 외부 adopter 가 S2 chain 에서 characterization 회귀/augmentation 오상태에 hard-block.
- **위험**: corroboration 이 실측 아닌 추론/시뮬레이션이면 = §8.1 위반 + commit-block cheat. → augmentation RED 와 char GREEN 모두 **실 jest 실행 의무** (no-simulation).
- **메타 관찰**: session 60~65 = 6연속 dep-graph 계열. 본 작업은 chain harness S2 축(다른 축) = 루프 탈출. 단 "우리 gate 우리가 강화"라는 self-referential 외형 → corroboration 의 외부성(ecommerce 실행)이 정당화 핵심.

## 6. STOP-3 (Phase 4 종결 자격)
workspace test 전부 pass(scenario.test.js 반전 포함) + release-readiness all green + skill-citation 0 stale + version 3-way 일치 + breaking 판정(MINOR/MAJOR 확정) = release.

## 7. Lessons (작성 중 / Phase 4 후 보강)
- (Phase 1) ecommerce test-spec 이 이미 S2 형태였음 — session 64 가 brownfield S2 framing 으로 산출 → 2nd domain corroboration 의 characterization arm 이 이미 실측 완료 상태. 빠진 건 augmentation arm 뿐.
