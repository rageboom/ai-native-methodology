// PoC #02 — User Aggregate Refinement Type + Invariant (Phase 4.5 Sprint 1)
// 일자: 2026-04-29
// Source of Truth: 코드 (User.java, schema.sql) + 자연어 명세 통합
// Direction: B (코드 → L2) + A 통합
// 관련 BR: BR-USER-EMAIL-UNIQUE-001 / BR-USER-USERNAME-UNIQUE-001 / BR-USER-PASSWORD-ENCRYPTED-001
// 표기 도구: TypeScript-like (사람·AI 양쪽 친화)

// ============================================================================
// Refinement Type 정의 (L2)
// ============================================================================

/**
 * Email
 * - schema.sql:26  varchar(30) NOT NULL UNIQUE
 * - User.java:52   not null, not blank
 * - F-054 caveat:  RFC 5321 권장 254/320, 30 자 제한 위반
 */
type Email = string & {
  readonly __brand: 'Email';
  readonly __refinement: {
    readonly notNull: true;
    readonly notBlank: true;
    readonly maxLength: 30;       // ★ F-054
    readonly uniqueScope: 'global';
  };
};

/**
 * Username
 * - schema.sql:27  varchar(30) NOT NULL UNIQUE
 * - User.java:55   not null, not blank
 * - F-055 caveat:  한국어 환경 30 자 부족
 */
type Username = string & {
  readonly __brand: 'Username';
  readonly __refinement: {
    readonly notNull: true;
    readonly notBlank: true;
    readonly maxLength: 30;       // ★ F-055
    readonly uniqueScope: 'global';
  };
};

/**
 * EncryptedPassword
 * - schema.sql:29  varchar(200) NOT NULL
 * - User.java:120  passwordEncoder.encode() = BCrypt
 * - F-056 caveat:  Argon2 도입 시 200 자 부족
 */
type EncryptedPassword = string & {
  readonly __brand: 'EncryptedPassword';
  readonly __refinement: {
    readonly notNull: true;
    readonly prefix: '$2a$' | '$2b$' | '$2y$';   // BCrypt
    readonly maxLength: 200;                      // ★ F-056
  };
};

/**
 * PlainPassword (transient — 영속 ❌)
 * - User.java:58 not null, not blank
 */
type PlainPassword = string & {
  readonly __brand: 'PlainPassword';
  readonly __refinement: {
    readonly notNull: true;
    readonly notBlank: true;
    readonly transient: true;     // 영속 절대 금지
  };
};

type UserId = string & { readonly __brand: 'UserId'; readonly __format: 'UUID' };

// ============================================================================
// Aggregate Root
// ============================================================================

interface User {
  readonly id: UserId;                    // GeneratedValue UUID
  readonly email: Email;
  readonly username: Username;
  readonly password: EncryptedPassword;   // 영속 시 BCrypt 강제
  readonly bio?: string;                   // varchar(500), nullable
  readonly imageUrl?: string;              // varchar(200), nullable
  readonly createdAt: Date;                // Immutable, set on instantiation
}

// ============================================================================
// Invariant (전역 불변 — 모든 시점 보장)
// ============================================================================

namespace UserInvariants {
  /**
   * INV-USER-EMAIL-UNIQUE
   * - schema.sql UQ 1중 race-safe
   * - rules.json BR-USER-EMAIL-UNIQUE-001
   */
  export const emailUnique = (users: User[]): boolean =>
    users.every((u1, i) =>
      users.slice(i + 1).every(u2 => u1.email !== u2.email)
    );

  /**
   * INV-USER-USERNAME-UNIQUE
   * - schema.sql UQ 1중 race-safe
   * - rules.json BR-USER-USERNAME-UNIQUE-001
   */
  export const usernameUnique = (users: User[]): boolean =>
    users.every((u1, i) =>
      users.slice(i + 1).every(u2 => u1.username !== u2.username)
    );

  /**
   * INV-USER-PASSWORD-ENCRYPTED
   * - User.java:120 BCrypt 강제
   * - rules.json BR-USER-PASSWORD-ENCRYPTED-001
   */
  export const passwordEncrypted = (user: User): boolean =>
    user.password.startsWith('$2a$') ||
    user.password.startsWith('$2b$') ||
    user.password.startsWith('$2y$');

  /**
   * INV-USER-CREATED-IMMUTABLE
   * - User.java:45 final + updatable=false
   */
  export const createdAtImmutable = (oldUser: User, newUser: User): boolean =>
    oldUser.createdAt.getTime() === newUser.createdAt.getTime();
}

// ============================================================================
// Pre-condition / Post-condition (L3 보강 — Hoare triple)
// ============================================================================

namespace UC_USER_SIGNUP {
  type Input = { email: string; username: string; password: PlainPassword };
  type Output = User | { error: 'IllegalArgumentException'; reason: string };

  export const precondition = (input: Input): boolean =>
    input.email != null && input.email.length > 0 &&
    input.username != null && input.username.length > 0 &&
    input.password != null && input.password.length > 0;

  export const postcondition = (input: Input, output: Output, usersBefore: User[], usersAfter: User[]): boolean => {
    if ('error' in output) {
      // 거절 시 Users 불변
      return usersBefore.length === usersAfter.length;
    }
    // 성공 시 Users 1건 추가 + 모든 invariant 만족
    return (
      usersAfter.length === usersBefore.length + 1 &&
      UserInvariants.emailUnique(usersAfter) &&
      UserInvariants.usernameUnique(usersAfter) &&
      UserInvariants.passwordEncrypted(usersAfter[usersAfter.length - 1]) &&
      output.email === input.email &&
      output.username === input.username
    );
  };
}

// ============================================================================
// 발견된 갭 (자연어 명세 vs 형식화 비교)
// ============================================================================

/*
 * F-058 (재확인) — App pre-check 통과 후 DB UQ 위반 시:
 *   현재: DataIntegrityViolationException 미처리 → 500 Internal Error
 *   권고: catch + IAE 변환
 *
 * F-071 (재확인) — updateUserDetails 검증을 Adapter 가 수행 (Hexagonal 위반)
 *   현재: UserRepositoryAdapter.updateUserDetails:67-79 가 도메인 검증
 *   권고: UserService 가 검증, Adapter 는 단순 save
 *
 * 신규 발견 (Sprint 1) — Direction C 비교 결과:
 *   1. 자연어 명세 (rules.json) 가 User constructor null/blank 검증 누락
 *   2. 자연어 명세가 DataIntegrityViolation 미처리 race window 미명시
 *   3. 자연어 명세가 updateUserDetails 검증 책임 미명시
 */
