# Sprint 2 — Phase 4.5 형식화 BR 5건 확장 + F-074 단방향 검증

> 일자: 2026-04-29
> 관련 결정: DEC-시퀀스-C-A-B-확정 / DEC-priority2-결단 / DEC-round-trip-스코프-아웃 / DEC-static-tool-실행-의무화 / DEC-안티패턴-마이그레이션-가이드

---

## 목표

1. **F-074 단방향 round-trip 검증** (Sprint 1 self-reference 함정 회피) — ★ 우선
2. **BR 4건 형식화** (USERNAME-UNIQUE / PASSWORD-ENCRYPTED / FOLLOW-DIRECTIONAL / FOLLOW-IDEMPOTENT)
3. **Cross-validation 의무** (Sprint 1.5 신뢰도 +15-22%p 입증 정합)
4. **신규 결함 finding 등록** (F-088~F-098 후보)
5. Sprint 2 보고서

## 진입 컨텍스트 (Priority 2 결단 정합)

| 항목 | 결단 | 적용 |
|---|---|---|
| E. 자연어 빈약성 | 형식화 강제 | 5건 모두 4 산출물 (state-machine / sequence / decision-table / invariants) |
| F. F-074 | Sprint 2 첫 작업 / 단방향 | 자연어 → 형식 → 코드 생성 (코드 부재 케이스) |
| G. JSON 짝 | Sprint 3 이연 | Sprint 2 는 Mermaid + MD + TS 만 |
| H. Cross-validation | 의무 | sub-agent spawn (Senior Engineer + Static Analyzer **시뮬레이션 명시**) |

## 작업 순서 (총 ~3시간 / 1세션)

### Phase 0 — 준비 (5분)
- BR 5건 evidence_files raw read (F-015 cross-validation 패턴 — 메인 사전 fetch)
- UserService.java / UserRelationshipService.java / UserFollow.java / UserFollowJpaRepository.java

### Phase 1 — F-074 단방향 (★ 우선 ~30분)
- 1-A. rules.json BR-USER-FOLLOW-NO-SELF-001 자연어 read
- 1-B. L1/L2 형식화: state-machine + decision-table + invariant
- 1-C. 코드 생성: `UserRelationshipService.follow()` + `User.canFollow()` 보강안
- 1-D. **단방향 round-trip 검증**: 자연어가 코드 부재를 어떻게 채우는지 정량 측정
- 1-E. 신규 finding 등록 (F-088~ : 자연어 단독 한계 / 형식화 가치)

### Phase 2 — BR 4건 형식화 (~90분 / lightweight)
각 BR 당 ~20분:

| # | BR | state-machine | sequence | decision-table | invariants |
|---|---|---|---|---|---|
| 2-A | USERNAME-UNIQUE | (User-Account 재사용) | UC-USER-SIGNUP 갱신 | NEW | User.ts 갱신 |
| 2-B | PASSWORD-ENCRYPTED | (User-Account 재사용) | UC-USER-SIGNUP/UPDATE 갱신 | NEW | User.ts 갱신 |
| 2-C | FOLLOW-DIRECTIONAL | User-Following.mermaid NEW | UC-USER-FOLLOW.mermaid NEW | NEW | UserFollow.ts NEW |
| 2-D | FOLLOW-IDEMPOTENT | User-Following 재사용 | UC-USER-FOLLOW 재사용 | NEW | UserFollow.ts 갱신 |

### Phase 3 — Cross-validation (의무 ~30분)
- Sub-agent 1: Senior Engineer (general-purpose, 시간 cap 12분) — drift 검출
- Sub-agent 2: Static Analyzer **persona 시뮬레이션** (★ DEC-static-tool 정합 — 진짜 도구 deferred 명시)
- 결과 → 신규 finding F-088~F-098 후보

### Phase 4 — finding 등록 + 보고서 (~30분)
- finding 신규 등록 (F-021 임계 점검)
- SPRINT-2-REPORT.md 작성 (정직 신뢰도 표기 80-87% 유지)

## 산출물 트리

