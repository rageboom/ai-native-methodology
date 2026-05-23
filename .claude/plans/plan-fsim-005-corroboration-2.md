# Plan — F-SIM-005 P1 corroboration #2 본격 해소

> 4원칙 §1 (깊은 숙지 → plan.md). 본 plan = `~/.claude/plans/plan-fsim-005-corroboration-2.md`.
> 작성일: 2026-05-23 (session 39차 / v8.13.3 종결 직후 새 결단 axis).
> ★ **갱신 2026-05-23 (REVISE-1/2/3 + LOW 흡수)** — 4원칙 §2 Senior critique 결과 흡수 / research.md 짝.
> trigger: 사용자 결단 "ㄱㄱ" (직전 conversation §10 권고 첫 의제 = F-SIM-005 P1 carry 본격 해소).
> deadline: **2026-06-01 commit-block** (D-9).
> 관련: DEC-2026-05-17-chain-harness-e2e-simulation-audit / F-SIM-005 / F-SIM-011 / DEC-2026-05-18-fsim-corroboration-2-attained (v8.4.0 partial) / project_v84_simulation_carry.md / research-fsim-005-corroboration-2.md (3-agent 토론 산출).

---

## 1. 진단 — 패러독스의 잔존 본질

### 1.1 v8.4.0 partial achievement

v8.4.0 (2026-05-18) `poc-14-external-user-simulation` (Python FastAPI + SQLAlchemy + Pydantic / ~319 LOC) 가 chain harness e2e RED→GREEN 도달. release_eligibility #1/#2/#6/#7 `current_corroboration_count_at_required_strength` 1→2 갱신. F-SIM-011 `self_consistency_note` = "패러독스 해소" 명시.

### 1.2 그러나 본질 잔존

| 측면 | v8.4.0 상태 | 잔존 본질 |
|---|---|---|
| corroboration count | 1 → 2 | ✅ 명목 자격 |
| Type | Type 1 self-run (Claude 직접 / 외부 사용자 simulation paradigm) | ❌ Type 2 real Claude Code session 미충족 |
| F-SIM-005 schema | `fail_mode` enum 미신설 | ❌ dry-run placeholder 가 corroboration 자격 mask 가능성 잔존 |
| RED granularity | compile-import-fail 자체는 Beck-canonical valid | ⚠ per-TC granularity 의무화 미정 |
| 사내 환경 | OSS / 외부 simulation only | ❌ 사내 Modern stack 재측정 carry 잔존 |

### 1.3 진정한 해소 조건 (4 axis 동시 충족 / ★ REVISE-1 흡수 후)

1. **chain 4 GREEN 진짜 도달** — PoC ≥ 1종이 impl-spec.json 존재 + traceability-matrix all-green + 5종 물증 7 필드 진짜 runner stdout/stderr/duration_ms ≠ 0 + dry_run_placeholder 0
2. **F-SIM-005 schema 진화** — `test-spec.schema.json` `fail_mode` enum 의무화 (`compile_import_fail` / `assertion_fail` / `dry_run_placeholder` / `pending` 4종 명시) — Beck-canonical RED 자격 보존 + dry-run 정직 표기 + Cucumber yellow ≠ red 정합
3. **§8.1 strict 자기 정합 (★ REVISE-1 본격 흡수)** — `release_eligibility` `self_consistency_note` **Type 분류 3계층화** 명시: Type 1 (Claude self-run / same session) / Type 1.5 (본 user 가 별도 PoC 적용 / same plugin SSOT / ★ 본 release 본격 달성) / Type 2 (외부 사용자 / 외부 repo / 별도 Claude Code session / ★ carry 정직 표기 / deadline 없음). corroboration count 정직 표기 (Type 1.5 ≥ 1 의무 / Type 2 = carry)
4. **F-SIM-001~004 v8.3.0 시행분 regression** — matrix severity max-propagation + BR/AP 1급 축 + antipattern coverage lane + cross-ref path resolve 모두 PoC 에서 자동 작동 확인

### 1.4 2026-06-01 commit-block의 의미

DEC-2026-05-17-chain-harness-e2e-simulation-audit §F-SIM-011 P1 deadline. 미충족 시 release-readiness check #11 (release_eligibility) red → release 차단. 본 방법론 자기 enforcement 의 실 작동 첫 입증대.

---

## 2. 옵션 분석 (3원칙 결단 후보)

### Cluster A — PoC stack 선택 (★ REVISE-2 흡수 후 채택안)

