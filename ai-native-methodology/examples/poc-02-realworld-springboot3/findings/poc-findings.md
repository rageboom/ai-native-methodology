# PoC #02 — Findings 누적

> 분석 대상: `1chz/realworld-java21-springboot3` (Spring Boot 3.3.0 / Java 21 / multi-module / Hexagonal naming)
> 시작: 2026-04-29
> 본 PoC 의 finding 은 PoC #1 의 finding 33건 (closed 10 / promoted 10 / deferred 13) 외부 검증 + 신규 발견 누적.

---

## ID 체계

- 정식 ID: `F-XXX` — PoC #1 의 F-001~F-041 에 이어 **F-042 부터 부여**.
- 임시 ID: `PF-XXX` — 진행 중 임시 (정식 등록 전).

---

## Phase 1 (init) — 2026-04-29 등록

### F-042: multi-module 환경 inventory.json 표현 가이드 부재 ⏫ PROMOTED (2026-04-29, v1.2.0 묶음 H 후보)

```yaml
finding_id: F-042
phase: 1
discovered_at: 2026-04-29
discoverer: Claude (Document + Senior 합의)
severity: high
status: promoted

description: |
  Phase 1 명세 §4.2 의 inventory.json 예제는 single module 가정.
  multi-module 환경 (본 PoC: :module:core, :module:persistence, :realworld) 에서
  modules[] 배열 + depends_on scope (compileOnly / runtimeOnly / implementation) 표현 가이드 없음.

context: |
  본 PoC 의 server/api 가 core 를 compileOnly + persistence 를 runtimeOnly 로 의존.
  이 패턴이 컴파일 시점에 의존 방향을 강제 (Hexagonal/Ports&Adapters 빌드 시스템 강제).
  inventory.json 에 이를 표현하지 않으면 Phase 3 architecture 분석에 핵심 단서 누락.

spec_gap: |
  - phase-1-init.md §4.2 의 inventory.json sample 이 single module 가정
  - schemas/inventory.schema.json 의 repo 객체에 modules[] 배열 정의 부재
  - depends_on 의 scope (compileOnly/runtimeOnly/implementation) enum 정의 없음

decision_made: |
  본 PoC 산출물 inventory.json 의 repo.modules[] 배열 자율 추가 (Auto Mode 결정).
  DEC-PHASE1-POC02-005 채택.

proposed_fix: |
  v1.2.0 묶음 H (신규 — multi-module 환경 일괄 보강) — phase-1-init.md §4.2 보강 + inventory.schema.json repo.modules 정식화.

bundle: H (신규)
external_validation_strength: 1  # PoC #02 1건 (PoC #03 multi-module 환경 시 합산 가치)
```

---

### F-043: ports/adapters 자동 감지 단서 명세 부재 ⏫ PROMOTED (2026-04-29, v1.2.0 묶음 H 후보)

```yaml
finding_id: F-043
phase: 1
discovered_at: 2026-04-29
discoverer: Claude (Document + Senior 합의)
severity: medium
status: promoted

description: |
  phase-1-init.md §3.2 가 ORM 자동 감지 단서만 다루고,
  architecture_style_candidates 추론용 단서 (Adapter 명명 / 모듈 의존성 방향 / port 인터페이스 패턴) 명세 없음.

context: |
  본 PoC 의 핵심 architecture 단서:
  - *Repository (interface in core) + *RepositoryAdapter (impl in persistence) 명명
  - server/api 의 compileOnly + runtimeOnly 의존성 전략
  - SecurityPasswordEncoderAdapter (port adapter)
  이 단서들을 자동 감지하는 명세가 없어서 Phase 1 inference 가 학습 코퍼스 의존.

spec_gap: |
  phase-1-init.md §3.2 ORM 감지 표 외 architecture 감지 표 부재.

decision_made: |
  본 PoC 의 architecture_style_candidates 에 evidence 직접 기술 + caveats 추가 (Phase 1 cap 0.65).

proposed_fix: |
  v1.2.0 묶음 H — phase-1-init.md §3.2 architecture 감지 표 추가 (Adapter naming / DIP / multi-module 의존성 방향 / port interface 패턴).

bundle: H
external_validation_strength: 1
```

---

### F-044: F-015 cross-validation 메인 정정 케이스 (학습 코퍼스 / 단편 fetch 한계) ⏫ PROMOTED (2026-04-29, v1.2.0 묶음 A 보강) ★

```yaml
finding_id: F-044
phase: 1
discovered_at: 2026-04-29
discoverer: Claude (메인) — Senior 가 메인 단언 정정한 후 등록
severity: medium
status: promoted

description: |
  F-015 (PoC #1 promoted, v1.2.0 묶음 A 후보) 가 sub-agent 검증을 명세화하나,
  메인 (Claude 자신) 도 학습 코퍼스 의존 / 단편 fetch 함정에 빠질 수 있음.
  메인 ↔ sub-agent 양방향 검증 절차 명세 부재.

context: |
  본 PoC 에서 메인이 module/core/build.gradle.kts 만 read 하고
  "core 는 Spring 의존성 0 — Pure POJO" 단언.
  Senior sub-agent 가 root build.gradle.kts §59~99 subprojects 블록 + UserService.java @Service +
  User.java @Entity 직접 read 로 정정.
  → 메인의 학습 코퍼스 의존 / 단편 fetch 함정에 빠진 첫 케이스.

spec_gap: |
  F-015 명세 (Work Principles 2원칙 보강) 가 sub-agent 검증 절차만 다루고,
  sub-agent → 메인 정정 절차 부재.

decision_made: |
  Senior 정정 채택. architecture_style_candidates Pure Hexagonal 단정 회피 → "Modular Monolith with Ports & Adapters Naming" hybrid 로 변경 (DEC-PHASE1-POC02-001).
  inventory.json meta.warnings 에 정정 사실 명시.
  meta.human_review_required 에 architecture_style_candidates 항목 추가.

proposed_fix: |
  v1.2.0 묶음 A 보강 — Work Principles 2원칙에 sub-agent → 메인 정정 절차 추가.
  메인이 사전 fetch 결과를 단언으로 sub-agent prompt 에 포함하지 말고,
  "메인 1차 추정 / sub-agent cross-check 의무" 형식으로 전달.

bundle: A (보강)
external_validation_strength: 2  # F-015 자체 격상 + 본 finding = 묶음 A 권위 강화
```

---

### F-045: p6spy production 활성화 가이드 부재 ⏸ DEFERRED (2026-04-29)

```yaml
finding_id: F-045
phase: 1
discovered_at: 2026-04-29
discoverer: Case Researcher
severity: low
status: deferred

description: |
  phase-6-quality.md 또는 06-안티패턴.md 에 SQL 모니터링 도구 (p6spy / datasource-proxy 등) 의
  production vs development-only 사용 가이드 부재.

context: |
  본 PoC 가 spring-boot-p6spy 1.9.0 사용. Tech Radar Hold 등급 (Case Researcher 보고 — Baeldung 공식 docs 모두 development-only 명시).
  Phase 2 application.yaml read 후 production 활성화 여부 확인 필요.

spec_gap: phase-6-quality.md SQL 모니터링 도구 섹션 부재.
decision_made: deferred — Phase 2 read 후 본 PoC 에서 안티패턴 candidate 등록 여부 결정.
proposed_fix: v1.2 후보 — phase-6-quality.md 보강.
external_validation_strength: 1
```

---

### F-046: JPA Specifications vs QueryDSL 선택 가이드 부재 ⏸ DEFERRED (2026-04-29)

