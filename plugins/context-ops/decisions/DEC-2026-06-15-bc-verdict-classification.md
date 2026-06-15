# DEC-2026-06-15-bc-verdict-classification

**BC 분류(core/supporting/cross_cutting/read_model/operational)를 결정론 `verdict` 필드로 명시 + analysis gate#0 강제 (draft — release bump 대기)**

## 맥락 (사용자 요청 / ep-be-gea dogfood)

ep-be-gea `.ai-context` 점검에서 "공통(global-common) / cross-cutting / per-BC" 분류가 **결정론·강제된 단계 없이** scope-carve(reference-lens, 게이트 inject ❌) + domain-model 판단 + soft gate#0 사람 확정에 **흩어져** 있음이 드러남. 결과 2건의 구조적 결함:
- **이중분류**: `athrt`/`base` 가 cross-cutting(2026-06-12)→per-BC(`BC-RESV-ATHRT`/`BC-RESV-BASE`, 2026-06-14 v0.46.5) 승격됐는데 옛 cross-cutting 쌍둥이(`shared/cross-cutting/{athrt,base}/` + `reservation-cross-cutting.json`)가 안 지워짐 → 한 개념이 양쪽 등재.
- **read-only BC 누수**: `BC-EMPLOYEE`(rd66/wr0, 자칭 cross-cutting lookup)·`BC-RESV-HLUM`(read-model)·`BC-BATCH-BIRTHDAY`(batch)가 **소유 쓰기 aggregate 0인데 per-BC 등재**.

비대칭 레지스트리가 원인: `cross_cutting_concerns[].verdict="cross_cutting"` 마커는 있으나 `domain.json#bounded_contexts[]`(등록 BC)엔 verdict 필드가 **없어** core/cross-cutting을 기계가 못 가름.

## 사실 확인 (결정론 신호 / 추정 ❌)

- **판별 칼 = "소유한 쓰기 aggregate"** — `sql-inventory summary.by_type` 의 `insert+update+delete = write_ops`. 기존 산출물에 이미 존재하는 데이터라 신규 추출 0.
- ep-be-gea 35 BC 전수 산출: **core 26 / supporting 6(EAM·NOTIFICATION·RESV-BASE·RESV-ATHRT·COMMON-CALC·EAPRV) / write_ops==0 3(EMPLOYEE·RESV-HLUM·BATCH-BIRTHDAY)**. write_ops 하나로 32/35가 결정론 분리(주관 0), 나머지 3만 사람 판정.
- `domain.schema.json#bounded_contexts[].items` 에 verdict 필드 부재 확인 — additive 추가가 backward-compat(기존 산출물 무효화 ❌).
- 게이트 배선: validator 는 `tools/<name>/src/cli.js` / `findings-aggregator` 가 `REQUIRED_VALIDATORS_PER_STAGE` 실행 → `dispatchValidator` 가 `summary:{critical,high,…}` 를 findings 로 변환 → `gate-eval` 가 `high>0` 이면 HARD block(anti-bypass). 등록은 **gate-eval + aggregator 두 REQUIRED 리스트 sync 의무**.

## 결정 (사용자 확정 2026-06-15)

1. **verdict 어휘** = `core | supporting | cross_cutting | read_model | operational` (기존 `cross_cutting_concerns[].verdict` 와 통일).
2. **판별 규칙** = write_ops>0 → core|supporting(소유 보유) / write_ops==0 → cross_cutting|read_model|operational(소유 없음). supporting/read_model/operational/cross_cutting 의 최종 택은 fan-in·역할 기반 **human-override**(decided_by 기록).
3. **불변식 강제** = ① verdict=cross_cutting ⟹ `domains/<BC>/` 샤드 없음(+ shared/cross-cutting/ 에만) / 역도 성립. ② 한 개념이 cross-cutting concern·dir + 등록 BC 양쪽 = 위반(HARD). ③ verdict↔write_ops 모순·`verdict_basis.write_ops`≠실제 = HARD(주관/stale 근거 차단).
4. **gate#0 강제** = analysis exit gate 에 `verdict-consistency-validator` 등록 → high(이중분류·모순) 발생 시 analysis→discovery 전이 STOP. read-only-needs-verdict·stale concern = medium/low(advisory, go-with-warning). **기본 = advisory(high→medium, 비차단)** / `--enforce`·`CONTEXT_OPS_VERDICT_ENFORCE=1` 시에만 HARD — 병렬 dogfood 중 타 세션 게이트 영향 0, 머지 후 enforce 승격(opt-in).
5. **단계적** = ep-be-gea 는 read-only 사후검증(`tools/context-ops-audit/verify.mjs`)로 우선 가동, 본 DEC로 플러그인 native gate 승격.

