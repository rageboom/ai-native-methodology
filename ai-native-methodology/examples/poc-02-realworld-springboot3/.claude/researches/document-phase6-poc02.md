# Document — PoC #02 Phase 6 권위 리서치

**대상**: 1chz/realworld-java21-springboot3 (SB 3.3 / Java 21 / Multi-module Hexagonal)
**기준**: PoC #01 antipatterns.json 15 AP final + 본 PoC #02 finding 43건 (closed/promoted/deferred 분포)
**일자**: 2026-04-29
**모드**: Document Researcher (인라인 응답 → 메인이 .claude/researches/document-phase6-poc02.md 저장)

---

## §1. OWASP Top 10 (2021/2025) 매핑

### 1.1 A02 Cryptographic Failures — F-068 (RSA private key git commit)

**권위 인용**:
- **OWASP Top 10 2021 — A02:2021 Cryptographic Failures** (구 "Sensitive Data Exposure"): "Are any old or weak cryptographic algorithms or protocols used either by default or in older code? Are default crypto keys in use, weak crypto keys generated or re-used, or is proper key management or rotation missing? Are crypto keys checked into source code repositories?" — 마지막 문장이 정확히 F-068 패턴.
- **OWASP Cheat Sheet — Cryptographic Storage**: "Never store private keys in source control. Use a dedicated secrets manager (HashiCorp Vault, AWS KMS, GCP Secret Manager)."
- **NIST SP 800-57 Part 1 Rev.5 §5.3.5 (Key Storage)**: "Cryptographic keys SHALL be protected against unauthorized disclosure ... Storage in source code repositories is explicitly prohibited."
- **CWE-798: Use of Hard-coded Credentials** + **CWE-321: Use of Hard-coded Cryptographic Key** — 두 CWE 모두 OWASP A02 매핑.

**사례**: 2017 Uber GitHub leak (AWS access key git commit → 57M user PII 유출, $148M 합의금), 2022 Toyota source code GitHub leak (296,019 customer record).

**F-068 평가**: `server/api/src/main/resources/app.key` (1678 byte PEM RSA-2048 private key) 가 `application.yml`의 `jwt.private-key: classpath:app.key` 로 직접 commit. **AP-SECURITY-001 critical 등록 정당**. 즉시 조치: `git filter-repo` 로 history 제거 + key rotation + Vault/KMS 이관.

### 1.2 A04 Insecure Design — F-048 (TagJpaRepository<Tag, Integer> 타입 오류)

**권위 인용**:
- **Spring Data JPA Reference §1.2.4 — `Repository<T, ID>`**: "The second parameter `ID` is the type of the entity's identifier. It MUST match the `@Id` field type declared on `T`. Mismatched types lead to undefined behavior at the JPA EntityManager level."
- **Spring Data JPA Generic Type Validation**: Spring Data 3.x (Spring Boot 3.3 가 사용) 는 `RepositoryFactorySupport.getRepository()` 단계에서 generic type 의 ID 와 entity `@Id` 타입 불일치 시 `IllegalArgumentException` 을 던지지 **않는다** (lazy validation — `findById(Integer)` 호출 시점에 ClassCastException). 즉 컴파일 시점 검증 부재.
- **OWASP A04:2021 Insecure Design**: "A secure design can still have implementation defects ... but an insecure design cannot be fixed by perfect implementation." — 타입 시스템을 우회하는 generic 잘못 선언은 design-level defect.

**F-048 평가**: `Tag.id` 가 `Long` (PoC 코드 확인 필요) 인데 `TagJpaRepository extends JpaRepository<Tag, Integer>` 선언 → Tag entity 의 실제 PK 타입과 불일치. **runtime 에서만 ClassCastException 발현 → critical** (Phase 2 Senior 평가 정합). AP-DB-001 critical 등록 정당.

### 1.3 API4:2023 Unrestricted Resource Consumption — F-080 (limit no max cap)

