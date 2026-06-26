# DEC-2026-05-06-sub-plan-4-종결

- 일자: 2026-05-06
- 카테고리: methodology / v2.0 sub-plan / chain stage skills + flows + agents
- 결정자: 윤주스 (TF Lead)
- 상태: 승인 ( sub-plan-4 종결 / 13 chain skill 신설 / 5 flow 신설 / 4 agent README 정식 채움 / unit test 138 / no release)
- 관련: ADR-CHAIN-001~004, DEC-2026-05-06-v2.0-i-strict-채택, DEC-2026-05-06-sub-plan-3a-종결, DEC-2026-05-06-sub-plan-3b-종결, master plan `~/.claude/plans/a-stateful-gadget.md` (γ hybrid Sprint M+4), sub-plan `~/.claude/plans/sub-plan-4-skills-flows.md` ( 신설), 직전 commit `c364c05` (sub-plan-3b 종결)

## 컨텍스트

sub-plan-3b 종결 commit (`c364c05`) 후속. ADR-CHAIN-001~004 + 11 chain validator + 7 chain schema = sub-plan-4 진입 prerequisite 4/4 충족. 본 sub-plan-4 = chain harness 운영 인터페이스 (skills + flows + agents) 정식 채움.

## 결정

sub-plan-4 종결. 10 항목 모두 통과.

### 산출물 (본 commit)

| 영역                                                    | 신설                                                                                                  | 갱신                                         |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `skills/_base/`                                         | build-traceability-matrix / invoke-go-stop-gate ( +2)                                                 | —                                            |
| `skills/planning/`                                      | extract-from-legacy / decompose-use-cases / identify-business-intent ( +3)                            | README placeholder 보존                      |
| `skills/spec/`                                          | compose-behavior-spec / derive-acceptance-criteria / integrate-deliverables ( +3 / 신규 디렉토리) | —                                            |
| `skills/test/`                                          | generate-test-spec / run-test-evidence / verify-coverage ( +3)                                        | README placeholder 보존                      |
| `skills/implement/`                                     | generate-impl-spec / verify-test-pass ( +2)                                                           | README placeholder 보존                      |
| `agents/{planning,spec,test,implement}/README.md`       | —                                                                                                     | placeholder 마커 → "sub-plan-4 채움 ✅" 갱신 |
| `flows/planning.phase-flow.{json,mermaid}`              | 신설 (chain 1)                                                                                        | —                                            |
| `flows/spec.phase-flow.{json,mermaid}`                  | 신설 (chain 2)                                                                                        | —                                            |
| `flows/test.phase-flow.{json,mermaid}`                  | 신설 (chain 3 / RED 의무)                                                                             | —                                            |
| `flows/implement.phase-flow.{json,mermaid}`             | 신설 (chain 4 / GREEN 의무 / i-strict)                                                                | —                                            |
| `flows/sdlc-4stage-flow.{json,mermaid}`                 | 신설 (master plan SSOT / stages + revisit_edges + sub_flow + cross_cutting)                           | —                                            |
| `tools/drift-validator/src/check-phase-skills.js`       | `checkChainStageLayout` + `summarizeChainLayoutCheck` 신규 export                                     | —                                            |
| `tools/drift-validator/src/cli.js`                      | `--check-chain-layout` flag 신규                                                                      | —                                            |
| `tools/drift-validator/test/check-phase-skills.test.js` | 3 신규 chain stage layout test                                                                        | —                                            |

### 13 신규 skill 총량

| 디렉토리                          | skill 수 | role                                                  |
| --------------------------------- | -------- | ----------------------------------------------------- |
| `skills/_base/` (sub-plan-4 신설) | 2        | cross-cutting (matrix builder + go/stop gate)         |
| `skills/planning/`                | 3        | chain 1 (legacy → planning-spec)                      |
| `skills/spec/`                    | 3        | chain 2 (planning + analysis → behavior + acceptance) |
| `skills/test/`                    | 3        | chain 3 (acceptance → test code RED)                  |
| `skills/implement/`               | 2        | chain 4 (test → impl GREEN / i-strict)                |
| **합계**                          | ** 13**  | —                                                     |

