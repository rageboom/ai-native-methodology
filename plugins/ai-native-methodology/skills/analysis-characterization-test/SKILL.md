---
name: analysis-characterization-test
description: Use when project has analysis output (business-rules.json + antipatterns.json) AND user invokes "characterization" or "intent-vs-bug" or "snapshot golden" or "behavior preserve" task. Generates characterization-spec.json (산출물 23). Michael Feathers Characterization Testing 정합 + Specification by Example (Gojko Adzic) Given/When/Then BDD + SATD/KL-SATD self_recognized 분류. Single prompt — Legacy (Spring/iBATIS/JSP) + Modern (NestJS/Spring Boot 3+/Express) 두 spectrum 모두에서 동작 (≥ 2 PoC corroboration 입증). Stage = analysis, manifest phase = 4.7.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-characterization-test — 의도 vs 버그 분리 + Given/When/Then snapshot acceptance oracle

phase 4.7 산출물. ≥ 2 PoC corroboration 의무 (Legacy + Modern 두 spectrum).

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md`. (persona 시뮬 = 신뢰도 -5%p.)

- ✅ 실 코드 grep + 코드 자조 코멘트 search 의무
- ✅ ambiguous 영역 → 도메인 expert (사용자 본인 또는 IFRS 회계 / DBA / 기획자) 결단 강제 (carry 명시)
- ✅ 실 환경 (DB 접속) 부재 시 `data_source_status: "code_only"` + 도메인 expert carry 의무

## 사전 조건

- analysis output 존재 — business-rules.json (phase 4) + antipatterns.json (phase 6 / phase 4 partial)
- (권장) formal-spec (phase 4.5 / state-machine + decision-table)
- 도메인 expert 인터뷰 가능 OR carry 명시 의무 (ambiguous > 0 시)

## 절차 (단일 prompt 양 spectrum / Cursor/Cline/Aider 표준 정합)

### 1. business-rules.json + antipatterns.json read

```bash
cat .aimd/output/business-rules.json | jq '.business_rules | length'
cat .aimd/output/antipatterns.json | jq '.antipatterns | length'
```

### 2. 4 분류 — intent / bug / ambiguous / self_recognized

각 BR / AP 마다 4 분류 매핑:

| 분류                | 정의                                                                                                                    | 처분                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **intent**          | 비즈니스 의도 — 새 시스템에서도 동일 동작 보존 의무                                                                     | snapshot 그대로 통과                |
| **bug**             | 명확한 결함 — 새 시스템에서 의도적 다른 결과 (modern_alternative)                                                       | snapshot.behavior_likely_bug        |
| **ambiguous**       | 도메인 expert 결단 의무 (carry)                                                                                         | 결단 전까지 chain 4 진입 ❌         |
| **self_recognized** | 코드 자조 코멘트 (TODO/FIXME/HACK/XXX/"폐해"/"임시"/"나중에"/"폐기") — SATD/KL-SATD 학술 정식 (Maldonado & Shihab 2015) | bug 자동 처분 + 자조 위치 명시 의무 |

### 3. self_recognized 자조 코멘트 grep 의무 (Modern 환경에서 0 도 정합)

```bash
grep -rn -E "TODO|FIXME|HACK|XXX|폐해|임시|나중에|폐기|deprecate|workaround" <src>/ \
  --include="*.java" --include="*.ts" --include="*.tsx" --include="*.kt" --include="*.py" \
  --include="*.xml" --include="*.jsp"
```

0건 = Modern 스택 자연 부재 — §8.1 strict overfitting ❌. `intentVsBug.self_recognized_grep_count: 0` 명시 + carry note "Modern 스택 자연 부재 정합".

### 4. snapshot Given/When/Then 작성 (1 UC 당 1 snapshot 권장)

```yaml
snapshot_id: 'SNAP-UC-USER-SIGNUP-001'
use_case: 'UC-USER-SIGNUP-001' # discovery-spec UC ↔ link 의무
feature: 'User Signup' # (Cucumber Gherkin / optional)
endpoint: 'POST /api/users'
controller_method: 'UserController.create'
service_method: 'UserService.create'
layer: 'integration'
data_source_status: 'code_only' # code_only 시 도메인 expert carry 의무
scenarios:
  - id: 'SCN-SIGNUP-001'
    name: 'happy path — 신규 user 등록'
    tags: ['@happy', '@intent'] # (Gherkin tag / dual encoding)
    given: { request_body: { ... }, state_before: '...' }
    when: 'POST /api/users → ValidationPipe → ...'
    then:
      { expected_response: { status: 201, body: { ... } }, state_after: '...' }
    intent_classification:
      - rule: 'BR-USER-EMAIL-FORMAT-001'
        type: 'intent'
    behavior_to_preserve: ['validation 4종', 'JWT 응답']
    behavior_likely_bug: ['DB UQ 부재 race window']
```

권장 scenario 수: happy + edge 1~2 + likely_bug 1~2.

### 5. coverage matrix + ratchet 정책

```yaml
coverage:
  matrix:
    - uc: 'UC-USER-SIGNUP-001'
      snapshot: '✅'
      covered_by: ['SNAP-UC-USER-SIGNUP-001 / 3 scenario']
    - uc: 'UC-ARTICLE-CREATE-001'
      snapshot: '❌'
      scope_decision: 'carry'
  coverage_target: 0.80 # default (PIT/Stryker/BullseyeCoverage 산업 표준)
  coverage_minimum_legacy: 0.40 # ratchet 진입점
  coverage_strategy: 'absolute' # absolute (default) | ratchet
  trend_required: false # ratchet 시 true 의무
