# BR-USER-FOLLOW-NO-SELF-001 — Decision Table (Phase 4.5 Sprint 2)

> **일자**: 2026-04-29
> **Source of Truth**: **자연어 명세 단독** (rules.json) — Direction A 단방향 ★
> **★ F-074 단방향 round-trip 검증 케이스** — Sprint 1 self-reference 함정 회피
> **관련 BR**: BR-USER-FOLLOW-IDEMPOTENT-001 / BR-USER-FOLLOW-DIRECTIONAL-001

---

## 1. 정책 문장 (자연어 — L0 / 출발점)

> **rules.json BR-USER-FOLLOW-NO-SELF-001**
> - given: "follower == following 인 follow 요청"
> - when: "follow 호출"
> - then: "거부 (RealWorld spec 묵시) — **현재 코드 부재 (F-074 anti-pattern)**"
> - anti_pattern_ref: F-074

**자연어가 명시한 것 (4가지)**:
1. 트리거 조건: `follower == following`
2. 액션: `follow` 호출
3. 기대 결과: 거부
4. 현재 상태: 코드 부재 (구현 안 됨)

**자연어가 안 말한 것 (5가지 — 형식화 시 결단 필요)**:
1. ❓ 거부 방식 — Exception vs return false vs no-op silent
2. ❓ 검증 위치 — Service / Domain (UserFollow 생성자) / DB CHECK / Repository
3. ❓ HTTP status — 400 vs 422
4. ❓ 에러 메시지 — 어떤 텍스트?
5. ❓ unfollow 시도 시 — self-follow 가 애초에 가능했어야 하나? (논리 일관성)

→ **자연어 빈약성 정량 입증**: 명세 9 항목 중 자연어는 4 (44%) 만 명시.

---

## 2. 형식화 결단 (자연어 → 형식 시점에 결정)

