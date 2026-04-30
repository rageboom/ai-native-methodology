# BR-USER-EMAIL-NOT-BLANK-001 — Decision Table

> 일자: 2026-05-01 / O 묶음

| email 입력 | @IsNotEmpty | 결과 | HTTP |
|:---:|:---:|---|---|
| ❌ (blank) | trigger | 400 BadRequest | 400 |
| ✅ | pass | (다음 — @IsEmail) | — |

자연어 44% (4/9).
