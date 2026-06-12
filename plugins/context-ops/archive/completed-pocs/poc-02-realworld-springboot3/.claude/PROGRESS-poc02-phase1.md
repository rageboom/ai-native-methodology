# PROGRESS — PoC #02 Phase 1 (init / 인벤토리)

> 시간순 로그 대전제 (feedback_progress_log.md) 적용

---

## T+0 (2026-04-29) — Phase 1 진입 + 1원칙 plan 작성 ✅

### 진입 컨텍스트

- Phase 0 ✅ 종료 (raw confidence 0.95 예상치 / source-info.md + inputs/\_manifest.yml + PROGRESS-poc02-phase0.md)
- 분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e`, 2025-09-19)
- Auto Mode 활성 (윤주스 명시) → 4원칙 사이클 자율 진행

### 1원칙 — plan-phase1-poc02.md 작성

전수 조사 완료:

- ✅ phase-1-init.md (256 줄)
- ✅ schemas/inventory.schema.json + meta-confidence.schema.json
- ✅ PoC #1 plan-phase1.md (참조)
- ✅ 대상 레포 핵심 메타 (Phase 0 raw):
  - libs.versions.toml (Spring Boot 3.3.0 / Java 21)
  - build.gradle.kts (3 모듈) — Spotless / Lombok / version catalog
  - settings.gradle.kts (`:module:core`, `:module:persistence`, `:realworld`)
  - 모듈 구조 + 디렉토리 트리 (Phase 0 ls 결과)
  - api-docs/ ground truth (openapi.yaml + Postman + run-api-tests.sh)

산출:

- ✅ `.claude/plans/plan-phase1-poc02.md` (~390 줄)
- 핵심 결정: 11가지 차이 변수 / Hexagonal 가설 / finding PF-001~004 사전 후보

---

## T+1 (2026-04-29) — 메인 사전 raw fetch (F-015 cross-validation 패턴)

### 메인 직접 read

```bash
# 모듈별 build.gradle.kts read
- module/core/build.gradle.kts: jakarta.persistence-api 만 (Spring 의존성 외관상 0 — 그러나 이후 정정됨)
- module/persistence/build.gradle.kts: core 의존 + spring-data-jpa + cache + p6spy + caffeine
- server/api/build.gradle.kts: compileOnly(core) + runtimeOnly(persistence) + web + oauth2-resource-server
```

### 메인 1차 단언 (이후 Senior 가 정정)

> "module/core 는 Spring 의존성 0 — 순수 POJO 도메인. compileOnly + runtimeOnly = Hexagonal 명시 구현."

→ 이 단언이 다음 단계 Senior 가 정정.

---

## T+2 (2026-04-29) — 2원칙 3 sub-agent 병렬 spawn

### 3 sub-agent (백그라운드 실행)

| Agent               | prompt 핵심                                                                                                                                              | 산출                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Document Researcher | 공식 docs / RFC / 표준 spec — Phase 1 명세 §3.2 fit / 모듈 패턴 / OAuth2 RS / Jakarta / Specifications / Cache / p6spy + PoC #1 finding cross-validation | `.claude/researches/document-phase1-poc02.md` (~433 줄) |
| Case Researcher     | Netflix / 우형 / 카카오 / Tech Radar / 한국 multi-module 사례 / Specifications vs QueryDSL / p6spy 운영                                                  | `.claude/researches/case-phase1-poc02.md` (~528 줄)     |
| Senior BE Engineer  | 함정 / 실패 패턴 / Architecture 정체성 평가 / multi-module 함정 / JWT 비대칭 키 함정 / Phase 1 명세 fit                                                  | `.claude/researches/senior-phase1-poc02.md` (~674 줄)   |

각 prompt 에 메인 사전 fetch raw data 를 포함 (F-015 cross-check 의무).

---

## T+3 (2026-04-29) — sub-agent 결과 + research 통합

### 산출

- Document: F-015 cross-check 5/5 정합. 명세 §3.2 fit ~70%. 신규 finding 2건 (PF-001/002 high) 권고.
- Case: 글로벌/한국 Hexagonal 정합도 95%+. PoC #1 AP-SECURITY-001 비재현 → variant 격상. PF-005~007 신규.
- Senior: **메인 사전 fetch 단언 정정** — 루트 subprojects 블록 + UserService @Service + User @Entity 실측. architecture_style_candidates Pure Hexagonal 단정 회피 → "Modular Monolith with Ports & Adapters Naming" hybrid (cap 0.65). 신규 finding 7건 + Phase 6 candidate 9건.

### 충돌 해소 (메인 결정)

| 충돌                | 해소                                                             |
| ------------------- | ---------------------------------------------------------------- |
| Architecture 분류   | **Senior 결정 채택** (Pure Hexagonal 단정 회피, hybrid cap 0.65) |
| core Spring 의존성  | **Senior 정정 채택** (실측 우선)                                 |
| Specifications 분류 | **Case PF-006 medium 채택** (한국 사례 권위)                     |

### research-phase1-poc02.md 통합 ✅

- F-015 cross-check 결과 (메인 정정 케이스 명시)
- 3-합의 영역 / 3-충돌 영역 정리
- PoC #1 finding 33건 외부 검증 (Phase 1 영역 4건 + Phase 2~6 영역 시그널 9건)
- 신규 finding 정식 등록 권고 6건 (high 1 / medium 2 / low 3)
- 5 핵심 결정 (DEC-PHASE1-POC02-001~005)

---

## T+4 (2026-04-29) — 3원칙 (Auto Mode 자율 일괄 적용) ✅

Auto Mode → 5 핵심 결정 일괄 자율 적용:

| 결정                                                                    | 채택 |
| ----------------------------------------------------------------------- | ---- |
| Architecture 분류 = Modular Monolith hybrid (cap 0.65)                  | ✅   |
| 메인 사전 fetch 정정 채택 (F-044 등록)                                  | ✅   |
| PoC #1 finding 외부 검증 분류                                           | ✅   |
| 신규 finding 6건 정식 등록 (F-042~F-047)                                | ✅   |
| inventory.json 표현 확장 (modules / orm.secondary / candidates.caveats) | ✅   |

→ 4단계 진입.

---

## T+5 ~ T+9 (2026-04-29) — 4단계 산출 ✅

### 정확 통계 (메인 deterministic 측정)

```bash
# Java 92 파일 / 4,614 LOC / 159,300 byte
module/core: main 22 (1,220 LOC) / test 9 (1,369 LOC) / testFixtures 4 (56 LOC)
module/persistence: main 17 (593 LOC) / test 1 (22 LOC)
server/api: main 33 (1,077 LOC) / test 6 (277 LOC)
확장자: .java 92 / .kts 5 / .md 4 / .yaml 3 / .toml 1 / .sql 1 / .sh 1 / .key 1 / .pub 1 / .json 1 / .properties 1 / .png 1 / .ico 1 / .gitignore 1 / .txt 1
```

### Senior 정정 검증 (메인 한 번 더)

```bash
grep -nE "(@Service|@Entity|@Column|@Table|@Id|jakarta\.|javax\.)" module/core/src/main/java/io/zhc1/realworld/{service/UserService.java,model/User.java}
```

결과:

- UserService.java: `import org.springframework.stereotype.Service;` + `@Service` ✅
- User.java: `import jakarta.persistence.{Column,Entity,GeneratedValue,GenerationType,Id,Table};` + `@Entity` + `@Table(name="users")` + `@Column` ✅

→ Senior 정정 100% 검증. 메인 사전 단언 폐기.

### output/inventory/ 5종 작성 ✅

| 파일                 | 분량    | 핵심                                                                                                                                                    |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inventory.json`     | ~270 줄 | schema 정합 + repo.modules[] + stack.backend.orm.{primary,secondary} + architecture_style_candidates.caveats[] + meta.warnings + human_review_required  |
| `tree.md`            | ~210 줄 | 최상위 / 3 모듈 / 통계 요약 / PoC #1 비교 표                                                                                                            |
| `stats.json`         | ~90 줄  | 모듈별 + source set 별 + 확장자별 + non-Java assets + PoC #1 비교                                                                                       |
| `stack-detection.md` | ~210 줄 | 한 줄 요약 + 기술 스택 표 + ORM 4단서 점검 + 인증/JWT + 모듈 구조 그래프 + Architecture 분류 + 분석 우선순위 + ground truth + PoC #1 비교 + 신뢰도 자평 |
| `_manifest.yml`      | ~200 줄 | 신뢰도 산정 (raw 0.95 → weighted_avg 0.93) + 5 핵심 결정 + KPI + 한계 + 6 finding + 다음 단계                                                           |

