---
name: ticket-sync
description: v11.0.0 R20-prime (DEC-2026-05-26-ticket-plan-단일). **plan stage 단일** 진입 — Epic(FE 화면) + Story(BHV/AC cross-cut) + Task(OP-* Story sibling / BE only 운영·인프라·마이그레이션) + Sub-task(TASK-* / 1~3 AC 묶음 / layer 분기 be/fe/db/e2e/infra) **4-level cascade 일괄 생성**. analysis/discovery/spec stage 는 ticket 호출 ❌. test/implement stage 는 Sub-task status 갱신만 (신규 생성 ❌). 모든 MCP 호출 직전 사용자 confirmation gate 의무 (preview MD → yes/no/dry-run). 7-field evidence 캡쳐 + search-first idempotency + graceful MCP-missing.
allowed-tools: Read, Write, Edit, Bash, mcp__mcp-server-wiki-jira__jira_create, mcp__mcp-server-wiki-jira__jira_link, mcp__mcp-server-wiki-jira__jira_transition, mcp__mcp-server-wiki-jira__jira_comment, mcp__mcp-server-wiki-jira__jira_search, mcp__mcp-server-wiki-jira__jira_update, mcp__mcp-server-wiki-jira__jira_assign, mcp__mcp-server-wiki-jira__jira_transitions, mcp__mcp-server-wiki-jira__jira_label_add, mcp__mcp-server-wiki-jira__jira_issue, mcp__mcp-server-wiki-jira__jira_structure_add_issues, mcp__mcp-server-wiki-jira__jira_structure_get, mcp__mcp-server-wiki-jira__wiki_page_create, mcp__mcp-server-wiki-jira__wiki_page_update, mcp__mcp-server-wiki-jira__wiki_search_cql, mcp__mcp-server-wiki-jira__wiki_spaces, mcp__wiki-jira-assistant__jira_create, mcp__wiki-jira-assistant__jira_link, mcp__wiki-jira-assistant__jira_transition, mcp__wiki-jira-assistant__jira_comment, mcp__wiki-jira-assistant__jira_search, mcp__wiki-jira-assistant__jira_update, mcp__wiki-jira-assistant__jira_assign, mcp__wiki-jira-assistant__jira_transitions, mcp__wiki-jira-assistant__jira_label_add, mcp__wiki-jira-assistant__jira_issue, mcp__wiki-jira-assistant__jira_structure_add_issues, mcp__wiki-jira-assistant__jira_structure_get, mcp__wiki-jira-assistant__wiki_page_create, mcp__wiki-jira-assistant__wiki_page_update, mcp__wiki-jira-assistant__wiki_search_cql, mcp__wiki-jira-assistant__wiki_spaces, ListMcpResourcesTool
---

# ticket-sync (R20-prime / v11.0.0 paradigm)

**R20-prime** — **ticket 생성 = plan stage 한 곳** (Epic + Story + Task(OP-\*) + Sub-task(TASK-\*) 4-level cascade).

## paradigm 개요

| 항목                          | R20-prime                                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ticket 생성 시점              | **plan stage 단일** (chain 3 plan gate 통과 직후)                                                                          |
| ticket hierarchy              | **4-level cascade 일괄** — Epic + Story + Task(OP-_) + Sub-task(TASK-_)                                                    |
| Epic 정의                     | **FE 화면 단위** (UI screen / route) — 또는 BE only 영역의 도메인 묶음 (BE-domain Epic)                                    |
| Story 정의                    | **BHV/AC cross-cut anchor** (BE+FE/DB/E2E 가로지름 / behavior-spec.BHV-_ + acceptance-criteria.AC-_ 묶음)                  |
| Task 정의 (Story sibling)     | **OP-\* (operational-task)** — BE only 운영·인프라·마이그레이션 (Story 의 사용자 시나리오 axis 와 분리 / Story 와 sibling) |
| Sub-task 정의                 | **TASK-\* (task-plan.tasks[])** — 1~3 AC 묶음 + layer 분기 (be/fe/db/e2e/infra)                                            |
| analysis/discovery/spec stage | **ticket 호출 ❌** — 산출물만 (plan stage 단일 정책)                                                                        |
| test stage                    | **Sub-task status 갱신만** (RED evidence comment / status=Testing 전이) — 신규 생성 ❌                                     |
| implement stage               | **Sub-task status 갱신만** (GREEN evidence + commit_hash comment / status=Done / Story=Done) — 신규 생성 ❌                |

**R16/R17 부활 ❌** — 본 skill = R20-prime 채널. Tier 2.5 = MCP delegation only (자체 adapter 미지원).

## 언제 사용

| 호출 시점                                                           | stage 파라미터 | phase               | 동작                                                                                                              |
| ------------------------------------------------------------------- | -------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **chain 3 (plan) gate 통과 직후** (`plan-coverage-validator` green) | `plan`         | `exit`              | **4-level cascade 일괄 생성** — Epic(FE 화면 또는 BE-domain) + Story(BHV/AC 묶음) + Task(OP-_) + Sub-task(TASK-_) |
| chain 4 (test, RED) gate 통과 후                                    | `plan`         | `update-test-red`   | Sub-task(TASK-\*) status=Testing 전이 + RED evidence comment (신규 생성 ❌)                                       |
| chain 5 (impl, GREEN) gate 통과 후                                  | `plan`         | `update-impl-green` | Sub-task(TASK-\*) status=Done + GREEN evidence + commit_hash + Story=Done 전이 (신규 생성 ❌)                     |
| (선택) plan stage 진입 시                                           | `plan`         | `enter`             | "[Chain 3] {scope} plan 작성 시작" 의무 작업 Task 1건 (Story 부재 시 생성 skip / scope Epic 하위)                 |

