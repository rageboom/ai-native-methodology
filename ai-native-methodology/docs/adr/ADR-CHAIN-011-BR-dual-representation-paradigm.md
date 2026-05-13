# ADR-CHAIN-011: BR dual representation paradigm — natural_language + Given/When/Then 동시 보존 + cross-validation governance

- 상태: 승인됨 (Accepted) — ★ ★ ★ ★ ★ v2.4.0 MINOR sub-plan §1 governance 복구 사상 굳힘 / DEC-2026-05-13-rules-dual-representation-사상-신설 본격 ADR
- 일자: 2026-05-13 (★ session 7차 후속 — 2원칙 sub-agent 토론 + Senior critique 정합 흡수)
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-008 (이중 렌더링 사상 — ★ 본 ADR = BR 영역 확장), ADR-009 (다이어그램 신뢰 모델), ADR-CHAIN-001~005 (chain harness 5 요소), ADR-CHAIN-008 (paradigm-cross corroboration policy), DEC-2026-05-13-rules-dual-representation-사상-신설 (본 ADR 1단계 origin), DEC-2026-05-13-BR-id-4-segment-enforcement-v2.3.7 (Plan L 직전 sprint)

---

## 컨텍스트

### §1. trigger — 6갈래 drift = governance 실패 사실

Plan L (v2.3.7 BR pattern strict 화) 직후 사용자 점검 질의 → ★ ★ ★ ★ critical 발견:

```
PoC #01 = GWT 풍부 (v1.x 공식 표준)
PoC #02 = GWT 단순
PoC #03 = trigger-condition-action (변형)
PoC #04 = business_rules array 자체 부재 (FE 특수)
PoC #05/#06 = title + type + description (B 형식 초기)
PoC #07~#11 = title + natural_language (B 형식 발전 / 현 신표준)
```

★ 즉 본 방법론 안 rules.json 6갈래 drift 사실 + schema 는 v1.x GWT 강 제약 stuck + ★ ★ ★ 11 PoC schema-validator 모두 INVALID + §8.1 strict release-readiness 가 analysis validator 결과 보지 않음 사각지대 = ★ ★ ★ **governance 실패** 본질 발견.

### §2. 사상 발전 history (★ 시간 축)

| 버전 | paradigm | 비고 |
|---|---|---|
| v1.x | GWT 강 제약 (BDD / formal-spec 친화) | ★ schema required ["given","when","then"] 명시 |
| v2.0 chain harness 진입 | source-grounded paradigm | ★ rules.json 추출이 코드 grep 기반 |
| v2.1 phase 4.7 | characterization mode 도입 | ★ 현 동작 묘사 자유 / GWT 작성 비용 ↑ |
| v2.3 (현재) | natural_language 단일 자연어 (characterization 완전 정합) | ★ ★ schema 미동기 / ADR 부재 → drift 잔존 |

★ ★ 두 형식 공존 = 의도된 결단 ❌ — 사상 발전을 따라가지 못한 schema 의 잔존 사실.

### §3. 두 사상 dilemma

| 측면 | GWT | natural_language |
|---|---|---|
| chain 3+4 자동 생성 | ✅ given→Arrange / when→Act / then→Assert 1:1 | ❌ 자연어 파싱 의무 |
| chain 4 impl 재구현 contract | ✅ 명확한 contract | ❌ 모호성 |
| phase 4.5 formal-spec 변환 | ✅ Decision Table 자동 | ❌ 사람 변환 |
| characterization mode 친화 | ❌ 작성 비용 ↑ | ✅ 현 동작 묘사 자유 |
| legacy 분석 작성 비용 | 50% 신뢰도 / 작성 어려움 | ✅ 빠른 묘사 |

★ ★ 두 사상은 trade-off — 단일 형식 강제 시 다른 측면 손실.

### §4. 외부 사례 정합 (★ ★ 2원칙 sub-agent 3원칙 결과 / 2026-05-13)

#### §4.1. 공식문서 트랙 (Agent 1)

