# static-runner/ — 외부 정적 분석 host (no-simulation 정책 핵심 enforcement / R19 정합)

## Purpose

진짜 외부 정적 분석 도구 host. **charter R19 (Tool Ecosystem Dependency Classification) 정합** — JVM/추가 환경 의무 도구는 사용자 환경 위임 (v8.6.0 신설). **no-simulation 정책 enforcement** (DEC-2026-04-29-static-tool-실행-의무화 / DEC-2026-05-18-runtime-tool-exclusion).

| Tier                                       | 도구                                                                                                                 | 실행 환경                                                                        | evidence_trust                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------- |
| **Tier 1** (in-plugin native / 실행 locus)              | **Semgrep** (Python pipx/brew/uv — JVM 의존 0) + **PMD** (Java 8+ / in-plugin 자동실행 / DEC-2026-06-07)                                                              | plugin 환경 (SessionStart hook 자동 install — Semgrep + PMD(Java 존재 시 dist zip 자동설치, JVM 부트스트랩 ❌) / `node scripts/install-static-tools.js`, 크로스플랫폼) | `real_tool`                      |
| **Tier 2** (user-environment SARIF import / orthogonal) | **PMD** (자기 CI/환경 실행 SARIF import — Tier 1 in-plugin 자동실행과 **양쪽 유효**). 그 외 도구(SpotBugs·CodeQL·Daikon 등)는 실 import 이력 0 → allowlist 미등재(사용자가 자기 환경서 쓰면 `IMPORTED_DRIVER_ALLOWLIST` 명시 확장) | 사용자 CI / 로컬                                                                 | `imported_sarif`                 |
| **Tier 3** (simulated)                     | ❌ AI persona / 손작성 / `manual` driver SARIF                                                                       | —                                                                                | `simulated` → 영구 reject (-5%p) |

v8.6.0 격하 근거: plugin 배포 환경 (Claude Code / Node.js 기반) 에서 JVM/JDK/Maven/Gradle/bytecode 컴파일 환경 보장 비현실 → in-plugin 실행 ❌. 사용자 환경 SARIF import 패턴 = Adzic SBE 10년 폐기 함정 정공법 (시뮬 ❌ + 실 사용자 환경 의무).

> **DEC-2026-06-07 (PMD Tier1 격상 / 실행 locus 축)**: 위 v8.6.0 격하는 PMD 에 한해 superseded. Tier 분류 축 = "실행 locus"(plugin 직접 실행 여부) — JVM 런타임 의존 무관. PMD 바이너리는 그 자체로 zip 산출물이라, **JVM(JDK/JRE)이 이미 PATH에 있으면** `install-static-tools.js` 가 PMD dist zip 을 `.static-tools/` 에 자동설치하고 runner 가 발견(child PATH prepend). **JVM 자체는 절대 부트스트랩하지 않음**(user-owned / no-simulation) — Java 부재 시 정직 carry. import 경로(Tier 2)는 orthogonal 로 양쪽 유효.

## 핵심 원칙

> **AI sub-agent 에 "Static Analyzer persona" 부여 시뮬레이션 절대 금지**.
> 진짜 외부 도구 실행 의무. 환경 부재 시 정직 보고 + 사용자 위임 — 시뮬 결과를 신뢰도 근거로 절대 사용 금지.

## When to call

- **trigger**: Phase 4.5+ / Phase 6 quality / chain 5 impl 후
- **호출자**: skill `analysis-aspect-static-security` / `analysis-quality-antipattern` 자동 호출
- **수동**: `npx static-runner --plugin <name> ...` (Tier 1) / `npx static-runner --import-sarif <path> ...` (Tier 2)

## Inputs

### Tier 1 — in-plugin Semgrep

