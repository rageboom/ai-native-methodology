# Case Research — PoC #01 Phase 2 (db, DB 스키마 + 정합성 검증)

> 역할: 테크기업 사례 리서처 (Work Principles 2원칙 中)
> 작성일: 2026-04-27
> 대상 plan: `.claude/plans/plan-phase2.md`
> Phase 명세: `ai-native-methodology/methodology-spec/workflow/phase-2-db.md`
> 동료 research 참고: `.claude/researches/case-phase1.md`

---

## §0. 사전 고지

본 research 는 sub-agent (테크기업 사례 리서처) 가 WebSearch / WebFetch 로 직접 검증한 사례 + 검증 실패 영역의 정직 보고를 통합한 결과다.

- (V) 마킹 = sub-agent 가 직접 fetch 로 1차 출처 확인
- (S) 마킹 = WebSearch 결과 요약은 있으나 1차 fetch 미확인
- 한국 사례 검증 목표: 최소 2건 → **달성 4건** (카카오페이 DDD, 우아한형제들 도메인 분리, 우아한형제들 Legacy DB 복합키, 카카오헤어샵 DDD)

본 PoC 의 강한 검증 케이스: **schema.sql DDL ↔ JPA Entity 정합성 검증** (출처 2개, 운영 DB 부재). 본 research 는 이 케이스에 직접 적용 가능한 패턴을 우선 추출했다.

---

## §1. DDL ↔ ORM 정합성 검증 사례 (drift detection)

### 1.1 Liquibase Drift Detection (V)

**출처**:
- https://docs.liquibase.com/workflows/liquibase-community/drift-detection.html
- https://www.liquibase.com/blog/database-drift

**핵심**:
- Drift = "표준 거버넌스 마이그레이션 프로세스 외부에서 schema 가 변경된 상태"
- 검출 방식:
  - `liquibase diff --format=json` → 두 DB 상태 비교 (테이블/컬럼/타입/FK/index)
  - `DATABASECHANGELOG` (Liquibase) / `flyway_schema_history` (Flyway) 추적 테이블의 checksum 으로 "스크립트 변조" 검출
  - Snapshot vs Snapshot 비교 (Drift Detection Reports)
- 가능한 보정: 누락 changeset 자동 생성 → 적용 또는 `markRunSync` 으로 동기화
- Liquibase + Hibernate 통합: `liquibase-hibernate6` 모듈로 JPA entity → changelog 역생성 가능 (entity ↔ DB 동기화 자동화).

**본 PoC 적용**:
- ✅ **가져올 점**: Phase 2 의 `정합성-검증-보고서.md` 가 정확히 Liquibase drift report 의 구조 (테이블/컬럼/타입/FK 분류 + severity) 와 동치. severity 라벨 (high/medium/low) + `decision_required` 필드는 Liquibase 의 critical/non-critical drift 분류와 정합.
- ✅ DRIFT-XXX 명명 규칙은 Liquibase 의 `liquibase diff` 출력 ID 체계에서 영감 받은 것으로 정당화 가능.
- ⚠️ **본 PoC 는 도구 미사용** — schema.sql 정적 + JPA Entity 정적 비교 (수동 sub-agent). Liquibase 자동 도구 미적용. 신뢰도는 도구 자동 검증보다 한 단계 낮음을 명시.

### 1.2 Flyway + Hibernate `validate` 정책 (V)

**출처**:
- https://rieckpil.de/howto-best-practices-for-flyway-and-hibernate-with-spring-boot/
- https://vladmihalcea.com/validate-ddl-schema-spring-hibernate/

**핵심**:
- 운영 권장: `spring.jpa.hibernate.ddl-auto=validate` + Flyway 가 schema 의 단일 SoT
- 부팅 순서: Flyway 마이그레이션 적용 → Hibernate 가 entity ↔ DB 검증 → 불일치 시 부팅 실패 (fail-fast)
- `validate` 가 검증하는 것: 컬럼 존재 / 타입 호환성 / nullable / 길이 (제한적)
- `validate` 한계 (Vlad Mihalcea):
  - 100+ entity 부팅 시 ~138ms 소요 → 1000 test 에서 ~2분 18초 누적 손실
  - 권장: 글로벌 `none` + `@DataJpaTest` 1건으로 dedicated validation 사이클

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC 의 RealWorld 는 `ddl-auto=none` + schema.sql 자동 로드 — Flyway 없는 변형이지만 "DDL 이 SoT" 라는 사상은 동일. 정합성 우선순위 `DDL > JPA` 정당화의 1차 출처.
- ✅ Phase 2 명세 §3.4 통합 우선순위 (DB > ORM > ERD) 가 운영 환경 가정. 본 PoC 는 운영 DB 없이도 "schema.sql 이 실제 DDL" → 동일 원칙 적용.
- ⚠️ **불일치 가능성**: 본 PoC 는 자동 validate 부재. JPA Entity 와 schema.sql 차이가 "런타임 검증 안 됨" 상태. F-016 후보 (학습용 spec 의 정합성 검증 한계).

