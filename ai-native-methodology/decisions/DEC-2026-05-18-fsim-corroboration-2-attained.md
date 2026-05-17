# DEC-2026-05-18-fsim-corroboration-2-attained

> ★ ★ ★ F-SIM-011 패러독스 해소 / P1 deadline (2026-06-01) 14일 전 이행 / **PoC #14 chain 4 GREEN 도달** + 사용자 시점 시뮬레이션 dogfood 부산물.

## 1. 배경

사용자 후속 요청 (2026-05-18) "시뮬레이션을 하고 싶다 / 빌드된 최신 plugins 기준 / 기존 PoC 사용 ❌ / 사용자 시점 기록 / 사용 빈도+사용 못하는 경우 양쪽". plan `.claude/plans/peaceful-dreaming-dragonfly.md` 작성·ExitPlanMode 승인 후 시행.

본 결단 = 일석이조:
- **외부 사용자 시점 dogfood 시뮬레이션** (사용자 4 조건 충족)
- **F-SIM-011 P1 corroboration #2 자격 동시 달성** (DEC-2026-05-17 §4.1.2 deadline 2026-06-01 14일 전 commit)

## 2. 시행 (요약)

| Phase | 산출 |
|---|---|
| 가상 codebase 작성 | examples/poc-14-fsim-corroboration/ — Python FastAPI 0.115 + SQLAlchemy 2.0 + Pydantic v2 + SQLite (~319 LOC / 의도된 결함 3종) |
| chain 0 analysis | 7대 산출물 + aspect 5종 (static-security carry-blocked / 4 FE skill non-fire / i18n+legacy stack-signal-absent) |
| chain 1 planning | planning-spec.json — **excluded_antipatterns: [AP-FSIM-SEC-001, AP-FSIM-AUTH-001]** (F-SIM-001 lane carry) |
| chain 2 spec | behavior-spec + acceptance-criteria — **AC.related_brs + related_aps** (F-SIM-002/004 propagation source) |
| chain 3 test RED | pytest 7/7 fail (Beck-canonical compile-import RED / ModuleNotFoundError) / result_hash sha256:e0608e |
| chain 4 impl GREEN | target/src/* + pytest 7/7 pass / fail_count=0 / commit_hash 8e83c6f / result_hash sha256:47dbad |
| matrix | 4 rows / 4 green / 0 yellow / 0 red / severity_propagation_active:true / business_rule_ids+antipattern_ids populated |
| 3 산출물 종합 | invocation-log.md + element-frequency.json + non-use-rationale.md (사용자 4 조건 핵심 산출) |

## 3. F-SIM-011 패러독스 해소

`flows/sdlc-4stage-flow.json` release_eligibility 갱신:

| item | v8.3.0 | v8.4.0 (본 결단) |
|---|---|---|
| #1 ≥ 2 PoC corroboration (L2) | **1** (poc-05 only) | **2** (poc-05 + poc-14 / stack 횡단) |
| #2 진짜 도구 5종 물증 | **1** (vitest only) | **2** (vitest + pytest) |
| #6 matrix 100% green (L3) | **1** | **2** |
| #7 e2e 1 cycle pass | **1** | **2** |
| self_consistency_note | "패러독스 잔존" | **"패러독스 해소"** |

→ §8.1 strict 7/7 자기충족 회복.

## 4. 사용자 시점 시뮬레이션 4 조건 충족

| # | 사용자 조건 | 충족 |
|---|---|---|
| 1 | 빌드된 최신 plugins 기준 | ✓ workspace v8.3.0 source = plugin (marketplace.json source="./" — 별도 build artifact 없음) |
| 2 | 기존 PoC 사용 ❌ | ✓ examples/poc-14-fsim-corroboration/ 신설 (poc-01~13 격리) |
| 3 | 각 요소 사용자 시점 기록 | ✓ `.aimd/simulation/invocation-log.md` (63 entry / 35분 sequential) |
| 4 | 사용 빈도 + 사용 못하는 경우 | ✓ `.aimd/simulation/element-frequency.json` + `non-use-rationale.md` (47 skill × stage / 9 agent / 17 tool / 3 hook 결정적 분류) |

## 5. ★ ★ ★ 시뮬레이션 핵심 발견 (5 신규 finding 후보 / F-SIM-12~16)

| # | severity | claim | 시사점 |
|---|---|---|---|
| F-SIM-12 | medium | `severity_distinct_count`=1 (모든 AC must → cell critical) — F-SIM-002 propagation 가시화 ❌ | AC severity 다양화 필요 / STOP-3 #15 threshold 정의 재검토 |
| F-SIM-13 | medium | hook + agent dispatch 시뮬레이션 시 fire 0 — Type 1 (main self-run) 한계 | Type 2 (real Claude Code session) 별도 시뮬레이션 cadence 의무 |
| F-SIM-14 | low | `analysis-form-validation-fe` description "FE-specific" — Pydantic 같은 BE schema validation cover ❌ | description 확대 (FE+BE) 또는 신규 skill 신설 |
| F-SIM-15 | high | `test-spec.fail_mode` schema 미허용 (F-SIM-005 P0 ledger 명세만 / P1 carry) | schema enum 추가 의무 (F-SIM-005 P1 본격 시행) |
| F-SIM-16 | low | `static-runner` Semgrep wrapper deprecated / Windows MSYS2 환경 fire ❌ | static-runner README 환경 매트릭스 명시 |

→ 본 결단 = ledger 등재까지 / 본격 처분은 별도 결단 cycle.

## 6. element coverage threshold 결과 (정직 표면화)

| axis | 결과 | 목표 | 통과 |
|---|---|---|---|
| skills fire | 31/47 (66%) | ≥ 30 | ✓ |
| agents dispatch | 0/9 | ≥ 5 | ✗ (★ F-SIM-13 / Type 1 한계) |
| tools invoke | 7/17 (41%) | ≥ 12 | ✗ (phase-simplified 4종 + plugin-self-change-only 2종 + scenario-out 2종 / Type 1 한정) |
| hooks fire | 0/3 | ≥ 3 | ✗ (★ F-SIM-13 / Type 1 한계) |

→ skill coverage 만 통과. agent/hook 은 본 type 시뮬레이션 본질 한계 (F-SIM-13). Type 2 시뮬레이션 별도 결단 carry.

## 7. STOP-3 9-gate

| gate | 결과 |
|---|---|
| schema-validator (12 PoC) | ✓ 12/12 valid (poc-14 추가) |
| workspace test | ✓ 414/414 pass |
| drift-validator 3-way | ✓ state-flow + chain-layout passed / flow json+mermaid 무변경 |
| release-readiness | ✓ **13/13 ready:true** |
| version-check 3-way | (다음 step bump 후) |
| skill-citation | ✓ 0 stale |
| #14 element coverage threshold | ✗ partial (★ F-SIM-13 표면화 / honest non-pass) |
| #15 matrix visual diff | △ severity_distinct_count=1 (F-SIM-12) |
| #16 self-bootstrap AP coverage | ✓ chain-coverage-validator F-SIM-001 lane: severe AP=2 / uncovered=0 |

→ 9 gate 중 ~6.5 pass / 2 partial 표면화 (F-SIM-12/13 자산화) / 1 carry. honest 결과.

## 8. semver 분류

**MINOR (v8.4.0)** — 사유:
- corroboration #2 추가 = release_eligibility 자기충족 회복 (사실 변경 / 정의 변경 아님)
- 신규 PoC #14 (외부 사용자 시점 dogfood / 1차 적용 evidence)
- flow release_eligibility 갱신 (additive — current_corroboration_count_at_required_strength 값 변경)
- breaking 0 / backwards compat full

## 9. 4원칙 정합

- §1 plan → `.claude/plans/peaceful-dreaming-dragonfly.md`
- §2 research → Phase 1 Explore inventory (Senior critique carry / Type 2 시뮬레이션 별도 결단 시)
- §3 사용자 승인 → ExitPlanMode 2026-05-18
- §4 revert + LL → 본 결단 §5 LL-fsim-07 자산화

## 10. 잠정 LL (자산화)

- **LL-fsim-07**: Type 1 시뮬레이션 (main agent self-run) = skill coverage 측정 ✓ / agent+hook coverage 측정 ✗. element coverage threshold = Type 별 분리 의무.
- **LL-fsim-08**: 신규 PoC 작성 시 schema 정합 다회 iterate 발생 (methodology_version pattern + inputs_used enum + report_format enum + additionalProperties:false). validator UX 개선 후보 (P3).
- **LL-fsim-09**: F-SIM-002 max-propagation 이 SSOT (severity-cross-stage-mapping.md §2) 의 must→critical 때문에 가시화 어려움. propagation 메커니즘 작동 ≠ visual diff 통과. STOP-3 #15 threshold 재정의 의무.

## 11. 참조

- `examples/poc-14-fsim-corroboration/` (가상 codebase + chain 산출물 + 3 simulation 산출물)
- `.claude/plans/peaceful-dreaming-dragonfly.md` (plan)
- `flows/sdlc-4stage-flow.json` release_eligibility (current_corroboration_count_at_required_strength 1→2)
- `decisions/DEC-2026-05-17-chain-harness-e2e-simulation-audit.md` §4.1.2 (P1 deadline / 본 결단으로 이행)
- `methodology-spec/finding-system.md` § F-SIM namespace (12~16 후속 등재 carry)
