---
name: ticket-sync
description: v11.0.0 R20-prime (DEC-2026-05-26-ticket-plan-단일). **plan stage 단일** 진입 — Epic(FE 화면) + Story(BHV/AC cross-cut) + Task(OP-* Story sibling / 사용자 가시 없는 운영·인프라·마이그레이션·리팩터링 / layer 무관) + Sub-task(TASK-* / 1~3 AC 묶음 / layer 분기 be/fe/db/e2e/infra) **4-level cascade 일괄 생성**. analysis/discovery/spec stage 는 ticket 호출 ❌. test/implement stage 는 Sub-task status 갱신만 (신규 생성 ❌). 모든 MCP 호출 직전 사용자 confirmation gate 의무 (preview MD → yes/no/dry-run). 7-field evidence 캡쳐 + search-first idempotency + graceful MCP-missing.
allowed-tools: Read, Write, Edit, Bash, mcp__mcp-server-wiki-jira__jira_create, mcp__mcp-server-wiki-jira__jira_link, mcp__mcp-server-wiki-jira__jira_transition, mcp__mcp-server-wiki-jira__jira_comment, mcp__mcp-server-wiki-jira__jira_search, mcp__mcp-server-wiki-jira__jira_update, mcp__mcp-server-wiki-jira__jira_assign, mcp__mcp-server-wiki-jira__jira_transitions, mcp__mcp-server-wiki-jira__jira_label_add, mcp__mcp-server-wiki-jira__jira_issue, mcp__mcp-server-wiki-jira__jira_structure_add_issues, mcp__mcp-server-wiki-jira__jira_structure_get, mcp__mcp-server-wiki-jira__wiki_page_create, mcp__mcp-server-wiki-jira__wiki_page_update, mcp__mcp-server-wiki-jira__wiki_search_cql, mcp__mcp-server-wiki-jira__wiki_spaces, mcp__wiki-jira-assistant__jira_create, mcp__wiki-jira-assistant__jira_link, mcp__wiki-jira-assistant__jira_transition, mcp__wiki-jira-assistant__jira_comment, mcp__wiki-jira-assistant__jira_search, mcp__wiki-jira-assistant__jira_update, mcp__wiki-jira-assistant__jira_assign, mcp__wiki-jira-assistant__jira_transitions, mcp__wiki-jira-assistant__jira_label_add, mcp__wiki-jira-assistant__jira_issue, mcp__wiki-jira-assistant__jira_structure_add_issues, mcp__wiki-jira-assistant__jira_structure_get, mcp__wiki-jira-assistant__wiki_page_create, mcp__wiki-jira-assistant__wiki_page_update, mcp__wiki-jira-assistant__wiki_search_cql, mcp__wiki-jira-assistant__wiki_spaces, ListMcpResourcesTool
---

# ticket-sync (R20-prime / v11.0.0 paradigm)

**R20-prime** — **ticket 생성 = plan stage 한 곳** (Epic + Story + Task(OP-\*) + Sub-task(TASK-\*) 4-level cascade).

## paradigm 개요

ticket 생성 = **plan stage 단일** 4-level cascade (상세 paradigm/근거 = `methodology-spec/ticket-policy.md` §1~2). 각 level 정의:

- **Epic** = FE 화면(route) 단위 또는 BE-domain 묶음
- **Story** = BHV/AC cross-cut anchor (behavior-spec.BHV-* + acceptance-criteria.AC-* 묶음 / BE+FE/DB/E2E 가로지름)
- **Task (OP-*)** = 사용자 가시 없는 운영·인프라·마이그레이션·리팩터링 (layer 무관 / 가르는 축 = 사용자 가시 가치 변화 부재 / Story sibling)
- **Sub-task (TASK-*)** = task-plan.tasks[] / 1~3 AC 묶음 + layer 분기 (be/fe/db/e2e/infra)

(stage별 동작 = 아래 §언제 사용 / **R16/R17 부활 ❌** — Tier 2.5 = MCP delegation only)

## 언제 사용

