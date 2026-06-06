# DEC-2026-06-01-db-schema-naming-modern-orm

> v11.30.0 MINOR release SSOT. db-schema 명명 패턴 legacy(snake_case) 편향 완화 — Modern ORM(Prisma/TypeORM/JPA) PascalCase/camelCase 수용.

## 맥락 (session 64차)

"세션시작 이어서" → STATUS 다음 의제 ②(≥2번째 distinct 도메인) → AskUserQuestion **"② 전체 baseline"**. 대상 = `alvaromrveiga/ecommerce-backend` (NestJS 8 + Prisma 3.14 + PostgreSQL / Type 1.5 operator dogfood). full dogfood (analysis 7대 산출물 + chain 1~5 + dep-graph) 수행 중 **F-ECOM-001** 표면화.

## 문제 (F-ECOM-001 / HIGH)

`schemas/db-schema.schema.json` 의 table `name`(L32) + column `name`(L58) 패턴 = `^[a-z][a-z0-9_]*$` (소문자 시작 snake_case 강제).

- Prisma 기본 매핑: model명 = table명 PascalCase(`User`/`UserTokens`/`_CategoryToProduct`), field명 = column명 camelCase(`userId`/`urlName`/`discountPercentage`).
- 1st 도메인(RealWorld MyBatis/SQLite snake_case) = 통과 / 2nd 도메인(Prisma) = 11+ pattern 위반 RED.
- 패턴이 우연히 1st 도메인 명명 관행에만 맞은 **legacy 편향**. Modern ORM(Prisma / TypeORM default / JPA naming-strategy 미설정) 사용 외부 프로젝트는 db-schema 산출물이 첫 검증부터 RED → 정직한 실명(實名) 사용 시 통과 불가.

## 결정 (additive / 회귀 0 구조적 보장)

- table name + column name 패턴 → `^[A-Za-z_][A-Za-z0-9_]*$` (대소문자 + 선두 `_` 허용).
- snake_case ⊂ 신패턴 = strictly more permissive → 기존 valid schema 전부 valid 유지 (relaxation 은 valid→invalid 전이 불가).
- 선두 `_` = Prisma 암묵 다대다 join 테이블(`_CategoryToProduct`) 수용.
- description 갱신: "snake*case" → "snake_case 또는 Modern ORM PascalCase/camelCase / 선두 * join".

## 검증 (no-simulation / 실 실행)

- 구패턴 reject 를 단언하는 test **부재** 확인 (graph-synthesizer test 는 snake_case 'users'/'t' 사용 → 무영향).
- ecommerce schema.json db-schema 검증: naming 위반 **5 → 0** (통과).
- workspace **1037 pass / 0 fail** (v11.29.0 baseline 동일 = 회귀 0). schema-validator canonical **40/40**.
- 3-way version sync 11.30.0 (plugin.json + package.json + CHANGELOG). check29 CLAUDE.md sync.

## ② dogfood 동반 corroboration (Type 1.5 / .aimd 산출물 = dogfood repo 한정 / 본 release 코드 미포함)

| 항목                 | 결과                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| chain 1~5            | discovery(UC 100%)→spec(21 BHV/30 AC)→plan(22 task/4 ADR)→test(30 TC)→impl 全 schema-valid                                                                      |
| traceability         | 30 cells / forward·backward **100%** / green 30 / red 0                                                                                                         |
| 실 GREEN             | jest 28.1.1 **56 tests PASS / 0 fail** (result_hash sha256:4fb73bc9…) — RealWorld(env-blocked Java/Gradle)를 넘어선 **chain 5 GREEN 게이트 2nd-domain 첫 실증** |
| code-pointer         | coverage **100%** (covered 40 / na 98 / missing 0 / 87 pointers)                                                                                                |
| A2 worktree          | clean=drift 0 / purchase.service.ts 미커밋 수정 → **2 노드 content_drift 라이브 탐지** → revert                                                                 |
| Slice4 db-schema→DDL | Prisma migration .sql **10 strict_path 앵커**(commit_hash 스탬프) = synthesizer "독립가치 ≥2 도메인 carry" 해소                                                 |

### §8.1 ≥2 distinct domain 재평가 (격상은 후속 결단)

- A2 usability / code-pointer 백스톱·src앵커 / Slice4 DDL = 2nd distinct domain(Prisma) 실증 → corroboration **충족 방향** (WARN→통과 격상 = 후속 사용자 결단).
- S2 gate WARN→block: characterization GREEN 실증되나 **s2-outcome-check/gate-eval 도구 자체 미실행** → 추가 carry.
- FE kinds: 본 repo BE-only → **FE 2nd 도메인 부재** carry 유지.
- Type 분류: Type 1.5(operator dogfood) / Type 2(외부 사용자) 별개.

## carry

- **F-ECOM-002/003/004** = RealWorld F-DOGFOOD-001/006/010 의 2nd-domain corroboration (autoschema skip / cross-ref base 불일치 / graph orphan 5 edge 미합성).
- **F-ECOM-004** (graph orphan edge 미합성): generic `to_analysis_artifacts` list → graph cross_reference edge 합성 추가 = 별도 fix 후보.
- **F-ECOM-005** (resolved): db-schema `source_files[]` 누락 시 Slice4 미발화 = skill 본문 안내 보강 후보.
- 코드 antipattern 9종(할인 미적용·재고 미차감·refresh 평문 저장 등) = dogfood repo 한정 finding.

STOP-3: workspace 1037 + RR (release:check) + skill-citation 0 stale + version 3-way 11.30.0 + breaking 0 = MINOR.

Extends DEC-2026-06-01-type2-capture-wiring.
