# plan v2.1.0 — phase 4.7 (characterization) 본체 격상

> 2026-05-07 / DEC-2026-05-07-poc-07-poc03-phase7-retrofit 후속 / Work Principles 1원칙 plan
> ≥2 PoC corroboration 충족 사실 확보 (PoC #06 Legacy + PoC #03 Modern 두 spectrum) → 본체 격상 자격 사실
> v2.0.0 MAJOR FINAL release (2026-05-07 / DEC-2026-05-07-v2.0.0-final) 직후 첫 minor

---

## 1. 목적 + 비목적

### 1.1 목적

phase 4.7 (characterization) 정식 단계를 본체 자산으로 격상. ≥2 PoC corroboration 충족 — Modern + Legacy 두 spectrum 입증된 패턴을 본체에 흡수해서 향후 사용자가 phase 4.7 을 정식 호출 가능하게 함.

### 1.2 비목적

- 새 시스템 자동 생성 ❌ (chain harness gate 안에서만)
- skill prompt Modern vs Legacy 분기 ❌ (★ DEC §6 정정 — YAGNI / 단일 prompt 양 spectrum 동작 입증)
- `phase_4_7_first_application_findings` (F-PHASE7-001~004) 일반화 ❌ — PoC 단일 적용에서 발견 / 본체 schema 의 carry note 만
- chain harness 5 요소 변경 ❌ (★ phase 4.7 = analysis stage 내부 — chain 1 planning-spec 입력 보강)

---

## 2. ★ 본체 격상 6 자산 (DEC §6 carry)

| ID | 자산 | 위치 | 상태 |
|---|---|---|---|
| A1 | deliverable 명세 | `methodology-spec/deliverables/23-characterization-spec.md` (★ #16~22 사용 중 / 23 신규) | ⏳ 신설 |
| A2 | schema | `schemas/characterization-spec.schema.json` | ⏳ 신설 |
| A3 | meta-confidence enum | `schemas/meta-confidence.schema.json` `inputs_used` enum 에 `characterization` 추가 | ⏳ 갱신 |
| A4 | skill | `skills/analysis/phase-4-7-characterization/SKILL.md` | ⏳ 신설 |
| A5 | tool | `tools/characterization-coverage-validator/` workspace 13번째 | ⏳ 신설 |
| A6 | flow | `flows/analysis.phase-flow.json` v1.5.0 → v2.1.0 / phase 4.7 entry 추가 | ⏳ 갱신 |
| A7 | ADR | `docs/adr/ADR-CHAIN-006-phase-4-7-characterization.md` | ⏳ 신설 |

★ A3 은 enum 1줄 추가 / 별도 task 분할 ❌ — A2 와 묶음.

---

## 3. ★ phase 4.7 의 위치 (analysis stage 내부)

```
analysis stage (chain 1 입력)
├── phase 0 (input)
├── phase 1 (init/inventory)
├── phase 2 (db)
├── phase 3 (arch)
├── phase 4 (business logic)
├── phase 4.5 (formal-spec / cross-validation)
├── ★ phase 4.7 (★ ★ characterization 신설 / 의도 vs 버그 분리)
├── phase 5-1 (api)
├── phase 5-2 (ui)
└── phase 6 (quality)
```

phase 4.5 (formal-spec) 후 / phase 5-1 + 5-2 전. ★ rules.json + antipatterns.json (phase 4 출력) + formal-spec (phase 4.5 출력) 을 입력으로 의도/버그 분류 + snapshot 작성.

---

## 4. ★ 6 자산 상세 설계

### 4.1 A1. deliverable 16-characterization-spec.md

**구조 (15-type-spec.md 패턴 정합)**:

1. 목적 — Michael Feathers Characterization Testing + DDD + SbE 정합 / acceptance oracle 의무
2. 형식 — `output/characterization/` 디렉토리 (snapshots/ + intent-vs-bug.md + coverage.json)
3. 추출 범위 (출처 / 도구 / 신뢰도) — rules.json + antipatterns.json + 코드 grep + (선택) 도메인 expert 인터뷰
4. ★ intent-vs-bug 분류표 — 4 분류 (intent / bug / ambiguous / self_recognized) + 비율 metric
5. snapshot Given/When/Then 형식 — 1 UC × N scenario / behavior_to_preserve + behavior_likely_bug 분리
6. coverage matrix — UC↔snapshot 매핑 + threshold ≥ 0.80 (PoC #06 carry note: 단일 모듈 0.43~0.50 도 정합)
7. cross-link — to_artifact: rules / antipatterns / formal-spec / acceptance-criteria / planning-spec
8. 신뢰도 (ADR-009 §2.4 정합) — 단계별 60-95%
9. 검증 체크리스트 — schema + threshold + given/when/then 4 필드
10. 산출물 간 참조 — characterization → planning-spec (chain 1 입력 보강)
11. 흔한 함정 — Legacy DB 부재 / ambiguous 분류 회피 / scenario 수 과다

### 4.2 A2. characterization-spec.schema.json

**Sub-schema 3개**:

```json
{
  "$id": ".../characterization-spec.schema.json",
  "type": "object",
  "required": ["meta_confidence", "snapshots", "intent_vs_bug", "coverage"],
  "properties": {
    "meta_confidence": { "$ref": "meta-confidence.schema.json" },
    "snapshots": { "type": "array", "items": { "$ref": "#/$defs/snapshot" } },
    "intent_vs_bug": { "$ref": "#/$defs/intentVsBug" },
    "coverage": { "$ref": "#/$defs/coverage" }
  },
  "$defs": {
    "snapshot": { /* given/when/then + intent_classification + behavior_to_preserve + behavior_likely_bug */ },
    "intentVsBug": { /* br_total/intent/bug/ambiguous + ap_total/intent/bug/ambiguous + named_classified_ratio */ },
    "coverage": { /* matrix array + coverage_summary + threshold_status */ }
  }
}
```

### 4.3 A3. meta-confidence enum 갱신

`inputs_used` enum 에 `"characterization"` 추가. 기존 12 → 13개 항목.

### 4.4 A4. skills/analysis/phase-4-7-characterization/SKILL.md

**phase-5-error-mapping/SKILL.md 패턴 정합**:

```md
---
name: phase-4-7-characterization
description: Use when project has analysis output (rules.json + antipatterns.json) AND user invokes "characterization" or "intent-vs-bug" or "snapshot golden" task. Generates characterization-spec.json (산출물 16). ★ Michael Feathers Characterization Testing 정합 / acceptance oracle 의무 / Legacy + Modern 두 spectrum 모두 동작 (단일 prompt). Stage = analysis, manifest phase = 4.7 (신설).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# phase-4-7-characterization — 의도 vs 버그 분리 + snapshot 고정

★ ★ ★ DEC-2026-05-07-poc-06-domain-결단 + DEC-2026-05-07-poc-07-poc03-phase7-retrofit 정합. ★ ≥2 PoC corroboration 입증 (PoC #06 Legacy + PoC #03 Modern).

## ★★★ no-simulation 절대 금지 (CLAUDE.md)

- ❌ AI sub-agent persona 시뮬 ❌
- ✅ 실 코드 grep + 실 (또는 도메인 expert 위임 / DBA carry)
- ✅ ambiguous 영역은 도메인 expert 결단 강제 (PoC #06 D2 결단 패턴)

## 사전 조건

- analysis output (rules.json + antipatterns.json) 존재
- 도메인 expert 인터뷰 가능 OR carry 명시

## 절차

1. **rules.json + antipatterns.json read** — phase 4 / phase 6 출력
2. **intent vs bug 분류** — 4 분류 (intent / bug / ambiguous / self_recognized)
   - intent = 비즈니스 의도 (보존 의무)
   - bug = 명확한 결함 (재구현 시 fix 의무)
   - ambiguous = 도메인 expert 결단 의무 (carry — DBA / planner 인터뷰 필수)
   - self_recognized = 코드 자조 코멘트 (TODO / FIXME / 자체 인지) → bug 분류
3. **snapshot 작성** — Given/When/Then BDD 스타일 / behavior_to_preserve + behavior_likely_bug 분리
   - PoC #06 = 3 UC × 10 scenario (Legacy)
   - PoC #03 retrofit = 1 UC × 3 scenario (Modern)
4. **coverage matrix** — UC ↔ snapshot 매핑 + UC/service/sql ratio + threshold ≥ 0.80
5. **★ Modern 환경 hint (분기 ❌ / hint 한 줄)** — 명확 분류 비율 ≥ 95% 시 ambiguous 영역 탐색 cap 가능
6. **★ Legacy 환경 hint** — ambiguous ↑ 시 도메인 expert 결단 carry 명시 의무

## 산출물

- `<user-project>/.aimd/output/characterization/snapshots/UC-*.json`
- `<user-project>/.aimd/output/characterization/intent-vs-bug.md`
- `<user-project>/.aimd/output/characterization/coverage.json`

## 본체 명세

- `methodology-spec/deliverables/16-characterization-spec.md`
- `schemas/characterization-spec.schema.json`
- ADR-CHAIN-006 phase 4.7 신설
```

### 4.5 A5. tools/characterization-coverage-validator/

**workspace 13번째 / `chain-coverage-validator/` 패턴 정합**:

```
tools/characterization-coverage-validator/
├── package.json (ES module / node:test / zero-dep / engines node>=18)
├── README.md (Purpose / When / In / Out / Exit / Siblings / 참조 표준 schema)
├── src/
│   ├── cli.js
│   ├── validate-snapshots.js   # given/when/then 4 필드 + intent_classification 의무
│   ├── validate-intent-vs-bug.js  # named_classified_ratio ≥ 0.80 default
│   └── validate-coverage.js    # UC↔snapshot 매핑 + threshold (단일 모듈 carry note)
└── test/
    ├── fixtures/
    │   ├── valid/  (PoC #06 + PoC #03 retrofit 자산 복사)
    │   └── invalid/  (4~5 fail case)
    └── validator.test.js  (8~10 unit test)
```

**핵심 검증 의무**:

1. snapshot.given/when/then 모두 존재
2. snapshot.scenarios[].intent_classification[].type ∈ [intent, bug, ambiguous, self_recognized]
3. intent_vs_bug.named_classified_ratio ≥ 0.80 (default / threshold flag override)
4. coverage.matrix[].snapshot ∈ [✅, ❌] + scope_decision 의무
5. ambiguous > 0 시 도메인 expert carry 명시 의무 (snapshot 또는 intent-vs-bug 본문)

**unit test 회귀** — 현재 218 → ★ ≥ 226 (+8) 목표.

### 4.6 A6. analysis.phase-flow.json v1.5.0 → v2.1.0

**갱신**:

```json
{
  "version": "2.1.0",
  "phases": [
    ...
    {
      "id": "4.5",
      "name": "formal-spec",
      ...
    },
    {
      "id": "4.7",
      "name": "characterization (★ v2.1.0 신설 — 의도 vs 버그 분리)",
      "spec_file": "phase-4-7-characterization.md",
      "depends_on": ["4", "4.5"],
      "inputs": ["rules.json", "antipatterns.json"],
      "outputs": ["characterization-spec.json", "snapshots/*.json", "intent-vs-bug.md", "coverage.json"],
      "automated_validation": ["characterization-coverage-validator"],
      "introduced": "v2.1.0",
      "skills": ["phase-4-7-characterization"]
    },
    {
      "id": "5-1", ...
    }
  ],
  "version_milestones": {
    ...,
    "v2.1.0": ["★ ★ phase 4.7 (characterization) 정식 단계 신설", "deliverable 16 / schema / skill / tool / ADR-CHAIN-006", "≥2 PoC corroboration (PoC #06 Legacy + PoC #03 Modern)"]
  }
}
```

`flows/analysis.phase-flow.mermaid` 도 동기 갱신 (phase 4.7 노드 + edge).

### 4.7 A7. ADR-CHAIN-006

**ADR-CHAIN-005 패턴 정합**:

```md
# ADR-CHAIN-006: phase 4.7 (characterization) 정식 도입 — 의도 vs 버그 분리 + snapshot acceptance oracle

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-07
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-001 (사상), ADR-008 (이중 렌더링), ADR-009 (다이어그램 신뢰), DEC-2026-05-07-poc-06-종결, DEC-2026-05-07-poc-06-domain-결단, DEC-2026-05-07-poc-07-poc03-phase7-retrofit, plan §6.5 (Michael Feathers Characterization Testing)

## 컨텍스트

v2.0 chain harness validated 후 첫 minor. analysis stage (chain 1 입력) 안에서 rules.json + antipatterns.json 만으로는 "어느 행위가 의도이고 어느 것이 버그인가" 분리 ❌ → 새 시스템 재구현 시 acceptance oracle 부재.

## 외부 조언 (plan §6.5)

- Michael Feathers, *Working Effectively with Legacy Code* (2004) §13 Characterization Testing
- DDD context map + bounded context
- Specification by Example (Gojko Adzic 2011) Given/When/Then BDD

## 결정

phase 4.7 (characterization) 정식 단계 신설. 4 정책:

1. **위치** — analysis stage 내부 / phase 4.5 후 / phase 5-1 + 5-2 전
2. **단일 prompt 양 spectrum** — Legacy (PoC #06) + Modern (PoC #03) 두 spectrum 모두에서 동일 prompt 동작 입증. ★ skill prompt 분기 ❌ (YAGNI)
3. **acceptance oracle 의무** — snapshot Given/When/Then + intent_classification + behavior_to_preserve + behavior_likely_bug 4 필드 필수. ambiguous > 0 시 도메인 expert 결단 carry 명시 의무 (PoC #06 D2 패턴)
4. **coverage threshold** — 기본 ≥ 0.80 (PoC #05 정합 / PoC #06 단일 모듈 0.43~0.50 carry note 보존)

## ≥2 PoC corroboration

| PoC | spectrum | 명확 분류 비율 |
|---|---|---|
| PoC #06 | Legacy 적대성 (Spring 4.1 + iBATIS) | 17/18 = 94% (D2 후) |
| PoC #03 retrofit | Modern (NestJS) | 30/30 = 100% |

## 결과

- 본체 자산 6 (deliverable / schema / meta-confidence enum / skill / tool / flow)
- F-PHASE7-001~004 = PoC #06 단일 적용 finding / 본체 schema 의 carry note 만 (일반화 ❌)
- v2.1.0 minor release

## 미해결

- v2.x carry: schema sub-rule 추가 (snapshot 형식 다양화) / Modern 환경 명확 비율 ≥ 95% 시 ambiguous 탐색 cap automation
```

---

## 5. 검증 + drift 회귀

### 5.1 drift-validator `--check-layout` 갱신

manifest (`flows/analysis.phase-flow.json`) phase 9 → ★ 10 / skills 19 → ★ 20.

```bash
node tools/drift-validator/src/cli.js --check-layout
# Expect: ★ 10 phases / 20 skills / 0 orphans / 0 missing
```

### 5.2 unit test 218 → ≥ 226

| 도구 | 직전 | 신규 | 합계 |
|---|---|---|---|
| characterization-coverage-validator | 0 | +8~10 | 8~10 |
| drift-validator (phase-skill 갱신) | 47 | (변경 없음 / corpus 갱신만) | 47 |
| 그 외 11 도구 | 94 | 0 | 94 |
| chain-driver | 68 | 0 | 68 |
| release-readiness self-test | 9 | 0 | 9 |
| **합계** | 218 | +8~10 | **226+** |

### 5.3 version-check + build

```bash
node scripts/version-check.js --check  # 3 source 모두 v2.1.0
node scripts/build-plugin.js           # dist/ai-native-methodology-v2.1.0/
shasum -c dist/ai-native-methodology-v2.1.0/CHECKSUMS  # all OK
```

### 5.4 release-readiness

```bash
node scripts/release-readiness.js --target v2.1.0
# Expect: §8.1 strict 7/7 ✅ (≥2 PoC corroboration 자동 인식)
```

---

## 6. release commit + tag 절차

### 6.1 commit 단위 (분할)

| commit | 내용 |
|---|---|
| C1 | A1 + A2 + A3 (deliverable + schema + meta-confidence enum) |
| C2 | A4 (skill) |
| C3 | A5 (tool + 8~10 unit test) |
| C4 | A6 + A7 (flow + ADR) |
| C5 | drift-validator 회귀 + version bump v2.0.0 → v2.1.0 + build dist |
| C6 | DEC-2026-05-07-v2.1.0-release + STATUS / INDEX / CHANGELOG |
| C7 | git tag v2.1.0 |

★ 각 commit 자체 통과 (drift-validator + unit test 회귀) — 부분 commit 으로 인한 broken state ❌.

### 6.2 §8.1 strict 정합

| 자격 | 충족 |
|---|---|
| ≥2 PoC corroboration | ✅ PoC #06 Legacy + PoC #03 Modern |
| 명시 carry | ✅ v2.x sub-rule + automation cap |
| 본체 격상 6 자산 | ✅ A1~A7 |
| unit test 회귀 통과 | ✅ ≥ 226 |
| build dist | ✅ ai-native-methodology-v2.1.0/ |
| release-readiness 7/7 | ✅ |
| Senior cooling-off | ⏳ ★ ★ ★ **사용자 결단** — v2.0.0 final 의 24h+ pattern 적용 여부 |

★ §6.2 7번째 = ★ 사용자 결단 의뢰. v2.0.0 → v2.0.0-rc1 prerelease 후 24h+ 적용했음 (Senior F4). v2.1.0 minor 도 동일 적용 vs 즉시 final?

---

## 7. 리스크 + Lessons Learned 후보

### 7.1 리스크

| 리스크 | 완화 |
|---|---|
| phase 4.7 schema 가 PoC #06/#03 두 spectrum 자산 정합 ❌ | 두 PoC fixture 모두 valid corpus 등재 + Ajv strict 검증 통과 의무 |
| drift-validator phase 9 → 10 회귀 fail | check-layout test corpus 동시 갱신 |
| skill prompt Modern/Legacy hint 분기 ↑ | DEC §6 정정 명시 — 단일 prompt + hint 한 줄 / 분기 ❌ |
| ambiguous 영역 자동 detect ❌ | 도메인 expert carry 명시 의무 schema if/then 강제 |
| 14차 retract 패턴 burst | ★ 분할 commit (C1~C7) + 각 단위 통과 |

### 7.2 Lessons Learned 후보 (4원칙 — 실패 시 기록)

(현재 시점 = 진입 전 / 발견 시 추가)

---

## 8. 진행 결정 의뢰

| 결단 | 옵션 |
|---|---|
| **D1 진입 여부** | (a) 즉시 plan 승인 → 2원칙 (research) 진입 (b) plan 수정 후 (c) 다른 우선순위 |
| **D2 sub-agent research 깊이** | (a) 가벼운 (Phase 4~6 패턴 / Case 생략 / ~10배 단축) (b) 정통 (3 agent 병렬 / 시간 cap ❌) |
| **D3 Senior cooling-off** | (a) v2.1.0 minor → 즉시 final (≥2 corroboration + ≤6 자산 / scope 작음) (b) v2.1.0-rc1 prerelease → 24h+ 후 final (v2.0.0 패턴 정합) |
| **D4 commit 단위** | (a) §6.1 7-commit 분할 (b) 묶어서 1~2 commit |
| **D5 본 plan 의 차후 갱신** | (a) phase 별 update (b) carry 만 마지막 추가 |

★ 권고: D1=(a) / D2=(a) / D3=(a) / D4=(a) / D5=(a).

근거: scope 작음 (≤ 6 자산 / unit test +8~10) + ≥2 corroboration 사실 확보 + chain harness 5 요소 변경 ❌ + paradigm shift ❌ → ★ 14차 retract 위험 ↓ → minor release rc 생략 정합.

---

## 9. 자산 위치 정합 (★ ★ skills-axis 정책 / methodology-spec/skills-axis.md)

skills 디렉토리 = 산출물 번호 prefix axis (본 plan 시 phase-4-7-characterization). manifest phase ID = "4.7" (점 표기). drift-validator `--check-layout` 가 3-way (manifest ↔ workflow ↔ skills) 검증 통과 의무.

---

## 10. 예상 시간 (lightweight sub-agent / Phase 4~6 패턴)

| Task | 시간 |
|---|---|
| 2원칙 research (3 agent 병렬 / 가벼운) | 30~60분 |
| 3원칙 사용자 승인 | 5~15분 |
| C1 (deliverable + schema + enum) | 30~45분 |
| C2 (skill) | 20~30분 |
| C3 (tool + 8~10 test) | 60~90분 |
| C4 (flow + ADR) | 30~45분 |
| C5 (drift + version + build) | 20~30분 |
| C6 (DEC + STATUS + INDEX + CHANGELOG) | 30~45분 |
| C7 (tag) | 5분 |
| **합계** | ★ 4~6시간 |

★ Auto Mode 가속 가정.

---

## 부록 A. v2.1.0 후속 carry (DEC §6 명시)

| ID | 항목 | trigger |
|---|---|---|
| C-v2.1.0-1 | sub-rule 추가 (snapshot 형식 다양화) | v2.1.x patch / 사용자 finding |
| C-v2.1.0-2 | Modern 환경 명확 비율 ≥ 95% 자동 detect | v2.2+ |
| C-v2.1.0-3 | acceptance oracle threshold 본체 운영 dashboard | v2.x |
| C-v2.1.0-4 | F-PHASE7-001~004 일반화 검토 | ≥ 3 PoC corroboration 후 |
