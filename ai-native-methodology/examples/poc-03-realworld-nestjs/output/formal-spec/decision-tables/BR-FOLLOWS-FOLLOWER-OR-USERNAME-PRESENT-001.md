# BR-FOLLOWS-FOLLOWER-OR-USERNAME-PRESENT-001 — Decision Table

> 일자: 2026-05-01 / O 묶음

| follower null | username null | 결과 | HTTP |
|:---:|:---:|---|---|
| ✅ | * | "not provided" | 400 |
| ✅ | ✅ | "not provided" | 400 |
| ✅ | ❌ | "not provided" (★ ProfileController.follow 의 @User('email') 부재 시) | 400 |
| ❌ | ❌ | (다음 — self check) | — |

자연어 44%. ★ DTO 단독 validator 권고 (F-162 합산).
