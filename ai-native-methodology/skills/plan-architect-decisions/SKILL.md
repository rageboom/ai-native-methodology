---
name: plan-architect-decisions
description: PLACEHOLDER 2026-05-21 (v4.1 paradigm 가시화만). chain (plan) sub-skill. 아키텍처/기술 결정 도출 + ADR (Architecture Decision Record) 작성 + 기존 코드 integration point 표시 전문. plan-agent 가 호출. v4.2+ 본격 구현 carry. ADR 대안 ≥3개 강제 (사후 정당화 회피).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# plan-architect-decisions (PLACEHOLDER 2026-05-21)

> **PLACEHOLDER**: 본 skill 은 v4.1 chain (plan) sub-skill paradigm 정합 가시화 자산. 본격 구현은 v4.2+ carry.
>
> 본 skill 의 모 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 §신설 자산 skills/.

## 책임 범위 (v4.2+ carry)

spec + plan 의 task 분해 결과 입력에서 다음 추출:

| 항목 | 추출 방법 |
|---|---|
| ADR | 되돌리기 어려운 결정 (5 자동 판정 기준) — 각 결정에 대안 ≥3개 + trade-off 명시 |
| Integration point | 기존 코드와의 통합 지점 (target_module + change_type: add/modify/replace + rollback_strategy) |

## ADR 자동 판정 기준 (DEC-2026-05-21 §ADR 자동 판정 정합)

다음 5 기준 중 하나라도 해당 시 ADR 강제:

1. 다른 task 의 ≥30% 에 영향 미치는 결정
2. 외부 시스템 추가/제거
3. 데이터 모델 변경
4. 라이브러리/프레임워크 선택
5. async/sync · 모듈 분할 같은 아키텍처 layer 결정

## 입력

- `.aimd/output/plan-spec.tasks[]` (decompose-and-sequence 산출)
- `.aimd/output/analysis-output/architecture.json` (현 아키텍처 baseline)
- `.aimd/output/discovery-output.json` (UC + intent context)

## 산출

- `plan-spec.adr[]` (ADR-NNN id + decision + context + alternatives[] ≥3개 + consequences + status)
- `plan-spec.integration_points[]` (task_id + target_module + change_type + rollback_strategy)

## 운영 정책 (DEC-2026-05-21 §8 정합)

| # | 정책 | 본 skill 적용 |
|---|---|---|
| 5 | ADR 의무 범위 | 되돌리기 어려운 결정만 (5 자동 판정 기준) |
| (사후 정당화 회피) | 대안 ≥3개 강제 | alternatives 가 1~2개만 나열되면 skill reject + 재추출 요구 |

## carry (v4.2+)

- 본 skill 본격 구현 (ADR 자동 판정 알고리즘 + 대안 도출 + integration point 추출)
- ADR template (plan/ 디렉토리) 신설 (placeholder / plan-agent 본격 구현 시)
- industry-case-researcher sub-agent 호출 통한 외부 유사 결정 사례 carry (대안 도출 보강)
- ADR 사후 정당화 회피 검증 (LLM 의 "이미 결정된 듯한 톤" 감지)

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- `agents/plan-agent.md` (본 skill 의 caller)
- Michael Nygard ADR 산업 표준 (대안 평가 + trade-off 명시 paradigm)
- `agents/_base-industry-case-researcher.md` (대안 도출 보강 sub-agent)
