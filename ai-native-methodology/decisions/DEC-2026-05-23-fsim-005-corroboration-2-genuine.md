# DEC-2026-05-23-fsim-005-corroboration-2-genuine

> F-SIM-005 P1 carry 본격 해소 — Type 분류 3계층화 paradigm 진화 + fail_mode_qualification boolean 강제 + poc-02 carry 정직 표기.

- **결단 일자**: 2026-05-23 ( session 39차 / v8.14.0 MINOR release)
- **결단자**: 윤주스 (TF Lead) — 사용자 "ㄱㄱ" (4원칙 §1+§2+§3 ladder full / 3-agent Senior REVISE-3 흡수 + 옵션 α 채택)
- **범주**: methodology / F-SIM-005 P1 carry 본격 해소 + paradigm 진화 (Type 분류 3계층화 / fail_mode 4종 enum + boolean 강제 / Adzic SBE 함정 직접 회피)
- **상태**: 승인 / additive / breaking 0

## 컨텍스트

### 직전 상태 (v8.13.3 / 2026-05-23)

- F-SIM-005 P1 carry (commit-block deadline 2026-06-01 / D-9)
- v8.4.0 (2026-05-18) = PoC #14 Type 1 partial 달성 (Claude self-run / Python+pytest)
- self_consistency_note = "패러독스 해소" 명시 (그러나 본질 잔존 = Type 1 vs Type 2 분리 미명시)
- corroboration #2 자격 = 명목 1→2 / 그러나 실 Type 2 부재

### 사용자 결단 ladder (4원칙 full)

1. "이 프로젝트의 페러다임 들을 모두 조사해줘" → paradigm 14종 점검 보고
2. "각 paradigm의 충돌 지점이나 carry 있는지 점검해줘" → 충돌 11종 + carry 18종 보고
3. "좀더 잘 설명해줘" → 4 categorical pattern (α/β/γ/δ) + Self-bootstrap Paradox 풀이
4. "ㄱㄱ" — §10 권고 첫 의제 (F-SIM-005 P1 본격 해소) 결단

### 3-agent research (4원칙 §2)

- **Agent 1 (F-015)**: Claim A (Beck-canonical RED) **VERIFIED** (Kent Beck 2002 preface p.x verbatim "doesn't even compile at first") / Claim B (chain 4 GREEN bidirectional traceability) **PARTIAL-VERIFIED** (DO-178C verbatim) / Claim C (Type 1 vs Type 2 naming) **PARTIAL** (Adzic SBE 함정 VERIFIED / nomenclature first-mover). STOP signal **없음**.
- **Agent 2 (industry case)**: 9 case 본격 isomorphic (Rust 4-stage bootstrap + GCC 3-stage + Go self-hosting + Spec Kit gate enforcement + ThoughtWorks Radar / SWE-bench Live + Waymo Carcraft+실도로 + Anthropic Bloom auto-eval + HumanEval/SWE-bench gap 35~50%p). first-mover 자격 ✅ (compiler→methodology 전이) + 함정 회피 자격 3종 ✅.
- **Agent 3 (Senior critique)**: **REVISE-3 (confidence 0.83)** = STRONG-STOP signal 1 + HIGH 1 + MED 1 + LOW 1 흡수 의무.

### Senior REVISE 흡수 (4종)

- **REVISE-1 (BLOCKER)**: Type 2 9일 시한 안 불가능 → **Type 분류 3계층화** (Type 1 / Type 1.5 / Type 2) + Type 2 carry 정직 표기
- **REVISE-2 (HIGH)**: poc-15 신설 ❌ → **poc-02 재검증** (Java+JUnit+Spring Boot 3 stack 횡단)
- **REVISE-3 (MED)**: dry-run 30% 임계 §8.1 단일 PoC 함정 위배 → **warn-only + boolean 강제** (임계 ratio ❌ / 30% ratchet = v+1)
- **LOW**: plan §2 "5번째 export" 사실 오류 → **7번째 export** (utility 제외 6번째) 정정

### 사용자 결단 변경 흡수 (옵션 α / Senior 사실 검증 보강)

본 turn 시행 중 **poc-02 source empty** 사실 발견 (Senior 사실 검증 누락). 사용자 옵션 α 채택 = poc-02 = carry 정직 표기 + 현 상태 release. paradigm 정합 = "carry 정직 표기 + commit-block 회피 꼼수 ❌".

## 결정

### §1. Type 분류 3계층화 paradigm 진화 (REVISE-1 BLOCKER 흡수)

`flows/sdlc-4stage-flow.json` `release_eligibility.corroboration_type_levels` 신설:

