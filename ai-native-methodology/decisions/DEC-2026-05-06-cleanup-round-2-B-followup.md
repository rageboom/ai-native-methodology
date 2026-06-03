# DEC-2026-05-06-cleanup-round-2-B-followup

| 항목     | 값                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 결정자   | 윤주스 (TF Lead)                                                                                                                                                          |
| 일자     | 2026-05-06                                                                                                                                                                |
| 상태     | 승인 ( Round 2-B 후속 — 9 도구 표준화 + 10 placeholder 정돈 + schemas/README 갱신 / no release / no tag)                                                                  |
| 카테고리 | methodology / 자산 정돈 / 표준 schema 통일 / lifecycle 정합                                                                                                               |
| 관련     | DEC-2026-05-06-cleanup-round-2-B (10 신설 직후), DEC-2026-05-06-sub-plan-4-종결 (chain skill 13 채움), DEC-2026-05-06-v2.0-i-strict-채택 (chain harness 4 stage paradigm) |

---

## 컨텍스트

cleanup round 2-B (10 신설) 직후 후속. 사용자 명시 결단:

> "B" (= Round 2-B 후속 진행)

Round 2-B 후속 = (1) 9 도구 README 표준 schema 통일 + (2) 10 placeholder README 정돈 + (3) schemas/README 갱신.

## 결정

### 1. 9 도구 README 표준 schema 통일 ( Round 2-B 일관성)

표준 schema = **Purpose / When to call / Inputs / Outputs / Exit codes / Sibling tools / 참조** (cleanup round 2-B 신설 4 도구 README 와 동일).

| 도구                             | 갱신 핵심                                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `chain-coverage-validator/`      | gate #2 / chain 2 (spec) / Sibling 4 도구 cross-link                                      |
| `decision-table-validator/`      | DMN 5종 / Phase 4.5 짝 (drift + formal-spec-link)                                         |
| `drift-validator/`               | ADR-008 enforcement / `--check-chain-layout` + `--check-state-flow-consistency` 추가 명시 |
| `formal-spec-link-validator/`    | BE + FE + chain 3 모드 / `--chain-mode` 추가 명시                                         |
| `planning-extraction-validator/` | gate #1 / chain 1 / AI 환각 방지                                                          |
| `spec-test-link-validator/`      | gate #3 / chain 3 / framework-mismatch 정합                                               |
| `spectral-runner/`               | no-simulation 1호 (v1.3.0 첫 실 실행)                                                     |
| `static-runner/`                 | no-simulation 핵심 / 5종 물증 + 1차 plugin 범위 + custom rules 9                          |
| `traceability-matrix-builder/`   | release matrix / DO-178C 정합 / Sibling 4 gate validator + chain-driver                   |

### 2. 10 placeholder README 정돈 (lifecycle 정합)

| Path                   | 처분                       | 의도                                                         |
| ---------------------- | -------------------------- | ------------------------------------------------------------ |
| `skills/test/`         | rewrite (chain 3 활성)     | sub-plan-4 채움 명시 / RED 의무 / gate #3                    |
| `skills/planning/`     | rewrite (chain 1 활성)     | sub-plan-4 채움 명시 / source-grounded / gate #1             |
| `skills/implement/`    | rewrite (chain 4 활성)     | sub-plan-4 채움 명시 / GREEN 의무 / gate #4                  |
| `skills/design/`       | header 갱신 (v2.x carry)   | chain harness 4 stage 외 / chain 2 spec 와 차별화 시점 carry |
| `agents/design/`       | header 갱신 (v2.x carry)   | 동상                                                         |
| `agents/analysis/`     | rewrite (활성 명시)        | analysis stage = chain 1 진입 전 / `_base/` 3종 활용         |
| `templates/design/`    | header 갱신 (v2.x carry)   | analysis FE 트랙에 부분 포함                                 |
| `templates/test/`      | rewrite (chain 3 정합)     | framework 분기 명시 / test-cmd.json 의존                     |
| `templates/planning/`  | header 갱신 (chain 1 정합) | sub-plan-4 chain skill 부분 채움                             |
| `templates/implement/` | rewrite (chain 4 정합)     | round-trip 부분 허용 (DEC-2026-05-06) 명시 / stack 분기      |

모든 placeholder 의 stale 메시지 ("v1.4.x = analysis stage only" / "v2.0+ scope") 제거 → v2.0.0-rc1 chain harness validated 정합.

### 3. schemas/README 갱신

- 11 schema → **29 schema** 명시 (chain v2 6 + state 영속 3 + analysis BE 5 + FE 8 + cross-cutting 4 + 메타 + 유틸)
- chain harness v2.0 섹션 신설 (gate validator 매핑)
- v1.2.1 → v2.0.0-rc1 정합 (5종 물증 if/then 의무 + Ajv 8 strict mode)
- sibling cross-link (tools/README + methodology-spec/README)

### 4. 본 round 결과

| 영역                               | before                                 | after                                            |
| ---------------------------------- | -------------------------------------- | ------------------------------------------------ |
| dist files                         | 251                                    | **251** (변경 없음 / 모두 갱신)                  |
| 9 도구 README 표준 schema 일관성   | ❌ (각자 다른 형식)                    | ✅ (Purpose/When/In/Out/Exit/Siblings/참조 통일) |
| 10 placeholder README stale 메시지 | "v1.4.x analysis only" / "v2.0+ scope" | ✅ v2.0.0-rc1 chain harness validated 정합       |
| schemas/README schema 카운트       | "11 schema" stale                      | "29 schema" 정합                                 |
| Sibling cross-link 그래프          | 분산 / 불완전                          | 모든 도구 README 에 sibling 4+ 명시              |

shasum -c CHECKSUMS.txt → **250 / 250 OK**.

## Carry — Round 2-C / 2-D

본 round 종결 후 진행 가능 carry:

### Round 2-C (사용자 journey 자산 신설)

- `getting-started.md` (dist root / 10분 walkthrough)
- `chain-harness-guide.md` (init/next/blocked/unblock loop 시각화)
- `common-errors.md` (FAQ / version mismatch / hook 안 뜸 / blocked 풀이)
- `first-prompt-cookbook.md` (자연어 → skill matching 표 확장)

### Round 2-D (선택)

- project root `CLAUDE.md` v1.4.3 → v2.0.0-rc1 라벨 sync
- v1.4.0-dev 3 entry CHANGELOG-HISTORY 로 추가 격리 (CHANGELOG.md 1060 → ~700 line)

## Lessons

1. **표준 schema 통일의 가치 입증** — 9 도구 README 가 모두 same way 로 정돈되니 plugin user 가 "어느 도구든 동일 mental model" 로 이해 가능.
2. **placeholder stale 메시지 회수** — paradigm 변경 (v1.x → v2.0) 시 cascading drift 가 placeholder 까지 도달. cleanup round 2-A 의 entry-point sync 외 본 round 의 placeholder sweep 까지 필요.
3. **Sibling cross-link 그래프** — 각 도구 README 가 4+ sibling 명시 = plugin user 가 "이 도구 사용 후 다음 도구" 자연스럽게 도달.

## release / tag

- no release / no tag / 본체 commit 만
- v2.0.0-rc1 → v2.0.0 final 자격 영향 ❌

## 결단 묶음

D1 9 도구 표준 schema 적용 / D2 10 placeholder 정돈 (3 카테고리: 채움 활성 / carry 명시 / lifecycle 정합) / D3 schemas/README 29 schema 갱신 / D4 build + shasum 250 OK / D5 carry (2-C / 2-D)
