# drift-validator

Phase 4.5 이중 렌더링 (`*.json` ↔ `*.mermaid`) **의미 동일성** 자동 검증 도구.

본 도구는 Sprint 4 묶음 N — Drift CI 의 핵심 산출물. ADR-008 (이중 렌더링 사상) 정합 enforcement.

## 지원 다이어그램

- **state-machine** (`stateDiagram-v2`)
- **sequence** (`sequenceDiagram`)
- decision-table 은 별도 도구 (`tools/decision-table-validator/`) 가 dmn-check 5종으로 처리.

## 출력 모델 (oasdiff 식)

각 diff 항목:

```
{ "severity": "breaking" | "non-breaking" | "info",
  "kind": "<도메인>.<현상>",
  "json": <JSON 측 값>, "mermaid": <Mermaid 측 값>,
  "message": "<자연어 설명>" }
```

| severity | 의미 | 예시 |
|---|---|---|
| **breaking** | structural drift — JSON 의 의미가 mermaid 에 없음. **CI fail** | state/transition 누락, message tuple 불일치 |
| **non-breaking** | 의미 일부 차이 — 라벨 fuzzy / actor 한쪽만 등 | message label drift |
| **info** | 한쪽이 더 자세 (의도된 패턴) | mermaid 가 sub-state 까지 자세 — 본 방법론 의도 |

## 사용

```bash
# 디렉토리 재귀 (모든 .json + 같은 basename .mermaid 짝 자동 발견)
npx drift-validator <dir>

# 단일 짝
npx drift-validator path/to/User-Account.json

# 기계 판독
npx drift-validator <dir> --json
```

exit code: `0` (no breaking) / `1` (breaking ≥ 1 또는 error) / `2` (usage error).

## ★ Baseline + Ratchet (v1.2.3 — ADR-010 정합)

레거시 도입 시 결함 폭증 차단 회피 + 점진 격상.

```bash
# ① baseline 생성 (legacy 첫 분석 시)
npx drift-validator <dir> --write-baseline .ai-native-methodology/drift-baseline.json

# ② ratchet mode (CI)
npx drift-validator <dir> --baseline .ai-native-methodology/drift-baseline.json --ratchet
# → exit 0 if novel-blocked = 0
# → exit 1 if novel-blocked >= 1

# ③ 분류 only (블로킹 ❌)
npx drift-validator <dir> --baseline .ai-native-methodology/drift-baseline.json
```

severity 별 강도 (ADR-010 §2.3):
| severity | baseline 등재 | novel 차단 |
|---|---|---|
| critical | ❌ (즉시 차단) | ✅ |
| breaking / high / medium | ✅ | ✅ |
| low / info | ✅ | ❌ (경고만) |

## 구현 노트

### Sprint 4 30-min spike 결과

`@mermaid-js/parser` v1.1.0 의 `parse('stateDiagram', ...)` 가 첫 호출은 빈 ast (`{}`) 반환 후 throw — **두 grammar 모두 의미 있게 미지원**. 결정 분기 **C → 정규식 fallback**.

자체 normalizer (`src/normalize-mermaid.js`) 가 다음 정규화 수행:
- `<br/>` → 공백
- `★ ⚠️ ✅ ❌` 등 시각 마크 제거
- 한국어/영어 공백/대소문자 통일 (case-insensitive id)
- composite state nesting depth 추적

### Fuzzy match 정책

- **state id** — case-insensitive + prefix match (validating ↔ validatingState)
- **message label** — 토큰 50% 이상 겹치면 동일 (★/공백/구두점 무시)
- **mermaid 가 더 자세함** — JSON top-level state 가 mermaid 의 compound state 와 매칭되면 OK. mermaid 의 sub-state 는 `info`.

## 현재 한계 (Sprint 4 → Sprint 5 carry-over)

- decision-table 비교는 별도 도구 (dmn-check 5종 — Phase B').
- Composite state 의 inner transition 이 outer transition 으로 elide 된 경우 fuzzy 매칭 미완 (transitionFuzzyMatch heuristic 보완 필요).
- 의미 동일성 corpus 4쌍 (1차) — 풀 20쌍 carry-over.
- CJS / ESM 호환 — 현재 ESM-only (Node 18+ + `"type":"module"`).

## 시뮬레이션 금지 정책 정합

본 도구는 **AI 추론 0%** — 정규식 + 명시적 비교 알고리즘만 사용. ★★★ no simulation 원칙 정합 (memory `feedback_no_static_tool_simulation.md`).
