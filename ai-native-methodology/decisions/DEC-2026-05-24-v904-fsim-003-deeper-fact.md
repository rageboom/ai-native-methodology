# DEC-2026-05-24-v904-fsim-003-deeper-fact

> **일자**: 2026-05-24
> **session**: 43차 (현 session) / v9.0.4 PATCH release
> **카테고리**: tool-corrective / v9.0.3 G axis carry F-SIM-003 시행 직전 사실 검증 보강 → 더 깊은 fact-mismatch (chain-coverage-validator default projectRoot 결함) 본격 fix
> **상태**: 승인 ( 사용자 "다음 session carry G axis 진행하자" 2026-05-24 / cooling-off skip 결단 / 묶음 결단 3 cluster — B-1 + F-MB-VAL-001 + v9.0.4 PATCH)
> **Amends**: 없음 (additive tool fix / breaking 0)
> **Resolves**: F-MB-VAL-001 (chain-coverage-validator default projectRoot 결함 / 1차 F-SIM-003 carry 보다 더 깊은 fact)

---

## 1. 배경

v9.0.3 release commit `8f4d37b` 의 차기 session carry "G axis F-SIM-003 strict_mode 별도 plan (cooling-off ≥ 24h / poc-05 산출물 vs 도구 path resolution base 분리 검증)" 의 후속 시행. 사용자 결단 "다음 session carry G axis 진행하자" → cooling-off skip 결단 (precedent: v8.14.1 cadence 정합).

audit plan: `~/.claude/plans/g-axis-fsim-003-deeper-fact.md`

## 2. 시행 직전 사실 검증 보강 결과 (LL-fsim-11 paradigm 재발 / v9.0.2 동형 패턴)

L1 점검 1차 carry note: "F-SIM-003 v+1 default strict_mode 전환 carry / poc-05 14 broken paths / 산출물 vs 도구 결함 분리 검증 필요".

본 plan 작성 시 사실 검증 결과 = 1차 등재 보다 더 깊은 fact-mismatch 발견.

### 2.1 산출물 cross-ref path convention (5 PoC self-corroboration)

| PoC         | derivation_source.source_artifacts 예시                                              | convention    |
| ----------- | ------------------------------------------------------------------------------------ | ------------- |
| poc-03      | `output/rules/rules.json`, `output/domain/domain.json`                               | PoC root 기준 |
| poc-04-mini | `analysis/0-init/inventory.json`, `analysis/5-2-a-ui-base/ui-spec.json`              | PoC root 기준 |
| poc-05      | `output/rules/business-rules.json`, `input/domain.json`, `source/src/user.legacy.ts` | PoC root 기준 |
| poc-14      | `output/rules/business-rules.json`, `source/main.py`                                 | PoC root 기준 |

→ **5 PoC 모두 PoC root 기준 convention 일관**. 산출물 자체는 정상.

### 2.2 chain-coverage-validator default projectRoot 결함

- `tools/chain-coverage-validator/src/cli.js:66` (v9.0.3):
  ```
  const projectRoot = args.projectRoot ?? dirname(args.behavior ?? args.planning);
  ```
- → behavior 산출물 위치가 `.aimd/output/behavior-spec.json` 이면 default projectRoot = `.aimd/output/`
- → relative path "output/rules/..." resolve = `.aimd/output/output/rules/...` ( output prefix 중복)

### 2.3 결단력 있는 결론

** 본격 결함 = chain-coverage-validator default projectRoot 잘못 (도구 결함)**. 산출물 path convention 은 5 PoC 모두 일관 정상. 의도 (산출물 = PoC root 기준) 와 도구 default (= 산출물 dirname) mismatch.

1차 carry note "strict_mode v+1 default 전환" 은 별 axis valid 후보 — 그러나 본 결함 fix 전에 strict_mode 전환만 하면 false positive 14 broken paths 가 high blocking 으로 격상 = 다른 PoC 도 같은 false positive 가능 ( 본격 함정 / Adzic SBE 함정 회피 필요).

## 3. 결단 (사용자 묶음 결단 2026-05-24)

