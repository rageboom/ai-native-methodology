# Plan — PoC #02 Phase 2 (db / DB + 정합성 검증)

> 작성일: 2026-04-29
> 작성자: Claude (메인) — 4원칙 1원칙 (깊은 숙지 → plan)
> 대상 레포: `1chz/realworld-java21-springboot3` (HEAD `93e018e`, Spring Boot 3.3.0 / Java 21)
> Phase 1 인계: raw confidence 0.93 / finding 6건 (F-042~F-047) / multi-module Hexagonal naming hybrid
> 본 plan 은 **메인 사전 raw fetch 결과 풍부 → sub-agent 에는 단언 없이 cross-check 의무 형식으로 전달** (F-044 교훈 반영)

---

## 0. 진입 컨텍스트

### Phase 1 인계 핵심

- **multi-module 구조** 확정: `module/core` (도메인 + Repository port) / `module/persistence` (JPA Adapter) / `server/api` (Controller + Security)
- **architecture_style_candidates** Phase 1 cap 0.65 — Phase 3 에서 확정 (Phase 2 는 영향 없음)
- **ground truth 강도 ** — `module/persistence/src/main/resources/schema.sql` 직접 제공 (DDL 문서)
- Phase 1 finding 중 Phase 2 영역: F-047 (orm secondary 가이드) low — 본 phase 에서 영향 미미

### Auto Mode 활성

- 윤주스 명시 → 4원칙 사이클 자율 진행
- 본 plan 작성 후 2원칙 (sub-agent 3종 spawn) 자율 진입
- 3원칙 (사용자 승인) 은 plan + research 통합 후 일괄 게이트

---

## 1. 작업 범위 (Phase 2 명세 §1~§9 매핑)

| 명세 항목          | 산출                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| §1 목적            | DB 영역 단일 통합 스키마 + 출처 간 정합성 검증                                  |
| §3.1/§3.2 추출     | schema.sql + ORM (메인 추출) — 두 출처 비교                                     |
| §3.3 정합성 비교   | 테이블/컬럼/타입/NULL/FK/index/default 7항목                                    |
| §3.4 통합 우선순위 | Decision Tree Q1=No / Q2=No → **DDL 파일 > ORM > ERD** (운영 DB 부재)           |
| §4.1 출력 4~5종    | schema.json / schema.sql / erd.mermaid / 정합성-검증-보고서.md / \_manifest.yml |
| §5 승인 게이트     | 7 항목 체크리스트                                                               |
| §6 신뢰도          | 입력 조합 (DDL + ORM, 운영 DB/ERD 부재) → 0.85~0.95 예상                        |
| §7 후속 phase 연계 | Phase 3 (모듈↔테이블 매핑) + Phase 4 (5.A DB 영역) + Phase 6 (drift→안티패턴)   |

---

## 2. 입력 출처 분석 (메인 raw fetch 결과)

### 2.1 출처 매트릭스

| 출처                  | 존재 | 위치                                                                   | 신뢰도 기여 |
| --------------------- | ---- | ---------------------------------------------------------------------- | ----------- |
| ORM 메타 (소스 코드)  | ✅   | `module/core/src/main/java/io/zhc1/realworld/model/*.java` (7 @Entity) | 70% (필수)  |
| Migration 파일        | ❌   | (Flyway/Liquibase 미사용)                                              | 0           |
| DDL 파일 (schema.sql) | ✅   | `module/persistence/src/main/resources/schema.sql` (98 줄, 7 테이블)   | +15%p       |
| ERD 문서              | ❌   | (별도 ERD 미제공)                                                      | 0           |
| 운영 DB 메타          | ❌   | (H2 in-memory, 운영 DB 없음)                                           | 0           |
| **합계 (예상)**       |      |                                                                        | **0.85**    |

### 2.2 입력 신뢰도 caveat

- DDL 파일 = ground truth (Hibernate 자동 생성 가능성? — schema.sql 의 FK constraint 명 `fkmjgtny2i22jf4dqncmd436s0u` 패턴은 **Hibernate auto-generated** 시그널. 즉 schema.sql 자체가 ORM 에서 추출됐을 가능성)
- 본 PoC 의 `ddl-auto: create-drop` (persistence application.yaml) 은 startup 마다 schema 재생성. schema.sql 의 역할은 H2 init script 가능성 검증 필요 (sub-agent Document 의무).
- → **출처 2종 (DDL + ORM) 이지만 하나가 다른 하나에서 파생됐을 가능성**: 진짜 정합성 검증은 어려움. 다만 Phase 3/6 연계에는 그대로 사용 가능.

