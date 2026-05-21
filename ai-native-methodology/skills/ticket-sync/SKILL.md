---
name: ticket-sync
description: ★ v8.6.1+ R20 신설 (DEC-2026-05-18-r20-mcp-ticket-sync-channel). chain stage 종료 동기로 사용자 보유 jira-confluence MCP (mcp__wiki-jira-assistant__*) 위임 호출 — Initiative/Epic/Story/Sub-task 자동 생성·상태 전이. 5 stage matrix (analysis/planning/spec/test/implement). 모든 MCP 호출 직전 사용자 confirmation gate 의무 (preview MD → yes/no/dry-run). 7-field evidence 캡쳐 + search-first idempotency + graceful MCP-missing. R16/R17 부활 ❌ — 신규 채널 (Tier 2.5 MCP delegation only / Tier 3 자체 adapter = v9.0+ carry).
allowed-tools: Read, Write, Edit, Bash, mcp__wiki-jira-assistant__jira_create, mcp__wiki-jira-assistant__jira_link, mcp__wiki-jira-assistant__jira_transition, mcp__wiki-jira-assistant__jira_comment, mcp__wiki-jira-assistant__jira_search, mcp__wiki-jira-assistant__jira_update, mcp__wiki-jira-assistant__jira_assign, mcp__wiki-jira-assistant__jira_transitions, mcp__wiki-jira-assistant__jira_label_add, mcp__wiki-jira-assistant__jira_issue, mcp__wiki-jira-assistant__jira_structure_add_issues, mcp__wiki-jira-assistant__jira_structure_get, mcp__wiki-jira-assistant__wiki_page_create, mcp__wiki-jira-assistant__wiki_page_update, mcp__wiki-jira-assistant__wiki_search_cql, mcp__wiki-jira-assistant__wiki_spaces, ListMcpResourcesTool
---

# ticket-sync

★ v8.6.1+ chain harness 의 **R20 MCP Ticket Sync Channel** skill (DEC-2026-05-18-r20-mcp-ticket-sync-channel 정합). 사용자 보유 jira-confluence MCP 를 chain stage 진행 동기로 호출 → ticket 자동 생성 / 상태 전이 / 모니터링.

★ ★ ★ **R16/R17 부활 ❌** — 본 skill = 신규 채널 (DEC-2026-05-15-g1-itsm-permanent-scope-out §31 path "별도 charter 요구 신설 (R18+) — R16/R17 부활 ❌"). Tier 2.5 = MCP delegation only / Tier 3 (자체 adapter) = v9.0+ carry.

## 언제 사용

| 호출 시점 | stage 파라미터 | 동작 |
|---|---|---|
| 분석 stage 종료 직후 (`analysis-quality-antipattern` gate 통과 후) | `analysis` | 1 Initiative + N Epics (per BC from `architecture.json`) + Tech Debt Story (AP P0) |
| **chain 1 (planning) gate 통과 후** (`planning-extraction-validator` green) | `planning` | Story per UC-* + Sub-task 4 batch (chain1/2/3/4) per Story / chain1 sub-task = done |
| chain 2 (spec) gate 통과 후 | `spec` | Sub-task chain2 done + BHV/AC link 갱신 / Story → In Progress 전이 |
| chain 3 (test, RED) gate 통과 후 | `test` | Sub-task chain3 done + RED evidence comment / AC sub-tasks → Testing 전이 |
| chain 4 (impl, GREEN) gate 통과 후 | `implement` | Sub-task chain4 done + GREEN evidence + commit hash comment / AC sub-tasks → Done / Story → Done close |

★ ★ ★ **MCP 미연결 환경 무영향** — `ListMcpResourcesTool` probe 결과 mcp__wiki-jira-assistant__ 부재 시 silent skip + `F-TICKETSYNC-001 mcp_unavailable` finding emit (opt-in 설계 / error halt X).

## 파라미터

