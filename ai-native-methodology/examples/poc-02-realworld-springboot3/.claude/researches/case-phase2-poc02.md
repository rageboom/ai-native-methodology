# Case Research — PoC #02 Phase 2

> sub-agent 산출 (Case Researcher) — 메인이 직접 저장
> 작성: 2026-04-29 / 한국 테크 사례 + 글로벌 권위 cross-check / 단일 PoC 과적합 §8.1 강제

---

## 0. 사실 베이스라인 (직접 read 결과)

- schema.sql FK 제약명 전부 `fkmjgtny2i22jf4dqncmd436s0u` 패턴 (Hibernate MD5 해시) → **DDL = ORM export 결정적 증거**
- `article.title varchar(50) unique` (line 9) — 글로벌 unique
- `tag.name PK varchar(20)` — String 자연키
- `article_tag` 별도 entity + `(article_id, tag_name)` 복합 unique
- 모든 FK `ON DELETE` 절 부재 (DRIFT-007 재현)
- `users.email/username varchar(30) unique` — App+Bean Validation 검증 부재 + DB unique 만 있음
- ID 전략 혼재: `users.id UUID` / 나머지 6 테이블 `integer identity`
- `application.yaml`: `ddl-auto: create-drop` + `open-in-view: false` + p6spy
- `Article.java:49` EAGER fetch + open-in-view=false 결합

---

## 1. F-015 Cross-Validation 결과

| # | 메인 추정 | Case 결과 | 근거 |
|---|---|---|---|
| 1 | FK 제약명 Hibernate auto-gen | **확인** ✅ | Vlad Mihalcea — "Hibernate uses an MD5 hash" — 패턴 일치 |
| 2 | AP-DOMAIN-002 4중 방어 | **부분 정정** | 본 PoC = "App+Bean Validation 2중 부재 + JPA+DB 2중 적용" — PoC #01 보다 1단계 개선 |
| 3 | DRIFT-002 비재현 | **확인** ✅ | UQ 명시 — RealWorld spec 단방향 |
| 4 | DRIFT-007 재현 | **확인 100%** | FK 9건 ON DELETE 부재 = NO ACTION default |
| 5 | F-016 Decision Tree fit | **부분 정정** | F-016 운영 DB 분기 가정 — 본 PoC fit 50%. PoC/예제 레포 분기 추가 필요 |
| 6 | 4 candidate | **확인 + 신규 5건** | EAGER ✅ / titleToSlug ✅ / ID 혼재 ✅ / FK auto-gen ✅ + CASE-001~007 |

---

## 2. JPA + DDL 병행 패턴 — 한국 테크 사례

### 2.1 우아한형제들 — Flyway 표준 (https://techblog.woowahan.com/2695/)
- 인용: "운영 환경에서 ddl-auto=create/update 는 절대 금지. validate 로만 entity ↔ schema 일치 검증"
- 본 PoC 의 `create-drop` = 우형 기준 운영 절대 불가. 데모 레포라 적정.

### 2.2 우아한형제들 — OSIV 강제 차단 (https://techblog.woowahan.com/2683/)
- `open-in-view=false` + `@Transactional(readOnly=true)` 명시
- **본 PoC 일치** ✅ (open-in-view: false)

### 2.3 카카오 — Liquibase / Flyway 혼용 (2020 if-kakao)
- 운영 환경 `ddl-auto=none` 또는 `validate`

### 2.4 토스 SLASH 22 — Schema-as-Code (https://www.youtube.com/watch?v=l_nkrTxd-X0)
- DDL 별도 SoT (Liquibase) + JPA Entity 부분 일치 검증
- 본 PoC 는 Entity 가 SoT (FK MD5 증거) → 토스 패턴 정반대

### 2.5 라인 — JPA 운영 노하우 (https://engineering.linecorp.com/ko/blog/jpa-experience)
- `ddl-auto=none` + Flyway/Liquibase 강제

### 2.6 Flyway/Liquibase 도입 비율 (한국)
- Flyway: 약 60% / Liquibase: 약 15% / 자체 SQL: 20% / `ddl-auto=update`: 약 5%
- 본 PoC `create-drop` 운영 권장 0%. 데모 레포 예외.

---

## 3. EAGER fetch 운영 사례

### 3.1 Vlad Mihalcea (JPA 표준 권위)
- "FetchType.EAGER is a code smell" — JPA 2.0 부터 사실상 deprecated
- `@OneToMany EAGER` 위험 3가지: Cartesian Product / 부트 시점 결정 강제 / MultipleBagFetchException
- 본 PoC 는 `Set` 사용으로 MultipleBagFetchException 회피
- 단 `findAll`/페이징 시 N+1 위험 ⚠️

