---
name: analysis-source-inventory
description: Use after analysis-input-collection to enumerate modules, packages, files, and dependencies in the analysis target. Generates inventory.json (산출물 1). Required prerequisite for analysis-architecture. Stage = analysis. 사용자: "인벤토리 조사" / "모듈 분석" / "의존성 추출".
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-source-inventory — 인벤토리 산출

분석 target 의 모듈 / 패키지 / 파일 / 의존성 전수 조사.

## 사전 조건

- `<user-project>/.ai-context/input.json` 존재 (analysis-input-collection 완료)

## 절차

1. **언어별 entry point 식별** (analysis-input-collection 의 stack 정보 활용):
   - Java/Spring: `pom.xml` modules / `application.yml` profiles
   - Node/NestJS/Next: `package.json` workspaces / `nest-cli.json`
   - Python: `pyproject.toml` packages
2. **모듈 / 패키지 트리 작성** — Glob 으로 디렉토리 구조 / Read 로 manifest 파일.
3. **의존성 그래프** — package manager 출력 (npm ls / mvn dependency:tree / pip freeze) 또는 manifest 파싱.
4. **scope 후보 도출 — 대형/decayed 코드베이스 (측정 기반 절취선)**:
   - **원칙: 패키지 경로 ≠ 경계, 실측 coupling = 경계.** 명목 패키지 트리(BC/레이어)를 scope 절취선으로 액면 수용하면 decayed-architecture(클린아키텍처 *지향*하나 미준수)에서 깨진다 — `modules_for_priority_analysis` 의 LOC 추정만으로 scope 를 끊지 말 것. (CodeScene temporal-coupling: "layered architecture will lead you to exactly those expensive change patterns" / Vertical Slice(Bogard): "couple along the axis of change")
   - **codegraph 실측 → 결정론 coupling 집계**: `analysis-code-graph` 가 산출한 `code-graph.json` 의 edge 를 모듈간 coupling 행렬로 **결정론 집계**(LLM 추정 ❌). 고결합 쌍(예: `frontoffice/biztrip` ↔ `backoffice/biztrip`)은 같은 응집 단위 후보 → `scope_candidates[]` 로 묶는다. members 는 **명목 BC 경계를 관통할 수 있다**(한 업무의 두 얼굴).
   - **`scope_candidates[]` 산출** (schema `scope_candidates`): id(slug) / members / internal·external_coupling / crosses_nominal_boundary / decay_grade / `source` (codegraph_measured | loc_estimate | manual). **advisory — reference-lens / gate inject ❌ / 최종 절단은 사용자 결단.**
   - **codegraph 환경 부재 시**: scope_candidates 는 `source=loc_estimate` 로 best-effort + `meta.warnings` 에 "coupling 미측정 — 추정" 정직 표기 (no-simulation / codegraph_measured 표기 ❌). exit 3 신호면 사용자에게 codegraph 설치/CI 위임 안내.
   - **경계 위반 라우팅**: codegraph 가 드러낸 의존성 규칙 위반(domain→infrastructure 역참조, feature 축 벗어난 교차참조)은 버그가 아니라 **1급 산출물** → `analysis-quality-antipattern`(category=ARCH) + `migration-cautions` + finding 으로 흘린다. decay = 분석 가치.
5. **inventory.json 작성** — `schemas/inventory.schema.json` (strict / SSOT) 기준:
   ```json
   {
   	"meta": { "...": "..." },
   	"repo": { "...": "..." },
   	"stack": { "...": "..." },
   	"architecture_style_candidates": ["..."],
   	"modules_for_priority_analysis": ["..."],
   	"scope_candidates": ["... (대형/decayed 시 — coupling 측정 도출 / advisory)"]
   }
   ```
   top-level required = `meta` · `repo` · `stack` (strict `additionalProperties:false`). 정확한 하위 구조는 `schemas/inventory.schema.json` 이 SSOT — 위 키 외 필드 추가 시 schema-validator fail.
6. **drift-validator 검증** — schema 정합 자동 확인 (PostToolUse hook).
7. **finding 등재** — gap / unclear module ownership / 경계 위반 등 발견 시 `log-finding`.

## 산출물

`<user-project>/.ai-context/output/inventory.json` (validate against `schemas/inventory.schema.json`)

## 다음

- `analysis-architecture` 호출 권장

## 인용

- 정책: methodology-spec/workflow/discovery.md
- schema: schemas/inventory.schema.json (inventory 산출물 = `discovery` phase output / 별도 deliverables 문서 ❌)
- ADR-CHAIN-016 (측정 기반 scope 도출 / 패키지 경로 ≠ 경계 / advisory)
- DEC-2026-06-09-measured-coupling-scope-derivation
