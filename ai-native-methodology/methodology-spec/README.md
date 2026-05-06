# methodology-spec/ — Single Source of Truth (★ 명세 본체)

본 디렉토리 = AI-Native 방법론의 **사양 SSOT**. workflow + deliverables + cross-cutting 명세. plugin user 가 phase / 산출물 / schema 어디 있는지 도달할 단일 진입점.

## 디렉토리 구성

| 영역 | 파일 | 역할 |
|---|---|---|
| **`workflow/`** (11) | `phase-0-input.md` ~ `phase-6-quality.md` + 4.5 + 5-2 분기 | analysis stage 의 phase 명세 (★ chain 1 진입 전 단계) |
| **`deliverables/`** (22) | `1-architecture.md` ~ `7-ui-ux.md` + 8~22 | 7대 산출물 + chain v2 산출물 6 + FE 8 명세 |
| **cross-cutting** | `glossary-ko.md` / `id-conventions.md` / `finding-system.md` / `lifecycle-contract.md` / `skills-axis.md` / `be-fe-separation.md` / `migration-cautions-fe.md` | 횡단 정책 |

## phase × deliverable × schema 매트릭스 (★ 도달 path)

### Analysis stage (chain 1 진입 전 / v1.x 자산)

| phase | workflow | deliverable | schema |
|---|---|---|---|
| 0 | [`workflow/phase-0-input.md`](./workflow/phase-0-input.md) | (입력 정리) | — |
| 1 (init) | [`workflow/phase-1-init.md`](./workflow/phase-1-init.md) | inventory | `inventory.schema.json` |
| 2 (db) | [`workflow/phase-2-db.md`](./workflow/phase-2-db.md) | [`4-db-schema`](./deliverables/4-db-schema.md) | `db-schema.schema.json` |
| 3 (arch) | [`workflow/phase-3-arch.md`](./workflow/phase-3-arch.md) | [`1-architecture`](./deliverables/1-architecture.md) | `architecture.schema.json` |
| 4 (business-logic) | [`workflow/phase-4-business-logic.md`](./workflow/phase-4-business-logic.md) | [`2-domain`](./deliverables/2-domain.md) + [`5-business-rules`](./deliverables/5-business-rules.md) | `domain.schema.json` + `rules.schema.json` |
| 4.5 (formal-spec) | [`workflow/phase-4-5-formal-spec.md`](./workflow/phase-4-5-formal-spec.md) | [`4-5-formal-spec`](./deliverables/4-5-formal-spec.md) | `formal-spec.schema.json` |
| 5-1 (api) | [`workflow/phase-5-1-api.md`](./workflow/phase-5-1-api.md) | [`3-api`](./deliverables/3-api.md) | `openapi-extension.schema.json` |
| 5-2-a (ui-base) | [`workflow/phase-5-2-a-ui-base.md`](./workflow/phase-5-2-a-ui-base.md) | [`7-ui-ux`](./deliverables/7-ui-ux.md) + [`9-visual-manifest`](./deliverables/9-visual-manifest.md) | `ui-spec.schema.json` + `visual-manifest.schema.json` |
| 5-2-b (state) | [`workflow/phase-5-2-b-state.md`](./workflow/phase-5-2-b-state.md) | [`8-state-map`](./deliverables/8-state-map.md) + [`14-form-validation-spec`](./deliverables/14-form-validation-spec.md) | `state-map.schema.json` + `form-validation-spec.schema.json` |
| 5-2-c (visual) | [`workflow/phase-5-2-c-visual.md`](./workflow/phase-5-2-c-visual.md) | [`15-type-spec`](./deliverables/15-type-spec.md) | `type-spec.schema.json` |
| 6 (quality) | [`workflow/phase-6-quality.md`](./workflow/phase-6-quality.md) | [`6-antipatterns`](./deliverables/6-antipatterns.md) | `antipatterns.schema.json` |
| 5-error-mapping (★ v1.5) | (skill `phase-5-error-mapping`) | [`16-error-mapping-spec`](./deliverables/16-error-mapping-spec.md) | `error-mapping-spec.schema.json` |

