# unit-spec-oracle-validator

> v0.69.0 신설 (DEC-2026-06-22-unit-spec-oracle-symmetry). soft / 게이트 미차단.

## 목적

`unit-spec.json` 의 `unit_test_obligation=required` UNIT 이 **검증 oracle 을 ≥1 가리키는지** 검사한다. behavior 스레드의 `acceptance-criteria.json` 에는 `verifiable=true ⇒ test_case_refs≥1` 짝 규칙이 schema if/then **하드게이트**로 있다("검증 가능하다고 했으면 검증할 대상을 대라"). unit 스레드엔 대응 규칙이 없어 `required` UNIT 이 합격선 0건으로 통과 가능 = test 단계에서 합격선을 발명하는 **거짓 GREEN** 위험. 본 validator 가 그 비대칭을 메운다.

## 규칙

required UNIT 마다:

> `invariant_refs` (formal 불변식 / designed_from_spec) **∪** `property_test_refs` **∪** `characterization_snapshot_refs` (S2 AS-IS / characterized_from_code) 의 합이 **≥1**. 0건이면 `oracle_waiver`(정직 면제 사유, 빈 문자열 ❌) 의무.

- 위반 → `unit.oracle.missing` (**medium** / soft).
- `--characterization` 제공 시 `characterization_snapshot_refs` 가 `snapshots[].snapshot_id` 에 실재하는지 → 없으면 `unit.oracle.dangling_snapshot_ref` (medium).

**스코프**: `required` 만 검사. `waived`(테스트 면제) / `characterization_only`(별도 carry — `decisions/STATUS.md` frontier)는 대상 아님.

**soft 불변**: 모든 finding `severity=medium` 고정. high 경로는 `ORACLE_MISSING_SEVERITY` 상수로만 존재(현재 emit 0). ≥2 도메인 입증 후 hard 격상 = 별도 promotion DEC + `medium→high` + `gate-eval REQUIRED_VALIDATORS_PER_STAGE.spec` 등재.

## 사용

```bash
node src/cli.js <unit-spec.json> [--characterization <characterization-spec.json>] [--json] [--dry-run]
```

- `<unit-spec.json>` 부재 = **N/A** (빈 결과 exit 0) — unit-spec 은 optional 산출물(behavior-only mode 정상). aggregator `failClosedOnNull=true` 환경에서 `evidence_missing` 오탐을 막으려 부재 시에도 non-null 빈 JSON.
- exit: `0`(정합·waiver·dry-run·파일부재) / `1`(high finding — 현재 soft 0) / `2`(usage).

## wiring

- `flows/spec.phase-flow.json` — `unit-spec-derive` phase `automated_validation` + `cross_cutting.validators`.
- `flows/sdlc-4stage-flow.json` — gate#2 `conditional_validators` (gate `validators`·`gate-eval REQUIRED` 미등재 = soft).
- `tools/findings-aggregator/` — spec stage `extraValidators` 주입 + `dispatchValidator` case (medium-only / generic transform).

## 인용

- 결단: DEC-2026-06-22-unit-spec-oracle-symmetry
- schema: `schemas/unit-spec.schema.json` (`oracle_waiver` / `characterization_snapshot_refs`)
- 정책: `methodology-spec/policies/test-layering.md` (2층 모델 / behavior↔unit 스레드)
- 선례: `tools/analysis-self-consistency-validator/` (soft validator 패턴)
- 외부: Beck TDD(2002) / Feathers WELC(2004) — characterization oracle
