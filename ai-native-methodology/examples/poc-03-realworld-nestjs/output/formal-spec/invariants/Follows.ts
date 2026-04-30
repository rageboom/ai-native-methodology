/**
 * Follows Aggregate (약한) — Refinement Type + Invariant (Phase 4.5)
 *
 * 일자: 2026-04-30
 * Source of Truth: 코드 (src/profile/profile.service.ts + follows.entity.ts)
 * Direction: B (코드 → L2)
 *
 * ★ Senior 권고 — 약한 Aggregate (id 기반 lookup 만) + Sairyss-style 권고
 * ★★ F-144 — Domain invariant 부재로 self-check 차원 불일치 (follow=email / unFollow=id)
 */

type UserId = number & { readonly __brand: 'UserId' };
type FollowsId = number & { readonly __brand: 'FollowsId' };

// ============================================================================
// Distinct User Pair (★ NEW — F-144 + F-147 fix)
// ============================================================================

type DistinctUserPair = readonly [follower: UserId, following: UserId] & {
  readonly __refinement: { readonly distinct: true };  // follower !== following
};

// ============================================================================
// Aggregate (약한)
// ============================================================================

interface FollowsEntity {
  readonly id: FollowsId;
  readonly followerId: UserId;
  readonly followingId: UserId;
  // ★ FK 부재 (F-121) — UserEntity 직접 참조 ❌
}

// ============================================================================
// Invariants
// ============================================================================

namespace FollowsInvariants {
  /**
   * INV-FOLLOWS-NO-SELF (★ F-144 + F-147)
   * - rules.json BR-FOLLOWS-NO-SELF-001
   * - ★ id 통일 (현재 = follow=email / unFollow=id 차원 불일치)
   */
  export const noSelfFollow = (follow: FollowsEntity): boolean =>
    follow.followerId !== follow.followingId;

  /**
   * INV-FOLLOWS-PAIR-UNIQUE (★ F-121)
   * - rules.json BR-FOLLOWS-PAIR-UNIQUE-001
   * - ★ DB UQ pair 부재 → App 1중만 보장
   */
  export const pairUnique = (follows: FollowsEntity[]): boolean =>
    follows.every((f1, i) =>
      follows.slice(i + 1).every(f2 =>
        !(f1.followerId === f2.followerId && f1.followingId === f2.followingId)
      )
    );

  /**
   * INV-FOLLOWS-FK-VALID (★ F-121)
   * - DB FK 부재 → followerId / followingId 가 user.id 참조 보장 ❌
   * - 본 invariant 는 (사용자 환경) DB CHECK 또는 catch 로 보강 의무
   */
  export const fkValid = (follow: FollowsEntity, validUserIds: Set<UserId>): boolean =>
    validUserIds.has(follow.followerId) && validUserIds.has(follow.followingId);
}

// ============================================================================
// ★ D4 권고 — Sairyss-style Smart Constructor (Domain invariant 강제)
// ============================================================================

/**
 * 권장 패턴 (Sairyss DDD-Hexagon 정합):
 *
 * class FollowsEntity {
 *   private constructor(private props: FollowsProps) {}
 *
 *   static create(followerId: UserId, followingId: UserId): FollowsEntity {
 *     // ★ NEW — F-144 + F-147 fix
 *     if (followerId === followingId) {
 *       throw new InvalidFollowsError('follower and following must be different');
 *     }
 *     return new FollowsEntity({ followerId, followingId });
 *   }
 * }
 *
 * → 현재 PoC #03 = Service 단 if 분기 (Domain invariant ❌)
 * → Hibernate byte buddy 우회 또는 SQL 직접 INSERT 시 self-follow row 잠입 가능
 * → DB CHECK 제약 (chk_follows_no_self) 보강 권고
 */

// ============================================================================
// Pre-condition / Post-condition (UC-PROFILE-FOLLOW)
// ============================================================================

namespace UC_PROFILE_FOLLOW {
  type Input = { followerId: UserId; followingId: UserId };
  type Output = FollowsEntity | { error: 'HttpException'; status: number; message: string };

  export const precondition = (input: Input): boolean =>
    input.followerId != null && input.followingId != null;

  export const postcondition = (
    input: Input,
    output: Output,
    followsBefore: FollowsEntity[],
    followsAfter: FollowsEntity[]
  ): boolean => {
    if ('error' in output) {
      return followsBefore.length === followsAfter.length;
    }
    // 신규 / 이미 존재 (idempotent) 모두 INV 만족
    return (
      followsAfter.length >= followsBefore.length &&
      FollowsInvariants.noSelfFollow(output) &&
      FollowsInvariants.pairUnique(followsAfter)
    );
  };
}

/*
 * 발견된 갭:
 *
 * F-144 (재확인) — self-check 차원 불일치
 *   현재: follow=email 비교 / unFollow=id 비교
 *   권고: id 통일 + Domain invariant
 *
 * F-147 (신규) — Domain invariant (FollowsEntity 생성자) 부재
 *   현재: Service 만 검증 (Sairyss DDD-Hexagon 위반)
 *   권고: static create() + throw
 *
 * F-121 (재확인) — FK 부재 + UQ pair 부재
 *   현재: race window 시 중복 row 잠입
 *   권고: ALTER TABLE follows ADD FK + UQ pair + CHECK no_self
 *
 * F-138 (재확인) — FollowsEntity 위치 모호 (profile/ vs user/)
 */

export { FollowsEntity, UserId, FollowsId, DistinctUserPair, FollowsInvariants, UC_PROFILE_FOLLOW };
