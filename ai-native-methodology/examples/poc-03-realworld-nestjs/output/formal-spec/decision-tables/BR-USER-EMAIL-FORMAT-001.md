# BR-USER-EMAIL-FORMAT-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30 (Phase 4.5 추가 형식화 / B 작업)
> **Source of Truth**: 코드 (UserEntity.@IsEmail + UserService.create:62 validate)
> **PoC #02 cross-validation**: ★ Bean Validation 풍부 vs PoC #03 = DTO 0 validator + Entity 데코 단독 — F-143 신규

---

## 1. 정책 문장 (자연어 — L0)

> rules.json BR-USER-EMAIL-FORMAT-001
> - condition: "email 입력 시 RFC 5322 형식 검증"
> - action: "@IsEmail (UserEntity decorator) — validate(newUser)"
> - expected_result: "RFC 5322 위반 시 400 (signup 만) / update 시 우회"
> - current_state: "★ partial — F-143 update 검증 우회 가능"

**자연어 4 / 9 = 44%** (PoC #02 isomorphic).

---

## 2. L1 결정표 (현재 코드)

### 2-A. signup 분기 (POST /api/users)

| email blank | email 형식 정합 | 검증 호출 | 결과 | HTTP | 비고 |
|:---:|:---:|:---:|---|---|---|
| ✅ (blank) | * | (CreateUserDto @IsNotEmpty) | "email blank" | 400 | ValidationPipe |
| ❌ | ✅ | UserService.create validate(newUser) | OK → DB INSERT | 201 | 정상 |
| ❌ | ❌ | UserService.create validate(newUser) | "validation failed" | 400 | @IsEmail |

### 2-B. update 분기 (PUT /api/user) ★★ F-143

| email 형식 정합 | UpdateUserDto @IsEmail | UserService.update validate | 결과 | HTTP | 비고 |
|:---:|:---:|:---:|---|---|---|
| ✅ | ❌ (★ 부재) | ❌ (★ 미호출 — F-143) | OK → DB UPDATE | 200 | ★★ 검증 우회 |
| ❌ | ❌ (★ 부재) | ❌ (★ 미호출) | **OK → 잘못된 email 저장** | 200 | ★★★ critical |

→ **★★★ F-143 critical**: PUT /api/user 가 email format 검증 우회 가능. 사내 적용 시 즉시 수정.

---

## 3. L2 Refinement Type

```typescript
type ValidEmail = string & {
  __refinement: { rfc5322: true };  // RFC 5322 정합
};

namespace UserInvariants {
  export const isValidEmail = (email: string): email is ValidEmail =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // INV — 모든 UserEntity.email 이 ValidEmail
  export const allEmailsValid = (users: UserEntity[]): boolean =>
    users.every(u => isValidEmail(u.email));
}
```

---

## 4. 코드 생성안 (Direction D 권고)

### 4-A. UpdateUserDto @IsEmail 추가 (F-143 + F-162 합산 fix)

```typescript
import { IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @MinLength(3) @MaxLength(20) readonly username?: string;
  @IsOptional() @IsEmail() readonly email?: string;            // ★ NEW
  @IsOptional() @MaxLength(500) readonly bio?: string;
  @IsOptional() readonly image?: string;
}
```

### 4-B. UserService.update validate(newUser) 호출 (F-143 fix)

```typescript
async update(userId: number, userData: UpdateUserDto): Promise<UserRO> {
  const newUser = await this.userRepository.findOne(userId);
  Object.assign(newUser, userData);

  // ★ NEW (F-143 fix)
  const errors = await validate(newUser);
  if (errors.length) throw new HttpException({errors}, 400);

  await this.userRepository.save(newUser);
  return this.buildUserRO(newUser);
}
```

### 4-C. (★★ 권고) ValidationPipe global (F-162 fix)

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}));
```

→ 모든 input DTO 자동 검증.

---

## 5. 발견된 신규 finding

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-143 | UpdateUserDto + UserService.update validate 미호출 → email format 검증 우회 | high | §2-B |
| F-162 | UpdateUserDto 0 validator (★ F-128 합산) | high | §4-A |
| F-167 | 신규 — UserService.create 의 validate(newUser) 가 Entity 데코 의존 / DTO 단독 검증 권고 | medium | §4-A — Sairyss DDD-Hexagon 정설 |

---

## 6. PoC #02 cross-validation 결과

| 항목 | PoC #02 | PoC #03 |
|---|---|---|
| validation 위치 | DTO + Bean Validation (Entity) 풍부 | ★ DTO 0 validator + Entity 데코 단독 |
| update 검증 | ✅ DTO 단독 (UpdateUserRequest) | ★★ F-143 update 검증 우회 |
| validation coverage | 90%+ | ★★ 12% (F-128) |
| 권고 | (모범 사례 — UserCreateRequest + UpdateUserRequest 풍부) | ★ DTO 도입 + ValidationPipe global + UserService.update validate 호출 |

→ **★★ 학습 효과 반대** — PoC #02 풍부 vs PoC #03 빈약. ★ NestJS 라고 자연 회피되지 않음 (개발자 책임).
