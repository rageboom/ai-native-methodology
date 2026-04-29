# Senior Engineer Research — PoC #01 Phase 2 (db / DB 스키마 + 정합성 검증)

> 역할: Senior Backend Engineer (15년차, Spring/Java/JPA/Hibernate 전문, 한국 엔터프라이즈 SI 출신)
> 작성일: 2026-04-27
> 대상 plan: `.claude/plans/plan-phase2.md`
> 동료 research (예정): `.claude/researches/document-phase2.md` (공식문서), `.claude/researches/case-phase2.md` (테크기업 사례)
> Work Principles 2원칙 — 3개 에이전트 中 Senior 파트
>
> 톤: 한국 SI 일화 위주. "이거 안 하면 운영에서 운다"의 우선순위.

---

## §0. 들어가며 — 왜 Phase 2가 Phase 1보다 위험한가

Phase 1 senior research §0에서 "Phase 1이 가장 위험"이라고 적었다. Phase 2 들어와서 정정한다. **Phase 2가 더 위험하다.** 이유를 5가지로 정리한다.

1. **출처가 2개로 늘어났다.** Phase 1은 build.gradle / 디렉토리 트리 / Languages API — 전부 같은 GitHub 면이었다. Phase 2는 `schema.sql` (DDL, 운영 면) 와 `JPA Entity` (코드 면) 다. **두 면이 같은 사실을 다르게 말하면 어느 쪽을 믿는가**의 정책 결정이 들어간다. Phase 1에는 없던 차원이다.

2. **운영 면의 정합성 함정이 데이터 손실로 직결된다.** Phase 1 에서 LOC를 byte/35로 잘못 환산해도 데이터가 손상되진 않는다. Phase 2 에서 `nullable` 한 줄 잘못 적으면 실제 운영에서 NPE / NullPointerException → 트랜잭션 롤백 → SLA 위반 → 야간 콜 받는다. **결과의 비대칭성**이 크다.

3. **`ddl-auto` 설정이 명세에 없는 차원을 만든다.** Phase 2 명세 §3.4 통합 우선순위는 "운영 DB > ORM > ERD" 다. 본 PoC는 운영 DB 부재 (H2 인메모리) + `ddl-auto=none` 이라 **schema.sql 이 운영 DB 자리를 대신**한다. 명세에 그 분기가 없다. 사람이 판단해야 한다.

4. **`@Embedded` / `@JoinTable` 추출은 Phase 4 도메인 추출의 골격**이다. Phase 2에서 잘못 추출하면 Phase 4가 통째로 흔들린다. Phase 1 → Phase 2 영향은 incremental 하지만, **Phase 2 → Phase 4 영향은 structural** 이다.

5. **CHECK / 인덱스 / 트리거 / 시퀀스 부재가 발견되어야 하는데 안 된다.** RealWorld 학습용 spec은 깨끗해서 다 잘 나온다. 사내 진짜 시스템은 여기서 찢어진다. **PoC가 깨끗할수록 일반화 가치는 떨어진다**는 역설.

아래 §1~§8은 위 5가지 위험을 함정 8개로 쪼갠 것. PoC #01 Phase 2 진행자는 이 8개를 체크리스트로 들고 들어가야 한다.

---

## §1. `ddl-auto=none` + schema.sql + JPA Entity 의 3중 정합성 함정

### 증상

세 가지 패턴이 다 위험하다.

(a) **JPA Entity 변경 → schema.sql 갱신 누락.** Spring 권장은 "운영은 ddl-auto=none + schema.sql이 SoT"인데, 개발자는 평소 `ddl-auto=update` (로컬) 로 일하다가 production deploy 시 schema.sql 손으로 갱신한다. 잊는다. 운영 ApplicationContext 로딩은 성공, runtime 첫 INSERT 에서 `column not found` 폭발.

(b) **schema.sql 갱신 → JPA Entity 안 봄.** DBA가 스키마 변경하면서 Entity 위치 모르고 schema.sql만 손댄다. Hibernate `SchemaValidator` 도 `ddl-auto=none` 에서는 안 돈다 (`validate` 가 따로). 매핑 깨진 채 deploy.

(c) **Spring 권장 vs 실무 함정.** Spring 공식 문서가 "운영은 ddl-auto=none, schema.sql + flyway/liquibase 권장" 이라 적어놨는데, 그 권장은 *마이그레이션 도구가 SoT*라는 전제다. RealWorld 처럼 마이그레이션 없이 단일 schema.sql만 있으면 권장의 절반만 쓴 거다. 사내에서도 "아 Spring 권장대로 했어요" 하고 절반만 쓴 케이스 자주 본다.

### 일화

예전에 모 카드사 통합 환경 마이그레이션 할 때다. 운영은 `ddl-auto=none`, 개발은 `ddl-auto=update` 로 분리해놨다. 개발자가 Entity에 `@Column nullable=true` 로 새 컬럼 추가하고 로컬에서는 update가 자동으로 ALTER 해줘서 잘 돌았다. PR 통과, QA 통과 (QA 환경도 update). 운영 deploy 시 schema.sql 갱신 안 함. **운영 첫 INSERT에서 "column does not exist" 폭발.** 새벽 2시에 콜 받았다.

