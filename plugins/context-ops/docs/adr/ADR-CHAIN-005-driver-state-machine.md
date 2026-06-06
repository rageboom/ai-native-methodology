# ADR-CHAIN-005: Chain Harness Driver State Machine + Mechanical Gate Enforcement

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-06
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-CHAIN-001 (chain 4단계 정합 강제), ADR-CHAIN-002 (go/stop gate UX), ADR-CHAIN-003 (revisit loop), ADR-CHAIN-004 (test runner invocation contract), DEC-2026-05-06-v2.0-i-strict-채택, DEC-2026-05-06-harness-호칭-엄밀화 ( trigger / harness 호칭 자격 5 요소), sub-plan-5-research §F1 BLOCKER + F2~F8 (Senior critique), master plan `~/.claude/plans/a-stateful-gadget.md` §C / §H sprint M+5

## 컨텍스트

sub-plan-1~4 종결 후 자산 = harness scaffolding (사양 + validator + skills + flows + agents + schemas / **부품**). DEC-2026-05-06-harness-호칭-엄밀화 audit 결과 harness 5 요소 모두 ❌:

1. Driver / Orchestrator
2. State 영속 (`.aimd/state.json`)
3. Mechanical gate (validator → block / unblock 자동화)
4. Skill auto-invocation (사용자 명시 결단 enforced)
5. Chain-revisit detector (자동 감지 + 사용자 prompt)

   핵심 위험 ( no-simulation 정책 enforcement 누락):

- LLM 이 "gate 통과한 척" → 결단 trace 위조
- LLM 이 "RED 확인한 척" / "GREEN 도달한 척"
- skill markdown 이 사용자/LLM 양심 의존 / 코드 enforcement ❌

본 ADR = 양심 의존 → **코드 enforcement 전환** 의 사상적 기반.

## Senior critique (sub-plan-5-research §F)

10건 식별 — F1 BLOCKER (hooks stdout 이 LLM context 로 재주입 / D21 옵션 A retract) + F2~F5 HIGH (mechanical gate enforcement trio / state CAS / revisit confidence / schema migration) + F6~F8 MED + F9~F10 LOW. 본 ADR 가 흡수.

## 결정

**Chain Harness Driver State Machine + Mechanical Gate Enforcement** 를 다음 8 정책으로 명문화:

### 1. Driver = 단일 Node.js workspace (`tools/chain-driver/`)

- workspace 12번째 ( 11 도구 + 1 driver)
- ES modules / `node:test` / zero-dep 원칙 (기존 11 도구 정합)
- module ≤ 250 LOC 가이드라인 ( Senior F9)
- 7 module: cli / state-store / stage-graph / invoke-skill / gate-eval / revisit-detect / hooks-bridge

### 2. State 영속 = `.aimd/state.json` + atomic write + CAS

`schemas/state.schema.json` SSOT. atomic write 패턴:

```js
const fh = await open(`${path}.tmp`, 'w');
await fh.write(JSON.stringify(state, null, 2));
await fh.sync(); // fdatasync — crash durability
await fh.close();
await rename(`${path}.tmp`, path); // POSIX atomic
```

**CAS (Compare-And-Swap)** 의무 ( Senior F3):

- read 시 `version` 기록 → mutate → write 시 read-time version 일치 확인 → 일치 시 +1 → write
- 불일치 시 `state-corrupt` (exit 4) abort
- Windows: `fs.copyFile` + `fs.unlink` fallback (rename EEXIST 회피)
- `lock_holder_pid` + `mtime` 5분 stale 자동 해제
- single-writer 가정 명문화 (다중 사용자 = sp5-c2 carry)

### 3. Mechanical gate enforcement = trio ( Senior F2)

exit code 1 만으론 LLM 무시 가능 → **3 layer 차단** 의무:

| layer       | 메커니즘                                                                       | 효과                              |
| ----------- | ------------------------------------------------------------------------------ | --------------------------------- |
| (i) state   | `state.blocked = true` 영속                                                    | 다음 invocation 시 자동 차단 유지 |
| (ii) cli    | blocked 상태에선 모든 `chain-driver *` 명령 비대화형 exit 2 + 동일 메시지 반복 | LLM 우회 호출 차단                |
| (iii) hooks | `PreToolUse` `permissionDecision: "deny"` + `.aimd/output/**` Write/Edit 차단  | 직접 산출물 우회 작성 차단        |

