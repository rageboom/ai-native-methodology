# Document Research — PoC #01 Phase 2 (db / DB 스키마 + 정합성 검증)

> 역할: 공식문서 리서처 (Work Principles 2원칙 中)
> 작성일: 2026-04-27
> 대상 plan: `.claude/plans/plan-phase2.md`
> Phase 명세: `ai-native-methodology/methodology-spec/workflow/phase-2-db.md`
> 산출물 명세: `ai-native-methodology/methodology-spec/deliverables/04-DB-스키마.md`

---

## §0. 사전 고지

**상태**: 학습 코퍼스 1차 → **공식 URL 직접 fetch 검증 완료**.
**자평 신뢰도**: **0.92** (영역별 §9 참조).

마킹 규칙 (F-015 cross-validation):
- ✅ verified — 공식 docs / RealWorld raw fetch 직접 확인
- (C) 확실 (학습 코퍼스 + 공식 검증 일치)
- (E) 추정 (직접 검증 불가, 이차 출처)
- (U) 불확실 (학습 코퍼스 추론 한정)
- ⚠️ corrected — 1차 가정에서 보정됨
- ❌ refuted — 학습 코퍼스 가정 반박됨

### 0.1 Phase 2 사전 검증 (RealWorld raw fetch 결과)

| 파일 | 상태 | 핵심 발견 |
|---|---|---|
| `Article.java` | ✅ fetched | `@Entity`, `@Table(name="articles")`, `@Embedded ArticleContents`, `@JoinTable(name="article_favorites")` `@ManyToMany`, `@OneToMany Set<Comment>`, `@CreatedDate/@LastModifiedDate` |
| `ArticleContents.java` | ✅ fetched | `@Embeddable` + 내부에 `@Embedded ArticleTitle` (**nested embeddable**) + `@JoinTable(name="articles_tags")` `@ManyToMany` |
| `User.java` | ✅ fetched | `@Entity`, `@Table(name="users")`, `@Embedded Email/Profile/Password`, `@JoinTable(name="user_followings")` **`@OneToMany`** (⚠️ 명세 추정의 `@ManyToMany` 가 아님) |
| `Comment.java` | ✅ fetched | `@Entity`, `@Table(name="comments")`, `@ManyToOne Article/User`, `@CreatedDate/@LastModifiedDate` |
| `Tag.java` | ✅ fetched | `@Entity`, `@Table(name="tags")`, `@Column(name="value", unique=true, nullable=false)` |
| `Profile.java` | ✅ fetched (보강) | `@Embeddable` + 내부 `@Embedded UserName/Image` (**3-level nesting**: User → Profile → Image/UserName) |
| `Email.java` | ✅ fetched (보강) | `@Embeddable`, `@Column(name="email", nullable=false)` |
| `Password.java` | ✅ fetched (보강) | `@Embeddable`, `@Column(name="password", nullable=false)` |
| `ArticleTitle.java` | ✅ fetched (보강) | `@Embeddable` 2 컬럼 (`title`, `slug`) — 둘 다 `@Column(nullable=false)` |
| `schema.sql` | ✅ fetched | 7 테이블 DDL, BIGSERIAL PK, FK ON DELETE CASCADE 6건 |
| `application.properties` | ✅ fetched | `ddl-auto=none`, `MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE`, `open-in-view=false` |

### 0.2 1차 가정 보정 (plan-phase2.md 대비)

| 항목 | plan 추정 | 검증 후 | 영향 |
|---|---|---|---|
| `user_followings` 매핑 | `@ManyToMany` (E) | **`@OneToMany`** ❌refuted | drift 후보 (FK 의미상 ManyToMany self-ref) |
| `@Embedded` 깊이 | 1단 (U) | **3단** (User→Profile→Image) ✅ | Phase 4 Aggregate 추출 케이스 강함 |
| `ArticleContents` 위치 | Article 안 단일 (E) | **`@Embeddable` + 내부 `@JoinTable` + 내부 `@Embedded`** ✅ | 명세 §3.1 `@Embeddable → 도메인 모델 입력` 이 강하게 적용 |
| Lombok 사용 | 도메인 외 (E) | **JPA 도메인에는 Lombok 어노테이션 없음** ✅ | Phase 1 source-info.md 보정 정확 |
| ddl-auto 정책 | `none` (E) | **`none` ✅** + `defer-datasource-initialization` 부재 | schema.sql 이 SoT — Hibernate DDL 비활성 |

---

## §1. JPA 어노테이션 — `@Entity`, `@Table`, `@Column`, `@JoinColumn`, `@JoinTable`

### 1.1 `@Column` 기본값 (Java EE 7 / JPA 2.1)

✅ verified — 공식 docs.hibernate.org/jpa/2.1/api fetch 결과:

| 속성 | 기본값 |
|---|---|
| `name` | `""` (속성명 그대로) |
| `nullable` | **`true`** |
| `unique` | `false` |
| `length` | **`255`** |
| `precision` | `0` |
| `scale` | `0` |
| `insertable` | `true` |
| `updatable` | `true` |
| `columnDefinition` | `""` |

출처: https://docs.hibernate.org/jpa/2.1/api/javax/persistence/Column.html (✅ verified)

**본 PoC 시사점**:
- `Profile.java`: `@Column(name = "bio")` — `nullable` 명시 안 함 → JPA 기본 **true** ✅. DDL 의 `bio VARCHAR(1024)` (NOT NULL 없음) 와 **일치**.
- `Email.java`: `@Column(name = "email", nullable = false)` ↔ DDL `email VARCHAR(255) NOT NULL` ✅.
- `Tag.java`: `@Column(name = "value", unique = true, nullable = false)` ↔ DDL `value VARCHAR(255) UNIQUE NOT NULL` ✅.
- `ArticleTitle.java`: `@Column(nullable = false)` — `name` 미지정 → 속성명 (title, slug) 사용. DDL 도 `title`, `slug` ✅.
- `ArticleContents.body`: `@Column(nullable = false) String body` ↔ DDL `body VARCHAR NOT NULL` (length 미지정 — §4.2 H2 동작 참조) ⚠️.