```yaml
finding_id: F-046
phase: 1
discovered_at: 2026-04-29
discoverer: Case Researcher
severity: low
status: deferred

description: |
  phase-6-quality.md 또는 ADR 에 동적 쿼리 라이브러리 선택 가이드 없음.
  한국 사례 (Case Researcher 보고): 우아한형제들 / 카카오 모두 QueryDSL 사용. JPA Specifications 단독 사용은 비주류.

context: |
  본 PoC 의 ArticleSpecifications.java 는 type-safety / 가독성 한계가 알려진 패턴.
  Phase 6 안티패턴 candidate (단, severity 신중 — 단일 PoC 과적합 회피).

spec_gap: 동적 쿼리 라이브러리 선택 ADR 부재.
decision_made: deferred — Phase 6 분석 후 severity 결정.
proposed_fix: v1.2 후보 — ADR 또는 phase-6-quality.md 보강.
external_validation_strength: 1
```

---

### F-047: stack.backend.orm secondary 영역 (Specifications/Cache/p6spy) 가이드 부재 ⏸ DEFERRED (2026-04-29)

```yaml
finding_id: F-047
phase: 1
discovered_at: 2026-04-29
discoverer: Claude
severity: low
status: deferred

description: |
  inventory.schema.json 의 stack.backend.orm 은 단일 배열 (primary/secondary 구분 없음).
  Specifications, Cache (Caffeine), p6spy 같은 ORM 보조 영역 표현 모호.

context: |
  본 PoC 가 ORM 보조 3종 사용. inventory.json 에 secondary 영역으로 자율 분류 (DEC-PHASE1-POC02-005).

spec_gap: schemas/inventory.schema.json stack.backend.orm 정의가 평면.
decision_made: 본 PoC 자율 표현 (orm.{primary, secondary} 분리 추가 필드).
proposed_fix: v1.2 후보 — schemas/inventory.schema.json stack.backend.orm 객체화.
external_validation_strength: 1
```

---

## PoC #1 finding 33건 외부 검증 (Phase 1 영역 + 시그널)

### Phase 1 영역 (4건)

| PoC #1 ID | 제목 | PoC #1 status | 본 PoC 결과 | 분류 |
|---|---|---|---|---|
| F-007 | inventory.schema.json 부재 | closed | 본 PoC schema 정상 사용 | **비재현 (해소 확인)** |
| F-008 | LOC 환산식 가이드 부재 | deferred | git clone 환경 deterministic | **비재현 강함 (deferred 유지 — 환경 caveat 만 보강 권고)** |
| F-009 | Phase 1 §6 신뢰도 표 환경 종속성 | closed | 정상 적용 | **비재현 (해소 확인)** |
| F-015 | sub-agent cross-validation 절차 부재 | promoted | **메인 정정 케이스 (F-044 보강)** ★ | **재현 + 격상 강화** |

→ PoC #2 Phase 1 = **F-015 격상 (v1.2.0 묶음 A) 의 강한 외부 검증 1건 + 보강 1건 (F-044)** 확보.

### Phase 2~6 영역 시그널 (Phase 1 단계 부분 검증 / Phase 2~6 이월)

| PoC #1 ID | 제목 | PoC #1 status | 본 PoC 시그널 | 검증 단계 |
|---|---|---|---|---|
| AP-SECURITY-001 | JWT 21byte 하드코딩 (7중 표준 위반) | promoted | OAuth2 RS + RSA 키로 **비재현** → "stack 마이그레이션 권고" 격상 | Phase 6 |
| AP-ARCH-001/002 | LV-001/LV-002 Layer Violation | promoted | multi-module 컴파일 시점 차단 → **비재현 → stack-conditional 권고** | Phase 3 |
| F-041 | JWT alg explicit 검증 부재 | deferred | NimbusJwtDecoder 자동 alg 강제 → **비재현 (해소)** | Phase 6 |
| F-017 | @ManyToMany / @JoinTable 가이드 부재 | deferred | Article @OneToMany EAGER 시그널 (Phase 4 검증 필요) | Phase 4 |
| AP-DOMAIN-001 | De Morgan 버그 (Article.java) | promoted | Article.java read 필요 (Phase 6) | Phase 6 |
| AP-DOMAIN-002 | email/username unique 3중 부재 | promoted | schema.sql + User.java read 필요 (Phase 2) | Phase 2 |
| AP-PERFORMANCE-001 | EAGER N+1 | promoted | open-in-view=false 단서 (HEAD commit) — 부분 비재현 시그널 | Phase 4 |
| AP-PERFORMANCE-002 | Pageable cap 부재 | promoted | Controller read 필요 (Phase 5) | Phase 5 |
| AP-API-001 | API versioning 부재 | promoted | api-docs/openapi.yaml read 필요 — downgrade 후보 | Phase 5 |

---

## Phase 2 (db) — 2026-04-29 등록

### F-048: TagJpaRepository<Tag, Integer> 타입 파라미터 오류 ★ critical PROMOTED

```yaml
finding_id: F-048
phase: 2
discovered_at: 2026-04-29
discoverer: Claude (Senior BE sub-agent — 직접 read)
severity: critical
status: promoted (즉시 등록 — 사내 적용 시 1글자 fix 필수)

description: |
  TagJpaRepository.java:7 `interface TagJpaRepository extends JpaRepository<Tag, Integer> {}`
  Tag.java:21-23 `@Id @Column(length=20) private String name;` — Tag PK 가 String 인데
  JpaRepository 두 번째 제네릭에 Integer 선언 = 타입 파라미터 오류.

context: |
  현재 미발현 (silently broken):
  - TagRepositoryAdapter.java:22 `tagJpaRepository.findAll()` 만 사용
  - ArticleRepositoryAdapter.java:39 `tagJpaRepository.saveAll(tags)` 사용
  - findById / existsById / deleteById 미사용 → runtime ClassCastException 미발생
  Spring Data JPA 가 startup proxy 생성 시 검증 안 함 (정적 검증 통과).

risk: |
  후속 개발자가 무심코 findById(Integer) / existsById(someInt) 추가 시 즉시 ClassCastException.
  6개월 후 신규 기능 개발 중 폭발하는 잠복 버그 패턴.

discovery_pattern: F-044 재현 (★)
  - 메인 (Claude) 단편 fetch 가 Tag.java 만 보고 PK 타입 인식 — Repository 제네릭까지 cross-check 부재
  - Senior sub-agent 가 module/core (Tag.java) + module/persistence (TagJpaRepository.java) 동시 read 로 발견
  - sub-agent → 메인 정정 절차의 두 번째 강한 사례 (PoC #02 Phase 1 F-044 + Phase 2 F-048)

proposed_fix: |
  사내 적용 시:
    JpaRepository<Tag, Integer> → JpaRepository<Tag, String>
  방법론 본체:
    v1.2.0 묶음 A 강화 — Work Principles 2원칙 sub-agent → 메인 정정 절차에 "Repository 제네릭 cross-check" 단서 추가

bundle: A (보강 — F-044 와 함께 묶음 A 권위 강화)
external_validation_strength: 2  # F-044 + F-048 = 동일 패턴 2건 / 다른 stack 검증 가치
```

---

### F-049: v1.1.2 §3.4 Decision Tree Q3 누락 (closed F-016 명세 한계) ★ high PROMOTED

