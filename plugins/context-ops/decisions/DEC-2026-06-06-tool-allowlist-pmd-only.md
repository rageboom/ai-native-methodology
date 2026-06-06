# DEC-2026-06-06-tool-allowlist-pmd-only

**결단**: static-runner R19 **Tier 2 SARIF import allowlist 를 `[pmd, spotbugs, codeql, daikon]` → `[pmd]` 로 축소** + 전 산출물·skill·doc 에서 SpotBugs·CodeQL·Daikon·SonarQube 를 "Tier 2 사용 toolset" 나열에서 제거. 근거 = **실 import/실행 이력 0 도구를 "진짜 외부 도구" 로 나열 ❌** (no-unrunnable-tool-citation). PMD 만 poc-17 user-env 에서 실 import 입증. SonarQube 는 애초에 코드 allowlist 부재(spec-only 유령)였음. 사용자가 자기 환경서 다른 도구를 쓰면 `IMPORTED_DRIVER_ALLOWLIST` 명시 확장(능력은 보존 / 단 방법론이 "지원 toolset" 으로 광고 ❌).

**작성일**: 2026-06-06 (사용자 채널: "SpotBugs·CodeQL·Daikon·SonarQube 안 쓰는데 없는 게 맞지 / 다 빼자").

**relates to**:
- `feedback_no_unrunnable_tool_citation` (실행 못 하는 도구 "진짜 외부 도구" 인용 ❌ / Semgrep 만 실 실행) · `methodology-spec/policies/no-simulation.md` (R19 Tier SSOT)
- `DEC-2026-05-30-honesty-tool-cleanup` (선행 정직 cleanup 패스 — 본 결단이 같은 정신 연장)
- `DEC-2026-05-18-runtime-tool-exclusion` (R19 Tier 발원)

---

## 1. 배경

R19 Tier 2 = "사용자 환경 SARIF import" 채널. 그간 allowlist + 다수 doc/skill 이 PMD·SpotBugs·CodeQL·Daikon(·SonarQube)을 Tier 2 "사용 도구" 로 나열했으나 실측:
- **PMD** = poc-17 사용자 환경 실 import 1회 (data point 있음).
- **SpotBugs·CodeQL·Daikon** = static-runner `IMPORTED_DRIVER_ALLOWLIST` 에 등재됐으나 **실 import/실행 이력 0** (능력만 존재 / 한 번도 행사 안 됨).
- **SonarQube** = doc 에만 나열 / **코드 allowlist 부재** = spec↔code drift (진짜 유령).

→ 실행 이력 0 도구 나열 = no-unrunnable-tool-citation 위반 (Semgrep 같은 실 실행 입증 도구만 "사용" 표기 원칙). 사용자 직관 채널: "안 쓰는데 없는 게 맞지."

## 2. 결정 내용

- **코드**: `tools/static-runner/src/runner.js` `IMPORTED_DRIVER_ALLOWLIST = ['pmd']` (구 4종 제거) + cli.js usage `--import-driver pmd` + 3 comment 정정. importSarif 메커니즘 자체는 무변경(allowlist 만 축소).
- **test**: `runner.test.js` allowlist assertion `['pmd']` + SpotBugs/CodeQL positive import test → PMD driver 전환(positive 경로 커버리지 유지) / 기존 non-allowlisted 거부 test('manual') 보존. static-runner **29/29 green**.
- **doc (Tier 2 나열 → PMD-only + "실행 이력 0 도구 미등재 / 명시 확장")**: `no-simulation.md`(SSOT) · 루트 `CLAUDE.md` · `lifecycle-contract.md` · `deliverables/21-impl-spec.md` · `workflow/formal-spec.md` · `tools/{static-runner,README,spectral-runner}` README · skills(`_base-apply-baseline-ratchet` · `implement-generate-impl-spec` · `analysis-formal-spec-validation` · `analysis-aspect-static-security`).

## 3. 보존 (의도적 — 일괄 삭제 ❌)

- **Industry-precedent 인용** (`deliverables/5-business-rules.md` "Semgrep+CodeQL+SonarQube+Daikon 4/4 source location required") = 외부 선례 근거 / "우리가 쓴다" 주장 아님 → 유지.
- **static-security-spec(산출물 12) 보안 도구 landscape** (`analysis-aspect-static-security` 의 Bandit/Snyk/OSV/Checkstyle/SonarQube/CodeQL) = "사용자 환경서 실행 가능한 보안 도구 안내" → 목록 유지 + "import allowlist=PMD / 그 외 명시 확장" caveat 추가 (gut ❌).
- **examples/ PoC 산출물·CHANGELOG/DEC history** = 시점 기록물 → 무수정.
- **sonar-mybatis / jsp-lint** = 다른 도구 → 무관.

## 4. 검증

static-runner 29/29 · release-readiness 40/40 (skill-citation doc 인용 정합) · workspace 무회귀.

## 5. Non-goal / carry

- importSarif 능력 제거 아님 (allowlist 만 축소 / 사용자 확장 가능).
- Bandit/Snyk/OSV 등 보안 도구의 실행 이력 검증 = 별도 (본 결단 = 사용자 명시 4종 + SonarQube 스코프).
- 코드 allowlist 확장 시 = 그 도구 실 import 입증 후 등재 (no-simulation 정합).
