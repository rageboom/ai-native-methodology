# DEC-2026-05-15 — G2 analysis-from-quad + orchestrate skill 분리 (B') 채택

- **결정일**: 2026-05-15
- **결정자**: 윤주스 (TF Lead)
- **상태**: 종결 (v3.3.0)

## 결정

charter §3 G2 (R8 입력 5종 중 BCDE 미지원) 종결.

- 신규 skill **5종** 신설: `analysis-input-orchestrate` + `analysis-from-{prompt,swagger,plan-doc,figma}`
- 신규 schema **5종** 신설: `input-summary` + `prompt-extract` + `swagger-extract` + `plan-doc-extract` + `figma-extract`
- 신규 test **25 case** (5 case × 5 schema) — schema-validator 회귀 40/40
- `analysis-input-collection` description trigger 한 줄 추가 (multi-source 입력 시 orchestrate 위임)

## 본질 (사용자 3 메타 지적 본격 흡수)

1. **메타 #1** — charter §2 ✅ 판정의 "형식 명시" vs "자산 차원" 구분 누락 risk 노출. (a)(d)(e) 가 자산 부재인데 형식 명시만으로 ✅ 처리한 약점 노출. **자산 대칭 의무** 결단 → 5 skill 신설.

2. **메타 #2** — 복합 입력 흐름 (Figma + Swagger + 자연어 한 발화) 의 mermaid "선택" 점선이 명세 누락 신호 노출. **orchestrator paradigm 채택** → BCDE 4 skill 자동 dispatch + cross-ref + conflict 검출.

3. **메타 #3** — orchestrator 를 기존 `analysis-input-collection` 안 확장은 **단일 책임 위반 (9 책임 누적)** risk 노출. **B' = 별도 skill 분리** (`analysis-input-orchestrate` 신설 / 4 책임 = 파싱 + dispatch + merge + 재확인) 채택. v2.6.0 의미 ID paradigm 정합.

## paradigm 4 결단

| paradigm            | 결단                                           | 근거                                                                                                          |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| orchestrate 분리도  | **1-A 단일 skill (4 책임 응집)**               | Senior critique = pipeline 데이터 의존 / 1인 dogfooding 과적합 회피 / 재사용 신호 ≥ 2 누적 시 1-B 격상 carry  |
| sub-skill 호출 방식 | **Hybrid 2-B 기본 + 2-A escalate**             | ≤ 50K token = 직접 skill chain / > 50K = Task tool / ❌ chain-driver dispatch (STRONG-STOP: 결정론 axis 오염) |
| conflict 검출 산식  | **정량 (Levenshtein + stem set intersection)** | LLM 양심 의존 정성 판정 ❌ / no-simulation 정합                                                               |
| spectral 검증 시점  | **사용자/orchestrate 명시 호출**               | spectral-runner = pure CLI passthrough / auto-invoke 금지 / no-simulation 정합                                |

## 신설 자산 (실측)

- `skills/analysis-input-orchestrate/SKILL.md` ( 신설 / 휴리스틱 + Hybrid rule + 3-tier severity + 정량 산식)
- `skills/analysis-from-prompt/SKILL.md` ( 신설)
- `skills/analysis-from-swagger/SKILL.md` ( 신설 / `@readme/openapi-parser` 의존)
- `skills/analysis-from-plan-doc/SKILL.md` ( 신설 / md + pdf + Notion export)
- `skills/analysis-from-figma/SKILL.md` ( 신설 / Figma desktop selection 사전조건)
- `schemas/input-summary.schema.json` ( 신설 / strict / cross_refs + conflicts + score_components)
- `schemas/prompt-extract.schema.json` ( 신설)
- `schemas/swagger-extract.schema.json` ( 신설)
- `schemas/plan-doc-extract.schema.json` ( 신설)
- `schemas/figma-extract.schema.json` ( 신설)
- `tools/schema-validator/test/input-summary.test.js` + 4 sibling test ( 신설 / 25 case)

## 수정 자산

