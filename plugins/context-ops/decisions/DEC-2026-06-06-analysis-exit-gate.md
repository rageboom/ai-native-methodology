# DEC-2026-06-06-analysis-exit-gate

**결단**: **analysis 단계에 exit gate `#0` 신설** — analysis→discovery 경계를 상태머신(chain-driver)이 기계적으로 검증·기록·차단. **옵션 A (caller 가 validator 실행 → findings 공급 / fail-closed) + soft 차단 (validator critical/high 만 hard-block, 나머지 rank-2 go-with-ack) + 단일 exit gate**. SEED-1("analysis 는 hard gate 없음 / self-attested")의 **부분 반전**. 경로 해석 = manifest 주도(결정론 / probe ❌). analysis 스코프 한정 (다른 chain stage 무수정).

**작성일**: 2026-06-06.

**relates to**:

- `decisions/INSPECTION-LEDGER.md` SEED-1 (analysis self-attested / resolved-as-intended → 본 결단으로 partially-reversed)
- `docs/adr/ADR-CHAIN-005-driver-state-machine.md` §3 (mechanical gate trio — 본 결단이 analysis 에 확장)
- `tools/chain-driver/src/gate-eval.js` (REQUIRED_VALIDATORS_PER_STAGE.analysis) / `tools/findings-aggregator/` (러너)
- memory `feedback_chain_driver_deterministic_axis` (STRONG-STOP — gate-eval 순수성 보존)

---

## 1. 배경 (감사 발견)

"분석 단계 정적 도구가 실제로 동작하는가 + 실제 효과가 있는가" 감사(2026-06-06)에서 확정:

- 정적 validator 자체는 **전부 정상 동작**(test 442+ 통과, 실 fixture 적발 입증).
- 그러나 analysis 단계에서 이들을 **부르는 기계적 강제가 없었음**:
  - hooks = detect+mark only ("LLM SHALL NOT auto-invoke") → validator 미실행.
  - phase-flow `automated_validation` = 실행 주체 부재 (dead metadata).
  - gate-eval `REQUIRED_VALIDATORS_PER_STAGE` = chain 5 stage 만 (analysis 부재).
  - drift-check.yml CI = drift-validator 만 / chain-check.yml = `if:false` 비활성.
  - 실효 강제 = release-readiness check8(schema+br-cross) 뿐 (release 시점만).
- 즉 **decision-table / characterization-coverage / sql-inventory validator = 어떤 자동 채널에도 안 걸린 orphan** — SKILL.md "자동 호출" 산문(LLM 양심)에 전적 의존. 실증: 커밋된 PoC 산출물(poc-14/poc-16)에 schema-validator 가 잡는 위반이 박혀 있었음 (게이트로 안 돌았다는 증거).

사용자 결단: **"상태 머신을 살려야 한다."** + 워크플로우 현실("`chain-driver` 수동 미사용")을 반영해, B(LLM 자동 구동 / 양심 의존 회귀) · C(hook 자동 / "hook=detect+mark" 반전)를 거부하고 **A**(사람이 단계 경계에서 명시적으로 게이트 호출 / 두 원칙 보존)를 채택.

## 2. 결정 내용

### 2.1 게이트 #0 (상태머신)

