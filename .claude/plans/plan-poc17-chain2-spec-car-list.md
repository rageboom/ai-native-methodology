# plan-poc17-chain2-spec-car-list

> **세션 54차 — 4 번째 plan ladder** (직전 = `plan-validator-dual-key-fix.md` § v11.5.1 PATCH 종결 / paradigm A 본격 강화 self-입증 종결).
> **4원칙 1단계** (깊이 숙지 종결 / chain 1 산출물 + spec skill 본문 + behavior-spec/AC schema 본격 read 종결).
> **paradigm 정합** — LL-codegraph-07 (사내 source 외부 위치 / 본 레포 commit ❌) + [[feedback_dual_goal_migration_plus_plugin]] (듀얼 목표) + [[feedback_self_recorded_fact_validation]] (Phase 2 pre-fix 실측 entry fixture 의무) + chain 1 산출물 frozen 보존.

---

## 1. 목적 / scope

### 1.1 trigger 사실

세션 54차 v11.5.1 PATCH 종결 후 사용자 결단 = "chain 2 spec 진입 (car-list pilot / 추천)". 자연 trigger:
- chain 1 forward 자격 자연 충족 (session 54차 발견 = 본 PoC pre-fix 도 GREEN / discovery-extraction-validator 0 findings + schema-validator 0 invalid)
- 듀얼 목표 정합 — 마이그레이션 본격 진전 + chain harness paradigm 본격 입증 (chain 2 spec stage 첫 사내 live)
- self-referential drift 회피 paradigm 본격 enforce (methodology body 변경 ❌ / 외부 디렉토리 산출 axis 자연)

### 1.2 scope-in (★ ★ car-list pilot 한정 / chain 2 spec stage)

- 본 PoC 6 화면 중 **#1 car-list** 만 (★ pilot)
- chain 1 산출물 frozen 보존 + chain 2 산출물 신규 신설:
  - `behavior-spec.{json,md}` (BHV-* 본격 분해 / UC → BHV 1:N forward link)
  - `acceptance-criteria.{json,md}` (AC-* Gherkin BDD / BHV → AC + verifiable=true 의무)
  - `behavior-diagrams.mermaid` (★ ADR-008 v2 §10 / 통합 view)
- formal-spec 자산 backward link (rbac-3-branch.md + rbac-with-sessionid-bypass.mermaid)
- chain-intervention-log.jsonl append (chain 2 진행 사실)

### 1.3 scope-out