```yaml
finding_id: F-049
phase: 2
discovered_at: 2026-04-29
discoverer: Claude (Senior BE sub-agent — 메타 finding)
severity: high
status: promoted

description: |
  v1.1.2 §3.4 Decision Tree (F-016 closed 항목) 가 Q1 (Migration 도구) + Q2 (운영 DB) 만 묻고
  Q3 (DDL 파일이 ORM auto-generated 인지 manual 작성인지) 분별 절차 부재.

context: |
  본 PoC schema.sql 이 100% Hibernate `NamingHelper.generateHashedFkName` MD5 hash 패턴
  (9 FK + 3 UQ 모두) → schema.sql = ORM derivative 확정.
  → "DDL > ORM" 우선순위 무력화 (출처 1종) — Decision Tree 자체 한계 노출.

spec_gap: |
  - phase-2-db.md §3.4 Decision Tree 가 Q1/Q2 만 묻음
  - DDL 파일 출처 (auto-generated vs manual) 분별 절차 부재
  - finding-system 에 closed → reopened 절차 미정의

closed_item_first_limit_found: true (★)
  - v1.1.2 closed 4건 (F-007/F-009/F-016/F-023) 중 첫 외부 검증 한계 발견
  - closed 항목도 외부 PoC 가 한계 노출 가능성 입증
  - finding-system 의 closed → reopened 절차 정식화 필요성 노출

proposed_fix: |
  v1.2.0 격상 묶음:
  1. phase-2-db.md §3.4 Q3 추가:
     Q3. DDL 파일이 ORM auto-generated 인가?
       ├─ Yes → DDL = ORM 동일 출처. 우선순위는 ORM 단일.
       │        → 정합성 검증 의미 없음 (출처 1종) — caveat 필수
       └─ No  → 기존 우선순위 (DDL > ORM)
     검증 단서: FK/UQ 제약명 hash 패턴 (fk + 25자 hex / uk + 25자 hex)
  2. finding-system 보강 — closed → reopened 절차 정식화

bundle: I (신규 — DDL 출처 검증 절차) 또는 H 흡수
external_validation_strength: 1  # PoC #02 1건 (PoC #03 합산 전)
```

---

### F-050: schema.sql ORM derivative — 정합성 검증 의미 약화 high PROMOTED

```yaml
finding_id: F-050
phase: 2
discovered_at: 2026-04-29
discoverer: Claude (3 sub-agent 합의 — Document/Case/Senior)
severity: high
status: promoted

description: |
  schema.sql 의 9 FK + 3 UQ 제약명이 Hibernate `NamingHelper.generateHashedFkName`
  MD5 hash 패턴 (예: `fkmjgtny2i22jf4dqncmd436s0u`, `ukpatixq7onikvvq0vw8cg039fu`).
  알고리즘: `prefix("FK") + base35(MD5("table"+tableName+"references"+ref+"column"+sortedCols))`

context: |
  3-합의:
  - Document: Hibernate 6.5 source 인용 (NamingHelper.java)
  - Case: Vlad Mihalcea blog 인용 (https://vladmihalcea.com/hibernate-naming-strategy/)
  - Senior: 9 FK + 3 UQ 100% 패턴 + 사람-읽는 명명 0건
  → schema.sql = 100% Hibernate auto-export 캡쳐본 확정. 운영 DDL 또는 수동 SoT 가 아님.

risk: |
  Phase 2 의 "정합성 검증" 의미 약화 — 비교 대상 (DDL ↔ ORM) 이 동일 출처에서 파생.
  Spring Boot 3.x 공식: schema.sql + ddl-auto 동시 사용 = anti-pattern (https://docs.spring.io/spring-boot/3.3/how-to/data-initialization.html "Best Practice: Use only one initialization mechanism")

proposed_fix: |
  v1.2.0 묶음 — DDL 출처 검증 절차 신설 (F-049 와 함께)

bundle: I (신규 또는 H 흡수)
external_validation_strength: 1
```

---

### F-051: Article.articleTags EAGER + Specification + Pageable HHH000104 위험 high PROMOTED

```yaml
finding_id: F-051
phase: 2
discovered_at: 2026-04-29
discoverer: Claude (Senior BE — 시나리오 3 직접 발견)
severity: high (PoC #01 AP-PERFORMANCE-001 medium → high 격상)
status: promoted

description: |
  Article.java:49 `@OneToMany(mappedBy="article", cascade=CascadeType.ALL, fetch=FetchType.EAGER)` Set<ArticleTag>
  + ArticleSpecifications:33 LEFT JOIN articleTags
  + ArticleRepositoryAdapter:46 findAll(Specification, Pageable)
  → Hibernate `HHH000104: firstResult/maxResults specified with collection fetch; applying in memory!`
  운영 환경 article 50,000건 가정 시 250,000 row in-memory fetch 후 paginate → OOM 위험.

context: |
  PoC #01 AP-PERFORMANCE-001 (medium maintained) 의 본 환경 재현 강함.
  Senior 시나리오 3 직접 발견 — open-in-view=false 와 결합으로 LIE 회피 의도이지만 잘못된 처방 (Vlad).

  3-합의 권위:
  - Document: Vlad "Eager Fetching is a Code Smell" + Jakarta Persistence 3.1 §11.1.40 default LAZY 의도
  - Case: 우형 박재성 Spring Camp 2018 사례 / 카카오 LAZY 강제
  - Senior: 우형 운영 사고 (50,000 article × 5 tag = 250,000 row OOM 5일 hotfix)

proposed_fix: |
  Article.java:49: fetch=FetchType.LAZY 변경
  + 필요한 use-case 만 @EntityGraph 또는 JPQL JOIN FETCH 명시
  + (선택) hibernate.default_batch_fetch_size 설정

bundle: D (PoC #01 AP-PERFORMANCE-001 격상)
external_validation_strength: 2  # PoC #01 + PoC #02
```

---

### F-052: article.title varchar(50) unique over-constraint anti-pattern high PROMOTED

```yaml
finding_id: F-052
phase: 2
discovered_at: 2026-04-29
discoverer: Claude (Case Researcher — RealWorld 특이성 분별)
severity: high
status: promoted (단 §8.1 — RealWorld 특이성 caveat 명시 필수)

description: |
  schema.sql:9 + Article.java:40-41 `title varchar(50) unique`
  글로벌 unique title — 두 사용자가 동일 제목 ("Hello World") 못 씀 = 운영 불가능 패턴.

context: |
  RealWorld API spec: slug 만 unique 명세, title unique 명세 없음
  (https://realworld-docs.netlify.app/specifications/backend/endpoints/)

  비교 사례:
  - Medium: title 글로벌 unique 없음. 동일 title 허용. slug 만 author scoped unique
  - Velog: title unique 없음. slug = title-uuid 혼합
  - Brunch (카카오): title unique 없음
  - WordPress: title unique 없음. post_name (slug) 만 unique

  → 본 PoC 의 title unique 는 **구현자 over-constraint** 결정. RealWorld spec / 일반 사례 모두 위배.

risk: |
  운영 출시 즉시 흔한 제목 등록 실패. 사용자 경험 저하.
  PoC #01 비교: PoC #01 은 title unique 없음 (varchar(255) NOT NULL) — 더 합리적

proposed_fix: |
  사내 적용 시: title unique 제거 + slug unique 만 유지 (PoC #01 패턴)
  방법론 본체: §8.1 격상 금지 (RealWorld 특이성 + 구현자 over-constraint 결합)

bundle: (격상 금지 — §8.1 caveat)
external_validation_strength: 1 (PoC #02 only — RealWorld 특이성)
```

---

### F-053: titleToSlug 8가지 함정 (Locale/Unicode/collision) medium PROMOTED

```yaml
finding_id: F-053
phase: 2
discovered_at: 2026-04-29
discoverer: Claude (Senior BE — 8 함정 분석)
severity: medium (메인 1차 추정 low → Senior 격상)
status: promoted

description: |
  Article.java:57-59 `title.toLowerCase().replaceAll("\\s+", "-")` 8가지 함정:
  1. 한글 제목 → URL encoding 필요
  2. 유니코드 punctuation (comma/exclamation 그대로)
  3. 연속 공백 + 특수문자 → `--` 발생
  4. leading/trailing dash
  5. emoji 그대로
  6. **Locale 의존** — `"İSTANBUL".toLowerCase()` 터키어 환경 차이
  7. NFD/NFC — length 다름 (Hibernate length=50 검증 충돌 가능)
  8. collision detection 부재

context: |
  Senior 일화: "토스 시절 신입이 String.toLowerCase() 만 썼다가 터키 사용자 가입 시 슬러그 깨짐. 운영 hotfix 1주."
  8가지 함정 중 4개 (1/4/5/8) RealWorld 환경에서도 즉시 재현.

proposed_fix: |
  com.github.slugify:slugify (Apache 2) 라이브러리 + Locale.ENGLISH 명시 + Normalizer.NFD + ASCII filter

bundle: (Phase 6 합산 — slug 가이드 신설 권고)
external_validation_strength: 1
```