| 파라미터 | 타입 | 기본 | 비고 |
|---|---|---|---|
| `stage` | enum | (의무) | `analysis` \| `planning` \| `spec` \| `test` \| `implement` |
| `phase` | enum | **`exit`** | ★ v8.6.2+ — `enter` (stage 진입 시 의무 작업 Task) \| `exit` (stage 종료 시 결과 batch / R20 기존). backward compat default = `exit`. |
| `scope` | string | state.scope | G3 scope slug (예: `car` / `payroll`) — `.aimd/<scope>/` 경로 추출 |
| `uc_id` | string | (없음) | ★ phase=enter + stage ∈ {spec, test, implement} 시 의무 (per UC 단위 Task). 예: `UC-CAR-007` |
| `dry_run` | boolean | **`true`** | ★ default true — reproduction_command 만 print / MCP 호출 X. 사용자 OK 후 `dry_run=false` 명시 호출. |
| `issuetype_enter` | string | `Task` | ★ v8.6.2+ — phase=enter Task 의 Jira issuetype. default `Task` (universal). 환경 결단 시 `Spike` / `Story` 가능. |
| `confluence_emit` | boolean | `false` | analysis stage 시 Initiative-level Confluence overview page 생성 (v8.6.1 default false / 사용자 결단 시 활성). per-stage 보고서 page = v8.7.0+ Tier 2.6 carry. |
| `parent_epic` | string | (없음) | ★ ★ v8.7.2+ — 명시 시 standard flow 의 Initiative 생성 skip + 본 Epic 키 하위에 직접 매핑. Initiative 생성 권한 부재 환경 / verification meta-cycle / migration carry / 기존 Epic 재사용 시 사용. `mode=verification` 시 의무. 예: `DWPD-1442`. |
| `mode` | enum | **`standard`** | ★ ★ v8.7.2+ — `standard` (default / R20 original — per-UC Story + 4 Sub-task per Story) \| `verification` (per-stage Story 5개 + 산출물 별 Sub-task / `parent_epic` 의무 / plugin dogfood meta-cycle 전용 / DEC-2026-05-20-r20-verification-mode 정합). |
| `issuetype_map` | object | (env default — 아래 resolve 표 참조) | ★ ★ ★ v8.7.3+ — Jira 환경별 issuetype 명명 / id 매핑. role → name/id resolve. role enum = `story` \| `subtask` \| `initiative` \| `tech_debt` \| `task` \| `bug`. 미명시 시 environment-config (`.aimd/ticket-sync-config.yaml` 안 `issuetype_map`) 또는 기본값 (Atlassian 표준 `Story` / `Sub-task` / `Initiative` / `Tech Debt Story` / `Task` / `Bug`). DWPD 환경 예 (DEC-2026-05-20-r20-environment-bridge 정합): `{story:"작업", subtask:"하위 작업", initiative:"epic", tech_debt:"개선", task:"작업"}`. 명명 모호 시 id 명시 권고 (`{story:{id:"10401"}}`). |
| `parent_strategy` | enum | **`auto`** | ★ ★ ★ v8.7.3+ — parent 매핑 전략. `auto` (default — role=subtask 는 `parent_key`, 그 외 role 은 `epic_link_customfield_id` 가 set 이면 customfield, 미set 이면 `parent_key`) \| `parent_key` (모든 role 이 native parent / Atlassian Cloud 표준) \| `epic_link_customfield` (Story/일반 issue 는 Epic Link customfield 사용 / Sub-task 만 parent_key / DWPD 환경 등 권한 분리 환경). DEC-2026-05-20-r20-environment-bridge §parent-bridge 정합. |
| `epic_link_customfield_id` | string | env (`EPIC_LINK_CUSTOMFIELD`) 또는 (없음) | ★ ★ ★ v8.7.3+ — `parent_strategy ∈ {epic_link_customfield, auto}` 시 Epic Link customfield ID. environment-config 또는 args 명시. DWPD 환경 reference: `customfield_10006`. 미명시 + `parent_strategy=epic_link_customfield` 시 reject + `F-TICKETSYNC-005 missing_epic_link_customfield` finding emit. |
| `structure_id` | string | env-config (`.aimd/ticket-sync-config.yaml` 안 `structure_id`) 또는 (없음) | ★ ★ ★ v8.7.4+ B15 — Atlassian Structure (ALM Works DWP-Forge) tree ID. set 시 phase=exit 종료 후 `jira_structure_add_issues` 자동 호출 표준 (모든 신규 ticket 등록). 미set 시 silent skip (Structure 미사용 환경 무영향). DWPD 환경 reference: `676`. |
| `structure_auto_add_on_exit` | boolean | `true` (단 `structure_id` set 일 때) | ★ ★ ★ v8.7.4+ B15 — true 시 phase=exit 각 stage 종료 후 자동 호출. false 명시 시 사용자 manual `jira_structure_add_issues` 호출 가정 (drift attractor 회피 path). |

## 절차

### 단계 1 — Pre-flight

1. **MCP 가용성 확인** (★ ★ v8.7.3+ tools-probe 교체 / F-VERIFY-005 → B8 해결)
   - 1차 — Skill 의 `allowed-tools` frontmatter 안 `mcp__wiki-jira-assistant__*` entry 가 system deferred tools list 에 등록되어 있는지 확인 (★ tool-name presence probe / mis-fe-admin iter-6 verification cycle 입증).
   - 2차 (fallback) — `mcp__wiki-jira-assistant__jira_search` 무해 JQL (예: `project = <PROJECT_KEY> AND created >= -1d`) 1회 시도 → 응답 200 OK 시 가용 / 401·403·404·timeout 시 미연결.
   - 3차 (skip 결단) — `ListMcpResourcesTool` 은 **resource-only probe** 라 tools 가용성 추론에 ★ 부적합 (F-VERIFY-005 결정적 evidence — wiki-jira MCP resource 0 노출 시 tools 는 deferred 로 정상 등록). resource probe 결과 단독으로 silent skip 분기 ❌.
   - 모두 불가 시 → `_base-log-finding` skill 호출 (또는 인라인 finding emit) 로 `F-TICKETSYNC-001 mcp_unavailable` emit + silent skip (다른 chain harness 진행 무영향). 별 `tools/_shared/finding-log.js` 도구 부재 — `_base-log-finding` skill 이 정합 entry point.
2. **state.json read** (★ ★ v8.7.3+ path 정정 + gate 분기 / F-VERIFY-006 + F-VERIFY-008 → B9 + B11 해결)
   - 정식 path = `<project>/.aimd/state.json` (★ 단일 file / scope 는 `state.current_scope` 필드). `.aimd/<scope>/state.json` 은 v8.7.2 이전 명세 drift — `chain-driver init` 의 실 산출 위치와 불일치 (★ F-VERIFY-006 결정적 evidence).
   - 매칭 의무 — `state.current_scope === <scope>` 일치 확인. 불일치 시 `F-TICKETSYNC-006 scope_mismatch` finding + reject.
   - **gate-pass 확인 분기** (★ v8.7.3+ / F-VERIFY-008):
     - `mode=standard` 시 — `state.last_gate` 가 본 stage gate 통과 evidence 와 일치해야 함 (미통과 시 reject + Block error).
     - `mode=verification` 시 — gate-pass check **우회** ★ (gate=null OK / verification meta-cycle 본질상 정식 chain harness gate 부재가 자연 — mis-fe-admin iter-6 입증). `intervention-log` 에 `gate_bypass:verification_mode` 1 entry 기록 의무.
