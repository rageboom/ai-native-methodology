# Run Log — PoC #07 EFI-WEB capital chain 1 진입

> 2026-05-08 / Day 3 / Work Principles 1원칙 plan + 2원칙 research 누적

---

## 시퀀스

| 단계 | 명령                                                                                                                                                                                                       | 결과                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1    | `node tools/characterization-coverage-validator/src/cli.js --target examples/poc-07-efiweb-capital-spring41/characterization`                                                                              | 0 findings / 7 snapshots / 13 scenarios / named_classified_ratio 87.5% / coverage 43.8% |
| 2    | `node tools/planning-extraction-validator/src/cli.js --planning examples/poc-07-efiweb-capital-spring41/.aimd/output/planning-spec.json --rules examples/.../rules.json --domain examples/.../domain.json` | 0 findings / UC coverage 94.1%                                                          |
| 3    | `node tools/characterization-coverage-validator/src/cli.js --target examples/.../characterization --coverage-baseline examples/.../baseline/characterization-coverage.json --write-coverage-baseline`      | baseline write 첫 진입 (legacy 다중책임 모듈 / coverage_ratio 0.4375)                   |

---

## 측정 결과 (4축 / plan §3-A + §3-B + phase 4.7 + sql-inventory)

| 축                           | metric                        | PoC #06 baseline         | PoC #07 측정                       | 자격                                       |
| ---------------------------- | ----------------------------- | ------------------------ | ---------------------------------- | ------------------------------------------ |
| §3-A 자동화율 (analysis)     | 평균 auto_ratio               | 38.75%                   | **53.8%** (+15%p)                  | ✅ pass (+3.8%p in range)                  |
| §3-B 설계 자동화율 (chain 1) | planning-extraction-validator | (없음)                   | **0 findings / UC coverage 94.1%** | ✅ pass                                    |
| phase 4.7 acceptance oracle  | named_classified_ratio        | 94% (D2 후)              | **87.5% / 100% (D2.5 후)**         | ✅ pass (Day 2.5 후 +6%p)                  |
| SQL Inventory coverage       | auto extraction ratio         | 66.7% (PoC #06 retrofit) | **66.7%**                          | ✅ pass (corroboration #2 isomorphic 입증) |

4축 모두 pass — 사용자 D10 처분 "3/4 pass + 미달 1축 carry" 보다 강한 자격.

---

## 자산 추가

- `characterization/snapshots/UC-CAPITAL-{001,002,006,008,010,011,013}.json` (7 snapshot)
- `characterization/intent-vs-bug.md` (27 분류 / Day 2.5 후 100%)
- `characterization/coverage.json` (ratchet + trend_required=true)
- `.aimd/baseline/characterization-coverage.json` (legacy 첫 write)
- `.aimd/output/planning-spec.{json,md}` (chain 1 / UC 16 entries)
- `decisions/DEC-2026-05-08-poc-07-domain-결단.md` (D2 ambiguous 2건 처분)

---

## chain 1 → 2 진입 자격

✅ chain 1 5 요소 충족 — meta-confidence (0.78) + use_cases (16) + business_intent + cross_links + out_of_scope.
✅ planning-extraction-validator 0 findings.
✅ characterization (chain 1 입력 보강) 0 findings + baseline write.

→ 그러나 PoC #07 prelim scope 정합 — chain 2~4 본격 진입 ❌. Day 3.5 종결로 마무리.

---

## 다음

Day 3.5 — REPORT-day3-measurement.md + 종결 DEC + STATUS / INDEX 갱신 + carry 3 신규 등재.
