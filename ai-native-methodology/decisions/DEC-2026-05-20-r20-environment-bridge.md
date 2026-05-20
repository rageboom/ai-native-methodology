# DEC-2026-05-20 — R20 amendment v3: environment bridge (issuetype_map + parent_strategy + Pre-flight 정정)

## 결정

- **R20 amendment v8.7.3** = ticket-sync skill 에 6축 확장 추가 (DEC-2026-05-20-r20-verification-mode 의 sibling amendment):
  - **B8 Pre-flight §1 — MCP probe 교체** (`ListMcpResourcesTool` 단독 의존 ❌ / tools-deferred-list probe + `jira_search` fallback)
  - **B9 Pre-flight §2 — state.json path 정정** (`.aimd/state.json` + `state.current_scope` 매칭 / `.aimd/<scope>/state.json` 명세 drift 폐기)
  - **B10 Pre-flight §4 — stage 분기 명시** (특히 `stage=analysis` 의 14~16 산출물 명시)
  - **B11 Pre-flight §2 — gate-pass 분기** (`mode=verification` 시 gate-pass check 우회 / verification meta-cycle 본질 정합)
  - **B12 issuetype_map 파라미터** — Jira 환경별 issuetype 명명/id 매핑. role → name/id resolve table.
  - **B13 parent_strategy + epic_link_customfield_id 파라미터** — parent 매핑 전략 (Atlassian Cloud 표준 `parent_key` vs 권한 분리 환경 `epic_link_customfield`).
- v8.7.3 PATCH 진입 — additive only / breaking 0. standard mode + verification mode 본문 무변경 (env resolve prelude 만 추가 / 호출 sequence 동일).
- DEC-2026-05-20-r20-verification-mode 와 본 DEC 두 amendment 가 R20 채널의 본격 environment-portability 자격 자산.

## 근거

### 1. 실 사용 사례 발견 (mis-fe-admin EAM-AUTH verification cycle iter-6 Stage 1)

DEC-2026-05-20-r20-verification-mode 적용 v8.7.2 plugin 으로 mis-fe-admin EAM-AUTH iter-6 verification cycle Stage 1 (analysis exit) 진입 시 6 mismatch 발견 (F-VERIFY-005 ~ F-VERIFY-010):

- **F-VERIFY-005** — SKILL.md §단계 1.1 의 `ListMcpResourcesTool` 는 resource-only probe. wiki-jira MCP server 가 resource 0 노출 + tools 50+ deferred 등록 환경에서 false negative (silent skip + 잘못된 F-TICKETSYNC-001 emit).
- **F-VERIFY-006** — SKILL.md §단계 1.2 의 `.aimd/<scope>/state.json` path 와 `chain-driver init` 의 실 산출 위치 `.aimd/state.json` (scope=current_scope 필드) drift.
- **F-VERIFY-007** — SKILL.md §단계 1.4 가 명시한 산출물 list (planning-spec/behavior-spec/AC/test-spec/impl-spec) 와 §단계 5b verification analysis 가 enumerate 하는 산출물 list (inventory/architecture/domain/business-rules/antipatterns/state-map/...) 불일치 — analysis 14건 누락.
- **F-VERIFY-008** — SKILL.md §단계 1.2 "gate 미통과 시 reject" vs verification meta-cycle 의 gate 부재 자연성 충돌. `mode=verification` 의 본질상 정식 chain harness gate 부재가 자연.
- **F-VERIFY-009** (★ ★ HIGH) — SKILL.md §단계 5b 가 issuetype="Story" hardcode 하지만 DWPD project 환경:
  - "스토리" issuetype 0건 사용 (1565 issue 표본 검증).
  - 실 사용 issuetype = 작업 / 버그 / 하위 작업 / 개선 / 새 기능 / epic.
  - 결과: `jira_create` 400 "issue type is required" + 사용자 우회 path 강제.
- **F-VERIFY-010** (★ ★ HIGH) — SKILL.md §v8.6.3+ "orphan ticket ❌ — parent_ticket_id 의무" vs DWPD 환경:
  - 일반 issue (작업/새 기능) 는 `parent` 필드 직접 매핑 ❌ → `customfield_10006` Epic Link 사용 의무.
  - Sub-task (하위 작업) 만 `parent_key` 정합.
  - 결과: `jira_create` 400 "이슈 유형 10401 은 하위 작업이 아니지만 상위가 지정" + 사용자 우회 path 강제.

→ 6 finding 모두 본질적으로 **environment portability 결손** — plugin 이 Atlassian Cloud 표준 영문 명명 + parent_key 단일 path 만 spec 하는데 실 사용자 환경 (DWPD / 사내 Atlassian DC 등) 은 다른 명명·다른 link 방식.

### 2. plugin universal claim 본질

R20 채널 charter (DEC-2026-05-18-r20-mcp-ticket-sync-channel §사용자 결단 1) 는 "Jira workflow transition target IDs — project-specific / `jira_transitions` 사전 lookup 의무" 만 environment-specific 으로 인정. 다만 실제로는:

