# plan-validator-dual-key-fix

> **세션 54차 — 3 번째 plan ladder** (직전 = `plan-poc17-analysis-revisit-axis-1-2.md` § Phase 4 = "carry queue 본격 등록 / 본 session 종결").
> **4원칙 1단계** (깊이 숙지 후 plan.md 작성 / 본 plan = validator 결함 본격 시행 trigger).
> **paradigm 정합 (Phase 2 실측 후 본격 정정)** — pre-fix 실측 = 본 PoC 이미 GREEN (사용자 normalize 우회로 chain 1 forward 자격 이미 충족) → paradigm A retract narrative ❌ / paradigm A 본격 가치 self-입증 axis 본격 자연 (self-기록 사실 검증 부족 cycle 의 본격 본격 자기-차단 사례). 본 fix = paradigm-level resilience 추가 (additive backward-compat / 미래 PoC dual-key paradigm 자연 인식 / 본 PoC 영향 0).

---

## 1. 한 줄 의제

`tools/discovery-extraction-validator/src/validator.js` 안 BR lookup 경로가 잘못된 경로 (`analysis.rules.business_rules`) 한 곳만 봄. 실제 데이터는 `analysis.rules` (array) / `analysis.rules_step_4c_carcost` / `analysis.business_rules` 셋 중 하나. 결과 = 본 PoC chain 1 forward 12 CRITICAL 차단. 본 plan = lookup 경로 양방향 보강 (additive only / backward-compat).

## 2. 사실 (검증 종결)

### 2.1 결함 코드 (라인 31~35)

```js
const analysisBrs = new Set();
if (analysis?.rules?.business_rules) {
	// ← 잘못된 경로 가정
	for (const br of analysis.rules.business_rules) {
		if (br.id) analysisBrs.add(br.id);
	}
}
```

### 2.2 실제 데이터 (`~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/business-rules.json`)

| top-level key           | 자료형 | 갯수 | BR id suffix | 만들어진 시점                             |
| ----------------------- | ------ | ---- | ------------ | ----------------------------------------- |
| `rules`                 | array  | 34   | 없음         | Phase 4b 분석                             |
| `rules_step_4c_carcost` | array  | 22   | 없음         | Phase 4c 분석                             |
| `business_rules`        | array  | 56   | `-001`       | chain 1 진입 직전 normalize (사용자 우회) |

**`analysis.rules` = array** 이므로 `analysis.rules.business_rules` 는 undefined → BR set 비어있음 → discovery-spec 의 모든 BR 참조 = `discovery.br_intent.unknown_br` critical.

### 2.3 영향 범위

- 본 PoC `discovery-extraction-validator` 실행 시 12 CRITICAL (chain 1 forward 차단)
- 동종 validator (`schema-validator`) = ajv 기반 / schema 자체는 array 검증 정상 / 영향 ❌
- 기존 PoC #01~#16 = 같은 validator 미사용 (분석 산출물 paradigm 다름) → 회귀 위험 검증 의무

## 3. 시행 안 (option X / additive only)

### 3.1 코드 fix

**파일**: `ai-native-methodology/tools/discovery-extraction-validator/src/validator.js` (라인 30~35)

**before** (1 경로):

```js
const analysisBrs = new Set();
if (analysis?.rules?.business_rules) {
	for (const br of analysis.rules.business_rules) {
		if (br.id) analysisBrs.add(br.id);
	}
}
```

**after** (다중 경로 / additive backward-compat):

```js
const analysisBrs = new Set();
const brCandidates = [
	analysis?.rules?.business_rules, // 기존 가정 (backward-compat)
	analysis?.business_rules, // top-level array (poc-17 normalize)
	analysis?.rules, // top-level rules array (analysis baseline)
	analysis?.rules_step_4c_carcost, // dual key 두번째 (poc-17)
];
for (const arr of brCandidates) {
	if (Array.isArray(arr)) {
		for (const br of arr) {
			if (br?.id) analysisBrs.add(br.id);
		}
	}
}
```

