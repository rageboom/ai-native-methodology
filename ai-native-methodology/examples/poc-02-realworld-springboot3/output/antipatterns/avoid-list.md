# PoC #02 — Avoid List (회피 후보 우선순위)

> 분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
> 방법론 v1.1.2 / 2026-04-29 / raw confidence 0.96
> 21 AP (critical 3 / high 3 / medium 11 / low 4)

---

## 우선순위 (사내 적용 시)

| Priority | 시점 | severity | AP 수 |
|---|---|---|---|
| **0 — Critical (즉시 차단)** | 0~1주 | critical | 3 |
| 1 — High (1 스프린트) | 1~2주 | high | 3 |
| 2 — Medium (다음 분기) | 1~3개월 | medium | 11 |
| 3 — Low (백로그) | 6개월~ | low | 4 |

---

## Priority 0 — Critical (즉시 차단 / 0~1주)

### AP-API-001 — API spec/runtime status code drift + idempotency 위반

**evidence**: openapi.yaml:380/402 spec 200 OK ↔ ArticleService.java:184 runtime 422 throw + UserController.java:54 runtime 201 (login). RFC 7231 §4.2.2 + RFC 9110 §15.3 이중 위반.

**즉시 fix**:
```java
// favorite/unfavorite — Profile pattern (idempotent)
public void favorite(User user, Article article) {
    if (article.isFavoritedBy(user)) return;  // silent return
    article.addFavorite(user);
}

// login — @ResponseStatus(OK) 또는 default 200 유지 (CREATED 제거)
```

**관련 finding**: F-070 (Phase 4 high → critical 격상) + F-079 + F-085 묶음

### AP-DB-001 — TagJpaRepository<Tag, Integer> 타입 오류

**evidence**: TagJpaRepository.java:7 `JpaRepository<Tag, Integer>` ↔ Tag.java:21 `@Id String name`. Spring Data JPA 3.x lazy validation — runtime ClassCastException 잠복.

**즉시 fix** (1글자 변경):
```java
interface TagJpaRepository extends JpaRepository<Tag, String> {}  // Integer → String
```

**관련 finding**: F-048 (Phase 2 Senior 발견)

### AP-SECURITY-001 — RSA private key git 직접 commit (PoC #01 isomorphic)

**evidence**: `server/api/src/main/resources/app.key` (1678 byte PEM RSA-2048) + app.pub git 직접 commit. application.yaml `security.key.private: classpath:app.key` build jar 내장.

**즉시 fix**:
```bash
# 1단계 — git history 정리
git filter-repo --path server/api/src/main/resources/app.key --invert-paths
git filter-repo --path server/api/src/main/resources/app.pub --invert-paths

# 2단계 — key rotation (compromise 가정)
openssl genrsa -out new_app.key 2048

# 3단계 — application.yaml 환경변수 ref
# security.key.private: ${SECURITY_KEY_PRIVATE_PEM}
# security.key.public: ${SECURITY_KEY_PUBLIC_PEM}

# 4단계 — Vault/KMS 분리 (AWS Parameter Store / HashiCorp Vault / GCP Secret Manager)
```