- `state.schema.json` last_gate.id enum `#0` + stage enum `analysis` + block_reason enum `findings_unverified` 추가.
- `stage-graph.js` getGateForStage map `analysis:'#0'` (canonical chain N = gate #N / analysis=chain 0).
- `gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.analysis = **base 4** (schema-validator / br-cross-consistency-validator / formal-spec-link-validator / decision-table-validator). evaluateGate 순수성 무변경 — analysis 는 기존 critical/high→hard, evidence_missing/findings_unverified→rank-2/3 soft 경로 재사용.
- `cli.js` cmdNext — 구 `analysis?'discovery'` 매핑 제거. **latent 버그 교정**: 그 매핑이 gate 를 discovery(#1)로 평가 + nextStage('discovery')='spec' 로 **discovery 를 스킵**했음 → analysis→discovery 정상 전이.
- `sdlc-4stage-flow.json` gates[] `#0` 추가 (conditional_validators = characterization-coverage[S2/S3] / sql-inventory[RDB]). stages[0].gate = null 유지(보수적).
- `analysis.phase-flow.json` cross_cutting.validators 신설 (check26 4중 정합).

> **drift-validator 제외**: 그건 플러그인 자체 구조(flows↔skills↔manifest) 검사지 사용자 analysis 산출물 검사가 아님 (CI drift-check + spec gate chain-mode 가 owner).

### 2.2 러너 (findings-aggregator)

- `aggregateForStage(stage, dir, runValidator, opts)` — opts.extraValidators(조건부 추가) + opts.failClosedOnNull(null=evidence_missing).
- **전용 transform** `transformDecisionTable` / `transformFormalSpecLink` — 이 두 validator 는 `totals.{breaking,non-breaking}` 출력(summary.critical 부재) → generic transform 이 항상 0 critical = silent pass 였음(RR2 실 버그). breaking→critical, non-breaking→medium 매핑으로 게이트 실효화.
- 조건부: scenario∈{S2,S3}→characterization-coverage / sql-inventory artifact 존재→sql-inventory.

### 2.3 경로 해석 (manifest 주도 / 대안 1)

- `work-unit-manifest.schema.json` analysis_refs.**artifacts** 신설 (산출물명→repo-relative 경로 맵). 러너가 manifest 로 정확 경로 resolve (probe ❌ / 결정론). 미해석/파일부재 → evidence_missing(fail-closed). 근거: 실 PoC 가 산출물을 `input/` · `output/rules/` · `sql-inventory/` 제각각 저장 → canonical 단일 강제 대신 manifest 명시(결정론·SSOT 정체성 정합).

### 2.4 트리거

- `analysis-agent.md` 절차 — analysis 산출물 생성 시 경로를 manifest.analysis_refs.artifacts 기록 + 완료 후 `findings-aggregator --stage analysis` → `chain-driver next --findings` 로 게이트 #0 통과 후 discovery dispatch. (LLM 지시 = 사람이 게이트 호출하는 A / fail-closed 가 backstop.)

## 3. 근거 — 왜 A / soft

- **A (사람 명시 호출)** 만이 두 원칙("LLM 양심 의존 회피" + "hook=detect+mark only")을 동시 보존. B/C 는 각각 하나를 반전 + 게이트에서 사람 제거("100% 자동화 ❌" 명세 위반). 마찰은 work-unit 당 ~6 명시 결단(= 의도된 "사람 검토 ≤15%" 체크포인트).
- **soft**: analysis 는 LLM 추론 비중 높은 단계(review ≤15%). hard-only 면 false-positive 로 전 단계 막힘 → fail-closed(silent pass 차단) 와 over-blocking 사이 균형. 진짜 결함(validator critical/high)만 hard.
- **gate-eval 순수성 보존**(STRONG-STOP): validator 실행은 caller(findings-aggregator) / gate-eval 은 severity count 만 판정. 결정론-calls-결정론(aggregator→validator) — LLM 판단 inject 0.
- **gate#1 br-cross 부분 중복** 인정: analysis #0(analysis 산출물 대상) vs discovery #1(discovery-spec 대상)은 입력 대상이 다름. 중복 비용 < 조기 검출 가치.

## 4. 검증 (e2e 실측 / 2026-06-06)

- 실 poc-16: 6 validator(base 4 + S2 characterization + RDB sql-inventory) 전부 실행, schema 15 critical·characterization 3 high 적발 → `chain-driver next` HARD-BLOCK(validator_critical / state.blocked 영속 / go 거부).
- 빈 manifest: 4 base evidence_missing → soft block → `--user-decision go` → discovery 전진 + last_gate={id:#0,stage:analysis,decision:go}.
- 회귀: chain-driver 343/343 · findings-aggregator 38/38 · drift layout+state-flow ✅ · release-readiness check18(gate enum {#0..#5})+check26(4중 정합) ✅.

## 5. Non-goal / carry

- 다른 chain stage(discovery~implement) 게이트 러너 미수정 (별개 작업).
- phase-flow 의 phase 별 `automated_validation` 은 여전히 dead (exit gate 가 stage 경계 일괄 검증 / phase 단위 실행 주체 신설은 scope 외).
- state.json version bump 없음 (enum 추가 = additive / CAS counter 무관).
- block_reason enum 의 `layer2_threshold` / `s2_outcome_mismatch` 미등재 = 기존 잠재 latent (analysis 무관 / 별도 carry).
- 기존 PoC 의 산출물 경로 정리(canonical 통일) = 별도 cleanup carry.
- **prose doc-coherence carry** (적대적 리뷰 finding #2) → **✅ resolved-verified (2026-06-06)**: 본 carry 작성 시점 판정은 **STALE**이었음 — 5파일(`lifecycle-contract.md` / `ADR-CHAIN-001` §5 / `ADR-CHAIN-002` / `policies/automation-boundary.md` / `agents-axis.md`)은 **본 결단의 prose 갱신 커밋 `5429d9e0`이 이미 #0 정합**으로 만들었다(별도 corrective 불필요). 후속 세션 전수 grep 검증: lifecycle-contract L32·L197 / ADR-CHAIN-001 L61 / ADR-CHAIN-002 L25 / automation-boundary L18 / agents-axis L79 에 #0 = "chain hard gate #1~#5 와 별개 soft" 명시 / 살아있는 spec 산문에 "self-attested·hard gate 없음" 모순 0건(잔존은 DEC·LEDGER 과거형 + 날짜 박힌 `INSPECTION-2026-05-31` 스냅샷). 산문 무수정(cosmetic 추가 = manufactured drift 회피). cross-PC 인계 carry [D3] = RESOLVED (STATUS.md). 기계 SSOT(#0~#5)–산문 SSOT 정합 완료.
- block_reason enum: 본 DEC 에서 `findings_unverified` + (기존 latent) `layer2_threshold` · `s2_outcome_mismatch` 까지 추가 완료 (적대적 리뷰 finding #3 해소 — gate-eval 의 모든 primary_reason code 가 enum 등재).
- SEED-1 status → **partially-reversed** (analysis soft exit gate #0 신설).
