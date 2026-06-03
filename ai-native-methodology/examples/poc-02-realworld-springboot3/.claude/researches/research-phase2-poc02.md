# Research — PoC #02 Phase 2 (3 sub-agent 통합)

> 작성: 2026-04-29 / 메인 (Claude) — 4원칙 2원칙 결산
> 입력: document-phase2-poc02.md / case-phase2-poc02.md / senior-phase2-poc02.md
> 산출: research 통합 + 충돌 해소 + 5+ 핵심 결정 도출 + 4원칙 진입 준비

---

## 0. F-015 + F-044 Cross-Validation 종합 결과

### 0.1 6 메인 1차 추정 정합 매트릭스

| #   | 메인 추정                          | Document                                | Case                                | Senior                                               | 통합 판정                                                                      |
| --- | ---------------------------------- | --------------------------------------- | ----------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | schema.sql FK = Hibernate auto-gen | ✅ 정합 (Hibernate source 인용)         | ✅ 정합 (Vlad MD5 패턴 인용)        | ✅ 정합 (강한 정합)                                  | **✅ 100% 확정** — 9 FK + 3 UQ 모두 hash 패턴                                  |
| 2   | AP-DOMAIN-002 4중 방어 재현        | ⚠️ 3중 방어 (App-side 사전 lookup 부재) | ⚠️ 2중 부재 (App + Bean Validation) | ⚠️ race-safe DB UQ 1중 + race-prone 1중              | **⚠️ 정정** — Senior framework 채택 (race-safe vs race-prone 분류가 가장 정확) |
| 3   | DRIFT-002 (단방향) 비재현          | ✅ 정합                                 | ✅ 정합 (RealWorld spec 단방향)     | ✅ 정합                                              | **✅ 비재현 확정**                                                             |
| 4   | DRIFT-007 (NO ACTION FK) 재현      | ✅ 재현 (H2 grammar 인용)               | ✅ 100% 재현                        | ⚠️ 재현이지만 stack-conditional                      | **✅ 재현 + stack-conditional caveat**                                         |
| 5   | F-016 Decision Tree fit            | ✅ fit + 부록 B 권고                    | ⚠️ fit 50% (운영 DB 분기 부족)      | ⚠️ 부분 fit (Q3 누락)                                | **⚠️ fit 부분 — 명세 한계 finding 등록 (PF-PHASE2-META-001)**                  |
| 6   | 4 신규 candidate (PF-P2-001~004)   | ✅ 모두 재현                            | ✅ + 신규 7건 (CASE)                | ✅ + 신규 3건 (Senior — critical 1 + meta 1 + low 1) | **✅ 정합 + 신규 다수**                                                        |

### 0.2 메인 1차 추정 정정 횟수 (F-044 패턴)

