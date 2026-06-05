# 산출물 #12: Static Security Spec (정적 분석 가능 보안 — XSS / CSRF / CSP / SRI)

> **사상**: 정적 분석 가능 보안 포함 / 운영 NFR ❌ + OWASP Top 10 + CWE (semgrep_real / eslint_security_real enum)
> **schema**: `schemas/static-security-spec.schema.json`
> **생성 phase**: `quality` phase (`/analyze-quality` 의 sub) 또는 별도 `/analyze-fe-security`

---

## 1. 목적

**답하는 질문**: "이 코드에 정적 분석으로 발견 가능한 보안 위험이 있나?"

**AI 재구현 시 활용**: XSS / CSRF / CSP / SRI / cookie 등 24 categories 정적 검출 결과 입력 / antipatterns 자동 등록

### 1.1 정적 분석 한계 명시 (사용자 confirm 의무)

본 산출물은 **정적 분석 가능한 영역만**:

- ✅ 코드 패턴 (innerHTML / dangerouslySetInnerHTML / eval / open redirect)
- ✅ config (CSP header / cookie 속성 / CORS wildcard)
- ❌ runtime 동작 (실제 XSS 발화 / CSRF token 검증 흐름)
- ❌ 운영 환경 (실제 사용자 input 시나리오)

→ `runtime_check_required=true` finding 은 사용자 confirm 의무 (summary.runtime_check_required_count 표기 의무).

---

## 2. 형식

```
output/static-security/
├── static-security-spec.json   # AI 눈
├── findings.md                 # severity 별 그룹
├── runtime-check-list.md       # runtime 검증 의무 finding 목록
└── _manifest.yml
```

---

## 3. 추출 범위 (24 categories)

| 그룹                  | category                                                                                               | severity 기본   |
| --------------------- | ------------------------------------------------------------------------------------------------------ | --------------- |
| **XSS**               | xss_dom_based / xss_reflected / xss_stored                                                             | critical / high |
| **CSRF**              | csrf_token_missing / csrf_samesite_missing                                                             | high            |
| **CSP**               | csp_missing / csp_unsafe_inline / csp_unsafe_eval / csp_wildcard_source                                | medium ~ high   |
| **SRI**               | sri_missing                                                                                            | medium          |
| **Trusted Types**     | trusted_types_missing                                                                                  | low             |
| **dangerous DOM use** | innerHTML_dangerous_use / dangerouslySetInnerHTML_react / v_html_vue / bypassSecurityTrustHtml_angular | high            |
| **cookie**            | cookie_missing_httponly / cookie_missing_secure / cookie_missing_samesite                              | medium ~ high   |
| **CORS**              | cors_wildcard                                                                                          | high            |
| **link**              | target_blank_noopener_missing / javascript_url_in_href                                                 | medium          |
| **dynamic eval**      | eval_usage / function_constructor_usage                                                                | high            |
| **redirect**          | open_redirect                                                                                          | high            |

**입력**: FE 소스
**no-simulation 정책**: simulation 시 -5%p 패널티 + simulation_reason 의무 (schema if/then)

### 3.1 미추출 (의도적)

- runtime XSS payload fuzzing — 별도 도구 (DAST) 영역
- 인증/인가 흐름 검증 — `business-logic` phase (rules) + state-map cross-link
- 실사용자 행동 기반 위험 — 운영 영역 (명시적 제외)

---

## 4. no-simulation 정책 강제

```yaml
captured_by enum:
  ✅ semgrep_real         # 권장
  ✅ eslint_security_real # eslint-plugin-security
  ✅ snyk_code_real
  ✅ codeql_real
  ✅ sonarjs_real
  ❌ simulation           # -5%p 패널티 + simulation_reason 의무

5종_물증_의무 (real 도구 시):
  - captured_by_version
  - stdout_path
  - duration_ms
  - reproduction_command
  - result_hash
```

→ schema `if/then` 강제 (static-security-spec.schema.json `allOf`).

---

