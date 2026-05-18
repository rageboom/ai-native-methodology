# Ticket Binding Policy (외부 일감 시스템 연동)

> ai-native-methodology plugin 의 chain harness 산출물 ↔ 외부 ticket 시스템 (Jira / Linear / GitHub Issues / Asana / Azure DevOps) 매핑 정책.
> ★ 권고 (validator 강제 X) / DEC-2026-05-18-ticket-binding-policy 결단 / v8.6.0+ 진입.

---

## 1. 결단 요약

| 항목 | 결정 |
|---|---|
| Ticket 단위 | **UC = Story** (Plugin 의 UC ID 가 grep-hit 검증된 유일 단위 = Jira Story 의 사용자 가치 단위 정합) |
| Ticket 생성 시점 | **★ Chain 1 종료 시점** (planning-spec.json schema-valid + grep-hit 증거 확보 직후) |
| 상위 단위 | Domain = Epic / 분석 stage 결과 = Initiative |
| 하위 단위 (선택) | Chain stage 4개 = Sub-task |
| BHV / AC / TC / IMPL | **별도 ticket X** — Story 본문에 link / 또는 sub-task acceptance criteria |
| 강제력 | ★ 권고만 / validator 강제 X / `ticket_ref` field optional |

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

| Stage | Ticket 활동 |
|---|---|
| **Analysis 종료** | Initiative 생성 / Domain 별 Epic batch 생성 / Antipattern P0 = Tech Debt Story 별도 생성 (횡단) |
| Chain 1 시작 | (Epic 1개 in-progress / 도메인 결정) |
| **★ Chain 1 종료** | **planning-spec.json 의 use_cases[] 각각 = Story 생성** + 각 Story 에 sub-task 4개 batch 생성 (chain1 = done) |
| Chain 2 종료 | Story 의 chain2 sub-task done / BHV/AC 본문 link 갱신 |
| Chain 3 종료 | chain3 sub-task done / RED test evidence 첨부 |
| Chain 4 종료 | chain4 sub-task done / GREEN evidence 첨부 / **Story close** |
| 도메인 전체 종료 | Epic close |
| Initiative 종료 | 마이그레이션 완료 |

---

## 4. Traceability matrix 연동

`schemas/traceability-matrix.schema.json` 의 matrix item 에 `ticket_ref` optional field (★ v8.6.0+):

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

★ field 모두 optional — ticket 시스템 사용 안 하는 PoC 는 그대로 omit (회귀 영향 0).

---

## 5. 권장 ticket summary 형식

| Ticket 유형 | Summary 형식 | Description 본문 |
|---|---|---|
| Initiative | `[MIG] {프로젝트} legacy → {target stack} 전환` | analysis 산출물 4종 요약 + R# carry |
| Epic | `[MIG/{domain}] {도메인} 마이그레이션` | inventory / architecture / sql-inventory 의 해당 domain 부분 |
| **Story** | `[UC-{도메인}-{번호}] {use_case.name 또는 description 1줄}` | planning-spec.json 의 use_case 본체 + source_grounded_evidence + acceptance_criteria_refs |
| Sub-task | `chain{N}/{stage_name} — {UC ID}` | (e.g., `chain1/planning — UC-CAR-007`) |
| Tech Debt Story (AP P0) | `[AP-{cat}] {antipattern.name}` | antipatterns.json 의 AP 본문 |
| Spike (BR) | `[BR-{도메인}-{이름}] 정책 결단` | rules.json BR 본문 + 도메인 전문가 위임 |

---

## 6. BHV / AC / TC / IMPL 별 별도 ticket 금지 사유

★ 다음 이유로 별도 ticket 만들지 마세요:

1. **폭증 위험**: 1 UC 당 N BHV × M AC × K TC × L IMPL = Story 1개당 ticket 수십~수백
2. **중복 정보**: Plugin 의 chain-coverage-validator 가 이미 backward link 의무 / traceability matrix 가 모든 link 추적 = ticket 시스템과 1:1 중복
3. **process vs artifact 영역 분리**: BHV/AC/TC/IMPL = artifact 영역 (chain harness 내) / Story = sub-task = process 영역. 섞으면 ticket 시스템이 artifact store 로 오용
4. **변동 위험**: chain 2 진행 중 BHV/AC 가 추가/변경 = ticket update 빈도 폭증

★ 권장: BHV/AC/TC/IMPL ID 는 **Story description 또는 sub-task acceptance criteria 에 link 만** — ticket 자체 X.

---

## 7. 예외 케이스 — 별도 ticket 권장

| Case | Ticket 유형 | 이유 |
|---|---|---|
| Antipattern P0 회피 작업 | Tech Debt Story (Epic 외) | 횡단적 / 모든 Domain Epic 영향 (예: Java 1.8 EOL / zero-test / scriptlet XSS) |
| 도메인 횡단 비즈니스 룰 (BR) | Spike (Story 의 prerequisite) | 단일 UC 에 속하지 않는 정책 결단 |
| Plugin 자체 fix (carry list) | Bug (별도 plugin 프로젝트) | 마이그레이션 외부 |

---

## 8. 라이선스/플랫폼별 구현 방법