| 호출 시점                                                           | stage 파라미터 | phase               | 동작                                                                                                              |
| ------------------------------------------------------------------- | -------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **chain 3 (plan) gate 통과 직후** (`plan-coverage-validator` green) | `plan`         | `exit`              | **4-level cascade 일괄 생성** — Epic(FE 화면 또는 BE-domain) + Story(BHV/AC 묶음) + Task(OP-_) + Sub-task(TASK-_) |
| chain 4 (test, RED) gate 통과 후                                    | `plan`         | `update-test-red`   | Sub-task(TASK-\*) status=Testing 전이 + RED evidence comment (신규 생성 ❌)                                       |
| chain 5 (impl, GREEN) gate 통과 후                                  | `plan`         | `update-impl-green` | Sub-task(TASK-\*) status=Done + GREEN evidence + commit_hash + Story=Done 전이 (신규 생성 ❌)                     |
| (선택) plan stage 진입 시                                           | `plan`         | `enter`             | "[Chain 3] {scope} plan 작성 시작" 의무 작업 Task 1건 (Story 부재 시 생성 skip / scope Epic 하위)                 |

analysis/discovery/spec stage 에서 본 skill 호출 시 `F-TICKETSYNC-012 stage_paradigm_violation` finding emit + reject (R20-prime 정합).

**MCP 미연결 환경 무영향** — jira-confluence MCP(신버전 `mcp__mcp-server-wiki-jira__*` 또는 구버전 `mcp__wiki-jira-assistant__*`) 부재 시 silent skip + `F-TICKETSYNC-001 mcp_unavailable` finding emit (opt-in 설계 / error halt ❌).

## 파라미터

| 파라미터                     | 타입    | 기본                                      | 비고                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `stage`                      | const   | **`plan`**                                | `plan` 단일 const (analysis/discovery/spec/test/implement enum 미지원)                                                                                                                                                                                                                                                  |
| `phase`                      | enum    | **`exit`**                                | `enter` (plan stage 진입 작업 Task) \| `exit` (4-level cascade 일괄 / 본 skill 본 흐름) \| `update-test-red` (chain 4 RED) \| `update-impl-green` (chain 5 GREEN)                                                                                                                                                                    |
| `scope`                      | string  | state.scope                               | G3 scope slug (예: `car` / `payroll`) — `.ai-context/<scope>/` 경로 추출                                                                                                                                                                                                                                                                   |
| `dry_run`                    | boolean | **`true`**                                | default true — reproduction_command 만 print / MCP 호출 ❌. 사용자 OK 후 `dry_run=false` 명시 호출.                                                                                                                                                                                                                                  |
| `confluence_emit`            | boolean | `false`                                   | plan stage exit 시 Initiative-level Confluence overview page 생성 (default false)                                                                                                                                                                                                                                                    |
| `parent_epic`                | string  | (없음)                                    | 명시 시 standard flow 의 Initiative 생성 skip + 본 Epic 키 하위에 직접 매핑. Initiative 생성 권한 부재 환경 / verification meta-cycle / migration carry / 기존 Epic 재사용 시 사용. `mode=verification` 시 의무. 예: `DWPD-1442`.                                                                                                    |
| `parent_initiative`          | string  | (없음)                                    | 앱/제품 단위 Initiative 키 명시. 명시 시 Initiative 신규 생성 스킵 + 해당 키를 최상위로 재사용. 미명시 시 jira_search 로 기존 Initiative 탐색 후 발견 시 재사용, 미발견 시 신규 생성. env-config (`.ai-context/ticket-sync-config.yaml` 안 `parent_initiative`) 에서도 읽음. 예: `MIS-58` (SmileApp Initiative).                        |
| `mode`                       | enum    | **`standard`**                            | `standard` (default / R20-prime 본격 — task-plan.json 기반 4-level cascade) \| `verification` (plugin dogfood meta-cycle 전용 / `parent_epic` 의무).                                                                                                                                     |
| `issuetype_map`              | object  | env default                               | role → name/id resolve. role enum = `initiative` \| `epic` \| `story` \| `task` \| `subtask` \| `bug` (canonical 6종). 미명시 시 env-config (`.ai-context/ticket-sync-config.yaml` 안 `issuetype_map`) 또는 기본값 (Atlassian 표준). DWPD 환경 예: `{story:"작업", subtask:"하위 작업", initiative:"epic", task:"작업"}`. |
| `parent_strategy`            | enum    | **`auto`**                                | `auto` (default — role=subtask 는 `parent_key`, 그 외 role 은 `epic_link_customfield_id` set 이면 customfield, 미set 이면 `parent_key`) \| `parent_key` \| `epic_link_customfield`.                                                                                       |
| `epic_link_customfield_id`   | string  | env (`EPIC_LINK_CUSTOMFIELD`) 또는 (없음) | `parent_strategy ∈ {epic_link_customfield, auto}` 시 Epic Link customfield ID. DWPD 환경 reference: `customfield_10006`.                                                                                                                                                                                                             |
| `parent_link_customfield_id` | string  | env-config 또는 (없음)                    | role=`epic` 의 Initiative 부모 링크 customfield ID. set 시 Epic 생성 시 `extra_fields[parent_link_customfield_id] = <initiative_key>` 사용 — `parent_key` 보다 우선. 미set 시 `parent_key` 시도 → 400 reject 시 `jira_link (Relates)` fallback. **SG-MIS 환경(jira.smilegate.net) reference: `customfield_11902`** (Parent Link 필드). 타 Jira 인스턴스는 Jira 필드 설정에서 "Parent Link" customfield ID 확인 후 기재. <!-- allow-identity: SG-MIS 환경 config reference (사내 공통 / 개인 신원 아님) --> |
| `structure_id`               | string  | env-config 또는 (없음)                    | Atlassian Structure (ALM Works DWP-Forge) tree ID. set 시 phase=exit 종료 후 `jira_structure_add_issues` 자동 호출 표준 (모든 신규 ticket 등록). **SG-MIS 환경 reference: `684`** (SG-MIS board). Jira Structure board URL 의 `s=<숫자>` 파라미터 값으로 확인.                                                                                                                                                         |
| `structure_auto_add_on_exit` | boolean | `true` (단 `structure_id` set 일 때)      | true 시 phase=exit 마다 자동 호출 표준 (drift attractor 회피).                                                                                                                                                                                                                                                                       |

