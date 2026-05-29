# plan-poc17-chain1-discovery-car-list

> **session 52차 작업 plan** — chain 1 discovery 진입 / poc-17 car-list pilot / chain harness discovery stage 첫 사내 live 입증
> **4원칙 1단계** (깊은 숙지 → plan.md 작성) — 사용자 승인 후 2~3원칙 진입.
> **paradigm 정합** — DEC-2026-05-21-chain-discovery-plan-stage-도입 + DEC-2026-05-26-discovery-spec-rename + LL-codegraph-07 (외부 source 격리) + 듀얼 목표 (마이그레이션 + plugin axis).

---

## 1. 목적 / scope

### 1.1 목적

poc-17 analysis baseline (12 phase 전수 / 25+ 산출물 / 43 finding) 위에 **chain 1 discovery stage 첫 사내 live 시행**. car-list pilot scope 단일 화면 출력 = `discovery-spec.{json,md}` (chain spec stage forward link 가능 형태).

### 1.2 듀얼 목표 (memory `feedback_dual_goal_migration_plus_plugin.md` 정합)

| axis | 본 plan 안 시행 | 자산 |
|---|---|---|
| 마이그레이션 (사내 EFI-WEB) | car-list 화면 1 = 차량목록 / Controller GET /car/carList | 외부 디렉토리 `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/discovery-spec.{json,md}` |
| 플러그인 axis (본 레포) | discovery-from-analysis-output skill body 실측 입증 + sub-rule spring41-ibatis2 정합 사실 누적 | 본 plan / DEC / LL 후보 (commit ❌ — 사실만 / methodology body 변경 ❌) |

### 1.3 scope-in (pilot 단일 화면)

| 자산 | 사실 |
|---|---|
| 화면 | Screen 1 = 차량목록 |
| JSP | `carList.jsp` (193 loc) + `carListAjax.jsp` (57 loc 부분 렌더) |
| Controller | `CarMgtController` — GET `/car/carList` + POST `/car/carListAjax` |
| Service | `CarMgtService` / `CarMgtServiceImpl` |
| DAO | `CarMgtDAO` |
| sqlMap | `carMgt.xml` (관련 sql_id 부분만 / 전체 22 중 carList-bound) |
| 주 테이블 | `TB_CAR_USER_TERM` (사용자 임기) + `TB_CAR` (차량 master / cross-link) |
| 주 function | `fn_Get_CarUserListView` (10 loc) + `fn_Get_CarUserListView_2` (117 loc) |
| BR-* | 53 BR 중 car-list scope-bound 부분 집합 (4원칙 2단계 grep 의무) |
| AC-* | (chain 2 spec stage 생성 예정) — discovery 단계 = `acceptance_criteria_refs[]` placeholder forward link |

### 1.4 scope-out (명시)

| 자산 | scope-out 사유 |
|---|---|
| 화면 2~6 (carDrive / carCost 4종) | car-list pilot 단일 화면 / 별 scope (`car-drive-log` / `car-cost-*`) / 후속 carry |
| F-PII-HARDCODE-001 (critical) | `CarCostServiceImpl` 안 / carCost scope / car-list pilot 무관 / **별 사용자 결단 axis** (사내 source 직접 정정 / 본 plan 의제 ❌) |
| 외부 SP γ `SGERP.dbo.SG_SACSlipRowCarManagementIFQuery` | carCost scope / car-list 무관 / discovery-spec.out_of_scope[] 표기 |
| state-map / visual-manifest / interaction | Scenario C scope-out (ui-spec.md §2 정합 / server-side state 본질) |
| chain 2~5 (spec / plan / test / implement) | 본 plan = chain 1 단일 stage |

---

## 2. 입력 (analysis baseline / 외부 절대경로 read-only)

★ LL-codegraph-07 정합 — 외부 source 격리 / 본 레포 사본 ❌ / 절대경로 reference 만.

### 2.1 1차 입력 (12 phase 전수 산출물 — car-list bound subset)

