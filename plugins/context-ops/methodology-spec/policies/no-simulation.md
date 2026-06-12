# no-simulation 정책 (canonical SSOT)

> baseline. 각 skill/agent 는 본 파일을 가리키고, 자신에게 적용되는 도구 Tier 매핑만 inline delta 로 유지한다.

## 1. 원칙

- 실행 확인된 도구만 "실행"으로 표기한다(정직 표기). 실행한 적 없는 도구를 "실 실행 의무"로 나열하지 않는다.
- AI sub-agent 에 "Static Analyzer persona" 를 부여해 도구 실행을 흉내내는 시뮬레이션은 금지한다. 위반 = 신뢰 모델 단계 4 = 신뢰도 -5%p + "진짜 도구 미실행" 명시 의무 + 영구 reject.

## 2. R19 Tier 분류

> **분류 축 = 실행 locus**. Tier 1 = **plugin 이 직접 실행**(런타임 JVM 의존 여부 무관 — Gradle·JUnit·PMD 같은 JVM 도구도 plugin 이 직접 돌리면 Tier 1). Tier 2 = **사용자 CI/환경에서 실행한 SARIF 를 import**. 두 축은 orthogonal — 한 도구가 양쪽에 동시에 존재할 수 있다(PMD). (축 명문화 근거 = ## 인용.)

- **Tier 1 (in-plugin 실제 실행)**: Semgrep / ESLint / Spectral / axe-core·Playwright / **PMD** (JDK+PMD 설치 시 plugin 직접 실행 / 2-paradigm 실측 corroboration) / 테스트 단계 stack runner (Gradle·JUnit / vitest 등). 실 실행 + 5종 물증(`evidence_trust=real_tool`) 의무 → 신뢰 모델 단계 5. **환경(도구 바이너리) 부재 시 = preflight `PluginEnvironmentMissing` → cli exit 3 (정직 "환경 부재" 신호 / "항상 자동실행" 아님 / LLM 추론 대체 ❌)**.
- **Tier 2 (사용자 환경 SARIF import / plugin 자동 실행 ❌)**: import allowlist = **PMD** (본 환경 실 import 입증 driver). 사용자가 자기 CI/환경에서 실행해 SARIF 를 import 할 때 `evidence_trust=imported_sarif` (`tool_stdout_path=null` 정직 표기). PMD 는 **Tier 1(in-plugin 자동) + Tier 2(import) 양쪽 유효** — in-plugin 실행이 불가한 환경에선 import 경로로 흡수. 부재 = environment-dependent carry (날조 ❌). **SpotBugs/CodeQL/Daikon/SonarQube 등 실행·import 이력 0 도구는 "사용 toolset" 으로 나열 ❌** (실행 못 하는 도구 인용 금지 / 사용자가 자기 환경서 쓰면 allowlist 명시 확장 = `static-runner` `IMPORTED_DRIVER_ALLOWLIST`).
- **Tier 3 (simulated)**: `evidence_trust=simulated` = -5%p + chain gate block + 영구 reject.

## 3. 7 evidence 필드 contract

`tool_version` / `stdout_path` / `stderr_path` / `invocation_timestamp` + `duration_ms` / `result_hash` / `reproduction_command` / `evidence_trust` enum {real_tool, imported_sarif, simulated}.

## 4. 환경 부재 처리

환경 부재 시 Tier 분류대로 정직 carry (사용자 환경 준비 / CI 위임 명시). Tier 2/3 혼동 금지. LLM 추론으로 도구 결과를 대체하지 않는다.

**residual(미해소 잔여) 2종 구분** (DEC-2026-06-12 / **soft·서술 정책 — `REQUIRED_VALIDATORS_PER_STAGE` 미편입 / reference-lens 경계**): 정직 carry 라도 해소 경로가 다르다. **(a) 도구-환경 부재 carry** (R19 Tier 2 environment-dependent — Semgrep/PMD 등 바이너리 부재) → 사용자 CI/환경에서 도구 실행 시 해소. **(b) 산출물-본질 carry** (AC 행위가 **SQL-embedded** 등이라 런타임 GREEN 이 정적으로 불가) → SQL 술어는 `data_source_status=code_only`+`sql_id` 로 정적 특성화하되(`23-characterization-spec.md §11.1`), **런타임 정합은 QA·통합 테스트에서 실데이터로만** 확인 = `real_integration_score=0` 이 그 정직 신호. 두 경로 모두 **DB 접속/컨테이너를 방법론이 요구하지 않으며**, (b) 를 "검증완료/GREEN" 으로 승격하면 즉시 no-simulation 위반. 본 구분은 **결정론 게이트가 아니라 서술 정책**이다 — SQL-embedded 전용 enum/layer 의 schema 박제는 §8.1 상 ≥2 distinct 도메인 corroboration 전까지 **propose-only**(현재 `layer=integration`+`sql_id` 로 표현 충분).

## 인용

- ADR: `docs/adr/ADR-009-다이어그램-신뢰-모델.md` §2.2 / §2.5 (신뢰 모델 단계 4·5)
- R19 근거: `methodology-spec/plugin-charter.md`
- 결단: DEC-2026-05-18-runtime-tool-exclusion
- 결단: DEC-2026-06-06-tool-allowlist-pmd-only (Tier 2 import allowlist=PMD 축소 / 실행 이력 0 도구 제거)
- 결단: DEC-2026-06-07-pmd-tier1-promotion (Tier 분류 축 = 실행 locus 명문화 / PMD Tier 1 in-plugin 자동실행 편입 / import 경로 orthogonal 보존)
- 결단: DEC-2026-06-12-sql-embedded-static-residual-reframe (residual 2종 구분[도구-환경부재 vs 산출물-본질 SQL-embedded] / "real-DB 천장" → code_only+sql_id 정적특성화 + 런타임 QA carry reframe / DB·testcontainer 미요구 / reference-lens soft 정책)
