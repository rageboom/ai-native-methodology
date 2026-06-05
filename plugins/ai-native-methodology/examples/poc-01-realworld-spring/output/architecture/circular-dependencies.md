# 순환 의존성 보고서 (Phase 3 → Phase 4 갱신)

> 생성일: 2026-04-28
> 사용자 결정 반영:
>   - **2026-04-28 (Phase 3)** CIRCULAR-001 ADR-006 default 적용 — research-decisions-6.md §5
>   - **2026-04-28 (Phase 4)** CIRCULAR-001 same_bc 결정 — research-phase4.md §1 (3원칙 승인)
> 분석 출처: 19건 import raw fetch + Phase 4 도메인 행동 검증
> 결과: **1건 발견 (low severity — same_bc 결정으로 medium → low 격하)**

---

## 0. 요약

```yaml
title: "RealWorld 모듈 순환 의존성 보고서"
analyzed_at: 2026-04-28
total_circular_dependencies: 1
severity_breakdown:
  high: 0
  medium: 0
  low: 1   # CIRCULAR-001 (same_bc 결정으로 격하)
algorithm_results:
  tarjan_scc: 1   # SCC size 2: {MOD-DOMAIN-ARTICLE, MOD-DOMAIN-USER}
  spring_modulith_verify: "would_fail"   # 자동 실패 (도구 관점 — 같은 BC 라도 모듈 단위는 순환)
  archunit_slices_beFreeOfCycles: "would_fail"
domain_intent_view: "same_bc 단일 BC-CONTENT (Phase 4 검증 — User ↔ Article 5+ cross-aggregate 행동)"
user_decisions:
  phase_3: "ADR-006 default 적용 (윤주스 2026-04-28) — bc_status=undefined + medium + decision_required + Phase 4 라우팅"
  phase_4: "same_bc 단일 BC-CONTENT 확정 (윤주스 2026-04-28 3원칙 승인) — severity medium → low / decision_required true → false"
```

---

## 1. CIRCULAR-001: domain/article ↔ domain/user 양방향 import

### 1.1 발견

```
MOD-DOMAIN-ARTICLE → MOD-DOMAIN-USER (weight 5)
  ├── Article.java imports User
  ├── ArticleService.java imports User, UserFindService, UserName
  ├── ArticleRepository.java imports User, UserName
  ├── (그외 ArticleContents.java 추정 — User 참조)

MOD-DOMAIN-USER → MOD-DOMAIN-ARTICLE (weight 4)
  ├── User.java imports Article, ArticleContents, ArticleUpdateRequest, Comment
  └── (그외 ProfileService / UserFindService 추정 — User-Article 관계 처리)
```

→ **양방향 strong coupling** (5 + 4 = 9건 cross-import).

### 1.2 알고리즘 관점 (high 가능)

| 도구 | 결과 | 근거 |
|---|---|---|
| **Tarjan SCC** | SCC size 2 | {MOD-DOMAIN-ARTICLE, MOD-DOMAIN-USER} 강결합 |
| **Spring Modulith `verify()`** | ❌ 자동 실패 | Rule #1 "No cycles on the application module level" 위반 (document-phase3.md §1) |
| **ArchUnit `slices().beFreeOfCycles()`** | ❌ 자동 실패 | 동일 |

→ 만약 RealWorld 가 Spring Modulith / ArchUnit verify 를 적용했다면 빌드 실패.

### 1.3 도메인 의도 관점 (low 가능)

RealWorld spec 의 핵심 도메인 흐름:
- User → 글 작성 (Article)
- User → 좋아요 (Article favorite)
- User → 팔로우 (다른 User)
- Article → 작성자 (User author)

**도메인 의도 분석** (Senior §5):
- Article.author = User: cross-aggregate 정상 참조 ✅
- User.writeCommentToArticle() / User.toggleFavorite(): 도메인 행동을 User 측에 둔 설계 — 양방향 import 자연 발생
- Vaughn Vernon "Effective Aggregate Design Part II" (case §1) 기준: **양방향 Aggregate 참조 = anti-pattern**
- 단 **같은 BC 안의 cross-aggregate 양방향 = 정상 가능** (Senior §5)

