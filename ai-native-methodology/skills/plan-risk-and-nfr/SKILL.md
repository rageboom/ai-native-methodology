---
name: plan-risk-and-nfr
description: PLACEHOLDER 2026-05-21 (v4.1 paradigm 가시화만). chain (plan) sub-skill. risk 도출 + NFR allocation + rollback 전략 추출 전문. plan-agent 가 호출. v4.2+ 본격 구현 carry. NFR 게이트 = hard (allocation 필수 / Discovery soft 와 비대칭). Risk 도출 = LLM + industry-case-researcher + 사람 보강 (3중 망).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# plan-risk-and-nfr (PLACEHOLDER 2026-05-21)

> **PLACEHOLDER**: 본 skill 은 v4.1 chain (plan) sub-skill paradigm 정합 가시화 자산. 본격 구현은 v4.2+ carry.
>
> 본 skill 의 모 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 §신설 자산 skills/.

## 책임 범위 (v4.2+ carry)

spec + plan 의 task 분해 결과 + discovery-output 의 NFR 입력에서 다음 추출:

| 항목 | 추출 방법 |
|---|---|
| Risk | 기술적/비즈니스 위험 — LLM 1차 + industry-case-researcher 사례 + 사람 보강 (3중 망) |
| NFR allocation | discovery NFR → task 분배 (budget + verification_method) |
| Rollback strategy | integration_points 별 실패 시 되돌리기 전략 (필수 필드) |

## 입력

- `.aimd/output/plan-spec.tasks[]` (decompose-and-sequence 산출)
- `.aimd/output/plan-spec.integration_points[]` (architect-decisions 산출)
- `.aimd/output/discovery-output.nfr[]` (Discovery 어댑터 산출 — soft 게이트)
- `.aimd/output/analysis-output/*.json` (architecture / domain — 통합 영향 분석 source)

## 산출

- `plan-spec.risks[]` (R-NNN id + description + likelihood H/M/L + impact H/M/L + mitigation + owner_role)
- `plan-spec.nfr_allocation[]` (nfr_ref + task_id + budget + verification_method)
- `plan-spec.integration_points[].rollback_strategy` (필수 필드 — 누락 시 skill reject)

## 운영 정책 (DEC-2026-05-21 §8 정합)

| # | 정책 | 본 skill 적용 |
|---|---|---|
| 3 | NFR 게이트 = hard | NFR allocation 누락 시 진입 차단 (Discovery soft 와 비대칭) |
| 6 | Risk 도출 = 3중 망 | LLM 1차 → industry-case-researcher 사례 carry → 사람 보강 gate (필수) |
| (Rollback 강제) | rollback_strategy 필수 필드 | integration_points 별 누락 시 reject |

## carry (v4.2+)

- 본 skill 본격 구현 (risk 도출 알고리즘 + NFR allocation 매핑 + rollback 전략 추출)
- risk-register template (plan/ 디렉토리) 신설 (placeholder / plan-agent 본격 구현 시)
- industry-case-researcher sub-agent 호출 정형화 (risk generic 회피 / 도메인 특화 사례)
- NFR unknown 처리 (Discovery 에서 unknown 표지로 carry 된 경우 — Plan 에서 사용자 명시 요구)
- rollback verification (실제 rollback 가능성 검증 도구 carry)

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- `agents/plan-agent.md` (본 skill 의 caller)
- `agents/_base-industry-case-researcher.md` (risk 도출 3중 망 carry)
- `agents/_base-senior-engineer.md` (risk gate 검토 / Senior critique 패턴)
