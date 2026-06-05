# Skills Axis — phase ID 와 skills 디렉토리 axis 분리 정책

> **SSOT**: `flows/analysis.phase-flow.json`
> **검증 도구**: `tools/drift-validator/` (3-way: manifest ↔ workflow ↔ skills)

## 1. 배경 — 두 개의 axis

본 plugin 에는 phase 를 가리키는 **두 개의 다른 axis** 가 공존한다. FE 트랙 진입 시 axis 가 분화되어 본 명세로 drift 위험을 차단한다.

| Axis                  | 용도                                       | 예                                                                               |
| --------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| **manifest phase ID** | 분석 진행 단위 / phase 간 의존 그래프 노드 | `0`, `1`, `2`, `3`, `4`, `4.5`, `5-1`, `5-2`, `6`                                |
| **skills 디렉토리**   | 산출물 단위 / 자연어 trigger 의 매칭 단위  | `analysis-architecture/`, `analysis-db-schema-erd/`, `analysis-ui-state-map-fe/` |

두 axis 의 phase 번호가 **같은 숫자라도 다른 phase 를 가리킬 수 있다** (의미 ID 자산화로 본 paradigm 자연 해소). 예: skills 의 `analysis-architecture/` 는 manifest 의 phase `3` (arch) 의 skill 이고, manifest 의 phase `2` (db) 의 skill 은 `analysis-db-schema-erd/` 다.

## 2. 정책

### 2.1 manifest phase ID = SSOT

`flows/analysis.phase-flow.json` 의 `phases[].id` 가 phase 의 **단일 진실**. 모든 phase 의존 그래프 / spec_file 매핑 / skills 매핑은 본 manifest 에 정의된다.

- workflow 의 `methodology-spec/workflow/phase-{id}-*.md` 파일명은 manifest phase ID 와 1:1 정합 의무.
- 그 외 모든 자산 (deliverables / schemas / templates / examples PoC) 의 phase 인용은 **manifest phase ID** 를 사용.

### 2.2 skills 디렉토리 = 의미 ID + category prefix (1-depth)

`skills/<category>-<semantic-slug>/SKILL.md` 형식 (1-depth + 의미 ID paradigm). 디렉토리명은 **산출물 의미를 직접 표현하는 라벨**이며 manifest phase ID 와 일치할 의무 ❌.

이유: skill 은 산출물 단위로 발동하고 (자연어 trigger → 1 skill = 1 산출물), 산출물 의미 (architecture / domain-model / business-rules 등) 와 manifest phase ID 는 본질적으로 다른 axis. 예:

- 산출물 architecture 는 manifest phase `3` (arch) 에서 산출된다 → skills `analysis-architecture/`.
- 산출물 schema 는 manifest phase `2` (db) 에서 산출된다 → skills `analysis-db-schema-erd/`.

skill 디렉토리명은 **사용자가 산출물 의미로 기억하기 좋은 라벨**일 뿐, manifest 와의 정합은 매핑 필드 (§2.3) 를 통해 강제한다. 본 paradigm 의 진화 이력 = §6 (phase-N 숫자 prefix 과도기) + §7 (1-depth + category prefix) + §8 (의미 ID rename) 참조.

### 2.3 매핑 = manifest 의 `phases[].skills` 배열

각 manifest phase 는 `skills` 배열 필드를 가진다. 본 phase 에서 발동되는 skill 들의 디렉토리명을 명시한다.

```json
{
	"id": "3",
	"name": "arch",
	"skills": ["analysis-architecture"]
}
```

aspect skill 4종 (`analysis-aspect-a11y` / `analysis-aspect-i18n` / `analysis-aspect-static-security` / `analysis-aspect-legacy`) 은 `cross_cutting.aspects.skills` 에 분리.

### 2.4 drift-validator 3-way 검증 의무

`tools/drift-validator/` 가 commit 시점에 다음을 검증:

1. **manifest ↔ workflow**: `phases[].spec_file` 가 가리키는 파일이 `methodology-spec/workflow/` 안에 존재.
2. **manifest ↔ skills**: `phases[].skills[]` + `cross_cutting.aspects.skills[]` + `cross_cutting.base.skills[]` 의 모든 skill 디렉토리가 `skills/` 안에 1-depth 로 존재 + `SKILL.md` 보유.
3. **skills ↔ manifest 역방향**: `skills/` 안의 모든 `analysis-*` skill 이 manifest 의 어느 phase (또는 cross_cutting.aspects / cross_cutting.base) 에 등록됨. **고아 skill 0 의무**.

