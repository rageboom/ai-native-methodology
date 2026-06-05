# templates/test/ — chain 4 (test stage) template

chain 4 (test / RED 의무) 의 test-spec template placeholder.

## 본 디렉토리 자산

현재 디렉토리 자체 template 채움은 사용자 프로젝트마다 framework 분기 (jest / vitest / junit5 / pytest / mocha 등) 가 달라 일률적 template 부재. 대신:

- `<project>/.aimd/config/test-cmd.json` (`schemas/test-cmd.schema.json` 정합) — test runner 명세
- 실 test code = chain 4 skill (`run-test-evidence`) 가 생성

## 향후 채움 후보

- `test-plan.template.json`
- `contract-test.template.ts` (openapi.yaml + rules.json → contract test)
- `e2e-spec.template.md`

## 참조

- [`../../skills/`](../../skills/) — chain 4 skill 3종 (1-depth / test-generate-test-spec · test-run-test-evidence · test-verify-coverage)
- [`../../methodology-spec/deliverables/20-test-spec.md`](../../methodology-spec/deliverables/20-test-spec.md)
