# 산출물 #13: Legacy Spectrum (Tier 1~4 detection + bootstrap data flow + strangler plan)

> **schema**: `schemas/legacy-spectrum.schema.json`
> **생성 phase**: `discovery` phase (`/analyze-init` 의 sub) 또는 별도 `/analyze-legacy`

---

## 1. 목적

**답하는 질문**: "이 FE 시스템은 어느 Tier (Modern / jQuery / Vanilla / JSP) 에 속하며, 점진적 마이그레이션 path 는?"

**AI 재구현 시 활용**: Tier 별 추출 산출물 매트릭스 / bootstrap 진실 source / Strangler 마이그레이션 plan 자료

### 1.1 Strangler Fig Pattern (Martin Fowler 2004)

> "Gradually create a new system around the edges of the old, letting it grow slowly over several years until the old system is strangled."

→ rewrite ❌ / strangle ✅. 본 산출물 = strangle plan 자체를 산출 (사람이 신규 시스템 구축 시 입력).

---

## 2. 형식

```
output/legacy-spectrum/
├── legacy-spectrum.json        # AI 눈 (통합)
├── tier-detection.md           # Tier 1~4 detection 보고
├── bootstrap-data-flow.md      # 초기 데이터 흐름
├── strangler-migration-plan.md # 마이그레이션 plan
└── _manifest.yml
```

---

## 3. 추출 범위 (출처 / 방법 / 신뢰도)

| 항목            | 출처                                        | 방법         | 신뢰도    |
| --------------- | ------------------------------------------- | ------------ | --------- |
| primary_tier    | package.json + file 확장자 + DOM 패턴       | 결정적 + LLM | 0.85~0.95 |
| signals         | tier 별 detection signal                    | 결정적       | 0.90      |
| mixed_breakdown | LOC / file_count 비율                       | 결정적       | 0.95      |
| bootstrap_flow  | entry HTML + window global + data-\* + AJAX | 결정적 + LLM | 0.70~0.85 |
| strangler_plan  | (LLM 추론 / 사용자 input 의존)              | LLM          | 0.50~0.70 |

**입력**: FE 소스 + entry HTML
**captured_by**: code_static_analysis (실제 코드 read 의무 — simulation 시 -5%p)

---

## 4. Tier 1~4 정책 매트릭스

| Tier                       | 추출 산출물           | LLM 의존 | bootstrap 패턴                                    |
| -------------------------- | --------------------- | -------- | ------------------------------------------------- |
| **1 Modern SPA**           | 7대 7/7               | 낮음     | window.**INITIAL_STATE** / SSR hydration          |
| **2 jQuery legacy**        | 5/7                   | 중       | data-\* attribute / AJAX on $(document).ready     |
| **3 Vanilla JS**           | 4/7                   | 높음     | DOM 직접 / fetch on load                          |
| **4 server-side template** | 3/7 + BE/FE 분리 예외 | 높음     | JSP request attribute / Thymeleaf model attribute |

→ Tier 4 = Stage 6 BE/FE 분리 예외 (`tier_4_be_fe_split_carry=true` 의무).

---

## 5. bootstrap 데이터 흐름 (Tier 2/3/4 핵심)

11 method enum (legacy-spectrum.schema.json):

| method                                | Tier 적용          | 흔한 위험        |
| ------------------------------------- | ------------------ | ---------------- |
| server_render_initial_state           | 1 (Next.js / Nuxt) | XSS escape 의무  |
| window_global_assignment              | 1, 2               | global pollution |
| data_attribute_dom                    | 2 (jQuery)         | state 진실 분산  |
| ajax_fetch_on_load                    | 2, 3               | race condition   |
| websocket_on_load                     | 1, 2, 3            | reconnect 정책   |
| jsp_request_attribute                 | 4                  | BE/FE 분리 예외  |
| thymeleaf_model_attribute             | 4                  | 동일             |
| erb_instance_variable                 | 4                  | 동일             |
| cookie_initial / localstorage_initial | 1~3                | tampering 위험   |
| none                                  | 1 (CSR only)       | —                |

→ 각 method 에 `ssr_safe` 표기 의무 (static-security-spec cross-link).

---

## 6. Strangler 마이그레이션 plan (4 approach)

