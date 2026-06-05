---
name: discovery-from-figma
description: chain (discovery) 입력 어댑터 skill (figma 채널 / scope 진입 timing / v10.1.0 본격). figma 파일 + selected frame 입력에서 UC + interaction flow + UI 의도 + 출처 ref (file_id:node_id) 추출 전문. discovery-agent 가 호출. `analysis-from-figma` (baseline 수립 / 최초 1회 / Track=FE) 와 timing+책임 분리 — analysis = visual structure (design tokens / layouts) / discovery = UC behavior intent (사용자 flow / 의도). NFR 부 채널 (a11y / responsive / transition).
allowed-tools: Read, Bash, mcp__figma-desktop__get_design_context, mcp__figma-desktop__get_metadata, mcp__figma-desktop__get_variable_defs, mcp__figma-desktop__get_screenshot
---

# discovery-from-figma

## 언제 사용

scope 진입 시 (`chain-driver init --scope <slug>` 직후) figma 디자인이 source 채널일 때. discovery-agent 가 dispatch. 본 skill = **UC / flow / intent 추출 axis** (`analysis-from-figma` 의 visual structure 추출과 분리).

## 사전 조건 (의무)

- Figma desktop 앱 실행 중 + **대상 frame selected** (file URL 만으로 부족 — analysis-from-figma §사전 조건 정합)
- `mcp__figma-desktop__*` 4 도구 사용자 환경 등록 (부재 시 skill reject + 사용자 setup 요청)

## 입력

- Figma file URL + selected frame
- (선택) `.aimd/output/visual-manifest.json` (`analysis-from-figma` baseline 산출 — design tokens / layouts 참조 cross-check)
- discovery context: `intent` (new feature / modify / bug-fix) — orchestrator inject

## 산출

`.aimd/output/discovery-spec.json` 의 다음 entries (source_grounded_evidence 의무):

- `use_cases[]` — frame 별 사용자 flow → UC-\* (id + name + description + acceptance_criteria_refs[])
- `business_rules_intent[]` — interaction 에 함축된 BR (예: 카드 만료 가림 / 폼 validation 시각화 / 조건부 button enable) → entry (br_id = `BR-<DOMAIN>-<SUBJECT>-NNN` / 별도 BR-INTENT-\* id 없음)
- `nfr[]` (부 채널) — a11y (color contrast / aria hints) / responsive breakpoints / transition timing → NFR-\*
- `cross_links.to_visual_manifest` — `analysis-from-figma` baseline 산출 reference (있을 시)

각 entry `source_grounded_evidence` = `figma:<file_id>:<node_id>` (또는 frame name fallback).

## no-simulation 의무 (source-grounded)

- 모든 UC / BR-INTENT / NFR entry 는 figma node 의 실 reference 동반 (`mcp__figma-desktop__*` 호출 결과 기반).
- LLM 추론만으로 entry 생성 ❌ — MCP tool 호출 + 실 node 인용 의무.
- `analysis-from-figma` (baseline visual) 와 **source 동일 / 출력 axis 다름** (UC behavior intent vs visual structure).

## 절차

1. **frame 선택 확인**: `mcp__figma-desktop__get_metadata` 호출 → 현재 selected frame 확인. 없으면 skill reject + 사용자 frame select 요청.
2. **design context 추출**: `mcp__figma-desktop__get_design_context` 호출 → 선택 frame 의 nodes / hierarchy / interaction 메타.
3. **variables / tokens 참조**: `mcp__figma-desktop__get_variable_defs` 호출 → 사용된 design tokens (a11y / responsive vars 추출 보조).
4. **screenshot (선택)**: `mcp__figma-desktop__get_screenshot` 호출 → 시각 cross-check (LLM 환각 차단 보조 / large frame 시 skip 가능).
5. **UC 추출**: frame 별 사용자 flow 식별 (starting node + target node + 행동 sequence) → UC-\* entry. source_grounded_evidence = `figma:<file_id>:<node_id>`.
6. **business_rules_intent 추출**: UI interaction 에 함축된 비즈니스 규칙 식별 (마스킹 / 조건부 enable / error state) → entry (br_id + reasoning) + node reference.
7. **NFR (부 채널) 추출**: a11y / responsive / transition — `analysis-from-figma` 의 visual-manifest 와 cross-check.
8. **`cross_links.to_visual_manifest`** 채움 (baseline 있을 시) — discovery 가 analysis baseline 위에 UC axis 추가하는 paradigm.
9. **discovery-spec.json append/merge** — discovery-agent 가 다른 어댑터 산출과 통합 (multi-source 시).
10. **`discovery-extraction-validator` 통과** 자격 = 모든 entry `source_grounded_evidence` 존재 / grep_hit_count > 0 (node_id figma file 실재 확인).

## 70~80% 한계 명시

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

- figma 디자인이 UC 의 전부를 표현 ❌ — UI flow 만 / business logic 은 `discovery-from-swagger` / `discovery-from-nl-md` 보강 필요. **multi-source 권장** (orchestrator 자동 dispatch).
- LLM 의 frame interpretation 신뢰도 ~75% 베이스 → gate #1 `br-cross-consistency-validator` Layer 2 LLM 통과 의무.

## 인용

- 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입
- 결단: DEC-2026-05-26-input-skill-roles (analysis-from-figma 와 timing 분리)
- `agents/discovery-agent.md` (본 skill 의 caller)
- `skills/analysis-from-figma/SKILL.md` (baseline 채널 / source 동일 / 출력 axis 다름)
- `skills/discovery-from-analysis-output/SKILL.md` (pattern reference / source_grounded paradigm)
- `schemas/discovery-spec.schema.json` (산출 schema)
