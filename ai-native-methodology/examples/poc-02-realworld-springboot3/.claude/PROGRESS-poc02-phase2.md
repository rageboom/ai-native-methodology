# PROGRESS — PoC #02 Phase 2 (db / DB + 정합성 검증)

> 시간순 로그 대전제 (feedback_progress_log.md) 적용

---

## T+0 (2026-04-29) — Phase 2 진입 + 1원칙 plan 작성 ✅

### 진입 컨텍스트
- Phase 1 ✅ 종료 (raw confidence 0.93 / finding 6건 F-042~F-047)
- 분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
- Auto Mode 활성 (윤주스 명시) → 4원칙 사이클 자율 진행
- v1.1.2 Phase 2 명세 §3.4 Decision Tree 적용 대상

### 메인 사전 raw fetch (F-015 + F-044 패턴)
- ✅ schema.sql (98 줄, 7 테이블, 9 FK)
- ✅ application.yaml (persistence + api 양쪽)
- ✅ 7 @Entity (User/Article/ArticleComment/ArticleTag/Tag/UserFollow/ArticleFavorite) 직접 read

### 메인 1차 추정 (sub-agent cross-check 의무 — F-044)
- 7 테이블 / 7 @Entity 1:1 매핑 추정
- AP-DOMAIN-002 본 환경 4중 방어 재현 추정 (DB unique + JPA `@Column unique=true` + App 검증)
- DRIFT-002 (단방향 follow) 본 환경 비재현 추정 (UQ(follower, following) 강제)
- DRIFT-007 (NO ACTION FK) 본 환경 재현 추정 (H2 default 의존)
- F-016 (Decision Tree v1.1.2) Q1=No/Q2=No → DDL>ORM>ERD 적용 추정
- 4 신규 candidate (PF-P2-001~004): EAGER fetch / titleToSlug 단순 / ID 전략 혼재 / FK 제약명 auto-gen

### 1원칙 — plan-phase2-poc02.md 작성 ✅
- 산출: `.claude/plans/plan-phase2-poc02.md` (~330 줄)
- 9 섹션 (진입 컨텍스트 / 작업 범위 / 입력 출처 / 변경 대상 / 메인 사전 발견 / sub-agent 토픽 / 영향도 / 산출물 체크리스트 / 다음 단계)
- F-044 교훈 반영: sub-agent prompt 에 "메인 1차 추정 + cross-check 의무" 형식 명시
- 단일 PoC 과적합 §8.1 강제 명시

### 다음 액션
- ⏳ 2원칙 — sub-agent 3종 병렬 spawn 전 사용자 승인 게이트
- 사용자 검토 후 Document / Case / Senior 동시 spawn

---

## T+1 (2026-04-29) — 3원칙 사용자 승인 + 2원칙 sub-agent 3종 병렬 spawn ✅

### 3원칙 게이트 (Phase 2 진입 전 1차)
- 윤주스: "승인" → 2원칙 진입

### 2원칙 — sub-agent 3종 병렬 spawn (백그라운드 실행 중)

| Agent | prompt 핵심 | 산출 (예상) |
|---|---|---|
| Document Researcher | Hibernate 6 / Jakarta / H2 MODE=MYSQL / Spring Boot 3.3 ddl-auto+schema.sql 처리 / Phase 2 명세 §3.4 Decision Tree fit / PoC #01 finding cross-validation | 본문 인라인 (메인 직접 저장) |
| Case Researcher | Netflix/우형/카카오/토스 — JPA+DDL 병행 / EAGER+open-in-view=false 사례 / ID 전략 ADR / 단일 PoC 과적합 §8.1 강제 / RealWorld 특이성 분별 | 본문 인라인 |
| Senior BE Engineer | schema.sql 출처 의존성 / @Column(unique=true) 운영 영향 / EAGER 함정 / titleToSlug 함정 / Tag 자연키 함정 / ID 전략 혼재 / 메인 1차 추정 정정 의무 (F-044 패턴) | 본문 인라인 |