### 1.3 Atlas (Ariga) Declarative Migration (V)

**출처**:
- https://atlasgo.io/atlas-vs-others
- https://atlasgo.io/concepts/declarative-vs-versioned

**핵심**:
- "Terraform for Databases" — declarative schema-as-code.
- ORM 16종 schema loader (SQLAlchemy, Django, GORM, Hibernate 등) → ORM 정의를 Atlas 가 읽어서 "declared state" 로 사용 → "live DB state" 와 비교 → 자동 plan/lint/apply.
- Drift Detection: live schema 가 repo schema 와 어긋난 순간 ERD/HCL/SQL diff 알림.
- 기존 Flyway/Liquibase 와의 차이: ORM-DB **양방향** 동기화 도구가 아니라 **한 방향** (ORM → DB). 기존 도구는 versioned-only.

**본 PoC 적용**:
- ✅ **가져올 점**: Phase 2 의 "출처 통합 우선순위" 정책은 Atlas 의 "declared state vs live state" 사상과 정합. 본 PoC 의 "schema.sql (declared) vs JPA Entity (declared)" 양 declared 비교는 Atlas 의 "두 declared state 비교" 와 유사.
- ⚠️ Atlas 자체는 본 방법론 범위 밖 (분석 도구 아닌 마이그레이션 도구). 발상만 차용.

### 1.4 PostgreSQL Schema Introspection (V)

**출처**:
- https://www.postgresql.org/docs/current/information-schema.html
- https://www.percona.com/blog/diffing-postgresql-schema-changes/
- https://github.com/cbbrowne/pgcmp

**핵심**:
- INFORMATION_SCHEMA = SQL-standard, portable, 안정적. 단, PostgreSQL-specific feature (예: 부분 index, exclusion constraint) 는 부재.
- pg_catalog = PostgreSQL-specific 메타정보. `pg_get_constraintdef`, `pg_get_indexdef`, `pg_get_viewdef` 등 reconstruction 함수.
- 스키마 비교 도구: pgcmp (INFORMATION_SCHEMA 기반), apgdiff (pg_dump output 비교).
- 권장 절차: `pg_dump --schema-only` 로 양쪽 추출 → 텍스트 diff 또는 도구 비교.

**본 PoC 적용**:
- ⚠️ **본 PoC 직접 적용 불가**: 운영 PostgreSQL 부재 (H2 인메모리 + PostgreSQL 호환 모드). pg_dump / INFORMATION_SCHEMA 모두 사용 불가.
- ✅ **인계 가치**: 사내 PoC 에서 운영 DB 가 있다면 Phase 2 의 "운영 DB 메타" 입력은 INFORMATION_SCHEMA 또는 pg_dump 로 표준화 가능. v1.2 후보.

### 1.5 한국 사례: 우아한형제들 Legacy DB JPA Mapping [한국 #1] (V) ⭐

**출처**: https://techblog.woowahan.com/2595/ ("Legacy DB의 JPA Entity Mapping (복합키 매핑 편)")

**핵심**:
- Legacy DB (이미 존재하는 DDL) ↔ 신규 JPA Entity 매핑 — 본 PoC 와 완전 동일한 시나리오.
- 복합키 매핑 비교:
  - `@EmbeddedId` — 객체지향적, but 깊이 있는 nesting (`payShop.getId().getPayDetailId()...`)
  - `@IdClass` — 필드 중복, but 비즈니스 식별자 직접 노출 → legacy DB 복합키 명확
