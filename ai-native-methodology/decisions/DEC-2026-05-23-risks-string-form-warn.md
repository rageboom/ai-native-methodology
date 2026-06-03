# DEC-2026-05-23-risks-string-form-warn

> **일자**: 2026-05-23
> **session**: 34차 (현 session) / v8.11.0 MINOR release
> **카테고리**: methodology / chain-coverage-validator forward lane 신설 — risks_and_constraints string form (legacy carry) warn
> **상태**: 승인 ( 사용자 "ㄱㄱ" 2026-05-23 / Senior REVISE-1 사전 합의 / additive only)
> **Resolves**: DEC-2026-05-23-analysis-validator-poc06-11-resolve §8 carry C-risks-string-form-warn-v811 (medium 우선순위)
> **Cross-link**: v8.10.0 §3 D2 Senior REVISE-1 / v8.10.0 schema 진화 paradigm

---

## 1. 배경

v8.10.0 release ceremony 안 Senior critique REVISE-1 흡수 사항 — `risks_and_constraints` items polymorphic anyOf[string, object] 도입 후 string 분기 = legacy carry 한정 명시 enforcement. 본 DEC = 그 forward lane 본격 시행.

v8.10.0 §3 D2 결단: "$comment 'string = legacy carry 한정 / 신규 = object 의무' + **chain-coverage-validator `risks_string_form_warn` lane v8.11.0 carry**" — silent omission 차단 본질 보존.

## 2. 실측 (4원칙 1단계)

### 2.1 9 PoC string vs object 분포

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

총 string=18 (5 PoC) / object=28 (4 PoC). 본 lane = legacy carry 5 PoC 영구 warn.

## 3. 결단

| #   | 결단                                                                                                                                                                     | 채택 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| D1  | `validateRisksForm(planning)` 5번째 export function 신설 (validateChainCoverage + validateCrossRefPaths + validateAntipatternCoverage + validateConfidenceCoverage 다음) | ✅   |
| D2  | severity = `low` (warning만 / chain coverage gate 종결 차단 ❌ / blocking ❌)                                                                                            | ✅   |
| D3  | finding kind = `chain.planning.risks_string_form_warn` (paradigm 정합)                                                                                                   | ✅   |
| D4  | CLI wire + `--json` output 안 `risks_form` 키 + 사람-친화 출력                                                                                                           | ✅   |
| D5  | test 4종 신설 (all-string / all-object / mixed / graceful)                                                                                                               | ✅   |
| D6  | v8.11.0 MINOR (additive — function + CLI flag + test 4 / breaking 0)                                                                                                     | ✅   |
| D7  | 5 PoC legacy 산출물 마이그레이션 = 별도 carry session (정보 손실 risk 평가 의무 / 사용자 결단)                                                                           | ✅   |

## 4. 시행 (4원칙 4단계)

### 4.1 validator.js

5번째 export function `validateRisksForm(planning)` 신설:

```js
export function validateRisksForm(planning) {
	const findings = [];
	const risks = Array.isArray(planning?.risks_and_constraints)
		? planning.risks_and_constraints
		: [];
	let stringCount = 0,
		objectCount = 0;
	const stringIndices = [];
	risks.forEach((item, idx) => {
		if (typeof item === 'string') {
			stringCount++;
			stringIndices.push(idx);
		} else if (item !== null && typeof item === 'object') {
			objectCount++;
		}
	});
	if (stringCount > 0) {
		findings.push({
			kind: 'chain.planning.risks_string_form_warn',
			severity: 'low',
			string_count: stringCount,
			object_count: objectCount,
			affected_indices: stringIndices,
			message: `risks_and_constraints 안 string form ${stringCount} item — legacy carry 한정 (v8.10.0+ object form 권장) ...`,
		});
	}
	return {
		findings,
		summary: { total_findings, string_count, object_count, total_count },
	};
}
```

### 4.2 cli.js wire

