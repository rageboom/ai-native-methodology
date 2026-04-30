# BR-USER-DELETE-AUTH-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30
> **Source of Truth**: **자연어 + 코드 부재** (★ F-140 신규) — Direction A 단방향
> **PoC #02 cross-validation**: 신규 — PoC #02 에서는 Spring Security 가 framework-managed → F-140 재현 ❌

---

## 1. 정책 문장 (자연어 — L0)

> rules.json BR-USER-DELETE-AUTH-001
> - trigger: "DELETE /api/users/:slug"
> - condition: "(★ AuthMiddleware 미적용 — F-140 critical)"
> - action: "userRepository.delete({email})"
> - expected_result: "(★★ 권한 검증 부재 — 누구나 삭제 가능)"
> - current_state: "★★ absent (F-140 critical 신규)"

**자연어 명시 (3 / 9 = 33%)**.

**자연어 빈약 (6 / 9 = 67%)**:
1. ❓ 거부 방식 (anonymous → 401 / not owner → 403)
2. ❓ 검증 위치 (Guard / Middleware / Service ownership check)
3. ❓ HTTP status (401 vs 403 분리)
4. ❓ 에러 메시지
5. ❓ 기대 결과 (정상 시 soft delete vs hard delete)
6. ❓ cascade 처리 (articles / favorites / follows / comments)

---

## 2. L1 결정표 (현재 코드 + 권고)

### 2-A. 현재 (★★ F-140)

| 호출자 | req.user 존재 | target email == req.user.email | 결과 | HTTP |
|:---:|:---:|:---:|---|---|
| anyone | ❌ (Auth 부재) | * | ★★ DELETE 실행 → user row + cascade | 200 |

### 2-B. 권고 (Direction D — 형식 → 코드)

| 호출자 | req.user 존재 | target email == req.user.email | target row 존재 | 결과 | HTTP |
|:---:|:---:|:---:|:---:|---|---|
| anonymous | ❌ | * | * | UnauthorizedException | 401 |
| auth other | ✅ | ❌ | * | ForbiddenException | 403 |
| auth self | ✅ | ✅ | ❌ | NotFoundException | 404 |
| auth self | ✅ | ✅ | ✅ | DELETE OK + cascade 처리 | 200 |

---

## 3. L2 Refinement Type

```typescript
type AuthenticatedUser = User & { __auth: { jwt_valid: true; not_expired: true } };
type Owner             = AuthenticatedUser & { __owner: { matches_target: true } };

namespace UserDeleteInvariants {
  export const onlyOwnerCanDelete = (
    actor: AuthenticatedUser,
    target: User
  ): boolean => actor.email === target.email;

  export const cascadeIntegrity = (
    target: User,
    affectedRecords: { articles: number; favorites: number; follows: number; comments: number }
  ): boolean => {
    // ★ 모든 cascade 처리 결정 명시 의무 (orphan 차단)
    return affectedRecords.articles >= 0 && affectedRecords.favorites >= 0;
  };
}
```

---

## 4. 코드 생성안 (Direction D)

### 4-A. user.module.ts 보강 (★★ 1줄 fix)

```typescript
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(AuthMiddleware)
    .forRoutes(
      { path: 'user', method: RequestMethod.GET },
      { path: 'user', method: RequestMethod.PUT },
      { path: 'users/:slug', method: RequestMethod.DELETE },  // ★ 추가
      // ...
    );
}
```

### 4-B. UserController.delete 보강 (소유권 검증)

```typescript
@Delete('users/:slug')
async delete(@Param('slug') slug: string, @User() user: UserData) {
  // ★ NestJS 권장 = @UseGuards(JwtAuthGuard) (개선 권고)
  if (!user) throw new UnauthorizedException();
  if (user.email !== slug) throw new ForbiddenException(); // ★ 소유권
  return this.userService.delete(slug);
}
```

### 4-C. (★★ 권고) JwtAuthGuard 도입 (NestJS 7 industry 정설)

```typescript
@UseGuards(JwtAuthGuard)
@Delete('users/:slug')
async delete(@Param('slug') slug: string, @CurrentUser() user: UserEntity) {
  if (user.email !== slug) throw new ForbiddenException();
  return this.userService.delete(slug);
}
```

---

## 5. 발견된 신규 finding

| # | finding | 심각도 |
|---|---|---|
| F-140 | UC-USER-DELETE AuthMiddleware 미적용 | **critical** |
| F-146 | 소유권 검증 부재 (req.user.email !== target email) | high |
| F-152 | slug parameter 가 실제 email 사용 (param naming 혼란) | low |
| F-121 (related) | FK 부재 → user 삭제 시 follows 등 orphan | high |

---

## 6. 핵심 결론

> **자연어 3 line + 형식화 6 결단 = user.module.ts 1줄 + Controller 소유권 4줄 + cascade 정책 1결정**.
> ★★★ 사내 적용 시 즉시 수정 critical (PoC #03 의 critical 2건 중 하나).