원인 분석 들어가니 schema.sql은 3개월 전 버전, Entity는 매주 갱신, 운영 DB는 schema.sql 따라 옛날 버전. **세 면이 다 다른 시점**이었다. 그때 만든 룰이 "Entity 변경 PR은 schema.sql diff 동반 필수, CI에서 검증" 이다.

또 다른 케이스. 모 보험사에서 `ddl-auto=validate` 로 박고 있었다. 이건 Hibernate가 부팅 시 Entity ↔ DB 메타 비교하고 불일치하면 부팅 실패. "안전하다" 고 생각했는데, **Entity에 새 필드 추가했는데 schema.sql / DB에 없으면 부팅 실패** → CI/CD 파이프라인이 도는데 deploy 단계에서 실패. **롤백 대신 부팅 실패만 났다.** validate 모드의 함정이다. none이 차라리 낫다는 결론.

### 대응책

1. **Phase 2 분석 단계에서 ddl-auto 값 명시.** `application.properties` 의 `spring.jpa.hibernate.ddl-auto` 값을 inventory에 박고, 그 값에 따라 통합 우선순위 분기:
   - `none`: schema.sql > JPA Entity (DDL 이 실제 동작)
   - `validate`: schema.sql ≈ JPA Entity (불일치 시 부팅 실패니까 일치 보장. 하지만 운영 DB 변경 추적 X)
   - `update`: JPA Entity > schema.sql (Entity 가 매번 ALTER 발사)
   - `create`/`create-drop`: 검증 자체 무의미 (운영 절대 금지 + 개발 한정)
2. **명세 §3.4 통합 우선순위에 "ddl-auto 값별 분기" 가이드 추가 finding (F-016 후보).**
3. **schema.sql vs JPA Entity diff 결과 모두 DRIFT-XXX 등록.** severity 분류:
   - **high**: 운영 영향 (컬럼 부재 / 타입 다름 / NOT NULL 다름)
   - **medium**: 의도 불일치 (length 다름 / unique 다름)
   - **low**: 메타 차이 (column 순서 / comment 다름)
4. **Phase 2 산출물에 "ddl-auto 정책 + 권장 마이그레이션 도구 부재" 메모 의무.** RealWorld는 flyway/liquibase 부재 → 사내 적용 시 마이그레이션 도구 도입 권장 사항을 finding으로 격상.

---

## §2. `@Embedded` / `@Embeddable` Aggregate 추출 함정

### 증상

세 가지가 자주 일어난다.

(a) **테이블 1개 ↔ Entity 1개 1:1 매핑 본능.** schema.sql `articles` 테이블 컬럼 (title/description/body) 이 Article Entity 의 멤버라고 단정. 실제로는 `@Embedded ArticleContents` 로 분리되어 있을 수 있다. **DDL만 보면 잡지 못한다.**

(b) **`@AttributeOverrides` 누락 시 컬럼 충돌.** Embeddable 안의 필드명이 DDL 컬럼명과 다를 때 매핑 깨진다. 예: `Email` Embeddable 의 필드 `value` 가 DDL `email` 컬럼에 매핑되어야 하는데 `@Column(name="email")` 또는 `@AttributeOverride` 누락 시 Hibernate가 `value` 컬럼 찾다가 부팅 실패. 한 Entity에 같은 Embeddable 두 번 쓰면 (예: Address billing/shipping) 컬럼 이름 충돌 → `@AttributeOverrides` 필수.

(c) **VO와 Embeddable 혼동.** "VO = `@Embeddable`" 로 단정하는 케이스 흔하다. 실제로는 VO는 도메인 개념 (불변 / equals 정체성 / 비즈니스 의미), Embeddable은 JPA 매핑 패턴. **둘이 자주 같이 가지만 같지 않다.** VO를 별도 테이블로 추출하면 (User Email 별도 테이블) `@Embeddable` 이 아니라 `@OneToOne` 관계가 된다.

### 일화

이게 한국 SI에서 도메인 추출할 때 가장 많이 본 함정이다. 모 게임사 회원 시스템 분석할 때다. `users` 테이블에 `email`, `email_verified`, `email_verified_at`, `email_token` 4 컬럼이 있었다. DDL만 보면 그냥 User 의 4 필드다. JPA Entity 까보니 `@Embedded EmailVerification email` 로 묶여 있고, `EmailVerification` 안에 4 필드 + `verify(token)` 메서드, `isExpired()` 메서드가 있었다. **DDL은 평면 4 컬럼, 도메인은 1 Aggregate**. Phase 4 비즈니스 로직 추출 시 `EmailVerification.verify()` 가 핵심 비즈니스 메서드인데, 만약 Phase 2에서 4 필드로 평면화했으면 Phase 4에서 이 메서드를 못 잡았을 거다.

또 다른 케이스. 모 커머스 주문 시스템에서 `orders` 테이블에 `shipping_zipcode`, `shipping_address1`, `shipping_address2`, `billing_zipcode`, `billing_address1`, `billing_address2` 가 있었다. JPA Entity는 `@Embedded Address shippingAddress` + `@Embedded Address billingAddress` 였고, 각각 `@AttributeOverrides({@AttributeOverride(name="zipcode", column=@Column(name="shipping_zipcode")), ...})` 6개씩 있었다. **`@AttributeOverrides` 안 봤으면 같은 Address 두 번 쓰는 거 인식 못 한다.** 도메인 추출 시 Address Embeddable 1개로 잡고 Order에 두 번 쓰는 패턴을 추출해야 한다.

