# static-runner/ — 외부 정적 분석 host (★ ★ ★ no-simulation 정책 핵심 enforcement)

## Purpose

진짜 외부 정적 분석 도구 (Semgrep / PMD / SpotBugs / Daikon / CodeQL) 통합 host. ★ ★ ★ **no-simulation 정책 enforcement** (DEC-2026-04-29-static-tool-실행-의무화). AI sub-agent persona 시뮬레이션 ❌ / 진짜 도구 실행 의무.

## 핵심 원칙

> **AI sub-agent 에 "Static Analyzer persona" 부여 시뮬레이션 절대 금지**.
> 진짜 외부 도구 실행 의무. 환경 부재 시 정직 보고 + 사용자 위임 — 시뮬 결과를 신뢰도 근거로 절대 사용 금지.

## When to call

- **trigger**: Phase 4.5+ / Phase 6 quality / chain 4 impl 후
- **호출자**: skill `aspect-static-security` / `phase-6-quality` 자동 호출
- **수동**: `npx static-runner --plugin <name> ...`

## Inputs

```bash
# 단일 plugin
npx static-runner --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten

# 여러 plugin
npx static-runner --plugin semgrep --plugin pmd --target ./src --output ./out

# ★ v1.4.2 — `--extra-rules` 옵션 (custom Semgrep rule)
npx static-runner --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten \
  --extra-rules <repo-rules-path>/jwt-localstorage.yml

# Baseline + Ratchet (★ ADR-010)
npx static-runner --plugin semgrep ... --baseline .baseline.json --ratchet
npx static-runner --plugin semgrep ... --write-baseline .baseline.json
```

## Outputs

산출물 (`<output>` 디렉토리):
- `<plugin>.stdout.log` / `<plugin>.stderr.log` — raw 로그 (★ 물증)
- `<plugin>.sarif` — SARIF 표준 출력 (Code Scanning 호환)
- `static-runner.evidence.json` — 5종 물증 + cross_validation 메타

### 5종 물증 의무화 (★ Sprint 4 신설)

`real_tool: true` 표기 시 7 필드 모두 의무 (`formal-spec.schema.json` enforcement):

| # | 필드 | 목적 |
|---|---|---|
| 1 | `tool_version` | 도구 버전 |
| 2 | `tool_stdout_path` | raw stdout 로그 |
| 3 | `tool_stderr_path` | raw stderr 로그 |
| 4 | `invocation_timestamp` | ISO timestamp |
| 4b | `duration_ms` | 실행 소요 |
| 5 | `result_hash` | SARIF SHA256 (위조 차단) |
| 6 | `reproduction_command` | 사용자 재현 가능 명령 |

`real_tool: false` 표기 시 `simulation_reason` 의무. `lint-no-simulation.sh` 가 grep 검증.

## Exit codes

| code | 의미 |
|---|---|
| 0 | success |
| 1 | finding ≥ 1 (severity 기반) |
| 2 | usage error |
| **3** | ★ 환경 부재 ("환경 부재 — 사용자 위임" 정직 신호) |

## 차단 룰 (`lint-no-simulation.sh`)

```bash
bash src/lint-no-simulation.sh <dir-with-evidence-or-manifest>
```

검사:
1. `simulation_only: true` 자동 fail
2. `real_tool: false` + `simulation_reason` 부재 → fail
3. `real_tool: true` + 5종 물증 필드 1+ 누락 → fail

CI step 통합 (`.github/workflows/drift-check.yml`).

## 1차 plugin 범위

- ✅ `semgrep` — `p/owasp-top-ten` ruleset 1차 (★ v1.4.1 pip 채널 진짜 실행 종결) + ★ ★ ★ 사내 custom rule (★ v1.4.2 첫 실현 — `rules/jwt-localstorage.yml` + 8개)
- ✅ `pmd` — `rulesets/java/quickstart.xml` 1차
- ⏳ `spotbugs` / `daikon` / `codeql` — v2.x carry / plugin 인터페이스 = `Plugin` 클래스 (`src/runner.js`)

## custom rules (★ rules/ 디렉토리 — P 의무 / dist 포함)

- `rules/jwt-localstorage.yml` (★ AP-FE-SECURITY-001 / 4 PoC isomorphic)
- 그 외 8 — error-mapping-missing 등

```bash
# custom rule self-test (★ rule + test pair 의무)
cd rules && semgrep --test --config <name>.yml <name>.{js,ts}
```

★ Windows 한국어 환경 `PYTHONUTF8=1` 의무 (yml 한글 message cp949 decode bug 회피).

## Sibling tools

- [`../spectral-runner/`](../spectral-runner/) — 진짜 외부 도구 #1 (OpenAPI Spectral)
- [`../drift-validator/`](../drift-validator/) + [`../decision-table-validator/`](../decision-table-validator/) — Phase 4.5 짝
- [`../_shared/baseline.js`](../_shared/) — ADR-010 baseline + ratchet 공용 모듈

## 참조

- ADR-009 (다이어그램 신뢰 모델 / 진짜 도구 +5~10%p) + ADR-010 (baseline + ratchet)
- DEC-2026-04-29-static-tool-실행-의무화 — no-simulation 정책
- DEC-2026-05-02-v1.4.2-carry-2-3-종결 — custom Semgrep rule 첫 실현
- memory `feedback_no_static_tool_simulation.md`

## ★★★ no-simulation 정합

본 도구는 진짜 외부 도구 wrapper. AI 추론 0%. 환경 부재 = 정직 exit 3 / 시뮬레이션 대체 절대 금지.
