# plan — code-graph 를 토큰 절감 구조-검색 MCP 로 노출 + 계측 hard-block + verify 밸브

> 4원칙 §1 (깊은 숙지 → plan). 트리거 = 사용자 "토큰 절감(컨텍스트 압축)" 목적 + 기사(siosio3103 / CBM·headroom·RTK·context-mode·caveman 스택). 목표 = 기사의 #1 레이어(Codebase Memory MCP 식 구조-검색 토큰 절감)를 **우리가 이미 보유한 code-graph(CodeGraph OSS)** 로 재현하되, 우리 trust 모델·품질1순위에 맞게 계측.

## 0. 한 줄 목적
구조 질의(누가 호출 / impact / 심볼 위치)에서 Claude 가 **파일을 읽거나 grep 으로 덤프하는 대신 code-graph MCP 의 압축 답**을 쓰게 해 토큰을 줄인다. 단 **오연결 위험은 calibration + verify-grep 밸브**로 막아 correctness 를 지킨다(품질1).

## 1. 깊은 숙지 — 현 자산 (실측)
- **CodeGraph OSS 0.9.6 설치됨.** `callers/callees/impact/query/context` + **`serve`(MCP 서버) + `install`(Claude Code 에 MCP 등록) 내장** → 래퍼 없이 MCP 노출 가능.
- 우리 wiring: `analysis-code-graph` 스킬(analysis 단계 1회 인덱싱) + `codegraph-runner`(init/index) + `codegraph-coverage`(sqlite 직독 coupling). 산출 `code-graph.json`=index_stats 요약뿐(엣지는 `.codegraph/` sqlite). 현 trust = **reference-lens / gate inject ❌ (DEC-2026-05-28 §4.2)**.
- MCP 선언법 = 이번 세션 headroom 으로 확보(`.mcp.json` + `${CLAUDE_PLUGIN_ROOT}` + launcher / PreToolUse deny 인프라는 chain-driver hooks-bridge 에 기존재).

## 2. Calibration 증거 (이 plan 의 경험적 근거 / no-simulation 실측 2026-06-15)
codegraph callers 답 ↔ 실 grep 호출 site 대조:
- **clean 단일앱 (poc-18 / Express·TS / 78파일)** — 유틸 10심볼: **precision 100%(오연결 0)·recall 100%(파일단위)**. generic 이름(pick/exclude)도 오연결 0. 한계 = 일부 module-scope 호출이 `파일:1` coarse(틀린 건 아님).
- **collision-rich self-contained (우리 tools/ / parseArgs 26 동명 정의)** — 핵심: **정의 없이 호출만 = 0건** → 26 엣지 전부 **folder-local 정확**(chain-driver main@3134 → 자기 parseArgs@155 검증). unique 심볼(transformTraceabilityMatrix·validateMockSoundness)=1 caller/1 파일 정확. "26 나열"은 그래프 오류가 아니라 **맨-이름 쿼리의 listing**(결과 filePath 로 폴더 필터하면 1개).
- **쌍둥이 모노레포 (ep-fe-mis / 기존 기록)** — 5,050 impossible 엣지 = 유일한 **날조** 케이스.
- **날조 공식 = (로컬 정의 없는 호출) ∧ (이름 폴더 간 충돌) ∧ (CG 가 실 import 추적 실패: 동적/hook 구조분해).** 셋 동시일 때만. → self-contained(폴더별 자립)면 충돌 있어도 안전.

**판정**: code-graph callers/impact 신뢰도 = (코드베이스 shape) × (심볼 uniqueness) × (query type). 대부분의 정상 프로젝트(폴더별 모듈 자립)는 **authoritative 가능**. 좁은 위험 구간(로컬정의 끊긴 동명 import + 동적)만 밸브로 커버.

## 3. 설계 (3 컴포넌트)