```bash
# 자동 install (SessionStart hook 가 첫 세션에 실행 / 이후 idempotent skip)
#   수동 강제 실행:  node ${CLAUDE_PLUGIN_ROOT}/scripts/install-static-tools.js   (POSIX: bash …/install-static-tools.sh)
#   fallback chain:  pipx → brew → pip3 --user → 사용자 안내
# 또는 사용자 수동:
#   pipx install semgrep
#   brew install semgrep / uv tool install semgrep

# 단일 plugin — 번들 룰 (사내 정책으로 semgrep registry 접근 불가 환경 대응)
#   semgrep-rules 가 git subtree 로 tools/semgrep-rules/ 에 vendor 됨 (install 시 자동 동봉)
npx static-runner --plugin semgrep --target ./src --output ./out \
  --ruleset ${CLAUDE_PLUGIN_ROOT}/tools/semgrep-rules/python

# 단일 plugin — semgrep registry (registry 접근 가능 환경에서만)
npx static-runner --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten

# v1.4.2 — `--extra-rules` 옵션 (custom Semgrep rule)
npx static-runner --plugin semgrep --target ./src --output ./out \
  --ruleset ${CLAUDE_PLUGIN_ROOT}/tools/semgrep-rules/javascript \
  --extra-rules <repo-rules-path>/jwt-localstorage.yml

# Baseline + Ratchet (ADR-010)
npx static-runner --plugin semgrep ... --baseline .baseline.json --ratchet
npx static-runner --plugin semgrep ... --write-baseline .baseline.json
```

#### 번들 룰 경로 (git subtree from https://github.com/semgrep/semgrep-rules.git develop)

`tools/semgrep-rules/` 하위 폴더 = `--ruleset` 에 그대로 전달 가능:

| 경로                                      | 용도                                    |
| ----------------------------------------- | --------------------------------------- |
| `tools/semgrep-rules/python`              | Python 전반                             |
| `tools/semgrep-rules/javascript`          | JS (브라우저/Node)                      |
| `tools/semgrep-rules/typescript`          | TS                                      |
| `tools/semgrep-rules/java`                | Java                                    |
| `tools/semgrep-rules/go`                  | Go                                      |
| `tools/semgrep-rules/generic`             | 언어 무관 (secrets, RSA private key 등) |
| `tools/semgrep-rules/problem-based-packs` | 큐레이션 팩 (OWASP / SSRF 등)           |

업데이트: 유지보수자가 `git subtree pull --squash --prefix=ai-native-methodology/tools/semgrep-rules https://github.com/semgrep/semgrep-rules.git develop` 로 upstream 동기화.

### Tier 2 — 사용자 환경 SARIF import (v8.6.0 신설)

사용자가 자체 환경 (사내 CI / 로컬 Java 환경) 에서 도구 실행 후 SARIF 결과 흡수:

```bash
# 1. 사용자 환경 — 예: PMD 실행 (Java 8 or above)
pmd check -d ./src -R rulesets/java/quickstart.xml -f sarif -r ./out/pmd.sarif

# 2. plugin — SARIF import
npx static-runner --import-sarif ./out/pmd.sarif --import-driver pmd --output ./out \
  --reproduction-command "pmd check -d ./src -R rulesets/java/quickstart.xml -f sarif"

# 빈 SARIF (results=[]) 인 경우 = non_use_rationale 의무 (Adzic SBE 함정 회피)
npx static-runner --import-sarif ./out/pmd.sarif --import-driver pmd --output ./out \
  --reproduction-command "pmd check -d ./src -R rulesets/java/quickstart.xml -f sarif" \
  --non-use-rationale "legacy module — PMD 결함 0 사실 기록"
```

### Tier 2 4 조건 schema-level 강제 (Senior STRONG-STOP 흡수)

| #   | 조건                                                                    | 미만족 시                                                   |
| --- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | driver.name allowlist `[pmd]` (대소문자 무관 / 실 import 입증 driver 만 / 확장은 명시 등재) | `ImportSarifRejected: driver_name_not_allowlisted` (exit 4) |
| 2   | `runs[].results > 0` 또는 `--non-use-rationale` 명시                    | `ImportSarifRejected: empty_sarif_without_rationale`        |
| 3   | SARIF `invocations[].commandLine` 또는 `--reproduction-command` 명시    | `ImportSarifRejected: reproduction_command_missing`         |
| 4   | `evidence_trust = imported_sarif` (real_tool 과 결정적 구분)            | manifest 에 명시 / chain gate 가 별도 등급 평가             |

`manual` / `ai-generated` / 미명시 driver = 자동 reject (시뮬 우회 표면 차단).

## Outputs

산출물 (`<output>` 디렉토리):

- Tier 1: `<plugin>.stdout.log` / `<plugin>.stderr.log` / `<plugin>.sarif`
- Tier 2: `<driver>.imported.sarif` (사용자 SARIF copy)
- `static-runner.evidence.json` — 7종 물증 + cross_validation 메타 + `evidence_trust` 등급

