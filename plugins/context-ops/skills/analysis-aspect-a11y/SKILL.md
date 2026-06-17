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
     - **NOT-ASSESSABLE 분리 (v0.57.0 / cycle4 a11y-spec-02)** — 이 tier 에서 판정 불가한 runtime-only check(color-contrast SC 1.4.3 / computed accessible-name / focus-order / reflow)는 `violations[]` 에 `blocks_baseline=false` 로 욱여넣지 말고 **`not_assessable[]`** 배열에 `{check_id, wcag_criterion?, reason, requires_tier?}` 로 기록한다. baseline/ratchet 게이트는 `not_assessable[]` 를 무시 — '위반 없음'(verified OK)과 '검증 불가'(could not verify)를 구조적으로 분리한다.
2. **WCAG 2.2 기준** — Level A / AA / AAA 위반 분류
3. **AP-FE-A11Y-XXX 등재** — anti-pattern 형태 (`quality` phase 통합). `id-conventions.md` §3 카테고리 정합 (AP-FE prefix / sub `A11Y` / `AP-FE-{SUB}-NNN` 패턴 정합).
4. **a11y-spec.json 작성** — `schemas/a11y-spec.schema.json`

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/a11y-spec.json`

## 인용

- 정책: methodology-spec/deliverables/10-a11y-spec.md
- schema: schemas/a11y-spec.schema.json
- WCAG 2.2 (cross-check 권고)
