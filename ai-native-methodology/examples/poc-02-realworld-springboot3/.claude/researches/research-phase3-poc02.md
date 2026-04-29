# Research — PoC #02 Phase 3 (3 sub-agent 통합)

> 작성: 2026-04-29 / 메인 — 4원칙 2원칙 결산
> 입력: document-phase3-poc02.md / case-phase3-poc02.md / (senior-phase3 진행 중 — 도착 시 보강)

---

## 0. F-015 + F-044/F-048 Cross-Validation 종합 결과

### 0.1 메인 1차 추정 5건 정합 매트릭스

| # | 메인 추정 | Document | Case | 통합 판정 |
|---|---|---|---|---|
| 1 | Layer Violation 0건 | ✅ 정합 (grep 검증) | ✅ 정합 (사례) | **✅ 100% 확정** |
| 2 | Service 간 의존 0 → CIRCULAR 0 | ✅ 정합 | ✅ 정합 (카뱅 패턴) | **✅ 확정** |
| 3 | Split Package 1건 (config) | ✅ 정합 + **보강 (4 location 16 파일 / test scope 까지)** | ⚠️ **본 PoC 특이성** (우형/카뱅 회피) | **✅ 확정 + smell** |
| 4 | Pure Hexagonal NOT | ✅ Cockburn 위배 권위 | ✅ 우형 ceo-united Domain Hexagon 미달 | **✅ NOT 확정** |
| 5 | modular_monolith 0.80~0.85 + hexagonal 0.50 | ✅ 정합 | ✅ 정합 + **점수 권고 0.85 / 0.55** | **✅ 격상** |

### 0.2 F-044/F-048 패턴 비재현 ★

**Phase 3 에서 메인 1차 추정 정정 사례 0건**:
- Phase 1: F-044 등록 (메인 단언 정정)
- Phase 2: F-048 등록 (TagJpaRepository critical)
- **Phase 3: 정정 0건** ← Phase 1/2 교훈 흡수 성공

