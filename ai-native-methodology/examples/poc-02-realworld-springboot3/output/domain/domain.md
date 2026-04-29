# Domain Model — PoC #02 (Phase 4)

> 작성: 2026-04-29 / raw confidence: 0.83 (5.B/5.D 부재 패널티 — F-026 재현)

---

## 1. Bounded Context

| BC | 모듈 | 테이블 | Aggregate | 비고 |
|---|---|---|---|---|
| **BC-CONTENT** | core/model + core/service + persistence + api | users / article / article_comment / article_tag / article_favorite / tag / user_follow | User / Article / ArticleComment / Tag | PoC #01 정합 |
| **BC-AUTH** | api/config + api/mixin + core/model (PasswordEncoder port) | (없음) | (없음) | cross-cutting (JWT stateless) |

**Fowler / Evans 권위**: multi-module(physical) ≠ Bounded Context(conceptual). 양쪽 모듈 모두 동일 ubiquitous language 사용 → BC-CONTENT 단일 채택.

---

## 2. Aggregate (4 Root + 4 small Aggregate)

### 2.1 Aggregate Root (4)

#### User (BC-CONTENT)
- **id**: UUID v4 (Hibernate 6 GenerationType.UUID — Jakarta 3.1)
- **invariant**:
  - email unique (DB UQ + JPA `@Column unique=true` + App TOCTOU)
  - username unique (동일)
  - password BCrypt 강제 (encryptPassword)
- **도메인 메서드**: encryptPassword / setEmail/Username/Bio/ImageUrl / equalsEmail/Username / hasId
- **Anti-pattern**: F-071 (UserRepositoryAdapter Hexagonal 위반)

#### Article (BC-CONTENT)
- **id**: Integer Identity
- **invariant**:
  - slug unique (RealWorld spec)
  - title unique 글로벌 (F-052 over-constraint caveat)
  - author 만 수정/삭제 (isNotAuthor)
- **도메인 메서드**: addTag / setTitle (slug 자동 갱신) / titleToSlug
- **Anti-pattern**: F-051 (EAGER), F-053 (titleToSlug 8 함정), F-072 (Adapter delete orchestration), F-073 (CASCADE 부재)

#### ArticleComment (BC-CONTENT)
- **id**: Integer Identity
- **invariant**: author 만 삭제 (isNotAuthor)
- **PoC #01 비재현 ★**: AP-DOMAIN-001 (De Morgan removeCommentByUser) **비재현 — 깔끔**

#### Tag (small Reference Aggregate)
- **id**: String name (자연키 PK varchar(20))
- **invariant**: setter 부재 → immutable (안전)
- **Anti-pattern**: F-048 critical (TagJpaRepository<Tag, Integer> 타입 오류)

### 2.2 Small Aggregate (Vernon IDDD §10 정합)

- **UserFollow**: UQ(follower, following). 단방향. **F-074 self-follow 부재**
- **ArticleFavorite**: UQ(user, article). **F-070 RFC 7231 위반 (high)**
- **ArticleTag**: UQ(article_id, tag_name). explicit junction entity (Vlad 권장 ✅)

### 2.3 Value Object (Java 21 record)

- **UserRegistry**: email/username/password + 생성자 검증
- **ArticleFacets**: tag/author/favorited/page/size + size 0~50 cap (PoC #01 부재 회피 ★)
- **ArticleDetails**: Article + favoritesCount + favorited (viewer 관점)

---

## 3. Use Cases (25 UC — Command 13 + Query 12)

자세한 내용 `use-cases.md` 참조.

---

## 4. Business Rules (14 BR)

자세한 내용 `../rules/rules.md` 참조.

---

## 5. PoC #01 비교

### 5.1 개선 ✅
- AP-DOMAIN-001 (De Morgan) **비재현** — ArticleCommentService.delete 깔끔
- F-027 (BR ≠ actual_behavior) **비재현**
- F-028 (User equals/hashCode mutable email) **비재현** — getId UUID 의존
- AP-PERFORMANCE-002 (Pageable cap) **회피** — ArticleFacets:21 size cap 50
- Hexagonal naming hybrid 도입 (PoC #01 Layered+DDD-Lite)

### 5.2 새 안티패턴 (regression)
- **F-070 high** — favorite/unfavorite RFC 7231 §4.2.2 위반 (PoC #01 미발견)
- **F-071 high** — UserRepositoryAdapter Hexagonal port-adapter 경계 위반 (Hexagonal 도입 부산물)
- **F-072 medium** — ArticleRepositoryAdapter multi-aggregate delete orchestration
- **F-052 high** — article.title unique over-constraint (Phase 2)
- **F-074 medium** — self-follow 금지 부재

→ "단순 진화 아님" — Hexagonal 도입과 함께 새 anti-pattern 등장.

---

## 6. 신뢰도 자평

```yaml
raw_confidence: 0.83
- base 0.80
- inputs: source_code + orm + inventory + db_schema + architecture
- modifier: orm_full +0.10
- penalty: no_fe_layer -0.03 / no_external_deps -0.03 (F-026 재현)
- subtotal 0.84 → weighted 0.83
```

**Phase 4 5.B FE 부재 + 5.D 외부 0건** — F-026 (PoC #01 promoted) 재현. 사내 적용 시 5.D 별도 검증 필수.

---

## 7. 다음 단계

- Phase 5-1 (API) 진입 — 22 endpoint × 25 UC 매핑
- 또는 PoC #03 (다른 stack/도메인) 분기 결정 (윤주스)

**END Domain (Phase 4)**
