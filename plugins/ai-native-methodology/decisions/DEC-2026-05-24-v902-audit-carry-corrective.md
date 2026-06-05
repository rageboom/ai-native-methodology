# DEC-2026-05-24-v902-audit-carry-corrective

> **일자**: 2026-05-24
> **session**: 42차 (현 session) / v9.0.2 PATCH release
> **카테고리**: doc-corrective / session 42차 paradigm + dep-graph L2 audit carry 시행 (forward-only)
> **상태**: 승인 ( 사용자 "캐리 실행" 2026-05-24)
> **Amends**: 없음 (additive doc / breaking 0)
> **Resolves**: F-PA-DRIFT-001 + F-MB-DOC-002 (session 42차 audit carry / STATUS 42차 entry 안 명시 carry)

---

## 1. 배경

session 42차 (2026-05-23, v9.0.1 release 직후) 사용자 결단 "패러다임 + 그래프 점검 / 의도대로 동작 확인" L2 audit (보고만) 시행. 14/16 PASS + 2 doc-only drift carry. 직후 commit `70a2e8e` STATUS 42차 entry 에 carry 등재. 사용자 추가 결단 "캐리 실행" → 본 v9.0.2 PATCH 시행.

audit plan: `~/.claude/plans/imperative-puzzling-flurry.md`

## 2. 결단 (사용자 묶음 결단 2026-05-24)

| #   | 결단                                                                                                                                                    | 채택 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| D1  | F-PA-DRIFT-001 시행 (`finding-system.md` ledger row 2건 status edit / additive doc)                                                                     | ✅   |
| D2  | F-MB-DOC-002 옵션 B 시행 (forward-only / CLAUDE.md "schema 5" → "schema 4 + 의도/실 stat 표기" / history doc 변경 ❌ / LL-i-52 immutable paradigm 정합) | ✅   |
| D3  | v9.0.2 PATCH release ceremony 시행 (additive doc-only / breaking 0)                                                                                     | ✅   |

## 3. 시행 직전 사실 검증 보강 결과 (LL-fsim-11 paradigm 본격 재발)

L2 audit 가 1차로 F-MB-DOC-002 를 단순 ambiguity (CLAUDE.md "5종" vs 실측 4) 로 등재했으나, 시행 직전 사실 검증 보강 시 더 깊은 fact-mismatch 발견:

| 자료                                     | claim                                                                                          | 실 stat                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `b9615d0` commit message                 | "schema 신설 5: artifact-graph-node/edge, code-pointer, discovery-output, plan-spec"           | **3종 신설** (artifact-graph-node + edge + code-pointer)          |
| `DEC-2026-05-23-dep-graph-p1-p4.md §3.1` | "schema 5: ... + discovery-output + plan-spec"                                                 | 동일 — 사실 오류                                                  |
| `decisions/STATUS.md` session 32차 entry | "schema 5 신설 (...artifact-graph-node/edge + code-pointer + discovery-output + plan-spec...)" | 동일 — 사실 오류                                                  |
| 현 `schemas/` 실측                       | `discovery-output.schema.json` + `plan-spec.schema.json`                                       | **둘 다 git history 안 전혀 부재** (never created)                |
| `schemas/cycle-carry.schema.json`        | (history doc 안 dep-graph 5종 list 안 명시 ❌)                                                 | v8.8.0 commit `4523116` 신설 (별 axis carry resolution_kind 추적) |

→ v8.9.0 시점 "schema 5 신설" 의도 / 실 b9615d0 stat = 3종 + v8.8.0 `cycle-carry` carry-over 1 = 현 4종 (artifact-graph-node + edge + code-pointer + cycle-carry).

## 4. 시행 자산

### 4.1 F-PA-DRIFT-001 (low / doc-drift 내적)

- `methodology-spec/finding-system.md:474` F-SIM-012 status `"open (v8.4.0 carry)"` → `"closed v8.14.4"` + DEC-2026-05-23-fsim-012-014-close §1 cross-link 정합 + 본문 표기 ("severity_distinct_count gauge = F-SIM-002 schema+builder 안 이미 존재 / 단일 PoC false-positive / hard sentinel scope-out")
- `methodology-spec/finding-system.md:476` F-SIM-014 동일 패턴 (DEC §2 cross-link + "analysis-form-validation-fe 의도적 FE 전용 유지 / BE schema validation 별도 future skill 후보 / F-SIM-016 선례 동형")

