# 산출물 #2: 도메인 모델 (Domain Model — DDD-Lite B)

> **사상**: DDD-Lite B 강도 (ADR-004 — Entity/VO/Aggregate/Repository/UbiquitousLanguage 까지 추출, Context Map / Subdomain / Domain Event / Saga 미추출)
> **schema**: `schemas/domain.schema.json` · **template**: `templates/domain.template.{md,mermaid}`
> **생성 phase**: Phase 4 (`/analyze-business-logic`)

---

## 1. 목적

**답하는 질문**: "이 시스템의 핵심 개념과 행동은? 도메인 경계는?"

**AI 재구현 시 활용**: 엔티티/VO/Aggregate 자동 생성 / Bounded Context 식별

---

## 2. 형식

```
output/domain/
├── domain.json                    # AI용 (구조화)
├── domain.md                      # 사람용 요약
├── domain.mermaid                 # classDiagram (엔티티 관계)
├── use-cases.md                   # 유스케이스 카탈로그
└── ubiquitous-language.md         # 보편 언어 사전
```

**DDD-Lite B 적용 범위** (ADR-004):

| ✅ 추출 | ❌ 미추출 (v1.2 이후) |
|---|---|
| Bounded Context, Entity, Value Object, Aggregate, Aggregate Root, Invariants, Repository, Domain Service, Use Case, Ubiquitous Language | Context Map, Subdomain 분류, Domain Event, Saga |

---

## 3. 추출 범위

### 3.1 추출 대상 (출처 / 방법 / 신뢰도 / 의존)

| 항목 | 추출 출처 | 방법 | 신뢰도 (ORM 있음 / 없음) | 선행 의존 |
|---|---|---|---|---|
| Entity | ORM `@Entity` | 결정적 | 0.95 / 0.60 | — |
| Aggregate Root | `@OneToMany cascade=ALL, orphanRemoval=true` | 결정적 | 0.90 / 0.50 | Entity |
| Value Object | `@Embeddable` | 결정적 | 0.95 / 0.55 | Entity |
| Repository | Repository 클래스 | 결정적 | 0.95 / 0.70 | Entity |
| Domain Service | Service 클래스 안 도메인 로직 | LLM 추론 | 0.70 | Entity |
| Invariants | 메서드 안 가드 절, DB CHECK | LLM 추론 | 0.65 | Entity |
| Bounded Context | 패키지 구조 + 모듈 경계 | LLM 추론 | 0.60 / 0.50 | Phase 3 architecture |
| Ubiquitous Language | 클래스명 + 메서드명 + ERD 컬럼 | LLM 추출 | 0.75 / 0.65 | Entity, DB schema |
| Use Case | 서비스 메서드 + Controller 매핑 | LLM 추론 | 0.75 / 0.60 | Entity, API |

**입력**: 소스 코드 + Phase 2 DB schema + Phase 3 architecture
**평균 신뢰도**: ORM 있음 ~85%, 없음 ~60%
**사람 검토 필수**: Bounded Context 경계, Invariants

### 3.2 미추출 (의도적)

- 도메인 이벤트 → v1.2 이후 (ADR-004)
- 비즈니스 정책 상세 → 비즈니스 규칙 산출물(#5) 로 분리
- 영속화 상세 → DB 스키마 산출물(#4) 로 분리

---

## 4. 엔티티 형식

```yaml
- id: E-ORDER-Order
  type: aggregate_root
  bounded_context: BC-ORDER
  attributes:
    - name: id
      type: Long
      pk: true
    - name: status
      type: OrderStatus (enum)
    - name: totalAmount
      type: Money (value_object)

  children:
    - entity: E-ORDER-OrderItem
      relation: "1:N"
      cascade: ALL
      orphan_removal: true

  invariants:
    - "주문 상태가 PENDING/PAID 일 때만 취소 가능"
    - "totalAmount = Σ(items.price × items.quantity)"

  repository: OrderRepository (JpaRepository)

  source: src/main/java/com/example/order/Order.java
  confidence: 0.90
  extraction_method: pattern_matching
```

---

## 5. 유스케이스 형식

```yaml
- id: UC-ORDER-001
  name: "주문 생성"
  actor: "인증된 사용자"
  preconditions:
    - "장바구니에 1개 이상 상품"
  postconditions:
    - "Order 생성 (status=PENDING)"
    - "재고 차감"

  related_entities: [E-ORDER-Order, E-ORDER-OrderItem, E-PRODUCT-Product]
  related_apis: [createOrder]
  related_rules: [BR-ORDER-001, BR-ORDER-007]

  source: OrderService.createOrder()
  confidence: 0.75
```

---

## 6. 검증 체크리스트

```
□ domain.json schema 검증 통과
□ classDiagram Mermaid 렌더링
□ 모든 Entity 에 ID 표준 (E-{도메인}-{이름}) 적용
□ Aggregate Root 명시 (ORM cascade=ALL 기준)
□ Use Case ↔ API operationId 매핑 일관성
□ 보편 언어 = 사용자 검토
```

---

## 7. 산출물 간 참조

| 방향 | 의미 |
|---|---|
| DOM → API | UC ↔ operationId 매핑 |
| DOM → DB | Entity ↔ Table |
| DOM → RULES | Invariants 근거 |
| DOM → ARCH | Bounded Context 경계 |

---

## 8. 흔한 함정

### 8.1 Anemic Domain Model
- 증상: Entity 에 getter/setter 만 있고 도메인 로직이 Service 에
- 대응: AP-DOMAIN-ANEMIC-XXX 등록 + 도메인 로직 위치 기록

### 8.2 Aggregate 과잉
- 증상: 모든 Entity 를 Aggregate Root 로 판정
- 대응: cascade=ALL + orphanRemoval 기준 엄격 적용

### 8.3 ORM 없는 프로젝트
- 증상: MyBatis 만 사용 → @Entity 없음 → Entity 자동 감지 실패
- 대응: SQL Mapper + DTO 클래스에서 LLM 추론, 신뢰도↓ 표기
