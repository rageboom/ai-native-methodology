---
name: discovery-from-nl-md
description: ★ light placeholder (v10.0.4 paradigm 명문화 / DEC-2026-05-26-input-skill-roles). chain (discovery) 입력 어댑터 skill (자연어 / 마크다운 채널 / **scope 진입 timing**). 자연어 prompt 또는 markdown 기획 문서 입력에서 UC + intent + NFR + 출처 ref (doc:para:sentence) 추출 전문. discovery-agent 가 호출. `analysis-from-prompt` + `analysis-from-plan-doc` (baseline 수립 / 최초 1회) 와 **timing+책임 분리** (analysis = baseline / discovery = 신규 건마다 scope). NFR 추출 의 1차 채널. 본격 구현 = 실 use case (NL md 로 scope 진입 사용자) 트리거 carry / v10.x.
allowed-tools: Read, Glob, Grep, Bash
---

# discovery-from-nl-md (PLACEHOLDER 2026-05-21)

> **PLACEHOLDER**: 본 skill 은 v4.1 chain (discovery) 입력 어댑터 paradigm 정합 가시화 자산. 본격 구현은 v4.2+ carry.
>
> 본 skill 의 모 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 §신설 자산 skills/.

## 책임 범위 (v4.2+ carry)

자연어 prompt 또는 markdown 기획 문서 입력에서 다음 추출:

| 항목 | 추출 방법 |
|---|---|
| UC 후보 | 문장 단위 행위 추출 (LLM 의존) — actor·entity·trigger 패턴 매칭 |
| Intent 후보 | "왜냐하면" / "~위해" / "~때문에" 등 reasoning 패턴 추출 |
| NFR | latency / security / capacity / compliance / 일정 등 명시 항목 (★ 본 어댑터 의 1차 책임 영역) |
| 제약 | "~해야 함" / "~안 됨" 등 강제 패턴 |
| 출처 ref | `<doc>:<paragraph>:<sentence>` (markdown 헤더 path 포함 권장) |
| confidence 등급 | `confirmed` (명시 문장) / `inferred` (추론) / `ambiguous` (모호 / 다의) |

## 입력

- 자연어 prompt (사용자 직접 입력)
- markdown 기획 문서 (.md 파일 path)
- PDF / Notion export (carry — 변환 도구 의존)

## 산출

- `.aimd/output/_discovery/from-nl-md-result.json` (어댑터 1차 산출)
- discovery-agent 가 공통 sub-skill 호출 후 `discovery-output.json` 으로 merge

## 운영 정책 (DEC-2026-05-21 §8 정합)

- **NFR 추출 = 본 어댑터 의 1차 책임** (다른 어댑터는 NFR 채널 ❌)
- Intent unknown 비율은 가장 낮아야 함 (자연어 = 의도 명시 채널)
- 모호성 발생 시 사용자 confirm 의무 (LLM 의존도 가장 높은 어댑터 / mini-gate 강제)
- 출처 ref 형식: `<doc>:<paragraph>:<sentence>` 또는 `<doc>#<heading>`
- 다중 해석 가능 문장 = `confidence: ambiguous` 표지 + 사용자 결단 gate

## carry (v4.2+)

- 본 skill 본격 구현 (LLM 기반 UC / Intent / NFR 추출 + 모호성 detection 알고리즘)
- 산출 schema = 기존 `schemas/prompt-extract.schema.json` (+ `schemas/plan-doc-extract.schema.json`) 재사용 (별도 result schema 신설 ❌)
- 기존 `analysis-from-prompt` + `analysis-from-plan-doc` skill 일부 흡수 평가
- PDF / Notion / Confluence export 변환 도구 의존성 결단

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- `agents/discovery-agent.md` (본 skill 의 caller)
- `skills/analysis-from-prompt/` (carry — 일부 흡수 가능성 평가)
- `skills/analysis-from-plan-doc/` (carry — 일부 흡수 가능성 평가)
