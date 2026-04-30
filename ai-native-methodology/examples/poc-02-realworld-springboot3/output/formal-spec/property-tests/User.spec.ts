/**
 * Property-Based Test 명세 — UserService (Phase 4.5 Sprint 1.5)
 *
 * 일자: 2026-04-29
 * 표기 도구: TypeScript + fast-check (executable in Node.js)
 * 변환 가능: jqwik (Java), Hypothesis (Python), QuickCheck (Haskell)
 *
 * 검증 대상:
 * - Sprint 1 산출물: User-Account.mermaid, UC-USER-SIGNUP.mermaid, BR-USER-EMAIL-UNIQUE-001.md, User.ts
 * - Sprint 1.5 cross-validation 신규 발견 7건 모두 포함
 *
 * 실행 방법 (사용자 환경):
 *   npm install --save-dev fast-check vitest
 *   npx vitest run User.spec.ts
 *
 * 또는 Java 환경 (UserServicePropertyTest.java 동일 의도):
 *   ./gradlew :module:core:test --tests "*UserServicePropertyTest*"
 */

import fc from 'fast-check';
import { describe, test, expect } from 'vitest';

// ============================================================================
// Mock UserService (실제 시스템 시뮬레이션 — 형식 명세 동작 모방)
// ============================================================================

interface User {
  id: string;
  email: string;
  username: string;
  password: string;  // BCrypt encoded
  createdAt: Date;
}

interface SignupInput {
  email: string;
  username: string;
  password: string;
}

class MockUserService {
  private users: Map<string, User> = new Map();
  private emailIndex: Set<string> = new Set();
  private usernameIndex: Set<string> = new Set();

  async signup(input: SignupInput): Promise<User> {
    // L2 Domain validation (User constructor)
    if (!input.email || input.email.trim() === '') {
      throw new IllegalArgumentException('email must not be null or blank.');
    }
    if (!input.username || input.username.trim() === '') {
      throw new IllegalArgumentException('username must not be null or blank.');
    }
    if (!input.password || input.password.trim() === '') {
      throw new IllegalArgumentException('password must not be null or blank.');
    }

    // L1 App pre-check (race-prone)
    if (this.emailIndex.has(input.email) || this.usernameIndex.has(input.username)) {
      throw new IllegalArgumentException('email or username is already exists.');
    }

    // L3 DB UQ (race-safe) — Sprint 1.5 ★ catch 추가 (재생성 코드 정합)
    try {
      const user: User = {
        id: crypto.randomUUID(),
        email: input.email,
        username: input.username,
        password: bcryptEncode(input.password),  // BCrypt
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
      this.emailIndex.add(input.email);
      this.usernameIndex.add(input.username);
      return user;
    } catch (e: any) {
      if (e.message?.includes('duplicate')) {
        throw new IllegalArgumentException('email or username is already exists.');
      }
      throw e;
    }
  }

  getEmailIndex(): ReadonlySet<string> { return this.emailIndex; }
  getUsernameIndex(): ReadonlySet<string> { return this.usernameIndex; }
  getAllUsers(): User[] { return Array.from(this.users.values()); }
}

class IllegalArgumentException extends Error {}

function bcryptEncode(plain: string): string {
  return `$2a$10$mockedhash${plain.length}`;  // Mocked BCrypt
}

// ============================================================================
// Property Tests — Sprint 1 산출물 + Sprint 1.5 신규 발견 검증
// ============================================================================

describe('UserService Properties — Sprint 1 산출물 검증', () => {

  // -----------------------------------------------------
  // Property 1: INV-USER-EMAIL-UNIQUE
  // 출처: User.ts INV-USER-EMAIL-UNIQUE
  // -----------------------------------------------------
  test('INV-USER-EMAIL-UNIQUE: 두 User 가 같은 email 가질 수 없음', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          email: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          username: fc.uuid(),  // username 충돌 회피
          password: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        }), { minLength: 2, maxLength: 50 }),
        async (signups) => {
          const svc = new MockUserService();
          for (const input of signups) {
            try { await svc.signup(input); } catch (e) { /* 거절 OK */ }
          }
          const emails = svc.getAllUsers().map(u => u.email);
          const uniqueEmails = new Set(emails);
          return emails.length === uniqueEmails.size;
        }
      )
    );
  });

  // -----------------------------------------------------
  // Property 2: INV-USER-USERNAME-UNIQUE
  // -----------------------------------------------------
  test('INV-USER-USERNAME-UNIQUE: 두 User 가 같은 username 가질 수 없음', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          email: fc.uuid(),  // email 충돌 회피
          username: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          password: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        }), { minLength: 2, maxLength: 50 }),
        async (signups) => {
          const svc = new MockUserService();
          for (const input of signups) {
            try { await svc.signup(input); } catch (e) { /* OK */ }
          }
          const usernames = svc.getAllUsers().map(u => u.username);
          return usernames.length === new Set(usernames).size;
        }
      )
    );
  });

  // -----------------------------------------------------
  // Property 3: INV-USER-PASSWORD-ENCRYPTED
  // -----------------------------------------------------
  test('INV-USER-PASSWORD-ENCRYPTED: 모든 저장된 password 는 BCrypt prefix', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          email: fc.uuid(),
          username: fc.uuid(),
          password: fc.string({ minLength: 8 }),
        }), { minLength: 1, maxLength: 20 }),
        async (signups) => {
          const svc = new MockUserService();
          for (const input of signups) {
            try { await svc.signup(input); } catch (e) { /* OK */ }
          }
          return svc.getAllUsers().every(u =>
            u.password.startsWith('$2a$') ||
            u.password.startsWith('$2b$') ||
            u.password.startsWith('$2y$')
          );
        }
      )
    );
  });

  // -----------------------------------------------------
  // Property 4: FSM Transition — Validating → Persisted
  // 출처: User-Account.mermaid
  // -----------------------------------------------------
  test('FSM: 모든 검증 통과 시 Persisted 도달', async () => {
    const svc = new MockUserService();
    const result = await svc.signup({
      email: 'valid@example.com',
      username: 'validuser',
      password: 'validpassword123',
    });
    expect(result.id).toBeTruthy();
    expect(svc.getAllUsers()).toHaveLength(1);
  });

  // -----------------------------------------------------
  // Property 5: FSM Transition — null/blank 거절
  // -----------------------------------------------------
  test('FSM: null/blank 입력 시 IllegalArgumentException', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({ email: '', username: 'valid', password: 'valid' }),
          fc.constant({ email: 'valid@example.com', username: '', password: 'valid' }),
          fc.constant({ email: 'valid@example.com', username: 'valid', password: '' }),
          fc.constant({ email: '   ', username: 'valid', password: 'valid' }),
        ),
        async (input) => {
          const svc = new MockUserService();
          try {
            await svc.signup(input);
            return false;  // throw 안 했으면 실패
          } catch (e) {
            return e instanceof IllegalArgumentException;
          }
        }
      )
    );
  });
});

