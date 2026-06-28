# plan — D3b: manifest-유도 커서 재수화 (cold-start carry)

> 4원칙 1원칙. 상태: **draft — 승인 대기**. 대상: chain-driver state-store + cli + SessionStart.
> 다음 릴리스 = v0.83.0 (MINOR / 현재 main v0.82.0). 부모 carry = DEC-2026-06-26-cold-start-enforcement §carry(D3b) + DEC-2026-06-25-state-model-simplify §carry(manifest 완전유도+reconcile).

## 1. 전수조사 결과 (1원칙)

### 핵심 사실
- **`state.json` 은 gitignore**(`ensureAimdGitignore`) = "휘발성 커서". **manifest 는 git-tracked**(PoC 들에 커밋됨) = "진행위치 SSOT". → DEC-2026-06-25 모델 정합.
- **팀 워크플로 함의**: 팀원이 repo clone → manifest(진행상태)는 받지만 state.json 은 없음 → **cold-start 로 떨어지나 실제론 chain 진행 중**. 현재 `chain-driver init` 은 manifest 무시 + DEFAULT(analysis=in_progress) 생성 → **진행상태 오기록**(이게 Senior 가 D3b 미룬 이유).
- **manifest 가 진행을 정확히 반영**: `chain-driver next` 가 stage 전환 시 (cli.js:668-696) stage manifest `status`(complete/in_progress) + scope manifest `current_stage` 갱신. → **역연산으로 state 커서 완전 유도 가능**.

### 역매핑 (reconcile = `next` 의 역)
| state.json (gitignore) | ← 유도원 manifest (git-tracked) |
| --- | --- |
| `current_scope` | 활성 scope = 최근 `updated_at` scope manifest |
| `current_chain` | scope manifest `current_stage` (impl↔implement 매핑) |
| `stage_progress[stage].status` | 각 stage manifest `status` |
| `stage_progress.analysis` | scope 존재 ⟹ `complete` (initScopeChainState 규약) |
| `blocked` | false (block 은 휘발 / manifest 미보존) |

- STAGES(manifest) = [discovery,spec,plan,test,impl] / chain = [analysis,…,implement]. `stageToManifestStage` 의 역 필요(impl→implement).

## 2. 재프레이밍 (Senior 우려 해소)

D3b 원 표현 = "discovery 진입 시 자동 init". 조사 결과 더 정확한 본질 = **"휘발 커서를 SSOT(manifest)에서 재수화"**.
- **동의 우려 무력화**: 신규 init = "방법론 시작" 결정(동의 필요). reconcile = SSOT 의 derived view 재구성(결정 ❌ / lockfile 재생성·`terraform refresh`·LSP 인덱스 재빌드 동류). state.json 은 gitignore라 **외부 효과 0 + 언제든 재유도 가능**(완전 가역).
- **경계**: SSOT 가 있을 때만 유도. **scope 가 하나도 없으면**(truly-fresh / analysis-only) = 유도원 없음 = 신규 init 결정 → **자동 ❌, D3a 수동 유지**.

## 3. 설계 (research 반영 — Q2/Q4/Q5 수정)

### C1 — `rehydrateCursorFromManifests(root)` (state-store.js / 순수 / 이름충돌 회피=lift --reconcile)
- `listScopes(root)`.
  - **0개** → `{mode:'none'}`(유도원 없음 / truly-fresh — 자동 ❌).
  - **2+개** → `{mode:'ambiguous', scopes:[…]}`(**자동선택 ❌** / Senior Q2 — 작성자 머신 updated_at 으로 cloner 무관 scope 오복원 + branch-guard/skip-ahead 오작동 위험). caller 가 `--scope` 명시 요구.
  - **1개** → 그 scope 로 유도.
- 유도: DEFAULT_STATE(basename) override — `current_scope`/`current_chain`(scope manifest `current_stage`, impl→implement)/`stage_progress`(각 stage manifest status).
- **lossy 정직(Senior Q4 / STRONG-STOP)**: manifest 는 `blocked`/`block_reason`/`last_gate`/`current_task` 미보존(cli.js:668-700 = stage status + current_stage 만). → 항상 `blocked=false`·`current_task=null`·`last_gate=null` 로 두고 **결과에 `lossy:true` + `lost_fields` 플래그**. caller 가 surface 에 "직전 block·task 상태는 manifest 에 없어 복원 불가 — 필요시 재확인" 명시(BLOCKED clone 이 조용히 unblock 되는 enforcement 구멍 정직화).
- **analysis=complete = "init parity"** 로만 프레이밍(Senior Q3 / analysis 관측증거 ❌ / initScopeChainState state-store.js:335 규약 인용).
- 반환 = 유도 state 객체(in-memory). **파일 write ❌**(순수).

