# plan — unit-spec oracle 대칭 (required ⇒ oracle≥1 soft validator)

> 상태: 승인 대기 (4원칙 §3). 코드 착수 = 사용자 일괄 승인 후.
> 목표 버전: v0.69.0 MINOR (현 0.66.0). additive·conditional·soft.

## Context — 왜

spec 단계에 **behavior 스레드와 unit 스레드의 비대칭**이 있다.

- **behavior**: `BHV → AC(acceptance-criteria) → TC`. AC는 `verifiable=true ⇒ test_case_refs≥1`을 schema if/then **하드게이트**로 강제 — "검증 가능하다고 했으면 검증할 대상을 실제로 대라".
- **unit**: `UNIT(unit-spec) → TC(test_layer=unit)`. UNIT은 `unit_test_obligation=required`라고 선언할 수 있는데, "그래서 무엇을 만족하면 합격인가(oracle)"를 가리키는 `invariant_refs`/`property_test_refs`가 **optional → 0건으로 통과 가능**. 그러면 test 단계에서 합격선을 발명하거나 구현을 보고 역으로 맞춤 = **거짓 GREEN**. unit-spec이 애초에 막으려던 "mock=검증 안 된 가정"의 사촌.

**결정(1번)**: behavior의 짝 규칙을 unit에 대칭으로 채운다.
> `unit_test_obligation=required` ⇒ `invariant_refs` 또는 `property_test_refs` 또는 (신규)`characterization_snapshot_refs` 중 **≥1**. 없으면 신규 `oracle_waiver`(사유 string) 의무.

초기 **soft**(finding만, 게이트 미차단) → 서로 다른 ≥2 도메인 입증 후 hard 격상(별도 DEC / DEC-2026-06-12-unit-layer-hard-flip 선례 경로).

## 실측 baseline (pre-fix / 추정 금지)

unit-spec.json = 2개. required UNIT 4개 중 oracle-0건 **3개**:

| PoC | UNIT | provenance | oracle | soft finding |
|---|---|---|---|---|
| poc-18 (Express/Prisma, S2) | UNIT-ENCRYPTION-001 | characterized_from_code | 0 | ✓ |
| poc-18 | UNIT-PICK-001 | characterized_from_code | 0 | ✓ |
| poc-21 (greenfield) | UNIT-ALLOC-001 | designed_from_spec | inv 4 | — (pass) |
| poc-21 | UNIT-FORMAT-001 | designed_from_spec | 0 | ✓ |
| poc-21 | UNIT-RECEIPT-DTO-001 | (waived) | — | — (면제) |

→ soft 도입 시 즉시 **medium 3건**. critical/high 0 = 게이트 통과. 이 3건이 규칙의 실작동 실증이자 해소 라운드트립 대상.

## 핵심 설계 결정 (승인 묶음)

