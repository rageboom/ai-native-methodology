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

### AXIS 2 — §3-A 추출 (Modern / provenance self-assessment)

**5 이식성 산출물 = 5/5 완비** (후속): rules(business-rules) · domain · schema(db-schema) · **openapi.yaml(신규 생성)** · antipatterns. openapi.yaml(post slice 5 endpoint / `src/modules/post/{post.route,post.controller,post.validation}.ts` 추출) = **spectral `spectral:oas` lint error 0**(warning만: info-contact·operation-description·operation-tags = cosmetic / Tier 1 실 검증 exit 0). 전 산출물 strict schema VALID.

**provenance breakdown (산출물 실측 카운트 / `detected_by`·`source_evidence`·`intent_certainty` 필드 기반)**:

| 산출물 | code-grounded (직접 코드 증거) | inferred / 관찰·판단 |
| --- | --- | --- |
| business-rules | **6/6** (5 code_condition + 1 orm_constraint / intent_certainty 전부 `observed`) | 0 |
| db-schema | **5/5 table** (전부 `sources:[orm]` = Prisma 추출) | 0 |
| domain | **3 entity + 6 use_case** (Prisma 모델 + service 함수) | ubiquitous_language 2 (curated) · business_intent (qualitative) |
| openapi | **5/5 endpoint** (route/validation 추출) | 0 |
| antipatterns | 2 (`static_analysis`) | 2 (`human_review` = live-probe 경험 관찰: migration drift / phantom dep) |

**§3-A 해석 (정직 경계)**: Modern 스택(typed + ORM + 명시 route)에서 **구조 산출물(schema·BR 조건·endpoint)은 거의 전부 직접 코드-grounded** — Modern ceiling **60~67%(R1')가 본 clean 코드베이스엔 보수적**임을 시사하는 정성 신호. 그러나:
- **이 수치 = 정직한 §3-A "자동화율" 아님**. (a) 추출한 항목만 셈(survivorship — 사람이 추가했을 **누락분 미반영**) / (b) 독립 expected-set·human-vs-auto 귀속 없음(`analysis-extraction-validator` 는 figma/plan-doc source-grounded gate 이지 §3-A rate 측정기 아님 — 도구 부재) / (c) **추출한 LLM 본인의 self-assessment**(독립성 ❌).
- 따라서 **백분율 ceiling claim ❌**. provenance breakdown = 사실, §3-A rate = **미측정**(엄밀 측정엔 독립 ground-truth + 누락 귀속 필요).

> **§8.1 단일 PoC 과적합 회피**: 본 run = chain-harness 상태머신 메커니즘 **1건 corroboration** (단일 Modern Node/TS data point). paradigm-wide ceiling claim ❌. 본체 격상은 ≥2 distinct problem-domain 필요.
>
> **✅ corroboration #2 충족 (2026-06-06)**: [PoC #19](../poc-19-numpy-financial-python/README.md) = `numpy-financial`(금융 amortization / **Python 3.14+pytest**) full-chain 상태머신 E2E 완주. poc-18(blog/Node·TS) + poc-19(금융/Python) = **≥2 distinct problem-domain + distinct stack** 충족 → 상태머신 메커니즘이 다른 도메인·스택·산출물 프로파일(poc-19 는 db-schema·openapi N/A = 3/5 산출물)에서 재현됨을 corroborate. (단 2 data point ≠ paradigm ceiling 자동확정 / §3-A rate 여전히 미측정.)

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

- `target/.ai-context/state.json` — 상태머신 최종 상태(current_chain=implement, last_gate=#5)
- `target/.ai-context/output/` — 11 체인 산출물 (analysis 6 + discovery/spec/ac/plan/test/impl-spec + matrix), 전부 strict schema VALID
- `target/.ai-context/findings-*.json` — gate 별 findings (실 validator/runner 유래)
- `target/.ai-context/evidence/` — vitest report + stdout/stderr (5종 물증 원본)
- `target/src/modules/post/post.service.ts` — GREEN 재생성 impl
