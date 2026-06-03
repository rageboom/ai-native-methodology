---
name: analysis-code-graph
description: Use during analysis stage to index the codebase with CodeGraph OSS (@colbymchenry/codegraph) — a MANDATORY analysis tool (Semgrep 동급 / DEC-2026-05-30-codegraph-essential). Generates code-graph.json (code↔code 구조 reference-lens). Real tool execution MANDATORY — CLAUDE.md no-simulation (환경 부재 시 exit 3 정직 신호 / persona simulation 차단). trust 모델 — 출력은 reference-lens / finding 으로만 수용, 어떤 결정적 gate 에도 inject ❌ (DEC-2026-05-28 §4.2). Track-agnostic (BE+FE+DB). Stage = analysis, aspect = cross-cutting.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-code-graph — CodeGraph OSS code↔code 구조 인덱싱 (필수 도구)

DEC-2026-05-30-codegraph-essential: CodeGraph OSS = analysis 단계 필수 도구 (Semgrep 동급 / 무조건 실행). code↔code 구조(method/class/route/call)는 LLM 운영 컨텍스트의 reference lens.

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md`.

- 본 skill 도구: 진짜 CodeGraph OSS (R19 Tier 1 in-env / `codegraph index` AST 결정적 추출). 환경 부재 시 `codegraph-runner` exit 3 (정직 신호) → 사용자 설치 (`npm i -g @colbymchenry/codegraph`) 또는 CI 위임. **LLM 추론 대체 ❌**.

## trust 모델 (DEC-2026-05-28 §4.2 — 본격 결합 의무)

- code-graph.json = **reference-lens / finding 으로만 수용**. 어떤 결정적 gate 에도 **inject ❌** (codegraph 자신의 원칙 "the graph provides context, not requirements" 정합).
- 결정적 검증은 본 방법론 dep-graph(artifact-graph) + chain gate 가 SSOT. codegraph 는 코드 흐름 참고 lens (보완).

## 사전 조건

- CodeGraph OSS 설치 (`npm i -g @colbymchenry/codegraph` / v0.9.x+). 부재 시 exit 3 → 사용자 위임.

## 절차

1. **codegraph-runner 실 실행** — `tools/codegraph-runner/` 가 codegraph CLI 통합 (init -i / index → status --json):

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/codegraph-runner/src/cli.js --target <project-dir> --output <user-project>/.aimd/output
   ```

   - 최초 = `codegraph init -i <target>` (인덱싱) / 재실행 = `codegraph index <target>` (증분).
   - cross-platform (Windows 전역 npm bin `.cmd` shim = shell 경유 정상 / Node 22 정합).

2. **환경 부재 시 (exit 3)** — 사용자에게 설치 요청 또는 CI 위임 명시. finding 등재 (`Type: gap, Action: codegraph 설치 또는 CI step 추가`).
3. **code-graph.json 검토 (reference-lens)** — `index_stats` (files/nodes/edges/languages/nodes_by_kind) 로 코드 구조 규모 파악. probe 사실: Java/Spring route·DI·interface ⭐⭐⭐ / MyBatis 3 mapper XML statement ⭐⭐⭐ / JPA derived query 최상 / iBATIS 2 sqlMap = 0 (string literal 한계) / DB table 경계 ❌ (schema.json + sql-inventory 보완).
4. **질의 (선택 / 참고)** — `codegraph callers/callees/impact <symbol>` 로 code↔code 영향 추적 (cross-domain caller 자동 추출). 결과는 finding (reference) 으로만 (gate inject ❌).
5. **finding 등재 (필요 시)** — codegraph 가 발견한 code-level risk (예: undeclared cross-domain 호출 cycle) = `_base-log-finding` 으로 reference finding 등재 (severity 부여 / status=open / **gate blocker 아님**).

## 산출물

- `<user-project>/.aimd/output/code-graph.json` (`schemas/code-graph.schema.json` / reference-lens / NOT gate-injected)
- codegraph raw 출력 (`codegraph.stdout.log` / `codegraph.stderr.log`)
- codegraph index store (`<project-dir>/.codegraph/` — `.aimd/` 와 동급 도구 인덱스 / `.gitignore` 권고)

## 본체 명세

- `schemas/code-graph.schema.json`
- `tools/codegraph-runner/` (codegraph index + status --json → code-graph.json / 7-field evidence / no-simulation exit 3)
- DEC-2026-05-30-codegraph-essential (codegraph 필수 도구 격상 / DEC-2026-05-27 scope-out supersede)
- DEC-2026-05-28-codegraph-probe-결과 (probe #1 iBATIS / Java layer ⭐⭐⭐ / trust 모델 §4.2)
- DEC-2026-05-30-codegraph-probe-2-mybatis3 (probe #2 MyBatis 3 mapper ⭐⭐⭐)
- DEC-2026-05-30-codegraph-probe-3-jpa (probe #3 JPA 최상)
- ADR-009 (5단계 신뢰도 모델 — 단계 5 도달 의무 / 단계 4 = -5%p 패널티 / 차단)
