# DEC-2026-05-06-sub-plan-3a-종결

- 일자: 2026-05-06
- 카테고리: methodology / v2.0 sub-plan / chain validator 인프라
- 결정자: 윤주스 (TF Lead)
- 상태: 승인 ( sub-plan-3a 종결 / sub-plan-3b carry / no release / no tag / 본체 commit 만)
- 관련: DEC-2026-05-06-v2.0-i-strict-채택 ( trigger), DEC-2026-05-06-round-trip-부분-허용, ADR-CHAIN-001 (chain 4단계 정합 강제), ADR-CHAIN-004 ( 본 결단 동반 신설 / Test Runner Invocation Contract), master plan `~/.claude/plans/a-stateful-gadget.md` (γ hybrid Sprint M+3a), sub-plan `~/.claude/plans/sub-plan-3-tools.md` + `~/.claude/plans/sub-plan-3-research.md`, 직전 commit `ccb3f0a` (sub-plan-3a partial — 4 신규 chain validator)

## 컨텍스트

직전 sub-plan-3a partial commit (`ccb3f0a`) 에서 4 신규 chain validator (planning-extraction / chain-coverage / spec-test-link / traceability-matrix-builder) 구현 종결 / 22 unit test pass. clear 직전 보존 의무 / 다음 세션 재개 의무 명시.

본 결단 = sub-plan-3a 잔여 작업 종결:

1. **S1** — npm workspace root (10 도구 단일 workspace).
2. **chain corpus 확장** — drift-validator 5쌍 (chain 2 BHV-\* state-machine + sequence).
3. **--chain-mode** — formal-spec-link-validator (planning ↔ behavior ↔ acceptance ↔ test ↔ impl backward link + ID pattern).
4. **chain 4 lint 강화** — static-runner lint-no-simulation.sh chain 3/4 evidence 7 필드 + impl-spec source_files commit_hash 의무.
5. **6 schema 등록** — schema-validator chain schema 자동 등록 + Ajv 8 if/then 지원.
6. **chain-check.yml** — 별도 워크플로우 ( S2 / drift-check.yml 오염 ❌).
7. **--dry-run 명문화** — 4 신규 도구 README 의 3 조합 (write-baseline 차단 / prompt 차단 / exit 0 강제) 명시.
8. **ADR-CHAIN-004** — Test Runner Invocation Contract (Aider 패턴 / sub-plan-3b prerequisite).
9. **unit test 80+** — baseline 88 → 110 pass (+22 / 9 workspace 0 fail / spectral 통과).

## 결정

sub-plan-3a 종결. 9 항목 모두 통과. sub-plan-3b carry 등재.

### 산출물 (본 commit)

