# DEC-2026-05-23-fsim-12-16-ledger-registration

> F-SIM-12~16 정식 ledger 등재 + closed 처분 (F-SIM-13 + F-SIM-15 = v8.14.0 본격 흡수 / F-SIM-12 + 14 + 16 = open carry).

- **결단 일자**: 2026-05-23 (★ session 39차 / v8.14.1 PATCH release / v8.14.0 직후 후속 sync)
- **결단자**: 윤주스 (TF Lead) — 사용자 "α로 진행" (v8.14.0 후 cooling-off cadence 안 additive only 작업 선택)
- **범주**: methodology / F-SIM-12~16 정식 ledger 등재 + closed 처분 + carry 정직 표기
- **상태**: 승인 / additive doc only / breaking 0

## 컨텍스트

### v8.4.0 carry 잔존

`project_v84_simulation_carry.md` 안 의제 B = "F-SIM-12~16 정식 ledger 등재 + 처분 결단 (P0/P1/P2 분류)". v8.4.0 (2026-05-18) 시뮬레이션 dogfood 안 5 신규 finding 표면화하되 정식 등재 carry. v8.4.0 ~ v8.14.0 안 자산화 대기.

v8.14.0 (2026-05-23) F-SIM-005 P1 본격 해소 시점에:
- **F-SIM-015** (high / test-spec.fail_mode schema 미허용) = **본격 흡수 종결** (schema enum 4종 추가 + chain-coverage-validator 7번째 export)
- **F-SIM-013** (medium / Type 1 시뮬레이션 한계) = **본격 흡수 종결** (Type 분류 3계층화 paradigm 진화 / Type 1 정식 분류 + Type 2 carry)
- **F-SIM-012 + 014 + 016** = 잔존 carry (v8.14.0 paradigm 진화 와 직접 무관)

### v8.14.1 정식 등재 trigger

v8.14.0 직후 cooling-off cadence 안 additive only 작업 진입. paradigm preservation 의무 = v8.4.0 carry 의제 B 본격 종결 + v8.14.0 paradigm 진화 후속 sync.

## 결정

### §1. F-SIM ledger 표 갱신 (11 row → 16 row)

`methodology-spec/finding-system.md` F-SIM namespace 표 안 5 row 추가:

| F-SIM | severity | 처분 |
|---|---|---|
| 012 | medium | open (v8.4.0 carry) |
| 013 | medium | **closed v8.14.0** (Type 분류 3계층화 본격 흡수) |
| 014 | low | open (v8.4.0 carry) |
| 015 | **high** | **closed v8.14.0** (fail_mode schema 본격 추가) |
| 016 | low | open (v8.4.0 carry) |

### §2. F-SIM-12 ~ F-SIM-16 body section 5종 신설 (additive doc)

각 section = phase / confidence / type / description / evidence / spec_gap / decision_made / severity / proposed_fix / status.

### §3. closed 2종 본격 자산화

- **F-SIM-013 closed v8.14.0**: Type 분류 3계층화 paradigm 본격 흡수 (Type 1 self-run / Type 1.5 user dogfood / Type 2 external user). DEC-2026-05-23-fsim-005-corroboration-2-genuine §1 cross-link.
- **F-SIM-015 closed v8.14.0**: test-spec.schema.json fail_mode enum 4종 + chain-coverage-validator validateFailModeDistribution 7번째 export 본격 흡수. DEC-2026-05-23-fsim-005-corroboration-2-genuine §3 cross-link.

### §4. open carry 3종 정직 표기

- **F-SIM-012** (severity_distinct_count=1 mask): F-SIM-002 본격 흡수 후 부분 잔존 / paradigm-level 한계 표면 / single-PoC carry / proposed fix = severity_distinct_count gauge metric 신설 (warn ≤ 1 / target ≥ 2).
- **F-SIM-014** (analysis-form-validation-fe description scope mismatch): Pydantic BE schema validation cover ❌ / F-SKILL-014 동반 후보 / skill description 본격 cover 정책 부재.
- **F-SIM-016** (Semgrep wrapper Windows MSYS2 환경 fire ❌): R19 Tier 2 paradigm 정합 / 환경 의존 도구 영구 scope-out 후보 (memory `environment-dependent-tools-scope-out` 정합).

3 carry 모두 cooling-off 후 별 session 결단 (deadline 없음).

## STOP-3 hard gate (시행 결과)

- ✅ skill-citation-validator 227 active doc / **0 stale dead-link**
- ✅ 변경 = finding-system.md F-SIM ledger 표 + body 5종 (additive doc only)
- ✅ breaking 0 (PATCH)
- ✅ version 3-way sync (plugin.json + package.json + CHANGELOG 8.14.0 → 8.14.1)

## 자산 변경 (additive doc / breaking 0)

| 영역 | 변경 |
|---|---|
| `methodology-spec/finding-system.md` | F-SIM ledger 표 11 row → 16 row + body 5종 신설 (F-SIM-012/013/014/015/016) |
| `plugin.json` | 8.14.0 → 8.14.1 |
| `package.json` | 8.14.0 → 8.14.1 (3-way sync) |
| `CHANGELOG.md` | v8.14.1 PATCH entry |
| `decisions/INDEX.md` | 본 DEC 최상단 entry |
| `decisions/STATUS.md` | session 39차 v8.14.1 sub-entry |
| `CLAUDE.md` | "plugin.json v8.14.1" sync |

## LL 자산화 (1종)

- **LL-fsim-13** — v8.4.0 carry 의제 B (5 finding 정식 ledger 등재) 본격 종결 paradigm = **release 직후 cooling-off cadence 안 additive only doc-sync** 정합 (v8.13.1 dep-graph SSOT doc only PATCH precedent 동형). paradigm preservation = release 후 carry 정식 자산화 의무.

## Cross-link

- **Resolves**: `project_v84_simulation_carry.md` §의제 B (F-SIM-12~16 정식 ledger 등재) — v8.4.0 carry 본격 종결
- **Amends**: DEC-2026-05-23-fsim-005-corroboration-2-genuine (F-SIM-013 + F-SIM-015 closed 본격 등재 추가)
- **Cross-link**: `methodology-spec/finding-system.md` F-SIM namespace / `feedback_commit_block_no_cheat.md` (carry 정직 표기 paradigm) / [[project-v8140-release-status]]
- **Open carry**: F-SIM-012 / F-SIM-014 / F-SIM-016 = cooling-off 후 별 결단 (deadline 없음)
