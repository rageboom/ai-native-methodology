# PoC #02 — Migration Cautions (신규 시스템 구축 시 회피 가이드)

> **본 문서의 목적**: PoC #02 에서 발견한 21 안티패턴을 **신규 시스템 구축 시 회피하기 위한 가이드**.
>
> **avoid-list.md 와의 차이**:
> - avoid-list.md = "기존 시스템 (PoC #02) 에서 발견된 패턴 + 즉시 fix"
> - migration-cautions.md = "신규 시스템 구축 시 design/review/CI 단계에서 차단 가이드"
>
> 분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
> 방법론 v1.1.2 (v1.2.0 격상 시 묶음 P 정식 산출물)
> 신설: 2026-04-30 (DEC-2026-04-29-안티패턴-마이그레이션-가이드 β)

---

## 카테고리별 회피 가이드 (신규 시스템 design 단계)

### A. API 영역 (8 AP)

#### A-1. API 설계 표준 ADR 의무
**근거 AP**: AP-API-001 (critical) / AP-API-002 (low) / AP-API-003 (medium) / AP-API-005 (medium)

**design 단계**:
- ✅ idempotent endpoint 는 OpenAPI spec 작성 단계부터 200 OK 명시 + same-state 시 silent return 패턴 강제 (Profile follow/unfollow 표준)
- ✅ DELETE 성공은 RFC 9110 §15.3.5 권고대로 **204 No Content** (body 없음)
- ✅ API 버저닝 (info.version + servers + path /v1) 첫 release 부터 의무
- ✅ 부분 갱신은 RFC 5789 **PATCH** 사용 — PUT 은 전체 replace 의미 보존
- ✅ login 등 resource creation 의미가 모호한 endpoint 는 `@ResponseStatus` 명시 의무

**CI 의무**:
- spec/runtime drift 검증 (rest-assured contract test 또는 Pact)
- spec breaking change 검증 (oasdiff)
- limit/page 파라미터 maximum cap 검증 (OWASP API4:2023 회피)

**팀 학습**:
- RFC 7231 §4.2.2 (idempotency) + RFC 9110 §15.3 (status code) ADR 등록

#### A-2. Controller 책임 분리
**근거 AP**: AP-API-006 (medium) / AP-API-008 (medium)

**design 단계**:
- ✅ Controller 는 단일 Application Service 호출만 (Vernon IDDD Application Service Pattern)
- ✅ multi-service orchestration 은 Application Service 또는 Saga 도입
- ✅ signup 후 login 자동 흐름은 internal call 또는 redirect (3xx) 명시 — `ModelAndView` leak 금지

#### A-3. OpenAPI 표준
**근거 AP**: AP-API-004 (medium) / AP-API-007 (low)

**design 단계**:
- ✅ OpenAPI 3.x 만 사용 — swagger 2.x x-codegen-* legacy artifact 제거
- ✅ limit/page 파라미터 maximum cap 명시 (예: max=100)

---

### B. DB 영역 (3 AP)

#### B-1. Spring Data JPA 표준
**근거 AP**: AP-DB-001 (critical) / AP-DB-003 (medium)

**design 단계**:
- ✅ Repository 선언 시 entity `@Id` 타입과 generic ID 타입 cross-check 의무 (예: `TagJpaRepository<Tag, String>`)
- ✅ JPA Specification 사용 시 fetch join + distinct 조합 금지 — Cartesian product 위험

**CI 의무**:
- ArchUnit 또는 사내 IDE inspection rule — generic-id mismatch 차단
- EXPLAIN ANALYZE 로 query plan 사전 검증

**팀 학습**:
- Spring Data JPA Reference §1.2.4 (RepositoryFactorySupport lazy validation 함정)

#### B-2. 참조 무결성
**근거 AP**: AP-DB-002 (medium)

**design 단계**:
- ✅ parent-child entity 삭제 시 `ON DELETE CASCADE` 명시 또는 Service 의 transactional cleanup 표준
- ✅ orphan row 검증 nightly job 의무

---

### C. Security 영역 (1 AP)

