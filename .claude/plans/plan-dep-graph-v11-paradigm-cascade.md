# plan-dep-graph-v11-paradigm-cascade

**작성일**: 2026-05-27 (session 49차 후속 / v11.0.0 MAJOR 후 carry-stop 흐름 일관 / 사용자 결단 = 옵션 a "drift 등록만 / stop")

**status**: ★ DONE (2026-05-27 후속) — 사용자 결단 "B, v11 페러다임 전체 추적되게 해줘" → carry 해제 + 구현 완료 (Cluster 1~4). §10 시행 결과 참조. release ❌ (doc trail) / 외부 citation regress 1건은 제 작업 무관. 4 갈림길 사용자 승인 = Epic/Story/OP 정식 노드 / contract leaf 엣지 / doc trail(release 보류) / poc-05만 corpus.

**(이전 status)**: CARRY-REGISTERED — carry queue `C-dep-graph-v11-paradigm-cascade` 등록. 본 plan = drift 카탈로그 + 재발동 조건 SSOT.

**relates to**:
- `ai-native-methodology/docs/dependency-graph.md` (단일 SSOT / DEC-2026-05-23-dep-graph-ssot-consolidation)
- `ai-native-methodology/schemas/artifact-graph-{node,edge}.schema.json`
- `ai-native-methodology/tools/{traceability-matrix-builder,graph-integrity-validator,code-pointer-validator,chain-driver}/`
- DEC-2026-05-23-dep-graph-p1-p4 (P1~P4 출시)
- DEC-2026-05-23-dep-graph-ssot-consolidation (SSOT 통합)
- DEC-2026-05-26-v11-paradigm-결단 (v11 8 결단)
- DEC-2026-05-26-discovery-spec-rename (planning → discovery)
- DEC-2026-05-26-be-fe-산출물-분리 (stage 별 axis)
- DEC-2026-05-26-ticket-plan-단일 (Epic/Story/OP-*/TASK-* 4-level)
- DEC-2026-05-26-contract-강제-양-axis (BE swagger / FE state-map+visual-manifest+DTCG)

---

## 1. 배경 (사실)

session 49차 후속 사용자 결단 — "현재 의존 그래프를 통한 산출물 추적 관련 페러다임이 잘 되어 있는지 확인해 보고 싶다" → 점검 시행.

dep-graph 인프라 자체는 v8.9.0 정식 출시 / v8.13.1 SSOT 통합 후 안정. release-readiness 22/22 ✅ (그 중 `#15 graph_integrity` + `#16 code_pointer_coverage` 모두 통과). 그러나 **v9.0.0 (discovery stage 신설) / v10.0.0 (plan stage / TASK-*) / v11.0.0 MAJOR (8 결단)** 의 paradigm cascade 가 dep-graph schema·synthesizer·docs 3 axis 모두에 흡수되지 않은 상태로 잔존.

**점검 방식**: schema 2종 (artifact-graph-node / -edge) + graph-synthesizer.js + docs/dependency-graph.md + 실측 graph 파일 (`examples/poc-05-sample-user-register/.aimd/output/artifact-graph.json`) 4 source 교차 검증.

**결론**: dep-graph 는 v2.0 시점 chain 5단계 (UC→BHV→AC→TC→IMPL) paradigm 위에 동결. 그 후 3 release 의 paradigm 진화 (5→6 stage / plan layer 분기 / BE/FE axis 분리 / 4-level entity cascade) = 미흡수.

---

## 2. 발견 사실 — drift 4종

### Drift 1 — v9.0.0 discovery stage 미흡수

| 위치 | 현재 상태 | v9.0.0 기대 |
|---|---|---|
| `schemas/artifact-graph-node.schema.json` `artifact_subkind` 설명 | "chain: UC\|BHV\|AC\|TC\|IMPL" (5종) | discovery 포함 6종 |
| `tools/traceability-matrix-builder/src/graph-synthesizer.js:71` | `CHAIN_SUBKINDS = Object.freeze(['UC','BHV','AC','TC','IMPL'])` | discovery subkind 추가 |
| `docs/dependency-graph.md` §1·§2 | "24개 Tier-1 artifact (chain **5** + analysis 15 + aspect 4)" / "chain instance: UC-* / BHV-* / AC-* / TC-* / IMPL-*" | chain 6+ |

