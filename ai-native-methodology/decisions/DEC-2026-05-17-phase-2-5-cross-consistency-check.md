# DEC-2026-05-17-phase-2-5-cross-consistency-check

- **상태**: 승인 (★ ★ ★ 사용자 결단 4건 / 4원칙 plan+research 후 / v4.1.0 MINOR)
- **일자**: 2026-05-17 (★ session 25차 / v4.1.0 MINOR release)
- **결정자**: 윤주스 (TF Lead) — 사용자 결단 "Phase 2 ⑤ 진입" → 4결단 묶음 추천안 채택
- **관련**: DEC-2026-05-17-묶음-P-prereq-종결-phase2-5-보류 §3 (⑤ carry source + "분류 보존 강제 포함" 확정 제약) / DEC-2026-05-17-rules-schema-enforcement-strengthen (⑤ carry origin) / ADR-CHAIN-011 §5 patch v12 / LL-i-47 (echo-chamber drift 실측) / LL-i-51

---

## 컨텍스트

묶음 P 종결 (session 24차) 시 ⑤ cross_consistency_check 를 "≥7 PoC 도달 후 별도 session 재평가" 로 보류. session 25차 STATUS drift 청산 후 사용자 결단 "Phase 2 ⑤ 진입". 4원칙 적용 — plan (`plan-phase2-5-cross-consistency-check-inline.md`) + 3-에이전트 research (`research-phase2-5-cross-consistency-check.md` / Senior + official-docs + industry-case) + 사용자 결단 묶음 + 시행.

**session 24차 gate 확정 입력 (재논의 ❌)**: (a) ≥7 PoC corroboration 충족 (b) PoC #08 echo-chamber drift = 설계 근거 (c) "분류 보존 강제 포함" 확정 제약 (d) inline vs 분리 결단 + v4.1.0 MINOR.

---

## 결정

### §1. 사용자 결단 4건 (research 흡수 후)

| # | 결단 | 채택 | 근거 |
|---|---|---|---|
| #1 설계 옵션 | **정제된 옵션 C** | research 3-에이전트 수렴 — heavy 실행 데이터(score/rationale)는 layer-2-results/ 분리(SARIF·Semgrep·OPA·Spectral 산업 표준) + BR 안 slim provenance-tagged marker (Semgrep `metadata:` 패턴 정합). A=산업 anti-pattern / B=Senior 부적격 |
| #2 분류 보존 강도 | **schema if/then 강제** | 실측 both=0 → 전 PoC vacuous = 회귀 풀이 0 수학 보장 / official-docs VERIFIED 패턴 / validator-only = 양심 의존 (no-simulation 위배) |
| #3 version | **v4.1.0 MINOR** | optional 필드 + if/then = additive API surface 확장 / Senior + ADR §5 patch v4 precedent / 외부 plugin consumer schema parse |
| #4 scope | **⑤ 단독** | Senior Q5 — PoC #08/LL-i-47 단일 실측 근거 + ≥7 corroboration = clean scope / 묶음 Q 동반 시 회귀 격리 희석 + blast radius 팽창 |

(필드명 = `cross_consistency_check` / validator 이름 정합 / 사용자 이견 없음.)

### §2. 시행 (★ schema 2변경 / additive)

- **`rules.schema.json` businessRule.properties** — `cross_consistency_check` slim 객체 신설 (optional / additionalProperties:false / provenance discriminator `generated_by`·`layer`·`checked_at` + 분류보존 `intent_classification_preserved`·`classification_drift_detected`·`classification_drift_reason` + `verdict` enum 5종(classification_drift 신설) + `external_result_ref` 분리집계 join + slim `layer2_semantic_score`)
- **`rules.schema.json` businessRule.allOf** — `is_intent` ⇔ `intent_vs_bug_classification` 양방향 동치 if/then 2블록 (정방향 true⇒const "intent" / 역방향 false⇒not const "intent" / 둘 다 required = 단방향·미보유 vacuous)
- **test 신설 2** — `schema-validator/test/rules-cross-consistency.test.js` (11 functional / ★ if/then 이 모순 실제 거부 입증) + `drift-validator/test/cross-consistency-check.test.js` (6 구조 / v4.0.1 cross-schema-enum 패턴 미러)
- **drift-validator** package.json v0.4.1 → v0.4.2 / schema-validator test script +1
- **ADR-CHAIN-011 §5.9 patch v12 신설** + **§9 LL-i-51 자산화**
- **methodology-spec/deliverables/5-business-rules.md** — §4.2 v4.1.0 ⑤ cross_consistency_check 섹션 추가
- **CHANGELOG v4.1.0 entry + INDEX 등재 + plugin.json v4.0.1 → v4.1.0 + CLAUDE.md sync + STATUS.md session 25차 갱신**

### §3. ★ ★ 코드 착수 전 실측 (Senior 조건 2 + STOP-1 해소 / research §4)

- **both=0** (전 11 PoC) — `is_intent` ∧ `intent_vs_bug_classification` 동시 보유 BR 0 → if/then 전 PoC vacuous = **회귀 풀이 0 수학 보장**
- `is_intent` 단독 43 BR (#07·#08·#09·#10·#11) / `intent_vs_bug_classification` 실사용 0 (v4.0.1 신설/미채택) → "분류 보존 강제" 는 `is_intent`(실사용) + `intent_vs_bug_classification`(forward) 양쪽 커버
- verdict/llm_status consumer = unknown-value fatal 처리 부재 → enum `classification_drift` 추가 저위험 (STOP-1 advisory 해소)

---

## 회귀 검증 (★ chain harness validated 본질 보존)

- workspace test 364 → **381/381 pass** (신규 17 / 0 fail / 0 회귀)
- release-readiness **11/11 release-ready** (analysis_validator_violation = 11 PoC 전수 violations 0 = 회귀 풀이 0 실측 입증)
- ★ functional test 4·5 = if/then 이 모순 BR (is_intent=true+classification="bug" / 역방향) 실제 거부 입증 = **vacuous-everywhere 아님**
- breaking change ❌ / round-trip 영향 ❌ / chain harness 5 요소 = schema additive 영역 한정 / no-simulation trio + D21' + content-aware 비손상

---

## Lessons Learned 등재 (★ session 25차 / ADR-CHAIN-011 §9 LL-i-51)

- **LL-i-51** — "양심 의존 → schema enforcement 결정화 paradigm" — PoC #08 echo-chamber drift 실측(LL-i-47)이 schema if/then 으로 코드 enforcement 격상. 단 실측(both=0) 선행 = vacuous-everywhere 회피 + functional test(모순 거부 입증) 동반 의무. memory `feedback_no_simulation_realized` + `feedback_drift_enforcement_via_release_readiness` 정합. inline vs 분리 단일 정답 ❌ → 정제된 공존(heavy 분리 + slim provenance inline) = ADR-008 이중 렌더링 사상의 cross-consistency 영역 확장.

---

## 출처

- Senior critique (`_base-senior-engineer` Task tool / 2026-05-17 session 25차) — CONCUR + 조건 2 + STOP-1 advisory
- official-docs cross-check (`_base-official-docs-checker`) — JSON Schema if/then VERIFIED / SARIF 분리 표준 VERIFIED
- industry-case research (`_base-industry-case-researcher`) — SARIF·Semgrep·OPA·Spectral 분리 우세 / intent-vs-bug 강제 보존 precedent 부재 = novelty
- 본 결단 plan = `.claude/plans/plan-phase2-5-cross-consistency-check-inline.md` / research = `.claude/research/research-phase2-5-cross-consistency-check.md`
