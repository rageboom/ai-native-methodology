# Agents Axis — Claude Code plugin 표준 1-depth + sub-agent invocation paradigm

> **runtime axis**: `agents/_base-<name>.md` 1-depth (Claude Code plugin 표준 정합 / install 후 인식)

## 1. paradigm 사실 — 본 plugin 의 agent 자산 본질

본 plugin 의 agents 자산 본질 = **sub-agent invocation paradigm 의 helper 영역 한정**. chain harness 작동의 SSOT 는 [`skills/`](../skills/) 38종 SKILL (1-depth) + chain-driver gate trio. agents 영역은 사용자/메인 agent 가 4원칙 §2 (3-에이전트 토론) 시 호출하는 **specialized sub-agent helper** 영역.

**chain stage 별 agent README 자산 (`agents/{analysis,planning,spec,test,implement,design}/README.md`) = 사상 명세 자산** (chain stage axis 사상 보존). 본 axis 명세 + [`skills-axis.md`](./skills-axis.md) §4 안 chain stage axis 표 영역으로 통합 흡수.

## 2. agents 1-depth 자산 (runtime)

| agent file                                                                                | role                                                                      | model  | sub-agent invocation paradigm                                                                                                                                              |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`agents/_base-senior-engineer.md`](../agents/_base-senior-engineer.md)                   | Senior engineer for design review, ADR decisions, trade-off evaluation    | opus   | 4원칙 §2 (3-에이전트 토론) 시 senior perspective. AI-Native methodology principles (quality 1순위 / 재작업 최소화 2순위 / no-simulation / §8.1 단일 PoC 과적합 회피) 적용. |
| [`agents/_base-industry-case-researcher.md`](../agents/_base-industry-case-researcher.md) | Research how tech companies (FAANG / scale-ups / OSS) solved same problem | sonnet | 4원칙 §2 시 real-world precedent 기반 결단. 가벼운 sub-agent 전략 (Case skip + time cap + priority reads) 적용.                                                            |
| [`agents/_base-official-docs-checker.md`](../agents/_base-official-docs-checker.md)       | Cross-check main agent's claims against official documentation            | sonnet | 4원칙 §2 시 training-corpus dependency 회피. Pattern F-015 cross-validation (main raw fetch → sub-agent cross-check on independent fetch).                                 |

chain stage 별 agent 자산 ❌ (Claude Code 의 skill auto-invocation paradigm + chain-driver gate trio 가 chain stage organize 의 enforcement / agent 자산 의무 ❌).

## 3. invocation paradigm — Claude Code 표준 정합

### 3.1 명시 호출 (`/agents` 또는 Task tool)

```
/agents _base-senior-engineer
```

또는 Claude Code 의 [Task tool](https://code.claude.com/docs) 의 `subagent_type` 필드:

```javascript
Task({
	description: 'Senior review',
	subagent_type: '_base-senior-engineer',
	prompt: '...',
});
```

### 3.2 자동 invocation (description 키워드 매칭)

각 agent 의 frontmatter `description` 영역 키워드가 사용자 prompt 와 매칭 시 자동 invoke. 자세히는 [Claude Code skills.md](https://code.claude.com/docs/en/skills.md) 참조.

### 3.3 4원칙 §2 (3-에이전트 토론) 정합

본 plugin 의 4원칙 (CLAUDE.md 명시) §2 = "에이전트 팀 토론 → research.md 작성 — 3 에이전트 병렬 (공식문서 / 테크기업 사례 / Senior)". 본 3-에이전트 본질 = 본 axis 의 3 \_base agent 정합:

| 4원칙 §2 역할 | agent                            |
| ------------- | -------------------------------- |
| 공식문서      | `_base-official-docs-checker`    |
| 테크기업 사례 | `_base-industry-case-researcher` |
| Senior        | `_base-senior-engineer`          |

## 4. lifecycle stage organize 사상 보존 (사상 axis)

`agents/{analysis, planning, spec, test, implement, design}/README.md` 가 표현했던 사상 = "chain stage 별 agent 자산 분리 사상". 본 사상 본질 = **chain stage 별 자산 (skills + agents + flows + state) 의 axis 정렬 paradigm** ([`lifecycle-contract.md`](./lifecycle-contract.md) 정합).

agent 자산이 \_base 3종만 인 사실 = chain stage 영역의 sub-agent invocation paradigm 의무 ❌ + skills + chain-driver gate trio 가 enforcement 자격 도달. 다만 향후 chain stage 별 agent 자산 신설 시:

- 디렉토리 구조 = **1-depth + category prefix** paradigm 의무 (`agents/discovery-<name>.md` / `agents/spec-<name>.md` / 등)
- 사상 axis 보존 = 본 명세 + skills-axis.md §4 chain stage axis 표 갱신 의무

## 5. 자산 보존 흡수

| 자산                                    | 흡수 영역                                                       |
| --------------------------------------- | -------------------------------------------------------------- |
| `agents/README.md`                      | 본 axis 명세 (paradigm 자료 보존)                              |
| `agents/analysis/README.md`             | skills-axis.md §4 chain stage axis 표 (analysis stage 영역)    |
| `agents/planning/README.md`             | skills-axis.md §4 chain stage axis 표 (discovery stage 영역)   |
| `agents/spec/README.md`                 | skills-axis.md §4 chain stage axis 표 (spec stage 영역)        |
| `agents/test/README.md`                 | skills-axis.md §4 chain stage axis 표 (test stage 영역)        |
| `agents/implement/README.md`            | skills-axis.md §4 chain stage axis 표 (implement stage 영역)   |
| `agents/design/README.md` (placeholder) | 사용자 결단 carry — chain 2 spec vs design 차별화 시점         |

## 6. 참조

- [`skills-axis.md`](./skills-axis.md) — skills 영역 axis 사상 명세 (category prefix paradigm 정합)
- [`lifecycle-contract.md`](./lifecycle-contract.md) — SDLC stage 간 data contract
- [`../README.md`](../README.md) — plugin user 진입점 (시나리오 A/B/C)
- [`../flows/sdlc-4stage-flow.json`](../flows/sdlc-4stage-flow.json) — chain harness master SSOT (6 stage / stages + revisit_edges + 6 gate [#0 analysis soft exit + #1~#5 chain hard] / chain N = gate #N 1:1 INTERNAL CONVENTION)

## 인용

- 결단: DEC-2026-05-14-agents-skills-1-depth-flatten (agents/skills 1-depth flatten paradigm)
- 결단: DEC-2026-06-06-analysis-exit-gate (analysis soft exit gate #0 / sdlc 6 gate)
- ADR: ADR-CHAIN-001~005 (chain harness 5 요소 enforcement)
- ADR: ADR-CHAIN-011 §9 (1-depth vs lifecycle organize 충돌 해소)