### 7 evidence 필드 (schema enforcement)

`evidence_trust=real_tool` 시 7 필드 모두 의무 (`formal-spec.schema.json` enforcement):

| #   | 필드                   | 목적                                                            |
| --- | ---------------------- | --------------------------------------------------------------- |
| 1   | `tool_version`         | 도구 버전                                                       |
| 2   | `tool_stdout_path`     | raw stdout 로그                                                 |
| 3   | `tool_stderr_path`     | raw stderr 로그                                                 |
| 4   | `invocation_timestamp` | ISO timestamp                                                   |
| 4b  | `duration_ms`          | 실행 소요                                                       |
| 5   | `result_hash`          | SARIF SHA256 (위조 차단)                                        |
| 6   | `reproduction_command` | 사용자 재현 가능 명령                                           |
| 7   | `evidence_trust`       | enum [real_tool, imported_sarif, simulated] (v8.6.0 신설 / R19) |

`evidence_trust=imported_sarif` 시 (Tier 2): `tool_stdout_path` / `tool_stderr_path` = null (사용자 환경 stdout 부재 정직 표기 / 시뮬 ❌) / `duration_ms` = null (보강 carry). 나머지 7 필드 의무. 추가 필드: `imported_driver_name`, `imported_results_count`, `non_use_rationale`.

`evidence_trust=simulated` 시: ❌ 영구 reject (chain gate -5%p + block).

## Exit codes

| code  | 의미                                                              |
| ----- | ----------------------------------------------------------------- |
| 0     | success                                                           |
| 1     | finding ≥ 1 (severity 기반)                                       |
| 2     | usage error                                                       |
| **3** | Tier 1 환경 부재 ("환경 부재 — 사용자 위임" 정직 신호)            |
| **4** | Tier 2 import 4 조건 미만족 (`ImportSarifRejected`) — v8.6.0 신설 |

## 차단 룰 (`lint-no-simulation.sh`)

```bash
bash src/lint-no-simulation.sh <dir-with-evidence-or-manifest>
```

검사:

1. `simulation_only: true` 자동 fail
2. `real_tool: false` + `simulation_reason` 부재 → fail
3. `evidence_trust=real_tool` + 7 필드 1+ 누락 → fail
4. `evidence_trust=simulated` 검출 → fail (영구 reject)

CI step 통합 (`.github/workflows/drift-check.yml`).

## custom rules (rules/ 디렉토리 — P 의무 / dist 포함)

- `rules/jwt-localstorage.yml` (AP-FE-SECURITY-001 / 4 PoC isomorphic)
- 그 외 8 — error-mapping-missing 등

```bash
# custom rule self-test (rule + test pair 의무)
cd rules && semgrep --test --config <name>.yml <name>.{js,ts}
```

Windows 한국어 환경 `PYTHONUTF8=1` 의무 (yml 한글 message cp949 decode bug 회피).

## Sibling tools

- [`../spectral-runner/`](../spectral-runner/) — Tier 1 정합 외부 도구 (OpenAPI Spectral / Node.js)
- [`../drift-validator/`](../drift-validator/) + [`../decision-table-validator/`](../decision-table-validator/) — Phase 4.5 짝
- [`../_shared/baseline.js`](../_shared/) — ADR-010 baseline + ratchet 공용 모듈

## 참조

- `methodology-spec/plugin-charter.md` R19 (Tool Ecosystem Dependency Classification)
- ADR-009 (다이어그램 신뢰 모델 / 진짜 도구 +5~10%p) + ADR-010 (baseline + ratchet)
- DEC-2026-04-29-static-tool-실행-의무화 — no-simulation 정책 원본
- DEC-2026-05-18-runtime-tool-exclusion — R19 신설 + Tier 1/2/3 paradigm
- DEC-2026-05-02-v1.4.2-carry-2-3-종결 — custom Semgrep rule 첫 실현
- memory `feedback_no_static_tool_simulation.md`

## no-simulation 정합

본 도구는 진짜 외부 도구 wrapper. AI 추론 0%.

- Tier 1 환경 부재 = 정직 exit 3 / 시뮬레이션 대체 절대 금지
- Tier 2 import 4 조건 미만족 = 정직 exit 4 / 우회 표면 결정적 차단
- Tier 3 (simulated) = 영구 reject (chain gate -5%p + block)
