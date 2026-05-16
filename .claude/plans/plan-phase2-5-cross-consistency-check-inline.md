# plan-phase2-5-cross-consistency-check-inline.md

> ★ ★ ★ Phase 2 본격 — ⑤ `cross_consistency_check` BR 단위 기록 paradigm 결단 + schema 신설.
> Work Principles 4원칙 적용 (1단계 plan → 2단계 3-에이전트 research → 3단계 사용자 결단 → 4단계 시행).
>
> **session**: 2026-05-17 (★ session 25차 / 묶음 P 종결 직후)
> **target version**: v4.1.0 MINOR 후보 (★ §9 사용자 결단)
> **타입**: schema 신설 + validator 갱신 (★ additive 우선 / breaking change 회피 의무)
> **회귀 risk**: 中 (★ rules.schema.json SSOT 변경 / 14 PoC 회귀 풀이 0 의무)

---

## §0. 확정 입력 (★ ★ session 24차 gate / DEC-2026-05-17-묶음-P §3 / 재논의 ❌)

| # | 확정 사실 | 출처 |
|---|---|---|
| (a) | ≥7 PoC Layer 2 corroboration 충족 (poc-01/02/03/04/05/08/10) — 재평가 trigger 충족 | DEC §1 / layer-2-results/ 실측 |
| (b) | **PoC #08 echo-chamber drift = 설계 근거** — Sprint 2 GWT 합성(Sonnet)이 `is_likely_bug=true` 무시 → PASSWD-006 보안버그 + ORDQRY-005 N+1 정상규칙 정규화 / 동일모델 Layer 2 미검출 / Haiku blind 검출 | DEC §2 / LL-i-47 |
| (c) | **"분류 보존 강제 포함" 확정 제약** — ⑤ cross_consistency_check 는 `intent_vs_bug_classification` 보존을 ★ 검증 항목으로 명시 의무 + schema §6 강화 동반 | DEC §3 #2 (★ 사용자 확정 / 재논의 ❌) |
| (d) | inline(CodeQL 패턴) vs 분리(Spec-Kit 패턴) 결단 + v4.1.0 MINOR bump = 본 session 결단 의제 | DEC §3 #1·#3 |

---

## §1. 현 상태 정밀 (★ 사실 점검 grep 완료)

- **분리 paradigm 이미 존재** — `tools/br-cross-consistency-validator/layer-2-results/poc-NN-layer-2-results.json` (PoC 단위 집계 / Sonnet) + `poc-NN-layer-2-haiku-retrospect.json` (Haiku blind). 7 PoC 보유.
- **BR 단위 저장처 부재** — Layer 2 LLM 결과가 BR 안에 보존 ❌ / drift-validator 가 BR 단위 검증 불가 / 추적성 단절.
- **schema 현황** — `rules.schema.json` businessRule.properties 안 `intent_vs_bug_classification`($ref SSOT, ⑥ 신설) + `is_intent`(legacy alias) 존재. `cross_consistency_check` 필드 ❌.
- **validator 현황** — `br-cross-consistency-validator/src/` = cli.js + deterministic.js(Layer 1) + llm.js(Layer 2) + validator.js. 결과를 layer-2-results/ 에 PoC 단위 산출 / BR inline 기록 path ❌.
- **`intent_vs_bug_classification`** = `./intent-classification.schema.json` $ref (enum 4종: intent/bug/ambiguous/self_recognized). characterization-spec.scenario.intent_classification 와 cross-stage 정합 의무.

---

## §2. 설계 쟁점 — inline vs 분리 (★ ★ 단일 정답 ❌ / research 의제)

| | inline (CodeQL 패턴) | 분리 (Spec-Kit 패턴) |
|---|---|---|
| 정의 | cross-validation 결과를 BR 객체 안 `cross_consistency_check` 필드에 기록 | 결과를 별도 `layer-2-results/` 디렉토리에 PoC 단위 보존 (현 상태) |
| 장점 | BR 단위 추적성 / drift-validator BR 검증 가능 / 산출물 이식성(rules.json 자체) | rules.json = pure 비즈니스 의도 SSOT 보존 / data collection 회귀 격리 |
| 단점 | rules.json 비대화 + machine-generated 필드 혼입 (SSOT 오염 risk / Senior REVISE 우려점) | BR↔결과 join 부재 / cross-ref 단절 / 추적성 fail |
| 산업 precedent | CodeQL SARIF (result 안 rule reference inline) | Spec-Kit specs/ (spec ↔ validation 분리) |

