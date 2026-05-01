# 묶음 M-P2-3 plan — 본체 갭 5건 메우기

> **위치**: methodology body 레벨
> **선행**: v1.2.1 발행 ✅ / Sprint 4 종결 ✅
> **목표**: 본체 갭 P2 3건 + P3 2건 메우기 → **본체 100% 정합** → PoC #03 진입 전 재작업 0 확보
> **우선순위 정합**: 품질 1순위 + 재작업 최소화 2순위. **PoC #02 단독 의존 도구 (v1.2.1) 의 본체 정합 부재** 가 PoC #03 진입 시 발견되면 재작업 비용 큼 → 지금 메우는 게 가장 싸다.

---

## 0. 배경 / 갭 식별 근거

DEC-2026-04-30-M-묶음-갭-식별 (Sprint 3 식별) 의 P2-3 5건. P1 2건 (finding-system schema + ADR-008) 은 Sprint 3 적용 완료. P2-3 는 v1.2.0 격상 시점 "묶음 M 일괄" 로 미뤄졌으나, v1.2.0 → v1.2.1 격상 시점에도 미수행 → 본 작업으로 처리.

### 갭 5건 현황

| # | 갭 | 우선순위 | 현황 | 누락 영향 |
|---|---|---|---|---|
| 3 | api.template.md 부재 | P2 | `api.template.yaml` 만 | 사람이 OpenAPI YAML 직접 읽기 어려움 — 요약 .md 표준 부재. PoC #01/#02 모두 자체 발명 |
| 4 | phase-flow.mermaid 부재 | P2 | `phase-N-*.md` 8 텍스트만 | onboarding 시 전체 흐름 파악 불가 / Phase 4.5 도입 위치 시각화 부재 / 산출물 의존 그래프 부재 |
| 5 | ADR-009 (다이어그램 신뢰 모델) 미작성 | P2 | DEC + memory 만 | Phase 4.5 신뢰도 60~95% 가변 모델 정합 불가 / 검증 5단계 정식 등록 부재 |
| 6 | db-schema.template.md 부재 | P3 | `erd.template.mermaid` 만 | PoC 마다 사람 눈 요약 형식 발명 — 표준 부재 |
| 7 | meta-confidence template 부재 | P3 | schema 만 | 산출물별 메타 작성 규약 명시 부재 → 일관성 저해 |

### 공통 메커니즘

**모든 갭 = ADR-008 (이중 렌더링 사상) 의 본체 자체 미적합**. 본 사상이 PoC 산출물에는 강제되나 본체에는 미강제 → 본체가 *방법론을 따라가지 못하는 상태*.

---

## 1. 산출 목표 (5건 + 부수)

