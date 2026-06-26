# Plugin-Authoring 파일별 품질 감사 — 2026-05-17

> **POINT-IN-TIME 워킹 artifact — 비유지(disposable)**. `plugin-authoring-spec.md` §7(area-level)을 **대체하지 않음**. 다음 skill/agent 편집 시 stale 됨. 승격 시 durable home = §7 또는 validator, 본 파일 ❌.

- **범위**: plugin-authoring 4영역 — 47 SKILL.md + 9 agents + README + hooks.json + 2 manifests = 60 단위
- **감사 스펙**: `plugin-authoring-spec.md` v8.2.1 / §6 official-docs baseline F-015 VERIFIED 2026-05-17
- **방법**: 10 sub-agent 배치 / L1 규칙 + L2 의미·claim accuracy + L3 §8.1·no-simulation / verdict JSON
- **처분**: finding 제안만 (수정·등재 ❌ = 별도 사용자 결단 / 4원칙 §3)
- **overall 규칙**: MUST FAIL 또는 claim_accuracy FAIL → RED / UNVERIFIED·L3 FLAG·권장 FAIL → YELLOW / else GREEN

---

## Reference facts (claim-accuracy substrate)

| 사실                                | 값                                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| plugin.json version                 | 8.2.1                                                                                                          |
| CHANGELOG.md top version            | 8.2.1                                                                                                          |
| workspace-root package.json version | 8.2.1 (실경로 `ai-native-methodology/ai-native-methodology/package.json` — git 루트 아님 / plan 참조경로 정정) |
| `.claude-plugin/` 엔트리            | plugin.json, marketplace.json (2개만)                                                                          |
| agents/\*.md 개수                   | 9 (+README)                                                                                                    |
| skills 개수                         | 47                                                                                                             |

---

## Area D — manifests (2 단위) — ✅ GATE1 대기

| 파일                              | P1   | P2   | P2′  | P3   | P4   | L2-claim | L3   | overall   |
| --------------------------------- | ---- | ---- | ---- | ---- | ---- | -------- | ---- | --------- |
| `.claude-plugin/plugin.json`      | PASS | PASS | PASS | N/A  | PASS | PASS     | NONE | **GREEN** |
| `.claude-plugin/marketplace.json` | PASS | N/A  | N/A  | PASS | N/A  | PASS     | NONE | **GREEN** |

- claim accuracy: plugin.json description "stage 5종 + 3 base + spike 1종" → 실제 agents/ (5 stage + 3 \_base + design-agent placeholder = 9 +README) 정합. "47 skills" 실측 정합. marketplace "산출물 + chain 4 gate" → skills/ 디렉토리 정합.
- proposed findings: **0**
- Area D 소계: GREEN 2 / YELLOW 0 / RED 0 / finding 0

---

## Area C — hooks (1 단위) — ✅ GATE2 (일괄 위임 / 자동브레이크 미발동)

| 파일               | H1   | H2   | H3   | H4   | H5   | H6   | H7   | H8   | L2-claim | L3   | overall   |
| ------------------ | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | -------- | ---- | --------- |
| `hooks/hooks.json` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS     | NONE | **GREEN** |

- claim accuracy: `$comment` 3개 행위 주장 모두 실제 `tools/chain-driver/src/cli.js`(345-403) + `hooks-bridge.js`(29-40) 대조 PASS. PreToolUse deny → `process.exit(2)`(cli.js:400) + permissionDecision=deny(hookSpecificOutput 내부). UserPromptSubmit D21' suppressOutput=true + stderr + additionalContext 구조 확인(정확 문구는 invoke-skill.js 미열람 — 구조적 주장은 성립).
- L3: simulation_reliance NONE — 결정적 강제(real exit 2 + decision:block + permissionDecision:deny)가 코드로 뒷받침, advisory 텍스트 의존 ❌.
- **proposed finding (1, low)**: `buildBlockOutput`(hooks-bridge.js:29-40)이 spec 권장 필드 `hookSpecificOutput.hookEventName` 누락 — 비차단, 완성도 감소. spec_gap = H3.
- Area C 소계: GREEN 1 / YELLOW 0 / RED 0 / finding 1(low)

