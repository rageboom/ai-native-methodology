# PoC #03 NestJS 진입 research — 2 agent 통합

> **작성**: 2026-04-30 / **plan**: `plan-poc-03-진입.md`
> **방법**: 가벼운 sub-agent — Document 8분 / Senior 10분. Case agent 생략 (PoC #02 충분).
> **신뢰도 보강**: 두 agent 수렴 ★ / 단일 발견 ◯.

---

## 1. 분석 대상 확정 (Document agent)

### 후보 비교

| 레포 | star | 최근 commit | ORM | DB | Swagger | 권장도 |
|---|---|---|---|---|---|---|
| **lujakob/nestjs-realworld-example-app (master)** | **3,346** | 2024-03-10 push / 코드 2021-01 | TypeORM 0.2 | MySQL | `@nestjs/swagger` ^4.4 | **★★★ 1차** |
| lujakob (prisma 브랜치) | 동일 | 동일 | Prisma 2.0-beta | MySQL | 동상 | ★★ 대조 |
| mutoe/nestjs-realworld-example-app | 43 | 2023-04-28 | TypeORM | — | — | ★ TDD |
| motora-dev/angular-nestjs-realworld-example-app | 2 | 2026-01-01 | Prisma | Neon Postgres | — | ☆ 저인지도 |
| unlight/nestjs-graphql-prisma | 108 | 2022-03 | Prisma+GraphQL | — | — | ☆ REST 이탈 |

**1차 추천**: `lujakob/nestjs-realworld-example-app` master, commit `c1c2cc4`.

**근거**:
- 압도적 star 3,346 / fork 704 — 사실상 표준
- `@nestjs/swagger` 사용 → DEC-PoC03-N5 ground truth
- NestJS 7 + TypeORM 0.2 + class-validator + JWT 풀세트
- prisma 브랜치 동시 분석 시 ORM 대조 가능 (PoC #02 multi-module 변형 패턴 재사용)

**Caveat**:
- ★ 정체 레포 (코드 2021-01 마지막) — **legacy 분석 대상 성격에 오히려 적합** (본 방법론 = "legacy → 형식 명세")
- license 부재 (null) → 분석/연구 fair use 가능. PoC 결과 공개 시 명기 의무
- open issue 46 / PR 미머지 → maintained ❌. **분석 대상 / best practice 레퍼런스는 NestJS 공식 docs 분리**
- HEAD SHA pin 의무 (commit `c1c2cc4`) — PoC #02 정합

**fetch 정직성** (Document agent 자가 시인):
- codebase.show / docs.nestjs.com/openapi/introduction = SPA 렌더 추정 → 본문 비반환
- Swagger 동작 설명 (§3 마지막) = GitHub README + 검색 결과 기반 + 공식 docs 미확인
- → Sprint 4 진입 시 사용자에게 nest cli 로 직접 실행 검증 요청 (★★★ no-simulation 정합)

---

## 2. NestJS 패턴 핵심 (Phase 분석 영향)

### 2.1 Module / Provider / Controller (Phase 3 영향)
- `@Module({imports, controllers, providers, exports})` DI 그래프
- PoC #02 multi-module Hexagonal 과 달리 **단일 NestJS module tree** — port-adapter 추출보다 **DI 의존 그래프** 핵심
- ★ Senior 위험 5 정합: NestJS `@Module` = DI 경계 ≠ port-adapter

### 2.2 Guards / Pipes / Interceptors (Phase 4.5 영향)
- 요청 처리 chain: Guard → Pipe → Interceptor → Handler → Interceptor → Filter
- **Phase 4.5 decision-table 1순위 후보** — `AuthGuard('jwt')` 통과 조건 / `ValidationPipe` DTO 검증 분기
- migration_advice (P 묶음) 직결 → AP-AUTH-NEST-001 등 후보

### 2.3 DTO + class-validator (Phase 4 BR 영향)
- `@IsEmail() @MinLength(8)` 등 데코레이터 → rules.json BR 직접 추출 source
- Java Bean Validation (PoC #01 `@NotBlank`) 와 **isomorphic — 추출 로직 95% 재사용**
- ★ Senior 위험 3 보강 필요: class-validator 가 **DTO 단독** (entity 는 ORM decorator) → entity-level BR 누락 위험

### 2.4 @nestjs/swagger (Phase 5-1 영향)
- `@ApiProperty` + DTO 정적 분석 + swagger-cli plugin
- **별도 yaml 파일 없음** — 코드가 spec source
- Phase 5-1 ground truth = **앱 부팅 후 spec dump** 또는 **소스 데코레이터 정적 추출** 둘 중 택
- ★ DEC-PoC03-N5 갱신 필요 (PoC #02 "사용자 yaml ground truth" 패턴과 본질적 다름)

---

## 3. Senior agent 6 위험축 (★critical 1건 발견)

### ★ critical 위험 1 — G6 (db-schema.template.md) ORM 강결합

**함정**: G6 "ORM derivative 분별" 섹션이 Hibernate `NamingHelper.MD5(table+column)` 6글자 hash 패턴에 강결합. TypeORM default naming = **camelCase 보존 + entity 명 그대로 + relation 시 `[propertyName]Id`** (해시 ❌). MikroORM/Prisma 또 다름 (Prisma 는 `@map` 명시).

**보완**: G6 를 "ORM-specific naming derivative — ORM 별 sub-section" 재구조화. **Hibernate / TypeORM / Prisma / SQLAlchemy 4 enum** + 일반 원칙만 본체. 사례별 sub-template 분리.

**★ PoC #03 진입 전 선결 권고** (재작업 0 시퀀스 정합).

### 위험 2 — state-machine 추출 트리거 일반화

**함정**: PoC #01/#02 Aggregate Root state-machine 이 JPA 생애유기 (transient/managed/detached/removed) + 도메인 상태 묶음. NestJS 는 service stateless + DB column flag 단일 진실 → state-machine 추출이 "JPA + 도메인" 묶음 패턴이라면 NestJS 신뢰도 60% 미만.

**보완**: ADR-008 state-machine 추출 트리거를 "**도메인 flag 단독**" 일반화. NestJS 는 enum column / transition log 우선 read.

### 위험 3 — DTO BR 추출 / 자연어 빈약성 30% 악화 예상

**함정**: Java Bean Validation = entity + DTO 양쪽. NestJS class-validator = **DTO 단독** → entity 검증 누락 → drift. `@Transform`/`@ValidateIf` 동적 데코레이터가 자연어 표현력 ↑ → rules.json L0 자연어 빈약성 (PoC #02 F-074 44%) 이 NestJS **30% 더 악화** 예상.

**보완**: `templates/rules.template.md` 에 "DTO-only BR vs entity-level BR" 분리 sub-section + class-validator → L1 decision-table 매핑 가이드 (Phase 4.5 우선 적용).

### 위험 4 — TypeScript 타입 단계 (ADR-009 보강 후보)

**함정**: ADR-009 8단계는 Java nominal + reflection 기반. TypeScript = **structural typing** + `tsc --strict` 자체가 단계 2.5 권위. 단 generic variance 차이 + `any`/`unknown` escape hatch → **`any` 침투율** 측정 안 하면 정적 검증 신뢰도 과대 평가.

**보완**: ADR-009 단계 2.5 "TypeScript strict + any-ratio < 5%" 신설. 측정 도구 `type-coverage` 명시.

### 위험 5 — Module vs Hexagonal

**함정**: NestJS `@Module` = DI container 경계, **architectural 경계 아님**. Hexagonal port-adapter 분류기 (PoC #02 Phase 3) 가 `@Module` 을 port 로 오인식 → LV-검증 false negative.

**보완**: `templates/architecture.template.md` 에 "NestJS Module = DI 경계 ≠ port" 명시 + 디렉토리 convention (`core/`/`application/`/`infrastructure/`) 우선 read 가이드. LV-검증을 디렉토리 기반 재정의.

### 위험 6 — OpenAPI 두 출처 (DEC-PoC03-N5)

**함정**: `@nestjs/swagger` = 데코레이터 reflection runtime 자동 생성 (handler 와 100% sync). 사용자 작성 yaml = drift 위험. 단 `@ApiProperty` 누락 시 **silent 빈약** (필드 omit), `@ApiResponse` 미부착 시 default 200 만 노출 → status code drift **재현 가능성 ★high**.

**보완**: DEC-PoC03-N5 = "swagger 자동 생성 + 사용자 yaml 양쪽 비교". swagger output = ground truth, yaml = 검증 대상. `@ApiProperty`/`@ApiResponse` coverage 측정 의무.

---

## 4. Static Tools (Node/TypeScript) — DEC-PoC03-N6 확정 권고

| 도구 | 역할 | 우선순위 | 비고 |
|---|---|---|---|
| **typescript-eslint** + `@typescript-eslint/strict-type-checked` | 타입/논리 결함 (no-floating-promises 등) | ★★★ 의무 | Sprint 4 묶음 O 정합 |
| **Semgrep** `p/typescript` + `p/owasp-top-ten` + `p/nestjs` | 보안/패턴 매칭 | ★★★ 의무 | static-runner Semgrep plugin 재사용 |
| **OSV-Scanner** (또는 npm/pnpm audit) | 의존성 CVE | ★★★ 의무 | 5종 물증 의무 |
| **CodeQL** `javascript-typescript` | taint / SQL injection | ★★ 권장 | 환경 의존 |
| **madge** | 순환 의존 (NestJS module circular) | ★★ 권장 | dependency-graph.mermaid 보강 |
| **type-coverage** | any 침투율 측정 (★ ADR-009 단계 2.5) | ★★ 권장 | 위험 4 정합 |
| SonarQube / SonarCloud | code smell / cognitive complexity | ★ 환경 부재 시 사용자 위임 | — |
| ts-prune / knip | dead code | ★ | — |
| dependency-cruiser | 아키텍처 layer 규칙 | ★ | architecture.template 정합 |

**제외**: Daikon (JVM 전용 — invariant 추론 대안 없음). PMD (Java 전용).

→ static-runner Plugin host 에 `eslint` / `semgrep-typescript` / `osv-scanner` 3종 신규 plugin (★ Sprint 5 carry-over 또는 PoC #03 진행 중 자연 발생). 시뮬 절대 금지.

---

## 5. plan §4 결정 권장 (research 통합)

| ID | 결정 | 근거 |
|---|---|---|
| **DEC-PoC03-N1** (레포) | `lujakob/nestjs-realworld-example-app` master, commit `c1c2cc4`. prisma 브랜치 = inventory 항목으로 +α (이중 분석 ❌) | Document §1 |
| **DEC-PoC03-N2** (Frontend scope) | Backend only (PoC #01/#02 정합 / scope 관리) | plan 원안 유지 |
| **DEC-PoC03-N3** (TypeScript 타입 단계) | 본 PoC 데이터 수집 → ADR-009 v1.3 격상 후보. 측정 도구: `type-coverage` (any-ratio < 5%) | Senior 위험 4 + Document §4 |
| **DEC-PoC03-N4** (도구 의무) | drift-validator + decision-table-validator Phase 4.5 자가 검증 의무 (-5%p 패널티). v1.2.1 정합 | plan 원안 유지 |
| **DEC-PoC03-N5** (OpenAPI 출처) | **★ 갱신**: NestJS swagger 자동 생성 = ground truth (정적 추출 + 런타임 dump 2-way diff). 사용자 yaml = 검증 대상. `@ApiProperty`/`@ApiResponse` coverage 측정 의무 | Document §4 + Senior 위험 6 |
| **DEC-PoC03-N6** (Node static tools) | 3종 의무 (typescript-eslint strict + Semgrep p/typescript+p/owasp-top-ten+p/nestjs + OSV-Scanner) + 2종 권장 (CodeQL JS-TS / madge) + ★ type-coverage (위험 4) | Document §4 + Senior 위험 4 |

---

## 6. ★ PoC #03 진입 전 선결 (재작업 0 시퀀스 정합)

Senior 위험 1 ★critical 권고 — G6 (db-schema.template.md) ORM-specific sub-section 분리. PoC #03 Phase 2 진입 시 G6 적용 시 재작업 발생 ★high → **선결 권고**.

선결 작업 (별도 sprint 또는 본 진입 plan §0.5 신설):
- `templates/db-schema.template.md` 갱신 — "ORM derivative 분별" 섹션을 ORM 별 sub-section 분리 (Hibernate / TypeORM / Prisma / SQLAlchemy 4 enum)
- 일반 원칙만 본체 / 사례별 sub-template 분리

→ **plan §0.5 신설 + DEC-PoC03-N0 (선결) 신규 추가**.

추가 선결 후보 (위험 2~5):
- ADR-008 state-machine 추출 트리거 일반화 — Phase 4.5 진입 시 보강 (위험 2)
- `templates/rules.template.md` DTO/entity 분리 sub-section — Phase 4 진입 시 보강 (위험 3)
- ADR-009 단계 2.5 신설 — PoC #03 데이터 수집 후 v1.3 (보류)
- `templates/architecture.template.md` NestJS Module 가이드 — Phase 3 진입 시 보강 (위험 5)

본 PoC #03 의 **선결 = G6 만**. 위험 2~5 는 phase 진입 시 자연 발생 보강 (재작업 0 정합 — phase 별 sub-plan 영역).

---

## 7. 종합

- ✅ 레포 확정: `lujakob/nestjs-realworld-example-app` master `c1c2cc4`
- ✅ 6 결정 (DEC-PoC03-N1~N6) research 반영 갱신 권장
- ★ critical 선결 1건: G6 ORM-specific sub-section 분리 (PoC #03 Phase 2 진입 전)
- ✅ Static tools 3종 의무 + 2종 권장 (Node/TypeScript)
- ✅ NestJS 패턴 4종 (Module/Guards/DTO/Swagger) — Phase 별 분석 영향 명시
- ✅ §8.1 정합 — Java→TypeScript 일반화 검증 본질

→ 사용자 일괄 승인 후 G6 선결 작업 즉시 + Phase 0 진입.