### 4.2 F-MB-DOC-002 옵션 B forward-only

- `CLAUDE.md` line 132 v8.9.0 entry `"schema 5 + validator 2"` → `"schema 4 ( v9.0.2 정정 / 실 b9615d0 stat = artifact-graph-node + edge + code-pointer 3 신설 + v8.8.0 cycle-carry carry-over 1 = 현 4종 / v8.9.0 commit message + DEC §3.1 "schema 5 신설" claim = 사실 오류 / discovery-output + plan-spec 본 적 없음 — history doc immutable 보존 / DEC-2026-05-24-v902-audit-carry-corrective) + validator 2 + ..."`
- history doc 변경 ❌:
  - `b9615d0` commit message immutable (LL-i-52 paradigm)
  - `DEC-2026-05-23-dep-graph-p1-p4.md §3.1` immutable
  - `decisions/STATUS.md` 32차 entry immutable
- 새 reader 의 사실 추적 = 본 DEC + CLAUDE.md 정정 표기 안 cross-link 경유

### 4.3 v9.0.2 release ceremony

| 영역                                                      | 갱신                                                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `.claude-plugin/plugin.json`                              | 9.0.1 → 9.0.2                                                                                         |
| `package.json` (workspace root)                           | 9.0.1 → 9.0.2                                                                                         |
| `CHANGELOG.md`                                            | v9.0.2 PATCH entry                                                                                    |
| `CLAUDE.md`                                               | line 100 "v9.0.1" → "v9.0.2" + line 132 v8.9.0 entry 정정 (F-MB-DOC-002 forward-only)                 |
| `decisions/DEC-2026-05-24-v902-audit-carry-corrective.md` | 본 파일 신설                                                                                          |
| `decisions/INDEX.md`                                      | 본 DEC 최상단 등재                                                                                    |
| `decisions/STATUS.md`                                     | session 42차 v9.0.2 entry ( 42차 audit entry "보고만 / fix ❌" 표기는 audit-time 기록 보존 / 변경 ❌) |

## 5. STOP-3 hard gate 실측

| Gate               | 결과                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| workspace test     | 694/694 pass ✅                                                               |
| release-readiness  | 16/16 ready:true ✅                                                           |
| version 3-way sync | plugin.json 9.0.2 / package.json 9.0.2 / CHANGELOG v9.0.2 ✅                  |
| skill-citation     | 0 stale ✅                                                                    |
| drift-validator    | 3-way ✅                                                                      |
| breaking           | 0 = PATCH (additive doc / row status edit + entry 정정 만 / 기존 의무 제거 0) |

## 6. Lessons Learned 신규

- **LL-v902-01** — main agent 시행 직전 사실 검증 paradigm 본격 재발 (LL-fsim-11 정합). L2 audit 가 1차로 "ambiguity (5종 vs 4 표기 차이)" 로 등재한 finding 이 시행 직전 사실 검증 보강 시 더 깊은 fact-mismatch (commit message + DEC + STATUS 안 "5종" claim 자체가 사실 오류) 로 진화한 case. **시행 직전 사실 검증 의무 = paradigm enforce 본격 입증대**.

- **LL-v902-02** — history doc immutable forward-only correction paradigm (LL-i-52 본격 재적용). commit message + DEC + STATUS 의 fact-wrong claim 도 변경 ❌ (audit-time 기록 보존). 정정은 forward-only doc (CLAUDE.md) 에 한정. 새 reader 가 본 DEC + CLAUDE.md cross-link 경유 사실 추적 가능.

- **LL-v902-03** — L2 audit + 시행 분리 paradigm 본격 입증대. audit (보고만) → 사용자 결단 (캐리 실행) → 시행 시 사실 검증 보강 → 결과 자산 정합 cadence. 본 v9.0.2 = paradigm 안정점 본격 재도달 v3 (audit + drift 자동 감지 + 사용자 결단 + Senior fact-check enforcement + 시행 + LL 자산화 = paradigm enforce ledger 완결 cycle 본격 종결).

---

**참고**:

- session 42차 STATUS entry (audit / 2026-05-23): "F-PA-DRIFT-001 + F-MB-DOC-002 carry 보고만" → 본 DEC 안 시행
- 직전 release: v9.0.1 PATCH (commit `18abefb` v9.0.1 + `70a2e8e` STATUS 42차 audit carry 기록)
- audit plan: `~/.claude/plans/imperative-puzzling-flurry.md`
- CHANGELOG.md v9.0.2 entry
