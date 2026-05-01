# Sprint 3 보고서 — Phase 4.5 정식 명세화 + JSON 짝 + 강화점 α+β + M-P1 병행

> **일자**: 2026-04-30
> **작업**: Sprint 1 (BR 1) → Sprint 2 (BR 5 + F-074 단방향) → **Sprint 3 (정식 명세화 + 본체 갭 P1 2건)**
> **트리거**: DEC-시퀀스-C-A-B-확정 / DEC-이중-렌더링-사상-명시화 / DEC-안티패턴-마이그레이션-가이드 / **DEC-2026-04-30-M-묶음-갭-식별 (P1 병행)**
> **★ 핵심 가치**: v1.2.0 격상 ready 선언 — 묶음 L (Phase 4.5 정식) + M (본체 갭 P1) + P (안티패턴 마이그레이션) 데이터 100%

---

## 1. 실행 요약

| Phase | 작업 | 결과 | 시간 |
|---|---|---|---|
| A-1 | M-P1-#2 ADR-008 (이중 렌더링 사상) | ✅ docs/adr/ADR-008-이중-렌더링-사상.md | ~40분 |
| A-2 | M-P1-#1 finding-system.schema.json | ✅ schemas/finding-system.schema.json + README 갱신 | ~30분 |
| B | Sprint 3 #1 Phase 4.5 정식 명세화 | ✅ workflow + deliverable + schema + 4 template | ~90분 |
| C | Sprint 3 #2 Mermaid JSON 짝 일괄 | ✅ 4 .json 짝 (state-machines 2 + sequence-diagrams 2) / drift 0건 | ~45분 |
| D | Sprint 3 #3 강화점 α+β | ✅ schema 갱신 + 21 AP backfill + migration-cautions.md + phase-6 갱신 | ~60분 |
| E | Sprint 3 #4 F-021 §8.1 점검 | ✅ closed 한계 후보 2건 식별 (F-016 / F-023) — strong 후보 0건 | ~15분 |
| F | Sprint 3 #5 본 보고서 | ✅ | ~20분 |

**총 작업 시간**: ~5시간 (plan 정합).

---

## 2. ★ 본 Sprint 핵심 산출물 (17 단위)

### 2.1 신규 파일 (13)

#### 방법론 본체 (M-P1 + Sprint 3 #1 = 8건)
```
docs/adr/
└── ADR-008-이중-렌더링-사상.md (M-P1-#2 ★)

schemas/
├── finding-system.schema.json (M-P1-#1 ★)
└── formal-spec.schema.json (Sprint 3 #1)

methodology-spec/
├── workflow/phase-4-5-formal-spec.md (Sprint 3 #1)
└── deliverables/4-5-formal-spec.md (Sprint 3 #1)

templates/
├── formal-spec.template.md (Sprint 3 #1)
├── state-machine.template.mermaid (Sprint 3 #1)
├── sequence.template.mermaid (Sprint 3 #1)
└── decision-table.template.md (Sprint 3 #1)
```

#### PoC #02 (5건)
```
output/formal-spec/
├── state-machines/
│   ├── User-Account.json (Sprint 3 #2)
│   └── User-Following.json (Sprint 3 #2)
├── sequence-diagrams/
│   ├── UC-USER-SIGNUP.json (Sprint 3 #2)
│   └── UC-USER-FOLLOW.json (Sprint 3 #2)
└── SPRINT-3-REPORT.md (본 파일)

output/antipatterns/
└── migration-cautions.md (Sprint 3 #3 β ★)
```

### 2.2 갱신 파일 (4)

```
schemas/
├── README.md (finding-system + formal-spec 추가)
└── antipatterns.schema.json (migration_advice 필드 — α)

methodology-spec/workflow/
└── phase-6-quality.md (migration-cautions.md 의무 산출물 격상)

examples/poc-02-realworld-springboot3/output/antipatterns/
└── antipatterns.json (21 AP migration_advice backfill — α)
```

---

## 3. 이중 렌더링 정합도 추이 (Sprint 1 → 1.5 → 2 → 3)

| Sprint | 정합도 | 측정 영역 |
|---|---:|---|
| 1 | 67% | state-machine 1 + sequence 1 + decision-table 1 + invariants 1 (.mermaid/.md/.ts 단방향) |
| 1.5 | 87.5% | + property-test 명세 + Sprint 1 산출물 보강 |
| 2 | 90.5% | + BR 4건 추가 (state-machine + sequence + decision-table 5건 + invariants 2건) |
| **3** | **100%** (state-machine + sequence 영역) | **+ .json 짝 4건 (User-Account / User-Following / UC-USER-SIGNUP / UC-USER-FOLLOW)** |

