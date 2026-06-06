---
name: analysis-aspect-static-security
description: Use when Semgrep / SpotBugs / PMD / Bandit / ESLint / Snyk / OSV-Scanner is configurable for the project's stack. Generates static-security-spec.json (산출물 12). Track-agnostic (BE+FE+DB). Real tool execution MANDATORY — CLAUDE.md no-simulation. ADR-009 단계 5 도달 의무 (단계 4 = AI persona simulation 차단). Stage = analysis, aspect = cross-cutting.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# aspect-static-security — Static Security 분석

no-simulation 정책 핵심 적용 영역. 진짜 도구 실행 의무.

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md` (원칙 / R19 Tier 정의 / 7 evidence 필드 / 신뢰도 단계 4·5).

- 본 skill 도구 매핑: Semgrep·ESLint = Tier 1 (in-plugin) / PMD·SpotBugs·CodeQL·Daikon·Bandit·Snyk·OSV-Scanner·SonarQube = Tier 2 (사용자 환경 SARIF import).

## 사전 조건

- 도구 사용 가능 환경 (해당 stack 에 한해)

## 절차

1. **stack 별 도구 매핑** (R19 Tier 명시):
   - **Tier 1 — 다중 언어 (in-plugin)**: Semgrep (Python pipx / Java 소스 source-pattern 분석 가능)
   - **Tier 2 — 다중 언어 (사용자 환경 SARIF import)**: SonarQube / CodeQL
   - **Tier 2 — Java (사용자 환경)**: PMD (Java 8 or above) / SpotBugs (JRE 11+) / Checkstyle
   - **Tier 1 — JS/TS (in-plugin)**: ESLint security plugin
   - **Tier 2 — JS/TS (사용자 환경)**: Snyk
   - **Tier 2 — Python (사용자 환경)**: Bandit
   - **Tier 2 — dependency (사용자 환경)**: OSV-Scanner / Snyk / Dependabot
2. **static-runner 호출** — `tools/static-runner/` 가 도구 hook 통합 (Plugin host 패턴)
3. **도구별 실 실행** — `node ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/cli.js --plugin <semgrep|pmd> --target <dir> --output <dir>` (cli.mjs MCP wrapper = carry-over)
4. **번들 룰 우선 사용** — `tools/semgrep-rules/` 가 git subtree 로 vendor (install 시 자동 동봉, 사내 정책으로 semgrep registry 막힌 환경 1차 대응):

   ```bash
   # 번들 룰 (registry 의존 0 — 권장 default)
   node ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/cli.js \
     --plugin semgrep \
     --target <dir> \
     --output <dir> \
     --ruleset ${CLAUDE_PLUGIN_ROOT}/tools/semgrep-rules/python

   # registry pack (registry 접근 가능 환경에서만)
   node ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/cli.js \
     --plugin semgrep \
     --target <dir> \
     --output <dir> \
     --ruleset p/owasp-top-ten

   # `--extra-rules <path>` 사내 custom rule 병행 (멀티 지정 가능)
   node ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/cli.js \
     --plugin semgrep \
     --target <dir> \
     --output <dir> \
     --ruleset ${CLAUDE_PLUGIN_ROOT}/tools/semgrep-rules/javascript \
     --extra-rules tools/static-runner/rules/jwt-localstorage.yml
   ```

   - 사례: `rules/jwt-localstorage.yml` (AP-FE-SECURITY-001)
   - rule + test pair 의무: `rules/<name>.yml` + `rules/<name>.{js,ts}` (Semgrep convention `<rule>.<ext>` / `.test.<ext>` ❌)
   - 검증: `cd rules && semgrep --test --config <name>.yml <name>.{js,ts}`
   - Windows 한국어 환경 `PYTHONUTF8=1` 의무 (yml 한글 message cp949 decode bug 회피 / Linux CI 환경 무관)

5. **baseline + ratchet 통합 의무** — legacy 진입 시 첫 분석 = baseline 등재 / 신규 결함만 차단:

   ```bash
   # 첫 run — baseline 작성
   node ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/cli.js ... --write-baseline <path>/semgrep-baseline.json
   # CI run — ratchet
   node ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/cli.js ... --baseline <path>/semgrep-baseline.json --ratchet
   # exit 0 = baseline + 신규 0 / exit 1 = 신규 ≥ 1
   ```

   - critical/high severity = baseline 등재 ❌ (production blocker)
   - medium/low = baseline grandfathered + 분기별 review

6. **환경 부재 시** — 사용자에게 준비 요청 또는 CI 위임 명시. finding 등재 (`Type: gap, Action: 환경 X 준비 또는 CI Y 추가`).
7. **결과 통합** — severity / category / CWE mapping. SARIF → finding 어댑터 (sarif-to-finding.js).
8. **AP-SECURITY-XXX 등재** — anti-pattern (`quality` phase 통합). ≥2 PoC corroboration 패턴은 본체 antipattern 카탈로그 격상 검토.
9. **static-security-spec.json 작성** — `schemas/static-security-spec.schema.json`

## 산출물

- `<user-project>/.aimd/output/static-security-spec.json`
- 각 도구의 raw 출력 (`<user-project>/.aimd/output/tool-runs/`)
- baseline 파일 (`<user-project>/.aimd/baseline/<tool>-baseline.json`)

## CI 통합

baseline+ratchet 를 사용자 CI 에 통합 — 변경 시 ratchet exit 1 로 회귀 차단. 예시 워크플로 패턴은 repo CI 가이드 참조 (dist 미포함 CI 경로 직접 인용은 case-by-case dist-dangling 정책으로 제거).

## 인용

- 정책: `methodology-spec/deliverables/12-static-security-spec.md`
- schema: `schemas/static-security-spec.schema.json`
- 도구: `tools/static-runner/` (`--extra-rules` 옵션 / `rules/jwt-localstorage.yml` 사례)
- 결단: DEC-2026-04-29-static-tool-실행-의무화
- 결단: DEC-2026-05-02-v1.4.1-Semgrep-carry-종결
- 결단: DEC-2026-05-02-v1.4.2-carry-2-3-종결
- ADR: ADR-009 (5단계 신뢰도 모델)
- ADR: ADR-010 (baseline + ratchet gate)
- ADR: ADR-FE-007 (FE 보안 antipattern 카탈로그)