- `import { ..., validateRisksForm }`
- `const risksFormResult = validateRisksForm(planning);`
- `--json` output 안 `risks_form` 키 추가
- 사람-친화 출력: `[risks-form] string=N / object=M / total=K ( v8.11.0 / Senior REVISE-1 legacy carry warn lane)`

### 4.3 test 4종 (`test/validator.test.js`)

- all-string form → low finding emit (string_count + affected_indices 정확)
- all-object form → no finding (신규 paradigm 정합)
- mixed string + object → low finding emit + 양측 count 정확 (3 items: 2 string + 1 object)
- empty / missing field → graceful (validateRisksForm({}) / [] / null / undefined → no finding)

### 4.4 자산 갱신

- `chain-coverage-validator/package.json` 0.1.0 → 0.2.0 (workspace MINOR)
- `plugin.json` 8.10.0 → 8.11.0 + `package.json` 8.10.0 → 8.11.0 (3-way sync)
- `CHANGELOG.md` v8.11.0 entry
- `CLAUDE.md` "plugin.json v8.11.0" sync + 현재 release 본문 갱신
- 본 DEC + INDEX 최상단 + STATUS session 34차

## 5. STOP-3 hard gate 실측

| Gate                          | 결과                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| chain-coverage-validator test | **30/30 pass** ✅ (신규 4 + 기존 26)                                                             |
| breaking                      | 0 = MINOR (additive — function + CLI + test 4)                                                   |
| version 3-way sync            | plugin.json 8.11.0 / package.json 8.11.0 / chain-coverage-validator 0.2.0 / CHANGELOG v8.11.0 ✅ |
| §8.1 corroboration            | 9 PoC isomorphic 실측 = string 5 PoC + object 4 PoC + lane 정합 = single-PoC overfitting 회피 ✓  |
| Senior REVISE-1 흡수          | v8.10.0 §3 D2 commitment 종결 ✅                                                                 |

## 6. Lessons Learned 신규

- **LL-validator-04** — Senior REVISE-1 carry 종결 cadence = 다음 session 1순위 carry 진행 paradigm (v8.10.0 carry → v8.11.0 release ceremony) / cooling-off 불요 (additive only / breaking 0 / 사전 합의)
- **LL-validator-05** — forward lane 신설 paradigm (silent omission 차단) = chain-coverage-validator 5번째 function = SonarQube/CodeQL/Snyk industry-aligned (severity-aware emit + non-blocking advisory) / DO-178C bidirectional traceability 차용 강화
- **LL-validator-06** — polymorphic items + forward warn lane = schema-touch (v8.10.0) + tool-touch (v8.11.0) 양쪽 결정적 차단 paradigm (drift attractor + silent omission 동시 / paradigm 본격 입증)

## 7. 차기 session carry

| carry                        | 우선순위 | 비고                                                                                                                                                                                     |
| ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-legacy-risks-poc-migration | medium   | 5 PoC (poc-03/04-mini/05/06/07) 18 risks string form → object form 마이그레이션 / 정보 손실 risk 평가 의무 / 사용자 결단 (해당 PoC 의 paradigm value 보존 vs object form 정합 trade-off) |
| C-xmllint-env-absent         | medium   | v8.9.0+v8.10.0 carry 보존 / Linux/Mac libxml2 환경 의무                                                                                                                                  |
| C-operation-md-work-folder   | low      | v8.9.0 carry 보존 / docs/ 흡수 후보                                                                                                                                                      |

---

**참고**:

- 직전 release: v8.10.0 (DEC-2026-05-23-analysis-validator-poc06-11-resolve §8 carry C-risks-string-form-warn-v811)
- chain-coverage-validator industry-aligned lanes:
  - validateChainCoverage (chain link coverage)
  - validateCrossRefPaths (F-SIM-003 / path resolve)
  - validateAntipatternCoverage (F-SIM-001 / industry-aligned SonarQube+CodeQL+Snyk)
  - validateConfidenceCoverage (dep-graph hard/soft / v8.9.0)
  - **validateRisksForm (Senior REVISE-1 / v8.11.0)** ← 본 신설
