# DEC-2026-05-18 — R20 신설 MCP Ticket Sync Channel

## 결정

- **charter R20 신설** = `MCP Ticket Sync Channel` (Tier 2.5 — MCP delegation only)
- 사용자가 보유한 `mcp__wiki-jira-assistant__*` (jira 18 + wiki 13 tools) 를 chain harness stage 진행 동기로 호출 / **모든 호출 직전 사용자 confirmation gate 의무** (자동 fire-and-forget ❌)
- **R16/R17 부활 ❌ — R20 = 신규 채널** (DEC-2026-05-15-g1-itsm-permanent-scope-out §31 explicit path: "별도 charter 요구 신설 (R18+) — R16/R17 부활 ❌")
- v8.6.1 PATCH 진입 — additive only / breaking 0
- Tier 3 (자체 platform adapter — Jira REST / Linear GraphQL / GitHub Issues 직접 구현) = v9.0+ MAJOR charter review carry (MCP 위임으로 충분 시 carry 영구 유지)

## 근거

### 1. R16/R17 영구 scope-out 결단 (DEC-2026-05-15 §31) 정합

DEC-2026-05-15-g1-itsm-permanent-scope-out §31 verbatim 인용:

> "만약 사용자가 미래에 자동 티켓화 가치 재평가하면 별도 charter 요구 신설 (R18+) — R16/R17 부활 ❌"

본 DEC = §31 explicit path 활용. R20 = 신규 채널 명명 (R17-revisit 명명 ❌ — drift attractor 회피 / LL-G1-01 정합).

### 2. 비용 / 가치 재평가

| 시점 | 결단 |
|---|---|
| 2026-05-15 (R16/R17 scope-out) | "자동 티켓화 가치 < 비용 — 수동 처리로 충분" (자체 platform adapter 비용 큼 / 사용 사례 부재) |
| 2026-05-18 (현 시점) | ★ MCP 위임 비용 매우 작음 (자체 adapter X / 사용자가 jira-confluence MCP 보유) + 사용자 마이그레이션 실 사용 사례 발생 (PoC EFI 검증 cycle 2 종결 후) |

따라서 비용 / 가치 균형 변경 → R20 신설 정당.

### 3. R15 no-simulation 정합

본 R20 채널 = real MCP 호출 의무 (7-field evidence 캡쳐 — `tool_stdout_path` / `tool_stderr_path` / `tool_version` / `invocation_timestamp` / `duration_ms` / `result_hash` / `reproduction_command` / `tools/static-runner/src/runner.js::REQUIRED_EVIDENCE` 패턴 재사용). `EVIDENCE_TRUST` enum = `real_tool` | `imported_sarif` only / `simulated` 영구 거부.

### 4. Chain harness 결정론 axis 정합

- 모든 MCP 호출 직전 **사용자 confirmation gate** 의무 — preview MD 표시 → `yes/no/dry-run` halt → 사용자 OK → MCP 호출 batch
- MCP 호출 sequential (NOT parallel) — 결정론 axis 보호
- state.blocked 시 PreToolUse hook 가 MCP 호출 deny (`tools/chain-driver/src/hooks-bridge.js::buildBlockOutput` 재사용)
- Idempotency = search-first (`jira_search` JQL by UC-* custom field) — 재실행 시 기존 ticket lookup → skip + status_history 만 갱신

## Tier 분리 (charter R20 의 sub-axis)

| Tier | 진입 시점 | 범위 |
|---|---|---|
| **Tier 1** (v8.6.0+ 04bd0a1) | ✅ 활성 | 정책 + `traceability-matrix.schema.json` 의 optional `ticket_ref` field (수동 채움) |
| **Tier 2.5** (v8.6.1 / 본 DEC) | ✅ 신설 | MCP delegation — `ticket-sync` skill / 5 stage matrix / confirmation gate / 7-field evidence |
| Tier 3 (v9.0+ charter review) | carry | 자체 platform adapter (Jira REST / Linear GraphQL / GitHub Issues 직접 구현) — MCP 위임 충분 시 carry 영구 유지 |

## 신설 자산

| 경로 | 종류 | 비고 |
|---|---|---|
| `decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md` | NEW | 본 DEC |
| `schemas/ticket-sync-evidence.schema.json` | NEW | MCP 호출 evidence schema (7 field + evidence_trust strict) |
| `skills/ticket-sync/SKILL.md` | NEW | 핵심 skill (5 stage matrix + confirmation gate + idempotency) |
| `tools/schema-validator/test/ticket-sync-evidence.test.js` | NEW | 회귀 test (≥6) |

## 수정 자산

