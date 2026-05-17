# research — 묶음 Q ② BR 표현 4종 → 2종 단일화

> 4원칙 2단계 산출. session 26차 (2026-05-17). 가벼운 sub-agent 3-에이전트 병렬 (official-docs / industry-case / Senior) + Senior 미검증 2건 close round.
> 입력 plan = `.claude/plans/plan-q2-br-representation-4to2.md`.

## 1. official-docs-checker (json-schema.org / semver.org / 1차 출처)

| # | 검증 | 판정 | 근거 |
|---|---|---|---|
| 1 | anyOf 4→2 시 description-only BR = 전체 INVALID | **VERIFIED** | anyOf="1개 이상 통과 의무" + allOf="전부 통과 의무" → 연쇄 실패 (json-schema.org combining) |
| 2 | anyOf branch 제거 ≠ property 금지 | **VERIFIED** | additionalProperties 는 동일 subschema `properties` 선언 기준만 판단 / anyOf branch 와 무관. description property 보존해도 valid |
| 3 | "valid→invalid 입력 형식 축소" = SemVer MAJOR | **VERIFIED** | semver.org Rule 8 backward-incompatible = MAJOR 필수 → **v5.0.0 → v6.0.0** 정합 |

→ ② = description/TCA anyOf branch 만 제거하면 목적(표현 자격 박탈) 달성. property 보존은 schema-valid (D1·보정된 D2 의 공식 근거).

## 2. industry-case-researcher (산업 선례)

- **"free-text 보조 / structured 정식" = 산업 우세** — Cucumber/Gherkin anti-pattern(free-text step 지양) + DMN/FEEL(decision-table canonical + prose 보조) + OpenAPI(description=prose 보조 / schema=정식) **3 독립 표준 수렴**
- **반례 = Concordion 1건 (소수)** — NL+structured dual 유지 BUT 본 ②(NL+GWT 잔존)와 충돌 ❌ (4→2 는 dual representation 폐기가 아니라 중복·비정형 제거 = dual 강화)
- **dogfooding 즉시 hard-reject 정당** — JSON Schema "The Last Breaking Change"(외부 consumer 多에도 즉시 시행) + Docusaurus PR#7706(zero external consumer = immediate removal Meta 관행). deprecation period 의무 ❌

→ ② 방향(4→2 + description 보조강등 + 즉시 시행) = 산업 우세, 반례 비충돌. cooling-off 산업 의무 부재 (사용자 결단 영역).

## 3. Senior — 초기 review (REVISE-2) + close round (CONCERN)

### 3.1 Senior 가 직접 실행한 STOP-1 dry-run (실측 / no-simulation)

- **#06 = 유일한 description-only PoC (7/7 BR)**. 그 외 전 PoC 는 GWT 또는 NL 보유
- **poc-03 TCA-only BR = 0개** (18/18 dual GWT+NL) → D2 데이터 churn 사실상 zero
- → STOP-1 = blocking gate **통과**: post-migration 회귀면 = #06 7 BR(1 PoC) 뿐 + 모두 coverage 증가 → **회귀 아닌 개선 확정** (LL-i-53 / ① poc-04 precedent 동형)

### 3.2 D1~D6 판정

