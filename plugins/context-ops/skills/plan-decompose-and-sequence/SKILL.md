---
name: plan-decompose-and-sequence
description: v9.x MINOR chain 3 (plan) sub-skill. behavior-spec.behaviors[] + acceptance-criteria.criteria[] 입력에서 task 분해 + 의존성 그래프 + 실행 순서 추출. task granularity = 1~3 AC 묶음 (같은 BHV + 같은 layer + 같은 module 강제). plan-agent 가 호출. DEC-2026-05-25-axis-a-phase-4-1 정합.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# plan-decompose-and-sequence

chain 3 (plan) 의 **task 분해 sub-skill**. spec(BHV/AC) → task-plan.tasks[] + dependencies[] + execution_order[].

## 언제 사용

- chain 2 (spec) 종결 + gate #2 go 결단 후 의무.
- plan-agent 가 chain 3 진입 시 step 1 호출.
- 사용자: "task 분해" / "plan 단계 진입" / "의존성 그래프".

## 입력

- `<project>/.ai-context/base/behavior-spec.json` (chain 2 산출 / BHV-\*)
- `<project>/.ai-context/base/acceptance-criteria.json` (chain 2 산출 / AC-\*)
- `<project>/.ai-context/base/discovery-spec.json` (chain 1 산출 / UC + intent context — cross-validation)

## 산출

- `<project>/.ai-context/base/task-plan.json` (schemas/task-plan.schema.json 의무 / tasks[] + dependencies[] + execution_order field)

## task granularity 강제 (1~3 AC 묶음)

task 안 ac_refs.length 1~3 imperative:

- 같은 BHV-\* 안 AC 들만 묶음 (cross-BHV ❌)
- 같은 layer (tech-track 5종 `be` / `fe` / `db` / `e2e` / `infra` 권장 / hexagonal 5종 `domain` / `application` / `infrastructure` / `presentation` / `cross-cutting` = legacy carry) 안 묶음 (cross-layer ❌)
- 같은 module 안 묶음 (cross-module ❌)
- 4+ AC = `plan-coverage-validator validateTaskGranularity` warn (medium / `--strict` 시 high)

## Epic/Story/OP-_/TASK-_ 4-level cascade

본 skill 안 task-plan.json 산출 시 4-level matrix:

| Jira                     | 본 방법론 entity                                             | 정의                                            | 본 skill 책임                                     |
| ------------------------ | ------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------- |
| **Epic**                 | task-plan.epic_refs[]                                        | FE 화면 단위 (UI screen / route)                | screen_id / route 추출 + jira_id (델타 규칙 ↓)    |
| **Story**                | task-plan.story_refs[]                                       | BHV/AC cross-cut anchor (BE+FE/DB/E2E 가로지름) | behavior_ref + ac_refs 묶음 + jira_id (델타 규칙 ↓) |
| **Task** (Story sibling) | task-plan.op_task_refs[] + operational-task.json (별도 산출) | OP-\* (사용자 가시 없는 운영/인프라/마이그레이션 / layer 무관) | OP-\* 검출 + jira_id (델타 규칙 ↓)                |
| **Sub-task**             | task-plan.tasks[]                                            | TASK-\* (1~3 AC 묶음 / layer 분기)              | 본 skill 의 주 산출                               |

본 skill = Sub-task (TASK-\*) 책임 + Epic/Story 식별. ticket 생성/매핑은 ticket-sync skill 책임.

### summary 네이밍 규칙

- **Epic·Story** = 메뉴명·기능명만 — `[Epic]`, `[BHV-*]` 등 브래킷 **절대 금지** (ticket-cascade-builder `validateNoLeadingBracket` 가 빌드 시 throw).
  - `title` 이 비어 있으면 `screen_id` / `behavior_ref` 를 브래킷 없이 그대로 사용 (예: `BHV-CAR-001`).
- **OP-\* / TASK-\*** = `[OP-xxx]` / `[TASK-xxx]` 브래킷 유지.

### jira_id 델타 규칙

`epic_refs/story_refs/op_task_refs` 의 `jira_id` 는 **기존 Jira 티켓 키이면 기입**, 아니면 **빈 값 (ticket-sync 가 신규 생성 후 채움)**.

