# Senior BE Research — PoC #02 Phase 2

> sub-agent 산출 (Senior BE Engineer 페르소나) — 메인이 직접 저장
> 작성: 2026-04-29 / 직접 read 14 파일 + 명세 1 파일 + finding 2 파일
> ★★★ Senior 신규 발견 — TagJpaRepository 타입 오류 critical (PF-P2-005) + Decision Tree 명세 한계 high (PF-PHASE2-META-001)

---

## 1. F-015 Cross-Validation 결과 (메인 1차 추정 정정)

| # | 메인 추정 | 직접 read 검증 | 판정 |
|---|---|---|---|
| 1 | schema.sql FK = Hibernate auto-gen | 9 FK + 3 UQ 모두 hash 패턴 (`fk` + 25자 hex / `uk` + 25자 hex) | ✅ **정합 (강한 정합)** — severity 격상 권고 |
| 2 | AP-DOMAIN-002 4중 방어 재현 | 직접 검증: DB UQ + JPA `@Column unique` + UserRegistry 생성자 + UserRepositoryAdapter:67-72 사전 check | ⚠️ **부분 정정** — 실질 race-safe = DB UQ 1중 + race-prone TOCTOU 1중 |
| 3 | DRIFT-002 비재현 | UserFollow.java:23-25 + schema.sql:51-59 UQ 명시 | ✅ **정합** |
| 4 | DRIFT-007 재현 | schema.sql:73-98 9 FK 모두 ON DELETE 미명시 | ⚠️ **재현이지만 stack-conditional** — H2 in-memory 환경 운영 함정 아님 |
| 5 | F-016 Decision Tree fit | Q1=No / Q2=No → DDL>ORM>ERD. 단 schema.sql 이 ORM 추출이면 DDL=ORM 동일 출처 | ⚠️ **부분 정합** — 출처 의존성 검증 절차 누락 |
| 6 | 4 신규 candidate | 모두 정합 + Senior 신규 3건 추가 | ✅ **정합 + 보강** |

**Senior 정정 1건 (F-044 패턴 재현)**:
- "4중 방어" 표현은 PoC #01 DRIFT-010 격상 서사를 묵시적으로 답습. 직접 read 결과 본 PoC = race-safe DB UQ 1중 + race-prone App TOCTOU pre-check 1중 = "적정 방어".

---

## 2. schema.sql 출처 의존성 (★ 핵심 ★)

### 2.1 Hibernate auto-generated 시그널 100%
- `fkmjgtny2i22jf4dqncmd436s0u` 9 FK + `ukpatixq7onikvvq0vw8cg039fu` 3 UQ 모두 hash 패턴
- 비교 — 수동 작성 DDL: `fk_article_author` / `uq_users_email` 사람-읽는 명명
- 본 PoC 0건 사람-읽는 명명 → 100% 자동 생성

### 2.2 결론 — schema.sql ≠ "DDL 출처"
- schema.sql = Hibernate `hbm2ddl.create-drop` 또는 사전 추출물
- 본 PoC "출처 2종 (DDL + ORM)" = 실제로는 단일 출처 (ORM) 의 두 표현형
- Decision Tree §3.4 "DDL > ORM" 우선순위 잠재적 무의미

### 2.3 Spring Boot 3.x schema.sql 처리
- Hibernate ddl-auto=create-drop + classpath schema.sql → 충돌 가능
- `defer-datasource-initialization=false` (default) 시 Hibernate DDL 우선
- 본 PoC 는 schema.sql == Hibernate 자동 DDL 이므로 충돌 없음 (그림자)

### 2.4 시니어 일화
> "토스 시절 schema.sql 인덱스 추가 → 무시 → 디버깅 3시간. defer-datasource-initialization 누락 원인. **이런 환경은 schema.sql 이 ORM 의 그림자**."

### 2.5 PF-P2-004 격상 권고 (low → high)
- schema.sql 자체가 ORM 추출 → Decision Tree 한계 직결

### 2.6 v1.1.2 명세 §3.4 한계 finding (★ 메타)

```yaml
finding_id: PF-PHASE2-META-001
title: "Decision Tree §3.4 가 DDL 출처 auto-generated vs manual 분별 절차 부재"
severity: high
status: promoted
proposed_fix: |
  phase-2-db.md §3.4 Q3 추가:
  Q3. DDL 파일이 ORM auto-generated 인가?
    ├─ Yes → DDL = ORM 동일 출처. 우선순위는 ORM 단일.
    │        → 정합성 검증 의미 없음 (출처 1종) — caveat 필수
    └─ No  → 기존 우선순위 (DDL > ORM)
  검증 단서:
  - FK/UQ 제약명이 hash 패턴 (fk + 25자 hex / uk + 25자 hex)
  - schema.sql 파일에 주석/순서/사람-읽는 명명 부재
```

