# tree.md — INPUT 구조 (PoC #04 full / Stage 5 Sprint 5-1)

> 분석 대상: `yurisldk/realworld-react-fsd` HEAD `963b303` (★ Stage 4 mini-PoC 와 동일 fork / ★ 산출물 재사용 ❌)
> 일자: 2026-05-02 (Stage 5 Sprint 5-1)

---

## 1. ★ Stage 4 mini vs Stage 5 full 비교

| 항목 | Stage 4 mini | Stage 5 full |
|---|---|---|
| 분석 대상 | yurisldk (동일 코드) | yurisldk (동일 코드) |
| HEAD | 963b303 | 963b303 (동일) |
| Capture 시점 | 2026-05-02 (Day 1) | 2026-05-02 (Sprint 5-1 / 새 capture) |
| Scope | 3 page (Login + Home + Article) | ★ 전체 page (8) + 전체 component |
| 산출물 재사용 | — | ★ ★ ❌ (Senior strict / 새 IR 신설) |

→ ★ ★ Stage 4 산출물 (`poc-04-mini-realworld-react/analysis/`) 와 본 워크스페이스 (`poc-04-full-realworld-react/analysis/`) 는 ★ 별도 IR.

---

## 2. Top-level (★ Stage 4 와 동일)

```
INPUT/
├── docker-compose.yml
├── jest.config.js
├── openapi.yaml              # ★ ground truth (RealWorld Conduit API 1.0.0 / OpenAPI 3.0.1)
├── orval.config.ts           # ★ orval+Zod schema 자동 생성
├── package.json              # React 19.2 / TS 5.4 / TanStack Query 5.90 / Zod 4.3 / react-router 7.13 / MSW 2.12
├── tsconfig.json
├── webpack.config.js
├── convert-zod-mini.ts
├── .biome.json / .babelrc / .eslint*
├── README.md
└── src/
```

---

## 3. src/ FSD 약식 3 layer 전체 구조

```
src/                                    # ★ 전체 64 ts/tsx
│
├── app/                                # Layer 1 — App (4 file)
│   ├── app-layout.ui.tsx
│   ├── app.loader.ts
│   ├── browser-router.tsx
│   └── index.tsx
│
├── pages/                              # Layer 2 — Pages (8 page)
│   ├── article/      (★ 가장 풍부 / 5 action / 4 segment)
│   │   ├── actions/
│   │   │   ├── article-delete.action.ts
│   │   │   ├── article-favorite-toggle.action.ts
│   │   │   ├── comment-create.action.ts
│   │   │   ├── comment-delete.action.ts
│   │   │   └── profile-follow-toggle.action.ts
│   │   ├── article.loader.ts
│   │   ├── article.paths.ts
│   │   ├── article.route.ts
│   │   └── article.ui.tsx
│   │
│   ├── editor/       (★ Article CRUD / 2 action)
│   │   ├── actions/
│   │   │   ├── article-create.action.ts
│   │   │   └── article-update.action.ts
│   │   ├── editor.loader.ts
│   │   ├── editor.route.ts
│   │   └── editor.ui.tsx
│   │
│   ├── home/         (★ feed navigation / state.ts 보유 / 1 action)
│   │   ├── actions/
│   │   │   └── article-favorite-toggle.action.ts
│   │   ├── home.loader.ts
│   │   ├── home.paths.ts
│   │   ├── home.route.ts
│   │   ├── home.state.ts             # ★ Zod-mini URL params validation
│   │   └── home.ui.tsx
│   │
│   ├── login/        (★ 1 action)
│   │   ├── actions/user-login.action.ts
│   │   ├── login.route.ts
│   │   └── login.ui.tsx
│   │
│   ├── page-404/
│   │   ├── page-404.route.ts
│   │   └── page-404.ui.tsx
│   │
│   ├── profile/      (★ state.ts 보유 / 2 action)
│   │   ├── actions/
│   │   │   ├── article-favorite-toggle.action.ts
│   │   │   └── profile-follow-toggle.action.ts
│   │   ├── profile.loader.ts
│   │   ├── profile.paths.ts
│   │   ├── profile.route.ts
│   │   ├── profile.state.ts          # ★ profile feed tab state
│   │   └── profile.ui.tsx
│   │
│   ├── register/     (★ 1 action)
│   │   ├── actions/user-register.action.ts
│   │   ├── register.route.ts
│   │   └── register.ui.tsx
│   │
│   └── settings/     (★ 2 action)
│       ├── actions/
│       │   ├── user-logout.action.ts
│       │   └── user-update.action.ts
│       ├── settings.loader.ts
│       ├── settings.paths.ts
│       ├── settings.route.ts
│       └── settings.ui.tsx
│
└── shared/                             # Layer 3 — Shared
    ├── api/                            # 6 file
    │   ├── action-result.ts
    │   ├── auth-fetch.ts              # ★ apiFetch (orval mutator)
    │   ├── auth-storage.ts            # ★ localStorage JWT (★ F-FE-003 patterns / cross-PoC isomorphic)
    │   ├── handleApiError.ts
    │   ├── queryClient.ts             # ★ TanStack Query
    │   ├── validateSchema.ts          # ★ generic SafeParseSchema (Zod 호환)
    │   └── generated/                 # ★ .gitignore (★ orval generate 산출 / clone 시 부재)
    │
    ├── lib/
    │   ├── date.ts
    │   ├── react-router/             # ★ 5 middleware
    │   │   ├── getErrorMessage.ts
    │   │   ├── loadUserMiddleware.ts
    │   │   ├── redirectIfAuthenticatedMiddleware.ts
    │   │   ├── requireAuthMiddleware.ts
    │   │   └── userContext.ts
    │   └── test/
    │       ├── example.test.ts       # ★ scope 외
    │       └── setup.ts
    │
    └── ui/                             # 5 component
        ├── async-error-card/async-error-card.ui.tsx
        ├── error-messages/error-messages.ui.tsx
        ├── global-progress-bar/
        │   ├── global-progress-bar.ui.tsx
        │   └── use-fake-progress.ts
        └── spinner/spinner.ui.tsx
```