### C1b — manifest 무결 가드 (산업사례 / pnpm CI-mode)
- scope/stage manifest parse 실패 또는 `current_stage` 가 STAGES 밖 → `{mode:'corrupt-manifest'}` → 자동 재수화 ❌ + 에러 surface(조용한 오복원 ❌ / Terraform 구버전 실패조건 회피).

### C2 — `chain-driver rehydrate [--scope <slug>]` 커맨드 (cli.js / 명시)
- single → write. ambiguous → `--scope` 없으면 scope 목록 + exit 3. none → exit 3 안내. corrupt-manifest → exit 4.
- 명시 경로(수동 복구/CI/멀티scope 선택). 자동(C3)과 별개 1급.

### C3 — SessionStart cold-start 자동 재수화 (single-scope 한정)
현 `mode:'cold-start'` 분기에서 `rehydrateCursorFromManifests`:
- **single** → write + 투명 surface(Bazel/IntelliJ 패턴 / 1줄): `🔄 커서를 manifest 에서 재수화 (scope <x> · stage <y>). chain enforcement 활성. ⚠️ 직전 block·task 는 manifest 미보존 — 복원 안 됨.` 이후 잔여 세션 live.
- **ambiguous** → write ❌ + surface: `🔀 scope 다수(<a>,<b>) — 'chain-driver rehydrate --scope <slug>' 로 커서 지정.`(자동선택 ❌)
- **none** → 현 cold-start surface(미초기화 + 수동 init / D3a).
- **corrupt-manifest** → 에러 surface(자동 ❌).
- 결정론: manifest read + DEFAULT 합성만(LLM inject ❌). write=SSOT-유도(결정 ❌ / gitignore 외부효과 0 / 완전가역).

> **투명성**: 자동 write 지만 surface 로 "재수화 + lossy" 명시(Senior silent-mutation 우려 직접 차단). 산업: npm 로컬 자동재생성 / Bazel·IntelliJ 자동+1줄통지 = 표준. hooks 공식: SessionStart write 허용 + fast.

## 4. 변경 파일 (예상)
| 파일 | 변경 |
| --- | --- |
| `src/state-store.js` | `reconcileStateFromManifests` 신설 + manifestStage→chain 역매핑 |
| `src/cli.js` | `reconcile` 커맨드 + SessionStart cold-start 분기에 자동 재수화 |
| `test/*.test.js` | reconcile 유닛(멀티scope·impl매핑·analysis=complete·scope0=null) + SessionStart 자동재수화 E2E + reconcile 커맨드 |
| `CHANGELOG/plugin.json/package.json` | v0.83.0 3-way |
| `decisions/INDEX.md` + `DEC-2026-06-26-cold-start-autoinit.md` | 결정 로그 (또는 DEC-2026-06-25 carry resolve 표기) |

release-readiness count coupling: 신규 check 추가 안 함(reconcile 동작은 기존 test 로 / check 불요) → 43/43 유지 확인만.

## 5. 결정론 axis (STRONG-STOP)
- reconcile = manifest 필드 read + DEFAULT_STAGE_PROGRESS 합성 / LLM inject ❌.
- write = SSOT-유도(gitignore 휘발 커서 / 결정 ❌ / 완전 가역).
- gate inject ❌(state 커서는 enforcement 입력이나, 그 값은 manifest=SSOT 에서 결정론 유도).

## 6. §8.1 corroboration (Senior Q5 BLOCKED 대응)
- **사실**: `git ls-files **/scopes/**/manifest.json` = 0 — 커밋된 PoC 에 scope manifest 전무(PoC 들은 analysis-only `base/output/`). reconcile 대상이 없음.
- **방안 A(권장)**: scratchpad 에 poc-16·poc-18 복사 후 `chain-driver init --scope <s>` + `next` 로 **실 scope manifest 생성** → state.json 삭제 → rehydrate E2E 재현(single + multi + lossy). 커밋 PoC 불변(메모리 cleanup scope 정합). v0.82.0 corroboration 과 동일 패턴.
- **방안 B**: poc-16·poc-18 에 scope manifest 를 실제 커밋(chain-PoC 로 격상). 더 무겁고 PoC 성격 변경 → 비권장.
- 단위: rehydrate(single/ambiguous/none/corrupt-manifest/impl매핑/lossy-flag) + SessionStart 자동재수화 E2E + rehydrate 커맨드.

## 7. 미해결 (승인 대상)
- D1. SessionStart **자동 write**(C3 / 투명 surface+lossy 명시 / 산업·Senior 지지) 확정? (권장: 예 — single-scope 한정)
- D2. §8.1 = **방안 A**(scratchpad 실 manifest 생성 E2E) 확정? (권장: 예)
- D3. 커맨드명 = `rehydrate`(권장 / lift --reconcile 충돌회피) vs `resync-cursor`?

## 7. Lessons Learned (실패 시)
- (TBD)