| approach                                | 적합                           | 위험                   |
| --------------------------------------- | ------------------------------ | ---------------------- |
| **page_by_page**                        | Tier 2/3 (페이지 분리 명확)    | 공통 layout drift      |
| **feature_by_feature**                  | Tier 1+2 혼재                  | feature 경계 모호      |
| **side_by_side_iframe**                 | Tier 4 / 사내 legacy           | iframe a11y / SEO 손실 |
| **edge_proxy**                          | URL prefix / micro-frontend    | 인프라 비용 ↑          |
| ❌ **big_bang_rewrite_not_recommended** | (산업 사례 모두 strangle 권고) | 비즈니스 위험          |

→ 산업 권고 (Fowler / Sam Newman) — `big_bang_rewrite_not_recommended` enum 명시.

---

## 7. cross-link

```yaml
cross_links:
  - { to_artifact: ui-spec, link_type: pages } # Tier 별 page 매핑
  - { to_artifact: state-map, link_type: validates_5_truths } # 5 진실 detection 정합
  - { to_artifact: static-security-spec, link_type: ssr_safe } # bootstrap XSS 위험
  - { to_artifact: antipatterns, link_type: registers } # AP-FE-LEGACY-XXX 등록
```

---

## 8. 신뢰도

| 단계 | 조건                                                      | 신뢰도 |
| ---- | --------------------------------------------------------- | ------ |
| 1    | 코드 정적 분석                                            | 70-80% |
| 3    | + cross-validation (drift-validator 적용 검토 — Stage 5+) | 78-85% |
| 5    | + 사용자 환경 input (사내 마이그레이션 plan 검증)         | 85-92% |

---

## 9. 검증 체크리스트

```
□ schema 검증 통과
□ tier_detection.primary_tier 명시
□ tier_detection.signals 명시 (모든 4 Tier 의 detected 여부)
□ primary_tier=mixed 시 mixed_breakdown 의무
□ bootstrap_flow.entry_html 명시
□ bootstrap_flow.data_injection_methods 명시 (≥ 1 항목)
□ bootstrap method 별 ssr_safe 표기 (XSS 위험 평가)
□ strangler_plan.migration_target_tier 명시
□ strangler_plan.approach ≠ big_bang_rewrite_not_recommended (권고 ❌)
□ summary.tier_4_be_fe_split_carry=true if Tier 4 detected (Stage 6 BE/FE 분리 carry)
□ summary.captured_by=code_static_analysis (simulation 시 -5%p 패널티 + simulation_reason)
```

---

## 10. 산출물 간 참조

| 방향     | 의미                                              |
| -------- | ------------------------------------------------- |
| LS → UI  | Tier 별 page / component level 매핑               |
| LS → SM  | bootstrap → 5 진실 detection 정합                 |
| LS → Sec | bootstrap method 별 ssr_safe (XSS 위험)           |
| LS → AP  | AP-FE-LEGACY-XXX 등록 (mixed Tier / data 분산 등) |

---

## 11. 흔한 함정

### 11.1 mixed Tier 누락 명시

- 증상: Tier 1 + Tier 2 혼재인데 primary_tier=1 만 표기
- 대응: mixed_breakdown 의무 / Tier 별 비율 표기

### 11.2 bootstrap data 진실 source 분산

- 증상: window.**INITIAL_STATE** + data-\* + cookie 동시 사용
- 대응: 진실 source 1개로 일원화 + AP-FE-LEGACY-BOOTSTRAP-DRIFT 등록

### 11.3 strangler 중도 break

- 증상: phase 2 까지 마이그레이션 / 이후 중단 / Tier 1+2 영구 혼재
- 대응: rollback_strategy 의무 + phase 별 종료 조건 명시

### 11.4 big_bang rewrite 시도

- 증상: Tier 1 직접 rewrite / 6개월+ 비즈니스 stop
- 대응: schema enum `big_bang_rewrite_not_recommended` 명시 + 산업 권고 (Fowler) 인용

### 11.5 Tier 4 (JSP) BE/FE 통합 누락

- 증상: JSP 코드를 FE 단독 분석 / BE controller model attribute 무시
- 대응: tier_4_be_fe_split_carry=true 의무 + Stage 6 BE/FE 분리 carry-over 명시

---

## 인용

- ADR: ADR-FE-001 (FE 추출기 가정 / Tier 1~4)
- ADR: ADR-FE-003 (legacy spectrum 정책 / Strangler Fig)
- ADR: ADR-FE-004 (BE/FE 분리 / Tier 4 예외 / Stage 6)
- §4 정합 근거: ADR-FE-001 §3.1
- §8 신뢰도 근거: ADR-009 §2.4
- schema: schemas/legacy-spectrum.schema.json
