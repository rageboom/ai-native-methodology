# BR-<RuleId>-<NN> — Decision Table

> **일자**: YYYY-MM-DD
> **Source of Truth**: <자연어 명세 (rules.json) | 코드 (file:line) | 양쪽>
> **관련 BR**: BR-<RuleId>-<NN> 외 ...

---

## 1. 정책 문장 (자연어 — L0)

> **rules.json BR-<RuleId>-<NN>**
>
> - given: "<전제 조건>"
> - when: "<트리거>"
> - then: "<기대 결과>"

**자연어가 명시한 것 (4가지 — 자연어 빈약성 44%)**:

1. 트리거 조건: <조건>
2. 액션: <action>
3. 기대 결과: <result>
4. 현재 상태: <complete | partial | absent>

**자연어가 안 말한 것 (5가지 — 형식화 시 결단 필요)**:

1. ❓ 거부 방식 — Exception vs return vs no-op
2. ❓ 검증 위치 — Domain / Service / Adapter / DB
3. ❓ HTTP status — 400 / 422 / 409 / etc
4. ❓ 에러 메시지 — 텍스트
5. ❓ 일관성 — 역방향/idempotent 정합

→ **자연어 빈약성 정량**: 9 항목 중 자연어는 4 (44%) 만 명시.

---

## 2. 형식화 결단

| ❓ 미명시 항목 | 결단                                       | 근거                   |
| -------------- | ------------------------------------------ | ---------------------- |
| 거부 방식      | <Exception type> throw / return X / silent | <근거>                 |
| 검증 위치      | <Domain / Service / Adapter / DB>          | <근거>                 |
| HTTP status    | <code>                                     | <RFC 9110 §X.Y / 관행> |
| 에러 메시지    | "<message>"                                | <영문/한글 + 명료>     |
| 일관성         | <역방향 동작>                              | <기존 패턴 정합>       |

---

## 3. L1 결정표 (트리거 시점)

| 입력1 null | 입력2 null | 입력1 == 입력2 | 이미 존재 | 결과                       | HTTP   | 검증 위치 |
| :--------: | :--------: | :------------: | :-------: | -------------------------- | ------ | --------- |
|     O      |     \*     |       \*       |    \*     | <reject 1>                 | 400    | <위치>    |
|     X      |     O      |       \*       |    \*     | <reject 2>                 | 400    | <위치>    |
|     X      |     X      |       O        |    \*     | <reject 3 (BR core)>       | <code> | <위치>    |
|     X      |     X      |       X        |     O     | silent return (idempotent) | 200    | <위치>    |
|     X      |     X      |       X        |     X     | persist OK                 | 201    | DB        |

= BR 핵심 행 (자연어 빈약성 보완 결과).

---

## 4. L1 결정표 (역방향 — 일관성 점검)

| 조건1  | 조건2  | 결과     | 비고   |
| :----: | :----: | -------- | ------ |
| <case> | <case> | <result> | <note> |

→ **일관성 검증**: 정방향 fix 후 역방향 자동 NoOp 또는 정합 동작 의무.

---

## 5. L2 Refinement Type

```typescript
type <RefinedType> = readonly [<args>] & {
  __refinement: { <constraint>: true };
};

namespace <AggregateRoot>_Invariants {
  /**
   * INV-<NAME> (BR-<RuleId>-<NN>)
   * - 자연어: BR-<RuleId>-<NN>
   * - 형식: Domain invariant
   */
  export const <invariantName> = (entity: <AggregateRoot>): boolean =>
    <조건식>;
}
```

---

## 6. 코드 생성안 (Direction D — 자연어 → 형식 → 코드)

### 6-A. <AggregateRoot> 생성자 보강

```java
public <AggregateRoot>(<args>) {
    // 기존 검증
    if (<input> == null || <input>.getId() == null) {
        throw new IllegalArgumentException("<existing check>");
    }
    // NEW (BR-<RuleId>-<NN> fix)
    if (<core invariant violation>) {
        throw new IllegalArgumentException("<message>");
    }
    this.<field> = <input>;
}
```

### 6-B. Service 변경 여부

- ✅ 변경 없음 (Domain 검증 자동 propagate)
- 또는 ❌ Service 도 보강 필요 (Adapter 우회 경로)

### 6-C. (권고) DB CHECK 제약

```sql
ALTER TABLE <table_name>
    ADD CONSTRAINT chk_<name>
    CHECK (<core invariant>);
```

→ **3중 안전망**: Service / Domain / DB. Hibernate byte buddy 우회 / 일괄 import / SQL 직접 INSERT 경로 차단.

---

## 7. Direction <A | B | A+D> 검증 결과

### Direction A (자연어 → 형식): self-reference 회피

```
rules.json (자연어)
  ↓ Direction A
state-machine + decision-table + invariants
  ↓ Direction D
코드 생성
```

자연어 빈약성 정량: <X> / 9 (<X\*100/9>%) 명시.

### Direction B (코드 → 형식): drift 검출

- 형식 명세 작성 시 코드와 격차 정량
- → finding 등록 후보

---

## 8. 발견된 신규 finding (cross-validation 후보)

| #     | finding | 심각도                   | 근거       |
| ----- | ------- | ------------------------ | ---------- |
| F-NNN | <설명>  | low/medium/high/critical | <evidence> |

---

## 9. 도식 참조

- 생애주기: [`../state-machines/<AggregateRoot>.mermaid`](../state-machines/<AggregateRoot>.mermaid)
- 오케스트레이션: [`../sequence-diagrams/UC-<UseCase>.mermaid`](../sequence-diagrams/UC-<UseCase>.mermaid)
- 타입 제약: [`../invariants/<AggregateRoot>.ts`](../invariants/<AggregateRoot>.ts)
- 코드 생성: [`../generated-code/<AggregateRoot>-with-<rule>.{java,sql}`](../generated-code/)

---

## 10. 핵심 결론

> **자연어 <X> line + 형식화 <Y> 결단 = 코드 <Z> line + invariant <I>건 + DB CHECK <C>건**.
> 형식화의 진짜 가치 (자연어 빈약성 강제 보완) 정량 입증.
