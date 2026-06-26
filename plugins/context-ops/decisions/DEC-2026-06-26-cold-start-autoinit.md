# DEC-2026-06-26-cold-start-autoinit

**cold-start 커서 재수화 — manifest(SSOT) → state.json 자동 복구 (v0.83.0 MINOR / D3b / 결정론 유도)**

**상태**: 승인·시행 (plugin.json 0.82.0 → 0.83.0). **resolves** DEC-2026-06-26-cold-start-enforcement §carry(D3b) + DEC-2026-06-25-state-model-simplify §carry(manifest 완전유도+reconcile).

## 맥락 (carry)

"남은 캐리 진행" — v0.82.0(cold-start 갭) 이 미룬 D3b(자동 init + manifest reconcile). v0.82.0 에서 Senior 가 "자동 init = 동의 없는 mutation = gate-bypass 안티패턴 동형"이라며 미룬 부분.

## 진단 (전수조사)

- **`state.json` 은 gitignore**(`ensureAimdGitignore`) = 휘발 커서. **scope·stage manifest 는 git-tracked**(PoC 커밋) = 진행 SSOT. → DEC-2026-06-25 모델("state=휘발 커서 / manifest=SSOT / 완전유도") 정합.
- **팀 워크플로 함의**: clone 시 manifest 는 받으나 state.json 부재 → **cold-start 로 떨어지나 실제론 chain 진행 중**. 기존 `init` 은 manifest 무시 DEFAULT(analysis=in_progress) → 진행상태 오기록.
- `chain-driver next` 가 stage 전환 시 stage manifest status(complete/in_progress) + scope manifest current_stage 갱신(cli.js next) → **역연산으로 커서 완전 유도 가능**.

## 재프레이밍 (Senior v0.82.0 우려 해소)

D3b 를 "자동 init(신규 결정)"이 아니라 **"휘발 커서를 SSOT manifest 에서 재수화(rehydrate)"** 로 재정의:
- state.json 은 gitignore라 **외부효과 0 + 완전 가역** = lockfile 재생성·`terraform refresh -refresh-only`·LSP 인덱스 재빌드 동류. **결정이 아니라 유도** → 동의 우려 무력화.
- **경계**: SSOT 가 있을 때만 유도. scope 0(truly-fresh)= 유도원 없음 = "방법론 시작" 결정 → **자동 ❌, 수동 init 유지(D3a)**.

## 4원칙 §2 (research)

- **Senior**: 재프레이밍 GO + load-bearing 2 — ① **lossy(STRONG-STOP)**: manifest 미보존 필드(blocked/last_gate/current_task)는 복원 불가 → blocked=false + 정직 surface 의무(BLOCKED clone 의 조용한 unblock = enforcement 구멍). ② **멀티 scope 자동선택 ❌**(작성자 머신 updated_at 으로 cloner 무관 scope 오복원 + branch-guard/skip-ahead 오작동) → single-scope 만 자동. ③ analysis=complete = "init parity"(관측 증거 ❌ / initScopeChainState 규약). ④ §8.1: 커밋 PoC 에 scope manifest 0 → scratchpad 실 manifest 생성. ⑤ 네이밍 `reconcile`↔`lift --reconcile` 충돌 → `rehydrate`.
- **산업사례**: npm/pnpm lockfile(로컬 자동재생성/CI frozen) · Bazel/Gradle cache miss 자동재계산+1줄요약 · IntelliJ 인덱스 자동재빌드+balloon = SSOT→파생 자동재생성 표준. Terraform 구버전 실패는 "외부현실 divergence + 검토생략" — 우리 커서=순수유도(현실무관)라 해당 ❌. 단 manifest 손상 시 자동 ❌ 에러(pnpm CI-mode 가드).

## 결정

- **`rehydrateCursorFromManifests(root, {scope?})`** (state-store / 순수): none / ambiguous / not-found / corrupt-manifest / single. single 유도 = `current_scope`/`current_chain`(impl→implement)/`stage_progress`(analysis=complete + 각 stage manifest status) + `lossy:true`/`lost_fields`.
- **`writeRehydratedState(root, state)`** — atomicWrite(CAS 무관 / state.json 부재 전제).
- **`chain-driver rehydrate <project> [--scope <slug>]`** — 명시 복구/CI/멀티scope 선택(none/ambiguous/not-found→exit 3 / corrupt→exit 4 / single→write+lossy 고지).
- **SessionStart cold-start 자동 재수화**: single → write + 투명 surface(재수화 + lossy 고지) → 이후 live / ambiguous → `--scope` 안내(자동 ❌) / corrupt-manifest → 에러 surface(자동 ❌) / none → 미초기화 surface(D3a).
- **결정론 axis(STRONG-STOP)**: manifest read + DEFAULT 합성 / LLM inject ❌ / write=SSOT-유도(gitignore / 완전 가역).

## 시행

- `src/state-store.js`: `rehydrateCursorFromManifests` + `writeRehydratedState` + `manifestStageToChain` 역매핑.
- `src/cli.js`: `cmdRehydrate` + `rehydrate` dispatch/usage + SessionStart cold-start 분기 자동 재수화 + import 2.

## 검증 (STOP)

- 신규 `cold-start-rehydrate.test.js` 13 (rehydrate 4-mode + impl매핑 + lossy + SessionStart 자동재수화 single/multi/none + rehydrate 커맨드) GREEN.
- chain-driver **747/747** 회귀 0.
- **≥2 PoC live corroboration (§8.1)**: poc-16(Legacy Spring 4.1) + poc-18(Modern Express/Prisma/TS) — 실 `init --scope auth` 로 scope manifest 생성 → spec 진행 시뮬 → state.json 삭제(cold-start) → SessionStart 자동재수화 → `mode=live · current_chain=spec · current_scope=auth`(manifest SSOT 일치) 양 paradigm 재현.
- release-readiness / version 3-way 0.83.0.

## carry (§8.1)

- corrupt state.json → `rehydrate` 로 manifest 덮어쓰기 복구(현재 corrupt mode 는 fail-closed surface만 / rehydrate 는 cold-start 전제) — corrupt 에서도 rehydrate 제안 = 후속.
- `next` 가 manifest 에 last_gate/blocked 까지 동기화하면 lossy 축소 가능 = 별도 검토(현재는 정직 lossy).

## Relates

DEC-2026-06-26-cold-start-enforcement(부모 / D3b carry) + DEC-2026-06-25-state-model-simplify(state=휘발 커서/manifest=SSOT 모델 / 완전유도 carry) + project_gate_review_bypass_guard(동의 없는 mutation 경계) + feedback_chain_driver_deterministic_axis(STRONG-STOP) + feedback_quality_priority(§8.1).
