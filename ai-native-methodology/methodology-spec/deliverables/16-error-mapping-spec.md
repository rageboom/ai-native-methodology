# 산출물 #16: Error Mapping Spec

> **schema**: `schemas/error-mapping-spec.schema.json`
> **생성 phase**: `api` phase
> **skill**: `skills/analysis-error-mapping/SKILL.md`

---

## 1. 목적

**답하는 질문**: "BE 도메인 예외 → HTTP status code mapping contract 어떤 것이 있는가? contract 부재 시 어떤 negative-space evidence 가 자동 검출 가능한가?"

**AI 재구현 시 활용**: 신규 BE 스택 (Spring / NestJS / Express / FastAPI / Ktor) ↔ 도메인 예외 contract 자동 매핑 / AP-API-001 자동 회귀 도구 신규 시스템 적용 의무 명시.

### 1.1 framework_neutrality_score (핵심 metric)

exception_class × http_status × mapping_mechanism axis 의 framework-neutral 추출 정량:

- **1.0** = exception 도메인 의미 + HTTP status code 가 framework 무관 표준 (RFC 7231 / 9110 / OWASP API Top 10 정합) → 신규 스택 즉시 활용
- **0.0** = framework-specific mechanism 단독 인용 (예: `@ControllerAdvice` = Spring 한정) → 신규 스택 정해진 후 mechanism 재매핑 의무

negative-space evidence = framework_neutrality_score 산정 차단 ❌ (evidence 는 framework-neutral 영역 / RFC + OWASP 영역 정합).

---

## 2. 형식

```
output/error-mapping-spec/
├── error-mapping-spec.json           # AI 눈 / schema 정합
├── error-mapping-spec.md             # 사람 눈 / 표 정합
├── tool-runs/
│   ├── error-mapping-<timestamp>.sarif  # Semgrep raw 출력
│   └── error-mapping-<timestamp>.log    # stdout / stderr
└── baseline/
    └── error-mapping-baseline.json   # baseline + ratchet (legacy 첫 진입 시점)
```

---

## 3. 추출 범위 (출처 / 도구 / 신뢰도)

| 항목                                   | 출처                                                                                                | 도구                                       | 신뢰도 (단계 5)                |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------ |
| scope.framework                        | inventory.json tech_stack.backend                                                                   | 결정적                                     | 95%                            |
| controllers_scanned / services_scanned | grep `@RestController` / `@Controller` / NestJS `@Controller`                                       | 결정적                                     | 95%                            |
| exception_handlers                     | grep `@ControllerAdvice` / `@RestControllerAdvice` / `@ExceptionHandler` / `@Catch` / `@UseFilters` | Semgrep custom rule + grep                 | 90-95%                         |
| http_status_mapping                    | exception_class × http_status × mapping_mechanism axis                                              | Semgrep custom rule + LLM (mechanism 분류) | 85-90%                         |
| **negative_evidence**                  | 0 hit grep + 0 match Semgrep                                                                        | 결정적                                     | 95% (정식 evidence)            |
| framework_neutrality_score             | exception/status/mechanism axis 의 framework 무관 정량                                              | 결정적                                     | 95%                            |
| baseline / ratchet                     | baseline + ratchet                                                                                  | 결정적 + baseline 파일                     | 100%                           |

**입력**: BE 소스 + inventory.json tech_stack.backend
**no-simulation 정책**: AI sub-agent persona simulation ❌ / Semgrep custom rule 실 실행 의무 (단계 5)

### 3.1 미추출 (의도적)

- runtime exception flow (try/catch 동적 흐름 / 정적 분석 한계 / characterization-spec 영역)
- generic `RuntimeException` / `Exception` catch-all 분류 (throw_unmapped 영역 / contract ❌)
- 사용자 정의 status code (RFC 표준 외 / framework-specific)

---

## 4. negative-space evidence 4종

negative_evidence 는 4 sub-field 의무:

```yaml
negative_evidence:
  contract_absent:
    evidence_type: grep_zero_hit | ast_zero_match | ts_morph_zero_decorator | manual_review
    details: "예: 'grep -r @ControllerAdvice → 0 hit / Spring 2.5'"
  negative_effect: "예: '도메인 예외 → 500 leak / spec/runtime drift / API 사용자 의도 ❌'"
  industry_standard:
    - 'RFC 7231 §4.2.2'
    - 'RFC 9110 §15.3'
    - 'Spring docs / NestJS docs'
    - 'OWASP API Top 10 (2023)'
  automatic_regression_capable:
    tool: semgrep_custom_rule
    rule_path: tools/static-runner/rules/error-mapping-missing.yml
    rule_id: internal.be.api.error-mapping-generic-exception-in-service
```

