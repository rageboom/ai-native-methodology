# DEC-2026-05-30-s2-augmentation-green-roundtrip

> v11.14.0 MINOR release SSOT. S2(AX전환 / 주 타깃) gate **augmentation arm RED→GREEN round-trip** — RealWorld dogfood 실 구동(no-simulation)으로 carry ②(augmentation impl 후 GREEN 격상) 시행 + 방법론 가치 P4(양방향 역동기화) end-to-end 실측.
> 상태: **승인 + 시행 완료** (2026-05-30 / session 57차). 사용자 결단 chain — `/clear` 후 "다음 작업 시작해줘" → audit 리포트 후속 vs prod carry AskUserQuestion → "리팩토링 보류 — prod 가치 carry" → feasibility triage(① 환경 차단 / ② 완전 가능) → carry ② 추천 + plan 제시 → "진행".

## 배경 — carry ② (v11.13.0 잔여)

DEC-2026-05-30-s2-exec-corroboration(v11.13.0 / 2차)은 augmentation arm `AccountDeletionAugTest`(TC-USER-007 / `DELETE /user`)을 **impl 부재 RED 1건**으로 실측했다 (expected=fail ↔ actual=fail / match). carry ② = 이 augmentation 을 **실제 구현해 RED→GREEN 격상**하고, 그 과정에서 방법론 가치 P4(양방향 역동기화)를 실측.

**feasibility triage (정직)**: carry ① (WARN→block 격상 / 2nd distinct domain) = poc-16 efiweb-car **.java source 부재**(사내 미커밋) + RealWorld 동일 blog 도메인 → **환경 차단 carry 유지**. carry ② = RealWorld repo + augmentation test + UsersApi + JDK 11(`~/jdk11-temurin` 재사용) **모두 present → 완전 실행 가능** = 본 release 대상.

## 결단 — augmentation impl + round-trip 실측 (no-simulation)

### impl (RealWorld 5-file 수직 슬라이스 / 기존 hexagonal 패턴 그대로)

1. `core/user/UserRepository.java` — `void remove(User)` (도메인 인터페이스)
2. `infrastructure/repository/MyBatisUserRepository.java` — `@Override remove → userMapper.delete(id)`
3. `infrastructure/mybatis/mapper/UserMapper.java` — `void delete(@Param("id") String)`
4. `resources/mapper/UserMapper.xml` — `<delete id="delete">delete from users where id = #{id}</delete>`
5. `api/CurrentUserApi.java` — `UserRepository` 주입 + `@DeleteMapping` → `@AuthenticationPrincipal` → `userRepository.remove(currentUser)` → 204

리스크 사전 해소: Security `anyRequest().authenticated()` + 유효 token → 인증 통과 / FK = 신규 user 관계 0 + sqlite test profile FK 비강제 → 안전 (production cascade = scope-out / known-limitation finding).

### 실측 (`gradlew test --tests io.spring.api_gen.*` / JDK 11 + Gradle 7.4)

- **26 testcases = 26 PASS / 0 FAIL** (직전 25 PASS + 1 FAIL). `AccountDeletionAugTest :: TC-USER-007` = **PASS**(204). JUnit XML 물증.

### round-trip 3 상태 실측 (`.aimd/s2-roundtrip-probe.mjs` / 동일 실 XML 에 spec expected_outcome 만 대조 / 실 methodology 모듈)

| 상태                                            | augmentation expected | actual   | outcome_mismatches | GATE(S2)                                                                 |
| ----------------------------------------------- | --------------------- | -------- | ------------------ | ------------------------------------------------------------------------ |
| 1. impl 부재 (v11.13.0 2차)                     | fail                  | fail     | 0                  | go-eligible                                                              |
| 2. impl 후 / **재동기화 전** (BEFORE)           | fail (stale)          | **pass** | **1**              | **`s2_outcome_mismatch` WARN** ← drift 감지 (impl 이 spec 보다 앞섬)     |
| 3. **재동기화 후** (AFTER / expected fail→pass) | pass                  | pass     | 0                  | go-eligible ← drift 해소 / augmentation 영구 characterization-grade 승격 |

→ **gate 가 "impl 이 spec 을 앞지름(drift)"을 `s2_outcome_mismatch` 로 정확히 감지(상태 2) → 운영자가 spec 의 expected_outcome 을 fail→pass 로 역동기화(상태 3) → 해소.** AX 운영 round-trip(생성 RED → impl → 역동기화)이 실 OSS repo 에서 end-to-end 실측됨. probe + 재동기화된 harness 모두 exit 0.

## methodology 보강 (additive / breaking 0)