### Drift 2 — v9.1.0~v10.0.0 plan stage / TASK-* 비대칭 반영

- `tools/traceability-matrix-builder/src/builder.js`: v9.2.0 (DEC-2026-05-25-axis-a-phase-4-3) 안 TASK layer **traceability matrix 행** 으로 추가됨
- 그러나 같은 builder workspace 내 `graph-synthesizer.js` 에 TASK 노드/엣지 합성 코드 **0** (`grep TASK|task-plan` empty)
- → **같은 chain 인데 matrix 와 graph 의 반영 axis 비대칭** (inconsistency)

### Drift 3 — v11.0.0 planning → discovery rename 미적용

- `graph-synthesizer.js`: 입력 변수명 `planning`, `sourcePaths.planning`, `planning?.use_cases` 그대로 (rename 미적용)
- `docs/dependency-graph.md` §4-1 CLI 예시: `--planning .aimd/output/planning-spec.json` (현재 CLI 는 backward-compat alias 유지로 통하나 SSOT docs 가 legacy 시그니처 노출 = drift 시그널)
- traceability-matrix-builder cli.js 도 `--planning` alias 만 보존 / `--discovery` primary 시그니처 미선언

### Drift 4 — v11.0.0 8 결단 미반영

| v11 결단 | dep-graph 반영 상태 |
|---|---|
| #2 BE/FE 산출물 분리 (stage 별 axis 다름) | graph 에 BE/FE dimension 부재 |
| #5 Epic = FE 화면 단위 | `artifact_subkind` enum 에 Epic 없음 |
| #6 Story = cross-cut anchor | Story 노드 없음 |
| #7 Jira Task level entity 매핑 (OP-* / TASK-*) | OP-* / TASK-* 노드 없음 |
| #8 contract 강제 양 axis (BE=swagger / FE=state-map+visual-manifest+DTCG) | edge_type 6종 enum 으로 contract axis 표현 X |

### 실측 graph 데이터 (drift 실증)

`examples/poc-05-sample-user-register/.aimd/output/artifact-graph.json`:
```
nodes=10 / edges=13
artifact_kind={chain:10}
artifact_subkind={UC:2, BHV:2, AC:2, TC:2, IMPL:2}
edge_type={derived_from:6, tests:2, implements:5}
discovery/TASK/OP/EPIC/STORY 노드 = 0
```

→ release-readiness corpus 자체가 v2.0 chain 5단계 시점 동결 데이터.

---

## 3. carry queue 등록 결단

**사용자 결단 (옵션 a)**: drift 신규 carry/plan 으로 등록만 / 본격 흡수 보류 / stop.

**carry id**: `C-dep-graph-v11-paradigm-cascade`

**근거 (carry-stop 채택)**:
1. dep-graph 인프라 자체는 working (release-readiness 22/22 ✅ 보존 의무)
2. paradigm cascade 흡수 = breaking 변경 (schema enum 확장 / synthesizer 재설계 / docs 재작성 / 5 PoC 재합성) → MINOR~MAJOR 자격 작업
3. 자연 trigger 부재 (현재 active 사용자 = 0 / "사내 배포 전 단계" / project_pre_deployment_stage memory 정합)
4. LL-codegraph-01 self-referential trigger 회피 일관성 (drift 발견 즉시 본격 흡수 ❌ / 사용자 결단 + 자연 trigger 의무)

**release ❌ / version 11.0.0 유지 / 자산 변경 = 본 plan + STATUS.md addendum 만**.

---

## 4. 재발동 조건 (carry 해제 자격)

다음 중 **하나 이상** 충족 시 본 carry 해제 결단 자격:

1. **외부 사용자 자연 요구 ≥ 1건** — PoC #02 등 다른 PoC 에 artifact-graph 합성 필요 발생 / 사용자가 `/dep-graph-navigator` 본격 사용 시
2. **v11.0.0 후속 MINOR release 시점에 paradigm cascade 묶음 자격 발생** — 예: ticket-sync skill 재설계 (v11.0.0 잔여 carry / Phase 2) 와 합산 시 dep-graph 진화 자연 결합
3. **plan stage 산출물 (task-plan) 의 5 PoC 모두 안착** 후 traceability-matrix 와 graph 비대칭 (drift 2) 이 신규 release-readiness 검증 실패로 표면화
4. **release-readiness `#15` 또는 `#16` 가 v11 paradigm 안 신규 정합 의무 발생** (예: BE TASK ↔ openapi_endpoint_ref ratchet `#15` 와 graph 안 OP-*/TASK-* 노드 부재 충돌)

위 4 조건 어느 것도 발생 안 하면 dep-graph 는 v2.0 시점 paradigm 으로 동결 유지 (working state 보존 우선).

---

## 5. 흡수 시 작업 scope (재발동 시 참조)

본 plan 자체는 시행 ❌. 단, 재발동 시 다음 scope 기대치 미리 명시:

### 5-1. schema 변경 (breaking)
- `artifact-graph-node.schema.json` `artifact_subkind` 설명/enum 확장: discovery + Epic + Story + OP + TASK 추가
- `artifact_kind` enum: 현재 3종 (`chain/analysis/aspect`) 유지 vs ticket layer 신설 결단

### 5-2. synthesizer 진화
- `graph-synthesizer.js` `CHAIN_SUBKINDS` 6+ stage 확장
- 입력 변수명 `planning` → `discovery` rename (backward-compat alias 유지 결단)
- TASK 노드/엣지 합성 추가 (builder.js v9.2.0 TASK layer 와 대칭)
- Epic/Story/OP-* 노드 합성 추가 (4-level cascade)