**후보 설계 옵션 (★ research 후 확정 — research.md §5)**:
- **옵션 A** — inline only (실행 데이터까지 BR dump) → ★ 산업 anti-pattern (SARIF·Semgrep·OPA·Spectral 전부 분리 / OpenSpec #666 역사례) → **비추천**
- **옵션 B** — 분리 only → ★ Senior 부적격 (BR 추적성 단절 + drift-validator BR 검증 불가 / F-021 위배)
- **★ 정제된 옵션 C (확정 후보)** — heavy 실행 데이터(score·rationale·timestamp)는 layer-2-results/ 분리 보존(산업 표준) + BR 안 `cross_consistency_check` = **slim provenance-tagged marker** (classification 보존 verdict + provenance discriminator + 외부 결과 ref). 근거 = rule object 의 "서술적 속성" inline = 표준(Semgrep `metadata:`) / "실행 결과 dump" inline 만 anti-pattern. official-docs if/then VERIFIED + both=0 vacuous 무회귀.

---

## §3. "분류 보존 강제 포함" 구현 spec (★ ★ ★ (c) 확정 제약 / 재논의 ❌)

PoC #08 drift 본질 = NL↔GWT 합성 시 `intent_vs_bug_classification`(또는 `is_intent`) 가 **유실/뒤집힘** → bug 가 정상규칙으로 정규화. ⑤ 는 이를 ★ 검증 항목으로 명시 의무.

**구현 = `cross_consistency_check` 안 분류 보존 검증 sub-field 신설**:
- `intent_classification_preserved`: boolean — NL 표현과 GWT 표현 양쪽에서 `intent_vs_bug_classification`(/`is_intent`) 가 의미 동일 보존되었는지 (Layer 2 LLM 검증 산출).
- `classification_drift_detected`: boolean — bug→intent 정규화 등 분류 drift 검출 시 true.
- `classification_drift_reason`: string — drift 시 사유 (예: "GWT synthesis dropped is_likely_bug=true → normalized as business rule").
- verdict 값에 `classification_drift` 추가 검토 (enum: consistent / inconsistent / ambiguous / classification_drift / skipped).
- **schema §6 강화 동반** — `intent_vs_bug_classification` ↔ `is_intent` cross-consistency 를 schema if/then 으로 강제 (둘 다 보유 시 `is_intent=true ⇔ classification='intent'`). 현 description-only 명시 → schema enforcement 격상.

---

## §4. schema 변경 범위 (★ additive 우선)

1. **`rules.schema.json` businessRule.properties** — `cross_consistency_check` object 신설 (optional / additionalProperties:false). 원천 plan §⑤ 초안 + §3 분류 보존 sub-field 통합.
2. **`rules.schema.json` businessRule.allOf** — `is_intent` ⇔ `intent_vs_bug_classification` cross-consistency if/then 블록 신설 (§6 강화 / additive — 둘 다 보유 시만 발동 / 단방향 보유 = vacuous).
3. **breaking change ❌ 검증** — `cross_consistency_check` = optional / 14 PoC 모두 본 필드 부재 = valid 보존 / `is_intent`⇔classification if/then = 둘 다 보유 BR 만 발동 (현 14 PoC 회귀 풀이 0 grep 검증 의무).

---

## §5. validator 변경 범위

- **`br-cross-consistency-validator`** — Layer 2 결과를 BR 안 `cross_consistency_check` 에 inline 기록하는 path 신설 (옵션 C 채택 시 / cli flag `--inline` 검토). 외부 layer-2-results/ 산출 보존.
- **`drift-validator`** — 신규 unit test: (1) `cross_consistency_check` schema 정합 (2) `is_intent`⇔classification if/then 검증 (3) intent_classification_preserved sub-field 존재 시 분류 보존 검증.
- **`br-cross-consistency-validator`** — 신규 unit test: inline 기록 결과 schema 정합 + 분류 보존 검출 로직.
- ★ no-simulation 의무 — Layer 2 = 실 Claude Code Task tool 호출 (Sonnet 4.6) / 시뮬레이션 ❌.

---

## §6. 회귀 검증 계획 (★ chain harness validated 본질 보존)

| # | 검증 | 명령 / 결과 |
|---|---|---|
| **0** | ★ Senior 조건 2 — `is_intent`∧`intent_vs_bug_classification` 동시 보유 BR | ★ **실측 완료 = both=0 (전 11 PoC)** → if/then vacuous = 회귀 풀이 0 수학 보장 / `is_intent` 단독 43 / `intent_vs_bug_classification` 실사용 0 |
| 1 | 11 PoC rules.json schema valid 보존 | `node tools/schema-validator/...` 전수 |
| 2 | workspace test 364/364 + 신규 test | `npm test` |
| 3 | release-readiness 11/11 보존 | `node scripts/release-readiness.js --target v4.1.0` |
| 4 | drift-validator 회귀 0 | workspace test 안 |
| 5 | br-cross-consistency-validator 회귀 0 | workspace test 안 |
| 6 | chain harness 5 요소 본질 보존 | no-simulation trio + D21' + content-aware 비손상 확인 |

실패 시 → 4원칙 4단계: revert + Lessons Learned 기록 + 1원칙 재시작.

---

## §7. 4원칙 2단계 — 3-에이전트 research 의제 (★ 가벼운 sub-agent 전략 / Phase 4~6 / 시간 cap)

| 에이전트 | 의제 |
|---|---|
| **_base-senior-engineer** | inline vs 분리 vs 공존 trade-off / rules.json SSOT 오염 risk (REVISE 우려점 재검토) / "분류 보존 강제" schema if/then 설계 검토 / v4.1.0 MINOR 적격성 / STOP signal 검토 |
| **_base-official-docs-checker** | JSON Schema if/then cross-field 패턴 정합 + CodeQL SARIF result↔rule reference 구조 + Spec-Kit specs/ 분리 구조 사실 cross-check (training-corpus 의존 회피 / F-015) |
| **_base-industry-case-researcher** | CodeQL inline vs Spec-Kit 분리 실제 운영 사례 / machine-generated 필드를 spec 안 inline 한 OSS 사례 / 분류 보존(intent vs bug) 검증을 schema/validator 로 강제한 precedent |

산출 = `.claude/research/research-phase2-5-cross-consistency-check.md`.

---

## §8. 사용자 결단 항목 (★ 4원칙 3단계 / 묶음 — research 후 prompt)

1. **설계 옵션** — A(inline only) / B(분리 only) / C(공존, 추천)
2. **필드명** — `cross_consistency_check`(추천 / validator 이름 정합) / `consistency_check` / `validation_result`
3. **분류 보존 검증 강도** — schema if/then 강제(권장) / validator-only 검증 / 양쪽
4. **version** — v4.1.0 MINOR(추천 / API surface 신설) / v4.0.2 PATCH
5. **묶음 Q 동반 여부** — ⑤ 단독 / ⑤ + 묶음 Q 일부(① alias / ② BR 표현 단일화 등) 묶음 (★ Senior research 권고 반영)

---

## §9. 종료 자격

- [ ] `cross_consistency_check` schema 신설 + `is_intent`⇔classification if/then 신설
- [ ] br-cross-consistency-validator inline 기록 path (옵션 C 채택 시)
- [ ] drift-validator + br-cross-consistency-validator 신규 unit test
- [ ] 14 PoC schema valid 보존 (회귀 풀이 0)
- [ ] workspace test 전수 pass + release-readiness 11/11
- [ ] ADR-CHAIN-011 §5.9 patch v12 신설 + DEC-2026-05-17(또는 -18)-phase-2-5-cross-consistency-check 신설 + INDEX 등재
- [ ] CHANGELOG v4.1.0 entry + plugin.json bump + CLAUDE.md sync + STATUS.md 갱신
- [ ] commit + push

---

## §10. Lessons Learned (★ 시행 중 본격 자산화 / placeholder)

- LL-i-NN (TBD) — "분류 보존 강제" = PoC #08 echo-chamber drift 실측(LL-i-47)이 schema enforcement 로 결정화되는 paradigm. 양심 의존 → 코드 enforcement 의 다음 한 걸음 (memory `feedback_no_simulation_realized` 정합).
- LL-i-NN+1 (TBD) — inline vs 분리 단일 정답 ❌ → 공존 paradigm = ADR-008 이중 렌더링 사상의 cross-consistency 영역 확장 가설 (research 후 확정).
