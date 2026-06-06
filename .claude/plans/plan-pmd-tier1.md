# plan — PMD Tier 2(import) → Tier 1(in-plugin auto-run) 정식 격상

> Work Principles 4원칙. 본 plan = 1원칙(깊은 숙지) 산출. 작성 2026-06-07.
> 사용자 결단(AskUserQuestion 2026-06-07): **Q1=A 실행 locus 축 + PMD Tier 1 편입** / **Q2=poc-10 JPA Modern 2nd corroboration**.

## 0. 목적

PMD 를 R19 Tier 2(사용자 환경 SARIF import 전용) 에서 **Tier 1(plugin in-plugin 자동 실행)** 으로 정식 격상. 단 import 경로는 보존(능력 가산, 제거 아님).

## 1. 배경 / 깊은 숙지 결과

### 1.1 발견된 핵심 충돌 (taxonomy)

- **charter R19 (plugin-charter.md:29)**: Tier 1 = "in-plugin native / **JVM 의존 0**" / Tier 2 = "**JVM 의존 도구**". → 이 문구대로면 PMD(JVM)는 정의상 Tier 1 불가.
- **no-simulation.md (canonical SSOT) §2**: Tier 1 에 "테스트 stack runner (**Gradle·JUnit** / vitest)" 포함 = 이미 JVM 도구를 Tier 1 로 둠. → charter R19 의 "JVM 의존 0" = **부정확 문구(drift)**.
- **결단 A**: 진짜 축 = **실행 locus** (Tier 1 = plugin 직접 실행 / Tier 2 = 사용자 CI import). charter R19 line 29 문구를 이 축으로 정정.

### 1.2 직전 결정과의 관계

- **DEC-2026-06-06-tool-allowlist-pmd-only**: allowlist `[pmd,spotbugs,codeql,daikon]`→`[pmd]` 축소. 근거 = "**실 import/실행 이력 0 도구 나열 ❌**"(no-unrunnable-tool-citation) — JVM 회피가 아니라 **정직성**. 본 격상이 in-plugin 실행 물증을 확보 → 그 근거를 **충족**시킴(상충 아님). 관계 = **부분 supersede**(Tier 2 import 경로 보존 / in-plugin 실행 추가).
- **v8.6.0 history**: 과거 PMDPlugin 존재했으나 import 패턴 전환하며 제거(runner.test.js:2). 본 작업 = **물증 동반 재도입**.

### 1.3 발견된 부수 drift (같이 정리)

- charter R19(line 55) + R15(line 51): allowlist 텍스트 `[pmd,spotbugs,codeql,daikon]` / "PMD/SpotBugs/CodeQL/Daikon" = 2026-06-06 PMD-only 결정 미반영 stale. (코드는 이미 `['pmd']`.)

## 2. 확보된 물증 (spike + corroboration)

| PoC | paradigm | 경로 | 결과 |
| --- | --- | --- | --- |
| poc-06 efiweb-exchange | Legacy Spring4.1 | Tier2 import | 17 findings / imported_sarif / hash 09ec18ad… |
| poc-06 efiweb-exchange | Legacy Spring4.1 | **Tier1 auto-run** | 17 findings / **real_tool** / duration 1992ms / hash 09ec18ad…(import 와 동일=결정성) |
| **poc-10 realworld-jpa** | **Modern JPA/QueryDSL** | **Tier1 auto-run** | **42 findings / real_tool / duration 2312ms** |

→ 2 distinct paradigm(legacy+modern) in-plugin 자동실행 입증 = §8.1 corroboration 충족.
환경: OpenJDK 25 LTS + PMD 7.25.0 (Windows).

## 3. 작업 스코프

### 3.1 코드 (tools/static-runner/)

- `src/runner.js`:
  - [spike 완료] `Plugin` 에 `shell` 옵션(default false, Windows .bat 대응 / Semgrep 무영향).
  - [spike 완료] `PmdPlugin` + `PLUGINS.pmd` 등록.
  - **[신규 fix]** `tool_version` 파싱 버그 — PMD `--version` 은 ASCII 배너 먼저 출력 → `split('\n')[0]` 이 배너를 잡음. `Plugin` 에 `versionParse` 콜백(default = 첫 줄) 추가, PMD 는 `/PMD \d+\.\d+\.\d+\S*/` 추출 override.
- `src/cli.js`: usage/error 메시지 semgrep 단독 가정 정정(`Tier 1 = semgrep,pmd`), env-missing 안내 plugin-aware(`install pmd` 분기).

### 3.2 test

- `test/runner.test.js`: PmdPlugin args/shell/versionParse 단위 test 추가(±4). 기존 import test 보존(import 경로 유지). 헤더 주석 "PMDPlugin 제거" → "Tier1 재도입" 정정.
- 목표: static-runner **그린 유지**(현 29 → ~33).

### 3.3 doc (Tier 재분류 A)

