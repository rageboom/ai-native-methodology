# BR-FOLLOWS-NO-SELF-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30
> **Source of Truth**: 코드 (profile.service.ts) + 자연어 (rules.json)
> **PoC #02 cross-validation**: ★★ BR-USER-FOLLOW-NO-SELF-001 외부 검증 — PoC #02 = 코드 부재 / PoC #03 = 코드 존재 + 차원 불일치 (F-144)

---

## 1. 정책 문장 (자연어 — L0)

> rules.json BR-FOLLOWS-NO-SELF-001
> - condition: "follower == following"
> - action: "throw HttpException 'FollowerEmail and FollowingId cannot be equal'"
> - expected_result: "400 Bad Request"
> - current_state: "★ partial (follow = email 비교 / unFollow = id 비교 — 일관성 결여 F-144)"

**자연어 4 / 9 = 44%** (PoC #02 동일 비율).

---

## 2. L1 결정표 (현재 코드)

### 2-A. follow 분기

| follower null | username null | follower.email == following.email | 이미 _follows | 결과 | HTTP | 비고 |
|:---:|:---:|:---:|:---:|---|---|---|
| ❌ | * | * | * | "follower or username not provided" | 400 | NULL guard |
| ✅ | ❌ | * | * | "follower or username not provided" | 400 | NULL guard |
| ✅ | ✅ | **✅ (★ email 비교)** | * | "FollowerEmail and FollowingId cannot be equal" | 400 | ★ self-check email |
| ✅ | ✅ | ❌ | ✅ | silent skip | 200 | idempotent |
| ✅ | ✅ | ❌ | ❌ | save (★ FK + UQ pair 부재 = race window) | 200 | F-121 |

### 2-B. unFollow 분기 (★★ F-144 일관성 결여)

| follower null | username null | follower.id == following.id | _follows 존재 | 결과 | HTTP | 비고 |
|:---:|:---:|:---:|:---:|---|---|---|
| ❌ | * | * | * | "follower or username not provided" | 400 | NULL guard |
| ✅ | ❌ | * | * | "follower or username not provided" | 400 | NULL guard |
| ✅ | ✅ | **✅ (★ id 비교)** | * | "FollowerId and FollowingId cannot be equal" | 400 | ★★ F-144 — id 비교 / email 비교 ❌ |
| ✅ | ✅ | ❌ | ❌ | silent NoOp (deleteIndex < 0) | 200 | idempotent |
| ✅ | ✅ | ❌ | ✅ | DELETE | 200 | 정상 unfollow |

---

## 3. ★★ F-144 차원 불일치 분석

| 분기 | self-check 비교 | 메시지 |
|---|---|---|
| follow | follower.email === following.email (string) | "FollowerEmail and FollowingId cannot be equal" |
| unFollow | followerId === followingId (number) | "FollowerId and FollowingId cannot be equal" |

→ **차원 불일치** (string vs number). Domain invariant 부재로 일관성 결여.

---

## 4. L2 Refinement Type (★ Domain invariant 신규)

```typescript
type DistinctUserPair = readonly [follower: UserId, following: UserId] & {
  __refinement: { distinct: true };  // follower !== following
};

namespace FollowsInvariants {
  // INV — 모든 FollowsEntity 가 follower !== following (id 통일)
  export const noSelfFollow = (follow: FollowsEntity): boolean =>
    follow.followerId !== follow.followingId;

  // INV — 모든 (follower, following) pair UQ
  export const pairUnique = (follows: FollowsEntity[]): boolean =>
    follows.every((f1, i) =>
      follows.slice(i + 1).every(f2 =>
        !(f1.followerId === f2.followerId && f1.followingId === f2.followingId)
      )
    );
}
```

---

## 5. 코드 생성안 (Direction D — 권고)

### 5-A. FollowsEntity 생성자 (★ NEW Domain invariant)

```typescript
@Entity('follows')
export class FollowsEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column() followerId: number;
  @Column() followingId: number;

  constructor(followerId: number, followingId: number) {
    if (followerId == null) throw new Error('followerId is required');
    if (followingId == null) throw new Error('followingId is required');
    // ★ NEW (F-144 fix + F-147 신규)
    if (followerId === followingId) {
      throw new Error('follower and following must be different');
    }
    this.followerId = followerId;
    this.followingId = followingId;
  }
}
```

### 5-B. ProfileService.follow 보강 — id 통일

```typescript
async follow(followerEmail: string, username: string) {
  if (!followerEmail || !username) {
    throw new HttpException('follower or username not provided', 400);
  }
  const follower  = await this.userRepository.findOne({ where: { email: followerEmail } });
  const following = await this.userRepository.findOne({ where: { username } });
  // ★ id 통일 (email 비교 ❌)
  if (follower.id === following.id) {
    throw new HttpException('follower and following must be different', 400);
  }
  // ... persist
}
```

### 5-C. (★★ 권고) DB CHECK 제약 (3중 안전망 — PoC #02 Sprint 2 cross-val 동일)

```sql
ALTER TABLE follows
    ADD CONSTRAINT chk_follows_no_self
    CHECK (follower_id <> following_id);
```

---

## 6. 발견된 신규 finding

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-144 | self-check 차원 불일치 — follow=email / unFollow=id | high | §3 |
| F-147 | Domain invariant (FollowsEntity 생성자) 부재 — Sairyss DDD-Hexagon 위반 | high (★★ double_hit 후보 — Senior + drift) | §4 + §5-A |
| F-121 (related) | FK 부재 + UQ pair 부재 | critical | §2-A row 5 |

---

## 7. PoC #02 cross-validation 결과 (★★ 외부 검증)

| 항목 | PoC #02 BR-USER-FOLLOW-NO-SELF-001 | PoC #03 BR-FOLLOWS-NO-SELF-001 |
|---|---|---|
| 코드 존재 | ❌ (자연어만) | ✅ (Service 단) |
| 검증 위치 | (제안 — Domain + DB CHECK) | ★ Service 만 (Domain ❌, DB CHECK ❌) |
| 차원 일관성 | (제안 — id 통일) | ★ F-144 — follow=email / unFollow=id |
| HTTP status | 400 (관행) | 400 (동일) |
| 에러 메시지 | "follower and following must be different" | ★ "FollowerEmail/FollowerId..." 분리 (혼란) |
| 권고 | Domain invariant + DB CHECK | **동일** (Sprint 2 외부 재현 검증 ★ 양쪽 발견) |

→ **★★ double_hit (양쪽 발견) — PoC #02 + PoC #03 모두 self-check Domain invariant 부재 + DB CHECK 권장**.
