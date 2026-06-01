# DEC-2026-05-30-s2-exec-corroboration

> ★ v11.13.0 MINOR release SSOT. S2(AX전환) gate 2차 **execution corroboration** — RealWorld dogfood 실 구동(no-simulation)으로 characterization GREEN + augmentation RED 실측 + 상관 규약 보강.
> 상태: **승인 + 시행 완료** (2026-05-30 / session 56차). 사용자 결단 chain — v11.12.0 release 후 "어떻게 진행" → carry queue 정직 평가(① S2 gate 2차 = 환경 차단이나 JDK 설치 시 가능) → AskUserQuestion "① S2 gate 2차 (Java 설치 후)" → "진행해줘" → JDK 11 확보 + RealWorld 실 구동 + 상관 보강 + release.

## 배경 — 1차의 한계 (RISK-ENV-001)

`C-use-scenario-s2-gate` Track α(v11.11.0 / DEC-2026-05-30-s2-gate-slice)는 S2 per_tc_outcome gate 를 구현하고 1차 corroboration 을 RealWorld 로 확보했으나, **execution 은 "impl 존재의 구조적 귀결"로 추론**했을 뿐 실측이 아니었다 (Java/Gradle 부재 = RISK-ENV-001 / s2-gate-probe.md §3). no-simulation 정책상 GREEN 날조 ❌ → 2차 = runnable S2 환경 의무 carry.

## 결단 — RealWorld 실 구동 execution corroboration (no-simulation)

### 환경 확보 (admin-free)
- Temurin **JDK 11.0.31** zip(Adoptium API / 관리자 권한 불요) → `~/jdk11-temurin` 압축 해제 + JAVA_HOME.
- RealWorld = Spring Boot 2.6.3 / Gradle 7.4 / sqlite::memory:(test profile) / 자체 23 test ship = 유지보수된 구동 가능 예제. `gradlew compileTestJava` BUILD SUCCESSFUL(1m49s)로 환경 입증. **RISK-ENV-001(RealWorld arm) 해소.**

### 생성 test 통합 (결정적 변환 / `.aimd/transform-gen-tests.mjs`)
생성 characterization test 6파일(`.aimd/output/generated-tests`)을 RealWorld test sourceSet 으로:
1. package `io.spring.api` → `io.spring.api_gen` (repo 자체 test 클래스명 충돌 회피 / 생성 test 는 `io.spring.*` 내부 import 0 = 안전).
2. `@ActiveProfiles("test")` 주입 (application-test.properties = `sqlite::memory:` / dev.db 오염 차단).
3. @DisplayName 에 TC-id prefix 주입 (★ 상관 핵심 / 아래).
+ augmentation arm `AccountDeletionAugTest` (TC-USER-007 / `DELETE /user` = RealWorld 미구현 / expected_outcome=fail).

### 실측 결과 (`gradlew test --tests io.spring.api_gen.*`)
- **26 testcases = 25 PASS(characterization) + 1 FAIL(augmentation)**. JUnit XML 물증(`build/test-results/test/`).
- gate 파이프라인(`.aimd/s2-exec-harness.mjs` / 실 methodology 모듈 import): `correlateByTcId`(26/26 상관 / missing_actual=0) → `reconcileOutcomes`(evaluated=26 / **outcome_mismatches=0**) → `evaluateGate('test',·,'S2')` = **blocked=false / go-eligible**.
- augmentation TC-USER-007: expected=fail ↔ actual=fail / match=true (impl 후 GREEN 격상 대상).
- **음성 대조**: characterization TC-USER-001 회귀 가정(→fail) → outcome_mismatches=1 → gate primary=`s2_outcome_mismatch` → user 'go' → `go-with-warnings`(rank 2 WARN). = S2 gate 가 characterization 회귀를 실 데이터에서 탐지.

→ **S2 per_tc_outcome gate 가 실 execution 데이터(characterization GREEN + augmentation RED 혼합)에서 정상.** 1차 구조적 추론 → 2차 실측 입증.

## 상관 규약 보강 (methodology 변경 / dogfood 발견)

★ **발견**: JUnit5+Gradle XML `<testcase name>` = **@DisplayName** (메서드명 아님). TC-id 가 주석/메서드명에만 있으면 XML `name` 에 안 실려 상관 실패(missing_actual). 게다가 Java 메서드명은 하이픈 불가 → `TC-USER-001` substring 원천 불가. = `correlateByTcId` 원 주석이 예고한 "규약 적합성 실측 → 부적합 시 규약 보강".

