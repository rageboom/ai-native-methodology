# DEC-2026-05-21 — G-006 amendment: test-spec.json carry-from-iter generation_mode 정식화

## 결정

- **G-006 보강** = `test-generate-test-spec` skill SKILL.md §test_carry_from 단락 신설 + `test-spec.json` 의 `meta.generation_mode` enum + `tests[].carry_from` 객체 + 합격 게이트 정식화 (additive only / breaking 0):
  - **generation_mode enum 3값** — `fresh-write` (default) / `carry-from-iter` / `hybrid`
  - **tests[].carry_from 객체 필드 5종** — iter_path / tc_id_prior / source_file_prior / rationale / equivalence_check
  - **equivalence_check enum 3값** — `manual-confirmed` / `automated-diff-passed` / `pending` (gate stop)
  - **합격 게이트 4축** — AC ID match / Gherkin assertion match / framework match / commit_hash 인용
  - **spec-test-link-validator 신규 finding 4종** — `test.carry-from-missing-equivalence-check` (high) / `test.carry-from-iter-path-not-found` (critical) / `test.carry-from-ac-ref-orphan` (critical) / `test.generation-mode-meta-missing` (medium)
- v8.8.0 MINOR 진입 — additive only / breaking 0 / 기존 fresh-write path 무변경 (default=fresh-write 시 carry_from 부재 OK).

## 근거

### 1. 실 사용 사례 — mis-fe-admin DWPD-1774 5 stage 실증 테스트 (2026-05-21)

`docs/experiment-reports/methodology-test-gaps.md` §G-006 — v1 cycle 1~13 의 test 12 파일이 살아있어 test stage 가 fresh-write 가 아닌 "carry-from-v1" 케이스. plugin v8.7.4 의 test-spec.json 표기 명세에 carry 케이스 부재 → 사용자 ad-hoc 표기로 처리되었고, chain 4 진입 시 GREEN 검증 게이트가 carry test 의 acceptance-criteria 정합 확인 path 없이 진행됨 = F-VERIFY-G006 결정적 evidence.

### 2. invariant 본질

**generation_mode 본질 — test 생성 strategy 의 evidence trail**:
- `fresh-write`: AC → 신규 generate (가장 안전 / drift 없음)
- `carry-from-iter`: 이전 iter test 인계 (가장 빠름 / drift 위험)
- `hybrid`: 일부 carry / 일부 신규 (중간)

이 3 모드를 통합하지 않으면 traceability-matrix 의 AC ↔ TC forward link 신뢰성이 "어떤 TC 는 본 chain 산출 / 어떤 TC 는 carry" 모호 → chain 4 GREEN 검증이 의미 drift 위에서 진행될 가능성.

**equivalence_check 본질** — carry TC 의 의미 정합은 자동으로 보장 ❌. 사용자 검토 (`manual-confirmed`) 또는 validator 자동 diff (`automated-diff-passed`) 중 하나 의무. `pending` 상태로 gate=go 시도 시 reject.

### 3. universal claim 정합

| 축 | plugin v8.7.4 | v8.8.0 (G-006 보강) |
|---|---|---|
| test 생성 strategy 구분 | 명시 없음 (fresh-write 암묵 가정) | 3 모드 enum + carry_from 객체 |
| carry TC 의미 정합 검증 | 없음 | equivalence_check enum + 합격 게이트 4축 |
| iter_path evidence | 없음 | iter_path + tc_id_prior + source_file_prior 의무 |
| Auto Mode 흐름 | 명세 부재 | gate #3 cluster + pending → confirm 의무 |

## 변경 항목

1. **SKILL.md §test_carry_from 단락 신설** — §RED 의무와 §70~80% 한계 사이 위치. 배경 / test-spec.json 신설 필드 / generation_mode 분기 / 합격 게이트 / validator finding / Auto Mode 흐름 5 sub-section.
2. **DEC record 신설** — 본 파일.
3. **plugin.json 3 SSOT** — v8.7.4 → v8.8.0 MINOR (G-005 + G-006 + G-007 batch 합산).

## carry / 후속

- **schema 갱신** — `test-spec.schema.json` 의 `meta.generation_mode` enum + `tests[].carry_from` 객체 schema 정식 추가 = 후속 task.
- **spec-test-link-validator 본문 갱신** — 신규 finding 4종 emit 로직 추가 = 후속 task.
- **mis-fe-admin DWPD-1774 case study** — 본 보강 후 mis-fe-admin 갭 보고서 update 의무.

## Cross-link

- 보강 대상 skill: `skills/test-generate-test-spec/SKILL.md` §test_carry_from
- 갭 보고서: `mis-fe-admin/docs/experiment-reports/methodology-test-gaps.md` §G-006
- 형제 결단: `decisions/DEC-2026-05-21-G005-planning-decision-source-enum.md` (Auto Mode pending paradigm) / `DEC-2026-05-21-G007-impl-strategy-enum.md` (strategy_chosen 형제)
- DEC: `decisions/DEC-2026-05-06-v2.0-i-strict-채택` §70~80% 한계
- DEC: `decisions/DEC-2026-05-06-round-trip-부분-허용` (revisit:test 가능)