## 구현

- **NEW `tools/verdict-consistency-validator/`** (src/validator.js + cli.js + package.json + README) — write_ops 칼로 VC1(미등록)·VC2(verdict↔write_ops 모순/needs-verdict)·VC3(이중분류)·VC4(stale concern) 검사. 출력 `{findings, summary}` (analysis-extraction-validator 동형 / transformGeneric 정합). exit 1 = critical|high.
- **EDIT `tools/chain-driver/src/gate-eval.js`** + **`tools/findings-aggregator/src/aggregator.js`** — `REQUIRED_VALIDATORS_PER_STAGE['analysis']` 양쪽에 `verdict-consistency-validator` 추가(sync).
- **EDIT `tools/findings-aggregator/src/aggregator.js` dispatchValidator** — case → `transformGeneric`.
- **EDIT `tools/findings-aggregator/src/cli.js` buildValidatorArgs** — case → `['--root', <proj>/.ai-context/output, '--json']`.
- **EDIT `schemas/domain.schema.json`** — `bounded_contexts[].items` 에 `verdict`(enum) + `verdict_basis`(write_ops/read_ops/owned_aggregates/fan_in/decided_by) additive.
- **NEW `schemas/{bc-scope,findings-analysis}.schema.json`** — 기존 schema-less `domains/<BC>/bc-scope.json`·`findings-analysis.json` 해소(additive·permissive `additionalProperties` 허용 → 기존 인스턴스 무효화 ❌).

## 구현 보강 (2026-06-15 draft 완성 세션)
- **★ no-domains advisory 회귀 fix (validator.js)** — `domains/` 부재 시 early-return 이 advisory 강등을 **우회**해 `high:1` 반환 → base REQUIRED 인 비-샤딩 PoC(poc-18 등) analysis 게이트를 HARD block(DEC §결정 4 "기본 advisory 비차단·타 세션 게이트 영향 0" 계약 위반). **수정**: `no-domains-na` `info`(비차단 N/A / 도메인 샤딩 산출물 아님 = verdict 검사 무의미). advisory·enforce 양쪽 비차단.
- **TEST 추가** — `tools/verdict-consistency-validator/test/validator.test.js` 14 test(VC1~VC4 + advisory/enforce 모드 + no-domains N/A + tally 정합 / 프로그램적 tmp fixture). no-simulation 본체 도구 테스트 의무 충족.
- **STALE 테스트 정정** — `findings-aggregator/test/aggregator.test.js`(base 5→6 deepEqual + sources 7→8 + evidence_missing 4→5) + `chain-driver/test/gate-eval.test.js`(requiredValidators analysis 5→6). verdict 가 REQUIRED 리스트에 추가되며 개수 단언 stale.
- **SSOT 정합 (flows/sdlc-4stage-flow.json)** — `gates[#0].validators` 가 base 4 만 나열(직전 `analysis-extraction-validator` 추가 시 미반영된 기존 drift) → `analysis-extraction-validator` + `verdict-consistency-validator` 추가해 6 로 정합($comment "gate-eval REQUIRED.analysis ⊆ 본 validators" 진위 회복). `conditional_validators` 무변경(verdict=base).
- **검증**: verdict 14/14 · aggregator 67/67 · chain-driver 539/539 · schema-validator 111/111 · drift-validator 49/49 GREEN. 신규 schema 2종 ajv compile OK. CLI smoke(비-샤딩 → exit 0 비차단).

## 미배선(후속)
- `analysis-domain-model` 스킬에 verdict+basis **자동 emit** 규칙 본문화(현재는 검증만 / 백필은 수동·serial).
- `verdict` schema `required` 승격(현 권장 / 점진). release-readiness 체크 + version bump + skill-citation.
- ep-be-gea verdict 백필(domain.json 쓰기)은 **병렬 머지 후 serial 창**(shared 자원).

## 결과
- 분류가 "흩어진 판단"에서 **domain-model 산출물 + write_ops 결정론 근거 + gate 강제**로 승격 → athrt/base 류 이중분류·read-only 누수를 분석 전이에서 자동 차단(STOP).
- backward-compat: verdict 부재 산출물은 advisory(medium/low)로만 surface(무효화 ❌).
