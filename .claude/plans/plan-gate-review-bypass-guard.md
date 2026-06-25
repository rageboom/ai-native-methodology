# plan — gate 검토 UX 우회 가드 (chain harness 버그)

> 4원칙 §1 (깊은 숙지 → plan). §2 research = `research-gate-review-bypass-guard.md`. §3 승인 후 착수.
> 일자 2026-06-25 / 대상 v0.76.0 / 우선순위: 품질 1 / 재작업 최소 2 / §8.1 과적합 회피 강제.

---

## 1. 문제 (코드 검증됨)

go/stop/revisit **검토 UX**(텍스트 프롬프트 + discovery/spec/plan 게이트의 plan-review-server **브라우저 검토 자동 spawn**)는 `skills/_base-invoke-go-stop-gate/SKILL.md` 에만 있고, 각 stage sub-agent(discovery/spec/plan/test/implement-agent)의 **마지막 단계**에서만 호출된다(convention). 반면 실제 stage 전진은 결정론 CLI `chain-driver next --user-decision go` 가 수행하는데, 이 CLI는 **검토 UX가 떴는지 전혀 확인하지 않는다**.

- 게이트가 안 막히면(critical/high finding 0) `go` 면 조용히 exit 0 전진 (`cli.js:617-618`).
- `--user-decision go` 가 만능 escape hatch — `findings_unverified`(fail-closed, C-13)조차 `go`로 ack되어 통과 (`gate-eval.js:284`, soft reason은 HARD_BLOCK_CODES 아니므로 `go-with-warnings`).
- intervention-log는 `actor: args.userDecision ? 'user' : 'driver'` (`cli.js:721`) → **사람이 검토 안 했어도 `go`만 있으면 `actor:'user'` 로 거짓 기록**.

**근본 원인**: 나쁜 게이트 차단(state.blocked / exit 2 trio)은 기계적으로 강제되지만, **"검토 프롬프트를 띄우는 행위" 자체는 강제되지 않고 convention(오케스트레이터가 sub-agent를 성실히 dispatch)에만 의존**. CLI는 프롬프트가 떴는지 모른다. v0.76.0 dogfood에서 메인이 sub-agent dispatch 생략 + CLI 직접 호출 → 프롬프트·브라우저 통째 누락, 자동 통과.

## 2. 두 레이어 분리 (조사 결과)

| 레이어 | 파일 | 프롬프트 | 브라우저 |
| --- | --- | --- | --- |
| 결정론 전이 | `chain-driver next` (`cli.js`, `gate-eval.js`) | ❌ 코드에 없음 | ❌ |
| 검토 UX | `_base-invoke-go-stop-gate` SKILL | ✅ | ✅ plan-review-server `<phase>-revisions.json` (server.js:285-287) |

기존 기계 가드 = PreToolUse trio (iii)는 `hooks.json` matcher가 `Write|Edit|NotebookEdit|mcp__...` 뿐 — **`Bash` 없음** → `chain-driver next` Bash 호출은 어떤 훅도 가로채지 못함(가드 삽입 지점). hooks-bridge 패턴 = `shouldBlockToolUse`/`coldStartSkipAheadReason`/`branchGuardReason` deny-reason 순수함수 + cli.js가 `buildBlockOutput`으로 차단.

## 3. research 핵심 (→ research 파일)

- 위조 불가 신호 = plan-review-server `apply` 토큰뿐(서버 기록 / discovery·spec·plan 한정). LLM-writable state 마커 = speedbump.
- **provenance 정직화(3-값 actor)가 최소·최고 ROI·회귀 0·결정론** (Senior 0.82 / 업계 GitHub·AWS 서버발급 패턴 / no-simulation 정합).
- PreToolUse Bash deny는 기술 가능 + **subagent에도 적용**(공식문서 VERIFIED) but text 게이트선 speedbump → 정직 라벨링 + §8.1상 ≥2 PoC 전 deny 격상은 과적합.

## 4. 설계 — Phase 분리 (Senior 최소 견고 버전 채택)

### Phase 1 — provenance 정직화 + advisory (지금 / 회귀 0 / deny ❌)
**차단하지 않는다. "누가/어떻게 결정했나"의 거짓 기록을 멈추고 우회를 loud·auditable하게 만든다.**

