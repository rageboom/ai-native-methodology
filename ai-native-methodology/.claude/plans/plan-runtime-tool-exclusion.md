# plan-runtime-tool-exclusion.md — Java/JVM runtime 의존 도구 제외 결단

> **Trigger**: 사용자 "코드 분석에서 런타임 분석이 필요한 툴들은 안쓸거야 / 자바 런타임이 필요한 것도 못쓸거 같은데 / 플러그인이 그런것 까지 하기 어렵잖아 / 이렇게 해줘" (2026-05-18)
>
> **Author**: Sonnet 4.6 (TF Lead 윤주스 결단 흡수)
>
> **방법론 4원칙 ladder**: ① plan ← 본 문서 / ② research (lightweight 2-agent) / ③ 사용자 묶음 결단 / ④ 시행

## 0. 결단의 본질

본 방법론은 **AI sub-agent persona 시뮬레이션 ❌ / 진짜 외부 도구 실행 의무** 사상 (`feedback_no_static_tool_simulation.md` ★★★). 그런데 plugin 배포 환경에서 **JVM (Java 17+) / 빌드 환경 (javac) / runtime trace 실행 환경** 는 비현실적.

→ **PMD / SpotBugs / Daikon / CodeQL 는 사실상 본 plugin 환경에서 실행 불가**. 현재 skeleton 만 보유 + preflight throw 상태 = 사용자 0 단계 / 미구현 carry.

→ **솔직한 정정**: static-runner 의 "5 plugin host" 표기 = 거짓 진술. 정정 의무.

## 1. 결단 옵션

### Option A — soft 격하 (★ 추천)

- static-runner 의 **1차 지원 = Semgrep 단일** (Python CLI / 단일 바이너리 / 다언어 source-pattern)
- PMD / SpotBugs / Daikon / CodeQL plugin **코드 제거**
- 대신 **"사용자 환경에서 실행 후 SARIF/JSON 결과 import" 패턴** 명시
  - 기존 `sarif-to-finding.js` 어댑터는 유지 (SARIF 다언어 지원)
  - 사용자가 자체 환경 (사내 CI / 로컬 Java 환경) 에서 도구 실행 → SARIF 출력 → `static-runner --import <sarif>` 으로 흡수
- 문서 정정: "Semgrep host + 사용자 환경 SARIF import" 로 명확화
- agents / skills 인용 정정: "PMD / SpotBugs / Daikon / CodeQL = 사용자 환경 의존 (import 패턴)" 명시

### Option B — hard 제거

- Semgrep 만 1차 지원
- 다른 도구 인용 전부 제거
- 사용자 환경 SARIF import 도 별도 분리

### Option C — 현 상태 유지 + "환경 부재 carry" 정직 표기 강화

- 모든 인용 유지하되 "환경 부재 시 carry / 본 plugin 환경에서 실행 불가" 정직 표기만
- 코드/skeleton 무수정

★ Option A 가 본 방법론 axis 본질 (no-simulation = 진짜 도구 의무) 정합 + 사용자 결단 명시적 흡수 + 거짓 진술 정정 모두 충족. **★ 추천**.

## 2. 영향 범위 (Option A 기준)

### Tier 1: 코드 / 설정 (실 수정)

| 파일 | 변경 | 영향 |
|---|---|---|
| `tools/static-runner/package.json` | `description` 정정 ("Semgrep CLI host + multi-tool SARIF import") | low |
| `tools/static-runner/src/runner.js` | `PMDPlugin` export 제거 + plugin map 에서 제거 | medium |
| `tools/static-runner/src/sarif-to-finding.js` | 주석에서 "PMD / SpotBugs / CodeQL" 인용 → "외부 SARIF (import 패턴)" 으로 일반화 | low |
| `tools/static-runner/test/runner.test.js` | `PMDPlugin` import + preflight test 제거 | low |
| `tools/static-runner/test/baseline-mode.test.js` | 주석 정정 | trivial |
| `tools/_shared/baseline.js` | 주석 "Phase D — Semgrep/PMD finding 어댑터" → "Semgrep + SARIF import 어댑터" | trivial |

### Tier 2: 문서 (활성 surface)