| 산출물 | 외부 절대경로 | 본 plan 활용 |
|---|---|---|
| `_manifest.yml` | `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/_manifest.yml` | source_root_absolute 참조 |
| `input-summary.json` | (위) | screen_to_scope_map[0] (car-list) + legacy_stack 사실 |
| `inventory.json` | (위) | car-list bound 8 java + 2 sqlmap + 14 jsp 중 carMgt subset |
| `stack-detection.md` | (위) | Spring 4.1.2 / Java 1.8 / iBATIS 2 / Egov 3.6.0 |
| `domain.json` / `domain.md` / `domain.mermaid` | (위) | 4 BC + 3 Aggregate 중 car master + user-term context |
| `business-rules.json` | (위) | 53 BR 중 car-list scope-bound subset (grep 의무) |
| `schema.json` + `erd.mermaid` | (위) | TB_CAR + TB_CAR_USER_TERM 부분 |
| `openapi.yaml` | (위) | 28 endpoint 중 CarMgt 12 (car-list bound 2: GET /car/carList + POST /car/carListAjax) |
| `architecture.json` + `architecture.mermaid` | (위) | 8 layer + cross-DB dep-graph |
| `antipatterns.json` | (위) | 16 AP + AP-LEGACY-IBATIS2-DB-001~011 (sub-rule §X-H-11) |
| `migration-cautions.md` | (위) | car-list migration carry |
| `findings/*` | (위) | 43 finding 중 car-list scope-bound subset |
| `characterization-spec.json` | (위) | intent-vs-bug 20 중 carList bound (예상 ~3~5) |
| `sql-inventory.json` | (위) | 35 sql_id 중 carMgt.xml carList bound subset |
| `ui-spec.md` | (위) | JSP 14 ↔ Controller ↔ Screen 매핑 (Screen 1 row) |
| `formal-spec/*` (decision-tables / state-machines / sequence-diagrams) | (위) | RBAC 3 분기 + state-machine cost-lifecycle (carList 무관 — state-machine = cost / RBAC = cross) |
| `stored-procedures/*` | (위) | 외부 SP γ 1건 (carCost scope / car-list 무관 / out_of_scope 표기) |

### 2.2 2차 입력 (sub-rule / methodology body)

| 자산 | 본 레포 위치 | 본 plan 활용 |
|---|---|---|
| sub-rule `spring41-ibatis2-isomorphic.md` v1.2.0 | `ai-native-methodology/methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` | §X-H 4 sub-section + §X-H-11 AP-LEGACY-IBATIS2-DB-001~011 정합 의무 |
| discovery-spec.schema.json | `ai-native-methodology/schemas/discovery-spec.schema.json` | 출력 schema 의무 |
| discovery.phase-flow.json v3.1.0 | `ai-native-methodology/flows/discovery.phase-flow.json` | 5 phase (input-validate → use-cases-decompose + br-intent-extract → discovery-spec-compose → gate-1) |
| discovery-from-analysis-output SKILL.md | `ai-native-methodology/skills/discovery-from-analysis-output/SKILL.md` | 절차 9 step |
| discovery-decompose-use-cases SKILL.md | (위 형제) | UC-{domain}-NNN 분해 |
| discovery-identify-business-intent SKILL.md | (위 형제) | BR-INTENT-* 채움 + br_refs |
| discovery-extraction-validator | `ai-native-methodology/tools/discovery-extraction-validator/` | 자동 검증 (critical/high 0 의무 / source-grounded coverage ≥ 0.80) |
| schema-validator | `ai-native-methodology/tools/schema-validator/` | discovery-spec.json schema 검증 |

---

## 3. 산출물

### 3.1 1차 산출물 (외부 디렉토리 / 사내 source 격리)

| 산출물 | 외부 절대경로 | format |
|---|---|---|
| discovery-spec.json | `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/discovery-spec.json` | machine SSOT (schema 의무) |
| discovery-spec.md | (위 형제 `.md`) | 사람 눈 (ADR-008 v2 이중 렌더링) |
| chain-intervention-log.jsonl (append) | `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/chain-intervention-log.jsonl` | gate #1 결과 |

### 3.2 2차 산출물 (본 레포 / 사실 자산화 / 본 plan 후 별 cycle)