## 이슈 유형 네이밍 규칙 & 설명 템플릿

사내 표준 (`jira_이슈유형_표준템플릿`) 준수. MCP `jira_create` 호출 시 아래 규칙을 그대로 반영한다.

### Summary 네이밍

| role       | 규칙                                | 형식 예시                              |
| ---------- | ----------------------------------- | -------------------------------------- |
| epic       | **메뉴명 그대로** (화면명)          | `내근무현황` / `휴가신청`              |
| story      | **명사형** — 사용자가 할 수 있는 것 | `연차 잔여일수 조회` / `근무시간 엑셀 다운로드` |
| task (OP)  | **무엇을 어떻게 한다**              | `[OP-{id}] 근태 계산 배치 리팩토링`    |
| subtask    | **레이어 + 작업 내용**              | `[TASK-{id}] {layer} {title}`          |
| bug        | **발생위치 + 무엇이 + 어떻게 됨**  | `내근무현황 1주차 근태 집계 누락`      |

> Epic·Story 는 내부 ID 브래킷(`[Epic-fe]`, `[Story]`) **없이** 실제 메뉴명·기능명만 사용한다.
> OP-Task·Sub-task 는 traceability를 위해 `[OP-xxx]` / `[TASK-xxx]` 브래킷 유지.

---

### Description 본문 템플릿

#### Epic
```
■ 화면 개요
- 신규 — {신규 제공 목적 한 줄}
- 기존 — {기존 화면에 추가되는 내용} (해당 없을 시 생략)

■ 화면 경로
{route or URL path (예: /hr/my-attendance)}

■ 비고
- 본 Epic은 화면이 서비스되는 동안 닫지 않으며(open 유지), 이후 일감은 성격에 따라 하위에 이야기/작업/버그로 계속 추가한다.
```

#### Story
```
■ 기능 목적
나는 {사용자 유형}으로서 {기능 목적}을 원한다. 왜냐하면 {이유}이기 때문이다.

■ 상세 내용
{behavior-spec.BHV-* 기반 기능 상세}

■ 완료 조건
- {acceptance-criteria.AC-* 항목 나열}
```