| 파일 | 변경 |
|---|---|
| `tools/static-runner/README.md` | Purpose / 도구 list 정정 + "사용자 환경 SARIF import" 패턴 신설 섹션 |
| `tools/spectral-runner/README.md` | sibling 링크 문구 정정 |
| `tools/README.md` | line 50-51 표 (PMD/SpotBugs/Daikon/CodeQL 행 제거 + import 패턴 행 추가) |
| `README.md` (root) | line 240 ascii tree 정정 |

### Tier 3: agents

| 파일 | 변경 |
|---|---|
| `agents/analysis-agent.md` | "PMD/SpotBugs/Daikon" 인용 → "사용자 환경 의존 (SARIF import)" |
| `agents/implement-agent.md` | "static-runner 6 plugin" → "Semgrep + 사용자 환경 import" + plugin list 실제 일치 (★ 기존 드리프트 동반 정정 — 본 인용은 실 코드와 이미 드리프트 / line 33+58) |
| `agents/spec-agent.md` | "Daikon" 직접 인용 → "fast-check / hypothesis (Property-based test)" 만 유지 |
| `agents/_base-senior-engineer.md` | 시뮬 차단 규칙 인용 정정 ("Semgrep + 사용자 환경 의존 도구") |

### Tier 4: skills

| 파일 | 변경 |
|---|---|
| `skills/analysis-aspect-static-security/SKILL.md` | 도구 list "환경 의존 분류" 명시 (Semgrep = plugin host / PMD·SpotBugs·CodeQL·SonarQube = 사용자 환경 SARIF import) |
| `skills/analysis-formal-spec-validation/SKILL.md` | 도구 list 동일 정정 |
| `skills/_base-apply-baseline-ratchet/SKILL.md` | "SpotBugs / PMD" 직접 인용 → "Semgrep + 사용자 환경 import" |
| `skills/analysis-html-template/SKILL.md` | SonarQube/PMD JSP/jsp-lint = "사용자 환경 의무" 명시 강화 (★ 본래도 외부 도구 의무 명시 — 정합 강화) |
| `skills/implement-generate-impl-spec/SKILL.md` | "6종" → "Semgrep + 사용자 환경 import" |
| `skills/test-verify-coverage/SKILL.md` | JaCoCo 인용 = "★ 사용자 환경 coverage 도구 (Java)" 명시 강화 (★ 본래도 "외부 도구 책임" 명시 — 정합 강화) |

### Tier 5: methodology-spec

| 파일 | 변경 |
|---|---|
| `methodology-spec/lifecycle-contract.md` | line 72 + 338 인용 정정 |
| `methodology-spec/deliverables/21-impl-spec.md` | "static-runner 6종" → "Semgrep + import" |
| `methodology-spec/deliverables/12-static-security-spec.md` | 단계 5 도구 list 정정 |
| `methodology-spec/workflow/formal-spec.md` | line 141 정정 |

### Tier 6: ADR (역사 보존 + patch)

| 파일 | 변경 |
|---|---|
| `docs/adr/ADR-009-다이어그램-신뢰-모델.md` | §2.1 단계 5 본문 정정 (도구 list) + §변경 이력 patch 추가 (Sonnet 4.6 / 2026-05-18 / runtime-tool-exclusion) |
| `docs/adr/ADR-010-baseline-ratchet.md` | §3 / §5 도구 인용 정정 + patch |

### Tier 7: 산업 인용 (★ 유지)

| 파일 | 처분 |
|---|---|
| `tools/chain-coverage-validator/src/cli.js` + `validator.js` (SonarQube/CodeQL/Snyk industry-aligned baseline) | ★ **유지** — 산업 인용 (baseline 권위) / 본 axis 와 무관 |
| `docs/adr/ADR-CHAIN-006` (SonarQube 학술) | ★ **유지** — 학술 비교 인용 |
| `docs/adr/ADR-CHAIN-011` (Industry case 4/4) | ★ **유지** — 패턴 비교 인용 |
| `methodology-spec/deliverables/5-business-rules.md` (Semgrep+CodeQL+SonarQube+Daikon 4/4 정합) | ★ **유지** — paradigm 정합 인용 |

