# DEC-2026-06-24-chain-slash-command-rename

**상태**: 승인·시행 (plugin.json 0.73.0 → 0.74.0 MINOR — 0.73.0 은 token-roi 측정 하니스가 동시 점유하여 상향. 사내 origin-smilegate main rebase 통합)

## 발단
사용자 지적: hook 출력(`hooks-bridge` additionalContext)에 `/aimd-next`·`/aimd-stage <name>` 안내 문구가 **아직 남아 있다 / 이름이 바뀌었는데**. `DEC-2026-06-08-aimd-rename-ai-context`(`.aimd` → `.ai-context`) 이후 `aimd` 토큰은 죽은 식별자인데 슬래시 명령 안내만 정정 누락.

## 근본 원인
부모 리네임의 sweep 정규식 = `/\.aimd(?!-install)/g` — **앞에 점(`\.`)** 앵커. 디렉토리 컨벤션 `.aimd` 만 잡았고 **슬래시로 시작하는 `/aimd-next`·`/aimd-stage`** 는 패턴이 닿지 않아 chain-driver 소스/문서에 잔존. 추가 발견: `/aimd-next`·`/aimd-stage` 는 **실제 등록된 슬래시 명령이 아니었음**(command 정의 파일 부재) — chain-driver 가 사용자에게 출력하는 안내 텍스트일 뿐, 실제 메커니즘은 `chain-driver next` CLI. 즉 "안내는 하나 동작하는 명령은 없는" 불일치 상태.

## 결정
1. 죽은 `aimd` 토큰 슬래시 명령 → **`/chain-next` · `/chain-stage`** (실제 메커니즘 chain-driver / chain harness 와 정합 / 의미 = "chain 진행").
2. 안내↔동작 불일치 해소 — `commands/` 에 **실제 슬래시 명령 정의 신규 생성**(자동 발견 / plugin.json 선언 불요):
   - `commands/chain-next.md` → `chain-driver next <project> --user-decision <go|stop> --json` 게이트 평가+forward 전이, exit 0 시 stage sub-agent dispatch (v4.0 paradigm). ADR-CHAIN-005 D21' 사용자 명시 결단 entry.
   - `commands/chain-stage.md` → `$ARGUMENTS` stage명; 종결 stage 면 `--user-decision revisit:<stage>` backward 전이(intervention_log 기록), 이후 stage sub-agent dispatch.

## 스코프
- **live 코드(5)**: `tools/chain-driver/src/invoke-skill.js`(2) · `hooks-bridge.js`(1) · `cli.js`(2).
- **lockstep 테스트(1)**: `tools/chain-driver/test/invoke-skill.test.js:53` `assert.match(ctx, /\/chain-next/)`.
- **live 문서(2 파일)**: `docs/MIGRATION-v1-to-v2.md`(7) · `docs/adr/ADR-CHAIN-005-driver-state-machine.md`(2).
- **신규(2)**: `commands/chain-next.md` · `commands/chain-stage.md`.
- **보존**(시점 사실 / 부모 DEC "역사 기록 보존" 규칙 정합 / runtime read 0): `CHANGELOG-HISTORY.md` · `decisions/*-HISTORY.md` · 과거 DEC 항목. `decisions/*` 의 `/tmp/aimd-clean-clone.*` = 슬래시 명령 아닌 과거 tmp 경로 = 무관·무접촉.

## 검증
- live `/aimd-next`·`/aimd-stage` 잔존 = **0** (history/decisions 제외 grep clean).
- chain-driver 테스트 GREEN(lockstep `/chain-next` 단언 정합).
- release-readiness 통과 + 3-way 버전 sync(plugin.json · package.json · CHANGELOG).

## 교훈
- 컨벤션 리네임 sweep 의 **앵커가 한 prefix(`\.`)에 묶이면 다른 prefix(`/`)의 동일 토큰을 놓친다** — 토큰 단위가 아닌 prefix 단위 정규식의 사각. 리네임 후 **prefix-agnostic 잔존 grep**(`aimd` bare)으로 전수 확인했어야.
- "안내 문구는 있으나 실제 명령은 없는" dangling reference = 사용자 신뢰 훼손 — 안내↔동작 lockstep(명령 정의 동반)으로 격상.
- 부모: `DEC-2026-06-08-aimd-rename-ai-context`(§후속).
