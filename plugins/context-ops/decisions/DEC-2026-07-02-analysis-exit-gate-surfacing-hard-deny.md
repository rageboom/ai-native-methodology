# DEC-2026-07-02-analysis-exit-gate-surfacing-hard-deny

**gate #0(analysis exit) 표면화(layer 3) 결정론 강제 — 위조불가 UserPromptSubmit 토큰 (v0.93.0 MINOR / additive)**

상태: 채택 (Accepted) · 일자: 2026-07-02 · 결정자: sangcl · 계기: ep-fe-mis dogfood ([[project-methodology-dogfood]])

## 문제 (dogfood 발견 / 코드 검증)

게이트는 3계층이다:

1. **판정 (evaluate)** — `gate-eval.js evaluateGate` / 결정론 ✅
2. **차단 (block)** — `state.blocked` → PreToolUse `shouldBlockToolUse` deny / 결정론 ✅
3. **표면화 (surface)** — go/stop/revisit 리뷰가 **실제로 사용자에게 뜨는 것** — `_base-invoke-go-stop-gate` 스킬을 LLM 이 호출해야만 발생 = **강제 아님(nudge)** ❌

특히 **gate #0 (analysis exit / DEC-2026-06-06)** 은 표면화 신호가 **0** 이다:

- `plan-review-server` 미지원 (artifact-registry phases = discovery-draft/discovery/spec/plan 만).
- `_base-invoke-go-stop-gate` 스킬 stage 목록이 discovery1 부터 시작 — #0 부재.
- `gate-review-passage.json` 마커 미생산 (서버가 안 뜨므로).

결과: 통과하는 #0(critical/high 0)이 `chain-driver next` 로 조용히 auto-advance — 검토 UX 를 통째 건너뛰어도 아무 신호가 남지 않는다. (DEC-2026-06-25 §문제 leak — 오케스트레이터가 sub-agent dispatch 를 건너뛰고 CLI 직접 호출 시 프롬프트 통째 누락 — 의 #0 판.)

## 선행 결정과의 관계 (DEC-2026-06-25-gate-review-bypass-guard)

DEC-2026-06-25 는 이 문제의 **Phase 1(정직화)** 만 처리했다: 3-value actor provenance(`driver`/`user`/`user_auto`/`llm_assumed`) + `gate-review-passage.json` 마커 + 부재 시 stderr 1줄 **비차단 advisory**. 그리고 hard-deny 를 **Phase 2 scope-out** 으로 연기하며 두 제약을 명시했다:

- **≥2 PoC corroboration** (Phase 1 advisory 가 실제 우회를 포착한 관측) 후 별도 DEC.
- **위조불가 신호 전제**: "위조불가 신호는 plan-review-server spawn 토큰뿐. LLM-writable 텍스트 마커 = speedbump(벽 ❌). test/implement 텍스트 게이트는 서버 토큰 불가 = advisory 한계 … speedbump 를 '벽'으로 사칭 ❌ (no-simulation 정신)."

즉 **LLM 이 쓸 수 있는 텍스트 마커로 #0 을 hard-deny 하면 DEC-2026-06-25 가 금지한 "벽 사칭"** 이 된다. 본 결정은 이 제약을 우회하지 않고 **정면으로 충족**한다 — 새 위조불가 신호 클래스를 도입해서.

## 결정

### 1. 위조불가 신호 클래스 신설 — UserPromptSubmit 발급 결정 토큰

`state.user_gate_token = { stage, decision, issued_at, nonce, consumed }`. **UserPromptSubmit 훅**(`hooks-bridge.deriveGateDecisionToken` 순수 + cli glue CAS write)이 `pending_gate` 가 걸린 동안 사용자의 go/stop/revisit 결단 프롬프트를 매칭했을 때만 발급한다.

**위조불가 근거**: LLM 은 UserPromptSubmit 이벤트를 **유발할 수 없다** — 이 이벤트는 사람의 프롬프트 제출로만 발생하며, LLM 의 assistant 출력("go 라고 실행하겠습니다")은 유발하지 않는다. 따라서 토큰의 존재는 "사람이 실제로 결단을 제출했다"의 증거다. 이는 plan-review-server spawn 마커와 **동급의 위조불가 신호**이며, DEC-2026-06-25 가 "불가"로 규정한 **텍스트 게이트의 위조불가 신호를 실현**한다 (마커가 아니라 harness 이벤트 기반이므로 LLM-writable 아님).

### 2. cmdNext present→decide (gate #0 한정)

`stage==='analysis'` 에서, 게이트가 통과(above validator)하더라도 **fresh·unconsumed·stage 일치 토큰 또는 `--auto-mode` 위임이 없으면 전진 ❌**:

