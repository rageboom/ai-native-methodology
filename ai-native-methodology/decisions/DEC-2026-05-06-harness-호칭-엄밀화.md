# DEC-2026-05-06-harness-호칭-엄밀화

- 일자: 2026-05-06
- 카테고리: methodology / 호칭 정합 / scope 재정의 / 사용자 명시 결단
- 결정자: 윤주스 (TF Lead)
- 상태: 승인 (★ ★ ★ "chain harness" 호칭 엄밀화 / 현 단계 = scaffolding / sub-plan-5 완성 후 = harness 정합 / no release / no tag / 본체 commit 만)
- 관련: DEC-2026-05-06-v2.0-i-strict-채택, DEC-2026-05-06-sub-plan-1/2/3a/3b/4-종결, ADR-CHAIN-001~004, master plan `~/.claude/plans/a-stateful-gadget.md`, sub-plan `~/.claude/plans/sub-plan-5-harness-driver.md` (★ 본 결단 동반 신설), 직전 commit `4de7e0d` (sub-plan-4 종결)

## 컨텍스트

sub-plan-1~4 종결 후 사용자 결단 prompt — "저게 하네스라고 할 수 있나? 엄밀하게."

**엄밀한 audit 결과** = 현 자산 ★ harness 아님 / **harness scaffolding** 단계.

## harness 엄밀 정의 (5 요소)

소프트웨어 공학 관점에서 "harness" = 다음 5 요소 모두 보유:

| # | 요소 | 의미 |
|---|---|---|
| 1 | **Driver / Orchestrator** | "지금 stage X" → "skill Y 호출" → "validator 실행" → "gate 평가" → "next/revisit" 자동 loop |
| 2 | **State 영속** | `.aimd/state.json` 같은 "현재 어느 chain 인가 / 마지막 gate 결과 / pending revisit" 추적 |
| 3 | **Mechanical gate** | gate 미통과 시 다음 stage **차단** (skip 불가 / 코드 수준 enforcement) |
| 4 | **자동 전이** | 산출물 완성 → validator 자동 → 통과 시 다음 skill 자동 호출 |
| 5 | **Chain-revisit detector** | impl 변경 → 영향 chain 자동 감지 → 사용자 prompt + 영향 범위 표시 |

## 현 자산 audit (sub-plan-1~4)

### ✅ 가지고 있는 것 (harness 의 부품)

| 자산 | 역할 | 한계 |
|---|---|---|
| `schemas/*.schema.json` | passive structural enforcement | schema-validator 가 invoke 돼야 작동 / 자동 trigger ❌ |
| 11 chain validator | 단일 artifact 검증 | 모두 수동 invoke / driver loop ❌ |
| `lint-no-simulation.sh --chain-strict` | 5종 물증 7 필드 강제 | 수동 invoke |
| `test-impl-pass-validator --allow-execute` | 진짜 runner 호출 | 수동 invoke |
| ADR-CHAIN-001~004 + sdlc-4stage-flow.json | **사양** | 사양 only — 실행 driver ❌ |
| 13 SKILL.md | **LLM 절차 문서** (markdown) | 코드 아님 / LLM 양심 의존 |

### ❌ 없는 것 (harness 의 본질)

| 미보유 요소 | 위험 | 후속 |
|---|---|---|
| stage 전이 driver (loop / state machine) | 시뮬 위험 — LLM 이 "통과한 척" 가능 | sub-plan-5 |
| stage state 영속 (`.aimd/state.json`) | "현재 어느 chain" 추적 ❌ → 사용자 cognitive load | sub-plan-5 |
| gate mechanical block | skill 은 markdown 권고 / 차단 코드 ❌ → LLM 이 skip 가능 | sub-plan-5 |
| skill auto-invocation | 사용자 자연어 → LLM 매칭 (수동) / hooks ❌ | sub-plan-5 |
| chain-revisit-detector | impl 변경 시 영향 chain 자동 감지 ❌ | sub-plan-5 (sub-plan-3 carry) |

## ★ ★ ★ 시뮬 위험과의 연결 (★ 본 결단 핵심)

본 방법론이 ★★★ no-simulation 정책으로 시뮬 위험을 차단한다고 했지만, **harness 자체가 LLM 양심에 의존하는 한 시뮬 위험은 그대로 잔존**:
- LLM 이 skill 절차를 읽고 "지금 gate #2 통과한 척" → 결단 trace 위조 가능 (validator 안 돌리고 "통과" 주장).
- LLM 이 RED 단계에서 "test 모두 fail 확인했다" 주장하지만 실제로 test-impl-pass-validator 호출 ❌.
- gate 미통과 상태로 chain 4 진입 → 차단 코드 ❌.

이게 **본 방법론의 근본 모순** — chain harness gate 안 round-trip 정식 허용했지만 gate 자체가 mechanical block 이 아닌 한, "harness" 는 명목상 호칭. LLM 양심 의존 = no-simulation 정책의 enforcement 누락.

## 결정

### 1. 호칭 정합 명문화