---

## 3. 변경 대상 (생성 파일)

```
ai-native-methodology/examples/poc-02-realworld-springboot3/output/db/
├── schema.json                      # 신규 (스키마 schema/db.schema.json 정합)
├── schema.sql                       # 신규 (통합 — DDL > ORM)
├── erd.mermaid                      # 신규 (Mermaid ERD)
├── 정합성-검증-보고서.md             # 신규 (DDL ↔ ORM 비교 — 출처 caveat 명시)
└── _manifest.yml                    # 신규 (신뢰도 + 결정 + KPI)
```

---

## 4. 메인 사전 발견 (raw fetch — sub-agent cross-check 의무)

> **F-044 교훈**: 메인이 단언으로 sub-agent prompt 에 포함하면 안 됨. 아래는 **메인 1차 추정** 표시. sub-agent 가 직접 read 로 cross-check.

### 4.1 7 테이블 / 7 @Entity 매핑 (1차 추정)

| 테이블 (schema.sql) | @Entity 클래스         | 1차 매핑                                                                  |
| ------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `users`             | `User.java`            | ✅ (`@Table(name="users")`)                                               |
| `article`           | `Article.java`         | ✅                                                                        |
| `article_comment`   | `ArticleComment.java`  | ✅                                                                        |
| `article_tag`       | `ArticleTag.java`      | ✅ (junction entity, `@Table(name="article_tag", uniqueConstraints=...)`) |
| `article_favorite`  | `ArticleFavorite.java` | ✅                                                                        |
| `tag`               | `Tag.java`             | ✅ (자연키 PK = `name varchar(20)`)                                       |
| `user_follow`       | `UserFollow.java`      | ✅                                                                        |

### 4.2 PoC #01 finding 본 환경 검증 (Phase 2 영역) — 1차 결론

| PoC #01 ID                        | 제목                                      | 1차 결론 (메인 raw fetch)                                                                                               | 검증 의무 (sub-agent)                           |
| --------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **AP-DOMAIN-002** (high promoted) | email/username unique 3중 부재            | ✅ **본 환경 4중 방어 재현** (DB unique + JPA `@Column unique=true` + App 생성자 검증)                                  | sub-agent 직접 read 로 확인                     |
| **DRIFT-002** (closed → BR)       | 단방향 follow                             | ✅ **본 환경 비재현** (`user_follow` 테이블 + UniqueConstraint(follower, following) — UQ 가 단방향 강제, schema.sql:58) | sub-agent 직접 read 로 확인                     |
| **DRIFT-007** (closed → AP)       | NO ACTION FK 정책                         | ⚠️ schema.sql 의 모든 FK 가 `ON DELETE` 미명시 (= H2 default = NO ACTION). PoC #01 과 같은 패턴 재현.                   | sub-agent (Senior) 가 H2 default 정책 확인      |
| **DRIFT-010** (high → 4 BR/AP)    | email/username unique App+DB+JPA 3중 부재 | (= AP-DOMAIN-002 와 동일)                                                                                               | (위와 동일)                                     |
| F-016 (closed)                    | ddl-auto 통합 우선순위 가이드             | ✅ **명세 §3.4 v1.1.2 적용 가능** — 본 PoC 는 Decision Tree Q1=No/Q2=No → DDL>ORM>ERD                                   | sub-agent (Document) Decision Tree fit 검증     |
| F-018 (deferred)                  | (Phase 2 영역 finding 회수 시 검증)       | (Phase 1 검증 미정 — 본 plan 에서 ID 정리)                                                                              | sub-agent 가 deferred 13건 중 Phase 2 영역 식별 |

### 4.3 Phase 6 candidate 신규 후보 (메인 사전 추정)

