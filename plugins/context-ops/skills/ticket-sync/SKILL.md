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
| `parent_initiative`          | string  | (없음)                                    | 앱/제품 단위 Initiative 키 **참조** (= 실 프로젝트명 / **ticket-sync 생성 ❌**). 명시 시 Epic 의 최상위 부모로 재사용. 미명시 시 → cascade-plan `initiative_required=true` → **사용자에게 기존 Initiative 키 질문 (신규 생성 ❌)**. env-config (`.ai-context/ticket-sync-config.yaml` `parent_initiative`) 에서도 읽음. 예: `MIS-58` (SmileApp Initiative).                        |
| `mode`                       | enum    | **`standard`**                            | `standard` (default / R20-prime 본격 — task-plan.json 기반 4-level cascade) \| `verification` (plugin dogfood meta-cycle 전용 / `parent_epic` 의무).                                                                                                                                     |

> **환경 config**(`issuetype_map` / `parent_strategy` / `epic_link_customfield_id` / `parent_link_customfield_id` / `structure_id` / `structure_auto_add_on_exit`)는 스킬 파라미터 ❌ — `.ai-context/ticket-sync-config.yaml` 에 두고 §단계 5 의 `ticket-cascade-builder` 가 `--config` 로 읽어 resolve. 구체값·default = [`env-config-reference.md`](./env-config-reference.md).

## 이슈 유형 네이밍 & 설명 템플릿 (도구가 적용)

cascade 4종(Epic/Story/Task/Sub-task)의 **Summary 네이밍 + Description 본문 템플릿 = `ticket-cascade-builder` 가 결정론으로 적용** (`tools/ticket-cascade-builder/src/builder.js` 의 `summary*` / `buildBody`). cascade-plan.calls[].summary·body 그대로 인용 — **본 SKILL 에 템플릿 재기재 ❌** (drift 회피 / 사내 표준 `jira_이슈유형_표준템플릿` 준수는 도구 안에서).

요약 규칙 (참조): Epic·Story = 메뉴명·기능명만 (브래킷 ❌) / OP·Sub-task = `[OP-xxx]`·`[TASK-xxx]` 브래킷 유지.

**Bug** (cascade 비대상 / 수동 등록 시 참조 템플릿):
```
■ 전제조건 {재현 사전 상태}
■ 재현절차 1. … 2. … 3. …
■ 재현결과 {실제 현상}
■ 기대결과 {정상 동작}
■ 문제 {영향}
■ 해결 방향 {수정 방향/원인 추정}
```

---

## 절차

### 단계 1 — Pre-flight

1. **MCP 가용성 확인 + prefix resolve** (F-VERIFY-005 / B8)
   - tool-name presence probe — 신버전 `mcp__mcp-server-wiki-jira__*` 우선 → 없으면 구버전 `mcp__wiki-jira-assistant__*`. 감지된 prefix 를 세션 `_mcp_prefix` 로 고정.
   - 2차 검증 — `{_mcp_prefix}jira_search` 무해 JQL 1회 (200 OK = 가용 / 401·403·404·timeout = 미연결). `ListMcpResourcesTool` 단독 silent skip ❌ (resource-only probe / F-VERIFY-005).
   - 둘 다 미감지 시 → `_base-log-finding` 로 `F-TICKETSYNC-001 mcp_unavailable` emit + silent skip.

2. **stage paradigm 강제력 점검** (F-TICKETSYNC-012)
   - args.stage ∈ {`analysis`, `discovery`, `spec`, `test`, `implement`} 시 → `F-TICKETSYNC-012 stage_paradigm_violation` finding emit + reject (R20-prime 정합 / plan 단일 const).
   - args.stage = `plan` 만 유효.

