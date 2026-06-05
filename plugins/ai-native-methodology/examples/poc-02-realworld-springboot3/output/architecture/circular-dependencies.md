# Circular Dependencies — PoC #02 Phase 3

> 작성: 2026-04-29
> 검증 환경: multi-module Gradle Kotlin DSL / Spring Boot 3.3.0 / Java 21
> 명세: phase-3-arch.md §3.1.1 (v1.1.2 / closed F-023)

---

## 1. 검출 결과

### Tarjan SCC 알고리즘 적용

**결과: 0건** ✅

검증 방법:

1. **메인 직접 grep** — Service 간 io.zhc1 import 분석:
   - ArticleService → `io.zhc1.realworld.model.*` 만 의존 (Repository port + Entity)
   - UserService → `io.zhc1.realworld.model.*` 만 의존
   - ArticleCommentService → `io.zhc1.realworld.model.*` 만 의존
   - UserRelationshipService → `io.zhc1.realworld.model.*` 만 의존
   - TagService → `io.zhc1.realworld.model.*` 만 의존
   - **→ Service 간 직접 호출 0건** = SCC 1개 (각 Service 가 1-node strongly connected component)

2. **module 간 의존 그래프**:
   - server/api → module/core (compileOnly + runtimeOnly persistence)
   - module/persistence → module/core
   - module/core → (없음)
   - **→ DAG (Directed Acyclic Graph) 형성** — circular 0

3. **package 간 의존**:
   - core/service → core/model (단방향)
   - persistence/persistence → core/model (단방향)
   - api/api → core/model + core/service + api/config (단방향)
   - **→ DAG 형성 — circular 0**

---

## 2. PoC #01 비교

| PoC #01                                                                    | PoC #02                                     |
| -------------------------------------------------------------------------- | ------------------------------------------- |
| CIRCULAR-001 (User domain ↔ Article application 등) — same_bc severity low | **0건** ✅                                  |
| Service 간 직접 호출 다수                                                  | Service 가 Repository port 만 사용          |
| 단일 모놀리스 → cross-package import 자유                                  | multi-module compileOnly + runtimeOnly 차단 |

→ **PoC #01 CIRCULAR-001 본 환경 비재현 확정** (DEC-PHASE3-POC02-001)

---

## 3. v1.1.2 §3.1.1 BC 분류 절차 — 0건 케이스 적용

### 3.1 명세 §3.1.1 5단계 절차

- Step 1. Tarjan SCC 알고리즘 (검출) → **결과 0건**
- Step 2~5. 분류 / severity 산정 / 도구 분기 / Phase 4 라우팅 → **적용 부재 (skip)**

### 3.2 closed F-023 외부 검증 한계 노출

**phase-3-arch.md §3.1.1 의 0건 케이스 명시 부재** 발견:

- Step 1 결과 0 → Step 2~5 자동 skip 가정만 있음 (line 208 `circular_dependencies: []` 한 줄 주석)
- 분류 표 (5행) 에 "N/A (no cycle)" 행 부재
- architecture.json 0건 케이스 메타 표기 가이드 부재

→ **F-060 promoted 등록** (DEC-PHASE3-POC02-003).

### 3.3 closed 명세 한계 누적 2건

| Phase       | finding   | closed 항목                | 한계                              |
| ----------- | --------- | -------------------------- | --------------------------------- |
| Phase 2     | F-049     | F-016 (Decision Tree §3.4) | Q3 (DDL auto-generated 분별) 누락 |
| **Phase 3** | **F-060** | **F-023 (BC 분류 §3.1.1)** | **0건 케이스 명시 부재**          |

→ finding-system 의 **closed → reopened 절차 정식화 권위 강화**. v1.2.0 묶음 I (메타 finding) 신설 강한 근거.

---

## 4. 도구 정책 분기 (§3.1.1 Step 4)

### 4.1 본 PoC 도구 도입 현황

| 도구                               | 도입 |
| ---------------------------------- | ---- |
| Spring Modulith verify()           | ❌   |
| ArchUnit slices().beFreeOfCycles() | ❌   |
| ArchUnit FreezingArchRule          | ❌   |

→ §3.1.1 Step 4 의 "도구 도입됨" 가정 미충족.

### 4.2 도구 미도입 환경 권고 부재 (F-059)

- 현행 §3.1.1 Step 4 가 "Spring Modulith verify() / ArchUnit slices() 활성" 가정만 분기
- 도구 미도입 환경의 도입 권고 단서 / migration path 명세 부재
- → **F-059 medium promoted** (DEC-PHASE3-POC02-006)

### 4.3 도구 도입 시뮬레이션

- **Spring Modulith verify() 도입 시**: 본 PoC 의 split package (config 4 location) 즉시 violation 검출 (F-063)
- **ArchUnit slices().beFreeOfCycles() 도입 시**: cycle 0건 baseline → ✅ 통과
- **ArchUnit FreezingArchRule 도입 시**: 현재 0건 baseline 보존 + 신규 cycle 만 차단

---

## 5. Phase 4 라우팅 (§3.1.1 Step 5)

### 5.1 라우팅 결과: 부재

- circular_dependencies: 0건 → decision_required: 0건 → Phase 4 라우팅: 부재

### 5.2 BC 후보 (Phase 4 입력)

본 phase architecture.json 의 module_table_mapping:

- BC-CONTENT (5 테이블 / Article aggregate)
- BC-USER (2 테이블 / User aggregate)
- BC-AUTH (cross-cutting / 0 테이블 / JWT stateless)

→ Phase 4 도메인 추출 입력으로 인계.

---

## 6. 결론

1. **CIRCULAR 0건 확정** — multi-module compileOnly + runtimeOnly + Service 간 직접 호출 회피의 결합 효과
2. **PoC #01 CIRCULAR-001 비재현** — environment-specific (single-module → multi-module 전환 효과)
3. **closed F-023 명세 한계 발견** — F-060 promoted (Phase 2 F-049 와 함께 2건 누적)
4. **도구 정책 분기** — 도구 미도입 환경 권고 부재 (F-059 promoted)

---

**END Circular Dependencies (Phase 3)**