3. `traceability-matrix.json` read — 본 stage 의 ticket_ref 기 등록 lookup. **부재 시** = first-entry path (verification cycle 의 자연 초기 상태) → 신규 생성 path 로 분기 (reject ❌).
4. **본 stage 산출물 read** (★ ★ v8.7.3+ stage 분기 명시 / F-VERIFY-007 → B10 해결)
   - `stage=analysis` 시 — `inventory.json` / `architecture.json` / `domain.json` / `business-rules.json` / `antipatterns.json` / `state-map.json` (FE) / `type-spec.json` (FE) / `form-validation-spec.json` (FE) / `visual-manifest.json` (FE) / `i18n-spec.json` (FE) / `a11y-spec.json` (FE) / `br-cross-consistency.json` / `static-security-spec.json` / `validation-report.json` / `openapi.yaml` (BE) / `schema.json` (DB) — 환경별 산출 최대 14~16건. carry baseline 시 iter-N path 의 reference (`input-manifest.inherited_from.carry_artifacts`) 도 valid.
   - `stage=planning` 시 — `planning-spec.json`.
   - `stage=spec` 시 — `behavior-spec.json` / `acceptance-criteria.json`.
   - `stage=test` 시 — `test-spec.json`.
   - `stage=implement` 시 — `impl-spec.json`.

### 단계 2 — Idempotency check (search-first)

`mcp__wiki-jira-assistant__jira_search` JQL 로 기존 ticket lookup:

```
JQL: project = <PROJECT_KEY> AND "UC ID" ~ "UC-CAR-007"
```

- 발견 시 → `ticket_ref.id` 채움 + `status_history` 갱신 path 만 진행 (신규 생성 X)
- 부재 시 → 신규 생성 path 진행
- `idempotency_skip_count` 증가 기록

### 단계 3 — Preview MD 생성

stage 별 MCP 호출 batch 의 preview 표시. 예 (stage=planning, scope=car):

```markdown
## ★ Preview — ticket-sync stage=planning scope=car

### 신규 생성 예정 (idempotency check 후)
| UC | Story summary | 부모 Epic |
|---|---|---|
| UC-CAR-001 | [UC-CAR-001] 차량 등록 | MIG-CAR-100 (car Epic) |
| UC-CAR-007 | [UC-CAR-007] 비용 회계연도 prorate + cross-company billing | MIG-CAR-100 |
| (총 7 UC) | | |

### Skip 예정 (기존 ticket 발견 / status_history 만 갱신)
| UC | 기존 Story | 사유 |
|---|---|---|
| (없음) | | |

### MCP 호출 sequence
1. mcp__wiki-jira-assistant__jira_create (Story #1) [redacted body]
2. mcp__wiki-jira-assistant__jira_link (parent=MIG-CAR-100)
... (총 N 호출)

### Sub-task batch (per Story 4 sub-task)
- chain1_planning [done] / chain2_spec [pending] / chain3_test [pending] / chain4_impl [pending]

### 추정 비용
- MCP 호출 수: ~28 (7 Story × 4 = 28)
- 추정 시간: ~3 분
```

### 단계 4 — ★ Confirmation gate

```
★ Confirm ticket-sync stage=planning scope=car?
   [yes] = real MCP 호출 batch (dry_run=false)
   [no]  = cancel + state 무변경
   [dry-run] = reproduction_command 만 print / MCP 호출 X
```

- 사용자 응답 = `intervention-log.jsonl` 1 entry append (decision=ticket_sync_confirmed / preview_md_digest)
- 응답 = `no` 시 cancel + state 무변경 (idempotent)
- 응답 = `dry-run` 시 reproduction_command 만 print + evidence file emit (`dry_run=true`)
- 응답 = `yes` 시 단계 5 진행

### 단계 5 — MCP 호출 (sequential / 결정론 보호)

★ ★ v8.7.2+ — mode 분기: `mode=standard` (default / 아래 phase × stage 본문) 또는 `mode=verification` (§ 단계 5b 본문).

#### ★ ★ ★ v8.7.3+ — 환경 resolve prelude (호출 전 의무 / F-VERIFY-009 + F-VERIFY-010 → B12+B13 해결)

본 §단계 5 / 5b 본문이 사용하는 `Story` / `Sub-task` / `Initiative` / `Tech Debt Story` 등의 명명은 **role label**. 실 MCP 호출 시점에 다음 resolve table 적용 의무 (mis-fe-admin EAM-AUTH iter-6 verification cycle Stage 1 입증 — Story 1 (DWPD-1667) 생성 시 "스토리" 명명 reject → "작업" + customfield_10006 우회 path 로 success).

**resolve 알고리즘 (의무)**:

1. **issuetype resolve**:
   - args.`issuetype_map[role]` 우선 → 없으면 env-config (`.aimd/ticket-sync-config.yaml` 안 `issuetype_map`) → 없으면 default table 적용 (Atlassian 표준 영문 명명):

   | role | default name | DWPD 환경 reference |
   |------|--------------|---------------------|
   | story | Story | 작업 (또는 새 기능) |
   | subtask | Sub-task | 하위 작업 |
   | initiative | Initiative | epic |
   | tech_debt | Tech Debt Story | 개선 |
   | task | Task | 작업 |
   | bug | Bug | 버그 |

   - resolve 결과 `string` 시 jira_create `issue_type` 필드 또는 `extra_fields.issuetype.name`
   - resolve 결과 `{id: "..."}` 시 `extra_fields.issuetype.id` (명명 모호 환경 권고)
   - resolve 실패 (role 미정의) 시 `F-TICKETSYNC-007 issuetype_unresolved` finding + reject