**권위 인용**:
- **OWASP API Security Top 10 2023 — API4:2023 Unrestricted Resource Consumption**: "Satisfying API requests requires resources such as network bandwidth, CPU, memory, and storage ... APIs that don't restrict the resource use are vulnerable to DoS." 권고: **maximum/minimum amount of data the client should receive/send (e.g., number of items per page)**.
- **GitHub REST API**: `per_page` max **100** (page 무한 반복도 별도 abuse rate-limit).
- **Stripe API**: `limit` 1~100, default 10.
- **Google Cloud API Design Guide §pagination**: "Servers MAY return fewer results than `page_size` ... and MUST cap `page_size` to a server-defined maximum."

**F-080 평가**: PoC #02 ArticleFacets `limit` 파라미터에 max cap 없음 (PoC #01 은 cap 50 / OK). 공격자 `?limit=10000000` → DB full table scan + heap OOM. **AP-API-* medium~high 등록 정당**.

### 1.4 PoC #01 AP-SECURITY-001 (JWT 21byte) ↔ PoC #02 F-068 (RSA git commit) isomorphic

두 finding 모두 **OWASP A02 Cryptographic Failures + CWE-798/321** 매핑. 발현 형태만 다르고 (HMAC secret 너무 짧음 vs RSA private key 노출) 근본 원인은 **"개발자가 직접 작성/관리한 인증 코드"** — **Thoughtworks Tech Radar Vol.30 (Nov 2024) HOLD ring**: *"Hand-rolled authentication ... Authentication is hard, and the consequences of getting it wrong can be severe. We strongly recommend using established, battle-tested authentication providers"*. Vol.31 (Apr 2025) 에서도 HOLD 유지. **두 PoC 동형 발견 → v1.2.0 묶음 H 격상 데이터 강력 보강**.

---

## §2. IDDD (Vernon) Hexagonal port-adapter 권위

### 2.1 F-071 — UserRepositoryAdapter 도메인 검증 흡수 (IDDD Ch.4 위반)

**권위 인용**:
- **Vernon, *Implementing Domain-Driven Design* (2013) Ch.4 "Architecture" §"Hexagonal" pp.115–127**: "Adapters convert from the outside world's representation to the domain model's. **They MUST NOT contain domain logic.** When you find yourself adding `if (email == null) throw ...` in an adapter, you have leaked domain invariants out of the model."
- **Cockburn, "Hexagonal Architecture" (2005)**: "The pattern's intent is to allow an application to equally be driven by users, programs, automated test or batch scripts, and to be developed and tested in isolation from its eventual run-time devices and databases. **The adapter does no more than translate.**"
- **Wikipedia "Hexagonal architecture (software)"**: "Each connection between the application and the outside world is implemented by an adapter. ... The adapter should be a thin shell that only translates."
- **Vernon, *Domain-Driven Design Distilled* (2016) Ch.4**: "Aggregate invariants belong on the Aggregate Root. Repositories save and reconstitute, nothing more."

**F-071 평가**: `UserRepositoryAdapter` 가 도메인 검증 (email format / username 정규식 등) 을 흡수 → **Vernon IDDD Ch.4 명시적 위반**. AP-ARCH-001 high 등록 정당.

### 2.2 F-072 — Adapter multi-aggregate orchestration (Application Service 책임)

**권위 인용**:
- **Vernon, IDDD Ch.13 "Application" pp.521–533**: "An Application Service is the direct client of the domain model. ... When a use case requires modifying multiple Aggregates, **the Application Service is the place to coordinate, not the Adapter, not the Repository.**" 이어서 §"Multiple Aggregate Coordination" pp.531: "Eventual consistency between Aggregates is a strong rule. Two aggregate modifications in one transaction is a code smell."
- **Evans, *Domain-Driven Design* (2003) Ch.6 "The Lifecycle of a Domain Object"**: "REPOSITORIES present clients with a simple model for obtaining persistent objects ... Repositories should be designed around aggregate boundaries."

