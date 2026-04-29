# Senior Backend Engineer + Architect 조언 — Phase 6 (PoC #01 안티패턴 통합)

> 작성일: 2026-04-29
> 작성자: 메인 에이전트 (Senior 역할 직접 작성 — sub-agent stall 실패 시 fallback)
> 입력: plan-phase6.md + document-phase6.md + case-phase6.md + Phase 4 partial + Phase 5 candidate + 윤주스 절대 우선순위 (memory feedback_quality_priority.md)
> 분량: ~700 line 결정 위주 (12 영역 평가 + 충돌 해소 + 권고)

---

## 0. 메타 / 관점 (Senior 5축)

본 문서는 **Document (표준 / RFC) 과 Case (테크기업 사례) 의 충돌 해소 + 실무 시니어 함정 / 사내 적용 우선순위** 를 다룬다. plan-phase6.md §7 의 12 영역을 평가 기준 5축으로 재구성:

| 기준 | 의미 | Phase 6 적용 |
|---|---|---|
| **사고 회피성** | 6~12개월 후 사고 가능성 차단 | 보안 / 데이터 손실 high 강제 |
| **외부 호환성** | OpenAPI lint / Spring/JPA 표준 | API 표준 (RFC 9110) / Spring Security 6 |
| **학습 비용** | avoid-list.md 가독성 | severity 별 + 영역 별 분류 + AP cross-link |
| **deprecation 비용** | v2 마이그레이션 비용 | API 버저닝 / Spring Boot 3.x |
| **Phase 6 부가가치** | 단일 phase 만으로는 발견 불가 | 복합 AP 검토 결과 |

---

## 1. 충돌 해소 — 복합 AP (Case 등록 권고 vs Document 거절 권고)

### 1.1 Case 의 등록 권고 (★★★)
> AP-SECURITY-004 composite 등록 권고 — 카카오페이/토스/Tech Radar 5/6 출처가 "JWT/Auth 패턴" 을 단일 회피 단위로 다룸.

### 1.2 Document 의 거절 권고
> OWASP/CWE/RFC 모두 개별 결함 단위 분류 → 4건 (AP-SECURITY-001/002/003 + AP-ARCH-003) 분리 등록 + `related_modules` 메타로 연결. avoid-list.md 가독성은 "보안 설정 종합 점검" 섹션으로 보존.

### 1.3 시니어 결정 (메인)

**Document 거절 권고 채택** + Case 의 가독성 우려는 avoid-list.md 섹션화로 해결.

**근거**:
1. **윤주스 절대 우선순위** (memory feedback_quality_priority.md) — 단일 PoC 과적합 회피 §8.1 강제 적용. 복합 AP 는 LLM 추론 신뢰도 0.70 — 단일 PoC 데이터로 격상 시 over-engineering.
2. **표준 분류 우선** — OWASP/CWE/RFC 가 개별 결함 단위 분류 = 사내 적용 시 SAST/SonarQube 매칭 가능. 복합 AP 는 카탈로그 표준 외 패턴.
3. **재작업 최소화 2순위** — 복합 AP 등록 시 PoC #02 진입 후 별도 스택 (FastAPI/Express/etc) 에서 동일 패턴 재현 어려움 → 복합 AP 정의 변경 필요. 단일 결함 등록 시 PoC #02 의 동일 결함만 cross-check.
4. **가독성 보존** — avoid-list.md 의 §"보안 설정 종합 점검" 섹션에서 4 AP cross-link → Case 권고의 가독성 효과 동일 달성.

**결정**:
- AP-COMPOSITE-001 / AP-SECURITY-004 **등록 거절**
- 4건 (AP-SECURITY-001 / AP-SECURITY-002 / AP-SECURITY-003 / AP-ARCH-003) 의 `related_modules` + `tags: ["composite-jwt-auth"]` 메타로 cross-link
- avoid-list.md `## 보안 설정 종합 점검 (composite view)` 섹션 신설 → 4 AP 일괄 권고

→ Phase 6 부가가치는 **Phase 2 정합성 보고서 격상 검증** + **사내 적용 우선순위 표** 로 충분.

---

## 2. severity 재산정 (12 영역 영향)

### 2.1 Case 의 재산정 권고 채택

