# DEC-2026-05-06-sub-plan-3b-종결

- 일자: 2026-05-06
- 카테고리: methodology / v2.0 sub-plan / chain 4 gate validator (★ ★ ★ no-simulation enforcement)
- 결정자: 윤주스 (TF Lead)
- 상태: 승인 (★ ★ ★ sub-plan-3b 종결 / test-impl-pass-validator 신설 / unit test 110 → 135 / no release / no tag)
- 관련: ADR-CHAIN-004 (★ prerequisite), DEC-2026-05-06-sub-plan-3a-종결, DEC-2026-05-06-v2.0-i-strict-채택, DEC-2026-04-29-static-tool-실행-의무화 (★★★ no-simulation), master plan `~/.claude/plans/a-stateful-gadget.md` (γ hybrid Sprint M+3b), sub-plan `~/.claude/plans/sub-plan-3b-test-impl-pass.md`, 직전 commit `edbdd4d` (sub-plan-3a 종결)

## 컨텍스트

sub-plan-3a 종결 commit (`edbdd4d`) 후속. ADR-CHAIN-004 (Test Runner Invocation Contract / Aider 패턴) 신설 → sub-plan-3b prerequisite 해결. 본 sub-plan-3b = ★ ★ ★ chain 4 (impl → done) gate 핵심 enforcement 도구 신설.

## 결정

★ ★ ★ sub-plan-3b 종결. 9 항목 모두 통과.

### 산출물 (본 commit)

| 영역 | 변경 |
|---|---|
| `schemas/test-cmd.schema.json` | 신규 — ADR-CHAIN-004 §1 contract (framework enum 11종 / shell:true ❌ array argument / timeout 600s / flaky_retry 2 / report_format / allow_execute / stdout_parser if/then) |
| `schemas/test-spec.schema.json` | `flaky_retries_count` 필드 추가 (★ ADR-CHAIN-004 §5) |
| `schemas/impl-spec.schema.json` | `flaky_retries_count` 필드 추가 |
| `tools/test-impl-pass-validator/` | ★ ★ ★ 신규 도구 (workspace 11번째) — `package.json` + `src/cli.js` (--allow-execute / --dry-run / --timeout / --flaky-retry / --json) + `src/load-test-cmd.js` (config 우선 + inventory 추론) + `src/result-hash.js` (SARIF Appendix F) + `src/runners/{jest,vitest,junit-xml,pytest,other}.js` (5 adapter) + 3 test file (25 test) + `test/fixtures/{jest.json,junit.xml,pytest.json}` |
| `package.json` | workspace 등록 11번째 + `test:chain` script 갱신 |
| `.github/workflows/chain-check.yml` | gate #3-4 활성 (★ sub-plan-3a placeholder 교체) — dry-run only step + strict opt-in step |

### unit test 회귀 (★ ★ ★ 110 → 135 / 0 fail / 11 workspace)

| 도구 | 직전 (3a) | 현재 (3b) | 증감 |
|---|---|---|---|
| drift-validator | 41 | 41 | 0 |
| decision-table-validator | 11 | 11 | 0 |
| formal-spec-link-validator | 15 | 15 | 0 |
| static-runner | 16 | 16 | 0 |
| schema-validator | 5 | 5 | 0 |
| spectral-runner | 0 (passthrough) | 0 | 0 |
| planning-extraction-validator | 5 | 5 | 0 |
| chain-coverage-validator | 6 | 6 | 0 |
| spec-test-link-validator | 5 | 5 | 0 |
| traceability-matrix-builder | 6 | 6 | 0 |
| **test-impl-pass-validator** | — | **★ 25** | **+25** |
| **합계** | **110** | **★ 135** | **+25** |

★ master plan H §release 자격 "unit test 53 → 80+" → 135 pass = ★ 69%p 초과 달성.

### 검증

```
node scripts/version-check.js  →  ✅ all 3 sources in sync at v1.5.0
node tools/drift-validator/src/cli.js --check-layout  →  ✅ 9 phases / 19 skills / 0 orphans / 0 missing
npm test (workspace)  →  ✅ 135 pass / 0 fail / 11 workspace
```

### 9 항목 결단 cluster

1. ✅ test-cmd.schema.json 신설 (★ ADR-CHAIN-004 §1)
2. ✅ test-impl-pass-validator skeleton (workspace 등록)
3. ✅ result-hash.js (SARIF Appendix F deterministic / 7 unit test)
4. ✅ runner adapter 4종 + other (jest/vitest/junit-xml/pytest/other / 10 unit test)
5. ✅ CLI --allow-execute / --dry-run / timeout / flaky retry (8 unit test)
6. ✅ test-spec / impl-spec schema flaky_retries_count
7. ✅ chain-check.yml gate #3-4 활성 (dry-run + opt-in strict)
8. ✅ workspace 회귀 110 → 135 (+25)
9. ✅ DEC + STATUS + INDEX 갱신 + commit

## ★ ★ ★ no-simulation 정책 chain 4 단계 첫 enforcement

