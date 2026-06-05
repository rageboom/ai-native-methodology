# Use Case 카탈로그 — PoC #01 RealWorld (Phase 4)

> **추출 규칙**: Service public method 1:1 = UC 1개 (document-phase4 §4 토픽 4 표준)
> **CQRS 분류**: Command (write/state-change) / Query (read-only)
> **총 25개**: Command 11 / Query 14
> **참조**: `domain.json` `bounded_contexts[].use_cases`

---

## 1. Command (11개)

### UC-CONTENT-USER-SIGNUP — 회원가입

- **Actor**: Anonymous
- **API**: `POST /users`
- **Service**: `UserService.signUp()`
- **선행조건**: email/username unique (의도) — 구현 부재 (DRIFT-010)
- **사후조건**: users row 생성 + JWT 반환
- **관련 BR**: BR-USER-EMAIL-UNIQUE-001, BR-USER-USERNAME-UNIQUE-001, BR-AUTH-PASSWORD-BCRYPT-001
- **관련 Aggregate**: User

### UC-CONTENT-USER-LOGIN — 로그인

- **Actor**: Anonymous
- **API**: `POST /users/login`
- **Service**: `UserService.login()` (실제 SecurityFilter + UsernamePasswordAuthenticationToken)
- **사후조건**: JWT 반환 (HmacSHA256, 2시간)
- **관련 BR**: BR-AUTH-PASSWORD-BCRYPT-001, BR-AUTH-STATELESS-001, BR-AUTH-JWT-EXPIRE-001

### UC-CONTENT-USER-UPDATE — 사용자 정보 수정

- **Actor**: Authenticated
- **API**: `PUT /user`
- **Service**: `UserService.updateUser()`
- **변경 가능 필드**: email / password / profile (UserName / Image / bio)

### UC-CONTENT-PROFILE-FOLLOW — 팔로우

- **Actor**: Authenticated
- **API**: `POST /profiles/{username}/follow`
- **Service**: `ProfileService.followAndViewProfile()` → `User.followUser()`
- **불변식**: 단방향 (DRIFT-002), self-follow 금지 (BR-USER-FOLLOW-NO-SELF-001 — 코드 미명시)

### UC-CONTENT-PROFILE-UNFOLLOW — 언팔로우

- **Actor**: Authenticated
- **API**: `DELETE /profiles/{username}/follow`
- **Service**: `ProfileService.unfollowAndViewProfile()`

### UC-CONTENT-ARTICLE-CREATE — 글 작성

- **Actor**: Authenticated
- **API**: `POST /articles`
- **Service**: `ArticleService.createNewArticle()` → `User.writeArticle()` (cross-aggregate factory)
- **불변식**: author = 본인, slug unique per author (DRIFT-003 권장)
- **관련 BR**: BR-DOMAIN-AUDITING-001 (@CreatedDate)

### UC-CONTENT-ARTICLE-UPDATE — 글 수정

- **Actor**: 작성자 (Authenticated User where User.id == Article.author.id)
- **API**: `PUT /articles/{slug}`
- **Service**: `ArticleService.updateArticle()` → `User.updateArticle()` 권한 체크
- **관련 BR**: BR-ARTICLE-AUTHOR-ONLY-EDIT-001

### UC-CONTENT-ARTICLE-DELETE — 글 삭제

- **Actor**: 작성자
- **API**: `DELETE /articles/{slug}`
- **Service**: `ArticleService.deleteArticleBySlug()`
- **관련 BR**: BR-ARTICLE-AUTHOR-ONLY-DELETE-001

### UC-CONTENT-ARTICLE-FAVORITE — 글 즐겨찾기 등록

- **Actor**: Authenticated
- **API**: `POST /articles/{slug}/favorite`
- **Service**: `ArticleService.favoriteArticle()` → `User.favoriteArticle()` + `Article.afterUserFavoritesArticle()` (이중 갱신)

### UC-CONTENT-ARTICLE-UNFAVORITE — 글 즐겨찾기 해제

- **Actor**: Authenticated
- **API**: `DELETE /articles/{slug}/favorite`
- **Service**: `ArticleService.unfavoriteArticle()` → `User.unfavoriteArticle()`

### UC-CONTENT-COMMENT-CREATE — 댓글 작성

- **Actor**: Authenticated
- **API**: `POST /articles/{slug}/comments`
- **Service**: `CommentService.createComment()` → `User.writeCommentToArticle()` (cross-aggregate)
- **cascade**: Article 측 `comments` 에 추가 — `cascade=PERSIST` (강한 same aggregate signal)

