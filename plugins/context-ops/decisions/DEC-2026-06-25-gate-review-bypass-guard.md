# DEC-2026-06-25-gate-review-bypass-guard

**gate 검토 UX 우회 — actor provenance 정직화 (Phase 1) (v0.77.0 MINOR / additive·advisory)**

상태: 채택 (Accepted) · 일자: 2026-06-25 · 결정자: 윤주스 (TF Lead)

## 문제 (v0.76.0 dogfood 발견 / 코드 검증)

go/stop/revisit **검토 UX**(텍스트 프롬프트 + discovery/spec/plan 게이트의 `plan-review-server` 브라우저 검토 자동 spawn)는 `_base-invoke-go-stop-gate` 스킬에만 있고 각 stage sub-agent 의 **마지막 단계**에서만 호출된다(convention). 반면 실제 stage 전진은 결정론 CLI `chain-driver next --user-decision go` 가 수행하는데, 이 CLI 는 **검토 UX 경유 여부를 전혀 확인하지 않는다**.

- 게이트가 안 막히면(critical/high 0) `go` 면 조용히 exit 0 전진. `--user-decision go` 가 만능 escape hatch — `findings_unverified`(C-13 fail-closed)조차 `go`로 ack 통과(`gate-eval.js:284`).
- intervention-log 가 `actor: args.userDecision ? 'user' : 'driver'`(구 cli.js) → **사람이 안 봤어도 `go`만 있으면 `actor:'user'` 로 거짓 기록**.
- 오케스트레이터가 sub-agent dispatch 를 건너뛰고 CLI 를 직접 호출하면 프롬프트·브라우저 통째 누락 + 자동 통과. v0.76.0 실발생.

**근본 원인**: 나쁜 게이트 차단(state.blocked / exit 2 trio)은 기계 강제되나, **"검토 프롬프트를 띄우는 행위" 자체는 convention 의존** — CLI 는 프롬프트가 떴는지 모른다.

## 연구 (4원칙 §2 / 3-agent 수렴)

`.claude/plans/{plan,research}-gate-review-bypass-guard.md`. 핵심:
- 위조 불가 신호는 **plan-review-server `apply`/spawn 토큰뿐**(서버 프로세스 기록 / discovery·spec·plan). LLM-writable state 마커 = speedbump(업계: AWS CodePipeline·GitHub 서버발급 vs Terraform plan·ArgoCD annotation 파일마커 신뢰도 서열).
- **provenance 정직화(3-값 actor)가 최소·최고 ROI·회귀 0·결정론** (Senior 0.82). 차단이 아니라 거짓 기록 중단 + 우회 auditable 화.
- PreToolUse Bash deny 는 기술 가능 + subagent 적용(공식문서 VERIFIED)이나 **§8.1상 v0.76.0 1회 관측으로 hard deny 격상은 과적합** → Phase 분리.

## 결정 (옵션 1 / Phase 1 = 정직화 + advisory / 차단 ❌)

1. **3-값 actor 결정론 도출** (`tools/chain-driver/src/gate-provenance.js` 신규 순수모듈 / cli.js import):
   - `driver`=`--user-decision` 없음 / `user`=stop·revisit(명시 안전) 또는 go + 검토 경유 마커 fresh / `user_auto`=go + `--auto-mode`(Auto Mode 명시 위임) / `llm_assumed`=go 인데 마커·플래그 둘 다 없음(우회 추정).
   - `intervention-log.schema.json` `actor` enum += `user_auto`·`llm_assumed`.
2. **`--auto-mode` provenance 플래그** (`chain-driver next`) + `/chain-next` 의 `auto` 인자 경로.
3. **gate-review-passage 마커** — `plan-review-server` 가 spawn 시 `.ai-context/runtime/gate-review-passage.json`(`{stage, presented_at, via}`) 기록 = "브라우저 검토가 실제로 떴다"의 증거. `chain-driver next` 가 read → actor 도출 + 부재 시 **stderr 1줄 비차단 advisory nudge**. 경로 SSOT = `_shared/ai-context-layout.js gateReviewPassagePath/ForRead`.

**trust 불변**: 결정론 axis (LLM 판단 0). 마커는 LLM-writable = speedbump(벽 ❌) — 정직 인정. test/implement 텍스트 게이트는 서버 토큰 불가 = advisory 한계.

## Scope-out (명시 금지 / Phase 2 carry)

- **PreToolUse Bash matcher deny 가드** = Phase 2. **≥2 PoC corroboration**(Phase 1 advisory 가 실제 우회 포착 관측) 후 별도 DEC. discovery/spec/plan 만 hard deny(서버 토큰) / test·implement 는 advisory 영구 유지 (speedbump 를 "벽"으로 사칭 ❌ / no-simulation 정신).
- 신규 exit code ❌ (exit 2 재사용). `sync-next` `sync_next_gate` 핸들러 actor 는 별개 흐름 = 무변경.

## 검증

- 신규 `gate-provenance.test.js` 16 test GREEN + chain-driver 707/707 무회귀.
- E2E 실측(no-simulation): `next go`(마커·플래그 없음)→ exit 0 + stderr nudge + actor=`llm_assumed` / `--auto-mode`→ actor=`user_auto`·nudge 0 / plan-review-server 실 spawn → 마커 기록 + chain-driver read → actor=`user`·nudge 0.
- §8.1 면제(additive·advisory / 신규 release 강제 check·gate matrix·deny 무 / criteria 무변).

## Relates
- ADR-CHAIN-002(go/stop gate UX) · ADR-CHAIN-005 §3 trio·§4 D21'·§7 exit matrix
- DEC-2026-06-19-plan-review-server(인터랙티브 검토 / reference-lens)
- feedback_chain_driver_deterministic_axis · feedback_no_static_tool_simulation · feedback_quality_priority(§8.1) · feedback_diagnose_before_design_check_existing