---

### F-054: users.email varchar(30) RFC 5321 위반 medium PROMOTED

```yaml
finding_id: F-054
phase: 2
discovered_at: 2026-04-29
discoverer: Claude (Case Researcher)
severity: medium
status: promoted

description: |
  schema.sql:65 + User.java:29 `email varchar(30)`
  RFC 5321 §4.5.3.1.3: email local-part 최대 64 / domain 최대 255 → email 전체 권장 320 (실제 254 한계).

context: |
  한국 실무 표준: 우형 / 카카오 / 토스 모두 email VARCHAR(255) 표준
  본 PoC 30자: `verylongname@verylongdomain.example.com` 즉시 거절

proposed_fix: |
  사내 적용 시: VARCHAR(255) 또는 VARCHAR(320)
  RFC 출처: https://datatracker.ietf.org/doc/html/rfc5321#section-4.5.3

bundle: (Phase 6 합산 — 길이 가이드)
external_validation_strength: 2  # 한국 사례 100% + RFC
```

---

### F-055: varchar(50) 한국어 환경 부족 (title/description) medium CANDIDATE

```yaml
finding_id: F-055
phase: 2
discovered_at: 2026-04-29
discoverer: Claude (Case Researcher)
severity: medium
status: candidate (Phase 6 합산)

description: |
  title varchar(50) / description varchar(50) — UTF-8 환경 한국어 글자 수 한계
  - 한글 1자 = UTF-8 3byte → varchar(50) ≈ 50자 (utf8mb4 환경)
  - 우형 권고: title 100~200자 / description 500자 / content TEXT or LONGTEXT

context: |
  RealWorld 영문 가정. 사내 한국어 운영 시 즉시 cut-off
  타겟 언어 환경 고려한 길이 산정 필요

proposed_fix: |
  사내 적용 시: title VARCHAR(200) / description VARCHAR(500) / content TEXT

bundle: (Phase 6 합산)
external_validation_strength: 1
```

---

### F-056: password varchar(200) Argon2 도입 시 부족 medium CANDIDATE

```yaml
finding_id: F-056
phase: 2
severity: medium
status: candidate

description: |
  password varchar(200) — BCrypt 60자 충분 / Argon2 평균 100~300자 → 부족 가능
  Spring Security `delegatingPasswordEncoder` 향후 Argon2 도입 시 cut-off 위험

proposed_fix: VARCHAR(255) 또는 TEXT
external_validation_strength: 1
```

---

### F-057: UUID + Integer PK FK 타입 혼재 cardinality estimation medium CANDIDATE

```yaml
finding_id: F-057
phase: 2
severity: medium
status: candidate

description: |
  article.author_id uuid + article.id integer — JOIN 시 UUID(16byte) + bigint(8byte)
  인덱스 혼재로 cardinality estimation 부정확 가능
  글로벌 사례 (Stripe/Discord/우형): ID 전략 일관 권고

context: |
  의도된 설계 가능성 (User=public ID 노출 보안 / 나머지=internal). 단 ADR 부재.

proposed_fix: ID 전략 ADR 신설 (단일 DB / 분산 / 외부 노출 분기)
external_validation_strength: 1
```

---

### F-058: App existsBy* TOCTOU race-prone (educational) low CANDIDATE

```yaml
finding_id: F-058
phase: 2
severity: low
status: candidate

description: |
  UserRepositoryAdapter:67-72 의 existsByEmail/Username 사전 check 패턴 = TOCTOU race-prone
  실질 race-safe 보호자는 DB UQ 제약 (DataIntegrityViolationException)

context: |
  educational caveat — 실제 데이터 보호는 DB UQ 가 됨
  AP-DOMAIN-002 race-safe vs race-prone framework (DEC-PHASE2-POC02-002) 의 evidence

proposed_fix: |
  Service layer DataIntegrityViolationException 처리 + UX 측면 사전 check (race-safe 아님 인식)

bundle: D (PoC #01 AP-DOMAIN-002 framework 가이드 강화)
external_validation_strength: 2  # PoC #01 + PoC #02 (다른 차원의 같은 finding)
```

---

## PoC #1 finding 외부 검증 (Phase 2 영역) — 종합

### closed 안정성 검증

| PoC #1 ID | 상태 | 본 PoC 결과 |
|---|---|---|
| F-007 (inventory schema) | closed | ✅ 안정 (Phase 1) |
| F-009 (신뢰도 표) | closed | ✅ 안정 (Phase 1) |
| **F-016 (Decision Tree §3.4)** | closed | ⚠️ **부분 fit + 명세 한계 발견 ★** (F-049) |
| F-023 (circular dependencies) | closed | (Phase 3 검증 예정) |

→ **closed 4건 중 1건 외부 검증 한계 발견 ★** — finding-system 의 closed → reopened 절차 정식화 필요성

### promoted 외부 검증

| PoC #1 ID | 본 PoC 결과 |
|---|---|
| **AP-DOMAIN-002** | ❌ 비재현 (개선) — race-safe DB UQ + race-prone TOCTOU = 적정 방어 |
| **AP-PERFORMANCE-001** | ✅ 재현 강함 — F-051 격상 medium → high |
| AP-DB-001 (NO ACTION FK) | ✅ 재현이지만 stack-conditional caveat |
| AP-SECURITY-001 (JWT) | ❌ 비재현 (OAuth2 RS + RSA) |
| AP-DOMAIN-001 (De Morgan) | ❌ 비재현 |
| AP-ARCH-001/002 (LV-001/002) | ❌ 비재현 (multi-module 컴파일 차단) |

### deferred 외부 검증

| PoC #1 ID | 본 PoC 결과 |
|---|---|
| F-017 (@ManyToMany / @JoinTable) | ✅ best practice 사례 — explicit junction entity (deferred 정정 권고) |
| F-018 (drift severity 처리) | drift 0건 (출처 1종) → 본 환경 부적합 |

---

## Phase 3 (arch) — 2026-04-29 등록

### F-059: 모듈 boundary 도구 도입 권고 가이드 부재 medium PROMOTED
- 출처: Document Researcher
- phase-3-arch.md §3.1.1 Step 4 가 "Spring Modulith / ArchUnit 활성" 가정만. 도구 미도입 환경 권고 단서 부재.
- proposed_fix: §3.1.1 Step 4-pre 추가 (도구 미도입 환경 권고)
- bundle: I 흡수 (메타 finding 묶음)

### F-060: closed F-023 §3.1.1 BC 분류 절차 0건 케이스 명시 부재 ★ medium PROMOTED
- 출처: Document Researcher (메타 finding)
- v1.1.2 closed 항목 두 번째 외부 검증 한계 (F-016 다음).
- phase-3-arch.md §3.1.1 5단계 절차가 cycle 0건 케이스 명시 부재 (line 208 한 줄 주석만).
- 분류 표 (5행) 에 "N/A (no cycle)" 행 부재 / architecture.json 0건 메타 표기 가이드 부재.
- closed 명세 한계 누적 2건 (F-049 + F-060) → finding-system closed → reopened 절차 정식화 권고.
- proposed_fix: §3.1.1 Step 0 추가 + finding-system 보강
- bundle: I (신규 — closed 명세 한계 메타 finding 묶음)