| Type         | 정의                                                         | 자격                                                  | 권위 동형                          |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------- | ---------------------------------- |
| **Type 1**   | Claude self-run / same session / 외부 사용자 ❌              | corroboration 자격 부분 (boolean ❌)                  | Anthropic Bloom auto-eval          |
| **Type 1.5** | 본 user 가 별도 PoC 적용 / same plugin SSOT / 외부 사용자 ❌ | corroboration 자격 ✅ (boolean)                       | Rust/GCC Stage 3 identity check    |
| **Type 2**   | 외부 사용자 / 외부 repo / 별도 Claude Code session           | corroboration 자격 ✅ (boolean) / deadline 없는 carry | NIST/AISI 외부 pre-deployment eval |

### §2. fail_mode_qualification boolean 강제 (REVISE-3 MED 흡수)

`flows/sdlc-4stage-flow.json` `release_eligibility.fail_mode_qualification`:

- **qualified_modes**: `[compile_import_fail, assertion_fail, pending]`
- **excluded_modes**: `[dry_run_placeholder]`
- 1개라도 `dry_run_placeholder` 있으면 `corroboration_qualified=false` (boolean 강제 / 임계 ratio ❌)
- 30% 임계 ratchet = v+1 (≥ 2 PoC 실측 후 결정 / §8.1 단일 PoC 함정 회피)

### §3. test-spec.schema.json fail_mode enum 4종 추가 (additive)

`test_cases.items.properties.fail_mode` enum:

- `compile_import_fail` — Beck-canonical (Kent Beck 2002 preface p.x verbatim 정합)
- `assertion_fail` — per-TC RED 표준
- `dry_run_placeholder` — corroboration 자격 ❌ (Adzic SBE 함정 회피)
- `pending` — Cucumber yellow (skipped) 정합 (Senior REVISE-1 추가 권고)

### §4. chain-coverage-validator validateFailModeDistribution 7번째 export (warn-only)

`tools/chain-coverage-validator/src/validator.js`:

- 7번째 export (utility loadJson 제외 시 6번째)
- `dry_run_placeholder` 존재 시 low severity finding emit (warn-only / blocking ❌)
- `corroboration_qualified` boolean 반환
- CLI flag `--test-spec <path>` wire
- test 4종 추가 (chain-coverage-validator 30/30 → **34/34 pass**)

### §5. corroboration #2 자격 본격 달성 (옵션 α 채택)

| PoC        | Type                    | stack                               | fail_mode          | corroboration_qualified             |
| ---------- | ----------------------- | ----------------------------------- | ------------------ | ----------------------------------- |
| **poc-05** | **Type 1.5**            | TypeScript+vitest                   | assertion_fail 2건 | ✅ true                             |
| **poc-14** | Type 1                  | Python+pytest                       | assertion_fail 4건 | ✅ true                             |
| ~~poc-02~~ | ~~Type 1.5 second arm~~ | (Spring Boot 3 / source empty 발견) | —                  | **carry 정직 표기 (deadline 없음)** |

corroboration count = 2 (Type 1.5 single arm + Type 1 partial / 양측 fail_mode_qualification=true).

### §6. Carry 정직 표기 (paradigm 정합 / commit-block 회피 꼼수 ❌)

| Carry                                                                                                                                           | 사유                                                  | Deadline |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| **Type 1.5 second arm** (poc-02 Spring Boot 3 본격 / 또는 poc-03 NestJS chain 4 yellow → green / 또는 poc-04-mini React chain 4 yellow → green) | poc-02 source empty 발견 (Senior 사실 검증 누락 보강) | **없음** |
| **Type 2** (외부 사용자 / 외부 repo / 별도 Claude Code session)                                                                                 | OSS 채택 트리거 의존                                  | **없음** |

두 carry 모두 commit-block 회피 꼼수 ❌ = release-readiness 자기 enforcement 본격 입증대 (paradigm maturity signal).

### §7. F-SIM-005 P1 commit-block deadline 2026-06-01 이행

- **9일 전 이행** (2026-05-23 / D-9)
- self_consistency_note 정직 표기 갱신 = Type 1.5 single arm 본격 + Type 1 partial 보존 + Type 1.5 second arm carry + Type 2 carry
- paradigm 진화 자산화 (Type 분류 3계층화 + fail_mode 4종 enum + boolean 강제)

## STOP-3 hard gate (시행 결과)

- ✅ **workspace test**: 690/690 → **694/694 pass / 0 fail** (신규 4 test additive)
- ✅ **schema-validator**: 4 PoC test-spec.json 모두 VALID (additive optional 회귀 ❌)
- ✅ **release-readiness**: 15/16 ready (1 = --skip-workspace-test 명시 skip / release 시 disable 의무)
- ✅ **JSON validity**: sdlc-4stage-flow.json corroboration_type_levels 3 + fail_mode_qualification.qualified_modes 3 + items 7
- ✅ **fail_mode regression**: poc-05 + poc-14 모두 corroboration_qualified=true 입증
- ✅ **breaking 0** (additive enum + new export only / 기존 의무 제거 0)

