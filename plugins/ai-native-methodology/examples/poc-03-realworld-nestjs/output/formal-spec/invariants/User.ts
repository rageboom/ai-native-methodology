/**
 * User Aggregate — Refinement Type + Invariant (Phase 4.5)
 *
 * 일자: 2026-04-30
 * Source of Truth: 코드 (src/user/user.entity.ts + user.service.ts) + 자연어 (rules.json)
 * Direction: B + A 통합
 *
 *  D4 결정 — 양쪽 표기:
 *   - 명세 = 코드 충실 (lujakob 패턴 100% 일치) — anemic + Service validate
 *   - antipattern 권고 = Sairyss DDD-Hexagon (`static create()` + throw + Guard.*)
 */

// ============================================================================
// Refinement Type 정의 (L2)
// ============================================================================

type Username = string & {
  readonly __brand: 'Username';
  readonly __refinement: {
    readonly notNull: true;
    readonly notBlank: true;
    readonly uniqueScope: 'global';
    //  F-120 — DB UQ 자체 부재 → uniqueScope 미보장 (현재 코드 실태)
  };
};

type Email = string & {
  readonly __brand: 'Email';
  readonly __refinement: {
    readonly notNull: true;
    readonly format: 'RFC5322';  // @IsEmail (UserEntity 데코)
    readonly uniqueScope: 'global';
    //  F-120 — DB UQ 자체 부재
  };
};

type Argon2Hash = string & {
  readonly __brand: 'Argon2Hash';
  readonly __refinement: {
    readonly notNull: true;
    readonly prefix: '$argon2id$' | '$argon2i$' | '$argon2d$';
    //  @BeforeInsert hook 으로만 보장 ( @BeforeUpdate 부재 — F-141)
  };
};

type PlainPassword = string & {
  readonly __brand: 'PlainPassword';
  readonly __refinement: {
    readonly notNull: true;
    readonly notBlank: true;
    readonly transient: true;  // 영속 절대 금지
  };
};

type UserId = number & { readonly __brand: 'UserId'; readonly __format: 'auto-increment' };

// ============================================================================
// Aggregate Root ( D4 — 코드 충실 명세 / lujakob anemic 패턴)
// ============================================================================

interface User {
  readonly id: UserId;
  readonly username: Username;
  readonly email: Email;
  readonly bio?: string;     // default ''
  readonly image?: string;   // default ''
  readonly password: Argon2Hash;
  //  favorites / articles 관계는 별도 Aggregate
}

// ============================================================================
// Invariants (전역 — 모든 시점 보장)
// ============================================================================

namespace UserInvariants {
  /**
   * INV-USER-USERNAME-UNIQUE
   * - rules.json BR-USER-USERNAME-EMAIL-UNIQUE-001
   * -  App 1중만 (DB UQ 부재 — F-120)
   */
  export const usernameUnique = (users: User[]): boolean =>
    users.every((u1, i) =>
      users.slice(i + 1).every(u2 => u1.username !== u2.username)
    );

  /**
   * INV-USER-EMAIL-UNIQUE
   * - rules.json BR-USER-USERNAME-EMAIL-UNIQUE-001
   * -  App 1중만 (DB UQ 부재)
   */
  export const emailUnique = (users: User[]): boolean =>
    users.every((u1, i) =>
      users.slice(i + 1).every(u2 => u1.email !== u2.email)
    );

  /**
   * INV-USER-PASSWORD-HASHED
   * - rules.json BR-USER-PASSWORD-HASH-001
   * - @BeforeInsert hook (argon2.hash)
   * -  @BeforeUpdate 부재 (F-141 — password change endpoint 자체 부재로 현재 영향 X)
   */
  export const passwordHashed = (user: User): boolean =>
    user.password.startsWith('$argon2id$') ||
    user.password.startsWith('$argon2i$') ||
    user.password.startsWith('$argon2d$');

  /**
   * INV-USER-EMAIL-FORMAT
   * - @IsEmail (UserEntity 데코) — RFC 5322
   * -  F-143 — UserService.update 가 validate 미호출 → update 시 우회 가능
   */
  export const emailFormatValid = (user: User): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);
}

// ============================================================================
// Authentication Invariants ( F-118 / F-119 / F-150 / F-153)
// ============================================================================

interface JwtPayload {
  readonly email: string;
  readonly exp: number;
  readonly iat?: number;
}

namespace AuthInvariants {
  /**
   * INV-JWT-EXPIRY-WITHIN-POLICY
   * - 권고: 7일 이하 (현재 60일  F-119)
   */
  export const expiryWithinPolicy = (jwt: JwtPayload, maxDays: number = 7): boolean => {
    const issuedAt = jwt.iat ?? 0;
    const maxSeconds = maxDays * 86400;
    return (jwt.exp - issuedAt) <= maxSeconds;
  };

