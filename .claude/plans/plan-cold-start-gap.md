# plan — cold-start 갭 메우기 (state.json 부재 시 enforcement 공백)

> 4원칙 1원칙 산출물. 상태: **draft — 사용자 승인 대기**.
> 대상: `plugins/context-ops` / chain-driver hooks-bridge + SessionStart/PreToolUse.
> 다음 릴리스 = v0.82.0 (MINOR / 현재 main v0.81.0).

---

## 1. 문제 정의 (전수 조사 결과)

"플러그인만 깔고 analysis/init 안 한 상태에서 작업 프롬프트를 넣으면?" 추적 결론:

`state.json`은 **오직 `chain-driver init` 수동 실행으로만** 생성된다 (getting-started.md L131 — 어떤 hook/skill/command도 자동 init ❌). 그 전까지:

| 이벤트 | 현재 동작 (state.json 부재) | 위치 |
| --- | --- | --- |
| SessionStart | `.ai-context/state.json` 없으면 (+HANDOFF 없으면) `{suppressOutput,continue}` → **완전 침묵**. 방법론 활성/미초기화 신호 0. | `cli.js:1723` |
| UserPromptSubmit | `routeEntry(prompt)` — prompt 텍스트만. work-intent 키워드면 discovery advisory(additionalContext+stderr). **비차단 권고**. state 무관 작동. | `cli.js:1800` / `hooks-bridge.js:210` |
| PreToolUse | `readState`→`null` → `if (state){…}` 블록 **통째 skip**. `shouldBlockToolUse`/`coldStartSkipAheadReason`/branchGuard/base-deny **전부 미작동**. | `cli.js:1855` |

### 갭의 본질 = "enforcement가 선행 상태(state.json)에 전적으로 의존"
모든 결정론 deny가 `if (state)` 뒤에 있어, init 전에는 결정론 차단 0. [[project_gate_review_bypass_guard]]와 동일 패턴 — "게이트가 특정 선행 상태에 의존하면 그 상태 없을 때 조용히 전부 비활성".

### 핵심 제약 — over-block 함정
플러그인은 user-level 설치 가능 → **방법론과 무관한 임의 레포에서도 hook이 돈다**. 그래서 "state 없으면 무조건 차단"은 절대 불가(모든 레포 파괴). opt-in 신호로 게이팅 필수.

**opt-in 신호 = `.ai-context/` 디렉토리 존재** (확정: `analysis-input-collection`이 `.ai-context/input.json` 생성 — 방법론을 한 번이라도 쓰면 존재 / 안 쓰면 부재).

### 신호 계층 (3-state)
1. `.ai-context/` 없음 → 방법론 미사용 레포. **아무것도 안 막음**(현 동작 보존). = over-block 경계선.
2. `.ai-context/` 있음 + `state.json` 없음 → **cold-start 본 갭**. analysis 산출물은 있을 수 있으나 chain 미초기화 → enforcement 공백.
3. `state.json` 있음 → 현 동작(enforcement 활성).

---

## 2. 설계 — "cold-start pseudo-state" 단일 리졸버 (4-mode / Senior 반영)

중심 아이디어: 결정론 리졸버 하나를 신설해 PreToolUse/SessionStart가 공유. **existsSync(state.json)를 먼저** 봐서 "파일 부재(null)"와 "파일 손상(throw)"을 분리 — 이게 Senior가 잡은 핵심(아래 §2.0).

```
resolveEnforcementContext(root):
  if exists(state.json):
    try   state = readState(root); return { mode:'live',    state }          // case 3
    catch StateCorruptError:       return { mode:'corrupt' }                 // case 3' (신규)
  if exists(.ai-context/):         return { mode:'cold-start', pseudoChain } // case 2
  else:                            return { mode:'absent' }                  // case 1
```

- `pseudoChain` = read-only 합성 `{ stage_progress: { analysis:{status:'in_progress'}, discovery:{status:'pending'}, … } }` (DEFAULT_STAGE_PROGRESS 재사용). **파일 mutation 0** — 순수 합성.
- STRONG-STOP 보존: 입력은 파일 존재 + 파일명뿐, LLM 판단 inject ❌ ([[feedback_chain_driver_deterministic_axis]]).

### §2.0 — case 3' corrupt = fail-closed (Senior STRONG-STOP #1 / 잠복버그 동시 해소)
`readState`는 parse 실패/version 누락 시 `StateCorruptError` throw(state-store.js:102,105). 현재 PreToolUse는 `catch { state = null }`(cli.js:1858)로 **손상도 null로 뭉갠다** → 손상된 live 프로젝트가 enforcement 전부 off(이미 현 버그). 새 리졸버가 null→cold-start로 라우팅하면 "약한 enforcement로 강등"이 더 또렷해짐.
- **corrupt는 cold-start보다 엄격**: PreToolUse는 `.ai-context/` write 전면 deny(state.blocked 유사 / "state.json 손상 — `chain-driver state`로 확인 후 복구"). SessionStart는 강한 surface.
- 효과: 신규 기능 + 기존 잠복버그(손상 silent off) 동시 정정.

