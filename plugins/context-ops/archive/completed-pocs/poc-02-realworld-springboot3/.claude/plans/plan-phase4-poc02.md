# Plan — PoC #02 Phase 4 (비즈니스 로직 — 4영역 병렬)

> 작성: 2026-04-29
> 작성자: Claude (메인) — 4원칙 1원칙
> 대상 레포: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
> Phase 1/2/3 인계 누적: 신뢰도 0.93/0.85/0.92 / finding 26건 (F-042~F-067)
> **가벼운 sub-agent 전략** — Phase 3 Senior 30+분 교훈으로 prompt 단순화

---

## 0. 진입 컨텍스트

### 인계 핵심

- **BC 후보 3개**: BC-CONTENT (5 테이블) / BC-USER (2 테이블) / BC-AUTH (cross-cutting)
- **Aggregate 후보 4개**: User / Article / Tag / ArticleComment
- **Phase 4 합산 finding**: F-048 (TagJpaRepository) / F-051 (EAGER) / F-052 (title unique) / F-053 (titleToSlug) / F-058 (TOCTOU)
- 외부 의존성 0건 / FE 부재 → 5.B + 5.D 빈약 (PoC #01 F-026 재현)

### Auto Mode + 가벼운 전략

- Phase 3 Senior 30+ 분 교훈 → Phase 4 sub-agent prompt 단순화
- **메인 직접 추출 우세 전략** (UC + BR + AP candidate 결정적 영역)
- sub-agent = 검증 + Senior 정정 + Case 사례 합산 (가벼운 역할)

---

## 1. 작업 범위 (Phase 4 명세 §3 — 4영역 병렬)

| 영역            | 본 PoC                                                       | 비중 | 추출 방법                 |
| --------------- | ------------------------------------------------------------ | ---- | ------------------------- |
| **5.A DB 영역** | 핵심 (5 @Service 22 UC + 7 @Entity 도메인 메서드 + ORM 제약) | 80%  | 메인 직접 (deterministic) |
| 5.B FE 영역     | 부재 (BE only)                                               | 0%   | F-026 caveat              |
| 5.C 설정 영역   | 빈약 (application.yaml ~10 lines + JWT RSA + ddl-auto)       | 10%  | 메인 직접                 |
| 5.D 외부 의존성 | 0건 (HTTP/MQ/SDK 부재)                                       | 0%   | F-026 caveat              |

### 비대칭성 = PoC #01 동일 — F-026 (5.B/5.D 부재 패널티) 재현

---

## 2. 메인 사전 raw fetch 완료 ( 8건 핵심 발견)

### 2.1 Use Case 추출 — 25 UC (5 Service public method 1:1)

| Service                 | Command                                     | Query                    | 합계   |
| ----------------------- | ------------------------------------------- | ------------------------ | ------ |
| ArticleService          | 6 (write/edit×3/delete/favorite/unfavorite) | 7 (get×7)                | 13     |
| UserService             | 3 (signup/login/updateUserDetails)          | 2 (getUser×2)            | 5      |
| UserRelationshipService | 2 (follow/unfollow)                         | 1 (isFollowing)          | 3      |
| ArticleCommentService   | 2 (write/delete)                            | 2 (getComment×2)         | 4      |
| TagService              | 0                                           | 1 (getAllTags)           | 1      |
| **합계**                | **13**                                      | **13 (isFavorite 포함)** | **25** |

→ **PoC #01 25 UC 와 정합**.

### 2.2 도메인 행동 (Rich Domain Model 정합)

- User: `encryptPassword` / `setEmail/Username/Bio/ImageUrl` (mutable getter) / `equalsEmail/Username` / `hasId`
- Article: `addTag` / `setTitle` (slug 자동 갱신) / `setDescription` / `setContent` / `isNotAuthor` / `titleToSlug`
- ArticleComment: `isNotAuthor`
- UserFollow / ArticleFavorite / Tag / ArticleTag: 생성자 검증 (Rich)

### 2.3 비즈니스 규칙 (BR) 후보 — 14건

| ID                                 | 제목                                                   | 출처                                   | severity                  |
| ---------------------------------- | ------------------------------------------------------ | -------------------------------------- | ------------------------- |
| BR-USER-EMAIL-UNIQUE               | DB unique + JPA + App TOCTOU (race-safe DB UQ 1중)     | User.email schema + Service.signup     | high                      |
| BR-USER-USERNAME-UNIQUE            | 동일                                                   | User.username schema + Service.signup  | high                      |
| BR-USER-PASSWORD-ENCRYPTED         | encryptPassword 강제 (BCrypt)                          | User.encryptPassword                   | high                      |
| BR-USER-FOLLOW-DIRECTIONAL         | 단방향 (follower → following), UQ(follower, following) | UserFollow + Service.follow            | medium                    |
| BR-USER-FOLLOW-IDEMPOTENT          | follow/unfollow 이미 상태면 silent return              | UserRelationshipService:26-39          | low                       |
| BR-USER-FOLLOW-NO-SELF             | self-follow 금지 (RealWorld 묵시 / 코드 부재)          | (기능 부재 — caveat)                   | medium                    |
| BR-ARTICLE-TITLE-UNIQUE            | 글로벌 unique (F-052 over-constraint)                  | Article.title schema + write/editTitle | high (caveat)             |
| BR-ARTICLE-SLUG-UNIQUE             | 글로벌 unique (RealWorld spec)                         | Article.slug schema                    | medium                    |
| BR-ARTICLE-AUTHOR-EDIT-ONLY        | isNotAuthor 검증 — edit/delete                         | Article.isNotAuthor / Service          | high                      |
| BR-ARTICLE-FAVORITE-NON-IDEMPOTENT | 이미 favorite 시 IllegalArgumentException              | ArticleService:184-204                 | medium (PF-P4-001 비대칭) |
| BR-COMMENT-AUTHOR-DELETE-ONLY      | isNotAuthor 검증 (PoC #01 De Morgan 버그 비재현)       | ArticleCommentService:58               | high                      |
| BR-LOGIN-EMAIL-PASSWORD-MATCH      | findByEmail + passwordEncoder.matches                  | UserService.login                      | high                      |
| BR-PAGINATION-SIZE-CAP-50          | size 0~50 cap                                          | ArticleFacets:21                       | medium                    |
| BR-PAGINATION-PAGE-ZERO-BASED      | 0-based                                                | ArticleFacets:14                       | low                       |

### 2.4 신규 finding 후보 (Phase 4)

| 임시 ID        | 제목                                                                                                                               | severity 1차 | 출처                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------- |
| **PF-P4-001 ** | **Article favorite/unfavorite IllegalArgumentException vs follow/unfollow idempotent** — **API 의미 비대칭**                       | medium       | ArticleService:184-204 vs UserRelationshipService:26-39 |
| PF-P4-002      | UserRepositoryAdapter.updateUserDetails 가 race-prone TOCTOU 검증 — **도메인 검증이 infrastructure 에 위치** (Hexagonal violation) | medium       | UserRepositoryAdapter:67-72                             |
| PF-P4-003      | Article.setTitle 호출 시 titleUnique 재검증 부재 (editTitle 에서만) — race condition                                               | low          | Article.setTitle                                        |
| PF-P4-004      | UserRegistry record + User 생성자 양쪽 검증 — defensive redundancy                                                                 | low          | UserRegistry + User constructor                         |
| PF-P4-005      | Article delete 시 article_comment / article_favorite / article_tag CASCADE 부재 + Service deleteByArticle 부분 처리                | medium       | ArticleRepositoryAdapter:91-95                          |
| PF-P4-006      | self-follow 금지 코드 부재 (RealWorld 묵시) — Profile.follow 검증 없음                                                             | medium       | UserRelationshipService:25-32                           |

### 2.5 PoC #01 finding 본 환경 검증 (Phase 4 영역)

| PoC #01 ID                                          | 1차 결론                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| **AP-DOMAIN-001** (De Morgan `removeCommentByUser`) | ❌ **비재현** — ArticleCommentService.delete 가 단순 isNotAuthor (깔끔) |
| **AP-DOMAIN-002** (email/username unique 3중 부재)  | (Phase 2 검증) ❌ 비재현 — race-safe DB UQ + race-prone TOCTOU          |
| **F-017** (@ManyToMany)                             | (Phase 2) best practice 사례                                            |
| **F-052** (article.title unique)                    | (Phase 2 신규 — 본 phase 도메인 의미 검증)                              |
| **F-053** (titleToSlug 8 함정)                      | (Phase 2 신규 — 본 phase 도메인 메서드 분석)                            |
| **F-058** (TOCTOU race-prone)                       | (Phase 2 신규 — 본 phase 추가 발견 PF-P4-002)                           |
| **F-027** (BR ≠ actual_behavior)                    | ❌ **비재현** — 본 PoC 깔끔한 ArticleCommentService                     |
| **AP-PERFORMANCE-001 (EAGER)**                      | (Phase 6 합산 — F-051 격상)                                             |
| **AP-PERFORMANCE-002 (Pageable cap)**               | ✅ **재현 + 회피** — ArticleFacets:21 size cap 50 명시 (PoC #01 부재)   |

---

## 3. 변경 대상 (Phase 4 산출 7~8 파일)

```
ai-native-methodology/examples/poc-02-realworld-springboot3/output/
├── domain/                            # 도메인 모델
│   ├── domain.json                    # 신규 (domain.schema.json 정합)
│   ├── domain.md                      # 신규
│   ├── domain.mermaid                 # 신규 (classDiagram)
│   ├── use-cases.md                   # 신규 (25 UC)
│   ├── ubiquitous-language.md         # 신규
│   └── _manifest.yml                  # 신규
├── rules/                             # 비즈니스 규칙
│   ├── rules.json                     # 신규 (14 BR + 사용자 결정 사항)
│   ├── rules.md                       # 신규
│   └── _manifest.yml                  # 신규
└── antipatterns-partial/              # 안티패턴 부분
    ├── antipatterns-partial.json      # 신규 (Phase 6 합산 대비)
    └── _manifest.yml                  # 신규
```

---

## 4. sub-agent 리서치 토픽 (가벼운 전략)

### 4.1 핵심 결정 — sub-agent 호출 최소화

Phase 4 = 결정적 영역 (Service 1:1 = UC). 메인 직접 추출 가능. sub-agent 는 검증 + 권위 보강 만.

### 4.2 Document Researcher (가벼움 — 약 200 줄 목표)

- DDD-Lite Aggregate 정의 (Vernon IDDD)
- Bounded Context 정합성 (BC-CONTENT 단일 vs BC-CONTENT/BC-USER 분리)
- BR Given/When/Then 형식 표준
- Hexagonal Service vs Adapter 검증 위치 (PF-P4-002 권위)
- favorite vs follow idempotency 일반 패턴 (PF-P4-001 권위)

### 4.3 Senior BE (가벼움 — 약 300 줄 목표 / 시간 cap 10분)

- 메인 1차 추정 8건 cross-check (직접 read 우선순위 — UserRepositoryAdapter / ArticleService.write/editTitle / ArticleCommentService.delete)
- Phase 4 신규 6 candidate severity 권고
- self-follow 금지 / favorite idempotent 비대칭 의도 평가

### 4.4 Case 생략 (선택적 — 시간 절약)

Case 영역의 한국 사례는 Phase 1/2/3 에서 충분 누적. Phase 4 별도 Case 호출 불필요.

---

## 5. 영향도 / 리스크 / Caveat

### 5.1 영향도

| 영역               | 영향                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Phase 5-1 (API)    | 22 endpoint UC 매핑 입력                                                                                   |
| Phase 6 (안티패턴) | F-051 EAGER + PF-P4-001 비대칭 + PF-P4-002 Hexagonal 위반 + PF-P4-005 CASCADE + PF-P4-006 self-follow 합산 |
| 방법론 본체        | F-026 (5.B/5.D 부재 패널티) PoC #02 재현 검증 데이터 / F-027 (BR ≠ actual) 비재현 안정성                   |

### 5.2 리스크

- 메인 직접 추출 함정 (F-044/F-048 패턴) — Senior 검증 필수
- 5.B/5.D 빈약 → 신뢰도 패널티 (PoC #01 0.83 정합)
- F-052 (title unique) 의 도메인 의미 결정 — 사용자 결정 영역

### 5.3 Caveat

- 본 phase 신뢰도 0.80~0.85 예상 (LLM 의존도 높음)
- 5.B/5.D 0건 명시 (caveat)

---

## 6. 산출물 체크리스트

- [ ] domain.json schema 검증 (domain.schema.json)
- [ ] rules.json schema 검증 (rules.schema.json)
- [ ] 4영역 모두 추출 시도 (5.B / 5.D 0건 caveat)
- [ ] 도메인 모델 classDiagram 렌더링
- [ ] Use Case ↔ Entity 매핑 일관성 (25 UC)
- [ ] 비즈니스 규칙 Given/When/Then 형식 (14 BR)
- [ ] human_review_required 항목 사용자 검토 (F-052 도메인 의미 / PF-P4-006 self-follow)
- [ ] 안티패턴 부분 목록 (antipatterns-partial.json)
- [ ] PROGRESS-poc02-phase4.md 시간순 로그

---

## 7. 다음 단계 (4원칙 사이클)

1. ✅ 1원칙 — 본 plan 완성
2. ⏳ 2원칙 — Document + Senior sub-agent 가벼운 spawn (Case 생략)
3. ⏳ 3원칙 — 사용자 승인 (1회)
4. ⏳ 4원칙 — 4단계 산출 + finding 등록
5. ⏳ Phase 4 마감 → Phase 5-1 (API) 인계

---

## 8. 참조

- 명세: `methodology-spec/workflow/phase-4-비즈니스로직.md`
- 스키마: `schemas/domain.schema.json` + `rules.schema.json` + `antipatterns.schema.json`
- 선행 PoC #01 산출: `examples/poc-01-realworld-spring/output/{domain,rules,antipatterns-partial}/`
- Phase 1/2/3 인계: `output/{inventory,db,architecture}/_manifest.yml`
- 누적 finding: `findings/poc-findings.md` (F-042~F-067)
- ADR-006 (CIRCULAR default 정책)

---

**END OF plan-phase4-poc02.md**
