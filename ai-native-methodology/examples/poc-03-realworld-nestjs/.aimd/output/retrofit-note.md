# PoC #03 Retrofit Note — chain corroboration #2 (sub-plan-6 / D26')

> 본 retrofit = ★ ★ chain harness corroboration #2 (PoC #05 = #1).
> Senior F2 권고 흡수 — chain 1~2 + chain 3 RED **dry-run** 까지 강제 / 진짜 test/impl 미실행.

## 의도

기존 `examples/poc-03-realworld-nestjs/output/` analysis stage 산출물을 chain harness 의 chain 1 (planning) + chain 2 (spec) + chain 3 (test-spec dry-run) 까지 ascending 적용. ≥ 2 PoC corroboration 충족 자격.

## scope

**IN**:
- chain 1 — `planning-spec.{json}` (UC subset 2개 / signup + login)
- chain 2 — `behavior-spec.{json}` + `acceptance-criteria.{json}` (BHV 2 / AC 2)
- chain 3 — `test-spec.{json}` dry-run (TC 2 / `expected_outcome: fail` / 진짜 test runner 미실행 — D26' 정합)
- traceability-matrix (chain 1~3 / forward = 0% — impl 부재 yellow 2)

**OUT** (sub-plan-6 시간 제약):
- 진짜 jest 실행 — RealWorld NestJS scale e2e cycle 비용 ↑
- chain 4 (impl-spec) — corroboration #1 (PoC #05) 가 e2e 단독 책임
- 4개 추가 UC (FIND-CURRENT / UPDATE / DELETE / Article / Comment / Tag / Profile)

## §8.1 #1 corroboration 자격

- ✅ chain 1~2 산출물 schema 정합 (planning-spec / behavior-spec / acceptance-criteria 모두 schema-validator pass)
- ✅ chain-coverage-validator 0 findings (UC→BHV 100% / BHV→AC 100%)
- ✅ chain 3 test-spec schema 정합 (dry-run 형식의 5종 물증 7 필드 forge ❌ — 실제 미실행 명시 / `(not run / retrofit dry-run)` 표기 정직)
- ✅ traceability-matrix 작성 (forward 0% — chain 4 부재 명시 / yellow 2 = scope OUT 정합)
- ✅ "chain harness 가 NestJS RealWorld scale 의 1 subset 에 적용 가능" 입증

## carry

- sp6-c1 RealWorld scale e2e (PoC #03 진짜 jest + impl) → v2.1+
- sp6-c4 PoC #04 retrofit (FE 트랙) → v2.1+

## verification

```bash
# chain 1 schema
node tools/schema-validator/src/cli.js \
  examples/poc-03-realworld-nestjs/.aimd/output/planning-spec.json \
  --schema schemas/planning-spec.schema.json
# → ✅

# chain 2 schema (behavior + acceptance)
node tools/schema-validator/src/cli.js \
  examples/poc-03-realworld-nestjs/.aimd/output/behavior-spec.json \
  --schema schemas/behavior-spec.schema.json
# → ✅

# chain 1~2 link coverage
node tools/chain-coverage-validator/src/cli.js \
  --planning ... --behavior ... --acceptance ... --test-spec ...
# → 0 findings / UC→BHV 100% / BHV→AC 100%

# traceability-matrix
node tools/traceability-matrix-builder/src/cli.js \
  --planning ... --behavior ... --acceptance ... --test-spec ...
# → 2 cells / forward=0% (chain 4 OUT) / backward=100% / yellow=2
```

## ★ ★ ★ corroboration 인정 사유

본 retrofit 은 ★ chain 1~3 자체의 dry-run 정합을 증명한다 (실제 진짜 test/impl 부재 명시). PoC #05 (corroboration #1) 가 e2e GREEN 단독 책임을 가지고, PoC #03 (본 retrofit) 가 "harness 가 다른 도메인/언어/framework 에도 적용 가능" 을 입증한다. ★ ★ §8.1 strict 7/7 #1 의 "≥ 2 PoC corroboration" 자격 충족.
