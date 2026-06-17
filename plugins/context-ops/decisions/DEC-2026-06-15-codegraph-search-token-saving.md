# DEC-2026-06-15-codegraph-search-token-saving

**code-graph 를 토큰절감 구조-검색 MCP 로 노출 — P1 시행(DEFAULT-ON 설치+MCP / opt-out) + P2 시행(DEFAULT-ON 비차단 nudge / opt-out) / P3 hard-block §8.1-차단 / navigation-authority bounded by cheap-falsifiability (draft — release bump 대기 / 2026-06-15 사용자 결단으로 opt-in→opt-out 반전 + 2026-06-17 P2 nudge 시행·동일 반전)**

> **2026-06-15 갱신 (사용자 결단 반전)**: 최초 결정 #5 는 "기본 opt-in flag off" 였으나, 사용자(TF Lead)가 headroom 자매 companion 과 동일하게 **"default on"** 으로 지시 → P1 **설치+MCP 기본 활성 + opt-out**(`CONTEXT_OPS_DISABLE_CODEGRAPH=1` / `CONTEXT_OPS_CODEGRAPH_MCP=0` 도 허용)으로 변경. 본문의 "opt-in / 기본 off" 표현은 본 갱신으로 supersede. **반전 범위 = P1(설치+MCP 활성) 한정** — P3 hard-block(navigation 을 유일 ground-truth 로 강제)·reference-lens trust(결정적 gate inject ❌)·Grep 영구 비차단은 **불변**(§8.1-차단 유지). 즉 codegraph 가 *기본 켜지지만* 여전히 reference-lens/SEARCH 일 뿐 gate 권위는 0. ⚠️ default-on blast radius = 전 adopter 첫 세션이 `npm i -g` + 프로젝트 인덱스 부트스트랩 수행(idempotent: `.codegraph` 있으면 skip / 대형 legacy 첫 인덱싱은 수~수십초 / 실패=non-fatal honest carry).

## 맥락
사용자(TF Lead) 토큰절감 목적 + 기사(siosio3103 번역 / 원문 abdulgafoorabid: CBM·headroom·RTK·context-mode·caveman 스택). 기사의 #1 레이어 "Codebase Memory MCP(구조검색 → 파일 안 읽고 압축 답, 99.2% 절감)"를 **우리가 이미 보유한 code-graph(CodeGraph OSS `@colbymchenry/codegraph` 0.9.6)** 로 재현. 둘은 같은 AST-그래프 범주.

## calibration 증거 (4원칙 §2 전 실측 / no-simulation 2026-06-15)
codegraph callers ↔ 실 grep 호출 site 대조:
- **clean 단일앱 (poc-18 / Express·TS)** — 10 심볼: precision 100%(오연결 0)·recall 100%(파일). generic名(pick/exclude)도 오연결 0.
- **collision-rich self-contained (우리 tools/ / parseArgs 26 동명)** — **정의 없이 호출만=0건 → 26 엣지 전부 folder-local 정확**(chain-driver main@3134→자기 parseArgs@155 검증). unique 심볼=정확. "26 나열"=맨-이름 쿼리 listing(filePath 로 폴더 필터). **사용자 "폴더 다르잖아" 지적이 self-contained 안전성으로 확정.**
- **쌍둥이 모노레포 (ep-fe-mis 기록)** — 5,050 impossible 엣지 = 유일 **날조**.
- **날조 공식 = (로컬 정의 없는 호출) ∧ (이름 폴더간 충돌) ∧ (CG import 추적 실패: 동적/hook 구조분해).** 셋 동시일 때만.

## research 핵심 (4원칙 §2 / 3 에이전트 verified)
- **freshness 무료**: codegraph 네이티브 OS 파일워처 데몬 기본 ON(debounce 2s) + 인덱싱 중 `⚠️` stale-배너("직접 Read") = 내장 verify. → SessionStart sync 자작 불요.
- **`codegraph serve --mcp`** = stdio MCP / 툴 explore·node·search·callers(+callees/impact/files/status). 1 프로젝트=1 인덱스(`.codegraph/`).
- **Grep 영구 비차단** (Senior STOP): regex=심볼∧문자열 분리불가 + Grep=반증 밸브. hard-block 은 Read/Glob 한정.
- **non-blocking additive-injection**(code-graph-mcp 패턴) = practitioner-favored + 우리 reference-lens 정합.
- **하드 enforcement 비용 정량**: CBM arXiv 2603.27277 — 답변 품질 83% vs 파일탐색 92% = **9%p 갭**.
- `codegraph install` = CLAUDE.md+`~/.claude.json` 자동편집(drift) → **`.mcp.json` 선언 선호**.