1. **3-값 actor 도출** (`cli.js` next, ~721) — intervention-log `actor` 를 결정론 도출:
   - `user` = 검토 경유 마커(아래 #3 advisory 토큰) fresh 존재 → 사람 검토.
   - `user_auto` = 명시 `--auto-mode` 플래그(아래 #2).
   - `llm_assumed` = `go`인데 마커·플래그 둘 다 없음 (= 현 v0.76.0 상황 / **정직 라벨**).
   - state.schema `decision`/GateRecord + `intervention-log.schema.json` `actor` enum 확장.
2. **`--auto-mode` provenance 플래그** — `chain-driver next --user-decision go --auto-mode`. 사용자 명시 위임 1회 경로(`/chain-next --auto` 또는 state 1회 set)로만 set. 없으면 LLM 가정 = `llm_assumed`.
3. **plan-review-server advisory 토큰** (discovery/spec/plan) — 서버가 `apply` 시 `<phase>-revisions.json` 에 기록(이미 존재). **무수정 clean-go도 "presented+approved" 레코드를 남기도록 서버 소폭 확장** 필요(구현 시 확인). `chain-driver next` 가 이 fresh 레코드를 read → actor=`user` 도출 + 부재 시 stderr 1줄 **비차단** nudge("검토 UX 미경유 추정 — `_base-invoke-go-stop-gate`/브라우저 검토 후 진행 권장").

### Phase 2 — graded mechanical deny (≥2 PoC corroboration 후 / body 격상)
**§8.1 — v0.76.0 1회 관측으로 격상 ❌. ≥2 PoC(poc-* dogfood 2건)에서 Phase 1 advisory가 우회를 실제 포착함을 관측한 뒤.**

4. **PreToolUse `Bash` matcher 추가** (`hooks.json`) + `hooks-bridge.js` 신규 `gateReviewBypassReason({command, state})` 순수함수:
   - command가 `chain-driver ... next ... --user-decision go`(revisit/stop/`--auto-mode` 제외)이고
   - **discovery/spec/plan** 게이트인데 plan-review-server fresh apply 토큰 부재 → `buildBlockOutput` deny(exit 2 재사용 / 신규 code ❌).
   - **test/implement** = 서버 토큰 불가 → **deny ❌, advisory 유지**(정직 라벨 / speedbump를 벽으로 사칭 금지).
   - `agent_id` 무한루프 가드 + `if`-filter 의존 ❌(command 문자열은 훅 스크립트 내부 검사).

## 5. 결정 묶음 (§3 승인 — 5~6 cluster)

1. **Phase 분리 채택?** Phase 1(정직화, 지금) / Phase 2(graded deny, ≥2 PoC 후) vs 한 번에 deny까지. (권고: 분리)
2. **3-값 actor** (`user`/`user_auto`/`llm_assumed`) + state·intervention-log schema enum 확장 — 채택?
3. **`--auto-mode` provenance 플래그** + 사용자 1회 위임 경로 도입 — 채택?
4. **plan-review-server clean-go 레코드 확장** + `chain-driver next` advisory stderr nudge — 채택? (서버 소폭 수정 포함)
5. **Phase 2 게이트별 강도 차등 확정** — discovery/spec/plan만 hard deny(서버 토큰) / test/implement는 advisory 영구 유지 — 확정?
6. **(가장 마지막) 전체 진행** — Phase 1 구현 착수 승인? (Phase 2는 별도 ≥2 PoC 관측 후 재게이트)

## 6. 회귀 / 리스크 + 완화

- **false-block 폭발**(Senior 경고) — Phase 1은 deny 0이라 회귀 0. Phase 2 deny는 discovery/spec/plan 한정 + 서버 토큰 fresh 매칭으로 scope/revisit/Auto Mode 오차단 회피. examples/poc-* 비대화형 dogfood는 `--auto-mode`로 `user_auto` 분류(deny 비대상).
- **D21' 충돌** — 없음(직접 CLI 호출 차단 = D21' 보강).
- **schema migration** — actor/decision enum 확장은 forward-only additive(ADR-CHAIN-005 §6). 구 로그 backward-compat.
- **§8.1** — Phase 2 body 격상을 ≥2 PoC corroboration에 명시 종속.

## 7. 검증 계획

- chain-driver unit test: actor 3-값 도출 / `--auto-mode` / advisory nudge (Phase 1). `gateReviewBypassReason` 음성+양성 / subagent `agent_id` (Phase 2).
- schema 회귀: state.schema + intervention-log.schema validator.
- release-readiness: 신규 check 추가 시 criteria_total/expected-ids/pass-count 동시 갱신 + full `test:release`(targeted 미검출).
- DEC 등재: `DEC-2026-06-25-gate-review-bypass-guard` (Phase 1 채택 / Phase 2 ≥2 PoC 종속 명시).

## 8. Lessons Learned

- **Phase 1 완료 (v0.77.0 / 2026-06-25 / revert 없음)** — gate-provenance.js(3-값 actor) + --auto-mode + plan-review-server presented 마커 + advisory nudge. 신규 16 test + chain-driver 707/707 + E2E 3분기 실측 + release-readiness 43/43 + test:release 28/28. 워킹트리 구현(브랜치/티켓 없음 / 커밋 대기).
- **process 메모**: 버전 범프 시 README front-door 2곳(title + `현재 v` 라인) + 본문 거버넌스 마커는 `## 인용` footer 로 — release-readiness `readme_version_sync`·`shipped_provenance_leak` 가 기계적으로 잡음(2건 catch→수정). 다음 버전 범프 시 선반영.
- **Phase 2 carry (미착수)**: PreToolUse `Bash` matcher deny 가드 = ≥2 PoC corroboration(Phase 1 advisory 가 실제 우회 포착 관측) 후 별도 DEC. discovery/spec/plan 만 hard(서버 토큰) / test·implement advisory 영구.

## 인용
- ADR-CHAIN-002 / ADR-CHAIN-005 §3·§4·§7 / DEC-2026-06-19-plan-review-server
- memory: feedback_chain_driver_deterministic_axis, feedback_no_static_tool_simulation, feedback_quality_priority(§8.1), feedback_release_readiness_count_coupling
- research: `.claude/plans/research-gate-review-bypass-guard.md`
