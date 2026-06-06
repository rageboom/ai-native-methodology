# DEC-2026-05-13-rules-dual-representation-사상-신설

| 항목     | 값                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 결정자   | 윤주스 (TF Lead)                                                                                                                 |
| 일자     | 2026-05-13 ( session 7차 — Plan L 직후 점검 trigger)                                                                             |
| 상태     | 승인 ( dual representation 사상 결단 / v2.4.0-rc1 자격 / 1단계 본 session 자산 + 2단계 다음 session 통합 release v2.4.0 MINOR)   |
| 카테고리 | methodology / paradigm decision / governance 회복 ( schema vs PoC drift 사실 처리)                                               |
| 관련     | DEC-2026-05-13-BR-id-4-segment-enforcement-v2.3.7 ( session 7차 Plan L) / ADR-008 이중 렌더링 사상 / F-015 cross-validation 패턴 |

---

## 1. 컨텍스트

### 1.1. trigger

Plan L (v2.3.7 BR pattern strict 화) 직후 사용자 점검 질의 → critical 발견 6갈래 drift:

```
PoC #01 = GWT 풍부 (v1.x 공식 표준)
PoC #02 = GWT 단순
PoC #03 = trigger-condition-action (변형)
PoC #04 = business_rules array 자체 부재 (FE 특수)
PoC #05/#06 = title+type+description (B 형식 초기)
PoC #07~#11 = title+natural_language (B 형식 발전 / 현 신표준)
```

즉 본 방법론 안 rules.json 6갈래 drift 사실 + schema 는 v1.x GWT 강 제약 stuck + 11 PoC schema-validator 모두 INVALID + §8.1 strict release-readiness 가 analysis validator 결과 ❌ = **governance 실패** 본질 발견.

### 1.2. 사상 발전 사실

```
v1.x: GWT 강 제약 (BDD / formal-spec 친화)
v2.0 chain harness 진입: source-grounded paradigm
v2.1 phase 4.7: characterization mode 도입
v2.3 현재: natural_language 단일 자연어 (characterization 완전 정합)
```

두 형식 공존 = 의도된 결단 ❌ — 사상 발전을 따라가지 못한 schema 의 잔존 사실.

### 1.3. 두 사상 dilemma

| 측면                         | GWT                                       | natural_language     |
| ---------------------------- | ----------------------------------------- | -------------------- |
| chain 3+4 자동 생성          | ✅ given→Arrange/when→Act/then→Assert 1:1 | ❌ 자연어 파싱 의무  |
| chain 4 impl 재구현 contract | ✅ 명확한 contract                        | ❌ 모호성            |
| phase 4.5 formal-spec 변환   | ✅ Decision Table 자동                    | ❌ 사람 변환         |
| characterization mode 친화   | ❌ 작성 비용 ↑                            | ✅ 현 동작 묘사 자유 |
| legacy 분석 작성 비용        | 50% 신뢰도 / 작성 어려움                  | ✅ 빠른 묘사         |

두 사상은 trade-off.

### 1.4. 사용자 결단 trigger

사용자 질문: **"이거 두개를 같이 만들고 서로 정합성을 체크 하는 건 안되겠지? 예를 들면 스팩 만들때 이 둘을 모두 참고 해서 더블 체크 하는거지"**

본 방법론의 핵심 사상 (이중 렌더링 + cross-validation) 의 "BR 영역 확장" 정합 결단.

---

## 2. 결단

### 2.1. dual representation 사상 정식 채택

BR 안 **natural_language + given/when/then 두 표현 동시 보유 가능** + **cross-validation 자동 검증**.

#### 사상 적용 path:

```
[analysis stage]     rules.json BR
                       ↓ natural_language ✅ ( characterization / 빠른 추출)
                       ↓ given/when/then ✅ ( contract / 자동화 친화)
                       ↓
                         cross-validation 자동 검증 (br-cross-consistency-validator)
                       ↓
[chain 1 진입]       두 표현 정합 ≥ 0.85 gate 의무
                       ↓
[chain 3 test]       given/when/then → test code 1:1 매핑
[chain 4 impl]       given/when/then → impl contract / natural_language → 문서
```

### 2.2. 본 session (1단계 / v2.4.0-rc1 자격) 자산

