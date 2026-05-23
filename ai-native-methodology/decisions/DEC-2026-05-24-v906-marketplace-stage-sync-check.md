# DEC-2026-05-24-v906-marketplace-stage-sync-check

> **일자**: 2026-05-24
> **session**: 43차 (현 session) / v9.0.6 MINOR release
> **카테고리**: enforcement-additive / Phase 2 LL-v903 follow-up 묶음 (LL-v903-01 scope-out + LL-v903-03 시행 + LL-v906-01/02 자산화)
> **상태**: 승인 (★ 사용자 "진행 하자" → "A. 모두 순차" → "1. LL-v903-01 scope-out + LL-v903-03 만 시행" 묶음 결단 2026-05-24)
> **Amends**: 없음 (additive enforcement / breaking 0)
> **Resolves**: LL-v903-03 (release-readiness #17 marketplace.json description ↔ chain stage sync 추가) + LL-v903-01 close (사실 오류 / 이미 hard gate)

---

## 1. 배경

v9.0.5 release commit `2a49fbb` 의 차기 session carry "LL-v903-01 + LL-v903-03 follow-up = v9.0.6 Phase 2 (drift-validator hard gate + release-readiness #1 marketplace.json grep)". 사용자 결단 "진행 하자" → "A. 모두 순차 (3 release)" → Phase 2 = v9.0.6.

audit plan: `~/.claude/plans/g-axis-fsim-003-deeper-fact.md` §carry

## 2. 시행 직전 사실 검증 보강 결과 (LL-fsim-11 paradigm 본격 재발 v5)

1차 carry note (v9.0.3 commit `8f4d37b` + v9.0.4 carry):
> LL-v903-01 follow-up — drift-validator phase-flow breaking exit ≥ 1 hard gate 전환 v+1 (silent sink 해소)

★ 본 plan 작성 시 사실 검증 결과 = 1차 등재 ★ 사실 오류 발견 (5회 연속 재발 / paradigm enforcement 본격 입증대 v5):

### 2.1 drift-validator 실 exit code logic

`tools/drift-validator/src/cli.js:292`:
```js
process.exit(totals.breaking > 0 || totals.errors > 0 ? 1 : 0);
```

★ ★ **이미 hard gate** — breaking > 0 시 exit 1 / errors > 0 시 exit 1 / 그 외 exit 0.

### 2.2 v9.0.3 점검 결과 "exit 0" 보고의 사실

v9.0.3 plan 안 점검 명령:
```
node tools/drift-validator/src/cli.js flows/analysis.phase-flow.json 2>&1 | tail -30; echo "EXIT=$?"
```

★ ★ ★ **`$?` = ★ tail 의 exit code (= 0 / 정상)**, drift-validator 자체 exit code 가 아님. bash pipe `|` 의 마지막 명령 exit 가 반환.

### 2.3 사실 검증 결단력 있는 결론

★ **LL-v903-01 = ★ 사실 오류** (silent sink 가정 ❌). drift-validator 는 ★ 이미 정상 hard gate. carry note 작성 시 bash pipe + tail exit code 의 사실 misunderstand.

★ **LL-v906-01 자산화 (paradigm enforcement 본격 입증대 v5)**: 시행 직전 사실 검증 보강 paradigm 5회 연속 재발 (LL-fsim-11 + LL-v902-01 + LL-v903-01(scope-out) + LL-v904-01 + LL-v905-01 + ★ LL-v906-01). carry note 자체의 사실도 검증 의무 / bash + pipe + exit code 의 사실 misunderstand 회피 cadence.

## 3. 결단 (사용자 묶음 결단 2026-05-24)

| # | 결단 | 채택 |
|---|---|---|
| D1 | LL-v903-01 scope-out (★ 사실 오류 / 이미 hard gate / LL-v906-01 자산화) | ✅ |
| D2 | LL-v903-03 시행 — release-readiness check17 신설 (marketplace.json description ↔ chain 6-stage sync) | ✅ |
| D3 | release-readiness test stale (13 → 17 미갱신 silent sink) 동반 정정 — LL-v906-02 자산화 | ✅ (자연 흡수) |
| D4 | v9.0.6 MINOR release (criterion add precedent v8.6.0/v8.9.0 일관) | ✅ |

## 4. 시행 자산

### 4.1 LL-v903-03 시행 (check17 신설)

`scripts/release-readiness.js` 안 `check17_marketplaceStageSync()` 함수 신설:
- 검사 대상: `.claude-plugin/marketplace.json` 의 `plugins[0].description`
- 검사 axes 3종:
  - ① "6단계 chain harness" 또는 "6-stage chain harness" 표기 (regex pattern)
  - ② 5 stage name (discovery/spec/plan/test/implement) 모두 포함
  - ③ legacy "planning →" 표기 미포함
- 결과 pass: 3 axes 모두 충족
- delegated_to: marketplace.json description ↔ current 6-stage chain harness sync (LL-v903-03 / sweeping MAJOR stage change cascade enforcement)

`scripts/release-readiness.js:main()` 안 `results = [...]` array 에 `check17_marketplaceStageSync()` 추가.

### 4.2 LL-v906-02 자산화 (silent test sink 발견 + 정정)

★ ★ `scripts/test/release-readiness.test.js` 가 hard-coded 13 expect — 실 16 → 17. workspace test (`npm test --workspaces`) 가 scripts/test/ 미포함 = silent test sink.

**시행**: hard-coded 13 → 17 갱신 (3 location) + criterion ids array 13 → 17 갱신 (code_pointer_coverage + graph_integrity + preflight_tools + marketplace_stage_sync 4 추가).

**검증**: `node --test scripts/test/release-readiness.test.js` → 14/14 pass ✅ (이전 10 pass / 4 fail).

**LL-v906-02**: scripts/test/ 는 workspace test 외 = silent sink. v+1 carry — scripts/test/ workspace test 안 통합 또는 별 hook gate (release-readiness #18 후보 / 자기 test 통과 의무 enforcement).

### 4.3 release ceremony

| 영역 | 갱신 |
|---|---|
| `scripts/release-readiness.js` | check17_marketplaceStageSync 신설 + main results array |
| `scripts/test/release-readiness.test.js` | 13 → 17 (3 location + ids array) |
| `.claude-plugin/plugin.json` + `package.json` | 9.0.5 → 9.0.6 |
| `CHANGELOG.md` | v9.0.6 MINOR entry |
| `CLAUDE.md` | line 100 + 118 + v9.0.5 entry 직전 release 이동 |
| `decisions/DEC-2026-05-24-v906-marketplace-stage-sync-check.md` | 본 파일 신설 |
| `decisions/INDEX.md` + `STATUS.md` | 등재 |

## 5. STOP-3 hard gate 실측

| Gate | 결과 |
|---|---|
| workspace test | 698/698 pass (보존 / scripts/test/ 미포함 = LL-v906-02 carry) ✅ |
| release-readiness.test.js | 10/14 → **14/14 pass** ✅ (LL-v906-02 stale fix) |
| release-readiness | 16/16 → **17/17 ready:true** ✅ (check17 신설 통과) |
| chain-coverage-validator | 38/38 (보존) ✅ |
| skill-citation | 0 stale (보존) ✅ |
| drift-validator | 0 breaking (보존 / 본 v9.0.6 = 도구 미변경) ✅ |
| version 3-way | plugin.json 9.0.6 / package.json 9.0.6 / CLAUDE.md "plugin.json v9.0.6" ✅ |
| breaking | 0 = MINOR (additive criterion / 기존 의무 제거 0 / criterion add precedent v8.6.0/v8.9.0 일관) |

## 6. Lessons Learned 신규

- **LL-v906-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v5 (5회 연속 재발 / LL-fsim-11 + LL-v902-01 + LL-v903-01(scope-out 본격 입증) + LL-v904-01 + LL-v905-01 정합). LL-v903-01 carry note "drift-validator silent sink" 가 시행 직전 사실 검증 시 ★ bash pipe + tail exit code 의 사실 misunderstand 로 드러남. **paradigm enforcement 본격 입증대 v5** = ★ carry note 자체도 검증 의무 / Adzic SBE 10년 폐기 함정 회피.

- **LL-v906-02** — silent test sink paradigm 본격 발견 (scripts/test/ 가 workspace test 외 / npm test --workspaces 미포함). release-readiness.test.js 가 hard-coded 13 → 실 17 stale 누적 carry. v+1 carry — scripts/test/ workspace test 안 통합 또는 별 hook gate enforcement.

- **LL-v906-03** — criterion add cadence paradigm 본격 정착 (v8.6.0 → v8.9.0 → v9.0.6 일관 MINOR / criterion add = MINOR bump precedent). additive enforcement = 기존 의무 제거 0 = breaking 0 = MINOR (semver 정합).

---

**참고**:
- v9.0.5 release: `2a49fbb` (commit) + `v9.0.5` (tag) — DEC-2026-05-24-v905-poc-rules-rename-sweep
- v9.0.6 plan: `~/.claude/plans/g-axis-fsim-003-deeper-fact.md` §Phase 2
- 본 session (43차) 누적 4 release = v9.0.3 + v9.0.4 + v9.0.5 + v9.0.6
- 차기 session carry (deadline 없음):
  - **F-MB-POC-002** (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / cooling-off ≥ 24h)
  - **LL-v906-02 follow-up** (scripts/test/ silent sink — workspace 통합 또는 hook gate)
  - **F-SIM-003 strict_mode v+1 default 전환** = v9.0.7 Phase 3 (본 session 안 시행 중)
