---
name: plan-decompose-and-sequence
description: PLACEHOLDER 2026-05-21 (v4.1 paradigm 가시화만). chain (plan) sub-skill. spec(BHV/AC) 입력에서 task 분해 + 의존성 그래프 + 실행 순서 추출 전문. plan-agent 가 호출. v4.2+ 본격 구현 carry. task granularity = 1~3 AC 묶음 (같은 BHV + 같은 layer + 같은 module).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# plan-decompose-and-sequence (PLACEHOLDER 2026-05-21)

> **PLACEHOLDER**: 본 skill 은 v4.1 chain (plan) sub-skill paradigm 정합 가시화 자산. 본격 구현은 v4.2+ carry.
>
> 본 skill 의 모 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 §신설 자산 skills/.

## 책임 범위 (v4.2+ carry)

spec(BHV/AC) 입력에서 다음 추출:

| 항목 | 추출 방법 |
|---|---|
| Task | 1~3 AC 묶음 = 1 task (같은 BHV + 같은 layer + 같은 module 강제) |
| Dependency | task 간 선후관계 (`blocks` / `requires` / `shares-state`) — 명시적 + implicit 의존 감지 |
| Execution order | topological sort + 비즈니스 우선순위 + 병렬 가능 여부 |

## 입력

- `.aimd/output/behavior-spec.json` (BHV-*)
- `.aimd/output/acceptance-criteria.json` (AC-*)
- `.aimd/output/discovery-output.json` (UC + intent context)
- `.aimd/output/analysis-output/*.json` (architecture / domain — implicit 의존 추론 source)

## 산출

- `plan-spec.tasks[]` (T-NNN id + bhv_refs[] + ac_refs[] + estimated_size)
- `plan-spec.dependencies[]` (from / to / type)
- `plan-spec.execution_order[]` (phase + task_ids[] + parallel 여부)

## 운영 정책 (DEC-2026-05-21 §8 정합)

| # | 정책 | 본 skill 적용 |
|---|---|---|
| 4 | Task granularity | 1~3 AC 묶음 강제 (자동 묶음 후 사용자 review) |
| 7 | Estimation | `estimation_ai` 산출 + `estimation_human` 별도 필드 (참고용 라벨 강제) |

## carry (v4.2+)

- 본 skill 본격 구현 (AC 묶음 알고리즘 + 의존 추론 + topological sort)
- plan-spec 산출 schema 신설 (placeholder / 본격 구현 시) — tasks / dependencies / execution_order 정의
- implicit 의존 감지 (같은 DB table / 같은 cache key / 같은 file 수정) — analysis 산출물 cross-reference
- 사용자 review gate (task 묶음 단위 / 의존 그래프 확정)

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- `agents/plan-agent.md` (본 skill 의 caller)
- ADR-CHAIN-001 (이중 렌더링)
