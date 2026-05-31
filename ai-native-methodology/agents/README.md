# agents/ — Sub-agent paradigm (★ v4.0 multi-agent / DEC-2026-05-17 정합)

본 디렉토리 = 본 방법론의 sub-agent 자산. ★ v4.0 paradigm (DEC-2026-05-17-v4-multi-agent-paradigm-채택) — **stage 별 sub-agent 5종 + 3 base cross-cutting agent + spike 자산 1종 병존**. Claude Code plugin 표준 = 1-depth flat (`agents/<name>.md`).

## paradigm (★ v4.0)

- **main agent** = orchestrator (skill 직접 호출 ❌ 권고 / Task tool 로 stage agent dispatch)
- **stage 별 sub-agent 5종 본격 + 2종 placeholder** (`analysis-agent` / `discovery-agent` / `spec-agent` / `test-agent` / `implement-agent` 본격 + `plan-agent` ★ PLACEHOLDER + `design-agent` ★ PLACEHOLDER) — 각 chain stage 의 단일 책임 entry point. ★ v9.0 6-stage (planning→discovery 개칭 + plan 신설 / DEC-2026-05-21+DEC-2026-05-23-discovery-stage-v9). plan = HOW 단계(task/ADR/NFR/risk) / skill 3종 placeholder / hard gate deferred. design = v4.0 가시화만 / skill 부재.
- **3 base cross-cutting agent** (`_base-senior-engineer` / `_base-industry-case-researcher` / `_base-official-docs-checker`) — research / critique 등 cross-cutting 책임
- **spike agent** (`archive/v4-spike/_spike-planning-agent.md`) — paradigm 가능 입증 자산 / 역사 기록 / EXPERIMENTAL (★ ★ ★ v4.0 정식 진입 후 archive 이동 / commit `8605652` 안 source 보존)
- **frontmatter `skills: [...]` 사전 주입** — 각 stage agent 가 자기 책임 skill 들을 startup 시점에 인지 (Sub-agents.md spec line 407~429 정합)

## 자산 매핑 매트릭스 cross-link (★ v3.5.0 → v4.0 갱신)

본 agent 자산 = `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 의 **Agent column** detail. v4.0 안 §Agent column 5 row 본격 재작성 정합.

| 본 매트릭스 row | 본 agent 위치 |
|---|---|
| input | `analysis-agent.md` 안 입력 6 skill (input-collection / input-orchestrate / from-{prompt,swagger,plan-doc,figma}) |
| analysis | `analysis-agent.md` (★ chain 1 sub 22 skill + 6 input skill 책임) |
| discovery | `discovery-agent.md` (★ chain 1 / planning 개칭 / 6 discovery skill[4 어댑터 + 2 공통] + 4 base 책임) |
| spec | `spec-agent.md` (★ chain 2 / 3 spec skill + 4 base 책임) |
| plan | `plan-agent.md` (★ chain 3 / HOW / skill 3종 placeholder / hard gate deferred) |
| test | `test-agent.md` (★ chain 4 / 4 test skill + 4 base 책임) |
| implement | `implement-agent.md` (★ chain 5 / 4 implement skill + 4 base 책임) |
| cross-cut (traceability) | `_base-senior-engineer.md` (gate 검토 시 critique 위임) + `_base-build-traceability-matrix` skill |
| cross-cut (aspects) | `_base-official-docs-checker.md` + `_base-industry-case-researcher.md` (research 트랙 dispatch) |

## stage agent 5종

### `analysis-agent.md` (★ chain 1 sub)
- **책임**: legacy 코드베이스 분석 + 7대 BE 산출물 + 8 FE 산출물 + finding + antipatterns + migration-cautions
- **skill 사전 주입**: 22 analysis skill + 6 input skill + 3 base utility = 31 skill
- **호출 시기**: main agent 가 "analysis 시작" / "분석 진입" / "legacy 분석" 등 자연어 인지 시 Task tool dispatch

### `discovery-agent.md` (★ chain 1 / planning 개칭)
- **책임**: 입력 4종(analysis-output/swagger/figma/nl-md) → discovery-spec.{json,md} (UC-* + BR-INTENT-* + cross_links + source_grounded_evidence)
- **skill 사전 주입**: 6 discovery skill(4 어댑터 + discovery-decompose-use-cases + discovery-identify-business-intent) + 4 base utility = 10 skill
- **호출 시기**: chain 1 gate 진입 자연어 trigger 시 (discovery/발견/탐색/planning alias)
- ★ v9.0 = v4.0 planning-agent 흡수 + 입력 어댑터 paradigm 확장 (DEC-2026-05-21)

### `plan-agent.md` (★ chain 3 / HOW / gate #3 본격)
- **책임**: spec(BHV/AC) → task-plan (task 분해 / 의존성 / ADR / NFR allocation / risk / rollback)
- **상태**: 본격 구현 (v9.1.0 body / v10.0.0 gate #3 hard gate 활성) — skill 3종(plan-decompose-and-sequence / plan-architect-decisions / plan-risk-and-nfr) body + `plan-coverage-validator` trio enforcement (chain 3 = gate #3 1:1)

### `spec-agent.md` (★ chain 2)
- **책임**: behavior-spec + acceptance-criteria (Gherkin BDD) + cross_links 7대 산출물 통합
- **skill 사전 주입**: 3 spec skill + 4 base utility = 7 skill
- **호출 시기**: chain 2 gate 진입 자연어 trigger 시

### `test-agent.md` (★ chain 4 / RED)
- **책임**: test-spec + 실 test 코드 (RED 의무) + 5종 물증 7 필드
- **skill 사전 주입**: 4 test skill + 4 base utility = 8 skill
- **호출 시기**: chain 4 gate 진입 자연어 trigger 시

### `implement-agent.md` (★ chain 5 / GREEN)
- **책임**: impl-spec + 실 impl 코드 (GREEN 의무 / 100% test pass) + traceability-matrix 100% green
- **skill 사전 주입**: 4 implement skill + 4 base utility = 8 skill
- **호출 시기**: chain 5 gate 진입 자연어 trigger 시

### `design-agent.md` (★ ★ ★ PLACEHOLDER — v4.0 가시화만 / dispatch 무의미)
- **책임**: design stage 의 단일 책임 entry point (★ v4.1+ carry / 현 책임 ❌)
- **skill 사전 주입**: ★ 없음 (★ `skills: []` / v4.1+ design-* skill 5~6종 신설 carry)
- **호출 시기**: ❌ 현 v4.0 시점 dispatch 무의미 (skill 부재 / empty agent). v4.1+ design 본격 trigger + skill 신설 후 본격 dispatch 가능.
- **paradigm 정합**: DEC-2026-05-17-v4-multi-agent-paradigm-채택 C-4 옵션 C 본격 시행 (사용자 명시 결단 / paradigm 본질 미충족 인지)

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

## spike 자산 (★ EXPERIMENTAL — archive 이동 / 역사 기록)

### `archive/v4-spike/_spike-planning-agent.md`
- **책임**: v4.0 multi-agent paradigm 의 가능 입증 자산 (★ DEC-2026-05-17-spike-planning-agent-실험 / commit `8605652`)
- **상태**: ★ ★ ★ archive 이동 (2026-05-17 / DEC-2026-05-17-v4-multi-agent-paradigm-채택 C-3 carry 본격 시행) — 본 agent paradigm 의 source 자격 보존 / `_` prefix + EXPERIMENTAL 표기 / 별도 산출 디렉토리 (`.aimd/output/_spike/`)
- **처분**: ★ archive 이동 / agents/ 폴더 가시화 ↓ + 역사 기록 보존 (git history 안 commit `8605652` 영원 보존)
- **호출 가능 여부**: ❌ Claude Code 가 agents/ 의 sub-agent 만 로드 / archive/ 안 자산은 agent dispatch 대상 ❌

## paradigm 정합 (★ v4.0)

- **stage 별 분리** ✅ (★ DEC-2026-05-15-g5 retract / DEC-2026-05-17 정합)
- **호출 패턴**: main agent → Task tool 로 stage agent dispatch / stage agent 가 자기 frontmatter `skills` 의 skill 들 호출
- **frontmatter `tools`** = Read, Glob, Grep, Bash, Write (★ `Skill` 명시 불가 — Sub-agents.md spec line 267 / Skill tool 자동 활성 line 272)
- **frontmatter `skills: [...]`** = 사전 주입 paradigm (★ line 407~429)
- **chain harness mechanical gate trio 보존** = state.blocked + cli exit 2 + PreToolUse deny (★ ADR-CHAIN-005)
- **결정론 axis 분리**: agent = LLM 의미 영역 / chain-driver = 결정론 영역 ([[feedback_chain_driver_deterministic_axis]] 정합)

## 호출 패턴 예시

```
# main agent → stage agent dispatch
main agent → Task(subagent_type="analysis-agent", prompt="""
target: examples/poc-05-sample-user-register
goal: 7대 + 8 FE 산출물 추출
input: legacy code only
expected: .aimd/output/{inventory,architecture,domain,rules,schema,openapi,antipatterns}.json + FE 산출 (있으면)
""")

