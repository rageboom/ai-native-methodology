# DEC-2026-05-21 — R20 amendment v4: Sub-task Epic auto-inherit invariant + Structure 자동 등록 표준화

## 결정

- **R20 amendment v8.7.4** = ticket-sync skill 에 2축 확장 추가 (DEC-2026-05-20-r20-verification-mode + DEC-2026-05-20-r20-environment-bridge 의 sibling amendment):
  - **B14 Sub-task Epic auto-inherit invariant** — role=`subtask` 의 `jira_create` payload 에 `extra_fields[epic_link_customfield_id]` (예: DWPD `customfield_10006`) 명시 ❌. parent Story/Task 로부터 **auto-inherit** (Jira native semantic). 명시 시 backend 400 reject. 사후 `jira_update` 로 backfill 도 동일 reject. 모든 `parent_strategy` 환경 공통 invariant.
  - **B15 Structure 자동 등록 표준화** — Atlassian Structure (ALM Works DWP-Forge) tree ID `structure_id` args 또는 env-config 명시 시 phase=exit 종료 시점에 `jira_structure_add_issues` 자동 호출 표준 (모든 신규 ticket 등록). native Epic Link 와 별개 trace 채널. 미명시 시 silent skip (Structure 미사용 환경 무영향).
- v8.7.4 PATCH 진입 — additive only / breaking 0. standard mode + verification mode 본문 무변경 (Sub-task 본문 주석 + Structure 자동 호출 step 만 추가 / 호출 sequence 동일).
- DEC-2026-05-20-r20-verification-mode + DEC-2026-05-20-r20-environment-bridge + 본 DEC 3 amendment 가 R20 채널의 production-ready 자격 자산 (verify-1 iter-6 cycle 종결 evidence).

## 근거

### 1. 실 사용 사례 — mis-fe-admin EAM-AUTH verify-1 iter-6 (Stage 1 analysis exit)

v8.7.3 plugin 으로 mis-fe-admin EAM-AUTH verify-1 iter-6 Stage 1 진입 시:

**B14 evidence (Sub-task customfield_10006 명시 ❌)**:
- Stage 1 (analysis) 의 Sub-task 14건 (DWPD-1668~1681) 생성 시 `extra_fields.customfield_10006 = "DWPD-1442"` (parent Epic) 명시 시도 → 모두 400 reject.
- 사용자 우회: `jira_create` payload 에서 customfield_10006 제거 후 `parent_key=<Story key>` 만 사용 → 14건 모두 success. parent Story (DWPD-1667) 의 Epic Link (customfield_10006 = DWPD-1442) 가 Sub-task 에 auto-inherit 확인.
- 후속 `jira_update × 14` backfill 시도 (잘못된 hint 로 customfield_10006 재명시) → 14건 모두 400 reject. → carry_to_v8_7_4: "B14 Sub-task epic_link dual binding 의무" (★ 정정 = dual binding 이 아니라 single binding + auto-inherit / F-VERIFY-015 신규 finding).

**B15 evidence (Structure 자동 등록)**:
- Stage 1 종결 후 사용자가 별도 `jira_structure_add_issues` 호출로 Atlassian Structure (DWP-Forge id=676) 에 Story 1 + Sub-task 14 = 15 row 추가 (version 1→2). 본 호출이 plugin 본문에 자동화되어 있지 않아 Stage 마다 사용자 manual 호출 필요. → carry_to_v8_7_4: "B15 jira_structure_add_issues 자동 호출 표준화".
- 5 stage 종결 후 Structure tree 총 106 row 등록. version 1 → 6 (stage 별 +1).

### 2. invariant 본질

**B14 — Sub-task 의 Epic Link 은 parent 의존이며 child 가 별도 binding 시도하면 reject** 가 Jira 본질. 본질을 어긴 SKILL.md v8.7.3 본문 (parent_strategy=epic_link_customfield 시 "Sub-task = `parent_key`" 만 명시했으나 invariant 의 강도가 약함) 을 v8.7.4 에서 명시적 invariant + 위반 reject path 명문화.

