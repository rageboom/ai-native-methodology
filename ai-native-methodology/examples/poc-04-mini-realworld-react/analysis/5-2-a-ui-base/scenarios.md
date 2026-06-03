# Scenarios — User Journey IR (Layer 2 Interaction)

> ADR-FE-006 명제 2 — Screen + Journey 우선 / Component 후순위.
> mini scope: 3 page (Login + Home + Article) / 14 scenario.
> 일자: 2026-05-02 (Stage 4 Day 2)

---

## SCN-LOGIN-SUCCESS

**Goal**: 기존 사용자 인증 후 settings 페이지로 redirect.

**Steps**:

1. 사용자가 `/login` 접근 ( 인증 상태면 `/settings` 자동 redirect — `redirectIfAuthenticatedMiddleware`)
2. email + password 입력 (HTML5 native required + type=email)
3. submit (POST `/login`)
4. action `userLoginAction` 실행 — `validateSchema(LoginBody, formData)`
5. Zod parse 성공 → `login(validation.data)` API 호출
6. `setToken(response.data.user.token)` (localStorage)
7. `queryClient.setQueryData(getGetCurrentUserQueryKey(), response)` ( TanStack Query cache 갱신)
8. `redirect('/settings')`

**Validation BR ( deliverable 14 자동 추출)**:

- email: required + Zod `z.email()` (LoginBody 추정 / openapi.yaml § LoginUser)
- password: required + Zod `z.string()`

**State transitions**: SM-LOGIN-FORM `idle` → `submitting` → (success) `idle` + redirect.

---

## SCN-LOGIN-FAIL-VALIDATION

**Steps**: 1~3 동일. 4 → Zod parse 실패 → `validation.errors` 반환 → `useActionData` → `<ErrorMessages>` 표시.

**State**: SM-LOGIN-FORM `idle` → `submitting` → `error` (validation).

---

## SCN-LOGIN-FAIL-AUTH

**Steps**: 1~5 동일. 5 API 401 → `handleApiError(error)` → ErrorMessages.

**State**: SM-LOGIN-FORM `idle` → `submitting` → `error` (auth).

---

## SCN-HOME-VIEW-GLOBAL

**Goal**: 글로벌 article feed 표시 (default).

**Steps**:

1. 사용자가 `/` 접근
2. `homePageLoader` 실행:
   - `parseHomeSearchParams(URL)` → Zod-mini PaginationSchema + HomeArticleFilterSchema parse
   - normalize ( 비인증 사용자 + feed=personal → feed undefined 강제)
   - normalize 결과가 입력과 다르면 `throw replace(URL)` ( URL 일관성 강제)
3. `queryClient.fetchQuery(getGetArticlesQueryOptions)` + `getGetTagsQueryOptions` 동시
4. `Suspense + Await` → `HomeArticlesList` + `Sidebar`

**Validation BR ( URL state)**:

- limit: int + ≥1 + ≤100 + default 10
- offset: int + ≥0 + ≤MAX_SAFE_INTEGER + default 0
- feed: optional 'personal' / unauth 시 강제 제거
- tag: optional non-empty string (trim)

**State**: SM-FEED-NAVIGATION `global` (default).

---

## SCN-HOME-VIEW-PERSONAL

**Steps**: 1 동일 (`/?feed=personal`). 2 → 인증 필요 (불충 시 강제 normalize 후 replace). 3 → `getGetArticlesFeedQueryOptions` ( /articles/feed 다른 endpoint).

**State**: SM-FEED-NAVIGATION `global` → `personal` (인증 시).

---

## SCN-HOME-VIEW-TAG

**Steps**: 1 동일 (`/?tag=react`). 2 → tag 우선 (feed 무시). 3 → `getGetArticlesQueryOptions({tag, limit, offset})`.

**State**: SM-FEED-NAVIGATION `global` → `tag` (transient).

---

## SCN-HOME-FAVORITE-TOGGLE

**Goal**: optimistic update — favorite 버튼 즉시 반영.

**Steps**:

