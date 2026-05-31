---
name: discovery-from-nl-md
description: chain (discovery) 입력 어댑터 skill (자연어 / 마크다운 채널 / scope 진입 timing / ★ v10.1.0 본격). 자연어 prompt 또는 markdown 기획 문서 입력에서 UC + intent + NFR + risk + 출처 ref (doc:para:sentence) 추출 전문. discovery-agent 가 호출. `analysis-from-prompt` + `analysis-from-plan-doc` (baseline 수립 / 최초 1회) 와 timing+책임 분리 — analysis = 1-shot prompt 또는 PDF/Notion docs 흡수 / discovery = NL md (markdown 기획문서 또는 in-conversation NL) scope 진입 trigger. ★ NFR 추출 1차 채널 (다른 채널은 부).
allowed-tools: Read, Glob, Grep, Bash
---

# discovery-from-nl-md

## 언제 사용

scope 진입 시 (`chain-driver init --scope <slug>` 직후) NL prompt 또는 markdown 기획 문서가 source 채널일 때. discovery-agent 가 dispatch. 본 skill = **NFR 1차 추출 채널** (NL 만이 명시 NFR — 응답시간 / 가용성 / 보안 / a11y — 표현 / 다른 채널 figma·swagger 는 부 채널).

## 사전 조건

- markdown 기획 문서 파일 경로 (`.md`) 또는 in-conversation NL prompt text.
- (선택) `.aimd/output/business-rules.json` baseline (BR cross-check 용).

## 입력

- NL prompt text 또는 markdown 파일 경로
- (선택) discovery scope filter (특정 section heading 또는 시나리오 ID)
- discovery context: `intent` (new feature / modify / bug-fix / question)

## 산출

`.aimd/output/discovery-spec.json` 의 다음 entries:

- `use_cases[]` — paragraph / scenario 별 사용자 flow → UC-* (id + name + description + acceptance_criteria_refs[])
- `business_rules_intent[]` — NL 안 명시 BR ("X 는 Y 만 가능" / "Z 시 W 차단") → entry (br_id = `BR-<DOMAIN>-<SUBJECT>-NNN` / 별도 BR-INTENT-* id 없음)
- `nfr[]` (★ 1차 채널) — 응답시간 / 가용성 / 동시접속 / 보안 / a11y / 데이터 보존 등 명시 NFR → NFR-*
- `risks_and_constraints[]` — 명시 risk / concern 언급 → object {id: R-*, severity, description} (schema 정의 / 명칭 통일 D3)
- `intent_summary` — section heading 또는 1-line 요약

각 entry `source_grounded_evidence` = `doc:<filepath>:<paragraph_index>:<sentence>` (markdown) 또는 `prompt:<message_id>:<line>` (in-conversation NL).

## ★ ★ ★ no-simulation 의무 (source-grounded)

- 모든 entry 는 NL source 의 실 문장 / 문단 reference 동반.
- LLM 의 "그럴듯한" NFR 추가 ❌ — NL 안 명시 언급만 추출 (예: "응답 200ms 이내" 가 있어야 NFR-PERF-001 생성 / LLM 이 임의 200ms fabricate ❌).
- BR-INTENT 는 verbatim quote 권장 (paraphrase 시 source ref 정확성 보장).
- `analysis-from-prompt` / `analysis-from-plan-doc` baseline 과 cross-check (intent 변경 vs 신규 vs 동형 식별).

## 절차

1. **source 분기**: 입력이 markdown 파일이면 Read, in-conversation NL 이면 prompt text 직접 사용.
2. **structural parse** (markdown 시): heading hierarchy (H1/H2/H3) → section 단위 / paragraph index assign / sentence index assign. source_grounded_evidence ref 정확성 보장.
3. **scope filter 적용** (있으면): 해당 section / scenario 만 추출.
4. **UC 추출**: paragraph / scenario 별 사용자 flow 식별. "사용자가 X 한다 / 시스템이 Y 응답" 패턴 → UC-* + source ref.
5. **business_rules_intent 추출**: "X 는 Y 해야 한다" / "Z 시 W 차단" / "A 만 가능" 등 명시 BR → entry (br_id + reasoning + source_grounded_evidence) + verbatim quote 권장.
6. **NFR 추출 (★ 1차 책임)**: 응답시간 / 가용성 / 동시 사용자 / 보안 / a11y / 데이터 보존 기간 등 명시 NFR → NFR-*. **명시되지 않은 NFR fabricate ❌** (no-simulation 의무 핵심).
7. **risks / concerns 추출**: 명시 위험 / 불확실성 / open-question → R-*.
8. **intent classification**: orchestrator inject `intent` (new/modify/bug-fix) 와 NL 안 키워드 cross-check — 모순 시 finding emit (예: intent=bug-fix 인데 NL 은 신규 기능 묘사).
9. **discovery-spec.json append/merge** → discovery-agent 가 다른 어댑터 산출과 통합.
10. **`discovery-extraction-validator` 통과** 자격 = 모든 entry source_grounded / NL 안 실 문장 검증 (grep_hit_count > 0).

## 70~80% 한계 명시

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

- NL ambiguity → LLM interpretation 신뢰도 ~70~75% (모든 채널 중 가장 낮음).
- gate #1 `br-cross-consistency-validator` Layer 2 LLM 의무 통과 (semantic_drift_detected / confidence_cap_exceeded 차단).
- **NFR fabrication 위험 가장 높음** — source_grounded_evidence verbatim quote 강제로 차단.

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- DEC-2026-05-26-input-skill-roles (`analysis-from-prompt` / `analysis-from-plan-doc` 와 timing 분리 / v10.0.4 paradigm / v10.1.0 본격 구현)
- `agents/discovery-agent.md` (본 skill 의 caller)
- `skills/analysis-from-prompt/SKILL.md` + `skills/analysis-from-plan-doc/SKILL.md` (baseline 채널)
- `skills/discovery-from-analysis-output/SKILL.md` (pattern reference)
- `schemas/discovery-spec.schema.json` (산출 schema)
