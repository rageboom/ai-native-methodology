# DEC-2026-06-15-headroom-companion

**companion 도구(headroom) 설치 + MCP 서버 활성화 배선 (DEFAULT ON / opt-out / 전 adopter / draft — release bump 대기)**

> **2026-06-15 갱신 (사용자 결단 반전)**: 최초 채택은 default-OFF opt-in(adopter 보호 명목)이었으나, 사용자(TF Lead)가 **"활성화가 기본이고 원하지 않으면 끄는 방식"** 으로 뒤집을 것을 지시 → **default ON + opt-out**(`CONTEXT_OPS_DISABLE_HEADROOM=1` / `CONTEXT_OPS_INSTALL_HEADROOM=0` 도 허용)으로 변경. adopter 보호는 이제 *기본 강제가 아닌 blast-radius bounded* 로 충족(항상 exit 0 / wheel-only no-Rust-compile / honest-carry / launcher graceful no-op). 본문의 "기본 OFF" 표현은 본 갱신으로 supersede. headroom 만 반전 — codegraph 자매 companion 은 opt-in(`CONTEXT_OPS_CODEGRAPH_MCP=1`) 유지(별도 결단 전).

## 맥락 (사용자 요청)

사용자(TF Lead) — "플러그인 설치/업그레이드 시 [headroom](https://github.com/chopratejas/headroom) 라이브러리를 같이 설치하고 싶다 + MCP 서버까지 활성화". headroom = LLM **컨텍스트 압축** 도구(60–95% 토큰 절감 / Python 78%·Rust·TS / `compress`·`proxy`·`wrap claude`·MCP server). 본 방법론의 산출물(rich LLM 운영 컨텍스트)을 LLM 에 먹일 때 토큰을 줄이는 보완 층 — 방법론과 직교하나 시너지(P0 use-scenario 운영 효율).

## 사실 확인 (research 사실검증 / 추정 ❌)

- **"플러그인 install/upgrade 시점" 훅은 Claude Code 에 없음** — 실 메커니즘 = **SessionStart 훅 + 멱등 marker**(설치 후 첫 세션 1회 설치, 이후 no-op). 기존 `install-static-tools.js`(semgrep/PMD) 와 동형 패턴.
- **채널** — 토큰 절감의 실 발현(`proxy`/`wrap`/MCP)은 **전부 pip CLI 전용**. npm `headroom-ai` 는 라이브러리만(CLI·MCP 없음) → interactive Claude Code 토큰 미절감. ∴ pip 사실상 강제. 채택 = `headroom-ai[mcp]`(CLI + MCP server / `[mcp]` extra = MCP 서버 전제 / torch급 ML extra 제외).
- **Rust 빌드 리스크** — maturin/Rust 사용하나 prebuilt wheel 존재. 사내 SSL-검사 환경 회피 위해 `--only-binary headroom-ai`(headroom 공식 docs 권고) wheel-우선 / **sdist build fallback 의도적 미채택**(SessionStart 에서 수분 Rust 컴파일=UX 불가 → 무wheel 시 honest-carry 수동안내).
- **plugin MCP 선언** — `.mcp.json`(plugin root) `mcpServers` 에 선언 / `${CLAUDE_PLUGIN_ROOT}` 사용 가능 / plugin enable 시 자동 기동(첫 활성은 `/reload-plugins` 또는 다음 세션). 조건부 syntax 부재 → **wrapper launcher 패턴**(공식 권고)으로 토글·의존성 ordering 해소.

## 결정 (사용자 확정 2026-06-15)

1. **적용 범위 = 전 adopter** — shipped SessionStart 훅 + `.mcp.json` 에 배선(공유 플러그인).
2. **트리거 = 기본 ON + opt-out env 토글** (~~기본 OFF + opt-in~~ / 2026-06-15 반전) — 설치·MCP 가 **default 활성**. 끄려면 `CONTEXT_OPS_DISABLE_HEADROOM=1`(또는 `CONTEXT_OPS_INSTALL_HEADROOM=0`). 무거운 3rd-party 의존이나 install 이 bounded(wheel-only·항상 exit 0·honest carry)라 default-on 의 blast radius = 1회 설치 시도(실패 시 stderr 안내 + no-op).
3. **채널 = `pipx install "headroom-ai[mcp]"`**(pip3/pip --user fallback / wheel-우선).
4. **MCP 활성 = 플러그인 자체 선언**(`.mcp.json`) + launcher gate(설치 경로 `headroom mcp serve` stdio passthrough).