2. **parent linking resolve** (`parent_strategy` 별):
   - `parent_strategy=auto` (default):
     - role=`subtask` → `parent_key` 필드 **만** 사용 (★ ★ ★ v8.7.4+ B14 invariant — `extra_fields[epic_link_customfield_id]` 명시 ❌. Sub-task 의 Epic Link 은 parent Story 로부터 **auto-inherit** 됨)
     - role ∈ {`story`, `task`, `tech_debt`, `bug`} 시 `epic_link_customfield_id` 가 set 이면 → `extra_fields[epic_link_customfield_id] = <parent_epic>`. 미set 시 → `parent_key` fallback (Atlassian Cloud 표준 path).
     - role=`initiative` → parent 없음 (top-level)
   - `parent_strategy=parent_key`: 모든 role 이 `parent_key` 시도 (★ DWPD 환경에서는 일반 issue 가 400 reject — `F-TICKETSYNC-010 parent_strategy_environment_mismatch` finding).
   - `parent_strategy=epic_link_customfield`: Sub-task = `parent_key` **만** / 그 외 = `extra_fields[epic_link_customfield_id]`. ★ ★ ★ v8.7.4+ B14 — Sub-task 에 `extra_fields[epic_link_customfield_id]` 추가 시도 시 backend 400 reject ("이슈 유형 10402 은 Epic Link 를 받지 않음" 등) — Sub-task 는 parent Story 의 Epic Link 을 auto-inherit 한다. `epic_link_customfield_id` 미명시 + 일반 issue 시 `F-TICKETSYNC-005 missing_epic_link_customfield` finding + reject.

3. **호출 sequence 의무**:
   - jira_create payload 의 `issue_type` + parent linking 필드는 위 resolve 결과 직접 인용 (★ no-simulation / SKILL.md 본문 hardcode 표기 인용 ❌).
   - jira_create 실패 (400/403) 시 — error message parse 후 `F-TICKETSYNC-008 environment_drift` finding emit + 환경별 resolve table 보강 권고 evidence 누적.

★ 본 prelude 는 §단계 5 (standard mode) + §단계 5b (verification mode) 모두 적용. SKILL.md 본문 "Story / Sub-task / Epic" 표기는 role label / 실 명명은 env resolve.

**DWPD 환경 reference config** (DEC-2026-05-20-r20-environment-bridge / mis-fe-admin iter-6 verification 입증):

```yaml
# .aimd/ticket-sync-config.yaml (DWPD 환경)
issuetype_map:
  story: 작업          # 또는 새 기능
  subtask: 하위 작업
  initiative: epic
  tech_debt: 개선
  task: 작업
  bug: 버그
parent_strategy: epic_link_customfield
epic_link_customfield_id: customfield_10006
# ★ ★ ★ v8.7.4+ B14 — Sub-task 는 epic_link_customfield_id 명시 ❌
# (parent Story/Task 로부터 auto-inherit / 명시 시 400 reject)
# ★ ★ ★ v8.7.4+ B15 — Structure 보드 자동 등록 (옵션)
structure_id: 676                # ALM Works DWP-Forge id (DWPD 환경)
structure_auto_add_on_exit: true # phase=exit 마다 jira_structure_add_issues 자동 호출
```

phase × stage 별 MCP call matrix:

#### phase=enter (★ v8.6.2+ — stage 진입 시 의무 작업 Task)

```
analysis enter:
  jira_create (Task, summary="[Analysis] {scope} 분석 시작",
               issuetype=$issuetype_enter, parent=Initiative if exists,
               status=To Do)
  → enter_task_id 저장 (traceability-matrix.ticket_ref.enter_task_id 또는 별도)

planning enter:
  jira_create (Task, summary="[Chain 1] {scope} UC 분해 작업",
               issuetype=$issuetype_enter, parent=Epic(scope),
               status=To Do)

spec enter (uc_id 의무):
  jira_create (Task, summary="[Chain 2] {scope}/{uc_id} BHV/AC 작성",
               issuetype=$issuetype_enter, parent=Story(uc_id),
               status=To Do)

test enter (uc_id 의무):
  jira_create (Task, summary="[Chain 3] {scope}/{uc_id} RED test 작성",
               issuetype=$issuetype_enter, parent=Story(uc_id),
               status=To Do)

implement enter (uc_id 의무):
  jira_create (Task, summary="[Chain 4] {scope}/{uc_id} GREEN impl 작성",
               issuetype=$issuetype_enter, parent=Story(uc_id),
               status=To Do)
```

★ enter phase 후 작업 시작 시점 → 사용자 manual 또는 hook 자동 `jira_transition` (To Do → In Progress).

#### phase=exit — analysis (기존 R20 + enter Task 종결 + ★ v8.6.3 structure tree)
```
1. jira_create (Initiative) → MIG-1
2. for each BC in architecture.json:
   jira_create (Epic, parent_ticket_id=MIG-1, link_type=parent-child) → MIG-<n>
   jira_link (Epic, parent=MIG-1)
3. for each AP P0 in antipatterns.json:
   jira_create (Tech Debt Story, parent_ticket_id=MIG-1, link_type=relates-to) → MIG-AP-<n>
   jira_label_add (AP-{category})
4. (optional confluence_emit=true) wiki_page_create (Initiative overview)
5. ★ ★ ★ v8.7.4+ B15 — if (structure_id set + structure_auto_add_on_exit=true):
   jira_structure_add_issues (structure_id=$structure_id,
                              issue_keys=[Initiative + all Epics + Tech Debt Stories])
   → Atlassian Structure tree 등록 → ticket_ref.structure_tree_url 채움
   → 모든 child 의 ticket_ref.structure_complete=true
   → mcp_invocations[] evidence (1 호출 / version_before, version_after 캡쳐)
6. ★ if exists enter_task_id (analysis enter):
   jira_transition (enter_task_id → Done)
```

