# plan-analysis-validator-poc06-11.md

> **목적**: release-readiness `analysis_validator_violation` carry 6 PoC (poc-06~11 planning-spec.json schema invalid) 정리
> **carry trigger**: DEC-2026-05-23-dep-graph-p1-p4 §6 차기 session carry C-analysis-validator-poc06-10-placeholder (high 우선순위)
> **session**: 33차 후보 / v8.9.0 후속 / 4원칙 ladder

---

## §1 실측 결과 (4원칙 1단계 깊은 숙지)

### 1.1 6 PoC chain progress

| PoC | Chain 진행 | 산출물 |
|---|---|---|
| poc-06 | chain 1 only | planning-spec.json |
| poc-07 | chain 1 only | planning-spec.json |
| poc-08 | chain 1 only | planning-spec.json |
| poc-09 | chain 1 only | planning-spec.json |
| poc-10 | chain 1 only | planning-spec.json |
| poc-11 | chain 2+ | planning-spec + behavior-spec + acceptance-criteria + findings-spec + traceability-matrix |

### 1.2 Violation 분류 (실측)

| PoC | Errors | 원인 |
|---|---|---|
| poc-06 (10 errors) | `acceptance_criteria_refs[0]` pattern fail × 10 use_cases | chain 1 only / placeholder 문자열 `"(carry — chain 2 진입 시 AC-EXCHANGE-001 등재)"` (정당한 의도) |
| poc-07 (3 errors) | `cross_links` additionalProperties × 3 | schema 는 `to_analysis_artifacts` only / PoC 는 `to_characterization` 등 부가 키 사용 |
| poc-08 (8 errors) | `risks_and_constraints[N].type` string vs object × 8 | schema = `items: string` / PoC = `[{id, type, severity, description}]` 객체 array |
| poc-09 (4 errors) | `risks_and_constraints[N].type` × 4 | 동일 |
| poc-10 (2 errors) | `risks_and_constraints[N].type` × 2 | 동일 |
| poc-11 (~7 errors) | `derivation_source` additionalProperties × 2 + `risks_and_constraints` array vs object + `cross_links` additionalProperties × 2 + 2 more | schema 는 strict / PoC = `source_handling`/`source_root_absolute` + risks 객체 dict + `to_characterization` 부가 키 |

### 1.3 Schema 정의 (v8.9.0 현재 / `schemas/planning-spec.schema.json`)

| Field | Schema 정의 | PoC 실제 사용 |
|---|---|---|
| `acceptance_criteria_refs[]` items | `pattern: ^AC-[A-Z0-9_-]+-[0-9]{3}$` | "(carry — chain 2 진입 시 …)" placeholder (poc-06) |
| `risks_and_constraints[]` items | `type: string` | `{id, type, severity, description}` 객체 (poc-08/09/10) OR `{critical: [], high: []}` dict (poc-11) |
| `cross_links` | `additionalProperties: false`, only `to_analysis_artifacts` | `to_characterization` 등 부가 키 (poc-07/11) |
| `derivation_source` | `additionalProperties: false`, only `type, source_artifacts` | `source_handling`, `source_root_absolute` 부가 키 (poc-11) |

### 1.4 paradigm 본질 진단

ALL 6 PoC = schema 와 deviate. 두 axis 동시 사실:

- **사실 A**: schema strict (additionalProperties:false / pattern 강제) = drift attractor 차단 의도
- **사실 B**: PoC 산출물 = 사실상 더 풍부한 정보 (severity tag / cross-link 다양 / placeholder 명시) 보존

**v8.6.0+ F-V2C2-1-02 R#4 fix** 가 이미 일부 완화 (top-level + use_cases items 에 `additionalProperties:true`) → schema 진화 path 정합.

## §2 처분 옵션 (분류 별)

### 2.1 `acceptance_criteria_refs` placeholder (poc-06 only)