### Cross-cutting (FE 8 / aspect)

| 영역 | deliverable | schema |
|---|---|---|
| a11y | [`10-a11y-spec`](./deliverables/10-a11y-spec.md) | `a11y-spec.schema.json` |
| i18n | [`11-i18n-spec`](./deliverables/11-i18n-spec.md) | `i18n-spec.schema.json` |
| static-security | [`12-static-security-spec`](./deliverables/12-static-security-spec.md) | `static-security-spec.schema.json` |
| legacy-spectrum | [`13-legacy-spectrum`](./deliverables/13-legacy-spectrum.md) | `legacy-spectrum.schema.json` |

### Chain harness v2.0 (★ ★ ★ chain 1~4 + cross)

| chain | deliverable | schema | gate validator |
|---|---|---|---|
| 1 (planning) | [`17-planning-spec`](./deliverables/17-planning-spec.md) | `planning-spec.schema.json` | `planning-extraction-validator` |
| 2 (spec) | [`18-behavior-spec`](./deliverables/18-behavior-spec.md) + [`19-acceptance-criteria`](./deliverables/19-acceptance-criteria.md) | `behavior-spec.schema.json` + `acceptance-criteria.schema.json` | `chain-coverage-validator` |
| 3 (test) | [`20-test-spec`](./deliverables/20-test-spec.md) | `test-spec.schema.json` | `spec-test-link-validator` |
| 4 (impl) | [`21-impl-spec`](./deliverables/21-impl-spec.md) | `impl-spec.schema.json` | `test-impl-pass-validator` |
| cross (release) | [`22-traceability-matrix`](./deliverables/22-traceability-matrix.md) | `traceability-matrix.schema.json` | `traceability-matrix-builder` |

### chain-driver state 영속

| 자산 | schema |
|---|---|
| `.aimd/state.json` (chain harness state) | `state.schema.json` |
| `.aimd/intervention-log.jsonl` (사용자 결단 로그) | `intervention-log.schema.json` |
| 도구 호출 명세 | `test-cmd.schema.json` |

## Cross-cutting 정책 (횡단 적용)

| 파일 | 역할 | 적용 |
|---|---|---|
| [`glossary-ko.md`](./glossary-ko.md) | 한국어 용어 사전 | ADR-005 |
| [`id-conventions.md`](./id-conventions.md) | UC-* / BHV-* / AC-* / TC-* / IMPL-* / F-* ID 컨벤션 | 모든 산출물 |
| [`finding-system.md`](./finding-system.md) | finding 등록·분류·처리 체계 | Phase 4.5+ |
| [`lifecycle-contract.md`](./lifecycle-contract.md) | SDLC stage 간 data contract | chain 1~4 |
| [`skills-axis.md`](./skills-axis.md) | phase ID ↔ skills 디렉토리 axis 분리 정책 | drift-validator `--check-chain-layout` |
| [`be-fe-separation.md`](./be-fe-separation.md) | BE/FE 분리 default + 예외 (ADR-FE-004) | Scenario A/B/C detection |
| [`migration-cautions-fe.md`](./migration-cautions-fe.md) | FE 트랙 마이그레이션 회피 가이드 | FE PoC #04 정합 |

## 사용 위치 (참조)

- [`../README.md`](../README.md) — plugin user 진입점 (시나리오 A/B/C)
- [`../CLAUDE.md`](../CLAUDE.md) — 사내 적용 정책 23 inline
- [`../skills/`](../skills/) — 각 SKILL.md 가 본 명세를 frontmatter 또는 본문으로 reference
- [`../flows/sdlc-4stage-flow.json`](../flows/sdlc-4stage-flow.json) — chain harness master SSOT
- [`../tools/README.md`](../tools/README.md) — 12 도구 cadence (각 도구가 어떤 deliverable / schema 를 검증하는지)