#### 2-2-1. schemas/rules.schema.json item 안 변경

- `required` array: `["id", "name", "given", "when", "then"]` → `["id", "name"]`
- `anyOf` 신설 — GWT 표현 OR natural_language 표현 ≥ 1 의무
- `natural_language` field 신설 (string / optional / characterization 친화)
- given/when/then = `required` 에서 제거 / 단 minItems: 1 유지 ( 작성 시 풍부도 의무)
- description 안 사상 명시 ("v2.4.0-rc1 dual representation")

#### 2-2-2. 호환 검증 ✅

| PoC                        | 우리 변경 영역 | 결과                                                                   |
| -------------------------- | -------------- | ---------------------------------------------------------------------- |
| #01 (GWT 풍부)             | anyOf          | ✅ pass ( 다른 schema errors 보존 / 별도 carry)                        |
| #07~#11 (natural_language) | anyOf          | ✅ pass expected ( 단 top-level invalid → 도달 ❌ / 다음 session 해결) |

#### 2-2-3. plan 신설

- `~/.claude/plans/m-rules-schema-form-realignment.md` ( M+ 갱신 / cross-validation 사상 반영)
- `~/.claude/plans/n-br-cross-consistency-validator-design.md` ( 신설 / 다음 session 구현 설계)

### 2.3. 2단계 (다음 session / v2.4.0 MINOR 자격) 자산

#### 2-3-1. schema top-level 재설계

- top-level: project_id + business_rules + br_summary + meta optional + rule_conflicts optional
- PoC #01/#02/#03 마이그레이션 ( rules → business_rules rename + sub-fields 정합)
- PoC #05/#06 마이그레이션 ( description + current_state_note → natural_language 통합)
- PoC #07~#11 = 그대로

#### 2-3-2. tools/br-cross-consistency-validator/ workspace 신설 ( 16번째)

2 layer 검증:

- **Layer 1 결정적** (100% 정확): anyOf 강제 + 키워드 매칭 + structure 검증 + BR id 4토막
- **Layer 2 LLM** ( --strict 옵션 / 신뢰도 ≤ 0.85): sub-agent LLM 의미 정합 / F-015 cross-validation 패턴

#### 2-3-3. ADR-CHAIN-011 신설 ( "BR dual representation paradigm")

#### 2-3-4. chain 1 gate 통합

- chain-driver gate-eval.js 안 chain 1 진입 시 br-cross-consistency-validator 결과 의무
- REQUIRED_VALIDATORS_PER_STAGE.planning 안 추가

#### 2-3-5. release-readiness analysis_validator_violation criterion 신설 ( 사용자 Q2 결단 정합)

- §8.1 strict 7/7 → 8/8 격상
- analysis validator (schema + drift + decision-table + formal-spec-link + br-cross-consistency) 결과 자동 집계

#### 2-3-6. PoC #04 FE 별도 schema

- rules-fe.schema.json 또는 schema 안 if/then 분기

#### 2-3-7. v2.4.0 MINOR release

- 3-way version sync + npm run build + git tag v2.4.0
- v2.3.7 commit 2건 (`75ee21d` + `963dfa0`) = 본 release 안 통합 push

---

## 3. resolved / 신규 carry

### resolved 0

(없음 — 본 session 1단계 = 사상 결단 + 자산화 / 실 carry resolved 는 2단계 v2.4.0 release 시)

### 신규 carry 4건