### 영역별 100% 분해

| 영역 | .json | .mermaid/.md | 짝 |
|---|---|---|---|
| state-machines | ✅ 2 (Sprint 3 #2) | ✅ 2 | 100% |
| sequence-diagrams | ✅ 2 (Sprint 3 #2) | ✅ 2 | 100% |
| decision-tables | ⚠️ 0 (Sprint 3 plan 외) | ✅ 5 | 50% (.json 짝 부재 — 후속 작업) |
| invariants | ✅ 2 (.ts 양쪽 공용) | (해당) | 100% |
| property-tests | ✅ 2 (.ts 양쪽 공용) | (해당) | 100% |

→ **Sprint 3 plan 범위 (state-machine + sequence) = 100% ✅**.
→ **decision-tables .json 짝 (5건) = 후속 작업 (v1.2.0 격상 시 또는 별도 sprint)**.

### Drift 검증 결과
- 4 .mermaid ↔ .json 의미적 정합: **drift 0건** ✅
- 발견된 신규 finding: 0건 (이중 렌더링 정합 모두 통과)

---

## 4. M-P1 병행 결과 (방법론 본체 갭 해소)

### M-P1-#1 finding-system.schema.json
- **상태**: 자산화 대기 → 정식 등록 ✅
- **schema 항목**: finding_id (pattern) / phase (0~6 + "4.5") / severity (low/medium/high/critical) / status (open/candidate/promoted/closed/deferred/rejected/merged) / cross_validation (double_hit) / severity_history
- **PoC 운영 경험 반영**: PoC #02 candidate / merged / critical / cross-validation double_hit 등 PoC #02 신규 패턴 모두 schema 화

### M-P1-#2 ADR-008 (이중 렌더링 사상)
- **상태**: DEC 만 등록 → ADR 정식 본문 ✅
- **구조**: Context / Decision (정의 + 학문적 계보 Knuth 1984 + 영역별 적용 매트릭스) / Consequences (Positive 7 / Negative 3) / Alternatives 3 / 도구 선정 기준 / 신규 산출물 체크리스트
- **ADR-001 관계**: 포섭 (supersede X) — Schema-First = 이중 렌더링의 AI 눈 부분

→ **묶음 M 데이터 충분도: P1 100% (Sprint 3) + P2-3 5건 (v1.2.0 격상 시 일괄)**.

---

## 5. Sprint 3 #1 Phase 4.5 정식 명세화

### 4 산출물 모두 작성 ✅

| 영역 | 파일 | 핵심 내용 |
|---|---|---|
| workflow | phase-4-5-formal-spec.md | 5 산출물 처리 / Cross-validation 의무 / Static tool 의무 (DEC-static-tool) / 자연어 빈약성 정량 (44% / 100%) |
| deliverables | 4-5-formal-spec.md | 5 산출물 매트릭스 / 신뢰도 등급 / 흔한 함정 4건 |
| schema | formal-spec.schema.json | 5 산출물 sub-schema + cross_validation 메타 (real_tool 의무 / double_hits / drift_detected) |
| templates | formal-spec.template.md + state-machine.template.mermaid + sequence.template.mermaid + decision-table.template.md | 5 산출물 작성 가이드 + Mermaid 예시 + 9 항목 표 |

→ **묶음 L 데이터 충분도: 100% ✅** (Sprint 1+1.5+2 누적 + 본 Sprint 정식화).

---

## 6. Sprint 3 #3 강화점 α+β

### α — antipatterns schema + 21 AP backfill
- `schemas/antipatterns.schema.json` 에 `migration_advice` 필드 추가 (optional — 호환성 유지)
- PoC #02 21 AP 모두 migration_advice backfill ✅
  - critical 3 (상세): AP-API-001 / AP-DB-001 / AP-SECURITY-001
  - high 3 (중간): AP-ARCH-001 / AP-DOMAIN-001 / AP-PERFORMANCE-001
  - medium 10 (1-2줄): API/ARCH/DB/DOMAIN 카테고리
  - low 5 (1줄): API/DOMAIN 카테고리

### β — migration-cautions.md 신규
- `examples/poc-02-realworld-springboot3/output/antipatterns/migration-cautions.md` (~190 line)
- 카테고리별 (API/DB/Security/Architecture/Domain/Performance) 회피 가이드
- design / CI / Review 단계 체크리스트
- severity 기반 적용 우선순위 (Priority 0~3)
- `methodology-spec/workflow/phase-6-quality.md` 갱신 — migration-cautions.md 의무 산출물 격상

→ **묶음 P 데이터 충분도: 100% ✅** (PoC #02 21 AP 적용 완료).

---

## 7. Sprint 3 #4 F-021 §8.1 단일 PoC 과적합 회피 점검

### 점검 대상
- PoC #01 closed 8건 + PoC #02 finding 43건 cross-validation 결과

### Strong 후보 (closed → deferred 강등 권고): **0건**
- PoC #02 외부 검증에서 closed 4건 (F-007 / F-009 / F-016 / F-023) 모두 핵심 기능은 통과
- 단 한계 영역 부분적 노출 (아래 한계 명시 후보 2건)

### 한계 명시 후보 (closed 유지 + 한계 명시 권고): **2건**

#### F-016 (ddl-auto 분기 부재) — closed 유지
- **PoC #02 한계**: F-049 메타 finding — schema.sql ORM derivative 출처 의존성 분별 절차 신설 권고
- **권고**: `methodology-spec/workflow/phase-2-db.md §3.2` 에 "F-049 한계 영역" 명시 (별도 작업 — v1.2.0 격상 시 처리)

#### F-023 (SCC 도메인 의도 분기 부재) — closed 유지
- **PoC #02 한계**: F-060 메타 finding — `§3.1.1 0건 케이스` 한계
- **권고**: 명세 본체에 0건 처리 절차 보강 (v1.2.0 격상 시 처리)

### 결론
- **§8.1 강제 점검 통과** — 단일 PoC 과적합 strong 후보 0건
- 한계 명시 2건은 v1.2.0 격상 시 명세 보강 (closed → 한계 명시 closed)
- PoC #02 closed 0건 (모두 promoted/candidate/deferred) → 추가 과적합 risk 낮음
- **F-021 임계 측면**: 누적 106건 (Sprint 2 종결 시점) — 단일 PoC 과적합 회피 §8.1 강제 적용 결과 안정

---

## 8. 묶음 격상 데이터 충분도 (16/16)

| 묶음 | 영역 | 데이터 | 격상 ready |
|---|---|---|:---:|
| A | cross-validation (F-015) | PoC #02 외부 검증 ✅ | ✅ |
| B | 정정 트레이스 | PoC #01 단독 | ✅ |
| C | severity 표준 | PoC #01 단독 | ✅ |
| D | schema 진화 | PoC #02 multi-module | ✅ |
| E | quality-extraction | PoC #01 단독 | ✅ |
| F | 신뢰도 공식 | PoC #01 단독 | ✅ |
| G | OpenAPI x-extension | PoC #02 외부 검증 ✅ | ✅ |
| H | multi-module / Auth/Crypto | PoC #01+#02 isomorphic ★★★ | ✅ |
| I | finding-system 정식화 | PoC #02 메타 + **Sprint 3 schema 등록** | ✅ |
| J | Hexagonal port-adapter | PoC #02 단독 | ✅ |
| K | multi-module Outside-in | PoC #02 신규 | ✅ |
| **L** | **Phase 4.5 형식화 정식 도입** | **Sprint 1+1.5+2+3 누적 — 정식 명세화 완료 ★★★** | ✅✅✅ |
| **M** | **본체 이중 렌더링 갭 해소** | **DEC 식별 + Sprint 3 P1 2건 적용** (P2-3 5건 v1.2.0 일괄) | ✅ |
| N | Drift 자동 검증 도구 (CI) | C-Sprint 4 (다음 sprint) | ⏳ |
| O | ★★★ 진짜 외부 도구 의무화 | C-Sprint 4 (다음 sprint) | ⏳ |
| **P** | **안티패턴 migration_advice + migration-cautions** | **Sprint 3 α+β 적용 완료** | ✅ |

→ **v1.2.0 격상 ready 묶음**: 14/16 (N+O 만 Sprint 4 대기)
→ **즉시 격상 가능**: A~M + P (14 묶음)

---

## 9. 신뢰도 추이 (Sprint 1 → 1.5 → 2 → 3)

| | Sprint 1 | Sprint 1.5 | Sprint 2 | **Sprint 3** |
|---|:---:|:---:|:---:|:---:|
| 신뢰도 (정직) | 60-70% | 80-87% | 80-87% | **80-87% 유지** (시뮬 패널티) |
| 이중 렌더링 정합 | 67% | 87.5% | 90.5% | **100% (state-machine + sequence)** |
| 누적 drift | 4 | 15 | 34 | **34 (Sprint 3 신규 0건)** |
| BR 형식화 건수 | 1 | 1 | 6 | 6 (변동 없음) |
| 묶음 L 데이터 | 50% | 80% | 100% | **100% + 정식 명세화** |
| 묶음 M 데이터 | - | - | - | **P1 100% + P2-3 v1.2.0 격상** |
| 묶음 P 데이터 | - | - | DEC 등록 | **100% (α+β 적용)** |

**Sprint 4 목표** (다음 sprint):
- 신뢰도 80-87% → **90-95%** (진짜 static tool 도입 — 묶음 O)
- decision-tables .json 짝 보강 (이중 렌더링 100% 전체)

---

## 10. v1.2.0 격상 ready 선언 ★★★

### 격상 가능 묶음 (14/16)
A~M + P 모두 데이터 100%. 즉시 PATCH 또는 MINOR 릴리스 가능.

### 격상 후 작업 (Sprint 4 / 묶음 N+O)
- Drift 자동 검증 CI 도구 (묶음 N)
- 진짜 static tool 의무화 (묶음 O — Semgrep / PMD / SpotBugs / Daikon / CodeQL)
- 신뢰도 시뮬 패널티 제거 → 90-95%

### 다음 시퀀스 (DEC-시퀀스-C-A-B-확정)
- C-Sprint 4 (CI 통합 + 진짜 static tool — 묶음 N+O)
- 시퀀스 A (v1.2.0 격상 — 14 묶음 통합)
- 시퀀스 B (PoC #03 — 다른 stack — 분석 정확도/일반화)

---

## 11. ★ 본 Sprint 정착 패턴

### 1. M-P1 병행 패턴 (Sprint 3 신규)
- 방법론 본체 갭 (P1) 을 PoC sprint 와 병행 처리
- 사상적 기반 (ADR-008) 을 Phase 4.5 정식 명세화 (Sprint 3 #1) 직전에 작성 → 사상 정합 강제
- **효과**: Sprint 분할 + 본체 격상 동시 진행 — 재작업 0

### 2. JSON 짝 일괄 작성 패턴 (Sprint 3 #2)
- .mermaid (사람 눈) 단방향 → .json (AI 눈) 짝 일괄 보강
- drift 검증 cross-validation
- **효과**: 이중 렌더링 100% 강제 + drift finding 자동 식별

### 3. 강화점 α+β 일괄 적용 패턴 (Sprint 3 #3)
- schema 갱신 (α) + 21 AP backfill 일괄 + 사람 친화적 .md (β)
- Python script 일괄 갱신 — 21건 동시 수정
- **효과**: 부분 적용 risk 회피 + schema 정합 즉시 검증

### 4. F-021 §8.1 강제 점검 패턴 (Sprint 3 #4)
- PoC 종료 시점에 closed 항목 외부 검증 결과 일괄 점검
- strong 후보 vs 한계 명시 후보 분리
- **효과**: 단일 PoC 과적합 회피 + closed 유지 의사결정 기록

---

## 12. 다음 세션 — Sprint 4 진입

### 결단 근거 (모든 성공 기준 만족)
- Phase 4.5 정식 명세화 ✅
- 이중 렌더링 정합 100% (state-machine + sequence 영역) ✅
- 본체 갭 P1 2건 해소 ✅
- 강화점 α+β 적용 ✅
- F-021 §8.1 점검 통과 ✅
- 14 묶음 격상 ready ✅

### Sprint 4 범위
| # | 작업 | 시간 |
|---|---|---|
| 1 | Drift 자동 검증 CI 도구 (묶음 N) | ~90분 |
| 2 | 진짜 static tool 도입 (Semgrep / PMD / SpotBugs / Daikon / CodeQL — 묶음 O) | ~120분 |
| 3 | decision-tables .json 짝 보강 (5건) | ~30분 |
| 4 | 신뢰도 90-95% 측정 + 정직 표기 | ~15분 |
| 5 | Sprint 4 보고서 + v1.2.0 격상 PR | ~30분 |

**예상 총**: ~4-5시간 / 1-2세션.

---

## 13. 다음 세션 재개 첫 명령어

> "examples/poc-02-realworld-springboot3/output/formal-spec/SPRINT-3-REPORT.md 읽고 정리해줘. C-Sprint 4 plan 작성 후 진입 (CI 통합 + 진짜 static tool — 묶음 N+O)."

또는

> "v1.2.0 격상 진행 — 14 묶음 일괄 통합 (시퀀스 A)."

---

**END OF SPRINT-3-REPORT.md**