| 경로 | 변경 |
|---|---|
| `methodology-spec/plugin-charter.md` | §1 R20 entry 신설 (R19 v8.6.0 신설 다음) / §2 R20 매핑 / 요약 17/17 → 18/18 활성 / 헤더 R20 v8.6.1 신설 표기 |
| `methodology-spec/ticket-policy.md` | Tier 2.5 section 신설 + R20 reference + Tier 3 carry 명시 |
| `methodology-spec/id-conventions.md` | §Ticket Binding — `status_history` example 추가 |
| `schemas/traceability-matrix.schema.json` | `matrix.items.ticket_ref` 에 `status_history[]` optional 추가 |
| `hooks/hooks.json` | PreToolUse matcher 에 `mcp__wiki-jira-assistant__.*` 추가 |
| `tools/chain-driver/src/hooks-bridge.js` | deny-when-blocked path 에 MCP prefix 추가 (~15 LOC additive) |
| `tools/schema-validator/src/cli.js` | ticket-sync-evidence.schema.json 자동 mapping 등록 |
| `scripts/release-readiness.js` | `discoverPocSchemaArtifacts` 에 ticket-sync-evidence 추가 |
| `decisions/STATUS.md` | session 30차+ entry — v8.6.1 R20 신설 |
| `CHANGELOG.md` | v8.6.1 PATCH entry (additive — charter R20 = MINOR 자격이지만 본 release 는 PATCH 으로 처분 결단 영역) |
| `.claude-plugin/plugin.json` | version bump (8.6.0 → 8.6.1) |
| `decisions/DEC-2026-05-18-ticket-binding-policy.md` | R20 신설 cross-link 추가 |

## 정합 관계

- **선행**: DEC-2026-05-18-ticket-binding-policy.md (Tier 1 — 정책 + schema field manual)
- **부모**: DEC-2026-05-15-g1-itsm-permanent-scope-out §31 (별도 charter 요구 신설 path)
- **반대 polarity**: R16/R17 strikethrough 유지 — 본 R20 ≠ R16/R17 revival (drift attractor 회피)
- **sibling**: R19 (DEC-2026-05-18-runtime-tool-exclusion / 외부 도구 의존 분류 4 조건) — tool ecosystem 카테고리 정합
- **재사용**: R15 (`tools/static-runner/src/runner.js::REQUIRED_EVIDENCE` 7 field + `EVIDENCE_TRUST` 3-tier)

## 회귀 (target)

- schema-validator test: 기존 75/75 + ticket-sync-evidence ≥6 신규 → 81+ pass
- release-readiness: chain artifact scope 자동 확장 (F-V2C2-1-01 cycle 2 fix 정합)
- 기존 cycle-1/2 traceability matrix sample 영향 0 (status_history optional)

## Lessons Learned

- **LL-R20-01**: R16/R17 영구 scope-out 결단 후에도 사용자 환경 변화 (MCP 보유) + 사용 사례 발생 (실 마이그레이션 검증 cycle 종결) 시 별도 R 번호 신설로 채널 가능 — drift attractor 회피 의무 (R17-revisit 명명 금지)
- **LL-R20-02**: Tier 분리 명시 (Tier 2.5 MCP delegation vs Tier 3 자체 adapter) = 같은 R 안에서 MCP 의존 / 자체 구현 결단 분리 → v9.0+ charter review 시 선택지 보존

## 사용자 추가 결단 의무 (실 사용 시점)

1. Jira workflow transition target IDs — project-specific / `jira_transitions` 사전 lookup
2. Confluence emit 범위 — Initiative overview 만 (v8.6.1 default) / per-stage 보고서 page = v8.7.0+ Tier 2.6 후보
3. Auto-invoke 정책 — gate 통과 후 auto-suggest (confirmation gated) ★ 권고
4. Idempotency — search-first ★ 권고 (재실행 시 기존 ticket lookup skip)
5. MCP 미연결 — silent skip + `F-TICKETSYNC-001` finding emit ★ 권고

---

## ★ v8.6.2 PATCH 확장 — phase=enter (stage 진입 시 의무 작업 Task)

★ 2026-05-18 / 동일 R20 channel 안 추가 동작 / additive / breaking 0.

### 배경

사용자 "단지 티켓 따는것 뿐아니라 각 단계에서 일감을 따는 부분도 필요하다" — chain stage **종료 시점** ticket 생성 (R20 기존) **외**, **진입 시점** "오늘 의무 작업" Task 등록 의무.

### 결정