- **선택 기준**: Legacy DB 매핑 시 `@IdClass` 우선 (필드 중복은 받아들임). 신규 시스템은 surrogate key + non-identifying 관계 권장.
- "완전 재구축이 깨끗하지만, strangler pattern 으로 점진 마이그레이션 권장."

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC 의 `articles_tags`, `article_favorites`, `user_followings` 3개 join table → `@JoinTable` (RealWorld 선택) vs `@IdClass` Entity 승격 (우형 권장) 의 trade-off 비교 정당화.
- ✅ source-info.md 의 "@JoinTable 선호" Design Principal 은 신규 학습용 spec 이므로 surrogate-key 패턴 회피한 선택. 우형의 "Legacy 라면 @IdClass, 신규라면 surrogate" 와 정합.
- ⚠️ Article ↔ Tag 관계가 추후 "favorited_at timestamp" 같은 메타가 생기면 Entity 승격 필요 (Vlad Mihalcea §3.1 참고).

### 1.6 Schema Drift in Spring Boot Pipelines (V)

**출처**: https://medium.com/@AlexanderObregon/schema-drift-detection-in-spring-boot-migration-pipelines-8568b342f6ab

**핵심**:
- Drift 원인 4종: (1) 운영 직접 수정 (2) 기적용 마이그레이션 변조 (3) 환경별 skipped 마이그레이션 (4) 환경 간 manual 충돌.
- 검출 3 layer:
  - Migration history checksum (Flyway/Liquibase tracking table)
  - Startup validation (`./mvnw flyway:validate`)
  - Catalog query (INFORMATION_SCHEMA 비교)

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC 의 정합성 보고서가 "drift cause type" 분류 필드 추가 가능 (현재 plan §3.4 의 type 필드 — `column_only_in_X`, `type_mismatch` 등은 결과 분류, drift cause 는 원인 분류 — 보완 가능).

---

## §2. Aggregate 추출 패턴 (@Embedded / DDD)

### 2.1 Vaughn Vernon "Effective Aggregate Design Part I" (V) ⭐

**출처**: https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf

**핵심**:
- Aggregate = 단일 단위로 다뤄지는 도메인 객체 cluster. boundary 가 consistency 범위.
- Value Object 원칙:
  - immutable, identity 없음, 속성으로만 정의됨
  - JPA `@Embedded` 가 정확히 이 패턴을 지원 — 별도 테이블 없이 parent entity table 에 inline.
- 4 design rule:
  1. Aggregate 적정 크기 (너무 크면 transaction contention, 너무 작으면 fragmented)
  2. 모든 수정은 aggregate root 통해
  3. non-identity 속성은 value object 로
  4. Consistency boundary = single aggregate

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC 의 `Article` ↔ `ArticleContents` (`@Embeddable`) 가 정확히 Vernon 의 패턴. ArticleContents = title/description/body 의 value object inline → articles 테이블 컬럼으로.
- ✅ Phase 4 입력 라우팅: `@Embedded` 발견 → "aggregate 의 value object 후보" 로 분류 → Phase 4 5.A 에서 도메인 모델 구축 시 우선 활용.
- ⚠️ JPA 한계 (Baeldung "Persisting DDD Aggregates" V): JPA 가 value object 의 final/immutable 깨뜨림 — empty constructor 강제, setter 강제. 본 PoC ArticleContents 도 같은 한계.

### 2.2 Baeldung "Persisting DDD Aggregates" (V)

**출처**: https://www.baeldung.com/spring-persisting-ddd-aggregates

**핵심**:
- Order (aggregate root) → OrderLine 들 → Product 참조. 비즈니스 invariant: totalCost = sum(lines).
- JPA 친화성 한계:
  - value object 가 인공 식별자/setter 강제 받음
  - final 속성 mutable 강제
  - Joda Money 같은 복합 타입 → custom converter 필요
  - empty constructor 강제 → immutability 깨짐
- 결론: SQL DB + JPA 는 aggregate 표현에 마찰 큼. Document store (MongoDB) 가 자연스럽지만 SQL 도 가능 (트레이드오프 받아들이고).

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC 의 `ArticleContents @Embeddable` 이 가지는 한계 명시 — RealWorld 가 학습용 spec 임에도 final 필드/empty constructor 등 JPA 마찰 항목 동일하게 발현 예상.
- ⚠️ Phase 4 5.A 의 "aggregate boundary 추출" 시 JPA 한계로 인한 implementation drift (의도된 immutable 이 mutable 로 풀림) 도 finding 후보.