### Tier 8: history (수정 ❌)

- `CHANGELOG.md` / `CHANGELOG-HISTORY.md` / `decisions/DEC-*.md` / `decisions/STATUS-HISTORY.md` / `archive/` / `dist/` — ★ 역사 보존 의무 / 수정 ❌
- 새 DEC-2026-05-18-runtime-tool-exclusion.md 신설 (DEC-2026-04-29-static-tool-실행-의무화 amends)

## 3. semver / breaking

- **사용자 0 단계** (pre-deployment / memory `project_pre_deployment_stage.md`)
- 실 영향: 미구현 skeleton 코드 제거 + description 정정 + 인용 정정 + import 패턴 신설
- 표기: **MINOR (v8.6.0)** — additive (사용자 환경 SARIF import 패턴 신설) + 거짓 진술 정정 (description) + 미구현 skeleton 제거 (breaking ❌ — 사용자 0 / 실 호출 0)
- 또는 **PATCH (v8.5.1)** — 미구현 정리만 강조 시
- ★ **추천 = MINOR** — import 패턴 신설이 본질 / 단순 PATCH 미달

## 4. FE profiler / runtime 도구 처분

| 도구 | 위치 | 처분 |
|---|---|---|
| React DevTools profiler | `.claude/plans/research-*-v1.4-fe.md` | ★ 본체 미통합 / research 자산만 / **무수정** (역사 보존) |
| Vue DevTools / Playwright codegen / Cypress Studio | 동일 research | 무수정 |
| Storybook CSF / Chromatic baseline | 동일 research | 무수정 |

→ FE research 자산은 **archive scope** (cleanup round 1 격리 사상 정합) — runtime 도구 carry 처분도 본 결단의 implicit 정합. 본체 활성 surface 영향 0.

## 5. 신규 산출물

| 항목 | 위치 |
|---|---|
| 새 DEC | `decisions/DEC-2026-05-18-runtime-tool-exclusion.md` |
| INDEX 추가 | `decisions/INDEX.md` (DEC-2026-04-29-static-tool-실행-의무화 amends 표기) |
| CHANGELOG | `CHANGELOG.md` v8.6.0 entry |
| ADR patch | ADR-009 §변경이력 + ADR-010 §변경이력 |
| memory | `feedback_runtime_tool_exclusion.md` (no-simulation 정책 보강 사상) |
| plan.md (본 문서) | `.claude/plans/plan-runtime-tool-exclusion.md` |
| research.md | `.claude/researches/research-runtime-tool-exclusion.md` (2-agent lightweight) |

## 6. 검증 (STOP-3 hard gate)

| 검증 | 임계 |
|---|---|
| `npm test --workspaces` | 414/414 pass (★ static-runner test 변경 후 회귀 0) |
| `release-readiness.js` | 13/13 ready:true |
| `drift-validator` (3-way: flow / schema / template) | clean |
| `skill-citation-validator` (47 SKILL.md L3 + repo-wide active) | stale 0 |
| `findings-aggregator` | F-021 임계 ≤ 15 |
| `version-check` 3-way | plugin.json + package.json + CLAUDE.md 동기 |

## 7. 묶음 결단 (사용자 prompt 항목)

| # | 묶음 | 옵션 | 추천 |
|---|---|---|---|
| Q1 | 격하 방식 | A (soft import 패턴) / B (hard 제거) / C (현 상태 유지) | **A** |
| Q2 | semver | MINOR (v8.6.0) / PATCH (v8.5.1) | **MINOR** |
| Q3 | research 깊이 | 2-agent lightweight (F-015 + Senior) / 3-agent full | **2-agent** (영향 명확 / 사용자 결단 명시적) |
| Q4 | ADR patch | ADR-009 + ADR-010 patch 추가 / patch 생략 | **patch 추가** (역사 흔적 의무) |
| Q5 | FE profiler carry | research 자산 그대로 유지 / 동반 정리 | **그대로 유지** (역사 보존 / 본체 미통합) |

## 8. 시행 순서 (사용자 결단 후)

