# v1.1.2 격상 진행 로그

> 사람이 시간순으로 읽기 위한 진행 기록.
> 산출물 자체는 `.claude/plans/plan-v112.md`, `.claude/researches/*-v112*.md` 참조.

---

## 한 눈에 보는 현재 상태 (2026-04-28 코드 적용 완료)

- **단계**: 4원칙 (코드 적용) **완료** ✅
- **격상 결과**: v1.1.1 → **v1.1.2 PATCH 릴리스 완료**
- **다루는 finding**: 4건 (F-007 / F-009 / F-016 / F-023) **모두 closed**
- **다음 액션**: PoC #01 Phase 4 진입 (갱신 명세 적용) — 별도 세션
- **블로커**: 없음
- **호환성**: PATCH (모든 schema 변경 옵셔널 신규 필드 — Breaking change 없음)

---

## 시간순 진행 로그

### Phase A — F-021 임계 결정 (대화 시작 ~ 09:00경)

| 시각 | 이벤트 | 비고 |
|---|---|---|
| 시작 | 윤주스: "어디까지 했지?" | RESUME.md 기반 컨텍스트 복구 |
| - | Claude: Option A/B/C 제시 — A=PoC 정지+v1.1.2 격상 / B=PoC 계속+v1.1.2 병행 / C=현행 유지 | F-021 임계 trigger (finding 18건, high 4건) |
| - | 윤주스: "B를 왜 추천?" → 토론 → **"A"** 선택 | A 채택 근거: high 4건이 PoC 진행 중 계속 누적 우려 |
| - | 윤주스: "F-007 같은 게 무슨 뜻이야?" → Finding ID 체계 설명 (F-### = phase 무관 일련번호) | - |

### Phase B — 1원칙 (plan-v112.md 작성, 09:02)

| 시각 | 이벤트 | 비고 |
|---|---|---|
| 09:02 | `plans/plan-v112.md` 저장 (14KB) | 변경 대상 12 파일 (신규 3 + 보강 9), Q1~Q6 결정 매트릭스 |

### Phase C — 2원칙 (3-에이전트 research, 09:44 ~ 11:06)

#### C-1. 첫 번째 시도 — 3-에이전트 동시 실행

| 시각 | 이벤트 | 비고 |
|---|---|---|
| 09:44 | senior agent **완료** → `senior-v112.md` (17KB) 저장 | 강한 brake 의견. schema 의 "intent" 단어 제거 권고. F-007 보류, F-023 v1.2.0 + ADR-006 provisional 제안. **내부 error 발생 → 재저장**으로 복구 |
| 09:47 | document agent **완료** → `document-v112.md` (24KB) 저장 | 공식 출처 24개 (Spring Modulith 2.0.6, ArchUnit 1.4.2, Hibernate 6.6, JSON Schema 2020-12). 4건 모두 격상 가능 권장 |
| ~10:00 | case agent **hang** (10분 진행 후 idle, 총 43분 idle) | 원인: 한국 테크블로그 Cloudflare anti-scraping WebFetch hang + 4 finding 동시 처리 + WebFetch 횟수 제한 없음 |
| - | 윤주스 피드백: "정확히 어떤 작업 중인데 이렇게 느림?" / "안되는거 아냐?" / "다시 요청은 못하나?" | - |
| - | 윤주스 결정: **"나머지도 진행하자. 대신 하나씩 진행하자."** | 4 finding 분리 + tighter prompts |

#### C-2. case agent 분리 재실행 (finding 별 1개씩)

| 시각 | 이벤트 | 산출물 |
|---|---|---|
| 10:48 | case-f023 완료 | `case-v112-f023.md` (12KB) — **결정타**: Spring Modulith Discussion #493 (Oliver Drotbohm 본인 답변). senior 60:40 우세 |
| 10:54 | case-f016 완료 | `case-v112-f016.md` (14KB) — 영문 권위자료 7/7 매트릭스 반대 (Vlad Mihalcea, Stripe, Atlasgo). senior 압승 |
| 10:59 | case-f009 완료 | `case-v112-f009.md` (14KB) — 8개 시스템 中 결정성 축 5건, 환경별 분리 0건. senior 압승 |
| 11:04 | case-f007 완료 | `case-v112-f007.md` (11KB) — **반전**: Backstage/CycloneDX/Cookpad 산업 표준 = schema 게시. 단 OpenAPI 7년 divergence 사례로 senior 우려 입증 |

#### C-3. 통합 research 작성

| 시각 | 이벤트 | 비고 |
|---|---|---|
| 11:06 | `research-v112.md` (19KB) 저장 | §0~§11, Q1~Q9 + ACK 1~3 결정 매트릭스. 격상안 = v1.1.2 PATCH (조건부) |

### Phase D — PROGRESS 로그 도입 (압축 직후)

| 시각 | 이벤트 | 비고 |
|---|---|---|
| 압축 후 | 윤주스: "지금 진행되는 과정을 로그로 남기고 있지? 사람이 알아 볼 수 있도록" | 산출물(plan/research)만 있고 시간순 로그 부재 인정 |
| 압축 후 | `PROGRESS-v112.md` 신설 | 시간순 진행 로그 + 결정 이력 + 블로커 이력 + 다음 액션 |
| 직후 | 윤주스: "1. 진행마다 사람이 읽을 수 있는 로그로 대전제 / 2. 남은 작업 진행" | 통합 권장 (Q1~Q9 모두 B) 채택으로 해석 |
| 직후 | feedback 메모리 신설: `feedback_progress_log.md` — PROGRESS 로그 대전제 | 모든 작업에 적용 |

### Phase G — 사용자 결정 6건 일괄 처리 (2026-04-28 잔여 finding 처분 직후)

**목적**: Phase 4 진입 전 사용자 결정 6건 일괄 처리 (재작업 0 정책 — memory feedback_quality_priority.md).

| 단계 | 작업 | 산출물 |
|---|---|---|
| G.1 | 4원칙 1단계 — 전수 조사 | `.claude/plans/plan-decisions-6.md` (6 결정 컨텍스트 + 영향 범위 + 리스크) |
| G.2 | 4원칙 2단계 — 3 관점 토론 | `.claude/researches/research-decisions-6.md` (document/case/senior 합의 6/6) |
| G.3 | 4원칙 3단계 — 사용자 승인 | 윤주스 6건 일괄 승인 (DRIFT-002 단방향 의미 추가 설명 후) |
| G.4 | 4원칙 4단계 — 일괄 적용 | 7 파일 갱신 |

**G.4 갱신 7 파일**:
1. `output/db/schema.json` — user_decisions[4] + recommendations[3] + drift_count 8→9 + warnings 갱신 + 4 DRIFT drift_note resolution
2. `output/db/정합성-검증-보고서.md` — DRIFT-002/003/007/010 resolution 블록 + §6 결정 완료 표
3. `output/architecture/architecture.json` — user_decisions[2] (CIRCULAR-001 ADR-006 default + ARCH-STYLE 승인) + circular_dependencies[CIRCULAR-001] v1.1.2 새 필드 7개 + correction_trace approval_status
4. `output/architecture/circular-dependencies.md` — §1.4 RESOLVED + ADR-006 default 명시 + severity_change low→medium 사유
5. `output/architecture/architecture.md` — §2 ✅ APPROVED + §4.3 ✅ RESOLVED
6. `findings/poc-findings.md` — F-024 disposition 에 living_case_evidence 추가
7. `examples/poc-01-realworld-spring/RESUME.md` — §3 ✅ 완료 표 + Phase 4 입력 체크리스트

**핵심 결정 사항**:
- DRIFT-002 단방향: API spec 비대칭 행동 + Twitter 패턴 정합. DDL 의 양쪽 FK CASCADE 가 ManyToMany 형태이지만 의미는 단방향 (도메인 의미 + 데이터 표현 분리).
- DRIFT-007 NO ACTION 유지 + 사내 격상 메모: 본 PoC medium / 사내 high. REC-002 (soft delete + author placeholder) 사내 default.
- DRIFT-010 Phase 4 라우팅: 회원가입 service 의 application 레벨 unique 검증이 결정 핵심. REC-003 등재.
- CIRCULAR-001 ADR-006 default: bc_status=undefined → medium + decision_required + Phase 4 라우팅. low→medium 변경 사유: ArchUnit FreezingArchRule 산업 표준 보수적 default.
- ARCH-STYLE 승인: 5 차원 결정적 검증 + 카카오페이 회고 + 우형 + 카카오뱅크 + Vernon IDDD 모두 정정 방향 일치.

**JSON validity**: schema.json + architecture.json 둘 다 검증 통과.

**다음**: Phase 4 진입 — 4원칙 1단계 plan-phase4.md 작성. v1.1.2 갱신 명세 100% 전수 조사 + 6 결정 후속 검증 항목 통합.

---

### Phase F — finding-system 메타화 + 잔여 finding 처분 (2026-04-28 v1.1.2 머지 직후)

**목적**: 잔여 finding 10건을 finding-system.md §8 결정 트리로 처분 + 메타 자산화.

| 단계 | 작업 | 산출물 |
|---|---|---|
| F.1 | finding-system.md DRAFT 작성 (자산화 대기) | `methodology-spec/finding-system.md` (11 절) — 자산화 후보 위치 A/B/C 명시 |
| F.2 | memory 등록 | `memory/project_finding_system.md` + `MEMORY.md` 인덱스 |
| F.3 | 잔여 10건 §8 결정 트리 적용 | closed 1 (F-021) + promoted 5 (F-015/F-018/F-022/F-024/F-025) + deferred 4 (F-008/F-017/F-019/F-026) + rejected 0 |
| F.4 | poc-findings.md 갱신 | 각 finding 에 `disposition` 또는 `resolution` 블록 추가 + 누적 통계 표 갱신 (closed 8 → 9, open 10 → 0, promoted 5 + deferred 4 명시) + v1.2.0 격상 묶음 (A/B/C/D) 인덱스 |
| F.5 | RESUME.md §4.2 갱신 | "잔여 finding 처분 ✅ 완료" + 4 묶음 v1.2.0 후보 |
| F.6 | CLAUDE.md 갱신 | 잔여 finding 처분 결과 + finding-system.md DRAFT 메타 자산 명시 |

**핵심 결정**:
- F-021 = closed (자체 종결): Option A 실행 + finding-system.md §7 임계 절차 정식 반영으로 spec_gap 해소.
- rejected 0건: 모든 finding 명세 책임 범위 내. 사용자가 추정한 reject 2건 (F-015, F-021) 은 분석 결과 promoted/closed 가 정확.
- v1.2.0 격상 묶음 4개 (A. cross-validation / B. 정정 트레이스 / C. severity 표준 / D. schema 진화).
- v1.3.0 분리 후보: F-008/F-017/F-019/F-026 + F-024 임계값 부분.

**다음**: Phase 4 진입 (잔여 finding 차단 없음).

---

### Phase E — 4원칙 (코드 적용, 5 영역)

#### E-1. 영역 A (F-007) — inventory schema/template 신설

| 산출물 | 변경 |
|---|---|
| `schemas/inventory.schema.json` | **신규** (meta + repo + stack + architecture_style_candidates + modules_for_priority_analysis + directory_tree_extraction) |
| `templates/inventory.template.json` | **신규** (placeholder 형식, schema $schema 참조) |
| `templates/inventory.template.md` | **신규** (사람용 README 형식, warnings 섹션 포함) |
| `schemas/README.md` | **신규** (9개 schema 목록 + CI 검증 TODO v1.3.0 + 산업 사례 OpenAPI 7년 divergence) |

핵심 결정:
- `architecture_style_candidates[].confidence` cap 0.7 (Phase 1 한계)
- `repo.loc_extraction_method` enum (deterministic / heuristic_byte_per_35 / estimation / unknown)
- `directory_tree_extraction.truncated` boolean (Trees API 한계)
- Q7=B 채택: schema 신설 + 최소 CI TODO (Backstage 모델)

#### E-2. 영역 B (F-009) — phase-1-init.md §6

| 산출물 | 변경 |
|---|---|
| `methodology-spec/workflow/phase-1-init.md` §6 | 단일 표 + 결정성 (Determinism) 축 + caveat 컬럼 (환경별 분리 거부) |

핵심 결정:
- 결정성 tier 6개: deterministic / snapshot-based / heuristic / pattern_matching / llm_with_grounding / llm_code_only
- inventory.meta.warnings 의무화 (heuristic LOC, truncated tree, ORM 단서 부족)
- 안티 패턴 명시: "환경별로 표 자체를 분리" 거부 (DRY 위반 + enum 폭발 + 산업 표준 0건)
- Q6=B 채택 (사례 5/8, 환경별 분리 0/8)

#### E-3. 영역 C (F-016) — phase-2-db.md §3.4

| 산출물 | 변경 |
|---|---|
| `methodology-spec/workflow/phase-2-db.md` §3.4 | 7행 매트릭스 → 원칙 + Decision Tree + 부록 reference |

핵심 결정:
- 원칙 3개 (자동 schema 변경 금지 / DDL versioned-reviewable-reversible / ORM = validate 한정)
- Decision Tree (마이그레이션 도구 도입 → 운영 DB 존재 → 우선순위)
- 부록 A: Hibernate ddl-auto enum 값 reference (none/validate/update/create/create-drop)
- Q5=B 채택 (영문 권위 자료 7/7 매트릭스 반대)

#### E-4. 영역 D (F-023) — phase-3-arch.md §3.1 + ADR-006 + architecture schema (가장 큰 변경)

| 산출물 | 변경 |
|---|---|
| `methodology-spec/workflow/phase-3-arch.md` §3.1.1 | **신설** Tarjan SCC + BC 분기 + decision_required 5단계 |
| `schemas/architecture.schema.json` `circular_dependencies[]` | **보강** 신규 옵셔널 필드 7개 (id / detection.algorithm / bc_status / bc_assignment_explicit / documented_decision / decision_required / decision_owner / decision_deadline / phase_4_routing) |
| `docs/adr/ADR-006-순환의존성-처리-default.md` | **신규** Provisional, revisit_at: PoC #02 |

핵심 결정:
- 3값 `bc_status` enum (same / different / undefined) + 2 boolean (bc_assignment_explicit, documented_decision)
- "intent" 단어 회피 (Q2=B, 산업 표준 0건)
- BC 미정의 default = medium + decision_required = true (Q3=B, ArchUnit FreezingArchRule 산업 표준)
- 신규 ADR-006 Provisional (Q4=B, PoC #02 hedge)
- 1차 사료: Drotbohm Discussion #493 ("DAG is key... but interface inversion")

#### E-5. 영역 E — 마무리 (CHANGELOG + finding status + RESUME)

| 산출물 | 변경 |
|---|---|
| `CHANGELOG.md` | v1.1.2 엔트리 추가 (Added/Changed/Documentation/Migration Guide/영향 범위/검증/Lessons Learned) |
| `examples/poc-01-realworld-spring/findings/poc-findings.md` | F-007/F-009/F-016/F-023 status: open → closed + resolution 섹션 + 누적 통계 갱신 (closed 4 → 8) |
| `examples/poc-01-realworld-spring/RESUME.md` | §0 v1.1.2 격상 완료 섹션 신설 + §4 (F-021) 격상 완료 표시 + §5 다음 세션 명령어 갱신 |
| `methodology-v1.1/.claude/PROGRESS-v112.md` | Phase D + E 추가 (본 문서) |

---

## 최종 산출 통계

- **신규 파일**: 5개 (inventory schema/2 templates + schemas/README.md + ADR-006)
- **변경 파일**: 6개 (phase-1-init/phase-2-db/phase-3-arch + architecture.schema.json + CHANGELOG + poc-findings + RESUME)
- **호환성**: PATCH (모든 schema 변경 옵셔널 신규 필드)
- **closed finding**: 4 → 9 (v1.1.2 로 F-007/F-009/F-016/F-023 신규 closed + F-021 자체 종결)
- **잔여 finding**: 14 → 10 → **0** (Phase F 처분 후 — promoted 5 + deferred 4)

---

## 결정 이력

### 윤주스 확정 결정

| # | 결정 | 근거 |
|---|---|---|
| 1 | F-021 임계 처리: **Option A** (PoC 정지 + v1.1.2 격상) | high 4건이 PoC 진행 중 계속 누적될 우려. 격상 후 PoC 재개가 정렬됨 |
| 2 | case agent hang 시: **하나씩 분리 진행** | 동시 실행 = 디버깅 어려움 + 한 번 죽으면 전체 재시작. 분리 = 부분 실패 격리 |

### Claude 제안 (3원칙 승인 대기 중)

통합 권장은 **B 위주**. 항목별 선택지는 `research-v112.md` §10 참조.

| Q | 권장 | 한 줄 요약 |
|---|---|---|
| Q1 | A. v1.1.2 PATCH | 호환 깨지는 변경 없음, MINOR 보다 PATCH가 적합 |
| Q2 | B. 3값 bc_status + 2 boolean | senior 권고 (schema 에 "intent" 단어 제거) |
| Q3 | B. medium + decision_required | BC 미정의 default 안전치 |
| Q4 | B. 신규 ADR-006 (provisional) | F-023 결정의 임시성 명시 |
| Q5 | B. 원칙 + Decision Tree + 부록 | F-016 형식 (영문 권위자료 7/7 지지) |
| Q6 | B. 결정성 단일 표 + caveat | F-009 분류축 (사례 5/8 지지) |
| Q7 | B. schema + 최소 CI TODO | F-007 (Backstage 모델 채택) |
| Q8 | B. v1.1.2 후 별도 1일 작업 | 잔여 finding 14건 처분 분리 |
| Q9 | B. F-023 schema warnings + ADR-006 동시 | PoC #02 hedge |

---

## 블로커 / 복구 이력

| 시점 | 블로커 | 진단 | 복구 |
|---|---|---|---|
| ~10:00 | case agent 43분 idle | 한국 테크블로그 Cloudflare anti-scraping → WebFetch hang | 4 finding 분리 + 한국 테크블로그 제외 + max 8 WebFetch + 8분 hard limit |
| 09:44 | senior-v112.md Write 시 internal error | Tool result missing | 디렉토리 확인 후 재작성 (내용 손실 없음) |

---

## 다음 액션 (3원칙 통과 후)

플랜 §7 권장 순서: **작은 단위 → 큰 단위**

| 영역 | 대상 | 산출물 변경 |
|---|---|---|
| A | F-007 inventory schema/template | `schemas/inventory.schema.json`, `templates/inventory.template.md`, CI TODO 추가 |
| B | F-009 phase-1 §6 결정성 단일 표 | `methodology-spec/workflow/phase-1-init.md` |
| C | F-016 phase-2 §3.4 원칙 + Decision Tree | `methodology-spec/workflow/phase-2-db.md` |
| D | F-023 §3.1 + ADR-006 신규 + architecture schema | `methodology-spec/workflow/phase-3-architecture.md`, `docs/adr/ADR-006-*.md`, `schemas/architecture.schema.json` |
| E | CHANGELOG + finding status 갱신 | `CHANGELOG.md`, PoC finding 파일 4건 status update |

별도 후속: 잔여 finding 14건 처분 (격상/기각/유예) — Q8 결정대로 v1.1.2 머지 후 1일 작업.

---

## 산출물 색인

```
methodology-v1.1/.claude/
├── PROGRESS-v112.md            ← 본 파일 (진행 로그)
├── plans/
│   └── plan-v112.md            ← 1원칙 (변경 계획)
└── researches/
    ├── document-v112.md        ← 2원칙 — 공식문서
    ├── senior-v112.md          ← 2원칙 — 시니어 의견
    ├── case-v112-f007.md       ← 2원칙 — 사례 (Backstage/CycloneDX)
    ├── case-v112-f009.md       ← 2원칙 — 사례 (결정성 축)
    ├── case-v112-f016.md       ← 2원칙 — 사례 (Hibernate ddl-auto)
    ├── case-v112-f023.md       ← 2원칙 — 사례 (Spring Modulith)
    └── research-v112.md        ← 2원칙 — 통합 + Q1~Q9 매트릭스
```

---

## 갱신 규칙

- **언제 갱신?**: 단계 전환 시 (1→2원칙, 2→3원칙, 3→4원칙), 블로커 발생/복구 시, 사용자 결정 시
- **누가 갱신?**: 메인 에이전트 (Claude) — sub-agent 는 본 파일 직접 수정 금지
- **압축 후?**: 컨텍스트 압축 직후 본 파일을 최우선 참조