---

## T+10 (2026-04-29) — Phase 1 마감 + finding 정식 등록 + memory 갱신 ✅

### findings/poc-findings.md 신규 작성

`examples/poc-02-realworld-springboot3/findings/poc-findings.md` 작성:

- F-042 (high / promoted / 묶음 H 신규)
- F-043 (medium / promoted / 묶음 H)
- F-044 (medium / promoted / 묶음 A 보강 )
- F-045 / F-046 / F-047 (low / deferred)
- PoC #1 finding 33건 외부 검증 분류

### 누적 통계 갱신

```yaml
cumulative_total: 39 # PoC #1 33 + PoC #2 6
v120_bundles: 8 # +1 (H 신규)
```

---

## Phase 1 종료 — 신뢰도 자평 (formula v1)

```
raw confidence: 0.93
- base 0.75
- + orm_full +0.10 / domain_context_md +0.03 / postman_or_api_test +0.05 / diagrams_other +0.02
- subtotal raw 0.95
- weighted_average (요소 수 기반) 0.93
  - architecture_style_candidates cap 0.65 (Senior 정정 반영) 으로 평균 ↓
- cap 0.98 미적용
```

### Phase 1 KPI 평가

- ✅ **finding 6건 정식 등록** (목표 5~15 건강 범위 정합)
- ✅ schema 검증 통과 (v1.1.2 inventory.schema.json)
- ✅ 5 핵심 결정 (DEC-PHASE1-POC02-001~005) — Senior 권고 일괄 적용
- ✅ F-015 메인 정정 케이스 — v1.2.0 묶음 A 강한 외부 검증 데이터 확보
- ✅ multi-module 환경 검증 데이터 확보 (PF-001 → F-042 묶음 H 신규)
- ⭐ Phase 1 부가가치 — PoC #1 finding 4건 (Phase 1 영역) 외부 검증 완료 + Phase 2~6 영역 9건 시그널 분류

---

## 다음 단계 (Phase 2 인계)

1. **Phase 2 (db) 진입** — Auto Mode 자율
2. 핵심 read 대상:
   - `module/persistence/src/main/resources/schema.sql` (DDL ground truth)
   - `module/persistence/src/main/resources/application.yaml` + `server/api/src/main/resources/application.yaml`
   - `module/core/model/{User,Article,ArticleComment,Tag,UserFollow,...}.java` 의 @Entity 직접 read
3. ddl-auto 설정 확정 (HEAD commit "Disable open-in-view" 단서)
4. DRIFT 검증 — PoC #1 9건 DRIFT 패턴 본 환경 재현 검증
5. AP-DOMAIN-002 (email/username unique) 본 환경 재현 검증

---

**END OF PROGRESS-poc02-phase1.md (Phase 1 ✅ 완료)**
