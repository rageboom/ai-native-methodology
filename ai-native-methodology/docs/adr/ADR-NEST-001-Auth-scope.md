# ADR-NEST-001: NestJS Auth Scope — JwtAuthGuard 글로벌 + Ownership Service

- 상태: 승인됨 (Accepted) — 묶음 R #1
- 일자: 2026-04-30
- 결정자: 윤주스 (TF Lead, Auto Mode 위임)
- 관련: ADR-001 / ADR-002 / DEC-2026-04-30-poc03-phase6-종결 / DEC-v1.3-격상-데이터-완비 / PoC #03 AP-AUTH-NEST-001 (5 endpoint critical)

---

## 1. 컨텍스트

PoC #03 (lujakob/nestjs-realworld-example-app) 분석 결과 **NestJS 의 Auth scope 결여 패턴 critical 5건** 식별:
- DELETE /api/users/:slug — F-140 (★ AuthMiddleware forRoutes 누락)
- PUT/DELETE/POST /articles/:slug + comments — F-164 (★ @User decorator 부재)
- JWT verify 무방어 — F-118 (try/catch 부재)
- JWT 60일 expiry — F-119
- login 'User not found' 모호 — F-150 (OWASP A07)

→ **AP-AUTH-NEST-001 critical** (cumul 5).

**근본 원인**: NestJS 의 `MiddlewareConsumer.forRoutes` 가 endpoint 별 명시 — **누락 위험 큼**. Spring Security 의 framework-managed Auth 와 본질적 차이.

## 2. 결정

### 2.1 ★ JwtAuthGuard 글로벌 적용 의무

```typescript
// app.module.ts
@Module({
  providers: [
    {provide: APP_GUARD, useClass: JwtAuthGuard}  // ★ 글로벌
  ]
})
```

**예외 명시**: `@Public()` decorator 로 의도된 anonymous endpoint 표시.

```typescript
@Public()
@Post('users/login')
async login(...) {}
```

### 2.2 ★★ Ownership Check Service 단 의무

`@UseGuards(JwtAuthGuard)` 만으로 **resource ownership 보장 안 됨** — Service 단 명시 의무:

```typescript
async update(slug: string, userId: number, dto: UpdateArticleDto) {
  const article = await this.findOne({slug});
  if (article.author.id !== userId) {
    throw new ForbiddenException();  // ★ 의무
  }
  // ...
}
```

→ OWASP API5 (BOLA) 정합.

### 2.3 ★ @nestjs/passport + LocalStrategy + JwtStrategy 의무

Manual JWT verify 절대 금지 — verify 분산 시 try/catch 부재 risk (F-118).

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // verify + try/catch + UnauthorizedException 자동
}
```

### 2.4 ★ JWT expiry 7일 + refresh token endpoint 의무

- Access token: **7일 max** (60일+ 금지 — F-119)
- Refresh token: 30일 + endpoint POST /auth/refresh
- Logout: Redis blacklist 또는 짧은 expiry 의존

### 2.5 ★ login error 메시지 통일 — "Invalid credentials"

OWASP A07 (User Enumeration) — user 부재 / password 불일치 구분 금지.

```typescript
// ❌ 'User not found' (F-150 — user 부재 정보 노출)
// ✅ 'Invalid credentials'
```

### 2.6 ★ rate limiting 의무 — `@nestjs/throttler`

```typescript
@UseGuards(ThrottlerGuard)
@Throttle({default: {limit: 5, ttl: 60000}})
@Post('users/login')
```

OWASP A04 (Insecure Design — brute force 방어).

## 3. 결과

### 3.1 Positive 효과

- ★ NestJS Auth scope 결여 5건 자연 회피
- ★ OWASP API5 + A04 + A07 동시 정합
- ★ @nestjs/passport 표준 = 사내 NestJS 일관성

### 3.2 트레이드오프

- ★ 학습 곡선 — Passport 패턴 + Strategy 분리
- ★ 글로벌 Guard 도입 시 기존 endpoint 검토 의무 (★ 큰 codebase 시 마이그레이션 시간)

## 4. 검증

CI 의무:
- supertest E2E — 익명 요청 401 + non-owner 403
- 모든 controller method = `@UseGuards` 또는 `@Public()` 명시 (ts-morph rule)
- @nestjs/throttler default config 확인

## 5. 본 방법론 적용

`migration-cautions.md` (v1.2.0 묶음 P) NestJS 변형 § A 항목 등재 — 신규 NestJS 프로젝트 design 단계 의무 적용.

**참조**: PoC #03 `examples/poc-03-realworld-nestjs/output/antipatterns/migration-cautions.md` § A.

---

**End of ADR-NEST-001.**
