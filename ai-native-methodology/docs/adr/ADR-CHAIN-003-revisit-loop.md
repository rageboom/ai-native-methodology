# ADR-CHAIN-003: revisit loop — 자동 감지 + 사용자 결단

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-06
- 결정자: 윤주스 (TF Lead)
- 관련: DEC-2026-05-06-v2.0-i-strict-채택 (★ trigger), ADR-CHAIN-001 (chain 정합 강제 / §6 인용), ADR-CHAIN-002 (go/stop gate UX / §5 결합), 4 원칙 §4 (실패 시 Revert)

## 컨텍스트

v2.0 chain 4단계 chain harness = 단방향 진행 보장 ❌. 다음 상황에서 **revisit (이전 stage 회귀)** 필요:

- chain 3 test 실행 결과 = AC-* 가 unverifiable 임이 드러남 (spec 결함) → chain 2 회귀
- chain 4 impl 100% pass 미달 → chain 3 retry (test-spec 보강 / 또는 chain 2 spec 재검토)
- chain 4 impl 의 invariant 위배 → chain 2 behavior-spec 재검토
- planning-spec 의 use_case 변경 → chain 1~4 모두 영향

본 ADR = revisit trigger / detector / 사용자 결단 정책 명문화.

사용자 결단 (2026-05-06 / Q4 답변): "**자동 감지 + 사용자 결단**" — 도구가 위반 자동 감지 → 사용자 prompt → go/stop.

## 결정

**revisit loop 정책** 명문화:

### 1. revisit trigger 영역 (chain edge graph)

```yaml
revisit_edges:
  - from: spec
    to: planning
    trigger: "BR-* / UC-* 누락 / use_case 변경 detect"
  - from: test
    to: spec
    trigger: "AC-* unverifiable detect / behavior invariant 위배"
  - from: implement
    to: test
    trigger: "test 100% pass 미달 / chain_attempt.attempt_n > retry_cap"
  - from: implement
    to: spec
    trigger: "BHV-* invariant 위배 / decision-table 변경 필요"
```

### 2. chain-revisit-detector (sub-plan-3 신설 도구)

자동 감지 의무:
- 4 chain 산출물 + git diff (변경 이벤트) 입력
- chain 단계 X 변경 시 → upstream / downstream stage 영향 분석
- 영향 detected 시 → 사용자 prompt (★ ADR-CHAIN-002 §5 정합)

hook 통합 (sub-plan-5):
- `hooks/hooks.json` 의 `PostToolUse` 에 chain-revisit-detector 등록
- Write/Edit 후 자동 호출

### 3. 사용자 결단 (★ Q4 정합)

자동 감지 → ★ ★ **사용자 prompt** (자동 진행 ❌):

```
[revisit detected]

trigger source: chain-revisit-detector
trigger reason: {trigger}
영향 stages: [{from} → {to}]

영향 trace:
- {affected ID list (UC-* / BHV-* / AC-* / TC-* / IMPL-*)}
- traceability-matrix 영향 cell 수: {n}

결단:
1. ★ revisit 진행 ({to} stage 회귀)
2. ★ ★ 무시 + 결단 logged ("이 변경은 영향 없음" 사용자 명시)
3. ★ ★ ★ chain abort (재plan 의무)
```

### 4. revisit cap (★ Industry research 정합)

- `chain_attempt.retry_cap` (default 3) — chain 4 단계 안에서 최대 retry
- retry_cap 초과 시 → 자동 chain abort + 4 원칙 §4 (Revert + Lessons Learned) 적용
- retry_cap 사용자 갱신 가능 (★ §8.1 strict ≥ 2 PoC corroboration 의무)

### 5. 결단 trace 보존

ADR-CHAIN-002 §3 의 `intervention_log` 에 revisit 결단도 통합 보존:

```yaml
intervention_log entry (revisit):
  gate: "revisit"
  trigger_source: "chain-revisit-detector" | "manual"
  trigger_reason: string
  affected_stages: [from, to]
  affected_ids: [UC-*, BHV-*, ...]
  decision: "revisit" | "ignore" | "abort"
  reason: string (사용자 명시)
```

### 6. revisit ↔ go/stop gate 결합

revisit decision = `stop+revisit` 의 sub-type (ADR-CHAIN-002 §1):
- gate prompt 안에서 revisit trigger 통합 표시
- 사용자 = 한 prompt 안에서 go / stop+revisit (어느 stage 회귀) / stop+abort 중 결단

## 학문적 계보

### 4 원칙 §4 직접 정합
"실패 시 Revert → 교훈 반영 → 1원칙 재시작 — Lessons Learned 섹션 plan.md 기록. 같은 실수 반복 금지."

본 ADR §3+§4+§5 = ★ 4 원칙 §4 의 chain stage 자동화.

### Industry 사례
- **Aider** `/undo` 즉시 revert (단발 commit 기준)
- **GitHub Copilot Workspace** editable steps — 단계별 사용자 수정 → cascade
- **Babel/Yarn/Sentry retract Lessons Learned** (DEC-2026-05-02-plugin-first 14차) — 빠른 revert + 원인 분석

본 ADR = ★ 산업 사례의 본 방법론 chain stage 화.

## 결과

### 긍정적 영향
1. chain coupling 위험 명시 통제 (ADR-CHAIN-001 §결과 위험 #1 완화 메커니즘)
2. AI code gen SOTA gap (60~88%) 봉쇄 (retry cap + revisit cycle 누적 90%+ 회복)
3. 4 원칙 §4 자연 확장
4. 14차 retract pattern 재현 차단 (자동 감지 + 명시 결단 trace)

### 부정적 영향
1. **revisit 빈도 ↑ 시 chain 진행 ↓** — 완화: retry_cap default 3 / 사용자 갱신 의무
2. **자동 감지 false positive 위험** — 완화: 사용자 결단 의무 (자동 진행 ❌) / 결단 trace 누적 → tool 정확도 점진 개선

## 대안 (검토 후 거부)

### 대안 1: 자동 감지 + 자동 진행 (사용자 개입 ❌)
- 거부 이유: Q4 사용자 결단 직접 위배 + 14차 retract pattern 재현 위험.

### 대안 2: 수동만 (도구 자동 감지 ❌)
- 거부 이유: chain coupling 영향 사용자가 매번 수동 추적 = cognitive load 폭발 + 오탐 위험.

## 적용 시점

- sub-plan-3 (도구): chain-revisit-detector 신설
- sub-plan-5 (hooks + harness): hooks/hooks.json PostToolUse 통합
- v2.0.0 release = §1~§6 모두 운영 입증

## 변경 이력
- 2026-05-06: 신설 (sub-plan-2).
