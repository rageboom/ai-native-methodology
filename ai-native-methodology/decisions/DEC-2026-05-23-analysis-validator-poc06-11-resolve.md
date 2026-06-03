# DEC-2026-05-23-analysis-validator-poc06-11-resolve

> **일자**: 2026-05-23
> **session**: 33차 (현 session) / v8.10.0 MINOR release
> **카테고리**: methodology / planning-spec schema 진화 + 6 PoC analysis_validator carry 해소
> **상태**: 승인 ( 사용자 "추천안 묶음 전체 시행 (Senior REVISE-1 포함)" 2026-05-23 / D1~D6 6 cluster)
> **Amends**: 없음 (additive / breaking 0)
> **Resolves**: DEC-2026-05-23-dep-graph-p1-p4 §6 carry C-analysis-validator-poc06-10-placeholder (high 우선순위)
> **Cross-link**: v8.9.0 (직전 release) / v8.6.0+ F-V2C2-1-02 R#4 fix (schema 진화 선례)

---

## 1. 배경

v8.9.0 dep-graph release ceremony 의 carry — `analysis_validator_violation` red 6건 (poc-06~11 planning-spec.json schema invalid). DEC-2026-05-23-dep-graph-p1-p4 §6 명시 "본 작업 무관 기존 drift / placeholder 카리 정리 별도 session". 본 DEC = 그 carry 종결.

## 2. 실측 (4원칙 1단계)

### 2.1 6 PoC chain progress

| PoC    | Chain 진행   | 산출물                                            |
| ------ | ------------ | ------------------------------------------------- |
| poc-06 | chain 1 only | planning-spec.json                                |
| poc-07 | chain 1 only | planning-spec.json                                |
| poc-08 | chain 1 only | planning-spec.json                                |
| poc-09 | chain 1 only | planning-spec.json                                |
| poc-10 | chain 1 only | planning-spec.json                                |
| poc-11 | chain 2+     | planning-spec + behavior + AC + findings + matrix |

### 2.2 Violation 분류 (실측)

| PoC         | Errors                                                                                              | 원인                                                                                                                                |
| ----------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| poc-06 (10) | `acceptance_criteria_refs[0]` placeholder × 7 + `cross_links` additionalProperties × 3              | chain 1 only placeholder + naming variant + 5번째 `to_phase7_findings` 변종                                                         |
| poc-07 (3)  | `cross_links` additionalProperties × 3                                                              | `to_characterization` + `to_decisions` + `to_sql_inventory` 부가 키                                                                 |
| poc-08 (8)  | `risks_and_constraints[].type` object × 8                                                           | schema = `items: string` / PoC = `{id, type, severity, description}`                                                                |
| poc-09 (4)  | 동일 risks object × 4                                                                               | 동일                                                                                                                                |
| poc-10 (2)  | 동일 risks object × 2                                                                               | 동일                                                                                                                                |
| poc-11 (~7) | `derivation_source` 부가 키 × 2 + `risks_and_constraints` dict 형태 × 1 + `cross_links` 부가 키 × 4 | PoC = `source_handling` + `source_root_absolute` + risks dict + `to_characterization`/`to_sql_inventory`/`to_source`/`to_decisions` |

## 3. 결단 (사용자 묶음 결단 / Senior critique GO @ 0.87 / REVISE-1 흡수)

