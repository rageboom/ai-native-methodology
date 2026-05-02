# api.md — RealWorld Conduit API 명세 (★ Stage 5 Sprint 5-2 본격)

> 분석 대상: yurisldk/realworld-react-fsd § INPUT/openapi.yaml
> 일자: 2026-05-02
> 본 명세 = OpenAPI 3.0.1 ground truth + Phase 4.5 cross-link 패턴 (★ deliverable 14 form-validation-spec + rules.json BR cross-link)

---

## 1. API meta

- **Title**: RealWorld Conduit API
- **Version**: 1.0.0
- **OpenAPI**: 3.0.1
- **Servers**: https://api.realworld.io/api
- **Tags**: Articles / Comments / Favorites / Profile / Tags / User and Authentication

---

## 2. ★ 19 endpoint 종합

| Method | Path | OperationId | Auth | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/users/login` | Login | ❌ | LoginUserRequest | UserResponse |
| POST | `/users` | CreateUser | ❌ | NewUserRequest | UserResponse |
| GET | `/user` | GetCurrentUser | ✅ | — | UserResponse |
| PUT | `/user` | UpdateCurrentUser | ✅ | UpdateUserRequest | UserResponse |
| GET | `/profiles/{username}` | GetProfileByUsername | ❌ | — | ProfileResponse |
| POST | `/profiles/{username}/follow` | FollowUserByUsername | ✅ | — | ProfileResponse |
| DELETE | `/profiles/{username}/follow` | UnfollowUserByUsername | ✅ | — | ProfileResponse |
| GET | `/articles/feed` | GetArticlesFeed | ✅ | — | MultipleArticlesResponse |
| GET | `/articles` | GetArticles | ❌ | — | MultipleArticlesResponse |
| POST | `/articles` | CreateArticle | ✅ | NewArticleRequest | SingleArticleResponse |
| GET | `/articles/{slug}` | GetArticle | ❌ | — | SingleArticleResponse |
| PUT | `/articles/{slug}` | UpdateArticle | ✅ | UpdateArticleRequest | SingleArticleResponse |
| DELETE | `/articles/{slug}` | DeleteArticle | ✅ | — | — |
| GET | `/articles/{slug}/comments` | GetArticleComments | ❌ | — | MultipleCommentsResponse |
| POST | `/articles/{slug}/comments` | CreateArticleComment | ✅ | NewCommentRequest | SingleCommentResponse |
| DELETE | `/articles/{slug}/comments/{id}` | DeleteArticleComment | ✅ | — | — |
| POST | `/articles/{slug}/favorite` | CreateArticleFavorite | ✅ | — | SingleArticleResponse |
| DELETE | `/articles/{slug}/favorite` | DeleteArticleFavorite | ✅ | — | SingleArticleResponse |
| GET | `/tags` | GetTags | ❌ | — | TagsResponse |

---

## 3. ★ 25 components.schemas

| Schema | Type | Properties | Required | Composition |
|---|---|---|---|---|
| LoginUser | object | 2 | 2 | — |
| NewUser | object | 3 | 3 | — |
| User | object | 5 | 4 | — |
| UpdateUser | object | 5 | 0 | — |
| Profile | object | 4 | 3 | — |
| Article | object | 10 | 10 | — |
| NewArticle | object | 4 | 3 | — |
| UpdateArticle | object | 4 | 0 | — |
| Comment | object | 5 | 5 | — |
| NewComment | object | 1 | 1 | — |
| GenericErrorModel | object | 1 | 1 | — |
| LoginUserRequest | object | 1 | 1 | — |
| NewUserRequest | object | 1 | 1 | — |
| UpdateUserRequest | object | 1 | 1 | — |
| NewArticleRequest | object | 1 | 1 | — |
| UpdateArticleRequest | object | 1 | 1 | — |
| NewCommentRequest | object | 1 | 1 | — |
| ArticlePreview | object | 9 | 9 | — |
| UserResponse | object | 1 | 1 | — |
| ProfileResponse | object | 1 | 1 | — |
| SingleArticleResponse | object | 1 | 1 | — |
| MultipleArticlesResponse | object | 2 | 2 | — |
| SingleCommentResponse | object | 1 | 1 | — |
| MultipleCommentsResponse | object | 1 | 1 | — |
| TagsResponse | object | 1 | 1 | — |

---

## 4. ★ Stage 5 본격 분석 통계

```yaml
total_operations: 19
operations_per_method:
  POST: 6
  GET: 7
  PUT: 2
  DELETE: 4
operations_per_tag:
  User_and_Authentication: 4
  Profile: 3
  Articles: 6
  Comments: 3
  Favorites: 2
  Tags: 1
operations_auth_required: 12
schemas_count: 25
```

---

## 5. ★ cross-link 명세 (★ Phase 4.5 패턴 — deliverable 14 + 5)

각 operation 의 cross-link 대상:
- **rules.json**: BR-FE-{operation_id}-*
- **form-validation-spec.json**: F-VAL-{schema_ref}-* (request body)
- **ui-spec.pages.api_calls**: PAGE-* § api_calls (Sprint 5-2-a 산출 시 자동 cross-link)

★ no-simulation 정합 — openapi.yaml 직접 read.

**End of api.md.**