RealWorld 의 source-info.md 가 명시한 `Article 의 ArticleContents` 가 정확히 (a) 케이스다. articles 테이블의 title/description/body 3 컬럼이 `@Embedded ArticleContents` 로 묶여 있다. **DDL만 보고 평면화 금지** 가 PoC #01 Phase 2 의 핵심 검증 케이스.

### 대응책

1. **JPA Entity 의 `@Embedded` / `@Embeddable` 어노테이션 raw fetch 후 메인 에이전트가 직접 검증.** sub-agent 보고 신뢰 금지 (F-015 적용).
2. **schema.json 에 `embedded_vo: [{name, fields[], parent_table, parent_column_prefix}]` 메타 추가.** Phase 4 라우팅 입력. (현재 db-schema.schema.json 에 있는지 확인 필요 — 없으면 schema 확장 finding.)
3. **`@AttributeOverrides` 가 있는 케이스는 별도 표시.** `attribute_overrides: [{embeddable_field: "X", db_column: "Y"}]` 명시.
4. **VO ≠ Embeddable 인식.** Embeddable 은 JPA 매핑 결정, VO는 도메인 결정. **둘이 따로 적힐 수 있다는 점을 산출물에 명시.** 본 PoC 의 `Email`, `Password`, `UserName`, `Image` 가 VO 인지 Embeddable 인지 확인.
5. **사내 적용 시 finding**: "도메인 모델러가 Phase 2 산출물 보고 도메인 추출 시 평면화 위험" — 명세 §8 흔한 함정에 추가 후보.

---

## §3. `@JoinTable` vs 별도 Entity 선택의 함정

### 증상

(a) **`@ManyToMany` + `@JoinTable` 만족하는 도메인이 정말 다대다 인가.** RealWorld articles_tags 는 article ↔ tag 단순 다대다. 하지만 사내 시스템에서 join table에 `created_at`, `created_by`, `status`, `type` 같은 추가 컬럼이 붙는 순간 **다대다가 아니라 별도 Entity** 다. 이때 `@ManyToMany` 로 매핑하면 추가 컬럼에 접근 불가.

(b) **JPA `@ManyToMany` + `cascade = CascadeType.ALL` 사고.** join table 에 cascade 박으면 한 쪽 삭제 시 join row만 삭제되어야 하는데 반대편 Entity 까지 삭제되는 버그. cascade ALL 절대 금지.

(c) **`orphanRemoval` 의 함정.** `@OneToMany` 에 `orphanRemoval = true` 박으면 컬렉션에서 빼면 자동 DELETE. join table 에 박으면 의도치 않은 삭제.

(d) **JPA bag semantics.** `@ManyToMany List<Tag> tags` 는 *bag* (중복 허용). `Set<Tag>` 가 옳다. List 면 Hibernate 가 매번 DELETE ALL + INSERT ALL 해서 N+1 + 잠금 경합 폭발.

### 일화

예전에 모 통신사 고객사 분석 시스템에서 `customer_tags` join table 이 있었다. 처음엔 단순 다대다였는데 운영 1년차에 "태그 부여 시점", "부여자", "만료일" 요구사항 들어와서 컬럼 3개 추가됐다. 코드는 그대로 `@ManyToMany Set<Tag> tags` 였다. **추가 컬럼은 SQL 직접 쿼리로 채우고 있었다.** 그러다가 마이그레이션 들어가면서 "왜 이 컬럼 어디서도 안 쓰는데 데이터가 차 있지?" 발견. 별도 Entity (CustomerTag) 로 승격해서 `@OneToMany CustomerTag` 패턴으로 리팩터링. 운영 DB 영향 zero, Entity만 변경. 하지만 그걸 모르고 `@ManyToMany` 로 계속 매핑했다면 추가 컬럼은 영원히 못 보는 상태.

또 한 번은 모 카드사에서 `@ManyToMany List<>` 로 매핑한 게 있었다. 운영 트랜잭션에서 멤버 1명 추가하니 **기존 멤버 100명 다 DELETE → 101명 INSERT**. 잠금이 100row 가 아니라 101 row 에 걸리고 binlog 도 그만큼. DBA가 발견하고 "이거 누가 짰어요" 폭발. `Set<>` 로 바꾸고 `@OrderColumn` 빼니까 incremental insert/delete 로 바뀌어서 해결.

RealWorld는 `articles_tags`, `article_favorites`, `user_followings` 3개 join table 모두 추가 컬럼 없음 → 단순 다대다 OK. 하지만 **사내 적용 시 추가 컬럼 발생 시 별도 Entity 승격 가이드** 가 필요하다.

### 대응책

1. **schema.sql join table 의 컬럼 수 확인.** 2 컬럼 (양쪽 FK) → `@JoinTable` OK. 3 컬럼 이상 → 별도 Entity 후보 + Phase 4 도메인 추출 시 검증.
2. **JPA Entity 의 `@ManyToMany` 사용처 raw fetch.** `cascade`, `fetch` 옵션 명시. cascade ALL 발견 시 안티패턴 후보 (`AP-DB-CASCADE-ALL`).
3. **`Set<>` vs `List<>` 확인.** `@ManyToMany List<>` 발견 시 finding (`AP-DB-MANY-MANY-LIST`).
4. **schema.json 에 `join_tables: [{table, type: "simple"|"with_extra_columns", entity_promoted: true|false}]` 메타 추가.**
5. **사내 적용 finding**: join table 에 추가 컬럼 1개라도 있으면 별도 Entity 승격 권장. RealWorld 는 깨끗해서 안 잡히지만 사내 적용 시 70% 케이스.

