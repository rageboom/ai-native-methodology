# PoC #03 — Migration Cautions (신규 시스템 구축 시 회피 가이드)

> **본 문서의 목적**: PoC #03 에서 발견한 11 안티패턴을 **신규 시스템 구축 시 회피하기 위한 가이드**.
>
> **avoid-list.md 와의 차이**:
> - avoid-list.md = "기존 시스템 (PoC #03) 에서 발견된 패턴 + 즉시 fix"
> - migration-cautions.md = "신규 시스템 (NestJS / Node.js / TypeScript) 구축 시 design/review/CI 단계에서 차단 가이드"
>
> 분석 대상: `lujakob/nestjs-realworld-example-app` (HEAD `c1c2cc4`)
> 방법론 v1.2.2 (★ 묶음 P 정식 산출물 / DEC-2026-04-29-안티패턴-마이그레이션-가이드 β)
> 신설: 2026-04-30

---

## 카테고리별 회피 가이드 (신규 시스템 design 단계)

### A. Security 영역 (1 AP critical) ★★★

#### A-1. NestJS Auth scope 의무 (★★★ 사내 표준 ADR 의무)

**근거 AP**: AP-AUTH-NEST-001 (critical / 5 endpoint cumul)

**design 단계** (신규 NestJS 프로젝트):
- ✅ **@nestjs/passport + LocalStrategy + JwtStrategy 의무 도입** — manual JWT verify 절대 금지
- ✅ **JwtAuthGuard 글로벌 적용** (또는 @Public() decorator 로 예외 명시)
  ```typescript
  // app.module.ts
  providers: [
    {provide: APP_GUARD, useClass: JwtAuthGuard}  // ★ 글로벌
  ]
  // controller — 명시적 public
  @Public()
  @Post('users/login')
  async login(...) {}
  ```
- ✅ **Ownership check Service 단 의무** — `req.user.id === target.author.id` 검증 의무 (Article update/delete/comment delete 등)
- ✅ **JWT 7일 expiry + refresh token endpoint 의무** — 60일+ expiry 금지
- ✅ **login error 메시지 통일** — 'Invalid credentials' (user 부재/password 불일치 구분 금지 — OWASP A07)
- ✅ **rate limiting (@nestjs/throttler) 의무** — login + write endpoint

**CI 의무**:
- supertest E2E — 익명 요청에 401, non-owner 요청에 403 검증
- 모든 신규 endpoint = `@UseGuards` 또는 `@Public()` 명시 검증 (ts-morph rule)

**팀 학습**:
- OWASP API Security Top 10 (API5 BOLA / A07 Auth Failure)
- NestJS Authentication 공식 docs + Passport 패턴

---

### B. DB 영역 (1 AP critical + 1 high) ★★

#### B-1. TypeORM 무결성 표준

**근거 AP**: AP-DB-001 (critical) + AP-PERFORMANCE-001 (high)

**design 단계**:
- ✅ **모든 entity unique 필드는 @Index({unique: true}) 의무** — App pre-check 단독 금지
  ```typescript
  @Entity('user')
  @Index(['username'], { unique: true })
  @Index(['email'], { unique: true })
  ```
- ✅ **Many-to-Many / 관계 테이블은 UQ pair + FK 의무**
  ```typescript
  @Entity('follows')
  @Index(['followerId', 'followingId'], { unique: true })
  @Check('follower_id <> following_id')
  ```
- ✅ **Counter 필드는 atomic UPDATE 또는 @Version optimistic lock 의무**
  ```typescript
  // ★ atomic UPDATE
  await queryRunner.manager.increment(Article, {id}, 'favoritesCount', 1);
  // 또는 @Version
  ```
- ✅ **@OneToMany / @ManyToOne 의 eager:false default + 명시적 fetch** — eager:true 절대 금지
- ✅ **catch QueryFailedError → ConflictException 변환 패턴**
  ```typescript
  try { await repo.save(...); }
  catch (e) {
    if (e.code === 'ER_DUP_ENTRY') throw new ConflictException('username already exists');
    throw e;
  }
  ```

**CI 의무**:
- migration 파일 = `SHOW CREATE TABLE` 검증 (UQ + FK + Check 적용 확인)
- concurrent INSERT 시뮬레이션 E2E (race window 측정)
- N+1 query log assertion (jest + typeorm-query-counter)

**팀 학습**:
- Joe Celko's SQL for Smarties §UNIQUE
- Vlad Mihalcea High-Performance Java Persistence §16 (Optimistic Locking)
- TypeORM eager loading 함정 ADR

#### B-2. ORM 자동 동작 ADR
**근거 AP**: AP-PERFORMANCE-001 + AP-DB-001 일부