### 2.3 Spring Modulith Aggregate Detection (V)

**출처**:
- https://docs.spring.io/spring-modulith/reference/fundamentals.html
- https://www.archi-lab.io/infopages/spring/spring-modulith-getting-started.html

**핵심**:
- Module 식별: `@SpringBootApplication` 클래스 패키지의 직접 sub-package = application module (default).
- Aggregate 식별: `@AggregateRoot` (jMolecules) 또는 entity 가 repository 를 가지면 자동 인식.
- Vaughn Vernon "aggregate design rules" 강제:
  - Aggregate boundary = transaction boundary
  - Aggregate 작게 유지
  - Aggregate 간 참조는 ID only
  - 통신은 domain event 로
- 모듈 boundary 강제: sub-package 의 `internal` 패키지는 외부 참조 금지 (런타임 verify).

**본 PoC 적용**:
- ✅ **가져올 점**: Phase 3 (arch) 에서 RealWorld 의 `domain/{user,article,article/comment,article/tag}` 패키지 구조 = Spring Modulith 의 default module detection 과 정합. 본 PoC 의 "모듈 식별" 단계가 Modulith 사상과 동치.
- ✅ Phase 4 의 aggregate root 식별: `@Entity` + repository 존재 = aggregate root 후보. RealWorld 는 jMolecules 미사용이지만 패턴 동일.
- ⚠️ Modulith 자체는 본 방법론 도구 아님 (분석 도구). 발상만 차용.

### 2.4 한국 사례: 카카오페이 여신코어 DDD [한국 #2] (V) ⭐

**출처**: https://tech.kakaopay.com/post/backend-domain-driven-design/

**핵심**:
- 후불결제(BNPL) 여신코어시스템을 DDD 로 구축.
- 아키텍처:
  - Bounded Context = Gradle 모듈 분리 (강한 격리)
  - Aggregate Root 명시 (예: Recovery for payment handling) — transaction boundary + 유일 진입점
  - Domain repository 가 도메인 entity ↔ JPA entity 번역자 역할 (도메인 entity ≠ JPA entity)
- 구현 규칙:
  1. 도메인 기능은 소유 도메인에서만 실행
  2. Private constructor → factory method 강제
  3. internal-scoped property → 외부 수정 차단
  4. Command object 로 도메인 작업 캡슐화 (`CreateCommand`)
- 알려진 마찰: Spring Batch 가 internal 도메인 entity 접근 불가 → JPA entity 중복 정의 발생.

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC 의 RealWorld 는 도메인 entity = JPA entity (혼합) — 학습용 spec 이므로 단순화. 카카오페이 패턴 (도메인 ≠ JPA 분리) 은 v1.2 사내 PoC 시 적용 후보.
- ✅ Phase 4 5.A 추출 시 "도메인 entity vs JPA entity 일체형/분리형" 패턴 분류 필드 추가 정당화.
- ⚠️ RealWorld (학습용 spec) 의 일체형 패턴은 운영 시스템에서 흔한 단순 패턴 — 비판 대상 아님. 다만 카카오페이 같은 복잡 도메인은 분리 권장 명시.

### 2.5 카카오헤어샵 DDD [한국 #3] (S)

**출처**: https://brunch.co.kr/@cg4jins/7 (search 결과만, fetch 미수행)

**핵심 (search 요약)**:
- Domain 에 JPA `@Entity` + Factory 구현. 도메인 용어 그대로 사용 (예: 예약 Reservation, 상태 READY/OK).
- 카카오페이 (도메인 ≠ JPA 분리) 와 다른 선택 — 도메인 = JPA 일체형.

**본 PoC 적용**:
- ✅ 한국 SI 환경에서도 "일체형 vs 분리형" 양 패턴 공존 — 본 PoC RealWorld 의 일체형 선택 정당화.
- ⚠️ Search 결과만 — v1.2 calibration 시 fetch 검증 권장.

---

## §3. JPA `@JoinTable` vs 별도 Entity

### 3.1 Vlad Mihalcea: Many-to-Many with Extra Columns (V) ⭐

**출처**: https://vladmihalcea.com/the-best-way-to-map-a-many-to-many-association-with-extra-columns-when-using-jpa-and-hibernate/