```

### 6. Modern vs Legacy hint (자연어 한 줄 / 분기 ❌)

skill prompt 분기 ❌ (Cursor/Cline/Aider 표준 / YAGNI). 단, 자연어 hint 한 줄로 환경 차이 인식:

- **Legacy 의심 신호** (자조 코멘트 ↑ / 적대성 4중 / 표준프레임워크 / iBATIS / JSP) → ambiguous ↑ 가능성 → 도메인 expert carry 의무 강조
- **Modern 의심 신호** (TODO/FIXME 0~소수 / class-validator / TypeORM / clean architecture) → 명확 분류 비율 ↑ 가능성 → ambiguous = 0 정합

사용자가 "legacy" / "modern" 라벨 직접 부착 ❌ — AI 가 코드 스캔 결과 (TODO 빈도 + framework 버전 + test 부재) 로 자동 추정.

### 7. ambiguous 처리 (도메인 expert 결단 강제)

ambiguous > 0 시:

1. `ambiguous_carry` 배열에 `rule_id` + `carry_owner` (domain_expert / dba / planner / qa) + `carry_reason` 명시 의무
2. snapshot 의 해당 scenario `behavior_likely_bug` 또는 `behavior_to_preserve` 둘 중 최소 하나 명시
3. chain 4 (impl-spec GREEN) 진입 ❌ — 결단 전까지 차단

### 8. characterization-spec.json 작성

`schemas/characterization-spec.schema.json` 정합. 4 sub-section (meta_confidence + snapshots + intent_vs_bug + coverage).

```bash
node ../../tools/schema-validator/src/cli.js .aimd/output/characterization/
# Expect: characterization-spec.json valid + ratchet if/then + ambiguous if/then 모두 통과
```

### 9. characterization-coverage-validator 실행

```bash
# 기본 (absolute 또는 ratchet 첫 측정)
node ../../tools/characterization-coverage-validator/src/cli.js \
  --target .aimd/output/characterization/ \
  --threshold 0.80

# ratchet trend 자동 검증 (coverage_strategy=ratchet + trend_required=true 인 경우)
node ../../tools/characterization-coverage-validator/src/cli.js \
  --target .aimd/output/characterization/ \
  --coverage-baseline .aimd/baseline/characterization-coverage.json \
  [--write-coverage-baseline]    # legacy 첫 진입 시 / trend pass 후 갱신 시
# Expect: snapshot 4 필수 필드 / intent_classification.type enum / named_classified_ratio ≥ 0.80 / coverage strategy 검증 통과 / ratchet trend ≥ baseline (regression 차단)
```

## 산출물

- `<user-project>/.aimd/output/characterization/characterization-spec.json` (산출물 23 / 통합 entry — `intent_vs_bug` 객체 + `snapshots[].intent_classification` 에 분류 통합 / 구 intent-vs-bug.md 사람-눈 twin 폐지)
- `<user-project>/.aimd/output/characterization/coverage.json`
- `<user-project>/.aimd/output/characterization/snapshots/UC-*.json`

## chain 1 입력 보강

phase 4.7 산출물 = chain 1 (discovery-spec) 입력 핵심:

- intent 분류 BR → use_cases 의무 보존
- bug 분류 AP → modern_alternative 적용
- ambiguous → discovery-spec carry / 결단 전 chain 2 진입 ❌
- self_recognized → SATD 처분 (자조 위치 새 시스템에서 자동 fix)

## 외부 권위 출처

- Michael Feathers, _Working Effectively with Legacy Code_ (2004) §13 Characterization Testing
- Gojko Adzic, _Specification by Example_ (2011) — Given/When/Then BDD
- Cucumber Gherkin Reference (https://cucumber.io/docs/gherkin/reference/)
- Maldonado & Shihab — Self-Admitted Technical Debt (SATD/KL-SATD)
- PIT (PITest) / Stryker Mutator — coverage threshold 80% 산업 표준
- BullseyeCoverage — minimum coverage gate
- jest-coverage-ratchet (npm) — legacy ratchet pattern

## 흔한 함정 (deliverable §11 정합)

1. Legacy DB 환경 부재 → `data_source_status: "code_only"` + 도메인 expert carry 의무
2. ambiguous 분류 회피 → 모든 BR/AP 를 intent/bug 양 극단 분류 시 결단 미뤄질 carry 누락
3. scenario 수 과다 → 1 UC 당 ≤ 5 scenario 권장
4. self_recognized grep 누락 (Legacy) → SATD 신호 손실
5. coverage threshold 단일값 강제 → ratchet 옵션 부재 시 legacy 0.43 fail
6. Gherkin tag 미사용 → traceability 단일축 (intent_classification.type 만)

## 인용

- 정책: methodology-spec/deliverables/23-characterization-spec.md
- schema: schemas/characterization-spec.schema.json
- 도구: tools/characterization-coverage-validator/
- flow: flows/analysis.phase-flow.json (phase 4.7 entry)
- ADR: ADR-CHAIN-006 (phase 4.7 도입)
- ADR: ADR-011 (json 단독 / twin 폐지)
- ADR: ADR-009 (5단계 신뢰도 모델)
- 결단: DEC-2026-05-07-poc-06-종결
- 결단: DEC-2026-05-07-poc-06-domain-결단
- 결단: DEC-2026-05-07-poc-07-poc03-phase7-retrofit
