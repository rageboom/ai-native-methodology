# Migration Cautions — FE 영역 가이드

> **사상**: 본 방법론 가치 명세 (코드 → 형식 명세 + 위험 기록 한 방향 추출기) FE 적용 + ADR-FE-001 (Tier 1~4 spectrum) + ADR-FE-003 (Strangler Pattern)
> **위치**: 본 doc = 본체 spec. 실 산출물은 PoC 별 `output/antipatterns/migration-cautions.md` (BE) + `migration-cautions-fe.md` (FE)
> **생성 phase**: Phase 6 (`/analyze-quality`) — FE 산출물 (deliverable 7~13) 통합 후

---

## 1. 목적

**답하는 질문**: "신규 FE 시스템 구축 시 본 분석에서 발견한 위험을 어떻게 회피하나?"

**AI 재구현 시 활용**: design / CI / Review 단계의 차단 가이드

### 1.1 BE migration-cautions 와의 분담

| 영역                                                                       | migration-cautions.md (BE) | migration-cautions-fe.md (본 doc) |
| -------------------------------------------------------------------------- | -------------------------- | --------------------------------- |
| API / DB / Security / Architecture / Domain                                | ✅                         | (cross-link 만)                   |
| FE state 5 진실 / visual baseline / a11y / i18n / 정적보안 / legacy 4 Tier | (cross-link 만)            | ✅                                |
| 사내 도입 quality gate (Baseline + Ratchet)                                | ✅ ADR-010 정합            | ✅ ADR-010 + WCAG ratchet 정합    |

→ BE / FE migration-cautions 양쪽 의무 산출물 (Phase 6).

---

## 2. 카테고리 (FE 영역)

| #   | 카테고리                    | 근거 deliverable                |
| --- | --------------------------- | ------------------------------- |
| A   | state 5 진실 분산 위험      | #8 state-map                    |
| B   | visual baseline drift       | #9 visual-manifest              |
| C   | a11y baseline / ratchet     | #10 a11y-spec                   |
| D   | i18n MF2 runtime preview    | #11 i18n-spec                   |
| E   | 정적보안 (XSS / CSRF / CSP) | #12 static-security-spec        |
| F   | legacy 4 Tier strangle      | #13 legacy-spectrum             |
| G   | 사내 도입 quality gate FE   | (횡단 — ADR-010 + WCAG ratchet) |

---

## 3. A — state 5 진실 분산 회피

### A-1. server cache ↔ client state mirror 금지

**근거**: #8 state-map §9.1 (race condition)

**design 단계**:

- ✅ TanStack Query / SWR 의 cache = 진실 / Zustand 등 client state = derived 만
- ✅ mirror 패턴 (`useEffect` 로 query → store copy) 금지
- ✅ 모든 server state 는 query/mutation hook 통해서만 접근

**CI 의무**:

- state-map.json `primary_source_type=mixed` machine 발견 시 finding 등록 + review 의무

### A-2. URL state 진실 보존

**근거**: #8 state-map §9.3 (split brain)

**design 단계**:

- ✅ 새로고침 시 복원되어야 하는 state = URL 진실 (router params / query string)
- ✅ form state 는 URL 에서 hydrate (e.g. `useSearchParams` → form default)

### A-3. over-globalization 금지

**근거**: #8 state-map §9.4

**design 단계**:

- ✅ scope 우선순위: component < feature < global
- ✅ Redux/Zustand 단일 store 에 모든 데이터 ❌
- ✅ Tanstack Query 가 server state 담당 / Zustand 는 ephemeral UI state 만

---

## 4. B — visual baseline drift 회피

### B-1. flaky test 차단

**근거**: #9 visual-manifest §10.1

**design 단계**:

- ✅ Playwright `await page.waitForLoadState('networkidle')` 의무
- ✅ animation 비활성화 또는 `mask` 영역 지정
- ✅ 폰트 미리 로드 + `document.fonts.ready` 대기

**CI 의무**:

- visual-manifest.json `captured_by=playwright_real` (또는 percy/chromatic) 의무
- simulation 시 -5%p 패널티 + simulation_reason 명시

### B-2. dynamic content masking

