# Ticket Binding Policy (외부 일감 시스템 연동)

> ai-native-methodology plugin 의 chain harness 산출물 ↔ 외부 ticket 시스템 (Jira / Linear / GitHub Issues / Asana / Azure DevOps) 매핑 정책.
> 권고 (validator 강제 X).

---

## 1. 결단 요약

| 항목                 | 결정                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| Ticket 단위          | **UC = Story** (Plugin 의 UC ID 가 grep-hit 검증된 유일 단위 = Jira Story 의 사용자 가치 단위 정합) |
| Ticket 생성 시점     | **Chain 1 종료 시점** (discovery-spec.json schema-valid + grep-hit 증거 확보 직후)                  |
| 상위 단위            | Domain = Epic / 분석 stage 결과 = Initiative                                                        |
| 하위 단위 (선택)     | Chain stage 4개 = Sub-task                                                                          |
| BHV / AC / TC / IMPL | **별도 ticket X** — Story 본문에 link / 또는 sub-task acceptance criteria                           |
| 강제력               | 권고만 / validator 강제 X / `ticket_ref` field optional                                             |

---

## 2. Layer 매핑

```
Initiative          ← 분석 stage 산출물 (inventory + architecture + sql-inventory + antipatterns)
  └── Epic          ← Domain (car/, payroll/, mainpay/ …)
        └── Story   ← UC-{도메인}-{번호}
              └── Sub-task    ← chain1_planning / chain2_spec / chain3_test / chain4_impl
```

---

## 3. 시점별 활동 (Plugin chain 진행 동기)

| Stage             | Ticket 활동                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| **Analysis 종료** | Initiative 생성 / Domain 별 Epic batch 생성 / Antipattern P0 = Tech Debt Story 별도 생성 (횡단)                |
| Chain 1 시작      | (Epic 1개 in-progress / 도메인 결정)                                                                           |
| **Chain 1 종료**  | **discovery-spec.json 의 use_cases[] 각각 = Story 생성** + 각 Story 에 sub-task 4개 batch 생성 (chain1 = done) |
| Chain 2 종료      | Story 의 chain2 sub-task done / BHV/AC 본문 link 갱신                                                          |
| Chain 3 종료      | chain3 sub-task done / RED test evidence 첨부                                                                  |
| Chain 4 종료      | chain4 sub-task done / GREEN evidence 첨부 / **Story close**                                                   |
| 도메인 전체 종료  | Epic close                                                                                                     |
| Initiative 종료   | 마이그레이션 완료                                                                                              |

---

## 4. Traceability matrix 연동

`schemas/traceability-matrix.schema.json` 의 matrix item 에 `ticket_ref` optional field:

```json
{
	"use_case_id": "UC-CAR-007",
	"status": "green",
	"ticket_ref": {
		"platform": "jira",
		"id": "MIG-1234",
		"url": "https://company.atlassian.net/browse/MIG-1234",
		"epic_id": "MIG-1000",
		"initiative_id": "MIG-1",
		"subtask_ids": {
			"chain1_planning": "MIG-1235",
			"chain2_spec": "MIG-1236",
			"chain3_test": "MIG-1237",
			"chain4_impl": "MIG-1238"
		}
	}
}
```

field 모두 optional — ticket 시스템 사용 안 하는 PoC 는 그대로 omit (회귀 영향 0).

---

## 5. 권장 ticket summary 형식

| Ticket 유형             | Summary 형식                                                | Description 본문                                                                           |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Initiative              | `[MIG] {프로젝트} legacy → {target stack} 전환`             | analysis 산출물 4종 요약 + R# carry                                                        |
| Epic                    | `[MIG/{domain}] {도메인} 마이그레이션`                      | inventory / architecture / sql-inventory 의 해당 domain 부분                               |
| **Story**               | `[UC-{도메인}-{번호}] {use_case.name 또는 description 1줄}` | discovery-spec.json 의 use_case 본체 + source_grounded_evidence + acceptance_criteria_refs |
| Sub-task                | `chain{N}/{stage_name} — {UC ID}`                           | (e.g., `chain1/planning — UC-CAR-007`)                                                     |
| Tech Debt Story (AP P0) | `[AP-{cat}] {antipattern.name}`                             | antipatterns.json 의 AP 본문                                                               |
| Spike (BR)              | `[BR-{도메인}-{이름}] 정책 결단`                            | rules.json BR 본문 + 도메인 전문가 위임                                                    |

