# Ticket Binding Policy (외부 일감 시스템 연동)

> ai-native-methodology plugin 의 chain harness 산출물 ↔ 외부 ticket 시스템 (Jira / Linear / GitHub Issues / Asana / Azure DevOps) 매핑 정책.
> 권고 (validator 강제 X).

---

## 1. 결단 요약

| 항목                 | 결정                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Ticket 단위          | **UC = Story** (BHV/AC cross-cut 시나리오 anchor)                                                                          |
| Ticket 생성 시점     | **plan stage(chain 3) gate 통과 직후 단일** — Epic+Story+Task+Sub-task 4-level cascade 일괄 (analysis/discovery/spec = 생성 ❌) |
| 상위 단위            | **Epic = FE 화면(route) 또는 BE-domain** / (선택) Initiative = 대형 분석 결과 묶음                                          |
| 하위 단위            | **Task = OP-\*** (Story sibling / BE only 운영·인프라·마이그레이션) / **Sub-task = TASK-\*** (1~3 AC 묶음 / layer 분기)     |
| test / implement     | Sub-task **status 갱신만** (RED / GREEN evidence / 신규 생성 ❌)                                                            |
| BHV / AC / TC / IMPL | **별도 ticket X** — Story / Sub-task 본문에 link                                                                           |
| 강제력               | 권고만 / validator 강제 X / `ticket_ref` field optional                                                                    |

---

## 2. Layer 매핑 (R20-prime 4-level)

```
화면 있는 시나리오:
  (선택) Initiative   ← 대형 분석 결과 묶음
    └── Epic          ← FE 화면 단위 (UI screen / route) 또는 BE-domain
          └── Story   ← UC = BHV/AC cross-cut 시나리오
                └── Sub-task × N   ← TASK-* (1~3 AC / layer 분기 be/fe/db/e2e/infra)

화면 없는 운영 작업:
  Task (Story sibling / Epic 부재 가능)   ← OP-* (운영·인프라·마이그레이션/cron/헬스체크/리팩터링)
    └── Sub-task × N   ← TASK-* (운영 작업 분해)
```

모든 level = **plan stage(chain 3) 단일에서 cascade 생성**.

---

## 3. 시점별 활동 (R20-prime — ticket = plan stage 단일)

| Stage              | Ticket 활동                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| analysis           | 생성 ❌ (산출물 = 이해 / 작업 항목 아님)                                                                          |
| discovery (chain 1) | 생성 ❌ (UC = 사용자 의도 / cross-cut)                                                                            |
| spec (chain 2)     | 생성 ❌ (BHV/AC = cross-cut anchor)                                                                               |
| **plan (chain 3)** | **gate #3 통과 직후 4-level cascade 일괄 생성** — Epic + Story + Task(OP-\*) + Sub-task(TASK-\*) (`task-plan.json` 기반) |
| test (chain 4)     | Sub-task status=Testing 전이 + RED evidence comment (신규 생성 ❌)                                                |
| implement (chain 5) | Sub-task status=Done + GREEN evidence + commit_hash / Story=Done 전이 (신규 생성 ❌)                              |
| 도메인 전체 종료   | Epic close                                                                                                        |
| (선택) Initiative 종료 | 마이그레이션 완료                                                                                            |

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
		"level": "story",
		"epic_id": "MIG-1000",
		"initiative_id": "MIG-1",
		"subtask_refs": ["MIG-1235", "MIG-1236"],
		"op_task_refs": ["MIG-1240"]
	}
}
```

`level` enum = epic/story/op_task/subtask. `subtask_refs` = TASK-\* / `op_task_refs` = OP-\* (구 `subtask_ids.{chain1_planning..chain4_impl}` 폐기 — R20-prime breaking).

field 모두 optional — ticket 시스템 사용 안 하는 PoC 는 그대로 omit (회귀 영향 0).

---

## 5. 권장 ticket summary 형식

| Ticket 유형 (Jira)      | Summary 형식                                                        | Description 본문                                                                           |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| (선택) Initiative       | `[MIG] {프로젝트} legacy → {target stack} 전환`                     | analysis 산출물 요약 + R# carry                                                            |
| Epic                    | `[{화면/route 또는 domain}] {Epic 명}`                              | FE 화면(route) 또는 BE-domain 범위                                                         |
| **Story**               | `[UC-{도메인}-{번호}] {use_case.name 또는 description 1줄}`         | discovery-spec.json 의 use_case 본체 + source_grounded_evidence + acceptance_criteria_refs |
| Task (OP-\*)            | `[OP-{도메인}-{번호}] {운영 작업}` (category=migration/cron/…)       | 운영·인프라·마이그레이션 작업 (Story sibling / Epic 부재 가능)                             |
| Sub-task (TASK-\*)      | `[TASK-{도메인}-{번호}] {1~3 AC 요약}` (layer=be/fe/db/e2e/infra)    | 개발 작업 단위 (Story 또는 OP-\* 하위 nested)                                              |
| Tech Debt Story (AP P0) | `[AP-{cat}] {antipattern.name}`                                     | antipatterns.json 의 AP 본문                                                               |
| Spike (BR)              | `[BR-{도메인}-{이름}] 정책 결단`                                    | rules.json BR 본문 + 도메인 전문가 위임                                                    |

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

R20-prime — 사용자 보유 jira-confluence MCP (`mcp__wiki-jira-assistant__*`) 위임으로 **plan stage 단일** ticket lifecycle 자동화. **R16/R17 부활 ❌** — 신규 채널 (charter R20-prime).

### 자동화 행동 — plan stage 단일 cascade

ticket 생성 = **plan stage(chain 3) gate 통과 직후 단일 4-level cascade** (구 5-stage × phase=enter/exit matrix 폐기). 운영 sequence SSOT = [`skills/ticket-sync/SKILL.md`](../skills/ticket-sync/SKILL.md) (본 정책 = "무엇/왜" / skill = "언제/어떻게").

| phase                | stage  | 행동                                                                                                  |
| -------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `exit` (본 흐름)     | `plan` | gate #3 통과 후 4-level cascade 일괄 — Epic + Story + Task(OP-\*) + Sub-task(TASK-\*) / `task-plan.json` 기반 |
| `enter` (선택)       | `plan` | plan stage 진입 작업 Task                                                                             |
| `update-test-red`    | (test) | Sub-task status=Testing + RED evidence comment (신규 생성 ❌)                                         |
| `update-impl-green`  | (impl) | Sub-task status=Done + GREEN evidence + commit_hash / Story=Done 전이 (신규 생성 ❌)                  |

analysis/discovery/spec stage = ticket 호출 ❌ (산출물 = "이해" / 작업 항목 아님). 구 stage 별 enter/exit Task 폭증 paradigm 폐기 (ticket 폭발 / "분석 산출물 ≠ 작업 항목" 회피).

#### car 도메인 7 UC ticket 수 예시 (R20-prime / plan stage 1회)

| 항목                            | 수                                       |
| ------------------------------- | ---------------------------------------- |
| Epic (FE 화면 또는 BE-domain)   | 화면 수 의존 (예: ~3~7)                  |
| Story (UC)                      | 7 (car)                                  |
| Sub-task (TASK-\* / per Story)  | UC 당 AC 묶음(1~3) × layer 수 의존       |
| Task (OP-\* / 운영)             | 운영·인프라·마이그레이션 작업 수 의존    |

→ plan stage cascade **1회 생성** (구 5-stage × enter/exit 폭증 → 회피 / agile 정합 = 작업 단위 = Sub-task).

### Confirmation gate (의무)

모든 MCP 호출 직전 사용자 confirmation:

```
Confirm ticket-sync stage=plan phase=exit scope=car?
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
| **3. Skill**   | `skills/ticket-sync/SKILL.md`                                                      | plan stage phase=exit cascade sequence 에 `parent_ticket_id=` 명시 + cascade 끝에 `jira_structure_add_issues` step |
| **4. Finding** | `_base-log-finding` skill 또는 ticket-sync skill 인라인 (별 finding-log 도구 부재) | `F-TICKETSYNC-002 missing_parent` emit                                                                                    |

