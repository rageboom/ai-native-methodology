# DEC-2026-05-15 — 잔여 carry 묶음 정리 / paradigm 진화 완료점

- **결정일**: 2026-05-15
- **결정자**: 윤주스 (TF Lead)
- **상태**: 종결 (v3.6.2)

## 결정

charter §3 활성 Gap 모두 청산 (G2/G3/G4/G5) + G1 영구 scope-out 후 잔여 carry 라벨 모두 정리.

**사용자 명시 결단 (2026-05-15)**: "carry 다 제거"

## 정리 대상 6 carry

| # | carry | 정리 사유 | 결단 |
|---|------|----------|------|
| **C1** | G6 `/analyze-fullstack` Scenario B 통합 명령어 | charter §3 외 / be-fe-separation.md §4.1 D25 carry 본문 보존 / 사용 사례 0 / G1 sibling paradigm | **영구 scope-out** (재제안 ❌) |
| **C2** | G2 orchestrate 분리 신호 (1-A → 1-B 격상 trigger) | paradigm history = DEC-2026-05-15-g2-orchestrate-skill-분리-채택 + CHANGELOG v3.3.0 + LL-G2-03 안 본격 보존 / 별도 carry 라벨 중복 | **라벨 제거** (미래 사용 사례 누적 시 사용자 새 결단) |
| **C3** | Vue 2 / React 18 legacy 분기 | 사용자 사내 사례 부재 / G4 carry 표 안 명시되어 있으나 paradigm 진화 가치 ↓ | **라벨 제거** (사례 발생 시 새 결단) |
| **C4** | form action 분산 anti-pattern 자체 grep rule | analysis-html-template skill 시행 단계 결단 / 시행 부재 = carry 라벨 약함 | **라벨 제거** (시행 시 결단) |
| **C5** | PoC #04 Scenario A 본격 검증 (React FE 트랙) | 별도 PoC session 의무 / 현 paradigm 진화 영역 아님 / fork 검증 영역 | **라벨 제거** (PoC session 진입 시 새 결단) |
| **C6** | Scenario B PoC (Next.js) | 동일 | **라벨 제거** |
| **C7** | Scenario C PoC (JSP) | 사내 legacy 사례 / 사내 환경 의존 | **라벨 제거** |

## paradigm 근거

1. **paradigm 단순화** — charter §3 모두 청산 + carry 라벨 정리 = plugin must-have 본격 안정점 도달. 잔여 carry 표 비대화 = paradigm 추적 부담 ↑ / paradigm 진화 속도 ↓
2. **history 보존** — 본 결단 정리한 carry 의 paradigm history 는 각각 DEC + CHANGELOG + LL 안 본격 보존. 별도 carry 라벨 = **중복 추적** / 라벨 제거 시 history 손실 ❌
3. **G1 sibling paradigm** — G1 영구 scope-out (DEC-2026-05-15-g1-itsm-permanent-scope-out) 의 paradigm 동일 적용. 가치 < 비용 / 사용 사례 부재 / 미래 결단 새 신설 가능
4. **사용자 결단 권한** — 사용자 명시 "carry 다 제거" = paradigm 진화 권한 행사 / 본 결단 reversal = 사용자 명시 새 결단 의무

## C1 G6 영구 scope-out 본격 명시 (G1 sibling)

C1 G6 = G1 같은 영구 scope-out paradigm:

- **본질**: be-fe-separation.md §4.1 D25 carry (`/analyze-fullstack` 명령어 미등록) → Scenario B 도 deliverable 별 분리 실행 (각 `analyze-*` skill 호출) 으로 영구 보존
- **재제안 ❌** — 향후 session 에서 G6 자동 명령어 신설 제안 회피 의무 (G1 paradigm 정합)
- **재진입 가능 조건** — 사용자가 새 R 요구 (R18+) 로 charter 신설 결단 시 별도 진입 (G6 라벨 부활 ❌)

## 보존 자산 (라벨 제거 후 history 보존 위치)

| 정리 carry | history 위치 |
|---|---|
| C1 G6 | be-fe-separation.md §4.1 D25 carry 본문 + 본 DEC §C1 G6 영구 scope-out |
| C2 | DEC-2026-05-15-g2-orchestrate-skill-분리-채택 §의제 1 + CHANGELOG v3.3.0 + LL-G2-03 |
| C3 | DEC-2026-05-15-g4-fe-skill-track-종결 §후속 carry + plan-g4-fe-skill-track.md §6 B3 |
| C4 | DEC-2026-05-15-g4-fe-skill-track-종결 §3-D §scope-out + analysis-html-template SKILL.md |
| C5/C6/C7 | be-fe-separation.md §8 다음 (PoC session 분리 paradigm) |

## 수정 자산

- `decisions/STATUS.md` session 19차 추가 entry (carry 정리 종결)
- `.claude-plugin/plugin.json` 3.6.1 → 3.6.2
- `CHANGELOG.md` v3.6.2 entry

## paradigm 진화 완료점 (★ 2026-05-15)

본 결단 = plugin must-have 자산 + paradigm 진화 안정점 도달 명시:

| 영역 | 상태 |
|---|---|
| charter §1 (R1~R17) | 15/15 자산 대칭 + R16/R17 scope-out |
| charter §3 (Gap) | 모두 청산 (G2/G3/G4/G5) + G1 scope-out |
| 잔여 carry | 모두 정리 (C1~C7 라벨 제거) |
| 본격 자산 | 5 stage (input/analysis/planning/spec/test/implement) + cross-cut (traceability/aspects) skill 자산 대칭 |
| 의미 ID paradigm | v2.6.0 의미 ID + v3.x sub-axis 진화 (analysis-from-*) 모두 정합 |

## 후속 (가능 진입 영역)

향후 session 에서 가능 작업 영역 (현 carry 없음 / 사용자 결단 시 새 진입):

- **PoC 본격 검증** — Scenario A/B/C 별 fork PoC (사용자 결단 시 새 session)
- **사내 dogfooding 본격** — 사용자 사내 동료 install / 사용 사례 누적 후 paradigm 재평가
- **신규 R 요구** — 사용자가 charter §1 새 must-have 결단 시 R18+ 진입

## 정합 관계

- DEC-2026-05-15-g1-itsm-permanent-scope-out (G1 영구 scope-out sibling)
- DEC-2026-05-15-g{2,3,4,5}-* (Gap 종결 sibling)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (charter 원안)
- be-fe-separation.md §4.1 D25 carry (G6 history 보존)
- memory `feedback_itsm_g1_permanent_scope_out` (재제안 회피 paradigm)

## Lessons Learned

- **LL-cleanup-01**: carry 라벨 = paradigm 진화 추적 자산. 진화 완료 + 사용 사례 누적 부재 시 = 라벨 제거 정합. history 는 DEC + CHANGELOG + LL 안 본격 보존 → carry 라벨 = 중복 추적 / 정리 ROI ↑
- **LL-cleanup-02**: paradigm 진화 안정점 도달 시 carry 묶음 정리 = "단순화 결단" paradigm. 미래 사용 사례 누적 시 새 carry 신설 가능 (라벨 부활 ❌ / 새 라벨 신설).