| Option | 내용 | 비용 | 회귀 risk |
|---|---|---|---|
| A1 | schema 완화 — pattern anyOf `[AC-패턴, ^\\(carry`]` | additive / breaking 0 | drift attractor 가능 |
| A2 | PoC 정합 — placeholder 를 `AC-EXCHANGE-PLACEHOLDER-001` 등 패턴 정합 marker 로 변경 | poc-06 산출물 10 use_cases edit | 0 |
| **A3 (권장)** | PoC 정합 + 명시 marker pattern `AC-PLACEHOLDER-XXX-001` 등 정합 + comment 안 carry 사유 보존 | additive / 0-regression / 본질 = chain 2 진입 시 진짜 AC 로 교체 의무 명시 | 0 |

### 2.2 `risks_and_constraints` 객체 vs string (poc-08/09/10/11)

| Option | 내용 | 비용 | 회귀 risk |
|---|---|---|---|
| B1 | schema 완화 — items anyOf `[string, {id, severity, description}]` (poc-11 dict 별도 처리 필요) | schema-touch / additive / breaking 0 | drift attractor low (실 사용 모델 흡수) |
| B2 | PoC 정합 — 객체 array → string array (severity prefix 등으로 정보 보존) | 4 PoC × 평균 ~3 risks = ~12 edit | 정보 손실 risk (severity tag 분리됨) |
| **B3 (권장)** | schema 진화 — `risks_and_constraints` items polymorphic anyOf `[string, object with id+severity+description]` + poc-11 dict 형식 array 화 (격리 PoC) | schema 1 변경 + poc-11 1 PoC 정합 (dict → array) | 0 (실 사용 패턴 정식 도입) |

### 2.3 `cross_links` additionalProperties (poc-07/11)

| Option | 내용 | 비용 | 회귀 risk |
|---|---|---|---|
| C1 | schema 완화 — `additionalProperties:true` + `$comment` drift attractor warning | additive / 0 | drift attractor low |
| C2 | PoC 정합 — `to_characterization` 등 부가 키 제거 (정보 손실) | 2 PoC edit / 정보 손실 | 정보 손실 |
| **C3 (권장)** | schema 진화 — `to_characterization` + `to_phase_4_7` 등 명시 enum properties 추가 + `additionalProperties:false` 유지 (정식 흡수 / drift 차단) | schema additive / 0-regression | 0 |

### 2.4 `derivation_source` additionalProperties (poc-11)

| Option | 내용 | 비용 | 회귀 risk |
|---|---|---|---|
| D1 | schema 완화 — `additionalProperties:true` | additive / drift attractor low | drift attractor low |
| **D2 (권장)** | schema 진화 — `source_handling` + `source_root_absolute` 명시 properties 추가 (DEC-2026-05-12-in-place-read-정책-채택 정합) + `additionalProperties:false` 유지 | schema additive / 0-regression / 기존 DEC 정합 | 0 |

## §3 묶음 결단 후보 (사용자 결단 의무)

| Cluster | 추천 | 대안 |
|---|---|---|
| D1: poc-06 placeholder 처분 | **A3 (PoC 정합 marker)** | A1 schema anyOf / A2 단순 marker |
| D2: risks_and_constraints 처분 | **B3 (schema 진화 polymorphic + poc-11 정합)** | B1 schema anyOf / B2 PoC string 화 |
| D3: cross_links 처분 | **C3 (schema 명시 enum 진화)** | C1 additionalProperties true / C2 PoC 정합 |
| D4: derivation_source 처분 | **D2 (schema 명시 enum 진화)** | D1 additionalProperties true |
| D5: version bump | **v8.10.0 MINOR** (additive — schema 진화 / breaking 0 / 기존 의무 제거 0) | v8.9.1 PATCH (cosmetic 부정확) |
| D6: 시행 cadence | **단일 session 시행** (작업 surface ≤ 50 line schema + 6 PoC ≤ 30 line edit) | 분리 (poc-06 placeholder만 먼저) |

## §4 STOP-3 hard gate (시행 후 의무)

- workspace test pass 회복 (685/686 → 686/686 — xmllint env absent carry 별개)
- release-readiness `analysis_validator_violation` 0 → ready 15/16 → 16/16 (xmllint absent carry 별개)
- schema-validator 6 PoC planning-spec.json VALID
- drift-validator 3-way ✅
- version 3-way sync ✅
- skill-citation 0 stale

## §5 carry (시행 후)

- xmllint env absent (sql-inventory-validator iBATIS test #25+#26 / 별도 carry)
- operation.md work folder (commit message 인용 / 별도 carry)

## §6 4원칙 ladder 상태

| 원칙 | 상태 |
|---|---|
| 1. 깊은 숙지 → plan.md | ✅ 본 문서 |
| 2. 3-에이전트 research | 가벼움 — Senior critique 1회 dispatch 권장 (schema 진화 vs drift attractor trade-off) / official-docs + industry-case skip 정당 (schema-touch는 결정적 작업 + 기존 v8.6.0+ F-V2C2-1-02 R#4 fix 선례 정합) |
| 3. 사용자 묶음 결단 | §3 6 cluster |
| 4. 시행 | schema 1 변경 (3 properties 진화) + 4 PoC 산출물 정합 (poc-06 placeholder marker + poc-11 risks dict → array) |

---

**대안 (사용자 결단)**:
1. 추천안 묶음 전체 시행 (B3 + C3 + D2 + A3 + v8.10.0 MINOR + 단일 session)
2. 일부 옵션 변경 (cluster 별 다른 선택)
3. cooling-off / 별도 session

**핵심**: schema 진화 paradigm = v8.6.0+ F-V2C2-1-02 R#4 fix 선례 정합 / breaking 0 / 실 사용 패턴 정식 흡수 / drift attractor 차단 본질 보존.

---

## ★ ★ ★ OBSOLETE 표기 (2026-05-27 / session 49차 close)

> **상태**: ❌ obsolete / 시행 ❌ / **plan trigger 이미 해소**
> **종결 결단**: DEC-2026-05-27-codegraph-integration-scope-out 후속 carry 점검 session

### 해소 사유 (★ 2 axis 동시)

**axis 1 — release-readiness `analysis_validator_violation` carry trigger 이미 해소** (v8.6.0+ F-V2C2-1-01 fix / chain 1~4 산출물 scope 확장):

```
✅ analysis_validator_violation — analysis validator (schema + br-cross-consistency)
   violations 0 / 12 business-rules + 32 chain artifact 전수 검증
