# plan — skill 의 phase-N 숫자 제거 / 의미 ID 전환

> **상태**: draft (2026-05-14 / 사용자 결단 직후 1차 작성)
> **트리거**: 사용자 결단 (윤주스, 2026-05-14 session) — "skills/ 폴더명의 숫자를 빼고 싶다. 숫자가 꼭 필요한가?"
> **사상 정합**: `methodology-spec/skills-axis.md` §6 본인 인정 "v2.0 진입 시 의미 ID + alias map 으로 자연 흡수 예정. 본 axis 분리 정책은 v1.4.x 의 과도기 패턴" → 본 plan = 그 자연 흡수의 본격 명문화.
> **선행**: v2.5.1 PATCH (1-depth 평탄화 / category prefix 정합) — runtime axis 본격 정합 완료. 본 plan = 그 위에 의미 ID 1 step.

---

## 1. 배경 / 의문 검증

### 1.1 사용자 의문
> "4번을 진행하는데 숫자를 빼고 싶다. 숫자가 꼭 필요한가?"

→ 후보 4번 = "skill/agent 디렉토리 재배치 (소공사)" / 가리키는 숫자 = `skills/analysis-phase-{N}-{slug}/` 의 phase-N.

### 1.2 본격 점검 결과 — 숫자의 정체

`methodology-spec/skills-axis.md` §1~§2 본격 명시:

- **두 axis 공존** —
  - **manifest phase ID** (`flows/analysis.phase-flow.json` 의 `phases[].id`): 분석 진행 단위 / 의존 그래프 노드. 값: `0, 1, 2, 3, 4, 4.5, 5-1, 5-2, 6`.
  - **skills 디렉토리 phase-N**: 산출물 번호 그룹 라벨 / 자연어 trigger 매칭 단위.
- 두 axis 의 숫자는 **같은 값이라도 다른 phase** 를 가리킬 수 있음.
  - 예: skills `analysis-phase-2-architecture/` ↔ manifest phase `3 (arch)`
  - 예: skills `analysis-phase-5-schema-erd/` ↔ manifest phase `2 (db)`
- **drift-validator** 는 phase-N 의 의미를 검증 ❌ — 단지 manifest `phases[].skills[]` 배열과 skill 디렉토리 이름 일치 + 고아 0 만 검증.

### 1.3 결론 — 숫자는 "꼭 필요" 하지 ❌

- skill 자동 트리거 = frontmatter `description` 키워드 매칭. 디렉토리 이름의 숫자 무관.
- drift-validator 의 SSOT = `flows/*.json` 의 매핑 배열. 디렉토리명 자체에는 phase-N 매핑 의미가 없음.
- §6 본인 인정 "산출물 번호 axis 와 manifest phase ID 가 다른 의미체계라는 사실 자체는 혼란을 가중" — **숫자 = 부담**.

### 1.4 단순 숫자 제거 시 충돌 발생

| 충돌 쌍 | 영역 |
|---|---|
| `analysis-phase-4-rules` (BR) vs `analysis-phase-5-rules` (API rules) | 둘 다 "rules" |
| `analysis-phase-5-form-validation` vs (FE 형 form-validation 확장) | 분리 식별자 필요 |

★ 따라서 paradigm = **숫자 → 의미 단어 대체** (단순 제거 ❌).

---

## 2. 목표 / 결과상 (success condition)

1. skills/ 17 디렉토리 rename = 의미 ID 본격 정합 (phase-N 숫자 제거 + slug 의미 보존 + 충돌 해소).
2. SKILL.md 17 frontmatter `name:` = 디렉토리명 정합.
3. `flows/analysis.phase-flow.json` + `flows/README.md` (2) = 새 이름 본격 갱신.
4. `tools/spec-test-link-validator/src/validator.js` + `tools/spec-test-link-validator/package.json` (2) = comment / description 갱신.
5. `methodology-spec/` 6 file + `README.md` + `briefing/` 2 + `guides/` 4 + `decisions/` 1 + `tools/*/README.md` 8 = 새 이름.
6. drift-validator 3-way 검증 통과 (manifest ↔ workflow ↔ skills).
7. workspace test 322/0 보존 (★ 본질 보존 의무 / 회귀 ❌).
8. release-readiness 9/9 본격 통과.
9. `methodology-spec/skills-axis.md` §6 "과도기 패턴" 절 → "본격 의미 ID 자산화" 절로 진화 기록.
10. ADR 신설 (ADR-CHAIN-012) 또는 기존 ADR-CHAIN-011 §10 LL-i 카운터 갱신 — paradigm 진화 기록.

