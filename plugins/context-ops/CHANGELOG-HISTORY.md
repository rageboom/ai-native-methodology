# Changelog — pre-v9.0 history archive

> 본 파일 = v9.0.0 이전 release entry archive (legacy paradigm 시기).
> v9.0+ 최근 release entry = [CHANGELOG.md](./CHANGELOG.md).
>
> Split history (cleanup precedent):
>
> - 2026-05-06 (cleanup round 2-A) — v1.3.x and earlier 격리
> - 2026-05-14 — v2.3.x and earlier 추가 격리
> - 2026-05-23 (v8.13.2) — v7.0.0 and earlier 격리
> - 2026-05-25 (v9.0.0 paradigm boundary) — v8.x and earlier 격리

Semantic Versioning 준수.

---

## v8.x archive (2026-05-25 cleanup — v9.0.0 6-stage chain harness 이전)

## [8.14.4] — 2026-05-23 PATCH — F-SIM-012 + F-SIM-014 closed (잔존 시뮬레이션 carry 0 도달)

> v8.14.3 carry 의 마지막 잔존 F-SIM 2건 종결. 사용자 묶음 결단 (F-SIM-012 close / F-SIM-014 scope-out / 둘 다 권장 채택). additive doc + schema 설명 정정 / breaking 0.
>
> - **F-SIM-012** (severity_distinct_count=1 mask): `severity_distinct_count` gauge 는 F-SIM-002 로 schema+builder 에 **이미 존재** (audit signal). schema 설명이 약속한 "release-readiness #14 sentinel" 은 미구현 → **하드 release-gate sentinel scope-out** (distinct==1 은 작은 all-must PoC[poc-14] 정상값 → gate 화 시 §8.1 단일 PoC false-positive). gauge(감사 신호)로 충분 → **closed**. schema 설명에서 미구현 sentinel 문구 정정.
> - **F-SIM-014** (analysis-form-validation-fe BE cover): skill 은 의도적 FE 전용 (name `-fe` / track=FE / Zod·Yup·RHF 대상). BE schema validation (Pydantic / dataclass / Joi-BE) = 별도 future skill 후보로 문서화 → **scope-out closed** (skill 정체성 보존 + breaking 0 / F-SIM-016 환경-의존 scope-out 선례 동형 / poc-14 BE 표면은 analysis-source-inventory 우회 cover).
> - **결과**: 시뮬레이션 dogfood(F-SIM) ledger 잔존 carry = **0** (F-SIM-001~016 전부 처분).
> - 변경: finding-system.md F-SIM-012/014 status closed + summary / traceability-matrix.schema.json severity_distinct_count 설명 정정 / 3-way version 8.14.3 → 8.14.4 / DEC-2026-05-23-fsim-012-014-close + INDEX + STATUS + CLAUDE.md sync.
> - **STOP-3**: workspace 694/694 pass (보존) / version 3-way 8.14.4 / skill-citation 0 stale / breaking 0 = PATCH.

## [8.14.3] — 2026-05-23 PATCH — F-SIM-016 closed (R19 Tier 2 environment-dependent risk sub-axis paradigm 진화 / Tier 3 격상 ❌)

> v8.14.2 carry F-SIM-016 본격 종결. 사용자 결단 "나머지 진행 하자" → #1 F-SIM-016 영구 scope-out 채택. paradigm 정합 = Tier 2 sub-axis 본격 명시 (Tier 3 격상 ❌ / simulated 와 본질 구분). additive doc only / breaking 0.

### 본질 (paradigm self-correction 본격 입증대)

v8.14.1 정식 ledger 등재 시 carry note = "R19 Tier 3 영구 reject 격상 후보" 명시 = **사실 잘못** (Tier 3 = simulated only). Senior 사실 검증 보강 paradigm 재발 (LL-fsim-11 본격 입증 확장 = main agent self-fact-check).

**paradigm self-correction 본격 입증대**:

- Tier 3 = simulated only 본격 재확인
- environment-dependent risk = 사용자 환경 부재 case (simulated 아님)
- paradigm 정합 path = Tier 2 안 **sub-axis** 본격 명시 + carry 정직 표기

### R19 Tier 2 environment-dependent risk sub-axis (paradigm 진화)

charter R19 row sub-axis patch:

- 사용자 환경 부재 (Semgrep Windows MSYS2 / argon2+Node 22+Windows native build / sqlite3 native rebuild 등) = Tier 3 격상 ❌
- carry 정직 표기 의무 (deadline 없음 / 환경 가용 시 본격 진입)
- pre-flight smoke STOP-3 hard gate paradigm (LL-fsim-15) + Senior 사실 검증 보강 paradigm (LL-fsim-11) 정합

### 자산 변경 (additive doc / breaking 0)

- **`methodology-spec/plugin-charter.md`** — §2 R19 row sub-axis patch (environment-dependent risk 본격 명시)
- **`methodology-spec/finding-system.md`** — F-SIM-016 ledger 표 row status open → closed v8.14.3 + body Resolved fix + Status 갱신
- **memory `feedback_environment_dependent_tools_scope_out.md`** — 본격 신설 (feedback type / Tier 3 격상 ❌ paradigm 본격 명시 / Cross-link feedback-commit-block-no-cheat + feedback-senior-fact-check-supplement)
- **memory MEMORY.md** — index 본격 entry 추가
- **`decisions/DEC-2026-05-23-fsim-016-environment-dependent-scope-out.md`** — 본 DEC 신설
- 3-way version sync = plugin.json + package.json + CHANGELOG 8.14.2 → 8.14.3
- INDEX 최상단 + STATUS session 39차 v8.14.3 sub-entry + CLAUDE.md sync

### STOP-3 hard gate (시행 결과)

- ✅ paradigm 정합 (Tier 3 = simulated only) 본격 재확인
- ✅ Tier 2 sub-axis 본격 명시 (additive paradigm 진화)
- ✅ F-SIM-016 status closed v8.14.3
- ✅ skill-citation-validator 0 stale (보존)
- ✅ breaking 0 (PATCH)

### LL 자산화 (2종 / LL-fsim-18 + LL-r19-04)

- LL-fsim-18 — Senior 사실 검증 보강 paradigm 안 main agent self-fact-check 본격 작동 (Tier 3 격상 후보 사실 잘못 발견 + paradigm 정합 path 본격 결정) = LL-fsim-11 본격 확장
- LL-r19-04 — R19 Tier 2 안 environment-dependent risk sub-axis paradigm 진화 (sub-axis 본격 분류 의무 / 14차 retract pattern 회피)

### 본 session 누적 4 release (v8.14.0 MINOR + v8.14.1 PATCH + v8.14.2 PATCH + v8.14.3 PATCH)

### Cross-link

- Resolves F-SIM-016 (v8.4.0 carry / v8.14.1 정식 ledger / v8.14.2 carry note 본격 정정)
- Amends charter R19 (v8.6.0 신설 / v8.14.3 sub-axis patch)
- Cross-link: DEC-2026-05-18-runtime-tool-exclusion + DEC-2026-05-23-poc-03-carry-acknowledged

---

## [8.14.2] — 2026-05-23 PATCH — poc-03 chain 4 GREEN = deadline 없는 carry 정직 표기 (Senior STRONG-STOP signal 2종 본격 입증 + paradigm enforcement 본격 입증대)

> Type 1.5 second arm sprint 본격 종결 = poc-03 carry 정직 표기 paradigm. 사용자 결단 ladder = "이제 진행 하자" → C (Type 1.5 second arm) → A1+B2+C1+D1+E2 + sqlite → Senior REVISE-3 STRONG-STOP 2종 발견 → REVISE 전면 흡수 → C3.5 pre-flight smoke FAIL → 옵션 B (carry 정직 표기). additive doc only / breaking 0.

### 본질 (paradigm enforcement 본격 입증대)

본 release = chain 4 GREEN 미도달이나 **paradigm enforcement 본격 입증대** = 가치 본격 :

- Senior 사실 검증 보강 paradigm **2회 재발** (v8.14.0 poc-02 source empty + 본 sprint poc-03 npm install fail) = LL-fsim-11 본격 paradigm 입증 확장
- pre-flight smoke = STOP-3 hard gate 의무 paradigm 본격 자산화
- commit-block 회피 꼼수 ❌ paradigm 본격 재작동 (LL-fsim-12 + LL-fsim-17) = pre-flight fail 시 carry 정직 표기 본격 선택 = paradigm maturity signal 본격
- 14차 retract pattern 회피 본격 정합 (본격 시행 후 실패 ❌ / pre-flight 단계 carry 정직 표기)

### Senior REVISE-3 (confidence 0.74) STRONG-STOP signal 2종

- **STRONG-STOP-1 (BLOCKER)**: poc-03 source = impl-only / Senior claim "0 matches" 사실 정정 (실측 1 spec 보유 / SIGNUP+LOGIN spec ❌ 유효) / characterization test paradigm 본격 적용 의무 (Michael Feathers / aspirational test ❌)
- **STRONG-STOP-2 (HIGH)**: sqlite scope expansion 9일 시한 비현실 + argon2 native build Windows + Node 22 = likely install failure → **본격 입증 = npm install fail / jest 본격 install ❌**

### C3.5 pre-flight smoke 시행 결과 (STOP-3 gate #10 FAIL)

| 단계                           | 결과                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------- |
| Node v22.11.0 + npm 10.9.0     | 환경 본격 가용 ✅                                                                 |
| `**/*.spec.ts` 실측            | 1 spec 본격 보유 (`tag.controller.spec.ts`) — Senior "0 matches" 사실 정정        |
| `npm install --ignore-scripts` | **본격 fail** ("Exit handler never called" / 2020 deps + npm 10 strict peer deps) |
| jest 본격 install              | ❌ (npm install 부분 install / jest 자체 install ❌)                              |
| `npx jest --listTests`         | ❌ "jest 본격 인식 불가"                                                          |
| **STOP-3 gate #10**            | ❌ **FAIL**                                                                       |

### 자산 변경 (additive doc / breaking 0)

- **`plan-poc-03-chain-4-green.md`** — §9 본 sprint 본격 종결 + Senior STRONG-STOP-2 입증 + carry 정직 표기 paradigm 추가
- **`decisions/DEC-2026-05-23-poc-03-carry-acknowledged.md`** — 본 DEC 신설
- 3-way version sync = plugin.json + package.json + CHANGELOG 8.14.1 → 8.14.2
- INDEX 최상단 entry + STATUS session 39차 v8.14.2 sub-entry + CLAUDE.md sync
- memory `project_v8140_release_status.md` 갱신 (v8.14.2 carry + LL-fsim-14~17 추가)

### STOP-3 hard gate (시행 결과)

- ✅ pre-flight smoke FAIL = paradigm 정합 carry 정직 표기 본격 선택
- ✅ v8.14.0 + v8.14.1 paradigm 본격 보존
- ✅ skill-citation-validator 0 stale (보존)
- ✅ breaking 0 (PATCH)

### LL 자산화 (4종 / LL-fsim-14~17)

- LL-fsim-14 — Senior 사실 검증 보강 paradigm 2회 재발 (LL-fsim-11 본격 입증 확장)
- LL-fsim-15 — pre-flight smoke = STOP-3 hard gate 의무 paradigm
- LL-fsim-16 — 6년 전 OSS fork environment-dependent risk (F-SIM-016 paradigm 동형)
- LL-fsim-17 — commit-block 회피 꼼수 ❌ paradigm 본격 재작동 검증 (LL-fsim-12 재입증)

### 차기 session carry path (deadline 없음)

- poc-03 chain 4 GREEN (npm install environment fail / Docker 또는 Node 14.x downgrade 후보)
- poc-04-mini React chain 4 GREEN (FE 트랙 / 환경 사전 사실 검증 의무)
- poc-02 Spring Boot 3 chain 1~4 (source clone 의무 / 가장 무거운 work-unit)
- Type 2 axis (외부 사용자 / OSS 채택 트리거 의존)

### Cross-link

- Resolves Type 1.5 second arm sprint = paradigm 정합 carry 정직 표기 (poc-03 본격 carry)
- Amends DEC-2026-05-23-fsim-005-corroboration-2-genuine (Type 1.5 second arm carry 본격 명시)

본 session 누적 3 release (v8.14.0 MINOR + v8.14.1 PATCH + v8.14.2 PATCH).

---

## [8.14.1] — 2026-05-23 PATCH — F-SIM-12~16 정식 ledger 등재 + closed 2종 (F-SIM-013 + F-SIM-015 본격 흡수 자산화 / v8.4.0 carry 본격 종결)

> v8.4.0 (2026-05-18) 시뮬레이션 dogfood 5 신규 finding 의 정식 ledger 등재 carry (`project_v84_simulation_carry.md` 의제 B) 본격 종결. v8.14.0 paradigm 진화 후속 sync. 사용자 결단 "α로 진행" (cooling-off cadence 안 additive only 작업). additive doc only / breaking 0.

### 본질 (cooling-off cadence 정합)

v8.14.0 (2026-05-23) MINOR release 직후 paradigm 안정점 cooling-off 24h cadence 안 additive 즉시 작업 진입. v8.13.1 dep-graph SSOT doc only PATCH precedent 동형 = release 후 carry 정식 자산화 의무.

### F-SIM ledger 갱신

`methodology-spec/finding-system.md` F-SIM namespace 표 11 row → **16 row**.

- **closed v8.14.0** (2종 / 본격 자산화):
  - **F-SIM-013** (medium) — Type 1 시뮬레이션 한계 (hook + agent fire 0 / Claude self-run paradigm). v8.14.0 Type 분류 3계층화 paradigm 본격 흡수 (Type 1 정식 분류 + Type 2 carry 정직 표기 / DEC-2026-05-23-fsim-005-corroboration-2-genuine §1).
  - **F-SIM-015** (high) — test-spec.fail_mode schema 미허용 / F-SIM-005 P1 carry 즉시 영향. v8.14.0 fail_mode enum 4종 (compile_import_fail/assertion_fail/dry_run_placeholder/pending) + chain-coverage-validator validateFailModeDistribution 7번째 export 본격 흡수 (DEC-2026-05-23-fsim-005-corroboration-2-genuine §3).

- **open carry** (3종 / 정직 표기 / cooling-off 후 별 결단 / deadline 없음):
  - **F-SIM-012** (medium) — severity_distinct_count=1 mask (모든 AC must → cell critical / F-SIM-002 propagation 가시화 부분 잔존 / paradigm-level 한계 single-PoC carry / proposed fix = severity_distinct_count gauge metric 신설).
  - **F-SIM-014** (low) — analysis-form-validation-fe description "FE-only" → Pydantic BE schema validation cover ❌ / F-SKILL-014 동반 후보 / skill description scope 확장.
  - **F-SIM-016** (low) — static-runner Semgrep wrapper deprecated / Windows MSYS2 환경 fire ❌ / R19 Tier 2 환경 의존 / memory `environment-dependent-tools-scope-out` 정합 영구 scope-out 후보.

### 자산 변경 (additive doc / breaking 0)

- **`methodology-spec/finding-system.md`** — F-SIM ledger 표 11 → 16 row + body 5종 신설 (F-SIM-012/013/014/015/016 각 phase / confidence / type / description / evidence / spec_gap / decision_made / severity / proposed_fix / status)
- 3-way version sync = plugin.json + package.json + CHANGELOG 8.14.0 → 8.14.1
- DEC-2026-05-23-fsim-12-16-ledger-registration 신설 + INDEX 최상단 + STATUS session 39차 v8.14.1 sub-entry + CLAUDE.md sync

### STOP-3 hard gate (시행 결과)

- ✅ skill-citation-validator 227 active doc / 0 stale dead-link
- ✅ 변경 = finding-system.md 만 (additive doc only)
- ✅ breaking 0 (PATCH)
- ✅ version 3-way sync

### LL 자산화 (1종)

- **LL-fsim-13** — release 직후 cooling-off cadence 안 additive only doc-sync paradigm = v8.13.1 dep-graph SSOT doc only PATCH precedent 동형. paradigm preservation = release 후 carry 정식 자산화 의무.

### Cross-link

- Resolves `project_v84_simulation_carry.md` §의제 B (F-SIM-12~16 정식 ledger 등재) — v8.4.0 carry 본격 종결
- Amends DEC-2026-05-23-fsim-005-corroboration-2-genuine (F-SIM-013 + F-SIM-015 closed 본격 등재 추가)
- Open carry = F-SIM-012/014/016 (cooling-off 후 별 결단 / deadline 없음)

---

## [8.14.0] — 2026-05-23 MINOR — F-SIM-005 P1 corroboration #2 본격 해소 + Type 분류 3계층화 paradigm 진화 + fail_mode_qualification boolean 강제 (Adzic SBE 함정 직접 회피)

> F-SIM-005 P1 carry (commit-block deadline 2026-06-01 / D-9) 본격 해소. 사용자 결단 "ㄱㄱ" (4원칙 §1+§2+§3 ladder full / 3-agent Senior REVISE-3 @ 0.83 흡수 + 옵션 α 채택). additive / breaking 0.

### 본질 진화 (paradigm)

본 release = v8.4.0 (2026-05-18) 의 "패러독스 해소" claim 을 **진정 해소** 로 격상. v8.4.0 시점에 PoC #14 corroboration #2 자격 명목 달성 (Type 1 / Claude self-run / Python+pytest) 했으나, 본질 잔존 = Type 1 vs Type 2 분리 미명시 + fail_mode enum 부재 + dry_run_placeholder 자격 mask 가능성 잔존. v8.14.0 = Type 분류 3계층화 paradigm 진화 + fail_mode 4종 enum + boolean 강제로 본격 해소.

**self-bootstrap proof 부분 입증** = PoC #05 Type 1.5 single arm 본격 달성 (TypeScript+vitest / 본 user 별도 PoC 적용 / Rust/GCC Stage 3 identity check 동형). Type 1.5 second arm + Type 2 = carry 정직 표기 (commit-block 회피 꼼수 ❌).

### 4원칙 ladder full

1. **1원칙 (plan)**: `.claude/plans/plan-fsim-005-corroboration-2.md` + REVISE-1+2+3+LOW 흡수 갱신
2. **2원칙 (3-agent)**: `_base-official-docs-checker` (F-015 Claim A VERIFIED / Claim B PARTIAL-VERIFIED / Claim C PARTIAL / STOP 없음) + `_base-industry-case-researcher` (9 case isomorphic / first-mover 자격 ✅ / 함정 회피 3종 ✅) + `_base-senior-engineer` (REVISE-3 @ 0.83 / STRONG-STOP 1 + HIGH 1 + MED 1 + LOW 1 흡수)
3. **3원칙 (사용자 묶음 결단)**: A5 + B3 + C3 + D2 권고 전면 흡수 → Senior REVISE 전면 흡수 (A5' + B3' + C3' + D2 + LOW) → poc-02 source empty 발견 시 옵션 α 채택 (carry 정직 표기 + 현 상태 release)

### Senior REVISE 흡수 (4종)

- **REVISE-1 BLOCKER**: Type 2 9일 시한 안 불가능 → Type 분류 3계층화 (Type 1 / Type 1.5 / Type 2) + Type 2 carry 정직 표기
- **REVISE-2 HIGH**: poc-15 신설 ❌ → poc-02 재검증 → (turn 중 source empty 발견 / 옵션 α 채택) → carry 정직 표기
- **REVISE-3 MED**: dry-run 30% 임계 §8.1 단일 PoC 함정 위배 → warn-only + boolean 강제 (임계 ratio ❌ / 30% ratchet = v+1)
- **LOW**: "5번째 export" 사실 오류 → "7번째 export (utility 제외 6번째)" 정정

### 자산 변경 (additive / breaking 0)

- **`schemas/test-spec.schema.json`** — `test_cases.items.properties.fail_mode` enum 4종 (compile_import_fail / assertion_fail / dry_run_placeholder / pending) 추가 (additive optional)
- **`tools/chain-coverage-validator/src/validator.js`** — `validateFailModeDistribution` 7번째 export 신설 (warn-only / dry_run_placeholder boolean 강제 + corroboration_qualified 반환)
- **`tools/chain-coverage-validator/src/cli.js`** — `--test-spec <path>` flag wire + JSON/human output + exit code 보존 (warn-only)
- **`tools/chain-coverage-validator/test/validator.test.js`** — 신규 4 test 추가 (all-compile_import / any-dry_run / mixed-pending-absent / GREEN+graceful) — 30/30 → **34/34 pass**
- **`flows/sdlc-4stage-flow.json`** — `release_eligibility.corroboration_type_levels` 3계층 신설 (Type 1 / Type 1.5 / Type 2 + 권위 동형 명시) + `fail_mode_qualification` boolean 강제 (qualified_modes 3종 + excluded dry_run_placeholder) + items 7 갱신 + self_consistency_note 정직 표기 (Type 1.5 single arm 본격 + Type 1 partial 보존 + Type 1.5 second arm carry + Type 2 carry)
- **`examples/poc-05-sample-user-register/.aimd/output/test-spec.json`** — `fail_mode: assertion_fail` 표기 2건 (additive)
- **`examples/poc-14-fsim-corroboration/.aimd/output/test-spec.json`** — `fail_mode: assertion_fail` 표기 4건 (additive)
- 3-way version sync = plugin.json + package.json + CHANGELOG.md 8.13.3 → 8.14.0
- DEC-2026-05-23-fsim-005-corroboration-2-genuine 신설 + INDEX 최상단 + STATUS session 39차 + CLAUDE.md sync

### F-015 권위 (3 primary source VERIFIED)

- **Beck-canonical RED** = Kent Beck "Test-Driven Development: By Example" (Addison-Wesley 2002) preface p.x verbatim: "Red — Write a little test that doesn't work, **and perhaps doesn't even compile at first**"
- **DO-178C bidirectional traceability** = Parasoft Learning Center verbatim: "Maintaining the bidirectional correlation between requirements, tests, and the artifacts that implement them is an essential component of traceability"
- **Adzic SBE 10-year lesson** = gojko.net/2020/03/17/sbe-10-years.html verbatim: "about one third of the teams miss out on the potential benefits of examples to create high quality, self-checking documentation"

### Industry case 9 case isomorphic (first-mover 자격)

- **Self-bootstrap 영역**: Rust 4-stage bootstrap (Stage 3 identity check) + GCC 3-stage + Go self-hosting
- **Spec-driven gate 영역**: GitHub Spec Kit (specify→plan→tasks→implement + validator) + ThoughtWorks Radar "big-bang anti-pattern" + SWE-bench static/Live 격차 35~50%p
- **Type 1 vs Type 2 영역**: Waymo CarCraft simulation arm + 실도로 arm 병렬 + Anthropic Bloom auto-eval + NIST/AISI 외부 eval 분리 + HumanEval/SWE-bench gap

### STOP-3 hard gate (시행 결과)

- ✅ workspace test 690 → **694/694 pass** (신규 4 test additive)
- ✅ schema-validator 4 PoC test-spec 모두 VALID (additive optional 회귀 ❌)
- ✅ release-readiness 15/16 ready (1 = --skip-workspace-test 명시 skip / release 시 disable 의무)
- ✅ JSON validity (corroboration_type_levels 3 + qualified_modes 3 + items 7)
- ✅ fail_mode regression: poc-05 + poc-14 모두 corroboration_qualified=true
- ✅ chain-coverage-validator 34/34 pass
- ✅ breaking 0 (additive enum + new export only)

### Carry (정직 표기)

- **Type 1.5 second arm** = poc-02 source empty 발견 (Senior 사실 검증 보강) / poc-03 NestJS chain 4 yellow / poc-04-mini React chain 4 yellow — deadline 없음
- **Type 2** = 외부 사용자 / 외부 repo / 별도 Claude Code session — deadline 없음 / OSS 채택 트리거 의존
- 두 carry 모두 **commit-block 회피 꼼수 ❌** paradigm 정합 = release-readiness 자기 enforcement 본격 입증대

### LL 자산화 (8종 / LL-fsim-05~12)

- F-SIM-011 패러독스 진정 해소 부분 입증 (Type 1.5 single arm)
- Beck-canonical RED = compile-import-fail (F-015 VERIFIED)
- dry_run_placeholder 정직 표기 의무 (Adzic 함정 회피)
- Type 분류 3계층화 paradigm 진화
- Senior STRONG-STOP signal 흡수 paradigm (v8.6.0 동형)
- single-PoC threshold 함정 자기 검출 (warn-only 격하)
- Senior 사실 검증 보강 paradigm (AI 결단 ladder 안 사실 검증 의무 / poc-02 source empty 발견)
- commit-block 회피 꼼수 ❌ paradigm = release-readiness 자기 enforcement 입증대

---

## [8.13.3] — 2026-05-23 PATCH — dist/ 전체 정리 (잔여 v1.4.5 + v1.5.0 archive / cleanup carry 종결)

> v8.13.2 carry "C-dist-v145-v15-cleanup" (low) 종결. v8.13.2 dist/internal-v1.4.3 + v1.4.4 archive paradigm 동형 시행 (gitignored / file system mv / commit 자산 변경 0). 사용자 결단 "케리해줘" (2026-05-23). additive corrective / breaking 0.

### 시행

- `dist/internal-v1.4.5` → `archive/dist-history/internal-v1.4.5` (file system mv)
- `dist/internal-v1.5.0` → `archive/dist-history/internal-v1.5.0` (file system mv)
- `dist/` 폴더 = **empty** (전 4 폴더 archive 완료)
- `archive/dist-history/` = **4 폴더** (v1.4.3 + v1.4.4 + v1.4.5 + v1.5.0)

### 자산 갱신

- `plugin.json` 8.13.2 → 8.13.3 + `package.json` 8.13.2 → 8.13.3 (3-way sync)
- 본 CHANGELOG entry
- DEC-2026-05-23-dist-cleanup-final + INDEX 최상단 + STATUS session 38차

### 검증 — STOP-3 hard gate

- dist/ folder 정리 완료 (4 폴더 → archive/dist-history/) ✅
- workspace test 690/690 pass (보존) ✅
- release-readiness 16/16 ready (보존) ✅
- breaking 0 = PATCH (additive corrective)

### carry (다음 session)

- ✅ **carry 잔존 0 보존** (v8.13.1 paradigm 본격 보존)

### 참고

- DEC-2026-05-23-dist-cleanup-final
- v8.13.2 DEC-2026-05-23-project-cleanup §7 carry C-dist-v145-v15-cleanup 종결
- v8.13.2 Phase D paradigm 동형

---

## [8.13.2] — 2026-05-23 PATCH — 프로젝트 정리 cleanup (4 axis archive)

> v8.13.1 carry 잔존 0 + paradigm 안정점 본격 재도달 후 archive cadence 시행. 사용자 결단 "프로젝트를 정리해 보자" → "추천안 묶음 전체 시행 (4 axis)" (2026-05-23). additive corrective / 정보 손실 0 / breaking 0 / cosmetic 4 기준 충족 (rename 0 + cross-ref 치환 0 + 구조 변경 ❌ + plan 명시).

### 4 axis archive 시행

| File/Dir               | 이전                             | 이후                                                            | 절감                 |
| ---------------------- | -------------------------------- | --------------------------------------------------------------- | -------------------- |
| `decisions/STATUS.md`  | 239 line                         | **30 line**                                                     | 87% ↓                |
| `CHANGELOG.md`         | 3210 line                        | **1255 line**                                                   | 61% ↓                |
| `CLAUDE.md`            | 154 line                         | 156 line (본문 byte ~50% ↓ / 자세 본문 5종 → 1줄 요약 7종 통일) | byte 효과            |
| `dist/internal-v1.4.x` | 2 폴더 (v1.4.3 + v1.4.4 / dist/) | `archive/dist-history/`                                         | file system organize |

### archive 적재처

- `decisions/STATUS-HISTORY.md` 1807 → **2030 line** (session 31차 이하 cutoff append)
- `CHANGELOG-HISTORY.md` 2870 → **4837 line** (v7.0.0 이하 cutoff append)

### cutoff 선정 paradigm

- **STATUS.md cutoff = line 25** — session 31차 v8.6.x 이하 archive / 본 session 33차~36차 6 release 활성 보존 (paradigm 자연 분기 cutoff / v3.6.5 R3 precedent 정합)
- **CHANGELOG.md cutoff = line 1252** — v7.0.0 MAJOR (rules.json → business-rules.json rename / breaking 최대) 이하 archive / v8.x 활성 보존 (paradigm 자연 분기 cutoff / v2.4 precedent 정합)
- **CLAUDE.md 압축** — session 33차~35차 자세 본문 (v8.10.0~v8.13.0) → 1줄 요약 통일 / 36차 v8.13.1 활성 / 본 v8.13.2 entry 추가
- **dist/ archive** — v8.13.1 시점 stale build artifact (2026-05-02~03 / `/dist/` gitignored) → archive/dist-history/ file system mv (git 추적 외부 / commit 자산 변경 0)

### 자산 갱신

- `plugin.json` 8.13.1 → 8.13.2 + `package.json` 8.13.1 → 8.13.2 (3-way sync)
- `decisions/DEC-2026-05-23-project-cleanup.md` 신설
- `decisions/INDEX.md` 최상단 entry 등재
- `decisions/STATUS.md` session 37차 entry 추가 (4 axis archive 종결)
- `CLAUDE.md` "plugin.json v8.13.2" sync + 현재 release 본문 갱신

### 검증 — STOP-3 hard gate

- workspace test 690/690 pass (보존 / 본 cleanup 코드 변경 0)
- release-readiness 16/16 ready (보존)
- dead-link active surface 0 match (보존)
- 정보 손실 0 (HISTORY append + cross-link 보존)
- breaking 0 = PATCH (additive corrective / cosmetic 4 기준 충족)

### Lessons Learned 신규

- **LL-cleanup-01** — paradigm 안정점 후 archive cadence 정착 / 비대화 4 axis 동시 처분 paradigm (STATUS + CHANGELOG + CLAUDE + dist 한 release 안 흡수)
- **LL-cleanup-02** — cutoff 선정 = paradigm 자연 분기 우선 (session 31차 이전 / v7.0 이전 / v3.6.5 R3 정합 / v2.4 precedent 정합)
- **LL-cleanup-03** — HISTORY append paradigm = section header + 시점 명시 + cross-link 보존 (정보 손실 0 / cosmetic 4 기준 정합)

### carry (다음 session)

- ✅ **carry 잔존 0 보존** (v8.13.1 precedent 본격 보존)
- **dist/internal-v1.4.5 + internal-v1.5.0 archive 후보** — 본 plan 외 / 차기 session 결단 의무 (gitignored build artifact / file system cleanup carry / 1-low)

### 참고

- DEC-2026-05-23-project-cleanup
- v3.6.5 R3 STATUS archive precedent (session 14차 이전 cutoff)
- v3.6.8 A2 INDEX cutoff precedent

---

## [8.13.1] — 2026-05-23 PATCH — dep-graph SSOT 통합 (dead-link 제거 / docs/dependency-graph.md 자체 SSOT 격상)

> v8.9.0 carry "C-operation-md-work-folder" (low / 마지막 carry) 종결. 사용자 결단 "추천" (2026-05-23 / Option C — 16 file 인용 갱신). DEC-2026-05-23-dep-graph-ssot-consolidation 정합. PATCH (corrective dead-link 제거 / 정보 손실 0 / breaking 0).

### 실측 (dead-link 진단)

16 file 안 `dep-graph/operation.md` / `concept.md` / `conventions.md` 인용 발견. 3 SSOT 파일 모두 git tracked 아님 + file system 부재 (commit `b9615d0` 시 사용자 환경 work folder 안 작업 doc / 본 plugin tracked 외부).

### 결단 — Option C 채택

- A. 3 file 신설 (사용자 원본 복원 / 안정도 ↑ but 사용자 read 의무) ❌
- B. SSOT footer 제거 (decommission / 단순) ❌
- **C. 16 file 인용 갱신** — docs/dependency-graph.md 가 이미 131 line SSOT 역할 → 자체 SSOT 격상 + dead-link redirect ✅ (정보 손실 0)

### 시행 (additive / corrective / breaking 0)

#### docs/dependency-graph.md SSOT 자체 격상

- 머리말 "설계 원본(SSOT): dep-graph/{operation,concept,conventions}.md" → "v8.13.1 — 본 문서 = 단일 SSOT (DEC-2026-05-23-dep-graph-ssot-consolidation)"
- §1 "(conventions.md §9 …)" → "(§7 기계적 동작 우선)"
- §9 참조 — 3 dead-link 삭제 + 본 doc 자체 SSOT 명시 + 도구 cross-link 보강

#### 10 활성 file 인용 redirect

- `schemas/artifact-graph-node.schema.json`: "dep-graph/operation.md 결정 1" → "docs/dependency-graph.md §2 (그래프 모델)"
- `schemas/artifact-graph-edge.schema.json`: "dep-graph/operation.md 결정 1 + 결정 4 BFS" → "docs/dependency-graph.md §2 + §5 (영향 등급 BFS)"
- `schemas/code-pointer.schema.json`: "dep-graph/operation.md 결정 3" → "docs/dependency-graph.md §3 P2 (code-pointer-validator)"
- `tools/traceability-matrix-builder/src/graph-synthesizer.js`: "dep-graph/operation.md" → "docs/dependency-graph.md §2 + §3 P1"
- `tools/chain-driver/src/propagation-orderer.js`: "operation.md 결정 8 + 결정 5" → "docs/dependency-graph.md §3 P3 + §6"
- `tools/graph-integrity-validator/src/validator.js`: "dep-graph/operation.md 결정 8" → "docs/dependency-graph.md §3 P1 + §7"
- `tools/graph-integrity-validator/README.md` (2건): "dep-graph/operation.md 결정 1+8" + "dep-graph/concept.md 시나리오" → "docs/dependency-graph.md §2+§3+§7" + "docs/dependency-graph.md §1"
- `tools/code-pointer-validator/README.md`: "dep-graph/operation.md 결정 3, 결정 5" → "docs/dependency-graph.md §3 P2 + §6"
- `skills/dep-graph-navigator/SKILL.md` (2건): "dep-graph/operation.md 결정 1/4/7/8" + "dep-graph/concept.md 시나리오" → "docs/dependency-graph.md §2+§5+§3 P4+§7" + "docs/dependency-graph.md §1"
- `methodology-spec/plugin-charter.md`: "설계 SSOT = dep-graph/operation.md" → "설계 SSOT + 운영 가이드 = docs/dependency-graph.md (v8.13.1+ 통합)"

#### History immutable file (변경 ❌)

- `CHANGELOG.md` (3건 — v8.13.0/v8.12.0/v8.9.0 history)
- `decisions/INDEX.md` + `decisions/DEC-2026-05-23-{dep-graph,analysis-validator,xmllint}.md` (history reference 보존)

### 자산 갱신

- `plugin.json` 8.13.0 → 8.13.1 + `package.json` 8.13.0 → 8.13.1 (3-way sync)
- DEC-2026-05-23-dep-graph-ssot-consolidation + INDEX 최상단 + STATUS session 36차 entry

### 검증 — STOP-3 hard gate

- dead-link 0 (active surface) ✅ — `grep dep-graph/operation\|concept\|conventions ./{schemas,tools,skills,methodology-spec,docs}` = 0 match
- workspace test pass (xmllint 환경 회복 / fast-xml-parser 정합)
- release-readiness 16/16 ready (보존)
- breaking 0 = PATCH (corrective dead-link 제거 / 정보 손실 0)

### carry 종결 cascade (본 release = 본 session 종결)

**본 session (33차~36차) 누적 6 release / 5 carry cascade 종결**:

| Session  | Release     | carry 종결                                                            |
| -------- | ----------- | --------------------------------------------------------------------- |
| 33차     | v8.9.0      | dep-graph release ceremony (b9615d0 명시)                             |
| 33차     | v8.10.0     | analysis_validator carry                                              |
| 34차     | v8.11.0     | Senior REVISE-1 carry                                                 |
| 35차     | v8.12.0     | legacy-risks-poc-migration carry                                      |
| 36차     | v8.13.0     | xmllint-env-absent carry (R19 paradigm 완결)                          |
| **36차** | **v8.13.1** | **operation-md-work-folder carry (dep-graph SSOT 통합)** ← 본 release |

**carry 잔존 = 0** (역사상 최초).

### 참고

- DEC-2026-05-23-dep-graph-ssot-consolidation
- v8.9.0 carry C-operation-md-work-folder 종결 (4 release 보존 carry)

---

## [8.13.0] — 2026-05-23 MINOR — sql-inventory-validator Tier 1 in-plugin XML parser 격상 (xmllint → fast-xml-parser / R19 paradigm 정합)

> v8.12.0 carry "C-xmllint-env-absent" 종결. 사용자 결단 "Option A: Tier 1 격상 (fast-xml-parser 도입)" (2026-05-23). DEC-2026-05-18-runtime-tool-exclusion §R19 (Tool Ecosystem Dependency Classification) paradigm 정합. additive / breaking 0 / Windows/Linux/Mac 동일 동작.

### 신규 자산

- **`fast-xml-parser ^4.5.0`** dependency 추가 (`tools/sql-inventory-validator/package.json`)
  - Node-native XML parser (pure JS / no native deps / Windows/Linux/Mac 동일 동작)
  - libxml2 외부 의존 제거 (xmllint command 부재 OS 호환)

### Tier 분류 변경 (R19 정합)

| 변경       | 이전 (v8.7~v8.12)                                      | 이후 (v8.13.0+)                                                                 |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Tier       | Tier 2 (user-environment OS-native binary)             | **Tier 1 (in-plugin Node-native)**                                              |
| 도구       | xmllint (libxml2 binary spawn)                         | fast-xml-parser (npm dep)                                                       |
| OS 호환    | Linux/Mac 한정 (Windows env absent)                    | Windows/Linux/Mac 동일                                                          |
| spawn 호출 | `xmllint --version` probe + `xmllint --xpath` per file | `XMLParser.parse(xmlContent)` + 재귀 tag count                                  |
| field 호환 | `xmllint_total` + `xmllint_version`                    | **backward-compat** — 동일 field name (value 만 `fast-xml-parser:<ver>` marker) |

### Tag count 알고리즘 (재귀 traversal)

- `XMLParser({ ignoreAttributes:true, parseTagValue:false, isArray: tag => SQL_TAGS.has(tag) })`
- `SQL_TAGS = { select, insert, update, delete, procedure }` (iBATIS 2 + MyBatis 3 공통)
- 재귀 traversal — nested mapper 대응 (Array 강제 / 동일 tag 중복 정확 count)
- v8.7.1 PATCH (F-CYCLE4-001 fix) `<procedure>` tag 포함 — 정합 보존

### Dead code 제거

- `xmllint_unavailable` status 분기 제거 (v8.13.0+ 도달 불가 / clean code)
- `spawnSync` import 제거 (sql-inventory-validator validator.js 한정)

### 자산 갱신

- `tools/sql-inventory-validator/package.json` 0.2.1 → 0.3.0 + `fast-xml-parser ^4.5.0` dependency
- `tools/sql-inventory-validator/src/validator.js` — `crossCheckLegacyXml` 함수 Node-native paradigm 격상 + `countSqlTagsRecursive` 헬퍼 신설
- `tools/sql-inventory-validator/test/validator.test.js` — v8.7 Layer 2 dir_missing test v8.13.0 noter 갱신
- `plugin.json` 8.12.0 → 8.13.0 + `package.json` 8.12.0 → 8.13.0 (3-way sync)

### 검증 — STOP-3 hard gate

- sql-inventory-validator test **31/31 pass** ✅ (v8.7.1 iBATIS test #25+#26 회복 / OS 무관 동일 동작)
- workspace test **690/690 pass** ✅ (v8.12.0 688/690 → v8.13.0 690/690 / xmllint env absent 2 fail 회복)
- release-readiness **16/16 ready** ✅ (v8.12.0 15/16 → v8.13.0 16/16 / xmllint carry 종결)
- breaking 0 = MINOR (additive — Node-native parser 격상 / field name backward-compat)

### carry (다음 session)

- **C-operation-md-work-folder** (v8.9.0 carry 보존 / low) — work/dep-graph/operation.md 가 git tracked 아님 / docs/ 흡수 후보

**R19 paradigm 본격 완결** — sql-inventory-validator = Tier 1 in-plugin / xmllint 외부 의존 제거 / Windows 환경 부재 차단 회피 / workspace_test_pass 회복.

### 참고

- DEC-2026-05-23-xmllint-tier1-migration
- DEC-2026-05-18-runtime-tool-exclusion §R19 (Tool Ecosystem Dependency Classification)
- v8.9.0 carry C-xmllint-env-absent 종결

---

## [8.12.0] — 2026-05-23 MINOR — 5 PoC 18 risks string → object form 마이그레이션 (legacy carry 청산)

> v8.11.0 carry "C-legacy-risks-poc-migration" 종결. 사용자 결단 "ㄱㄱ" → "추천안 묶음 전체 시행" (2026-05-23 / D1~D7 7 cluster). 정보 손실 risk = **0** (실측 입증 / description 자유서술 그대로 보존 + severity enum 추가 metadata).

### 마이그레이션 — 5 PoC 18 items (string → object)

severity prefix 자동 매핑:

- "" prefix → critical (1건)
- "" prefix → high (1건)
- "" prefix → medium (10건)
- prefix 부재 → low (6건)

type 추론 (description 안 키워드 기반):

- methodology — paradigm 본질 / 70~80% 한계 / 본체 격상 결단
- environment — 테스트 0 / in-memory store / 실 DB 부재 / chain harness 일부 dry-run
- legacy-corpus — Spring 4.1 + iBATIS 2 / SP 본문 비가시성 / sql-inventory 자동화율
- legacy-domain — IFRS 회계 / 다중책임 + SATD
- domain-expert-carry — ambiguous BR + AP 도메인 expert 결단 의무
- architecture-carry — cross-module 의존 / service boundary

| PoC         | items | severity 분포                          | 정보 보존                                 |
| ----------- | ----- | -------------------------------------- | ----------------------------------------- |
| poc-03      | 2     | low 1 + medium 1                       | ✅ description 그대로                     |
| poc-04-mini | 2     | low 1 + medium 1                       | ✅ description 그대로                     |
| poc-05      | 2     | low 1 + medium 1                       | ✅ description 그대로                     |
| poc-06      | 6     | low 1 + medium 5                       | ✅ prefix → severity / description 그대로 |
| poc-07      | 6     | low 1 + medium 3 + high 1 + critical 1 | ✅ //→ severity / description 그대로      |

### 검증 — 9 PoC 분포 (v8.12.0 완료 시점)

| PoC         | string | object | 분류                     |
| ----------- | ------ | ------ | ------------------------ |
| poc-03      | 0      | 2      | ✅ object form           |
| poc-04-mini | 0      | 2      | ✅ object form           |
| poc-05      | 0      | 2      | ✅ object form           |
| poc-06      | 0      | 6      | ✅ object form           |
| poc-07      | 0      | 6      | ✅ object form           |
| poc-08      | 0      | 8      | ✅ object form (v8.10.0) |
| poc-09      | 0      | 4      | ✅ object form (v8.10.0) |
| poc-10      | 0      | 2      | ✅ object form (v8.10.0) |
| poc-11      | 0      | 14     | ✅ object form (v8.10.0) |

**string form = 0 (전 9 PoC)** / chain-coverage-validator `validateRisksForm` lane = 0 finding emit. legacy carry 완전 청산.

### 자산 갱신

- 5 PoC planning-spec.json risks_and_constraints array 마이그레이션 (string × 18 → object × 18 / 정보 보존)
- `plugin.json` 8.11.0 → 8.12.0 + `package.json` 8.11.0 → 8.12.0 (3-way sync)
- DEC-2026-05-23-legacy-risks-migration + INDEX 최상단 + STATUS session 35차

### 검증 — STOP-3 hard gate

- schema-validator 5 PoC (poc-03/04-mini/05/06/07) planning-spec.json **VALID** ✅
- chain-coverage-validator `validateRisksForm` string_count = 0 (9 PoC 전수) ✅
- release-readiness 15/16 ready (1 carry = xmllint env absent / 보존)
- 정보 손실 = 0 (description 자유서술 + prefix → severity enum 정합)
- breaking 0 = MINOR (additive metadata 추가 — id + severity + type / description 보존)

### carry (다음 session)

- **C-xmllint-env-absent** (v8.9.0~v8.12.0 carry 보존) — Linux/Mac libxml2 환경 의무
- **C-operation-md-work-folder** (v8.9.0 carry 보존) — docs/ 흡수 후보

### 참고

- DEC-2026-05-23-legacy-risks-migration
- v8.11.0 carry C-legacy-risks-poc-migration 종결
- v8.10.0 polymorphic items + v8.11.0 forward warn lane + v8.12.0 legacy 청산 = paradigm 완결 cycle

---

## [8.11.0] — 2026-05-23 MINOR — chain-coverage-validator validateRisksForm lane (Senior REVISE-1 carry 종결)

> v8.10.0 carry "C-risks-string-form-warn-v811" 종결. v8.10.0 §3 D2 Senior REVISE-1 흡수 — chain-coverage-validator forward lane 신설로 silent omission 결정적 차단. additive only / breaking 0.

### 신규 자산

- **`validateRisksForm(planning)` 함수** (`tools/chain-coverage-validator/src/validator.js`)
  - 5번째 export function (validateChainCoverage + validateCrossRefPaths + validateAntipatternCoverage + validateConfidenceCoverage 다음)
  - risks_and_constraints items 안 string form 검출 시 `chain.planning.risks_string_form_warn` finding emit (severity: low)
  - 정보: `string_count` + `object_count` + `affected_indices` + `total_count`
  - message: "legacy carry 한정 (v8.10.0+ object form 권장) / severity 결정적 추출 가능 + drift attractor 차단 본질 / Senior REVISE-1 (DEC-2026-05-23-analysis-validator-poc06-11-resolve §4)"
- **CLI wire** (`src/cli.js`)
  - `validateRisksForm` import + `--json` output 안 `risks_form` 키 추가 + 사람-친화 출력 (`[risks-form] string=N / object=M / total=K`)
  - severity: low = blocking ❌ (warning만 / chain coverage gate 종결 차단 ❌)
- **test 4종 신설** (`test/validator.test.js`)
  - all-string form → low finding emit
  - all-object form → no finding (신규 paradigm 정합)
  - mixed string + object → low finding emit + count 정확
  - empty/missing field → graceful (no finding)

### 실측 PoC 분포 (v8.11.0 검출)

| PoC                             | string | object | 분류                          |
| ------------------------------- | ------ | ------ | ----------------------------- |
| poc-03-realworld-nestjs         | 2      | 0      | legacy carry                  |
| poc-04-mini-realworld-react     | 2      | 0      | legacy carry                  |
| poc-05-sample-user-register     | 2      | 0      | legacy carry                  |
| poc-06-efiweb-exchange-spring41 | 6      | 0      | legacy carry                  |
| poc-07-efiweb-capital-spring41  | 6      | 0      | legacy carry                  |
| poc-08-realworld-mybatis        | 0      | 8      | object form ✅                |
| poc-09-realworld-typeorm-rawsql | 0      | 4      | object form ✅                |
| poc-10-realworld-jpa-querydsl   | 0      | 2      | object form ✅                |
| poc-11-efiweb-billing-spring41  | 0      | 14     | object form ✅ (v8.10.0 정합) |

총 string=18 (5 PoC 영구 carry / legacy 산출물) / object=28 (4 PoC).

### 자산 갱신

- `plugin.json` 8.10.0 → 8.11.0 + `package.json` 8.10.0 → 8.11.0 (3-way sync)
- `chain-coverage-validator/package.json` 0.1.0 → 0.2.0 (workspace MINOR)
- DEC-2026-05-23-risks-string-form-warn + INDEX 최상단 + STATUS session 34차

### 검증 — STOP-3 hard gate

- chain-coverage-validator test **30/30 pass** ✅ (신규 4 + 기존 26)
- release-readiness 15/16 ready (1 carry 보존 — xmllint env absent)
- breaking 0 = MINOR (additive — validate function + CLI flag + test 4)

### carry (다음 session)

- **C-xmllint-env-absent** (v8.9.0+v8.10.0 carry 보존) — sql-inventory-validator iBATIS test #25+#26 / Linux/Mac libxml2 환경 의무
- **C-operation-md-work-folder** (v8.9.0 carry 보존) — work/dep-graph/operation.md git tracked 아님 / docs/ 흡수 후보
- **C-legacy-risks-poc-migration** (medium 신설) — string form 5 PoC (poc-03/04-mini/05/06/07) object form 마이그레이션 — 별도 session / 정보 손실 risk 평가 의무 / 사용자 결단

### 참고

- DEC-2026-05-23-risks-string-form-warn
- v8.10.0 §3 D2 Senior REVISE-1 carry 종결
- DEC-2026-05-23-analysis-validator-poc06-11-resolve §8 차기 session carry C-risks-string-form-warn-v811

---

## [8.10.0] — 2026-05-23 MINOR — planning-spec schema 진화 (5 enum + polymorphic risks + derivation_source 2 properties / 6 PoC analysis_validator carry 해소)

> v8.9.0 carry "C-analysis-validator-poc06-10-placeholder" 종결. 사용자 결단 "추천안 묶음 전체 시행 (Senior REVISE-1 포함)" (2026-05-23 / D1~D6 6건 묶음). Senior critique GO @ 0.87 + REVISE-1 (D2 severity required + $comment legacy-carry warning + chain-coverage-validator risks_string_form_warn lane v8.11.0 carry) 흡수.

### Schema 진화 (additive / breaking 0)

- **D2 — `risks_and_constraints` items polymorphic** (anyOf[string, object{id, severity, description, type?}])
  - 5 PoC 실측 흡수 (poc-08/09/10/11 객체 array + legacy string carry 양쪽)
  - `severity` required enum (`critical|high|medium|low`) — severity-cross-stage-mapping.md SSOT 정합
  - $comment "string 분기 = legacy carry 한정 / 신규 PoC = object 의무" 명시 (Senior REVISE-1)
- **D3 — `cross_links` 5 enum** (Senior 실측 보강 + poc-06 5번째 변종 발견 정합)
  - 기존 `to_analysis_artifacts` (보존)
  - 신규 `to_characterization` (analysis-characterization-test 정합 / poc-06/07/11)
  - 신규 `to_sql_inventory` (analysis-sql-inventory 정합 / poc-07/11)
  - 신규 `to_source` (source-grounded paradigm / poc-11)
  - 신규 `to_decisions` (planning 결단 trace / poc-06/07/11)
  - 신규 `to_phase7_findings` (Phase 4.7 ambiguous 영역 / poc-06)
  - `additionalProperties:false` 유지 = drift attractor 차단 본질 보존
- **D4 — `derivation_source` 2 properties** (DEC-2026-05-12-in-place-read-정책-채택 정합)
  - 신규 `source_handling` (string / in-place read paradigm)
  - 신규 `source_root_absolute` (string / source 절대경로)
  - poc-11 실측 정식 흡수

### PoC 정합

- **poc-06** (chain 1 only)
  - 7 use_cases `acceptance_criteria_refs` placeholder → `AC-EXCHANGE-PLACEHOLDER-001` ~ `AC-EXCHANGE-PLACEHOLDER-007` marker 정합 (chain 2 진입 시 진짜 AC ID 교체 의무)
  - `cross_links` naming canonical 정합 (`to_characterization_artifacts` → `to_characterization`, `to_carry_decisions` → `to_decisions`)
- **poc-11** (chain 2+)
  - `risks_and_constraints` dict (`{critical:[], high:[], medium:[], low:[]}`) → array of 14 objects (id+severity+type+description / severity 보존)

### 검증 — STOP-3 hard gate

- schema-validator 6 PoC planning-spec.json **VALID** ✅ (10+3+8+4+2+7 errors → 0)
- release-readiness `analysis_validator_violation` red → ✅ (v8.9.0 carry 종결)
- breaking 0 = MINOR (additive — schema 3 properties 진화 + PoC naming 정합 / 기존 의무 제거 0)

### carry (다음 session)

- **v8.11.0 carry — chain-coverage-validator `risks_string_form_warn` lane** (Senior REVISE-1 / risks_and_constraints string form = legacy carry 한정 명시 enforcement / 신규 PoC object form 권장)
- **xmllint env absent carry** (sql-inventory-validator iBATIS test #25+#26 / Linux/Mac libxml2 환경 의무 / v8.9.0 carry 보존)

### 참고

- DEC-2026-05-23-analysis-validator-poc06-11-resolve
- v8.9.0 carry C-analysis-validator-poc06-10-placeholder 종결

---

## [8.9.0] — 2026-05-23 MINOR — dep-graph P1~P4 (artifact dependency graph + impact analyzer + 2 validator + chain-driver/matrix-builder 통합)

> charter §5 P3 "Spec change impact analyzer" SHIPPED. 설계 SSOT = `work/dep-graph/operation.md` (8 결정 / 7 알고리즘). 사용자 결단 "추천안 묶음 전체 시행" (2026-05-23) — additive only / breaking 0 / 직전 commit `b9615d0` 의 명시 carry "다음 세션 release ceremony" 시행.

### 신규 자산 (additive / breaking 0)

- **schema 5 신설**: `artifact-graph-node.schema.json` + `artifact-graph-edge.schema.json` + `code-pointer.schema.json` + `discovery-output.schema.json` + `plan-spec.schema.json` (chain schema 6종 안 `code_pointers` optional 추가 — strict 의무 ❌)
- **validator 2 신설**: `graph-integrity-validator` (DFS cycle/orphan/unknown / 13 test) + `code-pointer-validator` (pointer coverage)
- **chain-driver 확장**: `impact-analyzer` (confidence-aware BFS) + `propagation-orderer` (topo sort) + `centrality` (PageRank-lite top-3 root) + `policy-evaluator` (propagation-policy schema-driven) + CLI `impact` / `navigate` / `query --graph` + `hooks-bridge evaluate_policy`
- **matrix-builder 확장**: `graph-synthesizer` (4-state machine: active/propose/drift/deprecated) + diff-view 렌더러
- **skill 신설**: `dep-graph-navigator` (`/dep-graph-navigator <node-id>` — BFS MUST/SHOULD/FYI + code_pointers + centrality)
- **hooks**: PostToolUse + SessionStart `graph-sync` 자동 호출
- **policies**: `propagation-policy.json` + `propagation-policy.schema.json` (4 change-tier × 4 chain-step + 4 anchor_type × 2 patch-kind)
- **release-readiness #15 + #16**: `graph_integrity` + `code_pointer_coverage` (strict default-on / PoC 백필 완료)
- **docs/dependency-graph.md** 운영 가이드 신설 + plugin-charter P3 SHIPPED 마킹

### 회귀 fix

- `tools/chain-driver/package.json` 에 `ajv ^8.17.1` + `ajv-formats ^3.0.1` dependency 등록 (test/policy-schema.test.js 안 ajv import 인데 미등록 = ERR_MODULE_NOT_FOUND regress / 본 release 안 동반 fix)

### 검증 — STOP-3 hard gate

- workspace 686/686 → 685/686 pass (1 fail = xmllint 환경 부재 / Windows / sql-inventory-validator iBATIS test #25+#26 = env absent carry 정당)
- release-readiness 14/16 → 15/16 ready (analysis_validator red 1 carry = poc-06~10 planning-spec placeholder / 본 작업 무관 기존 drift)
- breaking 0 = MINOR (additive — schema 5 + validator 2 + criterion 2 신설 / 기존 의무 제거 0)

### carry (다음 session)

- **analysis_validator red 6건** (poc-06~10 planning-spec.json schema invalid) — placeholder 카리 정리 별도 session
- **xmllint 환경 의존 carry** — Linux/Mac libxml2 환경 의무 (sql-inventory-validator iBATIS 2 test = env absent)

### 참고

- DEC-2026-05-23-dep-graph-p1-p4
- 직전 commit `b9615d0` (b9615d0425ba532468c58f9f169becab43f8c651) "feat(dep-graph): artifact dependency graph P1~P4"

---

## [8.8.2] — 2026-05-21 PATCH — mock detect chain-4 자동 호출 + inflation-lint rule pack 확장 (3 rule)

> v8.8.2 PATCH — v8.8.0 carry 2건 진행. 환경 의존 도구 (Stryker / textlint / PIT) carry 는 영구 scope-out (user memory `environment-dependent-tools-scope-out`).

### 변경 1 — mock detect chain-4 자동 호출 의무 강제 (Tier 1.1 / v8.8.0 → v8.8.2)

- v8.8.0 = `--detect-mock-impl=experimental` 의심 시 호출 (옵션)
- v8.8.2 = chain 4 종결 시 (test-impl-pass-validator 호출 마다) 자동 호출 의무
- `agents/implement-agent.md` 호출 절차 §4 갱신 — verify-test-pass 호출 시 `--detect-mock-impl=experimental --impl-dir <impl_root>` 자동 추가
- impl-spec.json `mock_detect` field 자동 채움 (mode + ratio + threshold + files_scanned + exceeded)
- exceeded=true 시 warning emit (chain blocking ❌ / experimental 정합 유지)
- mandatory 격상 (enforce mode default) = ≥ 2 PoC corroboration carry (v8.9+)

### 변경 2 — inflation-lint rule pack 확장 (3 신규 rule / Tier 3.1)

`tools/inflation-lint/src/cli.js` 확장:

- **claim_absoluteness** — 100% / 절대 / 반드시 / 완벽 / perfect / never / always / guaranteed 등 absoluteness claim ≥ 5 (default)
- **emoji_density** — ❌ ⚠️ ✅ ❗ ⭐ 🎉 🔥 ✨ 💯 status emoji 합 ≥ 15 (default)
- **korean_overemphasis** — 본질 / 진정 / 정직 / 결단 / 핵심 / 명확 / 강조 / 입증 어휘 ≥ 8 (default)

threshold override:

- `--absolute-threshold` / `--emoji-threshold` / `--overemphasis-threshold`

severity = warning only / chain blocking ❌ / scope = markdown text 만 / report semantics ❌

### 회귀

- inflation-lint 11/11 pass (7 baseline + 4 신규 v8.8.2 rule test)
- breaking 0 (신규 rule = 신규 finding kind / 기존 cli 호환)
- 환경 의존 도구 의존성 0 (pure-JS regex)

### v8.9+ carry (영구 carry)

- mock detect mandatory 격상 = ≥ 2 PoC corroboration (cycle-8+)
- 환경 의존 도구 (Stryker / textlint / PIT / osv-scanner) = 영구 scope-out (memory `environment-dependent-tools-scope-out`)

---

## [8.8.1] — 2026-05-21 PATCH — skill-citation pre-existing fail 해소 (tools/\_shared/finding-log.js stale ref)

> v8.8.1 PATCH — v8.7+ 부터 carry 의 pre-existing fail 해소. `tools/_shared/finding-log.js` 가 ticket-policy.md + ticket-sync/SKILL.md 에서 인용되지만 실 파일 부재 (재구조화 drift). 본 PATCH 가 stale ref 정정.

### 변경

- `methodology-spec/ticket-policy.md:234` — `tools/_shared/finding-log.js (또는 skill 인라인)` → `_base-log-finding skill 또는 ticket-sync skill 인라인 (별 finding-log 도구 부재)` 로 정합 정정
- `skills/ticket-sync/SKILL.md:52` — `tools/_shared/finding-log.js 로 emit` → `_base-log-finding skill 호출 (또는 인라인 finding emit)` 로 정정. 별 도구 부재 명시.

### 회귀

- skill-citation-validator 2/2 pass (이전 1 fail = stale citation 재유입 → 해소)
- breaking 0 (단순 doc ref 정정)

### Carry

- 향후 cycle 에서 신규 stale ref 발생 시 skill-citation-validator 가 회귀 차단 (dogfood paradigm 유지)

---

## [8.8.0] — 2026-05-21 MINOR — cycle-7 dogfood 9 개선 cluster (chain 4 GREEN false signal 검출 + legacy rule pack + DDL Phantom 자동화 + inflation lint + carry resolution_kind + preflight fallback)

> v8.8.0 MINOR — cycle-7 (car / 2026-05-21) dogfood 가 표면화한 9 개선 batch. cycle-7 의 본질 발견 = chain 4 "GREEN" 이 in-memory fixture mock 통과 (car.service.ts:63 `prisma: unknown` + scenarioState module-level counter + hardcoded return fixture) / vitest pass=44 / line cov 92.59% 만족 / 진정 비즈니스 검증 0 / plugin `test-impl-pass-validator` ok=true 리턴 = false signal. 본 MINOR 가 가장 큰 ROI.

> branch: `v8.8.0-cycle7-evolution` (6 commit / breaking 0 / DEC: `DEC-2026-05-21-v8.8.0-cycle7-evolution.md`).

### 본질 발견 (cycle-7 dogfood)

- chain 4 GREEN false signal — in-memory fixture mock 통과 / 진정 비즈니스 검증 0
- legacy 발견 5건 grep+rg 수동 — plugin rule pack 부재 → 매 cycle 재발견 위험
- sub-agent 산출물 inflation 만연 — ``다발 / user memory`no-star-inflation` 영구 위반
- DDL cross-check 수동 — IFRS*split TB_CAR*\* 6 매번 수동 검증
- carry 추적 정밀도 부재 — cycle-3 의 'redo' 의도 vs cycle-7 의 '신규 분석' resolution 차이 표기 부재
- preflight fallback 부재 — semgrep SSL 차단 / lizard / osv-scanner 미설치 매번 수동

### 신규 자산 (6 commit / Tier 별)

| commit | Tier    | 변경                                                                                                                                                                         |
| ------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1     | 5.1     | `scripts/preflight-check.js` 확장 — fallback hint per-tool + analysis-opt 도구 4 (osv-scanner / lizard / ast-grep / xmllint)                                                 |
| C2     | 4.1     | `schemas/cycle-carry.schema.json` 신설 — `original_intent` + `resolution_kind` (intended/alternative/drift/pending) + allOf if/then status=completed 의무                    |
| C3     | 2.1     | `tools/static-runner/rules/legacy-korean/` 신설 — 5 Semgrep rule (pii-realname / eclipse-todo-catch / jsp-scriptlet-raw / interceptor-no-rbac / sso-bypass)                  |
| C4     | 2.2     | `tools/sql-inventory-validator --ddl-dir` 신규 옵션 — Phantom 자동 검출 + cross-DB 자동 분류                                                                                 |
| C5     | 1.1+1.2 | `tools/test-impl-pass-validator/src/mock-detect.js` (experimental opt-in / 6 heuristic / dual metric) + `schemas/impl-spec.schema.json` real_integration_axis optional field |
| C6     | 3.1+3.2 | `tools/inflation-lint/` 신설 + 5 sub-agent SKILL.md (analysis/planning/spec/test/implement) 정직 톤 + 보고 schema 의무 추가                                                  |

### dogfood

- mock-detect on cycle-7 impl-output: score=5.23% / file=29.41% / 5 mock indicator file (prisma_unknown 4건 + scenarioState + fixture_builder)
- DDL cross-check on cycle-7 + IFRS_split 180 .sql: Phantom 3 검출 (TB_CAR_INFO / TB_CAR_USERTERM 오타 자동 발견)
- legacy-korean rule pack: 4/5 rule dogfood (eclipse-todo-catch 1 + pii-realname 7 + jsp-scriptlet 1 + sso-bypass 2)
- inflation-lint on cycle-7 CLOSURE.md: 21 warning (132 + 18 long runs + inflation_phrases)

### 회귀 test

- sql-inventory-validator: 31/31 pass (27 baseline + 4 DDL test)
- schema-validator: 35/35 pass (29 baseline + 6 cycle-carry test)
- test-impl-pass-validator: 30/30 pass (25 baseline + 5 mock-detect test)
- inflation-lint: 7/7 pass (신규)
- breaking 0 (모든 신규 schema field optional / 모든 신규 옵션 flag opt-in)

### v8.9+ carry

- Tier 1.1 mock detect mandatory 격상 (cycle-8+ ≥2 PoC corroboration 후)
- Tier 1.2 real_integration_axis mandatory 격상
- Stryker mutation testing 통합 (Tier 6)
- Java 환경 mock detect (PIT/Pitest 통합)
- textlint plugin 통합 (사내 SSL 차단 영구 회피 후)

### LL (Lessons Learned)

- LL-V8.8-01 — sub-agent dogfood 의 가장 큰 가치 = scaffold pass 가 아니라 scaffold pass 의 본질 결함 (cycle-7 chain 4 mock fixture) 검출. plugin 진화의 가장 큰 ROI.
- LL-V8.8-02 — §8.1 의 ≥2 PoC corroboration 의무 시 single PoC 발견은 experimental opt-in flag 으로 reduction. mandatory 격상 = ≥2 PoC carry.
- LL-V8.8-03 — sub-agent 산출물 inflation 톤 (다발) 은 user memory 위반 + 진정 가치 신호 약화. plugin lint rule 자산화.
- LL-V8.8-04 — vendored upstream subtree (`tools/semgrep-rules/`) 폴루션 ❌. 자체 rule = sibling dir (`tools/static-runner/rules/`) 활용.

---

## [8.7.4] — 2026-05-21 PATCH — ticket-sync Sub-task Epic auto-inherit invariant + Structure 자동 등록 표준화 (R20 v4 amendment / breaking 0)

> **v8.7.4 PATCH — R20 v4 amendment**. mis-fe-admin EAM-AUTH **verify-1 iter-6 cycle 종결** 결과 driver. 5 stage 일주 PASS / 106 ticket / Atlassian Structure 등록 15 row 진행 중 2 carry 식별:
>
> - **B14** — Stage 1 Sub-task 14건 (DWPD-1668~1681) 생성 시 `extra_fields.customfield_10006` 명시 시도 모두 400 reject. parent Story 의 Epic Link 가 Sub-task 에 native auto-inherit 됨이 본질. SKILL.md v8.7.3 본문 "Sub-task = parent_key" 표기가 약해 사용자/AI 가 dual binding 시도하는 path 가 열려 있었음. → invariant 명문화 + 위반 reject path.
> - **B15** — Stage 마다 사용자가 `jira_structure_add_issues` (DWP-Forge id=676) manual 호출. plugin 본문에 자동화 부재. 5 stage × 1 manual = 5 친화도 손실. → `structure_id` + `structure_auto_add_on_exit` 파라미터 신설 + 모든 phase=exit 자동 호출 표준화.

### 본질 발견 (mis-fe-admin EAM-AUTH verify-1 iter-6 / Stage 1~5 종결 / 47 MCP 호출 + manual Structure 호출 6회)

- **F-VERIFY-015 (B14 amended)** — Sub-task `jira_create` 후 `jira_update × 14` 로 customfield_10006 backfill 시도 모두 400 reject. evidence: `jira-trace.json` stage1_analysis.B14 sub_section. Jira native semantic = Sub-task 의 Epic Link 은 parent Story / Task 로부터 auto-inherit. dual binding 시도는 본질 위배.
- **B15 carry** — verify-1 iter-6 jira-trace.json stage1~5 모두 `atlassian_structure` 절에 manual 호출 evidence (version 1 → 6 / 총 106 row 등록). plugin 자동화로 가져오면 사용자 manual 부담 0.

### 시행 (1 commit / branch `v8.7.4-r20-subtask-autoinherit-structure-auto`)

1. **B14 SKILL.md §단계 5 prelude / parent linking resolve** — subtask 분기에 "`extra_fields[epic_link_customfield_id]` 명시 ❌. parent Story 로부터 auto-inherit" 명문화 (auto / epic_link_customfield 두 strategy 모두).
2. **B14 SKILL.md §금지/강제력** — v8.7.4+ Sub-task Epic Link customfield 명시 ❌ 항목 신설 + F-TICKETSYNC-011 subtask_epic_link_violation 신설.
3. **B14 SKILL.md §사용자 결단 8번** — Sub-task Epic auto-inherit invariant (DWPD `customfield_10006` 외 환경 동일).
4. **B14 SKILL.md §단계 5/5b 본문** — phase=exit planning + 5 verification stage 의 Sub-task `jira_create` step 에 B14 주석 추가 (extra_fields 명시 ❌).
5. **B15 SKILL.md §파라미터 표** — `structure_id` + `structure_auto_add_on_exit` 2 파라미터 신설.
6. **B15 SKILL.md §단계 5/5b 본문** — analysis/planning/implement standard 본문 + 5 verification stage 본문 모두 structure_add_issues 자동 호출 step 추가.
7. **B15 SKILL.md §사용자 결단 9번** — Structure 보드 자동 등록 (DWPD reference `structure_id=676`).
8. **DWPD 환경 reference config** — structure_id + structure_auto_add_on_exit 추가 / B14 주석.
9. **DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md** 신설 — v8.7.4 amendment ADR.
10. **3 SSOT bump** — plugin.json + package.json + CLAUDE.md 8.7.3 → 8.7.4.

### Q&A — 사용자 결단 매트릭스 누적 (v8.7.1 ~ v8.7.4)

| 결단                                           | 신설 cycle                | 본질                                                       |
| ---------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| 1. Jira workflow transition target IDs         | v8.6.1 R20 charter        | project-specific                                           |
| 2. Confluence emit 범위                        | v8.6.1 R20 charter        | per-stage Tier 2.6 carry                                   |
| 3. Auto-invoke 정책 (chain-driver next stderr) | v8.7.2 verification       | Stop hook 직접 등록 ❌                                     |
| 4. Idempotency                                 | v8.6.1 R20 charter        | search-first                                               |
| 5. MCP 미연결 환경                             | v8.6.1 R20 charter        | silent skip + finding emit                                 |
| 6. mode 선택 (standard / verification)         | v8.7.2 verification       | parent_epic 의무 (verification)                            |
| 7. environment bridge (4 단계 1회 setup)       | v8.7.3 environment-bridge | issuetype_map + parent_strategy + epic_link_customfield_id |
| **8. Sub-task Epic auto-inherit invariant**    | **v8.7.4 본 cycle**       | **customfield 명시 ❌ / parent 의존**                      |
| **9. Structure 보드 자동 등록**                | **v8.7.4 본 cycle**       | **structure_id env-config / 모든 phase=exit 자동**         |

### 정합 cross-ref

- ADR: `decisions/DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md`
- SKILL: `skills/ticket-sync/SKILL.md` (§파라미터 + §단계 5/5b + §금지 + §사용자 결단 + §DWPD config)
- Evidence: mis-fe-admin `.aimd/output/eam/authority/iter-6/jira-trace.json`
- Memory: [[project-plugin-verification-cycle-verify1]] § carry to next cycle (v8.7.4 PATCH 시 B14 + B15 반영)

---

## [8.7.3] — 2026-05-20 PATCH — ticket-sync environment bridge (issuetype_map + parent_strategy + Pre-flight 정정) (R20 v3 amendment / breaking 0)

> **v8.7.3 PATCH — R20 v3 amendment**. mis-fe-admin EAM-AUTH iter-6 verification cycle **Stage 1 실 진입** 결과 driver. v8.7.2 의 parent_epic + mode=verification 으로 Story 1 (DWPD-1667) + Sub-task 14 (DWPD-1668~1681) 실 생성 / Q4·Q5 PASS 달성한 진행 도중 발견한 6 finding (F-VERIFY-005 ~ F-VERIFY-010) 의 본질 = environment portability 결손. SKILL.md 의 Atlassian Cloud 표준 hardcode (issuetype "Story" / parent_key 단일 path / `.aimd/<scope>/state.json` / ListMcpResourcesTool probe / gate-pass 의무) 를 6축 environment-config 화. DEC-2026-05-20-r20-environment-bridge 신설.

### 본질 발견 (mis-fe-admin EAM-AUTH iter-6 Stage 1 실 진입 / 31 MCP 호출 evidence)

- **F-VERIFY-005** (B8) — SKILL.md §단계 1.1 `ListMcpResourcesTool` 호출이 resource-only probe. wiki-jira MCP server 가 resource 0 + tools 50+ deferred 등록 환경 (실 mis-fe-admin) 에서 false negative → silent skip + 잘못된 F-TICKETSYNC-001 emit 위험.
- **F-VERIFY-006** (B9) — SKILL.md §단계 1.2 `.aimd/<scope>/state.json` path 와 `chain-driver init` 의 실 산출 위치 `.aimd/state.json` (scope=current_scope 필드) drift. spec 강행 시 file-not-found → reject.
- **F-VERIFY-007** (B10) — SKILL.md §단계 1.4 산출물 list (planning/behavior/AC/test/impl-spec) 와 §단계 5b verification analysis 가 enumerate 하는 14 산출물 (inventory/architecture/domain/business-rules/antipatterns/state-map/...) 불일치. analysis 산출물 누락.
- **F-VERIFY-008** (B11) — SKILL.md §단계 1.2 "gate 미통과 시 reject" vs `mode=verification` meta-cycle 의 gate 부재 자연성 충돌. 본 verification cycle 의 state.json `last_gate=null` 정상 상태.
- **F-VERIFY-009** (HIGH / B12) — SKILL.md §단계 5b issuetype="Story" hardcode. DWPD project (1565 issue 표본) "스토리" 0건 사용. 실 사용 = 작업/버그/하위 작업/개선/새 기능/epic. 우회 path: issue_type="작업" → DWPD-1667 생성 성공.
- **F-VERIFY-010** (HIGH / B13) — SKILL.md §v8.6.3+ "parent_ticket_id 의무" vs DWPD 환경 일반 issue 의 `parent` 직접 매핑 ❌ → `customfield_10006` Epic Link 의무. 우회 path: `extra_fields={customfield_10006:DWPD-1442}` → DWPD-1667 생성 성공.

→ 6 finding 모두 본질 = plugin universal claim 보존하려면 SKILL.md 의 Atlassian Cloud 표준 hardcode 를 **role label + env-config substitute** 로 추상화 정합.

### 시행 (1 commit / branch `v8.7.3-r20-environment-bridge`)

1. **B12 `issuetype_map` 파라미터 추가** (`skills/ticket-sync/SKILL.md` §파라미터 7번) — role → name/id resolve table. role enum = `story` / `subtask` / `initiative` / `tech_debt` / `task` / `bug`. env-config (`.aimd/ticket-sync-config.yaml`) 또는 args 명시. default = Atlassian 표준 영문 명명.
2. **B13 `parent_strategy` + `epic_link_customfield_id` 파라미터 추가** (동상 §파라미터 8/9번) — `auto` (default) / `parent_key` / `epic_link_customfield`. role=subtask 는 항상 parent_key / 그 외 role 은 `parent_strategy` 결정. DWPD 환경 reference `customfield_10006`.
3. **§단계 5 prelude 신설** (env resolve algorithm) — role → name/id resolve + parent linking resolve + 호출 sequence 의무. standard mode + verification mode 본문 모두 적용. SKILL.md 본문 영문 명명을 role label 로 추상화 + 실 payload 는 resolve 결과 직접 인용.
4. **B8 §단계 1.1 정정** — MCP probe = tools-deferred-list 우선 + jira_search fallback / `ListMcpResourcesTool` 단독 의존 ❌.
5. **B9 §단계 1.2 정정** — state.json path = `.aimd/state.json` + `state.current_scope === <scope>` 매칭.
6. **B11 §단계 1.2 gate-pass 분기** — `mode=verification` 시 gate-pass check 우회 (gate=null OK).
7. **B10 §단계 1.4 stage 분기** — `stage=analysis` 시 14~16 산출물 명시.
8. **§금지 v8.7.3+ 절 2건 추가** — environment hardcode ❌ (F-TICKETSYNC-009) + parent_strategy 우회 ❌ (F-TICKETSYNC-010).
9. **§금지 v8.6.3+ orphan ticket 절 정정** — environment-aware (parent_strategy 별 분기).
10. **§사용자 결단 7번 신설** — environment bridge setup 4단계 (issuetype 분포 sample → config → parent_strategy → customfield_id).
11. **§Cross-link** — `decisions/DEC-2026-05-20-r20-environment-bridge.md` 등록.
12. **decisions/DEC-2026-05-20-r20-environment-bridge.md** 신설.
13. 3 SSOT version sync — `.claude-plugin/plugin.json` + `package.json` + `CLAUDE.md` 모두 `8.7.2` → `8.7.3`.

### v8.7.3 release 결과

- additive only / breaking 0 (standard + verification mode 본문 무변경 / 신규 args 3개 모두 default 가 v8.7.2 동치 행동)
- standard mode 호출자 (Atlassian Cloud 표준) 영향 0
- env-config 명시 사용자만 새 path (DWPD / 사내 Atlassian DC 등)
- mis-fe-admin EAM-AUTH iter-6 Stage 2 진입 가능 상태

### v8.7.3 가 풀지 않는 본질 (carry)

- **F-VERIFY-004 (Stop hook 부재)** — v8.7.2 의 B6 chain-driver next stderr 로 부분 완화. Stop hook 직접 등록은 noise 회피 carry.
- **B7 onboarding doc** — v8.7.4+ carry.
- **Confluence per-stage 보고서** — Tier 2.6 carry.
- **Trello/Linear/GitHub Issues adapter** — Tier 3 자체 adapter / v9.0+ carry.

---

## [8.7.2] — 2026-05-20 PATCH — ticket-sync verification mode + parent_epic override + chain-driver next stderr auto-suggest (R20 amendment / breaking 0)

> **v8.7.2 PATCH — R20 amendment**. mis-fe-admin EAM-AUTH iter-6 verification cycle Stage 0 dry-run findings 4건 + 보강 candidate 6건 driver. ticket-sync 의 3축 본질 확장: (B3) `parent_epic` override + (B4) `mode=verification` 분기 + (B6) `chain-driver next` 안 ticket-sync auto-suggest stderr. Initiative 생성 권한 부재 환경 / plugin dogfood meta-cycle / 기존 Epic 재사용 시 사용. R20 confirmation gate / 7-field evidence / fire-and-forget ❌ 본질 보존.

### 본질 발견 (mis-fe-admin EAM-AUTH iter-6 verification cycle)

- 사용자가 plugin v8.7.0 의 5-stage chain harness + Jira 자동 연동을 검증 (Figma + Swagger input / parent epic = `DWPD-1442 [2026] AI TF`) 진입 시 4 finding:
  - **F-VERIFY-001**: ticket-sync 는 chain harness state-driven (`.aimd/state.json` + `traceability-matrix.json` 의무) — iter-1~5 가 `chain-driver init` 안 거쳐 state.json 부재 → ticket-sync 호출 reject path. 본질 = chain-driver CLI 가 정식 entry point 인데 사용자가 그것을 모르고 skill 만 직접 호출. plugin 측 보강 = onboarding doc (별 carry).
  - **F-VERIFY-002**: ticket-sync standard flow hierarchy (Initiative + per-BC Epic + per-UC Story) ↔ 사용자 verification 의도 (parent_epic = DWPD-1442 하위 + per-stage Story 5) mismatch. 두 hierarchy 가 본질적으로 다름 (실 도메인 feature ≠ plugin dogfood).
  - **F-VERIFY-003** (예상): Initiative 생성 권한 부재 → standard flow analysis exit 첫 호출 시 jira_create(Initiative) 실패 예상 → 전체 batch abort.
  - **F-VERIFY-004**: `hooks/hooks.json` 에 Stop / PostToolUse hook 미등록 → SKILL.md 가 명시한 "chain stage 종료 동기로 호출" 의 실 auto-trigger 0건 (가설 H1 의 결정적 evidence — SKILL.md ↔ 실 hook 정합 부재).
- → standard mode 본문 유지 + verification mode 분기 신설 + chain-driver next 안 auto-suggest 통합 = 3축 amendment

### 시행 (1 commit / branch `v8.7.2-r20-verification-mode`)

1. **B3 `parent_epic` override 파라미터 추가** (`skills/ticket-sync/SKILL.md` §파라미터) — 명시 시 standard flow 의 Initiative 자동 생성 skip + 기존 Epic 하위 직접 매핑. `mode=verification` 시 의무.
2. **B4 `mode=verification` 메타 모드 추가** (동상 §파라미터 + §단계 5 헤더 + §단계 5b 신설) — per-stage Story 5 (analysis/planning/spec/test/implement 각 1) + 산출물·UC·AC·TC 별 Sub-task. plugin dogfood meta-cycle / verification 작업 전용. `parent_epic` 의무.
3. **§금지·강제력** — F-TICKETSYNC-003 (mode=verification + parent_epic 미명시 reject) + F-TICKETSYNC-004 (mode=standard + parent_epic 명시 시 hybrid info finding) 추가.
4. **§사용자 결단 6번** — mode 선택 결단 추가 / Auto-invoke 정책 갱신 (`chain-driver next` stderr / Stop hook 직접 등록 ❌).
5. **B6 chain-driver next 안 auto-suggest stderr** (`tools/chain-driver/src/cli.js` `cmdNext` line ~286) — stage 전이 직후 ticket-sync auto-suggest stderr 출력 (~10 LOC additive / stdout 무영향). Stop hook 직접 등록 ❌ — Stop event = 매 turn 종료마다 발화 = noise. 의도된 stage 전이 시점 (chain-driver next 호출 후) 에만 발화 = 정합.
6. **decision record 신설** — `decisions/DEC-2026-05-20-r20-verification-mode.md` (R20 amendment / 4 finding driver / 3축 변경 / Tier sub-axis 확장 / 정합 관계).
7. **SSOT 일치** — `.claude-plugin/plugin.json` 8.7.0 → 8.7.2 / `package.json` 8.7.1 → 8.7.2 / `CLAUDE.md` line 99 v8.7.0 → v8.7.2.

### 검증

- SKILL.md standard mode 본문 무변경 — diff = §파라미터 표 신규 2행 + §단계 5 헤더 분기 안내 + §단계 5b 신설 + §금지 신규 2건 + §사용자 결단 6번 + §Cross-link 1줄
- mode=verification 본문 5 phase (analysis/planning/spec/test/implement) parent_ticket_id 의무 + structure_complete=true 의무 + verification_mode=true 표식 + verification_story_ids map 정합
- chain-driver next stderr 출력은 stdout 무영향 (JSON output 정합 보존)
- R20 confirmation gate / 7-field evidence / fire-and-forget ❌ / Sequential MCP / search-first idempotency 전부 보존
- breaking 0 — standard mode 호출자는 영향 없음 (mode default = standard / parent_epic optional)

### dogfood 효과

- mis-fe-admin EAM-AUTH iter-6 verification cycle 의 Stage 1~5 가 본 v8.7.2 patched plugin 으로 진입 가능 — `ticket-sync stage=analysis phase=exit mode=verification parent_epic=DWPD-1442` 호출 자연 fit
- plugin self-verification meta-cycle 의 hierarchy 가 표준화 — 본 release 이후 plugin dogfood 작업 모두 `mode=verification` 사용 권고
- F-VERIFY-001~004 finding 4건 → 해소 path 명확: B1/B2 = chain-driver init onboarding (별 carry) / B3+B4 = mode + parent_epic (본 release) / B6 = stderr auto-suggest (본 release)

### Pre-existing fail (v8.7.1 baseline 동등 / 본 PATCH scope 외 / v8.7.3+ carry)

- `analysis_validator_violation` — 6 PoC example (poc-06/07/08/09/10/11) 의 planning-spec.json schema invalid (v8.7.0 baseline 부터 inherited / v8.7.1 release 시점 동일 상태)
- `workspace_test_pass` + `skill_citation_integrity` — `methodology-spec/ticket-policy.md:234` 의 `tools/_shared/finding-log.js` stale citation (실 file 부재 — finding emit path 가 skill 인라인 + `finding-system.md` 통합 path 로 진화됐는데 ticket-policy 인용 미갱신 / 1 file 1줄 갱신으로 해소 가능 / 본 PATCH 무관 / v8.7.3+ carry)
- release:check = 11/14 pass (3 fail = 위 inherited / 본 PATCH 회귀 0건)

### dependencies / migration

- `_shared/` 변경 없음 / schema 변경 없음 (단 ticket_ref 의 `verification_mode` boolean + `verification_story_ids` map field 추가는 v8.7.3+ 후속 carry) / cli flag 변경 없음 / data file 변경 없음
- 옛 호출자 break 0 (mode default = standard / parent_epic optional / opt-in)
- 후속 R15 차단 의무 영역 (Layer 3 evidence-dir) 변경 없음
- v8.7.3+ carry: ticket-sync-evidence schema 에 verification_mode field 추가 / traceability-matrix.schema 에 verification_mode + verification_story_ids 추가 / 사용자 onboarding doc (`chain-driver init` 진입 안내) 강화 / ticket-policy.md:234 stale citation 1줄 fix

---

## [8.7.1] — 2026-05-19 PATCH — sql-inventory-validator xmllint XPath 에 iBATIS 2 `//procedure` tag 추가 (F-CYCLE4-001 fix / boundary service 대응 / breaking 0)

> **v8.7.1 PATCH — F-CYCLE4-001 fix**. cycle-4 dogfood (poc-efi-web-1 / rbac scope) 의 정직 발견: rbac.xml 류 stored-procedure-only mapper (iBATIS 2 `<procedure>` tag 만 사용) 가 sql-inventory-validator Layer 2 cross-check 에서 xmllint_total=0 으로 측정 → `zero_xmllint_count` medium finding 오탐. XPath 가 `select | insert | update | delete` 4 tag 만 cover → `procedure` 누락.

### 본질 발견 (cycle-4 dogfood)

- cycle-4 분석 대상: poc-efi-web-1 의 `rbac` 도메인 (boundary service / 외부 MDI DB stored procedure wrapper)
- rbac.xml = 3 `<procedure>` 만 정의 (rbac 인증/메뉴/권한 조회용 stored procedure 호출)
- v8.7.0 까지: xmllint XPath = `count(//select) + count(//insert) + count(//update) + count(//delete)` → rbac.xml count=0 → `zero_xmllint_count` medium finding (오탐 — 실은 3 SQL 정확 존재)
- 본질: iBATIS 2 의 `<procedure>` tag 가 표준 SQL 호출 tag 중 누락 — `select|insert|update|delete` 외 `procedure` 도 의무

### 시행 (1 commit / branch `v8.7.1-xpath-procedure-fix`)

1. **XPath fix** (`validator.js:432`) — `count(//procedure)` 추가. 이전: 4 tag 합산 / 이후: 5 tag 합산 (select + insert + update + delete + procedure).
2. **finding message 갱신** (`validator.js:376`) — `zero_xmllint_count` message 의 "no select/insert/update/delete tags" → "no select/insert/update/delete/procedure tags".
3. **cli.js help 문구 갱신** (line 56) — XPath 표기 정정.
4. **test 신규 3건** (`test/validator.test.js`):
   - "v8.7.1 — iBATIS 2 `<procedure>` only mapper xmllint_total > 0 (F-CYCLE4-001 fix / rbac.xml 형식)" — fixture `legacy-xml-ibatis2-procedure/rbac-like.xml` (3 procedure) / 기대 xmllint_total=3.
   - "v8.7.1 — select/insert/update/delete/procedure 혼합 mapper xmllint_total 정확 합산" — fixture `legacy-xml-mixed-stmt-proc/mixed-mapper.xml` (5 stmt) / 기대 xmllint_total=5.
   - "v8.7.1 — zero_xmllint_count message 갱신 (procedure tag 언급)" — source grep 회귀 보장.
5. **fixture 신규 2개** — `legacy-xml-ibatis2-procedure/` + `legacy-xml-mixed-stmt-proc/`.
6. **package.json version bump** — `0.2.0` → `0.2.1`.

### 검증

- sql-inventory-validator 27 tests pass / 0 fail (v8.7.1 신규 3 / 24 기존 정합 — 회귀 0)
- xmllint 직접 검증: rbac-like.xml = 3, mixed-mapper.xml = 5 (예상치 일치)
- breaking 0 — 옛 4 tag 호출자는 영향 없음 (procedure tag 가 누락된 mapper 만 추가 count)

### dogfood 효과

- cycle-4 의 sql-inventory.json (rbac 3 procedure) 가 plugin v8.7.1 의 Layer 2 cross-check 통과 가능 — xmllint_total=3 vs inventory_count=3 → mismatch 0% (정합)
- F-CYCLE4-001 medium finding 해소 (v8.7.0 까지의 plugin XPath 결함)

### dependencies / migration

- `_shared/` 변경 없음 / schema 변경 없음 / cli flag 변경 없음 / data file 변경 없음
- 옛 호출자 break 0 (XPath 만 +1 tag, 옛 count 결과 ≤ 새 count 결과)
- 후속 R15 차단 의무 영역 (Layer 3 evidence-dir) 변경 없음

---

## [8.7.0] — 2026-05-19 MINOR — R15 silent enabler fix (sql-inventory-validator Layer 1~4 + characterization-coverage-validator Layer 3 mirror + \_shared/evidence-cross-check.js refactor + bin alias 양쪽 보존 rename) (additive / breaking 0)

> **v8.7.0 MINOR — R15 silent enabler 4 layer fix**. cycle-3 dogfood (poc-efi-web-1) 의 **F-CYCLE3-005** R15 violation 정량 evidence 발견 → plugin 17 validator 중 2 도구 (sql-inventory-extractor + characterization-coverage-validator) 가 `_shared/baseline.js` 공유 = **R15 silent enabler 공범** 확정 → 본 release = **4 layer fix + 정직 명칭 채택 + duplication 청산**.

### 본질 발견 (cycle-3 dogfood)

- `sql-inventory-extractor` plugin validator 가 `findings=0` 통과 → 실 legacy XML 21 SQL vs AI hypothesis sql-inventory.json 7 SQL (67% miss) silent pass
- `extraction_automation.auto_ratio_external_6 = 0.5` 도 AI 자기 보고 (실 외부 도구 invocation 0회 / shell exit log 부재)
- 명칭 fraud — `extractor` 이름 / 실 동작 = `validator` (README L1 자기 시인)
- 본 pattern = 17 validator audit 결과 2 도구 한정 (sql-inventory-extractor + characterization-coverage-validator / `_shared/baseline.js` 공유 = silent enabler 공범 heuristic)

### 시행 (6 commit cluster / branch `v8.7-r15-silent-enabler-fix`)

1. **Fix #2 Layer 2+4** (`0c53801`) — sql-inventory-extractor `--legacy-xml-dir <dir>` 옵션 + xmllint XPath count vs `inventory_count` cross-check. mismatch ≥ 30% high finding / ≥ 70% critical finding. xmllint 부재 시 medium finding + graceful skip. README scope 정정 (no-simulation 정합 scope 한계 명시).
2. **Fix #3 partial defense 격상** (`3f609f0`) — characterization-coverage-validator `snapshot.code_only_carry_recommended` (medium) → `snapshot.code_only_carry_required` (high) 격상. data_source_status='code_only' snapshot = AI hypothesis 가능성 / 도메인 expert 검증 의무.
3. **Fix #2 Layer 3** (`86bc271`) — sql-inventory-extractor `--evidence-dir <dir>` 옵션 + JSON Lines evidence file schema (`{ tool, version, args, target, timestamp, duration_ms, exit_code, ... }`) + unique `tool` field count 와 `auto_ratio_external_6` N claim cross-check. mismatch 시 critical finding (R15 silent simulation 의심).
4. **Fix #3 Layer 3 mirror** (`ed84f3e`) — characterization-coverage-validator `--evidence-dir` 동일 pattern. claim source = `data_source_status` ∈ {real_db, real_environment, domain_expert_interview} 명시 snapshot count. real-source claim 0 시 medium finding `claim_empty`.
5. **`_shared/evidence-cross-check.js` refactor** (`d020000`) — Fix #2 + Fix #3 Layer 3 helper duplication (95% 동일 코드) 통합 → `_shared/` 로 추출. 각 도구의 claim 계산 (parseClaimedAutoCount / countRealSourceSnapshots) 만 도구별 보존. net -87 LOC.
6. **Task #84 rename** (`7ac6fe7`) — `sql-inventory-extractor` → `sql-inventory-validator` (명칭 fraud 정직 해소). 디렉토리 + test file git mv (file history 보존). **bin alias 양쪽 보존** (`sql-inventory-validator` + `sql-inventory-extractor` 모두 cli.js 매핑) → 옛 호출자 break 0. live source 15 file 갱신 (workspace + characterization mirror 참조 + skill + workflow + flows + finding-system evidence). historical doc 보존 (decisions/ + docs/adr/ + briefing/ + examples/ + dist/ — skill-citation-validator history-summary 제외 list 정합).

### 검증

- sql-inventory-validator 24 tests pass / 0 fail (Layer 2 + Layer 3 test 6 신규 / 18 기존 정합)
- characterization-coverage-validator 20 tests pass / 0 fail (Layer 3 mirror test 4 신규 + code_only 격상 test 2 신규 / 14 기존 정합)
- workspace test 439/440 pass (skill-citation-validator 1 fail = pre-existing `tools/_shared/finding-log.js` stale citation in `ticket-policy.md:234` / 본 PATCH 무관 / v8.6.3 baseline 동등)
- 본 PATCH 추가 stale citation = 0 (finding-system.md F-MB record evidence path 갱신 효과)
- bin alias verify (양쪽 명 cli.js 매핑)
- cli --help 출력 verify (sql-inventory-validator 명 정합)

### Pre-existing fail (v8.6.3 baseline 동등 / 본 PATCH scope 외 / v8.7+ carry)

- `analysis_validator_violation` — 6 PoC example 의 planning-spec.json schema invalid
- `claude_md_version_sync` — 본 release 에서 해소 (CLAUDE.md line 99 "plugin.json v8.6.0" → "v8.7.0" + plugin.json + package.json 3 SSOT 일치)
- `workspace_test_pass` + `skill_citation_integrity` — `methodology-spec/ticket-policy.md:234` 의 `tools/_shared/finding-log.js` stale citation (1 file 갱신으로 해소 가능 / 별 commit / 본 PATCH 무관)

### Charter / heuristic 자산화

- **heuristic**: `_shared/baseline.js` 공유 도구 = R15 silent enabler 의심. 미래 plugin contributor 의무 (CONTRIBUTING.md carry).
- **plugin validator pass = `evidence_trust = schema_valid`** (NOT `real_tool`). 실 외부 도구 invocation + cross-check 후만 `evidence_trust = real_tool` 정합.
- **R15 4 layer 정합 (필수 시행)**: Layer 1 명칭 정직 / Layer 2 legacy source cross-check (e.g. xmllint) / Layer 3 evidence cross-check (`--evidence-dir` \*.jsonl) / Layer 4 README scope 정정.

### Carry (v8.7+)

- `--test-coverage-report <path>` 옵션 — characterization-coverage-validator 의 더 본격 R15 full 차단 (실 test runner vitest/jest/pytest coverage report cross-check)
- pre-existing skill-citation fail 해소 (`tools/_shared/finding-log.js` reference 갱신 또는 finding-log.js 신설)
- 6 PoC example planning-spec.json schema 갱신 (analysis_validator_violation 해소 / 작업량 큼)
- plugin contributor R15 heuristic 자산화 (CONTRIBUTING.md / plugin-authoring-spec patch)

### MINOR rationale

- additive — `--evidence-dir` 옵션 신설 + bin alias 양쪽 보존 + Layer 3 helper `_shared/` 추출 / 기존 의무 제거 0 / 기존 호출자 break 0
- 본 release 의 가장 큰 semantic change = `evidence_trust` 의 plugin validator scope 정확 정의 (schema_valid vs real_tool) → MINOR 격상 (단순 PATCH 이상)

### Evidence

- `poc-efi-web-1/cycle-3/verification/F-CYCLE3-005-r15-violation-quantitative-evidence.md` (원본 finding + LL-CYCLE3-13~16)
- branch `v8.7-r15-silent-enabler-fix` commits `0c53801`·`3f609f0`·`86bc271`·`ed84f3e`·`d020000`·`7ac6fe7`

DEC-2026-05-19-v8.7-r15-silent-enabler-fix. 직전 release 요약 (역순):

## [8.6.3] — 2026-05-18 PATCH — R20 구조 강제 (parent_ticket_id schema + link_type enum + jira_structure_add_issues 통합 + F-TICKETSYNC-002 missing_parent finding) (additive / breaking 0)

> **v8.6.3 PATCH — R20 hierarchy enforcement**. 사용자 "**티켓은 스트럭쳐를 가져야 함**" → v8.6.2 까지 R20 의 parent 명시 = `ticket-policy.md` §Layer mapping 표 + `SKILL.md` MCP call matrix text 뿐 / schema-level 강제 부재 + Atlassian Structure plugin (`jira_structure_*`) 미사용. 본 release = **4 layer 동시 강제** (policy + schema + skill + finding emit).
>
> ### 결단 — Sub-agent 부재 (명시)
>
> 사용자 질의 "티켓 관리자 에이전트가 있어야 되는 거 아냐?" — 불필요 결단. confirmation gate sub-agent 호환 ❌ + 결정론 axis 침범 위험 + YAGNI. v9.0+ MAJOR carry — `ticket-platform-router` (multi-platform abstraction) / `ticket-reconciler` (자동 idempotency loop).
>
> ### 신규 자산 (v8.6.3)
>
> - **`schemas/ticket-sync-evidence.schema.json`** — `mcp_invocations[].parent_ticket_id` (optional / 정책 의무) + `link_type` (enum `parent-child` / `relates-to` / `blocks` / `is-blocked-by` / default `parent-child`)
> - **`schemas/traceability-matrix.schema.json`** — `ticket_ref.structure_complete` boolean + `structure_tree_url` (format=uri) + `epic_id` / `initiative_id` minLength 1 + description v8.6.3+ 의무 명시
> - **`skills/ticket-sync/SKILL.md`** — `mcp__wiki-jira-assistant__jira_structure_add_issues` + `jira_structure_get` allowed-tools 추가 + phase=exit analysis 끝 step #5 jira_structure_add_issues (Initiative tree) + planning step 1-6 parent_ticket_id= 명시
> - **`methodology-spec/ticket-policy.md`** — §Tier 2.5 "Hierarchy 의무 (v8.6.3+ 구조 강제)" subsection 추가 (4 layer 동시 강제 / parent 의무 매트릭스 / F-TICKETSYNC-002 finding 정의)
>
> ### car 도메인 ticket 수 영향
>
> v8.6.2 = 82 ticket / **v8.6.3 = 82 ticket 동일** (hierarchy 강제 = 메타 강제만 / ticket 폭증 ❌) + `jira_structure_add_issues` 1회 호출 (Initiative tree / per release cycle).
>
> ### 회귀
>
> - schema-validator: 89 → **95/95 pass** (+6 v8.6.3 hierarchy test — parent_ticket_id Story→Epic + Sub-task→Story + link_type enum reject + link_type=relates-to valid + structure_complete valid + structure_tree_url uri reject)
> - chain-driver hooks-bridge: 15/15 유지
> - 기존 ticket-sync evidence / traceability matrix sample 영향 0 (parent_ticket_id / link_type / structure_complete / structure_tree_url 모두 optional schema-side)
> - backward compat = default link_type=parent-child (기존 R20 호출 무영향)
>
> ### Lessons Learned (v8.6.3)
>
> - **LL-R20-03**: ticket 구조 강제 = (1) policy 문서 (2) schema field (3) skill MCP call (4) finding emit **4 layer 동시** 의무 — 중 어느 하나만 빠지면 결정론 axis 침범
> - **LL-R20-04**: ticket-manager sub-agent 도입 결단 = confirmation gate 호환성 / 결정론 axis 두 axis 동시 통과 의무 — v9.0+ MAJOR charter review 시점 (confirmation 완화 결단 + multi-platform 결단 함께)
>
> ### 결단 출처
>
> - DEC-2026-05-18-r20-mcp-ticket-sync-channel §v8.6.3 PATCH 확장 section (B/C 대안 비교 + 신규 자산 + Lessons Learned)

---

## [8.6.2] — 2026-05-18 PATCH — R20 phase=enter 확장 (stage 진입 시 의무 작업 Task 1개 / analysis-planning = 도메인 단위 / spec-test-implement = per UC 단위) + enter Task 자동 종결 (phase=exit 시) + traceability-matrix `enter_task_ids` (additive / breaking 0)

> **v8.6.2 PATCH — R20 phase=enter 확장**. 사용자 "단지 티켓 따는것 뿐아니라 각 단계에서 일감을 따는 부분도 필요하다" → R20 channel 안에 stage **진입 시점** 동작 추가 (R20 기존 = 종료 시점만 / phase=exit). 의도 = "오늘 무엇 할지 Jira dashboard 만 봐도 가시화".
>
> 본 release = R20 channel 의 phase × stage matrix 확장 — **phase=enter (stage 진입 시 의무 작업 Task 1개)** + **phase=exit (기존 결과 batch + enter Task 자동 종결)**. default phase=exit (backward compat).
>
> ### 신규 자산 (v8.6.2)
>
> - **`schemas/ticket-sync-evidence.schema.json`** — `phase` enum (enter/exit) optional + `uc_id` pattern (phase=enter + stage ∈ spec/test/implement 시 의무)
> - **`schemas/traceability-matrix.schema.json`** — `ticket_ref.enter_task_ids` optional (analysis/planning/spec/test/implement 별 enter Task id)
> - **`skills/ticket-sync/SKILL.md`** — `phase` / `uc_id` / `issuetype_enter` 파라미터 추가 + phase=enter MCP call matrix (5 stage) + phase=exit 에서 enter Task 자동 종결 path
> - **`methodology-spec/ticket-policy.md`** — §Tier 2.5 자동화 행동 = phase × stage matrix 재작성 + car 도메인 ticket 수 예시 (R20 기존 59 → R20 + A 확장 82)
>
> ### 회귀
>
> - schema-validator: 83 → **89/89 pass** (+6 phase=enter test — analysis/spec valid + uc_id pattern + phase enum + enter_task_ids valid + unknown key reject)
> - chain-driver hooks-bridge: 15/15 유지
> - 기존 ticket-sync evidence / traceability matrix sample 영향 0 (모든 신규 field optional)
> - backward compat = default phase=exit (기존 R20 호출 무영향)
>
> ### 대안 비교 (B/C 결단 외)
>
> | 옵션                                             | 채택 | 사유                                                              |
> | ------------------------------------------------ | ---- | ----------------------------------------------------------------- |
> | **A. phase=enter stage 진입 시 의무 작업 Task ** | ✅   | 충돌 0 / ticket 폭증 ❌ / Jira dashboard 가시화                   |
> | B. continuous emit (UC 1개당 즉시 Story)         | ❌   | 결정론 axis 침범 + plugin TaskCreate 와 중복 + confirmation 과다  |
> | C. BHV/AC/TC/IMPL 별 ticket                      | ❌   | ticket-policy.md §6 결단 위반 + 폭증 + artifact/process 영역 혼합 |
>
> ### car 도메인 ticket 수 (예시)
>
> - R20 기존 (59) = 1 Initiative + 23 Epic + 7 Story + 28 Sub-task
> - **A 확장 추가 (+23) = +2 (analysis/planning 도메인 단위) + +21 (spec/test/implement × 7 UC)**
> - 합계 = **82 ticket** (car 도메인 7 UC 완주 시)

---

## [8.6.1] — 2026-05-18 MINOR — charter R20 신설 (MCP Ticket Sync Channel / Tier 2.5 — MCP delegation only / R16·R17 부활 ❌ — 신규 채널) + `ticket-sync` skill + 7-field evidence schema + `traceability-matrix.ticket_ref.status_history` + PreToolUse `mcp__wiki-jira-assistant__.*` deny-when-blocked (additive)

> **v8.6.1 MINOR — R20 신설 (MCP Ticket Sync Channel)**. 사용자 "내가 만약에 티켓을 우리 일감과 연동한다고 할때 티켓은 어느시점에 따지는게 맞나? 아니면 각 시점 마다 별도로 따는게 맞나?" (Tier 1 정책 v8.6.0+ 04bd0a1) → "지금 이 티켓 정책도 우리 플러그인의 정책으로 넣을 수 있나?" → "각 단계가 끝날때 마다 상태가 바뀌도 하고 신규 티켓이 생기기도 해야 해 거기에 맞는 방법이야?" → "나는 jira-confluence mcp 가 있고 이를 이용하고 싶어. 결국 뭔가 동작전에 물어보면 되는거 아닌가?" 결단.
>
> 본 release = charter R20 신설 — **Tier 2.5 (MCP delegation)**. R16/R17 부활 ❌ (DEC-2026-05-15-g1-itsm-permanent-scope-out §31 path "별도 charter 요구 신설 (R18+) — R16/R17 부활 ❌" 정합 = 신규 채널 R20). Tier 3 (자체 platform adapter) = v9.0+ carry.
>
> ### 신규 자산
>
> - **`decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md`** — R20 신설 결단 + 비용/가치 재평가 (MCP 위임 비용 매우 작음) + Tier 분리 (Tier 2.5 vs Tier 3) + R15 / R16/R17 정합 점검
> - **`schemas/ticket-sync-evidence.schema.json`** — 7-field evidence (`tool_stdout_path` / `tool_stderr_path` / `tool_version` / `invocation_timestamp` / `duration_ms` / `result_hash` / `reproduction_command`) + `evidence_trust` enum `real_tool|imported_sarif` (simulated 영구 거부) + `confirmation_log_ref` + `mcp_invocations[]`
> - **`skills/ticket-sync/SKILL.md`** — 5 stage matrix (analysis/planning/spec/test/implement) + 사용자 confirmation gate (preview MD → yes/no/dry-run halt) + sequential MCP 호출 (결정론 보호) + search-first idempotency (`jira_search` JQL by UC-\*) + graceful MCP-missing (silent skip + `F-TICKETSYNC-001` finding)
> - **`tools/schema-validator/test/ticket-sync-evidence.test.js`** — 회귀 test ≥6 (status_history monotonic / evidence_trust enum strict / dry_run vs real_tool 분리)
> - **`schemas/traceability-matrix.schema.json`** `matrix.items.ticket_ref.status_history[]` optional 신설 (transitioned_at / from_status / to_status / mcp_tool / evidence_ref)
> - **`hooks/hooks.json`** PreToolUse matcher 에 `mcp__wiki-jira-assistant__.*` 추가 (state.blocked 시 MCP deny / `tools/chain-driver/src/hooks-bridge.js::buildBlockOutput` 재사용)
> - **`methodology-spec/plugin-charter.md`** §1 R20 entry / §2 R20 매핑 / 요약 17/17 → 18/18 활성 / 헤더 R20 v8.6.1 신설
> - **`methodology-spec/ticket-policy.md`** Tier 2.5 (MCP delegation) section 신설 / R20 reference / Tier 3 carry 명시
> - **`methodology-spec/id-conventions.md`** §Ticket Binding — status_history example 추가
>
> ### 사용자 결단 5건 (실 사용 시점)
>
> 1. Jira workflow transition target IDs (project-specific / `jira_transitions` 사전 lookup)
> 2. Confluence emit 범위 (Initiative overview default v8.6.1 / per-stage 보고서 page = v8.7.0+ Tier 2.6 후보)
> 3. Auto-invoke 정책 — auto-suggest (confirmation gated) 권고
> 4. Idempotency — search-first 권고
> 5. MCP 미연결 — silent skip + finding emit 권고
>
> ### 사용자 묶음 결단
>
> - 자동화 강도 = **B+A hybrid → MCP 위임으로 변경 (Tier 2.5)** — 비용 (자체 adapter) 회피 + 사용자 환경 MCP 활용
> - Platform = `mcp__wiki-jira-assistant__*` 가정 (사용자 보유 MCP)
> - Confirmation = 모든 호출 직전 사용자 OK 의무

---

## [8.6.0] — 2026-05-18 MINOR — Runtime/JVM 의존 도구 plugin 환경 제외 + charter R19 신설 + SARIF import 4 조건 schema-level 강제 + evidence_trust 3-tier + chain-strict mode 격상 (additive)

> **v8.6.0 MINOR — R19 신설 (Tool Ecosystem Dependency Classification)**. 사용자 "코드 분석에서 런타임 분석이 필요한 툴들은 안쓸거야" → "java runtime 이 필요한것도 못쓸거 같은데?" → "이렇게 해줘" 결단 + Senior STRONG-STOP signal 전면 흡수 (5 concerns / confidence 0.84).
>
> 본 release = charter R19 신설 — **Tier 1 (in-plugin native: Semgrep / Spectral) + Tier 2 (사용자 환경 SARIF import: PMD Java 8 or above / SpotBugs JRE 11+ / CodeQL / Daikon) + Tier 3 (simulated 영구 reject)**. 4 조건 schema-level 강제 (driver allowlist + non-empty results 또는 non_use_rationale + reproduction_command + evidence_trust enum).
>
> ### 신규 자산
>
> - **`tools/static-runner/src/runner.js` `importSarif` 함수** — R19 Tier 2 흡수 / 4 조건 schema-level reject (`ImportSarifRejected` 신규 error class / driver allowlist `[pmd, spotbugs, codeql, daikon]` / empty results without rationale reject / driver mismatch reject / reproduction_command 의무)
> - **`tools/static-runner/src/cli.js`** `--import-sarif` / `--import-driver` / `--reproduction-command` / `--non-use-rationale` flag + exit 4 (`ImportSarifRejected`) 신설
> - **`EVIDENCE_TRUST` enum** — `real_tool` / `imported_sarif` / `simulated` 3-tier
> - **`IMPORTED_DRIVER_ALLOWLIST`** — PMD/SpotBugs/CodeQL/Daikon 4 한정 (대소문자 무관)
> - **`tools/chain-driver/src/gate-eval.js`** implement stage `simulated_evidence_count > 0` block 신규 (chain-strict mode 격상)
> - **charter R19 신설** (`methodology-spec/plugin-charter.md` §1 + §2)
> - **11 신규 import-sarif test** (`tools/static-runner/test/runner.test.js` 15→26)
>
> ### 정정 / sweep
>
> - **PMDPlugin in-plugin 제거** (Java 8 or above JVM 의존 / plugin 환경 비현실)
> - **`tools/static-runner/package.json` description** — R19 Tier 1+2 명시 / 7 evidence + evidence_trust 3-tier
> - **`tools/static-runner/README.md`** 전면 개정 (Tier 1/2/3 + 4 조건 + exit code 4 + custom rule)
> - **agents 4 sweep** — analysis-agent / implement-agent (line 33+58) / spec-agent / \_base-senior-engineer
> - **skills 5 sweep** — analysis-aspect-static-security / analysis-formal-spec-validation / \_base-apply-baseline-ratchet / implement-generate-impl-spec / (analysis-html-template + test-verify-coverage = 원래도 외부 도구 의무 명시 / 무수정)
> - **methodology-spec 5 sweep** — plugin-charter (R19) / lifecycle-contract (line 69+72+338) / deliverables/21-impl-spec (line 58) / deliverables/12-static-security-spec (line 106) / workflow/formal-spec (line 141)
> - **ADR patch** — ADR-009 §2.1 단계 5 + §2.2 도구 종류 표 + 변경 이력 / ADR-010 변경 이력
> - **`tools/_shared/baseline.js` + `tools/static-runner/src/sarif-to-finding.js`** 주석 정정 (Tier 1+2 통합 어댑터)
> - **`tools/spectral-runner/README.md` + `tools/README.md` + `README.md` (root)** sibling 인용 정합
>
> ### 4원칙 ladder full
>
> - **1원칙 plan**: `.claude/plans/plan-runtime-tool-exclusion.md` (§1-9 본 plan + §10 Senior 5 concerns 흡수 patch)
> - **2원칙 research (lightweight 2-agent)**: F-015 official-docs check (sub-agent `_base-official-docs-checker` / 6/6 1차 출처 verbatim / VERIFIED-IDENTICAL 4 + WITH-DELTA 2 / load-bearing 정정 1건 PMD = **Java 8 or above** / 잔여 carry 4건 LL-rte-01~05) + Senior critique (sub-agent `_base-senior-engineer` / **REVISE-5 + STRONG-STOP signal 1건** SARIF import 우회 표면 / 5 concerns / confidence 0.84)
> - **3원칙 사용자 묶음 결단**: 2 cluster 7/7 추천 채택 (Option A + MINOR + 2-agent + ADR patch / 전면 흡수 + PMD 정정 + R19 신설)
> - **4원칙 시행**: Senior 5 concerns 전면 흡수 (additive / breaking 0)
>
> ### Senior 5 concerns 전면 흡수 결과
>
> 1. **SARIF import 4 조건 schema 강제** — driver allowlist + non-empty results 또는 non_use_rationale + reproduction_command + evidence_trust 3-tier ✅
> 2. **(P1)+(P2) 결합 명시** — "JVM 의존 = plugin scope 외" 솔직 격하 + "사용자 환경 SARIF import 패턴" 명시 ✅
> 3. **인용 13곳 동반 sweep** — agents 4 + skills 5 + methodology-spec 5 = 14 sweep (skill-citation-validator dead-link 차단 회피) ✅
> 4. **charter R19 신설** — R18 §5 patch ❌ / sub-axis evolution paradigm 정합 (plugin-authoring axis ≠ tool-ecosystem axis) ✅
> 5. **evidence_trust 3-tier + chain-strict mode 격상** — gate-eval.js `simulated_evidence_count` block 신규 ✅
>
> ### STOP-3 hard gate
>
> | 검증                                                        | 결과                                           |
> | ----------------------------------------------------------- | ---------------------------------------------- |
> | `npm test --workspaces`                                     | **424/424 pass** (414 + import-sarif 10 신규)  |
> | `static-runner` 단독 test                                   | 26/26 pass (15 + 11 신규 import-sarif test)    |
> | `chain-driver` 단독 test                                    | 114/114 pass (gate-eval.js 변경 후 회귀 0)     |
> | `release-readiness.js`                                      | 13/13 ready:true                               |
> | `drift-validator` 3-way (flow/schema/template)              | clean                                          |
> | `skill-citation-validator` (47 SKILL.md + repo-wide active) | 0 stale                                        |
> | `version-check` 3-way                                       | plugin.json + package.json + CLAUDE.md = 8.6.0 |
> | F-021 임계                                                  | ≤ 15 caution band                              |
>
> ### 잠재 함정 회피 (Adzic SBE 10년 폐기 함정 정공법)
>
> - 시뮬 ❌ + 실 사용자 환경 의무 = 본 결단의 본질
> - evidence_trust 3-tier = Tier 1 (in-plugin 실 실행) / Tier 2 (사용자 환경 실 실행 + import) / Tier 3 (영구 reject)
> - SARIF 4 조건 schema 강제 = 우회 표면 결정적 차단
> - 양심 의존 0 / chain-strict mode trio (state.blocked + cli exit 4 + PreToolUse deny) 정합
>
> ### 10 LL 자산화
>
> - **LL-rte-01** Semgrep install = `pipx install semgrep` (`pip install` ❌ — PEP 668 격리)
> - **LL-rte-02** Spectral AsyncAPI = v2.x 한정 명시 (v3 미지원 / Arazzo v1.0 자산 추가)
> - **LL-rte-03** SARIF = 2.1.0 Plus Errata 01 (OASIS Standard 28-Aug-2023) 정밀 표기
> - **LL-rte-04 load-bearing** F-015 시 사실 정정 의무 — PMD = "Java 8 or above"
> - **LL-rte-05** SPA docs WebFetch fail → fall-back cascade carry
> - **LL-runtime-tool-01** charter R 신규 시 plugin-authoring (R18) ↔ tool-ecosystem (R19) axis 분리 의무
> - **LL-runtime-tool-02** evidence_trust 2-tier → 3-tier 격상 의무 (Adzic 함정 회피)
> - **LL-runtime-tool-03** F-015 load-bearing 정정 발견 시 결단 본질 재평가 의무
> - **LL-runtime-tool-04** 사전 배포 + 사용자 0 → breaking 자격 약함 / "additive primary signal" 우선
> - **LL-runtime-tool-05** SARIF import `results=[]` reject 의무 / `non_use_rationale` 첨부 시 허용
>
> ### 잔여 carry (v8.7.0+)
>
> - LL-rte-05 — plugin-authoring-spec §6 SPA fail cascade 보강
> - LL-rte-02 — Spectral AsyncAPI v2.x sweep 보강
> - import SARIF `duration_ms` 환산 보강
> - Tier 2 import 패턴 외부 적용 입증 (사내 CI 실 실행 + SARIF import 시연)
>
> tier = MINOR (additive — import 패턴 신설 + R19 charter 신설 + evidence_trust 신규 + chain-strict mode 격상 / 기존 의무 제거 0 / breaking 0). DEC-2026-05-18-runtime-tool-exclusion. Amends DEC-2026-04-29-static-tool-실행-의무화.

---

## [8.5.0] — 2026-05-18 MINOR — F-SKILL P1 8 finding batch + plugin-authoring-spec §2 S2 강화 + §6 digest baseline refresh (additive)

> **v8.5.0 MINOR — L3 audit P1 batch corrective sweep**. 사용자 "A. P1 9 finding batch (v8.5.0 MINOR / 권장)" → "진행 해줘" 시행.
>
> **4원칙 ladder full**:
>
> - 1원칙 `plan-v85-p1-batch.md` (lay-of-the-land 후 9 finding 정밀 scope + 시행 순서)
> - 2원칙 2-에이전트 lightweight research (`_base-official-docs-checker` F-015 + `_base-senior-engineer` critique / 산업 비교 skip)
> - 3원칙 사용자 묶음 결단 3 cluster (F-SKILL-016 ABORT / F-SKILL-001 Option A + F-SKILL-020 A only / 즉시 release cadence)
> - 4원칙 N/A (실패 0)
>
> **critical research finding**: `_base-official-docs-checker` F-015 cross-check on `disable-model-invocation: true` = Claude 의 모든 invoke 경로 차단 ("Claude can invoke: No") → chain harness body 호출 차단 가능성 높음 → **F-SKILL-016 ABORT → P2 carry** (사용자 결단). 안전한 대안 = `user-invocable: false` (REVISE-2 carry).
>
> **시행** (additive / breaking 0 / 8 finding closed + 1 ABORT):
>
> - **F-SKILL-001** (medium / closed) — `analysis-domain-model:41` + `analysis-business-rules:52` business-logic.md anchor 정정 Option A (§5 4영역 병렬 + 실 매핑 명시 / domain = §5.A ORM + §5.B FE / rules = §5.A SQL + §5.B FE validation + §5.C 매직 넘버)
> - **F-SKILL-003** (low / closed) — 4 analysis-\* descriptions (`architecture` + `domain-model` + `source-inventory` + `business-rules`) Korean trigger keywords 추가
> - **F-SKILL-007** (low / closed) — `_base-apply-template:20` "19 templates" → "21 templates" + drift recurrence carry note (LL-v85-01)
> - **F-SKILL-010** (low / closed) — `analysis-quality-antipattern` + 4 sub-skills (`planning-decompose-use-cases` + `planning-identify-business-intent` + `spec-derive-acceptance-criteria` + `spec-integrate-deliverables`) NL trigger phrase 추가
> - **F-SKILL-013** (low / closed) — `analysis-db-schema-erd` 사전조건 inventory.json 추가 (analysis-\* family consistency)
> - **F-SKILL-016** (low / **ABORT → P2 carry**) — F-015 cross-check ABORT 권장 / `user-invocable: false` REVISE-2 carry
> - **F-SKILL-017** (low / closed) — `plugin-authoring-spec.md §2 S2` per-field description ≤ 1,024 char cap 추가 (best-practices)
> - **F-SKILL-018** (low / closed) — `§6` skills + plugins pinned_guidance_digest 갱신 (DELTA-1 `${CLAUDE_EFFORT}` + DELTA-3 1024c + DELTA-4 third-person + DELTA-5 one-level + DELTA-2 root-level SKILL.md) + **`digest_sha` 재계산** (skills `b8b2376312b0` → `e2b44d9d0e53` / plugins `b0e11058b05e` → `4498207cc547`)
> - **F-SKILL-020** (low / closed / A only) — `§2 S2` third-person POV sub-rule 추가 (audit ~25 skill wording 은 P2 carry)
>
> **차기 session carry surface**:
>
> - **F-SKILL-016 REVISE-2** = `user-invocable: false` 검토 + plugin runtime smoke test (P2 carry)
> - **F-SKILL-020 후속** = ~25 skill descriptions 본격 wording audit (P2 carry / 별도 cooling-off)
> - **F-SKILL-007 drift 재발 방지** = templates/analysis/ enumerated count drift attractor (LL-v85-01 / plugin-authoring-spec sub-rule 후보 P2)
> - **v9.0 charter review carry 3종** = F-021 임계 v2 + skill-citation-validator recursive drift + F-SKILL-024 meta `_base-*` drift attractor
>
> **STOP-3 9-gate**: workspace 414/414·release-readiness **13/13 ready:true**·skill-citation-validator 207 active doc 0 stale·drift-validator 3-way·version 3-way 8.5.0·CLAUDE.md plugin.json v8.5.0·digest_sha 4/4 일치 (재계산 검증)·`_base-` 8 allowlist 변경 없음·description 단독 ≤ 1024 char (47/47 / 변경 없음).
>
> **classification = MINOR (additive / breaking 0 / digest recompute + methodology body change)**: skill body·frontmatter·plugin-authoring-spec §2 + §6 모두 additive (S2 추가 sub-rule + §6 digest 확장 / 기존 의무 제거 0). 산출물 schema·command-surface·산출물 파일명 변경 0.
>
> DEC-2026-05-18-v85-p1-batch.

---

## [8.4.1] — 2026-05-18 PATCH — 47 SKILL.md L3 품질 감사 + P0 3 finding 즉시 fix + F-SKILL namespace 신설

> **v8.4.1 PATCH — L3 skill audit corrective sweep**. 사용자 "나의 스킬들을 분석해 보고 싶다" → 축 "품질 감사 (citations / drift / SSOT)" → 깊이 "L3 + 산업 비교" → Plan A (report only) → 사용자 "진행 해줘" 시행 escalation.
>
> **L3 audit 산출**:
>
> - 6 sub-agent 병렬 dispatch (B-shard 1~4 / 329 cell × 7 axis × 47 skill / `_base-official-docs-checker` F-015 / `_base-industry-case-researcher` N=3 OSS) + `_base-senior-engineer` D7 synthesis.
> - 산출: `.claude/plans/audit-skill-l3-report.md` (사용자 검토 entry-point) + 5 supporting deliverables (`B-shard-1~4.md` + `C-official-docs.md` + `C-industry-case.md` + `D-senior-conscience.md`) + `plan-skill-l3-audit.md` methodology.
> - **24 unified F-SKILL findings** (31 CAND → 24 + 3 NOT-A-FINDING + 1 Senior gap-find F-SKILL-024 meta). severity 분포: medium 4 / low 11 / info 9. 8 ≥ 2 shard corroboration ✓ / 8 within-shard multi-site / 7 single-source spec-authority. Senior GO @ 0.86 conf.
>
> **P0 3 finding 즉시 시행 (additive / breaking 0 / 12 sites edited)**:
>
> - **F-SKILL-002** (medium / ghost-taxonomy) — `_base-log-finding/SKILL.md:15` 가 AP-RENDER/AP-FETCH/AP-A11Y/AP-i18n/AP-STATE 인용 / 실 examples/ 안 occurrences = 0 / `id-conventions.md` §3 canonical 9 카테고리 정합 ❌. **scope 확장 corroboration**: `analysis-quality-antipattern:18` (5 ghost prefix) + `analysis-aspect-a11y:27` (1 ghost prefix) = 3 skill 통합 fix. 실 PoC #04 사용 패턴 `AP-FE-{SUB}-NNN` (44 occurrence) 정합.
> - **F-SKILL-004** (medium / `_base-` prefix citation drift) — `analysis-input-collection/SKILL.md:14, :55` bare `apply-baseline-ratchet` → `_base-apply-baseline-ratchet` (2 sites / skill-citation-validator v8.1.1 bare-name resolver 사각 표면화).
> - **F-SKILL-005** (medium / slash↔dash citation form) — 7 file × 9 site 가 `_base/<name>` slash form → `_base-<name>` dash form 정규화. Senior 가 5 chain skills 보고 / 실 grep 추가 2 `_base-*` self-cite 확인.
>
> **F-SKILL namespace 신설** — `methodology-spec/finding-system.md` 에 L3 audit 24 finding 등재 (F-SIM/F-PA/F-MB 패턴 정합 / SSOT 표 + P0 closed + P1/P2 open carry).
>
> **본 audit 핵심 발견 surface (사용자 결단 필요 carry)**:
>
> 1. **F-021 임계 unhealthy** (24 ≥ 20) — 단 actionable = 15 (caution band) / Phase reset ❌ / plugin-authoring-spec S1~S8 maturity signal → v9.0 charter review carry.
> 2. **skill-citation-validator coverage gap** (F-SKILL-001 + 004 + 005 root) — v8.1.0 validator 가 anchor §X.Y 의미 drift + `_base-` prefix bare-name mask + slash↔dash 모호 3 class 미 catch / **validator 자기 motivation class 자기 표면 안 재발 = recursive drift** / v9.0 의제.
> 3. **F-SKILL-024 meta (Senior gap-find)** — `_base-*` documented-exception 이 drift attractor (F-SKILL-004+005+015 공통 root = §8-2 frozen allowlist convention) / v9.0 charter-level 결단 (canonical rename OR validator-level normalization).
>
> **STOP-3**: workspace 414/414 ✓ + release-readiness **13/13 ready:true** for v8.4.1 ✓ + skill-citation-validator 207 active doc 0 stale ✓ + drift-validator 3-way ✓ + 12 site edited / breaking 0.
>
> **차기 session 권장 cadence**:
>
> - **v8.5.0 MINOR** = P1 9 finding (F-SKILL-001+003+007+010+013+016+017+018+020) + plugin-authoring-spec §2 S2 강화 + §6 pinned digest 갱신 (`${CLAUDE_EFFORT}`) + `digest_sha` 재계산.
> - **P2 12 finding (별도 cooling-off 24h)** = 각 별건 plan / F-SKILL-024 = v9.0 charter review.
>
> **classification = PATCH (additive / breaking 0)**: 12 site edited 모두 citation 정합 corrective + namespace 신설 (additive) / 산출물 schema·command-surface·산출물 파일명 변경 0.
>
> DEC-2026-05-18-skill-l3-audit-p0-corrective.

---

## [8.4.0] — 2026-05-18 MINOR — F-SIM corroboration #2 attained (poc-14 external-user simulation / P1 deadline 14d 전 이행 / 패러독스 해소)

> **v8.4.0 MINOR — corroboration #2 + 외부 사용자 dogfood 일석이조**. 사용자 "시뮬레이션…빌드된 plugins / 기존 PoC ❌ / 사용자 시점 기록 / 사용 빈도+사용 못하는 경우" → plan `peaceful-dreaming-dragonfly.md` 작성·ExitPlanMode 승인 후 시행.
>
> **신설**: `examples/poc-14-fsim-corroboration/` (Python FastAPI 0.115 + SQLAlchemy 2.0 + Pydantic v2 + SQLite / ~319 LOC / 의도된 결함 3종 — AP-FSIM-SEC-001 critical / AP-FSIM-DATA-001 high / AP-FSIM-AUTH-001 medium). poc-05 (TypeScript+vitest) 와 **stack 횡단** corroboration.
>
> **chain harness e2e RED→GREEN 완성**:
>
> - chain 0 (analysis): 산출물 + aspect 5종 (static-security blocked-by-env carry / 4 FE skill non-fire)
> - chain 1 (planning): `excluded_antipatterns: [AP-FSIM-SEC-001, AP-FSIM-AUTH-001]` (F-SIM-001 lane carry) — planning-extraction-validator 0 findings
> - chain 2 (spec): `AC.related_brs + related_aps` (F-SIM-002/004 propagation source) — chain-coverage-validator + F-SIM-001 lane severe AP=2 / uncovered=0
> - chain 3 (RED): pytest 7/7 fail (Beck-canonical compile-import / `result_hash sha256:e0608e`)
> - chain 4 (GREEN): pytest 7/7 pass / fail_count=0 / `commit_hash 8e83c6f` / `result_hash sha256:47dbad`
> - matrix: 4 rows / 4 green / `severity_propagation_active:true` / `business_rule_ids+antipattern_ids` populated
>
> **사용자 4 조건 충족 (사용자 시점 기록 3 산출)**:
>
> - `.aimd/simulation/invocation-log.md` (63 entry / 35분 sequential / element 발화 / hook+agent non-fire 표면)
> - `.aimd/simulation/element-frequency.json` (47 skill × stage × fire / 9 agent × dispatch / 17 tool × invoke / 3 hook × fire — 결정적 매트릭스)
> - `.aimd/simulation/non-use-rationale.md` (미 fire 16 skill + 9 agent + 3 hook + 10 tool / 9 category 분류)
>
> **F-SIM-011 패러독스 해소** (`flows/sdlc-4stage-flow.json` release_eligibility): #1/#2/#6/#7 `current_corroboration_count_at_required_strength` **1→2** (poc-05+poc-14) / `self_consistency_note` "패러독스 해소". DEC-2026-05-17 §4.1.2 P1 deadline (2026-06-01) **14일 전 이행**.
>
> **element coverage threshold 결과 (정직 표면화)**:
>
> - skills fire: 31/47 (66%) ✓
> - agents dispatch: **0/9 ✗** (Type 1 시뮬레이션 본질 한계 / F-SIM-13)
> - tools invoke: 7/17 (41%) ✗ (phase-simplified + plugin-self-change-only)
> - hooks fire: **0/3 ✗** (Type 1 한계 / Claude Code session 외)
>
> → Type 1 (main self-run) ≠ Type 2 (real Claude Code session). **Type 2 별도 시뮬레이션 carry** (F-SIM-13 자산화).
>
> **신규 finding 후보 5종 (F-SIM-12~16 / 등재 carry)**:
>
> - F-SIM-12 (medium): severity_distinct_count=1 (모든 AC must → cell critical / SSOT mapping 한계)
> - F-SIM-13 (medium): Type 1 시뮬레이션 한계 (hook+agent fire 0)
> - F-SIM-14 (low): analysis-form-validation-fe description "FE-only" — Pydantic BE schema validation cover ❌
> - F-SIM-15 (high): test-spec.fail_mode schema 미허용 (F-SIM-005 P1 carry — 본 시뮬레이션 시 schema 차단)
> - F-SIM-16 (low): static-runner Semgrep wrapper deprecated / Windows MSYS2 환경 fire ❌
>
> **STOP-3 9-gate**: 6.5 pass / 2 partial (F-SIM-12/13 표면화) / honest 결과. **release-readiness 13/13** ✓ + workspace 414/414 + drift 3-way + skill-citation 0.
>
> **classification = MINOR (additive)**: corroboration #2 = 사실 변경 / 정의 변경 아님 / breaking 0.
>
> DEC-2026-05-18-fsim-corroboration-2-attained / plan `peaceful-dreaming-dragonfly.md`.

## [8.3.0] — 2026-05-18 MINOR — chain harness e2e simulation audit + F-SIM-001/002/003/004/011 P0 corrective (additive / breaking 0)

> **v8.3.0 MINOR — additive corrective + industry-aligned**. 사용자 "시뮬레이션…모든 단계에서 목표 정합·비효율 확인" → 데스크 워크스루 감사 (no-simulation 정책 무충돌) / poc-05(reference cycle / §8.1 strict 7/7 #7) + poc-03(retrofit) cross-validation → 11 finding 도출 (**F-SIM-001~011 / Body Finding Ledger F-SIM namespace 신설**). 단일 PoC 특이 0 + 4 finding RealWorld 악화 = **방법론 구조 결함 확정**. 공통 뿌리 1개: "본 방법론은 _링크 존재_ 결정적 강제 / _링크가 비즈니스 사실 보존_ 미강제" — F-SIM-001/002/003/004/005 동일 뿌리.
>
> **P0 시행 (사용자 "권고안 그대로 시행" 2026-05-18 / 9 결단 묶음 D1~D9)**:
>
> - **F-SIM-002**: `tools/traceability-matrix-builder/src/builder.js:56,67,77` 의 single-axis MoSCoW 종속 폐기 → **source-grounded max-propagation** (`deriveCellSeverity({ac, brs, aps})`). 권위 ISO 26262 Part 9 ASIL inheritance + IEC 62304 Class A/B/C propagation (F-015 Claim B / DMN 약함 — 인용 교체). SSOT `methodology-spec/severity-cross-stage-mapping.md` §2 정합. 신규 audit signal `coverage_summary.severity_distinct_count` + `severity_propagation_active`.
> - **F-SIM-004**: matrix cell 에 **`business_rule_ids[]`** + `antipattern_ids[]` 신규 1급 축 — DO-178C requirements axis 정합 (F-015 Claim A ). md 컬럼 + mermaid edge `BR --> BHV` 추가.
> - **F-SIM-003**: `tools/chain-coverage-validator/src/validator.js` 에 `validateCrossRefPaths` 신설 — `planning.derivation_source` / `cross_links` + `behavior.derivation_source` / `cross_links` 4 source 경로 resolve assert + 컨벤션(repo-absolute vs project-relative) 검증. **`--strict-paths` flag warn default** (LL-i-55 함정존 회피 / v+1 default 전환 carry).
> - **F-SIM-001**: `validateAntipatternCoverage` 신규 lane — critical/high AP 가 `AC.related_aps` 매핑 또는 `planning.excluded_antipatterns` carry 둘 다 부재 시 finding emit. **industry-aligned** SonarQube Sonar Way + GitHub CodeQL + Snyk (F-015 Claim E + industry case 3종 corroboration). gate #2 validators 에 추가.
> - **F-SIM-011**: `flows/sdlc-4stage-flow.json` `release_eligibility` 강화 — `corroboration_depth_levels` (L0/L1/L2/L3) 명시 + #1/#2/#6/#7 의 `corroboration_strength_required` + `current_corroboration_count_at_required_strength` + `p1_carry` 명시. **poc-03 격하 (L1 — chain 4 미도달)** + `self_consistency_note` ("v8.3.0 = 정의 강화 / 사실 미충족 패러독스 잔존"). **P1 deadline = 2026-06-01** (DEC §4.1.2 commit-block).
>
> **schema 신규 (additive / breaking 0)**:
>
> - `schemas/acceptance-criteria.schema.json` AC 에 `related_brs[]` (`BR-*` pattern) + `related_aps[]` (`AP-*` pattern) optional.
> - `schemas/planning-spec.schema.json` 최상위 `excluded_antipatterns[]` (`{ap_id, reason, decision_ref?}`) optional.
> - `schemas/traceability-matrix.schema.json` cell `business_rule_ids[]` + `antipattern_ids[]` optional + coverage_summary 신규 audit signal `severity_distinct_count` + `severity_propagation_active`.
>
> **§8.1 자기정합 ≥3 PoC pre-sweep (D9)**: poc-05(BE micro) + poc-03(BE RealWorld) + **poc-04-mini(FE)** = 3 PoC 동형 재현 BE+FE 횡단 . F-SIM-003 = BE 2 PoC (v7.0.0 collateral 특이 / FE all paths exist). LL-fsim-04 해소.
>
> **3-에이전트 research** (`.claude/researches/research-fsim-p0.md`): Senior critique GO 0.82 + D4/D7/D8 REVISE / Official-docs F-015 ×5 (1차 출처 독립 fetch — DO-178C+ISO 26262+Kent Beck+SLSA+CNCF+OpenSSF+SonarQube) / Industry-case 3 Topic × 3 Case = 9 case all industry-aligned 확인. 권위 H3 반증 = **F-SIM-005 ledger Beck-canonical 수정** (compile-import-fail = valid RED / per-TC granularity 잔존 본질).
>
> **self-bootstrap (#16 STOP-3)**: poc-05 = AC-USER-001 에 `related_brs`/`related_aps` 추가 + planning `excluded_antipatterns: [AP-USER-003]` carry + cross_refs `output/rules/business-rules.json` sync → `chain-coverage-validator` exit=0 / severe AP=2 / uncovered=0. matrix 재생성 — `business_rule_ids` + `antipattern_ids` populated + `severity_propagation_active:true`.
>
> **STOP-3 9-gate**: schema-validator (11 PoC 0-regression) / **workspace test 414/414** (395+ → 414 +19 신규 F-SIM test) / drift-validator 3-way (chain-flow detection-only / state-flow consistency / chain-layout passed) / **release-readiness 13/13 ready:true** (workspace_test_pass 포함) / version-check 3-way 8.3.0 / skill-citation 0 stale / antipattern-coverage lane self-bootstrap pass.
>
> **classification = MINOR (additive)** — 5 schema field 추가 (전부 optional / 11 PoC 0-regression) + 신규 validator lane 1종 (chain-coverage-validator workspace 일부 / 신 도구 ❌) + flow 정의 강화. breaking 0 / cooling-off 사용자 명시 위임 생략 (D6).
>
> **P1 carry (DEC commit-block 2026-06-01 deadline)**: F-SIM-005 (RED fail_mode enum) + corroboration #2 신규 PoC chain 4 GREEN. 미시행 시 release_eligibility 자기충족 패러독스 잔존.
>
> DEC-2026-05-17-chain-harness-e2e-simulation-audit / `.claude/plans/plan-fsim-p0.md` / `.claude/researches/research-fsim-p0.md` / Body Finding Ledger F-SIM-001~011.

## [8.2.3] — 2026-05-17 PATCH — 확장 감사(methodology-body deliverables/schemas/tools) + F-MB-001~009 corrective sweep (breaking 0)

> **v8.2.3 PATCH — corrective / non-breaking**. 사용자 "1,2,3 다하자 순서대로" → "전체 corrective sweep + 릴리즈". 확장 감사 = Area E deliverables 25 + Area F schemas 39 + Area G tools 18 = **82 단위** (L1 + L2 의미·claim accuracy + L3 §8.1·no-simulation / 8 sub-agent 배치 + ground-truth XV). **GREEN 74 / RED 8** (RED 전부 Area G tools README↔cli.js 문서 drift — 코드·테스트·no-simulation 전부 정상). Area E·F 구조 거의 완벽($id↔filename 0 불일치 / F-PA-009=singleton / $ref 0 broken). post-dedupe F-MB 9건 / F-021 band 5~15 "건강한 검증". finding-system.md Body Finding Ledger **F-MB namespace 신설**. DEC-2026-05-17-plugin-authoring-mb-audit / ADR-PLUGIN-001 §7 patch v7 + §8 LL-plugin-05.

### 감사 + 처분 (F-MB-001~009)

- **resolved 8**: F-MB-001(rules.json→business-rules.json 활성 DOC 표면 sweep — flows json+mermaid + guides + methodology-spec docs + deliverables 6 + schemas 2 / cross_links `to_artifact: rules`=logical 자산명 불변 ground-truth 적발 무변경) / F-MB-002(form-validation-spec·formal-spec BR-id 3-seg→canonical 4-seg / 0 PoC consumer + schema-validator 11 PoC 0-regression 입증) / F-MB-003(legacy-spectrum·static-security-spec property 키 `` 제거 / 0 consumer) / F-MB-004(chain-driver README exit 표 → cli.js 권위 / consumer-facing high) / F-MB-005(chain-coverage·schema-validator·test-impl-pass README exit 표 → cli.js header) / F-MB-006(decision-table·drift-validator·sql-inventory README 구현표면 보강) / F-MB-007(spec-test-link README finding-kind → validator.js emit 정합) / F-MB-008(test-impl-pass README src/adapters→src/runners)
- **deferred 1**: F-MB-009(tool src·test·scripts·PHASE-history `rules.json` literal = LL-i-55 함정존 / test fixture·migration script·역사기록 = blanket 시 release gate 자해 → 파일별 forensic 별건 revisit)
- **메타**: ground-truth-before-edit 가 재작업 1건 추가 차단 (cross_links `to_artifact: rules` = lifecycle-contract SSOT logical 자산명 불변 / sub-agent 과탐 = 3번째 위생 적발 / LL-plugin-04 재확인). Area F = F-PA-009($id) singleton 확인(나머지 38 정합).

### 회귀 (STOP-3 hard gate 전부 통과)

- 잔여 grep 0: safe-tier rules.json / -prefixed property key / 3-seg BR pattern
- skill-citation-validator finding 0 (207 active doc)
- release-readiness **13/13 ready:true** — analysis_validator_violation = **schema-validator 전 11 PoC pass** (F-MB-002 패턴 tighten + F-MB-003 -key rename PoC 회귀 0 결정적 입증) + workspace 395+ + drift-validator 3-way (flows json+mermaid 정합) + version-check 3-way 8.2.3
- P2′ 판정 = **PATCH** — F-MB-002/003 = schema-contract touch 이나 0-consumer 검증 + canonical 정렬(corrective) + schema-validator 전 PoC 0-regression 결정적 입증 → F-PA-009($id 정합 PATCH) 선례 동형 / semver inflation 회피 / 나머지 전부 doc-corrective. breaking 0.

---

## [8.2.2] — 2026-05-17 PATCH — plugin-authoring 4영역 파일별 품질 감사 + L2 인용 drift corrective sweep (F-PA-001~010 / breaking 0)

> **v8.2.2 PATCH — corrective / non-breaking**. 사용자 "각 영역 별 파일별 품질 검증" → plugin-authoring 4영역 60 단위(47 SKILL.md + 9 agents + README + hooks.json + 2 manifests) 파일별 감사(L1 규칙 + L2 의미·claim accuracy + L3 §8.1·no-simulation / 10 sub-agent 배치 + XV 독립 재검증). **L1 구조 60/60 PASS** — 결함 전부 **L2 인용 drift**(근본원인 = v7.0.0 rules.json·v8.0.0 skill rename·v5~6 BR schema rename 후속 전파 누락). post-dedupe finding 10건 (F-021 band 5~15 "건강한 검증" / 명세 부실 ❌). 사용자 "진행" → corrective sweep 시행. DEC-2026-05-17-plugin-authoring-file-audit / ADR-PLUGIN-001 §7 patch v6 + §8 LL-plugin-04.

### 감사 + 처분 (finding-system.md Body Finding Ledger F-PA 신설 namespace)

- **resolved 8**: F-PA-001(spec-compose-behavior-spec:53 dead skill명 `integrate-deliverables`→`spec-integrate-deliverables`) / F-PA-002(13 SKILL.md + **5 workflow SSOT doc** rules.json→business-rules.json / 3-step 안전치환) / F-PA-003(5 chain skill ADR-CHAIN-001 §3↔§6 인용 정정) / F-PA-004(analysis-business-rules inline 예제 canonical) / F-PA-005(implement-react/vue 거부키 react/vue_version → 실재 schema 필드 `modules[].framework` redirect / schema 무변경) / F-PA-006(analysis-architecture·domain-model 산출물 N off-by-one) / F-PA-008(hooks-bridge buildBlockOutput `hookEventName` 추가 / additive optional) / F-PA-009(business-rules.schema.json `$id` 정합 / $ref 의존 0)
- **wontfix 2**: F-PA-007(skill 인용 정확 / stale = ADR 파일명 immutable-history) / F-PA-010(design-agent 의도된 placeholder)
- **메타 가치**: 기존 skill-citation-validator(check #13)가 "본문·CLI 예제 내 맨 artifact 파일명" drift 를 구조적으로 못 보는 사각을 본 감사 L2 가 메움. ground-truth-before-edit 가 재작업 2건 차단(FP-1 `_base-apply-template` 1차 RED 오탐 / F-PA-007 1차 오진).

### 회귀 (STOP-3 hard gate 전부 통과)

- 잔여 grep **0**: standalone rules.json(skill+workflow) / §6-no-sim·§3-test-type miscite / react·vue_version 의무 / integrate-7대
- skill-citation-validator **finding 0** (207 active doc / 자가 회귀 1건 — ledger 내 죽은 `*.schema.json` 토큰 — 발견 즉시 비리터럴화 교정)
- release-readiness **13/13 ready:true** (workspace test 395+ pass / chain-driver hookEventName 변경 무회귀 / validators·analysis·citation green) + drift-validator 3-way 불변
- breaking **0** = PATCH (doc-corrective + schema $id 정합($ref 의존 0 / CHANGELOG v7.0.0 미완 보정) + chain-driver additive optional)

---

## [8.2.1] — 2026-05-17 PATCH — §8-2 `_base-*` documented-exception 종결 (backlog 잔여 0 / Senior GO 0.88 / F-015 = nominal not functional)

> **v8.2.1 PATCH — corrective·additive / non-breaking**. 사용자 "b 하고 a 진행" — briefing deck 버전 drift(v5.0.0→v8.2.0·387→395·11/11→13/13·15/15→16/16·16→17종) 정리 후 plugin-authoring-spec §8-2 backlog 2번 결단. v8.2.0 F-015 ×5 재검 완료 = §8-2 trigger 충족 → `_base-*` skill5+agent3 rename(v9.0.0 MAJOR / ~195 occ·70 file / 0 functional gain) vs documented-exception. 실 F-015(공식 charset verbatim 확인 / violation enforcement·`_`-prefix 거동 **미문서화** = nominal not functional) + Senior GO 0.88 → **documented-exception**. §8 backlog 잔여 **0**. DEC-2026-05-17-base-prefix-documented-exception / ADR-PLUGIN-001 §7 patch v5 + §8 LL-plugin-03.

### 종결 (§8 backlog 2번 / S3·A1 ⚠️→✅)

- **§7 매트릭스** `_base-*` 행 ⚠️→✅ (documented-exception) + 결론 "§8 backlog 잔여 0".
- **§8-2 명세** — 영구 grandfather = 정확 8 frozen allowlist (skill 5: log-finding·apply-template·build-traceability-matrix·apply-baseline-ratchet·invoke-go-stop-gate / agent 3: official-docs-checker·senior-engineer·industry-case-researcher).
- **Senior 필수 guardrail 1** — §9 skills digest 가 enforcement-strength encode (charset 문자열뿐 아니라 "violation 거동 미문서화 = advisory-consistent / hard-enforce 전환 시 차기 F-015 CONTRADICTS tripwire"). digest 변경 → skills `digest_sha` 재산출 ea06dc97470e → b8b2376312b0 (v8.2.0 digest_sha 메커니즘이 자기 변경 STALE 검출 = 1 release 만에 자기 dogfood 실효).
- **Senior 필수 guardrail 2** — release-readiness check #12 = `_base-` 자산 정확 8 allowlist 결정적 assert (9번째 = fail / 예외 loophole 화 차단 / 신규 non-`_base`=S3 ratchet). check #12 내부 강화 (신 check ❌ / 13 유지).
- **release-readiness.test.js** — `_base-` allowlist case 신설 + readdirSync import.

### 회귀

release-readiness 13/13 (check#12 = §6 4행 ≤60d + digest_sha 4행 일치 incl 재산출 skills b8b2 + `_base-` 8 allowlist) · skill-citation 0 stale · version-check 3-way 8.2.1 · workspace green · drift-validator 3-way 불변 · breaking 0 (rename ❌ / 8 자산 무변 / ADR-010 영구 grandfather). tier = PATCH (문서종결+이미참 invariant 형식화 / consumer 영향 0 / LL-i-56 정합).

---

## [8.2.0] — 2026-05-17 MINOR — 공식 docs F-015 ×5 재검 + §6 digest_sha META blind-spot closure (hooks VERIFIED-WITH-DELTA / additive)

> **v8.2.0 MINOR — additive / non-breaking**. 사용자 "Anthropic 공식 skills·agents·hooks best practice 재확인 + 비교 + 개선" → `plugin-authoring-spec.md` §9 Layer i 실 `_base-official-docs-checker` F-015 ×5 (skills/hooks/sub-agents/plugins-reference + matcher/if 정밀). 판정 = skills·sub-agents·plugins **VERIFIED-IDENTICAL** / hooks **VERIFIED-WITH-DELTA**. Explore pre-research 가설 3건(event 30+·sub-agent name-only required·P2 stale) = 실 F-015 가 **모두 반증** (research 수렴 ≠ 사실 / 1차 출처 독립 fetch 의무 / LL-plugin-02). DEC-2026-05-17-plugin-authoring-docs-drift / ADR-PLUGIN-001 §7 patch v4 + §8 LL-plugin-02.

### 규칙 additive 보강 (거짓 규칙 0 / H1~H7·§4·§5 무변)

- **§2 S8 신설** (권장/low) — auto-compaction 재첨부 대비 (`SKILL.md` 선두 ~5000 토큰 self-contained / 재첨부 공유 25000 토큰 budget). 공식 "Skill content lifecycle" verbatim.
- **§3 H8 신설** (권장/medium) — per-handler `if`=permission-rule filter(tool 이벤트 한정) / handler type 5종(command·http·mcp_tool·prompt·agent) / `timeout` 기본 600(command/http/mcp_tool)·30(prompt)·60(agent) / `once`=skills/agents 한정 / `matcher`(event-group)≠`if`(per-handler) 별개·공존·비폐기 (H4 matcher = F-015 verbatim 정합 확인 / 무변).
- **§6 digest enrich** — skills·hooks·plugins 3행 (sub-agents 무변) / 4행 `last_verified`=`retrieved`=2026-05-17 (실 F-015 재검).
- **§7** — hooks.json `if`/`timeout` 미사용=optional 정합 + 29-event·matcher F-015 재확인 주석 + 결론 보강.

### META — §6 digest_sha content-commitment 결정적 결합 (사용자 채택)

- **§6 `digest_sha` 컬럼 신설** = `sha256(trim(pinned_guidance_digest))` 선두 12 hex.
- **release-readiness check #12 강화** — `last_verified` date-math **+ digest_sha 재계산 일치 결정적 assert** (6→7 cell 파싱 / fail-closed-on-`|` 유지). 날짜만 갱신·digest 무단편집 동시 차단. check 수 **13 유지** (check #12 내부 강화 / 신 check ❌).
- **§9 Layer i** — VERIFIED 분기 (IDENTICAL=날짜만 / WITH-DELTA=동일 변경서 digest 재발행+§2~§5 재정합) + 불변식 ("last_verified bump ⟺ 실 F-015 run AND digest_sha 일관") + blind-spot closure note.
- **release-readiness.test.js** — check12 digest_sha assert 갱신 + digest_sha regression-guard case 신설 (실 §6 4행 sha 재계산 dogfood / 7-cell 의무).

### 회귀

release-readiness 13/13 (check #12 4행 ≤60d + digest_sha 일치 / check #13 0 stale) · version-check 3-way 8.2.0 · workspace test green · drift-validator 3-way 불변 (skill/agent/flow 무편집 / chain harness §1 비범위 safety property) · breaking 0 (전부 additive / ADR-010 grandfather 47 skills·9 agents·hooks.json 정합 유지).

---

## [8.1.1] — 2026-05-17 PATCH — skill-citation-validator repo-wide 확장 + 활성 SSOT stale 인용 정합 (FP 교정)

> **v8.1.1 PATCH — corrective / non-breaking**. 사용자 "다른 stale 인용 더 없나 전체 레포 스캔" → repo-wide 결정적 스캔 → 활성 SSOT 문서에 SKILL.md 와 **동일 schema-drift class** 잔존 확인 → validator scope 확장 + FP 교정 + dead-link 수정. check #13·tool 자체는 v8.1.0 기존 (신규 surface ❌) = PATCH. DEC-2026-05-17-repo-wide-citation-scan / ADR-PLUGIN-001 §7 patch v3.

### validator 결함 교정 (skill-citation-validator)

- **scope** SKILL.md 한정 → **repo-wide active 표면** (.md/.mermaid / EXCLUDE = node_modules·.git·.claude·.github·briefing·dist·examples·archive + CHANGELOG*·*HISTORY*·decisions/DEC-*·decisions/STATUS*·decisions/INDEX* + **docs/adr/**(ADR=immutable decision record / LL-i-52) + **templates/adoption/**(downstream scaffold placeholder))
- **DEC/ADR exact-match → prefix-match 교정** (파일명 descriptive suffix 때문에 단축 id 인용 FP 였음 / 결정적 버그)
- **relative-path 해석** 추가 (도구-local `docs/` 등 citing-file-relative 흡수)
- **ABSENCE_CTX 확장** — 의도적 부재 + supersession(격상/승격) + future-carry(carry/후보/예정/미생성) + **흡수**(제거된 구 자산 historical mapping) → 현재-dead-link 주장 아님 skip
- **migration/absorption 표 인식** — header 가 `흡수/보존/migrated/legacy` 면 그 표 region row 인용 = historical mapping skip (agents-axis §5 정합 / LL-i-52)

### 발견·수정 (ground truth 삼중 대조 / LL-i-55)

- repo-wide raw → HISTORY 453 + POC 41 (정직 분리 / 결함 아님) → 활성 표면 정밀 triage → **실 stale 31건 / 15 file → 0**
- 동일 schema-drift class 활성 SSOT 잔존 수정 — `lifecycle-contract.md`(자산매핑 SSOT: rules→business-rules + a11y/i18n/static-security/legacy → -spec/-spectrum + ADR-FE-002/005 정확명) · `id-conventions.md` · `methodology-spec/README.md` · `severity-cross-stage-mapping.md`(severity SSOT) · `schemas/README.md`(+intervention-log.js→state-store.js) · `templates/planning/planning-doc-format.md` · `deliverables/{5-business-rules,4-5-formal-spec,4-db-schema,6-antipatterns}.md`(templates/→templates/analysis/) · `skills/analysis-br-cross-consistency-check`(docs/→tools/br-cross-consistency-validator/docs/)
- FP 정확 분리 무수정 — agents-axis §5 흡수표(historical) · sql-inventory carry 후보 · ADR-FE-001 §결정 신설서술 · ADR-FE-005 ADR-007 격상 · DEC/ADR 산문 약식 인용

### 검증

- skill-citation-validator **0 stale** (207 active doc / dogfood green) + test **2/2** (regression-guard + synthetic history/absence/migration-table/relative FP 입증)
- release-readiness **13/13** (check #13 repo-wide green) + version-check 3-way 8.1.1 + workspace green + chain harness validated 본질 보존

---

## [8.1.0] — 2026-05-17 MINOR — skill-citation-validator 신설 + 47 SKILL.md stale 인용 정합 (R18 내부정합 / release-readiness #13)

> **v8.1.0 MINOR — additive enforcement + 비-breaking 내부 dead-link 수정**. 사용자 "내용 로직도 확인 가능한가" → A(내부 정합 결정적 검사) → "수정 + validator 도구화". skill 지시 설계품질(증명불가 C계층) 아닌 **"인용 문서 실존"(결정적)** 검증. DEC-2026-05-17-skill-citation-integrity / ADR-PLUGIN-001 §7 patch v2.

### 발견 (결정적 스캔 / ground truth 삼중 대조)

- 47 SKILL.md 인용 전수 스캔 → **37 stale dead-link / 14 skills** (휴리스틱) → ground truth 대조 후 false-positive 분리 → **37 실결함 확정** (스캐너 정밀화 후)
- 원인 = doc 재구조화 미전파: deliverables 재번호(`04-rules.md`→`5-business-rules.md`·`08`→`8`) / workflow `phase-N`→semantic(`phase-4-5-cross-validation`→`formal-spec.md`·`phase-5-2-*`→`ui.md`) / schema `-spec`·`-spectrum` 접미(`a11y.schema.json`→`a11y-spec.schema.json` 등 4종) / v7.0.0 `rules.schema.json`→`business-rules.schema.json` / template(`rules.template.json`→`.md`·`openapi.template.yaml`→`openapi-extension.template.json`) / ADR 정확명(`ADR-CHAIN-001.md`→`-chain-4-stage-enforcement.md`)
- 기존 validator 전 사각 (drift=flows / formal-spec-link=chain 산출물 / SKILL.md 산문 인용 무검증) — A 검사가 진짜 사각지대 노출
- false-positive 정확 분리 (LL-i-55) — `implement-react-18`·`-svelte`·`-vue-2`(미존재 carry 정확 기술) / `planning-extraction-validator`(tool) / DEC `.md` 접미 / `ADR-007 부재`(의도적 부재) = 무수정

### 신설 (additive)

- **`tools/skill-citation-validator/`** (npm workspace 17번째) — schema/repo-path/ADR(부재-context 제외)/DEC(.md 정규화) 실존 결정적 검사. AI 추론 0% (no-simulation). cli + check-citations + test(dogfood regression-guard + synthetic + FP 필터 2/2) + README
- **`scripts/release-readiness.js` check #13** (`skill_citation_integrity`) — 12/12 → **13/13**. 향후 doc 재구조화 시 SKILL.md stale 인용 release gate 자동 차단
- **수정 14 SKILL.md / 20 인용** (비-breaking 내부 dead-link 정정 / ground truth 정밀 target / 추정 ❌ LL-i-55)

### 검증

- skill-citation-validator **0 stale** (dogfood green) + test 2/2
- release-readiness **13/13** (A1 본격 spawn) + release-readiness.test.js 13 갱신 + version-check 3-way 8.1.0 + workspace green + drift-validator 불변 + chain harness validated 본질 보존

---

## [8.0.0] — 2026-05-17 MAJOR — skill rename `spec-integrate-deliverables` → `spec-integrate-deliverables` (한글 → kebab / command-surface breaking)

> **v8.0.0 MAJOR — breaking (의도 / semver 정합)**. 사용자 "1 바꾸자" → ADR-PLUGIN-001 §8-1 deferred backlog 본격 시행. Senior critique **GO+REVISE conf 0.88** + STOP-3 hard gate. command-surface(skill `name`) rename = P2′ MAJOR 비협상 (선례 v7.0.0 D1). DEC-2026-05-17-skill-name-rename / ADR-PLUGIN-001 §7 patch v1. plugin-authoring-spec §8-1 종결.

### 결단 (Senior GO+REVISE 3 교정 수용)

- 새 name = **`spec-integrate-deliverables`** — "7" = stale noise (실제 ~17 산출물 통합 / "7대"는 틀린 수) / `spec-` prefix 가 이미 stage 표시 / skills-axis 의미-ID + v2.6.0 무의미 숫자토큰 제거 선례. (후보 `-analysis-deliverables` = redundant / `-7-deliverables` = v2.6.0 안티패턴 재발 → 기각)
- 분류 교정 — SSOT `plugin-authoring-spec.md` §7/§8 = **content-aware (❌→✅ resolved)** not blind swap (거짓 행 방지) / ADR-PLUGIN-001 §2.5 line 57 literal + `DEC-2026-05-17-plugin-authoring-spec` = audit-time 기록 **보존** (역사 무수정 / LL-i-52) / CHANGELOG 구 entry 무수정

### rename (git mv + 활성 ref / 실측 19 occ·13 files)

- **git mv** `skills/spec-integrate-deliverables` → `skills/spec-integrate-deliverables` (history-preserving)
- 활성 코드 5: SKILL.md `name:`+H1 / `agents/spec-agent.md` ×3 / `flows/spec.phase-flow.json` skills[] / `flows/spec.phase-flow.mermaid` 라벨 literal (phase-id `cross-link-7-deliverables` = 유지 / skill 식별자 아님)
- 활성 문서 7: `skills-axis.md` / `lifecycle-contract.md` / `guides/getting-started.md` / `guides/first-prompt-cookbook.md`(link+path) / `README.md` ×2
- LL-i-55 trap 회피 — generic "산출물" 도메인 산문(SKILL.md 본문·templates·spec-compose 등)은 skill 식별자 아님 → 무수정

### STOP-3 hard gate (v7.0.0 LL-i-55·57 정합)

- sweep (A) 활성 코드 literal 0 / (B) tools·scripts hidden consumer 0 / (C) broader-prose false-positive 수동 확인
- drift-validator 3-way (manifest↔skills↔mermaid) + schema-validator 11 PoC + workspace + release-readiness **12/12 incl check #12** (dogfood — plugin-authoring-spec 가 자신의 위반 해소를 검증 / check #12 green 의무)

### 검증

- (gate 결과 = 본 commit 직전 실측 기록)
- 버전 trio 8.0.0 (plugin.json + package.json + CHANGELOG / version-check exit 0) + CLAUDE.md sync (check #10)

---

## [7.1.0] — 2026-05-17 MINOR — plugin-authoring-spec SSOT + 외부 docs drift baseline+ratchet (ADR-PLUGIN-001 / charter R18 / release-readiness #12)

> **v7.1.0 MINOR — additive (선행 자산 무수정)**. 사용자 질문 "plugin skill/hooks/agent 작성 시 Anthropic 공식 best practice?" → 저작 규칙 단일 SSOT 신설 + 47 skills·9 agents·hooks·packaging 전수 감사 + 외부 권위(공식 docs) drift 재검증 메커니즘. 4원칙 full (plan + Plan agent Senior 압력테스트 + 실 `_base-official-docs-checker` F-015 ×4 VERIFIED). DEC-2026-05-17-plugin-authoring-spec / ADR-PLUGIN-001. 선행 housekeeping = DEC-2026-05-17-package-version-3way-sync-fix (package.json 4.0.1→7.0.0 별도 commit).

### 신설 (additive)

- **`methodology-spec/plugin-authoring-spec.md`** (단일 SSOT / §1~§11) — Skill(S1~S7)·Hook(H1~H7)·Agent(A1~A6)·Packaging(P1~P4) 저작 규칙 + §6 공식 docs pin baseline(ADR-010 차용) + §7 compliance 매트릭스 + §8 이연 backlog + §9 drift 재검증 2계층
- **`docs/adr/ADR-PLUGIN-001-authoring-spec-and-docs-drift.md`** (신규 namespace = ADR-BE/FE/CHAIN/NEST 컨벤션 정합)
- **`scripts/release-readiness.js` check #12** (`authoring_spec_staleness`) — §6 pin `last_verified` 4행 ≤ 60일 결정적 가드 (date-math only / 네트워크 ❌ / check10 패턴 isomorphic / `--skip-authoring-staleness` flag = skip≠pass / release 시 ❌ 의무). 11/11 → **12/12**
- **`plugin-charter.md` R18** 정식 요구사항 신설 (§1 + §2 매핑 / 사용자 결단 = §5 backlog 아닌 정식 R)

### 감사 결과 (실 F-015 cross-check / false-positive 3건 제거)

- §6 pin = 실 `_base-official-docs-checker` ×4 VERIFIED (canonical `code.claude.com/docs/en/{skills,hooks,sub-agents,plugins-reference}` / 2026-05-17)
- 실 위반 = **S3 1건 ❌ high** (`spec-integrate-deliverables` 한글 → MAJOR rename / §8-1 이연) + **S3/A1 1군 ⚠️ low** (`_base-*` leading `_` / §8-2 이연·수용 후보)
- false-positive 제거 = S1 retrofit 불요(47/47 ≤500L+외부ref) / marketplace.json 위치 공식 정합 / agent `skills:` = 공식 preload 필드(자체확장 ❌). `system_prompt`·`preloaded_skills` over-claim 교정
- ADR-010 grandfather: 위반 = baseline grandfathered / ratchet = 신규·수정 자산만 §2·§4 즉시 강제

### 검증

- release-readiness **12/12** (A1 본격 spawn / `criteria_total=12 passed=12 ready=true exit 0`) + release-readiness.test.js **12/12 pass**
- version-check **3-way 7.1.0** (선행 housekeeping 으로 package.json 청산 후 정상 bump)
- workspace test green / drift-validator 3-way 불변 (skill/agent/flow 무수정 = §8 이연의 안전 속성)
- chain harness validated 본질 보존 / breaking ❌ (선행 자산 무수정 / 감사는 기록만)

### 이연 (별도 user-gated bundle)

- §8-1 `spec-integrate-deliverables` → kebab rename = **별도 MAJOR** (3 ref / cooling-off + Senior + STOP-gate / v7.0.0 선례 정합 / 본 release scope ❌)
- §8-2 `_base-*` charset deviation = 차기 네트워크 재검증서 재평가

---

## v2.3.x and earlier (2026-05-14 split)

## [v2.3.7] — 2026-05-13 (PATCH session 7차 — rules.schema.json BR pattern 4토막 strict 정합 + id-conventions.md enforcement label 강화 / chain harness 5 요소 변경 ❌ / no new ADR)

> **PATCH session 7차** — v2.3.6 PATCH (session 6차 / findings-aggregator) 직후 session 4차 발견 critical schema mismatch **C-schema-br-pattern-fix** 즉시 진입. v2.3.x patch level (schema enforcement 1줄 + description 정합 3건 / chain harness 5 요소 변경 ❌ / no new ADR).

### 변경 사항 (v2.3.6 → v2.3.7)

#### DEC-2026-05-13-BR-id-4-segment-enforcement-v2.3.7 (id-conventions 표준 정합)

- **trigger**: session 4차 (PoC #11 chain 2 4 UC 종결) 발견 schema mismatch — rules.schema (3토막+ 자유) vs behavior-spec br_refs (4토막+ strict) 불일치 + id-conventions.md § 규칙 4 항목 = 이미 4토막 (`BR-{도메인}-{이름}-{번호}`) 정식 표준 명시 사실 (표준 vs schema enforcement 분리 잔존 패턴 발견)
- **사용자 결단**: "BR 표기법 도메인-카테고리-번호로 하자" + 2 question 결단 (Q1 (a) PoC #11 즉시 재라벨 + 5 PoC carry / Q2 (a) 도메인 전문가 위임)

#### schemas/rules.schema.json BR pattern 4토막+ strict

```diff
- "pattern": "^BR-[A-Z0-9_-]+-\\d+$",
- "description": "규칙 ID (예: BR-ORDER-007)"
+ "pattern": "^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$",
+ "description": "규칙 ID (4토막 strict: BR-{도메인}-{이름}-{번호} / 예: BR-ORDER-CANCEL-001 / v2.3.7 enforcement)"
```

5토막+ 자연 허용 (`BR-ARTICLE-AUTHOR-EDIT-ONLY-001` ✅ / `[A-Z0-9_-]+` hyphen 매칭 정합).

#### 3 schema description 예시 정합

| schema                            | 변경                                   |
| --------------------------------- | -------------------------------------- |
| `domain.schema.json:181`          | `BR-ORDER-007` → `BR-ORDER-CANCEL-001` |
| `state-map.schema.json:269`       | `BR-AUTH-001` → `BR-AUTH-JWT-001`      |
| `meta-confidence.schema.json:159` | `BR-ORDER-007` → `BR-ORDER-CANCEL-001` |

#### methodology-spec/id-conventions.md enforcement 강화

- § 규칙 4 항목 → **"v2.3.7 enforcement" label 명문화** (schema-level strict pattern 명시 / 3토막 ❌ + 5토막+ ✅)
- § "v2.3.7 BR 4토막 enforcement 마이그레이션 carry" 신규 절 (영향 6 PoC 명시 + 재라벨 규칙 + 일시 허용 carry)

#### schema-validator unit test 3 신규

`tools/schema-validator/test/chain-schemas.test.js`:

- `v2.3.7 — rules.schema.json BR 4토막 strict (3토막 → invalid)` ✅
- `v2.3.7 — rules.schema.json BR 4토막 strict (4토막 → valid)` ✅
- `v2.3.7 — rules.schema.json BR 5토막+ 자연 허용` ✅

**8/8 pass ✅** (전 8 test pass / 5 existing + 3 신규).

#### 6 PoC schema-validator 일시 fail 허용 carry

| PoC                            | 현재 ID 형식      | carry                                                            |
| ------------------------------ | ----------------- | ---------------------------------------------------------------- |
| **#11 (사내 EFI-WEB Billing)** | `BR-BILLING-005`  | **C-rules-BR-id-relabel-PoC-11** (critical / 도메인 전문가 위임) |
| #06 (사내 EFI-WEB Exchange)    | `BR-EXCHANGE-001` | C-rules-BR-id-relabel-5PoC                                       |
| #07 (사내 EFI-WEB Capital)     | `BR-CAPITAL-001`  | C-rules-BR-id-relabel-5PoC                                       |
| #08 (OSS jpetstore)            | `BR-PETSTORE-001` | C-rules-BR-id-relabel-5PoC                                       |
| #09 (OSS TypeORM raw SQL)      | `BR-RW-001`       | C-rules-BR-id-relabel-5PoC                                       |
| #10 (OSS JPA + QueryDSL)       | `BR-RAE-001`      | C-rules-BR-id-relabel-5PoC                                       |

재라벨 sprint 종결 후 → fail → pass 전환 의무.

#### chain harness 5 요소 변경 ❌

- chain-driver 자체 코드 수정 ❌
- 5 요소 (state.blocked + cli exit 2 + PreToolUse deny + suppressOutput + content-aware) 모두 보존
- 본 변경 = analysis stage 산출물 schema 영역 / chain harness scope 외부

#### resolved carry 1

- **C-schema-br-pattern-fix** (session 3차 발견 trigger)

#### 신규 carry 2

- **C-rules-BR-id-relabel-PoC-11** (critical / 도메인 전문가 위임)
- **C-rules-BR-id-relabel-5PoC** (PoC #06+#07+#08+#09+#10 별도 sprint)

#### 보존 carry (본 작업 후)

- C-stack-결단-chain-3-4-plan (critical)
- C-OSS-Modern-chain-2-4-PoC08 (critical / ≥ 2 realworld trigger)
- C-모던-stack-사내-측정 (critical)
- C-chain-driver-state-retroactive-all-PoC
- C-adoption-findings-aggregator-workflow
- 그 외 (C-egovframework-sub-rule + C-domain-PoC11-1~3 + C-PoC07-1~3 + C-v2.2.0-1 + C-v2.3.0-gartner)

#### Lessons Learned 3건 신규

- **LL-i-19** ("id-conventions 표준 vs schema enforcement 3 layer 정합 의무": 문서 명시 + schema 강제 + unit test 검증 = 3 layer / 향후 동일 패턴 점검 의무)
- **LL-i-20** ("schema strict 화 → 기존 PoC fail = 표준 enforcement 자연 결과" / 도메인 전문가 위임 = F-015 한계 회피 정합)
- **LL-i-21** ("scope 최소화 + 영향 정직 보고 정합" — plan 6 schema → 실제 1 strict + 3 description 정합 축소)

#### PATCH v2.3.7 자격 7/7

- chain harness 5 요소 변경 ❌ + schema PATCH 자격 + no new ADR + workspace test 보존 + 3 신규 test + §8.1 strict 검증 예정 + ≥ 6 PoC 보존 + build 검증 예정

#### Version Bump (3 source sync)

| source                        | v2.3.6     | v2.3.7     |
| ----------------------------- | ---------- | ---------- |
| `.claude-plugin/plugin.json`  | `2.3.6`    | `2.3.7`    |
| CHANGELOG.md 첫 `## [vX.Y.Z]` | `[v2.3.6]` | `[v2.3.7]` |
| `package.json`                | `2.3.6`    | `2.3.7`    |

---

## [v2.3.6] — 2026-05-13 (PATCH session 6차 — tools/findings-aggregator 신설 + chain-driver next --findings 자동 입력 정식 통합 + "양심 의존 차단" 정책 완전 실현 / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **PATCH session 6차** — v2.3.5 PATCH (commit `bbe27ab` / chain 2 4 UC 종결) + session 5차 (commit `852e7f7` / chain-driver retroactive gate) 후 critical carry **C-chain-driver-findings-integration** 즉시 진입. v2.3.x patch level (chain-driver 외부 자산 신설만 / chain harness 5 요소 변경 ❌ / schema ❌ / no new ADR).

### 변경 사항 (v2.3.5 → v2.3.6)

#### DEC-2026-05-13-chain-driver-findings-integration-v2.3.6 (양심 의존 차단 완전 실현)

- **trigger**: session 5차 critical lesson LL-i-14 — chain-driver retroactive gate 통과 ✅ / 단 `--findings <path>` 옵션 ❌ = 암묵 0 findings 가정 pass = 양심 의존 잔존 패턴
- **사용자 결단**: "1" = C-chain-driver-findings-integration 즉시 진입 + 4 question 결단 흡수 (Q1 (a) script 신설 / Q2 PATCH v2.3.6 / Q3 chain 3 진입 시 자연 적용 / 모두 추천 채택)

#### tools/findings-aggregator 신설 (workspace 15번째 등록)

- `package.json` (`@ai-native-methodology/findings-aggregator` v0.1.0)
- `src/aggregator.js` — 핵심 로직 (transformPlanningExtraction + transformChainCoverage + transformSchemaValidator + transformTestImplPass + transformGeneric + mergeFindings + aggregateForStage / **DI pattern**)
- `src/cli.js` — CLI 진입점 (`--target` + `--stage` + `--output` + `--dry-run` + `--json` / exit code 0/1/2/3)
- `test/aggregator.test.js` — **24 unit test pass ✅** (stage 4 + transform 5 + merge 4 + dispatch 4 + aggregate 5 + REQUIRED_VALIDATORS_PER_STAGE 정합 검증)

#### chain-driver gate-eval.js findings shape 정합

```json
{
  "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0,
  "coverage_pct": 1.0, "coverage_threshold": 0.85,
  "evidence_missing": [],
  "tests_total": null, "tests_passed": null, "tests_failed": null,
  "sources": { "<validator>": { "status": "ok|skipped|error", ... } }
}
```

`sources` field = aggregator 자체 보강 (추적 의무 / validator 별 status + findings 별도 기록 / 양심 의존 차단 + 디버깅 정합).

#### PoC #11 spec stage 정식 통합 실증

```bash
$ node tools/findings-aggregator/src/cli.js --target examples/poc-11-efiweb-billing-spring41 --stage spec
# → findings-spec.json 자동 생성 (critical 0 + high 0 + coverage 1.0)

$ node tools/chain-driver/src/cli.js next examples/poc-11-efiweb-billing-spring41 \
    --findings examples/poc-11-efiweb-billing-spring41/.aimd/output/findings-spec.json \
    --user-decision go --dry-run
# → blocked=false / decision="go-eligible" / reasons=[]
```

"양심 의존 차단" 정책 완전 실현 (validator 사후 통과 + chain-driver gate 정식 통과 양쪽 cross-link 자동 정합).

#### chain harness 5 요소 변경 ❌ + backward-compat 보존

- chain-driver 자체 코드 수정 ❌ (5 요소 모두 보존)
- chain-driver next `--findings` 옵션 = optional 보존 (기존 동작 보존 / "--findings 없음 = 암묵 0" 자격 보존)
- adoption guide + workflow + skills 안 findings-aggregator 사용 의무 명문화 = 신규 carry C-adoption-findings-aggregator-workflow (별도 sprint PATCH 자격)

#### REQUIRED_VALIDATORS_PER_STAGE (chain-driver gate-eval.js 정합)

| stage     | validators                                                                                 |
| --------- | ------------------------------------------------------------------------------------------ |
| planning  | planning-extraction-validator + schema-validator                                           |
| spec      | chain-coverage-validator + drift-validator + formal-spec-link-validator + schema-validator |
| test      | test-impl-pass-validator + spec-test-link-validator + schema-validator                     |
| implement | test-impl-pass-validator + static-runner + traceability-matrix-builder                     |

#### resolved carry 1

- C-chain-driver-findings-integration (critical / 양심 의존 잔존 패턴 제거)

#### 신규 carry 1

- C-adoption-findings-aggregator-workflow (adoption guide + workflow + skills 안 findings-aggregator 사용 의무 명문화)

#### 보존 carry (본 작업 후)

- C-chain-driver-state-retroactive-all-PoC (PoC #03~#10 + PoC #11 chain 3+4)
- C-stack-결단-chain-3-4-plan (critical)
- C-OSS-Modern-chain-2-4-PoC08 (critical / ≥ 2 realworld 자격 trigger)
- C-모던-stack-사내-측정 (critical)
- C-schema-br-pattern-fix
- 그 외 (C-egovframework-sub-rule + C-domain-PoC11-1~3 + C-PoC07-1~3 + C-v2.2.0-1 + C-v2.3.0-gartner)

#### Lessons Learned 3건 신규

- LL-i-16: "양심 의존 차단" 완전 실현 자산 (chain-driver 외부 자산 = chain harness 5 요소 보존 + PATCH 자격 정합)
- LL-i-17: 외부 자산 vs 내부 통합 결단 정합 ((a) findings-aggregator 외부 = 권고 정합 / Agent 3 정신)
- LL-i-18: DI test 정합 (aggregateForStage DI pattern / mock runValidator unit test / 24/24 pass)

#### PATCH v2.3.6 자격 7/7

- chain harness 5 요소 변경 ❌ + schema ❌ + no new ADR + workspace test 보존 + 신규 24 test + §8.1 strict 7/7 expected + ≥ 6 PoC 보존 + chain-driver findings 통합 실증 + build OK

#### Version Bump (3 source sync)

- `.claude-plugin/plugin.json` 2.3.5 → 2.3.6
- `package.json` 2.3.5 → 2.3.6 + workspace 15번째 (findings-aggregator) 등록
- `scripts/version-check.js` 자동 verify

---

## [v2.3.5] — 2026-05-13 (PATCH session 4차 — PoC #11 chain 2 4 UC 종결 / 첫 realworld 사내 PoC chain 2 실증 / characterization mode / 5 BHV + 12 AC + traceability partial / chain harness validated v2.3.5 강 강화 / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **PATCH session 4차** — v2.3.4 PATCH (같은 날 commit `e298bb4` / Agent 1 F-015 finding 정정) + session 3차 commit `d32a6aa` (chain 2 UC #1 partial 자산화) 직후 "진행" 사용자 결단 흡수 → chain 2 UC #2 + UC #3 (critical) + UC #4 종결 + traceability partial + DEC v2.3.5 신설 + PATCH release. Q1 결단 정합 ("chain 2 종결 후 PATCH v2.3.5" / MINOR v2.4.0 ❌ / Agent 3 STOP signal 6 정합 / sample ≠ realworld).

### 변경 사항 (v2.3.4 → v2.3.5)

#### DEC-2026-05-13-poc-11-chain-2-종결-v2.3.5 (chain 2 첫 realworld 사내 PoC 실증)

- **4 UC 종결 사실**:
  - UC-BILLING-001 (화면 진입) + UC-BILLING-002 (12 row 조회) + UC-BILLING-003 (critical saveDataConfirm + ERP skip) + UC-BILLING-004 (Qlik View)
  - 5 BHV: BHV-BILLING-001~005 (UC #1×1 + UC #2×1 + UC #3×2 + UC #4×1)
  - 12 AC: AC-BILLING-001~012 (must×8 + should×4)
- **critical AC-BILLING-008** (BHV-BILLING-003 / UC-BILLING-003) — "4 SQL 중 3 번째 fail 시 부분 commit" assertion = TDD intent 정면 위배 정합 / characterization mode 핵심 / 새 시스템 invariant assertion (@Transactional(rollbackFor=Exception.class) 의무 / carry C-stack-결단-chain-3-4-plan cross-link)
- **characterization mode 정합** (Q3 결단 (b)) — Michael Feathers 2004 _Working Effectively with Legacy Code_ 정합 / 12 AC 모두 `@characterization-mode` tag

#### chain 2 산출 5 file (`examples/poc-11-efiweb-billing-spring41/.aimd/output/`)

- `behavior-spec.json` (5 BHV / schema strict ✅ / characterization mode invariants 명시)
- `behavior-spec.md` (두 렌더링 / 핵심 결단 정합 + schema mismatch carry 명시)
- `acceptance-criteria.json` (12 AC / Gherkin BDD / MoSCoW / verifiable=true + test_case_refs TC-\* placeholder / schema strict ✅)
- `acceptance-criteria.md` (Gherkin .feature 렌더 / Better Gherkin 사상 정합 / 12 AC 매핑 표)
- `traceability-matrix.json` (12 entry / status=yellow / forward+backward coverage 0.4 / by_chain_stage chain_1+2 = 1.0 / chain_3+4 = 0 / schema strict ✅)

#### chain 2 gate #2 통과 자격

- chain-coverage-validator: **0 findings + uc_to_bhv = 1.0 + bhv_to_ac = 1.0** ✅
- planning-extraction-validator: 0 findings + use_case coverage = 1.0 ✅
- schema-validator: behavior-spec ✅ + acceptance-criteria ✅ + traceability-matrix ✅

#### Agent 3 Senior critique 흡수 정합 보존 (session 3차)

- ✅ STOP 5 (cycle feasibility) + ✅ STOP 6 (v2.4.0 자격 부재 / sample ≠ realworld) + ✅ REVISE 1+2+3+4+7

#### resolved carry 2

- C-PoC-11-chain-2-PATCH-v2.3.5-trigger (chain 2 종결 후 PATCH 자격 활성)
- C-chain-2-UC-2-3-4-진입 (UC #2~#4 chain 2 자산화 종결)

#### 보존 carry

- C-stack-결단-chain-3-4-plan (critical / chain 3+4 진입 전 4원칙 1원칙 재실행 의무)
- C-OSS-Modern-chain-2-4-PoC08 (critical / ≥ 2 realworld PoC 자격 trigger / v2.4.0 MINOR 자격 활성)
- C-모던-stack-사내-측정 (critical)
- C-schema-br-pattern-fix (chain 2 발견)
- 그 외 (C-egovframework-sub-rule + C-domain-PoC11-1~3 + C-PoC07-1~3 + C-v2.2.0-1 + C-v2.3.0-gartner)

#### chain harness validated v2.3.5 강 강화

- **chain 2 영역 첫 realworld 사내 PoC 실증** (PoC #05 sample chain 2 + 본 PoC #11 realworld chain 2 = 1 sample + 1 realworld)
- ≥ 2 realworld PoC 자격 trigger = **C-OSS-Modern-chain-2-4-PoC08** (PoC #08 jpetstore-6 chain 2~4 후속 sprint) → v2.4.0 MINOR 자격 활성 expected

#### Lessons Learned 3건 신규

- LL-i-11: chain 2 4 UC 종결 = chain harness validated 강 강화 자격 / chain 2 = paradigm-agnostic 정합 사실 (Legacy stack 정합 가능)
- LL-i-12: AC-BILLING-008 = TDD intent 정면 위배 + characterization mode 자산화 의무 (Michael Feathers 2004 정합)
- LL-i-13: schema pattern mismatch 발견 = PoC #11 chain 2 가치 (C-schema-br-pattern-fix carry)

#### PATCH v2.3.5 자격 7/7 (§8.1 strict)

- chain harness 5 요소 변경 ❌ / schema 변경 ❌ / no new ADR / unit test 보존 / §8.1 strict 7/7 expected / ≥ 6 PoC 보존 + chain 2 realworld 강화 / build + CHECKSUMS OK

#### Version Bump (3 source sync)

- `.claude-plugin/plugin.json` 2.3.4 → 2.3.5
- `package.json` 2.3.4 → 2.3.5
- `scripts/version-check.js` 자동 verify

---

## [v2.3.4] — 2026-05-13 (PATCH session 2차 — Agent 1 F-015 finding 정정 + arxiv 2601.21894 인용 복원 + critical lesson F-015 한계 / sub-rule v1.1.1 → v1.1.2 PATCH / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **PATCH session 2차** — v2.3.3 PATCH (같은 날 commit `6ab26b6` / origin push ✅) 직후 D + E 작은 carry 정리 session 안 진입. v2.3.x patch level (no new ADR / sub-rule patch + memory 갱신 + DEC 신설 / schema ❌). 사용자 결단 정합 — "v2.3.4 PATCH release (sub-rule v1.1.1 → v1.1.2)" (4원칙 §3 사용자 명시 결단 우선 / cooling-off 영구 폐기 정합 / Agent 3 REVISE #2 정신만 흡수 = "최소 변경" + scope creep 회피).

### 변경 사항 (v2.3.3 → v2.3.4)

#### DEC-2026-05-13-not-all-code-인용-복원 (Agent 1 F-015 finding 정정 + critical lesson)

- **trigger**: v2.3.3 Agent 1 F-015 cross-validation "arxiv 2601.21894 확인 불가" 단순 결단 → sub-rule v1.1 §X-C #5 인용 제거 + carry C-not-all-code-검증 신설
- **메인 직접 검증 결과 (WebFetch + WebSearch)**:
  - 제목: **"Not All Code Is Equal: A Data-Centric Study of Code Complexity and LLM Reasoning"**
  - First author: **Lukas Twist** (+ Shu Yang / Hanqi Yan / Jingzhi Gong / Di Wang / Helen Yannakoudakis / Jie M. Zhang)
  - arxiv: 2601.21894 / 2026-01-29 submission (arxiv ID 정확)
  - 핵심: structural complexity 가 LLM reasoning 에 dominant / 83% experiments restricting fine-tuning data to specific structural complexity range outperforms structurally diverse code
- **R1' "trivially deterministic 효과 = structural complexity 단순" 정합 강** — paradigm specific code 의 structural complexity 가 §3-A automation ceiling 영향 인자 정합

#### sub-rule v1.1.1 → v1.1.2 PATCH (`spring41-ibatis2-isomorphic.md`)

- **§X-C #7 신설** — Twist et al. 정확 인용 복원 + 핵심 finding 83% experiments + R1' 정합 강 + critical lesson F-015 sub-agent 한계 cross-link
- **§6 carry 표** — C-not-all-code-검증 ✅ resolved 표기 (취소선 + resolved 일자 + 본 DEC 명시)
- **§7 참조** — "Not All Code Is Equal" 취소선 제거 + 정확 인용 복원 (Twist et al. 2026 + arxiv 2601.21894 / 2026-01-29 submission)
- **frontmatter** — v1.1.1 → v1.1.2 (3rd line 신규 추가)

#### critical lesson F-015 한계 명시 (memory `feedback_sub_agent_validation.md` v2.3.4 보강 절 추가)

- F-015 한계 패턴 3건: (1) 가벼운 sub-agent + 시간 cap 10분 = WebFetch fail / fallback search 부정확 가능 / (2) "확인 불가" 단순 결단 = critical risk = 정확한 인용도 제거 위험 / (3) sub-agent 보고 그대로 본체 갱신 = critical 정합 위험
- 신규 적용 4 항목: (1) sub-agent negative 결단 발견 시 = 메인 WebFetch + WebSearch 즉시 cross-check 의무 / (2) 인용 제거 / carry 신설 결단 전 = 메인 직접 검증 cycle 1회 의무 / (3) sub-agent fallback search "부재 정탐" 도 메인 cross-check 의무 / (4) sub-agent 결단 vs 메인 cross-check 차이 발견 = critical lesson 등재 의무

#### D 작업 종결 (PoC #11 satd 해석 정정 + cleanup)

- `examples/poc-11-efiweb-billing-spring41/sql-inventory/sql-inventory.json` summary.self_recognized_interpretation 절 신설 — "Modern OSS reference 정합" 단순 결론 ❌ / single-case + 작은 모듈 + 잠복 기간 미경과 (arxiv 2601.06266 median 204~492일) 가능성 명시 / sub-rule §AP-005 cross-link
- 빈 source 디렉토리 4 (java/jsp/sqlmap/message) + parent source/ 제거 (in-place read 정책 정합 / DEC-2026-05-12-in-place-read-정책-채택)

#### B 진입 plan 작성 (`~/.claude/plans/j-chain-2-4-풀가동.md`)

- 본 plan = 4원칙 1원칙 산출만 / B 본격 진입 = 별도 multi-day session
- 10절: 컨텍스트 + PoC 대상 결단 후보 5종 (A/B/C/D/E) + scope IN/OUT + release v2.4.0 MINOR 자격 + 4원칙 cycle + 위험 + §8.1 strict 정합 + 후속 carry + 참조
- 추천 PoC: **(C) PoC #08 jpetstore-6** (Modern stack / test infra 보유 / OSS / 7~14d cap / chain harness validated 강 강화)

#### DEC 갱신

- DEC-2026-05-13-r1-prime-본체-명문화 §5.1 신규 carry C-not-all-code-검증 ✅ resolved 표기

#### resolved carry 3

- C-not-all-code-검증 (critical / 메인 cross-check)
- C-poc-11-0-satd-해석-정정 (D 작업)
- C-poc-11-source-디렉토리-cleanup (D 작업)

#### 신규 carry 2

- C-사내-chain-2-4 (critical / B sprint trigger / 사내 ROI axis / PoC #11 billing chain 2~4 별도 sprint)
- C-egovframework-chain-2-4 (사내 Spring 4.1 + iBATIS 2 + egov stack chain 2~4)

#### 잔존 carry

- C-모던-stack-사내-측정 (critical / Agent 3 REVISE #1 / 사내 Modern stack PoC)
- C-egovframework-sub-rule (Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 (결제 도메인 expert 위임)
- C-PoC07-1~3 (chain 3 영역 retrofit / B sprint 안 자연 흡수 후보)
- C-v2.2.0-1 (NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

#### Lessons Learned (critical 3건)

- LL-i-5 (critical): F-015 cross-validation 한계 (memory `feedback_sub_agent_validation.md` v2.3.4 보강 절 자산화)
- LL-i-6: 사용자 명시 결단 우선 (Agent 3 REVISE #2 정신만 흡수 / 형식 권고 ❌)
- LL-i-7: 같은 session 2차 = 자연 발견 burst 회피 (Agent 1 finding 정정 + 메인 cross-check 결과 = 의도 burst ❌)

#### PATCH 자격 7/7 (§8.1 strict)

- chain harness 5 요소 변경 ❌ (보존)
- schema backward-compat 회귀 ❌ (schema 변경 ❌)
- no new ADR (DEC 신설 1건 + 갱신 1건)
- workspace unit test 보존 (schema ❌ + tool ❌)
- §8.1 strict 7/7 expected (`--target v2.3.4`)
- ≥ 6 PoC corroboration 보존 (Legacy 3 사내 + Modern 3 OSS)
- build dist + CHECKSUMS OK expected

#### Version Bump (3 source sync)

- `.claude-plugin/plugin.json` 2.3.3 → 2.3.4
- `package.json` 2.3.3 → 2.3.4
- `scripts/version-check.js` 자동 verify

---

## [v2.3.3] — 2026-05-13 (PATCH session 1차 — R1' automation ceiling 본체 명문화 (3 layer 가치 명세 axis 분리) + sub-rule v1.1 → v1.1.1 PATCH (인용 정정 + 외부 권위 보강) / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **PATCH** — v2.3.2 PATCH (2026-05-12 commit `ba3ed82` / sub-rule v1.0 → v1.1 minor) 후 잔존 carry **C-r1-prime-자격-Modern-corroboration** 흡수. v2.3.x patch level (no new ADR / 본문 보강 + sub-rule patch / schema 변경 ❌). 사용자 결단 정합 — DEC-2026-05-12-r1-가설-revisit §5 "본체 methodology 영향 = Day 3.5 종결 시 별도 결단 의무" 약속 종결.

### 변경 사항 (v2.3.2 → v2.3.3)

#### DEC-2026-05-13-r1-prime-본체-명문화 (R1' axis 본체 명문화 / industry first paradigm-cross axis quantification)

- **3 layer 본체 가치 명세 갱신**:
  - `CLAUDE.md` L36~ — chain harness 전체 70~80% axis + analysis §3-A automation axis paradigm 별 ceiling 표 (Legacy ~53~55% 3 사내 PoC + Modern ~60~67% 3 OSS PoC) + metric semantics 차이 명시 + 외부 권위 cross-link
  - `ai-native-methodology/README.md` L34~ — 외부 facing 동일 패턴 + Modern OSS 한정 명시 + sub-rule §X 참조
  - `~/.claude/projects/.../memory/project_methodology_scope.md` "scope OUT" 절 — R1' 5항 보강 (paradigm 별 ceiling + metric semantics + 외부 권위 + original empirical finding + 출처)
- **R1' (revised) 정량 ceiling 본체 명시** — Spring 4.1 + iBATIS 2 (Legacy) ~53~55% / Modern (MyBatis 3 / TypeORM / Spring Data JPA) ~60~67% / **6 PoC 사실 robust** (Legacy 3 사내 + Modern 3 OSS / ADR-CHAIN-008 정합).
- **industry first paradigm-cross axis quantification (original empirical finding)** 명시 — 외부 권위 부재 영역 / 본 사내 6 PoC 6 차원 corroboration (paradigm + ORM + platform + language + responsibility + scale).

#### sub-rule v1.1 → v1.1.1 PATCH (`spring41-ibatis2-isomorphic.md`)

- **Agent 1 F-015 cross-validation 인용 정정 3건**:
  - "Zhang et al. ICSE 2025" → **Wang et al. ICSE 2025** (First author = Chong Wang NTU / Zhang 공저자 3번째 / arxiv 2406.09834v3 / DOI 10.1109/ICSE55347.2025.00245)
  - "LongCodeBench 2026" → **2025** (v1=2025-05 / v3=2025-10 / First author = Stefano Rando)
  - "Not All Code Is Equal" arxiv 2601.21894 → **인용 제거** (Agent 1 검증 실패 가능성 / 별도 sprint carry C-not-all-code-검증)
- **Agent 2 외부 권위 보강 (§X-C-2 신설 / Big-tech industry isomorphic corroboration 표)**:
  - AWS Schema Conversion Tool (Functions **66.4%** 자릿수 정합 / Stored Proc 76.8%)
  - Amazon Q Developer Code Transformation (Novacomp 80% / 보험사 36% / OSS 62 app 85% higher success / acceptance 60%+)
  - ThoughtWorks Tech Radar Vol.32~34 (2025~2026.04) "GenAI for forward engineering" + "Spec-driven development for legacy" — chain harness 사상 **isomorphic**
- **Agent 1 추가 권위 후보 2건**: "Beyond Synthetic Benchmarks" (arxiv 2510.26130 / 2025) + "Where Do LLMs Still Struggle?" (arxiv 2511.04355 / 2025)
- **Modern OSS 한정 명시** (Agent 3 REVISE #1 흡수 / §X-E 측정 환경 컬럼 + 본문 한 줄)
- **metric semantics 차이 명시** (Agent 3 강화 흡수 / §X-F.3 "metric 분모 자체 다름")

#### DEC 신설 + 갱신 병행

- **신설**: `DEC-2026-05-13-r1-prime-본체-명문화` (version bump trigger DEC / 4원칙 cycle 정합 / Agent 3 ACCEPT)
- **갱신**: `DEC-2026-05-12-r1-가설-revisit` 상태 `진행중` → `승인` / §5 본체 영향 표 5행 ✅ resolved 갱신

#### Agent 3 Senior critique 흡수 (ACCEPT 5 + REVISE 2)

- ACCEPT: axis 분리 정당성 / 본체 vs sub-rule layer 정합 / §8.1 strict / PATCH v2.3.3 자격 / DEC 신설+갱신 병행
- REVISE #1 (Modern OSS 한정) ✅ 흡수 — 3 layer + sub-rule §X-E
- REVISE #2 (결단 burst 24h cooling) 정신만 흡수 / 형식 권고 ❌ (DEC-2026-05-06 + DEC-2026-05-08 cooling-off 영구 폐기 정합 / 사용자 명시 결단 우선)

#### 4원칙 cycle 산출

- 1원칙 plan `~/.claude/plans/i-r1-prime-ceiling-본체.md` (10절 / scope IN 13항 + scope OUT 6항)
- 2원칙 research `~/.claude/plans/i-r1-prime-research.md` (3 sub-agent 병렬 / 가벼운 sub-agent 전략 / 시간 cap 10분/agent / 실측 ~76~80초/agent)
- 3원칙 사용자 결단 4 question 묶음 (풍성한 옵션 4건 모두 채택)
- 4원칙 Lessons Learned 4건 (LL-i-1~4 / 가벼운 sub-agent + Senior critique + scope creep + cooling-off 정합)

#### resolved carry

- C-r1-prime-자격-Modern-corroboration ✅ resolved
- DEC-2026-05-12-r1-가설-revisit §5 본체 영향 5행 모두 ✅ resolved
- Zhang → Wang 인용 정정 ✅ resolved (sub-rule v1.1.1 + DEC + plan)
- LongCodeBench 2026 → 2025 정정 ✅ resolved (sub-rule v1.1.1 + DEC)
- Modern OSS 한정 명시 부재 ✅ resolved (3 layer + sub-rule §X-E)
- metric semantics 차이 명시 부재 ✅ resolved (3 layer + sub-rule §X-F.3)

#### 신규 carry

- C-not-all-code-검증 (Agent 1 F-015 / arxiv 2601.21894 별도 검증 후 인용 재개 vs 영구 제거)
- C-모던-stack-사내-측정 (critical / Agent 3 REVISE #1 / 사내 Modern stack PoC 진입 시 ceiling 재측정 의무)

#### 잔존 carry

- C-egovframework-sub-rule (Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 (결제 도메인 expert 위임)
- C-PoC07-1~3 (chain 3 영역 retrofit)
- C-poc-11-0-satd-해석-정정 (Agent 1 cross-validation 흡수 잔존)
- C-poc-11-source-디렉토리-cleanup (낮은 우선)
- C-v2.2.0-1 (NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

#### PATCH 자격 7/7 (§8.1 strict)

- chain harness 5 요소 변경 ❌ (chain-driver / planning-extraction-validator / chain-coverage-validator / spec-test-link-validator / traceability-matrix-builder 보존)
- schema backward-compat 회귀 ❌ (schema 변경 ❌ → 회귀 fixture 변동 ❌)
- no new ADR (DEC 자격 자연)
- workspace unit test 보존 (schema ❌ + tool ❌)
- §8.1 strict 7/7 expected (`--target v2.3.3`)
- ≥ 6 PoC corroboration (Legacy 3 사내 + Modern 3 OSS / ADR-CHAIN-008 "MEDIUM × ≥ 5 PoC = strong" 정합 강화)
- build dist + CHECKSUMS OK expected

#### Version Bump (3 source sync)

- `.claude-plugin/plugin.json` 2.3.2 → 2.3.3
- `package.json` 2.3.2 → 2.3.3
- `scripts/version-check.js` 자동 verify (no source 자체 / plugin.json + CHANGELOG header check)

---

## [v2.3.2] — 2026-05-12 (PATCH — sub-rule v1.0 → v1.1 minor 갱신 / KL-SATD 인용 정정 + R1' automation ceiling 신설 + 외부 권위 보강 / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **PATCH** — v2.3.1 PATCH (같은 날 commit `bc48477`) 후 PoC #11 Day 0.5~1.5 종결 + 본체 sub-rule 보강. v2.3.x patch level (no new ADR / sub-rule 본문 보강만 / schema 변경 ❌). 사용자 결단 정합 — PoC #11 Day 1.5 R1 가설 반증 critical finding → 본체 methodology R1' 검토 우선 (PoC #11 Day 2.0~3.5 suspend).

### 변경 사항 (v2.3.1 → v2.3.2)

#### PoC #11 (EFI-WEB billing) Day 0.5~1.5 종결

- **DEC-2026-05-12-in-place-read-정책-채택** — source 사본 패턴 → in-place read 정책 변경. 사내 PoC 정합 의무 / 외부 OSS PoC 는 clone 보존. PoC #11 첫 적용 (`source_root_absolute: /Users/sangcl/Documents/Development/Study/EFI-WEB/ifrs`).
- **billing 모듈 정탐** — 7 file / 257 Java + 77 sqlmap + 269 JSP = 603 LOC / Spring 4.1 + iBATIS 2 + egov + Qlik BI 외부 임베드 + cross-DB 3개 (ifrs + FIM + SGERPMA).
- **analysis 4종 + SQL Inventory** — 8 BR + 4 UC + 13 AP (5종 isomorphic + 8종 novel) + 6 SQL × 12 컬럼 / validator 0 findings / **auto_ratio 66.7%** (3 사내 PoC isomorphic 자격 충족) / migration_priority P0×3+P1×2+P2×1.
- **§3-A 자동화율 = 52.5%** — plan 2차 expectation 25~40% **+12.5%p 초과**.

#### DEC-2026-05-12-r1-가설-revisit (critical methodology finding)

- R1 가설 (scale ↓ → 자동화율 ↓) **반증** 사실 확보 (3 사내 PoC: 38.75% / 52.5% / 53.8% / scale 분포 vs 자동화율 분포 불일치).
- R1' (revised) 새 가설 — **Spring 4.1+iBATIS 2 paradigm = analysis 단계 §3-A automation ceiling ~53~55%** (3 사내 PoC isomorphic / scale 무관).
- paradigm modernization 시 ceiling 돌파 evidence: PoC #08 = 66.7% / PoC #09 = 63.6%.

#### DEC-2026-05-12-sub-rule-v1.1-갱신 (sub-rule 본문 보강)

`methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.0 → **v1.1 minor 갱신**:

1. **§AP-005 KL-SATD 인용 정정** (critical) — "Korean Language" → "**Keyword-Labeled**" / Software Quality Journal 2024 (DOI 10.1007/s11219-023-09655-z) / Maldonado 2015 = IEEE 7th MTD workshop / 5 SATD type 분류 정확화.
2. **§3 ≥ 2 PoC → ≥ 3 사내 PoC isomorphic 표 강화** — scale-cross 3 spectrum (작은 단일 + 단일 + 다중책임) / 5 AP 중 2종 3 PoC + 3종 2 PoC corroboration.
3. **§4 신뢰도 단계 5 강 (90~95%) 신설** — ≥ 3 사내 PoC + ≥ 3 spectrum + R1' original empirical finding 보강.
4. **§X 신규 절 — automation ceiling R1'** — 3 사내 PoC 측정 사실 + R1 반증 + R1' 정립 + 외부 권위 STRONG 보강 (Zhang ICSE 2025 DUR 70~90% vs 9~18% + LongCodeBench Claude 3.5 32K→256K 29%→3% + Context Length Alone Hurts + Gartner 2025) + original empirical finding 라벨 + paradigm modernization 시 ceiling 돌파 5 PoC 사실.
5. **§6 carry 갱신** — iBATIS 2 dynamic tag sub-classification carry ✅ resolved.
6. **§7 참조 추가** — SQJ 2024 + Zhang ICSE 2025 + LongCodeBench + Context Length + Gartner 2025 + DEC 3건 + PoC #11 산출.

#### 4원칙 정합 ()

- **1원칙 plan** — `~/.claude/plans/h-r1-revisit-본체-검토.md` (4 자산 전수 조사 / 13절)
- **2원칙 research** — `~/.claude/plans/h-r1-revisit-research.md` (3 light sub-agent F-015 cross-validation / KL-SATD 인용 오류 + R1' STRONG 외부 권위 발견)
- **3원칙 사용자 결단** — γ ("sub-rule v1.1 일괄 / §X 만 / WebFetch skip / PATCH v2.3.2 즉시 release")
- **4원칙 Lessons Learned** — 4건

### v2.3.2 PATCH 자격 — 6/6

1. ✅ chain harness 5 요소 enforcement 보존
2. ✅ schema backward-compat (schema 변경 ❌)
3. ✅ no new ADR (patch level)
4. ✅ ≥ 3 사내 PoC isomorphic 자격 사실 (PoC #06+#11+#07)
5. ✅ release-readiness §8.1 strict 7/7
6. ✅ unit test 회귀 0 fail (tools 변경 ❌ / 기존 241 pass 보존)

### resolved (6)

- C-in-place-read-policy
- C-r1-hypothesis-revisit (critical)
- C-automation-ceiling-paradigm
- KL-SATD 인용 오류 (Agent 1 F-015 cross-validation)
- iBATIS 2 dynamic tag sub-classification carry
- C-v2.2.0-spring41-ibatis2-subrule (3 사내 PoC isomorphic)

### 잔존 carry

- C-v2.2.0-1 (NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level
- C-poc-11-0-satd-해석-정정 (Day 3.5)
- C-poc-11-source-디렉토리-cleanup
- C-egovframework-sub-rule
- C-r1-prime-자격-Modern-corroboration
- PoC #11 Day 2.0~3.5 (본 release 후 별도 결단)

---

## [v2.3.1] — 2026-05-12 (PATCH — C-v2.2.0-2 baseline ratchet + C-v2.2.0-7 tag_type enum / no ADR / chain harness 5 요소 변경 ❌)

> **PATCH** — v2.3.0 MINOR FINAL (같은 날 commit `fd603bd`) 후 내부 2 carry resolve. v2.2.x 잔존 carry 정리 / v2.3.x patch level (no new ADR / sub-rule deliverable / schema 본질 변경 ❌). release-readiness §8.1 strict 7/7 ✅ + npm test 241 pass (288 total with \_shared) / 0 fail.

### 변경 사항 (v2.3.0 → v2.3.1)

- **C-v2.2.0-2 baseline ratchet resolved** — `tools/sql-inventory-extractor/src/{validator,cli}.js` 에 baseline ratchet 통합 (characterization-coverage-validator mirror / `_shared/baseline.js` `coverageTrendCheck` 재사용). flag `--coverage-baseline <path>` + `--write-coverage-baseline` 신설. metric = `extraction_automation.auto_ratio_external_6`. current < baseline → `extraction_automation.ratchet_trend_negative` high finding.
- **C-v2.2.0-7 dynamic_branch.tag_type sub-classification enum resolved** — `schemas/sql-inventory.schema.json` `dynamic_branch.items.tag_type` optional enum 신설 (iBATIS 2 dynamic 16종 + MyBatis 3 dynamic 8종 + `sql:case_when` + `other` = 26종). validator `record.tag_type_invalid` critical finding + `summary.tag_type_distribution` 통계.
- **신규 fixture 4종** — `valid/with-tag-type/` + `invalid/bad-tag-type/` + `baselines/poc-06-baseline.json` (ratchet pass) + `baselines/regressed-baseline.json` (ratchet fail).
- **unit test 237 → 241** (+4 / sql-inventory-extractor 14 → 18 / 288 total with \_shared).
- **deliverable 24-sql-inventory.md §13 carry 표 갱신** — C-v2.2.0-2 / C-v2.2.0-7 resolved 마킹.

### v2.3.1 PATCH 자격 — 6/6

1. ✅ chain harness 5 요소 enforcement 보존
2. ✅ schema backward-compat (tag_type optional / 기존 fixture 회귀 ❌)
3. ✅ no new ADR (patch level)
4. ✅ unit test 회귀 0 fail (241 pass / 14 workspace)
5. ✅ release-readiness §8.1 strict 7/7
6. ✅ build artifact CHECKSUMS OK

### resolved carry

- ~~C-v2.2.0-2 sql-inventory baseline ratchet (characterization-coverage-validator mirror)~~ ✅ resolved (auto_ratio_external_6 ratchet flag + high finding)
- ~~C-v2.2.0-7 iBATIS 2 전용 dynamic 태그 sub-classification enum~~ ✅ resolved (dynamic_branch.tag_type enum 26종)

### 잔존 carry

- C-v2.2.0-1 (NoSQL/Prisma) → paradigm shift / v3.0 후보
- C-v2.2.0-5 (다중책임 spectrum) → PoC #11 종결 후
- C-v2.3.0-gartner-time-application-level → 별도 sprint v2.4 / v3.0
- Phase 3 (patterns_extension_v3 Modern PoC corroboration) → Modern PoC MyBatis 3 source 필요
- PoC #11 (EFI-WEB billing) source 위임 대기

---

## [v2.3.0] — 2026-05-12 (MINOR FINAL — Phase 1 + Phase 2 일괄 / patterns_extension_v3 + Spring 4.1+iBATIS 2 spectrum AP isomorphic 5종 sub-rule + ADR-CHAIN-010)

> **MINOR FINAL** — v2.3.0-rc1 prerelease (같은 날 2026-05-12 / commit `de1bae1` / git tag `v2.3.0-rc1`) 후 Phase 2 작업 종결 → final 격상. 옵션 D (REVISE 완전 흡수) Phase 1 + Phase 2 일괄 자산화. release-readiness §8.1 strict 7/7 ✅ + npm test 237 pass (284 total with \_shared) / 0 fail.

### Phase 2 변경 사항 (v2.3.0-rc1 → v2.3.0)

- **ADR-CHAIN-010 신설** — `docs/adr/ADR-CHAIN-010-patterns-extension-v3-and-sub-rule.md` "patterns_extension_v3 정식 도입 (MyBatis 3 advanced features 한정) + Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 sub-rule 자산화". MyBatis 3 cache / discriminator / typeHandler 공식 docs 정합 + PoC #06+#07 AP 5종 isomorphic 사실.
- **sub-rule 신설** — `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` (신규 sub-rules/ 디렉토리). 5 AP isomorphic 명세: Map<String,Object> 강제 캐스팅 + Anemic Service + WITH(NOLOCK) 무차별 + 공유 SQL 조각 부재 + 자조 SATD (KL-SATD). ≥ 2 PoC + 단일+다중책임 spectrum corroboration = **단계 5 신뢰도** 자격.
- **patterns_extension_v3 schema 신설** — `schemas/sql-inventory.schema.json` `patternsExtensionV3` $def + root-level `patterns_extension_v3` reference. 3 패턴 nested (pattern_5_cache + pattern_6_discriminator + pattern_7_typeHandler). **optional / MyBatis 3+ 한정** (iBATIS 2 단독 stack 부적합).
- **deliverable 24-sql-inventory.md 보강** — 제목 + 사상 절 + §6.1 patterns_extension_v3 정식 (3 패턴 + iBATIS 2 비호환 비교) + §13 carry 표 C-v2.2.0-3 / C-v2.2.0-4 resolved 마킹.
- **신규 fixture + test 1** — `valid/with-patterns-extension-v3/sql-inventory.json` (cache + discriminator + typeHandler aggregate_metrics 예시) + 1 신규 test (patterns_extension_v3 optional / 회귀 ❌ 검증).
- **unit test 236 → 237** (+1 / sql-inventory-extractor 13 → 14 / 284 total with \_shared).

### v2.3.0 final 자격 — 8/8

1. ✅ chain harness 5 요소 enforcement 보존 (v2.0~v2.3 일관)
2. ✅ schema patterns_extension_v3 + migration_priority 양쪽 추가 + backward-compat 회귀 fixture 통과 (PoC #06+#07 11 컬럼 row test pass)
3. ✅ ADR-CHAIN-009 + ADR-CHAIN-010 신설 + dynamic 검사 통과 (8 → 10 ADR-CHAIN)
4. ✅ unit test 회귀 0 fail (237 pass / 14 workspace)
5. ✅ deliverable 24 + sub-rule deliverable 정합 갱신
6. ✅ ≥ 5 PoC corroboration 보존 (PoC #06+#07+#08+#09+#10 SQL Inventory isomorphic)
7. ✅ release-readiness §8.1 strict 7/7
8. ✅ build artifact dist/ai-native-methodology-v2.3.0/ 273+ files / CHECKSUMS OK

### resolved carry (Phase 2 / ADR-CHAIN-010 정합)

- ~~C-v2.2.0-3 patterns_extension_v3~~ ✅ resolved (schema 정식 도입 / Phase 3 Modern PoC corroboration carry)
- ~~C-v2.2.0-4 Spring 4.1 + iBATIS 2 sub-rule~~ ✅ resolved (`spring41-ibatis2-isomorphic.md` 신설 / 단계 5 신뢰도)

### 별도 sprint carry (v2.4 / v3.0)

- C-v2.3.0-gartner-time-application-level — `methodology-spec/deliverables/application-portfolio-time.md` 신설 후보 (Gartner TIME application portfolio 별도 deliverable / ADR-CHAIN-009 §2)

### 잔존 carry (v2.2.x patch / v2.x)

- C-v2.2.0-1 (NoSQL/Prisma) → paradigm shift / v3.0 후보
- C-v2.2.0-2 (sql-inventory baseline ratchet) → v2.2.x patch
- C-v2.2.0-5 (다중책임 spectrum) → PoC #11 종결 후
- C-v2.2.0-7 (iBATIS 2 전용 dynamic 태그 sub-classification) → v2.2.x patch
- PoC #11 (EFI-WEB billing) source 위임 대기

---

## [v2.3.0-rc1] — 2026-05-12 (MINOR PRERELEASE Phase 1 — schema 12번째 컬럼 `migration_priority` P0~P3 + ADR-CHAIN-009 Gartner TIME SQL 단위 보류)

> **MINOR Phase 1 PRERELEASE** — v2.3.0 minor sprint 옵션 D (REVISE 완전 흡수 / Senior critique 권고 100% 채택) 정합. Phase 1 = schema 12번째 컬럼 + 회귀 fixture + ADR-CHAIN-009. Phase 2 (patterns_extension_v3 + Spring 4.1 + iBATIS 2 sub-rule) = 별도 session 후속 carry.

### 변경 사항 (v2.2.0 → v2.3.0-rc1)

- **schema 12번째 컬럼 신설** — `schemas/sql-inventory.schema.json` `sqlRecord.properties.migration_priority` enum P0/P1/P2/P3 추가. **optional 의무** (기존 11 컬럼 row backward-compat 강제 / Senior critique 흡수). title + description 갱신 (11 → 12 컬럼).
- **ADR-CHAIN-009 신설** — `docs/adr/ADR-CHAIN-009-gartner-time-sql-level-deferral.md` "Gartner TIME SQL 단위 보류 사유 / abstract granularity mismatch + `migration_priority` P0~P3 대체 채택 / application portfolio 수준 별도 deliverable carry". Senior critique 100% 흡수 + Big-tech first-mover 신호 보존.
- **deliverable 24-sql-inventory.md 보강** — §1.1 Gartner TIME 보류 명시 / §1.2 "Why not AWS SCT" 차별화 절 +2 도구 (Oracle SQL Dev / Liquibase) + `migration_priority` first-mover 입증 / §3 추출 범위 +1 컬럼 / §4 11 → 12 컬럼 명세 + §4.1 분류 가이드 (P0~P3 trigger 예시) / §13 carry 표 갱신 (C-v2.2.0-8 reframe + C-v2.3.0-gartner-time-application-level 신규).
- **sql-inventory-extractor validator 보강** — `tools/sql-inventory-extractor/src/validator.js` migration_priority enum 검증 추가 (`record.migration_priority_invalid` critical finding) + summary distribution { P0, P1, P2, P3, unspecified } 통계 + 검증 #8 신설 명세.
- **unit test 회귀 fixture 2종 신설** — `valid/with-migration-priority/sql-inventory.json` (P0~P3 mixed + unspecified) + `invalid/bad-migration-priority/sql-inventory.json` (PX). 3 신규 test (backward-compat / valid recognition / invalid critical).
- **unit test 233 → 236** (+3 / sql-inventory-extractor 10 → 13 / 280 → 283 total with \_shared).
- **Senior critique REVISE 완전 흡수** — (a) Gartner TIME = application portfolio 단위 / SQL 단위 abstract granularity mismatch / `migration_priority` 자연 axis 대체 (b) 14차 retract burst risk 회피 (2-phase split — Phase 1 + Phase 2) (c) ADR-CHAIN-009 신설 의무 (d) 회귀 fixture 사전 작성 의무. plan + research 2원칙 자산화 (`g-v2.3.0-minor-plan.md` + `g-v2.3.0-minor-research.md`).
- **Big-tech first-mover 신호 흡수** — SQL Inventory 도구 (AWS SCT / Oracle SQL Dev Migration Workbench / Liquibase) 모두 TIME 컬럼 부재 사실. `migration_priority` SQL 단위 axis = 본 방법론 first-mover (Gartner TIME application portfolio 분리).

### v2.3.0-rc1 자격 — Phase 1 산출 6/6

1. ✅ chain harness 5 요소 enforcement 보존 (v2.0~v2.3 일관)
2. ✅ schema 12번째 컬럼 추가 + backward-compat 회귀 fixture 통과 (기존 PoC #06+#07 11 컬럼 row test pass)
3. ✅ ADR-CHAIN-009 신설 + 결정 section 검증
4. ✅ unit test 회귀 0 fail (236 pass / 14 workspace)
5. ✅ deliverable 24 §3+§4+§13 정합 갱신
6. ✅ ≥ 5 PoC corroboration 보존 (PoC #06+#07+#08+#09+#10 SQL Inventory isomorphic)

### Phase 2 carry (별도 session)

- C-v2.2.0-3 patterns_extension_v3 (cache / discriminator / typeHandler)
- C-v2.2.0-4 Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 sub-rule 자산화
- ADR-CHAIN-010 (optional / ADR-008 sub-extension 흡수 가능)
- v2.3.0-rc2 → final 격상

### 별도 sprint carry (v2.4 / v3.0)

- **C-v2.3.0-gartner-time-application-level** (신규) — `methodology-spec/deliverables/application-portfolio-time.md` 신설 후보 (Gartner TIME application portfolio 별도 deliverable / SQL 단위와 axis 분리).

### 잔존 carry (v2.2.x patch / v2.x)

- C-v2.2.0-1 (NoSQL/Prisma) → paradigm shift / v3.0 후보
- C-v2.2.0-2 (sql-inventory baseline ratchet) → v2.2.x patch
- C-v2.2.0-5 (다중책임 spectrum) → PoC #11 종결 후
- C-v2.2.0-7 (iBATIS 2 전용 dynamic 태그 sub-classification) → v2.2.x patch
- PoC #11 (EFI-WEB billing) source 위임 대기

---

## [v2.2.0] — 2026-05-08 (MINOR FINAL — rc1 → final / 5 PoC isomorphic robust + ADR-CHAIN-008 paradigm-cross 정책 완화 + cooling-off 영구 폐기)

> **MINOR FINAL** — v2.2.0-rc1 prerelease (2026-05-08 같은 날) 후 ADR-CHAIN-008 채택 + 5 PoC SQL Inventory isomorphic robust 사실 확보 + cooling-off 7d minimum 폐기로 즉시 final 격상. release-readiness §8.1 strict 7/7 ✅ + clean clone 재실행 ✅ + carry burst 0 ✅ + ADR-CHAIN-008 absorption ✅ + npm test 280 pass / 0 fail.

### 본 final entry 변경 사항 (rc1 → final)

- **ADR-CHAIN-008 신설** — `docs/adr/ADR-CHAIN-008-paradigm-cross-corroboration-policy.md` "MEDIUM × ≥ 5 PoC isomorphic = strong corroboration 자격 충족" 신정책. 5 PoC SQL Inventory 66.7% × 5 isomorphic + 6 차원 corroboration sum (paradigm + ORM + platform + language + responsibility + scale) + 2 정탐 사실 (raw query() / DSL builder QueryDSL realworld OSS = 2026년 부재 사실).
- **5 PoC corroboration robust** — PoC #06 (iBATIS 2 / 단일책임) + PoC #07 (iBATIS 2 / 다중책임) + PoC #08 (MyBatis 3 / Modern Stripes) + PoC #09 (TypeORM / NestJS) + PoC #10 (Spring Data JPA / DDD).
- **cooling-off 7d minimum 정책 영구 폐기** — DEC-2026-05-08-cooling-off-7d-폐기 (사용자 결단 "패기해줘" / DEC-2026-05-06-cooling-off-정책-폐기 정합 강화 / 사용자 명시 결단 우선 원칙).
- **release-readiness adr_registry dynamic 검사** — `scripts/release-readiness.js` hardcoded 5 ADR-CHAIN list → glob 동적 조회 (5 → 8 ADR-CHAIN 모두 검사). C-v2.2.x-release-readiness-adr-list resolved.

### v2.2.0 final 자격 — 7/7

1. ✅ chain harness 5 요소 enforcement 보존 (sub-plan-5 ~ v2.0.0 ~ v2.2.0)
2. ✅ ≥ 5 PoC corroboration (PoC #06/#07/#08/#09/#10 SQL Inventory isomorphic / paradigm + ORM + platform + language + responsibility + scale 6 차원)
3. ✅ §8.1 strict 7/7 통과 (release-readiness.js / 8 ADR-CHAIN dynamic)
4. ✅ 233 unit test pass (14 workspace + \_shared / 280 total / 0 fail)
5. ✅ clean clone 재실행 통과 (272 files build / version sync 3/3)
6. ✅ carry burst 0건 + ADR-CHAIN-008 absorption (cooling-off Day 1 검증 완료)
7. ✅ Senior F4 critique 검증대 통과 (D 검증 4종 모두 ✅ / "결단 burst risk 사실 ❌")

### v2.2.0 → v2.2.x patch 정책 (Senior F7 정합)

v2.2.x patch trigger:

- release-readiness regress 1+
- Senior HIGH 1+
- 7일 carry > 3건
- 사용자 finding burst (guides 보강 / common-errors 추가)

### v2.3.0 minor plan 초안 (사용자 승인 ❌)

`~/.claude/plans/g-v2.3.0-minor-plan.md` 작성 (Tier 1 추천 3 묶음):

- C-v2.2.0-8 Gartner TIME 2축 매핑 (`time_classification` 12번째 컬럼)
- C-v2.2.0-3 patterns_extension_v3 (cache / discriminator / typeHandler)
- C-v2.2.0-4 sub-rule Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종

본 plan = 초안 / v2.2.0 final 후 정식 plan 격상 의무.

---

## [v2.2.0-rc1] — 2026-05-08 (PRERELEASE — phase 4.8 sql-inventory 본체 격상 prerelease / Senior STOP signal 흡수 / historical 보존)

> **PRERELEASE** — v2.2.0 final 격상 trigger 자격 ❌ (paradigm-cross corroboration 부재 / PoC #06+#07 모두 Spring 4.1 + iBATIS 2 = scale-cross only). Modern ORM PoC #08 (carry C-v2.2.0-6) 종결 후 v2.2.0 final 별도 결단. 7d minimum cooling-off (Senior 권고 흡수 / 24h ❌). 같은 날 (2026-05-08) PoC #08+#09+#10 종결 + ADR-CHAIN-008 채택 + cooling-off 폐기로 final 격상.

### 변경 사항

**phase 4.8 (sql-inventory) 정식 단계 신설** (ADR-CHAIN-007):

- analysis stage 내부 / phase 4.7 후 / phase 5-1 + 5-2 전 / RDB 한정 sub-phase
- 11 컬럼 = 외부 6 (Opus 4.7 외부 조언 / sql_id / mapper_xml / called_from_screen / business_meaning / dynamic_branch / dependent_tables) + statement_type (Agent 1 강 권고 흡수 / MyBatis 14 표준 속성 / SP 식별 의무) + 본 추가 4 (uc_link / intent_vs_bug_classification / confidence / carry_flags)
- extraction_automation metric 의무 (외부 6 컬럼 자동화 ≥ 50% pass / PoC #06+#07 baseline 4/6 = 66.7%)
- carry_flags enum 8종 / external_call_out_of_scope 또는 DBA-read 시 confidence ≤ 0.80 if/then 의무
- patterns_extension_v2 = optional / Legacy iBATIS 한정 (PoC #07 D12 (b) nested patterns object)
- patterns_extension_v3 (cache / discriminator / typeHandler) = C-v2.2.0-3 carry

**본체 격상 자산 7 + workflow**:

1. `methodology-spec/deliverables/24-sql-inventory.md` (#23 사용 / #24 신규)
2. `schemas/sql-inventory.schema.json` (31번째 schema)
3. `schemas/meta-confidence.schema.json` `inputs_used` enum 13 → 14 (`sql_inventory` 추가)
4. `skills/analysis/phase-4-8-sql-inventory/SKILL.md` (skills 20 → 21)
5. `tools/sql-inventory-extractor/` (workspace 14번째 / 10 unit test)
6. `flows/analysis.phase-flow.{json,mermaid}` v2.1.0 → v2.2.0-rc1 (phase 4.8 entry)
7. `methodology-spec/workflow/phase-4-8-sql-inventory.md`
8. `docs/adr/ADR-CHAIN-007-phase-4-8-sql-inventory.md` (5 정책 명문화 + 외부 권위 19종 footnote)

**unit test 회귀 (232 → 233 / +1)**:

| workspace               | v2.1.1 | v2.2.0-rc1                                         |
| ----------------------- | ------ | -------------------------------------------------- |
| sql-inventory-extractor | (없음) | **10** (신설 / valid PoC #06+#07 + 5 invalid case) |
| 그 외 13 workspace      | 232    | 223 (재계산 결과)                                  |
| **합계**                | 232    | **233**                                            |

workspace-wide `npm test --workspaces` 233 모두 pass / 0 fail.

drift-validator `--check-layout`: 11 phases / 21 skills / 0 orphans / 0 missing ✅.

### 결단 의뢰 흡수 (research §B / D1=b / D7=α / D8=a / D4=b)

**Senior STOP signal** (paradigm-cross corroboration 부재) 흡수:

- (a) v2.2.0 final 격상 ❌ → v2.2.0-rc1 prerelease 7d minimum cooling-off
- (b) Modern ORM PoC #08 carry C-v2.2.0-6 = v2.2.0 final 격상 trigger
- (c) ADR-CHAIN-007 본문에 paradigm gap 우려 + PoC #08 의무 명문화

**Agent 1 (공식 docs) 빈틈 4건** 모두 흡수:

- statement_type 11번째 컬럼 (MyBatis 14 표준 속성)
- patterns_extension_v3 carry note (cache / discriminator / typeHandler)
- iBATIS 2 전용 dynamic 태그 enum carry (C-v2.2.0-7)
- ADR 본문에 Feathers + Gartner TIME + AWS MAP 인용 명문화

**Big-tech (Agent 2)** 권고:

- "Why not AWS SCT" 차별화 절 (deliverable §1.2)
- "SQL-level Inventory = 본 방법론 고유 contribution" 명시

### chain harness 5 요소 변경 ❌

analysis stage 내부 phase 추가만 — chain 1~4 driver / state schema / hooks / SDLC flow 변경 ❌.

### 미해결 (v2.2.0 final / v2.x carry)

| ID             | 항목                                                        | trigger                                   |
| -------------- | ----------------------------------------------------------- | ----------------------------------------- |
| **C-v2.2.0-6** | **Modern ORM PoC #08 (paradigm-cross corroboration)**       | v2.2.0 final 격상 trigger / 7d minimum 후 |
| C-v2.2.0-1     | Modern 환경 NoSQL/Prisma 정합 검증                          | ≥ 1 Modern PoC 후                         |
| C-v2.2.0-2     | sql-inventory baseline ratchet                              | v2.2.x patch / 사용 시                    |
| C-v2.2.0-3     | patterns_extension_v3 (cache / discriminator / typeHandler) | ≥ 2 Legacy PoC 후                         |
| C-v2.2.0-4     | sub-rule Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종   | 별도 plan                                 |
| C-v2.2.0-5     | sub-rule 다중책임 spectrum (AP-CAPITAL-005~011)             | ≥ 2 다중책임 PoC 후                       |
| C-v2.2.0-7     | iBATIS 2 전용 dynamic 태그 sub-classification               | v2.2.x patch                              |
| C-v2.2.0-8     | Gartner TIME 2축 매핑 (`time_classification` 12번째 컬럼)   | v2.3+                                     |
| C-v2.2.0-9     | "Why not AWS SCT" 차별화 절 §1 motivation 보강              | v2.2.0 final 시                           |

---

## [v2.1.1] — 2026-05-07 (PATCH — phase 4.7 ratchet trend baseline 자동 검증 / C-v2.1.0-5 carry resolved)

> **PATCH** — v2.1.0 carry C-v2.1.0-5 즉시 resolve. `coverage_strategy=ratchet` + `trend_required=true` 시 이전 측정 (baseline) 비교 자동 검증 신설. chain harness 5 요소 변경 ❌ / 본체 schema 변경 ❌.

### 변경 사항

**`tools/_shared/baseline.js` 확장** (findings-based ratchet 와 분리된 coverage trend 함수 3종):

- `readCoverageBaseline(path)` — baseline JSON read / 부재 시 null
- `writeCoverageBaseline(path, { coverage_ratio, coverage_strategy, project_id })` — baseline write
- `coverageTrendCheck(currentRatio, baseline, { tolerance: 0.01 })` — current ≥ baseline 검증 (단조 비감소 / tolerance ε=0.01 fluctuation 흡수)

**`tools/characterization-coverage-validator/` v0.1.0 → v0.1.1**:

- `--coverage-baseline <path>` flag 신규 (이전 측정 baseline 비교)
- `--write-coverage-baseline` flag 신규 (legacy 첫 진입 또는 trend pass 후)
- `coverage_strategy=ratchet` + `trend_required=true` 시 baseline 비교 자동 실행
- finding 신규: `coverage.trend_negative_ratchet` (high / current < baseline = regression block)

**unit test 회귀 (228 → 232)**:

| workspace                           | v2.1.0 | v2.1.1                    |
| ----------------------------------- | ------ | ------------------------- |
| characterization-coverage-validator | 10     | **14** (+4 ratchet trend) |
| 그 외 12 workspace                  | 209    | 209                       |
| release-readiness self-test         | 9      | 9                         |
| **합계**                            | 228    | **232**                   |

신규 4 unit test:

1. ratchet trend — first run (no baseline) → pass + recommend write
2. ratchet trend — current ≥ baseline → pass (positive 또는 flat)
3. ratchet trend — current < baseline → high finding (regression block)
4. ratchet baseline write — `--write-coverage-baseline` 옵션 file 생성

### Carry 갱신

- ✅ ~~C-v2.1.0-5 ratchet trend_required=true 자동 검증~~ → resolved
- (기타 carry C-v2.1.0-1~4, 6~7 보존)

### 진입 자격 (v2.1.1 PATCH)

| 자격                               | 충족                                         |
| ---------------------------------- | -------------------------------------------- |
| scope 작음                         | ✅ tool 1개 + \_shared 1개 (≤ 100 line code) |
| chain harness 5 요소 변경          | ❌                                           |
| 본체 schema 변경                   | ❌ (CLI flag + validator option 만)          |
| unit test 회귀 통과                | ✅ 232 / 0 fail                              |
| version-check 3 source sync v2.1.1 | ✅                                           |
| 14차 retract 위험                  | ↓ (carry resolve / 기존 자산 변경 ❌)        |

release / git tag `v2.1.1` 의무.

---

## [v2.1.0] — 2026-05-07 (MINOR — phase 4.7 (characterization) 본체 격상 / 의도 vs 버그 분리 + Given/When/Then snapshot acceptance oracle / ADR-CHAIN-006 / ≥ 2 PoC corroboration)

> **MINOR** — v2.0.0 MAJOR FINAL release (2026-05-07 / 같은 날) 직후 phase 4.7 본체 격상. ≥ 2 PoC corroboration 사실 확보 (PoC #06 Spring 4.1 Legacy + PoC #03 NestJS Modern retrofit / DEC-2026-05-07-poc-06-종결 + DEC-2026-05-07-poc-07-poc03-phase7-retrofit) → 본체 자산 6 + workflow spec 1 격상. chain harness 5 요소 변경 ❌ — analysis stage 내부 phase 추가만.

### v2.1.0 본체 격상 자산 (6 + 1 workflow)

| 자산                 | 위치                                                            | 의도                                                                       |
| -------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| deliverable          | `methodology-spec/deliverables/23-characterization-spec.md`     | 산출물 23 (#16~22 사용 중 / 23 신규)                                       |
| schema               | `schemas/characterization-spec.schema.json` (30번째)            | 4 sub-schema (snapshot + scenario + intentVsBug + coverage) + if/then 강제 |
| meta-confidence enum | `schemas/meta-confidence.schema.json` `inputs_used` 12 → 13     | `characterization` 추가                                                    |
| skill                | `skills/analysis/phase-4-7-characterization/SKILL.md`           | 단일 prompt 양 spectrum (skills 19 → 20 / Cursor/Cline/Aider 표준)         |
| tool                 | `tools/characterization-coverage-validator/` (workspace 13번째) | 8 검증 + 10 unit test                                                      |
| flow                 | `flows/analysis.phase-flow.{json,mermaid}` v1.5.0 → v2.1.0      | phase 4.7 entry + 5-x depends_on 갱신                                      |
| workflow spec        | `methodology-spec/workflow/phase-4-7-characterization.md`       | drift-validator 3-way 회귀 통과                                            |
| ADR                  | `docs/adr/ADR-CHAIN-006-phase-4-7-characterization.md`          | 4 정책 명문화 (위치 + 단일 prompt + 4분류 + ratchet)                       |

### 외부 권위 (research-v210 §4 / 12종)

- Michael Feathers, _Working Effectively with Legacy Code_ (2004) §13 — Characterization Test
- Gojko Adzic, _Specification by Example_ (2011) — Given/When/Then BDD
- Cucumber Gherkin Reference (Feature / Scenario / Tag 표준)
- Maldonado & Shihab (2015) — Self-Admitted Technical Debt (SATD/KL-SATD)
- Springer SQJ 2024 — KL-SATD ↔ SonarQube 학술
- PIT (PITest) / Stryker Mutator — coverage threshold 80% 산업 표준
- BullseyeCoverage — minimum coverage gate (80% line + 70% branch)
- jest-coverage-ratchet (npm) — legacy ratchet pattern
- Cursor / Cline / Aider — 단일 prompt + context retrieval / 분기 ❌

### research 빈틈 3건 흡수 (D6 = a / 모두 흡수)

1. Modern PoC self_recognized = 0 정합 (`schemas/characterization-spec.schema.json` description 명시)
2. ratchet schema 분리 (`coverage_target` + `coverage_minimum_legacy` + `coverage_strategy` enum)
3. Gherkin tag 표준 dual encoding (snapshot scenario `feature` + `tags` optional 필드)

### ≥ 2 PoC corroboration (§8.1 strict)

| PoC                                  | spectrum          | 명확 분류 비율      | self_recognized | ambiguous     |
| ------------------------------------ | ----------------- | ------------------- | --------------- | ------------- |
| **PoC #06** (Spring 4.1 + iBATIS)    | Legacy 적대성 4중 | 17/18 = 94% (D2 후) | 1 (AP-007 자조) | 1 (DBA carry) |
| **PoC #03 retrofit** (NestJS Modern) | Modern            | 30/30 = 100%        | 0 (자연 부재)   | 0             |

### unit test 회귀 (218 → 228)

| workspace                           | 직전 (v2.0.0) | 현재 (v2.1.0)                              |
| ----------------------------------- | ------------- | ------------------------------------------ |
| drift-validator                     | 47            | 47 (변경 없음 / phase 4.7 entry 자동 인식) |
| chain-driver                        | 68            | 68                                         |
| 그 외 10 도구                       | 94            | 94                                         |
| characterization-coverage-validator | —             | **10** (신설)                              |
| **workspace 합계**                  | 209           | 219                                        |
| release-readiness self-test         | 9             | 9                                          |
| **총 합계**                         | 218           | **228**                                    |

### Carry (v2.1.x patch / v2.x)

| ID         | 항목                                                               | trigger                       |
| ---------- | ------------------------------------------------------------------ | ----------------------------- |
| C-v2.1.0-1 | snapshot Gherkin (.feature) 변환 출력                              | v2.1.x patch / 사용자 finding |
| C-v2.1.0-2 | Modern 환경 명확 비율 ≥ 95% 자동 detect                            | v2.2+                         |
| C-v2.1.0-3 | acceptance oracle threshold dashboard                              | v2.x                          |
| C-v2.1.0-4 | F-PHASE7-001~004 일반화 검토 (≥ 3 PoC corroboration 후)            | ≥ 3 PoC corroboration         |
| C-v2.1.0-5 | ratchet `trend_required=true` 자동 검증 (baseline.js 통합)         | v2.1.x patch                  |
| C-v2.1.0-6 | ts-morph + 실 환경 (DB) snapshot 자동 추출                         | v2.x                          |
| C-v2.1.0-7 | sub-rule 추가 (Spring Boot 3 / FastAPI / Express 등 다른 spectrum) | 사용자 PoC corroboration      |

### 진입 자격 (사용자 결단 D6 = (a) / Senior cooling-off (a) 즉시 final)

| 자격                      | 충족                                    |
| ------------------------- | --------------------------------------- |
| ≥ 2 PoC corroboration     | ✅ PoC #06 + PoC #03 retrofit           |
| 명시 carry                | ✅ C-v2.1.0-1~7                         |
| 본체 격상 자산            | ✅ 6 + 1 workflow                       |
| unit test 회귀 통과       | ✅ 219 workspace + 9 release = 228      |
| build dist                | ✅ ai-native-methodology-v2.1.0/        |
| release-readiness 7/7     | ✅                                      |
| chain harness 5 요소 변경 | ❌ (analysis stage 내부만 / scope 작음) |

release / git tag `v2.1.0` 의무.

---

## [v2.0.0] — 2026-05-07 (MAJOR FINAL release — chain harness validated / SDLC 4단계 i-strict / clean clone 재실행 통과 / Senior F4 24h+ cooling-off 통과)

> **MAJOR FINAL** — 2026-05-06 v2.0.0-rc1 prerelease 후 24h+ cooling-off (Senior F4 요구사항) 통과. clean clone (`/tmp/aimd-clean-clone.*/`) 환경에서 npm install + npm test (218 pass) + release:check 7/7 ✅ + PoC #05 vitest 6/6 GREEN 모두 통과 → final tag 자격 충족.

### Final tag 진입 검증 (2026-05-07 / DEC-2026-05-07-v2.0.0-final)

| 검증 항목                     | 결과                                              |
| ----------------------------- | ------------------------------------------------- |
| clean clone npm install       | ✅ 83 packages / 0 vulnerabilities                |
| version-check (3 source)      | ✅ 모든 source v2.0.0-rc1 정합 (이후 v2.0.0 sync) |
| npm test (12 workspace)       | ✅ chain-driver 68 + 그 외 → 218 pass             |
| release:check §8.1 strict 7/7 | ✅ "v2.0.0 = release-ready"                       |
| PoC #05 vitest e2e            | ✅ 6/6 GREEN (chain 4 enforcement 정합)           |
| Senior F4 24h+ cooling-off    | ✅ rc1 (2026-05-06) → final (2026-05-07)          |

rc1 entry 의 모든 highlights (chain harness validated 5 요소 / SDLC 4단계 / §8.1 7/7 / breaking changes / Migration / unit test 회귀 / Carry) = v2.0.0 final 에서도 유지. 본 entry = final tag 진입 record + 검증 결과.

### 변경 사항 (rc1 → final)

- `plugin.json` / `package.json` / 본 CHANGELOG version: `2.0.0-rc1` → **`2.0.0`**
- `plugin.json` description: 198 unit test → **218 unit test** (실측 정합) + clean clone 재실행 통과 명시
- build artifact: `dist/ai-native-methodology-v2.0.0/` (cleanup round 2-E path)

### v2.0.0 → v2.0.x patch 정책 (Senior F7 정합)

v2.0.x patch trigger:

- release-readiness regress 1+
- Senior HIGH 1+
- 7일 carry > 3건
- 사용자 finding burst (guides 보강 / common-errors 추가 등)

### Carry (v2.0.x / v2.1+)

- v2.0.x: 본 release 에 누락된 작은 정돈 (cleanup round 2-F/G/H carry)
- v2.1+: chain-revisit-detector 진짜 LLM auto-invoke / tree-sitter semantic diff / 다중 사용자 driver state 동시성

---

## [v2.0.0-rc1] — 2026-05-06 (MAJOR PRERELEASE — chain harness validated / SDLC 4단계 i-strict / ≥ 2 PoC corroboration / §8.1 7/7 통과)

> **MAJOR bump 정당성** (semver §8): chain harness 가 v1.x 산출물 (한 방향 7대 추출기) 의 paradigm 을 대체. v1.x skill 호출 → v2.x chain-driven slash command (`/aimd-next`, `/aimd-stage`) 로 전환. 사용자 workflow backward-incompatible → MAJOR.
> **-rc1 prerelease** (Senior F4 흡수 / 14차 retract pattern 차단): sub-plan-5 commit 같은 날 final tag ❌ / rc1 → 24h+ 후 final.
> **청자**: 사내 onboarding + 외부 plugin install user. migration guide → `docs/MIGRATION-v1-to-v2.md`.

### Highlights — chain harness validated (5 요소 코드 enforcement)

| 요소                     | 구현                                                                                                 | sub-plan   |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ---------- |
| Driver / Orchestrator    | `tools/chain-driver/` workspace 12번째 (cli + 6 module / 60 unit test)                               | sub-plan-5 |
| State 영속               | `schemas/state.schema.json` + atomic write CAS + Windows fallback                                    | sub-plan-5 |
| Mechanical gate trio     | (i) state.blocked + (ii) cli exit 2 + (iii) PreToolUse permissionDecision=deny                       | sub-plan-5 |
| Skill auto-invoke (D21') | `hooks/hooks.json` UserPromptSubmit + PreToolUse / suppressOutput=true / additionalContext 차단 문구 | sub-plan-5 |
| Chain-revisit detector   | `revisit-detect.js` git diff --numstat + LOC threshold + ignore-globs                                | sub-plan-5 |

### What's new

- **SDLC 4단계 chain harness** (DEC-2026-05-06-v2.0-i-strict-채택): chain 1 planning → chain 2 spec (behavior + acceptance + 산출물 통합) → chain 3 test (RED) → chain 4 impl (GREEN / 100% test pass).
- **chain validator 4종** (sub-plan-3a/3b): planning-extraction / chain-coverage / spec-test-link / test-impl-pass-validator.
- **chain skill 13** (sub-plan-4): \_base 2 + planning 3 + spec 3 + test 3 + implement 2.
- **chain stage flow 5** (sub-plan-4): {analysis,planning,spec,test,implement}.phase-flow.{json,mermaid} + sdlc-4stage-flow.{json,mermaid} 통합 SSOT.
- **5 ADR-CHAIN** (sub-plan-2 + sub-plan-5): chain-4-stage-enforcement / go-stop-gate / revisit-loop / test-runner-invocation-contract / driver-state-machine.
- **release-readiness.js** (sub-plan-6): §8.1 strict 7/7 자동 검사 + 9 self-test (Senior F3 — file presence ❌ / content-aware delegated tool).
- **drift-validator `--check-state-flow-consistency`** (sub-plan-6 / sp5-c7): state.schema enum ↔ sdlc-4stage-flow stages 정합 build-time 검증.

### PoC corroboration (≥ 2)

| PoC                              | Scope                                                                      | Status           |
| -------------------------------- | -------------------------------------------------------------------------- | ---------------- |
| **PoC #05 sample-user-register** | chain 1~4 e2e single-cycle (2 UC + 2 BR + 2 TC + 2 IMPL / vitest 6/6 pass) | corroboration #1 |
| **PoC #03 NestJS retrofit**      | chain 1~2 + chain 3 RED dry-run (2 UC subset / signup + login)             | corroboration #2 |

### §8.1 strict 7/7 (release gate)

```
✅ 1. poc_corroboration: 2 PoC
✅ 2. real_tool_evidence: 5종 물증 7 필드 (10 fields) all present / sha256 valid
✅ 3. validators_violation: 4 validators all 0 critical/high
✅ 4. chain_coverage: 1.0 / threshold 0.85
✅ 5. adr_registry: 5 ADR-CHAIN 모두 status: 승인됨 + 결정 section
✅ 6. matrix_greenness: forward=1 / backward=1 / cells=2 / green=2
✅ 7. e2e_cycle_pass: pass=6 / fail=0 (chain 4 GREEN)
```

### Breaking changes

1. **Workflow paradigm**: v1.x = `/init` → 산출물 → 끝. v2.0 = `chain-driver init` → 4 stage gate. v1.x skill 직접 호출 시 mechanical gate trio 가 차단할 수 있음.
2. **state.json 영속 의무**: 사용자 프로젝트에 `.aimd/state.json` 자동 생성 (chain-driver init). v1.x = 영속 state 없음.
3. **PreToolUse hook**: `.aimd/output/**` 대상 Write/Edit 시 driver 가 차단 가능 (state.blocked=true 일 때).
4. **harness 호칭**: "한 방향 추출기" ❌ → "SDLC 4단계 chain harness". README + plugin.json description 변경.

### Migration

`docs/MIGRATION-v1-to-v2.md` 참조.

### unit test 회귀 (210 = 201 workspace + 9 release-readiness)

| 영역                        | v1.5.0 | v2.0.0-rc1               |
| --------------------------- | ------ | ------------------------ |
| drift-validator             | 44     | **47** (+3 state-flow)   |
| 그 외 10 도구               | 94     | 94                       |
| chain-driver                | —      | **60** (sub-plan-5 신설) |
| **workspace 합계**          | 138    | **201**                  |
| release-readiness self-test | —      | **9**                    |
| **총 합계**                 | 138    | **210**                  |

### Carry (v2.0.x → v2.1+)

- sp6-c1 RealWorld scale e2e (PoC #03 진짜 jest + impl) — v2.1+
- sp6-c2 intervention-log dashboard — v2.1+
- sp6-c3 Auto Mode 차단 임계 분포 분석 — v2.1+
- sp6-c4 PoC #04 retrofit (FE 트랙) — v2.1+ (v2.0 = BE-only corroboration / Senior F7)
- sp6-c5 tree-sitter semantic diff (sp5-c1) — v2.x
- sp6-c6 다중 사용자 driver state 동시성 (sp5-c2) — v2.x
- sp6-c7 hooks 진짜 LLM auto-invoke (sp5-c3) — v2.x
- sp6-c8 chain-driver chaos test (Senior F5 — CAS race / JSONL concurrency / mid-stage SIGINT) — v2.0.x

### Cleanup round 2-E (2026-05-06 / DEC-2026-05-06-cleanup-round-2-E / build path 정합)

사용자 명시 결단 — `dist/internal-v<version>/` → **`dist/ai-native-methodology-v<version>/`**.

v1.4.3 시점 `internal-` prefix 가 v2.0 paradigm + plugin user 환경 path (`~/claude-plugins/context-ops-v<version>/`) 와 stale. paradigm change cascading drift 추가 회수.

7 자산 갱신: `scripts/build-plugin.js` (line 2 + 123) / `README.md` (line 80, 171) / `guides/common-errors.md` / `templates/adoption/CLAUDE.md` / `templates/README.md` / project root `CLAUDE.md`. historical (archive + DEC-historical + CHANGELOG entry) 보존.

dist 256 files (변경 0 / path rename) / shasum -c 255 OK.

### Cleanup round 2-C / 2-D (2026-05-06 / DEC-2026-05-06-cleanup-round-2-C-D / journey 자산 + project root sync)

cleanup round 2 series **마지막 단계**.

**Round 2-C** = `guides/` 디렉토리 신설 (5 file):

- `getting-started.md` (시나리오 A/B/C + 10분 walkthrough)
- `chain-harness-guide.md` (chain-driver mental model + state.json + 5 요소)
- `common-errors.md` (FAQ 14건)
- `first-prompt-cookbook.md` (자연어 → skill 34 매핑)
- `guides/README.md` (navigation)

**Round 2-D** = project root `CLAUDE.md` v1.4.3 → v2.0.0-rc1 라벨 sync + guides/ 추가 (LLM 자동 컨텍스트 / dist 미포함).

dist 251 → **256** files (+5) / shasum 255 OK. build-plugin.js INCLUDE 에 'guides' 추가.

**cleanup round 2 series 종결** — 사용자 진짜 의도 ("정돈 + 각 폴더 visible + journey friction 해소") 모두 정합:

- 1 (`80cb783`) — docs/ archive 격리
- 2-A (`b25a8ad`) — paradigm sync (327 → 241)
- 2-B (`307f55b`) — 10 신설 (사용자 진짜 핵심)
- 2-B 후속 (`8b7effe`) — 9 도구 표준화 + 10 placeholder
- 2-C/2-D (현재) — journey 자산 + project root sync

**Carry (v2.1+)**: CHANGELOG 추가 격리 / guides 보강 / mermaid 시각화 / v2.0.0 final tag.

### Cleanup round 2-B 후속 (2026-05-06 / DEC-2026-05-06-cleanup-round-2-B-followup / 표준화 + placeholder 정돈)

Round 2-B 후속 — (1) 9 도구 README 표준 schema 통일 (Purpose / When / In / Out / Exit / Siblings / 참조) / (2) 10 placeholder README 정돈 / (3) schemas/README 갱신 (11 → **29 schema**).

| 영역               | 처리                                                                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9 도구 표준 schema | chain-coverage / decision-table / drift / formal-spec-link / planning-extraction / spec-test-link / spectral / static / traceability                                       |
| 10 placeholder     | skills/{test,planning,implement} 활성 / skills/design + agents/design + templates/design v2.x carry / agents/analysis + templates/{test,planning,implement} lifecycle 정합 |
| schemas/README     | chain v2 6 + state 3 + BE 5 + FE 8 + cross-cutting 4 + 메타                                                                                                                |
| dist file          | 251 (변경 없음)                                                                                                                                                            |
| 변경 file          | 20                                                                                                                                                                         |

stale 메시지 제거 ("v1.4.x analysis only" → v2.0.0-rc1 chain harness validated 정합) / Sibling cross-link 그래프 완성. shasum 250 OK.

**Carry**: Round 2-C (사용자 journey 자산) + Round 2-D (project root CLAUDE sync).

### Cleanup round 2-B (2026-05-06 / DEC-2026-05-06-cleanup-round-2-B / 각 폴더 README 정돈)

사용자 reframe 2차 ("각 폴더 자산 정돈 + 참조 + 호출 visible") **핵심 의도 정합** — 부재 README 10 신설 (6 폴더 + 4 도구). 표준 schema (Purpose / When / In / Out / Exit / Siblings / 참조) 통일.

| 영역                                   | before | after         |
| -------------------------------------- | ------ | ------------- |
| dist files                             | 241    | **251** (+10) |
| 부재 README                            | 10     | **0**         |
| 도달 path "각 폴더 정돈 / 참조 / 호출" | ❌     | ✅            |

**6 폴더 README 신설**: `tools/` 12 도구 cadence table / `methodology-spec/` phase × deliverable × schema 매트릭스 / `agents/` / `skills/` / `hooks/` / `templates/`

**4 도구 README 신설**: `chain-driver/` 5 요소 enforcement / `_shared/` / `schema-validator/` / `test-impl-pass-validator/` no-simulation 핵심

**Carry**: Round 2-B 후속 (9 도구 표준화 + 10 placeholder 정돈) + Round 2-C (journey 자산) + Round 2-D (project root CLAUDE).

### Cleanup round 2-A (2026-05-06 / DEC-2026-05-06-cleanup-round-2-A / plugin artifact 정돈)

v2.0.0-rc1 build artifact paradigm sync — 사용자 reframe 2회 ("정돈 ≠ 다이어트" → "각 폴더 정돈 + 참조 + 호출 visible") 후 3 agent 병렬 (UX / SSOT / journey) 으로 **8 카테고리** 식별. 본 round = Critical 5 (paradigm sync + CHANGELOG split + dist tools noise + flows SSOT + ADOPTION-README 처분).

| 영역                                         | before                       | after                                                          |
| -------------------------------------------- | ---------------------------- | -------------------------------------------------------------- |
| dist files                                   | 327                          | **241** (-86 / -26%)                                           |
| paradigm version (CLAUDE/README/marketplace) | v1.3.0 / v1.4.2 / v1.x stale | all **v2.0.0-rc1**                                             |
| `CHANGELOG.md`                               | 1865 line                    | **1060 line** (v1.4+) + `CHANGELOG-HISTORY.md` 820 line (신규) |
| dist 안 test/corpus/fixtures                 | 80+ files                    | **0**                                                          |
| `ADOPTION-README.md` (dist root)             | 1 (별칭)                     | 0 (단일 entry-point)                                           |

**갱신**: `marketplace.json` (chain harness 정합) / `templates/adoption/CLAUDE.md` (dist root alias) v1.3 → v2.0.0-rc1 rewrite / `README.md` v1.4.2 → v2.0.0-rc1 rewrite / `flows/README.md` sdlc-4stage SSOT 명시 / `scripts/build-plugin.js` EXCLUDE + ADOPTION 별칭 비활성. **Carry (Round 2-B/2-C/2-D)**: 각 폴더 README 정돈 (사용자 진짜 핵심) / 사용자 journey 자산 신설 / project root CLAUDE 갱신. no release / no tag / v2.0.0 final 자격 영향 ❌.

### Cleanup round 1 (2026-05-06 / DEC-2026-05-06-cleanup-round-1 / B-only)

v2.0.0-rc1 직후 사용자 명시 요청 정리 — `docs/` 활성 + 폐기 혼재 → 9 파일 `archive/` 격리.

| 영역       | before | after                                                                            |
| ---------- | ------ | -------------------------------------------------------------------------------- |
| `docs/`    | 39     | **30** (-9)                                                                      |
| `archive/` | 13     | **22** (+9 / `v1.3-adoption/` 6 + `v1.4-evaluation/` 1 + `phase-a-iteration/` 2) |

- **B-only**: `docs/adoption/*` 5 + `docs/v1.3-promotion-report.md` + `docs/v1.4-evaluation-report.md` + `docs/phase-a-iteration-{guide,0-preflight}.md` 9 파일 git mv (rename / git history 보존) + `rmdir docs/adoption/`
- **Link rot 차단** 11건: project root `CLAUDE.md` 4 + `README.md` 4 + `STATUS.md` 2 + `flows/README.md` 1
- **Skip per 사용자**: A (PoC 진행 로그 17) + C (plan-phase 13) — "poc 쪽은 신경 안써도 됨"
- **Historical 보존**: DEC-\* 안 옛 경로 / archive 자체 ref / CHANGELOG entry / .claude/ 작업 로그 = 갱신 ❌
- **Carry (cleanup round 2)**: 4 hub (CLAUDE/STATUS/CHANGELOG/INDEX) v2.0 정보 3중 누적 통합 (별도 라운드 / v2.0.0 final 후)

no release / no tag / 본체 commit 만 / release-readiness 7/7 무관 / v2.0.0 final 자격 영향 ❌.

### v2.0.0-rc1 → v2.0.0 final

- **동일 commit 같은 날 final tag ❌** (Senior F4 / 14차 retract pattern 차단).
- final = 2026-05-07 이후 + clean clone 1회 PoC #05 e2e 재실행 통과 시.
- v2.0.1 trigger 명문화 (Senior F7): release-readiness regress 1+ / Senior HIGH 1+ / 7일 carry > 3.

---

## [v1.5.0] — 2026-05-03 (MINOR — ADR-BE-001 negative-space corroboration 정식화 + error-mapping-spec deliverable 16 + phase-5-error-mapping skill 신설)

### 배경 — §8.1 strict 정합 검증대 두 번째 통과 (negative-space 변형)

직전 v1.4.5 PATCH 에서 AP-API-001 의 3 BE PoC negative-space isomorphic 자동 회귀 도구 종결 (Spring rule + NestJS sub-rule). 본 MINOR = ADR-FE-007 (positive-space — 4 PoC 모두 anti-pattern 보유 / 2026-05-02 첫 통과) 의 negative-space variant 정식화.

ADR-FE-007 ↔ ADR-BE-001 대칭 입증:

| 패턴               | ADR            | 정의                                | evidence                                                                   |
| ------------------ | -------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| **positive-space** | ADR-FE-007     | N PoC 가 같은 anti-pattern 을 보유  | 4 PoC 모두 JWT 보안 위반 (Java + Hexagonal + NestJS + React)               |
| **negative-space** | **ADR-BE-001** | N PoC 가 같은 정합 contract 를 부재 | 3 BE PoC 모두 error mapping contract 부재 (Spring 2.5 + Spring 3 + NestJS) |

### 산출

#### `docs/adr/ADR-BE-001-negative-space-corroboration.md` 신설 (핵심)

negative-space corroboration 패턴 정식화. patterns ≥ N (strict ≥ 3) 임계 자연 충족 자격을 "contract 부재" 도 동등 인정. evidence 4종 의무 (contract_absent + negative_effect + industry_standard + automatic_regression_capable).

#### `schemas/error-mapping-spec.schema.json` 신설 (deliverable 16)

BE error contract 자동 추출 명세. 주요 필드:

- `exception_handlers[]` — Spring @ControllerAdvice / NestJS @Catch / global filter 발견 표 (빈 배열 = negative-space evidence)
- `http_status_mapping[]` — 도메인 예외 ↔ HTTP status × `mapping_mechanism` enum 8종 (`throw_unmapped` = AP-API-001 trigger)
- `decorator_drift[]` — NestJS-specific (post_default_201_for_login / apiresponse_201_for_delete 등 5 enum)
- `negative_evidence` — ADR-BE-001 정식 evidence 4종 (contract_absent + negative_effect + industry_standard + automatic_regression_capable)
- `framework_neutrality_score` — 정량 (1.0 목표 / framework 무관 표준)
- `ap_links[]` — 회귀 / 발견 antipattern ID

#### `skills/analysis/phase-5-error-mapping/SKILL.md` 신설

phase 5-1 (api) 의 신규 발동 skill. frontmatter description = "Use when project is BE (Spring / NestJS / Express) AND has REST API endpoints that throw domain exceptions OR uses status code decorators (@Post / @ApiResponse)".

9 절차:

1. Framework detection (spring / nestjs / etc.)
2. Exception handler scan (0 hit = negative-space trigger)
3. Semgrep custom rule 실행 (Spring rule + NestJS sub-rule)
4. ADR-010 baseline + ratchet 통합
5. HTTP status mapping 표 작성
6. NestJS decorator drift 분기
7. negative_evidence 4종 작성 (ADR-BE-001 정합)
8. AP 등재 (AP-API-001 cross-PoC 평가)
9. error-mapping-spec.json 작성

#### `flows/analysis.phase-flow.json` v1.4.4 → v1.5.0

phase 5-1 (api) 의 `outputs` 에 `error-mapping-spec.json` 추가 + `skills` 에 `phase-5-error-mapping` 추가. version_milestones v1.5.0 entry 추가.

#### `methodology-spec/skills-axis.md` §5 매핑 표 갱신

phase 5-1 (api) row 에 `phase-5-error-mapping` (v1.5.0 신설) 추가.

### §8.1 strict 정합 검증대 두 번째 통과

| 단계                        | 결단                                                |
| --------------------------- | --------------------------------------------------- |
| ADR-FE-007 (2026-05-02)     | §8.1 strict 정합 검증대 첫 통과 (positive-space)    |
| **ADR-BE-001 (2026-05-03)** | §8.1 정합 검증대 두 번째 통과 (negative-space 변형) |

→ §8.1 정합 + cross-PoC patterns 임계 평가 + negative-space 변형 정식화 + 본체 격상 결단 절차 확장.

### b87cec5 + v1.4.5 PATCH 흡수

본 MINOR = b87cec5 (옵션 2′ Spring rule / no release) + v1.4.5 (옵션 2 NestJS sub-rule + AP-API-001 cross-PoC base 정합) 의 본체 ADR + schema + skill 정식 격상 통합.

### 검증

- ✅ ADR-BE-001 신설 (핵심 결단)
- ✅ schemas/error-mapping-spec.schema.json (JSON 정합 / 6 required 필드 + if/then)
- ✅ skills/analysis/phase-5-error-mapping/SKILL.md (frontmatter 정합)
- ✅ flows/analysis.phase-flow.json v1.5.0 (phase 5-1 skills 3 → 4)
- ✅ skills-axis.md §5 표 갱신
- ✅ drift-validator --check-layout: 9 phases / 19 skills / 0 orphans / 0 missing (18 → 19 신규 skill 등록)
- ✅ 4 tool 회귀 의무 (static-runner / drift-validator / formal-spec-link-validator / decision-table-validator)
- ✅ version-check 3-source sync at v1.5.0
- ✅ build artifact dist/internal-v1.5.0/ + CHECKSUMS.txt

### carry — v1.5.1+ PATCH (사용자 결단 영역)

- ts-morph NestJS @HttpCode + @Post + @ApiResponse 결합 decorator semantic 분석 (Semgrep pattern-not-inside 한계 보완 / AST-level)
- AP-API-001 PoC #01 evidence 보강 (Spring 2.5 source 적용 시 직접 confirm)
- schemas/antipatterns.schema.json 본체 antipattern 카탈로그 첫 등재 (ADR-FE-007 carry 와 합산)
- drift-validator BE corpus (error-mapping-equiv-01 + drift-01) — structural equivalence 부재 영역 / 적정 design 후 carry
- agents/analysis/error-mapping-extractor.md (thin agent / SKILL.md 만으로 v1.5.0 충족)
- methodology-spec/deliverables/16-error-mapping-spec.md (deliverable full spec)
- migration-cautions BE 신설 ("사내 신규 시스템 구축 시 error mapping contract 의무" 별 파일)

### Cooling-off 적용 (memory `feedback_decision_cadence_24h_cooling_off.md` 정합)

본 MINOR = ADR 신설 + schema 신설 → 적용 대상 (≥ 24h 권고). 단 사용자 명시 결단 ("나머지 진행") = 즉시 진행 정합 (memory edge case "사용자가 즉시 진행 명시 = cooling-off skip 정합 / retract risk 사용자 통보 의무"). retract risk 명시:

- ADR-BE-001 의 negative-space 변형 정의가 v1.6+ 외부 사용 시 재검토 가능
- schemas/error-mapping-spec 의 enum 8종 mapping_mechanism 이 framework 추가 시 확장 의무

---

## [v1.4.5] — 2026-05-03 (PATCH — error-mapping AP-API-001 자동 회귀 도구 BE 트랙 첫 진입 + NestJS decorator drift sub-rule)

### 배경 — 6 갭 카탈로그 옵션 2 진입 (Tier 1 #1 / negative-space corroboration)

직전 conversation 에서 분석 stage 산출물 갭 카탈로그 식별 (6 갭 × 5 Tier). Tier 1 #1 = error-mapping (AP-API-001 critical / 4 PoC 모두 contract 부재 = negative-space corroboration 자연 충족). 옵션 2′ (Spring rule + no release / commit `b87cec5`) 종결 후 옵션 2 (v1.4.5 PATCH / NestJS rule + AP-API-001 base 정합) 사용자 결단 진입.

### 산출

#### `tools/static-runner/rules/error-mapping-missing.yml` v1.4.4-pre → v1.4.5-pre 보강

**(1) Spring rule** (v1.4.4-pre 보존 / b87cec5 commit) — `internal.be.api.error-mapping-generic-exception-in-service`. @Service / @RestController / @Controller / @Component 안의 IllegalArgumentException / IllegalStateException / RuntimeException throw detect. PoC #02 ArticleService:184 정확 매칭 + Phase 4.5 round-trip 재생성 코드 exclude.

**(2) NestJS sub-rule** (v1.4.5-pre 신규) — `internal.be.api.error-mapping-nestjs-delete-201-decorator-drift`. `@Delete` + `@ApiResponse({status: 201, ...})` 결합 detect (decorator 순서 양방향 + async 변형 = 4 분기). PoC #03 article.controller.ts:65,68 + 81,85 + 97,99 4 op 정확 매칭. RFC 9110 §15.3.5 위반 (DELETE → 204 권고).

**(3) NestJS fixture** — `error-mapping-missing.ts` (3 positive + 3 negative case / Semgrep --test 1/1 ✅ pass).

#### AP-API-001 cross-PoC base 정합

PoC #02 + PoC #03 ap.json 양쪽에 `static_rule_link` 필드 추가:

| PoC                            | mechanism                                  | rule                                            | status       |
| ------------------------------ | ------------------------------------------ | ----------------------------------------------- | ------------ |
| PoC #01 (Spring 2.5)           | @ExceptionHandler 부재                     | (negative space / 신뢰도 0.65)                  | 향후 carry   |
| PoC #02 (Spring 3.3 Hexagonal) | throw new IllegalArgumentException         | error-mapping-generic-exception-in-service      | ✅ 자동 회귀 |
| PoC #03 (NestJS)               | @Delete + @ApiResponse 201 decorator drift | error-mapping-nestjs-delete-201-decorator-drift | ✅ 자동 회귀 |
| PoC #04 (React FSD)            | 해당 없음 (FE)                             | —                                               | —            |

→ §8.1 strict 평가: patterns ≥ 2 PoC isomorphic + 2 framework (Spring + NestJS) 자연 충족 / 단 본체 ADR-BE-002 (negative-space corroboration 패턴 정식화) 격상 = v1.5.0 MINOR carry.

### b87cec5 (옵션 2′) 흡수

본 v1.4.5 = b87cec5 commit (no release) 의 정식 release 통합. b87cec5 자체는 no release / 본체 commit 만 / a144b5a 패턴 정합 / `--extra-rules error-mapping-missing.yml` CI body scan 통합.

### 검증

- ✅ Semgrep 1.161.0 진짜 실행 (pip 채널 / Python 3.14 / no-simulation 정책 정합)
- ✅ Spring rule fixture --test 1/1 pass (5 positive + 5 negative)
- ✅ NestJS sub-rule fixture --test 1/1 pass (3 positive + 3 negative)
- ✅ body scan (970 files / 2 Code rules) → 0 false positive
- ✅ 4 tool 회귀: static-runner 11/11 + drift-validator 36/36 + formal-spec-link-validator 8/8 + decision-table-validator 11/11 = 66/66 pass

### carry — v1.5.0 MINOR (사용자 결단 영역)

- ts-morph NestJS @HttpCode + @Post + @ApiResponse decorator semantic 분석 (Semgrep pattern-not-inside 한계 보완)
- ADR-BE-002 negative-space corroboration 패턴 정식화 (ADR-FE-007 변형)
- schemas/error-mapping-spec.schema.json 신규 (formal-spec deliverable)
- skills/analysis/phase-5-error-mapping/SKILL.md 신규
- drift-validator BE corpus 2 pair (error-mapping-equiv-01 + drift-01)

### Cooling-off 적용 ❌ (memory `feedback_decision_cadence_24h_cooling_off.md` 정합)

본 PATCH = additive only (rule 1 신규 + 기존 rule fixture 보강 + ap.json static_rule_link 추가 + version bump). 본체 구조 변경 0 / 디렉토리 rename 0 / cross-reference 치환 0 / ADR 신설 0 / schema 신설 0 → 즉시 진행 정합 (a144b5a + b87cec5 cadence 입증).

---

## [v1.4.4] — 2026-05-02 (PATCH — manifest SSOT 정식 승격 + skills-axis 명세 + drift-validator 3-way 검증)

### plan-v144-manifest-ssot.md 진행 결과 (a — Senior 의 NOW/v2.0 분할 권고의 NOW 부분)

**배경** — 직전 conversation 에서 "Phase 4.5 → 5 정수 재매김" 사용자 제안 → 3 에이전트 병렬 토론 (Official + Industry + Senior) → 6 결단 거리 정리 → Senior 메타 권고 = "rename (b) 은 v2.0 carry / NOW (a) 는 manifest SSOT 정식 승격 + drift fix + validator 강제 만". §8.1 단일 PoC 과적합 회피 정책상 본 rename 의 PoC corroboration = 0 건 / v2.0 design/test stage PoC 진입 시 자연 충족 (본 plugin 의 정책이 본 plugin 자신의 변경을 차단하는 메타 정합).

**측정 가능한 finding (본 PATCH 의 정당화 근거)**:

- `flows/analysis.phase-flow.json` version `v1.2.2` (plugin 현재 v1.4.3 — stale)
- v1.4 FE 트랙 신규 skill 4개 (`phase-5-form-validation` / `-state-map` / `-type-spec` / `-visual-manifest`) manifest 미등록
- skills 디렉토리의 phase 번호 = 산출물 번호 prefix axis (manifest phase ID 와 다른 의미체계) — 정책 명문 부재로 drift 위험 누적

### 산출물

#### manifest 정식 SSOT 승격 — `flows/analysis.phase-flow.json`

`v1.2.2 → v1.4.4`. 9 phase 보존 + 각 phase 에 `skills` 배열 필드 신설 (manifest ↔ skills 매핑 명시).

매핑 (skill 디렉토리명 → manifest phase ID):
| skill 디렉토리 | manifest phase ID | 비고 |
|---|---|---|
| `phase-0-input` | 0 | |
| `phase-1-inventory` | 1 | |
| `phase-5-schema-erd` | 2 (db) | skills 의 phase-5 prefix = 산출물 #5-b (DB schema) axis |
| `phase-2-architecture` | 3 (arch) | skills phase-2 = 산출물 #2 |
| `phase-3-domain`, `phase-4-rules`, `phase-5-form-validation` | 4 (business-logic) | 4 sub-area |
| `phase-4-5-cross-validation` | 4.5 (formal-spec) | |
| `phase-5-openapi`, `phase-5-rules` | 5-1 (api) | |
| `phase-5-state-map`, `phase-5-visual-manifest`, `phase-5-type-spec` | 5-2 (ui) | |
| `phase-6-quality` | 6 | |
| `aspect-a11y`, `aspect-i18n`, `aspect-static-security`, `aspect-legacy` | cross_cutting | `cross_cutting.aspects.skills` 신설 |

#### `methodology-spec/skills-axis.md` 신설 (D-D=D1)

phase ID 와 skills 디렉토리 axis 분리 정책 명문. 향후 신규 skill 추가 절차 / 신규 phase ID 추가 절차 (MAJOR change — v2.0 carry) 정책화.

#### drift-validator 0.2.0 → 0.3.0 — 3-way layout 검증 추가

- `tools/drift-validator/src/check-phase-skills.js` 신규 module
- `tools/drift-validator/src/cli.js` `--check-layout` flag 추가
- `tools/drift-validator/test/check-phase-skills.test.js` 신규 test (3 case)
- 검증 항목 4종:
  1. manifest.phases[].spec_file → workflow/ 안에 존재
  2. manifest.phases[].skills[] → skills/analysis/ 안에 SKILL.md 보유
  3. cross_cutting.aspects.skills[] → skills/analysis/ 안에 SKILL.md 보유
  4. 역방향 — disk skill 모두 manifest 등록 (orphan 0 의무)
- 본 워크스페이스 검증: `✅ 9 phases / 18 skills declared / 0 orphans / 0 missing`
- 36 test pass (신규 3 + 기존 33)

#### CI ratchet — `.github/workflows/drift-check.yml` 신설

PR + main push 시 자동 실행 4 step:

1. version-check 3-way sync (plugin.json ↔ CHANGELOG ↔ package.json)
2. drift-validator deps + test suite
3. drift-validator `--check-layout` (3-way 정합 / 0 orphan + 0 missing 의무)
4. `npm run build:diff-check` (dist artifact freshness)

### b (rename) carry — v2.0 진입 시점

본 PATCH 의 비포함 :

- file/디렉토리 rename — 0건
- phase 번호 체계 변경 — 0건
- workflow / skills / deliverables 의 phase 인용 변경 — 0건
- PoC 산출물 안 "Phase 4.5" 인용 — 보존 (§8.1 corroboration evidence)

b 의 plan.md 는 v2.0 design/test stage PoC 진입 시 작성 — Senior 권고 ("v2.0 schema 변경 window 에 묶이므로 migration tax 0").

### Lessons Learned (a 의 사전 가정 검증)

- plan.md F-1 "manifest = workflow 정합" → ✅ 입증 (`flows/analysis.phase-flow.json` 의 phase id 배열 ↔ `methodology-spec/workflow/phase-*.md` 파일명 1:1)
- plan.md F-2 "manifest stale (v1.2.2)" → ✅ 입증 + 본 PATCH 에서 v1.4.4 갱신
- plan.md F-3 "drift-validator 절반 깔려 있음" → ✅ 입증 (`normalize-phase-flow.js:15-16, 117-129`) + 신규 layout 검증은 별도 module 로 분리 (책임 분리)
- plan.md F-4 "skills 가 다른 axis" → ✅ 정확 — skills 의 phase 번호 = 산출물 번호 prefix (의도된 axis / 일부는 진짜 drift)
- "drift-check.yml 강화" 가 plan 본문에 적혔으나 실제는 신설 (CHANGELOG v1.2.1 entry 의 "drift-check.yml CI" 는 plan 단계 정의만 / 실 구현 부재) — Senior 가 짚은 "측정 가능한 drift" 의 또 한 갈래

### Carry-over (변경 없음)

- v1.4.2 §6 신규 carry (JWT secret weak / RSA private key Semgrep custom rule) → ✅ 종결 유지 (a144b5a)
- adoption 폐기 + workspace 단일 통합 + dist build script (v1.4.3) → ✅ 유지

---

## [v1.4.3] — 2026-05-02 (PATCH release — adoption 폐기 + workspace 단일 통합 + build script 1차 도입)

### 14차 결단 (DEC-2026-05-02-plugin-first) 1일 retract

"본체 = plugin source / adoption/dist = artifact" 분리 워크스페이스 발상 → retract.

**사유** (Industry 사례 + Senior 권고):

- adoption/dist artifact 발상 = 단일 source-of-truth 위배
- frontmatter provenance + build script 만으로 동등 효과 + sync 부담 ↓
- Babel/Yarn/Sentry 3 사례 동일 lesson — "별도 dist sync 비용 > 통합 비용"

### adoption 폐기 + 자산 흡수

`ai-native-methodology-adoption/` → `.deprecated-2026-05-02/` rename (30일 cooldown 후 사용자 수동 검토 / 자동 삭제 ❌).

**흡수 자산 (Agent 4 발견 — 사용자 직접 편집)**:

- `templates/adoption/CLAUDE.md` ← `adoption/dist/internal-v1.3/CLAUDE.md` (정책 23 inline / NestJS 4 + Spring 5 PoC #02 추출)
- `templates/adoption/README.md` ← `adoption/dist/internal-v1.3/README.md` (사내 진입점 READ FIRST)
- `archive/methodology-v1.1/` ← `adoption/methodology-v1.1/` (13 metadata)
- `docs/adoption/v1.3-plan.md` ← `adoption/work/plan.md` (340 라인)
- `docs/adoption/v1.3-status.md` ← `adoption/work/STATUS.md` (58 라인)
- `docs/adoption/v1.3-decisions-index.md` ← `adoption/work/decisions/INDEX.md` (42 라인)
- `docs/adoption/lessons-learned-2026-05-02.md` (신규 / Senior 보강 §4)
- `docs/adoption/README.md` (진입점)

**폐기 (변경 0 또는 placeholder)**:

- `adoption/ai-native-methodology/` v1.3.0 클론 (workspace v1.4.3 superset)
- `adoption/dist/internal-v1.3/` 나머지 (build script 가 dist/internal-v1.4.3/ 로 대체)
- `adoption/work/research/` (빈 placeholder)
- `adoption/poc-fe-04-realworld-react/` (실 산출물 0 / workspace examples/poc-04-full-realworld-react/ 가 superset)

**외부 이관 carry**: `adoption/legacy-analyzer/` → `harness-engineering-study/` (사용자 결단 / lock 으로 본 commit 자동 미실행)

### Build script 1차 도입 (Phase A)

**신규 자산**:

- `package.json` (workspace root / private:true / devDeps only / scripts.build/build:check/version:check/build:diff-check)
- `scripts/build-plugin.js` (Official + Industry + Senior 보강 7건 반영)
  - explicit allow-list (VSCode `vsce` node_modules 사고 회피)
  - try/catch + Windows long-path (>260) 검증 (Official `fs.cpSync` Stability "1 - Experimental")
  - `../` traversal 금지 / self-contained 보장
  - SHA256 manifest `CHECKSUMS.txt` (Industry — Shopify CLI v3.50+)
  - templates/adoption/CLAUDE.md + README.md → dist root 동시 복사 (Agent 4 발견)
  - dry-run mode (`--check`)
- `scripts/version-check.js` (plugin.json + CHANGELOG + package.json 3 source 정합 / source-of-truth = plugin.json)
- `.gitignore` 신규 (`/dist/` `node_modules/` `package-lock.json`)

**Phase A 운영**:

- workspace `marketplace.json` `"source": "./"` 그대로 유지 (v1.4.2 install 회귀 0)
- `dist/internal-v1.4.3/` = 부가 출력 (install 메커니즘 영향 0)

**Phase B carry** (사내 marketplace push 직전):

- marketplace.json `"source"` `"./"` → `"./dist/internal-v1.4.3/"` 전환
- `.github/workflows/release.yml` CI build 자동화 + dist 커밋 강제 gate
- `${CLAUDE_PLUGIN_DATA}` tool node_modules survive update 패턴
- 사내 ADR 1호 신설 (Anthropic 공식 build 정책 부재 → 사내 표준 정착)

### Lessons Learned (memory 자산화 후보)

1. **결단 cadence ≥ 24h cooling-off** (general — 다른 plugin 적용 가능)
   - 14차 결단 → 본 plan retract = 1일 (너무 빠름)
   - plan.md 비용 > revert 비용 역전 risk
2. **별도 dist workspace 운영 sync 비용 함정** (general)
3. **사용자 직접 편집 silent loss risk** (Agent 4 / general — adoption 폐기 시 dist customization 식별 의무)
4. **본 retract 자체 = 본 워크스페이스 specific** (§8.1 일반화 ❌ / 본체 자산화 ❌)

### Plugin sync (feedback_methodology_body_priority 정합)

- `.claude-plugin/plugin.json` version 1.4.2 → **1.4.3**
- `package.json` 신규 / version 1.4.3 정합
- tool 5종 자체 `tools/<name>/package.json` 독립 유지 (npm workspaces ❌)

### release note + DEC + tag

- `decisions/DEC-2026-05-02-adoption-폐기-build-step-신설.md` (신규 / D1~D7 결단 묶음)
- `docs/adoption/lessons-learned-2026-05-02.md` (신규 / Senior 보강)
- git tag `v1.4.3`

### carry 갱신 (v1.4.2 5건 → v1.4.3 7건)

- ✅ resolved: adoption 폐기 (본 commit) / build script 1차 도입 (Phase A)
- ⏳ adoption 폴더 rename (lock 으로 자동 실행 실패 / 사용자 수동 처리 carry)
- ⏳ legacy-analyzer 외부 이관 (사용자 결단 / git filter-repo subtree extract carry)
- ⏳ Phase B build artifact 사내 marketplace push (carry)
- ⏳ release.yml CI build 자동화 (carry)
- ⏳ 결단 cadence ≥ 24h cooling-off memory 자산화 (즉시)
- 보존: sarif severity / RSA+JWT 길이 custom rule / F-FE-006 / i18n / v1.5

---

## [v1.4.2] — 2026-05-02 (PATCH release — AP-FE-SECURITY-001 진짜 도구 직접 confirm + custom rule 첫 실현 + drift-check.yml CI ratchet)

### AP-FE-SECURITY-001 진짜 도구 직접 confirm (implicit 목표 종결)

v1.4.0 carry 1 의 implicit 목표 (4 PoC isomorphic AP-FE-SECURITY-001 진짜 도구 직접 confirm) 완전 종결.

흐름:

- v1.4.0: Semgrep grep fallback 1건 매칭 (-5%p 패널티)
- v1.4.1: Semgrep p/owasp-top-ten 진짜 실행 / 0 findings (implicit 미달 / `react-jwt-in-localstorage` = jwt_decode 임포트 부재)
- v1.4.2: custom rule 작성 → 직접 매칭 1건 (implicit 종결)

매칭 결과:

- ruleId: `ai-native-methodology.tools.static-runner.rules.internal.fe.security.jwt-localstorage`
- file: `INPUT/src/shared/api/auth-storage.ts:20`
- 코드: `window.localStorage.setItem(TOKEN_STORAGE_KEY, token)` (raw JWT 저장)

### Custom Semgrep rule 첫 실현 (Sprint 4 long-tail carry 종결)

`tools/static-runner/rules/jwt-localstorage.yml` (신규):

- id: `internal.fe.security.jwt-localstorage` (fully qualified slug / `--rewrite-rule-ids` default ON 실측 정합)
- severity: `HIGH` (canonical / Official research Q1 갱신 정합)
- languages: `[js, ts]`
- pattern-either 4 분기 (Phase A → B → C 점진 발견):
  1. `localStorage.setItem("$KEY", $VAL)` + metavariable-regex
  2. `localStorage.setItem($KEY, $VAL)` + metavariable-regex (identifier branch)
  3. `window.localStorage.setItem("$KEY", $VAL)` + metavariable-regex (window. prefix)
  4. `window.localStorage.setItem($KEY, $VAL)` + metavariable-regex (window. + identifier)
- metavariable-regex: `(?i)(token|jwt|auth|access|bearer|session)`
- metadata: cwe CWE-922 / owasp [A02:2021, A07:2021] / references / category security

`tools/static-runner/rules/jwt-localstorage.ts` (신규 — Semgrep convention `<rule>.<ext>` / `.test.<ext>` ❌ 실측 정정):

- 7 positive + 3 negative cases
- 검증: `cd rules && semgrep --test --config jwt-localstorage.yml jwt-localstorage.ts` → **1/1 pass** ✅
- Windows 한국어 환경 `PYTHONUTF8=1` 의무 (yml 한글 message cp949 decode bug 회피 / Linux CI 환경 무관)

Sprint 4 README 의 "사내 custom rule (별도)" 1년 가까이 carry-over → v1.4.2 첫 실현.

### 본체 도구 격상 — static-runner 0.1.1 → 0.1.2 (feature add patch)

**Feature**: `--extra-rules <path>` 옵션 신규 (멀티 지정 가능)

- `runner.js` `Plugin.run()` + `SemgrepPlugin.mandatoryArgs` 갱신 — `extraRules.flatMap(r => ['--config', r])`
- `cli.js` `--extra-rules` 옵션 추가
- Semgrep `--config` 멀티 정합 (Official research Q2 입증)
- unit test 9 → 11 pass (+2 신규: extraRules emits multi --config / empty default)

### drift-check.yml CI ratchet 통합 (ADR-010 §2.3 첫 운영 입증)

PoC #04 full FE 트랙 신규 step:

```yaml
- name: run Semgrep on PoC #04 full (FE 트랙 / custom rule + ratchet)
  run: |
    node tools/static-runner/src/cli.js \
      --plugin semgrep \
      --target examples/poc-04-full-realworld-react/INPUT/src \
      --output examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-output \
      --ruleset p/owasp-top-ten \
      --extra-rules tools/static-runner/rules/jwt-localstorage.yml \
      --baseline examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-baseline.json \
      --ratchet
```

ratchet dry trial 검증:

- baseline = 0 findings
- novel = 1
- blocked = 1
- exit_code = **1** (CI fail trigger ✅)

→ ADR-010 §2.3 "novel critical/high = production blocker" 정책 첫 운영 입증.

### Official research Q4 carry 해소

Semgrep `--rewrite-rule-ids` default ON 실측 — SARIF ruleId = `<cwd-relative-path>.<rule-id>` (default ON / 자동 prefix 부여 / fully qualified slug 권고 정합).

다른 carry 3건 보존:

- (i) metadata `cwe`/`owasp`/`references` 공식 schema (registry mirror 권고)
- (ii) JS/TS `// ruleid:` prefix 공식 (통용 패턴 채택)
- (iii) SARIF `ruleId` 1:1 매핑 단언 텍스트 (example 입증 / 단언 부재)

### release note + DEC + tag

- `docs/v1.4.2-release-note.md` (신규)
- DEC-2026-05-02-v1.4.2-carry-2-3-종결
- git tag `v1.4.2`

### carry 갱신 (v1.4.1 5건 → v1.4.2 5건 = 3 보존 + 2 신규)

- ✅ resolved (v1.4.2): carry 2 (custom rule) + carry 3 (CI ratchet)
- 신규: sarif-to-finding 어댑터 severity 변환 (HIGH → medium) 검토 / RSA git commit + JWT 길이 custom rule
- 보존: F-FE-006 / i18n / v1.5

### Lessons Learned

1. Custom rule pattern 점진 발견 패턴 (Phase A → B → C 4 분기 보강)
2. Semgrep `--rewrite-rule-ids` default ON 실측 (research carry 해소)
3. sarif-to-finding 어댑터 severity 변환 검토 carry
4. Sprint 4 long-tail carry 같은 날 종결 패턴
5. 같은 날 v1.4.0 + v1.4.1 + v1.4.2 = 빠른 carry resolve cadence 입증

---

## [v1.4.1] — 2026-05-02 (PATCH release — release 같은 날 carry 1 즉시 종결 + 본체 도구 bug fix 1건)

### Semgrep 진짜 실행 (release note carry 1 종결)

research 검증 결과 Python 3.14 = Semgrep 1.161.0 공식 지원 (PyPI classifier `Python :: 3.14` / pyproject.toml `>=3.10` / glom #11460 closed) → release note §4.1 carry 가정 (Docker only) 결정적으로 깨짐 → release 같은 날 carry 1 즉시 종결.

**PoC #04 full INPUT/src/ 진짜 실행**:

- command: `semgrep scan --config p/owasp-top-ten --sarif --sarif-output <path> <target>`
- env: Python 3.14.1 / Semgrep 1.161.0 / pip 채널 / Windows 11 Pro / Windows tmp PermissionError (issue #11403) 재현 안 됨 (1.161.0 fix 가능성 입증)
- ruleset: `p/owasp-top-ten` (544 rules loaded / 76 rules run / 66 files / 2 ignored)
- duration: 6293 ms / findings: 0 / result_hash: SHA256 정상값 / source_commit_sha: 정상값
- 5종 물증 7 필드 모두 정상

**baseline 첫 작성 + ratchet dry trial**:

- grandfathered 0 / novel 0 / blocked 0 / exit_code 0
- ADR-010 외부 적용 첫 입증 (PoC #04 full)

**Implicit 목표 미달 → carry 2 신규 분리**:

- Semgrep `react-jwt-in-localstorage` 룰 = (a) jwt_decode 임포트 + (b) localStorage.setItem(jwt_decode(...))의 2단계
- yurisldk fork `auth-storage.ts:20` = `window.localStorage.setItem(TOKEN_STORAGE_KEY, token)` (raw token / `jwt_decode` 임포트 0건) → 룰 trigger 조건 불충족 → AP-FE-SECURITY-JWT-LOCALSTORAGE 직접 매칭 0건
- → carry 2 신규 (custom Semgrep rule 작성 / v1.4.2 또는 v1.5)
- → carry 3 신규 (drift-check.yml CI 통합 ratchet 모드 default / v1.4.2 또는 adoption)

### 본체 도구 격상 — static-runner 0.1.0 → 0.1.1 (bug fix patch)

본 carry 의 첫 진짜 실행 = 본체 도구 bug 2건 발견. no-simulation 정책 첫 적용 = 도구 자체 가치 검증 효과 동반 입증 .

- **Bug 1** — `tools/static-runner/src/runner.js:71` `require('node:fs').readFileSync(sarifPath)` ESM 환경 throw → catch silently swallow → `result_hash: null` (no-simulation 정책 핵심 필드 위조 차단 효과 깨짐)
  - Fix: `import { readFileSync, ... } from 'node:fs'` 추가 + `h.update(readFileSync(sarifPath))`
- **Bug 2** — `tools/static-runner/src/cli.js` `writeBaseline` 호출 시 `sourceCommitSha` 인자 누락 → `'unknown'` 기본값 (ratchet reproducibility 깨짐)
  - Fix: `detectGitSha(targetDir)` 함수 신설 + `git rev-parse HEAD` 추출 후 전달
- 검증: 9/9 unit test pass / 재실행 시 evidence.json `result_hash` SHA256 정상값 + `source_commit_sha` 정상값

### 신뢰도 단계 강화

- 진짜 도구 6 → **7종** (+ Semgrep)
- -5%p 패널티 제거
- PoC #04 full Phase 6 신뢰도 0.92 → 0.92~0.95 (단계 5 강화)

### Lessons Learned

1. release note carry 환경 가정 (Docker only) 채널 다양성 (pip/pipx/uv) 검증 누락 패턴 → memory `feedback_carry_environment_assumption.md` 신규
2. no-simulation 정책 첫 적용 = 도구 자체 가치 검증 (본체 도구 bug 발견)
3. Senior research 추정 over-estimate 입증 (RealWorld FSD 0 findings)
4. Silver bullet 부재 입증 (Semgrep p/owasp-top-ten 단독으로 4 PoC isomorphic JWT XSS 매칭 불가)

### release note + DEC + tag

- `docs/v1.4.1-release-note.md` (신규)
- DEC-2026-05-02-v1.4.1-Semgrep-carry-종결
- git tag `v1.4.1`

### carry 갱신

- v1.4.0 carry 4건 → v1.4.1 carry 5건 (3 보존 + 2 신규)
  - **resolved**: Semgrep 진짜 실행 ✅
  - **신규**: AP-FE-SECURITY-JWT-LOCALSTORAGE custom rule / drift-check.yml CI ratchet
  - **보존**: F-FE-006 / i18n / v1.5

---

## [v1.4.0] — 2026-05-02 (MINOR release — FE 트랙 정식 진입 / §8.1 strict 검증대 첫 통과)

### Stage 7 v1.4.0 MINOR release (2026-05-02 / 본 세션)

**사내 표준 v1.3.1 → v1.4.0 격상** = FE 트랙 정식 진입 + §8.1 strict 정합 검증대 첫 통과.

**release 자격 7/7 충족** (Senior +2):

1. 사상 정합 ✅
2. IR 4계층 ratchet 0.99 ✅ (target 0.95 / 4%p 초과)
3. 진짜 도구 6종 ✅ (Semgrep carry)
4. finding 6 ✅ (5~15 건강)
5. 신뢰도 0.92 ✅ (target 0.90 / ADR-009 단계 5)
6. 본체 격상 결단 ✅ (ADR-FE-007 신설 / 2건)
7. ADR carry 0 / 4 명시 carry-over ✅

**release note**: `docs/v1.4-release-note.md`

**4 명시 carry-over**:

- Semgrep CLI Docker 진짜 실행 (사용자 위임 / Linux runner)
- F-FE-006 산출물 schema 270+ violation (Stage 6+ resolve)
- deliverable 11 i18n-spec (G1 D / adoption 합산)
- v1.5 carry — drift-validator FE 본격 비교 + URL params validation schema 확장

**git tag**: `v1.4.0`

---

---

## [v1.4.0-dev] — 2026-05-02 (MINOR — FE 트랙 / Stage 5 본격 PoC #04 종결 / Stage 7 진입 자격)

### Stage 5 본격 PoC #04 (2026-05-02 / 본 세션) — 4 Sprint × 5 sprint 게이트

**분석 대상**: yurisldk/realworld-react-fsd HEAD `963b303` (Stage 4 와 동일 코드 / 산출물 재사용 ❌ / Senior strict)

**§8.1 strict 정합 검증대 첫 통과**:

- AP-FE-SECURITY-001 (4 PoC isomorphic / Java + Hexagonal + NestJS + React) 본체 격상
- AP-FE-OPTIMISTIC-DRY (3 컴포넌트 isomorphic) 본체 격상
- ADR-FE-007 신설 (본체 antipattern 카탈로그 첫 등재)

**본체 격상 3건**:

- drift-validator FE 모드 신설 (Sprint 5-3 / F-FE-004 closed)
- schema-validator (Ajv 8) 신설 (Sprint 5-3 / 본체 신규 도구)
- ADR-FE-007 (Sprint 5-4 / 본체 antipattern 카탈로그)

**진짜 도구 6종 + Semgrep carry** (no-simulation 단계 5 도달):

- ts-morph + Playwright + @axe-core/playwright + drift-validator FE + schema-validator + formal-spec-link FE
- Semgrep ⏳ Docker 부재 carry

**Sprint 산출**:

- Sprint 5-1: fork 결단 (G1 D 자동) + Phase 0
- Sprint 5-2: Phase 5-1 api (19 op + 25 schemas) + 5-2-a (8 page / 33 SCN / 13 CMP) + 5-2-b (9 SM) + form-validation 90/77 BR + URL params 2 page isomorphic 정식화
- Sprint 5-3: 본체 도구 2건 + Playwright 32 snapshot + axe 16 scan + Phase 6 quality 6 AP + G4 strict 임계 도달 (JWT 4 PoC / Optimistic 3 컴포넌트)
- Sprint 5-4: V1 + V2 + ADR-FE-007 신설 + rules 80 BR + confidence 0.92
- Sprint 5-5: Stage 5 종결 + Stage 7 release 진입 자격 7/7 평가

**Finding 6건**: F-FE-001~006 (모두 candidate or 본체 격상).

**Stage 7 v1.4.0 MINOR release 진입 자격 7/7 충족** + 4 명시 carry-over:

- Semgrep Docker (사용자 위임)
- F-FE-006 산출물 schema 정합 (270+ violation / 부분 resolve)
- deliverable 11 i18n-spec (G1 D 결단 / adoption 트랙 합산)
- v1.5 carry — drift-validator FE 본격 비교 + URL params validation schema 확장

---

## [v1.4.0-dev] — 2026-05-02 (MINOR — FE 트랙 / Stage 4 mini-PoC 종결)

### Stage 4 (2026-05-02 / 본 세션) — RealWorld React fork 1주 fail-fast mini-PoC

**분석 대상**: `yurisldk/realworld-react-fsd` HEAD `963b303` (527 stars / FSD 약식 3 layer / Zod / TanStack Query / react-router v7 / orval+OpenAPI 자동 생성)

**산출 (Day 1~6 / 6 commit)**:

- `examples/poc-04-mini-realworld-react/` 워크스페이스 (INPUT 의도적 .gitignore — clone --depth 1)
- analysis/0-init/ — tree.md / inventory.json / stack-detection.md (Tier 1 Modern SPA / Scenario A 분리)
- analysis/5-2-a-ui-base/ — ui-spec.json (3 page / 14 SCN / 10 CMP) + scenarios.md + component-tree.mermaid
- analysis/5-2-b-state/ — state-map.json (5 SM SCXML+XState 호환) + state-map.mermaid
- analysis/5-2-c-visual/ — visual-manifest.json + 2 snapshot (Playwright Chromium 진짜 실행)
- analysis/6-quality/ — a11y-spec / i18n-spec / static-security-spec / form-validation-spec (85 validation / 72 BR 자동 등록) / type-spec (ts-morph 진짜 실행)
- ir-4layer-matrix.md (overall_framework_neutrality_score 0.99 / target 0.90)
- confidence-meta.yaml (0.85 / ADR-009 단계 4)
- 4 finding (F-FE-001~004 / 모두 candidate / mini scope 정합)
- DEC-Stage-4-mini-PoC-종결.md

**no-simulation 정책 단계 4 도달**:

1. ts-morph 24 — 70 file / 46 type / framework_neutrality_score 1.0 / react_idiom_ratio 0.0011
2. Playwright + Chromium — 2 viewport visual baseline (binary 진실)
3. @axe-core/playwright 4.10 — WCAG 2.2 AA / 1 unique violation (html-has-lang)

**Stage 5 진입 자격 충족** (research G5 5 자격 모두 충족):

- 사상 정합 ✅ 비협상 충족 / IR 0.99 ✅ / 도구 3종 ✅ / finding 4건 ✅ / 신뢰도 0.85 ✅
- carry 2건 (Semgrep 환경 + drift-validator FE) — Senior 재분류 시 ≤ 2 (i18n = 적용 대상 부재 ≠ carry)

**§8.1 정합 strict** — Stage 4 finding 4건 모두 candidate / **본체 격상 0건** / Stage 5 + adoption 합산 후 격상.

**핵심 발견**:

- URL params validation 신규 패턴 (Zod-mini home.state.ts) — deliverable 14 의미 확장 시점 (Stage 5 schema 확장 후보)
- JWT localStorage XSS = PoC #01/02 isomorphic 변형 (3 PoC isomorphic — adoption 합산 시 본체 antipattern 후보)
- React Router v7 Form action 패턴 (RHF/Formik 미사용)
- orval auto-gen Zod from OpenAPI 3.0.1 = ADR-FE-005 매개체 #4 + #13 통합 검증 ✅
- drift-validator FE 모드 부재 = 본체 도구 격상 후보 (F-FE-004)

---

## [v1.4.0-dev] — 2026-05-01 (MINOR — FE 트랙 진입 / Stage 0 종결)

### 트리거

v1.3.1 PATCH 종결 후 사용자 결정 — **freeze 해제 + FE 트랙 정식 시작 + v1.4.0-dev 라인 진입**. 본 release 라인 = ① BE 한정 (v1.x) → BE+FE 양 트랙 (v1.4+) 격상 ② 사용자 진단 "FE 분석 방법이 없잖아" 에 대한 research-first 응답.

### Stage 0 산출 (본 세션)

| #   | 산출                                | 위치                                                                                         |
| --- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | plan-v1.4-fe-track.md               | `ai-native-methodology/.claude/plans/` (4원칙 1단계 정식 산출)                               |
| 2   | DEC-2026-05-01-v1.4-FE-트랙-진입.md | `ai-native-methodology/decisions/`                                                           |
| 3   | STATUS.md 갱신                      | 방법론 본체 버전 + 시퀀스 진행률                                                             |
| 4   | INDEX.md 갱신                       | 승인 결정 표에 본 DEC 등재                                                                   |
| 5   | CHANGELOG.md (본 entry)             | v1.4.0-dev 라인 신설                                                                         |
| 6   | memory 신설 + 갱신                  | project_v140_fe_track / project_v130_release_status / project_adoption_workspace + MEMORY.md |
| 7   | git commit                          | Stage 0 종결 단일 commit                                                                     |

### 변경 사항

**없음** (메타 작업만). 방법론 본체 / schema / 도구 / PoC 변경 0. 본 release line 의 본격 변경은 Stage 3 (본체 격상) 부터 시작.

### 큰 뭉텅이 (Stage) 분할 — 사용자 요구 6번 정식 반영

| Stage      | 목적                                                         |
| ---------- | ------------------------------------------------------------ |
| Stage 0 ✅ | freeze 해제 + 트랙 진입                                      |
| Stage 1    | research × 3 (공식문서 / 테크기업 / Senior FE) — 9Q 답 도출  |
| Stage 2    | 사용자 승인 (3 sub-gate — 핵심 구조 / 보강 범위 / 검증 전략) |
| Stage 3    | 본체 격상 — deliverable 재설계 + 산출물↔테스트 매개체 채택   |
| Stage 4    | mini-PoC 검증 (1주 fail-fast)                                |
| Stage 5    | 본격 PoC #04 (RealWorld FE)                                  |
| Stage 6    | BE/FE 분리 운영 정책 정식화 (횡단)                           |
| Stage 7    | v1.4.0 MINOR release 결단                                    |

각 Stage 종료 시 commit + DEC + STATUS 갱신 (사용자 요구 7번 — 발전 과정 가시화 의무).

### 외부 plan 짝

`~/.claude/plans/be-foamy-jellyfish.md` (사용자 승인본 / 3 에이전트 점검 v2). 본 레포 plan (`.claude/plans/plan-v1.4-fe-track.md`) 은 작업용 짝.

### 트랙 차이 (BE v1.x → FE v1.4)

| 차원      | BE 트랙 (v1.0~v1.3)                          | FE 트랙 (v1.4)                                                       |
| --------- | -------------------------------------------- | -------------------------------------------------------------------- |
| 시작 가정 | modern stack (Spring/SpringBoot/NestJS) 명확 | spectrum 결정부터 (legacy jQuery ~ modern React)                     |
| 진입 순서 | 명세 → 도구 → PoC                            | research → 명세 재설계 → mini-PoC → 본격 PoC                         |
| 핵심 빈틈 | 신뢰도 정직 표기                             | 산출물↔테스트 자동 도출 / visible 차원 / 분산 상태 / 이벤트 / 렌더링 |
| 분리 정책 | 단일 BE 관점                                 | BE/FE 분리 운영 (Stage 6) — JS 풀스택 / JSP 혼재 예외                |

### Stage 1 산출 (research × 3 — 2026-05-01 본 세션)

| #   | 산출                                         | 위치             | 분량                             |
| --- | -------------------------------------------- | ---------------- | -------------------------------- |
| 1   | research-official-v1.4-fe.md                 | `.claude/plans/` | ~2,400 단어 / 1차 사료 ≥ 25개    |
| 2   | research-industry-v1.4-fe.md                 | `.claude/plans/` | ~2,800 단어 / 1차 사료 다중      |
| 3   | research-senior-v1.4-fe.md                   | `.claude/plans/` | ~3,500 단어 / 9Q 모두 강한 답    |
| 4   | research-v1.4-fe-summary.md (진단 보고서)    | `.claude/plans/` | 통합 + Stage 2 Gate 입력 12 결정 |
| 5   | DEC-2026-05-01-v1.4-Stage-1-research-종결.md | `decisions/`     | Stage 1 종결 결단                |

### Stage 1 핵심 합의 (3 에이전트)

- 격상 시나리오 = **Scenario B-Lite (단계 분할)** — Senior 권고 + 산업/공식 정합
- legacy cover (jQuery/Vanilla/MPA/JSP) **v1.4 포함** — 사용자 진단 직접 대응
- visual-manifest deliverable 신설 (사용자 요구 3번 visible 정면 해소)
- state-map deliverable 신설 + W3C SCXML 채택 (분산 상태 5 진실)
- 권위 매개체 12 통합 채택 (CEM/SCXML/DTCG/MSW+OAS/axe-core/.d.ts/CSF/Playwright/WCAG 2.1/WAI-ARIA 1.2/ICU MF/Pact)
- a11y + i18n v1.4 포함 (산출물↔테스트 자동 도출)

### 본체 빈틈 진단 (Stage 3 격상 작업 항목)

Top 5: 분산 상태 deliverable 부재 / 시각 산출 부재 / legacy fallback 부재 / 권위 매개체 격상 미반영 / 신뢰도 단계 모델 부재. 세부 21건 (`research-v1.4-fe-summary.md` §3).

### Stage 2 진입 자료 (사용자 결단 12 항목)

- Gate 1 (핵심 구조) 4 결정: spectrum / 시나리오 (B-Lite) / schema 분리 / 매개체 12 채택
- Gate 2 (보강 범위) 4 결정: 비기능 v1.4 (a11y+i18n+정적보안) / legacy Tier 1~4 / BE/FE 분리 / ADR-001 §명시적 제외 갱신
- Gate 3 (검증 전략) 4 결정: mini-PoC 진입 (Stage 3-1 후 즉시) / PoC #04 (RealWorld only) / 신뢰도 0.80 / Sprint 4-6

### Stage 2 종결 (2026-05-01 본 세션)

**12 결정 모두 Senior 권고 (Recommended) 채택**. DEC-2026-05-01-v1.4-Stage-2-Gate-결단.md.

| Gate             | 결정 4건                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **G1** 핵심 구조 | spectrum (Modern+jQuery+JSP 예외) / **Scenario B-Lite** / schema 분리+Phase 4.5 cross-link / 매개체 **12 통합 채택**           |
| **G2** 보강 범위 | 비기능 (a11y+i18n+정적보안 v1.4 / 운영 NFR v1.5) / legacy Tier 1~4 / BE/FE 분리 default + JS풀스택+JSP ADR 예외 / ADR-001 갱신 |
| **G3** 검증 전략 | mini-PoC Stage 3-1 후 즉시 / PoC #04 RealWorld only / 신뢰도 **0.80** / Sprint mini 1주 + 본격 4-6                             |

### Stage 3-1 진입 자료 (작업 항목 확정)

- 신설: deliverable 8 (state-map) + 9 (visual-manifest) + state-map.schema.json + visual-manifest.schema.json
- 분할: phase-5-2 → phase-5-2-a/b/c
- ADR 신설: ADR-FE-001 (FE 추출기 가정 + spectrum) / ADR-FE-002 (이중 렌더링 FE 적용 + visual 예외) / ADR-FE-005 (매개체 12 채택)
- ADR 갱신: ADR-009 (FE 신뢰도 단계 1~5)
- 보강: 7-ui-ux.md (legacy Tier 1~4 fallback) + ui-spec.schema.json (event_handlers / api_calls / suspense_boundary / framework enum 확장)
- 도구 시범: drift-validator FE 적용 (state-map.json ↔ state-map.mermaid) / formal-spec-link-validator FE cross-link

### Stage 3-1 종결 (2026-05-01 본 세션)

**본체 격상 16+ 항목 적용**. DEC-2026-05-01-v1.4-Stage-3-1-종결.md.

#### Phase 별 산출 (5 commit + 본 메타)

| Phase   | 산출                                                                            | commit                                  |
| ------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| **A**   | ADR-FE-001/002/005 신설 + ADR-009 갱신 + plan-v14-stage-3-1.md                  | `6639df7` (5 file / 1267 ins)           |
| **B**   | state-map.schema + visual-manifest.schema 신설 + ui-spec.schema 확장            | `c82d545` (3 file / 788 ins)            |
| **C+D** | deliverable 8/9 신설 + 7 보강 + phase-5-2 a/b/c 분할 + 기존 stub                | `d2e12b4` (7 file / 1269 ins / 202 del) |
| **E1**  | drift-validator FE corpus 1쌍 + test 14→**15 pass**                             | `9c0729c` (3 file / 26 ins)             |
| **E2**  | formal-spec-link-validator FE 진단 (도구 확장 carry — Stage 3-2 또는 Sprint 5+) | (read-only)                             |
| **F**   | DEC-Stage-3-1-종결 + STATUS / INDEX / CHANGELOG / memory                        | (본 commit)                             |

#### 사상 기둥 3 (ADR-FE 시리즈)

- **ADR-FE-001** (FE 추출기 가정) — spectrum Tier 1~4 cover + 한 방향 추출 사상 + BE Phase 0~6 ↔ FE Phase 0~6 매핑
- **ADR-FE-002** (이중 렌더링 FE 적용) — ADR-008 의 FE 영역 적용 + visual 예외 (binary 진실 모델)
- **ADR-FE-005** (권위 매개체 12 채택) — sub-agent cross-check 1차 사료 검증 완료

#### Cross-check 권고 3건 반영 (옵션 Y)

1. DTCG 정확한 인용 — "Final Community Group Report" 명시 + spec URL 고정
2. WCAG 2.1 AA + 2.2 AA ratchet path 명시 (ADR-010 baseline+ratchet 정합)
3. ICU MF2 채택 단계 (spec stable / runtime preview) + MF1 폴백 병기

#### no-simulation 정책 강화

- visual-manifest.schema.json `captured_by` enum — `simulation` 시 -5%p 패널티 + `simulation_reason` 의무 (schema if/then 강제)
- ADR-009 §2.2.1 FE 도구 enum 신설 — `playwright_real` / `axe_core_real` / `storybook_csf_real` / `msw_handler_check` / `percy_real` / `chromatic_real`
- phase-5-2-c-visual.md §3.2 — Playwright + axe-core 진짜 실행 의무 절차

#### 사용자 7 요구사항 진척도

| 요구                           | 도달                                           |
| ------------------------------ | ---------------------------------------------- |
| 1. 산출물 → 마이그+테스트 기반 | 100% (ADR-FE-005)                              |
| 2. AI + 사람 동시 이해         | 100% (ADR-FE-002 + schema 3 + deliverable 3)   |
| 3. UI visible 차원             | 100% (deliverable 9 + schema B2 + workflow D3) |
| 4. 비즈니스 로직 동일          | 100% (deliverable 8 + schema B1 + workflow D2) |
| 5. BE/FE 분리 운영             | ⏳ Stage 6 (ADR-FE-004)                        |
| 6. 큰 뭉텅이 승인제            | 100% (Phase A~F commit 단위 분할)              |
| 7. 모든 단계 기록              | 100% (5 commit + DEC)                          |

→ 6/7 = 100% (요구 5 = Stage 6 carry).

### Stage 3-2 + Stage 4 진입 자료

- Stage 3-2 — a11y / i18n / 정적보안 deliverable + legacy 산출물 3종 + ADR-FE-003 + ADR-001 §명시적 제외 갱신 + migration-cautions-fe.md + rules.schema.json br_type fe_validation enum 확장 + formal-spec-link-validator FE 적용 (Stage 3-1 carry)
- Stage 4 mini-PoC — RealWorld React fork (1주 fail-fast) + Playwright + axe-core 진짜 실행 1회 (no-simulation 정책 첫 FE 실현) + ui-spec / state-map / visual-manifest 1 page × 2 viewport 검증 + drift-validator FE 본격 적용 + 신뢰도 0.75+ 도달 검증

추정 분량: 2~4 세션.

### Stage 3-2 종결 (2026-05-01 본 세션)

**본체 격상 2차 12+ 항목 적용**. DEC-2026-05-01-v1.4-Stage-3-2-종결.md.

#### Phase 별 산출 (5 commit + 본 메타)

| Phase   | 산출                                                                                                                                        | commit                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------ | ---------------------------- |
| **A**   | ADR-FE-003 (legacy spectrum + Strangler Pattern) 신설 + ADR-001 §명시적 제외 갱신 (운영 NFR 좁힘) + plan-v14-stage-3-2.md                   | `4d8eb18` (3 file / 794 ins) |
| **B**   | a11y-spec / i18n-spec / static-security-spec / legacy-spectrum schema 신설 + rules.schema FE category 4종 확장                              | `deefd62` (5 file / 771 ins) |
| **C+D** | deliverable 10 (a11y) / 11 (i18n) / 12 (static-security) / 13 (legacy-spectrum) 신설 + migration-cautions-fe.md 신설 + phase-6-quality 보강 | `3feb8fd` (6 file / 913 ins) |
| **E**   | formal-spec-link-validator FE 모드 확장 (`--mode=be                                                                                         | fe                           | both`) + 4→**8 pass** ✅ (BE 회귀 0) | `64fd5b0` (4 file / 271 ins) |
| **F**   | DEC-Stage-3-2-종결 + STATUS / INDEX / CHANGELOG / memory                                                                                    | (본 commit)                  |

#### G2 결단 정식 반영 (Stage 2 Gate)

- **G2-1** (a11y/i18n/정적보안 v1.4) — deliverable 10/11/12 신설 + schema 3종
- **G2-2** (legacy Tier 1~4) — ADR-FE-003 + deliverable 13 + legacy-spectrum schema
- **G2-4** (ADR-001 §명시적 제외) — "비기능 측정" → "운영 NFR 측정" 좁힘 + 정적 NFR v1.4 포함

#### Strangler Fig Pattern 채택 (Martin Fowler 2004)

- 산업 사례 (Fowler / Sam Newman) 정합 — rewrite ❌ / strangle ✅
- 4 approach 명시 + schema enum `big_bang_rewrite_not_recommended`

#### Cross-check 권고 3건 schema 강제 (Stage 3-1 carry)

- DTCG `spec_source` URL 고정 + `spec_status=community_group_report`
- WCAG 2.1-AA baseline + 2.2-AA ratchet (a11y-spec.schema)
- ICU MF2 사용 시 MF1 폴백 의무 (i18n-spec.schema if/then 강제)

#### no-simulation 정책 schema 강제 4 영역

| schema               | if/then                                                          |
| -------------------- | ---------------------------------------------------------------- |
| a11y-spec            | captured_by ∈ real → 5종 물증 의무                               |
| i18n-spec            | mf2_used=true → mf1_fallback_present 의무                        |
| static-security-spec | captured_by ∈ real → 5종 물증 의무 + runtime_check_required 표기 |
| legacy-spectrum      | primary_tier=mixed → mixed_breakdown 의무                        |

#### 사용자 7 요구사항 진척도 (Stage 3-2 종결)

| 요구                           | 도달                                     |
| ------------------------------ | ---------------------------------------- |
| 1. 산출물 → 마이그+테스트 기반 | 100% (axe-core / ICU / Semgrep 추가)     |
| 2. AI + 사람 동시 이해         | 100% (schema 5 + deliverable 4 신설)     |
| 3. UI visible 차원             | 100% (Stage 3-1 도달 유지)               |
| 4. 비즈니스 로직 동일          | 100% (rules.schema FE category 4종 확장) |
| 5. BE/FE 분리 운영             | ⏳ Stage 6 (ADR-FE-004)                  |
| 6. 큰 뭉텅이 승인제            | 100% (Phase A~F commit 단위)             |
| 7. 모든 단계 기록              | 100% (5 commit + DEC)                    |

→ 6/7 = 100% 도달 유지 (Stage 3-1 동일).

### Stage 4 + Stage 6 진입 자료

- **Stage 4 mini-PoC** — Playwright + axe-core + ICU runtime + Semgrep/ESLint security 진짜 실행 (no-simulation 정책 첫 FE 본격 실현)
- **Stage 6 ADR-FE-004** — BE/FE 분리 운영 정책 정식 (요구 5 = 100% 도달) / methodology-spec/be-fe-separation.md / Tier 4 (JSP) BE/FE 통합 산출 정식

### Stage 6 종결 (2026-05-01 본 세션)

**본체 격상 8 항목 + 사용자 요구 7/7 = 100% 도달 = v1.4 본체 quality 격상 완성**. DEC-2026-05-01-v1.4-Stage-6-종결.md.

#### Phase 별 산출 (3 commit + 본 메타)

| Phase | 산출                                                                                                                                                                          | commit                               |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **A** | ADR-FE-004 (BE/FE 분리 3 Scenario) + ADR-FE-006 (framework-neutral IR — 외부 LLM 검증 정면 대응) 신설 + plan-v14-stage-6.md + STATUS 압축 정비 이력 등재                      | `5650e1f` (4 file / 683 ins)         |
| **B** | be-fe-separation.md 신설 + ADR-FE-001 §6 / ADR-FE-003 §2.4 carry → resolved + deliverable 7 §6.5 보강 + phase-0 §3.4 보강 + legacy-spectrum.schema tier_4_be_fe_handling enum | `2fafd52` (6 file / 235 ins / 9 del) |
| **F** | DEC-Stage-6-종결 + STATUS / INDEX / CHANGELOG / memory                                                                                                                        | (본 commit)                          |

#### 핵심 결단

- **3 Scenario** (ADR-FE-004) — A 분리 default (사용자 사내 React+TS+TanStack 정합) / B JS 풀스택 (Next.js / Nuxt / Remix / Astro) / C JSP (Tier 4 통합)
- **framework-neutral IR 사상** (ADR-FE-006) — 외부 LLM 검증 정면 대응 / IR 4계층 매트릭스 (L1 Domain / L2 Interaction / L3 Contract / L4 Presentation) 정식 매핑 / Screen+Journey 우선 / Component 분해 framework-coupling 위험
- **Stage 3-1/3-2 carry 종결** — Tier 4 (JSP) BE/FE 통합 산출 절차 정식

#### 외부 LLM 검증 빈틈 5건 처리

| #   | 빈틈                                      | 처리                                    |
| --- | ----------------------------------------- | --------------------------------------- |
| 1   | Zod / Yup / RHF rules → BR 자동 추출 절차 | ❌ Stage 7-pre carry                    |
| 2   | TypeScript .d.ts 산출 절차                | ❌ Stage 7-pre carry                    |
| 3   | "프레임워크 중립 IR" 사상 명시화          | ✅ ADR-FE-006 신설                      |
| 4   | Component 분해 framework-coupling 위험    | ✅ ADR-FE-006 §2.3 + deliverable 7 §6.5 |
| 5   | Screen+Journey 우선 / Component 후순위    | ✅ ADR-FE-006 §2.2 + deliverable 7 §6.5 |

#### 사용자 7 요구사항 7/7 = 100% 도달 (v1.4 본체 quality 격상 완성)

| 요구                           | 도달                      |
| ------------------------------ | ------------------------- |
| 1. 산출물 → 마이그+테스트 기반 | 100%                      |
| 2. AI + 사람 동시 이해         | 100%                      |
| 3. UI visible 차원             | 100%                      |
| 4. 비즈니스 로직 동일          | 100%                      |
| **5. BE/FE 분리 운영**         | **100% NEW** (ADR-FE-004) |
| 6. 큰 뭉텅이 승인제            | 100%                      |
| 7. 모든 단계 기록              | 100%                      |

→ **7/7 = 100% 완성 / Stage 7 v1.4.0 release 진입 자격 도달**.

#### FE 영역 ADR 6 개 누적 (Stage 3-1/3-2/6)

- ADR-FE-001 (FE 추출기 가정) / 002 (이중 렌더링 FE) / 003 (legacy + Strangler) / 004 (BE/FE 분리) / 005 (권위 매개체 12) / 006 (framework-neutral IR)

### Stage 4 + Stage 7-pre 진입 자료

- **Stage 4 mini-PoC** — RealWorld React fork (1주 fail-fast) + Playwright/axe-core/ICU/Semgrep 진짜 실행 / ADR-FE-006 IR 4계층 정합도 검증 의무 (React 관용구 IR 잔존 finding 등록)
- **Stage 7-pre** — 외부 LLM 검증 빈틈 #1 (Zod/Yup/RHF → BR fe_validation 자동 추출) + #2 (TypeScript .d.ts 산출 — 별도 deliverable 14 검토)

### Stage 7-pre 종결 (2026-05-01 본 세션)

**외부 LLM 검증 빈틈 5/5 = 100% 해소 / release 전 마지막 quality 격상**. DEC-2026-05-01-v1.4-Stage-7-pre-종결.md.

#### Phase 별 산출 (4 commit + 본 메타)

| Phase   | 산출                                                                                                                                         | commit                       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **A**   | ADR-FE-005 매개체 12 → **13** (Zod 추가) + plan-v14-stage-7-pre.md                                                                           | `3a7df3e` (2 file / 256 ins) |
| **B**   | form-validation-spec.schema + type-spec.schema 신설 + rules.schema source_format/auto_extracted 확장                                         | `9c5b8d1` (3 file / 448 ins) |
| **C+D** | deliverable 14 (form-validation-spec) / 15 (type-spec) 신설 + ADR-FE-006 §5.2 carry → resolved + phase-5-2-b §3.1 form_state cross-link 보강 | `adabe10` (4 file / 356 ins) |
| **F**   | DEC-Stage-7-pre-종결 + STATUS / INDEX / CHANGELOG / memory                                                                                   | (본 commit)                  |

#### 외부 LLM 검증 빈틈 5/5 = 100% 해소

| #   | 빈틈                                   | Stage       | 산출                                                             |
| --- | -------------------------------------- | ----------- | ---------------------------------------------------------------- |
| 1   | Zod / Yup / RHF rules → BR 자동 추출   | Stage 7-pre | deliverable 14 + form-validation-spec.schema + ADR-FE-005 §2.1.1 |
| 2   | TypeScript .d.ts 산출 절차             | Stage 7-pre | deliverable 15 + type-spec.schema + framework_neutrality_score   |
| 3   | "프레임워크 중립 IR" 사상 명시화       | Stage 6     | ADR-FE-006 신설                                                  |
| 4   | Component 분해 framework-coupling 위험 | Stage 6     | ADR-FE-006 §2.3 + deliverable 7 §6.5                             |
| 5   | Screen+Journey 우선 / Component 후순위 | Stage 6     | ADR-FE-006 §2.2 + deliverable 7 §6.5                             |

#### ADR-FE-005 매개체 12 → 13 (Zod 추가)

| 매개체    | 채택 근거                                                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod (#13) | Schema-First validation de facto / TypeScript-first / runtime + static type 양쪽 / `z.object()` / `.refine()` → rules.json fe_validation BR 자동 등록 |

#### 사용자 7 요구사항 7/7 = 100% 도달 유지 + 강화

- 요구 1 강화 — Zod / TS 타입 자동 추출 = 신규 시스템 즉시 활용
- 요구 4 강화 — form_validation BR 자동 등록 (auto_extracted=true 분리 운영)
- 요구 1/2/3/4/5/6/7 = 100% 유지

#### 다음 trigger

- **Stage 4 mini-PoC** — RealWorld React fork (1주 fail-fast) + ts-morph + Playwright + axe-core + ICU + Semgrep 진짜 실행 / 신뢰도 0.75+ 도달 / ADR-FE-006 IR 4계층 정합도 검증
- **Stage 5** 본격 PoC #04 — 9 deliverable (7~15) + a11y + i18n + static-security + legacy + form-validation + type-spec
- **Stage 7** v1.4.0 MINOR release 결단 (Stage 5 검증 후)

### BE Sprint 5+ carry-over 종결 (환경 무관 부분 / 2026-05-01 본 세션)

**drift-validator v0.1.0 → v0.2.0 / 3 도구 unit test 53/53 pass / 본체 phase-flow drift 0 자가 입증**. DEC-2026-05-01-Sprint-5-carryover-종결.md.

#### Phase 별 산출 (4 commit + 메타)

| Phase | 산출                                                                                                                                                                                       | commit                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| **A** | corpus 14 → 19쌍 (+6 신규 / multi-trigger / extra-event / multi-actor / extra-message / FE form / FE missing-error) + corpus.test.js +6 test (15 → 21)                                     | `7b9d4b2` (14 file / +437)       |
| **B** | drift-validator phase-flow 비교기 신설 — normalize-phase-flow.js + compare-phase-flow.js + cli.js 분기 + corpus 2쌍 + 4 test                                                               | `1ab6d14` (10 file / +316)       |
| **C** | tools/\_shared/baseline.js 공용 이동 + drift-validator/src/baseline.js re-export shim + DTV cli.js import path 갱신 + DTV baseline.test.js 신설 (4 test) + drift-validator v0.1.0 → v0.2.0 | `8545e47` (6 file / +203 / -112) |
| **D** | static-runner SARIF→finding 어댑터 (sarif-to-finding.js) + cli.js --baseline/--ratchet/--write-baseline 통합 + baseline-mode.test.js (5 test)                                              | `f82e6fa` (4 file / +209)        |
| **F** | DEC-Sprint-5-carryover-종결 + STATUS / INDEX / CHANGELOG / memory                                                                                                                          | (본 commit)                      |

#### 정량 결과

| 도구                     | 보강 전          | 보강 후                                       |
| ------------------------ | ---------------- | --------------------------------------------- |
| drift-validator          | v0.1.0 / 23 test | **v0.2.0 / 33 test** (corpus 25 + baseline 8) |
| decision-table-validator | 7 test           | **11 test** (+4 baseline)                     |
| static-runner            | 4 test           | **9 test** (+5 baseline-mode)                 |
| **3 도구 합계**          | 34 test          | **53/53 pass** ✅                             |

#### 본체 SSOT 자가 검증 (핵심)

```
$ node tools/drift-validator/src/cli.js methodology-spec/workflow/phase-flow.json
[phase-flow] 0 breaking / 0 non-breaking / 0 info ✅
```

→ 본체 phase-flow.json + phase-flow.mermaid 짝 정합도 **drift 0** 입증. v1.4 quality 격상 강한 데이터.

#### ADR-010 §2.5 정합 도달

| 도구                     | 단계                 | baseline 통합                   |
| ------------------------ | -------------------- | ------------------------------- |
| drift-validator          | ADR-009 §2.1 단계 3  | ✅                              |
| decision-table-validator | 단계 3               | ✅                              |
| static-runner            | 단계 5 (Semgrep/PMD) | ✅ (진짜 실행 자체는 환경 의존) |

### Sprint 6 carry-over (환경 의존만 잔여)

- Semgrep / PMD / OSV-Scanner 진짜 실행 1회 (Java 환경 필요)
- vacuum / openapi-changes 외부 도구 통합 (별도 작업)

본 v1.4 FE 트랙 + Sprint 5+ carry-over 와 **독립 병행 가능**.

### adoption workspace 영향

`ai-native-methodology-adoption/` 의 "원본 클론 변경 X" 가정은 본 release 진입으로 깨짐. v1.3.1 시점 dist (`dist/internal-v1.3/`) 는 그대로 보존. 향후 v1.4.0 정식 release 시 신규 dist (`dist/internal-v1.4/`) 빌드 가능. 동기화 정책 갱신은 별도 작업 (본 release scope 외부).

---

---

---

## [v1.3.1] — 2026-05-01 ⭐ release 보존 (PATCH — 파일명 컨벤션 정리)

### 트리거

`ai-native-methodology-adoption` workspace commit `0e01595 (D3 + D3.1)` 에서 사내 적용본 (`dist/internal-v1.3/`) 파일명 컨벤션을 정리 (한국어 → 영어 + 1자리 prefix + `.yml` → `.yaml`). 원본 정리는 별도 세션 보류 (Option γ) 였음 → 본 PATCH = **D3.2 = 원본 (이 repo) 동일 적용**. 효과: 원본 ↔ dist 동기화 → 이후 dist build 단순 복사로 환원 + cross-language 일관 + Windows path 친화.

### 변경 사항

#### Renamed (12 — `git mv`, history 보존)

| 영역           | 매핑                                                                                                                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deliverables 8 | `01-아키텍처` → `1-architecture` / `02-도메인-모델` → `2-domain` / `03-API-계약` → `3-api` / `04-DB-스키마` → `4-db-schema` / `04-5-형식명세` → `4-5-formal-spec` / `05-비즈니스-규칙` → `5-business-rules` / `06-안티패턴` → `6-antipatterns` / `07-UI-UX-명세` → `7-ui-ux` |
| Workflow 2     | `phase-0-입력정리` → `phase-0-input` / `phase-4-비즈니스로직` → `phase-4-business-logic`                                                                                                                                                                                     |
| Glossary 1     | `methodology-spec/한국어-용어집.md` → `methodology-spec/glossary-ko.md`                                                                                                                                                                                                      |
| Extension 1    | `templates/meta-confidence.template.yml` → `.yaml`                                                                                                                                                                                                                           |

#### Updated (cross-link sed 치환 — 33 파일)

README / CHANGELOG / decisions (INDEX / STATUS / 8 DEC) / docs/adr (4 ADR) / methodology-spec/workflow (phase-flow.json + phase-5-2-ui + phase-6-quality) / templates (4) / examples/poc-01·02·03 의 \_manifest.yml + findings/poc-findings + RESUME + 일부 output (8) / 외부 `.claude/` 2.

#### 제외 (history artifact 21 — commit `0e01595` body 명시)

`examples/poc-XX/.claude/` 하위 PROGRESS / plan / research / case / document / senior / SESSION-WRAPUP 21 파일 = 과거 PoC 기록 그대로 유지.

### 검증

| 항목                          | 결과                         |
| ----------------------------- | ---------------------------- |
| formal-spec-link-validator    | 4/4 pass                     |
| drift-validator               | 14/14 pass                   |
| phase-flow.json JSON validity | OK                           |
| 12 신규 path `git ls-files`   | 12/12 ✅                     |
| 잔여 grep 12 token            | 21 hits = 정확히 의도적 제외 |

### Scope

산출물 / 사상 / schema 변경 없음. 파일명 + cross-link 만. **PATCH 적격**.

---

## [v1.3.0] — 2026-05-01 (MINOR )

### 트리거

3 PoC (Spring Boot 2.5 / Spring Boot 3.3 Hexagonal / NestJS) 종결 후 본 방법론이 **platform-agnostic 임이 입증된 시점** + **no-simulation 정책 첫 실현 (spectral 실 실행)** + 격상 후보 6건 모두 적용 + Sprint 5 Node 도구 부분 종결.

> **본 release = 사내 표준으로 격상**. 사내 legacy 시스템 분석 + 신규 시스템 구축 가이드 제공 가능. 신뢰도 85-92% 도달 (단계 4 — 진짜 도구 1회 실행 ).

### 변경 사항

#### Added (추가) — v1.2.3 PATCH 흡수 + Sprint 5 부분

**v1.2.3 PATCH 흡수** (본 MINOR 에 통합):

- 묶음 C (Phase 4.5 cross-link 의무화 schema)
- 묶음 I (AP-PERFORMANCE 3 PoC 권위 격상)
- 묶음 H (Positive finding 패턴 schema — severity:positive + learning_effect_type 4종 + status:logged)
- 묶음 K (Lifecycle BR 패턴 — decision_tables required 분리 + br_type enum + current_state_note)
- 묶음 R (NestJS 4 ADR — Auth-scope / Validation / HttpCode / TypeORM-Integrity)
- 묶음 D (ADR-006 final 격상 + ADR-010 Baseline + Ratchet 신규)
- §8.1 cross-platform 입증 정식 등재 (README "Platform-Agnostic 입증" 섹션)

**v1.2.3 후속 LMNO** (본 MINOR 에 통합):

- 묶음 L (migration-cautions.md NestJS 변형 + 사내 도입 quality gate 정책)
- 묶음 M (ADR-010 baseline+ratchet 도구 implementation — drift + dmn 에 `--baseline` / `--ratchet` / `--write-baseline`)
- 묶음 N (formal-spec-link-validator 신규 도구 — Phase 4.5 cross-link enforcement)
- 묶음 O (PoC #03 BR formalization 100% — 18/18)

**Sprint 5 Node 도구 부분 종결 (2026-05-01 — 본 release 트리거)**:

- `tools/spectral-runner/` — `@stoplight/spectral-cli` wrapper 신설
- PoC #03 openapi.yaml 자가 적용 — **24 warnings / 0 errors / exit 0** ✅
- 본 방법론 no-simulation 정책 첫 실현 (drift/dmn 자체 도구 + spectral 진짜 외부 도구)
- ADR-009 단계 4 (진짜 도구 1회 실행) 첫 도달
- 신뢰도 80-87% → **85-92%** 도달 가능 시점

### 정량

| 측정                         | v1.2.2 → v1.3.0                                               |
| ---------------------------- | ------------------------------------------------------------- | ----------------------------- |
| 본체 갭 closure              | 7 → **15**                                                    |
| ADR 수                       | 9 → **13** (NEST 4 + 010 1)                                   |
| schema 갱신                  | — → **4건** (C/H/K + finding-system)                          |
| 명세 본체 갱신               | — → **4건** (06 / finding-system / phase-4-5 / phase-6)       |
| 도구 수                      | 3 → **5** (formal-spec-link-validator + spectral-runner 신규) |
| 도구 unit test               | 17 → **37**                                                   |
| PoC #03 BR coverage          | — → **100%** (18/18)                                          |
| PoC #03 신뢰도               | — → **0.91** (단계 4)                                         |
| 본 방법론 시뮬 패널티 신뢰도 | 80-87%                                                        | **85-92%** (spectral 실행 후) |

### v1.3.0 release 의 의미

- **본 방법론 = 사내 표준 채택 가능 시점** — 3 PoC platform-agnostic 입증 + 진짜 도구 검증 + 12 묶음 본체 갭 closure
- **사내 legacy 시스템 분석 + 신규 시스템 구축 가이드 제공 가능** — `docs/v1.3-promotion-report.md` §5.3 정합
- **ROI 견적**: 소규모 5x / 중규모 7x / 대규모 12x

### Migration Guide (v1.2.x → v1.3.0)

본 v1.3.0 은 **하위 호환** (모든 schema 변경 = optional 신규 필드 또는 null 허용 확장).

권장:

1. `api-extension.json` operations[] 에 `formal_spec_links` 추가 (선택 — coverage 정량 추적 가능)
2. `antipatterns.json` antipatterns[] 에 `formal_spec_links` 추가 (선택)
3. `finding-system.schema` 의 `severity:positive` + `status:logged` 활용 (cross-PoC 학습 효과 입증)
4. Lifecycle BR 시 `br_type: lifecycle` + `http_status: null` (K 묶음 정합)
5. 사내 도입 시 ADR-010 baseline + ratchet 의무 적용
6. 신규 NestJS 프로젝트 — ADR-NEST-001~004 의무

### Carry-over → v1.3.x (후속 PATCH)

1. **Sprint 5 잔여** — Semgrep (Python+Java 환경) / PMD (Java) / OSV-Scanner (Go binary) 실 실행 — 환경 변동 시
2. **Sprint 6** — vacuum / openapi-changes / corpus 14쌍 → 20쌍 / drift-validator phase-flow 비교기
3. **묶음 P 보강** — migration-cautions Spring Boot 변형 / FastAPI 변형 (4번째 PoC 진입 시)
4. **사내 적용** — 첫 사내 legacy 분석 시 baseline 등재 + 분기별 review

---

## [v1.2.3] — 2026-04-30 (PATCH — v1.3.0 에 흡수)

### 트리거

PoC #03 NestJS 종결 후 **본체 갭 4건 정식 해소** — 본체 도구/schema/명세를 PoC #03 검증 결과로 격상. 본 PATCH 는 **PoC 산출물 작업이 아닌 본 방법론 본체 격상** 에 집중 (사용자 명시 — quality 격상 방향 재정렬).

| 묶음  | 영역                                                                                        |
| ----- | ------------------------------------------------------------------------------------------- |
| **C** | Phase 4.5 cross-link 의무화 schema (openapi-extension + antipatterns)                       |
| **I** | AP-PERFORMANCE-001 medium → high 정식 격상 (3 PoC 권위)                                     |
| **H** | Positive finding 패턴 schema 화 (severity:positive + status:logged + positive_finding_meta) |
| **K** | Lifecycle BR 패턴 본체 schema 반영 (formal-spec.schema decision_tables required 분리)       |

이전 A 묶음 (drift-validator quality boost) + B 묶음 (Phase 4.5 풍부화) 의 본체 보강분도 본 PATCH 에서 정식화.

### 변경 사항

#### Added (추가)

**Phase 4.5 cross-link 의무화 (묶음 C)**

- `schemas/openapi-extension.schema.json` operations[] 에 `formal_spec_links` 필드 추가 (decision_tables / state_machines / sequence_diagrams).
- `schemas/antipatterns.schema.json` antipatterns[] 에 `formal_spec_links` 필드 추가 (decision_tables / state_machines / sequence_diagrams / invariants).
- 자발적 입증: PoC #03 9/21 op (43%) + 4/11 AP (36%) cross-link → schema 의무화 (optional but recommended).
- ADR-008 (이중 렌더링) + Phase 4.5 본질 가치 정식 입증 데이터.

**Positive Finding 패턴 (묶음 H)**

- `schemas/finding-system.schema.json` `severity` enum 에 `positive` 추가 / `status` enum 에 `logged` 추가.
- 신규 필드 `positive_finding_meta`:
  - `previous_poc_finding` — 이전 PoC negative finding ID
  - `current_poc_evidence` — 현 PoC positive 증거
  - `learning_effect_type` enum 4종 (framework_natural_avoidance / language_static_block / platform_difference / team_learning)
  - `v13_promotion_candidate` — v1.3 본체 격상 후보 표시
- `methodology-spec/finding-system.md` §4 + §5 갱신 — positive finding 패턴 + 4 학습 효과 분류 + logged 처분 신설.
- 사례: PoC #03 F-161 (Bearer 표준 = NestJS framework_natural_avoidance) — PoC #02 F-084 비재현.
- 단일 PoC 과적합 회피 (§8.1) 의 적극적 입증 = "비재현 = 학습 효과" 정량화.

**Lifecycle BR 패턴 (묶음 K)**

- `schemas/formal-spec.schema.json` `decision_tables` items 갱신:
  - `required` 분리 — always (br_id/trigger/condition/action/expected_result/verification_location/current_state) vs api (rejection_method/http_status/error_message).
  - `rejection_method`/`http_status`/`error_message` 타입 `["string", "null"]` / `["integer", "null"]` (lifecycle BR null 허용).
  - 신규 필드 `current_state_note` (한국어 prefix enum 위반 회피 — F-156 fix).
  - 신규 필드 `br_type` enum (api / lifecycle / domain_invariant / performance / security).
- `methodology-spec/workflow/phase-4-5-formal-spec.md` §3.3.1 신설 — BR 분류 + null 허용 필드 + current_state_note 정식.
- 사례: PoC #03 BR-USER-PASSWORD-HASH-001 (@BeforeInsert) / BR-ARTICLE-COMMENT-EAGER-001 (eager loading).

#### Changed (변경)

**AP-PERFORMANCE-001 medium → high 정식 격상 (묶음 I)**

- `methodology-spec/deliverables/6-antipatterns.md` §5.5 신설:
  - Severity 격상 정책 (3 PoC 재현 = medium → high 자동 격상)
  - 정식 격상 사례 표 (AP-PERFORMANCE-001)
  - severity inflation 회피 패턴 (단일 PoC = 격상 ❌, 2 PoC = 권위 표기, 3 PoC = 격상 ✅)
- 근거: PoC #01 F-006 + PoC #02 F-051 + PoC #03 F-124 = 3 PoC 재현 권위.

**드리프트 / DMN 도구 보강 (이전 묶음 A + B 본체 반영)**

- `tools/drift-validator/src/normalize-mermaid.js` — `state_ancestors` Map 추가 (sub-state ancestry 추적).
- `tools/drift-validator/src/compare.js` — `transitionFuzzyMatch` 6 case 확장 (compound state inner / sub-tree / self-loop / m.parent).
- `tools/drift-validator/corpus/` — 4쌍 → 14쌍 (Sprint 5 carry-over 70% 진척).
- `tools/decision-table-validator/src/json-sanity.js` — REQUIRED_ALWAYS / REQUIRED_IF_API 분리 (묶음 K 의 도구 측 fix).

#### Validated (검증)

- drift-validator unit test 6 → 14 (모두 통과).
- PoC #03 자가 재검증 — drift breaking 20 → 8 → 0 ✅ / dmn 12 BR 0 breaking + 8 info (lifecycle null 의도) ✅.
- false positive 60% → 0% (ADR-009 단계 3+ 도달).

### 현재 상태

- **본체 갭 11건 closed** (v1.2.2 7건 + v1.2.3 4건).
- ADR 9개: 001~006 + 008 + 009 (변동 없음 — 본 PATCH 는 schema/명세 본체 격상).
- 신뢰도 정직 표기: 80-87% 유지 (시뮬 패널티 / Sprint 5 carry-over).
- PoC #03 신뢰도 0.87 (단계 3+).
- v1.3.0 정식 release 진입 직전 상태 도달.

### Carry-over → v1.3.0

1. **Sprint 5** — F-156 (한국어 prefix) 외 잔여 환경 의존 (Semgrep/PMD/spectral)
2. **묶음 R 신설** — NestJS 4 ADR (Auth / Validation / HttpCode / TypeORM) — DEC-v1.3-격상-데이터-완비 §2.1 #3
3. **묶음 D** — ADR provisional → final 격상 + ADR-010 (baseline + ratchet)
4. **§8.1 정식 등재** — 3 PoC cross-platform 입증 데이터 README/overview 등재
5. **migration-cautions NestJS 변형 추가** — 묶음 P 보강

---

## [v1.2.2] — 2026-04-30 (PATCH)

### 트리거

DEC-2026-04-30-M-묶음-갭-식별 의 P2-3 5건 일괄 처리. v1.2.0 격상 시점 "묶음 M 일괄" 로 미뤄졌던 본체 갭. **본체가 ADR-008 (이중 렌더링 사상) 을 100% 따르지 못하던 상태 해소** — 이제 본체도 PoC 산출물처럼 단일 진실 + AI 눈 + 사람 눈 의무 정합.

### 변경 사항

#### Added (추가)

**`templates/api.template.md`** (G3 — P2 #3)

- `templates/api.template.yaml` (AI 눈) 의 사람 눈 짝.
- PoC #01 / #02 `api.md` 형식 표준화 — endpoint heatmap + UC ↔ op 매핑 + RFC 위반 인덱스 + AP/finding 인덱스 + 변경 권고 우선순위.

**`methodology-spec/workflow/phase-flow.mermaid` + `phase-flow.json`** (G4 — P2 #4)

- 9 phase (0~6 + 4.5) + 산출물 의존 그래프 + Phase 4.5 도입 위치 시각화.
- `.json` 짝 (drift-validator 의 향후 phase-flow 비교기 v1.3+ 호환). 본 sprint 에서는 drift-validator 미인식 — Sprint 6 후속.

**`docs/adr/ADR-009-다이어그램-신뢰-모델.md`** (G5 — P2 #5)

- DEC-2026-04-29-다이어그램-신뢰-모델 + memory `feedback_diagram_trust_model.md` 정식 ADR 격상.
- **7단계 + 8단계 (이론적 100%) 신뢰도 정량 표** — 1차 작성 60-70% / cross-validation 75-85% / **v1.2.1 자동 도구 78-85% 단계 신설** / 시뮬 패널티 80-87% / 진짜 도구 85-92% / property test 90-95% / 사람 95%+ / 형식 증명 100%.
- **도구 종류 enum 7종** — `ai_subagent` / `ai_persona_simulation` / `automated_tool` / `real_static_tool` / `property_test` / `human_review` / `formal_proof`. AI persona vs 진짜 도구 절대 동일 신뢰도 표기 ❌.
- ADR-008 과 짝 — 사상 (왜 두 렌더링) / 정량 (어디까지 믿나).
- 본 방법론 차별 자산 — 외부 사례 부재 (테크기업 사례 research fetch 실패).

**`templates/db-schema.template.md`** (G6 — P3 #6)

- `erd.template.mermaid` (사람 눈 다이어그램) + `schema.json/sql` (AI 눈) 의 보고서 짝.
- PoC #02 `정합성-검증-보고서.md` 형식 표준화 — 출처 매트릭스 + ORM derivative vs 수동 분별 (F-050) + 정합성 5종 + Race Safety + AP/finding 인덱스.

**`templates/meta-confidence.template.yaml`** (G7 — P3 #7)

- `schemas/meta-confidence.schema.json` (AI 눈) 의 사람 눈 짝.
- **dbt-score / Backstage EntityMeta 모델 차용** (Document agent research): `trust_level` (current % + current_step + validation_history[]) + `tool_type` enum (ADR-009 정합).
- PoC #02 `_manifest.yml` 형식 통합. 5종 물증 cross_validation 예시 주석 포함 (formal-spec.schema 정합).

#### Updated (갱신)

- `README.md` — v1.2.1 → v1.2.2 헤더 + ADR-009 명시
- `decisions/STATUS.md` — 묶음 M 7/7 완료 (P1 Sprint 3 + P2-3 본 sprint)
- `decisions/INDEX.md` — DEC-m-p2-3-종결 entry

### 현재 상태

- **본체 갭 7건 모두 closed** (P1 2건 Sprint 3 + P2-3 5건 본 sprint)
- ADR 8개: 001~006 + 008 + **009 신규**
- v1.2.x 묶음: A~P 16건 ready ✅ + M 7/7 ✅ — **사실상 v1.3 진입 가능 상태**
- 신뢰도 정직 표기: 80-87% (시뮬 패널티 유지 / Sprint 5 진짜 도구 carry-over)

### Carry-over

1. **Sprint 5** — static-runner 진짜 실행 1회 / drift-validator transitionFuzzyMatch 보완 / corpus 4쌍→20쌍 / ADR-010 (baseline+ratchet)
2. **Sprint 6** — drift-validator phase-flow 비교기 (v1.3+)
3. **시퀀스 B** — PoC #03 진입 (다른 stack)

---

## [v1.2.1] — 2026-04-30 (PATCH)

### 트리거

C-Sprint 4 종결 — 묶음 N+O 인프라 산출. v1.2.0 의 14/16 묶음 ready 에서 **16/16 ready** 로 격상. 진짜 외부 도구 실 실행은 환경 부재로 Sprint 5 carry-over (no-simulation 정책 정합).

| 묶음  | 영역                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| **N** | Drift 자동 검증 도구 (CI) — drift-validator + decision-table-validator + drift-check.yml                     |
| **O** | 진짜 외부 도구 실행 의무화 — static-runner Plugin host + 5종 물증 schema enforcement + lint-no-simulation.sh |

→ 시퀀스 C 종결. 시퀀스 B (PoC #03) 또는 Sprint 5 (carry-over) 진입 가능.

### 변경 사항

#### Added (추가)

**도구 3종 신설 (`tools/`)**

- `tools/drift-validator/` — `.json ↔ .mermaid` 의미 동일성 자동 검증 (state-machine + sequence). 정규식 fallback (30분 spike 결과 `@mermaid-js/parser` v1.1.0 미지원 입증). oasdiff 식 항목별 diff list + severity (`breaking`/`non-breaking`/`info`). corpus 4쌍 self-test (Sprint 5 → 20쌍 확장 carry-over). 6/6 unit test pass.
- `tools/decision-table-validator/` — dmn-check 5종 (duplicate / conflict / gap / overlap / type) + JSON sanity (formal-spec.schema 정합). `red6/dmn-check` Apache 2.0 알고리즘 차용. 7/7 test pass.
- `tools/static-runner/` — Semgrep / PMD / SpotBugs / Daikon / CodeQL plugin host. **5종 물증 schema enforcement** + `lint-no-simulation.sh` 차단 룰. 4/4 test pass. Sprint 4 1차: Semgrep + PMD plugin (SpotBugs/Daikon/CodeQL plugin skeleton 만 — Sprint 5+ carry-over).

총 17/17 unit test pass.

**CI workflow 신설**

- `.github/workflows/drift-check.yml` — 이중 모드 (PR diff-aware `SEMGREP_BASELINE_REF=main` / nightly full / manual dispatch). action 핀 (`actions/setup-java@v5` Temurin 21 + `actions/setup-node@v6`). SARIF Code Scanning upload + 30일 evidence artifact 보존.

#### Changed (변경)

**`schemas/formal-spec.schema.json` — `cross_validation` 5종 물증 의무화**

`validators[]` 항목에:

- `real_tool: true` 시 7 필드 (`tool_version` / `tool_stdout_path` / `tool_stderr_path` / `invocation_timestamp` / `duration_ms` / `result_hash` / `reproduction_command`) **JSON Schema if/then allOf 강제**
- `real_tool: false` 시 `simulation_reason` 의무
- `simulation_only: true` 시 자동 fail

→ DEC-2026-04-29-static-tool-실행-의무화 enforcement 자동화.

#### Validated (검증)

**PoC #02 자가 검증 (Sprint 4 본질적 가치)**

drift-validator + decision-table-validator 를 PoC #02 formal-spec 디렉토리에 적용:

- state-machine 2건: **7 breaking** + 0 non-breaking + 24 info
- sequence 2건: 0 breaking
- decision-table 6건: 0 breaking + **3 non-breaking** (interpretive drift)

→ Sprint 3 가 "drift 0" 으로 보고했던 산출물에서 **10건 자동 검출**. 수동 검증 한계 노출 = 묶음 N (Drift CI) 의 강한 ROI 정량 입증.

#### Findings (신규)

**Sprint 4 신규 finding 11건** (F-107~F-117) — `examples/poc-02-realworld-springboot3/output/formal-spec/SPRINT-4-REPORT.md` 정리.

| 분류                                  | 건수 | 핵심                                      |
| ------------------------------------- | ---: | ----------------------------------------- |
| state-machine structural drift (high) |    4 | F-107 / F-109 / F-110 / F-112             |
| state-machine 추상화 layer (medium)   |    3 | F-108 / F-111 / F-113                     |
| decision-table interpretive (low)     |    3 | F-114 / F-115 / F-116                     |
| 메타 finding (medium)                 |    1 | F-117 — Sprint 3 "drift 0" 수동 한계 노출 |

#### Carry-over → Sprint 5

1. static-runner Semgrep + PMD 1회 실 실행 (사용자 환경 설치 또는 CI 위임 후) — 신뢰도 80-87% → 90-95% 격상 가능
2. drift-validator transitionFuzzyMatch 보완 (composite state inner transition) — F-108/F-110/F-111 false positive 제거
3. corpus 4쌍 → 20쌍 확장
4. ADR-010 (baseline + ratchet) 격상 — 운영 표준 (Slack/GitLab/Dropbox/Figma/Shopify 사례 정합)

### 신뢰도 표기 (정직 유지)

- 시뮬 패널티 적용 시 80-87% (현재 — 본 환경 Java/Semgrep/PMD 부재)
- 진짜 도구 1회 실행 시 90-95% 목표 (Sprint 5 carry-over)

no-simulation 정책 정합 — 시뮬 결과를 신뢰도 90-95% 근거로 절대 사용 금지.

### 결정 / 보고서

- `decisions/DEC-2026-04-30-sprint-4-종결.md`
- `decisions/STATUS.md` 갱신 (v120_bundles_ready: 16/16)
- `decisions/INDEX.md` 갱신
- `examples/poc-02-realworld-springboot3/output/formal-spec/SPRINT-4-REPORT.md`
- `examples/poc-02-realworld-springboot3/.claude/SESSION-WRAPUP-2026-04-30-sprint4.md`
- `ai-native-methodology/.claude/plans/plan-c-sprint-4.md` + `.claude/researches/research-c-sprint-4.md`

---

## [v1.2.0] — 2026-04-30 (MINOR)

### 트리거

PoC #01 + PoC #02 (1chz/realworld-java21-springboot3 — Spring Boot 3.3 / Java 21 / Multi-module Hexagonal) 누적 결과로 **MINOR 격상**. C-Sprint 1+1.5+2+3 (Phase 4.5 형식화 시범) 4 sprint 누적 정량 입증 + 14 묶음 통합:

| 묶음  | 영역                                                                              |
| ----- | --------------------------------------------------------------------------------- |
| A     | cross-validation (F-015) — sub-agent 학습 코퍼스 의존 위험 회피                   |
| B     | 정정 트레이스 (F-022 + F-024)                                                     |
| C     | severity 표준 (F-018)                                                             |
| D     | schema 진화 (F-025) — multi-module + Hexagonal 모듈 분리                          |
| E     | quality-extraction                                                                |
| F     | 신뢰도 공식 보강                                                                  |
| G     | OpenAPI x-extension (ADR-007) — PoC #02 외부 검증                                 |
| H     | multi-module / Auth/Crypto — PoC #01+#02 isomorphic (AP-SECURITY-001 양 PoC 재현) |
| I     | finding-system 정식화 (Sprint 3 schema 등록)                                      |
| J     | Hexagonal port-adapter 가이드                                                     |
| K     | multi-module Outside-in 모범 사례                                                 |
| **L** | **Phase 4.5 형식화 정식 도입 — Sprint 1~3 누적 **                                 |
| **M** | 본체 이중 렌더링 갭 P1 2건 적용 (P2-3 5건은 v1.2.0+ 일괄)                         |
| **P** | 안티패턴 migration_advice + migration-cautions.md                                 |

이중 렌더링 정합도 67% → 100% (state-machine + sequence + decision-table 영역). v1.2.0 = "코드 → 형식 명세 + 위험 기록" 한 방향 추출기 가치 명세 정식 등록.

### 변경 사항

#### Added (추가)

**ADR-008: 이중 렌더링 사상 (신규 )** — DEC-2026-04-29-이중-렌더링-사상-명시화 격상

- 단일 진실 (SSOT) + 두 청중 (AI 눈 / 사람 눈) 사상 정식 등록
- 학문적 계보: Donald Knuth, "Literate Programming" (1984) AI 시대 재해석
- 영역별 적용 매트릭스 (산출물 + Phase 4.5 5건 + 메타)
- ADR-001 (Schema-First) 포섭 (supersede X — Schema-First = AI 눈 부분)
- 신규 산출물 추가 시 양쪽 렌더링 의무 체크리스트

**Phase 4.5 형식 명세 (신규 )** — 묶음 L

- `methodology-spec/workflow/phase-4-5-formal-spec.md` — workflow 명세
- `methodology-spec/deliverables/4-5-formal-spec.md` — 산출물 명세
- `schemas/formal-spec.schema.json` — 5 산출물 schema (state_machines / sequences / decision_tables / invariants / property_tests + cross_validation 메타)
- `templates/formal-spec.template.md` — 작성 가이드
- `templates/state-machine.template.mermaid` — Mermaid stateDiagram-v2 예시
- `templates/sequence.template.mermaid` — Mermaid sequenceDiagram 예시
- `templates/decision-table.template.md` — 9 항목 표 (자연어 빈약성 100% 보완)
- 자연어 빈약성 정량 입증: 4/9 (44%) → 9/9 (100%) — PoC #02 F-074 단방향 round-trip 검증
- AI 코드 생성 정확도: 자연어 60% → 형식 90% (시뮬 패널티 시 80-87%)

**finding-system.schema.json (신규)** — M-P1-#1

- `schemas/finding-system.schema.json` 정식 등록 — `methodology-spec/finding-system.md` DRAFT 자산화 차단 해소
- finding 표준 형식 schema 화 (finding_id pattern / phase 0~6 + "4.5" / severity 4단계 critical 추가 / status 7단계 candidate/merged 추가 / cross_validation double_hit / severity_history)
- PoC #02 운영 패턴 (candidate / merged / critical / cross_validation double_hit) 모두 schema 화

**migration-cautions.md (신규)** — 묶음 P β

- `methodology-spec/workflow/phase-6-quality.md` 의무 산출물 격상 (β)
- 본 방법론 가치 명세: "코드 → 형식 명세 + **위험 기록** 한 방향 추출기" 정합
- 카테고리별 (API / DB / Security / Architecture / Domain / Performance) 신규 시스템 회피 가이드
- design / CI / Review 단계 체크리스트
- avoid-list.md 와 차이: 기존 시스템 fix vs 신규 시스템 회피

**`migration_advice` 필드 (antipatterns.schema.json 신규)** — 묶음 P α

- `schemas/antipatterns.schema.json` 에 `migration_advice` 필드 추가 (optional — 호환성 유지)
- PoC #02 21 AP backfill 완료 (PoC #01 15 AP 는 v1.2.x backfill)

#### Changed (변경)

**phase-6-quality.md §6 출력 (변경)** — 묶음 P β

- migration-cautions.md 의무 산출물 격상 (composite-patterns.md 와 동급)
- §6.0 신설: migration-cautions.md 구조 + avoid-list.md 와 차이 명시

**schemas/README.md (목록 갱신)** — 묶음 I + L

- finding-system.schema.json 추가
- formal-spec.schema.json 추가

#### PoC #02 산출물 (참조)

- `examples/poc-02-realworld-springboot3/` Phase 1~6 종결 (산출물 6/7) + Phase 4.5 형식화 4 sprint
  - finding 43건 (F-042~F-087 + Sprint 1.5+2 신규 19건)
  - AP 21건 (critical 3 / high 3 / medium 10 / low 5)
  - migration_advice 21/21 backfill ✅
  - migration-cautions.md 신규 ✅
  - formal-spec/ 7대 영역 28 산출물 + 이중 렌더링 100%

### 알려진 한계 (v1.2.0 스코프 외 — F-021 §8.1 점검 결과)

C-Sprint 3 #4 §8.1 단일 PoC 과적합 회피 점검 결과:

- **Strong 후보**: 0건 (closed 8건 모두 통과)
- **한계 명시 후보 2건**:
  - F-016 (ddl-auto 분기) — closed 유지. PoC #02 F-049 메타 finding 으로 schema.sql ORM derivative 출처 의존성 분별 한계 부분 노출. v1.2.x 또는 v1.3.0 에서 보강 권고.
  - F-023 (SCC 도메인 의도 분기) — closed 유지. PoC #02 F-060 메타 finding 으로 §3.1.1 0건 케이스 한계 노출. v1.2.x 보강 권고.

### v1.2.0 스코프 외 (Sprint 4 / v1.2.x 후속)

- **묶음 N**: Drift 자동 검증 CI 도구 (이중 렌더링 .json ↔ .mermaid 일치 강제)
- **묶음 O**: 진짜 외부 도구 의무화 (Semgrep / PMD / SpotBugs / Daikon / CodeQL — DEC-static-tool-실행-의무화)
- **묶음 M P2-3**: 본체 갭 5건 (api.template.md / phase-flow.mermaid / ADR-009 / db-schema.template.md / meta-confidence.template)
- **신뢰도**: 80-87% (시뮬 패널티) → 90-95% 목표 (Sprint 4 진짜 도구 도입)

### Migration Guide (이전 사용자용)

본 v1.2.0 은 **하위 호환** (MINOR — 모든 schema 변경은 옵셔널 신규 필드).

기존 v1.1.x 산출물에 다음 권장:

1. `antipatterns.json` 의 각 AP 에 `migration_advice` 필드 추가 (선택, 신규 시스템 회피 가이드)
2. Phase 6 산출 시 `migration-cautions.md` 신규 작성 (의무 산출물 격상 — β)
3. Phase 4 후 형식 명세 필요 시 Phase 4.5 진입 (`formal-spec/` 디렉토리 + 5 산출물)
4. 신규 산출물 추가 시 ADR-008 이중 렌더링 사상 의무 준수 (양쪽 렌더링 동시 산출)

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (Phase 4.5 형식화 + migration-cautions 의무)
- ✅ 본 방법론으로 만든 v1.1.x 산출물 (호환, migration_advice + migration-cautions backfill 권장)
- ❌ Breaking change 없음

### 검증

- 11개 schema (formal-spec / finding-system 신설 포함) JSON Schema Draft 2020-12 문법 통과
- ADR-008 정합성: ADR-001 (Schema-First) 포섭 / ADR-002 (산출물) 사상적 기반 / ADR-007 (OpenAPI x-extension) 정합
- 사료 강도: Knuth Literate Programming (1984) 1차 사료 + RFC 7231/9110 + Spring Data JPA Reference + Vlad Mihalcea + Vernon IDDD
- C-Sprint 1+1.5+2+3 누적 cross-validation: drift 34건 (Sprint 1.5 11 + Sprint 2 19 + Sprint 3 +0 — 정합 100%)

### Lessons Learned

- 이중 렌더링 사상 (ADR-008) 은 v1.1.x 시점에 이미 _암묵적으로_ 적용되어 있었으나 사상 명시 부재 → Sprint 3 #1 직전 ADR-008 작성으로 묶음 L (Phase 4.5) 격상의 사상적 기반 강화
- F-074 단방향 round-trip 검증 패턴 (코드 부재 BR 선택 → 자연어 → 형식 → 코드 생성) — Sprint 1 self-reference 함정 회피 + 자연어 빈약성 정량 입증 (44% → 100%)
- M-P1 병행 패턴 (방법론 본체 갭 P1 을 PoC sprint 와 병행) — 사상 정식화와 PoC 정식화 동시 진행 가능
- Python script 일괄 적용 (21 AP migration_advice backfill / 6 decision-table .json 짝) — Edit 21번 vs script 1번 효율 차이 큼

---

## [v1.1.2] — 2026-04-28

### 트리거

PoC #01 (RealWorld Spring Boot) Phase 0~3 완료 + **F-021 누적 finding 임계** (18/20 도달) → 사용자 결정 Option A (PoC 정지 + v1.1.2 격상). high severity finding 4건 처리:

- F-007: inventory.schema.json + template 부재 (high)
- F-009: phase-1-init.md §6 신뢰도 표 환경 종속성 미명시 (high)
- F-016: phase-2-db.md §3.4 ddl-auto 매트릭스 부재 (high)
- F-023: phase-3-arch.md §3.1 Tarjan SCC vs 도메인 의도 분기 가이드 부재 (high)

### 변경 사항

#### Added (추가)

**schemas/inventory.schema.json (신규)** — F-007

- meta + repo + stack + architecture_style_candidates + modules_for_priority_analysis + directory_tree_extraction
- `repo.loc_extraction_method` enum (deterministic / heuristic_byte_per_35 / estimation / unknown) — F-009 결정성 축
- `architecture_style_candidates[].confidence` cap 0.7 (Phase 1 한계, 최종 분류는 Phase 3)
- `directory_tree_extraction.truncated` boolean — Trees API 한계 명시
- 산업 모델: Backstage Catalog Entity descriptor

**templates/inventory.template.json + inventory.template.md (신규)** — F-007

- placeholder 형식 + 사람용 README 형식 분리
- meta.warnings 의무화 항목 (heuristic LOC, truncated tree, ORM 단서 부족 등)

**schemas/README.md (신규)** — F-007

- 9개 schema 목록
- CI 검증 TODO (v1.3.0 도입 예정 — Backstage 진화 모델)
- v1.1.2 임시 정책: 수동 ajv 검증 권장
- 산업 사례 경고: OpenAPI 3.0→3.1 7년 divergence

**ADR-006 (신규, Provisional)** — F-023

- 순환 의존성 처리 default 정책
- hybrid (탐지 결정적 + 분류 BC 분기 + decision_required 페어)
- bc_status 3값 enum (same / different / undefined) + bc_assignment_explicit boolean + documented_decision boolean
- BC 미정의 default = medium + decision_required = true (ArchUnit FreezingArchRule 산업 표준)
- "intent" 단어 회피 (산업 표준 도구 0건 사용)
- revisit_at: PoC #02 완료 시점

#### Changed (변경)

**phase-1-init.md §6 신뢰도 표** — F-009

- 단일 표 + 결정성 (Determinism) 축 + 환경 caveat 컬럼 채택
- 결정성 tier: deterministic / snapshot-based / heuristic / pattern_matching / llm_with_grounding / llm_code_only
- inventory.meta.warnings 의무화 가이드 추가
- 산업 표준 5건 정합 (CodeQL `@precision` / Sourcegraph SCIP / Linguist / SonarCloud / tree-sitter)
- 안티 패턴 명시: "환경별로 표 자체를 분리" 거부 (DRY 위반 + enum 폭발 + 산업 표준 0건)

**phase-2-db.md §3.4 통합 우선순위** — F-016

- 7행 매트릭스 → **원칙 + Decision Tree + 부록 reference** 구조
- 원칙 3개 (자동 schema 변경 금지 / DDL versioned-reviewable-reversible / ORM = validate 한정)
- Decision Tree (마이그레이션 도구 도입 가능 → 운영 DB 존재)
- 부록 A: Hibernate ddl-auto enum 값 reference (운영 가능 여부 표시)
- 산업 권위 7/7 매트릭스 반대 (Vlad Mihalcea / Stripe / Atlasgo / Quesma) → 원칙 표준 채택

**phase-3-arch.md §3.1 순환 의존성 처리** — F-023

- §3.1.1 신설: Tarjan SCC + BC 분기 + decision_required 5단계
- 분류 표 + 도구 정책 분기 (Spring Modulith verify() / ArchUnit FreezingArchRule)
- §3.1.2 산출 형식 (architecture.json circular_dependencies[] 예시)
- ADR-006 참조 의무

**schemas/architecture.schema.json `circular_dependencies[]` 보강** — F-023

- 신규 옵셔널 필드 7개: id / detection.algorithm / bc_status / bc_assignment_explicit / documented_decision / decision_required / decision_owner / decision_deadline / phase_4_routing
- 모두 옵셔널 → v1.1.1 산출물 호환 (PATCH 가능)

#### Documentation (문서)

> ※ v1.1.2 작업 산출물 (`methodology-v1.1/.claude/`) 은 batch 1.5 (commit `c72d29c` 이후) 에서 폐기. 1차 사료는 git history 에서 조회 가능.

- `plan-v112.md` — 1원칙 산출물 (변경 계획)
- `researches/document-v112.md` — 공식문서 24개 출처
- `researches/senior-v112.md` — 시니어 의견
- `researches/case-v112-{f007,f009,f016,f023}.md` — 사례 (분리 재실행)
- `researches/research-v112.md` — 통합 (Q1~Q9 결정 매트릭스)
- `PROGRESS-v112.md` — 진행 로그 (시간순)

### Migration Guide (이전 사용자용)

본 v1.1.2 는 **하위 호환** (PATCH). 모든 schema 변경은 옵셔널 신규 필드.

기존 v1.1.1 산출물에 다음 권장:

1. `inventory.json`: 신규 schema 로 검증 (`ajv validate -s schemas/inventory.schema.json`). 누락 필드는 옵셔널이므로 통과.
2. `inventory.meta.warnings`: 환경 종속/추정 항목 명시 (heuristic LOC, truncated tree)
3. `architecture.json` 의 `circular_dependencies[]`: `bc_status=undefined` + `decision_required=true` 추가 권장 (BC 미정의 시 default)
4. `architecture.meta.warnings`: "v1.1.2 분기 가이드 적용 시 재산정 권장" 추가

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (inventory schema 검증 + 결정성 표 + 원칙 + Decision Tree + 순환 분기 가이드)
- ✅ 본 방법론으로 만든 v1.1.0/v1.1.1 산출물 (호환, warnings 추가만 권장)
- ❌ Breaking change 없음

### 검증

- 9개 schema (inventory 신설 포함) JSON Schema Draft 2020-12 문법 통과
- ADR-006 (provisional) 정합성: ADR-001 / ADR-004 와 충돌 없음
- 사료 강도: 4 finding 모두 1차 사료 직접 검증 (Drotbohm Discussion #493 / Vlad Mihalcea / CodeQL @precision / Backstage Entity.schema.json)
- F-015 cross-validation 패턴 적용 (sub-agent 결과 6건 모두 메인 cross-check)

### Lessons Learned

- 1원칙 (plan) 단계에서 변경 매트릭스가 PoC 사례 1건 (RealWorld) 에 너무 적합화됨 → research 통해 BC 미정의 default 가 PoC #02 (마이크로서비스) 에서 부적합 가능성 발견 → ADR-006 provisional 처리
- case agent 4 finding 일괄 처리는 hang 위험 (한국 테크블로그 Cloudflare 추정) → 1건씩 분할 + 한국 테크블로그 제외 + WebFetch 8회 제한이 안정적
- senior + case 가 plan 초안의 "intent" 단어를 동시 거부 → schema 어휘 결정 시 산업 표준 도구 조사 우선

---

## [v1.1.1] — 2026-04-26

### 트리거

PoC #01 (RealWorld Spring Boot) Phase 0에서 발견된 명세 빈틈 2건 해결:

- F-003: 신뢰도 메타데이터 자동 산정 공식 부재 (high)
- F-006: 영역별 가중 평균 방식 부재 (high)

### 변경 사항

#### Added (추가)

**ADR-003 §6~§10 (103 → 301 라인, 3배 확장)**

- §6 산정 공식 v1 (가법 모델 + 상한 0.98)
  - base_confidence: 0.75 (소스만 기준)
  - 가산점 표 10개 (ERD +0.10, ORM +0.10, ...)
  - 페널티 표 5개 (drift -0.05, no_orm -0.05, ...)
  - PoC #01 적용 예시
- §7 영역별 가중 평균 (요소 수 가중)
  - 공식: `weighted_avg = Σ(conf × element_count) / Σ(element_count)`
  - cap 우선순위: weighted 후 min(0.98, weighted)
- §8 추출 방법별 신뢰도 표
  - 결정적: 0.95~1.0
  - 패턴 매칭: 0.80~0.90
  - LLM 추론 (grounding): 0.50~0.75
  - LLM 추론 (코드만): 0.40~0.60
- §9 신뢰도 해석 가이드 (5단계)
  - ≥0.95 거의 확실 / 0.80~0.95 신뢰 가능 / 0.60~0.80 권장 / 0.50~0.60 필수 / <0.50 차단
  - confidence ≠ accuracy 명시
- §10 v1 한계 명시 (calibration 필요, 베이지안은 v2 후보)

**meta-confidence.schema.json 신규 필드 5개**

- `formula_version: "v1"` — 공식 버전 추적
- `applied_modifiers[]` — 어떤 가산점이 적용됐는지
- `applied_penalties[]` — 어떤 페널티가 적용됐는지
- `cap_applied: boolean` — 0.98 cap 적용 여부
- `manual_override: boolean` — 사용자 수동 변경 여부

**meta-confidence.schema.json 구조 강화**

- `confidence_breakdown` 항목에 `element_count` 추가 (가중 평균용)
- `confidence_breakdown` 항목에 `extraction_method` enum 추가 (deterministic/pattern_matching/llm_with_grounding/llm_code_only)
- `inputs_used` enum 확장 (domain_context_md, postman_or_api_test, diagrams_other 추가)

**PoC #01 산출**

- `examples/poc-01-realworld-spring/source-info.md` — 분석 대상 메타정보
- `examples/poc-01-realworld-spring/inputs/domain-context.md` — LLM grounding
- `examples/poc-01-realworld-spring/inputs/_manifest.yml` — 입력 + 신뢰도 산정
- `examples/poc-01-realworld-spring/findings/poc-findings.md` — 명세 빈틈 누적 기록

#### Changed (변경)

**confidence cap 통일 (1.0 → 0.98)**

- `meta-confidence.schema.json`: confidence maximum 1.0 → 0.98
- `antipatterns.schema.json`: confidence maximum 1.0 → 0.98
- `rules.schema.json`: confidence maximum 1.0 → 0.98
- 산출물 명세 7개 검증 + 9곳 보정:
  - `1-architecture.md`: 모듈 식별/의존성/순환 의존성 1.0 → 0.98
  - `4-db-schema.md`: 운영DB 추가 시 1.0 → 0.98 (3곳)
  - `6-antipatterns.md`: static_analysis 1.0 → 0.98, "1.0 가능" → "0.98 cap까지"

**PoC #01 manifest 재계산**

- `expected_confidence_average`: 0.78 → 0.95 (정확한 공식 적용)
- `applied_modifiers` 명시: ORM full(+0.10), domain-context(+0.03), Postman(+0.05), diagrams(+0.02)

#### Documentation (문서)

- `plan-f003-신뢰도공식.md` — 해결 계획
- `research-f003-신뢰도공식.md` — 3-에이전트 토론 (가법 vs 곱셈 vs 베이지안 등 6개 주제)

### Migration Guide (이전 사용자용)

본 v1.1.1은 **하위 호환** (PATCH).

기존 v1.1.0 산출물에 다음만 권장:

1. `meta.formula_version: "v1"` 추가 (선택)
2. `confidence` 값이 1.0이면 0.98로 보정 (선택)
3. `confidence_breakdown` 항목에 `element_count` 추가 (가중 평균 정확도↑, 선택)

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (자동 신뢰도 산정 가능)
- ✅ 본 방법론으로 만든 v1.1.0 산출물 (호환, 재계산 권장)
- ❌ Breaking change 없음

### 검증

- 8개 schema JSON 문법 통과
- 모든 ADR 일관성 유지
- 산출물 명세 7개 정합성 확인
- Mermaid 검증 (이전 사이클에서 완료)

---

## [v1.1.0] — 2026-04-26 (초기)

### 트리거

사내 표준 AI-Native 개발 방법론 v1.1 설계 (분석 단계 ① Analyze).

### 변경 사항

#### Added (초기 작성)

**ADR 5개**

- ADR-001: 사상적 기반 (Schema-First + Contract-First + DDD-Lite + FSD)
- ADR-002: 산출물 (UI/UX 신설)
- ADR-003: 신뢰도 메타데이터 표준 (§1~§5)
- ADR-004: DDD-Lite 강도 B (Aggregate/VO/Repository)
- ADR-005: 한국어 용어 정책 (3단)

**산출물 명세 7개** (`methodology-spec/deliverables/`)

- 01 아키텍처
- 02 도메인 모델 (DDD-Lite B)
- 03 API 계약
- 04 DB 스키마
- 05 비즈니스 규칙
- 06 안티패턴
- 07 UI/UX 명세

**워크플로우 명세 12개** (`methodology-spec/workflow/`)

- Phase 0: 입력 정리
- Phase 1: init
- Phase 2: db (정합성 검증 포함)
- Phase 3: arch
- Phase 4: 비즈니스 로직 (4영역 병렬)
  - 5.A DB 영역
  - 5.B FE 영역
  - 5.C 설정 영역
  - 5.D 외부 의존성
- Phase 5-1: api
- Phase 5-2: ui
- Phase 6: quality

**JSON Schema 8개**

- meta-confidence, architecture, domain, openapi-extension, db-schema, rules, antipatterns, ui-spec

**템플릿 7세트** (`templates/`)

- architecture, domain, erd, api(yaml), rules, antipatterns, ui-spec
- Mermaid 다이어그램 템플릿 5개

**기타**

- 한국어 용어집
- README.md

### 통계

- 44개 파일 / 8,548 라인
- Mermaid 블록 68개 (모두 §9.1 표준 준수)

---

## 다음 마일스톤

### v1.2.x (예정 — Sprint 4)

- **묶음 N**: Drift 자동 검증 CI 도구 (이중 렌더링 .json ↔ .mermaid 일치 강제)
- **묶음 O**: 진짜 외부 도구 의무화 (Semgrep / PMD / SpotBugs / Daikon / CodeQL — DEC-static-tool-실행-의무화)
- **묶음 M P2-3**: 본체 갭 5건 (api.template.md / phase-flow.mermaid / ADR-009 / db-schema.template.md / meta-confidence.template)
- F-016 / F-023 한계 영역 명시 보강
- 신뢰도 80-87% → 90-95% (시뮬 패널티 제거)

### v1.3.0 (계획 — 데이터 완비 시점 )

**2026-04-30 PoC #03 종결 = 격상 데이터 완비 ** — 자세한 통합 보고서 `docs/v1.3-promotion-report.md` + DEC `DEC-2026-04-30-v1.3-격상-데이터-완비.md`.

#### 격상 후보 6건 (사용자 결단 영역)

| #   | 후보                                       | source                                                                |
| --- | ------------------------------------------ | --------------------------------------------------------------------- |
| 1   | **AP-PERFORMANCE-001 medium → high 격상**  | 3 PoC 재현 권위 (PoC #01 F-006 + PoC #02 F-051 + PoC #03 F-124+F-135) |
| 2   | **Positive finding 패턴 정식 도입**        | F-161 (NestJS Bearer 표준 학습 효과)                                  |
| 3   | **묶음 R (NestJS 4 ADR)**                  | PoC #03 NestJS 8 함정 + 학습 효과 3건                                 |
| 4   | **Phase 4.5 cross-link 의무화**            | PoC #03 9/21 op + 4/11 AP 자발적 입증                                 |
| 5   | **migration-cautions.md NestJS 변형 추가** | 묶음 P 보강                                                           |
| 6   | **§8.1 cross-platform 입증 정식 등재**     | 12 cross-validation (Java→TypeScript) 균형 분포                       |

#### Sprint 5 진입 의무 (정식 release 전제)

- F-154 transitionFuzzyMatch 보완 + corpus 4쌍→20쌍
- 진짜 static tool (Semgrep / PMD / OSV-Scanner) 1회 실행
- ADR-010 (baseline + ratchet) 격상

→ Sprint 5 종결 + 격상 후보 6건 채택 결단 후 v1.3.0 정식 release 가능 (신뢰도 90-95%+).

#### 사내 적용 시작 가능 (v1.2.2 시점부터)

본 방법론 v1.2.2 = 사내 legacy 시스템 분석 + 신규 시스템 구축 가이드 제공 가능 — `docs/v1.3-promotion-report.md §5` 참조.

### v2.0.0 (먼 미래)

- 베이지안 신뢰도 모델 (§ADR-003 §10)
- 풀 DDD (Bounded Context Map) 채택 검토
- Event Sourcing/CQRS 채택 검토

---

## 참고

- ADR 5개: `docs/adr/`
- PoC #01: `examples/poc-01-realworld-spring/`
- finding 누적: `examples/poc-01-realworld-spring/findings/poc-findings.md`

---

## Archive — v7.0.0 이하 cutoff (v8.13.2 cleanup / 2026-05-23)

> v8.13.1 carry 잔존 0 + paradigm 안정점 본격 재도달 후 archive cadence 시행 (DEC-2026-05-23-project-cleanup 정합 / v8.x 활성 보존 / v7.0.0 MAJOR (rules.json → business-rules.json rename) breaking cutoff 자연 분기 이하 본 archive 이전).

## [7.0.0] — 2026-05-17 MAJOR — 묶음 Q ⑦: rules.json → business-rules.json 산출물 파일명 rename (breaking 최대)

> **v7.0.0 MAJOR — breaking (의도 / semver 정합)**. 사용자 "하자" → 묶음 Q 잔여 ⑦ 단독 (최대 blast 642 occ·252 files) → "추천안 묶음 + 1-session 시행". 4원칙 full (plan + 3-에이전트 full research + Senior REVISE-3 + STOP-3 hard gate). DEC-2026-05-17-q7-rules-json-rename / ADR-CHAIN-011 §5 patch v16 + §9 LL-i-57. 묶음 Q **전 항목 종결** (①②④⑤+Q-①-followup+⑦).

### 결단 (3-에이전트 수렴 / D1 사실 확정)

- **D1 = v7.0.0 MAJOR 사실 확정** (choice ❌) — official-docs(파일명=계약 처우 시 MAJOR / $id 독립) + industry(파일명 rename=MAJOR 우세 / 외부 consumer 0=즉시 MAJOR 가장 가벼움 / ESLint v9 선례) + Senior CONCUR(artifact contract + hardcoded literal consumer = Q-①-followup MINOR 와 결정적 차이 / LL-i-56 real-tier). Q-①-followup(property/zero-consumer/MINOR) 과 대조 = 파일 artifact 계약 + literal-resolution broad
- **D2 Option A** (rules.schema.json→business-rules.schema.json 동시 rename) / **D3 $id 정합 변경** / **D4 역사 보존+활성 SSOT 갱신** / **D5 git mv 12 명령+분류별 Edit(script ❌)** / **D6 1-session(cooling-off 별도 session 불요 / Senior validated)**

### rename (git mv 12 + literal)

- **git mv 12**: 11 PoC `rules.json`→`business-rules.json` + `schemas/rules.schema.json`→`schemas/business-rules.schema.json` (history-preserving)
- schema $id `https://ai-native-methodology/schemas/business-rules.schema.json` 정합 변경 (다른 schema $ref ❌ → 영향 0)
- Senior REVISE-3 실측 정정 — PoC schema key: 3 `$schema_ref`(poc-01/02/03 honesty) / 1 `$schema_origin`(poc-04 value-edit) / 7 무키(auto-correct). 코드 literal 3곳 (findings-aggregator:83 / release-readiness:111,266)

### STOP-3 hard gate (방법론 hard gate 가치 입증)

- post-mv hard gate 가 **plan/research(Senior REVISE-3 포함 3-에이전트) 누락 consumer 검출** — 6 test 파일 hardcoded `rules.schema.json`/`rules.json` literal (ENOENT). LL-i-55 paradigm 입증 (research 수렴만으로 코드 착수 ❌ / 실측 hard gate). 처분 = 근본 결함 ❌ (test=활성 자산) → 동반 치환 → 재검증
- gate 3/3 통과 = schema-validator 11 PoC VALID + workspace **393/393** + release-readiness **11/11**

### 회귀

- workspace 393/393 + release-readiness 11/11 + chain harness validated 본질 보존 / breaking ✅의도 / 역사(decisions/CHANGELOG/dist) 무수정

### 묶음 Q 전 항목 종결

①(v5.0.0)②(v6.0.0)④(v4.1.1)⑤(v4.1.0)+Q-①-followup(v6.1.0)+**⑦(v7.0.0)** = 묶음 Q 완결. 잔여 carry = C-poc08-drift / C-cross-consistency-validator-inline-emit / §11 후속 list sync / PoC #05 Haiku retrospect

---

## [6.1.0] — 2026-05-17 MINOR — Q-①-followup: rules_auto_extracted_reference → auto_extracted_br_refs semantic-rename

> **v6.1.0 MINOR — additive-equivalent (no consumer observes break)**. 사용자 "1"(묶음 Q 잔여) → "Q-①-followup 먼저"(risk 오름차순 / 11 files) → "추천안 묶음 + 지금 시행". 4원칙 lightweight (plan + 3-에이전트 가벼운 research + 사용자 결단 / LL-i-54 정당 일탈 — breaking 동형 ≠ 비용 동형). DEC-2026-05-17-q1-followup-rename / ADR-CHAIN-011 §5 patch v15 + §9 LL-i-56.

### 결단 (3-에이전트 수렴 / D1 사실 확정)

- **D1 = v6.1.0 MINOR 사실 확정** (choice ❌) — official-docs(semver spec MAJOR 강제 ❌ / public API 경계=프로젝트 재량) + industry(zero-consumer 실용주의 + 연속 MAJOR signal 희석 batch 통설) + Senior(src consumer 0 + poc-04 단일 holder atomic 마이그레이션 = textbook MINOR / v7.0.0 = semver inflation = 역방향 integrity drift). ① "MINOR=integrity drift" 는 alias 폐기+real consumer 한정 / LL-i-52 "semantic-rename ≠ alias 폐기" → version 논리도 분리
- **D3 cooling-off = 지금 시행** / **process = lightweight** (LL-i-54 정당 / DEC 명시)

### rename

- `rules.schema.json` property `rules_auto_extracted_reference` → **`auto_extracted_br_refs`** (의미 불변 / FE 트랙 cross-link provenance pointer / BR-list alias 아님) + description + 최상단 title/description forward-pointer **재작성** (carry → 완료 / Senior 누락 보정)
- `examples/poc-04-.../rules.json` — 유일 holder key rename (atomic 동시 마이그레이션 / src consumer 0)
- `drift-validator/canonical-single-alias.test.js` — 보존 test → rename후 보존 + 구명 재유입 0 전환 / ② guard(businessRule anyOf) 비교란 확인 = **8/8 pass**

### 회귀

- poc-04 schema VALID + drift canonical 8/8 + release-readiness 11/11(목표) + chain harness validated 본질 보존 / MINOR=additive-equivalent (breaking 호칭 ❌ / semver 정합)

### 묶음 Q 진행

- ①(v5.0.0)②(v6.0.0)④(v4.1.1)+**Q-①-followup(v6.1.0)** 종결. **잔여 = ⑦ 단독** (rules.json→business-rules.json / 642 occ·252 files / 별도 session + 4원칙 full + cooling-off)

---

## [6.0.0] — 2026-05-17 MAJOR — 묶음 Q ② BR 표현 4종 → 2종 단일화 (breaking)

> **v6.0.0 MAJOR — breaking change (의도 / semver 정합)**. 사용자 "권고를 따를게"(추천안 전부 채택) → 묶음 Q 잔여 risk 오름차순 첫 ②. 4원칙 (plan + 3-에이전트 research + STOP-1 dry-run 실측 + 사용자 결단). DEC-2026-05-17-q2-br-표현-4to2 / ADR-CHAIN-011 §5 patch v14 + §9 LL-i-54·55.

### 결단 (사용자 추천안 전부 채택)

- **D1 description = anyOf branch 제거 + property optional metadata 보존** / **D2 TCA = branch 제거 + property 6종 canonical 보존** (Senior close round — `decision-table-validator` load-bearing consumer 실소스 검증 → hard-remove ❌) / **D3 #06 7 BR 합성 = 전체 gate** / **D5 cooling-off = 지금 시행** / **D6 ② 단독**
- **version = v6.0.0 MAJOR 사실 확정** (official-docs VERIFIED: anyOf 4→2 로 description-only valid→invalid = semver Rule 8 MAJOR 필수)

### BR 표현 4종 → 2종

- **폐기 (BR 표현 자격 박탈)**: `description` 단독 / `trigger`+`condition`+`action`(TCA). `rules.schema.json` `$defs.businessRule.allOf[0].anyOf` 4 branch → **2 branch (given/when/then + natural_language ONLY)**
- **보존 (D1·D2 / official-docs#2 VERIFIED — branch 제거 ≠ property 금지)**: `description`/`trigger`/`condition`/`action`/`expected_result`/`rejection_method`/`verification_location` property = optional metadata (decision-table-validator + synthesize-gwt-from-tca.mjs consumer 보호)
- description-only / TCA-only BR = 이제 schema **INVALID hard reject**

### STOP-1 dry-run 실측 (회귀 아닌 개선 확정)

- `_q2-dryrun.mjs` (no-simulation) — 전 11 PoC 중 **#06 7/7 description-only 가 유일** / TCA-only 0 / 그 외 100 BR 전부 GWT|NL 보유
- #06 7 BR NL+GWT 합성(Sonnet 4.6 batch + 독립 Opus spot-check 4/7 EFI-WEB 원본 대조) 후 재실측 = 전 11 PoC `descOnly=0 tcaOnly=0` → 회귀 면 7 BR(1 PoC) 전부 coverage 증가 = **개선 확정** (LL-i-53 / ① poc-04 precedent 동형)

### tool / test

- `br-cross-consistency-validator/deterministic.js` — `representation_missing` 조건 `!hasNL&&!hasGWT` (description/TCA 제외) + `description_only_fallback`(low) finding 폐기 → **critical 'representation_missing' 격상** (Senior "defect surfaces louder")
- test = chain-schemas (description-alias·TCA accept 2 → v6.0.0 REJECT 2 + GWT+desc·NL+TCA VALID functional 2 신규) + validator (description_only_fallback → representation_missing critical 전환 + #06 corpus==7 guard) + drift canonical (② anyOf 2 branch + 재유입 0 + property 보존 3 신규)
- 영향 3 패키지 = schema-validator 18/18 + br-cross-consistency 32/32 + drift canonical 8/8 pass (functional REJECT = vacuous 아님 실증)

### 회귀

- release-readiness **11/11 release-ready** / workspace test 전수 pass / chain harness validated 본질 보존 / breaking ✅의도

### 묶음 Q 잔여 carry (breaking / cooling-off)

- ⑦ rules.json→business-rules.json rename (265 file) / Q-①-followup (rules_auto_extracted_reference→auto_extracted_br_refs semantic-rename) — 각 별도 plan

---

## [5.0.0] — 2026-05-17 MAJOR — 묶음 Q ① rules.json alias 4중첩 폐기 → canonical 단일 (breaking)

> **v5.0.0 MAJOR — breaking change (의도 / semver 정합)**. 사용자 "1"(묶음 Q 잔여) → ① risk 오름차순 첫. 4원칙 (plan + 3-에이전트 research + STOP-1 실측 + 사용자 결단 4건). DEC-2026-05-17-q1-alias-4중첩-폐기 / ADR-CHAIN-011 §5 patch v13 + §9 LL-i-52·53.

### 결단 (사용자 4건 + 사실 확정 1)

- **#1 cooling-off = 지금 시행 (사용자 명시 생략)** / **#2 (A) hard 폐기** (외부 consumer 부재 / dogfooding) / **#3 summary aliases ① 동반** / **#4 rules_auto_extracted_reference = ① scope 외** (별도 carry Q-①-followup)
- **version = v5.0.0 MAJOR 사실 확정** (official-docs VERIFIED: 필드 제거로 valid→invalid = semver MAJOR 필수 / anyOf branch 제거 = breaking)
- scope-completion 투명 명시 — `br_summary`(poc-11) = 사용자 열거 외였으나 동일 alias class → 의도 정합 위해 포함 (silent 확장 ❌ / DEC §2)

### breaking 변경

- **`schemas/rules.schema.json`** — top-level `anyOf`(business_rules|rules|rules_manual_authored 3 분기) 폐기 → `required:["business_rules"]` 단일 / `rules`·`rules_manual_authored`·`rule_summary`·`rules_summary`·`br_summary` properties **제거** (additionalProperties:false → 폐기 alias 보유 문서 hard reject) / `summary`·`rules_auto_extracted_reference` 보존
- **PoC migration 4종 5 key rename** (Edit per-file) — poc-01 `rules`→`business_rules` / poc-02 `rule_summary`→`summary` / poc-04 `rules_manual_authored`→`business_rules`+`rules_summary`→`summary` / poc-11 `br_summary`→`summary`
- **`tools/br-cross-consistency-validator`** extractRules() canonical 단일 (`rules` fallback 제거 / poc-04 잠재 결함 자동 수정 = 가시화)

### test (5 fix + 6 신설)

- `schema-validator/test/chain-schemas.test.js` — v2.3.7 2건 business_rules envelope 전환 / v2.4.0 alias-accept 2건 → alias-**REJECT** 2건 + FE-canonical VALID 신규 1
- `br-cross-consistency-validator/test/validator.test.js` — `rules` alias test → canonical-only 2 assert
- `drift-validator/test/canonical-single-alias.test.js` 신설 5 (폐기 alias 재유입 guard) + drift-validator v0.4.2→v0.4.3

### 회귀 검증

- workspace test 381 → **387/387 pass** (5 fix + 6 신규 / 0 fail / 0 회귀)
- release-readiness **11/11 release-ready** (analysis_validator_violation = 11 PoC 전수 schema valid post-migration)
- **STOP-1 해소 실측** — poc-04 3 BR canonical br-cross-consistency = findings 3 전부 `low` / critical·high 0 / gate pass → 가시화 = 회귀 아닌 **개선 실측 확정** (Senior blocking 해소 / OpenAPI 3.1 latent-bug-fix precedent 정합)
- breaking ✅ (의도 / 폐기 alias 문서 hard reject) / chain harness validated 본질 보존

### 묶음 Q 잔여 carry (breaking / cooling-off)

- ② BR 표현 4→2 (poc-06 7 BR desc-only 합성 의무 + poc-03 TCA 제거) / ⑦ rules.json→business-rules.json rename (265 file) / Q-①-followup (rules_auto_extracted_reference → auto_extracted_br_refs) — 각각 별도 plan + Senior critique

---

## [4.1.1] — 2026-05-17 PATCH — 묶음 Q ④ severity cross-stage 정합 매핑 SSOT 신설 (additive)

> **v4.1.1 PATCH — additive doc / breaking change ❌ / schema 기능 변경 ❌**. 사용자 "1"(묶음 Q) → risk 비균등 실측 → "④만 먼저 (additive)" 결단. ①②⑦ = breaking → 별도 session+ cooling-off carry. DEC-2026-05-17-severity-cross-stage-mapping.

### 결단 (사용자 3건)

- **#1 high → must** (ADR-010 = high 신규 차단 / critical+high 모두 must = 차단 정책 일관)
- **#2 info → nice** (MoSCoW 3종 안 흡수 / 5종 모두 MoSCoW 값 = 단순·완전)
- **#3 SSOT = 신규 methodology-spec doc** (⑥ intent-classification SSOT 패턴 정합)

### 신설/수정 자산

- **`methodology-spec/severity-cross-stage-mapping.md`** 신설 — 단일 SSOT (rules.json 5종 ↔ ADR-010 ratchet 4종 ↔ MoSCoW 3종 정합 매핑표 + stage 별 소비 규약 + cross-ref)
- **`schemas/rules.schema.json`** businessRule.severity `$comment` cross-ref (ajv inert / 검증 동작 무변경) + **`schemas/acceptance-criteria.schema.json`** severity `$comment`
- **`methodology-spec/glossary-ko.md`** severity cross-stage mapping pointer 1행
- **`decisions/DEC-2026-05-17-severity-cross-stage-mapping.md`** 신설 + INDEX 등재
- **`CLAUDE.md`** plugin.json v4.1.0 → v4.1.1 + 직전 release 요약 갱신 / **`STATUS.md`** session 25차 ④ 추가

### 회귀 검증

- workspace test **381/381 pass** (변경 ❌ / $comment ajv inert) + release-readiness **11/11 release-ready** + 0 회귀
- breaking change ❌ / schema enum·required 무변경 / 데이터 변경 ❌ / chain harness validated 본질 보존

### 묶음 Q 잔여 carry (breaking / cooling-off)

- ① alias 4중첩 폐기 (실측 마이그레이션 2 PoC) / ② BR 표현 4→2 (poc-06 7 BR 합성 의무) / ⑦ rules.json→business-rules.json rename (265 file blast radius) — 각각 별도 plan + Senior critique + 사용자 결단 의무

---

## [4.1.0] — 2026-05-17 MINOR — Phase 2 ⑤ cross_consistency_check 신설 + is_intent⇔classification 동치 enforcement

> **v4.1.0 MINOR — additive API surface 확장 / breaking change ❌**. 묶음 P 종결 (Layer 2 corroboration 7 PoC 도달) 로 ⑤ carry trigger 충족 → 본격 진입. 4원칙 (plan + 3-에이전트 research + 사용자 결단 4건 + 시행). DEC-2026-05-17-phase-2-5-cross-consistency-check / ADR-CHAIN-011 §5 patch v12 + §9 LL-i-51.

### 결단 결과 (사용자 결단 4건 / research 후 / 추천안 묶음)

- **#1 설계 = 정제된 옵션 C** (heavy 실행 데이터 layer-2-results/ 분리=SARIF·Semgrep·OPA·Spectral 산업 표준 + BR 안 slim provenance-tagged marker=Semgrep `metadata:` 패턴)
- **#2 분류 보존 = schema if/then 강제** (실측 both=0 → 전 PoC vacuous = 회귀 풀이 0 수학 보장 / official-docs VERIFIED)
- **#3 version = v4.1.0 MINOR** (additive API surface 확장)
- **#4 scope = ⑤ 단독** (Senior Q5 / 묶음 Q 비동반)

### 신설/수정 자산 (1 schema 2변경 + 2 test + 1 ADR + 1 DEC + 1 deliverable)

- **`schemas/rules.schema.json`** — businessRule.properties `cross_consistency_check` slim 객체 신설 (additionalProperties:false / provenance discriminator + 분류보존 필드 + verdict enum 5종(classification_drift 신설) + external_result_ref) + businessRule.allOf `is_intent`⇔`intent_vs_bug_classification` 양방향 동치 if/then 2블록 (둘 다 required = 단방향/미보유 vacuous)
- **`tools/schema-validator/test/rules-cross-consistency.test.js`** 신설 (11 functional / ajv 실 검증 / test 4·5 = 모순 BR 실제 INVALID = vacuous-everywhere 아님 입증)
- **`tools/drift-validator/test/cross-consistency-check.test.js`** 신설 (6 구조 / v4.0.1 cross-schema-enum 패턴 미러) + drift-validator v0.4.1 → v0.4.2
- **`docs/adr/ADR-CHAIN-011-...`** §5.9 patch v12 + §9 LL-i-51
- **`decisions/DEC-2026-05-17-phase-2-5-cross-consistency-check.md`** 신설 + INDEX 등재
- **`methodology-spec/deliverables/5-business-rules.md`** — §4.2 v4.1.0 ⑤ cross_consistency_check 섹션 추가
- **`CLAUDE.md`** (repo root) — plugin.json v4.0.1 → v4.1.0 + 직전 release 요약 첫 줄 갱신 / **`STATUS.md`** session 25차 갱신

### 회귀 검증 (chain harness validated 본질 보존)

- workspace test 364 → **381/381 pass** (신규 17 / 0 fail / 0 회귀)
- release-readiness **11/11 release-ready** (analysis_validator_violation = 11 PoC 전수 violations 0 / 회귀 풀이 0 실측)
- breaking change ❌ / round-trip 영향 ❌ / chain harness 5 요소 = schema additive 영역 한정 / no-simulation trio + D21' + content-aware 비손상

### industry-first novelty

- intent-vs-bug 분류를 자동 합성 과정에서 schema/validator 로 machine-readable 강제 보존한 precedent 부재 (Salesforce 인간 review / SARIF suppression.justification free-form / OpenRewrite 범위 밖) → 본 ⑤ = 조사 범위 내 industry-first claim 보강

---

## [4.0.1] — 2026-05-17 PATCH — rules schema enforcement 강화 (③+⑥ 진입 / ⑤ carry / H-1+H-2 housekeeping)

> **v4.0.1 PATCH — additive only / breaking change ❌**. paradigm 안정점 직후 enforcement criterion 강화 묶음. DEC-2026-05-17-rules-schema-enforcement-strengthen 본격 시행. ADR-CHAIN-011 §5 patch v11 추가. Senior REVISE 흡수 + Industry case 4/4 정합 + official-docs CONTRADICTS 2건 housekeeping 동시 흡수.

### 결단 결과 (사용자 결단 4건 / research 후)

- **#1 ⑤ cross_consistency_check inline = carry** — Senior REVISE / PoC 적용률 3/14 (21%) / ≥ 7 PoC 도달 후 재평가
- **#2 ⑥ SSOT = 공유 $ref 신설** — schemas/intent-classification.schema.json 신설 + rules.schema.json + characterization-spec.schema.json 양쪽 $ref + drift-validator cross-schema enum 정합 check
- **#3 ③ source_grounded_evidence + PoC 처리 = auto_extracted=true 한정 + PoC optional** — Industry case 4/4 정합 (Semgrep + CodeQL + SonarQube + Daikon)
- **#4 H + ADR + 버전 = H 함께 + ADR-CHAIN-011 patch + v4.0.1 PATCH**

### 신설 자산 (1 schema + 1 test)

- **`schemas/intent-classification.schema.json`** (신설 / 단일 SSOT enum 4종 `intent` / `bug` / `ambiguous` / `self_recognized` + 인용 사실 정밀 명시 — Feathers 합성 + Maldonado SATD 개념 차용 / 분류명 본 방법론 고유 합성)
- **`tools/drift-validator/test/cross-schema-enum.test.js`** (신설 / 5 test — SSOT 파일 + 양쪽 $ref + inline enum 재선언 ❌ + source-grounded enforcement if/then 검증)

### 수정 자산 (3 schema + 2 본체 + 1 ADR + 1 deliverable)

- **`schemas/rules.schema.json`** — businessRule.allOf 안 if/then 신규 블록 (auto_extracted=true → source_grounded_evidence 또는 source_evidence required) + businessRule.properties 안 intent_vs_bug_classification 신설 ($ref SSOT)
- **`schemas/characterization-spec.schema.json`** — scenario.intent_classification.items.type = `$ref` SSOT 적용 (inline enum 폐기 / 직전 4 enum 단일 정의) + scenario.tags description "Gherkin tag 표준" → "Cucumber Gherkin 도구 관례" 표기 수정 (H-1)
- **`tools/drift-validator/package.json`** — v0.4.0 → v0.4.1 + npm test command 안 cross-schema-enum.test.js 추가
- **`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md`** — §5.8 patch v11 신설 (본 PATCH 본격 명세)
- **`methodology-spec/deliverables/5-business-rules.md`** — §4.1 v4.0.1 schema enforcement 강화 + v4.0.1 예시 추가
- **`decisions/DEC-2026-05-17-rules-schema-enforcement-strengthen.md`** (신설) + **`decisions/INDEX.md`** 등재
- **`.claude-plugin/plugin.json`** — version 4.0.0 → 4.0.1
- **`CLAUDE.md`** (repo root) — plugin.json v4.0.0 → v4.0.1 + 직전 release 요약 첫 줄 갱신

### 사실 부정확 수정 housekeeping (research 흡수)

- **H-1** — characterization-spec.schema.json scenario.tags description 안 "Gherkin tag 표준" = 오표기 (Cucumber 공식 spec 안 tag 의미 표준화 ❌) → "Cucumber Gherkin 도구 관례" 명시
- **H-2** — characterization-spec.schema.json scenario.intent_classification.items.type 안 "SATD/KL-SATD per Maldonado & Shihab 2015" = 인용 오류 (논문 안 SATD 5 분류 = design/defect/documentation/test/requirement / `self_recognized` 분류명 ❌) → intent-classification.schema.json $comment 안 본격 명시 ("SATD 개념 차용 / 분류명 자체는 본 방법론 고유 합성")

### 회귀 검증 (chain harness validated 본질 보존)

- workspace test 회귀 — 기존 52 test (drift-validator) + 신규 5 = 57/57 pass
- schema-validator 회귀 — PoC #05 + PoC #01 valid 유지 (auto_extracted=true BR 부재 = vacuous 발동 / 14 PoC 회귀 풀이 0)
- chain harness 5 요소 변경 ❌ (schema additive 영역 한정)
- release-readiness 9/9 strict criterion 보존
- breaking change ❌ / round-trip 영향 ❌

### Phase 2 carry (본 sprint 외부)

- **⑤ cross_consistency_check inline 보존** — PoC 적용률 ≥ 50% 도달 후 재평가 / inline vs 분리 결단 별도 sprint
- **① alias 4중첩 폐기** — v4.1.0 MINOR 후보 / breaking change + 14 PoC 마이그레이션 script
- **② BR 표현 4종 → 2종 단일화** — v4.1.0 MINOR 후보 / breaking change
- **④ severity cross-stage mapping table** — 별도 plan 의무
- **⑦ `rules.json` → `business-rules.json` rename** — v4.1.0 MINOR 후보 / cross-ref 치환 다수

---

## [4.0.0] — 2026-05-17 MAJOR — multi-agent paradigm 본격 채택 (DEC-2026-05-17-v4 / DEC-2026-05-15-g5 retract)

> **v4.0.0 MAJOR — paradigm 본질 변화**. plan-skill-invocation-guarantee.md §B5 옵션 A 본격 채택. stage 별 sub-agent 5종 신설 + 3 base agent 병존 + spike agent 보존. main agent = orchestrator (skill 직접 호출 ❌ 권고 / Task tool 로 stage agent dispatch). frontmatter `skills: [...]` 사전 주입 paradigm (Sub-agents.md spec line 407~429 정합). DEC-2026-05-15-g5 "stage 별 분리 ❌" 정책 **retract**.

### paradigm 결단 (사용자 명시 결단 2026-05-17)

- 사용자 의제 "B5 부터 해보자" → 1차 옵션 C (스파이크 PoC) 진입 → 사용자 redirect "A로 해줘" → 옵션 A 본격 진입
- spike 자산 (`archive/v4-spike/_spike-planning-agent.md` / commit `8605652`) archive 이동 (C-3 carry 본격 시행 / 역사 기록 / paradigm 가능 입증 source)
- cooling-off 무시 (사용자 명시 결단 우선 / "without stopping" 모드)

### 신설 자산 (5 stage agent)

- **`agents/analysis-agent.md`** (chain 0 input + chain 1 sub analysis / 22 analysis skill + 6 input skill + 3 base utility = 31 skill 사전 주입)
- **`agents/planning-agent.md`** (chain 1 / 3 planning skill + 4 base utility = 7 skill)
- **`agents/spec-agent.md`** (chain 2 / 3 spec skill + 4 base utility = 7 skill)
- **`agents/test-agent.md`** (chain 3 RED / 4 test skill + 4 base utility = 8 skill)
- **`agents/implement-agent.md`** (chain 4 GREEN / 4 implement skill + 4 base utility = 8 skill)

### 수정 자산 (paradigm 정책 재작성)

- **`agents/README.md`** — paradigm 정책 본격 재작성 ("Stage 별 분리 ❌" → "Stage 별 분리 ✅ + 3 base agent 병존")
- **`methodology-spec/lifecycle-contract.md`** §자산 매핑 매트릭스 §Agent column 5 row 본격 재작성 (실 agent path 명시)
- **`methodology-spec/skills-axis.md`** — §9 v4.0 multi-agent paradigm + skill ↔ agent 매핑 SSOT 신설
- **`tools/chain-driver/src/hooks-bridge.js`** — TRIGGER_PATTERNS 의 entry 마다 agentId 추가 + `suggestAgentForPrompt` 함수 신설 (옛 `suggestSkillForPrompt` 보존 / hybrid 격상) + analysis stage 진입 패턴 추가 (B1 보강 통합)
- **`tools/chain-driver/src/invoke-skill.js`** — `formatHookBlockContext` 의 agentId optional 인자 추가 / v4.0 권고 동봉 ("dispatch agent via Task tool")
- **`hooks/hooks.json`** — `$comment` 안 v4.0 정합 명시 (hook event 자체는 변경 ❌)
- **`decisions/DEC-2026-05-17-v4-multi-agent-paradigm-채택.md`** (신설) + **`decisions/INDEX.md`** 등재
- **`.claude-plugin/plugin.json`** — version 3.6.9 → 4.0.0
- **`CLAUDE.md`** (repo root) — plugin.json v3.6.9 → v4.0.0 + paradigm 설명 갱신

### 외부 사실 검증 (claude-code-guide 위임)

- ❌ frontmatter `tools` 에 `Skill` 명시 불가 (Sub-agents.md spec line 267)
- ✅ sub-agent Skill tool 자동 활성 (parent scope 상속 / line 272)
- ✅ frontmatter `skills: [...]` 사전 주입 (line 407~429)

### 검증

- chain-driver test 114/114 통과 (회귀 0)
- release-readiness 11/11 통과 의무 (check10 CLAUDE.md sync + check11 workspace test)

### 비-범위 (v4.1+ carry)

- 47 SKILL.md persona 임베드 분리 평가
- PoC #05 + 추가 PoC chain harness agent dispatch paradigm 으로 재실행 + cross-validation
- ~~spike agent (`_spike-planning-agent.md`) archive 결단 (보존 유지 / archive 이동)~~ ✅ 본격 시행 (C-3 carry / 사용자 명시 결단 "archive 이동" 2026-05-17 / `archive/v4-spike/_spike-planning-agent.md`)
- ~~design stage agent 신설 (v2.x carry K-? 합산)~~ ✅ 옵션 C 본격 시행 (C-4 carry / 사용자 명시 결단 "C" 2026-05-17 / `agents/design-agent.md` PLACEHOLDER 신설 / `skills: []` / paradigm 본질 미충족 인지 / v4.1+ design-\* skill 신설 carry)
- design stage agent 신설 (v2.x carry K-? 합산)

### Lessons Learned

- **LL-v4-01**: reasonable call (옵션 C 보수적) 우선 + 사용자 명시 redirect (옵션 A 본격) 패턴. without stopping 모드 + 큰 paradigm 결단 = 사용자 명시 confirmation 의무 입증.
- **LL-v4-02**: spike 자산 보존 = paradigm 진화 lineage 유지 / cleanup 강박 회피 (memory `feedback_carry_cleanup_paradigm.md` 정합).
- **LL-v4-03**: DEC-2026-05-15-g5 retract = lifecycle-contract.md §Agent column 본격 재작성 비용 큼 (plan 본문 caution 3 정합). v4.0 commit 안 본격 흡수.

### 정합 관계

- DEC-2026-05-17-v4-multi-agent-paradigm-채택 (본 release 의 모 결단)
- DEC-2026-05-17-spike-planning-agent-실험 (paradigm 가능 입증 / commit `8605652`)
- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (retract 대상)
- `plan-skill-invocation-guarantee.md` (모 plan / B5 옵션 A)

---

## [3.6.9] — 2026-05-16 PATCH — A3 시행 / README.md + guides/ 외부 인지 자산 본격 sync (v2.5.1 → v3.6.9)

> **A3 시행** (옵션 3 = A2 + A3 둘 다 진행 묶음 / A3 = 2번째 / 본 session 마지막 release). README.md + guides/ 5 file = v2.5.1 시점 머묾 (1년 outdated) → v3.6.9 paradigm 진화 안정점 + enforcement cadence 정착 사실 본격 반영.

### 시행 결단

- 핵심 헤더 갱신 우선 (가장 가시화 영역) + 본격 본문 재작성 = carry (별도 session)
- 갱신 영역: 라인 1 (version 헤더) / 라인 5 (현재 사실) / 라인 47 (§8.1 strict 자격) / 라인 50~57 (자격 목록 7 → 11) / 라인 73 (사용법 v) / install URL / dist artifact path / "갱신 이력" 라인

### 자산 갱신 (6 file)

- **`README.md`** — version 헤더 v2.5.1 → v3.6.9 (→ ) + 현재 사실 본격 갱신 (paradigm 진화 안정점 + enforcement criterion 11종 + skill 47/도구 16/스키마 39/PoC 14 + 분석 입력 5종 orchestrate + FE skill 4종 + scope/stage 자동 폴더 + lifecycle 매트릭스) + §8.1 strict 자격 7/7 → 11/11 + 자격 목록 7개 → 11개 (analysis_validator_violation + layer_2_consistency + claude_md_version_sync + workspace_test_pass 추가) + install URL v2.4.0 → v3.6.9 + dist artifact path v2.5.1 → v3.6.9 + CHANGELOG cross-link (v2.4+ → v2.6+ / v2.3.x 이전 → v2.5.x 이전)
- **`guides/README.md`** — 헤더 v2.5.1 → v3.6.9 + 갱신 이력 라인 v3.6.9 entry 추가
- **`guides/chain-harness-guide.md`** — 갱신 이력 라인 v3.6.9 entry 추가
- **`guides/common-errors.md`** — 헤더 v2.5.1 → v3.6.9 + 갱신 이력 라인 v3.6.9 entry 추가
- **`guides/getting-started.md`** — 헤더 v2.5.1 → v3.6.9 (chain harness validated 정식 release → paradigm 진화 안정점 + enforcement cadence 정착) + 갱신 이력 라인 v3.6.9 entry 추가
- **`.claude-plugin/plugin.json`** — 3.6.8 → 3.6.9
- **`CLAUDE.md`** (repo root) — 라인 99 plugin.json v3.6.8 → v3.6.9 (R2 cadence 정합)

### 비-범위 (별도 session carry)

- guides/ 본문 안 install URL / dist artifact path / SessionStart hook message / 시나리오 표기 등 = 본격 재작성 carry (본 conversation 안 핵심 표기만 갱신)
- guides/first-prompt-cookbook.md = v 표기 안 검사 ❌ (사용자 prompt 예시 영역 / paradigm 진화 영향 적음)
- 새 guides 자산 신설 (예: enforcement-criteria-guide.md / paradigm-stable-point-cadence.md) = 별도 session

### Lessons Learned

- **LL-session-20-A3-1**: 외부 인지 자산 (README / guides) = paradigm 진화 cadence 안 drift 누적 잠재 영역. release-readiness 11th criterion (`workspace_test_pass`) + 10th criterion (`claude_md_version_sync`) cadence 안 외부 인지 자산 sync criterion 신설 후보 (향후 12th criterion / `external_doc_version_sync` 신설 자격).

### 정합 관계

- session 20차 v3.6.8 R3 cadence (INDEX archive) + v3.6.9 A3 (외부 인지 sync) = 동일 session "비대화 + drift" 묶음 처분
- v3.6.4 R2 (CLAUDE.md drift enforcement) = 본 A3 = drift enforcement paradigm 정합 (단 R2 = 내부 자산 / A3 = 외부 인지 자산 axis 다름)
- session 20차 = R1+R2+R3+R4+A1+A2+A3 = **7 잔여 결단 + 다음 의제 모두 시행 완료** / v3.6.3+v3.6.4+v3.6.5+v3.6.6+v3.6.7+v3.6.8+v3.6.9 = **7 release**

---

## [3.6.8] — 2026-05-16 PATCH — A2 시행 / INDEX.md 본격 archive (session 14차 이전 의사결정 분리)

> **A2 시행** (다음 의제 1번째 / 2개 묶음 진행 결단 옵션 3). INDEX.md 149 → 31 라인 (79% 절감) + INDEX-HISTORY.md 137 라인 신설. R3 STATUS archive cadence 정합 (paradigm 진화 안정점 = v2.5.0 MINOR FINAL = session 15차 / 2026-05-14 분기 cutoff).

### 시행 결단

- cutoff: session 14차 이하 의사결정 (111 DEC) → archive / session 15차 이후 (4 DEC = R4 + G3 + plugin-charter + v2.5.0 final) → INDEX.md 보존
- CHANGELOG.md 추가 archive 보류 — 이미 v2.4 이전 = `CHANGELOG-HISTORY.md` 안 archive 됨 (34 entries). v2.6.0~v3.6.7 (23 entries / 1601 라인) = 사용자 가시화 자산 + 외부 인지 보존 우선 / 추가 archive ≠ A2 의제

### 자산 갱신

- **`decisions/INDEX-HISTORY.md`** — **신설** (137 라인 / intro + cross-link + session 14차 이전 의사결정 111 DEC table 보존)
- **`decisions/INDEX.md`** — 149 → 31 라인 (보존 = header + 진행중 없음 + 승인 결정 session 15차 이후 4 DEC + Archive cross-link)
- **`.claude-plugin/plugin.json`** — 3.6.7 → 3.6.8
- **`CLAUDE.md`** (repo root) — 라인 99 plugin.json v3.6.7 → v3.6.8 (R2 cadence 정합)

### 절감 사실

| 자산                 | before | after | 절감       |
| -------------------- | ------ | ----- | ---------- |
| INDEX.md (라인)      | 149    | 31    | -118 (79%) |
| INDEX.md (토큰 추정) | ~70K   | ~15K  | -55K (79%) |

### 정합 관계

- R3 v3.6.5 (STATUS.md archive) = 본 A2 = 동일 archive cadence (paradigm 안정점 분기 cutoff)
- CHANGELOG-HISTORY.md (이미 존재 / v2.4 이전 archive) = 본 A2 = 동일 history file 패턴

---

## [3.6.7] — 2026-05-16 PATCH — A1 시행 / release-readiness 11th criterion 신설 (workspace test 회귀 자동 차단) + R2 test 회귀 fix

> **A1 시행** (다음 의제 R1 채택 = "release-readiness 11th criterion 신설"). session 20차 v3.6.3 P0 회귀 (chain-driver Windows path 2 fail) = 본 criterion 부재 = drift 누적 사례 정합. 또한 **R2 시점 test expectation 갱신 누락 회귀 동시 fix** (9 → 11).

### A1 신설 (`check11_workspaceTestPass`)

- 검증 대상: `npm test --workspaces --if-present` 실시간 실행 → fail count 0 + total tests > 0 의무
- spawn cadence:
  - Windows Node.js v22+ EINVAL fix — `shell: true` 의무 (CVE-2024-27980 정합)
  - NODE_TEST_CONTEXT env 제거 — test runner 안 release-readiness 호출 시 child env inherit 회피 (잔존 시 workspace 안 test 자동 skip → 0/0 pass false positive)
  - timeout 600s (workspace test ~30~60초 cadence 정합)
- `--skip-workspace-test` flag 지원:
  - test cadence 시 본 flag 사용 (60초 비용 회피)
  - release 본격 시행 시 본 flag ❌ 의무 (drift enforcement 정합)
  - skip 시 pass=false → release-readiness exit 1 → mistakenly skip 사용 시 release 차단

### R2 test 회귀 fix

- session 20차 v3.6.4 R2 시 `release-readiness.test.js` 안 expectation 갱신 누락 = 본 test 안 회귀 발생 (10 → 7 pass / 3 fail)
- `npm run test:release` 가 `npm test --workspaces` 와 별도 cadence → workspace test 359/359 안 본 fail 미포함 → 누락 회귀
- 본 A1 시행 시 동시 fix:
  - describe 안 "9/9 격상" → "11/11 격상"
  - `criteria_total === 9` → 11 (4 곳)
  - ids array 안 `claude_md_version_sync` (R2) + `workspace_test_pass` (A1) 추가 (총 11)
  - 기존 test 안 `--skip-workspace-test` flag 추가 (시간 절감)
  - 신규 test 1 case = check11 본격 spawn 검증 (timeout 600_000)

### 자산 갱신 (5 file)

- `scripts/release-readiness.js` — `check11_workspaceTestPass` 신설 + `parseArgs` `--skip-workspace-test` flag + main results array 등록 + header 명세 10 → 11 자격 갱신
- `scripts/test/release-readiness.test.js` — 9 → 11 expectation 갱신 + ids array 신규 2 추가 + SKIP_WS flag 사용 + 신규 A1 본격 spawn case 1
- `.claude-plugin/plugin.json` — 3.6.6 → 3.6.7
- `CLAUDE.md` (repo root) — 라인 99 plugin.json v3.6.6 → v3.6.7 (R2 cadence 정합)
- `decisions/STATUS.md` — session 20차 v3.6.7 entry 추가

### 검증

- workspace test: **359/359 pass** ✅
- release-readiness v3.6.7: **11/11** ✅ (check11 본격 spawn = workspace test 359/359 검증 ✅)
- release-readiness test (`npm run test:release`): **11/11 pass** ✅ (R2 회귀 회복 + A1 신설 검증)

### Lessons Learned

- **LL-session-20-A1-1**: 다른 cadence 안 test (예: `npm run test:release`) = `npm test --workspaces` 안 미포함 = 회귀 잠재 발생. release-readiness 안 본 test cadence 도 추가 검증 의무 영역 (별도 criterion 후보).
- **LL-session-20-A1-2**: Node.js `--test` runner 안 NODE_TEST_CONTEXT env inherit = child process 안 test 자동 skip 정합. inner spawn 시 본 env 명시 제거 의무.
- **LL-session-20-A1-3**: Windows Node.js v22+ 안 `.cmd` 파일 spawn = EINVAL (CVE-2024-27980) = `shell: true` 의무.

### 정합 관계

- session 20차 v3.6.3 P0 회귀 (chain-driver Windows path / workspace test 2 fail) = 본 A1 신설 근거
- v3.6.4 R2 (release-readiness 10th criterion 신설) = 본 A1 = 동일 cadence 정합 (drift enforcement via release-readiness criterion)
- LL-session-20-04 (양심 의존 ❌ paradigm) + LL-session-20-05 (paradigm 안정점 후 enforcement cadence 진입 자격) = 본 A1 정합

---

## [3.6.6] — 2026-05-16 PATCH — R4 시행 / PoC #12 + #13 보류 처분 자산화

> **R4 잔여 결단 시행** (session 20차 carry / 본 session 20차 = R1+R2+R3+R4 4 결단 모두 시행). PoC #12 (raw query) + PoC #13 (QueryDSL) = 둘 다 README 안 정탐 결과 추천 + ADR-CHAIN-008 정합 → status = "보류" 명시 자산화. 사용자 source 도착 시 재진입 자격 보존.

### 시행 결단

- **옵션 (c) PoC #12/#13 보류 + (B) 정책 완화 회귀 처분 자산화** 채택 (옵션 (a) 본격 시행 plan + (b) 사내 적용 가이드 + (d) 별도 session 거절)
- 근거 4종:
  1. 정탐 결과 정합 (둘 다 README 안 "pure realworld OSS 부재" 사실 + (B) 추천 명시)
  2. ADR-CHAIN-008 정합 (MEDIUM × ≥ 5 PoC isomorphic = strong corroboration 자격 도달 / PoC #06~#11 6 PoC 누적)
  3. 비용 vs 가치 (14d cap × source 결정 비용 > corroboration 추가 가치 / 이미 자격 도달)
  4. paradigm 진화 안정점 정합 (v2.5.0 MINOR FINAL 이후 안정점 / 추가 PoC 본격 시행 ≠ 의제)

### 자산 갱신

- **`examples/poc-12-rawsql-userdecided/README.md`** — status = "보류" 명시 + DEC cross-link
- **`examples/poc-13-querydsl-userdecided/README.md`** — status = "보류" 명시 + DEC cross-link
- **`decisions/DEC-2026-05-16-r4-poc-12-13-보류-자산화.md`** — **신설** (SSOT)
- **`decisions/INDEX.md`** — 본 DEC entry 추가 (역시간순 / 가장 위)
- **`.claude-plugin/plugin.json`** — 3.6.5 → 3.6.6
- **`CLAUDE.md`** (repo root) — 라인 99 plugin.json v3.6.5 → v3.6.6 (R2 cadence 정합)

### 재진입 cadence

사용자 source 도착 시 (사내 모듈 또는 외부 source 결정) 진입 가능:

- 본 DEC = 보류 처분 자산 / 재진입 시 **새 DEC 신설 의무** (LL-cleanup-02 정합 / 라벨 부활 ❌)
- chain harness 5 stage 본격 시행 (PoC #08+#09+#10 패턴 재사용 / ~3~4일 실측)

### 정합 관계

- DEC-2026-05-08-poc-{12,13}-prelim-신설 (prelim 자산 / 본 R4 = prelim 처분)
- DEC-2026-05-08-paradigm-cross-policy-완화 + ADR-CHAIN-008 (strong corroboration 자격 paradigm)
- DEC-2026-05-15-carry-cleanup-paradigm-종결 (paradigm 진화 안정점 / 본 R4 = 잔여 PoC 처분)
- v3.6.3 + v3.6.4 + v3.6.5 + v3.6.6 = session 20차 4 release 묶음 (R1+R2+R3+R4 모두 시행)

---

## [3.6.5] — 2026-05-16 PATCH — R3 시행 / STATUS.md 본격 archive (session 14차 이전 분리)

> **R3 잔여 결단 시행** (session 20차 carry). STATUS.md 1871 → 80 라인 (95.7% 절감) + STATUS-HISTORY.md 1807 라인 신설. paradigm 진화 안정점 (v2.5.0 MINOR FINAL = session 15차 / 2026-05-14) 이 자연 분기 = 본 cutoff 결단 근거.

### 시행 결단

- **옵션 (a) session 15차 이전 archive 채택** (옵션 (b) 강력 archive + (c) v3.x 기준 + (d) 별도 session 거절)
- cutoff: session 14차 이하 모두 archive / STATUS.md = session 15차~20차 보존
- STATUS.md 안 cross-link section 신설 (Archive 진입점 명시)

### 자산 갱신

- **`decisions/STATUS-HISTORY.md`** — **신설** (intro + session 14차 header 23 라인 + session 14차 이전 body 1769 라인 = 1807 라인)
- **`decisions/STATUS.md`** — 1871 → 80 라인 (보존 영역 = header 라인 1~22 + Archive cross-link + session 15차 body)
- **`.claude-plugin/plugin.json`** — 3.6.4 → 3.6.5
- **`CLAUDE.md`** (repo root) — 라인 99 plugin.json v3.6.4 → v3.6.5 (R2 cadence 정합)

### 절감 사실

| 자산                  | before              | after                           | 절감           |
| --------------------- | ------------------- | ------------------------------- | -------------- |
| STATUS.md (라인)      | 1,871               | 80                              | -1,791 (95.7%) |
| STATUS.md (토큰 추정) | ~96K                | ~4K                             | -92K (95.8%)   |
| context load 비용     | 매 conversation 96K | 4K (+ STATUS-HISTORY on-demand) | 매우 큰 절감   |

### Lessons Learned

- **LL-session-20-06**: STATUS.md 비대화 = 매 conversation context load 안 누적 비용 (다음 session 의 plan/research 출발점 자산). paradigm 진화 안정점 도달 cadence 마다 archive 의무 자격.
- **LL-session-20-07**: archive cutoff = "paradigm 진화 안정점" 자연 분기 활용 = R3 정합 paradigm. version 기반 (v2.x ↔ v3.x) 또는 session 기반 (5 session) cutoff 보다 의미 영역 정합 우선.

### 비-범위 (별도 결단)

- ❌ R4 PoC #12 / #13 user-decided 본격 활용 = 별도 session

### 정합 관계

- v3.6.4 PATCH session 20차 R2 (CLAUDE.md drift enforcement / 본 R3 = STATUS.md 비대화 처분 / 동일 session 의 paradigm 진화 안정점 후 cadence enforcement 묶음)
- DEC-2026-05-14-v2.5.0-minor-final (paradigm 진화 안정점 = 본 archive cutoff 근거)

---

## [3.6.4] — 2026-05-16 PATCH — R2 시행 / release-readiness 10th criterion 신설 (CLAUDE.md drift enforcement)

> **R2 잔여 결단 시행** (session 20차 carry / LL-session-20-02 정합). CLAUDE.md ↔ plugin.json.version drift 회피 cadence 자동화 (양심 의존 ❌). 본 cadence 안 release 마다 CLAUDE.md 안 plugin 진화 표기 갱신 의무 강제.

### 시행 결단

- **옵션 (a) release-readiness 10th criterion 신설** 채택 (옵션 (b) PostCommit hook 자동 commit risk + (c) 매뉴얼 양심 의존 거절)
- 검증 대상: CLAUDE.md 안 `plugin.json vX.Y.Z` 표기 (핵심 컨텍스트 자산 안 plugin 진화 정합 표기 / 라인 99 pattern)
- drift 발생 시 release 자동 차단 (exit 1)

### 자산 갱신

- **`scripts/release-readiness.js`** — `check10_claudeMdVersionSync` function 신설 + main results array 안 등록 + header 명세 9 → 10 자격 갱신
- **`CLAUDE.md`** (repo root) — 라인 99 `plugin.json v3.6.2` → `plugin.json v3.6.4` sync (R2 검증 정합)
- **`.claude-plugin/plugin.json`** — 3.6.3 → 3.6.4

### 즉시 검증 (R2 이론적 정합 입증)

```
check10 신설 직후 (plugin.json=3.6.3 시점):
  ❌  claude_md_version_sync — drift: "plugin.json v3.6.2" ↔ plugin.json=3.6.3
  → 9/10 (drift 즉시 검출 = criterion 정합 입증)

plugin.json bump + CLAUDE.md sync 후:
  ✅  claude_md_version_sync — CLAUDE.md "plugin.json v3.6.4" 표기 1건 모두 일치 / R2 cadence 정합
  → 10/10 = release-ready
```

### 비-범위 (별도 결단)

- ❌ CLAUDE.md 안 다른 version 표기 (라인 13 / 34 / 117-119 의 paradigm 진화 안정점 + CHANGELOG 직전 release 요약) = 본 criterion 미검증 (의미 영역 다름 / 별도 cadence 결단)
- ❌ R3 STATUS.md 본격 archive = 별도 session
- ❌ R4 PoC #12 / #13 본격 활용 = 별도 session
- ❌ R1 retroactive 12 tag 부여 = 옵션 1 최소 결단 보존

### Lessons Learned

- **LL-session-20-04**: drift enforcement criterion = "양심 의존 ❌" paradigm 의 본격 적용 영역. release-readiness 가 "release 직전 검증" 위치 = 모든 drift 의 마지막 차단 자격 / hook 보다 단순 + 안정적 (자동 commit risk ❌ / 사용자 양심 의존 ❌)
- **LL-session-20-05**: R2 시행 = "drift 회피 cadence" 정식화 사례. paradigm 진화 안정점 도달 후 = enforcement criterion 신설 cadence 본격 진입 자격 (drift 누적 회피 자산 cumulative).

### 정합 관계

- v3.6.3 PATCH session 20차 (LL-session-20-02 자산 / 본 R2 시행 근거)
- DEC-2026-05-15-carry-cleanup-paradigm-종결 (paradigm 진화 안정점 / 본 R2 = 안정점 후 enforcement cadence 진입)
- ADR-CHAIN-005 §3 mechanical trio (release-readiness = 4번째 mechanical gate 자격 / hook trio + state.blocked + release-readiness 4중 enforcement)

---

## [3.6.3] — 2026-05-16 PATCH — session 20차 점검 / P0 회귀 2건 복구 + drift 갱신 묶음

> **사용자 명시 "점검해 보자"** 진입 → 4 영역 점검 (본체 자가 정합 + CLAUDE.md drift + STATUS/INDEX 비대화 + 잔여 carry/다음 의제) → critical 회귀 2건 발견 + 즉시 복구. paradigm 변경 ❌ / additive change + 회귀 복구만 = PATCH 정합.

### 🔴 회귀 복구 (P0)

**1. `release-readiness analysis_validator_violation` ❌**

- 원인: PoC #01 `/meta` (4 errors) + PoC #05 `/meta` (6 errors) 안 v3.x 진화 중 추가된 필드 10종이 `meta-confidence.schema.json` 안 `additionalProperties: false` 위반
- 추가된 필드 10종:
  - PoC #01 (v1.1.2 시점 자산): `source_branch` / `extraction_env` / `raw_confidence` / `expected_confidence_average`
  - PoC #05 (v2.5.0 phase B/D 자산): `extraction_env` / `sample_mode` / `corroboration_eligible` / `sample_mode_rationale` / `phase_b_migration_note` / `phase_d_meta_recovery_note`
- 복구: `schemas/meta-confidence.schema.json` 안 10 properties 정식 등록 (모두 optional / paradigm 진화 자산 보존)
- 결과: ✅ **9/9 release-ready** 회복

**2. `tools/chain-driver/test/scope-dir.test.js` Windows path 회귀 ❌**

- 원인: assertion 안 Unix path (`'/root/.aimd/user-registration'`) 하드코딩 → Windows `path.join` 결과 (`\root\.aimd\user-registration`) 불일치 → 2 test ERR_ASSERTION
- 복구: `assert.equal(p, join('/root', '.aimd', 'user-registration'))` platform-aware fix (이미 import 된 `node:path` join 활용)
- 결과: ✅ **chain-driver 114/114** 회복 / workspace 전체 **359/359 ✅**

### 🟠 drift 갱신 (P1)

**`CLAUDE.md` 본격 갱신** — v2.6.0 시점 머무름 (6 release drift) → v3.6.2 paradigm 진화 안정점 본격 반영:

- 버전 표기 v2.6.0 → v3.6.2 + 직전 6 release 요약 (v3.6.1 cross-link / v3.6.0 G1 scope-out / v3.5.0 G5 / v3.4.0 G4 / v3.3.0 G2 / v3.2 G3)
- schemas 13종 → **39종** / tools 12종 → **16종** / PoC 4 → **14** / skills **47종** 명시
- 신설 자산 반영: plugin-charter SSOT + lifecycle 자산 매핑 매트릭스 + FE skill 4종 + analysis-input-orchestrate 5종 + scope/stage 폴더
- sub-plan-6 "현재" → 역사 기록 격하 + paradigm 진화 안정점 표기

### 🟡 INDEX.md 갱신 (P2)

- "진행중 결정" 2건 모두 후속 release 안 흡수 완료 사실 명시 → "(없음)" 표기 + 사유 (v1.3.0 / ADR-008+ADR-009 정식 채택)

### 🟢 STATUS.md 헤더 갱신 (P3)

- 기준일 2026-05-15 → **2026-05-16** + session 20차 entry 추가 (점검 + 복구 사실 자산화)
- 본격 archive (session 8차~14차 분리) = **사용자 결단 영역** / 본 release 안 시행 ❌

### 자산 갱신 (5 file)

- `schemas/meta-confidence.schema.json` — v3.x 진화 필드 10종 정식 등록 (additive / breaking ❌)
- `tools/chain-driver/test/scope-dir.test.js` — Windows path platform-aware fix
- `CLAUDE.md` (repo root) — v3.6.2 사실 동기화 + 신설 자산 반영
- `decisions/INDEX.md` — 진행중 결정 2건 흡수 사실 명시
- `decisions/STATUS.md` — session 20차 entry 추가
- `.claude-plugin/plugin.json` 3.6.2 → 3.6.3

### Lessons Learned

- **LL-session-20-01**: paradigm 진화 안정점 도달 후 = "점검 cadence" 진입 자격. **장기 drift 누적 회피 의무** — release 안 가려진 회귀 (PoC #01 + #05 schema invalid 가 9/9 → 8/9 회귀 / Windows path 가 OS-specific bug) 가 본 cadence 안 발견됨.
- **LL-session-20-02**: CLAUDE.md = 다음 conversation 컨텍스트 / 본 자산 drift 시 **다음 session 의 plan + research 부정확** risk. 매 MINOR release 시 CLAUDE.md 갱신 의무 cadence 정착 (향후 release-readiness criterion 신설 후보 / 본 release 안 시행 ❌ / 사용자 결단 영역).
- **LL-session-20-03**: schema additionalProperties=false + paradigm 진화 자산 (sample_mode 등) 추가 시 **schema 동시 갱신 의무**. v2.5.0 phase B+D 시 누락된 갱신이 v3.x 본격 진화 후에야 release-readiness 회귀로 드러남.

### 정합 관계

- DEC-2026-05-15-carry-cleanup-paradigm-종결 (v3.6.2 paradigm 진화 안정점 / 본 PATCH = 안정점 후 점검 cadence 첫 시행)
- v2.5.0 phase B + phase D session 11/15차 (PoC #05 meta 회복 자산 / 본 PATCH = schema 안 정식 등록)
- v3.2 G3 종결 (chain-driver scope-dir 신설 / 본 PATCH = Windows path platform-aware 보완)

---

## [3.6.2] — 2026-05-15 PATCH — 잔여 carry 묶음 정리 / paradigm 진화 완료점

> **사용자 명시 결단 "carry 다 제거"** — charter §3 활성 Gap 모두 청산 + G1 영구 scope-out 후 잔여 carry 7종 모두 정리. plugin must-have 자산 + paradigm 진화 **안정점 도달 명시**.

### 정리 대상 (7 carry)

| #        | carry                                          | 결단                                        |
| -------- | ---------------------------------------------- | ------------------------------------------- |
| C1       | G6 `/analyze-fullstack` Scenario B 통합 명령어 | **영구 scope-out** (G1 sibling / 재제안 ❌) |
| C2       | G2 orchestrate 분리 신호 (1-A → 1-B trigger)   | 라벨 제거 (history = DEC + LL-G2-03 보존)   |
| C3       | Vue 2 / React 18 legacy 분기                   | 라벨 제거 (사례 발생 시 새 결단)            |
| C4       | form action 분산 anti-pattern rule             | 라벨 제거 (시행 시 결단)                    |
| C5/C6/C7 | PoC (Scenario A/B/C 본격 검증)                 | 라벨 제거 (PoC session 진입 시 새 결단)     |

### paradigm 근거

1. paradigm 단순화 — charter §3 모두 청산 + carry 라벨 정리 = plugin must-have 안정점 도달
2. history 보존 — 정리 carry 의 paradigm history 는 각 DEC + CHANGELOG + LL 안 본격 보존 (carry 라벨 = 중복 추적)
3. G1 sibling paradigm — 가치 < 비용 / 사용 사례 부재
4. 사용자 결단 권한 — 명시 결단 시 paradigm 진화 안정점 도달

### paradigm 진화 완료점 (2026-05-15)

| 영역                | 상태                                |
| ------------------- | ----------------------------------- |
| charter §1 (R1~R17) | 15/15 자산 대칭 + R16/R17 scope-out |
| charter §3 (Gap)    | 모두 청산 + G1 scope-out            |
| 잔여 carry          | 모두 정리 (C1~C7 라벨 제거)         |
| 본격 자산           | 5 stage + cross-cut skill 자산 대칭 |
| 의미 ID paradigm    | v2.6.0 + v3.x sub-axis 진화 정합    |

### 자산 갱신

- `decisions/DEC-2026-05-15-carry-cleanup-paradigm-종결.md` — 신설 (SSOT)
- `.claude-plugin/plugin.json` 3.6.1 → 3.6.2
- `decisions/STATUS.md` session 19차 추가 entry

### Lessons Learned

- **LL-cleanup-01**: carry 라벨 = paradigm 진화 추적 자산. 사용 사례 누적 부재 시 = 라벨 제거 정합. history 는 DEC/CHANGELOG/LL 본격 보존 → 라벨 = 중복 추적
- **LL-cleanup-02**: paradigm 안정점 도달 시 carry 묶음 정리 = "단순화 결단". 미래 사용 사례 시 새 carry 신설 가능 (라벨 부활 ❌)

### 정합 관계

- DEC-2026-05-15-carry-cleanup-paradigm-종결 (본 entry SSOT)
- DEC-2026-05-15-g1-itsm-permanent-scope-out (G1 영구 scope-out sibling)
- DEC-2026-05-15-g{2,3,4,5}-\* (Gap 종결 sibling)
- be-fe-separation.md §4.1 D25 carry (G6 history 보존)
- memory `feedback_itsm_g1_permanent_scope_out` (재제안 회피 paradigm)

---

## [3.6.1] — 2026-05-15 PATCH — carry C10+C8+C9 묶음 (cross-link 문서 보강)

> G5 paradigm 강화 — `lifecycle-contract.md` §자산 매핑 매트릭스 의 cross-link 자산 (agents/README.md 신설 + tools/README.md cross-link + spectral-runner README carry 정정). 자산 신설/기능 추가 ❌ / 문서 보강만 = PATCH 정합.

### 갱신 자산 (3 file)

- **C10**: `tools/spectral-runner/README.md` — "호출자: skill `analysis-openapi` 자동 호출" → **"사용자/orchestrate 명시 호출 (auto-invoke ❌ / no-simulation 정합 / G2 LL-G2-06 정정)"**. 자동 호출 통합은 v3.x carry (chain-driver hooks-bridge 정합 결단 후 별도 시행).
- **C8**: `agents/README.md` — **신설**. 본 매트릭스 §Agent column cross-link / 3 base agent persona (`_base-senior-engineer` / `_base-industry-case-researcher` / `_base-official-docs-checker`) 책임 명시 + 호출 시기 + paradigm 정합 (1-depth flat / decision axis 분리).
- **C9**: `tools/README.md` — 본 매트릭스 §Tool/Validator column cross-link 1줄 추가 (cadence table 앞 §자산 매핑 매트릭스 cross-link section).

### paradigm 결단

- version 라벨 = **v3.6.1 PATCH** (semver 정합 / 자산 신설 ❌ / 문서 보강만)
- 별도 session 의무 carry (C1 G6 / C5/C6/C7 PoC / C2 분리 신호 / C3 legacy) = 본 묶음 외

### 정합 관계

- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (본 PATCH = G5 paradigm 강화)
- DEC-2026-05-15-g{2,4}-\* (G2 LL-G2-06 + G4 LL-G4-04/05 정합)
- memory `feedback_chain_driver_deterministic_axis` + `feedback_no_static_tool_simulation` (auto-invoke ❌ 정합)

---

## [3.6.0] — 2026-05-15 MINOR — G1 ITSM 영구 scope-out / charter Gap 모두 청산

> **charter §1 R16/R17 영구 폐기** (사용자 명시 결단 "G1 안해도 됨 잊어줘"). charter §3 활성 Gap **모두 청산** = plugin must-have 자산 대칭 본격 도달. 향후 자동 티켓화 재제안 ❌.

### 결단 근거

1. 가치 < 비용 (사용자 1인 dogfooding 단계 / 자동화 ROI ↓)
2. `mcp__wiki-jira-assistant__*` 13 도구 = 사용자 수동 호출로 충분
3. chain harness gate → 자동 티켓 transition = chain-driver 결정론 axis 오염 risk
4. paradigm 단순화 (charter Gap 모두 청산)

### 자산 갱신

- `methodology-spec/plugin-charter.md` §1 R16/R17 strikethrough + scope-out (번호 보존 / cross-reference drift 회피)
- charter §2 R16/R17 ❌ → scope-out
- charter §2 요약 = 활성 요구 **15/15 자산 대칭** + scope-out 2
- charter §3 G1 strikethrough + 영구 폐기
- `.claude-plugin/plugin.json` 3.5.0 → 3.6.0
- `decisions/DEC-2026-05-15-g1-itsm-permanent-scope-out.md` — 신설

### charter §2 진화 (v3.1.0 → v3.6.0)

| 시점                      | ✅     | ⚠️    | ❌    | scope-out |
| ------------------------- | ------ | ----- | ----- | --------- |
| v3.1.0                    | 11     | 4     | 2     | 0         |
| v3.3.0 (G2)               | 12     | 3     | 2     | 0         |
| v3.4.0 (G4)               | 13     | 2     | 2     | 0         |
| v3.5.0 (G5)               | 14     | 1     | 2     | 0         |
| **v3.6.0 (G1 scope-out)** | **14** | **1** | **0** | **2**     |

### Lessons Learned

- **LL-G1-01**: charter §1 must-have 요구는 사용자 결단으로 영구 scope-out 가능. 번호 보존 = cross-reference drift 회피.
- **LL-G1-02**: 자동화 ROI 평가 시 "1인 dogfooding vs 사내 배포 후" 두 시기 구분. 1인 단계 = scope-out 정합. 배포 후 사용자 다수 시 새 R 요구로 재진입 가능 (R16/R17 부활 ❌).

### 정합 관계

- DEC-2026-05-15-g1-itsm-permanent-scope-out (본 entry SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (원안 R16/R17 영구 폐기)
- DEC-2026-05-15-g{2,3,4,5}-\* (활성 Gap 모두 종결 sibling)
- memory `feedback_itsm_g1_permanent_scope_out` (재제안 회피 의무)
- memory `feedback_chain_driver_deterministic_axis` (결정론 axis 오염 회피)

---

## [3.5.0] — 2026-05-15 MINOR — G5 종결 / lifecycle 자산 매핑 매트릭스 (단일 SSOT)

> **charter §3 G5 종결** — R12 lifecycle stage↔asset 매핑표 신설. 이전엔 `skills-axis.md` + `be-fe-separation.md` + `flows/*` 흩어진 자산을 사용자가 cross-read 의무. 본 매트릭스 = 1장에서 stage 진입 시 어떤 자산 호출할지 즉답. **잔여 charter Gap = G1 (ITSM 후순위) 단독**.

### 신설 자산

- `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 신설:
  - **본 매트릭스** (stage × asset 5 column × 8 row) — input / analysis / planning / spec / test / implement / cross-cut traceability / cross-cut aspects
  - **부 매트릭스** (R8 입력 axis 6 row) — (a) 코드 / (b) Figma / (c) Swagger / (d) plan-doc / (e) prompt / (orchestrator) — 본 매트릭스 input row 의 펼침 매핑
  - **Scenario cross-link** (be-fe-separation.md §6 / axis 분리 명시)
  - **사용 가이드** (stage 진입 시 / R8 입력 시 / agent persona 인용 흐름)

### paradigm 결단 (사용자 결단 2026-05-15)

| 의제         | 결단                                                            | 근거                                                                  |
| ------------ | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| Column 5     | agent / skill / hook / tool/validator (charter §3 G5 원안 정합) | —                                                                     |
| Row 분리도   | **단일 row + 부 매트릭스**                                      | row 비대화 회피 + orchestrate 자연 응집 + BCDE detail 분리 = ROI 최적 |
| version 라벨 | **v3.5.0 MINOR**                                                | G5 종결 = MINOR (G2/G4 일관)                                          |

### 부수 갱신

- `methodology-spec/plugin-charter.md` §1 R12 ⚠️→✅ (자산 차원 격상) + §2 요약 ✅ 14 / ⚠️ 1 / ❌ 2 + §3 G5 종결 (잔여 G1 단독)
- `.claude-plugin/plugin.json` 3.4.0 → 3.5.0
- `decisions/DEC-2026-05-15-g5-lifecycle-asset-matrix-종결.md` — 신설

### Lessons Learned (paradigm 진화)

- **LL-G5-01**: 매핑 매트릭스 row 분리도 = **사용자 진입 가이드 ↑** vs **매트릭스 시야 ↓** 사이 trade-off. row 비대화 회피 + 부 매트릭스 분리 = ROI 최적. G2 LL-G2-03 (책임 합산) + G4 LL-G4-02 (분리 vs 본문 분기) 의 단순 문서 영역 응용.
- **LL-G5-02**: charter §3 종결 자산 = 매트릭스 1장 정도라도 **단일 SSOT 확립 가치** 큼. 흩어진 자산 (skills-axis / be-fe-separation / flows) → 1장 cross-read 회피 → 사용자 진입 즉답.

### 정합 관계

- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (본 entry SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (charter §3 G5 종결 sibling)
- DEC-2026-05-15-g{2,3,4}-\* (paradigm 진화 sibling)
- v2.6.0 paradigm (skills-axis category prefix / 의미 ID)
- be-fe-separation.md (Scenario × IR 4계층 / axis 분리)

---

## [3.4.0] — 2026-05-15 MINOR — G4 종결 / FE skill 보강 (4 skill 신설 + RTL 본문 분기 + 5 test pass)

> **charter §3 G4 종결** — R14 BE/FE 자산 비대칭 해소. **후보 C 채택** (4 skill + 본문 분기 / `test-jest` 중복 회피 / BE 트랙 paradigm 일관). v2.6.0 의미 ID + ADR-CHAIN-001 chain 4 이중 렌더링 정합.

### 신설 자산 (4 skill + 1 schema + 5 test)

**4 skill 신설**:

- `skills/implement-react/SKILL.md` — React 19 paradigm (forwardRef deprecated / ref prop 직접 / class component 분기 보존 / `useActionState`/`useOptimistic`/`useFormStatus`/`use()` 신규 hooks / ESLint `no-forward-ref`) + schema marker `react_version: "19"`
- `skills/implement-vue/SKILL.md` — Vue 3 only (Composition API + `<script setup>` 우선 / Options API legacy 분기 본문 / Vue 2 = carry)
- `skills/test-playwright/SKILL.md` — POM 분리 의무 (locator = page object / assertion = test) + web-first assertion + parallel + shard CLI + `@playwright/test` 1.4x + `npx playwright install`
- `skills/analysis-html-template/SKILL.md` — Scenario C (JSP/Thymeleaf/EJS/ERB/Razor) / 외부 도구 의무 (SonarQube `Web:JspScriptletCheck` + `rspec-1459` + `rspec-1932` / PMD JSP / jsp-lint) / JSP 2.0 / Servlet 2.4 기준점 / **scriptlet 0 absolute**

**1 schema 신설** (strict / additionalProperties:false):

- `schemas/html-template-extract.schema.json` — external_tool_output.executed required (no-simulation 의무) + scriptlet_findings + xss_markers + policy_check.scriptlet_zero_absolute

**5 test case** — schema-validator 회귀 40 → **45/45 pass**.

### 본문 분기 추가

- `skills/test-generate-test-spec/SKILL.md` — `## 기술 스택 분기` 섹션에 추가:
  - **jest + RTL (React 19)** — `userEvent.setup()` v14 의무 + `await user.*` async + `getByRole` 1순위 + `findBy*`/`getBy*`/`queryBy*` 분기
  - **vitest + Vue Test Utils (Vue 3)** — `@vue/test-utils` 2.x / Composition API 정합
  - **Playwright e2e** — 별도 skill `test-playwright` 위임 reference

### paradigm 결단 (Senior critique + research 흡수)

| paradigm                                  | 결단                                   | 근거                                                                  |
| ----------------------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| 후보 (A 5 skill / B 절충 / **C 4 skill**) | **C**                                  | `test-jest` 중복 회피 + BE 트랙 paradigm 일관 + 본문 비대화 risk 회피 |
| Vue 1차 지원                              | **Vue 3 만**                           | Vue 2 legacy = carry                                                  |
| Scenario B `/analyze-fullstack`           | **G6 carry**                           | 명령어 axis ≠ skill axis                                              |
| JSP scriptlet 정책                        | **scriptlet 0 absolute**               | JSP 2.0 / Servlet 2.4 paradigm 정합                                   |
| `analysis-html-template` 매핑             | **신규 phase `template-analyze` 신설** | input phase 부담 ↓ + Scenario C 만 활성                               |
| 정량 검출                                 | **진짜 외부 도구 의무**                | LLM 양심 ❌ / no-simulation 정합 (Senior STRONG-STOP)                 |

### 부수 갱신

- `methodology-spec/plugin-charter.md` §2 R14 ⚠️→✅ + §3 G4 종결 (잔여 G5 > G1)
- `methodology-spec/skills-axis.md` analysis 27 → 28 / implement 2 → 4 / test 3 → 4
- `flows/test.phase-flow.json` (test-playwright skill mapping)
- `flows/implement.phase-flow.json` (implement-react / implement-vue skill mapping)
- `flows/analysis.phase-flow.json` (신규 phase `template-analyze` + analysis-html-template)
- `.claude-plugin/plugin.json` 3.3.0 → 3.4.0
- `decisions/DEC-2026-05-15-g4-fe-skill-track-종결.md` — 신설

### Lessons Learned (paradigm 진화)

- LL-G4-01: charter §3 후속 표 = 후보 안 / 기존 자산 중복 평가 의무
- LL-G4-02: paradigm 분리 vs 본문 분기 = 자산 비대화 + drift 추적 + 명시성 3축 평가
- **LL-G4-03 (Senior)**: framework paradigm 충돌 시 RED test fixture = 판단 기준 + schema marker (`react_version`) 의무
- **LL-G4-04 (research 정정)**: 외부 framework 사실 (React 19 / userEvent v14 / Playwright POM) 추정 ❌ / research 실 fetch 의무
- **LL-G4-05 (Senior STRONG-STOP)**: 정성 검출 = 진짜 외부 도구 실행 의무 / LLM 양심 ❌

### 정합 관계

- DEC-2026-05-15-g4-fe-skill-track-종결 (본 entry SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (charter §3 G4 종결 sibling)
- DEC-2026-05-15-g2-orchestrate-skill-분리-채택 (paradigm 진화 sibling)
- v2.6.0 paradigm (의미 ID — implement-react / implement-vue / test-playwright / analysis-html-template)
- ADR-CHAIN-001 (chain 4 이중 렌더링 + no-simulation)
- ADR-009 (no-simulation / 외부 도구 auto-invoke 금지)

---

## [3.3.0] — 2026-05-15 MINOR — G2 종결 / analysis-from-quad (BCDE 입력 5 skill + orchestrate paradigm + 25 test pass)

> **charter §3 G2 종결** — R8 입력 5종 중 BCDE 자산 대칭 ✅ 도달 + complex multi-input orchestration paradigm 도입. **5 skill + 5 schema + 25 test pass**. Senior critique STOP/REVISE 본격 흡수. v2.6.0 의미 ID paradigm 정합.

### 사용자 3 메타 지적 본격 흡수

1. **메타 #1** — charter §2 ✅ 판정의 "형식 명시" vs "자산 차원" 구분 누락 risk → **5 skill 자산 대칭 신설** ((a)(d)(e) ✅ 도 자산 차원 ✅ 로 격상).
2. **메타 #2** — 복합 입력 흐름 (Figma + Swagger + 자연어 한 발화) mermaid "선택" 점선이 명세 누락 신호 → **orchestrator paradigm 채택**.
3. **메타 #3** — orchestrator 단일 책임 위반 risk (9 책임 누적) → **B' = 별도 skill 분리** (`analysis-input-orchestrate` 신설 / 4 책임).

### 신설 자산 (5 + 5 + 25)

**5 skill**:

- `skills/analysis-input-orchestrate/SKILL.md` — 자연어 파싱 + BCDE dispatch + merge + cross-ref + conflict (정량 산식)
- `skills/analysis-from-prompt/SKILL.md` — (e) 자연어 의도 흡수
- `skills/analysis-from-swagger/SKILL.md` — (c) OpenAPI 3.1/3.0/Swagger 2.0 흡수 (`@readme/openapi-parser`)
- `skills/analysis-from-plan-doc/SKILL.md` — (d) md + pdf + Notion export 흡수
- `skills/analysis-from-figma/SKILL.md` — (b) Figma desktop selection 흡수 (`mcp__figma-desktop__*` 4 도구)

**5 schema** (strict / additionalProperties:false):

- `schemas/input-summary.schema.json` — orchestrate 통합 산출 (cross_refs + conflicts + score_components + dispatch_mode)
- `schemas/prompt-extract.schema.json`
- `schemas/swagger-extract.schema.json` (validation_status.spectral_invoked = 항상 false / auto-invoke 위반 검출)
- `schemas/plan-doc-extract.schema.json`
- `schemas/figma-extract.schema.json` (scope_out_notes 안 interaction/animation/autolayout-detail 등 명시)

**25 test case** — schema-validator 회귀 15 → **40/40 pass**.

### paradigm 4 결단 (Senior critique 본격 흡수)

| paradigm            | 결단                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| orchestrate 분리도  | **1-A 단일 skill (4 책임 응집)** / 재사용 신호 ≥ 2 누적 시 1-B carry                              |
| sub-skill 호출 방식 | **Hybrid 2-B 기본 (≤ 50K token) + 2-A escalate (> 50K)** / ❌ chain-driver dispatch (STRONG-STOP) |
| conflict 검출 산식  | **정량 (Levenshtein + stem set intersection)** / LLM 양심 회피                                    |
| spectral 검증 시점  | **사용자/orchestrate 명시 호출** / auto-invoke 금지 (no-simulation 정합)                          |

### 부수 갱신

- `skills/analysis-input-collection/SKILL.md` — description trigger 한 줄 추가
- `methodology-spec/workflow/input.md` — "수동 + skill 호출 + orchestrate 자동 dispatch" 3중
- `methodology-spec/plugin-charter.md` §2 R8 ⚠️→✅ + §3 G2 종결 (잔여 G4 > G5 > G1)
- `methodology-spec/skills-axis.md` — analysis 22 → 27
- `flows/analysis.phase-flow.json` — phase 0 skill mapping
- `.claude-plugin/plugin.json` — 3.1.0 → 3.3.0
- `decisions/DEC-2026-05-15-g2-orchestrate-skill-분리-채택.md` — 신설

### Lessons Learned (paradigm 진화)

- LL-G2-01: charter ✅ 판정 시 "형식 명시" vs "자산 차원" 구분 의무
- LL-G2-02: mermaid "선택" 점선 = 흐름 명세 누락 신호
- LL-G2-03: paradigm 결단 시 책임 합산 의무 (N+M 단일 의미 검증)
- LL-G2-04: chain-driver 결정론 axis 오염 회피 (STRONG-STOP) / Hybrid paradigm
- LL-G2-05: LLM 양심 의존 정성 판정 회피 (정량 산식 의무)
- LL-G2-06: auto-invoke 정책 정합 (외부 도구 명시 호출)

### 정합 관계

- DEC-2026-05-15-g2-orchestrate-skill-분리-채택 (본 entry SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (charter §3 G2 종결 sibling)
- v2.6.0 paradigm (의미 ID — `analysis-from-*` slot)
- ADR-008 v2 (이중 렌더링 / input-summary.md)
- ADR-009 (no-simulation / spectral auto-invoke 금지)

---

## [3.2.0] — 2026-05-15 MINOR — G3 종결 / 산출물 폴더 자동 + 지속 운영 인프라 + plugin charter 채택

> **charter §3 G3 종결** — R5/R7 (산출물 폴더 + 작업단위 컨벤션) ✅ 도달. 1회성 hook ❌ / **지속 운영 인프라** 격상 (사용자 본질 재정의 "참조 쉬워야 + 동기화 되어야"). v3.1.0 → v3.2.0 정식 release (commit b762a0c).

### 신설 / 수정 자산 (commit b762a0c / 19 file)

- `methodology-spec/plugin-charter.md` — 17 요구사항 SSOT 신설 (R1~R17 + §4 Claude Code 디폴트 + Gap 5 + 추가 권장 8)
- `schemas/work-unit-manifest.schema.json` — scope + stage manifest schema 신설
- `tools/chain-driver/src/{work-unit,sync,query}.js` — M4 = 자동 drift 감지 + 수동 cascade
- `tools/chain-driver/src/cli.js` — init --scope / query / sync CLI 신규 (115 line 추가)
- `hooks/hooks.json` — SessionStart hook 자동 발동 (recover + markDrift 안내 / D21' 정합)
- `methodology-spec/lifecycle-contract.md` — §파일 위치 컨벤션 확장
- `methodology-spec/id-conventions.md` — scope slug 항목 신설
- `schemas/state.schema.json` — current_scope optional 필드

### 검증

- 114/114 test pass (기존 72 + scope-dir 22 + sync 11 + query 9)
- e2e smoke GREEN (/tmp/g3-smoke)

### Lessons Learned

- `feedback_strict_exposes_drift.md` — additionalProperties:false strict 적용 = fixture drift 폭로 가치 신호

### 정합 관계

- DEC-2026-05-15-g3-scope-folder-종결 (SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (charter SSOT)
- ADR-CHAIN-005 §2 (atomic write + CAS)
- ADR-008 v2 (이중 렌더링)
- v2.6.0 paradigm (stage 폴더 `planning/spec/test/impl` 의미 ID)

---

## [3.1.0] — 2026-05-15 MINOR — chain 1~4 phase ID 의미 ID 자산화 (v3.0.0 carry resolved / D-3 paradigm sibling)

> **v3.0.0 carry resolved** — analysis chain (v3.0.0) 의미 ID 자산화 패턴 정합 sibling. planning/spec/test/implement 4 chain 안 26 phase 숫자 ID → 의미 ID. **scaffolding only / PoC 미사용 / breaking 영향 ≈ 0 / additive 격** 사유로 MINOR. 사내 배포 전 / 실 사용자 0 / alias map ❌ / 즉시 cutover.

### chain별 phase ID 매핑 (26)

**chain 1 (planning) — 5 phase**
| old | new | depends_on |
|---|---|---|
| `P1.0` | **`input-validate`** | [] |
| `P1.1` | **`use-cases-decompose`** | [input-validate] |
| `P1.2` | **`br-intent-extract`** | [input-validate, use-cases-decompose] |
| `P1.3` | **`planning-spec-compose`** | [use-cases-decompose, br-intent-extract] |
| `P1.4` | **`gate-1`** | [planning-spec-compose] |

**chain 2 (spec) — 6 phase**
| old | new | depends_on |
|---|---|---|
| `P2.0` | **`input-integrate`** | [] |
| `P2.1` | **`behavior-spec-compose`** | [input-integrate] |
| `P2.2` | **`acceptance-criteria-derive`** | [behavior-spec-compose] |
| `P2.3` | **`cross-link-7-deliverables`** | [behavior-spec-compose, acceptance-criteria-derive] |
| `P2.4` | **`behavior-diagrams-render`** | [behavior-spec-compose, acceptance-criteria-derive, cross-link-7-deliverables] |
| `P2.5` | **`gate-2`** | [behavior-diagrams-render] |

**chain 3 (test) — 7 phase**
| old | new | depends_on |
|---|---|---|
| `P3.0` | **`framework-detect`** | [] |
| `P3.1` | **`tc-decompose`** | [framework-detect] |
| `P3.2` | **`test-code-generate`** | [tc-decompose] |
| `P3.3` | **`ac-tc-backlink`** | [test-code-generate] |
| `P3.4` | **`red-evidence`** | [test-code-generate, ac-tc-backlink] |
| `P3.5` | **`coverage-measure`** | [red-evidence] |
| `P3.6` | **`gate-3`** | [red-evidence, coverage-measure] |

**chain 4 (implement) — 8 phase**
| old | new | depends_on |
|---|---|---|
| `P4.0` | **`input-plan`** | [] |
| `P4.1` | **`impl-decompose`** | [input-plan] |
| `P4.2` | **`impl-code-generate`** | [impl-decompose] |
| `P4.3` | **`commit-hash-fill`** | [impl-code-generate] |
| `P4.4` | **`green-evidence`** | [commit-hash-fill] |
| `P4.5` | **`static-analysis`** Senior REVISE-3 흡수 (tools/static-runner 명과 axis 분리) | [green-evidence] |
| `P4.6` | **`matrix-finalize`** | [green-evidence, static-analysis] |
| `P4.7` | **`gate-4`** | [green-evidence, static-analysis, matrix-finalize] |

### paradigm 정합 (v3.0.0 D-3 sibling)

- **D-3 paradigm 본질 보존** — `depends_on` 그래프 SSOT / `order` 필드 부재 / 위상정렬 자동 / lexicographic tiebreak
- **작명 paradigm** = "의미만 보존" (chain prefix ❌ / `input-validate` / `input-integrate` / `input-plan` — chain 별 의미 차이를 이름에 담음)
- **flow JSON `version` 일괄 격상** — `2.0.0-dev` → `3.1.0` (repo version 동기화 / "미완성 draft" 신호 영역 정리)

### 영향 범위 (실측 10 file)

- `flows/planning.phase-flow.{json,mermaid}` — 5 phase ID + depends_on + version
- `flows/spec.phase-flow.{json,mermaid}` — 6 phase ID + depends_on + version
- `flows/test.phase-flow.{json,mermaid}` — 7 phase ID + depends_on + version
- `flows/implement.phase-flow.{json,mermaid}` — 8 phase ID + depends_on + version (P4.5 `static-runner` → `static-analysis`)
- `CHANGELOG.md` — v3.0.0 Carry strikethrough + v3.1.0 entry 신설
- `docs/adr/ADR-CHAIN-012-phase-id-semantic-id.md` — §carry resolved 본문

### 영향 ❌ 영역 (grep 실측)

- `skills/` `methodology-spec/` `templates/` `schemas/` `agents/` — P1.X~P4.X 직접 인용 0건 (skill 명만 인용)
- `tools/` src code — P1.X~P4.X 직접 인용 0건 (chain stage prefix 만 인용)
- finding-system enum — P1.X~P4.X 부재 (v3.0.0 시점 P-prefix 폐기 완료)

### Senior critique 흡수 (Sonnet 4.6 / 가벼운 sub-agent / 20분 cap)

| 신호                                             | 흡수                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| STOP                                             | 없음 ✅                                                             |
| REVISE-1 (`input-*` cross-chain 혼동)            | drift-validator 경고 영역 보완 paradigm (chain prefix ❌ 정합 보존) |
| REVISE-2 (gate-2 depends_on 의도)                | 현 P2.5 = `[P2.4]` 동일 paradigm 보존 / JSON 의도 명시              |
| REVISE-3 (static-runner phase ID ↔ tool 명 충돌) | **`static-runner` → `static-analysis` 격하** ✅                     |
| CAUTION-1 (normalize-phase-flow.js 호환)         | ✅ 실측 호환 (chain 비종속 정규식)                                  |
| CAUTION-2 (scope 신뢰)                           | ✅                                                                  |
| CAUTION-3 (flow JSON version 의미)               | ✅ 본 entry 명시                                                    |

### 검증 통과

- ✅ JSON 정합 4/4 (`node -e JSON.parse`)
- ✅ workspace test 317/0 (v3.0.0 baseline 보존)
- ✅ release-readiness 9/9 strict
- ✅ drift-validator --check-chain-layout: 4 stages / 26 phases / 13 skills / 0 orphans / 0 missing
- ✅ drift-validator --check-layout: 11 phases / 22 skills / 0 orphans
- ✅ drift-validator --check-state-flow-consistency: 5 flow stages / 5 enum stages match
- ✅ chain harness 5 요소 변경 ❌ (chain-driver gate-eval.js / hooks-bridge.js / release-readiness.js / br-cross-consistency-validator 본질 보존)

### Sprint sequence

- S1 — Senior critique sub-agent (Sonnet 4.6 / 20분 cap) — STOP 0 / REVISE 3 / CAUTION 3 발행 + 흡수
- S2 — 사용자 일괄 승인 6 결정 묶음
- S3 — flows JSON 4 file rename (26 phase ID + depends_on + version `2.0.0-dev` → `3.1.0`)
- S4 — flows mermaid 4 file rename (subgraph 노드 ID `P_<semantic>` 패턴 + edge)
- S5 — CHANGELOG v3.1.0 entry + v3.0.0 Carry strikethrough + ADR-CHAIN-012 §carry resolved
- S6 — 전수 검증 (workspace + release-readiness + drift-validator)
- S7 — plugin.json + package.json 3.0.0 → 3.1.0 + commit + git tag v3.1.0 + origin push

### 결정적 사실

- **scaffolding only** — planning/spec/test/implement chain 안 PoC end-to-end 실행 0건 / chain harness 입력 0 / breaking 영향 ≈ 0
- v3.0.0 (analysis MAJOR / 54 file) vs v3.1.0 (chain 1~4 MINOR / 10 file) — 1/5 scope + breaking 영향 단계 차이로 semver weight 격하 정당
- chain harness validated §8.1 strict 9/9 본질 보존

---

## [3.0.0] — 2026-05-15 MAJOR — phase ID 의미 ID 본격 자산화 (D-3 paradigm / depends_on 그래프 SSOT / 위상정렬 자동 도출)

> **BREAKING — manifest phase ID 11개 숫자 → 의미 ID + workflow file 11 rename + drift-validator 위상정렬 신규** (semver MAJOR / 사내 배포 전 / 실 사용자 0 / alias map ❌ / 즉시 cutover). v2.0 SDLC 4단계 chain harness 도입 이래 누적 paradigm 의 자연 분기점 — magic decimal (4.5/4.7/4.8) + hyphenated (5-1/5-2) + 의미 부재 (0~6) 본격 폐기.
>
> paradigm 본격 위치 = `docs/adr/ADR-CHAIN-012-phase-id-semantic-id.md` (D-3 paradigm 본격 명세) + `.claude/plans/plan-phase-id-semantic-rename.md` (Senior critique 흡수 + Sprint 분할 본격).

### BREAKING — phase ID 매핑 (11)

| v2.6.0 (숫자) | v3.0.0 (의미 ID)       | depends_on                                                     |
| ------------- | ---------------------- | -------------------------------------------------------------- |
| `0`           | **`input`**            | []                                                             |
| `1`           | **`discovery`**        | [input]                                                        |
| `2`           | **`db-schema`**        | [discovery]                                                    |
| `3`           | **`architecture`**     | [discovery, db-schema]                                         |
| `4`           | **`business-logic`**   | [discovery, db-schema, architecture]                           |
| `4.5`         | **`formal-spec`**      | [business-logic]                                               |
| `4.7`         | **`characterization`** | [business-logic, formal-spec]                                  |
| `4.8`         | **`sql-inventory`**    | [discovery, business-logic, characterization]                  |
| `5-1`         | **`api`**              | [business-logic, formal-spec, characterization, sql-inventory] |
| `5-2`         | **`ui`**               | [architecture, business-logic, characterization]               |
| `6`           | **`quality`**          | [business-logic, formal-spec, api, ui]                         |

### BREAKING — workflow file rename (11)

```
phase-0-input.md              → input.md
phase-1-init.md               → discovery.md
phase-2-db.md                 → db-schema.md
phase-3-arch.md               → architecture.md
phase-4-business-logic.md     → business-logic.md
phase-4-5-formal-spec.md      → formal-spec.md
phase-4-7-characterization.md → characterization.md
phase-4-8-sql-inventory.md    → sql-inventory.md
phase-5-1-api.md              → api.md
phase-5-2-ui.md               → ui.md
phase-6-quality.md            → quality.md
```

### D-3 paradigm 본질

- **`id`** = 의미 ID (영문 hyphenated lowercase)
- **`order` 필드 부재** — 순서는 `depends_on` 그래프 → 위상정렬로 자동 도출
- **lexicographic tiebreak** — 같은 레벨 노드는 알파벳 순 (api / ui 같은 병렬)
- **alias map ❌** — 즉시 cutover

### 신규 영역 (5건)

1. **`tools/drift-validator/src/topological-sort.js`** — Kahn's algorithm + lexicographic tiebreak + 순환 검출 + unknown_deps 검출
2. **`tools/drift-validator/src/check-phase-skills.js`** — depends_on 그래프 무결성 검증 통합 (DAG 의무 + unknown phase 0)
3. **`tools/drift-validator/test/topological-sort.test.js`** — +5 test (DAG 정상 / lexicographic / 순환 / unknown / diff 형식)
4. **`schemas/finding-system.schema.json`** — phase 필드 oneOf (integer + enum["4.5"]) → 의미 ID enum 11종
5. **`docs/adr/ADR-CHAIN-012-phase-id-semantic-id.md`** — D-3 paradigm 본격 명세 + LL-i-51~53

### 검증 통과

- ✅ workspace test 312 → 317 (drift +5 신규 / 회귀 ❌)
- ✅ drift-validator --check-layout: 11 phases / 22 skills / 0 orphans / 0 missing
- ✅ drift-validator --check-chain-layout: 4 stages / 26 phases / 13 skills / 0 orphans
- ✅ drift-validator mermaid ↔ JSON 짝 비교: 0 breaking / 0 non-breaking
- ✅ release-readiness v3.0.0: 9/9 strict pass
- ✅ chain harness 5 요소 본질 보존 (chain-driver gate-eval.js / hooks-bridge.js / release-readiness.js / br-cross-consistency-validator 모두 본질 변경 ❌)

### Sprint 본격 sequence

- S1 (Senior critique sub-agent) — STOP-1+2 / REVISE-1~5 / CAUTION-1~4 발행 + 흡수
- S2 (commit `8a89461`) — manifest + workflow rename + 위상정렬 신규
- S3-a (commit `cff7949`) — schemas + tools 코드 정합 (state-store `P0.0` → `input.0`)
- S3-b (commit `e33d380`) — PoC finding 일괄 sed + 본문 path + mermaid + normalize-phase-flow.js 정규식
- S4 — 전수 검증 (327/0 + 9/9)
- S5 (본 release) — ADR-CHAIN-012 + CHANGELOG v3.0.0 + version bump + commit + tag + push

### Carry (v3.0 후 cleanup)

- examples/poc-04-\* analysis 디렉토리 명 (`0-init/`, `1-architecture/` 등 옛 표기) — 사람 가독성 axis
- skills 본문 안 옛 file 명 misnomer 인용 (phase-3-domain / phase-1-inventory 등) — manual review
- 본문 자유 텍스트 "Phase 4" 산문 표기 — manual review
- ~~**다른 chain stage flow phase ID 의미 ID rename** (planning P1.0~P1.3 / spec P2.0~P2.5 / test P3.0~P3.6 / implement P4.0~?) — 별개 plan 영역~~ → **v3.1.0 resolved**

## [2.6.0] — 2026-05-14 MINOR — skill 의미 ID 본격 자산화 (phase-N 숫자 prefix 본격 폐기 / 17 skill rename / Senior critique 5 의제 본격 흡수)

> **BREAKING — skill 디렉토리 17 rename + 명시 호출 path 본격 변경** (semver MINOR / 사내 dogfooding 한정 / Senior critique 의제 3 전면 흡수). 자연어 trigger 영역 description 본문 보존 / auto-invocation 영향 ❌. v2.5.1 명시 호출 (예 `/analysis-phase-0-input`) → v2.6.0 새 이름 (예 `/analysis-input-collection`). alias map ❌ / 즉시 cutover.
>
> paradigm 본격 위치 = `methodology-spec/skills-axis.md` §6 plan-b carry "v2.0 진입 시 의미 ID + alias map (plan-b carry) 으로 자연 흡수 예정" 본격 자연 흡수 자산화. §6 본인이 v1.4.x "과도기 패턴" 인정 영역 본격 진화. `.claude/plans/plan-skill-meaningful-id-rename.md` + Senior critique 5 의제 본격 흡수 (HARD STOP 2건 = semver MINOR + 영향 42 file / SOFT 3건 = 명명 미세 4건 + common-errors section + micro-commit 패턴) → 사용자 결단 본격 일괄 승인 paradigm.

### BREAKING — skill rename 17 (aspect 4 + br-cross 1 + chain stage 11 = 변경 ❌)

| v2.5.1                                | v2.6.0                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `analysis-phase-0-input`              | **`analysis-input-collection`**                                                 |
| `analysis-phase-1-inventory`          | **`analysis-source-inventory`**                                                 |
| `analysis-phase-2-architecture`       | **`analysis-architecture`**                                                     |
| `analysis-phase-3-domain`             | **`analysis-domain-model`**                                                     |
| `analysis-phase-4-rules`              | **`analysis-business-rules`**                                                   |
| `analysis-phase-4-5-cross-validation` | **`analysis-formal-spec-validation`**                                           |
| `analysis-phase-4-7-characterization` | **`analysis-characterization-test`** (Senior 의제 1 흡수 / Feathers WELC 용어)  |
| `analysis-phase-4-8-sql-inventory`    | **`analysis-sql-inventory`**                                                    |
| `analysis-phase-5-error-mapping`      | **`analysis-error-mapping`**                                                    |
| `analysis-phase-5-form-validation`    | **`analysis-form-validation-fe`** (FE suffix 일괄)                              |
| `analysis-phase-5-openapi`            | **`analysis-openapi`**                                                          |
| `analysis-phase-5-rules`              | **`analysis-api-rule-mapping`** (Senior 의제 1 흡수 / Spring binding 혼동 회피) |
| `analysis-phase-5-schema-erd`         | **`analysis-db-schema-erd`**                                                    |
| `analysis-phase-5-state-map`          | **`analysis-ui-state-map-fe`** (FE suffix 일괄)                                 |
| `analysis-phase-5-type-spec`          | **`analysis-type-spec-fe`** (FE suffix 일괄)                                    |
| `analysis-phase-5-visual-manifest`    | **`analysis-ui-visual-manifest-fe`** (FE suffix 일괄)                           |
| `analysis-phase-6-quality`            | **`analysis-quality-antipattern`** (Senior 의제 1 흡수 / 산출물 정합)           |

### 영향 범위 본격 (Senior 의제 5 흡수 / grep 실측 42 file)

- **skills/ rename 17** — git mv + SKILL.md frontmatter `name:` + 본문 제목 + cross-skill 참조 (workflow/ + .aimd/ path 보존 = lifecycle-contract axis)
- **flows/ 2** — analysis.phase-flow.json (11 phases skills 배열 + 3 history entry) + flows/README.md (drift-validator 호출자 인용)
- **tools/ 2** — spec-test-link-validator src/validator.js comment + package.json description
- **methodology-spec/ 6** — skills-axis.md (§6 진화 + §8 신설) + lifecycle-contract.md + README.md + deliverables 20/21 + workflow phase-4-7/4-8
- **root README + briefing 2 + guides 4 + decisions 1 = 8** — 자연어 trigger 매핑 표 + 사내 onboarding + 사용자 가이드 + 역사 기록
- **tools/\*/README 8** — validator/runner 자체 호출자 인용

### Senior critique 5 의제 본격 흡수

| 의제                                                 | 강도         | 흡수                                                                                                                           |
| ---------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 1. 명명 미세 조정 4건                                | 🟠 SOFT      | ✅ 전면 흡수 (FE suffix 일괄 / binding→mapping / characterization→characterization-test / quality-finding→quality-antipattern) |
| 2. v2.5.1→v2.6.0 cutover section                     | 🟠 SOFT      | ✅ `guides/common-errors.md` Q14.5 본격 신설                                                                                   |
| 3. semver v2.5.2 PATCH → v2.6.0 MINOR                | 🔴 HARD STOP | ✅ 전면 흡수 (skill name 17 rename = breaking API surface change 사실 본격 인공)                                               |
| 4. Sprint 2 micro-commit + drift-validator fail-fast | 🟠 SOFT      | ✅ D1a/b/c 5+6+6 batch + D3 앞당김 (D2 직후) + D4.5 chain-driver test 회귀 신설                                                |
| 5. 영향 범위 28 → 42 file 본격 재산정                | 🔴 HARD STOP | ✅ 전면 흡수 (grep 실측 본격 / plan §2.5 본격 자산화)                                                                          |

### 검증 본격 통과

- ✅ drift-validator 3-way (manifest ↔ workflow ↔ skills) — 22 skills_declared / 11 phases_checked / 0 diff
- ✅ workspace test 322/0 본격 보존 (312 workspace + 10 release-readiness self-test)
- ✅ release-readiness 9/9 본격 통과 (chain harness validated §8.1 strict 본질 보존)
- ✅ spec-test-link-validator + chain-driver test 회귀 0 (5/5 + 72/72)
- ✅ 자연어 trigger 영역 description 본문 보존 (auto-invocation 영향 ❌)

### Sprint 본격 sequence

- Sprint 1 (plan 본격 확정 + Senior critique 흡수) ✅
- Sprint 2 (D1a/b/c + D2 + D3 fail-fast + D4+D4.5 + D5+D5.5 + D6+D6.5 + D7 + D8) ✅
- Sprint 3 (skills-axis §6/§8 + ADR-CHAIN-011 LL-i-50 + CHANGELOG v2.6.0 + version bump + build dist + commit) 진행

### 결정적 사실

- chain harness validated §8.1 strict 9/9 본질 보존 (release-readiness 회귀 ❌)
- alias map ❌ paradigm = "사내 dogfooding 한정 + 자연어 trigger 메인 path / 명시 호출 부차 path" 사실 본격 정합
- paradigm 본격 위치 = §6 v1.4.x 과도기 본격 자연 흡수 / §8 v2.6.0 의미 ID 본격 자산화 / ADR-CHAIN-011 §9 LL-i-50 본격 자산화
- workflow/<phase-id>.md file 명 보존 (manifest phase ID axis / skill name axis 무관)
- aspect 4 + br-cross 1 + chain stage 11 = 변경 ❌ (이미 의미 ID)

---

## [post-v2.5.1 meta cleanup] — 2026-05-14 (메타 정리 — plugin.json description + CLAUDE.md CHANGELOG 라인 + CHANGELOG.md split / 가독성 영역 한정 / no release / no version bump / no tag / chain harness 5 요소 변경 ❌)

> 사용자 결단 "즉시 가능부터" — 메타 정리 3건 일괄 시행. paradigm / chain harness / schema / PoC / validator 변경 ❌. 가독성 + 신규 contributor 진입 마찰 해소 영역 한정.

### 시행 산출 3건

1. **`.claude-plugin/plugin.json` description 정상화** — ≈ 3KB session history (Phase A~D + chain harness 변경 사실 + workspace test 수치 + ADR LL 참조) → 200자 안정 제품 설명 (marketplace.json description 톤 정합 / "변경 이력은 CHANGELOG.md 참조" 명시)
2. **`CLAUDE.md` CHANGELOG 라인 슬림화** — 1줄 7849자 (session 9~15차 SESSION-WRAPUP 응축) → 200자 (v2.5.1 PATCH 현재 + v2.5.0 MINOR FINAL release 직전 + 상세 CHANGELOG link) — 다른 섹션 (가치 명세 / 4원칙 / 핵심 디렉토리 / 정착 패턴) 본문 보존
3. **`CHANGELOG.md` split** — v2.3.7 ~ v1.4.0 (line 725 ~ 2338) → `CHANGELOG-HISTORY.md` 상단 prepend (두번째 split / 첫 split = 2026-05-06 cleanup round 2-A v1.3.x 격리)
   - 본문 `CHANGELOG.md`: 165KB / 2341 라인 / 34 헤더 → **60KB / 729 라인 / 12 헤더** (v2.4+ 본문 보존)
   - archive `CHANGELOG-HISTORY.md`: 67KB / 1254 라인 / 13 헤더 → **168KB / 2870 라인 / 36 헤더** (v2.3.7 ~ v1.0)
   - `CHANGELOG-HISTORY.md` header 갱신 (v1.3.x → v2.3.x and earlier) + `CHANGELOG.md` 하단 pointer 갱신

### 결정적 사실

- chain harness 5 요소 변경 ❌
- v2.5.0 MINOR FINAL release 본질 보존 ✅ (Layer 2 LLM paradigm / ≥ 2 PoC corroboration / Adzic SBE 함정 회피 / industry-first paradigm 모두 본질 보존)
- version-check 3-way sync v2.5.1 보존 ✅
- release-readiness 9/9 strict pass ✅ (`node scripts/release-readiness.js --target v2.5.1`)
- release-readiness self-test 10/10 pass ✅ (`npm run test:release`)
- br-cross-consistency-validator 31/31 보존 ✅
- 11 PoC 호환 자격 보존 ✅

### 선행 회귀 별개 carry

- `tools/drift-validator/check-phase-skills.test.js` + `chain stage layout test` 2건 실패 — v2.5.1 PATCH 1-depth 평탄화 후 validator 미동기화 / **git stash 후에도 동일 실패 = 본 meta-cleanup refactor 무관 / pre-existing regression**.

### 신규 carry 3 (3 resolved by follow-up commits / 0 outstanding)

- ✅ **C-drift-validator-skills-flat-sync** (medium / tools / regression / **resolved**) — v2.5.1 1-depth 평탄화 후 `tools/drift-validator/check-phase-skills.test.js` + `chain stage layout test` 2건 실패. follow-up commit 안 `check-phase-skills.js` 1-depth + category prefix paradigm 정합 갱신 시행 → **workspace test 310/2 → 312/0 본질 회복** ✅.
- ✅ **C-briefing-outdated-v2.2-to-v2.5.1** (high / onboarding / content / **resolved**) — `briefing/` 사내 동료 onboarding 자료 v2.2.0 시점 → v2.5.1 격차 5단계. follow-up commit 안 5 file 본격 갱신 시행 + Confluence 4 page update + title 복원.
- ✅ **C-guides-outdated-1-depth-paradigm** (critical / plugin INCLUDE 영역 / 동료 install 후 broken link / **resolved**) — `guides/` 5 file 본격 갱신 시행:
  - `first-prompt-cookbook.md` — skill path 20+ link 본격 갱신 (`skills/<category>/X` → `skills/<category>-X` 1-depth + prefix paradigm) + v2.5 신규 `analysis-br-cross-consistency-check` 추가 + v2.4 dual representation paradigm 본격 명시 + 38 skill 정합
  - `getting-started.md` — v2.0.0 → v2.5.1 정합 (사내 GHE install / Skills 38 + Agents 3 / chain 1 gate Layer 2 LLM / 16 tools / 9/9 strict)
  - `chain-harness-guide.md` — §5.1 Layer 2 LLM 통합 본격 신설 (br-cross-consistency-validator Layer 1 + Layer 2 paradigm / gate-eval.js layer2_threshold / Anthropic API ❌ + Claude Code Task tool ✅ 정정)
  - `common-errors.md` — Q1.1 신규 Skills 0 critical 결함 회복 절차 + §6.1 신규 Layer 2 LLM 마찰 3 Q (Q15 응답 시간 / Q16 semantic_drift_detected 사용자 결단 / Q17 confidence_cap_exceeded) + Q11 256 → 295 file + Q14 명시 호출 1-depth
  - `guides/README.md` — 자산 4 표 본격 갱신 + 본 DEC 참조 추가
  - **동료 install 후 broken link 본격 차단** ✅ (grep `skills/{analysis,planning,spec,test,implement,_base}/` 0건 확인)

### 부속 자산

- `DEC-2026-05-14-post-v2.5.1-meta-cleanup.md` 신설 + INDEX.md 갱신
- `README.md` CHANGELOG link 3건 갱신 (v1.4+/v1.3 이전 → v2.4+/v2.3.x 이전) — 본 split 정합

---

## [v2.5.1] — 2026-05-14 ⭐ 현재 (PATCH — Claude Code plugin install 호환성 본격 회복 + 사상 명세 (skills-axis + agents-axis) 본격 자산화 + 3-way sync 회복 (package.json v2.4.1→v2.5.1 / v2.5.0 release commit 갱신 누락 회복) + chain harness 5 요소 변경 ❌)

> **v2.5.1 PATCH** — v2.5.0 MINOR FINAL release 후속 — 사내 GHE plugin install 후 38 skill + 3 agent 본격 인식 ❌ 였던 v2.0.0~v2.5.0 본질 결함을 post-v2.5.0 commit `4d25df8` (agents/skills 1-depth 평탄화) 로 본격 회복 + 본 PATCH 안에 사상 명세 본격 정합 + DEC + ADR LL 자산화 + 3-way sync 회복.

### v2.5.1 산출 자산 6종

1. **agents/skills 1-depth 평탄화 본격 자산화** (post-v2.5.0 commit `4d25df8` 본격 자산화) — 38 skill + 3 agent Claude Code 표준 1-depth + category prefix paradigm (skills/<category>-<name>/SKILL.md + agents/\_base-<name>.md)
2. **methodology-spec/skills-axis.md 본격 정합** (category prefix 1-depth paradigm 사상 갱신 / v1.4.4 신설 paradigm 의 본격 정합)
3. **methodology-spec/agents-axis.md 본격 작성** (사상 명세 자산화 — agents 1-depth paradigm + \_base 카테고리 + sub-agent invocation paradigm 정합)
4. **DEC-2026-05-14-agents-skills-1-depth-flatten 신설** + INDEX 갱신
5. **ADR-CHAIN-011 §9 LL-i-48+49 자산화** (Claude Code plugin 표준 1-depth vs lifecycle stage organize 충돌 본질 결함 + category prefix flatten 해소 paradigm)
6. **3-way sync 회복** — `package.json` v2.4.1 → v2.5.1 (v2.5.0 release commit `9e6cf55` 갱신 누락 회복) + `plugin.json` v2.5.0 → v2.5.1 + CHANGELOG 헤더 신설 + README.md 상단 version 표시 v2.0.0-rc1 → v2.5.1 정합

### critical 결정적 사실

- **v2.0.0~v2.5.0 까지 plugin install 영역에서 skill 본격 작동 ❌ 했던 본질 결함** = 본 v2.5.1 PATCH 본격 회복 ✅
- 사내 GHE 표준 install (`/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git` + `/plugin install ai-native-methodology@ai-native-methodology`) 본격 작동 ✅ (사용자 측 install 검증 통과)
- chain harness 5 요소 변경 ❌ (chain-driver / 4 gate validator / state.json / 산출물 schema / lifecycle 변경 ❌)
- v2.5.0 MINOR FINAL release 본질 보존 ✅ (Layer 2 LLM paradigm + ≥ 2 PoC corroboration + Adzic SBE 함정 회피 + industry-first paradigm 모두 본질 보존)
- 11 PoC 호환 자격 보존 ✅
- workspace test 312/0 + scripts/test 10/10 = 322/0 본질 보존 ✅

### release-readiness 9/9 strict (v2.5.0 격상 본질 보존)

- v2.5.0 시점 8/8 → 9/9 격상 (layer_2_consistency criterion 신설). 본 PATCH 도 9/9 strict 통과 자격 (chain harness 본질 + 분석 stage 영역 변경 ❌ / regression ❌).

### neutral neighbor — 본 PATCH 영역 외

- 본 PATCH = plugin install 호환성 fix + 사상 명세 자산화 + 3-way sync 회복 영역 한정. v2.5.0 본격 paradigm (Layer 2 LLM Claude Code sub-agent invocation / dual representation / ≥ 2 PoC corroboration / Adzic SBE 함정 회피 / industry-first paradigm) = 본질 보존.

### Lessons Learned 2건 자산화 (ADR-CHAIN-011 §9 patch v10)

- **LL-i-48** — Claude Code plugin 표준 1-depth (`agents/<name>.md` + `skills/<name>/SKILL.md`) vs 본 plugin lifecycle stage organize 2-depth (`agents/<category>/<name>/<name>.md` + `skills/<category>/<name>/SKILL.md`) **충돌 본질 결함** — v2.0.0~v2.5.0 까지 사내 GHE install 후 skill 본격 작동 ❌ 본질 사실. plugin lifecycle organize 사상 자체 (skills-axis.md v1.4.4) ≠ Claude Code runtime 영역 paradigm. **사용자 결단 paradigm = sub-axis 영역 분리** (사상 axis = methodology-spec / runtime axis = skills/<category>-<name>/ 1-depth 평탄화).
- **LL-i-49** — category prefix flatten 해소 paradigm — 사용자 결단 옵션 B (sub-axis 분리 / 디렉토리 axis = prefix 형태 보존). 사용자 결단의 본질 = "사상 보존 (lifecycle organize axis 사상 명세) + Claude Code 호환 (1-depth runtime)" dual axis. 사상 명세 = methodology-spec/skills-axis.md + agents-axis.md / runtime 자산 = skills/<category>-<name>/ + agents/\_base-<name>.md. 본 paradigm 은 ADR-008 이중 렌더링 사상 (사상 + 자산 분리) 의 plugin runtime 영역 확장.

### 신규 carry 1

- **C-poc-axis-design-vs-runtime-separation-paradigm** (medium / 사상 명세) — 향후 plugin lifecycle organize 사상 vs Claude Code runtime 호환성 충돌 발생 시 본 paradigm (사상 axis 보존 + runtime 평탄화) 정합 적용 carry.

---

## [v2.5.0] — 2026-05-14 (MINOR FINAL — Layer 2 LLM paradigm 본격 도입 + ≥ 2 PoC corroboration 본격 입증 + Adzic SBE 10년 폐기 함정 회피 자격 본격 도달 + industry-first paradigm 본격 입증 + release-readiness 8/8 → 9/9 격상 + chain harness validated 본질 보존 ✅)

> **v2.5.0 MINOR FINAL** — Phase A (description vs natural_language paradigm 재정의 / session 10차) + Phase B (PoC #03 + PoC #05 dual representation 마이그레이션 / Layer 1 keyword threshold 자체 제거 / session 11차) + Phase C (Layer 2 LLM Claude Code sub-agent invocation paradigm 본격 구현 / Sonnet 4.6 batch / session 12~14차) + Phase D (release-readiness 9/9 격상 + ≥ 2 PoC corroboration 본격 검증 + drift BR 2건 DRIFT 격상 자산 / session 15차) 모두 본격 종결.

### v2.5.0 Phase D session 15차 산출 자산 8종

1. **`scripts/release-readiness.js`** — check9 layer_2_consistency 신규 + check3 + check8 경로 회복 (session 11차 phase B `input/ → output/rules/` 회귀 회복 / per-PoC mean ≥ 0.7 + critical/high drift 0 / Senior REVISE-1 + LL-i-43 정합)
2. **`scripts/test/release-readiness.test.js`** — 9 → 10 case (+1 신규 layer_2_consistency happy path / criterion id 9개 정합)
3. **`examples/poc-05-sample-user-register/output/rules/rules.json`** — meta 안 generated_at + confidence + inputs_used + methodology_version + formula_version + extraction_env 표준 필드 회복 (session 11차 phase B 회귀 회복)
4. **`tools/br-cross-consistency-validator/PHASE-D-2026-05-14-corroboration-final.md`** — 31 BR 통합 corroboration 본격 입증 자산
5. **`tools/br-cross-consistency-validator/PHASE-D-2026-05-14-drift-domain-review.md`** — 2 drift BR DRIFT 격상 자산 (BR-AUTH-JWT-002 + BR-USER-DELETE-AUTH-001 / 사용자 결단 / rules.json 변경 ❌)
6. **`decisions/DEC-2026-05-14-v2.5.0-minor-final.md`** — DEC 신설 (본 release 정합)
7. **`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md`** §11 patch v9 + §9 LL-i-44+45 자산화
8. **plugin.json + br-cross-consistency-validator/package.json + chain-driver/package.json** version bump (2.4.1 → 2.5.0 / 0.1.0 → 0.2.0)

### chain harness 5 요소 변경

| 요소                               | session 14차            | session 15차                      |
| ---------------------------------- | ----------------------- | --------------------------------- |
| 1. no-simulation policy trio       | ❌                      | ❌                                |
| 2. D21' (suppressOutput)           | ❌                      | ❌                                |
| 3. release-readiness content-aware | ❌                      | **9th criterion 추가 (additive)** |
| 4. chain-driver gate-eval Layer 2  | session 14차 (additive) | ❌                                |
| 5. drift state-flow                | ❌                      | ❌                                |

→ **additive change paradigm 정합** (chain harness validated 본질 보존 ✅ / LL-i-42 정합)

### release-readiness 9/9 실측 (session 15차 본격)

```
node scripts/release-readiness.js --target v2.5.0
✅ poc_corroboration / real_tool_evidence / validators_violation / chain_coverage / adr_registry / matrix_greenness / e2e_cycle_pass / analysis_validator_violation / layer_2_consistency

9/9 criteria passed.
v2.5.0 = release-ready.
```

Layer 2 per-PoC mean: PoC #01=0.848 (n=13) / PoC #03=0.914 (n=18) / PoC #05=0.970 (n=2, sample).

### ≥ 2 PoC corroboration 본격 입증 (31 BR)

| PoC                   | n   | L1    | L2    | overall   | gate                    |
| --------------------- | --- | ----- | ----- | --------- | ----------------------- |
| PoC #01 (Java/Spring) | 13  | 0.954 | 0.848 | **0.901** | pass                    |
| PoC #03 (TS/NestJS)   | 18  | 0.967 | 0.914 | **0.941** | pass                    |
| PoC #05 (sample)      | 2   | 1.0   | 0.97  | 0.985     | pass (corroboration ❌) |

→ **§8.1 strict ≥ 2 PoC corroboration 자격 본격 도달 ✅** (ADR-CHAIN-008 정합 / cross-language + cross-platform + drift 종류 diversity 확보)

### test 회귀 검증

- workspace 전수: **312/0** (session 14차 보존 / 회귀 ❌)
- scripts/test/release-readiness.test.js: **10/10** (session 14차 9 → 본 session 10 / +1 신규)
- 합산 **322/0 pass** ✅

### Lessons Learned 신규 (ADR-CHAIN-011 §9 patch v9)

- **LL-i-44** ("drift BR DRIFT 격상 자산 paradigm = rules.json 변경 ❌ 본격 본질")
- **LL-i-45** ("absent BR semantic_inversion 본격 검출 = 본 방법론 가치 본격 입증")

### 자격 본격 입증 4종 ✅

- ≥ 2 PoC corroboration ✅ (31 BR)
- Adzic SBE 10년 폐기 함정 회피 ✅ (Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증)
- industry-first 자격 (Spec Kit 90K stars 정면 비교) ✅
- chain harness validated 본질 보존 ✅ (additive change paradigm)

---

## [v2.4.1] — 2026-05-14 (PATCH — 사내 GHE plugin 배포 채널 정착 + root `.claude-plugin/marketplace.json` 신설 (git-subdir source / path: ai-native-methodology) + `ai-native-methodology/.claude-plugin/plugin.json` homepage GHE 교체 + README.md 시나리오 B → B-1 (GHE git URL, Recommended) + B-2 (dist artifact, 오프라인) 분리 + DEC-2026-05-14-ghe-marketplace-root-신설 + chain harness 5 요소 변경 ❌)

> **v2.4.1 PATCH — 사내 GHE plugin 배포 채널 정착** — v2.4.0 ⭐ MINOR FINAL release plugin artifact 가 사내 GHE (`github.smilegate.net/SGH-ISD/ai-native-methodology`) 에 본격 배포됨. nested 레포 구조 (`<git-root>/ai-native-methodology/.claude-plugin/`) 와 Claude Code marketplace add 시 git root 의 `.claude-plugin/marketplace.json` 만 인식하는 표준 동작 사이의 path 불일치 해소 → `git-subdir` source 타입 채택.

### v2.4.1 산출 자산 5종

1. **root `<git-root>/.claude-plugin/marketplace.json` 신설** — `git-subdir` source / `path: "ai-native-methodology"` / `url: https://github.smilegate.net/SGH-ISD/ai-native-methodology.git` → 사용자 `/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git#v2.4.1` 1줄 install 가능
2. **`ai-native-methodology/.claude-plugin/plugin.json` homepage 교체** — `https://github.com/rageboom/ai-native-methodology` → `https://github.smilegate.net/SGH-ISD/ai-native-methodology` (사내 정합)
3. **`ai-native-methodology/.claude-plugin/marketplace.json` 보존** — `source: "./"` 그대로 (시나리오 A 편집자 워크스페이스 직접 등록 / 시나리오 B-2 dist artifact 폴더 등록 워크플로 보존)
4. **README.md 시나리오 B 분리** — B-1 (GHE git URL, Recommended / 사내 표준) + B-2 (dist artifact, 오프라인 / 특수 환경 fallback)
5. **DEC-2026-05-14-ghe-marketplace-root-신설** + `decisions/INDEX.md` 갱신

### chain harness 5 요소 변경 ❌

본 v2.4.1 PATCH = plugin 배포 path infrastructure 영역 한정 (사내 GHE 본격 배포 / nested 레포 → git-subdir paradigm). chain harness 5 요소 (chain-driver / 4 gate validator / state.json / 산출물 schema / lifecycle) 변경 ❌. 11 PoC 호환 자격 보존 ✅. v2.4.0 ⭐ MINOR FINAL release 본질 보존 ✅.

### release-ready ❌ 명시 (install path fix purpose only)

본 v2.4.1 PATCH 는 release-readiness §8.1 strict **6/8 pass / 2 regress** 인지 상태로 commit + tag. **사용자 결단** "v2.4.1 = install path fix 한정 / release-ready ❌ 명시 carry" (Recommended 옵션).

| criterion                                                                                                  | 결과   | 원인                                                                                 |
| ---------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| poc_corroboration / real_tool_evidence / chain_coverage / adr_registry / matrix_greenness / e2e_cycle_pass | ✅ 6/6 | v2.4.0 본질 보존                                                                     |
| validators_violation                                                                                       | ❌     | session 11~13차 carry — planning-extraction (poc-05) BR-USER-DATA-001 unknown_br     |
| analysis_validator_violation                                                                               | ❌     | session 11차 carry — poc-05 input/rules.json missing (`input/ → output/rules/` 이전) |

본 regress 2건 = sessions 11~14차 v2.4.0 carry update (`no release / no version bump / no tag`) 누적 부담. v2.4.0 ⭐ MINOR FINAL release 시점 8/8 pass → carry update 4 session 누적 → 본 v2.4.1 release-readiness 부담 떠안음.

본 v2.4.1 PATCH 본질 = **사내 GHE install 차단 즉시 해소**. 8/8 strict 회복 = sessions 15차+ Phase D carry 영역 (release-readiness 9/9 + v2.5.0 MINOR FINAL release 영역 정합).

### 신규 carry 3건

- **C-release-readiness-recovery-v2.5.0** (critical / sessions 15차+ Phase D 영역) — PoC #05 input/rules.json 재배치 + planning-extraction (poc-05) BR-USER-DATA-001 정합 + 8/8 strict 회복
- **C-ghe-distribution-validation** (medium / install UX 본격 재시도 동작 검증)
- C-settings-json-auto-distribution (low / 사내 사전 배포 paradigm)

---

## [v2.4.0 carry update — session 14차 SESSION-WRAPUP — v2.5.0 Phase C step 9 종결 — chain 1 gate Layer 2 통합 (chain harness 5 요소 1 변경) — Phase C 본격 종결 ✅] — 2026-05-14 (no release / no version bump / no tag — gate-eval.js findings shape 안 llm_consistency_score+llm_threshold+llm_status 3 필드 + evaluateGate 안 layer2_threshold block reason + severityRank rank 2 (coverage_threshold 수준) + applyUserDecision user go → go-with-warnings 허용 + Senior STOP-3 흡수 + REVISE 4건 흡수 + chain-driver test +4 신규 (68→72) + workspace 312/0 + chain harness validated 본질 보존 ✅ + DEC + ADR §9 LL-i-42+43 + §11 patch v8 / Phase D 진입 자격 본격 도달 / session 15차+ = release-readiness 9/9 + v2.5.0 MINOR FINAL release)

> **session 14차 — v2.5.0 Phase C step 9 종결 — chain 1 gate Layer 2 통합** — session 13차 carry C-chain-1-gate-layer-2-integration (critical) 시행. 4원칙 1단계 plan T 자산화 → 4원칙 2단계 Senior critique → 4원칙 3단계 사용자 결단 "1" (종합 권장 시행) → 4원칙 4단계 본격 시행 + Phase C 본격 종결.

### session 14차 Senior critique STOP signal 흡수

- **STOP-3** (Q-S3 (b) 단독 선택 시 Phase C 종결 자격 상실) → Q-S3 (a) 본격 채택

### session 14차 시행 산출 (chain harness 5 요소 1 변경)

- `tools/chain-driver/src/gate-eval.js` 본격 갱신:
  - findings shape: `llm_consistency_score` + `llm_threshold` + `llm_status` 3 필드 (Q-S1 (a))
  - evaluateGate: `layer2_threshold` block reason 추가 (explicit guard `llm_status === 'evaluated' && score != null && score < threshold` / REVISE-1)
  - severityRank: `layer2_threshold: 2` (coverage_threshold 수준 / Senior 권장 / REVISE-3)
  - applyUserDecision: layer2_threshold = user go → go-with-warnings (Q-S2 (b) coverage_threshold 수준)
- `tools/chain-driver/test/gate-eval.test.js`: +4 신규 Layer 2 paradigm test (skipped / pass / fail / user-go) / REVISE-4 / chain-driver 68→72
- `decisions/DEC-2026-05-14-phase-c-step-9-chain-1-gate-layer-2.md` 신설
- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-42+43 + §11 patch v8

### session 14차 결정적 사실

| 사실                                           | 자료                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| **chain 1 gate Layer 2 통합 ✅**               | gate-eval.js + 4 신규 test                                              |
| **chain harness 5 요소 1 변경 (chain-driver)** | Senior 검토 후 / additive change paradigm 정합                          |
| **chain harness validated 본질 보존 ✅**       | no-simulation trio + D21' + release-readiness content-aware 영역 비손상 |
| **Phase C 본격 종결 ✅**                       | step 1~12 모두 완료                                                     |
| **workspace 312/0**                            | session 13차 308 → +4 / 회귀 ❌                                         |
| **Phase D 진입 자격 본격 도달**                | release-readiness 9/9 + v2.5.0 MINOR FINAL release 의무                 |

### Lessons Learned 신규 (session 14차)

- **LL-i-42** ("chain harness 5 요소 변경 paradigm — additive change paradigm + chain harness validated 본질 보존 의무")
- **LL-i-43** ("Layer 2 block reason severity rank paradigm — semantic drift = coverage_threshold 수준 / Phase D 도메인 전문가 검토 carry 정합")

### Phase C step 1~12 본격 종결 ✅

| step                                                                   | session                 |
| ---------------------------------------------------------------------- | ----------------------- |
| step 1~5 (plan + sub-agent + 결단 + validator interface + prompt spec) | 12차                    |
| step 6~8 (PoC #03 NL + PoC #05 GWT + PoC #01 Layer 2)                  | 13차                    |
| **step 9 (chain 1 gate Layer 2 통합)**                                 | **14차 ✅**             |
| step 10 (OVERALL_THRESHOLD 재설계)                                     | 12차 (paradigm 구현 ✅) |
| step 11 (test 갱신)                                                    | 12+13+14차              |
| **step 12 (Phase C SESSION-WRAPUP)**                                   | **14차 ✅**             |

### 다음 step (session 15차+ = Phase D)

- release-readiness 8/8 → 9/9 재격상
- ≥ 2 PoC corroboration 본격 검증
- PoC #01 13 BR + 2 drift BR 도메인 전문가 검토
- **v2.5.0 MINOR FINAL release** (commit + git tag v2.5.0 + origin push)
- self-evaluation bias retrospect (Opus/Haiku 교차 검증)

---

## [v2.4.0 carry update — session 13차 SESSION-WRAPUP — v2.5.0 Phase C step 6+7+8+11+12 본격 시행 + Claude Code sub-agent invocation paradigm 본격 동작 입증] — 2026-05-14 (no release / no version bump / no tag — Task tool 5회 본격 호출 (Sonnet 4.6 / batch / 31 BR) + PoC #03 NL 본격 합성 + PoC #05 GWT 신규 합성 + PoC #01+#03+#05 Layer 2 cross-validation + 3 PoC 모두 gate pass + ≥ 2 PoC corroboration L1+L2 양쪽 통과 ✅ + Adzic 함정 회피 자격 본격 도달 ✅ + industry-first 자격 본격 입증 ✅ + skill 신설 + DEC + ADR §9 LL-i-39+40+41 + §11 patch v7 + 308/0 test pass + semantic_drift 2 BR Phase D carry / Phase C 종결 = session 14차 chain 1 gate Layer 2 통합 / Phase D = release-readiness 9/9 + v2.5.0 MINOR release)

> **session 13차 — v2.5.0 Phase C step 6+7+8+11+12 본격 시행** — session 12차 carry (C-phase-c-step-6-12-session-13 critical) 시행. 사용자 결단 "1" (Plan S §3.1 옵션 A) 정합. Task tool 5회 본격 호출 (Sonnet 4.6 / batch paradigm) 본격 시행 + 본격 재실측 + skill 자산화 + SESSION-WRAPUP.

### session 13차 Task tool 5회 본격 호출 (Sonnet 4.6 / batch paradigm 정합)

| Agent              | step     | scope                                         | 결과 JSON                                   |
| ------------------ | -------- | --------------------------------------------- | ------------------------------------------- |
| Agent 1 (NL 합성)  | step 6-a | PoC #03 18 BR NL TODO marker → 본격 statement | layer-2-results/poc-03-nl-synthesis.json    |
| Agent 3 (GWT 합성) | step 7-a | PoC #05 2 BR GWT 신규 합성                    | layer-2-results/poc-05-gwt-synthesis.json   |
| Agent 5 (Layer 2)  | step 8   | PoC #01 13 BR Layer 2 재검증                  | layer-2-results/poc-01-layer-2-results.json |
| Agent 2 (Layer 2)  | step 6-b | PoC #03 18 BR Layer 2 cross-validation        | layer-2-results/poc-03-layer-2-results.json |
| Agent 4 (Layer 2)  | step 7-b | PoC #05 2 BR Layer 2 cross-validation         | layer-2-results/poc-05-layer-2-results.json |

### session 13차 본격 재실측 결과 (Layer 1 + Layer 2 통합)

| PoC                             | L1    | L2        | overall   | gate        | findings                   |
| ------------------------------- | ----- | --------- | --------- | ----------- | -------------------------- |
| **PoC #01 (baseline)**          | 0.954 | **0.848** | **0.901** | **pass ✅** | 5 (4 low + 1 medium drift) |
| **PoC #03 (session 13차 신규)** | 0.967 | **0.914** | **0.941** | **pass ✅** | 5 (4 low + 1 medium drift) |
| **PoC #05 (sample)**            | 1.000 | **0.97**  | **0.985** | **pass ✅** | 0                          |

### session 13차 결정적 사실

| 사실                                                            | 자료                                                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **≥ 2 PoC corroboration Layer 1 + Layer 2 양쪽 통과 ✅**        | PoC #01 13 + PoC #03 18 = 31 BR (Senior STOP-1 본격 흡수)                     |
| **Adzic SBE 폐기 함정 회피 자격 본격 도달 ✅**                  | Layer 1 + Layer 2 axis 자료 보유 / LL-i-26 정합                               |
| **Claude Code sub-agent invocation paradigm 본격 동작 입증 ✅** | B-4 paradigm / Anthropic API key 의무 ❌                                      |
| **industry-first 자격 본격 입증 ✅**                            | Spec Kit / AWS Q / DMN / Drools / Spectral / AutoUAT 모두 부재 / LL-i-35 정합 |
| **workspace 전수 test = 308/0**                                 | session 12차 보존 / 회귀 ❌                                                   |

### session 13차 산출 (자산화 + skill)

- `examples/poc-03-realworld-nestjs/output/rules/rules.json` (18/18 BR NL 본격 statement 갱신)
- `examples/poc-05-sample-user-register/output/rules/rules.json` (2/2 BR GWT 신규 합성 + sample_mode 보존)
- `tools/br-cross-consistency-validator/layer-2-results/` 디렉토리 신설 + 5 결과 JSON 자산화
- `tools/br-cross-consistency-validator/PHASE-C-2026-05-14-re-measurement.md` 본격 재실측 보고
- `skills/analysis-br-cross-consistency-check/SKILL.md` 신설 (Q-C-trigger (d) paradigm 정합)
- `flows/analysis.phase-flow.json` cross_cutting.aspects.skills[] 등록 (drift-validator 47/47 pass)
- `decisions/DEC-2026-05-14-phase-c-step-6-12-session-13.md` 신설
- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-39+40+41 + §11 후속 patch v7

### semantic_drift_detected 2 BR (Phase D carry)

- **BR-AUTH-JWT-002** (PoC #01 / 0.65 / 규범 vs 현실 비대칭)
- **BR-USER-DELETE-AUTH-001** (PoC #03 / 0.55 / semantic_inversion / absent BR)

### Lessons Learned 신규 (session 13차)

- **LL-i-39** ("Claude Code sub-agent invocation paradigm 본격 동작 입증 + Sonnet 4.6 batch paradigm 정합")
- **LL-i-40** ("Adzic SBE 폐기 함정 회피 자격 본격 도달 — Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증")
- **LL-i-41** ("same-model self-evaluation bias 위험 + Phase D retrospect carry 의무")

### chain harness 5 요소 변경 ❌

본 session 13차 시행 영역 = rules.json 갱신 + skill 신설 + flows/analysis.phase-flow.json 갱신 (skill manifest 등록 / drift-validator orphan 회피) + ADR + DEC + 자산화. chain harness 5 요소 변경 ❌ 보존.

chain 1 gate Layer 2 통합 (chain-driver gate-eval.js) = session 14차 본격 결단 영역.

### 다음 step (session 14차)

- chain 1 gate Layer 2 통합 (chain-driver gate-eval.js / chain harness 5 요소 1 변경 의무)
- Phase C SESSION-WRAPUP
- Phase D = release-readiness 8/8 → 9/9 + PoC #01 도메인 전문가 검토 + v2.5.0 MINOR release

---

## [v2.4.0 carry update — session 12차 SESSION-WRAPUP — v2.5.0 Phase C step 1~5 시행] — 2026-05-14 (no release / no version bump / no tag — Layer 2 LLM 본격 paradigm 구현 (Claude Code sub-agent invocation paradigm) + Senior STOP-1+2+3+4 흡수 + REVISE 5건 흡수 + validator interface 본격 + docs/layer-2-prompt-spec.md 신설 + test +5 (31/31) + workspace 308/0 + DEC 신설 + ADR §9 LL-i-37+38 + §11 patch v6 / Phase C step 6~12 = session 13차 분리)

> **session 12차 — v2.5.0 Phase C step 1~5 시행** — session 11차 patch v5 paradigm 회복 후속 carry (C-phase-c-paradigm-redesign + C-claude-code-subagent-invocation-paradigm). 4원칙 1단계 plan `~/.claude/plans/r-v2.5.0-phase-c-layer-2-claude-code-subagent.md` 자산화 → 4원칙 2단계 가벼운 Senior critique sub-agent 토론 → 4원칙 3단계 사용자 결단 "진행하자" → 4원칙 4단계 시행 + Lessons Learned.

### session 12차 Senior critique STOP signal 흡수

- **STOP-1 (최강도 / Claude → Claude self-invocation echo chamber)** → Sonnet 4.6 sub-agent 호출 paradigm 의무 / F-015 cross-validation pattern 정합
- **STOP-2 (강 / Phase C 12 step scope 폭증)** → session 12차 = step 1~5 한정 / session 13차 = step 6~12 분리
- **STOP-3 (중강 / trigger 영역 결단 부재)** → (d) skill trigger + (a) ad-hoc hybrid paradigm
- **STOP-4 (중 / batch paradigm 부재 시 1.5~2.5시간 비현실적)** → batch paradigm 의무

### session 12차 Q-C 종합 결단 (사용자 "진행하자" 결단 정합)

- **Q-C0 (b)**: B-4 AI-Native 본질 paradigm — Claude Code sub-agent (Task tool / Agent tool) invocation paradigm 본격 채택
- **Q-C-trigger (d)+(a)**: skill trigger + ad-hoc hybrid
- **Q-C-batch**: batch paradigm 의무 — 1회 Task tool 호출 안 전체 BR list 입력
- **Q-C-model**: Sonnet 4.6 (STOP-1 echo chamber 약화)
- **Q-C1 (a)**: `--llm-results <json>` 옵션 신설
- **Q-C2 (a)**: `docs/layer-2-prompt-spec.md` 신설
- **Q-C3 (b)**: Phase D 시 chain 1 gate 통합 (session 12차 scope 축소)
- **Q-C4 (a)**: Layer 1 AND Layer 2 양쪽 통과 의무
- **Q-C5 (a)**: Claude 가 일괄 batch 합성 + Phase D 도메인 전문가 검토 carry

### session 12차 산출 8종

- `tools/br-cross-consistency-validator/src/cli.js` (`--llm-results <path>` 옵션 신설 + Layer 2 LLM 호출 paradigm usage 영역 명시)
- `tools/br-cross-consistency-validator/src/llm.js` (placeholder → 본격 paradigm / semantic_drift_detected finding 신설 + confidence_cap_exceeded finding 신설 / extractLLMMeta 함수 신설)
- `tools/br-cross-consistency-validator/src/validator.js` (Layer 1 AND Layer 2 양쪽 통과 paradigm 본격 / DETERMINISTIC_THRESHOLD 0.85 신설 / overall_score = (L1 + L2) / 2 / summary 영역 확장 / computeDeterministicScore 안 Layer 2 findings 제외 axis 분리)
- `tools/br-cross-consistency-validator/test/validator.test.js` (+5 Layer 2 본격 paradigm test / 31/31 pass)
- `tools/br-cross-consistency-validator/docs/layer-2-prompt-spec.md` (신설 / paradigm 사상 + Task tool 호출 paradigm + batch paradigm 의무 + prompt 본문 + 응답 schema + validator 호출 paradigm + trigger paradigm + 한계 carry)
- `decisions/DEC-2026-05-14-phase-c-step-1-5-layer-2-paradigm-implementation.md` (DEC 신설)
- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-37+38 + §11 후속 patch v6
- `~/.claude/plans/r-v2.5.0-phase-c-layer-2-claude-code-subagent.md` (§0 종결 + §6 한계 갱신)

### 결정적 사실 (session 12차)

| 사실                                        | 자료                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------- |
| **Layer 2 본격 paradigm interface 구현 ✅** | cli.js + llm.js + validator.js / placeholder → 본격 paradigm 격상     |
| **B-4 paradigm 본격 채택 ✅**               | Claude Code sub-agent invocation paradigm / Anthropic API key 의무 ❌ |
| **batch paradigm 의무 명시 ✅**             | docs/layer-2-prompt-spec.md §2 / 1회 Task tool 호출 안 전체 BR list   |
| **Sonnet 4.6 sub-agent model 명시 ✅**      | STOP-1 echo chamber 약화 / F-015 정합                                 |
| **confidence cap 0.85 enforcement ✅**      | Static Tool 시뮬레이션 금지 정책 정합 / advisory 신뢰도 cap           |
| **Layer 1 + Layer 2 통합 점수 paradigm ✅** | Q-C4 (a) / overall_score = (L1 + L2) / 2                              |
| **workspace 전수 test = 308/0**             | session 11차 303 → +5 / 회귀 ❌                                       |

### Lessons Learned 신규 (session 12차 / ADR-CHAIN-011 §9 patch v6 자산화)

- **LL-i-37** ("Claude → Claude self-invocation echo chamber 회피 paradigm = Sonnet 4.6 sub-agent + F-015 cross-validation pattern 정합")
- **LL-i-38** ("Node.js script 안 LLM 직접 호출 ❌ paradigm 본질 / Claude Code sub-agent invocation paradigm 본격 채택")

### chain harness 5 요소 변경 ❌

본 session 12차 시행 영역 = validator interface + prompt spec + test + plan 갱신 + DEC + ADR patch. chain harness 5 요소 (schema / chain-driver / drift-validator / formal-spec-link-validator / spec-test-link-validator) 변경 ❌ 보존.

chain 1 gate Layer 2 통합 (chain-driver gate-eval.js) = session 13차 (Phase C step 9) 영역.

### 다음 step (session 13차 = Phase C step 6~12)

- PoC #03 18 BR NL TODO marker → 본격 BR statement 합성 (Claude Code Task tool / Sonnet 4.6 / batch paradigm) + 도메인 전문가 검토 carry
- PoC #05 2 BR GWT 신규 합성 (sample mode 보존)
- PoC #01 13 BR Layer 2 재검증 (baseline 비교)
- chain 1 gate br-cross-consistency-validator Layer 2 통합 (chain-driver gate-eval.js / chain harness 5 요소 1 변경 의무)
- skills/analysis-br-cross-consistency-check/SKILL.md 신설 (Q-C-trigger (d) 정합)
- Phase C SESSION-WRAPUP
- Phase D = release-readiness 8/8 → 9/9 재격상 + v2.5.0 MINOR release

---

## [v2.4.0 carry update — session 11차 SESSION-WRAPUP — v2.5.0 Phase B 시행] — 2026-05-14 (no release / no version bump / no tag — PoC #03 18 BR 형식 sliding (TCA → GWT) + action = metadata 보존 + NL TODO marker + PoC #05 input/→output/rules/ 이전 + sample_mode meta + description→NL 자동 추출 + Layer 1 threshold 자체 제거 + 303/0 test pass + ≥ 2 PoC corroboration 자격 도달 + DEC 신설 + ADR patch v4 + LL-i-33~35 자산화)

> **session 11차 — v2.5.0 Phase B 시행** — session 9차 신규 carry C-poc-03-05-dual-representation (critical / Senior STOP-1 흡수) + C-keyword-threshold-degrade + session 10차 carry C-poc-02-11-description-to-nl-migration 후속. 4원칙 1단계 plan `~/.claude/plans/q-v2.5.0-phase-b-poc-03-05-마이그레이션.md` 자산화 → 4원칙 2단계 sub-agent 3 병렬 토론 → 4원칙 3단계 사용자 결단 "1" (종합 권장 시행) → 4원칙 4단계 시행 + Lessons Learned. Plan Q §3 Phase B scope 본격 시행.

### session 11차 Q-B 종합 결단 (사용자 "1" 결단 정합)

- **Q-B0 (c)**: scope 축소 시행 (Adzic 함정 회피 + Phase C 진입 자격 자료 확보 + release 지연 회피 균형)
- **Q-B1 (b)**: 형식 sliding only — trigger→When / condition→Given / expected_result→Then / **action = GWT step 분리 ❌ + rejection_method + verification_location metadata 보존** / NL = TODO marker (Phase C LLM 본격 합성 의무 carry)
- **Q-B2 (b)**: PoC #05 `input/rules.json` → `output/rules/rules.json` git mv 이전 + sample_mode meta 명시 (Agent 1 phase-flow SSOT 정합)
- **Q-B3 (b)**: Layer 1 keyword threshold **자체 제거** (session 9차 "0.15 floor advisory" → session 11차 "threshold 비교 자체 ❌") / "non-empty + overlap > 0" sanity check only / `structural_sanity_only` finding 신설 (overlap = 0 시만)
- **Q-B4 (a)+(c)**: PoC #01 13 BR NL self-review 1차 ✅ + Phase D 전 도메인 전문가 검토 carry
- **Q-B5 (b)**: PoC #05 corroboration **산입 ❌** + spot check only (Senior STOP-4 흡수 / n=2 statistical power ≈ 0)
- **Q-B6 (a)**: session 11차 LLM 부재 / Phase C session 12차+ 본격 LLM 호출

### session 11차 산출 8종

- `tools/br-cross-consistency-validator/scripts/synthesize-gwt-from-tca.mjs` (신설 / TCA → GWT 형식 sliding script / Agent 1 Cucumber/Fowler/ECA 3중 외부 권위 정합)
- `examples/poc-03-realworld-nestjs/output/rules/rules.json` (18 BR Phase B 마이그레이션 ✅ / trigger→When / condition→Given / expected_result→Then + action = metadata 보존 + NL TODO marker)
- `examples/poc-05-sample-user-register/output/rules/rules.json` (git mv input/ → output/rules/ + 2 BR description→NL 자동 추출 + meta.sample_mode=true + meta.corroboration_eligible=false)
- `tools/br-cross-consistency-validator/src/deterministic.js` (keyword_mismatch finding 완전 제거 + structural_sanity_only finding 신설 / overlap === 0 시만)
- `tools/br-cross-consistency-validator/src/validator.js` (OVERALL_THRESHOLD deprecated semantic 명시 + Phase C carry)
- `tools/br-cross-consistency-validator/test/validator.test.js` (+2 신규 paradigm test / 26/26 pass / 회귀 ❌)
- `tools/br-cross-consistency-validator/PHASE-B-2026-05-14-re-measurement.md` (재실측 보고 / ≥ 2 PoC corroboration 자료)
- `decisions/DEC-2026-05-14-phase-b-poc-03-05-마이그레이션.md` (DEC 신설)
- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-33~35 + §11 후속 patch v4

### 결정적 사실 (session 11차)

| 사실                                          | 자료                                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **≥ 2 PoC corroboration 자격 도달 ✅**        | PoC #01 (13 BR) + PoC #03 (18 BR) = **31 BR** (Senior STOP-1 흡수 ✅)                           |
| **PoC #01 baseline 격상**                     | deterministic_score 0.608 → **0.954** / gate fail → **pass** (paradigm 정합 격상)               |
| **PoC #03 cross-validation 진입 자격 ✅**     | with_both=18 / 의도된 NL TODO marker = sanity ∅ paradigm 정합                                   |
| **PoC #05 sample mode + corroboration ❌**    | n=2 statistical power ≈ 0 / meta 명시                                                           |
| **workspace 전수 test = 303/0**               | session 10차 302 → +1 신규 paradigm test / 회귀 ❌                                              |
| **Layer 1 threshold 자체 제거 paradigm 정착** | Agent 3 STOP-3 흡수 (magic number 0.15 회피) + MDPI 2025 "no single generalizable cut-off" 정합 |

### Lessons Learned 신규 (session 11차 / ADR-CHAIN-011 §9 정합)

- **LL-i-33** ("TCA 4축 → GWT 3축 형식 sliding paradigm = Cucumber/Fowler/ECA 3중 외부 권위 정합 / action = GWT step 분리 ❌ + metadata 보존")
- **LL-i-34** ("Layer 1 keyword threshold 자체 제거 paradigm / 'non-empty + overlap > 0' sanity check only / Layer 2 LLM mandatory Phase C 의무")
- **LL-i-35** ("industry-first 자격 scope 정정 / dual representation ≠ industry-first (Cucumber Rule 2018 정합) / 4축 → GWT deterministic 합성 + NL ↔ GWT cross-consistency validator = industry-first 자격")

### chain harness 5 요소 변경 ❌

본 session 11차 시행 영역 = PoC 자산 + validator paradigm + ADR §9+§11 patch + DEC 신설 + 자산화. chain harness 5 요소 (schema / chain-driver / drift-validator / formal-spec-link-validator / spec-test-link-validator) 변경 ❌ 보존 ✅.

### 다음 step (session 12차+ / Phase C)

**patch v5 paradigm 회복 (session 11차 후속 / 사용자 결단 "옵션 B")** — Phase C 본격 구현 paradigm = **Claude Code sub-agent (Task tool / Agent tool) invocation** (Anthropic API / OpenAI API 영역 ❌ / 본 방법론 plugin 자산 정합 / Static Tool 시뮬레이션 ❌)

- Layer 2 LLM mandatory 본격 구현 (Claude Code sub-agent 호출 paradigm / B-1 plugin hook 권장 + B-2 chain-driver + B-3 사용자 위임 mode 결단)
- PoC #03 18 BR NL TODO marker → 본격 BR statement 합성 + 도메인 전문가 검토
- PoC #05 2 BR GWT 신규 합성
- chain 1 gate br-cross-consistency-validator Layer 2 통합
- OVERALL_THRESHOLD 의미 재설계 (Layer 1 + Layer 2 통합 점수)
- Phase D = release-readiness 8/8 → 9/9 재격상 + v2.5.0 MINOR release

---

## [v2.4.0 carry update — session 10차 SESSION-WRAPUP — v2.5.0 Phase A 시행] — 2026-05-13~14 (no release / no version bump / no tag — description vs natural_language paradigm 재정의 + schema 강화 (breaking change ❌) + validator paradigm 갱신 + PoC #01 13 BR 자동 마이그레이션 + 302/0 test pass + DEC + ADR patch v3)

> **session 10차 — v2.5.0 Phase A 시행** — session 9차 신규 carry C-description-vs-nl-paradigm-define 흡수. 사용자 결단 "1" (즉시 시행) 정합. Agent 3 (c) hybrid 강 옵션 채택 (session 9차 SPIKE v2 결정적 입증 + memory feedback_quality_priority.md 재작업 최소화 정합). Plan P §3 Phase A scope 본격 시행.

### paradigm 재정의

```
description    = optional metadata (BR statement + rationale + caveat + DRIFT 격상 자유 metadata)
                                       (사람 눈 친화 / characterization context 보존)
                                       (cross-validation 대상 ❌)

natural_language = v2.5.0 권장 표준 (pure BR statement / 1~2 문장 / GWT 동치 의미)
                                            (cross-validation 대상 / Layer 2 LLM mandatory v2.5.0 Phase C)
                                            (rationale/caveat 제외)

cross-validation 대상 = natural_language ↔ given/when/then ONLY
                         (description 제외 / Layer 1 keyword overlap 한계 회피)
```

### session 10차 산출 8종

- `schemas/rules.schema.json` (Phase A paradigm 명세 강화 / allOf.anyOf + item description + natural_language + description field description 모두 강화)
- `tools/br-cross-consistency-validator/src/deterministic.js` (description alias 제거 + description_only_fallback low finding 신설 + hasDescription return 신규)
- `tools/br-cross-consistency-validator/src/validator.js` (withDescriptionOnly stat 신규)
- `tools/br-cross-consistency-validator/test/validator.test.js` (+3 신규 paradigm test / 25/25 pass)
- `tools/br-cross-consistency-validator/scripts/migrate-description-to-natural-language.mjs` (신설 / 3 step stripping / Phase B 재사용 의무)
- `examples/poc-01-realworld-spring/output/rules/rules.json` (13/13 BR 자동 마이그레이션 적용 / description 보존 + natural_language 신규 추출)
- `decisions/DEC-2026-05-14-description-vs-nl-paradigm-재정의.md` (DEC 신설)
- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-31+32 + §11 후속 patch v3

### schema 변경 (breaking change ❌)

- allOf.anyOf description 강화 — "description fallback (v2.5.0 Phase A — backward-compat / Phase B 마이그레이션 carry)" 명세
- item description 강화 — "cross-validation 대상 = natural_language ↔ given/when/then **ONLY** (description 제외)" 명세
- natural_language field description 강화 — "pure BR statement" 명세 + Layer 2 LLM cross-validation 대상 명세
- description field description 강화 — "optional metadata 격상" 명세 (deprecated alias 격하 ❌ → optional metadata 격상)

### validator 변경

- description ↔ natural_language alias 처리 제거 (nlText = NL field only)
- hasDescription 신규 boolean (cross-validation 대상 ❌ / fallback 추적)
- description_only_fallback low finding 신설 (Phase B 마이그레이션 carry 가시화)
- representation_missing 조건 갱신 (description fallback 인정)
- withDescriptionOnly stat 신규 (Phase B 마이그레이션 carry 추적)

### PoC #01 cross-validation 결과 (Phase A pilot 실증)

```
stats:   with_natural_language=13 / with_gwt=13 / with_both=13 / with_description_only=0 / with_finding=13
overlap: mean=0.173 / median=0.105 / max=0.500 (session 9차 SPIKE v2 stripped 결과 그대로 실현)
score:   0.608 / gate: fail (Layer 1 keyword overlap structural sanity 격하 paradigm 입증)
```

### resolved + 신규 carry

**resolved (1)**:

- C-description-vs-nl-paradigm-define (session 9차 carry) → resolved

**신규 carry (2 / Phase B 의무)**:

- **C-poc-01-13-br-nl-human-review** (Phase B carry / 자동 추출 정확 보장 ❌ / 사람 검토 의무)
- **C-poc-02-11-description-to-nl-migration** (Phase B carry / PoC #03 + #05 우선 / ≥ 2 PoC corroboration 정합)

### Lessons Learned 신규 2건

- **LL-i-31** (schema breaking change ❌ + validator paradigm 갱신 = safe 마이그레이션 paradigm / Phase A 시행 입증)
- **LL-i-32** (description ↔ NL paradigm 명세 = paradigm 결단 결정적 사실 / ADR-008 이중 렌더링 사상 확장 명세)

### chain harness 5 요소 변경 ❌ (ADR-CHAIN-001~005 정합)

본 session 10차 = schema paradigm + validator + pilot PoC 마이그레이션 / chain harness 5 요소 변경 ❌.

### test 보존

302/0 pass (+3 신규 paradigm test / 회귀 ❌).

### 다음 step (Phase B = 다음 session)

- PoC #03 dual representation 마이그레이션 (trigger/condition/action → natural_language + given/when/then 신규)
- PoC #05 dual representation 마이그레이션 (description → natural_language + GWT 신규)
- Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하
- ≥ 2 PoC corroboration 자료 확보 (Senior STOP-1 흡수 정합)
- Phase C 진입 자격 도달 (Layer 2 LLM mandatory 본격 구현)

---

## [v2.4.0 carry update — session 9차 SESSION-WRAPUP] — 2026-05-13 (no release / no version bump / no tag — C-threshold-spike-revisit carry 흡수 + Layer 2 LLM 의무 격상 paradigm 결단 + ADR-CHAIN-011 §5.4 patch v2 + SPIKE v2 자산화)

> **session 9차 SESSION-WRAPUP** — session 8차 신규 carry C-threshold-spike-revisit (critical) 즉시 흡수. 4원칙 1단계 plan + 2단계 sub-agent 3 병렬 토론 (Agent 1 공식문서 + Agent 2 빅테크 + Agent 3 Senior critique) + 3단계 사용자 결단 + 4단계 시행 (SPIKE v1 재측정 + SPIKE v2 REVISE-6 + ADR §5.4 patch v2 + DEC 신설). Senior STOP signal 3건 흡수 강도 분리 (STOP-1 단일 PoC §8.1 strict 위반 전면 흡수 / STOP-2 v2.4.0 라벨 강등 soft 흡수 = 라벨 보존 + carry 명시 / STOP-3 Layer 1 단독 = Adzic 폐기 함정 재현 전면 흡수).

### session 9차 핵심 발견

**결정적 실측 자료**:

```
PoC #01 13 BR overlap 분포 (description alias 적용 후 / session 9차 SPIKE v1 재측정):
  min=0.000 p25=0.083 p50=0.162 p75=0.300 p90=0.381 max=0.462 / mean=0.201 / stddev=0.134

  ≥0.85: 0/13 (0%)   hypothesis DEAD (empirical 정면 부정 결정적 사실)
  ≥0.5:  0/13 (0%)
  ≥0.3:  4/13 (31%)

SPIKE v2 (REVISE-6 rationale 제거 후 재측정 / 가설 B 검증):
  원본 mean=0.201 → stripped mean=0.173 → mean delta = -0.028 (오히려 감소)
  → 가설 B 정면 부정 (data quality 차이 ❌ 본질 / semantic 차이 본질)
```

### paradigm 결단 (ADR-CHAIN-011 §5.4 patch v2)

- **≥0.85 hypothesis 정면 폐기** (session 8차 SPIKE v1 + session 9차 SPIKE v1 재측정 + SPIKE v2 + 3 agent 일치 corroboration)
- **Layer 2 LLM 의무 격상 paradigm 채택** (chain 1 gate mandatory / threshold ≥ 0.7 MDPI 2025 paraphrase optimal 정합 / F-015 cross-validation 패턴 / Static Tool 시뮬레이션 금지 정합)
- **Layer 1 결정적 = "structural sanity check" 격하** (두 표현 boolean + id 4토막 + structure 위치 / keyword threshold ≥ 0.15 floor advisory)
- **≥ 2 PoC corroboration carry** (Senior STOP-1 흡수 / PoC #03 + #05 dual representation 적용 후 v2.5.0)
- **v2.4.0 MINOR FINAL 라벨 soft 보존** (Senior STOP-2 / 라벨 강등 ❌ / carry 명시 ✅ / downstream 영향 회피)

### session 9차 산출 5종

- `tools/br-cross-consistency-validator/SPIKE-2026-05-13-v2-rationale-strip.md` (SPIKE v2 report 자산화)
- `tools/br-cross-consistency-validator/scripts/spike-v2-rationale-strip.mjs` (SPIKE v2 시행 script)
- `decisions/DEC-2026-05-13-threshold-spike-revisit-paradigm.md` (DEC 신설)
- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §5.4 patch v2 + §7.3 carry + §9 LL-i-28 + §10 version handling + §11 후속 (session 9차 갱신)
- `~/.claude/plans/o-threshold-spike-revisit.md` (4원칙 1단계 plan / 9 절 / 가설 3 + 결단 Q1~Q5)

### session 9차 resolved + 신규 carry

**resolved (1)**:

- C-threshold-spike-revisit (session 8차 critical carry) → resolved (session 9차 SPIKE v1 재측정 + SPIKE v2 + Layer 2 LLM 의무 paradigm 결단 / implementation carry = C-layer-2-llm-mandatory-paradigm 흡수)

**신규 carry (4)**:

- **C-layer-2-llm-mandatory-paradigm** (critical / v2.5.0 — Layer 2 LLM placeholder → mandatory / ≥ 0.7 / F-015 / no-simulation 정합 / ≥ 2 PoC corroboration 의무)
- **C-poc-03-05-dual-representation** (critical / Senior STOP-1 흡수 / ≥ 2 PoC corroboration 의무 / v2.5.0 의무)
- **C-keyword-threshold-degrade** (medium / Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하 / v2.5.0)
- **C-description-vs-nl-paradigm-define** (v2.5.0 paradigm 결단 / Q2 의 a/b/c — 3 agent 충돌 영역)

### Lessons Learned 신규 3건

- **LL-i-28** ("keyword overlap = structural sanity check / Adzic 폐기 회피 도구 자격 ❌ / Layer 2 LLM 의무 격상" / SPIKE v1+v2 + 3 agent 일치 corroboration)
- **LL-i-29** ("Senior critique STOP signal 강도 분리 흡수 paradigm — 사실 명확도 × 비용 2축 평가")
- **LL-i-30** ("REVISE-6 가설 B 정면 부정 자체가 paradigm 결단 결정적 자료 / 가설 부정 = 다음 가설 강 corroboration")

### chain harness 5 요소 변경 ❌ (ADR-CHAIN-001~005 정합)

본 session 9차 = paradigm 사상 결단 + ADR §5.4 patch v2 + DEC 신설 + 자산화 / chain harness 5 요소 (chain-driver 5 요소) 변경 ❌. Layer 2 LLM mandatory 격상 = v2.5.0 sprint = chain harness 영역 신규 통합.

### 다음 step (v2.5.0 paradigm 본격 도입)

- PoC #03 + PoC #05 dual representation 적용 → cross-validation 자료 ≥ 2 PoC corroboration 확보
- Layer 2 LLM mandatory 본격 구현 (no-simulation 정책 정합 / 외부 LLM API 직접 호출)
- description vs natural_language paradigm 재정의 (Q2 결단)
- Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하
- chain 1 gate br-cross-consistency-validator Layer 2 통합
- release-readiness 8/8 → 9/9 재격상 검토 (Layer 2 통과 criterion 추가)
- v2.5.0 MINOR release

---

## [v2.4.0] — 2026-05-13 (MINOR release — BR dual representation paradigm 본격 도입 + br-cross-consistency-validator workspace 16번째 신설 + chain 1 gate REQUIRED_VALIDATORS_PER_STAGE 통합 + release-readiness §8.1 strict 7/7→8/8 격상 + 11 PoC 호환 회복 (PoC #01 + PoC #05 = VALID) / chain harness 5 요소 변경 ❌ — session 9차 carry 명시 추가: "paradigm rc 도입 / threshold gate 결정 보류 / Layer 2 LLM 의무 carry / ≥ 2 PoC corroboration 의무 carry / v2.5.0 = paradigm 본격 도입")

> **v2.4.0 MINOR FINAL release** — session 8차 + sub-plan §1 + §2 + §3 통합. 4원칙 2원칙 3 sub-agent 토론 (Agent 1 공식문서 + Agent 2 빅테크 + Agent 3 Senior critique) 시행 + Senior STOP signal 1 + REVISE 5 흡수. Senior STOP signal — release-readiness 8/8 격상 자체 chain harness paradigm 재정의 가능성 → MINOR bump 부적격 가능성 보존 / v2.5.0 분리 검토 carry. 단 release 진행 결단 (사용자 의도 정합 / 호환 보존 + 기능 추가 + sub-rule 추가 자격).

### v2.4.0 MINOR 변경 사항

#### ADR-CHAIN-011 본격 작성 — BR dual representation paradigm

`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md`:

- 6갈래 drift 사실 + 사상 발전 history (v1.x GWT → v2.0 source-grounded → v2.1 characterization → v2.3 natural_language → v2.4.0 dual)
- 외부 사례 자릿수 정합 — JSON Schema anyOf 공식 권장 / Adzic SBE 10년 자기 폐기 (본 ADR 핵심 위험 신호) / DMN description+FEEL 동형 / Cucumber description = runtime 무시 (paradigm 다름) / GitHub Spec Kit 90K = dual+cross-validation 미구현 (original empirical 자격) / AWS SCT + Conduktor + Solace validator-first migration / Drools governance 실패 패턴
- dual representation paradigm + Layer 1 결정적 + Layer 2 LLM advisory + threshold ≥ 0.85 empirical
- PoC #04 FE if/then 분기 결정 (단일 schema 유지 / nested anyOf 회피)
- chain 1 gate 통합 + release-readiness §8.1 strict 7/7→8/8 격상 (MINOR bump 부적격 가능성 명시)
- ADR-008 이중 렌더링 사상의 BR 영역 확장 + F-015 cross-validation schema 내재화
- LL-i-22 (schema vs PoC drift = governance 실패) + LL-i-23 (release-readiness 사각지대) + LL-i-24 (두 사상 dilemma → dual paradigm) + LL-i-26 (Adzic 10년 폐기 회피 의무) + LL-i-27 (industry 공백 채우는 original 기여)

#### tools/br-cross-consistency-validator workspace 16번째 신설

- package.json + cli.js + validator.js + deterministic.js + llm.js + test/validator.test.js
- Layer 1 결정적 — 두 표현 ≥ 1 / keyword overlap (intersection/max) / structure 검증 / BR id 4토막 strict
- Layer 2 LLM advisory — placeholder + interface 정의 (Static Tool 시뮬레이션 금지 정책 정합)
- description alias + trigger/condition/action 변형 + GWT string OR array 호환 인정
- severity-weighted deterministic_score + overall_threshold 0.85
- 22/22 unit test pass
- workspace root package.json `workspaces` array 16번째 등록

#### schemas/rules.schema.json top-level 재설계 (v2.4.0)

- top-level anyOf — `business_rules` (표준) / `rules` (v1.x alias 호환) / `rules_manual_authored` (PoC #04 FE alias)
- `project_id` optional 신설
- `paradigm` enum [BE, FE] optional default BE 신설 (Agent 1 F1 nested anyOf 함정 회피)
- item 안 `name` OR `title` anyOf — PoC #05~#11 호환
- item 안 `natural_language` + `given/when/then` + `description` (alias) + `trigger/condition/action` (변형) anyOf
- item 안 v2.x optional fields 흡수 — `source` + `evidence_strength` + `br_type` + `is_intent` + `severity` + `current_state_note` + `domain` + `rejection_method` + `verification_location` 등
- schema-validator unit test 7 신규 (15/15 pass)

#### schemas/meta-confidence.schema.json + rules.schema.json enum 확장 (Senior R5 정합)

- `applied_penalties.name` enum 확장 — `no_operational_db` + `fe_absent` + `external_dep_absent` + `single_module` 추가 (PoC #01 사례)
- `source_evidence.type` enum 확장 — `missing_explicit_policy` + `auth_expression_websec_ignoring` + `missing_negative_test` 추가 (negative space 자연 표현 흡수)
- `rule_conflicts.rule_ids.minItems` 2 → 1 완화 (inconsistent_threshold = 단일 BR 내 위반 사례 / PoC #01 BR-COMMENT-DELETE-001)

#### chain 1 gate 통합 — chain-driver gate-eval.js + findings-aggregator

- `tools/chain-driver/src/gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.planning 안 `br-cross-consistency-validator` 추가
- `tools/findings-aggregator/src/aggregator.js` 안 `transformBrCrossConsistency` 신설 + dispatchValidator 통합
- 26/26 findings-aggregator unit test pass

#### release-readiness §8.1 strict 7/7 → 8/8 격상

- `scripts/release-readiness.js` 안 `check8_analysisValidatorViolation` 신설
- 검사 대상 — schema-validator + br-cross-consistency-validator (PoC #01 + #05 기준 / 11 PoC 전수 = sub-plan §2 후 carry)
- **v2.4.0 = 8/8 pass release-ready ✅**
- 9/9 release-readiness test pass

#### PoC #01 마이그레이션 — INVALID → VALID 회복

- `meta.confidence: 0.78` 추가 (raw_confidence 값 채택)
- PoC #05 = description alias 효과 + meta 정합 = VALID 보존

#### 11 PoC threshold spike critical 발견 (sub-plan §1 시 / 보존)

- `tools/br-cross-consistency-validator/SPIKE-2026-05-13-threshold-distribution.md`
- 11 PoC × 107 BR 안 두 표현 동시 보유 BR = 0 건 (overlap 분포 측정 불가능)
- ≥ 0.85 hypothesis 자료 부재 — sub-plan §2 후 재spike 의무 (C-threshold-spike-revisit carry)

### 신규 carry (v2.4.0 sub-plan §2~§3 carry / 다음 release 후보)

- C-threshold-spike-revisit (critical / overlap 분포 부재 / sub-plan §2 후 재spike)
- C-poc-02-03-schema-mapping (critical / PoC #02 condition+description + PoC #03 trigger+condition+action 매핑 부재 / 사상 결단 의무)
- C-br-cross-validator-Layer2-LLM-impl (Layer 2 LLM 본격 구현)
- C-deterministic-score-formula-revisit (score 산정 식 재해석)
- C-11-PoC-full-migration (잔여 9 PoC 도메인 전문가 위임 영역 — PoC #02/#03 name/title 부재 + PoC #06~#11 id 4토막 재라벨)
- C-v2.5.0-분리-검토 (Senior STOP signal 정합 — release-readiness 격상 = paradigm 재정의 가능성 / MINOR bump 부적격 가능성)

### push 보류 commit 통합 (v2.3.7 ~ v2.4.0)

- `75ee21d` v2.3.7 PATCH (BR pattern 4토막 strict)
- `963dfa0` v2.3.7 후속 patch (schema description 정합)
- `a24a892` v2.4.0-rc1 (dual representation 사상 신설)
- `8101da2` SESSION-WRAPUP session 7차
- `c7dfca5` SESSION-WRAPUP session 8차 (sub-plan §1 — ADR + validator + spike)
- (본 release commit) v2.4.0 MINOR FINAL — sub-plan §2 + §3 + release 자산

---

## [unreleased 사실 보존 / 본 release 직전 commit 자산]

> **session 8차** — v2.4.0-rc1 자격 (session 7차 / commit `a24a892` / dual representation 사상 신설) 직후 사용자 결단 "A (v2.4.0 MINOR 진입)" + sub-agent 토론 권장 결단. 4원칙 2원칙 3 sub-agent 병렬 (Agent 1 공식문서 / Agent 2 빅테크 / Agent 3 Senior critique) 시행 + Senior STOP signal 1 + REVISE 5 흡수 + 시행 순서 통합안 (c→d→a부분) 채택. 본 session = sub-plan §1 (ADR + validator scaffolding + Layer 1 결정적 구현 + threshold spike). schema 변경 + 11 PoC 마이그레이션 + chain-driver 통합 + release = sub-plan §2~§3 다음 session+.

### session 8차 변경 사항 (no version bump / no release)

#### ADR-CHAIN-011 본격 작성 — BR dual representation paradigm

`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` 신설:

- 6갈래 drift 사실 + 사상 발전 history (v1.x GWT → v2.0 source-grounded → v2.1 characterization → v2.3 natural_language → v2.4.0 dual) 명문화
- 외부 사례 자릿수 정합:
  - **JSON Schema anyOf** 공식 권장 (oneOf 비권장)
  - **Gherkin description** = runtime 무시 (본 방법론 paradigm 다름 — 양쪽 executable)
  - **Adzic SBE 10년 자기 폐기** — 본 ADR 핵심 위험 신호 최강 (cross-validator 없으면 동일 폐기 보장)
  - **DMN description + FEEL** = paradigm 정합 (OMG spec 도 cross-consistency 강제 부재 → 본 방법론 보강)
  - **GitHub Spec Kit (90K star)** = dual + cross-validation 미구현 (본 방법론 original empirical 자격)
  - **DMN L1+L3 ladder** = 단계 진화 / 본 방법론 = co-existence 동시 보존 (paradigm 다름 / 신규성)
  - **AWS SCT + Conduktor + Solace** = validator-first migration 빅테크 정합
- dual representation paradigm + Layer 1 결정적 + Layer 2 LLM advisory + threshold ≥ 0.85 empirical hypothesis
- PoC #04 FE if/then 분기 결정 (단일 schema 유지 / nested anyOf 회피 / Agent 1 F1 함정 정합)
- chain 1 gate 통합 + release-readiness §8.1 strict 7/7→8/8 격상 사상 (MINOR bump 부적격 가능성 명시 / v2.5.0 분리 검토 carry)
- ADR-008 이중 렌더링 사상의 BR 영역 확장 + F-015 cross-validation schema 내재화
- LL-i-22~24 (session 7차) + LL-i-26 (Adzic) + LL-i-27 (industry 공백)
- 시행 paradigm = sub-plan §1 (본 session) + §2 (다음) + §3 (그 다음)

#### tools/br-cross-consistency-validator workspace 16번째 신설

`tools/br-cross-consistency-validator/`:

- package.json (workspace 16번째 / v0.1.0)
- src/cli.js + src/validator.js + src/deterministic.js + src/llm.js
- test/validator.test.js (22/22 test pass)
- Layer 1 결정적: 두 표현 ≥ 1 의무 / keyword overlap (intersection / max) / structure 검증 (given 안 결과 키워드 ❌ + when 안 전제 키워드 ❌) / BR id 4토막 strict
- Layer 2 LLM advisory: placeholder + interface 정의 (Static Tool 시뮬레이션 금지 정책 정합 / 다음 session 실 구현)
- severity-weighted deterministic_score 산정 + overall_threshold 0.85
- workspace root package.json `workspaces` array 16번째 등록 (description "v2.4 chain harness 16 tools workspace" 갱신)

#### threshold spike critical 발견 — `tools/br-cross-consistency-validator/SPIKE-2026-05-13-threshold-distribution.md`

- 11 PoC × 107 BR 일괄 측정 결과 — **두 표현 동시 보유 BR = 0 건 / 모든 PoC** = overlap_distribution 측정 자체 불가능
- ≥ 0.85 hypothesis confirm 자료 부재 (Senior critique R2 정합 강력 / magic number 거부)
- 6갈래 drift 직접 검증:
  - PoC #01 GWT 풍부 → ✅ pass / score 1.0
  - PoC #02 condition+description + PoC #03 trigger+condition+action → validator + schema 매핑 부재 신규 발견
  - PoC #04 FE → rules array 자체 부재 (if/then 분기 carry 정합)
  - PoC #05+#06 description → representation_missing
  - PoC #07~#11 natural_language → ⚠️ id_pattern_violation 43건 (v2.3.7 enforcement 정합)
- ADR-CHAIN-011 §5.4 patch (spike 결과 반영 + 신규 carry 2건 + deterministic_score 산정 anomaly 명시)

### 신규 carry (session 8차)

- C-threshold-spike-revisit (critical / sub-plan §2 후 재spike)
- C-poc-02-03-schema-mapping (critical / PoC #02 condition+description + PoC #03 trigger+condition+action 매핑 부재)
- C-br-cross-validator-Layer2-LLM-impl (sub-plan §2)
- C-deterministic-score-formula-revisit (sub-plan §2 후)

### 다음 session = sub-plan §2

- schema top-level 재설계 (project_id + business_rules)
- PoC #04 FE if/then 분기 본격 구현
- 1~2 PoC pilot 마이그레이션 (PoC #01 BE + PoC #04 FE 권장 / §8.1 strict 정합)
- drift-validator + br-cross-consistency-validator 양쪽 통과 확인
- 잔여 9 PoC 마이그레이션
- Layer 2 LLM 본격 구현
- 사용자 의도 — "마이너 release 자격 도달 시 배포 작업" / sub-plan §2 종결 → sub-plan §3 (chain 1 gate 통합 + release-readiness 격상 검토) → v2.4.0 MINOR release (v2.5.0 분리 검토 carry 정합 / Senior STOP signal 정합)

---

## v2.3.x and earlier

→ v2.3.7 ~ v1.4.0 release entry + v1.4.0-dev + v1.3.x ~ v1.0 = [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md).

본 파일 (v2.4+) 상단 = 현재 release entry. v2.3.7 이하 격리 = 2026-05-14 cleanup.