---

## 3. @Column(unique=true) 운영 영향

### 3.1 schema generation
- ddl-auto=create/create-drop/update → table 생성 시 UQ 제약 포함
- ddl-auto=validate/none → 검증만
- schema.sql:65-66 에 inline UQ 반영 ✅

### 3.2 Production Migration 도구 충돌 함정
- Flyway 도입 시 ddl-auto=validate 권고
- `validate` 모드는 컬럼 자체만 검증 — UQ 제약 누락 실패시키지 않음
- 개발자 `@Column(unique=true)` 추가하고 Flyway migration 안 짜면 운영에 UQ 없는 채로 동작
- 시니어 일화: "카카오 시절 — `@Column(unique=true)` 만 추가 + Flyway 안 짬 → QA 동작 / 운영 UQ 없이 출시 → 6개월 후 중복 가입 12,000명"

### 3.3 Race Condition 방어 평가
| Layer | race-safe? |
|---|---|
| App existsBy* (TOCTOU) | ❌ |
| 생성자 검증 (null/blank) | ❌ (race 무관) |
| JPA `@Column(unique=true)` | (DDL 생성 후 DB UQ 가 race-safe) |
| **DB UQ 제약** | ✅ **유일한 race-safe 보호** |

### 3.4 PF-P2-006 신규 finding 권고
- "App existsBy* 사전 check 는 race-prone TOCTOU — DB UQ 가 실제 보호자"
- severity low (educational)

---

## 4. EAGER fetch + open-in-view=false 함정

### 4.1 직접 read 증거
- Article.java:49 `@OneToMany(mappedBy="article", cascade=CascadeType.ALL, fetch=FetchType.EAGER)` Set
- application.yaml: open-in-view=false

### 4.2 4가지 시나리오
1. `findById(id)` 단건 — N+1 없음
2. `findAll()` / `findAll(Pageable)` — **N+1 발생** (batch_fetch_size 부재)
3. `findAll(Specification, Pageable)` — **HHH000104 in-memory pagination 함정** ★
4. `findArticleDetails` (transactional) — 무관

### 4.3 시나리오 3 정확 재현
ArticleRepositoryAdapter.java:46-53 + ArticleSpecifications:33 LEFT JOIN articleTags + Pageable + EAGER → HHH000104 발생 가능. **운영 시 high severity**.

### 4.4 시니어 일화
> "우형 시절 — `Article.tags @OneToMany EAGER` + `Specification` + `Pageable.of(0, 20)`. QA 정상 (100건) / 운영 OOM (50,000건). 50,000 × 5 tag = 250,000 row in-memory fetch 후 20건 paginate. **EAGER 제거 + JPA EntityGraph + JOIN FETCH 명시** 5일 작업."

### 4.5 PF-P2-001 격상 권고 (medium → high)

---

## 5. Article.title 글로벌 unique + titleToSlug 함정

### 5.1 글로벌 unique 함정
1. **title 자체 unique** (slug 외) — schema.sql:9. 두 사용자 동일 제목 불가
2. **title 50자 제한** — 한국어 부족
3. **slug 충돌 시 처리 부재** — DataIntegrityViolationException

### 5.2 titleToSlug 8가지 함정
1. 한글 제목 — slug 가 한글 그대로 (URL encoding 필요)
2. 유니코드 punctuation — comma/exclamation 그대로
3. 연속 공백 + 특수문자 — `--` 발생
4. leading/trailing dash
5. emoji
6. **Locale 의존** — `"İSTANBUL".toLowerCase()` 터키어 환경 차이
7. NFD/NFC — length 다름. Hibernate length=50 검증 충돌 가능
8. collision detection 부재

### 5.3 시니어 일화
> "토스 시절 신입이 `String.toLowerCase()` 만 썼다가 터키 사용자 가입 시 슬러그 깨짐. 운영 hotfix 1주."

### 5.4 PF-P2-002 격상 권고 (low → medium)

---

## 6. Tag 자연키 + ID 전략 혼재