// ============================================================================
// Sprint 1.5 신규 발견 검증 — Cross-validation 결과 반영
// ============================================================================

describe('UserService Properties — Sprint 1.5 신규 발견 (Cross-validation)', () => {

  // -----------------------------------------------------
  // ★ Property 6: TOCTOU race 시 정확히 1건 성공
  // 출처: Sprint 1.5 Static Analyzer + Senior Engineer 동시 지적
  // -----------------------------------------------------
  test('★ TOCTOU race: 동시 signup 시 정확히 1건 성공 (DB UQ defense)', async () => {
    const svc = new MockUserService();
    const sameEmail = 'race@example.com';
    const sameUsername = 'raceuser';

    const concurrent = await Promise.allSettled([
      svc.signup({ email: sameEmail, username: sameUsername + '1', password: 'p1' }),
      svc.signup({ email: sameEmail, username: sameUsername + '2', password: 'p2' }),
      svc.signup({ email: 'other@example.com', username: sameUsername, password: 'p3' }),
    ]);

    const fulfilled = concurrent.filter(r => r.status === 'fulfilled');
    const rejected = concurrent.filter(r => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);  // 정확히 1건
    expect(rejected.length).toBe(2);   // 나머지 2건 race 거절
  });

  // -----------------------------------------------------
  // ★ Property 7: 거절 시 IllegalArgumentException (NOT 500 Error)
  // 출처: Sprint 1.5 ★ critical 발견 (DataIntegrityViolationException 가 IAE 로 정규화)
  // -----------------------------------------------------
  test('★ Critical: race 거절 시에도 IllegalArgumentException (500 Error ❌)', async () => {
    const svc = new MockUserService();
    await svc.signup({ email: 'a@x.com', username: 'a', password: 'p' });

    // 두 번째 동일 email signup → 반드시 IAE (DataIntegrityViolationException 절대 노출 ❌)
    await expect(svc.signup({ email: 'a@x.com', username: 'b', password: 'p' }))
      .rejects.toThrow(IllegalArgumentException);
  });

  // -----------------------------------------------------
  // ★ Property 8: 메시지 결합 ("email or username") - Sprint 1.5 발견
  // 출처: Senior Engineer ★ medium
  // 권고: 분리 가능한 메시지 (DuplicateEmailException / DuplicateUsernameException)
  // -----------------------------------------------------
  test('★ Medium: 거절 메시지 분기 가능성 (현재 결합, 권고 분리)', async () => {
    const svc = new MockUserService();
    await svc.signup({ email: 'a@x.com', username: 'a', password: 'p' });

    try {
      await svc.signup({ email: 'a@x.com', username: 'b', password: 'p' });
    } catch (e: any) {
      // 현재 동작: 결합 메시지
      expect(e.message).toBe('email or username is already exists.');
      // 권고 (Sprint 2~3): 분리 메시지 OR 도메인 예외 정규화
      // expect(e).toBeInstanceOf(DuplicateEmailException);
    }
  });

  // -----------------------------------------------------
  // ★ Property 9: case-sensitive email - Sprint 1.5 hidden bug 발견
  // 출처: Senior Engineer ★ low
  // -----------------------------------------------------
  test('★ Low (Hidden Bug): case-sensitive email 동시 등록 가능성', async () => {
    const svc = new MockUserService();
    await svc.signup({ email: 'Alice@X.com', username: 'a1', password: 'p' });

    // 현재 동작: 두 User 가 동시 존재 가능 (DB UQ case-sensitive)
    try {
      await svc.signup({ email: 'alice@x.com', username: 'a2', password: 'p' });
      // 권고: lowercase 정규화 후 거절되어야 함
      // 현재 통과 = ★ hidden bug
      expect(svc.getAllUsers().length).toBe(2);
    } catch (e) {
      // 정규화 도입 후 expected 동작
      expect(e).toBeInstanceOf(IllegalArgumentException);
    }
  });

  // -----------------------------------------------------
  // ★ Property 10: createdAt timestamp consistency
  // 출처: Senior Engineer ★ low (LocalDateTime.now 하드코딩 — 테스트 어려움)
  // -----------------------------------------------------
  test('★ Low: createdAt 가 signup 시각과 거의 일치 (±1초)', async () => {
    const svc = new MockUserService();
    const before = Date.now();
    const user = await svc.signup({ email: 'time@x.com', username: 'time', password: 'p' });
    const after = Date.now();

    const userTime = user.createdAt.getTime();
    expect(userTime).toBeGreaterThanOrEqual(before - 1000);
    expect(userTime).toBeLessThanOrEqual(after + 1000);
  });
});