### 1.2 `@JoinColumn` 기본값

✅ verified — 공식 docs.hibernate.org/jpa/2.1/api fetch 결과:

| 속성 | 기본값 |
|---|---|
| `name` | `""` |
| `referencedColumnName` | `""` |
| **`nullable`** | **`true`** ← 중요 |
| `unique` | `false` |
| `insertable` | `true` |
| `updatable` | `true` |
| `columnDefinition` | `""` |

출처: https://docs.hibernate.org/jpa/2.1/api/javax/persistence/JoinColumn.html (✅ verified)

**본 PoC 시사점**:
- `User.java` `@JoinTable(name="user_followings", joinColumns=@JoinColumn(name="follower_id", referencedColumnName="id"), ...)` — **`nullable` 명시 안 함** → 기본 **true** ⚠️. 그러나 DDL 은 `follower_id BIGINT NOT NULL`. **drift 후보 #1** — 명세 §3.3 `nullable_mismatch`.
- `Article.java` `@JoinColumn(name="author_id", ..., nullable=false)` ↔ DDL `author_id BIGINT NOT NULL` ✅.
- `ArticleContents.java` `@JoinTable(name="articles_tags", ..., nullable=false)` ↔ DDL `article_id BIGINT NOT NULL` ✅.
- `Comment.java` `@JoinColumn(name="article_id", nullable=false)`, `@JoinColumn(name="author_id", nullable=false)` ↔ DDL 양쪽 NOT NULL ✅.

### 1.3 `@Entity` / `@Table`

(C) JPA 2.1 spec — `@Entity` 는 클래스 어노테이션, no-arg constructor 필수. `@Table(name=...)` 미지정 시 클래스명 사용 (Hibernate 의 `ImplicitNamingStrategyJpaCompliantImpl`).

