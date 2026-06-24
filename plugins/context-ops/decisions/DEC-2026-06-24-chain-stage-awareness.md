# DEC-2026-06-24-chain-stage-awareness

**chain stage 상시 인지 — statusLine 세그먼트 + `/chain-status` 커맨드 (v0.76.0 MINOR)**

**상태**: 승인·시행 (plugin.json 0.75.1 → 0.76.0)

## 맥락 (사용자 발화)

chain harness 진행 중 "지금 무슨 chain stage 인지" 사용자가 알 방법이 사실상 없다. stage SSOT(`.ai-context/state.json` 의 `current_scope` + `scope_states[].current_chain`)는 있으나 노출이 **pull-only**(`chain-driver state` 직접 실행) → ambient(상시) 인지 채널 부재.

## 사양 검증 (claude-code-guide / 공식 docs)

1. **statusLine 스코프** — `.claude/settings.local.json`(로컬) / `.claude/settings.json`(프로젝트) / `~/.claude/settings.json`(전역) 어디든 가능, 가장 구체적 레벨이 완전 override. **전역 불요** — chain statusLine 은 프로젝트 `.ai-context/state.json` 을 읽으니 프로젝트/로컬이 정답.
2. **플러그인 자동주입 불가** — 플러그인이 기여 가능한 settings 는 `agent` + `subagentStatusLine` 뿐. **메인 `statusLine` 은 플러그인 manifest 로 못 넣음** → 사용자가 1회 설정해야 함.
3. **`${CLAUDE_PLUGIN_ROOT}`** — hooks / 슬래시커맨드 / spawn node 에서 env 로 잡힘 → setup 시점 절대경로 resolve 가능. 단 **statusLine 실행 시점엔 미보장** → statusLine 스크립트는 self-contained 필수.
4. **hot-reload** — settings 파일 watch → statusLine 변경 1~2초 내 라이브 반영(재시작 불요).
5. 빌트인 `/statusline` 은 전역(`~/.claude`)에 써서 프로젝트 스코프 목표에 부적합 → 자체 setup.

## 결정

① **statusLine 세그먼트**(`scripts/chain-statusline.js`) — self-contained / stdin cwd → state.json → `📍 spec 2/5 · BC-FOO`. analysis=gate#0(N/5 생략) / idle / 침묵(state.json 없음) / blocked=`⛔`. blank-on-error. 비-gating display(reference-lens).
② **`/chain-status` 커맨드** — 기본=상태 조회(`chain-driver state` wrap) / `--setup-statusline`=③.
③ **`scripts/chain-statusline-setup.js`** — `${CLAUDE_PLUGIN_ROOT}` resolve → `.claude/settings.local.json` 에 statusLine merge-write(idempotent / clobber-guard / 무손실 / env부재 exit3). 사용자 하드 편집 0.
④ **출하 등록 양채널** — 두 스크립트 → package.json files + build INCLUDE. `commands/chain-status.md` 가 두 스크립트를 `${CLAUDE_PLUGIN_ROOT}/scripts/...` 로 명시 참조 → **check #43 이 양채널 출하 자동 강제**(chain-statusline.js 는 settings 참조라 안 잡힐 뻔한 것을 커맨드 doc 참조로 커버).

## 검증

- chain-statusline 12 test + chain-statusline-setup 7 test + E2E 스모크(fixture state.json → 렌더 / setup 신규기입·idempotent·env부재 exit3).
- release-readiness 43/43(check #43 = 신규 스크립트 양채널 자동검증) + 3-way sync + catalog drift 0 + `pnpm pack` tarball 실측.

## §8.1 / trust

- deterministic-axis(STRONG-STOP): statusLine + state read = 결정론 / 비-gating display / LLM 판단 inject 0.
- UX additive 기능(방법론 품질 주장 아님) / 신규 gate 없음(criteria 43 불변) / 픽스처 dogfood 충분.

## Relates

DEC-2026-06-24-hook-script-shipping-guard(check #43 / 신규 스크립트 출하 강제) · chain-driver state-machine(state.json SSOT) · DEC-2026-06-24-chain-slash-command-rename(commands/ 패턴) · project_chain_gate_numbering_canonical(stage→N/5) · feedback_chain_driver_deterministic_axis(reference-lens / gate inject ❌).
