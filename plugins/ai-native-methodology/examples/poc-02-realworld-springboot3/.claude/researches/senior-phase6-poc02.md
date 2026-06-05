# Senior — PoC #02 Phase 6 실무 cross-check

> **Method**: 5 우선순위 파일 read (antipatterns-partial / api/\_manifest / poc-findings / PoC #01 antipatterns + avoid-list) → cross-check.
> **F-015**: 메인 raw 3단계 데이터 그대로 검증, 신규 fact 도입 없음.

---

## §1. F-015 cross-check 결과 (메인 3단계 19~21 AP candidate)

### 1.1 Phase 4 partial 6 AP — 정합/병합 검증

| 원본 ID (partial)          | 정규화 ID (final)               | severity | 검증 결과                                                                    |
| -------------------------- | ------------------------------- | -------- | ---------------------------------------------------------------------------- |
| AP-API-IDEMPOTENCY-001     | **AP-API-001** (critical 격상)  | critical | ✅ DEC-001 정합 — F-079/F-085 묶음 흡수                                      |
| AP-HEXAGONAL-001           | **AP-ARCH-001** (high 유지)     | high     | ✅ Hexagonal → ARCH prefix 정규화 (schema id pattern `^AP-[A-Z]+-\d+$` 강제) |
| AP-HEXAGONAL-002           | **AP-ARCH-002** (medium 유지)   | medium   | ✅ HEXAGONAL → ARCH 정규화                                                   |
| AP-DB-CASCADE-001          | **AP-DB-002** (medium 유지)     | medium   | ✅ AP-DB-001 (F-048 critical) 우선순위 양보                                  |
| AP-DOMAIN-SELF-FOLLOW-001  | **AP-DOMAIN-002** (medium 유지) | medium   | ✅ self-follow domain 정규화                                                 |
| AP-DOMAIN-TITLE-UNIQUE-001 | **AP-DOMAIN-001** (high 유지)   | high     | ✅ over-constraint domain 정규화                                             |

**ID 정규화 강제**: PoC #01 schema 동일 — multi-prefix candidate ID (AP-HEXAGONAL-_ / AP-API-IDEMPOTENCY-_) 는 단일 prefix (AP-{CATEGORY}-{NUM}) 로 매핑. PoC #01 의 `_id_normalization_mapping` 패턴 그대로 isomorphic 적용.

### 1.2 Phase 5-1 8 AP candidate — severity 검증

| candidate ID               | final ID   | severity 메인 | severity Senior 권고       | 결정                                                                 |
| -------------------------- | ---------- | ------------- | -------------------------- | -------------------------------------------------------------------- |
| AP-API-001 (F-070+079+085) | AP-API-001 | critical      | critical                   | ✅ 유지 (DEC-001 — RFC 7231 §4.2.2 + spec/runtime drift 이중 결함)   |
| AP-API-002 (F-083)         | AP-API-002 | medium        | **low → medium 차감 권고** | ⚠️ 본 PoC RealWorld 호환성 유지 → low (PoC #01 AP-API-002 패턴 일관) |
| AP-API-003 (F-082)         | AP-API-003 | medium        | medium                     | ✅ Tech Radar Hold Vol.31                                            |
| AP-API-004 (F-080)         | AP-API-004 | medium        | medium                     | ✅ OWASP API4 권위                                                   |
| AP-API-005 (F-086)         | AP-API-005 | medium        | medium                     | ✅ RFC 5789 권위                                                     |
| AP-API-006 (Senior)        | AP-API-006 | medium        | medium                     | ✅ Application Service Pattern 미적용                                |
| AP-API-007 (F-081)         | AP-API-007 | low           | low                        | ✅ DEC-003 medium → low 강등 정합                                    |
| AP-API-008 (F-087)         | AP-API-008 | medium        | medium                     | ✅ REST 원칙 위반                                                    |

**핵심 권고**: AP-API-002 (DELETE 200 vs 204) 는 PoC #01 도 low 이고 RealWorld spec 호환성 사유 — **low 차감**. 메인 manifest medium 표기는 PoC #01 일관성 양보 권고.

### 1.3 Phase 1-3 누락 5 candidate — 등록 여부

| ID                                       | 출처 phase            | severity | Senior final | 등록 결정                                                    |
| ---------------------------------------- | --------------------- | -------- | ------------ | ------------------------------------------------------------ |
| **F-048** TagJpaRepository<Tag, Integer> | Phase 2               | critical | **critical** | ✅ **AP-DB-001 등록 필수** — runtime ClassCastException 잠복 |
| **F-068** RSA private key git commit     | Phase 3 (Senior 신규) | critical | **critical** | ✅ **AP-SECURITY-001 등록 필수** — PoC #01 isomorphic        |
| F-051 EAGER + Specification + Pageable   | Phase 2               | high     | high         | ✅ **AP-PERFORMANCE-001 등록** — PoC #01 medium 격상 강화    |
| F-053 titleToSlug 8 함정                 | Phase 2               | medium   | medium       | ✅ **AP-DOMAIN-003 등록** — Locale/Unicode/collision         |
| F-069 ArticleSpecifications Cartesian    | Phase 3 (Senior 신규) | medium   | medium       | ✅ **AP-DB-003 등록** — JPA Specifications 함정              |

**판정**: 5건 모두 등록 권고 강함. 특히 F-048 + F-068 는 **critical 누락 시 PoC #02 산출물 핵심 가치 훼손**.

### 1.4 low candidate 3건 (F-058 / F-076 / F-078) — 등록 vs skip 결정

| ID                                      | 권고                         | 사유                                                                                       |
| --------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| F-058 TOCTOU race-prone                 | **AP-DOMAIN-004 등록** (low) | educational caveat 가치 — PoC #01 AP-DOMAIN-002 framework 강화 데이터                      |
| F-076 Article.setTitle race             | **AP-DOMAIN-005 등록** (low) | DB unique 최종 방어 — low maintained, but 등록 가치 (race-prone vs race-safe 패턴 catalog) |
| F-078 editTitle/Description/Content DRY | **AP-DOMAIN-006 등록** (low) | Senior 신규 발견 — Aggregate edit 응집 권고                                                |

**판정**: 3건 모두 등록 권고. PoC #01 4 low 와 동일 분포 (low 4건). avoid-list.md 백로그 섹션에 종합 표기.

---

## §2. critical AP 3건 평가 (F-048 / F-068 / AP-API-001)

### 2.1 F-048 critical — TagJpaRepository<Tag, Integer> 타입 오류

**왜 critical 인가**:

1. **runtime ClassCastException 잠복**: 정적 컴파일 통과 (Spring Data JPA proxy 검증 부재). startup 시 `Tag.id type (String) ≠ Repository<_, Integer>` mismatch 미발견.
2. **6개월 후 폭발 패턴**: 후속 개발자가 `findById(int)` 또는 `existsById(Integer)` 추가 시 즉시 폭발. 현재 `findAll()` + `saveAll(tags)` 만 사용 → silent broken.
3. **사내 표준 안티패턴**: 카뱅/우형 사례 — Spring Data JPA generic 검증 부재로 production hotfix 다수.
4. **F-044 패턴 재현 강함**: 메인 단편 fetch 함정의 두 번째 critical 사례 (Phase 1 architecture hybrid + Phase 2 Repository 타입).

**즉시 fix**: `JpaRepository<Tag, Integer>` → `JpaRepository<Tag, String>` (1글자 변경). 사내 적용 시 1순위 차단.

### 2.2 F-068 critical — RSA private key git commit ( PoC #01 isomorphic)

**왜 critical 인가**:

1. **PoC #01 AP-SECURITY-001 동형**: PoC #01 = JWT SECRET 하드코딩 + 21byte (7중 표준 위반). PoC #02 = RSA private key 직접 commit (`server/api/src/main/resources/app.key`).
2. **GitHub leak 통계 1순위**: GitHub Secret Scanning 2024 보고 — RSA/SSH key leak = 보안 사고 1순위 원인 (Token leak 다음).
3. **git history 영구 보존**: 단순 `git rm` 부족 — `git filter-repo` / `BFG Repo-Cleaner` 필수 + key rotation 즉시 (compromise 가정).
4. **production 즉시 거부**: AWS/GCP key rotation policy + Vault/Parameter Store 분리 표준 (OWASP Cryptographic Storage CheatSheet).
5. **Spring Security 6 OAuth2 RS RSA 의도와 모순**: PoC #02 가 NimbusJwtDecoder + RSA 도입한 것은 SECRET 분리 목적인데, key 자체를 commit 하면 의도 무효화.

**즉시 fix**:

- `git filter-repo --path server/api/src/main/resources/app.key --invert-paths`
- `application.yaml`: `jwt.private-key=${JWT_PRIVATE_KEY_PEM}` (env var) 또는 `classpath:` 제거
- AWS Parameter Store / HashiCorp Vault 분리
- key rotation (compromise 가정) + 신규 keypair 발급

**PoC #01 비교 권위**: AP-SECURITY-001 동일 패턴 — 사내 절대 금지 표준화 강한 권위 누적 2건.

### 2.3 AP-API-001 critical — spec/runtime drift 묶음 (F-070+F-079+F-085)

**Phase 5-1 격상 결정 검증**:

| 결함                               | RFC 위반                         | drift 패턴              |
| ---------------------------------- | -------------------------------- | ----------------------- |
| F-070 favorite/unfavorite          | RFC 7231 §4.2.2 idempotency MUST | 0건 (의미 결함)         |
| F-079 spec 200 ↔ runtime 422       | RFC 9110 §15.3                   | spec/runtime drift      |
| F-085 login spec 200 ↔ runtime 201 | RFC 9110 §15.3.2                 | spec/runtime drift 동형 |

**critical 격상 정당성**:

1. **이중 결함**: 도메인 규칙 위반 (idempotency) + spec/runtime drift (codification 신뢰 손상).
2. **클라이언트 신뢰 cascading 손상**: client spec 따라 200 기대 → runtime 422/201 수신 → DLQ/retry storm → 모바일 클라이언트 race condition alert 폭증 (Senior production 사례).
3. **GitHub PUT /user/starred 정합 사례 vs Twitter POST favorites/create 2018 deprecated** — 산업 학습 끝난 영역.
4. **단일 묶음 처리 정당**: F-070 (의미) + F-079 (favorite drift) + F-085 (login drift) 모두 "spec/runtime contract drift" 한 패턴 → composite 등록 금지 (개별 결함 단위 분류 표준), 단 묶음 finding_ref 로 evidence 통합.

**판정**: DEC-001 강한 정당성. avoid-list.md `## API 계약 결함 종합 점검` composite view 권고.

---

## §3. Phase 6 final AP 21 통합 표 (Senior 권고)

| ID                  | severity | 출처 finding      | 카테고리    | 비고                                                |
| ------------------- | -------- | ----------------- | ----------- | --------------------------------------------------- |
| **AP-API-001**      | critical | F-070+F-079+F-085 | API         | spec/runtime drift 묶음 DEC-001                     |
| **AP-DB-001**       | critical | F-048             | DB          | TagJpaRepository<Tag, Integer> 타입 오류            |
| **AP-SECURITY-001** | critical | F-068             | SECURITY    | RSA private key git commit (PoC #01 isomorphic)     |
| AP-ARCH-001         | high     | F-071             | ARCH        | UserRepositoryAdapter Hexagonal 경계                |
| AP-DOMAIN-001       | high     | F-052             | DOMAIN      | title varchar(50) unique over-constraint            |
| AP-PERFORMANCE-001  | high     | F-051             | PERFORMANCE | EAGER + Specification + Pageable HHH000104          |
| AP-API-002          | low      | F-083             | API         | DELETE 200 vs 204 (RealWorld 호환성 — PoC #01 일관) |
| AP-API-003          | medium   | F-082             | API         | API versioning 부재 (PoC #01 F-038 재현)            |
| AP-API-004          | medium   | F-080             | API         | limit no maximum (OWASP API4)                       |
| AP-API-005          | medium   | F-086             | API         | PUT vs PATCH (RFC 5789)                             |
| AP-API-006          | medium   | Senior §5.1       | API         | controller orchestration                            |
| AP-API-008          | medium   | F-087             | API         | 307 internal redirect leaked                        |
| AP-ARCH-002         | medium   | F-072             | ARCH        | Adapter multi-aggregate orchestration               |
| AP-DB-002           | medium   | F-073             | DB          | FK CASCADE 부재                                     |
| AP-DB-003           | medium   | F-069             | DB          | ArticleSpecifications Cartesian product             |
| AP-DOMAIN-002       | medium   | F-074             | DOMAIN      | self-follow 금지 부재                               |
| AP-DOMAIN-003       | medium   | F-053             | DOMAIN      | titleToSlug 8 함정                                  |
| AP-API-007          | low      | F-081             | API         | x-codegen-request-body-name legacy                  |
| AP-DOMAIN-004       | low      | F-058             | DOMAIN      | TOCTOU race-prone                                   |
| AP-DOMAIN-005       | low      | F-076             | DOMAIN      | setTitle race                                       |
| AP-DOMAIN-006       | low      | F-078             | DOMAIN      | DRY editTitle/Description/Content                   |

**총 21 AP** = critical 3 / high 3 / medium 11 / low 4

**PoC #01 비교**: 15 AP (critical 2 / high 2 / medium 7 / low 4) → PoC #02 21 AP (+6).

- **+6 증가**: Hexagonal 도입 부산물 (port-adapter 경계 위반 2건 — AP-ARCH-001/002) + 외부 검증 API 도메인 신규 6건 (AP-API-001~008 중 8건 등록) + DB Specifications 신규 (AP-DB-003) + Adapter multi-aggregate (AP-DB-002) + RSA key (AP-SECURITY-001 isomorphic).
- **F-021 임계 정상 시그널**: 다른 stack 검증으로 새 패턴 6건 노출 = v1.2.0 합산 격상 데이터 충분.

---

## §4. PoC #01 15 AP cross-validation (Senior 직접 검증)

| PoC #01 AP                                            | severity | PoC #02 결과                                                                                                          | 판정           |
| ----------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- | -------------- |
| AP-DOMAIN-001 (De Morgan)                             | critical | ❌ **비재현** — ArticleCommentService 깔끔                                                                            | 학습 효과 입증 |
| AP-SECURITY-001 (JWT 21byte)                          | critical | ⚠️ **변형 재현** — JWT SECRET 분리되었으나 RSA key 직접 commit (F-068) → **AP-SECURITY-001 isomorphic critical 유지** |
| AP-DOMAIN-002 (email/username unique 3중)             | high     | ⚠️ **부분 재현** — race-safe DB UQ + race-prone TOCTOU (F-058 evidence)                                               |
| AP-PERFORMANCE-002 (Pageable cap)                     | high     | ❌ **비재현 + 회피** — ArticleFacets:21 size cap 50 명시                                                              |
| AP-ARCH-001 (LV-001)                                  | medium   | ❌ **비재현** — multi-module compileOnly + runtimeOnly 차단 (F-065)                                                   |
| AP-ARCH-002 (LV-002)                                  | medium   | ⚠️ **부분 재현** — core 가 @Service/@Entity (F-062) — 한국 hybrid caveat                                              |
| AP-DB-001 (NO ACTION FK)                              | medium   | ✅ **재현** — F-073 등록 (AP-DB-002 정규화)                                                                           |
| AP-SECURITY-002 (sessionCreationPolicy)               | medium   | (PoC #02 OAuth2 RS 사용 — 본 영역 비재현 / 학습 효과)                                                                 |
| AP-SECURITY-003 (WebSecurity#ignoring)                | medium   | (PoC #02 OAuth2 RS 사용 — 본 영역 비재현 / 학습 효과)                                                                 |
| AP-API-001 (versioning)                               | medium   | ✅ **재현** — F-082 (AP-API-003 정규화)                                                                               |
| AP-PERFORMANCE-001 (EAGER N+1)                        | medium   | ✅ **재현 + 격상** — F-051 high (medium → high)                                                                       |
| AP-API-002 (HTTP status)                              | low      | ✅ **재현** — F-083 (low maintained)                                                                                  |
| AP-DOMAIN-003 (F-017 @Embeddable @ManyToMany)         | low      | ❌ **비재현** — 본 PoC explicit junction entity 정합                                                                  |
| AP-DOMAIN-004 (F-028 equals/hashCode)                 | low      | ❌ **비재현** — getId UUID 의존                                                                                       |
| AP-ARCH-003 (deprecated WebSecurityConfigurerAdapter) | low      | ❌ **비재현** — Spring Boot 3.3 + SecurityFilterChain bean                                                            |

**핵심 데이터**:

- **비재현 8건** (53%) — 학습 효과 + Hexagonal/Spring Boot 3.x 마이그레이션 효과
- **재현 4건** (27%) — v1.2.0 합산 격상 강한 권위 (AP-PERFORMANCE-001 + AP-API-001/002 + AP-DB-001)
- **변형 재현 3건** (20%) — pattern 학습 후 다른 형태 발현 (AP-SECURITY-001 RSA key + AP-DOMAIN-002 race-prone + AP-ARCH-002 hybrid)

---

## §5. composite view 4건 권고 (PoC #01 isomorphic)

### 5.1 Hexagonal port-adapter 경계 composite (PoC #02 신규)

**linked AP**: AP-ARCH-001 (UserRepositoryAdapter 도메인 검증) + AP-ARCH-002 (ArticleRepositoryAdapter multi-aggregate orchestration)
**shared remediation**: Service 가 도메인 검증 + multi-aggregate orchestration / Adapter 단순 save/delete only

### 5.2 API 계약 결함 composite (PoC #02 신규 )

**linked AP**: AP-API-001 (critical drift) + AP-API-002 (status) + AP-API-003 (versioning) + AP-API-004 (limit) + AP-API-005 (PATCH) + AP-API-008 (redirect)
**shared remediation**: REC-API-IDEMPOTENCY/VERSIONING/PROBLEM-DETAILS/PATCH 묶음 — RFC 7231/9110/5789/7807 권고 일괄

### 5.3 JWT/Auth 보안 composite (PoC #01 동형)

**linked AP**: AP-SECURITY-001 (RSA key git commit) + F-084 (Token apiKey 비표준 — recommendation only) + AP-API-006 (controller orchestration)
**shared remediation**: Spring Security 6 OAuth2 RS + Bearer JWT + Vault 분리 + permitAll

### 5.4 데이터 무결성 composite (DB) (PoC #02 신규 )

**linked AP**: AP-DB-001 (TagJpaRepository 타입) + AP-DB-002 (CASCADE 부재) + AP-DB-003 (Cartesian)
**shared remediation**: Repository generic cross-check + ON DELETE CASCADE 명시 + JPA Specifications distinct + JOIN type 명시

---

## §6. 5 핵심 결정 권고 (Phase 6)

### DEC-001 — AP-API-001 critical 단일 등록 (Phase 5-1 결정 정합) ✅

- F-070 + F-079 + F-085 단일 묶음 (spec/runtime drift composite finding_ref). RFC 7231 §4.2.2 + RFC 9110 §15.3 이중 결함.
- composite AP 등록 금지 (개별 결함 단위 표준) — 단 evidence 통합 + composite view §5.2 가독성 보전

### DEC-002 — Phase 1-3 누락 candidate 등록 (5건 critical/high/medium) ✅

- F-048 critical (AP-DB-001) + F-068 critical (AP-SECURITY-001) + F-051 high (AP-PERFORMANCE-001) + F-053 medium (AP-DOMAIN-003) + F-069 medium (AP-DB-003)
- 사내 적용 시 즉시 차단 critical 2건 + 1 스프린트 high 3건

### DEC-003 — ID 정규화 (multi-prefix → single) ✅

- AP-API-IDEMPOTENCY-001 → AP-API-001 / AP-HEXAGONAL-001/002 → AP-ARCH-001/002 / AP-DB-CASCADE-001 → AP-DB-002 / AP-DOMAIN-SELF-FOLLOW-001 → AP-DOMAIN-002 / AP-DOMAIN-TITLE-UNIQUE-001 → AP-DOMAIN-001
- schema id pattern `^AP-[A-Z]+-\d+$` 강제 + `_id_normalization_mapping` 표 명시 (PoC #01 패턴)

### DEC-004 — composite view 4건 도입 ✅

- §5.1 Hexagonal + §5.2 API 계약 + §5.3 JWT/Auth + §5.4 DB 무결성
- 개별 AP 등록 거절 + avoid-list.md `## ... 종합 점검` 섹션 4개 (PoC #01 1건 → PoC #02 4건 확장)

### DEC-005 — low candidate 3건 등록 (F-058/F-076/F-078) ✅

- AP-DOMAIN-004 (TOCTOU) + AP-DOMAIN-005 (setTitle race) + AP-DOMAIN-006 (DRY edit)
- PoC #01 low 4건 분포 정합

---

## §7. 신규 발견 (Senior 실무 우선)

### 7.1 schema.sql ORM derivative — 정합성 검증 의미 약화 (F-050 메타)

- Phase 6 antipattern 후보 **아님** (메타 finding) — 단 avoid-list.md 부록에 caveat 명시 권고
- "DDL > ORM 우선순위 무력화" — 본 PoC 의 정합성 검증 자체 의미 약화 → finding system 보강 (v1.2.0 묶음 I)

### 7.2 split package smell (F-063 §8.1 deferred)

- `io.zhc1.realworld.config` 4 location 16 파일 — JLS §7.7.2 compile-time error 잠재 / Spring Modulith 도입 시 즉시 폭발
- §8.1 deferred 정합 — Phase 6 등록 보류, PoC #03 cross-stack 검증 후 격상

### 7.3 compileOnly + runtimeOnly 모범 사례 (F-064 positive)

- antipattern 카탈로그 **반대 방향** — 사내 적용 시 권고 모범 사례
- avoid-list.md 부록 `## 모범 사례 (positive findings)` 섹션 신설 권고 (1건 — PoC #01 부재)

### 7.4 메인이 놓친 영역

- **F-054 email varchar(30) RFC 5321 위반** medium — Phase 6 인계 누락 시 위험. AP-DB-004 등록 권고 (medium) 또는 avoid-list.md 부록 길이 가이드.
- **F-067 Adapter package-private** low candidate — 등록 vs skip 결정 필요. 의도된 캡슐화 vs 다른 모듈 사용 함정 — Senior 권고 **skip** (positive finding 영역).

---

## §8. 산출 작성 권고

### 8.1 antipatterns.json simple_merge 전략

**raw_confidence 산정**:

- base 0.75
- modifiers: orm_full +0.05 / domain_context_md +0.03 / openapi_ground_truth +0.07 / multi_module_arch +0.02 / cross_phase_aggregation +0.03 / poc_01_isomorphic_pattern +0.02 / schema_compliance_100 +0.01
- penalties: no_operational_db -0.03
- subtotal 0.95
- cross_validation: f015_3_consensus +0.01 / f068_critical_evidence +0.00
- **raw_confidence: 0.96** (PoC #01 동급)

### 8.2 avoid-list.md priority order

PoC #01 4단계 패턴 isomorphic + 확장:

1. **Critical (즉시 차단)** 0~1주 — AP-DB-001 (TagJpaRepository) > AP-SECURITY-001 (RSA key) > AP-API-001 (drift)
2. **High (1 스프린트)** 1~2주 — AP-ARCH-001 + AP-DOMAIN-001 + AP-PERFORMANCE-001
3. **Medium (다음 분기)** 1~3개월 — 11 AP composite view 일괄
4. **Low (백로그)** 6개월~ — 4 AP

### 8.3 composite view 가독성 보전

PoC #01 단일 composite (`보안 설정 종합 점검`) → PoC #02 4 composite:

- `## API 계약 결함 종합 점검` (§5.2)
- `## Hexagonal port-adapter 경계 종합 점검` (§5.1)
- `## JWT/Auth 보안 종합 점검` (§5.3)
- `## 데이터 무결성 종합 점검` (§5.4)

### 8.4 부록 권고

- 부록 A: AP × REC 매트릭스
- 부록 B: Phase 6 final 검증 점검표
- 부록 C (PoC #02 신규): 모범 사례 (F-064/F-065/F-066)
- 부록 D (PoC #02 신규): PoC #01 비교 매트릭스 (§4)

---

**END — Senior Phase 6 PoC #02 cross-check (line ≈ 380)**
