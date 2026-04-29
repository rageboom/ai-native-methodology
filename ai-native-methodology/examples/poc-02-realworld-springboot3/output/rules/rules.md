# Business Rules — PoC #02 (Phase 4)

> 14 BR / Given/When/Then 형식 (RFC 7231 idempotency 권위 인용)
> high 8 / medium 4 / low 2

---

## High (8)

### BR-USER-EMAIL-UNIQUE-001
- **Given** 시스템에 email='X' 인 User 가 이미 존재할 때
- **When** 동일 email 로 signup 요청이 들어오면
- **Then** IllegalArgumentException 발생 + DB unique 제약이 race-safe 차단
- **Race safety**: DB UQ 1중 (race-safe) / App existsBy* 1중 (race-prone TOCTOU)

### BR-USER-USERNAME-UNIQUE-001
(동일 패턴)

### BR-USER-PASSWORD-ENCRYPTED-001
- **Given** User signup / password 업데이트 시
- **When** encryptPassword 호출
- **Then** BCrypt 로 암호화된 password 저장 (plain 절대 금지)

### BR-ARTICLE-TITLE-UNIQUE-001 ⚠️ caveat
- **Given** Article 작성/수정 시
- **When** title 글로벌 unique 검증
- **Then** 이미 존재하면 IllegalArgumentException
- **F-052 over-constraint anti-pattern** — Medium/Velog/Brunch/WordPress/RealWorld spec 모두 미사용

### BR-ARTICLE-AUTHOR-EDIT-ONLY-001
- **Given** Article edit/delete 요청
- **When** requester != article.author
- **Then** isNotAuthor 검증 → IllegalArgumentException

### BR-ARTICLE-FAVORITE-NON-IDEMPOTENT-001 ★ F-070 high
- **Given** 사용자가 article 을 이미 favorite/unfavorite 상태일 때
- **When** 동일 요청이 다시 들어오면
- **Then** IllegalArgumentException 발생
- **❌ RFC 7231 §4.2.2 위반** — DELETE (unfavorite) idempotent MUST
- **권고**: silent return + 200 OK (follow/unfollow 패턴 정합)

### BR-COMMENT-AUTHOR-DELETE-ONLY-001
- **Given** ArticleComment delete 요청
- **When** requester != articleComment.author
- **Then** isNotAuthor → IllegalArgumentException
- **PoC #01 De Morgan 버그 비재현 ✅** (Article.java:86 removeCommentByUser 패턴 부재)

### BR-LOGIN-EMAIL-PASSWORD-MATCH-001
- findByEmail + passwordEncoder.matches → match 시 User / 미스 시 IllegalArgumentException

---

## Medium (4)

### BR-USER-FOLLOW-DIRECTIONAL-001
- 단방향 follow + UQ(follower, following)

### BR-USER-FOLLOW-NO-SELF-001 ⚠️ F-074
- **Given** follower == following 인 follow 요청
- **When** follow 호출
- **Then** 거부 (RealWorld 묵시) — **현재 코드 부재 anti-pattern**

### BR-ARTICLE-SLUG-UNIQUE-001
- slug 글로벌 unique (RealWorld spec 정합)

### BR-PAGINATION-SIZE-CAP-50-001 ★ 회피
- ArticleFacets:21 size 0~50 cap
- **PoC #01 AP-PERFORMANCE-002 (Pageable cap 부재) 회피 ✅**

---

## Low (2)

### BR-USER-FOLLOW-IDEMPOTENT-001 ✅ RFC 정합
- follow/unfollow 이미 상태 시 silent return
- RFC 7231 §4.2.2 idempotent ✅

### BR-PAGINATION-PAGE-ZERO-BASED-001
- 0-based + page < 0 시 IllegalArgumentException

---

## 통계

| 카테고리 | 개수 |
|---|---|
| validation | 5 |
| policy | 5 |
| authorization | 4 |
| **합계** | **14** |

| severity | 개수 |
|---|---|
| high | 8 |
| medium | 4 |
| low | 2 |

---

## 권위 인용

- RFC 7231 §4.2.2 / RFC 9110 §9.2.2 — idempotency MUST
- GitHub `PUT /user/starred` (정합) / Twitter `POST favorites/create` 2018 deprecated (안티패턴)
- Vernon IDDD §10 — Effective Aggregate Design
