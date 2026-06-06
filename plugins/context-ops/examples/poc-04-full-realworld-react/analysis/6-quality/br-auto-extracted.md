# br-auto-extracted.md

> deliverable 14 form-validation-spec.json → rules.json fe_validation BR 자동 등록 입증
> 일자: 2026-05-02 (Stage 4 Day 3)

---

**총 77 BR 자동 추출** (OpenAPI 67 + Zod-mini URL 10)

## 1. OpenAPI → Zod (orval) BR (ADR-FE-005 매개체 #4 + #13)

- **BR-FE-LoginUser-email** — email (string) [REQUIRED]
- **BR-FE-LoginUser-password** — password (string) [REQUIRED]
- **BR-FE-NewUser-username** — username (string) [REQUIRED]
- **BR-FE-NewUser-email** — email (string) [REQUIRED]
- **BR-FE-NewUser-password** — password (string) [REQUIRED]
- **BR-FE-User-email** — email (string) [REQUIRED]
- **BR-FE-User-username** — username (string) [REQUIRED]
- **BR-FE-User-bio** — bio (string) — nullable
- **BR-FE-User-image** — image (string) [REQUIRED]
- **BR-FE-User-token** — token (string) [REQUIRED]
- **BR-FE-UpdateUser-email** — email (string)
- **BR-FE-UpdateUser-password** — password (string)
- **BR-FE-UpdateUser-username** — username (string)
- **BR-FE-UpdateUser-bio** — bio (string)
- **BR-FE-UpdateUser-image** — image (string)
- **BR-FE-Profile-username** — username (string) [REQUIRED]
- **BR-FE-Profile-bio** — bio (string) — nullable
- **BR-FE-Profile-image** — image (string) [REQUIRED]
- **BR-FE-Profile-following** — following (boolean) [REQUIRED]
- **BR-FE-Article-slug** — slug (string) [REQUIRED]
- **BR-FE-Article-title** — title (string) [REQUIRED]
- **BR-FE-Article-description** — description (string) [REQUIRED]
- **BR-FE-Article-body** — body (string) [REQUIRED]
- **BR-FE-Article-tagList** — tagList (array) [REQUIRED]
- **BR-FE-Article-createdAt** — createdAt (string) [REQUIRED]
- **BR-FE-Article-updatedAt** — updatedAt (string) [REQUIRED]
- **BR-FE-Article-favorited** — favorited (boolean) [REQUIRED]
- **BR-FE-Article-favoritesCount** — favoritesCount (integer) [REQUIRED]
- **BR-FE-Article-author** — author (unknown) [REQUIRED]
- **BR-FE-NewArticle-title** — title (string) [REQUIRED]

(... 37 more)

## 2. Zod-mini URL params BR (신규 패턴 — form 외 URL state validation)

- **BR-FE-URL-offset** — offset — int / min=0 / max=Number.MAX_SAFE_INTEGER
- **BR-FE-URL-limit** — limit — int / max=MAX_LIMIT / min=1
- **BR-FE-URL-nonemptystring** — nonemptystring — min_length=1 / trim
- **BR-FE-URL-pagination** — pagination — default=DEFAULT_LIMIT
- **BR-FE-URL-homearticlefilter** — homearticlefilter — default=undefined / enum / optional
- **BR-FE-URL-offset** — offset — int / min=0 / max=Number.MAX_SAFE_INTEGER
- **BR-FE-URL-limit** — limit — int / max=MAX_LIMIT / min=1
- **BR-FE-URL-nonemptystring** — nonemptystring — min_length=1 / trim
- **BR-FE-URL-pagination** — pagination — default=DEFAULT_LIMIT
- **BR-FE-URL-profilearticlefilter** — profilearticlefilter — default=undefined / optional

## 3. HTML5 native BR (form-validation fallback)

- **BR-FE-HTML5-PAGE-LOGIN-email** — email (input) — required / type=email / email
- **BR-FE-HTML5-PAGE-LOGIN-password** — password (input) — required / type=password
- **BR-FE-HTML5-PAGE-REGISTER-username** — username (input) — required / type=text
- **BR-FE-HTML5-PAGE-REGISTER-email** — email (input) — required / type=email / email
- **BR-FE-HTML5-PAGE-REGISTER-password** — password (input) — required / type=password
- **BR-FE-HTML5-PAGE-SETTINGS-image** — image (input) — type=url / url
- **BR-FE-HTML5-PAGE-SETTINGS-username** — username (input) — required / type=text
- **BR-FE-HTML5-PAGE-SETTINGS-email** — email (input) — required / type=email / email
- **BR-FE-HTML5-PAGE-SETTINGS-password** — password (input) — type=password
- **BR-FE-HTML5-PAGE-EDITOR-title** — title (input) — type=text
- **BR-FE-HTML5-PAGE-EDITOR-description** — description (input) — type=text
- **BR-FE-HTML5-PAGE-EDITOR-tagList** — tagList (input) — type=text
- **BR-FE-HTML5-PAGE-ARTICLE-body** — body (textarea) — required

---

deliverable 14 § rules.json fe_validation BR 자동 등록 절차 1회 입증 (Stage 7-pre 신설 deliverable 검증).
