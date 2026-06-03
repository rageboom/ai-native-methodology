# DEC-2026-05-15 — G4 FE skill 보강 종결 (후보 C / 4 skill + RTL 본문 분기)

- **결정일**: 2026-05-15
- **결정자**: 윤주스 (TF Lead)
- **상태**: 종결 (v3.4.0)

## 결정

charter §3 G4 (R14 BE/FE 자산 비대칭 / FE skill 보강) 종결.

**후보 C 채택** = 4 skill 신설 + 기존 `test-generate-test-spec` 본문 분기 추가:

- 신규 skill 4종: `implement-react` / `implement-vue` / `test-playwright` / `analysis-html-template`
- 신규 schema 1종: `html-template-extract.schema.json`
- 본문 분기 추가: `test-generate-test-spec/SKILL.md` (RTL + Vue Test Utils + Playwright 위임 reference)
- 신규 test 5 case (workspace 40 → 45/45 pass)

## paradigm 결단 (Senior critique 흡수)

| paradigm                            | 결단                                                                                                       | 근거                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| paradigm 후보                       | **C** (4 skill + RTL 본문 분기)                                                                            | `test-jest` 중복 회피 / BE 트랙 paradigm 일관 / 본문 비대화 risk 회피               |
| Vue 1차 지원                        | **Vue 3 만**                                                                                               | Vue 2 legacy = carry / Composition API + `<script setup>` 우선                      |
| Scenario B `/analyze-fullstack`     | **G6 carry**                                                                                               | 명령어 axis ≠ skill axis (G4) / axis 별 진화 분리                                   |
| JSP scriptlet 정책                  | **scriptlet 0 absolute**                                                                                   | JSP 2.0 / Servlet 2.4 (2003) 이후 deprecated paradigm 정합                          |
| `analysis-html-template` 매핑 phase | **신규 phase `template-analyze` 신설**                                                                     | input phase 부담 ↓ / Scenario C 만 활성 / drift-validator 3-way 추적 명확           |
| JSP/Thymeleaf 정량 검출             | **진짜 외부 도구 의무** (SonarQube `Web:JspScriptletCheck` `rspec-1459` `rspec-1932` / PMD JSP / jsp-lint) | LLM 양심 count ❌ (Senior STRONG-STOP risk / -5%p 패널티 회피 / no-simulation 정합) |

## 사용자 메타 발견 본격 흡수

1. **메타 #1** — charter §3 G4 표 = 5 skill 안 (`FE-impl-react` / `FE-impl-vue` / `FE-test-jest` / `FE-test-playwright` / `design-html-template-analyze`). 본 plan 1원칙 단계에서 `FE-test-jest` 중복 risk 발견 (기존 `test-generate-test-spec` 이 이미 jest/vitest 본문 분기 보유).
2. **2원칙 research 정정** — plan 의 "React 19 class component 분기 폐기" 추정 = research 흡수로 정정 (class 도 ref 전달 가능 / mechanism 다름 / class 폐기 ❌). 또 plan 의 동기 `userEvent.type` 예시 = userEvent v14 async 의무 위반 → 수정.
3. **Senior critique** — `implement-react` 4 책임 (ref/hooks/jsx-tsx/functional) = 단일 의미 sub-paradigm 변주 (분리 ❌ / C 유지 ✅).

## 신설 자산 (실측)

- `skills/implement-react/SKILL.md` ( 신설 / React 19 paradigm + class 분기 보존 + 신규 hooks + schema marker `react_version: "19"`)
- `skills/implement-vue/SKILL.md` ( 신설 / Vue 3 only / Composition API + `<script setup>` / Options API legacy 분기 본문)
- `skills/test-playwright/SKILL.md` ( 신설 / POM 분리 / web-first assertion / parallel + shard / `npx playwright install` 의존 명시)
- `skills/analysis-html-template/SKILL.md` ( 신설 / 외부 도구 의무 / JSP 2.0 기준점 / scriptlet 0 absolute)
- `schemas/html-template-extract.schema.json` ( 신설 / strict / external_tool_output.executed required / scriptlet_findings + xss_markers + policy_check)
- `tools/schema-validator/test/html-template-extract.test.js` ( 신설 / 5 case)

