---
name: plan-decompose-and-sequence
description: ★ ★ v9.x MINOR chain 3 (plan) sub-skill. behavior-spec.behaviors[] + acceptance-criteria.criteria[] 입력에서 task 분해 + 의존성 그래프 + 실행 순서 추출. task granularity = 1~3 AC 묶음 (같은 BHV + 같은 layer + 같은 module 강제). plan-agent 가 호출. DEC-2026-05-25-axis-a-phase-4-1 정합.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# plan-decompose-and-sequence

★ ★ v9.x chain 3 (plan) 의 **task 분해 sub-skill**. spec(BHV/AC) → task-plan.tasks[] + dependencies[] + execution_order[].

## 언제 사용

- chain 2 (spec) 종결 + gate #2 go 결단 후 의무.
- plan-agent 가 chain 3 진입 시 step 1 호출.
- 사용자: "task 분해" / "plan 단계 진입" / "의존성 그래프".

## 입력

- `<project>/.aimd/output/behavior-spec.json` (★ chain 2 산출 / BHV-*)
- `<project>/.aimd/output/acceptance-criteria.json` (★ chain 2 산출 / AC-*)
- `<project>/.aimd/output/planning-spec.json` (★ chain 1 산출 / UC + intent context — cross-validation)

## 산출

- `<project>/.aimd/output/task-plan.json` (★ schemas/task-plan.schema.json 의무 / tasks[] + dependencies[] + execution_order field)

## ★ ★ task granularity 강제 (1~3 AC 묶음)

DEC-2026-05-21 §정책4 — task 안 ac_refs.length 1~3 imperative:
- 같은 BHV-* 안 AC 들만 묶음 (cross-BHV ❌)
- 같은 layer (`domain` / `application` / `infrastructure` / `presentation` / `cross-cutting`) 안 묶음 (cross-layer ❌)
- 같은 module 안 묶음 (cross-module ❌)
- 4+ AC = `plan-coverage-validator validateTaskGranularity` warn (medium / `--strict` 시 high)

## ★ ★ 의존성 graph (DAG)

task.dependencies[] = `["TASK-*"]` (topological order).

implicit 의존 추론 source:
- 같은 DB table 수정 → blocks
- 같은 cache key / 같은 file 수정 → blocks
- code_pointer 동일 range overlap → blocks

cycle 시 = `plan-coverage-validator validateDependencyCycle` critical finding (gate #3 block 의무).

## 절차

1. **behavior-spec + acceptance-criteria 로드** — `behaviors[]` + `criteria[]` 파싱.

2. **각 BHV-* 마다 task 묶음 후보 생성**:
   - AC-* 들을 layer + module 별 sub-group 분류
   - 같은 (BHV + layer + module) 안 1~3 AC 묶음 → 1 task 후보
   - 4+ AC 시 sub-group 재분해 또는 사용자 review

3. **task ID 부여** — id-conventions canonical (TASK-{MODULE}-{NNN}).

4. **dependencies 추론**:
   - explicit: 사용자 명시 (예: TASK-USER-002 가 TASK-USER-001 cookie 의존)
   - implicit: code_pointer 동일 file/range overlap / 같은 DB table 수정 / 같은 cache key

5. **execution_order topological sort** — DAG topological order (parallel 가능 task 동일 level).

6. **estimation_ai + estimation_human 분리 채움**:
   - estimation_ai = AI 추정 (S/M/L/XL 또는 hours)
   - estimation_human = 사람 명시 결단 영역 (placeholder 'TBD' 허용 / chain 3 종결 전 채움 의무)
   - ★ AI hallucination/over-confidence risk 학술 근거 (ResearchGate 2026-01 'Confident but Incorrect: Mitigating Hallucination and Overconfidence in Agentic AI Coders') — 표준 외 신설 paradigm

7. **자동 검증**:
   ```bash
   node tools/plan-coverage-validator/src/cli.js \
     --task-plan  .aimd/output/task-plan.json \
     --acceptance .aimd/output/acceptance-criteria.json
   ```
   exit 0 = ok / exit 1 = blocking findings (Senior BLOCKER-2 exit code contract).

8. **plan-architect-decisions skill 호출** (ADR 자동 판정 trigger 검출 시).

9. **plan-risk-and-nfr skill 호출** (risk + NFR allocation 채움).

## ★ 70~80% 한계

자동 task 분해 ≥ 70% / 사용자 검토 ≤ 30%. 특히 dependency implicit 의존 추론 + estimation_human 은 ★ 사용자 명시 결단 의무.

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- DEC-2026-05-25-axis-a-phase-4-1 (본격 구현 결단)
- `agents/plan-agent.md` (본 skill 의 caller)
- `schemas/task-plan.schema.json` (산출 schema)
- `tools/plan-coverage-validator/` (검증 도구)
- ADR-CHAIN-001 §1 (이중 렌더링)
- ADR-CHAIN-002 (gate UX)