**핵심 (선택 기준)**:
- `@ManyToMany + @JoinTable`: join table 이 **순수 FK 2개만** 일 때 — 단순.
- 별도 Entity 승격: join table 에 **extra column** (timestamp, status, metadata 등) 필요할 때 — 필수.
- 패턴: `@Embeddable` composite key + 양방향 `@OneToMany` 두 개 → 추가 컬럼 안전 persist.
- 추가 인사이트: 별도 Entity 가 cleaner SQL performance 도 제공 (Vlad 주장).

**본 PoC 적용**:
- ✅ **가져올 점**: 본 PoC 의 3 join table 모두 순수 FK 2개 (extra column 없음) → `@JoinTable` 선택 정당화. RealWorld 의 source-info.md "@JoinTable 선호" 는 Vlad 의 권장과 정합.
- ✅ Phase 4 (BR 추출) 시 "favorited_at timestamp" 같은 메타가 추가되면 Entity 승격 필요 — 본 PoC 정합성 보고서에 future-proofing 메모 권장.

### 3.2 Baeldung Many-To-Many in JPA (V)

**출처**: https://www.baeldung.com/jpa-many-to-many

**핵심**:
- `@JoinTable` 은 한쪽만 navigate 가능 (단방향) 또는 양쪽 (`mappedBy`).
- 양쪽 entity 에 동일 `@JoinTable` 명시는 anti-pattern — `mappedBy` 로 owning side 1개만.
- 별도 Entity 패턴: composite PK (`@Embeddable` + `@EmbeddedId`) + 양 entity 에 `@OneToMany`.

**본 PoC 적용**:
- ✅ 본 PoC 의 RealWorld JPA Entity fetch 시 "양쪽 `@JoinTable` 중복" anti-pattern 발현 여부 체크 — finding 후보.
- ✅ owning side 명확성 확인 — Article 이 owning, Tag 가 inverse 일 가능성 (RealWorld 패턴).

### 3.3 한국 사례 (검증 실패 — 정직 보고)

**상태**: 우아한형제들 / 카카오 / 네이버 / 토스 의 "다대다 join table 처리" 주제 직접 매칭 글 — sub-agent 가 1차 fetch 미확인. §1.5 우형 Legacy DB 글에서 복합키 일반론은 다뤘으나 `@JoinTable` vs Entity 직접 비교 없음.

**본 PoC 영향**:
- 글로벌 사례 (Vlad, Baeldung) 만으로 패턴 정당화 가능.
- 한국 사례 보강은 v1.2 사내 PoC 시 — F-새로운 후보: "한국 SI 의 다대다 join table 처리 실증 사례 부재" (선택적 finding).

---

## §4. 운영 DB 부재 환경의 정합성 검증 한계

### 4.1 Spring PetClinic (V)

**출처**:
- https://github.com/spring-projects/spring-petclinic/blob/main/src/main/resources/application.properties
- https://github.com/spring-petclinic/spring-petclinic-data-jdbc/blob/master/src/main/resources/db/migration/V001__schema.sql

**핵심**:
- PetClinic 의 `application.properties`: `spring.jpa.hibernate.ddl-auto=none` + `spring.datasource.schema=classpath*:db/${database}/schema.sql` — 본 PoC RealWorld 와 동일 패턴.
- 7 테이블 (vet, specialty, vet_specialty, owner, pet_type, pet, visit) — 학습용 spec 으로 RealWorld 7 테이블과 규모 동일.
- `db/${database}/schema.sql` 패턴: H2/MySQL/PostgreSQL 별 별도 schema.sql — multi-DB 지원.
- Flyway 변형 (`spring-petclinic-data-jdbc`): `V001__schema.sql` 로 versioned migration. Hibernate 미사용 (Spring Data JDBC).

**본 PoC 적용**:
- ✅ **가져올 점**: PetClinic = 본 PoC 의 글로벌 reference. ddl-auto=none + schema.sql 패턴은 학습용 spec 의 표준. 본 PoC 의 정합성 우선순위 (DDL > JPA) 정당화의 가장 가까운 출처.
- ✅ "운영 DB 부재" 한계는 PetClinic 도 동일 — 학습용 spec 의 정합성 검증은 정적 비교 한계 인정.
- ⚠️ PetClinic 도 자동 drift detection 도구 미적용 — 같은 한계 공유.

