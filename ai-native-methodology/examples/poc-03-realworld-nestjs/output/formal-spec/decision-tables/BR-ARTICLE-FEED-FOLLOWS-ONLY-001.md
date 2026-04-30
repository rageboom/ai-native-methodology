# BR-ARTICLE-FEED-FOLLOWS-ONLY-001 — Decision Table

> 일자: 2026-05-01 / O 묶음

| user.follows | 결과 | HTTP |
|:---:|---|---|
| [] (빈) | `{articles: [], articlesCount: 0}` | 200 |
| 존재 | follows 의 article 만 반환 (★ 검증 OK) | 200 |

자연어 44%.