analysis/discovery/spec stage 에서 본 skill 호출 시 `F-TICKETSYNC-012 stage_paradigm_violation` finding emit + reject (R20-prime 정합).

**MCP 미연결 환경 무영향** — `ListMcpResourcesTool` probe 결과 mcp**wiki-jira-assistant** 부재 시 silent skip + `F-TICKETSYNC-001 mcp_unavailable` finding emit (opt-in 설계 / error halt ❌).

## 파라미터

| 파라미터                     | 타입    | 기본                                      | 비고                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `stage`                      | const   | **`plan`**                                | `plan` 단일 const (analysis/discovery/spec/test/implement enum 미지원)                                                                                                                                                                                                                                                  |
| `phase`                      | enum    | **`exit`**                                | `enter` (plan stage 진입 작업 Task) \| `exit` (4-level cascade 일괄 / 본 skill 본 흐름) \| `update-test-red` (chain 4 RED) \| `update-impl-green` (chain 5 GREEN)                                                                                                                                                                    |
| `scope`                      | string  | state.scope                               | G3 scope slug (예: `car` / `payroll`) — `.aimd/<scope>/` 경로 추출                                                                                                                                                                                                                                                                   |
| `dry_run`                    | boolean | **`true`**                                | default true — reproduction_command 만 print / MCP 호출 ❌. 사용자 OK 후 `dry_run=false` 명시 호출.                                                                                                                                                                                                                                  |
| `confluence_emit`            | boolean | `false`                                   | plan stage exit 시 Initiative-level Confluence overview page 생성 (default false)                                                                                                                                                                                                                                                    |
| `parent_epic`                | string  | (없음)                                    | 명시 시 standard flow 의 Initiative 생성 skip + 본 Epic 키 하위에 직접 매핑. Initiative 생성 권한 부재 환경 / verification meta-cycle / migration carry / 기존 Epic 재사용 시 사용. `mode=verification` 시 의무. 예: `DWPD-1442`.                                                                                                    |
| `parent_initiative`          | string  | (없음)                                    | 앱/제품 단위 Initiative 키 명시. 명시 시 Initiative 신규 생성 스킵 + 해당 키를 최상위로 재사용. 미명시 시 jira_search 로 기존 Initiative 탐색 후 발견 시 재사용, 미발견 시 신규 생성. env-config (`.aimd/ticket-sync-config.yaml` 안 `parent_initiative`) 에서도 읽음. 예: `MIS-58` (SmileApp Initiative).                        |
| `mode`                       | enum    | **`standard`**                            | `standard` (default / R20-prime 본격 — task-plan.json 기반 4-level cascade) \| `verification` (plugin dogfood meta-cycle 전용 / `parent_epic` 의무).                                                                                                                                     |
| `issuetype_map`              | object  | env default                               | role → name/id resolve. role enum = `story` \| `subtask` \| `initiative` \| `tech_debt` \| `task` \| `bug` \| `epic`. 미명시 시 env-config (`.aimd/ticket-sync-config.yaml` 안 `issuetype_map`) 또는 기본값 (Atlassian 표준). DWPD 환경 예: `{story:"작업", subtask:"하위 작업", initiative:"epic", tech_debt:"개선", task:"작업"}`. |
| `parent_strategy`            | enum    | **`auto`**                                | `auto` (default — role=subtask 는 `parent_key`, 그 외 role 은 `epic_link_customfield_id` set 이면 customfield, 미set 이면 `parent_key`) \| `parent_key` \| `epic_link_customfield`.                                                                                       |
| `epic_link_customfield_id`   | string  | env (`EPIC_LINK_CUSTOMFIELD`) 또는 (없음) | `parent_strategy ∈ {epic_link_customfield, auto}` 시 Epic Link customfield ID. DWPD 환경 reference: `customfield_10006`.                                                                                                                                                                                                             |
| `parent_link_customfield_id` | string  | env-config 또는 (없음)                    | role=`epic` 의 Initiative 부모 링크 customfield ID. set 시 Epic 생성 시 `extra_fields[parent_link_customfield_id] = <initiative_key>` 사용 — `parent_key` 보다 우선. 미set 시 `parent_key` 시도 → 400 reject 시 `jira_link (Relates)` fallback. **SG-MIS 환경(jira.smilegate.net) reference: `customfield_11902`** (Parent Link 필드). 타 Jira 인스턴스는 Jira 필드 설정에서 "Parent Link" customfield ID 확인 후 기재. <!-- allow-identity: SG-MIS 환경 config reference (사내 공통 / 개인 신원 아님) --> |
| `structure_id`               | string  | env-config 또는 (없음)                    | Atlassian Structure (ALM Works DWP-Forge) tree ID. set 시 phase=exit 종료 후 `jira_structure_add_issues` 자동 호출 표준 (모든 신규 ticket 등록). **SG-MIS 환경 reference: `684`** (SG-MIS board). Jira Structure board URL 의 `s=<숫자>` 파라미터 값으로 확인.                                                                                                                                                         |
| `structure_auto_add_on_exit` | boolean | `true` (단 `structure_id` set 일 때)      | true 시 phase=exit 마다 자동 호출 표준 (drift attractor 회피).                                                                                                                                                                                                                                                                       |

## 절차

