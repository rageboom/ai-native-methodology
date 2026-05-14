# DEC-2026-05-06-cleanup-round-2-B

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-06 |
| 상태 | 승인 (★ ★ ★ 각 폴더 README 정돈 — 사용자 진짜 핵심 / 10 신설 / no release / no tag) |
| 카테고리 | methodology / 자산 정돈 / 참조 그래프 visible / cadence visible |
| 관련 | DEC-2026-05-06-cleanup-round-2-A (paradigm sync 직후), DEC-2026-05-06-sub-plan-4-종결 (chain skill 13 + 5 chain agent README 정식 채움), DEC-2026-05-06-sub-plan-5-종결 (chain-driver workspace 12번째) |

---

## 컨텍스트

cleanup round 2-A 후속. 사용자 reframe 2차 명시:

> "user ux 관점도 맞지만 실제로 각 폴더가 있고 해당 폴더에 파일들이 잘 정돈 되어 있고 실제 참조 되고 필요에 의해 호출 되고 하는 것들이 잘 보였으면 한다."

→ **각 폴더 자산 정돈 + 참조 그래프 visible + 호출 cadence visible** = 본 round 핵심 의도.

cleanup round 2-A 후 8 폴더 README 부재 + 4 도구 README 부재 발견. plugin user 가 각 폴더 진입 시 "이 자산 무엇 / 어디서 참조 / 언제 호출" 도달 path 0.

## 결정

### 6 폴더 README 신설 (사용자 진짜 핵심 영역)

| README | 핵심 내용 |
|---|---|
| [`tools/README.md`](../tools/README.md) | ★ ★ ★ 12 도구 cadence table (stage × validator × 호출 주체) — 어느 stage 어느 gate 에 어느 도구 / 자동 vs 수동 vs skill 호출 / P/D 분류 / 진짜 외부 도구 (Spectral / Semgrep / PMD) 통합 |
| [`methodology-spec/README.md`](../methodology-spec/README.md) | ★ ★ phase × deliverable × schema 매트릭스 (★ 도달 path) — analysis stage 11 phase + chain v2 5 stage + cross-cutting 4 영역 + chain-driver state 영속 + cross-cutting 정책 7 |
| `agents/README.md` (★ ★ v2.5.1 1-depth 평탄화 후 부재 / historical reference) | 6 agent (analysis + 4 chain + design carry) / 호출 cadence / 각 agent 의 skill 위치 |
| `skills/README.md` (★ ★ v2.5.1 1-depth 평탄화 후 부재 / historical reference) | 44 skill (5 _base + 18 analysis + 11 chain + design carry) / 자연어 prompt 표 / D21' 호출 메커니즘 |
| [`hooks/README.md`](../hooks/README.md) | 3 hook (SessionStart + UserPromptSubmit + PreToolUse) / D21' suppressOutput=true / mechanical gate trio (iii) PreToolUse deny |
| [`templates/README.md`](../templates/README.md) | analysis 22 + adoption build alias + chain placeholder 4 (sub-plan-4 일부 채움 / 미채움 carry) |

### 4 도구 README 신설 (tools/ 누락)

| README | 핵심 내용 |
|---|---|
| [`tools/chain-driver/README.md`](../tools/chain-driver/README.md) | ★ ★ ★ 5 요소 enforcement 본격 / cli 7 command / state.json + intervention-log.jsonl / exit code matrix (0/1/2/3/4) |
| [`tools/_shared/README.md`](../tools/_shared/README.md) | baseline.js (ADR-010 baseline + ratchet) / 3 도구 import / 독립 실행 ❌ |
| [`tools/schema-validator/README.md`](../tools/schema-validator/README.md) | Ajv 8 strict mode / chain 6 schema 자동 등록 / if/then strict / sibling = 4 chain validator |
| [`tools/test-impl-pass-validator/README.md`](../tools/test-impl-pass-validator/README.md) | ★ ★ ★ chain 4 gate / no-simulation 핵심 / 5 framework adapter / `--allow-execute` 의무 / result_hash SARIF Appendix F / flaky retry per-test cap 2 |