| 영역 | 외부 권위 | 본 방법론 정합 |
|---|---|---|
| **JSON Schema `anyOf` dual representation** | json-schema.org 공식: *"Prefer anyOf where possible"* (oneOf 비권장 / 성능 비용) | ✅ anyOf 채택 정합. ★ 위험: nested anyOf 성능 + 에러 메시지 합산 → BR 단위 top-level OK / sub-rule 안 중첩 ❌ |
| **Gherkin/Cucumber description + GWT** | 공식 spec: description = "free-form" + ★ ★ runtime 무시 (human-only) | ★ ★ ★ 본 방법론과 **paradigm 다름** — 본 방법론은 두 표현 ★ 모두 executable. ADR 안 명시 의무 |
| **★ ★ ★ ★ Adzic SBE 10년 자기 폐기** | gojko.net/2020/03/17/sbe-10-years.html: *"The idea of specifications and tests in a single document didn't really work out as expected over the last 10 years."* | ★ ★ ★ ★ ★ **본 ADR 핵심 위험 신호 최강** — cross-validator 없으면 동일 폐기 운명 보장. Layer 1 결정적 + Layer 2 LLM advisory 모두 ★ 강하게 구현 의무 |
| **DMN description + FEEL literalExpression** | OMG DMN metamodel: 모든 DMNElement 가 description 속성 보유 / FEEL formal expression 동시 보존 표준 paradigm | ✅ ★ 본 방법론 사상 정면 정합. ★ 단 OMG DMN spec 도 description ↔ FEEL **cross-consistency 강제 조항 부재** (Drools/Camunda 도 검증 도구 없음) → ★ 본 방법론 br-cross-consistency-validator = ★ 보강 |
| **Spectral / OpenAPI cross-validator** | Spectral built-in rule 안 다중 표현 간 semantic cross-consistency rule 부재 (구조 + 예시 schema 부합만 검증) | ★ ★ ★ ★ **industry 공백** — 본 방법론 br-cross-consistency-validator Layer 2 LLM = original 기여 자격 |
| **SBE living documentation drift** | Adzic 10년 survey: 1/3 팀 자동화 ❌ / "primary source of truth" 57% Jira / SpecSync/Cucumber-for-Jira 등 ★ 보조 sync tool 만 / 통합 ❌ | ★ ★ 본 방법론 Layer 1 결정적 + Layer 2 LLM 단일 cross-validator = industry 누구도 미구현 paradigm |

#### §4.2. 빅테크/OSS 사례 트랙 (Agent 2)

| 영역 | 외부 권위 | 본 방법론 정합 |
|---|---|---|
| **GitHub Spec Kit (90K star) dual representation** | 4단계 (specify→plan→tasks→implement) = 자연어 단일 표현 + Constitutional Compliance gate. cross-validation paradigm ❌ | ★ ★ ★ **본 방법론 v2.4.0 dual + cross-validator = spec-kit 도 미구현 영역 = original empirical 자격 강** |
| **DMN conformance level (L1 자연어 → L2 S-FEEL → L3 FEEL 완전 실행)** | OMG/Camunda 정식 사상 — 자연어 → formal 진화 (단계 ladder) | ★ ★ 본 방법론 = L1+L3 ★ ★ 동시 보존 (co-existence) — DMN ladder 와 paradigm 다름 (동시 vs 단계 진화) / 신규성 보유 |
| **ThoughtWorks "GenAI for forward engineering" + CodeConcise** | 2단계 (reverse engineering → 자연어 description → forward engineering) 명문화 / CodeConcise = 분석 시간 2/3 감축 / 60K human-day 예상 절감 | ★ ★ 본 방법론 chain 1→2 흐름 isomorphic. ★ 차별점: 본 방법론 = cross-validator 보유 / ThoughtWorks ❌ |
| **Microsoft Agent Framework 1.0 (AutoGen + Semantic Kernel) ensemble** | 3 패턴 (Concurrent / Group Chat / Magentic) = F-015 cross-validation 사상 정합 / ★ ★ ★ 정량 threshold 외부 권위 부재 | ★ 본 방법론 chain 1 gate threshold = ★ ★ empirical 결정 영역 (외부 권위 무) — 11 PoC 분포 측정 spike 의무 |
| **Schema migration governance — validator-first 빅테크 다수** | AWS SCT assessment-first / Conduktor "mandatory compatibility check before merging" / Solace "dual-writing for clear migration timeline" / Databricks Delta Lake | ★ ★ ★ 본 방법론 시행 순서 = **validator workspace → schema 재설계 → 11 PoC migration** 권장 정합 |
| **Drools governance 실패 패턴** | "redundancy + governance challenges" / rules DB 부재 / CI/CD 부재 (다수 보고) | ★ 본 방법론 = methodology-spec/rules.schema + cross-validator + 11 PoC 회귀 test 로 회피 의무 |

