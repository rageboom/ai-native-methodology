---
name: discovery-from-figma
description: PLACEHOLDER 2026-05-21 (v4.1 paradigm 가시화만). chain (discovery) 입력 어댑터 skill (figma 채널). figma 파일 + selected frame 입력에서 UC + UI 구조 + interaction flow + 출처 ref (file_id:node_id) 추출 전문. discovery-agent 가 호출. v4.2+ 본격 구현 carry.
allowed-tools: Read, Glob, Grep, Bash
---

# discovery-from-figma (PLACEHOLDER 2026-05-21)

> **PLACEHOLDER**: 본 skill 은 v4.1 chain (discovery) 입력 어댑터 paradigm 정합 가시화 자산. 본격 구현은 v4.2+ carry.
>
> 본 skill 의 모 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 §신설 자산 skills/.

## 책임 범위 (v4.2+ carry)

figma 파일 + selected frame 입력에서 다음 추출:

| 항목 | 추출 방법 |
|---|---|
| UC 후보 | 화면 × 인터랙션 이벤트 = 1 UC 후보 (e.g., button click flow = 1 UC) |
| Intent 후보 | 디자인 노트 / 코멘트 (없으면 `intent: unknown` 표지 carry — soft 게이트) |
| UI 구조 | 컴포넌트 트리 + variant + design token reference |
| Interaction flow | figma prototype connections (있으면) |
| 출처 ref | `<file_id>#<node_id>` |
| confidence 등급 | `confirmed` (코멘트 명시) / `inferred` (시각 추론) / `ambiguous` (모호한 flow) |

## 입력

- Figma 파일 (MCP `figma-desktop` 도구 / selected frame 의무)
- ★ file URL 만으로는 부족 — desktop app 의 selected frame 필요 (MCP spec 정합)

## 산출

- `.aimd/output/_discovery/from-figma-result.json` (어댑터 1차 산출)
- discovery-agent 가 공통 sub-skill 호출 후 `discovery-output.json` 으로 merge

## 운영 정책 (DEC-2026-05-21 §8 정합)

- NFR 추출 ❌ (figma 는 NFR 채널 ❌ — nl-md 영역)
- I/O contract 추출 ❌ (swagger 영역)
- Interaction flow 추출 시 사용자 confirm 의무 (시각 추론 = LLM 의존도 높음 / mini-gate)
- 출처 ref 형식: `figma:<file_id>:<node_id>`

## carry (v4.2+)

- 본 skill 본격 구현 (MCP figma-desktop 도구 호출 + 화면 분석 + interaction 추론 알고리즘)
- 산출 schema = 기존 `schemas/figma-extract.schema.json` 재사용 (analysis-from-figma 어댑터와 동일 / 별도 result schema 신설 ❌)
- 기존 `analysis-from-figma` skill 일부 흡수 평가
- design token 추출 시 `visual-manifest.json` 과 cross-reference

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- `agents/discovery-agent.md` (본 skill 의 caller)
- `skills/analysis-from-figma/` (carry — 일부 흡수 가능성 평가)
- `skills/figma:figma-use` (MCP 도구 호출 패턴 source)