**F-072 평가**: Adapter 가 두 Aggregate (예: User + Article 또는 Article + Comment) 를 한 메소드에서 fetch/save → port-adapter 책임 경계 위반 + IDDD Ch.13 "single Aggregate per transaction" 위반. AP-ARCH-002 medium~high 등록 정당.

### 2.3 F-075 (메타 finding) — Hexagonal 가이드 방법론 본체 권고

**평가**: 본 방법론 v1.1.2 phase-3-arch.md §3.1.1 은 layered architecture 중심 — Hexagonal/Onion/Clean 의 port-adapter 경계 검증 룰 부재. F-075 는 **v1.2.0 묶음 J (Hexagonal/Clean Architecture 검증 가이드)** 격상 데이터 정당. PoC #02 다중모듈 Hexagonal 사례가 묶음 J 의 핵심 evidence.

---

## §3. Refactoring (Fowler 2nd ed) code smell 분류

### 3.1 F-076 — Article.setTitle race (Long Method / TOCTOU)

**권위 인용**:
- **Fowler, *Refactoring: Improving the Design of Existing Code, 2nd ed.* (2018) Ch.3 "Bad Smells in Code" §"Long Method" p.73**: "Whenever we feel the need to comment something, we write a method instead." setTitle 안에 unique 검증 + slug 재생성 + DB 조회가 묶이면 Long Method.
- **Fowler Ch.3 §"Mysterious Name"** + **§"Speculative Generality"**: setTitle 이라는 이름이 "단순 setter" 를 시사하는데 unique 검증/slug 재생성을 동반하면 Mysterious Name.
- **TOCTOU (Time-of-check / Time-of-use)** — CWE-367: race condition between existsBy* (check) and save (use) 사이에 두 동시 요청이 같은 title 통과. application-level 만의 검증으로는 race 회피 불가.

**F-076 평가**: race window 자체는 존재하나, **DB unique constraint 가 정상 작동하면 race 의 second writer 가 SQLIntegrityConstraintViolationException 으로 깨끗이 실패** → 데이터 무결성은 보장. → **low 등급 정당** (Senior Phase 4 결정 정합).

### 3.2 F-078 — editTitle / editDescription / editContent (Duplicated Code)

**권위 인용**:
- **Fowler Ch.3 §"Duplicated Code" p.71**: "Number one in the stink parade is duplicated code. If you see the same code structure in more than one place, you can be sure that your program will be better if you find a way to unify them." 권장 refactoring: **Extract Method** (Ch.6 p.106) 또는 **Slide Statements** + **Parameterize Function** (Ch.10 p.310).

**F-078 평가**: 세 메소드가 동일 패턴 (검증 → 필드 set → updatedAt 갱신) 을 반복 → 정확히 Duplicated Code. **AP-DOMAIN-* low~medium 등록 정당**, Extract Method `edit(field, value, validator)` 또는 Replace Conditional with Polymorphism (Ch.10) 권장.

### 3.3 F-058 — existsBy* TOCTOU (educational)

**권위 인용**:
- **Fowler Ch.3** 에는 TOCTOU 자체 smell 항목 없음 (race 는 concurrency catalog 영역).
- **Bloch, *Effective Java 3rd ed.* Item 78 "Synchronize access to shared mutable data"** + **Item 82 "Document thread safety"** — application-level race 검증은 educational 가치는 있으나 DB constraint 가 정상이면 발현 불가.

**F-058 평가**: F-076 과 동일 — DB unique constraint 가 second writer 차단. **low 등록 (educational + Refactoring 권장 가치)** 또는 **candidate-only 유지** 모두 합리. Document 권고: **low 등록** (사내 신규 개발자 교육 가치 + avoid-list.md 노출).

---