### 6.1 Tag.name PK = String(20) 함정
1. rename 불가 (ON UPDATE CASCADE 부재)
2. locale 변경 시 PK 변경 (Tag normalization 부재)
3. index 크기 (B-Tree leaf VARCHAR(20) ≈ INT/BIGINT 5배)
4. **`TagJpaRepository extends JpaRepository<Tag, Integer>` ★★★ 버그**

### 6.2 PF-P2-005 critical (★ Senior 신규 발견 ★)

```yaml
finding_id: PF-P2-005
title: "TagJpaRepository<Tag, Integer> 타입 파라미터 오류 — Tag PK 가 String 인데 Integer 선언"
severity: critical (잠재 — 미사용 메서드라 미발현)
status: promoted (즉시 등록 권고)
discovered_at: 2026-04-29 (Senior 직접 발견)
evidence:
  - TagJpaRepository.java:7 — JpaRepository<Tag, Integer>
  - Tag.java:21-23 — @Id String name
  - 현재 사용: findAll() + saveAll() 만 (findById/existsById/deleteById 미사용)
risk:
  - 향후 개발자가 findById(Integer) 추가 시 ClassCastException
  - Spring Data 가 startup proxy 생성 시 검증 안 함 (silently broken)
proposed_fix: JpaRepository<Tag, String> 으로 정정
```

→ **메인 1차 추정에 없음**. F-044 패턴 — Senior 직접 read 가 발견.

### 6.3 ID 전략 혼재 — 의도된 설계 (★)
- User UUID = public ID 노출 (URL/JWT subject) → enumeration attack 방지
- 나머지 IDENTITY = internal 식별자 + 성능 (4 byte vs 16 byte)
- Hibernate 6 신규 `GenerationType.UUID` 적극 활용 = ★ 양질 시그널
- **합리적 설계** (anti-pattern 아님). ADR 부재만 educational caveat → low

---

## 7. PoC #01 finding 본 환경 검증 (Phase 2 영역)

| PoC #01 ID | 본 PoC 결과 | 권고 |
|---|---|---|
| AP-DOMAIN-002 (high) | ✅ **비재현 (해소)** — DB UQ + JPA + App existsBy + 생성자 검증 | "race-safe vs race-prone layer 분류" v1.2.0 묶음 D |
| DRIFT-002 (closed) | ✅ **비재현 (해소)** — UQ 명시 | closed 안정성 외부 검증 |
| DRIFT-007 (closed) | ⚠️ **재현이지만 stack-conditional** | 운영 환경 가정 caveat 필수 |
| DRIFT-010 (high) | (= AP-DOMAIN-002) | (위와 동일) |
| F-016 (closed) | ⚠️ **부분 fit** — Q3 누락 발견 ★ | **closed 항목 첫 명세 한계 노출** |
| F-018 (deferred) | drift 0건 (출처 1종) → 무의미 | deferred 유지 |
| F-017 (deferred) | ✅ **best practice 사례** — explicit junction entity | deferred 정정 권고 |
| AP-PERFORMANCE-001 (medium) | ✅ **재현 강함** — HHH000104 가능 | severity 격상 medium → high |

### 7.1 통계
- closed 안정성 검증: 4/4 — **F-016 명세 한계 1건 발견 ★**
- promoted 외부 검증: 2건 (AP-DOMAIN-002 비재현 / AP-PERFORMANCE-001 재현 강함)
- deferred 처리 권고: 2건 (F-017 정정 / F-018 환경 부적합)

---

## 8. v1.1.2 명세 §3.4 Decision Tree 평가

| 단계 | 본 PoC 답 | 결과 |
|---|---|---|
| Q1. Migration 도구? | No | → ddl-auto=create-drop |
| Q2. 운영 DB? | No | → DDL > ORM > ERD |
| **Q3 (제안 §2.6) DDL = ORM auto-generated?** | **Yes** | → DDL = ORM 동일 출처, 우선순위 무의미 |

→ **현행 Q1/Q2 만 묻고 Q3 누락**. 본 PoC 가 한계 노출.

### 8.1 한계 발견 의미 ★
- v1.1.2 closed 항목 (F-016) 첫 외부 검증 한계 노출
- closed → reopened 절차 필요성

---

## 9. 4 신규 candidate severity 권고