#### C-1. ★★★ 비밀 관리 표준 (★ critical 영역)
**근거 AP**: AP-SECURITY-001 (critical)

**design 단계 (절대 의무)**:
- ❌ RSA/JWT key git commit 절대 금지 — pre-commit hook (gitleaks / detect-secrets) 의무
- ✅ AWS Parameter Store / HashiCorp Vault / GCP Secret Manager 분리 표준 (환경변수 `${KEY_*}` 로 ref)
- ✅ Spring Security 6 OAuth2 Resource Server 권고 + `jwt.public-key-location` 환경변수
- ❌ `classpath:*.key` 형태 절대 금지

**운영 의무**:
- GitHub Secret Scanning 활성화 + 정기 audit (3개월)
- ADR 등록 + PR template 체크
- key rotation 정책 명시

**팀 학습 의무**:
- NIST SP 800-57 Part 1 Rev.5 §5.3.5
- OWASP A02:2021 Cryptographic Failures
- CWE-321 / CWE-798
- 사례: Uber 2017 GitHub leak / Toyota 2022 source code leak

---

### D. Architecture 영역 (2 AP)

#### D-1. Hexagonal/Onion 경계 책임
**근거 AP**: AP-ARCH-001 (high) / AP-ARCH-002 (medium)

**design 단계**:
- ✅ Hexagonal/Onion 채택 시 port-adapter 경계 책임 분리 ADR 등록
- ✅ Adapter 는 단순 DB 매핑만 — 도메인 검증은 Service 또는 Aggregate Root 의무
- ✅ Adapter 의 multi-aggregate orchestration 금지 — Application Service 또는 Domain Event 사용

**CI 의무**:
- ArchUnit dependency rule 로 Adapter → Domain 검증 호출 차단
- ArchUnit rule 로 Adapter 의 multi-repository 호출 차단

**팀 학습**:
- Vernon IDDD Ch.4 (Architecture) + Application Service Pattern

**리뷰 체크리스트**:
- "Adapter 가 비즈니스 로직 포함하는가?"
- "Adapter 가 multi-aggregate 처리하는가?"

---

### E. Domain 영역 (6 AP)

#### E-1. Aggregate Root invariant
**근거 AP**: AP-DOMAIN-001 (high) / AP-DOMAIN-002 (medium) / AP-DOMAIN-005 (low) / AP-DOMAIN-006 (low)

**design 단계**:
- ✅ DB 컬럼 길이/제약 결정 시 비즈니스 요구 vs 표준 한계 명시 (varchar 255 또는 TEXT 권장)
- ✅ UNIQUE 제약 추가 전 비즈니스 의미 검토 — "title 이 정말 globally unique 인가?"
- ✅ relationship/follow 등 self-reference 가능 도메인은 Aggregate Root invariant 로 self-reference 차단 (Domain 검증 가장 강력) + DB CHECK 보강
- ✅ setter 기반 mutation 금지 — Aggregate Root 의 method 로 의미 명시 (예: `rename`, `retitle`) + optimistic locking (`@Version`)
- ✅ 유사 메서드는 단일 update + DTO/Builder 통합 — Duplicated Code 회피

**PoC 단계**:
- sample data 충돌 빈도 측정
- 후속 마이그레이션 비용 (ALTER COLUMN UNIQUE 제거 = downtime 위험) 사전 계산

#### E-2. Race Safety 표준
**근거 AP**: AP-DOMAIN-004 (low — race-prone framework)

**design 단계**:
- ✅ existsBy + insert 패턴은 race window 존재 — DB UNIQUE 제약 의무 (race-safe) + Service catch ConstraintViolation
- ❌ App pre-check 단독 금지 (1중 race-prone)

#### E-3. Slug/Identifier 생성
**근거 AP**: AP-DOMAIN-003 (medium)

**design 단계**:
- ✅ slug/identifier 생성은 ICU4J 또는 표준 transliteration 라이브러리 사용
- ✅ UNIQUE 충돌 시 fallback 전략 (suffix counter) 의무
- ⚠️ Locale/Unicode/collision 8 함정 인지

---

