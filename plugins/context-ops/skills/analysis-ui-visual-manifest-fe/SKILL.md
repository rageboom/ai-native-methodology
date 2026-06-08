---
name: analysis-ui-visual-manifest-fe
description: Use when project contains design tokens (DTCG / W3C format), Tailwind config, shadcn components, MUI/Chakra/Mantine theme, or Storybook stories. Generates visual-manifest.json (산출물 9). FE-specific. Stage = analysis, track = FE.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-ui-visual-manifest-fe — Visual Manifest (FE)

DTCG token / 시각 시스템 / 컴포넌트 카탈로그.

## 사전 조건

- FE 트랙 (디자인 token / Tailwind / shadcn / MUI 시그널)

## 절차

1. **Design token 추출** — DTCG (W3C Design Tokens Community Group) 표준 우선:
   - `tokens.json` / `design-tokens.json`
   - Tailwind `theme` config
   - shadcn `components.json` + CSS variables
   - MUI `theme` / Chakra `theme` / Mantine `theme`
2. **Token 카테고리 분류** — color / typography / spacing / shadow / radius / motion
3. **Component 카탈로그** — Storybook stories / shadcn registry / 직접 정의 컴포넌트
4. **visual-manifest.json 작성** — `schemas/visual-manifest.schema.json`:
   ```json
   {
     "tokens": { "color": {...}, "typography": {...}, ... },
     "token_format": "dtcg | tailwind | shadcn | mui",
     "components": [...],
     "meta_confidence": {...}
   }
   ```
5. **DTCG 외 format → DTCG 변환** 권장 (권위 매개체 표준)

## 산출물

`<user-project>/.ai-context/output/visual-manifest.json`

## 인용

- 정책: methodology-spec/deliverables/9-visual-manifest.md
- 정책: methodology-spec/workflow/ui.md
- schema: schemas/visual-manifest.schema.json
- ADR: ADR-FE-005 (권위 매개체 표준)
