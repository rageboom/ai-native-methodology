---
name: ticket-sync
description: ★ v8.6.1+ R20 신설 (DEC-2026-05-18-r20-mcp-ticket-sync-channel). chain stage 종료 동기로 사용자 보유 jira-confluence MCP (mcp__wiki-jira-assistant__*) 위임 호출 — Initiative/Epic/Story/Sub-task 자동 생성·상태 전이. 5 stage matrix (analysis/planning/spec/test/implement). 모든 MCP 호출 직전 사용자 confirmation gate 의무 (preview MD → yes/no/dry-run). 7-field evidence 캡쳐 + search-first idempotency + graceful MCP-missing. R16/R17 부활 ❌ — 신규 채널 (Tier 2.5 MCP delegation only / Tier 3 자체 adapter = v9.0+ carry).
allowed-tools: Read, Write, Edit, Bash, mcp__wiki-jira-assistant__jira_create, mcp__wiki-jira-assistant__jira_link, mcp__wiki-jira-assistant__jira_transition, mcp__wiki-jira-assistant__jira_comment, mcp__wiki-jira-assistant__jira_search, mcp__wiki-jira-assistant__jira_update, mcp__wiki-jira-assistant__jira_assign, mcp__wiki-jira-assistant__jira_transitions, mcp__wiki-jira-assistant__jira_label_add, mcp__wiki-jira-assistant__jira_issue, mcp__wiki-jira-assistant__wiki_page_create, mcp__wiki-jira-assistant__wiki_page_update, mcp__wiki-jira-assistant__wiki_search_cql, mcp__wiki-jira-assistant__wiki_spaces, ListMcpResourcesTool
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
| `scope` | string | state.scope | G3 scope slug (예: `car` / `payroll`) — `.aimd/<scope>/` 경로 추출 |
| `dry_run` | boolean | **`true`** | ★ default true — reproduction_command 만 print / MCP 호출 X. 사용자 OK 후 `dry_run=false` 명시 호출. |
| `confluence_emit` | boolean | `false` | analysis stage 시 Initiative-level Confluence overview page 생성 (v8.6.1 default false / 사용자 결단 시 활성). per-stage 보고서 page = v8.7.0+ Tier 2.6 carry. |

## 절차

### 단계 1 — Pre-flight

1. `ListMcpResourcesTool` 호출로 `mcp__wiki-jira-assistant__*` 가용성 확인
   - 부재 시 → `tools/_shared/finding-log.js` 로 `F-TICKETSYNC-001 mcp_unavailable` emit + silent skip (다른 chain harness 진행 무영향)
2. `.aimd/<scope>/state.json` read — 본 stage 가 gate 통과 상태인지 확인 (gate 미통과 시 reject + Block error)
3. `traceability-matrix.json` read — 본 stage 의 ticket_ref 기 등록 lookup
4. 본 stage 산출물 read — `planning-spec.json` / `behavior-spec.json` / `acceptance-criteria.json` / `test-spec.json` / `impl-spec.json` (stage 별)

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

stage 별 MCP call matrix:

#### analysis
```
1. jira_create (Initiative) → MIG-1
2. for each BC in architecture.json:
   jira_create (Epic) → MIG-<n>
   jira_link (Epic, parent=MIG-1)
3. for each AP P0 in antipatterns.json:
   jira_create (Tech Debt Story) → MIG-AP-<n>
   jira_label_add (AP-{category})
4. (optional confluence_emit=true) wiki_page_create (Initiative overview)
```

#### planning (chain 1 종료)
```
for each UC in planning-spec.use_cases[]:
   1. jira_create (Story, summary="[UC-CAR-007] ...", body=planning-spec UC body)
   2. jira_link (Story, parent=Epic MIG-CAR-100)
   3. jira_create (Sub-task chain1_planning, status=Done)
   4. jira_create (Sub-task chain2_spec, status=To Do)
   5. jira_create (Sub-task chain3_test, status=To Do)
   6. jira_create (Sub-task chain4_impl, status=To Do)
```

#### spec (chain 2 종료)
```
for each Story:
   1. jira_transition (Story → "In Progress")
   2. jira_update (chain2_spec sub-task → Done)
   3. jira_comment (BHV/AC link MD)
```

#### test (chain 3 종료, RED)
```
for each Story:
   1. jira_comment (test-spec.json summary + RED evidence link)
   2. jira_transition (chain3_test sub-task → "Testing")
```

#### implement (chain 4 종료, GREEN)
```
for each Story:
   1. jira_comment (GREEN evidence + commit_hash)
   2. jira_transition (chain3_test sub-task → "Done")
   3. jira_transition (chain4_impl sub-task → "Done")
   4. jira_transition (Story → "Done")
5. (optional confluence_emit=true) wiki_page_update (final report)
```

★ 각 호출 = Bash 로 stdout/stderr 캡쳐 → 7-field evidence record (`mcp_invocations[]` append).

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

## 사용자 결단 5건 (실 사용 시점 / DEC-2026-05-18-r20)

1. **Jira workflow transition target IDs** — project-specific / `jira_transitions` 사전 lookup 의무 (Initiative/Epic/Story/Sub-task workflow 가 사용자 Jira 환경 의존)
2. **Confluence emit 범위** — Initiative overview default v8.6.1 / per-stage 보고서 page = v8.7.0+ Tier 2.6 후보
3. **Auto-invoke 정책** — chain stage gate 통과 후 본 skill auto-suggest (confirmation 만 사용자) ★ 권고
4. **Idempotency** — search-first ★ 권고 (재실행 시 기존 ticket lookup skip + status_history 만 갱신)
5. **MCP 미연결 환경** — silent skip + finding emit ★ 권고

## Cross-link

- 결단 record: `decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md`
- 정책 본문: `methodology-spec/ticket-policy.md` §Tier 2.5
- ID 명명: `methodology-spec/id-conventions.md` §Ticket Binding
- Evidence schema: `schemas/ticket-sync-evidence.schema.json`
- Traceability matrix: `schemas/traceability-matrix.schema.json` matrix.items.ticket_ref.status_history
- Hook config: `hooks/hooks.json` PreToolUse matcher (state.blocked deny path)
- R20 charter entry: `methodology-spec/plugin-charter.md` §1+§2
- R16/R17 영구 scope-out parent: `decisions/DEC-2026-05-15-g1-itsm-permanent-scope-out.md` §31
- Tier 1 (manual) 선행: `decisions/DEC-2026-05-18-ticket-binding-policy.md`