- **hold**: `pending_gate` set(stage/gate_id/presented_at/findings_snapshot) + 평이 리뷰 렌더(stderr) + stdout `{awaiting_decision:true,…}` + `blocked=true, block_reason='gate_not_surfaced'` + exit 1.
- 유효 토큰이면: 토큰 단일 소비(`user_gate_token=null`) + `pending_gate=null` + 기존 advance 경로.
- `deriveGateActor` 에 `userTokenFresh` 신호 추가 — #0 토큰 전진 시 actor=`user`. #0 `llm_assumed` advisory → **hard hold 로 승격**(전진 전 차단).

### 3. 차단·anti-bypass 재사용 (신규 배선 최소)

hold 가 `blocked=true` 를 세팅하므로 **기존 메커니즘이 그대로 작동**한다:

- PreToolUse `shouldBlockToolUse` → `.ai-context/` write deny (reason `gate_not_surfaced`).
- anti-bypass: `next`(no `--user-decision`) → `blockedExit` exit 2.
- MCP ticket-sync deny (R20).

→ **신규 exit code ❌ / 신규 PreToolUse matcher ❌** (DEC-2026-06-25 scope-out 준수).

### 4. 범위 (§8.1 no-overfit)

- **gate #0 만** hard-deny 승격.
- discovery#1/spec#2/plan#3 = 서버 마커 advisory 유지 (별 신호 클래스 / 무영향).
- test#4/implement#5 = 텍스트 advisory carry 유지 — 단 **동일 UserPromptSubmit 토큰 신호로 후속 무개조 승격 가능**(DEC-2026-06-25 의 "text=영구 advisory" 한계를 원칙적으로 폐기 / [[DEC-2026-06-25-gate-review-bypass-guard]] Phase 2 후속).

## §8.1 (no-overfit) 정직 기록

DEC-2026-06-25 는 hard-deny 를 ≥2 PoC corroboration 뒤로 미뤘다. 본 승격의 근거:

1. 원 caution 의 전제 — "신호가 LLM-writable = 벽 사칭" — 를 **위조불가 신호(UserPromptSubmit 이벤트 기반)** 도입으로 제거했다. 새 신호 클래스는 그 caution 의 사정권 밖이다.
2. ep-fe-mis dogfood 를 1차 corroboration 으로 계상한다.

**잔여 한계(정직)**: 토큰은 "사람이 결단을 *제출*했다"까지만 증명하고 "사람이 리뷰를 실제로 *읽었다*"는 증명하지 못한다(사람이 리뷰를 안 보고 "go" 를 칠 수 있음). 이는 방법론 speedbump 철학의 기존 ceiling 과 동일하며, 리뷰는 hold pass 에서 토큰 발급보다 먼저 렌더되므로 종전(표면화 신호 0)보다 엄격하게 개선된 상태다.

## 검증

- chain-driver **789/789** GREEN (777 무회귀 + 신규 `gate-surfacing-hard-deny.test.js` 12).
- 기존 F-AUDIT-SOFTGATE-001(C-13) ack 2건 = findings soft-block 위에 표면화 게이트가 얹혔으므로 `--auto-mode` 동봉으로 갱신(의도 보존 — findings 해소는 go, 표면화 해소는 토큰/auto = 독립 2게이트).
- E2E 실측(no-simulation): `init` → `next --user-decision go`(토큰 없음) → exit 1 + `gate_not_surfaced` + `pending_gate`(#0) + 리뷰 렌더 + 미전진 → UserPromptSubmit `go` → 토큰 발급 → `next --user-decision go` → 전진(discovery) + 토큰 소비.
- version-check 3-way sync v0.93.0.

## 변경 파일

- `schemas/state.schema.json` — `pending_gate`·`user_gate_token`(optional/하위호환) + `block_reason` enum `gate_not_surfaced`.
- `tools/chain-driver/src/gate-provenance.js` — `userGateTokenFresh`(순수) + `deriveGateActor` `userTokenFresh` 파라미터.
- `tools/chain-driver/src/hooks-bridge.js` — `deriveGateDecisionToken`(순수).
- `tools/chain-driver/src/cli.js` — cmdNext #0 hold/advance + UserPromptSubmit 토큰 발급 glue.
- `tools/chain-driver/test/gate-surfacing-hard-deny.test.js` (신규) + `f-cha-001-trio-integration.test.js`(2건 갱신).
- `commands/chain-next.md` · `skills/_base-invoke-go-stop-gate/SKILL.md` · `docs/adr/ADR-CHAIN-002-go-stop-gate.md` — 표면화 강제 반영.
