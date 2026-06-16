---
name: analysis-from-figma
description: Use when user provides Figma reference as analysis input. Requires Figma desktop app with target frame selected (file URL alone insufficient). Extracts screens, components, design tokens via MCP figma-desktop tools. Track = FE. Stage = analysis (input). Typically auto-dispatched by analysis-input-orchestrate.
allowed-tools: Read, Bash, mcp__figma-desktop__get_design_context, mcp__figma-desktop__get_metadata, mcp__figma-desktop__get_variable_defs, mcp__figma-desktop__get_screenshot
---

# analysis-from-figma — Figma 디자인 흡수

Figma 디자인을 입력 받아 화면 + 컴포넌트 + 디자인 토큰 추출 → FE 트랙 analysis 산출물 seed.

> **단일 책임**: Figma 디자인 흡수. 코드 / spec / 문서 흡수는 각각 다른 skill.

## 사전 조건 (의무)

- **Figma desktop 앱 실행 + 분석 대상 frame 선택 상태** (selection 부재 시 MCP 도구 실패)
- `mcp__figma-desktop__*` MCP 가용 (미연결 시 `state.blocked` + 사용자 안내)
- 사용자가 file URL 만 제공한 경우 → "Figma desktop 에서 해당 frame 선택" 안내 후 진행

## 절차 (공식 workflow / Figma Dev Docs 인용)

1. **selection 확인** — `get_metadata` 1회 호출. 응답이 instruction text 만 또는 abort → state.blocked + 사용자 재선택 안내.
2. **design context 흡수 (verbatim 의무)** — `get_design_context` → React+Tailwind 구조 표현 받기. response 가 크면 → 3 단계 (node map 활용 재호출). **사용자 가시 텍스트 (라벨 / 버튼 / 헤더 / placeholder / 컬럼명 / 라디오·체크박스 옵션) 는 본 호출의 실 반환 문자열을 verbatim 으로 채취** — `figma-extract.json` 의 `components[].text_content` 에 기록 + `provenance: "verbatim"`. `get_metadata` 의 layer name (`components[].name`) 을 텍스트로 오인 금지 — name=레이어명 ≠ 표시 텍스트.
3. **node map 활용 재호출 (silent skip 금지)** — response 큰 케이스: `get_metadata` 로 sparse node map 확보 후 **TEXT 노드를 포함한 모든 sub-frame 에 `get_design_context` 재호출 의무**. get_metadata 에서 멈추고 텍스트를 추론으로 채우는 것 ❌ (no-simulation 위배). verbatim 미확보 노드는 `provenance: "inferred"` 명시 + `scope_out_notes` 등재 (추론을 verbatim 으로 위장 금지).
4. **visual ref 캡처** — `get_screenshot` 1회 호출 → PNG 저장 (산출물 asset_refs 등재). verbatim 채취 cross-check 보조 (LLM 환각 차단).
5. **디자인 토큰 흡수** — `get_variable_defs` → color / spacing / typography variable + style.
6. **컴포넌트 트리 정리** — node map 기반 component hierarchy 구축 (parent_id 추적). TEXT 노드는 `text_content` + `provenance` 동반.
7. **산출 작성** — `.ai-context/scopes/<scope>/planning/figma-extract.json` (schema = `schemas/figma-extract.schema.json`).

## 산출 자격 조건 (gate)

산출물 통과 전 자가 검증 (discovery-from-figma 의 source-grounded 의무 대칭화):

1. **TEXT 노드 verbatim 의무** — `components[]` 중 `node_type === "TEXT"` 인 모든 노드는 `text_content` (verbatim 표시 텍스트) + `provenance` 동반. 누락 시 산출 reject.
2. **provenance=inferred 금지 대상** — 사용자 가시 라벨/버튼/헤더/옵션 텍스트는 `provenance: "inferred"` 금지. verbatim 미확보 시 → `get_design_context` 재호출 (절차 3) 또는 `scope_out_notes` 로 "verbatim 미확보 / 사용자 보강 필요" 명시 (추론으로 spec 채우기 ❌).
3. **inferred 비율 임계** — TEXT 노드 중 `provenance: "inferred"` 비율 > 0 이면 finding (`_base-log-finding`) 등록 + GO-STOP gate 에 노출 (사용자 결단 의무). 추론 라벨이 "✅ Figma 검증 완료" 로 silent 통과하는 것 차단.

> 자동 검증: `tools/analysis-extraction-validator --extract <figma-extract.json>` — TEXT 노드 text_content 누락(critical) + provenance 누락/inferred(high) + inferred 비율 임계(medium) 를 hard gate 로 강제 (discovery-extraction-validator 대칭).

## 산출물

- `.ai-context/scopes/<scope>/planning/figma-extract.json` (strict / additionalProperties:false)
- `.ai-context/scopes/<scope>/planning/assets/figma-screenshot-*.png` (visual ref / binary 보관)

## scope-out (Figma MCP 표면에 없음)

- **interaction (prototype 연결)** — 화면 간 transition / event 흐름
- **animation** — motion / transition spec
- **autolayout 세부 constraint** — flex / wrap / spacing 디테일
- **multi-frame variant 자동 traversal** — variant set 순회
- **plugin data** — 외부 plugin 이 frame 에 박은 metadata

위 항목 필요 시 사용자가 별도 수동 캡처 또는 prompt 로 보강 의무. 본 skill 은 추정 ❌ (no-simulation 정합).

> scope-out 의 "추정 ❌" 은 위 5 항목 (interaction / animation / autolayout / variant / plugin-data) 뿐 아니라 **사용자 가시 텍스트 (라벨/버튼/헤더/옵션) 에도 동일 적용**. 텍스트 verbatim 미확보 시 추론으로 채우지 말 것 — `provenance: "inferred"` + `scope_out_notes` 명시.

## 인용

- 정책: `methodology-spec/workflow/input.md` §5종 입력 (b)
- 정책: `methodology-spec/plugin-charter.md` §1 R8 + R14 (FE 트랙)
- finding: `methodology-spec/finding-system.md` F-162 (verbatim 검증 의무)
- cross-link: `skills/discovery-from-figma/SKILL.md` §no-simulation (source-grounded 대칭)
- Figma Dev Docs — https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/

## When NOT to invoke

- 사용자가 코드 / spec 만 제공 (디자인 자료 부재) → 본 skill skip
- 사용자가 BE 백오피스 API 만 분석 (UI 무관) → 본 skill skip
- Figma desktop 앱 미실행 또는 selection 부재 → state.blocked + 사용자 안내 (skill 강행 ❌)
- interaction / animation 정보 필요 시 → 사용자 prompt 보강 + `analysis-from-prompt` 호출
