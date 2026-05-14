# drift-validator/ — 이중 렌더링 의미 동일성 검증 (★ ADR-008 enforcement)

## Purpose

Phase 4.5 이중 렌더링 (`*.json` ↔ `*.mermaid`) **의미 동일성** 자동 검증. ADR-008 (이중 렌더링 사상) enforcement. + chain layout 검증 (`--check-chain-layout`) + state-flow consistency (`--check-state-flow-consistency` / sub-plan-6 신설).

## When to call

- **trigger**: Phase 4.5 산출물 add/edit / chain skill 디렉토리 변경 / sdlc-4stage-flow.json 변경
- **호출자**: skill `analysis-formal-spec-validation` 자동 호출 / CI `.github/workflows/drift-check.yml` (PR + nightly + manual)
- **수동**: `npx drift-validator <dir>`

## Inputs

```bash
# 디렉토리 재귀 (모든 .json + 같은 basename .mermaid 짝 자동 발견)
npx drift-validator <dir>

# 단일 짝
npx drift-validator path/to/User-Account.json

# Chain layout 검증 (★ sub-plan-4 신설)
npx drift-validator --check-chain-layout

# State-flow 정합 (★ sub-plan-6 신설 / state.schema enum ↔ sdlc-4stage stages)
npx drift-validator --check-state-flow-consistency

# 기계 판독
npx drift-validator <dir> --json
```

## Outputs

각 diff 항목 (oasdiff 식):
```json
{
  "severity": "breaking" | "non-breaking" | "info",
  "kind": "<도메인>.<현상>",
  "json": <JSON 측 값>,
  "mermaid": <Mermaid 측 값>,
  "message": "<자연어 설명>"
}
```

| severity | 의미 | 예시 |
|---|---|---|
| **breaking** | structural drift — JSON 의 의미가 mermaid 에 없음. **CI fail** | state/transition 누락, message tuple 불일치 |
| **non-breaking** | 의미 일부 차이 — 라벨 fuzzy / actor 한쪽만 등 | message label drift |
| **info** | 한쪽이 더 자세 (의도된 패턴) | mermaid sub-state |

## Exit codes

| code | 의미 |
|---|---|
| 0 | no breaking |
| 1 | breaking ≥ 1 또는 error |
| 2 | usage error |

## Baseline + Ratchet (★ ADR-010 정합)

```bash
# ① baseline 생성 (legacy 첫 분석 시)
npx drift-validator <dir> --write-baseline .ai-native-methodology/drift-baseline.json

# ② ratchet mode (CI)
npx drift-validator <dir> --baseline .ai-native-methodology/drift-baseline.json --ratchet

# ③ 분류 only (블로킹 ❌)
npx drift-validator <dir> --baseline .ai-native-methodology/drift-baseline.json
```

severity 별 강도 (ADR-010 §2.3):

| severity | baseline 등재 | novel 차단 |
|---|---|---|
| critical | ❌ (즉시 차단) | ✅ |
| breaking / high / medium | ✅ | ✅ |
| low / info | ✅ | ❌ (경고만) |

## 지원 다이어그램

- **state-machine** (`stateDiagram-v2`)
- **sequence** (`sequenceDiagram`)
- decision-table 은 별도 도구 ([`../decision-table-validator/`](../decision-table-validator/)) 가 dmn-check 5종으로 처리

## Sibling tools

- [`../decision-table-validator/`](../decision-table-validator/) — DMN 5종
- [`../formal-spec-link-validator/`](../formal-spec-link-validator/) — Phase 4.5 cross-link
- [`../_shared/baseline.js`](../_shared/) — ADR-010 baseline + ratchet 공용 모듈

## 참조

- ADR-008 (이중 렌더링 사상) + ADR-010 (baseline + ratchet)
- DEC-2026-04-30-A-drift-validator-quality-boost — corpus 14쌍 + transitionFuzzyMatch
- DEC-2026-05-06-sub-plan-4-종결 — `--check-chain-layout` 신설
- DEC-2026-05-06-sub-plan-6-종결 — `--check-state-flow-consistency` 신설

## 구현 노트

- `@mermaid-js/parser` v1.1.0 미지원 → 정규식 fallback (`src/normalize-mermaid.js`)
- Fuzzy match 정책: state id case-insensitive + prefix match / message label 토큰 50% / mermaid sub-state = info
- corpus 24+쌍 self-test (★ tools/drift-validator/corpus/ — workspace developer only / dist 자동 제외)
- ESM-only (Node 18+ + `"type":"module"`)

## ★★★ no-simulation 정합

본 도구는 AI 추론 0% — 정규식 + 명시적 비교 알고리즘만. memory `feedback_no_static_tool_simulation.md` 정합.