---

## 6. BHV / AC / TC / IMPL 별 별도 ticket 금지 사유

다음 이유로 별도 ticket 만들지 마세요:

1. **폭증 위험**: 1 UC 당 N BHV × M AC × K TC × L IMPL = Story 1개당 ticket 수십~수백
2. **중복 정보**: Plugin 의 chain-coverage-validator 가 이미 backward link 의무 / traceability matrix 가 모든 link 추적 = ticket 시스템과 1:1 중복
3. **process vs artifact 영역 분리**: BHV/AC/TC/IMPL = artifact 영역 (chain harness 내) / Story = sub-task = process 영역. 섞으면 ticket 시스템이 artifact store 로 오용
4. **변동 위험**: chain 2 진행 중 BHV/AC 가 추가/변경 = ticket update 빈도 폭증

권장: BHV/AC/TC/IMPL ID 는 **Story description 또는 sub-task acceptance criteria 에 link 만** — ticket 자체 X.

---

## 7. 예외 케이스 — 별도 ticket 권장

| Case                         | Ticket 유형                   | 이유                                                                          |
| ---------------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| Antipattern P0 회피 작업     | Tech Debt Story (Epic 외)     | 횡단적 / 모든 Domain Epic 영향 (예: Java 1.8 EOL / zero-test / scriptlet XSS) |
| 도메인 횡단 비즈니스 룰 (BR) | Spike (Story 의 prerequisite) | 단일 UC 에 속하지 않는 정책 결단                                              |
| Plugin 자체 fix (carry list) | Bug (별도 plugin 프로젝트)    | 마이그레이션 외부                                                             |

---

## 8. 라이선스/플랫폼별 구현 방법

| 플랫폼 / 라이선스                | Initiative 표현                                          | Epic ↔ Story                       | Sub-task                       |
| -------------------------------- | -------------------------------------------------------- | ---------------------------------- | ------------------------------ |
| Jira Standard                    | Label (`migration-{project}`) 또는 Big Epic + Issue Link | 정식 Epic Link                     | Sub-task type                  |
| Jira Premium + Advanced Roadmaps | 정식 Initiative type                                     | 정식 Epic Link                     | Sub-task type                  |
| Linear                           | Project                                                  | Cycle 또는 Parent Issue            | Sub-issue                      |
| GitHub Issues                    | Milestone (or `[INITIATIVE]` label)                      | Issue + `[EPIC]` label + task list | Issue checkbox + Linked Issues |
| Azure DevOps                     | Initiative work item type                                | Epic ↔ Feature/User Story          | Task                           |

---

## 9. 강제력 (Tier 1 = 권고만)

- **validator 강제 X** — 이 정책은 plugin 사용자/조직별 결단
- `traceability-matrix.schema.json` 의 `ticket_ref` field 는 **optional** — omit 가능
- 본 정책 미준수 = **finding 아님** (단 ticket 시스템 사용 시 본 정책 권장)
- ticket 미사용 PoC 는 본 정책 무영향 (regression 0)

---

## 10. Tier 2.5 — MCP delegation

R20 — 사용자 보유 jira-confluence MCP (`mcp__wiki-jira-assistant__*`) 위임으로 chain stage 동기 ticket lifecycle 자동화. **R16/R17 부활 ❌** — 신규 채널 (별도 charter 요구 신설 R18+ path 정합).

### 자동화 행동 — phase × stage matrix

chain stage **진입 시점 (`phase=enter`)** + **종료 시점 (`phase=exit`)** 분리. 사용자 의도 "각 단계에서 일감을 따는 부분도 필요" 정합. backward compat = `phase=exit` default.