#### phase=exit — planning (chain 1 종료 + enter Task 종결 + ★ v8.6.3 parent 의무)
```
for each UC in planning-spec.use_cases[]:
   1. jira_create (Story, parent_ticket_id=Epic(scope), link_type=parent-child,
                  summary="[UC-CAR-007] ...", body=planning-spec UC body)
   2. jira_link (Story, parent=Epic MIG-CAR-100)
   3. jira_create (Sub-task chain1_planning, parent_ticket_id=Story, link_type=parent-child, status=Done)
      ★ ★ ★ v8.7.4+ B14 — Sub-task payload 에 extra_fields[epic_link_customfield_id] 명시 ❌ (auto-inherit)
   4. jira_create (Sub-task chain2_spec, parent_ticket_id=Story, link_type=parent-child, status=To Do)
   5. jira_create (Sub-task chain3_test, parent_ticket_id=Story, link_type=parent-child, status=To Do)
   6. jira_create (Sub-task chain4_impl, parent_ticket_id=Story, link_type=parent-child, status=To Do)
★ ★ v8.6.3+ parent_ticket_id 의무 — Sub-task / Story 생성 시 모두 parent_ticket_id 필드 채움 (mcp_invocations[] evidence 기록). 위반 시 F-TICKETSYNC-002 missing_parent finding emit.
★ traceability-matrix.ticket_ref.{epic_id, initiative_id, subtask_ids} 모두 채움 → structure_complete=true.
★ ★ ★ v8.7.4+ B15 — if (structure_id set + structure_auto_add_on_exit=true):
   jira_structure_add_issues (structure_id=$structure_id, issue_keys=[새 Story N개 + Sub-task 4N개])
   → traceability-matrix.ticket_ref.structure_tree_url 갱신 / version_after 캡쳐.
★ if exists enter_task_id (planning enter):
   jira_transition (enter_task_id → Done)
```

#### phase=exit — spec (chain 2 종료 + enter Task 종결)
```
for each Story:
   1. jira_transition (Story → "In Progress")
   2. jira_update (chain2_spec sub-task → Done)
   3. jira_comment (BHV/AC link MD)
★ if exists enter_task_id (spec enter / per UC):
   jira_transition (enter_task_id → Done)
```

#### phase=exit — test (chain 3 종료 / RED + enter Task 종결)
```
for each Story:
   1. jira_comment (test-spec.json summary + RED evidence link)
   2. jira_transition (chain3_test sub-task → "Testing")
★ if exists enter_task_id (test enter / per UC):
   jira_transition (enter_task_id → Done)
```

#### phase=exit — implement (chain 4 종료 / GREEN + enter Task 종결)
```
for each Story:
   1. jira_comment (GREEN evidence + commit_hash)
   2. jira_transition (chain3_test sub-task → "Done")
   3. jira_transition (chain4_impl sub-task → "Done")
   4. jira_transition (Story → "Done")
5. (optional confluence_emit=true) wiki_page_update (final report)
6. ★ ★ ★ v8.7.4+ B15 — if (structure_id set + structure_auto_add_on_exit=true):
   jira_structure_add_issues (structure_id=$structure_id, issue_keys=[새 추가 ticket if any])
   ★ 일반적으로 implement exit 시점에는 신규 ticket 0건이라 no-op / 단 cycle 종료 마무리 evidence.
★ if exists enter_task_id (implement enter / per UC):
   jira_transition (enter_task_id → Done)
```

★ 각 호출 = Bash 로 stdout/stderr 캡쳐 → 7-field evidence record (`mcp_invocations[]` append).
★ enter_task_id = traceability-matrix.ticket_ref.enter_task_ids[stage] (v8.6.2+ schema).

### 단계 5b — MCP 호출 (★ ★ v8.7.2+ mode=verification 분기)

verification mode 는 plugin 본 작동 검증 / plugin 자체 dogfood meta-cycle 전용. `parent_epic` 의무 — 미명시 시 reject + Block error.

★ standard mode 와의 본질 차이:
| 축 | standard | verification |
|---|---|---|
| Initiative 생성 | analysis exit 시 자동 (1건) | ❌ skip (parent_epic 재사용) |
| per-BC Epic 생성 | analysis exit 시 architecture.json 기반 (N건) | ❌ skip (parent_epic 직접 매핑) |
| Story 단위 | **per UC** (planning exit 마다 N건) | **per stage** (5건 고정 / analysis~implement 각 1건) |
| Sub-task 단위 | per Story 의 4 chain (chain1/2/3/4) | per Story 의 산출물 / UC / AC / TC |
| 사용 시점 | 실 도메인 feature 개발 cycle | plugin 검증 / migration meta-cycle / 기존 Epic 재사용 |

#### phase=exit — mode=verification — analysis

```
1. if !exists Story("[Plugin Verify] Stage 1 — analysis"):
   jira_create (Story, parent_ticket_id=$parent_epic, link_type=parent-child,
                summary="[Plugin Verify] Stage 1 — analysis",
                labels=[verification-mode, $scope_id], body=verification plan link)
   → verification_story_ids[analysis] = <key>
2. for each artifact in inventory/architecture/domain/business-rules/antipatterns/state-map/openapi/...:
   jira_create (Sub-task, parent_ticket_id=verification_story_ids[analysis],
                link_type=parent-child,
                summary="[Verify artifact] {artifact_name}",
                status=Done)
   ★ ★ ★ v8.7.4+ B14 — Sub-task payload extra_fields[epic_link_customfield_id] 명시 ❌
                       (parent Story 로부터 auto-inherit)
3. jira_comment (verification_story_ids[analysis],
                 "5종 물증 7 필드 + iter-N carry inheritance + analysis gate result")
4. jira_transition (verification_story_ids[analysis] → "Done")
5. ★ ★ ★ v8.7.4+ B15 — if (structure_id set + structure_auto_add_on_exit=true):
   jira_structure_add_issues (structure_id=$structure_id,
                              issue_keys=[verification_story_ids[analysis] + Sub-task N개])
   → version_after 캡쳐 / mcp_invocations[] evidence.
```

#### phase=exit — mode=verification — planning