**관련 finding**: F-068 (Phase 3 Senior 발견 / PoC #01 AP-SECURITY-001 isomorphic)

---

## Priority 1 — High (1 스프린트 / 1~2주)

### AP-ARCH-001 — UserRepositoryAdapter Hexagonal 경계 위반
- evidence: UserRepositoryAdapter.java:65-83 도메인 검증 + encryptPassword 흡수
- fix: UserService 가 도메인 검증 + Adapter 단순 save (Vernon IDDD Ch.4)
- 관련 finding: F-071

### AP-DOMAIN-001 — article.title varchar(50) unique over-constraint
- evidence: schema.sql:9 title UNIQUE + Article.java:40 length=50
- fix: title UNIQUE 제거 + slug 만 unique 유지 (PoC #01 패턴)
- 관련 finding: F-052

### AP-PERFORMANCE-001 — Article.articleTags EAGER + Specification + Pageable HHH000104
- evidence: Article.java:49 @OneToMany EAGER + ArticleSpecifications + Pageable
- fix: LAZY default + @EntityGraph 또는 두 단계 쿼리 (페이징 + 별도 fetch)
- 관련 finding: F-051 (PoC #01 medium → 본 PoC high 격상)

---

## Priority 2 — Medium (다음 분기 / 1~3개월)

### API 카테고리 (5건) — composite view §A 참조
- AP-API-003 (F-082) versioning 부재 / fix: URI path /v1
- AP-API-004 (F-080) limit no max / fix: openapi maximum: 50
- AP-API-005 (F-086) PUT vs PATCH / fix: @PatchMapping + merge-patch
- AP-API-006 (Senior §5.1) controller orchestration / fix: Application Service Pattern
- AP-API-008 (F-087) 307 redirect / fix: server-side internal call

### ARCH 카테고리 (1건) — composite view §B 참조
- AP-ARCH-002 (F-072) Adapter multi-aggregate orchestration / fix: ArticleService 가 multi-aggregate (Vernon IDDD Ch.13)

### DB 카테고리 (2건) — composite view §D 참조
- AP-DB-002 (F-073) FK CASCADE 부재 / fix: ON DELETE CASCADE 또는 Service multi-step delete
- AP-DB-003 (F-069) ArticleSpecifications Cartesian / fix: Subquery 또는 query.distinct(true)

### DOMAIN 카테고리 (2건)
- AP-DOMAIN-002 (F-074) self-follow 부재 / fix: follower.equals(following) guard
- AP-DOMAIN-003 (F-053) titleToSlug 8 함정 / fix: Locale.ROOT + Unicode NFKD + collision retry

---

## Priority 3 — Low (백로그 / 6개월~)

### AP-API-002 — DELETE 200 vs 204 (RealWorld 호환성)
- 본 PoC 한정 low (RFC 9110 §15.3.5 SHOULD / 호환성 사유)
- 사내 신규 medium 격상 권고

### AP-API-007 — x-codegen-request-body-name swagger 2.x legacy
- functional 영향 0 — cosmetic cleanup

### AP-DOMAIN-004 — existsBy* TOCTOU race-prone (educational)
- DB constraint 정상 시 race 회피 — try-catch DataIntegrityViolationException 패턴 권장

### AP-DOMAIN-005 — Article.setTitle TOCTOU race
- AP-DOMAIN-004 와 동일 — Mysterious Name (Fowler Refactoring Ch.3)

### AP-DOMAIN-006 — editTitle/Description/Content Duplicated Code
- Article aggregate 에 edit(requester, EditCommand) 응집 권장

---

## §A. composite view: API 계약 결함 종합 점검

PoC #02 의 API 카테고리 8 AP 중 6개가 단일 패턴 — **OpenAPI spec 과 runtime contract drift**.

**linked AP**: AP-API-001 (critical drift) + AP-API-002 (status) + AP-API-003 (versioning) + AP-API-004 (limit) + AP-API-005 (PATCH) + AP-API-008 (redirect)

**근본 원인**: openapi.yaml 가 truth 가 아닌 documentation 으로만 사용. runtime 결정이 spec 갱신 없이 진행 → drift 누적.

**일괄 fix 전략** (Spring Boot 3.x):
1. **OpenAPI x-extension 도입** (PoC #01 ADR-007 / 묶음 G):
   - api-extension.json 분리 — spec 표준 보전 + 사내 메타 (composes_uc[] / breaks_br[] / spec_runtime_drift{}) 노출
2. **REC-API-* 일괄 적용**:
   - REC-API-IDEMPOTENCY-001 (favorite/unfavorite Profile pattern)
   - REC-API-VERSIONING-001 (URI path /v1)
   - REC-API-PROBLEM-DETAILS-001 (RFC 7807 ProblemDetail / Spring 6 자동 매핑)
   - REC-API-PATCH-001 (RFC 5789 application/merge-patch+json)
   - REC-API-LIMIT-CAP-001 (openapi maximum: 50)
3. **Spring Security 6 OAuth2 Resource Server** + **Spring 6 ProblemDetail** 마이그레이션 (REC-API-BEARER-MIGRATION-001)
4. **OpenAPI 3.0.1 → 3.1 격상** (REC-API-OPENAPI-31-001 — 선택)

**RFC 권위 묶음**: RFC 7231 §4.2.2 (idempotency) / RFC 9110 §15.3 (status codes) / RFC 5789 (PATCH) / RFC 7807/9457 (Problem Details) / RFC 6750 (Bearer)

---

## §B. composite view: Hexagonal port-adapter 경계 종합 점검

PoC #02 의 Hexagonal 도입 부산물 — adapter 가 도메인 검증 + multi-aggregate orchestration 흡수.

**linked AP**: AP-ARCH-001 (UserRepositoryAdapter) + AP-ARCH-002 (ArticleRepositoryAdapter)
**linked finding**: F-075 (메타 — Hexagonal 가이드 방법론 본체 / v1.2.0 묶음 J)

**근본 원인**: Hexagonal naming 은 도입했으나 **port-adapter 책임 경계 가이드 부재**. adapter 가 IDDD Ch.4 위반 패턴 복제.

**일괄 fix 전략**:
1. **Service 단 도메인 검증 + multi-aggregate orchestration**:
   - UserService.updateUserDetails 가 email/username unique 검증 + encryptPassword
   - ArticleService.delete 가 article_comment + article_favorite + article_tag multi-step delete
2. **Adapter 단순 save/delete**:
   - UserRepositoryAdapter / ArticleRepositoryAdapter 는 protocol translation only
3. **ArchUnit 검증 추가**:
   ```java
   classes().that().resideInAPackage("..persistence..")
       .should().notDependOnClassesThat().resideInAPackage("..service..");
   ```
4. **Vernon IDDD Ch.4 (port-adapter) + Ch.13 (Application Service)** 가이드 사내 표준화

**권위**: Wikipedia Hex Arch / Cockburn (2005) / Vernon IDDD (2013) Ch.4 pp.115-127 + Ch.13 pp.521-533 / Evans DDD (2003) Ch.6

---

## §C. composite view: JWT/Auth 보안 종합 점검 (PoC #01 동형)

**PoC #01 + PoC #02 공통 패턴** — Cryptographic Failures + Hand-rolled authentication.

**linked AP**: AP-SECURITY-001 (RSA git commit) + AP-API-006 (controller orchestration)
**linked finding**: F-084 (Token apiKey 비표준 RFC 6750 — recommendation only)

**근본 원인**: 자체 JWT/Auth 구현 → 운영 secret 관리 + 표준 미준수 + git leak 위험.

**일괄 fix 전략**:
1. **Spring Security 6 OAuth2 Resource Server** 도입:
   ```yaml
   spring.security.oauth2.resourceserver.jwt.public-key-location: ${JWT_PUBLIC_KEY_LOCATION}
   ```
2. **Bearer JWT 표준화** (RFC 6750):
   - openapi.yaml `Token: { type: apiKey }` → `Bearer: { type: http, scheme: bearer, bearerFormat: JWT }`
   - JwtAuthenticationFilter 제거 (Spring 표준 모듈 사용)
3. **Vault/KMS 분리**:
   - app.key git history 정리 (filter-repo)
   - 환경변수 또는 secret manager (AWS Parameter Store / HashiCorp Vault / GCP Secret Manager)
   - key rotation 자동화 (compromise 가정)
4. **Application Service Pattern** (AP-API-006 fix):
   - Controller 의 multi-service orchestration → Application Service 응집

**권위**:
- OWASP Top 10 A02:2021 Cryptographic Failures + A07 Identification and Authentication Failures
- CWE-321 Hard-coded Cryptographic Key + CWE-798 Hard-coded Credentials
- NIST SP 800-57 Part 1 Rev.5 §5.3.5 (Key Storage)
- Thoughtworks Tech Radar Vol.30/31 HOLD ring "Hand-rolled authentication"
- RFC 6750 (Bearer Token Usage) / Vernon IDDD Ch.13 (Application Service)

---

## §D. composite view: 데이터 무결성 종합 점검

PoC #02 신규 — DB 카테고리 패턴화 (PoC #01 단일 AP-DB-001 → PoC #02 3건).

**linked AP**: AP-DB-001 (TagJpaRepository 타입) + AP-DB-002 (CASCADE 부재) + AP-DB-003 (Cartesian)

**근본 원인**: ORM 레이어 type-safety + cascade + Specification 함정 — Spring Data JPA / JPA Criteria API 의 hidden 영역.

**일괄 fix 전략**:
1. **Repository generic cross-check**:
   - TagJpaRepository<Tag, Integer> → <Tag, String> (1글자)
   - 사내 표준 ide inspector / ArchUnit 검증 도입
2. **ON DELETE CASCADE 명시**:
   - article_favorites / article_tags / article_comments 모두 ON DELETE CASCADE
   - 또는 Service 단 명시적 multi-step delete (AP-ARCH-002 fix 와 합산)
3. **JPA Specifications 안전 패턴**:
   - `query.from(...)` 새 root 추가 회피 → Subquery 사용
   - 또는 query.distinct(true) 명시
   - JOIN type 명시 (LEFT/INNER)
4. **Vlad Mihalcea + Hibernate User Guide** 표준 권고:
   - LAZY default + @EntityGraph 명시 (AP-PERFORMANCE-001 fix 와 합산)
   - Pageable + collection fetch 절대 회피 (HHH000104)

**권위**: Spring Data JPA Reference §1.2.4 / Vlad Mihalcea blog / Hibernate User Guide / OWASP A04:2021 Insecure Design

---

## 부록 A — AP × REC 매트릭스 (사내 적용 권고)

| AP | REC | Priority | 비용 | 비고 |
|---|---|---|---|---|
| AP-API-001 | REC-API-IDEMPOTENCY-001 | 0 (즉시) | low | 코드 8 line 변경 |
| AP-DB-001 | REC-DB-TYPE-FIX | 0 (즉시) | trivial | 1글자 변경 |
| AP-SECURITY-001 | REC-SECURITY-VAULT-MIGRATION | 0 (즉시) | high | git filter-repo + key rotation + Vault |
| AP-ARCH-001 | REC-ARCH-PORT-ADAPTER-BOUNDARY | 1 | medium | UserService 리팩토링 |
| AP-DOMAIN-001 | REC-DB-OVER-CONSTRAINT-FIX | 1 | low | DB UQ 제거 + JPA unique=false |
| AP-PERFORMANCE-001 | REC-PERFORMANCE-LAZY-MIGRATION | 1 | medium | EAGER → LAZY + @EntityGraph |
| AP-API-003 | REC-API-VERSIONING-001 | 2 | high | URI path /v1 마이그레이션 |
| AP-API-004 | REC-API-LIMIT-CAP-001 | 2 | low | openapi maximum: 50 |
| AP-API-005 | REC-API-PATCH-001 | 2 | medium | PUT → PATCH |
| AP-API-006 | REC-API-APPLICATION-SERVICE | 2 | medium | UseCase 도입 |
| AP-API-008 | REC-API-NO-INTERNAL-REDIRECT | 2 | low | server-side internal call |
| AP-ARCH-002 | REC-ARCH-MULTI-AGGREGATE-SERVICE | 2 | medium | ArticleService 리팩토링 |
| AP-DB-002 | REC-DB-CASCADE-EXPLICIT | 2 | low | ON DELETE CASCADE |
| AP-DB-003 | REC-DB-SPECIFICATIONS-SUBQUERY | 2 | medium | Subquery 패턴 |
| AP-DOMAIN-002 | REC-DOMAIN-SELF-FOLLOW-GUARD | 2 | trivial | 1 line guard |
| AP-DOMAIN-003 | REC-DOMAIN-SLUG-LOCALE | 2 | medium | NFKD + collision retry |
| AP-API-002 | REC-API-STATUS-EXPLICIT-001 | 3 | trivial | @ResponseStatus 명시 |
| AP-API-007 | REC-API-CODEGEN-CLEANUP-001 | 3 | trivial | 5건 line 제거 |
| AP-DOMAIN-004 | REC-DOMAIN-RACE-SAFE-PATTERN | 3 | low | try-catch DataIntegrityViolationException |
| AP-DOMAIN-005 | REC-DOMAIN-RENAME-METHOD | 3 | trivial | setTitle → rename |
| AP-DOMAIN-006 | REC-DOMAIN-AGGREGATE-EDIT | 3 | low | edit(EditCommand) 응집 |

총 **21 AP × 21 REC** = 1:1 매핑 + composite remediation 4건.

---

## 부록 B — Phase 6 final 검증 점검표

- [x] schema 검증 통과 (`^AP-[A-Z]+-\d+$` unique 21/21)
- [x] tone check (비난 표현 0)
- [x] critical/high 5건 `human_review_required` 명시 (AP-API-001 / AP-DB-001 / AP-SECURITY-001 / AP-ARCH-001 / AP-PERFORMANCE-001)
- [x] composite view 4건 별도 표기 (`_composite_view_metadata`)
- [x] PoC #01 15 AP cross-validation 표 (`_poc_01_cross_validation_summary`)
- [x] `_id_normalization_mapping` 표 (Phase 4/5 multi-prefix → Phase 6 single)
- [x] 모든 AP `finding_ref` 양방향 cross-link
- [x] PoC #02 산출물 6/7 도달 (UI/UX 제외 100%)

---

## 부록 C — 모범 사례 (positive findings) ★ PoC #02 신규

PoC #02 가 PoC #01 대비 우월한 architectural 결정 — 사내 적용 시 **권고 모범 사례**.

### F-064 — compileOnly + runtimeOnly Gradle scope (★)
- server/api 가 `compileOnly(:module:core)` + `runtimeOnly(:module:persistence)` 분리
- → server/api 가 module/persistence 클래스를 **컴파일 시점에 import 자체 불가능**
- → PoC #01 LV-001 (Outside-in 위반) 가 build system 차원에서 차단
- → 사내 신규 multi-module 프로젝트 권고 표준

### F-065 — AP-ARCH-001 (LV-001) 비재현 (positive)
- PoC #01 medium AP 가 multi-module compileOnly+runtimeOnly 차단으로 비재현
- → "stack 마이그레이션 권고" 패턴 정합 — 단일 모듈 → multi-module 전환 권고

### F-066 — CIRCULAR-001 비재현 (positive)
- 5 @Service 모두 자급 (Service 간 import 0건) → SCC = 5 singleton
- → port/adapter 격리 효과 입증

---

## 부록 D — PoC #01 비교 매트릭스 (15 AP cross-validation)

| PoC #01 AP | severity | PoC #02 결과 | 판정 |
|---|---|---|---|
| AP-DOMAIN-001 (De Morgan) | critical | ❌ **비재현** | ArticleCommentService 깔끔 — Hexagonal 분리 효과 |
| AP-SECURITY-001 (JWT 21byte) | critical | ⚠️ **변형 재현** | RSA key git commit (F-068) → AP-SECURITY-001 isomorphic critical 유지 |
| AP-DOMAIN-002 (email/username unique) | high | ⚠️ **부분 재현** | race-safe DB UQ + race-prone TOCTOU (F-058) |
| AP-PERFORMANCE-002 (Pageable cap) | high | ❌ **비재현 + 회피** | ArticleFacets:21 cap 50 명시 |
| AP-ARCH-001 (LV-001) | medium | ❌ **비재현** | multi-module compileOnly+runtimeOnly 차단 (F-065) |
| AP-ARCH-002 (LV-002) | medium | ⚠️ **부분 재현** | core 가 @Service/@Entity (F-062) — 한국 hybrid caveat |
| AP-DB-001 (NO ACTION FK) | medium | ✅ **재현** | F-073 → AP-DB-002 |
| AP-SECURITY-002 (sessionCreationPolicy) | medium | ❌ 비재현 | OAuth2 RS 사용 — 학습 효과 |
| AP-SECURITY-003 (WebSecurity#ignoring) | medium | ❌ 비재현 | OAuth2 RS 사용 — 학습 효과 |
| AP-API-001 (versioning) | medium | ✅ **재현** | F-082 → AP-API-003 |
| AP-PERFORMANCE-001 (EAGER N+1) | medium | ✅ **재현 + 격상** | F-051 medium → high (Specification + Pageable evidence) |
| AP-API-002 (HTTP status) | low | ✅ **재현** | F-083 → AP-API-002 (low maintained) |
| AP-DOMAIN-003 (@Embeddable @ManyToMany) | low | ❌ 비재현 | explicit junction entity 정합 |
| AP-DOMAIN-004 (User equals/hashCode) | low | ❌ 비재현 | getId UUID 의존 |
| AP-ARCH-003 (deprecated WebSecConfigurerAdapter) | low | ❌ 비재현 | Spring Boot 3.3 + SecurityFilterChain bean |

**핵심 통계**:
- 비재현 8건 (53%) — 학습 효과 + Hexagonal/Spring Boot 3.x 마이그레이션 효과
- 재현 4건 (27%) — v1.2.0 합산 격상 강한 권위 데이터
- 변형 재현 3건 (20%) — pattern 학습 후 다른 형태 발현

**v1.2.0 격상 합산 데이터**:
- 묶음 G (OpenAPI x-extension) — PoC #02 외부 검증 ✅
- 묶음 H (Auth/Crypto 검증 가이드) — PoC #01 + PoC #02 isomorphic evidence 강력
- 묶음 J (Hexagonal port-adapter 가이드) — PoC #02 단독 신규 (F-075)
- 묶음 K (multi-module Outside-in 모범 사례) — F-064/F-065/F-066 positive findings

---

**END OF avoid-list.md**