| 산출물 | 본 레포 위치 | 조건 |
|---|---|---|
| LL-poc-17 추가 5~8 | (carry queue / decisions/) | 본 plan 종결 후 사용자 결단 |
| DEC-2026-05-29~30-poc17-discovery-pilot | `ai-native-methodology/decisions/` | 시행 후 신설 |
| methodology-spec §사례 갱신 | (해당 spec) | sub-rule 본격 cascade 시 / 본 plan scope ❌ |

★ **본 레포 commit ❌** (사내 source 격리 / 마스킹된 DEC 만 commit 자격 / LL-codegraph-07 정합).

---

## 4. 절차 (discovery.phase-flow.json v3.1.0 정합 / 5 phase)

### Phase 1. input-validate

- 12 phase 산출물 25+ 종 모두 존재? 누락 시 사용자 명시 + analysis stage 재진입 권고.
- 본 plan §2.1 표 grep + path verify.
- 산출 = analysis_completeness_check.

### Phase 2a. use-cases-decompose (`discovery-decompose-use-cases` skill)

- domain.json + business-rules.json + openapi.yaml (car-list bound subset) 입력.
- car-list pilot scope UC 후보 (예상):
  - UC-CAR-001 차량 목록 조회 (페이징 / 필터)
  - UC-CAR-002 차량 목록 부분 갱신 (Ajax)
  - UC-CAR-003 사용자 임기 join 조회 (현재 사용자 매핑 표시)
  - (BR grep 후 추가 가능)
- 각 UC source_grounded_evidence[] 의무 — code_pointers + analysis artifact path.
- acceptance_criteria_refs[] = chain 2 spec stage 생성 예정 placeholder (예: `AC-CAR-001` forward link 의무 / minItems: 1).

### Phase 2b. br-intent-extract (`discovery-identify-business-intent` skill)

