# _shared/ — 공용 모듈

## Purpose

복수 도구가 import 하는 공용 utility. 독립 실행 ❌ / src 모듈로만 동작.

## 파일

- `baseline.js` — ADR-010 baseline + ratchet 로직 (zero-defect 강제 ❌ / 신규 결함만 차단)

## 사용 위치

import 하는 도구:
- [`../drift-validator/`](../drift-validator/) — drift count baseline + ratchet
- [`../decision-table-validator/`](../decision-table-validator/) — DMN 5종 baseline + ratchet
- [`../static-runner/`](../static-runner/) — SARIF finding baseline + ratchet

## ADR-010 baseline + ratchet 정책

```
1. 첫 commit: --write-baseline 으로 .baseline.json 작성 (현재 결함 수)
2. 이후: --baseline + --ratchet 으로 신규 결함만 검사
3. 신규 critical/high = production blocker (exit 1)
4. baseline 줄어든 (개선 / 결함 fix) 경우 = 자동 baseline 갱신
```

## Test

```bash
# 본 모듈 자체는 unit test 없음 (각 import 도구 의 test 안에서 검증)
```

## 분류

- 단일 file (~250 LOC)
- runtime 독립 실행 ❌ (script 단독 호출 시점 0 / src/ 와 동급)
- ★ dist 의무 포함 (3 도구가 import / 부재 시 빌드 회귀)

## 참조

- ADR-010 — baseline + ratchet 정책 (legacy 도입 시 zero-defect 강제 ❌)
- [`../drift-validator/src/check-baseline.js`](../drift-validator/) — import 사용 예
