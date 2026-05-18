# Plugin Charter — AI-Native Methodology

> 본 플러그인이 **반드시 가져야 하는 능력**의 단일 SSOT.
> 작성일 2026-05-15 / 작성자 윤주스 (TF Lead).
> 신규 기능 / 변경 시 본 charter 의 20 항목 + §4 권장 디폴트 정합 의무.
> ★ v8.6.0 (2026-05-18) — **R19 신설** (Tool Ecosystem Dependency Classification).
> ★ v8.6.1 (2026-05-18) — **R20 신설** (MCP Ticket Sync Channel / Tier 2.5 — MCP delegation only).

## §1 사용자 요구사항 20 (must-have / ★ R20 v8.6.1 신설 / R19 v8.6.0 / R18 v7.1.0 / R16·R17 영구 scope-out)

| # | 요구 | 범주 |
|---|------|------|
| R1 | 분석 단계는 **기존 프로젝트 + 기획서** 를 분석할 수 있다 | analysis-input |
| R2 | 분석은 **한번에 다 하지 않고 plan 으로** 진행한다 | plan-driven |
| R3 | **작업 단위를 적절히 쪼개서** 하나씩 마쳐 나간다 | task-decompose |
| R4 | 생성된 **산출물은 재사용된다** | artifact-reuse |
| R5 | 산출물은 **사용자 프로젝트에 위치**되고 그 자리에서 사용된다 | artifact-location |
| R6 | **Claude Code 최적화 디폴트**를 기본 제공한다 (§4 참조) | cc-defaults |
| R7 | 산출물은 **작업 단위로 폴더화**되어 저장 + 재사용 | artifact-folder |
| R8 | 분석 입력 5종 지원 — (a) 기존 코드 / (b) **Figma** / (c) **Swagger/OpenAPI** / (d) 기획 문서 경로 / (e) **자연어 prompt** | analysis-input |
| R9 | **분석 → 스펙** 생성 | chain-2 |
| R10 | **스펙 → 테스트** 생성 | chain-3 |
| R11 | **테스트 → 구현** 생성 | chain-4 |
| R12 | 각 단계는 **agent / skill / hook 을 적절히 활용** | stage-asset-mapping |
| R13 | 본 chain 은 **기능 추가 / 수정에 반복 적용** | revisit-loop |
| R14 | **BE / FE 별 맞춤 산출물** (test / impl / spec) | be-fe-split |
| R15 | **정적 도구 검증 필수** (시뮬레이션 ❌) | static-tool |
| ~~R16~~ | ~~작업은 MCP 를 통해 티켓 등록~~ | ★ **영구 scope-out (v3.6.0 / 2026-05-15 사용자 결단)** — `mcp__wiki-jira-assistant` 수동 처리로 충분 / 자동 티켓화 가치 < 비용 |
| ~~R17~~ | ~~모든 단계마다 티켓 발행~~ | ★ **영구 scope-out (v3.6.0 / 2026-05-15)** — 위와 동일 |
| R18 | **플러그인 자산(Skill/Hook/Agent/packaging)은 Anthropic 공식 best practice 정합** + 공식 docs 변경 시 재검증 — `plugin-authoring-spec.md` 단일 SSOT (★ v7.1.0 신설 / 사용자 결단 = 정식 R / §5 backlog ❌) | plugin-authoring |
| R19 | **외부 도구 의존 분류** — Tier 1 (in-plugin native / JVM 의존 0) / Tier 2 (사용자 환경 SARIF import / JVM 의존 도구) / Tier 3 (simulated 영구 reject). 4 조건 schema-level 강제 (driver allowlist + non-empty results + reproduction_command + evidence_trust 3-tier) — ★ v8.6.0 신설 (Senior STRONG-STOP 전면 흡수 / no-simulation 정책 정합 / sub-axis evolution paradigm 정합) | tool-ecosystem |
| R20 | **MCP Ticket Sync Channel** — chain stage 종료 동기로 사용자 보유 jira-confluence MCP (`mcp__wiki-jira-assistant__*`) 호출 / 모든 호출 직전 사용자 confirmation gate 의무 / 7-field evidence 캡쳐 / Tier 2.5 (MCP delegation) only — Tier 3 (자체 platform adapter) = v9.0+ carry. R16/R17 부활 ❌ — DEC-2026-05-15-g1-itsm-permanent-scope-out §31 path "별도 charter 요구 신설 (R18+)" 정합. ★ v8.6.1 신설 (DEC-2026-05-18-r20-mcp-ticket-sync-channel) | ticket-lifecycle |

