# 도메인 모델 — PoC #01 RealWorld Spring Boot (Phase 4)

> **방법론**: AI-Native v1.1.2
> **작성일**: 2026-04-28
> **신뢰도**: 0.83 (5.A 가중)
> **스키마**: `schemas/domain.schema.json`
> **CIRCULAR-001 결정**: `bc_status=same_bc` 단일 BC-CONTENT (윤주스 2026-04-28)

---

## 1. Bounded Context 결정

### 1.1 BC-CONTENT (단일 통합 BC)

**구성**: User + Article + Comment + Tag + Profile + 7개 @Embeddable VO

**근거**:
- CIRCULAR-001 검증 결과 — User ↔ Article 양방향 협력 강함
  - `User.writeArticle / writeCommentToArticle / favoriteArticle / removeArticle / removeCommentByUser / updateArticle / afterUserFavoritesArticle / updateFavoriteByUser`
  - 5+ cross-aggregate 행동 → 같은 BC 내 협력 (`same_bc`)
- 카카오페이 여신코어 DDD 사례, Vernon Aggregate Design (Part I §2)
- 작은 도메인의 monolith 에서 User/Article 분리 BC 는 over-engineering (senior 권고)

**Aggregate**:

| Root | 멤버 | 트랜잭션 경계 | cascade signal |
|---|---|---|---|
| **User** | Email, Password, Profile, UserName, Image | strong | followingUsers REMOVE — 약한 same aggregate (Vernon No Cascade 위반 후보) |
| **Article** | ArticleContents, ArticleTitle, Comment, Tag | strong | Comment {PERSIST,REMOVE} = same aggregate (강함). userFavorited PERSIST = 위반 후보 |
| **Tag** | (없음) | eventual | reference data 성격 — 약한 Aggregate |

> **Aggregate Root 후보 주의**: Comment 도 `JpaRepository<Comment, Long>` 보유 → 기술적 Root. 단 Article.removeCommentByUser 만이 정식 진입점 → 사실상 Article Aggregate 의 일부 운영. v1.2.0 single-vs-multi root 가이드 보강 후보 (F-030 deferred).

### 1.2 BC-AUTH (cross-cutting)

**구성**: UserJWTPayload VO + HmacSHA256JWTService

**특성**:
- 영속성 0건 — JWT 토큰만 처리
- LV-001 발현 — `application/article/ArticleRestController` 가 `UserJWTPayload` 직접 import (Hexagonal 부정 핵심 증거)
- 매직 넘버 3건 — JWT 만료 (2시간) / SECRET ("SOME_SIGNATURE_SECRET" 21byte) / CORS origins

---

## 2. Aggregate 다이어그램 (요약)

```
BC-CONTENT
├── User (Aggregate Root)
│   ├── @Embedded Email
│   ├── @Embedded Password
│   └── @Embedded Profile
│         ├── @Embedded UserName
│         └── @Embedded Image
│
├── Article (Aggregate Root)
│   ├── @Embedded ArticleContents
│   │     ├── @Embedded ArticleTitle
│   │     └── @ManyToMany Tag (collection in @Embeddable — F-017)
│   ├── @OneToMany Comment {PERSIST, REMOVE}
│   └── @ManyToMany userFavorited (Set<User> PERSIST)
│
└── Tag (약한 Aggregate Root)

BC-AUTH (cross-cutting)
└── UserJWTPayload (VO) — 영속성 없음
```

---

## 3. Use Case ~ 25개 (Service public method 1:1)

### 3.1 Command (11개)

