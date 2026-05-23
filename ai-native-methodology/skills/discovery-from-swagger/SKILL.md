---
name: discovery-from-swagger
description: PLACEHOLDER 2026-05-21 (v4.1 paradigm 가시화만). chain (discovery) 입력 어댑터 skill (swagger 채널). openapi.yaml / swagger.json 입력에서 UC + I/O contract + 출처 ref (path:operationId) 추출 전문. discovery-agent 가 호출. v4.2+ 본격 구현 carry.
allowed-tools: Read, Glob, Grep, Bash, WebFetch
---

# discovery-from-swagger (PLACEHOLDER 2026-05-21)

> **PLACEHOLDER**: 본 skill 은 v4.1 chain (discovery) 입력 어댑터 paradigm 정합 가시화 자산. 본격 구현은 v4.2+ carry.
>
> 본 skill 의 모 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 §신설 자산 skills/.

## 책임 범위 (v4.2+ carry)

openapi.yaml / swagger.json 입력에서 다음 추출:

| 항목 | 추출 방법 |
|---|---|
| UC 후보 | endpoint × HTTP method = 1 UC 후보 (e.g., `GET /articles/{id}` = `UC-fetch-article-by-id`) |
| Intent 후보 | `description` / `summary` 필드 (없으면 `intent: unknown` 표지 carry — soft 게이트) |
| I/O contract | request schema / response schema / error code (성공/실패 응답 분리) |
| 출처 ref | `path + operationId` (e.g., `/articles/{id}#getArticle`) |
| confidence 등급 | `confirmed` (description 명시) / `inferred` (path/method 추론) / `ambiguous` (충돌) |

## 입력

- `openapi.yaml` 또는 `swagger.json` (path 또는 URL)
- `@readme/openapi-parser` 또는 동등 도구 (carry — 의존성 결단 v4.2+)

## 산출

- `.aimd/output/_discovery/from-swagger-result.json` (어댑터 1차 산출)
- discovery-agent 가 공통 sub-skill (`discovery-decompose-use-cases` / `discovery-identify-business-intent`) 호출 후 `discovery-output.json` 으로 merge

## 운영 정책 (DEC-2026-05-21 §8 정합)

- NFR 추출 ❌ (swagger 는 NFR 명시 채널 ❌ — nl-md 어댑터 영역)
- Intent unknown 표지 허용 (description 부재 swagger 흔함 / hallucination 차단)
- 출처 ref 형식: `<path>#<operationId>` 또는 `<path>#<method>` (operationId 부재 시)

## carry (v4.2+)

- 본 skill 본격 구현 (openapi parser 호출 + UC 추출 알고리즘 + I/O schema 정규화)
- 산출 schema = 기존 `schemas/swagger-extract.schema.json` (+ `schemas/openapi-extension.schema.json`) 재사용 (별도 result schema 신설 ❌)
- 기존 `analysis-from-swagger` skill 일부 흡수 평가 (analysis stage 의 swagger 입력 채널과 책임 중복 정리)
- WebFetch 통한 원격 swagger URL 지원

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- `agents/discovery-agent.md` (본 skill 의 caller)
- `skills/analysis-from-swagger/` (carry — 일부 흡수 가능성 평가)