#### Task (OP-\*)
```
■ 작업 내용
{작업 상세 설명}

■ 작업 사유 (왜 Task인가)
화면 동작이나 결과는 그대로이고 내부 구조만 개선/변경하는 작업으로, 사용자 가치 변화가 없으므로 Task로 등록한다.

■ 완료 조건
- {완료 판단 조건 나열}
```

#### Sub-task (TASK-\*)
```
■ AC 범위
{task.ac_refs 나열 (예: AC-XXX-001, AC-XXX-002)}

■ 레이어
{task.layer (be / fe / db / e2e / infra)}

■ API / 컴포넌트 참조
{task.openapi_endpoint_ref 또는 component_ref (없으면 생략)}
```

#### Bug
```
■ 전제조건
{버그 재현을 위한 사전 상태}

■ 재현절차
1. {단계 1}
2. {단계 2}
3. {단계 3}

■ 재현결과
{실제로 발생한 현상}

■ 기대결과
{원래 되어야 하는 정상 동작}

■ 문제
{해당 버그로 인한 영향 또는 문제}

■ 해결 방향
{수정 방향 또는 원인 추정}
```

---

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
   - 정식 path = `<project>/.ai-context/state.json` (단일 file / scope 는 `state.current_scope` 필드).
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

> **델타 생성 우선 (DEC-2026-06-10)**: ref 에 `jira_id` 가 이미 있거나 `pre_existing=true` 면 = 기존 티켓 확정 → **search 생략 + 생성 skip** (본 §단계 2 는 jira_id 미보유 ref 에만 적용). `prebound_reused_count` 로 기록.

`{_mcp_prefix}jira_search` (§단계 1 resolve 결과) JQL 로 기존 ticket lookup.

**1차 — 커스텀 필드 JQL** (해당 Jira 환경에 아래 커스텀 필드가 구성된 경우만):

```
JQL (Story per BHV cluster): project = <PROJECT_KEY> AND "BHV cluster" ~ "{bhv_cluster_id}"
JQL (Sub-task per TASK-*):  project = <PROJECT_KEY> AND "TASK ID" ~ "TASK-CAR-001"
JQL (Epic per screen):      project = <PROJECT_KEY> AND "Screen ID" ~ "SCR-CAR-DASH"
JQL (OP-* Task):            project = <PROJECT_KEY> AND "OP ID" ~ "OP-CAR-001"
```

**2차 — fallback (커스텀 필드 부재 / 1차 결과 0건 또는 400 reject 시 의무)**: 표준 필드 `summary` + `labels` 로 재조회. 트레이스 ID 는 summary 브래킷(`[TASK-CAR-001]` / `[OP-CAR-001]`) 또는 label 에 박혀 있으므로 환경 무관 검색 가능:

```
JQL (Sub-task per TASK-*): project = <PROJECT_KEY> AND summary ~ "[TASK-CAR-001]"
JQL (OP-* Task):           project = <PROJECT_KEY> AND summary ~ "[OP-CAR-001]"
JQL (Story / Epic):        project = <PROJECT_KEY> AND summary ~ "{title}"   # Epic·Story 는 브래킷 없음 → 정확 일치 확인 후 사용자 confirm
```

> ⚠️ **idempotency 무력화 방지**: 1차 커스텀 필드 JQL 이 그 환경에 없는 필드명을 쓰면 **조용히 0건** 반환 → 중복 생성 위험. 따라서 커스텀 필드 미구성 환경에서는 **2차 fallback 의무**. 1차/2차 모두 0건일 때만 "신규 생성" 으로 분기.

- 발견 시 → `ticket_ref.id` 채움 + `status_history` 갱신 path 만 진행 (신규 생성 ❌)
- 부재 시 (1차+2차 모두 0건) → 신규 생성 path 진행
- `idempotency_skip_count` 증가 기록 (+ `search_first_idempotency.search_path` = `custom_field` \| `fallback_summary` 기록)

### 단계 3 — Preview MD 생성

plan stage exit 의 4-level cascade preview. 아래 골격 의무 포함 (예: scope=car):

