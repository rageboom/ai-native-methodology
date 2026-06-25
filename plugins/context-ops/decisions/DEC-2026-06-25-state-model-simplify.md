# DEC-2026-06-25-state-model-simplify

**chain 상태 모델 단순화 — scope_states 제거 + analysis 프로젝트-레벨 분리 + manifest 진행위치 SSOT (state schema 2.0 / MIS-427)**

**상태**: 승인·시행 (state.schema `CURRENT_STATE_VERSION` 1.0 → 2.0 / breaking)

## 맥락

`state.json` 의 `scope_states[scope]`(scope별 chain 진행 맵)는 두 기능을 한다 — (1) 동시 멀티플렉싱, (2) 진행위치 보존. 팀 워크플로(develop→피처브랜치 / 동시작업=워크트리)에서 (1)은 git 브랜치·워크트리(워크트리별 별도 `state.json`)가, (2)는 git-tracked manifest(`.ai-context/scopes/<scope>/<stage>/manifest.json`)가 이미 커버 → `scope_states` 는 **중복**.

실측 필드 대조: manifest 가 `current_stage` + `status` 를 git-tracked 로 보유 = **진행위치 SSOT**. `scope_states` 는 그 휘발성 미러. manifest 부재 3종(`gate_decision`/`git_baseline_sha`/`blocked`)은 "현재 작업" 런타임이라 scope별 영구 보존 불필요(`blocked` 는 이미 전역 필드).

사용자 운영모델: **analysis = 프로젝트 1회**(코드베이스 레벨 gate #0) / **chain 작업(PRD·코드) = discovery부터**. → analysis 가 `current_chain` 커서에 섞여 있던 것을 시작점에서 분리.

## §2 research (Senior REVISE + 산업선례)

Senior 적대검토가 plan 실측 오류 3건 포착:
1. **`git_baseline_sha` = dead field** (write 0 / 항상 `HEAD~1`) → schema 2.0 제거 + finding.
2. 마이그레이션 "손실 0" 거짓 — `current_task` 가 `scope_states` 내부 → 비활성 scope task 포인터 손실 불가피(정직 명문화).
3. 역방향 stage 매퍼(`impl→implement`) 부재 — manifest 완전유도(S2) 생략으로 현 미배선 carry.

산업선례(1차 출처 fetch): Git(objects=SSOT / refs=커서), Terraform(tfstate=SSOT / in-memory=휘발 / lock), LSP(디스크=master / version=null). 공통 = "영속 SSOT + 휘발성 커서" 업계 표준 → 청신호.

analysis 분리 = 완전 제거 ❌ (flow revisit edge `discovery→analysis`·`implement→analysis` + gate #0 의존 / revisit 의미론 변경 위험) → **"시작점만 discovery"로 축소**(S0).

## 결정

1. **`scope_states` 제거** — chain 상태 = 전역 단일(`current_chain`/`stage_progress`/`last_gate`) + `current_scope` 커서. 동시 격리 = git 워크트리/피처브랜치.
2. **`current_task` 전역화** — `scope_states` 내부 → top-level. `setCurrentTask`/`clearCurrentTask` 전역.
3. **analysis 시작점 분리** — 새 scope 진입(`initScopeChainState`, inheritGlobal=false) = `current_chain` discovery 리셋(analysis=complete 전제). 전역 init(scope 없이) = analysis(프로젝트 1회). enum/STAGES/flow revisit edge·gate #0 **유지**.
4. **manifest = 진행위치 SSOT**(git-tracked) / `state.json` = 휘발성 런타임 커서(gitignore).
5. **schema 2.0** — `scope_states` + `ScopeChainState` + `git_baseline_sha` 제거. `CURRENT_STATE_VERSION` 1.0→2.0. migration `1.0->2.0` 등록(활성 scope 전역 흡수 + `git_baseline_sha` drop / 비활성 scope `current_task` 손실=정직).
6. **D2 폐기** — `current_chain` 완전 유도 가능(analysis 분리로 갭 소멸). manifest 유도 + C1 reconcile(S2)은 워크트리 워크플로상 불필요로 **생략**(§8.1 과적합 회피) — 순차 브랜치 전환 견고성 필요 시 후속.

## 검증 (§8.1 corroboration)

- state-store 단위 16/16 (migration round-trip: 다중scope 흡수 + `git_baseline_sha` drop + `current_task` 전역).
- chain-driver 전체 **703/703**(v0.77.0 위 rebase 실측 / 멀티플렉싱 테스트 재작성 -5 + state-store +1) + statusline **12/12**. 회귀 0 (gate/sync/navigate/impact/lift/revisit/gate-provenance 무영향).
- init round-trip 실측: init=analysis(프로젝트 1회) / init --scope=discovery(새 scope) / `scope_states` 부재.
- §8.1: state 모델은 chain-driver 구조(PoC 환경 무관 / legacy poc-17 + modern poc-18 공유). `state.json` gitignore 라 PoC 실 state 부재 → 2 대표 형태(다중scope / 단일) round-trip 단위로 corroboration. 실 PoC dir round-trip = release 직전 carry.

## carry

- **GateRecord 고아 def** — top-level `last_gate` inline 과 중복 / 미참조라 ajv 무해. `last_gate` $ref 통합 시 정리.
- **역방향 stage 매퍼 미배선** — manifest 완전유도(S2) 도입 시.
- **`git_baseline_sha` 미배선 finding** — revisit baseline 은 항상 `HEAD~1` (DEC 시점 dead).
- plugin.json version bump + CHANGELOG MAJOR = release 직전.

## 관련

MIS-427 / `.claude/plans/plan-scope-state-simplify.md` + `research-scope-state-simplify.md` / `state.schema.json` · `state-store.js` · `cli.js` · `chain-statusline.js` · `multi-scope-chain.test.js`