### F. Performance 영역 (1 AP)

#### F-1. JPA Fetch 전략 표준
**근거 AP**: AP-PERFORMANCE-001 (high)

**design 단계**:
- ✅ JPA fetch 전략 default **LAZY** + 명시적 JOIN FETCH 패턴 표준 (Vlad Mihalcea 권위)
- ❌ Specification + Pageable + EAGER 조합 절대 금지 — HHH000104 in-memory pagination fallback 발생

**개발 환경 의무**:
- p6spy 또는 datasource-proxy 로 dev 환경 query 모니터링
- Hibernate query plan cache + statistics 활성화 + threshold alert

**팀 학습**:
- Vlad Mihalcea, *High-Performance Java Persistence*
- 토스 SLASH "게시판 도메인의 N+1 회고" 사례

---

## ★ 신규 시스템 구축 체크리스트 (요약)

### Design 단계
```
[Architecture]
□ Hexagonal/Onion port-adapter 경계 ADR 등록
□ Application Service Pattern ADR 등록
□ Aggregate Root invariant 명시 (state-machine + decision-table)

[API]
□ OpenAPI spec 작성 시 idempotent endpoint 200 OK 일관
□ API 버저닝 첫 release 부터 의무
□ DELETE = 204 / PUT vs PATCH 표준 ADR
□ limit/page maximum cap 명시

[DB]
□ Repository<Entity, IdType> generic ID 정합 검증
□ ON DELETE CASCADE 또는 transactional cleanup 표준
□ JPA Specification + fetch join + distinct 조합 금지
□ DB UNIQUE 제약 의무 (App pre-check 보조)

[Security]
□ key/secret 관리: Vault/Parameter Store (절대 git commit 금지)
□ pre-commit hook (gitleaks) 의무
□ Spring Security 6 OAuth2 Resource Server 표준

[Performance]
□ JPA default LAZY + JOIN FETCH
□ p6spy/datasource-proxy dev 환경 의무
```

### CI 단계
```
□ Spec/runtime contract test (rest-assured / Pact)
□ Spec breaking change 검증 (oasdiff)
□ ArchUnit dependency rule (port-adapter 경계)
□ ArchUnit generic-id mismatch 검증
□ EXPLAIN ANALYZE query plan 검증
□ GitHub Secret Scanning + 3개월 audit
□ Property-based test (Phase 4.5 invariant 검증)
```

### Review 단계
```
□ Adapter 가 비즈니스 로직 포함? → 차단
□ Adapter 가 multi-aggregate 처리? → 차단
□ classpath:*.key 형태? → 차단
□ EAGER fetch + Pageable? → 차단
□ existsBy + insert (DB UQ 없이)? → 차단
```

---

## 적용 우선순위 (severity 기반)

| Priority | 적용 시점 | 근거 AP 수 | 신규 시스템 영향 |
|---|---|---|---|
| **★★★ Critical (절대 의무)** | Design 시작 시점 | 3 | Security key 관리 / DB type-safety / API contract 정합 |
| **★★ High (Sprint 0 ADR)** | 첫 sprint | 3 | Hexagonal 경계 / DB 제약 / JPA 전략 |
| **★ Medium (Sprint 1)** | 1~2 sprint | 10 | Controller 책임 / OpenAPI 표준 / Domain 가이드 |
| Low (style guide)| 분기 | 5 | 일관성 / DRY / RFC 정합 |

---

## 변경 이력

| 일자 | 버전 | 변경 |
|---|---|---|
| 2026-04-30 | v1.2.0 (예정) | 신설 — Phase 6 의무 산출물 격상 (DEC-안티패턴-마이그레이션-가이드 β). |

---

## 참조

- `antipatterns.json` (각 AP 의 `migration_advice` 필드 — 본 문서의 SoT)
- `avoid-list.md` (기존 시스템 fix 가이드 — 본 문서와 별도)
- `methodology-spec/workflow/phase-6-quality.md` (Phase 6 의무 산출물 명세)
- DEC-2026-04-29-안티패턴-마이그레이션-가이드 (사상적 모체)