```markdown
## Preview — ticket-sync stage=plan phase=exit scope=car

### 4-level cascade (신규 생성 예정 / idempotency check 후)
- **Level 1 Epic** (FE 화면 또는 BE-domain): id / type / summary  — 예) EPIC-CAR-DASH · FE screen · 차량 대시보드 화면
- **Level 2 Story** (per BHV cluster): summary / 부모 Epic / BHV·AC 묶음  — 예) 차량 등록 시나리오 · EPIC-CAR-DASH · BHV-CAR-001 + AC-CAR-{001~005}
- **Level 3 Task(OP-*)** (Story sibling): OP id / type / summary / 부모 Epic  — 예) OP-CAR-001 · infra · DB 인덱스 추가 · EPIC-CAR-BACK
- **Level 4 Sub-task(TASK-*)** (1~3 AC / layer): TASK id / layer / 부모 Story|OP / AC 묶음  — 예) TASK-CAR-001 · be · 차량 등록 backend API · AC-CAR-006~007

### Skip 예정 (기존 ticket 발견 / status_history 만 갱신): ticket / 기존키 / 사유
### MCP 호출 sequence: {_mcp_prefix}jira_create 를 Initiative→Epic→Story→OP→Sub-task 순서로 N회 (parent 명시)
### 추정 비용: MCP 호출 N회 (Epic+Story+OP+TASK+transitions) / 예상 시간
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

본 §단계 6 본문이 사용하는 `Initiative` / `Epic` / `Story` / `Task` / `Sub-task` / `Bug` (canonical 6종) 의 명명은 **role label**. 실 MCP 호출 시점에 다음 resolve table 적용 의무.

**resolve 알고리즘 (의무)**:

1. **issuetype resolve**:
   - args.`issuetype_map[role]` 우선 → 없으면 env-config (`.ai-context/ticket-sync-config.yaml` 안 `issuetype_map`) → 없으면 default table 적용:

   | role       | default name    | DWPD 환경 reference |
   | ---------- | --------------- | ------------------- |
   | epic       | Epic            | epic                |
   | initiative | Initiative      | epic                |
   | story      | Story           | 작업 (또는 새 기능) |
   | subtask    | Sub-task        | 하위 작업           |
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
     - role ∈ {`story`, `task`, `bug`} 시 `epic_link_customfield_id` 가 set 이면 → `extra_fields[epic_link_customfield_id] = <parent_epic>`. 미set 시 → `parent_key` fallback. 둘 다 400 reject 시 → `jira_link (Relates)` fallback.
     - role=`epic` (Initiative 하위 Epic 생성 시):
       - `parent_link_customfield_id` set 이면 → `extra_fields[parent_link_customfield_id] = <initiative_key>` **우선** (SG-MIS 사내 표준: `customfield_11902` / 타 Jira 인스턴스는 env-config 에서 확인).
       - 미set 이면 → `parent_key=<initiative_key>` 시도. 400 reject 시 → `jira_link (Relates)` fallback.
       - `F-TICKETSYNC-013 epic_initiative_link_fallback` finding emit (fallback 발생 시 env-config `parent_link_customfield_id` 설정 권고).
     - role=`initiative` → top-level (parent 없음).
   - `parent_strategy=parent_key`: 모든 role 이 `parent_key` 시도 (DWPD 환경에서는 일반 issue 가 400 reject — `F-TICKETSYNC-010 parent_strategy_environment_mismatch` finding).
   - `parent_strategy=epic_link_customfield`: Sub-task = `parent_key` 만 / 그 외 = `extra_fields[epic_link_customfield_id]`. B14 — Sub-task 에 `extra_fields[epic_link_customfield_id]` 추가 시도 시 backend 400 reject. `epic_link_customfield_id` 미명시 + 일반 issue 시 `F-TICKETSYNC-005 missing_epic_link_customfield` finding + reject.

4. **호출 sequence 의무**:
   - jira_create payload 의 `issue_type` + parent linking 필드는 위 resolve 결과 직접 인용 (no-simulation / SKILL.md 본문 hardcode 표기 인용 ❌).
   - jira_create 실패 (400/403) 시 — error message parse 후 `F-TICKETSYNC-008 environment_drift` finding emit + 환경별 resolve table 보강 권고 evidence 누적.

본 prelude 는 §단계 6 standard mode + §단계 6b verification mode 모두 적용.

**환경별 config** — `.ai-context/ticket-sync-config.yaml` 의 환경별 구체 값(generic skeleton + DWPD / SG-MIS 사내 표준 reference)은 [`env-config-reference.md`](./env-config-reference.md). resolve 알고리즘·default 표는 위 본 §단계 5 유지. 핵심: `issuetype_map`(role→실 이름) + `parent_strategy`(epic_link_customfield 권장) + `epic_link_customfield_id`(Story→Epic) + `parent_link_customfield_id`(Epic→Initiative) + (선택) `structure_id`.

### 단계 6 — MCP 호출 (sequential / 결정론 보호 / mode=standard)

**plan stage phase=exit 4-level cascade 일괄**.

#### phase=enter (선택 / plan stage 진입 작업 Task)

```
plan enter:
  jira_create (role=task,
               summary="[Chain 3] {scope} plan 작성 시작",
               parent=Epic(scope) if exists else parent=Initiative,
               status=To Do)
  → enter_task_id = 전이용 transient id (evidence 에만 기록 / traceability-matrix.ticket_ref 영속 ❌ — cascade 4-level 만 영속)