**B15 — Structure 등록은 native Epic Link 와 별개 trace 채널**. Epic Link 만으로는 임의 tree manual override (예: cross-Epic 도메인 그룹 / Tech Debt cluster) 불가. Structure 가 사용되는 환경에서는 모든 신규 ticket 이 tree 에 등록되어야 traceability hole 없음 — phase=exit 마다 자동 호출 표준화.

### 3. universal claim 정합

| 축 | v8.7.3 plugin | v8.7.4 |
|---|---|---|
| Sub-task Epic Link binding | "Sub-task = parent_key" 약한 명시 | invariant + 위반 reject + auto-inherit 본문 |
| Structure 등록 | analysis exit 만 1회 자동 | 모든 phase=exit 자동 (env-config 설정 시) |
| 사용자 manual 부담 | Sub-task customfield 시도 → 매번 reject + 사용자 우회 | 0 (Sub-task payload 본문이 자체로 정합) |

## 변경 항목

1. **SKILL.md §파라미터 표** — `structure_id` + `structure_auto_add_on_exit` 2 파라미터 신설.
2. **SKILL.md §단계 5 prelude / parent linking resolve 의 subtask 분기** — auto / epic_link_customfield 두 strategy 모두 Sub-task 에 customfield 명시 ❌ 명문화.
3. **SKILL.md §단계 5 phase=exit 본문** — analysis/planning/implement 각 stage 의 structure_add_issues 자동 호출 step 추가 (planning Sub-task 본문에 B14 주석 추가).
4. **SKILL.md §단계 5b mode=verification 본문** — analysis/planning/spec/test/implement 5 stage 모두 Sub-task 본문 B14 주석 + structure_add_issues 자동 호출 step.
5. **SKILL.md §금지/강제력** — B14 invariant 항목 신설 (F-TICKETSYNC-011 subtask_epic_link_violation).
6. **SKILL.md §사용자 결단** — 8번 (B14 Sub-task auto-inherit) + 9번 (B15 Structure 자동 등록) 신설.
7. **SKILL.md §DWPD 환경 reference config** — structure_id=676 + structure_auto_add_on_exit:true + B14 주석 추가.
8. **SKILL.md §Cross-link** — v8.7.4 amendment 라인 추가.

## carry / 잔존 위험

- **F-VERIFY-015** (B14 amended) — 본 결정으로 close. SKILL.md 본문 invariant 명문화 + 위반 reject path 정합.
- **F-VERIFY-004 (Stop hook)** — cross-cycle carry 유지 (별 결정 / v8.7.x scope 외).
- **structure_id 미사용 환경 호환** — silent skip path 검증됨 (env-config 미명시 시 structure_auto_add_on_exit 자체 무효 / Atlassian Cloud 표준 환경 native 호환).
- **Structure tree version conflict** — 동시 cycle 진입 시 version mismatch 위험. 1 cycle 1 session 가정 (현 plugin paradigm 와 정합).

## next

- **v8.7.5 PATCH 후보**:
  - Structure 진입 권한 fallback (사용자 권한 부재 시 silent skip + finding 명시)
  - mcp invocation evidence schema 에 `structure_version_before` / `structure_version_after` 명시 필드 추가.
- **별 cycle (mis-fe-admin EAM-AUTH 도메인 cycle)** — verify-1 iter-6 산출물 (vitest 21 RED + impl artifact 12) 의 실 GREEN 변환 — plugin 본 작동 별 검증.

## 정합 cross-ref

- v8.6.1 R20 신설 charter: `decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md`
- v8.7.2 amendment (verification mode + parent_epic + Stop hook): `decisions/DEC-2026-05-20-r20-verification-mode.md`
- v8.7.3 amendment (environment bridge / B8~B13): `decisions/DEC-2026-05-20-r20-environment-bridge.md`
- v8.7.4 본 amendment: `decisions/DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md`
- skill 본문: `skills/ticket-sync/SKILL.md`
- 입증 evidence: mis-fe-admin `.aimd/output/eam/authority/iter-6/jira-trace.json` (stage1_analysis.B14 sub_section + stage1_analysis.atlassian_structure)
