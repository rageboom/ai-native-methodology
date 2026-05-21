# DEC-2026-05-21 — G-005 amendment: planning-extract-from-legacy 결단 처리 + decision source enum 정식화

## 결정

- **G-005 보강** = `planning-extract-from-legacy` skill SKILL.md §결단 처리 단락 신설 + `planning-spec.json` 의 `decisions[]` / `pending_decisions[]` / `decisions[].source` enum 정식화 (additive only / breaking 0):
  - **source enum 4값** — `user-explicit` / `AI-default` / `AI-investigation-complete` / `carry`
  - **revisit_required 의무 결합** — `source=AI-default` 시 `revisit_required:true` 의무
  - **Auto Mode 흐름 명시** — Auto Mode 활성 시 pending_decisions[] → AI-default 1차 결단 + 후속 chain 2 gate cluster 일괄 confirm
  - **Auto Mode 미활성 (default)** — pending_decisions[] 가 있으면 gate #1 cluster 5번에서 user-explicit 결단 받음 + chain 1 종결 reject (gate stop) 안전기본
  - **validator 신규 finding 3종** — `planning.ai-default-revisit-flag-missing` (critical) / `planning.pending-decisions-not-resolved` (critical) / `planning.carry-decision-missing-evidence-path` (high)
- v8.7.5 PATCH 진입 — additive only / breaking 0. SKILL.md §절차 9 cluster 에 pending_decisions cluster 항목 1줄 추가 + §결단 처리 단락 신설 (기존 단락 무변경).

## 근거

### 1. 실 사용 사례 — mis-fe-admin DWPD-1774 5 stage 실증 테스트 (2026-05-21)

`docs/experiment-reports/methodology-test-gaps.md` §G-005 — Stage 1 종결 시 3건의 사용자 결단 보류 발생:
- D-1 시스템 default = 첫 옵션 자동 선택
- D-2 부서 source = BE escalate (placeholder UI carry)
- D-3 user pagination = 시스템별과 동일

이 3건 모두 Auto Mode 에서 AI-default 적용 후 진행해야 하는데, plugin v8.7.4 의 chain harness 명세에 "결단 보류 → AI-default tag → 후속 revisit" 흐름이 부재했음. 사용자가 ad-hoc 으로 record 한 결단 3건이 planning-spec.json 의 정식 필드에 격납되지 못함 = F-VERIFY-G005 결정적 evidence.

### 2. invariant 본질

**source enum 4값 본질** — 결단의 신뢰도/책임 주체가 다름:
- `user-explicit`: 사용자 명시 (가장 강한 신뢰)
- `AI-default`: AI 의 첫 옵션 selection (가장 약한 신뢰 / revisit 의무)
- `AI-investigation-complete`: AI 의 legacy code grep / 도메인 분석 근거 (중간 신뢰 / revisit 권고)
- `carry`: 이전 cycle 결단 인계 (evidence path 인용 의무)

이 4값을 통합하지 않으면 후속 chain 2/3/4 stage 의 traceability gate 에서 "어떤 결단을 사용자가 confirm 해야 하는가" 가 명확하지 않음 (예: AI-default 결단을 user-explicit 처럼 통과 시 후속 stage 가 잘못된 default 위에 build).

**Auto Mode 안전기본 본질** — Auto Mode 미활성 default 에서는 pending_decisions[] non-empty + gate=go 시도가 reject 되어야 함. 사용자가 결단을 보류한 상태로 chain 1 종결 시 → 후속 chain 2 가 잘못된 가정 위에 build (silent failure).

### 3. universal claim 정합

| 축 | plugin v8.7.4 | v8.7.5 (G-005 보강) |
|---|---|---|
| 결단 source 구분 | 없음 (모든 결단 동일 취급) | 4값 enum + revisit_required flag |
| Auto Mode 흐름 | 명세 부재 | gate #1 cluster + chain 2 gate cluster confirm |
| 사용자 결단 보류 | gate=go silent pass | pending_decisions[] non-empty + Auto Mode 미활성 시 gate stop |
| carry 결단 evidence | 명세 부재 | rationale 안 evidence path 의무 |

## 변경 항목

1. **SKILL.md §절차 단계 9** — cluster 5번 (pending_decisions[] / Auto Mode 미활성 시 user-explicit 결단) 1줄 추가 / 기존 cluster 무변경.
2. **SKILL.md §결단 처리 단락 신설** — §절차와 §70~80% 한계 사이 위치. 배경 / planning-spec.json 신설 필드 / source enum semantic / Auto Mode 흐름 / Auto Mode 미활성 흐름 / validator 검증 5 sub-section.
3. **DEC record 신설** — 본 파일.
4. **plugin.json + package.json + CLAUDE.md (parent) 3 SSOT** — v8.7.4 → v8.7.5 PATCH.

## carry / 후속

- **schema 갱신** — `planning-spec.schema.json` 의 `decisions[]` / `pending_decisions[]` 필드 정식 schema 추가 = 후속 task (v8.7.6 또는 v8.8.0).
- **planning-extraction-validator 본문 갱신** — 신규 finding 3종 (`planning.ai-default-revisit-flag-missing` / `planning.pending-decisions-not-resolved` / `planning.carry-decision-missing-evidence-path`) emit 로직 추가 = 후속 task.
- **mis-fe-admin DWPD-1774 case study** — 본 보강 후 mis-fe-admin 갭 보고서 update 의무.

## Cross-link

- 보강 대상 skill: `skills/planning-extract-from-legacy/SKILL.md` §결단 처리
- 갭 보고서: `mis-fe-admin/docs/experiment-reports/methodology-test-gaps.md` §G-005 (외부 reference)
- F-VERIFY-G005 결정적 evidence: mis-fe-admin DWPD-1774 5 stage 테스트 §결단 보류 3건
- 결단 record 패턴: `decisions/DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md` (B14/B15 amendment 패턴 차용)
- ADR: `decisions/ADR-CHAIN-002` §gate UX cluster 결단
- DEC: `decisions/DEC-2026-05-06-v2.0-i-strict-채택` §70~80% 한계
- DEC: `decisions/DEC-2026-05-06-round-trip-부분-허용` (revisit:analysis 가능 — AI-default revisit 의무와 정합)
