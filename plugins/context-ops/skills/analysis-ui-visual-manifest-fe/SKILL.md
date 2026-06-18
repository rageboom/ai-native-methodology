---
name: analysis-ui-visual-manifest-fe
description: Use when a FE project has a visual system worth pinning (design tokens / Tailwind / shadcn / MUI·Chakra·Mantine theme / Storybook) and you need a visual-regression baseline. Generates visual-manifest.json (산출물 9) — a PNG snapshot manifest captured by a real browser tool. Design tokens themselves are owned by ui-spec.design_tokens (this artifact references them; it does NOT re-extract them). FE-specific. Stage = analysis, track = FE.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-ui-visual-manifest-fe — Visual Manifest (FE)

시각 회귀(visual-regression) **PNG 스냅샷 매니페스트**. `schemas/visual-manifest.schema.json` 은 `additionalProperties:false` 의 스냅샷 전용 스키마다 — page × viewport × locale 별 PNG 를 진짜 브라우저 도구(Playwright / Percy / Chromatic / Puppeteer / Cypress)로 캡처한 baseline 을 모델링한다.

> ⚠️ **토큰 home (v0.57.0 / cycle4 visual-manifest-03 결단).** 디자인 토큰(DTCG color/typography/spacing/shadow)의 SSOT 는 본 산출물이 아니라 **`ui-spec.design_tokens`** (DTCG 2025.10 정합)다. 본 스키마에는 token/component 필드가 없다(=스냅샷 전용). 여기서 토큰을 재추출하지 말고 `cross_links` 로 ui-spec 을 참조하라. (과거 SKILL 이 `tokens`/`token_format`/`components` 추출을 지시했으나 스키마가 이를 거부 = skill↔schema 모순이었고, 본 결단으로 ui-spec.design_tokens 로 단일화.)

> ⚠️ **토큰 소유권 마커 (v0.58.0 / cycle5 ui-spec-01).** `ui-spec.design_tokens` 에 토큰을 채울 때, 토큰이 분석 대상 앱에서 **정의**되는지 외부 패키지에서 **import** 되는지를 SET 레벨 `token_ownership` (`local`/`external_package`/`mixed`/`unknown`) 로 명시하라. 외부 디자인시스템(예: `@sg/ui-bo` `foundation/*`)에서 가져오는 경우 `token_ownership: external_package` + `external_token_source: "@sg/ui-bo foundation/*"` 로 선언한다. 출처/소유권 정보를 `colors._note` / `colors._token_source_note` 같은 자유텍스트 키에 욱여넣지 말 것 — 이제 전용 필드가 있다 (근거는 ## 인용 참조).

## 사전 조건

- FE 트랙 (디자인 token / Tailwind / shadcn / MUI 시그널 = 시각 시스템 존재 신호)
- **선행 산출물**: `ui-spec.design_tokens` (토큰은 거기서 먼저 추출 — 본 산출물은 스냅샷만 담당)

## 절차

0. **캡처 도구 pre-flight gate (의무 선행).** 스냅샷 캡처 도구(Playwright / Storybook / Percy / Chromatic / Puppeteer / Cypress)가 프로젝트에 프로비저닝됐는지 먼저 확인하라(devDependencies / config / CI 시그널). **하나도 감지되지 않으면** 절차 4 (스냅샷 캡처)는 실행 불가다 — 이때 정직하게: `snapshots: []` (빈 배열) + `meta.confidence` 하향(+ `meta.warnings` 에 도구 부재 사유) + 최상위 `deliverable_value: "metadata_only"` 를 set 한다. 이 플래그는 framework/viewport_matrix 메타만 담긴 빈 manifest 가 '완료'로 위장하는 것을 막는다. 캡처 도구가 감지되면 `deliverable_value` 는 `full` (생략 시 default).
1. **framework 감지** — `framework` (ui-spec.schema.json framework enum 정합).
2. **viewport_matrix 정의** — 캡처할 viewport 집합 (스냅샷 일관성 진실 모델 / 의무). 비반응형(고정폭) desktop-only admin 도메인처럼 반응형 코드가 0인 경우, viewport_matrix 가 1-entry(예: desktop 단일)인 것은 **정상**이며 coverage shortfall 이 아니다 — 관찰된 반응형 분기 수만큼만 정의하라(없는 viewport 를 aspirational 로 부풀리지 말 것).
3. **locale_matrix 정의** (선택) — i18n 영향 검증용 다국어 매트릭스.
4. **스냅샷 캡처** — 진짜 브라우저 도구로 page × viewport × locale 별 PNG 생성. no-simulation 정책: 각 snapshot 의 `captured_by` 는 real 도구 enum (`playwright_real` / `percy_real` / `chromatic_real` / `puppeteer_real` / `cypress_real`). 캡처 환경 부재 시 절차 0 의 metadata_only 경로를 따른다 — `snapshots: []` (빈 배열)로 정직하게 둔다 / `simulation` 은 -5%p + 사유 의무.
5. **baseline_management** — baseline 갱신 정책 기록 (정책 근거는 ## 인용 참조).
6. **cross_links** — visual-manifest ↔ ui-spec(토큰·컴포넌트 SSOT) / state-map / api 관계 (Phase 4.5 cross-link 패턴). 단, 모든 cross_link 항목은 `from_snapshot` 을 요구하므로 `snapshots` 가 비어 있으면(metadata_only) cross_links 는 **N/A** 다 — 존재하지 않는 `from_snapshot` 을 억지로 만들지 말 것. 이 경우 토큰 home redirect(위 토큰 home 콜아웃 참조)는 cross_link 항목이 아니라 manifest 의 prose/note 로 남긴다.

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/visual-manifest.json`

## 인용

- 정책: methodology-spec/deliverables/9-visual-manifest.md
- 정책: methodology-spec/workflow/ui.md
- schema: schemas/visual-manifest.schema.json
- 토큰 SSOT: schemas/ui-spec.schema.json (design_tokens)
- ADR: ADR-FE-005 (권위 매개체 표준) / ADR-FE-002 (§2.3 baseline 정책)
- 결단: DEC-2026-06-17-fe-dogfood-cycle5 (cycle5 ui-spec-01 — design_tokens.token_ownership / external_token_source 외부 토큰 출처 정식 channel)
- DEC-2026-06-18-fe-dogfood-cycle6 (cycle6 — 캡처 도구 부재 pre-flight gate / deliverable_value=metadata_only / 빈 snapshots 시 cross_links N/A / 비반응형 admin 1-entry viewport_matrix 정상)
