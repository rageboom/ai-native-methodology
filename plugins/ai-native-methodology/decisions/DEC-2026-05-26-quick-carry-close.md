# DEC-2026-05-26-quick-carry-close

> v10.0.3 PATCH — 잔여 carry quick wins 종결 (macOS env-dependent test fix + session-재시작-검증 carry 표기 정리). breaking 0.

- **결단 일자**: 2026-05-26 (v10.0.3 PATCH)
- **결단자**: 윤주스 (TF Lead) — "남은 carry 처리하자" → Quick wins(env + session-LL) 채택 (poc-재실행 + input-skill-이관 = 별도 carry 보류)
- **범주**: corrective / carry quick wins
- **상태**: 승인 / breaking 0 / PATCH

## 컨텍스트

v10.0.1 + v10.0.2 종결 후 잔여 4 carry 정밀 점검:

| Carry | 실 상태 | 결정 |
|---|---|---|
| macOS env-dependent test | `chain-coverage-validator.autoDetectProjectRoot` 가 POSIX `dirname()` 호출 전 backslash 정규화 안 함 → macOS 에서 Windows path 입력 시 `'.'` 반환 → release-readiness 19/20 (1 fail) | ✅ **본 PATCH 실행** |
| C-v4.1-session-재시작-검증 (LL-v4-04) | DEC-2026-05-17-v4-multi-agent-paradigm-채택 + DEC-2026-05-21 안 LL-v4-04 자산화 완료 / protocol 자산 (별도 코드/문서 작업 불필요) | ✅ **carry 표 종결 표기** |
| C-v4.1-poc-재실행 | 9 PoC 전부 task-plan 없음 (heavy validation) | ⚠️ 보류 (v10.x carry) |
| C-v4.1-input-skill-이관 | figma·swagger 실 중복 (`discovery-from-figma` 는 v4.1 PLACEHOLDER 그대로) / 3 옵션 결단 의무 | ⚠️ 보류 (사용자 결단) |

## 결정

### §1. macOS env-dependent test fix

`tools/chain-coverage-validator/src/validator.js` L25:
```js
// before
const d = dirname(specPath);
// after
const d = dirname(specPath.replace(/\\/g, '/'));
```
이유: POSIX `dirname()` 은 `\` 를 path separator 로 인식 안 함 → Windows path 입력 시 `'.'` 반환 → 후속 정규화 무력화. dirname 전 사전 정규화로 cross-platform 동작.

검증: `node --test tools/chain-coverage-validator/test/validator.test.js` → **38/38 pass** (이전 37/38 / "Windows backslash path 자동 감지" test ✅).

### §2. C-v4.1-session-재시작-검증 carry 종결 표기

DEC-2026-05-21 carry 표 안 해당 row 에 `✅ (v10.0.3 종결 표기)` + 자산화 위치 명시 (LL-v4-04 = DEC-05-17 + DEC-05-21 등재 / v9.0.0+v9.1.0 paradigm 진입 시 실제 적용 완료 / protocol 자산 = 별도 작업 없음).

## STOP-3

- workspace test → **all pass** (env fix 로 1 fail 해소)
- release-readiness → **20/20 ready** (19/20 → 20/20)
- skill-citation 0 stale + version 3-way 10.0.3 + breaking 0 = PATCH

## carry (본 PATCH 외 / 보류)

- **C-v4.1-poc-재실행**: 9 PoC 전부 task-plan 없음. plan-agent (v10.0.0) dispatch + 산출 = heavy / Type 1 self-run 표본 1~2 PoC 도 의미. v10.x carry / 사용자 결단 의무.
- **C-v4.1-input-skill-이관**: figma·swagger analysis-from-* ↔ discovery-from-* 실 중복. `discovery-from-figma` 는 v4.1 PLACEHOLDER 그대로 (v9.0.0/v10.0.0 동안 본격 구현 안 됨). 3 옵션 결단 의무:
  - (a) `analysis-from-figma/swagger` deprecate → discovery-from-* 통합 (breaking / 사용자 skill 호출 변경)
  - (b) `analysis-from-*` deprecated 표기 + 사용자 안내 (non-breaking 점진)
  - (c) 양쪽 역할 명문화 (analysis stage = legacy 분석 시 / discovery stage = chain 진입 시 / 같은 source 다른 context)

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (carry 표 — `C-v4.1-session-재시작-검증` 종결 표기 본 PATCH)
- DEC-2026-05-17-v4-multi-agent-paradigm-채택 (LL-v4-04 자산화 location)
- DEC-2026-05-26-gate-renumber-coherence (v10.0.2 / 직전 release / macOS env test 발견 location)
