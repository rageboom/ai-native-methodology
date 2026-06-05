# Sprint 1 — Phase 4.5 형식화 Proof of Concept

> 일자: 2026-04-29
> 관련 결정: DEC-2026-04-29-시퀀스-C-A-B-확정 / DEC-2026-04-29-phase-4-5-형식화-후보 / DEC-2026-04-29-이중-렌더링-사상-명시화

---

## 목표

PoC #02 BR-USER-EMAIL-UNIQUE-001 1건을 4 방향 형식화하여:
1. L0 자연어 → L1/L2 형식화 효과 정량 측정
2. round-trip 가능성 정량 측정 (코드 → 명세 → 코드)
3. 이중 렌더링 사상 정합 검증
4. Sprint 2 (5건 전체) 진행 여부 결단 데이터 확보

## 시범 대상

**BR-USER-EMAIL-UNIQUE-001** + 관련 코드:
- `UserService.signup()` — App-level pre-check (existsBy)
- `User` 생성자 — Domain validation (null/blank)
- `User.encryptPassword()` — BCrypt
- `UserRepositoryAdapter.save()` — JPA save
- `schema.sql users` — DB UQ constraint

선택 근거:
- critical (race condition + 보안)
- 단순 (5 메서드, 1 entity)
- 다층 (App + Domain + DB 3중)

## 4 방향 검증

| 방향 | 입력 | 출력 | 검증 |
|---|---|---|---|
| A. 자연어 → L1/L2 | rules.json BR-USER-EMAIL-UNIQUE-001 (G/W/T) | Decision Table + FSM + Sequence Diagram | 구조 정합 |
| B. 코드 → L1/L2 | UserService.java + User.java + UserRepositoryAdapter.java + schema.sql | 동일 형식 (코드 추출) | 누락 사항 |
| C. A vs B 비교 | 두 결과물 | 차이 매트릭스 | drift 지표 |
| D. L1/L2 → 코드 재생성 | 검증된 형식 명세 | regenerated UserService.java | 원본 vs 재생성 동치성 |

## 산출물

```
output/formal-spec/
├── state-machines/
│   └── User-Account.mermaid
├── sequence-diagrams/
│   └── UC-USER-SIGNUP.mermaid
├── decision-tables/
│   └── BR-USER-EMAIL-UNIQUE-001.md
├── invariants/
│   └── User.ts
├── regenerated-code/
│   └── UserService-regenerated.java
├── SPRINT-1-REPORT.md
└── _manifest.yml (옵션, Sprint 3에서)
```

이중 렌더링 정합:
- AI 눈: 후속 Sprint 에서 .json 추가 (Sprint 1은 .mermaid/.md 만)
- 사람 눈: .mermaid (GitHub 자동 렌더), .md (표/요약)
- ADT: .ts (TypeScript-like, 양쪽 청중 친화)

## 정량 측정 항목

1. **drift 건수** — A vs B 차이 (자연어 명세가 코드와 어긋나는 부분)
2. **round-trip 정확도** — 원본 vs 재생성 (구조 동치 / 의미 동치)
3. **명세 라인 수** — 자연어 G/W/T (기존) vs 형식화 (신규)
4. **시간 비용** — 형식화 작업 실 소요 시간
5. **AP/F 발견** — 형식화 과정에서 새 발견된 결함

## 성공 기준

- A vs B drift 발견 ≥ 1건 (형식화로 명세 빈틈 검출 입증)
- round-trip 동치성 ≥ 80% (1주일 시도해도 70% 못 넘는 자연어 한계 돌파)
- 이중 렌더링 사상 정합 100% (모든 산출물이 사람·AI 둘 다 가독)

## Sprint 2 진행 결단 기준

- 모두 만족 → Sprint 2 진행 (5건 전체 형식화)
- 일부 만족 → Sprint 2 범위 축소 (2~3건)
- 모두 미달 → Phase 4.5 도입 재검토 (옵션 A 직진)