### 본 round 적용 표준 schema

각 README 가 최소 다음 섹션 포함:
- **Purpose** — 도구/폴더의 역할 1줄 요약
- **When to call / 호출 cadence** — 시점 + 호출자 (★ 사용자 의도 "필요에 의해 호출")
- **Inputs / Outputs / Exit codes** — 도구 README
- **Sibling tools / 사용 위치** — 참조 그래프 (★ 사용자 의도 "실제 참조")
- **참조** — ADR / DEC / sibling README cross-link

### 본 round 결과

| 영역 | before | after |
|---|---|---|
| dist files | 241 | **251** (+10 신설) |
| 부재 폴더 README | 6 | 0 (★ 모두 채움) |
| 부재 도구 README | 4 | 0 (★ 모두 채움) |
| 도달 path "각 폴더 자산 어떻게 정돈?" | ❌ | ✅ |
| 도달 path "어디서 참조됨?" | ❌ | ✅ (각 README "참조" / "Sibling" 섹션) |
| 도달 path "언제 호출됨?" | ❌ | ✅ (각 README "When to call" / "호출 cadence") |

shasum -c CHECKSUMS.txt → **250 / 250 OK** (CHECKSUMS 자체 제외 / 정상).

## Carry — Round 2-B 후속 + 2-C / 2-D

본 round 는 6 폴더 README + 4 도구 README **신설** 단계만 진행. 다음 후속:

### Round 2-B 후속 (★ 별도 round / 사용자 결단 후)

- **9 도구 README 표준 schema 통일** — chain-coverage / decision-table / drift / formal-spec-link / planning-extraction / spec-test-link / spectral / static / traceability 9개의 README 를 본 round 표준 schema (Purpose / When / In / Out / Exit / Siblings / 참조) 로 정돈
- **10 placeholder README 정돈** — `agents/{design,analysis}` + `skills/{design,test,planning,implement}` + `templates/{design,test,planning,implement}` (sub-plan-4 일부 채움 / lifecycle 명시 carry)
- **schemas/README.md 갱신 검토** — 기존 69 line → cleanup round 2-A 정합 (paradigm 변경 반영 + sibling)

### Round 2-C (사용자 journey 자산 신설)

- `getting-started.md` (dist root / 10분 walkthrough)
- `chain-harness-guide.md` (init/next/blocked loop)
- `common-errors.md` (FAQ)
- `first-prompt-cookbook.md` (자연어 → skill matching 표)

### Round 2-D (선택)

- project root `CLAUDE.md` v1.4.3 → v2.0.0-rc1 라벨 갱신

## Lessons

1. **사용자 의도 reframe → 명시 핵심** — "각 폴더 정돈 + 참조 + 호출 visible" 이 round 2-B 의 명확한 정의. 부재 README 가 plugin user 도달 path 0 의 직접 원인.
2. **표준 schema 의 가치** — 각 README 가 동일 섹션 (Purpose / When / In / Out / Exit / Siblings / 참조) 으로 정돈되니 plugin user 가 "어느 도구든 same way 로 이해" 가능.
3. **신설 vs 표준화 분리** — 본 round 는 신설 만. 표준화 (기존 9 도구 README 정돈) 는 별도 round 로 분할 (큰 plan 14차 retract 회피).

## release / tag

- ★ no release / no tag / 본체 commit 만
- v2.0.0-rc1 → v2.0.0 final 자격 영향 ❌

## 결단 묶음

D1 부재 README 식별 (6 폴더 + 4 도구) / D2 표준 schema (Purpose/When/In/Out/Exit/Siblings/참조) / D3 tools/README cadence table (★ 사용자 의도 "호출 visible") / D4 methodology-spec/README phase × deliverable × schema 매트릭스 / D5 chain-driver README 5 요소 명시 / D6 build 검증 (251 files / shasum OK) / D7 9 도구 표준화 + 10 placeholder = round 2-B 후속 carry