3. **state.json read** (F-VERIFY-006 + F-VERIFY-008 → B9 + B11 해결)
   - 정식 path = `<project>/.ai-context/state.json` (단일 file / scope 는 `state.current_scope` 필드).
   - 매칭 의무 — `state.current_scope === <scope>` 일치 확인. 불일치 시 `F-TICKETSYNC-006 scope_mismatch` finding + reject.
   - **gate-pass 확인 분기**:
     - `mode=standard` 시 — `state.last_gate` 가 plan stage gate (#3) 통과 evidence 와 일치해야 함 (미통과 시 reject + Block error).
     - `mode=verification` 시 — gate-pass check 우회 (gate=null OK / verification meta-cycle 본질).

4. **ticket-sync-config.yaml 자동 생성 (config-bootstrap)** (F-TICKETSYNC-019)
   - `<project>/.ai-context/ticket-sync-config.yaml` 존재 여부 Bash 확인.
   - **존재 시**: skip → 다음 단계.
   - **부재 시** → config-bootstrap 흐름:
     1. 사용자에게 두 가지 질문:
        ```
        [ticket-sync] .ai-context/ticket-sync-config.yaml 이 없습니다.
        다음 두 값을 입력하세요.

        1) Jira 프로젝트 키 (기본값: MIS, 예: DWPD·SGP 등):
        2) Initiative 키 (예: MIS-108):
        ```
     2. 입력값으로 Write tool 로 SG-MIS 표준 config 생성. **공통 필드 값은 [`env-config-reference.md §SG-MIS 환경 표준 config — 공통 필드`](./env-config-reference.md) 가 SSOT** (변경 시 해당 파일 우선 수정):
        ```yaml
        # .ai-context/ticket-sync-config.yaml (auto-generated by ticket-sync)
        project_key: <project_key 입력값>
        parent_initiative: <initiative_key 입력값>
        # ── 공통 고정값 (env-config-reference.md §SG-MIS 공통 필드 / 사내 표준) ──
        parent_strategy: epic_link_customfield
        epic_link_customfield_id: customfield_10006
        parent_link_customfield_id: customfield_11902
        structure_id: 684
        structure_auto_add_on_exit: true
        issuetype_map:
          epic:       epic
          story:      이야기
          subtask:    하위 작업
          initiative: Initiative
          task:       작업
          bug:        버그
        ```
     3. `.gitignore` 에 `.ai-context/ticket-sync-config.yaml` 미등록 시 자동 append.
     4. `F-TICKETSYNC-019 config_bootstrap` finding emit (severity=info / auto_generated=true / project_key=\<입력값\> / initiative_key=\<입력값\>).

5. `traceability-matrix.json` read — plan stage 의 ticket_ref 기 등록 lookup. 부재 시 = first-entry path → 신규 생성 path 로 분기.

6. **본 stage 산출물 read** (plan stage 단일 — F-VERIFY-007 → B10 해결)
   - `task-plan.json` (의무) — 본 skill 본 입력. Epic/Story/Task/Sub-task 4-level cascade payload 본격 source.
   - `behavior-spec.json` (의무) — Story body source (BHV-\* 묶음 / cross-cut anchor).
   - `acceptance-criteria.json` (의무) — Sub-task body source (AC-\* 묶음 / Sub-task 의 1~3 AC).
   - `operational-task.json` (선택) — Task (OP-\* / Story sibling) source. 부재 시 Task 0건.
   - `discovery-spec.json` (선택) — Epic 의 의도 source (FE 화면 의도 / BE-domain 의도).

### 단계 2 — Idempotency check (search-first)

> **델타 생성 우선 (DEC-2026-06-10)**: ref 에 `jira_id` 가 이미 있거나 `pre_existing=true` 면 = 기존 티켓 확정 → **search 생략 + 생성 skip** (본 §단계 2 는 jira_id 미보유 ref 에만 적용). `prebound_reused_count` 로 기록.

`{_mcp_prefix}jira_search` (§단계 1) JQL 로 기존 ticket lookup. **2단계 (fallback 의무)**:

- **1차 — 커스텀 필드** (환경에 구성된 경우만): `"TASK ID" ~ "TASK-CAR-001"` / `"OP ID"` / `"Screen ID"` / `"BHV cluster"`.
- **2차 — 표준 필드 fallback** (커스텀 필드 부재 / 1차 0건·400 시 **의무**): `summary ~ "[TASK-CAR-001]"`(브래킷) 또는 `labels`. Epic·Story 는 브래킷 없음 → `summary ~ "{title}"` 정확일치 + 사용자 confirm.

> ⚠️ 1차 커스텀 필드명이 환경에 없으면 **조용히 0건 → 중복 생성**. 그래서 2차 fallback 의무. 1차+2차 모두 0건일 때만 신규 생성.

- 발견 → `ticket_ref.id` + `status_history` 갱신만 (신규 ❌) / 부재 → 신규 / `search_first_idempotency.search_path`(custom_field\|fallback_summary) 기록.

### 단계 3 — Preview (cascade-plan.preview_md)

별도 렌더 ❌ — §단계 5 의 `cascade-plan.json` 의 **`preview_md` 를 그대로 confirmation gate 에 표시** (도구가 결정론으로 렌더 / 4-level + 신규 vs 기존재사용(skip_prebound) + counts 포함). MCP 호출 수 ≈ `cascade-plan.counts.create` + transitions.

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

### 단계 5 — cascade-plan 생성 (ticket-cascade-builder 호출 / 결정론)

resolve(role→issuetype) · parent linking · body 템플릿 · summary 네이밍 · **델타 판정** · cascade 순서 = **결정론** → `tools/ticket-cascade-builder` 도구가 산출 (도구 = **NO MCP / NO LLM** / 결정론 axis 보호). 본 스킬은 도구 출력 `cascade-plan.json` 을 **발사만** 한다 (LLM 이 payload 를 임의 조립 ❌).

```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/ticket-cascade-builder/src/cli.js \
  --task-plan .ai-context/output/task-plan.json \
  --operational-task .ai-context/output/operational-task.json \
  --behavior-spec .ai-context/output/behavior-spec.json \
  --acceptance-criteria .ai-context/output/acceptance-criteria.json \
  --config .ai-context/ticket-sync-config.yaml \
  --scope <scope> --out .ai-context/output/cascade-plan.json
```

산출 `cascade-plan.json` (schema: `cascade-plan.schema.json`):

- `calls[]` = 순서 있는 호출 spec — `order` / `role` / **`issue_type`(resolved)** / `summary` / `body` / **`parent_spec`**{strategy, parent_ref_key, customfield_id, link_type} / `labels` / **`delta_action`**(create\|skip_prebound) / `source_ref`
- `preview_md` (§단계 4 gate 표시) / `skip_list` / `evidence_skeleton`(*_id_map placeholder) / `counts`

**환경 config** — 도구가 `--config`(ticket-sync-config.yaml)를 읽어 `issuetype_map` / `parent_strategy` / customfield 를 resolve. 환경별 구체값(DWPD/SG-MIS) = [`env-config-reference.md`](./env-config-reference.md). issuetype 미정의 시 도구가 `F-TICKETSYNC-007 issuetype_unresolved` throw (exit 1).

**스킬 책임 (도구 밖 / runtime live 의존)** — cascade-plan 은 **happy-path 의도**. 실 MCP 호출의 **400/403 fallback**(parent_link → parent_key → `jira_link (Relates)` / `F-TICKETSYNC-013`·`010`·`008`) 은 본 스킬이 live 응답 보고 적응.

**Initiative = 참조 전용 (생성 ❌)** — Initiative = 실 프로젝트명. cascade-plan `initiative_required=true` (parent_initiative 미상) 시 → **신규 생성 ❌**, 사용자에게 질문: ① 기존 Initiative 키 지정 / ② jira_search 후보 중 선택. 키 확보 후 `--config parent_initiative=<키>` 로 cascade-builder **재실행**. cascade 실 생성 시작점 = **Epic** (참조 Initiative 하위).

### 단계 6 — MCP 호출 (sequential / 결정론 보호 / mode=standard)

**plan stage phase=exit 4-level cascade 일괄**.

#### phase=enter (선택 / plan 진입 작업 Task)

`jira_create(role=task, summary="[Chain 3] {scope} plan 작성 시작", parent=Epic(scope)\|\|Initiative, status=To Do)` → `enter_task_id` = transient(evidence 만 / traceability-matrix.ticket_ref 영속 ❌). 작업 시작 시 manual/hook `jira_transition`(To Do→In Progress).

#### phase=exit — cascade-plan.calls 발사 (델타 + evidence)

> **선결: Initiative 참조 확인** — `cascade-plan.initiative_required=true` 면 발사 ❌ → **사용자에게 Initiative 키 질문**(생성 금지) → `parent_initiative` 채워 cascade-builder 재실행 → `initiative_required=false` 된 plan 으로 진행.

§단계 5 의 `cascade-plan.json` 을 읽어 `calls[]` 를 **order 오름차순 순차** 발사 (parallel ❌ / 결정론 보호). 부모 키는 발사하며 채워지는 `keymap`(source_ref → 실 Jira 키)으로 resolve. **payload 의 issue_type / summary / body / parent_spec 은 cascade-plan 그대로 인용** (LLM 재조립 ❌ / hardcode ❌).

```
keymap = {}   # source_ref → 실 Jira 키
for call in cascade-plan.calls (order asc):
  # 1) 델타 — 기존 티켓이면 생성 skip, 부모로만 (금지 F-TICKETSYNC-014)
  if call.delta_action == "skip_prebound":
    keymap[call.source_ref] = call.prebound_jira_id        # 기존 키 등록 (jira_create ❌)
    evidence.search_first_idempotency.prebound_reused_count++ ; continue

  # 2) parent resolve — call.parent_spec.parent_ref_key 를 keymap 으로 실 키 변환
  parent_key = call.parent_spec.parent_ref_key ? keymap[call.parent_spec.parent_ref_key] : null
  payload = { issue_type: call.issue_type, summary: call.summary, description: call.body, labels: call.labels }
  switch call.parent_spec.strategy:
    top_level               → (parent 없음)
    parent_key              → payload.parent_key = parent_key                      # Sub-task(B14) / fallback
    epic_link_customfield   → payload.extra_fields[call.parent_spec.customfield_id] = parent_key   # Story/Task
    parent_link_customfield → payload.extra_fields[call.parent_spec.customfield_id] = parent_key   # Epic→Initiative

  # 3) 발사 + runtime fallback (live 응답 의존 / 스킬 책임 / 도구 밖)
  res = {_mcp_prefix}jira_create(payload)
  on 400/403 (parent linking drift):
    epic         : B16 customfield_10007 누락 400 → extra_fields.customfield_10007=summary 추가 재시도
                   (재시도 후) parent_link → parent_key → jira_link(Relates)         (F-TICKETSYNC-013)
    story/task   : epic_link → parent_key → jira_link(Relates)                       (F-TICKETSYNC-010 / 008)
    subtask      : parent_key 응답 후 parent=null 확인 → REST API fallback (B17)
                   PUT /rest/api/2/issue/{key} {"fields":{"parent":{"key":parent_key}}}
                   200 OK → evidence.parent_linked_via="rest_api_fallback" (F-TICKETSYNC-017)
                   PUT 실패 → jira_link(type=subtask) 최종 fallback (F-TICKETSYNC-018)
    evidence: environment_drift finding 누적
  keymap[call.source_ref] = res.ticket_id_created
  evidence.mcp_invocations += 7-field (call별 / Bash 로 stdout·stderr·duration·result_hash 캡쳐)

# evidence_skeleton 의 initiative_id + *_id_map 을 keymap 으로 채움
```

**Step 6 — traceability-matrix.ticket_ref 갱신**: `initiative_id` + `epic_id_map`/`story_id_map`/`op_task_id_map`/`subtask_id_map`(keymap) + `cascade_complete=true` + `cascade_timestamp`.

**Step 7 — B15 Structure 보드 (옵션)**: `structure_id` set + `structure_auto_add_on_exit=true` 시 `jira_structure_add_issues` 1회 — items 계층 = Initiative(0)→Epic(1)→Story/OP-*(2)→Sub-task(3) (Epic 루프마다 depth reset). `structure_tree_url` 채움 + 모든 ticket `structure_complete=true`.

**Step 8 — enter Task 종결**: plan `enter_task_id` 있으면 `jira_transition` → Done.

#### phase=update-test-red / update-impl-green (신규 생성 ❌ / status 전이만)

- **update-test-red** (chain 4 RED 후): per TASK-* Sub-task → `jira_transition(→Testing)` + `jira_comment(RED evidence: test-spec + 5종 물증)`. Story 변경 ❌.
- **update-impl-green** (chain 5 GREEN 후): per TASK-* → `jira_transition(→Done)` + `jira_comment(GREEN + commit_hash)`. Story 하위 Sub-task 전부 Done 시 → Story `jira_transition(→Done)`. Epic Done 전이 = 사용자 manual (FE 화면 = cycle 외 추가 가능).
- 각 호출 = Bash stdout/stderr 캡쳐 → 7-field evidence (`mcp_invocations[]` append).

### 단계 6b — verification mode (plugin dogfood meta-cycle 전용)

`mode=verification` = plugin 자체 검증 meta-cycle 전용 (`parent_epic` 의무 / 실 도메인 feature cycle 무관). standard 와 본질 차이(Initiative/Epic skip / per-stage Story 6건) + 6-stage cascade 본문 = [`verification-mode.md`](./verification-mode.md).

### 단계 7 — Evidence 기록

`<project>/.ai-context/output/evidence/ticket-sync-plan-<phase>-<timestamp>.json` 작성 (schema: `ticket-sync-evidence.schema.json` / stage const=plan):

골격 (전체 필드·제약 = `schemas/ticket-sync-evidence.schema.json` SSOT):

```json
{
  "meta": {...}, "stage": "plan", "phase": "exit", "scope": "car",
  "ticket_cascade": { "initiative_id", "epic_id_map", "story_id_map", "op_task_id_map", "subtask_id_map", "cascade_complete" },
  "mcp_invocations": [ { /* 7-field 의무 + ticket_level + issue_type + parent_ticket_id + link_type (verify 대조용 / mcp_tool_name 신·구 prefix · tool_stdout/stderr_path · tool_version · invocation_timestamp · duration_ms · result_hash(64hex) · reproduction_command · ticket_id_created) */ } ],
  "confirmation_gate": { "preview_md_digest", "user_response", "intervention_log_ref" },
  "search_first_idempotency": { "lookup_count", "skip_count", "prebound_reused_count", "search_path": "custom_field|fallback_summary" },
  "graceful_mcp_missing": { "probe_result", "fallback_path" },
  "evidence_trust": "real_tool", "dry_run": false
}
```

> **conformance verify 의무** — evidence 작성 후 gate-green 전에:
> ```bash
> node ${CLAUDE_PLUGIN_ROOT}/tools/ticket-cascade-builder/src/cli.js verify \
>   --plan .ai-context/output/cascade-plan.json --evidence <위 evidence.json>
> ```
> exit 1 (위반) 시 gate green ❌ — 스킬이 cascade-plan 을 어겼다는 결정론 신호. `mcp_invocations[]` 에 `issue_type`·`ticket_level`·`parent_ticket_id`·`link_type` 캡쳐 의무 (verify 입력).

### 단계 8 — traceability-matrix 갱신

각 Story entry 의 `ticket_ref.status_history[]` append + `ticket_ref.id` / `level` / `epic_id` / `subtask_refs` (TASK-\*) / `op_task_refs` (OP-\*) 채움. 본 갱신 후 `_base-build-traceability-matrix` skill 재호출 (forward_coverage 갱신).

### 단계 9 — intervention-log append

`.ai-context/output/intervention-log.jsonl` 에 1 entry append — 필드: `timestamp` / `skill:"ticket-sync"` / `stage:"plan"` / `phase` / `scope` / `decision:"ticket_sync_confirmed"` / `mcp_invocation_count` / `idempotency_skip_count` / `cascade_complete` / `evidence_ref` / `user`.

## 금지 / 강제력

대부분 정책은 **메커니즘이 강제** (SKILL 재서술 불요 / 근거 ## 인용). 강제 위치:

| 정책 | 강제 메커니즘 |
| --- | --- |
| simulated evidence ❌ | `ticket-sync-evidence.schema` evidence_trust enum (simulated 영구 거부) |
| state.blocked 시 MCP ❌ | `hooks/hooks.json` PreToolUse deny (신·구 prefix) |
| **계획 밖 ticket 발사 ❌** (정책 11) | **PreToolUse 훅** `checkCascadeConformance` — jira_create summary ∉ cascade-plan → **발사 직전 deny** (`F-TICKETSYNC-009`) |
| pre-bound 재생성(7)·orphan(8)·link_type(9)·B14(12)·issue_type(11)·coverage | **`ticket-cascade-builder verify`** post-hoc (cascade-plan ↔ evidence / gate 실행 / `F-TICKETSYNC-014·002·016·011·009·015`) + cascade-builder 가 parent_spec·delta·issue_type resolve 로 **구조상 보장** |
| canonical 6종 / 4-level 계층 | cascade-builder role enum + parent_spec (구조상 위반 불가) |

**SKILL 잔존 규칙 (메커니즘 없음 — LLM/런타임/거버넌스)**:

- **stage = plan 한 곳** — args.stage ∈ {analysis,discovery,spec,test,implement} 시 reject (`F-TICKETSYNC-012`).
- **fire-and-forget ❌** — 모든 MCP 호출 직전 confirmation gate 의무 (사람 확인).
- **parallel MCP ❌** — cascade-plan `order` 순 **sequential** 발사 (런타임 동시성).
- **R16/R17 부활 ❌** — R20-prime 채널만 (거버넌스).
- **mode=verification + parent_epic 의무** (`F-TICKETSYNC-003`).
- **payload = cascade-plan 그대로 + evidence 에 issue_type 캡쳐** (verify 가 대조 / 어기면 위 훅·verify 차단).

## 사용자 결단 (열린 항목)

1. **Jira workflow transition target IDs** — project-specific / `jira_transitions` 사전 lookup 의무
2. **Confluence emit 범위** — Initiative overview default false / per-stage 보고서 page = 미지원 (후보)
3. **mode 선택** — `standard` (default / 실 도메인 cycle) / `verification` (plugin dogfood / parent_epic 의무)

> 정착분(추가 결단 불요): auto-invoke(chain-driver next stderr suggest) · idempotency(search-first + 델타) · MCP-missing(graceful skip) · environment bridge·B14·B15 = §단계 5 도구 + `env-config-reference.md` + 금지 가드로 정착.

## 인용

- cascade-plan 생성 도구 (결정론): `tools/ticket-cascade-builder/` + schema `schemas/cascade-plan.schema.json`
- 도구 추출 결단: `decisions/DEC-2026-06-10-ticket-cascade-builder.md`
- conformance 강제 (verify + PreToolUse 훅): `decisions/DEC-2026-06-10-cascade-conformance.md`
- verification mode 상세 (분리): `skills/ticket-sync/verification-mode.md`
- 환경별 config 상세 (분리): `skills/ticket-sync/env-config-reference.md`
- R20-prime 결단: `decisions/DEC-2026-05-26-ticket-plan-단일.md`
- paradigm SSOT: `decisions/DEC-2026-05-26-v11-paradigm-결단.md` §3 (ticket = plan 한 곳)
- 결단 record: `decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md`
- verification mode: `decisions/DEC-2026-05-20-r20-verification-mode.md` (parent_epic override)
- Initiative 참조 전용(생성 ❌) 근거: `decisions/DEC-2026-06-10-initiative-reference-only.md`
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