### C1. code-graph MCP 노출 (토큰 절감 본체)
- `.mcp.json` 에 `codegraph` 서버 추가 — headroom 동형 **launcher 경유**(`scripts/codegraph-mcp-launch.js`): 토글 확인 + `.codegraph` 인덱스 존재 확인 → `codegraph serve` 패스스루 / 아니면 exit 0.
- **인덱스 freshness** = SessionStart 훅이 증분 `codegraph sync`(또는 index) 보장(analysis 단계 의존 X — 평생 운영 컨텍스트). 대형 repo 비용 = 비동기/멱등.
- 노출 툴 = `callers/callees/impact/query` → 파일 안 읽고 압축 답. (기사 CBM 99.2% 절감 슬라이스)

### C2. 계측 PreToolUse 게이트 (hard-block + verify 밸브)
- 소스 파일(.ts/.js/.java/.py…) Grep/Glob/Read 시 — **구조-탐색 의도면 code-graph 먼저** 유도. config/docs(.json/.md/.yaml)는 무간섭.
- **계측 분기**(calibration 결과 기반): 타깃이 clean/self-contained(verdict=PASS) → **hard-block**(code-graph 미사용 시 deny, 기사식 120s 마커 동형) / collision·monorepo(verdict=WARN) → **soft nudge**(additionalContext 경고만, deny ❌).
- **verify-grep 밸브** = 결과 의심·결정 근거 필요 시 명시적 grep 허용(기존 "triage=실코드 grep" 규약). 밸브로 conflation 좁힘 + impossible-edge 포착.
- 재사용 = chain-driver hooks-bridge 의 PreToolUse deny(exit 2) 메커니즘.

### C3. Calibration 게이트 (hard-block 의 선결 조건 / reference-lens)
- 신규 `tools/codegraph-calibrate`(또는 codegraph-coverage 흡수): 타깃에서 N 심볼 표본 callers↔grep 대조 → precision/recall + 날조-조건 스캔(로컬정의 없는 동명 호출 수) → **verdict {PASS=authoritative / WARN=valve-우선}**. 출력 = reference-lens(gate inject ❌). C2 hard-block 은 이 verdict=PASS 일 때만 켜짐.

## 4. trust 모델 정합 (중요 — DEC 필요)
- **navigation-authority ≠ gate-authority.** code-graph 를 "검색 보조 권위"로 쓰는 것 ≠ "결정적 chain gate 에 inject". DEC-2026-05-28 reference-lens 불변(gate inject ❌)은 유지 — C1/C2 는 **검색/탐색 층**이지 chain gate 가 아님.
- verify-grep 밸브 = correctness 탈출구 영구 보존(authoritative 라도 grep 봉쇄 ❌ — 기사식 full-block 거부).
- calibration = authoritative 켜는 경계의 결정론 근거.
- → 신규 **DEC-2026-06-15-codegraph-search-token-saving**(또는 후속 날짜) 필요: navigation-authority 경계 + calibration 조건 + 밸브 명문.

## 5. 위험 / open question
- **freshness**: stale 인덱스 → 틀린 nav. 완화 = SessionStart 증분 sync + 밸브.
- **언어 범위**: CodeGraph = Java/JS/TS 강 / iBATIS2·일부 약(memory codegraph-v096-ibatis2-limit). 게이트는 지원 언어만.
- **의도 감지**: "구조 질의 vs 내용 검색"을 PreToolUse 가 기계적으로 어떻게 가르나? (content grep 까지 막으면 과차단). 후보 = 파일패턴 + 도구(Grep regex=내용 허용 / 심볼식 = 구조→유도). 연구 필요.
- **§8.1**: 행위 변경 게이트 → 본체 hard-block 격상 = ≥2 타깃 calibration corroboration 후. 1차 = opt-in + SOFT.
- **frustration**: 과차단 시 작업 방해 → 기본 off + 점진.

