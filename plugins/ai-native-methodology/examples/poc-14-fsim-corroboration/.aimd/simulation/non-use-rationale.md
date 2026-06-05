# Non-use Rationale — poc-14-fsim-corroboration (종결 2026-05-18T16:35)

> 시뮬레이션 종결 후 최종 분류. 미 fire element 가 본 PoC 한정인지 / 본 시뮬레이션 본질 한계인지 / 일반적 non-use 인지 명시.

## Category 분류

| category                    | 정의                                                   | element 수                                                      |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| **stack-signal-absent**     | 본 PoC 의 stack 에 해당 lib/framework 부재             | 5                                                               |
| **scenario-mismatch**       | 시나리오 종류 외 (예: JSP / FE e2e / characterization) | 4                                                               |
| **track-mismatch**          | FE/BE/DB 트랙 불일치 (본 PoC = BE-only)                | 6                                                               |
| **placeholder**             | v4.0 placeholder (skill 부재)                          | 1 (design-agent)                                                |
| **optional**                | 선택적 invoke (critique / research / aggregator)       | 4                                                               |
| **scope-out**               | 본 PoC 의도된 scope-out                                | 0 (모든 의도된 결함 = AC 매핑 또는 excluded_antipatterns carry) |
| **simulation-limit**        | 시뮬레이션 본질 한계 (real Claude Code session 외)     | 9 (모든 agent + 모든 hook)                                      |
| **phase-simplified**        | 본 시뮬레이션이 phase 일부 simplified                  | 4 (formal-spec/characterization/sql-inventory/api-rule-mapping) |
| **plugin-self-change-only** | plugin 자체 변경 시만 invoke (외부 PoC 적용 시 무관)   | 2 (drift-validator / skill-citation-validator)                  |
| **environment-blocked**     | 진짜 도구 환경 부재 (no-simulation carry)              | 1 (static-security)                                             |

## 미 fire skill 16종 분류

| skill                           | category                          | rationale                                                                 | reproduce_condition                                              |
| ------------------------------- | --------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| analysis-from-figma             | stack-signal-absent               | Figma URL 입력 ❌                                                         | Figma 데스크톱 + frame URL 제공 시 fire                          |
| analysis-aspect-i18n            | stack-signal-absent               | i18next/react-intl/vue-i18n 부재                                          | i18n lib 시 자동 fire                                            |
| analysis-aspect-legacy          | stack-signal-absent               | Strangler 부재 (greenfield small)                                         | deprecated API + old/new codepath 시 fire                        |
| analysis-html-template          | scenario-mismatch                 | Scenario C JSP/Thymeleaf 한정                                             | JSP/Thymeleaf/EJS/ERB 신호 시 fire                               |
| analysis-type-spec-fe           | track-mismatch                    | BE-only / TypeScript 부재                                                 | .tsx/.ts + tsconfig.json 시 fire                                 |
| analysis-ui-state-map-fe        | track-mismatch                    | FE state lib 부재                                                         | Zustand/Redux/Pinia 시 fire                                      |
| analysis-ui-visual-manifest-fe  | track-mismatch                    | design token / Tailwind 부재                                              | DTCG/Tailwind config 시 fire                                     |
| analysis-aspect-a11y            | track-mismatch                    | FE UI 부재 (BE-only)                                                      | React/Vue + axe-core target 시 fire                              |
| analysis-form-validation-fe     | track-mismatch                    | Pydantic BE schema validation 인데 skill description "FE-only" → cover ❌ | (F-SIM-14 finding 후보) Zod/Yup/Joi/react-hook-form 신호 시 fire |
| analysis-formal-spec-validation | phase-simplified                  | formal-spec phase 본 PoC simplified                                       | sub-plan-2 formal-spec 본격 수행 시 fire                         |
| analysis-characterization-test  | phase-simplified                  | characterization phase 본 PoC scope-out (sample scale)                    | Michael Feathers characterization 시도 시 fire                   |
| analysis-sql-inventory          | phase-simplified                  | characterization phase carry / 본 PoC simplified                          | RDB + characterization 도달 시 fire                              |
| analysis-api-rule-mapping       | phase-simplified                  | formal-spec phase carry                                                   | formal-spec-validation 후 자동                                   |
| test-playwright                 | scenario-mismatch                 | FE e2e scope 부재                                                         | Playwright spec 시 fire                                          |
| implement-react                 | track-mismatch                    | React 부재 (BE-only)                                                      | React 19 component impl 시 fire                                  |
| implement-vue                   | track-mismatch                    | Vue 부재                                                                  | .vue 파일 impl 시 fire                                           |
| \_base-apply-baseline-ratchet   | stack-signal-absent (legacy 아님) | small new sample / defect history ❌                                      | legacy + defect baseline 시 fire                                 |

## 미 dispatch agent 9종 (전부)

**시뮬레이션 본질 한계 (F-SIM-13 finding 후보)**: main agent 가 직접 skill 수행 / Task tool 별도 dispatch ❌.

| agent                           | category         | rationale                                                |
| ------------------------------- | ---------------- | -------------------------------------------------------- |
| analysis-agent                  | simulation-limit | main 자체 수행 (Task tool 미호출)                        |
| planning-agent                  | simulation-limit | 동상                                                     |
| spec-agent                      | simulation-limit | 동상                                                     |
| test-agent                      | simulation-limit | 동상                                                     |
| implement-agent                 | simulation-limit | 동상                                                     |
| design-agent                    | placeholder      | v4.0 placeholder / skill 0종 / 실 dispatch 무의미        |
| \_base-senior-engineer          | optional         | 본 시뮬레이션 단독 dogfood / Senior critique 선택 invoke |
| \_base-industry-case-researcher | optional         | internal element coverage / external case 불필요         |
| \_base-official-docs-checker    | optional         | 시뮬레이션 내부 / 외부 docs 검증 불요                    |

