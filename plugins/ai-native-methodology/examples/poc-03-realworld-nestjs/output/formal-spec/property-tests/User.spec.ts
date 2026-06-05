/**
 * Property-Based Test — UserService (Phase 4.5)
 *
 * 일자: 2026-04-30
 * 표기 도구: TypeScript + fast-check (executable in Node.js)
 *
 * 검증 대상:
 * - state-machine: User.mermaid (anonymous → authenticated → deleted)
 * - sequence: UC-USER-SIGNUP / UC-USER-LOGIN / UC-USER-DELETE
 * - decision-table: BR-USER-USERNAME-EMAIL-UNIQUE-001 / BR-USER-DELETE-AUTH-001 / BR-USER-JWT-EXPIRY-001 / BR-USER-LOGIN-VERIFY-001
 * - invariants: User.ts (UserInvariants + AuthInvariants)
 *
 * 실행 방법:
 *   npm install --save-dev fast-check vitest
 *   npx vitest run User.spec.ts
 *
 *  본 테스트는 Mock 기반 — 실제 NestJS Service 와 결합 테스트는 Sprint 5+ carry-over
 */

import fc from 'fast-check';
import { describe, test, expect } from 'vitest';

// ============================================================================
// Mock 시뮬레이션 (실제 동작 모방)
// ============================================================================

interface MockUser {
  id: number;
  username: string;
  email: string;
  password: string;  // argon2 hash prefix
  bio: string;
  image: string;
}

class HttpException extends Error {
  constructor(message: string, public status: number) { super(message); }
}
class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') { super(message, 401); }
}

class MockUserService {
  private users: Map<number, MockUser> = new Map();
  private idSeq = 1;

  async create(dto: { username: string; email: string; password: string }): Promise<MockUser> {
    if (!dto.username || !dto.username.trim()) throw new HttpException('username required', 400);
    if (!dto.email || !dto.email.trim()) throw new HttpException('email required', 400);
    if (!dto.password || !dto.password.trim()) throw new HttpException('password required', 400);

    //  App 1중 race-prone (PoC #03 코드 충실 — DB UQ ❌)
    for (const u of this.users.values()) {
      if (u.username === dto.username || u.email === dto.email) {
        throw new HttpException('Username and email must be unique.', 400);
      }
    }

    const user: MockUser = {
      id: this.idSeq++,
      username: dto.username,
      email: dto.email,
      password: '$argon2id$v=19$' + dto.password.length,  // mocked
      bio: '',
      image: '',
    };
    this.users.set(user.id, user);
    return user;
  }

  async findOne({ email, password }: { email: string; password?: string }): Promise<MockUser | null> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) return null;
    if (password) {
      // mocked argon2.verify
      const expected = '$argon2id$v=19$' + password.length;
      if (user.password !== expected) {
        throw new HttpException('User not found', 401);  //  F-150 모호
      }
    }
    return user;
  }

  //  F-140 critical — AuthMiddleware 미적용 → anyone 가능
  async delete({ email }: { email: string }): Promise<void> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (user) this.users.delete(user.id);
    //  silent — affected:0 도 OK
  }

  generateJWT(user: MockUser, expDays: number = 60): { exp: number; iat: number; email: string } {
    const iat = Math.floor(Date.now() / 1000);
    return { email: user.email, iat, exp: iat + expDays * 86400 };
  }

  getUsers(): MockUser[] { return Array.from(this.users.values()); }
}

// ============================================================================
// Property Tests
// ============================================================================

