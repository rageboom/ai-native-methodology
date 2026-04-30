# BR-USER-USERNAME-EMAIL-UNIQUE-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30
> **Source of Truth**: 코드 (UserService.create) + 자연어 (rules.json)
> **Direction**: B (코드 → 형식) — 자연어 빈약 보완
> **PoC #02 cross-validation**: BR-USER-EMAIL-UNIQUE-001 + BR-USER-USERNAME-UNIQUE-001 isomorphic + 더 나쁜 (1중 vs 2중)

---

## 1. 정책 문장 (자연어 — L0)

> rules.json BR-USER-USERNAME-EMAIL-UNIQUE-001
> - condition: "username 또는 email 이 DB 에 이미 존재"
> - action: "App pre-check (QueryBuilder username OR email)"
> - expected: "중복 시 400 'Username and email must be unique.'"
> - current_state: "★ partial (App 1중 race-prone — DB UQ 부재 / F-120 critical)"

**자연어 명시 (4 / 9 항목, 44%)**:
1. 트리거 조건
2. 액션
3. 기대 결과
4. 현재 상태

**자연어 빈약 (5 / 9, 56%)**:
1. ❓ 거부 방식 (HttpException vs return null vs throw)
2. ❓ 검증 위치 (Service / Domain / DB UQ — 본 PoC = Service only)
3. ❓ HTTP status (400 vs 409 — RFC 9110 §15.5.10 권장 409)
4. ❓ 에러 메시지 분리 (username vs email 별 차이 fail)
5. ❓ race window 처리 (현재 = undefined behavior)

---

## 2. L1 결정표 (signup 시점)

| App pre 통과 | DB INSERT 충돌 | 결과 | HTTP | 검증 위치 |
|:---:|:---:|---|---|---|
| ❌ row 존재 | — | "Username and email must be unique." | 400 | Service |
| ✅ 통과 | ❌ 충돌 (★ race window) | ★★ undefined — 양쪽 INSERT 성공 | (정합성 손실) | DB UQ ❌ |
| ✅ 통과 | ✅ INSERT OK | 201 Created | 201 | DB |

★ race window 행 = ★★ F-120 critical (PoC #02 = race window 시 500 / PoC #03 = 양쪽 row 모두 INSERT 성공 = 더 나쁨).

---

## 3. L2 Refinement Type

```typescript
type Username = string & { __brand: 'Username'; __refinement: { uniqueScope: 'global'; notBlank: true } };
type Email    = string & { __brand: 'Email';    __refinement: { uniqueScope: 'global'; format: 'RFC5322' } };

namespace UserUniquenessInvariants {
  // INV — 모든 User 가 username UQ
  export const usernameUnique = (users: User[]): boolean =>
    users.every((u1, i) => users.slice(i + 1).every(u2 => u1.username !== u2.username));

  // INV — 모든 User 가 email UQ
  export const emailUnique = (users: User[]): boolean =>
    users.every((u1, i) => users.slice(i + 1).every(u2 => u1.email !== u2.email));
}
```

---

## 4. 코드 생성안 (Direction D — 형식 → 코드 권장)

### 4-A. DB schema 보강 (★★ critical 권고)

```sql
ALTER TABLE user
    ADD CONSTRAINT uq_user_username UNIQUE (username),
    ADD CONSTRAINT uq_user_email    UNIQUE (email);
```

### 4-B. UserService.create 보강 — Sairyss 정설 적용

```typescript
async create(dto: CreateUserDto): Promise<UserRO> {
  // Domain 생성 + class-validator
  const newUser = new UserEntity();
  newUser.username = dto.username;
  newUser.email    = dto.email;
  newUser.password = dto.password;

  const errors = await validate(newUser);
  if (errors.length) {
    throw new HttpException({ message: 'Input data validation failed', errors }, HttpStatus.BAD_REQUEST);
  }

  // ★ App pre-check 제거 (race-prone) — DB UQ + catch 로 대체
  try {
    const saved = await this.userRepository.save(newUser);
    return this.buildUserRO(saved);
  } catch (e) {
    if (e instanceof QueryFailedError && (e as any).code === 'ER_DUP_ENTRY') {
      // ★ industry 정설 (Sairyss + TypeORM)
      throw new HttpException(
        { message: 'Username or email already exists.' },
        HttpStatus.CONFLICT  // ★ 409 (RFC 9110 §15.5.10)
      );
    }
    throw e;
  }
}
```

### 4-C. 효과

- App pre-check 제거 → race window 차단
- DB UQ 단독 (1중 race-safe) — 현재 0중 → 1중
- HTTP 409 (정확한 의미) — 현재 400 → 409
- 에러 메시지 분리 권장 (username/email 별)

---

## 5. 발견된 신규 finding

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-120 | App 1중 race-prone (DB UQ 부재) | **critical** | 본 BR §2 race window 행 |
| F-145 | DB UQ 추가 + 409 status 격상 권고 | medium | §4-A + §4-B |
| F-150 | 'User not found' 메시지 모호 (login 영역) | low | (UC-USER-LOGIN.json 참조) |

---

## 6. 관련 산출

- 생애주기: [`../state-machines/User.mermaid`](../state-machines/User.mermaid)
- 오케스트레이션: [`../sequence-diagrams/UC-USER-SIGNUP.mermaid`](../sequence-diagrams/UC-USER-SIGNUP.mermaid)
- 타입 제약: [`../invariants/User.ts`](../invariants/User.ts)

---

## 7. 핵심 결론

> **PoC #03 = App 1중 race / PoC #02 = App+DB 2중 (race-safe 더 강) / industry 정설 (Sairyss) = DB UQ 단독 + catch (race-safe + 단순)**.
> **PoC #03 권고 = DB UQ 추가 + App pre 제거 + 409 격상 — 1글자 변경급 fix**.
