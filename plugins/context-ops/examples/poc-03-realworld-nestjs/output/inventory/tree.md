# 디렉토리 트리 — PoC #03 NestJS

> **사람 눈** 산출물 (이중 렌더링 정합 — `inventory.json` 의 짝).
> 분석 대상: `lujakob/nestjs-realworld-example-app` master `c1c2cc4`

---

## 1. 루트

```
nestjs-realworld-example-app/
├── README.md                       # 프로젝트 소개 (RealWorld API description)
├── LICENSE                         # 부재 (package.json license=ISC)
├── package.json                    # NestJS 7 + TypeORM 0.2 + class-validator + JWT
├── package-lock.json
├── yarn.lock                       # npm + yarn 양쪽 lock — 일관성 ❌ minor
├── tsconfig.json                   # TypeScript 3.8 / target es6 / module commonjs
├── nestconfig.json                 # nest-cli 설정 (entryFile: src/main.ts)
├── nodemon.json                    # 개발 watch 설정
├── ormconfig.json.example          # 사용자 작성 의무 (synchronize:true 시 entity → DDL 자동)
├── jest.json                       # Jest config
├── index.js                        # 의문 — main 진입점은 src/main.ts (TypeScript) — index.js 의 용도 미명확
├── project-logo.png
├── prisma/.env                     # master 잔재 (TypeORM 단독 — prisma 미사용)
├── src/                            # 본 분석 대상
└── dist/                           # 빌드 산출물 (분석 제외)
```

---

## 2. src/ (본 분석 대상)

```
src/
├── main.ts                         # 부트스트랩 + Swagger 설정 (/docs)
├── app.module.ts                   # ApplicationModule (root)
├── app.controller.ts               # root → 'Hello World!' 잔재
│
├── article/                        # MOD-ARTICLE (도메인)
│   ├── article.module.ts
│   ├── article.controller.ts       # 11 endpoint (CRUD + comments + favorite)
│   ├── article.service.ts          # 가장 복잡 (224 line)
│   ├── article.entity.ts           # slug unique 부재
│   ├── article.interface.ts
│   ├── comment.entity.ts           # @Entity() default — 비일관
│   └── dto/
│       ├── create-article.dto.ts   # class-validator 데코 0개
│       ├── create-comment.ts       # class-validator 데코 0개
│       └── index.ts
│
├── user/                           # MOD-USER (보안 핵심)
│   ├── user.module.ts              # AuthMiddleware /user GET PUT
│   ├── user.controller.ts
│   ├── user.service.ts             # generateJWT (60일 expiry)
│   ├── user.entity.ts              # unique 제약 부재
│   ├── user.interface.ts
│   ├── user.decorator.ts           # @User() — JWT verify 무방어 (verify 3곳 DRY 위반 #2)
│   ├── auth.middleware.ts          # JWT verify 무방어 (#1) — invalid token → 500 Internal
│   └── dto/
│       ├── create-user.dto.ts      # @IsNotEmpty 만
│       ├── login-user.dto.ts       # @IsNotEmpty 만
│       ├── update-user.dto.ts      # class-validator 데코 0개
│       └── index.ts
│
├── profile/                        # MOD-PROFILE
│   ├── profile.module.ts
│   ├── profile.controller.ts       # follow / unfollow / getProfile
│   ├── profile.service.ts          # self-follow guard (service 단)
│   ├── profile.interface.ts
│   └── follows.entity.ts           # FK 제약 부재 (followerId / followingId 단순 number)
│
├── tag/                            # MOD-TAG (미사용 가능성)
│   ├── tag.module.ts
│   ├── tag.controller.ts
│   ├── tag.controller.spec.ts      # 유일한 test file
│   ├── tag.service.ts              # findAll 만
│   └── tag.entity.ts               # insert 코드 부재 — dead code
│
└── shared/                         # MOD-SHARED (infrastructure)
    ├── base.controller.ts          # 사용처 부재 — dead code 가능 (JWT verify 무방어 #3)
    └── pipes/
        └── validation.pipe.ts      # ValidationPipe 자체 구현 (NestJS 내장 미사용)
```

---

## 3. 통계

| 항목                   | 값                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| TypeScript 파일 (src/) | 35                                                                                            |
| 디렉토리 (src/)        | 5 도메인 + shared                                                                             |
| 총 LOC                 | (stats.json 참조 — wc -l 결과)                                                                |
| 의존 패키지            | dependencies 21 + devDependencies 8                                                           |
| 가장 큰 파일           | src/article/article.service.ts (~224 line)                                                    |
| Test file              | 1 (tag.controller.spec.ts)                                                                    |
| Entity                 | 5 (User / Article / Comment / Tag / Follows)                                                  |
| DTO                    | 6 (CreateUserDto / LoginUserDto / UpdateUserDto / CreateArticleDto / CreateCommentDto / 기타) |
| Module                 | 5 (Application + Article + User + Profile + Tag)                                              |
| Controller             | 5 (App + Article + User + Profile + Tag)                                                      |
| Service                | 4 (Article + User + Profile + Tag)                                                            |

---

## 4. PoC #02 와 핵심 차이 (한 눈에)

| 차원        | PoC #02 (Spring Boot 3.3)                       | PoC #03 (NestJS 7)                       |
| ----------- | ----------------------------------------------- | ---------------------------------------- |
| 모듈 시스템 | Multi-module Hexagonal hybrid (8 모듈)          | 단일 NestJS module tree (5 도메인)       |
| ORM         | JPA / Hibernate                                 | TypeORM 0.2                              |
| naming      | Hibernate `NamingHelper` MD5 hash               | TypeORM camelCase 보존                   |
| Auth        | JWT + Spring Security                           | JWT + AuthMiddleware (legacy NestJS)     |
| Validation  | Bean Validation                                 | class-validator (DTO/entity 분포)        |
| OpenAPI     | 사용자 작성 yaml (802 line)                     | @nestjs/swagger 데코레이터 inline        |
| Module 의미 | Architectural                                   | DI container (Senior 위험 5)             |
| DB UQ       | email/username/slug 모두 부재 (PoC #02 finding) | **부재 + FK 제약도 부재 (더 나쁜 상태)** |
| EAGER N+1   | F-051 (Article EAGER + Specification)           | Comment eager:true (cross-val 후보)      |

---

## 5. 다음 phase 인계

- **Phase 2 (db)**: TypeORM entity 5종 → schema.sql 추출 (synchronize:true 시 자동 생성). G6 ORM sub-section (b) TypeORM 첫 적용. unique/FK 제약 부재 검증 의무.
- **Phase 3 (arch)**: NestJS Module = DI 경계. Hexagonal port-adapter 분류기 부적합 — 디렉토리 기반 5 도메인 모듈 분류. circular 의존 검증 (User ↔ Article ManyToMany favorites).
- **Phase 4 (BR)**: class-validator (DTO + entity) + service.ts manual throw 양쪽 추출 의무. Senior 위험 3 정합 — DTO 단독 BR 누락 위험.
- **Phase 4.5**: User account state-machine + Article lifecycle + signup/follow sequence + decision-tables (BR-USERNAME-UNIQUE / EMAIL-UNIQUE / FOLLOW-NO-SELF / FOLLOW-IDEMPOTENT 등 PoC #02 cross-val).
- **Phase 5-1**: @nestjs/swagger 데코레이터 정적 추출 + 런타임 dump 2-way diff (DEC-PoC03-N5).
- **Phase 6**: 18+ preliminary finding signals (inventory.json) → AP 격상 후보 다수.
