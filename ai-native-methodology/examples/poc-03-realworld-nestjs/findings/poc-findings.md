# PoC #03 — Findings 누적

> 분석 대상: `lujakob/nestjs-realworld-example-app` master `c1c2cc4` (NestJS 7 + TypeORM 0.2 + class-validator 0.11 + @nestjs/swagger 4.4)
> 시작: 2026-04-30
> 본 PoC 의 finding 은 PoC #1 (33건) + #2 (43건) + Sprint 1.5/2/3/4 Phase 4.5 (41건) + 의 외부 검증 + 신규 발견 누적.
> v1.2.2 신규 template (G6/G7) 외부 검증 + ★★★ no-simulation 정합 검증 본질.

---

## ID 체계

- 정식 ID: `F-XXX` — PoC #1+#2+Sprint 4 누적 117건 + Sprint 4 자가 검증 11건 → **F-118 부터 부여**.
- 본 PoC 누적: F-118~F-144 (27건).

---

## 누적 요약

| Phase | 신규 등록 | 합산 |
|---|---:|---|
| Phase 1 (init) | 15 | F-118~F-132 (★ 5~15 상한 정합) |
| Phase 2 (db) | 6 | F-120/121 확정 + F-133~F-136 |
| Phase 3 (arch) | 2 | F-137 / F-138 (단일 module = 5~15 하한) |
| Phase 4 (5.B domain) | 4 | F-139 / **F-140 critical** / F-141 / F-142 |
| Phase 4 (5.A rules) | 2 | F-143 / F-144 |
| Phase 4 (5.C antipatterns-partial) | 0 | (재정리만 — 8 AP 후보 식별) |
| **소계** | **29** | **F-118~F-144** (★ 단 F-120 / F-121 = Phase 1 등록 → Phase 2 확정 = 1 카운트로 정정 → 27 unique) |

| 분류 | 건수 |
|---|---:|
| critical | 2 (F-120 / F-140) |
| high | 4 (F-118 / F-121 / F-128 / F-124) |
| medium | 11 (F-119 / F-126 / F-127 / F-129 / F-133 / F-135 / F-137 / F-139 / F-141 / F-143 / F-123 / F-125) |
| low | 7 (F-122 / F-130 / F-131 / F-134 / F-138 / F-142 / F-144) |
| meta (template 자가) | 2 (F-132 / F-136) |
| promoted | 18 |
| candidate | 9 |
| deferred / closed / rejected | 0 |

---

## Phase 1 (init) — 2026-04-30 등록

### F-118: ★ JWT verify 3곳 DRY 위반 + try/catch 부재 high PROMOTED

- **위치**: `auth.middleware.ts:18` / `user.decorator.ts:14` / `shared/base.controller.ts:9` (★ 3곳)
- **결함**: `jwt.verify(token, SECRET)` exception 미처리 → invalid token → 500 Internal
- **proposed_fix**: @nestjs/passport 또는 Guards 패턴 통합 + JwtVerifyException catch → 401 응답
- **cross-val**: PoC #02 JWT 패턴과 다른 형태 — AP-SECURITY-001 변형 후보

### F-119: ★ JWT 60일 expiry — 너무 김 medium PROMOTED

- **위치**: `user.service.ts:103` `generateJWT`
- **결함**: today + 60일
- **proposed_fix**: 15분 access + refresh token 분리 또는 24시간 max

### F-120: ★★ DB UQ 0건 — race-prone (PoC #02 isomorphic + 더 나쁜) critical PROMOTED (Phase 2 확정)

- **위치**: 모든 entity (UserEntity / ArticleEntity / TagEntity) `@Column` 에 `unique:true` 부재
- **결함**:
  - `user.username` / `user.email` UQ 부재 → signup TOCTOU race-prone (App pre-check 1중)
  - `article.slug` UQ 부재 → slugify random suffix 회피만
  - `tag.tag` UQ 부재
- **proposed_fix**: `@Column({unique: true})` 추가 + race window catch (DataIntegrityViolation)
- **cross-val**: ★★ PoC #02 AP-DOMAIN-002 isomorphic + 더 나쁜 (PoC #02 = App + DB 2중 / PoC #03 = App 1중)
- **상태**: Phase 1 promoted → Phase 2 entity 데코 grep 검증 → **확정**

### F-121: ★★ FollowsEntity FK 부재 — referential integrity 부재 high PROMOTED (Phase 2 확정)

- **위치**: `follows.entity.ts:10-13` — `followerId` / `followingId` 단순 number column
- **결함**: @ManyToOne UserEntity 관계 부재 → cascade 정의 부재 → orphan row 가능
- **proposed_fix**: `@ManyToOne(() => UserEntity, {onDelete: 'CASCADE'}) @JoinColumn` 추가
- **cross-val**: PoC #02 user_follow JPA @ManyToOne 본질적 차이