1. research (2-agent lightweight) → `.claude/researches/research-runtime-tool-exclusion.md`
2. Tier 1 코드 수정 + 회귀 test
3. Tier 2-5 문서 정정
4. Tier 6 ADR patch
5. 새 DEC + INDEX + CHANGELOG + memory
6. STOP-3 hard gate 검증
7. version bump (MINOR v8.6.0)
8. commit + push

## 9. Lessons Learned 후보 (LL-i-XX)

- 외부 도구 의존 표기 시 **plugin 환경 실행 가능성** 사전 검증 의무 (LL 후보)
- "5 plugin host" 같은 표면 표기 = 거짓 진술 risk / 미구현 skeleton 정직 표기 의무
- 사용자 환경 위임 패턴 = no-simulation 정합 (★ Adzic SBE 10년 폐기 함정의 정공법 — 시뮬 ❌ + 실 사용자 환경 의무)

## 10. ★ 본 plan patch (2026-05-18 / research 후 흡수)

### 10.1 사실 정정 (★ load-bearing / F-015 LL-rte-04)

- **PMD JVM version**: 당초 plan §1 "JRE/JDK 17+" = **사실 오류** → 공식 verbatim **"Java 8 or above"** (PMD 7.x docs `pmd_userdocs_installation.html`)
- 본 plan / commit msg / release notes / charter R19 신설 본문 / 모든 인용 verbatim 정정 의무

### 10.2 Senior STRONG-STOP signal 1건 전면 흡수 (★ confidence 0.84)

**signal**: SARIF import 패턴의 우회 표면 (AI persona / 손작성 / 빈 SARIF 가 "진짜 도구 결과" 행세 가능) → no-simulation 정책 정면 우회 attack vector.

**해소 조건 — schema-level 강제 4 + chain-strict mode 격상 1 + axis 분리 1 + sweep 1 + paradigm 결합 1 = 8 항목 일괄 시행**:

### 10.3 SARIF import 4 조건 schema 강제

| # | 조건 | enforcement |
|---|---|---|
| 1 | **evidence trust 등급 분리** | `static-runner-result.schema.json` 에 `evidence_trust` enum `[real_tool, imported_sarif, simulated]` 추가. `simulated` = 영구 reject (chain gate -5%p) |
| 2 | **reproduction_command 의무** | import 시 사용자가 SARIF runs[].invocations[].commandLine 또는 별도 `reproduction_command` 필드 명시 의무 |
| 3 | **driver.name allowlist** | SARIF runs[].tool.driver.name 이 `PMD / SpotBugs / CodeQL / Daikon` allowlist 내 한정. `manual` / `ai-generated` / 미명시 reject |
| 4 | **빈 SARIF reject** | `runs[].results = []` 시 import reject 또는 명시적 `non_use_rationale` 첨부 의무 (F-SIM-004 antipattern-coverage lane 정합) |

### 10.4 charter R19 신설 (★ R18 §5 patch ❌)

`methodology-spec/plugin-charter.md` 에 **R19 — Tool Ecosystem Dependency Classification** 신설:

```
R19 — Tool Ecosystem Dependency Classification (★ v8.6.0 신설)

본 plugin 의 외부 도구 의존 분류:

Tier 1 — Native (in-plugin 1차 지원)
  - Semgrep (Python pipx / uv tool / brew — JVM 의존 0)
  - Spectral (Node.js npm — JVM 의존 0)
  실행 환경: plugin 환경 그 자체 + 사용자 1회 install (pipx install semgrep / npm install -g @stoplight/spectral-cli)

Tier 2 — Imported (사용자 환경 SARIF import)
  - PMD (Java 8 or above)
  - SpotBugs (Java 11 or above + bytecode)
  - CodeQL (CLI download + DB build / 환경 의존)
  - Daikon (Java + runtime trace 실행 환경)
  실행 환경: 사용자 CI / 로컬 환경
  proof: SARIF 2.1.0 Plus Errata 01 (OASIS Standard / 4 조건 schema 강제)

Tier 3 — Simulated (★ 영구 reject)
  - AI persona simulation
  - 손작성 / generated SARIF
  penalty: chain gate -5%p + chain-strict mode block

근거:
- charter R18 (plugin-authoring) = plugin 저작 규칙 axis
- charter R19 (tool-ecosystem) = 외부 도구 의존 분류 axis
- ★ sub-axis evolution paradigm 정합 (feedback_sub_axis_evolution_paradigm.md / v2.6.0 자산화 / 단순 평탄화 ❌)
- ★ no-simulation 정책 (feedback_no_static_tool_simulation.md ★★★)
```

