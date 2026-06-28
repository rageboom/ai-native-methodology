# plan — scope_states 제거 / chain 상태 단순화

> 토픽: state.json 의 `scope_states` 멀티플렉싱을 제거하고, chain 진행 위치를 git-tracked manifest 에서 유도 + 런타임 상태를 전역 단일로 단순화.
> 상태: **구현 완료 v3 (S1~S6 본체 / 전체 GREEN / 커밋·release 전)** / 워크트리 MIS-427 / 2026-06-25
> 검증: state-store 16/16 + chain-driver 687/687 + statusline 12/12 + init round-trip(analysis/discovery) / 회귀 0. DEC-2026-06-25-state-model-simplify + INDEX 등록.
> §2 research: `research-scope-state-simplify.md` — Senior REVISE(실측 오류 3건) + 산업선례(Git/Terraform/LSP 청신호).
> **v3 전환 (사용자 운영모델)**: analysis = **프로젝트 1회**(코드베이스 레벨 gate #0) / chain 작업(PRD·코드) = **discovery부터**. → analysis 를 chain 커서에서 **분리** → chain 커서(discovery~implement) **완전 manifest 유도 가능** → **D2(캐시) 폐기**, analysis 갭 소멸.

---

## 1. 배경 — 왜 이 논의가 시작됐나

대화에서 도출된 사용자 의문:

> "state.json 이 scope 마다 chain 상태를 다 들고 있는데, 이렇게 할 필요가 있나?"

전제가 된 팀 워크플로 (사용자 확인):
- 팀은 **하나의 develop 브랜치에서 각자 피처 브랜치**를 따서 작업.
- 개인이 한 브랜치에서 **여러 작업을 동시에** 하면 **워크트리**로 분리.

이 워크플로에서 `scope_states` 의 두 기능이 각각 다른 메커니즘으로 이미 커버됨:
- **동시 멀티플렉싱** → 피처 브랜치 + 워크트리가 처리 (워크트리당 별도 `.ai-context/state.json`).
- **진행 위치 보존** → 산출물 + manifest(git-tracked)가 처리.

## 2. 실측 결과 (§1 깊은 숙지)

### 2-1. 필드 대조 — manifest vs state.json `scope_states`

| `scope_states` 보존 필드 | manifest 존재 | 재유도 | 성격 |
| --- | --- | --- | --- |
| `current_chain` | ✅ scope manifest `current_stage` (`cli.js:707-712`) | **가능** | 진행 커서 |
| `stage_progress[s].status` | ✅ stage manifest `status` (`cli.js:693`) | **가능** | 진행 위치 |
| `stage_progress[s].gate_decision` (go/stop) | ❌ | 불가 | 런타임 판정 |
| `stage_progress[s].git_baseline_sha` | ❌ | 불가 | revisit baseline |
| `last_gate` (id+decision) | ❌ | 불가 | 런타임 판정 |
| `blocked / block_reason / block_scope` | ❌ (이미 **state 전역 필드** `cli.js:597`) | 불가 | 안전 게이트 |

### 2-2. 두 결론
1. **진행 위치는 순수 중복.** "어느 scope 의 어느 stage" 는 manifest 가 이미 git-tracked SSOT 로 보유. `scope_states.current_chain` + `status` 는 휘발성 미러.
2. **manifest 부재 3종(gate/baseline/blocked)은 전부 "현재 진행 작업"의 런타임 상태.** 과거 완료 scope 에 영구 보존할 구조적 이유 없음. `blocked` 는 애초에 전역 필드.

### 2-3. 결정적 구조 — read 단일 게이트웨이
- `getActiveScopeChain(state)` (`state-store.js:281`) = cli.js 전체가 chain 상태를 읽는 **단일 진입점 (22 호출)**.
  - 현재: `current_scope` → `scope_states[scope]` 반환 / 없으면 전역 fallback.
  - 목표: scope manifest + stage manifest 에서 `{current_chain, stage_progress}` **유도**, 런타임 3종은 전역에서.
- 이 chokepoint 한 곳이 read 변경을 대부분 흡수.

## 3. 목표 상태

```
state.json (단순화 후):
  - version / project_id
  - current_scope            ← "지금 어느 작업" 커서 (단일)
  - 전역 런타임 (현재 작업 1개분):
      current_chain          ← 빠른 커서 캐시 (SSOT = manifest, 起動 시 reconcile)
      last_gate / gate_decision
      git_baseline_sha
      blocked / block_reason / block_scope   (이미 전역)
  - (제거) scope_states {}    ← 삭제

chain 진행 위치 SSOT = .ai-context/scopes/<scope>/<stage>/manifest.json (git-tracked, 브랜치 따라감)
동시 격리 = 피처 브랜치 + 워크트리 (별도 .ai-context/state.json)
```

핵심 원칙: **manifest = 진행 위치 SSOT (영속·공유) / state.json = 현재 작업 런타임 (휘발·로컬·gitignore)**.

**v3 — `current_chain` 완전 유도** (D2 폐기). analysis 를 chain 커서에서 분리하면 커서는 discovery~implement 5개뿐 → **전부 manifest 있는 stage** → 완전 유도. analysis 갭 소멸로 캐시 불필요.

**analysis 분리 형태 (S0 조사 후 축소 — 2026-06-25):**
- `current_chain` enum: analysis **유지**. 완전 제거는 flow revisit edge(`discovery→analysis`·`implement→analysis` / sdlc-4stage-flow.json:101·109)·gate #0 의존이라 **revisit 의미론 변경 = 위험**.
- 분리의 실질 = **시작점만** — 새 scope/작업 시작 = `discovery`(analysis 아님). analysis = 프로젝트 1회(전역 `init`, scope 없이) + 드문 revisit 대상.
- current_chain 유도: **평시 완전**(discovery~implement) / `revisit:analysis` 시 1케이스만 캐시 fallback (C2).

**계약 2종 (LSP/Terraform 차용 / §2-B):**
- **C1 reconcile-before-read**: 커서 접근 전 起動 reconcile 완료 강제 (skip 금지).
- **C2 SSOT 부재 fail-closed**: manifest 부재/손상 시 fallback 명시 — ①scope+manifest→유도 ②scope+무manifest→lazy-seed후 `discovery` ③scope=null→discovery 하드디폴트(analysis 는 프로젝트 레벨 상태에서 별도 확인). silent 0-초기화 ❌.

## 4. 변경 범위 (파일별 / 영향 카운트)

| 파일 | 변경 | 비고 |
| --- | --- | --- |
| `schemas/state.schema.json` | `scope_states` 제거, version 2.0 | breaking — major bump |
| `tools/chain-driver/src/state-store.js` | `getActiveScopeChain` → manifest 유도 / `initScopeChainState` 제거 또는 no-op / `setCurrentTask`·`clearCurrentTask` 전역화 / migration 1.0→2.0 등록 | 정의처 |
| `tools/chain-driver/src/cli.js` | `cmdNext` 의 `sc` 분기(644-674) 제거 → 전역 단일 write + manifest 갱신만 / `cmdInit --scope` 전환 시 **런타임 리셋** 추가(340-348) | 주 소비자 (getActiveScopeChain 22 / initScopeChainState 27) |
| `tools/chain-driver/src/hooks-bridge.js` | scope_states 읽기 → getActiveScopeChain 경유로 통일 | |
| `scripts/chain-statusline.js` | line 29-32 scope_states 직독 → manifest 유도 또는 전역 | statusLine 표시 |
| `tools/chain-driver/test/multi-scope-chain.test.js` | **의도 재작성** — 멀티플렉싱 검증 → "워크트리 격리 + manifest 유도" 모델 | 가장 큰 테스트 작업 |
| `tools/chain-driver/test/branch-per-task.test.js` | current_task 전역화에 맞춰 조정 (enter/finish-task 자체는 존속) | |
| `scripts/test/chain-statusline.test.js` | statusline 변경 반영 | |
| `release-readiness.js` / `test.js` | 체크 count coupling 동시 갱신 (memory `release_readiness_count_coupling`) | |
| 문서 | ADR-CHAIN-005(state-store) 보강 + 신규 DEC + CLAUDE.md 상태모델 한 줄 | |

## 5. 마이그레이션 (forward-only)

- `CURRENT_STATE_VERSION` 1.0 → 2.0, `MIGRATIONS` 에 `1.0->2.0` **명시 등록** (현 프로덕션 `MIGRATIONS` 비어있음 — test만 2.0→3.0 / §2 실측).
- 변환: `scope_states[current_scope]` 를 전역(current_chain/stage_progress/last_gate)으로 흡수 + **`current_task` 도 전역 흡수** → `scope_states` 삭제.
- **손실 정정 (§2 Senior)**: 진행위치는 manifest 보존 → 손실 0. 그러나 **비활성 scope 의 `current_task` 포인터는 manifest 에 없어 손실 불가피** → 마이그레이션 시 비활성분을 **intervention-log 에 archive** (날조 ❌, 정직 명문화).
- **격상 근거 (§8.1 / §2 놓친 리스크)**: body breaking 격상은 **≥2 PoC corroboration 의무**. state.json 1건 마이그레이션 검증 ≠ 격상 근거 — S5 에 ≥2 PoC round-trip 회귀(아래).

## 6. 리스크 (§2 Senior 검토 완료 — 실측 반영)

| # | 항목 | 위험 | 처리 |
| --- | --- | --- | --- |
| 1 | ~~analysis-무-manifest 갭~~ | ~~해소~~ | **v3 분리로 소멸** — analysis 를 chain 커서에서 프로젝트 레벨로 분리 → 커서(discovery~implement) 전부 manifest 유도. 캐시 불필요(D2 폐기) |
| 2 | non-scoped compat | M | 전역 `current_chain/stage_progress` 유지. **D3=강제❌** |
| 3 | ~~revisit baseline 전역화~~ | ~~무효~~ | **dead field** — `git_baseline_sha` write 0 / 항상 `HEAD~1`(§2 실측). schema 2.0 에서 제거 + **finding 등록**(baseline 미배선) |
| 4 | derived reconcile | **H** | 起動 reconcile chokepoint 1곳(readState 직후) + **역방향 stage 매퍼**(`impl→implement`/`planning→discovery`) 신설. 현 `stageToManifestStage` 단방향뿐 |
| 5 | 마이그레이션 손실 | **H** | §5 — `1.0->2.0` 명시 + current_task 흡수 + 비활성분 archive |

미확인(carry): hooks-bridge.js 본문 reconcile 영향 (시그니처만 봄 / 정밀평가 시 read). 워크트리 .ai-context 경계(로컬 state vs git 산출물)는 문서 §5 에서 명문화.

## 7. 단계 분해 (slice / v3 — analysis 분리 반영)

- **S0 축소→S2 통합** — analysis 완전 제거 ❌(revisit edge·gate#0 위험). enum/STAGES/flow **유지**. "시작점만 discovery" 는 S2 에서.
- **S1** schema 2.0(`scope_states`+`git_baseline_sha` 제거, current_chain enum 은 analysis **유지**) + `1.0->2.0` migration 명시 등록(current_task 흡수+archive) + **역방향 stage 매퍼**(impl→implement 등) + baseline finding 등록.
- **S2** state-store `getActiveScopeChain` → **완전 유도**(평시) + **C2 fallback**(scope+무manifest→discovery / revisit:analysis→캐시) + **起動 reconcile chokepoint**(readState 직후, C1) + `initScopeChainState` 새 scope=**discovery**(=시작점 분리) + 단위 테스트.
- **S3** cli.js cmdNext(scope 분기 제거)/cmdInit(scope 전환 시 런타임 리셋) 전역화 + manifest 유도 배선.
- **S4** statusline + hooks-bridge(본문 read 후) 통일.
- **S5** 테스트 3종 재작성(multi-scope → 워크트리/유도 모델) + release-readiness count coupling.
- **S6** 문서(ADR-CHAIN-005 보강 + analysis 분리 DEC + CLAUDE.md 상태모델) + **≥2 PoC round-trip 회귀**(init→next×N→migrate→derive / §8.1 격상 근거).

## 8. 티켓 / 브랜치

- MIS 카스케이드: MIS-365 → MIS-366([Tech Debt] mis-plugins) → 신규 **OP Task** (상태모델 단순화). 외부 작업 직전 confirmation gate.
- 브랜치명 = 티켓 키 단독. smilegate main 기준 분기 (memory `repo_remotes_smilegate_canonical`).

## 9. 결정 현황 (v3 확정)

- **D1 = 방향 채택** ✅ 사용자 진행 승인 (워크트리 착수).
- **D2 = ~~캐시~~ → 완전 유도** ✅ **폐기·전환**(v3 — analysis 분리로 갭 소멸 / 캐시 불필요).
- **D3 = non-scoped 전역 1급 유지** ✅ (analysis 프로젝트 레벨 + scope=discovery 시작).
- **D4 = §2 research** ✅ 완료.
- **D5 = 티켓 S0/S1 직전 OP Task** ✅ — 생성 confirmation 후 키로 워크트리.
- **신규 = analysis 분리** ✅ 범위 포함(S0). 새 scope 시작 stage = discovery.

## Lessons Learned

- **S0 "완전 제거"는 위험이었다** — analysis 를 STAGES/enum 에서 통째로 들어내려 했으나, flow revisit edge(`discovery→analysis`·`implement→analysis`)·gate#0 에 묶여 있어 revisit 의미론까지 바뀜. §1 전수조사가 "시작점만 분리"로 축소시킴(재작업 회피).
- **plan 의 자기-기록 사실 3건이 Senior REVISE 로 뒤집힘** — `git_baseline_sha` dead field / "손실0" 거짓(current_task) / 역매퍼 부재. 실측 없이 plan 에 적은 가정은 §2 적대검토로 검증해야(feedback_self_recorded_fact_validation).
- **strict 테스트가 변경을 정확히 포착** — 32 red 가 전부 의도 영역(multi-scope/state-store scope/branch-per-task)이고 타 도메인 0 = 격리 깔끔(feedback_strict_exposes_drift).
- statusline activeChain 정리 시 테스트가 scope_states 케이스를 검증하던 것(전역 fallback 으로 우연 통과)이 드러남 — 코드 정리는 짝 테스트 재작성과 함께.

## Carry (release 직전 / 후속)

- GateRecord 고아 def — top-level `last_gate` inline 과 중복 / 미참조 ajv 무해. `last_gate` $ref 통합 시 정리.
- S2 manifest 완전유도 + C1 reconcile + 역매퍼 — 워크트리 워크플로상 §8.1 생략. 순차 브랜치 전환 견고성 필요 시.
- ADR-CHAIN-005 보강(state-store 2.0) — release 문서화 시.
- plugin.json version bump + CHANGELOG MAJOR(state schema 2.0 breaking) + CLAUDE.md "현재 vX" — release 직전. ⚠️ main 이 v0.77.0(gate-review-bypass-guard) 으로 진행됨 → 머지 시 version·CHANGELOG 충돌 해소 필요.