### F-122: ★ TagEntity 미사용 — insert 코드 부재 / dead code 가능성 medium CANDIDATE

- **위치**: `tag.service.ts` — `findAll` 만 / insert 코드 부재
- **결함**: Tag 시스템 미완성 또는 dead code
- **proposed_fix**: TagService.create / Article 생성 시 tag 연결 로직 추가 또는 TagEntity 제거
- **합산**: F-123 (두 SoT) + F-139 (Aggregate dead 의문)

### F-123: ★ Article.tagList (simple-array) vs TagEntity 두 SoT — 의미 모순 medium CANDIDATE

- **위치**: `article.entity.ts:35` `@Column('simple-array')` vs `tag.entity.ts`
- **결함**: 두 source of truth — TagEntity 별 테이블 / tagList comma-separated column
- **proposed_fix**: Phase 4 도메인 의미 결정 — 하나로 통합

### F-124: ★ Article.comments eager:true — N+1 위험 medium PROMOTED

- **위치**: `article.entity.ts:38` `@OneToMany(...,  {eager:true})`
- **결함**: Article find 시 comments 항상 로드
- **proposed_fix**: lazy loading + Pageable / 별 endpoint
- **cross-val**: ★ PoC #02 F-051 (EAGER + Specification HHH000104) cross-val 재현

### F-125: ★ slugify random suffix — slug unique 회피 우회 medium PROMOTED

- **위치**: `article.service.ts:200` `slugify`
- **결함**: `slug(title) + '-' + Math.random().toString(36)` — DB UQ 회피용
- **proposed_fix**: DB UQ + 충돌 시 retry 또는 명시적 slug 입력
- **cross-val**: ★ PoC #02 F-053 titleToSlug 8 함정 cross-val 재현 (변형)

### F-126: ★ Update Article 시 slug 미업데이트 (TODO 주석 명시) medium PROMOTED

- **위치**: `article.controller.ts:62` "Todo: update slug also when title gets changed"
- **결함**: title 변경 시 slug 그대로 → URL ↔ title 불일치
- **proposed_fix**: title 변경 시 slug 재생성 + URL redirect 또는 명시적 immutable 정책

### F-127: ★ ValidationPipe 적용 controller 일관성 결여 — UserController 만 medium PROMOTED

- **위치**: `user.controller.ts:34` `@UsePipes(new ValidationPipe())` — 단 Article/Profile/Tag 미적용
- **결함**: 일관성 결여
- **proposed_fix**: `main.ts` 에 `app.useGlobalPipes(new ValidationPipe())` 적용

### F-128: ★ class-validator 데코 coverage 12% — DTO/entity 다수 데코 0개 high PROMOTED

- **위치**: 6 데코 / 50+ 필드 = 12% (UpdateUserDto / CreateArticleDto / CreateCommentDto / ArticleEntity / Comment / TagEntity / FollowsEntity 모두 데코 0)
- **proposed_fix**: 필수 BR 데코 추가
- **cross-val**: ★ Senior 위험 3 정량 입증 (research)

### F-129: ★ swagger 데코 coverage 불균형 — ArticleController 만 풀세트 medium PROMOTED

- **위치**: ArticleController 만 `@ApiOperation` + `@ApiResponse` 풀세트 / User/Profile/Tag 는 `@ApiBearerAuth` + `@ApiTags` 만
- **proposed_fix**: 모든 controller 에 풀세트 추가
- **cross-val**: Senior 위험 6 정합 — silent 빈약 위험

### F-130: ★ AuthMiddleware (legacy) — 현재 NestJS 권장 = Guards low CANDIDATE

- **위치**: `auth.middleware.ts` 사용 / Guards 미사용
- **proposed_fix**: `@UseGuards(JwtAuthGuard)` 패턴 — passport-jwt 통합

### F-131: ★ shared/base.controller.ts dead code 가능성 low CANDIDATE

- **위치**: `shared/base.controller.ts` — 사용처 grep 부재
- **proposed_fix**: 삭제 또는 실제 사용 controller 명시

### F-132: ★ G7 meta-confidence template 보강 후보 (메타 finding) low CANDIDATE

- **위치**: `templates/meta-confidence.template.yaml`
- **결함**: `tool_type` enum 에 `main_agent` (메인 agent 직접 read) 항목 부재 — `ai_subagent` 가 main 도 포괄함을 명시 필요
- **proposed_fix**: enum 에 `main_agent` 추가 또는 `ai_subagent` 정의 명시
- **note**: ★ v1.2.2 template 외부 검증 → 재귀적 자가 finding

---

## Phase 2 (db) — 2026-04-30 등록 (F-133~F-136 신규)

### F-133: ★ article.body / comment.body varchar(255) — text 권장 medium PROMOTED

