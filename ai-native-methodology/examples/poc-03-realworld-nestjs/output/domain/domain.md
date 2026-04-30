# 도메인 모델 보고서 — PoC #03 NestJS Phase 4 (5.B)

> raw confidence 0.83 / DDD-Lite (B 강도 — ADR-004)

---

## 1. 핵심 요약

- **3 BC** (BC-USER / BC-CONTENT / BC-PROFILE)
- **5 Aggregate Root 후보** (User / Article / Comment_sub / Tag_dead? / Follows_semantic_모호)
- **20 Use Case** — 단 missing endpoint 3건 (password change / logout / tag create)
- **★★ F-140 신규 critical** — UC-USER-DELETE AuthMiddleware 미적용 (무차별 삭제 가능)

---

## 2. Aggregate Root 분석

### 2.1 User (BC-USER) — 핵심 Aggregate

- 6 column + 2 relation (favorites ManyToMany / articles OneToMany)
- lifecycle: anonymous → registered → authenticated (★ logout endpoint 부재)
- behaviors 7개 (signup / login / update / delete / findById / findByEmail / generateJWT)
- ★★ F-140 — DELETE /users/:slug 는 AuthMiddleware 미적용 → **무차별 삭제 critical**

### 2.2 Article (BC-CONTENT) — 가장 복잡

- 10 column + 3 relation
- lifecycle: 명시 단순 (저장 즉시 published — draft / archived 부재)
- behaviors 9개 (create / update / delete / findAll / findFeed / findOne / favorite / unFavorite / addComment / deleteComment / findComments)
- ★ F-126 — Update 시 slug 미업데이트 (TODO 명시)
- ★ F-124 / F-125 / F-135

### 2.3 Comment (sub of Article)

- 약한 Aggregate (Article 의 Article.comments OneToMany)
- ★ F-134 — @Entity() default 비일관

### 2.4 Tag (★ dead 의문)

- TagService.findAll 만 존재 / insert 코드 부재 / Aggregate Root 분류 ❌
- Phase 4 결정: **F-139 신규 medium** — Tag dead code 또는 미완성 기능 / Phase 6 격상 시 critical 후보

### 2.5 Follows (BC-PROFILE)

- ★ F-121 FK 부재 / ★ F-138 위치 모호
- 약한 Aggregate (id 기반 lookup 만)
- self-follow 차단 service 단 (email==email vs id==id 분리 — 일관성 결여)

---

## 3. Use Case 매핑 (20 UC)

(domain.json §use_cases 참조)

### ★ guard / endpoint 결함

| UC | 결함 | severity |
|---|---|---|
| **UC-USER-DELETE** | **★★ AuthMiddleware 미적용 — 무차별 삭제 가능** | **F-140 critical 신규** |
| UC-USER-PASSWORD-CHANGE | endpoint 부재 | F-141 medium 신규 |
| UC-USER-LOGOUT | endpoint 부재 (JWT stateless) | F-142 low 신규 |
| UC-TAG-CREATE | endpoint 부재 (F-122 dead 와 합산) | F-122 |

---

## 4. cross-validation (PoC #02 ↔ PoC #03)

### 4.1 Aggregate Root 매핑 비교

| PoC #02 (4 AR) | PoC #03 (5 AR 후보) | 분류 |
|---|---|---|
| User | User | 동일 |
| Article | Article | 동일 |
| Comment | Comment_sub | 동일 (sub aggregate) |
| Tag | **Tag_dead?** | ★ PoC #03 신규 발견 — F-139 |
| (PoC #02 = 4) | Follows_semantic_모호 | ★ PoC #03 신규 — F-138 |

→ Aggregate 추출 알고리즘 = stack 무관 본질. 단 PoC #03 의 dead/모호 **신규 패턴**.

### 4.2 BR 빈약성 (★ Senior 위험 3 정합)

| 출처 | PoC #02 (Bean Validation) | PoC #03 (class-validator) |
|---|---|---|
| Entity 데코 | 풍부 (12+ entity 데코) | 1개 (UserEntity.@IsEmail) |
| DTO 데코 | 풍부 (Java DTO + entity 양쪽) | 6개 (CreateUserDto / LoginUserDto 만) |
| service manual throw | 보조 | **주요 source** ★ |

→ ★★ Senior 위험 3 정합 + 더 악화 — class-validator coverage 12% (Phase 1 F-128). **Phase 4 BR 추출 시 service.ts manual throw 가 주요 source**. rules.json L0 자연어 빈약성 PoC #02 대비 **30%+ 더 악화 예상** (Senior 추정 일치).

---

## 5. Phase 4 신규 finding (4건)

| finding | severity | 영역 |
|---|---|---|
| **F-140 critical 신규** ★★ | critical | UC-USER-DELETE AuthMiddleware 미적용 — 무차별 삭제 |
| **F-141 medium** | medium | password change endpoint 부재 (UpdateUserDto 에 password 필드 X) |
| **F-142 low** | low | logout endpoint 부재 (JWT stateless 만) |
| **F-139 medium** | medium | Tag Aggregate dead 의문 — Phase 6 격상 후보 |

---

## 6. Phase 4.5 진입 후보

| 영역 | 추출 후보 |
|---|---|
| state-machine | User-Account / Article (draft 부재 — published 단일?) / Follows |
| sequence | UC-USER-SIGNUP / UC-USER-LOGIN / UC-USER-DELETE (★ guard 부재) / UC-PROFILE-FOLLOW / UC-ARTICLE-CREATE / UC-ARTICLE-FAVORITE |
| decision-table | BR-USER-USERNAME-UNIQUE / BR-USER-EMAIL-UNIQUE / BR-USER-PASSWORD-FORMAT / BR-FOLLOWS-NO-SELF / BR-FOLLOWS-PAIR-UNIQUE / BR-ARTICLE-SLUG-UNIQUE / BR-FAVORITE-IDEMPOTENT |
| invariants | User Refinement / Article Refinement / Follows Refinement |
| property-test | (★ test suite 부재 — 신규 작성 의무) |

---

## 7. 다음 phase 인계

- Phase 4.5 진입 시 BR 5+개 형식화 (PoC #02 5건 정합) — class-validator + service manual throw 양쪽
- ★ Senior 위험 3 (DTO 단독) 검증 — service.ts manual throw 양쪽 의무
- ★★ F-140 critical 즉시 수정 권고 (사내 적용 시 1줄 fix — `user.module.ts` 의 forRoutes 에 DELETE 추가)
- Phase 5-1 진입 시 swagger 데코레이터 정적 추출 + 런타임 dump 2-way diff (DEC-PoC03-N5)