describe('UserService Properties — PoC #03 Phase 4.5', () => {

  // ----------------------------------------------------------------------
  // INV-USER-USERNAME-UNIQUE / INV-USER-EMAIL-UNIQUE
  // ----------------------------------------------------------------------
  test('INV-UNIQUE: username + email 중복 시 정확히 1건만 성공', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          username: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 30 }),
        }), { minLength: 2, maxLength: 30 }),
        async (signups) => {
          const svc = new MockUserService();
          for (const dto of signups) {
            try { await svc.create(dto); } catch (e) { /* OK */ }
          }
          const users = svc.getUsers();
          const usernames = new Set(users.map(u => u.username));
          const emails = new Set(users.map(u => u.email));
          return usernames.size === users.length && emails.size === users.length;
        }
      )
    );
  });

  // ----------------------------------------------------------------------
  // INV-USER-PASSWORD-HASHED
  // ----------------------------------------------------------------------
  test('INV-PASSWORD-HASHED: 모든 user.password 가 argon2 prefix', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          username: fc.uuid(),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
        }), { minLength: 1, maxLength: 10 }),
        async (signups) => {
          const svc = new MockUserService();
          for (const dto of signups) { try { await svc.create(dto); } catch { } }
          return svc.getUsers().every(u => u.password.startsWith('$argon2id$'));
        }
      )
    );
  });

  // ----------------------------------------------------------------------
  // FSM Transition — anonymous → registered → authenticated
  // ----------------------------------------------------------------------
  test('FSM: signup → login 흐름 정상', async () => {
    const svc = new MockUserService();
    const user = await svc.create({ username: 'alice', email: 'a@x.com', password: 'pw12345678' });
    expect(user.id).toBeTruthy();

    const found = await svc.findOne({ email: 'a@x.com', password: 'pw12345678' });
    expect(found?.email).toBe('a@x.com');

    const jwt = svc.generateJWT(user);
    expect(jwt.email).toBe('a@x.com');
  });

  // ----------------------------------------------------------------------
  //  F-119 — JWT 60일 expiry
  // ----------------------------------------------------------------------
  test(' F-119: JWT expiry = 60일 ( 권고 7일 위반 — 현재 코드 충실)', () => {
    const svc = new MockUserService();
    const user: MockUser = { id: 1, username: 'a', email: 'a@x.com', password: '$argon2id$', bio: '', image: '' };
    const jwt = svc.generateJWT(user);
    const days = (jwt.exp - jwt.iat) / 86400;
    expect(days).toBe(60);  //  현재 코드 실태 명세
    // 권고: expect(days).toBeLessThanOrEqual(7);
  });

  // ----------------------------------------------------------------------
  //  F-140 critical — DELETE Auth bypass
  // ----------------------------------------------------------------------
  test(' F-140 critical: anyone DELETE → 성공 (Auth 부재)', async () => {
    const svc = new MockUserService();
    await svc.create({ username: 'victim', email: 'v@x.com', password: 'pw12345678' });

    //  AuthMiddleware 미적용 — anyone 가 삭제 가능
    await svc.delete({ email: 'v@x.com' });

    expect(svc.getUsers()).toHaveLength(0);  //  삭제 성공 = critical 결함 명세
    // 권고: expect(...).rejects.toThrow(UnauthorizedException);
  });

  // ----------------------------------------------------------------------
  //  F-150 — login 메시지 모호 (user 부재 / password mismatch 동일)
  // ----------------------------------------------------------------------
  test(' F-150: user 부재 / password mismatch 동일 메시지 "User not found"', async () => {
    const svc = new MockUserService();
    await svc.create({ username: 'bob', email: 'b@x.com', password: 'correct' });

    // user 부재
    const notFound = await svc.findOne({ email: 'nobody@x.com' });
    expect(notFound).toBeNull();

    // password mismatch
    await expect(svc.findOne({ email: 'b@x.com', password: 'wrong' }))
      .rejects.toThrow('User not found');  //  권고: 'Invalid credentials'
  });

  // ----------------------------------------------------------------------
  //  F-120 critical — App 1중 race-prone (DB UQ 부재)
  // ----------------------------------------------------------------------
  test(' F-120 critical: 동시 signup race window 시 양쪽 row INSERT 가능 (현재 코드 실태)', async () => {
    const svc = new MockUserService();
    //  본 Mock 은 단일 thread 시뮬 — 실제 race window 는 DB 환경 의무
    // Sprint 5 carry-over: 진짜 MySQL + concurrency test
    await svc.create({ username: 'a', email: 'a@x.com', password: 'pw1' });
    await expect(svc.create({ username: 'a', email: 'b@x.com', password: 'pw2' }))
      .rejects.toThrow('Username and email must be unique.');
    // 실 환경 race window: 두 INSERT 모두 성공 가능 (DB UQ 부재 → 정합성 손실)
  });
});