| 옵션 | 의미 | trade-off |
|---|---|---|
| A1 | `poc-12-rawsql-userdecided` 본격 chain 4 GREEN 도달 | ADR-CHAIN-008 §4 영구 carry 명시 자산 활용 / raw `query()` paradigm-cross 자격 부분 확보 / 그러나 raw SQL 사내 source 의존 |
| A2 | `poc-13-querydsl-userdecided` 본격 chain 4 GREEN 도달 | DSL builder paradigm-cross 자격 / synthetic fork 의존 (realworld OSS 부재) |
| ~~A3~~ | ~~신규 poc-15 신설~~ | ★ **REVISE-2 흡수 → ❌** (`examples/poc-02-realworld-springboot3` 이미 존재 / 명명 충돌 / 9일 시한 risk) |
| A4 | poc-05 (sample-user-register) 재검증 chain 4 GREEN 재실행 + v8.3.0 finding 5종 흡수 후 self-bootstrap proof | Type 1.5 self-bootstrap proof 정착 가장 빠름 / 그러나 corroboration #2 자격 단독 부족 (TypeScript stack only) |
| ~~A5~~ | ~~A4 + 신규 poc-15~~ | ★ **REVISE-2 흡수 → A5'** 로 갱신 |
| **★ A5' (REVISE-2 흡수 / 채택)** | **poc-05 재검증 (TypeScript+vitest / Type 1.5) + poc-02 본격 chain 4 GREEN 재실행 (Java+JUnit/Spring Boot 3 / Type 1.5)** | **stack 횡단 corroboration #2 본격 달성** + poc-14 (Python+pytest / Type 1) 보존 / 9일 시한 정합 ★★★ / 신설 회피 / 명명 충돌 회피 |

### Cluster B — F-SIM-005 fail_mode enum 설계 (★ REVISE-3 + LOW 흡수 후 채택안)

| 옵션 | 설계 |
|---|---|
| B1 | `test-spec.schema.json` `tests[].fail_mode` enum 추가: `compile_import_fail` (Beck-canonical RED) / `assertion_fail` (per-TC RED) / `dry_run_placeholder` (정직 표기 / corroboration 자격 ❌) / **`pending`** (Cucumber yellow / Senior 추가 권고) |
| B2 | + `release_eligibility` `corroboration_evidence_axes[].fail_mode_distribution` 추가 — corroboration 자격 시 `dry_run_placeholder` 제외 의무 (boolean) |
| ~~B3 (구안)~~ | ~~dry-run ratio ≤ 30% 임계 자동 검출~~ | ★ **REVISE-3 흡수 → ❌** (§8.1 단일 PoC 함정 자기 위배 — plan §6 자기 명시 함정 정면 위배) |
| **★ B3' (REVISE-3 흡수 / 채택)** | **B1 (4종 enum) + B2 (boolean 자격) + chain-coverage-validator `validateFailModeDistribution` 7번째 export 추가 (★ LOW 흡수 / 기존 6 export 정정) — `dry_run_placeholder` 제외 boolean 만 강제 / dry-run ratio 임계 = warn-only (v8.14.0) / 30% 임계 ratchet = v+1 (≥ 2 PoC 실측 후 결정)** |

### Cluster C — corroboration #2 자격 결단 (★ REVISE-1 본격 흡수 / paradigm 진화)

| 옵션 | 의미 |
|---|---|
| ~~C1~~ | ~~Type 2 real session ≥ 1 의무~~ | ★ **REVISE-1 흡수 → 9일 시한 안 불가능 / 자기 paradigm 위배** |
| ~~C2~~ | ~~corroboration #3 의무화~~ | ★ **9일 시한 정합 risk 더 큼** |
| ~~C3 (구안)~~ | ~~Type 1 vs Type 2 2분류~~ | ★ **REVISE-1 흡수 → C3' 3계층화로 갱신** |
| **★ C3' (REVISE-1 BLOCKER 흡수 / paradigm 진화 / 채택)** | **Type 분류 3계층화**: <br>• **Type 1** (Claude self-run / same session / 외부 사용자 ❌ / v8.4.0 poc-14 = 이 분류) <br>• **Type 1.5** (본 user 가 별도 PoC 적용 / same plugin SSOT / ★ 본 release 본격 달성 가능 / poc-05 + poc-02) <br>• **Type 2** (외부 사용자 / 외부 repo / 별도 Claude Code session / ★ carry 정직 표기 / deadline 없음 / OSS 채택 트리거 의존). <br>★ corroboration #2 자격 = **Type 1.5 ≥ 1 의무** + Type 1 보존 + Type 2 carry. <br>★ self_consistency_note: "v8.14.0 = Type 1.5 self-bootstrap proof 본격 달성 / Type 2 = 미해소 carry (외부 사용자 채택 대기)" 시간 축 정직 표기 |