### 3.2 test 보강

**파일**: `ai-native-methodology/tools/discovery-extraction-validator/test/validator.test.js`

신규 test 3개 (additive):

1. `analysis.business_rules` top-level array 단독 → BR 매치 ✅
2. `analysis.rules` top-level array (suffix 없음) → BR 매치 ✅
3. `analysis.rules_step_4c_carcost` dual key → BR 매치 ✅

기존 test (기존 `analysis.rules.business_rules` 경로) 무변경 (backward-compat 입증).

### 3.3 외부 검증 (사실 정정 / Phase 2 실측 후)

본 PoC 디렉토리 (`~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/`) 안 validator 직접 실행:

- 본 fix 후 = **0 findings / UC coverage 100%** ✅
- 본 fix 전 (stash) = **동일하게 0 findings ** (사용자 chain 1 진입 직전 normalize 우회로 이미 GREEN)

**본격 narrative 정정** :

- 본 PoC 영향 0 (이미 GREEN / chain 1 forward 자격 이미 충족)
- 본 fix 의 사실 가치 = paradigm-level resilience 추가 (test 4 신규 입증 / 미래 PoC dual-key + suffix 일관 시 자연 인식 / 외부 normalize 우회 불필요)
- session 53차 chain-intervention-log 안 "RED 12 CRITICAL" 기록 = 사실 검증 부족 가능성 (root_cause 본문 "validator 는 rules array 만 lookup" = 실제 validator 코드와 mismatch — validator 는 `rules.business_rules` 를 봄 / `rules` array 만 보는 게 아님). 사실 = session 52차 RED→GREEN 정합 후 session 53차 동일 fixture 재실행 시 동일 GREEN 자연 자격 (state mutation evidence 부재).

## 4. 절차

### Phase 1. validator src + test 수정

P-1. `src/validator.js` 다중 경로 lookup (3.1 안)
P-2. `test/validator.test.js` 신규 test 3개 (3.2 안)
P-3. workspace test 실행 (`npm test --workspace tools/discovery-extraction-validator`) → all pass 확인

### Phase 2. 외부 PoC 실측 검증

P-4. 본 PoC `.aimd/output/` 안 validator 직접 invoke → 12 CRITICAL → 0 입증
P-5. 다른 PoC (poc-01~poc-16) 회귀 점검 (sampling 2~3 PoC / 분석 산출물 보존)

### Phase 3. release ceremony (v11.5.1 PATCH 또는 v11.6.0 MINOR)

P-6. semver 결단 = PATCH (도구 결함 fix / additive backward-compat / breaking 0) 추천
P-7. 3-way version sync (plugin.json + package.json + CLAUDE.md)
P-8. CHANGELOG entry + DEC-2026-05-29-validator-dual-key-businessrules-fix 신설 + INDEX append
P-9. STOP-3 검증 (workspace test + release-readiness + skill-citation + version 3-way + breaking 0)
P-10. STATUS.md session 54차 entry append + CLAUDE.md sync

### Phase 4. paradigm A 처분 + 작업 트리 잔여 처리

P-11. paradigm A 본격 강화 narrative 본격 명문화 (DEC 본문 / LL-validator-dual-key-01 자산화 / Phase 2 실측 후 본격 본격 정정)

- paradigm A retract narrative ❌ — Phase 2 실측 결과 = 본 PoC 이미 GREEN / 본 fix 와 무관하게 chain 1 forward 자격 충족 / paradigm A retract 시행 자격 자연 ❌
- paradigm A 본격 가치 self-입증 axis — session 53차 LL-poc-17-15 본문 "Phase 3 validator 실행 결과 = 12 CRITICAL" narrative + chain-intervention-log root_cause 본문 mismatch = self-기록 사실 검증 부족 cycle 의 본격 본격 자기-차단 사례. paradigm A 가 막으려던 self-합리화 narrative 자연 발생 의 본격 본격 본격 입증 사례.
- 본 fix 시행 자격 = paradigm-level resilience 자체 axis 자연 (paradigm A 본격 retract 의무 부재 / 별 axis 자격).
  P-12. 본 레포 작업 트리 잔여 commit
