// PoC #02 — UserFollow Aggregate Refinement Type + Invariant (Phase 4.5 Sprint 2)
// 일자: 2026-04-29
// Source of Truth: 자연어 명세 (rules.json BR-USER-FOLLOW-*) — Direction A 단방향 ★
// ★ F-074 단방향 round-trip 검증 케이스
// 관련 BR: BR-USER-FOLLOW-NO-SELF-001 / BR-USER-FOLLOW-DIRECTIONAL-001 / BR-USER-FOLLOW-IDEMPOTENT-001
// 표기 도구: TypeScript-like (사람·AI 양쪽 친화)

import type { UserId } from './User';

// ============================================================================
// Refinement Type 정의 (L2)
// ============================================================================

/**
 * DistinctUserPair — follower ≠ following 보장 (★ F-074)
 * 자연어 BR-USER-FOLLOW-NO-SELF-001 형식화 결과
 */
type DistinctUserPair = readonly [follower: UserId, following: UserId] & {
  readonly __brand: 'DistinctUserPair';
  readonly __refinement: {
    readonly distinct: true;  // follower !== following
  };
};

type FollowId = number & { readonly __brand: 'FollowId'; readonly __format: 'INTEGER_IDENTITY' };

// ============================================================================
// Aggregate
// ============================================================================

interface UserFollow {
  readonly id: FollowId;             // GeneratedValue IDENTITY (Integer)
  readonly follower: { id: UserId };  // ManyToOne
  readonly following: { id: UserId }; // ManyToOne
  readonly createdAt: Date;           // Immutable (final + updatable=false)
}

// ============================================================================
// Invariant (전역 불변 — 모든 시점 보장)
// ============================================================================

namespace UserFollowInvariants {
  /**
   * INV-USER-FOLLOW-NO-SELF (★ F-074 — Sprint 2 신규)
   * - 자연어: BR-USER-FOLLOW-NO-SELF-001
   * - 검증 위치 결단: Domain (UserFollow 생성자) — §decision-table §2
   * - 거부 방식 결단: IllegalArgumentException
   */
  export const noSelfFollow = (follow: UserFollow): boolean =>
    follow.follower.id !== follow.following.id;

  /**
   * INV-USER-FOLLOW-DIRECTIONAL (BR-USER-FOLLOW-DIRECTIONAL-001)
   * - schema.sql: UQ(follower_id, following_id)
   * - "단방향" = (A→B) 가 (B→A) 와 별개 관계
   */
  export const directionalUnique = (follows: UserFollow[]): boolean =>
    follows.every((f1, i) =>
      follows.slice(i + 1).every(f2 =>
        !(f1.follower.id === f2.follower.id && f1.following.id === f2.following.id)
      )
    );

  /**
   * INV-USER-FOLLOW-IDEMPOTENT (BR-USER-FOLLOW-IDEMPOTENT-001)
   * - 이미 follow 상태에서 재호출 → silent return (변화 없음)
   * - 자연어: rfc_compliance "RFC 7231 §4.2.2 idempotent ✅"
   */
  export const idempotentFollow = (
    before: UserFollow[],
    after: UserFollow[],
    requested: { follower: UserId; following: UserId }
  ): boolean => {
    const wasFollowing = before.some(f =>
      f.follower.id === requested.follower && f.following.id === requested.following
    );
    if (wasFollowing) {
      return after.length === before.length;  // 변화 없음
    }
    return after.length === before.length + 1;  // 1건 추가
  };

  /**
   * INV-USER-FOLLOW-CREATED-IMMUTABLE
   * - UserFollow.java line 40: final + updatable=false
   */
  export const createdAtImmutable = (oldFollow: UserFollow, newFollow: UserFollow): boolean =>
    oldFollow.createdAt.getTime() === newFollow.createdAt.getTime();
}

// ============================================================================
// Pre-condition / Post-condition (L3 — Hoare triple)
// ============================================================================

namespace UC_USER_FOLLOW {
  type Input = { follower: UserId; following: UserId };
  type Output =
    | { kind: 'persisted'; follow: UserFollow }
    | { kind: 'no_op_idempotent' }
    | { kind: 'rejected'; reason: 'self_follow' | 'null_user' };

  export const precondition = (input: Input): boolean =>
    input.follower != null && input.following != null;

  export const postcondition = (
    input: Input,
    output: Output,
    followsBefore: UserFollow[],
    followsAfter: UserFollow[]
  ): boolean => {
    switch (output.kind) {
      case 'rejected':
        // 거절 시 follows 불변
        return followsAfter.length === followsBefore.length;

      case 'no_op_idempotent':
        // idempotent: 이미 follow 상태 + 변화 없음
        return (
          followsAfter.length === followsBefore.length &&
          followsBefore.some(f =>
            f.follower.id === input.follower && f.following.id === input.following
          )
        );

      case 'persisted':
        // 성공: 1건 추가 + 모든 invariant 보장
        return (
          followsAfter.length === followsBefore.length + 1 &&
          UserFollowInvariants.noSelfFollow(output.follow) &&             // ★ F-074
          UserFollowInvariants.directionalUnique(followsAfter) &&
          output.follow.follower.id === input.follower &&
          output.follow.following.id === input.following
        );
    }
  };
}

namespace UC_USER_UNFOLLOW {
  type Input = { follower: UserId; following: UserId };
  type Output =
    | { kind: 'deleted' }
    | { kind: 'no_op_not_following' };

  export const postcondition = (
    input: Input,
    output: Output,
    followsBefore: UserFollow[],
    followsAfter: UserFollow[]
  ): boolean => {
    switch (output.kind) {
      case 'deleted':
        // 1건 삭제 + 해당 관계 부재
        return (
          followsAfter.length === followsBefore.length - 1 &&
          !followsAfter.some(f =>
            f.follower.id === input.follower && f.following.id === input.following
          )
        );

      case 'no_op_not_following':
        // 변화 없음 + 처음부터 부재
        return (
          followsAfter.length === followsBefore.length &&
          !followsBefore.some(f =>
            f.follower.id === input.follower && f.following.id === input.following
          )
        );
    }
  };
}

// ============================================================================
// 자연어 → 형식화 결단 trace (★ F-074 단방향 round-trip 핵심)
// ============================================================================

/*
 * 자연어 (rules.json BR-USER-FOLLOW-NO-SELF-001):
 *   given: "follower == following 인 follow 요청"
 *   when:  "follow 호출"
 *   then:  "거부 (RealWorld spec 묵시) — 현재 코드 부재 (F-074)"
 *
 * 자연어 미명시 → 형식화 시점 결단 (5건):
 *   1. 거부 방식      → IllegalArgumentException (PoC #02 isomorphic 패턴)
 *   2. 검증 위치      → Domain (UserFollow 생성자) — Hexagonal 정합
 *   3. HTTP status   → 400 Bad Request
 *   4. 에러 메시지    → "follower and following must be different"
 *   5. unfollow 일관성 → silent (애초에 isFollowing=false)
 *
 * 신규 finding (Sprint 2 후보):
 *   F-088 — UserFollow 생성자 self-follow 검사 부재 (high)
 *   F-089 — DB UQ 가 self-follow 차단 못함 (medium)
 *   F-090 — 자연어 BR 의 미명시 5건 (medium — 자연어 빈약성)
 */
