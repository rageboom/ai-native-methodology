# plan — F-ECOM-001 db-schema 명명 패턴 legacy 편향 fix

> 출처: session 64차 ecommerce-backend(NestJS+Prisma) dogfood. §8.1 2nd distinct domain corroboration 이 표면화. 사용자 결단 "F-ECOM-001 본체 fix (권장)".

## 문제 (1원칙 — 깊이 숙지)
`schemas/db-schema.schema.json` 의 table `name`(L32) + column `name`(L58) 패턴 = `^[a-z][a-z0-9_]*$` (소문자 snake_case 강제).
- Prisma 기본 매핑: model명=table명 PascalCase(`User`/`UserTokens`/`_CategoryToProduct`), field명=column명 camelCase(`userId`/`urlName`/`discountPercentage`).
- 1st 도메인 RealWorld(MyBatis/SQLite snake_case)=통과 / 2nd 도메인(Prisma)=11+ pattern 위반 RED.
- 패턴이 우연히 1st 도메인 명명 관행에만 맞은 legacy 편향. Modern ORM(Prisma/TypeORM default/JPA naming-strategy 미설정) 외부 사용자는 db-schema 산출물 첫 검증부터 RED.

## 변경 (additive / 회귀 0 구조적 보장)
- 두 패턴 → `^[A-Za-z_][A-Za-z0-9_]*$` (대소문자 + 선두 `_` 허용).
- snake_case ⊂ 신패턴 → 기존 valid schema 는 전부 valid 유지(strictly more permissive). PoC #01/02/03/14 schema.json(snake_case) 회귀 0.
- 선두 `_` = Prisma 암묵 join 테이블(`_CategoryToProduct`) 수용.
- description 갱신: "snake_case" → "snake_case 또는 Modern ORM PascalCase/camelCase".

## 회귀 검증 (2원칙 대체 — 사실 검증)
- 구패턴 reject 를 단언하는 test 부재 확인(test 는 snake_case 사용). 
- 회귀 = PoC #01/02/03/14 schema.json 재검증 valid 유지.
- ecommerce schema.json naming 위반 5 → 0 확인.
- workspace 전체 test + schema-validator self-test + release-readiness.

## release (4원칙 — 본체 격상 = release ceremony)
- v11.30.0 MINOR (schema 완화 = additive / breaking 0). 3-way version sync + CHANGELOG + DEC 신설 + INDEX.

## Lessons (실패 시 기록)
- (진행 중)
