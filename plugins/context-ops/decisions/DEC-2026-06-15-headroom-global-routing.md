# DEC-2026-06-15-headroom-global-routing

**플러그인이 글로벌 durable 프록시 라우팅을 자동 셋팅 (SessionStart → `headroom init claude --global` / DEFAULT ON / opt-out / 전 adopter / draft — release bump 대기)**

> headroom-companion(MCP 서버 배선)의 **속편**. companion 은 `headroom mcp serve`(압축 도구)만 켰고 프록시 라우팅은 안 했음. 사용자(TF Lead)가 "플러그인 설치 시 **proxy + client 도 같이 실행**"을 요구 → 5라운드 대화로 메커니즘 좁힌 뒤 **global durable 자동 셋팅**으로 확정.

## 맥락 (사용자 요청)

사용자 — "지금의 플러그인을 설치하면 Headroom **proxy 와 클라이언트도 같이 실행**되도록" + 후속 "글로벌로 자동 셋팅". headroom MCP companion(DEC-2026-06-15-headroom-companion)은 압축 **도구**(`headroom_compress`/`retrieve`/`stats`)만 노출 — 실제 API 트래픽을 가로채는 **proxy**(`headroom proxy --intercept-tool-results --port 8787`)와 그것을 경유하는 **클라이언트 라우팅**은 미배선이었음.

## 사실 확인 (소스 실측 / 추정 ❌ — `feedback_research_fact_validation`)

headroom 소스(`~/.local/pipx/venvs/headroom-ai/.../headroom/`) 직접 read:

- **"플러그인 install 훅" 부재** — 실 메커니즘 = **SessionStart 훅 + 멱등 marker**(companion·static-tools 동형). 플러그인은 Claude Code *안에서* 로드되므로 **현재 세션의 클라이언트를 사후에 프록시로 못 돌림**(`ANTHROPIC_BASE_URL`=프로세스 부팅 시 1회 읽힘). → **다음 세션부터** 적용(불가피 ordering).
- **`headroom init claude --global` 실체** = 단 두 가지:
  1. `~/.claude/settings.json` 의 `env` 에 `ANTHROPIC_BASE_URL=http://127.0.0.1:8787` 기록 (`providers/claude/install.py:17,35` / `install/paths.py:108` = `~/.claude/settings.json`).
  2. 같은 settings.json 에 **SessionStart(`startup|resume`) + PreToolUse hook** 설치 (`cli/init.py:142`) → `headroom init hook ensure` (`init.py:927`) → `_ensure_profile_running()` (`init.py:943`) = **매 세션 시작 시 프록시 best-effort 기동** (self-heal).
- 라우팅 메커니즘 = **settings.json env 가 유일** (PATH shim·전용 hook 대안 없음).
- **`--global`(`~/.claude`, cwd 무관) vs no-flag(`<cwd>/.claude/settings.local.json`, 프로젝트 한정)** (`init.py` `_claude_scope_path`). 사용자 결단 = **global**.
- **워크플로우 적용**: Task/Agent 서브에이전트·Workflow `agent()` 는 메인 프로세스의 API client 를 공유 → 메인이 부팅 때 라우팅됐으면 **그 안의 모든 워크플로우 호출도 상속**. **global 은 별도-process·타 cwd 까지** `~/.claude` 를 읽어 커버(local 의 "그 프로젝트에서 launch 했을 때만" 구멍을 메움) — 사용자가 이 완전성을 위해 global 선택(blast radius 수용).
- 되돌리기 = `headroom unwrap claude` (reversible).
- **자체 semgrep 규칙 `claude-settings-env-url-override`** = settings.json 의 `ANTHROPIC_BASE_URL` 을 ERROR(CWE-923)로 잡음 → 글로벌 쓰기가 **자기 규칙 위반**. 단 **실 발화 = nil**(① 벤더 upstream 트리 안 커스텀 규칙 ② 플러그인 semgrep 기본 ruleset = `p/owasp-top-ten`(이 규칙 미포함) ③ 쓰기 타깃 `~/.claude` = 스캔 범위 밖). `feedback_diagnose_before_design_check_existing` 적용 → 규칙 자체 메시지가 *"trusted endpoint"* 예외 명시 + loopback 127.0.0.1 이 정확히 그 케이스 → **loopback 예외**로 개념 일관성 확보(gate 경로 무영향).

## 결정 (사용자 확정 2026-06-15)

