# tools/ — 12 검증 도구 (★ chain harness validated)

본 디렉토리 = npm workspace 12 도구. plugin user 가 자기 산출물 검증 시 CLI 호출하는 자산.

## 도구 cadence table (stage × validator × 호출 주체)

| 도구 | analysis | chain 1 (planning) | chain 2 (spec) | chain 3 (test) | chain 4 (impl) | release | 호출 주체 |
|---|---|---|---|---|---|---|---|
| [`chain-driver/`](./chain-driver/) | — | ★ init | next/state | next/state | next/state | — | ★ ★ user (cli) + hooks-bridge auto |
| [`drift-validator/`](./drift-validator/) | Phase 4.5 | — | — | — | — | — | skill auto-invoke |
| [`decision-table-validator/`](./decision-table-validator/) | Phase 4.5 | — | — | — | — | — | skill auto-invoke |
| [`formal-spec-link-validator/`](./formal-spec-link-validator/) | Phase 4.5 | — | — | — | — | — | skill auto-invoke |
| [`spectral-runner/`](./spectral-runner/) | Phase 5-1 (api) | — | — | — | — | — | skill auto-invoke (★ 진짜 외부 도구) |
| [`static-runner/`](./static-runner/) | Phase 6 (quality) | — | — | — | impl 후 | — | skill auto-invoke (★ 진짜 외부 도구) |
| [`schema-validator/`](./schema-validator/) | — | ★ | ★ | ★ | ★ | — | gate auto |
| [`planning-extraction-validator/`](./planning-extraction-validator/) | — | **gate #1** | — | — | — | — | gate auto (chain-driver next) |
| [`chain-coverage-validator/`](./chain-coverage-validator/) | — | — | **gate #2** | — | — | — | gate auto |
| [`spec-test-link-validator/`](./spec-test-link-validator/) | — | — | — | **gate #3** | — | — | gate auto |
| [`test-impl-pass-validator/`](./test-impl-pass-validator/) | — | — | — | — | **gate #4** | — | gate auto (`--allow-execute` 의무) |
| [`traceability-matrix-builder/`](./traceability-matrix-builder/) | — | — | — | — | — | ★ | user (수동) |

★ ★ ★ **mechanical gate trio**: gate auto 호출 시 finding 발견 → state.blocked=true / cli exit 2 / PreToolUse permissionDecision=deny. LLM "통과한 척" 시뮬레이션 차단 (ADR-CHAIN-005 §3).

## 분류 (P/D)

| 카테고리 | 위치 |
|---|---|
| **P (plugin user 향 / dist 의무)** | `{tool}/src/` + `{tool}/package.json` (bin) + `{tool}/README.md` |
| **P (특수 자산)** | `static-runner/rules/` (custom Semgrep 9 rules) + `spectral-runner/package-lock.json` (Spectral 외부 도구 의존) |
| **D (workspace developer 만 / dist 자동 제외)** | `{tool}/test/` + `drift-validator/corpus/` + `test-impl-pass-validator/test/fixtures/` |

★ build-plugin.js EXCLUDE_BASENAMES (test/tests/__tests__/corpus/fixtures/coverage) 으로 dist 자동 누락 (cleanup round 2-A 정합).

## 진짜 외부 도구 통합 (★ ★ ★ no-simulation 정책)

DEC-2026-04-29-static-tool-실행-의무화 정합. AI sub-agent persona 시뮬레이션 ❌ / 진짜 도구 실 실행 의무.

| 외부 도구 | wrapper | 환경 의무 |
|---|---|---|
| Spectral (OpenAPI lint) | `spectral-runner/` | npm install 의존 (package-lock 보존) |
| Semgrep (정적 분석) | `static-runner/` | pip install semgrep / Python 3.10+ / `PYTHONUTF8=1` (Windows 한국어) |
| PMD | `static-runner/` | Java 17+ |
| SpotBugs / Daikon / CodeQL | (carry / v2.x) | future extension |

## chain harness validator 4종 (sub-plan-3a/3b/4 정합)

chain harness 의 4 gate 각각에 대응하는 validator:

```
chain 1 (planning) → planning-extraction-validator (gate #1)
chain 2 (spec)     → chain-coverage-validator     (gate #2)
chain 3 (test)     → spec-test-link-validator     (gate #3)
chain 4 (impl)     → test-impl-pass-validator     (gate #4 / --allow-execute)
release            → traceability-matrix-builder
```

★ 모두 [chain-driver](./chain-driver/) cli `next` 진입 시 자동 호출 (gate finding 0 = pass / 발견 시 blocked).

## 공용 모듈

- [`_shared/baseline.js`](./_shared/) — ADR-010 baseline + ratchet (drift / decision-table / static-runner 가 import / 독립 실행 ❌)

## 추가 자료

- 각 도구 상세 사용법 = 도구별 `README.md` 참조
- chain harness 진입 시나리오 = [`../README.md`](../README.md) §시나리오 B
- 도구 호출 cadence 의 SSOT = [`../flows/sdlc-4stage-flow.json`](../flows/sdlc-4stage-flow.json) `gates[].validators` 필드
- ADR-CHAIN-001~005 = chain harness 5 요소 enforcement 명세
- DEC-2026-05-06-sub-plan-3a/3b/4/5/6 = chain validator + driver 진화 history

## 테스트 (workspace developer 전용 / dist 제외)

```bash
npm test --workspaces --if-present     # 218 unit test pass (chain harness validated 자격)
npm run test:chain                     # chain validator 6 도구만
npm run test:release                   # release-readiness §8.1 strict 9 self-test
```