| #   | 결단                                                                                                               | 채택 |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---- |
| D1  | fix 옵션 B-1 default auto-detect (`.aimd/output/` 패턴 자동 거슬러 PoC root / additive / fallback backward-compat) | ✅   |
| D2  | finding ID = F-MB-VAL-001 별 등재 (methodology-body validator drift namespace / F-MB-DRIFT-001 동형 패턴)          | ✅   |
| D3  | v9.0.4 PATCH release ceremony (corrective / breaking 0 / v9.0.2+v9.0.3 동형 cadence)                               | ✅   |
| D4  | F-SIM-003 strict_mode v+1 default 전환 carry = 별 axis 보존 (본 v9.0.4 외)                                         | ✅   |

## 4. 시행 자산

### 4.1 F-MB-VAL-001 시행 (medium / 도구 default 결함 / 5 PoC corroboration)

**도구 fix**:

- `tools/chain-coverage-validator/src/validator.js` — `autoDetectProjectRoot(specPath)` 함수 신설 + export. `.aimd/output/` 패턴 시 `dirname(p)/../..` → PoC root 자동 감지. fallback: dirname(p) backward-compat. Windows backslash + Unix slash 모두 처리.
- `tools/chain-coverage-validator/src/cli.js` — `dirname` import 제거 + `autoDetectProjectRoot` import 추가. line 66: `args.projectRoot ?? autoDetectProjectRoot(args.behavior ?? args.planning)`. help text 갱신.
- `tools/chain-coverage-validator/test/validator.test.js` — 신규 describe block 4 test 추가 (autoDetectProjectRoot):
  1. `.aimd/output/<file>.json` 패턴 자동 감지 (Unix forward slash)
  2. Windows backslash path 자동 감지
  3. non-.aimd/output → fallback dirname backward-compat
  4. null/empty/undefined 입력 방어
- `tools/chain-coverage-validator/package.json` — version 0.2.0 → 0.3.0 + description 갱신.

**검증**:

| PoC                                          | v9.0.3 (before)        | v9.0.4 (after)                       |
| -------------------------------------------- | ---------------------- | ------------------------------------ |
| poc-05 직접 invoke (비명시 `--project-root`) | 14 MEDIUM broken paths | **0 broken paths** ✅                |
| poc-04-mini                                  | 0 broken paths         | 0 broken paths (회귀 ❌) ✅          |
| poc-14                                       | 0 broken paths         | 0 broken paths (회귀 ❌) ✅          |
| poc-03                                       | (별 axis drift)        | (별 axis drift / 본 v9.0.4 외 carry) |

### 4.2 부산물 발견 — poc-03 산출물 별 axis drift (본 v9.0.4 외 carry)

poc-03 비명시 invoke 시 본 fix 후에도 잔여 broken paths 발견:

```
MEDIUM [chain.cross_links.broken_path_warning] behavior.cross_links.to_analysis_artifacts:
  "examples/poc-03-realworld-nestjs/output/rules/rules.json" (실 파일 = business-rules.json)
LOW [chain.cross_links.path_convention_repo_absolute] x2 — repo-absolute convention 사용
```

본 잔여 = 두 종류 drift:

- ① **poc-03 산출물 안 `rules.json` → `business-rules.json` v7.0.0 rename 미전파** ( F-PA-002 처분 대상 SKILL.md 13 + workflow 5 + schema $id 였으나 PoC 산출물은 미포함)
- ② **poc-03 산출물 cross_links 가 repo-absolute convention 사용** ("examples/poc-03-.../output/..."). 다른 PoC 는 PoC root relative — poc-03 만 다름

  본 잔여 = **F-MB-POC-001 후보** (poc-03 산출물 안 cross_links drift / 본 v9.0.4 외 carry / 별 plan).

### 4.3 release ceremony

| 영역                                                     | 갱신                                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `tools/chain-coverage-validator/{src,test,package.json}` | autoDetectProjectRoot + 4 test + version 0.2.0 → 0.3.0                                                        |
| `.claude-plugin/plugin.json`                             | 9.0.3 → 9.0.4                                                                                                 |
| `package.json` (workspace root)                          | 9.0.3 → 9.0.4                                                                                                 |
| `CHANGELOG.md`                                           | v9.0.4 PATCH entry                                                                                            |
| `CLAUDE.md`                                              | line 100 plugin.json v9.0.3 → v9.0.4 + line 118 "현재 v" 갱신 + v9.0.3 entry 를 "직전 release 요약" 으로 이동 |
| `decisions/DEC-2026-05-24-v904-fsim-003-deeper-fact.md`  | 본 파일 신설                                                                                                  |
| `decisions/INDEX.md`                                     | 본 DEC 최상단 등재                                                                                            |
| `decisions/STATUS.md`                                    | session 43차 v9.0.4 entry (v9.0.3 entry 위)                                                                   |

