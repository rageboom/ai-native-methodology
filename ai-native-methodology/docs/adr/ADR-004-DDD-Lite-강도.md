# ADR-004: DDD-Lite B 강도 채택 (전술 패턴까지)

- 상태: 승인됨 (Accepted)
- 일자: 2026-04-26
- 결정자: 윤주스 (TF Lead) — 옵션 B 명시 결정
- 관련: ADR-001, schemas/domain.schema.json

## 컨텍스트

ADR-001에서 DDD-Lite를 채택했지만 **강도(어디까지 적용할지)** 가 미정이었다. 3가지 옵션:

- **A. 어휘만**: Entity, Use Case 정도
- **B. 전술 패턴까지**: Aggregate, Value Object, Repository, Domain Service
- **C. 전략 설계 가볍게**: B + Bounded Context Map + Subdomain 분류

## 결정

**B 채택 — 전술 패턴까지**.

### B의 적용 범위

```
✅ 채택:
  - Bounded Context (도메인 그룹화 — 가벼운 식별만)
  - Entity (식별자 가진 객체)
  - Value Object (불변 값 객체)
  - Aggregate (트랜잭션 경계)
  - Aggregate Root
  - Invariants (집합체 불변식)
  - Repository (집합체 단위 영속화)
  - Domain Service (도메인 로직)
  - Ubiquitous Language (보편 언어)
  - Use Case

❌ 미채택 (v1.2 이후):
  - Context Map (도메인 간 관계 패턴)
    - customer-supplier, conformist, anticorruption-layer 등
  - Subdomain 분류 (Core / Supporting / Generic)
  - Domain Event
  - Saga 패턴
  - Anticorruption Layer
```

### 추출 방식

| 정보 | 출처 | 자동 추출 |
|---|---|---|
| Entity | ORM `@Entity` | ✅ |
| Aggregate Root | ORM `@OneToMany cascade=ALL, orphanRemoval=true` | ✅ |
| Value Object | ORM `@Embeddable` | ✅ |
| Repository | Repository 클래스 (Spring Data, MyBatis Mapper 등) | ✅ |
| Domain Service | Service 클래스 안 도메인 로직 | 🟡 LLM 추론 |
| Invariants | 메서드 안 가드 절, DB CHECK | 🟡 LLM 추론 |
| Bounded Context | 패키지 구조 + 모듈 경계 | 🟡 LLM 추론 (가볍게) |
| Ubiquitous Language | 클래스명 + 메서드명 + ERD 컬럼 | 🟡 LLM 추출 |

## 결정 근거

### B를 채택한 이유

1. **PoC 시드(RealWorld)가 단일 모놀리스**
   - C의 Context Map 가치 제한적
   - B만으로도 산출물 양이 충분

2. **자동 추출 신뢰도**
   - B: ORM 있을 때 85% 가능
   - C: 모든 입력 있어도 50~60% (LLM 추론 비중↑)

3. **시니어 BE 채택 저항 완화**
   - B는 "Aggregate 경계 = 트랜잭션 경계" 같은 실무 친화 개념
   - C는 워크숍 (Event Storming) 영역까지 확장

4. **PoC 검증 후 단계적 확장 가능**
   - B 검증 후 v1.2에서 C 추가가 자연스러움

### B 선택 시 한계 (의식해야 할 것)

- 마이크로서비스 분리 가이드 부족 (Context Map 부재)
- 마이그레이션 우선순위 결정 시 Subdomain 분류 부재
- 외부 시스템 통합 패턴 부재 (ACL 없음)

→ 사내 마이크로서비스/멀티 도메인 시스템 분석 시점에 v1.2로 C 추가 예정

## 결과

### 긍정적 영향
- domain.schema.json이 단순·구체적 (이미 B 기준으로 작성됨)
- ORM 기반 자동 추출 가능 (85% 신뢰도)
- 시니어 BE 친화 개념 (Aggregate, Repository는 익숙)
- v1.2 확장 여지 (`v12_reserved` 필드 schema에 이미 존재)

### 부정적 영향 / 위험
- 도메인 간 관계 분석 부재
- 마이크로서비스 분리 가이드 부족
- 사용자가 "왜 Context Map 없어?" 물어볼 수 있음 → 본 ADR로 답변

## 영향 범위

- `schemas/domain.schema.json`: B 기준으로 이미 작성됨, `v12_reserved` 필드로 확장 여지
- `methodology-spec/deliverables/02-도메인-모델.md`: B 강도로 명시
- `templates/domain.template.md`: B 강도 템플릿
- v1.2 ADR 후보: "Context Map 추가" (사내 MSA 분석 시 작성 예정)

## 대안 검토

| 옵션 | 채택 여부 | 이유 |
|---|---|---|
| A (어휘만) | ❌ | 너무 빈약, 재구현 시 가이드 부족 |
| **B (전술 패턴)** | **✅ 채택** | RealWorld 적합, 자동 추출 가능, 시니어 친화 |
| C (전략 설계) | 🔮 v1.2 | RealWorld엔 과함, 사내 MSA 분석 시 추가 |
| 풀 DDD | ❌ | ADR-001에서 명시적 제외 |

## 참고
- ADR-001 (사상적 기반)
- Eric Evans, "Domain-Driven Design", Part II (전술적 설계)
- Vaughn Vernon, "Implementing Domain-Driven Design"
- schemas/domain.schema.json (DDD-Lite B 명시)