### D1 — PreToolUse cold-start enforcement parity (코어)
`coldStartSkipAheadReason`를 `mode∈{live,cold-start}`에서 실행. 즉 **init 안 해도** later-stage chain 산출물(behavior-spec/acceptance-criteria/task-plan/test-spec/impl-spec) 직접 write = orphan → deny. discovery-spec(UC)·source 코드·기타 = 허용(현 정책과 동일 scope).

- `shouldBlockToolUse`(state.blocked 필요) / branchGuard(current_task 필요) / base-deny = **live 전용 유지** — cold-start엔 그 데이터가 없음. cold-start에선 `coldStartSkipAheadReason`만 적용.
- 효과: 갭 #2(enforcement hole)를 "막아야 할 것(orphan 산출물)만" 정확히 메움. source 편집은 안 막음 = init된 상태에서도 안 막으므로 **parity**(신규 차단 행위 도입 ❌, 단지 init 유무로 갈리던 비대칭 제거).

### D2 — SessionStart 정직 표면화
case 2에서 침묵 대신 additionalContext:
> `[ai-native-methodology] 방법론 설치됨·미초기화 — chain enforcement 비활성(orphan 산출물 차단만 작동). 정식 진행: analysis 완료 → chain-driver init → discovery. (현재 stage 추적/게이트 없음)`

- display-only / reference-lens / 어떤 gate에도 inject ❌. [[reference_sessionstart_hook_channels]] (additionalContext = 모델 표출 권장 채널).
- case 1(.ai-context 없음)·case 3(state 있음) = 현 동작 유지.

### D3 — 부트스트랩 마찰 감소 (init 진입)
수동 `chain-driver init` 의존 완화.
- **D3a (권장 / 저위험)**: D2 surface + UserPromptSubmit advisory가 "discovery 진입 전 `chain-driver init` 먼저"를 명시. init은 명시 결정론 커맨드로 유지. discovery 진입 skill 문서에 "state 없으면 init" step 0 추가.
- **D3b (옵션 / 후속)**: discovery 진입 시 자동 init. LLM-layer(skill 지시). 단 analysis 이미 완료된 경우 manifest reconcile로 stage_progress 복원 필요(분석 in_progress 오기록 회귀 방지) → 복잡도↑. **별도 후속 carry 권장**.

### D4 — case 1 (fresh, .ai-context 없음)
변경 없음. SessionStart 침묵 유지(비사용자 소음 회피). work-intent prompt는 기존 UserPromptSubmit advisory가 이미 커버(state 무관). = 의도된 over-block 경계.

---

## 3. 변경 파일 (예상)

| 파일 | 변경 |
| --- | --- |
| `tools/chain-driver/src/hooks-bridge.js` | `resolveEnforcementContext` 신설(또는 cli.js) + `coldStartSkipAheadReason` caller가 pseudoChain 수용 (이미 activeChain 인자 받음 — 호환). |
| `tools/chain-driver/src/cli.js` | PreToolUse: state null일 때 cold-start resolver로 `coldStartSkipAheadReason` 실행. SessionStart: case 2 surface. |
| `tools/chain-driver/test/*.test.js` | 4-state 단위 테스트(absent/cold-start/live/**corrupt** × orphan-write/source-write/discovery-spec). |
| **≥2 PoC live corroboration** (§8.1) | poc-17(ifrs/car) + ep-be-gea에서 state.json rename → orphan write 실제 deny E2E 재현. 단위 fixture 과적합 회피. |
| `skills/discovery-from-nl-md/SKILL.md` (D3a) | step 0 "state 없으면 init" 명시. |
| `guides/getting-started.md` / `common-errors.md` | cold-start 동작 문서화. |
| `CHANGELOG.md` + `plugin.json` + `package.json` | v0.82.0 3-way. |
| `decisions/INDEX.md` + `DEC-2026-06-26-cold-start-enforcement.md` | 결정 로그. |

release-readiness 영향: check 추가 시 [[feedback_release_readiness_count_coupling]] (criteria_total/expected-ids/pass-count 동시 갱신 + full test:release).

---

## 4. 결정론 axis 검증 (STRONG-STOP)
- pseudoChain 합성 = 파일 존재 + DEFAULT_STAGE_PROGRESS 상수만. LLM 0.
- deny reason 문자열 = 기존 `coldStartSkipAheadReason`와 동일 결정 경로.
- SessionStart surface = display-only, gate inject ❌.
- ✅ 결정론 도구 안 LLM 판단 inject 없음.

## 5. 미해결 질문 (research + 사용자 승인 대상)
- Q1. opt-in 신호 = `.ai-context/` 존재로 충분한가? (빈 `.ai-context/`만 있고 방법론 미사용 edge?)
- Q2. cold-start deny scope = orphan chain-artifact만으로 충분한가, 아니면 SessionStart에서 더 강한 push?
- Q3. D3 = a(권장) / b / 둘 다 / 안 함?
- Q4. case 1에도 최소 신호를 줄까? (권장: no)
- Q5. 자동 init을 SessionStart에서 할까(case 2)? (권장: no — 침묵 mutation/오기록 위험)

## 6. Lessons Learned (실패 시 기록)
- (TBD)
