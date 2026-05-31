---
name: plan-risk-and-nfr
description: ★ ★ v9.x MINOR chain 3 (plan) sub-skill. risk 도출 + NFR allocation + rollback 전략 추출. plan-agent 가 호출. NFR allocation hard gate (Plan / Discovery soft 비대칭). Risk 도출 = 3중 망 (LLM + industry-case-researcher + 사람 보강). ISO/IEC 25010:2023 SQuaRE 9 quality characteristic. DEC-2026-05-25-axis-a-phase-4-1 정합.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# plan-risk-and-nfr

★ ★ v9.x chain 3 (plan) 의 **risk + NFR + rollback sub-skill**. task-plan.risks[] + nfr_allocation[] + rollback_strategy 채움.

## 언제 사용

- plan-decompose-and-sequence step 9 에서 자동 호출.
- 사용자가 risk / NFR 보강 시 직접 호출.

## 입력

- `<project>/.aimd/output/task-plan.json` (★ chain 3 진행 중 / tasks[] + adrs[] 채워진 상태)
- `<project>/.aimd/output/acceptance-criteria.json` (★ AC-* / NFR 관련 AC 식별 source)
- `<project>/.aimd/output/analysis-output/static-security.json` (★ analysis stage 산출 / risk source)
- `<project>/.aimd/output/analysis-output/antipatterns.json` (★ AP-* / risk source)

## 산출

- `<project>/.aimd/output/task-plan.json` 안 `risks[]` + `nfr_allocation[]` + `rollback_strategy` 갱신

## ★ ★ ★ NFR allocation hard gate (Plan / Discovery soft 비대칭)

DEC-2026-05-21 §정책3 정합. Discovery (chain 1) = soft gate (NFR 누락 시 `intent: unknown` 표지 carry 허용) / Plan (chain 3) = ★ ★ **hard gate** (NFR allocation 누락 시 진입 차단).

★ ★ Cluster 2 결단 (DEC-2026-05-25-axis-a-phase-4-1) — `severity = critical` 또는 `high` NFR 의 `task_refs[]` 누락 시 `plan-coverage-validator` high finding emit → gate #3 block.

★ ★ ★ ISO/IEC 25010:2023 SQuaRE 9 quality characteristic (★ 2023 신설 = Safety):
- functional_suitability
- performance_efficiency
- compatibility
- usability
- reliability
- security
- maintainability
- portability
- safety ← ★ 2023 신설

공식 출처: https://www.iso.org/standard/78176.html

## ★ severity_floor 사내 해석

`task-plan.schema.json` nfr_allocation[].severity enum (critical / high / medium / low) 의 numeric floor:
- critical = 1.0 (100% coverage 의무)
- high = 0.95
- medium = 0.90
- low = 0.85

★ ★ ★ **출처 명시**: DO-178C 정신 기반 ★ 사내 해석. DO-178C 원본 = objectives count 기반 (DAL A=71 objectives 등) / coverage % 직접 규정 ❌. 본 0.95/0.90/0.85 수치 = 본 plugin 내부 측정치 (DO-178C 직접 인용 ❌ / 공식 docs REVISE-1 흡수).

## ★ ★ Risk 도출 3중 망 (DEC-2026-05-21 §정책6)

| 망 | 책임 | 산출 |
|---|---|---|
| LLM 1차 | 본 skill (LLM) | risks[] 후보 도출 (severity + description + type) |
| industry-case-researcher sub-agent | `agents/_base-industry-case-researcher.md` dispatch | risks[].industry_case_refs[] URL 등 외부 권위 근거 |
| 사람 보강 | 사용자 명시 결단 | risks[].human_review = true (gate #3 통과 자격) |

★ ★ 3중 망 망 부재 시 = `plan-coverage-validator validateRiskSeverity` finding emit (mitigation 누락 medium / human_review 누락 low).

## ★ rollback 전략

DEC-2026-05-21 §plan-risk-and-nfr 정합. 본 task-plan 시행 후 회귀 시 rollback channel.

- `rollback_strategy.strategy` (필수 / 예: 'git revert + feature flag toggle')
- `rollback_strategy.verification` (★ v4.2+ carry — 실제 rollback 가능성 검증 도구)

## 절차

1. **task-plan + acceptance-criteria + static-security + antipatterns 로드**.

2. **NFR 후보 도출** — acceptance-criteria.criteria[] 안 verifiable=false AC (예: "p95 latency < 200ms") + static-security.json critical/high finding + antipatterns.json critical/high AP 모두 NFR 후보:
   - characteristic 매핑 (ISO 25010:2023 9 enum)
   - severity 매핑 (BR/AP severity → critical/high/medium/low)
   - acceptance_criteria_ref (Cluster 4 cross-cut bidirectional link)
   - task_refs (★ hard gate / 누락 시 block)

3. **Risk 도출 3중 망**:
   - LLM 1차 — risk 후보 도출 (severity + description + type)
   - industry-case-researcher sub-agent 호출 — 외부 사례 URL carry (risks[].industry_case_refs[])
   - 사용자 명시 결단 — risks[].human_review = true imperative

4. **rollback_strategy 채움** — 본 task-plan 시행 후 회귀 시 rollback channel.

5. **자동 검증**:
   ```bash
   node tools/plan-coverage-validator/src/cli.js \
     --task-plan  .aimd/output/task-plan.json \
     --acceptance .aimd/output/acceptance-criteria.json
   ```
   `plan.nfr.allocation_missing` high finding + `plan.risk.no_mitigation` / `plan.risk.no_human_review` 확인.

6. **gate #3 호출** — `_base-invoke-go-stop-gate` skill (cluster 5~6 / plan-agent step 종결).

## ★ 70~80% 한계

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

자동 risk + NFR 도출 ≥ 60% / 사용자 검토 ≤ 40%. 특히:
- risk 누락 cost 큼 → 3중 망 본격 시행 의무
- NFR allocation hard gate = critical/high severity 누락 = ★ ★ block (사용자 명시 결단 의무)
- rollback verification = v4.2+ carry (실제 rollback 가능성 검증 도구 부재)

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- DEC-2026-05-25-axis-a-phase-4-1 (본격 구현 결단)
- `agents/plan-agent.md` (본 skill 의 caller)
- `agents/_base-industry-case-researcher.md` (3중 망 보강 sub-agent)
- `schemas/task-plan.schema.json` risks[] + nfr_allocation[] + rollback_strategy (산출 schema)
- `tools/plan-coverage-validator/` (검증 도구 — validateNfrAllocation + validateRiskSeverity)
- ISO/IEC 25010:2023 SQuaRE — https://www.iso.org/standard/78176.html
- DO-178C (정신 기반 / 본 0.95/0.90/0.85 수치 = 본 plugin 내부 측정치 / 원본 직접 인용 ❌)
- ADR-CHAIN-001 §2 (cross-link coverage ratchet)
- ADR-CHAIN-002 (gate UX)