- **C-rules-top-level-realignment** ( critical / 다음 session — top-level project_id + business_rules 정식 표준화 / 11 PoC 일괄 정합 / PoC #01 마이그레이션)
- **C-br-cross-validator-implementation** ( critical / 다음 session — workspace 16번째 신설 / Layer 1 결정적 + Layer 2 LLM optional / chain-driver 통합)
- **C-rules-other-schema-errors** ( PoC #01 meta.confidence + enum + rule_conflicts.minItems 위반 / 별도 sprint)
- **C-poc-04-fe-rules-separate-schema** ( FE 트랙 별도 schema 신설 / 또는 if/then 분기)

### 보존 carry

- C-rules-BR-id-relabel-PoC-11 ( critical / v2.3.7 commit 보존 / 도메인 전문가 위임)
- C-rules-BR-id-relabel-5PoC ( PoC #06~#10 별도 sprint)
- C-stack-결단-chain-3-4-plan (critical)
- C-OSS-Modern-chain-2-4-PoC08 (critical / ≥ 2 realworld trigger / v2.4.0 자격)
- C-모던-stack-사내-측정 (critical)
- C-chain-driver-state-retroactive-all-PoC
- C-adoption-findings-aggregator-workflow
- 그 외 (C-egovframework-sub-rule + C-domain-PoC11-1~3 + C-PoC07-1~3 + C-v2.2.0-1 + C-v2.3.0-gartner)

---

## 4. Lessons Learned ( session 7차 신규 / 본 결단 trigger)

- **LL-i-22** ( "schema 명세 vs 실 PoC drift = governance 실패 사실"):
- **Why**: 본 방법론 안에서 schema (v1.x GWT) 와 PoC 산출물 (v2.x natural_language) 이 분리 발전 / ADR/DEC 결단 부재 / release-readiness 검증 사각지대
- **How to apply**: 사상 발전 시 schema 동기화 의무 / 신규 산출물 형식 도입 시 ADR-CHAIN-\* 신설 의무 / release-readiness 가 analysis validator 결과 강제 의무

- **LL-i-23** ( "release-readiness 자체 quality 사각지대"):
- **Why**: §8.1 strict 7/7 통과 + PoC schema-validator INVALID 11/11 사실 = release-ready 라벨이 실 quality 보장 ❌
- **How to apply**: release-readiness 의 검사 대상 자체 quality 검증 의무 ( scripts/release-readiness.js 가 어떤 validator 를 보는지 + 사각지대 자동 발견 절차)

- **LL-i-24** ( "두 사상 dilemma → dual representation 사상 정합"):
- **Why**: characterization (natural_language) vs 자동화 (GWT) trade-off → 두 표현 동시 + cross-validation 으로 모두 살림
- **How to apply**: 본 방법론 안 다른 dilemma 발견 시 "이중 표현 + cross-validation 패턴" 후보 검토 / ADR-008 이중 렌더링 사상의 확장 패턴

- **LL-i-25** ( "옵션/결단 단어 짜증 사용자 피드백 자산화"):
- **Why**: 본 session 진행 안 사용자가 "결단 결단" 단어 + 옵션 형식에 짜증 표현
- **How to apply**: 직설적 답변 + 비유 + 예시 우선 / 옵션 list 는 사상 결단 영역만 / "결단" 단어 최소화 / 핵심 결정 1~2개로 압축

---

## 5. PATCH v2.4.0-rc1 자격 ( rc 단계 / 본 session)

- ✅ chain harness 5 요소 변경 ❌ ( 본 session 1단계 = schema 안 만)
- ✅ schema 영역 변경 = backward-compat 보존 (anyOf / required 완화)
- ✅ no new ADR ( ADR-CHAIN-011 후보 = 다음 session plan)
- ✅ workspace test 보존 ( 본 session schema-validator unit test 기존 8/8 보존 — 다음 session 갱신)
- ⏳ §8.1 strict 영향 = 단 본 session = release ❌ / no version bump
- ✅ ≥ 6 PoC corroboration 보존
- ⏳ build = 본 session 안 검증 ( 단 release ❌)

본 session = no version bump / no release / no tag / commit 만 ( v2.3.7 commit 위 추가).

---

## 6. version handling

- 본 session = no version bump ( v2.3.7 commit 보존 / 본 session = "v2.3.7 위 dual representation 사상 신설 자산" 1 commit)
- 다음 session = v2.4.0 MINOR ( 통합 release / 2단계 종결 시점)
- v2.3.7 commit 2건 (`75ee21d` + `963dfa0`) = 다음 session v2.4.0 release 안 자연 흡수 / push 통합

---

## 7. 후속

- 다음 session 진입 시 = 4원칙 2원칙 sub-agent 3원칙 ( 공식문서 BDD/Gherkin + 테크기업 ChatGPT/Cucumber 사례 + Senior critique) 권장
- Plan M+ §2 다음 session scope 그대로 진행 / 본 결단 § 2-3 정합
- ADR-CHAIN-011 본격 작성 / methodology-spec/deliverables/5-business-rules.md 갱신 / methodology-spec/sub-rules 안 dual representation sub-rule 후보
