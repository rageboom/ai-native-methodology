# BR-USER-FOLLOW-IDEMPOTENT-001 — Decision Table (Phase 4.5 Sprint 2)

> **일자**: 2026-04-29
> **Source of Truth**: 코드 + 자연어 명세 통합 (Direction A + B + C)
> **관련**: BR-USER-FOLLOW-DIRECTIONAL-001 / BR-USER-FOLLOW-NO-SELF-001 (F-074)

---

## 1. 정책 문장 (자연어)

> "follower 가 following 을 이미 follow 한 상태일 때 follow 요청이 다시 들어오면 아무 변화 없이 silent return"
> rfc_compliance: "RFC 7231 §4.2.2 idempotent ✅"

→ **자연어가 명시한 것**:
1. 트리거: 이미 follow 한 상태 + 재요청
2. 액션: silent return
3. RFC 정합: §4.2.2 idempotent

→ **자연어가 안 말한 것**:
- ❓ HTTP status code (200 vs 204 vs 201)
- ❓ unfollow 의 idempotent (Sprint 2 §UC-USER-UNFOLLOW 에서 보강)
- ❓ race window (App pre-check `isFollowing` 통과 후 동시 follow 호출 시)

---

## 2. L1 결정표 (follow 시점)

| 이미 isFollowing | 결과 | HTTP | 비고 |
|:---:|---|---|---|
| O | NoOp silent (UserRelationshipService.follow:27 `if (isFollowing) return`) | 200 | RFC 7231 §4.2.2 ✅ |
| X | persist 새 UserFollow | 201 | 신규 follow 관계 |

## 3. L1 결정표 (unfollow 시점)

| 이미 isFollowing | 결과 | HTTP | 비고 |
|:---:|---|---|---|
| O | DELETE | 204 | 정상 unfollow |
| X | NoOp silent (UserRelationshipService.unfollow:36 `if (isFollowing) deleteBy`) | 200 | ★ idempotent — 자연어 미명시 (DIRECTIONAL/IDEMPOTENT 어디에도) |

---

## 4. Race Window 분석

```
Time T0:   Client A → isFollowing(A, B) → false
Time T1:   Client A' (동일 follower) → isFollowing(A, B) → false
Time T2:   Client A → save(new UserFollow(A, B)) → INSERT 성공
Time T3:   Client A' → save(new UserFollow(A, B)) → DataIntegrityViolation (UQ)
```

→ **AP-API-001 isomorphic** (signup race window 패턴 재현):
- App pre-check (line 27 `isFollowing`) 통과 후 동시 호출 시 UQ 위반
- DataIntegrityViolation 미처리 → 500 Error 노출 위험
- 해결: try/catch + DB UQ violation → silent return (idempotent 정합)

---

## 5. L2 Refinement Type

```typescript
// invariants/UserFollow.ts UserFollowInvariants.idempotentFollow 참조

namespace UC_USER_FOLLOW {
  // RFC 7231 §4.2.2 idempotent property
  // f(f(x)) = f(x) — 동일 요청 N번 = 동일 상태
  
  export const isIdempotent = (
    initial: UserFollow[],
    afterFirst: UserFollow[],
    afterSecond: UserFollow[]
  ): boolean =>
    afterFirst.length === afterSecond.length &&
    JSON.stringify(afterFirst) === JSON.stringify(afterSecond);
}
```

---

## 6. Direction A vs B 비교 결과

| 항목 | A (자연어) | B (코드) | drift |
|---|---|---|---|
| follow idempotent | ✅ 명시 | ✅ line 27 | - |
| unfollow idempotent | ❌ 미명시 | ✅ line 36 | ★ 자연어 빈약성 |
| HTTP status | ❌ 미명시 | ⚠️ Controller 미확인 | ★ 자연어 + 검증 필요 |
| Race window | ❌ 미명시 | ⚠️ DataIntegrityViolation 미처리 (signup F-058 isomorphic) | ★ critical 빈틈 |

---

## 7. 신규 finding (Sprint 2)

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-095 | follow App pre-check race window — DataIntegrityViolation 미처리 (signup F-058 isomorphic) | high | §4 |
| F-096 | 자연어 BR-USER-FOLLOW-IDEMPOTENT-001 가 unfollow idempotent / HTTP status / race window 미명시 | medium | §6 |

---

## 8. 도식 참조

- 생애주기: [`../state-machines/User-Following.mermaid`](../state-machines/User-Following.mermaid) (NoOp_Idempotent 분기)
- 타입 제약: [`../invariants/UserFollow.ts`](../invariants/UserFollow.ts) `idempotentFollow`