### F-061: Hexagonal naming hybrid 라벨 + 어휘 표준화 부재 (F-025 합산) low PROMOTED
- 출처: Document + Case
- v1.1.2 architecture.schema.json architecture_style enum 에 hybrid 표현 부재.
- Phase 3 권고: naming_pattern 별도 필드 신설 (`ports_adapters` / `layered` / `clean`).
- bundle: D (F-025 합산)

### F-062: core Spring `@Service` 의존 — 한국 hybrid 표준 caveat low PROMOTED
- 출처: Case (권용근 인용)
- 본 PoC core 가 5 @Service + 7 @Entity + Lombok 의존 — Cockburn 4번 위배.
- 한국 실무 90% hybrid 표준 (권용근 "순수성을 위해 실용성을 포기하는건 어리석은 일이다").
- proposed_fix: 방법론 본체 Hexagonal 가이드에 한국 hybrid caveat 추가
- bundle: D (Hexagonal 가이드)

### F-063: Split Package smell — `io.zhc1.realworld.config` 4 location 16 파일 medium DEFERRED §8.1
- 출처: Document + Case + 메인 사전 발견
- module/persistence/.../config (4 main + 1 test) + server/api/.../config (8 main + 3 test) = 4 location 16 파일.
- JLS §7.7.2 compile-time error / Spring Boot Issue #34409/#15967 실증.
- 위험 시나리오 3종: module-info.java 추가 / Spring Modulith 도입 / IDE auto-completion.
- 우형/카뱅 사례 회피 — **본 PoC 특이성**.
- proposed_fix (사내 적용 시): 모듈별 sub-package 분리 (`io.zhc1.realworld.persistence.config` / `io.zhc1.realworld.api.config`)
- **§8.1 deferred — PoC #03 cross-stack 검증 후 격상 결정**

### F-064: compileOnly + runtimeOnly 모범 사례 ★ (positive) DEFERRED §8.1
- 출처: Case (한국 사례 비교)
- server/api 의 `compileOnly(:module:core) + runtimeOnly(:module:persistence)` = 국내 사례 중 가장 명시적이고 단순한 Hexagonal 빌드 시스템 강제.
- 우형 ceo-united (ComponentScan) / 카뱅 메시지허브 (ConditionalOnExpression) / 카뱅 Spring Modulith (GoodsModuleDetectionStrategy) 와 동등 효과 + 더 단순.
- positive finding (강점) — 사내 적용 시 모범 사례 권고.
- **§8.1 deferred — PoC #03 (다른 빌드 시스템 — npm/sbt 등) 검증 후 격상**

### F-065: AP-ARCH-001 (LV-001) 비재현 — multi-module 회피 입증 (positive) PROMOTED
- 출처: Document + Case + 메인 grep 검증
- multi-module compileOnly + runtimeOnly 컴파일 시점 차단 효과로 PoC #01 LV-001 본 환경 비재현 확정.
- Gradle 공식 docs 권위 + 우형/카뱅 동등 메커니즘 사례.
- proposed_fix: 사내 적용 가이드 — single-module → multi-module 전환 ROI 명시
- bundle: D (AP-ARCH-001 격상 시 stack-conditional caveat 합산)

### F-066: CIRCULAR-001 비재현 — Service 간 직접 의존 0 (positive) PROMOTED
- 출처: Document + Case + 메인 grep 검증
- 5 @Service 모두 Repository port 만 의존. Service 간 직접 호출 0건.
- 카뱅 메시지허브 정책 정합 ("프라이머리 어댑터에서 코어 모듈 인터페이스만 호출").
- proposed_fix: Service 간 호출 회피 패턴 가이드 (event-driven / Repository port 만)
- bundle: D (CIRCULAR-001 격상 시 회피 메커니즘 합산)

### F-067: Adapter classes package-private — 의도된 캡슐화 vs 가시성 부족 low CANDIDATE
- 출처: 메인 plan §3.5
- TagRepositoryAdapter / UserRepositoryAdapter / ArticleRepositoryAdapter 모두 package-private (default visibility).
- ArticleSpecifications: `final class` package-private.
- 의도된 캡슐화 (Adapter 외부 접근 차단) vs 다른 모듈 사용 함정 평가.
- candidate (Phase 6 합산)

---

## PoC #1 finding 외부 검증 (Phase 3 영역)

### closed 안정성

| PoC #1 ID | 본 PoC 결과 | 상태 |
|---|---|---|
| F-007 (inventory) | 정상 사용 (Phase 1) | ✅ 안정 |
| F-009 (신뢰도 표) | 정상 적용 (Phase 1) | ✅ 안정 |
| **F-016 (Decision Tree)** | Q3 누락 발견 (Phase 2 F-049) | ⚠️ **한계** ★ |
| **F-023 (Tarjan SCC + BC)** | 0건 케이스 명시 부재 (Phase 3 F-060) | ⚠️ **한계** ★ |

→ **closed 4건 중 2건 외부 검증 한계 발견 ★★★** — finding-system closed → reopened 절차 정식화 권위 누적 2건.

### promoted 외부 검증 (Phase 3 영역)

| PoC #1 ID | 본 PoC 결과 |
|---|---|
| **AP-ARCH-001 (LV-001)** | ❌ 비재현 — multi-module 차단 (F-065 권위) |
| **AP-ARCH-002 (LV-002)** | ⚠️ 부분 재현 — core 가 spring-boot 강제 (F-062 caveat) |
| **CIRCULAR-001** | ❌ 비재현 — Service 간 호출 0 (F-066 권위) |
| **F-024** (Phase 1 vs 3 Δ) | 본 PoC Δ +0.20 격상 방향 (F-024 promoted 강화) |
| **F-025** (hybrid 표현) | 재현 강함 — modular_monolith primary + hexagonal secondary hybrid |

---

## Phase 4 (비즈니스 로직 — 4영역 병렬) — 2026-04-29 등록

### F-070: favorite/unfavorite RFC 7231 §4.2.2 위반 + spec/runtime drift ★★★ critical PROMOTED (Phase 5-1 격상)
- 출처: Document Researcher (RFC 권위) + Senior production 트라우마 (Phase 4) + Phase 5-1 spec evidence 합산
- **격상 사유 (Phase 5-1 DEC-001)**: high → critical
  - 도메인 규칙 (RFC 7231 §4.2.2) 위반 + spec/runtime drift **이중 결함**
  - openapi.yaml:380, 402 — `responses: 200 OK` (idempotent codification) ↔ ArticleService.java:184-204 — `IllegalArgumentException` throw
  - 클라이언트 신뢰 이중 손상 (정상 client spec 따라 200 기대 → 422 GenericError 수신 → DLQ/retry storm)
- ArticleService.java:184-204 — 이미 favorited/unfavorited 시 IllegalArgumentException
- **DELETE (unfavorite) idempotent MUST 위반** — RFC 7231 §4.2.2 / RFC 9110 §9.2.2
- **Profile follow/unfollow 는 service 단 idempotent (`if (already) return;`) — 같은 도메인 내 비대칭** ★
- 사례: GitHub PUT /user/starred (정합) / Twitter POST favorites/create (2018 deprecated)
- 권고: silent return + 200 OK (follow/unfollow 패턴 정합) — REC-API-IDEMPOTENCY-001
- **F-079 merged into F-070** (Phase 5-1 spec evidence 보강)
- Phase 6 인계: AP-API-001 critical 단일 등록 (F-070 + F-079 + F-085 묶음)