해소 (2 layer):
1. **`tools/test-impl-pass-validator/src/s2-outcome-check.js`** — `correlateByTcId` 정규화(`normalizeForMatch` = 대문자화+비영숫자 제거) 후 substring. 하이픈 displayName(`TC-CAR-001 ...`) ↔ 언더스코어 메서드명(`tc_CAR_001_...`) 양쪽 상관 (+2 test / 40→42). 기존 substring 동작 backward-compat.
2. **`skills/test-generate-test-spec/SKILL.md`** — step 4 "TC-id-in-name 규약" 추가: test display name/메서드명에 TC-id 포함 의무(JUnit5+Gradle 은 @DisplayName 권장) + 풀-컨텍스트 통합 test 는 격리 DB profile(@ActiveProfiles) 명시.

## §8.1 corroboration 평가 (정직)

| axis | 상태 |
|---|---|
| 문제(F-007 brownfield false-block) | ✅ ≥2 corroborated (RealWorld + MyBatis·JPA arm) |
| 해법 구조적 corroboration | ✅ RealWorld (1차 / v11.11.0) |
| 해법 **execution** corroboration | ✅ **RealWorld 실측 (2차 / 본 release)** — RISK-ENV-001 해소 |
| §8.1 ≥2 **distinct domain** | ⛔ **1/2 carry** — RealWorld 단일 도메인(structural+execution 양 grade) |

→ RealWorld arm = execution-grade 도달이나 §8.1 ≥2 **distinct domain** 미충족 → gate enforcement = **WARN 유지** (`s2_outcome_mismatch` rank 2 / go-with-warnings / hard-block ❌). **WARN→block 격상 = 2nd distinct domain(poc-17 사내 Java / 타 OSS Spring) 후 별 release** — speculative hardening 회피 (cooling-off 영구 폐기 + §8.1 strict + self-referential drift 회피 paradigm 정합).

## carry
1. ✅ **C-use-scenario-s2-gate 격상 (RESOLVED / v11.33.0 / DEC-2026-06-01-s2-gate-block-upgrade)** — 2nd distinct domain = ecommerce(NestJS/Prisma/jest / 실 jest 56 char GREEN + refund augmentation RED) execution corroboration 확보 → gate-eval `s2_outcome_mismatch` severityRank 2→1 + HARD_BLOCK_CODES 등재 → WARN→block 격상 완료.
2. augmentation impl 후 GREEN 격상 실증 (TC-USER-007 = 미구현 RED → impl 시 expected_outcome pass 전환).

## STOP-3
workspace 873→**875(+2)** ✅ + release-readiness 22/22 ✅ + skill-citation 0 stale + version 3-way 11.13.0 + breaking 0 = **MINOR**.

## paradigm 정합
- **no-simulation**: 실 JDK·Gradle·Spring 구동 + 실 JUnit XML + 실 methodology 모듈. GREEN/RED 모두 실측 (1차의 구조적 추론 탈피).
- **dogfood-first**: 실 RealWorld 구동이 상관 규약 결함을 끌어냄 (추측 ❌).
- **§8.1 strict + speculative hardening 회피**: execution-grade 달성에도 단일 도메인 → WARN 유지 / 격상 carry (cooling-off 폐기 paradigm 정합).
- **self-referential drift 회피**: RealWorld 실 finding(F-DOGFOOD-007/012/013) 기반 = self-referential 아님.

## 인용
- `tools/test-impl-pass-validator/src/s2-outcome-check.js` (correlateByTcId / reconcileOutcomes)
- `tools/chain-driver/src/gate-eval.js:42-46, 106-111, 142` (SCENARIO_EXPECTED.S2 / per_tc_outcome / severityRank)
- `skills/test-generate-test-spec/SKILL.md` (TC-id-in-name 규약)
- DEC-2026-05-30-s2-gate-slice (1차 / Track α) + DEC-2026-05-30-use-scenario-taxonomy (S2 = 주 타깃)
- `_dogfood-realworld/spring-boot-realworld-example-app/.aimd/output/s2-gate-probe.md` §6 (실측 물증 / 외부 repo)