| 후보 ID (임시) | 제목                                                                                 | 시그널                                                                | severity 1차                          |
| -------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------- |
| `PF-P2-001`    | Article EAGER fetch (FetchType.EAGER)                                                | `Article.java:49 @OneToMany(... fetch=FetchType.EAGER)` — articleTags | medium (Phase 6 합산)                 |
| `PF-P2-002`    | Article.titleToSlug 단순 구현 (한글/유니코드 미처리)                                 | `Article.java:57 title.toLowerCase().replaceAll("\\s+", "-")`         | low (RealWorld spec 제약 caveat)      |
| `PF-P2-003`    | ID 전략 혼재 (User=UUID / 나머지=Identity) ADR 부재                                  | User.java:25-27 vs 나머지 6 엔티티                                    | low (의도된 설계 가능성 — caveat)     |
| `PF-P2-004`    | schema.sql 의 FK 제약명 Hibernate auto-generated (예: `fkmjgtny2i22jf4dqncmd436s0u`) | schema.sql:74-97                                                      | low (스키마 추출 출처 의존성 finding) |

→ **F-021 임계 모니터링**: Phase 1 6건 + Phase 2 4 후보 = 10건 (건강 범위 5~15 정합).

---

## 5. sub-agent 리서치 토픽 (2원칙)

### 5.1 Document Researcher

- **공식 docs / RFC / 표준 spec 조사**:
  - Hibernate 6 / Jakarta Persistence 3.x — `@Entity` / `@Column(unique=true)` / `@Table(uniqueConstraints)` 의 schema 생성 동작
  - H2 Database `MODE=MYSQL` — FK ON DELETE default 정책
  - Spring Boot 3.3 `spring.jpa.hibernate.ddl-auto` enum (`create-drop` 의 schema.sql 처리 — `import.sql` / `data.sql` / `schema.sql` 의 우선순위)
  - Hibernate FK 제약명 auto-generation 규칙 (PF-P2-004 검증)
  - Phase 2 명세 §3.4 Decision Tree Q1=No/Q2=No 분기의 우선순위 정합성
- **PoC #01 finding cross-validation**:
  - F-016 (Decision Tree v1.1.2) 본 PoC fit 검증
  - F-007 (inventory schema) 의 db.schema.json 정합 검증
- **산출**: `.claude/researches/document-phase2-poc02.md`

### 5.2 Case Researcher

- **테크기업 사례 조사**:
  - Netflix / 우아한형제들 / 카카오 / 토스 — JPA `@Entity` + DDL 파일 병행 vs 단일 출처 패턴
  - schema.sql + ddl-auto=create-drop 운영 사례 (테스트 한정 vs 운영)
  - **AP-PERFORMANCE-001 (EAGER N+1)** 의 한국 사례 재현/완화 — open-in-view=false 결합 효과
  - ID 전략 혼재 (UUID vs Identity) ADR 사례
- **단일 PoC 과적합 회피 §8.1 강제 적용**:
  - 본 PoC 의 schema 패턴이 일반 사례인지 RealWorld 특이성인지 분별
- **산출**: `.claude/researches/case-phase2-poc02.md`

### 5.3 Senior BE Engineer (Spring/JPA/H2 도메인 적응)

- **함정 / 실패 패턴 검증**:
  - schema.sql 출처 의존성 (Hibernate `hbm2ddl.create_to_file` 추출 vs 수동 작성) — 출처 검증 절차
  - `@Column(unique=true)` 의 운영 schema 영향 (production migration 도구가 받아주는가)
  - EAGER fetch + open-in-view=false 결합의 실제 N+1 양상 (transactional boundary)
  - `Article.title varchar(50) unique` 글로벌 unique 의 도메인 의미 / scaling 한계
  - `Tag.name PK = String(20)` 자연키 패턴의 함정 (rename, locale 등)
- **메인 1차 추정 검증**:
  - PF-P2-001~004 severity / status 권고
  - AP-DOMAIN-002 본 환경 4중 방어 진위 (Hibernate `unique=true` 가 실제 DB 에 UQ 만들지 검증 — application.yaml `ddl-auto=create-drop` + schema.sql 조합 효과)
  - DRIFT-007 (NO ACTION FK) H2 default 검증
- **산출**: `.claude/researches/senior-phase2-poc02.md`

### 5.4 sub-agent prompt 공통 의무 (F-044 교훈)

