# DEC-2026-05-15 — G5 lifecycle-contract 자산 매핑 매트릭스 종결

- **결정일**: 2026-05-15
- **결정자**: 윤주스 (TF Lead)
- **상태**: 종결 (v3.5.0)

## 결정

charter §3 G5 (R12 lifecycle stage↔asset 매핑표 부재) 종결.

- `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 신설
- **본 매트릭스** = stage × (agent / skill / hook / tool/validator) 5 column × 8 row (input + analysis + planning + spec + test + implement + cross-cut traceability + cross-cut aspects)
- **부 매트릭스** = R8 입력 5종 detail (a~e + orchestrator) — 본 매트릭스 input row 의 펼침 매핑
- **Scenario cross-link** = be-fe-separation.md §6 (Scenario A/B/C × IR 4계층) 와 axis 분리 명시

## paradigm 결단 (사용자 결단 2026-05-15)

| 의제         | 결단                                         | 근거                                                                                  |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| Column 5     | **agent / skill / hook / tool/validator** ✅ | charter §3 G5 원안 정합                                                               |
| Row 분리도   | **단일 row + 부 매트릭스** ✅                | row 비대화 회피 (4 row 추가 ❌) + orchestrate 자연 응집 + BCDE detail 분리 = ROI 최적 |
| version 라벨 | **v3.5.0 MINOR** ✅                          | G5 종결 = MINOR (G2/G4 일관)                                                          |

## 본 매트릭스 8 row

| Stage / Cross-cut      | 본질                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| input (analysis 진입)  | BCDE 입력 흡수 + orchestrator dispatch                                  |
| analysis (chain 1 sub) | 22 skill (chain 0 sub) — 7대 + 8 FE + aspect + br-cross + html-template |
| planning (chain 1)     | UC / BR-INTENT 추출 + planning-spec                                     |
| spec (chain 2)         | behavior + AC + 7대 통합                                                |
| test (chain 3)         | RED test 코드 + 5종 물증                                                |
| implement (chain 4)    | GREEN impl 코드 + 100% pass                                             |
| cross-cut traceability | UC→BHV→AC→TC→IMPL forward+backward link                                 |
| cross-cut aspects      | a11y / i18n / static-security / legacy                                  |

## 부 매트릭스 6 row (R8 입력 axis)

| R8 종류         | skill                        | 의존 도구                                  | 산출 schema      |
| --------------- | ---------------------------- | ------------------------------------------ | ---------------- |
| (a) 코드        | `analysis-input-collection`  | git + Glob/Grep + ADR-010 baseline         | input.json       |
| (b) Figma       | `analysis-from-figma`        | mcp**figma-desktop**\* 4 도구              | figma-extract    |
| (c) Swagger     | `analysis-from-swagger`      | @readme/openapi-parser                     | swagger-extract  |
| (d) plan-doc    | `analysis-from-plan-doc`     | Read PDF + remark + adm-zip + csv-parse    | plan-doc-extract |
| (e) prompt      | `analysis-from-prompt`       | (Claude only)                              | prompt-extract   |
| ( orchestrator) | `analysis-input-orchestrate` | (BCDE dispatch + merge / Hybrid 2-B + 2-A) | input-summary    |

## 신설 자산

- `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 ( 신설 / 본 매트릭스 + 부 매트릭스 + Scenario cross-link + 사용 가이드)

## 수정 자산

- `methodology-spec/plugin-charter.md` §1 R12 ⚠️→✅ + §2 요약 (✅ 14 / ⚠️ 1 / ❌ 2) + §3 G5 종결 (잔여 G1 단독)
- `.claude-plugin/plugin.json` 3.4.0 → 3.5.0

## 검증

- lifecycle-contract.md 본문 정합 (기존 5 영역 axis + 기술 스택 분기 axis 보존 + 신규 §자산 매핑 매트릭스 추가)
- skills-axis.md / be-fe-separation.md cross-link 유효
- 신규 작업 없음 (skill / schema / test 신설 ❌ / 본 G5 = 단순 문서 보강)

## 후속 (carry)

- v3.x — agent persona README 정합 갱신 (`agents/<stage>/README.md` 안 본 매트릭스 인용 추가)
- v3.x — validator 별 사용 가이드 1장 (각 tool README 본 매트릭스 인용)
- v4.x — G1 ITSM/Jira 자동 티켓화 (단독 잔여 / 후순위)

## 정합 관계

- DEC-2026-05-15-plugin-charter-17-requirements-채택 — charter §3 G5 본격 종결 (잔여 G1 단독)
- DEC-2026-05-15-g3-scope-folder-종결 — G3 sibling
- DEC-2026-05-15-g2-orchestrate-skill-분리-채택 — G2 sibling
- DEC-2026-05-15-g4-fe-skill-track-종결 — G4 sibling
- v2.6.0 paradigm (skills-axis.md §category prefix / 의미 ID 정합)
- be-fe-separation.md (Scenario × IR 4계층 / axis 분리)

## Lessons Learned ( paradigm 진화)

- **LL-G5-01**: 매핑 매트릭스 신설 시 row 분리도 결단은 **사용자 진입 가이드 ↑** vs **매트릭스 시야 ↓** 사이 trade-off. row 비대화 회피 + 부 매트릭스 분리 = ROI 최적. G2 LL-G2-03 (책임 합산 의무) + G4 LL-G4-02 (분리 vs 본문 분기 = 3축 평가) 의 단순 문서 영역 응용.
- **LL-G5-02**: charter §3 종결 자산 = 매트릭스 1장 정도라도 **단일 SSOT 확립 가치** 큼. 이전엔 `skills-axis.md` + `be-fe-separation.md` + `flows/*` 흩어진 자산을 사용자가 cross-read 의무. 본 매트릭스 = 1장에서 stage 진입 시 어떤 자산 호출할지 즉답.
