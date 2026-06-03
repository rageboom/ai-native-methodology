# DEC-2026-05-18-runtime-tool-exclusion — Runtime/JVM 의존 도구 plugin 환경 제외 + R19 신설

**Date**: 2026-05-18 ( session 31차 / v8.6.0 MINOR)
**Status**: 승인 ( 사용자 "코드 분석에서 런타임 분석이 필요한 툴들은 안쓸거야" → "그런데 java runtime 이 필요한것도 못쓸거 같은데?" → "이렇게 해줘" 결단 + 4 묶음 결단 (A·MINOR·2-agent·ADR patch 추가) + Senior STRONG-STOP 전면 흡수 (A·MINOR·MINOR·A) 모두 추천 채택)
**Amends**: DEC-2026-04-29-static-tool-실행-의무화 ( 원본 결단 유지 + R19 paradigm 신설로 확장)

## 사용자 결단 chain

| 순서 | 사용자 발화                                                                             | 흡수                                                                |
| ---- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1    | "코드 분석에서 런타임 분석이 필요한 툴들은 안쓸거야"                                    | Daikon / React DevTools profiler / Playwright codegen 류 = scope 외 |
| 2    | "그런데 java runtime 이 필요한것도 못쓸거 같은데? 플러그인이 그런것 까지 하기 어렵잖아" | PMD / SpotBugs / CodeQL = JVM/JDK 의무 → plugin 환경 비현실         |
| 3    | "이렇게 해줘" (Option A soft 격하 + import 패턴 + MINOR + 2-agent + ADR patch)          | 4원칙 ladder 진입 + 묶음 결단 1                                     |
| 4    | Senior STRONG-STOP signal → 사용자 결단 = 전면 흡수 + PMD 정정 verbatim + R19 신설      | 보강안 8 항목 일괄 시행                                             |

## 결정 본질 — charter R19 신설

**R19 — Tool Ecosystem Dependency Classification**:

| Tier                                  | 도구                                                                                                 | 실행 환경                        | `evidence_trust`                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------- |
| **1** (in-plugin native)              | Semgrep (Python pipx / brew / uv) / Spectral (Node.js npm)                                           | plugin 환경 (사용자 1회 install) | `real_tool`                                         |
| **2** (user-environment SARIF import) | PMD (Java 8 or above) / SpotBugs (JRE 11+) / CodeQL (JDK + DB build) / Daikon (Java + runtime trace) | 사용자 CI / 로컬                 | `imported_sarif`                                    |
| **3** (simulated)                     | ❌ AI persona / 손작성 / `manual` driver SARIF                                                       | —                                | `simulated` → 영구 reject (-5%p + chain gate block) |

## 4원칙 ladder

### 1원칙 — plan

`.claude/plans/plan-runtime-tool-exclusion.md` 작성 (§1-9 본 plan + §10 Senior 5 concerns 흡수 patch).

### 2원칙 — research (lightweight 2-agent)

- **F-015 official-docs check** (sub-agent `_base-official-docs-checker`): 6/6 1차 출처 verbatim 확보. VERIFIED-IDENTICAL 4 (Semgrep CLI / Semgrep 다언어 / SARIF 2.1.0 Plus Errata 01 / SpotBugs JRE 11+) + VERIFIED-WITH-DELTA 2 (Spectral docs SPA fall-back / PMD Java 8 or above). **load-bearing 정정 1건**: PMD = **"Java 8 or above"** (당초 plan "JRE/JDK 17+" = 사실 오류). 잔여 carry 4건 (LL-rte-01 pipx 표기 / LL-rte-02 AsyncAPI v2.x / LL-rte-03 SARIF Errata 01 / LL-rte-05 SPA fail cascade).
- **Senior critique** (sub-agent `_base-senior-engineer`): verdict **REVISE-5 + STRONG-STOP signal 1건** (confidence 0.84). STRONG-STOP = SARIF import 패턴 우회 표면 (AI persona / 손작성 / 빈 SARIF 가 "진짜 도구 결과" 행세 가능 → no-simulation 정책 정면 우회 attack vector). 5 concerns: ① 4 조건 schema 강제 / ② P1+P2 결합 명시 / ③ 13곳 인용 sweep / ④ R19 신설 (R18 §5 patch ❌ — sub-axis evolution paradigm 정합) / ⑤ evidence_trust 3-tier + chain-strict mode 격상.