## 6. Phasing (점진 / §2 research 반영 2026-06-15)
- **P0 — calibration tool (C3) ✅ 시행(미커밋)**: `tools/codegraph-calibrate` — 실 codegraph callers ↔ grep proxy 일치도 + fabrication 구조 스캔 → reference-lens verdict(PASS bidirectional ≥0.9 ∧ fab 0 / 아니면 WARN). 순수 코어 18 test + I/O(test scope 제외 / index 부재 exit3). **자동 실측 = 수동 자가교정**: poc-18 WARN(0.941/0.889) · tools/ WARN(0.667/fab1) → **PASS 타깃 0** = P3 §8.1-차단 강화. (commit = pnpm install 워크스페이스 등록 필요 / verdict 작업 정리 후 권장)
- **P1 — MCP 노출 (C1)**: opt-in(`CONTEXT_OPS_CODEGRAPH_MCP=1`) `.mcp.json` 에 `codegraph serve --mcp` launcher 경유. **freshness = codegraph 데몬 워처 무료**(SessionStart sync 자작 불요) + ⚠️ stale 배너 = 내장 verify. **강제 0**(agent 가 쓸 수 있게만). 토큰 절감 1차 확보. = 순수 upside·행위변경0.
- **P2 — additive-injection / SOFT nudge (C2 soft)**: PreToolUse 가 소스 **Read/Glob**(Grep ❌)에 code-graph 결과/제안을 `additionalContext` 로 주입(non-blocking / code-graph-mcp 패턴). deny ❌. adoption 측정.
- **P3 — 계측 HARD-block (C2 hard) = 현재 §8.1-차단**: Senior STOP — clean PASS 타깃 1개(poc-18)뿐. 출하 전 최소조건: ① **독립 PASS 타깃 ≥2**(다른 shape/언어) ② hard-block = `verdict=PASS ∧ index_fresh` 둘 다 ③ 밸브 = deny 가 **정확한 grep 명령 제공** ④ **Read/Glob 한정 / Grep 영구 비차단**. 비용 인지: CBM 논문 9%p 품질 갭.
- **out-of-scope 후속**: 기사 다른 레이어(context-mode / RTK / caveman / `ENABLE_PROMPT_CACHING_1H` / `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`) = 별 plan.

## 7. 연구 필요 (4원칙 §2 / 가벼운 sub-agent)
- official: CodeGraph `serve`/`install`/`sync` 동작·multi-target·freshness 실 docs.
- industry: CBM/Serena 등 code-MCP 의 freshness·enforcement 패턴 / 기사 hook 구현 디테일(120s 마커).
- senior: navigation-authority vs gate-authority 경계 정당성 + §8.1 phasing + 의도감지 분기.

## 8. 사용자 승인 결정 (일괄 / §2 research 반영 — 코드 착수 전)
1. **범위** — **P0+P1 먼저**(calibrate + opt-in MCP / 순수 upside·행위변경0) 권장 vs P0~P2 까지?  (P3 hard-block 은 §8.1-차단이라 지금 불가)
2. **MCP 노출** — `.mcp.json` launcher(plugin-native / CLAUDE.md 미접촉) **권장** vs `codegraph install`(CLAUDE.md+global 자동편집 / drift). → 권장: `.mcp.json`.
3. **freshness** — codegraph **데몬 워처 무료** 활용 확정?(자작 sync ❌ / ⚠️배너=내장 verify)
4. **enforcement 스타일** — **non-blocking additive-injection(Read/Glob에 결과 주입)** 권장 vs soft-nudge / (hard-block 은 P3 보류). Grep 영구 비차단 확정.
5. **기본 = opt-in flag(off)** 확정?
6. **DEC** = `cheap-falsifiability 경계` 명명 신설 + P3 본체 조건(독립 PASS ≥2 ∧ index_fresh ∧ Read/Glob 한정) 명문?

## 9. Lessons Learned (실패 시 기록)
(작성 예정)
