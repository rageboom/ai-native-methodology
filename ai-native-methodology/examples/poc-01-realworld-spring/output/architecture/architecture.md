# 아키텍처 보고서 — RealWorld Spring Boot

> Phase 3 산출물 (사람용)
> 생성일: 2026-04-28
> 사용자 결정 반영: **2026-04-28** (ARCH-STYLE 정정 트레이스 승인 + CIRCULAR-001 ADR-006 default 적용 — research-decisions-6.md §5~6)
> 신뢰도: **0.91** (ADR-003 §9 — 신뢰 가능, 샘플 검토 권장)
> 출처: 19건 import raw fetch + Phase 1/2 인계 + 3 에이전트 토론

---

## 1. 한 줄 요약

**Layered Architecture + Spring-flavored DDD-Lite (0.85)** — Spring Boot 모놀리스. POJO 도메인 의도 + Spring framework 부분 의존. Hexagonal/Clean 미달성 (0.30). 외부 의존성 0건.

---

## 2. Phase 1 candidate → Phase 3 확정 정정 트레이스 ⭐ ✅ APPROVED (2026-04-28)

본 PoC 의 **가장 강한 발견**. 윤주스 (TF Lead) 정정 트레이스 승인 완료 (architecture.json `user_decisions[ARCH-STYLE]` 참조).

| 후보 | Phase 1 | Phase 3 | Δ | 상태 |
|---|---|---|---|---|
| Hexagonal/Clean (영향) | 0.65 | **0.30** | -0.35 | ❌ refuted |
| POJO domain 강조 | 0.85 | **0.50** | -0.35 | ⚠️ corrected |
| Layered (보강) | 0.55 | **(흡수)** | - | ✅ promoted to primary |
| **Layered + Spring-flavored DDD-Lite** | (인식 안 됨) | **0.85** | +0.85 | ⭐ 신규 primary |

### 2.1 정정 근거 (5 차원 결정적 검증)

| # | 차원 | 검증 결과 | 출처 |
|---|---|---|---|
| 1 | domain framework annotation | `@Service`/`@Transactional`/`@Entity`/`PasswordEncoder` 모두 직접 import | 메인 9 + sub-agent 10 raw fetch |
| 2 | application → infrastructure 직접 의존 | `ArticleRestController` → `infrastructure/jwt/UserJWTPayload` ⚠️ Hexagonal 부정 핵심 | LV-001 |
| 3 | port/adapter 분리 | `UserFindService` interface 1건만 | document §6 |
| 4 | domain ↔ infrastructure (정상 port 구현) | `domain/jwt` interface + `infrastructure/jwt/HmacSHA256JWTService` 구현 — 1건만 | document §7 |
| 5 | Anemic vs Rich Domain | Fowler 기준 통과 (`User.writeCommentToArticle()` 등 풍부 행동) | document §8 |

→ **카카오페이 home Hexagonal 제거 회고 (case §1)** 의 "Hexagonal 적용 3 전제" 中 1/3 만 충족. RealWorld 가 Hexagonal 미달성.

→ **우형 Multi Module Hexagonal (case §3)** 의 "Domain Hexagon = POJO 강제" 글로벌 기준 미달.

---

## 3. 모듈 구성 (10개)

### 3.1 layer 별

| Layer | 모듈 수 | 총 LOC | 비율 |
|---|---|---|---|
| presentation (application/) | 5 | 892 | 41% |
| domain (domain/) | 3 | 1,110 | 51% |
| infrastructure | 2 | 186 | 8% |

→ **domain layer 가 가장 큼** (51%) — POJO 도메인 의도와 정합. 단 framework 의존이 분리 정도를 약화.

### 3.2 모듈 상세

| ID | path | layer | files | LOC | BC |
|---|---|---|---|---|---|
| MOD-DOMAIN-ARTICLE ⭐ | domain/article | domain | 12 | 616 | BC-ARTICLE |
| MOD-DOMAIN-USER | domain/user | domain | 12 | 480 | BC-USER |
| MOD-DOMAIN-JWT | domain/jwt | domain | 3 | 14 | BC-AUTH |
| MOD-APP-ARTICLE | application/article | presentation | 9 | 384 | BC-ARTICLE |
| MOD-APP-USER | application/user | presentation | 7 | 265 | BC-USER |
| MOD-APP-SECURITY | application/security | presentation | 3 | 199 | BC-AUTH |
| MOD-APP-TAG | application/tag | presentation | 2 | 28 | BC-ARTICLE (sub) |
| MOD-APP-CROSS | application/ | cross-cutting | 1 | 16 | - |
| MOD-INFRA-JWT | infrastructure/jwt | infrastructure | 5 | 178 | BC-AUTH |
| MOD-INFRA-REPO | infrastructure/repository | infrastructure | 1 | 8 | - |