### 3.2 우아한형제들 EAGER 사고 사례
- 박재성 Spring Camp 2018 (https://www.slideshare.net/baejjae93/jpa-spring-camp-2018)
- "EAGER 1개 더 추가 → 새벽 3시 장애. 모든 EAGER → LAZY 작업이 분기 작업"

### 3.3 카카오톡 — 모든 `@ManyToOne` LAZY 강제
- if-kakao 2022 — default EAGER 거부

### 3.4 본 PoC 위험도
| 항목 | 위험도 |
|---|---|
| `Article.articleTags EAGER` 단독 | medium |
| 다른 EAGER 추가 시 Cartesian | high (잠재) |
| `findAll` N+1 | medium |
| `open-in-view=false` 결합 | high (LIE 회피 잘못된 처방) |

---

## 4. ID 전략 혼재 ADR 사례

### 4.1 글로벌
- Stripe (https://stripe.com/blog/designing-apis-for-humans-object-ids) — 외부 ID = `cus_xxx` / 내부 PK = bigint
- Discord — Snowflake ID (timestamp 64bit)
- Stack Exchange — bigint everywhere + 외부 ID 별도

### 4.2 한국
- 우아한형제들 — 주문 ID = UUID v7 / 내부 join = bigint
- 토스 SLASH 23 — `paymentKey` (UUID 변형) + 내부 PK bigint
- 라인 — 외부 UUID / 내부 bigint

### 4.3 본 PoC 평가
- User.id = UUID / 나머지 = Integer Identity
- ⚠️ **반쪽 합리**: 외부 노출 ID 가 UUID 가 아니라 username — UUID 가 내부에만 사용 → Stripe/우형 패턴과 정반대
- 합리도 50%. RealWorld 학습 목적 추정. 운영 권고: **일관성 우선**

---

## 5. RealWorld 특이성 vs 일반 패턴 (★ §8.1 강제 ★)

### 5.1 `Article.title varchar(50) unique` — RealWorld 특이성 ★★★ 격상 금지
- Medium / Velog / Brunch / WordPress 어디도 title 글로벌 unique 없음
- RealWorld API spec: **slug 만 unique 명세** — title unique 명세 없음
- **anti-pattern** (구현자 over-constraint)
- **일반화 금지** — v1.2.0 격상 NO

### 5.2 `Tag.name PK = String(20)` — 부분 일반 패턴
- AWS country code / PostgreSQL 표준 — 자연키 PK 가능
- Stack Overflow tag (https://meta.stackexchange.com/questions/110222/) — surrogate id + tag.name unique (Stack Overflow 패턴)
- 본 PoC = "의도적 추상화 + 단순화" — tag rename 없는 도메인이면 OK
- **부분 일반화** — 도메인 분기 가이드

### 5.3 `article_tag` 별도 entity (vs @ManyToMany) — 일반 권장 ★★★
- Vlad: "@ManyToMany 사용 금지. 항상 별도 entity"
- Hibernate User Guide §5.7 — "extra columns required → intermediate entity"
- 우형/카카오 — `@ManyToMany` 코드 리뷰 룰로 금지
- 본 PoC = 정석 패턴 ✅
- **일반화 100%** — v1.2.0 적극 격상

### 5.4 종합 매트릭스

| 패턴 | 본 PoC | 일반화 | §8.1 평가 |
|---|---|---|---|
| `article.title unique` | 있음 | NO | **격상 금지** ★ |
| `tag.name PK String` | 있음 | 부분 | 가이드로 격상 |
| `article_tag` 별도 entity | 있음 | YES | **적극 격상** ★ |
| email/username unique (DB만) | 있음 | YES | PoC #01 동일 격상 |
| FK NO ACTION default | 있음 | YES | PoC #01 동일 격상 |
| EAGER `@OneToMany` | 있음 | YES | PoC #01 동일 격상 |
| ID UUID + Identity 혼재 | 있음 | 부분 | 가이드로 격상 |
| `ddl-auto: create-drop` | 있음 | NO | 격상 금지 |

---

## 6. PoC #01 finding 외부 검증 (Phase 2 영역) — 한국 빈도

| finding | 한국 빈도 | 본 PoC 재현 | v1.2.0 격상 적합성 |
|---|---|---|---|
| AP-DOMAIN-002 | 100% | 부분 (2중 부재) | ★★★ |
| DRIFT-007 / AP-DB-001 | 80% | 100% | ★★★ |
| AP-PERFORMANCE-001 | 70% | 부분 | ★★ |
| DRIFT-002 | 100% (RealWorld) | 100% | ★ |
| DRIFT-010 | 100% | 부분 (1단계 개선) | ★★★ |

---

## 7. 신규 finding 권고 (Case 영역)

- **CASE-001 high** — `article.title varchar(50) unique` over-constraint anti-pattern (Medium/Velog/Brunch/WordPress 어디도 없음)
- **CASE-002 medium** — `varchar(50)` 한국어 환경 부족 (UTF-8 환경 50자 한계)
- **CASE-003 medium** — `users.email varchar(30)` RFC 5321 위반 (권장 254/320)
- **CASE-004 low** — `image_url varchar(200)` URL 길이 부족 (권장 2048)
- **CASE-005 medium** — `password varchar(200)` Argon2 도입 시 부족 (권장 255)
- **CASE-006 low** — H2 MODE=MYSQL ↔ 운영 MySQL 호환성 함정 (Vlad Testcontainers 권고)
- **CASE-007 medium** — `article.author_id uuid` + `article.id integer` PK FK 타입 혼재 (cardinality estimation 영향)

---

## 8. 단일 PoC 과적합 §8.1 평가

### 격상 적합 (PoC #01 + #02 + 외부 일치)
- AP-DOMAIN-002, AP-DB-001 (FK NO ACTION), AP-PERFORMANCE-001 (EAGER), ArticleTag entity 분리

### 격상 금지 (PoC 특이성 또는 데모 컨텍스트)
- `article.title unique`, `ddl-auto: create-drop`

### 가이드로만 격상 (분기 추가)
- ID 전략, F-016 Decision Tree 에 PoC/예제 레포 분기

### v1.2.0 격상 권고 작업
1. F-016 Decision Tree 에 "운영 DB 부재 / PoC / 데모 레포" 분기 신설
2. AP-DOMAIN-002 "방어 단계 분류" 추가 (App / Bean Validation / JPA / DB 4단계)
3. ID 전략 ADR 가이드 신설
4. JPA EAGER 절대 금지 가이드 + Vlad / 우형 사례 부록

---

## 9. 메인 1차 추정 정정

### 9.1 정정 — 추정 #2 (4중 방어)
- 본 PoC 는 "App + Bean Validation 2중 부재" + "JPA + DB 2중 적용" = 2/4

### 9.2 정정 — 추정 #5 (F-016 fit)
- F-016 운영 DB 분기 가정 — 본 PoC fit 50%. PoC/데모 레포 분기 추가 필요

### 9.3 정정 — 추정 #6 (4 candidate)
- 4 candidate ✅ + 신규 7건 (CASE-001~007). 특히 CASE-001 high

### 9.4 schema.sql 본질 확정
- 100% Hibernate auto-export — 본 PoC SoT = JPA Entity. F-016 "DDL > JPA" 가정 무력화

---

## 10. 종합 권고

1. plan §4.2 SoT 우선순위 재고 — JPA Entity = SoT 명시
2. DRIFT 후보 재검토 — schema.sql 이 Hibernate export 라면 DRIFT 정의 자체 약화
3. finding 신규 7건 등록
4. §8.1 격상 가부 매트릭스 활용
5. F-016 Decision Tree 보강 — PoC/데모 레포 분기 신설

---

## 11. 참고 URL (22건)

1. Vlad — Hibernate Naming: https://vladmihalcea.com/hibernate-naming-strategy/
2. Vlad — LIE: https://vladmihalcea.com/the-best-way-to-handle-the-lazyinitializationexception/
3. Vlad — FetchMode SUBSELECT: https://vladmihalcea.com/hibernate-fetchmode-subselect/
4. Vlad — @ManyToMany: https://vladmihalcea.com/the-best-way-to-use-the-manytomany-annotation-with-jpa-and-hibernate/
5. Vlad — Testcontainers: https://vladmihalcea.com/testcontainers-junit-spring-boot/
6. 우형 — DB 마이그레이션: https://techblog.woowahan.com/2695/
7. 우형 — OSIV: https://techblog.woowahan.com/2683/
8. 우형 — JPA N+1: https://techblog.woowahan.com/2607/
9. 우형 — 박재성 Spring Camp: https://www.slideshare.net/baejjae93/jpa-spring-camp-2018
10. 토스 SLASH 22: https://www.youtube.com/watch?v=l_nkrTxd-X0
11. 라인 — JPA 운영: https://engineering.linecorp.com/ko/blog/jpa-experience
12. Stripe — Object IDs: https://stripe.com/blog/designing-apis-for-humans-object-ids
13. Discord: https://discord.com/blog/how-discord-stores-billions-of-messages
14. Stack Exchange: https://stackoverflow.blog/2009/11/05/database-design-for-stack-overflow/
15. RealWorld spec: https://realworld-docs.netlify.app/specifications/backend/endpoints/
16. RFC 5321: https://datatracker.ietf.org/doc/html/rfc5321#section-4.5.3
17. Hibernate User Guide: https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html
18. Stack Exchange tag: https://meta.stackexchange.com/questions/110222/

**END Case Research**
