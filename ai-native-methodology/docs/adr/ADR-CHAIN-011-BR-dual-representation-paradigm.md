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

### §5.4. ★ ★ ★ ★ ★ ★ ★ ★ threshold ≥ 0.85 hypothesis = ★ patch v2 (★ session 9차 / 정면 폐기 + Layer 2 LLM 의무 격상 paradigm 결단)

★ ★ ★ ★ ★ ★ ★ ★ ★ **patch v2 본격 갱신 (2026-05-13 session 9차)** — ★ session 8차 SPIKE v1 (with_both=0) + ★ session 9차 SPIKE v2 (REVISE-6 재실측) + ★ 3 sub-agent (Agent 1 공식문서 + Agent 2 빅테크 + Agent 3 Senior critique) 일치 corroboration 으로 ★ ★ ★ ★ ★ ★ **≥ 0.85 hypothesis 정면 폐기 + Layer 2 LLM 의무 격상 paradigm 결단**.

#### §5.4.1. ★ ★ session 8차 SPIKE v1 결과 (★ 보존)

1. 11 PoC rules.json × 107 BR 검증 (★ `SPIKE-2026-05-13-threshold-distribution.md` 자산화)
2. ★ ★ ★ ★ critical 발견: **두 표현 동시 보유 BR = 0 건 / 11 PoC 모두** → overlap_distribution 측정 자체 ★ 불가능
3. ★ ★ ★ ≥ 0.85 hypothesis confirm 자료 ★ 부재
4. ★ 6갈래 drift 사실 직접 검증:
   - 갈래 1 (PoC #01 GWT 풍부) / 갈래 2 (PoC #02) / 갈래 3 (PoC #03 trigger-condition-action) / 갈래 4 (PoC #04 FE) / 갈래 5 (PoC #05+#06 description) / 갈래 6 (PoC #07~#11 natural_language)

#### §5.4.2. ★ ★ session 9차 SPIKE v1 재측정 결과 (★ description alias 적용 후)

★ deterministic.js 안 description → natural_language alias 적용 (★ v2.4.0 sub-plan §3 자산) 후 ★ 재측정:

| PoC | total | both | nl_only | gwt_only | overlap max | overlap mean |
|---|---|---|---|---|---|---|
| #01 RealWorld Spring | 13 | **13** | 0 | 0 | **0.462** | **0.201** |
| #02~#11 (10 PoC) | 84 | 0 | 64 | 14 | — | — |

★ ★ ★ ★ ★ PoC #01 = ★ ★ with_both 13/13 (★ description alias 작동) → ★ ★ ★ overlap 분포 실측 가능 도달.

#### §5.4.3. ★ ★ ★ ★ ★ ★ ★ 결정적 사실 — PoC #01 13 BR overlap 분포 (★ session 9차)

```
n=13 / min=0.000 p10=0.077 p25=0.083 p50=0.162 p75=0.300 p90=0.381 max=0.462 / mean=0.201 / stddev=0.134

≥0.85: 0/13 (0%)   ★ ★ ★ ★ ★ ★ ★ ★ ★ hypothesis DEAD (empirical 정면 부정)
≥0.7:  0/13 (0%)
≥0.5:  0/13 (0%)   ★ keywordThreshold 현 0.5 도 0건 도달
≥0.4:  1/13 (8%)
≥0.3:  4/13 (31%)
≥0.2:  6/13 (46%)
≥0.15: 7/13 (54%)  ★ median 정합
≥0.1:  9/13 (69%)
```

★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ → **≥ 0.85 hypothesis = ★ ★ ★ ★ empirical 정면 부정 결정적 사실**.

#### §5.4.4. ★ ★ ★ ★ ★ ★ session 9차 SPIKE v2 (REVISE-6 재실측 / 가설 B 검증)

★ Agent 3 REVISE-6 가설 = *"description 안 rationale/caveat 섞임 → keyword overlap 자릿수 자체 부적합 metric / ★ 순수 BR 부분만 추출 후 ★ 재측정 시 overlap 자릿수 강 상승 가능"*.

★ `tools/br-cross-consistency-validator/scripts/spike-v2-rationale-strip.mjs` 시행 결과 자산화 (★ `SPIKE-2026-05-13-v2-rationale-strip.md`):

| 지표 | 원본 (v1) | stripped (v2) | delta |
|---|---|---|---|
| mean | 0.201 | 0.173 | ★ **-0.028 (★ 오히려 감소)** |
| p50 (median) | 0.162 | 0.105 | -0.057 |
| max | 0.462 | 0.500 | +0.038 |

★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **가설 B 정면 부정** — 13 BR 중 7건 = ★ stripping 후 ★ 감소 / 4건 = 변화 ❌ / 1건 = +0.167 상승 → ★ ★ ★ data quality 차이 ❌ 본질 / ★ ★ ★ ★ **semantic 차이 = ★ keyword overlap algorithm 자체 한계 (Jaccard short-text + 한국어 교착어 형태소 부재)**.

#### §5.4.5. ★ ★ ★ ★ ★ ★ 3 sub-agent 일치 corroboration (★ session 9차 2원칙 토론)

| 사실 | Agent 1 공식문서 | Agent 2 빅테크 | Agent 3 Senior |
|---|---|---|---|
| ≥0.85 keyword threshold = 정면 폐기 자격 | ★ ✅ Jaccard short-text + 한국어 교착어 (수학적 불가) | ★ ✅ MDPI 2025 paraphrase optimal=0.671 / range 0.334~0.867 | ★ ★ ✅ magic number 함정 |
| Layer 2 LLM 의무 격상 | ★ ✅ keyword 만 ≠ Adzic 폐기 회피 도구 | ★ ✅ semantic equivalence ≥ 0.7 권위 | ★ ★ ✅ structural sanity vs semantic gate 분리 의무 |
| industry 5 곳 cross-validation 부재 | ★ Cucumber/DMN/Spectral | ★ spec-kit/AWS Q/Conduktor/MSAF | (부수) |

★ ★ ★ ★ ★ ★ ★ ★ ★ 3 agent 일치 강 corroboration → ★ paradigm 결단 자료 ★ 결정적 확보.

#### §5.4.6. ★ ★ ★ ★ ★ ★ ★ paradigm 결단 (★ ★ ★ patch v2 본격)

★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **≥ 0.85 hypothesis 정면 폐기 + Layer 2 LLM 의무 격상 paradigm 채택**:

A. **★ ★ ★ ★ Layer 1 결정적 = "structural sanity check" 격하** (★ Adzic 폐기 회피 도구 자격 ❌):
   - 두 표현 (NL + GWT) ≥ 1 boolean 검증 (★ schema anyOf 보강 / 본 영역만)
   - BR id 4토막 strict 정합 (★ v2.3.7 enforcement)
   - structure 위치 검증 (given/when/then 키워드 분포)
   - ★ ★ keyword overlap threshold = ★ ★ "≥ 0.15 floor advisory" 격하 (★ median 정합 / Layer 1 단독 strict gate ❌)

B. **★ ★ ★ ★ ★ ★ Layer 2 LLM semantic equivalence = ★ ★ chain 1 gate 의무 + paradigm 본격 도입 시 mandatory 격상** (★ v2.5.0 의무):
   - threshold ≥ 0.7 (★ MDPI 2025 paraphrase detection commonly used 권위 정합)
   - ★ F-015 cross-validation 패턴 정합 (메인 + sub-agent 양쪽 호출 / 불일치 시 finding)
   - ★ ★ Static Tool 시뮬레이션 금지 정책 정합 (★ "AI sub-agent persona" 부여 ❌ / 외부 LLM API 직접 호출 / placeholder ❌ → mandatory)
   - 비용 측정 (★ Agent 3 R3) = chain 1 gate 마다 LLM call 1회 / 사내 EFI-WEB 1000+ BR 기준 ~$50~$200 = acceptable

C. **★ ★ ★ ★ ≥ 2 PoC corroboration carry (★ ★ Senior STOP-1 흡수)**:
   - ★ session 8차+9차 SPIKE = 단일 PoC #01 13 BR (★ §8.1 strict 위반 사실)
   - ★ ★ ★ paradigm 사상 결단 자체 = ★ 3 agent 일치 corroboration + SPIKE v1+v2 (★ n=13 표본 외 corroboration 충족) → ★ session 9차 자격 종결 가능
   - ★ ★ ★ implementation = ★ PoC #03 + PoC #05 dual representation 적용 → cross-validation 자료 ≥ 2 PoC corroboration 확보 후 v2.5.0 진행 의무

#### §5.4.7. ★ ★ ★ ★ ★ 신규 carry (★ ADR §7.3 통합)

- ★ ★ ★ ★ **C-layer-2-llm-mandatory-paradigm** (★ critical / v2.5.0 — Layer 2 LLM advisory placeholder → mandatory 격상 / ≥ 2 PoC corroboration 의무)
- ★ ★ **C-keyword-threshold-degrade** (★ medium / Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하 / ★ paradigm-aligned)
- ★ ★ **C-description-vs-nl-paradigm-define** (★ v2.5.0 paradigm 결단 / Q2 의 a/b/c 결단)
- ★ ★ ★ ★ ★ **C-poc-03-05-dual-representation** (★ ★ critical / Senior STOP-1 흡수 / ≥ 2 PoC corroboration 의무 / v2.5.0 의무)
- ★ ★ **C-threshold-spike-revisit** (★ session 8차 carry / ★ **resolved by session 9차 SPIKE v1+v2 + Layer 2 LLM 의무 paradigm 결단** / ★ implementation carry = C-layer-2-llm-mandatory-paradigm 흡수)
- ★ **C-poc-02-03-schema-mapping** (★ session 8차 carry / PoC #02 condition+description / PoC #03 trigger+condition+action — ★ ★ deterministic.js 안 alias 일부 적용 사실 확인 / 본격 마이그레이션 = v2.5.0 의무)

#### §5.4.8. ★ ★ deterministic_score anomaly 갱신 (★ session 9차 보존)

- ★ session 8차 anomaly = PoC #07~#11 score 0.6 (★ id_pattern_violation 1건/BR × 8~15 BR) → "schema-level 정합도" 강 신호
- ★ session 9차 추가 anomaly = PoC #01 score 0.577 (★ 13 BR 모두 keyword_mismatch finding / mean=0.201) → "keyword overlap < 0.5 = ★ ★ keyword overlap algorithm 자체 한계 신호"
- ★ ★ v2.5.0 = ★ Layer 2 LLM 의무 격상 후 ★ deterministic_score 산정 식 재해석 의무 (★ Layer 1 = structural sanity / Layer 2 = semantic gate 분리 점수)

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

★ ★ ★ ★ ★ **★ session 9차 갱신 — resolved + 신규 carry 통합 (★ ★ ★ ★ patch v2)**:

#### resolved by session 9차 (★ ★)

- ★ ★ ★ **C-threshold-spike-revisit** (★ session 8차 carry) → ★ ★ ★ ★ ★ **resolved** (★ session 9차 SPIKE v1+v2 + Layer 2 LLM 의무 paradigm 결단 / ★ implementation carry = ★ C-layer-2-llm-mandatory-paradigm 흡수)

#### 신규 carry (★ session 9차)

- ★ ★ ★ ★ ★ ★ ★ **C-layer-2-llm-mandatory-paradigm** (★ critical / v2.5.0 — Layer 2 LLM advisory placeholder → mandatory 격상 / ≥ 0.7 threshold / F-015 cross-validation / Static Tool 시뮬레이션 금지 정합 / ≥ 2 PoC corroboration 의무)
- ★ ★ ★ ★ ★ ★ ★ **C-poc-03-05-dual-representation** (★ ★ critical / Senior STOP-1 흡수 / ≥ 2 PoC corroboration 의무 / v2.5.0 의무)
- ★ ★ **C-keyword-threshold-degrade** (★ medium / Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하 / ★ paradigm-aligned / v2.5.0)
- ★ ★ **C-description-vs-nl-paradigm-define** (★ v2.5.0 paradigm 결단 / Q2 의 a/b/c — 3 agent 충돌 영역 / ★ description = AI 눈 vs NL = 사람 눈 vs description = metadata)

#### 보존 carry (★ session 8차 기존)

- ★ **C-poc-02-03-schema-mapping** (★ deterministic.js 안 alias 일부 적용 ✅ / 본격 마이그레이션 = v2.5.0)
- ★ **C-br-cross-validator-implementation** (★ Layer 1 ✅ / Layer 2 mandatory = v2.5.0 / ★ C-layer-2-llm-mandatory-paradigm 흡수)
- ★ ★ **C-rules-top-level-realignment** (★ session 8차 ✅ — schema top-level project_id + business_rules 정식 표준화 적용 / PoC #01+#05 마이그레이션 ✅)
- ★ **C-poc-04-fe-rules-if-then** (★ v2.5.0 또는 별도 sprint)
- ★ ★ **C-release-readiness-8-8-격상** (★ session 8차 자격 격상 ✅ / 단 ★ ★ paradigm 도입 미완 carry 명시 의무 / ★ Senior STOP-2 soft 흡수 → v2.5.0 본격 도입 시 재격상 검토)
- ★ **C-chain-1-gate-integration** (★ v2.5.0 chain-driver gate-eval.js 통합)
- ★ ★ **C-deterministic-score-formula-revisit** (★ v2.5.0 후 / deterministic_score 산정 식 재해석 + Layer 1 structural sanity vs Layer 2 semantic gate 분리 점수)

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

- ★ ★ ★ ★ **LL-i-31** (★ "schema breaking change ❌ + validator paradigm 갱신 = safe 마이그레이션 paradigm" / ★ session 10차 Phase A 시행 입증):
  - **Why**: schema anyOf 보존 (★ 11 PoC 호환) + validator 영역만 변경 + description field description 강화 = ★ ★ ★ "safe 마이그레이션" — breaking change 0 + paradigm 명세 명확 + 마이그레이션 carry 분리 가능
  - **How to apply**:
    - paradigm 재정의 시 ★ ★ schema breaking change 회피 + validator 영역만 변경 paradigm 우선 검토 의무
    - schema = backward-compat anyOf 보존 + description 강화 의무
    - 마이그레이션 = ★ 자동 script 자산화 + 사람 검토 carry 분리 의무
    - ★ ★ "Phase A scope 안 schema + validator + pilot PoC 만 / 다른 PoC = Phase B 분리" paradigm 정합

- ★ ★ **LL-i-32** (★ "description ↔ natural_language paradigm 명세 = paradigm 결단 결정적 사실" / ★ session 10차 / ADR-008 이중 렌더링 사상 확장 명세):
  - **Why**: session 10차 시행 결과 = ★ description 자체 = "BR statement + rationale + caveat 복합 자산" 사실 입증 (★ PoC #01 13 BR 실증). ★ ★ alias 인정 paradigm (★ session 9차 이전 paradigm) = ★ semantic 차이 신호 → data quality 신호 ★ 오해.
  - **How to apply**:
    - paradigm 명세 명확 의무 = ★ ★ 본 방법론 안 모든 dual representation 영역 정합
    - ADR-008 이중 렌더링 사상 확장 = ★ "단일 진실 + 두 렌더링" vs "두 표현 + cross-validation" ★ 본질 차이 명확화 의무
    - 외부 인용 시 = "Layer 1 결정적 (structural sanity) + Layer 2 LLM mandatory (semantic) + paradigm 명세 명확 (description ≠ NL)" 3 layer corroboration 의무
    - description = optional metadata 격상 / natural_language = REQUIRED for cross-validation / cross-validation 대상 = NL ↔ GWT only paradigm 명문화

- ★ ★ ★ ★ ★ ★ ★ ★ **LL-i-28** (★ ★ "keyword overlap = ★ ★ structural sanity check / Adzic 폐기 회피 도구 자격 ❌ / Layer 2 LLM 의무 격상" / ★ session 9차 SPIKE v2 + 3 agent 일치 corroboration):
  - **Why**: ★ ★ ★ session 9차 SPIKE v1 (PoC #01 13 BR mean=0.201 max=0.462 / ≥0.85 = 0/13) + SPIKE v2 (REVISE-6 rationale 제거 후 mean=0.173 mean delta -0.028 → 가설 B 정면 부정) + ★ Agent 1 F1 (Jaccard short-text + 한국어 교착어 형태소 부재) + Agent 2 F5 (MDPI 2025 paraphrase optimal=0.671 / range 0.334~0.867) + Agent 3 R5 (Layer 1 결정적 단독 = semantic gate 자격 미달) ★ ★ ★ ★ ★ ★ 일치 corroboration
  - **How to apply**:
    - ★ Layer 1 결정적 = "structural sanity check" 격하 (★ 두 표현 boolean + id 4토막 + structure 위치 / keyword threshold = ≥ 0.15 floor advisory)
    - ★ Layer 2 LLM semantic equivalence = ★ mandatory 격상 의무 (★ ≥ 0.7 threshold 정합 / F-015 cross-validation 패턴 / Static Tool 시뮬레이션 금지 정합)
    - ★ Adzic 폐기 회피 도구 = Layer 2 LLM ★ 의무 (★ Layer 1 단독 = 도구 자격 ❌)
    - ★ ★ paradigm 사상 결단 자체 = ★ session 9차 종결 자격 (★ 3 agent + SPIKE v1+v2 corroboration 충족)
    - ★ ★ implementation (Layer 2 LLM mandatory) = ★ ★ ★ ★ v2.5.0 의무 (★ ≥ 2 PoC corroboration 자료 확보 후 / ★ Senior STOP-1 흡수 carry)
    - ★ 외부 인용 시 = ★ "industry-first 임상 threshold 측정 공개" 자격 (★ ★ ★ MDPI 2025 + Cucumber/DMN/Spectral 부재 corroboration)

- ★ ★ ★ ★ **LL-i-33** (★ "trigger-condition-action 4축 → given-when-then 3축 형식 sliding paradigm = Cucumber/Fowler/ECA 3중 외부 권위 정합 / action = GWT step 분리 ❌ + metadata 보존" / ★ session 11차 Phase B 자산화):
  - **Why**: ★ Agent 1 결정적 사실 — Cucumber 공식 "When = single action only" anti-pattern + Fowler "GivenWhenThen" 안 when=behavior/trigger + ECA pattern 안 Condition=precondition=Given 3중 정합. ★ ★ action = ★ "시스템 동작 (e.g. @IsNotEmpty 검증)" = ★ Gherkin GWT 외부 보존 자산 (rejection_method + verification_location metadata) 영역. ★ Agent 3 STOP-1 흡수 (자동 NL 합성 ❌ / 형식 sliding only) + Agent 2 결정적 사실 ("4축 → GWT deterministic 합성 도구 = 빅테크/OSS 공개 자료 0건") corroboration.
  - **How to apply**:
    - ★ TCA paradigm BR → GWT 합성 시 = ★ "trigger→When / condition→Given / expected_result→Then 3축 형식 sliding + action = metadata 보존" 의무
    - ★ ★ LLM 부재 시 = 형식 sliding only 의무 (★ semantic 합성 ❌ / NL = TODO marker carry / Phase C LLM 본격 합성 의무 carry)
    - ★ ★ action 별도 GWT step 분리 ❌ (★ Cucumber anti-pattern 정합)
    - ★ 외부 인용 시 = "Cucumber + Fowler + ECA 3중 외부 권위 정합 / 4축 → GWT deterministic 합성 도구 industry-first 자격" 명시

- ★ ★ ★ ★ **LL-i-34** (★ "Layer 1 keyword threshold 자체 제거 paradigm = 'non-empty + overlap > 0' sanity check only / Layer 2 LLM mandatory Phase C 의무" / ★ session 11차 Phase B Q-B3 (b) 결단 시행):
  - **Why**: ★ ★ session 9차 SPIKE v2 결정적 사실 (Jaccard short-text + 한국어 교착어 형태소 부재 = ≥ 0.85 수학적 도달 불가) + Agent 3 STOP-3 (magic number 0.15 자산화 회피) + Agent 1 외부 권위 (MDPI 2025 "no single generalizable cut-off" / range 0.334~0.867) 3중 정합. ★ session 9차 paradigm "Layer 1 격하" 의 ★ 본격 시행 = ★ threshold 자체 제거 (★ session 9차 "≥ 0.15 floor advisory" → session 11차 "★ ★ threshold 비교 자체 ❌").
  - **How to apply**:
    - ★ ★ ★ Layer 1 = ★ "structural sanity check" 격하 (★ 키워드 비교 자체 = 진위 ❌)
    - ★ ★ Layer 2 LLM = mandatory 격상 (★ ★ semantic 정합 검증 영역)
    - ★ threshold magic number 자산화 회피 의무
    - ★ overlap = 0 시 = `structural_sanity_only` advisory finding (★ severity = low) / overlap > 0 시 = finding ❌
    - ★ 외부 인용 시 = "Layer 1 = sanity check / Layer 2 = semantic / threshold magic number ❌" paradigm 명시 의무

- ★ ★ ★ **LL-i-35** (★ "industry-first 자격 scope 정정 / 'dual representation' ≠ industry-first (Cucumber Rule 2018 정합) / '4축 → GWT deterministic 합성 + NL ↔ GWT cross-consistency validator' = ★ industry-first 자격" / ★ session 11차 LL-i-27 정정 자산):
  - **Why**: ★ Agent 1 결정적 사실 — Cucumber Rule 키워드 (2018) + Gáspár Nagy "story-rule-scenario" 가 이미 ★ "rule (자연어) + scenario (GWT)" dual representation paradigm 정의 (★ Cucumber 공식 "Rule = first-class concern of Gherkin"). ★ ★ ★ 본 방법론 industry-first 자격 ≠ "dual representation 자체". ★ ★ Agent 2 결정적 사실 — Spec Kit (90K star) / AutoUAT / TestFlow (arXiv 2504.07244 AST 2025) / CodeConcise / Drools / IBM ODM 모두 ★ ★ "NL ↔ GWT cross-consistency validator" + "4축 → GWT deterministic 합성 도구" = ★ ★ 공개 자료 0건.
  - **How to apply**:
    - ★ 외부 인용 시 = ★ ★ industry-first 자격 = "4축 (trigger/condition/action/expected_result) → GWT deterministic 합성 script + NL ↔ GWT cross-consistency validator (Layer 1 sanity + Layer 2 LLM mandatory)" scope 한정 의무
    - ★ "dual representation" 자체는 Cucumber Rule (2018) 정합 명시 의무 (★ 본 방법론 ≠ 원조)
    - ★ ★ LL-i-27 갱신: "GitHub Spec Kit / AWS Q / DMN / Drools / Spectral 모두 cross-consistency rule 부재" 명제 + ★ 본 LL-i-35 의 명제 (★ "4축 → GWT deterministic + Spec Kit/AutoUAT/CodeConcise 모두 부재") corroboration ✅

- ★ ★ ★ ★ ★ ★ **LL-i-37** (★ ★ "Claude → Claude self-invocation echo chamber 회피 paradigm = Sonnet 4.6 sub-agent + F-015 cross-validation pattern 정합" / ★ session 12차 Phase C 본격 paradigm):
  - **Why**: ★ ★ session 12차 Senior critique STOP-1 자격 사실 = Opus → Opus self-invocation 시 동일 학습 코퍼스 / 동일 사전훈련 / 동일 RLHF echo chamber 위험 / F-015 (memory `feedback_sub_agent_validation.md`) 정면 위반 후보. ★ session 11차 sub-agent 3 병렬 토론 paradigm 자체 = retrospect 영역 인지 ✅.
  - **How to apply**:
    - ★ ★ Phase C Layer 2 LLM 본격 호출 시 = Sonnet 4.6 sub-agent model 명시 의무 (★ Opus → Sonnet = echo chamber 약화)
    - ★ F-015 cross-validation pattern 정합 (★ "sub-agent 학습 코퍼스 의존 회피")
    - ★ 외부 인용 시 = "Claude → Claude self-invocation 회피 paradigm = sub-agent model 다양화 의무" 명시
    - ★ Phase D 시점 retrospect 검토 의무 (★ session 11차 Phase B 결과 = Layer 1 결정적 영역 / retrospect 영향 ❌)

- ★ ★ ★ ★ **LL-i-38** (★ "Node.js script 안 LLM 직접 호출 ❌ paradigm 본질 / Claude Code sub-agent invocation paradigm 본격 채택" / ★ session 11차 patch v5 + session 12차 본격 구현):
  - **Why**: Claude Code SDK 안 Node.js script 안 Task tool / Agent tool 직접 호출 ❌ / 모든 LLM 호출 paradigm = Claude Code CLI 안 Claude (호출자) 가 호출 영역 만. ★ B-4 paradigm = "Claude 가 validator 호출 전 Task tool 호출 후 결과 JSON 입력" paradigm 본질 정합.
  - **How to apply**:
    - ★ ★ 본 방법론 안 모든 LLM 호출 paradigm = Claude Code sub-agent invocation paradigm 의무
    - ★ Node.js script 안 직접 LLM 호출 paradigm ❌ (★ patch v5 paradigm 정합)
    - ★ validator CLI = `--llm-results <path>` 입력 paradigm 의무 (★ AI 위임 paradigm)
    - ★ trigger paradigm = skill trigger + ad-hoc hybrid (★ Q-C-trigger (d)+(a) 정합)
    - ★ batch paradigm 의무 (★ 1회 Task tool 호출 안 전체 BR list / STOP-4 흡수)

- ★ ★ ★ ★ ★ ★ ★ **LL-i-39** (★ "Claude Code sub-agent invocation paradigm 본격 동작 입증 + Sonnet 4.6 batch paradigm 정합" / ★ session 13차 본격 입증):
  - **Why**: ★ session 13차 Task tool 5회 본격 호출 = ★ Anthropic API key 의무 ❌ / Claude Code subscription 자체 영역 / batch paradigm 정합 (31 BR 총합 / Sonnet 4.6 1M context 충분) / confidence cap 0.85 enforcement ✅ / Static Tool 시뮬레이션 ❌ 정합 ✅
  - **How to apply**: 본 방법론 안 LLM 호출 paradigm = Claude Code Task tool / Agent tool 호출 paradigm 본격 채택 ✅ / batch paradigm 의무 / Sonnet 4.6 sub-agent model paradigm 의무

- ★ ★ ★ ★ ★ ★ **LL-i-40** (★ "Adzic SBE 폐기 함정 회피 자격 본격 도달 — Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증"):
  - **Why**: session 13차 ≥ 2 PoC corroboration (PoC #01 13 + PoC #03 18 = 31 BR) Layer 1 + Layer 2 양쪽 통과 ✅ / Layer 1 vs Layer 2 다른 axis 자료 입증 (PoC #01: L1=0.954 vs L2=0.848 / PoC #03: L1=0.967 vs L2=0.914)
  - **How to apply**: Adzic SBE 함정 회피 도구 자격 본격 입증 (LL-i-26 정합) / industry-first 자격 본격 입증 (LL-i-27+35 정합) / Phase D 도메인 전문가 검토 carry 의무 보존

- ★ ★ **LL-i-41** (★ "same-model self-evaluation bias 위험 + Phase D retrospect carry 의무"):
  - **Why**: ★ session 13차 NL/GWT 합성 sub-agent + Layer 2 검증 sub-agent 모두 Sonnet 4.6 → same-model self-consistency bias 위험 / confidence cap 0.85 enforcement = 일부 회피 / 완전 회피 ❌
  - **How to apply**: Phase D retrospect 의무 (★ Opus / Haiku 교차 검증 carry) / 본 방법론 안 LLM 합성 + LLM 검증 paradigm same-model 위험 명시 의무

---

## §10. version handling

- 본 ADR = ★ ★ no version bump (★ v2.3.7 + v2.4.0-rc1 commit 위 추가 / sub-plan §1 자산화 commit)
- ★ ★ ★ ★ ★ **v2.4.0 MINOR FINAL release 라벨 ★ 보존** (★ session 8차 commit `f3b62db` / git tag v2.4.0 / origin push ✅) — ★ 단 ★ "paradigm rc 도입 / threshold gate 결정 보류 / Layer 2 LLM 의무 carry / ≥ 2 PoC corroboration 의무 carry" carry 명시 (★ Senior STOP-2 soft 흡수 / 라벨 강등 ❌ / carry 명시 ✅)
- ★ ★ ★ ★ ★ ★ **v2.5.0 MINOR = paradigm 본격 도입** (★ Senior STOP-1+2+3 흡수 + ★ Layer 2 LLM mandatory + threshold paradigm 본격 재정의 + ≥ 2 PoC corroboration 후) — ★ 다음 session ~ 다다음 session
- ★ session 9차 commit = SESSION-WRAPUP (★ no release / no version bump / no tag / ★ ADR §5.4 patch v2 + SPIKE v2 자산화)

---

## §11. 후속

- ★ ★ ★ ★ sub-plan §1 session 8차 = ★ 본 ADR + validator workspace 신설 + SPIKE v1 → SESSION-WRAPUP commit `c7dfca5` ✅
- ★ ★ ★ ★ ★ ★ sub-plan §2 session 8차 (★ release 통합) = ★ schema top-level 재설계 + PoC #01+#05 마이그레이션 → commit `f3b62db` (v2.4.0 MINOR FINAL release) ✅
- ★ ★ ★ ★ ★ ★ ★ **sub-plan §1' session 9차 (★ ★ patch v2) = ★ ★ ★ ★ ★ threshold spike revisit (C-threshold-spike-revisit 흡수) + REVISE-6 재실측 + Layer 2 LLM 의무 paradigm 결단 + ADR §5.4 patch v2 + SPIKE v2 자산화 → SESSION-WRAPUP commit `158a700` ✅**
- ★ ★ ★ ★ ★ ★ ★ **★ ★ ★ session 10차 Phase A 시행 (★ ★ 본 patch v3) = ★ ★ description vs natural_language paradigm 재정의 (Agent 3 (c) hybrid 채택 / DEC-2026-05-14 정합) + schema 강화 (★ breaking change ❌) + validator paradigm 갱신 (★ description alias 제거 + description_only_fallback finding 신설) + PoC #01 13 BR 자동 마이그레이션 ✅ + 302/0 test pass + LL-i-31~32 자산화 → SESSION-WRAPUP commit (★ 본 session / no release)**
- ★ ★ ★ ★ ★ ★ ★ **★ ★ ★ session 11차 Phase B 시행 (★ ★ 본 patch v4) = ★ ★ PoC #03 18 BR (★ trigger→When / condition→Given / expected_result→Then 형식 sliding + action = metadata 보존 + NL TODO marker) + PoC #05 input/ → output/rules/ 이전 + sample_mode meta 명시 + Layer 1 threshold 자체 제거 (★ session 9차 "0.15 floor advisory" → session 11차 "★ threshold 자체 제거") + 303/0 test pass + ≥ 2 PoC corroboration 자격 도달 ✅ (★ PoC #01 13 + PoC #03 18 = 31 BR) + LL-i-33~35 자산화 → SESSION-WRAPUP commit (★ 본 session / no release / no version bump / no tag)**
- ★ ★ ★ ★ ★ ★ ★ ★ ★ **★ ★ ★ session 11차 patch v5 paradigm 회복 (★ ★ ★ ★ ★ ★ ★ ★ paradigm sliding error 회복 / 사용자 결단 "옵션 B" 정합) = ★ ★ ★ ★ ★ "Anthropic API / OpenAI API" 영역 ❌ → ★ ★ ★ ★ "Claude Code sub-agent (Task tool / Agent tool) invocation paradigm" 정정. ★ ★ 본 방법론 = Claude Code plugin 자산 (.claude-plugin/ + agents/ + skills/ + hooks/) / ★ Anthropic API key 의무 ❌ / Claude Code subscription 자체 영역 = 실 Claude 호출 paradigm / Static Tool 시뮬레이션 ❌ 정합. ★ ★ 본 session 11차 sub-agent 3 병렬 토론 자체 = paradigm 입증 영역.**
- ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **★ ★ ★ session 12차 Phase C step 1~5 시행 (★ ★ 본 patch v6) = ★ ★ ★ ★ Senior STOP-1+2+3+4 흡수 + REVISE 5건 흡수 + 사용자 결단 "진행하자" 정합 + ★ Q-C0 (b) B-4 paradigm + Q-C-trigger (d)+(a) hybrid + Q-C-batch + Q-C-model Sonnet 4.6 + Q-C1~5 정합 결단. 시행 산출 — validator interface 본격 (cli.js + llm.js + validator.js / placeholder → 본격 paradigm / semantic_drift_detected + confidence_cap_exceeded finding 신설 / Layer 1 AND Layer 2 양쪽 통과 paradigm / DETERMINISTIC_THRESHOLD 신설) + docs/layer-2-prompt-spec.md 신설 (batch paradigm + Sonnet 4.6 + confidence cap 0.85) + test +5 (31/31 pass) + workspace 308/0 + DEC-2026-05-14-phase-c-step-1-5-layer-2-paradigm-implementation 신설 + LL-i-37+38 자산화 → SESSION-WRAPUP commit (★ 본 session / no release / no version bump / no tag). ★ session 13차 = step 6~12 분리 (★ STOP-2 흡수).**
- ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **★ ★ ★ session 13차 Phase C step 6~8+11+12 본격 시행 (★ ★ 본 patch v7) = ★ ★ ★ ★ ★ Task tool 5회 본격 호출 (★ Sonnet 4.6 / batch / 31 BR 총합) — Agent 1 PoC #03 NL 합성 + Agent 3 PoC #05 GWT 합성 + Agent 5 PoC #01 Layer 2 + Agent 2 PoC #03 Layer 2 + Agent 4 PoC #05 Layer 2. 본격 재실측 — PoC #01 (L1=0.954/L2=0.848/overall=0.901/pass) + PoC #03 (L1=0.967/L2=0.914/overall=0.941/pass) + PoC #05 (L1=1.0/L2=0.97/overall=0.985/pass). ★ ★ ≥ 2 PoC corroboration Layer 1 + Layer 2 양쪽 통과 ✅ + Adzic SBE 함정 회피 자격 본격 도달 ✅ + Claude Code sub-agent invocation paradigm 본격 동작 입증 ✅. skills/analysis/br-cross-consistency-check/SKILL.md 신설 (★ Q-C-trigger (d) skill trigger paradigm) + flows/analysis.phase-flow.json cross_cutting.aspects.skills[] 등록 (★ drift-validator 47/47 pass / orphan 회피) + DEC-2026-05-14-phase-c-step-6-12-session-13 신설 + LL-i-39+40+41 자산화 + workspace 308/0 pass → SESSION-WRAPUP commit (★ no release / no version bump / no tag). semantic_drift_detected 2 BR (BR-AUTH-JWT-002 0.65 + BR-USER-DELETE-AUTH-001 0.55) = Phase D 도메인 전문가 검토 carry.**
- ★ ★ ★ ★ **Phase C 종결 session (★ session 14차) = ★ ★ ★ chain 1 gate Layer 2 통합 (★ chain-driver gate-eval.js 영역 변경 / chain harness 5 요소 1 변경 의무) + Phase C SESSION-WRAPUP**
- ★ ★ ★ ★ **Phase D 후속 session = ★ release-readiness 8/8 → 9/9 재격상 + ≥ 2 PoC corroboration 검증 + PoC #01 13 BR NL 도메인 전문가 검토 + v2.5.0 MINOR release**
