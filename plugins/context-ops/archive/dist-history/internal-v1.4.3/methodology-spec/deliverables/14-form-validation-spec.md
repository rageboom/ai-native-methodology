# 산출물 #14: Form Validation Spec ( v1.4 Stage 7-pre 신설)

> **사상**: ADR-FE-005 §2.1.1 (Zod 매개체 13 채택) + ADR-FE-006 (L1 Domain framework-neutral IR) + 외부 LLM 검증 빈틈 #1 해소
> **schema**: `schemas/form-validation-spec.schema.json`
> **생성 phase**: Phase 5-2-b (`/analyze-state` 의 sub) 또는 별도 `/analyze-form-validation`

---

## 1. 목적

**답하는 질문**: "form validation 규칙은 어떤 라이브러리로 어떻게 정의되었나? rules.json `fe_validation` BR 자동 추출은?"

**AI 재구현 시 활용**: Zod / Yup / RHF rules → BR 자동 변환 / 신규 시스템 구축 시 즉시 활용

### 1.1 deliverable 5 (rules) / 8 (state-map) 와의 분담

| 산출물                                  | 영역                                                       |
| --------------------------------------- | ---------------------------------------------------------- |
| **#5 rules**                            | BR (Given/When/Then) — fe_validation 포함 통합 BR 카탈로그 |
| ** #14 form-validation-spec** (본 문서) | form validation 라이브러리 → BR 자동 추출 source           |
| **#8 state-map**                        | form_state (5 진실 #4) — 진실 source 정합                  |

→ form-validation-spec → rules.json `category=fe_validation` BR 자동 등록 + auto_extracted=true 표기.

---

## 2. 형식

```
output/form-validation/
├── form-validation-spec.json   # AI 눈
├── br-auto-extracted.md        # rules.json 자동 등록된 BR 목록
└── _manifest.yml
```

---

## 3. 추출 범위 (출처 / 도구 / 신뢰도)

| 항목                          | 출처                                               | 도구                      | 신뢰도 (단계 5) |
| ----------------------------- | -------------------------------------------------- | ------------------------- | --------------- |
| source_libraries              | package.json + import 그래프                       | 결정적                    | 95%             |
| validations ( Zod)            | `z.object()` / `.min()` / `.email()` / `.refine()` | ts-morph 진짜 실행        | 90%             |
| validations (Yup / Joi)       | `yup.object()` / `Joi.string()`                    | ts-morph / babel-traverse | 85%             |
| validations (RHF)             | `rules: { required, minLength, pattern }`          | LLM 추론 + ts-morph       | 75%             |
| validations (class-validator) | `@IsEmail() / @MinLength(8)` decorator             | decorator metadata        | 95%             |
| framework_coupled detection   | RHF `Controller.rules` / Vue `useField.rules`      | LLM 추론                  | 70%             |
| BR 자동 등록                  | F-VAL-_ → BR-_ 변환                                | 결정적                    | 90%             |

**입력**: FE 소스 + (선택) BE class-validator decorator
**no-simulation 정책**: simulation 시 -5%p 패널티 + simulation_reason 의무

### 3.1 미추출 (의도적)

- runtime validation 결과 (실제 form submit 시 fail rate) — 운영 영역
- validation 우회 path — 정적 분석 한계 / static-security-spec 영역

---

## 4. rules.json `fe_validation` BR 자동 등록 절차

```yaml
# Step 1: form-validation-spec.json 추출
F-VAL-LOGIN-EMAIL-001:
  field_name: email
  validation_type: email
  source_format: zod
  rule_value: null
  error_message: 'Invalid email'

# Step 2: rules.json 자동 등록 (BR-* ID 부여)
BR-FE-LOGIN-EMAIL-001:
  category: fe_validation # Stage 3-2 enum
  source_format: zod # Stage 7-pre 신규
  auto_extracted: true # Stage 7-pre 신규
  auto_extraction_source_id: F-VAL-LOGIN-EMAIL-001
  given:
    - '사용자가 로그인 form 의 email field 에 값 입력'
  when:
    - 'form submit 트리거'
  then:
    - 'email 형식 validation 통과 의무'
    - "fail 시 'Invalid email' 메시지 노출"

# Step 3: form-validation-spec.cross_links → rules.json BR cross-link
cross_links:
  - {
      from_validation: F-VAL-LOGIN-EMAIL-001,
      to_artifact: rules,
      to_id: BR-FE-LOGIN-EMAIL-001,
      link_type: auto_extracted_to_br,
    }
```