# 산출물 hand-off via filesystem
main agent → analysis-agent → discovery-agent → spec-agent → plan-agent(placeholder) → test-agent → implement-agent
            (.aimd/output/*.json 매개)
```

## When NOT to use

- **chain stage 외부 작업** — gate evaluation (결정론 영역) = chain-driver CLI 사용 / agent ❌
- **chain harness gate 통과 안 한 임의 코드 생성** = round-trip 정책 위반 (DEC-2026-05-06-round-trip-부분-허용)

## 본체 명세 참조

- `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 (★ v4.0 §Agent column 본격 재작성)
- `methodology-spec/skills-axis.md` §skill ↔ agent 매핑 (★ v4.0 신설)
- DEC-2026-05-17-v4-multi-agent-paradigm-채택 (★ 본 paradigm 의 모 결단)
- DEC-2026-05-17-spike-planning-agent-실험 (★ 가능 입증 자산)
- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (★ ★ ★ retract 대상 — "stage 별 분리 ❌" 폐기)

## 이력 (paradigm 진화)

- **v3.5.0 (DEC-2026-05-15-g5)**: stage 별 분리 ❌ / skill 내부 persona 임베드 paradigm
- **v3.6.x (안정점)**: 본체 paradigm 보존 / spike 없음
- **2026-05-17 spike (DEC-2026-05-17-spike-planning-agent-실험 / commit `8605652`)**: 가능 입증 자산 (옵션 C) — 본격 paradigm 진입 source
- **v4.0.0 (DEC-2026-05-17-v4-multi-agent-paradigm-채택)**: stage 별 분리 ✅ 본격 채택 (옵션 A) / 본 README 재작성
- **v4.0 carry C-3 (2026-05-17 / commit 본 release 흡수)**: spike agent archive 이동 (`agents/_spike-planning-agent.md` → `archive/v4-spike/_spike-planning-agent.md`) / agents/ 폴더 가시화 ↓ + 역사 기록 보존
- **v4.0 carry C-4 옵션 C (2026-05-17 / commit 본 release 흡수)**: `agents/design-agent.md` ★ PLACEHOLDER 신설 (skill 부재 / dispatch 무의미 / v4.1+ design 본격 trigger carry)