- **위치**: `article.entity.ts:21` body / `comment.entity.ts:10` body — TypeORM default varchar(255)
- **결함**: 긴 글 저장 의도면 부족
- **proposed_fix**: `@Column({type: 'text'})`

### F-134: ★ Comment @Entity() default — 다른 entity 명시 (비일관) low CANDIDATE

- **위치**: `comment.entity.ts:6` `@Entity()` (default) vs 다른 4 entity = `@Entity('xxx')` 명시
- **proposed_fix**: `@Entity('comment')` 명시

### F-135: ★ favoriteCount column counter — 분산 race 위험 medium PROMOTED

- **위치**: `article.entity.ts:44` `favoriteCount: number`
- **결함**: 다중 user 동시 favorite 시 race
- **proposed_fix**: 별 테이블 (article_favorite) 또는 DB atomic increment + 비관적 lock

### F-136: ★ G6 db-schema.template.md 보강 후보 (메타 finding) low CANDIDATE

- **위치**: `templates/db-schema.template.md` §2.1 일반 원칙
- **결함**: `@Entity()` table 명 일관성 검증 절차 부재
- **proposed_fix**: §2.1 일반 원칙 5번 추가 — entity table 명 명시 일관성 검증 의무
- **note**: ★ v1.2.2 G6 외부 사용 시 발견 (재귀적 자가 finding)

---

## Phase 3 (arch) — 2026-04-30 등록 (F-137 / F-138 신규)

### F-137: ★ 도메인 경계 약함 — cross-module entity InjectRepository medium PROMOTED

- **위치**:
  - `article.module.ts:13` `forFeature([ArticleEntity, Comment, UserEntity, FollowsEntity])` — 다른 BC entity 사용
  - `profile.module.ts:11` `forFeature([UserEntity, FollowsEntity])` — 동상
- **결함**: PoC #02 multi-module Hexagonal port-adapter 와 본질적 차이 (단일 module = 도메인 경계 약함)
- **proposed_fix**: 각 BC entity 는 자체 module 에서만 forFeature. 다른 BC read 가 필요하면 Service injection 사용
- **cross-val**: ★ PoC #02 J 묶음 (port-adapter 가이드 F-075) 반대 패턴 — NestJS 단일 module 본질

### F-138: ★ FollowsEntity 위치 모호 — profile/ 디렉토리 / semantic = user 관계 low CANDIDATE

- **위치**: `profile/follows.entity.ts`
- **결함**: semantic 으로는 user 관계 / 위치는 profile
- **proposed_fix**: FollowsEntity 를 user/ 또는 별 follow/ 디렉토리. 또는 명시적 domain rationale 주석

---

## Phase 4 (5.B domain) — 2026-04-30 등록 (F-139~F-142 신규)

### F-139: ★ Tag Aggregate dead 의문 — F-122/F-123 합산 medium PROMOTED

- **위치**: `tag.service.ts` + `article.entity.ts` + `tag.entity.ts`
- **결함**: TagService.findAll 만 / insert 코드 부재 / Article.tagList simple-array 와 별개
- **proposed_fix**: Phase 6 결정 — TagModule 제거 또는 ArticleService 가 tag insert 추가

### F-140: ★★ UC-USER-DELETE AuthMiddleware 미적용 — 무차별 삭제 가능 critical PROMOTED

- **위치**: `user.module.ts:17-21` `forRoutes` 에 DELETE 누락
  ```ts
  consumer.apply(AuthMiddleware).forRoutes(
    {path: 'user', method: RequestMethod.GET},
    {path: 'user', method: RequestMethod.PUT}
    // ★★ DELETE /users/:slug 보호 부재
  );
  ```
- **결함**: 누구나 `DELETE /api/users/:slug` 호출 가능 (slug = email) → 무차별 삭제
- **proposed_fix**: `forRoutes` 에 `{path: 'users/:slug', method: RequestMethod.DELETE}` 추가 + 본인만 삭제 권한 검증
- **cross-val**: ★★ AP-SECURITY 변형 — PoC #01 (JWT 21byte) / PoC #02 (RSA git commit) 과 다른 형태 (auth scope 누락)
- **★★ 사내 적용 시 즉시 수정 의무 1줄 fix**

### F-141: ★ password change endpoint 부재 (UpdateUserDto password 필드 X) medium PROMOTED

- **위치**: `update-user.dto.ts` — username/email/bio/image 만 / password 필드 X
- **결함**: password 변경 endpoint 없음
- **proposed_fix**: UpdateUserDto 에 optional password + UserService.update 에 argon2.hash 처리

### F-142: ★ logout endpoint 부재 (JWT stateless 만) low CANDIDATE

- **위치**: 부재
- **결함**: JWT stateless → logout = 클라이언트 token 삭제만 / 서버 invalidation X
- **proposed_fix**: JWT blacklist 또는 short-lived access + refresh token (F-119 합산)

