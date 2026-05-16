# 산출물 #5: 비즈니스 규칙 (Business Rules)

> **사상**: DDD-Lite (ADR-004) + 4영역 추출 (DB / FE / 설정 / 외부)
> **schema**: `schemas/rules.schema.json` · **template**: `templates/rules.template.md`
> **생성 phase**: `business-logic` phase (`/analyze-business-logic`)

---

## 1. 목적

**답하는 질문**: "이 시스템에는 어떤 정책·규칙이 있는가?"

**AI 재구현 시 활용**: Given/When/Then 테스트 자동 생성 / 검증 로직 재구현

> ⚠️ **비즈니스 규칙은 7대 산출물 중 신뢰도가 가장 낮다.** 코드에는 What 만 있고 Why 는 없기 때문. 사람 검토 게이트 강제.

---

## 2. 형식

```
output/rules/
├── rules.json                     # AI용 (구조화, Given/When/Then)
├── rules.md                       # 사람용 카탈로그
├── state-diagrams/                # 상태 다이어그램 (있을 경우)
│   └── order-status.mermaid
└── conflicts.md                   # 규칙 간 충돌 보고서 (있을 경우)
```

### 2.1 Given/When/Then 형식 (핵심)

```yaml
- id: BR-ORDER-CANCEL-001
  name: "주문 상태별 취소 가능 여부"
  given:
    - "주문이 존재함"
  when:
    - "Order.cancel() 호출 시"
    - "POST /orders/{id}/cancel 요청 시 (UC-ORDER-002)"
  then:
    - "status 가 PENDING 또는 PAID 여야 함"
    - "그 외 상태면 IllegalStateException"

  rationale: "이미 발송된 주문은 취소할 수 없음"
  extracted_area: "5.A DB"
  source: src/main/java/com/example/order/Order.java:45
  confidence: 0.80
  extraction_method: pattern_matching
  human_review_required: false
```

---

## 3. 추출 범위

### 3.1 추출 4영역 (출처 / 방법 / 신뢰도)

비즈니스 규칙은 코드 한 곳에 있지 않다. 4개 영역에서 병렬 추출:

| 영역 | 추출 대상 | 방법 | 신뢰도 |
|---|---|---|---|
| **5.A DB CHECK 제약** | DB CHECK / UNIQUE / Trigger | 결정적 | 0.85 |
| **5.A SQL CASE 정책** | SQL CASE / WHERE 분기 | LLM 추론 | 0.65 |
| **5.A ORM 메서드 가드** | ORM 메서드 안 가드 절 | 결정적 + LLM | 0.80 |
| **5.B FE validation** | 폼 schema (yup/zod) | 결정적 | 0.85 |
| **5.B FE 권한 분기** | 라우팅 가드 + UI 분기 | LLM 추론 | 0.70 |
| **5.C 설정 매직 넘버** | application.yml / Feature Flag | 결정적 | 0.80 |
| **5.D 외부 정책** | 외부 서비스 정책 (PG 한도, SMS 제한 등) | LLM 추론 | 0.50 |

**평균**: ~50% (소스만), ~75% (여러 출처)
**입력**: 소스 코드 + 설정 파일 + (선택) 외부 서비스 문서

### 3.2 미추출 (의도적)

- 비즈니스 로직의 "왜?" (코드에는 What 만 있음) → 사람 검토로 보완
- 암묵지 (문서화 안 된 규칙) → domain-context.md grounding 으로 부분 보완

---

## 4. 검증 체크리스트

```
□ rules.json schema 검증 통과
□ 모든 BR 에 ID 표준 (BR-{도메인}-{이름}-{번호}) 적용
□ Given/When/Then 형식 준수
□ 추출 영역 (5.A/5.B/5.C/5.D) 명시
□ human_review_required 항목 사용자 검토 완료
□ FE-BE 검증 중복/누락 → 안티패턴(#6) 에 등록
□ 상태 다이어그램 Mermaid 렌더링 (있을 경우)
□ 규칙 간 충돌 검토
□ ★ v4.0.1 — auto_extracted=true BR 은 source_grounded_evidence 또는 source_evidence 의무 (if/then schema enforcement)
□ ★ v4.0.1 — intent_vs_bug_classification 채움 시 characterization-spec.intent_classification.type 와 정합 (cross-stage)
□ ★ v4.1.0 — is_intent + intent_vs_bug_classification 둘 다 보유 시 is_intent=true ⇔ classification='intent' 정합 (if/then schema enforcement)
□ ★ v4.1.0 — cross_consistency_check 기록 시 generated_by provenance + heavy 데이터는 layer-2-results/ 분리 (slim marker only)
```

### 4.1 ★ v4.0.1 schema enforcement 강화 (DEC-2026-05-17 / ADR-CHAIN-011 §5 patch v8)