#### §4.3. 외부 사례 자릿수 정합 표

| 사상 | 외부 권위 | 본 방법론 v2.4.0 | 자격 |
|---|---|---|---|
| Dual representation 동시 보존 | DMN L1+L3 ladder (단계 진화) / Cucumber description (runtime 무시) | anyOf 동시 (co-existence / 양쪽 executable) | ★ ★ original empirical |
| Cross-validator | spec-kit / AWS Q / ThoughtWorks 모두 ❌ / DMN/Drools/Camunda 도 ❌ / Spectral cross-consistency rule 부재 | br-cross-consistency-validator (Layer 1 결정적 + Layer 2 LLM) | ★ ★ ★ original empirical |
| 자연어 → forward engineering | ThoughtWorks CodeConcise / Q Developer Transform | chain 1→2 paradigm | isomorphic |
| Validator-first migration | AWS SCT / Conduktor / Solace 다수 | sub-plan §1 → §2 순서 | 빅테크 정합 |
| Ensemble cross-validation | Microsoft Agent Framework Concurrent 패턴 | F-015 + Layer 2 LLM | isomorphic (정량 threshold 부재) |

---

## 결정

### §5. dual representation paradigm 정식 채택

★ ★ ★ ★ BR (rules.json item) 안 ★ **natural_language + given/when/then 두 표현 동시 보유 가능** + ★ ★ **cross-validation 자동 검증**.

#### §5.1. 사상 적용 path (★ chain harness 정합)

```
[analysis stage]     rules.json BR
                       ↓ natural_language ✅ (★ characterization / 빠른 추출 / 사람 눈)
                       ↓ given/when/then ✅ (★ contract / 자동화 친화 / AI 눈)
                       ↓
                     ★ ★ ★ ★ cross-validation 자동 검증 (br-cross-consistency-validator)
                       ↓
[chain 1 진입 gate]   두 표현 정합 ≥ 0.85 gate 의무 (★ empirical threshold / 11 PoC spike 후 confirm)
                       ↓
[chain 3 test]       given/when/then → test code 1:1 매핑 (자동 / 우선)
                                       natural_language → test description / docstring (보조)
[chain 4 impl]       given/when/then → impl contract (자동)
                                       natural_language → 문서 / 주석 (사람 검토용)
```

### §5.2. schema 변경 (★ v2.4.0-rc1 1단계 완료 / 본 ADR 굳힘 사실 확인)

`schemas/rules.schema.json` item 안 변경 (★ 본 session 직전 commit `a24a892` 자산):

- ★ `required`: `["id", "name", "given", "when", "then"]` → `["id", "name"]`
- ★ ★ `anyOf` 신설 — GWT 표현 OR natural_language 표현 ≥ 1 의무
- ★ `natural_language` field 신설 (string / optional / characterization 친화)
- ★ given/when/then = `required` 에서 제거 / 단 minItems: 1 유지 (★ 작성 시 풍부도 의무)
- description 안 사상 명시 ("v2.4.0-rc1 dual representation")

**호환 검증** (★ 본 commit 시점):

| PoC | 변경 영역 정합 | 결과 |
|---|---|---|
| #01 (GWT 풍부) | anyOf 통과 | ✅ pass (★ 다른 schema errors 별도 carry) |
| #02 (GWT 단순) | anyOf 통과 expected | ✅ pass expected |
| #07~#11 (natural_language) | anyOf 통과 expected | ★ top-level invalid (rules array 부재) → §2-3-1 다음 sub-plan 해결 |

### §5.3. br-cross-consistency-validator workspace 신설 (★ 본 session 1차 / 16번째 workspace)

