# 산출물 #6: 안티패턴 (Antipatterns)

> **사상**: 회피 후보 (단정적 표현 지양 — 시니어 채택 저항 완화)
> **schema**: `schemas/antipatterns.schema.json` · **template**: `templates/antipatterns.template.md`
> **생성 phase**: 각 phase 에서 부분 발견 → `quality` phase (`/analyze-quality`) 에서 통합

---

## 1. 목적

**답하는 질문**: "이 시스템에서 무엇을 피해야 하는가?"

**AI 재구현 시 활용**: 회피 목록으로 코드 생성 제약 / 같은 실수 반복 방지

---

## 2. 형식

```
output/antipatterns/
├── antipatterns.json               # AI용 (구조화)
├── avoid-list.md                   # 사람용 체크리스트
└── (선택) details/                 # 개별 안티패턴 상세
    └── AP-DB-N-PLUS-ONE-001.md
```

### 2.1 안티패턴 형식

```yaml
- id: AP-DB-N-PLUS-ONE-001
  category: DB
  name: "N+1 쿼리"
  severity: high

  description: "OrderService.getOrders() 에서 주문 목록 조회 후 각 주문의 아이템을 개별 쿼리로 가져옴"

  location:
    file: src/main/java/com/example/order/OrderService.java
    line: 45

  evidence: "ORM lazy loading + 루프 내 접근"
  detection_method: pattern_matching  # deterministic | pattern_matching | llm_inference

  recommendation: "fetch join 또는 @EntityGraph 적용"
  related_rules: []
  related_entities: [E-ORDER-Order, E-ORDER-OrderItem]

  confidence: 0.90
```

---

## 3. 추출 범위

### 3.1 카테고리별 추출 대상 (출처 / 방법 / 신뢰도)

| 카테고리 | 안티패턴 예시 | 방법 | 신뢰도 |
|---|---|---|---|
| **DB** | N+1 쿼리, SQL 에 비즈니스 로직 박힘 | 패턴 매칭 | 0.85~0.98 |
| **ARCH** | 순환 의존성, God Class, 레이어 위반 | AST 분석 | 0.98 |
| **DOMAIN** | Anemic Domain Model, Entity 에 UI 로직 | LLM 추론 | 0.70 |
| **API** | REST 원칙 위반, 일관성 없는 응답 | 패턴 매칭 + LLM | 0.80 |
| **FE** | 인라인 스타일 난무, 컴포넌트 분류 부재 | 패턴 매칭 | 0.85 |
| **VALIDATION** | FE-BE 검증 불일치, 중복 검증 | 교차 분석 | 0.75 |
| **CONFIG** | 매직 넘버, 환경별 정책 분산 | 설정 파일 추출 | 0.80 |
| **PERFORMANCE** | EAGER fetch, 비효율 쿼리 | 패턴 매칭 | 0.85 |

**입력**: 각 phase 산출물 + 소스 코드
**톤**: "오류" 가 아니라 **"회피 후보"**. 단정적 표현 지양.

### 3.2 미추출 (의도적)

- 성능 안티패턴 (측정 필요) → NFR 영역
- 보안 취약점 → SAST 도구 영역
- 테스트 코드 안티패턴 → v1.2 이후

---

## 4. Severity 격상 정책

PoC cross-validation 권위에 따라 severity 자동 격상.

### 4.1 격상 규칙

| 트리거 | 격상 |
|---|---|
| 1 PoC 발견 | 현재 등급 유지 (단일 PoC 과적합 회피) |
| 2 PoC 재현 | 현재 등급 유지 + ★ 이중 권위 표기 |
| 3 PoC 재현 | medium → **high** 자동 격상 (★★ 보편 결함 입증) |
| 3 PoC 재현 + critical 영향 | high → **critical** (★★★) |
| 2 PoC 비재현 학습 효과 | positive finding 등재 |

---

## 5. `formal-spec` phase cross-link (formal_spec_links)

ADR-008 (이중 렌더링) 정합 — AP 가 BR / state-machine / sequence-diagram / invariant 직접 참조 시 신뢰도 +5%p.

### 5.1 의무 vs 선택 (category 별)

| category | formal_spec_links | 근거 |
|---|---|---|
| **DOMAIN** | **의무** | BR / state-machine 직결 (Anemic Domain / God Class 등) |
| **API** | **의무** | decision_table 직결 (versioning / PUT vs PATCH 등) |
| **FE** | **의무** | BR validation 누락 = decision_table 직결 |
| ARCH | 선택 | 정적 구조 결함, BR 무관 (순환의존성 / Layer 위반) |
| DB | 선택 | DB 정합성 결함, BR 무관 (drift / naming) |
| PERFORMANCE | 선택 | 성능 패턴, BR 무관 (N+1 / EAGER) |
| SECURITY / CONFIG / EXTERNAL / TESTABILITY / MAINTAINABILITY | 선택 | 카테고리별 판단 |

**적용 시점**: v1.4 신규 PoC 부터. v1.3.x 시점 기존 PoC 산출물은 release 보존.

### 5.2 schema 구조

```yaml
formal_spec_links:
  decision_tables: ["../formal-spec/decision-tables/BR-USER-DELETE-AUTH-001.md"]
  state_machines:  ["../formal-spec/state-machines/User.json"]
  sequence_diagrams: ["../formal-spec/sequences/login-flow.json"]
  invariants:      ["../formal-spec/invariants/User.ts"]
```

---

## 6. 검증 체크리스트

```
□ antipatterns.json schema 검증 통과
□ 모든 AP 에 ID 표준 (AP-{카테고리}-{이름}-{번호}) 적용
□ severity (high/medium/low) 부여
□ 감지 방법 명시 (detection_method)
□ recommendation 필수 기재
□ confidence < 0.70 이면 human_review_required 표기
□ DOMAIN / API / FE 카테고리 AP 는 formal_spec_links 기재 (의무 / v1.4+)
□ 그 외 카테고리 AP 는 formal_spec_links 선택
□ 다른 산출물에서 발견된 AP 가 모두 통합됨 (`quality` phase)
```

---

## 7. 산출물 간 참조

| 방향 | 의미 |
|---|---|
| AP → ARCH | 순환 의존성 |
| AP → RULES | FE-BE 검증 불일치 |
| AP → DB | N+1, deprecated table |
| AP → DOM | Anemic Domain |
| AP → UI | FE 안티패턴 |
| AP → FORMAL | DOMAIN/API/FE category — formal_spec_links 의무 |

---

## 8. 흔한 함정

### 8.1 단정적 표현
- 증상: "이건 잘못됐다" → 시니어 반발
- 대응: "회피 후보: ~하면 ~위험이 있음" 톤

### 8.2 false positive
- 증상: 의도적 설계를 안티패턴으로 오탐
- 대응: confidence 표기 + 사용자 검토 게이트

### 8.3 `quality` phase 통합 누락
- 증상: `db-schema` phase 에서 발견한 AP 가 최종 목록에 빠짐
- 대응: 각 phase 산출물에 AP 섹션 → `quality` phase 에서 전수 수거

### 8.4 단일 PoC 과적합 격상
- 증상: 1 PoC 발견을 high 로 격상
- 대응: §4.1 격상 규칙 — 3 PoC 재현 입증 후 격상
