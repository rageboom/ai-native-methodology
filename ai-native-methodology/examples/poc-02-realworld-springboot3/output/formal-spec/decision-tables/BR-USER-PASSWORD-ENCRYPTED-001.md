# BR-USER-PASSWORD-ENCRYPTED-001 — Decision Table (Phase 4.5 Sprint 2)

> **일자**: 2026-04-29
> **Source of Truth**: 코드 + 자연어 명세 통합 (Direction A + B + C)
> **관련**: UC-USER-SIGNUP / UC-USER-UPDATE-DETAILS / Sprint 1.5 신규 결함

---

## 1. 정책 문장 (자연어)

> "User signup 또는 password 업데이트 시 encryptPassword 호출 → BCrypt 로 암호화된 password 가 저장됨 (plain 절대 금지)"

→ **자연어가 안 말한 것**:
- ❓ encryptPassword 호출 책임 (Service / Domain / where)
- ❓ BCrypt cost 명시 (현재 Spring 기본값 10 — strength 어디 명시?)
- ❓ Argon2 / scrypt 미래 마이그레이션 호환성
- ❓ Equality on transient (Sprint 1.5 #13 — id pre-persist 단계 평등성 위험)
- ❓ password 평문 transient state (Sprint 1.5 #9 — 메모리 잔류 위험)

---

## 2. L1 결정표 (signup 시점)

| password null/blank | encryptPassword 호출 | DB 저장값 prefix | 결과 | 안전 등급 |
|:---:|:---:|:---:|---|---|
| O | * | * | IAE "password must not be null or blank" | ✅ Domain (User constructor:58) |
| X | X | (plain) | ❌ 발생 불가 (signup 흐름 강제 호출) | ★ 형식 invariant 보장 |
| X | O | `$2a$` / `$2b$` / `$2y$` | persist OK | ✅ BCrypt prefix |
| X | O | (다른 prefix) | ❌ 형식 invariant 위반 | ★ INV-USER-PASSWORD-ENCRYPTED |

→ **현재 코드 강제 흐름**: `UserService.signup` line 51 `user.encryptPassword(passwordEncoder)` 호출 → user 객체 password 가 BCrypt 로 교체 후 save.

---

## 3. L1 결정표 (updateUserDetails 시점)

| 새 password 입력 | encryptPassword 호출 | 결과 | 안전 등급 |
|:---:|:---:|---|---|
| null / blank | skip | password 변경 없음 (silent partial update ★ Sprint 1.5 #12) | ⚠️ 계약 불명확 |
| 정상 | 호출 | BCrypt 로 교체 | ✅ |

★ Sprint 1.5 #12 (Silent partial update) — User.set\* + encryptPassword 가 null/blank 시 silent skip → PATCH/PUT 계약 모호.

---

## 4. L2 Refinement Type

```typescript
type EncryptedPassword = string & {
  readonly __brand: 'EncryptedPassword';
  readonly __refinement: {
    readonly notNull: true;
    readonly prefix: '$2a$' | '$2b$' | '$2y$';   // BCrypt 만 허용
    readonly maxLength: 200;                      // ★ F-056 Argon2 도입 시 부족
  };
};

type PlainPassword = string & {
  readonly __brand: 'PlainPassword';
  readonly __refinement: {
    readonly notNull: true;
    readonly notBlank: true;
    readonly transient: true;     // ★ Sprint 1.5 #9 — 영속 절대 금지
  };
};

namespace UserInvariants {
  /**
   * INV-USER-PASSWORD-ENCRYPTED
   * - User.password 가 항상 BCrypt prefix 보유
   */
  export const passwordEncrypted = (user: User): boolean =>
    user.password.startsWith('$2a$') ||
    user.password.startsWith('$2b$') ||
    user.password.startsWith('$2y$');
}
```

---

## 5. 검증 위치 분석 (Layered Defense)

| Layer | 코드 위치 | 책임 | 보장 |
|---|---|---|---|
| L1. Domain | User constructor:58 | password not null/blank | ✅ |
| L2. Domain | User.encryptPassword:120 | BCrypt 적용 | ✅ |
| L3. Service | UserService.signup:51 / updateUserDetails | encryptPassword 호출 강제 | ⚠️ 호출 안 하면 plain 저장 위험 (코드 흐름 의존) |
| L4. DB | schema.sql:29 varchar(200) NOT NULL | 형식 무관 | ❌ plain/encrypted 구분 못함 |

**갭**: L4 DB CHECK 부재 → DB 차원에서 BCrypt prefix 강제 못 함. 권고:
```sql
ALTER TABLE users
    ADD CONSTRAINT chk_users_password_bcrypt
    CHECK (password LIKE '$2a$%' OR password LIKE '$2b$%' OR password LIKE '$2y$%');
```

---

## 6. Direction A vs B 비교 결과 (drift)

| 항목 | A (자연어) | B (코드) | drift |
|---|---|---|---|
| BCrypt strength 명시 | ❌ | ⚠️ Spring 기본값 (10) — 명시 부재 | ★ 자연어 미명시 |
| password 평문 transient | ❌ | ⚠️ User.password setter 가 일시 plain 보유 | ★ Sprint 1.5 #9 |
| Silent partial update | ❌ | ⚠️ encryptPassword null/blank skip | ★ Sprint 1.5 #12 |
| DB CHECK BCrypt prefix | ❌ | ❌ schema.sql 부재 | ★ 양쪽 누락 |
| Argon2 마이그레이션 호환 | ❌ | ❌ User.password 단일 column | ★ 양쪽 누락 |

→ **drift 5건** (자연어 빈약성 5건 모두).

---

## 7. 신규 finding (Sprint 2 cross-validation 후보)

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-092 | 자연어 BR-USER-PASSWORD-ENCRYPTED-001 가 BCrypt strength / Silent partial update / DB CHECK 미명시 | medium | §6 drift 5건 |
| F-093 | DB schema.sql users.password CHECK 제약 부재 (BCrypt prefix 강제 안 됨) | medium | §5 L4 |

---

## 8. 도식 참조

- 생애주기: [`../state-machines/User-Account.mermaid`](../state-machines/User-Account.mermaid) (Encrypting 상태)
- 타입 제약: [`../invariants/User.ts`](../invariants/User.ts) `EncryptedPassword` / `PlainPassword`
- 오케스트레이션: [`../sequence-diagrams/UC-USER-SIGNUP.mermaid`](../sequence-diagrams/UC-USER-SIGNUP.mermaid) (encryptPassword step)
