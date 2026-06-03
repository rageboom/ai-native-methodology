---
name: analysis-architecture
description: Use after analysis-source-inventory to extract architecture (layers, modules, dependencies, boundaries). Generates architecture.json (산출물 1 / json 단독 SSOT). Required prerequisite for analysis-domain-model. Stage = analysis. 사용자: "아키텍처 분석" / "레이어 추출" / "의존성 그래프".
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-architecture — 아키텍처 추출

inventory 기반으로 layered architecture / hexagonal / clean / micro / monolith 패턴 식별.

## 사전 조건

- `<user-project>/.aimd/output/inventory.json` 존재 (analysis-source-inventory 완료)

## 절차

1. **아키텍처 패턴 식별** — 의존성 방향 분석:
   - layered (presentation → service → repository)
   - hexagonal (domain ← port ← adapter)
   - clean (entities ← use cases ← adapters ← frameworks)
   - micro (서비스 boundary 식별)
2. **계층 / 모듈 매핑** — inventory 의 패키지를 계층에 할당.
3. **순환 의존성 검출** — ADR-006 (순환의존 정책) 적용. 발견 시 finding 등재.
4. **architecture.json 작성** — `schemas/architecture.schema.json` (strict / SSOT):
   ```json
   {
     "meta": {...},
     "architecture_style": "hexagonal",
     "modules": [...],
     "dependencies": [...],
     "circular_dependencies": []
   }
   ```
   top-level required = `meta` · `modules` · `dependencies` (strict). 패턴 후보는 `architecture_style` (inventory 의 `architecture_style_candidates` 와 정합). 위 키 외 필드 추가 시 schema-validator fail.
   의존 edge 에 사람-눈 설명 라벨이 있으면 `dependencies[].note` (긴 근거 = `detail`) 에 기록 — 구 architecture.mermaid edge 라벨 흡수 (ADR-011 / json 단독 / .mermaid·.md 미산출).

## 산출물

- `<user-project>/.aimd/output/architecture.json` (json 단독 SSOT — .mermaid·.md 미산출 / ADR-011)

## greenfield (code-optional) mode

`work-unit-manifest.scenario == "greenfield"` (legacy 코드 없음 / DEC-2026-05-30-use-scenario-taxonomy §2.4 옵션 A) 일 때 — 의존성 방향 코드 분석 대신 **설계 의도** 에서 산출:

- 입력 = `.aimd/<scope>/planning/{swagger,figma,plan-doc,prompt}-extract.json` (`analysis-greenfield-bootstrap` 진입점) + 사용자 stack 선택.
- pattern = PRD 아키텍처 의도 / swagger tag grouping / figma 화면 구조에서 추론, 없으면 **stack 권장 패턴** 제시 + `inferred` 명시 (예: Spring Boot 3 → layered or hexagonal 권고).
- `circular_dependencies` = `[]` (신규 빌드 / 아직 코드 없음). `source_grounded_evidence` = 입력 출처 인용.
- `code_pointers` = N/A (`meta.code_pointers_na` 동형 / 가리킬 코드 부재).
- 무회귀: scenario ≠ greenfield 시 본 절 무시 (legacy inventory→의존성 추출 경로 그대로).

## 본체 명세

- `methodology-spec/workflow/architecture.md`
- `methodology-spec/deliverables/1-architecture.md`
- `schemas/architecture.schema.json`
- ADR-006 (순환의존 정책)

## 다음

- `analysis-domain-model` 호출 권장
