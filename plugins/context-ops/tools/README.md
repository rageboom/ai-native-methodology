# tools/ — 검증 도구 npm workspace (29 패키지)

본 디렉토리 = npm workspace 29 도구 패키지 (`_shared` lib + `semgrep-rules` data 제외). plugin user 가 자기 산출물 검증 시 CLI 호출하는 자산. (정확한 인벤토리는 하위 폴더 + `package.json` workspaces 참조 — 본 README 는 카운트 하드코딩 최소화.)

## 자산 매핑 매트릭스 cross-link (v3.6.1)

본 도구 자산 = `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 의 **Tool / Validator column** detail. 아래 cadence table = 본 매트릭스 8 row 중 stage × tool 의 확장 매핑.

## 도구 cadence table (stage × validator × 호출 주체)

> **chain N = gate #N** (System Y / discovery1·spec2·plan3·test4·implement5). 게이트 validator 는 해당 chain 열의 **gate #N** 으로 표기.

| 도구 | analysis | chain 1 (discovery) | chain 2 (spec) | chain 3 (plan) | chain 4 (test) | chain 5 (impl) | release | 호출 주체 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [`chain-driver/`](./chain-driver/) | — | init | next/state | next/state | next/state | next/state | — | user (cli) + hooks-bridge auto |
| [`drift-validator/`](./drift-validator/) | Phase 4.5 | — | — | — | — | — | — | skill auto-invoke |
| [`decision-table-validator/`](./decision-table-validator/) | Phase 4.5 | — | — | — | — | — | — | skill auto-invoke |
| [`formal-spec-link-validator/`](./formal-spec-link-validator/) | Phase 4.5 | — | sub | — | — | — | — | skill auto-invoke |
| [`br-cross-consistency-validator/`](./br-cross-consistency-validator/) | Phase 4 (business-logic) | gate #1 보조 (Layer 1 결정 + Layer 2 LLM) | — | — | — | — | — | skill auto-invoke / gate auto |
| [`characterization-coverage-validator/`](./characterization-coverage-validator/) | Phase 4.7 (characterization) | — | — | — | — | — | — | skill auto-invoke |
| [`sql-inventory-validator/`](./sql-inventory-validator/) | Phase 4.8 (sql-inventory / RDB only) | — | — | — | — | — | — | skill auto-invoke |
| [`spectral-runner/`](./spectral-runner/) | Phase 5-1 (api) | — | — | — | — | — | — | skill auto-invoke (진짜 외부 도구) |
| [`static-runner/`](./static-runner/) | Phase 6 (quality) | — | — | — | — | impl 후 | — | skill auto-invoke (진짜 외부 도구) |
| [`schema-validator/`](./schema-validator/) | — | sub | sub | sub | sub | sub | — | gate auto (전 stage 공용) |
| [`discovery-extraction-validator/`](./discovery-extraction-validator/) | — | **gate #1** | — | — | — | — | — | gate auto (chain-driver next) |
| [`chain-coverage-validator/`](./chain-coverage-validator/) | — | — | **gate #2** | — | — | — | — | gate auto (+ release traceability) |
| [`plan-coverage-validator/`](./plan-coverage-validator/) | — | — | — | **gate #3** | — | — | — | gate auto (NFR allocation + SP 분류 hard gate) |
| [`spec-test-link-validator/`](./spec-test-link-validator/) | — | — | — | — | **gate #4** | — | — | gate auto |
| [`test-impl-pass-validator/`](./test-impl-pass-validator/) | — | — | — | — | dry-run | **gate #5** | — | gate auto (`--allow-execute` 의무) |
| [`findings-aggregator/`](./findings-aggregator/) | — | aux | aux | aux | aux | aux | — | user 수동 (선택적 findings 생성 보조 / 자동 호출 ❌ / gate 강제는 gate-eval·CI) |
| [`traceability-matrix-builder/`](./traceability-matrix-builder/) | — | — | — | — | — | — | ✓ | user (수동) |

**mechanical gate trio**: gate auto 호출 시 finding 발견 → state.blocked=true / cli exit 2 / PreToolUse permissionDecision=deny. LLM "통과한 척" 시뮬레이션 차단 (ADR-CHAIN-005 §3).

## 분류 (P/D)

| 카테고리                                        | 위치                                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **P (plugin user 향 / dist 의무)**              | `{tool}/src/` + `{tool}/package.json` (bin) + `{tool}/README.md`                                                |
| **P (특수 자산)**                               | `static-runner/rules/` (custom Semgrep 9 rules) + `spectral-runner/package-lock.json` (Spectral 외부 도구 의존) |
| **D (workspace developer 만 / dist 자동 제외)** | `{tool}/test/` + `drift-validator/corpus/` + `test-impl-pass-validator/test/fixtures/`                          |

build-plugin.js EXCLUDE_BASENAMES (test/tests/**tests**/corpus/fixtures/coverage) 으로 dist 자동 누락 (cleanup round 2-A 정합).

## 진짜 외부 도구 통합 (no-simulation 정책 / R19 정합)

DEC-2026-04-29-static-tool-실행-의무화 + DEC-2026-05-18-runtime-tool-exclusion 정합. AI sub-agent persona 시뮬레이션 ❌ / 진짜 도구 실 실행 의무.

charter R19 (Tool Ecosystem Dependency Classification) 의 3-tier paradigm:

| Tier                                  | 도구                                 | wrapper                         | 환경 의무                                                                             |
| ------------------------------------- | ------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------- |
| **1** (in-plugin native)              | Spectral (OpenAPI lint)              | `spectral-runner/`              | npm install 의존 (Node.js)                                                            |
| **1** (in-plugin native)              | Semgrep (정적 분석 / multi-language) | `static-runner/ --plugin semgrep` | `pipx install semgrep` / Python 3.10+ / `PYTHONUTF8=1` (Windows 한국어)               |
| **1** (in-plugin / DEC-2026-06-07)    | PMD (Java 정적 분석)                 | `static-runner/ --plugin pmd`     | PMD 7.x + JDK 8+ (PATH 등재) — 부재 시 exit 3 정직 신호 (자동실행 / poc-06+poc-10 corroboration) |
| **2** (user-environment SARIF import) | allowlist=PMD (orthogonal / 확장은 명시 등재) | `static-runner/ --import-sarif` | 사용자 CI / 로컬 환경 (Java 8+) — in-plugin 불가 환경의 import 경로 / 실 import 이력 0 도구 미등재 |
| **3** (simulated)                     | ❌ AI persona / 손작성 SARIF         | —                               | 영구 reject (chain gate -5%p + block)                                                 |

분류 축 = **실행 locus** (DEC-2026-06-07-pmd-tier1-promotion): Tier 1 = plugin 직접 실행(런타임 JVM 의존 무관 — PMD·Gradle·JUnit 포함) / Tier 2 = 사용자 CI SARIF import. PMD 는 양쪽 유효(orthogonal). (구 v8.6.0 = PMD in-plugin 일시 격하 → SARIF import 위임이었으나, poc-06 legacy + poc-10 modern in-plugin auto-run 물증 확보로 Tier 1 재편입. import 경로는 보존.)

## chain harness gate validator 5종 (chain N = gate #N)

chain harness 의 5 gate 각각에 대응하는 validator:

```
chain 1 (discovery) → discovery-extraction-validator (gate #1)
chain 2 (spec)      → chain-coverage-validator      (gate #2)
chain 3 (plan)      → plan-coverage-validator       (gate #3 / NFR·SP 분류 hard gate)
chain 4 (test)      → spec-test-link-validator      (gate #4)
chain 5 (impl)      → test-impl-pass-validator      (gate #5 / --allow-execute)
release             → traceability-matrix-builder
```

## cadence 외 도구 (analysis enrich / graph / input / release / workspace meta)

위 cadence table 외 도구 — lifecycle gate cadence 에 직접 묶이지 않는 보조·분석 enrich·meta 자산 (상세 = 각 도구 `README.md`):

| 도구 | 분류 | 역할 |
| --- | --- | --- |
| [`codegraph-runner/`](./codegraph-runner/) | analysis enrich | codegraph 인덱싱 (함수·호출·심볼 그래프) |
| [`codegraph-coverage/`](./codegraph-coverage/) | analysis enrich | codegraph 기반 coverage-hole 검출 (reference-lens / 비차단) |
| [`context-federator/`](./context-federator/) | analysis enrich | dep × code federation (심볼 callers/callees/impact) |
| [`dep-graph-viz/`](./dep-graph-viz/) | analysis enrich | artifact dependency graph 렌더 (trace-view) |
| [`graph-integrity-validator/`](./graph-integrity-validator/) | cross-cut | artifact dependency graph 무결성 검증 |
| [`code-pointer-validator/`](./code-pointer-validator/) | cross-cut | 산출물 code pointer (strict_path / ast_symbol) 실재 검증 |
| [`analysis-extraction-validator/`](./analysis-extraction-validator/) | analysis | analysis 추출 산출물 입출력 무결성 |
| [`greenfield-bootstrap/`](./greenfield-bootstrap/) | input | greenfield 진입 (swagger→openapi elevation / 결정적) |
| [`db-assets-validator/`](./db-assets-validator/) | analysis·plan | DB 자산 always-on 정책 + SP 전환 결단 검증 |
| [`adopter-evidence-packager/`](./adopter-evidence-packager/) | release | adopter corroboration evidence 패키징 |
| [`skill-citation-validator/`](./skill-citation-validator/) | workspace meta | skill·doc `## 인용` dead-link 검사 |
| [`inflation-lint/`](./inflation-lint/) | workspace meta | 산출물 inflation (과장 표기) lint |

모두 [chain-driver](./chain-driver/) cli `next` 진입 시 자동 호출 (gate finding 0 = pass / 발견 시 blocked).

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
npm test --workspaces --if-present     # 전 workspace unit test (chain harness validated 자격)
npm run test:chain                     # chain gate validator 도구만
npm run test:release                   # release-readiness §8.1 strict 9 self-test
```
