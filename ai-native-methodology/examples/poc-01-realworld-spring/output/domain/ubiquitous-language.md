# Ubiquitous Language — PoC #01 RealWorld

> 22 terms — `domain.json` `ubiquitous_language` 의 사람용 사전.
> 기획/QA/개발이 같은 단어를 같은 의미로 사용하기 위한 어휘.

---

## 핵심 도메인 객체

| 한국어 | English | 정의 | 동의어/오용 회피 |
|---|---|---|---|
| **글** | Article | 사용자가 작성한 게시물. 제목/슬러그/본문/태그/즐겨찾기/댓글/감사시각 포함. | post / Comment 와 다름 (Comment 는 Article 종속) |
| **댓글** | Comment | 특정 Article 에 달리는 짧은 본문. 자체 ID 보유. | Article 본문과 분리 |
| **사용자** | User | RealWorld 가입자. email/password/Profile + 팔로잉 + 즐겨찾기 + 작성 글/댓글 모두 보유. | Author/Profile 와 같지 않음 |
| **프로필** | Profile | User 의 표시 정보 묶음 (UserName + Image + bio) + viewer 관점 following 표시 (@Transient). | User 와 다름 — Profile 은 User 의 @Embedded VO |
| **태그** | Tag | Article 라벨. 자유 텍스트. ManyToMany. 같은 이름 재사용. | 카테고리(고정 enum)와 다름 |
| **슬러그** | Slug | Article URL 친화 식별자. 작성자별 unique. | ID(BIGSERIAL) 와 다름 — 자연어 식별자 |

## 관계

| 한국어 | English | 정의 | 회피 |
|---|---|---|---|
| **팔로우** | Follow | **단방향** — A 가 B 를 follow → A feed 에 B 글 노출. 양방향 friend 아님. | DRIFT-002 결정. self-follow 불가 (BR-USER-FOLLOW-NO-SELF-001) |
| **즐겨찾기** | Favorite | User 가 Article 에 표시하는 좋아요. | Follow 와 다름 (대상이 User 가 아닌 Article) |
| **피드** | Feed | 내가 follow 하는 사용자들의 Article 시간 역순 목록. | 전역 글 목록(global) 과 다름 |
| **전역 글 목록** | Global Articles | 전체 사용자 Article 시간 역순 — 옵션 필터 (tag/author/favorited). | Feed 와 다름 |

## 인증

| 한국어 | English | 정의 |
|---|---|---|
| **토큰** | JWT Token | `Authorization: Token <jwt>` 헤더. UserJWTPayload (id+email) 직렬화. HmacSHA256 + 2시간. STATELESS (session cookie 와 다름). |
| **비밀번호** | Password | BCrypt 해시. plain text 저장 금지. Password VO 가 BCryptPasswordEncoder.matches() 검증. |
| **이메일** | Email | 사용자 이메일 — User.equals/hashCode 식별자. RealWorld spec: unique. ⚠️ DRIFT-010 격상 — App+DB 양쪽 unique 부재. |
| **STATELESS** | Stateless API | 서버 세션 없음. JWT 가 인증 컨텍스트 전체 운반. csrf disable + formLogin disable. |
| **회원가입** | Sign Up | User + Email + Password + Profile 생성. email/username unique 의도 (구현 부재). |
| **로그인** | Login | email + password 검증 → JWT 발급. |

## 패턴 / 메타

| 한국어 | English | 정의 |
|---|---|---|
| **Aggregate Root** | Aggregate Root | 트랜잭션 일관성 단위 진입점. **User / Article / Tag** (+ 사실상 Article 일부인 Comment). Profile/Email 등 VO 는 Root 아님. |
| **VO** | Value Object | ID 없이 값으로 식별되는 불변 객체. `@Embeddable` 표현. 7개 (Email/Password/Profile/UserName/Image/ArticleContents/ArticleTitle). |
| **Bounded Context** | Bounded Context | 도메인 모델이 일관 의미를 갖는 경계. 본 시스템: **BC-CONTENT 단일 + BC-AUTH cross-cutting**. CIRCULAR-001 same_bc 결정. |
| **BC-CONTENT** | Content BC | User + Article + Comment + Tag 통합 BC. |
| **BC-AUTH** | Auth BC | JWT 발급/검증. 영속성 0. |
| **감사** | Auditing | @CreatedDate / @LastModifiedDate 자동 기록. JPA Auditing 활성화. Article + Comment 적용. |

---

## 용어 사용 가이드

### "Author" vs "User"

- 같은 사람이지만 컨텍스트에 따라 호칭이 다름:
  - User — 시스템 가입자 일반
  - Author — Article 또는 Comment 의 작성자 관점 (`Article.author = User`)
- 산출물에서는 **User** 단일 어휘 사용. Author 는 관계 호칭.

### "Profile" vs "User"

- Profile 은 User 의 일부 (`@Embedded`). 별도 Aggregate 아님.
- viewer 관점 `following: boolean` 은 `@Transient` — 영속성 없음, 조회 시 계산.

### "Favorite" vs "Like"

- 본 시스템에서는 **Favorite** 표준. Article 에 대한 사용자 표시. Like 라는 별도 개념 없음.
- DDD-Lite ADR-004: 같은 도메인에 두 어휘 혼용 금지.

### "Tag" vs "Category"

- 본 시스템은 **Tag** (자유 텍스트, 사용자 입력) — Category (고정 enum) 아님.
- TagService.reloadAllTagsIfAlreadyPresent — 같은 이름 Tag 중복 생성 회피 메커니즘.

---

## 누락 어휘 (F-031 후보 — implicit strategic)

ADR-004 strategic 4 항목 중 본 PoC 에서 implicit 발현된 것:

- **Shared Kernel** (User in BC-AUTH) — UserJWTPayload 가 User.id/email 의존 → 사실상 Shared Kernel.
- **Customer/Supplier** — BC-CONTENT 가 BC-AUTH 의 customer (JWT 토큰 소비).

이들은 v1.2.0 에서 strategic implicit 발현 가이드 (F-031) 격상 후보.
