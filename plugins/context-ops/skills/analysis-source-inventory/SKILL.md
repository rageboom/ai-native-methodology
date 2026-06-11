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
   - **신호원 우선순위 (역할 분담)**: scope_candidates 는 **확정 출력 컨테이너**일 뿐, 신호 자체는 아래 순서로 받는다.
     1. **scope-carve.json (권장 / 가장 풍부)** — `analysis-scope-carve` 가 있으면 그 `carve_candidates[]`(Tarjan SCC atomic / Martin seam·hub·sink / co-change behavioral cluster / hotspot 우선순위)를 1차 신호로 받아 `scope_candidates[]` 로 일원화. `source=scope_carve` + `carve_signals[]` 에 근거 신호(scc/martin/co_change/hotspot) 인용. (scope-carve 와 scope_candidates 를 **별도 평행 산출물로 두지 말 것** — scope-carve=신호, scope_candidates=확정.)
     2. **codegraph coupling 집계 (scope-carve 부재 시 / corroborating)** — `tools/codegraph-coverage` module axis 가 sqlite 인덱스에서 모듈간 coupling 을 **결정론 집계**(LLM 추정 ❌ / code-graph.json 에는 edge 없음 — F-DOGFOOD-013 / 호출법 = analysis-code-graph 스킬 4-b). **`import_verified=true` hole + corroborated 만** scope 신호로 사용 (false = 모노레포 동명 심볼 이름-해석 의심 — 제외). 고결합 쌍(예: `frontoffice/biztrip` ↔ `backoffice/biztrip`)=같은 응집 단위 후보. `source=codegraph_measured`. scope-carve 와 함께면 co-change 와 교차검증.
     3. **LOC 추정 (둘 다 부재 / fallback)** — `source=loc_estimate` + `meta.warnings` "coupling 미측정 — 추정" 정직 표기.
   - **backbone-first 순서 (대형 / 측정 기반 절취선)**: 측정 후 scope 를 끊기 전에 **공통 backbone 을 먼저 분리**한다.
     - ⓐ **DB** = always-on backbone (schema.json / db-assets-always-on 정책).
     - ⓑ **shared-kernel** = Martin afferent-hub(Ca 최상위 = 만물이 의존하는 공통 유틸/코드: cache·base·utils·공통 예외/응답 등). 이건 **개별 scope 가 아니라** `scope_candidates[].role=backbone` 으로 빼서 **1회 분석 / 모든 scope 가 참조**.
     - **이유**: hub 를 빼면 feature 의 external coupling 상당분(주로 kernel 행)이 사라져 **feature 가 깨끗한 scope 로 분리**된다 (Martin "hub 쪼개면 파편화" + DDD shared-kernel + Vertical Slice "slice 간 결합 최소"). 그 후 남은 feature = `role=scope`.
   - **coarseness 재점검 (coarse-to-fine 재귀)**: 측정으로 도출한 candidate 라도 members 가 **복수 독립 응집 sub-unit 을 한 묶음**으로 담을 수 있다(명목 패키지 1개 = 실제 N개 도메인). 이때 candidate 를 더 잘게 **재-carve**(측정 단계 재적용)한 뒤 절단한다 — 한 번의 coupling 집계가 항상 최종 응집 단위를 주지 않는다. 거칠음 신호(advisory): ⓐ members 가 다수 독립 하위 트리(각자 domain/service/infra 세트)로 갈림 ⓑ candidate 내부 coupling 약하게 분절(SCC 가 candidate 안에서 재분할) ⓒ 후행 — scope 진입 후 `discovery.uc.under_decomposition`(UC/entity<1.5) 발화 = scope 가 거칠었다는 사후 증거. 재분해 절단은 사용자 soft gate #0 결단(자동 재분해 ❌).
   - **`scope_candidates[]` 산출** (schema `scope_candidates`): id(slug / 사용자가 알아듣기 쉬운 의미 명칭 — 패키지 약칭 그대로 ❌) / members(명목 BC 경계 관통 가능 — 한 업무의 두 얼굴) / internal·external_coupling / crosses_nominal_boundary / decay_grade / `role`(scope|backbone) / `source` / `carve_signals`. **advisory — reference-lens / gate inject ❌ / 최종 절단은 사용자 soft gate #0 결단.**
   - **환경 부재 시**: codegraph exit 3 신호면 사용자에게 codegraph/scope-carve 실행·CI 위임 안내 (no-simulation / 안 돌린 신호로 표기 ❌).
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