trio 모두 동작해야 enforcement 진짜 — 1개라도 누락 시 양심 의존 회귀.

### 4. Skill auto-invocation = D21' ( Senior F1 BLOCKER 흡수)

~~D21 옵션 A (suggestion only)~~ retract.

**D21' 정책**:

- `UserPromptSubmit` / `PostToolUse` hook 사용 시 `suppressOutput: true`
- stderr 만 사용자 콘솔 노출 (LLM context 주입 ❌)
- `hookSpecificOutput.additionalContext` 에 차단 문구 동봉:
  ```
  "LLM SHALL NOT auto-invoke this skill. User explicit decision REQUIRED via /aimd-next or /aimd-stage <name>."
  ```
- skill 진입 = 사용자 slash command (`/aimd-next` / `/aimd-stage <name>`) 또는 사용자 명시 prompt 만
- driver 권고 = stderr only — LLM 컨텍스트 격리

### 5. Chain-revisit-detector = path whitelist + LOC confidence ( Senior F4)

- `git diff --name-only --numstat <baseline>..HEAD` 사용
- path-to-chain whitelist (예: `src/**` → implement / `**/*.test.*` → test)
- **confidence score = non-comment LOC** ≥ 5 미만은 자동 ignore + log only
- `revisit-ignore-globs` (`**/*.md`, `**/*.test.*` only-touch) 학습 누적 (`.aimd/state.json` 내)
- false positive > 30% 묵인 ❌ — 사용자 결단 의무 + Auto Mode 차단 (trio §3 적용)

### 6. State schema evolution = forward-only migration ( Senior F5)

```js
state-store.migrate(fromVersion, toVersion, json) → json
```

- forward-only / 직전 1버전 호환만
- migration 누락 시 `chain-driver migrate` 명령 요구하며 abort (exit 4)
- breaking change 시 사용자 명시 confirm 의무
- 등록 함수 부재 시 driver 진행 ❌

### 7. CLI exit code matrix + flags ( Senior F7)

| exit | 의미                | 처리                                            |
| ---- | ------------------- | ----------------------------------------------- |
| 0    | ok                  | 정상 종료                                       |
| 1    | blocked-by-gate     | 사용자 결단 prompt 요구 (gate 통과 미달)        |
| 2    | invariant-violation | mechanical gate trio (ii) — 후속 호출 모두 차단 |
| 3    | usage-error         | 잘못된 argument / config                        |
| 4    | state-corrupt       | state.json CAS 실패 / migration 누락            |

- `state` default = human-readable
- `state --json` = raw state.json
- `next --dry-run` = mutate ❌ / gate 평가만

### 8. Observability = `.aimd/output/intervention-log.jsonl`

- `schemas/intervention-log.schema.json` 신설
- 필수 필드: `event_type` / `stage` / `decision` (go|stop|revisit:<stage>) / `actor` (user|driver|llm) / `timestamp` / `validator_findings_ref` (옵션)
- JSONL append-only / 월별 rotation `.aimd/output/archive/yyyy-mm.jsonl`
- driver startup 시 `*.tmp` 잔존 detect → "이전 실행 중단 — recovery" prompt + auto-cleanup ( Senior F6)

## 인용 체인

```
ADR-CHAIN-001 (chain 4단계 정합 강제)
   ↓
ADR-CHAIN-002 (go/stop gate UX) + ADR-CHAIN-003 (revisit loop)
   ↓
ADR-CHAIN-005 ( 본 ADR / driver state machine + mechanical gate)
   ↑
   참조: ADR-CHAIN-004 (test runner contract / chain 4 enforcement 정합)
```