```

enter phase 후 작업 시작 시점 → 사용자 manual 또는 hook 자동 `jira_transition` (To Do → In Progress).

#### phase=exit — 4-level cascade (델타 생성)

**델타 생성 원칙** — ref(epic_refs/story_refs/op_task_refs)에 **`jira_id` 가 이미 있으면 (또는 `pre_existing=true`) = 기존 티켓 → 생성 skip, 부모로만 사용**. 없으면 신규 생성. 즉 **없는 티켓(델타)만 딴다**. discovery 가 `existing_ticket_refs` 로 전달한 Epic/Story 가 plan-decompose 를 거쳐 jira_id 로 들어옴.

**기존/신규 판정 우선순위** (per ref): ① `jira_id` 사전 보유 → 기존 (skip / 부모로만, search 생략) → ② §단계 2 search-first idempotency 발견 → 기존 → ③ 둘 다 부재 → 신규 생성.

```
Step 1 — Initiative (선택 / parent_epic 미명시 시):
  if !parent_epic:
    jira_create (role=initiative, summary="[Migration] {scope} initiative", status=To Do)
    → initiative_id 저장
  else:
    initiative_id = parent_epic (재사용)

Step 2 — Epic (per FE 화면 또는 BE-domain 묶음 / 델타):
  for each epic in task-plan.epic_refs[]:
    if epic.jira_id set OR epic.pre_existing:           # 기존 Epic
      epic_id_map[epic.screen_id||epic.jira_id] = epic.jira_id   # 생성 skip, 부모로만
      reused_count++; continue
    # 신규 — 네이밍: 메뉴명 그대로 (브래킷 없이) — §이슈 유형 네이밍 규칙 Epic 규칙
    summary = epic.title  # 예: "내근무현황", "휴가신청"
    body = §"이슈 유형 네이밍 규칙 & 설명 템플릿" > Epic 템플릿 채움 (epic.description + epic.route|discovery-spec 경로)
    jira_create (role=epic, summary=summary, parent_ticket_id=initiative_id, link_type=parent-child, labels=[epic.type], body=body)
    → epic_id_map[epic.screen_id||새 키] = 신규 키 (+ epic.jira_id 채움)

