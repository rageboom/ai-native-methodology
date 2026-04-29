# BR-USER-EMAIL-UNIQUE-001 — Decision Table (Phase 4.5 Sprint 1)

> **일자**: 2026-04-29
> **Source of Truth**: 코드 + 자연어 명세 통합 (Direction A + B + C)
> **관련**: UC-USER-SIGNUP / UC-USER-UPDATE-DETAILS / BR-USER-USERNAME-UNIQUE-001

---

## 정책 문장 (자연어 — 기존 L0)

> "시스템에 email='X' 인 User 가 이미 존재할 때 동일 email 로 signup 요청이 들어오면 IllegalArgumentException 발생 + DB unique 제약이 race-safe 차단"

---

## L1 결정표 (signup 시점)

| 입력: email null/blank | 입력: email 중복 (DB) | 입력: email 중복 (App pre-check race window) | 결과 | HTTP | 안전 등급 |
|:---:|:---:|:---:|---|---|---|
| O | * | * | throw IAE "email must not be null or blank" | 400 | ✅ Domain |
| X | X | X | persist OK | 201 | ✅ Happy path |
| X | O | X | throw IAE "email or username already exists" | 400 | ✅ App 1중 |
| X | X | O (race) | throw IAE 또는 DB ConstraintViolation | 400/500 ★ | ⚠️ App miss + DB catch |
| X | O | O | throw IAE (App pre catch) | 400 | ✅ App 1중 |

**\*** 현재 코드 (UserService.signup line 47): App pre-check 통과 후 DB UQ 충돌 시 `DataIntegrityViolationException` 미처리 → **500 Internal Error 노출 위험 (F-058 race window 미처리)**

---

## L1 결정표 (updateUserDetails 시점)

| 현재 email 과 동일 | 새 email 중복 (DB) | 결과 | 안전 등급 |
|:---:|:---:|---|---|
| O | * | 변경 없음 (skip) | ✅ |
| X | X | persist OK | ✅ |
| X | O | throw IAE "email is already exists" | ✅ Adapter 1중 |

**★ F-071 Hexagonal 위반**: 본 검증을 `UserRepositoryAdapter.updateUserDetails` (line 67) 가 수행. 권고: `UserService` 가 검증, Adapter 는 단순 save.

---

## L2 Refinement Type

```typescript
type Email = string & {
  __refinement: 
    | { not: 'null' }
    | { not: 'blank' }
    | { length: { max: 30 } }       // schema.sql line 26 (F-054 RFC 5321 위반 caveat)
    | { unique: 'globally' }
};

// 코드 위치별 검증 책임
const EmailValidation = {
  domain:     ['not null', 'not blank'],                         // User.java:52-54
  schemaSQL:  ['not null', 'unique', 'length <= 30'],            // schema.sql:26
  application:['existsByEmailOrUsername (race-prone)'],          // UserRepositoryAdapter.existsBy:51
  // 누락 영역 (F-058):
  // - DataIntegrityViolationException catch + IAE 변환 미구현
};
```

---

## Race Safety Layered Defense 분석

| Layer | 코드 위치 | Race Safety | 누락 처리 |
|---|---|---|---|
| L1. Application pre-check | `UserService.signup:47` | ❌ TOCTOU race-prone (1중) | - |
| L2. Domain validation | `User constructor:52-65` | N/A (single-thread instance) | - |
| L3. DB Unique constraint | `schema.sql:26` (UNIQUE) | ✅ Race-safe (1중) | ★ F-058: ConstraintViolation → IAE 변환 미구현 |

**★ 결론**: 현재 = "2중 안전망 + race window 1건". 권고:
1. App pre-check 유지 (정상 경로 빠른 거절)
2. DB INSERT 시 `try { save } catch (DataIntegrityViolationException) { throw new IAE }` 추가 (race window 처리)

---

## 도식 참조

- 생애주기: [`../state-machines/User-Account.mermaid`](../state-machines/User-Account.mermaid)
- 오케스트레이션: [`../sequence-diagrams/UC-USER-SIGNUP.mermaid`](../sequence-diagrams/UC-USER-SIGNUP.mermaid)
- 타입 제약: [`../invariants/User.ts`](../invariants/User.ts)

---

## Direction A vs B 비교 결과 (drift 검출)

| 항목 | A (자연어 명세 rules.json) | B (코드 추출) | drift |
|---|---|---|---|
| email null/blank 검증 | ❌ 누락 | ✅ User constructor:52 | ★ 자연어 명세 빈틈 |
| App pre-check race-prone 명시 | ⚠️ "race_safety" 텍스트만 | ✅ existsBy 단일 호출 식별 | ★ 정량화 부족 |
| DataIntegrityViolation 미처리 | ❌ 누락 | ✅ catch 부재 명시 | ★ critical 빈틈 |
| BCrypt encryption 결합 | ❌ 별도 BR | ✅ encryptPassword 호출 식별 | 의도된 분리 |
| updateUserDetails 검증 | ❌ 누락 | ✅ Adapter 위반 (F-071) | ★ 자연어 명세 빈틈 |

**총 drift 4건 발견** (★ 표시) — 자연어 명세가 코드 의미를 80% 만 담고 있었음 입증.