| D | Senior 판정 | 결론 |
|---|---|---|
| D1 description property 보존 | **CONCUR** — 함정 ❌. cross-validation 은 이미 description 제외(schema:162 "ONLY") / branch 제거가 loophole 폐쇄 / property=정당한 human·characterization context | branch 제거 + property optional metadata 보존 |
| D2 TCA property 7종 | 초기 (A)hard → **close round 에서 보정**: `decision-table-validator/json-sanity.js:5-11` 가 expected_result·verification_location=REQUIRED_ALWAYS / rejection_method=REQUIRED_IF_API 강제 = **load-bearing consumer** → hard-remove 시 decision-table-validator + synthesize-gwt-from-tca.mjs 깨짐 | ★ **anyOf TCA branch 만 제거 + property 6종 canonical optional 보존** (D1 동형 / null-sentinel posture / ①-일관) |
| D3 #06 7 BR 합성 | **STOP-2** — ①과 isomorphic ❌ (① = 순수 기계적 rename / ② = IFRS 회계 prose 에서 GWT+NL semantic 합성). echo-chamber risk (LL-i-47 / §8.1 ≥2 PoC). Layer 2 self-pass = vacuous corroboration | gate 의무: (a) per-BR source_grounded_evidence 필수 (b) 사람 spot-check ≥3/7 EFI-WEB source 대조 (c) Layer 2 self-pass 를 corroboration 카운트 ❌ |
| D4 version | **CONCUR** — v6.0.0 MAJOR = fact (선택 ❌ / ① v5.0.0 precedent) | v6.0.0 MAJOR |
| D5 cooling-off | **CONCUR 조건부** — ① 처럼 사용자 waive 가능 BUT D3 합성 paradigm 명시 수용이 결단 묶음 포함 조건 | 사용자 명시 의도 확인 의무 |
| D6 ② 단독 | **CONCUR** — ⑦(265 file) 별도 / ① 도 단독 | ② 단독 |

### 3.3 Senior close round 추가 사실

- **Item 1 masking = NO** (validator.js:14-21 순수 구조적 / description fallback 제거 → 코퍼스 축소 ❌, finding 으로 표면화 = LL-i-53 정합 / sub-confidence 0.93)
- **Item 2 = YES load-bearing** (위 D2 보정 근거)
- **잔여 모호성 (코드 착수 전 해소 의무)**: TCA property 가 rules.json(businessRule) 의 것과 decision-table 산출물의 것이 같은 데이터인지 — D2 보정안(branch only 제거, property 보존)을 택하면 **이 모호성 자체가 무효화**됨 (property 미삭제 = decision-table-validator 무손상). Senior 갱신 confidence 0.90
- **추가 guard test 의무**: #06 post-migration cross-consistency 코퍼스 BR count == 7 assert (합성 결함 은폐 inverse 차단)

## 4. 종합 — 사용자 결단 추천안 묶음 (D1~D6)

| D | 추천안 | 근거 3-에이전트 수렴 |
|---|---|---|
| D1 | description: anyOf branch 제거 + property optional metadata **보존** | official-docs#2 VERIFIED + Senior CONCUR + industry(OpenAPI description=보조) |
| D2 | TCA: anyOf branch **제거** + trigger/condition/action/expected_result/rejection_method/verification_location property **canonical 보존** (hard-remove ❌ / D1 동형 / null-sentinel) | Senior close round (load-bearing consumer 실측) + official-docs#2 |
| D3 | #06 7 BR 합성 = Sonnet 4.6 batch **+ source_grounded_evidence 필수 + 사람 spot-check ≥3/7 + Layer 2 self-pass corroboration 제외 + #06 corpus==7 guard test** | Senior STOP-2 + LL-i-47 + §8.1 |
| D4 | **v6.0.0 MAJOR** (fact) | official-docs#3 VERIFIED + Senior CONCUR |
| D5 | cooling-off = 사용자 명시 결단 (① 동형 waive 가능 / D3 합성 paradigm 수용 동반 조건) | industry(의무 부재) + Senior 조건부 |
| D6 | ② 단독 (⑦ 별도 carry) | Senior CONCUR + ① precedent |

## 5. 잔존 STOP / 위험

- ★ **STOP-2 (#06 합성 품질)** = ② 의 유일 실질 위험. ① 에 없던 부분. 사용자가 D3 합성 paradigm 을 명시 수용해야 D5 cooling-off waive 성립 (Senior 조건)
- STOP-1 (dry-run 회귀 판정) = Senior 실측으로 **해소** (개선 확정)
- 코드 착수 전 잔여 = 없음 (D2 보정안 채택 시 TCA target 모호성 무효화)

## 6. 다음 단계

사용자 결단 (D1~D6 추천안 묶음 + D3 합성 paradigm 명시 수용 여부 + D5 cooling-off) → 4원칙 3단계 승인 후 시행 (plan §5 절차 + guard test 추가).