#### phase=enter — Stage 진입 시점 의무 작업 Task

의미 = "오늘 무엇을 할 지 Jira 에서 가시화" / 작업자가 dashboard 만 봐도 진행 중 작업 알 수 있음.

| Stage                      | Skill 호출                                                 | MCP 호출                                             | issuetype      | parent        | scope           |
| -------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- | -------------- | ------------- | --------------- |
| analysis 진입 시           | `ticket-sync stage=analysis phase=enter`                   | 1 Task ("[Analysis] {scope} 분석 시작")              | Task (default) | Initiative    | 도메인 단위     |
| Chain 1 (planning) 진입 시 | `ticket-sync stage=planning phase=enter`                   | 1 Task ("[Chain 1] {scope} UC 분해 작업")            | Task (default) | Epic (도메인) | 도메인 단위     |
| Chain 2 (spec) 진입 시     | `ticket-sync stage=spec phase=enter uc_id=UC-CAR-007`      | 1 Task ("[Chain 2] {scope}/{uc_id} BHV/AC 작성")     | Task (default) | Story (UC)    | **per UC 단위** |
| Chain 3 (test) 진입 시     | `ticket-sync stage=test phase=enter uc_id=UC-CAR-007`      | 1 Task ("[Chain 3] {scope}/{uc_id} RED test 작성")   | Task (default) | Story (UC)    | **per UC 단위** |
| Chain 4 (impl) 진입 시     | `ticket-sync stage=implement phase=enter uc_id=UC-CAR-007` | 1 Task ("[Chain 4] {scope}/{uc_id} GREEN impl 작성") | Task (default) | Story (UC)    | **per UC 단위** |

issuetype default = `Task` (Jira 기본 / universal). 사용자 환경 결단 시 env override 가능 (Spike / Story 등 선택).

Stage 진입 시 Task 상태 = `To Do` (생성 직후). 사용자가 작업 시작하면 manual 또는 hook 자동 `In Progress` 전이.

#### phase=exit — Stage 종료 시점 결과 batch

| Stage                      | Skill 호출                                        | MCP 호출                                                                                   |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| analysis 종료 후           | `ticket-sync stage=analysis` (default phase=exit) | 1 Initiative + N Epics (per BC) + Tech Debt Story (AP P0) + (enter Task → Done 전이)       |
| Chain 1 (planning) 종료 후 | `ticket-sync stage=planning`                      | Story per UC-\* + Sub-task 4 batch (chain1 done, chain2/3/4 pending) + (enter Task → Done) |
| Chain 2 (spec) 종료 후     | `ticket-sync stage=spec`                          | Sub-task chain2 done / BHV/AC link comment / Story → In Progress + (enter Task → Done)     |
| Chain 3 (test) 종료 후     | `ticket-sync stage=test`                          | RED evidence comment / AC sub-task → Testing + (enter Task → Done)                         |
| Chain 4 (impl) 종료 후     | `ticket-sync stage=implement`                     | GREEN evidence + commit hash / AC sub-task → Done / Story → Done + (enter Task → Done)     |

phase=exit 시 enter Task 자동 종결 — 즉 진입 Task 가 "오늘 의무 작업" / 종료 시점에 자동 close.

#### car 도메인 7 UC 완주 시 ticket 수 예시

| 항목                                 | 수                                      |
| ------------------------------------ | --------------------------------------- |
| Initiative                           | 1                                       |
| Epic (도메인)                        | 23 (car 포함 / 전체)                    |
| Story (UC)                           | 7 (car 만)                              |
| Sub-task (per Story chain 1~4)       | 28 (7 × 4)                              |
| **Enter Task — analysis**            | 1 (도메인)                              |
| **Enter Task — planning**            | 1 (도메인)                              |
| **Enter Task — spec/test/implement** | 21 (per UC × chain 2~4 = 7 × 3)         |
| **합계 (car 도메인)**                | **82 ticket**                           |

### Confirmation gate (의무)

모든 MCP 호출 직전 사용자 confirmation:

```
Confirm ticket-sync stage=planning scope=car?
   [yes] = real MCP 호출 batch (dry_run=false)
   [no]  = cancel + state 무변경
   [dry-run] = reproduction_command 만 print / MCP 호출 X
```

### Evidence (7-field per MCP invocation)

`schemas/ticket-sync-evidence.schema.json` — `mcp_tool_name` + `tool_stdout_path` + `tool_stderr_path` + `tool_version` + `invocation_timestamp` + `duration_ms` + `result_hash` + `reproduction_command` (R15 정합 — `evidence_trust=simulated` 영구 거부).

### Status history (traceability-matrix)

각 ticket 상태 전이 = `traceability-matrix.ticket_ref.status_history[]` append. 예:

```json
{
	"use_case_id": "UC-CAR-007",
	"status": "green",
	"ticket_ref": {
		"platform": "jira",
		"id": "MIG-1234",
		"status_history": [
			{
				"transitioned_at": "2026-05-18T14:30:00+09:00",
				"to_status": "To Do",
				"mcp_tool": "mcp__wiki-jira-assistant__jira_create"
			},
			{
				"transitioned_at": "2026-05-18T15:00:00+09:00",
				"from_status": "To Do",
				"to_status": "In Progress",
				"mcp_tool": "mcp__wiki-jira-assistant__jira_transition",
				"evidence_ref": ".aimd/output/evidence/ticket-sync-spec-20260518T150000.json"
			},
			{
				"transitioned_at": "2026-05-18T16:30:00+09:00",
				"from_status": "In Progress",
				"to_status": "Done",
				"mcp_tool": "mcp__wiki-jira-assistant__jira_transition"
			}
		]
	}
}
```

### Idempotency

재실행 시 `mcp__wiki-jira-assistant__jira_search` JQL 로 기존 ticket lookup (`"UC ID" ~ "UC-CAR-007"`) → 발견 시 신규 생성 skip / `status_history` 만 갱신. `idempotency_skip_count` 증가 기록.

### MCP 미연결 환경

`ListMcpResourcesTool` probe 결과 `mcp__wiki-jira-assistant__*` 부재 시 silent skip + `F-TICKETSYNC-001 mcp_unavailable` finding emit (opt-in 설계 / error halt X / 다른 chain harness 진행 무영향).

### Hierarchy 의무 (구조 강제)

사용자 의도 "**티켓은 스트럭쳐를 가져야 함**" 정합. 모든 R20 생성 ticket = **부모-자식 chain 의무** + **Atlassian Structure tree 등록 의무**.

#### 4 layer 동시 강제

| Layer          | 위치                                                                               | 강제 방식                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **1. Policy**  | 본 subsection                                                                      | "Sub-task / Story / Epic 의무 parent" 명시                                                                                |
| **2. Schema**  | `ticket-sync-evidence.schema.json`                                                 | `mcp_invocations[].parent_ticket_id` + `link_type` enum + `ticket_ref.structure_complete` boolean                         |
| **3. Skill**   | `skills/ticket-sync/SKILL.md`                                                      | phase=exit 각 stage 호출 sequence 에 `parent_ticket_id=` 명시 + analysis phase=exit 끝에 `jira_structure_add_issues` step |
| **4. Finding** | `_base-log-finding` skill 또는 ticket-sync skill 인라인 (별 finding-log 도구 부재) | `F-TICKETSYNC-002 missing_parent` emit                                                                                    |

#### Parent 의무 매트릭스

