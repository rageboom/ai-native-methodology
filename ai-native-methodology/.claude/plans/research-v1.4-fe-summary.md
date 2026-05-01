# Research 진단 보고서 — v1.4 FE 트랙 Stage 1 종결

> **작성**: 2026-05-01 / Stage 1 종결 시점
> **선행**: research × 3 (`research-official-v1.4-fe.md` + `research-industry-v1.4-fe.md` + `research-senior-v1.4-fe.md`)
> **목적**: 3 research 통합 + 본체 빈틈 진단 + Stage 2 Gate 1/2/3 사용자 의사결정 입력 자료

---

## 1. 3 에이전트 일치점 (강한 합의 — Stage 2 결단 시 즉시 채택 가능)

| 항목 | 공식문서 | 산업 | Senior | 결론 |
|---|---|---|---|---|
| **격상 시나리오** | Scenario B | Scenario B | Scenario B-Lite (단계 분할) | ★ **Scenario B-Lite 채택** (Senior 권고 + 산업/공식 합의 정합) |
| **legacy cover** | jQuery+MPA+JSP cover ★★★ | JSP+jQuery P0 우선 | Tier 1~4 fallback | ★ legacy cover **v1.4 포함** 합의 |
| **시각 산출 (visible)** | visible-manifest 신설 | CSF parameter 자체 manifest | 하이브리드 (manifest+snapshot) | ★ visual-manifest deliverable 신설 합의 |
| **분산 상태 (state-map)** | SCXML 채택 | XState SCXML 호환 | 5 진실 + state-map.json 신설 | ★ state-map deliverable 신설 + SCXML 채택 합의 |
| **권위 매개체 채택** | 12종 표 | Tier 1 5종 (CSF/Chromatic/Pact+MSW/axe/DTCG) | ★★★ 6종 (CEM/SCXML/DTCG/MSW+OpenAPI/axe/.d.ts) | ★ 권위 매개체 다중 채택 합의 (구체 선택은 G1-4) |
| **a11y + i18n v1.4 포함** | ✅ | ✅ | ✅ | ★ v1.4 포함 합의 |
| **본 방법론 포지셔닝** | W3C 표준 매개체 채택 | Thoughtworks CodeConcise + 산업 표준 | 사상 정합 + 본체 격상 우선 | ★ "AI-native + 산업 표준 매개체 + 한 방향 추출기" 정체성 강화 합의 |
| **mini-PoC 1주 fail-fast** | (Stage 4) | RealWorld FE + 사내 legacy 양 끝 | 2 진실 + 2 viewport 보강 | ★ Stage 4 mini-PoC 1주 cap 합의 |
| **PoC #04 대상** | RealWorld modern + 별도 mini legacy | RealWorld + 사내 legacy 1건 | RealWorld FE only (modern) + adoption 분리 트랙 | ⚠️ **차이** — Senior 가 "사내 적용은 v1.4.0 release 후" 보수, 공식/산업 은 동시 cover 권고 |

---

## 2. 3 에이전트 차이점 (Stage 2 Gate 결단 필요)

### 2.1 비기능 v1.4 포함 범위 (Gate 2 결단)