- 정정: 2건 (#2 4중→race-safe 1중 / #5 fit→부분 fit + 명세 한계)
- 보강: 2건 (#4 stack-conditional / #1 강한 정합)
- Senior 신규 발견 (메인 미식별): 3건 — **PF-P2-005 critical / PF-PHASE2-META-001 high / PF-P2-006 low**

→ F-044 패턴 강한 외부 검증 데이터 1건 추가 (PoC #02 Phase 1 + Phase 2 ).

---

## 1. 3-합의 영역 (3 sub-agent 모두 같은 결론)

### A. schema.sql = Hibernate auto-export 100% 확정 ()

- Document: Hibernate 6.5 source `NamingHelper.generateHashedFkName` 알고리즘 인용 (`prefix("FK") + base35(MD5(...))`)
- Case: Vlad Mihalcea blog 인용 + 패턴 일치
- Senior: 9 FK + 3 UQ 100% hash 패턴 + 사람-읽는 명명 0건
- → **schema.sql 은 ORM derivative**, **JPA Entity = SoT 단일**

### B. AP-DOMAIN-002 본 환경 비재현 (개선)

- Document: PoC #01 1중 → PoC #02 3중 (2단계 개선)
- Case: PoC #01 1/4 → PoC #02 2/4 (1단계 개선)
- Senior: race-safe 1중 + race-prone 1중 (적정 방어)
- → **본 PoC 가 PoC #01 결함 개선 ✅** (framework 차이는 §3.1 충돌 해소 참조)

### C. EAGER fetch (Article.articleTags) anti-pattern 재현

- Document: Vlad "Eager Fetching is a Code Smell" 권위
- Case: 우형 박재성 Spring Camp / 카카오 LAZY 강제 사례
- Senior: HHH000104 in-memory pagination 시나리오 정확 재현 (ArticleRepositoryAdapter:46)
- → **PF-P2-001 high 격상 합의**

### D. titleToSlug 함정

- Document: Unicode/특수문자 미처리
- Case: 한글 / Locale / NFD 함정
- Senior: 8가지 함정 중 4개 즉시 재현
- → **PF-P2-002 medium 격상 합의**

### E. F-016 Decision Tree 한계 발견 (메타)

- Document: 부록 B 권고 (자동 vs 수동 분별)
- Case: PoC/데모 레포 분기 추가 권고
- Senior: Q3 추가 명세 변경 권고 (PF-PHASE2-META-001 high)
- → **v1.1.2 closed 항목 첫 명세 한계 노출 ** (closed → reopened 절차 필요성)

### F. Article 모듈 진보 시그널 ( 양질)

- Hibernate 6 신규 `GenerationType.UUID` 활용
- `open-in-view: false` 명시 (우형 권장)
- ArticleTag explicit junction entity (Vlad/우형/카카오 권장)
- User.equals/hashCode = getId UUID 의존 (mutable 의존 제거)
- → **PoC #02 = PoC #01 대비 양질 진화**

---

## 2. 3-충돌 영역 (sub-agent 간 의견 상이)

### 2.1 충돌 — AP-DOMAIN-002 평가 framework

| Agent    | Framework                                     | 결과                                               |
| -------- | --------------------------------------------- | -------------------------------------------------- |
| Document | 4-layer (DB / JPA / 생성자 / App-side lookup) | 본 PoC = 3중 방어 (App-side lookup 부재)           |
| Case     | 4-layer (App / Bean Validation / JPA / DB)    | 본 PoC = 2/4 (App + Bean Validation 부재)          |
| Senior   | race-safety 분류 (race-safe vs race-prone)    | race-safe DB UQ 1중 + race-prone TOCTOU 1중 = 적정 |

### 메인 결정: **Senior framework 채택**

- 근거: layer 개수보다 layer 별 race-safe 여부가 본질적
- 결론: 본 PoC 는 적정 방어 (PoC #01 의 critical 결함 해소). UX 측면 사전 검증 부재만 educational caveat
- 함의: v1.2.0 묶음 D 격상 시 "race-safe vs race-prone layer 분류" 가이드 추가 필요

### 2.2 충돌 — DRIFT-007 (NO ACTION FK) 의미

| Agent    | 결론                                                               |
| -------- | ------------------------------------------------------------------ |
| Document | ✅ 재현 (H2 grammar 인용)                                          |
| Case     | ✅ 100% 재현 (한국 80% 실무 빈도)                                  |
| Senior   | ⚠️ 재현이지만 stack-conditional (H2 in-memory 환경 운영 함정 아님) |

### 메인 결정: **Senior caveat 채택**

- 근거: 본 PoC 는 H2 in-memory + create-drop. 운영 함정 시그널이지만 본 환경 자체 운영 부재
- 결론: AP-DB-001 candidate 등록 시 "stack-conditional / 운영 환경 가정" 라벨 필수
- 함의: v1.2.0 격상 시 caveat 명시 필요

### 2.3 충돌 — F-016 Decision Tree fit 정도

| Agent    | 결론                                      |
| -------- | ----------------------------------------- |
| Document | ✅ fit + 부록 B 권고 (low severity)       |
| Case     | ⚠️ fit 50% (운영 DB 분기 부족)            |
| Senior   | ⚠️ 부분 fit (Q3 누락 — 명세 finding high) |

### 메인 결정: **Senior 채택 — 명세 finding 격상**

- 근거: 본 PoC schema.sql 이 ORM derivative 이므로 Decision Tree 의 "DDL > ORM" 우선순위가 무력화 → 명세 한계
- 결론: PF-PHASE2-META-001 high promoted 등록. v1.2.0 묶음 H 또는 신규 I 흡수
- 함의: F-016 closed 항목 reopened 권고. **closed → reopened 절차 미정의** = finding-system 자체 보강 필요

---

## 3. PoC #01 finding 외부 검증 종합 (Phase 2 영역)

### 3.1 closed 안정성 검증

| PoC #01 ID                    | 본 PoC 결과                           | 안정성           |
| ----------------------------- | ------------------------------------- | ---------------- |
| F-007 (inventory schema 부재) | (Phase 1 검증 — 정상)                 | ✅ 안정          |
| F-009 (신뢰도 표 환경 종속성) | (Phase 1 검증 — 정상)                 | ✅ 안정          |
| **F-016 (Decision Tree)**     | ⚠️ **부분 fit + 명세 한계 (Q3 누락)** | **⚠️ 한계 발견** |
| F-023 (circular dependencies) | (Phase 3 검증 예정)                   | (대기)           |

→ **F-016 첫 closed 명세 한계 발견** — closed 항목도 외부 검증으로 한계 노출 가능. **v1.1.2 closed 절차 보강 필요** (reopened 절차 정의).

### 3.2 promoted 외부 검증

| PoC #01 ID                             | 본 PoC 결과                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| **AP-DOMAIN-002**                      | ❌ **비재현 (개선)** — 본 PoC race-safe DB UQ + race-prone App TOCTOU 적정 방어 |
| AP-DOMAIN-001 (De Morgan)              | ❌ **비재현** (Article 에 removeCommentByUser 부재 — Comment 별도 Aggregate)    |
| AP-SECURITY-001 (JWT 21byte)           | ❌ **비재현 (해소)** (OAuth2 RS + RSA 비대칭)                                   |
| AP-ARCH-001/002 (LV-001/002)           | ❌ **비재현** (multi-module 컴파일 시점 차단)                                   |
| **AP-PERFORMANCE-001 (EAGER N+1)**     | ✅ **재현 강함** — HHH000104 가능 (Senior 시나리오 3)                           |
| AP-PERFORMANCE-002 (Pageable cap 부재) | (Phase 5 검증 예정)                                                             |
| AP-API-001 (versioning 부재)           | (Phase 5 검증 예정)                                                             |
| F-027 (De Morgan)                      | ❌ **비재현**                                                                   |
| F-041 (JWT alg explicit)               | ❌ **비재현** (NimbusJwtDecoder 자동 강제)                                      |

### 3.3 deferred 외부 검증 (Phase 2 영역)

| PoC #01 ID                       | 본 PoC 결과                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| F-017 (@ManyToMany / @JoinTable) | ✅ **best practice 사례** — explicit junction entity (Vlad/우형 권장) → **deferred 정정 권고** |
| F-018 (drift severity 처리)      | drift 0건 (출처 1종) → **무의미** (본 환경 부적합)                                             |
| F-008 (LOC 환산식)               | (Phase 1 — 비재현 강함)                                                                        |

### 3.4 외부 검증 통계

```yaml
poc_01_phase2_validation:
  closed_stable: 2/3
  closed_limit_found: 1/3 ( F-016)
  promoted_resolved: 4 (AP-DOMAIN-001/002, AP-SECURITY-001, AP-ARCH-001/002)
  promoted_strong_reproduction: 1 (AP-PERFORMANCE-001)
  deferred_correction: 1 (F-017 best practice 사례)
  deferred_inapplicable: 1 (F-018)
```

---

## 4. 단일 PoC 과적합 §8.1 강제 평가

### 4.1 격상 적합 매트릭스

| 패턴/finding                        | PoC #01        | PoC #02               | 외부 사례        | 격상 가부                     |
| ----------------------------------- | -------------- | --------------------- | ---------------- | ----------------------------- |
| AP-DOMAIN-002 race-safe 분류        | 1중 (생성자만) | DB UQ + App TOCTOU    | 한국 100%        | 격상                          |
| AP-DB-001 (FK NO ACTION)            | 100%           | 100%                  | 한국 80%         | 격상 (stack-conditional 라벨) |
| AP-PERFORMANCE-001 (EAGER)          | 있음           | 있음 (HHH000104)      | 한국 70%         | 격상 (severity high)          |
| ArticleTag explicit junction        | 있음           | 있음                  | JPA 표준         | 적극 격상 (best practice)     |
| `article.title unique`              | 없음           | 있음                  | RealWorld 특이성 | ❌ **격상 금지**              |
| ID UUID + Identity 혼재             | 없음           | 있음                  | 한국 40%         | △ 가이드 격상                 |
| `ddl-auto: create-drop`             | 없음           | 있음                  | PoC/데모 한정    | ❌ 격상 금지                  |
| F-016 Decision Tree                 | fit            | fit 50% (Q3 누락)     | -                | 명세 보강 (Q3 추가)           |
| schema.sql ORM derivative 검증 절차 | (없음)         | 있음 (PF-P2-004 high) | 권위 (Vlad)      | 신규 격상                     |

### 4.2 §8.1 격상 결론

**격상 적합** (PoC #01 + #02 + 외부 일치): **5건**

- AP-DOMAIN-002 race-safe 분류
- AP-DB-001 (stack-conditional)
- AP-PERFORMANCE-001 (severity high 격상)
- ArticleTag best practice
- schema.sql ORM derivative 검증 절차 (신규)

**격상 금지** (PoC 특이성 또는 데모 컨텍스트): **2건**

- `article.title unique`
- `ddl-auto: create-drop`

**가이드로만 격상** (분기 추가): **2건**

- ID 전략 ADR
- F-016 Decision Tree Q3 추가

---

## 5. 5+ 핵심 결정 (DEC-PHASE2-POC02-XXX)

### DEC-PHASE2-POC02-001 — schema.sql = ORM derivative 확정 + 정합성 검증 의미 약화 caveat 명시

- **결정**: schema.sql 의 9 FK + 3 UQ 모두 Hibernate `NamingHelper` hash 패턴 → 100% auto-generated 확정
- **근거**: Document (Hibernate 6.5 source) + Case (Vlad blog) + Senior (수동 작성 0건) 3-합의
- **적용**: Phase 2 산출 schema.json 의 sources_used 메타에 caveat 명시 + 정합성-검증-보고서.md 형식 변경 (drift 0건 + 출처 의존성 caveat 보고서)

### DEC-PHASE2-POC02-002 — AP-DOMAIN-002 race-safe vs race-prone 분류 framework 채택

- **결정**: Senior framework 채택. 본 PoC = race-safe DB UQ 1중 + race-prone App TOCTOU 1중 = 적정 방어 (PoC #01 critical 결함 해소)
- **근거**: 단순 layer 개수보다 race-safety 본질적
- **적용**: PF-P2-006 low (educational) 등록. v1.2.0 묶음 D 격상 시 framework 가이드 추가

### DEC-PHASE2-POC02-003 — F-016 Decision Tree 명세 한계 (Q3 누락) 확정 + 신규 finding 등록

- **결정**: PF-PHASE2-META-001 high promoted 등록. v1.1.2 closed 항목 첫 외부 검증 한계 노출
- **근거**: schema.sql ORM derivative 이면 "DDL > ORM" 우선순위 무력화 — Q3 (DDL auto-generated 분별) 명세 부재
- **적용**: v1.2.0 격상 묶음 — F-016 closed → reopened 또는 보강. **finding-system 의 closed → reopened 절차 자체 정식화 권고**

### DEC-PHASE2-POC02-004 — PF-P2-005 critical 즉시 등록 (TagJpaRepository 타입 오류 )

- **결정**: Senior 직접 read 로 발견 — `TagJpaRepository<Tag, Integer>` 인데 Tag.@Id = String. 현재 미발현 (findById 미사용) 이지만 잠재 critical
- **근거**: F-044 패턴 재현 — 메인 단편 fetch 가 못 잡음, Senior 가 5 파일 cross-check 로 발견
- **적용**: 사내 적용 시 즉시 수정 권고. Phase 6 등록 + v1.2.0 묶음 (별도 — sub-agent → 메인 정정 패턴 보강)

### DEC-PHASE2-POC02-005 — Phase 2 산출 신뢰도 raw 0.85 (cap 적용)

- **결정**: 출처 사실상 1종 (ORM 단일) → 명세 §6 "테이블/컬럼 식별 소스만 0.85" 적용
- **근거**: schema.sql ORM derivative 이므로 +0.10 보정 안 함
- **적용**: \_manifest.yml 신뢰도 산정 메타에 명시

### DEC-PHASE2-POC02-006 — finding 11건 등록 통합 표 (정정 + 신규 + 메타)

| ID                           | 제목                                                            | severity           | status    |
| ---------------------------- | --------------------------------------------------------------- | ------------------ | --------- |
| PF-P2-001                    | Article.articleTags EAGER + Specification + Pageable HHH000104  | **high** ⬆️        | promoted  |
| PF-P2-002                    | titleToSlug 8가지 함정 (Locale/Unicode/collision)               | **medium** ⬆️      | promoted  |
| PF-P2-003                    | ID 전략 혼재 ADR 부재 (의도된 설계 가능성)                      | **low**            | candidate |
| PF-P2-004                    | schema.sql ORM derivative — 정합성 검증 의미 약화               | **high** ⬆️⬆️      | promoted  |
| **PF-P2-005**                | **TagJpaRepository<Tag, Integer> 타입 오류 (Tag PK 가 String)** | **critical**       | promoted  |
| PF-P2-006                    | App existsBy\* 사전 check race-prone TOCTOU (educational)       | low                | candidate |
| **PF-PHASE2-META-001**       | **v1.1.2 §3.4 Decision Tree Q3 누락 (closed 명세 한계)**        | **high**           | promoted  |
| CASE-001 (구 PF-P2-CASE-001) | `article.title unique` over-constraint                          | high               | promoted  |
| CASE-002~005                 | varchar 길이 부족 (RFC 5321, password Argon2 등)                | medium x3 + low x1 | candidate |
| CASE-006                     | H2 MODE=MYSQL 호환성 함정                                       | low                | candidate |
| CASE-007                     | UUID + bigint PK 혼재 cardinality                               | medium             | candidate |

→ **누적 통계**: PoC #1 33 + PoC #2 (Phase 1 6 + Phase 2 신규 11) = **50건**. F-021 임계 20+ 진입 — 단 PoC #1 외부 검증 + Senior 직접 발견이 비중 큼 → v1.1.2 자체 부실 아님. **단일 PoC 과적합 회피 §8.1 강제** PoC #03 합산 후 격상.

---

## 6. 4단계 진입 권고 (3원칙 사용자 승인 게이트)

### 6.1 사용자 승인 의무 항목 (4원칙 게이트)

- [ ] **DEC-PHASE2-POC02-001** schema.sql ORM derivative caveat 채택
- [ ] **DEC-PHASE2-POC02-002** AP-DOMAIN-002 race-safe vs race-prone framework 채택
- [ ] **DEC-PHASE2-POC02-003** PF-PHASE2-META-001 high promoted 등록 + finding-system closed→reopened 절차 정식화 권고
- [ ] **DEC-PHASE2-POC02-004** PF-P2-005 critical (TagJpaRepository) 즉시 등록 + 사내 적용 시 수정 권고
- [ ] **DEC-PHASE2-POC02-005** Phase 2 raw confidence 0.85 적용
- [ ] **DEC-PHASE2-POC02-006** 11 finding 등록 표 일괄 채택

### 6.2 4단계 산출 4종 (Phase 2 명세 §4)

```
ai-native-methodology/examples/poc-02-realworld-springboot3/output/db/
├── schema.json                      # 신규 (sources_used = orm 단일 + caveat)
├── schema.sql                       # 신규 (Hibernate 추출 인용 + caveat 헤더)
├── erd.mermaid                      # 신규 (Mermaid)
├── 정합성-검증-보고서.md             # 신규 (drift 0건 + 출처 의존성 caveat 보고서 형태)
└── _manifest.yml                    # 신규 (raw 0.85 + 6 핵심 결정 + 11 finding + KPI)
```

### 6.3 finding 등록 작업

- `findings/poc-findings.md` 갱신 (F-048~F-058 11건 신규 — F-047 다음 ID)

---

## 7. 양질 시그널 — PoC #02 진보

| 측면            | PoC #01              | PoC #02                  | 차이 |
| --------------- | -------------------- | ------------------------ | ---- |
| ID 생성         | (Long auto-incr)     | UUID (Jakarta 3.1 신규)  | 진보 |
| OSIV            | (default true)       | open-in-view: false 명시 | 진보 |
| Junction Entity | @ManyToMany          | ArticleTag explicit      | 진보 |
| equals/hashCode | mutable email 의존   | getId UUID 의존          | 진보 |
| Cache           | 없음                 | Spring Cache + Caffeine  | 진보 |
| SQL Monitor     | 없음                 | p6spy                    | 진보 |
| Auth            | JWT 21byte 하드코딩  | OAuth2 RS + RSA          | 진보 |
| Multi-module    | single               | Hexagonal naming hybrid  | 진보 |
| Code Style      | editorconfig + Sonar | Spotless palantir        | 진보 |
| Test Fixtures   | src/test 만          | testFixtures source set  | 진보 |

→ **PoC #02 = PoC #01 대비 약 10단계 진화**. Senior 결론: "Hibernate 6 신규 기능 적극 활용 양질 시그널 + TagJpaRepository 타입 오류 critical + schema.sql ORM 그림자 함정 양면".

---

## 8. 다음 단계

1. ✅ 1원칙 (plan) 완료
2. ✅ 2원칙 (3 sub-agent + research 통합) 완료
3. ⏳ **3원칙 사용자 승인 게이트** — 6 핵심 결정 일괄 검토
4. ⏳ Auto Mode 자율 일괄 적용 가능 (윤주스 명시 시) → 4단계 산출 + finding 등록
5. ⏳ Phase 2 마감 → Phase 3 (arch) 인계

---

## 9. 참조

- 1차 산출: `.claude/researches/document-phase2-poc02.md` / `case-phase2-poc02.md` / `senior-phase2-poc02.md`
- plan: `.claude/plans/plan-phase2-poc02.md`
- 명세: `methodology-spec/workflow/phase-2-db.md` (v1.1.2)
- PoC #01 비교: `examples/poc-01-realworld-spring/output/db/`
- finding 누적: `examples/poc-02-realworld-springboot3/findings/poc-findings.md`

---

**END Research Phase 2 (3 sub-agent 통합)**
