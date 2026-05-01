# v1.4 FE 트랙 진입 plan — Stage 분할 + research-first

> **위치**: methodology body level (v1.4.0-dev 라인)
> **선행**: v1.3.1 (2026-05-01) 종결 ✅ + 본 레포 freeze 해제
> **목표**: FE 분석 방법론 정식 도출 + 본체 격상 + PoC #04 검증 → v1.4.0 MINOR release
> **우선순위 정합**: 품질 1순위 + 재작업 최소화 2순위
>
> **외부 plan 짝**: `~/.claude/plans/be-foamy-jellyfish.md` (사용자 승인본 / 2026-05-01 / 3 에이전트 점검 v2)

---

## 0. 배경 / 갭 식별 근거

### 0.1 트리거

v1.3.1 release (2026-05-01, c72d29c) 후 본 레포 freeze 상태였음. 사용자 결정:
1. freeze 해제
2. FE 트랙 정식 시작 (BE 한정 → BE+FE 양 트랙)
3. v1.4.0-dev 라인 신규 진입

### 0.2 사용자 진단 — "방법이 없잖아"

기존 FE 자산 (`7-ui-ux.md` 305줄 / `phase-5-2-ui.md` 196줄 / `ui-spec.schema.json` 275줄 / `templates/ui-spec.template.{md,mermaid}` / ADR-001 §FE) 은 **명세 분량은 BE deliverable 동급** 이지만, 실제 사용자 관점에서:

> "html / api fetch / css / jquery 같은 ui framework — 어떻게 분석해야 되는지가 없잖아"

= **modern React-like SPA + JSX import 그래프 + Tailwind/CSS Variables** 가정에 묶여 있음. 사내 FE 분석 대상 (jQuery legacy / Vanilla / MPA / 시각 산출 / 분산 상태 / 이벤트 / 렌더링 / a11y / i18n / 성능 / 보안) 미커버.

### 0.3 3 에이전트 점검 (외부 plan v1 → v2 재작성 시점) 공통 진단

- ❌ 산출물 → 테스트 코드 자동 도출 경로 부재 (Storybook CSF / Custom Elements Manifest / Pact / SCXML / DTCG / axe-core 같은 권위 매개체 미채택)
- ❌ visible 산출의 구체 형식 부재 (Chromatic / Percy / jest-image-snapshot baseline 형식 미정)
- ❌ BE/FE 분리 운영 정책 미명시
- ❌ 분산 상태 / 이벤트 / 렌더링 / legacy 의 구체 deliverable 형식 모두 research 위임

### 0.4 사용자 7 요구사항

1. 분석으로 끝 X — **산출물 = 마이그레이션 입력 스펙/지표 + 테스트 코드 작성 기반**
2. AI + 사람 동시 이해 (Schema-First + Mermaid + Markdown — BE 패턴)
3. UI 의 **visible 차원** 처리
4. 비즈니스 로직 동일 (FE BR / 분산 상태 / 이벤트)
5. **BE/FE 분리 운영** — 별도 개발자/프로젝트. 예외: JS 풀스택 (Node) / JSP (Java + 뷰) 혼재
6. **큰 뭉텅이 단위 승인제** (Stage 별 gate)
7. **모든 단계 기록 / 발전 과정 가시화**

---

## 1. 산출 목표 (Stage 별 — 8 Stage)

| Stage | 목적 | 종료 조건 | 주 산출 | 추정 분량 |
|---|---|---|---|---|
| **Stage 0** ✅ 본 세션 | freeze 해제 + Stage 분할 합의 | plan + DEC + STATUS + CHANGELOG + memory commit | 본 plan + DEC-v1.4-FE-트랙-진입 + STATUS/INDEX 갱신 | 1 세션 |
| **Stage 1** | 4원칙 1+2단계 — research × 3 | 9Q 답 도출 + 본체 빈틈 진단 | research-{official,industry,senior}-v1.4-fe.md + 진단 보고서 | 1~2 세션 |
| **Stage 2** | 4원칙 3단계 — 사용자 승인 (3 sub-gate) | Gate 1/2/3 결단 | DEC × 3 + 격상 시나리오 확정 | 1 세션 |
| **Stage 3** | 본체 격상 — deliverable 재설계 + 신설 + 산출물↔테스트 매개체 채택 | v1.4-alpha 명세 통과 + ADR 신설 | 신규/갱신 deliverable + schema + template + ADR + CHANGELOG | 2~4 세션 |
| **Stage 4** | mini-PoC 검증 (1주 small sprint, fail-fast) | RealWorld FE 1 page+1 컴포넌트+1 flow+1 state+1 visual 산출 | examples/mini-poc-fe-pre/ + finding | 1~2 세션 |
| **Stage 5** | 본격 PoC #04 (RealWorld FE) | 7대 산출물 7/7 + 신뢰도 0.85+ | examples/poc-04-realworld-fe-react/ | 4~6 세션 |
| **Stage 6** | BE/FE 분리 운영 정책 정식화 (횡단) | ADR 신설 + JS풀스택/JSP 혼재 예외 정책 | ADR-FE-분리정책 + methodology-spec/be-fe-separation.md | 1 세션 |
| **Stage 7** | v1.4.0 MINOR release 결단 | release 보고서 + 사내 적용 가능 시점 명시 | DEC-v1.4.0-release + docs/v1.4-promotion-report.md | 1 세션 |

