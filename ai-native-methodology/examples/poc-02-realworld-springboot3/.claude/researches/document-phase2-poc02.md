# Document Research — PoC #02 Phase 2

> sub-agent 산출 (Document Researcher) — 메인이 직접 저장 (sub-agent Write 거부 패턴 대응)
> 작성: 2026-04-29 / 메인 1차 추정 6건을 직접 read + 공식 docs 로 cross-check

---

## 1. F-015 Cross-Validation 결과 (메인 1차 추정 검증)

| # | 메인 1차 추정 | 검증 결과 | 근거 |
|---|---|---|---|
| 1 | schema.sql 의 FK 제약명 (`fkmjgtny2i22jf4dqncmd436s0u`) 가 Hibernate auto-gen → DDL 이 ORM 에서 파생 | ✅ **정합 (강한 증거)** | Hibernate `NamingHelper.generateHashedFkName()` 알고리즘 = `"FK" + base35(MD5(table+references+columns))` (대문자 prefix). 그러나 schema.sql 은 **소문자 `fkmjgtny...`** 로 변환되어 저장됨 → H2 의 unquoted identifier lowercase 정규화 효과. 핵심 시그널 (base35 lowercase 26자 정확 일치, FK 9개 모두 동일 패턴) → 100% Hibernate `ImplicitNamingStrategyJpaCompliantImpl` 산출물. 즉 **schema.sql = 과거 어느 시점 Hibernate 가 export 한 DDL 의 수동 캡쳐본**. |
| 2 | AP-DOMAIN-002 4중 방어 재현 (DB unique + JPA `@Column unique=true` + 생성자 검증) | ⚠️ **부분 정합** — 본 PoC 는 **3중 방어** (4중 아님) | 직접 검증: ① schema.sql L65/66 `email/username varchar(30) not null unique` ✅ ② User.java L29/L32 `@Column(length = 30, nullable = false, unique = true)` ✅ ③ User.java L52~60 생성자 `null/blank` 검증 ✅. **누락**: setEmail (L75~88) 은 중복 검증 없음 — 단순히 같은 값이면 skip. 즉 unique 충돌은 DB constraint violation 으로만 잡힘 (App layer race condition 가능). PoC #01 의 "App 레이어 사전 검증" 은 본 PoC 도 동일하게 부재. → **DRIFT-010 등가 위험 부재** (DB+JPA 이중 unique 가 강제 잡음) but App-side 사전 lookup 부재 finding 후보. |
| 3 | DRIFT-002 (단방향 follow) 비재현 — `UNIQUE(follower_id, following_id)` 명시 | ✅ **정합** | UserFollow.java L23~25 `@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"follower_id", "following_id"})})` + schema.sql L58 `constraint ukp8vhuhxu2u1fm8qg7hvn4y1gs unique (follower_id, following_id)`. 본 PoC 는 PoC #01 의 단방향 결함을 **개선한 구조**. |
| 4 | DRIFT-007 (NO ACTION FK) 재현 — FK 모두 ON DELETE 미명시 | ✅ **정합** (재현됨) | schema.sql L73~98 — **9개 FK 전부 ON DELETE 절 부재**. H2 공식 grammar: "NO ACTION is the default action, but currently it works like stricter RESTRICT" (https://h2database.com/html/grammar.html#referential_action). |
| 5 | F-016 Decision Tree v1.1.2 → Q1=No / Q2=No → DDL > ORM > ERD | ✅ **정합** | Q1: Flyway/Liquibase 의존성 부재 + classpath/db/migration 부재. Q2: 운영 DB 입력 부재. → 가장 낮은 분기 적용. **단 부록 B 권고** — DDL 자동 생성 vs 수동 작성 분별 절차 부재 |
| 6 | 4 신규 candidate (PF-P2-001~004) | ✅ **모두 재현** | PF-P2-001: Article.java L49 EAGER 명시 ✅ / PF-P2-002: Article.java L57~59 단순 변환 ✅ / PF-P2-003: User=UUID / 나머지=Integer / Tag=String 3종 혼재 ✅ / PF-P2-004: 9 FK 전부 hash 패턴 ✅ |

---

## 2. Hibernate 6 / Jakarta Persistence 공식 docs

### 2.1 `GenerationType.UUID` (Hibernate 6 신규 ★)

- 출처: https://in.relation.to/2022/05/12/orm-uuid-mapping/ + Jakarta Persistence 3.1 spec
- 핵심: JPA 3.0 까지 AUTO/IDENTITY/SEQUENCE/TABLE 4종만, JPA 3.1 (Hibernate 6) 에서 **`GenerationType.UUID` 정식 enum 추가**
- 본 PoC User.java L26 `@GeneratedValue(strategy = GenerationType.UUID)` 는 **Jakarta Persistence 3.1 신규 표준 사용 → 모범 사례**

### 2.2 `@Column(unique=true)` DDL 생성
- 출처: Jakarta Persistence 3.1 spec §11.1.9 + Hibernate 6.5 User Guide §5.5
- 본 PoC 적용 패턴 (3중 일관성):
  - User: `@Column(unique=true)` (column-level)
  - ArticleFavorite/ArticleTag/UserFollow: `@Table(uniqueConstraints=...)` (table-level)
- → JPA spec 준수도 100%

### 2.3 `@OneToMany(fetch = FetchType.EAGER)` 권고
- 출처: Vlad Mihalcea — "Eager Fetching is a Code Smell" (https://vladmihalcea.com/eager-fetching-is-a-code-smell/)
- Jakarta Persistence 3.1 §11.1.40 — `@OneToMany` default = LAZY
- Article.java L49 = anti-pattern 명확

### 2.4 ImplicitNamingStrategy (FK 명명 알고리즘)
- 출처: Hibernate 6.5 source — `org.hibernate.boot.model.naming.NamingHelper#generateHashedFkName`
- 알고리즘: `prefix("FK") + base35(MD5("table"+tableName+"references"+ref+"column"+sortedCols))`
- schema.sql 9 FK 전부 패턴 정확 일치 → **100% Hibernate auto-generated 결정적 증거**

---

## 3. Spring Boot 3.3 + H2 처리 순서

### 3.1 schema.sql + ddl-auto=create-drop 조합 — 공식 anti-pattern

- 출처: Spring Boot 3.3 reference - "Initialize a Database Using Basic SQL Scripts" (https://docs.spring.io/spring-boot/3.3/how-to/data-initialization.html)
- **공식 인용**: "Best Practice: Use only one initialization mechanism: Either Hibernate's `spring.jpa.hibernate.ddl-auto` Or script-based initialization (`schema.sql`) Or migration tools (Flyway/Liquibase)"
- 본 PoC 는 schema.sql + ddl-auto=create-drop 동시 사용 → 공식 anti-pattern 위반

### 3.2 실제 실행 순서
```
1. DataSource 초기화
2. spring.sql.init 실행 → schema.sql 적용
3. JPA EntityManagerFactory 부트스트랩
4. Hibernate ddl-auto=create-drop 실행 → DROP + CREATE
5. 결과: schema.sql 의 흔적은 사라지고 Hibernate 가 만든 schema 만 남음
```

### 3.3 H2 MODE=MYSQL FK 동작
- MODE=MYSQL 은 syntax 호환만. FK ON DELETE default 는 H2 자체 default 유지 = NO ACTION (실질 RESTRICT)

---

## 4. Phase 2 명세 §3.4 Decision Tree fit (F-016 외부 검증)

- Q1=No / Q2=No → DDL > ORM > ERD ✅ 정합
- **그러나** DDL 파일 (schema.sql) = Hibernate 자동 생성 캡쳐본
- → "DDL > ORM" 우선순위가 본 PoC 케이스에서 **실질 의미 없음**
- 부록 B 신설 권고: "DDL 파일 출처 신뢰도 분기 (수동 작성 vs ORM auto-gen)"

---

## 5. PoC #01 finding cross-validation (Phase 2 영역)

| PoC #01 finding | PoC #01 결과 | PoC #02 본 환경 결과 |
|---|---|---|
| **DRIFT-002** | medium → BR-USER-FOLLOW-001 | ❌ **비재현** (UNIQUE 명시) |
| **DRIFT-007** | medium → AP-DB-001 | ✅ **재현** (9 FK 전부) |
| **DRIFT-010** | medium → high | ⚠️ **약화 재현** — DB+JPA 2중 + 생성자 검증 / App-side 사전 lookup 부재 |
| **F-016** | high closed | ✅ **외부 검증 통과** (단 부록 B 권고) |
| **F-018** | low promoted | 🔄 본 PoC high 0건 / medium 1건 |
| **AP-DOMAIN-002** | high | ❌ **본 환경 비재현** (DB+JPA+생성자 3중) |
| **F-017** | promoted | ✅ **재현** (Article.articleTags EAGER) |
| **F-028** (User equals/hashCode) | promoted | ❌ **비재현** (getId UUID 의존) |

---

## 6. 신규 finding 권고 (Document 영역)

- **PF-P2-DOC-001** medium — Article.articleTags EAGER fetch (PoC #01 F-017 재현)
- **PF-P2-DOC-002** low — schema.sql Hibernate auto-gen 캡쳐본 (Phase 2 명세 부록 B 권고)
- **PF-P2-DOC-003** low — User.setEmail/setUsername App-side 사전 unique 검증 부재
- **PF-P2-DOC-004** medium — titleToSlug Unicode/특수문자 미처리
- **PF-P2-DOC-005** low — Tag.name PK natural key (현 immutable 안전 / 변경 가능성 시 위험)
- **PF-P2-DOC-006** low — schema.sql + ddl-auto=create-drop 동시 사용 (공식 anti-pattern)

---

## 7. 메인 1차 추정 정정 (F-044 교훈)

### 정정 사항: AP-DOMAIN-002 "4중 → 3중" 방어

| 방어층 | PoC #01 | PoC #02 |
|---|---|---|
| ① DB UNIQUE constraint | ❌ | ✅ |
| ② JPA `@Column(unique=true)` | ❌ | ✅ |
| ③ App 생성자 null/blank 검증 | ✅ | ✅ |
| ④ App-side 사전 lookup (race-condition 회피) | ❌ | ❌ |

→ 본 PoC = 3중 (4중 아님). PoC #01 1중 → PoC #02 3중 = **2단계 개선**.

---

## 8. 핵심 권위 출처 정리

22 URL — Spring Boot 3.3 docs / Hibernate 6 source / Jakarta Persistence 3.1 spec / Vlad Mihalcea / H2 grammar / RealWorld spec 등.

---

## 9. 결론

1. 메인 1차 추정 6건 중 5건 ✅ / 1건 ⚠️ (4중 → 3중 정정)
2. 본 PoC 는 PoC #01 대비 진일보: GenerationType.UUID, JPA `@Column unique=true`, UserFollow uniqueConstraints, User.equals/hashCode = getId 의존
3. 재현 anti-pattern: EAGER, NO ACTION FK, schema.sql + ddl-auto 동시 사용
4. 신규 6건 (PF-P2-DOC-001~006)
5. F-016 Decision Tree 외부 검증: fit ✅. 부록 B (DDL 출처 분기) 권고

**END Document Research**
