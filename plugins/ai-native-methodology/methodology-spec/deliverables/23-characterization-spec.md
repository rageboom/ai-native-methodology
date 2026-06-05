# 산출물 #23: Characterization Spec

> **사상**: 의도 vs 버그 분리 + snapshot acceptance oracle. Michael Feathers Characterization Testing (2004) + Specification by Example (Gojko Adzic 2011) + DDD bounded context 합성.
> **schema**: `schemas/characterization-spec.schema.json`
> **생성 phase**: `characterization` phase (`formal-spec` phase 후 / `api` phase + `ui` phase 전 / analysis stage chain 1 입력 보강)
> **≥ 2 PoC corroboration 의무**

---

## 1. 목적

**답하는 질문**: "business-rules.json + antipatterns.json 만으로 새 시스템 동작이 결정되는가? — ❌. 어떤 BR 을 보존하고 어떤 AP 를 버릴지 명시 의무."

**AI 재구현 시 활용**:

- chain 1 discovery-spec 입력 보강 (use_cases 추출 시 acceptance oracle 직접 적용)
- chain 4 GREEN 검증 시 snapshot 이 acceptance test 로 작동 (AI 자동 생성 코드의 의도 보존 검증)
- ambiguous 영역 = 도메인 expert 결단 강제 (carry 명시 의무)

### 1.1 외부 조언 (사상적 근거)

- Michael Feathers, _Working Effectively with Legacy Code_ (2004) §13 — "Characterization Test = 관찰된 input → output 을 assert"
- Gojko Adzic, _Specification by Example_ (2011) — Given/When/Then BDD 7 핵심 패턴 / Living Documentation
- DDD bounded context (Eric Evans 2003) — 도메인 영역 분리
- Self-Admitted Technical Debt (SATD / KL-SATD per Maldonado & Shihab 2015) — 코드 자조 코멘트 분류

---

## 2. 형식

```
output/characterization/
├── characterization-spec.json     # json 단독 SSOT (intent_vs_bug 분류 포함 / D-6)
├── coverage.json                  # UC ↔ snapshot 매핑 + threshold
└── snapshots/
    └── UC-*.json                  # Given/When/Then BDD 형식 / 1 UC 당 1 snapshot
```

---

## 3. 추출 범위 (출처 / 도구 / 신뢰도)

| 항목                                      | 출처                                                            | 도구              | 신뢰도 (단계 5)                |
| ----------------------------------------- | --------------------------------------------------------------- | ----------------- | ------------------------------ |
| intent_vs_bug 분류                        | business-rules.json + antipatterns.json + 코드 자조 코멘트 grep | LLM + grep        | 80~90% (도메인 expert 결단 후) |
| snapshot Given/When/Then                  | 코드 + 실 환경 (DB 접속 가능 시)                                | LLM + 실행 (선택) | 70~95%                         |
| acceptance_oracle (intent_classification) | snapshot.scenarios[].intent_classification                      | 분류표 reference  | 80~95%                         |
| coverage matrix                           | UC ↔ snapshot 매핑 + 코드 grep                                  | grep + 매뉴얼     | 90~95%                         |

**입력**: business-rules.json + antipatterns.json (phase 4 출력) + formal-spec (phase 4.5 출력 / 선택) + 코드
**no-simulation 정책**: simulation 시 -5%p 패널티 / 도메인 expert 인터뷰 carry 필수.

### 3.1 미추출 (의도적)

- 자동 코드 generation — chain 4 (impl-spec) 영역
- 실행 가능 test 코드 — chain 3 (test-spec) 영역. characterization snapshot = test 의 acceptance oracle / 실 test 코드 ❌
- ambiguous 자동 결단 — 도메인 expert 의무 (carry)

---

## 4. intent vs bug 4 분류

| 분류                | 정의                                                                                                             | 처분                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **intent**          | 비즈니스 의도 — 새 시스템에서도 동일 동작 보존 의무                                                              | snapshot 그대로 통과 의무              |
| **bug**             | 명확한 결함 — 새 시스템에서 의도적 다른 결과 (modern_alternative 적용)                                           | snapshot 의 behavior_likely_bug 영역   |
| **ambiguous**       | 도메인 expert 결단 의무 (carry)                                                                                  | 결단 전까지 chain 4 진입 ❌            |
| **self_recognized** | 코드 자조 코멘트 (TODO / FIXME / HACK / XXX / "폐해" 등) — SATD/KL-SATD 학술 정식 용어 (Maldonado & Shihab 2015) | bug 로 자동 처분 + 자조 위치 명시 의무 |

### 4.1 Modern 환경에서 self_recognized = 0 도 정합

Modern 스택은 self_recognized 자연 부재 — "TODO 0건 = §8.1 strict overfitting" 의심 ❌. self_recognized 발생 빈도 metric 첨부 의무 (예: "TODO/FIXME grep result: N건 / N=0").

