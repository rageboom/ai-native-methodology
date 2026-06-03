---
name: analysis-html-template
description: Use when project contains JSP / Thymeleaf / EJS / ERB / Razor server-rendered templates. Extracts template hierarchy, form actions, scriptlet warnings, XSS risk markers using external static analyzers (SonarQube / PMD JSP / jsp-lint). LLM 양심 정량 ❌ (no-simulation 의무). Track = Scenario C (JSP) — state-map ❌ / server-side state 본질. Stage = analysis (신규 phase `template-analyze`).
allowed-tools: Read, Glob, Grep, Bash
---

# analysis-html-template — server-rendered template 흡수 (Scenario C)

JSP / Thymeleaf / EJS / ERB / Razor 같은 server-side template 을 입력 받아 template hierarchy + form actions + scriptlet warning + XSS marker 추출. **진짜 외부 static analyzer 실 실행 의무**.

> **단일 책임**: server-rendered template 흡수 + anti-pattern 검출 (외부 도구). state-map 은 본 skill scope 외 (server-side state 본질 / BE rules 담당).

## 사전 조건 (의무 / no-simulation 정합)

- **진짜 외부 정적 분석 도구 가용**:
  - JSP = SonarQube (`Web:JspScriptletCheck` `rspec-1459` `rspec-1932`) 또는 PMD JSP ruleset 또는 `jsp-lint`
  - Thymeleaf = SpotBugs FindSecBugs 또는 SonarQube
  - EJS / ERB / Razor = 언어별 linter (eslint-plugin-ejs / rubocop / dotnet-format 등)
- 미설치 시 **state.blocked + 사용자 안내** (skill 강행 ❌ / LLM 양심 count ❌ / Senior STRONG-STOP risk + -5%p 패널티)
- Scenario detection 결과 = C (be-fe-separation.md §2)

## 절차

1. **외부 도구 가용성 확인** — `which sonar-scanner` / `which pmd` / `npx jsp-lint --version` 등. 미설치 시 state.blocked.
2. **template 파일 전수 조사** — `find . -name "*.jsp" -o -name "*.html" -o -name "*.thymeleaf"` (Scenario C signal).
3. **외부 도구 실 실행** — 진짜 호출 / output capture:
   ```bash
   # JSP 권장
   sonar-scanner -Dsonar.projectKey=<scope> -Dsonar.sources=<jsp-dir>
   # 또는
   pmd check -d <jsp-dir> -R rulesets/jsp/basic.xml -f json -r <out>.json
   # 또는
   npx jsp-lint <jsp-dir> --json > <out>.json
   ```
4. **template hierarchy 추출** — `<%@ include %>` / `<jsp:include>` / Thymeleaf `th:replace` `th:insert` / EJS `<%- include() %>` 그래프 구축.
5. **form action 추출** — `<form action="...">` 값 + method (post/get) + hardcoded vs EL 표현식 + Spring `@RequestMapping` cross-link 후보.
6. **scriptlet finding 흡수** — 외부 도구 output JSON parse → `<% ... %>` count + line + severity 그대로 등재. **LLM 자체 count ❌**.
7. **XSS marker 흡수** — `<%= %>` (raw output) / Thymeleaf `th:utext` (unescaped) / EJS `<%- %>` (raw) 같은 unescaped output 외부 도구 finding 인용.
8. **산출 작성** — `.aimd/<scope>/planning/html-template-extract.json` (schema = `schemas/html-template-extract.schema.json`).

## 산출물

- `.aimd/<scope>/planning/html-template-extract.json` (strict / additionalProperties:false)

## 정책 (v3.4.0 G4)

- **JSP scriptlet 정책 = 0 absolute** (사용자 결단 2026-05-15 / JSP 2.0 / Servlet 2.4 기준 deprecated 이후 / EL + JSTL paradigm 정합). scriptlet 1건 이상 검출 시 finding severity = critical / migration-cautions.json 등재 의무.
- **외부 도구 finding 정량 = 그대로 인용** — LLM 가공 ❌ / 양심 count ❌. `external_tool_output.output_path` schema 필드 의무 (역추적용).
- **form action 분산 anti-pattern** — 공식 SonarQube rule 부재 → grep 기반 자체 rule (사용자 결단 carry / 1차 = log only severity).

## scope-out

- state-map (server-side state 본질 / `analysis-business-rules` 담당)
- visual manifest (Playwright 진짜 실행 / `analysis-ui-visual-manifest-fe` 담당 / be-fe-separation.md §5.1 인용)
- interaction (prototype 연결 / server-rendered template = stateless)

## 본체 명세 참조

- `methodology-spec/be-fe-separation.md` §5.1 Scenario C 통합 산출 절차
- `methodology-spec/plugin-charter.md` §1 R8 + R14 + §3 G4
- `methodology-spec/migration-cautions-fe.md` (JSP-specific 함정)
- `flows/analysis.phase-flow.json` 신규 phase `template-analyze`
- SonarSource rules: `Web:JspScriptletCheck` / `rspec-1459` / `rspec-1932`

## When NOT to invoke

- Scenario A (분리 React+TS) — 본 skill 부적합 / `analysis-ui-visual-manifest-fe` 호출
- Scenario B (Next.js 풀스택) — server-rendered template 부재 (RSC 는 별도 paradigm) / 본 skill 부적합
- 외부 정적 도구 미설치 — state.blocked + 사용자 안내 (LLM 양심 count ❌)
