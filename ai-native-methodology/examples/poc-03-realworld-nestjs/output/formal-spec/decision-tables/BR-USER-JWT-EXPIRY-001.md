# BR-USER-JWT-EXPIRY-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30
> **Source of Truth**: 코드 (user.service.ts:103-110 generateJWT + auth.middleware.ts verify 3곳)
> **PoC #02 cross-validation**: PoC #02 = Spring Security framework-managed / PoC #03 = manual JWT — F-118 / F-119 PoC #03 단독 (cross-platform 핵심 차이)

---

## 1. L1 결정표 — JWT 생성

| 시점 | exp | 결과 | 권고 |
|---|---|---|---|
| login | now + 60 days | token 발급 | ★ 7일 + refresh 도입 |
| findById | now + 60 days | ★ 매번 재생성 (F-118 DRY) | findById 시 재생성 ❌ |
| findByEmail | now + 60 days | ★ 매번 재생성 | 동일 |

---

## 2. L1 결정표 — JWT 검증

| Authorization header | jwt.verify | exp 검사 | 결과 | HTTP | 검증 위치 |
|:---:|:---:|:---:|---|---|---|
| ❌ | — | — | (★ AuthMiddleware 미적용 시 통과 — F-140) | 200 | (Auth 부재) |
| ✅ | OK | exp > now | req.user 주입 → 통과 | 200 | AuthMiddleware |
| ✅ | OK | **exp <= now** | ★ verify exception → uncaught (F-118) | 503 | ★ try/catch 부재 |
| ✅ | invalid | — | ★ verify exception → uncaught | 503 | ★ try/catch 부재 |

---

## 3. ★ F-118 + F-119 + F-149 분석

| Finding | 핵심 | severity |
|---|---|---|
| F-118 | jwt.verify 3곳 DRY 위반 + try/catch 부재 | high |
| F-119 | JWT 60일 expiry (관행 7~14일) | medium |
| F-149 (신규) | refresh token 부재 + logout/blacklist 부재 | medium |

---

## 4. L2 Refinement Type

```typescript
type ExpiryPolicy = '7d' | '14d' | '30d' | '60d_currently_violation';
type JwtPayload = { email: string; exp: number; iat: number };
type RefreshToken = string & { __brand: 'RefreshToken'; __exp: '30d' };

namespace JwtInvariants {
  export const expiryWithinPolicy = (jwt: JwtPayload, policy: ExpiryPolicy): boolean => {
    const maxSeconds = policy === '7d' ? 7*86400 : policy === '14d' ? 14*86400 : 30*86400;
    return (jwt.exp - jwt.iat) <= maxSeconds;
  };

  export const verifyAlwaysWrappedInTryCatch = (codePath: string): boolean => {
    // ★ static check — jwt.verify 호출이 try/catch 내부인지
    return /try\s*{[^}]*jwt\.verify/.test(codePath);
  };
}
```

---

## 5. 코드 생성안 (Direction D)

### 5-A. AuthMiddleware 보강 (★ F-118 fix)

```typescript
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, SECRET) as { email: string };
      req.user = payload;
      next();
    } catch (e) {
      // ★ F-118 fix — try/catch 추가
      throw new UnauthorizedException('JWT invalid or expired');
    }
  }
}
```

### 5-B. JWT expiry 단축 (★ F-119 fix)

```typescript
generateJWT(user: UserEntity) {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 7);  // ★ 60 → 7
  return jwt.sign({ email: user.email, exp: exp.getTime() / 1000 }, SECRET);
}
```

### 5-C. (★ 권고) refresh token 도입

```typescript
// 별도 JWT (exp 30일) + /api/users/refresh endpoint
generateRefreshToken(user: UserEntity) {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 30);
  return jwt.sign({ email: user.email, type: 'refresh', exp }, REFRESH_SECRET);
}
```

---

## 6. 핵심 결론

> **자연어 4 line + 형식화 6 결단 = AuthMiddleware try/catch 4줄 + expiry 단축 1줄 + refresh endpoint 신규**.
> **PoC #02 isomorphic 부재** — Spring Security 가 verify 무방어 회피 (framework-managed) → ★ NestJS 단독 critical.