**Stage 진행 원칙**:
- Stage N 종료 시 **사용자 승인 후** Stage N+1 진입 (skip / merge / 순서 변경 가능)
- Stage 마다 **commit ≥ 1** + **DEC ≥ 1** + **STATUS 갱신** (사용자 요구 7번 — 발전 과정 가시화)
- Stage 5 / 6 병행 가능

---

## 2. 작업 분할 — Stage 0 (본 세션)

```
독립 7건 — 의존 없음 (병렬 가능):

[1] plan-v1.4-fe-track.md (본 파일)        ← 4원칙 1단계 정식 산출 ✅
[2] DEC-2026-05-01-v1.4-FE-트랙-진입.md    ← 결단 등재
[3] decisions/STATUS.md 갱신                ← v1.4.0-dev 라인 진입 + Stage 0 종결
[4] decisions/INDEX.md 갱신                 ← 신규 결정 등재
[5] CHANGELOG.md 갱신                       ← [v1.4.0-dev] entry 신규 추가
[6] memory 신설 + 갱신 (3건)                ← project_v140_fe_track / v130_release_status / adoption_workspace + MEMORY.md
[7] commit                                  ← Stage 0 종결 단일 commit
```

---

## 3. 핵심 결정 포인트

### 3.1 Stage 1 research 9 question (Stage 1 진입 시 3 에이전트 분담)

| # | Question | 비고 |
|---|---|---|
| 1 | 분석 대상 spectrum — modern React/Vue/Next/Svelte / jQuery legacy / Vanilla / MPA / 혼합 / JSP — v1.4 cover 우선순위 | sub-set 결정 → Stage 5 PoC 대상 |
| 2 | 시각 산출 처리 — Chromatic/Percy/jest-image-snapshot 중 매개체 / manifest 형식 (URL/base64/외부 참조) | 사용자 요구 3번 |
| 3 | 분산 상태 표현 — server/client/URL/form/DOM state — ui-spec 통합 vs 별도 deliverable (state-map.schema) | 사용자 요구 4번 |
| 4 | 이벤트-주도 + 렌더링 사이클 — Mermaid sequence vs SCXML/XState vs React DevTools profiler | FE 고유 차원 |
| 5 | legacy 호환 — jQuery/Vanilla/MPA/JSP — JSX import 그래프 가정 대체 | 사용자 진단 |
| 6 | ★ 산출물 ↔ 테스트 자동 도출 경로 — §4 매개체 표 중 v1.4 표준 채택 | 사용자 요구 1번 |
| 7 | ★ BE/FE 분리 운영 정책 — 별도 deliverable 트리 / 별도 PoC / 별도 phase / JS풀스택+JSP 예외 | 사용자 요구 5번 |
| 8 | ★ 비기능 차원 — i18n / 성능 (Web Vitals) / 보안 (XSS/CSRF) / a11y (WCAG audit) — v1.4 포함 vs v1.5 이연 | 3 에이전트 추가 권고 |
| 9 | ★ visible 차원의 사람-가독 형식 — Storybook URL / 정적 HTML / 캡쳐 갤러리 | 사용자 요구 2번+3번 교차 |

### 3.2 Stage 2 사용자 승인 — 3 sub-gate 분산

| Gate | 결정 항목 | 산출 |
|---|---|---|
| **Gate 1** (핵심 구조) | spectrum 우선순위 / deliverable 신설 (보강 vs 신규 8/9) / schema 통합 vs 분리 / 산출물↔테스트 매개체 표준 채택 | DEC × 1 |
| **Gate 2** (보강 범위) | 비기능 차원 (i18n/성능/보안/a11y) v1.4 포함 vs v1.5 이연 / legacy cover 범위 / BE/FE 분리 정책 | DEC × 1 |
| **Gate 3** (검증 전략) | mini-PoC 진입 / PoC #04 대상 (RealWorld 만 vs 추가) / 신뢰도 목표 / Sprint 분할 | DEC × 1 |

### 3.3 Stage 3 격상 시나리오 (Gate 1 결과로 결정)

**Scenario A (minimal — 보강)**:
- `7-ui-ux.md` 보강 (분산상태/이벤트/시각 섹션 추가)
- `ui-spec.schema.json` 필드 확장
- `phase-5-2-ui.md` 갱신
- ADR-FE-001 (FE 추출기 가정 명시)