### 2.5 영향 범위 본격 실측 (★ Senior critique 의제 5 흡수 / `grep -rln "analysis-phase-"` 2026-05-14)

| # | 영역 | file | 내용 |
|---|---|---|---|
| 1 | `skills/<name>/SKILL.md` (rename 대상) | **17** | git mv + frontmatter `name:` (★ aspect 4 + br-cross 1 = 변경 ❌) |
| 2 | `flows/analysis.phase-flow.json` | **1** | `phases[].skills[]` + `cross_cutting.aspects.skills[]` 배열 |
| 3 | `flows/README.md` | **1** | 본문 인용 |
| 4 | `tools/spec-test-link-validator/src/validator.js` | **1** | comment 본문 (★ Senior 신규 식별) |
| 5 | `tools/spec-test-link-validator/package.json` | **1** | description 본문 (★ Senior 신규 식별) |
| 6 | `methodology-spec/skills-axis.md` | **1** | §5 매핑 표 + §6 paradigm 진화 |
| 7 | `methodology-spec/lifecycle-contract.md` | **1** | 본문 인용 |
| 8 | `methodology-spec/README.md` | **1** | 본문 인용 |
| 9 | `methodology-spec/deliverables/20-test-spec.md` | **1** | 본문 인용 |
| 10 | `methodology-spec/deliverables/21-impl-spec.md` | **1** | 본문 인용 |
| 11 | `methodology-spec/workflow/phase-4-7-characterization.md` | **1** | 본문 인용 |
| 12 | `methodology-spec/workflow/phase-4-8-sql-inventory.md` | **1** | 본문 인용 |
| 13 | `README.md` (root) | **1** | 자연어 trigger 매핑 표 |
| 14 | `briefing/01-main.md` + `02-first-5min.md` | **2** | 본문 인용 |
| 15 | `guides/getting-started + chain-harness-guide + first-prompt-cookbook + common-errors.md` | **4** | 본문 인용 (★ common-errors.md = v2.5.1→v2.6.0 명시 호출 변경 section 신설 / Senior 의제 2 흡수) |
| 16 | `decisions/DEC-2026-05-14-post-v2.5.1-meta-cleanup.md` | **1** | 본문 인용 |
| 17 | `tools/*/README.md` (characterization-coverage / decision-table / drift / formal-spec-link / spec-test-link / spectral-runner / sql-inventory-extractor / static-runner) | **8** | 본문 인용 |

**합계 = 42 file** (★ rename 17 + 외부 인용 25). drift-validator 3-way 통과 + workspace test 322/0 + release-readiness 9/9 본격 통과 의무.

★ 변경 ❌ 영역 본격 확인:
- `agents/*.md` — 이미 의미 ID
- `flows/*.mermaid` — ★ 실측 인용 ❌
- `tools/chain-driver/src/*.js` — ★ 실측 인용 ❌ (v2.5.1 PATCH 본격 평탄화 완료)
- `.github/workflows/drift-check.yml` — skill name 인용 ❌ / validator CI 호출 만

---

## 3. 명명 매핑 본격 안 (★ 후보 2 + Senior critique 4건 미세 조정 흡수 / 2026-05-14 본격 확정)

### 3.1 analysis stage (22 → 22 / category prefix `analysis-` 유지)

