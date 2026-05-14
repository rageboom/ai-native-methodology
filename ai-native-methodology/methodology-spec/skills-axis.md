# Skills Axis — phase ID 와 skills 디렉토리 axis 분리 정책

> **상태**: 신설 (v1.4.4 / plan-v144-manifest-ssot.md / D-A=A3 + D-D=D1 결단)
> **SSOT**: `flows/analysis.phase-flow.json`
> **검증 도구**: `tools/drift-validator/` (3-way: manifest ↔ workflow ↔ skills)

## 1. 배경 — 두 개의 axis

본 plugin 에는 phase 를 가리키는 **두 개의 다른 axis** 가 공존한다. v1.4 FE 트랙 진입 (2026-05-02) 시 axis 가 분화되었으나 정책 명문 부재로 drift 위험이 누적되어 본 명세로 정착한다.

| Axis | 용도 | 예 |
|---|---|---|
| **manifest phase ID** | 분석 진행 단위 / phase 간 의존 그래프 노드 | `0`, `1`, `2`, `3`, `4`, `4.5`, `5-1`, `5-2`, `6` |
| **skills 디렉토리** | 산출물 단위 / 자연어 trigger 의 매칭 단위 | `analysis-architecture/`, `analysis-db-schema-erd/`, `analysis-ui-state-map-fe/` |

두 axis 의 phase 번호가 **같은 숫자라도 다른 phase 를 가리킬 수 있었다** (★ ★ v2.6.0 의미 ID 본격 자산화 / 본 paradigm 자연 해소). 예: skills 의 `analysis-architecture/` 는 manifest 의 phase `3` (arch) 의 skill 이고, manifest 의 phase `2` (db) 의 skill 은 `analysis-db-schema-erd/` 다.

## 2. 정책

### 2.1 manifest phase ID = SSOT

`flows/analysis.phase-flow.json` 의 `phases[].id` 가 phase 의 **단일 진실**. 모든 phase 의존 그래프 / spec_file 매핑 / skills 매핑은 본 manifest 에 정의된다.

- workflow 의 `methodology-spec/workflow/phase-{id}-*.md` 파일명은 manifest phase ID 와 1:1 정합 의무.
- 그 외 모든 자산 (deliverables / schemas / templates / examples PoC) 의 phase 인용은 **manifest phase ID** 를 사용.

### 2.2 skills 디렉토리 = 의미 ID + category prefix (1-depth)

`skills/<category>-<semantic-slug>/SKILL.md` 형식 (★ v2.5.1 1-depth + v2.6.0 의미 ID paradigm). 디렉토리명은 **산출물 의미를 직접 표현하는 라벨**이며 manifest phase ID 와 일치할 의무 ❌.

이유: skill 은 산출물 단위로 발동하고 (자연어 trigger → 1 skill = 1 산출물), 산출물 의미 (architecture / domain-model / business-rules 등) 와 manifest phase ID 는 본질적으로 다른 axis. 예:
- 산출물 architecture 는 manifest phase `3` (arch) 에서 산출된다 → skills `analysis-architecture/`.
- 산출물 schema 는 manifest phase `2` (db) 에서 산출된다 → skills `analysis-db-schema-erd/`.

skill 디렉토리명은 **사용자가 산출물 의미로 기억하기 좋은 라벨**일 뿐, manifest 와의 정합은 매핑 필드 (§2.3) 를 통해 강제한다. 본 paradigm 의 진화 이력 = §6 (v1.4.x 과도기 phase-N 숫자 prefix) + §7 (v2.5.1 1-depth + category prefix) + §8 (v2.6.0 의미 ID 본격 rename) 참조.

### 2.3 매핑 = manifest 의 `phases[].skills` 배열

각 manifest phase 는 `skills` 배열 필드를 가진다 (v1.4.4 신설). 본 phase 에서 발동되는 skill 들의 디렉토리명을 명시한다.

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
1. skills/<category>-<semantic-slug>/SKILL.md 신설 (★ 1-depth + category prefix)
   - frontmatter: name (디렉토리명과 동일) / description / allowed-tools
   - 디렉토리명 = 의미 ID (예 analysis-formal-spec-validation / analysis-characterization-test). phase-N 숫자 prefix 폐기 (§8).
   - category prefix = _base / analysis / planning / spec / test / implement (§7.2)

