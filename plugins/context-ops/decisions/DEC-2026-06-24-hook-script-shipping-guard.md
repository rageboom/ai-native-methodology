# DEC-2026-06-24-hook-script-shipping-guard

**출하 누락 hook 런타임 스크립트 3종 복구(dead-on-install) + release-readiness 재발방지 가드 신설 (v0.75.0 MINOR)**

**상태**: 승인·시행 (plugin.json 0.74.0 → 0.75.0 → **0.75.1**)

> **v0.75.1 정정 (publish dry-run + tarball 실측 발견)**: v0.75.0 이 고친 `build-plugin.js` INCLUDE 는 **git-subdir dist 채널**이고, marketplace.json `source: npm` 의 **실제 설치 경로는 `package.json files`**(별개 allow-list)였다. `pnpm pack` tarball 실측 결과 `files` 에서 `graph-context-nudge.js` + token-roi 4종 누락 → **npm 설치 시 여전히 dead-on-install**(token-roi 는 v0.73.0 이래 npm 채널에서 죽어 있었음 — v0.73.0 도 INCLUDE 만 고치고 `files` 미반영). **정정**: ① `package.json files` 에 5종 등재(tarball 실측 검증) ② **check #43 양채널 확장** — npm(`files`, AUTHORITATIVE) ∩ dist(`INCLUDE`) 둘 다 멤버십 검증 / 누락 채널명+referrer 지목 / ancestor-aware. **교훈 심화**: 출하 채널이 2개면 가드도 2개 다 봐야 한다 — 한 allow-list 만 검증한 v0.75.0 자체가 재발 사례.

## 맥락 (dogfood 발견)

living-graph carry(b/c) 정리 중 `scripts/codegraph-nudge.js` 가 `tools/_shared` import 로 통합 가능한지 출하 경로를 검증하다가, 해당 스크립트가 **애초에 출하 패키지에 없음**을 발견. clean rebuild(`dist/context-ops-v0.74.0/scripts/`) 실측 결과 `install-static-tools.{js,sh}` + `token-roi-*` 만 존재.

`scripts/` 는 `build-plugin.js` 에서 **wholesale 출하가 아니라 INCLUDE allow-list** 방식(dev tooling 은 workspace-only). hooks.json 이 `node ${CLAUDE_PLUGIN_ROOT}/scripts/<x>` 로 호출하는 런타임 스크립트 3종이 allow-list 에 미등재 → 설치된 플러그인에서 파일 부재 → 런타임 `Cannot find module` = 기능 **dead-on-install**.

## 결함 (3건 / 출하 누락 / dead-on-install)

| 스크립트 | hooks.json 이벤트 | 죽은 시점 |
|----------|------------------|-----------|
| `scripts/install-companion-tools.js` | SessionStart (codegraph/headroom companion 설치) | — |
| `scripts/graph-context-nudge.js` | UserPromptSubmit (living-graph Gap A 자동주입) | v0.64.0 |
| `scripts/codegraph-nudge.js` | PreToolUse (codegraph 토큰절감 nudge) | DEC-2026-06-15 |

**근본 원인 = v0.71.0 token-roi 패키징 결함과 동일 클래스.** 당시 교훈("새 런타임 스크립트는 반드시 INCLUDE 등재 / scripts/ wholesale ❌")이 **메모리(`feedback`)에만 있고 결정론 gate 로 안 굳어** nudge 3종에 미적용 → 재발. release-readiness 42/42 에 hooks→script 출하정합 체크가 없어 통과.

## 결정

1. **INCLUDE 복구** — `scripts/build-plugin.js` INCLUDE 에 3 스크립트 등재. rebuild → dist/scripts/ 출하 + 런타임 import(`../tools/_shared/*`) 해소 + node --check + no-op 스모크 검증.
2. **재발방지 가드 (gate 화)** — release-readiness **check #43 `hook_script_shipped`** 신설(criteria 42→43). 출하 hooks/commands/skills/agents 가 호출하는 모든 `${CLAUDE_PLUGIN_ROOT}/scripts/*` 가 INCLUDE allow-list 에 등재됐는지 결정론 대조. 미등재 시 referrer `file:line` 지목 + fail-closed. **file-presence 아닌 INCLUDE 멤버십 검증**(소스는 존재하나 미출하가 본 버그의 본질). 확장자 longest-first + `(?![A-Za-z0-9])` 경계(`js`↔`json` prefix 오매칭 차단 / 자체검증 중 발견·수정).

검증: 양성(8 ref 전부 등재 → pass) + 음성(INCLUDE 1개 제거 → fail-closed + 정확 지목) + release-readiness.test count-coupling(42→43 / id list / pass-count) + 전용 test.

## §8.1 (단일 PoC 과적합 회피)

출하정합은 결정론 멤버십(데이터 정확성)이라 PoC corroboration 무관 — 모든 플러그인 빌드에 동형 적용. 신 check 1개(count-coupling 정합) + 기존 도구 test 회귀로 충분.

## Relates

- DEC-2026-06-15-headroom-global-routing (codegraph-nudge / companion 도구) · v0.64.0 living-graph autowire (graph-context-nudge) · token-roi v0.73.0 패키징 결함(동일 클래스 선례) · [[feedback_release_readiness_count_coupling]] · [[feedback_self_recorded_fact_validation]] (교훈의 gate 화 / 메모리 narrative 액면수용 ❌).