- `.claude/plans/plan-poc17-analysis-revisit-axis-1-2.md` (LL-poc-17-11~15 + §8.2 carry queue)
- `.claude/plans/plan-validator-dual-key-fix.md` (본 plan)
- `.claude/plans/chain-harness-70-80-axis-clarification.html` 결단 의제 (commit / delete)
  P-13. memory 갱신 (`project_poc17_dogfooding.md` / carry queue C-validator-dual-key-businessrules ✅ resolved)

### Phase 5. chain 1 재진입 자격 보고

P-14. chain 1 재진입 자격 충족 확인 (외부 PoC validator 0 CRITICAL)
P-15. chain 1 재진입 결단 의제 = 별 plan ladder (본 plan scope 외 / 다음 session 또는 본 session 안 별 cycle)

## 5. 사용자 승인 묶음 (3원칙 / 5 핵심 결정)

### 결단 1. semver 결단

- **A. v11.5.1 PATCH** 추천 (도구 결함 fix / additive backward-compat / breaking 0 / 정합)
- B. v11.6.0 MINOR (multi-path lookup 신규 능력 / additive feature)

### 결단 2. paradigm A 처분 (Phase 2 실측 후 본격 본격 정정)

사용자 결단 = "조건부 retract" (사실 정정 전) → Phase 2 실측 후 본격 본격 정정 = paradigm A 본격 강화 axis 본격 자연 (retract 자격 자연 ❌).

본 case 사실:

- 본 PoC pre-fix 도 GREEN (이미 chain 1 forward 자격 충족)
- session 53차 LL-poc-17-15 narrative + chain-intervention-log root_cause 본문 = self-기록 사실 검증 부족 사례 자연 자격
- 본 fix 시행 자격 = paradigm-level resilience 별 axis / paradigm A retract 의무 부재 / 본격 paradigm A 본격 가치 self-입증 사례 본격 자산화 의무

- **A'. paradigm A 본격 강화 (Phase 2 사실 정정 후 본격 본격 자연)** — retract ❌ / self-기록 사실 검증 부족 cycle 차단 paradigm A 본격 가치 self-입증 사례 본격 자산화 의무
- ~~A. 조건부 retract~~ (사실 정정 전 / Phase 2 실측 후 본격 retract)
- ~~B. 본격 retract~~ (사실 정정 전 / Phase 2 실측 후 본격 retract)
- ~~C. retract 보류~~ (사실 정정 전 / Phase 2 실측 후 본격 retract)

### 결단 3. 외부 PoC 검증 scope

- **A. 본 PoC 0 CRITICAL 입증 + 다른 PoC 2~3 sampling 회귀 점검** 추천
- B. 본 PoC 0 CRITICAL 입증 만 (다른 PoC = workspace test 통과로 충분)

### 결단 4. HTML 파일 (`.claude/plans/chain-harness-70-80-axis-clarification.html`) 처분

- A. commit (보존 자산 / 본 session 진입 시 확인 시점부터 plan 자산)
- **B. delete** 추천 (정체 불명 / 본 plan 외 / 본 session 결과물 아님)
- C. keep untracked (보류)

### 결단 5. chain 1 재진입 시기

- **A. 별 plan ladder (본 plan 종결 후 / 본 session 안 또는 다음 session)** 추천 (scope 부풀림 회피)
- B. 본 plan 안 통합 (chain 1 재진입까지 한 묶음)
- C. 본 session 종결 (chain 1 재진입 = 다음 session)

## 6. 위험 / 제약