→ rules.json `auto_extracted=true` BR 은 FE 코드 변경 시 자동 갱신 가능 (사람 작성 BR 과 분리 운영).

---

## 5. cross-link

```yaml
cross_links:
  - { to_artifact: rules, link_type: auto_extracted_to_br } # 자동 BR 등록
  - { to_artifact: state-map, link_type: validates_form_state } # form_state 진실
  - { to_artifact: ui-spec, link_type: validates_field } # form field
  - { to_artifact: type-spec, link_type: type_constrains } # Zod ↔ TS 타입
  - { to_artifact: antipatterns, link_type: registers_as_antipattern }
```

---

## 6. 신뢰도 (ADR-009 §2.4 정합)

| 단계 | 조건                                                     | 신뢰도                 |
| ---- | -------------------------------------------------------- | ---------------------- |
| 1    | 코드 정적 추출 (LLM)                                     | 60-70%                 |
| 3    | + drift-validator (form-validation ↔ rules.json BR 정합) | 78-85% (Stage 5+ 검토) |
| 5    | + ts-morph 진짜 실행 + 5종 물증                          | 85-92%                 |

---

## 7. 검증 체크리스트

```
□ schema 검증 통과
□ source_libraries 명시 (≥ 1 항목)
□ Zod 사용 시 zod = primary 표기 (ADR-FE-005 매개체 13)
□ 모든 validation 에 id / field_name / validation_type / source_format 명시
□ framework_coupled=true 시 신규 스택 정해진 후 재추출 의무 표기
□ cross_link_to_br 명시 (rules.json fe_validation BR 자동 등록)
□ summary.br_auto_extraction_count 정량
□ summary.captured_by ∈ [static_extraction, ts_morph_real, babel_traverse_real]
□ simulation 시 simulation_reason 의무
```

---

## 8. 산출물 간 참조

| 방향       | 의미                                                               |
| ---------- | ------------------------------------------------------------------ |
| FV → Rules | auto_extracted_to_br ( 핵심)                                       |
| FV → SM    | validates_form_state                                               |
| FV → UI    | validates_field                                                    |
| FV → TS    | type_constrains ( Zod ↔ TS 타입 정합 — `z.infer<typeof schema>`)   |
| FV → AP    | registers_as_antipattern ( FE-only validation 시 BE 누락 안티패턴) |

---

## 9. 흔한 함정

### 9.1 Zod refine framework-coupling

- 증상: `.refine((data) => data.useReactHook(...))` 같이 React 훅 호출
- 대응: refine 함수 framework-neutral 의무 (순수 함수만)

### 9.2 RHF rules client-only

- 증상: `register('email', { required, pattern })` 만 / BE 검증 부재
- 대응: AP-FE-VALIDATION-MISSING-BE 자동 등록 (BR `category=fe_validation` only / BE 누락)

### 9.3 class-validator decorator BE+FE 혼합

- 증상: `@IsEmail()` decorator 가 BE NestJS DTO + FE class 양쪽에 적용
- 대응: source_format=class_validator 명시 + extracted_from_area 양쪽 표기

### 9.4 framework_coupled 누락

- 증상: RHF rules / Vue useField.rules 를 framework-neutral 으로 추출
- 대응: schema framework_coupled=true 의무 → 신규 스택 정해진 후 재추출

### 9.5 BR ID 충돌

- 증상: 자동 등록 BR ID 가 사람 작성 BR ID 와 충돌
- 대응: 자동 등록 prefix `BR-FE-*` 사용 + auto_extracted=true 분리 운영