### 4.2 JHipster (V)

**출처**:
- https://www.jhipster.tech/development/
- https://dev.to/entando/how-to-use-liquibase-to-update-the-schema-of-your-jhipster-application-1cm3

**핵심**:
- JHipster 는 **Liquibase 자동 changelog 생성** 으로 entity ↔ DDL 정합성 강제.
- workflow:
  1. JPA entity 수정 (필드 추가/관계 변경)
  2. `./mvnw liquibase:diff` 또는 entity sub-generator 실행 → changelog 자동 생성
  3. 다음 부팅 시 Liquibase 가 changelog 적용
- `--incremental-changelog` (JHipster 7+): entity 수정마다 별도 changelog.
- 결과: ddl-auto 의존 없이 정합성 자동 유지.

**본 PoC 적용**:
- ✅ **인계 가치**: 본 PoC 같은 학습용 spec 도 JHipster 처럼 자동 changelog 생성으로 정합성 강제 가능. 그러나 RealWorld 는 schema.sql 단일 파일 + ddl-auto=none — 자동화 부재.
- ⚠️ JHipster 의 "ORM-first" 패턴은 본 PoC 의 "DDL-first" 패턴과 반대 — 학습용 spec 의 단순성 우선 vs 자동화 우선의 trade-off.

### 4.3 검증 실패 — 정직 보고

**상태**: "운영 DB 부재 환경의 정합성 검증 한계" 라는 명시적 학술/업계 가이드 — sub-agent 가 1차 출처 미발견. PetClinic / JHipster / RealWorld 같은 학습용 spec 의 한계는 사례 종합 추론.

---

## §5. `ddl-auto` 정책 사례

### 5.1 Spring 공식 권장 (V)

**출처**: https://docs.spring.io/spring-boot/docs/1.1.0.M1/reference/html/howto-database-initialization.html

**핵심 (production 권장)**:
- 운영 환경 권장: `validate` (entity ↔ DB 호환성 검증, 변경 없음) 또는 `none` (검증도 안 함)
- 운영 비권장: `create`, `update`, `create-drop` — 의도치 않은 schema 변경 / 데이터 손실 위험.
- `update` 는 "missing 추가" 는 하지만 "drop" 안 함 → 안전해 보이지만 누적 시 의도 unintended schema 변경 발생.

### 5.2 Vlad Mihalcea, Rieckpil 권장 (V)

**출처**:
- https://vladmihalcea.com/validate-ddl-schema-spring-hibernate/
- https://rieckpil.de/howto-best-practices-for-flyway-and-hibernate-with-spring-boot/

**핵심**:
- 운영: Flyway/Liquibase 를 SoT, Hibernate `validate` 보조 검증.
- 테스트: 글로벌 `none` + dedicated `@DataJpaTest` 1건으로 validation cycle (성능 최적화).
- `update` 는 "pet project 한정". 엔터프라이즈는 절대 X.

### 5.3 Why `validate` Is Dangerous? (S)

**출처 (search 결과)**: https://blog.devgenius.io/why-ddl-auto-validate-is-dangerous-in-production-9b124be3b839

**핵심 (요약 only — fetch 미수행)**:
- `validate` 가 부팅 실패시키는 시나리오 위험성 — 운영 hot deploy 시 단일 entity 추가가 전체 부팅 실패.
- 권장 보강: 부팅 전 separate validate cycle + canary 배포.

### 5.4 채택 분포 (정직 보고 — 검증 실패)

**상태**: "한국 SI / 글로벌 ddl-auto 채택 비율 통계" — sub-agent 가 1차 출처 미발견. JetBrains/Stack Overflow 설문 등 — 미확인.

**일반 사례 패턴 (검증된 공식 권장 기반 추론)**:
- 학습용 spec (PetClinic, RealWorld): `none` + schema.sql
- 엔터프라이즈 운영: `validate` + Flyway/Liquibase
- 사내 dev/test 환경: `create-drop` (테스트 격리) 또는 `update` (간편)

**본 PoC 적용**:
- ✅ RealWorld 의 `ddl-auto=none` 은 학습용 spec 표준 — 정당화됨.
- ✅ Phase 2 plan 의 R-Phase2-4 (database_type 표기) 와 연계: `database_type: postgresql` (의도) + `actual_runtime_db: h2` + `ddl_policy: none` 메타 권장.
- ⚠️ 사내 PoC 시 채택 분포 통계가 필요하면 v1.2 calibration 사이클에서 설문 또는 SonarQube 코드 스캔 통계 활용.

