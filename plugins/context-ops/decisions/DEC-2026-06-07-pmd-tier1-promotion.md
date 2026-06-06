# DEC-2026-06-07-pmd-tier1-promotion

**결단**: R19 Tier 분류 축을 **"실행 locus"** 로 명문화하고, **PMD 를 Tier 1 (plugin in-plugin 자동 실행) 으로 편입**. import 경로(Tier 2 SARIF import allowlist=`['pmd']`)는 **orthogonal 로 보존**(제거 ❌) — PMD 는 in-plugin 자동 + 사용자 CI import 양쪽 유효. 분류 기준은 "런타임 JVM 의존 여부"가 아니라 "plugin 이 직접 실행하느냐 vs 사용자 CI 결과를 import 하느냐".

**작성일**: 2026-06-07 (사용자 채널: "java 가 있으면 자동으로 되네는 안되나?" → 환경 실측 → "A 진행" → "B"(정식화)).

**version**: plugin.json 0.1.0 → 0.2.0 (MINOR / 신규 in-plugin 도구 능력).

**relates to**:
- `DEC-2026-06-06-tool-allowlist-pmd-only` (Tier 2 import allowlist=`['pmd']` 축소) — **무변경 + orthogonal 축 신설**(supersede 아님 / 아래 §3).
- `DEC-2026-05-18-runtime-tool-exclusion` (R19 Tier 발원).
- `methodology-spec/policies/no-simulation.md` (R19 Tier SSOT — 축 명문화 반영).
- `feedback_no_static_tool_simulation.md` / `feedback_no_unrunnable_tool_citation.md` (정직성 — 본 격상은 실 실행 물증으로 충족).

---

## 1. 배경

R19 charter(plugin-charter.md:29) 는 Tier 1 을 "in-plugin native / **JVM 의존 0**", Tier 2 를 "JVM 의존 도구" 로 정의했다. 그러나:

- **no-simulation.md (canonical SSOT) §2** 는 Tier 1 에 "테스트 stack runner (**Gradle·JUnit** / vitest)" 를 이미 포함 = JVM 도구를 Tier 1 로 둠. → charter R19 의 "JVM 의존 0" = **SSOT 와 모순되는 stale drift** (Senior 사실 확인).
- 진짜 변별 축은 **실행 locus** (plugin 직접 실행 vs 사용자 CI import) 였음.

사용자 질문("java 가 있으면 자동으로 되나")을 계기로 in-plugin PMD 자동 실행을 실측 입증 → charter↔SSOT 모순 해소 + PMD Tier 1 편입.

## 2. 물증 (spike + §8.1 corroboration)

환경: OpenJDK 25 LTS + PMD 7.25.0 (Windows / pmd.bat shell 경유).

| PoC | paradigm | 경로 | 결과 |
| --- | --- | --- | --- |
| poc-06 efiweb-exchange | Legacy Spring4.1 | Tier2 import | 17 findings / imported_sarif / hash 09ec18ad… |
| poc-06 efiweb-exchange | Legacy Spring4.1 | **Tier1 auto-run** | 17 findings / **real_tool** / 1992ms / hash 09ec18ad…(import 와 **동일** = 결정성 입증) |
| poc-10 realworld-jpa | **Modern JPA/QueryDSL** | **Tier1 auto-run** | 42 findings / real_tool / 2312ms |

→ legacy + modern 2 distinct paradigm in-plugin 자동실행 입증 = §8.1 단일 PoC 과적합 회피 충족. 사내 Modern 재측정은 별도 carry (CLAUDE.md "Modern=OSS 한정" 패턴 계승).

## 3. DEC-2026-06-06 과의 관계 (orthogonal — supersede 아님)

DEC-2026-06-06 의 결정 내용(`IMPORTED_DRIVER_ALLOWLIST=['pmd']`)은 **그대로 유지**된다. 그 근거는 "JVM 회피"가 아니라 "**실 import/실행 이력 0 도구 나열 ❌**"(no-unrunnable-tool-citation) 였는데, 본 격상은 PMD 에 in-plugin 실행 물증(real_tool/duration/hash)을 확보하므로 그 정직성 원칙을 **위반이 아니라 충족**한다. 두 결정은 다른 축(import allowlist 범위 ↔ 실행 locus)에서 orthogonal 하게 공존.

## 4. 결정 내용

- **코드** (`tools/static-runner/`):
  - `runner.js`: `Plugin` 에 `shell` 옵션(Windows .bat 대응 / default false = Semgrep 무영향) + `versionParse` 콜백(default 첫 줄 / PMD 는 ASCII 배너 회피 semver 추출). `PmdPlugin` (`check -d -R -f sarif -r --no-progress`) + `PLUGINS.pmd` 등록.
  - `cli.js`: usage/error 메시지 plugin-aware(`<semgrep|pmd>` / PMD 환경부재 설치 안내).
  - `test/runner.test.js`: PmdPlugin 단위 test +6 (args/shell/versionParse/default). 헤더 정정(v8.6.0 제거 → Tier1 재도입). import test 보존.
  - 검증: static-runner **35/35 green** (29 → 35). live PMD `tool_version='PMD 7.25.0'` 정상.
- **doc (Tier 축 명문화 + PMD Tier1)**: `no-simulation.md`(SSOT) · `plugin-charter.md`(R19 L29·R15 L51 "JVM 의존 0" 정정 + L55 allowlist `['pmd']`) · 루트 `CLAUDE.md` · `lifecycle-contract.md` · `deliverables/{12,21}` · `workflow/formal-spec.md` · skills(`analysis-aspect-static-security` · `analysis-formal-spec-validation` · `implement-generate-impl-spec` · `_base-apply-baseline-ratchet`) · `templates/adoption/CLAUDE.md` · `tools/README.md`.
- **version**: plugin.json 0.2.0 + CHANGELOG [0.2.0].

## 5. 정직성 / Non-goal / carry

- **R-1 (과대광고 회피)**: "PMD 항상 자동실행" 아님 — JDK/PMD 부재 시 preflight `PluginEnvironmentMissing` → cli **exit 3** (정직 "환경 부재" 신호 / LLM 추론 대체 ❌ / Semgrep 동형).
- import 경로 제거 아님 (orthogonal 보존).
- 사내 Modern in-plugin 재측정 = carry. JSP grammar 한계(poc-17 F-PMD-PARSE-001)는 별개 도구 한계 carry.
- Windows pmd.bat = `execSync`/`shell:true` 경유 (Node 22+ CVE-2024-27980 EINVAL 회피).