1. **신규 standalone validator** `tools/unit-spec-oracle-validator/` — `formal-spec-link-validator`(unit-spec 미지원) / `spec-test-link-validator`(mock-soundness 전용) 확장 ❌. 단일 책임. 직전 v0.66.0 `analysis-self-consistency-validator` 4파일 구조를 템플릿으로 복제.
2. **soft 이중 가드** — finding `severity=medium`만 emit + `gate-eval.js REQUIRED_VALIDATORS_PER_STAGE.spec` **미등재**. (gate-eval은 critical/high만 HARD_BLOCK.) `summary.high` 영구 0 회귀가드 테스트. cli.js의 `exit(high>0?1:0)`+high 분기는 **코드에 남겨** hard 격상 시 3-edit(medium→high · REQUIRED 등재 · gate#2 validators 이동)으로 전환.
3. **schema 2필드 additive** — `schemas/unit-spec.schema.json` units[].items에 `oracle_waiver`(string) + `characterization_snapshot_refs`(string[], `^SNAP-` 패턴). `additionalProperties:false` 정합. **`required⇒oracle` if/then은 schema에 넣지 않음**(넣으면 schema-validator가 막아 hard가 됨 — validator가 담당). `oracle_waiver` 존재 시 `minLength:1` 정직마커 if/then만(기존 `waived⟹waiver_reason` 선례).
4. **wiring = spec stage** (unit-spec은 chain 2 산출물): `flows/spec.phase-flow.json` unit-spec-derive phase에 `automated_validation` 신설 + `cross_cutting.validators` 추가 / `flows/sdlc-4stage-flow.json` gate#2 `conditional_validators` 추가 / `findings-aggregator` spec 분기에 `extraValidators:['unit-spec-oracle-validator']` 주입 (`failClosedOnNull` 미부여). check26 4중 정합 철자 일치 의무.
5. **release-readiness 신규 check 불필요** — `criteria_total`/`passCount`는 `results[]`에서 자동(하드코딩 id 목록 없음). 기존 `check26_gateValidatorListConsistency`가 flow 편집을 자동 재검증(회귀가드).
6. **dogfood = 2 PoC spectrum-cross** — baseline 3건을 `oracle_waiver`로 정직 해소(invariant 날조 ❌): poc-18 ENCRYPTION/PICK = "characterized_from_code / characterization snapshot 미수립(carry)", poc-21 FORMAT = "trivial 통화 포맷터 / invariant 불요". 검출→해소 라운드트립으로 legacy-S2 + greenfield 양쪽 작동 입증(§8.1 과적합 회피).

## 변경 파일

**본체 (1순위)**
- `schemas/unit-spec.schema.json` — 결정 3
- `tools/unit-spec-oracle-validator/{package.json,src/cli.js,src/validator.js,test/validator.test.js}` — 신규 (≥14 test)
- `tools/findings-aggregator/src/aggregator.js` (dispatchValidator case 추가, medium-only) + `src/cli.js` (buildValidatorArgs case + spec 분기 extraValidators) + `test/` 보강
- `flows/spec.phase-flow.json` + `flows/sdlc-4stage-flow.json` — 결정 4

**부수**
- `.claude-plugin/plugin.json` (0.66.0→0.69.0) + `package.json` + `pnpm-lock.yaml`
- `CHANGELOG.md` (v0.69.0 블록) + repo-root `CLAUDE.md` ("현재 vX" 한 줄 교체 / 직전 narrative 삭제)
- `decisions/INDEX.md` + 신규 `decisions/DEC-2026-06-22-unit-spec-oracle-symmetry.md` + `decisions/STATUS.md`(hard 격상 frontier 기재)
- `tools/README.md`
- examples/poc-18·poc-21 unit-spec.json (dogfood oracle_waiver 부착)

**불변**: `tools/chain-driver/src/gate-eval.js REQUIRED.spec` 건드리지 않음(soft=conditional only). `traceability-matrix-builder`(unit_coverage=test→unit 커버리지)와 직교 — 충돌 없음.

## 검증

```
node --test tools/unit-spec-oracle-validator/test/validator.test.js
node tools/unit-spec-oracle-validator/src/cli.js examples/poc-18-express-prisma-modern-ts/target/.ai-context/output/unit-spec.json --json   # baseline 2 medium
node tools/findings-aggregator/src/cli.js --target examples/poc-21-greenfield-money-allocation --stage spec --dry-run --json   # medium, critical/high 0
node scripts/release-readiness.js examples/poc-21-greenfield-money-allocation --json   # check26 pass
npm run test:release   # 전체 GREEN (메모리: targeted 미검출 → full 의무)
```
해소 후: 위 baseline 재실행 → 0 finding (라운드트립 입증).

## 위험

- soft 누수: validator가 high emit 또는 REQUIRED.spec 등재 시 즉시 HARD 차단 → chain 정지. 가드 = high 영구 0 테스트 + REQUIRED 미등재 + check26.
- aggregator spec 분기는 현재 extraValidators 미사용 → main 분기 수정 필수(누락 시 flow 등재값과 실행 drift).
- check26 철자: norm이 `-` 보존 → sdlc/phase-flow/README의 `unit-spec-oracle-validator` 완전 일치.

## Lessons Learned

- **self-test A1 spawn timeout = 머신 부하 함수 (회귀 아님)** — `release-readiness.test.js` 의 `A1 본격 spawn`(pnpm -r run test 재spawn / 600s timeout)이 무거운 백그라운드 동시 실행 중엔 1019초 → timeout(`actual:null`) fail. 부하 낮을 때 재실행 시 **38초 통과**. 교훈: release 검증(`test:release`)은 다른 무거운 작업과 동시 실행 회피. `workspace test 0 fail`(check11 직접 실행 detail)이 회귀 판별 1차 증거 — self-test timeout ≠ 코드 회귀.
- **soft validator = severity 상수 + REQUIRED 미등재 이중 가드** — schema if/then(hard) 대신 validator finding(soft). high 경로는 `ORACLE_MISSING_SEVERITY` 상수로 남겨 hard 격상 1-edit. 파일 부재 N/A exit 0 으로 `failClosedOnNull` evidence_missing 오탐 차단.
- **신규 DEC 슬러그 인용은 DEC 파일과 동시 생성** — README/schema 가 DEC 슬러그 인용 시 `decisions/DEC-*.md` 부재면 skill-citation-validator dangling 검출(check11 workspace test + check13 동시 fail). DEC 파일 먼저/동시 생성으로 해소.
- **dogfood baseline 은 git HEAD 원본 대조** — waiver 부착 후 0 finding 만으론 "검출됐는가" 불명. `git show HEAD:` 원본을 validator 에 돌려 BEFORE 3 medium 확인 = 라운드트립 입증(검출→해소).
