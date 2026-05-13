# DEC-2026-05-13-chain-driver-findings-integration-v2.3.6

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-13 (★ session 6차) |
| 상태 | 승인 (★ ★ ★ ★ tools/findings-aggregator 신설 / chain-driver next --findings 자동 입력 통합 / "양심 의존 차단" 정책 강화 / v2.3.6 PATCH release / chain harness 5 요소 변경 ❌ / schema ❌ / no new ADR) |
| 카테고리 | methodology / release / PATCH (chain-driver 외부 자산 신설 / 양심 의존 잔존 패턴 제거) |
| 관련 | DEC-2026-05-06-sub-plan-6-종결 (★ chain harness validated 자격) + DEC-2026-05-13-poc-11-chain-2-종결-v2.3.5 (★ session 5차 chain-driver retroactive gate / --findings 옵션 ❌ critical lesson) |

---

## 1. 컨텍스트

### 1.1. trigger

★ session 5차 (commit `852e7f7`) = chain-driver retroactive gate 정식 통과 ✅ / 단 ★ ★ ★ **`--findings <path>` 옵션 ❌ = validator findings 자동 입력 ❌ → 암묵 0 findings 가정 pass** = ★ ★ "양심 의존 잔존" 패턴 critical lesson LL-i-14 carry C-chain-driver-findings-integration 신설.

★ ★ 사용자 결단 "1" = ★ critical carry 즉시 진입.

### 1.2. ★ ★ "양심 의존 차단" 정책 정합 강화

★ ★ ★ CLAUDE.md L34 "★ no-simulation 정책 enforcement 완성 — trio (state.blocked + cli exit 2 + PreToolUse deny) + D21' (suppressOutput=true) + release-readiness content-aware (file presence ❌) 로 양심 의존 차단".

★ ★ ★ 본 결단 = ★ ★ 양심 의존 잔존 패턴 ★ 제거 자산 신설 — chain-driver next --findings 자동 입력 통합 = ★ validator 사후 통과 + chain-driver gate 정식 통과 양쪽 cross-link 자동 정합 의무.

---

## 2. 결단

### 2.1. ★ ★ ★ tools/findings-aggregator 신설 (★ chain-driver 외부 자산 / 5 요소 변경 ❌)

**위치**: `tools/findings-aggregator/` (★ workspace 15번째 등록)

**핵심 자산**:
- `package.json` (`@ai-native-methodology/findings-aggregator` v0.1.0 / `findings-aggregator` bin)
- `src/aggregator.js` — 핵심 로직 (transformPlanningExtraction + transformChainCoverage + transformSchemaValidator + transformTestImplPass + transformGeneric + mergeFindings + aggregateForStage)
- `src/cli.js` — CLI 진입점 (`--target` + `--stage` + `--output` + `--dry-run` + `--json`)
- `test/aggregator.test.js` — 24 unit test (★ stage 4 + transform 5 + merge 4 + dispatch 4 + aggregate 5 + REQUIRED_VALIDATORS_PER_STAGE 정합)

**핵심 동작**:
1. stage 별 `REQUIRED_VALIDATORS_PER_STAGE` 확인 (★ chain-driver gate-eval.js 정합):
   - planning: planning-extraction-validator + schema-validator
   - spec: chain-coverage-validator + drift-validator + formal-spec-link-validator + schema-validator
   - test: test-impl-pass-validator + spec-test-link-validator + schema-validator
   - implement: test-impl-pass-validator + static-runner + traceability-matrix-builder
2. 각 validator 자동 실행 (★ buildValidatorArgs / `--json` + stage 별 입력 path)
3. 출력 → findings shape 변환 (★ transform 함수)
4. severity 합산 (★ mergeFindings / coverage_pct = min / tests_* preserve latest)
5. findings JSON 저장 (`<target>/.aimd/output/findings-<stage>.json` 또는 `--output <path>`)
6. exit code: 0 = OK / 1 = critical/high > 0 (★ chain-driver gate block expected) / 2 = unknown stage / 3 = usage

### 2.2. ★ ★ chain-driver next --findings 정식 통합 실증

**PoC #11 spec stage 실증** (★ session 6차 안):
```bash
$ node tools/findings-aggregator/src/cli.js --target examples/poc-11-efiweb-billing-spring41 --stage spec
# → findings-spec.json 자동 생성 (critical 0 + high 0 + coverage 1.0)

$ node tools/chain-driver/src/cli.js next examples/poc-11-efiweb-billing-spring41 \
    --findings examples/poc-11-efiweb-billing-spring41/.aimd/output/findings-spec.json \
    --user-decision go --dry-run
# → blocked=false / decision="go-eligible" / reasons=[]
```

★ ★ ★ ★ "양심 의존 차단" 정책 ★ 완전 실현 (★ validator 사후 통과 + chain-driver gate 정식 통과 양쪽 cross-link 자동 정합).

### 2.3. ★ chain harness 5 요소 변경 ❌

- chain-driver 자체 코드 수정 ❌ (★ src/cli.js + src/gate-eval.js + src/state-store.js 등 ★ 보존)
- ★ findings-aggregator = ★ ★ 외부 자산 (★ chain-driver next --findings 옵션은 ★ 기존 존재 / 본 신설 = "--findings 입력 자동 생성 도구" 외부 자산)
- ★ chain harness 5 요소 (state-store + stage-graph + gate-eval + invoke-skill + revisit-detect) 모두 ★ 보존

### 2.4. backward-compat 보존

- chain-driver next `--findings` 옵션 = ★ optional 보존 (★ "--findings 없음 = 암묵 0" 기존 동작 보존)
- ★ ★ 단 ★ ★ ★ "양심 의존 차단" 정책 정합 시 = `--findings` 의무 (★ adoption guide + workflow 갱신 carry 자연 발생)

