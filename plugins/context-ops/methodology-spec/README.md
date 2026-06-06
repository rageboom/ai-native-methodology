# methodology-spec/ — Single Source of Truth (명세 본체)

본 디렉토리 = AI-Native 방법론의 **사양 SSOT**. workflow + deliverables + cross-cutting 명세. plugin user 가 phase / 산출물 / schema 어디 있는지 도달할 단일 진입점.

## 디렉토리 구성

| 영역                     | 파일                                                                                                                                                                                              | 역할                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **`workflow/`** (11)     | `input.md` · `discovery.md` · `db-schema.md` · `architecture.md` · `business-logic.md` · `formal-spec.md` · `characterization.md` · `sql-inventory.md` · `api.md` · `ui.md` (stub) · `quality.md` | analysis stage 의 phase 명세 (chain 1 진입 전 단계)                   |
| **`deliverables/`** (25) | `1-architecture.md` ~ `24-sql-inventory.md` (4-5 formal-spec 포함)                                                                                                                                | BE 7대 (1~7) + FE 8 (8~16) + chain 6 (17~22) + 추가 2 (23~24)         |
| **`sub-rules/`** (2)     | `absent-br-gwt-nl-paradigm.md` · `spring41-ibatis2-isomorphic.md`                                                                                                                                 | 특정 paradigm 한정 sub-rule                                           |
| **cross-cutting** (8)    | `glossary-ko.md` / `id-conventions.md` / `finding-system.md` / `lifecycle-contract.md` / `skills-axis.md` / `agents-axis.md` / `be-fe-separation.md` / `migration-cautions-fe.md`                 | 횡단 정책                                                             |

## phase × deliverable × schema 매트릭스 (도달 path)

### Analysis stage (chain 1 진입 전 / v1.x 자산)

| phase                       | workflow                                                         | deliverable                                                                                                             | schema                                                       |
| --------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 0                           | [`workflow/input.md`](./workflow/input.md)                       | (입력 정리)                                                                                                             | —                                                            |
| 1 (init)                    | [`workflow/discovery.md`](./workflow/discovery.md)               | inventory                                                                                                               | `inventory.schema.json`                                      |
| 2 (db)                      | [`workflow/db-schema.md`](./workflow/db-schema.md)               | [`4-db-schema`](./deliverables/4-db-schema.md)                                                                          | `db-schema.schema.json`                                      |
| 3 (arch)                    | [`workflow/architecture.md`](./workflow/architecture.md)         | [`1-architecture`](./deliverables/1-architecture.md)                                                                    | `architecture.schema.json`                                   |
| 4 (business-logic)          | [`workflow/business-logic.md`](./workflow/business-logic.md)     | [`2-domain`](./deliverables/2-domain.md) + [`5-business-rules`](./deliverables/5-business-rules.md)                     | `domain.schema.json` + `business-rules.schema.json`          |
| 4.5 (formal-spec)           | [`workflow/formal-spec.md`](./workflow/formal-spec.md)           | [`4-5-formal-spec`](./deliverables/4-5-formal-spec.md)                                                                  | `formal-spec.schema.json`                                    |
| 4.7 (characterization)      | [`workflow/characterization.md`](./workflow/characterization.md) | [`23-characterization-spec`](./deliverables/23-characterization-spec.md)                                                | `characterization-spec.schema.json`                          |
| 4.8 (sql-inventory)         | [`workflow/sql-inventory.md`](./workflow/sql-inventory.md)       | [`24-sql-inventory`](./deliverables/24-sql-inventory.md)                                                                | `sql-inventory.schema.json`                                  |
| 5-1 (api)                   | [`workflow/api.md`](./workflow/api.md)                           | [`3-api`](./deliverables/3-api.md)                                                                                      | `openapi-extension.schema.json`                              |
| 5-2-a (ui-base)             | [`workflow/ui.md`](./workflow/ui.md) stub                        | [`7-ui-ux`](./deliverables/7-ui-ux.md) + [`9-visual-manifest`](./deliverables/9-visual-manifest.md)                     | `ui-spec.schema.json` + `visual-manifest.schema.json`        |
| 5-2-b (state)               | [`workflow/ui.md`](./workflow/ui.md) stub                        | [`8-state-map`](./deliverables/8-state-map.md) + [`14-form-validation-spec`](./deliverables/14-form-validation-spec.md) | `state-map.schema.json` + `form-validation-spec.schema.json` |
| 5-2-c (visual)              | [`workflow/ui.md`](./workflow/ui.md) stub                        | [`15-type-spec`](./deliverables/15-type-spec.md)                                                                        | `type-spec.schema.json`                                      |
| 6 (quality)                 | [`workflow/quality.md`](./workflow/quality.md)                   | [`6-antipatterns`](./deliverables/6-antipatterns.md)                                                                    | `antipatterns.schema.json`                                   |
| 5-error-mapping             | (skill `analysis-error-mapping`)                                 | [`16-error-mapping-spec`](./deliverables/16-error-mapping-spec.md)                                                      | `error-mapping-spec.schema.json`                             |