### 3원칙 — 사용자 묶음 결단

2 차 prompt:

- 1차 (4 묶음): Option A soft 격하 / MINOR v8.6.0 / 2-agent / ADR patch — 4/4 추천 채택
- 2차 (3 묶음 / STRONG-STOP 흡수): 전면 흡수 / PMD verbatim 정정 / R19 신설 — 3/3 추천 채택

### 4원칙 — 시행

Senior 5 concerns 전면 흡수 시행 (additive / breaking 0 / 사용자 0 단계 / pre-deployment).

## 시행 범위 (v8.6.0 MINOR)

### Tier 1: 코드/설정

- `tools/static-runner/package.json` description 정정 (R19 Tier 1+2 명시 / evidence_trust 3-tier)
- `tools/static-runner/src/runner.js` PMDPlugin 제거 + `importSarif` 함수 신설 + `IMPORTED_DRIVER_ALLOWLIST` + `EVIDENCE_TRUST` enum + `ImportSarifRejected`
- `tools/static-runner/src/cli.js` `--import-sarif` / `--import-driver` / `--reproduction-command` / `--non-use-rationale` flag 신설 + exit 4 신설
- `tools/static-runner/src/sarif-to-finding.js` 주석 정정 (R19 Tier 1+2 통합 어댑터)
- `tools/static-runner/test/runner.test.js` 11 신규 import-sarif test (15→26)
- `tools/_shared/baseline.js` 주석 정정

### Tier 2: 문서 (활성 surface)

- `tools/static-runner/README.md` 전면 개정 (Tier 1/2/3 + 4 조건 + 7 evidence)
- `tools/spectral-runner/README.md` sibling 링크 정정
- `tools/README.md` 도구 표 → 3-tier paradigm 정합
- `README.md` (root) ascii tree 정정

### Tier 3: agents (4 sweep)

- `agents/analysis-agent.md`
- `agents/implement-agent.md` (line 33 + 58 — 6 plugin → R19 Tier 1+2)
- `agents/spec-agent.md` (Daikon 인용 → Tier 2 import)
- `agents/_base-senior-engineer.md` (no-simulation 규칙)

### Tier 4: skills (5 sweep)

- `skills/analysis-aspect-static-security/SKILL.md` (도구 list R19 Tier 명시)
- `skills/analysis-formal-spec-validation/SKILL.md`
- `skills/_base-apply-baseline-ratchet/SKILL.md`
- `skills/implement-generate-impl-spec/SKILL.md`
- (`skills/analysis-html-template/SKILL.md` / `skills/test-verify-coverage/SKILL.md` = 원래도 외부 도구 의무 명시 / 격하 후 정합 강화 / 무수정 또는 light touch)

### Tier 5: methodology-spec

- `methodology-spec/plugin-charter.md` **R19 신설** (§1 + §2)
- `methodology-spec/lifecycle-contract.md` (line 69 implement validator + line 72 aspects + line 338 static-runner)
- `methodology-spec/deliverables/21-impl-spec.md` (line 58)
- `methodology-spec/deliverables/12-static-security-spec.md` (line 106)
- `methodology-spec/workflow/formal-spec.md` (line 141)

### Tier 6: chain-strict mode 격상

- `tools/chain-driver/src/gate-eval.js` implement stage `simulated_evidence_count` block 신규

### Tier 7: ADR patch

- `docs/adr/ADR-009-다이어그램-신뢰-모델.md` §2.1 단계 5 + §2.2 도구 종류 표 + 변경 이력 추가 (Tier 3 simulated 영구 reject)
- `docs/adr/ADR-010-baseline-ratchet.md` 변경 이력 추가

### Tier 8: 새 자산

- 본 DEC + INDEX.md
- `CHANGELOG.md` v8.6.0 entry
- memory `feedback_runtime_tool_exclusion.md` (Adzic 정공법 + R19 paradigm)
- 본 plan + research 2 산출물

## semver / breaking

- 사용자 0 단계 ( `project_pre_deployment_stage.md`)
- 미구현 skeleton 제거 = breaking 자격 약함 (호출 0)
- import 패턴 신설 = additive primary signal → **MINOR v8.6.0**
- charter R19 신설 = additive 정책 anchor
- 7 evidence 필드 (기존 7 = 6 + 1 신규 `evidence_trust`) = schema 확장 additive