이 자체가 메타 finding — "방법론의 학습 효과 입증". 단일 stack 수확 감소 영역 진입 신호 → **§8.1 정합** (PoC #03 다른 stack 으로 이동 권고).

---

## 1. 3-합의 영역 (Document + Case 모두 동일 결론)

### A. Layer Violation 0건 — multi-module 컴파일 시점 차단 ★
- Gradle compileOnly + runtimeOnly 효과 (Document 권위)
- 우형 ceo-united / 카뱅 동일 메커니즘 (Case 사례)
- → AP-ARCH-001 비재현 권위 단서

### B. CIRCULAR 0건 — Service 간 직접 의존 0
- 5 @Service 모두 Repository port 만 사용 (Document)
- 카뱅 메시지허브 정책 정합 (Case)
- → AP-ARCH-006 (PoC #01 CIRCULAR-001) 비재현

### C. Pure Hexagonal NOT — Cockburn 4번 원칙 위배
- core 가 7 @Entity + 5 @Service + jakarta + spring 의존 (Document)
- 우형 ceo-united Domain Hexagon (POJO zero deps) 미달 (Case)
- 권용근 인용: "순수성을 위해 실용성을 포기하는건 어리석은 일이다" — hybrid 정당화
- → "Modular Monolith with Ports & Adapters Naming" 라벨 정확

### D. Split Package smell (PF-P3-MAIN-001) ★
- JLS §7.7.2 compile-time error 권위 (Document)
- Spring Boot Issue #34409/#15967 실증 (Case)
- 우형/카뱅 사례 회피 — 본 PoC 만 발현 (Case)
- → medium severity / **§8.1 deferred** (PoC #03 검증 후 격상)

### E. F-023 (closed) §3.1.1 0건 케이스 명세 한계 ★★
- phase-3-arch.md §3.1.1 5단계 절차가 0건 케이스 명시 부재 (Document)
- closed F-016 (Phase 2 F-049) + closed F-023 (Phase 3 PF-P3-DOC-002) = **closed 명세 한계 누적 2건**
- → finding-system 의 **closed → reopened 절차 정식화 권위 강화 ★**

---

## 2. 점수 권고 (Phase 1 cap 0.65 정정)

| 차원 | Phase 1 cap | Phase 3 권고 | 근거 |
|---|---|---|---|
| modular_monolith primary | 0.65 | **0.85** ⭐ | 3 사례 정합 (우형 / 카뱅 메시지허브 / 카뱅 Spring Modulith) |
| hexagonal secondary | 0.50 | **0.55** | partial 충족 — naming/scope 정합 / Cockburn 4번 위배 |
| ports_adapters_naming (신규) | (미인식) | **0.70** | adapter 명명 100% 일치 |
| layered (refuted) | - | 0.20 | 명시적 layer 분리 부재 |
| clean (refuted) | - | 0.15 | entity = JPA + @Service in core |

→ Phase 1 → Phase 3 정정 트레이스: **Δ +0.20** (cap 0.65 → 0.85). F-024 (PoC #01 promoted) 의 "Δ -0.35 임계" 와 다른 방향 — **본 PoC 는 Phase 1 cap 이 적절했고 Phase 3 에서 권위 데이터 확보 후 격상** = 건강한 패턴.

---

## 3. 신규 finding 통합 표

### 3.1 Document 영역 (3건)
| ID | 제목 | severity | status |
|---|---|---|---|
| PF-P3-DOC-001 | 모듈 boundary 도구 도입 권고 부재 | medium | promoted |
| **PF-P3-DOC-002 ★** | **closed F-023 §3.1.1 0건 케이스 명시 부재** | medium | promoted |
| PF-P3-DOC-003 | Hexagonal naming hybrid 어휘 표준화 부재 | low | deferred (F-025 합산) |

### 3.2 Case 영역 (6건)
| ID | 제목 | severity | status |
|---|---|---|---|
| F-CASE-001 | "Hexagonal naming hybrid" 라벨 정정 | low | promoted |
| F-CASE-002 | core Spring `@Service` 의존 — 한국 hybrid 표준 | low | promoted |
| F-CASE-003 | Split Package smell — §8.1 deferred | medium | **deferred (PoC #03)** |
| F-CASE-004 | compileOnly + runtimeOnly 모범 사례 ★ | (positive) | **deferred (PoC #03)** |
| F-CASE-005 | LV-001 비재현 — multi-module 회피 입증 | (positive) | promoted |
| F-CASE-006 | CIRCULAR-001 비재현 — Service 직접 의존 0 | (positive) | promoted |

### 3.3 메인 영역 (3건 — plan §3.5)
| ID | 제목 | severity | status |
|---|---|---|---|
| PF-P3-MAIN-001 | Split Package — config 양쪽 (≈ F-CASE-003) | medium | **통합 (F-CASE-003 으로)** |
| PF-P3-MAIN-002 | core Spring 의존 (≈ F-CASE-002) | low | **통합 (F-CASE-002 로)** |
| PF-P3-MAIN-003 | Adapter package-private | low | candidate |

### 3.4 통합 후 11건 → 정식 ID 부여 (F-059~)

| 정식 ID | 통합 ID | 제목 | severity | status |
|---|---|---|---|---|
| F-059 | PF-P3-DOC-001 | 모듈 boundary 도구 도입 권고 부재 | medium | promoted |
| **F-060 ★** | **PF-P3-DOC-002** | **closed F-023 §3.1.1 0건 케이스 명시 부재** | medium | promoted |
| F-061 | PF-P3-DOC-003 / F-CASE-001 | Hexagonal naming hybrid 라벨 + 어휘 표준화 | low | promoted |
| F-062 | F-CASE-002 / PF-P3-MAIN-002 | core Spring 의존 — 한국 hybrid 표준 caveat | low | promoted |
| F-063 | F-CASE-003 / PF-P3-MAIN-001 | Split Package smell (config 4 location) | medium | **deferred (PoC #03)** |
| F-064 | F-CASE-004 | compileOnly + runtimeOnly 모범 사례 ★ | (positive) | **deferred (PoC #03)** |
| F-065 | F-CASE-005 | LV-001 비재현 — multi-module 회피 권위 | (positive) | promoted |
| F-066 | F-CASE-006 | CIRCULAR-001 비재현 — Service 직접 의존 0 권위 | (positive) | promoted |
| F-067 | PF-P3-MAIN-003 | Adapter package-private 가시성 | low | candidate |

→ **9건 신규** (메인 사전 추정 3건이 sub-agent 발견과 통합되어 중복 제거).

---

## 4. PoC #01 finding 외부 검증 종합

### 4.1 closed 안정성 검증

| PoC #01 ID | 본 PoC 결과 | 안정성 |
|---|---|---|
| F-007 (inventory schema) | (Phase 1) | ✅ 안정 |
| F-009 (신뢰도 표) | (Phase 1) | ✅ 안정 |
| **F-016 (Decision Tree)** | (Phase 2) | ⚠️ **한계 발견 — F-049** ★ |
| **F-023 (Tarjan SCC + BC 분류)** | Phase 3 | ⚠️ **한계 발견 — F-060 (0건 케이스 명시 부재)** ★ |

→ **closed 4건 중 2건 외부 검증 한계 발견 ★★★** — finding-system 의 closed → reopened 절차 정식화 권위 누적 2건. v1.2.0 격상 시 묶음 I (메타 finding) 신설 강한 근거.

### 4.2 promoted 외부 검증

| PoC #01 ID | 본 PoC 결과 |
|---|---|
| **AP-ARCH-001 (LV-001)** | ❌ 비재현 — multi-module compileOnly+runtimeOnly 차단 |
| **AP-ARCH-002 (LV-002)** | ⚠️ 부분 재현 — core 가 spring-boot 강제 |
| **CIRCULAR-001** | ❌ 비재현 — Service 간 호출 0 |
| **F-024** (Phase 1 vs 3 Δ) | 본 PoC Δ +0.20 (격상 방향) — F-024 promoted 강화 |
| **F-025** (hybrid 표현) | 재현 강함 — 본 PoC 도 modular_monolith primary + hexagonal secondary hybrid |

---

## 5. 단일 PoC 과적합 §8.1 강제 평가

### 5.1 격상 매트릭스

| 패턴 | PoC #01 | PoC #02 | 외부 사례 | 격상 가부 |
|---|---|---|---|---|
| multi-module 3 분리 | (없음) | 있음 | 우형/카뱅 일반 | ★★★ promoted |
| Hexagonal naming hybrid | 부분 | 강함 | 한국 dominant | ★★★ promoted |
| compileOnly + runtimeOnly | (없음) | 있음 | 본 PoC 특이 ★ | **deferred (PoC #03)** |
| core Spring 의존 | 부분 (Anemic) | 강함 (Rich + @Service) | 한국 표준 (90%) | ★★★ promoted |
| Split Package smell | (없음) | 있음 | 본 PoC 특이 | **deferred (PoC #03)** |
| F-023 0건 케이스 한계 | (없음) | 있음 | 방법론 자체 | ★★★ promoted |
| F-016 Decision Tree Q3 한계 (Phase 2) | (없음) | 있음 | 방법론 자체 | ★★★ promoted |
| Aggregate cross-import 회피 | (없음) | 있음 | multi-module 효과 | ★★★ promoted |

### 5.2 §8.1 강제 결론

- **격상 적합 (PoC #01 + #02 + 외부 일치)**: 6건
- **§8.1 deferred (PoC #03 검증)**: 2건 (Split Package + compileOnly/runtimeOnly)
- **closed 한계 메타 finding**: 2건 (F-049 + F-060) — 묶음 I 신설 권위

---

## 6. 6 핵심 결정 (DEC-PHASE3-POC02-XXX)

### DEC-PHASE3-POC02-001 — 메인 1차 추정 5/5 정합 + F-044/F-048 패턴 비재현
- 결정: Phase 3 sub-agent 결과 메인 정정 0건 — Phase 1/2 교훈 흡수 성공
- 적용: 본 phase 신뢰도 가중 + §8.1 PoC #03 진입 신호

### DEC-PHASE3-POC02-002 — Phase 1 cap 0.65 → Phase 3 0.85 격상
- 결정: modular_monolith primary 0.85 / hexagonal secondary 0.55 / ports_adapters_naming 0.70
- 근거: 우형 ceo-united / 카뱅 메시지허브 / 카뱅 Spring Modulith 3 사례 정합

### DEC-PHASE3-POC02-003 — F-060 (closed F-023 0건 케이스 한계) high promoted ★
- 결정: closed 명세 한계 2건 누적 (F-049 + F-060) → finding-system closed → reopened 절차 정식화 권고
- 적용: v1.2.0 묶음 I (메타 finding) 신설 강한 근거

### DEC-PHASE3-POC02-004 — Split Package + compileOnly/runtimeOnly §8.1 deferred
- 결정: F-063 + F-064 PoC #03 cross-stack 검증 후 격상
- 근거: 본 PoC 특이성 — 일반화 검증 부재

### DEC-PHASE3-POC02-005 — Phase 3 raw confidence 0.92
- 결정: 모듈 식별 1.0 / 의존 그래프 1.0 / LLM 영역 0.6~0.7 평균 → 0.92
- 근거: 명세 §6 표 정합

### DEC-PHASE3-POC02-006 — 9 finding 등록 (F-059~F-067)
- 결정: 신규 finding 9건 정식 등록 (DOC 3 + CASE 6 통합)
- 적용: findings/poc-findings.md 갱신

---

## 7. 4단계 진입 권고 (3원칙 게이트)

### 7.1 Auto Mode 자율 적용 6건
- DEC-001 ~ DEC-006 모두 자율 적용 (윤주스 명시)

### 7.2 4단계 산출 6종
```
output/architecture/
├── architecture.json          # architecture.schema.json 정합
├── architecture.md            # Phase 1 cap 0.65 → 0.85 정정 트레이스
├── architecture.mermaid       # C4 Level 3 component diagram (8~12 모듈)
├── dependency-graph.mermaid   # 의존성 그래프 (multi-module + 패키지)
├── circular-dependencies.md   # CIRCULAR 0건 보고 + closed F-023 안정성
└── _manifest.yml              # 신뢰도 0.92 + 6 결정 + 9 finding + KPI
```

### 7.3 finding 등록
- `findings/poc-findings.md` 갱신 (F-059 ~ F-067)
- 누적 통계: PoC #02 26건 / 누적 59건

---

## 8. Senior 결과 보강 (도착 시)

Senior sub-agent 가 백그라운드 진행 중. 결과 도착 시:
- 메인 5건 추정 정합 재확인 (DOC + CASE 와 동일 결론 예상)
- Tarjan SCC 수동 적용 결과 (CIRCULAR 0 권위)
- F-048 architecture 영향 분석
- Senior 직접 read 가 발견할 수 있는 새 critical (있다면 즉시 통합)

도착 즉시 본 문서 §8 보강 + finding 추가 등록.

---

## 9. 양질 시그널 — Phase 1/2/3 통합

| Phase | 메인 정정 | 신규 critical |
|---|---|---|
| Phase 1 | F-044 (Senior 정정) | (없음) |
| Phase 2 | (메인 정정 다수) | F-048 critical (TagJpaRepository) |
| Phase 3 | **0건 (학습 효과)** | **0건 예상** |

→ **본 PoC 단일 stack 수확 감소 영역 진입** 명확. PoC #03 (다른 stack) 으로 즉시 이동 권고.

---

## 10. 다음 단계

1. ✅ 1원칙 (plan) 완료
2. ✅ 2원칙 (Document + Case) 완료 / Senior 진행 중 (보강 대기)
3. ⏳ **3원칙** — 6 핵심 결정 일괄 (Auto Mode 자율)
4. ⏳ 4원칙 — 산출 6종 + finding 9건 등록
5. ⏳ Phase 3 마감 → Phase 4 (비즈니스 로직) 인계

---

**END Research Phase 3 (Document + Case 통합 / Senior 보강 대기)**
