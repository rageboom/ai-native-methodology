# SPIKE 2026-05-13 — br-cross-consistency-validator threshold 분포 측정 (ADR-CHAIN-011 §5.4)

> 본 session 1차 spike. critical 발견 — **현 11 PoC 안 두 표현 동시 보유 BR = 0 건** = overlap 분포 측정 불가능. threshold ≥ 0.85 hypothesis 실측 confirm 보류 / sub-plan §2 마이그레이션 후 재측정 의무.

## 1. 측정 환경

- date: 2026-05-13
- 대상: 11 PoC × rules.json (PoC #01~#11)
- validator: tools/br-cross-consistency-validator v0.1.0 (Layer 1 결정적)
- 옵션: `--threshold 0.5` (keyword overlap threshold) / `--strict` 비활성 (Layer 2 LLM 본 session placeholder)
- 분포 metric: with_natural_language / with_gwt / with_both / overlap_distribution / deterministic_score / findings_by_rule

## 2. 11 PoC 결과 매트릭스

| PoC                      | total   | NL only | GWT only | both  | overlap mean | score | gate           | findings             |
| ------------------------ | ------- | ------- | -------- | ----- | ------------ | ----- | -------------- | -------------------- |
| #01 RealWorld Spring     | 13      | 0       | 13       | 0     | —            | 1.000 | pass ✅        | 0                    |
| #02 RealWorld SB3        | 14      | 0       | 0        | 0     | —            | 0.000 | fail           | 14 critical (repr)   |
| #03 RealWorld NestJS     | 18      | 0       | 0        | 0     | —            | 0.000 | fail           | 18 critical (repr)   |
| #04 React FE             | 0       | 0       | 0        | 0     | —            | 1.000 | pass (vacuous) | 0 (rules array 부재) |
| #05 sample-user-register | 2       | 0       | 0        | 0     | —            | 0.000 | fail           | 2 critical (repr)    |
| #06 EFI Exchange         | 7       | 0       | 0        | 0     | —            | 0.000 | fail           | 14 (7 repr + 7 id)   |
| #07 EFI Capital          | 15      | 15      | 0        | 0     | —            | 0.600 | fail           | 15 medium (id)       |
| #08 RW MyBatis           | 8       | 8       | 0        | 0     | —            | 0.600 | fail           | 8 medium (id)        |
| #09 RW TypeORM-rawsql    | 7       | 7       | 0        | 0     | —            | 0.600 | fail           | 7 medium (id)        |
| #10 RW JPA-QueryDSL      | 5       | 5       | 0        | 0     | —            | 0.600 | fail           | 5 medium (id)        |
| #11 EFI Billing          | 8       | 8       | 0        | 0     | —            | 0.600 | fail           | 8 medium (id)        |
| 합계                     | **107** | **43**  | **13**   | **0** | **—**        | —     | —              | 91 findings          |

**with_both = 0 / 11 PoC 모두**. 두 표현 동시 보유 BR 가 단 1건도 없음.

## 3. critical finding

### 3.1. overlap 분포 측정 자체 불가능 (ADR §5.4 threshold spike 보류)

ADR-CHAIN-011 §5.4 가설 = "11 PoC × keyword 분포 측정 → 중앙값 + 1σ 기반 threshold 산정 → ≥ 0.85 confirm".

실측 결과: **두 표현 동시 보유 BR = 0 건** → overlap_distribution 측정 자체 불가능. ≥ 0.85 hypothesis confirm 자료 부재.

→ threshold ≥ 0.85 = **현 시점 empirical 자료 ❌ / sub-plan §2 마이그레이션 (PoC pilot 2 BR 안 두 표현 동시 작성) 후 재spike 의무**.

### 3.2. 6갈래 drift 사실 직접 확인 (DEC §1.1 정합)

| 갈래                              | PoC     | 형식                                             | 검출                                                                                                                         |
| --------------------------------- | ------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 갈래 1 (GWT 풍부)                 | #01     | given + when + then array                        | ✅ pass                                                                                                                      |
| 갈래 2 (GWT 단순)                 | #02     | —                                                | ❌ representation_missing (실측 = "GWT 단순" ≠ "GWT 부재" / PoC #02 rules.json 안 BR 안 description+condition 등 별도 field) |
| 갈래 3 (trigger-condition-action) | #03     | trigger + condition + action                     | ❌ representation_missing (schema mapping 부재)                                                                              |
| 갈래 4 (FE 특수)                  | #04     | rules array 자체 부재                            | ⚠️ vacuous pass (FE 트랙 별도 schema 의무 / ADR §5.5 if/then 분기 carry)                                                     |
| 갈래 5 (title+type+description)   | #05+#06 | description field (natural_language rename 의무) | ❌ representation_missing                                                                                                    |
| 갈래 6 (title+natural_language)   | #07~#11 | natural_language field 명확                      | ⚠️ id 4토막 위반 (v2.3.7 enforcement / C-rules-BR-id-relabel-5PoC + PoC-11)                                                  |

critical → PoC #02/#03 = **사상 발전 history 미정합 / schema 도 미정합 / validator 도 매핑 ❌** 잔존 사실. sub-plan §2 다음 session 안에 trigger/condition/action 및 description 마이그레이션 의무.

### 3.3. id_pattern_violation = 43건 (v2.3.7 enforcement / 6 PoC 영향)

PoC #06+#07+#08+#09+#10+#11 모두 3토막 BR id (예: `BR-BILLING-001`). v2.3.7 commit `75ee21d` enforcement 정합 / carry 보존.

PoC #11 = 도메인 전문가 위임 (C-rules-BR-id-relabel-PoC-11 / critical).
PoC #06~#10 = C-rules-BR-id-relabel-5PoC (별도 sprint).

## 4. 결단 (ADR §5.4 patch 의무)

### 4.1. ADR-CHAIN-011 §5.4 갱신 사항

- "≥ 0.85 hypothesis = 본 session spike 결과 실측 자료 부재 / sub-plan §2 마이그레이션 후 재spike 의무" 명시 추가
- "두 표현 동시 보유 BR = 0 건 / 11 PoC × 107 BR / overlap_distribution 측정 자체 불가능" 사실 추가
- "본 spike report = SPIKE-2026-05-13-threshold-distribution.md 정합" cross-reference

### 4.2. 신규 carry (critical)

- **C-threshold-spike-revisit** (critical / sub-plan §2 마이그레이션 후 재spike 의무 / overlap_distribution 실측 confirm)
- **C-poc-02-03-schema-mapping** (critical / PoC #02 = condition+description 등 / PoC #03 = trigger+condition+action — schema 매핑 추가 또는 마이그레이션 의무 / sub-plan §2)

### 4.3. Layer 1 결정적 threshold 0.85 = overlap 부재 안 의미 다름

현 deterministic_score 산정 = severity-weighted penalty / 1 - totalPenalty/maxPenalty.

- score 0.6 = 모든 BR 안 medium finding 1개 (id_pattern_violation) — overlap 검증 자체 미실행 (두 표현 동시 부재) / score 0.6 = "id 위반 7~15건 + 두 표현 분리 = 검증 미시행" 신호

즉 deterministic_score = "두 표현 동시 + cross-validation" 정합도 보다 **schema-level 정합도** 강 (본 spike 자료 anomaly 해석).

→ sub-plan §2 마이그레이션 후 PoC 안 ≥ 50% BR 가 "두 표현 동시 보유 + overlap ≥ 0.5" 도달 시 score 재해석 의무.

## 5. 결론

| 항목                                    | 결과                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| ADR §5.4 ≥ 0.85 hypothesis 실측 confirm | 불가능 (overlap 분포 부재) — sub-plan §2 마이그레이션 후 재spike 의무            |
| 6갈래 drift 사실 직접 확인              | ✅ (PoC #02/#03 mapping 부재 신규 carry 발견)                                    |
| deterministic_score 산정 anomaly        | "두 표현 동시" 정합도 보다 "schema-level 정합도" 강 신호 / sub-plan §2 후 재해석 |
| id_pattern_violation 43건               | ✅ v2.3.7 enforcement 정합 / 기존 carry 보존                                     |
| original empirical 자격 입증            | ✅ Layer 1 결정적 동작 정합 / 6갈래 drift 모두 적절 검출                         |

**결단 sub-plan §1 종결**:

- ADR-CHAIN-011 §5.4 patch (본 spike report cross-reference + 신규 carry 명시)
- 신규 carry 2건 (C-threshold-spike-revisit + C-poc-02-03-schema-mapping)
- Layer 1 결정적 동작 정합 입증 — Adzic 10년 폐기 회피 도구 scaffolding 갖춤
- Layer 2 LLM 구현 = sub-plan §2 다음 session 본격 진입 시 / 본 session placeholder

threshold 결정 자체 = sub-plan §2 마이그레이션 후 재spike → ADR §5.4 patch v2 (session 8차+)

## 6. Sources / Cross-reference

- ADR-CHAIN-011 §5.4 (본 spike origin)
- DEC-2026-05-13-rules-dual-representation-사상-신설 §1.1 6갈래 drift
- DEC-2026-05-13-BR-id-4-segment-enforcement-v2.3.7 (id_pattern_violation 43건 정합)
- Plan N §4-2 (keyword 매칭 paradigm)
- Senior critique R2 (Agent 3 / magic number 거부 정합)
- Agent 2 F4 (Microsoft Agent Framework threshold 외부 권위 부재)
