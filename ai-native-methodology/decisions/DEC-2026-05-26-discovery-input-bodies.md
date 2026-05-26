# DEC-2026-05-26-discovery-input-bodies

> v10.1.0 MINOR — `discovery-from-{figma, swagger, nl-md}` 3 SKILL.md body 본격 구현. DEC-2026-05-26-input-skill-roles §2 (trigger carry) 종결. additive doc / breaking 0 / 신규 기능 = MINOR.

- **결단 일자**: 2026-05-26 (v10.1.0 MINOR)
- **결단자**: 윤주스 (TF Lead) — "잔여 적용" (v10.0.4 trigger carry 보류 권고 override)
- **범주**: substantive / discovery 입력 어댑터 본격 구현
- **상태**: 승인 / breaking 0 / MINOR

## 컨텍스트

DEC-2026-05-26-input-skill-roles (v10.0.4) 가 `analysis-from-*` ↔ `discovery-from-*` timing/책임 분리 paradigm 을 확정하면서, `discovery-from-{figma, swagger, nl-md}` 3종은 light placeholder 로 두고 본격 구현은 "실 use case 트리거 carry / v10.x" 로 deferred 했음 (사내 배포 전 단계 ROI 정합).

사용자 "잔여 적용" 결단 (override) — trigger 의존 carry 보류 권고 거절 + paradigm 완전성 우선 (placeholder = 기술 부채 / 외부 사용자 등장 전에 시스템 내부 완성).

## 결정

### §1. 3 SKILL.md body 본격 작성 (additive doc)

`discovery-from-analysis-output` (v9.0.0 본격 / 137 line) pattern 정합 + 본격 procedure (책임 범위·입력·산출·no-simulation·절차·인용 6 섹션).

| skill | source 채널 | UC 추출 방법 | NFR axis |
|---|---|---|---|
| `discovery-from-figma` (~70 line) | figma file URL + selected frame | MCP 4 도구 (get_metadata / get_design_context / get_variable_defs / get_screenshot) → frame nodes → 사용자 flow → UC + interaction | 부 (a11y / responsive / transition) |
| `discovery-from-swagger` (~65 line) | openapi.yaml / swagger.json (Read 또는 WebFetch) | OpenAPI parse → operation 별 (path + method) → summary/description → UC + I/O contract + schema constraint → BR-INTENT | 부 (security / x-ratelimit / responses SLA) |
| `discovery-from-nl-md` (~80 line) | markdown 기획 문서 또는 in-conversation NL prompt | structural parse (heading hierarchy / paragraph / sentence index) → "사용자가 X 한다" 패턴 → UC + "X는 Y해야" → BR-INTENT + "응답 200ms" 등 명시 → NFR | ★ **1차 채널** (NL 만이 명시 NFR 표현) |

각 skill 의 `source_grounded_evidence` ref 형식:
- figma: `figma:<file_id>:<node_id>` (또는 frame name fallback)
- swagger: `openapi:<path>:<operationId>` (또는 `<path>:<method>` fallback)
- nl-md: `doc:<filepath>:<paragraph_index>:<sentence>` (markdown) 또는 `prompt:<message_id>:<line>` (in-conversation)

산출은 모두 `.aimd/output/planning-spec.json` (discovery stage 산출 / 파일명 reuse).

### §2. no-simulation 의무 (3 skill 공통)

모든 entry (UC / BR-INTENT / NFR / risk) 에 `source_grounded_evidence` 의무. LLM fabrication ❌. 특히 `discovery-from-nl-md` 는 NFR fabrication 위험 가장 높음 → verbatim quote 권장 + `planning-extraction-validator` grep_hit_count > 0 강제.

### §3. 동반 doc 갱신

- `methodology-spec/lifecycle-contract.md` §Input 어댑터 timing 분리 표: `discovery-from-{analysis-output, figma, swagger, nl-md}` 4 모두 본격 (★ v10.1.0).
- `guides/first-prompt-cookbook.md` §2.1 timing note: "v10.1.0 모두 본격" 표기.
- `decisions/DEC-2026-05-26-input-skill-roles.md` §2: trigger carry 종결 → v10.1.0 본격 구현 완료 명시.

## STOP-3

- release-readiness 20/20 ready (보존)
- skill-citation 0 stale + version 3-way 10.1.0 + breaking 0 = MINOR

## carry (본 MINOR 외)

- **C-v4.1-poc-재실행** — 9 PoC 전부 task-plan 없음. plan-agent (v10.0.0 본격) dispatch + 산출 = heavy validation / Type 1 self-run. v10.x carry / 사용자 결단 의무.

## 인용

- DEC-2026-05-26-input-skill-roles (v10.0.4 / 본 DEC 가 §2 trigger carry 종결)
- DEC-2026-05-21-chain-discovery-plan-stage-도입 (3 skill 의 모 결단)
- `skills/discovery-from-analysis-output/SKILL.md` (pattern reference)
- `skills/analysis-from-{figma, swagger, prompt, plan-doc}/SKILL.md` (baseline 채널 / source 동일 / 출력 axis 다름)
- `schemas/planning-spec.schema.json` (산출 schema)
