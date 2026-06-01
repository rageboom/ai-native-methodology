# DEC-2026-06-01-json-only-ax-native

> ★ **v12.0.0 MAJOR release SSOT**. 산출물 = **`.json` 단독 (완전 AX-native)** 로 전환 — committed deliverable/phase-flow `.mermaid` + deliverable `.md` dual-rendering twin 을 **전면 폐기**. ADR-008(이중 렌더링 사상) **완전 Superseded** / ADR-002·ADR-009·ADR-FE-002·plugin-charter R7 **Amend** / ADR-011 **신설**.
> 상태: **승인 + 시행 완료** (C1~C8 / 2026-06-02 / 사용자 결단 "json 단독 / 완전 AX"). 시행 chunk C1(`ec8a6f6`)·C2(`17bd6ce`+`aed4d1c`)·DT-json(`3582e10`)·C3(`cb8530d`)·C4(`9f7673a`)·C5(`902e54f`)·C6(`d995516`)·C7(`5363060`)·C8(version 12.0.0) 전부 commit+main FF 완료. ★ C7 figure 삭제 subtree = 사용자 결정으로 DROP(category-C figure 전부 KEEP / drift무관 미관 churn). origin push = 직전 사용자 확인.

## 배경 — two-eyes 사상의 비용·편익 역전

ADR-008 "이중 렌더링 사상"(2026-04-30)은 모든 산출물을 단일 진실(SSOT)에서 출발해 **두 청중** — AI 눈(`.json`/`.yaml`) + 사람 눈(`.md`/`.mermaid`) — 에게 동시 산출했다. v11.7.0 이후 P0 가 **"AX 운영"**(산출물 = LLM 의 운영 컨텍스트 그 자체 / DEC-2026-05-30-use-scenario-taxonomy)으로 이동하면서 본 사상의 비용·편익이 역전되었다.

## 실측 (2026-06-01 / 2 distinct domain — RealWorld Spring/MyBatis + ecommerce NestJS/Prisma)