---

## Area B — agents 9 + README (10 단위) — ✅ GATE3 (일괄 위임)

| 파일                                       | A1  | A2  | A3  | A4  | A5  | A6  | ✗phantom | L2       | claim               | L3   | overall   |
| ------------------------------------------ | --- | --- | --- | --- | --- | --- | -------- | -------- | ------------------- | ---- | --------- |
| `agents/analysis-agent.md`                 | P   | P   | P   | P   | P   | P   | P        | P        | PASS(31)            | NONE | **GREEN** |
| `agents/design-agent.md`                   | P   | P   | P   | P   | P   | P   | P        | P        | PASS(0/placeholder) | NONE | **GREEN** |
| `agents/planning-agent.md`                 | P   | P   | P   | P   | P   | P   | P        | P        | PASS(7)             | NONE | **GREEN** |
| `agents/spec-agent.md`                     | P   | P   | P   | P   | P   | P   | P        | P        | PASS(7)             | NONE | **GREEN** |
| `agents/test-agent.md`                     | P   | P   | P   | P   | P   | P   | P        | P        | PASS(8)             | NONE | **GREEN** |
| `agents/implement-agent.md`                | P   | P   | P   | P   | P   | P   | P        | P        | PASS(8)             | NONE | **GREEN** |
| `agents/_base-industry-case-researcher.md` | P   | P   | P   | P   | P   | P   | P        | P        | PASS                | NONE | **GREEN** |
| `agents/_base-official-docs-checker.md`    | P   | P   | P   | P   | P   | P   | P        | P        | PASS                | NONE | **GREEN** |
| `agents/_base-senior-engineer.md`          | P   | P   | P   | P   | P   | P   | P        | P        | PASS                | NONE | **GREEN** |
| `agents/README.md` (meta·경량)             | —   | —   | —   | —   | —   | —   | —        | doc PASS | PASS                | NONE | **GREEN** |

- claim accuracy: 6 stage agent `skills:[]` 배열 멤버 전부 skills/ 실재. body 개수 주장(analysis 22+6+3=31 / planning 3+4=7 / spec 3+4=7 / test 4+4=8 / implement 4+4=8) ↔ 배열 길이 정합. 3 base agent = skills 리스트 없음(F-015·no-simulation·§8.1 doctrine 인용 = COMPLIANT, L3 flag ❌). README ↔ 실제 agents/ 디렉토리(5 stage + design placeholder + 3 base + README, spike는 archive/v4-spike/ 분리) 사실 정합.
- **proposed finding (1, low/informational)**: `design-agent.md` = 의도된 빈 placeholder(skills:[]) / dispatch no-op — 규칙 위반 ❌, 사용자 결정(DEC-2026-05-17 C-4 옵션 C), body 가 비기능 상태 투명 명시. 처분 후보 = rejected/logged.
- Area B 소계: GREEN 10 / YELLOW 0 / RED 0 / finding 1(low·informational)

**누적**: GREEN 13 / YELLOW 0 / RED 0 / finding 2(low) — F-021 band = 1~4 안정

---

## Area A — skills 47 (47 단위) — ⛔ 자동 안전브레이크 발동 (RED 11)

**구조 L1 (S1~S8): 47/47 전부 PASS** — frontmatter ⊆ 공식 15필드, body ≤500L, name charset(+`_base-*` 5 frozen allowlist), 단일책임(analysis-quality-antipattern Composite View 거절 유지 = S4 canonical test PASS) 위반 0. skill 구조 자체 결함 없음.

**문제는 전부 L2 claim-accuracy (인용의 의미 정확성)**. overall 집계: **GREEN 26 / YELLOW 10 / RED 11**.

