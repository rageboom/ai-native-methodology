# BR-USER-LOGIN-VERIFY-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30
> **Source of Truth**: 코드 (user.service.ts:21-35 findOne)
> **★ Senior 권고 D1+D3 추가 — JWT 발급 흐름이 NestJS Passport ↔ Spring Security cross-platform 핵심 검증 데이터**

---

## 1. L1 결정표

| user 존재 | argon2.verify | 결과 | HTTP | 메시지 |
|:---:|:---:|---|---|---|
| ❌ | — | throw 401 | 401 | "User not found" |
| ✅ | ❌ | throw 401 | 401 | ★ "User not found" (★ F-150 모호 — password mismatch 도 같은 메시지) |
| ✅ | ✅ | jwt.sign + 200 | 200 | (token 반환) |

---

## 2. ★ F-150 메시지 모호성 분석

| 시나리오 | 현재 메시지 | OWASP 권고 |
|---|---|---|
| user 부재 | "User not found" | "Invalid credentials" (user enumeration 회피) |
| password mismatch | "User not found" | "Invalid credentials" |

→ 현재 = ★ 의도 (user enumeration 회피) 일 수 있으나 **명료성 결여** + **표준 메시지 미사용** = 양가적.

---

## 3. ★ Cross-Platform Diff (★★ Senior cross-platform 핵심)

| 차원 | PoC #02 (Spring Security) | PoC #03 (NestJS manual) |
|---|---|---|
| 인증 framework | Spring Security AuthenticationManager | ★ Passport ❌ — manual |
| user 조회 | UserDetailsService | findOne |
| password verify | DaoAuthenticationProvider (BCrypt) | argon2.verify (manual) |
| JWT 발급 | JwtTokenProvider | jwt.sign (manual — F-118) |
| verify 무방어 | ❌ (framework guard) | ★ try/catch 부재 (F-118) |
| rate limiting | Spring Security Filter | ❌ 부재 |

→ **★★ AP-AUTH-NEST-001 critical 후보** — NestJS Passport 미사용 isomorphic.

---

## 4. 코드 생성안 (Direction D)

### 4-A. NestJS Passport 도입 (★★ industry 정설)

```typescript
// LocalStrategy
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) { super({ usernameField: 'email' }); }
  async validate(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}

// JwtStrategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,  // ★ F-118 fix
      secretOrKey: SECRET
    });
  }
  async validate(payload: any) { return { email: payload.email }; }
}
```

### 4-B. UserService.validateUser 보강 (★ F-150 fix)

```typescript
async validateUser(email: string, password: string): Promise<UserEntity | null> {
  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) return null;
  const valid = await argon2.verify(user.password, password);
  return valid ? user : null;
}
```

### 4-C. (★ 권고) rate limiting

```typescript
import { ThrottlerModule } from '@nestjs/throttler';
@Module({ imports: [ThrottlerModule.forRoot({ ttl: 60, limit: 5 })] })
```

---

## 5. 발견된 신규 finding

| # | finding | 심각도 |
|---|---|---|
| F-150 | 'User not found' 메시지 모호 (user enum 회피 의도일 수 있음 — 표준 'Invalid credentials' 권장) | low |
| F-153 (신규) | rate limiting 부재 — brute force 방어 ❌ | medium |

---

## 6. 핵심 결론

> **자연어 4 line + 형식화 5 결단 = NestJS Passport 도입 + 메시지 통일 + rate limiting + AuthMiddleware 폐기 (3중 fix)**.
> **★★ AP-AUTH-NEST-001 critical 합산 근거 — F-118 + F-119 + F-150 + F-153 + F-140 = 5건 composite**.