---

## §4. H2 인메모리 + PostgreSQL 호환 모드의 함정

### 증상

(a) **"테스트는 H2, 운영은 PostgreSQL" 이 깨끗해 보이지만 미세 차이 누적.** 시퀀스 처리, 함수 (예: `now()`, `current_timestamp`, `array_agg`), JSON 타입, 부분 인덱스 (PostgreSQL `WHERE` 절 인덱스), `LATERAL JOIN`, `RETURNING` 절 — 다 다르다. H2가 PostgreSQL 호환 모드여도 **100% 호환 아니다**.

(b) **`DATABASE_TO_LOWER=TRUE` 의 의미.** H2는 기본적으로 식별자를 대문자로 처리. PostgreSQL은 quote 없으면 소문자. 호환 모드에서 `DATABASE_TO_LOWER=TRUE` 박으면 H2 도 소문자로. 하지만 quote (`"COLUMN_NAME"`) 가 들어간 DDL은 여전히 대문자 보존 → JPA Entity 의 `@Column(name = "column_name")` 와 case 불일치 가능.

(c) **운영 환경 부재 → 정합성 검증의 한계.** Phase 2 명세 §3.4 가 운영 DB 를 최우선 신뢰하라는데, 본 PoC 는 운영 DB 부재. **검증할 면이 1개 줄어든 상태**. 명세의 강한 검증 케이스가 약해진다.

(d) **H2 BIGSERIAL ↔ PostgreSQL BIGSERIAL ↔ JPA `@GeneratedValue(strategy=IDENTITY)` 매핑 차이.** PostgreSQL BIGSERIAL은 내부적으로 SEQUENCE + DEFAULT. H2 호환 모드 BIGSERIAL은 IDENTITY 컬럼. JPA strategy IDENTITY 면 H2 OK, PostgreSQL은 SEQUENCE 추천. 미세하게 동작 다름.

### 일화

예전에 모 핀테크에서 "테스트는 H2 PostgreSQL 호환, 운영은 PostgreSQL 13" 환경이었다. 개발자가 `array_agg(column)` 을 native query 로 박았다. H2 테스트 통과 (호환 모드라 `array_agg` 인식). 운영 deploy. **H2의 `array_agg` 는 PostgreSQL 처럼 array 타입 반환이 아니라 String 으로 join 한다.** 결과 파싱 코드가 String split 했는데 운영에서는 PostgreSQL array 그대로 와서 ClassCastException. 야간 콜.

또 한 번은 `now()` 함수. H2에서는 호출마다 다른 값 반환. PostgreSQL 의 `now()` 는 트랜잭션 시작 시점 고정. 트랜잭션 안에서 두 번 `now()` 호출하면 **H2는 다른 값, PostgreSQL은 같은 값**. 시간 비교 로직이 운영에서 항상 같은 값으로 나와서 if 분기 통째로 안 탔다. 발견까지 3주 걸렸다.

또. H2 PostgreSQL 호환 모드는 **PostgreSQL 함수의 absolute superset 이 아니다**. `LATERAL JOIN`, `WINDOW FUNCTION` 일부, `RETURNING` 절, JSONB operators, full-text search — 다 H2 미지원 또는 부분 지원. 사내 시스템 마이그레이션 시 native query 모두 PostgreSQL 직접 테스트 권장.

### 대응책

1. **inventory.warnings 에 명시적 기록**: "운영 환경 부재 — H2 인메모리 + PostgreSQL 호환 모드. 실제 PostgreSQL 동작 미검증."
2. **`database_type` 표기 정책**: `database_type: "postgresql"` (의도된 운영 DB) + `actual_runtime_db: "h2"` 보조 메타 (schema 확장 finding 후보).
3. **native query 추출 시 H2 호환성 별도 검증.** Phase 4 5.A 에서 `@Query(nativeQuery = true)` 모두 PostgreSQL 직접 검증 권장 메모.
4. **`MODE=PostgreSQL` 외 옵션 모두 inventory 에 보존.** `DATABASE_TO_LOWER=TRUE` 같은 옵션이 매핑에 영향.
5. **F-016 finding 정식 등록**: "운영 DB 부재 + 호환 모드 환경의 정합성 검증 가이드 부재 (Phase 2 명세 §3.4 분기 부재)."

---

## §5. schema.sql DDL ↔ JPA Entity 비교 시 흔한 오인

### 증상

세 가지 비교 항목에서 misinterpretation 자주 발생.

(a) **VARCHAR(255) vs `@Column(length = 255)` 의 정합성.** Spring/JPA 기본값이 length=255 다. `@Column(length = 255)` 명시한 게 아니라 **기본값일 수도** 있다. DDL VARCHAR(100) 인데 JPA `@Column` (length 명시 안 함, 기본 255) → drift? **drift 가 아니다** (JPA 는 length 메타데이터, 실제 INSERT 길이 검증은 DDL에서 함). 하지만 IDE 자동완성 / Bean Validation 사이즈 체크가 255 기준이라 의도 불일치 가능.

