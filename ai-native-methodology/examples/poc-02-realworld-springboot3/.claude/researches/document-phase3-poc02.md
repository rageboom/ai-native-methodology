# Document Research — PoC #02 Phase 3 (architecture)

> sub-agent 산출 (Document Researcher) — 메인 직접 저장
> 작성: 2026-04-29 / 메인 1차 추정 5건 검증 + 공식 docs 6 영역

---

## 1. F-015 Cross-Validation — 메인 1차 추정 5건 검증 결과

| # | 메인 1차 추정 | 직접 read 결과 | 판정 |
|---|---|---|---|
| 1 | Layer Violation 0건 | grep 결과 module/core → persistence/api: 0 / persistence → api: 0. ArticleSpecifications.java 가 model.* 만 import. | ✅ **정합** |
| 2 | Service 간 직접 의존 0건 → CIRCULAR 0 | 5 @Service 직접 read: 모두 Repository port 만 의존. Service 간 직접 호출 0건. | ✅ **정합** |
| 3 | Split Package smell — config 4 location | grep 결과: module/persistence/main 4 + module/persistence/test 1 + server/api/main 8 + server/api/test 3 = **4 location, 16 파일** | ✅ **정합 + 보강** (test scope 까지 split) |
| 4 | Pure Hexagonal NOT (core 가 @Service / @Entity) | UserService.java:15 @Service, User.java:20 @Entity. 5 @Service / 7 @Entity 모두 module/core 안. | ✅ **정합** (Cockburn 위배) |
| 5 | modular_monolith primary 0.80~0.85 / hexagonal secondary 0.50 | 3 모듈 + compileOnly + runtimeOnly = modular_monolith 강함. core Spring 의존 → Pure Hexagonal NOT but ports/adapters naming 정합 → secondary hexagonal 0.50~0.55 합리. | ✅ **정합** |

**판정 요약**: 5/5 정합. F-044/F-048 패턴 (메인 단편 fetch 함정) **Phase 3 비재현** — Phase 1/2 교훈 흡수 성공.

---

## 2. JPMS Split Package 금지 spec — PF-P3-MAIN-001 권위

### 2.1 JLS §7.7.2 (Java 21) 1차 사료
- "It is a compile-time error if more than one `exports` directive in a module declaration specifies the same package name"
- 출처: https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html

### 2.2 JEP 261 동작
- named + named 모듈 동일 패키지 → 컴파일 에러
- named + classpath (unnamed) → classpath 측 무시
- 본 PoC = classpath 기반 → silent (smell 잠복)

### 2.3 Spring Boot 3 JPMS 미지원
- "Full JPMS support will not arrive in Spring Framework 6.0" (InfoQ 2022/10)
- 본 PoC silent 보장 (Spring Boot 3.3.0 기준)
- 출처: https://www.infoq.com/news/2022/10/spring-boot-3-jax-london/

### 2.4 위험 시나리오 3종
1. module-info.java 추가 시 즉시 컴파일 에러
2. 의존성 jar 수동 패키징 충돌
3. IDE 가 같은 패키지 인식 → 잘못된 import auto-completion

→ **PF-P3-MAIN-001 medium 권고** (잠복 함정 — 현재 미발현 / 시나리오 3종 실재).

---

## 3. Spring Modulith / ArchUnit 도구

### 3.1 Spring Modulith verify() default-fail
- "No cycles on the application module level — DAG"
- "Efferent module access via non-API packages" 차단
- 출처: https://docs.spring.io/spring-modulith/reference/verification.html

### 3.2 ArchUnit slices().beFreeOfCycles()
- 본 PoC 적용 시 cycle 0 → 통과 ✅
- FreezingArchRule 도입 시 baseline 0 + 신규만 차단
- 출처: https://www.archunit.org/userguide/html/000_Index.html

### 3.3 본 PoC 도구 미도입 → architectural smell 잠복
- Spring Modulith 도입 시 split package 즉시 violation
- ArchUnit 도입 시 cycle 0건 baseline 보존
- → PF-P3-DOC-001 권고 (도구 미도입 환경 권고 단서 신설)

---

## 4. Hexagonal 공식 정의 (Cockburn) vs 본 PoC fit

### 4.1 Cockburn 4 원칙
1. inside / outside 분리
2. inside isolation (외부 무지)
3. dependency rule (inward only)
4. **inside 에 framework annotation 금지** (`@Entity`/`@Service`)

### 4.2 본 PoC fit
| 원칙 | 본 PoC | fit |
|---|---|---|
| ports = interface | core/model 의 6 Repository + PasswordEncoder | ✅ |
| adapters = impl in infra | persistence 의 7 Adapter + api/config 의 SecurityPasswordEncoderAdapter | ✅ |
| inside isolated | core 가 jakarta.persistence + spring 의존 | ⚠️ 부분 |
| framework annotation 금지 | 7 @Entity + 5 @Service in core | ❌ **위배** |

