---
name: analysis-source-inventory
description: Use after analysis-input-collection to enumerate modules, packages, files, and dependencies in the analysis target. Generates inventory.json (산출물 1). Required prerequisite for analysis-architecture. Stage = analysis. 사용자: "인벤토리 조사" / "모듈 분석" / "의존성 추출".
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-source-inventory — 인벤토리 산출

분석 target 의 모듈 / 패키지 / 파일 / 의존성 전수 조사.

## 사전 조건

- `<user-project>/.aimd/input.json` 존재 (analysis-input-collection 완료)

## 절차

1. **언어별 entry point 식별** (analysis-input-collection 의 stack 정보 활용):
   - Java/Spring: `pom.xml` modules / `application.yml` profiles
   - Node/NestJS/Next: `package.json` workspaces / `nest-cli.json`
   - Python: `pyproject.toml` packages
2. **모듈 / 패키지 트리 작성** — Glob 으로 디렉토리 구조 / Read 로 manifest 파일.
3. **의존성 그래프** — package manager 출력 (npm ls / mvn dependency:tree / pip freeze) 또는 manifest 파싱.
4. **inventory.json 작성** — `schemas/inventory.schema.json` (strict / SSOT) 기준:
   ```json
   {
     "meta": { "...": "..." },
     "repo": { "...": "..." },
     "stack": { "...": "..." },
     "architecture_style_candidates": ["..."],
     "modules_for_priority_analysis": ["..."]
   }
   ```
   ★ top-level required = `meta` · `repo` · `stack` (strict `additionalProperties:false`). 정확한 하위 구조는 `schemas/inventory.schema.json` 이 SSOT — 위 키 외 필드 추가 시 schema-validator fail.
5. **drift-validator 검증** — schema 정합 자동 확인 (PostToolUse hook).
6. **finding 등재** — gap / unclear module ownership 등 발견 시 `log-finding`.

## 산출물

`<user-project>/.aimd/output/inventory.json` (validate against `schemas/inventory.schema.json`)

## 본체 명세

- `methodology-spec/workflow/discovery.md`
- `schemas/inventory.schema.json` (inventory 산출물 = `discovery` phase output / 별도 deliverables 문서 ❌ — v3.0.0 phase 의미 ID rename 정합)

## 다음

- `analysis-architecture` 호출 권장
