# Ubiquitous Language — PoC #02

> RealWorld 도메인 용어 정의 — PoC #01 22 용어 정합 + 본 PoC 신규 용어

---

| 용어                    | 영문                       | 정의                                                                                           | 비고                                                         |
| ----------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 글                      | Article                    | 사용자가 작성한 게시물. 제목/슬러그/본문/태그/즐겨찾기/댓글/생성·수정 시각 포함.               | Aggregate Root                                               |
| 댓글                    | ArticleComment             | 특정 Article 에 달리는 짧은 본문. 작성자(User) + 본문 + 생성 시각.                             | Aggregate Root (PoC #01 Comment 와 명명 차이)                |
| 사용자                  | User                       | RealWorld 가입자. email/username/password/bio/imageUrl + UUID id.                              | Aggregate Root                                               |
| 팔로우                  | Follow / UserFollow        | 단방향 관계 (asymmetric). UQ(follower, following). idempotent.                                 | small Aggregate                                              |
| 즐겨찾기                | Favorite / ArticleFavorite | User 가 Article 에 표시하는 좋아요. UQ(user, article).                                         | small Aggregate. **F-070 anti-pattern (RFC 7231 위반)**      |
| 태그                    | Tag                        | Article 자유 텍스트 라벨. name 자연키 PK.                                                      | small Aggregate. F-048 critical (TagJpaRepository 타입 오류) |
| 슬러그                  | Slug                       | Article 의 URL 친화 식별자. titleToSlug 자동 생성.                                             | F-053 8 함정                                                 |
| 사용자 등록 정보        | UserRegistry               | 회원가입 입력 (email/username/password) — Java record VO                                       | record + 생성자 검증                                         |
| 글 필터                 | ArticleFacets              | 글 조회 조건 (tag/author/favorited/page/size) — VO                                             | size 0~50 cap (PoC #01 부재 회피)                            |
| 글 상세                 | ArticleDetails             | Article + favoritesCount + favorited boolean — VO                                              | viewer 관점 계산                                             |
| 작성자                  | author                     | Article / ArticleComment 의 작성 User                                                          | isNotAuthor 검증 (F-027 비재현 ✅)                           |
| 인증                    | Authentication             | OAuth 2.0 Resource Server (JWT Bearer / RSA 비대칭)                                            | BC-AUTH cross-cutting                                        |
| 비밀번호 인코더         | PasswordEncoder            | core port + SecurityPasswordEncoderAdapter (api/config)                                        | Hexagonal port                                               |
| 단방향 follow           | Directional Follow         | A 가 B 를 follow 시 A 의 feed 에 B 의 글 노출. self-follow 금지 (F-074 부재)                   | RealWorld spec                                               |
| 멱등성                  | Idempotency                | follow/unfollow 정합 (RFC 7231) ↔ favorite/unfavorite **위반** (F-070)                         | RFC 7231 §4.2.2                                              |
| Hexagonal naming hybrid | -                          | Modular Monolith with Ports & Adapters Naming. Cockburn 4번 원칙 위배 (core 가 framework 의존) | Phase 3 라벨                                                 |
| Bounded Context         | BC                         | conceptual boundary. multi-module(physical) ≠ BC (Fowler)                                      | BC-CONTENT 단일 + BC-AUTH cross-cutting                      |
| Aggregate               | -                          | consistency boundary 의 진입점. transactional invariant 책임                                   | Vernon IDDD                                                  |
| Aggregate Root          | -                          | 외부 직접 참조 허용 entity                                                                     | User / Article / ArticleComment / Tag                        |
| Small Aggregate         | -                          | 1-2 entity / value 만 보유                                                                     | Vernon §10 권고                                              |
| Value Object            | VO                         | 값 자체로 구분. immutable. record 사용 권고                                                    | UserRegistry / ArticleFacets / ArticleDetails                |
| Use Case                | UC                         | Service public method 1:1 매핑                                                                 | 25 UC (Command 13 / Query 12)                                |
| Business Rule           | BR                         | 도메인 invariant. Given/When/Then 형식                                                         | 14 BR                                                        |

---

## PoC #02 vs PoC #01 신규 용어

- **Hexagonal naming hybrid** (Phase 3 라벨 — F-CASE-001/F-061)
- **Idempotency 비대칭** (F-070 — favorite/unfavorite vs follow/unfollow)
- **port-adapter 경계 misuse** (F-071 + F-072 — Adapter 가 도메인 책임 침범)
- **small Aggregate** (Vernon IDDD §10 — UserFollow / ArticleFavorite / ArticleTag)
- **slug 자동 파생** (Article.titleToSlug — F-053 8 함정)