**design 단계**:

- ✅ timestamp / 사용자명 / 랜덤 ID = mock data 고정 또는 mask region

### B-3. baseline 승인 권한 명시

**design 단계**:

- ✅ visual-manifest.baseline_management.update_authority = "디자이너 + PM" 의무
- ✅ git-lfs 또는 별도 baseline branch 분리

---

## 5. C — a11y baseline / ratchet ( ADR-010 정합)

### C-1. WCAG 2.1-AA baseline 의무 ( build block)

**근거**: #10 a11y-spec §4

**design 단계**:

- ✅ **WCAG 2.1-AA = baseline** (fail 시 critical / build block)
- ✅ axe-core config `withTags(['wcag21aa'])` 의무

**CI 의무**:

- a11y-spec.summary.baseline_pass=false → build fail ( ADR-010 baseline 정합)

### C-2. WCAG 2.2-AA ratchet 격상 path

**design 단계**:

- ✅ ratchet_wcag = "2.2-AA" 명시
- ✅ 2.2 신규 기준 (target size / focus appearance / dragging movements) 격상 path 자료

**CI 의무**:

- a11y-spec.summary.ratchet_pass=false → 권장 (block ❌ / dashboard 표기)

### C-3. axe-core 진짜 실행 의무

**CI 의무**:

- captured_by=axe_core_real 의무 + 5종 물증 (version / stdout / duration / reproduction / result_hash)
- simulation 시 -5%p 패널티

---

## 6. D — i18n MF2 runtime preview 회피

### D-1. MF1 폴백 의무

**근거**: #11 i18n-spec §4 + ADR-FE-005 §2.2.3

**design 단계**:

- ✅ MF2 사용 시 MF1 폴백 병기 의무
- ✅ schema if/then 자동 강제 (`mf2_used=true` → `mf1_fallback_present=true`)

### D-2. plural / gender select locale 별 검증

**design 단계**:

- ✅ ICU plural syntax 의무 (zero/one/other / 한국어 other / 러시아어 one/few/many)
- ✅ gender select = locale 별 사용 명시

### D-3. MF2 default function (`u:` namespace) Draft 회피

**design 단계**:

- ✅ icu_mf2_features_used 에 `u_namespace_draft` 사용 시 finding 의무
- ✅ Stage 4+ runtime 검증 carry

---

## 7. E — 정적보안 (XSS / CSRF / CSP / SRI / cookie)

### E-1. dangerouslySetInnerHTML / v-html / bypassSecurityTrustHtml 차단

**근거**: #12 static-security-spec §9.1

**design 단계**:

- ✅ 사용자 input 직접 렌더링 ❌ — DOMPurify sanitize 의무
- ✅ ESLint `react/no-danger` rule 의무

**CI 의무**:

- static-security-spec.findings 의 dangerouslySetInnerHTML_react / v_html_vue / bypassSecurityTrustHtml_angular = high → CI fail

### E-2. eval / new Function / setTimeout(string) 절대 금지

**design 단계**:

- ✅ 동적 코드 실행 ❌ — AP-FE-SEC-EVAL 자동 등록
- ✅ ESLint `no-eval` + `no-new-func` rule 의무

### E-3. cookie 보안 속성 의무

**design 단계**:

- ✅ HttpOnly / Secure / SameSite (Lax 또는 Strict) 모두 의무
- ✅ session cookie = HttpOnly + Secure 의무 ( baseline)

### E-4. CSP Level 3 + nonce / hash

**design 단계**:

- ✅ CSP header 의무 (unsafe-inline / unsafe-eval ❌)
- ✅ inline style / script = nonce 또는 hash

### E-5. runtime check 의무 표기

**CI 의무**:

- static-security-spec.summary.runtime_check_required_count > 0 시 사용자 confirm 의무 표기 ( 정적 분석 한계)

---

## 8. F — legacy 4 Tier strangle

### F-1. big_bang rewrite 절대 금지

**근거**: #13 legacy-spectrum §11.4 + ADR-FE-003 §3

**design 단계**:

- ✅ 산업 사례 (Martin Fowler / Sam Newman) 모두 strangle 권고
- ✅ schema enum `big_bang_rewrite_not_recommended` 명시

