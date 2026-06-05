# DEC-2026-05-21 — G-007 amendment: impl-spec.json strategy_chosen enum 정식화

## 결정

- **G-007 보강** = `implement-generate-impl-spec` skill SKILL.md §strategy_chosen 단락 신설 + `impl-spec.json` 의 `meta.strategy_chosen` enum + `impl_modules[].restore_source` 객체 + 합격 게이트 정식화 (additive only / breaking 0):
  - **strategy_chosen enum 3값** — `ai-generate-fresh` (default) / `git-restore` / `hybrid-restore-and-modify`
  - **impl_modules[].restore_source 객체 필드 4종** — branch / commit_hash / file_paths[] / rationale
  - **impl_modules[].modify_diff 필드** — hybrid 시 의무
  - **합격 게이트 strategy 별 분리** — git-restore 시 AC ↔ restored impl 정합 검증 gate #4 cluster 필수 항목
  - **신규 finding 5종** — `impl.strategy-chosen-meta-missing` (medium) / `impl.git-restore-source-incomplete` (critical) / `impl.git-restore-equivalence-not-verified` (high) / `impl.hybrid-modify-diff-missing` (high) / `impl.restore-source-commit-not-in-repo` (critical)
- v8.8.0 MINOR 진입 — additive only / breaking 0 / 기존 ai-generate-fresh path 무변경 (default=ai-generate-fresh 시 restore_source 부재 OK).

## 근거

### 1. 실 사용 사례 — mis-fe-admin DWPD-1774 5 stage 실증 테스트 (2026-05-21)

`docs/experiment-reports/methodology-test-gaps.md` §G-007 — v1 코드가 git history (develop) 에 있어 implement stage 가 fresh-generate 가 아닌 "git-restore" 케이스. plugin v8.7.4 의 impl-spec.json 표기 명세에 generate 외 strategy 부재 → 사용자가 `git checkout develop -- <files>` 로 19 파일 복원했으나, impl-spec.json 의 `commit_hash` 필드 의미가 "신규 generate commit" vs "restored 출처 commit" 모호 + AC ↔ restored impl 정합 검증 게이트 부재 = F-VERIFY-G007 결정적 evidence.

### 2. invariant 본질

**strategy_chosen 본질 — impl 생성 strategy 의 evidence trail**:

- `ai-generate-fresh`: test → 신규 generate (가장 시뮬 위험 / chain 4 본질 path)
- `git-restore`: 이전 branch / commit 의 코드 복원 (가장 안전 / 단 AC drift 위험)
- `hybrid-restore-and-modify`: restore + modify (중간)

이 3 strategy 를 통합하지 않으면 `commit_hash` 의미가 양가성 → static-runner lint-no-simulation 의 `commit_hash 의무` 검증 (sub-plan-3a) 가 false positive 또는 false negative 발생 가능 (예: restore 의 출처 commit 만 인용하고 본 chain 의 commit 부재 시 검증 통과).

**restore_source.commit_hash 본질** — `git cat-file -t <hash>` 로 실 존재 검증 의무. 이전 cycle 에서 force-push 또는 rebase 로 commit 이 사라졌으면 evidence trail 끊김 → reject (`impl.restore-source-commit-not-in-repo`).

**AC ↔ restored impl 정합 본질** — restored 코드가 본 chain 의 acceptance-criteria 와 의미 정합인지 자동 검증 ❌ (코드 의미 분석 = LLM 환각 위험). 사용자 검토 의무 (gate #4 cluster 필수 항목).

### 3. universal claim 정합

| 축                      | plugin v8.7.4                           | v8.8.0 (G-007 보강)                                                |
| ----------------------- | --------------------------------------- | ------------------------------------------------------------------ |
| impl 생성 strategy 구분 | 명시 없음 (ai-generate-fresh 암묵 가정) | 3 strategy enum + restore_source 객체                              |
| commit_hash 의미        | "본 chain commit" 만 가정               | strategy 별 분리 (본 chain commit + restore 출처 commit_hash 별도) |
| AC ↔ restored 정합 검증 | 없음                                    | gate #4 cluster 필수 항목 + intervention-log entry 의무            |
| hybrid modify 추적      | 없음                                    | modify_diff 필드 의무                                              |

## 변경 항목

1. **SKILL.md §strategy_chosen 단락 신설** — §70~80% 한계와 §기술 스택 분기 사이 위치. 배경 / impl-spec.json 신설 필드 / strategy 별 합격 게이트 / validator finding / Auto Mode 흐름 5 sub-section.
2. **DEC record 신설** — 본 파일.
3. **plugin.json 3 SSOT** — v8.7.4 → v8.8.0 MINOR (G-005 + G-006 + G-007 batch 합산).

## carry / 후속

- **schema 갱신** — `impl-spec.schema.json` 의 `meta.strategy_chosen` enum + `impl_modules[].restore_source` 객체 schema 정식 추가 = 후속 task.
- **static-runner lint-no-simulation 본문 갱신** — strategy 별 commit_hash 의미 분리 + restore_source.commit_hash 의 `git cat-file -t` 검증 = 후속 task.
- **mis-fe-admin DWPD-1774 case study** — 본 보강 후 mis-fe-admin 갭 보고서 update 의무 ( 본 보강의 impl-spec.json 이 reference 자격).

## Cross-link

- 보강 대상 skill: `skills/implement-generate-impl-spec/SKILL.md` §strategy_chosen
- 갭 보고서: `mis-fe-admin/docs/experiment-reports/methodology-test-gaps.md` §G-007
- 형제 결단: `decisions/DEC-2026-05-21-G005-planning-decision-source-enum.md` (Auto Mode pending paradigm) / `DEC-2026-05-21-G006-test-carry-strategy.md` (generation_mode 형제)
- DEC: `decisions/DEC-2026-05-06-v2.0-i-strict-채택` §70~80% 한계
- DEC: `decisions/DEC-2026-05-06-round-trip-부분-허용` (revisit:test 가능)
- ADR: `decisions/ADR-CHAIN-001` §3 (no-simulation 강화)
- ADR: `decisions/ADR-CHAIN-004` §4 (--allow-execute 의무)