| UC ID | 이름 | API | Actor |
|---|---|---|---|
| UC-CONTENT-USER-SIGNUP | 회원가입 | POST /users | Anonymous |
| UC-CONTENT-USER-LOGIN | 로그인 | POST /users/login | Anonymous |
| UC-CONTENT-USER-UPDATE | 사용자 정보 수정 | PUT /user | Authenticated |
| UC-CONTENT-PROFILE-FOLLOW | 팔로우 | POST /profiles/{u}/follow | Authenticated |
| UC-CONTENT-PROFILE-UNFOLLOW | 언팔로우 | DELETE /profiles/{u}/follow | Authenticated |
| UC-CONTENT-ARTICLE-CREATE | 글 작성 | POST /articles | Authenticated |
| UC-CONTENT-ARTICLE-UPDATE | 글 수정 | PUT /articles/{slug} | 작성자 |
| UC-CONTENT-ARTICLE-DELETE | 글 삭제 | DELETE /articles/{slug} | 작성자 |
| UC-CONTENT-ARTICLE-FAVORITE | 글 즐겨찾기 등록 | POST /articles/{slug}/favorite | Authenticated |
| UC-CONTENT-ARTICLE-UNFAVORITE | 글 즐겨찾기 해제 | DELETE /articles/{slug}/favorite | Authenticated |
| UC-CONTENT-COMMENT-CREATE | 댓글 작성 | POST /articles/{slug}/comments | Authenticated |
| UC-CONTENT-COMMENT-DELETE | 댓글 삭제 | DELETE /articles/{slug}/comments/{id} | 의도: 작성자\|article 작성자, 동작: 양쪽 모두 충족 시만 (F-027 버그) |

### 3.2 Query (14개)

| UC ID | 이름 | API |
|---|---|---|
| UC-CONTENT-USER-FIND-BY-ID | 사용자 조회 (ID) | (internal) |
| UC-CONTENT-USER-FIND-BY-USERNAME | 사용자 조회 (이름) | (internal) |
| UC-CONTENT-PROFILE-VIEW | 프로필 조회 | GET /profiles/{u} |
| UC-CONTENT-ARTICLE-LIST | 전역 글 목록 | GET /articles |
| UC-CONTENT-ARTICLE-FEED | 내 피드 | GET /articles/feed |
| UC-CONTENT-ARTICLE-LIST-BY-FAVORITED | 사용자 즐겨찾은 글 | GET /articles?favorited= |
| UC-CONTENT-ARTICLE-LIST-BY-AUTHOR | 작성자 별 글 | GET /articles?author= |
| UC-CONTENT-ARTICLE-LIST-BY-TAG | 태그 별 글 | GET /articles?tag= |
| UC-CONTENT-ARTICLE-VIEW | 글 단건 조회 | GET /articles/{slug} |
| UC-CONTENT-COMMENT-LIST | 댓글 목록 | GET /articles/{slug}/comments |
| UC-CONTENT-COMMENT-LIST-BY-USER | 사용자별 댓글 목록 | (internal) |
| UC-CONTENT-TAG-LIST | 전역 태그 목록 | GET /tags |

> **CQRS kind 보조 메모**: domain.json 의 `_kind: command|query` 필드. 명세 보강 후보 — F-032 deferred.

---

## 4. Phase 4 4영역 적용 결과

| 영역 | 상태 | 산출 |
|---|---|---|
| **5.A db_logic** | ✅ completed | BR 11 / UC 25 / VO 7 / Aggregate 3 |
| **5.B fe_logic** | ❌ skipped | RealWorld BE only — F-026/F-029 발현 |
| **5.C config_policy** | ⚠️ sparse | application.properties 8 lines, JWT 매직 넘버 3 → BR 2 + AP critical |
| **5.D external_dep** | ❌ zero | build.gradle 외부 SDK 0건 — F-026 발현 |

> **신뢰도 가중 조정**: 5.B/5.D 부재로 평균 0.83 (5.A 11항 + 5.C 2항 가중). 명세 §6 평균 ~0.70 가이드 미달 → F-029 발현.

---

## 5. CIRCULAR-001 same_bc 결정 영향

| 측면 | Phase 3 (ADR-006 default) | Phase 4 (same_bc 결정 후) |
|---|---|---|
| `bc_status` | undefined | **same_bc** |
| `severity` | medium (보수적 default) | **low** |
| `decision_required` | true | **false** (해소) |
| `phase_4_routing` | true | **false** |
| `bc_assignment_explicit` | false | **true** (도메인 행동 검증 완료) |
| `documented_decision` | false | **true** (research-phase4.md §1) |