⭐ **Article 1순위 ground truth 검증** (Phase 1 → Phase 3 일관) — 12 files / 616 LOC.

---

## 4. 의존성 그래프 (19건 import 검증)

`architecture.mermaid` + `dependency-graph.mermaid` 참조.

### 4.1 정상 의존 (Layered)

- presentation → domain: 24+ 건 (정상)
- infrastructure → domain (port 구현): 4 건 (`MOD-INFRA-JWT` → `MOD-DOMAIN-JWT`)

### 4.2 Layer Violation 2건

| ID | 위반 | severity | 안티패턴 후보 |
|---|---|---|---|
| **LV-001** | application → infrastructure 직접 의존 (`AppArt`/`AppUsr` → `InfJwt` `UserJWTPayload`) | medium | AP-ARCH-LAYER-VIOLATION-001 |
| **LV-002** | domain → Spring framework leak (`@Service`/`@Transactional`/`@Entity`/`PasswordEncoder`) | medium | AP-DOMAIN-FRAMEWORK-LEAK-001 |

→ Phase 6 quality 단계에서 안티패턴 격상 검토.

### 4.3 순환 의존성 1건 ✅ RESOLVED (Phase 4 same_bc 결정)

**CIRCULAR-001**: `MOD-DOMAIN-ARTICLE` ↔ `MOD-DOMAIN-USER` 양방향 import (5+4=9 imports)

- 알고리즘 관점 (Spring Modulith / ArchUnit / Tarjan SCC): ❌ 자동 실패
- 도메인 의도 관점 (Phase 4 검증): User.writeArticle/writeCommentToArticle/favoriteArticle 등 5+ cross-aggregate 행동 — same_bc

→ **윤주스 결정 (2026-04-28 3원칙 승인)**: `bc_status=same_bc` 단일 BC-CONTENT 확정. severity **medium → low** 격하. `decision_required=false` (해소). Phase 6 안티패턴 격상 안 함. 상세는 `circular-dependencies.md` §1.4 + `output/domain/domain.md` §1.1.

---

## 5. 외부 의존성 — 0건 (5.D 빈약 PoC 한계)

```
external_dependencies: []
```

- HTTP 클라이언트 (RestTemplate / WebClient / OkHttp): 부재
- 메시지 큐 (Kafka / RabbitMQ / SQS): 부재
- 외부 SDK (AWS / Stripe / Twilio): 부재
- → **5.D 영역 검증 불가** (학습용 spec 한계)

→ **F-026 finding**: 5.D 0건 케이스 신뢰도 처리 가이드 부재.
→ 사내 진짜 PoC 시 별도 검증 필수 (plan-poc-realworld.md §2.3 의 한계 인정).

---

## 6. 모듈 ↔ 테이블 매핑 (Phase 4 BC 후보)

Phase 2 의 7 테이블 → 모듈 매핑:

**Phase 3 BC 후보 → Phase 4 결정**:

| Phase 3 BC 후보 | Phase 4 BC (확정) | 모듈 | 테이블 | Aggregate (확정) |
|---|---|---|---|---|
| BC-ARTICLE + BC-USER | **BC-CONTENT (단일)** | DOMAIN-ARTICLE + DOMAIN-USER + APP-ARTICLE + APP-USER + APP-TAG | articles, articles_tags, article_favorites, comments, tags, users, user_followings | User, Article, Tag (Comment 흡수) |
| BC-AUTH | BC-AUTH | DOMAIN-JWT + INFRA-JWT + APP-SECURITY | (없음) | (cross-cutting, 영속성 0) |

→ **CIRCULAR-001 same_bc 결정 (Phase 4)**: 사용자 결정으로 BC-ARTICLE+BC-USER 통합 → BC-CONTENT 단일. 모듈 그룹은 Phase 3 그대로 유지 (모듈 단위 코드 구조 유지). domain.json 의 BC 정의만 단일화.

---

## 7. 한국 사례 비교 (case §1~§5 직접 매칭)