| 영역                                                        | 변경                                                                                                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                              | workspaces 10 도구 + `npm test` workspace 통합 + `test:chain` script                                                                           |
| `tools/drift-validator/corpus/`                             | 5쌍 신규 (`behavior-chain2-*` — equiv-01-state / drift-02-missing-transition / equiv-03-sequence / drift-04-missing-actor / equiv-05-compound) |
| `tools/drift-validator/test/corpus.test.js`                 | 5 신규 test (36 → 41 pass)                                                                                                                     |
| `tools/formal-spec-link-validator/src/check-links.js`       | `checkChainLinks` + `detectChainArtifact` 신규 export                                                                                          |
| `tools/formal-spec-link-validator/src/cli.js`               | `--mode=chain` / `--chain-mode` / `--dry-run` flag                                                                                             |
| `tools/formal-spec-link-validator/test/link.test.js`        | 7 신규 test (8 → 15 pass)                                                                                                                      |
| `tools/static-runner/src/lint-no-simulation.sh`             | `LINT_CHAIN_MODE` env / `--chain-strict` / `--chain-off` + chain 3/4 evidence 7 필드 + commit_hash 의무 검증                                   |
| `tools/static-runner/test/lint-chain.test.js`               | 5 신규 test (11 → 16 pass)                                                                                                                     |
| `tools/schema-validator/test/chain-schemas.test.js`         | 5 신규 test (0 → 5 pass)                                                                                                                       |
| `tools/spectral-runner/package.json`                        | passthrough 명시 (workspace test 호환)                                                                                                         |
| `tools/{4 신규 도구}/README.md`                             | --dry-run 의미 3 조합 명시 ( S3)                                                                                                               |
| `.github/workflows/chain-check.yml`                         | 신규 워크플로우 (workflow_dispatch only / 4 gate step / sub-plan-6 PoC #05 시점 활성)                                                          |
| `docs/adr/ADR-CHAIN-004-test-runner-invocation-contract.md` | 신규 ADR ( Senior Blocker 1 해결 / Aider 패턴 / 5 정책 / 5종 물증 7 필드)                                                                      |

### unit test 회귀 ( 110/110 / 0 fail / 9 workspace)

| 도구                          | 직전   | 현재            | 증감    |
| ----------------------------- | ------ | --------------- | ------- |
| drift-validator               | 36     | 41              | +5      |
| decision-table-validator      | 11     | 11              | 0       |
| formal-spec-link-validator    | 8      | 15              | +7      |
| static-runner                 | 11     | 16              | +5      |
| schema-validator              | 0      | 5               | +5      |
| spectral-runner               | 0      | 0 (passthrough) | 0       |
| planning-extraction-validator | 5      | 5               | 0       |
| chain-coverage-validator      | 6      | 6               | 0       |
| spec-test-link-validator      | 5      | 5               | 0       |
| traceability-matrix-builder   | 6      | 6               | 0       |
| **합계**                      | **88** | ** 110**        | **+22** |

master plan H §release 자격 "unit test 53 → 80+" → 110 pass = 38%p 초과 달성.

### 검증 ( build 회귀)

```
node scripts/version-check.js  →  ✅ all 3 sources in sync at v1.5.0
node tools/drift-validator/src/cli.js --check-layout  →  ✅ 9 phases / 19 skills / 0 orphans / 0 missing
npm test (workspace)  →  ✅ 110 pass / 0 fail / 9 workspace
```

## sub-plan-3b carry ( 후속 sprint 의무)

| #      | 항목                                                                                                     | 시점                                    |
| ------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| sp3b-1 | `test-impl-pass-validator` 신규 도구 ( 진짜 runner / 5종 물증 7 필드 / SARIF 2.1.0 / result_hash 정규화) | sub-plan-3b                             |
| sp3b-2 | `schemas/test-cmd.schema.json` 신설 (ADR-CHAIN-004 §1 정합)                                              | sub-plan-3b                             |
| sp3b-3 | `--allow-execute` flag + sandbox 정책 (Senior Blocker 2)                                                 | sub-plan-3b                             |
| sp3b-4 | flaky retry policy per-test cap 2 (Playwright 정합) + `flaky_retries_count` 필드                         | sub-plan-3b                             |
| sp3b-5 | coverage threshold 검증 (chain-coverage-validator 책임 분리)                                             | sub-plan-3b                             |
| sp3b-6 | JUnit XML / pytest JSON output adapter                                                                   | sub-plan-3b                             |
| sp3-c1 | mermaid graph view ≥ 100 cell subgraph 분할 정책                                                         | sub-plan-3b 안에서 결정 또는 sub-plan-6 |
| sp3-c2 | chain-revisit-detector AI ML 정확도 개선                                                                 | v2.x carry                              |
| sp3-c3 | CI 본격 활성 (PoC #05 데이터 후)                                                                         | sub-plan-6                              |

## sub-plan-5 carry ( chain-revisit-detector)

Senior Blocker 3 의 옵션 X-2 채택 — `chain-revisit-detector` 는 **sub-plan-5 (hooks + harness) carry**. PostToolUse + UserPromptSubmit hooks 통합 + path-to-chain whitelist + 사용자 결단 의무 (false positive > 30% 묵인 ❌).

## §8.1 strict 정합 평가

본 sub-plan-3a 산출 = 본체 인프라 (도구 / schema / ADR / workflow). PoC corroboration 의무 = sub-plan-6 PoC #05 시점. 본 sprint = §8.1 release 자격 평가 대상 ❌ (no release / no tag).

## 결과

### 긍정

- 9 항목 모두 통과 / 110 unit test / 0 fail.
- ADR-CHAIN-004 신설 → sub-plan-3b prerequisite 해결.
- chain-check.yml 별도 워크플로우 → drift-check.yml 오염 0.
- npm workspace 도입 → 도구 간 dep drift 회피 (S1 정합).

### 부정

- sub-plan-3b (test-impl-pass-validator) 미진입 — 진짜 runner 5종 물증 검증대 carry 잔존.
- chain-revisit-detector → sub-plan-5 carry (sub-plan-3 안에서 종결 ❌).

### 중립

- `--dry-run` 의미 명문화는 README 단에서만 (CLI help 텍스트는 기존 형식 유지). 추가 명문화 = 후속 carry 가능.

## release / 갱신

- no release / no tag / 본체 commit 만 (master plan §H 정합 — sub-plan 종결 = release worthy 아님 / sub-plan-6 시점 v2.0.0 release).
- CHANGELOG.md 갱신 ❌ (release 시 합산).
- STATUS.md sub-plan-3a 진행 행 업데이트 + sub-plan-3b carry 등재.
- INDEX.md 본 결단 신규 등재.
- CLAUDE.md 갱신 ❌ (sub-plan-3 진입 시점 이미 chain harness 4단계 명시).

## Lessons / 보존

- S1 npm workspace 첫 도입 → 14차 retract pattern (단일 source-of-truth 위배) 회피 — 도구별 package.json 독립 보존.
- Senior Blocker 1 (invocation matrix) → ADR-CHAIN-004 로 정식 해결. monorepo / JVM / Python / Go 5 framework 무관.
- static-runner lint-no-simulation.sh 의 chain mode 신설 = 본 방법론 핵심 가치 ( no-simulation) 의 chain 4 단계 확장 첫 적용.
- Aider `--test-cmd` 패턴 = 산업 1년 운영 입증 → AI runner 추론 차단 (Cursor 미통합 case 의 LLM 환각 위험성 정합).
