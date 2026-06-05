# agents/ — Sub-agent paradigm (v4.0 multi-agent / DEC-2026-05-17 정합)

본 디렉토리 = 본 방법론의 sub-agent 자산. **stage 별 sub-agent 6종 + design placeholder 1종 + 3 base cross-cutting agent + spike 자산 1종 병존**. Claude Code plugin 표준 = 1-depth flat (`agents/<name>.md`).

## paradigm

- **main agent** = orchestrator (skill 직접 호출 ❌ 권고 / Task tool 로 stage agent dispatch)
- **stage 별 sub-agent 6종 + 1종 placeholder** (`analysis-agent` / `discovery-agent` / `spec-agent` / `plan-agent` / `test-agent` / `implement-agent` + `design-agent` PLACEHOLDER) — 각 chain stage 의 단일 책임 entry point. 6-stage (analysis→discovery→spec→plan→test→implement). plan = HOW 단계(task/ADR/NFR/risk) / skill 3종 body + gate #3 hard gate 활성 (plan-coverage-validator trio). design = 가시화만 / skill 부재.
- **3 base cross-cutting agent** (`_base-senior-engineer` / `_base-industry-case-researcher` / `_base-official-docs-checker`) — research / critique 등 cross-cutting 책임
- **spike agent** (`archive/v4-spike/_spike-planning-agent.md`) — paradigm 가능 입증 자산 / 역사 기록 / EXPERIMENTAL
- **frontmatter `skills: [...]` 사전 주입** — 각 stage agent 가 자기 책임 skill 들을 startup 시점에 인지 (Sub-agents.md spec line 407~429 정합)

## 자산 매핑 매트릭스 cross-link

