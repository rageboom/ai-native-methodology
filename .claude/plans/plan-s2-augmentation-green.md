# Plan — carry ② S2 augmentation arm GREEN 실증 (DELETE /user round-trip)

> **생성**: 2026-05-30 (session 57차) / 4원칙 §1 deliverable
> **carry**: `C-use-scenario-s2-gate` ② "augmentation impl 후 GREEN 격상 (TC-USER-007)" (v11.13.0 잔여)
> **목표 시나리오**: S2 (AX전환 / 주 타깃) — legacy in-place 증강 round-trip 실측
> **환경**: RealWorld OSS dogfood (`_dogfood-realworld/spring-boot-realworld-example-app`) + JDK 11 (`~/jdk11-temurin/jdk-11.0.31+11`) + Gradle

## 1. 무엇을 / 왜

v11.13.0(2차 execution corroboration)은 augmentation arm `AccountDeletionAugTest`(TC-USER-007 DELETE /user)을 **RED 1건**으로 실측했다 (25 char PASS + 1 aug FAIL). carry ② = 이 augmentation 을 **실제 구현해 RED→GREEN 격상**하고, 그 과정에서 방법론의 **양방향 역동기화(P4)** 를 실측한다.

**핵심 통찰 (단순 "테스트 통과"가 아님)**: `s2-outcome-check.js reconcileOutcomes`는 `actual === expected_outcome` 를 비교한다. TC-USER-007 = `expected_outcome:'fail'`(RED 기대). impl 추가로 actual=pass 가 되면:

1. **impl 부재 (현)**: actual=fail = expected=fail → match → `outcome_mismatches=0` → gate OK
2. **impl 구현 후 / spec 재동기화 전**: actual=**pass** ≠ expected=fail → **mismatch=1 → `s2_outcome_mismatch` WARN 발화** ← gate 가 "spec 이 impl 보다 뒤처졌다(drift)"를 정확히 감지 (drift-detection 실측)
3. **spec 재동기화 후** (expected fail→pass): actual=pass = expected=pass → match → `outcome_mismatches=0` → gate OK / augmentation 이 영구 characterization-grade 로 승격

→ carry ② 의 진짜 가치 = (a) augmentation GREEN 실측 + (b) gate 의 drift-detection 이 올바로 작동함을 음성/양성 양쪽으로 입증 + (c) AX 운영 round-trip(생성 RED → impl → 역동기화) 실측.

## 2. 범위

### A. 외부 RealWorld repo — DELETE /user 수직 슬라이스 (기존 hexagonal 패턴 그대로)
1. `core/user/UserRepository.java` — `void remove(User user);` 추가 (도메인 인터페이스)
2. `infrastructure/repository/MyBatisUserRepository.java` — `@Override remove → userMapper.delete(user.getId())`
3. `infrastructure/mybatis/mapper/UserMapper.java` — `void delete(@Param("id") String id);`
4. `resources/mapper/UserMapper.xml` — `<delete id="delete">delete from users where id = #{id}</delete>`
5. `api/CurrentUserApi.java` — `UserRepository` 주입 + `@DeleteMapping` → `userRepository.remove(currentUser)` → `ResponseEntity.noContent().build()` (204)

### B. 검증 (no-simulation / 실 runner)
- `gradlew test --tests io.spring.api_gen.*` → **26 PASS / 0 FAIL** (직전 25/1)
- JUnit XML 물증 (`build/test-results/test/`)

### C. round-trip 역동기화 실측 (P4)
- **BEFORE 재동기화** (impl 있으나 harness/spec expected 여전히 fail): `s2-exec-harness.mjs` 재실행 → `outcome_mismatches=1` → `s2_outcome_mismatch` WARN — **drift 감지 실측 캡쳐**
- **재동기화**: TC-USER-007 `expected_outcome` fail→pass (harness L30 + s2-reframe test-spec 에 TC-USER-007 augmentation→characterization-grade 등재)
- **AFTER 재동기화**: harness 재실행 → `outcome_mismatches=0` / gate blocked=false → 영구 승격

### D. 방법론 repo (this repo) — evidence + carry 해소
- `s2-gate-probe.md §7` (또는 RealWorld .aimd) — augmentation GREEN round-trip 증거 추가
- carry ② 해소 표기 (STATUS / CHANGELOG / DEC 판단)
- **body code 변경 평가**: gate-eval.js / s2-outcome-check.js 는 이미 올바로 작동 (변경 불요 예상). 변경 없으면 release ❌ — carry 해소 + evidence + memory 만. 변경 있으면 PATCH/MINOR 판단.

## 3. 리스크 / 검증 완료

| 리스크 | 판정 |
|---|---|
| Security 가 DELETE /user 차단 (401/403) | ✅ 해소 — `anyRequest().authenticated()` + 유효 token → 인증됨 / 메서드 레벨 차단 없음 / CORS DELETE 허용 |
| FK constraint (user 삭제 시 articles/follows 고아) | ✅ test user 신규등록(관계 0) + sqlite test profile FK 비강제 → 안전. **production cascade = scope-out** (known-limitation finding 등재) |
| 단순 user-row 삭제의 DDD 정합 | ✅ UsersApi 가 이미 repository 직접 주입 패턴 사용 → CurrentUserApi 동형. minimal 정직 슬라이스 |
| spec 재동기화 누락 시 gate WARN | ✅ 이것이 **의도된 실측 포인트** (drift-detection 입증) — BEFORE/AFTER 양쪽 캡쳐 |

## 4. 정직 평가 (self-referential drift 회피)

- **本 작업의 prod 가치 진전**: S2(주 타깃) AX 운영 round-trip(생성→impl→역동기화) 을 실 OSS repo 에서 실측 = 방법론 핵심 가치 명세 P4(양방향 역동기화) 의 첫 end-to-end 실증. self-referential 아님 (외부 repo 실 구동 + gate drift-detection 음성/양성 대조).
- **§8.1 strict**: 본 작업은 augmentation **mechanism** 실증 (단일 도메인). WARN→block 격상(carry ①)은 여전히 **2nd distinct domain** 필요 → 별 carry 유지 (speculative hardening ❌).
- ① distinct-domain block 격상 = poc-16 사내 source 부재 + RealWorld 동일 도메인 → **환경 차단 carry 정직 유지**.

## 5. 실행 순서
1. plan 승인 (4원칙 §3)
2. A. 5-file 슬라이스 구현
3. B. JAVA_HOME=jdk11 → gradlew test → 26 PASS 실측
4. C. BEFORE harness (mismatch=1 WARN 캡쳐) → 재동기화 → AFTER harness (mismatch=0)
5. D. evidence + carry 해소 + STATUS/memory + (body 변경 시) release ceremony
6. 사용자 commit/push 확인

## Lessons Learned
(작업 중 갱신)