**RealWorld BC 분석** (Phase 4 입력):
- Option A: User 와 Article 이 **같은 BC** (예: `BC-CONDUIT-CORE`) → 정상
- Option B: User 와 Article 이 **다른 BC** (예: `BC-USER` / `BC-ARTICLE`) → 안티패턴

→ Phase 4 5.A 도메인 의도 검증 후 분기.

### 1.4 본 PoC 한정 결정 ✅ RESOLVED (Phase 3 → Phase 4 same_bc 확정)

```yaml
# Phase 3 잠정 (2026-04-28 작성 시점)
phase_3_provisional_severity: low
phase_3_provisional_status: "Phase 4 BC 정의 후 재산정"

# Phase 3 사용자 결정 (2026-04-28 윤주스)
phase_3_user_decision: "ADR-006 default 적용 (Option A)"
phase_3_user_decision_rationale: |
  BC 미정의 모놀리스의 default = 'BC 결정 보류 + 도메인 행동 검증' 가장 안전.
  ADR-006 자체가 Provisional (PoC #02 후 재검토). 미리 same/different BC 결정하면
  Phase 4 5.A 도메인 행동 검증 결과와 충돌 → 재작업 위험.

# Phase 4 사용자 결정 (2026-04-28 윤주스 3원칙 승인) ⭐
phase_4_user_decision: "same_bc 단일 BC-CONTENT 확정"
phase_4_user_decision_rationale: |
  Phase 4 5.A 도메인 행동 검증 결과:
    - User.writeArticle / writeCommentToArticle / favoriteArticle / removeArticle / removeCommentByUser / updateArticle 등 5+ cross-aggregate 행동
    - ORM cascade {PERSIST, REMOVE} (Article+Comment) — 강한 same aggregate signal
    - 같은 BC 내 도메인 협력 — 분리 BC 는 over-engineering
  근거 (3-agent 합의):
    - document-phase4: Vernon Aggregate Design Part II — 같은 BC 내 cross-aggregate 정상
    - case-phase4: 카카오페이 여신코어 DDD — small monolith → single BC
    - senior-phase4 §1 결정 매트릭스 #1 — same_bc 단일 BC-CONTENT 권고
  F-015 cross-validation 8/8 정합.

# Phase 4 결정 적용 결과 (architecture.json 갱신)
bc_status: same_bc                      # undefined → same_bc
bc_assignment_explicit: true            # false → true
documented_decision: true               # false → true (research-phase4 §1 + domain.json BC-CONTENT)
severity: low                            # medium → low (격하)
decision_required: false                 # true → false (해소)
decision_owner: domain_expert
phase_4_routing: false                   # true → false (해소)

# severity 변경 사유
severity_change_phase3_to_phase4: "medium → low"
severity_change_reason: |
  Phase 4 검증으로 bc_status=undefined → same_bc 전환.
  ADR-006 분류 표 적용 결과: same_bc + bc_assignment_explicit=true + documented_decision=true → low.
  도메인 협력 합법화 — 도구 관점 (Tarjan SCC / ArchUnit) 자동 실패는 같은 BC 모듈 분리에 따른 부산물.

# Phase 4 5.A 검증 체크리스트 (모두 ✅)
phase_4_validation_completed:
  - "✅ User 와 Article 의 BC 정의 — same_bc 단일 BC-CONTENT"
  - "✅ User.writeCommentToArticle() 등 양방향 메서드 도메인 의도 검증 — 5+ 행동 (강함)"
  - "✅ ORM cascade (REMOVE / PERSIST) 가 양방향을 강제하는가 — Article+Comment {PERSIST,REMOVE} 강함, User+followingUsers REMOVE 약함"
  - "✅ Aggregate 경계 결정 — User Aggregate / Article Aggregate (Comment 흡수) / Tag Aggregate (약함). 단일 BC-CONTENT 내 3 Aggregate."

# 관련 산출물
research_ref:
  phase_3: ".claude/researches/research-decisions-6.md §5"
  phase_4: ".claude/researches/research-phase4.md §1 결정 #1 + §6 액션 A1"
domain_artifact: "output/domain/domain.json bounded_contexts[BC-CONTENT]"
```