(b) **BIGSERIAL vs `@GeneratedValue(strategy = IDENTITY)` (PostgreSQL/H2 매핑).** PostgreSQL BIGSERIAL = BIGINT + SEQUENCE + DEFAULT nextval(). JPA strategy:
   - `IDENTITY`: DB의 IDENTITY 컬럼 사용. PostgreSQL 11+ 의 `GENERATED ALWAYS AS IDENTITY` 와 매핑.
   - `SEQUENCE`: 명시적 sequence 사용. PostgreSQL BIGSERIAL 의 자동 SEQUENCE 와는 다름 (별도 sequence 정의 필요).
   - `AUTO`: Hibernate 가 dialect 보고 결정. PostgreSQL dialect 면 SEQUENCE 선택.
   `BIGSERIAL` + `IDENTITY` 매핑은 작동하지만, JPA batch insert 가 **disabled** (IDENTITY 컬럼은 INSERT 후에야 ID를 알 수 있어서 batch 불가). 성능 함정. PostgreSQL 권장은 SEQUENCE.

(c) **NOT NULL vs `@Column(nullable = false)` vs Bean Validation `@NotNull` 차이.**
   - DDL `NOT NULL`: DB 레벨 강제. 위반 시 SQL 예외.
   - JPA `@Column(nullable = false)`: DDL 생성 시 NOT NULL 추가. **`ddl-auto=none` 이면 무시됨** (DDL 생성 안 하니까). 단, Hibernate 가 INSERT 전에 검증 (일부 버전 / 일부 dialect).
   - Bean Validation `@NotNull`: Spring/JSR-380 검증. `@Valid` 어노테이션 있는 경로에서만 동작. DB 까지 가기 전에 차단.
   세 개가 다른 레벨, 다른 시점, 다른 효과. **하나 있다고 다른 두 개도 있는 건 아니다.**

### 일화

이게 정말 자주 본다. 모 헬스케어 시스템에서 `users.email` 이 DDL `NOT NULL`, JPA `@Column(nullable = true)` (실수), Bean Validation 부재. **세 면이 다 다름.** 신규 가입 API 가 email 없이 들어와서 Bean Validation 통과 (`@NotNull` 부재) → JPA persist 시도 (`nullable = true` 라 통과) → DB INSERT 에서 NOT NULL 위반 → 500 에러. 사용자에게 "서버 오류입니다" 떴다. 정상이라면 Bean Validation 단계에서 400 에러가 나야 하는데, 세 레벨 다 다르게 적혀서 가장 안쪽 (DB) 에서 폭발.

또. `BIGSERIAL` + `IDENTITY` 함정. 모 커머스에서 주문 INSERT 가 초당 1000건인데 batch 가 안 들어가서 단건 INSERT 만 발사되고 있었다. JPA `@GeneratedValue(strategy = IDENTITY)` 였는데 PostgreSQL 의 DEFAULT nextval() 받으려고 매번 round-trip. SEQUENCE strategy 로 바꾸고 `@SequenceGenerator(allocationSize = 50)` 박으니까 50건씩 batch insert. **TPS 8배 개선.** PostgreSQL 사용 시 IDENTITY 절대 안 쓴다는 룰을 그때 만들었다.

VARCHAR length 함정. 모 보험사에서 `address` 컬럼이 DDL `VARCHAR(500)`, JPA `@Column` (length 명시 X, 기본 255). Bean Validation `@Size(max = 255)`. **사용자가 300자 주소 입력하면 Bean Validation 단계에서 막힘.** DB는 500까지 받을 수 있는데. 이게 의도된 건지 실수인지 추적하는데 시간 소요. 결론은 실수. JPA 기본값 모르고 짠 거였다.

### 대응책

1. **정합성 검증 비교 시 "기본값" 명시.** JPA `@Column(length = X)` 미명시 → length=255 (기본값). drift 판정 시 기본값 vs 명시 구분.
2. **세 레벨 (DDL / JPA / Bean Validation) 각각 추출 + 매트릭스 비교.** schema.json 에 `nullability_consistency: {ddl: "NOT NULL", jpa_column: "nullable=true", bean_validation: "absent"}` 같이 3 면 모두 기록. 불일치 시 DRIFT 등록.
3. **`BIGSERIAL` + JPA strategy 조합 검증.**
   - DDL BIGSERIAL + JPA IDENTITY: OK 동작, 하지만 batch insert 불가 → 성능 안티패턴 후보.
   - DDL BIGSERIAL + JPA SEQUENCE: 별도 sequence 정의 필요. 미정의 시 hibernate_sequence 자동 생성 (운영 함정).
   - DDL BIGSERIAL + JPA AUTO: dialect 따라감.
4. **VARCHAR length 비교 시 "JPA default 255" 매칭 룰.**
5. **finding 후보**: Phase 2 명세 §3.3 비교 항목에 "기본값 처리 가이드 부재" 추가.

---

## §6. CHECK constraint 부재 + Bean Validation 분리의 함정

### 증상

(a) **DDL CHECK 없음 → DB 레벨 BR 부재.** RealWorld schema.sql 에 CHECK 제약 없다 (확인됨). NOT NULL + UNIQUE + FK ON DELETE 외 비즈니스 규칙 단서 부재.