본 agent 자산 = `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 의 **Agent column** detail.

| 본 매트릭스 row          | 본 agent 위치                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| input                    | `analysis-agent.md` 안 입력 6 skill (input-collection / input-orchestrate / from-{prompt,swagger,plan-doc,figma}) |
| analysis                 | `analysis-agent.md` (chain 1 sub 22 skill + 6 input skill 책임)                                                   |
| discovery                | `discovery-agent.md` (chain 1 / 6 discovery skill[4 어댑터 + 2 공통] + 4 base 책임)                               |
| spec                     | `spec-agent.md` (chain 2 / 3 spec skill + 4 base 책임)                                                            |
| plan                     | `plan-agent.md` (chain 3 / HOW / skill 3종 body + gate #3 hard gate 활성)                                         |
| test                     | `test-agent.md` (chain 4 / 4 test skill + 4 base 책임)                                                            |
| implement                | `implement-agent.md` (chain 5 / 4 implement skill + 4 base 책임)                                                  |
| cross-cut (traceability) | `_base-senior-engineer.md` (gate 검토 시 critique 위임) + `_base-build-traceability-matrix` skill                 |
| cross-cut (aspects)      | `_base-official-docs-checker.md` + `_base-industry-case-researcher.md` (research 트랙 dispatch)                   |

## stage agent 6종 (+ design placeholder)

### `analysis-agent.md` (chain 1 sub)

- **책임**: legacy 코드베이스 분석 + 7대 BE 산출물 + 8 FE 산출물 + finding + antipatterns + migration-cautions
- **skill 사전 주입**: 22 analysis skill + 6 input skill + 3 base utility = 31 skill
- **호출 시기**: main agent 가 "analysis 시작" / "분석 진입" / "legacy 분석" 등 자연어 인지 시 Task tool dispatch

### `discovery-agent.md` (chain 1)

- **책임**: 입력 4종(analysis-output/swagger/figma/nl-md) → discovery-spec.{json,md} (UC-_ + BR-INTENT-_ + cross_links + source_grounded_evidence)
- **skill 사전 주입**: 6 discovery skill(4 어댑터 + discovery-decompose-use-cases + discovery-identify-business-intent) + 4 base utility = 10 skill
- **호출 시기**: chain 1 gate 진입 자연어 trigger 시 (discovery/발견/탐색/planning alias)

### `plan-agent.md` (chain 3 / HOW / gate #3)

- **책임**: spec(BHV/AC) → task-plan (task 분해 / 의존성 / ADR / NFR allocation / risk / rollback)
- **상태**: skill 3종(plan-decompose-and-sequence / plan-architect-decisions / plan-risk-and-nfr) body + `plan-coverage-validator` trio enforcement (chain 3 = gate #3 1:1)

### `spec-agent.md` (chain 2)

- **책임**: behavior-spec + acceptance-criteria (Gherkin BDD) + cross_links 7대 산출물 통합
- **skill 사전 주입**: 3 spec skill + 4 base utility = 7 skill
- **호출 시기**: chain 2 gate 진입 자연어 trigger 시

### `test-agent.md` (chain 4 / RED)

- **책임**: test-spec + 실 test 코드 (RED 의무) + 5종 물증 7 필드
- **skill 사전 주입**: 4 test skill + 4 base utility = 8 skill
- **호출 시기**: chain 4 gate 진입 자연어 trigger 시

### `implement-agent.md` (chain 5 / GREEN)

- **책임**: impl-spec + 실 impl 코드 (GREEN 의무 / 100% test pass) + traceability-matrix 100% green
- **skill 사전 주입**: 4 implement skill + 4 base utility = 8 skill
- **호출 시기**: chain 5 gate 진입 자연어 trigger 시

### `design-agent.md` (PLACEHOLDER — 가시화만 / dispatch 무의미)

- **책임**: design stage 의 단일 책임 entry point (현 책임 ❌)
- **skill 사전 주입**: 없음 (`skills: []` / design-\* skill 미신설)
- **호출 시기**: ❌ 현 시점 dispatch 무의미 (skill 부재 / empty agent). design skill 신설 후 dispatch 가능.

## 3 base cross-cutting agent

### `_base-senior-engineer.md`

- **책임**: Work Principles 2원칙 (research) 의 Senior critique sub-agent / paradigm 결단 시 STOP signal 강도 평가
- **호출 시기**: plan 작성 후 + 시행 진입 전 (Senior critique 가벼운 sub-agent 패턴 / [[feedback_lightweight_sub_agent]])
- **출력 형식**: STRONG-STOP / SOFT-STOP / REVISE / OK 분류 + 근거 3 bullet

### `_base-industry-case-researcher.md`

- **책임**: 외부 framework / library / 도구 paradigm 사실 fetch (research 트랙)
- **호출 시기**: plan 작성 시 외부 사실 인용 의무 / [[feedback_research_fact_validation]] 정합
- **출력 형식**: 출처 URL + 핵심 1-2 bullet / 추정 ❌

### `_base-official-docs-checker.md`

- **책임**: 공식 문서 (React / Vue / Playwright / OpenAPI / 등) 인용 검증
- **호출 시기**: 위와 동일 (research 트랙 sibling)

## spike 자산 (EXPERIMENTAL — archive 이동 / 역사 기록)

### `archive/v4-spike/_spike-planning-agent.md`

- **책임**: multi-agent paradigm 의 가능 입증 자산
- **상태**: archive 위치 — 본 agent paradigm 의 source 자격 보존 / `_` prefix + EXPERIMENTAL 표기 / 별도 산출 디렉토리 (`.aimd/output/_spike/`)
- **호출 가능 여부**: ❌ Claude Code 가 agents/ 의 sub-agent 만 로드 / archive/ 안 자산은 agent dispatch 대상 ❌

## paradigm 정합

- **stage 별 분리** ✅
- **호출 패턴**: main agent → Task tool 로 stage agent dispatch / stage agent 가 자기 frontmatter `skills` 의 skill 들 호출
- **frontmatter `tools`** = Read, Glob, Grep, Bash, Write (`Skill` 명시 불가 — Sub-agents.md spec line 267 / Skill tool 자동 활성 line 272)
- **frontmatter `skills: [...]`** = 사전 주입 paradigm (line 407~429)
- **chain harness mechanical gate trio 보존** = state.blocked + cli exit 2 + PreToolUse deny
- **결정론 axis 분리**: agent = LLM 의미 영역 / chain-driver = 결정론 영역

## 호출 패턴 예시

```
# main agent → stage agent dispatch
main agent → Task(subagent_type="analysis-agent", prompt="""
target: <target-project-dir>
goal: 7대 + 8 FE 산출물 추출
input: legacy code only
expected: .aimd/output/{inventory,architecture,domain,rules,schema,openapi,antipatterns}.json + FE 산출 (있으면)
""")

# 산출물 hand-off via filesystem
main agent → analysis-agent → discovery-agent → spec-agent → plan-agent → test-agent → implement-agent
            (.aimd/output/*.json 매개)
```

## When NOT to use

- **chain stage 외부 작업** — gate evaluation (결정론 영역) = chain-driver CLI 사용 / agent ❌
- **chain harness gate 통과 안 한 임의 코드 생성** = round-trip 정책 위반

## 인용

- 정책: `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스
- 정책: `methodology-spec/skills-axis.md` §skill ↔ agent 매핑
- 결단: DEC-2026-05-17-v4-multi-agent-paradigm-채택 (본 paradigm 의 모 결단)
- 결단: DEC-2026-05-17-spike-planning-agent-실험 (가능 입증 자산)
- 결단: DEC-2026-05-21+DEC-2026-05-23-discovery-stage-v9 (discovery stage 도입)
- 결단: DEC-2026-05-06-round-trip-부분-허용 (gate 내 round-trip 허용)
- ADR: ADR-CHAIN-005 (mechanical gate trio)
