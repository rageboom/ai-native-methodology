# templates/test/ — chain 3 (test stage) template

v2.0.0-rc1 chain harness validated. chain 3 (test / RED 의무) 의 test-spec template placeholder. sub-plan-4 일부 채움 / 미채움 부분 = v2.x carry.

## 본 디렉토리 자산

현재 디렉토리 자체 template 채움은 사용자 프로젝트마다 framework 분기 (jest / vitest / junit5 / pytest / mocha 등) 가 달라 일률적 template 부재. 대신:

- `<project>/.aimd/config/test-cmd.json` (`schemas/test-cmd.schema.json` 정합) — test runner 명세
- 실 test code = chain 3 skill (`run-test-evidence`) 가 생성

## 향후 채움 후보

- `test-plan.template.json`
- `contract-test.template.ts` (openapi.yaml + rules.json → contract test)
- `e2e-spec.template.md`

## 참조

- [`../../skills/`](../../skills/) — chain 3 skill 3종 (1-depth / test-generate-test-spec · test-run-test-evidence · test-verify-coverage / v2.5.1 PATCH 평탄화)
- [`../../methodology-spec/deliverables/20-test-spec.md`](../../methodology-spec/deliverables/20-test-spec.md)