1. 사용자가 article preview card 의 favorite button 클릭
2. `formData.set('operation', 'favorite' | 'unfavorite')` + `fetcher.submit({action: '/articles/:slug/favorite-toggle', method: 'post'})`
3. react-router middleware `requireAuthMiddleware` 강제 ( 인증 부재 시 401)
4. `articleFavoriteToggleAction` 실행
5. optimistic UI: `optimisticOperation = fetcher.formData?.get('operation')` → 즉시 isFavorited 갱신 + count 갱신
6. server response → `useFetcher` re-render → optimistic 해제

**Validation BR ( 신규)**: operation enum ['favorite', 'unfavorite'].

**State**: SM-FAVORITE-TOGGLE `inactive` → `pending-favorite` → `active` (성공) / `inactive` (실패 rollback).

---

## SCN-HOME-PAGINATE

**Steps**: pagination 링크 클릭 → URL searchParams `offset` 갱신 → loader 재실행 → 새 page 표시.

**State**: SM-FEED-NAVIGATION (offset 만 변경).

---

## SCN-ARTICLE-VIEW

**Goal**: 단일 article + 댓글 표시.

**Steps**:

1. `/article/:slug` 접근
2. `articlePageLoader` 실행 — `articlePromise` + `commentsPromise` 동시 fetch
3. Suspense + Await → `ArticleContent` + `CommentsList`

---

## SCN-ARTICLE-FAVORITE-TOGGLE

**Steps**: SCN-HOME-FAVORITE-TOGGLE 와 isomorphic ( 동일 패턴 / 다른 page).

**State**: SM-FAVORITE-TOGGLE (재사용).

---

## SCN-ARTICLE-FOLLOW-AUTHOR-TOGGLE

**Steps**:

1. follow 버튼 클릭
2. `formData.set('operation', 'follow' | 'unfollow')` + `formData.set('username', X)`
3. submit `/article/:slug/follow-toggle`
4. optimistic UI: isFollowing 즉시 갱신

**Validation BR**: operation enum + username non-empty.

**State**: SM-FOLLOW-TOGGLE `not-following` → `pending-follow` → `following` / rollback.

---

## SCN-ARTICLE-EDIT-NAV

**Steps**: edit 버튼 클릭 → `Link to=/editor/:slug` → editor page 이동.

**Auth requirement**: 작성자만 표시 (`isAuthor = userData?.user?.username === username`).

---

## SCN-ARTICLE-DELETE

**Steps**: delete 버튼 클릭 → `fetcher.submit(null, {action, method: 'delete'})` → server delete.

**State**: SM-DELETE `idle` → `deleting` → `idle` (server 후 article 부재 → 다른 redirect 필요 / 본 fork 에서는 명시 부재 = 잠재 finding 후보 F-FE-001).

---

## SCN-COMMENT-CREATE

**Steps**:

1. 인증 사용자 → `<CreateCommentForm>` 표시
2. textarea 입력 (HTML5 required)
3. submit POST `/article/:slug/comments`
4. action 성공 시 `resetKey` 변경 → form reset ( React key 재마운트 패턴)
5. 실패 시 `<ErrorMessages>` 표시

**Validation BR**: body required + non-empty.

**State**: SM-COMMENT-FORM `idle` → `submitting` → `idle (reset)` / `error`.

---

## SCN-COMMENT-DELETE

**Steps**: 자신의 댓글에만 표시 → `<deleteCommentFetcher.Form method=DELETE action=...>` → submit.

**Auth + Authorization**: `currentUser?.username === author.username`.

---

## Scenario 통계

```yaml
scenarios_total: 14
scenarios_per_page:
  PAGE-LOGIN: 3
  PAGE-HOME: 5
  PAGE-ARTICLE: 7 #  가장 풍부
optimistic_update_scenarios: 3 # SCN-HOME-FAVORITE-TOGGLE / SCN-ARTICLE-FAVORITE-TOGGLE / SCN-ARTICLE-FOLLOW-AUTHOR-TOGGLE
auth_required_scenarios: 7
url_state_validation_scenarios: 5 # HOME 5
form_validation_scenarios: 3 # LOGIN-SUCCESS / COMMENT-CREATE + (등록 시 LOGIN-FAIL-VALIDATION)
finding_candidates: 1 # F-FE-001 article delete 후 redirect 부재 ( Phase 6 등록)
```

---

**End of scenarios.md.**
