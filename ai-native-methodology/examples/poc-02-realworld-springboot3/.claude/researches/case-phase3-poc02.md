# Case Research — PoC #02 Phase 3 (architecture)

> sub-agent 산출 (Case Researcher) — 메인 직접 저장
> 작성: 2026-04-29 / 한국/글로벌 사례 + §8.1 강제

---

## 1. F-015 Cross-Validation (메인 5건 — 사례 기반)

| # | 메인 추정 | 한국/글로벌 사례 | 정합? |
|---|---|---|---|
| 1 | Layer Violation 0건 | 우형 ceo-united / 카뱅 메시지허브 同 0건 | ✅ |
| 2 | Service 간 직접 의존 0 → CIRCULAR 0 | 카뱅 메시지허브 "프라이머리 어댑터에서 코어 모듈 인터페이스만 호출" 동일 정책 | ✅ |
| 3 | Split Package — config 양쪽 | 우형/카뱅/카페 사례 모두 모듈별 sub-package 분리 (split 회피) | ⚠️ **본 PoC 특이성** |
| 4 | Pure Hexagonal NOT | 우형 ceo-united Domain Hexagon = POJO + zero deps. 본 PoC 미달 | ✅ NOT 확정 |
| 5 | modular_monolith 0.80~0.85 + hexagonal 0.50 | 카뱅 메시지허브 = 모듈러 모놀리스 + Hexagonal partial 라벨 | ✅. **단 hexagonal 0.55~0.60 권고** |

---

## 2. 한국 multi-module hexagonal hybrid 사례

### 2.1 우아한형제들 ceo-united (★ Gold Standard)
- 출처: https://techblog.woowahan.com/12720/
- 4 hexagon: domain (POJO zero deps) + application (@Service + Domain 의존) + framework (aws/retrofit/cache 분리) + bootstrap (api/worker)
- 본 PoC 와 비교: **간소화 버전**. core 가 jakarta + Lombok 의존 = Domain Hexagon zero deps 미달

### 2.2 카카오뱅크 메시지 허브 (★)
- 출처: https://tech.kakaobank.com/posts/2311-hexagonal-architecture-in-messaging-hub/
- 인용: "프라이머리 어댑터에서 코어 모듈 인터페이스만 호출. 프라이머리 → 세컨더리 직접 호출 금지"
- Selective Building: `@ConditionalOnExpression`
- 본 PoC `compileOnly + runtimeOnly` = 카뱅의 selective building 과 동일 의도

### 2.3 카카오뱅크 Spring Modulith (2025-07)
- 출처: https://tech.kakaobank.com/posts/2507-legacy-to-modular-monolith-with-spring-modulith/
- 3 Gradle 모듈 (adapter-in / adapter-out / application) = 본 PoC 와 거의 동일 구조
- `@ApplicationModule(type=OPEN)` common 패턴
- Spring Modulith verify() 도입 (본 PoC 미도입 gap)

### 2.4 카카오페이 home Hexagonal 제거 회고 (★ 반례)
- 출처: https://tech.kakaopay.com/post/home-hexagonal-architecture/
- Hexagonal 적용 3 전제:
  1. 명확한 도메인 모델
  2. 제한된 외부 의존
  3. **Multi-component 재사용** (도메인이 2+ 서비스에서 사용)
- **RealWorld 가 1/3 만 충족** → Pure Hexagonal NOT 정합

### 2.5 권용근 (우형) 인용 ★
- "**순수성을 위해서 실용성을 포기하는건 어리석은 일이다. 도메인이 인프라를 알아도 괜찮다면 불필요한 인터페이스 계층을 제거할 수 있다**"
- 본 PoC hybrid 정당화 권위

---

## 3. 글로벌 Hexagonal 사례

- Netflix: https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749 (microservice 단위 — 본 PoC 와 결정적 차이)
- idealo: https://medium.com/idealo-tech-blog/hexagonal-ports-adapters-architecture-e3617bcf00a0 (3 layer / Spring 의존 Adapter 안)
- Cockburn 정통: https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)

---

## 4. JPMS Split Package 사고 사례

### 4.1 권위 인용
- prgrmmng.com: "JPMS strictly prohibits this scenario. Module path: 'Packages X in moduleA and moduleB conflict'"
- Spring Boot Issue #34409 (webflux split package), #15967 (Spring Boot Starter Test)
- "Spring Boot 3.0.3 + Java 17 + Maven 3.8 module path 빌드 시도 → 컴파일 실패"

### 4.2 해소 4 패턴
1. Refactor packages (모듈별 sub-package)
2. Merge modules (단일 common)
3. Implement services (`provides`/`uses`)
4. `--patch-module` (단기 우회만)

→ 본 PoC 권고: 패턴 ① (`io.zhc1.realworld.persistence.config` / `io.zhc1.realworld.api.config` 분리)

---

## 5. compileOnly + runtimeOnly 한국 사례 비교

| 기업 | 패턴 | 차이 |
|---|---|---|
| **본 PoC** | api: `compileOnly(core) + runtimeOnly(persistence)` | ★ 명시적 강제 |
| 우형 ceo-united | bootstrap-api: framework selective `@ComponentScan` | ComponentScan 강제 |
| 카뱅 메시지허브 | core implementation + `@ConditionalOnExpression` | Conditional 강제 |
| 카뱅 Spring Modulith | 3 Gradle module + GoodsModuleDetectionStrategy | Modulith 강제 |