## 미 fire hook 3종 (전부)

**시뮬레이션 본질 한계 (F-SIM-13)**: Claude Code session 외 → hook trigger 0.

| event            | rationale                                                     | reproduce_condition                                             |
| ---------------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| SessionStart     | no real Claude Code session                                   | plugin install 후 Claude Code 시작 시 fire                      |
| UserPromptSubmit | manual / hook bypass                                          | 사용자가 Claude Code 안에서 자연어 입력 시 fire (regex matcher) |
| PreToolUse       | chain-driver state.blocked=false / no Write/Edit deny trigger | state.blocked=true 상태에서 Write/Edit 시 deny                  |

## 미 invoke tool 10종

| tool                                | category                | rationale                                                                                                         |
| ----------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| test-impl-pass-validator            | ()                      | wrapper 미사용 / 직접 pytest 호출 — wrapper 의 framework adapter (pytest adapter 존재?) 미검증. F-SIM-005 P1 연계 |
| decision-table-validator            | ()                      | 본 PoC BR 의 decision table 부재 / simple validation rules / DMN 미사용                                           |
| static-runner                       | environment-blocked     | Semgrep python wrapper deprecated / WSL2 또는 Docker 필요                                                         |
| spectral-runner                     | scope-out               | swagger lint 본 PoC scope-out                                                                                     |
| sql-inventory-extractor             | phase-simplified        | characterization phase scope-out                                                                                  |
| drift-validator                     | plugin-self-change-only | 본 PoC = plugin 자체 변경 ❌ / 외부 PoC 적용만 → drift 무관                                                       |
| formal-spec-link-validator          | phase-simplified        | formal-spec phase scope-out                                                                                       |
| characterization-coverage-validator | phase-simplified        | characterization phase scope-out                                                                                  |
| findings-aggregator                 | optional                | 5 finding 후보만 / aggregator 호출 P2                                                                             |
| skill-citation-validator            | plugin-self-change-only | plugin 자체 변경 ❌ → 인용 정합 검사 무관                                                                         |

## 메타 분석 — element coverage threshold (plan §5)

| 측정 axis       | 결과        | 목표 | 통과?                                                                 |
| --------------- | ----------- | ---- | --------------------------------------------------------------------- |
| skills fire     | 31/47 (66%) | ≥ 30 | ✓                                                                     |
| agents dispatch | 0/9         | ≥ 5  | ✗ (시뮬레이션 본질 한계 / F-SIM-13)                                   |
| tools invoke    | 7/17 (41%)  | ≥ 12 | ✗ (본 시나리오 한정 / phase-simplified + plugin-self-change-only 8종) |
| hooks fire      | 0/3         | ≥ 3  | ✗ (시뮬레이션 본질 한계 / F-SIM-13)                                   |

→ **element coverage threshold 통과 ❌** (4 axis 중 1만 통과). honest 표면화 — 본 시뮬레이션의 dogfood 강도는 **skill coverage** 만 가시화. agent/hook 은 본 type 시뮬레이션 (main agent self-run) 으로 측정 불가 → **real Claude Code session install** 시뮬레이션 필요.

## 시뮬레이션 본질 한계 결론 (F-SIM-13 finding 본문)

**Type 1 시뮬레이션** (main agent self-run / 본 PoC 채택) = skill coverage ✓ / agent/hook coverage ✗
**Type 2 시뮬레이션** (real Claude Code session install + 외부 사용자 실 invocation) = 4 axis 모두 측정 가능 / 시간 비용 ↑

→ 본 PoC = Type 1 dogfood / Type 2 는 별도 session 결단 의무. v8.4.0 시점 plugin 의 element 사용성 evidence 는 Type 1 한정.

## 시뮬레이션 발견 5 신규 finding 후보 (F-SIM-12~16)

| #        | severity | claim                                                                                                   | proposed_fix                                                                                                            |
| -------- | -------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| F-SIM-12 | medium   | `severity_distinct_count` = 1 (모든 AC must → cell critical) — F-SIM-002 propagation 가시화 ❌          | AC severity 다양화 권장 + STOP-3 #15 threshold 완화 (severity_distinct ≥ 1 or BR/AP severity propagation evidence 명시) |
| F-SIM-13 | medium   | hook events + agent dispatch 시뮬레이션 시 fire 0 — Type 1 한계                                         | Type 2 시뮬레이션 (real Claude Code session) cadence 명시 / element coverage threshold 분리                             |
| F-SIM-14 | low      | `analysis-form-validation-fe` description "FE-specific" — Pydantic 같은 BE schema validation lib 미포함 | description 수정 (FE+BE / Pydantic+Zod 모두 cover) + 신규 SKILL.md 가능                                                 |
| F-SIM-15 | high     | `test-spec.test_run_evidence.fail_mode` schema 미허용 (F-SIM-005 P0 ledger 명세만 / P1 carry)           | schema enum 추가 (`assertion / compile_import / dry_run_placeholder`) + report_format `pytest_text` 추가 검토           |
| F-SIM-16 | low      | `static-runner` Semgrep wrapper deprecated / Windows MSYS2 환경 fire ❌                                 | tools/static-runner README 에 환경 매트릭스 (Windows native / WSL2 / Docker) 명시 + carry contract                      |

각 finding 의 정식 등재는 STOP-3 9-gate 통과 후 v8.4.0 release 시 finding-system.md 추가 검토.
