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
2. **WCAG 2.2 기준** — Level A / AA / AAA 위반 분류
3. **AP-FE-A11Y-XXX 등재** — anti-pattern 형태 (`quality` phase 통합). `id-conventions.md` §3 카테고리 정합 (AP-FE prefix / sub `A11Y` / `AP-FE-{SUB}-NNN` 패턴 정합).
4. **a11y-spec.json 작성** — `schemas/a11y-spec.schema.json`

## 산출물

`<user-project>/.aimd/output/a11y-spec.json`

## 인용

- 정책: methodology-spec/deliverables/10-a11y-spec.md
- schema: schemas/a11y-spec.schema.json
- WCAG 2.2 (cross-check 권고)