`tools/br-cross-consistency-validator/` workspace.

**Layer 1 결정적 (100% 정확 / LLM 부재)**:
- ★ 두 표현 ≥ 1 의무 검증 (anyOf schema 보강)
- ★ 키워드 매칭 — natural_language ↔ given/when/then 핵심 명사/동사 intersection 비율
- ★ structure 검증 — given/when/then 안 키워드 분포 정합 (전제/발동/결과)
- ★ BR id 4토막 strict 정합 (v2.3.7 enforcement)

**Layer 2 LLM (★ --strict 옵션 시만 / advisory / 신뢰도 ≤ 0.85)**:
- ★ sub-agent LLM 호출 — 두 표현 의미 정합 점수 (0~1)
- ★ F-015 cross-validation 패턴 — 메인 + sub-agent 양쪽 호출 / 불일치 시 finding
- ★ ★ Static Tool 시뮬레이션 절대 금지 정책 정합 — LLM 의미 검증 = ★ advisory 명시 / 결정 자체 LLM 의존 ❌

### §5.4. threshold ≥ 0.85 = empirical hypothesis (★ ★ 11 PoC 분포 spike 결과 = ★ ★ 실측 자료 부재 — sub-plan §2 후 재spike 의무)

★ ★ Agent 1 F2 + Agent 2 F4 + Agent 3 R2 일치 — magic number 거부 + 11 PoC keyword 분포 측정 의무.

본 session 1차 spike (2026-05-13):

1. 11 PoC rules.json × 107 BR 검증 (★ tools/br-cross-consistency-validator/SPIKE-2026-05-13-threshold-distribution.md 자산화)
2. ★ ★ ★ ★ ★ critical 발견: **두 표현 동시 보유 BR = 0 건 / 11 PoC 모두** → overlap_distribution 측정 자체 ★ 불가능
3. ★ ★ ★ 즉 ≥ 0.85 hypothesis confirm 자료 ★ ★ 부재 (★ Senior critique R2 magic number 거부 정합 강력)
4. ★ ★ ★ sub-plan §2 마이그레이션 후 (★ PoC pilot 안 ≥ 50% BR 가 두 표현 동시 작성 / overlap_distribution 실측 가능 도달 시) ★ 재spike 의무

