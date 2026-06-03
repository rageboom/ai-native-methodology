# Stack 자동 감지 — PoC #03 NestJS

> **Phase 1** — package.json + tsconfig.json + ormconfig.json.example + 코드 grep 기반 deterministic 추출.
> AI 추론 0% (no-simulation 정합).

---

## 1. 핵심 stack (확정)

| 영역          | 값                                                     | 출처                                                                      | 신뢰도 |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- | ------ |
| 언어          | TypeScript 3.8.3                                       | `package.json` `typescript: "^3.8.3"` + `tsconfig.json`                   | 0.98   |
| 런타임        | Node.js (버전 미명시)                                  | `index.js` + `nodemon.json` 존재. `engines` 부재 → 검증 caveat            | 0.85   |
| 프레임워크    | NestJS 7.0.5                                           | `@nestjs/{common,core,microservices,platform-express,websockets}: ^7.0.5` | 0.99   |
| ORM           | TypeORM 0.2.24 (+ @nestjs/typeorm 7.0.0)               | `package.json` + `ormconfig.json.example`                                 | 0.99   |
| DB            | MySQL 5.x+                                             | `mysql: ^2.18.1` driver + `ormconfig.json.example` `type: "mysql"`        | 0.98   |
| Validation    | class-validator 0.11.1 + class-transformer 0.2.3       | `package.json` + `src/shared/pipes/validation.pipe.ts`                    | 0.99   |
| Auth          | JWT (jsonwebtoken 8.5.1) + passport-jwt 4.0.0 (선언만) | `package.json` + 코드 3곳 verify                                          | 0.95   |
| Password hash | argon2 0.26.2                                          | `package.json` + `UserEntity.@BeforeInsert`                               | 0.99   |
| OpenAPI       | @nestjs/swagger 4.4.0                                  | `package.json` + `main.ts:14 SwaggerModule.setup('/docs')`                | 0.99   |
| Test          | Jest 25 + ts-jest + supertest                          | `package.json` + `jest.json`                                              | 0.95   |

---

## 2. 추론 영역 (cap 적용)

### 2.1 아키텍처 스타일 (cap 0.85 — 단일 module tree)

| 후보                                      | 신뢰도   | 근거                                                                                                                    |
| ----------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Modular Monolith (NestJS Module 분류)** | **0.85** | 5 도메인 module + DI graph. `@Module({imports/controllers/providers})`                                                  |
| Hexagonal port-adapter                    | 0.10     | Senior 위험 5: NestJS Module = DI 경계 ≠ port. 별도 디렉토리 convention (`core/`/`application/`/`infrastructure/`) 부재 |
| Layered (Controller-Service-Entity)       | 0.65     | 흔한 NestJS 패턴 — service/controller/entity 분리는 명확. layer 위반 검증 Phase 3.                                      |
| Clean Architecture                        | 0.10     | 별도 use-case / interactor / boundary 부재                                                                              |

→ Phase 3 에서 cap 0.85 검증. PoC #02 multi-module Hexagonal 0.65 cap 보다 분류 단순 → cap 격상 가능.

### 2.2 NestJS 패턴 사용도

| 패턴                                   | 사용 | 적용 범위                                                           |
| -------------------------------------- | ---- | ------------------------------------------------------------------- |
| **@Module**                            | ✅   | Application + 4 sub (User/Article/Profile/Tag)                      |
| **@Controller**                        | ✅   | 5 controller                                                        |
| **@Injectable Service**                | ✅   | 4 service (Tag minimal)                                             |
| **TypeORM @Entity + InjectRepository** | ✅   | 5 entity                                                            |
| **DTO + class-validator**              | ⚠️   | DTO 6개 중 2개만 데코 (CreateUserDto, LoginUserDto). 4개 = 데코 0개 |
| **NestJS 내장 ValidationPipe**         | ❌   | 자체 구현 (`shared/pipes/validation.pipe.ts`)                       |
| **Guards**                             | ❌   | 미사용 — AuthMiddleware 사용 (legacy)                               |
| **Pipes**                              | ⚠️   | 자체 ValidationPipe 만                                              |
| **Interceptors**                       | ❌   | 미사용                                                              |
| **Filters**                            | ❌   | 미사용 — HttpException 직접 throw                                   |
| **Middleware**                         | ✅   | AuthMiddleware — 11 route 적용                                      |
| **CustomDecorator**                    | ✅   | `@User()` 1개 (`createParamDecorator`)                              |
| **OpenAPI/Swagger**                    | ⚠️   | ArticleController 만 풀 데코 (coverage 불균형)                      |

→ NestJS 7 시점 권장 패턴 일부 사용 / 일부 legacy. 현재 NestJS 10 기준 보면 (2024) Guards / 내장 Pipes / Interceptors 권장.

---

## 3. PoC #02 (Spring Boot 3.3) 와 차이

### 3.1 Stack 본질 차이