## §2 현 구현 매핑 (v3.1.0 기준 / 2026-05-15)

| # | 판정 | 근거 |
|---|------|------|
| R1 | ✅ | `methodology-spec/workflow/input.md` — 5종 입력 명시 (소스코드/ERD/DB/기획문서/자연어) |
| R2 | ✅ | `flows/analysis.phase-flow.json` 11 phase 의존 그래프 + Work Principles 4원칙 (`CLAUDE.md`) |
| R3 | ✅ | `skills/planning-decompose-use-cases/` + `tools/traceability-matrix-builder/` |
| R4 | ✅ | `schemas/` 31종 + `templates/{analysis,planning,spec,test,implement,design}/` |
| R5 | ✅ | `tools/chain-driver/src/state-store.js` `ensureScopeDir` + `chain-driver init --scope <s>` + SessionStart hook 자동 발동 (v3.2 G3 종결 / DEC-2026-05-15-g3-scope-folder-종결) |
| R6 | ✅ | `hooks/hooks.json` (SessionStart + UserPromptSubmit + PreToolUse) + `CLAUDE.md` 23 policies |
| R7 | ✅ | scope/stage 폴더 컨벤션 `.aimd/<scope>/{planning,spec,test,impl}/` + manifest 이중 렌더링 (`manifest.json` + `manifest.md`) 자동 생성. `lifecycle-contract.md` §파일 위치 컨벤션 + `id-conventions.md` §scope slug 명문화 (v3.2 G3 종결) |
| R8 | ✅ | (★ v3.3.0 G2 종결 / 2026-05-15) 5종 모두 자산 대칭. (a) `analysis-input-collection` + `analysis-source-inventory` 22 skill / (b) **`analysis-from-figma`** (Figma desktop MCP 4 도구) / (c) **`analysis-from-swagger`** (`@readme/openapi-parser`) / (d) **`analysis-from-plan-doc`** (md + pdf + Notion export) / (e) **`analysis-from-prompt`** + **`analysis-input-orchestrate`** (자연어 1발화 → 자동 dispatch + cross-ref + conflict) |
| R9 | ✅ | `flows/spec.phase-flow.json` (chain 2) + `skills/spec-compose-behavior-spec/` |
| R10 | ✅ | `flows/test.phase-flow.json` (chain 3 / RED 의무) + `tools/test-impl-pass-validator/` |
| R11 | ✅ | `flows/implement.phase-flow.json` (chain 4 / GREEN 100% pass) |
| R12 | ✅ | (★ v3.5.0 G5 종결) `flows/sdlc-4stage-flow.json` + `skills-axis.md` + **`methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스** (★ stage × (agent / skill / hook / tool / validator) 8 row 본 매트릭스 + 부 매트릭스 R8 입력 6 row / 사용자 진입 시 단일 SSOT) |
| R13 | ✅ | `sdlc-4stage-flow.json` `revisit_edges` 6종 (planning↔analysis, spec↔planning, test↔spec, impl↔{test,spec,planning,analysis}) |
| R14 | ✅ | (★ v3.4.0 G4 종결 / 2026-05-15) `be-fe-separation.md` + scenario A/B/C. **FE skill 9** = analysis 5 (`-fe` + `analysis-from-figma`) + chain 4 `implement-react`/`implement-vue` + chain 3 `test-playwright` + Scenario C `analysis-html-template`. chain 4 FE impl 분기 + e2e POM paradigm + JSP 외부 도구 검증 모두 자산화. |
| R15 | ✅ | `tools/static-runner/` Tier 1 = Semgrep (in-plugin / JVM 의존 0) + Tier 2 = 사용자 환경 SARIF import (PMD/SpotBugs/CodeQL/Daikon) + gate #4 강제 + no-simulation 정책 + 4 조건 schema-level enforcement (v8.6.0 R19 정합) |
| ~~R16~~ | ★ scope-out | ★ **영구 폐기 (v3.6.0 / 2026-05-15 사용자 결단)** — `mcp__wiki-jira-assistant` 수동 처리로 충분 / 자동 티켓화 가치 < 비용. plan-itsm-jira-chain-integration.md 도 이미 폐기 완료 (session 16차). |
| ~~R17~~ | ★ scope-out | ★ **영구 폐기 (v3.6.0 / 2026-05-15)** — 위와 동일 |
| R18 | ✅ | (★ v7.1.0 신설 / DEC-2026-05-17-plugin-authoring-spec) `methodology-spec/plugin-authoring-spec.md` 단일 SSOT (Skill S1~S7 / Hook H1~H7 / Agent A1~A6 / Packaging P1~P4 + §6 공식 docs pin baseline) + `docs/adr/ADR-PLUGIN-001` + `scripts/release-readiness.js` **check #12** (§6 staleness 결정적 가드 60일) + §9 네트워크 재검증 cadence (`_base-official-docs-checker` dispatch). 감사 — 실 위반 S3 1건 ❌(한글 skill MAJOR rename 이연) + 1군 ⚠️(`_base-*` charset 이연) / 나머지 정합 |
| R19 | ✅ | (★ v8.6.0 신설 / DEC-2026-05-18-runtime-tool-exclusion) `tools/static-runner/src/runner.js` 의 `IMPORTED_DRIVER_ALLOWLIST` + `importSarif` 함수 = 4 조건 강제 (driver allowlist `[pmd, spotbugs, codeql, daikon]` + non-empty results 또는 `non_use_rationale` 의무 + `reproduction_command` 의무 + `EVIDENCE_TRUST` enum `[real_tool, imported_sarif, simulated]`). Tier 3 (simulated) = chain gate -5%p + block. F-015 6/6 verbatim (Semgrep Python pipx / Spectral Node.js / PMD Java 8 or above / SpotBugs JRE 11+ / SARIF 2.1.0 Plus Errata 01). Senior STRONG-STOP 전면 흡수 (confidence 0.84) — `feedback_no_static_tool_simulation.md` 정합. |
| R20 | ✅ | (★ v8.6.1 신설 / DEC-2026-05-18-r20-mcp-ticket-sync-channel) `skills/ticket-sync/SKILL.md` 5 stage matrix (analysis/planning/spec/test/implement) + `mcp__wiki-jira-assistant__*` 위임 (jira 18 + wiki 13 tools) + confirmation gate 의무 (preview MD → yes/no/dry-run halt) + 7-field evidence (`schemas/ticket-sync-evidence.schema.json` / static-runner `REQUIRED_EVIDENCE` 재사용) + `traceability-matrix.ticket_ref.status_history` + search-first idempotency (`jira_search` JQL by UC-*) + `hooks/hooks.json` PreToolUse matcher 에 `mcp__wiki-jira-assistant__.*` 추가 (state.blocked 시 deny). R16/R17 부활 ❌ — 신규 채널. |

**요약 (v8.6.1 갱신)**: ✅ **17** / ⚠️ **1** / ❌ 0 / ★ **scope-out 2** (R16/R17 영구 폐기). 활성 요구 = **18/18** 자산 대칭 (★ R20 v8.6.1 신설 / R19 v8.6.0).

## §3 Gap 우선순위

> 2026-05-15 갱신 — G3 종결 (v3.2) / **G2 종결 (v3.3.0)** / **G4 종결 (v3.4.0)** / **G5 종결 (v3.5.0)** / **G1 영구 scope-out (v3.6.0 / 2026-05-15 / DEC-2026-05-15-g1-itsm-permanent-scope-out)**.
> ★ ★ ★ **활성 charter Gap = 모두 청산**. R16/R17 = scope-out 영구 폐기 (사용자 명시 결단).

| 순위 | Gap | 영향 | 후속 |
|------|-----|------|------|
| ~~G1~~ | ~~R16/R17 ITSM/Jira 자동 티켓화~~ | ★ **scope-out (v3.6.0 / 2026-05-15)** — 사용자 영구 폐기 결단. `mcp__wiki-jira-assistant` 수동 처리로 충분. plan-itsm 도 폐기 완료 (session 16차). 향후 재제안 ❌. |
| ~~G5~~ | ~~R12 lifecycle stage↔asset 매핑표 부재~~ | ✅ **종결 (v3.5.0 / 2026-05-15)** — `lifecycle-contract.md` §자산 매핑 매트릭스 신설 (본 매트릭스 8 row + 부 매트릭스 R8 입력 6 row + Scenario cross-link). `DEC-2026-05-15-g5-lifecycle-asset-matrix-종결.md` 참조. |
| ~~G4~~ | ~~R14 FE skill 보강~~ | ✅ **종결 (v3.4.0 / 2026-05-15)** — 후보 C 채택 / 4 skill + 본문 분기 + 1 schema + 5 test pass. `DEC-2026-05-15-g4-fe-skill-track-종결.md` 참조. |
| ~~G2~~ | ~~R8 Figma / Swagger 입력 skill 부재~~ | ✅ **종결 (v3.3.0 / 2026-05-15)** — BCDE 5 skill + 5 schema + 25 test pass + orchestrator paradigm. `DEC-2026-05-15-g2-orchestrate-skill-분리-채택.md` 참조. |
| ~~G3~~ | ~~R5/R7 산출물 폴더 자동 생성~~ | ✅ **종결 (v3.2 / 2026-05-15)** — scope/stage 폴더 + manifest 이중 렌더링 + SessionStart hook + M4 sync 자동 (114/114 test pass). `DEC-2026-05-15-g3-scope-folder-종결.md` 참조. |

## §4 Claude Code 최적화 디폴트 (R6 구체화)

본 플러그인이 사용자에게 "디폴트로" 제공해야 하는 패턴.

### §4.1 Hook 디폴트 (자동 활성)
- **PostToolUse `Write|Edit|MultiEdit`** → prettier / eslint `--fix` 자동 실행 (BE 는 spotless / black 등 언어별 분기)
- **PreToolUse Bash matcher `git commit`** → 테스트 + 정적 검사 통과 강제 (실패 시 `permissionDecision: "deny"` — bypassPermissions 도 차단)
- **PreToolUse sensitive-file deny** (`.env`, `credentials.json`, `*secret*`, `*.pem`)
- **Stop hook** → chain stage 완료 시 ITSM 티켓 코멘트 자동 등록 (R16/R17 연동)
- **Notification hook** → gate fail 시 desktop / Slack 알림 (`async: true`)
- 모든 hook 은 **단순 / 빠를 것** (수 초 이상 작업은 skill 로 분리, log 류는 `async: true`)

### §4.2 컨텍스트 / 메모리
- **CLAUDE.md ≤ 200 lines** 권장 (이미 초과 시 link out)
- `/clear` between unrelated tasks 가이드 (guides/ 에 명시)
- `/compact "focus on X"` 자연스러운 break 에서 능동 호출 권장
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 권장값 제공
- statusline 에 `/usage` + 현 chain stage 노출

### §4.3 Plan-driven 디폴트
- Plan 은 `<user-project>/.claude/plans/plan-<topic>.md` 로 auto-persist
- chain stage 진입 시 **TaskCreate 로 work-unit 분해** 강제 (in_progress → completed 갱신)
- skill description 은 **"use this when [condition]" 1문장 + 반환 형태 1문장**

### §4.4 Multi-agent 디폴트
- **Subagent** = 1-way report-back (격리 워커)
- **Agent team** = 피어 메시지 + 공유 task list (April 2026 신기능 / 무거운/노이즈 작업 격리 의무)
- 메인 ↔ sub-agent 역할 분리는 `agents-axis.md` 매핑표 따름

### §4.5 Plugin 배포 / 버전 관리
- **stable / latest 채널 분리** — 동일 repo 의 다른 ref 가리키는 marketplace 두 개
- `plugin.json.version` 누락 = cached copy 그대로 (silent override 위험) → 매 release 갱신 강제
- 사내 배포 전 단계 (`project_pre_deployment_stage.md` 정합) — semver 라벨 의미 약하나 본격 외부 배포 시 SemVer 준수

### §4.6 ITSM / MCP 통합 (R16/R17 실현용)
- `mcp__wiki-jira-assistant__*` 활용 (이미 등록된 MCP server)
- skill `itsm-ticket-emit` 신설 — chain stage 완료 시 자동 호출
- `.mcp.json` 의 `mcpServers` 활성 + plugin install 시 사용자 토큰 확인 guide

## §5 추가 권장 (Claude 제안)

본 charter 17 항목 외, Claude Code 2026-05 best practice 기반 추가 후보:

| # | 제안 | ROI | 우선순위 |
|---|------|-----|---------|
| P1 | **세션 인계 / Resume 패턴** — chain stage 중단 시 `.aimd/chain-N/<work-unit>/state.json` 으로 재개 | 高 (장시간 chain 의 안정성) | ★★★ |
| P2 | **단계별 cost/token telemetry** — 각 chain stage 마다 token 사용량 + 자동화율 metric 자동 수집 | 高 (운영 KPI / "AI 자동화 ≥ 85%" 측정) | ★★★ |
| P3 | **Spec change impact analyzer** — chain 산출물 변경 시 forward/backward link (traceability-matrix) 따라 영향도 자동 산출 | 中 (재작업 최소화 2순위 정합) | ★★ |
| P4 | **산출물 semver + 재사용 catalog** — 5종 이식성 산출물 (rules/domain/openapi/schema/antipatterns) 에 semver 부여 + cross-project catalog | 中 (R4 강화) | ★★ |
| P5 | **Rollback / undo for failed chain stage** — gate fail 시 stage 산출물 격리 + 직전 상태 복원 hook | 中 | ★★ |
| P6 | **Statusline chain progress** — 현 stage / gate 상태 / 다음 액션 1줄 노출 | 低 (UX) | ★ |
| P7 | **자동 PR description generator** — chain 산출물 traceability 기반 PR 본문 자동 작성 skill | 中 | ★ |
| P8 | **Secret scanning hook** — PreToolUse 로 `git commit` 전 secret 패턴 검출 (gitleaks 류) | 高 (보안) | ★★★ |

## §6 적용 정책

- 본 charter 는 **단일 SSOT** — 18 항목 (R1~R18 / R16·R17 scope-out / 활성 16) + §4 디폴트는 모든 신규 기능 / PR 의 정합 기준
- charter 변경은 `decisions/DEC-YYYY-MM-DD-*.md` 결정 로그 필수
- ★ R18 (v7.1.0) = §5 backlog 격상 아닌 **신규 정식 R** (사용자 결단 / enforcement 강제력 = `plugin-authoring-spec.md` SSOT + release-readiness #12). 저작 규칙·공식 docs pin 변경은 본 charter 아닌 `plugin-authoring-spec.md` 에서만 (재선언 ❌)
- gap (§3) 해소 작업은 **품질 우선 + 재작업 최소화** 원칙 (memory `feedback_quality_priority.md`) 적용
- §5 추가 제안은 charter 항목과 **별도 backlog** — 사용자 결단 후 §1 / §4 로 격상 가능
