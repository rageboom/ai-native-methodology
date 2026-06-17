---
name: analysis-ui-visual-manifest-fe
description: Use when a FE project has a visual system worth pinning (design tokens / Tailwind / shadcn / MUI·Chakra·Mantine theme / Storybook) and you need a visual-regression baseline. Generates visual-manifest.json (산출물 9) — a PNG snapshot manifest captured by a real browser tool. Design tokens themselves are owned by ui-spec.design_tokens (this artifact references them; it does NOT re-extract them). FE-specific. Stage = analysis, track = FE.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-ui-visual-manifest-fe — Visual Manifest (FE)

시각 회귀(visual-regression) **PNG 스냅샷 매니페스트**. `schemas/visual-manifest.schema.json` 은 `additionalProperties:false` 의 스냅샷 전용 스키마다 — page × viewport × locale 별 PNG 를 진짜 브라우저 도구(Playwright / Percy / Chromatic / Puppeteer / Cypress)로 캡처한 baseline 을 모델링한다.

> ⚠️ **토큰 home (v0.57.0 / cycle4 visual-manifest-03 결단).** 디자인 토큰(DTCG color/typography/spacing/shadow)의 SSOT 는 본 산출물이 아니라 **`ui-spec.design_tokens`** (DTCG 2025.10 정합)다. 본 스키마에는 token/component 필드가 없다(=스냅샷 전용). 여기서 토큰을 재추출하지 말고 `cross_links` 로 ui-spec 을 참조하라. (과거 SKILL 이 `tokens`/`token_format`/`components` 추출을 지시했으나 스키마가 이를 거부 = skill↔schema 모순이었고, 본 결단으로 ui-spec.design_tokens 로 단일화.)

## 사전 조건

- FE 트랙 (디자인 token / Tailwind / shadcn / MUI 시그널 = 시각 시스템 존재 신호)
- **선행 산출물**: `ui-spec.design_tokens` (토큰은 거기서 먼저 추출 — 본 산출물은 스냅샷만 담당)

## 절차

1. **framework 감지** — `framework` (ui-spec.schema.json framework enum 정합).
2. **viewport_matrix 정의** — 캡처할 viewport 집합 (스냅샷 일관성 진실 모델 / 의무).
3. **locale_matrix 정의** (선택) — i18n 영향 검증용 다국어 매트릭스.
4. **스냅샷 캡처** — 진짜 브라우저 도구로 page × viewport × locale 별 PNG 생성. no-simulation 정책: 각 snapshot 의 `captured_by` 는 real 도구 enum (`playwright_real` / `percy_real` / `chromatic_real` / `puppeteer_real` / `cypress_real`). 캡처 환경 부재 시 `snapshots: []` (빈 배열)로 정직하게 둔다 — `simulation` 은 -5%p + 사유 의무.
5. **baseline_management** — baseline 갱신 정책 기록 (정책 근거는 ## 인용 참조).
6. **cross_links** — visual-manifest ↔ ui-spec(토큰·컴포넌트 SSOT) / state-map / api 관계 (Phase 4.5 cross-link 패턴).

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/visual-manifest.json`

## 인용

- 정책: methodology-spec/deliverables/9-visual-manifest.md
- 정책: methodology-spec/workflow/ui.md
- schema: schemas/visual-manifest.schema.json
- 토큰 SSOT: schemas/ui-spec.schema.json (design_tokens)
- ADR: ADR-FE-005 (권위 매개체 표준) / ADR-FE-002 (§2.3 baseline 정책)
