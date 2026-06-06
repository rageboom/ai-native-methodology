# 자동화 경계 정책 (70~80% 한계) (canonical SSOT)

> baseline. 각 skill/agent 는 본 파일을 가리키고, 자신의 구체적 자동화 %(modality 별 근거)만 inline delta 로 유지한다.

## 1. 원칙

- 100% 자동화는 하지 않는다. AI 자동 생성 + 사용자 검토 의무. round-trip = chain harness gate 안에서만 정식 허용.

## 2. 두 axis 구분 (분모가 다르므로 동일 숫자로 비교/인용 금지)

| axis | 정의 | 분모 | 기준 |
|---|---|---|---|
| chain-harness 전체 자동화 | AI 자동화 ≥ 85% / 사람 검토(gate #1~#5) ≤ 15% | gate #1~#5 통합 통과율 (process metric) | 100% 자동화 ❌ |
| analysis §3-A extraction | paradigm 별 ceiling (Legacy ~53~55% / Modern ~60~67%) | analysis 단방향 추출률 | R1' / ≥2 PoC corroboration 의무 |

→ 두 metric 은 분모가 다르므로 외부 인용 시 동일 숫자로 비교하지 않는다.

> **analysis exit gate #0** 는 위 두 axis 와 별개 — analysis 산출물 입력 품질을 검증하는 **soft·opt-in fail-closed gate** (chain-harness 70~80% process metric 에도, §3-A 추출률에도 포함 ❌). gate #1~#5 = chain hard gate (위 chain-harness axis 의 사람 검토 지점).

## 3. stage 별 구체 % 는 각 소비자 inline (delta)

본 파일은 원칙 + 두 axis 만 정의한다. 구체적 수치 — ≥80%/≤20% (spec·impl·discovery), ≥85%/≤15% (impl gate #4), ≥70%/≤30% (test), ≥60%/≤40% (plan ADR·risk·NFR), modality 별 신뢰도 (swagger ~80% / figma ~75% / nl-md ~70~75%) — 는 각 소비자가 근거와 함께 inline 으로 유지한다.

## 인용

- ADR: ADR-009 (70~80% 한계 정량 모델) — `docs/adr/ADR-009-다이어그램-신뢰-모델.md` §2.5
- 결단: DEC-2026-05-06-v2.0-i-strict-채택
- analysis exit gate #0 근거: DEC-2026-06-06-analysis-exit-gate
- round-trip gate 안 허용 근거: DEC-2026-05-06-round-trip-부분-허용
