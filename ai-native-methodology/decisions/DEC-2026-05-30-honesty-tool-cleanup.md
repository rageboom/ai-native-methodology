# DEC-2026-05-30-honesty-tool-cleanup

> ★ v11.13.1 PATCH release SSOT. no-simulation 절(CLAUDE.md) 정직성 cleanup — 실행 못 하는 도구를 "실제 실행 의무"로 나열한 stale flat-framing 을 R19 Tier 정합으로 reframe. carry `C-honesty-tool-cleanup` 종결.
> 상태: **승인 + 시행 완료** (2026-05-30 / session 56차). 사용자 결단 — v11.13.0 후 "다음 작업" → carry queue 평가 → AskUserQuestion "no-simulation 정직성 cleanup" → 접근 fork "R19 Tier-honest reframe (이름 유지·plugin 미실행 명시)". 원 지적(2026-05-30): "SpotBugs/Daikon 이건 왜 자꾸 써있냐 쓰지도 못하는데 다 지워줘" (memory `feedback_no_unrunnable_tool_citation`).

## 배경

CLAUDE.md "Static Tool 시뮬레이션 절대 금지" 절이 R19(DEC-2026-05-18-runtime-tool-exclusion) 이전 framing 으로 잔존 — "✅ 진짜 외부 도구 (Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube) **실제 실행 의무**"로 6개를 평면 나열. 그러나 SpotBugs·Daikon·CodeQL·SonarQube 는 본 방법론 환경에서 **실 실행 이력 없음** (PoC 전수 "미실행"/"simulation_only"/"부재" 표기 / 이번 session preflight 도 semgrep·pmd·spotbugs absent 재확인). 실행 못 하는 도구를 "실행 의무"로 적는 것 = no-simulation 정책 형해화.

## 결단 — R19 Tier-honest reframe (CLAUDE.md only / breaking 0)

도구는 **실행 확인된 것만 "실행"으로 표기**. CLAUDE.md 절을 R19 3-Tier 로 reframe:
- ❌ **Tier 3 (simulated)** — AI persona 시뮬레이션 = 영구 reject + -5%p + "진짜 도구 미실행" 명시.
- ✅ **Tier 1 (in-plugin 실제 실행)** — Semgrep / ESLint / Spectral / axe-core·Playwright / 테스트 stack runner(Gradle·JUnit·vitest). 실 실행 입증 채널.
- ✅ **Tier 2 (사용자 환경 SARIF import / ★ plugin 자동 실행 ❌)** — PMD / SpotBugs / CodeQL / Daikon / SonarQube. 사용자가 자기 CI/환경 실행·import 시만 `evidence_trust=imported_sarif`(`tool_stdout_path=null`). 부재=carry(날조 ❌). PMD = poc-17 사용자 환경 실 실행 / 나머지 4 = 본 환경 실 실행 이력 없음 정직 인지.

## scope 결정 (정직)

- **활성 doc 중 flat-framing = CLAUDE.md 유일.** agents(analysis/implement/spec/_base-senior) / methodology-spec(workflow/formal-spec, deliverables, lifecycle-contract) / ADR-009·010 / plugin-charter R15·R19 / skills(analysis-aspect-static-security) / static-runner = **이미 R19 Tier framing** (Tier 2 = "사용자 환경 SARIF import" 명시 = 정직). → 무변경.
- **R19 Tier 2 분류 + `IMPORTED_DRIVER_ALLOWLIST=[pmd,spotbugs,codeql,daikon]` (static-runner / plugin-charter R19 / ADR-009) = schema-enforced 정식 기능** → 이름 literal 삭제 ❌ (삭제 시 R19 breaking). reframe = "plugin 미실행/import-only" 명시로 정직 해소 + R19 보존.
- **archive/dist-history·decisions·CHANGELOG-HISTORY·INDEX-HISTORY = 동결 이력** → 무변경.

## STOP-3
workspace 875/875 (영향 0 / doc-only) + release-readiness 22/22 + skill-citation 0 stale + version 3-way 11.13.1 + breaking 0 = **PATCH**.

## carry
`C-honesty-tool-cleanup` ✅ **종결** (CHANGELOG v11.7.0 area 등록분).

## paradigm 정합
- **정직 표기**: 실행 확인된 채널(Tier 1)과 미실행 채널(Tier 2 import-only)을 명확 구분 — no-simulation 정책 정신 복원.
- **R19 보존**: 정직성 ≠ 기능 삭제. Tier 2 SARIF import 는 사용자가 실제 도구를 돌리는 정당 경로 → 분류 유지.
- **self-referential drift 회피**: 사용자 직접 지적(실 신호) 기반 honesty-debt 해소 = self-referential 아님.

## 인용
- `CLAUDE.md` §Static Tool 시뮬레이션 절대 금지 (reframe 대상)
- DEC-2026-05-18-runtime-tool-exclusion (R19 / Tier 분류 원전) + ADR-009 §2.1 단계 5 / §2.2 도구 종류 표
- `methodology-spec/plugin-charter.md` R19 (`IMPORTED_DRIVER_ALLOWLIST`)
- memory `feedback_no_unrunnable_tool_citation` + `feedback_no_static_tool_simulation` + `feedback_environment_dependent_tools_scope_out`