| ID | 산출물 | 위치 | 분량 |
|---|---|---|---|
| **G3** | `api.template.md` | `templates/` | ~80~120 라인 (api.template.yaml 의 사람 눈 짝) |
| **G4** | `phase-flow.mermaid` + `phase-flow.json` 짝 | `methodology-spec/workflow/` | mermaid ~50~80 라인 + json ~40 라인 (이중 렌더링 정합) |
| **G5** | `docs/adr/ADR-009-다이어그램-신뢰-모델.md` | `docs/adr/` | ~150~200 라인 (DEC + memory 통합 격상) |
| **G6** | `db-schema.template.md` | `templates/` | ~60~100 라인 (erd.template.mermaid 의 사람 눈 짝) |
| **G7** | `meta-confidence.template.yaml` | `templates/` | ~40~60 라인 (schema 의 사람 눈 짝 + PoC #01/#02 _manifest.yml 통합) |

### 부수 산출물

- `CHANGELOG.md` — `[v1.2.2]` PATCH entry (M-P2-3 5건 적용)
- `README.md` — v1.2.1 → v1.2.2 헤더, ADR-009 추가 명시
- `decisions/STATUS.md` — 묶음 M 완료 표기 (P1+P2+P3 = 7/7)
- `decisions/DEC-2026-04-30-m-p2-3-종결.md`
- `decisions/INDEX.md` 갱신
- `methodology-spec/workflow/` 의 phase-N-*.md 들에 `phase-flow.mermaid` 링크 (선택)

---

## 2. 작업 분할 (의존 그래프 + 시간 견적)

```
독립 5건 — 의존 없음 (병렬 가능):

[G3 api.template.md]      ← PoC #01/#02 api.md 참조  (~30분)
[G4 phase-flow.mermaid]    ← phase-N-*.md 8 통합     (~45분)
[G5 ADR-009]               ← DEC + memory 통합        (~45분)
[G6 db-schema.template.md] ← PoC #02 정합성-검증-보고서 참조 (~30분)
[G7 meta-confidence.tmpl]  ← PoC #01/#02 _manifest.yml 통합 (~30분)

총 작업: ~3시간 + 부수 (CHANGELOG/STATUS/DEC/README) ~30분 = ~3.5h
```

### 가벼운 sub-agent 활용

- **G5 (ADR-009)** 는 ADR-008 의 형식 + DEC-다이어그램-신뢰-모델 + memory feedback_diagram_trust_model 통합. Document agent 1건 (8분 cap) — ADR 작성 best practice 검증 정도면 충분.
- **G4 (phase-flow)** 는 phase-N-*.md 8건 읽기 + 구조 추출. 메인 직접 (sub-agent 비용 > 절감).
- **G3 / G6 / G7** 은 PoC #01/#02 산출물 형식 표준화 — 메인 직접 (PoC 산출물 이미 컨텍스트 내).

---

## 3. 핵심 결정 포인트 (사용자 일괄 승인 5건)

### DEC-MP-01 — api.template.md 양식 (G3)

**옵션**:
- (A) **OpenAPI 요약 + endpoint 표 + RFC 참조 표** (PoC #02 api.md 형식 표준화) ★ 권장
- (B) 단순 endpoint 목록만
- (C) 별도 발명 X — `api.template.yaml` 헤더 주석으로 .md 갈음

**제안**: **(A)** — PoC #01/#02 가 이미 같은 형식 자연스레 발명. 표준화로 다음 PoC 부터 일관 보장. 항목: (1) 메타 (Phase 5-1 / 신뢰도 / 출처) (2) endpoint 표 (op_id / method+path / summary / status / RFC) (3) anti-pattern 인덱스 (api.md 형식 정합 — F-070 등) (4) finding 인덱스.

### DEC-MP-02 — phase-flow.mermaid 표현 모드 (G4)

**옵션**:
- (A) **flowchart TB — phase 박스 + 의존 화살표 + Phase 4.5 분기 + 산출물 라벨** ★ 권장
- (B) timeline diagram (시간순)
- (C) sequenceDiagram (사용자 ↔ 시스템)

**제안**: **(A)** — Phase 의존성 + Phase 4.5 위치 + 산출물 의존 그래프 모두 한 그림. `.json` 짝은 `phase_flow: { phases: [{id, inputs, outputs, depends_on}] }` 구조 (drift-validator 호환 schema 확장 — 단, 본 sprint 에서 drift-validator schema 신설은 scope 아웃 / 정합만 의도).

### DEC-MP-03 — ADR-009 신뢰 모델 정량 강도 (G5)

**옵션**:
- (A) DEC-다이어그램-신뢰-모델 그대로 격상 (60~95% 정량 + 검증 5단계)
- (B) (A) + Sprint 1.5/2/3/4 누적 데이터 보강 + v1.2.1 자동 도구 (drift-validator / decision-table-validator) 5단계 통합 ★ 권장
- (C) (B) + Sprint 5 carry-over 정직 표기

**제안**: **(B+C)** — DEC 격상 + 자동 도구 단계 정식 통합 (78-85% 단계 신설) + Sprint 5 carry-over 정직 명시. ADR-008 과 짝 (사상 + 신뢰 모델).

### DEC-MP-04 — db-schema.template.md 양식 (G6)

**옵션**:
- (A) **PoC #02 정합성-검증-보고서.md 형식 표준화** (table 정합 / index 정합 / FK 정합 / data-type 정합 / 결정 사항) ★ 권장
- (B) 단순 ERD 요약
- (C) erd.template.mermaid 헤더 주석

**제안**: **(A)** — PoC #02 의 형식이 이미 충분히 정련됨 (Hexagonal multi-module 환경에서도 동작). 항목: (1) 메타 (2) 테이블 인벤토리 (3) 정합성 검증 5종 (4) ORM ↔ schema.sql 출처 분별 (F-050 정합) (5) 안티패턴 인덱스 (6) finding 인덱스.

### DEC-MP-05 — meta-confidence.template.yaml 양식 (G7)

**옵션**:
- (A) **PoC #01/#02 _manifest.yml 합집합 표준화** ★ 권장
- (B) schema 그대로 mirror
- (C) phase 별 다른 template

**제안**: **(A)** — `_manifest.yml` 의 실제 사용 항목을 표준화. 항목: (1) phase / 일자 / actor (2) raw_confidence + cap (3) inputs (4) outputs (5) findings_added (6) cross_validation (★ Sprint 4 정합 — real_tool 5종 물증 또는 simulation_reason) (7) known_limitations (ADR-009 정합) (8) trust_level (단계별 추적). schema 와 1:1 정합 + 사람 작성 가이드 주석 포함.

---

## 4. 성공 기준 (Definition of Done)

- [ ] `templates/api.template.md` 산출 + PoC #01/#02 api.md 와 형식 정합 확인
- [ ] `methodology-spec/workflow/phase-flow.mermaid` + `phase-flow.json` 짝 산출 + drift-validator 자가 검증 (`structural drift 0`)
- [ ] `docs/adr/ADR-009-다이어그램-신뢰-모델.md` 산출 + Sprint 1.5~4 누적 데이터 + v1.2.1 자동 도구 단계 통합
- [ ] `templates/db-schema.template.md` 산출 + PoC #02 정합성-검증-보고서 형식 정합
- [ ] `templates/meta-confidence.template.yaml` 산출 + schema + PoC `_manifest.yml` 정합
- [ ] CHANGELOG `[v1.2.2]` entry — M-P2-3 5건 적용
- [ ] README v1.2.1 → v1.2.2 + ADR-009 명시
- [ ] STATUS.md — 묶음 M 7/7 완료 표기
- [ ] DEC-2026-04-30-m-p2-3-종결.md + INDEX.md 갱신
- [ ] **본체 갭 7건 모두 closed** → ADR-008 사상이 본체에도 100% 적용

---

## 5. 위험 / 제약

| 위험 | 영향 | 완화 |
|---|---|---|
| Template 양식이 PoC #01/#02 과적합 → §8.1 위반 | 중 | 양식은 "최소 의무 + optional 확장" 구조. PoC #03 다른 stack 진입 시 변형 가능 명시. |
| phase-flow.mermaid `.json` 짝 schema 신설 | 소 | 본 sprint scope 아웃 — drift-validator 가 phase-flow 미인식해도 OK. 향후 스펙 확장 시 Sprint 6 후속. |
| ADR-009 신뢰 모델이 ADR-008 과 중복 | 소 | ADR-008 = 사상 (이중 렌더링) / ADR-009 = 신뢰도 정량 — 짝 관계로 명시. |
| meta-confidence template 이 schema 와 어긋남 | 중 | template 작성 후 schema 와 1:1 매핑 표 첨부. CI 검증 후속 (v1.3+). |
| 5건 산출 중 PoC #01 vs #02 형식 차이 발견 | 중 | 두 PoC 의 합집합 또는 더 정련된 PoC #02 우선 + #01 보강 항목만. |

---

## 6. 4원칙 정합

- **1원칙 (plan)**: 본 문서 ✅
- **2원칙 (research)**: 가벼운 sub-agent 1건 (Document — ADR / template best practice). 나머지는 메인 직접 (PoC 산출물 컨텍스트 충분).
- **3원칙 (사용자 승인)**: §3 5건 일괄 승인.
- **4원칙 (revert)**: 5건 독립이라 단건 실패 시 부분 revert 가능. Lessons Learned 본 plan 9 섹션 기록.

---

## 7. 작업 순서

1. **Phase A** (병렬 가능 — 독립): G3 / G6 / G7 — PoC 산출물 표준화 (~90분)
2. **Phase B** (병렬 가능 — 독립): G4 + G5 — phase-flow + ADR-009 (~90분)
3. **Phase C**: 부수 산출물 (CHANGELOG / README / STATUS / DEC / INDEX) (~30분)
4. **Phase D**: drift-validator 자가 검증 (phase-flow.mermaid ↔ .json) (~10분)

총 ~3.5h. 단일 세션.

---

## 8. 참조

- `decisions/DEC-2026-04-30-M-묶음-갭-식별.md` — 갭 7건 원본
- `decisions/DEC-2026-04-29-다이어그램-신뢰-모델.md` — ADR-009 모체
- `decisions/DEC-2026-04-29-이중-렌더링-사상-명시화.md` — ADR-008 모체 (P1 적용 완료)
- `docs/adr/ADR-008-이중-렌더링-사상.md` — 본 갭들의 사상적 근거
- memory `feedback_diagram_trust_model.md` — ADR-009 데이터
- memory `feedback_two_eyes_principle.md` — 본 갭의 메커니즘
- `examples/poc-01-realworld-spring/output/api/api.md` — G3 형식 참조
- `examples/poc-02-realworld-springboot3/output/api/api.md` — G3 형식 참조
- `examples/poc-02-realworld-springboot3/output/db/정합성-검증-보고서.md` — G6 형식 참조
- 모든 PoC `_manifest.yml` — G7 형식 참조

## 9. Lessons Learned (작성 예정)

(공란 — 진행 중 발견 함정 기록)
