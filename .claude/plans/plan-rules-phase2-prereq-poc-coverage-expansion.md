# plan-rules-phase2-prereq-poc-coverage-expansion.md

> ★ ★ ★ Phase 2 prerequisite sprint — PoC 적용률 3/14 (21%) → 7/14 (50%) 도달 / Senior REVISE 흡수 / ⑤ cross_consistency_check inline 결단 trigger 조건 충족 목표.
>
> **session date**: 2026-05-17 (★ session 23차 / v4.0.1 PATCH 직후)
> **target**: ★ no version bump / 산출물 데이터 수집 sprint
> **타입**: data collection (★ schema 변경 ❌)
> **회귀 risk**: ★ ★ 낮음 (★ 산출 = layer-2-results/poc-NN-*.json 만)

---

## §1. 목표

★ Phase 2 entry 자격의 **trigger 조건** 충족 — PoC 적용률 ≥ 50% (≥ 7 PoC) 도달.

**현 상태** — 3/14 (poc-01 + poc-03 + poc-05) / **+4 PoC 의무**.

---

## §2. 사용자 결단 4건 (★ 본 sprint 진입 전)

| # | 결단 | 채택 |
|---|---|---|
| #1 PoC 선택 | **PoC #02 + #04 + #08 + #10** | corroboration axis 4종 (Modern BE Spring Boot 3 / FE React FSD / MyBatis 3 / JPA QueryDSL) |
| #2 Layer 2 model | **Sonnet 4.6 + Haiku 4.5 retrospect 2회** | Phase D self-eval-bias-retrospect carry 흡수 (★ session 15차 paradigm) |
| #3 PoC #11 cleanup | **별도 sprint 분리** | BR ID 4토막 strict 위반 7건 / 본 sprint 외부 |
| #4 commit cadence | **PoC 마다 1 commit** | fail-fast / memory `feedback_stage_4_mini_poc_assets` 정합 |

---

## §3. paradigm 인지 (★ ★ session 12차 patch v6 정합)

### §3.1. Layer 2 LLM 호출 paradigm

- **호출 주체** = main agent (Opus 4.7 = 본인)
- **호출 도구** = ★ ★ Claude Code Task tool (Agent tool) — ★ Anthropic API SDK ❌
- **호출 model** = subagent_type="general-purpose" / model="sonnet" or "haiku"
- **batch paradigm** = 1회 Task tool 호출 안 전체 BR list 입력 + 단일 JSON 결과

### §3.2. Haiku 4.5 blind retrospect paradigm (★ session 15차 정합)

- **시행 단계**: Sonnet 4.6 결과 ★ 입력 부재 (★ bias 회피 의무 / blind)
- **목적**: self-eval bias 정량 측정 + 신뢰도 자료 확보 + drift detection corroboration
- **결과 schema**: `$schema_version: "v2.5.0-phase-d-self-eval-bias-retrospect"` / model: "claude-haiku-4-5"

### §3.3. 결과 schema (★ 양쪽 model 동일)

```json
{
  "$schema_version": "v2.5.0-phase-c" | "v2.5.0-phase-d-self-eval-bias-retrospect",
  "model": "claude-sonnet-4-6" | "claude-haiku-4-5",
  "invoked_at": "<ISO 8601>",
  "batch_size": <int>,
  "poc_id": "<poc-NN-name>",
  "results": [
    { "br_id": "...", "semantic_score": 0..1, "rationale": "...", "confidence": 0..0.85 }
  ]
}
```

---

## §4. 4 PoC 정량 (★ ★ batch paradigm 의 batch_size 사전 인지)

| PoC | rules.json path | top-level | BR count | corroboration axis |
|---|---|---|---|---|
| **#02** Spring Boot 3 Hexagonal | `examples/poc-02-realworld-springboot3/output/rules/rules.json` | `business_rules` (★ v2.4.0 표준) | **14** | Modern BE (Spring Boot 3) |
| **#04** React FSD (full) | `examples/poc-04-full-realworld-react/analysis/6-quality/rules.json` | `rules_manual_authored` (★ FE 트랙 alias) | **3** | FE (paradigm=FE / rules_manual_authored axis) |
| **#08** MyBatis 3 (OSS) | `examples/poc-08-realworld-mybatis/input/rules.json` | `business_rules` | **8** | Modern ORM (MyBatis 3) |
| **#10** JPA QueryDSL (OSS) | `examples/poc-10-realworld-jpa-querydsl/input/rules.json` | `business_rules` | **5** | Modern ORM (JPA QueryDSL) |

