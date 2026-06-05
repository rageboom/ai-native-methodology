# tree.md — INPUT 구조 (PoC #04 mini)

> 분석 대상: `yurisldk/realworld-react-fsd` (HEAD `963b303` / 2026-04-25 push)
> 일자: 2026-05-02 (Stage 4 Day 1)

---

## 1. Top-level

```
INPUT/
├── docker-compose.yml
├── jest.config.js
├── openapi.yaml              #  ground truth (RealWorld Conduit API 1.0.0 / OpenAPI 3.0.1)
├── orval.config.ts           #  orval+Zod schema 자동 생성 (body/query/param/header/response)
├── package.json              # React 19.2 / TS 5.4 / TanStack Query 5.90 / Zod 4.3 / react-router 7.13 / MSW 2.12
├── tsconfig.json
├── webpack.config.js         #  Vite 아님 (Webpack 5.97)
├── convert-zod-mini.ts       #  Zod → Zod-mini 변환
├── .biome.json / .babelrc / .eslint*
├── README.md
└── src/
```

---

## 2. src/ FSD layer

```
src/
├── app/                                  #  Layer 1 — App (4 file)
│   ├── app-layout.ui.tsx
│   ├── app.loader.ts
│   ├── browser-router.tsx               #  react-router v7 createBrowserRouter
│   └── index.tsx                        # bootstrap
│
├── pages/                                #  Layer 2 — Pages (8 page)
│   ├── article/
│   │   ├── actions/                     # 5 action (article-delete / article-favorite-toggle / comment-create / comment-delete / profile-follow-toggle)
│   │   ├── article.loader.ts
│   │   ├── article.paths.ts
│   │   ├── article.route.ts
│   │   └── article.ui.tsx
│   ├── editor/                          # 2 action (article-create / article-update)
│   ├── home/                            # 1 action / + home.state.ts ( tab state 5번째 진실)
│   ├── login/                           # 1 action
│   ├── page-404/
│   ├── profile/                         # 2 action / + profile.state.ts
│   ├── register/                        # 1 action
│   └── settings/                        # 2 action (user-logout / user-update)
│
└── shared/                               #  Layer 3 — Shared
    ├── api/                              # 6 file (action-result / auth-fetch / auth-storage / handleApiError / queryClient / validateSchema)
    │   └── generated/                    #  .gitignore (clone 시 부재 / orval generate 산출)
    │       ├── fetch/                    # tags-split (User and Authentication / Articles / ...)
    │       └── schemas/                  #  Zod schemas (loginBody.zod 등)
    ├── lib/
    │   ├── date.ts
    │   ├── react-router/                 #  5 middleware (getErrorMessage / loadUserMiddleware / redirectIfAuthenticatedMiddleware / requireAuthMiddleware / userContext)
    │   └── test/                         # 2 file (example.test / setup)
    └── ui/                               # 5 component (async-error-card / error-messages / global-progress-bar / spinner / use-fake-progress)
```

---

## 3. FSD 사상 정합 평가 (ADR-FE-001 §FSD)

| FSD 표준 layer | 본 fork        | 정합도                                   |
| -------------- | -------------- | ---------------------------------------- |
| app            | ✅ src/app/    | 100%                                     |
| processes      | ❌ 부재        | N/A (FSD 선택적)                         |
| pages          | ✅ src/pages/  | 100%                                     |
| widgets        | ❌ 부재        | 약식 (pages 내 inline)                   |
| features       | ❌ 부재        | 약식 (pages/{X}/actions 에 흡수)         |
| entities       | ❌ 부재        | 약식 (shared/api/generated 가 부분 흡수) |
| shared         | ✅ src/shared/ | 100%                                     |

**결론**: FSD 약식 (3 layer). entities/features/widgets 는 pages 와 shared/api 에 분산 흡수. ADR-FE-001 §FSD 패턴 정합 — 단 small project 적정 변형.

---

## 4. Slice 명명 정합 (kebab-case + segment)

```
{slice-name}.{segment}.{ext}
```

- ✅ `article.ui.tsx` / `article.route.ts` / `article.loader.ts` / `article.paths.ts`
- ✅ `home.state.ts` ( slice level state)
- ✅ `actions/{action-name}.action.ts` ( 사용자 정의 segment)
- ✅ `*.ui.tsx` / `*.zod.ts` (orval 생성)

→ FSD slice/segment 명명 컨벤션 100% 정합.

---

## 5. 통계

```yaml
total_directories: 28
total_typescript_files: 64 # 49 .ts + 15 .tsx
pages_count: 8 # article / editor / home / login / page-404 / profile / register / settings
actions_count: 14 # article 5 + editor 2 + home 1 + login 1 + profile 2 + register 1 + settings 2
shared_api_files: 6 # generated/ 제외 (clone 시 부재)
shared_lib_files: 7
shared_ui_components: 5
middleware_count: 5
state_files: 2 # home.state / profile.state
loader_files: 5 # app / article / editor / home / profile / settings
route_files: 9 # 8 page + browser-router
```

---

## 6. 분석 우선순위 (mini scope 8 deliverable)

| 우선 | Slice                                                         | 활용 deliverable                                          |
| ---- | ------------------------------------------------------------- | --------------------------------------------------------- |
| 1    | `pages/login/` (login.ui + user-login.action + LoginBody.zod) | 7 ui-ux + 8 state-map + 14 form-validation + 15 type-spec |
| 2    | `pages/home/` (home.ui + home.state + home.loader)            | 7 ui-ux + 8 state-map (tab + URL params)                  |
| 3    | `pages/article/` (article.ui + 5 action)                      | 7 ui-ux + 9 visual-manifest                               |
| 4    | `shared/api/` + `openapi.yaml`                                | 14 form-validation (Zod from OpenAPI) + 15 type-spec      |
| 5    | `shared/ui/` 5 컴포넌트                                       | 7 ui-ux (component-tree) + 9 visual-manifest              |

---

**End of tree.md.**