| ID    | 위험                                                   | severity | 완화                                                                                     |
| ----- | ------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------- |
| R-001 | 기존 PoC #01~#16 회귀 (분석 산출물 paradigm 다름)      | medium   | sampling 2~3 PoC 회귀 점검 (결단 3.A) + workspace test 전수 pass                         |
| R-002 | additive backward-compat 가정 vs 실 fixture mismatch   | low      | 기존 test 보존 + 신규 test 3 additive only                                               |
| R-003 | paradigm A 조건부 retract 가 다른 case 에서 오용 위험  | medium   | DEC 본문 본 case 한정 명문화 + LL-validator-dual-key-01 자산화 (조건부 retract paradigm) |
| R-004 | 본 fix 후 axis 3 (suffix 형식 paradigm) 자체 해소 여부 | low      | 본 fix = lookup 경로 보강 만 / 형식 paradigm = v11.5.0 skill 본문 enforcement 보존       |
| R-005 | release-readiness 22/22 보존 의무                      | low      | additive only / criterion 영향 ❌                                                        |

## 7. 검증 (4원칙 STOP-3 정합)

### 7.1 본 레포 axis

- workspace test 영향 검증 (787 → 790 정도 추정 / 신규 test 3 additive)
- release-readiness 22/22 보존 ✅
- skill-citation 0 stale ✅
- version 3-way 11.5.0 → 11.5.1 (결단 1.A)
- breaking 0 ✅

### 7.2 외부 PoC axis (corroboration)

- 본 PoC validator 12 CRITICAL → 0 ✅
- 다른 PoC sampling 회귀 ❌ (결단 3.A)

## 8. Lessons Learned (4원칙 4단계 / 본 plan 종결 시점 자산화)

### LL-validator-dual-key-01 — paradigm A 본격 가치 self-입증 사례 (Phase 2 실측 후 본격 본격 정정)

**Why**: session 54차 본 plan 안 Phase 1 종결 후 Phase 2 외부 PoC 실측 시점 = 본격 사실 정정 발견 — 본 PoC 가 pre-fix 도 GREEN (사용자 chain 1 진입 직전 normalize 우회로 chain 1 forward 자격 이미 충족). session 53차 LL-poc-17-15 본문 "Phase 3 validator 실행 결과 = 12 CRITICAL" narrative + chain-intervention-log root_cause 본문 "validator 는 rules array 만 lookup" = 실제 validator 코드와 mismatch (validator 는 `rules.business_rules` 를 봄 / `rules` array 만 보는 게 아님). 즉 session 53차 LL 본문 = self-기록 사실 검증 부족 자연 발생 사례. paradigm A 가 본격 막으려던 self-합리화 narrative 가 본격 본격 발생 = paradigm A 본격 가치 self-입증 .

**How to apply**: paradigm A (self-referential drift 회피) 의 본격 가치 평가 시 (a) self-기록 사실 narrative 자체 의 검증 본격 의무 (self-기록 LL / chain-intervention-log / plan §8 등 self-narrative 본격 의심 의무) + (b) 외부 검증 fixture (실 PoC 실행) 시점 narrative 와 self-기록 narrative 본격 cross-check 의무 + (c) cosmetic vs structural 격상 narrative 시 = 격상 trigger fixture 본격 재현 의무 (state mutation evidence 부재 시 narrative 본격 의심) + (d) paradigm A retract 결단 본격 시점 = narrative 검증 후 본격 (narrative 검증 부족 시 retract 자격 본격 자연 ❌). [[feedback_self_referential_corrective_drift]] + [[feedback_fact_validation]] 본격 정합.

### LL-validator-dual-key-02 — validator path 가정 결함 paradigm-level resilience 가치

**Why**: validator src 코드 안 lookup 경로 (`analysis.rules.business_rules`) = 결정적 가정 . 본 PoC 본격 normalize 우회 (통합 array + suffix 추가) 가 본격 외부 layer 본격 paradigm-level resilience 본격 self-감지 사례. 즉 우회 자체 = paradigm-level resilience 부재 의 본격 표면 자격 자연. 본 fix = 우회 본격 폐기 자격 + 미래 PoC (dual-key + suffix 일관 paradigm) 자연 인식 자격.