본 도구 = **★ ★ ★ no-simulation 정책 chain 4 단계 핵심 enforcement**:
- ★ array argument (shell:true ❌) — shell injection 차단
- ★ --allow-execute 의무 (사용자 명시 동의 / CI 자동화 시 explicit allowlist)
- ★ result_hash 결정성 (sorted test_names + counts + framework / timestamp/duration/abs path 제외 / SARIF Appendix F)
- ★ 5종 물증 7 필드 schema 강제 (test-spec.schema + impl-spec.schema)
- ★ flaky retry per-test cap 2 (Playwright 정합 / 3회+ retry = 진짜 fail)
- ★ timeout 600s default + maxBuffer 50MB (OOM hang 차단)

## ★ test runner 5 framework 무관 (Aider 패턴 입증)

- **jest** — `npm test` / `npx jest --json` stdout 파싱
- **vitest** — `npx vitest run --reporter=json` (jest 호환)
- **junit5** — `mvn test` / `./gradlew test` → surefire XML 파싱 (testsuites attribute 우선)
- **pytest** — `python -m pytest --json-report` plugin
- **other** — stdout regex fallback (test-cmd.json.stdout_parser 의무 / if/then schema)

PoC #05 (sub-plan-6) 시점 5 framework × 1 PoC = 본 도구 corroboration 데이터.

## sub-plan-4 진입 prerequisite 충족

| # | 항목 | 상태 |
|---|---|---|
| 1 | ADR-CHAIN-001~004 | ✅ 4건 등재 |
| 2 | 6 신규 schema (planning/behavior/acceptance/test/impl/traceability + test-cmd) | ✅ 7종 등재 (test-cmd 추가) |
| 3 | 11 chain validator | ✅ 본 sub-plan-3b 까지 11종 / unit test 135 |
| 4 | chain-check.yml CI infra | ✅ gate #1~#4 모두 step 정의 |

★ ★ sub-plan-4 (skills + flows) 진입 가능. master plan §H sequencing 정합.

## 결과

### 긍정
- chain 4 gate **진짜 enforcement** 첫 도달 (no-simulation 정책 chain 단계 확장).
- 5 framework adapter (jest/vitest/junit-xml/pytest/other) — 산업 표준 invocation 호환.
- result_hash SARIF Appendix F 정합 — 재현성 보장.
- --allow-execute → CI sandbox 동의 명시 / 시뮬 위험 차단.
- 25 unit test (fixture-based / sandbox 충돌 ❌).

### 부정
- mocha / cargo-test / dotnet-test / phpunit / go-test 본격 adapter 부재 — `other` regex fallback 만 (sub-plan-6 PoC #05 시점 또는 v2.1 carry).
- chain-revisit-detector → sub-plan-5 (hooks) carry (DEC-2026-05-06-sub-plan-3a-종결 정합).

### 중립
- PoC #05 corroboration 데이터 부재 — sub-plan-6 시점 본격 검증.

## release / 갱신

- ★ no release / no tag / 본체 commit 만 (master plan §H 정합 — sub-plan-6 시점 v2.0.0 release).
- CHANGELOG.md 갱신 ❌ (release 시 합산).
- STATUS.md sub-plan-3b 진행 행 ✅ + sub-plan-4 진입 prerequisite 갱신.
- INDEX.md 본 결단 등재.
- CLAUDE.md 갱신 ❌.

## sub-plan-4 carry (★ ★ 다음 sprint)

| # | 항목 | 비고 |
|---|---|---|
| sp4-1 | 14 신규 skill SKILL.md (analysis 9 + planning 3 + spec 3 + test 3 + implement 2 + _base 2) | master plan §B |
| sp4-2 | agents/{planning,test,implement}/README.md placeholder → 정식 정의 | — |
| sp4-3 | agents/spec/README.md 신규 | — |
| sp4-4 | flows/{planning,spec,test,implement}.phase-flow.{json,mermaid} 신규 5 flow | — |
| sp4-5 | flows/sdlc-4stage-flow.{json,mermaid} 신규 통합 (stages + revisit_edges) | ★ master plan SSOT |
| sp4-6 | drift-validator phase-flow corpus 추가 (sdlc-4stage 검증) | sub-plan-3a corpus reuse |

## sub-plan-3b carry (★ 후속 / sub-plan-6 또는 v2.1)

| # | 항목 | 시점 |
|---|---|---|
| sp3b-c1 | mocha / cargo-test / dotnet-test / phpunit / go-test 본격 adapter | sub-plan-6 또는 v2.1 |
| sp3b-c2 | tree-sitter semantic diff (chain-revisit-detector 정확도) | v2.x |
| sp3b-c3 | dorny/test-reporter / Codecov 통합 | sub-plan-6 |
| sp3b-c4 | mermaid graph view ≥ 100 cell subgraph 분할 (sp3-c1 carry) | sub-plan-6 |
| sp3b-c5 | sax-parser 기반 multi-suite junit-xml 본격 파서 | v2.1 |

## Lessons / 보존

- ★ ★ ADR 사전 채택 (ADR-CHAIN-004) → sub-plan-3b 결단 cluster 5건 → 사용자 일괄 승인 가능 (cycle 단축 입증).
- ★ ★ ★ no-simulation 정책 chain 단계 확장 = 본 방법론 핵심 가치 첫 운영 적용.
- ★ Aider 패턴 (.aimd/config/test-cmd.json + array argument) = 1년 산업 운영 입증 → AI runner 추론 차단 효과 즉시 적용.
- ★ workspace test 통합 (`npm test --workspaces --if-present`) → spectral passthrough script 으로 11 도구 단일 실행 가능 입증.
