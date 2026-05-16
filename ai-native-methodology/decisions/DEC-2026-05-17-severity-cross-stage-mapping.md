# DEC-2026-05-17-severity-cross-stage-mapping

- **상태**: 승인 (★ ★ 사용자 결단 3건 / 묶음 Q ④ / additive doc / v4.1.1 PATCH)
- **일자**: 2026-05-17 (★ session 25차 / v4.1.1 PATCH)
- **결정자**: 윤주스 (TF Lead) — 사용자 "1"(묶음 Q) → scope "④만 먼저 (additive)" → 매핑 3결단
- **관련**: DEC-2026-05-17-rules-schema-enforcement-strengthen §3 ④ (carry origin) / DEC-2026-05-17-phase-2-5-cross-consistency-check (직전 v4.1.0) / ADR-010 baseline+ratchet / 묶음 Q ①②⑦ = breaking carry

---

## 컨텍스트

묶음 P/Phase 2 ⑤ 종결 후 사용자 "1" = 묶음 Q 진입. 4항목 risk 비균등 실측 (① 2 PoC 마이그레이션 / ② poc-06 7 BR 합성 / ④ additive / ⑦ 265 file blast radius) → 사용자 결단 "④만 먼저 (additive)" / ①②⑦ = breaking → 별도 session+ cooling-off carry.

④ = stage 별 severity 등급 체계 불일치 정합 매핑 SSOT 신설. 실측 — rules.json 5종 / ADR-010 ratchet 4종 / acceptance-criteria MoSCoW 3종 / 기존 명시 매핑 부재 (acceptance-criteria.severity = LLM 75% 추론만).

---

## 결정

### §1. 사용자 결단 3건 (ADR-010 ratchet semantics 근거 매핑)

| # | 결단 | 채택 | 근거 |
|---|---|---|---|
| #1 high 행 | **high → must** | ADR-010 = high 는 신규 차단 (production 진입 블록 수준) = AC 필수 충족 / critical+high 모두 must = 차단 정책 일관 |
| #2 info 행 | **info → nice** | MoSCoW 3종 안 흡수 / 매핑표 5종 모두 MoSCoW 값 보유 = 단순·완전 (`none` 미채택) |
| #3 SSOT 위치 | **신규 methodology-spec doc** | `methodology-spec/severity-cross-stage-mapping.md` / ⑥ intent-classification SSOT 패턴 정합 (등급 stage 마다 다름 → 공유 enum $ref ❌ / 매핑표 SSOT) |

### §2. ★ 정합 매핑표 (SSOT = severity-cross-stage-mapping.md §2)

| rules.json (5) | ADR-010 ratchet (4) | MoSCoW (3) |
|---|---|---|
| critical | critical (즉시 차단/blocker) | must |
| high | high (신규 차단) | must |
| medium | medium (신규 차단/grandfathered) | should |
| low | low (신규 경고만) | nice |
| info | (비대상 — 결함 ❌) | nice |

### §3. 시행 (★ additive)

- **신설** `methodology-spec/severity-cross-stage-mapping.md` (단일 SSOT / §1~§5)
- **`schemas/rules.schema.json`** businessRule.severity `$comment` cross-ref 추가 (검증 동작 무변경)
- **`schemas/acceptance-criteria.schema.json`** severity `$comment` cross-ref 추가
- **`methodology-spec/glossary-ko.md`** severity cross-stage mapping pointer 1행
- **CHANGELOG v4.1.1 + INDEX 등재 + plugin.json 4.1.0→4.1.1 + CLAUDE.md sync + STATUS.md session 25차 ④ 추가**

### §4. 본 결단 외부 carry (★ 묶음 Q 잔여 = breaking / cooling-off)

- **① alias 4중첩 폐기** — 실측 마이그레이션 2 PoC (poc-01 `rules`→`business_rules` / poc-04 `rules_manual_authored`+`rules_auto_extracted_reference`→`business_rules`). breaking. 별도 plan + Senior critique + cooling-off.
- **② BR 표현 4→2** — TCA(poc-03 18 / GWT+NL 동시보유=제거 안전) 폐기 + description fallback 폐기 시 ★ poc-06 7 BR (desc-only / NL·GWT 부재) 합성 의무. breaking.
- **⑦ `rules.json`→`business-rules.json` rename** — "rules.json" 참조 265 file + skill + ID prefix. 最高 blast radius. breaking.

---

## 회귀 검증

- workspace test **381/381 pass** (변경 ❌ / $comment inert)
- release-readiness **11/11 release-ready** (analysis_validator_violation 11 PoC 전수 0)
- breaking change ❌ / schema 기능 변경 ❌ ($comment = ajv inert / enum·required 무변경) / 데이터 변경 ❌ / 0 회귀
- chain harness validated 본질 보존

---

## Lessons Learned

- **LL-i-52 (후보)** — 묶음(cluster) carry 진입 시 ★ risk 비균등 실측 후 분할 결단 paradigm. 4항목 일괄 추정 ❌ → grep 실측 (① 2 PoC / ② poc-06 7 BR / ④ additive / ⑦ 265 file) 로 additive 항목만 분리 즉시 진행 + breaking 항목 cooling-off. Senior Q5 atomic 원칙 + memory `feedback_decision_cadence_24h_cooling_off` 정합. (★ ADR-CHAIN-011 §9 자산화는 묶음 Q breaking 항목 종결 시 일괄 검토 / 본 PATCH = carry 표기만)

---

## 출처

- 사용자 결단 (session 25차 / "1" → "④만 먼저" → 매핑 3결단)
- ADR-010 baseline+ratchet §2 (ratchet 4종 정책 원천)
- 실측 — 11 PoC severity 분포 + acceptance-criteria.schema enum + 265 file rules.json 참조 grep
