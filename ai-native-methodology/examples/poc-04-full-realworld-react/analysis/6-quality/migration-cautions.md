# migration-cautions.md — PoC #04 full FE 신규 시스템 구축 가이드

> ★ Stage 5 Sprint 5-3 / 본 fork 분석 후 신규 React FE 시스템 구축 시 주의 사항.
> 일자: 2026-05-02

---

## 1. ★ ★ ★ 보안 (★ 4 PoC isomorphic / 본체 격상 후보)

### JWT localStorage 패턴 ❌ 절대

★ 본 fork (yurisldk) + RealWorld 표준 + React 에코시스템 흔한 패턴이지만 ★ XSS 위험 직접.

```ts
// ❌ 절대 금지
window.localStorage.setItem('token', jwt);

// ✅ 권장 (BE 협조)
// httpOnly + Secure + SameSite=Lax cookie
// FE 는 cookie 직접 read 불가 / 브라우저 자동 전송
```

---

## 2. ★ ★ FE 폼 검증 일관성 의무

★ ★ Editor 4 input HTML5 native required 부재 = ★ ★ Stage 5 신규 finding.

```tsx
// ❌ 일관성 위반 (Editor)
<input type="text" name="title" />

// ✅ 다른 form 일관 적용 (Login/Register/Settings/CommentCreate)
<input type="text" name="title" required />
```

→ ★ 신규 시스템 = ★ ★ ★ 모든 form input 일관 적용 의무 (★ Zod + HTML5 native 양쪽).

---

## 3. ★ Optimistic update 추상화 의무

★ 3 컴포넌트 isomorphic = ★ shared/ui/ 추상화 즉시.

```tsx
// ❌ 페이지별 중복 80+ line
function HomeFavoriteButton({ article }) {
  const fetcher = useFetcher({ key: `article-favorite-toggle-${slug}` });
  // ... 동일 logic 중복
}
function FavoriteArticleButton({ favorited }) { /* 동일 */ }
function ProfileFavoriteButton({ article }) { /* 동일 */ }

// ✅ 추상화
function OptimisticToggleButton({
  itemId, isActive, count, actionPath, operations: { activate, deactivate }
}) {
  const fetcher = useFetcher({ key: `${itemId}-toggle` });
  // ... 1 곳에서 처리
}
```

---

## 4. ★ a11y root level 의무

★ html-has-lang = 모든 page isomorphic root level 위반.

```html
<!-- ❌ 본 fork -->
<html>

<!-- ✅ 의무 -->
<html lang="en">
```

→ ★ 신규 시스템 = ★ index.html template 의무 적용.

---

## 5. ★ Action flow 종결 명시 의무

★ Article delete 후 redirect 부재 = UX 문제.

```ts
// ❌ 본 fork
export async function articleDeleteAction({ params }) {
  await deleteArticle(params.slug);
  // ★ redirect 부재
}

// ✅ 의무
export async function articleDeleteAction({ params }) {
  await deleteArticle(params.slug);
  return redirect('/');
}
```

---

## 6. ★ ★ ★ FE/BE 분리 default 정합 (★ ADR-FE-004)

★ 본 fork = openapi.yaml 분리 ground truth + orval generate 자동 패턴 정합 ★ ★ ★ 100% 권장:

```
yarn generate  # ★ openapi.yaml → src/shared/api/generated/ 자동 생성
              #   - fetch hooks (TanStack React Query)
              #   - Zod schemas (★ deliverable 14 form-validation 자동 추출)
              #   - MSW handlers (★ FE only 개발 가능)
```

→ ★ 신규 시스템 = ★ ★ Contract-First (OpenAPI 3.x) + orval (또는 동등 도구) 의무.

---

## 7. ★ ★ ★ FSD 약식 vs 정통 결단 (★ ADR-FE-001)

★ 본 fork = ★ FSD 약식 3 layer (app/pages/shared) — entities/features/widgets pages 흡수.

→ ★ 신규 시스템:
- 작은 시스템 (~64 file 이하): ★ 약식 3 layer 권장 (★ 본 fork 패턴)
- 큰 시스템 (100+ file): ★ FSD 정통 7 layer 의무 (entities/features/widgets/processes 분리)

---

## 8. ★ 학습 효과 (★ Positive)

| 패턴 | 본 fork | 학습 효과 |
|---|---|---|
| ★ orval + Zod auto-gen from OpenAPI | ✅ | ★ ADR-FE-005 매개체 #4 + #13 통합 표준 |
| ★ TanStack Query 5 진실 #1 server cache | ✅ | ★ React 19 + Suspense + Await 정합 |
| ★ react-router v7 Form action + middleware | ✅ | ★ form_state + URL state 명시 분리 |
| ★ Zod-mini URL params validation | ✅ | ★ ★ 신규 패턴 (Home + Profile isomorphic) — ★ ★ deliverable 14 schema 확장 후보 |
| ★ Optimistic update via useFetcher.formData | ✅ | ★ React 19 standard pattern (단 추상화 필요) |
| ★ MSW 2.12 + orval mock | ✅ | ★ FE only 개발 + contract test 가능 |

---

**End of migration-cautions.md.**
