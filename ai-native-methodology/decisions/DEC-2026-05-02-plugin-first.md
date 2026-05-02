# DEC-2026-05-02 Plugin-first 사내 배포 + lifecycle stage organize

**날짜**: 2026-05-02
**상태**: 결단됨, Phase A self-iteration 진입
**관련 plan**: `~/.claude/plans/delightful-leaping-whistle.md` (이후 adoption/work/plan-d5-plugin.md 통합 예정)

## 결단 요약

본 방법론을 **사내 배포 가능한 Claude Code plugin 으로 패키징** 한다. 14차 누적 결단 — 자세한 변천 history 는 plan 본문 "결단 변천" 표.

### 핵심 결단 14건 압축

| # | 핵심 결단 | 사유 |
|---|---|---|
| 1차 | 초안 zip+npm hybrid | (사용자 거절) |
| 2차 | plugin-first hybrid | "프로젝트 그대로 다운로드 vs plugin?" 사용자 질문 → Claude Code plugin 시스템 정합 확인 |
| 3차 | 8가지 사내 risk 정직 평가 | InfoSec / GHE 인증 / Node 의존 / 버전 drift 등 검증 |
| 4차 | 축 1 (사내 인프라) + 축 2 (현재 프로젝트) 분리 / GHE 풀어쓰기 | "어떤 것 필요 vs 현재 프로젝트 문제 구분" |
| 5차 | Phase × Track 분기 (BE/FE/DB) + description 자동 발동 | "FE/BE/DB 따른 구분 자연스러운가?" |
| **6차** | **본체 = plugin source / adoption/dist = artifact (sync 부담 0)** | "분리, sync 를 왜 해야 하나?" |
| **7차** | **Track 별 plugin 분리 거절 / 단일 plugin 확정** | "plugin 을 나누는게 좋은건가?" — 7대 산출물 통합 가치 / 풀스택 부자연 |
| **8차** | **lifecycle stage organize (`_base/` + `analysis/` 채움 + 4 stage placeholder)** | 미래 lifecycle 확장 비전 보존 (기획→분석→설계→테스트→구현) |
| 9차 | Runtime G1~G6 gap 식별 | stage 별 자동 동작 보장 메커니즘 |
| 10차 | 옵션 4 (G1~G6 v2.0 carry) | (11차로 부분 수정) |
| **11차** | **G3/G4/G5/G6 v1.3.x 자연 포함 (본체 자산 재조합) / G1+G2 만 v2.0 carry** | "이미 만들어진 것들 있지 않나?" — 진짜 신규 작업 G1/G2 ~2일뿐 |
| **12차** | **self-iteration first (Phase A 무기한) → 사내 배포는 후 (Phase B)** | 사용자 모드 = 본인이 돌려보며 다듬음 / 4원칙 §4 정합 |
| 13차 | plan 정체성 재확인 | "사내 배포용 SDLC plugin 만드는 작업 맞지?" 사용자 의도 오독 철회 |
| **14차** | **워크스페이스 = 본체 / 결과물 = adoption/dist 명확화** | "ai-native-methodology = 워크스페이스, adoption = 결과물 보관소" 사용자 핵심 정의 |

## 작업 위치 정의 (★★★ 14차 핵심)

- **`ai-native-methodology/` (본체)** = 워크스페이스 (지속 진화 — v1.3.x → v1.4.x → ...). Phase A 작업 위치.
- **`ai-native-methodology-adoption/`** = 결과물 보관소 (사내 배포 위해 넣을 것들). adoption/dist/internal-v1.X/ = plugin artifact.
- **release.yml** (Phase B): 본체 tag → adoption/dist 자동 빌드 (D2/D3 패턴 다음 cycle) → 사내 git push.
- **본체 진화 ↔ plugin 진화 자동 동기화**.

## Phase A 산출 (본 commit)

- `.claude-plugin/plugin.json` — plugin manifest (name=ai-native-methodology / version=1.4.0)
- `.mcp.json` — placeholder (cli.mjs MCP wrapper 작성 carry-over)
- `agents/_base/` 3종 (senior-engineer / official-docs-checker / industry-case-researcher)
- `agents/{analysis,planning,design,test,implement}/README.md` placeholder 5종
- `skills/_base/` 메타 3종 (apply-template / log-finding / apply-baseline-ratchet)
- `skills/analysis/` 18종 (Phase 0~6 + Phase 5 BE/FE/DB 분기 + aspect-* 4종)
- `skills/{planning,design,test,implement}/README.md` placeholder 4종
- `hooks/hooks.json` — SessionStart + PostToolUse Write/Edit
- `methodology-spec/lifecycle-contract.md` — 단계 간 산출물 인터페이스
- **G4** `templates/` → `templates/analysis/` (21 templates 이동) + 4 stage placeholder
- **G6** `methodology-spec/workflow/phase-flow.{json,mermaid}` → `flows/analysis.phase-flow.{json,mermaid}` 재배치
- 검증: drift-validator 33/33 / decision-table-validator 11/11 / formal-spec-link-validator 8/8 = **52/52 pass**

## carry-over (Phase A iteration / Phase B / v2.0)

### Phase A iteration

- `tools/*/cli.mjs` MCP wrapper 작성 (현재 .mcp.json placeholder)
- skill description trigger 정밀화 (self-iteration 중 finding 기반)
- README / CLAUDE.md plugin 진입점 안내 추가

### Phase B (사내 배포 진입 trigger 도달 후)

- 축 1 (사내 git 종류 / 인증 / InfoSec audit / Claude Code 표준화 결단)
- LICENSE 정식 / marketplace.json / release.yml / Confluence sync / Teams notify
- `release/1.3` branch / triple line / BE pilot 1팀

### v2.0 (lifecycle 확장 결단 시)

- G1: `.aimd/state.json` (사용자 프로젝트 stage 추적)
- G2: stage-aware hook routing
- planning / design / test / implement skills + agents + templates 채움
- `enter-stage/` skill (G1+G3 통합)

## 관련 메모리

- `feedback_work_principles.md` (4원칙)
- `project_methodology_scope.md` (한 방향 추출기)
- `feedback_no_static_tool_simulation.md` (no-simulation)
- `project_adoption_workspace.md` (★ 갱신 필요 — 14차 결단 반영)
- `project_v140_fe_track.md` (v1.4.0 release 반영)
- `project_plugin_first_distribution.md` (★ 신규 — 본 결단)