2. flows/analysis.phase-flow.json 갱신
   - 본 skill 이 발동되는 manifest phase 의 skills 배열에 디렉토리명 추가
   - cross-cutting aspect 면 cross_cutting.aspects.skills 에 추가
   - cross-cutting base (_base-*) 면 cross_cutting.base.skills 에 추가

3. drift-validator 통과 확인 (npm test in tools/drift-validator/)

4. CHANGELOG.md 신설 entry — skill 명 + 매핑 phase ID 명시
```

## 4. 신규 phase ID 추가 절차 (★ MAJOR change)

신규 manifest phase ID 추가 = phase 의존 그래프 변경 = **본체 구조 변경**. 사용자 명시 결단 + ≥2 PoC corroboration 의무. (★ 24h cooling-off 의무는 DEC-2026-05-06-cooling-off-정책-폐기 로 제거)

★ ★ ★ **v2.0 schema 변경 window 시작 (2026-05-06)** — DEC-2026-05-06-v2.0-i-strict-채택 으로 chain 4단계 SDLC harness 정식 채택. 본 window 안에서:

- ✅ 6 신규 schema 신설 허용 (planning-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / traceability-matrix — sub-plan-2)
- ✅ ★ chain stage axis 신설 — `flows/sdlc-4stage-flow.json` (★ sub-plan-4 신설 / stages + revisit_edges + sub_flow 통합)
- ✅ chain stage 별 manifest phase-flow 신설 — `flows/{planning,spec,test,implement}.phase-flow.json`
- ✅ skills 디렉토리 chain stage axis 확장 — `skills/{planning,spec,test,implement}-<name>/` 1-depth + category prefix (★ sub-plan-4 / v2.5.1 paradigm 정합)
- ★ window 마감 = v2.0.0 정식 release 시점 / 그 후 v2.x = add only

기존 `analysis.phase-flow.json` 의 9 phase = ★ 그대로 보존 / sdlc-4stage-flow.json 의 stages[analysis].sub_flow 로 흡수.

### chain stage axis (★ v2.0 신설)

| chain | stage | flow file | skills 디렉토리 | 산출물 |
|---|---|---|---|---|
| 0 (input) | (analysis stage 의 phase 0) | analysis.phase-flow.json | skills/analysis-input-collection/ | inventory + tree |
| 1 | planning | planning.phase-flow.json (★ 신설) | skills/planning-*/ (★ 3 / planning-extract-from-legacy 등) | planning-spec |
| 1 sub | analysis | analysis.phase-flow.json | skills/analysis-*/ (현 22 / aspect 4 + br-cross 1 포함) | 7대 + 8 FE 산출물 |
| 2 | spec | spec.phase-flow.json (★ 신설) | skills/spec-*/ (★ 3 / spec-compose-behavior-spec 등) | behavior-spec / acceptance-criteria |
| 3 | test | test.phase-flow.json (★ 신설) | skills/test-*/ (★ 3 / test-generate-test-spec 등) | test-spec + 실 test 코드 (RED) |
| 4 | implement | implement.phase-flow.json (★ 신설) | skills/implement-*/ (★ 2 / implement-generate-impl-spec 등) | impl-spec + 실 impl 코드 (GREEN) |
| cross | traceability | (sdlc-4stage-flow.json cross_cutting) | skills/_base-build-traceability-matrix/ | traceability-matrix |

## 5. 매핑 현황 (v2.6.0 시점)

| Manifest phase ID | spec_file | skills (디렉토리명) |
|---|---|---|
| 0 | phase-0-input.md | analysis-input-collection |
| 1 | phase-1-init.md | analysis-source-inventory |
| 2 (db) | phase-2-db.md | analysis-db-schema-erd |
| 3 (arch) | phase-3-arch.md | analysis-architecture |
| 4 (business-logic) | phase-4-business-logic.md | analysis-domain-model, analysis-business-rules, analysis-form-validation-fe |
| 4.5 (formal-spec) | phase-4-5-formal-spec.md | analysis-formal-spec-validation |
| 5-1 (api) | phase-5-1-api.md | analysis-openapi, analysis-api-rule-mapping, **analysis-error-mapping** (★ v1.5.0 신설) |
| 5-2 (ui) | phase-5-2-ui.md | analysis-ui-state-map-fe, analysis-ui-visual-manifest-fe, analysis-type-spec-fe |
| 6 (quality) | phase-6-quality.md | analysis-quality-antipattern |
| **cross-cutting (aspects)** | (없음) | analysis-aspect-a11y, analysis-aspect-i18n, analysis-aspect-static-security, analysis-aspect-legacy |
| **cross-cutting (base) (★ ★ ★ v2.6.0 신설)** | (없음 / 본격 ★ cross-invocation 영역) | _base-apply-baseline-ratchet (★ analysis-input-collection Phase 0 prerequisite), _base-apply-template (★ template 적용 cross-invocation), _base-log-finding (★ 모든 skill finding 등재 cross-invocation) |

## 6. 본 정책의 진화 (★ ★ ★ v1.4.x 과도기 → v2.6.0 의미 ID 본격 자산화)

- v1.4.x ~ v2.5.1: 산출물 번호 axis 와 manifest phase ID 가 다른 의미체계라는 사실 자체는 **혼란을 가중**할 수 있다 (본 plan-b carry 영역).
- ★ ★ ★ **v2.6.0 본격 자연 흡수** (★ 2026-05-14 / `.claude/plans/plan-skill-meaningful-id-rename.md` / 사용자 결단 본격) — 17 skill 디렉토리 의미 ID 본격 rename. phase-N 숫자 prefix 본격 폐기. alias map ❌ / 즉시 cutover. 본격 §8 절 참조.

## 7. v2.5.1 PATCH — category prefix 1-depth paradigm 본격 자산화 (★ ★ ★)

> ★ ★ ★ 2026-05-14 / DEC-2026-05-14-agents-skills-1-depth-flatten / ADR-CHAIN-011 §9 LL-i-48+49

### 7.1 paradigm 결단 사실

v2.0~v2.5.0 까지 본 plugin 의 skills 자산 = **2-depth** `skills/<category>/<name>/SKILL.md` (lifecycle stage organize 사상). 본 paradigm 이 ★ ★ ★ **Claude Code plugin 표준 1-depth** (`skills/<name>/SKILL.md`) 과 본격 충돌 → 사내 GHE install 후 skill 본격 인식 ❌ critical 결함.

★ ★ 사용자 결단 paradigm (v2.5.1 PATCH 본격 자산화):

- **runtime axis** = `skills/<category>-<name>/SKILL.md` (★ ★ 1-depth + category prefix paradigm / Claude Code 표준 정합)
- **사상 axis** = 본 명세 §2~§5 lifecycle stage organize 사상 보존 (★ chain stage axis + 산출물 번호 axis + manifest phase ID axis 모두 사상 영역 보존)

본 paradigm 본질 = ★ **사상 axis 와 runtime axis 의 sub-axis 영역 분리**. ADR-008 이중 렌더링 사상 (사상 + 자산 분리) 의 plugin runtime 영역 확장.

### 7.2 category prefix 매핑

| 사상 카테고리 | runtime prefix | skill 개수 (v2.5.1) | 예 |
|---|---|---|---|
| _base | `_base-` | 5 | `_base-apply-template`, `_base-build-traceability-matrix`, ... |
| analysis | `analysis-` | 22 | `analysis-input-collection`, `analysis-aspect-a11y`, ... |
| planning | `planning-` | 3 | `planning-extract-from-legacy`, ... |
| spec | `spec-` | 3 | `spec-compose-behavior-spec`, ... |
| test | `test-` | 3 | `test-generate-test-spec`, ... |
| implement | `implement-` | 2 | `implement-generate-impl-spec`, ... |
| design | (placeholder) | 0 | — |

총 **38 skill** (★ ★ Claude Code plugin 표준 1-depth 호환 ✅).

### 7.3 frontmatter `name:` SSOT 정합

각 SKILL.md frontmatter `name:` 필드 = 디렉토리 이름과 일치 의무 (v2.5.1 PATCH 본격 정합). Claude Code 의 [skills.md](https://code.claude.com/docs/en/skills.md) 공식: frontmatter `name:` 명시 시 그 값이 SSOT (디렉토리 이름 무시). 일관성 보존을 위해 v2.5.1 PATCH 안 41 파일 (38 skill + 3 agent) frontmatter 모두 새 prefix 이름과 정합 갱신.

### 7.4 skill auto-invocation = description 기반 (★ ★)

본 paradigm 의 critical 사실 — Claude Code 의 skill **auto-invocation 은 frontmatter `description` + `when_to_use` 키워드 매칭 기반** ([공식 docs](https://code.claude.com/docs/en/skills.md)). 즉:

- 디렉토리 rename (1-depth) + description 보존 = ★ auto-trigger 본격 작동 ✅
- 명시 호출 (`/<skill-name>`) = 디렉토리 이름 기반 → category prefix 이름 (예 `/analysis-input-collection`) 사용

### 7.5 외부 참조 정밀 갱신 (v2.5.1 PATCH 본격 자산화)

| 자산 | 갱신 영역 |
|---|---|
| `flows/*.json` (13) | `"skills": [...]` 배열 안 string |
| `flows/*.mermaid` (6) | diagram label |
| `tools/chain-driver/src/hooks-bridge.js` | `skillId` nested path (`planning/extract-from-legacy`) → flat (`planning-extract-from-legacy`) |
| `methodology-spec/` (17 file) | 명세 본문 안 skill name 인용 |
| `README.md` (시나리오 A 자연어 trigger 표) | 자연어 prompt → skill name 매핑 표 |

★ ★ negative lookbehind/lookahead + `.md` path 회피 정규식 / `spec_file` path 영역 보존 (★ methodology-spec/workflow/<phase-id>.md 영역 그대로 / 평탄화 무관). 본 정밀 갱신 paradigm 의 본질 = ★ runtime skill 자산 path 갱신 ≠ phase spec file path (사상 axis 의 영역).

### 7.6 paradigm 한계 (v2.5.1 시점 / v2.6.0 본격 진화 후 해소)

- ★ ★ skills/<category>-<name>/ 의 category prefix 가 사상 의미 + runtime axis 양쪽 표현 — 사용자 가독성 측면 OK / 단 신규 카테고리 추가 시 prefix 명명 paradigm 재정합 의무.
- 본 paradigm = ★ **본 plugin 의 plugin lifecycle organize 사상 vs Claude Code runtime 호환성 dual axis 정합**. 향후 Claude Code plugin spec 진화 (예: components 필드 신설 또는 nested directory 지원) 시 본 paradigm 재검토 carry (★ C-poc-axis-design-vs-runtime-separation-paradigm).

## 8. v2.6.0 MINOR — 의미 ID 본격 자산화 (★ ★ ★ ★ ★)

> ★ ★ ★ 2026-05-14 / `.claude/plans/plan-skill-meaningful-id-rename.md` / 사용자 결단 본격 / Senior critique 5 의제 본격 흡수

### 8.1 paradigm 결단 사실

v2.5.1 까지 analysis stage skill 17 디렉토리 = `analysis-phase-N-{slug}/` (★ ★ ★ phase-N 숫자 prefix). 본 형식이 ★ ★ §1 두 axis 의 본격 혼란 source — phase-N 숫자가 manifest phase ID 와 동일 의미 ❌ (★ skill 디렉토리 의 phase-N = 산출물 번호 그룹 라벨 만 / manifest phase ID = 의존 그래프 노드).

★ ★ 사용자 결단 paradigm (v2.6.0 MINOR 본격 자산화):

- **17 skill rename 본격** — analysis-phase-N-{slug} → analysis-{semantic-slug}
- **alias map ❌** — 즉시 cutover / v2.5.1 명시 호출 불가능 (★ `guides/common-errors.md` Q14.5 본격 명시)
- **자연어 trigger 영역 보존** — description 본문 정합 보존 / auto-invocation 본격 작동 ✅

### 8.2 rename 매핑 (17 → 17)

| v2.5.1 | v2.6.0 | manifest phase |
|---|---|---|
| analysis-phase-0-input | **analysis-input-collection** | 0 |
| analysis-phase-1-inventory | **analysis-source-inventory** | 1 |
| analysis-phase-2-architecture | **analysis-architecture** | 3 (arch) |
| analysis-phase-3-domain | **analysis-domain-model** | 4 (BL) |
| analysis-phase-4-rules | **analysis-business-rules** | 4 (BL) |
| analysis-phase-4-5-cross-validation | **analysis-formal-spec-validation** | 4.5 |
| analysis-phase-4-7-characterization | **analysis-characterization-test** | 4.7 |
| analysis-phase-4-8-sql-inventory | **analysis-sql-inventory** | 4.8 |
| analysis-phase-5-error-mapping | **analysis-error-mapping** | 5-1 (api) |
| analysis-phase-5-form-validation | **analysis-form-validation-fe** | 4 (BL) |
| analysis-phase-5-openapi | **analysis-openapi** | 5-1 (api) |
| analysis-phase-5-rules | **analysis-api-rule-mapping** | 5-1 (api) |
| analysis-phase-5-schema-erd | **analysis-db-schema-erd** | 2 (db) |
| analysis-phase-5-state-map | **analysis-ui-state-map-fe** | 5-2 (ui) |
| analysis-phase-5-type-spec | **analysis-type-spec-fe** | 5-2 (ui) |
| analysis-phase-5-visual-manifest | **analysis-ui-visual-manifest-fe** | 5-2 (ui) |
| analysis-phase-6-quality | **analysis-quality-antipattern** | 6 (quality) |

변경 ❌: aspect 4 (`analysis-aspect-a11y` / `analysis-aspect-i18n` / `analysis-aspect-static-security` / `analysis-aspect-legacy`) + `analysis-br-cross-consistency-check` (v2.5 신규 / 이미 의미 ID).

### 8.3 미세 조정 paradigm (Senior critique 4건 흡수)

- ★ **FE suffix 일괄** — `ui-state-map-fe` / `ui-visual-manifest-fe` / `type-spec-fe` / `form-validation-fe` (4건). id-conventions `F-FE-*` finding ID 정합. paradigm 일관성 ★.
- ★ **`api-rule-binding` → `api-rule-mapping`** — Spring binding 혼동 회피 / 산업 표준 정합.
- ★ **`characterization` → `characterization-test`** — Feathers WELC (Working Effectively with Legacy Code) 용어 정합.
- ★ **`quality-finding` → `quality-antipattern`** — 산출물 정합 (antipatterns + avoid-list 주산출물).

### 8.4 영향 범위 본격 (42 file)

skills/ 17 rename + 외부 인용 25 = 42 file 본격. 본 §8 본문 + flows/analysis.phase-flow.json (1) + flows/README.md (1) + tools/spec-test-link-validator (src/validator.js + package.json) + methodology-spec 6 + root README + briefing 2 + guides 4 (★ common-errors.md = v2.5.1 → v2.6.0 cutover Q14.5 section 신설) + decisions 1 + tools/*/README 8.