→ **Pure Hexagonal NOT 확정** — Cockburn 4번 위배 / "naming hybrid" 정확.

### 4.3 권위 인용
- "The application core is not supposed to know the technical details of the persistence adapter, we cannot provide such an entity with these technical annotations in the application core" (happycoders.eu)
- "The `@Service` annotation from Spring should not be used in the core application layer" (Foojay)

---

## 5. Spring Boot 3.x compileOnly / runtimeOnly 효과

### 5.1 Gradle 공식
| 구성 | compile classpath | runtime classpath |
|---|---|---|
| `compileOnly` | ✅ | ❌ |
| `runtimeOnly` | ❌ | ✅ |

출처: https://docs.gradle.org/current/userguide/java_library_plugin.html

### 5.2 본 PoC 적용 효과
```kts
compileOnly(project(":module:core"))      // (1)
runtimeOnly(project(":module:persistence")) // (3)
```

**(1) compileOnly(core)**: server/api 가 컴파일 시점에 core 의 interface (port) 만 알게 됨
**(3) runtimeOnly(persistence)**: server/api 가 컴파일 시점에 persistence Adapter 클래스를 모름 → 직접 import 시 컴파일 에러 → **Hexagonal 빌드 시스템 강제 ★**

→ **AP-ARCH-001 비재현 권위 단서**.

---

## 6. v1.1.2 §3.1.1 BC 분류 — 0건 케이스 closed 안정성

### 6.1 명세 한계 ★

phase-3-arch.md (v1.1.2) §3.1.1 = 5단계 절차 (Tarjan SCC → BC 분류 → severity → 도구 분기 → Phase 4 라우팅).

**0건 케이스 명시 부재**:
- line 208 `circular_dependencies: []` 한 줄 주석만
- Step 1 결과 0 → Step 2~5 자동 skip 가정 / 명시 부재
- 분류 표 (5행) 에 "N/A (no cycle)" 행 부재
- architecture.json 0건 메타 표기 가이드 부재

### 6.2 closed item 한계 노출 — F-049 패턴 강화 ★

- F-049 (Phase 2) — closed F-016 첫 한계 (Decision Tree Q3 누락)
- **PF-P3-DOC-002 (Phase 3) — closed F-023 두 번째 한계 (0건 케이스 명시 부재)**
- → finding-system closed → reopened 절차 정식화 권위 누적 2건

---

## 7. PoC #01 finding cross-validation (Phase 3 영역)

| PoC #01 ID | 본 PoC 결과 | 분류 |
|---|---|---|
| **AP-ARCH-001** (LV-001) | ❌ **비재현** (compileOnly+runtimeOnly 차단) | stack-conditional |
| **AP-ARCH-002** (LV-002) | ⚠️ **부분 재현** (core 가 spring-boot 강제) | severity 재평가 |
| **CIRCULAR-001** | ❌ **비재현** (Service 간 호출 0) | environment-specific |
| **F-023** (closed) | N/A (cycle 0건) → **명세 한계** ★ | closed → reopened 후보 |
| **F-024** (Phase 1 vs 3 Δ) | 본 PoC Δ 0.85-0.65 = 0.20 (Phase 1 cap 0.65 → Phase 3 0.85) | promoted 강화 |
| **F-025** (hybrid 표현) | 본 PoC 도 hybrid → 재현 강함 | promoted 강화 |

---

## 8. 신규 finding 권고 (Document 영역)

### PF-P3-DOC-001 (medium) — 모듈 boundary 도구 도입 권고 부재
- §3.1.1 Step 4 가 "도구 도입됨" 가정. 미도입 환경 권고 부재.
- v1.2.0 묶음 H 또는 I 흡수.

### PF-P3-DOC-002 (medium) ★ — closed F-023 §3.1.1 0건 케이스 명시 부재
- F-049 패턴 강화 (closed 명세 한계 두 번째)
- v1.2.0 묶음 — phase-3-arch.md §3.1.1 Step 0 추가 + finding-system closed→reopened 절차

### PF-P3-DOC-003 (low) — Hexagonal naming hybrid 어휘 표준화 부재
- F-025 합산. naming_pattern 별도 필드 신설.
- deferred — F-025 와 함께 정식 어휘 표준화 시 일괄 처리.

---

## 9. 메인 1차 추정 정정 — 0건

5/5 정합. F-044/F-048 패턴 비재현. Phase 1/2 교훈 흡수 성공.

**보강**: Cockburn 정통 (core 에 @Entity/@Service 금지) 권위 인용으로 plan §3.3 의 "Pure Hexagonal NOT" 결론 강화.

---

## 10. 종합

- 메인 5/5 정합. F-044/F-048 패턴 비재현
- 권위 인용 12건 (★★★ 7 / ★★ 5)
- 신규 finding 3건 (DOC-001/002/003)
- closed F-023 한계 발견 — F-049 패턴 강화 ★

**END Document Research Phase 3**