- R20 channel 의 동작 = **phase × stage matrix** 로 확장
- `phase=enter` (★ 신설) — stage 진입 시 의무 작업 Task 1개 등록 (analysis/planning = 도메인 단위 / spec/test/implement = per UC 단위)
- `phase=exit` (기존 R20) — stage 종료 시 결과 batch + enter Task 자동 종결
- default `phase=exit` (backward compat / 기존 R20 동작 유지)
- ticket-policy.md §6 (BHV/AC/TC/IMPL 별 별도 ticket ❌) **유지** — 본 확장은 stage 단위 Task 1개만 추가 (artifact 단위 ticket X)

### 대안 비교 (B/C 안 되는 사유 명시)

| 옵션 | 채택 | 사유 |
|---|---|---|
| **A. phase=enter stage 진입 시 의무 작업 Task 1개 ★** | **✅ 채택** | R20 sibling / 충돌 0 / ticket 폭증 ❌ / Jira dashboard 가시화 |
| B. continuous emit (UC 1개당 즉시 Story) | ❌ | 결정론 axis 침범 + plugin TaskCreate 와 중복 + confirmation 과다 + rate limit 위험 |
| C. BHV/AC/TC/IMPL 별 ticket | ❌ | ticket-policy.md §6 결단 위반 + 폭증 + artifact/process 영역 혼합 |

### 신규 자산 (v8.6.2)

| 경로 | 변경 |
|---|---|
| `schemas/ticket-sync-evidence.schema.json` | `phase` enum (enter/exit) optional + `uc_id` pattern (phase=enter + spec/test/implement 시 의무) |
| `schemas/traceability-matrix.schema.json` | `ticket_ref.enter_task_ids` (analysis/planning/spec/test/implement) optional |
| `skills/ticket-sync/SKILL.md` | `phase` 파라미터 + `uc_id` 파라미터 + `issuetype_enter` 파라미터 + phase=enter MCP call matrix + phase=exit 에서 enter Task 자동 종결 |
| `methodology-spec/ticket-policy.md` | §Tier 2.5 자동화 행동 = phase × stage matrix 로 재작성 |
| `tools/schema-validator/test/ticket-sync-evidence.test.js` | phase=enter valid 2 + uc_id pattern reject + phase enum reject + enter_task_ids valid + enter_task_ids unknown key reject = 6 신규 (83 → 89 pass) |

### car 도메인 ticket 수 영향

| 항목 | R20 기존 | A 추가 |
|---|---|---|
| Initiative / Epic / Story / Sub-task | 1 + 23 + 7 + 28 = 59 | 동일 |
| **★ Enter Task (analysis/planning)** | — | **+2** (도메인 단위) |
| **★ Enter Task (spec/test/implement)** | — | **+21** (7 UC × 3 chain) |
| **합계** | **59** | **82** |

### 회귀

- schema-validator: 83 → **89/89 pass** (+6 phase=enter test)
- 기존 evidence sample / traceability matrix sample 영향 0 (phase / uc_id / enter_task_ids 모두 optional)
- backward compat = default phase=exit (기존 R20 호출 무영향)

---

## ★ v8.6.3 PATCH 확장 — 구조 강제 (Hierarchy Enforcement)

★ 2026-05-18 / 동일 R20 channel 안 추가 동작 / additive / breaking 0.

### 배경

사용자 "**티켓은 스트럭쳐를 가져야 함**" — v8.6.1+v8.6.2 까지 R20 의 hierarchy 명시 = `ticket-policy.md` §Layer mapping 표 + `SKILL.md` MCP call matrix 의 `parent=Epic(scope)` / `parent=Story(uc_id)` text 뿐 / **schema-level / evidence-level 강제 부재** + **Atlassian Structure plugin (`jira_structure_*` MCP tool) 미사용** → Jira dashboard 가 tree view 로 가시화 안 됨.

### 결정

R20 channel 의 동작 = **hierarchy 강제 (parent_ticket_id 의무 + jira_structure tree)** 로 확장.

| 항목 | v8.6.2 (기존) | **v8.6.3 (본 확장)** |
|---|---|---|
| Schema 측 parent 강제 | `ticket-policy.md` §Layer mapping 표만 | ★ `mcp_invocations[].parent_ticket_id` (Sub-task / Story / Epic 의무) + `link_type` enum |
| Traceability matrix hierarchy | `ticket_ref.epic_id` / `initiative_id` / `subtask_ids` 분리 | ★ 동일 + chain consistency (Story 가진 행 = epic_id 의무 + initiative_id 의무) |
| Atlassian Structure 통합 | 미사용 | ★ `mcp__wiki-jira-assistant__jira_structure_add_issues` allowed-tools 추가 + analysis stage phase=exit 시 Initiative tree 등록 |
| 위반 finding | 없음 | ★ `F-TICKETSYNC-002 missing_parent` emit (chain consistency 깨짐 시) |

### Sub-agent 부재 결단 (★ 명시)

