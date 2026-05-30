---
name: discovery-from-swagger
description: chain (discovery) 입력 어댑터 skill (swagger / OpenAPI 채널 / scope 진입 timing / ★ v10.1.0 본격). openapi.yaml / swagger.json 입력에서 UC + I/O contract + 출처 ref (path:operationId) 추출 전문. discovery-agent 가 호출. `analysis-from-swagger` (baseline 수립 / 최초 1회 / @readme/openapi-parser 본격) 와 timing+책임 분리 — analysis = 전체 API 표면 inventory / discovery = 본 scope 의 endpoint UC + 사용자 의도. NFR 부 채널 (rate-limit / SLA / auth requirements).
allowed-tools: Read, Glob, Grep, Bash, WebFetch
---

# discovery-from-swagger

## 언제 사용

scope 진입 시 (`chain-driver init --scope <slug>` 직후) OpenAPI / Swagger spec 이 source 채널일 때. discovery-agent 가 dispatch. 본 skill = **endpoint 별 UC behavior intent 추출 axis** (`analysis-from-swagger` 의 inventory 추출과 분리 / DEC-2026-05-26-input-skill-roles 정합).

## 사전 조건

- openapi.yaml / swagger.json 파일 경로 또는 URL (WebFetch 가능).
- (선택) `.aimd/output/openapi.yaml` baseline (`analysis-from-swagger` / `@readme/openapi-parser` 결과) — 전체 API 표면 reference cross-check.

## 입력

- OpenAPI / Swagger spec path 또는 URL
- (선택) discovery scope filter (예: paths 중 `/users/*` / tags 중 특정 group) — orchestrator inject
- discovery context: `intent` (new endpoint / modify existing / deprecation)

## 산출

`.aimd/output/discovery-spec.json` 의 다음 entries:

- `use_cases[]` — operation 별 사용자 의도 → UC-* (id + name + description + acceptance_criteria_refs[])
- `business_rules_intent[]` — request/response schema 의 constraint (required / enum / format / pattern) → entry (br_id = `BR-<DOMAIN>-<SUBJECT>-NNN` / 별도 BR-INTENT-* id 없음)
- `nfr[]` (부 채널) — `security` (auth 의무) / `x-ratelimit-*` (rate limit) / `responses` 4xx/5xx (error contract) → NFR-*
- `io_contracts[]` — operation 별 request/response schema reference (path:operationId → $ref chain)

각 entry `source_grounded_evidence` = `openapi:<path>:<operationId>` (또는 operationId 부재 시 `<path>:<method>`).

## ★ ★ ★ no-simulation 의무 (source-grounded)

- 모든 entry 는 OpenAPI spec 의 실 path/operationId 동반.
- LLM 의 endpoint 의도 추론은 spec description / summary / examples 에 grounded — fabrication ❌.
- `analysis-from-swagger` baseline 산출과 cross-check (전체 표면 vs 본 scope) — 새 endpoint vs modification 식별.

## 절차

1. **spec parse**: openapi.yaml / swagger.json Read → JSON / YAML 파싱. 형식 자동 감지.
2. **scope filter 적용**: orchestrator inject scope filter 가 있으면 해당 paths / tags 만 추출.
3. **operation 별 UC 추출**: 각 operation (path + method) → UC-* entry. summary/description 을 사용자 의도로 paraphrase. source_grounded_evidence = `openapi:<path>:<operationId>`.
4. **request/response schema → business_rules_intent 추출**: `required` 필드 / `enum` 값 / `format` (date / email / uuid) / `pattern` regex → entry (br_id + reasoning). schema `$ref` 추적해 nested constraint 도 포함.
5. **NFR (부 채널) 추출**: `security` schemes (auth 의무) / `x-ratelimit-*` (rate limit) / `responses` 의 4xx/5xx (error contract) → NFR-*.
6. **I/O contracts entries**: operation 별 request/response schema reference 저장 (chain 2 spec stage 의 behavior-spec 작성 시 참조).
7. **baseline cross-check** (있을 시): `.aimd/output/openapi.yaml` baseline 의 endpoint 목록과 비교 — 새 endpoint 인지 / 기존 modification 인지 / deprecated 인지 식별 → intent 정확화.
8. **discovery-spec.json append/merge** → discovery-agent 가 다른 어댑터 산출과 통합.
9. **`discovery-extraction-validator` 통과** 자격 = 모든 entry source_grounded / spec 안 path:operationId 실재 검증.

## 70~80% 한계 명시

- swagger spec 은 contract 만 표현 ❌ — 사용자 시나리오 / 화면 흐름 ❌ → `discovery-from-figma` 보강 권장 (multi-source / orchestrator 자동 dispatch).
- LLM 의 endpoint 의도 paraphrase 신뢰도 ~80% (spec description 충실도 의존 / 빈 description 시 신뢰도 ↓).

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- DEC-2026-05-26-input-skill-roles (`analysis-from-swagger` 와 timing 분리 / v10.0.4 paradigm / v10.1.0 본격 구현)
- `agents/discovery-agent.md` (본 skill 의 caller)
- `skills/analysis-from-swagger/SKILL.md` (baseline 채널 / source 동일 / 출력 axis 다름)
- `skills/discovery-from-analysis-output/SKILL.md` (pattern reference)
- `schemas/discovery-spec.schema.json` + `schemas/openapi-extension.schema.json` (산출 schema)