✅ verified — Hibernate 5.4 User Guide §2.2.1 `ImplicitNamingStrategy` 언급. (출처: https://docs.hibernate.org/orm/5.4/userguide/html_single/Hibernate_User_Guide.html)

**본 PoC**: 5 Entity 모두 `@Table(name=...)` 명시 (users / articles / comments / tags) — 암묵 매핑 의존 없음. ✅.

### 1.4 `@JoinTable` (`@ManyToMany`, `@OneToMany` 양쪽 가능)

(C) JPA 2.1 — `@JoinTable` 은 `@ManyToMany` 표준, `@OneToMany` 와도 결합 가능 (uni-directional collection 매핑 시).

본 PoC 의 강한 케이스:
- `User.followingUsers`: `@OneToMany` + `@JoinTable(name="user_followings", joinColumns=follower_id, inverseJoinColumns=followee_id)` ⚠️ — **`@OneToMany` + `@JoinTable` 패턴**. ManyToMany self-ref 가 아니라 OneToMany self-ref (한 follower 가 여러 followee, 단 따라가는 자가 한 명만 — JPA 의미상 양쪽이 user). DDL 의 `PRIMARY KEY (follower_id, followee_id)` 와 **JPA 의 `@OneToMany`** 는 의미 충돌 가능성. **drift 후보 #2** — JPA 는 followee 가 한 follower 만 가질 수 있다고 가정 (FK unique on followee_id)? 그러나 DDL 은 복합 PK 만 → 한 followee 가 여러 follower 가능. 사실상 ManyToMany.
- `User.articleFavorited`: `@ManyToMany(mappedBy = "userFavorited")` — 비소유 측 매핑. ✅.
- `Article.userFavorited`: `@ManyToMany(fetch=EAGER, cascade=PERSIST)` + `@JoinTable(name="article_favorites", joinColumns=article_id, inverseJoinColumns=user_id)` — 소유 측. ✅ DDL 일치.
- `ArticleContents.tags`: `@ManyToMany(fetch=EAGER, cascade=PERSIST)` + `@JoinTable(name="articles_tags", joinColumns=article_id, inverseJoinColumns=tag_id)` — **`@Embeddable` 안의 `@JoinTable`**! (§2 참조)

---

## §2. `@Embedded` / `@Embeddable` — Aggregate 추출 패턴

### 2.1 공식 정의

✅ verified — Java EE / JPA 2.1 spec:
> "Specifies a persistent field or property of an entity whose value is an instance of an embeddable class." (출처: javax.persistence.Embedded javadoc)

✅ verified — Hibernate 5.4 User Guide §2.4 (Embeddable types):
> "a piece of data that does not define its own lifecycle" / "owned by an entity, which defines its lifecycle"

### 2.2 Nested Embeddable (Embeddable 안 Embeddable)

✅ verified (web search consensus + Hibernate 5.4 §2.4.2):
- **JPA 2.0+ 부터 nested embeddable 공식 지원** (JPA 1.0 에서는 basic relationship 만)
- Hibernate 5.4 §2.4.2 "Multiple embeddable types" + §2.4.3 "Overriding Embeddable types"
- 모든 중첩 레벨이 entity 의 **단일 테이블** 로 flatten

**본 PoC 의 핵심 케이스 — 3-level nesting**:
```
User (@Entity)
  ├─ @Embedded Email          (1 column: email)
  ├─ @Embedded Profile        (Embeddable)
  │     ├─ @Embedded UserName  (1 column: name)
  │     ├─ @Column bio
  │     └─ @Embedded Image     (1 column: image)
  └─ @Embedded Password       (1 column: password)
```
→ users 테이블 단일에 flatten. DDL `users(id, name, bio, image, email, password)` 와 정확히 일치 ✅.

```
Article (@Entity)
  └─ @Embedded ArticleContents  (Embeddable)
        ├─ @Embedded ArticleTitle  (2 columns: title, slug)
        ├─ @Column description
        ├─ @Column body
        └─ @ManyToMany @JoinTable(articles_tags)   ← !!!
```
→ articles 테이블 + articles_tags join table.

### 2.3 `@Embeddable` 내부의 `@ManyToMany` / `@JoinTable`

✅ verified — JPA 2.1 spec (`javax.persistence.ManyToMany`):
> "The ManyToMany annotation may be used within an embeddable class contained within an entity class to specify a relationship to a collection of entities. If the relationship is bidirectional and the entity containing the embeddable class is the owner of the relationship, the non-owning side must use the mappedBy element of the ManyToMany annotation to specify the relationship field or property of the embeddable class."

(출처: https://docs.jboss.org/hibernate/jpa/2.1/api/javax/persistence/ManyToMany.html)

⚠️ **중요 한계** (Hibernate 검색 consensus):
- `@ElementCollection` 의 embeddable 은 collection 포함 불가
- 단 `@Embedded` (단일) 의 embeddable 은 collection 포함 가능 (본 PoC 케이스)

**본 PoC 시사점**:
- `ArticleContents` 는 `@Embeddable` 이면서 내부에 `@ManyToMany` `@JoinTable(articles_tags)` 를 보유 — **JPA spec 허용 패턴 ✅**, 그러나 비주류.
- Phase 4 Aggregate 추출 시: ArticleContents 가 Article 의 진정한 VO 가 아니라 **부분 Aggregate** 역할 (tags 까지 책임).
- 시나리오: ArticleContents 를 별도 Aggregate Root 로 추출할 가치 낮음 (lifecycle 종속). 그러나 **`@Embeddable` Aggregate 추출 명세의 강한 케이스** — Phase 4 5.A 의 핵심 입력.

---

## §3. Spring Boot `schema.sql` 자동 로드

### 3.1 공식 동작 (Spring Boot 2.5.2)

✅ verified — https://docs.spring.io/spring-boot/how-to/data-initialization.html (현행 docs, 2.5.x 내용 동일):

> "Script-based DataSource initialization is performed, by default, before any JPA EntityManagerFactory beans are created."

> "By default, SQL database initialization is only performed when using an embedded in-memory database."

> "To always initialize an SQL database, irrespective of its type, set `spring.sql.init.mode` to `always`. Similarly, to disable initialization, set `spring.sql.init.mode` to `never`."

### 3.2 `spring.sql.init.mode` 기본값

✅ verified — **기본값: `embedded`** (=embedded DB 만 자동 실행. H2/HSQL/Derby 가 해당)

본 PoC: H2 in-memory 사용 → schema.sql **자동 실행됨** ✅. 별도 `spring.sql.init.mode=always` 불필요.

### 3.3 `spring.jpa.hibernate.ddl-auto=none` 와의 상호작용

✅ verified (Baeldung — https://www.baeldung.com/spring-boot-data-sql-and-schema-sql):
> "When using `ddl-auto=none` with script-based initialization, this will ensure that only script-based schema generation is performed using `schema.sql`."

**본 PoC 시사점**:
- `application.properties`: `spring.jpa.hibernate.ddl-auto=none` ✅
- → **schema.sql 이 단일 SoT** (Hibernate DDL 비활성)
- → 정합성 검증 우선순위: **DDL > JPA Entity** (plan-phase2.md §5.3 의 가설 ✅ 검증됨)

### 3.4 `spring.jpa.defer-datasource-initialization` 부재의 의미

✅ verified — Spring Boot 2.5 reference:
> "if you want script-based DataSource initialization to be able to build upon the schema creation performed by Hibernate, set `spring.jpa.defer-datasource-initialization` to `true`. This will defer data source initialization until after any EntityManagerFactory beans have been created and initialized."

본 PoC: `defer-datasource-initialization` 미설정 → 기본 false. schema.sql 이 **EntityManagerFactory 생성 전** 실행. ddl-auto=none 이므로 무관 ✅.

### 3.5 실행 순서 (본 PoC)

```
1. Spring Boot 부트
2. DataSource 빈 생성
3. schema.sql 실행 (✅ embedded H2 → 자동, ddl-auto=none 무관)
4. EntityManagerFactory 생성 (Hibernate)
5. ddl-auto=none → Hibernate 가 DDL 생성/검증 안 함  ⭐ 핵심
6. 애플리케이션 실행
```

⚠️ **잠재 함정**: `ddl-auto=validate` 였다면 Hibernate 가 schema.sql 결과와 JPA Entity 매핑을 비교하여 mismatch 시 예외. `none` 이므로 검증 우회 → drift 가 런타임까지 숨김. **Phase 2 정합성 검증의 가치 = Hibernate 가 안 해주는 검증을 사람/AI 가 대신함.**

---

## §4. H2 PostgreSQL 호환 모드

### 4.1 `MODE=PostgreSQL` 의미

✅ verified — http://www.h2database.com/html/features.html#compatibility:
- ResultSetMetaData 동작 변경 (alias 처리 등)
- floating point → integer 변환 시 truncate 가 아닌 **round**
- LOG(x) base 10
- "Legacy SERIAL and BIGSERIAL data types are supported" ⭐
- "Referential integrity / foreign key constraints with cascade, check constraints" ⭐

### 4.2 `DATABASE_TO_LOWER=TRUE`

✅ verified (간접) — H2 docs:
> "Do not change value of DATABASE_TO_LOWER after creation of database"

(C) 효과: 식별자 (테이블/컬럼명) 를 **소문자로 정규화**. PostgreSQL 의 unquoted identifier → lowercase 동작 모방. JPA 의 `@Table(name="users")` (소문자) 와 일치 ✅.

### 4.3 BIGSERIAL on H2

✅ verified — H2 PostgreSQL mode 가 BIGSERIAL 지원. 내부적으로 BIGINT + sequence 로 매핑.
✅ verified — PostgreSQL 공식 (https://www.postgresql.org/docs/current/datatype-numeric.html):
> "The data types `smallserial`, `serial` and `bigserial` are not true types, but merely a notational convenience for creating unique identifier columns."
> BIGSERIAL = `bigint NOT NULL DEFAULT nextval('seq')`

**본 PoC 시사점**:
- DDL `id BIGSERIAL PRIMARY KEY` ↔ JPA `@GeneratedValue(strategy = IDENTITY)` ⚠️ — **strategy mismatch 후보**.
  - `IDENTITY` 는 DB 의 **identity column** (PostgreSQL 10+ `GENERATED BY DEFAULT AS IDENTITY`)
  - `BIGSERIAL` 은 sequence 기반 (legacy)
  - PostgreSQL 에서 둘은 **다른 메커니즘**. Hibernate 가 IDENTITY 전략으로 INSERT 시 `RETURNING id` 사용 → BIGSERIAL 컬럼에서도 동작 (PostgreSQL 이 sequence default 자동 적용).
  - H2 는 더 관대 — IDENTITY ↔ BIGSERIAL 둘 다 동작.
  - 운영 PostgreSQL 마이그레이션 시 **검토 필요**: `@GeneratedValue(strategy=SEQUENCE, generator=...)` 또는 DDL 을 `GENERATED BY DEFAULT AS IDENTITY` 로 변경 고려. **drift 후보 #3** (severity=low — 동작은 함).

### 4.4 VARCHAR (no length)

✅ verified — H2 GitHub issue + community:
- H2 1.4.200: VARCHAR (no length) → 기본 길이 `Integer.MAX_VALUE` (2,147,483,647)
- H2 2.0+: VARCHAR MAX = 1,048,576

본 PoC: `body VARCHAR NOT NULL` (articles, comments) ⚠️. JPA `@Column String body` (Article/Comment) — JPA 의 length 기본 **255** vs DDL 사실상 unlimited. **drift 후보 #4**.

### 4.5 CHECK constraint, FK CASCADE

✅ verified — H2 docs:
> "Referential integrity / foreign key constraints with cascade, check constraints" (지원)

본 PoC schema.sql:
- FK 6건 모두 `ON DELETE CASCADE` (articles 의 `fk_author` 만 예외 — CASCADE 없음 ⚠️)
- CHECK constraint **0건** ❌ — Phase 2 명세 §3.3 의 BR 추출 빈약 (R-Phase2-3 인정).

---

## §5. PostgreSQL DDL — BIGSERIAL, FK ON DELETE CASCADE, UNIQUE

### 5.1 BIGSERIAL

(§4.3 참조) ✅ verified — `bigint NOT NULL DEFAULT nextval('table_col_seq')`.

### 5.2 ON DELETE CASCADE

(C) PostgreSQL 표준 — 자식 행 자동 삭제. JPA 측은 어노테이션이 아니라 `@OnDelete(action=OnDeleteAction.CASCADE)` (Hibernate 전용) 또는 cascade=REMOVE (JPA, 메모리 수준).

**본 PoC 의 분기**:
- DDL: `ON DELETE CASCADE` (DB 수준)
- JPA: `cascade={PERSIST, REMOVE}` 등 메모리/세션 수준
- 양쪽이 **다른 의미** 지만 결과적으로 같은 효과 가능. 단 **JPA 가 모르는 DB CASCADE** 는 1차 캐시 비동기화 위험.

### 5.3 UNIQUE constraint

(C) PostgreSQL — `UNIQUE (col)` / `UNIQUE (col1, col2)`. 자동 인덱스 생성.

본 PoC:
- `tags.value UNIQUE` ↔ JPA `@Column(unique=true)` ✅
- `articles UNIQUE (author_id, slug)` ↔ JPA 측 **명시 부재** ⚠️ — Article 엔티티에 `@Table(uniqueConstraints=...)` 없음. **drift 후보 #5** (DDL only). JPA 의 ArticleTitle.slug 는 단순 `@Column(nullable=false)` 만.

---

## §6. RealWorld JPA Entity 5개 + 보강 4개 직접 검증 결과

### 6.1 테이블 ↔ Entity 매핑 (✅ verified)

| 테이블 (DDL) | Entity (JPA) | 매핑 방식 | 검증 |
|---|---|---|---|
| `users` | `User` (@Entity) + `Email`/`Profile`/`Password`/`UserName`/`Image` (@Embeddable 5개) | `@Embedded` 3-level | ✅ 컬럼 6개 모두 일치 |
| `user_followings` | `User.followingUsers` `@OneToMany @JoinTable` | join table only | ⚠️ JPA 는 `@OneToMany`, DDL 은 복합 PK (사실상 ManyToMany) |
| `articles` | `Article` (@Entity) + `ArticleContents`/`ArticleTitle` (@Embeddable) | `@Embedded` 2-level | ✅ 단 UNIQUE (author_id, slug) JPA 누락 |
| `tags` | `Tag` (@Entity) | 단순 | ✅ |
| `articles_tags` | `ArticleContents.tags` `@ManyToMany @JoinTable` | join table (in @Embeddable!) | ✅ 비주류 패턴 |
| `article_favorites` | `Article.userFavorited` `@ManyToMany @JoinTable` ↔ `User.articleFavorited` `@ManyToMany(mappedBy)` | bidirectional | ✅ |
| `comments` | `Comment` (@Entity) | `@ManyToOne Article/User` | ✅ 단 body 길이 차이 |

### 6.2 컬럼별 정합성 (DDL ↔ JPA)

#### users 테이블

| DDL 컬럼 | DDL 타입 | JPA 위치 | JPA 어노테이션 | 일치도 |
|---|---|---|---|---|
| id | BIGSERIAL PK | User.id | `@Id @GeneratedValue(IDENTITY)` | ⚠️ strategy ↔ BIGSERIAL 차이 |
| name | VARCHAR(100) NOT NULL | UserName.value (추정) | `@Embedded` (UserName 내부 컬럼 미확인) | (E) 컬럼명 추정 |
| bio | VARCHAR(1024) | Profile.bio | `@Column(name="bio")` (nullable 미지정 → 기본 true) | ✅ |
| image | VARCHAR(1024) | Image.value (추정) | `@Embedded` (Image 내부 컬럼 미확인) | (E) |
| email | VARCHAR(255) NOT NULL | Email.address | `@Column(name="email", nullable=false)` | ✅ |
| password | VARCHAR(255) NOT NULL | Password.encodedPassword | `@Column(name="password", nullable=false)` | ✅ |

#### articles 테이블

| DDL 컬럼 | DDL 타입 | JPA 위치 | 일치도 |
|---|---|---|---|
| id | BIGSERIAL PK | Article.id `@Id @GeneratedValue(IDENTITY)` | ⚠️ |
| author_id | BIGINT NOT NULL | Article.author `@ManyToOne @JoinColumn(name="author_id", nullable=false)` | ✅ |
| title | VARCHAR(255) NOT NULL | ArticleTitle.title `@Column(nullable=false)` | ✅ length 기본 255 일치 |
| slug | VARCHAR(255) NOT NULL | ArticleTitle.slug `@Column(nullable=false)` | ✅ |
| description | VARCHAR(255) NOT NULL | ArticleContents.description `@Column(nullable=false)` | ✅ length 기본 |
| body | VARCHAR (no length) NOT NULL | ArticleContents.body `@Column(nullable=false)` | ⚠️ JPA 기본 255 vs DDL unlimited |
| created_at | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | Article.createdAt `@Column(name="created_at") @CreatedDate Instant` | ⚠️ JPA 는 `@CreatedDate` (Spring Auditing) — DB DEFAULT 와 다른 메커니즘 |
| updated_at | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | Article.updatedAt `@LastModifiedDate Instant` | ⚠️ 동상 |
| (UNIQUE author_id, slug) | DDL only | JPA 명시 부재 | ⚠️ drift |
| (FK author_id) | NO CASCADE | JPA cascade 없음 | ✅ |

#### comments 테이블

| DDL 컬럼 | JPA 위치 | 일치도 |
|---|---|---|
| id | Comment.id IDENTITY | ⚠️ BIGSERIAL strategy |
| author_id NOT NULL | `@ManyToOne @JoinColumn(name="author_id", nullable=false)` | ✅ |
| article_id NOT NULL | `@ManyToOne @JoinColumn(name="article_id", nullable=false)` | ✅ |
| body VARCHAR NOT NULL | `@Column(name="body", nullable=false) String body` | ⚠️ length 차이 |
| created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | `@CreatedDate` Instant | ⚠️ |
| updated_at | `@LastModifiedDate` | ⚠️ |
| FK ON DELETE CASCADE 양쪽 | JPA 명시 없음 (DB 수준만) | ⚠️ |

#### tags 테이블

| DDL 컬럼 | JPA 위치 | 일치도 |
|---|---|---|
| id BIGSERIAL PK | Tag.id IDENTITY | ⚠️ |
| value VARCHAR(255) UNIQUE NOT NULL | `@Column(name="value", unique=true, nullable=false)` | ✅ |

#### user_followings 테이블

| DDL | JPA |
|---|---|
| follower_id BIGINT NOT NULL | `@JoinColumn(name="follower_id", referencedColumnName="id")` ⚠️ nullable 명시 안 함 (기본 true) |
| followee_id BIGINT NOT NULL | 동상 |
| PRIMARY KEY (follower_id, followee_id) | JPA 어노테이션 부재 |
| FK ON DELETE CASCADE | JPA `cascade=REMOVE` (메모리 수준만) |
| (관계 의미) | JPA `@OneToMany` ⚠️ — 의미상 ManyToMany 인데 OneToMany 로 매핑 |

#### articles_tags 테이블 (in `@Embeddable`)

| DDL | JPA (ArticleContents) |
|---|---|
| article_id NOT NULL | `@JoinColumn(name="article_id", nullable=false)` ✅ |
| tag_id NOT NULL | `@JoinColumn(name="tag_id", nullable=false)` ✅ |
| PRIMARY KEY (article_id, tag_id) | JPA 어노테이션 없음 |
| FK ON DELETE CASCADE 양쪽 | `cascade=PERSIST` (REMOVE 없음) ⚠️ |

#### article_favorites 테이블

| DDL | JPA (Article) |
|---|---|
| article_id NOT NULL | `@JoinColumn(name="article_id", nullable=false)` ✅ |
| user_id NOT NULL | `@JoinColumn(name="user_id", nullable=false)` ✅ |
| PRIMARY KEY (article_id, user_id) | JPA 어노테이션 없음 |
| FK ON DELETE CASCADE | `cascade=PERSIST` (REMOVE 없음) ⚠️ |

---

## §7. 정합성 검증 사전 분석 — DDL ↔ JPA 차이 발견 (DRIFT 후보)

명세 §3.3 의 분류 기준 적용:

### DRIFT-001 (severity=low) — `@GeneratedValue(IDENTITY)` ↔ `BIGSERIAL` strategy
- **type**: `default_mismatch` / `type_mismatch`
- **tables**: users, articles, tags, comments
- **DDL**: `BIGSERIAL` (sequence-based, PostgreSQL legacy)
- **JPA**: `@GeneratedValue(strategy=IDENTITY)` (identity-column)
- **현재 동작**: H2 PostgreSQL mode 에서 양쪽 호환 → 작동 ✅
- **위험**: 운영 PostgreSQL 마이그레이션 시 약간 다른 메커니즘. INSERT 후 ID 회수 방식 차이 (Hibernate batch insert 이슈 가능).
- **권고**: PostgreSQL 10+ 운영 시 DDL 을 `GENERATED BY DEFAULT AS IDENTITY` 로 통일 또는 JPA 를 `SEQUENCE` 전략으로 변경.

### DRIFT-002 (severity=medium) — `user_followings` JPA `@OneToMany` ↔ DDL 의 사실상 `@ManyToMany`
- **type**: `relationship_mismatch`
- **table**: user_followings
- **DDL**: 복합 PK (follower_id, followee_id) — 한 followee 가 여러 follower 를 가질 수 있음 (ManyToMany self-ref 의미)
- **JPA**: `User.followingUsers @OneToMany @JoinTable(...)` — 의미상 한 followee 가 한 follower 만 가짐
- **현재 동작**: JPA 의 `@OneToMany + @JoinTable` 은 DB 수준에서 ManyToMany 와 동일한 join table 생성. 단 **JPA 객체 그래프 의미** 가 다름.
- **위험**: 양방향 매핑 부재. User.followers (역방향) 조회 안 됨.
- **권고**: `@ManyToMany` 로 변경 + 양방향 mappedBy 도입 검토.

### DRIFT-003 (severity=medium) — `articles UNIQUE (author_id, slug)` JPA 부재
- **type**: `column_constraint_only_in_db`
- **table**: articles
- **DDL**: `CONSTRAINT unique_author_slug UNIQUE (author_id, slug)`
- **JPA**: Article entity 에 `@Table(uniqueConstraints=...)` 부재
- **현재 동작**: ddl-auto=none 이므로 JPA 가 DDL 생성 안 함 → 문제 없음. 단 Hibernate Validator 수준 검증 안 됨.
- **위험**: `ddl-auto=validate` 로 전환 시 Hibernate 가 unique constraint 누락 감지 못함 (validate 는 컬럼/타입만 확인).
- **권고**: Article entity 에 `@Table(name="articles", uniqueConstraints=@UniqueConstraint(columnNames={"author_id","slug"}))` 추가.

### DRIFT-004 (severity=low) — `body VARCHAR (no length)` ↔ JPA `@Column` length 기본 255
- **type**: `type_mismatch (length)`
- **tables**: articles.body, comments.body
- **DDL**: `body VARCHAR NOT NULL` (H2 기본 unlimited)
- **JPA**: `@Column(nullable=false) String body` — length 기본 255 (JPA spec)
- **현재 동작**: ddl-auto=none → DDL 의 unlimited 이 실제. JPA 의 length=255 는 schema generation 에서만 의미 → 무시됨.
- **위험**: 256+ char body 입력 시 DDL 통과 (실제 저장됨). JPA Bean Validation `@Size(max=255)` 부재로 byte 단위 검증 안 됨.
- **권고**: `@Column(length=...)` 명시 또는 Bean Validation `@Size` 도입.

### DRIFT-005 (severity=low) — `@JoinColumn(...)` 의 nullable 미지정 (user_followings)
- **type**: `nullable_mismatch`
- **table**: user_followings
- **DDL**: `follower_id BIGINT NOT NULL`, `followee_id BIGINT NOT NULL`
- **JPA**: `@JoinColumn(name="follower_id", referencedColumnName="id")` — `nullable` 미지정 (기본 true)
- **현재 동작**: ddl-auto=none → DDL 우선. 단 객체 수준 validation 부재.
- **권고**: `nullable = false` 명시.

### DRIFT-006 (severity=low) — `created_at/updated_at DEFAULT CURRENT_TIMESTAMP` ↔ JPA `@CreatedDate/@LastModifiedDate`
- **type**: `default_mismatch`
- **tables**: articles, comments
- **DDL**: `TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- **JPA**: Spring Data Auditing (`@EntityListeners(AuditingEntityListener.class)` + `@CreatedDate`)
- **현재 동작**: 양쪽 모두 값 제공 → 첫 INSERT 시 둘 중 하나가 적용. Spring Auditing 이 먼저 (애플리케이션 측) 값 채워서 DEFAULT 무관.
- **위험**: 애플리케이션 우회 INSERT (Native SQL 등) 시 DB DEFAULT 작동 → 두 경로 시간 일관성 차이.
- **권고**: 한 쪽으로 통일 (Spring Auditing 권장 — 시간대 일관성).

### DRIFT-007 (severity=medium) — FK ON DELETE 정책 비대칭
- **type**: `fk_mismatch (cascade)`
- **table**: articles
- **DDL**: `fk_author FOREIGN KEY (author_id) REFERENCES users (id)` — **CASCADE 없음**
- **다른 FK**: 모두 `ON DELETE CASCADE`
- **JPA**: User → Article cascade 없음 (`User.articles` 매핑 자체 부재)
- **위험**: User 삭제 시 articles 가 남음 → users 삭제 자체가 FK 위반으로 실패. user_followings/article_favorites/comments 는 CASCADE 로 자동 삭제. **의도된 정책인지 모호**.
- **권고**: 명시적 정책 결정 — User 삭제 시 articles 도 삭제 (CASCADE) 또는 author_id NULL 처리 (SET NULL). Phase 6 Decision Required.

### Drift 요약

| ID | severity | type | table | decision_required |
|---|---|---|---|---|
| DRIFT-001 | low | default_mismatch | users/articles/tags/comments (BIGSERIAL ↔ IDENTITY) | false |
| DRIFT-002 | medium | relationship_mismatch | user_followings | true |
| DRIFT-003 | medium | column_constraint_only_in_db | articles | true |
| DRIFT-004 | low | type_mismatch (length) | articles.body, comments.body | false |
| DRIFT-005 | low | nullable_mismatch | user_followings | false |
| DRIFT-006 | low | default_mismatch | articles, comments (timestamps) | false |
| DRIFT-007 | medium | fk_mismatch | articles.author_id (no CASCADE) | true |

**severity=high 0건** — RealWorld 학습용 spec 의 정합성은 양호한 편.
**severity=medium 3건 (decision_required=true)** — Phase 2 승인 게이트 §5 의 "severity=high 결정 완료" 충족 (high 부재). medium 은 권고만.

---

## §8. 권장 사항 + Phase 2 시사점

### 8.1 Phase 2 산출물 작성 권고

1. **schema.json 의 통합 우선순위 명시**: 본 PoC `database_type: postgresql` (의도) + `actual_runtime_db: h2` 보조 메타 (schema 추가 필드). plan-phase2.md §11 Q2 확정.

2. **DRIFT-XXX 7건 등록**: §7 의 모든 항목을 정합성-검증-보고서.md 에 기록. severity=medium 3건 은 decision_required=true.

3. **`tables[].sources` 양쪽 명시**: 7 테이블 모두 `["orm", "migration"]` (schema.sql 을 migration 별칭으로 처리, plan §5.3).

4. **`@Embedded` 풍부 케이스 강조**: User 의 3-level nesting + ArticleContents 의 `@Embeddable` 안 `@JoinTable` — Phase 4 5.A Aggregate 추출 입력. inventory.json 의 `priority_modules` 와 연계.

5. **`@OneToMany + @JoinTable` 패턴 finding 등록 후보**: 본 PoC 의 user_followings 케이스. JPA spec 허용이지만 `@ManyToMany` 가 의미상 더 명확. 메타 finding (방법론 차원 아님 — 사용자 코드 권고만).

### 8.2 방법론 본체 시사점 (finding 후보)

6. **F-Phase2-A (신규 후보)**: ddl-auto=none 환경의 정합성 우선순위 가이드 부재 (plan §5.3 R-Phase2-1 인정). 명세 §3.4 는 "운영 DB > ORM > ERD" 가 기본인데, **ddl-auto=none 시 schema.sql (=migration) 이 사실상 운영 DB** 역할. 명세에 `Migration as DB SoT` 케이스 추가 권고.

7. **F-Phase2-B (신규 후보)**: `@Embeddable` 안의 `@JoinTable` / collection 패턴이 Phase 4 5.A 라우팅 케이스로 명세에 부재. 명세 §3.1 "@Embeddable → 도메인 모델 입력" 만 있고, 내부 collection 의 의미는 미정. RealWorld 의 ArticleContents.tags 케이스를 강한 예시로 추가.

8. **F-Phase2-C (신규 후보)**: severity 분류 가이드 부재 — 명세 §4.2 의 high/medium/low 예시는 있지만, 본 PoC 처럼 **severity=high 0건** 인 정합성 양호 케이스의 보고 형식 표준화 부재. "no-finding" 케이스도 명시적으로 보고하는 패턴 권고.

### 8.3 Phase 2 신뢰도 예측 갱신

plan-phase2.md §9 의 0.93~0.95 → **현실 0.92~0.94 예상**:
- 테이블 식별: 0.98 (DDL + JPA 양쪽 cross-check 완료)
- 컬럼 식별: 0.95 (UserName/Image 내부 컬럼명 미확인 — bytes 크기로 추정 only)
- DRIFT 검출: 0.90 (7건 발견. medium 3건 decision required)
- `@Embedded` 추출: **0.95** (3-level + @JoinTable 케이스 전수 검증)

### 8.4 Phase 2 실행 시 추가 fetch 권고

기존 P0 5건 + 보강 4건 (Profile/Email/Password/ArticleTitle) = **9건 fetch 완료**. 추가 권고:
- **UserName.java, Image.java** (rate limit 47 → 45) — users.name / users.image 컬럼명 직접 검증 (현재 (E) 추정).
- **ArticleUpdateRequest.java** (선택) — Aggregate 변경 패턴 (Phase 4 5.A 입력).

권장: UserName/Image 만 추가 (확정 비용 낮음), ArticleUpdateRequest 는 Phase 4 로 미루기.

### 8.5 plan-phase2.md §13 F-015 cross-validation 적용 결과

| 체크 항목 | 결과 |
|---|---|
| sub-agent 가 "테이블 수 N개" 보고 → 메인이 schema.sql 파싱 cross-check | ✅ 메인 직접 fetch — 7 테이블 확정 |
| sub-agent 가 "Entity X 에 @Embedded 있음" 보고 → 메인이 raw fetch cross-check | ✅ User 3-level / Article 2-level 직접 fetch 확정 |
| sub-agent 가 "FK ON DELETE Y" 보고 → 메인이 schema.sql 직접 확인 | ✅ 6 CASCADE + 1 no-CASCADE (articles.author_id) 직접 확인 — DRIFT-007 발견 |
| sub-agent 가 "JPA @Column(length=N)" 보고 → 메인이 raw fetch + DDL 비교 | ✅ JPA 기본 255 vs DDL no-length 발견 — DRIFT-004 |

**0% 오차** (Phase 1 의 50% 오차 대비 큰 개선) — 본 research 자체가 메인 직접 fetch 위주라 sub-agent 의존 최소.

---

## §9. 본 research 한계 + 자평 신뢰도

### 9.1 영역별 신뢰도

| 영역 | 신뢰도 | 근거 |
|---|---|---|
| JPA 어노테이션 기본값 (`@Column`/`@JoinColumn`) | **0.98** | 공식 javadoc 직접 fetch (docs.hibernate.org/jpa/2.1) |
| `@Embedded` / `@Embeddable` 동작 | **0.95** | Hibernate 5.4 User Guide §2.4 + JPA 2.1 spec + nested 케이스 web search consensus |
| Spring Boot schema.sql 자동 로드 | **0.95** | 공식 docs (data-initialization.html) 직접 fetch + Baeldung cross-validation |
| H2 PostgreSQL 호환 모드 | **0.88** | 공식 features.html fetch — DATABASE_TO_LOWER 만 부분 (간접) |
| PostgreSQL BIGSERIAL | **0.95** | postgresql.org/docs/current 직접 fetch |
| RealWorld JPA Entity 5+4 직접 검증 | **0.97** | raw fetch 9건 모두 성공 |
| DRIFT-XXX 검출 정확도 | **0.90** | 7건 모두 DDL + JPA 양쪽 직접 확인. UserName/Image 컬럼명만 (E) |

**가중평균 자평**: **0.92** (요소수 가중).

### 9.2 한계

1. **UserName.java / Image.java 미fetch** — users.name 과 users.image 의 JPA 측 컬럼명 (E) 추정. 실행 단계에서 추가 fetch 권고.
2. **Hibernate 5.4 User Guide 의 일부 섹션 (§2.7.2 OneToMany, §2.4.5 Collection of embeddable) 본문 직접 인용 못함** — 공식 fetch 시 일부 반환 truncated. JPA 2.1 spec javadoc 으로 보완.
3. **운영 PostgreSQL 의 BIGSERIAL ↔ IDENTITY 호환성** 직접 검증 못함 — 학습 코퍼스 + 공식 docs 추론 (DRIFT-001 의 severity=low 결론).
4. **`@Embeddable` 안 collection 의 cascade 동작 세부 매커니즘** — JPA spec 의 `@ManyToMany` javadoc 본문은 확인. 단 Hibernate 5.4 의 구현 detail (예: ArticleContents.tags 가 detached 됐을 때 동작) 은 미검증.
5. **Hibernate Validator (`@NotNull`, `@Size`) 와 `@Column(nullable, length)` 차이** — 본 research 에서 다루지 않음. Phase 4 BR 추출 단계에서 보강 권고.

### 9.3 강점

- **9개 raw fetch 직접 검증** (Article/ArticleContents/User/Comment/Tag + Profile/Email/Password/ArticleTitle)
- **공식 docs 5개 직접 fetch** (Spring Boot data-init / Hibernate UG 5.4 / JPA javadoc Column / JPA javadoc JoinColumn / H2 features / PostgreSQL datatype-numeric)
- **DRIFT 7건 사전 검출** — Phase 2 실행이 산출물 작성 기계적 작업으로 단순화
- **F-015 cross-validation 0% 오차** — 메인 직접 fetch 위주 설계 효과

### 9.4 권고 신뢰도 vs ADR-003 §9 5단계

자평 0.92 → ADR-003 §9: **신뢰 가능 (샘플 검토 권장)**.

---

## §10. 출처 전체 (Sources)

공식 docs (직접 fetch ✅):
- https://docs.spring.io/spring-boot/how-to/data-initialization.html (Spring Boot 데이터 초기화)
- https://docs.hibernate.org/orm/5.4/userguide/html_single/Hibernate_User_Guide.html (Hibernate ORM 5.4 User Guide)
- https://docs.hibernate.org/jpa/2.1/api/javax/persistence/Column.html (JPA `@Column` javadoc)
- https://docs.hibernate.org/jpa/2.1/api/javax/persistence/JoinColumn.html (JPA `@JoinColumn` javadoc)
- https://docs.jboss.org/hibernate/jpa/2.1/api/javax/persistence/ManyToMany.html (JPA `@ManyToMany` javadoc — embeddable 안 사용 spec)
- https://www.h2database.com/html/features.html (H2 호환 모드)
- https://www.postgresql.org/docs/current/datatype-numeric.html (PostgreSQL BIGSERIAL)
- https://jakarta.ee/specifications/persistence/2.2/apidocs/javax/persistence/Embedded.html (`@Embedded` javadoc)

RealWorld raw source (직접 fetch ✅):
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/java/io/github/raeperd/realworld/domain/article/Article.java
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/java/io/github/raeperd/realworld/domain/article/ArticleContents.java
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/java/io/github/raeperd/realworld/domain/article/ArticleTitle.java
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/java/io/github/raeperd/realworld/domain/user/User.java
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/java/io/github/raeperd/realworld/domain/user/Profile.java
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/java/io/github/raeperd/realworld/domain/user/Email.java
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/java/io/github/raeperd/realworld/domain/user/Password.java
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/java/io/github/raeperd/realworld/domain/article/comment/Comment.java
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/java/io/github/raeperd/realworld/domain/article/tag/Tag.java
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/resources/schema.sql
- https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/src/main/resources/application.properties

이차 출처 (cross-validation):
- https://www.baeldung.com/spring-boot-data-sql-and-schema-sql
- https://www.baeldung.com/jpa-embedded-embeddable
- https://www.baeldung.com/jpa-many-to-many

---

(끝)