| 차원 | 공식문서 | 산업 | Senior | Senior 종합 권고 |
|---|---|---|---|---|
| a11y (WCAG 2.1 AA + axe-core EARL) | v1.4 ✅ | v1.4 ✅ (Tier 1) | v1.4 ✅ | **v1.4 포함** |
| i18n (ICU MF1 / UTS#35 MF2) | v1.4 ✅ | v1.4 ✅ (Tier 2) | v1.4 ✅ | **v1.4 포함** |
| 성능 (Web Vitals + Lighthouse CI) | v1.4 ✅ | v1.5 이연 | v1.4 정적 영역만 / v1.5 운영 측정 | ★ **v1.4 정적 (bundle) + v1.5 운영 (LCP/CLS)** 분할 |
| 보안 (CSP3 + RFC 6265bis + XSS) | v1.4 ✅ | v1.5 이연 | v1.4 정적 (XSS sink) / v1.5 운영 (CSP report) | ★ **v1.4 정적 분석 (XSS/dangerouslySetInnerHTML) + v1.5 운영 모니터링** 분할 |
| mutation (Stryker) | (미언급) | v1.5 | (미언급) | **v1.5 이연** |

→ ★ ADR-001 §명시적 제외 갱신 권고 (Senior): "비기능 측정" → **"운영 NFR 측정"** 으로 좁힘 + "정적 분석 가능 NFR (a11y/i18n/XSS/bundle) 은 포함" 재해석.

### 2.2 권위 매개체 1순위 채택 (Gate 1 결단)

3 에이전트 권고 **합집합** (모두 ★★★ 또는 Tier 1 이상):

| 매개체 | 표준 ID | 공식 | 산업 | Senior | 통합 권고 |
|---|---|---|---|---|---|
| **OpenAPI 3.1** + JSON Schema 2020-12 | OAS 3.1.0 / draft-bhutton-01 | ★ 이미 채택 | (BE 측) | ★ 이미 채택 | **유지** (BE 트랙 자산 재사용) |
| **Custom Elements Manifest (CEM)** | webcomponents v2.1.0 | ★★★ 1순위 | Tier 2 | ★★★ 1순위 | ★ **채택** (컴포넌트 spec) |
| **W3C SCXML** | REC-scxml-20150901 | ★★★ 1순위 | Tier 3 (XState 사용 시) | ★★★ 1순위 | ★ **채택** (분산 상태 / 복잡 머신) |
| **DTCG (Design Tokens)** | v2025.10 stable | ★★ (draft 명시) | ★★★ Tier 1 | ★★★ 1순위 | ★ **채택** (디자인 토큰) |
| **MSW handler + OpenAPI** | mswjs.io | ★★ | Tier 1 | ★★★ 1순위 (BE 측 OAS 그대로) | ★ **채택** (API 계약 FE 측) |
| **Pact spec v4** | Pact Foundation | ★★ | Tier 1 | ★★ 2순위 (Stage 6 분리 정책 시) | ★★ **채택** (CDC, Stage 6 권고) |
| **axe-core JSON + EARL+JSON-LD** | Deque / W3C TR EARL10 | ★★★ (EARL) | Tier 1 | ★★★ 1순위 | ★ **채택** (a11y) |
| **Storybook CSF v3** | community (Chromatic) | ★★ vendor 종속 | Tier 1 | ★★ 2순위 | ★ **채택 + vendor 종속 명시** |
| **WCAG 2.1 AA + WAI-ARIA 1.2** | W3C REC | ★★★ 1순위 | (a11y 포함) | (axe-core 포함) | ★ **기준 채택** |
| **ICU MessageFormat 1 / UTS#35 MF2** | Unicode | ★★★ 1순위 | Tier 2 | 2순위 | ★ **채택** |
| **TypeScript .d.ts** | TC39/MS | (미강조) | (CEM 자동 생성) | ★★★ 1순위 보조 | ★ **채택** (CEM 보조) |
| **WebDriver v2 (Take Screenshot) + Playwright** | W3C WD + Microsoft | ★★ | (Playwright) | ★★ 2순위 (visual-manifest) | ★ **채택** (시각 baseline 매개체) |

→ Stage 2 Gate 1-4 결정: **★ 12 매개체 통합 채택 권고** (이식성 ★★★ deliverable 등급 보장).

### 2.3 PoC #04 대상 (Gate 3 결단)

- Senior 권고: **RealWorld FE (modern React) only** — 사내 적용은 v1.4.0 release 후 adoption 분리 트랙 (★ §8.1 단일 PoC 과적합 회피 정합)
- 산업 권고: **RealWorld + 사내 legacy 1건 (JSP+jQuery)** — spectrum 양 끝 동시 검증
- 공식 권고: **RealWorld modern + 별도 mini-PoC (legacy/MPA/JSP)** — 단일 PoC 과적합 회피

→ ★ **차이**: "사내 legacy 동시" vs "release 후 분리". 본체 격상 우선 원칙 (memory `feedback_methodology_body_priority.md`) 정합 시 Senior 권고 (release 후) 가 사상 정합.

→ ★ **타협안**: PoC #04 = RealWorld FE (modern) only / mini-PoC (Stage 4) = RealWorld FE 작은 부분만 / 사내 legacy 검증 = v1.4.0 release 후 adoption 트랙 별도 진행 (현 v1.3 패턴 정합).

---

## 3. 본체 빈틈 진단 (현 7-ui-ux / phase-5-2 / ui-spec.schema)

### 3.1 빈틈 Top 5 (Stage 2 Gate 1 결단 핵심 입력)

| # | 빈틈 | 영향도 | 사용자 요구 매핑 | Senior 인용 |
|---|---|---|---|---|
| 1 | **분산 상태 deliverable 부재** (server/client/URL/form/DOM 5 진실) | ★★★ 사상 충돌 가장 큼 | 요구 4 (비즈니스 로직) | Q3 + §4.1 #6 |
| 2 | **시각 산출 deliverable 부재** (visible-manifest) | ★★★ 사용자 요구 정면 미해소 | 요구 3 (visible) | Q2 + §4.1 #2 |
| 3 | **legacy fallback 부재** (jQuery / Vanilla / JSP / MPA) | ★★★ 사용자 진단 "방법이 없잖아" 직접 대응 | (사용자 진단) | Q5 + §4.1 #1 |
| 4 | **권위 매개체 격상 미반영** (CEM/SCXML/DTCG/MSW+OAS/axe/.d.ts) | ★★★ 이식성 ★★★ 의무 정합 | 요구 1 (마이그 입력 + 테스트 기반) | Q6 + §4.2 #2-5 |
| 5 | **신뢰도 단계 모델 부재** (현 평균 75% → ADR-009 단계 1~5) | ★★ 정직 표기 강화 | 요구 7 (발전 과정) | §6.2 |

### 3.2 빈틈 세부 (3 research 종합 — Stage 3 격상 시 작업 항목)

**`7-ui-ux.md` (305줄) 빈틈 10건** (Senior §4.1 표):

1. line 65 "JSX import 그래프" 가정 → Tier 1~4 fallback 명시 의무 (Q5)
2. line 78 "Figma 영역 미추출" → deliverable 9 (visual-manifest) 분리 (Q2)
3. line 166-184 디자인 토큰 → DTCG `$type`/`$value` 구조 명시 (Q6)
4. line 96 "API 호출" → MSW handler / OpenAPI operationId 매개체 (Q6)
5. line 217 "Storybook (있으면)" → CSF v3 1순위 분기 (Q6)
6. (부재) 분산 상태 5 진실 → deliverable 8 (state-map) 신설 (Q3)
7. (부재) 이벤트-주도 + 렌더링 사이클 → deliverable 8 또는 §5.5 신설 (Q4)
8. (부재) a11y / i18n → §11 + br.schema.json br_type 확장 (Q8)
9. line 246-258 신뢰도 표 → 단계 1~5 모델 (12+ 영역) 갱신 (Q9)
10. line 289-305 흔한 함정 → drift / SSR-CSR mismatch / hydration / suspense 추가

**`phase-5-2-ui.md` (196줄) 빈틈 5건**:

1. line 33-54 "5 하위 산출물 병렬" → 7~8 산출물 또는 phase-5-2-a/b/c/d 분할
2. line 155-165 신뢰도 → 12+ 영역
3. line 140-151 승인 게이트 → drift-validator + visual baseline hash + axe report + i18n coverage 4건 추가
4. (부재) drift-validator FE 적용 → state-map.json ↔ state-map.mermaid drift 의무
5. (부재) static tool 진짜 실행 (axe / Playwright / MSW verify) → no-simulation 정책 정합

**`ui-spec.schema.json` (275줄) 빈틈 6건**:

1. line 13-15 framework enum → jquery_legacy / vanilla / jsp / mpa 추가
2. line 117-159 components → event_handlers / state_subscriptions / api_calls / suspense_boundary 4 필드
3. line 127-140 level enum → dom_widget / selector_group (Tier 3) 추가
4. (부재) stores / state_machines / event_handlers 최상위 → state-map.schema.json 신설
5. (부재) visual_snapshots → visual-manifest.schema.json 신설
6. line 259 human_review_status enum → needs_designer_review / needs_a11y_audit 추가

### 3.3 신규 deliverable / schema / ADR 권고 (3 research 종합)

**deliverable 신설 (Scenario B-Lite — 단계 분할)**:

```
methodology-spec/deliverables/
├── 7-ui-ux.md                ← 보강 (페이지/사용자 흐름/시나리오 만 유지)
├── 8-state-map.md            ← 신설 (Q3 분산 상태 / SCXML)
├── 9-visual-manifest.md      ← 신설 (Q2 시각 산출 / WebDriver+Playwright)
└── (Stage 3-2 결단 후)
    ├── 10-component-spec.md  ← 신설 (Q6 CEM v2.1 + .d.ts) (선택)
    └── non-functional/       ← sub-tree (Q8 — Gate 2 결단)
        ├── a11y-report.md   ← EARL+JSON-LD
        └── i18n-spec.md     ← ICU MF1 / UTS#35 MF2
```

**legacy 대응 산출물 3종 (산업 권고 — Stage 3-2)**:

- `legacy-spectrum.json` — jQuery / Vanilla / MPA / JSP / Struts / JSF / SPA 분류
- `bootstrap-data-flow.md` — 서버→클라 데이터 부트스트랩 경로 (Airbnb Hypernova 사례)
- `strangler-migration-plan.md` — Strangler Fig 호환 phase 분할 (Thoughtworks)

**schema 신설**:

- `state-map.schema.json` (Q3)
- `visual-manifest.schema.json` (Q2)
- (Gate 2 의존) `a11y-report.schema.json` / `i18n-spec.schema.json` / `legacy-spectrum.schema.json`
- `ui-spec.schema.json` 확장 (framework enum + components 필드 + human_review enum)

**ADR 신설 (Senior B-Lite + 산업/공식 권고 통합)**:

| ADR | 내용 | Stage |
|---|---|---|
| **ADR-FE-001** | FE 추출기 가정 명시 + spectrum cover (Tier 1~4 fallback) | Stage 3-1 |
| **ADR-FE-002** | 이중 렌더링 사상 FE 적용 (visual 예외 케이스 + ADR-008 정합) | Stage 3-1 |
| **ADR-FE-003** | legacy spectrum 정책 (jQuery/Vanilla/MPA/JSP) + selector-graph 매개체 | Stage 3-2 |
| **ADR-FE-004** | BE/FE 분리 운영 정책 (NPM 분리 + DTCG 공유 + JSP 예외) | Stage 6 |
| **ADR-FE-005** | 권위 매개체 채택 결단 (CEM/SCXML/DTCG/MSW+OAS/axe/.d.ts/CSF/Playwright) | Stage 3-1 |
| **ADR-001 갱신** | §명시적 제외 — "비기능 측정" → "운영 NFR 측정" 으로 좁힘 | Stage 3-2 (Gate 2 결단 시) |
| **ADR-009 갱신** | FE 신뢰도 단계 모델 적용 (단계 1~5) | Stage 3-1 |

---

## 4. Stage 2 사용자 의사결정 입력 자료

### 4.1 Gate 1 (핵심 구조) — 4 결정

| ID | 결정 항목 | 옵션 | Senior 권고 | 산업/공식 정합 |
|---|---|---|---|---|
| **G1-1** | spectrum 우선순위 | (a) Modern SPA only / (b) +jQuery legacy / (c) +JSP / (d) all+Native | **(c) Modern SPA + jQuery legacy + JSP 예외 / Native v1.5 이연** | ✅ 3 합의 |
| **G1-2** | 격상 시나리오 | A (보강) / B (신설 8/9/...) / **B-Lite (단계 분할)** | **B-Lite** | ✅ 3 합의 (Senior 변형 권고) |
| **G1-3** | schema 통합 vs 분리 | (a) ui-spec 단일 확장 / (b) state-map+visual-manifest 분리 / (c) 분리 + Phase 4.5 cross-link | **(c) 분리 + cross-link** | ✅ Phase 4.5 패턴 정합 |
| **G1-4** | 권위 매개체 표준 채택 | 미채택 / Tier 1 만 / 1순위 6종 / **12 통합 채택** | **12 통합 채택** (CEM/SCXML/DTCG/MSW+OAS/axe-core/.d.ts/CSF/Playwright/WCAG 2.1/WAI-ARIA 1.2/ICU MF/Pact (Stage 6)) | ✅ 3 합의 |

### 4.2 Gate 2 (보강 범위) — 4 결정

| ID | 결정 항목 | 옵션 | Senior 권고 | 산업/공식 정합 |
|---|---|---|---|---|
| **G2-1** | 비기능 v1.4 포함 범위 | 전체 v1.4 / a11y+i18n+정적보안 만 / 전부 v1.5 | **a11y + i18n + 정적 보안 (XSS) v1.4 / 운영 NFR (LCP/CLS/Lighthouse) v1.5** | ✅ Senior + 산업 합의 (공식은 모두 v1.4 권고 — Senior 권고가 본 방법론 사상 정합 강함) |
| **G2-2** | legacy cover 범위 | (a) Tier 1-2 / (b) +Tier 3 jQuery / (c) +Tier 4 JSP | **(c) — Tier 4 = Stage 6 BE/FE 분리 ADR 예외 케이스** | ✅ 3 합의 |
| **G2-3** | BE/FE 분리 정책 | (a) 단일 PoC / (b) 분리 default + JS풀스택+JSP 예외 ADR | **(b) — Scenario A (분리) default + B (JS풀스택) + C (JSP) ADR 명시** | ✅ 3 합의 |
| **G2-4** | ADR-001 §명시적 제외 갱신 | 갱신 X / 갱신 ("비기능 측정" → "운영 NFR 측정") | **갱신 권고** | ✅ Senior |

### 4.3 Gate 3 (검증 전략) — 4 결정

| ID | 결정 항목 | 옵션 | Senior 권고 | 산업/공식 정합 |
|---|---|---|---|---|
| **G3-1** | mini-PoC 진입 시점 | Stage 3 종료 후 / Stage 3-1 종료 후 (Stage 3-2 와 병행) | **Stage 3-1 종료 후 즉시 (Stage 3-2 와 mini-PoC 병행)** | ✅ 4원칙 4번 fail-fast |
| **G3-2** | PoC #04 대상 | RealWorld only / RealWorld + 사내 legacy 1건 / RealWorld + adoption 트랙 분리 | **RealWorld FE (modern React) only — 사내 legacy 검증은 v1.4.0 release 후 adoption 트랙** | ⚠️ Senior 보수 (release 후) vs 산업/공식 (동시) — **사상 정합 시 Senior 권고**. 단 Gate 3-2 옵션으로 사용자 결단 |
| **G3-3** | 신뢰도 목표 | 0.75 / 0.80 / 0.85 / 0.90 | **0.80 (Stage 5 종료) — 진짜 도구 1회 실행 시 0.85+ (단계 4 도달)** | ✅ ADR-009 단계 패턴 정합 |
| **G3-4** | Sprint 분할 | mini-PoC 1주 / 본격 PoC sprint 단위 | **Stage 4 mini-PoC 1주 fail-fast / Stage 5 PoC #04 4-6 sprint (BE PoC #02/#03 동급)** | ✅ 합의 |

### 4.4 Stage 4 mini-PoC 범위 (Gate 3-1 결정 후 즉시 진입)

Senior §7 권고 (산업 권고 보강):

```
대상: gothinkster/realworld 의 react-redux fork 1개 (Vite + React 18+)
범위 (1주 fail-fast):
  ✅ 1 page: editor (/editor) — 폼+분산상태+시각 모두 검증 가능
  ✅ 1 컴포넌트: EditorForm — props+state+event 모두
  ✅ 1 flow: 글 작성→발행→상세
  ✅ 2 진실 동시 (server cache + client form state) — drift 검증 가능성
  ✅ 2 viewport (desktop + mobile) — visual-manifest 형식 검증

검증 (no-simulation 정책 정합):
  ✅ Playwright 진짜 실행 1회 — visual baseline 생성
  ✅ axe-core 진짜 실행 1회 — a11y 검증 가능성 입증
  ⏳ MSW handler 1개 — OpenAPI operationId 입력 가능성
  ⏳ Storybook CSF v3 1개 — interaction test 자동 입증

종료 조건:
  - 이중 렌더링 정합 (drift 0 또는 finding 등록)
  - 신뢰도 0.75+ 도달
  - 사상 위반 0
  - finding ≤ 5건 / antipattern 후보 ≥ 1건

종료 시 결단:
  ✅ Stage 5 진입 (본격 PoC #04)
  ❌ 사상 위반 발견 시 Stage 3 revert (4원칙 4번)
```

---

## 5. Senior 통합 격상 권고 (Scenario B-Lite — Stage 3 분할)

### Stage 3-1 (1 sprint — Gate 1 통과 후 즉시)

- ✅ deliverable 8 신설 (state-map.md + state-map.schema.json) — Q3
- ✅ deliverable 9 신설 (visual-manifest.md + visual-manifest.schema.json) — Q2
- ✅ phase-5-2 분할 (5-2-a ui-base / 5-2-b state / 5-2-c visual)
- ✅ ADR-FE-001 (FE 추출기 가정 + spectrum cover)
- ✅ ADR-FE-002 (이중 렌더링 사상 FE 적용 — visual 예외)
- ✅ ADR-FE-005 (권위 매개체 12 채택 결단)
- ✅ ADR-009 갱신 (FE 신뢰도 단계 모델)
- ✅ 7-ui-ux.md 보강 (legacy fallback Tier 1~4 — Q5)
- ✅ ui-spec.schema.json 확장 (event_handlers / api_calls / suspense_boundary 추가)
- ✅ drift-validator FE 적용 시범 (state-map.json ↔ state-map.mermaid)

### Stage 3-2 (1 sprint — Stage 4 mini-PoC 와 병행 / Gate 2 통과 후)

- ⚠️ deliverable 10 신설 결단 (component-spec — CEM) — Gate 2 의존
- ⚠️ deliverable non-functional sub-tree 결단 (a11y / i18n) — Gate 2 의존
- ✅ phase-5-2-d 분할 (event-flow) — Q4
- ✅ ADR-FE-003 (legacy spectrum 정책)
- ✅ ADR-001 §명시적 제외 갱신 — Gate 2 결단 시
- ✅ migration-cautions-fe.md 신설
- ✅ rules.schema.json br_type enum 확장 (fe_validation / fe_authorization / fe_a11y / fe_i18n) — BE 정합
- ✅ legacy 산출물 3종 신설 (legacy-spectrum / bootstrap-data-flow / strangler-migration-plan) — 산업 권고

### Stage 6 (분리 정책 정식화)

- ✅ ADR-FE-004 (BE/FE 분리 운영 정책 + JS 풀스택 + JSP 예외)
- ✅ methodology-spec/be-fe-separation.md

---

## 6. 신뢰도 모델 (FE v1.4 — ADR-009 단계 패턴 적용)

### 6.1 단계 모델

| 단계 | 조건 | 신뢰도 |
|---|---|---|
| 1 | 자연어 단독 (현 v1.3 ui-spec) | 60-75% |
| 2 | + Phase 4.5 등가물 (state-map + visual-manifest + br-fe.json) | 75-82% |
| 3 | + drift-validator FE 적용 (state-map.json ↔ .mermaid / component-tree.json ↔ .mermaid) | 80-85% |
| 4 | + 진짜 도구 1회 실행 (axe-core / Storybook test / Playwright + 5종 물증) | 85-92% |
| 5 | + 사용자 검토 완료 (디자이너 / 기획자 / a11y audit) | 92-95% |

### 6.2 영역별 신뢰도 (12+ 영역 — 7-ui-ux §10 대체안)

Senior §6.3 표 채택. Tier 1 (modern SPA) 평균 ~83% / Tier 4 (JSP) ~55%.

→ Stage 5 PoC #04 신뢰도 목표 = **0.80** (Tier 1 평균 - 5%p 안전 마진).

### 6.3 정직 표기 의무 (FE 신규)

- ❌ 시각 baseline 시뮬레이션 금지 — Playwright 진짜 실행 의무
- ❌ axe-core 시뮬 금지 — 진짜 실행 의무
- ✅ DOM uncontrolled state 추출 시 -10%p 패널티 (LLM 추론 한계)
- ✅ legacy Tier 3/4 신뢰도 cap = 0.65

---

## 7. 사용자 7 요구사항 반영도 (research 후)

| 요구 | 반영도 (Stage 1 종료 시) | Stage 3 격상 후 도달 |
|---|---|---|
| 1. 산출물 → 마이그+테스트 기반 | ✅ 12 권위 매개체 채택 합의 | ★ 100% — CEM/SCXML/DTCG/MSW/axe/CSF 등 직접 채택 |
| 2. AI + 사람 동시 이해 | ✅ 이중 렌더링 (Phase 4.5 패턴) FE 적용 권고 | ★ 100% — manifest (텍스트) + Storybook static / Mermaid |
| 3. UI visible 차원 | ✅ visual-manifest deliverable 신설 합의 | ★ 100% — Stage 3-1 신설 |
| 4. 비즈니스 로직 동일 | ✅ state-map deliverable + br-fe.json 권고 | ★ 100% — Stage 3-1/3-2 |
| 5. BE/FE 분리 운영 | ✅ ADR-FE-004 권고 (Stage 6) + JS풀스택/JSP 예외 명시 | ★ 100% — Stage 6 정식화 |
| 6. 큰 뭉텅이 승인제 | ✅ 8 Stage 분할 + Gate 1/2/3 분산화 (Stage 0 정착) | ★ 100% |
| 7. 모든 단계 기록 | ✅ Stage 마다 commit + DEC + STATUS 갱신 | ★ 100% |

→ ★ **모든 요구 반영 가능 (Stage 3 격상 시 100% 도달)**.

---

## 8. Stage 1 종결 조건 (자가 평가)

| 조건 | 상태 | 근거 |
|---|---|---|
| 9Q 답 도출 | ✅ | 3 research × 9Q = 27 답 |
| 본체 빈틈 진단 | ✅ | §3 (top 5 + 세부 21건) |
| Stage 2 Gate 입력 자료 | ✅ | §4 (Gate 1/2/3 × 4 결정 = 12 결정 항목) |
| 산출물 / 매개체 권고 | ✅ | §3.3 + 12 매개체 표 |
| 격상 시나리오 권고 | ✅ | §5 (Scenario B-Lite + Stage 3 분할) |
| 신뢰도 모델 | ✅ | §6 (단계 1~5 + 영역별 표) |
| mini-PoC 범위 | ✅ | §4.4 |
| 사용자 7 요구 반영도 | ✅ | §7 (모두 반영 가능) |

→ Stage 1 종결 가능. 다음 trigger = **사용자 Stage 2 진입 승인** (Gate 1 결단 시작).

---

## 9. Stage 2 진입 시 사용자 결단 요약 (12 결정)

```
Gate 1 (핵심 구조) ─ 4 결정:
  G1-1. spectrum 우선순위 (Senior 권고: Modern + jQuery + JSP 예외)
  G1-2. 격상 시나리오 (Senior 권고: B-Lite 단계 분할)
  G1-3. schema 분리 + cross-link (Senior 권고: 분리 + Phase 4.5 패턴)
  G1-4. 권위 매개체 12 채택 (Senior 권고: 12 통합 채택)

Gate 2 (보강 범위) ─ 4 결정:
  G2-1. 비기능 v1.4 범위 (Senior 권고: a11y+i18n+정적보안 / 운영 NFR v1.5)
  G2-2. legacy cover (Senior 권고: Tier 1~4 모두 / Tier 4 = Stage 6 ADR 예외)
  G2-3. BE/FE 분리 정책 (Senior 권고: 분리 default + JS풀스택+JSP 예외 ADR)
  G2-4. ADR-001 §명시적 제외 갱신 (Senior 권고: 갱신)

Gate 3 (검증 전략) ─ 4 결정:
  G3-1. mini-PoC 진입 (Senior 권고: Stage 3-1 종료 후 즉시 / Stage 3-2 와 병행)
  G3-2. PoC #04 대상 (Senior 권고: RealWorld FE only / 사내 legacy 는 release 후)
  G3-3. 신뢰도 목표 (Senior 권고: 0.80)
  G3-4. Sprint 분할 (합의: mini 1주 / 본격 4-6 sprint)
```

**End of Stage 1 진단 보고서**.
