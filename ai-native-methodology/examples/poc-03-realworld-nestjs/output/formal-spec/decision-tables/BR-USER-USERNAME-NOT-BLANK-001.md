# BR-USER-USERNAME-NOT-BLANK-001 — Decision Table

> 일자: 2026-05-01 / Phase 4.5 풍부화 O 묶음 (잔여 BR)

## 1. 결정표

| username 입력 | @IsNotEmpty | 결과 | HTTP |
|:---:|:---:|---|---|
| ❌ (blank) | ✅ trigger | "username should not be empty" | 400 |
| ✅ | ✅ pass | (다음 단계 — duplicate check) | — |

**자연어 4 / 9 = 44%**.

## 2. cross-PoC

PoC #02 / PoC #03 동형 (Bean Validation / class-validator default 결과 동일). 학습 효과 ❌.