## 5. STOP-3 hard gate 실측

| Gate                                | 결과                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| workspace test                      | 694/694 → **698/698 pass** ✅ (autoDetectProjectRoot 4 신규 test additive)      |
| chain-coverage-validator test       | 34/34 → **38/38 pass** ✅                                                       |
| poc-05 direct invoke (비명시)       | 14 broken → **0 broken** ✅ (본격 fix 입증)                                     |
| PoC self-corroboration              | 3 PoC (poc-05+04-mini+14) 0 broken paths ✅ (≥ 2 충족 / §8.1 strict 정합)       |
| release-readiness                   | **16/16 ready:true** ✅                                                         |
| skill-citation                      | 0 stale ✅                                                                      |
| drift-validator analysis.phase-flow | 0 breaking ✅ (v9.0.3 안 정합 보존)                                             |
| version 3-way                       | plugin.json 9.0.4 / package.json 9.0.4 / CLAUDE.md "plugin.json v9.0.4" ✅      |
| breaking                            | 0 = PATCH (additive tool fix / 도구 default 결함 corrective / 기존 의무 제거 0) |

## 6. Lessons Learned 신규

- **LL-v904-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v3 (LL-fsim-11 + LL-v902-01 정합 / 3회 연속 재발). v9.0.3 carry note "F-SIM-003 v+1 default strict_mode 전환" 이 1차로 등재되었으나 시행 직전 사실 검증 보강 시 더 깊은 fact-mismatch 발견 — 본격 결함 = 도구 default projectRoot mismatch (5 PoC self-corroboration 입증 / strict_mode 전환 carry 와 본질 다름). **paradigm enforcement 본격 입증대** = main agent self-fact-check 의무 + carry note 의 ambiguity 해소 cadence 본격 정착 v3.

- **LL-v904-02** — silent sink paradigm 의 deeper layer 발견 (LL-v903-01 확장 / dep-graph silent sink 표면화 paradigm 동형). v9.0.3 의 silent drift sink = "drift-validator emit breaking 하지만 exit 0 = cascade 안 됨" / v9.0.4 의 silent sink = "도구 default mismatch 가 release-readiness 가 invoke 안 함 → 사용자 직접 invoke 시 14 false positive 발생 → carry note 로 silent 등재". 두 paradigm 모두 = 결정적 도구 enforcement 가 본격 hook gate cascade 안 될 때 silent sink 잔존 — release-readiness #1 marketplace.json + chain-coverage-validator direct invoke 모두 v+1 carry 후보.

- **LL-v904-03** — PoC self-corroboration ≥ 2 paradigm 본격 입증 (§8.1 strict 정합). 본 fix 의 결정적 입증대 = 5 PoC convention 일관 + 도구 default mismatch self-corroboration ≥ 2 (poc-05+04-mini+14 0 broken paths) + 부산물 발견 (poc-03 별 axis drift = F-MB-POC-001 후보 carry). **본격 입증 paradigm cadence**: 도구 fix → 다중 PoC 직접 invoke → 회귀 0 입증 + 부산물 carry 명시.

---

**참고**:

- v9.0.3 release: `8f4d37b` (commit) + `v9.0.3` (tag) — DEC-2026-05-24-v903-l1-flow-audit-carry-corrective
- v9.0.4 plan: `~/.claude/plans/g-axis-fsim-003-deeper-fact.md`
- 본 session (43차) 누적 2 release = v9.0.3 (L1 audit carry) + v9.0.4 (G axis carry / 본 release)
- 차기 session carry (deadline 없음):
  - **F-SIM-003 strict_mode v+1 default 전환** (별 axis 본격 보존 / 본 v9.0.4 fix 후 자연 가능 / cooling-off ≥ 24h 권장)
  - **F-MB-POC-001 poc-03 산출물 drift** (rules.json→business-rules.json v7.0.0 rename 미전파 + cross_links repo-absolute convention / 별 plan)
  - **LL-v903-01 follow-up** (drift-validator phase-flow breaking exit ≥ 1 v+1)
  - **LL-v903-03 follow-up** (release-readiness #1 marketplace.json grep v+1)