```
1. jira_create (Story, parent_ticket_id=$parent_epic, link_type=parent-child,
                summary="[Plugin Verify] Stage 2 — planning (UC/BR-INTENT)",
                labels=[verification-mode, $scope_id]) → verification_story_ids[planning]
2. for each UC in planning-spec.use_cases[]:
   jira_create (Sub-task, parent_ticket_id=verification_story_ids[planning],
                summary="[Verify UC] {uc_id} {uc_summary}", status=Done)
   ★ ★ ★ v8.7.4+ B14 — Sub-task payload extra_fields[epic_link_customfield_id] 명시 ❌
3. for each BR-INTENT in planning-spec.business_rules_intent[]:
   jira_create (Sub-task, parent_ticket_id=verification_story_ids[planning],
                summary="[Verify BR-INTENT] {br_id} {summary}", status=Done)
4. jira_comment (verification_story_ids[planning],
                 "UC count=N + BR-INTENT count=M + traceability v1 link")
5. jira_transition (verification_story_ids[planning] → "Done")
6. ★ ★ ★ v8.7.4+ B15 — if (structure_id set + structure_auto_add_on_exit=true):
   jira_structure_add_issues (structure_id=$structure_id,
                              issue_keys=[verification_story_ids[planning] + UC/BR-INTENT Sub-task])
```

#### phase=exit — mode=verification — spec

```
1. jira_create (Story, parent_ticket_id=$parent_epic, ...,
                summary="[Plugin Verify] Stage 3 — spec (BHV + AC Gherkin)")
   → verification_story_ids[spec]
2. for each AC in acceptance-criteria[]:
   jira_create (Sub-task, parent_ticket_id=verification_story_ids[spec],
                summary="[Verify AC] {ac_id} {gherkin_when}", status=Done)
   ★ ★ ★ v8.7.4+ B14 — Sub-task payload extra_fields[epic_link_customfield_id] 명시 ❌
3. jira_comment (verification_story_ids[spec],
                 "BHV count=N + AC count=M + BR cross-consistency result")
4. jira_transition (verification_story_ids[spec] → "Done")
5. ★ ★ ★ v8.7.4+ B15 — if (structure_id set + structure_auto_add_on_exit=true):
   jira_structure_add_issues (structure_id=$structure_id,
                              issue_keys=[verification_story_ids[spec] + AC Sub-task])
```

#### phase=exit — mode=verification — test (RED)

```
1. jira_create (Story, parent_ticket_id=$parent_epic, ...,
                summary="[Plugin Verify] Stage 4 — test (RED)")
   → verification_story_ids[test]
2. for each test_case in test-spec[]:
   jira_create (Sub-task, parent_ticket_id=verification_story_ids[test],
                summary="[Verify TC] {tc_id} {ac_id_link}", status="Testing")
   ★ ★ ★ v8.7.4+ B14 — Sub-task payload extra_fields[epic_link_customfield_id] 명시 ❌
3. jira_comment (verification_story_ids[test],
                 "RED evidence + 5종 물증 7 필드 + AC↔TC forward coverage")
4. ★ ★ ★ v8.7.4+ B15 — if (structure_id set + structure_auto_add_on_exit=true):
   jira_structure_add_issues (structure_id=$structure_id,
                              issue_keys=[verification_story_ids[test] + TC Sub-task])
```
★ Story status 는 Testing/In Progress 유지 — implement stage 종료 후 일괄 Done.

#### phase=exit — mode=verification — implement (GREEN)

```
1. jira_create (Story, parent_ticket_id=$parent_epic, ...,
                summary="[Plugin Verify] Stage 5 — implement (GREEN)")
   → verification_story_ids[implement]
2. for each impl artifact:
   jira_create (Sub-task, parent_ticket_id=verification_story_ids[implement],
                summary="[Verify impl] {file_path}", status=Done)
   ★ ★ ★ v8.7.4+ B14 — Sub-task payload extra_fields[epic_link_customfield_id] 명시 ❌
3. jira_transition (verification_story_ids[test] sub-tasks → "Done")
4. jira_transition (verification_story_ids[test] → "Done")
5. jira_transition (verification_story_ids[implement] → "Done")
6. jira_comment ($parent_epic,
                 "★ verification cycle 종결 — 5 Story keys + Q1~Q5 pass/fail summary
                  + traceability-matrix 100% green + commit hash + findings 링크")
7. ★ ★ ★ v8.7.4+ B15 — if (structure_id set + structure_auto_add_on_exit=true):
   jira_structure_add_issues (structure_id=$structure_id,
                              issue_keys=[verification_story_ids[implement] + impl Sub-task])
   → cycle 종료 마무리 evidence (5 Story 전체 등록 완료 + traceability link).
```

★ verification mode 는 `traceability-matrix.ticket_ref.verification_mode=true` 표식 + `verification_story_ids` map 추가 (analysis/planning/spec/test/implement → Story 키).

★ structure_complete 의무 동일 (모든 Story / Sub-task 의 parent_ticket_id 채움).

### 단계 6 — Evidence 기록

`<project>/.aimd/output/evidence/ticket-sync-<stage>-<timestamp>.json` 작성 (schema: `ticket-sync-evidence.schema.json`):

```json
{
  "meta": {...},
  "stage": "planning",
  "scope": "car",
  "mcp_invocations": [
    {
      "mcp_tool_name": "mcp__wiki-jira-assistant__jira_create",
      "tool_stdout_path": ".aimd/output/evidence/mcp-stdout-1.log",
      "tool_stderr_path": ".aimd/output/evidence/mcp-stderr-1.log",
      "tool_version": "1.4.2",
      "invocation_timestamp": "2026-05-18T14:30:00+09:00",
      "duration_ms": 1234,
      "result_hash": "abc...",
      "reproduction_command": "mcp__wiki-jira-assistant__jira_create with body=...",
      "ticket_id_created": "MIG-1234"
    }
  ],
  "confirmation_log_ref": ".aimd/output/intervention-log.jsonl#entry=2026-05-18T14:29:55",
  "evidence_trust": "real_tool",
  "preview_md_digest": "def...",
  "dry_run": false,
  "idempotency_skip_count": 0
}
```