## STOP-3 hard gate (검증 단계 의무)

| 검증                                                         | 임계                                         |
| ------------------------------------------------------------ | -------------------------------------------- |
| workspace test (`npm test --workspaces`)                     | 424/424 pass (414 + import-sarif 10 신규) ✅ |
| static-runner test 단독                                      | 26/26 pass (15 + 11 신규) ✅                 |
| chain-driver test 단독                                       | 114/114 pass (gate-eval 변경 후 회귀 0) ✅   |
| release-readiness.js                                         | 13/13 ready:true                             |
| drift-validator 3-way (flow / schema / template)             | clean                                        |
| skill-citation-validator (47 SKILL.md + repo-wide active)    | stale 0                                      |
| version-check 3-way (plugin.json + package.json + CLAUDE.md) | 8.6.0 동기                                   |
| findings-aggregator F-021 임계                               | ≤ 15 caution band                            |

## 9 LL 자산화 ( paradigm-level)

| LL                         | 본질                                                                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LL-rte-01**              | Semgrep install 권장 = `pipx install semgrep` ( `pip install` ❌ — PEP 668 격리)                                                                               |
| **LL-rte-02**              | Spectral AsyncAPI = **v2.x 한정** 명시 (v3 미지원 / Arazzo v1.0 자산 추가 발견)                                                                                |
| **LL-rte-03**              | SARIF = **2.1.0 Plus Errata 01 (OASIS Standard 28-Aug-2023)** 정밀 표기 의무                                                                                   |
| **LL-rte-04 load-bearing** | F-015 검증 시 사실 정정 의무 — PMD = **"Java 8 or above"** (당초 "JRE 17+" = 사실 오류 / commit msg / release notes / plan / ADR / charter 모두 verbatim 정정) |
| **LL-rte-05**              | SPA docs (Stoplight) WebFetch fail → fall-back cascade carry (plugin-authoring-spec §6 staleness 가드 보강 carry)                                              |
| **LL-runtime-tool-01**     | charter R 신규 결단 시 plugin-authoring axis (R18) 와 tool-ecosystem axis (R19) 는 분리 의무 (sub-axis evolution paradigm)                                     |
| **LL-runtime-tool-02**     | 외부 도구 격하 결단 시 evidence_trust = 2-tier (real / sim) → 3-tier (real_tool / imported_sarif / simulated) 격상 의무 (Adzic SBE 함정 회피)                  |
| **LL-runtime-tool-03**     | F-015 load-bearing 정정 발견 시 결단 본질 재평가 의무 (정정 후 결단의 의미 보존 sanity check)                                                                  |
| **LL-runtime-tool-04**     | 사전 배포 단계 + 사용자 0 → breaking 자격 약함 / semver 라벨링은 "additive primary signal" 우선                                                                |
| **LL-runtime-tool-05**     | SARIF import 시 `results=[]` reject 의무 — `non_use_rationale` 첨부 시 허용 ( Adzic SBE 함정 회피 기제 / "사용 안 함" 명시 의무)                               |

## 잠재 함정 회피 (Adzic SBE 10년 폐기 함정 정공법)

- **시뮬 ❌** + **실 사용자 환경 의무** = 본 결단의 본질
- evidence_trust 3-tier = Tier 1 (in-plugin 실 실행) / Tier 2 (사용자 환경 실 실행 + import) / Tier 3 (영구 reject)
- SARIF 4 조건 schema 강제 = 우회 표면 결정적 차단 (driver allowlist + non-empty results 또는 rationale + reproduction_command + evidence_trust)
- 양심 의존 0 / chain-strict mode trio (state.blocked + cli exit 4 + PreToolUse deny) 정합

## 잔여 carry (v8.7.0+)

- LL-rte-05 — plugin-authoring-spec §6 SPA fail cascade 보강
- LL-rte-02 — Spectral AsyncAPI v2.x 명시 sweep (다른 인용 위치 검출 시)
- import SARIF `duration_ms` 환산 보강 (SARIF endTimeUtc - startTimeUtc 가능 시)
- Tier 2 import 패턴 외부 적용 입증 (사내 CI 실 실행 + SARIF import 1회 시연)

---

**End of DEC-2026-05-18-runtime-tool-exclusion ( v8.6.0 MINOR / R19 신설 / Senior STRONG-STOP 전면 흡수).**