### 4.2 Legacy 환경에서 ambiguous ↑

Legacy 환경은 ambiguous 가 증가한다. 도메인 expert (IFRS 회계 담당자 등) 결단 강제. 이게 characterization phase 의 핵심 가치 — rules + antipatterns 만으로는 결정되지 않음.

---

## 5. snapshot Given/When/Then 형식

```yaml
snapshots[]:
  snapshot_id: 'SNAP-UC-USER-SIGNUP-001'
  use_case: 'UC-USER-SIGNUP-001' # discovery-spec UC ↔ link
  feature: 'User Signup' # (Cucumber Gherkin 정합 / optional)
  endpoint: 'POST /api/users'
  controller_method: 'UserController.create'
  service_method: 'UserService.create'
  layer: 'integration | unit | e2e'
  data_source_status: 'real_db | code_only | domain_expert_interview'
  scenarios:
    - id: 'SCN-SIGNUP-001'
      name: 'happy path — 신규 user 등록'
      tags: ['@happy', '@intent'] # (Gherkin tag / optional / dual encoding)
      given:
        request_body: { ... }
        state_before: '...'
      when: 'POST /api/users → ValidationPipe → ...'
      then:
        expected_response: { status: 201, body: { ... } }
        state_after: '...'
        validators_passed: [...]
      intent_classification: # 4 분류 매핑
        - rule: 'BR-USER-USERNAME-NOT-BLANK-001'
          type: 'intent'
        - rule: 'BR-USER-EMAIL-FORMAT-001'
          type: 'intent'
      behavior_to_preserve: ['validation 4종', 'JWT 응답']
      behavior_likely_bug: ['DB UQ 부재 — App pre-check race window']
```

### 5.1 4 필수 필드

`given` / `when` / `then` / `intent_classification` 의무.

`behavior_to_preserve` + `behavior_likely_bug` = 새 시스템 재구현 acceptance oracle 핵심.

`tags` + `feature` = optional (Gherkin 표준 호환 / dual encoding traceability).

---

## 6. coverage threshold + ratchet

```yaml
coverage:
  matrix:
    - uc: 'UC-USER-SIGNUP-001'
      snapshot: '✅'
      covered_by: ['SNAP-UC-USER-SIGNUP-001 / 3 scenario']
    - uc: 'UC-ARTICLE-CREATE-001'
      snapshot: '❌'
      scope_decision: 'carry — Day 2 시간 cap'
  coverage_summary:
    ucs_total: 7
    ucs_covered: 3
    uc_coverage_ratio: 0.43
  coverage_target: 0.80 # default (PIT/Stryker/BullseyeCoverage 산업 표준)
  coverage_minimum_legacy: 0.40 # ratchet 진입점 (legacy 시)
  coverage_strategy: 'absolute | ratchet' # default = absolute
  trend_required: false # ratchet 시 true 의무
```

### 6.1 두 strategy 양립

- **absolute** = `actual ≥ coverage_target` (default 0.80) 검증 / 신규 코드 + Modern 스택 권장
- **ratchet** = `actual ≥ coverage_minimum_legacy` (default 0.40) + `trend_required: true` 검증 / Legacy 진입 시 권장

Legacy 단일 모듈이 absolute target 미달 시 ratchet 으로 진입 — `trend_required` 충족 시 통과.

### 6.2 외부 권위

- PIT (PITest) 공식 — `mutationThreshold` 80% default
- Stryker Mutator — "mutation score > 80% = excellent"
- BullseyeCoverage — "80% line + 70% branch = build gate"
- legacy = "absolute < 0.80 이지만 trend positive + 신규 코드 ≥ 0.80" 표준 (jest-coverage-ratchet npm)

---

## 7. cross-link

```yaml
cross_links:
  - {to_artifact: rules, link_type: classifies_br}                # BR ↔ intent_classification
  - {to_artifact: antipatterns, link_type: classifies_ap}         # AP ↔ intent_classification
  - {to_artifact: discovery-spec, link_type: provides_use_cases_oracle}  # chain 1 입력
  - {to_artifact: behavior-spec, link_type: validates_bhv_intent} # chain 2
  - {to_artifact: acceptance-criteria, link_type: snapshot_oracle}# chain 2 (Gherkin)
  - {to_artifact: test-spec, link_type: snapshot_to_tc}           # chain 3
  - {to_artifact: formal-spec, link_type: aligns_with_state_machine}  # phase 4.5
```

---

## 8. 신뢰도

| 단계 | 조건                                                                | 신뢰도 |
| ---- | ------------------------------------------------------------------- | ------ |
| 1    | LLM 분류 만                                                         | 50~65% |
| 3    | + business-rules.json + antipatterns.json grounding                 | 70~85% |
| 5    | + 도메인 expert 결단 (ambiguous = 0 또는 carry 명시) + 실 환경 검증 | 85~95% |

