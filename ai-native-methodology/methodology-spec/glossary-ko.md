# 한국어 용어집

> **용어 정책**: ADR-005 (한국어 용어 정책 3단)

---

## 용어 정책 (3단)

| 단 | 기준 | 처리 |
|---|---|---|
| 1단 | 산업 표준 용어 | **영문 그대로** |
| 2단 | DDD 어휘 | **영문 + 한국어 병기** |
| 3단 | 자체 용어/약어 | **한국어로 번역 또는 폐기** |

---

## 용어 매핑 표

### 1단 — 산업 표준 (영문 그대로)

| 영어 | 비고 |
|---|---|
| OpenAPI | 산업 표준 |
| JSON Schema | 산업 표준 |
| REST | 산업 표준 |
| AST | Abstract Syntax Tree |
| Mermaid | 다이어그램 도구 |
| Swagger | API 문서 도구 |

### 2단 — DDD 어휘 (영문 + 한국어 병기)

| 영어 | 한국어 표기 |
|---|---|
| Entity | 엔티티 (Entity) |
| Aggregate | 집합체 (Aggregate) |
| Aggregate Root | 집합체 루트 (Aggregate Root) |
| Value Object | 값 객체 (Value Object) |
| Bounded Context | 도메인 경계 (Bounded Context) |
| Repository | 리포지토리 (Repository) |
| Domain Service | 도메인 서비스 (Domain Service) |
| Use Case | 유스케이스 (Use Case) |
| Ubiquitous Language | 보편 언어 |
| Invariants | 불변식 (Invariants) |
| Cardinality | 관계 수 (cardinality) |

### 3단 — 자체 용어 (한국어 번역/폐기)

| 영어 (구) | 한국어 (신) | 비고 |
|---|---|---|
| ~~Schema Drift Detection~~ | 출처 간 정합성 검증 | drift = 불일치 |
| ~~Cross-Cutting Business Logic~~ | (폐기) | 4영역으로 분리 |
| Schema-First | 스키마 우선 | |
| Contract-First | 계약 우선 | |
| Confidence Metadata | 신뢰도 메타데이터 | |
| Antipattern | 안티패턴 | |
| Deliverable | 산출물 | |
| Workflow | 워크플로우 | |
| Approval Gate | 승인 게이트 | |
| Human-in-the-loop | 사람 검토 | |
| Ground Truth | 정답 자료 | |
| Grounding | (LLM) 근거 제공 | |
| Bottom-up | 상향식 | |
| Single Source of Truth (SoT) | 단일 진실 원천 | |
| Feature Flag | 기능 플래그 | |
| no-simulation 정책 | 시뮬레이션 절대 금지 정책 | Static tool simulation 금지 / 진짜 외부 도구 실행 의무 (ADR-009 단계 4) |
| baseline + ratchet | 기준선 + 라쳇 | drift / dmn 도구 회귀 방지 패턴 (`--baseline` / `--ratchet` / `--write-baseline`) — ADR-010 |
| formal-spec-link | 형식 명세 cross-link | `formal-spec` phase 산출물 간 참조 무결성 (decision_tables / state_machines / sequence_diagrams / invariants) |
| severity:positive | 모범 사례 등재 | finding-system schema 신규 severity. cross-PoC 학습 효과 입증 (`learning_effect_type`: framework_natural_avoidance / language_static_block / platform_difference / team_learning) |
| severity cross-stage mapping | 등급 stage 간 정합 매핑 | rules 5종 ↔ ratchet 4종 ↔ MoSCoW 3종 단일 SSOT — `methodology-spec/severity-cross-stage-mapping.md` (v4.1.0 / 묶음 Q ④) |
| composite AP | 복합 안티패턴 | 여러 BR/state 결합 결함 (단일 패턴 매칭 불가). 등록 거절 + antipatterns.json 가독성 우선 (★ v12 ADR-011) |

---

## 다이어그램 용어 규칙

| 규칙 | 예시 |
|---|---|
| 노드 ID 는 영문 | `Good["✅ 좋음"]` |
| 한글은 라벨에만 | `Static --> Merge` (O), `정적 --> 통합` (X) |
| style 참조도 영문 | `style Transform fill:#fff` |

---

## 신규 용어 추가 절차

1. 3단 기준에 따라 분류
2. 본 문서에 추가
3. PR + ADR-005 참조