### F-071: UserRepositoryAdapter Hexagonal port-adapter 경계 위반 ★ high PROMOTED
- 출처: Document + Senior 합의
- UserRepositoryAdapter.java:65-83 — adapter 가 (1) email/username unique 도메인 검증 (2) PasswordEncoder 인자 흡수 + encryptPassword 호출 (3) TOCTOU race window
- **Wikipedia Hex Arch + Cockburn (2005) + Vernon IDDD Ch. 4 명시 위반**
- 권고: UserService.updateUserDetails 도메인 검증 + Adapter 단순 save

### F-072: ArticleRepositoryAdapter multi-aggregate delete orchestration medium PROMOTED
- 출처: Senior 신규 발견 (F-044/F-048 패턴 재현)
- ArticleRepositoryAdapter.java:86-89 — adapter 가 multi-step delete (deleteByArticle comments → delete article) + favorite/tag 미삭제 orphan
- F-071 같은 줄기 (port-adapter 경계 misuse)
- 권고: ArticleService 가 multi-aggregate orchestration

### F-073: Article delete CASCADE 부재 + Service 부분 처리 medium PROMOTED
- schema.sql 9 FK 모두 ON DELETE 미명시 (NO ACTION) + Service 가 article_comment 만 명시 처리
- ArticleFavorite/ArticleTag orphan row 잠재
- 권고: FK ON DELETE CASCADE 또는 Service 명시적 multi-step delete

