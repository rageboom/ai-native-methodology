# DEC-2026-06-06-non-analysis-gate-fail-closed

**결단**: **비-analysis 단계(discovery~implement) 게이트도 fail-closed** — findings-aggregator CLI 가 `failClosedOnNull:true` 로 비-analysis stage 를 구동: required validator 가 args 미해석/미실행으로 `null` 이면 silent skip(fail-OPEN) 대신 `evidence_missing`(soft / `--user-decision go` 로 ack) 으로 surface. **동반: schema-validator stage-aware args** — `buildValidatorArgs(name, dir, stage)` 가 stage 별 산출물(discovery→discovery-spec / plan→task-plan / test→test-spec / implement→impl-spec+traceability)을 검증(이전엔 stage 무관 chain-2 자산만 → plan/test/implement 에서 엉뚱한 파일 검증). DEC-2026-06-06-analysis-exit-gate 의 gate 철학(silent pass 차단 / fail-closed)을 analysis 너머 chain stage 로 확장. `aggregateForStage` 함수 default 는 불변(기존 'skipped' 단위 테스트 보존 / 정책은 CLI 레벨 opt-in).

**작성일**: 2026-06-06.

**relates to**:

- `decisions/DEC-2026-06-06-analysis-exit-gate.md` (analysis exit gate `#0` / fail-closed 철학의 원본 — 본 결단이 비-analysis stage 로 확장)
- `examples/poc-18-express-prisma-modern-ts/` (Modern Node/TS full-chain dogfood — F1/F2/F4 본체 결함 + 본 2 surface 노출 출처)
- `tools/findings-aggregator/src/cli.js` (`buildValidatorArgs` stage-aware + `main()` `failClosedOnNull:true`)
- `tools/schema-validator/src/cli.js` (`inferSchemaName` $schema_ref 라우팅) / `schemas/db-schema.schema.json` ($schema_ref 키 허용)
- memory `feedback_chain_driver_deterministic_axis` (STRONG-STOP — aggregator 가 caller / gate-eval 순수성 무영향)

---

## 1. 배경 (poc-18 dogfood)

PoC #18(`examples/poc-18-express-prisma-modern-ts` / Express + Prisma + Modern TS / commit `cfb790ff`)에서 chain-driver 상태머신을 analysis→discovery→…→implement 까지 E2E 완주시킨 dogfood 가 본체 결함 3건 + 정책 surface 2건을 노출:

- **F1** discovery-extraction-validator — `domain.schema` 는 `use_cases`/`entities` 를 `bounded_contexts[]` 아래 **중첩**하는데 validator 는 top-level `analysis.domain.use_cases` 만 읽어, schema-conformant `domain.json` 에서 UC coverage 가 **silent skip(vacuous pass)**.
- **F2** findings-aggregator `buildValidatorArgs` — `plan-coverage-validator` case 부재 → default `--target` 인자로 호출 → validator 가 `--task-plan`/`--acceptance` 를 요구하므로 errored → silent skip = **plan gate primary validator 미실행(fail-OPEN)**.
- **F4** schema-validator — `$schema_origin`/`$schema` 만 읽고 `$schema_ref` 미인식 → db-schema 관습명 `schema.json` 이 영구 미검증.

F1/F2/F4 는 본체 결함으로 commit `e29dc547` 에서 즉시 fix(+회귀 테스트). 그러나 그 fix 과정에서 **두 정책 surface** 가 드러나 "별도 결정 필요" 로 carry 되었음:

1. 비-analysis 단계 fail-closed-on-skip — 당시 `failClosedOnNull` 은 analysis 에만 적용(DEC-2026-06-06-analysis-exit-gate). discovery~implement 는 validator skip 이 곧 **fail-OPEN**(silent pass).
2. schema-validator stage-aware args — `buildValidatorArgs` 의 `schema-validator` case 가 stage 무관하게 **chain-2 자산(behavior-spec+acceptance-criteria+traceability)** 만 검증 → plan/test/implement gate 에서 엉뚱한 파일을 검증/없으면 skip.

본 DEC 가 그 2 surface 를 결단·시행(commit `80280ec1`).

## 2. 결정 내용

### 2.1 비-analysis fail-closed (CLI 레벨 / `failClosedOnNull:true`)

- `cli.js` `main()` 의 비-analysis 분기가 `aggregateForStage(stage, dir, runner, { failClosedOnNull:true })` 로 구동 — required validator 가 `null`(args 미해석/미실행) 이면 silent skip 대신 `evidence_missing`(soft). 사용자가 `--user-decision go` 로 ack 가능(hard-block 아님).
- **`aggregateForStage` 함수 default 는 불변** — `failClosedOnNull` opt-in 을 CLI 레벨에서만 켬 → 기존 'skipped' 단위 테스트 가정(default = silent skip) 보존(회귀 0). 정책은 호출부(CLI)의 명시적 선택.
- `runValidator(name, dir, stage)` 에 stage 전달(2.2 의 args 분기 enablement).

### 2.2 schema-validator stage-aware args

- `buildValidatorArgs(name, dir, stage)` 의 `schema-validator` case 가 stage 분기:
  - `discovery` → `discovery-spec.json`
  - `plan` → `task-plan.json`
  - `test` → `test-spec.json`
  - `implement` → `impl-spec.json` + `traceability-matrix.json`
  - `spec`/default → chain-2 자산(behavior-spec + acceptance-criteria + traceability-matrix) **불변**(기존 거동 보존).

