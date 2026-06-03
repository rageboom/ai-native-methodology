# DEC-2026-05-06-sub-plan-6-종결

- 일자: 2026-05-06
- 카테고리: methodology / v2.0 sub-plan / chain harness validated ( §8.1 strict 7/7 + ≥ 2 PoC corroboration / v2.0.0-rc1 prerelease)
- 결정자: 윤주스 (TF Lead)
- 상태: 승인 ( sub-plan-6 종결 / PoC #05 신설 + PoC #03 retrofit / release-readiness.js 7/7 / v2.0.0-rc1 prerelease)
- 관련: ADR-CHAIN-001~005 / DEC-2026-05-06-v2.0-i-strict-채택 / DEC-2026-05-06-sub-plan-5-종결 (직전) / sub-plan `~/.claude/plans/sub-plan-6-poc-release.md` + research `~/.claude/plans/sub-plan-6-research.md` ( Senior BLOCKER 1 + HIGH 4 흡수)

## 컨텍스트

sub-plan-5 commit `321eeb3` 종결 후 **chain harness 정식 호칭** 자격 확보. 그러나 §8.1 strict 입증 = sub-plan-6 위임 (PoC corroboration ≥ 2 + 7/7 release gate). 본 sub-plan-6 = chain harness scaffolding → harness-complete → **harness-validated** 전환.

Senior critique 흡수 결단:

- F1 BLOCKER → D25' (UC-002 추가 / 2 UC e2e)
- F2 HIGH → D26' (PoC #03 retrofit chain 3 RED dry-run 강제)
- F3 HIGH → release-readiness.js content-aware criterion + 9 self-test
- F4 HIGH → D29' (v2.0.0-rc1 prerelease / 24h+ 후 final / 같은 날 final tag ❌)
- F5 HIGH → sp6-c8 carry (chaos test)
- F6 MED → D27' (vitest 채택)
- F7 MED → BE-only 명시 + MIGRATION-v1-to-v2.md + v2.0.1 trigger 명문화

## 결정

     sub-plan-6 종결. §8.1 strict 7/7 ✅ / chain harness validated 진입.

### 산출물 (본 commit)

| 영역                                              | 신설                                                                                        | 갱신                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `tools/drift-validator/src/check-phase-skills.js` | —                                                                                           | `checkStateFlowConsistency` + summary export ( sp5-c7) + 3 unit test (44→47)             |
| `tools/drift-validator/src/cli.js`                | —                                                                                           | `--check-state-flow-consistency` flag                                                    |
| `examples/poc-05-sample-user-register/`           | neuf — README + source/ + input/ + .aimd/ + target/                                         | —                                                                                        |
| `examples/poc-03-realworld-nestjs/.aimd/output/`  | retrofit-note.md + planning-spec + behavior-spec + acceptance-criteria + test-spec + matrix | —                                                                                        |
| `scripts/release-readiness.js`                    | §8.1 7/7 자동 검사 (7 criterion)                                                            | —                                                                                        |
| `scripts/test/release-readiness.test.js`          | 9 self-test (Senior F3)                                                                     | —                                                                                        |
| `scripts/version-check.js`                        | —                                                                                           | semver prerelease (-rc1) 정규식 허용                                                     |
| `scripts/build-plugin.js`                         | —                                                                                           | semver prerelease 정규식 허용                                                            |
| `package.json` (root)                             | —                                                                                           | version 1.5.0 → 2.0.0-rc1 / `test:release` + `release:check` script                      |
| `.claude-plugin/plugin.json`                      | —                                                                                           | version 1.5.0 → 2.0.0-rc1 / description 갱신                                             |
| `CHANGELOG.md`                                    | —                                                                                           | v2.0.0-rc1 entry (Highlights / What's new / Breaking / Migration)                        |
| `flows/sdlc-4stage-flow.json`                     | —                                                                                           | version `2.0.0-dev → 2.0.0-rc1` / `harness_status: harness-complete → harness-validated` |
| `docs/MIGRATION-v1-to-v2.md`                      | migration guide (사내 onboarding + 외부 user / Senior F7)                                   | —                                                                                        |
| 본 DEC                                            | 신설                                                                                        | —                                                                                        |

### §8.1 strict 7/7 (release-readiness 자동 검사)

```
✅ 1. poc_corroboration: 2 PoC (poc-05 + poc-03 retrofit)
✅ 2. real_tool_evidence: 5종 물증 7 필드 (10 fields) all present / sha256 valid
✅ 3. validators_violation: 4 validators 0 critical/high (drift / planning / chain-coverage / spec-test-link)
✅ 4. chain_coverage: 1.0 / threshold 0.85
✅ 5. adr_registry: 5 ADR-CHAIN 모두 status: 승인됨 + 결정 section (content-aware)
✅ 6. matrix_greenness: forward=1 / backward=1 / cells=2 / green=2
✅ 7. e2e_cycle_pass: pass=6 / fail=0 (chain 4 GREEN / vitest 1.6.1)
```

### PoC corroboration 매핑

| PoC                                                                 | scope                                                          | 결과                                              |
| ------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| **PoC #05 sample-user-register** (corroboration #1 / e2e 단독 책임) | 2 UC + 2 BR + 2 TC + 2 IMPL / vitest 1.6.1 / RED→GREEN         | chain 1~4 e2e GREEN / matrix 100% / 5종 물증 정합 |
| **PoC #03 NestJS retrofit** (corroboration #2)                      | chain 1~2 + chain 3 RED dry-run / 2 UC subset (signup + login) | retrofit 정합 / chain 1~3 schema + validator pass |

### unit test 회귀 (210 = 201 workspace + 9 release-readiness)

| 도구                        | 직전 (sub-plan-5) | 현재 (sub-plan-6)                    |
| --------------------------- | ----------------- | ------------------------------------ |
| drift-validator             | 44                | **47** (+3 state-flow consistency)   |
| 그 외 10 도구               | 94                | 94                                   |
| chain-driver                | 60                | 60                                   |
| **workspace 합계**          | 198               | ** 201**                             |
| release-readiness self-test | —                 | **9** (Senior F3 / file presence ❌) |
| **총 합계**                 | 198               | ** 210**                             |

### Senior critique (research §F) 결과

| ID  | severity | 흡수                                                         |
| --- | -------- | ------------------------------------------------------------ |
| F1  | BLOCKER  | ✅ D25' UC-002 추가 (PoC #05 = 2 UC)                         |
| F2  | HIGH     | ✅ D26' PoC #03 retrofit chain 3 RED dry-run                 |
| F3  | HIGH     | ✅ release-readiness 7 criterion content-aware + 9 self-test |
| F4  | HIGH     | ✅ D29' v2.0.0-rc1 prerelease / 24h+ 후 final                |
| F5  | HIGH     | ⏳ sp6-c8 carry (chaos test) — release block ❌              |
| F6  | MED      | ✅ D27' vitest 채택 (PoC #05 = vitest 1.6.1)                 |
| F7  | MED      | ✅ MIGRATION-v1-to-v2.md + v2.0.1 trigger 명문화             |

### chain harness 호칭 전환 (master plan §H)

| 시점                                       | 호칭                        | 자격                                        |
| ------------------------------------------ | --------------------------- | ------------------------------------------- |
| sub-plan-1~4 종결                          | chain harness scaffolding   | 부품                                        |
| sub-plan-5 종결                            | chain harness               | 5 요소 코드 enforcement                     |
| ** sub-plan-6 종결 (본 DEC) / v2.0.0-rc1** | **chain harness validated** | **§8.1 strict 7/7 + ≥ 2 PoC corroboration** |

### v2.0.0-rc1 prerelease 정책 (Senior F4 흡수)

같은 날 commit 직후 v2.0.0 final tag ❌ — 14차 retract pattern 차단. v2.0.0 final = 2026-05-07 이후 + clean clone 1회 PoC #05 e2e 재실행 통과 시.

### v2.0.1 hot-fix trigger 명문화 (Senior F7)

다음 1+ 발생 시 즉시 v2.0.1 patch:

- release-readiness criterion 1+ regress
- Senior critique HIGH 1+
- 7일 내 carry 신규 > 3건

## 결과

### 긍정

-      chain harness validated 정식 호칭 (§8.1 strict 7/7 + ≥ 2 PoC)
- 210 test (138 → +72 / sub-5 +60 + sub-6 +12) — 회귀 안정 / Senior F3 file presence ❌ 입증
- v2.0.0-rc1 prerelease — 14차 retract pattern 차단 / 24h+ cooling
- MIGRATION-v1-to-v2.md — v1.x 사용자 onboarding 가이드
- BE-only corroboration 명시 정직 / FE 트랙 v2.1+ carry

### 부정 / carry

| #      | 항목                                                                                  | 시점   |
| ------ | ------------------------------------------------------------------------------------- | ------ |
| sp6-c1 | RealWorld scale e2e (PoC #03 진짜 jest + impl)                                        | v2.1+  |
| sp6-c2 | intervention-log 분석 dashboard (sp5-c4)                                              | v2.1+  |
| sp6-c3 | Auto Mode 차단 임계 분포 분석 dashboard (sp5-c6)                                      | v2.1+  |
| sp6-c4 | PoC #04 retrofit (FE 트랙 chain 1~2)                                                  | v2.1+  |
| sp6-c5 | tree-sitter semantic diff (sp5-c1)                                                    | v2.x   |
| sp6-c6 | 다중 사용자 driver state 동시성 (sp5-c2)                                              | v2.x   |
| sp6-c7 | hooks 진짜 LLM auto-invoke (sp5-c3)                                                   | v2.x   |
| sp6-c8 | chain-driver chaos test (CAS race / JSONL concurrency / mid-stage SIGINT — Senior F5) | v2.0.x |

### 다음

- v2.0.0 final (2026-05-07~ / clean clone PoC #05 e2e 재실행 통과 시)
- v2.0.1 hot-fix (carry trigger 발생 시)
- v2.1 (FE 트랙 retrofit / RealWorld scale e2e / intervention dashboard)