### 8.1 ambiguous 정책 (핵심)

- ambiguous > 0 시 → 도메인 expert carry 명시 의무 (snapshot 또는 characterization-spec.json 의 intent_vs_bug)
- 결단 전까지 chain 4 (impl-spec GREEN) 진입 ❌
- 결단 후 갱신 의무

---

## 9. 검증 체크리스트

```
□ schema 검증 통과 (Ajv 8 strict)
□ snapshot.scenarios[].given + when + then + intent_classification 4 필수 필드
□ intent_classification.type ∈ [intent, bug, ambiguous, self_recognized]
□ ambiguous > 0 시 도메인 expert carry 명시 (본문 자체 grep)
□ coverage_strategy ∈ [absolute, ratchet]
□ ratchet 시 trend_required = true 의무
□ named_classified_ratio ≥ 0.80 (default / threshold flag override)
□ self_recognized 발생 빈도 metric 첨부 (0 도 정합)
□ no-simulation 의무 — domain_expert_interview = "scheduled | completed | carry" 명시
```

---

## 10. 산출물 간 참조

| 방향                                   | 의미                                          |
| -------------------------------------- | --------------------------------------------- |
| Characterization → Rules               | classifies_br (BR 4분류)                      |
| Characterization → Antipatterns        | classifies_ap (AP 4분류)                      |
| Characterization → Planning-spec       | provides_use_cases_oracle (chain 1 입력 핵심) |
| Characterization → Behavior-spec       | validates_bhv_intent                          |
| Characterization → Acceptance-criteria | snapshot_oracle (Gherkin 정합)                |
| Characterization → Test-spec           | snapshot_to_tc (chain 3)                      |
| Characterization → Formal-spec         | aligns_with_state_machine                     |

---

## 11. 흔한 함정

### 11.1 Legacy DB 환경 부재 시 정확도 한계

- 증상: 실 DB 접속 ❌ → snapshot.then.state_after 추정만
- 대응: `data_source_status: "code_only"` 명시 + 도메인 expert 검증 carry 의무

### 11.2 ambiguous 분류 회피

- 증상: 모든 BR/AP 를 intent / bug 양 극단으로만 분류 → "결단 미뤄질" carry 누락 → 새 시스템 잘못된 결단
- 대응: ambiguous 1건 이상 등재 의무 (Legacy 환경) + 도메인 expert 인터뷰 carry 강제

### 11.3 scenario 수 과다

- 증상: 1 UC 당 10+ scenario → 유지보수 비용 ↑ + acceptance oracle 모호
- 대응: 1 UC 당 happy + edge 1~2 + likely_bug 1~2 권장 (1 UC 당 약 3~4 scenario)

### 11.4 self_recognized 누락 (Legacy 만)

- 증상: 코드 자조 코멘트 grep ❌ → SATD 신호 누락
- 대응: TODO / FIXME / HACK / XXX / "폐해" / "임시" / "나중에" grep 의무

### 11.5 coverage threshold 단일값 강제

- 증상: legacy 모듈 0.43 시 absolute 0.80 fail → ratchet 옵션 부재
- 대응: schema `coverage_strategy` enum 의무 + ratchet 진입 시 trend_required 의무 (research 권고)

### 11.6 Gherkin tag 미사용 시 traceability 손실

- 증상: BHV-_ / AC-_ 와의 cross-link 가 intent_classification.type 단일축
- 대응: `tags` 옵션 필드로 dual encoding (`@bug` / `@AP-DB-001` / `@critical` 등)

---

## 12. ≥ 2 PoC corroboration 사실

characterization phase 는 Legacy 적대성 spectrum 과 Modern spectrum 양쪽에서 동작이 입증되어야 한다 (≥ 2 PoC corroboration 의무 / §8.1 strict overfitting 회피).

---

## 인용

- 사상 근거: ADR-CHAIN-006 (characterization phase 정식 도입)
- 신뢰도 모델: ADR-009 §2.4 (신뢰도 단계 정합)
- json-only SSOT: ADR-011 (erd.mermaid 폐기 / json 단독)
- schema: `schemas/characterization-spec.schema.json`
- 외부 권위:
  - Michael Feathers, _Working Effectively with Legacy Code_ (2004) §13 — Characterization Test
  - Gojko Adzic, _Specification by Example_ (2011) — Given/When/Then BDD / Living Documentation
  - Eric Evans, _Domain-Driven Design_ (2003) — bounded context
  - Maldonado & Shihab (2015) — SATD / KL-SATD 분류
  - PIT (PITest) `mutationThreshold` 80% default / Stryker Mutator / BullseyeCoverage / jest-coverage-ratchet
