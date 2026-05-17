# characterization phase: characterization (의도 vs 버그 분리 + Given/When/Then snapshot acceptance oracle)

> **명령어**: `/analyze-characterization` · **사상**: ADR-CHAIN-006 (phase 4.7 정식 도입) + Michael Feathers Characterization Testing (2004) + Specification by Example (Gojko Adzic 2011) + SATD/KL-SATD (Maldonado & Shihab 2015)
> **핵심 책임**: business-rules.json + antipatterns.json 만으로는 결정되지 않는 "의도 vs 버그" 분류 + Given/When/Then snapshot acceptance oracle 작성 → chain 1 planning-spec 입력 보강
> **introduced**: v2.1.0

---

## 1. 목적

`business-logic` phase (rules + domain) + `formal-spec` phase 후에도 ★ "어떤 BR 을 보존하고 어떤 AP 를 버릴지" 명시 ❌ → ★ acceptance oracle 부재 → chain 1 planning-spec use_cases 추출 시 의도/버그 혼재.

**답하는 질문**:
- 새 시스템에서 어떤 비즈니스 행위를 그대로 보존해야 하나? (intent)
- 어떤 행위는 의도적으로 다르게 구현해야 하나? (bug)
- 도메인 expert 결단이 필요한 영역은? (ambiguous)
- 코드 자조 코멘트 (TODO/FIXME/HACK/XXX/"폐해") 는 어디 있나? (self_recognized = SATD)

---

## 2. 입력

| 입력 | 출처 | 신뢰도 기여 |
|---|---|---|
| business-rules.json | `business-logic` phase 산출물 | 60% |
| antipatterns.json | `business-logic` / `quality` phase partial | +20%p |
| 코드 자조 코멘트 grep | 소스 코드 | +5%p |
| formal-spec (선택) | `formal-spec` phase 산출물 | +10%p |
| 도메인 expert 인터뷰 (ambiguous > 0 시 의무) | 사용자 위임 | +10%p (ambiguous → resolved) |

→ `business-logic` phase 미완료 시 `characterization` phase 진입 차단. business-rules.json + antipatterns.json 의무.

---

## 3. 처리 — 4 산출물 + 단일 prompt 양 spectrum

| 산출물 | AI 눈 | 사람 눈 |
|---|---|---|
| Characterization Spec entry | `output/characterization/characterization-spec.json` | (없음 / md 별도) |
| Intent vs Bug 분류표 | (없음 / json 별도) | `output/characterization/intent-vs-bug.md` |
| Coverage matrix | `output/characterization/coverage.json` | (없음) |
| Snapshots | `output/characterization/snapshots/UC-*.json` (Given/When/Then BDD) | (옵션 .md 변환 / v2.1.x carry) |

### 3.1 4 분류 매핑 (★ schema enum)

| 분류 | 정의 | 처분 |
|---|---|---|
| **intent** | 비즈니스 의도 — 새 시스템에서도 동일 동작 보존 의무 | snapshot 그대로 통과 |
| **bug** | 명확한 결함 — 새 시스템에서 의도적 다른 결과 (modern_alternative) | snapshot.behavior_likely_bug |
| **ambiguous** | 도메인 expert 결단 의무 (carry) | 결단 전까지 chain 4 진입 ❌ |
| **self_recognized** | 코드 자조 코멘트 (SATD/KL-SATD per Maldonado & Shihab 2015) | bug 자동 처분 + 자조 위치 명시 |

### 3.2 ★ self_recognized grep (Modern 환경 0 도 정합)

```bash
grep -rn -E "TODO|FIXME|HACK|XXX|폐해|임시|나중에|폐기|deprecate|workaround" <src>/
```

