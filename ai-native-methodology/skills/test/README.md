# skills/test/ — placeholder (☐ 미래 lifecycle 확장)

현재 채움 없음. v2.0+ scope.

## 향후 채움 후보 (v2.0)

- `generate-contract-test` — openapi.yaml + rules.json → contract test 코드
- `generate-unit-test-spec` — domain.json + state-map.json → unit test plan
- `generate-e2e-spec` — 7대 산출물 → E2E test scenario
- `verify-coverage` — test 코드 ↔ 산출물 cross-link 검증

## 인터페이스 (lifecycle-contract.md)

- input (분석→테스트): rules.json + openapi.yaml + schema.json + 7대 산출물
- 산출물 (테스트→구현): test-plan.json + contract-test 코드 + E2E spec