### 2.3 wiring 완성 (fail-closed 가 false-block 하지 않도록)

fail-closed 를 켜면 args 미완성 validator 가 `evidence_missing`/false-block 으로 시끄러워지므로, 동반해 두 채널의 args 를 완성:

- **br-cross-consistency-validator @ discovery** → `--target <input/business-rules.json>` (이전 default `--target <dir>` = errored skip / discovery-extraction `--rules` 와 동일 BR 원본 경로).
- **spec-test-link-validator** → `--behavior <behavior-spec.json>` 동반 — 없으면 `bhv_ref` 미해석 → **TC 당 false critical = hard-block**(poc-18 에서 6-count false-critical hard-block 관측 → kill).

### 2.4 잔존 evidence_missing (정직 / 의도된 설계)

fail-closed 후에도 일부 required validator 는 stage 경계 일괄 호출만으로는 실행 불가 → **정직한 `evidence_missing`(soft)** 로 surface(날조 pass ❌ / 의도된 carry):

- **drift-validator** — 플러그인 자기구조(flows↔skills↔manifest) 검사지 사용자 프로젝트 산출물 검사가 아님 → 사용자 프로젝트에서 N/A invocation(spec gate chain-mode + CI drift-check 가 owner).
- **test-impl-pass-validator** — CHANNEL B(`--allow-execute` 직접 실행 / 실 runner) 경유 → stage 경계 일괄 호출이 직접 돌리지 않음.
- **static-runner** — 환경 의존(semgrep 등 / R19 Tier 1 in-plugin 이나 env 준비 필요).
- ~~**traceability-matrix-builder**~~ — **후속 wiring 완료** (commit 후속 / builder `--json` findings-only 모드 + `transformTraceabilityMatrix`[red_count→critical / forward_coverage<threshold→medium advisory / yellow→low] + dispatchValidator route + buildValidatorArgs implement case[`--behavior --acceptance --discovery --task-plan --test-spec --impl-spec --json`]). 더이상 evidence_missing 아님 — implement gate 에서 coverage 신호 산출(poc-18: red 0 / forward 83.3%<85% → medium advisory / false hard-block 0).

## 3. 근거 — 왜 fail-closed / soft / default 불변

- **fail-closed(unverified surface) > fail-OPEN(silent pass)**: validator 가 args 미완성으로 조용히 skip 되면 게이트가 "통과" 로 보이지만 실은 **검증한 적 없음** = analysis exit gate 가 잡으려던 바로 그 silent-pass 함정의 비-analysis 판. surface 가 정직.
- **soft(ackable) — not hard**: 잔존 evidence_missing(drift/test-impl/static/traceability) 은 진짜 결함이 아니라 "이 채널은 여기서 못 돈다" 라는 **정직한 환경/설계 carry** → hard-block 이면 정상 진행을 막음. `--user-decision go` 로 사람이 ack(= 의도된 "사람 검토 ≤15%" 체크포인트). 진짜 결함(validator critical/high)만 hard.
- **`aggregateForStage` default 불변**: 정책을 함수 default 가 아니라 CLI 호출부 opt-in 으로 둠 → 기존 'skipped' 가정 단위 테스트(default behavior) 를 보존(회귀 0) + 정책 선택을 caller 가 명시.
- **gate-eval 순수성 무영향**(STRONG-STOP): validator 실행/skip 판정은 caller(findings-aggregator) / gate-eval 은 severity count 만 판정. 결정론-calls-결정론. LLM 판단 inject 0.

## 4. 검증 (poc-18 재검증 / no-sim 실 CLI / 2026-06-06)

- poc-18 재실행: **discovery/plan = AUTO** / **spec**(drift=plugin 자기검사 N/A) · **test**(test-impl=CHANNEL B) · **implement**(test-impl·static-runner·traceability) = 정직한 soft `evidence_missing` / **false hard-block 0**.
- spec-test-link `--behavior` 동반으로 6-count false-critical hard-block 제거(kill) 확인.
- 회귀: findings-aggregator **47/47**(+7) · schema-validator **108/108** · discovery-extraction **32/32** · release-readiness **40/40** all green.

## 5. Non-goal / carry

- 잔존 evidence_missing **3종(drift / test-impl / static-runner)** 을 stage 경계에서 자동 실행하도록 만드는 건 scope 외 — drift=플러그인 자기검사라 사용자 프로젝트 무효(영구) / 나머지 2종은 별도 채널(CHANNEL B `--allow-execute` 직접 실행 / env semgrep)로 carry. **traceability-matrix-builder 는 후속 wiring 완료**(§2.4 — builder `--json` + `transformTraceabilityMatrix`).
- `aggregateForStage` 함수 default 를 fail-closed 로 뒤집는 것 = 기존 'skipped' 단위 테스트 다수 반전 → 별도 결정 + 테스트 마이그레이션 필요(현 CLI 레벨 opt-in 으로 충분).
- analysis exit gate `#0`(DEC-2026-06-06-analysis-exit-gate)의 prose doc-coherence carry(5-gate 모델 산문 lag)는 그대로 별도 corrective.
- §8.1: 본 surface corroboration = poc-18 1 도메인(Modern Node/TS) — 정직한 dogfood-driven fix(self-referential 아님 / 본체 결함 노출) / fail-closed·soft·default-불변 의 보수적 경계로 ship.