## LL 자산화 (8종)

- **LL-fsim-05** — F-SIM-011 패러독스 진정 해소 자격 = "Type 1.5 self-bootstrap proof" 부분 입증 (Rust/GCC Stage 3 identity check 동형 / single arm)
- **LL-fsim-06** — Beck-canonical RED 자격 = compile-import-fail (F-015 VERIFIED / Kent Beck 2002 preface p.x verbatim)
- **LL-fsim-07** — dry_run_placeholder 정직 표기 의무 = Adzic SBE 10년 폐기 함정 직접 회피
- **LL-fsim-08** — Type 분류 3계층화 paradigm 진화 (Type 1 / Type 1.5 / Type 2) = §8.1 자기 정합
- **LL-fsim-09** — Senior STRONG-STOP signal 흡수 paradigm = REVISE-1 본격 작동 + v8.6.0 SARIF import 흡수 동형
- **LL-fsim-10** — single-PoC threshold 함정 자기 검출 = dry-run 30% 임계 warn-only 격하 (§8.1 자기 정합 자체 검출)
- **LL-fsim-11** — Senior 사실 검증 보강 paradigm = AI 결단 ladder 안 사실 검증 = 사용자 결단의 입력 (옵션 α 채택 / poc-02 source empty 발견)
- **LL-fsim-12** — commit-block 회피 꼼수 ❌ paradigm = Type 1.5 second arm + Type 2 carry 정직 표기 (release-readiness 자기 enforcement 본격 입증대)

## 자산 변경 (additive / breaking 0)

| 영역                                                               | 변경                                                                                                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemas/test-spec.schema.json`                                    | `test_cases.items.properties.fail_mode` enum 4종 추가 (additive optional)                                                                       |
| `tools/chain-coverage-validator/src/validator.js`                  | `validateFailModeDistribution` 7번째 export 신설 (warn-only)                                                                                    |
| `tools/chain-coverage-validator/src/cli.js`                        | `--test-spec <path>` flag wire + JSON/human output                                                                                              |
| `tools/chain-coverage-validator/test/validator.test.js`            | 신규 4 test 추가 (34/34 pass)                                                                                                                   |
| `flows/sdlc-4stage-flow.json`                                      | `release_eligibility.corroboration_type_levels` 3계층화 + `fail_mode_qualification` boolean 강제 + items 갱신 + self_consistency_note 정직 표기 |
| `examples/poc-05-sample-user-register/.aimd/output/test-spec.json` | `fail_mode: assertion_fail` 표기 (2건 / additive)                                                                                               |
| `examples/poc-14-fsim-corroboration/.aimd/output/test-spec.json`   | `fail_mode: assertion_fail` 표기 (4건 / additive)                                                                                               |
| `plugin.json`                                                      | 8.13.3 → 8.14.0                                                                                                                                 |
| `package.json`                                                     | 8.13.3 → 8.14.0 (3-way sync)                                                                                                                    |
| `CHANGELOG.md`                                                     | v8.14.0 MINOR entry                                                                                                                             |
| `decisions/INDEX.md`                                               | 본 DEC 최상단 entry                                                                                                                             |
| `decisions/STATUS.md`                                              | session 39차 entry                                                                                                                              |
| `CLAUDE.md`                                                        | "plugin.json v8.14.0" sync + 본 release 본문                                                                                                    |

## Cross-link

- **Resolves**: F-SIM-005 P1 carry (commit-block 2026-06-01) / F-SIM-011 패러독스 (부분 해소 / Type 1.5 single arm)
- **Carry**: Type 1.5 second arm (poc-02 source empty 발견 / poc-03+poc-04-mini chain 4 yellow → green 후보) / Type 2 (외부 사용자 / OSS 채택 의존)
- **Plan**: `.claude/plans/plan-fsim-005-corroboration-2.md` (REVISE-1+2+3+LOW 흡수 갱신)
- **Research**: `.claude/plans/research-fsim-005-corroboration-2.md` (3-agent 통합 / Senior REVISE-3 @ 0.83)
- **F-015 권위**: Kent Beck 2002 preface p.x / DO-178C Parasoft / Adzic SBE 10 years
- **Industry case**: Rust/GCC Stage 3 + Spec Kit + ThoughtWorks Radar + SWE-bench Live + Waymo + Anthropic Bloom
- **Amends**: DEC-2026-05-17-chain-harness-e2e-simulation-audit §4.1.2 P1 / DEC-2026-05-18-fsim-corroboration-2-attained (v8.4.0 partial → v8.14.0 genuine paradigm)