| ❓ 미명시 항목 | 결단 | 근거 |
|---|---|---|
| 거부 방식 | `IllegalArgumentException` throw | PoC #02 기존 패턴 정합 (User constructor / UserFollow 생성자 isomorphic) |
| 검증 위치 | **Domain (UserFollow 생성자)** + Service 보조 | Domain 검증이 가장 강력 (Hexagonal 정합) — UserFollow 가 invalid 상태 자체 불가 |
| HTTP status | **400 Bad Request** | RealWorld API 관행 정합 (PoC #02 기존 IAE → 400 매핑). **★ Sprint 2 cross-validation 정정**: 이전 reasoning "schema 모순" 은 부정확 — JSON 자체는 valid (UserA, UserA 둘 다 존재 가능 schema). RFC 9110 §15.5.21 기준 422 ("well-formed but semantically erroneous") 가 더 적합하나 RealWorld API 관행으로 400 유지 |
| 에러 메시지 | "follower and following must be different" | 영문 (PoC #02 코드베이스 정합) + 명료 |
| unfollow 일관성 | self 의 unfollow 도 silent (애초에 isFollowing=false) | 코드 line 35-39 기존 idempotent 패턴 정합 |

---

## 3. L1 결정표 (follow 시점)

| follower null/unknown | following null/unknown | follower.id == following.id | 이미 isFollowing | 결과 | HTTP | 검증 위치 |
|:---:|:---:|:---:|:---:|---|---|---|
| O | * | * | * | IAE "follower is null or unknown user." | 400 | UserFollow 생성자 (기존) |
| X | O | * | * | IAE "following is null or unknown user." | 400 | UserFollow 생성자 (기존) |
| X | X | **O** | * | **IAE "follower and following must be different"** | **400** | **★ UserFollow 생성자 (NEW)** |
| X | X | X | O | silent return (BR-IDEMPOTENT-001) | 200 | UserRelationshipService.follow line 27 |
| X | X | X | X | persist OK (UQ check) | 201 | DB UQ |

★ = F-074 신규 추가 행 (현재 코드 부재).

---

## 4. L1 결정표 (unfollow 시점 — 일관성 점검)

| follower.id == following.id | isFollowing(A, A) | 결과 | 비고 |
|:---:|:---:|---|---|
| O | X | silent return (애초에 isFollowing=false) | 자연어 unfollow 명세 미적용 |
| O | O | DELETE | ★ 발생 불가 (follow 자체가 차단됨) |
| X | X | silent return | 기존 idempotent 패턴 |
| X | O | DELETE | 정상 unfollow |

→ **F-074 fix 후 self-follow 데이터가 DB 에 존재할 수 없으므로 unfollow self 는 자동으로 NoOp**.

---

## 5. L2 Refinement Type

```typescript
type DistinctUserPair = readonly [follower: UserId, following: UserId] & {
  __refinement: { distinct: true };  // follower !== following
};

namespace UserFollow_Invariants {
  /**
   * INV-USER-FOLLOW-NO-SELF (★ F-074)
   * - 자연어: BR-USER-FOLLOW-NO-SELF-001
   * - 형식: Domain invariant (모든 UserFollow 인스턴스에서 보장)
   */
  export const noSelfFollow = (follow: UserFollow): boolean =>
    follow.follower.id !== follow.following.id;

  /**
   * INV-USER-FOLLOW-DIRECTIONAL (BR-USER-FOLLOW-DIRECTIONAL-001)
   * - DB UQ(follower, following) — 단방향 + idempotent
   */
  export const directionalUnique = (follows: UserFollow[]): boolean =>
    follows.every((f1, i) =>
      follows.slice(i + 1).every(f2 =>
        !(f1.follower.id === f2.follower.id && f1.following.id === f2.following.id)
      )
    );
}
```

---

## 6. 코드 생성안 (Direction D — 자연어 → 형식 → 코드)

### 6-A. UserFollow 생성자 보강 (★ F-074 fix)

```java
public UserFollow(User follower, User following) {
    if (follower == null || follower.getId() == null) {
        throw new IllegalArgumentException("follower is null or unknown user.");
    }
    if (following == null || following.getId() == null) {
        throw new IllegalArgumentException("following is null or unknown user.");
    }
    // ★ NEW (F-074 fix — BR-USER-FOLLOW-NO-SELF-001)
    if (follower.getId().equals(following.getId())) {
        throw new IllegalArgumentException("follower and following must be different");
    }

    this.follower = follower;
    this.following = following;
}
```

### 6-B. UserRelationshipService.follow() — 변경 불필요

```java
public void follow(User follower, User following) {
    if (this.isFollowing(follower, following)) {
        return;  // BR-USER-FOLLOW-IDEMPOTENT-001
    }
    userRelationshipRepository.save(new UserFollow(follower, following));
    // ↑ UserFollow 생성자가 self-follow 차단 → IAE 자동 propagate
}
```

→ **Domain 검증 위치 선택의 효과**: Service 코드는 변경 없이도 BR 자동 보장.

### 6-C. (★ 권고 — Sprint 2 cross-validation 격상) DB CHECK 제약 보강

```sql
ALTER TABLE user_follow
    ADD CONSTRAINT chk_user_follow_no_self
    CHECK (follower_id <> following_id);
```

→ **3중 안전망**: Service (no — race-prone) / **Domain (강제) / DB (race-safe)**.

**격상 근거 (Sprint 2 Senior cross-validation)**:
- Domain 검증의 한계 — Hibernate `@NoArgsConstructor(PROTECTED)` byte buddy 우회 로딩 시 생성자 검증 bypass
- 대량 일괄 import / migration / SQL 직접 INSERT 경로에서 self-follow row 잠입 가능
- DB CHECK = 진짜 마지막 방어선 (Application/Domain 우회 시에도 차단)
- → 본 §6-C 를 "선택" 에서 "**권고**" 로 격상 (Sprint 2 Senior 의견 채택)

---

## 7. Direction A 단방향 검증 결과 (★ Sprint 1 self-reference 함정 회피)

### 검증 흐름

```
rules.json (자연어 4 line, 코드 ❌)
  ↓ [Direction A: 자연어 → 형식화]
state-machine + decision-table + invariants
  ↓ [형식화 시점 결단 5건 — §2 표]
  ↓ [Direction D: 형식 → 코드 생성]
UserFollow 생성자 +4 line (§6-A)
  ↓
원본 비교 ❌ — 원본이 없음 (코드 부재 → self-reference 발생 불가) ✅
```

### Sprint 1 vs Sprint 2 비교

| 항목 | Sprint 1 (BR-EMAIL-UNIQUE) | Sprint 2 F-074 (BR-FOLLOW-NO-SELF) |
|---|---|---|
| 출발점 | 코드 (UserService.java) | **자연어 (rules.json)** |
| Direction | B (코드 → 명세) + D (명세 → 코드) | **A (자연어 → 명세) + D (명세 → 코드)** |
| 자명한 round-trip? | ✅ self-reference 발생 (코드 → 명세 → 코드 = 원본) | ❌ self-reference 회피 (코드가 처음부터 없음) |
| 형식화 가치 입증 | drift 검출 (코드와 명세 격차 정량) | **자연어 빈약성 채우기 (44% → 100%)** |

### 형식화 가치 정량

- **자연어 명시 항목**: 4 / 9 (44%)
- **형식화 시 결단 항목**: 5 (56%) — §2 표
- **자연어 단독으로 코드 생성 시도**: 트리거/액션/기대 외 5 영역 (검증 방식/위치/HTTP/메시지/일관성) 임의 결단 위험
- **형식화 거친 후 코드 생성**: 9 영역 모두 명시 → 코드 결정 100% 추적 가능

→ **★ 형식화의 진짜 가치 = 자연어가 안 말한 부분을 명시적으로 결단하게 강제**.

---

## 8. 발견된 신규 finding (Sprint 2 cross-validation 후보)

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-088 | UserFollow 생성자 self-follow 검사 부재 | high (F-074 격상 후보) | §1 + §6-A |
| F-089 | DB UQ(follower_id, following_id) 가 self-follow 차단 못함 | medium | §3 표 + §6-C |
| F-090 | rules.json BR-USER-FOLLOW-NO-SELF-001 자연어가 검증 위치 / 거부 방식 / HTTP status 미명시 | medium (자연어 빈약성) | §1 미명시 5건 |

---

## 9. 도식 참조

- 생애주기: [`../state-machines/User-Following.mermaid`](../state-machines/User-Following.mermaid)
- 오케스트레이션: [`../sequence-diagrams/UC-USER-FOLLOW.mermaid`](../sequence-diagrams/UC-USER-FOLLOW.mermaid) (Phase 2 작성)
- 타입 제약: [`../invariants/UserFollow.ts`](../invariants/UserFollow.ts)
- 코드 생성: [`../generated-code/UserRelationshipService-with-self-check.java`](../generated-code/UserRelationshipService-with-self-check.java)

---

## 10. 핵심 결론 (F-074 단방향 round-trip)

> **자연어 4 line + 형식화 5 결단 = 코드 4 line 추가 + invariant 1건 + DB CHECK 1건**.
> Sprint 1 self-reference 함정 회피 ✅. 형식화의 진짜 가치 (자연어 빈약성 강제 보완) 정량 입증.
