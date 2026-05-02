# static-runner

진짜 외부 정적 분석 도구 (Semgrep / PMD / SpotBugs / Daikon / CodeQL) 통합 host. **★★★ no-simulation 정책 enforcement** (DEC-2026-04-29-static-tool-실행-의무화 / Sprint 4 묶음 O).

## 핵심 원칙

> **AI sub-agent 에 "Static Analyzer persona" 부여 시뮬레이션 절대 금지**.
> 진짜 외부 도구 실행 의무. 환경 부재 시 정직 보고 + 사용자 위임 — 시뮬 결과를 신뢰도 근거로 절대 사용 금지.

## 5종 물증 의무화 (Sprint 4 신규)

`real_tool: true` 표기 시 다음 7 필드 모두 의무 (`formal-spec.schema.json` enforcement):

| # | 필드 | 목적 |
|---|---|---|
| 1 | `tool_version` | 도구 버전 |
| 2 | `tool_stdout_path` | raw stdout 로그 |
| 3 | `tool_stderr_path` | raw stderr 로그 |
| 4 | `invocation_timestamp` | ISO timestamp |
| 4b | `duration_ms` | 실행 소요 |
| 5 | `result_hash` | SARIF SHA256 (위조 차단) |
| 6 | `reproduction_command` | 사용자 재현 가능 명령 |

`real_tool: false` 표기 시 `simulation_reason` 필드 의무. `lint-no-simulation.sh` 가 grep 검증.

## 사용

```bash
# 단일 plugin
npx static-runner --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten

# 여러 plugin
npx static-runner --plugin semgrep --plugin pmd --target ./src --output ./out

# 환경 부재 시 — exit 3 ("환경 부재 — 사용자 위임" 정직 신호)
```

산출물 (`<output>` 디렉토리):
- `<plugin>.stdout.log` / `<plugin>.stderr.log` — raw 로그 (물증)
- `<plugin>.sarif` — SARIF 표준 출력 (Code Scanning 호환)
- `static-runner.evidence.json` — 5종 물증 + cross_validation 메타

## 차단 룰 (`lint-no-simulation.sh`)

```bash
bash src/lint-no-simulation.sh <dir-with-evidence-or-manifest>
```

검사:
1. `simulation_only: true` 자동 fail
2. `real_tool: false` + `simulation_reason` 부재 → fail
3. `real_tool: true` + 5종 물증 필드 1+ 누락 → fail

CI step 으로 통합 (Sprint 4 `.github/workflows/drift-check.yml` 정합).

## 1차 plugin 범위 (Sprint 4 + ★ v1.4.2 갱신)

- ✅ `semgrep` — `p/owasp-top-ten` ruleset 1차 (★ v1.4.1 pip 채널 진짜 실행 종결) + ★ ★ ★ 사내 custom rule (★ v1.4.2 첫 실현 — `rules/jwt-localstorage.yml`)
- ⏳ 사내 custom rule 추가 (RSA git commit / JWT secret 길이) — v1.4.3 또는 v1.5 carry
- ✅ `pmd` — `rulesets/java/quickstart.xml` 1차
- ⏳ `spotbugs` / `daikon` / `codeql` — v1.2.x 또는 v1.3 후속. plugin 인터페이스 (`Plugin` 클래스) 만 산출.

### ★ v1.4.2 — `--extra-rules` 옵션 신규

```bash
node ai-native-methodology/tools/static-runner/src/cli.js \
  --plugin semgrep \
  --target <dir> \
  --output <dir> \
  --ruleset p/owasp-top-ten \
  --extra-rules ai-native-methodology/tools/static-runner/rules/jwt-localstorage.yml
```

- 멀티 지정 가능 (`--extra-rules <r1> --extra-rules <r2>`)
- Semgrep `--config` 멀티 정합 (★ Semgrep 공식 CLI reference)
- ★ rule id `internal.fe.security.<name>` fully qualified slug 권고 (★ `--rewrite-rule-ids` default ON 실측 — SARIF ruleId 안정)
- rule + test pair 의무: `rules/<name>.yml` + `rules/<name>.{js,ts}` (★ Semgrep convention — test fixture 명명은 `<rule>.<ext>` / `.test.<ext>` ❌ 실측 정정)
- 검증: `cd rules && semgrep --test --config <name>.yml <name>.{js,ts}` (★ Windows 한국어 환경 `PYTHONUTF8=1` 의무 — yml 한글 message cp949 decode bug 회피)

## Noise 관리 (ADR-010 후보 — baseline + ratchet)

본 도구는 **단일 run** 만 수행. baseline + ratchet 전략 (테크기업 사례 — Slack/GitLab/Dropbox/Figma/Shopify 운영 표준):
- **첫 run** = baseline snapshot 저장 (기존 부채 처리)
- **CI 는 baseline 대비 신규 alert 0 만 fail**
- **매 sprint baseline 1~5% 축소 의무**
- diff-aware: `SEMGREP_BASELINE_REF=main` 환경변수 활용

운영 정책은 `decisions/` 의 ADR-010 후보 (Sprint 5 격상).

## 환경 부재 처리 (Sandbox / 본 세션)

본 Sprint 4 작성 환경 (사용자 macOS) — Java/Semgrep/PMD 부재 검출 → preflight 단계에서 `PluginEnvironmentMissing` throw → exit 3. 시뮬레이션 대체 절대 금지. **사용자가 환경 설치 또는 CI 위임 결정** 후 Phase D-optional carry-over.