3건 중 1건이라도 깨지면 CI fail. CI workflow = `.github/workflows/drift-check.yml`.

## 3. 신규 skill 추가 절차

```
1. skills/<category>-<semantic-slug>/SKILL.md 신설 (1-depth + category prefix)
   - frontmatter: name (디렉토리명과 동일) / description / allowed-tools
   - 디렉토리명 = 의미 ID (예 analysis-formal-spec-validation / analysis-characterization-test). phase-N 숫자 prefix 사용 ❌ (§8).
   - category prefix = _base / analysis / discovery / spec / plan / test / implement (§7.2)

2. flows/analysis.phase-flow.json 갱신
   - 본 skill 이 발동되는 manifest phase 의 skills 배열에 디렉토리명 추가
   - cross-cutting aspect 면 cross_cutting.aspects.skills 에 추가
   - cross-cutting base (_base-*) 면 cross_cutting.base.skills 에 추가

3. drift-validator 통과 확인 (npm test in tools/drift-validator/)

4. CHANGELOG.md 신설 entry — skill 명 + 매핑 phase ID 명시
```

## 4. 신규 phase ID 추가 절차 (MAJOR change)

신규 manifest phase ID 추가 = phase 의존 그래프 변경 = **본체 구조 변경**. 사용자 명시 결단 + ≥2 PoC corroboration 의무.

chain 단계 SDLC harness 구성:

- 6 schema (discovery-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / traceability-matrix)
- chain stage axis — `flows/sdlc-4stage-flow.json` (stages + revisit_edges + sub_flow 통합)
- chain stage 별 manifest phase-flow — `flows/{planning,spec,test,implement}.phase-flow.json`
- skills 디렉토리 chain stage axis — `skills/{planning,spec,test,implement}-<name>/` 1-depth + category prefix

`analysis.phase-flow.json` 의 9 phase = 그대로 보존 / sdlc-4stage-flow.json 의 stages[analysis].sub_flow 로 흡수.

### chain stage axis

