# PoC #01 재개 노트 (2026-04-29 — **Phase 0~6 ✅ 종료 / PoC #01 분석 완료**)

> 다음 세션 시작 시 본 파일 + CLAUDE.md 먼저 읽기.
> 마지막 세션 종료 시점: **PoC #01 ✅ 완료 (7대 산출물 6/7, UI/UX 제외 100%) — PoC #02 진입 대기**.

---

## ⭐ 다음 세션 시작 명령어 (최우선) — PoC #01 종료

```
"PoC #01 종료 — 사내 적용 권고 검토 (critical 2 + high 2 즉시 조치) + PoC #02 진입 준비.
 RESUME.md + CLAUDE.md 읽고 PoC #02 의 다른 스택 (FastAPI / Express / etc) 선정 결정."
```

### Phase 6 종료 결과 (2026-04-29 ✅)

**4원칙 사이클 완주 + Auto Mode 자율 승인**:
- 1원칙 ✅ — `.claude/plans/plan-phase6.md`
- 2원칙 ✅ — 3 sub-agent (document/case/senior) — Document/Case 완료 + Senior stalled 메인 fallback ~700 line
- 3원칙 ✅ — Auto Mode 자율 승인 (Senior 권고 일괄 적용)
- 4원칙 미발생 ✅

**산출물 3종 (`output/antipatterns/`)** — raw confidence **0.96**:
- `antipatterns.json` (~830 line) — 15 AP final / schema 검증 통과 / id 정규화 매핑 / Phase 2 DRIFT 격상 audit / 7대 cross-validation
- `avoid-list.md` (~330 line) — 사람용 / severity 별 / composite view (보안 설정 종합) / 사내 권고 41 통합 / 부록 A B
- `_manifest.yml` — formula v1 / 5 핵심 결정 / 신뢰도 산정

**최종 15 AP**:
- **critical 2**: AP-DOMAIN-001 (De Morgan 버그) / AP-SECURITY-001 (JWT 21byte 7중 위반)
- **high 2**: AP-DOMAIN-002 (unique 3중 부재) / AP-PERFORMANCE-002 (Pageable cap)
- **medium 7**: AP-ARCH-001/002 (LV) / AP-DB-001 / AP-SECURITY-002/003 (STATELESS / ignoring) / AP-API-001 (versioning) / AP-PERFORMANCE-001 (EAGER N+1)
- **low 4**: AP-API-002 (status) / AP-DOMAIN-003 (F-017) / AP-DOMAIN-004 (F-028) / AP-ARCH-003 (deprecated)

**5 핵심 결정 (DEC-AP-001~005)** — Senior 권고 일괄 적용:
- 복합 AP 등록 거절 (Document 권고 채택 / Case 가독성은 composite view 섹션화)
- severity 재산정 (AP-PERFORMANCE-001 medium 유지 / AP-ARCH-003 medium → low)
- Phase 4 추가 candidate 3건 모두 등록
- 사내 권고 41건 통합 (Senior §6 채택)
- F-041 (JWT alg explicit 검증) 신규 등록

**누적 33건** (closed 10 / promoted 10 / deferred 13 / rejected 0). v1.2.0 격상 묶음 7 (A~G).

### PoC #01 7대 산출물 완료 ✅

| # | 산출물 | 단계 | 상태 | 신뢰도 |
|---|---|---|---|---|
| 1 | 아키텍처 | Phase 3 | ✅ | 0.91 |
| 2 | 도메인 모델 | Phase 4 | ✅ + Phase 5 정정 | 0.90 |
| 3 | API 계약 | Phase 5-1 | ✅ | 0.93 |
| 4 | DB 스키마 | Phase 2 | ✅ | 0.92 |
| 5 | 비즈니스 규칙 | Phase 4 | ✅ + Phase 5 정정 | 0.85~0.92 |
| 6 | 안티패턴 | Phase 6 | ✅ | **0.96** |
| 7 | UI/UX | Phase 5-2 | ❌ N/A (BE only) | — |