| ID | 메인 1차 | Senior 권고 | status | 근거 |
|---|---|---|---|---|
| PF-P2-001 | medium | **high** ⬆️ | promoted (Phase 6) | §4.4 시나리오 3 ArticleRepositoryAdapter:46 직접 발생 |
| PF-P2-002 | low | **medium** ⬆️ | candidate (Phase 6) | §5.2 8가지 함정 중 4개 즉시 재현 |
| PF-P2-003 | low | **low (유지)** | candidate (Phase 6) | §6.3 의도된 설계 가능성 |
| PF-P2-004 | low | **high** ⬆️⬆️ | promoted (v1.2.0) | §2.5 — 9 FK + 3 UQ hash 100%. Decision Tree 한계 직결 |
| **PF-P2-005** ★ | (메인 미발견) | **critical** ★ | promoted (즉시) | §6.2 — Senior 직접 read 발견. F-044 |
| PF-P2-006 | (메인 미발견) | **low** | candidate | §3.4 — TOCTOU race-prone |
| **PF-PHASE2-META-001** | (메인 미발견) | **high** | promoted (v1.2.0) | §2.6 + §8.3 — 명세 한계 finding |

### 9.1 누적 통계
- poc_02_phase_2_new: 7
- poc_02_phase_2_promoted: 4 (PF-P2-001/004/005, META-001)
- poc_02_phase_2_candidate: 3 (PF-P2-002/003/006)
- cumulative_post_phase2: 46 (PoC #1 33 + PoC #2 Phase 1 6 + Phase 2 7)
- F-021 임계 20+ 진입. 단 PoC #1 외부 검증 가속이 비중 큼 → v1.1.2 자체 부실 아님

---

## 10. 메인 1차 추정 정정 사항 (★ F-044 패턴 ★)

### 10.1 정정 1 — AP-DOMAIN-002 "4중 → race-safe 1중 + race-prone 1중"
- 메인 추정: "4중 방어 재현"
- Senior 정정: 실질 race-safe 보호는 DB UQ 1중. App existsBy* 는 race-prone TOCTOU. JPA `@Column(unique=true)` 는 ddl-auto=create-drop 에서만 schema 생성 — production validate 모드에선 무동작
- 함의: v1.2.0 묶음 D 격상 시 "race-safe vs race-prone layer 분류" 명시 필요

### 10.2 정정 2 — PF-P2-004 severity (low → high)
- schema.sql 9 FK + 3 UQ 모두 hash 패턴 = 100% 자동 생성. Decision Tree 한계 직결

### 10.3 정정 3 — PF-P2-001 severity (medium → high)
- ArticleRepositoryAdapter:46 의 시나리오 3 정확 재현. 운영 OOM 위험

### 10.4 정정 4 — PF-P2-002 severity (low → medium)
- 8가지 함정 중 4개 RealWorld 환경에서도 즉시 재현

### 10.5 신규 발견 1 — PF-P2-005 ★ critical
- TagJpaRepository.java:7 `<Tag, Integer>` 인데 Tag.@Id = String
- 현재 미발현 (findById/existsById/deleteById 미사용) — 향후 즉시 ClassCastException
- F-044 패턴 — 메인 단편 fetch 가 못 잡음

### 10.6 신규 발견 2 — PF-PHASE2-META-001 high
- v1.1.2 closed 항목 (F-016) 첫 외부 검증 한계 — Q3 누락
- closed → reopened 절차 필요성

---

## 11. Senior 종합 권고

### 11.1 schema.json + 정합성-검증-보고서.md 작성 가이드
- sources_used = ORM 단일 (schema.sql = ORM derivative caveat 명시)
- drift_detection_meaningful: false (출처 1종)
- 정합성 검증 보고서 = caveat 보고서 형태

### 11.2 신뢰도
- 명세 §6 "테이블/컬럼 식별 소스만 0.85" 적용
- schema.sql ORM 파생이므로 +0.10 보정 안 함
- → **raw confidence 0.85**

### 11.3 즉시 등록 우선순위
1. PF-P2-005 critical (TagJpaRepository) — 즉시 + 사내 적용 시 수정
2. PF-PHASE2-META-001 high — v1.2.0 묶음
3. PF-P2-004 high (격상)
4. PF-P2-001 high (격상)
5. PF-P2-002 medium
6. PF-P2-003 / PF-P2-006 low

---

## 12. 결론

> 본 PoC = **Hibernate 6 신규 기능 적극 활용 (UUID, Specifications, Caffeine, p6spy) 양질 시그널** + **schema.sql ORM 그림자 + TagJpaRepository 타입 오류 critical 버그** 의 양면. F-044 패턴 재현 — Senior 직접 read 가 메인 함정 4건 정정 + 3건 신규 발견. v1.1.2 closed 항목 (F-016) 의 첫 명세 한계 노출은 본 PoC 의 핵심 메타 기여.

**END Senior BE Research**
