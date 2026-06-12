# DEC-2026-06-11 — findings-aggregator 비-analysis scope-aware + test-impl-pass 인자 정정 + code_only severity 재배치

> 상태: 채택 (구현 완료 / 미커밋) · plugin.json 0.36.0 → **0.37.0 MINOR** (behavior fix 3건 / schema·gate 의미 무변경 / backward-compat)
> 트리거: **ep-be-gea event 모듈 full chain 재실행 (run #2 / 2026-06-11 / S2 / 외부격리·commit❌)** dogfood 가 노출한 chain harness 자동화 axis 직결 본체 결함 3건 (F-R2-35 / F-R2-40 / F-R2-32). 사용자 "지금 수정" 승인.
> 원칙: 품질1/재작업최소2 + diagnose-before-design + senior 적대검증(F-R2-32) + release-readiness count-coupling + chain-driver 결정론 axis 보존.

## 배경 — run #2 dogfood (45 finding)

개선된 플러그인(v0.36.0: UNIT 층 1급화 + test-recovery 가드 + F13/F15 수정)으로 ep-be-gea event 를 analysis→implement 전 과정 fresh 재완주. 6 stage + gate #0~#5 전부 통과(terminal). 그 과정이 건진 본체 결함 9건 중 chain harness 자동화에 직결된 high 2 + medium 1 을 본 DEC 로 수정. (나머지 6건 = backlog / 입력 특성 / carry.)

## F-R2-35 (high) — findings-aggregator 비-analysis stage 경로 per-scope/canonical-global 미인지

**갭(diagnose-before-design)**: `findings-aggregator/src/cli.js buildValidatorArgs` 가 비-analysis 5 stage(discovery~implement)에서 평면 경로(`​.ai-context/output/<f>` + `input/business-rules.json`)를 하드코딩. analysis stage 만 DEC-2026-06-06-analysis-exit-gate 에서 `loadAnalysisRefs`(manifest + state.current_scope) 로 scope-aware 화됐고 나머지는 미적용. → canonical-global + per-scope 레이아웃(`.ai-context/<scope>/<stage>/<f>` + `output/business-rules/BC-<TOKEN>.json`)에서 discovery/spec/plan/test/implement gate 의 validator 가 **전부 evidence_missing**(event 실측: discovery 3/3 evidence_missing). F13(discovery-validator scope-aware)·F15(validator-path-unify) family 의 aggregator 층 잔존 갭. event·golf 2도메인 + analysis 선례로 §8.1 충족.

**수정**: `buildValidatorArgs` 에 optional 4th param `scopeCtx` 추가 (backward-compat overlay).
- `scopeCtx=null` (unit-test / 평면 PoC) → **현 평면 경로 byte-identical** (무회귀).
- `scopeCtx={scope}` (runtime) → `resolveChainArtifact`(per-scope `.ai-context/<scope>/<stageSubdir>/<f>` existsSync 우선 → flat output/ fallback) + `resolveBusinessRules`(BR-split leaf `BC-<SCOPE>.json` → canonical → legacy input/) + `resolveDomain`(canonical → legacy).
- `loadScopeCtx(projectDir)` = state.current_scope 해석 (analysis loadAnalysisRefs 대칭). runValidator 가 main() 에서 1회 계산해 전달.
- 실증: 수정 후 discovery 3/3 ok · spec 3/4 ok(drift-validator=plugin 자기-layout 검사 / 프로젝트 산출물 N/A = 정합 orthogonal) · plan 2/2 ok.

## F-R2-40 (medium) — test-impl-pass-validator 인자 규약 `--project` ↔ aggregator `--target` drift

**갭**: buildValidatorArgs 에 test-impl-pass-validator case 부재 → default `--target <dir>` → validator 는 `--project` 요구 → exit 2 usage → silent skip (F-R2-35 동근 / 인자명 변종). 또 --allow-execute 없으면 dry-run(tests_total 미산출 → 비-analysis fail-closed evidence_missing).

**수정**: case 추가 → `['--project', projectDir, '--allow-execute', '--json']`. test/implement gate 가 진짜 GREEN reconciliation(실 RUN) 확보 = no-simulation / i-strict / ADR-CHAIN-004 §4 동의. test-cmd contract 부재 시 validator 정직 fail(evidence_missing) = 프로젝트 책임. (run #2 = test-cmd.json junit5 wrapper 신설로 73 green reconciliation 입증 / result_hash 3회 동일.)

**부수**: findings-aggregator `package.json` test script `aggregator.test.js` 단일 → `test/*.test.js` (build-validator-args/transform-traceability 가 CI 누락이던 것 교정 / 신규 F-R2-35/40 테스트 CI 커버).

## F-R2-32 (high) — code_only severity 재배치 (analysis-only validator category-error / senior GO@0.82)

**갭(diagnose-before-design + senior 적대검증)**: characterization-coverage-validator 가 `data_source_status='code_only'` 를 **high**(v8.7 PATCH / F-CYCLE3-005 R15 silent-enabler 격상 / 전용 테스트+rationale). 그러나 이 validator 는 **analysis exit gate(gate#0)에서만** 실행(S2/S3 conditional extraValidator). analysis 시점 characterization snapshot 은 **본질상 code_only**(코드에서 특성화 추출 → 실 RUN 검증은 chain 4) = 정상 기대 상태인데, high(rank1 hard-block)는 모든 S2/S3 analysis gate 를 구조적 차단(event 실측: 11/11 snapshot high → gate#0 통과 불가). v8.7 격상이 **analysis-only validator 에 자리를 잘못 잡음**. validator 자기 헤더 §10 도 "medium 권장"으로 code↔doc drift.

**senior 교정(중요 / self-recorded-fact 함정 회피)**: R15 silent-enabler 진짜 방어는 (초안이 잘못 적은) chain-4 가 **아니라** characterization-coverage-validator **자체의 Layer 3 evidence cross-check**(validator.js:450~456 / real-source CLAIM[real_db/real_environment/existing_test_file/domain_expert_interview]인데 tool invocation evidence 부족 = **critical** block). 즉 정직한 code_only(=미검증 명시)=medium carry / 허위 real-source claim=critical = 올바른 분리. code_only high 는 잉여.

**수정 (안 A / severity 환원)**: code_only `high` → `medium` (kind name `snapshot.code_only_carry_required` 유지 — 3rd rename 회피 / header §10 정합 복원 / message 갱신). R15 = Layer 3 cross-check critical 가 그대로 담당(22/22 무회귀 — Layer 3 critical·test-recovery R15 테스트 전부 green). gate-eval medium = 비차단(carry 신호로 summary.medium 표면화). 안 B(gate-eval 이 finding-kind 로 ack-path 분기)는 결정론 severity-rank 계약에 finding-semantic 오염 + aggregator→gate-eval kind 메타 threading 필요 → 결정론 axis 위반·재작업 過 → 기각.

**§8.1**: 3건 모두 behavioral threshold promotion 이 아니라 **구조적 결함**(경로 해석 locus / 인자명 / severity-stage locus) → 코드 증명 + 1 PoC(+ analysis 선례·event·golf) 로 본체 격상 정당. (대조: s2_outcome_mismatch WARN→block 은 behavioral 이라 2도메인 대기했던 것과 구분.)

## 변경 파일
- `tools/findings-aggregator/src/cli.js` — loadScopeCtx + resolveChainArtifact/BusinessRules/Domain + buildValidatorArgs(scopeCtx) + test-impl-pass case + runValidator/main 배선.
- `tools/findings-aggregator/test/build-validator-args.test.js` — F-R2-35/40 신규 테스트 (57 pass).
- `tools/findings-aggregator/package.json` — test script `test/*.test.js`.
- `tools/characterization-coverage-validator/src/validator.js` — code_only high→medium + 헤더 §10 + 주석 rationale.
- `tools/characterization-coverage-validator/test/validator.test.js` — code_only medium 단언 + rationale 갱신 (22 pass).

## 검증
- findings-aggregator 57/57 · characterization-coverage-validator 22/22 · release-readiness 자체테스트 통과(별도).
- event dogfood 실증: F-R2-35 discovery/spec/plan validator per-scope 해석 복구 / F-R2-40 test-impl-pass 73 green reconciliation / F-R2-32 code_only medium(unit) + analysis high-block 해소.

Relates DEC-2026-06-06-analysis-exit-gate(analysis scope-aware 선례 / 비-analysis 확장) + DEC-2026-06-10-discovery-validator-scope-aware(F13 family) + DEC-2026-06-10-validator-path-convention-unify(F15 family) + DEC-2026-06-10-test-recovery-existing-test-evidence(R15 Layer 3) + ADR-CHAIN-004(test-runner contract) + feedback_diagnose_before_design_check_existing + feedback_self_recorded_fact_validation + feedback_chain_driver_deterministic_axis + feedback_release_readiness_count_coupling.
