# agents/ — Sub-agent persona (1-depth flat)

본 디렉토리 = 본 방법론의 cross-cutting agent persona. Claude Code plugin 표준 = 1-depth flat (`agents/<name>.md`). Stage 별 분리 ❌ (lifecycle-contract.md §자산 매핑 매트릭스 §Agent column 정합).

## 자산 매핑 매트릭스 cross-link (★ v3.6.1)

본 agent 자산 = `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 의 **Agent column** detail. 본 매트릭스 8 row 중 cross-cut + stage 영역 인용:

| 본 매트릭스 row | 본 agent 위치 |
|---|---|
| input | (없음 — orchestrate skill 안 dispatch 책임) |
| analysis | `_base-industry-case-researcher.md` + analysis-* skill 안 persona 임베드 |
| planning | `_base-senior-engineer.md` (★ Senior critique 의무 / 2원칙) + planning-* skill 안 임베드 |
| spec / test / implement | (skill 안 persona 임베드 / 별도 agent 파일 ❌ — chain harness skill 자체가 persona 책임) |
| cross-cut (traceability) | `_base-senior-engineer.md` (gate 검토 시 critique 위임) |
| cross-cut (aspects) | `_base-official-docs-checker.md` + `_base-industry-case-researcher.md` (research 트랙 dispatch) |

## 3 base agent persona

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

## paradigm 정합

- **단일 책임**: 각 agent persona = research/critique 등 cross-cutting 책임 1종 / stage 별 책임 ❌
- **호출 패턴**: skill 안 `Task tool` 으로 sub-agent dispatch (또는 Claude Code 자연어 prompt 매칭)
- **결정론 axis 분리**: agent = LLM 의미 영역 / chain-driver = 결정론 영역 ([[feedback_chain_driver_deterministic_axis]] 정합)

## When NOT to use

- skill 내부 persona 임베드 (예: `implement-react` 가 React 전문가 persona 임베드) — 별도 agent 호출 불요
- gate evaluation (결정론 영역) — chain-driver CLI 사용 / agent ❌

## 본체 명세 참조

- `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스
- `methodology-spec/skills-axis.md` §category prefix
- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결
