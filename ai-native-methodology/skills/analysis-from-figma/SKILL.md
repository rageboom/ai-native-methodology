---
name: analysis-from-figma
description: Use when user provides Figma reference as analysis input. Requires Figma desktop app with target frame selected (file URL alone insufficient). Extracts screens, components, design tokens via MCP figma-desktop tools. Track = FE. Stage = analysis (input). Typically auto-dispatched by analysis-input-orchestrate.
allowed-tools: Read, Bash, mcp__figma-desktop__get_design_context, mcp__figma-desktop__get_metadata, mcp__figma-desktop__get_variable_defs, mcp__figma-desktop__get_screenshot
---

# analysis-from-figma — Figma 디자인 흡수

Figma 디자인을 입력 받아 화면 + 컴포넌트 + 디자인 토큰 추출 → FE 트랙 analysis 산출물 seed.

> **단일 책임**: Figma 디자인 흡수. 코드 / spec / 문서 흡수는 각각 다른 skill.

## 사전 조건 (★ 의무)

- **Figma desktop 앱 실행 + 분석 대상 frame 선택 상태** (selection 부재 시 MCP 도구 실패)
- `mcp__figma-desktop__*` MCP 가용 (미연결 시 `state.blocked` + 사용자 안내)
- 사용자가 file URL 만 제공한 경우 → "Figma desktop 에서 해당 frame 선택" 안내 후 진행

## 절차 (공식 workflow / Figma Dev Docs 인용)

1. **selection 확인** — `get_metadata` 1회 호출. 응답이 instruction text 만 또는 abort → state.blocked + 사용자 재선택 안내.
2. **design context 흡수** — `get_design_context` → React+Tailwind 구조 표현 받기. response 가 크면 → 3 단계 (node map 활용 재호출).
3. **node map 활용 재호출** (response 큰 케이스) — `get_metadata` 로 sparse node map (layer id/name/type/position/size) 확보 후 sub-frame 별 `get_design_context` 재호출.
4. **visual ref 캡처** — `get_screenshot` 1회 호출 → PNG 저장 (산출물 asset_refs 등재).
5. **디자인 토큰 흡수** — `get_variable_defs` → color / spacing / typography variable + style.
6. **컴포넌트 트리 정리** — node map 기반 component hierarchy 구축 (parent_id 추적).
7. **산출 작성** — `.aimd/<scope>/planning/figma-extract.json` (schema = `schemas/figma-extract.schema.json`).

## 산출물

- `.aimd/<scope>/planning/figma-extract.json` (strict / additionalProperties:false)
- `.aimd/<scope>/planning/assets/figma-screenshot-*.png` (visual ref / binary 보관)

## scope-out (★ Figma MCP 표면에 없음 — research 2026-05-15 확인)

- **interaction (prototype 연결)** — 화면 간 transition / event 흐름
- **animation** — motion / transition spec
- **autolayout 세부 constraint** — flex / wrap / spacing 디테일
- **multi-frame variant 자동 traversal** — variant set 순회
- **plugin data** — 외부 plugin 이 frame 에 박은 metadata

위 항목 필요 시 사용자가 별도 수동 캡처 또는 prompt 로 보강 의무. 본 skill 은 추정 ❌ (no-simulation 정합).

## 본체 명세 참조

- `methodology-spec/workflow/input.md` §5종 입력 (b)
- `methodology-spec/plugin-charter.md` §1 R8 + R14 (FE 트랙)
- Figma Dev Docs — https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/

## When NOT to invoke

- 사용자가 코드 / spec 만 제공 (디자인 자료 부재) → 본 skill skip
- 사용자가 BE 백오피스 API 만 분석 (UI 무관) → 본 skill skip
- Figma desktop 앱 미실행 또는 selection 부재 → state.blocked + 사용자 안내 (skill 강행 ❌)
- interaction / animation 정보 필요 시 → 사용자 prompt 보강 + `analysis-from-prompt` 호출