#### Parent 의무 매트릭스

| 생성 ticket 유형                            | parent_ticket_id 의무?                | link_type      | 위반 시                                      |
| ------------------------------------------- | ------------------------------------- | -------------- | -------------------------------------------- |
| (선택) **Initiative**                       | ❌ omit (최상위)                      | —              | —                                            |
| **Epic** (FE 화면 / BE-domain)              | ⚪ Initiative id (선택)               | `parent-child` | — (Initiative 부재 가능)                     |
| **Story** (UC)                              | ✅ Epic id                            | `parent-child` | `F-TICKETSYNC-002 missing_parent` (Story)    |
| **Sub-task** (TASK-\*)                      | ✅ Story id 또는 OP-\* id             | `parent-child` | `F-TICKETSYNC-002 missing_parent` (Sub-task) |
| **Task** (OP-\* / Story sibling)            | ⚪ Epic id (선택 / Epic 부재 가능)    | `parent-child` | — (운영 작업 / Epic 무관 가능)               |
| **Tech Debt Story** (AP P0 / cross-cutting) | ⚪ Initiative id (선택)               | `relates-to`   | — (omit 가능)                                |
| **Spike** (도메인 횡단 BR)                  | ⚪ Story prerequisite (선택)          | `relates-to`   | — (omit 가능)                                |

#### Atlassian Structure 통합

plan stage cascade(phase=exit) 끝에 `mcp__wiki-jira-assistant__jira_structure_add_issues` 1회 호출 (Epic + Story + Task(OP-\*) + Sub-task(TASK-\*) + (선택) Initiative) → Jira dashboard 의 tree view 가시화 → `ticket_ref.structure_tree_url` 채움 + `ticket_ref.structure_complete=true`.

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
- R20-prime (plan stage 단일 4-level cascade / 구 5-stage matrix·subtask_ids{chain*} 폐기 / breaking): DEC-2026-05-26-ticket-plan-단일
- R16/R17 scope-out 정합: DEC-2026-05-15-g1-itsm-permanent-scope-out
- ID 명명 규약: `methodology-spec/id-conventions.md` §"Ticket Binding"
- schema: `schemas/traceability-matrix.schema.json` matrix.items.ticket_ref
- schema: `schemas/ticket-sync-evidence.schema.json`
- 검증 sample: `tools/schema-validator/test/ticket-binding.test.js`
