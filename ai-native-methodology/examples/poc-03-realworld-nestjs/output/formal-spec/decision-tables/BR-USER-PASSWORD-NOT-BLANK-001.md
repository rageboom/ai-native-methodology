# BR-USER-PASSWORD-NOT-BLANK-001 — Decision Table

> 일자: 2026-05-01 / O 묶음

| password 입력 | @IsNotEmpty | 결과 | HTTP |
|:---:|:---:|---|---|
| ❌ | trigger | "password should not be empty" | 400 |
| ✅ | pass | 다음 단계 | — |

자연어 44%.