| 플랫폼 / 라이선스 | Initiative 표현 | Epic ↔ Story | Sub-task |
|---|---|---|---|
| Jira Standard | Label (`migration-{project}`) 또는 Big Epic + Issue Link | 정식 Epic Link | Sub-task type |
| Jira Premium + Advanced Roadmaps | 정식 Initiative type | 정식 Epic Link | Sub-task type |
| Linear | Project | Cycle 또는 Parent Issue | Sub-issue |
| GitHub Issues | Milestone (or `[INITIATIVE]` label) | Issue + `[EPIC]` label + task list | Issue checkbox + Linked Issues |
| Azure DevOps | Initiative work item type | Epic ↔ Feature/User Story | Task |

---

## 9. 강제력 (★ Tier 1 = 권고만)

- **★ validator 강제 X** — 이 정책은 plugin 사용자/조직별 결단
- `traceability-matrix.schema.json` 의 `ticket_ref` field 는 **optional** — omit 가능
- 본 정책 미준수 = **finding 아님** (단 ticket 시스템 사용 시 본 정책 권장)
- ticket 미사용 PoC 는 본 정책 무영향 (regression 0)

---

## 10. Tier 2.5 (v8.6.1+ R20 신설) — MCP delegation

★ v8.6.1+ R20 (DEC-2026-05-18-r20-mcp-ticket-sync-channel) — 사용자 보유 jira-confluence MCP (`mcp__wiki-jira-assistant__*`) 위임으로 chain stage 동기 ticket lifecycle 자동화. **R16/R17 부활 ❌** — 신규 채널 (DEC-2026-05-15-g1-itsm-permanent-scope-out §31 path "별도 charter 요구 신설 (R18+) — R16/R17 부활 ❌" 정합).

### 자동화 행동 (5 stage matrix)

| Stage | Skill 호출 | MCP 호출 |
|---|---|---|
| analysis 종료 후 | `ticket-sync stage=analysis` | 1 Initiative + N Epics (per BC) + Tech Debt Story (AP P0) |
| Chain 1 (planning) 종료 후 | `ticket-sync stage=planning` | Story per UC-* + Sub-task 4 batch (chain1 done, chain2/3/4 pending) |
| Chain 2 (spec) 종료 후 | `ticket-sync stage=spec` | Sub-task chain2 done / BHV/AC link comment / Story → In Progress |
| Chain 3 (test) 종료 후 | `ticket-sync stage=test` | RED evidence comment / AC sub-task → Testing |
| Chain 4 (impl) 종료 후 | `ticket-sync stage=implement` | GREEN evidence + commit hash / AC sub-task → Done / Story → Done |

### Confirmation gate (의무)

★ 모든 MCP 호출 직전 사용자 confirmation:
```
★ Confirm ticket-sync stage=planning scope=car?
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
      { "transitioned_at": "2026-05-18T14:30:00+09:00", "to_status": "To Do", "mcp_tool": "mcp__wiki-jira-assistant__jira_create" },
      { "transitioned_at": "2026-05-18T15:00:00+09:00", "from_status": "To Do", "to_status": "In Progress", "mcp_tool": "mcp__wiki-jira-assistant__jira_transition", "evidence_ref": ".aimd/output/evidence/ticket-sync-spec-20260518T150000.json" },
      { "transitioned_at": "2026-05-18T16:30:00+09:00", "from_status": "In Progress", "to_status": "Done", "mcp_tool": "mcp__wiki-jira-assistant__jira_transition" }
    ]
  }
}
```

### Idempotency

★ 재실행 시 `mcp__wiki-jira-assistant__jira_search` JQL 로 기존 ticket lookup (`"UC ID" ~ "UC-CAR-007"`) → 발견 시 신규 생성 skip / `status_history` 만 갱신. `idempotency_skip_count` 증가 기록.

### MCP 미연결 환경

★ `ListMcpResourcesTool` probe 결과 `mcp__wiki-jira-assistant__*` 부재 시 silent skip + `F-TICKETSYNC-001 mcp_unavailable` finding emit (opt-in 설계 / error halt X / 다른 chain harness 진행 무영향).

### v8.6.1 default 제약

- Platform: `mcp__wiki-jira-assistant__*` only (Linear / GitHub Issues MCP = v8.7.0+ multi-platform carry)
- Confluence emit: Initiative overview default false (per-stage 보고서 page = v8.7.0+ Tier 2.6 후보)
- Auto-invoke: gate 통과 후 auto-suggest (confirmation 만 사용자) ★ 권고

---

## 11. v9.0+ carry — Tier 3 (미진입)

| Tier | 형태 | 비용 | 진입 시점 |
|---|---|---|---|
| Tier 1 (v8.6.0+ 04bd0a1) | 정책 문서 + schema field + id-convention manual | ~30분 | ✅ 활성 |
| **Tier 2.5 (v8.6.1+ R20)** | MCP delegation — `skills/ticket-sync/SKILL.md` + 7-field evidence + confirmation gate | ~10시간 | **✅ 활성** (DEC-2026-05-18-r20) |
| Tier 2 (deprecated) | (Tier 2.5 가 흡수 — file emit only 패턴은 별도 진입 X) | — | — |
| Tier 3 (carry) | 자체 platform adapter (Jira REST / Linear GraphQL / GitHub Issues 직접 구현) — MCP 위임 충분 시 carry 영구 유지 | ~4~6시간 / platform | v9.0+ charter review (MAJOR) |

---

## 11. Cross-link

- 결단 record: `decisions/DEC-2026-05-18-ticket-binding-policy.md`
- ID 명명 규약: `methodology-spec/id-conventions.md` §"Ticket Binding"
- Schema field: `schemas/traceability-matrix.schema.json` matrix.items.ticket_ref
- 검증 sample: `tools/schema-validator/test/ticket-binding.test.js`