| 생성 ticket 유형                            | parent_ticket_id 의무?                | link_type      | 위반 시                                      |
| ------------------------------------------- | ------------------------------------- | -------------- | -------------------------------------------- |
| **Initiative**                              | ❌ omit (최상위)                      | —              | —                                            |
| **Epic** (도메인)                           | ✅ Initiative id                      | `parent-child` | `F-TICKETSYNC-002 missing_parent` (Epic)     |
| **Story** (UC)                              | ✅ Epic id                            | `parent-child` | `F-TICKETSYNC-002 missing_parent` (Story)    |
| **Sub-task** (chain N)                      | ✅ Story id                           | `parent-child` | `F-TICKETSYNC-002 missing_parent` (Sub-task) |
| **Enter Task** (phase=enter)                | ✅ 단계별 (Initiative / Epic / Story) | `parent-child` | `F-TICKETSYNC-002 missing_parent` (enter)    |
| **Tech Debt Story** (AP P0 / cross-cutting) | ⚪ Initiative id (선택)               | `relates-to`   | — (omit 가능)                                |
| **Spike** (도메인 횡단 BR)                  | ⚪ Story prerequisite (선택)          | `relates-to`   | — (omit 가능)                                |

#### Atlassian Structure 통합

analysis stage phase=exit 끝에 `mcp__wiki-jira-assistant__jira_structure_add_issues` 1회 호출 (Initiative + all Epics + Tech Debt Stories) → Jira dashboard 의 tree view 가시화 → `ticket_ref.structure_tree_url` 채움 + `ticket_ref.structure_complete=true`.

Atlassian Standard plan = `jira_link` (Epic Link) + tree view plugin (Structure / Advanced Roadmaps) 의 가용성 결단 → 미가용 시 `F-TICKETSYNC-003 structure_unavailable` finding emit + skip (오류 halt X / link 만으로도 hierarchy 의미 보존).

#### Traceability matrix chain consistency

`ticket_ref` 에 `id` (Story) 채움 시:

- `epic_id` **의무** (Story 의 parent Epic)
- `initiative_id` **의무** (Epic 의 parent Initiative)
- 미채움 시 → `structure_complete=false` + `F-TICKETSYNC-002 missing_parent` emit

#### F-TICKETSYNC-002 finding 정의

| field     | 값                                                                                       |
| --------- | ---------------------------------------------------------------------------------------- |
| ID        | `F-TICKETSYNC-002`                                                                       |
| name      | `missing_parent`                                                                         |
| severity  | `high`                                                                                   |
| origin    | `ticket-sync skill`                                                                      |
| trigger   | `parent_ticket_id` 미설정 ticket 생성 / `ticket_ref.epic_id` 또는 `initiative_id` 미설정 |
| 해결 path | parent 채움 + status_history append + structure_complete=true 재설정                     |

### default 제약

- Platform: `mcp__wiki-jira-assistant__*` only
- Confluence emit: Initiative overview default false
- Auto-invoke: gate 통과 후 auto-suggest (confirmation 만 사용자) 권고

---

## 11. Tier 모델

| Tier                | 형태                                                                                                            | 비용                | 진입 시점                |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| Tier 1              | 정책 문서 + schema field + id-convention manual                                                                 | ~30분               | ✅ 활성                  |
| **Tier 2.5 (R20)**  | MCP delegation — `skills/ticket-sync/SKILL.md` + 7-field evidence + confirmation gate                           | ~10시간             | **✅ 활성**              |
| Tier 2 (deprecated) | (Tier 2.5 가 흡수 — file emit only 패턴은 별도 진입 X)                                                          | —                   | —                        |
| Tier 3 (carry)      | 자체 platform adapter (Jira REST / Linear GraphQL / GitHub Issues 직접 구현) — MCP 위임 충분 시 carry 영구 유지 | ~4~6시간 / platform | charter review (MAJOR)   |

---

## 인용

- 결단: DEC-2026-05-18-ticket-binding-policy (`decisions/DEC-2026-05-18-ticket-binding-policy.md`)
- R20 / Tier 2.5 MCP delegation 근거: DEC-2026-05-18-r20-mcp-ticket-sync-channel
- R16/R17 scope-out 정합: DEC-2026-05-15-g1-itsm-permanent-scope-out
- ID 명명 규약: `methodology-spec/id-conventions.md` §"Ticket Binding"
- schema: `schemas/traceability-matrix.schema.json` matrix.items.ticket_ref
- schema: `schemas/ticket-sync-evidence.schema.json`
- 검증 sample: `tools/schema-validator/test/ticket-binding.test.js`
