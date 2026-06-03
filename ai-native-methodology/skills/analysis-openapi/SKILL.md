---
name: analysis-openapi
description: Use when project contains REST API endpoints (Spring @RestController / @RequestMapping, NestJS @Controller, Express app.use/app.get, FastAPI @app.get, Flask @app.route, Rails routes.rb, Phoenix Router). Generates openapi.yaml (산출물 5-a, BE). Auto-validated by spectral-runner (no-simulation policy first realized — ADR-009 단계 5). Stage = analysis, track = BE.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-openapi — OpenAPI 산출 (BE)

REST API 표면 → OpenAPI 3.x spec.

## 사전 조건

- domain.json / business-rules.json 존재
- BE 트랙 (REST endpoint 시그널 검출)

## 절차

1. **endpoint 전수 조사** — framework 별 패턴:
   - Spring: `@RestController` + `@GetMapping` / `@PostMapping` 등
   - NestJS: `@Controller` + `@Get` / `@Post`
   - Express: `app.use()` / `app.get()` / Router
   - FastAPI: `@app.get()` / `@router.post()`
   - Flask: `@app.route()`
   - Rails: `config/routes.rb`
2. **request / response 스키마** — DTO / TypeScript interface / Pydantic / JSON Schema
3. **path / query / body / header parameter** 분류
4. **status code + error response** 명세
5. **openapi.yaml 작성** — `templates/analysis/openapi-extension.template.json` 기반. ADR-007 부재 → `openapi-extension.schema.json` 활용 (custom extension)
6. **spectral-runner 자동 호출** — OpenAPI 정합 검증 (no-simulation 정책 첫 실현 단계 — ADR-009 단계 5 도구 실 실행 evidence)
7. **rules / domain cross-link** — analysis-api-rule-mapping 에서 사용

## 산출물

`<user-project>/.aimd/output/openapi.yaml`

## greenfield (code-optional) mode

`work-unit-manifest.scenario == "greenfield"` (legacy 코드 없음 / DEC-2026-05-30-use-scenario-taxonomy §2.4 옵션 A) 일 때 — 코드 endpoint 스캔 대신 **입력어댑터 extract** 에서 산출:

- **결정적 경로 (swagger 채널)** — `tools/greenfield-bootstrap --swagger-extract .aimd/<scope>/planning/swagger-extract.json --output .aimd/output`. swagger-extract 는 이미 파싱·정규화된 OpenAPI → `openapi.yaml` 로 **결정적 승격** (AI 추론 0 / endpoints × schemas 재조립만). 본 skill 의 AI 추출 불필요.
- swagger 채널 부재 (figma / PRD only) 시 — endpoint = PRD/figma flow 에서 AI 도출, `source_grounded_evidence` = 입력 출처 인용 (`doc:§N` / `figma:node_id`), `code_pointers` = N/A (가리킬 코드 부재 / `meta.code_pointers_na`).
- spectral-runner 검증은 동일 (no-simulation / ADR-009 단계 5).
- 무회귀: scenario ≠ greenfield 시 본 절 무시 (legacy 코드 endpoint 추출 경로 그대로).
- 진입점/조율 = `analysis-greenfield-bootstrap`.

## 본체 명세

- `methodology-spec/deliverables/4-5-formal-spec.md` (api 부분)
- `schemas/openapi-extension.schema.json`
- `tools/spectral-runner/`
- ADR-009 (5단계 신뢰도 — 단계 5 도달 의무)