| 사례 | 본 PoC 와의 차이 | 시사점 |
|---|---|---|
| **카카오페이 home Hexagonal 제거 회고** ⭐ | Hexagonal 적용 3 전제 1/3 충족 | RealWorld 의 Hexagonal candidate 0.30 강한 지지 |
| **카카오뱅크 Spring Modulith 도입** | Modulith + Hexagonal + Modular Monolith 합성 | "합성 아키텍처" 명명 정당화 |
| **우형 Multi Module Hexagonal** | Domain Hexagon = POJO 강제 ("Spring Component/Service annotation 비사용") | RealWorld POJO 0.50 (실측 미달) |
| **Vaughn Vernon Effective Aggregate Design Part II** | 양방향 cross-aggregate 참조 = anti-pattern | F-023 정당화 |
| **우형 Clean Architecture + 카카오페이 결제탭** | 한국 SI 의 Clean Architecture 부분 적용 | RealWorld 와 유사한 "Layered + DDD-Lite" 패턴 |

---

## 8. 신뢰도 자평

| 영역 | confidence | element_count | extraction_method | 해석 (ADR-003 §9) |
|---|---|---|---|---|
| 모듈 식별 | 0.98 | 10 | deterministic | 거의 확실 |
| 의존성 그래프 | 0.92 | 19 | pattern_matching | 신뢰 가능 |
| 순환 의존성 검출 | 0.95 | 1 | deterministic | 거의 확실 |
| 외부 의존성 | 0.95 | 0 | deterministic | 거의 확실 (0건) |
| 모듈 책임 기술 | 0.85 | 10 | llm_with_grounding | 신뢰 가능 |
| 아키텍처 스타일 | 0.85 | 1 | llm_with_grounding | 신뢰 가능 |
| 레이어 위반 판정 | 0.85 | 2 | pattern_matching | 신뢰 가능 |
| 모듈 ↔ 테이블 매핑 | 0.92 | 7 | deterministic | 신뢰 가능 |

**가중평균: 0.91**

ADR-003 §9: **신뢰 가능 (샘플 검토 권장)**.

---

## 9. 후속 phase 라우팅

### 9.1 Phase 4 5.A (도메인 비즈니스 로직)

- BC 정의 (BC-ARTICLE / BC-USER / BC-AUTH 확정)
- CIRCULAR-001 도메인 의도 검증 (`User.writeCommentToArticle()` 등)
- @Embeddable 7개 → VO/Aggregate 추출 (Phase 2 인계)
- DRIFT 4건 (Phase 2) 도메인 의도 결정

### 9.2 Phase 5 (api/ui)

- application/* RestController 9건 → OpenAPI 추출
- LV-001 (`AppArt → InfJwt`) 의 인증 흐름 명시
- (UI 미포함 — BE only PoC)

### 9.3 Phase 6 (quality)

- Phase 4 partial 6건 (output/antipatterns-partial/):
  - AP-DOMAIN-001 (Comment De Morgan 버그 — critical, F-027)
  - AP-SECURITY-001 (JWT SECRET 하드코딩 — critical)
  - AP-DOMAIN-002 (email/username unique 이중 부재 — high, DRIFT-010 격상)
  - AP-ARCH-001 (LV-001 → presentation→infrastructure)
  - AP-ARCH-002 (LV-002 → domain framework leak)
  - AP-DB-001 (DRIFT-007 FK 정책 — Phase 2 인계)
- CIRCULAR-001 → same_bc 결정으로 안티패턴 격상 안 함
- Phase 6 추가 후보 (검토): EAGER N+1 / F-017 EMBEDDABLE-COLLECTION / F-028 EQUALS-MUTABILITY

---

## 10. F-015 cross-validation 결과

Phase 1 (D 오차 50%) → Phase 2 (0%) → **Phase 3 (0%)** ✅

- 메인 9건 + sub-agent 10건 = **19건 raw fetch 100%**
- 학습 코퍼스 의존 최소화
- sub-agent 보고 = 메인 검증 일치

→ F-015 finding 의 정착 확인 ⭐

---

## 11. 신규 Finding 5건

| ID | severity | proposed_fix |
|---|---|---|
| F-022 | medium | POJO ground truth vs 실측 차이 처리 가이드 (v1.2) |
| **F-023** | **high** | Tarjan SCC + ArchUnit/Modulith 결과 vs 도메인 의도 분기 (v1.1.2 즉시) |
| F-024 | medium | Phase 1 candidate vs Phase 3 확정 차이 (5%/20% 임계) 처리 (v1.1.2 후보) |
| F-025 | medium | architecture_style enum hybrid 미지원 (v1.2) |
| F-026 | low | 5.D 0건 신뢰도 처리 (v1.2) |

→ 본 PoC #01 종료 시 v1.1.2 즉시 후보 누적: F-007/009/016/**023** 4건 (high).