**6/7 (UI/UX 제외 100%) ✅**

### 사내 적용 권고 (PoC #01 분석 결과)

**즉시 차단 (0~1주)**:
- AP-SECURITY-001 — JWT SECRET 21byte → 256bit + 환경변수 + Vault
- AP-DOMAIN-001 — Article.java:86 De Morgan `||` → `||` (조건 invert)

**1 스프린트 (1~2주)**:
- AP-DOMAIN-002 — email/username unique App+DB+JPA 3중 방어
- AP-PERFORMANCE-002 — Pageable limit `@Max(100)` cap

**다음 분기 (1~3개월)**:
- composite view (보안 설정 종합 점검) — Spring Boot 3.x 마이그레이션 일괄 코드로 4 AP 동시 fix (AP-SECURITY-001 + AP-SECURITY-002 + AP-SECURITY-003 + AP-ARCH-003)
- AP-ARCH-001/002 (LV) / AP-DB-001 (FK) / AP-API-001 (versioning) / AP-PERFORMANCE-001 (EAGER N+1)

**백로그 (6개월~)**:
- low 4 AP — Spring Boot 3.x 마이그레이션 시 통합

→ 자세한 권고: `output/antipatterns/avoid-list.md` 참조.

### PoC #02 진입 인계

**목적**: 다른 스택에서 본 PoC 결정 외부 검증 + v1.2.0 합산 격상 데이터 확보.

**검증 대상 (deferred 13 + promoted 10)**:
- promoted 10건 (v1.2.0 묶음 A~G 후보) — F-015 / F-018 / F-022 / F-024 / F-025 / F-029 (?) / F-034 / F-036 / F-038 등
- deferred 13건 — F-008 / F-017 / F-019 / F-026 / F-028 / F-030 / F-031 / F-032 / F-033 / F-037 / F-039 / F-040 / F-041

**스택 후보 (윤주스 결정 대기)**:
- Python: FastAPI + SQLAlchemy + Pydantic
- Node: Express + TypeORM / NestJS + Prisma
- Go: Gin / Fiber + GORM
- Kotlin: Ktor / Spring Boot 3.x (한 번 더)