**총합** = 30 BR × 2 model (Sonnet + Haiku) = 60 BR evaluation.

### ★ ★ ★ §4-bis. critical 발견 — dual representation 부재 (★ 사전 점검)

| PoC | natural_language | given/when/then | 단방향 axis |
|---|---|---|---|
| **#02** | ★ 0 | 14 | ★ GWT only / **NL 합성 의무** |
| **#04** | ★ 0 | 3 | ★ GWT only / **NL 합성 의무** |
| **#08** | 8 | ★ 0 | ★ NL only / **GWT 합성 의무** |
| **#10** | 5 | ★ 0 | ★ NL only / **GWT 합성 의무** |

★ ★ ★ Layer 2 LLM cross-validation = NL ↔ GWT semantic 정합 / dual representation 양쪽 보유 의무. 단방향 PoC = Layer 2 진입 전 ★ ★ 합성 prerequisite 의무.

### ★ ★ session 13차 paradigm 정합

- ★ Agent 1 (PoC #03 trigger-c-a → NL 합성)
- ★ Agent 3 (PoC #05 sample / GWT 부재 → GWT 합성)

본 4 PoC = ★ session 13차 isomorphic / NL 합성 (PoC #02+#04) + GWT 합성 (PoC #08+#10) 의무.

### ★ ★ ★ 본 sprint scope 재산정 (★ 사용자 결단 옵션 A)

| 단계 | dispatch 수 |
|---|---|
| NL 또는 GWT 합성 | 4 PoC × 1 = 4 dispatch |
| Sonnet 4.6 Layer 2 | 4 PoC × 1 = 4 dispatch |
| Haiku 4.5 retrospect | 4 PoC × 1 = 4 dispatch |
| **총** | **12 Task tool dispatch** |

원안 (8) → ★ 12 (1.5배).

### ★ schema breaking change ❌ 검증

- v2.4.0 anyOf dual representation paradigm 정합 / additive
- rules.json 마이그레이션 = ★ NL 또는 GWT 필드 추가만 / 기존 표현 보존
- schema-validator 회귀 0

---

## §5. 시행 순서 (★ ★ PoC 마다 fail-fast / 1 commit / Work Principles 4원칙 정합)

### Step 1 — PoC #02 (Modern BE)

1. Task tool dispatch (Sonnet 4.6 / batch / 14 BR) → `poc-02-layer-2-results.json`
2. Task tool dispatch (Haiku 4.5 / blind retrospect / 14 BR) → `poc-02-layer-2-haiku-retrospect.json`
3. drift detection 분석 (★ < 0.7 BR)
4. commit (★ "phase 2 prereq — PoC #02 layer-2 적용 (Sonnet 4.6 + Haiku 4.5 retrospect)")

### Step 2 — PoC #04 (FE 트랙 / ★ rules_manual_authored 특수)

- ★ ★ paradigm-FE discriminator (★ ADR-CHAIN-011 §5.5)
- ★ rules_manual_authored alias 안 BR 3건
- Sonnet 4.6 + Haiku 4.5 retrospect

### Step 3 — PoC #08 (MyBatis 3 OSS / Modern ORM)

- 8 BR / Sonnet 4.6 + Haiku 4.5

### Step 4 — PoC #10 (JPA QueryDSL OSS / Modern ORM)

- 5 BR / Sonnet 4.6 + Haiku 4.5

### Step 5 — Phase 2 entry 자격 입증

1. layer-2-results/ 디렉토리 안 7 PoC 보유 입증 (3 기존 + 4 신규)
2. DEC-2026-05-17-phase-2-prereq-poc-coverage-expansion 신설
3. INDEX 등재
4. CHANGELOG v4.0.2 PATCH? 또는 carry-only (★ 본 sprint 결단 #6 carry)
5. commit + push

---

## §6. 결과 분석 paradigm

### §6.1 per-PoC mean delta (Sonnet vs Haiku)

★ session 15차 Phase D 정합 — PoC 별 mean delta 부호 양방향 = self-eval bias 단방향 ❌ 입증.

### §6.2 drift detection (★ < 0.7 BR)

- single-model drift = model strictness 차이 영역
- both-model drift = ★ semantic_inversion 본격 확정 (★ Phase D 정합)
- 본 sprint 안 drift BR 검출 시 = DEC 안 명시 + rules.json DRIFT 격상 carry

### §6.3 release-readiness 9th criterion (layer_2_consistency)

- per-PoC mean ≥ 0.7 + critical/high drift 0 = pass
- 신규 4 PoC 모두 criterion 통과 의무 / 미통과 시 sprint fail / revert

---

## §7. 회귀 검증

- workspace test 회귀 0 (★ data 신설만 / 코드 변경 ❌)
- release-readiness 9/9 → ★ 11/11 통과 유지 (★ 9th criterion `layer_2_consistency` per-PoC mean ≥ 0.7 / 본 sprint 안 4 PoC 추가)
- schema-validator 회귀 0

---

## §8. Lessons Learned (★ ★ ★ ★ session 23차 STOP signal 흡수 / 본 sprint 안 본격 자산화)

### ★ ★ ★ LL-phase2-prereq-01 — pre-pre-prerequisite 사각지대 사실 본격 발견

**사실**: Phase 2 entry trigger 조건 충족 sprint 진입 시 ★ 4 PoC 모두 schema invalid 사실 + dual representation 부재 사실 동시 발견. ★ ★ ★ sprint = pre-pre-prerequisite (schema cleanup) + pre-prerequisite (NL/GWT 합성) + 본격 Phase 2 prereq (Layer 2 LLM) = ★ ★ ★ 3 sprint 합쳐진 매우 큰 sprint 가 됨.

**근거**: schema-validator 실행 결과 — PoC #02 (98 errors / name 부재) + PoC #04+#08+#10 모두 invalid.

**Why**: ★ ★ release-readiness §8.1 strict 안 `analysis_validator_violation` criterion = PoC #01+#05 만 검증 / 나머지 12 PoC 사각지대 (★ ADR-CHAIN-011 §5.7 carry 정합). 본 사각지대 = ★ pre-pre-prerequisite 노출 source.

**How to apply**: ★ Phase 2 prereq sprint 진입 전 의무 prerequisite = **schema-validator 4 PoC 통과 + NL/GWT dual representation 보유 + Layer 2 LLM 호환성 확인**. plan.md 작성 단계의 ★ ★ ★ "사실 점검 grep" 의무 강화.

### ★ ★ ★ LL-phase2-prereq-02 — Senior REVISE 흡수 paradigm 본격 입증 (★ ★ STRONG-STOP 단계 시)

**사실**: 본 sprint = Senior REVISE 흡수 (★ ⑤ inline 시기상조) 후 진입 → 진입 후 ★ ★ STRONG-STOP 단계 (4 PoC schema invalid) 발견 → 사용자 결단 옵션 A (STOP + revert + 3 sprint 분할) 채택.

**Why**: ★ ★ memory `feedback_senior_stop_signal_absorption` 정합 — "사실 명확도 ★★★ + 비용 ▲ 양쪽 본격 시 전면 흡수 의무". 본 case = 4/4 schema invalid 사실 (★★★★) + 보정 비용 (★★★) = ★ ★ ★ ★ STRONG-STOP signal 본격 입증.

**How to apply**: ★ 매 sprint 진입 후 ★ pre-pre-prerequisite 노출 시 = revert + cadence 정합 sprint 분할 paradigm. cooling-off ❌ 모드 + "without stopping" 모드 안에서도 STRONG-STOP signal 발견 시 결단 prompt 의무 사실 정합.

### ★ ★ LL-phase2-prereq-03 — sub-agent NL 합성 paradigm 본격 입증 (★ session 13차 Agent 1 isomorphic)

**사실**: PoC #02 14 BR GWT → NL 합성 1 Task tool dispatch (Sonnet 4.6 / batch / ~17초) 본격 동작. session 13차 PoC #03 Agent 1 NL 합성 paradigm isomorphic. 합성 결과 자체 = ★ ★ 의도 본질 + 자연어 압축 + 비즈니스 관점 정합 (★ ★ implementation 디테일 회피 본격 정합).

**Why**: ★ ★ ★ NL 합성 paradigm = ★ Phase D self-eval-bias-retrospect 의 prerequisite. ★ session 13차 5 sub-agent dispatch corroboration paradigm 본격 자산화.

**How to apply**: ★ 다음 sprint 진입 시 NL/GWT 합성 paradigm = ★ Phase 2 prereq 의 sub-step 의무. 합성 결과 = ★ poc-NN-nl-synthesis.json / poc-NN-gwt-synthesis.json 자산.

---

## §9. 종료 자격

- [ ] PoC #02 + #04 + #08 + #10 모두 Sonnet 4.6 결과 산출
- [ ] PoC #02 + #04 + #08 + #10 모두 Haiku 4.5 retrospect 산출
- [ ] drift detection 결과 분석 (★ < 0.7 BR carry)
- [ ] DEC-2026-05-17-phase-2-prereq-poc-coverage-expansion 신설
- [ ] INDEX 등재
- [ ] release-readiness 11/11 통과 유지
- [ ] workspace test 364/364 보존
- [ ] commit 4건 (PoC 마다) + Phase 2 entry 자격 입증 commit + push

---

## §10. 본 sprint 외부 carry

- **PoC #05 Haiku retrospect carry** — 현 PoC #05 = Sonnet 4.6 보유 / Haiku 4.5 retrospect 부재 / Phase D self-eval-bias-retrospect 자격 완성 carry
- **PoC #11 cleanup** — BR ID 4토막 strict 위반 7건 마이그레이션 / 별도 sprint
- **Phase 2 본격 진입** — ⑤ cross_consistency_check inline schema 신설 / 본 prereq sprint 종결 후 별도 sprint

## §11. ★ ★ ★ ★ ★ 3 sprint 분할 carry plan (★ session 23차 STOP 흡수 / 사용자 결단 옵션 A)

### Sprint 1 — schema cleanup (★ ★ ★ ★ pre-pre-prerequisite)

**목표**: PoC #02 + #04 + #08 + #10 (+ 가능 시 PoC #06 + #07 + #09 + #11) **모두 schema-validator 통과 의무**.

**시행 단계**:
1. 각 PoC schema-validator 실행 → invalid 사실 정량 (★ name/title 부재 / BR ID pattern 위반 / 등)
2. BR 마다 ★ name 또는 title 필드 추가 (기존 GWT 또는 NL 보유 사실 보존 / 의미 변경 ❌)
3. PoC #11 BR ID 4토막 strict 위반 7건 마이그레이션 (★ v2.3.7 enforcement 정합 / 별도 sprint 분리 가능)
4. release-readiness §8.1 strict `analysis_validator_violation` criterion 격상 → ★ ★ PoC #01+#05 한정 → 전체 PoC 검증 (★ ADR-CHAIN-011 §5.7 carry 흡수)

**target version**: v4.0.2 PATCH 또는 v4.1.0 MINOR (★ release-readiness criterion 격상 시 MINOR 후보)

### Sprint 2 — NL/GWT dual representation 합성 (★ ★ pre-prerequisite)

**목표**: Sprint 1 종결 후 / 4 PoC × NL 또는 GWT 합성 → dual representation 양쪽 보유.

**시행 단계**:
1. PoC #02 + #04 (GWT only) → NL 합성 sub-agent dispatch (Sonnet 4.6 / batch / ★ session 13차 isomorphic)
2. PoC #08 + #10 (NL only) → GWT 합성 sub-agent dispatch (Sonnet 4.6 / batch / ★ session 13차 Agent 3 isomorphic)
3. 합성 결과 → rules.json 마이그레이션 (★ NL 또는 GWT 필드 추가 / additive only)
4. layer-2-results/poc-NN-{nl,gwt}-synthesis.json 자산화

**target version**: ★ no version bump (data collection only)

### Sprint 3 — Phase 2 prereq 본격 (★ Layer 2 LLM)

**목표**: Sprint 2 종결 후 / 4 PoC × Sonnet 4.6 Layer 2 + Haiku 4.5 retrospect = 8 Task tool dispatch.

**시행 단계**:
1. PoC #02 + #04 + #08 + #10 마다 Sonnet 4.6 Layer 2 batch
2. PoC #02 + #04 + #08 + #10 마다 Haiku 4.5 blind retrospect batch
3. ★ PoC #05 Haiku retrospect 동시 carry 흡수 가능
4. layer-2-results/poc-NN-layer-2-{results,haiku-retrospect}.json 자산화
5. ★ Phase 2 entry 자격 입증 — PoC 적용률 7/14 (또는 8/14 with PoC #05) 도달

**target version**: ★ no version bump (data collection only) / Phase 2 본격 진입 자격 입증 후 별도 sprint

### Phase 2 본격 (★ 3 sprint 종결 후)

- **⑤ cross_consistency_check inline schema 신설** — additive schema 변경 / breaking change ❌
- target version: v4.1.0 MINOR 또는 v4.0.2 PATCH
