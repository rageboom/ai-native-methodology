# 산출물 #16: Error Mapping Spec (★ v1.5.0 신설 — BE error contract 자동 추출)

> **사상**: ADR-BE-001 (negative-space corroboration 정식화) + ADR-FE-007 (positive-space sister) + ADR-009 (5단계 신뢰도 / 진짜 도구 의무) + ADR-010 (baseline + ratchet)
> **schema**: `schemas/error-mapping-spec.schema.json`
> **생성 phase**: `api` phase
> **skill**: `skills/analysis-error-mapping/SKILL.md`

---

## 1. 목적

**답하는 질문**: "BE 도메인 예외 → HTTP status code mapping contract 본격 어떤 것이 있는가? 본격 contract 부재 시 어떤 negative-space evidence 가 본격 자동 검출 가능한가?"

**AI 재구현 시 활용**: 신규 BE 스택 (Spring / NestJS / Express / FastAPI / Ktor) ↔ 도메인 예외 contract 본격 자동 매핑 / 본격 ★ ★ AP-API-001 자동 회귀 도구 본격 신규 시스템 적용 의무 명시.

### 1.1 framework_neutrality_score (★ 핵심 metric)

ADR-BE-001 정합 — exception_class × http_status × mapping_mechanism axis 본격 framework-neutral 추출 정량:

- **1.0** = exception 도메인 의미 + HTTP status code 본격 framework 무관 표준 (★ RFC 7231 / 9110 / OWASP API Top 10 정합) → 신규 스택 즉시 활용
- **0.0** = framework-specific mechanism 단독 인용 (예: `@ControllerAdvice` 본격 Spring 한정) → 신규 스택 정해진 후 mechanism 본격 재매핑 의무

★ ★ negative-space evidence = framework_neutrality_score 산정 본격 차단 ❌ (★ 본격 evidence 본격 framework-neutral 영역 본격 / RFC + OWASP 영역 정합).

---

## 2. 형식

```
output/error-mapping-spec/
├── error-mapping-spec.json           # AI 눈 / schema 정합
├── error-mapping-spec.md             # ★ 사람 눈 / 표 본격 정합
├── tool-runs/
│   ├── error-mapping-<timestamp>.sarif  # ★ Semgrep raw 출력
│   └── error-mapping-<timestamp>.log    # ★ stdout / stderr
└── baseline/
    └── error-mapping-baseline.json   # ★ ADR-010 baseline (★ legacy 첫 진입 시점)
```

---

## 3. 추출 범위 (출처 / 도구 / 신뢰도)

| 항목 | 출처 | 도구 | 신뢰도 (단계 5) |
|---|---|---|---|
| scope.framework | inventory.json tech_stack.backend | 결정적 | 95% |
| controllers_scanned / services_scanned | grep `@RestController` / `@Controller` / NestJS `@Controller` | 결정적 | 95% |
| exception_handlers | grep `@ControllerAdvice` / `@RestControllerAdvice` / `@ExceptionHandler` / `@Catch` / `@UseFilters` | ★ Semgrep custom rule + grep | 90-95% |
| http_status_mapping | exception_class × http_status × mapping_mechanism axis | ★ Semgrep custom rule + ★ LLM (mechanism 분류) | 85-90% |
| **negative_evidence** | ★ ★ ★ 0 hit grep + 0 match Semgrep | 결정적 | 95% (★ ★ ADR-BE-001 정식 evidence) |
| framework_neutrality_score | exception/status/mechanism axis 본격 framework 무관 정량 | 결정적 | 95% |
| baseline / ratchet | ★ ADR-010 baseline + ratchet | 결정적 + ★ baseline 파일 | 100% |

**입력**: BE 소스 + inventory.json tech_stack.backend
**no-simulation 정책 본격**: AI sub-agent persona simulation ❌ / ★ ★ ★ ★ Semgrep custom rule 본격 실 실행 의무 (★ ADR-009 단계 5)

### 3.1 미추출 (의도적)

- runtime exception flow (★ try/catch 본격 동적 흐름 / 정적 분석 한계 / characterization-spec 영역)
- generic `RuntimeException` / `Exception` 본격 catch-all 분류 (★ throw_unmapped 영역 / 본격 contract ❌)
- 사용자 정의 status code (★ RFC 표준 외 / framework-specific)

---

## 4. ★ ★ negative-space evidence 4종 (★ ADR-BE-001 정식 evidence)

본격 negative_evidence 본격 4 sub-field 본격 의무:

```yaml
negative_evidence:
  contract_absent:
    evidence_type: grep_zero_hit | ast_zero_match | ts_morph_zero_decorator | manual_review
    details: "예: 'grep -r @ControllerAdvice → 0 hit / Spring 2.5'"
  negative_effect: "예: '도메인 예외 → 500 leak / spec/runtime drift / API 사용자 의도 ❌'"
  industry_standard:
    - "RFC 7231 §4.2.2"
    - "RFC 9110 §15.3"
    - "Spring docs / NestJS docs"
    - "OWASP API Top 10 (2023)"
  automatic_regression_capable:
    tool: semgrep_custom_rule
    rule_path: tools/static-runner/rules/error-mapping-missing.yml
    rule_id: internal.be.api.error-mapping-generic-exception-in-service
```

★ ★ ★ ★ ★ negative_evidence 본격 4 sub-field 본격 모두 필수 (★ ADR-BE-001 정식 evidence axis 본격 완전성 의무).

---

## 5. cross-link