Step 3 — Story (per BHV cluster / cross-cut anchor / 델타):
  for each story in task-plan.story_refs[]:
    if story.jira_id set OR story.pre_existing:         # 기존 Story
      story_id_map[story.behavior_ref||story.jira_id] = story.jira_id   # 생성 skip, 부모로만
      reused_count++; continue
    # 신규 — 네이밍: 명사형 기능명 (브래킷 없이) — §이슈 유형 네이밍 규칙 Story 규칙
    summary = story.title  # 예: "연차 잔여일수 조회", "근무시간 엑셀 다운로드"
    body = §"이슈 유형 네이밍 규칙 & 설명 템플릿" > Story 템플릿 채움 (story.user_role/user_action/because + BHV-* 상세 + AC-* 완료조건)
    # 부모 Epic = epic_ref 가 (a) 이번에 만든 키 또는 (b) 기존 키 — 둘 다 epic_id_map 로 resolve
    jira_create (role=story, summary=summary, parent=epic_id_map[story.epic_ref] via parent_strategy, body=body)
    → story_id_map[story.behavior_ref||새 키] = 신규 키 (+ story.jira_id 채움)

Step 4 — Task (per OP-* / Story sibling / 사용자 가시 없는 운영·인프라·마이그레이션·리팩터링 / layer 무관 / 델타):
  for each op_task in operational-task.json[] (if exists):
    # op_task_refs[] 안 jira_id 사전 보유 시 = 기존 Task → 생성 skip, op_task_id_map 에 기존 키
    if op_task_ref.jira_id set OR op_task_ref.pre_existing:
      op_task_id_map[op_task.op_id] = op_task_ref.jira_id; reused_count++; continue
    # 신규 — 네이밍: [OP-id] 무엇을 어떻게 한다 — §이슈 유형 네이밍 규칙 Task 규칙
    summary = "[OP-{op_task.op_id}] {op_task.title}"
    body = §"이슈 유형 네이밍 규칙 & 설명 템플릿" > Task(OP-*) 템플릿 채움 (op_task.description + 완료조건 op_task.acceptance_criteria)
    jira_create (role=task, summary=summary, parent=epic_id_map[op_task.epic_ref] via parent_strategy, labels=[op-* + op_task.op_type], status=To Do, body=body)
    → op_task_id_map[op_task.op_id] = 신규 키

Step 5 — Sub-task (per TASK-* / 1~3 AC 묶음 / layer 분기 be/fe/db/e2e/infra):
  for each task in task-plan.tasks[]:
    parent_ref = task.story_ref ? story_id_map[task.story_ref] : op_task_id_map[task.op_task_ref]   # 기존/신규 무관 — map 이 resolve
    # 네이밍: [TASK-id] layer 작업 내용 — §이슈 유형 네이밍 규칙 Sub-task 규칙
    summary = "[TASK-{task.task_id}] {task.title}"
    body = §"이슈 유형 네이밍 규칙 & 설명 템플릿" > Sub-task 템플릿 채움 (task.ac_refs + task.layer + openapi_endpoint_ref|component_ref)
    jira_create (role=subtask,
                 summary=summary,
                 parent_ticket_id=parent_ref, link_type=parent-child,
                 labels=[layer-* + task.layer], status=To Do,
                 body=body)
    B14 — Sub-task payload 안 extra_fields[epic_link_customfield_id] 명시 ❌
    → subtask_id_map[task.task_id] = 신규 키
    # (Sub-task 는 통상 신규 / task.jira_id 사전 보유 시 동일 델타 규칙 적용 — skip + 기존 키)

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
  if exists plan enter_task_id (transient / evidence 기록분):
    jira_transition (plan enter_task_id → Done)
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

### 단계 6b — verification mode (plugin dogfood meta-cycle 전용)

`mode=verification` = plugin 자체 검증 meta-cycle 전용 (`parent_epic` 의무 / 실 도메인 feature cycle 무관). standard 와 본질 차이(Initiative/Epic skip / per-stage Story 6건) + 6-stage cascade 본문 = [`verification-mode.md`](./verification-mode.md).

### 단계 7 — Evidence 기록

`<project>/.ai-context/output/evidence/ticket-sync-plan-<phase>-<timestamp>.json` 작성 (schema: `ticket-sync-evidence.schema.json` / stage const=plan):

골격 (전체 필드·제약 = `schemas/ticket-sync-evidence.schema.json` SSOT):

