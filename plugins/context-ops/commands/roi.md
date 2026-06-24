---
description: 토큰 절감 요약 (headroom 압축 실측 + codegraph 추정) on-demand 표시
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-summary.js)
---

다음은 현재 토큰 절감 요약입니다:

!`node ${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-summary.js`

위 수치를 사용자에게 간결히 해설하라. 정직성 규칙을 반드시 지켜라:

- **headroom** = 압축 프록시(포트 8787)의 **머신 전역 누계** — 이 Claude 세션 한정이 아니다. compression 절감만 우리 기여이고, cache 절감은 공급자 프롬프트 캐시이므로 합산하지 않는다. headroom 프록시는 개인 설정(`ANTHROPIC_BASE_URL`)이라 안 돌리면 "데이터 없음"이 정상이다.
- **codegraph** = grep+read 대비 **반사실 추정(estimate)** — 실측이 아니므로 과장 금지. 숫자가 없으면 "기록 없음"으로 정직하게 보고하라.
- **iso**(서브에이전트 격리)는 절감이 아니라 diverted → 표시하지 않는다.
- 전체 A/B 측정 하니스가 필요하면 `/context-ops:token-roi` 를 안내하라.