- `methodology-spec/policies/no-simulation.md` (SSOT): Tier 1 목록에 PMD 추가 + **축 명문화**(실행 locus). Tier 2 = import-only 잔여 도구(없음/사용자 확장)로 정리. PMD import 경로 보존 명시.
- `methodology-spec/plugin-charter.md`: R19 line 29 "JVM 의존 0"→"import 의존 0(plugin 직접 실행)" 정정 / line 55·R15 line 51 allowlist drift 정리 + PMD Tier1.
- `CLAUDE.md`(root): R19 Tier 절 — "import allowlist=PMD only / plugin 직접 안 돌림" → "PMD = Tier 1 in-plugin 자동실행(+import 경로 보존)" 갱신.
- `methodology-spec/lifecycle-contract.md` / `deliverables/12-static-security-spec.md`(captured_by/Tier 표) / `deliverables/21-impl-spec.md` / `workflow/formal-spec.md` / `sub-rules/spring41-ibatis2-isomorphic.md`: PMD Tier 표기 갱신.
- skills: `analysis-aspect-static-security`(Tier 매핑 PMD Tier2→Tier1) / `analysis-formal-spec-validation` / `implement-generate-impl-spec` / `_base-apply-baseline-ratchet`: PMD Tier 표기 갱신.
- `guides/getting-started.md`: PMD 설치 안내(선택) 추가 가능.

### 3.4 decision / status

- 신규 `decisions/DEC-2026-06-07-pmd-tier1-promotion.md` (배경/물증/축 결정/부분 supersede/v8.6.0 재도입 이력).
- `decisions/INDEX.md` + `decisions/STATUS.md` 갱신.

### 3.5 version / changelog

- `plugin.json` 0.1.0 → **0.2.0** (MINOR — 신규 in-plugin 도구 능력).
- `CHANGELOG.md` [0.2.0] 작성.

### 3.6 release-readiness

- `scripts/release-readiness.js` 40/40 유지(skill-citation doc 인용 정합). workspace 무회귀.

## 4. 검증 기준 (gate)

- static-runner test 그린(~33/33).
- release-readiness 40/40.
- drift-validator 통과(charter/no-sim/skill 정합).
- 실 PMD 2-PoC 물증 재현 가능(reproduction_command).

## 5. Risk / 주의

- **R-1 정직성**: Tier 1 격상은 "plugin 이 PMD 를 항상 자동 실행"이 아님 — **환경(JDK+PMD) 부재 시 preflight→PluginEnvironmentMissing→exit 3 정직 신호**(Semgrep 동형). 이 점 doc 에 명시(과대광고 ❌).
- **R-2 §8.1**: 2 PoC(legacy+modern)로 충족하나 사내 Modern 재측정은 별도 carry 가능.
- **R-3 import 경로**: 제거 ❌. 사용자가 자기 CI PMD 결과 import 도 계속 유효(allowlist `['pmd']` 유지).
- **R-4 버전 환경 의존**: PMD 7.x / JDK 11+ 요건 doc 명시.

## 5b. Research 반영 (2026-06-07 / 3-agent)

- **공식 PMD 사실**: exit 0=clean / 4=위반발견 / 5=recoverable error / 1=exception / 2=usage. SARIF `-f sarif` 네이티브 ✓ / `rulesets/java/quickstart.xml` 유효 ✓ / 런타임 최소 Java 8 ✓. `--version` 포맷 공식 미확인 → **semver 정규식 `/\b\d+\.\d+\.\d+\S*/` 추출** (실측 배너 회피).
- **Senior REVISE 반영**:
  - (R3) DEC-2026-06-06 관계 = "supersede" ❌ → **"orthogonal 축 신설"**. import allowlist `['pmd']` 은 **무변경**. 실행-locus 축(Tier1 in-plugin)만 신설. PMD = in-plugin 자동 + import 둘 다 유효.
  - (R4-a) charter "JVM 의존 0" 문구 정정 = R19 line29 **+ R15 line51** 양쪽.
  - (R4-b) `runner.test.js` header line2 **+ line3**("Sandbox Java 부재 가정") 정정.
  - (R4-c) `run()` 이 SARIF 생성 후 `preflight()` 재호출(version 이중 실행, pre-existing) → versionParse fix 가 preflight 단독/run내부 양쪽 일관 동작 test.
  - (R4-d) schema Tier/captured_by enum 점검 = static-security-spec.schema.json captured_by 에 PMD 항목 **불필요**(PMD=QA/메트릭, 보안도구 아님) → 무변경 확인.
- **전수 스캔 추가 대상**: `templates/adoption/CLAUDE.md:62`(stale 4종 나열) + `tools/README.md:263`(stale 4종). release-readiness/preflight/drift-validator = Tier assertion 0 → **회귀 risk 0**.

## 6. Lessons Learned

- **PMD `--version` = ASCII 배너 먼저** → `split('\n')[0]` 가 배너 잡음(████). `versionParse` 콜백 + semver 정규식으로 해소. 도구별 version 출력 가정(첫 줄) 일반화 금지.
- **Windows pmd.bat = execFileSync EINVAL** (Node 22+ CVE-2024-27980) → `shell:true` 필수. codegraph-runner 선례 동형.
- **result_hash 결정성 입증**: poc-06 Tier1 auto-run hash = Tier2 import hash 동일(09ec18ad…) → 두 경로 일관성의 강한 물증. corroboration 질 ↑.
- **release-readiness 환경 민감성**: `workspace_test_pass` 가 이 Windows+Bash-tool 환경에서 "0 collected" 로 fail — **clean 트리(40/40 주장 커밋)에서도 동일 재현** = NODE_TEST_CONTEXT 누출 아티팩트, 회귀 아님. 게이트 실패 시 "내 변경 vs 환경" 분리 검증(stash→clean 재현) 의무 = 정직 표기.
- **provenance leak 가드**: shipped doc 본문에 inline `DEC-*`/`poc-*` 마커 = check40 fail. 거버넌스 마커는 `## 인용` footer 로. (no-simulation.md §2 본문 정정.)
- **Senior REVISE 사실성**: "supersede" → "orthogonal 축 신설" 정밀화가 정직성에 중요(allowlist 무변경 사실 정합).