- 메인 사전 raw fetch 결과는 **"메인 1차 추정"** 으로 명시 전달
- sub-agent 는 직접 파일 read 로 cross-check 의무 (F-015 패턴)
- 정정 사실 발견 시 보고 (PF-P2-005 신규 finding 후보로 등록 가능)

---

## 6. 영향도 / 리스크 / Caveat

### 6.1 영향도

| 영역               | 영향                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Phase 3 (arch)     | 모듈↔테이블 매핑 입력 — `module/core` 7 테이블 vs `module/persistence` Adapter 11 클래스 |
| Phase 4 (도메인)   | 7 Entity → Aggregate 후보 (Article / User / Tag) 식별 입력                               |
| Phase 6 (안티패턴) | EAGER N+1 / titleToSlug / FK 제약명 자동생성 / ID 전략 혼재 — 4 candidate                |
| 방법론 본체        | F-016 Decision Tree 본 PoC fit 외부 검증 (closed 항목 안정성 데이터)                     |

### 6.2 리스크

| 리스크                                                                   | 대응                                                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| schema.sql 가 ORM 에서 자동 추출됐을 가능성 → "정합성 검증" 의 의미 약화 | 정합성-검증-보고서.md 에 caveat 명시 + 명세 §3.2 다중 출처 가정 한계 finding 등록 가능 |
| `ddl-auto=create-drop` + `schema.sql` 의 처리 순서 문서 의존             | Document sub-agent 가 Spring Boot 3.3 docs 직접 인용                                   |
| AP-DOMAIN-002 4중 방어 추정이 actual H2 행동과 다를 가능성               | Senior sub-agent 가 H2 + Hibernate 6 + `MODE=MYSQL` 조합 검증                          |
| 단일 PoC 과적합 (§8.1)                                                   | sub-agent Case 가 한국/글로벌 사례 합산으로 일반화 검증                                |

### 6.3 명시적 Caveat

- 본 phase 의 신뢰도 0.85 예상 (운영 DB / ERD / Migration 부재)
- 정합성 검증 보고서는 "출처 2종이지만 의존성 가능성" 명시
- Phase 6 후보 4건은 본 phase 산출이 아닌 \_manifest.yml 의 finding 섹션에 기록 (Phase 6 본격 분석 전 candidate)

---

## 7. 산출물 체크리스트 (Phase 2 명세 §5)

- [ ] schema.json schema 검증 통과 (`schemas/db.schema.json`)
- [ ] erd.mermaid 렌더링 검증
- [ ] 모든 테이블 (7) PK 명시
- [ ] FK (9) 명시 + ON DELETE 정책 caveat
- [ ] 정합성 검증 보고서 — 출처 2종 (DDL + ORM) 비교 + 의존성 caveat
- [ ] severity=high 항목 사용자 결정 — 예상 0건 (본 환경 비재현 우세)
- [ ] 통합 우선순위 정책 명시 (DDL > ORM, 운영 DB/ERD 부재)
- [ ] 신뢰도 산정 (raw 0.85 예상 / element 별 분해)
- [ ] finding 4 candidate 정식 등록 (Phase 6 합산 대비)
- [ ] PROGRESS-poc02-phase2.md 시간순 로그

---

## 8. 다음 단계 (4원칙 사이클)

1. ✅ 1원칙 — 본 plan 완성
2. ⏳ 2원칙 — sub-agent 3종 병렬 spawn (Document / Case / Senior) → research-phase2-poc02.md 통합
3. ⏳ 3원칙 — 사용자 승인 게이트 (plan + research 통합 검토)
4. ⏳ 4원칙 — 4단계 산출 + finding 정식 등록
5. ⏳ Phase 2 마감 → Phase 3 (arch) 인계

---

## 9. 참조

- 명세: `methodology-spec/workflow/phase-2-db.md` (v1.1.2)
- 스키마: `schemas/db.schema.json`
- 템플릿: `templates/db.template.{json,md}`
- 선행 PoC #01 산출: `examples/poc-01-realworld-spring/output/db/`
- Phase 1 인계: `examples/poc-02-realworld-springboot3/output/inventory/_manifest.yml`
- Phase 1 finding: `examples/poc-02-realworld-springboot3/findings/poc-findings.md` (F-042~F-047)

---

**END OF plan-phase2-poc02.md**