### 단계 1 — Pre-flight

1. **MCP 가용성 확인** (tools-probe 본격 / F-VERIFY-005 → B8 해결)
   - 1차 — Skill 의 `allowed-tools` frontmatter 안 `mcp__mcp-server-wiki-jira__*` **또는** `mcp__wiki-jira-assistant__*` entry 가 system deferred tools list 에 등록되어 있는지 확인. 신버전(`mcp__mcp-server-wiki-jira__`) 우선 탐지 → 없으면 구버전(`mcp__wiki-jira-assistant__`) fallback (tool-name presence probe).
   - **MCP 버전 resolve**: 신버전 감지 시 이후 모든 MCP 호출에 `mcp__mcp-server-wiki-jira__` prefix 사용. 구버전만 감지 시 `mcp__wiki-jira-assistant__` prefix 사용. 세션 내 `_mcp_prefix` 변수로 고정.
   - 2차 (fallback) — `{_mcp_prefix}jira_search` 무해 JQL (예: `project = <PROJECT_KEY> AND created >= -1d`) 1회 시도 → 응답 200 OK 시 가용 / 401·403·404·timeout 시 미연결.
   - 3차 (skip 결단) — `ListMcpResourcesTool` 은 **resource-only probe** 라 tools 가용성 추론에 부적합 (F-VERIFY-005). resource probe 결과 단독으로 silent skip 분기 ❌.
   - 모두 불가 시 → `_base-log-finding` skill 호출 로 `F-TICKETSYNC-001 mcp_unavailable` emit + silent skip. 메시지에 "신버전(mcp__mcp-server-wiki-jira__) 및 구버전(mcp__wiki-jira-assistant__) 모두 미감지" 포함.

2. **stage paradigm 강제력 점검** (F-TICKETSYNC-012)
   - args.stage ∈ {`analysis`, `discovery`, `spec`, `test`, `implement`} 시 → `F-TICKETSYNC-012 stage_paradigm_violation` finding emit + reject (R20-prime 정합 / plan 단일 const).
   - args.stage = `plan` 만 유효.