- LLM·모든 검증 도구는 **`.json`(SSOT)** 을 입력으로 읽는다. `.md`/`.mermaid` 는 **생성-전용 사람-눈 미러**로, 어떤 도구도 입력으로 읽지 않는다 (matrix.md/manifest.md = write-only / validator = json read / stage 간 data contract = json).
- 따라서 `.md`/`.mermaid` twin 은 LLM 운영 컨텍스트에 **0 기여** (삭제해도 무손실 / 유지해도 LLM 무관).
- 동시에 dual/triple-rendering 은 **2차 렌더링 drift 표면**을 만든다 (ADR-009 §1.1 메커니즘 #5). `.mermaid` 는 LLM ROI 최저(표 ★★★ > 자연어 ★★ > Mermaid ★)이면서 drift 위험만 더했다.

## 결정

**committed deliverable/phase-flow `.mermaid` + deliverable `.md` dual-rendering twin 을 전면 폐기하고, 산출물을 `.json` 단독 SSOT 로 전환한다.** (상세 = ADR-011)

1. `.mermaid` 전면 제거 (deliverable + flows/*.phase-flow.mermaid). drift-validator `.json↔.mermaid` 모듈 제거.
2. deliverable `.md` dual-rendering twin 전면 제거. skill/agent/builder = **편집**(emit 만 제거 / 자산 존속 / `.json` 생성 유지).
3. cosmetic 흡수 — `.mermaid` 에만 있던 표현(erd 관계 동사 / arch edge 라벨)은 additive JSON 필드(`foreign_keys[].relationship_label` / `dependencies[].note`·`detail`)로 흡수 후 삭제 (정보 무손실).
4. standalone `.md` 산출물 json 化 — `migration-cautions.md` → `migration-cautions.json`.
5. consumed functional `.md` json 전환 — `intent-vs-bug` 분류 데이터 → `characterization-spec.json` 소비.
6. artifact rename-drift = JSON-only 재구현 — `check-handoff-consistency.js` + `flows/artifact-registry.json` (구 `.json↔.mermaid` filename drift 검사 moot / ★ 1:1 replacement 아님 — 상보적 cross-stage handoff 체크).
7. 사람 눈 = on-demand viz (view-time 렌더링) — 현 시점 **DEFER** (carry `C-on-demand-viz` / 사람 gate-검토는 당분간 raw json).

### 유지 (폐기 아님)
방법론 본체 `.md`(CLAUDE.md/README/docs/adr/methodology-spec/guides/briefing) + audit registry(findings.md/poc-findings.md) + functional consumed report(tree.md/stack-detection.md/검증 리포트 = dual-rendering twin 아님 / 향후 carry).

## 거버넌스 영향 (ADR matrix)

| ADR / 문서 | 처분 | action |
|---|---|---|
| **ADR-008** 이중-렌더링 | **Superseded(완전)** | header `Superseded by ADR-011` + banner / body 역사 보존. |
| **ADR-002** 7대 산출물 | **Amend** | 7대 산출물 표 "AI용/사람용" → "json 단독"(사람용 column 폐기). figure = LEAVE(역사). |
| **ADR-009** 신뢰 모델 | **Amend-only (supersede ❌)** | retitle "다이어그램 → 산출물 신뢰 모델". §2.3 `.json↔.mermaid` rung + §2.4 FE diagram = moot. ladder = artifact-level 재해석. ★ §2.1/§2.2 도구 종류 + no-simulation SSOT **UNCHANGED**. |
| **ADR-FE-002** FE 이중렌더링 | **Amend** | state-map/component-tree/user-flows `.mermaid`/`.md` 사람눈 retire. §2.3 visual snapshot-PNG hash = UNAFFECTED(`.mermaid` 무관). |
| **plugin-charter R7** | **Amend (R-level / 본 DEC 명기)** | manifest 이중 렌더링(`manifest.json`+`manifest.md`) → `manifest.json` 단독. |
| **ADR-CHAIN-011** BR dual-rep | **무관/무편집** | BR TEXT(NL+GWT) — diagram 아님 / ADR-011 non-goal 1줄. |
| **ADR-011** | **신설** | `docs/adr/ADR-011-json-only-ax-native.md` — 단일 json 렌더링(AX-native). |

## 시행 chunk (C1~C8)

- **C1** (`ec8a6f6`): schema ADDITIVE — cosmetic 흡수처(relationship_label/note/detail) + `migration-cautions.schema.json` 신설.
- **C2** (`17bd6ce`+`aed4d1c`): skill/agent/builder `.mermaid`+`.md` twin emit 중단 + 인용 제거 + ADR-011 신설.
- **DT-json** (`3582e10`): decision-table grid → formal-spec.json `decision_grids[]` 흡수 (DMN-inspired / 문서용 / `.md` redundant 化).
- **C3** (`cb8530d`): 원자 BREAKING cut — drift-validator pair-mode 폐기 + JSON-only handoff detector + artifact-registry.
- **C4** (`9f7673a`): `.mermaid`+`.md` twin 파일·flow 토큰·template 삭제 + check21 finalize.
- **C5** (`902e54f`): schema `.mermaid`/`.md` path 필드 제거(7 schema) + 실 산출물 data 재emit(23 examples) + cosmetic 흡수(poc-01 9 FK relationship_label / erd verb git 복원).
- **C6** (본 DEC): 거버넌스 — ADR-008 supersede + ADR-002/009/FE-002/charter R7 amend + DEC + INDEX.
- **C7** (차기): lifecycle-contract 대수술 + deliverables spec json-only + category-C inline figure 삭제.
- **C8** (차기): version 12.0.0 3-way(plugin+package+CHANGELOG+CLAUDE) + STATUS/INDEX + 최종 검증.

## §8.1 / 정직 표기

- **two-eyes 완전 역전** — 본 결정은 ADR-008 의 "AI 눈 + 사람 눈" 사상을 완전 역전(사람-눈 채널 retire)한다. corrective drift 아니라 **P0(AX 운영) 이동 + LLM-무관 실측 paradigm maturation**. 2 distinct domain corroboration (RealWorld/MyBatis + ecommerce/Prisma) = §8.1 단일 PoC 과적합 회피.
- **사람 gate-검토 ergonomics 저하 = honest carry** — gate #1~#5 사람 검토가 prose `.md` → raw `.json`. 완화 = on-demand viz (DEFER).
- **1-session-1-MAJOR cap** (LL-v930-02) — v12.0.0 = 단일 MAJOR (C1~C8 동일 MAJOR 의 chunk).

## 검증 (C5 시점)
workspace 1015/0 · release:check 30/30 · drift 4-flag exit 0 · examples+dogfood grep gate 0 잔존 · ajv before-after = 제거 필드만큼 위반 감소 + cosmetic schema-valid.

## carry
- C7/C8 시행 (lifecycle-contract·deliverables·figure / version 12.0.0).
- poc-03 `.validation/drift-result.json` stale `mermaidPath` (pair-mode era 생성 artifact) → C7/C8 일괄 (사용자 defer).
- `C-on-demand-viz` (사람 눈 view-time 렌더링 / md-render-on-read CLI) — DEFER.

## 참고
- ADR-011 (본 DEC 자식 ADR)
- ADR-008 (Superseded) / ADR-002·ADR-009·ADR-FE-002 (Amend)
- DEC-2026-05-30-use-scenario-taxonomy (P0 AX 운영)
- master plan `~/.claude/plans/serialized-exploring-stonebraker.md`