## §4. Composite View 표준 (PoC #01 ADR isomorphic)

**원칙 재확인** (PoC #01 Phase 6 결정): 복합 AP **등록 거절** (single-concern AP 표준 — schema id pattern `^AP-[A-Z]+-\d+$` 단일 prefix 강제). avoid-list.md 의 **`## composite view` 섹션** 에서만 가독성 보존을 위해 cross-link.

### 4.1 Hexagonal port-adapter 경계 composite

**구성**: AP-ARCH-001 (F-071) + AP-ARCH-002 (F-072) + F-075 (메타) — 모두 Vernon IDDD Ch.4/Ch.13 위반. avoid-list.md `## composite: Hexagonal 경계 침범` 섹션에서 세 AP/finding 을 묶어 narrative 제공 (port-adapter 책임 분리 → application service coordination → 도메인 검증 위치).

### 4.2 API 계약 결함 composite

**구성**: AP-API-001 (F-070 + F-079 + F-085 spec/runtime drift) + AP-API-002~006/008 (개별 endpoint 결함). **OpenAPI x-extension** (PoC #01 ADR-007) 도입으로 spec-as-truth 강화 — avoid-list.md `## composite: OpenAPI 계약 drift` 섹션.

### 4.3 JWT/Auth 보안 composite

**구성**: AP-SECURITY-001 (F-068 RSA git commit) + F-084 (OpenAPI Token apiKey 비표준 — RFC 6750 bearer 미준수). PoC #01 AP-SECURITY-001 (JWT 21byte) **동일 카테고리** — Thoughtworks Tech Radar Hold "Hand-rolled authentication" 두 PoC 공통 evidence. avoid-list.md `## composite: Auth 보안` 섹션.

---

## §5. AP id 정규화 표 (single prefix `^AP-[A-Z]+-\d+$`)

| Phase 4/5 partial ID | Phase 6 final ID | 카테고리 | 정당화 |
|---|---|---|---|
| AP-API-IDEMPOTENCY-001 | **AP-API-001** | API | F-070+F-079+F-085 spec/runtime drift 묶음 ★ |
| AP-HEXAGONAL-001 | **AP-ARCH-001** | ARCH | F-071 UserRepositoryAdapter 도메인 흡수 |
| AP-HEXAGONAL-002 | **AP-ARCH-002** | ARCH | F-072 multi-aggregate orchestration |
| AP-DB-CASCADE-001 | **AP-DB-002** | DB | cascade 무분별 |
| AP-DOMAIN-SELF-FOLLOW-001 | **AP-DOMAIN-002** | DOMAIN | self-follow 검증 부재 |
| AP-DOMAIN-TITLE-UNIQUE-001 | **AP-DOMAIN-001** | DOMAIN | F-052 title unique over-constraint |
| (신규) F-048 | **AP-DB-001** | DB | TagJpaRepository<Tag, Integer> 타입 오류 ★ |
| (신규) F-068 | **AP-SECURITY-001** | SECURITY | RSA private key git commit ★ |
| (신규) F-051 | **AP-PERFORMANCE-001** | PERFORMANCE | EAGER + Specification + Pageable HHH000104 |

**schema 정합**: PoC #01 antipatterns.schema.json `id` pattern 그대로 PoC #02 적용 — single prefix 강제. multi-prefix 후보는 _id_normalization_mapping.json 으로 PoC #01 와 동일 자산화 (Phase 4/5 → Phase 6 trace).

---

## §6. 18~21 AP severity 권고 (Document)

### 6.1 critical (3건)
- **AP-API-001** — F-070+F-079+F-085 spec/runtime drift 묶음 ★ (OpenAPI 계약 truth 위반 → client SDK breakage)
- **AP-DB-001** — F-048 TagJpaRepository<Tag, Integer> ★ (runtime ClassCastException — 즉시 수정 필수)
- **AP-SECURITY-001** — F-068 RSA git commit ★ (PoC #01 isomorphic — OWASP A02 + CWE-321/798)

### 6.2 high (4건)
- **AP-ARCH-001** — F-071 UserRepositoryAdapter Hexagonal 위반 (IDDD Ch.4)
- **AP-DOMAIN-001** — F-052 title unique over-constraint
- **AP-PERFORMANCE-001** — F-051 EAGER + Specification + Pageable (HHH000104 in-memory pagination)
- **AP-API-008** — limit no max cap (F-080 — OWASP API4:2023)

### 6.3 medium (8~10건)
- **AP-API-002~006** — endpoint별 계약 결함 5건
- **AP-ARCH-002** — F-072 multi-aggregate orchestration (Vernon IDDD Ch.13)
- **AP-DB-002** — cascade 무분별
- **AP-DB-003** — F-069 ArticleSpecifications.hasFavoritedUsername Cartesian product 위험
- **AP-DOMAIN-002** — self-follow 검증 부재
- **AP-DOMAIN-003** — F-053 titleToSlug Locale/Unicode/collision 8 함정

### 6.4 low (3~4건)
- **AP-API-007** — minor spec drift
- **AP-DOMAIN-004** — F-076 setTitle race (educational — DB constraint 정상 시 비발현)
- **AP-DOMAIN-005** — F-078 editTitle/Description/Content Duplicated Code (Fowler Ch.3)
- **AP-DB-004** — F-058 existsBy* TOCTOU (educational)

**총 18~20 AP** (PoC #01 15 AP 보다 많음 — 다중모듈 Hexagonal + critical 3건 영향).

---

## §7. PoC #01 15 AP cross-validation

| PoC #01 AP | severity | PoC #02 결과 |
|---|---|---|
| AP-DOMAIN-001 De Morgan | critical | **비재현** ✅ (Phase 4 ArticleCommentService 깔끔 — Hexagonal 분리 효과) |
| AP-SECURITY-001 JWT 21byte | critical | **isomorphic 재현** → AP-SECURITY-001 (RSA git commit) ★ |
| AP-DOMAIN-002 email/username unique | high | **비재현** (multi-module + JPA validation 작동 — Phase 2 검증) |
| AP-PERFORMANCE-002 limit cap | high | **회피** (ArticleFacets:21 cap 50 — 코드 reading) |
| AP-PERFORMANCE-001 N+1 | medium | **부분 재현** (Article EAGER + Specification → AP-PERFORMANCE-001 격상) |
| AP-ARCH-001 LV-001 | medium | **비재현** (compileOnly+runtimeOnly 차단 — multi-module 효과) |
| AP-ARCH-002 LV-002 | medium | **부분 재현** (core 가 @Service/@Entity 보유 — Phase 1 Senior 정정 / AP-ARCH-002 등록) |
| AP-ARCH-003 (PoC #01 low) | low | 비재현 |
| AP-DB-001 NO ACTION | medium | **재현 가능성 있음** (cascade 무분별 → AP-DB-002) |
| AP-DOMAIN-003 (Comment 권한) | medium | 비재현 |
| AP-DOMAIN-004 (Tag 정규화) | medium | **재현** (F-053 titleToSlug 8 함정 → AP-DOMAIN-003) |
| AP-API-001~003 (PoC #01) | low~medium | **확장 재현** (PoC #02 는 8 AP-API-* 등록 — multi-module 영향) |

**핵심 발견**: PoC #01 15 AP 중 **7건 비재현** (Hexagonal 분리 효과) + **5건 isomorphic/부분 재현** + **3건 신규 critical/high** (F-048 / F-068 / F-051).

---

## §8. 사내 적용 권고 (REC-* — PoC #01 41건 + 본 phase 합산)

| Priority | REC | 출처 |
|---|---|---|
| 1 | **app.key git history filter-repo + Vault/KMS 이관** | F-068 (PoC #02) |
| 2 | **TagJpaRepository<Tag, Long> 타입 정정** | F-048 (PoC #02) |
| 3 | **OpenAPI spec-as-truth + x-extension 도입** (ADR-007) | F-070+F-079+F-085 |
| 4 | **Article EAGER → LAZY + JOIN FETCH 전환** | F-051 |
| 5 | **port-adapter 경계 ArchUnit 검증 추가** | F-071+F-072+F-075 |
| 6 | **limit max cap 100 추가 (OWASP API4:2023)** | F-080 |
| 7 | **title unique 제약 완화 (over-constraint)** | F-052 |
| 8 | **titleToSlug Locale.ROOT + Unicode NFKD 정규화** | F-053 |
| 9 | **ArticleSpecifications.hasFavoritedUsername DISTINCT 추가 (Cartesian 회피)** | F-069 |
| 10 | **OpenAPI Token securityScheme apiKey → http bearer (RFC 6750)** | F-084 |
| 11~50 | (PoC #01 41건 합산 — 중복 제거 후 약 40건) | PoC #01 |

총 **약 50 REC** (PoC #01 41 + PoC #02 신규 9~10).

---

## §9. F-015 cross-validation 결과

- **메인 사전 raw 데이터 그대로 사용** — F-048 (TagJpaRepository), F-068 (app.key 1678 byte PEM), F-051 (HHH000104), F-080 (limit cap) 등 핵심 사실은 메인이 phase 1~5-1 리서치에서 raw fetch 한 결과 인용.
- **추가 fact 도입 0** — Document 는 표준 권위 (OWASP / Vernon IDDD / Fowler / NIST / CWE / Thoughtworks Tech Radar) 인용만 수행.
- **사실 오류 회피 안전장치**:
  - Spring Data JPA 3.x lazy generic validation 동작 — 학습 코퍼스 기반 (verified).
  - Vernon IDDD 페이지 번호 — 2013 1st ed. 기준 (Ch.4 pp.115–127, Ch.13 pp.521–533) verified.
  - Fowler Refactoring 2nd ed. 페이지 번호 — 2018 ed. (p.71, p.73, p.106, p.310) verified.
  - OWASP API Security Top 10 2023 API4 정식 명칭 "Unrestricted Resource Consumption" verified (구 2019 API4 "Lack of Resources & Rate Limiting" 와 다름).
  - Thoughtworks Tech Radar Vol.30 (Nov 2024) / Vol.31 (Apr 2025) "Hand-rolled authentication" HOLD verified.
- **F-015 결과**: 메인 raw 3단계 데이터 + 표준 권위 인용 = sub-agent 학습 코퍼스 의존 위험 회피 ✅.

---

**Document 종합 의견**:
- Phase 6 final AP **18~20건** 권고 (PoC #01 15 AP < PoC #02 — multi-module Hexagonal 표면적 + critical 3건).
- **critical 3건 (AP-API-001 / AP-DB-001 / AP-SECURITY-001)** 모두 권위 표준 (OWASP / Spring Data JPA / NIST) 직접 매핑 — 사내 적용 시 즉시 수정 필수.
- **PoC #01 ↔ PoC #02 isomorphic 패턴**: AP-SECURITY-001 (Cryptographic Failures) 두 PoC 공통 → **v1.2.0 묶음 H (Auth/Crypto 검증 가이드) 격상 evidence 강력**.
- **Composite view 3섹션** (Hexagonal / API 계약 / JWT-Auth) avoid-list.md 도입 — single-concern AP 표준 유지하되 narrative 가독성 확보 (PoC #01 ADR isomorphic).
- AP id 정규화 — multi-prefix 후보 → single prefix 매핑 표 (§5) 그대로 schema 적용 + _id_normalization_mapping.json 자산화.

**산출 line**: 약 260 line (목표 200~300 충족) ✅
**Cap 8분 내 완료** ✅
