/**
 * Property-Based Test — ProfileService follow/unFollow (Phase 4.5)
 *
 * 일자: 2026-04-30
 * 검증 대상:
 * - state-machine: Follows.mermaid
 * - sequence: UC-PROFILE-FOLLOW
 * - decision-table: BR-FOLLOWS-NO-SELF-001 / BR-FOLLOWS-PAIR-UNIQUE-001
 * - invariants: Follows.ts
 *
 *  F-144 — self-check 차원 불일치 (follow=email / unFollow=id) 명세
 *  F-147 — Domain invariant (FollowsEntity 생성자) 부재 명세
 */

import fc from 'fast-check';
import { describe, test, expect } from 'vitest';

interface MockUser { id: number; email: string; username: string }
interface MockFollows { id: number; followerId: number; followingId: number }

class HttpException extends Error {
  constructor(message: string, public status: number) { super(message); }
}

class MockProfileService {
  private follows: MockFollows[] = [];
  private idSeq = 1;
  constructor(private users: MockUser[]) { }

  //  follow = email 비교 (현재 코드 실태)
  async follow(followerEmail: string, username: string): Promise<void> {
    if (!followerEmail || !username) throw new HttpException('not provided', 400);
    const follower = this.users.find(u => u.email === followerEmail);
    const following = this.users.find(u => u.username === username);
    if (!follower || !following) throw new HttpException('user not found', 400);

    //  F-144 — email 비교
    if (follower.email === following.email) {
      throw new HttpException('FollowerEmail and FollowingId cannot be equal', 400);
    }

    //  App 1중 idempotent (DB UQ pair 부재)
    const existing = this.follows.find(
      f => f.followerId === follower.id && f.followingId === following.id
    );
    if (!existing) {
      this.follows.push({ id: this.idSeq++, followerId: follower.id, followingId: following.id });
    }
  }

  //  unFollow = id 비교 ( F-144 차원 불일치)
  async unFollow(followerId: number, followingId: number): Promise<void> {
    if (followerId == null || followingId == null) throw new HttpException('not provided', 400);

    //  F-144 — id 비교 (follow 와 차원 불일치)
    if (followerId === followingId) {
      throw new HttpException('FollowerId and FollowingId cannot be equal', 400);
    }

    const idx = this.follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
    if (idx >= 0) this.follows.splice(idx, 1);
    // silent NoOp
  }

  getFollows(): MockFollows[] { return [...this.follows]; }
}

describe('ProfileService Properties — PoC #03 Phase 4.5', () => {

  // ----------------------------------------------------------------------
  // INV-FOLLOWS-NO-SELF
  // ----------------------------------------------------------------------
  test('INV-NO-SELF: follow self (email 비교) 차단', async () => {
    const users: MockUser[] = [{ id: 1, email: 'a@x.com', username: 'alice' }];
    const svc = new MockProfileService(users);
    await expect(svc.follow('a@x.com', 'alice')).rejects.toThrow();
    expect(svc.getFollows()).toHaveLength(0);
  });

  test('INV-NO-SELF: unFollow self (id 비교) 차단', async () => {
    const svc = new MockProfileService([]);
    await expect(svc.unFollow(1, 1)).rejects.toThrow();
  });

  // ----------------------------------------------------------------------
  //  F-144 차원 불일치 명세 (follow=email / unFollow=id)
  // ----------------------------------------------------------------------
  test(' F-144 차원 불일치: follow 검증 = email / unFollow 검증 = id', async () => {
    const users: MockUser[] = [
      { id: 1, email: 'a@x.com', username: 'alice' },
      { id: 2, email: 'b@x.com', username: 'bob' },
    ];
    const svc = new MockProfileService(users);
    // follow OK (다른 email)
    await svc.follow('a@x.com', 'bob');
    expect(svc.getFollows()).toHaveLength(1);
    // unFollow OK (다른 id)
    await svc.unFollow(1, 2);
    expect(svc.getFollows()).toHaveLength(0);
  });

  // ----------------------------------------------------------------------
  // INV-FOLLOWS-PAIR-UNIQUE (App 1중 idempotent)
  // ----------------------------------------------------------------------
  test('INV-PAIR-UNIQUE: 같은 pair 두 번 follow → 1건만', async () => {
    const users: MockUser[] = [
      { id: 1, email: 'a@x.com', username: 'alice' },
      { id: 2, email: 'b@x.com', username: 'bob' },
    ];
    const svc = new MockProfileService(users);
    await svc.follow('a@x.com', 'bob');
    await svc.follow('a@x.com', 'bob');
    expect(svc.getFollows()).toHaveLength(1);
  });

  // ----------------------------------------------------------------------
  // INV property — 모든 follows 가 follower != following
  // ----------------------------------------------------------------------
  test('Property: 모든 persisted follows 가 follower != following', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.tuple(fc.integer({ min: 1, max: 10 }), fc.integer({ min: 1, max: 10 })),
          { minLength: 1, maxLength: 30 }
        ),
        async (pairs) => {
          const users: MockUser[] = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            email: `user${i + 1}@x.com`,
            username: `user${i + 1}`,
          }));
          const svc = new MockProfileService(users);
          for (const [a, b] of pairs) {
            try {
              await svc.follow(`user${a}@x.com`, `user${b}`);
            } catch { /* OK */ }
          }
          return svc.getFollows().every(f => f.followerId !== f.followingId);
        }
      )
    );
  });
});
