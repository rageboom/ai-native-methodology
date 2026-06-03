# Formal Spec — 작성 가이드 (Phase 4.5 산출물)

> 본 template 은 Phase 4.5 형식 명세 5 산출물 작성 가이드.
> 관련 명세: `methodology-spec/workflow/phase-4-5-formal-spec.md` + `methodology-spec/deliverables/4-5-formal-spec.md`
> 관련 schema: `schemas/formal-spec.schema.json`

---

## 작성 순서

```
1. State Machine (Aggregate Root 별 1개)
2. Sequence Diagram (핵심 UC 별 1개)
3. Decision Table (BR 별 1개)
4. Invariants (Aggregate Root 별 1개 — TypeScript)
5. Property Test (Invariants 와 짝)
```

각 산출물은 **이중 렌더링 의무** (ADR-008): AI 눈 + 사람 눈.

---

## 1. State Machine

### 위치

- AI 눈: `output/formal-spec/state-machines/<AggregateRoot>.json`
- 사람 눈: `output/formal-spec/state-machines/<AggregateRoot>.mermaid`

### 작성 가이드

- Aggregate Root 1개 = State Machine 1개
- domain.json 의 lifecycle_states 참조
- 전이 (transition) 마다 이벤트 + 가드 명시
- 거부/실패 상태도 별도 명시 (Reject*\*, Failed*\*)
- 참조 template: `state-machine.template.mermaid`

---

## 2. Sequence Diagram

### 위치

- AI 눈: `output/formal-spec/sequence-diagrams/UC-<UseCase>.json`
- 사람 눈: `output/formal-spec/sequence-diagrams/UC-<UseCase>.mermaid`

### 작성 가이드

- 핵심 UC 만 (전부 X) — domain.json `use_cases` 의 priority 참조
- actor: user / controller / service / domain / repository / external
- alt/else 분기 명시 (BR 분기 정합)
- DB 호출 / 외부 API 호출은 별도 lane
- 참조 template: `sequence.template.mermaid`

---

## 3. Decision Table ( 자연어 빈약성 보완 핵심)

### 위치

- AI 눈: `output/formal-spec/decision-tables/BR-<RuleId>.json`
- 사람 눈: `output/formal-spec/decision-tables/BR-<RuleId>.md`

### 9 항목 의무 (자연어 빈약성 100% 보완)

```yaml
trigger: '언제 발생 (HTTP endpoint / event / schedule)'
condition: '입력 조건'
action: '수행 액션'
expected_result: '기대 결과'
rejection_method: ' 거부 방식 — Exception / return false / no-op silent'
verification_location: ' 검증 위치 — Domain / Service / Adapter / DB'
http_status: 400 # API 영역
error_code: 'ERR-USER-001'
error_message: '사용자 노출 메시지'
current_state: 'complete | partial | absent | needs_review'
```

= 자연어 누락 빈번 — 형식화 시 결단 의무.

### 참조 template

`decision-table.template.md`

---

## 4. Invariants (실행 가능 명세)

### 위치

- `output/formal-spec/invariants/<AggregateRoot>.ts` (TypeScript)
- (옵션) Java: `<AggregateRoot>Invariants.java`

### 구조

```typescript
// 1. 타입 정의 (ADT)
export type <AggregateRoot> = {
  // primitive 가 아닌 refined 타입 사용
  // 예: UserId (not string), Email (not string)
}

// 2. 생성자 (input → invariant 만족 확인)
export function create<AggregateRoot>(...): <AggregateRoot> {
  // BR-* 참조 명시
  if (violation) throw new Error('BR-XXX-001 violation')
  return { ... }
}

// 3. 상태 전이 (precondition → postcondition)
export function <transition>(current: <AggregateRoot>, ...): <AggregateRoot> {
  // 전이 조건 검증
}

// 4. invariants namespace
export namespace <AggregateRoot>_Invariants {
  export const <invariantName> = (entity: <AggregateRoot>): boolean => { ... }
}
```

---

## 5. Property Test (실행 가능 검증)

### 위치

- `output/formal-spec/property-tests/<AggregateRoot>.spec.ts` (fast-check)
- (옵션) Java: `<AggregateRoot>PropertyTest.java` (jqwik)

### 구조

```typescript
import * as fc from 'fast-check'
import { create<AggregateRoot>, <AggregateRoot>_Invariants } from '../invariants/<AggregateRoot>'

describe('<AggregateRoot> properties', () => {
  test('BR-XXX-001: invariant always holds', () => {
    fc.assert(fc.property(
      <inputArbitrary>,
      (input) => {
        const entity = create<AggregateRoot>(input)
        return <AggregateRoot>_Invariants.<invariantName>(entity)
      }
    ))
  })

  test('BR-YYY-001: invalid input always rejected', () => {
    fc.assert(fc.property(
      <invalidInputArbitrary>,
      (input) => {
        expect(() => create<AggregateRoot>(input)).toThrow()
      }
    ))
  })
})
```

---

## Cross-validation 의무 (DEC-priority2 H)

5 산출물 작성 후 **반드시** 수행:

| 검증 주체                   | 진짜 도구                                                                     | 시간 cap  |
| --------------------------- | ----------------------------------------------------------------------------- | --------- |
| Senior Engineer (sub-agent) | N/A                                                                           | 12분      |
| Static Analyzer             | 진짜 도구 의무 (Semgrep / PMD / SpotBugs / Daikon / CodeQL) — DEC-static-tool | 환경 의존 |

**시뮬레이션 사용 시**:

- ❌ AI persona 시뮬레이션 절대 금지
- ✅ 사용자 위임 또는 환경 준비 요청
- ✅ 사용 시 신뢰도 -5%p 패널티 + "진짜 도구 미실행" 명시

**양쪽 발견 (double_hit)**:

- 정식 finding 격상 ()
- finding-system.schema.json `cross_validation.double_hit: true`

---

## 흔한 함정

### Self-reference 함정 (Sprint 1)

- 코드 → 형식 → 코드 재생성 = 자명한 100%
- → 코드 부재 BR 선택 (단방향 round-trip — F-074 패턴)

### 자연어 빈약성 자기-시인 누락

- rules.json 자연어로 충분하다고 착각
- → Decision Table 9 항목 점검 (자연어 표현 < 5 개 시 형식화 필수)

### 이중 렌더링 갭

- .mermaid 만 / .json 만
- → ADR-008 강제 — 양쪽 의무. drift 검증.