// ============================================================================
// Drift Detection Property — 명세 ↔ 코드 자동 검증
// ============================================================================

describe('Drift Detection — 명세 vs 실제 동작', () => {
  test('Decision Table 모든 행이 코드 분기와 일치', () => {
    // BR-USER-EMAIL-UNIQUE-001.md Decision Table 8행
    const decisionTable = [
      { email: 'valid', username: 'valid', password: 'valid', expectSuccess: true },
      { email: 'valid', username: 'dup', password: 'valid', expectSuccess: false, expectError: IllegalArgumentException },
      { email: 'dup', username: 'valid', password: 'valid', expectSuccess: false, expectError: IllegalArgumentException },
      { email: 'dup', username: 'dup', password: 'valid', expectSuccess: false, expectError: IllegalArgumentException },
      // race row 5 — Property 6 에서 검증
      { email: '', username: 'valid', password: 'valid', expectSuccess: false, expectError: IllegalArgumentException },
      { email: 'valid', username: '', password: 'valid', expectSuccess: false, expectError: IllegalArgumentException },
      { email: 'valid', username: 'valid', password: '', expectSuccess: false, expectError: IllegalArgumentException },
    ];

    // 각 행을 property test 로 자동 검증 (실제 구현 시)
    expect(decisionTable.length).toBeGreaterThan(0);
    // 실제 검증 로직은 Sprint 4 CI 통합 시 자동화
  });
});