- `skills/analysis-input-collection/SKILL.md` — description trigger 한 줄 추가 ("For multi-source input, use analysis-input-orchestrate")
- `methodology-spec/workflow/input.md` — "사용자 수동 원칙" → "수동 + skill 호출 + orchestrate 자동 dispatch" 3중 / BCDE 4 skill + orchestrate 등재
- `methodology-spec/plugin-charter.md` §2 R8 ⚠️→✅ + §3 G2 종결 표기 (잔여 G4 > G5 > G1)
- `methodology-spec/skills-axis.md` analysis 22 → 27
- `flows/analysis.phase-flow.json` — phase 0 skill mapping 갱신
- `.claude-plugin/plugin.json` — 3.1.0 → 3.3.0 (v3.2 G3 + v3.3 G2 통합 bump)

## 검증

- schema-validator workspace 40/40 test pass (기존 15 + G2 신규 25)
- 5 skill SKILL.md 형식 정합 (analysis-input-collection / analysis-openapi / planning-identify-business-intent 패턴 일치)
- Senior critique STOP/REVISE 흡수 — STRONG-STOP 1 (2-C 회피) / REVISE 3 (escalate rule 명문화 + schema contract + conflict 정량 모두 본격 흡수)

## 후속 (carry)

- v3.x — `tools/openapi-parser/` wrapper 자산화 (현 = `npx @readme/openapi-parser` 직접 호출)
- v3.x — `analysis-from-figma` MCP 4 도구 실제 호출 e2e smoke (현 = SKILL.md 명세 + schema validate 까지)
- v3.x — orchestrate 통합 test fixture (복합 입력 발화 → 4 산출 → input-summary.json 검증) — 본격 e2e
- v3.x — parse 책임 단독 재사용 신호 ≥ 2 누적 시 1-B (parse / dispatch+merge 2 skill 분리) 격상 검토
- v3.x — Notion export csv 본격 흡수 (현 = path 인덱스만)
- v3.x — interaction / animation / autolayout 세부 영역 = Figma MCP 표면 부재 / 사용자 prompt 보강 paradigm 정착 후 재검토

## 정합 관계

- DEC-2026-05-15-plugin-charter-17-requirements-채택 — charter §3 G2 본격 종결 (잔여 G4 > G5 > G1)
- DEC-2026-05-15-g3-scope-folder-종결 — G3 종결 paradigm 정합 sibling
- v2.6.0 paradigm (`skills-axis.md` §8 phase-N 폐기) — `analysis-from-*` 의미 ID 정합
- ADR-008 v2 (이중 렌더링) — `input-summary.md` 동시 생성 의무 (orchestrate merge 단계)
- ADR-009 (no-simulation) — spectral auto-invoke 금지 + LLM 정성 판정 금지 정합

## Lessons Learned ( paradigm 진화 자산화)

- **LL-G2-01**: charter ✅ 판정 시 "형식 명시" vs "자산 차원" 구분 의무 — ✅ 부여 전 자산 검증.
- **LL-G2-02**: mermaid "선택" 점선이 흐름 명세 누락 신호 — 복합 입력 케이스 = orchestrator 의무.
- **LL-G2-03**: paradigm 결단 시 책임 합산 의무 — 기존 skill N 책임 + 추가 M 책임 = N+M 이 단일 의미 유지하는지 검증.
- **LL-G2-04**: chain-driver 결정론 axis 오염 회피 (STRONG-STOP) — LLM 판단을 CLI 결정론 도구에 inject ❌. Hybrid paradigm (직접 chain + escalate sub-agent / 정량 임계) 가 token + 격리 + axis 분리 3 요건 동시 만족.
- **LL-G2-05**: LLM 양심 의존 정성 판정 회피 — conflict severity 정량 산식 명시 의무 (Levenshtein + stem set / no-simulation 정합).
- **LL-G2-06**: auto-invoke 정책 정합 — 외부 도구 (spectral / parser) 자동 호출 ❌ / 사용자 명시 의무 (사내 spectral-runner README "호출자: auto" 도 carry 표기 정정 의무).
