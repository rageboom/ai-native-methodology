# BR-USER-FOLLOW-DIRECTIONAL-001 — Decision Table (Phase 4.5 Sprint 2)

> **일자**: 2026-04-29
> **Source of Truth**: 코드 + 자연어 명세 통합 (Direction A + B + C)
> **관련**: BR-USER-FOLLOW-IDEMPOTENT-001 / BR-USER-FOLLOW-NO-SELF-001 (F-074)

---

## 1. 정책 문장 (자연어)

> "User A 가 User B 를 follow 했을 때 B 의 follow 상태 조회 시 단방향 — B 는 A 를 follow 하지 않을 수 있음. UQ(follower, following)"

→ **자연어가 안 말한 것**:
- ❓ 양방향 mutual-follow 는 어떻게 표현? (별도 entity? 두 row?)
- ❓ A→B 와 B→A 가 동시 존재 가능?
- ❓ 그래프 cycle 허용 여부 (A→B, B→A — 즉 mutual)
- ❓ self-follow (BR-FOLLOW-NO-SELF 와 결합 — F-074 별도)

---

## 2. L1 결정표

| follower | following | 기존 (A→B) | 결과 | 의미 |
|:---:|:---:|:---:|---|---|
| A | B | ❌ | persist (A→B) | A 가 B 를 follow |
| A | B | ✅ | NoOp (idempotent) | BR-IDEMPOTENT-001 |
| B | A | ❌ | persist (B→A) | ★ A→B 와 별개 — mutual follow 가능 |
| B | A | ✅ | NoOp (idempotent) | - |
| A | A | * | ❌ ★ F-074 fix 후 IAE | BR-FOLLOW-NO-SELF-001 |

→ **단방향 = (A→B) ≠ (B→A) 별개 row**. mutual follow 는 두 row 동시 존재 시.

---

## 3. UQ 분석 (DB constraint)

```sql
-- schema.sql:58 (UserFollow.java:25)
CONSTRAINT uk_user_follow_follower_following UNIQUE (follower_id, following_id)
```

| 시나리오 | UQ 위반? | 결과 |
|---|---|---|
| (A, B) → (A, B) | ✅ | DataIntegrityViolation (App pre-check 가 회피) |
| (A, B) → (B, A) | ❌ | 정상 persist (mutual) |
| (A, B) → (A, A) | ❌ | ★ F-074 — UQ 가 self-follow 차단 못함 (별도 CHECK 필요) |

---

## 4. L2 Refinement Type

```typescript
// invariants/UserFollow.ts UserFollowInvariants.directionalUnique 참조
type FollowEdge = readonly [follower: UserId, following: UserId];

// mutual-follow 표현
type MutualFollow = {
  forward: FollowEdge;  // (A, B)
  reverse: FollowEdge;  // (B, A)
} & { __refinement: { mutual: true } };
```

---

## 5. Direction A vs B 비교 결과

| 항목 | A (자연어) | B (코드) | drift |
|---|---|---|---|
| 단방향 정의 | "B 는 A 를 follow 하지 않을 수 있음" | UQ(follower, following) | ✅ 정합 |
| Mutual follow | ❌ 미명시 | ✅ 두 row 동시 존재 가능 (별개 UQ scope) | ★ 자연어 미명시 |
| graph cycle | ❌ 미명시 | ✅ A→B, B→A, B→C, C→A 등 cycle 허용 | ★ 자연어 미명시 |
| ManyToOne CASCADE | ❌ | ⚠️ schema.sql NO ACTION (PoC #02 AP-DB-001 재현) | ★ 자연어 미명시 |

---

## 6. 신규 finding (Sprint 2)

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-094 | 자연어 BR-USER-FOLLOW-DIRECTIONAL-001 가 mutual-follow 정의 / cycle 허용 미명시 | low | §5 |

---

## 7. 도식 참조

- 생애주기: [`../state-machines/User-Following.mermaid`](../state-machines/User-Following.mermaid) (Sprint 2 Phase 1)
- 타입 제약: [`../invariants/UserFollow.ts`](../invariants/UserFollow.ts) `directionalUnique`
