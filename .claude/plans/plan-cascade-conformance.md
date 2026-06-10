# plan — cascade conformance enforcement (정책 11 강제 → SKILL 축약)

## 목표
"스킬이 cascade-plan 을 진짜 따랐나"(정책 11)를 **결정론 메커니즘으로 강제** → 7·8·9·11·12 가 trust 에서 enforcement 로 승격 → SKILL 금지 섹션을 **포인터로 축약**.

## 배경 (앞 진단)
- cascade-builder 추출로 7·8·9·12 는 "구조상 보장"되나 **"스킬이 cascade-plan 을 충실히 베꼈을 때만"** = 정책 11 에 의존.
- 11 이 강제되면 7·8·9·12 완전 보장 → SKILL 재서술 불요.
- 비가역(티켓 생성) → 가능하면 발사 직전 차단(PreToolUse) + post-hoc 이중망.

## 메커니즘 (2중망)

### M1. post-hoc conformance (primary / 견고) — `ticket-cascade-builder verify`
- ticket-cascade-builder 에 `verify` subcommand 신설: `--plan cascade-plan.json --evidence ticket-sync-evidence.json`.
- 검사 (결정론):
  - 각 evidence.mcp_invocation(jira_create) ↔ cascade-plan.calls 매칭(summary 키).
  - **issue_type 일치**(정책 11/9) · **parent strategy/customfield 일치**(11/8) · **subtask 에 epic_link cf 부재**(B14/12) · **delta_action=skip_prebound 인데 create 흔적 ❌**(7) · **orphan ❌**(8).
  - 불일치 = finding `F-TICKETSYNC-0XX cascade_conformance_violation` + exit 1.
- 호출 위치: chain 3 plan gate(또는 ticket-sync 종결) 에서 실행 → drift 시 gate green ❌ (cycle 통과 차단).

### M2. PreToolUse 훅 (pre-fire / 보조 / 비가역 방어) — hooks-bridge 확장
- `jira_create`(신·구 prefix) PreToolUse 시 cascade-plan.json 존재하면:
  - jira_create.summary ∈ cascade-plan.calls[].summary (exact) → 통과 / 아니면 **deny**.
  - **exempt prefix**: `[Chain ` (enter-task) / `[Plugin Verify]` (verification mode / cascade-plan 무관).
  - subtask issue_type 인데 extra_fields 에 epic_link cf 있으면 deny (B14 cheap check / config 의 subtask issue_type 참조).
- **동시 버그 fix**: `shouldBlockToolUse` 가 신 prefix(`mcp__mcp-server-wiki-jira__`) state.blocked 미차단 → 양 prefix 차단으로 정정.
- 정직 한계: summary-match 는 LLM 이 verbatim 복사 가정(정책 11 이 요구) — 위반 시 deny(=의도된 동작). false-block risk 는 exempt prefix 로 완화.

## SKILL 축약 (M1·M2 완성 후)
- 금지 1·2·5·7·8·9·11·12 → **"정책 강제 위치" 포인터 표 1개**로 축약:
  | 정책 | 강제 |
  |---|---|
  | 2 simulated | evidence schema enum |
  | 5 state.blocked | hooks PreToolUse deny |
  | 7·8·9·11·12 | cascade-builder(구조) + `verify`(post-hoc) + PreToolUse 훅(pre-fire) |
- **잔존(메커니즘 없음 → SKILL 규칙 유지)**: 3 confirmation gate(사람) · 4 sequential(런타임) · 6 R16/R17(거버넌스) · 10 verification+parent_epic(입력 가드 / M1 흡수 가능).
- 발사 절차(§6 execution loop)는 유지 (HOW-to-fire = 정책 아님).

## 영향 파일
1. `tools/ticket-cascade-builder/src/verify.js` (신규) + `cli.js` (verify subcommand 분기) + `test/verify.test.js`
2. `tools/chain-driver/src/hooks-bridge.js` — `checkCascadeConformance` 신규 + `shouldBlockToolUse` 신 prefix fix
3. `tools/chain-driver/test/hooks-bridge.test.js` — 신규 케이스
4. `hooks/hooks.json` — (이미 jira matcher 있음 / 무변경 가능 / conformance 분기 추가 시 확인)
5. `skills/ticket-sync/SKILL.md` — 금지 섹션 → 포인터 표 축약
6. (신규) `decisions/DEC-2026-06-10-cascade-conformance.md` + INDEX
7. (선택) finding id 등재 (SKILL inline)

## 검증
- verify 단위 테스트(일치 통과 / 각 위반 reject) green
- hooks-bridge 테스트 (conformance deny / exempt prefix 통과 / 신 prefix state.blocked fix) green
- workspace 회귀 0 / skill-citation 0 stale / breaking 0

## 설계 결정 (일괄 승인)
- **DA**: post-hoc 위치 = ticket-cascade-builder `verify` subcommand (신규 도구 ❌ / 응집).
- **DB**: PreToolUse 훅 = summary-membership + exempt prefix + B14 cheap. (포함 vs M1만 먼저)
- **DC**: SKILL 금지 → 포인터 표 (M1·M2 green 확인 후 축약).
- **DD**: 매칭 키 = summary(exact). body 제외(whitespace drift). issue_type/parent 는 매칭 후 필드 비교.

## 리스크
- 훅 summary-match false-block (exempt prefix 로 완화 / 정직 한계 문서화).
- verification mode 는 cascade-plan 무관 → exempt 필수.
- M1 은 post-hoc(티켓 이미 생성) → gate green 차단으로 "drift 묵인" 방지(완전 prevention 아님 / M2 가 pre-fire 보강).

## Lessons
- evidence 가 issue_type 을 안 담아서 post-hoc 11(issue_type) 검증 불가 → optional `issue_type` additive 추가(skill 캡쳐). 1:1 summary match 대신 **aggregate/set 검사**(coverage/델타/orphan/link_type) 채택 = 견고(LLM summary drift 무관).
- **길이 역설(정직)**: 이 라운드는 SKILL 279→293(+14). 금지 12 bullet → 포인터 표(축소)지만 verify 호출 절차 블록 + issue_type 캡쳐 의무가 상쇄. **이 작업의 가치는 "짧게"가 아니라 "trust→enforcement"** — 7·8·9·11·12 가 이제 verify(post-hoc)+훅(pre-fire)+builder(구조)로 강제. 사용자 "툴로 옮기면 뺄 수 있잖아"의 정확한 답 = 정책은 메커니즘으로 옮겨졌으나 enforcement 배선이 라인을 약간 되먹음.
- shouldBlockToolUse 신 prefix 미차단 버그 동반 발견·수정 (이전 prefix fix 의 잔여 구멍).
- 결과: verify 8 + hooks-bridge +6 test / canonical 42 / citation 0 stale / breaking 0.