### Cluster D — F-SIM-001~004 regression 자동 확인

| 옵션 | 의미 |
|---|---|
| D1 | 신규 PoC chain 1~4 시행 시 v8.3.0 4 lane (matrix severity / BR/AP 1급 / antipattern coverage / cross-ref path) 자동 작동 확인만 |
| **D2 (권고)** | **D1 + chain-coverage-validator regression test 4종 추가** — 신규 PoC 가 4 lane 모두 trigger 함을 결정적 입증 |

### Cluster E — release ceremony

| 옵션 | 의미 |
|---|---|
| E1 | F-SIM-005 fail_mode enum = additive → v8.14.0 MINOR (chain 4 GREEN PoC 도달 후) |
| E2 | corroboration #2 본격 달성 = self-bootstrap proof → DEC-2026-05-XX-fsim-005-corroboration-2-genuine + INDEX 최상단 |
| **E3 (권고)** | **E1 + E2 + paradigm-stable-point reset** — v8.13.3 carry 잔존 0 보존 + 본 release 시점에 self-bootstrap proof 달성 명시 |

---

## 3. 2원칙 research dispatch 계획 (4원칙 §2)

### Agent 1: `_base-official-docs-checker` (F-015 cross-validation)
- Beck-canonical TDD RED 자격 verbatim 확인 (compile-import-fail vs assertion-fail)
- Kent Beck "Test-Driven Development: By Example" (2002) 원전 RED 정의
- ISO/IEC/IEEE 29119-1 test definition 안 RED/GREEN 자격
- Anthropic Claude Code skill `disable-model-invocation` 정합 (F-SKILL-016 ABORT learning)

### Agent 2: `_base-industry-case-researcher`
- spec-driven PoC 사례 (Spec Kit / AutoUAT / DMN / AWS Q Developer)
- chain harness 안 PoC 본격 시행한 OSS / FAANG 사례
- self-bootstrap proof 사례 (compiler 가 자기 compiler 로 compile, OS 가 자기 OS 위에서 build)
- Adzic SBE 10년 폐기 함정 회피 사례 (cross-validator 보유 사례)

