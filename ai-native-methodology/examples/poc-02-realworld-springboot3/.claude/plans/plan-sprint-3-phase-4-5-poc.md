# Sprint 3 — Phase 4.5 정식 명세화 + JSON 짝 + 강화점 α+β + M-P1 병행

> 일자: 2026-04-30
> 관련 결정: DEC-시퀀스-C-A-B-확정 / DEC-이중-렌더링-사상-명시화 / DEC-안티패턴-마이그레이션-가이드 / DEC-다이어그램-신뢰-모델 / **DEC-2026-04-30-M-묶음-갭-식별 (P1 2건 병행)**

---

## 목표

본 Sprint = **C-Sprint 3 본 작업 5건 + M 묶음 P1 2건 병행 = 7개 산출 단위**.

1. **M-P1-#2 ADR-008** (이중 렌더링 사상) — Sprint 3 #1 사상적 기반
2. **M-P1-#1 finding-system.schema.json** — finding-system.md 자산화 차단 해소
3. **Sprint 3 #1** Phase 4.5 정식 명세화 (workflow / deliverables / schema / template)
4. **Sprint 3 #2** Mermaid JSON 짝 일괄 (PoC #02 90.5% → 100%)
5. **Sprint 3 #3** 강화점 α+β (antipatterns.migration_advice + migration-cautions.md)
6. **Sprint 3 #4** F-021 §8.1 단일 PoC 과적합 회피 점검
7. **Sprint 3 #5** Sprint 3 보고서

## 진입 컨텍스트 (Sprint 2 종결 정합)

| 항목 | Sprint 2 결과 | Sprint 3 적용 |
|---|---|---|
| 묶음 L 데이터 | 100% ✅ | Phase 4.5 정식 명세화로 격상 ready |
| 묶음 M 데이터 | 갭 7건 식별 ✅ (DEC-2026-04-30) | P1 2건 본 Sprint 병행 / P2-3 5건 v1.2.0 격상 |
| 묶음 P 데이터 | DEC 등록 ✅ | α+β 적용으로 격상 ready |
| 이중 렌더링 정합 | 90.5% | Sprint 3 #2 로 100% 목표 |
| 신뢰도 | 80-87% (시뮬 패널티) | Sprint 4 진짜 도구 도입까지 유지 |

## 작업 순서 (의존 그래프 순)

### Phase A — M-P1 병행 (2개 / ~70분)

#### A-1. ADR-008 (이중 렌더링 사상) ~40분 ★ Sprint 3 #1 의 사상적 기반
- 입력: DEC-2026-04-29-이중-렌더링-사상-명시화 본문
- 추가 자료:
  - Donald Knuth, "Literate Programming" (1984) — 학문적 계보
  - 본체 매핑 현황표 (DEC-2026-04-30-M-묶음-갭-식별 부록)
  - Phase 4.5 영역별 적용 (state-machine/sequence/decision-table/invariants/property)
- 출력: `docs/adr/ADR-008-이중-렌더링-사상.md`
- 구조: Context / Decision / Consequences (Positive 7 / Negative 3) / Alternatives 3 / 학문적 계보 / 영역별 적용 매트릭스

#### A-2. finding-system.schema.json ~30분
- 입력: `methodology-spec/finding-system.md` (DRAFT)
- 출력: `schemas/finding-system.schema.json`
- 필드:
  - finding_id (pattern: F-NNN), phase (0-6 enum + "4.5"), discovered_at (date), discoverer (string)
  - description, context, spec_gap, decision_made (text)
  - severity (enum: low/medium/high/critical)
  - proposed_fix (text)
  - resolution (object — status/resolved_at/resolution_method/followup)
  - status (enum: open/closed/promoted/rejected/deferred/candidate/merged)
- $id: `https://ai-native-methodology/schemas/finding-system.schema.json`
- schemas/README.md 갱신 (목록 추가)

### Phase B — Sprint 3 #1 Phase 4.5 정식 명세화 ~90분 (★ 본 Sprint 핵심)

A-1 (ADR-008) 완료 후 진입. Phase 4.5 가 본 사상의 첫 정식 적용 영역.

#### B-1. workflow 신규 (~30분)
- 입력: Sprint 1+1.5+2 누적 패턴
  - state-machine (Aggregate Root 생애주기)
  - sequence (UC 오케스트레이션)
  - decision-table (BR 정책)
  - invariants (Property 명세)
  - property-test (실행 가능 명세)