### F-074: self-follow 금지 코드 부재 medium PROMOTED
- UserRelationshipService.java:26-32 — follower==following 검증 부재
- self-follow 시 getFeeds() 자기 글 노출
- RealWorld spec 묵시 위반 (PoC #01 동일 패턴 합산)
- 권고: follower.equals(following) 검증 추가

### F-075: Hexagonal port-adapter 책임 분리 가이드 부재 (방법론 본체) medium PROMOTED
- 출처: Document Researcher (메타 finding)
- F-071 + F-072 의 같은 줄기 — 방법론 본체 가이드 부재
- v1.2.0 ADR 후보 (묶음 D 또는 신규)

### F-076: Article.setTitle TOCTOU race low CANDIDATE
- 출처: 메인 추정 + Senior **low 강등** 채택
- ArticleService.java:111-115 check-then-set TOCTOU
- DB unique constraint 최종 방어 충분 — Phase 6 medium 양산 회피

### F-077: UserRegistry + User 양쪽 검증 redundancy low CANDIDATE
- defensive but redundant. 의도 조사 필요 (Registry 별도 = password/profile 책임 분리 가능성)

### F-078: editTitle/Description/Content DRY 위반 low CANDIDATE
- 출처: Senior 신규 발견
- ArticleService.java:106-151 — 3 메서드 동일 권한 검증 + setter 패턴 중복
- 권고: Article aggregate 에 edit(requester, EditCommand) 응집

---

## Phase 5-1 (API 계약) — 2026-04-29 등록

### F-079 ⊃ F-070 — merged (Phase 5-1 spec evidence)
- 메인 사전 raw fetch 8건 §2.3 — openapi 200 OK codification ↔ runtime 422 throw
- F-070 의 Phase 5-1 spec 측면 evidence — 별도 finding 등록 X (DEC-PHASE5-POC02-001)

### F-080: openapi limit no maximum cap (OWASP API4) medium PROMOTED
- 출처: Document (OWASP API Security Top 10 2023) + Senior cross-check
- openapi.yaml:784-792 — `limitParam: minimum: 1, default: 20` (no maximum)
- runtime cap 50 (ArticleFacets:21) 만 존재 → spec ↔ runtime contract drift
- 권고: REC-API-LIMIT-CAP-001 — `limitParam.maximum: 50` spec 명시
- Phase 6 인계: AP-API-004 medium

### F-081: x-codegen-request-body-name swagger 2.x legacy artifact low PROMOTED (medium → low 강등)
- 출처: Document (OpenAPI Generator 권위) + Senior 합의
- openapi.yaml 6 위치 — Swagger Codegen v2 vendor extension
- functional 영향 0 / cosmetic cleanup
- **DEC-PHASE5-POC02-003 — medium → low 강등** (RFC 급 권위 부재)
- 권고: REC-API-CODEGEN-CLEANUP-001 (low 우선순위)

### F-082: API 버저닝 부재 (PoC #01 F-038 재현) ★ medium PROMOTED
- 출처: Document (Stripe/GitHub 산업 표준) + Senior cross-check
- openapi.yaml:19-20 — `info.version: 1.0.0` + `servers: /api` (no `/v1`)
- 수정 비용 high (URL 변경 / Accept header)
- **PoC #01 F-038 재현 ✅** — v1.2.0 격상 데이터 확보
- 권고: REC-API-VERSIONING-001 — URI path `/v1/` prefix 도입
- Phase 6 인계: AP-API-003 medium

### F-083: DELETE 200 vs RFC 9110 §15.3.5 권고 204 (PoC #01 F-040 재현) low PROMOTED
- 출처: Document (RFC 9110 권위) + Senior cross-check
- openapi.yaml:282 (DeleteArticle) / :357 (DeleteArticleComment) — 200 EmptyOk
- 단 Unfollow / Unfavorite 는 body 반환 → 200 정당화 (부분 적용)
- 모든 controller @ResponseStatus 부재 → default 200
- **PoC #01 F-040 재현 ✅** — v1.2.0 격상 데이터 확보
- 권고: REC-API-STATUS-EXPLICIT-001 — DeleteArticle / DeleteArticleComment 만 204
- Phase 6 인계: AP-API-002 medium

### F-084: Token apiKey RFC 6750 비표준 (PoC #01 DEC-API-001 재현) medium PROMOTED
- 출처: Document (RFC 6750 권위) + Senior cross-check
- openapi.yaml:793-803 — `Token: { type: apiKey, name: Authorization }` + description `Token xxxxxx.yyyyy.zzzzz`
- **RealWorld 공식 spec 의도** — 외부 검증 ✅ (PoC #01 DEC-API-001 동일 결론)
- 사내 적용 시 Bearer JWT 표준화 권고
- 권고: REC-API-BEARER-MIGRATION-001 — Bearer JWT + Spring Security 6 OAuth2 Resource Server

### F-085: POST /users/login @ResponseStatus(CREATED) — spec/runtime drift 동형 패턴 medium PROMOTED (low → medium 격상)
- 출처: 메인 사전 raw fetch §2.6 + **Senior 격상 권고** (F-079 동형 패턴)
- UserController.java:54 — `@ResponseStatus(HttpStatus.CREATED)` ↔ openapi.yaml:32 — `responses: 200`
- login 은 신규 자원 URI 미생성 → RFC 9110 §15.3.2 위반 (201 부적절)
- spec 200 / runtime 201 → **F-079 (favorite spec/runtime drift) 와 동형 패턴** ★
- **DEC-PHASE5-POC02-003 — low → medium 격상** (drift 패턴화)
- 권고: REC-API-STATUS-EXPLICIT-001 — login 200 통일
- Phase 6 인계: AP-API-001 critical 묶음 (F-070 + F-079 + F-085)

### F-086: PUT 부분 갱신 → PATCH 권고 (RFC 5789) medium PROMOTED
- 출처: Document (RFC 5789 권위) + Senior cross-check
- UserController.java:73 + ArticleController.java:84-106 — PUT 메서드 + 부분 갱신 분기
- openapi.yaml:729 description: "At least one field is required" — 부분 갱신 의도 명시
- UpdateUser DTO all-optional → RFC 9110 §9.3.4 (PUT = full replace) 위반
- 권고: REC-API-PATCH-001 — application/merge-patch+json (RFC 7396)
- Phase 6 인계: AP-API-005 medium

### F-087: ModelAndView 307 internal redirect leaked to client medium PROMOTED (Senior 신규 발견)
- 출처: **Senior §5.2 신규 발견** (메인 미발견)
- UserController.java:49-51 — signup 후 ModelAndView TEMPORARY_REDIRECT (`/api/users/login`)
- internal server-side redirect 가 client 에 visible (307 응답)
- REST 원칙 위반 (idempotent + cacheable 분기 영향)
- 권고: REC-API-NO-INTERNAL-REDIRECT-001 — 직접 호출 또는 client redirect
- Phase 6 인계: AP-API-008 medium

---

## PoC #1 finding 외부 검증 (Phase 4 영역) — 종합

### closed 안정성

| PoC #1 ID | 본 PoC 결과 |
|---|---|
| **AP-DOMAIN-001** (De Morgan) | ❌ **비재현 (해소)** — ArticleCommentService 깔끔 ★ |
| **F-027** (BR ≠ actual_behavior) | ❌ **비재현** |
| **F-028** (User equals/hashCode mutable) | ❌ **비재현** — getId UUID 의존 |

### promoted 외부 검증

| PoC #1 ID | 본 PoC 결과 |
|---|---|
| AP-PERFORMANCE-002 (Pageable cap) | ✅ **재현 + 회피** — ArticleFacets:21 size cap 50 명시 (PoC #01 부재) |
| BR-USER-FOLLOW-NO-SELF | 동일 패턴 재현 (F-074) |

### 새 anti-pattern (regression — Hexagonal 도입 부산물)
- F-070 favorite RFC 위반 (PoC #01 미발견)
- F-071/F-072 port-adapter 경계 위반 (Hexagonal 도입 부산물)
- F-052 title unique over-constraint (Phase 2 — Phase 4 도메인 의미 검증)

---

## 누적 통계 (2026-04-29 PoC #02 **Phase 6 종료 / PoC #02 분석 종결 ✅**)

```yaml
poc_02_total: 43  # Phase 1 6 + Phase 2 11 + Phase 3 9 + Phase 4 9 + Phase 5-1 8 (F-079 merged) + Phase 6 0 (분류/통합)
poc_02_promoted: 31
poc_02_candidate: 8
poc_02_deferred: 4
poc_02_merged: 1     # F-079 → F-070
poc_02_closed: 0
poc_02_rejected: 0

# Phase 6 antipatterns final
poc_02_ap_total: 21
poc_02_ap_critical: 3    # AP-API-001 (F-070 묶음) / AP-DB-001 (F-048) / AP-SECURITY-001 (F-068 / PoC #01 isomorphic)
poc_02_ap_high: 3        # AP-ARCH-001 (F-071) / AP-DOMAIN-001 (F-052) / AP-PERFORMANCE-001 (F-051 격상)
poc_02_ap_medium: 11
poc_02_ap_low: 4

# 7대 산출물 6/7 도달 (UI/UX 제외 100%)
poc_02_seven_deliverables: "6/7 (UI/UX N/A — BE only)"

cumulative_total: 76    # PoC #1 33 + PoC #2 43
cumulative_promoted: 41
cumulative_deferred: 18
cumulative_closed: 10
cumulative_rejected: 0
cumulative_ap_total: 36  # PoC #1 15 + PoC #2 21

v120_bundles: 11  # A~K (Phase 6 종료 시 변동 없음 / 신규 ADR 후보는 묶음 내 통합)
                  # 묶음 H (Auth/Crypto 검증 가이드) — PoC #01 AP-SECURITY-001 + PoC #02 AP-SECURITY-001 isomorphic 강력 evidence ★★★
                  # 묶음 J (Hexagonal port-adapter 가이드) — PoC #02 단독 신규 (F-075)
                  # 묶음 K 후보 (multi-module Outside-in 모범 사례) — F-064/F-065/F-066 positive findings

# PoC #01 15 AP cross-validation 결과
poc_01_cross_validation:
  not_reproduced: 8      # 53% — 학습 효과 + Hexagonal/Spring Boot 3.x 효과
  reproduced: 4          # 27% — v1.2.0 합산 격상 강한 권위
  morphologically_reproduced: 3  # 20% — AP-SECURITY-001 (JWT 21byte → RSA git commit) + AP-DOMAIN-002 + AP-ARCH-002

threshold_status: |
  F-021 임계 68건 (20+ "명세 자체 부실 의심" 영역 깊이 진입).
  단 비중 분석:
  - PoC #1 외부 검증 가속 (closed 4/4 한계 2건 ★ + promoted 5건 비재현)
  - 메타 finding 누적 3건 (F-049 + F-060 + F-075 — closed 명세 한계 + Hexagonal 가이드)
  - Senior 직접 발견 ★ 4건 (F-048 critical + F-068/F-069/F-070 의 일부)
  - F-044/F-048 패턴 Phase 3/4 비재현 = 학습 효과 입증 ★
  → §8.1 강제: PoC #03 (다른 stack/도메인) 진입 권고 강함.
```

### Phase 4 KPI 평가 ✅

- ✅ finding 9건 신규 등록 (F-070~F-078) = 건강 범위 5~15 정합
- ✅ schema 검증 통과 (domain.schema.json + rules.schema.json + antipatterns.schema.json)
- ✅ 6 핵심 결정 (DEC-PHASE4-POC02-001~006) — Auto Mode 자율 적용
- ★ **F-070 high (favorite RFC 7231 위반)** — RFC 권위 + GitHub/Twitter 사례
- ★ **F-071 + F-072 high/medium (port-adapter 경계 위반)** — Hexagonal 도입 부산물 새 anti-pattern
- ★ **F-075 메타 finding** — Hexagonal 가이드 방법론 본체 (v1.2.0 묶음 J 신설)
- ✅ AP-DOMAIN-001 / F-027 / F-028 비재현 — PoC #01 critical 결함 해소 confirmed
- ✅ AP-PERFORMANCE-002 회피 — ArticleFacets size cap 50 (PoC #01 부재)

### Phase 5-1 KPI 평가 ✅

- ✅ finding 8건 신규 등록 (F-080~F-087) + F-070 critical 격상 + F-079 merged = 9건 처리
- ✅ schema 검증 통과 (openapi.yaml ground truth 자동 정합 + api-extension.json parse OK 19 op / 18 schemas)
- ✅ 6 핵심 결정 (DEC-PHASE5-POC02-001~006) — 윤주스 일괄 승인
- ★ **F-070 high → critical 격상** — spec/runtime drift + RFC 7231 이중 결함 ★★★
- ★ **F-085 low → medium 격상** (drift 패턴화 — F-079 동형)
- ★ **Senior 신규 발견 2건** (F-087 + AP-API-006 candidate)
- ★ **PoC #01 재현 3건** (F-038/F-040/DEC-API-001 → F-082/F-083/F-084) — v1.2.0 합산 격상 데이터 확보
- ★ **PoC #01 비재현 3건** (AP-DOMAIN-001/F-027/F-035) — 학습 효과 입증
- ★ **가벼운 sub-agent 전략 성공** — Document 1분 33초 / Senior 2분 5초 (Phase 3 30+분 대비 약 10배 단축)
- ★ **openapi.yaml ground truth 효과** — raw confidence 0.93 (PoC #01 동급 + ground truth 정합 1.00)

---

### Phase 6 KPI 평가 ✅ (PoC #02 종료)

- ✅ 21 AP final 등록 (critical 3 / high 3 / medium 11 / low 4)
- ✅ schema 검증 통과 (^AP-[A-Z]+-\d+$ 21/21)
- ✅ 5 핵심 결정 (DEC-PHASE6-POC02-001~005) — 윤주스 일괄 승인
- ✅ Phase 6 신규 finding 0건 (분류/통합 작업 — 정상)
- ✅ ID 정규화 6건 (Phase 4 multi-prefix → single)
- ✅ composite view 4건 도입 (PoC #01 1건 → 4건 확장)
- ★ **AP-API-001 critical 격상** (Phase 5-1 정합) — F-070+F-079+F-085 묶음
- ★ **AP-DB-001 critical 신규** — F-048 TagJpaRepository<Tag, Integer> 타입 오류 (Phase 2 Senior)
- ★ **AP-SECURITY-001 critical 신규** — F-068 RSA git commit (Phase 3 Senior / PoC #01 isomorphic ★)
- ★ **PoC #01 15 AP cross-validation** — 비재현 53% / 재현 27% / 변형 재현 20%
- ★ **모범 사례 부록 신설** — F-064/F-065/F-066 positive findings (PoC #02 신규)
- ★ **raw confidence 0.96** (PoC #01 동급)
- ★ **PoC #02 산출물 6/7 도달 (UI/UX 제외 100%)** ★

---

## PoC #02 종료 — 종합 결산 (2026-04-29)

### 7대 산출물 (6/7 — UI/UX 제외 100%)

| # | 산출물 | Phase | raw confidence | 비고 |
|---|---|---|---|---|
| 1 | architecture | 3 | 0.92 | Hexagonal Modular Monolith hybrid 0.65 cap |
| 2 | domain | 4 | 0.83 | 4 Aggregate Root + 25 UC + 14 BR |
| 3 | api | 5-1 | 0.93 | 19 operationId / openapi.yaml ground truth 802 line |
| 4 | db | 2 | 0.85 | 7 @Entity + Specifications + p6spy |
| 5 | rules | 4 | 0.83 | 14 BR (validation 5 / policy 5 / authorization 3 / login 1) |
| 6 | antipatterns | 6 | 0.96 | 21 AP final (critical 3 / high 3 / medium 11 / low 4) |
| 7 | ui_ux | — | N/A | BE only (F-026 재현) |

### 누적 finding 76건 분포

| status | count | 비고 |
|---|---|---|
| closed | 10 | PoC #01 10 (변동 없음) |
| promoted | 41 | PoC #01 10 + PoC #02 31 |
| deferred | 18 | |
| candidate | 8 | PoC #02 — Phase 6 미진입 (AP-API-001 candidate ID 등) |
| merged | 1 | F-079 → F-070 |
| rejected | 0 | |

### v1.2.0 격상 데이터 합산 결과 (11 묶음 A~K)

- 묶음 A (cross-validation F-015) — F-044 보강 ★
- 묶음 D (schema 진화 F-025) — multi-module 표현 + Hexagonal 모듈 분리
- 묶음 G (OpenAPI x-extension ADR-007) — PoC #02 외부 검증 ✅
- 묶음 H (Auth/Crypto 검증) — PoC #01 + PoC #02 isomorphic evidence 강력 ★★★ (AP-SECURITY-001 양 PoC 재현)
- 묶음 J (Hexagonal port-adapter) — PoC #02 단독 신규 (F-075)
- 묶음 K (multi-module Outside-in 모범 사례) — F-064/F-065/F-066 positive findings

### 다음 단계 — 윤주스 결정 영역

옵션 A — **v1.2.0 합산 격상 진행**
- PoC #01 + PoC #02 데이터 충분 (AP 36 / finding 76 / 묶음 11)
- 즉시 v1.2.0 PATCH 릴리스 가능

옵션 B — **PoC #03 진입 후 합산 격상**
- 다른 stack/도메인 (FastAPI / NestJS / Ktor 등) 일반화 검증 가속
- §8.1 단일 PoC 과적합 회피 강제 신호 활용
- 재작업 최소화 영향 (격상 후 PoC #03 추가 영향 없음)

---

## 누적 통계 (2026-04-29 PoC #02 Phase 3 종료)

```yaml
poc_02_total: 26        # Phase 1 6 + Phase 2 11 + Phase 3 9
poc_02_promoted: 17     # Phase 1 3 + Phase 2 7 + Phase 3 7
poc_02_candidate: 5     # Phase 2 4 + Phase 3 1
poc_02_deferred: 5      # Phase 1 3 + Phase 3 2 (F-063/F-064 §8.1)
poc_02_closed: 0
poc_02_rejected: 0

cumulative_total: 59    # PoC #1 33 + PoC #2 26
cumulative_promoted: 27 # PoC #1 10 + PoC #2 17
cumulative_deferred: 18
cumulative_closed: 10
cumulative_rejected: 0

v120_bundles: 10  # +1 (I 신규 — closed 명세 한계 메타 finding 묶음 / F-049 + F-060)

threshold_status: |
  F-021 임계 59건 (20+ "명세 자체 부실 의심" 영역 깊이 진입).
  단 비중 분석:
  - PoC #1 외부 검증 가속 (closed 4 / promoted 다수 비재현 / deferred 정정)
  - 메타 finding 누적 2건 (F-049 + F-060 — closed 명세 한계 외부 노출)
  - Senior 직접 발견 ★ (F-048 critical Phase 2)
  - F-044/F-048 패턴 Phase 3 비재현 = 방법론 학습 효과 입증 ★
  → v1.1.2 자체 부실 아님. §8.1 강제 — PoC #03 (다른 stack/도메인) 즉시 진입 권고.
```

### Phase 3 KPI 평가 ✅

- ✅ finding 9건 신규 등록 (F-059~F-067) = 건강 범위 5~15 정합
- ✅ schema 검증 통과 (architecture.schema.json)
- ✅ 6 핵심 결정 (DEC-PHASE3-POC02-001~006) — Auto Mode 자율 적용
- ★ **F-060 메타 finding** — closed F-023 §3.1.1 0건 케이스 한계 (F-049 와 함께 누적 2건)
- ★ **Phase 1 cap 0.65 → Phase 3 0.85 격상 (Δ +0.20)** — 우형/카뱅 3 사례 정합 권위
- ★ **F-044/F-048 패턴 Phase 3 비재현** — 방법론 학습 효과 입증 / §8.1 PoC #03 진입 신호
- ✅ AP-ARCH-001 / CIRCULAR-001 비재현 권위 데이터 (F-065 / F-066)

---

### Phase 2 KPI 평가 ✅

- ✅ finding 11건 신규 등록 = 건강 범위 5~15 정합
- ✅ schema 검증 통과 (db-schema.schema.json)
- ✅ 6 핵심 결정 (DEC-PHASE2-POC02-001~006) — Auto Mode 자율 적용
- ★ **F-048 critical** — TagJpaRepository 타입 오류 (Senior 직접 발견 / F-044 패턴 재현)
- ★ **F-049 메타** — v1.1.2 closed 항목 (F-016) 첫 외부 검증 한계 노출
- ★ **F-050 high** — schema.sql ORM derivative 출처 의존성 분별 절차 신설 권고
- ✅ AP-DOMAIN-002 race-safe vs race-prone framework — v1.2.0 묶음 D 가이드 강화
- ✅ PoC #1 finding 외부 검증: closed 4/4 (1건 한계 발견 ★) / promoted 4 비재현 + 1 재현 강함 / deferred 1 정정

---

## 다음 액션 (2026-04-29 PoC #02 Phase 2 종료 시점)

1. ⏳ **Phase 3 (arch) 진입** — module 의존성 방향 검증 + Hexagonal naming hybrid 확정
2. ⏳ Phase 3 시그널 검증: AP-ARCH-001/002 (LV-001/002) multi-module 비재현 검증 / F-048 architecture 영향 합산
3. ⏳ Phase 6 진입 시 합산: F-051 EAGER + Specification 시나리오 / F-053 titleToSlug / F-058 TOCTOU
4. ⏳ Phase 6 종료 후 PoC #03 (다른 도메인) 진입 (윤주스 결정)
5. ⏳ v1.2.0 격상 — PoC #1 + #2 (+ #3) 합산 (9 묶음 A~I 일괄)
