---
name: plan-architect-decisions
description: v9.x MINOR chain 3 (plan) sub-skill. 아키텍처/기술 결정 도출 + ADR (Architecture Decision Record) 작성 + 기존 코드 integration point 표시. plan-agent 가 호출. ADR 대안 ≥3개 강제 (사후 정당화 회피 / LL-v4.1-04 정합). Nygard 원본 5 category 기반 사내 구체화 + 보안/규제 axis. DEC-2026-05-25-axis-a-phase-4-1 정합.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# plan-architect-decisions

chain 3 (plan) 의 **ADR 작성 sub-skill**. task-plan.adrs[] + integration_points[] 채움.

## 언제 사용

- plan-decompose-and-sequence step 8 에서 자동 호출 (ADR 자동 판정 trigger 검출 시).
- 사용자가 ADR 보강 / 분해 시 직접 호출.

## 입력

- `<project>/.ai-context/base/task-plan.json` (chain 3 진행 중 / tasks[] 채워진 상태)
- `<project>/.ai-context/base/behavior-spec.json` (BHV-\*)
- `<project>/.ai-context/base/acceptance-criteria.json` (AC-\*)
- `<project>/.ai-context/base/analysis-output/*.json` (architecture / domain — integration point source)

## 산출

- `<project>/.ai-context/base/task-plan.json` 안 `adrs[]` 갱신 (schemas/task-plan.schema.json adrs[] 의무)
- 본 ADR 의 source-of-truth = task-plan.adrs[]. 별도 `decisions/DEC-*.md` 작성 = 산업 표준 ADR (Michael Nygard) 정합 권고 (사용자 결단 영역).

## ADR 자동 판정 trigger (Nygard 원본 5 category 기반 사내 구체화)

**공식 출처** = Michael Nygard "Documenting Architecture Decisions" (Cognitect 2011): https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions

Nygard 원본 5 category (`task-plan.schema.json` adrs[].trigger_category enum 정합):

| category                       | enum value                    | Nygard 원본                                     |
| ------------------------------ | ----------------------------- | ----------------------------------------------- |
| Structure                      | `structure`                   | "those that affect the structure"               |
| Non-functional Requirements    | `non_functional_requirements` | "non-functional characteristics"                |
| Dependencies                   | `dependencies`                | "dependencies"                                  |
| Interfaces                     | `interfaces`                  | "interfaces"                                    |
| Construction Techniques        | `construction_techniques`     | "construction techniques"                       |
| **Security / Compliance** 추가 | `security_compliance`         | AWS Prescriptive Guidance 정합                  |

사내 trigger sub-axis (Nygard 원본 직접 인용 ❌ / 사내 구체화):

본 sub-axis 는 본 skill body 안 정의 (schema enum drift attractor 회피 — enumerated count 를 schema 에 명시 ❌):

1. **≥30% task 영향** — `task_refs.length / total_tasks` ratio ≥ 0.30 → ADR 강제 (사내 정의 / 수치 출처 본 plugin 내부 측정치 / Nygard 원본 직접 인용 ❌)
2. **외부 시스템 추가/제거** — 새 service/API/DB/queue/cache 의존성
3. **데이터 모델 변경** — schema migration / breaking column rename / 새 entity
4. **라이브러리/프레임워크 선택** — major dep (예: NestJS vs Express / TanStack Query vs SWR)
5. **async/sync · 모듈 분할 아키텍처 layer 결정** — sync→async / micro-service split / module boundary

5 sub-axis 중 ≥ 1 해당 시 ADR 강제 (`adr_refs` link + alternatives ≥ 3 의무).

## alternatives ≥3 강제 (사후 정당화 회피)

`schemas/task-plan.schema.json` adrs[].alternatives.minItems = 3 schema-level enforce. LLM 사후 정당화 ("이미 결정된 듯한 톤") 회피 paradigm.

각 alternative = `{option, rejection_reason (minLength: 5)}` 의무.

## 절차

1. **task-plan + behavior-spec + acceptance-criteria 로드**.

2. **각 task 마다 trigger 검출** — 5 sub-axis 본 skill body 안 정의 정합 자동 판정.

3. **trigger 해당 task 마다 ADR 작성**:
   - id (ADR-{MODULE}-{NNN})
   - title (한 줄)
   - status (`proposed` default / `accepted` = 사용자 결단 후)
   - decision (결정 내용 5+ 글자)
   - alternatives[] ≥ 3 (option + rejection_reason)
   - consequences {positive[], negative[]}
   - trigger_category (Nygard 원본 5 category + security_compliance enum 중 하나)
   - integration_points (예: src/user/UserService.java:45-60)
   - behavior_refs (adr ↔ behavior 역방향 link)

4. **task.adr_refs 갱신** — task → ADR forward link 채움.

5. **자동 검증** (plan-coverage-validator 통합 검증 단계에서 schema validation 자동):

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/schema-validator/src/cli.js .ai-context/base/task-plan.json
   ```

6. **industry-case-researcher sub-agent 호출 권장** — risk 도출 3중 망 paradigm 안 ADR 대안 도출 보강 (외부 유사 결정 사례 carry).

## 70~80% 한계

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

자동 ADR 작성 ≥ 60% / 사용자 검토 ≤ 40%. 특히:

- alternatives 도출 = LLM 1차 + industry-case-researcher 보강 + 사용자 명시 결단 (3중 망 동형)
- consequences negative 부분 = 사용자 명시 결단 의무 (LLM 자기 비판 weak)
- status `accepted` 전환 = 사용자 명시 결단 영역

## 인용

- 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 (본 skill 의 모 결단)
- 결단: DEC-2026-05-25-axis-a-phase-4-1 (구현 결단)
- `agents/plan-agent.md` (본 skill 의 caller)
- `schemas/task-plan.schema.json` adrs[] (산출 schema)
- `agents/_base-industry-case-researcher.md` (sub-agent 호출 / 3중 망 보강)
- Michael Nygard "Documenting Architecture Decisions" — https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- AWS Prescriptive Guidance ADR process — https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html
- Microsoft Azure Well-Architected ADR — https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record
- ADR-CHAIN-001 (json 단독 / ADR-011)
