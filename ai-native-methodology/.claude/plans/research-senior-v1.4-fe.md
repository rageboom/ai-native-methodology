# Research — Senior FE / 본 방법론 통합 (v1.4 FE 트랙 Stage 1)

> **작성**: Senior FE 에이전트 (3 에이전트 분담 중 통합 권고 담당)
> **시점**: 2026-05-01 / Stage 1 진입 후 1차 산출
> **선행**: `plan-v1.4-fe-track.md` (4원칙 1단계) + `DEC-2026-05-01-v1.4-FE-트랙-진입.md`
> **분담**: 본 문서는 Senior — 9Q 모두 강한 답 + 본 방법론 사상 정합 + 격상 권고. 공식문서 / 테크기업 사례 에이전트 산출은 별도 짝.
> **방침**: 본 레포 인용 의무 (파일:line). 산업 사례는 1차 사료 ID 명시. 시뮬 절대 금지 (CLAUDE.md ★★★).

---

## 1. Scope + 본 방법론 정합 점검 강도

### 1.1 본 트랙의 사상적 헌법 (Senior 가 9Q 답 도출 시 항상 참조)

| 헌법 항목 | 출처 | 본 트랙 적용 시 의미 |
|---|---|---|
| ★★★ 가치 명세 — "코드 → 형식 명세 + 위험 기록 한 방향 추출기" | `CLAUDE.md:15-21` | FE 도 round-trip 검증 X. 산출물 자체가 신규 시스템 입력 자료. 이식성 5종 등급 평가 의무. |
| ★★★ 산출물 이식성 5종 (★★★ 그대로 입력) | `CLAUDE.md:23-29` | rules.json / openapi.yaml / schema.json 동급 이식성 (★★★) 의 FE 산출물을 식별해야 함. |
| ★★★ Static Tool 시뮬 절대 금지 | `CLAUDE.md:33-41` | axe-core / Lighthouse / Playwright / Storybook / Pact 등 FE 도구 모두 **진짜 실행 의무**. AI persona 시뮬 시 -5%p 패널티. |
| 4원칙 (plan → research → 승인 → revert) | `CLAUDE.md:43-50` | Stage 0~7 가 4원칙의 macro 적용. mini-PoC fail-fast (Stage 4) = 4원칙 4번 정합. |
| 이중 렌더링 사상 (단일 진실 + AI 눈 + 사람 눈) | `ADR-008-이중-렌더링-사상.md:36-59` | FE 신규 산출물 모두 양쪽 의무. 시각 산출이 본 사상의 가장 큰 도전. |
| Schema-First (주축) + Contract-First + DDD-Lite + FSD | `ADR-001-사상적-기반.md:18-38` | FE 도 동일 4 사상. ADR-001 §FE 의 FSD + Atomic 이미 명시. |
| 비기능 요구사항 측정 명시적 제외 | `README.md:214-216` + `ADR-001:74` | v1.4 가 정면충돌. 이연 vs 일부 포섭 결단 필요 (Q8). |
| 본체 격상 vs PoC 산출물 분리 — 본체 우선 | `feedback_methodology_body_priority.md` (memory) | Stage 3 (본체 격상) → Stage 5 (PoC #04) 순서가 사상 정합. |
| 신뢰도 정직 표기 (-5%p 패널티 / 시뮬 / 진짜 도구 미실행) | `phase-4-5-formal-spec.md:237-251` | 현 7-ui-ux §10 평균 75% 도 동일 모델 적용 의무. v1.4 에서 ADR-009 단계화 모델 도입 권고. |

### 1.2 점검 강도 자기 선언

본 Senior 답은:
- ✅ **본 레포 직접 read** — 8 파일 (`CLAUDE.md` / `plan-v1.4-fe-track.md` / `7-ui-ux.md` / `phase-5-2-ui.md` / `ui-spec.schema.json` / `STATUS.md` / `DEC-2026-05-01-v1.4-FE-트랙-진입.md` / `phase-4-5-formal-spec.md` / `2-domain.md` / `5-business-rules.md` / `ADR-001` / `ADR-002` / `ADR-008`)
- ✅ **사상 정합 의무** — 9Q 답 모두 §1.1 헌법 항목 1개 이상 참조
- ❌ **외부 도구 시뮬 회피** — 권고는 "사용자가 실제 실행해야 한다" 명시 (Stage 4/5 시점)
- ✅ **본체 격상 우선** (Stage 3 ≺ Stage 5) 사상 정합

---

## 2. 9 Question 답 (모두 강한 답)

### Q1. 분석 대상 spectrum — 본 방법론 가치 명세 정합 시 cover 범위

**핵심 진단**: 본 방법론 가치 명세 (`CLAUDE.md:15-21`) = "코드 → 형식 명세 + 위험 기록 한 방향 추출기". 따라서 **분석 가능성 ≠ 형식화 가능성**. 두 단계로 분리 판정해야 정직.

| spectrum | 분석 가능 | 형식화 (★★★ 이식 가능) | 위험 기록 (antipatterns.json) | 권고 |
|---|---|---|---|---|
| Modern React/Vue/Svelte SPA + JSX 그래프 + Tailwind | ✅ 95% | ✅ 90% | ✅ | **v1.4 1차 cover** |
| Next.js / Nuxt / Remix SSR/RSC 혼재 | ✅ 80% | ⚠️ 60% (server/client boundary 명시 의무) | ✅ | **v1.4 1차 cover** (★ SSR/CSR 표기 7-ui-ux §7.5 이미 인지) |
| jQuery / Vanilla JS legacy | ⚠️ 60% (DOM 조작 + 이벤트 분산) | ❌ 30% (컴포넌트 그래프 부재) | ✅ 90% (★★★ 회피 목록이 본질 가치) | **v1.4 cover — 단 산출물 등급 차등** |
| JSP / Thymeleaf / 서버 렌더 템플릿 | ⚠️ 70% (BE 와 결합 / Java 측 분석 필요) | ❌ 25% (FE/BE 경계 모호) | ✅ 85% | **v1.4 cover — Stage 6 BE/FE 분리 정책의 예외 케이스** |
| MPA (다중 페이지 앱 / 라우팅 분산) | ⚠️ 65% | ⚠️ 50% | ✅ | **v1.4 cover** |
| Angular | ✅ 80% (DI + RxJS) | ✅ 75% | ✅ | v1.4 best-effort (PoC 외 cover 명시) |
| Native mobile (RN / Flutter) | ❌ scope 외 | ❌ | — | **v1.5 이연** |

**본 방법론 사상 정합 정직 판정**:

> jQuery/JSP 같은 legacy 가 본질적으로 **형식화 가능한가?**
> — 부분 가능. **컴포넌트 트리 / 라우팅 / 디자인 토큰** 은 부재 또는 추출 불가. 그러나 **이벤트 핸들러 인벤토리 / DOM mutation 인벤토리 / 서버 응답 → 화면 변화 매핑 / 폼 validation** 은 추출 가능. 이 부분만 형식화하고, 나머지는 antipatterns.json 으로 회피 목록 등록 = 본 방법론의 ★★★ 가치 명세 ("회피 목록 그대로 입력") 정합.

→ **v1.4 1차 cover spectrum 권고**: Modern SPA (React/Vue/Svelte/Next/Nuxt) **+ jQuery legacy (등급 차등 cover) + JSP 혼재 (Stage 6 정책 예외)**. Angular 는 best-effort.

### Q2. 시각 산출 처리 — ADR-008 이중 렌더링 통합

**핵심 진단**: ADR-008 (`ADR-008-이중-렌더링-사상.md:114-122`) 은 **텍스트 기반 + git diff 가능 + GitHub 자동 렌더 + 외부 SaaS 의존 X + 바이너리 X** 를 사상 정합 도구 선정 기준으로 명시. 시각 산출은 본 기준에 **정면 충돌**.

| 시각 매개체 후보 | 텍스트 기반 | git diff | GitHub 자동 렌더 | SaaS 의존 | 바이너리 | ADR-008 정합 |
|---|---|---|---|---|---|---|
| Chromatic baseline | ❌ | ❌ | ❌ | ✅ (락-인) | ❌ (PNG) | ❌ |
| Percy | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| jest-image-snapshot | ❌ (PNG 로컬) | △ (LFS) | ❌ | ❌ | ❌ | ⚠️ |
| Playwright visual | ❌ (PNG) | △ | ❌ | ❌ | ❌ | ⚠️ |
| Storybook CSF v7 (manifest) | ✅ | ✅ | ⚠️ (URL 경유) | ❌ | ✅ (.ts 텍스트) | ✅ |
| **(권고) visual-manifest.json + URL 참조 + 로컬 PNG snapshot 별도 폴더** | ✅ (manifest) + ❌ (PNG) | ✅ + ❌ | ✅ (manifest) | ❌ | △ | **하이브리드** |

**권고 방안 (ADR-008 정합 + 사용자 요구 3번 충족)**:

```
output/ui/visual/
├── visual-manifest.json   # AI 눈 (★★★ 이식 가능 — texual)
├── visual-manifest.md     # 사람 눈 (요약 + 캡쳐 갤러리 마크다운 임베드)
└── snapshots/             # 사람 눈 보조 (★ ADR-008 §부정적 영향 1번에 신설 케이스 등재 의무)
    ├── PAGE-ORDER-001.png # baseline (.gitattributes LFS)
    ├── PAGE-ORDER-001.diff.png  # diff (PR review 시 생성)
    └── ...
```

**visual-manifest.json 권위 매개체**:
```json
{
  "$schema": "...visual-manifest.schema.json",
  "snapshots": [{
    "id": "VIS-PAGE-ORDER-001",
    "page_id": "PAGE-ORDER-001",        // ui-spec.schema.json pages[].id 와 일관
    "story_id": "OrderListPage--default", // Storybook CSF
    "viewport": "desktop-1280",
    "interactions": ["initial"],          // CSF play function name
    "snapshot_path": "snapshots/PAGE-ORDER-001.png",
    "snapshot_hash": "sha256:...",       // ★ phase-4-5 §4.2 5종 물증 result_hash 패턴
    "tool": "playwright",
    "tool_version": "1.42.0",            // ★ no-simulation 정책 정합
    "captured_at": "2026-05-15T10:00:00Z"
  }]
}
```

→ **사상 정합**: SSOT = manifest (텍스트). PNG = 사람 눈 보조 (학문적 정당화 = ADR-008 §대안 1 거부 — "사람 검토 차단 회피"). drift 검증 = baseline hash diff (CI 도구 실행 시 자동).

→ **신뢰도 모델**: 시각 baseline 생성 자체는 deterministic (도구 출력) → 0.95. 그러나 "이 시각이 의도된 것인가" = LLM 판정 불가 → **기획자/디자이너 검토 강제** (7-ui-ux §10 sceanrios 패턴 동일).

### Q3. 분산 상태 표현 — Phase 4.5 formal-spec 적용 가능성

**핵심 진단**: BE Phase 4.5 (`phase-4-5-formal-spec.md:70-82`) 의 state-machine 은 **Aggregate Root 생애주기** (서버 단일 진실 / 트랜잭션 경계). FE 분산 상태는 **5 진실 (server / client / URL / form / DOM)** + **소비자가 다중** (컴포넌트 / 라우터 / 캐시 / form lib).

| BE phase-4-5 §3.1 state-machine | FE 등가 매개체 | 적용 가능성 |
|---|---|---|
| Aggregate Root 생애주기 | XState / SCXML (W3C) machine | ✅ 직접 호환 |
| state/event/guard | XState event/guard | ✅ |
| ★ 단일 진실 | ❌ FE 는 **다진실** — server (TanStack Query cache) / client (Zustand) / URL (router) / form (RHF) / DOM (uncontrolled) | ⚠️ 사상 충돌 |

**권고 방안**: **새 deliverable 신설 (Scenario B 부분 채택)** + Phase 4.5 확장 + 신규 deliverable 8 (state-map).

**state-map.json 권위 매개체** (★ BE rules.schema 와 동급):

```json
{
  "stores": [{
    "id": "STORE-CART-001",
    "domain": "server",                    // server/client/url/form/dom 5 진실
    "shape": "TanStack Query cache",       // 매개체 명시
    "key_pattern": "['cart', userId]",
    "invalidation_triggers": ["UC-CART-ADD", "UC-CART-REMOVE"],
    "ttl_seconds": 300,
    "consumed_by_components": ["CMP-ORDER-CART", "CMP-NAV-CART-BADGE"],
    "owns_business_rules": ["BR-CART-COUNT-001"],  // ★ BE rules.json 와 cross-link
    "state_machine_ref": "state-machines/cart.json", // ★ Phase 4.5 정합
    "confidence": 0.85,
    "source_files": ["src/queries/cart.ts"]
  }],
  "synchronization_drifts": [{   // ★ 분산 상태 본질 위험 — antipatterns 후보
    "id": "DRIFT-CART-001",
    "between": ["STORE-CART-001 (server)", "STORE-CART-LOCAL-001 (client Zustand)"],
    "drift_type": "stale_after_mutation",
    "severity": "high",
    "ap_candidate": "AP-FE-STATE-DRIFT-001"
  }]
}
```

→ **Phase 4.5 확장 정합**: state-map.json 의 각 STORE 가 BE Phase 4.5 의 state-machine.json 한 개씩 매개. drift-validator 동일 패턴 적용 가능 (server 측 Aggregate state vs client 측 cache state 불일치 검출).

→ **신뢰도**: server (TanStack Query) 0.90 / client (Zustand) 0.85 / URL (router) 0.95 / form 0.90 / DOM (uncontrolled) 0.50.

### Q4. 이벤트-주도 + 렌더링 사이클 — sequence 다이어그램 적용 가능성

**핵심 진단**: BE phase-4-5 §3.2 (`phase-4-5-formal-spec.md:84-92`) sequence diagram = Controller → Service → Repository (정적 호출 그래프). FE 는 **동적 + 비동기 + 재진입 (re-render)**:

```
user click → onClick handler → setState/dispatch → ★ commit phase ★
  → re-render → useEffect → fetch → setState → ★ commit phase ★
  → re-render → ... (수 사이클)
```

**권고 방안 — 3 sub-spec 결합**:

#### 4.1 Mermaid sequenceDiagram + actor 표기 확장 (1차 — 기본)

BE 와 동일 형식 + actor 추가:
- `User`, `Component`, `Store`, `Server`, `Router`
- 메시지 = event (click / submit) + state mutation + render trigger 명시

#### 4.2 SCXML/XState statechart (2차 — 분산 상태 결합)

state-map.json (Q3) 의 STORE 별 statechart 가 sequence 의 actor 행동을 결정. SCXML 은 W3C 표준 (★ 공식문서 권위) → ★★★ 이식 가능 등급.

#### 4.3 React DevTools profiler export (3차 — 진단 보조)

profiler JSON = **동적 렌더 트레이스** = 사후 검증 도구. **시뮬 금지 정책** (`CLAUDE.md:33-41`) 정합 — 진짜 도구 실행 의무. v1.4 PoC #04 에서 1회 실행 (★ Stage 5 종료 조건).

**한계 (정직)**:
- 비동기 race condition (cleanup vs new fetch) = sequence diagram 표현 불완전 → **antipatterns.json 등록** 으로 회피 목록 자산화
- Suspense / Concurrent React 의 transition 경계 = mermaid 표현 불가 → SCXML 의 parallel state 활용 권고

→ **결론**: sequence diagram + statechart 결합으로 ~85% cover. 나머지 15% (race / Concurrent) = 위험 기록 (★★★ 가치 명세 정합).

### Q5. legacy 호환 — JSX import 그래프 부재 시 분석 방법

**핵심 진단**: 7-ui-ux §3.1 (`7-ui-ux.md:65`) "JSX import 그래프" 가정 = jQuery/Vanilla 부재. ADR-001 §FSD (`ADR-001:62-65`) "FE 진영 사실상 표준" 도 legacy 무시.

**권고 방안 — 4 단계 fallback (사상 정합)**:

| 단계 | 입력 | 추출 산출 | 신뢰도 | 본 방법론 사상 정합 |
|---|---|---|---|---|
| Tier 1 | JSX/TSX import + AST | 컴포넌트 트리 + props + state | 0.90 | Schema-First 정합 |
| Tier 2 | Vue SFC / Svelte / Angular template | template AST | 0.85 | 동일 |
| Tier 3 | jQuery selector graph + event handler 인벤토리 + DOM mutation | **selector-graph.json** + **event-handler-inventory.json** (신설 등가물) | 0.65 | ★★★ 회피 목록 자산화 (legacy 분석 본질) |
| Tier 4 | JSP `<c:if>` + scriptlet + form action 매핑 | jsp-template-inventory.json + 서버 핸들러 매핑 (★ Stage 6 BE/FE 분리 예외 케이스) | 0.55 | ★★★ migration-cautions 회피 목록 |

**Tier 3 selector-graph.json 권위 매개체** (★ legacy 의 "DOM 트리 ≈ FSD" 대체):

```json
{
  "selectors": [{
    "id": "SEL-LOGIN-FORM",
    "selector": "#login-form",
    "page_url_patterns": ["/login.html"],
    "attached_handlers": [{
      "event": "submit",
      "handler_function": "handleLogin",
      "source_file": "js/login.js:12-45",
      "calls_apis": ["POST /api/login"],
      "mutates_dom": ["#error-msg", "#main-nav"],
      "redirects_to": ["/dashboard.html"]
    }],
    "confidence": 0.70
  }]
}
```

→ **사상 정합**: Tier 3/4 의 산출물도 **★★★ 그대로 입력 가능** = 신규 시스템 (modern SPA) 구축 시 "이 selector 조작 = 이 컴포넌트 책임" 매핑 입력. 이는 정확히 가치 명세 (`CLAUDE.md:13-21`) 정합.

→ **Schema-First 사상 정합**: AST 그래프 없으면 schema 부재가 아니라, **다른 schema** (selector-graph.schema.json 신설) 사용. Bottom-up = "코드부터" 사상 (ADR-001 §사상스택) 그대로 유지.

### Q6. ★ 산출물 ↔ 테스트 자동 도출 — FE 등가물 권고 + 우선순위

**핵심 진단**: BE 의 ★★★ 그대로 입력 (`CLAUDE.md:23-29`) = rules.json (Given/When/Then) → JUnit / openapi.yaml → contract test / schema.json → migration script. 동일한 "권위 + 도구 호환" 매개체를 FE 에도 정의해야 v1.4 가 사상 정합.

**plan §4 매개체 후보 표 (`plan-v1.4-fe-track.md:129-141`) 평가** + Senior 권고 우선순위:

| 차원 | 후보 | 권위 (1차 사료 ID) | 도구 호환 | 이식성 등급 | Senior 채택 우선순위 |
|---|---|---|---|---|---|
| 컴포넌트 spec | **Custom Elements Manifest** (CEM) | W3C / WICG cem | Storybook / Lit / IDE | ★★★ | **★ 1순위** |
| 컴포넌트 spec (보조) | TypeScript .d.ts | TC39/MS | Vitest / tsd | ★★★ | 1순위 보조 |
| 컴포넌트 stories | Storybook CSF v3+ | Storybook 공식 | @storybook/test / Chromatic | ★★ | **★ 2순위** (interaction test 자동) |
| 시각 baseline | (Q2 권고 visual-manifest + Playwright) | Playwright 공식 | CI 통합 | ★★ | **★ 3순위** |
| 분산 상태 (state machine) | **SCXML** (W3C) + XState | W3C SCXML 1.0 | XState | ★★★ | **★ 1순위** |
| 이벤트 흐름 | Mermaid sequence + Playwright codegen | Playwright | E2E | ★★ | 2순위 |
| API 계약 (FE 측) | **MSW handler** + OpenAPI 3.1 (BE 산출물 그대로) | MSW / OpenAPI | Vitest 통합 | ★★★ | **★ 1순위** (BE openapi.yaml 그대로 입력 가능 = 사상 정합) |
| API 계약 (CDC) | Pact | Pact Foundation | Pact broker | ★★ | 2순위 (Stage 6 분리 정책 시 권고) |
| 디자인 토큰 | **DTCG** (W3C Design Tokens) | W3C Design Tokens CG | Style Dictionary | ★★★ | **★ 1순위** (현 7-ui-ux §7 이미 W3C DTCG 호환 — `7-ui-ux.md:185`) |
| a11y | axe-core JSON | Deque / WCAG 2.1 AA | jest-axe / Playwright | ★★★ | **★ 1순위 (조건부)** — Q8 결단 의존 |
| i18n | ICU MessageFormat | Unicode CLDR | FormatJS / i18next | ★★★ | 2순위 |
| 성능 | Lighthouse CI / Web Vitals JSON | Google Web.dev | CI 통합 | ★★ | 3순위 |
| 렌더링 사이클 | React DevTools profiler export | React 공식 | DevTools | ★★ | 3순위 (★ no-simulation = 진짜 실행 의무) |

**Senior 통합 권고 — v1.4 표준 매개체 (Stage 2 Gate 1 결정 입력)**:

```
1순위 (★★★ 이식 — v1.4-alpha 의무):
  - Custom Elements Manifest (CEM) — 컴포넌트 spec
  - SCXML / XState — 분산 상태 (state-map.json 보강)
  - DTCG — 디자인 토큰 (현 §7 이미 호환 → 명시화만)
  - MSW handler + OpenAPI 3.1 (BE 산출 입력) — API 계약
  - axe-core JSON — a11y (Q8 결단 시)
  - .d.ts — TS 타입 (CEM 보조)

2순위 (★★ — v1.4 권고):
  - Storybook CSF v3+ — interaction test 자동
  - Playwright + visual-manifest — E2E + 시각

3순위 (v1.5 이연 권고):
  - Pact (CDC) — Stage 6 분리 정책 정식화 후
  - Lighthouse CI / Web Vitals — Q8 비기능 포함 결단 시
  - React DevTools profiler — 진단 보조
```

→ **사상 정합 결론**: BE 의 rules.json 등가물은 **state-map.json (Q3) + br-fe.json (FE-only BR — 폼 validation / 권한 분기) + visual-manifest.json (Q2)**. 이 3종이 현 7-ui-ux 의 빈틈.

### Q7. ★ BE/FE 분리 운영 — 본 방법론 구조 정합

**핵심 진단**: 본 방법론 examples 패턴 (`CLAUDE.md:60-62`) = `poc-XX-realworld-{stack}/` 단일 디렉토리 = BE 단일 stack. JS 풀스택 (Next.js full-stack) 또는 JSP 혼재는 본 패턴 부재.

**3 시나리오 권고**:

| 시나리오 | 구조 | 산출물 | 본 방법론 정합 |
|---|---|---|---|
| **A. 분리 정책 (기본)** | `poc-04-realworld-fe-react/` (FE only) + 별도 BE PoC 참조 | 7대 산출물 7/7 (FE 측 — UI/UX + State Map + Visual) + BE 산출물 (openapi.yaml) **참조 입력** | ★★★ 정합 (단일 책임) |
| **B. JS 풀스택 (Next.js)** | `poc-XX-fullstack-nextjs/` (단일 트리) + `output/be/` + `output/fe/` 분리 | BE 7대 + FE 등가물 동시. server actions / RSC 경계 명시. | ★★ 정합 (예외 명시) |
| **C. JSP 혼재** | `poc-XX-jsp-legacy/` (단일 트리) + Java analyzer + JSP analyzer 양쪽 | 7대 산출물 + JSP-specific tier 4 산출물 (Q5) | ★ 정합 (예외 — Stage 6 ADR 신설 의무) |

**권고**: **A 가 default, B/C 는 ADR 신설** (`ADR-FE-분리정책.md` 권고 — Stage 6 산출). 사용자 요구 5번 (`DEC-2026-05-01-v1.4-FE-트랙-진입.md:27`) "별도 개발자/프로젝트" 가 사상 정합.

→ **PoC #04 권고**: A 시나리오. RealWorld FE (`gothinkster/react-redux-realworld-example-app` 또는 modern fork) + BE openapi.yaml = PoC #02 또는 #03 산출물 그대로 입력 = ★★★ 가치 명세 cross-PoC 입증.

### Q8. 비기능 차원 — v1.4 포함 vs v1.5 이연

**핵심 진단**: ADR-001 (`ADR-001:74`) "비기능 요구사항 측정 = 운영 환경 측정 영역 (코드 분석 밖)" + README §사상적 기반 (`README.md:216`) "NFR 측정 명시적 제외". 그러나 FE 의 비기능은 **코드 분석으로 일부 추출 가능**:

| 비기능 차원 | 코드 분석 가능성 | 진짜 도구 (no-simulation) | v1.4 포함 권고 | 근거 |
|---|---|---|---|---|
| **a11y (WCAG 2.1 AA)** | 0.80 (semantic HTML / ARIA / contrast) | axe-core (★ 진짜 실행) | **✅ 포함** | 1차 사료 (W3C WCAG) + 코드 추출 가능 + ★★★ 이식 가능 (회피 목록 자산화 강력) |
| **i18n** | 0.85 (FormatJS extract / 키 인벤토리 / 번역 누락) | FormatJS CLI | **✅ 포함** | 코드 추출 100% 가능 + ★★★ |
| **성능 (Web Vitals)** | 0.50 (코드 → 실행 시점 측정 필요) | Lighthouse CI (운영 환경 의무) | **⚠️ 부분 — 정적 영역만** | 정적 영역 (bundle size / dead code / lazy boundary) 만 v1.4. 운영 측정 (LCP/CLS) = v1.5 이연 (ADR-001 정합) |
| **보안 (XSS/CSRF)** | 0.70 (dangerouslySetInnerHTML / 외부 input → DOM) | Semgrep / OSV-Scanner | **✅ 포함** | 코드 정적 분석 가능 + BE Sprint 5 carry-over 패턴 동일 |

**권고 (Stage 2 Gate 2 결정 입력)**: **a11y / i18n / 정적 보안 = v1.4 포함 / 성능 (운영) = v1.5 이연**.

**finding-system 충분성**: ADR-001 명시적 제외 부분 (운영 NFR) 은 **finding-system 으로 antipatterns 등록** 패턴이 ★★★ 가치 명세 (`CLAUDE.md:13-21` "위험 기록") 와 정합. axe-core 위반은 deliverable + finding 양쪽 등록 (★ 신뢰도 모델 = 진짜 도구 1회 실행 시 +5%p, ADR-009 단계 4 패턴 적용).

→ **사상 격상**: ADR-001 §명시적 제외 의 "비기능 측정" 항목을 **"운영 NFR 측정 (LCP/CLS/성능 운영)"으로 좁힘** + "정적 분석 가능 NFR (a11y / i18n / XSS / bundle size) 은 포함" 으로 재해석. ADR 갱신 권고 (Stage 3 산출).

### Q9. ★ visible 차원의 사람-가독 형식

**핵심 진단**: ADR-008 §대안 1 거부 (`ADR-008-이중-렌더링-사상.md:147-149`) — "AI-Native 정체성 손실". 4원칙 3번 (사용자 승인) (`CLAUDE.md:49`) "PR review 가능한 형식" 의무.

**3 형식 결합 권고 (사람 눈 측)**:

#### 9.1 Storybook 정적 export (HTML build) — 1차

`storybook build` → `storybook-static/` 폴더 = **정적 HTML + JS** = GitHub Pages / 사내 정적 호스팅 가능. PR review 자동 미리보기 (Vercel preview / Cloudflare Pages 통합).

- 사상 정합: ADR-008 §도구 선정 기준 "GitHub 자동 렌더" 의 **준-정합** (URL 외부지만 텍스트 SSOT 에서 자동 생성).
- 신뢰도: 0.95 (deterministic build).

#### 9.2 Mermaid 다이어그램 (BE 패턴 그대로) — 2차

- user-flows.mermaid (현 7-ui-ux §5)
- state-map.mermaid (Q3 신설)
- sequence (UC-FE-XXX) (Q4)
- component-tree.mermaid (현 7-ui-ux §6)
- selector-graph.mermaid (Q5 legacy)

→ ADR-008 §도구 선정 기준 100% 정합.

#### 9.3 Markdown 카탈로그 (BE 패턴 그대로) — 3차

- pages.md (현 §4)
- components.md (현 §6)
- scenarios.md (현 §8)
- visual-gallery.md (Q2 신설 — PNG 임베드 + 캡션)

#### 9.4 PR review 패턴 (4원칙 3번 정합)

```
□ Mermaid 다이어그램 4종 시각 검토 (브라우저 GitHub 렌더)
□ visual-manifest.md + snapshots/ 갤러리 검토
□ Storybook static URL 1회 클릭 검토 (사내 호스팅)
□ AI 눈 측 (.json) drift 0 (자동 검증 통과 확인)
□ 신뢰도 정직 표기 확인 (75-90%)
```

→ ADR-008 §부정적 영향 1번 (산출 비용 ~2배) 완화 = Storybook 자동 빌드.

---

## 3. ★ 본체 격상 시나리오 권고 (A vs B + 근거)

**현 자산 분량 정직 평가** (`DEC-2026-05-01-v1.4-FE-트랙-진입.md:37-43`):
- `7-ui-ux.md` 305줄 / `phase-5-2-ui.md` 196줄 / `ui-spec.schema.json` 275줄 = BE deliverable 동급. **분량은 충분**.
- **빈틈은 cover 범위 + 매개체 결정** (Q1~Q9 답에서 도출).

**Scenario A (minimal — 보강)** 평가:
- 장점: 변경량 최소 / v1.3 호환성 유지 / 1 sprint 완료 가능
- 단점: 5 진실 (분산 상태) / 시각 산출 / 이벤트 사이클 / legacy = **4 영역이 §7-ui-ux 단일 deliverable 안에 압축** → 가독성 저하 / drift 위험 (이중 렌더링 사상 정합 어려움)

**Scenario B (comprehensive — 신설)** 평가:
- 장점: 사상 정합 100% (BE deliverable 분리 패턴 동일) / Phase 4.5 정식 격상 (PoC #02 패턴 적용) / 이식성 등급 명확화
- 단점: 변경량 많음 (deliverable 8/9 신설 + phase-5-2 4분할 + ADR 4건) / 2~4 sprint

### Senior 권고: **★ Scenario B (comprehensive) — 단 단계 분할**

**근거**:

1. **사상 정합 우선** — 본 방법론 ★★★ 가치 명세 (`CLAUDE.md:13-21`) "그대로 입력 가능" + 이식성 등급은 **deliverable 단위로 정직**해야 함. UI/UX 단일 deliverable 안에 5 진실 + 시각 + 이벤트 = 등급 평가 불가 → 사용자 (사내 적용 시) 가 어느 산출물부터 입력해야 할지 판단 어려움.

2. **본체 격상 우선 원칙** (memory `feedback_methodology_body_priority.md`) — "본체 격상이 PoC 작업보다 우선". B 가 본체 사상 정합 강함.

3. **Phase 4.5 패턴 자산 — 재사용** — BE Phase 4.5 의 5 산출물 (state-machine / sequence / decision-table / invariants / property) 양식이 FE 에 부분 적용 가능 (Q3/Q4). A 는 이 자산 미활용.

4. **신뢰도 정직 표기 강화** — B 의 deliverable 8 (state-map) / 9 (visual-manifest) 는 신뢰도 별도 표기 가능. A 는 7-ui-ux §10 평균 75% 안에 묻힘.

5. **단계 분할로 변경 비용 완화** — B 를 1차에 신설만 / 2차에 cover 범위 확장 / 3차에 mini-PoC 검증 = Stage 3/4 분담 (현 8 Stage 분할 정합).

**권고 변형 — B-Lite (★ Senior 최종 권고)**:

```
Stage 3-1 (1 sprint):
  - deliverable 8 신설 (state-map) — Q3
  - deliverable 9 신설 (visual-manifest) — Q2
  - phase-5-2 → phase-5-2-a (ui-base) + phase-5-2-b (state) + phase-5-2-c (visual) 분할
  - ADR-FE-001 (FE 추출기 가정 명시 + spectrum cover)
  - ADR-FE-002 (이중 렌더링 사상 FE 적용 — visual 예외 케이스)
  - 7-ui-ux.md 보강 (legacy fallback Tier 1~4 — Q5)
  - ui-spec.schema.json 확장 (event_handlers / api_calls / suspense_boundaries)

Stage 3-2 (1 sprint — Stage 4 mini-PoC 와 병행):
  - deliverable 9 신설 시점 결단 (a11y / i18n) — Q8 Gate 2 의존
  - phase-5-2-d (event-flow) 분할 — Q4
  - ADR-FE-003 (legacy spectrum 정책)
  - migration-cautions-fe.md 신설
  - br.schema.json 의 br_type enum 확장 (fe_validation / fe_authorization 추가) — BE rules.schema 와 정합

Stage 6 시점 (분리 정책 정식화):
  - ADR-FE-004 (BE/FE 분리 운영 정책 + JS풀스택 + JSP 예외)
```

→ **Scenario A 거부 / B-Lite 채택 권고**.

---

## 4. ★ 현 7-ui-ux / phase-5-2 / ui-spec.schema 빈틈 식별

### 4.1 `7-ui-ux.md` 빈틈 (구체 line 번호 + 보강안)

| # | line | 현 명세 | 빈틈 | 보강안 | Q 답 매핑 |
|---|---|---|---|---|---|
| **1** | `7-ui-ux.md:65` "JSX import 그래프" | modern SPA 가정 | jQuery / Vanilla / JSP fallback 부재 | §3.1 추출 대상 표 확장 — Tier 1~4 fallback 명시 | Q5 |
| **2** | `7-ui-ux.md:78` "실제 화면 캡처/디자인 (Figma 영역)" 미추출 | 시각 의도적 제외 | 사용자 요구 3번 (visible) 정면 충돌 | §3.2 미추출 → 신설 deliverable 9 (visual-manifest) 로 분리 + 본 §3.2 항목 삭제 | Q2 |
| **3** | `7-ui-ux.md:166-184` 디자인 토큰 W3C DTCG 호환 명시 | DTCG 표준 호환 명시되어 있음 ✅ | extracted_from enum (`ui-spec.schema.json:163-169`) 만 존재 / **DTCG $type / $value 구조** 미명시 | DTCG 1.0 spec 정합 표기 추가 (`{ $type: "color", $value: "#0066FF" }`) | Q6 |
| **4** | `7-ui-ux.md:96` "관련 API: getOrders" | API 호출 매핑 단순 | **MSW handler / OpenAPI operationId** 권위 매개체 미명시 | §4 페이지 인벤토리 형식에 `msw_handler` + `openapi_operation_id` 필드 추가 | Q6 |
| **5** | `7-ui-ux.md:217` 입력에 "Storybook (있으면)" | 보조 입력 | **Storybook CSF v3+ 가 1순위 권위 매개체** 미반영 | §9 추출 흐름 → Storybook CSF 우선 분기 추가 (있으면 1순위 / 없으면 JSX AST) | Q6 |
| **6** | (부재) | 분산 상태 (5 진실) 명세 | 전체 부재 | deliverable 8 신설 또는 §6 다음 §6.5 신설 | Q3 |
| **7** | (부재) | 이벤트-주도 흐름 / 렌더링 사이클 | 전체 부재 (§5 user-flows 는 화면 간 전이만) | deliverable 8 또는 §5.5 신설 | Q4 |
| **8** | (부재) | a11y / i18n | 전체 부재 | Q8 결단 후 §11 신설 (체크리스트) + br.schema.json `br_type` 확장 (fe_a11y / fe_i18n) | Q8 |
| **9** | `7-ui-ux.md:246-258` 신뢰도 표 | 7개 영역 평균 75% | **분산 상태 / 시각 / 이벤트 / legacy / a11y / i18n 누락** | 신규 영역 추가 + ADR-009 단계 모델 적용 (단계 1~5 분할) | Q9 |
| **10** | `7-ui-ux.md:289-305` 흔한 함정 | 4 함정 | **분산 상태 drift / SSR-CSR mismatch / hydration / suspense fallback** 함정 부재 | §13 함정 5~10 추가 | Q3+Q4 |

### 4.2 `phase-5-2-ui.md` 빈틈

| # | line | 빈틈 | 보강안 |
|---|---|---|---|
| 1 | `phase-5-2-ui.md:33-54` "5개 하위 산출물 병렬" | 분산 상태 / 시각 / 이벤트 미포함 | 7~8 산출물 병렬 (또는 phase-5-2-a/b/c/d 분할 — Scenario B) |
| 2 | `phase-5-2-ui.md:155-165` 신뢰도 표 | 7개 | 신규 12+ 영역 |
| 3 | `phase-5-2-ui.md:140-151` 승인 게이트 | 8 항목 | 신규 항목 4건 (drift-validator (state-map ↔ component) + visual baseline hash + a11y axe report + i18n coverage) |
| 4 | (부재) | drift-validator FE 적용 | Phase 4.5 자동 검증 패턴 적용 — state-map.json ↔ state-map.mermaid drift 검증 의무화 |
| 5 | (부재) | static tool 진짜 실행 (axe / Lighthouse / MSW verify) | §X 신설 — no-simulation 정책 정합 |

### 4.3 `ui-spec.schema.json` 빈틈

| # | line | 빈틈 | 보강안 |
|---|---|---|---|
| 1 | `ui-spec.schema.json:13-15` framework enum | jQuery / Vanilla / JSP / MPA 부재 | enum 추가: `["react", "vue", "angular", "svelte", "next", "nuxt", "remix", "jquery_legacy", "vanilla", "jsp", "mpa", "unknown"]` |
| 2 | `ui-spec.schema.json:117-159` components | event_handlers / state_subscriptions / api_calls / suspense_boundary 부재 | components[].properties 확장 (4 필드 추가) |
| 3 | `ui-spec.schema.json:127-140` level enum | atom~widget | legacy: `["dom_widget", "selector_group"]` 추가 (Tier 3) |
| 4 | (부재) | stores / state_machines / event_handlers 최상위 키 | 별도 schema (state-map.schema.json) 신설 권고 (Scenario B) |
| 5 | (부재) | visual_snapshots 키 | 별도 schema (visual-manifest.schema.json) 신설 |
| 6 | `ui-spec.schema.json:259` human_review_status enum | "pending/confirmed/needs_planner_review" | + "needs_designer_review" / "needs_a11y_audit" 추가 |

→ **빈틈 top 5 (Stage 2 Gate 1 결단 입력)**:

1. **분산 상태 (state-map) deliverable 신설** — Q3 (5 진실 부재 = 가장 큰 사상 충돌)
2. **시각 산출 (visual-manifest) deliverable 신설** — Q2 (사용자 요구 3번 정면 미해소)
3. **legacy fallback Tier 1~4 + selector-graph.schema 신설** — Q5 (사용자 진단 "어떻게 분석해야 되는지가 없잖아" 직접 대응)
4. **권위 매개체 격상 (CEM / SCXML / DTCG / MSW / axe-core)** — Q6 (이식성 ★★★ 의무 정합)
5. **신뢰도 모델 단계화 (ADR-009 패턴 FE 적용)** — Q9 (정직 표기 강화)

---

## 5. ★ Stage 2 Gate 1/2/3 결정 항목 정리

### Gate 1 (핵심 구조) — Senior 권고 입력

| 결정 항목 | 옵션 | Senior 권고 | 근거 (사상 정합) |
|---|---|---|---|
| **G1-1. spectrum 우선순위** | (a) Modern SPA only / (b) + jQuery legacy / (c) + JSP / (d) all + Native | **(b) Modern SPA + jQuery legacy + JSP 예외** | Q1 — ★★★ 회피 목록 자산화 가치. Native 는 v1.5 이연. |
| **G1-2. deliverable 신설 vs 보강** | A (보강) / B (신설 8/9) / B-Lite (단계 분할) | **B-Lite** | §3 — 사상 정합 + 변경 비용 완화 |
| **G1-3. schema 통합 vs 분리** | (a) ui-spec 단일 확장 / (b) state-map + visual-manifest 분리 / (c) 양쪽 + cross-link | **(c) 분리 + Phase 4.5 cross-link 패턴** | Phase 4.5 정합 (`phase-4-5-formal-spec.md`) |
| **G1-4. 산출물↔테스트 매개체 표준 채택** | plan §4 표 + Senior 권고 표 (Q6) | **★★★ 6종 (CEM / SCXML / DTCG / MSW+OpenAPI / axe-core / .d.ts) + ★★ 2종 (CSF / Playwright+visual-manifest)** | Q6 — 1차 사료 + 도구 호환 + 이식성 ★★★ |

### Gate 2 (보강 범위) — Senior 권고 입력

| 결정 항목 | 옵션 | Senior 권고 | 근거 |
|---|---|---|---|
| **G2-1. 비기능 차원 v1.4 포함** | 전체 포함 / a11y+i18n+정적보안 만 / 전부 v1.5 이연 | **a11y + i18n + 정적 보안 (XSS/dangerouslySetInnerHTML) 포함 / 운영 NFR (LCP/CLS) v1.5 이연** | Q8 — ADR-001 §명시적 제외 재해석 |
| **G2-2. legacy cover 범위** | (a) Tier 1-2 만 / (b) + Tier 3 (jQuery) / (c) + Tier 4 (JSP) | **(c) — 단 Tier 4 = Stage 6 BE/FE 분리 정책의 예외 케이스로 ADR 의무** | Q5 + Q7 |
| **G2-3. BE/FE 분리 정책** | (a) 단일 PoC / (b) 분리 (default) + JS풀스택 예외 | **(b) — Scenario A (분리) default + Scenario B (JS풀스택) + C (JSP) ADR 명시** | Q7 |
| **G2-4. ADR-001 §명시적 제외 갱신** | 갱신 / 갱신 X | **갱신 — "비기능 측정" → "운영 NFR 측정" 으로 좁힘** | Q8 — 코드 정적 분석 가능 NFR 포함 정당화 |

### Gate 3 (검증 전략) — Senior 권고 입력

| 결정 항목 | 옵션 | Senior 권고 | 근거 |
|---|---|---|---|
| **G3-1. mini-PoC 진입 기준** | Stage 3 종료 후 / Stage 3-1 종료 후 (병행) | **Stage 3-1 종료 후 즉시 — Stage 3-2 와 mini-PoC 병행** | 4원칙 4번 fail-fast + B-Lite 분할 정합 |
| **G3-2. PoC #04 대상** | RealWorld FE only / RealWorld + 사내 FE 일부 / RealWorld + 사내 FE 전체 | **RealWorld FE (modern React fork) — Stage 5 / 사내 적용은 v1.4.0 release 후 분리 트랙 (★ adoption workspace)** | §8.1 단일 PoC 과적합 회피 (CLAUDE.md 절대 우선순위) |
| **G3-3. 신뢰도 목표** | 0.75 (현 ui-spec) / 0.80 / 0.85 / 0.90 | **0.80 (Stage 5 종료 시) — Stage 5 후 진짜 도구 1회 실행 (axe / Storybook / Playwright) 시 0.85+** | ADR-009 단계 4 패턴 (no-simulation 정책 정합) |
| **G3-4. Sprint 분할** | mini-PoC 1주 / 본격 PoC 2-3주 / Sprint 단위 | **Stage 4 mini-PoC = 1주 fail-fast / Stage 5 = 4-6 sprint (BE PoC #02/#03 동급)** | plan §1 Stage 표 정합 |

---

## 6. 신뢰도 정직 표기 권고

### 6.1 현 모델 평가

`7-ui-ux.md:246-258` 7개 영역 평균 75% = **단일 평균값** = ADR-009 단계 모델 (`phase-4-5-formal-spec.md:237-251`) 의 단계 1 (자연어 단독) 수준. v1.4 에서 단계 2~4 도달 가능성 평가 의무.

### 6.2 v1.4 신뢰도 모델 권고 (FE 적용 — ADR-009 단계 패턴)

| 단계 | 조건 | 신뢰도 |
|---|---|---|
| 단계 1 | 자연어 단독 (현 v1.3 ui-spec) | 60-75% |
| 단계 2 | + Phase 4.5 등가물 (state-map + visual-manifest + br-fe.json) | 75-82% |
| 단계 3 | + drift-validator FE 적용 (state-map.json ↔ state-map.mermaid / component-tree.json ↔ component-tree.mermaid) | 80-85% |
| 단계 4 | + 진짜 도구 1회 실행 (axe-core / Storybook test / Playwright + 5종 물증) | 85-92% |
| 단계 5 | + 사용자 검토 완료 (디자이너 / 기획자 / a11y audit) | 92-95% |

**정직 표기 의무 (FE 신규)**:
- ❌ 시각 baseline 시뮬레이션 금지 — Playwright 진짜 실행 의무 (no-simulation 정책 정합)
- ❌ axe-core 시뮬 금지 — 진짜 실행 의무
- ✅ DOM uncontrolled state 추출 시 -10%p 패널티 (LLM 추론 한계)
- ✅ legacy Tier 3/4 신뢰도 cap = 0.65 (Q1 표 참조)

### 6.3 신뢰도 영역별 표 (v1.4 권고 — 7-ui-ux §10 대체안)

| 영역 | Tier 1 (modern SPA) | Tier 2 (Vue/Svelte) | Tier 3 (jQuery legacy) | Tier 4 (JSP) |
|---|---|---|---|---|
| 페이지 인벤토리 | 0.95 | 0.90 | 0.65 | 0.60 |
| 컴포넌트 트리 | 0.90 | 0.85 | 0.50 (selector-graph 대체) | 0.40 |
| 사용자 흐름 (단순) | 0.85 | 0.85 | 0.70 | 0.65 |
| 사용자 흐름 (조건부) | 0.65 | 0.65 | 0.55 | 0.50 |
| **분산 상태 (server)** | 0.90 | 0.85 | 0.40 | 0.30 |
| **분산 상태 (client)** | 0.85 | 0.80 | 0.50 | 0.30 |
| **분산 상태 (URL/form)** | 0.95/0.90 | 0.90/0.85 | 0.85/0.75 | 0.80/0.70 |
| **분산 상태 (DOM uncontrolled)** | 0.50 | 0.50 | 0.50 | 0.45 |
| **이벤트 흐름 (sequence)** | 0.80 | 0.75 | 0.55 | 0.50 |
| **시각 baseline (Playwright)** | 0.95 (deterministic) | 0.95 | 0.90 | 0.85 |
| 디자인 토큰 (DTCG) | 0.90 | 0.85 | 0.30 | 0.25 |
| **a11y (axe-core)** | 0.85 | 0.80 | 0.70 | 0.65 |
| **i18n (FormatJS)** | 0.85 | 0.80 | 0.60 | 0.55 |
| 사용자 시나리오 | 0.60 | 0.60 | 0.55 | 0.50 |

**평균**: Tier 1 ~83% / Tier 2 ~80% / Tier 3 ~62% / Tier 4 ~55%.

→ **권고**: Stage 5 PoC #04 신뢰도 목표 = **0.80** (Tier 1 평균 - 5%p 안전 마진).

---

## 7. Stage 4 mini-PoC 범위 권고

### 7.1 plan 권고 범위 평가

`plan-v1.4-fe-track.md:56` "1 page+1 컴포넌트+1 flow+1 state+1 visual" 평가:

| 항목 | 평가 | Senior 보강 |
|---|---|---|
| 1 page | ✅ 충분 | RealWorld editor (`/editor`) 권고 — 폼 + 분산 상태 + 시각 모두 검증 가능 |
| 1 컴포넌트 | ✅ 충분 | EditorForm — props + state + event 모두 |
| 1 flow | ✅ 충분 | "글 작성 → 발행 → 상세" — sequence + state transition |
| 1 분산 상태 | ⚠️ 부족 | **2 진실 동시** (server cache + client form state) — drift 검증 가능성 |
| 1 visual | ⚠️ 부족 | **2 viewport** (desktop + mobile) — visual-manifest 형식 검증 |

### 7.2 보강 권고

```
Stage 4 mini-PoC 범위 (1주 fail-fast):

대상: gothinkster/realworld 의 react-redux fork 1개 (Vite + React 18+)

산출물 (신설 schema 검증 목적):
  ✅ ui-spec.json (확장 — event_handlers / api_calls 검증)
  ✅ state-map.json (1 컴포넌트 — 2 진실)
  ✅ visual-manifest.json (1 page — 2 viewport)
  ✅ component-tree.mermaid + state-map.mermaid (drift-validator 적용)

검증 (no-simulation 정책 정합):
  ✅ Playwright 진짜 실행 (1회) — visual baseline 생성
  ✅ axe-core 진짜 실행 (1회) — a11y 검증 가능성 입증
  ⏳ MSW handler 1개 작성 — OpenAPI operationId 입력 가능성 입증
  ⏳ Storybook CSF v3 1개 작성 — interaction test 자동 입증

종료 조건 (fail-fast):
  - 이중 렌더링 정합 (drift 0 또는 finding 등록)
  - 신뢰도 0.75+ 도달
  - 사상 위반 0 (no-simulation / 단일 진실 / 텍스트 SSOT)
  - finding ≤ 5건 / antipattern 후보 ≥ 1건

종료 시 결단:
  ✅ Stage 5 진입 (본격 PoC #04)
  ❌ 사상 위반 발견 시 Stage 3 revert (4원칙 4번)
```

### 7.3 보강 근거

- **2 진실 동시**: drift-validator FE 적용 가능성 검증 = Stage 5 핵심. mini-PoC 에서 반드시 한 번 — fail-fast.
- **2 viewport**: visual-manifest 의 multi-snapshot 패턴 검증. desktop only = 산업 표준 미달.
- **1주 cap 유지**: 4원칙 4번 fail-fast 정합. 부풀리지 않음.

---

## 8. 출처 (인용 + 1차 사료 ID)

### 8.1 본 레포 컨텍스트 인용

| 인용 항목 | 파일:line |
|---|---|
| ★★★ 가치 명세 | `CLAUDE.md:15-21` |
| ★★★ 산출물 이식성 5종 | `CLAUDE.md:23-29` |
| ★★★ Static Tool 시뮬 절대 금지 | `CLAUDE.md:33-41` |
| 4원칙 | `CLAUDE.md:43-50` |
| 본 트랙 7 요구사항 | `DEC-2026-05-01-v1.4-FE-트랙-진입.md:23-29` |
| 8 Stage 분할 | `DEC-2026-05-01-v1.4-FE-트랙-진입.md:65-74` |
| 산출물↔테스트 매개체 표 | `plan-v1.4-fe-track.md:129-141` |
| 9Q | `plan-v1.4-fe-track.md:88-98` |
| Phase 4.5 5 산출물 | `phase-4-5-formal-spec.md:70-148` |
| Phase 4.5 신뢰도 단계 | `phase-4-5-formal-spec.md:237-251` |
| 자동 검증 step | `phase-4-5-formal-spec.md:163-181` |
| no-simulation 5종 물증 | `phase-4-5-formal-spec.md:184-210` |
| 이중 렌더링 사상 | `ADR-008-이중-렌더링-사상.md:36-59` |
| 도구 선정 기준 | `ADR-008-이중-렌더링-사상.md:114-122` |
| 사상 스택 | `ADR-001-사상적-기반.md:18-38` |
| 명시적 제외 (NFR) | `ADR-001-사상적-기반.md:74` / `README.md:214-216` |
| 7대 산출물 | `ADR-002-7대-산출물.md:18-26` |
| 7-ui-ux 추출 대상 | `7-ui-ux.md:60-75` |
| 7-ui-ux 미추출 (시각) | `7-ui-ux.md:78` |
| 7-ui-ux 신뢰도 75% | `7-ui-ux.md:246-258` |
| phase-5-2 5 산출물 | `phase-5-2-ui.md:33-54` |
| phase-5-2 승인 게이트 | `phase-5-2-ui.md:140-151` |
| ui-spec.schema framework enum | `ui-spec.schema.json:13-15` |
| ui-spec.schema components | `ui-spec.schema.json:114-159` |
| BE rules.json 4영역 추출 | `5-business-rules.md:60-69` |
| BE domain 신뢰도 | `2-domain.md:165-179` |

### 8.2 1차 사료 (외부 — Senior 권고 근거)

| 권위 매개체 | 1차 사료 ID | 비고 |
|---|---|---|
| Custom Elements Manifest (CEM) | webcomponents/custom-elements-manifest (★ W3C WICG) | 컴포넌트 spec 표준 |
| SCXML | W3C SCXML 1.0 Recommendation (2015) | state-machine 표준 |
| DTCG (Design Tokens) | W3C Design Tokens Community Group | 디자인 토큰 표준 |
| WCAG 2.1 AA | W3C WCAG 2.1 (2018) | a11y 표준 |
| ICU MessageFormat | Unicode CLDR ICU | i18n 표준 |
| Storybook CSF v3 | Storybook 공식 docs (storybook.js.org) | 산업 사실상 표준 |
| Playwright | Microsoft Playwright 공식 | 시각 + E2E |
| MSW | mswjs.io 공식 | API mock 산업 표준 |
| axe-core | Deque Systems / dequelabs/axe-core | a11y 도구 |
| OpenAPI 3.1 | OpenAPI Initiative / Linux Foundation | API 표준 (BE 산출물 그대로) |
| Pact | Pact Foundation | CDC 표준 |
| FormatJS | formatjs.io | i18n 도구 |
| Lighthouse CI | Google web.dev | 성능 도구 |

### 8.3 정직 한계 표기

- 본 Senior 답은 **본 레포 직접 read** + **Senior 산업 일반 지식** 기반. 외부 공식 docs 의 최신 spec 변경은 미반영 가능 — Stage 1 의 공식문서 / 테크기업 사례 에이전트 산출과 cross-validation 의무.
- 시뮬레이션 도구 사용 0 — 모든 권고는 "사용자가 Stage 4/5 에서 진짜 실행 의무" 명시.
- 이식성 등급 (★★★ / ★★ / ★) 평가는 본 방법론 ★★★ 가치 명세 (`CLAUDE.md:23-29`) 와 1차 사료 권위 + 도구 호환 기준. 정량 측정 미시행 (Stage 5 PoC #04 검증 필요).

---

## 9. 종결 진술

> Senior FE / 본 방법론 통합 관점에서 9Q 모두 강한 답 도출.
> ★ 권고: **Scenario B-Lite (comprehensive — 단계 분할)**.
> ★ 빈틈 top 5: 분산 상태 deliverable 부재 / 시각 산출 deliverable 부재 / legacy fallback 부재 / 권위 매개체 격상 / 신뢰도 단계 모델 부재.
> ★ Gate 1 핵심 결정: G1-2 (B-Lite) + G1-4 (★★★ 6종 매개체 채택) + G1-1 (Modern SPA + jQuery legacy + JSP 예외).
> ★ 사상 정합 100% — Static Tool 시뮬 절대 금지 / 본체 격상 우선 / 이중 렌더링 / Phase 4.5 패턴 자산 재사용 / 신뢰도 정직 표기 모두 반영.
> mini-PoC (Stage 4) 1주 cap 유지 + 2 진실 / 2 viewport 보강 권고.

**End of Senior FE Research v1.4 FE 트랙 Stage 1.**