### UC-CONTENT-COMMENT-DELETE — 댓글 삭제 ⚠️ F-027 잠재 버그

- **Actor (의도)**: 작성자 OR article 작성자
- **Actor (실제 동작)**: 작성자 AND article 작성자 (둘 다 충족 시만 통과 — De Morgan 변환)
- **API**: `DELETE /articles/{slug}/comments/{id}`
- **Service**: `CommentService.deleteCommentById()` → `User.removeCommentByUser()` → `Article.removeCommentByUser()`
- **버그 위치**: `domain/article/Article.java:86`
  ```java
  if (!user.equals(author) || !user.equals(commentsToDelete.getAuthor()))
      throw new IllegalAccessError(...);
  ```
- **De Morgan**: `!A || !B` ≡ `!(A && B)` → "둘 다 작성자여야 통과" (RealWorld spec 'OR' 와 불일치)
- **관련 BR**: BR-COMMENT-AUTHOR-OR-ARTICLE-OWNER-DELETE-001 (의도)
- **관련 AP**: AP-DOMAIN-LOGIC-BUG-001 (critical)
- **신규 finding**: F-027 (잠재 버그 처리 가이드 부재)

---

## 2. Query (14개)

### UC-CONTENT-USER-FIND-BY-ID — 사용자 조회 (ID)

- **Actor**: System (JWT 검증 후 컨텍스트 로드)
- **Service**: `UserService.findById()`

### UC-CONTENT-USER-FIND-BY-USERNAME — 사용자 조회 (이름)

- **Service**: `UserService.findByUsername()`

### UC-CONTENT-PROFILE-VIEW — 프로필 조회

- **Actor**: Anonymous|Authenticated
- **API**: `GET /profiles/{username}`
- **Service**: `ProfileService.viewProfile()` (×2 — 인증 여부에 따라 viewer following 계산)

### UC-CONTENT-ARTICLE-LIST — 전역 글 목록

- **Actor**: Anonymous|Authenticated
- **API**: `GET /articles?tag=&author=&favorited=&limit=&offset=`
- **Service**: `ArticleService.getArticles()`

### UC-CONTENT-ARTICLE-FEED — 내 피드

- **Actor**: Authenticated
- **API**: `GET /articles/feed?limit=&offset=`
- **Service**: `ArticleService.getFeedByUserId()`

### UC-CONTENT-ARTICLE-LIST-BY-FAVORITED — 사용자 즐겨찾은 글

- **Service**: `ArticleService.getArticleFavoritedByUsername()`

### UC-CONTENT-ARTICLE-LIST-BY-AUTHOR — 작성자 별 글

- **Service**: `ArticleService.getArticlesByAuthorName()`

### UC-CONTENT-ARTICLE-LIST-BY-TAG — 태그 별 글

- **Service**: `ArticleService.getArticlesByTag()`

### UC-CONTENT-ARTICLE-VIEW — 글 단건 조회

- **API**: `GET /articles/{slug}`
- **Service**: `ArticleService.getArticleBySlug()`

### UC-CONTENT-COMMENT-LIST — 댓글 목록

- **API**: `GET /articles/{slug}/comments`
- **Service**: `CommentService.getComments()` (×2)

### UC-CONTENT-COMMENT-LIST-BY-USER — 사용자별 댓글 목록

- **Actor**: System (internal)
- **Service**: `CommentService.getComments()` (overload)

### UC-CONTENT-TAG-LIST — 전역 태그 목록

- **API**: `GET /tags`
- **Service**: `TagService.findAll()`

---

## 3. Service ↔ UC 매핑 통계

| Service | public methods | UC 추정 |
|---|---|---|
| UserService | 5 | 5 |
| ArticleService | 11 | 11 |
| ProfileService | 4 | 4 (follow/unfollow + viewProfile×2) |
| CommentService | 4 | 4 |
| TagService | 1 (+ internal reload) | 1 |
| **합계** | **25** | **25** |

---

## 4. CQRS 분포 — F-032 deferred 후보

```
Command 11 / Query 14 = 0.79 ratio (read-heavy)
```

- 명세 보강 후보: `domain.schema.json use_cases[].kind: command | query` 보조 필드 (F-032)
- 본 PoC 에서는 `_kind` prefixed (informal) 으로만 메모

---

## 5. 한계

- **5.B FE 부재**: UI 흐름 (form / wizard / multi-page) 검증 불가 → UC 의 step / postcondition 추출 한계
- **5.D 외부 의존성 0건**: integration UC (외부 API 호출, webhook 등) 0개
- **Comment 권한 버그**: 명백한 의도/구현 불일치 (F-027) — 사내 적용 시 즉시 수정 필요
