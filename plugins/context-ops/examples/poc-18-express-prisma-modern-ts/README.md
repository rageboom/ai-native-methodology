# PoC #18 — Modern Node/TS full-chain dogfood (chain-driver state machine E2E)

> **목적**: chain-driver **상태머신**을 외부(공개 OSS) Modern Node/TS 프로젝트 위에서 analysis(#0)→discovery(#1)→spec(#2)→plan(#3)→test(#4 RED)→implement(#5 GREEN) 전 구간 E2E 로 돌려 **실제(no-simulation) 동작**을 입증한다.
> **결과**: ✅ **상태머신 6 stage 전 구간 완주 (terminal 도달)**. 진짜 vitest 실행으로 genuine RED→GREEN 입증.
> **일자**: 2026-06-06 / **시나리오**: S1 재생성(forward) / **branch**: `poc/poc-18-node-ts-fullchain-dogfood`

---

## 1. 대상

| 항목 | 값 |
| --- | --- |
| repo | [devmahmud/express-prisma-typescript-boilerplate](https://github.com/devmahmud/express-prisma-typescript-boilerplate) |
| upstream HEAD | `ae44eb6f1aa3b41fb4d9ae2daa6e0bd1f4e83146` (clone 시점) |
| stack | Express 5 + Prisma 6 (PostgreSQL) + TypeScript 5.8 + **Vitest 3** + Zod |
| LICENSE | MIT (실 LICENSE 파일 + GitHub SPDX 양쪽 확인) |
| slice (chain 증분) | **post.service** 모듈 (createPost/queryPosts/getPostById/updatePostById/deletePostById) — 18 integration 테스트 |
| 범위 결정 | analysis = repo 전체 reverse-engineering / chain 1~5 증분 = post 슬라이스 (notification/file 물리 삭제 대신 **논리 scope** — runnable baseline 보존) |

## 2. 환경 (재현)

```bash
# 1) clone + nested .git 제거
git clone https://github.com/devmahmud/express-prisma-typescript-boilerplate.git target && rm -rf target/.git
# 2) deps (pnpm) + 누락 의존성 보정 (아래 finding F6)
cd target && pnpm install && pnpm add jsonwebtoken@9.0.2 && pnpm add -D @types/jsonwebtoken
# 3) test Postgres (docker) + test DB ('test' 포함 必 — setup.ts 가드)
docker compose up -d postgres
docker exec postgres-db psql -U postgres -c "CREATE DATABASE express_test;"
# 4) .env.test (DATABASE_URL=...express_test...) + 스키마 동기화 (init 마이그레이션 stale → db push)
DATABASE_URL="postgresql://postgres:secret@localhost:5432/express_test?schema=public" pnpm exec prisma db push
pnpm test   # baseline: 128 pass / 14 fail(upstream route/auth) → 슬라이스 post.service = 18/18 green
```

## 3. 결과 — AXIS 분리 (분모 다름, 한 숫자로 합치지 않음)

### AXIS 1 — chain-harness gate pass-through (process metric)

| gate | stage | 결정 | validator (실행) |
| --- | --- | --- | --- |
| #0 | analysis | **user-decision** (soft `evidence_missing`→`--user-decision go` / go-with-warnings) | schema✅ br-cross✅(0.975≥0.85) formal-spec-link✅ / decision-table=evidence_missing(의도적 생략) |
| #1 | discovery | AUTO (go-eligible) | discovery-extraction✅ schema✅ |
| #2 | spec | AUTO | chain-coverage✅ formal-spec-link✅ schema✅ (drift=skip) |
| #3 | plan | AUTO | schema✅ (plan-coverage=**skip** — finding F2) |
| #4 | test (RED) | AUTO | test-impl-pass✅(**실 vitest**: 0 pass/18 fail) spec-test-link✅(AC→TC 1.0) |
| #5 | implement (GREEN) | AUTO (terminal) | test-impl-pass✅(**실 vitest**: 18 pass/0 fail) traceability✅ / static-runner=env-carry(F8) |

- **5 auto / 1 user-decision (6 gate)** = **83% 자동 / 17% 사람**. (gate #0 user-decision 은 fail-closed 시연을 위해 decision-tables 를 의도적으로 생략한 결과 — empty dir 제공 시 6/6 auto 가능. "AI ≥85% / 사람 ≤15%" 경계 충족·시연 선택.)
- 전 gate 의 `state.json.last_gate.{id,stage,decision}` 전이 기록 = 결정론 evidence trail.

### gate #0 fail-closed (제3 line item / 어느 axis 도 아님)

- `next --dry-run` → `blocked / evidence_missing(decision-table-validator)` = **soft fail-closed** (silent pass 아님).
- `next --user-decision go` → `advanced_to: discovery / go-with-warnings` + intervention-log 기록 = **human checkpoint**.

### genuine RED→GREEN (no-simulation 핵심 / i-strict)

| | RED (chain 4) | GREEN (chain 5) |
| --- | --- | --- |
| impl | NOT_IMPLEMENTED throwing stub | 재생성된 PostService |
| vitest | **0 pass / 18 fail** | **18 pass / 0 fail** |
| result_hash | `sha256:b8532413...` | `sha256:d3764632...` (다름 = 진짜 상태 변화) |
| test 파일 | 미변경 | 미변경 (**i-strict 증명**: delta = impl 뿐) |

전 runner 호출 = Tier 1 실 vitest 3.2.4 (`pnpm exec vitest run test/modules/post/post.service.test.ts --reporter=json`). simulated_evidence_count=0.

### AXIS 2 — §3-A 추출률 (Modern)

본 run 에서는 **엄밀 측정 안 함**. analysis 산출물 6종(business-rules·domain·db-schema·antipatterns·architecture + discovery 이후 체인)을 LLM(나)이 코드 실측 기반 수작업 생성, 전부 strict schema VALID. openapi.yaml 미생성(5 이식성 산출물 중 4). analysis-extraction-validator 기대-set 미설정으로 추출률 백분율 비측정. (본 dogfood 주 타깃은 AXIS 1.)

> **§8.1 단일 PoC 과적합 회피**: 본 run = chain-harness 상태머신 메커니즘 **1건 corroboration** (단일 Modern Node/TS data point). paradigm-wide ceiling claim ❌. 본체 격상은 ≥2 distinct problem-domain 필요.

## 4. 방법론이 노출한 finding (dogfood 가치)

| # | finding | 분류 |
| --- | --- | --- |
| F1 | domain.json 은 use_cases 를 bounded_contexts 아래 **중첩**(domain.schema 준수)인데 discovery-extraction-validator 는 top-level `domain.use_cases` 를 읽음 → **UC coverage 체크 silent skip**(vacuous pass) | schema↔validator drift |
| F2 | findings-aggregator 가 비-analysis 단계에서 plan-coverage / drift validator 를 **skip** → gate #3 가 primary validator(plan-coverage) 미실행으로 통과 = **non-analysis fail-OPEN** (analysis 만 failClosedOnNull) | gate 강도 비대칭 |
| F3 | findings-aggregator 는 test-impl-pass-validator 에 `--allow-execute` 미전달 → chain 4/5 는 aggregator 불가, **CHANNEL B(DIRECT runner + 수동 findings 조립)** 필수 (plan load-bearing 확인) | 배선 갭 |
| F4 | schema-validator 는 `$schema_origin`/`$schema` 만 읽고 **`$schema_ref` 미인식** → db-schema 는 파일명 `db-schema.json` 또는 `$schema_origin` 필요 (poc-02 의 `$schema_ref` 라우팅은 실제로 skip) | 라우팅 함정 |
| F5 | upstream prisma init 마이그레이션에 Post/Comment 누락 → `migrate deploy` 만으로 스키마 불일치, `db push` 필요 (AP-DB-001) | upstream 결함 |
| F6 | upstream `jsonwebtoken` **팬텀 의존성**(미선언) → pnpm strict 에서 7 테스트 파일 깨짐 (AP-CONFIG-001) | upstream 결함 |
| F7 | **(self / 정직 기록)** gate #4 1차에서 findings-test 에 `schema-validator:ok` 를 **실행 없이 하드코딩** → test-spec.json 이 실제로는 schema-invalid(coverage.link_coverage number↔object, source_evidence array↔string) 였음. 전체 dir 재검증으로 사후 적발·수정. no-simulation 규율이 경계하는 self-simulation 함정 | 실행 정직성 |
| F8 | static-runner: semgrep 1.163.0 설치돼 있으나 spawnSync **ETIMEDOUT** → environment-missing 처리 = R19 Tier 1 **환경 의존 carry**(시뮬 ❌ / 차단 ❌) | 환경 carry |

## 5. plan 대비 정정 (실측 우선)

- gate #0 는 이미 main(`5429d9e0`)에 **커밋됨** — plan/메모리의 "미커밋"은 stale (실측 git 이 진실). D6 는 dogfood용 feature branch 생성으로 축소.
- D5 해소: discovery gate 는 `input/business-rules.json` + `input/domain.json` 을 **하드코딩**으로 읽음 → **input/ staging 필수** (manifest-only 불충분).

## 6. 산출물 위치

- `target/.aimd/state.json` — 상태머신 최종 상태(current_chain=implement, last_gate=#5)
- `target/.aimd/output/` — 11 체인 산출물 (analysis 6 + discovery/spec/ac/plan/test/impl-spec + matrix), 전부 strict schema VALID
- `target/.aimd/findings-*.json` — gate 별 findings (실 validator/runner 유래)
- `target/.aimd/evidence/` — vitest report + stdout/stderr (5종 물증 원본)
- `target/src/modules/post/post.service.ts` — GREEN 재생성 impl