| #                             | 결단                                                                                                                                                                                                                                           | 채택 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| D1 (A3)                       | poc-06 placeholder marker → `AC-EXCHANGE-PLACEHOLDER-001` ~ `AC-EXCHANGE-PLACEHOLDER-007` pattern 정합 (schema 변경 ❌)                                                                                                                        | ✅   |
| D2 (B3' Senior REVISE-1 흡수) | `risks_and_constraints` items polymorphic anyOf[string, object{id, severity required, description, type?}] + $comment "string = legacy carry 한정 / 신규 = object 의무" + chain-coverage-validator `risks_string_form_warn` lane v8.11.0 carry | ✅   |
| D3 (C3' Senior 실측 보강)     | `cross_links` 5 enum 추가 (`to_characterization` + `to_sql_inventory` + `to_source` + `to_decisions` + `to_phase7_findings`) + additionalProperties:false 유지                                                                                 | ✅   |
| D4 (D2)                       | `derivation_source` 2 properties 추가 (`source_handling` + `source_root_absolute`) + DEC-2026-05-12-in-place-read 정합                                                                                                                         | ✅   |
| D5                            | v8.10.0 MINOR (additive only / breaking 0)                                                                                                                                                                                                     | ✅   |
| D6                            | 단일 session 시행 (Senior cooling-off 불요 판정 / cosmetic 4 기준 충족)                                                                                                                                                                        | ✅   |

## 4. Senior critique 합성 (4원칙 2단계)

`_base-senior-engineer` 가벼움 dispatch (Phase 4~6 cadence / 시간 cap 15분):

- **Verdict**: GO (with 1 REVISE) @ 0.87
- **D1**: CONCUR — placeholder marker = 기존 regex 자연 통과 + chain 2 진입 시 진짜 AC 교체 의무는 후속 validator 강제
- **D2**: REVISE — severity required + $comment legacy-carry warning + chain-coverage-validator `risks_string_form_warn` lane v8.11.0 carry (drift attractor risk 정량 / silent omission 차단)
- **D3**: CONCUR + 실측 보강 (4종 → 5종 / `to_phase7_findings` poc-06 5번째 변종 발견)
- **D4**: CONCUR (DEC-2026-05-12 정합)
- **Cooling-off**: 불요 (schema-touch additive only + breaking 0 + v8.6.0+ F-V2C2-1-02 R#4 선례 정합 + cosmetic 4 기준 충족)

§8.1 corroboration ✓ — 6 PoC isomorphic deviation = single-PoC overfitting 회피 충족.

## 5. 시행 (4원칙 4단계)

### 5.1 Schema 진화 (`schemas/planning-spec.schema.json`)

- `risks_and_constraints` items: `{type: string}` → `anyOf[string, object{id, severity, description, type?}]`
- `cross_links.properties`: 1개 (`to_analysis_artifacts`) → 6개 (5 신규 enum)
- `derivation_source.properties`: 2개 → 4개 (`source_handling` + `source_root_absolute` 신규)

### 5.2 PoC 정합

- `poc-06`: 7 use_cases `acceptance_criteria_refs` placeholder → `AC-EXCHANGE-PLACEHOLDER-NNN` marker (UC seq 매핑) + `cross_links` naming canonical 정합 (`to_characterization_artifacts` → `to_characterization`, `to_carry_decisions` → `to_decisions`)
- `poc-11`: `risks_and_constraints` dict → array of 14 objects (severity 보존 / id+type+description 정합)

### 5.3 자산 갱신

- `plugin.json` 8.9.0 → 8.10.0 / `package.json` 8.9.0 → 8.10.0 (3-way sync)
- `CHANGELOG.md` v8.10.0 entry
- `CLAUDE.md` "plugin.json v8.10.0" sync + 현재 release 본문 갱신
- 본 DEC + INDEX 최상단 + STATUS session 33차 entry

## 6. STOP-3 hard gate 실측

| Gate                                             | 결과                                                                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| schema-validator 6 PoC                           | **6/6 VALID** ✅ (10+3+8+4+2+7 errors → 0)                                                                                  |
| release-readiness `analysis_validator_violation` | red → ✅ (v8.9.0 carry 종결)                                                                                                |
| version 3-way sync                               | plugin.json 8.10.0 / package.json 8.10.0 / CHANGELOG v8.10.0 ✅                                                             |
| breaking                                         | 0 = MINOR (additive — schema 3 properties 진화 + PoC naming 정합 / 기존 의무 제거 0)                                        |
| Senior REVISE-1 흡수                             | severity required + $comment legacy-carry warning + chain-coverage-validator `risks_string_form_warn` lane v8.11.0 carry ✅ |

## 7. Lessons Learned 신규

- **LL-validator-01** — schema 진화 paradigm = PoC 실측 흡수 vs drift attractor 차단 본질 양립 = additionalProperties:false 유지 + 명시 enum 정식 흡수 = 본 release 입증 (v8.6.0+ F-V2C2-1-02 R#4 선례 정합)
- **LL-validator-02** — Senior critique 실 grep 실측 = plan 의 4종 enum 권고 → 5종 실측 보강 = lightweight 2-에이전트 research 가 GO+REVISE+실측 정정 본격 입증 (v8.5.0 LL-v85-05 동형)
- **LL-validator-03** — polymorphic items (anyOf) paradigm = legacy carry + 신규 object form 양립 + chain-coverage-validator forward lane (v8.11.0 carry) = drift attractor 결정적 차단 + silent omission 회피 본격 입증 (DO-178C bidirectional traceability 차용)

## 8. 차기 session carry

| carry                         | 우선순위 | 비고                                                                                                                                                                                 |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C-risks-string-form-warn-v811 | medium   | chain-coverage-validator `risks_string_form_warn` lane 신설 (Senior REVISE-1) / risks string form = legacy carry 한정 명시 enforcement / 신규 PoC = object form 권장 / v8.11.0 carry |
| C-xmllint-env-absent          | medium   | sql-inventory-validator iBATIS test #25+#26 (v8.9.0 carry 보존) / Linux/Mac libxml2 환경 의무                                                                                        |
| C-operation-md-work-folder    | low      | v8.9.0 carry 보존 / commit message 안 인용된 work/dep-graph/operation.md 가 git tracked 아님 / 향후 docs/ 정식 자산 흡수 후보                                                        |

---

**참고**:

- 직전 release: v8.9.0 (DEC-2026-05-23-dep-graph-p1-p4)
- v8.6.0+ F-V2C2-1-02 R#4 fix (schema 진화 선례)
- DEC-2026-05-12-in-place-read-정책-채택 (derivation_source.source_handling 정합)
- severity-cross-stage-mapping.md (risks_and_constraints.severity enum SSOT)