| 축 | v8.7.2 plugin spec | mis-fe-admin DWPD 환경 실측 | drift 종류 |
|---|---|---|---|
| Workflow transition ID | env-config 의무 (sec 1) | OK (jira_transitions lookup) | spec 정합 |
| issuetype 명명 | hardcode "Story" / "Sub-task" / ... | "작업" / "하위 작업" / "epic" / "개선" | ★ ★ ★ HIGH drift |
| parent linking | hardcode `parent` 필드 | customfield_10006 Epic Link | ★ ★ ★ HIGH drift |
| state.json path | `.aimd/<scope>/state.json` | `.aimd/state.json` + scope 필드 | ★ ★ HIGH drift |
| MCP probe | `ListMcpResourcesTool` | tools deferred list | ★ HIGH drift |
| gate-pass | 의무 | verification 본질상 부재 자연 | ★ HIGH drift |

→ universal claim 보존하려면 6축 environment-config 화 정합.

### 3. R15 no-simulation / R20 confirmation gate 본질 보존

env resolve prelude 도 standard / verification mode 와 동일:
- real MCP 호출 의무 (7-field evidence)
- confirmation gate 의무 (preview MD → yes/no/dry-run / payload resolve 결과도 preview 에 표기)
- Sequential MCP 호출 (parallel ❌)
- search-first idempotency
- silent skip + finding emit (MCP 미연결 환경)

env resolve 가 R20 본질 위반 ❌ — resolve 은 SKILL.md spec 의 hardcode 표기 제거가 아니라 **role label 추상화** + **환경별 substitute table**.

### 4. v8.7.3 PATCH vs MINOR 결단

PATCH (8.7.2 → 8.7.3) 자격:
- standard mode 본문 무변경 (issuetype 명명 default = Atlassian 표준 / parent_strategy=auto default 가 기존 parent_key 동치)
- verification mode 본문 무변경
- 신규 args 3개 (issuetype_map / parent_strategy / epic_link_customfield_id) 모두 default 가 v8.7.2 동치 행동
- 기존 standard mode 사용자 (Atlassian Cloud 표준 환경) 무영향
- env-config 명시 사용자만 새 path

→ MINOR 아닌 PATCH 정합. R20 채널 universal portability 본격 자격 도약은 별도 MINOR (8.8.0) 후보 (예: Confluence per-stage 보고서 / Trello/Linear adapter 등).

### 5. 본 amendment 가 풀지 않는 본질 (carry)

- **F-VERIFY-004 (Stop hook 부재)** — v8.7.2 의 B6 chain-driver next stderr 로 부분 완화. Stop hook 직접 등록은 noise 회피 의도로 carry 유지.
- **Auto-trigger 본질** — confirmation gate 의무 보존상 auto-trigger ❌ 영구. 사용자 명시 호출 의무 (DEC-2026-05-18-r20 §사용자 결단 3 정합).
- **Confluence per-stage 보고서** — v8.7.0+ Tier 2.6 carry / 본 amendment 와 직교.
- **Trello/Linear/GitHub Issues adapter** — Tier 3 자체 adapter / v9.0+ carry.

## 시행 (단일 commit / branch `v8.7.3-r20-environment-bridge`)

1. **skills/ticket-sync/SKILL.md** §파라미터 + §단계 1 + §단계 5 prelude + §금지 + §사용자 결단 + §Cross-link 6 patch (additive only / standard·verification mode 본문 무변경).
2. **decisions/DEC-2026-05-20-r20-environment-bridge.md** 신설 (본 record).
3. **CHANGELOG.md** `[8.7.3]` entry 추가 (본 amendment 6축 + F-VERIFY-005~010 evidence 인용 + mis-fe-admin EAM-AUTH iter-6 driver).
4. **.claude-plugin/plugin.json** + **package.json** + **CLAUDE.md** version sync (8.7.2 → 8.7.3).
5. **release:check** 13/13 통과 의무 (v8.7.2 baseline 회귀 0 / 본 patch breaking 0).

## Cross-link

- **선행 결단** (R20 채널 신설): `decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md`
- **v8.7.2 amendment**: `decisions/DEC-2026-05-20-r20-verification-mode.md`
- **본 amendment**: `decisions/DEC-2026-05-20-r20-environment-bridge.md` (v8.7.3)
- **driver finding evidence**: mis-fe-admin EAM-AUTH iter-6 `.aimd/output/eam/authority/iter-6/findings.md` F-VERIFY-005~010 + `.aimd/output/evidence/ticket-sync-analysis-20260520T081728Z.json`
- **SKILL.md 본문**: `skills/ticket-sync/SKILL.md` §파라미터 + §단계 1 + §단계 5 env resolve prelude + §금지 v8.7.3+ 절 2건 + §사용자 결단 7번
- **R16/R17 영구 scope-out parent**: `decisions/DEC-2026-05-15-g1-itsm-permanent-scope-out.md` §31
- **Tier 1 (manual) 선행**: `decisions/DEC-2026-05-18-ticket-binding-policy.md`
- **policy 본문**: `methodology-spec/ticket-policy.md` §Tier 2.5
- **charter entry**: `methodology-spec/plugin-charter.md` §1+§2