## 5. cross-link (`formal-spec` phase 패턴)

```yaml
cross_links:
  - {
      from_finding: F-FE-SEC-001,
      to_artifact: ui-spec,
      to_id: PAGE-XXX,
      link_type: validates,
    }
  - {
      from_finding: F-FE-SEC-001,
      to_artifact: antipatterns,
      to_id: AP-FE-SEC-XXX,
      link_type: registers_as_antipattern,
    }
  - {
      from_finding: F-FE-SEC-001,
      to_artifact: ui-spec,
      to_id: PAGE-XXX,
      link_type: blocks_baseline,
    }
```

---

## 6. 신뢰도

| 단계 | 조건                                                                                                                                                        | 신뢰도                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | LLM 패턴 추론                                                                                                                                               | 50-60%                 |
| 3    | drift-validator (정적 finding 비교)                                                                                                                         | 65-75% (Stage 5+ 검토) |
| 5    | R19 Tier 1 (in-plugin: Semgrep / ESLint security) + Tier 2 (사용자 환경 SARIF import: Snyk Code / CodeQL) 진짜 실행 + 7 evidence 필드 (evidence_trust 포함) | 85-92%                 |

runtime check 통과 시 95%+ (별도 영역).

---

## 7. 검증 체크리스트

```
□ schema 검증 통과
□ scope.categories_checked 명시 (24 categories 중 사용 항목)
□ 모든 finding 에 id (F-FE-SEC-XXX) / category / severity / source_file / line 명시
□ critical / high finding → fix_suggestion 의무
□ runtime_check_required=true 인 finding → summary.runtime_check_required_count 매칭
□ summary.captured_by ∈ [semgrep_real, eslint_security_real, snyk_code_real, codeql_real, sonarjs_real]
□ captured_by=simulation 시 simulation_reason 의무
□ real 도구 시 5종 물증 의무
□ cross_links 의무 (antipatterns 중심 + ui-spec 보조)
```

---

## 8. 산출물 간 참조

| 방향     | 의미                                     |
| -------- | ---------------------------------------- |
| Sec → UI | validates page (XSS 위험 페이지)         |
| Sec → AP | registers_as_antipattern (AP-FE-SEC-XXX) |
| Sec → SM | blocks_baseline (auth state 위험 시)     |

---

## 9. 흔한 함정

### 9.1 dangerouslySetInnerHTML / v-html / bypassSecurityTrustHtml

- 증상: 사용자 input 직접 렌더링
- 대응: DOMPurify sanitize 의무 + AP-FE-SEC-XSS 등록

### 9.2 target="\_blank" + noopener 부재

- 증상: 외부 링크 새 탭 / opener 객체 노출 (reverse tabnabbing)
- 대응: rel="noopener noreferrer" 의무

### 9.3 eval / new Function / setTimeout(string)

- 증상: 동적 코드 실행
- 대응: 절대 사용 ❌ + AP-FE-SEC-EVAL 등록

### 9.4 cookie 보안 속성 부재

- 증상: HttpOnly / Secure / SameSite 미설정
- 대응: 모두 의무 (SameSite=Lax 또는 Strict)

### 9.5 CSP 부재 또는 unsafe-inline

- 증상: CSP header 없음 또는 unsafe-inline 허용
- 대응: CSP Level 3 + nonce / hash 사용 + AP-FE-SEC-CSP 등록

### 9.6 정적 분석 한계 (runtime check 의무)

- 증상: 정적 결과만 보고 안전 판단
- 대응: runtime_check_required=true finding 명시 + 사용자 confirm 의무

---

## 인용

- 사상 근거: ADR-001 (명시적 제외 — 운영 NFR scope-out)
- captured_by enum 근거: ADR-009 (semgrep_real / eslint_security_real 등 real-tool enum)
- §6 신뢰도 단계 근거: ADR-009 (단계별 신뢰도 + evidence_trust)
- schema: schemas/static-security-spec.schema.json
- 외부 권위: OWASP Top 10 / CWE