---

## 4. 통계 (★ Stage 5 본격)

```yaml
total_directories: 28
total_typescript_files: 64    # 49 .ts + 15 .tsx
pages_count: 8
actions_count: 14             # article 5 + editor 2 + home 1 + login 1 + profile 2 + register 1 + settings 2
shared_api_files: 6           # generated/ 제외
shared_lib_files: 7
shared_ui_components: 5
middleware_count: 5
state_files: 2                # home.state + profile.state
loader_files: 5
route_files: 9                # 8 page + browser-router

★_pages_to_analyze_full:
  Stage_4_mini: ["LOGIN", "HOME", "ARTICLE"]  # 3/8
  Stage_5_full: ["LOGIN", "HOME", "ARTICLE", "EDITOR", "PROFILE", "REGISTER", "SETTINGS", "PAGE-404"]  # ★ 8/8 의무
```

---

## 5. ★ Stage 5 분석 우선순위 (★ 11 deliverable + i18n carry)

| 우선 | 작업 | Sprint |
|---|---|---|
| ★ 1 | Phase 0 (★ 본 산출 / tree + inventory + stack-detection) | 5-1 (★ ★ 본 Sprint) |
| 2 | Phase 1 (architecture) — FSD layer + dependency graph + circular | 5-3 |
| 3 | Phase 5-1 (api) — openapi.yaml ground truth + cross-link 9 endpoint → 21 endpoint 전체 | 5-2 |
| 4 | Phase 5-2-a (ui-base) — 8 page 전체 / scenarios.md 30+ SCN / component-tree | 5-2 |
| 5 | Phase 5-2-b (state) — state-map 8+ SM / 5 진실 전부 / form_state ★ 정식 | 5-2 |
| 6 | Phase 5-2-c (visual) — 8 page × 4 viewport = 32 snapshot Playwright 진짜 실행 | 5-3 |
| 7 | Phase 6 quality — a11y 전체 / form-validation 정식 / type-spec ratchet / static-security Semgrep Docker / antipatterns 통합 | 5-3 |
| 8 | V1 (drift / formal-spec-link FE 모드) + V2 (IR 4계층 ratchet 정식 0.95+ / cross-PoC patterns ≥ 3 평가) | 5-4 |
| 9 | Phase F (DEC + STATUS + INDEX + CHANGELOG + memory + commit) + ★ Stage 7 release 자격 7/7 평가 | 5-5 |
| 10 | (★ carry 시) Sprint 5-6 — 신뢰도 0.90 미달 시 carry resolve | 5-6 (★ G6 결단) |

---

**End of tree.md.**