### Cross-cutting (FE 8 / aspect)

| 영역            | deliverable                                                            | schema                             |
| --------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| a11y            | [`10-a11y-spec`](./deliverables/10-a11y-spec.md)                       | `a11y-spec.schema.json`            |
| i18n            | [`11-i18n-spec`](./deliverables/11-i18n-spec.md)                       | `i18n-spec.schema.json`            |
| static-security | [`12-static-security-spec`](./deliverables/12-static-security-spec.md) | `static-security-spec.schema.json` |
| legacy-spectrum | [`13-legacy-spectrum`](./deliverables/13-legacy-spectrum.md)           | `legacy-spectrum.schema.json`      |

### Chain harness v2.0 (chain 1~4 + cross)

| chain           | deliverable                                                                                                                     | schema                                                          | gate validator                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------- |
| 1 (discovery)   | [`17-discovery-spec`](./deliverables/17-discovery-spec.md)                                                                      | `discovery-spec.schema.json`                                    | `discovery-extraction-validator` |
| 2 (spec)        | [`18-behavior-spec`](./deliverables/18-behavior-spec.md) + [`19-acceptance-criteria`](./deliverables/19-acceptance-criteria.md) | `behavior-spec.schema.json` + `acceptance-criteria.schema.json` | `chain-coverage-validator`       |
| 3 (test)        | [`20-test-spec`](./deliverables/20-test-spec.md)                                                                                | `test-spec.schema.json`                                         | `spec-test-link-validator`       |
| 4 (impl)        | [`21-impl-spec`](./deliverables/21-impl-spec.md)                                                                                | `impl-spec.schema.json`                                         | `test-impl-pass-validator`       |
| cross (release) | [`22-traceability-matrix`](./deliverables/22-traceability-matrix.md)                                                            | `traceability-matrix.schema.json`                               | `traceability-matrix-builder`    |

### chain-driver state 영속

| 자산                                              | schema                         |
| ------------------------------------------------- | ------------------------------ |
| `.aimd/state.json` (chain harness state)          | `state.schema.json`            |
| `.aimd/intervention-log.jsonl` (사용자 결단 로그) | `intervention-log.schema.json` |
| 도구 호출 명세                                    | `test-cmd.schema.json`         |

### 공통 메타+유틸 (모든 산출물 횡단)

| 자산         | schema                        | 적용 영역                                                   |
| ------------ | ----------------------------- | ----------------------------------------------------------- |
| 신뢰도 메타  | `meta-confidence.schema.json` | 모든 산출물 (생성 시각 / 신뢰도 0.0~0.98 / 출처 / cap 0.98) |
| finding 체계 | `finding-system.schema.json`  | 모든 phase / chain stage (등록·분류·처리)                   |

## Cross-cutting 정책 (횡단 적용)

| 파일                                                     | 역할                                                   | 적용                                   |
| -------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| [`glossary-ko.md`](./glossary-ko.md)                     | 한국어 용어 사전                                       | 모든 산출물                            |
| [`id-conventions.md`](./id-conventions.md)               | UC-_ / BHV-_ / AC-_ / TC-_ / IMPL-_ / F-_ ID 컨벤션    | 모든 산출물                            |
| [`finding-system.md`](./finding-system.md)               | finding 등록·분류·처리 체계                            | `formal-spec` phase 이후               |
| [`lifecycle-contract.md`](./lifecycle-contract.md)       | SDLC stage 간 data contract                            | chain 1~4                              |
| [`skills-axis.md`](./skills-axis.md)                     | phase ID ↔ skills 디렉토리 axis 분리 정책              | drift-validator `--check-chain-layout` |
| [`agents-axis.md`](./agents-axis.md)                     | agent 1-depth + sub-agent invocation paradigm          | `_base-*.md` 3종                       |
| [`be-fe-separation.md`](./be-fe-separation.md)           | BE/FE 분리 default + 예외                              | Scenario A/B/C detection               |
| [`migration-cautions-fe.md`](./migration-cautions-fe.md) | FE 트랙 마이그레이션 회피 가이드                       | FE 트랙                                |

## 사용 위치 (참조)

- [`../README.md`](../README.md) — plugin user 진입점 (시나리오 A/B/C)
- [`../CLAUDE.md`](../CLAUDE.md) — 사내 적용 정책 23 inline
- [`../skills/`](../skills/) — 각 SKILL.md 가 본 명세를 frontmatter 또는 본문으로 reference
- [`../flows/sdlc-4stage-flow.json`](../flows/sdlc-4stage-flow.json) — chain harness master SSOT
- [`../tools/README.md`](../tools/README.md) — 12 도구 cadence (각 도구가 어떤 deliverable / schema 를 검증하는지)

## 인용

- ADR: ADR-005 (glossary 한국어 용어 사전 근거)
- be-fe-separation.md 예외 근거: ADR-FE-004