★ 변경 ❌ 영역 본격: `agents/*.md` (이미 의미 ID) / `flows/*.mermaid` (실측 인용 ❌) / `tools/chain-driver/src/*.js` (v2.5.1 PATCH 평탄화 완료) / `.github/workflows/drift-check.yml` (validator CI 호출 만).

### 8.5 검증 통과 본격

- ✅ drift-validator 3-way (manifest ↔ workflow ↔ skills) — 22 skills_declared / 11 phases_checked / 0 diff
- ✅ workspace test 322/0 본격 보존 (312 workspace + 10 scripts/test/release-readiness)
- ✅ release-readiness 9/9 본격 통과 (chain harness validated §8.1 strict 본질 보존)
- ✅ spec-test-link-validator + chain-driver test 회귀 0

### 8.6 paradigm 본격 효과

- ★ §1 두 axis 본격 혼란 해소 — skill 디렉토리 = 의미 ID / manifest phase ID = 별도 axis (단 본격 동일 숫자 충돌 ❌).
- ★ 신규 사내 동료 onboarding 시점 인지 부담 ↓ — `/analysis-business-rules` 본격 의미 명확 (★ vs `/analysis-phase-4-rules` 본격 phase-N 의미 추론 의무).
- ★ ★ Senior critique 4건 + 영향 28 → 42 file 본격 흡수 — plan §7 4원칙 §2 본격 자산화.
- ★ alias map ❌ — install 시점 명시 호출 변경 카리 / 자연어 trigger 본격 영향 ❌ (description SSOT 사실 정합).

본 paradigm 의 본격 위치 = ★ ★ ★ §6 v1.4.x 과도기 패턴 본격 자연 흡수 / §7 v2.5.1 1-depth + category prefix runtime axis 위 본격 의미 ID 본질 정합.