사용자 질의 "**티켓 관리자 에이전트가 있어야 되는 거 아냐?**" — **불필요 결단**. 3가지 이유:

1. **Confirmation gate 의 구조적 제약** — 사용자 `yes/no/dry-run` 응답 = main agent (= 사용자 대화 layer) 에서만 받을 수 있음. sub-agent 는 Task tool 1회 호출/응답 = 도중에 사용자 prompt ❌
2. **결정론 axis 보호 (R8)** — sub-agent 추가 = state.json 동기화 + chain-driver hooks-bridge 가 sub-agent 호출도 차단해야 함 → 결정론 axis 침범 위험. skill = main agent 도구 = state unbroken
3. **YAGNI** — ticket-sync skill 의 책임 = MCP call sequence + evidence + matrix update = 단일 책임. sub-agent 분리는 multi-platform (Linear / GitHub) 시점에 재평가

v9.0+ MAJOR carry — `ticket-platform-router` (multi-platform abstraction) / `ticket-reconciler` (자동 idempotency loop / confirmation 완화 결단 함께).

### 대안 비교 (B/C 안 되는 사유 명시)

| 옵션 | 채택 | 사유 |
|---|---|---|
| **A. parent_ticket_id schema 강제 + jira_structure tree ★** | **✅ 채택** | R20 sibling / additive / 위반 시 자동 finding emit / Atlassian Structure 활용 |
| B. ticket-manager sub-agent 신설 | ❌ | confirmation gate sub-agent 호환 ❌ + 결정론 axis 침범 + YAGNI (Sub-agent 부재 결단 §위) |
| C. parent 만 권고 / schema 강제 X | ❌ | v8.6.2 와 동일 상태 = 구조 보장 안 됨 / 사용자 의도 "구조를 가져야" 미충족 |

### 신규 자산 (v8.6.3)

| 경로 | 변경 |
|---|---|
| `schemas/ticket-sync-evidence.schema.json` | `mcp_invocations[].parent_ticket_id` (optional / 정책 의무) + `mcp_invocations[].link_type` (enum `parent-child` / `relates-to` / `blocks` / `is-blocked-by` / default `parent-child`) |
| `schemas/traceability-matrix.schema.json` | `ticket_ref` 의 `epic_id` / `initiative_id` 가 Story 존재 시 의무 (allOf if-then conditional) |
| `skills/ticket-sync/SKILL.md` | `mcp__wiki-jira-assistant__jira_structure_add_issues` + `jira_structure_get` allowed-tools 추가 + phase=exit analysis 에 Initiative tree 등록 step 추가 |
| `methodology-spec/ticket-policy.md` | §Tier 2.5 = "★ hierarchy 의무" subsection 추가 + `F-TICKETSYNC-002 missing_parent` finding 명시 |
| `tools/schema-validator/test/ticket-sync-evidence.test.js` | parent_ticket_id valid 2 + Sub-task link_type 강제 + traceability matrix chain consistency = 6 신규 (89 → 95 pass) |

### car 도메인 ticket 수 영향

| 항목 | v8.6.2 | v8.6.3 |
|---|---|---|
| Initiative / Epic / Story / Sub-task | 59 | 59 (동일) |
| Enter Task (analysis/planning + spec/test/implement × 7) | 23 | 23 (동일) |
| **★ jira_structure_add_issues 호출** | 0 | **+1 호출** (Initiative tree 1번만 / per release cycle) |
| **합계 ticket** | 82 | **82 (동일)** + 1 structure 호출 |

★ ticket 수 증가 ❌ — hierarchy 강제는 **메타 강제 (parent_ticket_id schema + structure tree)** 만 / ticket 폭증 ❌.

### 회귀

- schema-validator: 89 → **95/95 pass** (+6 hierarchy test)
- 기존 evidence sample / traceability matrix sample 영향 0 (parent_ticket_id / link_type 모두 optional schema-side / 정책 의무는 ticket-policy.md §Tier 2.5 hierarchy subsection)
- backward compat = default link_type=parent-child (기존 R20 호출 무영향)

### Lessons Learned (v8.6.3)

- **LL-R20-03**: ticket 구조 강제 = (1) policy 문서 (2) schema field (3) skill MCP call (4) finding emit **4 layer 동시** 의무 — 중 어느 하나만 빠지면 결정론 axis 침범 (예: schema 만 있고 finding emit 없으면 위반이 통과 / policy 만 있고 schema 없으면 강제 X)
- **LL-R20-04**: ticket-manager sub-agent 도입 결단 = **confirmation gate 호환성 / 결정론 axis** 두 axis 동시 통과 의무 — v9.0+ MAJOR charter review 시점 (confirmation 완화 결단 + multi-platform 결단 함께)