- **discovery 가 기존 티켓 전달 시** — `discovery-spec.json` use_cases[].`existing_ticket_refs` (level=epic/story + jira_id) 를 본 ref 의 `jira_id` 로 **전파 + `pre_existing=true` set**. → ticket-sync 가 생성 skip, 부모로만 사용 (**없는 티켓만 딴다**).
- **신규 시** — jira_id 미기입 (placeholder ❌ / 빈 채로). ticket-sync 가 cascade 에서 생성.

OP-\* = 운영 작업 anchor (예: argon2 라이브러리 도입 / column migration / cron job) — 본 skill 안 별도 검출 (AC 부재 + 사용자 가시 없음 — analysis 산출물 안 migration-cautions / static-security-spec 검출).

## layer 분기

본 skill 산출 task-plan.tasks[].layer 부여:

| layer         | 산출 의무 추가 필드                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| `be`          | `openapi_endpoint_ref` (path + operationId) required                                                        |
| `fe`          | `component_ref` (package + name + state_map_ref + dtcg_token_set) required                                  |
| `db`          | (선택 / schema migration ref carry)                                                                         |
| `e2e`         | (선택 / e2e test target ref carry)                                                                          |
| `infra`       | (선택)                                                                                                      |
| hexagonal 5종 | legacy carry / backward-compat                                                                              |

schema-level if/then hard gate 적용 (task-plan.schema.json allOf if/then). plan-coverage-validator validateBETaskOpenapiRef + validateFETaskComponentRef 가 추가 finding emit.

## 의존성 graph (DAG)

task.dependencies[] = `["TASK-*"]` (topological order).

implicit 의존 추론 source:

- 같은 DB table 수정 → blocks
- 같은 cache key / 같은 file 수정 → blocks
- code_pointer 동일 range overlap → blocks

> **TASK code_pointers 정책** — TASK 는 `code_pointers_na: true` 기본(의도 노드). 단 **수정 예정 코드 file/range 를 알면 `code_pointers` 를 채워라** — 위 implicit 의존 추론(range overlap → blocks)의 정확도가 올라간다. builder backstop 이 누락 시 na 로 보강하나, code_pointers 를 채우는 편이 dep-graph 활용 가치가 크다.

cycle 시 = `plan-coverage-validator validateDependencyCycle` critical finding (gate #3 block 의무).

## 절차

1. **behavior-spec + acceptance-criteria 로드** — `behaviors[]` + `criteria[]` 파싱.

2. **각 BHV-\* 마다 task 묶음 후보 생성**:
   - AC-\* 들을 layer + module 별 sub-group 분류
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

7. **자동 검증**:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/plan-coverage-validator/src/cli.js \
     --task-plan  .ai-context/base/task-plan.json \
     --acceptance .ai-context/base/acceptance-criteria.json
   ```

   exit 0 = ok / exit 1 = blocking findings (Senior BLOCKER-2 exit code contract).

8. **plan-architect-decisions skill 호출** (ADR 자동 판정 trigger 검출 시).

9. **plan-risk-and-nfr skill 호출** (risk + NFR allocation 채움).

## 70~80% 한계

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

자동 task 분해 ≥ 70% / 사용자 검토 ≤ 30%. 특히 dependency implicit 의존 추론 + estimation_human 은 사용자 명시 결단 의무.

## 인용

- 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 (모 결단)
- 결단: DEC-2026-05-21 §정책4 (1~3 AC granularity)
- 결단: DEC-2026-05-25-axis-a-phase-4-1 (구현)
- 결단: DEC-2026-05-26-ticket-plan-단일 §3 (4-level cascade)
- 결단: DEC-2026-05-26-be-fe-산출물-분리 (layer 분기)
- 결단: DEC-2026-05-26-contract-강제-양-axis §1 (be openapi_endpoint_ref)
- 결단: DEC-2026-06-10-ticket-delta-creation (jira_id 델타 규칙 / 기존 티켓 skip)
- ADR: ADR-CHAIN-001 §1 (json 단독 / ADR-011)
- ADR: ADR-CHAIN-002 (gate UX)
- `agents/plan-agent.md` (caller)
- schema: `schemas/task-plan.schema.json`
- 도구: `tools/plan-coverage-validator/`
