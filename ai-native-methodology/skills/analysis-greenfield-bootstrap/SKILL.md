---
name: analysis-greenfield-bootstrap
description: Use when scenario=greenfield (신규 프로젝트 / legacy 코드 없음) and user provides PRD / design / contract input (swagger / figma / plan-doc / prompt). Orchestrates the input-adapter analysis pass — generates the 7대 산출물 subset via each analysis skill's greenfield code-optional mode (architecture/domain/business-rules/openapi/schema) + legacy-only 산출물 N/A (antipatterns/migration-cautions) + deterministic openapi.yaml elevation (swagger 채널). greenfield = 처음부터 AX-native (산출물 = 빌드 부산물). Stage = analysis (input). Entry point for greenfield. For legacy code, use analysis-input-collection.
allowed-tools: Read, Glob, Grep, Bash, Write, Task
---

# analysis-greenfield-bootstrap — greenfield 진입 orchestration

`work-unit-manifest.scenario == "greenfield"` 일 때의 analysis stage 진입점. legacy 코드가 없으므로 **코드-고고학 패스를 생략**하고 **입력어댑터 패스**(PRD·디자인·계약 → 산출물)만 돌려 7대 산출물 subset 을 만든다. 산출물이 나오는 것 자체가 AX 운영 진입 (greenfield = 처음부터 AX-native).

> **단일 책임**: greenfield 산출물 생성 흐름 조율. 입력 흡수/merge 는 `analysis-input-orchestrate` (greenfield 분기) 위임. 각 산출물 추출은 해당 analysis skill 의 **greenfield code-optional mode** 위임. 결정적 변환(openapi elevation / N-A)은 `tools/greenfield-bootstrap/src/cli.js` 위임.
> **근거**: DEC-2026-05-30-use-scenario-taxonomy §2.4 (옵션 A — 기존 `analysis-from-*` 재사용 / "analysis = 코드 아니라 입력을 요구" 재프레이밍) · `methodology-spec/use-scenario-taxonomy.md` §3.

## 사전 조건

- `chain-driver init --scenario greenfield` 로 `work-unit-manifest.scenario = "greenfield"` 선언됨 (`schemas/work-unit-manifest.schema.json`).
- 입력 = PRD / 디자인 / 계약 중 ≥1 (swagger / figma / plan-doc / 자연어 prompt). 분석 대상 **코드 디렉토리 부재** (있으면 greenfield 아님 → S1/S2/S3).

## 절차

### 1단계 — 입력어댑터 패스 (코드-고고학 skip)

`analysis-input-orchestrate` 의 **greenfield 분기**(5단계)를 호출 → BCDE 어댑터(`analysis-from-{prompt,swagger,plan-doc,figma}`)만 dispatch. 산출 = `.aimd/<scope>/planning/{swagger,figma,plan-doc,prompt}-extract.json` + `input-summary.json`. legacy 전용 phase(`source-inventory` / DDL `db-schema` / `characterization` / `sql-inventory`)는 미발동.

### 2단계 — 결정적 산출 (swagger 채널 / testable)

swagger-extract 가 있으면 `node ${CLAUDE_PLUGIN_ROOT}/tools/greenfield-bootstrap/src/cli.js --output <user-project>/.aimd/output --swagger-extract .aimd/<scope>/planning/swagger-extract.json --scope <scope> --channel swagger`:
- `openapi.yaml` (deliverable 5-a) — swagger-extract(이미 파싱된 OpenAPI)의 **결정적 승격** (AI 추론 0).
- `antipatterns.json` + `migration-cautions.json` — legacy-only 산출물 **N/A** (빈 배열 + `meta.na_reason` 정당화 / `antipatterns.schema.json` + `migration-cautions.schema.json` 정합 / ADR-011 json 단독).

swagger 채널이 없으면(figma/PRD only) — 위 N/A 산출물만 생성(`--output` 만), openapi 는 4단계에서 AI 도출.

### 3단계 — AI code-optional 산출 (5종 / greenfield-mode)

각 analysis skill 의 **greenfield (code-optional) mode** 로 입력어댑터 extract 에서 산출 (코드 grep ❌ / 입력 출처 인용):
- `analysis-architecture` → architecture.json (설계 의도 / stack 권장 패턴 / `inferred`)
- `analysis-domain-model` → domain.json (swagger domain_seed / figma 화면 / PRD 엔티티)
- `analysis-business-rules` → business-rules.json (swagger rules_seed / PRD acceptance / form-validation)
- `analysis-openapi` → openapi.yaml (swagger 채널이면 2단계 결정적 elevation 으로 이미 생성 / 아니면 PRD·figma flow 에서 도출)
- `analysis-db-schema-erd` → schema.json (PRD ER / domain entity — ER 부재 시 synthesis = carry)

모든 산출물 `code_pointers` = N/A (`meta.code_pointers_na` 동형 / 가리킬 코드 부재). `source_grounded_evidence` = 입력 출처 인용 (`swagger:path` / `doc:§N` / `figma:node_id`).

### 4단계 — 검증 + finding

- `schema-validator` 로 산출물 schema 정합 확인 (greenfield 산출물도 strict schema-valid).
- 누락/합성-필요(예: PRD 에 ER 부재) → `_base-log-finding` 등재 + carry 표기 (no over-claim).

## 산출물

- `<user-project>/.aimd/output/{architecture,domain,business-rules,schema}.json` + `openapi.yaml` (7대 subset)
- `<user-project>/.aimd/output/antipatterns.json` (N/A 빈) + `migration-cautions.json` (N/A stub / ADR-011 json 단독)

## 본체 명세 참조

- `methodology-spec/use-scenario-taxonomy.md` §3 (greenfield bootstrap 절차 SSOT)
- `methodology-spec/lifecycle-contract.md` (analysis = 코드-고고학[legacy] + 입력어댑터[greenfield] 두 패스)
- `schemas/work-unit-manifest.schema.json` (scenario enum)
- `tools/greenfield-bootstrap/src/cli.js` (결정적 elevation + N-A)

## When NOT to invoke

- legacy 코드 분석 (S1/S2/S3) → `analysis-input-collection` (코드-고고학 패스 포함).
- scenario 미선언 → `chain-driver init --scenario greenfield` 먼저.
- ★ 정직 한계: 본 skill 의 AI code-optional mode 산출은 **≥2 입력 채널 dogfood 미완** (swagger 1채널 입증 / figma·PRD 2nd 채널 = carry `C-use-scenario-greenfield-dogfood-2nd-channel`). DB schema 합성(entity→table) = carry `C-use-scenario-greenfield-schema-synthesis`.
