---
name: aspect-static-security
description: Use when Semgrep / SpotBugs / PMD / Bandit / ESLint / Snyk / OSV-Scanner is configurable for the project's stack. Generates static-security.json (산출물 12). Track-agnostic (BE+FE+DB). Real tool execution MANDATORY — CLAUDE.md ★★★ no-simulation. ADR-009 단계 4 도달 의무. Stage = analysis, aspect = cross-cutting.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# aspect-static-security — Static Security 분석

★★★ no-simulation 정책 핵심 적용 영역. 진짜 도구 실행 의무.

## ★★★ no-simulation 절대 금지 (CLAUDE.md)

- ❌ AI sub-agent 에 "Static Analyzer / Semgrep persona" 부여 시뮬레이션 금지
- ✅ 진짜 외부 도구 실행 의무 (Semgrep / PMD / SpotBugs / Bandit / Snyk / OSV-Scanner / CodeQL / SonarQube)
- ✅ 환경 부재 시 사용자 위임 (CI) 명시
- ✅ 시뮬레이션 사용 시 신뢰도 -5%p 패널티

## 사전 조건

- 도구 사용 가능 환경 (해당 stack 에 한해)

## 절차

1. **stack 별 도구 매핑**:
   - **다중 언어**: Semgrep / SonarQube / CodeQL
   - **Java**: PMD / SpotBugs / Checkstyle
   - **JS/TS**: ESLint security plugin / Snyk
   - **Python**: Bandit
   - **dependency**: OSV-Scanner / Snyk / Dependabot
2. **static-runner 호출** — `tools/static-runner/` 가 도구 hook 통합
3. **도구별 실 실행** — `tools/static-runner/cli.mjs ...`
4. **환경 부재 시** — 사용자에게 준비 요청 또는 CI 위임 명시. finding 등재 (Type: gap, Action: 환경 X 준비 또는 CI Y 추가)
5. **결과 통합** — severity / category / CWE mapping
6. **AP-SECURITY-XXX 등재** — anti-pattern (Phase 6 통합)
7. **static-security.json 작성** — `schemas/static-security.schema.json` (v1.4 신규)

## 산출물

- `<user-project>/.aimd/output/static-security.json`
- 각 도구의 raw 출력 (`<user-project>/.aimd/output/tool-runs/`)

## 본체 명세

- `methodology-spec/deliverables/12-static-security.md` (v1.4)
- `schemas/static-security.schema.json`
- `tools/static-runner/`
- DEC-2026-04-29-static-tool-실행-의무화
- ADR-009 (5단계 신뢰도 — 단계 4 도달 의무)