```yaml
cross_links:
  - {to_artifact: api, link_type: maps_exception_to_status}              # ★ OpenAPI responses[].status ↔ exception_class
  - {to_artifact: domain, link_type: domain_exception_origin}            # ★ E-XXX 본격 도메인 예외 발생 영역
  - {to_artifact: rules, link_type: violation_triggers_exception}        # ★ BR 위반 → exception 본격 mapping
  - {to_artifact: antipatterns, link_type: AP-API-001_trigger}           # ★ throw_unmapped ≥ 1 / decorator_drift ≥ 1
  - {to_artifact: legacy-spectrum, link_type: legacy_handler_pattern}    # ★ legacy framework 별 handler 패턴 (★ 본격 framework_neutrality)
```

---

## 6. 신뢰도 (ADR-009 §2.4 정합)

| 단계 | 조건 | 신뢰도 |
|---|---|---|
| 1 | LLM 추론 만 | 50-60% |
| 3 | + grep 정적 분석 | 70-78% |
| 4 | + Semgrep custom rule 실 실행 | 85-90% |
| **5** | + ADR-010 baseline + ratchet + 5종 물증 7 필드 본격 | **90-95%** |

★ ★ 본격 본격 단계 5 본격 의무 (★ no-simulation 정책 / ADR-009 강제).

---

## 7. ★ ★ AP-API-001 자동 회귀 도구 (★ ADR-BE-001 본격 정합)

본격 본격 ★ ★ ★ ★ 본격 핵심 = ★ "negative-space evidence 본격 자동 회귀 가능" 본격 사실.

### 7.1 Spring rule (`internal.be.api.error-mapping-generic-exception-in-service`)

```yaml
rules:
  - id: internal.be.api.error-mapping-generic-exception-in-service
    message: |
      Service 영역 안 generic Exception throw 본격 → @ControllerAdvice 부재 시 500 leak.
      ★ ADR-BE-001 negative-space evidence trigger.
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
      @Delete + @ApiResponse({status: 201}) decorator drift 본격 → API 사용자 의도 위반.
      ★ ADR-BE-001 negative-space evidence trigger.
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

### 7.3 CI 통합 (★ `.github/workflows/drift-check.yml`)

★ ★ body scan step + custom rule extra-rules 본격 자동 통합 (★ jwt-rsa-custom-rule 패턴 정합 / commit `a144b5a` + `b87cec5` + `4dcace9` cadence).

---

## 8. 검증 체크리스트

```
□ schema 검증 통과 (Ajv 8 strict mode)
□ scope.framework / modules / controllers_scanned 명시
□ exception_handlers 배열 본격 (★ 빈 배열 = ★ ★ negative-space evidence trigger)
□ http_status_mapping 본격 exception_class × http_status × mapping_mechanism 본격 명시
□ ★ negative_evidence 4 sub-field 의무 모두 채움
□ framework_neutrality_score 명시 (0.0~1.0)
□ ★ 진짜 Semgrep custom rule 본격 실 실행 (5종 물증 7 필드)
□ baseline 본격 ADR-010 정합 (legacy 첫 진입 시 baseline 작성 / CI run = ratchet)
□ AP-API-001 ≥ 1 등재 의무 (★ throw_unmapped ≥ 1 또는 decorator_drift ≥ 1 시)
□ chain harness validated §8.1 strict 본질 보존
```

---

## 9. ★ 본 deliverable 본격 위치 (★ v1.5.0 신설 carry 본격 이행)

본 deliverable 본격 ★ ★ ★ v1.5.0 신설 시점 본격 `skill SKILL.md:109` 본격 *"v1.5.1+ carry — full deliverable"* 본격 promise 본격 이행 영역. 본격 carry 1년+ 잔존 후 ★ ★ ★ v2.6.0 follow-up sprint (★ drift+orphan scan) 본격 본격 발견 + 본격 신설.

본 deliverable 본격 자산화 paradigm = ★ ★ ★ ★ ★ "★ skill SKILL.md 본격 deliverable 인용 본격 정합" + "★ ADR-BE-001 본격 negative-space evidence 본격 정식 명세 위치" + "★ 23 다른 deliverable 본격 paradigm 정합".

---

## 10. 본체 명세 + 외부 권위

- `methodology-spec/deliverables/16-error-mapping-spec.md` (★ 본 파일)
- `schemas/error-mapping-spec.schema.json` (v1.5.0 신설)
- `skills/analysis-error-mapping/SKILL.md` (★ ADR-BE-001 본격 본격 사상 origin)
- `tools/static-runner/rules/error-mapping-missing.yml` (★ Spring + NestJS sub-rule 2종)
- ADR-BE-001 (★ ★ ★ negative-space corroboration 본격 정식화 / 본 deliverable 사상 origin)
- ADR-FE-007 (★ ★ positive-space sister ADR)
- ADR-009 (5단계 신뢰도 / 진짜 도구 의무)
- ADR-010 (baseline + ratchet)
- DEC-2026-04-29-static-tool-실행-의무화
- DEC-2026-05-02-jwt-rsa-custom-rule (★ negative-space rule 패턴 origin)
- RFC 7231 §4.2.2 + RFC 9110 §15.3 (★ HTTP status 산업 표준)
- OWASP API Top 10 (2023) (★ API 보안 산업 표준)
- Spring docs (`@ControllerAdvice` / `@ExceptionHandler`)
- NestJS docs (`@Catch` / `ExceptionFilter`)
