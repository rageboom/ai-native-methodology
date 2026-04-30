# BR-FOLLOWS-PAIR-UNIQUE-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30
> **Source of Truth**: 코드 (profile.service.ts) + 자연어 (rules.json)
> **PoC #02 cross-validation**: BR-USER-FOLLOW-IDEMPOTENT-001 + BR-USER-FOLLOW-DIRECTIONAL-001 — PoC #02 = DB UQ + App 2중 / PoC #03 = App 1중 only (더 나쁨)

---

## 1. L1 결정표

| _follows 존재 | INSERT 충돌 | 결과 | HTTP | 검증 위치 |
|:---:|:---:|---|---|---|
| ✅ | — | silent skip | 200 | Service if (App 1중) |
| ❌ | ❌ | INSERT OK | 200 | App 통과 |
| ❌ | **✅ race window** | ★★ 양쪽 row INSERT — 중복 잠입 | (정합성 손실) | ★ F-121 — DB UQ pair 부재 |

---

## 2. 코드 생성안 (Direction D)

### 2-A. DB schema 보강

```sql
ALTER TABLE follows
    ADD CONSTRAINT fk_follows_follower  FOREIGN KEY (follower_id)  REFERENCES user(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES user(id) ON DELETE CASCADE,
    ADD CONSTRAINT uq_follows_pair      UNIQUE (follower_id, following_id);
```

### 2-B. ProfileService.follow 단순화

```typescript
async follow(followerEmail: string, username: string) {
  // ... null guard + self-check (BR-FOLLOWS-NO-SELF-001)
  try {
    await this.followsRepository.save(new FollowsEntity(follower.id, following.id));
  } catch (e) {
    if (e instanceof QueryFailedError && (e as any).code === 'ER_DUP_ENTRY') {
      // ★ silent skip (idempotent)
      return;
    }
    throw e;
  }
}
```

→ App pre-check 제거 (race window 차단) + DB UQ pair 단독 (race-safe).

---

## 3. 발견된 신규 finding

| # | finding | 심각도 |
|---|---|---|
| F-121 | FK 부재 (user.id ★) + UQ pair 부재 — race window | critical |
| F-148 | 신규 — DB UQ pair 추가 + App pre-check 제거 권고 | medium |
