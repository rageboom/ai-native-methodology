# DEC-2026-05-24-v905-poc-rules-rename-sweep

> **일자**: 2026-05-24
> **session**: 43차 (현 session) / v9.0.5 PATCH release
> **카테고리**: poc-corrective / F-MB-POC-001 carry 시행 (v7.0.0 rules.json → business-rules.json rename PoC 산출물 미전파 sweep)
> **상태**: 승인 (★ 사용자 "진행 하자" → "A. 모두 순차 (3 release)" 묶음 결단 + Y "별 axis carry" scope 결단 2026-05-24)
> **Amends**: 없음 (additive doc / breaking 0)
> **Resolves**: F-MB-POC-001 (5 PoC 산출물 안 rules.json → business-rules.json 미전파 + poc-03 cross_links repo-absolute convention)

---

## 1. 배경

v9.0.4 release commit `ef16951` 의 차기 session carry "F-MB-POC-001 poc-03 산출물 drift 별 plan". 사용자 결단 "다음 session carry G axis 진행하자" → "A. 모두 순차 (3 release)" → Phase 1 = v9.0.5 PATCH F-MB-POC-001.

audit plan: `~/.claude/plans/g-axis-fsim-003-deeper-fact.md` §부산물 발견 (poc-03)

## 2. 시행 직전 사실 검증 보강 결과 (LL-fsim-11 paradigm 본격 재발 v4)

1차 carry note: "poc-03 산출물 drift 별 plan" — single PoC 가정.

★ 본 plan 작성 시 사실 검증 결과 = 1차 등재 보다 더 광범위한 drift 발견 (4회 연속 재발 / paradigm enforcement 본격 입증대 v4):

| PoC | broken paths (v9.0.4 baseline) | 표기 |
|---|---|---|
| poc-03 | 2 broken (`output/rules/rules.json`) + 8 repo-absolute | rules.json + cross_links repo-absolute |
| poc-06 | 2 broken (`input/rules.json`) | rules.json |
| poc-07 | 2 broken (`input/rules.json`) | rules.json |
| poc-08 | 10 broken (`input/rules.json` + 9 추가) | rules.json + path 안 메타 embed (★ ★ F-MB-POC-002 carry) |
| poc-11 | 11 broken (`input/rules.json` + 7 추가) | rules.json + "[source absolute]" prefix (★ ★ F-MB-POC-002 carry) |

→ ★ ★ ★ **F-MB-POC-001 본격 scope = 5 PoC**. F-PA-002 (skill 13 + workflow 5 + schema $id) 의 ★ PoC 산출물 axis sub-finding.

## 3. 결단 (사용자 묶음 결단 2026-05-24)

| # | 결단 | 채택 |
|---|---|---|
| D1 | F-MB-POC-001 5 PoC sweep (poc-03 + 06/07/08/11) `input/rules.json` → `input/business-rules.json` + poc-03 cross_links repo-absolute → PoC root relative | ✅ |
| D2 | poc-08 잔여 9 broken paths (path 안 메타 embed) + poc-11 잔여 7 broken paths ("[source absolute]" prefix) = ★ ★ F-MB-POC-002 후보 별 carry (Senior 의도 의문 cooling-off 권장) | ✅ |
| D3 | v9.0.5 PATCH release ceremony (additive doc / breaking 0) | ✅ |

## 4. 시행 자산

### 4.1 F-MB-POC-001 시행 (5 PoC sweep)

**poc-03 (special case — 2 종류 drift)**:
- `examples/poc-03-realworld-nestjs/.aimd/output/planning-spec.json` — `examples/poc-03-realworld-nestjs/` repo-absolute prefix 제거 + `output/rules/rules.json` → `output/rules/business-rules.json` (replace_all sweep)
- `examples/poc-03-realworld-nestjs/.aimd/output/behavior-spec.json` — 동형 sweep
- `examples/poc-03-realworld-nestjs/.aimd/output/test-spec.json` — `examples/poc-03-realworld-nestjs/` prefix 제거

**poc-06/07/08/11 (rules.json rename 만)**:
- `examples/poc-06-efiweb-exchange-spring41/.aimd/output/planning-spec.json` — `input/rules.json` → `input/business-rules.json`
- `examples/poc-07-efiweb-capital-spring41/.aimd/output/planning-spec.json` — 동형
- `examples/poc-08-realworld-mybatis/.aimd/output/planning-spec.json` — 동형
- `examples/poc-11-efiweb-billing-spring41/.aimd/output/planning-spec.json` + `behavior-spec.json` — 동형

### 4.2 검증 (PoC self-corroboration)

| PoC | v9.0.4 baseline | v9.0.5 after | 정합 |
|---|---|---|---|
| poc-03 | 10 broken | **0 broken** ✅ | full fix |
| poc-06 | 2 broken | **0 broken** ✅ | full fix |
| poc-07 | 2 broken | **0 broken** ✅ | full fix |
| poc-08 | 10 broken | 9 broken (rules.json 1 fix / path 안 메타 embed 9 잔여) | partial fix / F-MB-POC-002 carry |
| poc-11 | 11 broken | 7 broken (rules.json 4 fix / "[source absolute]" 7 잔여) | partial fix / F-MB-POC-002 carry |

