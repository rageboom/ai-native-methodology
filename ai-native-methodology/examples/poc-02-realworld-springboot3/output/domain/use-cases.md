# Use Cases — PoC #02 Phase 4

> 25 UC (Command 13 / Query 12) — 5 Service public method 1:1 결정적 추출
> PoC #01 25 UC 정합 ✅

---

## ArticleService (13 UC)

### Command (6)

#### UC-ARTICLE-WRITE
- **Service**: `ArticleService.write(Article, Tags)`
- **Actor**: 인증 사용자
- **Preconditions**: title 글로벌 unique (F-052 over-constraint caveat)
- **Postcondition**: Article 저장 + Tag saveAll + ArticleTag 생성
- **Anti-pattern caveat**: F-052 (title unique anti-pattern)

#### UC-ARTICLE-EDIT-TITLE
- **Service**: `ArticleService.editTitle(User, Article, title)`
- **Actor**: Article author
- **Preconditions**: `!article.isNotAuthor(requester)` + title unique
- **Anti-pattern caveat**: F-053 (titleToSlug 8 함정), F-076 (setTitle race)

#### UC-ARTICLE-EDIT-DESCRIPTION / UC-ARTICLE-EDIT-CONTENT
- **Anti-pattern caveat**: F-078 (DRY 위반 — 3 메서드 동일 패턴)

#### UC-ARTICLE-DELETE
- **Service**: `ArticleService.delete(User, Article)`
- **Anti-pattern caveat**: F-072 (Adapter multi-aggregate orchestration), F-073 (CASCADE 부재 + favorite/tag orphan)

#### UC-ARTICLE-FAVORITE / UC-ARTICLE-UNFAVORITE ★
- **Service**: `ArticleService.favorite/unfavorite(User, Article)`
- **현재 동작**: 이미 상태 시 `IllegalArgumentException`
- **Anti-pattern caveat**: **F-070 high — RFC 7231 §4.2.2 위반** (DELETE unfavorite idempotent MUST)
- **권고**: silent return + 200 OK (follow/unfollow 패턴 정합)

### Query (7)

- UC-ARTICLE-GET / UC-ARTICLE-LIST (size 0~50 cap ★) / UC-ARTICLE-LIST-AUTHENTICATED / UC-ARTICLE-FEED / UC-ARTICLE-DETAILS (anonymous + authenticated) / UC-ARTICLE-IS-FAVORITE
- **회피**: PoC #01 AP-PERFORMANCE-002 (Pageable cap) 본 PoC 회피 ✅ (ArticleFacets:21)

---

## UserService (5 UC)

#### UC-USER-SIGNUP (Command)
- **Anti-pattern caveat**: F-058 TOCTOU race-prone (existsByEmail/Username 사전 check)

#### UC-USER-LOGIN (Command)
- findByEmail + passwordEncoder.matches

#### UC-USER-UPDATE-DETAILS (Command) ★
- **Service**: `UserService.updateUserDetails(...)`
- **Anti-pattern caveat**: **F-071 high — Hexagonal port-adapter 경계 위반** (UserRepositoryAdapter:67-79 가 도메인 검증 + encryptPassword 호출)
- **권고**: UserService 가 도메인 검증 + Adapter 단순 save

#### UC-USER-GET-BY-ID / UC-USER-GET-BY-USERNAME (Query)

---

## UserRelationshipService (3 UC)

#### UC-FOLLOW (Command — RFC 7231 idempotent ✅)
- **Preconditions**: self-follow 금지 — **F-074 코드 부재** (RealWorld 묵시 위반)

#### UC-UNFOLLOW (Command — RFC 7231 idempotent ✅)

#### UC-FOLLOW-IS-FOLLOWING (Query)

---

## ArticleCommentService (4 UC)

#### UC-COMMENT-WRITE (Command)
#### UC-COMMENT-DELETE (Command)
- **Preconditions**: `!articleComment.isNotAuthor(requester)`
- **PoC #01 비재현 ★**: AP-DOMAIN-001 (De Morgan `removeCommentByUser`) 비재현 — 단순 isNotAuthor 깔끔 ✅
- **PoC #01 비재현**: F-027 (BR ≠ actual_behavior) 비재현 ✅

#### UC-COMMENT-GET / UC-COMMENT-LIST (Query)

---

## TagService (1 UC)

#### UC-TAG-LIST (Query)
- `@Cacheable(CacheName.ALL_TAGS)` Spring Cache + Caffeine
- **Anti-pattern caveat**: F-048 critical (TagJpaRepository<Tag, Integer> 타입 오류 — Phase 2)

---

## 통계

| Service | Command | Query | 합계 |
|---|---|---|---|
| ArticleService | 6 | 7 | 13 |
| UserService | 3 | 2 | 5 |
| UserRelationshipService | 2 | 1 | 3 |
| ArticleCommentService | 2 | 2 | 4 |
| TagService | 0 | 1 | 1 |
| **합계** | **13** | **13** | **25 (isFavorite 포함)** |

→ **PoC #01 25 UC 정합 ✅**

---

## Phase 5-1 (API) 인계

22 endpoint × 25 UC 매핑 — RealWorld API spec 정합. 다음 Phase 에서 결정.
