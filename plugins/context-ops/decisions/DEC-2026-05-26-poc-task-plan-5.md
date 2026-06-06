# DEC-2026-05-26-poc-task-plan-5

> v10.1.1 PATCH — C-v4.1-poc-재실행 carry 부분 종결. 5 PoC task-plan.{json,md} 생성 (plan-agent v10.0.0 본격 dispatch 결과 / Type 1 self-run corroboration). 잔여 서브-carry: poc-06/07/08/09/10 = spec stage 미실행 (별도). additive PoC artifact / methodology 무변경 / breaking 0 = PATCH.

- **결단 일자**: 2026-05-26 (v10.1.1 PATCH)
- **결단자**: 윤주스 (TF Lead) — "마지막 carry 처리하자" → option A 채택 (5 가능 PoC 전부 + spec 부재 5 = 서브-carry)
- **범주**: corroboration / PoC artifact (plan stage e2e 입증)
- **상태**: 승인 / breaking 0 / PATCH

## 컨텍스트

DEC-2026-05-21 carry `C-v4.1-poc-재실행` (기존 PoC 에 discovery·plan stage 추가 재실행) 가 v10.0.0 plan-agent 본격 구현 후에도 미해소. v10.0.4 / v10.0.5 trigger carry 로 보류. 사용자 "마지막 carry 처리하자" → 점검 결과:

- **5 PoC 가능** (behavior-spec + acceptance-criteria 보유): poc-03, poc-04-mini, poc-05, poc-11, poc-14
- **5 PoC 불가** (spec stage 미실행 / 5종 산출물 ✗): poc-06, poc-07, poc-08, poc-09, poc-10 — task-plan 은 schema 상 behavior_spec_path + acceptance_criteria_path 필수 입력

사용자 결단: option A (5 가능 PoC 전부 + 5 spec 부재 = 서브-carry 표면화).

## 결정

### §1. 5 PoC task-plan.{json,md} 생성 (Type 1 self-run)

| PoC                            | tasks  | ADRs  | risks  | NFR    | layer/module 특성                            |
| ------------------------------ | ------ | ----- | ------ | ------ | -------------------------------------------- |
| poc-04-mini-realworld-react    | 1      | 1     | 2      | 3      | presentation/auth (FE Login + JWT)           |
| poc-05-sample-user-register    | 2      | 1     | 4      | 4      | application/user (signup + login / argon2)   |
| poc-03-realworld-nestjs        | 2      | 2     | 4      | 4      | application/user (RealWorld 규약 JWT)        |
| poc-14-fsim-corroboration      | 4      | 2     | 4      | 4      | application/user+todo (IDOR 차단)            |
| poc-11-efiweb-billing-spring41 | 6      | 2     | 5      | 4      | 사내 EFI-WEB billing / characterization mode |
| **합계 (5 PoC)**               | **15** | **7** | **18** | **19** | —                                            |

**각 task 의무 정합** (DEC-2026-05-21 §정책 + schema):

- task granularity = 1~3 AC 묶음 (같은 BHV + 같은 layer + 같은 module / schema maxItems:3 enforce) — 5 PoC 모두 충족
- ADR alternatives ≥3 강제 + status enum (proposed/accepted/deprecated/superseded) — 7 ADR 모두 충족
- risks severity enum (critical/high/medium/low) — 18 risks 모두 충족
- NFR ISO/IEC 25010:2023 9 characteristic enum — 19 NFR 모두 충족

**schema-validator VALID 5/5** (task-plan.schema.json against 5 task-plan.json).

### §2. Type 1 self-run corroboration ≥ 5

§8.1 strict ≥ 2 PoC corroboration 의무 충족 (5 ≫ 2). plan stage chain harness e2e 입증 — plan-agent v10.0.0 본격 dispatch 결과. 5 PoC 가 different 도메인 / 다른 stack (React FE / NestJS / sample / characterization legacy / F-SIM) 단일 PoC 과적합 회피 §8.1 정합.

### §3. 잔여 서브-carry (5 PoC / spec stage 부재)

`C-v4.1-poc-재실행` 부분 종결 (5/9). 잔여 서브-carry:

- **poc-06-efiweb-exchange-spring41** — spec stage 미실행
- **poc-07-efiweb-capital-spring41** — spec stage 미실행
- **poc-08-realworld-mybatis** — spec stage 미실행
- **poc-09-realworld-typeorm-rawsql** — spec stage 미실행
- **poc-10-realworld-jpa-querydsl** — spec stage 미실행

각 PoC × spec stage(behavior-spec + AC) 실행 = task-plan 보다 더 heavy 작업. v10.x carry / 사용자 결단 의무 / deadline 없음.

## STOP-3

- release-readiness 20/20 ready (보존)
- skill-citation 0 stale + version 3-way 10.1.1 + breaking 0 = PATCH

## carry (잔여)

- C-v4.1-poc-재실행 (5/9 종결 / 잔여 5 PoC = spec stage 미실행 / 서브-carry)
- (선택) 5 PoC matrix.json 업데이트 = TASK layer 반영 (v10.0.0 traceability schema 확장 / 부가 작업)
- (선택) 5 PoC plan-coverage-validator dry-run = 본격 validator 실행 (현 task-plan.json 만 schema-validator 통과 / plan-coverage 추가 검증)

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (C-v4.1-poc-재실행 carry 모 결단)
- DEC-2026-05-25-axis-a-phase-4-1 + DEC-2026-05-25-axis-a-phase-4-4-prime (plan-agent v10.0.0 본격 / 본 DEC dispatch 기반)
- `agents/plan-agent.md` v10.0.0 본격 (chain 3 = gate #3 / 본 산출 dispatch)
- `schemas/task-plan.schema.json` (산출 schema)
- Michael Feathers, _Working Effectively with Legacy Code_ (poc-11 characterization mode ADR source)
- OWASP Password Storage Cheat Sheet (poc-03/05/14 argon2id ADR source)