| 현재 | v2.6.0 본격 안 | 비고 |
|---|---|---|
| `analysis-phase-0-input` | `analysis-input-collection` | manifest phase 0 |
| `analysis-phase-1-inventory` | `analysis-source-inventory` | manifest phase 1 |
| `analysis-phase-2-architecture` | `analysis-architecture` | manifest phase 3 (arch) |
| `analysis-phase-3-domain` | `analysis-domain-model` | manifest phase 4 (BL) |
| `analysis-phase-4-rules` | `analysis-business-rules` | manifest phase 4 / ★ BR |
| `analysis-phase-4-5-cross-validation` | `analysis-formal-spec-validation` | manifest phase 4.5 |
| `analysis-phase-4-7-characterization` | **`analysis-characterization-test`** ★ | v2.1 phase 4.7 / Feathers WELC 용어 정합 |
| `analysis-phase-4-8-sql-inventory` | `analysis-sql-inventory` | v2.2 phase 4.8 |
| `analysis-phase-5-error-mapping` | `analysis-error-mapping` | manifest phase 5-1 (api) |
| `analysis-phase-5-form-validation` | `analysis-form-validation-fe` | manifest phase 4 / ★ FE suffix |
| `analysis-phase-5-openapi` | `analysis-openapi` | manifest phase 5-1 |
| `analysis-phase-5-rules` | **`analysis-api-rule-mapping`** ★ | manifest phase 5-1 / 산업 표준 (binding 폐기 — Spring binding 혼동 회피) |
| `analysis-phase-5-schema-erd` | `analysis-db-schema-erd` | manifest phase 2 (db) |
| `analysis-phase-5-state-map` | **`analysis-ui-state-map-fe`** ★ | manifest phase 5-2 / FE suffix 일괄 |
| `analysis-phase-5-type-spec` | **`analysis-type-spec-fe`** ★ | manifest phase 5-2 / FE suffix 일괄 |
| `analysis-phase-5-visual-manifest` | **`analysis-ui-visual-manifest-fe`** ★ | manifest phase 5-2 / FE suffix 일괄 |
| `analysis-phase-6-quality` | **`analysis-quality-antipattern`** ★ | manifest phase 6 / 산출물 정합 (antipatterns + avoid-list 주산출물) |
| `analysis-aspect-a11y` | (유지) | cross-cutting / 이미 의미 ID |
| `analysis-aspect-i18n` | (유지) | |
| `analysis-aspect-legacy` | (유지) | |
| `analysis-aspect-static-security` | (유지) | |
| `analysis-br-cross-consistency-check` | (유지) | v2.5 신규 / 이미 의미 ID |

★ rename 대상 = **17 skill** (★ aspect 4 + br-cross 1 = 변경 ❌).

### 3.2 chain stage (11 → 11 / 변경 ❌ — 이미 의미 ID)

`_base-*` (5) / `planning-*` (3) / `spec-*` (3) / `test-*` (3) / `implement-*` (2) 는 이미 의미 ID 기반 → 변경 ❌.

### 3.3 agents (3 → 3 / 변경 ❌)

`_base-senior-engineer` / `_base-industry-case-researcher` / `_base-official-docs-checker` 모두 의미 ID → 변경 ❌.

### 3.4 paradigm 결단 (2026-05-14 / 윤주스 + Senior critique 흡수)

★ 후보 2 (의미 강조) + Senior critique 4건 본격 흡수:
- **FE suffix 일괄** — 4건 (`ui-state-map-fe` / `ui-visual-manifest-fe` / `type-spec-fe` / `form-validation-fe`). id-conventions `F-FE-*` finding ID 정합. paradigm 일관성 ★.
- **`api-rule-binding` → `api-rule-mapping`** — Spring binding 혼동 회피 / 산업 표준 정합.
- **`characterization` → `characterization-test`** — Feathers WELC (Working Effectively with Legacy Code) 용어 정합.
- **`quality-finding` → `quality-antipattern`** — 산출물 정합 (antipatterns + avoid-list 주산출물).

---

## 4. deliverables/ 별도 검토 (★ 본 plan scope 외 / 차후 별도 plan)

`methodology-spec/deliverables/` 의 `1-architecture.md` ~ `24-sql-inventory.md` 도 동일 paradigm 의문 가능. 단:

