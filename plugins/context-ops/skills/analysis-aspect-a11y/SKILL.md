---
name: analysis-aspect-a11y
description: Use when frontend code present. Run axe-core / Playwright accessibility check (WCAG 2.2). Generates a11y-spec.json (산출물 10). Real tool execution mandatory (no simulation). Stage = analysis, aspect = cross-cutting (FE).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# aspect-a11y — Accessibility (FE)

WCAG 2.2 기반 접근성 점검. axe-core / Playwright 진짜 실행 (no-simulation).

## 사전 조건

- FE 코드베이스 (UI rendered)
- axe-core 또는 Playwright 사용 가능 환경 — 부재 시 사용자에게 준비 요청

## 절차

1. **도구 진짜 실행 (CLAUDE.md no-simulation)**:
   ```bash
   # axe-core via Playwright
   npx playwright test --grep @a11y
   # 또는
   npx @axe-core/cli <url>
   ```
   환경 부재 시 사용자 위임 (CI) 명시 + 신뢰도 -5%p 기록
   - **running app 부재 분기 (v0.53.0)** — running app 부재 시 `static_source_review` tier 로 grep/semgrep 기반 정적 a11y(예: hardcoded `aria-label`, `role` 오용) 부분 산출 가능. simulation(-5%p)과 구분되는 정직 중간 tier (real-tool 도 simulation 도 아님). 이 tier 사용 시 `summary.reproduction_command`(grep·semgrep 명령) + 각 `violation.detection=static_heuristic` 기록 의무. static_heuristic violation 의 `id` 는 axe-core id 가 아니라 정적 linter(eslint-plugin-jsx-a11y) rule id 로 기록 (예: onClick-on-non-interactive → `click-events-have-key-events` / `no-static-element-interactions`).
     - **static_heuristic id 어휘 (MUI/RHF 등 폼 위주 FE 흔한 결함 포함)** — onClick-on-non-interactive trio 외에도 엔터프라이즈 폼 도메인에서 지배적인 다음 jsx-a11y rule id 를 메뉴로 포함한다: `tabindex-no-positive`(양수 tabIndex → focus order 깨짐 / SC 2.4.3), `control-has-associated-label`(label/htmlFor 연결 없는 입력·컨트롤 / SC 1.3.1), `anchor-is-valid`(href 없는·역할 모호한 `<a>` / SC 2.1.1·4.1.2). axe↔jsx-a11y id 는 1:1 매핑이 아니다 — 같은 결함이라도 detection 별로 다른 vocabulary 를 쓴다(예: 컴퓨티드 contrast 는 axe `color-contrast`, jsx-a11y 에 등가 rule 없음 / 아이콘-only 버튼의 접근가능 이름 부재는 axe `button-name`, jsx-a11y 에 직접 등가 없음 → static tier 에서도 axe id `button-name` 을 그대로 쓰고 detection=static_heuristic 으로만 표기). detection 값(`axe_emitted` vs `static_heuristic`)이 어느 vocabulary 의 id 인지를 결정하므로 둘을 섞지 않는다.
     - **NOT-ASSESSABLE 분리 (v0.57.0 / cycle4 a11y-spec-02)** — 이 tier 에서 판정 불가한 runtime-only check(color-contrast SC 1.4.3 / computed accessible-name / focus-order / reflow)는 `violations[]` 에 `blocks_baseline=false` 로 욱여넣지 말고 **`not_assessable[]`** 배열에 `{check_id, wcag_criterion?, reason, requires_tier?}` 로 기록한다. baseline/ratchet 게이트는 `not_assessable[]` 를 무시 — '위반 없음'(verified OK)과 '검증 불가'(could not verify)를 구조적으로 분리한다.
       - **canvas 로 그려지는 위젯(RealGrid / AG-Grid 등 그리드 본체)은 영구 not_assessable** — 그리드의 행/셀/헤더가 단일 2D `<canvas>` 픽셀로 그려져 DOM table/`role=grid`/`role=gridcell`/접근성 트리가 존재하지 않는다. 이런 check 는 `not_assessable[]` 에 귀속하고 `violations[]` 에 넣지 않는다. 중요: **runtime axe(axe_core_real) 실행으로도 이 판정이 upgrade 되지 않는다** — axe·pa11y·lighthouse 는 접근성 트리/DOM 을 읽지 canvas 픽셀을 읽지 않으므로, 세 자동 runtime tier 모두 canvas 그리드를 영구히 판정 불가다. 따라서 `requires_tier` 를 `axe_core_real` 로 찍으면 오해를 부른다(상위 자동화로 escalate 하면 풀린다는 거짓 약속). 벤더가 hidden DOM mirror/aria 표면을 제공하면 `requires_tier=vendor_dom_mirror`, 그렇지 않으면 `requires_tier=manual_expert_audit`(어떤 자동 tier 도 풀 수 없는 terminal) 로 기록한다.
2. **WCAG 2.2 기준** — Level A / AA / AAA 위반 분류
3. **AP-FE-A11Y-XXX 등재** — anti-pattern 형태 (`quality` phase 통합). `id-conventions.md` §3 카테고리 정합 (AP-FE prefix / sub `A11Y` / `AP-FE-{SUB}-NNN` 패턴 정합).
4. **a11y-spec.json 작성** — `schemas/a11y-spec.schema.json`

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/a11y-spec.json`

## 인용

- 정책: methodology-spec/deliverables/10-a11y-spec.md
- schema: schemas/a11y-spec.schema.json
- WCAG 2.2 (cross-check 권고)
- DEC-2026-06-18-fe-dogfood-cycle6 (cycle6 — canvas-grid 영구 not_assessable + static_heuristic id 어휘 확장)