| 단계 | 정확한 호칭 | scope |
|---|---|---|
| sub-plan-1~4 종결 (현 단계) | **chain harness scaffolding** | 사양 + validator + skills + flows + agents + schemas (★ harness 부품) |
| sub-plan-5 종결 후 | **chain harness** (★ 정식 호칭) | 위 + driver + state.json + mechanical gate + revisit-detector + hooks |
| sub-plan-6 종결 + v2.0.0 release 후 | **chain harness** (★ §8.1 strict 입증) | 위 + ≥ 2 PoC corroboration + e2e cycle pass |

### 2. 역사 기록 보존 + footnote 추가

- **DEC / ADR / CHANGELOG / sub-plan 종결 commit 메시지 보존** (역사 정합 / retract ❌).
- **STATUS.md / INDEX.md / CLAUDE.md** 의 "chain harness" 표현 → footnote 추가 (★ "scaffolding 단계 / sub-plan-5 후 정식 호칭").
- master plan SSOT (`flows/sdlc-4stage-flow.json`) 에 `harness_status` 필드 추가 — `scaffolding` / `harness-incomplete` / `harness-complete` enum.

### 3. sub-plan-5 재정의 (호칭 자격 확보 임무)

기존 sub-plan-5 = "hooks + harness" → ★ 본 DEC 후 = **"chain harness 호칭 자격 확보 sprint"**. 5 요소 본격 구현 의무.

```
sub-plan-5 = chain-harness-driver
├── tools/chain-driver/ (★ 신설 / driver loop + state machine)
├── schemas/state.schema.json (★ 신설)
├── chain-revisit-detector (sub-plan-3 carry resolved)
├── mechanical gate enforcement (validator 결과 → 자동 block)
├── skill auto-invocation (hooks/PostToolUse + UserPromptSubmit)
└── hooks/hooks.json 확장 (★ master plan §B 정합)
```

### 4. 본 결단 retract 가능성

본 결단 = ★ ★ scope 명료화 / 자산 변경 ❌ (호칭 + footnote + sub-plan-5 임무 재정의 만). retract 위험 ↓ — 5 요소 부재는 객관적 사실. 본 결단 이후 sub-plan-5 진입 시 5 요소 보유 입증 시점에 자연 종결.

### 5. ★ ★ ★ 사용자 양심 vs 코드 양심 (★ 핵심 lesson)

본 결단 = **양심 의존 자산화 차단의 첫 운영 입증**:
- 시뮬 위험 차단 정책 (★★★ no-simulation) = LLM 양심 ❌ / 진짜 도구 의무 / 5종 물증 7 필드.
- ★ harness 호칭 자격 = LLM 양심 ❌ / mechanical gate 의무 / state 영속 / driver loop.
- 두 정책 모두 동일 사상 — **양심 의존 ↓ / 코드 enforcement ↑**.

## 결과

### 긍정
- 호칭 엄밀성 ↑ — 외부 (사내 적용) 시 marketing claim 위험 감소.
- sub-plan-5 임무 명료화 — 5 요소 자격 의무.
- 시뮬 위험 인식 layer 추가 — LLM 양심 의존 자산화 차단 운영 입증.
- §8.1 strict 정합 — release 자격 평가 시 "harness" 호칭 사용 자격 자동 검증 (sub-plan-6 시점).

### 부정
- 외부 marketing 영향 — "v2.0 chain harness" → "v2.0 chain harness scaffolding (sub-plan-1~4) → chain harness (sub-plan-5+)" footnote 추가.
- sub-plan-5 임무 부담 ↑ — 5 요소 모두 구현 의무 (driver + state + gate + auto-invoke + revisit).

### 중립
- 자산 변경 ❌ (호칭 + footnote 만) — 14차 retract pattern 위험 ↓.

## sub-plan-5 진입 prerequisite (★ 본 결단 후속)

| # | 항목 | 상태 |
|---|---|---|
| 1 | ADR-CHAIN-001~004 | ✅ |
| 2 | 7 chain schema (planning/behavior/acceptance/test/impl/traceability/test-cmd) | ✅ |
| 3 | 11 chain validator + 138 unit test | ✅ |
| 4 | chain-check.yml CI infra | ✅ |
| 5 | 13 chain skill + 5 chain flow + 4 chain agent | ✅ |
| 6 | ★ ★ harness 호칭 자격 정의 | ✅ (★ 본 결단) |

## release / 갱신

- ★ no release / no tag / 본체 commit 만.
- CHANGELOG.md 갱신 ❌ (release 시 합산 / sub-plan-5 종결 시 본 결단 함께 trace).
- STATUS.md harness 호칭 footnote 추가.
- INDEX.md 본 결단 등재.
- CLAUDE.md "★★★ 본 방법론 가치 명세" 의 chain harness 호칭 단계 명시 추가.
- `flows/sdlc-4stage-flow.json` `harness_status` 필드 추가 (★ scaffolding 명시).

## Lessons / 보존

- ★ ★ ★ "chain harness" 호칭은 **driver + state + mechanical gate** 보유 시점에만 엄밀 정합.
- LLM 양심 의존 → 시뮬 위험 / mechanical enforcement 의무.
- 5 요소 audit 패턴 = 후속 호칭 (e.g., "AI-Native methodology" 자체) 의 엄밀성 검증 template.
- ★ scope 명료화 ≠ retract — 자산 변경 0 / 호칭 + scope 만 재정의 → 14차 retract pattern 회피.