### 5-3. edge_type 진화 결단
- BE/FE axis 표현: 신규 edge_type vs 노드 속성 vs scope_id 분리 → 결단 의제
- contract 강제 양 axis (#8): `validates_contract` edge_type 신설 후보

### 5-4. docs 재작성
- `docs/dependency-graph.md` §1·§2 카운트 재산정 + chain instance 6+ stage 명시
- §4-1 CLI 예시 `--planning` → `--discovery` 정합
- §5 영향 등급 BFS 안 ticket layer cascade 영향 재검토

### 5-5. PoC corpus 재합성
- `poc-05` 의 artifact-graph.json 재합성 (release-readiness #15/#16 의무)
- task-plan 보유한 5 PoC 도 graph 합성 옵션 결단

### 5-6. 검증 의무
- workspace test 전수 통과
- release-readiness 22/22 유지 + 신규 가드 추가 후보 (예: graph 안 chain stage 6+ 의무)
- skill-citation 0 stale 유지

---

## 6. 자산화 LL 후보

- **LL-dep-graph-01** — "infrastructure 가 working 이라도 paradigm cascade 흡수 가 자동으로 따라오지 않는다" — schema/tool/docs 3 axis paradigm 진화 동기화 의무 시점 결단 필요
- **LL-dep-graph-02** — "release-readiness pass = paradigm-current 보장 ❌" — release-readiness corpus (PoC #05) 가 v2.0 chain 5단계 데이터로 동결되면 v11 drift 가 검증 통과해도 표면화 안 됨 / corpus 자체의 paradigm-currency 검증 의무 후보
- **LL-dep-graph-03** — "matrix 와 graph 비대칭 = 같은 input·도구·workspace 인데도 발생" — v9.2.0 TASK layer 가 builder.js 에 추가될 때 graph-synthesizer.js 동기 의무 빠진 사례 / 단일 workspace 안 일관성 가드 후보

---

## 7. STOP

본 plan = drift 4종 SSOT 등록 + carry 재발동 조건 명시. 본격 흡수 ❌ / release ❌ / 자산 변경 ❌. dep-graph 인프라 자체는 v2.0 chain 5단계 paradigm 위에서 working 유지.

§4 4 조건 중 ≥ 1 충족 시까지 carry queue `C-dep-graph-v11-paradigm-cascade` 보류.

→ **2026-05-27 후속**: 재발동 조건 1 (외부 사용자 자연 요구) 대신 **사용자 직접 결단 "B, 전체 추적되게 해줘"** 로 carry 해제 + 구현 착수. 이하 §8/§9.

---

## 8. DESIGN (사용자 승인 후 확정)

### 8-1. 노드 모델 (artifact-graph-node.schema.json)

- `artifact_kind` enum: `["chain","analysis","aspect"]` → **`+"plan"`** (4종).
- chain subkinds: `UC,BHV,AC,TC,IMPL` → **`+TASK`** = `UC,BHV,AC,TASK,TC,IMPL` (6 layer chain).
- plan subkinds (신규): `EPIC,STORY,OP`.
- 신규 노드 필드 **`layer`** (optional / enum = task-plan layer enum 정합: be/fe/db/e2e/infra + hexagonal 5종 legacy) — TASK 노드에 부여 (BE/FE axis = 노드 속성 / 그래프 폭증 회피 §2 사상 정합).

**노드 id 규약** (엔지니어링 결정 / 본 plan SSOT):
- Epic id = `epic_refs[].screen_id` (없으면 `jira_id`) — DEC #5 "Epic = FE 화면 단위" 정합. TASK.epic_ref 가 이 값과 일치.
- Story id = `STORY-<behavior_ref suffix>` (예: BHV-USER-001 → `STORY-USER-001`) — DEC #6 "Story = cross-cut anchor over BHV". Jira 비종속 내부 id. TASK.story_ref 가 이 값과 일치.
- OP id = `op_task_id` (OP-* canonical pattern 기존 보유).

### 8-2. 엣지 모델 (artifact-graph-edge.schema.json)

신규 edge_type 2종:
| edge_type | confidence | 의미 | leaf target? | base grade |
|---|---|---|---|---|
| `groups` | soft | 조직 layer 포함 (Epic→Story / Story→TASK / OP→TASK) | no | SHOULD |
| `conforms_to` | hard | artifact → contract 산출물 (TASK/TC → openapi/component/visual) | **yes** (implements 처럼 leaf 예외) | MUST |

chain forward (TASK 삽입)은 기존 `derived_from` 재사용:
- `AC → TASK` (task.ac_refs) / `TASK → TC` (task.tc_refs).
- TC 가 task 에 의해 covered 면 직접 `AC → TC` shortcut 억제 (matrix-builder taskByAC 정합 / task-plan 부재 시 AC→TC fallback 보존 = backward compat).

### 8-3. contract leaf id 합성 (conforms_to target)
- openapi: `contract:openapi:<METHOD> <path>` (예: `contract:openapi:POST /users`)
- component: `contract:component:<package>/<name>`
- visual: `contract:visual:<screen>`

### 8-4. 영향 범위 (cascade 지점)
1. `schemas/artifact-graph-node.schema.json` — enum + layer 필드
2. `schemas/artifact-graph-edge.schema.json` — edge_type enum +2
3. `tools/traceability-matrix-builder/src/graph-synthesizer.js` — TASK/plan 노드 합성 + groups/conforms_to 엣지 + rename + stats + catalog
4. `tools/traceability-matrix-builder/src/cli.js` — `--discovery` + `--task-plan` (+ `--planning` alias 보존)
5. `tools/chain-driver/src/impact-analyzer.js` — HARD/SOFT set + DEFAULT_BASE_GRADE_MAP +2
6. `tools/graph-integrity-validator/src/validator.js` — leaf 예외에 `conforms_to` 추가
7. `skills/dep-graph-navigator/SKILL.md` — subkind 표기
8. `docs/dependency-graph.md` — §1 count + §2 노드/엣지 표 + §4 CLI + §5
9. `examples/poc-05-sample-user-register/.aimd/output/task-plan.json` — v11 완전체 enrich (showcase + corpus)
10. 각 도구 test fixture (v11 엔티티 전수 합성)

---

## 9. Implementation clusters (각 단계 test green 유지)

- **Cluster 1** — chain TASK layer + discovery rename: synthesizer TASK 노드 + AC→TASK→TC + layer 속성 + planning→discovery alias + cli --task-plan / schema node +TASK +layer / poc-05 task enrich (tc_refs + layer=be) / synthesizer test. → drift 1·2·3 해소.
- **Cluster 2** — plan 조직 노드: Epic/Story/OP 노드 + groups 엣지 / schema node +plan kind +EPIC/STORY/OP / schema edge +groups / impact +groups soft / poc-05 epic_refs·story_refs·op_task_refs enrich / test.
- **Cluster 3** — contract conforms_to leaf: synthesizer contract 엣지 / schema edge +conforms_to / integrity leaf 예외 / impact +conforms_to hard / poc-05 openapi_endpoint_ref·openapi_contract_ref enrich / test.
- **Cluster 4** — docs/dependency-graph.md 재작성 + release-readiness 22/22 검증 + STATUS/plan 종결 기록.

---

## 10. 시행 결과 (2026-05-27 종결 / Cluster 1~4 완료)

**상태**: ★ DONE — Cluster 1~4 전부 시행. dep-graph 가 v11 paradigm 전체 추적. release ❌ (사용자 결단 doc trail) / version 11.0.0 유지.

**변경 파일 (dep-graph 본체)**:
- `tools/traceability-matrix-builder/src/graph-synthesizer.js` — TASK chain layer + Epic/Story/OP plan 노드 + groups/conforms_to 엣지 + planning→discovery alias + layer 속성 + stats(by_kind.plan / ALL_EDGE_TYPES) + TIER1_CATALOG 25.
- `tools/traceability-matrix-builder/src/cli.js` — `--discovery`/`--task-plan`/`--operational-task` (+ `--planning` alias).
- `tools/chain-driver/src/impact-analyzer.js` — HARD/SOFT set + DEFAULT_BASE_GRADE_MAP (conforms_to=MUST / groups=SHOULD).
- `tools/chain-driver/src/centrality.js` — EDGE_WEIGHT (conforms_to=1.0 / groups=0.5).
- `tools/graph-integrity-validator/src/validator.js` — leaf 예외에 conforms_to 추가.
- `schemas/artifact-graph-node.schema.json` — artifact_kind +plan / subkind +TASK·EPIC·STORY·OP / +layer 필드.
- `schemas/artifact-graph-edge.schema.json` — edge_type +conforms_to·groups (8종).
- `skills/dep-graph-navigator/SKILL.md` + `docs/dependency-graph.md` — §1/§2/§4/§5 v11 정합.
- test: `graph-synthesizer.test.js` (+11 v11 test / 57 pass) + `impact-analyzer.test.js` (EDGE_TYPE_CATALOG 5/3).
- `examples/poc-05-sample-user-register/.aimd/output/task-plan.json` — v11 완전체 enrich (tc_refs + layer=be + story/op ref + openapi_endpoint_ref + epic_refs/story_refs/op_task_refs + code_pointers_na) → 재합성 그래프 nodes=16(chain 12 + plan 4)/edges=23(conforms_to 2 + groups 6).

**검증 (제 변경 기준 green)**:
- workspace test 756 pass (dep-graph 4 도구 + synthesizer 57 전수 pass).
- release-readiness: `graph_integrity ✅`(nodes=16/edges=23/cycle=orphan=unknown=0) + `code_pointer_coverage ✅`(100% / na=8) + `be_task_openapi_ref_ratchet ✅`.
- e2e 실증: STORY-USER-001 navigate → SHOULD(Epic SCREEN-AUTH + TASK) / FYI(TC) — 조직 layer 영향 추적 동작. conforms_to leaf(openapi) 무결성 통과.

**★ 외부 in-flight 변경 caveat (제 작업 무관)**: `methodology-spec/finding-system.md` + `schemas/figma-extract.schema.json` + `.claude/plans/plan-jira-standard-and-voc-routing.md` 3파일이 session 중 외부/병렬 수정됨 (figma source-grounding feature). 그 중 finding-system.md:911 의 `mis-fe-admin/docs/specs/eam-integration-authority.md` 외부 evidence 참조가 repo-path 로 파싱되어 `skill_citation_integrity` + `workspace_test_pass`(skill-citation test 1 fail) 2 게이트 regress. **dep-graph 작업과 무관 / 미수정 (타 작업 collision 회피)** — 사용자 결단 대기.
