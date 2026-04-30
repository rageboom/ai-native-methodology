# BR-ARTICLE-AUTHOR-AUTO-001 — Decision Table

> 일자: 2026-05-01 / O 묶음

`br_type: domain_invariant` — http_status / error_message 부재 의도.

| userId 유효 | findOne 결과 | 결과 |
|:---:|:---:|---|
| ✅ | user found | author 매핑 → article 저장 |
| ✅ | null (★ user 삭제됨 등) | ★ uncaught — Article.author = null FK 위반 (F-121 동형) |

자연어 33% (3/9 — lifecycle 영역).