- deliverables 의 숫자 = id-conventions.md 기반 산출물 번호 (사용자 검색 시 번호 직접 인용 가능).
- skills 의 phase-N 과 본질 다름 (skills = trigger / deliverables = SSOT 명세).
- 본 plan 은 skills 한정 → deliverables 는 별도 plan 의무.

---

## 5. 작업 단위 / 순서 (★ Senior critique 의제 4 흡수 / micro-commit + drift-validator 앞당김 + chain-driver test 신설)

```
Sprint 1 (★ 본격 확정 완료 / 2026-05-14)
  D1. 명명 매핑 1차 안 검토 ✅
  D2. 충돌 카탈로그 / edge case 검토 ✅
  D3. plan 본격 확정 + Senior critique 흡수 ✅

Sprint 2 (코드 본격 갱신 / branch refactor/skill-meaningful-id-v2.6.0)
  D1a. ★ 5 skill rename batch 1 + frontmatter (input-collection / source-inventory / architecture / domain-model / business-rules)
       → git mv + SKILL.md frontmatter name + workspace test
  D1b. ★ 6 skill rename batch 2 (formal-spec-validation / characterization-test / sql-inventory / error-mapping / form-validation-fe / openapi)
       → git mv + frontmatter + workspace test
  D1c. ★ 6 skill rename batch 3 (api-rule-mapping / db-schema-erd / ui-state-map-fe / type-spec-fe / ui-visual-manifest-fe / quality-antipattern)
       → git mv + frontmatter + workspace test
  D2.  flows/analysis.phase-flow.json + flows/README.md skills 배열 갱신
  D3.  ★ ★ drift-validator 3-way 통과 확인 (★ 앞당김 — fail-fast)
  D4.  tools/chain-driver hooks-bridge.js skillId + tools/spec-test-link-validator/src/validator.js comment
  D4.5 ★ ★ chain-driver test + spec-test-link-validator test 회귀 검증 (신설)
  D5.  methodology-spec 6 file (skills-axis / lifecycle-contract / README / deliverables 20+21 / workflow phase-4-7+4-8)
  D5.5 ★ ★ tools/*/README.md 8 file 갱신 (신설 — Senior 의제 5 흡수)
  D6.  README.md (root) + briefing 2 + guides 4 + decisions 1 = 8 file 갱신
  D6.5 ★ ★ guides/common-errors.md "v2.5.1 → v2.6.0 명시 호출 이름 변경" 1 section 신설 (Senior 의제 2 흡수)
  D7.  workspace test 322/0 보존 본격 확인
  D8.  release-readiness 9/9 통과 본격 확인

Sprint 3 (정착 / 사상 갱신 / release)
  D1. methodology-spec/skills-axis.md §6 진화 기록 + §7 갱신 ("v2.6.0 의미 ID 본격 자산화" 절 신설)
  D2. ADR 신설 (ADR-CHAIN-012) 또는 ADR-CHAIN-011 §10 LL-i 카운터 신설
  D3. CHANGELOG.md v2.6.0 신설 entry — ★ BREAKING section 명문 ("skill directory rename 17건 / 명시 호출 path 변경")
  D4. plugin.json + package.json 버전 sync (2.5.1 → 2.6.0) + version-check.js 통과
  D5. build-plugin.js 실행 → dist/ai-native-methodology-v2.6.0/ 본격 생성
  D6. release-readiness 9/9 본격 통과 확인
  D7. commit + GHE push
```

### 5.1 micro-commit paradigm (★ Senior 의제 4 흡수)

각 D1a/D1b/D1c batch = 1 commit (★ 5+6+6 = 3 commit). 부분 실패 시 revert 단위 = batch 단위 ★. 17 skill 일괄 commit ❌.

### 5.2 fail-fast paradigm (★ D3 drift-validator 앞당김)