```
output/formal-spec/
├── state-machines/
│   ├── User-Account.mermaid (Sprint 1, 갱신 가능)
│   └── User-Following.mermaid (NEW — 2-C/2-D + Phase 1 F-074)
├── sequence-diagrams/
│   ├── UC-USER-SIGNUP.mermaid (Sprint 1, 갱신)
│   └── UC-USER-FOLLOW.mermaid (NEW — 2-C/2-D + Phase 1 F-074)
├── decision-tables/
│   ├── BR-USER-EMAIL-UNIQUE-001.md (Sprint 1)
│   ├── BR-USER-USERNAME-UNIQUE-001.md (NEW)
│   ├── BR-USER-PASSWORD-ENCRYPTED-001.md (NEW)
│   ├── BR-USER-FOLLOW-DIRECTIONAL-001.md (NEW)
│   ├── BR-USER-FOLLOW-IDEMPOTENT-001.md (NEW)
│   └── BR-USER-FOLLOW-NO-SELF-001.md (NEW ★ Phase 1)
├── invariants/
│   ├── User.ts (Sprint 1, 갱신)
│   └── UserFollow.ts (NEW)
├── generated-code/   ★ NEW (regenerated 와 분리 — 단방향)
│   └── UserRelationshipService-with-self-check.java (NEW Phase 1)
├── regenerated-code/  (Sprint 1 — 갱신 안 함)
├── property-tests/
│   ├── User.spec.ts (Sprint 1, 갱신)
│   ├── UserServicePropertyTest.java (Sprint 1, 갱신)
│   ├── UserFollow.spec.ts (NEW)
│   └── UserRelationshipServicePropertyTest.java (NEW)
└── SPRINT-2-REPORT.md (NEW)
```

## 정량 측정 항목

| 항목 | Sprint 1 베이스라인 | Sprint 2 목표 |
|---|---|---|
| BR 형식화 건수 | 1 | 6 (Sprint 1 의 5배) |
| drift 검출 건수 | 4 (Sprint 1) + 11 (Sprint 1.5) = 15 | + 5~10 (BR 4건 cross-validation) |
| F-074 단방향 검증 | ❌ (코드 → 명세 self-reference) | ✅ (자연어 → 명세 → 코드) |
| 형식화 시간 / BR | ~50분 (Sprint 1) | ~20분 (lightweight 효과 입증) |
| 신뢰도 (정직 표기) | 80-87% (시뮬레이션 패널티) | 80-87% 유지 (★ 진짜 도구 미실행 → Sprint 4 보강) |
| 이중 렌더링 정합 | 87.5% | 87.5% (G 이연 — Sprint 3 100%) |

## 성공 기준

- F-074 단방향 round-trip ★ 검증 완료 (코드 부재 → 자연어 → 형식 → 코드 생성)
- BR 5건 모두 4 산출물 작성
- Cross-validation 의무 실행 → 추가 drift 검출 ≥ 5건
- Sprint 1.5 신뢰도 80-87% 유지 (over-claim 회피)

## Sprint 3 진행 결단 기준

- 모두 만족 → Sprint 3 진행 (Phase 4.5 정식 명세화 + Mermaid JSON 짝 일괄 + 강화점 α + β)
- 부분 만족 → Sprint 3 범위 조정
- F-074 검증 실패 → 형식화 가치 재검토 (옵션 A 직진 — Sprint 3/4 skip)

## 4원칙 정합

| 원칙 | 적용 |
|---|---|
| 1. 깊은 숙지 → plan | ✅ 본 파일 |
| 2. 에이전트 토론 → research | ⚠️ 가벼운 sub-agent 전략 (Sprint 1 ~10배 단축 정합) — 본 plan 에서 Phase 3 cross-validation 으로 통합 |
| 3. 사용자 승인 후 코드 | ⏳ 본 plan 검토 후 진행 |
| 4. 실패 시 revert + 교훈 | SPRINT-2-REPORT.md Lessons Learned 섹션 |

## 위험 / 회피

| 위험 | 회피 |
|---|---|
| Sprint 1 self-reference 함정 재발 | F-074 우선 — 자연어 단독 출발 |
| Static Analyzer over-claim 재발 | DEC-static-tool 정합 — 시뮬레이션 명시 / 신뢰도 -5%p |
| 시간 폭주 (3시간 → 5시간+) | lightweight 전략 + BR 당 20분 cap |
| F-021 finding 임계 (54 → 70+) | finding 등록 시 §8.1 단일 PoC 과적합 회피 신호 점검 |
| Cross-validation sub-agent 실패 | Sprint 1.5 패턴 재사용 (성공 검증됨) |

## 다음 액션

1. ⏳ 사용자 plan 검토 → 승인
2. ⏳ Phase 0 (준비) — 메인 사전 raw fetch
3. ⏳ Phase 1 (F-074 우선)
4. ⏳ Phase 2 (BR 4건)
5. ⏳ Phase 3 (cross-validation)
6. ⏳ Phase 4 (finding + 보고서)

---

**END**