**design 단계**:
- ✅ TypeORM `synchronize: true` 절대 금지 (production) — migration 도구 의무 사용
- ✅ **Entity ↔ Repository generic 타입 cross-check** (PoC #02 F-048 학습 효과)
  ```typescript
  // ★ 정합성 검증
  @PrimaryGeneratedColumn() id: number;
  Repository<UserEntity>  // 타입 자동 추론 OK
  ```

---

### C. API 영역 (1 high + 2 medium)

#### C-1. NestJS HTTP 표준 ADR 의무

**근거 AP**: AP-API-001 (high) / AP-API-002 (medium) / AP-API-003 (medium)

**design 단계**:
- ✅ **@HttpCode 명시 의무** — NestJS @Post 의 default 201 함정 회피
  ```typescript
  @HttpCode(200)  // login (신규 자원 ❌)
  @Post('login')
  async login() {}

  @HttpCode(204)  // DELETE (RFC 9110 §15.3.5)
  @Delete(':slug')
  async delete() {}
  ```
- ✅ **API 버저닝 의무** — `setGlobalPrefix('api/v1')` 첫 release 부터
- ✅ **부분 갱신 = @Patch + application/merge-patch+json** — PUT 은 entity replacement 의미만
  ```typescript
  @Patch(':slug')
  @Header('Content-Type', 'application/merge-patch+json')
  async update(@Param('slug') slug, @Body() patch: UpdateArticlePatchDto) {}
  ```
- ✅ **@Query @Max 의무** — limit / page parameter
  ```typescript
  @Query() @Type(() => Number) @Max(50) limit: number = 20
  ```
- ✅ **@ApiResponse 데코 status = 실 NestJS @HttpCode 정합 의무** — drift 절대 금지

**CI 의무**:
- spec/runtime drift 검증 (supertest + @ApiResponse 데코 cross-check)
- OpenAPI breaking change (oasdiff)
- Swagger UI 자동 생성 (@nestjs/swagger 5.x+) + spectral lint

**팀 학습**:
- RFC 9110 (HTTP Semantics) — 특히 §15.3 (status codes)
- RFC 5789 (PATCH) + RFC 7396 (JSON Merge Patch)
- Stripe API Versioning + GitHub API 가이드라인

#### C-2. Controller 책임 / Path 일관성

**근거 AP**: AP-CONTROLLER-001 (low)

**design 단계**:
- ✅ **@Controller(path) 의무** — 빈 prefix 절대 금지
  ```typescript
  @Controller('users')  // ★ NEW
  export class UserController {
    @Get('me')   // GET /api/v1/users/me
    @Post('login')   // POST /api/v1/users/login
  }
  ```
- ✅ **@ApiBearerAuth 적용 = 실 Auth scope 일치 의무** — 인지 불일치 금지

---

### D. Validation 영역 (1 AP high)

#### D-1. class-validator + ValidationPipe 표준

**근거 AP**: AP-VALIDATION-001 (high)

**design 단계**:
- ✅ **모든 input DTO = class-validator 의무** (UpdateXxxDto / CreateXxxDto / QueryXxxDto)
  ```typescript
  export class CreateUserDto {
    @IsNotEmpty() @MinLength(3) @MaxLength(20) username: string;
    @IsNotEmpty() @IsEmail() email: string;
    @IsNotEmpty() @MinLength(8) password: string;
  }
  ```
- ✅ **ValidationPipe global 의무** — main.ts
  ```typescript
  app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}));
  ```
- ✅ **Service.update 도 validate 의무 호출** — signup 에만 적용 금지
- ✅ **Domain Aggregate constructor invariant** — Sairyss DDD-Hexagon 정설
  ```typescript
  @Entity('follows')
  export class FollowsEntity {
    constructor(followerId: number, followingId: number) {
      if (followerId === followingId) throw new Error('follower and following must differ');
      // ...
    }
  }
  ```

**CI 의무**:
- supertest negative test 의무 (empty / null / overflow / invalid email boundary)
- ts-morph rule — DTO field 가 validator 데코레이터 부재 시 차단

**팀 학습**:
- class-validator 공식 docs
- Sairyss DDD-Hexagon README §5 (Domain Invariants)

---

### E. Domain 영역 (2 AP medium)

#### E-1. Aggregate Root + Bounded Context

**근거 AP**: AP-DOMAIN-001 + AP-DOMAIN-002

**design 단계**:
- ✅ **Aggregate constructor invariant 의무** — DDD Blue Book §5
- ✅ **dead aggregate 제거 또는 책임 명시** — Tag 처럼 read-only 라면 reference data 로 분리
- ✅ **Bounded Context 간 entity 직접 참조 금지** — Service abstraction 또는 Domain Event 사용
  ```typescript
  // ProfileModule (BC: Profile)
  // ❌ InjectRepository(UserEntity) — User BC 침투
  // ✅ inject UserService (interface) — User BC 의 export
  ```
- ✅ **Article setTitle = slug regenerate 자동** — TODO 주석 절대 금지 (PoC #03 F-126 함정)

**CI 의무**:
- ts-morph rule — cross-module @InjectRepository 차단
- jest unit test — Aggregate constructor invariant boundary 검증

**팀 학습**:
- Eric Evans DDD §5 (A Model Expressed in Software)
- Vernon IDDD §13 (Integrating Bounded Contexts)
- Sairyss DDD-Hexagon README

---

### F. Code Quality 영역 (1 AP low)

#### F-1. DRY + Output DTO

**근거 AP**: AP-CODE-QUALITY-001

**design 단계**:
- ✅ **JWT verify = 단일 위치 (JwtAuthGuard)** — controller / service 분산 금지
- ✅ **dead code 즉시 제거** — base.controller.ts / prisma 잔재 등 첫 commit 부터
- ✅ **Repository entity → Output DTO 변환 의무** — entity 직접 노출 금지 (Sairyss DDD-Hexagon)
  ```typescript
  // ❌
  async findAll(): Promise<TagEntity[]> { return repo.find(); }
  // ✅
  async findAll(): Promise<TagDto[]> {
    const tags = await repo.find();
    return tags.map(t => ({id: t.id, name: t.name}));  // ★ DTO 변환
  }
  ```

**CI 의무**:
- ESLint dead code rule (no-unused-vars + no-unused-imports)
- ts-morph rule — Repository result 직접 controller return 차단

---

## NestJS 특이 패턴 (★ PoC #01/#02 = Java/Spring 과 다른 학습 효과)

### NestJS 학습 효과 ✅ (재현 ❌)

| 패턴 | PoC #02 (Java/Spring) | PoC #03 (NestJS) | 학습 효과 |
|---|---|---|---|
| Bearer JWT | Token apiKey 비표준 (F-084) | ★ addBearerAuth() 표준 ✅ | ★★ NestJS framework 자연 회피 |
| 307 internal redirect | ModelAndView leak (F-087) | NestJS 미사용 | ★ Framework 차이 |
| TagJpaRepository 타입 | Java generic erasure (F-048) | TypeScript 정적 차단 | ★ TypeScript 학습 효과 |

→ **사내 NestJS 신규 프로젝트 = 위 3가지 자연 회피 효과 기대 ✅**.

### NestJS 함정 (★ PoC #03 신규 발견)

| 패턴 | 함정 | 회피 |
|---|---|---|
| @Controller() 빈 prefix | path 분산 | @Controller('users') 의무 |
| @Post default 201 | login + Update 가 RFC 위반 | @HttpCode 명시 의무 |
| @Delete default 200 | RFC 9110 §15.3.5 위반 | @HttpCode(204) 의무 |
| @ApiResponse 데코 status | 실 status 와 drift | spec/runtime drift CI 검증 |
| AuthMiddleware forRoutes | endpoint 별 명시 누락 가능 | JwtAuthGuard 글로벌 권장 |
| TypeORM eager:true | N+1 + 메모리 | eager:false default + 명시적 fetch |
| Math.random suffix slug | 무결성 손실 | DB UQ + catch QueryFailedError |
| @nestjs/swagger 없는 endpoint | docs 누락 | global @ApiTags + @ApiOperation 의무 |

---

## 사내 적용 권고 패턴 (★ PoC #02 보강)

PoC #02 권고에 NestJS 특이 항목 추가:

### 추가 ADR 후보 (v1.3 격상 시)

| ADR ID | 영역 | 근거 |
|---|---|---|
| ADR-NEST-AUTH | Auth | @nestjs/passport + JwtAuthGuard 글로벌 패턴 |
| ADR-NEST-VALIDATION | Validation | ValidationPipe global + DTO + Aggregate invariant |
| ADR-NEST-HTTPCODE | API | @HttpCode 명시 의무 (NestJS default 함정 회피) |
| ADR-NEST-TYPEORM | DB | eager:false + UQ/FK/Check + atomic counter |

---

## 종결 진술

> **NestJS 신규 프로젝트는 본 가이드의 A~F 항목을 design 단계 + CI 단계에서 의무 적용**.
> 본 방법론 검증 결과 = NestJS framework 자연 회피 효과 3건 (Bearer / 307 redirect / TS 정적 차단) **+** NestJS 특이 함정 8건 (Auth scope / Controller prefix / @Post 201 / @Delete 200 / ApiResponse drift / AuthMiddleware forRoutes / TypeORM eager / Math.random slug).
> **★★ 본 가이드 = PoC #02 가이드 + NestJS 특이 8건 보강** = 사내 표준 v1.3 격상 핵심 데이터.

**End of migration-cautions.md.**