- 출력: `methodology-spec/workflow/phase-4-5-formal-spec.md`
- 구조: 입력 (rules.json + domain.json from Phase 4) / 출력 (5 산출물) / 진행 절차 / cross-validation 의무 / 신뢰도 정직 표기 / Static tool 의무 (DEC-static-tool)

#### B-2. deliverable 명세 신규 (~20분)
- 출력: `methodology-spec/deliverables/04-5-형식명세.md`
- 구조: 정의 / 5 산출물 매트릭스 / 이중 렌더링 정합 (.json + .mermaid/.md/.ts) / 신뢰도 등급

#### B-3. schema 신규 (~25분)
- 출력: `schemas/formal-spec.schema.json`
- 구조: state_machines[] + sequences[] + decision_tables[] + invariants[] + property_tests[] + cross_validation 메타
- 각 구조의 sub-schema 정의

#### B-4. template 신규 (~15분)
- 출력:
  - `templates/formal-spec.template.md` (사람 눈 — 5 산출물 작성 가이드 + 예시)
  - `templates/state-machine.template.mermaid` (사람 눈 — Mermaid stateDiagram-v2)
  - `templates/sequence.template.mermaid` (사람 눈 — Mermaid sequenceDiagram)
  - `templates/decision-table.template.md` (사람 눈 — 표 형식)

### Phase C — Sprint 3 #2 Mermaid JSON 짝 일괄 ~45분

#### C-1. state-machines (~15분)
- 입력: PoC #02 `output/formal-spec/state-machines/User-Account.mermaid` + `User-Following.mermaid`
- 출력: 같은 디렉토리에 `.json` 짝 — XState format (state/transition/event/guard)

#### C-2. sequence-diagrams (~15분)
- 입력: PoC #02 `output/formal-spec/sequence-diagrams/UC-USER-SIGNUP.mermaid` + `UC-USER-FOLLOW.mermaid`
- 출력: `.json` 짝 — actor/message/sync/guard 구조

#### C-3. 정합 검증 (~15분)
- Cross-validation: .mermaid ↔ .json 동일 의미인지 비교
- drift 검출 시 finding 등록 (F-107~)
- 이중 렌더링 정합도 90.5% → 100% 측정

### Phase D — Sprint 3 #3 강화점 α+β ~60분

#### D-1. α — antipatterns schema 보강 (~15분)
- 입력: `schemas/antipatterns.schema.json`
- 변경: 각 antipattern 객체에 `migration_advice` (string, optional) 필드 추가
- 호환성: optional 이므로 기존 21 AP backfill 없이도 schema validation 통과

#### D-2. α — PoC #02 21 AP migration_advice backfill (~30분)
- 입력: `examples/poc-02-realworld-springboot3/output/antipatterns/antipatterns.json`
- 변경: 21 AP 각각에 migration_advice 작성 (신규 시스템 구축 시 회피 가이드)
- 우선순위: critical 3건 (AP-API-001 / AP-DB-001 / AP-SECURITY-001) 상세 / high 4건 / medium 8건 / low 6건 간략

#### D-3. β — migration-cautions.md 신규 (~15분)
- 출력: `examples/poc-02-realworld-springboot3/output/antipatterns/migration-cautions.md`
- 구조: AP 별 1줄 회피 + critical 3건 상세 (Spring Boot 3.x / Hexagonal 환경 외 일반화 주의사항)
- workflow phase-6-quality.md 갱신: migration-cautions.md 의무 산출물 격상

### Phase E — Sprint 3 #4 F-021 §8.1 점검 ~15분

- 입력: PoC #01 finding 33건 closed/promoted/deferred + PoC #02 finding 43건
- 점검: PoC #01 단독 closed 항목 중 PoC #02 미재현 → 단일 PoC 과적합 후보
- 출력: 점검 결과를 SPRINT-3-REPORT.md §단일 PoC 과적합 점검 섹션에 통합 (별도 산출물 X)

### Phase F — Sprint 3 #5 보고서 ~20분

- 출력: `examples/poc-02-realworld-springboot3/output/formal-spec/SPRINT-3-REPORT.md`
- 구조:
  - 산출물 일람 (A-F 단계 산출 7개)
  - 묶음 L/M/P 데이터 충분도 갱신
  - 이중 렌더링 정합도 추이 (Sprint 1: 67% → 1.5: 87.5% → 2: 90.5% → 3: 100%)
  - v1.2.0 격상 ready 선언
  - 다음 Sprint 4 (CI 통합 / 진짜 static tool — 묶음 N+O) 작업 명시

