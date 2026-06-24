---
name: token-roi
description: Use when the user wants to measure how effective the methodology's token-saving mechanisms actually are ("토큰 절감 효율 측정" / "codegraph 가 얼마나 아끼나" / "절감 수치 보여줘" / "token ROI"). Runs a deterministic byte/token A/B accounting harness (scripts/token-roi-bench.js) over a fixed sample-task set and reports per-mechanism savings (codegraph vs grep+read baseline / sub-agent isolation / headroom). Honest-measurement first — relative % is tokenizer-robust; absolute tokens are labeled "estimate" unless count_tokens creds are present. Reference-lens only — NOT a deterministic chain gate. Stage = cross-cutting (chain 무관).
allowed-tools: Bash, Read
---

# token-roi — 토큰 절감 ROI 측정

"우리가 하는 토큰 절감 수단이 **얼마나 효율 있나**"를 재현 가능한 실측 숫자로 보고하는 결정론 A/B 하니스. 마케팅 숫자가 아니라 **측정 절차**다.

## 무엇을 재나 (세 수단, 같은 baseline 대비)

같은 "정보 요구"(task)를 충족하는 데 **컨텍스트로 끌려온 토큰량**을 잰다. LLM run-to-run 변동은 결정론 회계로 배제.

| 수단 | A/B | 출처 |
| --- | --- | --- |
| **codegraph** | `codegraph context "<q>"` 출력 토큰 vs grep+read 로 끌려올 파일 토큰 | scriptable (codegraph CLI) |
| **sub-agent 격리** | baseline 파일 토큰을 메인 밖으로 → 메인은 요약만 (`--summary-tokens` 가정) | scriptable |
| **headroom** | API 프록시 계층 → 스크립트 토글 불가 → `headroom_stats` 의 **Compression line 만** | informational |

## 실행

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-bench.js              # 사람용 표
node ${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-bench.js --json       # 기계 판독
node ${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-bench.js --task=T1-login-auth-flow   # 단일 task
node ${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-bench.js --summary-tokens=300        # 격리 요약 가정 조정
```

표본 task = `${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-tasks.json` (재현성 위해 고정 / 표적 스택은 인용 footer 참조).

## 정직성 규칙 (보고 시 반드시 지킬 것)

1. **비율(%) 우선** — A/B 비율은 일관 토크나이저면 오차 상쇄 → 추정 모드에서도 견고. 절대 토큰/$ 는 `count_tokens` 있을 때만 신뢰 (없으면 "estimate ±20%" 라벨 강제 — 스크립트가 자동 표기).
2. **프롬프트 캐시 ≠ 우리 절감** — `headroom_stats` 의 `Cache savings` 는 공급자(Anthropic) 프롬프트 캐시. `Compression savings` 만 headroom 기여. **합산 금지** (업계 함정: 최대 2× 과대보고).
3. **손실형 요약 주의** — 격리/headroom 절감은 답 품질 손실을 함께 재지 않으면 무효. 격리 절감%는 가정 요약 크기 기준 **상한**.
4. **codegraph 미가용 시 날조 ❌** — 인덱스/바이너리 없으면 그 arm 은 skip + 정직 신호 (평균서 제외, null). persona 시뮬 금지.
5. **토크나이저/모델 버전 고정** — 스크립트는 `claude-opus-4-8` 로 count. 버전 다르면 토큰수 비교 무의미 (Opus 4.7+ ~30% 증가).
6. **표본 한계** — 단일 PoC 과적합 회피 위해 스택 다양화는 ≥2 PoC 후속.

## trust (DEC-2026-05-28 §4.2 정합)

본 하니스 출력 = **reference-lens**. 어떤 결정적 chain gate 에도 inject ❌. "이 수단이 이만큼 아낀다"는 측정 보고일 뿐, release/gate 판정 근거 아님.

## "여직까지 누적"은 왜 못 내나 (사용자 FAQ)

codegraph·표준격리의 절감은 *반사실(counterfactual)* — "안 썼다면 N토큰 썼을 것"의 N은 그 당시 기록된 적이 없어 사후 복구 불가. 계측이 부재하므로 **지금부터 A/B** 로만 정직한 숫자가 나온다. headroom 만 `headroom_stats` 에 실재 카운터(compression line) 보유.

## on-demand 요약 (`/context-ops:roi`)

세션 절감을 **요청 시에만** 요약 표시한다. 상시 statusline 표시 대신 on-demand 로 둔 이유: headroom 수치는 머신 전역 프록시 누계라 statusline 에 상시 띄우면 "이 세션 절감"으로 오독되기 때문(아래 정직성).

**ledger (플러그인 기본 always-on)**: PostToolUse 훅(`scripts/token-roi-ledger-hook.js`, hooks.json 등록 / matcher=codegraph)이 codegraph 호출의 출력 토큰을 `~/.claude/token-roi/ledger-<session>.jsonl` 에 적재. **env 게이트 없음** (v0.73.0 — 뷰어 커맨드도 함께 출하되므로 옛 opt-in "orphan ledger" 우려 해소). 로컬 전용 / 외부 전송 ❌ / 항상 exit 0 (비차단).

**요약 보기**: 슬래시 커맨드 `/context-ops:roi` (→ `scripts/token-roi-summary.js` / Node 크로스플랫폼). headroom + codegraph 수치를 한 번에 출력. 표기 규칙:
- **headroom** = 압축 **실측** 절감 (`~/.headroom/proxy_savings.json`). 단 `display_session` 은 포트 8787 프록시 **프로세스**의 세션 = **머신 전역**(이 Claude 세션 한정 ❌) → "머신 전역 누계"로 명시 표기. `compression_savings_usd` 만 우리 기여, 캐시 line 합산 ❌. **headroom 프록시는 개인 설정**(`ANTHROPIC_BASE_URL`)이라 안 돌리면 "데이터 없음"(플러그인이 못 주입 — 정직 표기).
- **codegraph** = `cg~Nk estimate (x1.8 vs grep+read)` **추정** 절감. 1.8 = 1/(1−0.645)−1, 0.645 = 본 하니스 A/B 평균 절감률. 반사실이라 "estimate" 라벨 강제.
- **iso**(서브에이전트 격리)는 **표시 안 함** — 절감 아님(diverted) + 별도 기법 아님(=그냥 서브에이전트 사용) 결론.
- 전체 A/B 측정 하니스가 필요하면 `/context-ops:token-roi`(이 skill) 로 `scripts/token-roi-bench.js` 실행.

## 인용

- 표본 task 표적 스택: poc-18 (Express+Prisma modern-TS) — codegraph 강세 스택 선정(legacy/iBATIS2 cover 약 → 불공정 회피). codegraph dogfood=examples/ 정합.
