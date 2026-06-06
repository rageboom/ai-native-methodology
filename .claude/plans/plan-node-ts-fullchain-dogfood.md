# plan — Node/TS full-chain dogfood (외부 프로젝트 state machine E2E 검증)

> 작성 = 2026-06-06 / 4원칙 1·2 산물 (깊은 숙지 + research). 본 파일은 **사용자 승인 후 실행** (4원칙 3).
> research 출처 = 3 sub-agent (candidates / execution-procedure / scenario-risks). **검증된 사실 / UNVERIFIED / 충돌**을 명시 구분 — 매끄럽게 봉합하지 않음.

---

## 0. 목표 & 성공 기준

### 무엇을 검증하는가
chain-driver **상태머신**을 외부(공개 OSS) Modern Node/TS 프로젝트 위에서 **analysis(gate #0) → discovery(#1) → spec(#2) → plan(#3) → test/RED(#4) → implement/GREEN(#5)** 전 구간 E2E 로 돌려, 다음 세 가지가 **실제(no-simulation)** 로 동작함을 입증한다.

1. **chain 1~5 gate 전이** — 각 gate 에서 chain-driver 가 결정론적 pass/block 을 산출하고, `state.json.last_gate.{id,stage,decision}` 가 전이마다 갱신.
2. **gate #0 (analysis soft exit gate / fail-closed)** — DEC-2026-06-06-analysis-exit-gate. 빈/불완전 manifest → `evidence_missing` soft block → `--user-decision go` 로 진행. planted violation → critical/high → HARD-BLOCK.
3. **revisit loop** — chain-revisit-detector → 사용자 prompt → go/stop. stop 시 임의 stage jump 가능 확인.

### "잘 동작한다"의 측정 정의 — **두 axis 는 분모가 다르다, 절대 한 숫자로 합치지 않음** (automation-boundary.md §2)

| 측정 항목 | axis | 분모 | 타깃 |
| --- | --- | --- | --- |
| chain-harness gate pass-through | **AXIS 1** (process metric) | chain 1~5 통합 gate 통과율 | AI ≥85% / 사람 go/stop ≤15% / 100% 자동 ❌. "5 gate 중 N auto-pass, M user-decision" 으로 보고 |
| analysis §3-A 추출률 | **AXIS 2** (단방향 추출률) | analysis 단계 5 이식성 산출물 추출 vs 기대 | Modern ceiling **~60~67%** (R1' / OSS corroborated). 단일 Modern data point 로 라벨 |
| gate #0 fail-closed 거동 | **제3 line item (어느 axis 도 아님)** | — | soft block→go 진행 / planted violation→HARD-BLOCK. automation-boundary.md note 로 두 axis 에서 제외 |

> **§8.1 단일 PoC 과적합 회피 강제**: 본 run 은 **메커니즘 1건 corroboration** 이지 paradigm-wide 결론 아님. 어떤 ceiling/한계 claim 도 ≥2 distinct problem-domain 필요 (기존 modern 선례 poc-08/09/10 = RealWorld blog 도메인 → execution-grade corroboration 위해서는 **다른 도메인** 필요). 1 PoC 로 본체 격상 ❌.

---

## 1. 대상 프로젝트 후보 & 추천

> 모든 fact = live GitHub raw/API fetch 로 검증 (학습-데이터 recall 아님). LOC = languages 엔드포인트 byte-count 추정 (정확한 line count 아님).

| # | repo | 언어/runner | ORM/DB | 규모 | LICENSE | stars | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **추천** | [devmahmud/express-prisma-typescript-boilerplate](https://github.com/devmahmud/express-prisma-typescript-boilerplate) | TS ^5.8.3 / **Vitest ^3.2.4** + supertest | **Prisma 6** (5 model: User/Token/Notification/Post/Comment + enum, PostgreSQL) | ~70+ .ts, **~4~5k LOC (타깃 <3k 초과)** | **MIT — LICENSE 파일 + API SPDX=MIT 양쪽 실측 확인** | 2 (낮음) | 4 layer 실 테스트(controller/service/route/repo) + supertest 통합. feature-modular(auth/post/user/notification) |
| fallback | [sushantrahate/express-typescript-prisma-postgresql](https://github.com/sushantrahate/express-typescript-prisma-postgresql) | TS ^5.8.2 / Vitest ^3.0.8 + supertest | Prisma 6 (2 model: User/Roles, 1 FK) | ~22 .ts, **~1.2k LOC (가장 적정)** | **RISK/UNVERIFIED — package.json="MIT" but LICENSE 파일 부재 + GitHub SPDX 미검출(/main/LICENSE = 404)** | 41 (최다) | 4 layer 테스트 존재. slicing 불필요. **license 가 dealbreaker** |
| 3안 | [josephgodwinkimani/tRPC-fastify-starter](https://github.com/josephgodwinkimani/tRPC-fastify-starter) | TS ^5.3.3 / **Jest ^29.7.0** + ts-jest + supertest | **Drizzle ^0.29.3** (MySQL, single 'account') | ~17 .ts, <3k LOC | **RISK/UNVERIFIED — 동일 (package.json MIT, LICENSE 파일/SPDX 부재)** | 6 | ORM 다양성(Drizzle). **tRPC=REST 아님 → openapi/endpoint 추출 chain 1~2 복잡화** + tRPC 11 beta churn |
| ❌제외 | bitxon/ts-node-express-drizzle | — | Drizzle | — | **NO license at all (실측)** | — | 자격 박탈 |

### 추천 = devmahmud/express-prisma-typescript-boilerplate (1순위)
**근거**: 세 후보 중 **유일하게 실 LICENSE 파일 + SPDX 양쪽 MIT 확인**. 산출물(business-rules/domain 등) 공개 가능성이 있는 dogfood 에 license 가 결정적. + 5-model Prisma 스키마(진짜 FK 관계 → 강한 `schema.json` 추출) + Express 5/Prisma 6/Vitest 3/Zod modern + layered 실 테스트.
**단점 = 규모** (~4~5k LOC > <3k 타깃). → **첫 chain 1~5 dogfood 에서는 scope 를 `user + post` 모듈로 slice** (notification/file/redis/email drop) 하여 2 관계 엔티티 + 다수 REST endpoint + auth middleware + 기존 테스트를 모두 exercise 하면서도 bounded.

**fallback 채택 조건**: sushantrahate 의 MIT 를 저자에게 확인(issue) 또는 나중 추가된 LICENSE 확인 시 — 최적 규모(slicing 불필요)이므로 license 만 해소되면 1순위 교체 가능. **현 시점 license unverified → 채택 불가.**

---

## 2. 시나리오 분류 (S1/S3) & bootstrap 입력

### 분류 결정 = **S1 재생성(forward)** — S3 아님 (양 research agent 합치)
use-scenario-taxonomy.md §2 matrix 기준:
- S1·S3 **둘 다 "legacy 코드"를 bootstrap 입력**으로 받고 동일 analysis 코드-고고학 패스 → **입력 adapter 동일**. 판별자 = chain 4/5 의 **종료 상태**(입력 아님).
- **full chain 1~5 dogfood 는 정의상 chain 4(RED) + chain 5(implement/GREEN)로 실 코드 생성** = S1 정의("test 대상 = 생성될 코드(legacy 아님)"). RED = 생성될 코드 부재 / GREEN = 생성될 코드 pass.
- **S3 = 재생성 없음 / 기존 동작 snapshot GREEN** — chain 5 implement 로 신규 코드 emit 안 함. 5 chain 다 돌려 코드 생성하면 S3 아님.
- **S2 아님** = in-place augmentation of EXISTING codebase you own/keep. download-and-rebuild OSS 는 forward 재생성. (S2 가 방법론 주 타깃이나 본 dogfood 형태와 불일치.) + **s2_outcome_mismatch = HARD_BLOCK_CODE(rank 1)** 로 무거움.
- **greenfield 아님** = 코드 입력 존재(코드-고고학 패스 돌아감).

### gate-eval 근거 (SCENARIO_EXPECTED / sdlc-4stage-flow.json gates[#4].scenario_expected)
- S1 = `{ test:'all_fail'(RED), implement:'all_pass'(GREEN) }` — task 가 요구한 genuine RED→GREEN 그대로.
- S3 = `{ test:'snapshot_green', implement:'all_pass' }` — **RED 강제 안 함**(gate-eval ~L147-157 은 S1/greenfield 에서만 all_fail check) → genuine RED→GREEN cycle 입증 불가.

### bootstrap 입력 방식
scenario 는 **init 시점에 seed** — `chain-driver init <proj> --scope <slug> --scenario S1` (cli.js cmdInit → ensureScopeDir → manifest.scenario 기록). cmdNext 가 `readManifest(root, current_scope).scenario` 로 읽어 evaluateGate 에 전달. scope/scenario 부재 시 gate 는 'S1' default(backward-compat).
→ **work-unit-manifest.scenario 에 S1 명시** (taxonomy §4 — discovery-spec 에 묻지 말 것).

> **⚠️ open question (research, UNVERIFIED)**: "S1 기존 slice 재생성" vs "S2 augmentation" 경계는 download 코드에서 genuine 판단. 정직한 RED 를 만들려면 chain 4 시점에 타깃 impl 이 실제 부재/throw 여야 함 → 기존 impl 을 (a) 옆으로 move/rename 하여 import 미해결/throw 강제, 또는 (b) 신규 augmentation behavior 추가(S2 에 가까움). **§8 결정 묶음 D4 에서 사용자 판단 요청.**

---

## 3. stage별 실행 절차 (analysis → implement)

> 공통 base skill: `_base-build-traceability-matrix` / `_base-apply-template` / `_base-log-finding` / `_base-invoke-go-stop-gate`.
> findings = **REAL JSON per stage (no simulation / R19)**. 두 채널 — A=findings-aggregator(deterministic validator 만 / analysis·discovery·spec·plan 편의), B=DIRECT validator run(**test/implement 5종 물증 MANDATORY**, §3 chain4/5 참조).

### chain 0 — analysis (soft exit gate #0 / fail-closed)
- **agent**: analysis-agent
- **skill**: analysis-input-collection(entry) → analysis-source-inventory → analysis-architecture → analysis-domain-model → analysis-business-rules(dual repr NL + given/when/then) → analysis-br-cross-consistency-check(Layer1 det + **Layer2 LLM sub-agent**) → analysis-quality-antipattern → analysis-openapi / analysis-type-spec-fe(Node/TS aspect, code-signal matched)
- **입력**: 다운로드 Node/TS 소스 트리(slice 후 user+post) / `<proj>/.aimd/state.json`(init 후) / `<proj>/.aimd/<scope>/manifest.json`(analysis_refs.artifacts + scenario)
- **출력**: `<proj>/.aimd/output/` — inventory.json / architecture.json / domain.json / rules.json(business-rules.json) / schema.json(Prisma 5-model RDB) / openapi.yaml / antipatterns.json / migration-cautions.json / formal-spec/(decision-tables 등) / **findings-analysis.json(gate #0 evidence)**
- **gate**: **#0** (analysis soft exit / fail-closed)
- **validators (gate-eval REQUIRED_VALIDATORS_PER_STAGE.analysis = 4 base)**: schema-validator · br-cross-consistency-validator · formal-spec-link-validator · decision-table-validator · (조건부) characterization-coverage-validator[S2/S3만 → **S1 이므로 미적용**] · (조건부) sql-inventory-validator[RDB만 → Prisma=RDB **적용**]
- **findings 생성(CHANNEL A)**: `node tools/findings-aggregator/src/cli.js --target <proj> --stage analysis --output <proj>/.aimd/output/findings-analysis.json` — aggregator.js 가 execFileSync 로 각 validator cli.js 실행 → transform → severity/coverage merge. manifest.analysis_refs.artifacts 로 path resolve / fail-closed(null arg → evidence_missing).

### chain 1 — discovery (gate #1)
- **agent**: discovery-agent
- **skill**: discovery-from-analysis-output(analysis-output adapter) → discovery-decompose-use-cases → discovery-identify-business-intent
- **입력**: analysis 7대 산출물(rules/domain/openapi/inventory/...) / `<proj>/input/business-rules.json` + `input/domain.json`(discovery-extraction-validator 가 읽음) — **⚠️ 아래 open question**
- **출력**: `<proj>/.aimd/output/discovery-spec.json`(UC-* + business_rules_intent + source_grounded_evidence grep_hit_count>0)
- **gate**: **#1**
- **validators (gate-eval REQUIRED = 앞 3)**: discovery-extraction-validator · schema-validator · br-cross-consistency-validator (flow 는 formal-spec-link-validator --chain-mode 도 나열)
- **findings**: CHANNEL A `--stage discovery`

> **⚠️ open question (UNVERIFIED)**: discovery-extraction-validator / aggregator 가 `<proj>/input/business-rules.json` + `input/domain.json` 를 가정(buildValidatorArgs). 다운로드 프로젝트엔 `input/` 비표준. → analysis 출력을 수동으로 `<proj>/input/` 에 staging 해야 하는지, 아니면 manifest.analysis_refs.artifacts map 만으로 충분한지 **path convention 미검증**. live run 으로 확인 / §8 D5.

### chain 2 — spec (gate #2)
- **agent**: spec-agent
- **skill**: spec-compose-behavior-spec(UC→BHV 1:N) → spec-derive-acceptance-criteria(BHV→AC Gherkin, verifiable=true → test_case_refs≥1) → spec-integrate-deliverables(7대 통합)
- **입력**: discovery-spec.json / analysis formal-spec/(state-machine/sequence/decision-table/invariant)
- **출력**: behavior-spec.json(BHV-*) / acceptance-criteria.json(AC-*) / traceability-matrix.json(partial)
- **gate**: **#2**
- **validators**: chain-coverage-validator · drift-validator · formal-spec-link-validator · schema-validator (flow: chain-coverage --antipatterns, decision-table-validator; OpenAPI 있으면 조건부 spectral-runner)
- **findings**: CHANNEL A `--stage spec`

### chain 3 — plan (gate #3)
- **agent**: plan-agent
- **skill**: plan-decompose-and-sequence(task granularity 1~3 AC, 동일 BHV+layer+module) → plan-architect-decisions(ADR alternatives ≥3) → plan-risk-and-nfr(NFR allocation HARD gate + risks[])
- **입력**: behavior-spec.json / acceptance-criteria.json
- **출력**: task-plan.json(tasks / dependencies / ADR ≥3 alts / nfr_allocation / risks / rollback)
- **gate**: **#3**
- **validators**: plan-coverage-validator · schema-validator
- **findings**: CHANNEL A `--stage plan`

### chain 4 — test (gate #4 / **RED 의무**)
- **agent**: test-agent
- **skill**: test-generate-test-spec(AC-* → TC-* + 실 .test.ts, framework from inventory.stack_signals=vitest) → test-run-test-evidence(test-impl-pass-validator **--allow-execute** → 5종 물증) → test-verify-coverage(AC→TC link_coverage ratchet 0.85) → (필요시) test-playwright
- **입력**: acceptance-criteria.json(AC-*) / task-plan.json / behavior-spec.json
- **출력**: test-spec.json(TC-* + per-TC test_run_evidence 5종 물증) / 실 *.test.ts(vitest) / `<proj>/.aimd/output/evidence/test-invocation-evidence.json`(RED: fail_count>0, pass_count=0)
- **gate**: **#4**
- **validators**: test-impl-pass-validator(expected all_fail / RED under S1) · spec-test-link-validator · schema-validator (flow: lint-no-simulation chain-strict)
- **findings(CHANNEL B — MANDATORY DIRECT, aggregator 불가)**:
  ```
  node tools/test-impl-pass-validator/src/cli.js --target <proj> --allow-execute --json \
    --out <proj>/.aimd/output/evidence/test-invocation-evidence.json
  ```
  → emit {pass_count, fail_count, skip_count, result_hash(sha256), evidence_path, framework} = 5종 물증. 이를 gate-eval 이 읽는 findings shape 으로 transform(transformTestImplPass mirror): `tests_total=pass+fail+skip, tests_passed=pass, tests_failed=fail`. spec-test-link + schema 결과와 합쳐 **손으로 조립한 findings-test.json**(test count inject).

  > **이유(load-bearing)**: findings-aggregator 의 buildValidatorArgs 는 test-impl-pass-validator 를 `['--target', projectDir, '--json']` 로만 호출 — **--allow-execute 없음**. validator(cli.js ~L341)는 --allow-execute 또는 --dry-run 요구 → 없으면 **exit 2**, 실 runner 미실행 → tests_total 부재. aggregator 경로는 chain 4/5 에 **쓸 수 없다**. (⚠️ 정확한 failure mode = exit-2 stdout 을 aggregator 가 삼켜 tests_total 없는 findings 를 내는지, 아예 실패하는지는 **live run 확인 필요** — research open question.)

### chain 5 — implement (gate #5 / **GREEN 의무 / i-strict / terminal**)
- **agent**: implement-agent
- **skill**: implement-generate-impl-spec(test-spec → impl code + impl-spec.json IMPL-*) → implement-verify-test-pass(test-impl-pass-validator **--allow-execute --detect-mock-impl=experimental** → GREEN 100%) → test-run-test-evidence(GREEN evidence reuse) → (framework) implement-react/implement-vue → _base-build-traceability-matrix(100% green)
- **입력**: test-spec.json + **chain 4 의 동일 실 test 파일(test 코드 미변경 = 증명)** / behavior-spec / acceptance-criteria
- **출력**: impl-spec.json(IMPL-* + commit_hash) / 실 impl 코드 / `<proj>/.aimd/output/test_pass_evidence.json`(5종 물증 / fail_count:0 / GREEN) / matrix.json(UC→BHV→AC→TC→IMPL 100% green)
- **gate**: **#5** (terminal — next stage 없음)
- **validators**: test-impl-pass-validator(expected all_pass / fail_count:0 / GREEN) · **static-runner(R19 Tier 1 Semgrep/ESLint real exec)** · traceability-matrix-builder (flow: lint-no-simulation, schema-validator, chain-coverage, spec-test-link)
- **findings(CHANNEL B — MANDATORY DIRECT)**:
  ```
  node tools/test-impl-pass-validator/src/cli.js --target <proj> --allow-execute \
    --detect-mock-impl=experimental --impl-dir <proj>/src --json \
    --out <proj>/.aimd/output/test_pass_evidence.json
  ```
  → fail_count=0, pass_count=N(>0), ok_state='ok', deterministic result_hash. findings-implement.json = tests_total=N, tests_passed=N, tests_failed=0 + static-runner + traceability-matrix-builder(matrix 100% green).
  > gate-eval: implement 는 tests_total==null 이면 차단(I9 fail-open guard) → 실 runner 결과 필수. simulated_evidence_count>0 → permanent reject.

### chain 4 RED / chain 5 GREEN 구체 전략 (다운로드 프로젝트의 어떤 slice 를 TDD)
**1 thin vertical slice** 만 forward TDD(S1). 권장 = user+post slice 중 **단일 service/use-case 함수** (1 UC → 1 BHV → 1~3 AC → ≥1 TC → 1 IMPL).
- **RED 을 genuine 하게** (가짜 fail ❌): chain 4 시점에 test 가 import 하는 impl 심볼이 **부재 또는 throw-stub** 이어야 함. 두 valid 방법 — (a) 타깃 behavior 의 기존 impl 을 옆으로 move/rename → test import 미해결/throw, (b) 기존 코드가 만족 못 하는 신규 augmentation behavior 추가. 어느 쪽이든 compile/import-fail or assert-fail = RED.
- **GREEN**: implement 가 동일 slice 의 impl 을 **chain 4 test 파일 미변경**으로 작성 → 동일 runner 재실행 → all pass. RED→GREEN delta 가 오직 추가된 impl 에 귀속 = i-strict 증명. mock_detect 가 mock-only impl 의 가짜 GREEN 방지(degraded_mock warning).

---

## 4. chain-driver CLI 명령 시퀀스 (init → next ×5)

> **⚠️ resolveRepoRoot 주의 (검증)**: cli.js resolveRepoRoot(L1524~) 는 위로 걸어 올라가며 `flows/sdlc-4stage-flow.json` 을 찾는다. **이 파일은 `plugins/context-ops/flows/` 에만 있고 repo root 에는 없음**(실측: ROOT flows MISSING / PLUGIN flows EXISTS). + `--repo-root` 는 전역 파싱(L138)되나 init/next 의 gate 평가는 `resolve(args.project)`(project root)와 policy/skill-meta 의 `resolveRepoRoot(process.cwd())` 에 의존. 따라서 **반드시 cwd = 플러그인 루트에서 실행**. **sub-agent cwd 는 bash call 마다 reset** → 매 명령 cwd 보장 필수.
>
> ⚠️ open question(UNVERIFIED): next 가 런타임에 flow 파일을 실제로 필요로 하는지(stage-graph.nextStage 는 하드코딩 STAGES array 사용) vs policy/skill-meta lookup 만 cwd 의존인지 — live run 으로 확인. 안전책 = 항상 플러그인 루트 cwd.

```bash
# 매 명령 앞에 (sub-agent cwd reset 대비) cwd 보장:
cd /Users/sangcl/Documents/Development/Study/ai-native-methodology/plugins/context-ops

# (0) init — scope + scenario S1 seed. <project>=절대경로. .aimd/state.json(current_chain=analysis) + .aimd/<scope>/manifest.json{scenario:S1}
node tools/chain-driver/src/cli.js init <ABS_PROJ> --scope core --scenario S1
# ... analysis-agent skill 실행, .aimd/output/* + manifest.analysis_refs.artifacts 작성 ...
node tools/findings-aggregator/src/cli.js --target <ABS_PROJ> --stage analysis \
  --output <ABS_PROJ>/.aimd/output/findings-analysis.json

# (1) next: gate #0(analysis) → discovery 전이
node tools/chain-driver/src/cli.js next <ABS_PROJ> --findings <ABS_PROJ>/.aimd/output/findings-analysis.json
# ... discovery skill → discovery-spec.json ...
node tools/findings-aggregator/src/cli.js --target <ABS_PROJ> --stage discovery --output <ABS_PROJ>/.aimd/output/findings-discovery.json

# (2) next: gate #1(discovery) → spec
node tools/chain-driver/src/cli.js next <ABS_PROJ> --findings <ABS_PROJ>/.aimd/output/findings-discovery.json
# ... spec skill → behavior-spec.json + acceptance-criteria.json ...
node tools/findings-aggregator/src/cli.js --target <ABS_PROJ> --stage spec --output <ABS_PROJ>/.aimd/output/findings-spec.json

# (3) next: gate #2(spec) → plan
node tools/chain-driver/src/cli.js next <ABS_PROJ> --findings <ABS_PROJ>/.aimd/output/findings-spec.json
# ... plan skill → task-plan.json ...
node tools/findings-aggregator/src/cli.js --target <ABS_PROJ> --stage plan --output <ABS_PROJ>/.aimd/output/findings-plan.json

# (4) next: gate #3(plan) → test
node tools/chain-driver/src/cli.js next <ABS_PROJ> --findings <ABS_PROJ>/.aimd/output/findings-plan.json
# ... chain4 RED: 테스트 생성 후 DIRECT runner (aggregator ❌ — --allow-execute 없음):
node tools/test-impl-pass-validator/src/cli.js --target <ABS_PROJ> --allow-execute --json \
  --out <ABS_PROJ>/.aimd/output/evidence/test-invocation-evidence.json
# → findings-test.json 조립: tests_total=N, tests_failed=N, tests_passed=0 + spec-test-link + schema

# (5) next: gate #4(test / RED expected all_fail under S1) → implement
node tools/chain-driver/src/cli.js next <ABS_PROJ> --findings <ABS_PROJ>/.aimd/output/findings-test.json
# ... chain5 GREEN: impl 생성(test 미변경), 동일 runner 재실행:
node tools/test-impl-pass-validator/src/cli.js --target <ABS_PROJ> --allow-execute \
  --detect-mock-impl=experimental --impl-dir <ABS_PROJ>/src --json \
  --out <ABS_PROJ>/.aimd/output/test_pass_evidence.json
# → findings-implement.json 조립: tests_total=N, tests_passed=N, tests_failed=0 + static-runner + traceability-matrix-builder

# (6) next: gate #5(implement / GREEN expected all_pass / terminal) → next stage 없음
node tools/chain-driver/src/cli.js next <ABS_PROJ> --findings <ABS_PROJ>/.aimd/output/findings-implement.json

# 디버그/검증:
node tools/chain-driver/src/cli.js state <ABS_PROJ>                    # 현재 상태
node tools/chain-driver/src/cli.js next <ABS_PROJ> --findings ... --dry-run   # gate dry-run
# blocked override (medium/low 만; critical/high/s2_outcome_mismatch reject):
node tools/chain-driver/src/cli.js next <ABS_PROJ> --findings ... --user-decision go
```

> **NEVER**: all-zeros 손작성 / count 날조. gate-eval 은 --findings 부재 = `__findings_absent` → findings_unverified block(fail-closed), simulated_evidence_count>0 → permanent reject(-5%p). 모든 findings 파일은 실 validator/runner stdout 에서 유래해야 함.

---

## 5. 측정 & 산출물 위치

### 기록/측정 (§0 세 line item 을 SEPARATE TABLE 로)
- **AXIS 1 (gate pass-through)**: gate #1~#5 각각 결정론 pass/block? auto-pass vs user-decision 개수. "N of 5 auto-passed, M user-decision". 각 전이의 `state.json.last_gate.{id,stage,decision}` = 결정론 evidence trail. + revisit loop(chain-revisit-detector → user prompt → go/stop, stop 시 임의 jump) exercise.
- **AXIS 2 (§3-A 추출)**: analysis-extraction-validator 를 analysis 출력에 실행 → 5 이식성 산출물(rules/BR, domain, openapi, schema, antipatterns+migration-cautions) extracted-vs-expected. Modern ceiling 60~67% 비교. **단방향 rate — gate pass count 섞지 말 것**. §8.1 단일 Modern data point 라벨.
- **제3 line item (gate #0)**: (a) 빈/불완전 manifest → 4 base validator evidence_missing → soft block 확인 + `next --user-decision go` 진행(last_gate={id:#0,stage:analysis,decision:go}); (b) planted violation manifest → validator critical/high → HARD-BLOCK(state.blocked persists, go 거부). 두 axis 에서 명시 제외 보고.
- **EVIDENCE**: 모든 Tier 1 runner 호출(vitest GREEN, codegraph, validators) = 7-field evidence contract(tool_version/stdout_path/stderr_path/invocation_timestamp/duration_ms/result_hash/reproduction_command) + evidence_trust=real_tool. no simulation.

### PoC 위치 결정 = **COMMITTED `examples/poc-18-...`** (외부 격리 ❌)
**근거(feedback_internal_source_poc_external_location)**: 외부-throwaway 규칙(`~/Documents/Development/Study/poc-XX-<scope>/`, no commit, masked DEC) 은 **사내 source 한정**(business-rules/domain 이 내부 도메인 leak 가능). **공개 OSS 는 leak risk 없음 → examples/ committed**. examples/poc-XX 패턴 = 공개 OSS target 한정 명문.
**repo split 실측 확인**: examples/ = poc-01~14 + poc-16 committed. **poc-15·poc-17 부재**(사내 EFI-WEB → 외부). → 최고 사용 정수 = 17, **다음 free = poc-18**.
**권장 경로**: `/Users/sangcl/Documents/Development/Study/ai-native-methodology/plugins/context-ops/examples/poc-18-<oss-name>-modern-ts` (naming = poc-08-realworld-mybatis 관습). substructure = `input/ output/ source/ target/ README.md`(poc-05 mirror). **OSS source 의 `.codegraph/` 를 .gitignore 추가**(codegraph SQLite artifact 미커밋).

---

## 6. 리스크 & 완화

1. **gate #0 prose/code coherence carry — UNCOMMITTED** (DEC-2026-06-06 §5 + MEMORY). mechanical SSOT(state.schema/stage-graph/sdlc-4stage-flow/gate-eval) = #0~#5 coherent, 그러나 prose SSOT(lifecycle-contract.md / ADR-CHAIN-001 §5 / ADR-CHAIN-002 / policies/automation-boundary.md / agents-axis.md)는 구 5-gate '#1~#5' 모델 lag. 전체 gate #0 change set = **미커밋**. **완화**: (a) gate #0 를 feature branch 에 commit 하여 reproducible + `git log -1` 노출, 또는 (b) 명시 carry + gate 의미는 mechanical SSOT(gate-eval.js REQUIRED_VALIDATORS_PER_STAGE.analysis=4 base)에서 읽고 lagging prose '#1~#5' 표현 신뢰 ❌.
2. **resolveRepoRoot wrong-cwd 실패** (검증): flow 는 plugin 루트에만 → repo root/외부 PoC dir 에서 실행 시 fallback → state-machine flow 미로드. **완화**: cwd = `plugins/context-ops`(flows/ skills/ 보이는 곳) 또는 `--repo-root` 명시. sub-agent cwd reset → 매 call cwd 보장.
3. **gate #0 fail-closed — 빈 manifest 가 silently soft-block** (DEC §2.3/§4, probe ❌ manifest-driven): 4 base validator 는 work-unit-manifest.analysis_refs.artifacts 가 각 artifact name → repo-relative path 매핑할 때만 실행. unmapped/file-absent → evidence_missing → soft block → `next --user-decision go` 필요. 실 PoC 는 input//output/rules//sql-inventory/ 위치 inconsistent. **완화**: findings-aggregator 호출 **전에** manifest.analysis_refs.artifacts 에 모든 analysis 출력의 repo-relative path 명시. **의도적 ~6 명시 결정 per work-unit**(≤15% 사람 검토 checkpoint) 기대 — clean auto-pass 아님.
4. **codegraph Node/TS 지원** (검증): v0.9.6 PATH(`/opt/homebrew/bin/codegraph`). Modern TS 작동(poc-05: 4f·33n → callees_resolved=29, Ajv schema-valid). iBATIS2 한계는 Java/legacy → TS dogfood 무관. **CRITICAL**: runner.js+manifest.js 가 trust_note 'reference-lens / NOT gate-injected'(DEC-2026-05-28 §4.2) 하드코딩 → codegraph = finding/lens only, **어느 결정론 gate 에도 inject ❌**(chain-driver-deterministic-axis STRONG-STOP). node/edge count = informational, gate pass criterion ❌, 어느 axis 에도 인용 ❌.
5. **no-simulation 실 증거** (policies/no-simulation.md): chain 5 GREEN = Tier 1(vitest stack runner), codegraph = Tier 1 in-env — 둘 다 실제 실행. 7-field contract 필수. 'Static Analyzer persona' fake = Tier 3 simulated = -5%p + gate block + permanent reject. **완화**: 실제 TS test runner + codegraph 실행 + 7 field capture. 환경 부재 시 evidence_trust 정직 표기 + environment-dependent carry. Tier 2 SARIF(SonarQube/CodeQL)은 plugin 자동 실행 ❌ — imported_sarif 만(tool_stdout_path=null). LLM 추론으로 tool 결과 대체 ❌.
6. **br-cross-consistency Layer 2 LLM threshold = gate #0/#1 hard-block 가능** (Adzic-SBE pitfall): Layer 1 keyword = sanity only / Layer 2 LLM = mandatory. gate-eval block_reason enum 에 `layer2_threshold` 포함. BR dual-representation consistency 가 threshold 미만 → analysis exit hard-block. **완화**: business-rules.json BR 항목에 양쪽 representation 보장 + Layer 2 LLM 패스 의도적 실행. 1st pass 에서 `layer2_threshold` block 예산 잡고 실 신호로 취급(strict exposes drift), bypass ❌.
   > **⚠️ open question(UNVERIFIED)**: Layer 2 LLM 은 Claude Code sub-agent(Task tool) 호출 필요(API 아님). 비대화 scripted driver run 에서 llm_status 가 어떻게 set 되는지 — sub-agent 미연결 시 llm_status='skipped'(backward-compat, no block) 인지, 그게 real(non-simulated) run 에 acceptable 인지, 아니면 next 전에 human/agent 의 semantic check 필수인지 미확인.
7. **measurement axis conflation** (CLAUDE.md + automation-boundary.md §2): 두 axis 분모 다름, 한 숫자 비교 ❌. gate #0 자체는 어느 axis 도 아님(soft opt-in fail-closed, 70-80% process metric + §3-A 추출률 양쪽서 제외). **완화**: §5 처럼 SEPARATE table + gate #0 제3 line item.
8. **§8.1 단일 PoC 과적합**: 단일 TS OSS dogfood = 메커니즘 corroboration, paradigm-wide claim ❌. **완화**: ONE Modern data point 로 frame. ceiling/qualification claim 은 ≥2 distinct problem-domain 필요. 1 PoC 본체 격상 ❌.
   > **⚠️ open question(UNVERIFIED)**: static-runner@gate#5 = 사용자 머신 실 Semgrep/ESLint 필요. 부재 시 implement gate carry(environment-dependent) vs block — Tier 분류 vs hard-block 거동 미확인. fresh download 에서 확인 필요.

---

## 7. 사전 준비 (prerequisites)

1. **tools workspace `npm install`** (validator/driver 실행 전 MANDATORY): tools/ = 단일 npm workspace, **node_modules 현재 MISSING**(실측). cwd=`plugins/context-ops/tools` 에서 `npm install`(ajv 등 schema-validator 의존; source:npm bundledDependencies caveat — 로컬 dev 는 install 필수).
2. **Node 버전**: v25.8.1 설치됨(실측). 모든 tool engines node >=18(codegraph-runner package.json) 충족. nvm switch 불필요.
3. **codegraph 가용**: v0.9.6 PATH(`/opt/homebrew/bin/codegraph`, --version 0.9.6 실측). codegraph-runner preflight 통과(부재 시 CodeGraphEnvironmentMissing/exit 3). TS target 충분 / reference-lens only.
4. **TS test runner (Tier 1) = OSS target 자체 toolchain 에 존재해야 함** (chain 5 GREEN): target package.json 에 vitest(또는 jest) 설치 + runnable `npm test`. **OSS target/ dir 안에서 별도 `npm install`** (tools workspace 와 분리). 실 runnable runner 없으면 chain 5 GREEN no-simulation 증거 불가.
5. **chain-driver/findings-aggregator cwd = `plugins/context-ops`** (또는 `--repo-root .../plugins/context-ops`) — resolveRepoRoot 가 flows/sdlc-4stage-flow.json 찾도록(repo root 에 없음). sub-agent cwd reset → 매 call 절대 --repo-root.
6. **git clean/branched**: gate #0 change set 미커밋. reproducible/citable dogfood 위해 **feature branch 를 main off 로 생성** 후 dogfooding(dirty main 위 ❌). `git log -1` 확인.
7. **work-unit-manifest 채우기**: `chain-driver init --scenario S1` 으로 manifest.scenario set → analysis_refs.artifacts 에 모든 analysis 출력 repo-relative path 채움(manifest-driven, 부재 시 fail-closed).

---

## 8. 일괄 승인 결정 묶음 (5~6개 / 각 항목 = 내 추천)

> Auto Mode 호환. 한 번에 승인/수정. 각 결정에 추천 명시.

- **D1. 대상 프로젝트** — **추천: devmahmud/express-prisma-typescript-boilerplate (1순위)**, scope=user+post slice. 이유 = 유일하게 실 MIT LICENSE 확인 + 5-model FK schema. (대안: sushantrahate — 저자 MIT 확인되면 교체. 현재 license unverified 로 채택 불가.)
- **D2. 시나리오** — **추천: S1 재생성(forward)**, `init --scope core --scenario S1`. full chain 1~5 = 정의상 S1. (S3 는 RED 강제 안 함 → genuine RED→GREEN 입증 불가.)
- **D3. PoC 위치/커밋** — **추천: COMMITTED `examples/poc-18-<oss>-modern-ts`** + `.codegraph/` gitignore. 공개 OSS = leak risk 없음 → 외부 격리 불필요. 다음 free 번호 = 18(실측).
- **D4. RED 강제 방식 (open question 해소)** — **추천: (a) 기존 impl 을 옆으로 move/rename 하여 import 미해결/throw 강제 → 동일 slice forward 재생성**(순수 S1 유지). (b) 신규 augmentation behavior 는 S2 에 가까워지므로 첫 dogfood 에서 회피. 사용자가 (b) 선호 시 S2 재분류 필요.
- **D5. input/ staging vs manifest-only (open question 해소)** — **추천: 먼저 manifest.analysis_refs.artifacts map 만으로 시도**(probe ❌ manifest-driven 원칙). discovery-extraction-validator 가 `<proj>/input/business-rules.json`+`input/domain.json` 요구해 실패하면 **그때 analysis 출력을 `<proj>/input/` 에 수동 staging**. live run 으로 path convention 확정.
- **D6. gate #0 carry 처리** — **추천: gate #0 change set 을 feature branch 에 먼저 commit** (reproducible + `git log -1` citable). 그 위에서 dogfood. (대안: 명시 carry + mechanical SSOT 에서 gate 의미 read — lagging prose 신뢰 ❌. 둘 다 가능하나 commit 이 재현성 우월.)

> 추가 사용자 판단 필요(open question, blocking 아님): Layer 2 LLM(br-cross-consistency) scripted run 시 llm_status 거동 — 'skipped' backward-compat 허용 vs sub-agent semantic check 필수. live run 1st pass 에서 관측 후 결단. static-runner@#5 Semgrep/ESLint 부재 시 carry vs block 도 동일.