| 차원            | PoC #02                                  | PoC #03                                                     | §8.1 검증 영역                                                                           |
| --------------- | ---------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 언어            | Java 21                                  | TypeScript 3.8                                              | 일반성 검증                                                                              |
| 런타임          | JVM                                      | Node.js                                                     | 일반성 검증                                                                              |
| 모듈 시스템     | Gradle multi-module 8 + Hexagonal hybrid | npm + 단일 NestJS module tree                               | **재현 ❌ — stack 의존 (PoC #02 multi-module 학습 효과 ❌, PoC #03 = 단일 module 본질)** |
| ORM naming      | Hibernate `NamingHelper` MD5 hash        | TypeORM camelCase 보존                                      | G6 v1.2.2 ORM 4 enum 정합                                                                |
| Validation 분포 | Bean Validation entity + DTO 양쪽        | class-validator DTO 단독 + entity 1개 (UserEntity.@IsEmail) | Senior 위험 3 정합                                                                       |
| Auth pattern    | Spring Security + JWT                    | AuthMiddleware (legacy NestJS) + JWT                        | 권장 분기                                                                                |
| OpenAPI 출처    | 사용자 작성 yaml (802 line ground truth) | @nestjs/swagger 데코레이터 inline (정적+런타임)             | DEC-PoC03-N5 정합                                                                        |

### 3.2 PoC #02 패턴 cross-validation 시그널 (Phase 6 합산 후보)

| PoC #02 패턴                                   | PoC #03 재현 가능성                                                                                                                                    | 분류               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| AP-SECURITY-001 (RSA git commit)               | ⚠️ JWT SECRET = config.ts 사용자 작성. .gitignore 검증 필요                                                                                            | 변형 재현 후보     |
| AP-DOMAIN-002 (race-prone unique)              | 재현 + 더 나쁜 (DB UQ 자체 부재)                                                                                                                       | 재현 + 격상        |
| AP-DB-001 (TagJpaRepository 타입 오류)         | ⚠️ TypeScript 타입 시스템 — 정적 차단 가능. 재현 ❌ 예상                                                                                               | 비재현 (학습 효과) |
| F-051 EAGER N+1                                | Article.comments eager:true                                                                                                                            | 재현               |
| F-053 titleToSlug 8 함정                       | slugify random suffix                                                                                                                                  | 재현 (변형)        |
| F-070 spec/runtime drift (favorite/unfavorite) | ⚠️ Article controller 의 favorite/unFavorite 런타임 검증 필요                                                                                          | 검증 후보          |
| AP-API-001 (idempotency 위반)                  | ⚠️ favorite/unFavorite + follow/unFollow service 단 idempotent 처리 일부 (article.favorite 의 isNewFavorite check + profile.follow 의 if (!\_follows)) | 부분 재현          |
| F-068 RSA private key git commit               | ⚠️ PoC #03 = JWT SECRET (string) — 별 위협                                                                                                             | 비재현             |

→ Phase 6 종결 시 §8.1 정량 분석.

---

## 4. 신뢰도 정량 (ADR-009 단계 정합)

```yaml
trust_level:
  current: 0.90 # Phase 1 종결 시점
  current_step: 1 # 1차 작성 (deterministic 영역만)
  validation_history:
    - {
        step: '1차 작성',
        at: '2026-04-30',
        actor: 'AI (메인 raw fetch)',
        tool_type: 'ai_subagent',
      }
    # Phase 1 = deterministic (find/wc) + LLM grounding 혼합. cross-validation 의무 X (Phase 1 명세).
  next_validation: 'Phase 2 db 진입 시 entity → schema.sql 정합 검증 (G6 v1.2.2)'

# 자동 도구 단계 도달 (ADR-009 단계 3 — v1.2.1 신설 정합)
automated_validation_potential:
  - 'Phase 4.5 진입 시 drift-validator + decision-table-validator 적용 (의무)'
  - 'Phase 4 진입 시 DTO/entity class-validator 데코레이터 정적 추출 자동화 가능'

# v1.3+ 단계 5 (진짜 도구) 도달 가능성
real_static_tool_carry_over:
  - 'typescript-eslint strict — 환경 부재 (Sprint 5+ carry-over)'
  - 'Semgrep p/typescript+p/owasp-top-ten+p/nestjs — 환경 부재'
  - 'OSV-Scanner — 환경 부재'
  - 'type-coverage — any-ratio 측정 (ADR-009 v1.3 단계 2.5 후보 데이터 수집)'

# 정직 표기
honesty_disclosure:
  - '본 phase = deterministic (find/wc/cat) + grounded LLM. 시뮬 0%.'
  - 'external static tool 미실행 — 환경 부재 정직 표기 (no-simulation 정합)'
  - 'Document agent fetch 일부 실패 (codebase.show / docs.nestjs.com SPA) — 자가 시인. 본 stack-detection 은 package.json + 코드 grep ground truth 만 사용.'
```

---

## 5. Phase 2 진입 인계

| 인계 사항                   | 상세                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| ORM kind                    | TypeORM 0.2 (G6 v1.2.2 sub-section (b) 정합)                                        |
| naming strategy             | default — camelCase 보존 (`SnakeNamingStrategy` 미적용 명시)                        |
| DDL 출처                    | `synchronize: true` 시 entity → 자동 (사용자 작성 schema.sql 부재)                  |
| migration 도구              | 부재 (TypeORM CLI 사용 안 함)                                                       |
| 5 entity                    | User / Article / Comment / Tag / Follows                                            |
| DB 제약 부재                | unique (user.email/username, article.slug) + FK (follows.followerId/followingId)    |
| tagList vs TagEntity 두 SoT | Article.tagList (simple-array column) ≠ TagEntity (별도 테이블) — 의미 검증 Phase 4 |
| 운영 DB 접근                | 부재 — 사용자 환경 의존 (Phase 2 신뢰도 -10%p 적용 후보)                            |