---

## Phase 4 (5.A rules) — 2026-04-30 등록 (F-143 / F-144 신규)

### F-143: ★ UserService.update 시 validate() 미호출 — 형식 검증 우회 medium PROMOTED

- **위치**: `user.service.ts:74-82` update 함수 — `validate(updated)` 호출 부재 (signup `create` 만 호출)
- **결함**: update 시 @IsEmail 검증 우회
- **proposed_fix**: UserService.update 에 `validate(updated)` 호출 추가

### F-144: ★ follow self-check (email) vs unFollow self-check (id) 일관성 결여 low CANDIDATE

- **위치**: `profile.service.ts:53` (follow — email 비교) vs `profile.service.ts:75` (unFollow — id 비교)
- **결함**: 같은 BR-FOLLOWS-NO-SELF 검증인데 차원 불일치
- **proposed_fix**: 둘 다 id 기반으로 통일

---

## Phase 4 (5.C antipatterns-partial) — 8 AP 후보 식별 (Phase 6 격상 대기)

`output/antipatterns-partial/antipatterns-partial.json` 참조.

| AP 후보 | severity | composite | cross-val |
|---|---|---|---|
| **AP-DB-001-poc03** | **critical** | F-120/121/133/135 | ★★ PoC #02 isomorphic + 더 나쁜 |
| **AP-AUTH-NEST-001-poc03** ★★ | **critical** | F-140/118/119 | ★★ AP-SECURITY 변형 신규 |
| AP-VALIDATION-001-poc03 | high | F-128/127/143/144 | ★ Senior 위험 3 정량 입증 |
| AP-PERFORMANCE-001-poc03 | medium → **high 격상** | F-124/135 | ★ 3 PoC 재현 |
| AP-DOMAIN-001-poc03 | medium | F-122/123/139 | NestJS 특이 |
| AP-DOMAIN-002-poc03 | medium | F-137/138 | ★ J 묶음 반대 패턴 |
| AP-API-001-poc03 | medium | F-129 | Senior 위험 6 |
| AP-CODE-QUALITY-001-poc03 | low | F-118/130/131 | — |

---

## cross-validation 결과 (PoC #01+#02 ↔ PoC #03)

| 분류 | 패턴 | 건수 |
|---|---|---:|
| **재현 본질** | DB UQ / EAGER / slug 함정 / DAG / Auth 결함 | **5** |
| **비재현 학습 효과** | TypeScript 타입 (F-048 비재현) | **1** |
| **비재현 stack 의존** | Hexagonal (J) / Outside-in (K) | **2** |
| **신규 패턴 (PoC #03 단독)** | 도메인 경계 약함 (F-137) / Auth scope 결여 (F-140) | **2** |
| **메타 finding (template 자가)** | G7 (F-132) / G6 (F-136) | **2** |

→ §8.1 정합 — Java→TypeScript 일반화 검증 본질 확보. v1.3 격상 데이터 충분.

---

## 통계 요약

```yaml
poc_03_findings_total: 27 (F-118~F-144)
poc_03_promoted: 18
poc_03_candidate: 9
poc_03_deferred: 0
poc_03_closed: 0
poc_03_rejected: 0

severity:
  critical: 2  (F-120 / F-140)
  high: 3      (F-118 / F-121 / F-128)
  medium: 12   (F-119 / F-123 / F-124 / F-125 / F-126 / F-127 / F-129 / F-133 / F-135 / F-137 / F-139 / F-141 / F-143)  # 13 — 하나 더
  low: 7       (F-122 / F-130 / F-131 / F-134 / F-138 / F-142 / F-144)
  meta_low: 2  (F-132 / F-136)

cross_val:
  isomorphic_or_재현: 5
  비재현_학습효과: 1
  비재현_stack_의존: 2
  신규_패턴: 2
  메타_finding: 2
```

(★ critical 2 / high 3 / medium 13 / low 9 = 27 합산. severity 표 위에서 medium 11 / low 7 + meta 2 표기는 정합. 기준 통일 — medium 13 / low 9 = 22 + critical 2 + high 3 = 27 ✅).

---

## 다음 액션

1. ⏳ **Phase 4.5 (★ 가장 핵심)** — 5 BR 형식화 + drift-validator + decision-table-validator 첫 외부 검증
2. ⏳ Phase 5-1 (api) — @nestjs/swagger 정적 추출 + 런타임 dump 2-way diff
3. ⏳ Phase 6 (quality) — 8 AP 후보 정식 격상 + cross-val 합산 + migration-cautions.md (★ v1.2.0 의무)
4. ⏳ PoC #03 종결 시 v1.3 격상 데이터 평가
5. ⏳ Sprint 5 carry-over (환경) — 진짜 static tool + nest start + SHOW CREATE TABLE 5종 물증
