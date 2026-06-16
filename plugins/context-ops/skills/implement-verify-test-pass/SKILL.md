---
name: implement-verify-test-pass
description: v2.0 chain 5 종결 skill. test-impl-pass-validator 호출 → 100% pass 검증 + 5종 물증 7 필드 + traceability-matrix green 의무. test-pass-verifier persona 책임. ADR-CHAIN-001 §3 + ADR-CHAIN-004 정합.
allowed-tools: Read, Bash, Edit
---

# verify-test-pass

chain 5 의 **종결 skill**. impl 코드 generate 후 진짜 runner 호출 → 100% pass 검증 / 5종 물증 7 필드 채움 / traceability-matrix 최종 갱신.

## 언제 사용

- `generate-impl-spec` skill 의 step 5 후 의무 호출 (chain 5 진입 cycle).
- chain 5 retry cycle (impl 보강 후 재검증).
- 사용자: "100% pass 확인" / "GREEN 도달 검증" / "release 자격 평가".

## 입력

- `<project>/.ai-context/base/impl-spec.json`
- `<project>/.ai-context/base/test-spec.json`
- `<project>/.ai-context/base/behavior-spec.json` + `acceptance-criteria.json`
- `<project>/.ai-context/base/discovery-spec.json`
- `<project>/.ai-context/runtime/config/test-cmd.json`

## 절차

### 1. test-impl-pass-validator 진짜 호출 (chain 5 GREEN)

`run-test-evidence` skill 호출 (skills/test-run-test-evidence / chain 4-5 횡단). expected_outcome = `all_pass`.

### 2. 100% pass 의무 검증

validator 결과 분석:

- `ok: true` + `fail_count: 0` + `pass_count > 0` → ✅ GREEN 도달.
- `fail_count > 0` → ❌ chain 5 종결 ❌ → 다음 §3 진입.

### 3. fail 발생 시 — finding 분석 + revisit prompt

각 fail TC 마다 4 영역 분류:
| 원인 | revisit target | 처리 |
|---|---|---|
| impl 코드 결함 (가장 흔함) | impl 보강 (no revisit) | impl-spec.md 본문 갱신 + retry |
| test 잘못 generate (acceptance 의도 미반영) | revisit:test | test-spec 갱신 → cycle 재시작 |
| spec 결함 (BHV preconditions 부족) | revisit:spec | behavior-spec / acceptance-criteria 갱신 → cycle 재시작 |
| use case 결함 (planning 단계 추출 오류) | revisit:planning | discovery-spec 갱신 → 가장 큰 cycle |

사용자 결단 의무 (Auto Mode 도 차단 / no-simulation). `_base-invoke-go-stop-gate` skill 호출 / cluster:

1. revisit target 결정 (4 분류 중 하나)
2. 영향 범위 (chain-revisit-detector 자동 추출 미제공 — 현재는 사용자 명시)
3. 재시도 사이클 한도 (권고: 동일 fail 3회+ → escalation)

### 4. 5종 물증 7 필드 + flaky_retries_count 채움

run-test-evidence skill 의 산출 → impl-spec.json `test_pass_evidence` 필드 in-place edit.

### 5. coverage 최종 검증 (verify-coverage skill 호출)

`skills/test-verify-coverage` 호출. 3 metric 분리:

- link_coverage ≥ 0.85 (chain 2-4 forward link)
- test_pass_rate = 1.0 (chain 5 의무)
- line+branch_coverage ≥ 0.80 (정보)

severity_floor (DO-178C DAL A) 검증:

- critical AC 100% test 의무
- high AC link_coverage ≥ 0.95

### 6. traceability-matrix 최종 갱신

`_base-build-traceability-matrix` skill 호출:

```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/traceability-matrix-builder/src/cli.js \
  --discovery  .ai-context/base/discovery-spec.json \
  --behavior   .ai-context/base/behavior-spec.json \
  --acceptance .ai-context/base/acceptance-criteria.json \
  --test-spec  .ai-context/base/test-spec.json \
  --impl-spec  .ai-context/base/impl-spec.json \
  --out-dir    .ai-context/base/traceability/
```

matrix.coverage_summary.red_count == 0 의무 / status 모두 green.

### 7. lint-no-simulation chain-strict (static-runner)

```bash
bash ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/lint-no-simulation.sh <project>/.ai-context/base/ --chain-strict
```

chain 5 strict 의무:

- impl-spec.json `test_invocation_evidence` 7 필드 모두 존재.
- impl-spec.json `impl_modules[].source_files` 가 있으면 commit_hash 의무.
- 위반 시 no-simulation 정책 위배 → release worthy ❌.

### 8. gate #5 final 호출

`_base-invoke-go-stop-gate` skill — chain 5 종결 결단:

- go → release 자격 평가.
- stop → carry 등재.
- revisit:<stage> → §3 분류 결과 적용.

### 9. (외부 채택 / opt-in) adopter corroboration 캡처

gate #5 go = chain 1 cycle (discovery→implement) 완주 = terminal. 외부 adopter(Type 2)가 자기 실 프로젝트에 적용한 경우, corroboration evidence 를 남길지 **사용자 명시 결단** (opt-in / consent — 자동 캡처 ❌ / 데이터 주권):

```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/adopter-evidence-packager/src/cli.js \
  --state .ai-context/state.json \
  --manifest .ai-context/scopes/<scope>/manifest.json \
  --findings <findings.json> \
  --matrix .ai-context/base/matrix.json \
  --stack <csv> --org-type <internal-team|external-oss|individual|undisclosed> --salt <s>
```

- 익명화 (PII best-effort redaction + post-redaction leak guard) 후 `.ai-context/base/adopter-corroboration.json` 생성 (schema = `schemas/adopter-corroboration.schema.json`).
- 자동 전송 ❌ — adopter 가 명시 공유할 때만 maintainer 에 전달 (§8.1 ≥2 distinct domain corroboration 채널).
- 정직: 본 단계 = 캡처 '배선' / Type 2 '측정'은 실 외부 adopter 실행 시 발생 (no-simulation).

## no-simulation 강화 (chain 5 핵심)

본 skill = **no-simulation 정책 chain 5 단계 핵심 enforcement**:

- 모든 5종 물증 7 필드 schema 강제 (impl-spec.schema.json).
- result_hash SARIF Appendix F deterministic.
- shell:true ❌ array argument (test-impl-pass-validator).
- --allow-execute 의무.
- impl_modules.source_files 의 commit_hash 의무 (static-runner chain-strict).

## §8.1 strict 정합 (release 자격 §1~7)

본 skill 통과 = release 자격 §2~§4 충족 데이터:

- §2 진짜 도구 5종 물증 보존 ✅
- §3 drift / dmn / 6 신규 validator 0 violation ✅
- §4 모든 chain stage coverage ≥ 0.85 ✅

추가 §1 (≥ 2 PoC corroboration) + §5~§7 (ADR / matrix / e2e cycle) 은 본 skill 범위 밖에서 충족.

## 인용

- ADR-CHAIN-001 §3 (no-simulation 강화 chain 5)
- ADR-CHAIN-004 (Test Runner Invocation Contract)
- ADR-CHAIN-002 (go/stop gate)
- ADR-CHAIN-003 (revisit loop)
- impl-spec.schema.json `test_pass_evidence` `fail_count const 0`
- master plan §C release 자격 §1~§7