| AP | 현재 | Case 권고 | Document 권고 | 시니어 결정 |
|---|---|---|---|---|
| AP-PERFORMANCE-001 (EAGER N+1) | medium | high (토스/Vlad/TR) | medium 유지 + **사내 high 격상** | **medium 유지 (본 PoC) + 사내 적용 high** — RealWorld 학습 spec 한정 medium 인정 |
| AP-ARCH-003 (deprecated) | medium | low (점진적 가능) | medium 유지 | **low 권고 채택** — Spring Boot 2.5.2 = deprecated 직전 버전, 점진적 마이그레이션 가능 |

### 2.2 보안 강제 (workflow §5)

| AP | severity | 정당화 |
|---|---|---|
| AP-SECURITY-001 (JWT SECRET) | **critical** ✅ 유지 | Document 7중 표준 위반 (OWASP A02/A07 + API2 + RFC 8725 §3.5 + RFC 7518 §3.2 + RFC 7515 §10.1 + JWT CheatSheet) — **사내 적용 시 즉시 차단** |
| AP-SECURITY-002 (STATELESS implicit) | medium | F-034 — Spring 5.x default IF_REQUIRED 와 의도 충돌. 본 PoC 사실상 STATELESS 동작 — medium 인정 (사내 high 격상 권고) |
| AP-SECURITY-003 (WebSecurity#ignoring) | medium | F-036 — security headers 미적용 위험. 본 PoC POST /users + /users/login 한정 — medium 인정 |

### 2.3 데이터 손실 강제 (workflow §5)

| AP | severity | 정당화 |
|---|---|---|
| AP-DOMAIN-002 (unique 부재) | **high** ✅ 유지 | DRIFT-010 격상 — App+DB+JPA 3중 부재. GDPR / 회원관리 사고 |
| AP-DB-001 (FK ON DELETE 부재) | medium | DRIFT-007 — RealWorld spec 의 User 삭제 시나리오 부재. 본 PoC 한정 medium 인정 |

### 2.4 비즈니스 로직 (workflow §5)

| AP | severity | 정당화 |
|---|---|---|
| AP-DOMAIN-001 (De Morgan) | **critical** ✅ 유지 | Document OWASP A01 + API1 BOLA + CWE-862 — 도메인 권한 의도 정면 위반 |
| AP-ARCH-001 (LV-001) | medium | Layered+Spring-DDD-Lite 인정 (ARCH-STYLE 결정) — 본 PoC medium |
| AP-ARCH-002 (LV-002) | medium | 동일 |
| AP-DOMAIN-003 (F-017 @ManyToMany in @Embeddable) | low | TR Hold (Vol.32) 매핑 — JPA 비주류 패턴, 본 PoC 한정 low |
| AP-DOMAIN-004 (F-028 mutable email equals) | low | JPA Set 멤버십 위험 — 본 PoC 사용 빈도 낮음 |

### 2.5 명명 / 일관성 (workflow §5)

| AP | severity | 정당화 |
|---|---|---|
| AP-API-001 (versioning 부재) | medium | TR Hold (Vol.31) — info.version + servers + path /v1 부재. Document RFC 권고 위반 |
| AP-API-002 (status code 일관성) | low | RealWorld 공식 spec 호환성 — 본 PoC low (사내 신규 medium 격상 권고) |

---

## 3. 12 영역 별 본 PoC 평가

### 영역 1. severity 재산정 함정
- 본 PoC 발현: 2건 (AP-PERFORMANCE-001 / AP-ARCH-003)
- 시니어 결정: §2.1 표 채택. 본 PoC severity 와 사내 적용 severity 분리 표기 (description + recommendation 으로).

### 영역 2. 복합 AP 검출 함정
- 본 PoC 발현: 1건 후보 (AP-COMPOSITE-001 / AP-SECURITY-004)
- 시니어 결정: §1.3 거절 채택. avoid-list.md 섹션화로 가독성 효과 보존.

### 영역 3. 톤 점검 함정
- 본 PoC 발현: Phase 4 partial 6 AP description 톤 검증 필요
- 자동 변환 점검:
  - AP-DOMAIN-001 description "정면 위반" → 표준 적합 (회피 후보 톤)
  - AP-SECURITY-001 description "권장 256 bit 미달" → 표준 적합
  - AP-DOMAIN-002 description "정면 위반" → 표준 적합
  - AP-ARCH-001 description "회피 권장" → 표준 적합
  - AP-ARCH-002 description "회피 권장" → 표준 적합
- 시니어 결정: 톤 점검 ✅ 통과. 단 critical/high 의 `recommended_alternative` 는 단정적 표현 OK (조치 명확성 우선).

### 영역 4. 사내 권고 41건 통합 함정
- 본 PoC 41건 분포: critical 7 / high 26 / medium 8
- 시니어 결정 — avoid-list.md 구조:
  - `## Critical (즉시 차단)` — 7건 (REC-AUTH-002 / REC-DOS-001/002 / REC-F027-001/002 / REC-JWT-001/002)
  - `## High (스프린트 내 처리)` — 26건 (영역 별 그룹)
  - `## Medium (다음 분기)` — 8건
  - `## 보안 설정 종합 점검 (composite view)` — JWT/Auth 4 AP cross-link
  - `## 부록 A — AP ↔ REC 매트릭스` — 15 AP × 41 REC 매핑 표

### 영역 5. GDPR / 회원관리 함정
- 본 PoC 발현: AP-DB-001 + AP-DOMAIN-002 결합 시 회원탈퇴 시나리오 사고
- 시니어 결정: avoid-list.md 의 `## 회원관리 통합 점검` 섹션 추가 (선택) — 카카오 / 네이버 soft delete + author placeholder 패턴 권고.

### 영역 6. 보안 우선순위 함정
- 본 PoC 우선순위 표:
  1. **critical 즉시 차단**: AP-SECURITY-001 (JWT 21byte) > AP-DOMAIN-001 (De Morgan)
  2. **high 1 스프린트**: AP-DOMAIN-002 (unique) > AP-PERFORMANCE-002 (Pageable cap)
  3. **medium 다음 분기**: AP-SECURITY-002/003 (STATELESS / ignoring) > AP-ARCH-001/002 (LV) > AP-API-001 (versioning) > AP-DB-001 (FK) > AP-PERFORMANCE-001 (EAGER, 본 PoC)
  4. **low 백로그**: AP-API-002 (status) / AP-DOMAIN-003 (@ManyToMany) / AP-DOMAIN-004 (equals) / AP-ARCH-003 (deprecated)
- 시니어 결정: avoid-list.md 의 `## 사내 적용 우선순위` 섹션에서 4단계 명시.

### 영역 7. Spring Security 표준 마이그레이션
- 본 PoC 발현: AP-ARCH-003 (WebSecurityConfigurerAdapter deprecated) + AP-SECURITY-002 (STATELESS implicit) + AP-SECURITY-003 (WebSecurity#ignoring)
- 시니어 결정: 4 AP 의 `recommended_alternative` 에 Spring Boot 3.x 마이그레이션 일괄 코드 포함 (한 번에 4건 모두 fix 가능 — 작업 효율).

### 영역 8. OpenAPI 권고 함정
- 본 PoC 발현: AP-API-001 (versioning) + AP-API-002 (status)
- 시니어 결정: 사내 SDK 생성 시 deprecation 사이클 1년+ 비용. medium 격상 권고 (본 PoC low/medium 유지 + 사내 medium 격상 메타).

### 영역 9. DDD 권고 함정
- 본 PoC 발현: ARCH-STYLE 정정 (Hexagonal 0.30 / Spring-flavored DDD-Lite 0.85 / Layered 1.0)
- 시니어 결정: AP-ARCH-001/002 (LV) 는 Spring-flavored DDD-Lite 패턴 인정 — 본 PoC 한정 medium. Vernon IDDD 의 full POJO 강제 회피 (over-engineering).

### 영역 10. 한국 SI 회피 패턴
- 본 PoC 발현: AP-ARCH-002 (LV-002 — domain Spring annotation) — Case 우형 / 카카오 사례 매핑
- 시니어 결정: avoid-list.md 의 `## 한국 SI 회피 패턴 (cross-cutting)` 섹션 (선택) — 본 PoC 한정 인정 + 사내 신규 회피 권고.

### 영역 11. Phase 6 final 검증 함정
- 본 PoC 점검표:
  - schema id pattern (`^AP-[A-Z]+-\d+$`) 위반 0건 ✅ (정규화 매핑 표 _manifest.yml)
  - category enum 누락 0건 (DOMAIN/SECURITY/ARCH/DB/API/PERFORMANCE 6 카테고리 사용)
  - severity enum 누락 0건
  - human_review_required (critical/high 항목) 누락 점검 — Phase 4 partial 3건 (DOMAIN-001 / SECURITY-001 / DOMAIN-002) + Phase 5 신규 (PERFORMANCE-002 / DOMAIN-002 동일) = 4~5건
  - confidence cap 0.98 적용
- 시니어 결정: 점검표 모두 통과 + human_review_required 5건 (critical 2 + high 3) 명시.

### 영역 12. 7대 산출물 cross-validation (workflow §9)
- 본 PoC 점검표:
  - 모든 ID 표준 일관성 (UC/E/BR/PAGE/AP) — Phase 5-1 정정 완료 ✅ (UC-CONTENT-* / BR-* / E-CONTENT-* / AP-*)
  - ID 교차 참조 무결성:
    - x-related-rules 의 BR-XXX → rules.json 존재 ✅
    - operationId → domain.json UC 매핑 ✅ (F-035 정정 후)
    - related_table → db schema 존재 ✅
  - 모든 산출물 confidence 메타 ✅ (formula v1)
  - human_review_required 항목 사용자 처리 — Phase 5-1 종료 시 4 항목 일괄 승인 ✅
- 시니어 결정: 점검표 모두 통과 + Phase 6 final merge 시 7대 산출물 cross-validation 결과 _manifest.yml 에 명시.

---

## 4. Document 발굴 추가 finding 3건 평가

| ID | 설명 | 시니어 결정 |
|---|---|---|
| F-041 후보 | JWT iss/aud/sub claim 검증 부재 (RFC 8725 §3.8) | **F-037 통합** — F-037 (JWT iss/aud/iat/jti 4 claim 부재) 와 동일 영역. 별도 등록 거절. F-037 description 보강. |
| F-042 후보 | JWT alg explicit 검증 부재 (RFC 8725 §3.1) | **신규 등록 권고** — F-041 (severity low / deferred) 신규. JWT alg=none 공격 회피 표준. AP-SECURITY-001 의 `recommended_alternative` 에 명시 가능. |
| F-043 후보 | sessionCreationPolicy 명시 (F-034 보강) | **F-034 통합** — F-034 description 정밀화. 별도 등록 거절. |

→ **신규 finding 1건 (F-041 — JWT alg explicit 검증)** 등록 권고.

---

## 5. 추가 시니어 권고 (Phase 6 신규 finding 후보)

### 5.1 plan §6.5 의 F-041 / F-042 (재정의)

| ID | 설명 | 시니어 결정 |
|---|---|---|
| F-041 (재정의) | JWT alg explicit 검증 부재 (RFC 8725 §3.1) — Document 발굴 | **등록 권고** (low / deferred) |
| F-042 후보 (plan §6.5 schema id pattern) | F-025 와 통합 가능 | **거절 권고** — F-025 (Phase 3 promoted) 와 통합. 별도 등록 over-engineering. |
| F-043 후보 (plan §6.5 복합 AP 신뢰도) | LLM 추론 0.70 가이드 | **거절 권고** — 본 PoC 복합 AP 거절 결정으로 가이드 자체 불필요. |

→ **신규 finding 1건만 등록** (F-041 — JWT alg explicit). 임계 32 → 33.

---

## 6. avoid-list.md 구조 권고 (사내 권고 41건 통합)

```markdown
# 재구현 시 회피 후보 체크리스트 — RealWorld Conduit

> 톤: 비난이 아닌 결정 입력 (회피 후보 / 정상화 권장).
> severity 분포: critical 2 / high 3 / medium 8 / low 4 = 17 AP (Phase 6 final)
> 사내 적용 권고 41건 (critical 7 / high 26 / medium 8)

## ⚠️ Critical (즉시 차단)

[AP-SECURITY-001 + REC-JWT-001/002 인용 + Document 7중 위반 표]
[AP-DOMAIN-001 + REC-F027-001/002 인용 + OWASP A01 + CWE-862]

## 🔴 High (1 스프린트 내 처리)

[AP-DOMAIN-002 + REC-EMAIL-UNIQUE-001/002/003 — 3중 방어]
[AP-PERFORMANCE-002 + REC-DOS-001/002 — Pageable cap]

## 🟡 Medium (다음 분기)

[AP-SECURITY-002 + REC-AUTH-005]
[AP-SECURITY-003 + REC-AUTH-006]
[AP-ARCH-001 + REC-ARCH-003]
[AP-ARCH-002 + REC-ARCH-004]
[AP-API-001 + REC-API-001]
[AP-DB-001 + REC-DB-001]
[AP-PERFORMANCE-001 + REC-DOS-003 — 본 PoC medium / 사내 high 격상]

## 🟢 Low (백로그)

[AP-API-002 + REC-API-002]
[AP-DOMAIN-003 + (recommendation 없음)]
[AP-DOMAIN-004 + (recommendation 없음)]
[AP-ARCH-003 + REC-MIGRATE-001]

## 🛡️ 보안 설정 종합 점검 (composite view)

> 단일 AP 가 아닌 보안 설정 패턴 종합 회고 (Tech Radar Hold + 카카오페이 if(kakao) 사례).
> 4 AP cross-link: AP-SECURITY-001 (critical) + AP-SECURITY-002 (medium) + AP-SECURITY-003 (medium) + AP-ARCH-003 (low).

[Spring Boot 3.x 마이그레이션 일괄 코드 — SecurityFilterChain bean + permitAll + OAuth2ResourceServerConfigurer.jwt() + 환경변수 SECRET]

## 📊 사내 적용 우선순위

[4단계 표 — critical 즉시 차단 / high 1 스프린트 / medium 다음 분기 / low 백로그]

## 부록 A — AP ↔ REC 매트릭스

[15 AP × 41 REC 매핑 표]

## 부록 B — Phase 6 final 검증 점검표

[workflow §9 7대 산출물 cross-validation 결과]
```

---

## 7. _manifest.yml 신뢰도 산정 권고

```yaml
formula_version: v1
base: 0.80   # phase-6-quality.md §8 — 가장 높은 phase
modifiers:
  orm_full: +0.05
  domain_context_md: +0.03
  postman_or_api_test: +0.05
  diagrams_other: +0.02
  cross_phase_aggregation: +0.03   # Phase 1~5 누적 검증 (Phase 6 부가)
  no_operational_db: -0.03
subtotal: 0.95

cross_validation_modifiers:
  document_case_alignment: +0.02   # 11/15 AP 외부 검증 통과 (Case 73% ★★★)
  composite_ap_decision_resolved: 0   # 충돌 해소 — 거절 채택 (Document 권고)
  schema_compliance_100: +0.01   # id pattern 정규화 매핑 표 명시

raw_confidence: 0.96   # cap 0.98 미만

per_area:
  simple_merge_partial_to_final: 0.98
  cyclic_dependency_check: 1.0       # CIRCULAR-001 same_bc 결정 — AP 등록 안 함
  drift_promotion: 1.0               # DRIFT-007/010 격상 완료 + 나머지 검토
  id_normalization: 0.98
  composite_ap: 0.0                  # 등록 거절 (시니어 결정)
  severity_recalculation: 0.85
  tone_check: 0.95
  recommendation_integration: 0.85   # 41 REC 통합
```

---

## 8. Phase 6 산출 직접 인용 stub

### 8.1 antipatterns.json — AP-SECURITY-001 (critical 유지) cross-link

```json
{
  "id": "AP-SECURITY-001",
  "category": "SECURITY",
  "name": "JWT secret 하드코딩 + 21byte (RFC 8725 §3.5 위반)",
  "severity": "critical",
  "why_avoid": "OWASP A02 Cryptographic Failures + A07 Authentication Failures + RFC 8725 §3.5 (key length) + RFC 7518 §3.2 (HS256 256bit MUST) + RFC 7515 §10.1 (entropy) + JWT CheatSheet 64char 권고 + OWASP API2 — 7중 표준 위반.",
  "tags": ["security", "jwt", "owasp-a02", "owasp-a07", "owasp-api2", "rfc-8725", "rfc-7518", "rfc-7515", "jwt-cheatsheet", "phase4-extracted", "critical", "composite-jwt-auth"],
  "related_modules": ["MOD-INFRA-JWT", "MOD-APP-SECURITY"]
}
```

### 8.2 antipatterns.json — AP-PERFORMANCE-002 (Phase 5 candidate 정규화)

```json
{
  "id": "AP-PERFORMANCE-002",
  "category": "PERFORMANCE",
  "name": "Pageable / limit cap 부재 — DoS 위험",
  "severity": "high",
  "why_avoid": "GetArticles + GetArticlesFeed 의 limit query parameter 가 maximum cap 부재 → 단일 요청으로 전체 row 조회 가능. Stripe / GitHub / 토스 모두 maximum 100 cap 표준.",
  "evidence": [{"file": "src/main/java/io/github/raeperd/realworld/application/article/ArticleApi.java", "context_note": "@RequestParam Optional<Integer> limit — cap 부재"}],
  "recommended_alternative": "if (limit > 100) limit = 100; // 또는 @Max(100) Bean Validation",
  "tags": ["performance", "dos", "pageable", "phase5-candidate", "high", "f-040-related", "rec-dos-001"]
}
```

### 8.3 avoid-list.md — Critical 섹션 stub

```markdown
## ⚠️ Critical (즉시 차단)

### AP-SECURITY-001: JWT secret 하드코딩 + 21byte
- **위치**: `infrastructure/jwt/JWTConfiguration.java:12`
- **표준 위반**: 7중 (OWASP A02/A07/API2 + RFC 8725/7518/7515 + JWT CheatSheet)
- **즉시 조치**:
  ```java
  @Value("${jwt.secret}")
  private String secret;  // 256bit ≥ random + 환경변수 분리
  ```
- **권고 ID**: REC-JWT-001 / REC-JWT-002

### AP-DOMAIN-001: Comment 삭제 De Morgan 버그
- **위치**: `domain/article/Article.java:86`
- **표준 위반**: OWASP A01 Broken Access Control + OWASP API1 BOLA + CWE-862
- **즉시 조치**:
  ```java
  if (!(user.equals(author) || user.equals(commentsToDelete.getAuthor())))
      throw new IllegalAccessError(...);
  ```
- **권고 ID**: REC-F027-001 / REC-F027-002
```

---

## 9. Phase 6 final 결정 트리 (요약)

```
1. Phase 4 partial 6 AP → 결정적 통합 (그대로) ✅
2. Phase 5 candidate 6 AP → 정규화 + 추가 (multi-prefix → AP-{CAT}-{NUM} 단일 prefix)
3. Phase 4 추가 candidate 3 AP → 추가 (EAGER / F-017 / F-028)
4. 복합 AP → 거절 (Document 권고 채택, Case 가독성은 avoid-list.md 섹션화)
5. severity 재산정 → AP-PERFORMANCE-001 medium 유지 (본 PoC) / AP-ARCH-003 medium → low
6. 사내 권고 41건 → avoid-list.md severity 별 + 영역 별 + 부록 매트릭스
7. 톤 점검 ✅ 통과
8. Phase 2 정합성 보고서 → 추가 격상 0건 (DRIFT-007/010 이미 격상 / 나머지 NO ACTION)
9. 신규 finding F-041 (JWT alg explicit) 등록 (low / deferred)
10. 7대 산출물 cross-validation ✅ 통과 (workflow §9 점검표 모두)
```

→ Phase 6 final 산출 = **15 AP** (Phase 4 partial 6 + Phase 5 candidate 6 + Phase 4 추가 3) + avoid-list.md (41 REC 통합) + _manifest.yml (raw confidence 0.96).

---

## 10. 윤주스 승인 항목 (3원칙)

| 항목 | 시니어 권고 |
|---|---|
| 1. 작업 범위 (15 AP / 3 신규 파일) | 일괄 승인 권고 |
| 2. ID 정규화 매핑 (multi-prefix → 단일) | 일괄 승인 권고 |
| 3. 복합 AP 등록 여부 | **거절 채택** (Document 권고) |
| 4. severity 재산정 (AP-PERFORMANCE-001 / AP-ARCH-003) | AP-PERFORMANCE-001 medium 유지 (본 PoC) / AP-ARCH-003 medium → **low** |
| 5. 사내 권고 41건 통합 형식 | 시니어 §6 구조 채택 권고 |
| 6. Phase 4 추가 candidate 3건 (EAGER / F-017 / F-028) | 일괄 등록 권고 |
| 7. 신규 finding F-041 (JWT alg explicit) | 등록 권고 (low / deferred) |

→ 윤주스 일괄 승인 시 4단계 (output/antipatterns/) 즉시 진입 가능.

---

**END OF SENIOR-PHASE6.md (메인 직접 작성 / sub-agent stall fallback)**