## 결정 (사용자 승인 2026-06-15 / 6 묶음)
1. 범위 = **P0+P1 먼저**(P3 hard-block 은 §8.1-차단). 2. MCP = **`.mcp.json` launcher**(CLAUDE.md 미접촉). 3. freshness = **데몬 워처 무료**. 4. enforcement = **non-blocking additive-injection / Grep 영구 비차단**. 5. 기본 = **DEFAULT ON (opt-out `CONTEXT_OPS_DISABLE_CODEGRAPH=1`)** (~~opt-in flag off~~ / 2026-06-15 후속 반전 — 사용자 "default on"). 6. DEC = **cheap-falsifiability 경계** + P3 조건 명문.

## 시행 (P1 — 미커밋 / working tree)
- `scripts/install-companion-tools.js` **확장**(headroom + codegraph 2-companion): **default ON** (opt-out `CONTEXT_OPS_DISABLE_CODEGRAPH=1`/`CONTEXT_OPS_CODEGRAPH_MCP=0`) → `npm i -g @colbymchenry/codegraph`(부재 시) + 프로젝트 인덱스 부트스트랩(`codegraph init`+`index` / `.codegraph` 있으면 skip / 데몬이 이후 유지). 멱등 marker·항상 exit 0·honest carry.
- `scripts/codegraph-mcp-launch.js` **신규**: `.mcp.json` command 가 직접 codegraph 대신 본 launcher 지목 → flag·바이너리·인덱스 3중 게이트 → `codegraph serve --mcp`(cwd=PROJECT_DIR) passthrough / 아니면 exit 0.
- `.mcp.json` `codegraph` 서버 + hooks SessionStart(기존 companion 훅이 처리) + `package.json files[]` 출하.
- **검증**: JSON valid·node --check·기본off no-op·launcher 미인덱스 graceful·**실 부트스트랩 작동**(임시 프로젝트 3 nodes/76ms→.codegraph→marker)·**launcher 가 실제 serve 기동 확인**("Attached to daemon v0.9.6")·tarball 출하·**release gate 신 실패 0**(잔존 1 = 별개 verdict 작업의 gate-eval).

## P0 calibration 도구 (시행 / `tools/codegraph-calibrate` / 미커밋)
- 신규 tool: 실 `codegraph callers` ↔ 독립 identifier-call grep proxy 일치도 측정 + fabrication-risk 구조 스캔 → reference-lens verdict {PASS=navigation-authority 적격 / WARN=reference-lens 유지}. 순수 코어(calibrate.js / 18 test) + I/O(cli.js / 실 codegraph·index 부재 exit3 / test 파일 scope 제외).
- **자동 측정 = 수동 calibration 자가교정**([[feedback_self_recorded_fact_validation]]): 수동은 깨끗한 유틸 심볼 cherry-pick → 100% 주장이었으나, **넓은 자동 샘플 실측 = poc-18 WARN(precision 0.941 / recall 0.889 / fab_risk 0) · tools/ WARN(0.667 / fab_risk 1)**. 불일치는 namespace 멤버호출 경계(static frontier)에 군집 — grep proxy ≠ ground truth(agreement smell-test). PASS 는 의도적 고-bar(bidirectional ≥0.9 ∧ fab 0).

## 시행 (P2 — 비차단 additive-injection nudge / 2026-06-17 / draft)
P1 은 codegraph 를 *노출만* 하므로 에이전트가 습관적으로 Read/Grep 로 파일을 덤프해 codegraph 절감이 실현 안 되는 한계. P2 = 소스 Read/Glob 직전 비차단 nudge 로 구조질의를 codegraph 로 유도.
- `scripts/codegraph-nudge.js` **신규**: PreToolUse(matcher `Read|Glob`) 훅. stdin 이벤트 JSON 파싱 → **트리거별 분기**(net-saving 최적):
  - **Glob(소스 디렉토리)** → `codegraph files --filter <dir> --format flat` 구조맵(ANSI strip + 25줄 cap) `additionalContext` 주입 = 후속 다수 Read 대체(확실한 이득).
  - **Read(단일 소스파일)** → 포인터 한 줄만(~50토큰 / codegraph 호출 0 / 파일이 어차피 필요한 경우 낭비 제거).
  - **Grep** = matcher 제외 = 영구 비차단·미발동(반증밸브).
