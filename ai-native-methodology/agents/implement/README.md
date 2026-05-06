# agents/implement/ — chain 4 (구현) stage agent (★ v2.0 / i-strict)

★ ★ ★ v2.0 SDLC 4단계 chain harness 의 chain 4 stage / **i-strict 정통** (AI 자동 impl 코드 생성 + 사용자 검토). DEC-2026-05-06-v2.0-i-strict-채택 정합. master plan `~/.claude/plans/a-stateful-gadget.md`.

## 역할

chain 4 (implement) = **test-spec 기반 실 impl 코드 자동 생성** (GREEN 의무 — 모든 test 100% pass). 산출물 = `impl-spec.{json,md}` (deliverable 21 / sub-plan-2 신설) + 실 impl 코드 + production artifact.

★ ★ ★ **no-simulation 강화** — test-impl-pass-validator 진짜 runner 호출 / 5종 물증 7 필드 + impl_test_pass_rate (100% 의무) + coverage_report + linter.

## agent persona (sub-plan-4 정식 채움)

| persona | 역할 |
|---|---|
| **full-stack-implementer** | spec → 구현 코드 자동 생성 / refactor-by-spec |
| **test-pass-verifier** ★ v2.0 신설 | 진짜 runner 실행 / 100% pass 검증 / 5종 물증 보존 |
| **revisit-detector** ★ v2.0 신설 | impl 변경 시 spec/test 영향 자동 감지 → chain-revisit-detector 통합 → 사용자 prompt |

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

기술 스택별 차이는 SKILL.md 본문 분기로 표현 (★ analysis stage `phase-1-inventory` 패턴 차용). 구현 stack 후보: Spring Boot / NestJS / Express / FastAPI / Rails / React / Vue / Svelte / Solid / Next.js / Nuxt / Prisma / TypeORM / JPA / SQLAlchemy / Mongoose.

## 인터페이스 (lifecycle-contract.md §chain 4)

- input (test → implement): test-spec.json + 실 test 코드 (RED) + behavior-spec + 7대 산출물
- 산출물 (implement → 종결): impl-spec.json + 실 impl 코드 (GREEN / 100% test pass) + 5종 물증 + production artifact
- ★ ★ ★ go/stop gate #4 (사용자 검토 / ADR-CHAIN-002 정합)
- ★ ★ ★ test-impl-pass-validator 의무: 진짜 runner 호출 / 모든 TC-* pass / coverage_report ≥ 0.85

## skills

- `skills/implement/generate-impl-spec/` ★ sub-plan-4 신설 (chain 4 main)
- `skills/implement/verify-test-pass/` ★ sub-plan-4 신설 (진짜 runner / 100% pass)

## 가치 경계 (★ v2.0 갱신)

★ ★ ★ **chain harness 안에서 round-trip 정식 허용** (DEC-2026-05-06-round-trip-부분-허용 / DEC-2026-04-29 partial retract):

| 영역 | scope |
|---|---|
| 산출물 → 신규 코드 자동 생성 (chain 4 안) | ✅ 허용 |
| AI 시뮬 (구현 정확성 시뮬) | ❌ no-simulation 강화 (5종 물증 7 필드) |
| harness 외부 자동 코드 생성 | ❌ scope 외 |
| 70~80% 한계 | ★ 명시 잔존 (gate #4 ≤ 15%) |

★ ★ Lessons Learned 14차 retract pattern (단일 source-of-truth 위배) 회피 — research-first / Babel/Yarn/Sentry 사례 사전 검토 / 6 sub-plan 분할 진입.