(b) **JPA `@Size`, `@Pattern`, `@AssertTrue` 만으로는 BR 추출 빈약.** Bean Validation 어노테이션은 형식 검증 위주. "주문 금액은 0 초과여야 함", "예약 시간은 영업 시간 내" 같은 도메인 BR 은 service 레이어 코드에 박혀 있다.

(c) **Phase 4 5.A 에서 service 레이어 도메인 메서드까지 봐야 함.** Phase 2 단계에서 BR 추출 가능 분량은 NOT NULL / UNIQUE / FK 정도. **본격 BR 추출은 Phase 4 5.A**. Phase 2 에서 BR 풍성하게 나오면 그게 오히려 의심.

### 일화

예전에 모 의료 시스템 분석할 때다. DDL은 깨끗하게 NOT NULL, UNIQUE, FK 다 있는데 CHECK 0개. "BR 검증 어디서 해요?" 물으니 "service 에 다 있어요" 답. service 까보니 1500 라인 메서드에 if 50개. **CHECK 1개로 갈음할 수 있는 게 if 5개씩 흩어져 있음.** 예: `WHERE age >= 0 AND age <= 150` 이 DDL CHECK 한 줄로 가능한데, service 에 `if (age < 0) throw...; if (age > 150) throw...;` 두 곳 + Bean Validation `@Min(0) @Max(150)` 또 한 곳 → 3 곳 다 갱신 안 되면 drift. 한 곳 깜빡하면 운영 사고.

또. 모 핀테크에서 "주문 금액은 0 초과" BR 이 Bean Validation `@DecimalMin("0.01")` + service `if (amount.compareTo(BigDecimal.ZERO) <= 0)` + DDL CHECK 부재 였다. 새 API 추가하면서 Bean Validation 어노테이션 빼먹은 개발자가 있었다. service 검증은 통과시켰지만 다른 우회 경로에서 0 들어옴 → 0원 주문 다수 발생 → 정산 시스템 폭발. **DDL CHECK 가 있었다면 마지막 방어선** 이었다. 그 사건 이후로 사내 룰에 "금액 컬럼은 DDL CHECK + Bean Validation + service 검증 3중" 박았다.

RealWorld는 학습용 spec 이라 BR 자체가 거의 없다. CHECK 부재 가 자연스럽다. 하지만 **사내 적용 시 BR 추출 빈약** 이 확정적 finding.

### 대응책

1. **Phase 2 BR 추출 범위 명시**: NOT NULL / UNIQUE / FK ON DELETE 정책 한정. `@Size`, `@Pattern`, `@AssertTrue` 는 본격 추출이 Phase 4 5.A.
2. **CHECK 부재 사실 자체를 inventory 에 기록.** "CHECK 제약 0개 — BR 추출은 Phase 4 service 코드 의존" 메모.
3. **finding 후보**: 명세 §3.3 비교 항목에 "BR 추출 위치 가이드 (DDL CHECK vs JPA validation vs service)" 부재.
4. **사내 적용 시 권장**: 금액/날짜/상태 컬럼은 DDL CHECK + Bean Validation + service 검증 3중. 본 PoC 는 학습용이라 적용 무.
5. **PoC 결과 일반화 한계 메모**: "BR 풍부도 ≠ Phase 2 신뢰도. 학습용 spec 은 BR 빈약 자체가 정상."

---

## §7. F-015 (sub-agent cross-validation) Phase 2 적용

### 증상

Phase 1 에서 D 에이전트 보고 오차 50% 발생 (Lombok / Tree count). Phase 2 의 sub-agent 결과 cross-check 없이 진행하면 동일 실수 반복.

특히 Phase 2 는 정량 데이터가 많다:
- 테이블 N개
- FK Y개
- @Embedded 위치
- @JoinTable 사용처
- BIGSERIAL/IDENTITY 매핑
- VARCHAR length 매핑

이 모든 게 **숫자 또는 boolean**. sub-agent 가 잘못 보고하면 즉시 산출물 오류로 직결.

### 일화

Phase 1 회고 때 본 케이스. D 에이전트가 "Lombok 의존성 있음 (io.freefair 5.3.3.3)" 보고. 메인이 raw fetch 로 검증하니 "Lombok 의존성은 io.freefair plugin이 적용. plugin 자체는 io.freefair, Lombok 라이브러리 버전은 별개" 였다. **plugin id ≠ library version**. 50% 오차. 더 나아가 build.gradle 의 `lombok { version = "1.18.x" }` 블록을 D 에이전트가 안 봤다.

Tree count 도 비슷했다. D 에이전트가 "총 파일 87개" 보고. 메인이 GitHub Trees API recursive=true 결과 파싱하니 124개. **D 에이전트가 truncated 응답을 못 인식**.

Phase 2 에서 같은 패턴 나올 가능성:
- "테이블 7개" 보고 → schema.sql 에 7개 맞나 직접 파싱 필요
- "@Embedded 1개 (ArticleContents)" → Article.java raw fetch 검증 필요
- "FK 8개" → schema.sql `REFERENCES` 키워드 grep 으로 검증
- "BIGSERIAL 컬럼 4개" → schema.sql 직접 카운트
- "JPA `@JoinTable` 3개" → User.java + Article.java raw fetch 검증

### 대응책

