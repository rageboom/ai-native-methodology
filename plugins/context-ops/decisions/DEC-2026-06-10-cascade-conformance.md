# DEC-2026-06-10-cascade-conformance

> **정책 11(스킬이 cascade-plan 을 충실히 발사했나)을 결정론 메커니즘으로 강제** → 7·8·9·12 가 trust 에서 enforcement 로 승격 → ticket-sync SKILL 금지 섹션을 포인터 표로 축약. 2중망: PreToolUse 훅(pre-fire) + post-hoc verify(gate).

**일자**: 2026-06-10
**카테고리**: 아키텍처 (결정론 axis 완성 / 정책 강제 메커니즘화)
**상태**: 승인 — 사용자 결단 ("그룹 A·B는 툴로 옮기고 SKILL에서 뺄 수 있는 거 아님?" → 정식 설계 → "M1+M2 둘 다 + cascade-builder verify + SKILL 축약")
**Trigger**: 정책 12개 중 "툴로 강제 가능한 것" 진단 → 7·8·9·12 가 "스킬이 cascade-plan 따랐을 때만" 보장(정책 11 의존) 판명 → 11 강제 시 SKILL 재서술 불요

---

## 1. 통찰

cascade-builder 추출(DEC-2026-06-10-ticket-cascade-builder)로 구조 정책(7·8·9·12)은 cascade-plan 이 보장하나, **"스킬이 cascade-plan 을 그대로 발사했을 때만"** 성립 = **정책 11** 에 의존. 11 을 메커니즘으로 강제하면 7·8·9·12 가 완전 보장되고, SKILL 은 정책을 **규칙으로 재서술할 필요가 없어짐**(메커니즘이 강제 = 포인터만).

비가역(티켓 생성) → post-hoc(사후) 만으로는 "이미 생성된 뒤"라 불충분 → **PreToolUse 훅(발사 직전 차단)** 보강.

## 2. 결단 (2중망)

| 망 | 메커니즘 | 강제 정책 |
|---|---|---|
| **M1 post-hoc** (견고/전체) | `ticket-cascade-builder verify --plan --evidence` — cascade-plan ↔ evidence aggregate 대조 | 7(델타) · 8(orphan) · 9(link_type) · 11(issue_type/coverage) · 12(B14) |
| **M2 pre-fire** (비가역 방어) | hooks-bridge `checkCascadeConformance` — jira_create summary ∉ cascade-plan → PreToolUse deny (exempt: `[Chain `/`[Plugin Verify]`) | 11(계획 밖 발사 차단) |

동반 fix: `shouldBlockToolUse` 가 신 prefix(`mcp__mcp-server-wiki-jira__`) state.blocked 미차단 버그 정정 (양 prefix).

## 3. 변경 자산

| 자산 | 변경 |
| --- | --- |
| `tools/ticket-cascade-builder/src/verify.js` (신규) + cli.js `verify` subcommand + test/verify.test.js(8) | M1 |
| `tools/chain-driver/src/hooks-bridge.js` | `checkCascadeConformance` 신규 + `shouldBlockToolUse` 신 prefix fix |
| `tools/chain-driver/src/cli.js` | PreToolUse 핸들러에 conformance 분기 |
| `tools/chain-driver/test/hooks-bridge.test.js` | +6 (conformance 5 + 신 prefix 1) |
| `schemas/ticket-sync-evidence.schema.json` | mcp_invocations[].`issue_type` optional 추가 (verify 입력 / additive) |
| `skills/ticket-sync/SKILL.md` | 금지 섹션 → **포인터 표 축약**(강제 메커니즘 명시) + §7 verify 호출 의무 + issue_type 캡쳐 |

## 4. 정책별 강제 후 분류

- **메커니즘 강제** (SKILL 재서술 불요 / 포인터): 2(schema) · 5(hooks) · 7·8·9·11·12(verify+훅+builder 구조).
- **SKILL 잔존 규칙** (메커니즘 없음): 1 stage(LLM 진입) · 3 confirmation gate(사람) · 4 sequential(런타임) · 6 R16/R17(거버넌스) · 10 verification+parent_epic(입력).

## 5. 무영향 / 한계

- breaking 0 (evidence issue_type = additive optional / cascade-builder 무변 / 기존 동작 보존).
- M1 post-hoc = 티켓 생성 후 검출(완전 prevention 아님 / gate green 차단으로 drift 묵인 방지) → M2 pre-fire 가 발사 직전 보강.
- M2 정직 한계: summary verbatim 복사 가정(정책 11 요구) / cascade-plan 부재 시 미적용 / verification·enter-task exempt.

## 인용

- plan: `.claude/plans/plan-cascade-conformance.md`
- 모: `DEC-2026-06-10-ticket-cascade-builder` (결정론 추출)
- 원칙: memory `feedback_chain_driver_deterministic_axis`
- 운영: `tools/ticket-cascade-builder/` (verify) + `tools/chain-driver/src/hooks-bridge.js` (checkCascadeConformance) + `skills/ticket-sync/SKILL.md` §금지·§7