D2 (flows/*.json 갱신) 직후 D3 (drift-validator) — 3-way 검증 빠른 fail 의무. D6 의 자산 갱신 전 drift 차단.

---

## 6. 리스크 / 트레이드오프

| 리스크 | 영향 | 회피 |
|---|---|---|
| **skill auto-trigger 회귀** | 자연어 prompt → 새 skill 인식 ❌ | description 보존 의무 (frontmatter 영역) |
| **외부 사용자 환경 깨짐** | install 후 명시 호출 `/<old-name>` ❌ | alias map (★ 사용자 결단 — v2.5.x 한정 dual 발동 또는 즉시 cutover) |
| **명세 본문 인용 누락** | drift / 가독성 손실 | grep 본격 + drift-validator 보강 가치 |
| **briefing/guides outdated carry 누적** | 사내 동료 onboarding 본격 영향 | Sprint 2 D6 의무 + ★ 본 작업 = v2.5.1 직후 갱신 의 정합 path |
| **schema-validator workspace test 회귀** | 322/0 → 회귀 | Sprint 2 D8 의무 / 한 step 단위 commit |

---

## 7. 4원칙 정합 (★ 의무)

1. **깊은 숙지** (§1) ✅ — 본 plan = 1원칙 산출물. skills-axis.md 본격 점검 / 의존성 hot-spot 5건 식별 / 충돌 paradigm 1건 확인.
2. **3-에이전트 토론** — Sprint 1 D3 의무. 핵심 토론 주제:
   - 후보 1 (짧음) vs 후보 2 (의미 강조) trade-off
   - alias map dual 발동 paradigm (v2.5.x 한정) vs 즉시 cutover
   - briefing/guides 갱신 순서 (skill rename 직후 vs Sprint 3 일괄)
3. **사용자 승인** — Sprint 1 종결 시점 일괄 승인 패턴 (5~6 핵심 결정 묶음 / Auto Mode 호환).
4. **실패 시 Revert** — 각 sprint 단위 git branch. Sprint 2 D8 (workspace test 322/0) fail 시 즉시 revert + Lessons Learned §9.

---

## 8. 사용자 결단 본격 확정 (2026-05-14 / 윤주스 / Senior critique 흡수 후 본격 재확정)

| # | 결단 항목 | 본격 확정 |
|---|---|---|
| 1 | 명명 후보 | ✅ **후보 2 (의미 강조)** |
| 2 | cutover 정책 | ✅ **즉시 cutover** — v2.6.0 본격 rename / alias map ❌ / 자연어 trigger 영역 description 보존 + `guides/common-errors.md` 1 section 신설 본격 |
| 3 | 버전 bump | ✅ **v2.6.0 MINOR** — ★ Senior critique 의제 3 전면 흡수 / skill name 17건 변경 = breaking API surface change 사실 본격 인공 / CHANGELOG BREAKING section 명문 의무 |
| 4 | deliverables/ 숫자 prefix | ✅ **별도 plan 분리** — scope 본질 다름 (skills = trigger / deliverables = SSOT 명세) |
| 5 | aspect skill 영역 | ✅ **변경 ❌ 확정** |
| 6 | _base/planning/spec/test/implement 영역 | ✅ **변경 ❌ 확정** |
| 7 | ★ 명명 미세 조정 4건 | ✅ **전면 흡수** — FE suffix 일괄 (4건) / api-rule-binding→mapping / characterization→characterization-test / quality-finding→quality-antipattern |
| 8 | ★ 영향 범위 본격 재산정 | ✅ **42 file 본격** — grep 실측 결과 / Senior 의제 5 전면 흡수 / §2.5 표 본격 자산화 |

---

## 9. Lessons Learned (★ Sprint 2~3 진행 시 본격 갱신)

(착수 후 갱신)

---

## 10. 본 plan 의 위치

- 본 plan = `methodology-spec/skills-axis.md` §6 의 본격 자연 진화.
- v2.5.1 PATCH (1-depth 평탄화) → **v2.6.0 MINOR (의미 ID)** 의 sequence — runtime axis ★ + 사상 axis ★ 양쪽 정합 본격 완성.
- chain harness validated §8.1 strict 9/9 본질 보존 의무 (★ release-readiness 회귀 ❌).
- ★ Senior critique 5 의제 흡수 본격 자산화 — 의제 1 (명명 미세 조정 4건) + 의제 2 (common-errors section) + 의제 3 (semver MINOR) + 의제 4 (micro-commit + drift-validator 앞당김) + 의제 5 (42 file 본격 영향 범위).