3. **state.json read** (F-VERIFY-006 + F-VERIFY-008 → B9 + B11 해결)
   - 정식 path = `<project>/.aimd/state.json` (단일 file / scope 는 `state.current_scope` 필드).
   - 매칭 의무 — `state.current_scope === <scope>` 일치 확인. 불일치 시 `F-TICKETSYNC-006 scope_mismatch` finding + reject.
   - **gate-pass 확인 분기**:
     - `mode=standard` 시 — `state.last_gate` 가 plan stage gate (#3) 통과 evidence 와 일치해야 함 (미통과 시 reject + Block error).
     - `mode=verification` 시 — gate-pass check 우회 (gate=null OK / verification meta-cycle 본질).

4. `traceability-matrix.json` read — plan stage 의 ticket_ref 기 등록 lookup. 부재 시 = first-entry path → 신규 생성 path 로 분기.

5. **본 stage 산출물 read** (plan stage 단일 — F-VERIFY-007 → B10 해결)
   - `task-plan.json` (의무) — 본 skill 본 입력. Epic/Story/Task/Sub-task 4-level cascade payload 본격 source.
   - `behavior-spec.json` (의무) — Story body source (BHV-\* 묶음 / cross-cut anchor).
   - `acceptance-criteria.json` (의무) — Sub-task body source (AC-\* 묶음 / Sub-task 의 1~3 AC).
   - `operational-task.json` (선택) — Task (OP-\* / Story sibling) source. 부재 시 Task 0건.
   - `discovery-spec.json` (선택) — Epic 의 의도 source (FE 화면 의도 / BE-domain 의도).

### 단계 2 — Idempotency check (search-first)

`mcp__wiki-jira-assistant__jira_search` JQL 로 기존 ticket lookup:

```
JQL (Story per BHV cluster): project = <PROJECT_KEY> AND "BHV cluster" ~ "{bhv_cluster_id}"
JQL (Sub-task per TASK-*):  project = <PROJECT_KEY> AND "TASK ID" ~ "TASK-CAR-001"
JQL (Epic per screen):      project = <PROJECT_KEY> AND "Screen ID" ~ "SCR-CAR-DASH"
JQL (OP-* Task):            project = <PROJECT_KEY> AND "OP ID" ~ "OP-CAR-001"
```

- 발견 시 → `ticket_ref.id` 채움 + `status_history` 갱신 path 만 진행 (신규 생성 ❌)
- 부재 시 → 신규 생성 path 진행
- `idempotency_skip_count` 증가 기록

### 단계 3 — Preview MD 생성

plan stage exit 의 4-level cascade preview. 예 (scope=car):

```markdown
## Preview — ticket-sync stage=plan phase=exit scope=car

### 4-level cascade (신규 생성 예정 / idempotency check 후)

#### Level 1: Epic (FE 화면 또는 BE-domain 단위)

| Epic ID       | Type      | summary                    |
| ------------- | --------- | -------------------------- |
| EPIC-CAR-DASH | FE screen | 차량 대시보드 화면         |
| EPIC-CAR-BILL | FE screen | 비용 회계연도 prorate 화면 |
| EPIC-CAR-BACK | BE-domain | 차량 backend 도메인        |

#### Level 2: Story (BHV/AC cross-cut anchor / per BHV cluster)

| Story summary             | 부모 Epic     | BHV/AC 묶음                    |
| ------------------------- | ------------- | ------------------------------ |
| 차량 등록 사용자 시나리오 | EPIC-CAR-DASH | BHV-CAR-001 + AC-CAR-{001~005} |
| 차량 등록 backend API     | EPIC-CAR-BACK | BHV-CAR-002 + AC-CAR-{006~010} |
| 비용 prorate 시나리오     | EPIC-CAR-BILL | BHV-CAR-003 + AC-CAR-{011~018} |

#### Level 3: Task (OP-\* / Story sibling — BE only 운영·인프라·마이그레이션)

| OP ID      | Type      | summary          | 부모 Epic     |
| ---------- | --------- | ---------------- | ------------- |
| OP-CAR-001 | infra     | DB 인덱스 추가   | EPIC-CAR-BACK |
| OP-CAR-002 | migration | 기존 데이터 백필 | EPIC-CAR-BACK |

#### Level 4: Sub-task (TASK-\* / 1~3 AC 묶음 / layer 분기)

| TASK ID         | layer | 부모 Story                | AC 묶음                |
| --------------- | ----- | ------------------------- | ---------------------- |
| TASK-CAR-001    | be    | 차량 등록 backend API     | AC-CAR-006, AC-CAR-007 |
| TASK-CAR-002    | fe    | 차량 등록 사용자 시나리오 | AC-CAR-001, AC-CAR-002 |
| TASK-CAR-003    | e2e   | 차량 등록 사용자 시나리오 | AC-CAR-003             |
| ... (총 N TASK) |       |                           |                        |

### Skip 예정 (기존 ticket 발견 / status_history 만 갱신)

| ticket | 기존 | 사유 |
| ------ | ---- | ---- |
| (없음) |      |      |

### MCP 호출 sequence

1. mcp**wiki-jira-assistant**jira_create (Initiative MIG-1) [redacted body]
2. mcp**wiki-jira-assistant**jira_create (Epic EPIC-CAR-DASH, parent=MIG-1)
3. mcp**wiki-jira-assistant**jira_create (Story #1, parent=EPIC-CAR-DASH)
4. mcp**wiki-jira-assistant**jira_create (Sub-task TASK-CAR-001, parent=Story #1)
   ... (총 N 호출)

### 추정 비용 — MCP 호출 ~38회 (3 Epic + 3 Story + 2 OP + 8 TASK + transitions) / ~4분
```

### 단계 4 — Confirmation gate

```
Confirm ticket-sync stage=plan phase=exit scope=car?
   [yes] = real MCP 호출 batch (dry_run=false)
   [no]  = cancel + state 무변경
   [dry-run] = reproduction_command 만 print / MCP 호출 ❌
```

- 사용자 응답 = `intervention-log.jsonl` 1 entry append (decision=ticket_sync_confirmed / preview_md_digest)
- 응답 = `no` 시 cancel + state 무변경 (idempotent)
- 응답 = `dry-run` 시 reproduction_command 만 print + evidence file emit (`dry_run=true`)
- 응답 = `yes` 시 단계 5 진행

### 단계 5 — 환경 resolve prelude (호출 전 의무 / F-VERIFY-009 + F-VERIFY-010 → B12+B13 해결)

본 §단계 6 본문이 사용하는 `Story` / `Sub-task` / `Initiative` / `Epic` / `Tech Debt Story` / `Task` 등의 명명은 **role label**. 실 MCP 호출 시점에 다음 resolve table 적용 의무.

**resolve 알고리즘 (의무)**:

1. **issuetype resolve**:
   - args.`issuetype_map[role]` 우선 → 없으면 env-config (`.aimd/ticket-sync-config.yaml` 안 `issuetype_map`) → 없으면 default table 적용:

   | role       | default name    | DWPD 환경 reference |
   | ---------- | --------------- | ------------------- |
   | epic       | Epic            | epic                |
   | initiative | Initiative      | epic                |
   | story      | Story           | 작업 (또는 새 기능) |
   | subtask    | Sub-task        | 하위 작업           |
   | tech_debt  | Tech Debt Story | 개선                |
   | task       | Task            | 작업                |
   | bug        | Bug             | 버그                |
   - resolve 결과 `string` 시 jira_create `issue_type` 또는 `extra_fields.issuetype.name`
   - resolve 결과 `{id: "..."}` 시 `extra_fields.issuetype.id` (명명 모호 환경 권고)
   - resolve 실패 (role 미정의) 시 `F-TICKETSYNC-007 issuetype_unresolved` finding + reject

2. **Initiative 생성 전 search-first** (신규):
   - `parent_initiative` 명시 시 → 해당 키 재사용, Initiative 신규 생성 스킵.
   - `parent_initiative` 미명시 + env-config `parent_initiative` 존재 시 → env-config 값 재사용.
   - 둘 다 없을 시 → `jira_search` JQL: `project = <PROJECT_KEY> AND issuetype = <initiative_type> AND summary ~ "<scope_or_app_name>"` 탐색.
     - 발견 시 → 첫 번째 결과 재사용 (사용자 확인 후).
     - 미발견 시 → 신규 Initiative 생성.
   - **Initiative = 앱/제품 단위** (SmileApp, 근태, 총무 등). 기능(feature) 단위는 Epic. Initiative 생성 시 summary 는 앱/제품명만 사용 (기능명 포함 ❌).

3. **parent linking resolve** (`parent_strategy` 별):
   - `parent_strategy=auto` (default):
     - role=`subtask` → `parent_key` 필드 **만** 사용 (B14 invariant — `extra_fields[epic_link_customfield_id]` 명시 ❌. Sub-task 의 Epic Link 은 parent Story 로부터 auto-inherit)
     - role ∈ {`story`, `task`, `tech_debt`, `bug`} 시 `epic_link_customfield_id` 가 set 이면 → `extra_fields[epic_link_customfield_id] = <parent_epic>`. 미set 시 → `parent_key` fallback. 둘 다 400 reject 시 → `jira_link (Relates)` fallback.
     - role=`epic` (Initiative 하위 Epic 생성 시):
       - `parent_link_customfield_id` set 이면 → `extra_fields[parent_link_customfield_id] = <initiative_key>` **우선** (SG-MIS 사내 표준: `customfield_11902` / 타 Jira 인스턴스는 env-config 에서 확인).
       - 미set 이면 → `parent_key=<initiative_key>` 시도. 400 reject 시 → `jira_link (Relates)` fallback.
       - `F-TICKETSYNC-013 epic_initiative_link_fallback` finding emit (fallback 발생 시 env-config `parent_link_customfield_id` 설정 권고).
     - role=`initiative` → top-level (parent 없음).
   - `parent_strategy=parent_key`: 모든 role 이 `parent_key` 시도 (DWPD 환경에서는 일반 issue 가 400 reject — `F-TICKETSYNC-010 parent_strategy_environment_mismatch` finding).
   - `parent_strategy=epic_link_customfield`: Sub-task = `parent_key` 만 / 그 외 = `extra_fields[epic_link_customfield_id]`. B14 — Sub-task 에 `extra_fields[epic_link_customfield_id]` 추가 시도 시 backend 400 reject. `epic_link_customfield_id` 미명시 + 일반 issue 시 `F-TICKETSYNC-005 missing_epic_link_customfield` finding + reject.

3. **호출 sequence 의무**:
   - jira_create payload 의 `issue_type` + parent linking 필드는 위 resolve 결과 직접 인용 (no-simulation / SKILL.md 본문 hardcode 표기 인용 ❌).
   - jira_create 실패 (400/403) 시 — error message parse 후 `F-TICKETSYNC-008 environment_drift` finding emit + 환경별 resolve table 보강 권고 evidence 누적.

본 prelude 는 §단계 6 standard mode + §단계 6b verification mode 모두 적용.

**DWPD 환경 reference config**:

```yaml
# .aimd/ticket-sync-config.yaml (DWPD 환경)
issuetype_map:
  epic: epic
  story: 작업 # 또는 새 기능
  subtask: 하위 작업
  initiative: epic
  tech_debt: 개선
  task: 작업
  bug: 버그
parent_strategy: epic_link_customfield
epic_link_customfield_id: customfield_10006
# B14 — Sub-task 는 epic_link_customfield_id 명시 ❌
# (parent Story/Task 로부터 auto-inherit / 명시 시 400 reject)
# B15 — Structure 보드 자동 등록 (옵션)
structure_id: 676 # ALM Works DWP-Forge id (DWPD 환경)
structure_auto_add_on_exit: true
```

**SG-MIS 환경 표준 config** (jira.smilegate.net / 사내 공통 — SmileApp Intune 실측 확정): <!-- allow-identity: SG-MIS 환경 config reference (사내 공통 / 개인 신원 아님) -->

```yaml
# .aimd/ticket-sync-config.yaml (SG-MIS 환경 — 사내 표준)
issuetype_map:
  epic:       epic
  story:      이야기
  subtask:    하위 작업
  initiative: Initiative
  tech_debt:  이야기
  task:       작업
  bug:        버그
parent_strategy: epic_link_customfield
epic_link_customfield_id: customfield_10006    # Story → Epic 링크 (사내 공통)
parent_link_customfield_id: customfield_11902  # Epic → Initiative "Parent Link" (사내 공통)
# B14 — Sub-task 는 epic_link_customfield_id 명시 ❌
# B15 — Structure 보드 자동 등록 (SG-MIS board)
structure_id: 684              # SG-MIS Structure board (jira.smilegate.net) — allow-identity: 사내 공통 env config
structure_auto_add_on_exit: true
# parent_initiative: <앱/제품 Initiative 키>  # 프로젝트별 기재 (예: MIS-108)
```

### 단계 6 — MCP 호출 (sequential / 결정론 보호 / mode=standard)

**plan stage phase=exit 4-level cascade 일괄**.

#### phase=enter (선택 / plan stage 진입 작업 Task)

```
plan enter:
  jira_create (role=task,
               summary="[Chain 3] {scope} plan 작성 시작",
               parent=Epic(scope) if exists else parent=Initiative,
               status=To Do)
  → enter_task_id 저장 (traceability-matrix.ticket_ref.enter_task_ids.plan)
```

enter phase 후 작업 시작 시점 → 사용자 manual 또는 hook 자동 `jira_transition` (To Do → In Progress).

#### phase=exit — 4-level cascade 일괄 생성

```
Step 1 — Initiative (선택 / parent_epic 미명시 시):
  if !parent_epic:
    jira_create (role=initiative,
                 summary="[Migration] {scope} initiative",
                 status=To Do)
    → initiative_id 저장
  else:
    initiative_id = parent_epic (재사용)

Step 2 — Epic (per FE 화면 또는 BE-domain 묶음):
  for each epic in task-plan.epics[]:
    jira_create (role=epic,
                 summary="[Epic-{epic.type}] {epic.title}",
                 parent_ticket_id=initiative_id, link_type=parent-child,
                 labels=[epic.type], body=discovery-spec/visual-manifest link)
    → epic_id[epic.epic_id] 저장 (epic_id map)
    jira_link (epic, parent=initiative_id)

Step 3 — Story (per BHV cluster / cross-cut anchor):
  for each story in task-plan.stories[]:
    jira_create (role=story,
                 summary="[Story] {story.title}",
                 parent=epic_id[story.epic_ref] via parent_strategy,
                 body=behavior-spec.BHV-* + acceptance-criteria.AC-* link)
    → story_id[story.story_id] 저장

Step 4 — Task (per OP-* / Story sibling / BE only 운영·인프라·마이그레이션):
  for each op_task in operational-task.json[] (if exists):
    jira_create (role=task,
                 summary="[OP-{op_task.op_id}] {op_task.title}",
                 parent=epic_id[op_task.epic_ref] via parent_strategy,
                 labels=[op-* + op_task.op_type], status=To Do)
    → op_task_id[op_task.op_id] 저장

Step 5 — Sub-task (per TASK-* / 1~3 AC 묶음 / layer 분기 be/fe/db/e2e/infra):
  for each task in task-plan.tasks[]:
    parent_ref = task.story_ref ? story_id[task.story_ref] : op_task_id[task.op_task_ref]
    jira_create (role=subtask,
                 summary="[TASK-{task.task_id}] {task.title}",
                 parent_ticket_id=parent_ref, link_type=parent-child,
                 labels=[layer-* + task.layer], status=To Do,
                 body=task.ac_refs + task.layer + task.openapi_endpoint_ref|component_ref)
    B14 — Sub-task payload 안 extra_fields[epic_link_customfield_id] 명시 ❌
    → subtask_id[task.task_id] 저장

Step 6 — traceability-matrix.ticket_ref 갱신:
  matrix.ticket_ref = {
    initiative_id, epic_id_map, story_id_map, op_task_id_map, subtask_id_map,
    cascade_complete=true, cascade_timestamp=<ISO8601>
  }

Step 7 — B15 Structure 보드 자동 등록 (옵션):
  if (structure_id set + structure_auto_add_on_exit=true):
    # items 계층 순서 의무: Initiative(0) → Epic(1) → Story/OP-*(2) → Sub-task(3)
    # depth = 직전 row 대비 상대값. Epic 루프마다 해당 Epic 하위 항목 묶어 배치 후 다음 Epic 은 depth=1 로 reset.
    items = [
      {"key": initiative_key,  "depth": 0},        # Initiative (parent_initiative 재사용 포함)
      # per-epic 루프 (epic_id_map 순서):
      {"key": epic_key,        "depth": 1},         # Epic
        {"key": story_key,     "depth": 2},         # Epic 하위 Story
          {"key": subtask_key, "depth": 3},         # Story 하위 Sub-task
        {"key": op_task_key,   "depth": 2},         # Epic 하위 OP-* Task (Story sibling)
      # 다음 Epic → depth=1 reset
    ]
    jira_structure_add_issues (structure_id=$structure_id, items=items, under_key=None)
    → matrix.ticket_ref.structure_tree_url 채움 / version_after 캡쳐
    → 모든 ticket 의 structure_complete=true

Step 8 — enter Task 종결:
  if exists enter_task_ids.plan:
    jira_transition (enter_task_ids.plan → Done)
```

#### phase=update-test-red (chain 4 RED gate 통과 후 / 신규 생성 ❌)

```
for each TASK-* (Sub-task) in test-spec.coverage:
  jira_transition (subtask_id[task_id] → "Testing")
  jira_comment (subtask_id[task_id], "RED evidence: test-spec.json + 5종 물증 link")

# Story status 는 변경 ❌ (implement 종료 후 일괄 Done)
```

#### phase=update-impl-green (chain 5 GREEN gate 통과 후 / 신규 생성 ❌)

```
for each TASK-* (Sub-task) in impl-spec.coverage:
  jira_transition (subtask_id[task_id] → "Done")
  jira_comment (subtask_id[task_id], "GREEN evidence + commit_hash: {sha}")

for each Story:
  if all subtasks under story → status=Done:
    jira_transition (story_id → "Done")

# Epic 의 Done 전이 = 사용자 manual (FE 화면 단위 = 본 cycle 외 화면 추가 가능)
```

각 호출 = Bash 로 stdout/stderr 캡쳐 → 7-field evidence record (`mcp_invocations[]` append).

### 단계 6b — MCP 호출 (mode=verification 분기 / plugin dogfood meta-cycle 전용)

verification mode 는 plugin 본 작동 검증 / plugin 자체 dogfood meta-cycle 전용. `parent_epic` 의무 — 미명시 시 reject + Block error.

standard mode 와의 본질 차이:
| 축 | standard | verification |
|---|---|---|
| Initiative 생성 | parent_epic 미명시 시 자동 (1건) | ❌ skip (parent_epic 재사용 의무) |
| Epic 생성 | task-plan.epics[] 기반 N건 | ❌ skip (parent_epic 직접 매핑) |
| Story 단위 | per BHV cluster (task-plan.stories[] N건) | per chain stage (analysis/discovery/spec/plan/test/implement 5+1=6건) |
| Sub-task 단위 | TASK-_ (task-plan.tasks[]) / OP-_ (operational-task.json) | per Story 의 산출물 / UC / AC / TC |
| 사용 시점 | 실 도메인 feature 개발 cycle | plugin 검증 / migration meta-cycle |

verification mode 6 stage 본문 (analysis/discovery/spec/plan/test/implement Story 5+1=6건):

```
# 단일 본 skill 호출 안 6 Story 일괄 cascade — verification meta-cycle 의 stage 표현용
1. for each stage in [analysis, discovery, spec, plan, test, implement]:
   jira_create (role=story,
                parent=$parent_epic via parent_strategy,
                summary="[Plugin Verify] Stage N — {stage}",
                labels=[verification-mode, $scope_id])
   → verification_story_ids[stage]
2. for each stage:
   for each artifact in stage 산출물:
     jira_create (role=subtask,
                  parent_ticket_id=verification_story_ids[stage],
                  summary="[Verify artifact] {artifact_name}",
                  status=Done)
     B14 — Sub-task payload extra_fields[epic_link_customfield_id] 명시 ❌
   jira_comment (verification_story_ids[stage], "<stage> gate result + 5종 물증 link")
   jira_transition (verification_story_ids[stage] → "Done")
3. B15 — if (structure_id set + structure_auto_add_on_exit=true):
   # items = per-story 루프. depth=0 = under_key($parent_epic) 의 직접 자식.
   items = [
     {"key": story_key,     "depth": 0},   # Stage Story (per-stage 루프)
       {"key": subtask_key, "depth": 1},   # Story 하위 artifact Sub-task
   ]
   jira_structure_add_issues (structure_id=$structure_id, items=items, under_key=$parent_epic)
   → cycle 종료 마무리 evidence
4. jira_comment ($parent_epic,
                 "verification cycle 종결 — 6 Story keys + Q1~Q6 pass/fail summary
                  + traceability-matrix 100% green + commit hash + findings 링크")
```

verification mode 는 `traceability-matrix.ticket_ref.verification_mode=true` + `verification_story_ids` map 추가.

### 단계 7 — Evidence 기록

`<project>/.aimd/output/evidence/ticket-sync-plan-<phase>-<timestamp>.json` 작성 (schema: `ticket-sync-evidence.schema.json` / stage const=plan):

```json
{
  "meta": {...},
  "stage": "plan",
  "phase": "exit",
  "scope": "car",
  "ticket_cascade": {
    "initiative_id": "MIG-1",
    "epic_id_map": {"EPIC-CAR-DASH": "DWPD-1234", ...},
    "story_id_map": {"STORY-CAR-001": "DWPD-1235", ...},
    "op_task_id_map": {"OP-CAR-001": "DWPD-1236", ...},
    "subtask_id_map": {"TASK-CAR-001": "DWPD-1237", ...},
    "cascade_complete": true
  },
  "mcp_invocations": [
    {
      "mcp_tool_name": "mcp__wiki-jira-assistant__jira_create",
      "tool_stdout_path": ".aimd/output/evidence/mcp-stdout-1.log",
      "tool_stderr_path": ".aimd/output/evidence/mcp-stderr-1.log",
      "tool_version": "1.4.2",
      "invocation_timestamp": "2026-05-26T14:30:00+09:00",
      "duration_ms": 1234,
      "result_hash": "abc...",
      "reproduction_command": "mcp__wiki-jira-assistant__jira_create with body=...",
      "ticket_id_created": "DWPD-1234"
    }
  ],
  "confirmation_gate": {
    "preview_md_digest": "def...",
    "user_response": "yes",
    "intervention_log_ref": ".aimd/output/intervention-log.jsonl#entry=2026-05-26T14:29:55"
  },
  "search_first_idempotency": {
    "lookup_count": 13,
    "skip_count": 0
  },
  "graceful_mcp_missing": {
    "probe_result": "available",
    "fallback_path": null
  },
  "evidence_trust": "real_tool",
  "dry_run": false
}
```

### 단계 8 — traceability-matrix 갱신

각 Story / Sub-task entry 의 `ticket_ref.status_history[]` append + `ticket_ref.id` / `epic_id` / `story_id` / `subtask_ids` 채움. 본 갱신 후 `_base-build-traceability-matrix` skill 재호출 (forward_coverage 갱신).

### 단계 9 — intervention-log append

```jsonl
{
	"timestamp": "2026-05-26T14:30:00Z",
	"skill": "ticket-sync",
	"stage": "plan",
	"phase": "exit",
	"scope": "car",
	"decision": "ticket_sync_confirmed",
	"mcp_invocation_count": 38,
	"idempotency_skip_count": 0,
	"cascade_complete": true,
	"evidence_ref": ".aimd/output/evidence/ticket-sync-plan-exit-20260526T143000.json",
	"user": "reviewer@example.com"
}
```

## 금지 / 강제력

- **stage paradigm 위반 ❌ (R20-prime 본격)** — args.stage ∈ {analysis, discovery, spec, test, implement} 시 reject. `F-TICKETSYNC-012 stage_paradigm_violation` finding emit. ticket 생성 = plan stage 한 곳.
- **simulated evidence_trust ❌** — schema-level 영구 거부 (R15 / R19 simulated 영구 reject sibling)
- **fire-and-forget ❌** — 모든 MCP 호출 직전 confirmation gate 의무
- **parallel MCP 호출 ❌** — sequential only (결정론 axis 보호)
- **state.blocked 시 MCP 호출 ❌** — `hooks/hooks.json` PreToolUse matcher 가 `mcp__wiki-jira-assistant__.*` deny
- **R16/R17 부활 ❌** — 본 skill = R20-prime 채널 (drift attractor 회피)
- **orphan ticket ❌ (environment-aware)** — role ∈ {`subtask`, `story`, `task`, `tech_debt`, `bug`} 생성 시 parent linking 의무 — `parent_strategy=parent_key` 시 `parent_ticket_id` / `parent_strategy=epic_link_customfield` (또는 auto + epic_link set) 시 `extra_fields[epic_link_customfield_id]` 중 1개 채움. Initiative / Epic top-level 만 omit 가능. 위반 시 `F-TICKETSYNC-002 missing_parent` finding emit.
- **link_type drift ❌** — Sub-task / Story / Epic 의 link_type = `parent-child` 의무. `relates-to` / `blocks` 등 = cross-cutting (Tech Debt / Spike / 도메인 횡단 BR) 만 허용.
- **mode=verification + parent_epic 미명시 ❌** — `mode=verification` 시 `parent_epic` 의무. 미명시 시 reject + Block error. 위반 시 `F-TICKETSYNC-003 verification_missing_parent_epic` finding emit.
- **environment hardcode ❌** — SKILL.md 본문의 `Story` / `Sub-task` / `Initiative` / `Epic` 표기는 **role label**. 실 MCP payload 의 `issue_type` 값은 §단계 5 prelude 의 resolve 결과 직접 인용 의무. 위반 시 `F-TICKETSYNC-009 issuetype_hardcode_drift` finding emit + 호출 reject.
- **parent_strategy 우회 ❌** — `parent_strategy ∈ {epic_link_customfield, auto + epic_link_customfield_id set}` 환경에서 일반 issue (`story` / `task` / `tech_debt` / `bug`) 의 `parent` 필드 직접 채움 ❌. 반드시 `extra_fields[epic_link_customfield_id]` 사용. 위반 시 `F-TICKETSYNC-010 parent_strategy_environment_mismatch` finding emit.
- **B14 Sub-task Epic Link customfield 명시 ❌** — role=`subtask` 의 `jira_create` payload 에 `extra_fields[epic_link_customfield_id]` (예: DWPD `customfield_10006`) 명시 ❌. Sub-task 의 Epic Link 은 parent Story / Task 로부터 auto-inherit. 명시 시 backend 400 reject. 위반 시 `F-TICKETSYNC-011 subtask_epic_link_violation` finding emit + 호출 reject.

## 사용자 결단 9건

1. **Jira workflow transition target IDs** — project-specific / `jira_transitions` 사전 lookup 의무
2. **Confluence emit 범위** — Initiative overview default false / per-stage 보고서 page = 미지원 (후보)
3. **Auto-invoke 정책** — chain 3 plan gate 통과 후 본 skill auto-suggest (confirmation 만 사용자) 권고. `chain-driver next` 명령이 plan stage 전이 직후 stderr only suggest 송출.
4. **Idempotency** — search-first 권고 (재실행 시 기존 ticket lookup skip + status_history 만 갱신)
5. **MCP 미연결 환경** — silent skip + finding emit 권고. probe 는 tools-deferred-list 우선.
6. **mode 선택** — `standard` (default / 실 도메인 feature cycle / Initiative+Epic 자동 생성) / `verification` (plugin dogfood meta-cycle / parent_epic 의무).
7. **environment bridge** — 신규 Jira 환경 첫 도입 시 issuetype_map / parent_strategy / epic_link_customfield_id 1회 setup.
8. **Sub-task Epic auto-inherit invariant (B14)** — 모든 `parent_strategy` 환경 공통: Sub-task 의 Epic Link 은 parent Story / Task 로부터 auto-inherit. Sub-task `jira_create` payload 에 `extra_fields[epic_link_customfield_id]` 명시 ❌.
9. **Structure 보드 자동 등록 (B15)** — Atlassian Structure 사용 환경에서 `structure_id` 명시 시 phase=exit 종료 시점에 `jira_structure_add_issues` 자동 호출 표준화. DWPD 환경 reference: `structure_id=676`.

## 인용

- R20-prime 결단: `decisions/DEC-2026-05-26-ticket-plan-단일.md`
- paradigm SSOT: `decisions/DEC-2026-05-26-v11-paradigm-결단.md` §3 (ticket = plan 한 곳)
- 결단 record: `decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md`
- verification mode: `decisions/DEC-2026-05-20-r20-verification-mode.md` (parent_epic override)
- environment bridge: `decisions/DEC-2026-05-20-r20-environment-bridge.md` (issuetype_map + parent_strategy + epic_link_customfield_id)
- B14 + B15: `decisions/DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md` (subtask auto-inherit + structure auto)
- 정책 본문: `methodology-spec/ticket-policy.md` §Tier 2.5
- ID 명명: `methodology-spec/id-conventions.md` §Ticket Binding
- Evidence schema: `schemas/ticket-sync-evidence.schema.json` (stage const=plan)
- task-plan schema: `schemas/task-plan.schema.json` (epics + stories + tasks + layer 분기)
- operational-task schema: `schemas/operational-task.schema.json` (OP-\* Story sibling)
- Traceability matrix: `schemas/traceability-matrix.schema.json` matrix.items.ticket_ref.status_history
- Hook config: `hooks/hooks.json` PreToolUse matcher (state.blocked deny path)
- R20-prime charter entry: `methodology-spec/plugin-charter.md` §1+§2
- R16/R17 영구 scope-out parent: `decisions/DEC-2026-05-15-g1-itsm-permanent-scope-out.md` §31
- Tier 1 (manual) 선행: `decisions/DEC-2026-05-18-ticket-binding-policy.md`
