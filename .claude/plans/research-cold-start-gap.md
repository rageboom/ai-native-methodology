# research — cold-start 갭 (2원칙 / 에이전트 팀 토론)

> plan-cold-start-gap.md 동반. 3 에이전트 병렬(공식문서/업계/Senior). 가벼운 전략.

## 1. 공식문서 (Claude Code hooks / code.claude.com/docs/en/hooks — 실 fetch)

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| SessionStart `additionalContext`(stdout) → 모델에 직접 주입 | ✅ | "stdout is added as context that Claude can see" (UserPromptSubmit/SessionStart 예외) |
| exit 0 stderr = 사용자 트랜스크립트 미표출 | ✅(부분) | exit 2 stderr만 사용자 표출 명시. exit 0 stderr 행선지 = debug log(추정) |
| PreToolUse exit 2 **또는** `permissionDecision:deny` 차단 | ✅ | **단 둘 동시 ❌** — "choose one approach per hook, not both" |
| SessionStart 파일 write side-effect 허용? | ✅(조건부) | skill 설치/`CLAUDE_ENV_FILE` append 공식 예시 존재. 단 "keep hooks fast" |
| no-op 정식 패턴 | exit 0 + 무출력 | `{continue:true}`는 문서 미등장(무해하나 canonical 아님) |
| additionalContext vs systemMessage vs stderr | — | additionalContext=모델용 / systemMessage=사용자 표출 / stderr=exit2시 사용자 |

→ **설계 함의**: SessionStart surface는 additionalContext(모델) 채널이 정답([[reference_sessionstart_hook_channels]] 정합). PreToolUse deny는 기존 `coldStartSkipAheadReason` 경로(buildBlockOutput+exit2)를 그대로 재사용 — 새 패턴 도입 없음. 자동 init은 공식적으론 가능하나 "fast" 제약 + Senior 반대로 보류.

## 2. 업계 사례

| 도구 | 패턴 | 교훈 |
| --- | --- | --- |
| **pre-commit** `--allow-missing-config` | config 없는 레포 = "skipping" + exit 0 | `.ai-context/` 존재=opt-in의 **직접 선례** |
| **Husky v9** | `.husky/` 디렉토리 + hooksPath 없으면 no-op | 디렉토리 존재=활성화 신호 = 우리와 동형 |
| **pre-commit custom fail-closed** | config 없으면 exit 1 차단 | user-level에 적용 시 "옛 레포 커밋 불가" 불만 반복 = **over-block 실증** |
| **Terraform** | `.terraform/` 없이 plan/apply = fail-closed | fail-closed는 "비가역 손상" 있을 때만 정당 → 우리는 해당 ❌ |

→ **결론**: `.ai-context/`=opt-in + orphan만 deny + 나머지 advisory = pre-commit/Husky 양쪽 지지. 전면 fail-closed = over-block 안티패턴(근거 없음).

## 3. Senior 리뷰 — 수정 후 GO

- Q1 over-block: **지지(저위험)**. cold-start deny는 `.ai-context/` 내 정확한 chain 산출물 파일명(behavior-spec.json 등)에만 트립 → false-positive 무시 가능.
- Q2 pseudo-state read-only vs 자동 init: **read-only 지지**. 자동 init = 동의 없는 mutation = [[project_gate_review_bypass_guard]] 안티패턴 동형. 합성 비용 0(DEFAULT_STAGE_PROGRESS 재사용).
- Q3 D1 parity: **지지**. cold-start가 init=pending과 동일 함수·scope → 정확히 동치. "더 강한 보호" 기대는 scope-out.
- Q4 D3b 자동 init+reconcile: **후속 유지**. orphan deny가 이미 갭을 닫음. 자동 init은 Q2 문제 보유.
- Q5 숨은 결함 (STRONG-STOP 2):
  1. **corrupt state.json silent 강등** — `readState` throw `StateCorruptError`(state-store.js:102,105) → `catch{state=null}`(cli.js:1858) → 손상 live가 cold-start(약한 enforcement)로 떨어짐. **`corrupt` 4th mode 필수 / fail-closed**.
  2. **§8.1 ≥2 PoC corroboration** — 단위 3-state 외 poc-17 + ep-be-gea에서 state.json rename → orphan write deny E2E 재현.

## 4. 종합 → plan 반영
- 리졸버를 **4-mode**로: `live` / `cold-start` / `corrupt`(fail-closed) / `absent`. existsSync(state.json) 먼저 → 있으면 parse 시도(throw=corrupt) / 없으면 .ai-context 확인.
- corrupt는 cold-start보다 **엄격**(약하게 X): SessionStart 강한 surface + PreToolUse .ai-context write 차단(state.blocked 유사).
- ≥2 PoC live corroboration을 수용 기준에 추가.
- 자동 init(D3b) = 별도 후속 carry.