★ ★ ★ self-corroboration ≥ 3 PoC full fix (poc-03+06+07) = §8.1 strict 정합 ✓.

### 4.3 F-MB-POC-002 carry (별 axis / 본 v9.0.5 외)

**poc-08 잔여 9 broken**: path string 안 메타 embed (예: `"input/business-rules.json (8 BR / BR-PETSTORE-ACCREG-001~008)"` = path + 공백 + 괄호 부연). 다른 PoC = path 만. ★ poc-08 단독 별 convention drift.

**poc-11 잔여 7 broken**: `"[source absolute] src/main/java/..."` prefix marker. 다른 PoC = "source/..." 로 시작 (PoC root relative). ★ poc-11 단독 marker convention 가능성 — Senior 의도 의문 (cooling-off ≥ 24h 권장).

★ ★ 두 잔여 = F-MB-POC-002 후보 (별 plan). 본 v9.0.5 외 carry.

### 4.4 v9.0.5 release ceremony

| 영역 | 갱신 |
|---|---|
| `examples/poc-03-realworld-nestjs/.aimd/output/{planning,behavior,test}-spec.json` | drift sweep (2 종류) |
| `examples/poc-{06,07,08}-*/​.aimd/output/planning-spec.json` | rules.json → business-rules.json sweep |
| `examples/poc-11-*/​.aimd/output/{planning,behavior}-spec.json` | rules.json → business-rules.json sweep |
| `.claude-plugin/plugin.json` + `package.json` | 9.0.4 → 9.0.5 |
| `CHANGELOG.md` | v9.0.5 entry |
| `CLAUDE.md` | line 100 + 118 + v9.0.4 entry 직전 release 이동 |
| `decisions/DEC-2026-05-24-v905-poc-rules-rename-sweep.md` | 본 파일 신설 |
| `decisions/INDEX.md` + `STATUS.md` | 등재 |

## 5. STOP-3 hard gate 실측

| Gate | 결과 |
|---|---|
| workspace test | 698/698 pass (보존 / PoC 산출물 변경 = test 무관) ✅ |
| chain-coverage-validator | 38/38 (보존) ✅ |
| poc-03 / poc-06 / poc-07 direct invoke | 14+2+2 → **0+0+0** ✅ (3 PoC full fix self-corroboration) |
| release-readiness | **16/16 ready:true** ✅ |
| skill-citation | 0 stale ✅ |
| drift-validator | 0 breaking (보존) ✅ |
| version 3-way | plugin.json 9.0.5 / package.json 9.0.5 / CLAUDE.md "plugin.json v9.0.5" ✅ |
| breaking | 0 = PATCH (additive doc / PoC 산출물 path 표기 정정만 / 기존 의무 제거 0) |

## 6. Lessons Learned 신규

- **LL-v905-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v4 (LL-fsim-11 + LL-v902-01 + LL-v903-01 + LL-v904-01 정합 / 4회 연속 재발 / paradigm enforcement 본격 입증대 v4). v9.0.4 carry note "poc-03 산출물 drift 별 plan" single PoC 가정이 시행 직전 사실 검증 시 5 PoC 광범위 drift 로 진화 + poc-08/11 더 깊은 별 convention drift 추가 발견.
- **LL-v905-02** — Senior 의도 의문 cooling-off paradigm 본격 정착 (poc-11 "[source absolute]" prefix marker). 단순 정정 보다 의도 의문 → cooling-off 권장 = ★ Adzic SBE 함정 회피 cadence 정합 (v9.0.4 strict_mode 전환 carry 동형 패턴).
- **LL-v905-03** — partial fix + carry 명시 paradigm. v9.0.5 = 3 PoC full fix + 2 PoC partial fix + carry 정직 표기. self-corroboration ≥ 3 PoC 충족 (§8.1 strict) + 잔여 별 carry F-MB-POC-002.

---

**참고**:
- v9.0.4 release: `ef16951` (commit) + `v9.0.4` (tag) — DEC-2026-05-24-v904-fsim-003-deeper-fact
- v9.0.5 plan: `~/.claude/plans/g-axis-fsim-003-deeper-fact.md` §부산물
- 본 session (43차) 누적 3 release = v9.0.3 + v9.0.4 + v9.0.5
- 차기 session carry (deadline 없음):
  - **F-MB-POC-002** (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / Senior 의도 의문 cooling-off ≥ 24h)
  - **LL-v903-01 + LL-v903-03 follow-up** = v9.0.6 Phase 2 (drift-validator hard gate + release-readiness #1 marketplace.json grep)
  - **F-SIM-003 strict_mode v+1 default 전환** = v9.0.7 Phase 3 (본 v9.0.5 fix 후 자연 가능)