**③ source-grounded enforcement** — AI 자동 추출 BR (auto_extracted=true) 은 schema 안 if/then 으로 source 인용 의무. 사람 작성 BR optional 보존. Industry case 정합 (Semgrep + CodeQL + SonarQube + Daikon 4/4 모두 source location required 또는 degraded-without).

**⑥ intent_vs_bug_classification (cross-stage SSOT)** — schemas/intent-classification.schema.json 의 enum 4종 (intent / bug / ambiguous / self_recognized) 을 본 BR + characterization-spec scenario 양쪽이 $ref 의무. drift-validator cross-schema enum 정합 check 통과 의무.

```yaml
# v4.0.1 예시
- id: BR-USER-DATA-001
  name: "이메일 중복 ❌"
  natural_language: "사용자 등록 시 이메일은 시스템 내 유일해야 한다."
  given: ["기존 사용자 존재"]
  when: ["동일 이메일 신규 등록 시도"]
  then: ["409 Conflict"]
  auto_extracted: true                         # ★ v4.0.1
  source_grounded_evidence:                    # ★ v4.0.1 if/then required (auto_extracted=true)
    file: "source/src/user.legacy.ts"
    line_range: "10-15"
    grep_hit_count: 0
    grep_query: "users.find\\(.*email"
  intent_vs_bug_classification: "bug"          # ★ v4.0.1 신설 / characterization-spec 정합
  is_intent: false                             # ★ legacy alias / classification 와 cross-consistency
  current_state_note: "legacy source 결함 — register() 중복 검사 미수행"
```

### 4.2 ★ ★ v4.1.0 Phase 2 ⑤ — cross_consistency_check + 동치 enforcement (DEC-2026-05-17-phase-2-5 / ADR-CHAIN-011 §5 patch v12)

**⑤ cross_consistency_check (slim provenance-tagged marker)** — Layer 1+2 cross-validation 결과의 BR 단위 추적성 marker. ★ heavy 실행 데이터(per-BR rationale·score dump)는 `tools/br-cross-consistency-validator/layer-2-results/poc-NN-layer-2-results.json` 분리 보존 (SARIF·Semgrep·OPA·Spectral 산업 표준) / BR 안 inline = rule 의 '서술적 속성' 영역 한정 (Semgrep `metadata:` 패턴). optional / additionalProperties:false.

**is_intent ⇔ intent_vs_bug_classification 양방향 동치 enforcement** — 둘 다 보유 시 schema if/then 으로 `is_intent=true ⇔ classification='intent'` 강제 (PoC #08 echo-chamber drift 차단 / LL-i-47·51). 단방향·미보유 BR = vacuous (실측 both=0 → 전 PoC 회귀 풀이 0 수학 보장).

```yaml
# v4.1.0 추가 예시 (위 BR-USER-DATA-001 확장 — is_intent=false ⇔ classification≠'intent' 정합)
  cross_consistency_check:                       # ★ v4.1.0 신설 / optional / additionalProperties:false
    generated_by: "br-cross-consistency-validator@0.2.0"   # ★ provenance discriminator (Senior 조건 1)
    layer: 2
    layer2_model: "claude-sonnet-4-6"
    layer2_semantic_score: 0.58
    verdict: "classification_drift"              # ★ enum: consistent|inconsistent|ambiguous|classification_drift|skipped
    intent_classification_preserved: false       # ★ ★ 분류 보존 강제 핵심
    classification_drift_detected: true
    classification_drift_reason: "GWT synthesis dropped is_likely_bug=true → normalized as business rule"
    external_result_ref: "tools/br-cross-consistency-validator/layer-2-results/poc-08-layer-2-results.json"
    checked_at: "2026-05-17T00:00:00Z"
```

---

## 5. 산출물 간 참조

| 방향 | 의미 |
|---|---|
| RULES → API | x-related-rules 검증 |
| RULES → DOM | Invariants ↔ 도메인 로직 |
| RULES → DB | CHECK / UNIQUE 매핑 |
| RULES → AP | FE-BE 중복 등록 |

---

## 6. 흔한 함정

### 6.1 API description 에 정책 박기
- 증상: OpenAPI description 에 비즈니스 정책 상세 기술
- 대응: 정책은 BR-XXX 로 분리, API 는 `x-related-rules` 로 참조만

### 6.2 FE-BE 검증 불일치
- 증상: FE 에서 max=100 인데 BE 에서 max=50
- 대응: AP-VALIDATION-MISMATCH-XXX 등록

### 6.3 매직 넘버 의미 불명
- 증상: `if (age >= 19)` — 왜 19 인지 코드만으로 알 수 없음
- 대응: BR 에 등록 + human_review_required=true + rationale 비워둠
