# DEC-2026-05-23-fsim-016-environment-dependent-scope-out

> F-SIM-016 closed v8.14.3 = R19 Tier 2 안 environment-dependent risk **sub-axis** 본격 명시 (Tier 3 격상 ❌ / simulated 와 본질 구분 paradigm) + memory `feedback_environment_dependent_tools_scope_out` 본격 신설.

- **결단 일자**: 2026-05-23 ( session 39차 / v8.14.3 PATCH / v8.14.2 carry F-SIM-016 본격 종결)
- **결단자**: 윤주스 (TF Lead) — 사용자 결단 "나머지 진행 하자" → #1 F-SIM-016 영구 scope-out 채택 (가장 가벼움 / cooling-off 위배 risk 작음)
- **범주**: methodology / F-SIM-016 closed + R19 Tier 2 environment-dependent sub-axis paradigm 진화 + memory 신설
- **상태**: 승인 / additive doc only / breaking 0

## 컨텍스트

### F-SIM-016 본질 재검토

v8.4.0 시뮬레이션 dogfood 표면화: "static-runner Semgrep wrapper deprecated / Windows MSYS2 환경 fire ❌". v8.14.1 정식 ledger 등재 (open carry / "R19 Tier 2 환경 의존 / 영구 scope-out 후보").

v8.14.2 poc-03 sprint Senior STRONG-STOP-2 본격 입증 (argon2 + Node 22 + Windows native build fail) = 본격 동형 paradigm = "environment-dependent risk 본격 실재 입증".

### paradigm 정합 결정

**R19 paradigm 정합 검토**:

- Tier 1 = in-plugin native (JVM 의존 0)
- Tier 2 = 사용자 환경 SARIF import / JVM 의존 도구
- Tier 3 = **simulated 영구 reject**

**핵심 통찰**: Semgrep Windows MSYS2 환경 fire ❌ = **simulated 아님 / 사용자 환경 부재 case**. Tier 3 격상 ❌ paradigm 정합. 본 case = Tier 2 안 sub-axis 분류 의무.

### Senior 사실 검증 보강 paradigm 재발 (LL-fsim-11 본격 입증)

v8.14.1 carry note = "R19 Tier 3 영구 reject 격상 후보" 명시 = **사실 잘못** (Tier 3 = simulated only). 본 자체가 Senior 사실 검증 보강 paradigm 정합 = main agent 가 시행 직전 paradigm 사실 본격 재확인 → Tier 3 격상 ❌ + Tier 2 sub-axis 본격 결정.

## 결정

### §1. R19 Tier 2 안 environment-dependent risk **sub-axis** 본격 명시 (additive paradigm 진화)

`methodology-spec/plugin-charter.md` §2 R19 row 안 sub-axis patch:

> **v8.14.3 sub-axis patch**: Tier 2 안 **environment-dependent risk sub-axis** 본격 명시 — 사용자 환경 부재 (Semgrep Windows MSYS2 / argon2+Node 22+Windows native build / sqlite3 native rebuild 등) = Tier 3 격상 ❌ (simulated 아님) + carry 정직 표기 의무 (deadline 없음). pre-flight smoke STOP-3 hard gate paradigm (LL-fsim-15) + Senior 사실 검증 보강 paradigm (LL-fsim-11) 정합. memory `feedback_environment_dependent_tools_scope_out.md` 참조.

### §2. F-SIM-016 status = closed v8.14.3

`methodology-spec/finding-system.md` F-SIM ledger:

- 표 row F-SIM-016 = open (v8.4.0 carry) → **closed v8.14.3**
- body section F-SIM-016 Resolved fix (v8.14.3) 추가 + Status 본격 갱신

### §3. memory `feedback_environment_dependent_tools_scope_out.md` 본격 신설

- Tier 3 격상 ❌ paradigm 본격 명시 (simulated 와 본질 구분)
- carry 정직 표기 의무 (deadline 없음 / 환경 가용 시 본격 진입)
- pre-flight smoke STOP-3 gate paradigm (LL-fsim-15) + Senior 사실 검증 보강 (LL-fsim-11) 정합
- Cross-link: feedback-commit-block-no-cheat + feedback-senior-fact-check-supplement + project-v8140-release-status

### §4. paradigm enforcement 본격 자기 정정 입증

본 결단 자체가 **paradigm self-correction 본격 입증대**:

- v8.14.1 carry note "Tier 3 격상 후보" 사실 잘못 발견 (Tier 3 = simulated only / Senior 사실 검증 보강 paradigm 재발 / LL-fsim-11 본격)
- Tier 2 sub-axis 본격 결정 = paradigm 자기 정정 + 본격 진화
- 14차 retract pattern 회피 본격 정합 (잘못된 결정 시행 ❌ / 정합 path 본격 선택)

## STOP-3 hard gate (시행 결과)

- ✅ paradigm 정합 = R19 paradigm 정합 (Tier 3 = simulated only) + Tier 2 sub-axis 본격 명시
- ✅ memory 본격 신설 (feedback type / LL-fsim-11/12/15 cross-link)
- ✅ F-SIM-016 status closed v8.14.3
- ✅ breaking 0 (PATCH)
- ✅ version 3-way sync (plugin.json + package.json + CHANGELOG 8.14.2 → 8.14.3)

## 자산 변경 (additive doc / breaking 0)

| 영역                                                       | 변경                                                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `methodology-spec/plugin-charter.md`                       | §2 R19 row sub-axis patch (environment-dependent risk 본격 명시)                       |
| `methodology-spec/finding-system.md`                       | F-SIM-016 ledger 표 row status open → closed v8.14.3 + body Resolved fix + Status 갱신 |
| `memory/feedback_environment_dependent_tools_scope_out.md` | 본격 신설 (feedback type)                                                              |
| `memory/MEMORY.md`                                         | index 본격 entry 추가                                                                  |
| `plugin.json + package.json`                               | 8.14.2 → 8.14.3 (3-way sync)                                                           |
| `CHANGELOG.md`                                             | v8.14.3 PATCH entry                                                                    |
| `decisions/INDEX.md`                                       | 본 DEC 최상단 entry                                                                    |
| `decisions/STATUS.md`                                      | session 39차 v8.14.3 sub-entry                                                         |
| `CLAUDE.md`                                                | "plugin.json v8.14.3" sync + 본 release 본문                                           |

## LL 자산화 (2종 / LL-fsim-18 + LL-r19-04)

- **LL-fsim-18** — Senior 사실 검증 보강 paradigm 안 main agent 자기 검증 본격 작동 (Tier 3 격상 후보 사실 잘못 발견 + paradigm 정합 path 본격 결정) = LL-fsim-11 본격 확장 ( main agent self-fact-check)
- **LL-r19-04** — R19 Tier 2 안 environment-dependent risk sub-axis paradigm 진화 (sub-axis 본격 분류 의무 / 14차 retract pattern 회피)

## Cross-link

- **Resolves**: F-SIM-016 (v8.4.0 carry / v8.14.1 정식 ledger / v8.14.2 carry note 본격 정정)
- **Amends**: charter R19 (v8.6.0 신설 / v8.14.3 sub-axis patch)
- **Cross-link**: memory `feedback_environment_dependent_tools_scope_out` (본격 신설) / DEC-2026-05-18-runtime-tool-exclusion (R19 v8.6.0 origin) / DEC-2026-05-23-poc-03-carry-acknowledged §2 (paradigm enforcement 본격 입증대 / argon2 + Node 22 + Windows native build fail 동형 입증)