1. **범위 = 전 adopter** — companion 과 같은 SessionStart installer·**같은 opt-out 토글**(`CONTEXT_OPS_DISABLE_HEADROOM=1` / `CONTEXT_OPS_INSTALL_HEADROOM=0`).
2. **메커니즘 = `headroom init claude --global`** (durable). `wrap`(1회성)·`install apply`(persistent-service) 비채택 — `init` 이 hooks + routing + ensure-self-heal 를 한 방에.
3. **scope = global**(`~/.claude`) — 워크플로우 별도-process/타 cwd 완전 커버 우선, 머신 전역 blast radius 수용.
4. **멱등 = marker-once**(`.headroom-routing-installed`) + **opt-out 양방향**(opt-out 시 `headroom unwrap claude` 로 실 un-route — binary/MCP opt-out 의 passive no-op 과 비대칭이나 machine-wide blast radius 때문에 정당).
5. **semgrep loopback 예외 동반** — 자기 규칙 위반 해소(127.0.0.1/localhost/::1 / delimiter-terminated → look-alike 비면제).

## 구현 (draft / 미커밋)

- **EDIT `scripts/install-companion-tools.js`** — `ensureGlobalRouting()`(marker-once / headroom 부재 시 다음 세션 재시도 / honest-carry) + `removeGlobalRouting()`(opt-out 양방향 unwrap) + main 배선(`if(ensureHeadroom()) ensureGlobalRouting(); else removeGlobalRouting();`) + 헤더 주석. `rmSync` import 추가.
- **EDIT `tools/semgrep-rules/ai/ai-best-practices/claude-settings-env-url-override/*.yaml`** — `pattern-regex` → `patterns:`(+`pattern-not-regex` loopback). 메시지에 loopback 면제 명문.
- **EDIT `*.settings.json` fixture** — loopback ok-case 3종(IP/localhost/IPv6) + look-alike(`127.0.0.1.evil.com`) ruleid-case.

## caveat (정직)

- **첫 세션 미라우팅** — env 는 부팅 때 읽힘 → 적용 세션은 미경유, 다음 launch 부터.
- **machine-wide blast radius** — 이 머신의 **모든** Claude Code(무관한 타 프로젝트 포함)가 localhost:8787 경유. ensure-hook 가 세션 시작마다 프록시 재기동하나 **mid-session self-heal 없음** → 프록시가 워크플로우 도중 죽으면 in-flight 호출 실패 = **워크플로우 SPOF**.
- **설치 ≠ 토큰 절감** — proxy 압축은 큰 tool-result 에서만 발화(실측: 짧은 세션 0%). 라우팅을 배선할 뿐 절감 보장 ❌. memory `feedback_standard_context_management`("커스텀 자동압축 훅 ❌")와 결 부딪힘 — **사용자 명시 결단**으로 진행.
- **fidelity 변수** — `--intercept-tool-results` 압축이 워크플로우 큰 tool-result 에서 발화 시 sub-agent 가 받는 내용이 unproxied 와 달라질 수 있음(결정론·"검증기>액면수용" 사상에 변수 추가).
- **semgrep 규칙** = 벤더 트리 안 커스텀 규칙 / 실 발화 nil → loopback 예외는 개념 일관성 + 향후 그 규칙 직접 실행 대비(어떤 결정적 gate 에도 미주입).

## 검증

- `node --check scripts/install-companion-tools.js` OK.
- `semgrep --test` **1/1 통과** — ruleid 4종(원격 3 + look-alike `127.0.0.1.evil.com`) 발화 · loopback 3종(IP/localhost/IPv6) 면제.
- release-readiness 42/42 (회귀 0 / 신 check 없음 / criteria_total 무변).
- **실 init E2E**(다음 세션 `~/.claude/settings.json` 기록 + ensure-hook 프록시 기동)=실환경 의존 = **carry**(no-simulation — 미실행 경로를 "검증됨" 표기 ❌). 본 dev 머신은 다음 세션에서 dogfood 발현.

## §8.1 (단일 PoC 과적합 회피)

additive · opt-out 양방향 무회귀 · HARD-gate/정량 ceiling 아님. draft(plugin.json·CHANGELOG·MANDATORY 무변경) → release 시 MINOR bump + **package.json lockstep 교정(0.40.0 ↔ plugin.json 0.46.7 / 별개 선결)** 과 함께 본체 격상.

## Relates

- DEC-2026-06-15-headroom-companion (모 — 같은 installer·opt-out 토글 / MCP 서버 배선) · DEC-2026-06-15-codegraph-search-token-saving (자매 companion / default-on) · [[feedback_research_fact_validation]] (headroom 소스 실측) · [[feedback_diagnose_before_design_check_existing]] (semgrep 자기위반 실-발화 nil 재평가 → 벤더 트리 직접 수정 대신 loopback 예외) · [[feedback_quality_priority]] · [[feedback_standard_context_management]] (자동압축 결 충돌 명시 / 사용자 결단 override).
