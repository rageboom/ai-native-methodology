# Severity Cross-Stage Mapping (★ ★ ★ 단일 SSOT)

> ★ ★ ★ 본 문서 = severity / priority 등급의 **stage 간 정합 매핑 단일 source-of-truth**.
> 묶음 Q ④ (DEC-2026-05-17-rules-schema-enforcement-strengthen §3 ④ / DEC-2026-05-17-severity-cross-stage-mapping).
> ⑥ `intent-classification.schema.json` SSOT 패턴 정합 — 등급 체계가 stage 마다 다르므로 공유 enum($ref) ❌ / **매핑표 SSOT** 채택.

---

## §1. 문제

stage 마다 등급 체계가 다름 (실측):

| stage | 산출물 | 등급 체계 | 종수 |
|---|---|---|---|
| analysis | `rules.json` businessRule.severity | `critical / high / medium / low / info` | **5** |
| analysis (회귀 정책) | ADR-010 baseline+ratchet | `critical / high / medium / low` | **4** |
| chain 2 | `acceptance-criteria.json` severity (MoSCoW) | `must / should / nice` | **3** |

현 상태 — acceptance-criteria.severity 는 `planning-spec.business_intent + LLM` 추론 (75%) 으로만 도출 / rules.json BR severity 와 ★ 직접 정합 매핑 부재. ratchet 4종 ↔ rules 5종 (`info` 차이) 도 암묵. → cross-stage drift 잠재.

---

## §2. ★ ★ ★ 정합 매핑표 (★ 단일 SSOT / 변경 = 본 문서에서만)

| `rules.json` severity (5) | ADR-010 ratchet 정책 (4) | MoSCoW (`acceptance-criteria`) (3) | 근거 |
|---|---|---|---|
| **critical** | **critical** — 즉시 차단 / baseline 등재 ❌ / production blocker | **must** | production blocker = AC 반드시 충족 의무 |
| **high** | **high** — 신규 차단 / baseline grandfathered | **must** | ADR-010 신규 차단 = AC 필수 충족 수준 (critical+high 모두 must = 차단 정책 일관) |
| **medium** | **medium** — 신규 차단 / baseline grandfathered | **should** | 권장 — 신규 차단이나 우선순위 must 미만 |
| **low** | **low** — 신규 경고만 / baseline grandfathered | **nice** | 선택 — 경고 수준 |
| **info** | (해당 없음 — 결함 ❌ / ratchet 비대상) | **nice** | 정보성 BR — AC 생성 시 최저 우선순위 |

★ 비대칭 처리 명시:
- `info` (rules 5종 고유) = ratchet 등급 **부재** (결함이 아니므로 baseline/ratchet 대상 ❌). MoSCoW 는 3종 안에서 `nice` 로 흡수 (`none` 미채택 — 매핑표가 5종 모두 MoSCoW 값 보유 = 단순·완전 / 사용자 결단).
- ratchet 4종 = rules 5종에서 `info` 제외 = ★ 1:1 (이름 동일 / 의미 동일 / ADR-010 정합).

---

## §3. 사용 (★ stage 별 소비 규약)

- **chain 2 (acceptance-criteria 도출)** — `acceptance-criteria.severity` 는 LLM 추론(75%) 시 ★ 본 매핑표를 **anchor** 의무. 원천 BR 의 `rules.json severity` 가 있으면 본 표의 MoSCoW 값을 default 로 채택 / LLM 은 business_intent 근거 ±1 단계 조정만 허용 (drift 정량 추적 가능).
- **ratchet enforcement (ADR-010)** — `rules.json severity` ↔ ratchet 등급 = 본 표 1:1 (`info` = 비대상). static-security / finding severity 격상 시 본 표 정합 의무.
- **traceability-matrix** — UC→BHV→AC 링크 시 severity 일관성 검증은 본 표 기준 (cross-stage severity drift = yellow/red 후보).

---

## §4. SSOT 선언 + cross-ref

- ★ 본 문서 = severity cross-stage 정합의 **단일 SSOT**. 등급 매핑 변경 시 ★ 본 문서에서만 / 타 문서·schema 는 본 문서 참조 (재선언 ❌ — ⑥ SSOT 위반 회피 paradigm 정합).
- cross-ref (본 문서 가리킴):
  - `schemas/rules.schema.json` businessRule.severity `$comment`
  - `schemas/acceptance-criteria.schema.json` severity `$comment`
  - `docs/adr/ADR-010-*.md` (ratchet 정책 원천 / 본 표 4종 = ADR-010 §2 정합)
  - `methodology-spec/glossary-ko.md` (severity 항목 pointer)

---

## §5. 이력

- **2026-05-17 (session 25차 / 묶음 Q ④)** — 신설. 사용자 결단 3건 (high→must / info→nice / 신규 methodology-spec doc SSOT). additive (데이터 변경 ❌ / schema 기능 변경 ❌ / $comment cross-ref 만). ①②⑦ (alias 폐기 / BR 표현 4→2 / rename) = breaking → 별도 session+ cooling-off carry. DEC-2026-05-17-severity-cross-stage-mapping.