- ★ 화면 #2~#6 (car-drive-log / car-cost-confirm / car-cost-calculate / car-cost-nolog / car-cost-statement) = 별 cycle 자격 자연
- chain 3 test stage 진입 = 별 plan ladder (chain 2 gate #2 go 결단 후)
- methodology body 변경 ❌ (self-referential drift 회피 paradigm 본격 enforce)
- 본 PoC 통합 array 자연 폐기 = 별 cycle (선택적)
- FE layer (JSP 14 + 신규 stack 결단 미정) = 본 plan scope 본격 결단 의제 (§5 결단 본격 본격 의무)

---

## 2. 입력 (frozen)

### 2.1 chain 1 산출물 (외부 절대경로 / read-only)

| 자산 | 본문 사실 | 본 plan 활용 |
|---|---|---|
| `~/.../poc-17-ifrs-car-migration/.aimd/output/discovery-spec.{json,md}` | UC 3 (CAR-001~003 / 모두 name + description + preconditions + postconditions 본격 본문) + BR-INTENT 12 + cross_links 5축 + decisions 6 (placeholder) + out_of_scope 8 + risks 7 | UC backward link + BR-INTENT → BHV.related_brs[] 본격 |
| `~/.../business-rules.json` | 12 car-list bound BR (rules 34 + rules_step_4c_carcost 22 + business_rules 56 통합) | BR 본문 backward link |
| `~/.../domain.json` | BC-CAR-MGT (stakeholders 5 + business_intent_summary / session 53차 보강) | domain reference |
| `~/.../decision-tables/rbac-3-branch.md` | UC-CAR-003 RBAC 3 분기 | BHV.decision_table_ref 본격 |
| `~/.../sequence-diagrams/rbac-with-sessionid-bypass.mermaid` | BR-CARLIST-RBAC-FILTER-001 + F-RBAC-BYPASS-001 sessionId 부재 path | BHV.sequence_ref 본격 |
| `~/.../characterization-spec.json` | CHAR-010-RBAC-BYPASS rationale + 4 attack paths | BHV.invariants 보강 source |
| `~/.../findings/F-RBAC-BYPASS-001.md` | session 53차 본격 신설 본문 (4 attack paths + chain 2 AC-CAR-003 forward 명세 의무) | AC-CAR-003 security 본격 enforce |

### 2.2 본 레포 (SSOT)

| 자산 | 본 plan 활용 |
|---|---|
| `skills/spec-compose-behavior-spec/SKILL.md` | chain 2 진입 skill 본문 (BHV 5 필드 + property_tests + UC→BHV 1:N) |
| `skills/spec-derive-acceptance-criteria/SKILL.md` | AC Gherkin + verifiable=true + MoSCoW + layer (BE/FE) 의무 |
| `skills/spec-integrate-deliverables/SKILL.md` | cross_links.to_analysis_artifacts 등록 |
| `schemas/behavior-spec.schema.json` | BHV 필수 (`meta` + `derivation_source` + `behaviors[]` / behavior item = `id` + `name` + `description` + `preconditions` + `postconditions` + `invariants` + `state_transition_ref` + `decision_table_ref` + `sequence_ref` + `property_tests` + `use_case_refs` + `acceptance_criteria_refs` + `br_refs` + `source_grounded_evidence` + `code_pointers`) |
| `schemas/acceptance-criteria.schema.json` | AC 필수 (`meta` + `derivation_source` + `criteria[]` / AC item = `id` + `gherkin` + `severity` + `verifiable` + `test_case_refs` + `automated_runnable` + `layer` + `story_ref` + contract refs by layer) |
| `templates/spec/behavior-spec.template.{json,md}` + `acceptance-criteria.template.{json,md}` | scaffold source |

---

## 3. 산출물 (외부 디렉토리 / 본 레포 commit ❌)

### 3.1 1차 산출물 (chain 2 본격)

| 산출물 | 위치 | 본격 본문 |
|---|---|---|
| `behavior-spec.json` | 외부 (신규) | BHV ≥ 3 (UC 3 = 1:1 minimum) / 1 UC 복합 시 1 UC = N BHV / 5 필드 본격 채움 (preconditions / postconditions / invariants / state_transition_ref / decision_table_ref / sequence_ref / property_tests) + source_grounded_evidence + UC 본격 backward link + AC forward link + BR-INTENT 본격 backward link |
| `behavior-spec.md` | 외부 (신규) | 사람 눈 (BHV 본문 본격 본문 narrative + diagram 인용) |
| `acceptance-criteria.json` | 외부 (신규) | AC ≥ 6 (BHV ≥ 3 / BHV 1 = 1+ AC = happy + edge + negative) / Gherkin BDD 본격 / verifiable=true 의무 (test_case_refs placeholder 본격) / severity (BR-INTENT criticality 매핑) / moscow (MUST 본격 default) / layer (BE / FE / cross-cut 본격 결단) |
| `acceptance-criteria.md` | 외부 (신규) | Gherkin block 본문 |
| `behavior-diagrams.mermaid` | 외부 (신규) | BHV state-machine + sequence 통합 view (★ ADR-008 v2 §10) |
| `chain-intervention-log.jsonl` (append) | 외부 | chain 2 진행 사실 + validator 결과 record |

### 3.2 2차 산출물 (본 레포 / 자연 commit 자격)

| 산출물 | 위치 | 조건 |
|---|---|---|
| 본 plan.md | `.claude/plans/plan-poc17-chain2-spec-car-list.md` | 본 plan 자체 (★ 본격 자연 commit) |
| LL-poc-17-16~19 (★ 본 plan 결과 종결 시점 자산화) | 본 plan §8 | 시행 결과 종결 후 본격 자산화 |
| memory `project_poc17_dogfooding.md` 갱신 | `~/.claude/projects/.../memory/` | chain 2 진행 사실 누적 |

★ ★ ★ **외부 산출물 = 본 레포 commit ❌** (LL-codegraph-07 정합).

---

## 4. 절차 (chain 2 spec stage / 4 phase)

### Phase 1. BHV 분해 + 본격 본문 채움

#### 1.1 UC → BHV mapping (★ ★ 본격 핵심 결단)

UC 3 분석:

| UC | name | actor / 복잡도 | BHV 분해 후보 |
|---|---|---|---|
| UC-CAR-001 | 차량 목록 페이지 진입 | User / 단순 (JSP 진입 + 5 필터 필드 + paginationInfo 초기화) | ★ BHV-CAR-001 (single / page-entry + filter-field-init) |
| UC-CAR-002 | 차량 목록 AJAX 부분 갱신 | User / 중복 (filter post + paging + result render) | ★ BHV-CAR-002 (single) 또는 BHV-CAR-002a (filter validation) + BHV-CAR-002b (paginated query) + BHV-CAR-002c (response render) — 본격 결단 의무 |
| UC-CAR-003 | RBAC 3 분기 사용자 임기 join 조회 | User-CarAdmin / User-Secretary / User-Normal / ★ ★ 본격 복합 (RBAC 3 분기 + sessionId 부재 path + INNER JOIN filter) | ★ ★ BHV-CAR-003 (★ ★ 본격 분해 의무): BHV-CAR-003a (admin: 전체 차량 노출) + BHV-CAR-003b (secretary: 담당 임원 매핑 / STUFF FOR XML PATH) + BHV-CAR-003c (normal: 본인 차량 only) + BHV-CAR-003d (★ sessionId 부재 path / fail-open invariant) |

★ ★ **결단 의제 1 (§5)**: UC-CAR-002 + UC-CAR-003 BHV 분해 본격 scope 결단 (single vs multiple).

#### 1.2 BHV 5 필드 본격 채움

각 BHV:
- `preconditions` — UC.preconditions + BR-INTENT 본격 통합 (formal expressions)
- `postconditions` — UC.postconditions 본격 / DB 변경 시 invariant 본격
- `invariants` — F-RBAC-BYPASS-001 sessionId 부재 invariant 본격 (★ BHV-CAR-003d 본격 본문) + characterization-spec INV-RBAC-06 본격 backward link
- `state_transition_ref` — car-list = lifecycle 부재 자연 (cost-lifecycle 자산 ❌) → ★ 본 plan 의제 = state_machine 자산 부재 사실 명시 본격
- `decision_table_ref` — `decision-tables/rbac-3-branch.md` (★ UC-CAR-003 본격)
- `sequence_ref` — `sequence-diagrams/rbac-with-sessionid-bypass.mermaid` (★ BHV-CAR-003d 본격)
- `property_tests[]` — BR-CARLIST-RBAC-FILTER property test stub (★ chain 3 generate / 본 plan = placeholder)

#### 1.3 source_grounded_evidence 본격 의무

각 BHV ≥ 1 evidence (★ AI fabrication 차단 / discovery-extraction-validator equivalent paradigm 본격). 자산 source = chain 1 UC.source_grounded_evidence 본격 자연 carry.

### Phase 2. AC Gherkin BDD 본격 산출

#### 2.1 BHV → AC mapping (★ BHV 1 = 1+ AC 의무)

각 BHV:
- ≥ 1 happy path AC (★ 본격 default)
- ≥ 1 edge case AC (★ pagination boundary / filter 결과 0건 등)
- ≥ 1 negative path AC (★ sessionId null / 권한 부재 / DB error)

★ ★ 결단 의제 2 (§5): AC severity 분포 본격 결단 (MUST default vs SHOULD/COULD 비율).

#### 2.2 layer 분류 (★ v11.0.0 paradigm)

각 AC = `layer` 본격:
- **BE** (default 본격 본 PoC) — `openapi_path` + `operationId` 본격 (★ openapi.yaml 28 endpoint backward link)
- **FE** — `state_map_ref` + `dtcg_token_ref` + `visual_manifest_ref` 본격 (★ 신규 stack 결단 미정 → 본 chain 2 scope 결단 의제)
- **cross-cut** — BE+FE 통합 (Story anchor / chain plan stage 본격)

★ ★ ★ 결단 의제 3 (§5): 본 chain 2 = BE-only 본격 vs BE+FE 양 axis 본격 본격 결단 의무.

#### 2.3 verifiable=true 의무 + test_case_refs placeholder

각 AC `verifiable=true` 의무 (★ chain 3 forward link). `test_case_refs` = `["TC-CAR-{NNN}-001"]` placeholder 본격 (★ chain 3 generate-test-spec 시 backward 채움).

#### 2.4 security_invariant AC 본격 (★ F-RBAC-BYPASS-001 정합)

★ ★ AC-CAR-003 본격 본문 = sessionId null path 본격 명세 의무 (★ chain 1 진입 시 plan §1.2 명시 "chain 2 AC-CAR-003 보안 invariant 명세 의무" 본격 정합):
- `severity: critical`
- `gherkin.given`: "sessionId 가 NULL 또는 undefined 상태"
- `gherkin.when`: "User 가 /carList AJAX 호출"
- `gherkin.then`: "reject 또는 default 분기 적용" + "전체 차량 노출 path ❌"

### Phase 3. behavior-diagrams.mermaid 통합 렌더

BHV state-machine + sequence 통합:
- car-list = lifecycle 부재 자연 → state-machine subgraph 부재 본격 명시
- RBAC 3 분기 sequence = `sequence-diagrams/rbac-with-sessionid-bypass.mermaid` reference (본격 inline 통합 또는 link only 결단 의제)

### Phase 4. 자동 검증 + gate #2

#### 4.1 validator 3종 본격 실행

```bash
# chain coverage (UC → BHV / BHV → AC)
node tools/chain-coverage-validator/src/cli.js \
  --discovery .aimd/output/discovery-spec.json \
  --behavior  .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json

# behavior chain 2 drift
node tools/drift-validator/src/cli.js .aimd/output/behavior-spec.json

# formal-spec link chain mode
node tools/formal-spec-link-validator/src/cli.js .aimd/output/ --chain-mode

# schema (behavior + AC + discovery 정합)
node tools/schema-validator/src/cli.js \
  .aimd/output/behavior-spec.json \
  .aimd/output/acceptance-criteria.json

# spec-test-link (★ test_case_refs placeholder 정합 / chain 3 forward link)
node tools/spec-test-link-validator/src/cli.js \
  --behavior   .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json
```

★ ★ **본 Phase 2 pre-fix 실측 entry fixture 의무 정합** ([[feedback_self_recorded_fact_validation]]) — validator RED 발견 시 = ★ self-기록 narrative 사실 검증 fixture 본격 본격 본격 의무 (state mutation evidence 부재 narrative = STOP signal).

#### 4.2 gate #2 (cluster 5~6 / 사용자 결단)

- BHV 분해 + AC Gherkin 정확성 사용자 검토
- AC-CAR-003 보안 invariant 본격 명세 정확성 사용자 검토
- chain 3 test stage 진입 자격 = AC verifiable=true 100% + test_case_refs placeholder 본격 정합
- 다음 결단 = (a) chain 3 진입 / (b) 본 PoC 차기 화면 (car-drive-log) chain 1 진입 / (c) 본 session 종결

---

## 5. 사용자 승인 묶음 (3원칙 / 5 핵심 결정)

### 결단 1. BHV 분해 scope

- **A. UC-CAR-001 single + UC-CAR-002 single + UC-CAR-003 본격 분해 (3a/3b/3c/3d 4종)** ★ 추천 — UC-CAR-003 RBAC 본격 복합 (3 actor + sessionId 부재 path) = 본격 분해 자격 자연 본격
- B. 모두 single (BHV 3 = UC 1:1) — minimum scope / property_tests 본격 부족 risk
- C. 모두 본격 본격 분해 (BHV ≥ 7) — scope 부풀림 risk

### 결단 2. AC severity 분포

- **A. MUST 우선 (≥ 70%) + SHOULD (≤ 20%) + COULD (≤ 10%)** ★ 추천 — release 본격 자격 paradigm 정합 (MoSCoW 본격)
- B. MUST 100% — release 자격 본격 strict (단 verifiable=false 본격 자격 없음)
- C. 자연 분포 (BR-INTENT criticality 본격 1:1 매핑) — case-by-case 결단

### 결단 3. layer 결단 (★ ★ v11.0.0 BE/FE 분리 paradigm)

- **A. BE-only 본격** ★ 추천 — 본 PoC 신규 stack 결단 미정 / FE layer = 별 cycle / chain plan stage 본격 진입 시 본격 결단
- B. BE+FE 양 axis — FE state_map_ref + dtcg_token_ref + visual_manifest_ref 본격 산출 (★ 신규 stack 결단 본격 의무 / 본 plan scope 부풀림 risk)
- C. cross-cut anchor (Story 본격) — chain plan stage 본격 사전 진입 risk

### 결단 4. behavior-diagrams.mermaid 본문 paradigm

- **A. inline 통합 (모든 BHV diagram 본문 본격 통합)** ★ 추천 — 사람 눈 단일 view (★ ADR-008 v2 §10 정합)
- B. link only (각 BHV 의 state_machine + sequence_ref 만 link / 통합 view ❌) — 산출 시간 단축 / 사람 눈 navigate 부담

### 결단 5. gate #2 결과 후 다음 cycle

- **A. 본 plan 종결 후 사용자 검토 후 결단** ★ 추천 — 본 plan §4 Phase 4 cluster 본격 본격
- B. 본 plan 안 chain 3 진입 통합 — scope 부풀림 risk
- C. 본 session 종결 (chain 2 시행 만 / chain 3 = 별 session)

---

## 6. 위험 / 제약

| ID | 위험 | severity | 완화 |
|---|---|---|---|
| R-001 | UC-CAR-002 + UC-CAR-003 BHV 분해 scope 결단 시점 over-engineer 위험 | medium | 결단 1.A 본격 (UC-CAR-003 만 본격 분해 / UC-CAR-002 single 본격) |
| R-002 | AC verifiable=false 비율 초과 (10% over) | low | 결단 2.A MoSCoW 본격 strict / chain-coverage-validator 자동 차단 |
| R-003 | FE layer scope 부풀림 (신규 stack 결단 미정 시 본격 산출 ❌) | medium | 결단 3.A BE-only 본격 / FE = 별 cycle 본격 |
| R-004 | behavior-diagrams.mermaid 본문 ≥ 100 cell 시 subgraph 분할 의무 (sp3-c1 carry) | low | car-list scope = cell ≤ 30 추정 / subgraph 부재 자연 |
| R-005 | ★ ★ self-referential drift 회피 paradigm 위반 (chain 2 시행 시 methodology body 변경 trigger) | medium | 본 plan §1.3 scope-out 본격 enforce / 외부 디렉토리 산출 axis 본격 |
| R-006 | validator RED 발견 시 사실 검증 부족 cycle 위험 ([[feedback_self_recorded_fact_validation]] 본격 정합) | medium | Phase 4.1 validator RED 시 = state mutation evidence 본격 record 의무 + self-narrative 사실 검증 본격 entry fixture |
| R-007 | session 안 4 release cap (LL-v930-02) | low | 본 plan 시행 결과 = release ❌ 자연 (외부 산출물 만 / 본 레포 commit ❌) |

---

## 7. 검증 (4원칙 STOP-3 정합)

### 7.1 외부 산출물 검증

- behavior-spec.json 본격 산출 ✅
- acceptance-criteria.json 본격 산출 ✅
- behavior-diagrams.mermaid 본격 산출 ✅
- chain-intervention-log.jsonl append ✅
- validator 5종 본격 실행 (chain-coverage / drift / formal-spec-link / schema / spec-test-link) → 모두 GREEN 의무
- ★ Phase 2 pre-fix 실측 entry fixture 본격 ([[feedback_self_recorded_fact_validation]])

### 7.2 본 레포 axis (영향 0)

- workspace test 영향 0 (본 plan = 외부 작업 / methodology body 변경 ❌)
- release-readiness 21/22 보존 ✅
- skill-citation 0 stale ✅
- version 3-way 11.5.1 유지 (release ❌)

---

## 8. Lessons Learned (★ 본 plan 종결 시점 자산화 / 후보)

LL-poc-17-16~19 본격 후보 (시행 결과 종결 시점 자산화 의무):

- **LL-poc-17-16** — chain 2 spec stage 첫 사내 live paradigm 본격 입증 (chain harness paradigm 본격 진전 / R1' axis 5번째 corroboration 후보)
- **LL-poc-17-17** — UC 복합 분해 paradigm 본격 (UC-CAR-003 RBAC 3 actor + sessionId 부재 path = 본격 분해 자격 자연 / 단순 CRUD vs 본격 복합 분해 criterion 본격)
- **LL-poc-17-18** — security_invariant AC chain 1 → chain 2 forward link paradigm 본격 (F-RBAC-BYPASS-001 finding → AC-CAR-003 본격 명세 cycle 완성 본격 사례)
- **LL-poc-17-19** — chain 2 산출물 cross-link 5축 본격 정합 paradigm (UC.acceptance_criteria_refs → AC.id / BHV.use_case_refs → UC.id / BHV.acceptance_criteria_refs → AC.id / AC.behavior_ref → BHV.id / AC.test_case_refs → TC.id placeholder)

---

## 9. 참고 / 인용

- 직전 plan ladder = `.claude/plans/plan-validator-dual-key-fix.md` (v11.5.1 PATCH / paradigm A 본격 강화 self-입증 종결)
- chain 1 산출물 = `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/discovery-spec.{json,md}` (frozen)
- skill SSOT = `skills/spec-compose-behavior-spec/SKILL.md` + `skills/spec-derive-acceptance-criteria/SKILL.md`
- schema SSOT = `schemas/behavior-spec.schema.json` + `schemas/acceptance-criteria.schema.json`
- template SSOT = `templates/spec/behavior-spec.template.{json,md}` + `acceptance-criteria.template.{json,md}`
- ADR-CHAIN-001 (chain 단계 paradigm) + ADR-008 v2 (이중 렌더링 / behavior-diagrams.mermaid 통합 view)
- DEC-2026-05-26-be-fe-산출물-분리 (v11.0.0 layer paradigm)
- [[feedback_self_recorded_fact_validation]] — paradigm-level fix plan Phase 2 entry fixture
- [[feedback_dual_goal_migration_plus_plugin]] — 듀얼 목표

---

## 10. 4원칙 ladder 다음 단계

- **1원칙 종결** ✅ (본 plan.md / 깊이 숙지 종결 + 입력 frozen + 산출 본격 정의)
- **2원칙 research** = 가벼움 (이미 skill 본문 + schema 본문 본격 read 종결 / sub-agent 본격 부재 axis 자연)
- **3원칙 사용자 승인** = §5 결단 5 묶음 보고 (본격 시행 전 본격 확정 의무)
- **4원칙 실패 시 revert** = §6 R-001~007 정합 / 어느 axis 라도 self-referential drift 발생 시 revert + LL 기록 + 1원칙 재시작