**근거**: User ↔ Article 5+ cross-aggregate 행동 + Vernon "Aggregate per Bounded Context" + 카카오페이 여신코어 DDD 사례 (small monolith → single BC).

---

## 6. DRIFT 4건 + ARCH-STYLE 6건 결정 후속 처리

| 결정 ID | Phase 4 산출 |
|---|---|
| DRIFT-002 (단방향) | BR-USER-FOLLOW-DIRECTIONAL-001 + Aggregate User.followingUsers 단방향 표현 |
| DRIFT-003 (권장만) | 도메인 영향 0 — recommendations[REC-001] 유지 |
| DRIFT-007 (NO ACTION) | AP-DB-CASCADE-MISSING-001 (antipatterns-partial) |
| **DRIFT-010 (Phase 4 검증)** | **격상**: BR-USER-EMAIL-UNIQUE-001 + AP-VALIDATION-MISSING-EMAIL-UNIQUE-001 (App+DB 이중 부재 → high) |
| CIRCULAR-001 (ADR-006 → same_bc) | 단일 BC-CONTENT — Aggregate 3개 (User/Article/Tag) |
| ARCH-STYLE (Layered+Spring-DDD-Lite) | LV-001 → AP-ARCH-LAYER-VIOLATION-001 / LV-002 → AP-DOMAIN-FRAMEWORK-LEAK-001 강제 등록 |

---

## 7. 신규 발견 (Phase 4 신규 finding)

| ID | severity | 처분 | 사유 |
|---|---|---|---|
| F-027 | medium | promoted (v1.2.0) | "잠재 버그 발견 시 처리 가이드" 부재 (Comment De Morgan 버그 처분 시 BR vs actual_behavior 분리 가이드 필요) |
| F-028 | low | deferred | User.equals/hashCode mutable email 의존 — Phase 4 범위 외 (운영 모니터링 후 결정) |
| F-029 | medium | promoted (v1.2.0) | 4영역 중 N영역 부재 시 신뢰도 가중치 재계산 가이드 부재 (5.B/5.D 부재 케이스) |
| F-030 후보 | low | deferred | cascade 매트릭스 4단계 분류 (document A1) — domain.schema.json `aggregates[].cascade_signal` 보강 |
| F-031 후보 | low | deferred | ADR-004 strategic 4 항목 implicit 발현 가이드 부재 |
| F-032 후보 | low | deferred | "Service method = UC 1개" + CQRS kind 보조 필드 명세 부재 |
| F-033 후보 | low | deferred | F-017 본 PoC 발현 데이터 (PoC #02/#03 후 v1.2.0 합산) |

---

## 8. 한계 (F-029 발현)

- **5.B 부재**: BE only — FE 검증 가이드 미적용
- **5.D 0건**: 외부 의존성 없음 — 통합 테스트 부재 신뢰도 영향
- **5.C 빈약**: application.properties 8 lines 만 — 본격 운영 환경 다름
- **신뢰도 평균 0.83 (명세 가이드 ~0.70 초과)**: 5.A 가중 (11/13 BR) → 단일 PoC 과적합 회피 §8.1 적용 권장 (PoC #02 후 v1.2.0 격상)

---

## 9. 참조

- 산출물: `domain.json` / `domain.mermaid` / `use-cases.md` / `ubiquitous-language.md`
- 입력: `.claude/researches/research-phase4.md` (메인 통합) + 3 sub-agent
- 결정: `output/architecture/architecture.json` (CIRCULAR-001 / ARCH-STYLE) + `output/db/schema.json` (DRIFT 4건)
- 명세: `methodology-spec/workflow/phase-4-business-logic.md`, `docs/adr/ADR-004-DDD-Lite-강도.md`, `docs/adr/ADR-006-순환의존성-처리-default.md`