- **항상 exit 0 / stdout=훅 JSON 전용 / 차단 0**(exit 2·permissionDecision deny ❌ — 위 Write|Edit 게이트와 disjoint). 게이트: opt-out(`CONTEXT_OPS_CODEGRAPH_NUDGE=0`)·바이너리 부재·`.codegraph` 부재·비소스 확장자·once-per-(session,target) 마커(`.static-tools/.nudge-*` / gitignored / frustration cap) → no-op.
- **기본 = DEFAULT ON (opt-out)** — 사용자(TF Lead) 결단(2026-06-17). 위험 통제 레버 = 플래그가 아니라 주입 내용(Read=포인터로 낭비 제거)이라는 합의 → P1 반전과 동형(최초 결정 #5 "기본 off" supersede). P1(수동 노출)과 달리 P2 는 능동 주입이나, 트리거별 분기로 blast radius bounded.
- **chain-driver(결정적 게이트 엔진)와 분리** = reference-lens 가 게이트에 새지 않게 trust 경계 보존(DEC-2026-05-28 §4.2). 모든 주입에 면책문구("reference-lens · grep authoritative · gate-inject ❌").
- **검증**: 순수로직 단위테스트 15 GREEN(`scripts/test/codegraph-nudge.test.js` / isSourcePath·globDir·classifyIntent·capOutput·build*·isOptedOut) + 모의 stdin 스모크 5(Read 소스→포인터 / Read .md→no-op / Glob 소스디렉토리→구조맵 / Grep→미발동 / opt-out→no-op) + once-per-target 마커 동작 + `node --check` + hooks.json·package.json valid.
- **package.json files[]** 에 `scripts/codegraph-nudge.js` 출하(launcher 2종 동일 패턴 / 테스트는 `!**/test`·`!**/*.test.js` 제외).
- **draft** — plugin.json·CHANGELOG 무변경(P1 companion 과 동일 draft 상태). 정식 release(MINOR bump + CHANGELOG + 마켓플레이스 republish)는 P1+P2 companion 묶음으로 별도 사용자 결단 시.

## 보류 (P3 hard-block = §8.1-차단 / 강화됨)
**자동 calibration 결과 PASS 타깃 = 0개**(poc-18 도 WARN / 수동 "100%"는 cherry-pick 과대 — 정정). → 출하 전 최소: ① **독립 PASS ≥2**(다른 shape/언어 / 현재 0) ② hard-block = `verdict=PASS ∧ index_fresh` 둘 다 ③ 밸브 = deny 가 정확한 grep 제공 ④ **Read/Glob 한정 / Grep 영구 비차단**. P3 는 PASS 나오는 near-perfect 타깃 발견 전까지 영구 보류 가능 — reference-lens 기본이 정합(품질1). codegraph-calibrate 의 값 = PASS/WARN bit 뿐 아니라 **투명 agreement 지표 + 불일치 파일 목록 + fab 스캔**(reference-lens with confidence vs caution 판단 보조).

## trust (cheap-falsifiability 경계)
**navigation-authority ≠ gate-authority**: code-graph 는 navigation 을 *제안*할 권위 OK / *유일한* ground-truth 경로면 ❌. grep(반증 밸브)을 영구 비차단 = 싼 반증 항상 가능. DEC-2026-05-28 §4.2 reference-lens(결정적 chain gate inject ❌) **불변** — 검색층이지 gate 아님. codegraph ⚠️ 배너 = 내장 verify.

## §8.1
P1 = additive·기본on(opt-out)·무회귀(검증 — opt-out no-op + reference-lens trust 불변). **P2 nudge = 행위변경(능동 주입)이나 비차단·기본on(opt-out)·무회귀**(검증 — exit 2·deny ❌ / Grep 미발동 / 결정적 gate inject ❌ / opt-out·미인덱스 no-op / chain-driver 분리). ∴ P2 = §8.1-차단 아님(P3 와 분리). P3 hard-block = 차단형 행위변경 → §8.1-차단(독립 PASS 2 전 금지 / default-on 과 무관 — 설치 기본값 ≠ gate 권위). draft(plugin.json·CHANGELOG·MANDATORY 무변경) — release MINOR bump 시 본체 격상 + package.json lockstep 선결.

## Relates
- DEC-2026-06-15-headroom-companion (companion MCP 자매 / install-companion-tools 공유) · DEC-2026-05-28-codegraph-probe-결과 §4.2 (reference-lens 불변 / gate inject ❌) · DEC-2026-05-30-codegraph-essential · DEC-2026-05-18-runtime-tool-exclusion (R19 user-owned·honest carry) · [[feedback_no_static_tool_simulation]] · [[feedback_research_fact_validation]] (CodeGraph·CBM 실 fetch) · [[feedback_quality_priority]] · [[feedback_diagnose_before_design_check_existing]] (calibration 으로 "정적=정확" 액면수용 ❌). plan = `.claude/plans/plan-codegraph-search-token-saving.md` + research = `.claude/plans/research-codegraph-search-token-saving.md`.