## 산출물 트리 (예상)

```
docs/adr/
└── ADR-008-이중-렌더링-사상.md (NEW ★ M-P1)

schemas/
├── finding-system.schema.json (NEW ★ M-P1)
├── formal-spec.schema.json (NEW)
├── antipatterns.schema.json (UPDATE — α)
└── README.md (UPDATE)

methodology-spec/
├── workflow/
│   └── phase-4-5-formal-spec.md (NEW)
├── deliverables/
│   └── 04-5-형식명세.md (NEW)
└── workflow/phase-6-quality.md (UPDATE — β)

templates/
├── formal-spec.template.md (NEW)
├── state-machine.template.mermaid (NEW)
├── sequence.template.mermaid (NEW)
└── decision-table.template.md (NEW)

examples/poc-02-realworld-springboot3/output/
├── formal-spec/
│   ├── state-machines/
│   │   ├── User-Account.json (NEW — Sprint 3 #2)
│   │   └── User-Following.json (NEW)
│   ├── sequence-diagrams/
│   │   ├── UC-USER-SIGNUP.json (NEW)
│   │   └── UC-USER-FOLLOW.json (NEW)
│   └── SPRINT-3-REPORT.md (NEW)
└── antipatterns/
    ├── antipatterns.json (UPDATE — α 21 AP backfill)
    └── migration-cautions.md (NEW — β)
```

총 신규 13 + 갱신 4 = **17 산출 단위**.

## 성공 기준

| # | 기준 | 측정 |
|---|---|---|
| 1 | ADR-008 정식 등록 | docs/adr/ADR-008-*.md 존재 + DEC-이중-렌더링-사상-명시화 supersede |
| 2 | finding-system.schema.json 등록 | schemas/ 등록 + README.md 목록 반영 |
| 3 | Phase 4.5 정식 명세화 | workflow + deliverable + schema + template 4 산출물 모두 존재 |
| 4 | 이중 렌더링 정합 100% | PoC #02 formal-spec/ 의 .mermaid ↔ .json drift 0건 (또는 finding 등록) |
| 5 | α+β 적용 | schema 갱신 + 21 AP backfill + migration-cautions.md + phase-6 갱신 |
| 6 | 묶음 L/M/P 격상 ready | SPRINT-3-REPORT 에 명시 |
| 7 | F-021 §8.1 점검 | 단일 PoC 과적합 후보 식별 (0건이어도 점검 사실 기록) |

## 의존 관계

```
A-1 (ADR-008) ──> B-1~B-4 (Phase 4.5 정식 명세화 — 사상 정합)
A-2 (finding-system.schema) ─ 독립
C (Mermaid JSON 짝) ─ 독립 (PoC #02 산출물 작업)
D (α+β) ─ 독립 (PoC #02 antipatterns 작업)
E (F-021 점검) <── 모든 finding 통계 기반 (Sprint 마지막)
F (보고서) <── A~E 모두 완료 후
```

## 시간 견적 (총 ~5시간)

- A: 70분 (M-P1 2건)
- B: 90분 (Sprint 3 #1 — 본 Sprint 핵심)
- C: 45분 (Sprint 3 #2)
- D: 60분 (Sprint 3 #3)
- E: 15분 (Sprint 3 #4)
- F: 20분 (Sprint 3 #5)

→ Sprint 2 (~3시간) 보다 길다. 한 세션 완료 어려울 시 다음 우선순위로 분할:
1. **반드시 본 세션**: A (M-P1) + B (Phase 4.5 정식)
2. **다음 세션 가능**: C + D + E + F

## 사용자 승인 (Auto Mode 위임)

본 plan 작성 후 즉시 Phase A 진입. Auto Mode 정합. 단계별 산출물 확인은 PROGRESS-poc02-phase4-5-sprint3.md 시간순 갱신.

## Lessons Learned (Sprint 1+1.5+2 정합)

- self-reference 함정 회피 ✅ (Sprint 2 F-074 단방향)
- cross-validation 의무 정착 ✅
- 시뮬레이션 신뢰도 패널티 정직 표기 ✅
- 가벼운 sub-agent 전략 ✅ (Phase 4~6 정착 / Sprint 3 도 적용)

## 청중

본 plan = 사람 (TF Lead 윤주스) + AI (다음 세션 재개 시).
