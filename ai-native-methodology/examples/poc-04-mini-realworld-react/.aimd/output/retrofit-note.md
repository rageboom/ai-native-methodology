# PoC #04 mini Retrofit Note — chain corroboration #3 / FE 트랙

> 본 retrofit = ★ ★ chain harness corroboration #3 (PoC #05 = #1 BE e2e / PoC #03 = #2 BE retrofit / 본 PoC = #3 FE retrofit).
> Senior F7 BE-only 한계 부분 closure.
> sub-plan-6 sp6-c4 carry resolved.

## 의도

기존 `examples/poc-04-mini-realworld-react/analysis/` (PoC #04 mini analysis stage 산출물) 을 chain harness 의 chain 1~2 + chain 3 RED dry-run 까지 ascending. ★ FE 트랙 corroboration 자격 + Senior F7 (v2.0 = BE-only) 부분 closure.

## scope

**IN**:
- chain 1 — `planning-spec.json` (PAGE-LOGIN 1 use case subset / Zod validation BR)
- chain 2 — `behavior-spec.json` + `acceptance-criteria.json` (BHV-FE-LOGIN-001 / AC-FE-LOGIN-001 1 case)
- chain 3 — `test-spec.json` dry-run (TC-FE-LOGIN-001 / `expected_outcome: fail` / 진짜 vitest + React Testing Library 미실행)
- traceability-matrix (chain 1~3 / forward=0% — impl 부재 yellow 1)

**OUT** (sub-plan-6 sp6-c4 carry scope):
- 진짜 vitest + RTL 실행 — sp6-c1 RealWorld scale e2e v2.1+
- chain 4 (impl-spec) — corroboration #1 (PoC #05) 이 e2e 단독 책임
- 다른 페이지 (PAGE-HOME / PAGE-SETTINGS / PAGE-ARTICLE) / signup / logout / password-reset

## §8.1 #1 corroboration 자격 (3 PoC)

| PoC | track | scope | corroboration |
|---|---|---|---|
| **PoC #05 sample-user-register** | BE | chain 1~4 e2e GREEN (vitest 6/6) | #1 (e2e 단독 책임) |
| **PoC #03 NestJS retrofit** | BE | chain 1~2 + chain 3 RED dry-run | #2 |
| **PoC #04 mini React FSD retrofit** (본 PoC) | **FE** | chain 1~2 + chain 3 RED dry-run | **#3 / FE 트랙** |

★ ★ ★ Senior F7 (v2.0 = BE-only) 부분 closure → v2.0 = "BE 트랙 e2e + BE retrofit + FE retrofit" 으로 격상.

## carry

- sp6-c1 RealWorld scale e2e (PoC #04 진짜 RTL + impl) → v2.1+
- 다른 FE 페이지 (HOME / SETTINGS / ARTICLE) chain harness 적용 → v2.1+

## verification

```bash
# chain 1~3 schema 정합
for f in planning-spec behavior-spec acceptance-criteria test-spec; do
  node tools/schema-validator/src/cli.js \
    examples/poc-04-mini-realworld-react/.aimd/output/$f.json \
    --schema schemas/$f.schema.json
done
# → 모두 ✅

# chain 1~2 link coverage
node tools/chain-coverage-validator/src/cli.js \
  --planning ... --behavior ... --acceptance ... --test-spec ...
# → 0 findings / UC→BHV 100% / BHV→AC 100%

# traceability-matrix
node tools/traceability-matrix-builder/src/cli.js \
  --planning ... --behavior ... --acceptance ... --test-spec ...
# → 1 cell / forward=0% (chain 4 OUT) / backward=100% / yellow=1
```

## ★ ★ ★ corroboration 인정 사유

본 retrofit 은 ★ ★ FE 트랙 (React FSD + Zod + TanStack Query) 에서도 chain harness 사양 (planning-spec / behavior-spec / acceptance-criteria / test-spec dry-run) 이 **schema 정합 + validator pass** 를 입증한다. PoC #03 (BE retrofit) 와 동일 패턴으로 v2.0.0 자격을 BE-only → BE+FE 트랙 부분 closure. ★ ★ §8.1 strict 7/7 #1 의 "≥ 2 PoC corroboration" 자격 ★ ★ ★ 3개 충족.