---

## 2. F-023 신규 finding 등록 사유

본 보고서 작성 중 명세 빈틈 발현:

> **F-023: Tarjan SCC + ArchUnit/Modulith 알고리즘 결과 vs 도메인 의도 분기 가이드 부재**

명세 §3.1 (Phase 3 처리):
> "순환 의존성: Tarjan SCC 알고리즘"

→ 알고리즘 적용 결과만 명시. 도메인 의도 분기 (BC 같음 / 다름) 가이드 부재.

본 PoC 자체 결정 (low + decision_required + Phase 4 라우팅) 으로 진행. v1.1.2 즉시 후보 (high severity).

---

## 3. Phase 4 5.A 라우팅

Phase 4 진입 시 다음 검증 필수:

```
□ User 와 Article 의 BC 정의 (같은 BC vs 다른 BC)
□ User.writeCommentToArticle() 등 양방향 메서드의 도메인 의도 검증
□ ORM cascade (REMOVE / PERSIST) 가 양방향을 강제하는가
□ Aggregate 경계 결정 (Article 이 User 의 일부 vs 독립 Aggregate Root)
```

→ Phase 4 결과로 본 보고서 §1.4 의 final_severity_decision 갱신.

---

## 4. Phase 6 라우팅 ✅ 결정 완료 (Phase 4 same_bc 결정)

| 시나리오 | Phase 6 안티패턴 격상 | 본 PoC 적용 |
|---|---|---|
| **같은 BC (정상) — 본 PoC** | 격상 안 함. 정합성 보고서 메모로 종결. | ✅ **채택** |
| 다른 BC, 의도 있음 | medium 안티패턴 (AP-ARCH-CIRCULAR-INTENTIONAL-001) | — |
| 다른 BC, 의도 없음 | high 안티패턴 (AP-ARCH-CIRCULAR-DOMAIN-001) | — |

→ CIRCULAR-001 은 Phase 6 antipatterns.json 에 **격상 안 함**. domain.json BC-CONTENT 단일 BC 로 합법화.

---

## 5. 일반 권장 사항 (사내 적용 시)

본 PoC RealWorld 학습용 spec 한정 결정. 사내 적용 시:

1. **Spring Modulith / ArchUnit verify 도입** — 의존성 역행 자동 차단
2. **BC 명시적 정의** — `package-info.java` 또는 module descriptor 활용
3. **양방향 의존 발견 즉시 리팩토링** — 한 쪽이 도메인 행동 (Service / Domain Event) 으로 빠지는 패턴
4. **Vaughn Vernon "Effective Aggregate Design"** 참조 (case §1)
5. **카카오뱅크 Spring Modulith 도입 사례** (case §2) — Modulith + Hexagonal + Modular Monolith 합성

---

## 6. 자평 신뢰도

본 보고서 신뢰도: **0.92** (Phase 3 통합 0.91 + 양방향 import 19건 raw fetch 검증).

ADR-003 §9 해석: **신뢰 가능 (샘플 검토 권장)**.

한계:
- BC 미정의 (RealWorld spec) — 분기 결정 보류
- 일부 import 추정 (E) — 19건 sampling 외
- Phase 4 결과 의존 — final_severity_decision 미확정

---

## 7. 결론

**RealWorld 의 domain/article ↔ domain/user 양방향 import 는 알고리즘 관점 순환 의존성**. 도메인 의도 (BC 같음/다름) 에 따라 정상/안티패턴 분기 — Phase 4 결정 후 재산정.

본 PoC #01 결정 (윤주스 2026-04-28): **ADR-006 default 적용** — bc_status=undefined + **medium severity** + decision_required + Phase 4 라우팅.

명세 빈틈 (F-023): 알고리즘 결과 vs 도메인 의도 분기 가이드 부재 → **v1.1.2 closed** (phase-3-arch.md §3.1.1 + ADR-006 + architecture.schema.json `circular_dependencies[]` 보강).
