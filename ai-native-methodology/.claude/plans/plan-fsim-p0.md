# Plan — F-SIM P0 (chain-harness e2e simulation audit / P0 4종)

> 4원칙 §1 깊은 숙지 산출물. P0 = F-SIM-001/002/003/004/011 (high 4 + medium 1 동반).
> 본 plan 후속: 4원칙 §2 3-에이전트 research(`.claude/researches/research-fsim-p0.md` 완료) → §3 사용자 묶음 go/stop **승인 2026-05-18 "권고안 그대로 시행"** → §4 시행 + STOP-3 9-gate hard gate.
> **scope-out**: F-SIM-005~010 (P1/P2 — 별도 plan).
> **★ research deltas (2026-05-18 묶음 결단 반영)**:
> - D2: `--strict-paths` flag warn default + release-readiness #14 baseline ratchet (v+1 default 전환)
> - D4: **plan §3.5 C → Senior REVISE B 전환** — poc-03 격하 + 신규 PoC corroboration #2 별도 P1 plan + **P0 commit 본문에 P1 deadline commit-block 명시 의무**
> - D7: STOP-3 9-gate — 신규 #15 matrix visual diff + #16 methodology body self-bootstrap assert
> - D8: F-SIM-005 ledger 본문 Beck-canonical 반영 수정 (compile-import-fail = valid RED / 인용 정확 / per-TC granularity 결여가 잔존 본질)
> - **§3.1 F-SIM-002 schema 영향**: DMN 인용 제거 → **ISO 26262 Part 9 ASIL inheritance + IEC 62304 Class A/B/C propagation** 으로 권위 인용 교체 (F-015 Claim B VERIFIED-WITH-DELTA / DMN 약함 / Parasoft + Infineon Developer Community 출처)
> - §3.2 F-SIM-003 prevalence refinement: BE track v7.0.0 collateral 특이 (FE poc-04-mini = all paths exist). validator fix universal good 유지.
> - **§8.1 자기정합 LL-fsim-04 해소**: D9 ≥3 PoC pre-sweep (poc-05 + poc-03 + poc-04-mini) 시행 — F-SIM-002/004 = 3 PoC 동형 재현 BE+FE 횡단 확정. F-SIM-003 = BE 2 PoC. F-SIM-011 본질 잔존 (corroboration #2 chain 4 GREEN 부재).
> - Industry alignment 자격: **industry-aligned** (industry-first 아님 / SonarQube+GitHub+Snyk+CNCF+SLSA+OpenSSF 모두 본 방법론보다 엄격 또는 isomorphic / DEC-2026-05-17 LL-plugin-02 self-correct paradigm 정합).

## 0. 배경 sync

- 본 plan 트리거 = `DEC-2026-05-17-chain-harness-e2e-simulation-audit` + `finding-system.md` § F-SIM namespace.
- 2 PoC cross-validation 결과 — 교차 가능한 7개 finding 전부 동형 재현 + 4개 RealWorld 악화 + 단일 PoC 특이 0 = **방법론 구조 결함 확정**.
- 공통 뿌리: "link existence 결정적 강제 / link semantic preservation 미강제".

## 1. P0 4종 + 동반 1종 (semver 분류)

| ID | severity | 변경 type | semver 분류 (제안) | 단일 지점 |
|---|---|---|---|---|
| F-SIM-002 | high | tool single-line fix + schema property 추가 | **PATCH~MINOR** | `tools/traceability-matrix-builder/src/builder.js:56,67,77` |
| F-SIM-003 | high | tool additive assert + schema format | **PATCH** | `tools/chain-coverage-validator/src/validator.js:98-103` |
| F-SIM-001 | high | tool 신규 lane + schema enum 추가 + flow 보강 | **MINOR** | `tools/chain-coverage-validator/` + `schemas/acceptance-criteria.schema.json` |
| F-SIM-004 | medium | schema property 추가 + builder column | **MINOR** (002 동반) | `schemas/traceability-matrix.schema.json` + `tools/traceability-matrix-builder/` |
| F-SIM-011 | high | flow 정의 강화 + release_eligibility 조건 명시 | **MINOR** | `flows/sdlc-4stage-flow.json` `release_eligibility.items[]` |

★ semver 통합 제안 = **MINOR** (F-SIM-001/004/011 의 additive 변경이 PATCH 한계 초과 / F-SIM-002/003 흡수). cooling-off = 사용자 명시 위임 시 생략 가능(선례 동형).

## 2. 옵션 분기

### Option A — 묶음 1-session 시행 (★ 권장)

- 5 finding 단일 commit / MINOR release
- 장점: 공통 뿌리(의미 누수) 동시 해소 / drift 최소화 / STOP-3 hard gate 1회
- 단점: blast radius 상대적 ↑ (5 finding 동시 — 다만 매 finding 단일 지점)
- 선례: 묶음 Q ⑦ (v7.0.0 / 1-session validated + STOP-3 hard gate)

### Option B — risk 오름차순 sequential

- F-SIM-002 → F-SIM-003 → F-SIM-004 동반 → F-SIM-001 → F-SIM-011 순차 5 release
- 장점: 각 변경 격리 검증 / 회귀 분리
- 단점: 5× release-readiness + 5× drift-validator 통과 비용 / 같은 뿌리 분할
- 선례: 묶음 Q (Q①→Q②→Q-①-followup→Q⑦ 4 release / Q-①-followup 처럼 risk 분리 필요 시)

### Option C — F-SIM-002/003 만 우선 (PATCH 1회) + 나머지 P1 묶음

- F-SIM-002/003 = 단일 지점 + 회귀 검증 쉬움 / 자력 PATCH
- F-SIM-001/004/011 = P1 묶음 (MINOR / 추가 plan 의무)
- 장점: 즉시 가치 / 보수적
- 단점: 공통 뿌리(의미 누수) 부분 해소만 → §8.1 자기정합(F-SIM-011) 잔존

→ **사용자 결단 의제 D1**.

## 3. 변경 명세 (Option A 기준)

### 3.1 F-SIM-002: matrix severity source-grounded 전파

**Before** (`tools/traceability-matrix-builder/src/builder.js:56,67,77`)
```js
severity: ac.severity === 'must' ? 'critical' : ac.severity === 'should' ? 'medium' : 'low'
```

**After** (source-grounded max propagation)
```js
function deriveCellSeverity({ ac, brs, aps }) {
  const rank = { low: 1, medium: 2, high: 3, critical: 4 };
  const moScoWtoSeverity = { must: 'critical', should: 'medium', could: 'low' };
  const candidates = [
    moScoWtoSeverity[ac.severity] ?? 'low',
    ...brs.map(br => br.severity ?? 'low'),
    ...aps.map(ap => ap.severity ?? 'low'),
  ];
  return candidates.reduce((max, s) => rank[s] > rank[max] ? s : max, 'low');
}
```

**Schema 영향**:
- `schemas/acceptance-criteria.schema.json` AC 객체에 `related_brs[]: BR_ID` + `related_aps[]: AP_ID` 추가 (optional)
- `schemas/traceability-matrix.schema.json` matrix row severity 산정 규칙 `$comment` 추가

**회귀 검증**:
- 11 PoC matrix 재생성 → severity 분포 변동 확인 (모두 critical → 분산 예상)
- poc-05 matrix UC-USER-002 row = critical→critical(BHV 의 br_refs=[] / AP 미연결 / AC must) → 변동 0 (단일 PoC 한계 — F-SIM-001 시행 후 AP 연결로 변동)
- workspace test 395+ 통과 의무

### 3.2 F-SIM-003: chain-coverage-validator cross-ref path resolve

**Before** (`tools/chain-coverage-validator/src/validator.js:98-103`)
```js
const xLinks = behavior?.cross_links?.to_analysis_artifacts ?? [];
if (xLinks.length === 0) {
  findings.push({ kind: 'chain.behavior.cross_links_empty', severity: 'high', ... });
}
```

**After** (additive — empty 체크는 유지 + 경로 resolve 추가)
```js
const xLinks = behavior?.cross_links?.to_analysis_artifacts ?? [];
if (xLinks.length === 0) { ... } // 기존
for (const linkPath of xLinks) {
  const resolved = resolveAnalysisArtifactPath(linkPath, projectRoot);
  if (!existsSync(resolved)) {
    findings.push({
      kind: 'chain.behavior.cross_links_broken',
      severity: 'high',
      message: `cross_links.to_analysis_artifacts path not resolved: ${linkPath}`,
      evidence: { resolved_path: resolved }
    });
  }
}
// 동일 로직 derivation_source.source_artifacts / analysis_artifacts 에도 적용
```

**경로 컨벤션 단일화**: `relative-to-project-root` (예: `output/rules/business-rules.json`) — schema description 명시. repo-absolute (`examples/.../`) 사용 금지 + migration assert.

**회귀 검증**:
- 11 PoC 즉시 finding emit (rules.json dead-link 잔존) → 동반 수정 의무 = **F-MB-009 deferred 인 forensic audit 와 충돌 가능** (LL-i-55 함정존). Senior research 의제 D2.
- migration window 옵션: `--strict-paths` flag 도입 (기본 warn / strict=fail).

### 3.3 F-SIM-001: AP→BR→AC coverage lane

**flows/sdlc-4stage-flow.json gates[#2].validators[]** 에 신규 `antipattern-coverage-validator` 추가.

**신규 validator** `tools/chain-coverage-validator/src/ap-lane.js`:
```js
function checkAntipatternCoverage({ antipatterns, acceptanceCriteria, planning }) {
  const findings = [];
  for (const ap of antipatterns) {
    if (ap.severity !== 'critical' && ap.severity !== 'high') continue;
    const referenced = acceptanceCriteria.some(ac =>
      (ac.related_aps ?? []).includes(ap.id)
    );
    const explicitlyExcluded = (planning.out_of_scope ?? []).some(s => s.includes(ap.id));
    if (!referenced && !explicitlyExcluded) {
      findings.push({
        kind: 'chain.ap.uncovered_severe',
        severity: ap.severity,
        message: `${ap.severity} antipattern ${ap.id} has no AC mapping nor explicit scope-out`,
        evidence: { ap_id: ap.id, severity: ap.severity }
      });
    }
  }
  return findings;
}
```

**Schema 영향**:
- `schemas/acceptance-criteria.schema.json` AC 에 `related_aps[]` (F-SIM-002 와 공유)
- `schemas/planning-spec.schema.json` `out_of_scope[]` 항목에 optional `ap_id_refs[]` 추가

**회귀 검증**:
- poc-05 = AP-USER-003 → `out_of_scope.ap_id_refs:["AP-USER-003"]` 명시 추가 → finding 0 (acceptable carry)
- poc-03 = AP-AUTH-NEST-001 + AP-DB-001 → AC 매핑 또는 명시 carry 의무 → **수동 결단 필요** (Senior research 의제 D3)

### 3.4 F-SIM-004: matrix BR 축 추가

**schemas/traceability-matrix.schema.json** matrix row 에 `business_rule_ids[]: BR_ID[]` 추가 (optional, BHV.br_refs 경유 자동 채움).

**builder.js**: BHV → cell.business_rule_ids 전파.

**md/mermaid 렌더**: 컬럼 1개 추가 (UC | BR | BHV | AC | TC | IMPL | …).

**회귀 검증**: 11 PoC matrix 재생성 + visual diff.

### 3.5 F-SIM-011: release_eligibility self-consistency

**flows/sdlc-4stage-flow.json** `release_eligibility.items` 강화:

**Before**:
```json
{ "id": 2, "name": "진짜 도구 5종 물증 보존", "data_source": "test-impl-pass-validator (chain 3-4)" }
```

**After**:
```json
{
  "id": 2,
  "name": "진짜 도구 5종 물증 보존 (★ 각 PoC chain 4 GREEN 도달 의무)",
  "data_source": "test-impl-pass-validator (chain 3-4)",
  "corroboration_requirement": "≥ 2 PoC 가 모두 chain 4 GREEN 도달 (test_pass_rate == 1.0) — dry_run_placeholder 제외"
}
```

**release-readiness criterion 갱신**: `release-readiness.js` 가 corroboration PoC 의 `test-spec.json.test_run_evidence.fail_mode != "dry_run_placeholder"` 결정적 assert (F-SIM-005 와 직결 — 시행 시 fail_mode enum 신설 의무 / P0 scope 포함 여부 = 의제 D4).

**옵션 분기 (D4)**:
- (A) poc-03 chain 4 실행 → 진짜 GREEN corroboration #2 추가 (시간 비용 ↑ / NestJS impl)
- (B) poc-03 격하 (analysis~chain-3 corroboration) + 신규 PoC corroboration #2 추가
- (C) F-SIM-011 결정만 명시 + 실 corroboration 보강은 별도 PoC 결단 (P1)

→ **Senior research 의제 D4**.

## 4. STOP-3 hard gate (시행 시 의무 / 선례 동형)

| Gate | 기준 | 회귀 시 대처 |
|---|---|---|
| schema-validator | 전 11 PoC 0-regression | 즉시 stop + 결단 |
| workspace test | 395+ all pass | 변경 도구만 test 추가 → 회복 |
| drift-validator | 3-way (flows json+mermaid + lifecycle-contract) | flow 변경 시 mermaid 동반 |
| release-readiness | 13/13 ready:true | check #1~13 무회귀 |
| version-check | 3-way sync (CLAUDE+plugin.json+CHANGELOG+package.json) | bump 동반 |
| skill-citation | 0 stale | 인용 sweep 동반 |
| **신규 #14 후보** | F-SIM-001 lane finding 0 (자기 입증) | poc-05 carry 명시 추가 |

## 5. blast radius 예상

| 변경 | files (추정) | LOC (추정) |
|---|---|---|
| F-SIM-002 builder.js | 1 + schema 1 | ~30 |
| F-SIM-003 validator.js | 1 + schema 1~2 | ~50 |
| F-SIM-001 ap-lane.js 신규 | 1 + schema 2 + flow 1 | ~80 |
| F-SIM-004 matrix BR 축 | builder.js + schema 1 + 11 PoC matrix 재생성 | ~40 + matrix 재생 |
| F-SIM-011 release_eligibility | flow 1 + release-readiness.js | ~20 |
| 11 PoC 산출물 sweep (cross-refs / AC related_aps/brs 보강) | ~30 file | 100~200 |
| **합계** | ~40 file | ~300~500 LOC |

★ 묶음 Q ⑦(642 occ / 252 files) 보다 **작음** / F-MB sweep(80 단위) 보다 **약간 큼**. STOP-3 1회로 흡수 가능 (선례 v7.0.0 / v8.2.3).

## 6. Lessons Learned (사전)

- **LL-fsim-01**: "데스크 워크스루 감사" 자체가 ground-truth 기반이면 no-simulation 충돌 ❌ — chain harness 자기검증 cadence 후보 (release-readiness #15 candidate / P2).
- **LL-fsim-02**: 본 P0 시행 시 F-SIM-003 가 즉시 11 PoC 에 finding emit → F-MB-009 deferred forensic 와 동시 처리 필요 가능. `--strict-paths` flag migration window 필수.
- **LL-fsim-03**: F-SIM-001 lane 시행 후 poc-05 AP-USER-003 = `out_of_scope.ap_id_refs` 명시 의무 → carry contract 형식화 = 본체 격상 부산물.

## 7. 의제 (사용자 결단 — Auto Mode 호환 5~6 묶음)

| D | 결단 | 옵션 | 권장 |
|---|---|---|---|
| **D1** | 묶음 vs 분할 | A 묶음 1-session / B sequential 5 release / C F-SIM-002/003 PATCH 만 우선 | **A** (공통 뿌리 / 선례 정합) |
| **D2** | F-SIM-003 strict path | 즉시 strict (즉시 11 PoC sweep) / `--strict-paths` flag migration window | **flag** (LL-i-55 함정존 회피) |
| **D3** | poc-03 critical AP 2건 | AC 매핑 추가 / `out_of_scope.ap_id_refs` carry | **carry** (PoC 본질 = NestJS auth scope 영역 / 본 plan scope 외) |
| **D4** | F-SIM-011 corroboration #2 | (A) poc-03 chain 4 실행 / (B) 격하+신규 / (C) flow 정의만 + 실 PoC 별도 | **C** (P0 scope 보호) |
| **D5** | F-SIM-005 (RED fail_mode enum) P0 포함 여부 | 포함 / P1 분리 | **분리** (F-SIM-011 의 data_source 만 보강) |
| **D6** | semver | PATCH (F-SIM-002/003 만) / MINOR (P0 4종) / cooling-off | **MINOR** + cooling-off 생략 (사용자 위임 시) |

## 8. 4원칙 정합

- §1 깊은 숙지 → 본 plan 자체.
- §2 3-에이전트 research → 다음 단계 의무 (`_base-senior-engineer` + `_base-official-docs-checker` + `_base-industry-case-researcher` 병렬 dispatch).
- §3 사용자 승인 → research 합성 후 의제 D1~D6 묶음 제시.
- §4 revert + LL → 시행 cycle 종결 시.

## 9. 참조

- `methodology-spec/finding-system.md` § F-SIM namespace
- `decisions/DEC-2026-05-17-chain-harness-e2e-simulation-audit.md`
- `tools/traceability-matrix-builder/src/builder.js:56,67,77`
- `tools/chain-coverage-validator/src/validator.js:98-103`
- `flows/sdlc-4stage-flow.json` release_eligibility.items
- F-MB / F-PA 선례 (Body Finding Ledger paradigm)
- 묶음 Q⑦ / v7.0.0 (1-session + STOP-3 hard gate 선례)