## 구현

- **NEW `scripts/install-companion-tools.js`** — install-static-tools.js 계약 복제(항상 exit 0 / stderr 로깅 / `.static-tools/.headroom-installed` marker 멱등). **default-on 가드**(opt-out=`CONTEXT_OPS_DISABLE_HEADROOM=1`/`CONTEXT_OPS_INSTALL_HEADROOM=0` 시에만 silent no-op). 채널 pipx→pip3 --user→(win)pip --user / `--only-binary headroom-ai`. 실패=honest carry(no-simulation / LLM 대체 ❌).
- **NEW `scripts/headroom-mcp-launch.js`** — `.mcp.json` `command` 가 직접 `headroom` 대신 본 launcher 지목: opt-out → exit 0 / headroom 부재 → exit 0(stderr 안내, 다음 세션 활성) / 그 외(default) → `spawn('headroom',['mcp','serve'],{stdio:'inherit'})` passthrough.
- **EDIT `.mcp.json`** — `mcpServers.headroom = { command:"node", args:["${CLAUDE_PLUGIN_ROOT}/scripts/headroom-mcp-launch.js"] }`.
- **EDIT `hooks/hooks.json`** — SessionStart 3번째 command(install-companion-tools.js).
- **EDIT `package.json files[]`** — `.mcp.json` + 신규 스크립트 2개 출하 포함(source:npm tarball).

## caveat (정직)

- **첫 세션**엔 MCP 미활성(같은 세션에 설치 → 다음 세션/`/reload-plugins` 후 활성 / 설치→기동 ordering 불가피). default-on 이라 별도 토글 없이 설치 시작부터 자동.
- **opt-out adopter**(`CONTEXT_OPS_DISABLE_HEADROOM=1`): launcher no-op → `/mcp` 패널에 `headroom` 비활성 표기(에러 ❌ / "끈 상태" 신호 / 공식 graceful 보장).
- **설치 ≠ 토큰 절감**: 훅은 설치까지 자동화 / 실 절감은 MCP 서버 활용(에이전트가 `headroom_compress`/`retrieve`/`stats` 호출)부터.
- ⚠️ headroom `learn` 은 CLAUDE.md 를 자동 편집 — 방법론 CLAUDE.md(운영 컨텍스트 SSOT) drift 위험 → `learn` 자동기록은 별도 결단 전 비권장(MCP server scope 와 무관 / 기록만).

## 검증

- JSON 3개(.mcp.json·hooks.json·package.json) valid / 신규 스크립트 2개 `node --check` OK.
- 기본-off: installer·launcher 모두 exit 0 무출력(실설치 미트리거) / opt-in+headroom 부재: launcher graceful no-op(stderr 안내·exit 0).
- pack tarball = `.mcp.json`·install-companion-tools.js·headroom-mcp-launch.js 출하 포함 확인.
- **release-readiness 42/42**(회귀 0 / 신 check 없음 / criteria_total 무변).
- 실 설치 E2E(opt-in→pipx headroom-ai[mcp]→MCP 기동)는 opt-in 실환경 의존 = **carry**(no-simulation — 미실행 경로를 "검증됨"으로 표기 ❌).

## §8.1 (단일 PoC 과적합 회피)

기능 추가(additive opt-in)·HARD-gate/정량 ceiling 아님. 기본-off + launcher no-op 로 무회귀 보장. 본 DEC = **draft**(plugin.json·CHANGELOG·MANDATORY 무변경) — release 시 MINOR bump + CHANGELOG + (선결) package.json lockstep 교정과 함께 본체 격상. lockstep 깨짐(package.json 0.40.0 ↔ plugin.json 0.46.6) = 별개 선결 과제로 보고.

## Relates

- DEC-2026-06-07-pmd-tier1-promotion (install-static-tools 동형 멱등-설치 선례) · DEC-2026-05-18-runtime-tool-exclusion (R19 — 외부 도구 user-owned / 부재=honest carry) · [[feedback_no_static_tool_simulation]] (실패=carry, LLM 대체 ❌) · [[feedback_quality_priority]] · [[feedback_research_fact_validation]] (채널·패키징 실 fetch 확인).