(skills/design/ 은 1차 = analysis 자산 reuse / sub-plan-4 채움 ❌ / v2.x carry — master plan §K-3.)

### 5 신규 flow 총량

| flow                                  | chain | 역할                                                                            |
| ------------------------------------- | ----- | ------------------------------------------------------------------------------- |
| `planning.phase-flow.{json,mermaid}`  | 1     | 5 phase + gate #1                                                               |
| `spec.phase-flow.{json,mermaid}`      | 2     | 6 phase + gate #2                                                               |
| `test.phase-flow.{json,mermaid}`      | 3     | 7 phase + gate #3 (RED)                                                         |
| `implement.phase-flow.{json,mermaid}` | 4     | 8 phase + gate #4 (GREEN / i-strict)                                            |
| `sdlc-4stage-flow.{json,mermaid}`     | cross | master plan SSOT — stages + revisit_edges + cross_cutting + release_eligibility |

### unit test 회귀 (135 → 138)

| 도구            | 직전 (3b) | 현재 (sub-plan-4) | 증감                             |
| --------------- | --------- | ----------------- | -------------------------------- |
| drift-validator | 41        | **44**            | **+3** (chain stage layout test) |
| (그 외 10 도구) | 94        | 94                | 0                                |
| **합계**        | **135**   | ** 138**          | **+3**                           |

master plan H §release 자격 80+ → **138 pass = 73%p 초과 달성**.

### 검증

```
node scripts/version-check.js                → ✅ all 3 sources in sync at v1.5.0
node tools/drift-validator/src/cli.js --check-layout       → ✅ 9 phases / 19 skills / 0 orphans / 0 missing (analysis stage)
node tools/drift-validator/src/cli.js --check-chain-layout → ✅ 4 stages / 26 phases / 13 skills / 0 orphans / 0 missing ( chain stage / sub-plan-4 신설)
npm test (workspace)                         → ✅ 138 pass / 0 fail / 11 workspace
```

### 10 항목 결단 cluster

1. ✅ 2 \_base skills (build-traceability-matrix + invoke-go-stop-gate)
2. ✅ 3 planning skills
3. ✅ 3 spec skills (skills/spec/ 신규 디렉토리)
4. ✅ 3 test skills
5. ✅ 2 implement skills
6. ✅ agents/{planning,spec,test,implement}/README placeholder → 정식 채움 ✅
7. ✅ 4 chain stage flow ({planning,spec,test,implement}.phase-flow.{json,mermaid})
8. ✅ sdlc-4stage-flow.{json,mermaid} 통합 SSOT (stages + revisit_edges + 4 gate + cross_cutting + release_eligibility)
9. ✅ drift-validator `--check-chain-layout` flag + 3 신규 unit test ( 4 stages / 26 phases / 13 skills / 0 orphans / 0 missing)
10. ✅ DEC + STATUS + INDEX 갱신 + commit

## sub-plan-5 진입 prerequisite 충족

| #   | 항목                                          | 상태                |
| --- | --------------------------------------------- | ------------------- |
| 1   | ADR-CHAIN-001~004                             | ✅                  |
| 2   | 7 chain schema                                | ✅                  |
| 3   | 11 chain validator                            | ✅                  |
| 4   | chain-check.yml CI infra                      | ✅                  |
| 5   | 13 chain skill + 5 chain flow + 4 chain agent | ✅ ( 본 sub-plan-4) |

sub-plan-5 (hooks + harness) 진입 가능.

## skills-axis chain stage axis 운영 입증

`methodology-spec/skills-axis.md` §4 v2.0 chain stage axis 정책이 본 sub-plan-4 commit 으로 운영 입증:

- 디렉토리 분리 ❌ → SKILL.md 본문 분기 ( jest/vitest/junit5/pytest framework 차이는 본문 분기로 처리).
- manifest = SSOT ( flows/{stage}.phase-flow.json + flows/sdlc-4stage-flow.json).
- drift-validator 3-way 검증 → chain stage axis 도 자동 검증 (`--check-chain-layout`).

## §8.1 strict 정합 평가

