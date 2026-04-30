# BR-USER-USERNAME-UNIQUE-001 — Decision Table (Phase 4.5 Sprint 2)

> **일자**: 2026-04-29
> **Source of Truth**: 코드 + 자연어 명세 통합 (Direction A + B + C)
> **관련**: BR-USER-EMAIL-UNIQUE-001 (isomorphic) / UC-USER-SIGNUP / UC-USER-UPDATE-DETAILS

---

## 1. 정책 문장 (자연어)

> "시스템에 username='X' 인 User 가 이미 존재할 때 동일 username 로 signup 요청이 들어오면 IllegalArgumentException 발생"

→ **EMAIL-UNIQUE 와 isomorphic** (race_safety 항목만 누락 — F-090 자연어 빈약성 후보).

---

## 2. L1 결정표 (signup 시점)

| username null/blank | DB 중복 | App pre-check race | 결과 | HTTP | 안전 등급 |
|:---:|:---:|:---:|---|---|---|
| O | * | * | IAE "username must not be null or blank" | 400 | ✅ Domain |
| X | X | X | persist OK | 201 | ✅ Happy path |
| X | O | X | IAE "email or username already exists" | 400 | ✅ App 1중 |
| X | X | O (race) | IAE 또는 500 ★ F-058 isomorphic | 400/500 | ⚠️ App miss + DB catch |
| X | O | O | IAE (App pre catch) | 400 | ✅ App 1중 |

★ EMAIL 과 동일 race window — `existsByEmailOrUsername` 단일 호출로 묶여 있음.

## 3. L1 결정표 (updateUserDetails 시점)

| 현재 username 동일 | 새 username 중복 | 결과 | 안전 등급 |
|:---:|:---:|---|---|
| O | * | 변경 없음 (skip) | ✅ |
| X | X | persist OK | ✅ |
| X | O | IAE "username is already exists" | ✅ Adapter 1중 ★ F-071 (Hexagonal 위반) |

---

## 4. L2 Refinement Type

```typescript
type Username = string & {
  readonly __refinement: {
    readonly notNull: true;
    readonly notBlank: true;
    readonly maxLength: 30;       // ★ F-055 한국어 환경 부족
    readonly uniqueScope: 'global';
  };
};
```

→ User.ts `Username` 타입 그대로 재사용. INV-USER-USERNAME-UNIQUE 정의 동일.

---

## 5. EMAIL vs USERNAME isomorphic 차이 (drift)

| 항목 | EMAIL | USERNAME | drift |
|---|---|---|---|
| 검증 메서드 | `existsByEmailOrUsername` (공유) | 동일 (공유) | - |
| 메시지 결합 | "email or username already exists" | 동일 메시지 | ★ Sprint 1.5 #6 — i18n/UX 분기 불가 |
| RFC 5321 caveat | F-054 (varchar 30) | N/A | 별개 |
| 한국어 환경 caveat | N/A | F-055 (varchar 30) | 별개 |
| race window | F-058 | F-058 (공유) | - |
| Adapter 위반 | F-071 (공유) | F-071 (공유) | - |

→ **isomorphic 99% / 차이 메시지 결합 + 길이 제약 caveat**. 형식화 가치: Sprint 1 EMAIL 형식 명세를 USERNAME 으로 재사용 (~5분 작업 / lightweight 정합).

---

## 6. 신규 finding (Sprint 2)

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-091 | 자연어 BR-USER-USERNAME-UNIQUE-001 race_safety 항목 누락 (EMAIL 과 isomorphic 정책인데 명시 비대칭) | low | §1 |

---

## 7. 도식 참조

- 생애주기: [`../state-machines/User-Account.mermaid`](../state-machines/User-Account.mermaid) (Sprint 1, 갱신 불필요)
- 오케스트레이션: [`../sequence-diagrams/UC-USER-SIGNUP.mermaid`](../sequence-diagrams/UC-USER-SIGNUP.mermaid) (Sprint 1)
- 타입 제약: [`../invariants/User.ts`](../invariants/User.ts) `Username` 타입
