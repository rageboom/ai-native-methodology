# DEC-2026-04-29-priority2-결단

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead, Auto Mode 위임) |
| 일자 | 2026-04-29 |
| 상태 | 승인 |
| 카테고리 | methodology / poc |
| 관련 | DEC-2026-04-29-시퀀스-C-A-B-확정, DEC-2026-04-29-static-tool-실행-의무화, DEC-2026-04-29-다이어그램-신뢰-모델, PROGRESS-poc02-phase4-5-sprint1.md T+2/T+3 |

---

## 컨텍스트

Sprint 1 + Sprint 1.5 종결 후 Sprint 2 진입 전 **Priority 2 4항목** 결단 대기 (PROGRESS T+2 등록).
Sprint 1.5 결과 (drift 15건 / 자연어 누락 73% / cross-validation 신뢰도 +15-22%p) 가 결단 가이드 제공.
SPRINT-1.5-REPORT.md §9 권고를 일괄 채택하되 Sprint 2 작업 폭주 회피를 위해 G 는 Sprint 3 으로 이연.

## 결정 (4항목 일괄 승인)

### E. 자연어 명세 빈약성 통제 → **형식화 강제 (자연어 단독 의존 ❌)**

**결단**: BR 5건 모두 L1/L2 형식화 의무. rules.json L0 자연어는 보조 trace 역할만.

**근거**:
- Sprint 1.5 drift 15건 중 11건 (73%) 자연어 누락 영역 — 정량 입증
- 자연어 보강 (BR 길이 늘리기) 은 빈약성 본질 해소 ❌ — 표현력 부족이 근본 원인
- 형식화 (FSM / Decision Table / ADT / Property) 가 명세 모호성 자동 검출

**적용**: Sprint 2 BR 5건 모두 4 산출물 (state-machine / sequence / decision-table / invariants) 의무 생성.

---

### F. F-074 (BR-USER-FOLLOW-NO-SELF-001) 코드 부재 케이스 → **단방향 검증 우선 처리**

**결단**: F-074 를 Sprint 2 **첫 작업** 으로 처리. 자연어 → L1/L2 → 코드 생성 (단방향) 검증.

**근거**:
- Sprint 1 self-reference 함정 (코드 → L1/L2 → 코드 round-trip 자명) 회피 검증 필요
- F-074 는 코드 부재 (UserService 에 self-follow 검사 없음) → 자연어 단독 출발 가능
- 진짜 round-trip = 자연어가 형식화 가치 입증할 수 있는 유일 케이스

**적용**:
1. rules.json BR-USER-FOLLOW-NO-SELF-001 자연어 read
2. L1/L2 형식화 (FSM transition + invariant)
3. 코드 생성 (UserService.follow 보강안)
4. 사용자 검토 → 진짜 round-trip 가치 정량 측정

---

### G. Mermaid JSON 짝 처리 시점 → **Sprint 3 일괄 (Sprint 2 가벼움 유지)**

**결단**: Sprint 2 는 Mermaid 만 생성. JSON 짝 (state-machine.json / sequence.json) 은 Sprint 3 에서 일괄 처리.

**근거**:
- 이중 렌더링 사상 정합 67% → 87.5% 도달 (Sprint 1.5 결과) — 이미 양호
- BR 5건 × 2 산출물 = 10 JSON 추가 → Sprint 2 시간 1.5배 (lightweight 전략 효과 상쇄)
- Sprint 3 (Phase 4.5 정식 명세화) 에서 schema 표준화와 함께 일괄 생성이 효율적
- Mermaid 단독으로도 사람 눈 + AI 눈 (Mermaid syntax parsable) 부분 충족

**적용**: Sprint 3 작업 항목으로 명시 — Sprint 2 plan.md 에 deferred 로 기록.

---

### H. Cross-validation (F-015 패턴) 적용 → **Sprint 2 의무 적용**

**결단**: Sprint 2 BR 5건 모두 cross-validation 의무 (Senior Engineer + Static Analyzer persona sub-agent).
**단** Static Analyzer 는 ★★★ 시뮬레이션 명시 (DEC-static-tool-실행-의무화 deferred 정합).

**근거**:
- Sprint 1.5 cross-validation 신뢰도 60-70% → 80-87% (+15-22%p) 정량 입증
- Sprint 1 단독 추출 시 ★ high 결함 1건 (@Transactional) + hidden bug 1건 (case-sensitive) 누락
- F-015 패턴 (메인 사전 raw fetch → sub-agent cross-check) 정착 — Phase 5/6 사실 오류 0% 달성

**적용**:
- BR 5건 × 2 sub-agent = 10 spawn (lightweight 전략: 시간 cap 8분 / Case 생략)
- 또는 일괄 spawn (5 BR 통합 1 sub-agent / 시간 cap 15분) — 효율 우선 시
- 각 sub-agent 결과 → drift 검출 → finding F-088~F-098 후보 등록

---

## 영향

### Sprint 2 범위 확정

| 작업 | 시간 |
|---|---|
| F-074 단방향 round-trip 검증 (우선) | ~30분 |
| BR 5건 형식화 (state-machine + sequence + decision-table + invariants) | ~90분 |
| Cross-validation 의무 (sub-agent 1~2 spawn 일괄) | ~30분 |
| 신규 결함 finding 등록 | ~15분 |
| Sprint 2 보고서 | ~15분 |
| **합계** | **~3시간 (1세션)** |

### Sprint 3 범위 명시화 (G 이연)

- Phase 4.5 정식 명세화 (workflow / deliverables / schema / template)
- Mermaid JSON 짝 일괄 생성 (BR 5건 × 2 = 10 JSON)
- 이중 렌더링 사상 정합 87.5% → 100% 목표

### finding 시스템 영향

- F-088~F-098 후보 (Sprint 2 cross-validation 결과)
- F-021 임계 (PoC #02 누적 54건) → Sprint 2 후 §8.1 영향 재검토

## 다음 액션

1. ✅ 본 DEC 등록
2. ✅ INDEX 갱신
3. ✅ PROGRESS-poc02-phase4-5-sprint1.md T+6 갱신
4. ⏳ Sprint 2 plan.md 작성 (다음 작업)
5. ⏳ F-074 단방향 round-trip 우선 처리

---

**END**