본 sub-plan-4 산출 = 인터페이스 layer (도구는 sub-plan-3a/b / 본 단계는 사용자 자연어 → skill 매칭). PoC corroboration = sub-plan-6 시점. 본 sprint = §8.1 release 자격 평가 대상 ❌ (no release / no tag / 본체 commit 만).

## 결과

### 긍정

- 13 chain skill + 5 chain flow + 4 chain agent README 모두 자료 등재.
- drift-validator `--check-chain-layout` 자동 회귀 ( 0 orphan / 0 missing 의무).
- skills-axis §4 chain stage axis 정책 운영 입증.
- master plan SSOT (`sdlc-4stage-flow.json`) 신설 — stages + revisit_edges + 4 gate + cross_cutting + release_eligibility 단일 정의.

### 부정

- skills/design/ 미채움 — 1차 = analysis 자산 reuse / v2.x carry (master plan §K-3).
- chain-revisit-detector → sub-plan-5 carry (DEC-2026-05-06-sub-plan-3a-종결 정합).
- skill 본문 (jest / spring / nestjs / pytest 등) framework 분기 = sub-plan-6 PoC #05 시점 검증.

### 중립

- agents/{planning,spec,test,implement}/README 본문 자체는 sub-plan-1 에서 사전 작성 / 본 sub-plan-4 = "sub-plan-4 채움 ✅" 마커 갱신만.

## sub-plan-5 carry ( 다음 sprint)

| #     | 항목                                                                  | 비고                       |
| ----- | --------------------------------------------------------------------- | -------------------------- |
| sp5-1 | hooks/hooks.json 확장 (PostToolUse + PreToolUse + UserPromptSubmit)   | master plan §B             |
| sp5-2 | chain-revisit-detector 구현 (path-to-chain whitelist + 사용자 prompt) | sub-plan-3 carry           |
| sp5-3 | go/stop gate UX 입증 (자연어 prompt → skill 매칭 → cluster 결단)      | sub-plan-4 skill 운영      |
| sp5-4 | intervention_log 분석 dashboard prototype                             | sub-plan-5 또는 sub-plan-6 |
| sp5-5 | hooks 의 skill auto-invoke (gate 자동 호출 / Auto Mode 호환)          | —                          |

## sub-plan-4 carry ( 후속)

| #      | 항목                                                                                           | 시점                             |
| ------ | ---------------------------------------------------------------------------------------------- | -------------------------------- |
| sp4-c1 | skills/design/ 본격 채움                                                                       | v2.x (master plan §K-3)          |
| sp4-c2 | skill 본문 framework 분기 검증 (jest/spring/nestjs/pytest end-to-end)                          | sub-plan-6 PoC #05               |
| sp4-c3 | flows/sdlc-4stage-flow.json sub_flow 흡수 입증 (analysis.phase-flow ↔ sdlc-4stage 양방향 회귀) | sub-plan-5 또는 sub-plan-6       |
| sp4-c4 | chain stage flow drift corpus 확장 (sdlc-4stage 자체 phase-flow drift 검증)                    | sub-plan-3a corpus pattern reuse |

## release / 갱신

- no release / no tag / 본체 commit 만 (master plan §H 정합 — sub-plan-6 시점 v2.0.0 release).
- CHANGELOG.md 갱신 ❌ (release 시 합산).
- STATUS.md sub-plan-4 진행 행 ✅ + sub-plan-5 진입 prerequisite 갱신.
- INDEX.md 본 결단 등재.
- CLAUDE.md 갱신 ❌.

## Lessons / 보존

- skills-axis 정책 (디렉토리 분리 ❌ / SKILL.md 본문 분기) → 본 sub-plan-4 가 chain stage axis 첫 운영 입증.
- master plan SSOT (`sdlc-4stage-flow.json`) 단일 정의 — stages + revisit_edges + 4 gate + cross_cutting + release_eligibility 모두 합산 → 다른 자산 (skill / flow / ADR) 가 모두 본 SSOT 참조.
- drift-validator chain stage layout check → 0 orphan / 0 missing 자동 회귀 → 14차 retract pattern (단일 source-of-truth 위배) 회피.
- agent README placeholder 마커 갱신 (` sub-plan-4 신설` → ` sub-plan-4 채움 ✅`) → carry status visibility 향상.
