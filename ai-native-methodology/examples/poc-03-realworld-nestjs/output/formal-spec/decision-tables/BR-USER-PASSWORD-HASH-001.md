# BR-USER-PASSWORD-HASH-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30 (Phase 4.5 추가 형식화 / B 작업)
> **Source of Truth**: 코드 (UserEntity @BeforeInsert hashPassword)
> **PoC #02 cross-validation**: ★ Spring Security PasswordEncoder vs PoC #03 = argon2 직접 호출 — 표준 차이

---

## 1. 정책 문장 (자연어 — L0)

> rules.json BR-USER-PASSWORD-HASH-001
> - condition: "User INSERT 시점"
> - action: "argon2.hash(password) → password column 덮어쓰기"
> - expected_result: "DB 평문 저장 ❌"
> - current_state: "complete"  ← ★ 그러나 ★★ F-141 — @BeforeUpdate / password change endpoint 부재

**자연어 4 / 9 = 44%**.

---

## 2. L1 결정표 (현재 코드)

### 2-A. signup 분기 (POST /api/users) — @BeforeInsert

| password 입력 | argon2.hash 성공 | 결과 | 비고 |
|:---:|:---:|---|---|
| ❌ (blank) | * | "password blank" → 400 | CreateUserDto @IsNotEmpty |
| ✅ | ✅ | DB 저장 ($argon2id$...) | 정상 |
| ✅ | ❌ (★ uncaught) | 500 (★ try/catch 부재) | F-118 동형 |

### 2-B. update 분기 (PUT /api/user) — ★★ F-141

| 시나리오 | 현재 코드 | 결과 |
|:---:|:---:|---|
| password 변경 endpoint 호출 | **❌ 부재** | ★★ password 변경 불가능 |
| UpdateUserDto 에 password 추가 시 (가정) | @BeforeUpdate hook 부재 | ★★ 평문 저장 위험 |

→ **★★ F-141 critical**: password change endpoint 자체 부재 + @BeforeUpdate hook 부재 = production 적용 시 password rotation 불가능.

---

## 3. L2 Refinement Type

```typescript
type HashedPassword = string & {
  __refinement: { argon2id: true };  // $argon2id$ 형식
};

namespace UserInvariants {
  export const isHashed = (s: string): s is HashedPassword =>
    s.startsWith('$argon2id$') || s.startsWith('$argon2i$') || s.startsWith('$argon2d$');

  // INV — DB 의 모든 user.password 가 HashedPassword
  export const allPasswordsHashed = (users: UserEntity[]): boolean =>
    users.every(u => isHashed(u.password));
}
```

---

## 4. 코드 생성안 (Direction D 권고 — F-141 fix)

### 4-A. @BeforeUpdate hook 추가

```typescript
@Entity('user')
export class UserEntity {
  // ...

  @BeforeInsert()
  @BeforeUpdate()  // ★ NEW (F-141 fix)
  async hashPassword() {
    if (this.password && !this.password.startsWith('$argon2')) {
      this.password = await argon2.hash(this.password);
    }
  }
}
```

→ idempotent (이미 hashed 면 skip) — re-save 시 double hash 회피.

### 4-B. Password Change Endpoint (★★ critical NEW)

```typescript
// user.controller.ts
@Post('user/password')
@UseGuards(JwtAuthGuard)
async changePassword(
  @User('id') userId: number,
  @Body() dto: ChangePasswordDto,
) {
  return this.userService.changePassword(userId, dto);
}

// user.service.ts
async changePassword(userId: number, {currentPassword, newPassword}: ChangePasswordDto) {
  const user = await this.userRepository.findOne(userId);
  if (!user) throw new HttpException('User not found', 404);

  const valid = await argon2.verify(user.password, currentPassword);
  if (!valid) throw new HttpException('Invalid current password', 401);

  user.password = newPassword;  // @BeforeUpdate hook 트리거
  await this.userRepository.save(user);

  return { ok: true };
}
```

### 4-C. ChangePasswordDto + class-validator

```typescript
export class ChangePasswordDto {
  @IsNotEmpty() readonly currentPassword: string;
  @IsNotEmpty() @MinLength(8) @Matches(/(?=.*[A-Z])(?=.*\d)/) readonly newPassword: string;
}
```

---

## 5. 발견된 신규 finding

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-141 | password change endpoint 부재 + @BeforeUpdate hook 부재 (★★ password rotation 불가능) | **critical** (★ 격상 권고) | §2-B + §4-B |
| F-168 신규 | argon2.hash try/catch 부재 — uncaught throw 시 500 (F-118 동형) | medium | §2-A |

---

## 6. PoC #02 cross-validation

| 항목 | PoC #02 (Spring Security) | PoC #03 (argon2 직접) |
|---|---|---|
| password hash | PasswordEncoder.encode (BCrypt default) | argon2.hash (★ 더 강함 ✅) |
| password change endpoint | ✅ 존재 (PasswordChangeController) | ❌ 부재 (F-141) |
| @BeforeUpdate equivalent | UserDetailsService 통한 자동 | ❌ 부재 |
| 권고 | (PoC #02 모범 사례 — PoC #03 적용 의무) | ★★ F-141 fix 필수 |

→ **★ argon2 선택은 PoC #02 BCrypt 보다 강함 (✅ positive — F-161 isomorphic 후보)** + **★★ password change endpoint 부재가 critical gap**.
