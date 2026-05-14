---
name: analysis-aspect-static-security
description: Use when Semgrep / SpotBugs / PMD / Bandit / ESLint / Snyk / OSV-Scanner is configurable for the project's stack. Generates static-security.json (산출물 12). Track-agnostic (BE+FE+DB). Real tool execution MANDATORY — CLAUDE.md ★★★ no-simulation. ADR-009 단계 5 도달 의무 (★ 단계 4 = AI persona simulation 차단). Stage = analysis, aspect = cross-cutting.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# aspect-static-security — Static Security 분석

★★★ no-simulation 정책 핵심 적용 영역. 진짜 도구 실행 의무 → ADR-009 단계 5 도달.

## ★★★ no-simulation 절대 금지 (CLAUDE.md)

- ❌ AI sub-agent 에 "Static Analyzer / Semgrep persona" 부여 시뮬레이션 금지 (★ ADR-009 단계 4 = -5%p 패널티)
- ✅ 진짜 외부 도구 실행 의무 (Semgrep / PMD / SpotBugs / Bandit / Snyk / OSV-Scanner / CodeQL / SonarQube) → ADR-009 단계 5
- ✅ 환경 부재 시 사용자 위임 (CI) 명시
- ✅ 5종 물증 의무 (`tool_version` / `stdout_path` / `stderr_path` / `invocation_timestamp` + `duration_ms` / `result_hash` / `reproduction_command`)

## 사전 조건

- 도구 사용 가능 환경 (해당 stack 에 한해)

## 절차

1. **stack 별 도구 매핑**:
   - **다중 언어**: Semgrep / SonarQube / CodeQL
   - **Java**: PMD / SpotBugs / Checkstyle
   - **JS/TS**: ESLint security plugin / Snyk
   - **Python**: Bandit
   - **dependency**: OSV-Scanner / Snyk / Dependabot
2. **static-runner 호출** — `tools/static-runner/` 가 도구 hook 통합 (Plugin host 패턴)
3. **도구별 실 실행** — `node tools/static-runner/src/cli.js --plugin <semgrep|pmd> --target <dir> --output <dir>` (★ cli.mjs MCP wrapper = carry-over)
4. **★ v1.4.2 — 사내 custom rule 적용** — `--extra-rules <path>` 옵션 (멀티 지정 가능):
   ```bash
   node tools/static-runner/src/cli.js \
     --plugin semgrep \
     --target <dir> \
     --output <dir> \
     --ruleset p/owasp-top-ten \
     --extra-rules tools/static-runner/rules/jwt-localstorage.yml
   ```
   - 사례: `rules/jwt-localstorage.yml` (★ AP-FE-SECURITY-001 / 4 PoC isomorphic 직접 confirm 도달)
   - rule + test pair 의무: `rules/<name>.yml` + `rules/<name>.{js,ts}` (★ Semgrep convention `<rule>.<ext>` / `.test.<ext>` ❌)
   - 검증: `cd rules && semgrep --test --config <name>.yml <name>.{js,ts}`
   - ★ Windows 한국어 환경 `PYTHONUTF8=1` 의무 (yml 한글 message cp949 decode bug 회피 / Linux CI 환경 무관)
5. **★ ADR-010 baseline + ratchet 통합 의무** — legacy 진입 시 첫 분석 = baseline 등재 / 신규 결함만 차단:
   ```bash
   # 첫 run — baseline 작성
   node tools/static-runner/src/cli.js ... --write-baseline <path>/semgrep-baseline.json
   # CI run — ratchet
   node tools/static-runner/src/cli.js ... --baseline <path>/semgrep-baseline.json --ratchet
   # exit 0 = baseline + 신규 0 / exit 1 = 신규 ≥ 1
   ```
   - critical/high severity = baseline 등재 ❌ (★ ADR-010 §2.3 = production blocker)
   - medium/low = baseline grandfathered + 분기별 review
6. **환경 부재 시** — 사용자에게 준비 요청 또는 CI 위임 명시. finding 등재 (`Type: gap, Action: 환경 X 준비 또는 CI Y 추가`).
7. **결과 통합** — severity / category / CWE mapping. SARIF → finding 어댑터 (sarif-to-finding.js).
8. **AP-SECURITY-XXX 등재** — anti-pattern (Phase 6 통합). 4 PoC isomorphic 패턴은 본체 antipattern 카탈로그 (ADR-FE-007) 격상 검토.
9. **static-security.json 작성** — `schemas/static-security.schema.json` (v1.4 신규)

## 산출물

- `<user-project>/.aimd/output/static-security.json`
- 각 도구의 raw 출력 (`<user-project>/.aimd/output/tool-runs/`)
- baseline 파일 (`<user-project>/.aimd/baseline/<tool>-baseline.json`) — ADR-010

## CI 통합 (drift-check.yml 정합)

`.github/workflows/drift-check.yml` 의 PoC #04 full FE 트랙 step 패턴 참고 (★ v1.4.2 첫 운영 입증 / ratchet exit 1 정상 작동).

## 본체 명세

- `methodology-spec/deliverables/12-static-security.md` (v1.4)
- `schemas/static-security.schema.json`
- `tools/static-runner/` (★ v1.4.2 — `--extra-rules` 옵션 / `rules/jwt-localstorage.yml` 사례)
- DEC-2026-04-29-static-tool-실행-의무화
- DEC-2026-05-02-v1.4.1-Semgrep-carry-종결 (★ Semgrep pip 채널)
- DEC-2026-05-02-v1.4.2-carry-2-3-종결 (★ custom rule + CI ratchet)
- ADR-009 (5단계 신뢰도 모델 — ★ 단계 5 도달 의무 / 단계 4 = -5%p 패널티 / 차단)
- ADR-010 (baseline + ratchet — 점진 quality gate)
- ADR-FE-007 (FE 보안 antipattern 카탈로그 — AP-FE-SECURITY-001 4 PoC isomorphic)
