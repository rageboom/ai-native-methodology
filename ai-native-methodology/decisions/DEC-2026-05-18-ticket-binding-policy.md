# DEC-2026-05-18 — Ticket Binding Policy 결단

## 결단

- Plugin chain harness 산출물 ↔ 외부 ticket 시스템 매핑 정책 신설
- **UC = Story / Chain 1 종료 시점에 ticket 생성 / BHV/AC/TC/IMPL 별 별도 ticket X**
- `traceability-matrix.schema.json` matrix item 에 optional `ticket_ref` field 추가
- **Tier 1 (정책 문서 + schema field + id-convention) 만 v8.6.0 진입** / Tier 2 (skill emit) + Tier 3 (platform adapter) = carry

## 배경

PoC-EFI 검증 cycle 2 종결 후 사용자 (sangcl@smilegate.com) 가 일감/ticket 정책 plugin 편입 가능 여부 문의 (2026-05-18):

> "내가 만약에 티켓을 우리 일감과 연동한다고 할때 티켓은 어느시점에 따지는게 맞나? 아니면 각 시점 마다 별도로 따는게 맞나?"
> "지금 이 티켓 정책도 우리 플러그인의 정책으로 넣을 수 있나?"

검토 결과:
- Plugin 의 ID convention (UC-* / BHV-* / AC-* 등) + traceability matrix = ticket 시스템과 자연 정합
- 다만 ticket = process layer / R4 artifact 5종 = artifact layer / 두 영역 분리 의무
- 사용자/조직별 ticket 정책 다양 (Jira Standard vs Premium / Linear / GitHub Issues / Azure DevOps) → validator 강제 X / 권고만

## 대안 비교

| 옵션 | 채택 여부 | 사유 |
|---|---|---|
| A) ticket 정책 plugin scope 외 / 사용자 자율 | ❌ | 사용자 마이그레이션 시 매 organization 마다 결단 반복 → plugin 가치 손실 |
| **B) Tier 1 (정책 + schema field + id-convention) 만 v8.6.0 진입 ★** | **✅ 채택** | 강제력 X / additive / breaking 0 / 즉시 활용 가능 |
| C) Tier 1 + Tier 2 (ticket emit skill) v8.7.0 batch | △ carry | skill 의무 vs 선택 결단 별도 필요 → MINOR 별도 |
| D) Tier 1+2+3 (API adapter 포함) v9.0 batch | △ carry | platform 종속 / R# 카테고리 신설 의무 → charter review |

## R# 정합 점검

| R | 영향 | 결과 |
|---|---|---|
| R4 재사용성 5종 (antipatterns/rules/domain/openapi/schema) | 충돌? | ❌ 없음 — ticket = process layer / R4 = artifact layer 분리 |
| Mechanical gate (state.blocked + CLI exit 2 + PreToolUse deny) | 충돌? | ❌ 없음 — Tier 1 은 권고만 / validator 강제 X |
| R15 no-simulation | 영향 | ✅ 일관 — Tier 3 platform adapter 시 real API + evidence 의무 |
| ID convention (UC-* / BHV-* etc.) | 영향 | ✅ 정합 — UC = Story 1:1 매핑 자연스러움 |
| Traceability matrix bidirectional | 영향 | ✅ 정합 — `ticket_ref` 가 외부 system 으로 link 1개 추가 |

## 영향 범위 (additive / breaking 0)

| 파일 | 변경 | breaking |
|---|---|---|
| `methodology-spec/ticket-policy.md` | **NEW** | 0 |
| `decisions/DEC-2026-05-18-ticket-binding-policy.md` | **NEW** (본 문서) | 0 |
| `schemas/traceability-matrix.schema.json` | matrix.items.properties.ticket_ref optional 추가 | 0 (필수 X) |
| `methodology-spec/id-conventions.md` | "Ticket Binding" section 추가 | 0 (단순 문서 추가) |
| `tools/schema-validator/test/ticket-binding.test.js` | **NEW** (회귀 test) | 0 |

## 검증

- schema-validator 회귀 test 추가 (`ticket-binding.test.js`):
  - ticket_ref 없는 traceability matrix valid 의무 (기존 회귀)
  - ticket_ref 있는 traceability matrix valid 의무 (신규)
  - platform enum 외 값 reject 의무
  - subtask_ids unknown chain key reject 의무
- 기존 traceability matrix 산출물 영향: optional field → omit 가능 → **0**

## 후속 carry

- **Tier 2 (v8.7.0+ 후보 / MINOR)**: chain 1 종료 시 ticket payload (CSV/JSON) 자동 emit skill (`planning-ticket-emit`) — file emit 만 / API 호출 X
- **Tier 3 (v9.0+ charter review)**: platform adapter (Jira / Linear / GitHub Issues) — real API 호출 + no-simulation evidence 의무

## Cross-link

- 정책 본문: `methodology-spec/ticket-policy.md`
- ID 명명: `methodology-spec/id-conventions.md` §"Ticket Binding"
- Schema: `schemas/traceability-matrix.schema.json` matrix.items.ticket_ref
- Plugin baseline: branch `fix/v8.5.0-p0-findings` 의 3번째 commit 예상 (v8.6.0 cut 전)

## 후속 — v8.6.1 R20 신설 (Tier 2.5 MCP delegation)

★ 본 Tier 1 DEC = manual only. v8.6.1 (2026-05-18) 에 **R20 신설 = Tier 2.5 MCP delegation 자동화** 진입 (DEC-2026-05-18-r20-mcp-ticket-sync-channel):

- 사용자 보유 jira-confluence MCP (`mcp__wiki-jira-assistant__*`) 위임 → chain stage 동기 ticket lifecycle 자동
- 모든 MCP 호출 직전 사용자 confirmation gate 의무
- 7-field evidence + `traceability-matrix.ticket_ref.status_history` 추가
- 신규 자산: `skills/ticket-sync/SKILL.md` + `schemas/ticket-sync-evidence.schema.json` + `hooks/hooks.json` PreToolUse matcher 확장
- R16/R17 부활 ❌ — 신규 채널 (DEC-2026-05-15-g1-itsm-permanent-scope-out §31 path 정합)
