# research — code-graph 토큰절감 검색 (4원칙 §2 / 2026-06-15)

3 에이전트 병렬 (공식문서 / 업계사례 / Senior). 출처·신뢰도 명시. 가벼운 sub-agent.

## A. 공식문서 (CodeGraph OSS `@colbymchenry/codegraph` 0.9.6 / README 실 fetch / verified)
- **`codegraph serve --mcp`** = stdio MCP. 기본 툴: `codegraph_explore`·`codegraph_node`·`codegraph_search`·`codegraph_callers` (+`callees`/`impact`/`files`/`status` = `CODEGRAPH_MCP_TOOLS` env 로 켬).
- **1 프로젝트 = 1 인덱스**(`.codegraph/` sqlite). serve = CWD 프로젝트. multiplex ❌.
- **★ freshness = 데몬 + 네이티브 OS 파일워처(FSEvents/inotify/RDCW) 기본 ON / debounce 2000ms(`CODEGRAPH_WATCH_DEBOUNCE_MS`).** 실시간 — 수동 sync 불요(데몬 off 시만 `sync`). → **내가 SessionStart sync 를 직접 짤 필요 없음.**
- **★ stale-signal 내장**: debounce 창 동안 MCP 응답에 `⚠️` 배너로 pending 파일명 + "직접 Read 하라" 안내. = **built-in verify-fallback.**
- `codegraph install` = `~/.claude.json`(MCP 등록) + **CLAUDE.md/AGENTS.md 에 marker-fenced 섹션 append** + (옵션) settings.json auto-allow. reversible(`uninstall`). ⚠️ CLAUDE.md 자동편집 = headroom `learn` 과 동일 drift 우려 → **우리는 `.mcp.json` 선언 선호**(global config·CLAUDE.md 미접촉).
- 언어 cross-file 해소율(README 벤치): Python 100 / JS·TS 95.8 / Java 93.3 / **Spring 83.3(애너테이션 라우팅만)** / Django 74.1. **iBATIS2/MyBatis XML = 문서 부재**(memory `codegraph_v096_ibatis2_limit` 확정).
- 한계 자인: dynamic dispatch·reflection·DI·framework entry = "static-analysis frontier" 미해소. heuristic 엣지는 `provenance:'heuristic'` 태깅. false-edge 정량·name-collision 처리 = **미문서화**.

## B. 업계사례 (verified URLs)
- **CBM = `DeusData/codebase-memory-mcp`**(MIT/오픈소스/158 lang/tree-sitter / 900+★). **arXiv 2603.27277: 답변 품질 83% vs 파일탐색 92% = 9%p 갭 = 하드 enforcement 의 정량 비용.** ← 핵심 STOP-ish 신호.
  - 기사 "120초 마커" = **오독**. 실제 CBM `cbm-code-discovery-gate` = **block-once-then-allow**(2 마커 `$PPID` 스코프). 600초 time-window 는 별개 `bash-ban-raw-tools` 훅. → 우리 "120s" 표현 폐기.
  - CBM freshness = git-poll(랙 있음 / 수동 `index_repository` 복구). codegraph 보다 약함.
- **`sdsrss/code-graph-mcp`**: PreToolUse 가 그래프 결과를 **`additionalContext` 로 주입(additive / non-blocking)** — agent 가 그래프+grep 둘 다 봄. = **practitioner-favored 중간.**
- **colbymchenry/codegraph(우리것)**: 네이티브 워처+debounce+`⚠️`배너+auto-allow / **hard-block 훅 없음**.
- **Serena(oraios)**: LSP 기반 / freshness·enforcement = 미확인.
- **합의**: additive-injection 또는 stale-banner 가 favored 중간 / **stale-signal 없는 hard-block = 위험**. 운영 incident 포스트모템은 미발견(논문-level 9%p 갭이 유일 정량).

## C. Senior (verdict)
- **Q1 nav-auth ≠ gate-auth = CONDITIONAL-GO.** 구분 자체는 sound(검색층 ≠ 결정적 gate verdict / grep 으로 falsifiable). 단 **누락-by-absence 누수**: grep 을 막으면 code-graph 가 "부재로써 authoritative" 가 됨 → 싼 반증 경로 소멸. 선: **code-graph 는 navigation 을 *제안*할 권위는 OK / *유일한* ground-truth 경로면 ❌.** 밸브는 **싸고 기본 도달가능**해야(ceremony ❌). **freshness × hard-block = 곱셈 위험** → hard-block 은 calibration 뿐 아니라 **index-freshness 도 gate** 해야.
- **Q2 의도감지 = STOP(intent 기반 hard-block) / GO(파일타입 nudge).** Grep regex 는 심볼∧문자열 동시 → 패턴으로 분리 불가. **도구로 분기**: Read(소스 전체)/Glob(소스 디렉토리) = "구조 덤프 직전" → nudge 안전 / **Grep = 절대 hard-block ❌**(내용 primitive ∧ 반증 밸브). 결론: hard-block(계측 통과 시)은 **Read/Glob-for-navigation 한정**, Grep 은 영구 soft-nudge max.
- **Q3 §8.1 phasing = CONDITIONAL-GO + STOP.** opt-in→soft→calibrated-hard 모양 맞음. 단 "≥2 타깃" 너무 약함 — 현 증거 = 3 타깃이나 **clean PASS 는 poc-18 1개뿐**(tools/=WARN형·ep-fe-mis=날조). ∴ **P3 hard-block 은 현재 §8.1-차단.** P3 최소조건: ① **독립 PASS 타깃 ≥2**(다른 shape/언어 / 같은 shape 2회 ❌) ② hard-block = `verdict=PASS ∧ index_fresh` 둘 다 ③ 밸브 = deny 메시지가 **정확한 grep 명령 제공**(붙여넣기 1회) ④ Read/Glob 한정, Grep ❌.
- **Net**: P0+P1(calibrate+opt-in MCP) = 순수 upside·행위변경0 → 지금. P2 nudge = 파일타입. **P3 hard-block = 독립 PASS 2 + Read/Glob 한정 + freshness 선결 전까지 §8.1-차단.** DEC 는 "navigation-authority bounded by **cheap-falsifiability**" 로 명명(단순 "nav≠gate" 부족 — 누수 Q1 닫아야).

## 핵심 함의 (plan 갱신 사항)
1. **freshness 무료** — codegraph 데몬 워처+⚠️배너가 해결. SessionStart sync 자작 불요. 배너 = 내장 verify-fallback.
2. **Grep 영구 비차단** — 반증 밸브. hard-block 은 Read/Glob-for-nav 한정.
3. **non-blocking additive-injection 이 1차 권장** (code-graph-mcp 패턴 + 우리 reference-lens 와 정합) — soft-nudge 보다도 깔끔할 수 있음.
4. **9%p 품질 갭**(CBM 논문) = 하드 enforcement 비용 정량 → non-blocking 선호 근거.
5. **P3 hard-block = §8.1-차단**(clean PASS 1개) → 지금 출하 ❌. P0+P1(+P2 nudge)만.
6. **`.mcp.json` 선언 > `codegraph install`** (후자 = CLAUDE.md+global config 자동편집 / drift).
7. DEC 명명 = cheap-falsifiability 경계.

## 출처
- colbymchenry/codegraph README · DeusData/codebase-memory-mcp · sgaabdu4/claude-code-tips + DeepWiki · arXiv:2603.27277 · sdsrss/code-graph-mcp · oraios/serena · 기사(원문 abdulgafoorabid + 번역 siosio3103).