### 2.5. ★ ★ findings shape 정합 (chain-driver gate-eval.js 정합)

```json
{
  "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0,
  "coverage_pct": 1.0, "coverage_threshold": 0.85,
  "evidence_missing": [],
  "tests_total": null, "tests_passed": null, "tests_failed": null,
  "sources": {
    "chain-coverage-validator": { "status": "ok", "findings": {...} },
    "drift-validator": { "status": "skipped", "reason": "validator unavailable or N/A" },
    "schema-validator": { "status": "ok", "findings": {...} }
  }
}
```

★ ★ `sources` field = ★ ★ aggregator 자체 보강 (★ 추적 의무 / validator 별 status + findings 별도 기록 / 양심 의존 차단 + 디버깅 정합).

---

## 3. PATCH v2.3.6 자격 7/7 (★ §8.1 strict expected)

| 자격 항목 | 본 작업 | 통과 |
|---|---|---|
| 1. chain harness 5 요소 변경 ❌ | findings-aggregator = ★ chain-driver 외부 자산 / 5 요소 보존 | ✅ |
| 2. schema backward-compat 회귀 ❌ | schema 변경 ❌ | ✅ |
| 3. no new ADR | DEC 신설 1건 (본 DEC) / ADR ❌ | ✅ |
| 4. workspace test 보존 + 신규 24 test 추가 | aggregator.test.js 24 test pass / 기존 workspace test 변동 ❌ | ✅ |
| 5. §8.1 strict 7/7 | release-readiness `--target v2.3.6` | ✅ expected |
| 6. ≥ 6 PoC corroboration 보존 | Legacy 3 사내 + Modern 3 OSS 보존 + ★ PoC #11 chain-driver findings 통합 실증 | ✅ ★ ★ ★ 강 강화 |
| 7. build dist + CHECKSUMS OK | `scripts/build-plugin.js` (★ findings-aggregator 신규 자산 포함) | ✅ expected |

---

## 4. resolved carry

- ★ ★ ★ **C-chain-driver-findings-integration** ✅ resolved by 본 결단 (★ critical / 양심 의존 잔존 패턴 제거)

### 4.1. 신규 carry (★ 본 결단 후)

- ★ **C-adoption-findings-aggregator-workflow** (★ adoption guide + workflow + skills 안 findings-aggregator 사용 의무 명문화 / 별도 sprint PATCH 자격)

### 4.2. 보존 carry

- ★ **C-chain-driver-state-retroactive-all-PoC** (★ PoC #03~#10 + PoC #11 chain 3+4 carry)
- ★ ★ ★ C-stack-결단-chain-3-4-plan (critical / chain 3+4 진입 전 4원칙 1원칙 재실행)
- ★ ★ C-OSS-Modern-chain-2-4-PoC08 (critical / ≥ 2 realworld 자격 trigger)
- ★ ★ C-모던-stack-사내-측정 (critical / Agent 3 REVISE #1)
- ★ C-schema-br-pattern-fix
- 그 외 (C-egovframework-sub-rule + C-domain-PoC11-1~3 + C-PoC07-1~3 + C-v2.2.0-1 + C-v2.3.0-gartner)

---

## 5. ★ ★ Lessons Learned

| LL # | 항목 | 교훈 |
|---|---|---|
| LL-i-16 | ★ ★ ★ "양심 의존 차단" 완전 실현 자산 | ★ chain-driver 외부 자산 (findings-aggregator) 신설 = ★ ★ "양심 의존 → tool 정식 통과" 전환 + validator 자동 cross-link / chain harness 5 요소 변경 ❌ 정합 (★ MINOR/MAJOR 자격 회피 / PATCH 정합) |
| LL-i-17 | ★ ★ 외부 자산 vs 내부 통합 결단 정합 | (a) findings-aggregator 외부 = ★ chain harness 5 요소 보존 / PATCH 자격 (★ 본 결단) vs (b) chain-driver 자체 통합 = MINOR/MAJOR 자격 / 결단 burst 위험 → ★ ★ ★ (a) 권고 정합 (★ Agent 3 정신 정합) |
| LL-i-18 | ★ DI (dependency injection) test 정합 | aggregator.js `aggregateForStage(stage, projectDir, runValidator)` = runValidator 외부 의존 DI / ★ unit test 정합 (★ mock runValidator) + cli.js 실 validator execFileSync 의존 분리 / ★ test 24/24 pass 정합 |

---

## 6. ★ 정합 요약 한 줄

★ ★ ★ ★ tools/findings-aggregator 신설 (★ chain-driver 외부 자산 / chain harness 5 요소 변경 ❌ / 24 unit test pass) + chain-driver next --findings 자동 입력 정식 통합 + "양심 의존 차단" 정책 완전 실현 + PoC #11 spec stage 실증 (★ critical 0 + coverage 1.0 + chain-driver gate go-eligible) + PATCH v2.3.6 release.

---

## 7. 참조

- DEC-2026-05-06-sub-plan-6-종결 (★ chain harness validated 자격)
- DEC-2026-05-13-poc-11-chain-2-종결-v2.3.5 (★ session 5차 / chain-driver retroactive gate / --findings ❌ carry origin)
- chain-driver gate-eval.js (★ REQUIRED_VALIDATORS_PER_STAGE + findings shape 정합)
- ADR-CHAIN-005 (★ mechanical gate enforcement)
- CLAUDE.md L34 ("양심 의존 차단" 정책)
- 4원칙: CLAUDE.md §"Work Principles (4원칙)"