**Scenario B (comprehensive — 신설)**:
- deliverable 8 (분산 상태 / state-map) 신설
- deliverable 9 (시각 산출 / visual-manifest) 신설
- phase-5-2-a/b/c/d 분할 (ui / state / event / visual)
- ADR-FE-001~004 신설
- migration-cautions-fe.md 신설

---

## 4. 산출물 ↔ 테스트 도출 매개체 후보 (Stage 1 research 핵심 표)

CLAUDE.md ★★★ 가치 명세 = "그대로 입력 가능한 이식성". BE 의 rules.json / openapi.yaml / schema.json 처럼, FE 산출물도 **권위 매개체 + 테스트 자동 생성 경로** 묶음으로 결정해야 이식성 확보.

| 차원 | 산출물 형식 (권위 매개체 후보) | 테스트 자동 생성 경로 |
|---|---|---|
| 컴포넌트 스펙 | Storybook CSF v7 / Custom Elements Manifest / TypeScript .d.ts | CSF → @storybook/test interaction / .d.ts → Vitest props |
| 시각 (visible) | Chromatic baseline / jest-image-snapshot / Percy / Playwright visual | baseline 자체가 visual regression test |
| 분산 상태 | XState / SCXML (W3C) / Zustand snapshot / TanStack Query DevTools export | state-machine → property-based test |
| 이벤트-주도 흐름 | Mermaid sequence + sourcemap / Playwright codegen | flow → Playwright/Cypress E2E |
| API 계약 (FE 측) | Pact (Consumer-Driven Contract) / MSW handler / OpenAPI 3.1 | Pact verification + MSW = 통합 테스트 |
| 디자인 토큰 | DTCG (W3C Design Tokens) / Style Dictionary | token 변경 → visual regression diff |
| a11y | axe-core JSON report / WCAG 2.1 AA checklist | report 자체가 audit test |
| i18n | ICU MessageFormat / FormatJS extract | message coverage → 번역 누락 test |
| 성능 | Lighthouse CI / Web Vitals JSON / bundle-analyzer | budget → CI 회귀 test |
| 렌더링 사이클 | React DevTools profiler export / SCXML transition | profiler diff → re-render budget test |

→ Stage 1 research 9-Q 의 6번 결과로 **v1.4 표준 매개체 채택** (Stage 2 Gate 1 결정).

---

## 5. Stage 1 research 분담 (3 에이전트 병렬 — Stage 1 진입 시 활성)

| 에이전트 | 영역 | 권위 매개체 명시 |
|---|---|---|
| 공식문서 | W3C / WHATWG / WCAG / DTCG / OpenUI / RFC / 주요 framework 공식 | WCAG 2.1 / SCXML / Custom Elements Registry / DTCG spec / OpenUI Maturity Model / JSON Schema 2020-12 / OpenAPI 3.1 |
| 테크기업 사례 | Meta/Google/Microsoft/Vercel/Shopify/Netflix/Airbnb/Thoughtworks | Storybook CSF / Chromatic / Pact / MSW / Playwright codegen / jest-image-snapshot / Stryker / SafeTest / Polaris / Material 3 / Strangler fig + GenAI |
| Senior FE | 분산 상태 / 이벤트 / 렌더링 / legacy / a11y / i18n / 성능 / 보안 / 시각 | 9Q 의 본 방법론 통합 권고안 도출 |

(에이전트 prompt 세부 작성은 Stage 1 진입 시 — 본 plan 에서는 영역만 명시)

---

## 6. Lessons Learned

**Stage 0 (본 세션)**:
- 외부 plan v1 (단순 5Q) → 3 에이전트 점검 → v2 (9Q + Stage 분할 + 산출물↔테스트 매개체 표 + 3 sub-gate) 재작성 패턴이 사용자 요구 반영도를 4/7 → 7/7 로 격상.
- 사용자 요구 6번 "큰 뭉텅이 단위 승인" 은 plan 자체의 구조 (Stage 분할) 에 반영해야 의미 있음 — 단순 텍스트 명시로는 부족.

(Stage 1 이후 Lessons 누적 추가 예정)

---

## 7. 참조

- 외부 plan: `~/.claude/plans/be-foamy-jellyfish.md`
- 결단: `decisions/DEC-2026-05-01-v1.4-FE-트랙-진입.md`
- 진행: `decisions/STATUS.md` (v1.4.0-dev 라인 진입 표기)
- 변경: `CHANGELOG.md` v1.4.0-dev entry
- memory: `project_v140_fe_track.md` (신설)
- 사상 정합: CLAUDE.md ★★★ 가치 명세 + 4원칙 + 절대 우선순위 (품질 1 + 재작업 최소화 2)