**v1.2.0 격상 (PoC #01 + #02 합산)** — 7 묶음 (A~G) 일괄 처리:
- A: cross-validation (F-015) — Work Principles 2원칙 명세화
- B: 정정 트레이스 (F-022 + F-024)
- C: severity 표준 (F-018) — phase-2-db.md §4.2
- D: schema 진화 (F-025) — architecture.schema.json hybrid 지원 + antipatterns.schema.json id pattern 보강
- E: quality-extraction (Phase 4 신규)
- F: 신뢰도 공식 보강 (Phase 4 신규)
- G: ⭐ OpenAPI x-extension 표준 가이드 (ADR-007) — F-034 / F-036 / F-038

---

### Phase 5-1 종료 결과 (2026-04-29 ✅)

**4원칙 사이클 완주**:
- 1원칙 ✅ — `.claude/plans/plan-phase5.md`
- 2원칙 ✅ — 3 sub-agent (document/case/senior) 재spawn 완료 (4,449 line) + research-phase5.md 통합
- 3원칙 ✅ — 윤주스 4/4 항목 일괄 승인 (5 결정 + finding 7건 + 묶음 G + AP candidate 6)
- 4원칙 (실패 시) — 미발생 ✅

**산출물 4종 (`output/api/`)**:
- `openapi.yaml` (471 line) — OpenAPI 3.1 / 22 endpoint / 19 operationId / wrapper 19 / TokenAuth apiKey / F-027 3중 표기
- `api-extension.json` (~520 line) — operations[19] / schemas_to_entities[18] / x-architectural-debt LV-001 18 op
- `api.md` (~290 line) — 사람용 / 신규 finding 7건 / 사내 권고 41건 / Phase 6 AP candidate 6
- `_manifest.yml` — formula v1 / **raw confidence 0.93** (Phase 0 예상 0.92 +0.01)

**Phase 4 산출 갱신 (cross-validation 정정 3건)**:
- `domain.json` UC-CONTENT-USER-FIND-BY-ID 정정 (F-035 closed)
- `rules.json` BR-AUTH-STATELESS-001 source_evidence 정밀화 (F-034 promoted, conf 0.90→0.85)
- `rules.json` BR-AUTH-PUBLIC-001 source_evidence 정밀화 (F-036 promoted, conf 0.95→0.92)

**finding 7건 등록 (`findings/poc-findings.md`)**:
- F-034 (medium / promoted G) — sessionCreationPolicy(STATELESS) 명시 부재
- F-035 (high / **closed**) — GET /user UC 매핑 정정 (Phase 4 system_internal 오분류)
- F-036 (low / promoted G + Phase 6 AP candidate) — WebSecurity#ignoring → permitAll
- F-037 (low / deferred) — JWT iss/aud/iat/jti 4 claim 부재
- F-038 (medium / promoted G + Phase 6 AP candidate) — API 버저닝 부재
- F-039 (medium / deferred) — WebSecurityConfigurerAdapter deprecated
- F-040 (medium / deferred) — HTTP status code 일관성

**누적 32건** (closed 10 / promoted 10 / deferred 12 / rejected 0).
**v1.2.0 격상 묶음 7** (A~G — G = ADR-007 OpenAPI x-extension 표준 가이드 신규).

### Phase 6 인계 (다음 세션)

**입력**:
- `output/antipatterns-partial/antipatterns-partial.json` (Phase 4) — 6 AP (critical 2 / high 1 / medium 3)
- Phase 5-1 신규 candidate 6건:
  - AP-PERFORMANCE-001 (high) — Pageable / limit cap 부재
  - AP-SECURITY-CONFIG-IMPLICIT-001 (medium) — F-034
  - AP-SECURITY-CONFIG-WEBSEC-IGNORING-001 (medium) — F-036
  - AP-ARCH-DEPRECATED-001 (medium) — F-039
  - AP-API-VERSIONING-001 (medium) — F-038
  - AP-API-STATUS-INCONSISTENT-001 (low) — F-040
- 사내 적용 권고 41건 (api.md §5 + senior-phase5.md 부록 B)

**예상 산출물 (`output/antipatterns/`)**:
- `antipatterns.json` final (12 AP)
- `antipatterns.md` — severity 별 운영 권고 + REC 41건 통합
- `_manifest.yml` (formula v1)

**4원칙 1단계 (plan-phase6.md)**:
- methodology-spec/workflow/phase-6-quality.md 전수 조사
- methodology-spec/deliverables/06-안티패턴.md 전수 조사
- output/antipatterns-partial/* 검증
- F-015 cross-validation 사전 적용

---

## 핵심 파일 (Phase 4 완료 산출물)
- **output/domain/** (6 파일): domain.json (BC-CONTENT 단일 + BC-AUTH / Aggregate 3 / VO 7 / UC 25), domain.md, domain.mermaid, use-cases.md, ubiquitous-language.md, _manifest.yml
- **output/rules/** (3 파일): rules.json (BR 13), rules.md, _manifest.yml
- **output/antipatterns-partial/** (2 파일): antipatterns-partial.json (6 AP — critical 2 / high 1 / medium 3), _manifest.yml
- **갱신**: output/architecture/{architecture.json, circular-dependencies.md, architecture.md} (CIRCULAR-001 same_bc) + output/db/{schema.json, 정합성-검증-보고서.md} (DRIFT-010 격상 high)
- **findings**: poc-findings.md +7 (F-027~F-033) — 누적 25건

## Phase 5 입력
- UC 25 (Command 11 / Query 14) → OpenAPI operationId 매핑 (domain.json `use_cases[].related_api_operation_id`)
- BR 13 → endpoint validation/authorization 매핑
- BR-AUTH-PUBLIC-001 → security: [] 표기
- BR-COMMENT-DELETE-001 → DELETE /articles/{slug}/comments/{id} (의도 OR vs 동작 AND F-027 명시)

---

---

## 0. v1.1.2 격상 완료 (2026-04-28) ⭐

F-021 임계 결정: **Option A 채택** (PoC 정지 + v1.1.2 격상). high severity 4건 모두 closed.

| ID | 처리 결과 |
|---|---|
| F-007 | ✅ schemas/inventory.schema.json + templates/inventory.template.{json,md} + schemas/README.md (CI TODO) 신설 |
| F-009 | ✅ phase-1-init.md §6 결정성 단일 표 + caveat 컬럼 (환경별 분리 거부) |
| F-016 | ✅ phase-2-db.md §3.4 원칙 + Decision Tree + 부록 (산업 권위 7/7 매트릭스 반대) |
| F-023 | ✅ phase-3-arch.md §3.1.1 hybrid 분기 + ADR-006 (Provisional) + architecture.schema.json `circular_dependencies[]` 보강 (3값 bc_status + 2 boolean) |

**작업 산출물**: methodology-v1.1/.claude/plans/plan-v112.md + researches/{document,senior,case-{f007,f009,f016,f023},research}-v112.md + PROGRESS-v112.md (시간순 진행 로그).

**다음**: Phase 4 진입 — 갱신 명세 적용 + DRIFT 4건 + CIRCULAR-001 + ARCH-STYLE 사용자 결정 6건.

---

## 1. 어디까지 했나 (Phase 0~3 완료)

```
PoC #01 (RealWorld Spring Boot)
├── Phase 0 (입력 정리) ✅ closed
│   ├── inputs/_manifest.yml
│   ├── inputs/domain-context.md
│   └── source-info.md (Phase 1 D 검증 후 Lombok/Tree count 보정 완료)
│
├── Phase 1 (init/인벤토리) ✅ 신뢰도 0.92
│   └── output/inventory/ (5종)
│       ├── inventory.json (12 KB)
│       ├── tree.md (6 KB)
│       ├── stack-detection.md (8.8 KB)
│       ├── stats.json (5 KB)
│       └── _manifest.yml
│
├── Phase 2 (db/DB 스키마 + 정합성) ✅ 신뢰도 0.92
│   └── output/db/ (5종)
│       ├── schema.json (18.7 KB) — 7 테이블 + @Embeddable 7개 라우팅
│       ├── schema.sql (3 KB) — 원본 + 헤더 주석
│       ├── erd.mermaid (2.3 KB)
│       ├── 정합성-검증-보고서.md (14 KB) — DRIFT 9건
│       └── _manifest.yml
│
├── Phase 3 (arch/아키텍처) ✅ 신뢰도 0.91 (지난 작업)
│   └── output/architecture/ (6종)
│       ├── architecture.json (14.5 KB)
│       ├── architecture.md (8.8 KB)
│       ├── architecture.mermaid (2.3 KB)
│       ├── dependency-graph.mermaid (1.8 KB)
│       ├── circular-dependencies.md (6 KB)
│       └── _manifest.yml
│
├── Phase 4 (비즈니스 로직, 4영역 병렬) ⏳ 대기
├── Phase 5 (api/ui) ⏳ 대기 (UI N/A — BE only)
└── Phase 6 (quality/안티패턴) ⏳ 대기
```

### 1.1 plan/research 디렉토리 (Phase 1~3 완료)

```
.claude/
├── plans/
│   ├── plan-phase1.md
│   ├── plan-phase2.md
│   └── plan-phase3.md
└── researches/
    ├── document-phase1.md (715 line)
    ├── case-phase1.md
    ├── senior-phase1.md
    ├── research-phase1.md (통합)
    ├── document-phase2.md
    ├── case-phase2.md
    ├── senior-phase2.md
    ├── research-phase2.md (통합)
    ├── document-phase3.md (715 line)
    ├── case-phase3.md
    ├── senior-phase3.md
    └── research-phase3.md (통합)
```

---

## 2. 핵심 발견 (Phase 1~3 누적)

### 2.1 RealWorld 실측 정보 (D 검증 + 메인 cross-check 결과)

- 기본 브랜치: **`master`** (main 아님)
- Spring Boot **2.5.2** (Java 11)
- Lombok **사용** (io.freefair.lombok 5.3.3.3 + lombok.config 존재)
- JPA 단일 (mybatis 부재)
- H2 인메모리 + `MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE`
- **`ddl-auto=none`** → schema.sql 이 SoT
- 170 entries / 119 blobs / 96 main java files
- Java 164,904 bytes (~4,711 estimated LOC)

### 2.2 아키텍처 확정 (Phase 3 정정)

| 후보 | Phase 1 | Phase 3 | Δ |
|---|---|---|---|
| Hexagonal/Clean | 0.65 | **0.30** ❌ | -0.35 |
| POJO domain | 0.85 | **0.50** ⚠️ | -0.35 |
| **Layered + Spring-flavored DDD-Lite** | (인식 안 됨) | **0.85** ✅ | primary |

**핵심 증거**: domain/ 이 `@Service`/`@Transactional`/`@Entity`/`PasswordEncoder` 직접 import + application → infrastructure 직접 의존 (UserJWTPayload).

### 2.3 모듈 ↔ BC 매핑 (Phase 4 입력)

| BC | 모듈 | 테이블 | Aggregate 후보 |
|---|---|---|---|
| BC-ARTICLE | DOMAIN-ARTICLE + APP-ARTICLE + APP-TAG | articles, articles_tags, article_favorites, comments, tags | Article, Comment, Tag |
| BC-USER | DOMAIN-USER + APP-USER | users, user_followings | User |
| BC-AUTH | DOMAIN-JWT + INFRA-JWT + APP-SECURITY | (없음) | (cross-cutting) |

⭐ Article 1순위 ground truth ✅ 검증 완료 (Phase 1+3 일관).

### 2.4 @Embeddable 7개 (Phase 4 5.A 입력)

3-level nesting:
```
User (Aggregate Root)
├── @Embedded Email
├── @Embedded Password
└── @Embedded Profile (1-level)
      ├── @Embedded UserName (2-level)
      └── @Embedded Image (2-level)

Article (Aggregate Root)
├── @Embedded ArticleContents (1-level)
      ├── @Embedded ArticleTitle (2-level)
      └── @JoinTable @ManyToMany Tag (collection in Embeddable — F-017)
```

---

## 3. 사용자 결정 ✅ 완료 (2026-04-28)

6건 모두 윤주스 (TF Lead) 결정 완료. 4원칙 1+2+3 단계 적용 (plan-decisions-6.md + research-decisions-6.md + 사용자 승인).

| ID | 결정 | 후속 |
|---|---|---|
| **DRIFT-002** | **단방향 (A)** | schema.json semantic_relation=directional_follow 보강. Phase 4 5.A Profile.follow() 검증. |
| **DRIFT-003** | **권장만 (B)** | schema.json recommendations[REC-001] 등재. RealWorld 코드 변경 없음. |
| **DRIFT-007** | **NO ACTION 유지 (A)** | schema.json recommendations[REC-002] (사내 soft delete + author placeholder). Phase 6 안티패턴 후보. |
| **DRIFT-010** | **Phase 4 5.A 검증 후 (C)** | schema.json recommendations[REC-003] (Phase 4 첫 검증 항목). |
| **CIRCULAR-001** | **ADR-006 default (A)** | architecture.json bc_status=undefined + medium + decision_required + Phase 4 라우팅. |
| **ARCH-STYLE** | **승인 (A)** | architecture.json correction_trace approved + Phase 6 안티패턴 LV-001/LV-002 등록 강제. |

**갱신 파일** (7개): schema.json + 정합성-검증-보고서.md + architecture.json + circular-dependencies.md + architecture.md + poc-findings.md + 본 RESUME.md.

**Phase 4 입력 (필수 검증 항목)**:
- DRIFT-002: Profile.follow() 메서드 의도 보강 검증
- DRIFT-010 (REC-003): User 회원가입 service 의 application 레벨 email unique 검증
- CIRCULAR-001: User ↔ Article BC 정의 + 도메인 행동 검증 (User.writeCommentToArticle() 등) + Aggregate 경계 결정
- ARCH-STYLE 후속: Phase 6 안티패턴 LV-001 (AP-ARCH-LAYER-VIOLATION-001) + LV-002 (AP-DOMAIN-FRAMEWORK-LEAK-001) 등록

---

## 4. F-021 임계 결정 ✅ 완료 (2026-04-28)

```yaml
임계 도달: 18/20 (Phase 4 진입 시 20+ 예상)
사용자 결정: Option A 채택 — PoC 정지 + v1.1.2 격상
결과: high 4건 모두 closed (F-007/F-009/F-016/F-023)
v1.1.2 PATCH 릴리스 완료 — 호환성 영향 없음 (모든 schema 변경 옵셔널 신규 필드)
```

### 4.1 v1.1.2 격상 결과

| ID | 결과 | 변경 영역 |
|---|---|---|
| F-007 | ✅ closed | schemas/inventory.schema.json + templates/inventory.template.{json,md} + schemas/README.md |
| F-009 | ✅ closed | phase-1-init.md §6 결정성 단일 표 + caveat |
| F-016 | ✅ closed | phase-2-db.md §3.4 원칙 + Decision Tree + 부록 |
| F-023 | ✅ closed | phase-3-arch.md §3.1.1 + schemas/architecture.schema.json + ADR-006 (Provisional) |

### 4.2 잔여 finding 처분 ✅ 완료 (2026-04-28)

`methodology-spec/finding-system.md` §8 결정 트리 적용. **closed 1 / promoted 5 / deferred 4 / rejected 0**.

| 처분 | 결과 | 다음 영향 |
|---|---|---|
| **closed** (1건) | F-021 (자체 종결) | finding-system.md §7 임계 절차 정식 반영 |
| **promoted** (5건, v1.2.0 후보) | F-015, F-018, F-022, F-024, F-025 | v1.2.0 격상 시 4 묶음 (A/B/C/D) 처리 |
| **deferred** (4건, PoC #02/#03 후) | F-008, F-017, F-019, F-026 | revisit_at 명시 — 다중 PoC 데이터 누적 후 재평가 |
| **rejected** (0건) | — | 모든 finding 명세 책임 범위 내 |

**v1.2.0 격상 묶음** (5 promoted finding 의 그룹화):
- A. cross-validation (F-015) — Work Principles 2원칙 명세화
- B. 정정 트레이스 (F-022 + F-024) — ground truth↔실측 + Phase 간 정합성
- C. severity 표준 (F-018) — phase-2-db.md §4.2 보강
- D. schema 진화 (F-025) — architecture.schema.json hybrid 지원

→ 잔여 finding 처분 완료. **Phase 4 진입 차단 요인 없음**.

---

## 5. 다음 세션 시작 명령어 (2026-04-29 갱신)

```
"RESUME.md + PROGRESS-poc01-phase5.md 읽고 Phase 5-1 재개.
 1원칙 plan-phase5.md ✅ + 메인 raw fetch ✅ 완료. 2원칙 sub-agent 3개 재spawn 부터."
```

### 5.0 절대 우선순위 (윤주스 2026-04-28 결정)

**품질 1순위 + 재작업 최소화 2순위**. memory `feedback_quality_priority.md` 적용.
- v1.2.0 격상은 PoC #02 종료 후 (PoC #01 + #02 데이터 합산)
- 사용자 결정은 Phase 진입 전 일괄 (진입 중 결정 ❌ — 중간 재작업 위험)

세션 시작 시 Claude 가 할 일:
1. RESUME.md + CLAUDE.md 읽기 (CLAUDE.md 의 "현재 상태" v1.1.2 반영 필요)
2. **사용자 결정 6건 (DRIFT 4 + CIRCULAR-001 + ARCH-STYLE) — Phase 4 진입 전 일괄 결정 강제** (진입 중 옵션 폐기)
   - **CIRCULAR-001 결정**: ADR-006 적용으로 `bc_status=undefined + medium + decision_required=true + phase_4_routing=true` default. Phase 4 BC 결정 시 일괄 처리 가능
3. Phase 4 진입 — Work Principles 4원칙 1단계 (전수 조사) **100% 강제**
   - phase-1-init.md §6 / phase-2-db.md §3.4 / phase-3-arch.md §3.1.1 / ADR-006 모두 v1.1.2 갱신 인용 필수
   - architecture.json 의 circular_dependencies[CIRCULAR-001] 에 v1.1.2 새 필드 (bc_status / decision_required 등) 추가 권장 (warnings 만 추가도 가능)
   - F-015 cross-validation 100% 적용 (sub-agent 결과 메인 raw fetch cross-check)
   - PROGRESS-v112.md 또는 신규 PROGRESS-poc01-phase4.md 시간순 갱신 의무

---

## 6. F-015 cross-validation 패턴 (Phase 1~3 정착) ⭐

3 에이전트 병렬 리서치 시 **sub-agent 학습 코퍼스 의존 위험**:
- Phase 1 D 에이전트 사례: Lombok "미사용" → 실제 "사용" + Tree "93 entries" → 실제 "170 entries" (50% 오차)

**대응 패턴** (Phase 2/3 정착):
1. 메인 에이전트가 **핵심 데이터 사전 raw fetch** (build.gradle / schema.sql / Entity / import 등)
2. sub-agent 도 직접 raw fetch 권장 (학습 코퍼스 의존 최소화)
3. sub-agent 보고 = 메인 cross-check
4. 50%+ 오차 발견 시 즉시 finding 등록

**효과**:
- Phase 1: 50% 오차 (사후 보정)
- Phase 2: **0% 오차** (사전 적용)
- Phase 3: **0% 오차** (메인 9건 + sub-agent 10건 = 19건 검증)

→ Phase 4~6 진행 시 본 패턴 그대로 적용 권장.

---

## 7. 핵심 파일 인덱스

### 산출물 (output/)
- `output/inventory/` — Phase 1 (5종)
- `output/db/` — Phase 2 (5종)
- `output/architecture/` — Phase 3 (6종)

### plan/research (.claude/)
- `.claude/plans/plan-phase{1,2,3}.md`
- `.claude/researches/{document,case,senior,research}-phase{1,2,3}.md`

### finding 누적
- `findings/poc-findings.md` — Phase 0~3 누적 18건

### 입력 (inputs/)
- `inputs/_manifest.yml` — Phase 0 입력 매니페스트
- `inputs/domain-context.md` — RealWorld 도메인 그라운딩
- `source-info.md` — 분석 대상 메타 정보 (Lombok/Tree count 보정 완료)

### 방법론 본체 (../../../)
- `methodology-spec/workflow/phase-{0,1,2,3,4,5-1,5-2,6}.md`
- `methodology-spec/deliverables/01~07-*.md`
- `docs/adr/ADR-{001,002,003,004,005}-*.md`
- `schemas/*.schema.json` (8개)

---

## 8. 큰 그림 — 7대 산출물 진행률

| # | 산출물 | 단계 | 상태 |
|---|---|---|---|
| 1 | 아키텍처 | Phase 3 | ✅ 완료 |
| 2 | 도메인 모델 | Phase 4 | ✅ 완료 (output/domain/ 6 파일 + BC-CONTENT 단일 + Aggregate 3 + VO 7) |
| 3 | API 계약 | Phase 5-1 | ✅ 완료 (output/api/ 4종 + raw confidence 0.93) |
| 4 | DB 스키마 | Phase 2 | ✅ 완료 (DRIFT-010 Phase 4 high 격상 반영) |
| 5 | 비즈니스 규칙 | Phase 4 | ✅ 완료 (output/rules/ 3 파일 + BR 13) |
| 6 | 안티패턴 | Phase 6 | ⏳ partial 6건 작성 — final merge 대기 |
| 7 | UI/UX | Phase 5-2 | ❌ N/A (BE only) |

**현재 6/7 완료 (Inventory + DB + Architecture + Domain + Rules + API + **AP final 15**). 진행률 ~100% (UI/UX 제외). PoC #01 분석 종료 ✅.**

---

## 9. Phase 4 핵심 발견 (2026-04-28 완료)

### 9.1 critical/high 안티패턴 4건 (사내 적용 시 즉시 수정 필수)

| AP ID | severity | 위치 | 발견 origin |
|---|---|---|---|
| AP-DOMAIN-001 | **critical** | `domain/article/Article.java:86` De Morgan 버그 | Phase 4 신규 / F-027 |
| AP-SECURITY-001 | **critical** | `infrastructure/jwt/JWTConfiguration.java:12` SECRET 하드코딩 (RFC 7515 위반) | Phase 4 신규 |
| AP-DOMAIN-002 | **high** | `domain/user/UserService.java:22` + `schema.sql` email/username unique 이중 부재 | DRIFT-010 격상 |
| AP-ARCH-001 | medium | `application/article/ArticleRestController.java` UserJWTPayload 직접 import | LV-001 강제 |

### 9.2 BR 13건 (Command 11 / Query 14 UC 매핑)

- 5.A db_logic 11 / 5.C config_policy 2 / 5.B 0 / 5.D 0
- human_review_required 6건 (DRIFT-010 격상 + F-027 + JWT 보안)
- rule_conflicts 1건 — BR-COMMENT-DELETE-001 (의도 OR ≠ 동작 AND, F-027)

### 9.3 누적 finding 25건 (Phase 4 +7)

- closed 9 / promoted 7 (Phase 4 +F-027/F-029) / deferred 9 (Phase 4 +F-028/F-030/F-031/F-032/F-033) / rejected 0
- v1.2.0 격상 묶음 6 (Phase 4 신규: E. quality-extraction + F. 신뢰도 공식 보강)

### 9.4 사용자 결정 6건 모두 적용 ✅

| 결정 | Phase 4 적용 결과 |
|---|---|
| DRIFT-002 단방향 | BR-USER-FOLLOW-001 등록 |
| DRIFT-003 권장만 | recommendations[REC-001] (변경 없음) |
| DRIFT-007 NO ACTION | AP-DB-001 등록 |
| DRIFT-010 Phase 4 검증 | **격상** medium → high (BR + AP 이중 + REC-004 3중 방어) |
| CIRCULAR-001 ADR-006 default → same_bc | bc_status undefined → same_bc / severity medium → low |
| ARCH-STYLE Layered+Spring-DDD-Lite | LV-001/LV-002 → AP-ARCH-001/002 강제 등록 |

---

## 10. Phase 5 진입 준비 (다음 세션)

### 10.1 입력 (Phase 4 인계)

- UC 25 → OpenAPI operationId 매핑 (domain.json `use_cases[].related_api_operation_id`)
- BR 13 → endpoint validation / authorization 매핑
- BC-CONTENT (BC-USER + BC-ARTICLE 통합) — API 그룹화 유지하되 BC 라벨링 단일
- LV-001 (UserJWTPayload import) → security 스키마 표기

### 10.2 Phase 5 4원칙 1단계 (plan-phase5.md)

- methodology-spec/workflow/phase-5-1.md 전수 조사
- application/* RestController 9건 raw fetch (Phase 3 인계)
- doc/Conduit.postman_collection.json (ground truth) 비교
- F-015 cross-validation 사전 적용

### 10.3 Phase 5 진입 명령어

```
"plan-phase5.md 작성 — application/* RestController 9건 raw fetch + Conduit.postman_collection.json ground truth + UC 25 매핑 전수 조사."
```