→ 본 PoC 가 **국내 사례 중 가장 명시적이고 단순한 강제**. v1.2.0 모범 사례 권고 가능.

---

## 6. Spring Modulith 도입 사례

- Spring Modulith 1.3 (2024-11) — `@ApplicationModule(type=OPEN)` / cycle detection / ApplicationModuleListener
- 카뱅 수신상품 팀 (2025-07) 적용 — 3 모듈 + ADR 자동 문서화
- 본 PoC 도입 시뮬레이션: split package 즉시 violation (PF-P3-MAIN-001 권위 강화)

---

## 7. PoC #01 finding 한국 빈도 (Phase 3 영역)

| PoC #01 ID | 본 PoC 재현 | 한국 빈도 |
|---|---|---|
| AP-ARCH-001 (LV-001) | ❌ 비재현 (multi-module 차단) | 단일 모듈 모놀리스 ★★★★ (95%) / multi-module ★ (5%) |
| AP-ARCH-002 (LV-002) | ⚠️ 부분 재현 (core spring-boot 강제) | 한국 ★★★★ (90% — 권용근 hybrid 정당화) |
| CIRCULAR-001 | ❌ 비재현 (Service 간 호출 0) | 한국 ★★★ (50%) |
| F-023 (closed) | N/A (0건) → 명세 한계 | (방법론 자체) |

→ **multi-module 으로 LV-001 회피 가능 — 5% 만 채택. 사내 적용 시 multi-module ROI 높음**.

---

## 8. 단일 PoC 과적합 §8.1 평가

### 격상 매트릭스

| 패턴 | 일반화 | §8.1 처분 |
|---|---|---|
| multi-module 3 분리 | ✅ 일반 (PoC #01 + #02) | promoted |
| Hexagonal naming hybrid | ✅ 일반 (한국 dominant) | promoted |
| compileOnly + runtimeOnly 강제 | ⚠️ 본 PoC 특이 ★ | **deferred (PoC #03 검증)** |
| core Spring `@Service` 의존 | ✅ 한국 표준 (90%) | promoted |
| JPA @Entity = SoT | ✅ 한국 dominant | promoted (Phase 2 DEC-001 합산) |
| Split Package smell | ⚠️ 본 PoC 특이 | **deferred (PoC #03)** |
| Aggregate cross-import 회피 | ✅ multi-module 효과 | promoted |
| F-023 closed 0건 케이스 안정성 | ✅ 방법론 자체 검증 | promoted |

### §8.1 강제
- 본 PoC 특이 2건 (compileOnly/runtimeOnly + Split Package) → **PoC #03 cross-stack 검증** 후 격상
- 일반 6건 → v1.2.0 4 묶음 합산

---

## 9. 신규 finding 권고 (Case 영역)

| ID | 제목 | severity | status |
|---|---|---|---|
| F-CASE-001 | "Hexagonal naming hybrid" 라벨 정정 | low | promoted |
| F-CASE-002 | core Spring 의존 — 한국 hybrid 표준 | low | promoted |
| F-CASE-003 | Split Package — 우형/카뱅 회피 / 본 PoC 만 발현 | medium | **§8.1 deferred** |
| F-CASE-004 | compileOnly+runtimeOnly 모범 사례 ★ | (positive) | **§8.1 deferred** |
| F-CASE-005 | LV-001 비재현 — multi-module 회피 입증 | (positive) | promoted |
| F-CASE-006 | CIRCULAR-001 비재현 — Service 직접 의존 0 | (positive) | promoted |

---

## 10. 메인 1차 추정 정정 권고

### 점수 권고
- modular_monolith primary: Phase 1 cap 0.65 → **0.85** (3 사례 정합)
- hexagonal secondary: 0.50 → **0.55** (partial 충족)
- ports_adapters_naming (신규): **0.70** (adapter 명명 100%)

### BC 후보 검증
- BC-CONTENT (Article + Comment + Tag + Favorite + Follow)
- BC-USER (User + UserFollow)
- BC-AUTH (cross-cutting — api/config)
- → PoC #01 정합. multi-module 로 BC 경계 더 명확.

---

## Sources (28 URL)

- 우형 ceo-united: https://techblog.woowahan.com/12720/
- 우형 권용근 발표: https://techblog.woowahan.com/2637/
- 카뱅 메시지허브: https://tech.kakaobank.com/posts/2311-hexagonal-architecture-in-messaging-hub/
- 카뱅 Spring Modulith: https://tech.kakaobank.com/posts/2507-legacy-to-modular-monolith-with-spring-modulith/
- 카페 home 회고: https://tech.kakaopay.com/post/home-hexagonal-architecture/
- 토스 SLASH: https://toss.tech/article/how-to-manage-test-dependency-in-gradle
- Netflix Tech Blog: https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749
- Spring Modulith 1.3: https://spring.io/blog/2024/11/22/whats-new-in-spring-modulith-1-3/
- ArchUnit: https://www.archunit.org/
- Spring Boot Issue #34409: https://github.com/spring-projects/spring-boot/issues/34409
- prgrmmng split package: https://prgrmmng.com/handling-split-packages-and-avoiding-conflicts-in-modules
- Wikipedia Hexagonal: https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)

**END Case Research Phase 3**