  /**
   * INV-JWT-VERIFY-WRAPPED-IN-TRY-CATCH
   * -  F-118 — 현재 verify 3곳 try/catch 부재 → uncaught throw → 503
   * - 본 invariant 는 코드 정적 검증 (Semgrep/typescript-eslint 영역)
   */
  export const verifyAlwaysWrappedInTryCatch = (codePath: string): boolean =>
    /try\s*{[^}]*jwt\.verify[\s\S]*?}\s*catch/.test(codePath);

  /**
   * INV-DELETE-AUTH-OWNER-CHECK ( F-140 + F-146)
   * - actor 가 target 의 소유자만 가능
   */
  export const onlyOwnerCanDelete = (actor: User | null, targetEmail: string): boolean =>
    actor != null && actor.email === targetEmail;
}

// ============================================================================
//  D4 antipattern 권고 — Sairyss DDD-Hexagon Smart Constructor 패턴
// ============================================================================

/**
 * ( 현재 코드 = anemic + Service validate / 본 권고는 industry best 기준)
 *
 * 권장 패턴 (Sairyss 11k stars 정합):
 *
 * class User {
 *   private constructor(private props: UserProps) {}
 *
 *   static create(props: UserProps): User {
 *     //  Smart Constructor — invariant 검증 100% 강제
 *     Guard.againstNullOrUndefined(props.email, 'email');
 *     Guard.againstNullOrUndefined(props.username, 'username');
 *     Guard.matches(props.email, EMAIL_REGEX, 'email format');
 *     return new User(props);
 *   }
 * }
 *
 * → 현재 PoC #03 = anemic + Service validate (lujakob 다수파)
 * → industry best 기준 antipattern (Phase 6 antipatterns 후보)
 */

// ============================================================================
// Pre-condition / Post-condition (Hoare triple — UC-USER-SIGNUP)
// ============================================================================

namespace UC_USER_SIGNUP {
  type Input = { username: string; email: string; password: PlainPassword };
  type Output = User | { error: 'HttpException'; status: number; message: string };

  export const precondition = (input: Input): boolean =>
    input.username != null && input.username.length > 0 &&
    input.email != null && input.email.length > 0 &&
    input.password != null && input.password.length > 0;

  export const postcondition = (
    input: Input,
    output: Output,
    usersBefore: User[],
    usersAfter: User[]
  ): boolean => {
    if ('error' in output) {
      return usersBefore.length === usersAfter.length;
    }
    return (
      usersAfter.length === usersBefore.length + 1 &&
      UserInvariants.usernameUnique(usersAfter) &&
      UserInvariants.emailUnique(usersAfter) &&
      UserInvariants.passwordHashed(usersAfter[usersAfter.length - 1]) &&
      UserInvariants.emailFormatValid(output)
    );
  };
}

/*
 * 발견된 갭 (자연어 명세 vs 형식화 비교):
 *
 * F-120 (재확인) — App pre-check 통과 후 race window 시 양쪽 INSERT 성공
 *   현재: undefined behavior (DB UQ 부재)
 *   권고: DB UQ 추가 + catch QueryFailedError → ConflictException 409
 *
 * F-118 (재확인) — jwt.verify 3곳 try/catch 부재
 *   현재: uncaught throw → 503
 *   권고: try/catch + UnauthorizedException 401
 *
 * F-119 (재확인) — JWT 60일 expiry
 *   현재: 60일
 *   권고: 7일 + refresh token
 *
 * F-140 (재확인) — UC-USER-DELETE AuthMiddleware 미적용
 *   현재: anonymous 도 가능
 *   권고: forRoutes DELETE 추가 또는 JwtAuthGuard
 *
 * F-141 (신규) — @BeforeUpdate hook 부재 (현재 password change endpoint 자체 부재로 영향 X)
 *
 * F-143 (재확인) — UserService.update validate 미호출
 *   현재: @IsEmail 우회 가능
 *   권고: validate(newUser) 추가
 *
 * F-150 (신규) — login 시 'User not found' 메시지 모호
 *   현재: user 부재 / password mismatch 동일 메시지
 *   권고: 'Invalid credentials' 통일 (OWASP A07)
 *
 * F-153 (신규) — rate limiting 부재
 *   권고: @nestjs/throttler 도입 (OWASP A04)
 */

export { User, Username, Email, Argon2Hash, JwtPayload, UserInvariants, AuthInvariants, UC_USER_SIGNUP };
