# Plan — analysis 게이트 #0 + validator 러너 (합본)

> 확정: **analysis 스코프 한정** (다른 chain stage 무수정). **둘 다**: (1) validator 러너 — analysis 산출물에 필요한 validator 결정론 실행→findings, (2) 상태머신 게이트 #0 — findings 확인(fail-closed)·기록(last_gate+intervention-log)·차단(trio).
> 옵션 A (caller 실행 / fail-closed) + soft (validator critical/high 만 hard, 나머지 rank-2 go-with-ack) + 단일 exit gate. gate 번호 `#0`.
> 경로 해석 = **대안 1 manifest 주도**: `work-unit-manifest.analysis_refs.artifacts` 가 산출물→경로 명시. 러너는 manifest 읽어 정확 경로로 실행. analysis-agent 가 산출물 생성 시 경로 기록.
> 분업: **스킬(LLM)=실행 트리거+경로 기록 / findings-aggregator=결정론 실행+집계(caller) / 상태머신(next)=확인·기록·차단**. gate-eval 순수성 보존.

## 핵심 발견 (Plan 조사)
- **findings-aggregator 가 이미 러너**: `aggregateForStage(stage, dir, runValidator)` 가 stage별 validator execFileSync spawn→파싱→merge. analysis stage 추가 = 최소 신규 코드.
- **실 버그 (RR2)**: decision-table-validator·formal-spec-link-validator 는 `totals.{breaking,non-breaking,info}` 출력(summary.critical 없음) → generic transform 이 항상 0 critical = silent pass. 전용 transform 필수.
- **경로 불일치 확정**: poc-06 `input/`+`sql-inventory/`, poc-03 `output/rules/`+`output/formal-spec/`, poc-16 `input/`. 어느 것도 agent.md canonical(`.aimd/output/`) 미준수. → **manifest 주도로 해소** (probe 안 함, 결정론).
- gate-eval evaluateGate 순수 유지. analysis 는 기존 critical/high→hard, rank-2→soft 경로 재사용.
- check26 4중 정합: aggregator.REQUIRED.analysis = gate-eval.REQUIRED.analysis = sdlc.gates[#0].validators = analysis.phase-flow.cross_cutting.validators.

## A. 게이트 부분 (상태머신)
1. `tools/chain-driver/src/stage-graph.js` — `getGateForStage` map 에 `analysis:'#0'`.
2. `schemas/state.schema.json` — `last_gate.id.enum`+`#0` / `last_gate.stage.enum` 앞에 `analysis` / `block_reason.enum`+`findings_unverified` (R3 확정: 추가).
3. `tools/chain-driver/src/gate-eval.js` — `REQUIRED_VALIDATORS_PER_STAGE.analysis`=`[schema-validator, br-cross-consistency-validator, formal-spec-link-validator, decision-table-validator, drift-validator]`. evaluateGate/HARD_BLOCK 무변경.
4. `flows/sdlc-4stage-flow.json` — `gates[]`+`{id:'#0',stage:'analysis',validators:[base5],conditional_validators:[characterization-coverage-validator,sql-inventory-validator]}`. `stages[0].gate`=null 유지(R4 보수적).
5. `flows/analysis.phase-flow.json` — `cross_cutting.validators` 신설(base 5).
6. `tools/chain-driver/src/cli.js` cmdNext — `analysis?'discovery'` 매핑 제거 → analysis 자체 gate(#0). nextStage('analysis')='discovery'(기존). getGateForStage→#0.

## B. 러너 부분 (findings-aggregator) + manifest 경로
7. `schemas/work-unit-manifest.schema.json` — `analysis_refs.artifacts` 객체 신설: 산출물명→repo-relative 경로 맵 (예: `{"business-rules":"input/business-rules.json","decision-tables":"input/formal-spec/decision-tables", ...}`). additionalProperties:false 정합.
8. `tools/findings-aggregator/src/aggregator.js`
   - `REQUIRED_VALIDATORS_PER_STAGE.analysis`=base 5 (A-3 sync / RR1).
   - 신규 transform `transformDecisionTable`(breaking→critical, non-breaking→medium), `transformFormalSpecLink`(breaking/errors→critical, non-breaking→medium) — RR2.
   - `dispatchValidator` switch 에 두 validator case.
   - analysis 조건부: base 5 + (manifest.scenario∈{S2,S3}?characterization-coverage) + (rdb?sql-inventory). rdb 판정 = manifest.analysis_refs.artifacts['sql-inventory'] 존재.
   - target 부재 → `evidence_missing` 분류.
9. `tools/findings-aggregator/src/cli.js`
   - stage 검증/usage 에 `analysis` 허용.
   - `buildValidatorArgs` analysis 분기: 경로를 **manifest.analysis_refs.artifacts 에서 resolve** (probe ❌). schema=output dir(positional), br-cross=`--target <rules path> --json`, formal-spec-link=`<dir> --chain-mode --json`, decision-table=`<dt path> --json`, drift=`--check-state-flow-consistency <root> --json`(특수 arg/RR4), characterization=`--target <char path> --json`, sql=`--target <sql path> --json`.
   - manifest read (scenario + analysis_refs.artifacts).

## C. 트리거 (스킬 연결)
10. `agents/analysis-agent.md` (절차 6) — "analysis 산출물 생성 시 각 경로를 work-unit-manifest.analysis_refs.artifacts 에 기록. 완료 후 **반드시** `findings-aggregator --stage analysis --output .aimd/output/findings-analysis.json` → `chain-driver next <proj> --findings <그 파일>` 로 게이트 #0 통과 후 discovery dispatch. findings 없이 next = fail-closed 차단." (LLM 지시 + fail-closed backstop.)

## D. 회귀 정합
11. `scripts/release-readiness.js` check26 `STAGES`+`analysis`.
12. `tools/chain-driver/test/f-cha-001-trio-integration.test.js:205` — analysis 필터/주석 수정(#0).

## Test
- aggregator.test.js: REQUIRED.analysis base5 / transform 어휘버그 가드 / dispatch 전용 transform / aggregateForStage('analysis') base+조건부+evidence_missing + manifest 경로 resolve.
- gate-eval.test.js: requiredValidators('analysis') / evaluateGate('analysis',{critical:1})→block / {__findings_absent}→findings_unverified rank2 / user-go on high→reject.
- cli next 통합: current_chain=analysis + 실 findings → critical→exit1+blocked+last_gate.id='#0' / soft→advance discovery.
- f-cha-001 scenario5 / stage-graph.test analysis=#0 / release-readiness check26 analysis 행.
- work-unit-manifest artifacts: 전용 unit test 미추가 — e2e(poc16-manifest.json 실행 = 6 validator resolve) + schema-validator(전 schema 로드 valid)로 검증 (정직 표기 / 적대적 리뷰 finding #4).

## Ripple 검증
```
node --test tools/findings-aggregator/test/aggregator.test.js
node --test tools/chain-driver/test/gate-eval.test.js tools/chain-driver/test/f-cha-001-trio-integration.test.js
node tools/drift-validator/src/cli.js --check-state-flow-consistency
node scripts/release-readiness.js && node --test scripts/test/release-readiness.test.js
node --test tools/chain-driver/test/ tools/findings-aggregator/test/
```

## DEC — `DEC-2026-06-06-analysis-exit-gate`
SEED-1 부분 반전. 가치=조기검출. gate#1 br-cross 부분중복 인정. soft 근거=analysis LLM 비중↑. gate-eval 순수성 보존. 경로=manifest 주도(결정론). Non-goal: 다른 stage 미수정 / phase automated_validation 여전히 dead / version bump 없음. SEED-1 status→"partially-reversed".

## 위험 / 롤백
- RR1(high) validator 목록 4중 정합 — 같은 커밋 + check26/aggregator.test 가드.
- RR2(high) severity 어휘버그 — 전용 transform + test 필수.
- RR4(med) drift arg 규약 차이 — analysis 분기 특수 case.
- R3 block_reason enum +findings_unverified (확정).
- RR5(low) RDB 판정 = manifest sql-inventory artifact 존재 (명시적이라 휴리스틱 위험 해소).
- 롤백: 전부 additive. cli.js next 한 줄 + aggregator/manifest analysis 키 revert 로 복귀. 기존 stage 회귀 0.

## Lessons Learned (구현 후 / 2026-06-06)

- **구현 = 거의 전부 additive 로 끝남** — 예측대로 gate-eval evaluateGate 본체 변경 0 (analysis 가 기존 critical→hard / evidence_missing→rank-3 / findings_unverified→rank-2 경로 재사용). 신규 HARD_BLOCK_CODE·stage 분기 불필요.
- **latent 버그 교정 (예상 밖 수확)** — cmdNext 의 구 `analysis?'discovery'` 매핑이 gate 를 discovery(#1)로 평가 + nextStage('discovery')='spec' 로 **discovery 를 통째 스킵**하던 버그였음. analysis→discovery 정상 전이로 교정.
- **RR2 실 버그 확인+해소** — decision-table/formal-spec-link validator 가 `totals.{breaking}` 만 emit(summary.critical 부재) → generic transform 이 항상 0 critical = silent pass. 전용 transform 으로 해소. (이게 안 고쳐졌으면 게이트가 그 두 도구엔 헛돔.)
- **findings-aggregator 가 이미 러너** — 신규 도구 불필요, aggregateForStage 에 opts(extraValidators/failClosedOnNull) 추가로 흡수.
- **shipped 위생** — agents/ 는 출하 대상 → tool 경로는 `${CLAUDE_PLUGIN_ROOT}/` prefix 의무 + 본문 DEC 마커 누출 금지 (release-readiness check 가 잡음). 트리거 산문 작성 시 주의.
- **e2e 실측 검증 효과** — 실 poc-16 manifest 로 6 validator 실행 → hard-block(15 critical)·soft-override·조건부(S2/RDB)·fail-closed 전부 실증. 단위테스트만으론 manifest 경로 해석/validator CLI 시그니처 정합을 못 잡았을 것.

### 검증 결과
- chain-driver 343/343 · findings-aggregator 38/38 · drift layout+state-flow ✅ · release-readiness 39/40 (유일 실패 readme_version_sync = 기존 v12.16.0↔v0.1.0 드리프트 / 본 변경 무관) · skill-citation 0 stale · check18(gate enum #0..#5)+check26(4중 정합) ✅.
- 미커밋 (사용자 검토 대기).