★ 0건 = Modern 스택 자연 부재 (PoC #03 NestJS retrofit 입증) — `intentVsBug.self_recognized_grep_count: 0` 명시.

### 3.3 ★ Snapshot Given/When/Then (Cucumber Gherkin 정합)

각 핵심 UC 1개 snapshot (1 UC = 1 snapshot 권장) / scenario 3~5건 (happy + edge 1~2 + likely_bug 1~2):

```yaml
snapshot_id: "SNAP-UC-USER-SIGNUP-001"
use_case: "UC-USER-SIGNUP-001"          # ★ planning-spec UC ↔ link 의무
feature: "User Signup"                  # (Cucumber Feature / optional)
scenarios:
  - id: "SCN-SIGNUP-001"
    name: "happy path"
    tags: ["@happy", "@intent"]         # (Gherkin tag / dual encoding)
    given: { request_body: {...} }
    when: "POST /api/users → ValidationPipe → ..."
    then: { expected_response: {...}, state_after: "..." }
    intent_classification:
      - rule: "BR-USER-EMAIL-FORMAT-001"
        type: "intent"
    behavior_to_preserve: ["validation"]
    behavior_likely_bug: ["DB UQ 부재 race window"]
```

### 3.4 ★ ★ ★ ambiguous 처리 (도메인 expert 결단 강제)

ambiguous > 0 시:
1. `intent_vs_bug.ambiguous_carry[]` 의무 (rule_id + carry_owner + carry_reason)
2. snapshot scenario `behavior_likely_bug` 또는 `behavior_to_preserve` 중 최소 하나 명시
3. ★ chain 4 (impl-spec GREEN) 진입 ❌ — 결단 전까지 차단

PoC #06 D2 패턴 정합 — ambiguous 3 → 1 (DBA carry 만) → 명확 비율 82% → 94%.

### 3.5 ★ Coverage threshold + ratchet

```yaml
coverage_target: 0.80              # PIT/Stryker/BullseyeCoverage 산업 표준
coverage_minimum_legacy: 0.40      # ratchet 진입점
coverage_strategy: "absolute"       # absolute (default) | ratchet
trend_required: false              # ratchet 시 true 의무
```

---

## 4. 출력

```
output/characterization/
├── characterization-spec.json     # AI 눈 / 통합 entry
├── intent-vs-bug.md               # 사람 눈 / 분류표
├── coverage.json
└── snapshots/
    └── UC-*.json                  # Given/When/Then BDD
```

---

## 5. 검증

### 5.1 자동 검증 — characterization-coverage-validator (★ workspace 13번째)

```bash
node tools/characterization-coverage-validator/src/cli.js \
  --target .aimd/output/characterization/ \
  --threshold 0.80
```

8 검증:
1. snapshot 4 필수 필드 (given/when/then/intent_classification)
2. intent_classification.type enum 4
3. named_classified_ratio ≥ threshold
4. ambiguous > 0 시 ambiguous_carry 명시 의무
5. coverage_strategy enum (absolute/ratchet)
6. ratchet 시 trend_required = true 의무
7. coverage_target / coverage_minimum_legacy 양립
8. data_source_status='code_only' 시 carry 권장 (medium)

### 5.2 schema 검증 — schema-validator (Ajv 8 strict)

```bash
node tools/schema-validator/src/cli.js .aimd/output/characterization/
```

`schemas/characterization-spec.schema.json` (★ 30번째 schema) — 4 sub-schema (snapshot + scenario + intentVsBug + coverage) + if/then 강제.

---

## 6. cross-link

phase 4.7 출력 ↔ 다른 산출물:

| 방향 | 의미 |
|---|---|
| Characterization → Rules | classifies_br (★ BR 4분류) |
| Characterization → Antipatterns | classifies_ap (★ AP 4분류) |
| Characterization → Planning-spec | provides_use_cases_oracle (★ chain 1 입력 핵심) |
| Characterization → Behavior-spec | validates_bhv_intent |
| Characterization → Acceptance-criteria | snapshot_oracle (★ Gherkin 정합) |
| Characterization → Test-spec | snapshot_to_tc (★ chain 3) |
| Characterization → Formal-spec | aligns_with_state_machine |

---

## 7. 신뢰도 (ADR-009 §2.4 정합)

| 단계 | 조건 | 신뢰도 |
|---|---|---|
| 1 | LLM 분류 만 | 50~65% |
| 3 | + business-rules.json + antipatterns.json grounding | 70~85% |
| 5 | + 도메인 expert 결단 (ambiguous = 0 또는 carry 명시) + 실 환경 검증 | 85~95% |

---

## 8. ≥ 2 PoC corroboration (★ §8.1 strict)

| PoC | spectrum | 명확 분류 비율 | self_recognized | ambiguous |
|---|---|---|---|---|
| **PoC #06** (Spring 4.1 + iBATIS) | Legacy 적대성 4중 | 17/18 = 94% (D2 후) | 1 (AP-007 자조) | 1 (DBA carry) |
| **PoC #03 retrofit** (NestJS) | Modern | 30/30 = 100% | 0 (자연 부재) | 0 |

---

## 9. 흔한 함정

1. ★ Legacy DB 환경 부재 → `data_source_status: "code_only"` + 도메인 expert carry 의무
2. ambiguous 분류 회피 → 모든 BR/AP 를 intent/bug 양 극단 분류 시 결단 미뤄질 carry 누락
3. scenario 수 과다 → 1 UC 당 ≤ 5 scenario 권장
4. self_recognized grep 누락 (Legacy) → SATD 신호 손실
5. coverage threshold 단일값 강제 → ratchet 옵션 부재 시 legacy 0.43 fail
6. Gherkin tag 미사용 → traceability 단일축 (intent_classification.type 만)

---

## 10. 본체 자산 매핑

- `methodology-spec/deliverables/23-characterization-spec.md`
- `schemas/characterization-spec.schema.json` (★ 30번째)
- `skills/analysis-characterization-test/SKILL.md` (★ skills 19 → 20)
- `tools/characterization-coverage-validator/` (★ workspace 13번째)
- `flows/analysis.phase-flow.{json,mermaid}` v2.1.0
- ADR-CHAIN-006 phase 4.7 정식 도입
- DEC-2026-05-07-poc-06-종결 (corroboration #1 / Legacy)
- DEC-2026-05-07-poc-07-poc03-phase7-retrofit (corroboration #2 / Modern)