```json
{
  "meta": {...}, "stage": "plan", "phase": "exit", "scope": "car",
  "ticket_cascade": { "initiative_id", "epic_id_map", "story_id_map", "op_task_id_map", "subtask_id_map", "cascade_complete" },
  "mcp_invocations": [ { /* 7-field 의무: mcp_tool_name(신/구 prefix) · tool_stdout_path · tool_stderr_path · tool_version · invocation_timestamp · duration_ms · result_hash(64hex) · reproduction_command · ticket_id_created */ } ],
  "confirmation_gate": { "preview_md_digest", "user_response", "intervention_log_ref" },
  "search_first_idempotency": { "lookup_count", "skip_count", "search_path": "custom_field|fallback_summary" },
  "graceful_mcp_missing": { "probe_result", "fallback_path" },
  "evidence_trust": "real_tool", "dry_run": false
}
```

### 단계 8 — traceability-matrix 갱신

각 Story entry 의 `ticket_ref.status_history[]` append + `ticket_ref.id` / `level` / `epic_id` / `subtask_refs` (TASK-\*) / `op_task_refs` (OP-\*) 채움. 본 갱신 후 `_base-build-traceability-matrix` skill 재호출 (forward_coverage 갱신).

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
	"evidence_ref": ".ai-context/output/evidence/ticket-sync-plan-exit-20260526T143000.json",
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
- **pre-bound 티켓 재생성 ❌ (델타 생성 / DEC-2026-06-10)** — ref 의 `jira_id` 가 set 이거나 `pre_existing=true` 면 절대 `jira_create` 호출 ❌ (기존 Epic/Story/Task = 부모로만 사용). 위반(기존 키 있는데 신규 생성) 시 `F-TICKETSYNC-014 prebound_ticket_recreated` finding emit + reject. discovery `existing_ticket_refs` → task-plan jira_id 로 전달된 티켓 보호.
- **orphan ticket ❌ (environment-aware)** — role ∈ {`subtask`, `story`, `task`, `bug`} 생성 시 parent linking 의무 — `parent_strategy=parent_key` 시 `parent_ticket_id` / `parent_strategy=epic_link_customfield` (또는 auto + epic_link set) 시 `extra_fields[epic_link_customfield_id]` 중 1개 채움. Initiative / Epic top-level 만 omit 가능. 위반 시 `F-TICKETSYNC-002 missing_parent` finding emit.
- **link_type drift ❌** — Sub-task / Story / Epic 의 link_type = `parent-child` 의무. `relates-to` / `blocks` 등 = cross-cutting (횡단 OP-* / 도메인 횡단 BR) 만 허용.
- **mode=verification + parent_epic 미명시 ❌** — `mode=verification` 시 `parent_epic` 의무. 미명시 시 reject + Block error. 위반 시 `F-TICKETSYNC-003 verification_missing_parent_epic` finding emit.
- **environment hardcode ❌** — SKILL.md 본문의 `Story` / `Sub-task` / `Initiative` / `Epic` 표기는 **role label**. 실 MCP payload 의 `issue_type` 값은 §단계 5 prelude 의 resolve 결과 직접 인용 의무. 위반 시 `F-TICKETSYNC-009 issuetype_hardcode_drift` finding emit + 호출 reject.
- **parent_strategy 우회 ❌** — `parent_strategy ∈ {epic_link_customfield, auto + epic_link_customfield_id set}` 환경에서 일반 issue (`story` / `task` / `bug`) 의 `parent` 필드 직접 채움 ❌. 반드시 `extra_fields[epic_link_customfield_id]` 사용. 위반 시 `F-TICKETSYNC-010 parent_strategy_environment_mismatch` finding emit.
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

- verification mode 상세 (분리): `skills/ticket-sync/verification-mode.md`
- 환경별 config 상세 (분리): `skills/ticket-sync/env-config-reference.md`
- R20-prime 결단: `decisions/DEC-2026-05-26-ticket-plan-단일.md`
- paradigm SSOT: `decisions/DEC-2026-05-26-v11-paradigm-결단.md` §3 (ticket = plan 한 곳)
- 결단 record: `decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md`
- verification mode: `decisions/DEC-2026-05-20-r20-verification-mode.md` (parent_epic override)
- canonical 6종 + 델타 생성: `decisions/DEC-2026-06-10-ticket-canonical-types.md` + `decisions/DEC-2026-06-10-ticket-delta-creation.md`
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