1. **`skills/test-generate-test-spec/SKILL.md`** — step 3 에 "S2 augmentation 재동기화" 1 unit 추가: augmentation TC 는 `expected_outcome="fail"`(RED) 생성 → impl 후 **fail→pass 재동기화** 의무 + 재동기화 누락 시 gate 가 `s2_outcome_mismatch` WARN 으로 drift 신호. (gate-eval.js / s2-outcome-check.js 코드 = 이미 올바로 작동 / 변경 ❌.)
2. **`methodology-spec/use-scenario-taxonomy.md` §5** — `C-use-scenario-s2-gate` carry 행에 augmentation GREEN round-trip(carry ② RESOLVED) 추가.
3. 외부 evidence: `_dogfood-realworld/.../s2-gate-probe.md §7` (round-trip 3 상태 표 + impl 5-file) + `.aimd/s2-roundtrip-probe.mjs`(신규) + `.aimd/s2-exec-harness.mjs` 재동기화(expected→pass).

## §8.1 corroboration 평가 (정직)

| axis                                                        | 상태                                          |
| ----------------------------------------------------------- | --------------------------------------------- |
| augmentation **mechanism**(RED→GREEN + 역동기화 round-trip) | ✅ **RealWorld 실측 (본 release)**            |
| §8.1 ≥2 **distinct domain** (WARN→block 격상 / carry ①)     | ⛔ **1/2 carry** — RealWorld 단일 blog 도메인 |

→ 본 release = augmentation arm **GREEN + 역동기화 round-trip** 실증 (단일 도메인 mechanism). WARN→**block** 격상(carry ①)은 여전히 ≥2 distinct domain 필요 → 별 carry 유지 (speculative hardening 회피 / §8.1 strict + cooling-off 폐기 paradigm 정합). 본 round-trip 의 문서화(skill 보강)는 `reconcileOutcomes` 의 기계적 귀결(expected vs actual)을 실측 입증한 것 = ceiling 주장 아님 → 1 execution 으로 workflow 문서화 충분.

## carry

1. **C-use-scenario-s2-gate 격상 (carry ①)** — WARN→block 격상 = 2nd distinct domain S2 execution corroboration 후 (gate-eval `s2_outcome_mismatch` severityRank 2→격상). poc-16 사내 source 부재 → 타 distinct OSS Spring 또는 사내 source 확보 의존.
2. (선택) augmentation TC-USER-007 의 canonical test-spec(s2-reframe.json) 정식 등재 + AC-USER-007/BHV-USER-005 traceability (현 harness/probe embed 로 충분 / 외부 repo orphan 회피 위해 본 release 제외).

## STOP-3

workspace 875/875 (영향 0 — methodology 코드 무변경 / doc·skill·taxonomy only) ✅ + release-readiness 22/22 ✅ + skill-citation 0 stale + version 3-way 11.14.0 + breaking 0 = **MINOR**.

## paradigm 정합

- **no-simulation**: 실 JDK·Gradle·Spring·JUnit XML + 실 methodology 모듈(correlateByTcId/reconcileOutcomes/evaluateGate). RED→GREEN round-trip 모두 실측.
- **dogfood-first**: 실 RealWorld 구동으로 drift 감지 → 역동기화 → 해소 round-trip 입증 (추측 ❌).
- **§8.1 strict + speculative hardening 회피**: augmentation mechanism 실증(단일 도메인) / WARN→block 격상은 ≥2 distinct domain carry 유지.
- **self-referential drift 회피**: 실 OSS repo impl + 실 execution + gate drift-detection 음성/양성 대조 = self-referential 아님 / 본 session prod 가치 진전 = **방법론 핵심 가치 P4(양방향 역동기화)의 첫 end-to-end 실측 + 최초 문서화**.

## 인용

- `skills/test-generate-test-spec/SKILL.md` (S2 augmentation 재동기화 instruction)
- `methodology-spec/use-scenario-taxonomy.md` §5 (carry ② RESOLVED)
- `tools/test-impl-pass-validator/src/s2-outcome-check.js` (reconcileOutcomes / correlateByTcId — 코드 무변경 / 올바로 작동 입증)
- `tools/chain-driver/src/gate-eval.js` (SCENARIO_EXPECTED.S2 per_tc_outcome / s2_outcome_mismatch — 코드 무변경)
- DEC-2026-05-30-s2-exec-corroboration (2차 / carry ② 원천) + DEC-2026-05-30-s2-gate-slice (Track α)
- `_dogfood-realworld/spring-boot-realworld-example-app/.aimd/output/s2-gate-probe.md` §7 (round-trip 물증 / 외부 repo)
