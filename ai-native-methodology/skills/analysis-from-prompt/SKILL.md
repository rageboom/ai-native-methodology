---
name: analysis-from-prompt
description: Use when user provides natural-language prompt as analysis input (typically the residual text after analysis-input-orchestrate parses out URLs/paths). Extracts intent, scope, constraints, assumptions. Track = both (BE + FE). Stage = analysis (input).
allowed-tools: Read
---

# analysis-from-prompt — 자연어 의도 흡수

`analysis-input-orchestrate` 의 1단계 파싱 후 남은 자연어 잔여 의도, 또는 사용자가 직접 입력한 자연어 prompt 를 흡수해 `prompt-extract.json` 산출.

> **단일 책임**: 자연어 의도 추출. 메타데이터 (URL/path) 추출은 orchestrate 책임.

## 사전 조건

- 잔여 자연어 텍스트 (orchestrate dispatch) 또는 사용자 직접 입력 (`--prompt-file <path>` / inline)
- inline 입력 시 200 line cap (context 압박 회피)
- 더 큰 prompt = `--prompt-file <path>` 표준

## 절차

1. **의도 추출** — 사용자가 "무엇을 만들고 싶은가" / "기존 시스템에 무엇을 추가 / 수정하는가" 의 핵심 동사 + 대상 entity 추출.
2. **범위 (scope)** — 명시된 영역 (예: "사용자 관리 + 권한 관리") 또는 암묵 범위 (전체 시스템 / 특정 모듈) 추정. 추정 시 `confidence` 필드 명시.
3. **제약 (constraints)** — 명시된 비기능 요구 (성능 / 보안 / 호환성 / 외부 시스템 연동 등) + 명시 시점에 있는 의존성 ("기존 auth 시스템과 연동" 등).
4. **가정 (assumptions)** — prompt 안에 명시 안 됐지만 흡수에 필요한 가정 (예: "현재 사용자 DB 가 PostgreSQL 이라고 가정" / 후속 단계에서 사용자 확인 의무).
5. **UC 후보 (uc_candidates)** — 의도 + 범위에서 도출 가능한 use case 후보 (UC-\* 정식 ID 부여는 chain 1 discovery-spec). 본 skill = 후보 명사만.
6. **산출 작성** — `.aimd/<scope>/planning/prompt-extract.json` (schema = `schemas/prompt-extract.schema.json`).

## 산출물

- `.aimd/<scope>/planning/prompt-extract.json` (strict / additionalProperties:false / json 단독 — ADR-011)
- 추출 결과는 orchestrate merge 단계에서 `input-summary.json` 안 통합

## 본체 명세 참조

- `methodology-spec/workflow/input.md` §5종 입력 (e)
- `methodology-spec/plugin-charter.md` §1 R8

## When NOT to invoke

- 사용자가 코드 / Figma / Swagger / 기획 문서 같은 구조 자료만 제공 (자연어 의도 부재) → 본 skill skip
- 사용자가 chain 1 discovery-spec 작성 중 추가 의도 보강 → revisit-loop 으로 input 재진입 후 본 skill 재호출
- LLM 양심 의존 정성 추출 ❌ — 명시되지 않은 의도를 "추측" 으로 채우면 후속 chain stage 가 hallucinate-driven 산출 위험. 추정은 `assumptions` 필드 + `confidence` 명시 의무 (no-simulation 정합)