## 수정 자산

- `skills/test-generate-test-spec/SKILL.md` — `## 기술 스택 분기` 섹션에 jest+RTL (React 19 / userEvent v14 async / getByRole 1순위) + vitest+Vue Test Utils (Vue 3 / @vue/test-utils 2.x) + Playwright 위임 reference 추가
- `methodology-spec/plugin-charter.md` §2 R14 ⚠️→✅ + §3 G4 종결 (잔여 G5 > G1)
- `methodology-spec/skills-axis.md` analysis 27 → 28 / implement 2 → 4 / test 3 → 4
- `flows/test.phase-flow.json` (test-playwright skill mapping)
- `flows/implement.phase-flow.json` (implement-react / implement-vue skill mapping)
- `flows/analysis.phase-flow.json` (신규 phase `template-analyze` + analysis-html-template)
- `.claude-plugin/plugin.json` 3.3.0 → 3.4.0

## 검증

- schema-validator workspace 40 → **45/45 test pass**
- 5 SKILL.md 형식 정합 (frontmatter / 사전 조건 / 절차 / 산출물 / When NOT to invoke)
- Senior critique REVISE 2건 흡수 (B4 진짜 도구 의무 + LL-G4-03 schema marker)

## 후속 (carry)

- v3.x — Vue 2 legacy 분기 (`implement-vue-2` 별도 skill)
- v3.x — React 18 분기 (`implement-react-18` 별도 skill / forwardRef 패턴 보존)
- v3.x — `implement-svelte` / `implement-solid` (other FE framework)
- v3.x — form action 분산 anti-pattern 자체 grep rule 본격 (현 = 출처 미확인 carry)
- v4.x — **G6 `/analyze-fullstack`** (Scenario B 통합 명령어 / Next.js API route 양쪽 인식 / be-fe-separation.md §4.1 D25 carry)

## 정합 관계

- DEC-2026-05-15-plugin-charter-17-requirements-채택 — charter §3 G4 본격 종결 (잔여 G5 > G1)
- DEC-2026-05-15-g2-orchestrate-skill-분리-채택 — paradigm 진화 sibling (G2 후속)
- DEC-2026-05-15-g3-scope-folder-종결 — G3 종결 paradigm 정합
- v2.6.0 paradigm (의미 ID — `implement-react` / `implement-vue` / `test-playwright` / `analysis-html-template` slot)
- ADR-CHAIN-001 §1 (이중 렌더링 chain 4) + §6 (no-simulation 강화)
- ADR-009 (no-simulation / 외부 도구 auto-invoke 금지)

## Lessons Learned ( paradigm 진화 자산화)

- **LL-G4-01**: charter §3 후속 표는 "후보 안" — 본격 1원칙 plan 단계에서 기존 자산과 중복 평가 의무.
- **LL-G4-02**: paradigm 분리 vs 본문 분기 결단 시 자산 비대화 + drift 추적 + 명시성 3축 평가.
- **LL-G4-03 ( Senior 흡수)**: framework 본문 분기 paradigm 충돌 (예: React 18 forwardRef vs React 19 ref prop) 시 RED test fixture = 판단 기준 + schema marker (`react_version: "19"`) 의무.
- **LL-G4-04 ( research 정정)**: 외부 framework 사실 (React 19 forwardRef 폐기 / userEvent v14 async / Playwright POM assertion 분리 등) 추정 ❌ — research 실 fetch 의무.
- **LL-G4-05 ( Senior STRONG-STOP)**: 정성 검출 (scriptlet count / form action 분산) = **반드시 진짜 외부 도구 실행** (PMD / SonarQube / 등). LLM 본문 분기 양심 정량 = no-simulation -5%p 패널티.
