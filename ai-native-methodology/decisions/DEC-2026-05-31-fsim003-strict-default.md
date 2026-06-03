# DEC-2026-05-31-fsim003-strict-default

> v11.16.0 MINOR (P4) SSOT. chain-coverage-validator cross-ref broken-path 검사 = **strict(high/blocking) 기본** 전환 + `--warn-paths` escape hatch. finding `F-SIM-003` 종결.
> 상태: **승인 + 시행 완료** (2026-05-31). 사용자 우선순위 진행 결단 / P4 결정 지점 전부 관례적(별도 질문 ❌ — code-pointer·br-cross 선례대로 escape hatch + flip).

## 배경

`F-SIM-003`(2026-05-18) = chain-coverage-validator 가 cross-ref broken-path 를 default warn(medium/non-blocking)으로만 — `--strict-paths` opt-in. 보류 사유였던 ① autoDetectProjectRoot 오류(false-positive) = v9.0.4 fix ② cooling-off paradigm = v10.0.0 영구 폐기 ③ 5 PoC(poc-03/04-mini/05/06/07/14) 0 broken sweep = v9.0.5 → §8.1 ≥2 corroboration 충족 + 보류 근거 모두 소멸.

## 결단 — strict default flip + `--warn-paths` (MINOR / breaking 0)

- `tools/chain-coverage-validator/src/cli.js` — `strictPaths` 기본 `false`→`true` (broken-path = high/blocking).
- `--warn-paths` 신설 = 옛 warn-mode(medium/non-blocking) 복귀 / 비상 escape hatch / release 시 ❌ 의무. (code-pointer-validator·br-cross-consistency `--strict` 대칭 — tool family 일관성.)
- `--strict-paths` = 이제 default no-op (backward-compat 보존 / 기존 caller 무영향).
- help text 동일 commit 갱신.

## 무회귀 실측

poc-05 chain-coverage = release-readiness check3 호출(--strict-paths 없음) 그대로 → strict_mode true / broken_path_count 0 / coverage critical·high 0 / **exit 0**. 즉 default flip 으로 check3 무회귀. 5 PoC 0 broken sweep(v9.0.5) 이미 완료라 RED 전환 0.

## STOP-3

workspace 903/903(chain-coverage 38→41 / +3 CLI test) + release-readiness 23/23 + skill-citation 0 stale + version 3-way 11.16.0 + breaking 0 = **MINOR**.

## carry

`F-SIM-003` ✅ 종결. (잔여 없음 — strict mode 자체는 2026-05-18부터 존재 / 본 release = config default flip + escape hatch.)

## paradigm 정합

- cooling-off 영구 폐기(v10.0.0) → "defer for corroboration" carry 패턴 무효 → strict-by-default 정렬(code-pointer/br-cross/plan-coverage `--strict` 추세).
- §8.1: strict mode 자체는 ≥2 PoC(5종 sweep) 입증 / flip = config toggle (신규 기능 아님 / 과적합 위험 ≈ 0).
- escape hatch = 실 codebase 점진 enforcement 배려 (silent breakage 회피).

## 인용

- `tools/chain-coverage-validator/src/cli.js` (strictPaths default + --warn-paths) + `test/validator.test.js` (+3 CLI)
- CHANGELOG v9.0.4(autoDetect fix) / v9.0.5(5 PoC sweep) / v10.0.0(cooling-off 영구 폐기 / DEC-2026-05-25-cooling-off-영구-폐기-재확인)
- `scripts/release-readiness.js` check3 (poc-05 chain-coverage 무회귀)