R18 §5 patch ❌ 사유: plugin-authoring axis (저작 규칙) ≠ tool-ecosystem axis (외부 도구 분류). 응집 시 axis 혼동 (LL-runtime-tool-01).

### 10.5 chain-strict mode 격상

`tools/chain-driver/src/gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.implement:
- 현재: `['test-impl-pass-validator', 'static-runner', 'traceability-matrix-builder']`
- 격상: static-runner 가 `evidence_trust ∈ {real_tool, imported_sarif}` 양쪽 강제. Tier 3 (`simulated`) emit 시 gate block.

### 10.6 인용 13곳 동반 sweep (★ skill-citation-validator dead-link 차단 회피)

기존 plan §2 Tier 3 (agents) + Tier 4 (skills) + Tier 5 (methodology-spec) 의 13곳 인용 = R19 Tier 1/2/3 분류 명시 동반 의무.

### 10.7 P1+P2 결합 명시 (paradigm 본질 보존)

- (P1) "JVM 의존 도구 = plugin scope 외" 솔직 격하
- (P2) "사용자 환경 SARIF import 패턴 지원" 명시
- 양쪽 동반 = Adzic SBE 10년 폐기 함정 정공법 (시뮬 ❌ + 실 사용자 환경 의무)

### 10.8 F-015 잔여 carry 4건 — v8.6.0 시행 시 반영

| LL | 정정 |
|---|---|
| LL-rte-01 | `pipx install semgrep` (★ `pip install` ❌ — PEP 668 격리) |
| LL-rte-02 | Spectral AsyncAPI = **v2.x 한정** 명시 (v3 미지원 / Arazzo v1.0 자산 추가 발견) |
| LL-rte-03 | SARIF = **2.1.0 Plus Errata 01 (OASIS Standard 28-Aug-2023)** 정밀 표기 |
| LL-rte-05 | SPA fail cascade (plugin-authoring-spec §6 staleness 가드) = 별도 v8.7.0 carry |

### 10.9 Senior LL 5건 추가 자산화

| LL | 본질 |
|---|---|
| LL-runtime-tool-01 | tool-ecosystem axis 분리 의무 (R18 §5 patch ❌ / R19 신설 ✅) |
| LL-runtime-tool-02 | evidence trust 3-tier paradigm (real / imported / simulated) |
| LL-runtime-tool-03 | load-bearing 사실 정정 → 결단 본질 재평가 의무 |
| LL-runtime-tool-04 | 사전 배포 단계 + breaking 자격 약함 paradigm |
| LL-runtime-tool-05 | 빈 SARIF reject (Adzic SBE 함정 회피 기제) |

### 10.10 작업 범위 확대 — 시행 순서 갱신

1. ~~research~~ ✅ 완료 (F-015 + Senior)
2. **schemas/static-runner-result.schema.json** evidence_trust enum 추가 + 4 조건 강제 schema
3. **tools/static-runner/src/runner.js** PMDPlugin 제거 + `--import-sarif` flag 신설 + driver allowlist + 빈 reject
4. **tools/static-runner/src/sarif-to-finding.js** + cli.js 정합
5. **tools/static-runner/test/**.test.js** 회귀 + import-sarif test 신규
6. **methodology-spec/plugin-charter.md** R19 신설
7. **tools/chain-driver/src/gate-eval.js** chain-strict mode 격상
8. Tier 2-5 문서 정정 (README + agents + skills + methodology-spec)
9. ADR-009 + ADR-010 patch
10. 새 DEC + INDEX + CHANGELOG + memory
11. STOP-3 hard gate (workspace test + release-readiness 13/13 + drift + skill-citation)
12. version bump MINOR v8.6.0 + commit + push