### 단계 7 — traceability-matrix 갱신

각 UC entry 의 `ticket_ref.status_history[]` append + `ticket_ref.id` / `epic_id` / `subtask_ids` 채움. 본 갱신 후 `_base-build-traceability-matrix` skill 재호출 (forward_coverage 갱신).

### 단계 8 — intervention-log append

```jsonl
{"timestamp":"2026-05-18T14:30:00Z","skill":"ticket-sync","stage":"planning","scope":"car","decision":"ticket_sync_confirmed","mcp_invocation_count":28,"idempotency_skip_count":0,"evidence_ref":".aimd/output/evidence/ticket-sync-planning-20260518T143000.json","user":"sangcl@smilegate.com"}
```

## 금지 / 강제력

- **simulated evidence_trust ❌** — schema-level 영구 거부 (R15 정합 / R19 simulated 영구 reject sibling)
- **fire-and-forget ❌** — 모든 MCP 호출 직전 confirmation gate 의무
- **parallel MCP 호출 ❌** — sequential only (결정론 axis 보호)
- **state.blocked 시 MCP 호출 ❌** — `hooks/hooks.json` PreToolUse matcher 가 `mcp__wiki-jira-assistant__.*` deny (`tools/chain-driver/src/hooks-bridge.js::buildBlockOutput` 재사용)
- **R16/R17 부활 ❌** — 본 skill = R20 신규 채널 (drift attractor 회피)
- **★ v8.6.3+ orphan ticket ❌** (★ v8.7.3+ environment-aware 정정) — role ∈ {`subtask`, `story`, `task`, `tech_debt`, `bug`} 생성 시 parent linking 의무 — `parent_strategy=parent_key` 시 `parent_ticket_id` / `parent_strategy=epic_link_customfield` (또는 auto + epic_link set) 시 `extra_fields[epic_link_customfield_id]` 중 1개 채움. Initiative 만 omit 가능. 위반 시 `F-TICKETSYNC-002 missing_parent` finding emit + ticket_ref.structure_complete=false 표식.
- **★ v8.6.3+ link_type drift ❌** — Sub-task / Story / Epic 의 link_type = `parent-child` 의무. `relates-to` / `blocks` 등 = cross-cutting (Tech Debt / Spike / 도메인 횡단 BR) 만 허용.
- **★ ★ v8.7.2+ mode=verification + parent_epic 미명시 ❌** — `mode=verification` 시 `parent_epic` 의무. 미명시 시 reject + Block error (Initiative 자동 생성 시도 ❌). 위반 시 `F-TICKETSYNC-003 verification_missing_parent_epic` finding emit.
- **★ ★ v8.7.2+ mode=standard + parent_epic 명시 시 hybrid 경고** — standard mode 인데 parent_epic 명시 시 → Initiative 생성 skip + per-BC Epic 의 link 대상이 parent_epic 으로 변경 (architecture-driven Epic 자동 생성은 유지). 명시적 hybrid path / `F-TICKETSYNC-004 hybrid_parent_epic` info finding emit (deny ❌).
- **★ ★ ★ v8.7.3+ environment hardcode ❌** — SKILL.md 본문의 `Story` / `Sub-task` / `Initiative` 표기는 **role label** (★ resolve table 의 key). 실 MCP payload 의 `issue_type` 값은 §단계 5 prelude 의 resolve 결과 직접 인용 의무. SKILL.md 본문 영문 명명을 그대로 payload 에 hardcode ❌ (★ F-VERIFY-009 결정적 evidence — DWPD 환경 "스토리" 미사용 + 실 명명 "작업"). 위반 시 `F-TICKETSYNC-009 issuetype_hardcode_drift` finding emit + 호출 reject.
- **★ ★ ★ v8.7.3+ parent_strategy 우회 ❌** — `parent_strategy ∈ {epic_link_customfield, auto + epic_link_customfield_id set}` 환경에서 일반 issue (`story` / `task` / `tech_debt` / `bug`) 의 `parent` 필드 직접 채움 ❌. 반드시 `extra_fields[epic_link_customfield_id]` 사용 (★ F-VERIFY-010 결정적 evidence — DWPD "이슈 유형 10401 은 하위 작업이 아니지만 상위가 지정" 400 reject). 위반 시 `F-TICKETSYNC-010 parent_strategy_environment_mismatch` finding emit.
- **★ ★ ★ v8.7.4+ Sub-task Epic Link customfield 명시 ❌ (B14 invariant)** — role=`subtask` 의 `jira_create` payload 에 `extra_fields[epic_link_customfield_id]` (예: DWPD `customfield_10006`) 명시 ❌. Sub-task 의 Epic Link 은 **parent Story / Task 로부터 auto-inherit** 된다 (Jira native semantic). 명시 시 backend 400 reject ("Epic Link is not supported on subtask" / "이슈 유형 10402 은 Epic Link 를 받지 않음" 등) — ★ F-VERIFY-015 결정적 evidence (mis-fe-admin EAM-AUTH iter-6 verify-1 Stage 1 — Sub-task 14건 `jira_update` × 14 customfield_10006 backfill 시도 모두 400 reject). 후속 `jira_update` 로 backfill 시도도 동일 reject. 위반 시 `F-TICKETSYNC-011 subtask_epic_link_violation` finding emit + 호출 reject. ★ 본 invariant 는 parent linking resolve table 와 §사용자 결단 8번 (Sub-task auto-inherit) 정합.

