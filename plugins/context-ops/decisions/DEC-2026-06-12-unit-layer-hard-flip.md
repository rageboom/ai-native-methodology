# DEC-2026-06-12-unit-layer-hard-flip

- **일자**: 2026-06-12 (promotion / **v0.40.0 MINOR** — behavior-changing: medium→high blocking)
- **카테고리**: §8.1 ratchet **시행** — unit 층 SOFT→HARD flip (LEVER B + LEVER A step[A][B][C])
- **상태**: 승인 (사용자[TF Lead] "남은것들 다 진행" / GATED 5조건 ①②③④ 충족 후 ⑤ 시행)
- **관계**: `DEC-2026-06-12-unit-layer-soft-surface-and-promotion-gating` 가 GATED 로 묶은 조건⑤ 의 **canonical closure**. workflow(wf_8f29da64) senior GO + trust/count + change-spec raw-source 실측.

## ①②③④ 닫힘 (raw source 실측)

- **① designed_from_spec greenfield RED→GREEN E2E**: poc-21 (money allocation) unit-spec = 3 UNIT(2 required designed_from_spec). 레포 최초 designed_from_spec 실코드. RED hash `7cea62db` → GREEN `85f0cbe9` (result_hash DIVERGENT) + test 파일 sha256 불변(i-strict). commit `df8b17f8`.
- **② in-repo 재현가능 2nd 도메인**: poc-21 git-tracked → ep-be-gea(외부·재현0) 다리 대체. 재현가능 2 다리 = poc-18(S2/TS) + poc-21(greenfield/JS).
- **③ mutation_score**: Stryker 0.9365 (59/63 detected). 생존 4 = 전부 error-message StringLiteral(의도적 미핀) = non-vacuous. commit `af54b95c`. ★reference-lens(gate 주입 ❌).
- **④ mock-soundness breadth**: ≥2 협력자(UNIT-ALLOC-001 sound + UNIT-FORMAT-001 RED→GREEN) + 1 waived(UNIT-RECEIPT-DTO-001) = validateMockSoundness waived 분기 실행. commit `0f9b134a`.

## §8.1 정당화 (정확 / 게이트=provenance-무관 hygiene)

본 flip 이 격상하는 두 게이트는 **provenance(designed_from_spec vs characterized_from_code)를 읽지 않는다** — `plan-coverage-validator/src/validator.js` + `spec-test-link-validator/src/validator.js` grep `provenance` = **0 hit (코드 실측)**. 게이트 검사 대상 = provenance-무관 **test-layer hygiene**:

- **LEVER B** (`validateUnitTestObligation` / plan gate #3): `unit_refs.length>0 && !unit_test_obligation` = 의무 선언 완전성. medium→**high**.
- **LEVER A** (`validateMockSoundness` / test gate #4): composition TC 가 mock 한 collaborator 가 독립 `test_layer=unit` TC 로 핀됐나 + waived 면제. severity 이미 high → result.findings 병합으로 gate-eval `validator_high` HARD_BLOCK 합류.

corroboration = **3 distinct 도메인**(ep-be-gea S2/Java + poc-18 S2/TS in-repo + poc-21 greenfield/JS in-repo) ≥2 충족. **flip 정당화 = 게이트가 hygiene-키이므로 designed_from_spec 의 단일 datapoint 한계와 직교** — hygiene 규율 강제이지 designed_from_spec 일반화 아님.

## over-claim 가드 (5항 / poc-21 README §8.1 cross-link)

1. **"designed_from_spec paradigm 검증됨" ❌** — 정확히 1 datapoint(좁은 DB-free 순수함수 best-case). 게이트는 hygiene 검사 → flip→paradigm 추론 = 범주오류.
2. **"RED→GREEN 순서 게이트 보증" ❌** — schema 에 test_first/temporal/order 필드 없음. 시간순서 = human-review carry(commit 순서 + prose / poc-21 README line 19-22).
3. **"legacy/stateful 일반화" ❌** — 순수함수 best-case 는 stateful 에 전이 안 됨(poc-21 README line 26-29).
4. **mutation_score 0.9365·method-axis = 영구 reference-lens**(DEC-2026-05-28 / check34/36/37/39 무수정) — gate 주입 ❌. flip 이 이를 게이트 신호 승격 주장 ❌.
5. **"designed_from_spec 가 flip 전제" ❌** — 게이트 provenance-무관이므로 designed_from_spec 실증은 corroboration breadth 기여일 뿐, 게이트 동작 전제 아님.

## 시행 (LEVER A/B — 일괄 / 분할 금지)

- **LEVER B**: `plan-coverage-validator/src/validator.js:482` severity `medium`→`high` + 주석/message HARD. test:967 `'medium'`→`'high'`.
- **LEVER A**: step[A] `findings-aggregator/src/cli.js` spec-test-link case 에 `--unit-spec` 추가. step[B] `spec-test-link-validator/src/cli.js` ms.findings → result.findings **단일 병합** + summary recompute (구 advisory 2-객체 stdout 폐기 — aggregator default-catch 가 2-객체 JSON.parse throw 를 **silent-swallow**[mock high 무신호 drop]하던 함정 차단). step[C] severity 이미 high(무변경) + exit-code 는 step[B] merge 로 자동 합류. LAYER4 = spec-test-link 이미 test gate REQUIRED = 추가 불요.
- **회귀 가드(중요 / synth 의 'unconditional safe' 가정 정정)**: spec-test-link cli 가 **unit-spec 실로드(non-null) 시에만** mock-soundness 실행. unit-spec 부재 PoC = unit 층 미opt-in = skip(무회귀). `validateMockSoundness` 는 waived 셋을 unit-spec 에서 뽑으므로 unitSpec=null 이면 모든 mock 협력자가 거짓 unsound = 회귀였음 → empirical test 로 포착·수정.

## count-coupling 결정 — criteria_total **42 유지** (GATED DEC 의 42→43 supersede)

GATED DEC(soft-surface-gating) 조건⑤ 는 "unit-mock reference-lens 신규 trust check → criteria_total 42→43"을 명시했으나, **본 flip 의 raw-source 분석이 그 전제(trust 충돌)를 반증**:

- mock-soundness 는 **spec-side 게이트-후보 축**(DEC-2026-06-11 신뢰 분리), reference-lens 아님 → gate 주입이 **의도된 것**이지 누설 아님. check34~39(codegraph reference-lens 토큰 전용)은 mock-soundness 토큰 0 hit = 안 깨짐(실측).
- code-graph method-axis·mutation_score(reference-lens)는 LEVER C pass-through(v0.39.0)가 `mergeFindings` allowlist **밖**에 둬 **구조적으로 gate-제외**(aggregator.js:212-247 실측) → 신규 trust check 없이도 분리 보존.
- ∴ "reference-lens trust 충돌 해소용 신규 check"는 **존재하지 않는 충돌을 위한 것** = 불요. criteria_total **42 유지**(release-readiness 42/42 무회귀 실측). 향후 dedicated unit-coverage reference-lens 가드는 optional carry(필요 시 별도).

## STOP (검증 — no-simulation)

- **flip 실증(empirical / poc-21 fixture)**: LEVER A — spec-test-link `--unit-spec`(poc-21 unit-spec) + unsound composition mock → **exit 1** + 단일 JSON + summary.high(unit.mock.unsound UNIT-FORMAT-001) / unit-spec 부재 → mock unsound **0**(무회귀). LEVER B — task `unit_refs` 보유 + obligation 미선언 fixture → obligation finding **severity high** → cli **exit 1**(구 medium=exit 0).
- 도구 테스트: plan-coverage 47/47 · spec-test-link 11/11 · findings-aggregator 66/66 · chain-driver 523/523(gate-eval validator_high 최대 소비자) GREEN.
- **release-readiness 42/42**(신규 check 없음 / README·version·CHANGELOG lockstep). schema 3종 JSON valid + poc-21/poc-18 unit-spec 재검증 valid.
- doc 정합: test-layering.md(정책 SSOT) + 27-unit-spec.md + lifecycle-contract.md + task-plan/test-spec/unit-spec schema description = obligation/mock "soft"→"HARD" reword. unit-coverage matrix ratio·method-axis·mutation = reference-lens 유지(미변경).

## carry

- 버전 = v0.40.0 MINOR(behavior-changing). 직전 v0.39.0 = LEVER C soft-surface(additive).
- GATED DEC(soft-surface-gating)의 GATED ⑤ 섹션 = 본 DEC 로 SHIPPED.
- 구 DEC-2026-06-11-* (tdd-unit-thread / corroboration-poc18) = 시점 사실(v0.36.0 soft) 보존(역사 / 본 DEC 가 supersede 명시).

DEC-2026-06-12-unit-layer-hard-flip. Closes `DEC-2026-06-12-unit-layer-soft-surface-and-promotion-gating` 조건⑤.