**How to apply**: validator src 안 결정적 lookup 경로 가정 시 (a) test fixture 가 다양한 paradigm 경로 망라 의무 (단일 fixture paradigm = silent sink) + (b) 외부 PoC 본격 normalize 우회 사실 = 도구 paradigm-level resilience 본격 부족 신호 (우회 본격 사실 자체 = silent finding) + (c) lookup 경로 가정은 가능한 다중 경로 backward-compat paradigm (additive only) + (d) 새 paradigm 발생 시 경로 추가 본격 자격 (변경 ❌) + (e) 외부 우회 본격 폐기 자격 = fix 본격 시행 후 자연 (본 PoC 안 통합 array 보존 자격 / 본 PoC 차기 cycle 또는 다음 PoC 자연 폐기).

### LL-validator-dual-key-03 — self-기록 사실 검증 부족 cycle 본격 본격 본격 자기-차단 사례

**Why**: 본 plan 안 § Phase 2 실측 직전 narrative = "본 PoC chain 1 forward 자격 NOT MET / 12 CRITICAL → 0 / paradigm A 조건부 retract 자격 자연" — 모두 사실 부족 narrative . Phase 2 실측 시점 본격 발견 = pre-fix 도 GREEN + chain-intervention-log root_cause 본문 mismatch. 즉 본 plan 자체가 self-기록 사실 검증 부족 cycle 의 본격 본격 본격 사례 자연 자격. Phase 2 실측 단계 본격 본격 self-차단 — 본격 시행 본격 전 본격 사실 검증 본격 본격 본격 의무 fixture (STOP signal 본격 자연 자격).

**How to apply**: paradigm-level fix 본격 시행 plan 작성 시 (a) plan 본문 안 narrative 본격 본격 본격 self-기록 사실 검증 본격 본격 의무 (외부 PoC 실측 fixture 본격 본격 본격 의무) + (b) plan Phase 2 시점 pre-fix 실측 본격 본격 본격 의무 (실측 evidence 부재 narrative = STOP signal ) + (c) self-narrative 검증 부족 발견 시점 = plan 본문 본격 정정 본격 본격 본격 의무 + 사용자 결단 본격 보고 본격 본격 의무 + (d) 본 LL 본격 인용 본격 의무 (paradigm-level fix 모든 plan 본격 본격 본격 self-검증 fixture 본격 의무). [[feedback_strict_exposes_drift]] + [[feedback_fact_validation]] + LL-fsim-11 본격 본격 본격 본격 본격 정합 + 본 LL 본격 본격 본격 paradigm-level fix plan 본격 본격 본격 entry-fixture 본격 본격 본격 자격 자연.

## 9. 참고 / 인용

- 직전 plan ladder = `.claude/plans/plan-poc17-analysis-revisit-axis-1-2.md` (§8 LL-poc-17-15 / §8.2 carry queue `C-validator-dual-key-businessrules` 등록)
- [[feedback_self_referential_corrective_drift]] — paradigm A 본격 명세
- [[feedback_dual_goal_migration_plus_plugin]] — 듀얼 목표
- [[feedback_strict_exposes_drift]] — strict 가 fixture drift 폭로 paradigm
- LL-codegraph-03 — 외부 OSS bridge 통합 자격 3 criterion (외부 요구 + v1.0+ 6개월 maturity + PoC ≥2)
- DEC-2026-05-29-axis-3-skill-strict-instruction (v11.5.0 / skill 본문 enforcement)

## 10. 4원칙 ladder

- **1원칙 종결** ✅ (본 plan.md / 사실 검증 종결 + 시행 안 명확)
- **2원칙 research** = 가벼움 (이미 사실 검증 종결 / sub-agent 비용 부재 axis)
- **3원칙 사용자 승인** = §5 결단 5 묶음 보고 (본격 시행 전 확정 의무)
- **4원칙 실패 시 revert** = §6 R-001~005 정합 / 회귀 발생 시 revert + LL 기록 + 1원칙 재시작