## 사용자 결단 7건 (실 사용 시점 / DEC-2026-05-18-r20 + ★ v8.7.2 DEC-2026-05-20-r20-verification-mode + ★ ★ ★ v8.7.3 DEC-2026-05-20-r20-environment-bridge)

1. **Jira workflow transition target IDs** — project-specific / `jira_transitions` 사전 lookup 의무 (Initiative/Epic/Story/Sub-task workflow 가 사용자 Jira 환경 의존)
2. **Confluence emit 범위** — Initiative overview default v8.6.1 / per-stage 보고서 page = v8.7.0+ Tier 2.6 후보
3. **Auto-invoke 정책** — chain stage gate 통과 후 본 skill auto-suggest (confirmation 만 사용자) ★ 권고. ★ v8.7.2+ — `chain-driver next` 명령이 stage 전이 직후 stderr only suggest 송출 (Stop hook 직접 등록 ❌ — noise 회피 / 의도된 stage 전이 시점에만 발화). 실 MCP 호출은 항상 사용자 명시 호출.
4. **Idempotency** — search-first ★ 권고 (재실행 시 기존 ticket lookup skip + status_history 만 갱신)
5. **MCP 미연결 환경** — silent skip + finding emit ★ 권고. ★ v8.7.3+ — probe 는 tools-deferred-list 우선 / `ListMcpResourcesTool` 단독 의존 ❌ (resource-only / tools 가용성 false negative — F-VERIFY-005).
6. **★ v8.7.2+ mode 선택** — `standard` (default / 실 도메인 feature cycle / Initiative+Epic 자동 생성) / `verification` (plugin dogfood meta-cycle / parent_epic 의무 / per-stage Story 5 + 산출물 별 Sub-task). 환경상 Initiative 생성 권한 부재 / 기존 Epic 재사용 / migration carry meta-cycle 시 `mode=verification` + `parent_epic=<key>` 명시.
7. **★ ★ ★ v8.7.3+ environment bridge** — 신규 Jira 환경 첫 도입 시 (1) `jira_search project=<K> AND issuetype != Epic` 으로 사용 issuetype 분포 sample → (2) `.aimd/ticket-sync-config.yaml` 안 `issuetype_map` 채우기 → (3) `parent_strategy` 결정 (DWPD 같이 일반 issue 의 parent 직접 매핑 reject 환경 = `epic_link_customfield` / Atlassian Cloud 표준 환경 = `parent_key` 또는 `auto`) → (4) `epic_link_customfield_id` 환경별 확인 (DWPD = `customfield_10006`). 본 4 단계가 1회 setup / 이후 재사용. DEC-2026-05-20-r20-environment-bridge 정합.
8. **★ ★ ★ v8.7.4+ Sub-task Epic auto-inherit invariant (B14)** — 모든 `parent_strategy` 환경 공통: Sub-task 의 Epic Link 은 parent Story / Task 로부터 **auto-inherit**. Sub-task `jira_create` payload 에 `extra_fields[epic_link_customfield_id]` 명시 ❌ (DWPD `customfield_10006` 외 환경 동일). 사후 `jira_update` 로 backfill 도 동일 reject — Sub-task 본질이 parent 의존이라 별도 binding 불필요. ★ mis-fe-admin EAM-AUTH iter-6 verify-1 Stage 1 입증 — `jira_update × 14` customfield_10006 backfill 시도 14건 전건 400 reject. 본 invariant 는 parent linking resolve 의 subtask 분기 + 금지 항목 + DWPD config reference 모두 정합.
9. **★ ★ ★ v8.7.4+ Structure 보드 자동 등록 (B15)** — Atlassian Structure (ALM Works DWP-Forge) 사용 환경에서 `structure_id` args 또는 env-config 명시 시 phase=exit 종료 시점에 `jira_structure_add_issues` 자동 호출 표준화. native Epic Link 와 **별개 trace 채널** (Epic Link 는 1:N parent-child / Structure 는 임의 tree manual override 가능). DWPD 환경 reference: DWP-Forge `structure_id=676`. 미명시 시 silent skip (Structure 미사용 환경 무영향). 호출 결과 `structure_complete=true` + `structure_tree_url` traceability-matrix 채움.

## Cross-link

- 결단 record: `decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md`
- ★ v8.7.2 amendment: `decisions/DEC-2026-05-20-r20-verification-mode.md` (parent_epic override + mode=verification + Stop hook auto-suggest)
- ★ ★ ★ v8.7.3 amendment: `decisions/DEC-2026-05-20-r20-environment-bridge.md` (issuetype_map + parent_strategy + epic_link_customfield_id + Pre-flight 정정 B8/B9/B10/B11)
- ★ ★ ★ v8.7.4 amendment: `decisions/DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md` (B14 Sub-task Epic auto-inherit invariant + B15 Structure 자동 등록 표준화 / mis-fe-admin EAM-AUTH verify-1 iter-6 입증)
- 정책 본문: `methodology-spec/ticket-policy.md` §Tier 2.5
- ID 명명: `methodology-spec/id-conventions.md` §Ticket Binding
- Evidence schema: `schemas/ticket-sync-evidence.schema.json`
- Traceability matrix: `schemas/traceability-matrix.schema.json` matrix.items.ticket_ref.status_history
- Hook config: `hooks/hooks.json` PreToolUse matcher (state.blocked deny path) / ★ v8.7.2 auto-suggest = `tools/chain-driver/src/cli.js` cmdNext stderr (Stop hook 직접 등록 ❌)
- R20 charter entry: `methodology-spec/plugin-charter.md` §1+§2
- R16/R17 영구 scope-out parent: `decisions/DEC-2026-05-15-g1-itsm-permanent-scope-out.md` §31
- Tier 1 (manual) 선행: `decisions/DEC-2026-05-18-ticket-binding-policy.md`