```

본 plan §1 본문 §1.2 violation 분류 (poc-06 10 errors / poc-07 3 errors / poc-08 8 errors / poc-09 4 errors / poc-10 2 errors / poc-11 ~7 errors) = 작성 시점 사실. v8.6.0+ F-V2C2-1-01 fix 로 그 이후 0 violation 도달. release-readiness 22/22 ready (2026-05-27 실측).

**axis 2 — v11.0.0 paradigm shift 미반영**:

- 본 plan 본문 = `planning-spec.json` schema 명칭 사용 (v8.x cycle 가정).
- v11.0.0 MAJOR (2026-05-26) — `planning-spec.{json,md}` → **`discovery-spec.{json,md}`** rename (10 PoC artifact + active doc cascade).
- 본 plan §1.3 schema path `schemas/planning-spec.schema.json` = stale (현 `schemas/discovery-spec.schema.json`).

### LL 자산화 후보 (선택적)

- **LL-obsolete-plan-detection**: carry plan close 시 (a) release-readiness criterion 실측 + (b) paradigm shift 후 산출물명/schema path 정합성 사전 검증 의무. plan 작성 시점 ↔ session 시행 시점 사이 paradigm 진화 시 stale 위험. (memory `feedback_self_referential_corrective_drift` 정합 / [[feedback-strict-exposes-drift]] 동형 paradigm)

### carry queue (재발동 조건)

본 plan 의 §3 cluster (B3 + C3 + D2 + A3) 는 다음 트리거 발생 시 별 plan 으로 재작성:

1. release-readiness `analysis_validator_violation` 재regression (현재 ✅ / regression 발생 시)
2. v11.0.0 discovery-spec schema strict 진화 시 PoC #06~#11 산출물 deviate 재발 견 시 (실측 의무)
3. 외부 사용자 자연 요구 (Type 2 corroboration trigger)