| chain     | stage                       | flow file                             | skills 디렉토리                                                                                                                                      | 산출물                                                                                           |
| --------- | --------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 0 (input) | (analysis stage 의 phase 0) | analysis.phase-flow.json              | skills/analysis-input-collection/ + `analysis-input-orchestrate` + `analysis-from-{prompt,swagger,plan-doc,figma}` (5)                              | inventory + tree + input-summary.json (cross-ref + conflict)                                     |
| 1         | discovery                   | discovery.phase-flow.json             | skills/discovery-\*/ (6 / discovery-from-{analysis-output,swagger,figma,nl-md} + discovery-decompose-use-cases + discovery-identify-business-intent) | discovery-spec                                                                                   |
| 1 sub     | analysis                    | analysis.phase-flow.json              | skills/analysis-\*/ (28 / aspect 4 + br-cross 1 + `analysis-html-template` 포함)                                                                    | 7대 + 8 FE 산출물 + input-summary.json + html-template-extract.json (Scenario C)                |
| 2         | spec                        | spec.phase-flow.json                  | skills/spec-\*/ (3 / spec-compose-behavior-spec 등)                                                                                                  | behavior-spec / acceptance-criteria                                                              |
| 3         | plan                        | plan.phase-flow.json                  | skills/plan-\*/ (3 / plan-decompose-and-sequence 등)                                                                                                 | task-plan (gate #3)                                                                              |
| 4         | test                        | test.phase-flow.json                  | skills/test-\*/ (4 / test-generate-test-spec + `test-playwright`)                                                                                    | test-spec + 실 test 코드 (RED)                                                                   |
| 5         | implement                   | implement.phase-flow.json             | skills/implement-\*/ (4 / implement-generate-impl-spec + implement-verify-test-pass + `implement-react` + `implement-vue`)                          | impl-spec + 실 impl 코드 (GREEN)                                                                 |
| cross     | traceability                | (sdlc-4stage-flow.json cross_cutting) | skills/\_base-build-traceability-matrix/                                                                                                             | traceability-matrix                                                                              |

## 5. 매핑 현황

| Manifest phase ID                      | spec_file                           | skills (디렉토리명)                                                                                                                                                                                         |
| -------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0                                      | input.md                            | analysis-input-collection                                                                                                                                                                                   |
| 1                                      | discovery.md                        | analysis-source-inventory                                                                                                                                                                                   |
| 2 (db)                                 | db-schema.md                        | analysis-db-schema-erd                                                                                                                                                                                      |
| 3 (arch)                               | architecture.md                     | analysis-architecture                                                                                                                                                                                       |
| 4 (business-logic)                     | business-logic.md                   | analysis-domain-model, analysis-business-rules, analysis-form-validation-fe                                                                                                                                 |
| 4.5 (formal-spec)                      | formal-spec.md                      | analysis-formal-spec-validation                                                                                                                                                                             |
| 5-1 (api)                              | api.md                              | analysis-openapi, analysis-api-rule-mapping, **analysis-error-mapping**                                                                                                                                     |
| 5-2 (ui)                               | ui.md                               | analysis-ui-state-map-fe, analysis-ui-visual-manifest-fe, analysis-type-spec-fe                                                                                                                             |
| 6 (quality)                            | quality.md                          | analysis-quality-antipattern                                                                                                                                                                                |
| **cross-cutting (aspects)**            | (없음)                              | analysis-aspect-a11y, analysis-aspect-i18n, analysis-aspect-static-security, analysis-aspect-legacy                                                                                                         |
| **cross-cutting (base)**               | (없음 / cross-invocation 영역)      | \_base-apply-baseline-ratchet (analysis-input-collection `input` phase prerequisite), \_base-apply-template (template 적용 cross-invocation), \_base-log-finding (모든 skill finding 등재 cross-invocation) |

## 6. 본 정책의 진화 (phase-N 과도기 → 의미 ID 자산화)

- phase-N 과도기: 산출물 번호 axis 와 manifest phase ID 가 다른 의미체계라는 사실 자체가 **혼란을 가중**할 수 있다.
- 의미 ID 자연 흡수 — 17 skill 디렉토리 의미 ID rename. phase-N 숫자 prefix 폐기. alias map ❌ / 즉시 cutover. §8 절 참조.

## 7. category prefix 1-depth paradigm

### 7.1 paradigm 결단 사실

이전 skills 자산 = **2-depth** `skills/<category>/<name>/SKILL.md` (lifecycle stage organize 사상). 본 paradigm 이 **Claude Code plugin 표준 1-depth** (`skills/<name>/SKILL.md`) 과 충돌 → 사내 GHE install 후 skill 인식 ❌ critical 결함.

paradigm:

- **runtime axis** = `skills/<category>-<name>/SKILL.md` (1-depth + category prefix paradigm / Claude Code 표준 정합)
- **사상 axis** = 본 명세 §2~§5 lifecycle stage organize 사상 보존 (chain stage axis + 산출물 번호 axis + manifest phase ID axis 모두 사상 영역 보존)

본 paradigm 본질 = **사상 axis 와 runtime axis 의 sub-axis 영역 분리**. 이중 렌더링 사상 (사상 + 자산 분리) 의 plugin runtime 영역 확장.

### 7.2 category prefix 매핑

| 사상 카테고리 | runtime prefix | skill 개수                                                 | 예                                                                                                                                                                                                                 |
| ------------- | -------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| \_base        | `_base-`       | 5                                                          | `_base-apply-template`, `_base-build-traceability-matrix`, ...                                                                                                                                                     |
| analysis      | `analysis-`    | 28                                                         | `analysis-input-collection`, `analysis-input-orchestrate`, `analysis-from-prompt`, `analysis-from-swagger`, `analysis-from-plan-doc`, `analysis-from-figma`, `analysis-html-template`, `analysis-aspect-a11y`, ... |
| discovery     | `discovery-`   | 6                                                          | `discovery-from-analysis-output`, `discovery-from-swagger`, `discovery-from-figma`, `discovery-from-nl-md`, `discovery-decompose-use-cases`, `discovery-identify-business-intent`                                  |
| spec          | `spec-`        | 3                                                          | `spec-compose-behavior-spec`, ...                                                                                                                                                                                  |
| plan          | `plan-`        | 3                                                          | `plan-decompose-and-sequence`, `plan-architect-decisions`, `plan-risk-and-nfr`                                                                                                                                     |
| test          | `test-`        | 4                                                          | `test-generate-test-spec`, `test-playwright`, ...                                                                                                                                                                  |
| implement     | `implement-`   | 4                                                          | `implement-generate-impl-spec`, `implement-react`, `implement-vue`, ...                                                                                                                                            |
| design        | (placeholder)  | 0                                                          | —                                                                                                                                                                                                                  |
| (standalone)  | —              | 2                                                          | `dep-graph-navigator`, `ticket-sync`                                                                                                                                                                               |

총 **55 skill** (Claude Code plugin 표준 1-depth 호환 ✅).

### 7.3 frontmatter `name:` SSOT 정합

각 SKILL.md frontmatter `name:` 필드 = 디렉토리 이름과 일치 의무. Claude Code 의 [skills.md](https://code.claude.com/docs/en/skills.md) 공식: frontmatter `name:` 명시 시 그 값이 SSOT (디렉토리 이름 무시). 일관성 보존을 위해 모든 SKILL.md/agent frontmatter 가 prefix 이름과 정합.

### 7.4 skill auto-invocation = description 기반

본 paradigm 의 critical 사실 — Claude Code 의 skill **auto-invocation 은 frontmatter `description` + `when_to_use` 키워드 매칭 기반** ([공식 docs](https://code.claude.com/docs/en/skills.md)). 즉:

- 디렉토리 rename (1-depth) + description 보존 = auto-trigger 작동 ✅
- 명시 호출 (`/<skill-name>`) = 디렉토리 이름 기반 → category prefix 이름 (예 `/analysis-input-collection`) 사용

### 7.5 외부 참조 정밀 갱신

| 자산                                       | 갱신 영역                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `flows/*.json` (13)                        | `"skills": [...]` 배열 안 string                                                               |
| `flows/*.mermaid` (6)                      | diagram label                                                                                  |
| `tools/chain-driver/src/hooks-bridge.js`   | `skillId` nested path (`planning/extract-from-legacy`) → flat (`planning-extract-from-legacy`) |
| `methodology-spec/` (17 file)              | 명세 본문 안 skill name 인용                                                                   |
| `README.md` (시나리오 A 자연어 trigger 표) | 자연어 prompt → skill name 매핑 표                                                             |

negative lookbehind/lookahead + `.md` path 회피 정규식 / `spec_file` path 영역 보존 (methodology-spec/workflow/<phase-id>.md 영역 그대로 / 평탄화 무관). 본 정밀 갱신 paradigm 의 본질 = runtime skill 자산 path 갱신 ≠ phase spec file path (사상 axis 의 영역).

### 7.6 paradigm 한계

- skills/<category>-<name>/ 의 category prefix 가 사상 의미 + runtime axis 양쪽 표현 — 사용자 가독성 측면 OK / 단 신규 카테고리 추가 시 prefix 명명 paradigm 재정합 의무.
- 본 paradigm = **본 plugin 의 plugin lifecycle organize 사상 vs Claude Code runtime 호환성 dual axis 정합**. 향후 Claude Code plugin spec 진화 (예: components 필드 신설 또는 nested directory 지원) 시 본 paradigm 재검토 carry (C-poc-axis-design-vs-runtime-separation-paradigm).

## 8. 의미 ID 자산화

### 8.1 paradigm 결단 사실

이전 analysis stage skill 17 디렉토리 = `analysis-phase-N-{slug}/` (phase-N 숫자 prefix). 본 형식이 §1 두 axis 의 혼란 source — phase-N 숫자가 manifest phase ID 와 동일 의미 ❌ (skill 디렉토리 의 phase-N = 산출물 번호 그룹 라벨 만 / manifest phase ID = 의존 그래프 노드).

paradigm:

- **17 skill rename** — analysis-phase-N-{slug} → analysis-{semantic-slug}
- **alias map ❌** — 즉시 cutover / 옛 명시 호출 불가능 (`guides/common-errors.md` Q14.5 명시)
- **자연어 trigger 영역 보존** — description 본문 정합 보존 / auto-invocation 작동 ✅

### 8.2 rename 매핑 (17 → 17)

| 이전 (phase-N prefix)               | 현재 (의미 ID)                      | manifest phase                       |
| ----------------------------------- | ----------------------------------- | ------------------------------------ |
| analysis-input                      | **analysis-input-collection**       | `input`                              |
| analysis-phase-1-inventory          | **analysis-source-inventory**       | `discovery`                          |
| analysis-phase-2-architecture       | **analysis-architecture**           | `architecture`                       |
| analysis-phase-3-domain             | **analysis-domain-model**           | `business-logic` (§5.B domain)       |
| analysis-phase-4-rules              | **analysis-business-rules**         | `business-logic` (§5.A rules)        |
| analysis-phase-4-5-cross-validation | **analysis-formal-spec-validation** | `formal-spec`                        |
| analysis-characterization           | **analysis-characterization-test**  | `characterization`                   |
| analysis-sql-inventory              | **analysis-sql-inventory**          | `sql-inventory`                      |
| analysis-phase-5-error-mapping      | **analysis-error-mapping**          | `api`                                |
| analysis-phase-5-form-validation    | **analysis-form-validation-fe**     | `business-logic` (§5.D ui-domain)    |
| analysis-phase-5-openapi            | **analysis-openapi**                | `api`                                |
| analysis-phase-5-rules              | **analysis-api-rule-mapping**       | `api`                                |
| analysis-phase-5-schema-erd         | **analysis-db-schema-erd**          | `db-schema`                          |
| analysis-phase-5-state-map          | **analysis-ui-state-map-fe**        | `ui`                                 |
| analysis-phase-5-type-spec          | **analysis-type-spec-fe**           | `ui`                                 |
| analysis-phase-5-visual-manifest    | **analysis-ui-visual-manifest-fe**  | `ui`                                 |
| analysis-quality                    | **analysis-quality-antipattern**    | `quality`                            |

변경 ❌: aspect 4 (`analysis-aspect-a11y` / `analysis-aspect-i18n` / `analysis-aspect-static-security` / `analysis-aspect-legacy`) + `analysis-br-cross-consistency-check` (이미 의미 ID).

### 8.3 미세 조정 paradigm (Senior critique 4건 흡수)

- **FE suffix 일괄** — `ui-state-map-fe` / `ui-visual-manifest-fe` / `type-spec-fe` / `form-validation-fe` (4건). id-conventions `F-FE-*` finding ID 정합. paradigm 일관성.
- **`api-rule-binding` → `api-rule-mapping`** — Spring binding 혼동 회피 / 산업 표준 정합.
- **`characterization` → `characterization-test`** — Feathers WELC (Working Effectively with Legacy Code) 용어 정합.
- **`quality-finding` → `quality-antipattern`** — 산출물 정합 (antipatterns + avoid-list 주산출물).

### 8.4 영향 범위 (42 file)

skills/ 17 rename + 외부 인용 25 = 42 file. 본 §8 본문 + flows/analysis.phase-flow.json (1) + flows/README.md (1) + tools/spec-test-link-validator (src/validator.js + package.json) + methodology-spec 6 + root README + briefing 2 + guides 4 (common-errors.md Q14.5 section) + decisions 1 + tools/\*/README 8.

변경 ❌ 영역: `agents/*.md` (이미 의미 ID) / `flows/*.mermaid` (실측 인용 ❌) / `tools/chain-driver/src/*.js` (평탄화 완료) / `.github/workflows/drift-check.yml` (validator CI 호출 만).

### 8.5 paradigm 효과

- §1 두 axis 혼란 해소 — skill 디렉토리 = 의미 ID / manifest phase ID = 별도 axis (단 동일 숫자 충돌 ❌).
- 신규 사내 동료 onboarding 시점 인지 부담 ↓ — `/analysis-business-rules` 의미 명확 (vs `/analysis-phase-4-rules` phase-N 의미 추론 의무).
- alias map ❌ — install 시점 명시 호출 변경 / 자연어 trigger 영향 ❌ (description SSOT 사실 정합).

본 paradigm 의 위치 = §6 phase-N 과도기 패턴 자연 흡수 / §7 1-depth + category prefix runtime axis 위 의미 ID 본질 정합.

## 9. skill ↔ agent 매핑 (multi-agent paradigm)

### 9.1 paradigm 결단 사실

이전 agent 자산 = **3 base cross-cutting agent 만** (skill 내부 persona 임베드 / "stage 별 분리 ❌"). 사용자 명시 결단으로 본 paradigm retract → **stage 별 sub-agent 5종 + 3 base + spike 1종 병존**.

paradigm 가능 입증 = `archive/v4-spike/_spike-planning-agent.md` (archive 이동 — 역사 기록 보존). 외부 사실 (claude-code-guide / Sub-agents.md spec line 267 + 272 + 407~429) — frontmatter `tools` 에 `Skill` 명시 ❌ / sub-agent Skill tool 자동 활성 ✅ / `skills: [...]` 사전 주입 ✅.

### 9.2 skill ↔ agent 매핑 (SSOT)

각 stage 별 sub-agent 가 자기 frontmatter `skills: [...]` 에 사전 주입할 skill 목록:

| Agent                                                                     | 책임 stage                                         | 사전 주입 skill (frontmatter `skills: [...]`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 총  |
| ------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `analysis-agent.md`                                                       | chain 0 (input) + chain 1 sub (analysis)           | `analysis-input-collection`, `analysis-input-orchestrate`, `analysis-from-{prompt,swagger,plan-doc,figma}` (6), `analysis-source-inventory`, `analysis-architecture`, `analysis-domain-model`, `analysis-business-rules`, `analysis-db-schema-erd`, `analysis-openapi`, `analysis-api-rule-mapping`, `analysis-error-mapping`, `analysis-quality-antipattern`, `analysis-formal-spec-validation`, `analysis-characterization-test`, `analysis-sql-inventory`, `analysis-form-validation-fe`, `analysis-type-spec-fe`, `analysis-ui-state-map-fe`, `analysis-ui-visual-manifest-fe`, `analysis-aspect-{a11y,i18n,static-security,legacy}` (4), `analysis-br-cross-consistency-check`, `analysis-html-template` (22 analysis), `_base-apply-baseline-ratchet`, `_base-apply-template`, `_base-log-finding` | 31  |
| `discovery-agent.md`                                                      | chain 1 (discovery)                                | `discovery-from-analysis-output`, `discovery-from-swagger`, `discovery-from-figma`, `discovery-from-nl-md`, `discovery-decompose-use-cases`, `discovery-identify-business-intent` (6 discovery), `_base-build-traceability-matrix`, `_base-apply-template`, `_base-log-finding`, `_base-invoke-go-stop-gate` (4 base)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 10  |
| `spec-agent.md`                                                           | chain 2 (spec)                                     | `spec-compose-behavior-spec`, `spec-derive-acceptance-criteria`, `spec-integrate-deliverables` (3 spec), `_base-build-traceability-matrix`, `_base-apply-template`, `_base-log-finding`, `_base-invoke-go-stop-gate` (4 base)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 7   |
| `plan-agent.md` (gate #3)                                                 | chain 3 (plan / HOW)                               | `plan-decompose-and-sequence`, `plan-architect-decisions`, `plan-risk-and-nfr` (3 plan), `_base-build-traceability-matrix`, `_base-apply-template`, `_base-log-finding`, `_base-invoke-go-stop-gate` (4 base)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 7   |
| `test-agent.md`                                                           | chain 4 (test / RED)                               | `test-generate-test-spec`, `test-run-test-evidence`, `test-verify-coverage`, `test-playwright` (4 test), `_base-build-traceability-matrix`, `_base-apply-template`, `_base-log-finding`, `_base-invoke-go-stop-gate` (4 base)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 8   |
| `implement-agent.md`                                                      | chain 5 (implement / GREEN)                        | `implement-generate-impl-spec`, `implement-verify-test-pass`, `implement-react`, `implement-vue` (4 implement), `_base-build-traceability-matrix`, `_base-apply-template`, `_base-log-finding`, `_base-invoke-go-stop-gate` (4 base)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 8   |
| `design-agent.md` (PLACEHOLDER)                                           | design stage (chain harness 외부 / 가시화만)       | 없음 (`skills: []` / `design-wireframe-spec` + `design-component-spec` + `design-tokens-extract` + `design-visual-regression` + `design-a11y-prep` 5~6종 신설 carry)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 0   |
| `archive/v4-spike/_spike-planning-agent.md` (EXPERIMENTAL / archive 이동) | chain 1 spike (역사 기록 / agent dispatch 대상 ❌) | `planning-extract-from-legacy`, `planning-decompose-use-cases`, `planning-identify-business-intent`, `_base-invoke-go-stop-gate`, `_base-log-finding`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 5   |

### 9.3 cross-cutting agent (3 base + spike 보존)

| Agent                               | 책임 (cross-cut)                             | 사전 주입 skill                                                                      |
| ----------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| `_base-senior-engineer.md`          | research / critique (gate 검토 시 main 위임) | (없음 — Read/Grep/Glob/Edit/Bash tools 만 / Skill tool 자동 활성으로 on-demand 호출) |
| `_base-industry-case-researcher.md` | 외부 framework / library / 도구 fact fetch   | (없음 — WebSearch / WebFetch / Read / Grep 만)                                       |
| `_base-official-docs-checker.md`    | 공식 문서 cross-check                        | (없음 — WebFetch / Read / Grep / WebSearch 만)                                       |

### 9.4 호출 패턴

```
# main agent (orchestrator) → stage agent dispatch
main agent → Task(subagent_type="discovery-agent", prompt="""
target: <project-path>
goal: discovery-spec 추출 (discovery stage)
input: .aimd/output/{business-rules,domain,inventory,antipatterns}.json + findings.md
""")

# stage agent → skill chain (frontmatter skills 사전 주입 + Skill tool on-demand)
discovery-agent → Skill(discovery-from-analysis-output)
                → Skill(discovery-decompose-use-cases)
                → Skill(discovery-identify-business-intent)
                → Skill(_base-invoke-go-stop-gate)
```

### 9.5 paradigm 정합 (chain harness mechanical gate trio 보존)

- state.blocked + cli exit 2 + PreToolUse deny enforcement 보존
- hooks-bridge TRIGGER_PATTERNS = skillId + agentId 둘 다 보유 / suggestSkillForPrompt + suggestAgentForPrompt 양쪽 함수 (옛 호환 + 신 paradigm)
- formatHookBlockContext = agentId optional / 권고 동봉 ("dispatch agent via Task tool")
- hooks.json $comment = 정합 명시 / hook event 자체는 변경 ❌

### 9.6 retract 자산

- lifecycle-contract.md §자산 매핑 매트릭스 §Agent column = stage 별 분리 paradigm 반영
- agents/README.md = stage 별 분리 ✅ paradigm 반영

### 9.7 carry

- 47 SKILL.md persona 임베드 분리 평가 (agent system prompt 흡수 vs SKILL.md 절차 보존)
- chain harness agent dispatch paradigm 으로 PoC 재실행 + 산출물 cross-validation (≥2 PoC corroboration 의무)
- design stage agent 신설

본 paradigm 의 위치 = §8 의미 ID 자산화 위 stage 별 agent dispatch 본질 정합.

## 인용

- §4 chain SDLC harness 채택 근거: DEC-2026-05-06-v2.0-i-strict-채택
- §4 cooling-off 의무 제거 근거: DEC-2026-05-06-cooling-off-정책-폐기
- §7 category prefix 1-depth flatten 근거: DEC-2026-05-14-agents-skills-1-depth-flatten
- §9 multi-agent paradigm 채택 근거: DEC-2026-05-17-v4-multi-agent-paradigm-채택 (DEC-2026-05-15-g5 "stage 별 분리 ❌" retract)
- §9.1 spike 실험 근거: DEC-2026-05-17-spike-planning-agent-실험
- §1 stage 별 산출물 분리 axis 재정합 carry: DEC-2026-05-26-v11-paradigm-결단
- ADR: ADR-008 (이중 렌더링 — 사상/자산 분리)
- ADR: ADR-CHAIN-005 (mechanical gate trio enforcement)
- ADR: ADR-CHAIN-011 §9 (1-depth runtime axis)
- SSOT: `flows/analysis.phase-flow.json` / 검증 `tools/drift-validator/`
- 외부 권위: Claude Code skills 공식 docs <https://code.claude.com/docs/en/skills.md> / Sub-agents.md spec / Feathers WELC (characterization-test 용어)