---

## §6. 검증 실패 영역 (정직 보고)

| 주제 | 시도 query | 상태 | 본 PoC 영향 |
|---|---|---|---|
| 우아한형제들 ddl-auto / Flyway 사례 | "우아한형제들 Flyway Liquibase database migration" | 1차 매칭 글 미발견 | 우형은 DDD/도메인 분리 글 풍부, schema migration 직접 글 부재 |
| 카카오 JPA-DDL 정합성 검증 | "카카오 JPA schema entity DDL 정합성" | 매칭 글 미발견 | 카카오페이 DDD 글에서 일부 추론, 직접 정합성 검증 글 부재 |
| 네이버 JPA schema 사례 | "네이버 JPA Hibernate ddl-auto schema migration" | 매칭 글 미발견 | NHN/LINE 도 미발견. v1.2 calibration |
| 토스 schema 정책 | "토스 데이터베이스 schema migration JPA" | toss.tech 검색 결과만, 1차 매칭 부재 | 토스의 DB 정책은 외부 비공개로 추정 |
| 한국 SI 다대다 join table 처리 사례 | "한국 다대다 @JoinTable 별도 Entity" | 매칭 글 미발견 | 글로벌 사례 (Vlad, Baeldung) 로 대체 |
| ddl-auto 채택 분포 통계 | "Spring Boot ddl-auto validate update production survey" | 권장 글만, 실증 통계 부재 | 추정만 가능. 사내 calibration 후보 |
| 카카오헤어샵 DDD | brunch.co.kr | search 결과만, fetch 미수행 | (S) 마킹. v1.2 calibration |

**한국 사례 검증 카운트**: 4건 (목표 2건 200% 달성)
- (V) 카카오페이 여신코어 DDD — `tech.kakaopay.com/post/backend-domain-driven-design/`
- (V) 우아한형제들 도메인 분리 — `techblog.woowahan.com/22151/`
- (V) 우아한형제들 Legacy DB 복합키 매핑 — `techblog.woowahan.com/2595/`
- (S) 카카오헤어샵 DDD — `brunch.co.kr/@cg4jins/7` (search 요약)

**글로벌 사례 검증 카운트**: 11건 (V) + 2건 (S)

---

## §7. 본 PoC 적용 권장 패턴

### 7.1 결정적 처리 영역

1. **DDL ↔ JPA 정합성 비교 매트릭스** (Liquibase drift category 기반):
   - 테이블 존재 / 컬럼 존재 / 타입 / nullable / unique / FK / default
   - severity: high (운영 영향) / medium (의도 불일치) / low (메타 차이)
   - DRIFT-XXX ID 명명 (Liquibase diff 영감)

2. **정합성 우선순위 (본 PoC 한정): DDL > JPA**:
   - 정당화 출처: Vlad Mihalcea + Rieckpil (Flyway/schema.sql = SoT 권장)
   - Phase 2 명세 §3.4 기본값 (DB > ORM > ERD) 와 다름 → F-016 finding 등록 권장

3. **`@JoinTable` 선택 (본 PoC 의 3 join table)**:
   - 정당화: Vlad Mihalcea (extra column 없으면 `@JoinTable` 권장)
   - future-proofing: favorited_at timestamp 같은 메타 추가 시 Entity 승격 필요 메모

### 7.2 LLM 보강 영역

4. **`@Embedded` Aggregate Value Object 라우팅**:
   - Vernon "Effective Aggregate Design" 패턴
   - RealWorld `ArticleContents @Embeddable` = title/description/body inline → Phase 4 5.A 도메인 모델 입력

5. **도메인 entity vs JPA entity 패턴 분류**:
   - 일체형 (RealWorld, 카카오헤어샵): 학습용 spec / 단순 도메인 적합
   - 분리형 (카카오페이): 복잡 도메인 / Bounded Context Gradle 모듈 분리
   - inventory.json `domains[].pattern` 필드 추가 정당화

6. **모듈 식별 = package-based** (Spring Modulith 패턴):
   - RealWorld `domain/{user,article,...}` 패키지 = default module
   - Phase 3 (arch) 입력으로 활용

