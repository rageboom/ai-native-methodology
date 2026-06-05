---
name: analysis-from-swagger
description: Use when user provides openapi.yaml / swagger.json (path or URL) as analysis input. Parses spec via @readme/openapi-parser, extracts endpoints + schemas + seeds domain.json / business-rules.json. Track = BE. Stage = analysis (input). Typically auto-dispatched by analysis-input-orchestrate.
allowed-tools: Read, Glob, Grep, Bash
---

# analysis-from-swagger — OpenAPI/Swagger 흡수

OpenAPI 3.1 / 3.0 / Swagger 2.0 spec 을 입력 받아 endpoint·schema 추출 + analysis 산출물 seed.

> **단일 책임**: spec 흡수 + 정규화. spec **생성** (코드 → openapi.yaml) 은 `analysis-openapi` skill / spectral 검증은 본 skill scope 외.

## 사전 조건

- 사용자가 `openapi.yaml` / `swagger.json` 파일 경로 또는 URL 제공
- `@readme/openapi-parser` 가용 (없으면 `npx @readme/openapi-parser` 즉시 호출 가능)
- URL fetch 불가 환경 (사내 폐쇄망) → 로컬 파일 경로 fallback 의무

## 절차

1. **입력 정합 확인** — 파일/URL 존재 + 읽기 가능. 미존재 시 state.blocked + 사용자 안내.
2. **parser 호출** — `npx @readme/openapi-parser validate <input>` (spec validation) + `dereference` 로 `$ref` resolve.
3. **endpoint 전수 추출** — path × method × parameters × requestBody × responses.
4. **schema 전수 추출** — `components/schemas/*` (또는 Swagger 2.0 `definitions/*`) → JSON Schema 정규화.
5. **domain entity 추정** — schema 이름 / required 필드 / 연관 관계 분석 → `domain.json` seed.
6. **rules seed 추정** — schema 의 enum / pattern / minimum / maximum / required 같은 제약 → `business-rules.json` seed (BR-* 후보).
7. **산출 작성** — `.aimd/<scope>/planning/swagger-extract.json` (schema = `schemas/swagger-extract.schema.json`).
8. **(옵션) spectral 검증** — 본 skill scope 외 / orchestrate 또는 사용자가 명시 호출 (`npx spectral lint <input>`). auto-invoke ❌.

## 산출물

- `.aimd/<scope>/planning/swagger-extract.json` (strict / additionalProperties:false)
- 정규화 openapi.yaml (옵션 — `analysis-openapi` 산출과 충돌 시 cross-ref / conflict 등재)
- `domain.json` seed + `business-rules.json` seed (analysis 후속 skill 입력)

## 본체 명세 참조

- `methodology-spec/workflow/input.md` §5종 입력 (c)
- `methodology-spec/plugin-charter.md` §1 R8
- `schemas/openapi-extension.schema.json` (BE 트랙 custom extension)

## When NOT to invoke

- spec 부재 (사용자가 endpoint 만 자연어로 설명) → `analysis-from-prompt` 후 chain 1 에서 spec 도출
- 코드만 있고 spec 부재 → `analysis-openapi` (spec **생성** skill) 호출
- spectral 검증 의무 시 → 사용자/orchestrate 가 `npx spectral lint` 명시 호출 (본 skill 안 auto-invoke ❌, no-simulation 정합)