negative_evidence 의 4 sub-field 모두 필수 (정식 evidence axis 완전성 의무).

---

## 5. cross-link

```yaml
cross_links:
  - { to_artifact: api, link_type: maps_exception_to_status } # OpenAPI responses[].status ↔ exception_class
  - { to_artifact: domain, link_type: domain_exception_origin } # E-XXX 도메인 예외 발생 영역
  - { to_artifact: rules, link_type: violation_triggers_exception } # BR 위반 → exception mapping
  - { to_artifact: antipatterns, link_type: AP-API-001_trigger } # throw_unmapped ≥ 1 / decorator_drift ≥ 1
  - { to_artifact: legacy-spectrum, link_type: legacy_handler_pattern } # legacy framework 별 handler 패턴 (framework_neutrality)
```

---

## 6. 신뢰도

| 단계  | 조건                                                | 신뢰도     |
| ----- | --------------------------------------------------- | ---------- |
| 1     | LLM 추론 만                                         | 50-60%     |
| 3     | + grep 정적 분석                                    | 70-78%     |
| 4     | + Semgrep custom rule 실 실행                       | 85-90%     |
| **5** | + baseline + ratchet + 5종 물증 7 필드          | **90-95%** |

단계 5 의무 (no-simulation 정책 강제).

---

## 7. AP-API-001 자동 회귀 도구

핵심 = "negative-space evidence 자동 회귀 가능".

### 7.1 Spring rule (`internal.be.api.error-mapping-generic-exception-in-service`)

```yaml
rules:
  - id: internal.be.api.error-mapping-generic-exception-in-service
    message: |
      Service 영역 안 generic Exception throw → @ControllerAdvice 부재 시 500 leak.
      negative-space evidence trigger.
    languages: [java]
    severity: WARNING
    pattern: |
      throw new RuntimeException(...)
```

### 7.2 NestJS rule (`internal.be.api.error-mapping-nestjs-delete-201-decorator-drift`)

```yaml
rules:
  - id: internal.be.api.error-mapping-nestjs-delete-201-decorator-drift
    message: |
      @Delete + @ApiResponse({status: 201}) decorator drift → API 사용자 의도 위반.
      negative-space evidence trigger.
    languages: [typescript]
    severity: WARNING
    pattern-either:
      - pattern: |
          @Delete(...)
          @ApiResponse({status: 201, ...})
      - pattern: |
          @Put(...)
          @ApiResponse({status: 201, ...})
```

### 7.3 CI 통합 (`.github/workflows/drift-check.yml`)

body scan step + custom rule extra-rules 자동 통합 (jwt-rsa-custom-rule 패턴 정합).

---

## 8. 검증 체크리스트

```
□ schema 검증 통과 (Ajv 8 strict mode)
□ scope.framework / modules / controllers_scanned 명시
□ exception_handlers 배열 (빈 배열 = negative-space evidence trigger)
□ http_status_mapping = exception_class × http_status × mapping_mechanism 명시
□ negative_evidence 4 sub-field 의무 모두 채움
□ framework_neutrality_score 명시 (0.0~1.0)
□ 진짜 Semgrep custom rule 실 실행 (5종 물증 7 필드)
□ baseline + ratchet 정합 (legacy 첫 진입 시 baseline 작성 / CI run = ratchet)
□ AP-API-001 ≥ 1 등재 의무 (throw_unmapped ≥ 1 또는 decorator_drift ≥ 1 시)
□ chain harness validated §8.1 strict 본질 보존
```

---

## 인용

- schema: `schemas/error-mapping-spec.schema.json`
- skill: `skills/analysis-error-mapping/SKILL.md` (사상 origin)
- rule: `tools/static-runner/rules/error-mapping-missing.yml` (Spring + NestJS sub-rule 2종)
- ADR: ADR-BE-001 (negative-space corroboration 정식화)
- ADR: ADR-FE-007 (positive-space sister)
- ADR: ADR-009 (5단계 신뢰도 / 진짜 도구 의무)
- ADR: ADR-010 (baseline + ratchet)
- 결단: DEC-2026-04-29-static-tool-실행-의무화
- 결단: DEC-2026-05-02-jwt-rsa-custom-rule (negative-space rule 패턴 origin)

### 외부 권위 출처

- RFC 7231 §4.2.2 + RFC 9110 §15.3 (HTTP status 산업 표준)
- OWASP API Top 10 (2023) (API 보안 산업 표준)
- Spring docs (`@ControllerAdvice` / `@ExceptionHandler`)
- NestJS docs (`@Catch` / `ExceptionFilter`)