1. **Phase 2 의 모든 정량 데이터에 cross-check 의무.** sub-agent 보고는 "참고만, 검증 필수" 마킹.
2. **메인 에이전트가 직접 raw fetch + 파싱.** sub-agent 가 "X개" 보고하면 메인이 raw fetch 결과로 N개 검증. 일치하면 confidence 0.95+, 불일치하면 finding.
3. **cross-check 체크리스트 (Phase 2 plan §13 참조):**
   ```
   □ sub-agent "테이블 수 N개" → 메인 schema.sql 파싱 검증
   □ sub-agent "Entity X 에 @Embedded" → 메인 raw fetch 검증
   □ sub-agent "FK ON DELETE Y" → 메인 schema.sql 직접 확인
   □ sub-agent "JPA @Column(length=N)" → 메인 raw fetch + DDL 비교
   □ sub-agent "@JoinTable 3개" → 메인 User.java/Article.java 검증
   □ Cross-check 50%+ 오차 발견 시 즉시 finding 등록 (F-015 영향 확장)
   ```
4. **F-015 finding 의 영향 영역 확대.** 현재는 Phase 1 finding 인데 Phase 2 적용 결과로 영향 영역 확장.
5. **PoC 결과 보고 시 cross-check 결과 별도 섹션.** sub-agent vs 메인 일치율 명시.

---

## §8. RealWorld 학습용 spec 의 DB 영역 한계

### 증상

RealWorld 가 너무 깨끗해서 PoC Phase 2 결과가 "다 잘 됐다" 결론으로 흐른다. 사내 진짜 시스템에는 다음이 다 나온다:

(a) **Index 부재.** 운영 DB 없으니 inspect 불가. JPA `@Index` 어노테이션 부재. 실제 운영 시스템은 인덱스가 30~100개. 인덱스 분석은 Phase 2 의 핵심 자산인데 PoC 에서 못 본다.

(b) **Migration 부재.** schema.sql 단일 파일. flyway/liquibase 없음. 사내는 V1__init.sql, V2__add_column.sql, ... 수십 ~ 수백 개. **마이그레이션 히스토리 자체가 도메인 진화 기록**.

(c) **Stored Procedure / View 부재.** RealWorld 0개. 사내는 정산/배치/리포트에 SP/View 가 핵심. 특히 한국 금융권은 SP 비중이 30~50%.

(d) **Audit 컬럼 / Soft Delete 부재.** RealWorld 의 created_at/updated_at 외 created_by, updated_by, deleted_at, deleted_by, version (낙관적 락) 등 부재. 사내는 모든 테이블에 audit 5~7 컬럼 표준.

(e) **암호화 컬럼 / 마스킹 부재.** 한국 금융권은 주민번호/계좌번호 등 PII 컬럼 모두 암호화 (TDE 또는 컬럼 레벨). RealWorld 는 password 도 평문 가능성 (확인 필요).

(f) **테이블 분할 / 파티셔닝 부재.** 사내 대용량 테이블은 월별/일별 파티셔닝. PostgreSQL 기준 declarative partitioning. RealWorld 부재.

### 일화

Phase 1 senior research §8.1 에서 적은 거 그대로 적용. RealWorld 류 학습 레포 분석한 적이 있었는데, 모든 게 깨끗했다. 사내 적용 첫 케이스에서 깨졌다. DB 영역 특히 그렇다.

모 카드사 시스템 마이그레이션 분석 들어가서 schema 까보니:
- 테이블 200개
- 인덱스 800개 (테이블당 평균 4개)
- 마이그레이션 히스토리 V1~V340
- Stored Procedure 80개 (정산 / 일배치 / 월배치)
- View 50개 (리포트 / 권한 분리)
- 모든 테이블에 audit 7 컬럼 + version (낙관적 락)
- 주민번호 / 계좌번호 등 PII 컬럼 30개 모두 컬럼 레벨 암호화 (별도 라이브러리)
- 카드 거래 테이블은 일별 파티셔닝 (3년 = 1100 파티션)

PoC 가 RealWorld 에서 잘 돌아도 위 8가지 중 하나라도 실패하면 사내 적용 불가. **PoC 일반화 한계 = Phase 2 에서 가장 크다**.

### 대응책

1. **PoC 결과 보고서 첫 페이지에 "DB 영역 일반화 한계 6가지" 명시.**
2. **finding F-017 후보**: "Phase 2 명세에 인덱스 / 마이그레이션 / SP / View / Audit / 파티셔닝 분석 가이드 부재." 명세 §3.3 비교 항목 확장.
3. **PoC #02 후보 제안**: 좀 더 dirty 한 OSS 또는 사내 레포로 Phase 2 재실행.
4. **inventory.warnings 에 명시적 기록**: "RealWorld 학습용 spec — 인덱스 / 마이그레이션 / SP / View / Audit / 파티셔닝 / PII 부재. 사내 적용 시 별도 추출 필요."
5. **사내 적용 시 체크리스트** (Phase 2 보고서 부록 후보):
   ```
   □ 인덱스 분석 완료 (운영 DB INFORMATION_SCHEMA fetch)
   □ 마이그레이션 히스토리 추출 (flyway/liquibase metadata)
   □ Stored Procedure 목록 + 의존 테이블 매핑
   □ View 목록 + 의존 테이블 매핑
   □ Audit 컬럼 표준 확인 (테이블별 누락 체크)
   □ PII 컬럼 식별 + 암호화 정책 확인
   □ 파티셔닝 정책 확인
   ```

---