### F-044 교훈 prompt 적용
각 sub-agent prompt 의 §메인 1차 추정 섹션에 명시: **단언 아님 — cross-check 의무**. 메인의 6 추정 (schema.sql 출처 / AP-DOMAIN-002 4중 방어 / DRIFT-002 비재현 / DRIFT-007 재현 / F-016 fit / 4 candidate) 모두 직접 read + 공식 docs / 사례 기반 검증 의무.

### 다음 액션
- ⏳ sub-agent 3종 완료 대기
- ⏳ 결과 통합 + 충돌 해소 + research-phase2-poc02.md 작성

---

## T+2 (2026-04-29) — sub-agent 3종 완료 + research 통합 ✅

### sub-agent 산출
- Document: `.claude/researches/document-phase2-poc02.md` (~250 줄)
- Case: `.claude/researches/case-phase2-poc02.md` (~270 줄)
- Senior: `.claude/researches/senior-phase2-poc02.md` (~340 줄)

### F-015 + F-044 결과
- 메인 1차 추정 6건 정합 매트릭스: 정합 4 / 정정 2 (#2 4중→race-safe 1중 / #5 fit→부분 + 명세 한계)
- Senior 신규 발견 (메인 미식별) **3건**: PF-P2-005 critical ★ / PF-PHASE2-META-001 high ★ / PF-P2-006 low
- F-044 패턴 강한 외부 검증 1건 추가

### 충돌 해소
- AP-DOMAIN-002 framework: Senior race-safe vs race-prone 채택
- DRIFT-007: Senior stack-conditional caveat 채택
- F-016 fit: Senior Q3 누락 명세 finding 격상 채택

### research-phase2-poc02.md 통합 ✅
- 3-합의 6영역 / 3-충돌 3영역 정리
- PoC #01 finding 외부 검증 종합 (closed F-016 명세 한계 ★ / promoted 4건 비재현 + 1건 재현 강함)
- §8.1 격상 매트릭스 (격상 적합 5 / 금지 2 / 가이드 2)
- 6 핵심 결정 (DEC-PHASE2-POC02-001~006)
- 11 finding 등록 표

---

## T+3 (2026-04-29) — 3원칙 사용자 승인 ✅ + 사용자 질의 ★

### 3원칙 게이트
- 윤주스 추가 질의: "TagJpaRepository 이게 뭐야?" → 메인 답변 (TagJpaRepository.java 직접 read + 사용처 grep + 함정 설명)
- 윤주스: "진행 해줘" → 6 핵심 결정 (DEC-PHASE2-POC02-001~006) 일괄 승인 + 4단계 진입

### Auto Mode 자율 적용
- DEC-001 schema.sql ORM derivative caveat
- DEC-002 race-safe vs race-prone framework
- DEC-003 PF-PHASE2-META-001 high promoted
- DEC-004 F-048 critical 즉시 등록
- DEC-005 raw confidence 0.85
- DEC-006 11 finding 등록

---

## T+4 (2026-04-29) — 4단계 산출 5종 ✅

### output/db/ 5종 작성

| 파일 | 분량 | 핵심 |
|---|---|---|
| `schema.json` | ~300 줄 | db-schema.schema.json 정합 + sources_used `orm` 단일 + caveat (schema_sql_origin) + human_review_required 3건 (origin / META-001 / F-048) + comparison_with_poc_01.schema_deltas |
| `schema.sql` | ~115 줄 | Hibernate auto-generated 캡쳐본 + caveat 헤더 (DEC-001 명시) + 11 finding 라인 코멘트 |
| `erd.mermaid` | ~75 줄 | Mermaid erDiagram (7 테이블 + 9 FK + 6 UQ) + 사용자 노트 + PoC #01 비교 |
| `정합성-검증-보고서.md` | ~190 줄 | 출처 의존성 caveat 보고서 형태 (drift 0건 / 비교 의미 없음) + Hibernate hash 알고리즘 결정적 증거 + PoC #1 외부 검증 종합 |
| `_manifest.yml` | ~190 줄 | 신뢰도 0.85 + 6 핵심 결정 + DRIFT 0 caveat + Phase 3/4/6 인계 + 11 finding + 누적 통계 |

### 메인 deterministic 측정
```bash
# schema.sql 통계
- 총 98 줄 / 7 테이블 / 9 FK / 6 UQ (3 명시 UQ + 3 inline column UQ)
- 모든 FK 제약명 fk + 25자 base35 lowercase = Hibernate NamingHelper 패턴
```

---

## T+5 (2026-04-29) — finding 등록 ✅

### findings/poc-findings.md 갱신

11 신규 finding 등록 (F-048~F-058):
- F-048 critical ★ — TagJpaRepository<Tag, Integer> 타입 오류 (Senior 직접 발견 / F-044 패턴 재현)
- F-049 high ★ — v1.1.2 §3.4 Decision Tree Q3 누락 (closed F-016 명세 한계)
- F-050 high — schema.sql ORM derivative 정합성 검증 의미 약화
- F-051 high — Article EAGER + Specification + Pageable HHH000104
- F-052 high — article.title varchar(50) unique over-constraint (§8.1 caveat)
- F-053 medium — titleToSlug 8가지 함정
- F-054 medium — email RFC 5321 위반
- F-055 medium — varchar(50) 한국어 부족
- F-056 medium — password Argon2 부족
- F-057 medium — UUID + Integer PK 혼재
- F-058 low — TOCTOU race-prone (educational)

### 누적 통계 갱신
```yaml
poc_02_total: 17  (Phase 1 6 + Phase 2 11)
cumulative_total: 50  (PoC #1 33 + PoC #2 17)
cumulative_promoted: 20
v120_bundles: 9  (I 신규 또는 H 흡수)
```

### PoC #1 finding 외부 검증 종합
- closed 안정성: 4/4 — **F-016 첫 외부 검증 한계 발견 ★**
- promoted: 4건 비재현 (개선) + 1건 재현 강함 (F-051 격상)
- deferred: 1건 정정 권고 (F-017 best practice 사례)

---

## Phase 2 종료 — 신뢰도 자평 (formula v1)

```
raw confidence: 0.85
- base 0.75
- inputs_used: source_code + orm = 2 modifier
- subtotal raw 0.85 (schema.sql ORM derivative 이므로 +0.10 보정 안 함)
- weighted_average 0.85 (consistency_check 0.50 으로 평균 ↓)
- cap_applied: false
```

명세 §6 의 "테이블/컬럼 식별 소스만 0.85" 정확 적용. 운영 DB / Migration / ERD 부재 ✅ caveat.

### Phase 2 KPI 평가 ✅

- ✅ finding 11건 신규 등록 (목표 5~15 건강 범위 정합)
- ✅ schema 검증 통과 (db-schema.schema.json)
- ✅ 6 핵심 결정 (DEC-PHASE2-POC02-001~006) — Auto Mode 자율 적용
- ★ F-048 critical 즉시 발견 — Senior 직접 read (F-044 패턴 재현)
- ★ F-049 메타 finding — v1.1.2 closed 항목 (F-016) 첫 외부 검증 한계 노출
- ★ F-050 schema.sql ORM derivative — 출처 의존성 분별 절차 신설 권고
- ✅ AP-DOMAIN-002 race-safe vs race-prone framework — v1.2.0 묶음 D 가이드 강화

---

## 다음 단계 (Phase 3 인계)

1. **Phase 3 (arch) 진입** — Auto Mode 자율 가능
2. 핵심 분석:
   - module 의존성 방향 검증 (compileOnly / runtimeOnly 효과)
   - Hexagonal naming hybrid (Phase 1 cap 0.65) 확정
   - *RepositoryAdapter ↔ *Repository (port) 패턴 검증
   - **F-048 architecture 영향** — TagRepositoryAdapter 의 module 경계 검증 시 합산
   - **F-051 architecture 영향** — ArticleSpecifications 가 module/persistence 에 위치한 의도 검증
3. AP-ARCH-001/002 (PoC #01 LV-001/LV-002) multi-module 컴파일 차단 비재현 검증
4. F-023 (closed) circular_dependencies 보강 외부 검증

---

**END OF PROGRESS-poc02-phase2.md (Phase 2 ✅ 완료)**

---

**END (Phase 2 진행 중 — T+0 plan ✅)**