| 본 ADR §결정          | 인용 ADR / 정책                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| §1 driver workspace   | ADR-CHAIN-001 §1 (이중 렌더링 / chain stage 산출물)                                                         |
| §2 state CAS          | (신규 — Senior F3)                                                                                          |
| §3 mechanical trio    | DEC-2026-04-29-static-tool-실행-의무화 ( no-simulation) + Claude Code hooks `PreToolUse.permissionDecision` |
| §4 D21'               | Claude Code hooks contract (UserPromptSubmit stdout = LLM context)                                          |
| §5 revisit confidence | ADR-CHAIN-003 §revisit loop                                                                                 |
| §6 migration          | (신규 — Senior F5)                                                                                          |
| §7 exit code          | (신규 — Senior F7)                                                                                          |
| §8 intervention-log   | ADR-CHAIN-002 §intervention_log + ADR-010 v2 §observability                                                 |

## 결과

### 긍정

- harness 5 요소 모두 코드 enforcement → "chain harness scaffolding" → "chain harness" 정식 호칭 자격 확보
- LLM 양심 의존 → trio 차단으로 전환 (Auto Mode 도 enforce)
- state evolution policy 명문화 → v2.x 진입 안전
- exit code matrix → CI 통합 deterministic

### 부정 / carry

- driver e2e cycle 검증 = sub-plan-6 (PoC #05) 위임 (sp5-c5 carry)
- 다중 사용자 driver 동시성 (flock / DB) = v2.x carry (sp5-c2)
- hooks 의 진짜 LLM auto-invoke (D21 옵션 B) = v2.x carry (sp5-c3 / 사용자 결단 시)
- intervention_log 분석 dashboard = sub-plan-6 carry (sp5-c4)
- Auto Mode 차단 임계 분포 분석 = sub-plan-6 carry (sp5-c6)

### 모니터링 ( §8.1 strict 입증 의무 / sub-plan-6)

| 지표                          | 목표                    | 출처                                           |
| ----------------------------- | ----------------------- | ---------------------------------------------- |
| trio 차단 발동률              | ≥ 1회 / PoC             | intervention-log.jsonl `event_type=trio_block` |
| revisit-detect false positive | < 30%                   | revisit log + 사용자 결단 trace                |
| state CAS 충돌률              | 0 / single-writer       | state-store error log                          |
| hooks suppressOutput 위반     | 0 (LLM context 주입 ❌) | hooks-contract test                            |

## 대안 (검토 후 기각)

### 대안 A: hooks suggestion-only (D21 옵션 A — retract)

기각: hooks stdout 이 LLM additional context 로 재주입 → Auto Mode 에서 옵션 B 와 동치 (Senior F1 BLOCKER).

### 대안 B: state.json 대신 SQLite

기각: zero-dep 원칙 위배 / `.aimd/` git 추적 가능성 ↓ / human-readable diff 손실. 다중 사용자 시점 (v2.x) 재검토.

### 대안 C: 7 module → 2~3 file 통합

기각: hooks-bridge 가 stage-graph 직접 참조 시 drift 검출 어려움 (Senior F9 반대 의견 — 현 분할 합리).

### 대안 D: tree-sitter semantic diff 즉시 도입

기각: sub-plan-3 §sp3-c2 carry 일관성 / 본 sub-plan-5 = static path whitelist + LOC threshold 만. v2.x 격상.

## 검증 (sub-plan-5 종결 의무)

```bash
# unit test ≥ 165 ( F10 hooks-contract 추가)
cd tools/chain-driver && npm test

# state schema 회귀
node tools/schema-validator/src/cli.js .aimd/state.json --schemas schemas/

# drift state-flow consistency ( F8)
node tools/drift-validator/src/cli.js --check-state-flow-consistency

# hooks dry test (suppressOutput / stderr only)
echo '{"hook_event_name":"UserPromptSubmit","prompt":"planning 시작"}' \
  | node tools/chain-driver/src/cli.js hooks-bridge
# expected: stdout = '{"suppressOutput":true,"hookSpecificOutput":{"additionalContext":"LLM SHALL NOT..."}}'

# trio enforcement smoke
node tools/chain-driver/src/cli.js init /tmp/test-project
# corrupt state to trigger blocked
node tools/chain-driver/src/cli.js next /tmp/test-project
# expected: exit 2, stderr "blocked: <reason>"
```
