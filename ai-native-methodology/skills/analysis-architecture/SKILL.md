---
name: analysis-architecture
description: Use after analysis-source-inventory to extract architecture (layers, modules, dependencies, boundaries). Generates architecture.json (산출물 1) + ERD-style architecture diagram. Required prerequisite for analysis-domain-model. Stage = analysis. 사용자: "아키텍처 분석" / "레이어 추출" / "의존성 그래프".
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
4. **architecture.json 작성** — `schemas/architecture.schema.json`:
   ```json
   {
     "pattern": "hexagonal",
     "layers": [...],
     "modules_by_layer": {...},
     "boundaries": [...],
     "circular_dependencies": [],
     "meta_confidence": {...}
   }
   ```
5. **architecture.mermaid 생성** — layer / module 다이어그램 (ADR-008 이중 렌더링).
6. **drift-validator 검증** — `.json ↔ .mermaid` 의미 동등성 자동 확인.

## 산출물

- `<user-project>/.aimd/output/architecture.json`
- `<user-project>/.aimd/output/architecture.mermaid`

## 본체 명세

- `methodology-spec/workflow/architecture.md`
- `methodology-spec/deliverables/1-architecture.md`
- `schemas/architecture.schema.json`
- ADR-006 (순환의존 정책)

## 다음

- `analysis-domain-model` 호출 권장
