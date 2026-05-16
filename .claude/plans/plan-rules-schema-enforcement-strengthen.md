# plan-rules-schema-enforcement-strengthen.md

> ★ ★ ★ Work Principles 1원칙 (깊은 숙지 → plan.md) 적용. paradigm 안정점 (v3.6.x / v4.0 multi-agent 본격 채택 직후) 의 **enforcement criterion 강화** 묶음. additive only (③+⑤+⑥) / breaking change ❌.
>
> **session date**: 2026-05-17 (v4.0 carry 다음 sprint 진입)
> **target version**: ★ v4.0.1 PATCH (★ 사용자 결단 #4 채택)
> **타입**: schema additive + validator 갱신 + deliverable doc 갱신 + ★ research 흡수 결과 사실 부정확 housekeeping 수정 (H-1+H-2)
> **회귀 risk**: ★ 낮음 (14 PoC 모두 종결 / additive only / breaking change ❌)

---

## §0. ★ ★ ★ 사용자 결단 4건 (2026-05-17 / research 후)

| 결단 | 채택 | 결과 |
|---|---|---|
| #1 ⑤ cross_consistency_check | **carry** | ★ Phase 2 분리 / PoC 적용률 ≥ 50% (≥ 7 PoC) 도달 후 재평가 / 본 sprint 외부 |
| #2 ⑥ SSOT | **공유 $defs 신설** | ★ schemas/$defs/intent-classification.schema.json 신설 + rules.schema.json + characterization-spec.schema.json 양쪽 $ref + drift-validator cross-schema enum 정합 check 추가 |
| #3 ③ + PoC 처리 | **auto_extracted=true 한정 + PoC optional 유지** | ★ if/then schema 조건부 required (AI 자동 추출 BR 만 의무) / 사람 작성 BR optional 보존 / 14 PoC 회귀 풀이 0 |
| #4 H + ADR + 버전 | **H 함께 + ADR-CHAIN-011 patch + v4.0.1 PATCH** | ★ research CONTRADICTS 2건 (H-1 Gherkin + H-2 Maldonado) 본 sprint 안 수정 / ADR-CHAIN-011 §5 patch v4 / v4.0.1 PATCH |

### research 흡수 (★ Senior + official-docs + industry-case)

- ★ Senior REVISE → ⑤ carry 결단 / 시기상조 risk 회피
- ★ official-docs CONTRADICTS H-1 — characterization-spec.schema.json line 99 "★ Gherkin tag 표준" 표기 = 오표기 (Cucumber 표준 안 MoSCoW tag 없음) → "Cucumber 도구 관례" 명시 의무
- ★ official-docs CONTRADICTS H-2 — characterization-spec.schema.json line 129 "per Maldonado & Shihab 2015" = 인용 오류 (SATD 5 분류 = design/defect/documentation/test/requirement / `self_recognized` 분류명 논문 부재) → 본 방법론 합성 분류로 재명명
- ★ industry-case → ③ 산업 precedent 강 (Semgrep/CodeQL/SonarQube/Daikon 4/4 정합) → 결단 확신

---

## §1. 목표 (한 줄)

★ **본 방법론의 핵심 paradigm 3종 (no-simulation / cross-validation / characterization) 을 schema enforcement 로 강화** — 양심 의존 → 코드 enforcement 전환의 다음 한 걸음.

---

## §2. 진입 배경 (★ session 사용자 prompt 정합)

사용자가 `rules.json` 보완할 부분 질의 → 7가지 보완점 식별 → **묶음 1 (③+⑤+⑥ / additive only) 1순위 추천** → 사용자 "추천으로" 결단.

큰 구조 묶음 (①+②+⑦) 은 cadence 적용 / 다음 sprint carry.

---

## §3. 보완 3종 명세

### ③ source_grounded_evidence required 격상

**현재** (`schemas/rules.schema.json` 안):
```json
"source_grounded_evidence": {
  "type": ["array", "object", "string"],
  "description": "★ v2.x optional — source-grounded paradigm 증거 (PoC #05/#06 사례)."
}
```
→ **optional / 의무화 없음**

**문제** — CLAUDE.md ★★★ "AI 환각 차단이 1차 목적" / no-simulation 정책 정합 결단 → 그러나 schema 가 optional 로 두면 AI 가 누락 가능. PoC #05 의 BR-USER-DATA-001 이 `grep_hit_count: 0` 으로 보유했지만, 다른 PoC 누락 risk.

**보완 후**:
```json
"businessRule": {
  ...
  "allOf": [
    {
      "$comment": "★ ★ ★ source_grounded_evidence required if auto_extracted=true (또는 source_evidence 가 minItems≥1).",
      "if": {
        "properties": { "auto_extracted": { "const": true } }
      },
      "then": {
        "anyOf": [
          { "required": ["source_grounded_evidence"] },
          { "required": ["source_evidence"], "properties": { "source_evidence": { "minItems": 1 } } }
        ]
      }
    }
  ]
}
```

**enforcement 조건**: `auto_extracted=true` 인 BR 한정 의무 (사람 작성 BR 은 optional 보존 — 사용자 결단 #1 의제).

**검증 도구**: drift-validator (★ schema-validator 자동 흡수) — 신규 unit test 추가.

---

### ⑤ cross_consistency_check 필드 신설

**현재** — `tools/br-cross-consistency-validator/layer-2-results/` 디렉토리 안 **PoC 단위** 결과만 보존 (`poc-01-layer-2-results.json` / `poc-03-layer-2-results.json` / `poc-05-layer-2-results.json`). BR 단위 cross-validation 결과 저장처 부재.

**문제** — Layer 2 LLM (Sonnet 4.6 batch) 가 natural_language ↔ GWT semantic 정합 검증 의무인데, 검증 결과 **BR 안에 보존 안 됨** / drift-validator 가 결과 검증 불가 / 추적성 fail.

**보완 후** — BR 안 신규 객체 (optional):
```json
"cross_consistency_check": {
  "type": "object",
  "additionalProperties": false,
  "description": "★ v4.0.1 신설 — Layer 1 결정적 + Layer 2 LLM cross-validation 결과 (br-cross-consistency-validator 자동 산출). ADR-CHAIN-011 §5 정합.",
  "properties": {
    "layer1_keyword_overlap": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Layer 1 결정적 keyword overlap score (structural sanity check)."
    },
    "layer1_threshold": {
      "type": "number",
      "default": 0.85,
      "description": "DETERMINISTIC_THRESHOLD (현 0.85)."
    },
    "layer2_llm_semantic_score": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "description": "Layer 2 LLM semantic 정합 score (★ Sonnet 4.6 mandatory)."
    },
    "layer2_llm_model": {
      "type": "string",
      "description": "예: 'claude-sonnet-4-6' / 'claude-haiku-4-5-20251001'."
    },
    "layer2_llm_threshold": {
      "type": "number",
      "default": 0.80,
      "description": "LLM_DEFAULT_THRESHOLD (★ Phase D 보정 후 결단)."
    },
    "layer2_llm_verdict": {
      "type": "string",
      "enum": ["consistent", "inconsistent", "ambiguous", "skipped"],
      "description": "★ ★ Layer 2 최종 verdict. skipped = Layer 1 만 검증 시 (★ Q-C4 (a) Layer 1 AND Layer 2 양쪽 통과 paradigm 정합)."
    },
    "checked_at": {
      "type": "string",
      "format": "date-time"
    },
    "inconsistency_reason": {
      "type": "string",
      "description": "★ verdict=inconsistent 시 사유 (LLM 생성)."
    },
    "validator_version": {
      "type": "string",
      "description": "br-cross-consistency-validator 버전 (★ no-simulation 5종 물증 7 필드 — tool_version 정합)."
    }
  }
}
```

**enforcement** — validator 가 결과를 BR 안에 inline 기록. 외부 `layer-2-results/` 디렉토리는 보존 (PoC 단위 집계) + BR 단위 신설.

**사용자 결단 #2 의제**: 필드명 (`cross_consistency_check` / `consistency_check` / `validation_result` 중)

---

### ⑥ intent_vs_bug_classification enum 신설 (characterization-spec 정합)

**현재** — `rules.json` 안 `is_intent: boolean` 한 방향만. `current_state_note: "legacy source 결함"` 가 free string 으로 들어감. PoC #05 의 BR-USER-DATA-001 사례.

**문제** — Michael Feathers Characterization Testing 정합 부재. `characterization-spec.json` 의 `intent_classification` enum 4종 (`intent` / `bug` / `ambiguous` / `self_recognized` / Maldonado & Shihab 2015 SATD) 와 **부정합**.

**보완 후** — BR 안 신규 enum (optional / `is_intent` legacy alias 보존):
```json
"intent_vs_bug_classification": {
  "type": "string",
  "enum": ["intent", "bug", "ambiguous", "self_recognized"],
  "description": "★ v4.0.1 신설 — characterization-spec.intent_classification enum 정합 (Michael Feathers Characterization Testing + Maldonado & Shihab 2015 SATD). 'intent' = 비즈니스 의도 / 'bug' = legacy 결함 / 'ambiguous' = 도메인 expert carry / 'self_recognized' = SATD/KL-SATD per Maldonado & Shihab 2015. ★ is_intent boolean = legacy alias (intent_vs_bug_classification='intent' 시 is_intent=true 자동 정합 / cross-consistency 검증 의무)."
},
"current_state_note": {
  ...현재 보존...
}
```

**cross-consistency 검증 의무** — `is_intent` 와 `intent_vs_bug_classification` 둘 다 보유 시 정합 검증 (drift-validator unit test 추가).

**enforcement** — characterization-spec 와 cross-stage link 의무 (★ 사용자 결단 #3 의제 — characterization-spec.intent_classification.rule 필드가 본 BR ID 참조 시 type 정합 자동 검증 추가?).

---

## §4. 영향 범위 (전수 조사)

### 4-1. 본체 자산

| 파일 | 변경 | 영향도 |
|---|---|---|
| `schemas/rules.schema.json` | 3 필드 추가 (additive) | 中 |
| `tools/drift-validator/` | unit test 추가 (3 신규 필드) | 中 |
| `tools/br-cross-consistency-validator/` | inline 기록 paradigm 추가 (cli flag 신설 가능) | 中 |
| `methodology-spec/deliverables/04-rules.md` | 신규 필드 명세 + 예시 갱신 | 小 |
| `templates/analysis/rules.template.md` | 신규 필드 예시 추가 | 小 |
| `docs/adr/ADR-CHAIN-011-*` | patch 형식 §5 추가 또는 별도 ADR-CHAIN-013 신설 (★ 사용자 결단 #5) | 小 |
| `CHANGELOG.md` | v4.0.1 PATCH 진입 | 小 |
| `decisions/INDEX.md` | DEC-2026-05-17-rules-schema-enforcement-strengthen 신규 결단 등재 | 小 |
| `decisions/STATUS.md` | 휘발성 진행 상태 갱신 (v3.6.x archive cutoff 후) | 小 |
| `CLAUDE.md` | 직전 release 요약 첫 줄 갱신 | 小 |

### 4-2. PoC 14종 (★ 모두 종결 상태)

- PoC #01 → #11 = `output/rules/rules.json` 또는 `input/rules.json` 보유 / 종결 / **archive 처리** (★ 사용자 결단 #4 — 회귀 검증에서 fail 허용 / archive 마킹)
- PoC #12 + #13 = 보류 처분 (v3.6.6 R4) / 영향 ❌

### 4-3. layer-2-results 디렉토리 (★ 현 보유 PoC 한정)

- `poc-01-layer-2-results.json` / `poc-03-layer-2-results.json` / `poc-05-layer-2-results.json` 등 = PoC 단위 집계 보존
- 본 ⑤ = BR 단위 inline 기록 신설 / 외부 디렉토리 폐기 ❌ / **공존**

---

## §5. 회귀 검증 항목 (release-readiness 9/9 또는 11/11)

| # | 항목 | 검증 도구 |
|---|---|---|
| 1 | workspace test 회귀 0 | `npm test` (★ 359/359 → 신규 unit test 추가 후 359+α/359+α) |
| 2 | schema-validator 모든 산출물 통과 (★ 14 PoC archive 마킹) | `node tools/schema-validator/src/cli.js` |
| 3 | drift-validator 3-way 검증 통과 | `node tools/drift-validator/src/cli.js` |
| 4 | br-cross-consistency-validator 회귀 0 | `node tools/br-cross-consistency-validator/src/cli.js` |
| 5 | release-readiness 9/9 strict criterion | `node scripts/release-readiness.js --target v4.0.1` |
| 6 | version-check (CLAUDE.md ↔ plugin.json sync) | `node scripts/version-check.js` |
| 7 | build-plugin 통과 | `node scripts/build-plugin.js` |

---

## §6. 사용자 결단 prompt (5~6 핵심 묶음)

### 결단 #1 — source_grounded_evidence required 범위

| 옵션 | 의미 |
|---|---|
| (a) | `auto_extracted=true` BR 한정 의무 (★ 추천 — AI 자동 추출 환각 차단 / 사람 작성 BR optional) |
| (b) | 모든 BR 의무 (★ ★ strict — 사람 작성 BR 도 source 인용 의무) |
| (c) | optional 유지 (★ 본 보완 ❌) |

### 결단 #2 — cross_consistency_check 필드명

| 옵션 | 의미 |
|---|---|
| (a) | `cross_consistency_check` (★ 추천 — semantic clarity / br-cross-consistency-validator 이름 정합) |
| (b) | `consistency_check` (짧음) |
| (c) | `validation_result` (★ 다른 validator 결과와 혼동 risk) |

### 결단 #3 — characterization-spec 정합 강제 수준

| 옵션 | 의미 |
|---|---|
| (a) | BR `intent_vs_bug_classification` enum 신설만 (★ 추천 — additive only) |
| (b) | characterization-spec.intent_classification.rule 필드가 BR ID 참조 시 type 정합 cross-link 의무 (★ 큰 결단 / 본 묶음 외) |
| (c) | rules.json schema 와 characterization-spec schema 통합 (★ ★ 큰 구조 결단 / 본 묶음 외) |

### 결단 #4 — PoC 14종 처리

| 옵션 | 의미 |
|---|---|
| (a) | 신규 필드 모두 optional / PoC 종결 산출물 회귀 ❌ (★ 추천 — additive only paradigm 정합) |
| (b) | 신규 필드 의무화 + PoC 마이그레이션 script | 
| (c) | PoC 자산 archive 마킹 + schema-validator 적용 제외 |

### 결단 #5 — ADR 신설 여부

| 옵션 | 의미 |
|---|---|
| (a) | ADR-CHAIN-011 patch 추가 (§5 patch v4) (★ 추천 — 기존 dual representation paradigm 의 enforcement 강화) |
| (b) | ADR-CHAIN-013 별도 신설 (schema enforcement 의 별도 paradigm 결단) |
| (c) | ADR 추가 ❌ / DEC-2026-05-17 결단 등재만 |

### 결단 #6 — 버전 분류

| 옵션 | 의미 |
|---|---|
| (a) | v4.0.1 PATCH (★ 추천 — additive only / breaking change ❌) |
| (b) | v4.1.0 MINOR (★ 새 paradigm enforcement axis 신설로 해석) |

---

## §7. 시행 순서 (Step-by-Step)

1. ★ **STEP 0 (현재)** — plan.md 작성 (본 문서) ✅
2. **STEP 1** — 3-에이전트 research 병렬 launch (Senior + official-docs + industry-case)
   - Senior critique: STOP signal 강도 평가 (STRONG-STOP / SOFT-STOP / REVISE / OK)
   - official-docs: DMN spec 안 source-grounded evidence 요구 / Cucumber 안 characterization 표현 / Michael Feathers Characterization Testing 정합 / Maldonado & Shihab 2015 SATD
   - industry-case: Daikon / CodeQL / SonarQube 가 source evidence 를 어떻게 required 하는지 사례
3. **STEP 2** — 사용자 결단 prompt (#1~#6 묶음)
4. **STEP 3** — schema 갱신 (`schemas/rules.schema.json`)
5. **STEP 4** — validator 갱신 (drift-validator + br-cross-consistency-validator)
6. **STEP 5** — deliverable doc + template + ADR + CHANGELOG + decisions/INDEX
7. **STEP 6** — release-readiness 9/9 회귀 검증
8. **STEP 7** — commit (★ commit message paradigm 정합)

---

## §8. Lessons Learned 흡수 (★ 4원칙 prep)

- ★ memory `feedback_session_handoff_drift` — 다른 세션 commit 인지 의무 / 새 conversation 시 git log 재실행 ✅ (본 plan 진입 시 시행)
- ★ memory `feedback_paradigm_stable_point_cadence` — 안정점 후 새 feature ≠ default / drift 회피 enforcement 우선 / 본 묶음 = enforcement 강화 ✅
- ★ memory `feedback_no_simulation_realized` — 양심 의존 → 코드 enforcement / 본 묶음 = schema 안 enforcement 1축 추가 ✅
- ★ memory `feedback_decision_cadence_24h_cooling_off` — additive only 즉시 시행 / 본 묶음 = additive only ✅
- ★ memory `feedback_lightweight_sub_agent` — Phase 4~6 가벼운 sub-agent 패턴 / 본 plan 의 research = 시간 cap + 우선순위 read 적용 ✅

---

## §9. Lessons Learned 등재 (★ 본 sprint 완료 후 추가 의무)

- (TBD — STEP 7 commit 후 plan 끝에 등재)

---

## §10. 종료 자격

- [ ] 사용자 결단 #1~#6 모두 답변
- [ ] schemas/rules.schema.json 3 필드 추가
- [ ] drift-validator + br-cross-consistency-validator unit test 추가
- [ ] deliverable doc + template + ADR + CHANGELOG + decisions/INDEX 갱신
- [ ] workspace 359+α/359+α test pass
- [ ] release-readiness 9/9 (또는 11/11) 통과
- [ ] commit message paradigm 정합 (v4.0.1 PATCH 또는 v4.1.0 MINOR)