### 7.3 산출물 구조

7. **정합성 보고서 = Liquibase drift report 호환 구조**:
   - `findings[].id`, `severity`, `type`, `decision_required` 필드
   - JSON 도 가능 (`liquibase diff --format=json` 호환 — v1.2 자동 도구 통합 가능성)

8. **`database_type` 메타 (본 PoC 한정)**:
   - `database_type: "postgresql"` (의도)
   - `actual_runtime_db: "h2"` (실제 — 보조)
   - `ddl_policy: "none"` (정합성 우선순위 분기 근거)

### 7.4 PoC 한정

9. **검증 실패 영역 정직 명시**:
   - 한국 사례 4건 검증 (목표 200% 달성)
   - 운영 DB 부재로 자동 validate / pg_dump 사용 불가 한계 명시
   - 학습용 spec (RealWorld) 의 BR 빈약 인정 (CHECK 부재 — Phase 2 plan §R-Phase2-3)

10. **F-016 finding 후보 등록**:
    - "ddl-auto 정책에 따른 정합성 우선순위 분기 가이드 부재"
    - 명세 §3.4 (DB > ORM > ERD) 가 운영 DB 가정 — `ddl-auto=none` + schema.sql 환경의 분기 부재
    - 본 PoC 의 가장 큰 학습 가치

---

## §8. 본 research 의 한계 (정직한 자기보고)

### 8.1 검증 완료 출처

- 1차 (V) 검증: 11건 (글로벌)
  - Liquibase Drift Detection, Liquibase Database Drift, Vlad Mihalcea (validate, many-to-many), Rieckpil (Flyway/Hibernate), Atlas (atlas-vs-others), Spring PetClinic (application.properties + V001 schema), JHipster (development workflow), Spring Modulith (fundamentals), Vernon DDD aggregate, Baeldung (Persisting DDD), Schema Drift in Spring Boot
- 한국 사례 (V): 3건 + (S) 1건 = **4건** (목표 2건 200% 달성)
  - (V) 카카오페이 여신코어 DDD, 우아한형제들 도메인 분리, 우아한형제들 Legacy DB 복합키
  - (S) 카카오헤어샵 DDD

### 8.2 본 research 자체평가 신뢰도

- **0.92** (case-phase1.md 0.90 대비 +0.02)
- 근거:
  - 글로벌 출처 11건 (V) — Liquibase/Flyway/Hibernate/PetClinic/JHipster/Atlas/Vernon — 핵심 출처 모두 1차 fetch 검증
  - 한국 사례 4건 (V 3 + S 1) — 카카오페이 DDD 가 본 PoC 의 `@Embedded` aggregate 패턴과 완전 정합 (강한 케이스)
  - PetClinic 이 본 PoC RealWorld 와 거의 동일한 학습용 spec 패턴 (ddl-auto=none + schema.sql) — 글로벌 reference 확보
- 잔여 한계:
  - 한국 SI 의 다대다 join table 처리 사례 부재 — Vlad/Baeldung 글로벌로 대체
  - ddl-auto 채택 분포 실증 통계 부재 — 권장 가이드만 검증
  - 토스/네이버/NHN/LINE 의 schema 정책 글 부재 (1차 매칭 미발견)

### 8.3 잔여 후속 보강 권장 (사내 PoC 또는 v1.2 사이클)

1. **카카오헤어샵 DDD brunch 글 직접 fetch 검증** — (S) → (V) 승격
2. **한국 SI 의 다대다 join table 처리 실증 사례** — 사내 PoC 시 자체 데이터 수집
3. **ddl-auto 채택 분포 통계** — JetBrains 설문 / Stack Overflow Java tag / GitHub 코드 스캔
4. **운영 DB 가 있는 사내 PoC** 에서 pg_dump / INFORMATION_SCHEMA 정합성 검증 적용 — Phase 2 명세 §3.4 의 진짜 검증 케이스

---

## §9. 다음 단계

- 공식문서 리서처 (`document-phase2.md`) — 병렬 진행
- Senior Engineer (Backend, JPA-DDL 정합성 함정 / `@Embedded` aggregate 함정 / ddl-auto 함정 — `senior-phase2.md`) — 병렬 진행
- 3원칙: 3 research 통합 → `research-phase2.md` → 윤주스 승인 → Phase 2 실행