### Agent 3: `_base-senior-engineer`
- F-SIM-005 fail_mode enum critique (B1+B2+B3 옵션)
- 신규 PoC stack 후보 critique (A1~A5)
- STOP signal 후보 (특히 Type 1 vs Type 2 분리 paradigm 정합)
- §8.1 strict ≥ 2 PoC corroboration 자기 정합 (corroboration #2 자격 Type 2 의무 vs Type 1 허용)
- 14차 retract pattern 회피 (MAJOR breaking burst 방지)

---

## 4. STOP-3 hard gate (시행 시점)

| # | gate | 측정 |
|---|---|---|
| 1 | 신규 PoC chain 4 GREEN 진짜 도달 | impl-spec.json 존재 + traceability-matrix all-green + 5종 물증 7 필드 진짜 runner + duration_ms ≠ 0 |
| 2 | F-SIM-005 fail_mode enum 의무화 | test-spec.schema.json 갱신 + 11 PoC schema-validator 회귀 0 |
| 3 | §8.1 strict release_eligibility 갱신 | self_consistency_note Type 1/Type 2 분리 명시 + corroboration count 정직 표기 |
| 4 | F-SIM-001~004 regression | 신규 PoC 가 4 lane 모두 자동 trigger |
| 5 | workspace test 회귀 ❌ | 690/690 → ≥ 690 |
| 6 | release-readiness 16/16 ready | 보존 |
| 7 | skill-citation-validator 0 stale | 보존 |
| 8 | drift-validator 3-way | 보존 |
| 9 | breaking 0 | additive enum + new PoC only |

---

## 5. 시행 단계 (commit cadence / ★ REVISE 흡수 후)

```
C1 (완료)     : plan-fsim-005-corroboration-2.md
C2 (완료)     : research-fsim-005-corroboration-2.md (3-agent dispatch)
C3 (완료)     : plan REVISE-1/2/3 + LOW 흡수 갱신
C4 (대기)     : ★ 사용자 묶음 결단 (REVISE 채택 묶음 / A5' + B3' + C3' + D2 + E3)

[결단 후 본격 시행]
C5            : schema 진화 (test-spec.schema fail_mode enum 4종 + chain-coverage-validator validateFailModeDistribution 7번째 export warn-only)
C6            : release_eligibility schema 진화 (Type 1/1.5/2 3계층화 + fail_mode_distribution boolean)
C7            : poc-05 chain 4 GREEN 재검증 실행 + v8.3.0 4 lane regression 자동 확인
C8            : poc-02 chain 4 GREEN 본격 도달 (재검증)
C9            : release_eligibility 갱신 + self_consistency_note Type 1.5 본격 달성 / Type 2 carry 정직 표기
C10           : v8.14.0 MINOR release ceremony + DEC-2026-05-XX-fsim-005-corroboration-2-genuine
```

★ REVISE-2 흡수 = 신규 PoC 신설 회피 → C7+C8 = 기존 PoC 2종 chain 4 GREEN 재실행 / 도달. 9일 시한 정합 ★★★.
★ REVISE-1 흡수 = Type 2 carry 정직 표기 → commit-block 회피 꼼수 ❌ + paradigm maturity 본격 입증.

---

## 6. 잠재 함정 (Lessons Learned 반영)

| 함정 | 회피 방법 | LL 근거 |
|---|---|---|
| Adzic SBE 10년 폐기 함정 (의미 보존 미강제) | Layer 2 LLM cross-validator 의무 / fail_mode enum + dry_run_placeholder 정직 표기 | ADR-CHAIN-011 |
| 14차 retract pattern (MAJOR 결단 burst) | additive only / breaking 0 / cooling-off 24h | feedback_decision_cadence_24h_cooling_off |
| §8.1 자기 정합 (단일 PoC 과적합) | ≥ 2 PoC corroboration + Type 2 ≥ 1 의무 | feedback_quality_priority |
| Type 1 simulation 회피 | 외부 사용자 Type 2 본격 / 또는 사내 PoC | project_v84_simulation_carry |
| pre-pre-prerequisite 사각 | release-readiness analysis_validator 6 PoC 자동 통과 사전 확인 | feedback_pre_pre_prerequisite_lacuna |
| dry-run placeholder corroboration mask | fail_mode enum 의무화 + ratio ≤ 30% | F-SIM-005 본질 |
| paradigm 안정점 reset 표면 (carry 잔존 0 자랑) | self_consistency_note "paradigm-level carry는 별도 conservation law" 명시 | 본 conversation §7 통찰 |

---

## 7. Lessons Learned carry (사후 자산화 후보 / ★ REVISE 흡수 후 8종)

- **LL-fsim-05** — F-SIM-011 패러독스 진정 해소 자격 = "Type 1.5 self-bootstrap proof" 본격 입증 (Rust/GCC Stage 3 identity check 동형)
- **LL-fsim-06** — Beck-canonical RED 자격 = compile-import-fail (F-015 VERIFIED / Kent Beck 2002 preface p.x verbatim)
- **LL-fsim-07** — dry_run_placeholder 정직 표기 의무 = Adzic SBE 10년 폐기 함정 직접 회피
- **LL-fsim-08** — Type 분류 3계층화 (Type 1 / Type 1.5 / Type 2) = §8.1 자기 정합 + Type 2 carry 정직
- **LL-fsim-09** — Senior STRONG-STOP signal 흡수 paradigm = REVISE-1 본격 작동 (v8.6.0 SARIF import 흡수 동형)
- **LL-fsim-10** — single-PoC threshold 함정 자기 검출 = dry-run 30% 임계 warn-only 격하 (§8.1 자기 정합 자체 검출 / plan §6 자기 명시 함정 본격 회피)
- **LL-fsim-11** — pre-existing PoC 활용 vs 신설 trade-off = poc-02 재검증 (REVISE-2) = 시한 정합 + corroboration arm 확보 양립 / Senior 사실 검증 (실 ls) 의 가치
- **LL-fsim-12** — commit-block 회피 꼼수 ❌ paradigm = Type 2 carry 정직 표기 (release-readiness 자기 enforcement 본격 입증대)

---

## 8. 본 plan의 본 conversation 정합

본 plan = 본 conversation §10 권고 "가장 ROI 높은 결단은 F-SIM-005 P1 carry의 본격 해소" 의 4원칙 §1 시행. paradigm 점검 결과 (§7 "carry 의 진짜 의미 = risk acceptance 축" + §9 "Pattern α self-reference paradox") 의 직접 해소 시도.

해소 성공 시: 본 plugin 의 self-bootstrap 메타 구조가 "자기 검증대를 자기 자신이 통과" 첫 입증. 본 방법론 가치 명세의 가장 강한 결락이었던 Pattern α 해소.

해소 실패 시: release-readiness commit-block 이 v8.14.0 release 차단 → self-enforcement 작동 첫 입증 (반대 방향의 가치 입증).

어느 방향이든 본 방법론 paradigm maturity 의 본격 threshold.
