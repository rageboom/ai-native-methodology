# agents/analysis/ — analysis stage (★ chain 1 진입 전 / v1.x 자산 활성)

본 stage = chain harness 1 (planning) 진입 전 단계. legacy 코드 → 7대 산출물 한 방향 추출 (Phase 0~6 + 4.5 + aspect 4).

★ 본 stage 의 sub-agent 는 `agents/_base/` 의 3종 (senior-engineer / official-docs-checker / industry-case-researcher) 활용. analysis 전용 sub-agent 분화는 향후 채움 trigger 시 신설.

## skill 위치

[`../../skills/analysis/`](../../skills/analysis/) 18 skill (phase-0~6 + aspect 4).

## 호출 cadence

- **자연어**: "이 코드베이스 분석 시작" / "inventory 추출" / 기타 phase-N prompt
- **chain-driver**: chain 1 진입 전 단계 / chain harness state 와 무관 (analysis 종결 후 chain 1 init)

## 산출물

7대 산출물 + finding + antipatterns + migration-cautions → 본 stage 종결 = chain 1 (planning) 의 input.

## 향후 채움 trigger (별도 분화 필요 시)

- 분석 stage self-iteration 중 BE / FE / DB 트랙별 senior 가 별도로 필요한 finding 누적 (예: BE-senior 가 Spring/NestJS 정책 깊이 / FE-senior 가 React 18 / Concurrent API 깊이) — 이때 `analysis/be-senior/` 와 `analysis/fe-senior/` 신설
- 또는 v2.0 lifecycle 확장 결단 시 stage 별 sub-agent 분화 필요