- business-rules.json + antipatterns.json + findings/* + migration-cautions.md 입력.
- 53 BR 중 car-list scope-bound subset (grep 의무):
  - `carList` keyword grep 매치
  - `carMgt` keyword 매치
  - `TB_CAR_USER_TERM` keyword 매치
  - `fn_Get_CarUserListView` keyword 매치
- 각 `business_rules_intent[]` entry 산출 (★ research scope 1 정정 / `BR-INTENT-*` prefix 폐기 / schema 안 backward link 만):
  - `br_id` (analysis BR-* backward link / pattern `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$`)
  - `reasoning` (왜 이 규칙인가 자연어)
  - `source_grounded_evidence` (file:line 의무 / iBATIS 2 sqlMap layer 한계 ★ PoC #15 입증 — Java layer ⭐⭐⭐ / sqlMap layer 0 / 우회 = manual grep 의무)

### Phase 3. discovery-spec-compose

- business_intent 채움 (car 도메인 목적 + stakeholders + success_criteria).
- use_cases[] + business_rules_intent[] 합성.
- cross_links 채움 (to_analysis_artifacts / to_sql_inventory / to_source / to_decisions / to_phase7_findings 5종).
- excluded_antipatterns[] = critical/high AP 중 car-list 무관 (carCost scope) 명시 (carry contract).
- out_of_scope[] = 외부 SP γ + 화면 2~6 + F-PII-HARDCODE-001 (carCost scope).
- risks_and_constraints[] = R1' axis ceiling 53~55% + iBATIS 2 sqlMap parse 한계 + F-PMD-PARSE-001 (JSP 71% parse fail).
- decisions[] + pending_decisions[] = §5 결단 의제 반영.

### Phase 4. 자동 검증 (★ no-simulation 의무)

- `node tools/discovery-extraction-validator/src/cli.js --discovery <path>/discovery-spec.json --rules <path>/business-rules.json --domain <path>/domain.json --json` 실행.
  - critical/high 0 의무.
  - source-grounded coverage ≥ 0.80 의무.
- `node tools/schema-validator/src/cli.js <path>/discovery-spec.json` 실행.
  - schema valid 의무 (additionalProperties:true / required 필드 정합).
- discovery-spec.md 렌더링 (이중 렌더링 ADR-008 v2).

### Phase 5. gate #1 (`_base-invoke-go-stop-gate` skill)

- 사용자 검토 cluster (5~6 결단 묶음) — §5 의제 정합.
- 결과 = go / stop / revisit (revisit:analysis 가능 / DEC-2026-05-06-round-trip-부분-허용).
- 결과 chain-intervention-log.jsonl append.

---

## 5. 사용자 승인 묶음 (3원칙 / 5~6 핵심 결정)

★ Auto Mode 호환 — 본 plan 시행 전 일괄 결단.

### 결단 1. car-list pilot scope boundary

- **A. 협소** (UC-CAR-001~003 / GET + POST AJAX 2 endpoint / carMgt.xml sql_id 5~7개) — 가장 빠른 입증 / 추천
- B. 중간 (+ carInsertForm.jsp + GET carInsertForm/carUpdateForm — 차량 등록/수정 폼 추가)
- C. 광 (+ carSelectPopup — cross 화면 포함) — pilot scope 부풀림 / 비추천

### 결단 2. BR-* 추출 grep 범위

- **A. car-list bound subset** (grep keyword 4종 매치 BR 만 / 예상 8~15개) — 추천
- B. 전체 53 BR (광범위 / source-grounded coverage 측정 axis 확장)
- C. 사용자 표시 후 결단 (1차 후보 list 제시 + 사용자 선별)

### 결단 3. iBATIS 2 sqlMap layer source-grounded evidence 우회

- **A. Manual grep + file:line 자연 인용** (PoC #15 입증 한계 / Java layer ⭐⭐⭐ + sqlMap manual grep 보완) — 추천 / sub-rule §X-H 정합
- B. iBATIS 2 sqlMap → Java DAO 호출 chain 만 evidence (sqlMap 직접 evidence ❌ / 우회 약함)
- C. SonarQube + jsp-lint 보강 (C-jsp-parser-augment carry 본격 처리 / 본 plan scope 초과 / 비추천)

### 결단 4. Auto Mode / pending_decisions[] 처리

- **A. Auto Mode 미활성 (default)** — pending_decisions[] 발생 시 gate #1 cluster 5 에서 user-explicit 결단 / `AI-default` 0 의무 — 추천
- B. Auto Mode 활성 — AI 가 1차 default + revisit_required:true / 후속 chain 2 gate #2 에서 일괄 confirm (속도 우선)

### 결단 5. excluded_antipatterns[] + out_of_scope[] 명시 범위

- **A. 명시 본격** (critical AP 16 중 carCost scope 분리 + 외부 SP γ + F-PII-HARDCODE-001 + 화면 2~6 모두 명시) — chain.ap.uncovered_severe finding 차단 / 추천
- B. 최소 (화면 2~6 만 명시 / AP 분리는 chain 2 spec stage carry)

### 결단 6. 본 plan 종결 산출물 commit 정책

- **A. 본 레포 commit ❌** (LL-codegraph-07 정합 / 외부 디렉토리 산출물만 + 본 plan 안 메타 사실만 commit 자격) — 추천
- B. 마스킹된 DEC 1건 commit (DEC-2026-05-29-poc17-discovery-pilot-종결) — 사실 자산화 axis / 본 plan 종결 후 별 cycle

---

## 6. 위험 / 제약

| ID | 위험 | severity | 완화 |
|---|---|---|---|
| R-001 | R1' axis Spring 4.1 + iBATIS 2 ceiling 53~55% — Java layer ⭐⭐⭐ + sqlMap layer 0 (PoC #15 입증) | high | 결단 3.A — manual grep 우회 + sub-rule §X-H 정합 |
| R-002 | F-PMD-PARSE-001 (JSP 71% parse fail) — JSP-bound BR source-grounded evidence 약함 | medium | JSP 직접 grep + carListAjax.jsp = 8 violation = parse success subset 활용 |
| R-003 | discovery-extraction-validator source-grounded coverage ≥ 0.80 gate fail 가능 | medium | Phase 4 RED 후 Phase 2b 재시행 (4원칙 4단계 / revert + LL 기록) |
| R-004 | UC acceptance_criteria_refs[] forward link 가 chain 2 spec stage 부재 시 dead link (minItems:1 / chain-coverage-validator) | low | placeholder AC-CAR-* ID 정의 / chain 2 진입 시 충족 의무 (R20 paradigm 정합) |
| R-005 | 본 plan 시행 중 사내 source 사본 발생 위험 (LL-codegraph-07 위반) | high | 모든 산출물 외부 디렉토리 격리 / 본 레포 commit gate 안 source 사본 0건 verify 의무 |
| R-006 | 단일 PoC 과적합 (§8.1 strict) — 사내 PoC 1건 사실 누적 만 / 외부 OSS Modern 1건 대조 부재 | medium | 본 plan = R1' axis 4번째 corroboration 누적 자격 (PoC #06+#07+#11+#17 + chain 1 첫 사내 live) / 사실 axis 만 / paradigm 격상 trigger ❌ |
| R-007 | self-referential drift 위험 — 본 plan 시행 중 methodology body sweep 자연 trigger | high | LL-codegraph-01 정합 / methodology body 변경 ❌ / 사실만 record / 외부 자연 trigger 의무 |

---

## 7. 검증 (4원칙 STOP-3 정합)

### 7.1 외부 산출물 (사내 axis)

- discovery-extraction-validator critical/high = 0 ✅
- schema-validator valid ✅
- source-grounded coverage ≥ 0.80 ✅
- 사내 source 사본 0건 ✅ (외부 디렉토리 격리 verify)
- gate #1 = go (또는 revisit:analysis)

### 7.2 본 레포 axis (마이그레이션과 직교)

- workspace test 영향 0 (본 plan = doc trail / 코드 변경 ❌)
- release-readiness 22/22 보존 ✅
- skill-citation 0 stale ✅
- version 3-way 11.4.0 유지 (release ❌)

### 7.3 paradigm axis (사실 누적)

- M.2 측정 axis 사실 누적 +1~+3 (chain 1 첫 사내 live / discovery-from-analysis-output skill body 실측 입증 / discovery-extraction-validator 첫 사내 live 검증)
- LL 후보 자산화 5~8건 (본 plan §8 placeholder)

---

## 8. Lessons Learned (★ 4원칙 4단계 / 시행 종결 / Gate #1 = stop + revisit:analysis)

> 본 plan 시행 결과 = **gate #1 stop + revisit:analysis 결단** (cluster 1+3+4_5 사용자 결단 묶음 / DEC-2026-05-06-round-trip-부분-허용 정합).
> chain 1 산출물 (discovery-spec.{json,md}) = ★ ★ 사실 누적 자산화 (frozen / 추가 진전 보류) / **chain 2 spec 진입 ❌**.
> 본 LL = 본격 paradigm drift 2건 + revisit:analysis 첫 사내 trigger.

### 8.1 LL 자산화 6 (시행 직후 실측)

**LL-poc-17-05: chain 1 discovery stage 첫 사내 live paradigm 본격 입증**
- chain harness discovery stage 가 사내 EFI-WEB legacy (Spring 4.1 + iBATIS 2) 안에서 본격 시행 자격 입증 — 25+ analysis 산출물 입력 → discovery-spec 12 BR + 3 UC 본격 출력 + validator 2종 GREEN 도달.
- ★ ★ M.2 측정 axis 사실 누적 +1 (chain 1 첫 사내 live).
- 단일 PoC 과적합 회피 (§8.1 strict) — 사실 axis 만 / paradigm 격상 trigger ❌ (외부 OSS Modern 1건 대조 부재).
- corroboration 자격 = ≥ 2 PoC 의무 (별 PoC 사내 또는 OSS 1건 추가 의무).

**LL-poc-17-06: discovery-from-analysis-output skill body 실측 ROI 측정**
- skill body 9 step 절차 정합 입증 — input verify → use-case decompose → BR-intent extract → discovery-spec compose → 자동 검증 2종 → gate #1 cluster 5~6 cycle 본격 작동.
- 단, **본격 결단**: skill body 가 paradigm drift (validator + schema regex) 흡수 부재 — 외부 디렉토리 layer 에서 fix 우회 (additive normalize) 필요.

**LL-poc-17-07: iBATIS 2 sqlMap layer source-grounded evidence Manual grep 우회 paradigm 본격 입증**
- PoC #15 사실 (codegraph v0.9.6 sqlMap layer cover ❌) → carMgt.xml#selectCarList + 5 sqlMap id 모두 manual grep file:line 인용 + DB function (fn_Get_CarUserListView_2.sql L41-95) 도 동일.
- ★ Java layer ⭐⭐⭐ (CarMgtController + Service + DAO chain 자동) + sqlMap layer manual = R1' axis ceiling 53~55% 입증 정합 (4번째 사내 corroboration).
- sub-rule §X-H v1.2.0 정합 검증 — §2 core 5 AP 모두 car-list 적용 의무 + §X-H-11 신축 11 AP 중 ~7종 car-list bound + 4종 carCost scope (excluded).

**LL-poc-17-08: UC acceptance_criteria_refs[] forward link placeholder paradigm 본격 (chain 2 spec stage 부재 시)**
- chain-coverage-validator minItems:1 정합 위해 AC-CAR-001~003 placeholder ID 사용 — 본 chain 1 단계 forward link 만 가능 / chain 2 진입 후 AC 본체 생성 의무 (R20 paradigm 정합).
- ★ chain 1 단독 시행 시 placeholder forward link 가 dead link 위험 = chain 2 미진입 시 사실 (현재).

**LL-poc-17-09: ★ ★ ★ paradigm drift 2건 본격 표면화 + revisit:analysis 첫 사내 trigger**

**Drift #1 = validator 의 business-rules.json 구조 가정 mismatch**
- discovery-extraction-validator 가 `analysis.rules.business_rules` 경로 가정 / 본 PoC analysis stage paradigm = top-level `rules` (carMgt 34) + `rules_step_4c_carcost` (carCost 22) **dual key** paradigm.
- 1차 RED = 12 critical findings `discovery.br_intent.unknown_br` → fix = business_rules 통합 array 신설 (additive / non-destructive) → GREEN.
- ★ ★ carry queue 등록 자격 = **validator dual-key 흡수** (methodology body 변경 cycle / self-referential drift 회피 / LL-codegraph-01 정합 / 외부 사용자 자연 요구 ≥ 1 trigger 의무).

**Drift #2 = schema regex paradigm vs analysis meaningful name paradigm**
- schema BR id pattern = `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` (3 segments + numeric suffix) / AP id pattern = `^AP-[A-Z0-9_-]+-[0-9]{3}$` (3-digit numeric suffix) — 모두 **numeric suffix 의무 paradigm**.
- 본 PoC analysis stage paradigm = **meaningful name** (BR-RBAC-PRIORITY / AP-EXTERNAL-SP-EXEC / 자연어 ID).
- 2차 RED = 18+ schema findings → fix = spec layer + business_rules 통합 array layer `-001` suffix 추가 (additive / 기존 `rules` array 보존 / cross-link 자산 영향 ❌) → GREEN.
- ★ ★ carry queue 등록 자격 = **schema regex 완화 또는 analysis stage paradigm enforcement** (별 cycle / 외부 사용자 trigger 의무).

**Drift 흡수 paradigm 본격 결단**:
- ✅ **외부 격리 layer 만 fix** (additive normalize / methodology body 변경 ❌) — LL-codegraph-07 + LL-codegraph-01 정합.
- ❌ **methodology body fix** (validator dual-key + schema regex 완화) — self-referential drift 위험 / 외부 자연 trigger 의무.
- carry queue = `C-validator-dual-key-businessrules` + `C-schema-regex-paradigm-completion` (별 cycle / Type 2 외부 사용자 trigger 의무).

**LL-poc-17-10: gate #1 revisit:analysis 첫 사내 trigger paradigm 본격 입증**
- 사용자 결단 chain (cluster 1 재작성 + cluster 3 F-RBAC-BYPASS-001 보안 invariant 의문 + cluster 4_5 D revisit:analysis) → ★ ★ chain harness round-trip paradigm 첫 사내 발동 입증.
- DEC-2026-05-06-round-trip-부분-허용 정합 — chain harness gate 안에서 정식 허용 (외부 자동 코드 생성 ❌ 정합).
- chain 1 산출물 = 본 시행 결과 frozen 자산화 (사실 누적) / chain 2 진입 = 본 session 안 ❌ / analysis stage 재진입 = 별 plan ladder 의제.
- ★ revisit 의제 정합: business_intent 재작성 + F-RBAC-BYPASS-001 보안 invariant 명세 + BR id naming convention paradigm 재검토 — analysis 단 통합 시행 자격 (chain 2 진입 자격 사전 충족 의무).

### 8.2 revert + 1원칙 재시작 trigger

★ ★ ★ 본 plan 의 **모든 산출물 frozen 보존** (revert ❌) — gate #1 stop revisit:analysis = chain 1 산출물 자체 retract 의미 ❌. fact 누적 (paradigm drift 2건 + UC 3 + BR 12 + source-grounded evidence 100% + cross_links 5축) 자산화 자격.

★ ★ 1원칙 재시작 trigger = **analysis stage 재진입 plan ladder** (별 plan.md / 본 plan 종결 후 사용자 결단 의제):
1. business_intent 재정합 (cluster 1 fix axis — domain_purpose 본격 재검토 + stakeholder 추가 + success_criteria 강화)
2. F-RBAC-BYPASS-001 보안 invariant 명세 (cluster 3 fix axis — analysis stage characterization + formal-spec 보강 + sessionId 부재 시 동작 명세)
3. BR id naming convention paradigm 재검토 (paradigm drift #2 fix axis — analysis baseline 56 BR rename vs schema regex 완화 결단)

### 8.3 LL-codegraph 정합 verify

- LL-codegraph-01 (self-referential drift 회피) ✅ — methodology body 변경 ❌ / validator + schema fix 모두 외부 layer.
- LL-codegraph-05 (live new project probe paradigm) ✅ — chain 1 discovery 첫 사내 live 본격.
- LL-codegraph-06 (layer 별 효용 분리 측정) ✅ — Java ⭐⭐⭐ vs sqlMap manual 분리 본격 측정.
- LL-codegraph-07 (사내 source 외부 위치 paradigm) ✅ — 본 산출물 디렉토리 안 source 사본 0건 verify.

---

## 9. 참고 / 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 — discovery stage 본격 진입
- DEC-2026-05-23-discovery-stage-v9 — discovery stage 재통합
- DEC-2026-05-26-discovery-spec-rename — `planning-spec` → `discovery-spec` rename
- DEC-2026-05-26-be-fe-산출물-분리 §1 — discovery = cross-cut 단일
- DEC-2026-05-26-input-skill-roles — analysis-from-* ↔ discovery-from-* timing 분리
- DEC-2026-05-29-sub-rule-v1.2.0-poc-17-corroboration — sub-rule §X-H v1.2.0
- LL-codegraph-07 — 사내 source 외부 위치 paradigm
- LL-v1000-01~05 — cooling-off paradigm 영구 폐기 / 즉시 진행 자격
- memory `feedback_dual_goal_migration_plus_plugin.md` — 듀얼 목표
- memory `feedback_db_always_on_policy.md` — K 정책 (DB 자산 always-on)
- memory `feedback_sp_to_code_conversion_policy.md` — SP 4 분류 (L 정책)
- memory `project_poc17_dogfooding.md` — poc-17 dogfooding scope
- ADR-CHAIN-001~002 — chain 1 이중 렌더링 + gate UX
- master plan `~/.claude/plans/a-stateful-gadget.md` §B chain 1

---

## 10. 4원칙 ladder 다음 단계

- **본 plan 종결 후 사용자 결단 묶음 6 (§5)** → 사용자 답변 → 2원칙 research (가벼운 sub-agent / Case 생략 + 시간 cap)
- **2원칙 research scope**:
  - discovery-from-analysis-output skill 절차 9 step 정합 verify (이미 §10 plan 안 read 완료 / sub-agent 재확인 의무 ❌ — 단순 cross-check)
  - PoC #15 사실 (iBATIS 2 sqlMap layer cover ❌) 본 plan car-list scope 영향 정량화 (sub-agent grep 5분 cap)
  - sub-rule §X-H v1.2.0 정합 (sub-rule 안 §X-H-11 AP-LEGACY-IBATIS2-DB-001~011 car-list scope 영향 측정 / sub-agent grep 5분 cap)
- **3원칙 사용자 승인** — 본 plan + research 묶음 보고 + 결단 6 확정 → 4원칙 시행 진입
- **4원칙 실패 시 revert** — Phase 1~5 어느 단계 실패 시 본 plan §8 LL 기록 + 1원칙 재시작
