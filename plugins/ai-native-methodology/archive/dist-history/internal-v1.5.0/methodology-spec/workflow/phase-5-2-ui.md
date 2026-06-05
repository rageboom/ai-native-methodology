# Phase 5-2: ui (분할 안내 — Deprecated stub)

> **Deprecated stub** — deliverable 7 (UI/UX) 단일 산출 → deliverable 7 / 8 / 9 의 3 산출 분할로 격상됨.
> 기존 참조 호환을 위해 본 stub 유지.

---

## 분할 안내

| 신 phase                  | deliverable        | 영역                                                                    | spec 파일                                          |
| ------------------------- | ------------------ | ----------------------------------------------------------------------- | -------------------------------------------------- |
| **Phase 5-2-a (ui-base)** | #7 ui-spec         | pages / components / design-tokens / scenarios / user-flows (정적 구조) | [`phase-5-2-a-ui-base.md`](phase-5-2-a-ui-base.md) |
| **Phase 5-2-b (state)**   | #8 state-map       | 분산 상태 5 진실 + state machine (동적 행동)                            | [`phase-5-2-b-state.md`](phase-5-2-b-state.md)     |
| **Phase 5-2-c (visual)**  | #9 visual-manifest | snapshot PNG (binary 진실 모델)                                         | [`phase-5-2-c-visual.md`](phase-5-2-c-visual.md)   |

---

## 분할 사상 근거

- **ADR-FE-001** — FE 추출기 가정 (spectrum Tier 1~4 cover)
- **ADR-FE-002** — 이중 렌더링 사상 FE 적용 + visual 예외 (binary 진실 모델)
- **ADR-FE-005** — 권위 매개체 12 채택 (W3C SCXML 1.0 / DTCG 2025.10 / Playwright / axe-core / Storybook CSF v3 / WCAG 2.1+2.2 ratchet)

---

## 마이그레이션 가이드

```
구: /analyze-ui  →  ui-spec.json (5 하위 산출물)
신: /analyze-ui-base  →  ui-spec.json (정적 구조)
    /analyze-state    →  state-map.json (동적 행동)
    /analyze-visual   →  visual-manifest.json (시각 진실)
```

**병렬 가능**: 5-2-a / 5-2-b / 5-2-c 모두 Phase 5-1 (API) 와 병렬 실행 가능.

**의존 순서** (5-2-a 출력이 5-2-b/c 의 cross-link 입력):

1. 5-2-a 먼저 (ui-spec.json — PAGE-XXX / CMP-XXX ID 부여)
2. 5-2-b + 5-2-c 병렬 진행 가능