## §9. Phase 2 절대 하지 말 것 5개 (Don'ts)

| # | Don't | 이유 |
|---|---|---|
| 1 | DDL 평면 컬럼만 보고 Entity 구조 단정 | §2 — `@Embedded` 놓치면 Phase 4 도메인 추출 통째로 흔들림. |
| 2 | `@ManyToMany List<>` cascade ALL 박힌 채 "OK" 보고 | §3 — 잠금 경합 / 의도치 않은 삭제 / batch 깨짐. |
| 3 | "테스트 H2 통과 = PostgreSQL OK" 단정 | §4 — 함수/타입/시퀀스 미세 차이로 운영 사고. |
| 4 | DDL `NOT NULL` 만 보고 Bean Validation `@NotNull` 있을 거라 단정 | §5 — 세 레벨 (DDL/JPA/Bean Validation) 불일치 흔함. |
| 5 | sub-agent "테이블 7개 / FK 8개" 보고 그대로 채택 | §7 — F-015 cross-validation 없이 50%+ 오차 가능. |

---

## §10. Phase 2 꼭 확인할 것 5개 (Do's)

| # | Do | 검증 방법 |
|---|---|---|
| 1 | `application.properties` 의 `ddl-auto` 값 + 통합 우선순위 분기 | inventory.json `ddl_auto` + `integration_priority_policy` |
| 2 | `@Embedded` / `@Embeddable` 모두 raw fetch 후 메인 검증 | Article.java + ArticleContents.java + VO 4개 raw fetch |
| 3 | `@ManyToMany` cascade 옵션 + 컬렉션 타입 (Set vs List) | User.java / Article.java raw fetch |
| 4 | DDL ↔ JPA ↔ Bean Validation 3 면 nullability 매트릭스 | schema.json `nullability_consistency` 키 |
| 5 | sub-agent 정량 보고 모두 메인 cross-check + 결과 기록 | Phase 2 plan §13 체크리스트 적용 |

---

## §11. Senior 한마디

Phase 2 는 **"두 면이 같은 사실을 다르게 말할 때 어느 쪽을 믿을 것인가"** 의 단계다. Phase 1 은 한 면에서 추정의 신뢰도 문제였다면, Phase 2 는 두 면의 정합성 문제다.

특히 한국 SI 환경 적용 시:

- **`ddl-auto=none` + schema.sql + JPA Entity 의 3중 정합성 함정** 이 1순위. PR 검증에 "schema.sql diff 강제" 룰 필요.
- **`@Embedded` Aggregate 추출** 이 Phase 4 도메인 추출의 골격. 여기서 평면화하면 도메인 모델이 통째로 빈약해진다.
- **CHECK constraint 부재 + Bean Validation 분리** 가 한국 SI 시스템의 BR 함정. Phase 2 에서 BR 추출 빈약은 정상, Phase 4 에서 service 까지 봐야 한다.

PoC #01 한정으로 가장 중요한 건:

- **finding 최소 3건 이상 (Phase 1 과 동일).** F-016 (ddl-auto 분기 가이드 부재), F-017 (인덱스/마이그레이션/SP/View/Audit/파티셔닝 가이드 부재), 그리고 F-015 의 Phase 2 적용 결과.
- **`@Embedded` 추출 의무.** RealWorld 의 ArticleContents 가 Phase 2 의 핵심 검증 케이스.
- **운영 환경 부재 + 호환 모드의 한계 명시.** PoC 가 잘 돌아도 사내 적용 시 H2 ↔ PostgreSQL 차이가 가장 큰 위험.

마지막으로. Phase 2 에서 정합성 검증을 깊게 하는 게 Phase 4 도메인 추출 + Phase 5 API 추출의 신뢰도를 결정한다. **Phase 2 에서 평면화하면 Phase 4 에서 평면 도메인 모델 나오고 사내 모델러가 다시 작업해야 한다.** 한국 SI 에서 가장 자주 본 마이그레이션 실패 패턴이다.

DB 영역은 **"테스트 통과 ≠ 운영 안전"** 이 절대 진리다. PoC 가 RealWorld 에서 잘 돌아도 사내 PostgreSQL + 인덱스 800개 + SP 80개 + 마이그레이션 V340 환경에서 다시 검증해야 한다. **여기서 아끼면 거기서 운다.** Phase 1 senior 한마디 그대로 Phase 2 에 적용된다.

---

## §12. 참고

- 동료 research (예정): `document-phase2.md` (공식문서 — JPA `@Entity`/`@Embedded`/`@JoinTable`/`@Convert` + Spring Boot schema.sql 자동 로드), `case-phase2.md` (테크기업 사례 — 카카오/네이버 JPA + schema.sql 정합성, 우아한형제들 도메인 추출)
- 본 phase plan: `plan-phase2.md` (R-Phase2-1~5 리스크)
- 이전 phase senior: `senior-phase1.md` (Phase 1 함정 8개)
- Phase 명세: `methodology-spec/workflow/phase-2-db.md` (§8 흔한 함정 — 본 research 가 보강)
- Phase 산출물 명세: `methodology-spec/deliverables/04-DB-스키마.md`
- ADR-003: 신뢰도 가중평균
- 상위 plan: `methodology-v1.1/.claude/plans/plan-poc-realworld.md`
- 인계 매니페스트: `examples/poc-01-realworld-spring/output/inventory/_manifest.yml`