### 결함 매핑 (systemic dedupe 적용)

| 결함                                                                                                                                                                                                                                      | 유형         | severity | 영향 skill                                                                                                                                                                                                                                                                                                                                                        | XV 상태                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SF-1** `rules.json` → `business-rules.json`(v7.0.0) 미전파 — desc/prereq/procedure/CLI 예제에 구 artifact명 잔존. validator CLI `--rules .ai-context/output/rules.json` = 런타임 path 불일치 위험                                             | systemic     | medium   | \_base-apply-template, analysis-characterization-test, analysis-form-validation-fe, analysis-from-swagger, analysis-sql-inventory, analysis-formal-spec-validation, planning-decompose-use-cases, planning-extract-from-legacy, planning-identify-business-intent, spec-compose-behavior-spec, spec-derive-acceptance-criteria, spec-integrate-deliverables (~12) | XV-pending (단, formal-spec-validation 은 body workflow/formal-spec.md 와 일관 → drift 가 methodology-wide / skill-local 아님 = SF-1 범위 확대 신호) |
| **SF-2** ADR-CHAIN-001 §3/§6 인용 swap (§6=revisit loop인데 no-simulation으로, §3=no-simulation인데 test-type 분포로)                                                                                                                     | systemic     | medium   | test-generate-test-spec, test-run-test-evidence, implement-generate-impl-spec, implement-verify-test-pass, implement-react (5)                                                                                                                                                                                                                                    | ✅ **XV-CONFIRMED** (main agent 독립 read / ADR 매핑표 L82-87)                                                                                       |
| **SF-3** analysis-business-rules inline schema 예제 = pre-v5/v6 shape (top-level decision_tables/rule_categories/meta_confidence) — 현 business-rules.schema.json `additionalProperties:false`+`required:[business_rules]` 가 hard-reject | single       | medium   | analysis-business-rules (1)                                                                                                                                                                                                                                                                                                                                       | XV-pending (v5.0.0/v6.0.0 CHANGELOG 와 정합 — 신빙성 높음)                                                                                           |
| **IF-1** spec-compose-behavior-spec step 5 가 v8.0.0 rename 전 skill명 `integrate-deliverables` 호출 = sub-skill dispatch 인용 깨짐                                                                                                   | single       | **high** | spec-compose-behavior-spec (1)                                                                                                                                                                                                                                                                                                                                    | XV-pending (v8.0.0 rename 문서화됨 — 신빙성 높음)                                                                                                    |
| **IF-2** description 의 "산출물 N" off-by-one (body 는 올바른 deliverable 파일 인용)                                                                                                                                                      | systemic-low | low      | analysis-architecture(2→#1), analysis-domain-model(3→#2)                                                                                                                                                                                                                                                                                                          | XV-pending                                                                                                                                           |
| **IF-3** ADR-FE-005 인용 "권위 매개체 13" vs 파일명 "...12" 숫자 drift                                                                                                                                                                    | low          | low      | analysis-ui-visual-manifest-fe, analysis-form-validation-fe                                                                                                                                                                                                                                                                                                       | XV-pending                                                                                                                                           |
| **IF-4** impl-spec.schema.json 에 `react_version`/`vue_version` schema marker "의무" 미확인                                                                                                                                               | low          | low      | implement-react, implement-vue                                                                                                                                                                                                                                                                                                                                    | XV-pending (schema 직접 확인 필요)                                                                                                                   |

### overall 분포 (배치별)

- B1(\_base 5 + analysis 5): GREEN 5 / RED 5 (\_base-apply-template, analysis-architecture, analysis-characterization-test, analysis-domain-model, analysis-form-validation-fe)
- B2(analysis 10): GREEN 8 / YELLOW 2 (analysis-from-swagger, analysis-sql-inventory)
- B3(analysis 10): GREEN 9 / RED 1 (analysis-business-rules)
- B4(analysis 3 + planning 3 + spec 3): GREEN 2 / YELLOW 7
- B5(test 4 + implement 4): GREEN 2 / RED 5 / YELLOW 1 (implement-vue)

- Area A 소계: GREEN 26 / YELLOW 10 / RED 11

> 중요: `skill-citation-validator`(release check #13, 0 stale 보고)는 SF-1을 **구조적으로 못 잡음** — 그 validator 의 citation class(schema/repo-path/ADR/DEC)에 "body·procedure 내 맨 artifact 파일명(rules.json)"이 포함 안 됨. 본 감사 L2 가 설계대로 그 사각을 찾아냄.

---

## 누적 집계 (Area D+C+B+A) + F-021

- **overall**: GREEN 39 / YELLOW 10 / RED 11 (총 60 단위)
- **post-dedupe 고유 finding**: SF-1, SF-2(✅XV확인), SF-3, IF-1(high), IF-2, IF-3, IF-4 + Area C 1(low: hookEventName) + Area B 1(informational: design placeholder) ≈ **9건**
- **F-021 band = 5~15 → "건강한 검증 (명세 자가진화 활발)"** — 20+ "명세 부실" 알람 ❌. 즉 spec 자체 부실 아님, 최근 rename(v7.0.0/v8.0.0) 후속 전파 누락이 표면화된 건강한 상태. 단 RED 11 + SF-1 런타임영향 + IF-1 high = 실질 중대 → 자동브레이크는 RED 기준으로 정상 발동.

---

## XV — 독립 재검증 (F-015 dogfood / 1차 판정 비공개 / 실파일 재도출)

independent-verifier 가 SF-1/SF-3/IF-1/IF-4/IF-2 를 1차 verdict 무열람으로 실파일 재read.

| 항목     | XV 결과                                     | 비고                                                                                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SF-1** | ✅ **CONFIRMED / scope = methodology_wide** | 정확히 **13 active SKILL.md** + body doc `workflow/formal-spec.md`(L4,10,27,30) + 신규: `business-rules.schema.json` 내부 `$id` 가 아직 `rules.schema.json`(L3) + 실행 CLI bash(planning-extract-from-legacy:57 `--rules .ai-context/output/rules.json` / analysis-characterization-test:29 `cat .ai-context/output/rules.json`) = 진짜 런타임 영향 |
| **SF-2** | ✅ CONFIRMED (main agent 직접)              | ADR-CHAIN-001 매핑표 §3=no-sim / §6=revisit                                                                                                                                                                                                                                                                                             |
| **SF-3** | ✅ **CONFIRMED FAIL_stale**                 | schema top `required:[business_rules]`+`additionalProperties:false`; SKILL inline 예제 키(decision_tables/rule_categories/fe_validation/meta_confidence) 전부 hard-reject + required 키 부재                                                                                                                                            |
| **IF-1** | ✅ **CONFIRMED FAIL_dead_citation**         | spec-compose-behavior-spec:53 "integrate-deliverables skill 호출" / pre-rename dir 부재·post-rename dir 존재                                                                                                                                                                                                                        |
| **IF-4** | ✅ **CONFIRMED FAIL_absent (↑medium)**      | impl-spec.schema.json(167L 전수) 에 react_version/vue_version 부재 + `additionalProperties:false` → schema 가 **hard-reject**. implement-react(L32,77)·implement-vue(L31,102) 가 "marker 의무"로 지시 = skill↔schema 계약 모순 → severity low→**medium 상향**                                                                           |
| **IF-2** | ✅ CONFIRMED FAIL (양쪽)                    | 1-architecture.md / 2-domain.md vs desc "산출물 2"/"산출물 3" off-by-one                                                                                                                                                                                                                                                                |
| **FP-1** | ⚠️ **1차 오탐 적발**                        | `_base-apply-template` 는 `rules.json` 리터럴 **0건**(business-rules.json + rules.template.md 만) → 1차 RED(rules.json claim)는 **false positive**. XV가 정확히 잡음 = 감사 자체 건전성 입증. 재등급 필요(RED→재평가). 잔여 "19 templates" count = UNVERIFIED(경미)                                                                     |

**XV 결론**: systemic finding 전부 확인(반증 0), 1차 오탐 1건(FP-1) XV가 차단, 신규 1건(schema $id) 발견 — LL-audit-01·02 가치 실증. 감사 sound.

---

## 최종 roll-up + 제안 처분 (처분·수정은 별도 사용자 결단 / 4원칙 §3)

post-dedupe 고유 finding **10건** / F-021 band **5~15 건강** (spec 부실 ❌):

| ID            | 내용                                                    | severity | 범위                                                       | 제안 처분(권고)                                |
| ------------- | ------------------------------------------------------- | -------- | ---------------------------------------------------------- | ---------------------------------------------- |
| **SF-1**      | `rules.json`→`business-rules.json` 미전파               | medium   | 13 SKILL + workflow/formal-spec.md + schema $id + CLI 예제 | corrective sweep (런타임영향 / 우선)           |
| **SF-2**      | ADR-CHAIN-001 §3/§6 인용 swap                           | medium   | 5 chain3-4 skill                                           | corrective (문구 정정)                         |
| **SF-3**      | analysis-business-rules inline 예제 pre-v5/v6           | medium   | 1 skill                                                    | corrective (예제 현행 schema 정합)             |
| **IF-1**      | spec-compose step5 dead skill명 호출                    | **high** | 1 skill                                                    | corrective 우선 (dispatch 깨짐)                |
| **IF-4**      | react/vue_version = schema hard-reject 키 지시          | medium   | 2 skill                                                    | 결단 필요: skill 문구 수정 vs schema 속성 추가 |
| **IF-2**      | desc 산출물 N off-by-one                                | low      | 2 skill                                                    | batch corrective                               |
| **IF-3**      | ADR-FE-005 "매개체 13" vs 파일 "12"                     | low      | 2 skill                                                    | batch corrective                               |
| **AUDIT-C-1** | hooks-bridge hookEventName 누락                         | low      | 1 (hooks-bridge.js)                                        | deferred/batch                                 |
| **NEW-XV-1**  | business-rules.schema.json `$id` 아직 rules.schema.json | low      | 1 schema                                                   | SF-1 sweep 동반                                |
| **AUDIT-B-1** | design-agent 의도된 placeholder                         | info     | 1 agent                                                    | **rejected**(규칙 위반 ❌·사용자 결정 DEC C-4) |

**FP-1 처분**: finding 아님 = 감사 위생 노트. `_base-apply-template` 재등급(RED→GREEN/YELLOW, rules.json 무관 / "19 templates" count UNVERIFIED 만 잔존).

**핵심**: skill 구조(L1) 완벽 / 결함 전부 L2 인용 drift / 근본원인 = v7.0.0(rules.json)·v8.0.0(skill rename)·v5~6(BR schema) rename 후속 전파 누락. 기존 skill-citation-validator(check#13)가 SF-1을 구조적으로 못 보는 사각 = 본 감사가 메운 가치.

---

## 수정 cycle 종결 (2026-05-17 / 사용자 "진행")

durable disposition = `methodology-spec/finding-system.md` Body Ledger F-PA 처분표 (SSOT). 요약:

- **resolved 8**: F-PA-001(spec-compose dead skill명) / F-PA-002(13 skill+5 workflow SSOT doc rules.json→business-rules.json) / F-PA-003(5 chain skill §3/§6) / F-PA-004(business-rules inline canonical) / F-PA-005(react/vue_version → 실재 `modules[].framework` redirect / schema 무변경) / F-PA-006(산출물 N) / F-PA-008(hooks-bridge hookEventName) / F-PA-009(schema $id)
- **wontfix 2**: F-PA-007(skill 인용 정확 / ADR 파일명 immutable-history) / F-PA-010(design placeholder 의도)
- **scope 확대**: F-PA-002 가 XV 시점(13 skill + formal-spec.md)보다 넓은 5 workflow SSOT doc 포함 — drift 근원 동반 해소
- **위생 적발 2**: FP-1(\_base-apply-template 1차 RED 오탐 / rules.json 무관) + F-PA-007 1차 오진(skill 정확 / 파일명이 stale) — 둘 다 ground-truth-before-edit 가 재작업 차단

### STOP-3 hard gate (전부 통과)

- 잔여 grep **0**: standalone `rules.json`(skill+workflow) / §6-no-sim·§3-test-type miscite / react·vue_version 의무 / integrate-7대
- `skill-citation-validator` **finding 0** (207 active doc / 자가 회귀 1건 발견 즉시 교정 — ledger 내 죽은 `*.schema.json` 토큰 비리터럴화)
- `release-readiness` **13/13 ready:true** — workspace test 395+ pass(chain-driver 코드 변경 무회귀) + validators_violation·analysis_validator·skill_citation 전부 green
- breaking **0** = PATCH-class (doc-corrective + schema $id 정합($ref 의존 0) + chain-driver additive optional)

> 버전 bump·CHANGELOG·commit 은 본 작업 범위 밖(사용자 미지시) — 별도 결단 시 수행.

---

# 확장 감사 — methodology-body (F-MB namespace / 사용자 "1,2,3 다하자 순서대로")

## Area E — deliverables 25 (methodology-spec/deliverables/\*.md) — GREEN 25 / RED 0

- L1 구조·L2 schema citation·cross-ref numbering·id citation·inline example·L3 = 25/25 PASS (신규 finding type 0).
- **F-MB-001 (systemic, medium)** — `rules.json`→`business-rules.json`(v7.0.0) rename drift 가 deliverables 미전파 (F-PA-002 = skills+5 workflow 만 sweep / deliverables ❌). 영향 11 파일: 4-5-formal-spec(176) / 14-form-validation-spec(11,23,32,60,71,85,87,90,98,112,125) / 15-type-spec(104) / 16-error-mapping-spec(96) / 17-planning-spec(33,37,58) / 18-behavior-spec(76) / 23-characterization-spec(12,45,50,180) / 24-sql-inventory(12,71). 변종: cross_links `to_artifact: rules` 별칭(14/15/16) 동일 class. 제외: 5-business-rules.md:23 = 의도적 rename 문서화("구 rules.json") = drift 아님.
- Area E 소계: GREEN 25 / YELLOW 0 / RED 0 / 신규 finding 0 (F-MB-001 = F-PA-002 drift class 의 deliverables 확장).

## Area F — schemas 39 (schemas/\*.json) — GREEN 39 / RED 0

- 결정적 pre-check: $id↔filename 불일치 **0** (F-PA-009 = singleton 이었음 / 나머지 38 정합) / $id·$schema 부재 0 / $ref(`./intent-classification`·`./meta-confidence`) 전부 resolve / intent-classification additionalProperties:false 부재 = **정당**(scalar string enum SSOT / 비-object).
- L2 desc·xref·internal·L3 = 39/39 PASS.
- **F-MB-002 (low)** — cross-schema BR-id 패턴 SSOT drift: form-validation-spec.cross*link_to_br(:130) + formal-spec.decision_tables.br_id(:117)·invariants.related_brs(:198) = 3-seg `^BR-[A-Z0-9*-]+-[0-9]+$` vs business-rules canonical 4-seg(:159). hard-reject 없음(4-seg id 가 looser 패턴에도 매칭) / 패턴 SSOT 불일치만.
- **F-MB-003 (low)** — JSON property **키**에 `` glyph: legacy-spectrum.schema.json:192(`tier_4_be_fe_split_carry`) + static-security-spec.schema.json:90(`runtime_check_required`). 구조 valid 이나 instance author 가 비-ASCII 키 emit 강제 = authoring smell (plugin-authoring-spec schema 저작규칙 gap).
- **F-MB-001 확장** — characterization-spec.schema.json:128 + intent-classification.schema.json:5 stale `rules.schema.json` 텍스트 ($comment / known systemic).
- Area F 소계: GREEN 39 / YELLOW 0 / RED 0 / 신규 finding F-MB-002·F-MB-003 (둘 다 low).

## Area G — tools 18 (tools/\* code↔doc) — GREEN 10 / RED 8 (전부 README↔code 문서 drift / 기능결함 ❌)

코드·테스트 정상(workspace 395+ green) / no-simulation 완전 정합 (static-runner·test-impl-pass-validator 실 subprocess spawn 확인 / spectral-runner npx passthrough / br-cross-consistency Layer 2 LLM = 문서화 설계 COMPLIANT). RED 8 = 전부 README 가 cli.js 권위와 어긋남.

- **F-MB-004 (high)** ✅XV-CONFIRMED — `chain-driver` README exit-code 표(3=migration/4=interrupted/1↔2)가 cli.js 권위(header L16-21+usage L62: 1=blocked/2=invariant-violation/3=usage/4=state-corrupt) 와 모순. CI/consumer가 README 보고 gate하면 오판(exit 2를 blocked로 오인).
- **F-MB-005 (medium, systemic)** — README exit-code 표가 cli.js 와 어긋남 class: chain-coverage-validator(phantom code 3 / 실제 dry-run=0) + schema-validator(1↔2 반전 / 실제 violation=1·usage=2) + test-impl-pass-validator(fail=2 문서 / 실제 fail=1·usage=2). 각 cli.js header 는 정확 = README만 stale.
- **F-MB-006 (low, systemic)** — README 가 구현된 표면 미문서화: decision-table-validator(--baseline/--ratchet/--write-baseline ADR-010 옵션) + drift-validator(--check-layout v1.4.4 3-way mode) + sql-inventory-extractor(README "11 컬럼" / 실제 12 = migration_priority ADR-CHAIN-009).
- **F-MB-007 (medium)** — spec-test-link-validator README finding-`kind` 명이 emit 값과 전면 불일치(hyphen vs underscore + 미문서 `chain.tc.no_ac_ref`). consumer가 kind 로 키하면 finding silently miss.
- **F-MB-008 (low)** — test-impl-pass-validator README 가 `src/adapters/*` 인용하나 실제 `src/runners/*` (dead path).
- F-MB-001 확장(known): br-cross-consistency-validator·planning-extraction-validator README/cli usage 에 stale `rules.json` (CLI flag 자체는 `--rules` 불변 = 인터페이스 정합).
- Area G 소계: GREEN 10 / RED 8 (F-MB-004 high / F-MB-005·007 medium / F-MB-006·008 low) / RED 전부 doc-drift (코드·no-sim 정상).

---

## F-MB roll-up (Area E+F+G) + F-021

- overall: GREEN 74 (E25+F39+G10) / RED 8 (G) / 총 82 단위
- post-dedupe 고유 F-MB finding: **8** (F-MB-001 systemic medium / 002 low / 003 low / 004 high / 005 systemic medium / 006 systemic low / 007 medium / 008 low) — F-021 band **5~15 "건강한 검증"** (명세 부실 ❌)
- 성격: F-MB-001 = F-PA-002 drift class 의 deliverables+schemas 확장(미완 sweep) / F-MB-004·005·007 = README↔cli.js 문서 drift(코드 정확·기능 무결) / 002·003·006·008 = 경미 authoring/doc smell
- 핵심: Area E·F 구조 거의 완벽(deliverables 25 + schemas 39 = GREEN, $id·$ref·numbering 무결) / 실 가치 발견은 ① deliverables rename drift 잔존(F-PA-002 미완) ② tools README 가 cli.js 권위와 drift(특히 chain-driver consumer-facing) — 결정적 validator 가 README 산문을 안 보는 사각(LL-plugin-04 재확인)