### F-2. mixed Tier 명시 의무

**design 단계**:

- ✅ Tier 1 + 2 혼재 시 mixed_breakdown 의무 (LOC / file_count 비율)
- ✅ 진실 source 1개 일원화 (window.**INITIAL_STATE** + data-\* 동시 사용 금지)

### F-3. Tier 4 (JSP) BE/FE 통합 (ADR-FE-004 carry)

**design 단계**:

- ✅ tier_4_be_fe_split_carry=true 의무
- ✅ JSP 분석 = BE controller model attribute 통합

---

## 9. G — 사내 도입 quality gate FE (ADR-010 정합)

### G-1. Baseline 도입 의무

```yaml
.ai-native-methodology/baseline-fe.yml:
  # 본 방법론 도구 (drift-validator FE + axe-core 진짜 실행 + Semgrep) 첫 분석 결과
  # git 추적 의무
  # 현존 결함 = grandfathered (CI 통과)

  a11y_baseline:
    wcag_21_aa_violations: <list of fingerprint>
    wcag_22_aa_violations: <list of fingerprint> # ratchet — 권장만

  state_map_baseline:
    drift_breaking_count: <int>
    primary_source_type_mixed_machines: <list>

  static_security_baseline:
    findings: <list of fingerprint>
    runtime_check_required_count: <int>
```

### G-2. Ratchet 정책 ( FE 변형)

```markdown
- baseline 외 신규 결함 = CI fail (점진 격상)
- baseline 결함 fix → fingerprint 자동 제거 (한 방향)
- WCAG 2.1-AA → 2.2-AA ratchet 격상 시 baseline 갱신 + 디자이너 + a11y 전문가 리뷰 의무
- a11y critical (WCAG 2.1-AA fail) = baseline 등재 ❌ (즉시 차단 / production blocker)
```

### G-3. Severity 별 강도 (FE)

| severity     | 정책                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| **critical** | 즉시 차단 (baseline 등재 ❌) — WCAG 2.1-AA fail / dangerouslySetInnerHTML / eval |
| **high**     | 신규 차단 / baseline grandfathered                                               |
| **medium**   | 신규 차단 / baseline grandfathered ( a11y serious / CSP 부재)                    |
| **low**      | 신규 경고만                                                                      |
| **positive** | 등재만 (모범 사례 — 학습 효과)                                                   |

### G-4. Quarterly review (FE)

- baseline 결함 감소율 정량
- WCAG ratchet 진행도 정량 (2.1-AA → 2.2-AA 도달률)
- MF2 runtime 격상 시점 검토 (ICU runtime stable 도달 시)
- 2년 자동 expiry

---

## 10. cross-link (BE migration-cautions 와)

| BE 카테고리  | FE 카테고리             | 관계                                                                          |
| ------------ | ----------------------- | ----------------------------------------------------------------------------- |
| API / Auth   | C / E                   | a11y / 정적보안은 API security 의 FE 측면                                     |
| DB           | A / F                   | state 5 진실 = BE state 와 cache 정합 / legacy bootstrap data = BE controller |
| Security     | E                       | OWASP API Security ↔ FE 정적보안                                              |
| Architecture | F                       | strangle = micro-frontend / edge proxy                                        |
| Domain       | A / D                   | rules.schema fe_validation / fe_authorization / fe_a11y / fe_i18n cross-link  |
| Performance  | (운영 NFR — v1.5 carry) | LCP / CLS = ADR-001 §명시적 제외 정합                                         |

→ Phase 6 산출 시 BE migration-cautions + FE migration-cautions 양쪽 의무.

---

## 11. PoC #04 (Stage 5+) 적용 의무

본 doc = 본체 spec. 실제 platform-specific 변형은 PoC #04 RealWorld React 의 `output/antipatterns/migration-cautions-fe.md` 에서 BE PoC #03 NestJS 패턴 정합 (ADR-NEST-001~004) 으로 구체화.

→ Stage 5 본격 PoC #04 종결 시 platform-specific 변형 섹션 (React / Vue / Angular 별) 의무.
