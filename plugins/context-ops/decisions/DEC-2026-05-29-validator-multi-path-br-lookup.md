# DEC-2026-05-29 — discovery-extraction-validator multi-path BR lookup (paradigm-level resilience / v11.5.1 PATCH)

> 본 결정 = `C-validator-dual-key-businessrules` carry queue 본격 종결 + paradigm A (self-referential drift 회피) 본격 가치 self-입증 사례 자산화.
> trigger: 사용자 결단 "validator 고치자" (session 54차).
> 자격: methodology body 1 파일 갱신 (additive / breaking 0 / paradigm-level resilience 추가).

---

## 1. 배경 사실

### 1.1 session 52차 시점 (chain 1 진입)

`tools/discovery-extraction-validator/src/validator.js` 안 BR lookup 경로 = 단일 경로 가정:

```js
if (analysis?.rules?.business_rules) {
	for (const br of analysis.rules.business_rules) {
		if (br.id) analysisBrs.add(br.id);
	}
}
```

본 PoC `business-rules.json` 안 BR array = dual key paradigm :

- `rules` (34 / Phase 4b 분석)
- `rules_step_4c_carcost` (22 / Phase 4c 분석)

→ 사용자 chain 1 진입 직전 외부 normalize 우회 시행 (통합 array `business_rules` 56개 + `-001` suffix 추가). 결과 = chain 1 forward 자격 충족 (GREEN) .

### 1.2 session 53차 시점 (analysis revisit)

LL-poc-17-15 본문 + chain-intervention-log 안 "Phase 3 validator 실행 결과 = 12 CRITICAL `discovery.br_intent.unknown_br`" 기록. root_cause 본문 = "validator 는 rules array 만 lookup".

session 54차 Phase 2 실측 결과 사실 정정 :

- pre-fix (validator 기존 코드) 도 0 findings (GREEN) 자연 (CLI 가 `--rules <file>` 으로 받은 파일 통째로 `analysis.rules` 슬롯 → `analysis.rules.business_rules` = `business-rules.json` 의 top-level `business_rules` key = 사용자 통합 array 56개)
- chain-intervention-log root_cause 본문 ("rules array 만 lookup") = 실제 validator 코드와 mismatch (validator 는 `rules.business_rules` 를 봄)
- session 53차 15:41Z RED 12 CRITICAL 기록 = self-기록 사실 검증 부족 가능성 자연 자격 (state mutation evidence 부재 / 또는 session 52차 사실 인용 오류)

---

## 2. 결단 ( Phase 2 실측 후 본격 정정)

### 2.1 본 fix 시행 자격 = paradigm-level resilience 추가 axis 자연

본 fix 의 실제 가치 = 단순 결함 fix 가 ❌ — paradigm-level resilience 추가 :

- 미래 PoC 가 dual-key paradigm 또는 다른 array layout 산출 시 자연 인식
- 외부 normalize 우회 불필요
- additive backward-compat (기존 `analysis.rules.business_rules` 경로 보존 / 4 candidate 경로 추가)

### 2.2 paradigm A 본격 강화 axis ( retract narrative 본격 정정)

본 plan 작성 시점 narrative = "paradigm A 조건부 retract / 본 case 한정 retract" — Phase 2 실측 후 본격 본격 정정 = paradigm A 본격 강화 axis 자연 :

- 본 PoC = pre-fix 도 GREEN / paradigm A retract 자격 자연 ❌
- session 53차 LL-poc-17-15 narrative + chain-intervention-log root_cause 본문 = self-기록 사실 검증 부족 cycle 본격 본격 사례
- paradigm A 가 본격 막으려던 self-합리화 narrative 의 본격 본격 본격 자연 발생 사례
- → paradigm A 본격 가치 self-입증 (retract ❌ / 강화 axis 본격 자연 / [[feedback_self_referential_corrective_drift]] 본격 정합)

---

## 3. 시행 (additive only / breaking 0)

### 3.1 src 보강

`tools/discovery-extraction-validator/src/validator.js` 안 BR lookup 다중 경로:

```js
const brCandidates = [
	analysis?.rules?.business_rules, // 기존 가정 (backward-compat / v11.0.0~v11.5.0)
	analysis?.business_rules, // top-level array (poc-17 chain 1 normalize)
	analysis?.rules, // top-level rules array (analysis baseline)
	analysis?.rules_step_4c_carcost, // dual key 두번째 (poc-17 Phase 4c)
];
for (const arr of brCandidates) {
	if (Array.isArray(arr)) {
		for (const br of arr) {
			if (br?.id) analysisBrs.add(br.id);
		}
	}
}
```

### 3.2 test 보강 (additive)

`tools/discovery-extraction-validator/test/validator.test.js` 안 `describe('multi-path BR lookup (v11.5.1)')` block 신규:

1. top-level `business_rules` array (poc-17 normalize) 매치 입증
2. top-level `rules` array (suffix 없음 / analysis baseline) 매치 입증
3. `rules_step_4c_carcost` (dual key / poc-17 Phase 4c) 매치 입증
4. 어느 경로에도 없으면 critical 본격 발생 (회귀 차단)

### 3.3 외부 PoC 실측

본 PoC 디렉토리 `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/` 안 validator 직접 실행:

- post-fix = 0 findings / UC coverage 100% ✅
- pre-fix (stash) = 동일 0 findings ✅ ( 사용자 normalize 우회로 이미 GREEN)

본 결과 = 본 fix 의 paradigm-level resilience 가치 본격 self-입증 + 본 PoC 영향 0 + session 53차 RED narrative 사실 정정 본격 의무 .

---

## 4. STOP-3 검증

- workspace test 787 → **791 (+4)** / 0 fail ✅
- release-readiness 22/22 보존 ✅
- skill-citation 0 stale 보존 ✅
- version 3-way 11.5.0 → 11.5.1 ✅
- breaking 0 ✅

---

## 5. LL 자산화

LL-validator-dual-key-01~03 (본 plan §8 / `.claude/plans/plan-validator-dual-key-fix.md`):

- **LL-validator-dual-key-01** — paradigm A 본격 가치 self-입증 사례 (Phase 2 실측 후 본격 정정 / self-기록 사실 narrative 검증 본격 의무 paradigm)
- **LL-validator-dual-key-02** — validator path 가정 결함 paradigm-level resilience 가치 (외부 normalize 우회 = paradigm-level resilience 부재 신호 / fix 후 우회 폐기 자격)
- **LL-validator-dual-key-03** — self-기록 사실 검증 부족 cycle 자기-차단 사례 (paradigm-level fix plan 본격 Phase 2 시점 pre-fix 실측 본격 의무 fixture)

---

## 6. carry queue 처분

| carry ID                                                     | 처분           | 사유                                                                                                                       |
| ------------------------------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **C-validator-dual-key-businessrules**                       | ✅ resolved    | paradigm-level resilience 본격 추가로 종결 (session 52차 LL-poc-17-09 trigger + session 53차 LL-poc-17-15 promotion)       |
| C-schema-regex-paradigm-completion                           | 별 cycle 유지  | axis 3 Layer 1 schema 자체 검토 / Type 2 외부 사용자 자연 trigger 의무 / v11.5.0 Path 2 (skill 본문 enforcement) 보완 자격 |
| 본 PoC 통합 array (`business_rules` top-level / -001 suffix) | 자연 폐기 자격 | 선택적 / 본 fix 후 자연 가능 / 본 PoC 차기 cycle 또는 다음 PoC 자연 처분                                                   |

---

## 7. 참고

- 직전 release = v11.5.0 (axis 3 skill 본문 strict instruction / DEC-2026-05-29-axis-3-skill-strict-instruction)
- 직전 session = session 53차 (analysis revisit axis 1+2 외부 시행 + LL-poc-17-11~15)
- 본 plan SSOT = `.claude/plans/plan-validator-dual-key-fix.md`
- LL-poc-17-15 ( session 53차 narrative 사실 검증 본격 의무 fixture / 본 DEC 후 본격 정정 또는 사실 첨언 의무)
- [[feedback_self_referential_corrective_drift]] — paradigm A 본격 명세
- [[feedback_fact_validation]] — research 트랙 사실 정정 의무 paradigm
- [[feedback_strict_exposes_drift]] — strict 가 fixture drift 폭로 paradigm
