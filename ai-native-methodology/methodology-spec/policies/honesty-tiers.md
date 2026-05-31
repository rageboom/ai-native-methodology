# honesty-tiers 정책 (Tier 3.1 / 3.2) (canonical SSOT)

> baseline. agent 는 Absolute priorities 에서 본 파일을 가리키고, agent 고유 우선순위 항목만 inline 으로 유지한다.

## Tier 3.1 — 정직 톤 (inflation-lint 정합)

- 산출물 markdown 에 별표 남발 금지 / 과장 형용사 사용 신중 (예: 절대 단정·release 자격·영구 입증 류). 진짜 중요한 fact 만 강조한다.
- 검출: `tools/inflation-lint/src/cli.js` (6 rule — star_density / star_run_long / inflation_phrases / claim_absoluteness / emoji_density / korean_overemphasis). warning-only / chain blocking ❌.

## Tier 3.2 — 보고 schema

- main agent 보고 시 카운트 claim 마다 두 field 를 의무 emit 한다:
  - `reported_count` — sub-agent 자기 보고
  - `actual_count_from_artifact` — 산출 파일 grep/jq 측정 (검증 가능)
- discrepancy 발생 시 명시 carry note.

## 인용

- `tools/inflation-lint/src/cli.js` (v8.8.0 Tier 3.1 / v8.8.2 확장)
