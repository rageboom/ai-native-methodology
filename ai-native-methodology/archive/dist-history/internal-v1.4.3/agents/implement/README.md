# agents/implement/ — placeholder (☐ 미래 lifecycle 확장)

현재 채움 없음. v2.0+ scope.

## 향후 채움 trigger (v2.0 lifecycle 확장 결단 시)

- **full-stack-implementer** — spec → 구현 코드 생성 / refactor-by-spec

## 5 영역 매트릭스 — implement stage

| 영역 | 강도 | 설명 |
|---|---|---|
| 기획 | ❌ | 적용 안 됨 (구현 = 기술 영역) |
| 디자인 | 약 | DTCG token 코드 적용 / component 시각 정합 |
| FE | 강 | UI / state / route / form / a11y / i18n 코드 (React / Vue / Svelte / Solid / Next / Nuxt) |
| BE | 강 | controller / service / repository / domain / migration 코드 (Spring / NestJS / Express / FastAPI / Rails / Hexagonal) |
| DB | 강 | schema migration / seed / index / 정합 제약 |
| 공통 | 강 | logging / observability / CI/CD / build artifact |

## 기술 스택 분기 정책

기술 스택별 차이는 SKILL.md 본문 분기로 표현 (★ analysis stage `phase-1-inventory` 패턴 차용 / v2.0 진입 시 SKILL.md 신설 시점에 적용 / 본 추상화 단계는 정책 선언만). 구현 stack 후보: Spring Boot / NestJS / Express / FastAPI / Rails / React / Vue / Svelte / Solid / Next.js / Nuxt / Prisma / TypeORM / JPA / SQLAlchemy / Mongoose.

## 인터페이스 (lifecycle-contract.md §테스트→구현)

- input (테스트→구현): test-plan + contract-test 코드 / 산출물 7종
- 산출물 (구현→배포): production code / 빌드 artifact
- ★ 사용자 시나리오 6번 (2026-05-02) — "구현부분은 없고". 본 추상화 단계 = 골격 placeholder 만 / ★ `methodology-spec/lifecycle-contract.md` §가치 경계 충돌 deferral 참조

## 가치 경계

본 방법론 ★★★ 가치 명세 = "legacy 코드 → 7대 산출물 한 방향 추출기 / round-trip 영구 scope 제외". 구현 stage 는 신규 시스템 구축 단계 — 본 방법론 산출물을 **입력 자료** 로 활용. 산출물 → 코드 자동 생성 같은 round-trip 은 영구 scope 외부.