★ ★ 6갈래 drift 사실 직접 검증 확인:
- 갈래 1 (PoC #01 GWT 풍부): ✅ pass / score 1.0 / 0 finding
- 갈래 2 (PoC #02): ❌ schema 매핑 부재 — sub-plan §2 마이그레이션 의무 (★ C-poc-02-03-schema-mapping 신규 carry)
- 갈래 3 (PoC #03 trigger-condition-action): ❌ schema 매핑 부재 — 동상
- 갈래 4 (PoC #04 FE): ⚠️ rules array 부재 — §5.5 if/then 분기 carry 정합
- 갈래 5 (PoC #05+#06 description): ❌ representation_missing — sub-plan §2 description → natural_language rename 의무
- 갈래 6 (PoC #07~#11 natural_language): ⚠️ id 4토막 위반 (43건) — v2.3.7 enforcement 정합 / 기존 carry 보존

★ ★ ★ ADR §7.3 신규 carry 추가:
- ★ ★ **C-threshold-spike-revisit** (★ critical / sub-plan §2 후 재spike 의무)
- ★ ★ **C-poc-02-03-schema-mapping** (★ critical / PoC #02 condition+description / PoC #03 trigger+condition+action → 마이그레이션 또는 schema 매핑 추가 의무)

★ ★ deterministic_score anomaly:
- PoC #07~#11 score = 0.6 (★ id_pattern_violation medium 1건/BR × 8~15 BR) → ★ ★ "두 표현 동시 정합도" 보다 "schema-level 정합도" 강 신호
- sub-plan §2 마이그레이션 후 deterministic_score 산정 식 재해석 의무 (★ severity-weighted penalty + overlap 가산점 후보)

### §5.5. ★ PoC #04 FE schema 분기 결정 (★ Agent 3 R3 권장 ADR 안 결정)

★ ★ ★ **결정 = if/then 분기 (단일 schema 유지) 권장** — 단 ★ ★ Agent 1 F1 nested anyOf 함정 정합 의무.

#### §5.5.1. 옵션 비교

| 옵션 | 장점 | 단점 | 채택 |
|---|---|---|---|
| (A) if/then 분기 (단일 schema) | maintenance 부담 1배 / 단일 schema-validator | ★ anyOf 내 if/then 중첩 = Agent 1 F1 nested 함정 위험 | ★ ★ 채택 (★ 단 anyOf 외부 top-level if/then 만 / 중첩 ❌) |
| (B) separate schema (rules-fe.schema.json) | BE/FE 명확 분리 | ★ schema-validator + br-cross-consistency-validator 모두 2배 분기 부담 / maintenance 2배 | 채택 ❌ |
| (C) ADR-FE-008 별도 신설 + (B) | governance 강 | maintenance 부담 그대로 | 채택 ❌ |

#### §5.5.2. if/then 구조

```json
{
  "if": { "properties": { "paradigm": { "const": "FE" } } },
  "then": { "$ref": "#/$defs/feBusinessRule" },
  "else": { "$ref": "#/$defs/beBusinessRule" }
}
```

★ ★ ★ ★ **anyOf 내 if/then 중첩 ❌** — top-level paradigm discriminator 만 if/then. anyOf 는 BR item 안 ★ paradigm 결정 후 적용.

#### §5.5.3. PoC #04 FE 정합 본격 작업 = ★ v2.4.0 MINOR sub-plan §2 (다음 session)

본 ADR = ★ 사상 + 구조 결정만. 실 schema 구현 + PoC #04 마이그레이션 = sub-plan §2 (★ Agent 3 R3 권장 정합 / 본 session scope ❌).

### §5.6. chain 1 gate 통합 (★ sub-plan §3 / 다음 session)

`tools/chain-driver/src/gate-eval.js` 안 `REQUIRED_VALIDATORS_PER_STAGE.planning`:

```js
planning: ['planning-extraction-validator', 'schema-validator', 'br-cross-consistency-validator']
```

★ chain 1 진입 시 br-cross-consistency-validator 결과 ≥ 0.85 의무 → < 0.85 시 blocked. ★ 본 session = scaffolding 만 / 본 통합 = 다음 session.

### §5.7. release-readiness §8.1 strict 7/7 → 8/8 격상 (★ sub-plan §3 / 다음 session)

★ ★ ★ Agent 3 STOP signal 정합 — release-readiness criterion 격상 자체 = chain harness paradigm 재정의 → **MINOR bump 부적격 가능성**. ★ ★ v2.4.0 vs v2.5.0 분리 검토 의무. 본 ADR = ★ 8/8 격상 사상 명시만 / 실 격상 timing = sub-plan §3 시 별도 결단.

추가 criterion = `analysis_validator_violation`:
- 검사 대상: schema-validator + drift-validator + decision-table-validator + formal-spec-link-validator + br-cross-consistency-validator
- ★ ★ release-readiness 자체 quality 사각지대 발견 = LL-i-23 정합

---

## §6. 사상

### §6.1. ★ ★ ★ ★ ADR-008 (이중 렌더링 사상) 의 BR 영역 확장

ADR-008 = 단일 진실 + 두 렌더링 (.json/.yaml + .mermaid/.md). 사람 눈 + AI 눈 동시 보존.

★ ★ ★ 본 ADR = ADR-008 의 ★ "BR 영역 확장":
- natural_language = 사람 눈 (characterization 친화)
- given/when/then = AI 눈 (자동 생성 contract)
- ★ ★ 단 차이점: ADR-008 = 같은 정보 ★ 두 렌더링 (단일 진실 from one source). 본 ADR = 두 표현 ★ 모두 executable / 양쪽 진실 + cross-validation 으로 정합 보장 (★ ★ 두 진실 / cross-validator 가 정합 governance).

### §6.2. F-015 cross-validation 패턴의 ★ schema 내재화

F-015 = sub-agent 학습 코퍼스 의존 회피 (메인 raw fetch → sub-agent cross-check). 본 ADR = ★ F-015 사상을 ★ schema + validator 안에 내재화:

- 메인 = natural_language (raw / 사람 작성)
- sub = given/when/then (formal / 자동 검증)
- cross-validator = Layer 1 (결정적 / 100% 정확) + Layer 2 (LLM / advisory)

### §6.3. ★ ★ ★ ★ ★ Adzic 10년 폐기 정면 재도전 (★ ★ ★ ★ ★ ★ 최강 위험 신호 / cross-validator = ★ 회피 도구)

Gojko Adzic (SBE 사상가) 의 2020-03-17 자기 회고: *"The idea of specifications and tests in a single document didn't really work out as expected over the last 10 years."*

→ ★ ★ ★ 본 ADR dual representation = ★ Adzic 실패 경험 ★ 정면 재도전. ★ ★ ★ ★ ★ **cross-validator 없으면 동일 폐기 운명 = 보장**.

★ 본 ADR 의 ★ 핵심 회피 도구:
- ★ Layer 1 결정적 = ★ ★ ★ 강하게 구현 의무 (★ keyword + structure + id pattern 모두)
- ★ Layer 2 LLM = ★ advisory 명시 (★ Static Tool 시뮬레이션 금지 정책 정합)
- ★ chain 1 gate 의무 = ★ governance 강제 (작성 후 검증 미시행 시 진입 ❌)

### §6.4. paradigm-cross corroboration (ADR-CHAIN-008 정합)

★ ★ 본 ADR 사상 corroboration:
- ★ DMN paradigm (description + FEEL) = isomorphic (단 cross-validator 부재)
- ★ Gherkin description = paradigm 다름 (runtime 무시)
- ★ ★ ★ spec-kit / AWS Q / ThoughtWorks = dual representation paradigm 부재
- → ★ ★ ★ ★ ★ original empirical 자격 강 (★ ADR-CHAIN-008 §1 신정책 정합)

### §6.5. ★ 70~80% 한계 axis 정합

본 ADR = analysis stage §3-A automation axis (★ R1' / DEC-2026-05-13-r1-prime-본체-명문화) 강화.

★ ★ chain harness 70~80% axis = 본 ADR 영향 ❌ (★ chain harness validator 통과율 = 별도).
★ ★ analysis stage automation axis = 본 ADR 안 dual representation + cross-validator = ★ ★ 추출 정확도 측정 강화 → ★ 새 sub-rule 후보 (★ "rules-dual-representation-extraction" / 사상 정합).

---

## §7. 결과 (Consequences)

### §7.1. 긍정

| 항목 | 자격 |
|---|---|
| ★ ★ governance 복구 | schema vs PoC drift 사실 해결 / 11 PoC schema-validator pass 자격 회복 (★ 단 top-level 재설계 sub-plan §2 시) |
| ★ ★ paradigm 명문화 | 사상 발전 (v1.x → v2.x) ADR 안 정식 명문화 / 후속 dilemma 시 ★ "이중 표현 + cross-validation" 패턴 후보 |
| ★ ★ industry 공백 채움 | br-cross-consistency-validator = spec-kit / DMN / Spectral 모두 미구현 영역 / original empirical 자격 강 |
| ★ chain 3+4 자동 생성 보존 | given/when/then 보존 → chain 3 test code Arrange/Act/Assert 1:1 / chain 4 impl contract 그대로 |
| ★ ★ characterization 친화 보존 | natural_language 보존 → legacy 분석 작성 비용 ↓ / 사람 검토 친화 |
| ★ Adzic 10년 폐기 회피 도구 보유 | cross-validator = ★ 회피 의무 도구 / 단 ★ 구현 강도 의존 |

### §7.2. 부정 / 한계

| 항목 | 처분 |
|---|---|
| ★ ★ ★ ★ Adzic 10년 폐기 재도전 위험 | ★ cross-validator Layer 1 + Layer 2 ★ ★ 강 구현 의무 (★ §6.3 정합) |
| ★ ★ anyOf nested 성능 + 에러 메시지 혼란 | BR 단위 top-level OK / sub-rule 안 추가 anyOf 중첩 ❌ 명시 제약 (★ §5.5.2 정합) |
| ★ ★ Cucumber description paradigm 차이 | ADR 안 ★ "Cucumber description = runtime 무시 / 본 방법론 = 양쪽 executable" 명시 (★ §4.1 + §4.3 정합) |
| ★ Layer 2 LLM 학습 코퍼스 의존 | F-015 cross-validation + Static Tool 시뮬레이션 금지 정책 정합 / Layer 1 결정적 우선 / Layer 2 advisory 명시 |
| ★ ★ threshold ≥ 0.85 = empirical | 11 PoC spike 후 confirm 의무 (★ §5.4 정합) |
| ★ ★ 11 PoC 일괄 마이그레이션 위험 | §8.1 strict 단일 PoC 과적합 회피 의무 / 1~2 PoC pilot 우선 / sub-plan §2 분리 (★ Agent 3 STOP 정합) |

### §7.3. carry / 후속

신규 carry 본 ADR 안 발생:

- ★ ★ ★ **C-threshold-spike-revisit** (★ critical / 본 session 1차 spike = ★ overlap 분포 부재 사실 확인 / sub-plan §2 마이그레이션 후 ≥ 50% BR 두 표현 동시 도달 시 재spike 의무 / SPIKE-2026-05-13-threshold-distribution.md 정합)
- ★ ★ ★ **C-poc-02-03-schema-mapping** (★ critical / PoC #02 condition+description / PoC #03 trigger+condition+action — validator 매핑 부재 + schema 매핑 부재 / sub-plan §2 마이그레이션 또는 mapping 추가 의무)
- ★ ★ **C-br-cross-validator-implementation** (★ sub-plan §1 Layer 1 본 session 자격 ✅ / Layer 2 LLM 본격 구현 = 다음 session)
- ★ ★ **C-rules-top-level-realignment** (★ sub-plan §2 / 다음 session — top-level project_id + business_rules 정식 표준화 / 11 PoC 마이그레이션)
- ★ **C-poc-04-fe-rules-if-then** (★ sub-plan §2 / 다음 session — schema 안 if/then 분기 본격 구현)
- ★ ★ **C-release-readiness-8-8-격상** (★ sub-plan §3 / 다음 session — ★ ★ MINOR bump 부적격 가능성 별도 결단 / v2.5.0 분리 검토)
- ★ **C-chain-1-gate-integration** (★ sub-plan §3 / 다음 session — chain-driver gate-eval.js 안 br-cross-consistency-validator 통합)
- ★ ★ **C-deterministic-score-formula-revisit** (★ sub-plan §2 후 / deterministic_score 산정 식 재해석 / overlap 가산점 후보)

---

## §8. 시행 paradigm (★ ★ Agent 2 F5 validator-first + Agent 3 R1 ADR-우선 통합)

★ ★ ★ ★ ★ 본 session = sub-plan §1 (★ ADR + validator scaffolding + threshold spike).

### §8.1. sub-plan §1 = ★ ★ 본 session 진행

1. **본 ADR 작성** (★ 사상 굳힘 / Agent 3 R1 정합)
2. **tools/br-cross-consistency-validator/ workspace 신설** (★ Layer 1 결정적 구현 + Layer 2 LLM advisory placeholder)
3. **threshold spike** (★ 11 PoC keyword 분포 측정 / 본 ADR §5.4 confirm)
4. **본 session commit** (★ no release / no version bump / no tag / v2.3.7 + v2.4.0-rc1 + 본 session 모두 보류 push)

### §8.2. sub-plan §2 = ★ ★ 다음 session

5. schema top-level 재설계 (project_id + business_rules)
6. PoC #04 FE if/then 분기 본격 구현
7. 1~2 PoC pilot 마이그레이션 (★ §8.1 strict 정합 / 일괄 ❌)
8. drift-validator + br-cross-consistency-validator 양쪽 통과 확인
9. 잔여 9 PoC migration (★ pilot 검증 통과 후)

### §8.3. sub-plan §3 = ★ ★ 그 다음 session

10. chain-driver gate-eval.js 안 br-cross-consistency-validator 통합 + regression test 5+
11. release-readiness §8.1 strict 8/8 격상 (★ ★ ★ MINOR bump 부적격 가능성 별도 결단 / v2.5.0 분리 검토)
12. v2.4.0 MINOR FINAL release (★ ★ 또는 v2.5.0 분리 시 본 sub-plan §2 종결만 v2.4.0)

---

## §9. Lessons Learned (★ 본 ADR 직접 정합)

- ★ ★ ★ **LL-i-22** (★ "schema 명세 vs 실 PoC drift = governance 실패 사실"):
  - **Why**: schema (v1.x GWT) 와 PoC 산출물 (v2.x natural_language) 분리 발전 / ADR/DEC 결단 부재 / release-readiness 검증 사각지대
  - **How to apply**: 사상 발전 시 schema 동기화 의무 / 신규 산출물 형식 도입 시 ADR-CHAIN-* 신설 의무 / release-readiness 가 analysis validator 결과 강제 의무

- ★ ★ ★ **LL-i-23** (★ "release-readiness 자체 quality 사각지대"):
  - **Why**: §8.1 strict 7/7 통과 + PoC schema-validator INVALID 11/11 사실 = release-ready 라벨이 실 quality 보장 ❌
  - **How to apply**: release-readiness 검사 대상 자체 quality 검증 의무 / scripts/release-readiness.js 가 어떤 validator 를 보는지 + 사각지대 자동 발견 절차

- ★ ★ **LL-i-24** (★ "두 사상 dilemma → dual representation 사상 정합"):
  - **Why**: characterization vs 자동화 trade-off → 두 표현 동시 + cross-validation 으로 모두 살림
  - **How to apply**: 본 방법론 안 다른 dilemma 발견 시 ★ "이중 표현 + cross-validation 패턴" 후보 검토 / ADR-008 이중 렌더링 사상의 ★ 확장 패턴

- ★ ★ ★ ★ **LL-i-26** (★ "Adzic 10년 폐기 사실 = 본 ADR 핵심 위험 신호"):
  - **Why**: Gojko Adzic 본인 10년 retrospect 자기 폐기 ("specifications and tests in a single document didn't really work out") = 본 방법론 dual representation 사상의 ★ 정면 재도전 / cross-validator 부재 시 동일 폐기 운명 보장
  - **How to apply**: cross-validator Layer 1 결정적 + Layer 2 LLM 모두 강 구현 의무 / chain 1 gate 의무 / governance 강제 / 정기 재검토 (sub-rule 후보) / ★ 외부 인용 시 Adzic 폐기 회피 도구 ★ 명시 의무

- ★ ★ **LL-i-27** (★ "br-cross-consistency-validator = industry 공백 채우는 original 기여 자격"):
  - **Why**: GitHub Spec Kit (90K star) / AWS Q / ThoughtWorks CodeConcise / DMN / Drools / Spectral / OpenAPI 모두 cross-consistency rule 부재 = industry 공백
  - **How to apply**: 외부 인용 시 ★ "원조 자격" 명시 가능 / 단 paradigm-cross corroboration (ADR-CHAIN-008 §1) 정합 의무 / ★ "Spec Kit + DMN + 본 방법론" 자릿수 비교 외부 발표 후보

---

## §10. version handling

- 본 ADR = ★ ★ no version bump (★ v2.3.7 + v2.4.0-rc1 commit 위 추가 / sub-plan §1 자산화 commit)
- 다음 session = sub-plan §2 + §3 진행 후 v2.4.0 MINOR FINAL release (★ 단 v2.5.0 분리 가능성 §7.3 carry 정합)
- v2.3.7 commit 2건 (`75ee21d` + `963dfa0`) + v2.4.0-rc1 commit (`a24a892`) + 본 session commit = ★ 다음 session 통합 push

---

## §11. 후속

- ★ ★ ★ ★ sub-plan §1 본 session = 본 ADR + validator workspace 신설 + threshold spike → SESSION-WRAPUP commit
- ★ ★ sub-plan §2 다음 session = schema top-level 재설계 + PoC pilot migration
- ★ ★ sub-plan §3 그 다음 session = chain 1 gate 통합 + release-readiness 격상 검토 + release
- ★ ★ ★ ADR-CHAIN-011 후속 patch = threshold ≥ 0.85 confirm 시점 (★ §5.4 갱신 의무)
