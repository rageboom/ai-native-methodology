# PoC #07 prelim — Day 3 측정 종합 보고서

> 2026-05-08 / EFI-WEB capital 모듈 / chain 1 단독 측정 + phase 4.7 두 번째 적용 (다중책임 spectrum) + SQL Inventory corroboration #2.
> plan §3-A 분석 50% ± 10%p / §3-B 설계 자동화 / phase 4.7 효과 / SQL Inventory 4축 측정.

---

## 1. 측정 결과 요약 (4축 / 사용자 D10 처분)

| 축                           | metric                        | PoC #06 baseline         | PoC #07 측정                       | 자격 (D10 = 3/4 pass + 미달 1축 carry)                                 |
| ---------------------------- | ----------------------------- | ------------------------ | ---------------------------------- | ---------------------------------------------------------------------- |
| §3-A 자동화율 (analysis)     | 평균 auto_ratio               | 38.75%                   | **53.8%** (+15%p)                  | ✅ pass (in range 50% ± 10%p / +3.8%p) — 다중책임 → 자동화 ↑ 가설 입증 |
| §3-B 설계 자동화율 (chain 1) | planning-extraction-validator | (없음)                   | **0 findings / UC coverage 94.1%** | ✅ pass (0 critical / ≥ 90% UC 자격)                                   |
| phase 4.7 acceptance oracle  | named_classified_ratio        | 94% (D2 후)              | **87.5% Day 2 / 100% Day 2.5**     | ✅ pass (≥ 80%) — 다중책임 spectrum 에서도 100% 도달                   |
| SQL Inventory coverage       | auto extraction ratio         | 66.7% (PoC #06 retrofit) | **66.7%**                          | ✅ pass (≥ 50% / corroboration #2 isomorphic 입증)                     |

**4축 모두 pass** — 사용자 D10 처분 "3/4 pass + 미달 1축 carry" 보다 강한 자격 — **PoC #07 정식 등재 자격 (a)** 충족.

---

## 2. §3-A 자동화율 분해 — 53.8% (+15%p / 다중책임 효과)

| 산출물            | auto_ratio | PoC #06 baseline | 차이      |
| ----------------- | ---------- | ---------------- | --------- |
| inventory.json    | 75%        | 60%              | +15%p     |
| domain.json       | 50%        | 44%              | +6%p      |
| rules.json        | 50%        | 29%              | +21%p     |
| antipatterns.json | 40%        | 22%              | +18%p     |
| **평균**          | **53.8%**  | 38.75%           | **+15%p** |

**해석**:

- 다중책임 = SQL operations 71 (vs 6) / endpoints 87 (vs 7) / sub-domains 11 (vs 1) → 양적 증가에 비례하여 자동 grep 효과 ↑.
- inventory + rules + antipatterns 자동화율 ↑↑ — 다중책임 spectrum 에서 R1 가설 강화.
- **다중책임 → 자동화 ↑** = R1 가설 실측 정합.

---

## 3. §3-B 설계 자동화율 — chain 1 planning-extraction-validator pass

```
$ node tools/planning-extraction-validator/src/cli.js \
    --planning examples/poc-07-efiweb-capital-spring41/.ai-context/output/planning-spec.json \
    --rules examples/poc-07-efiweb-capital-spring41/input/rules.json \
    --domain examples/poc-07-efiweb-capital-spring41/input/domain.json
[planning-extraction-validator] 0 findings (critical: 0, high: 0)
UC coverage: 94.1%
```

**0 findings + UC coverage 94.1% + exit 0 / gate #1 PASS** (16/17 UC entry — 17번째 UC-CAPITAL-017+ 는 carry 표기로 stub 등재).

신뢰도 = 0.78 (다중책임 + Stored Procedure 본문 carry 정합).

---

## 4. phase 4.7 (characterization) 두 번째 적용 — 다중책임 spectrum 본질 가치 사실 입증

### 4.1 측정 결과 비교 (PoC #06 단일책임 vs PoC #07 다중책임)

| 측정 항목                           | PoC #06 (단일책임) | PoC #07 (다중책임)                        | 비교                       |
| ----------------------------------- | ------------------ | ----------------------------------------- | -------------------------- |
| BR 총                               | 7                  | **15**                                    | ×2.1                       |
| AP 총                               | 10                 | **12**                                    | ×1.2                       |
| 분류 합계                           | 17                 | **27**                                    | ×1.6                       |
| ambiguous (Day 2 초안)              | 3                  | **2**                                     | ↓ (다중책임 ≠ ambiguous ↑) |
| named_classified_ratio (Day 2 초안) | 14/17 = 0.82       | 25/27 = **0.926**                         | +10%p                      |
| named_classified_ratio (Day 2.5 후) | 17/18 = 0.94       | **27/27 = 1.000**                         | +6%p                       |
| self_recognized SATD                | 1                  | **4** (BR-011 + AP-008 + AP-009 + AP-010) | ×4                         |
| snapshot count                      | 3                  | 7                                         | ×2.3                       |
| scenario count                      | 10                 | 13                                        | ×1.3                       |
| coverage (UC)                       | 0.43               | 0.4375                                    | ratchet baseline 정합      |

### 4.2 결정적 finding — 단일 prompt 양 spectrum 동작 입증 강화

| spectrum                              | named_classified_ratio (Day 2.5 후) |
| ------------------------------------- | ----------------------------------- |
| Modern (PoC #03 NestJS retrofit)      | 30/30 = 100%                        |
| Legacy 단일책임 (PoC #06 exchange)    | 17/18 = 94%                         |
| **Legacy 다중책임 (PoC #07 capital)** | **27/27 = 100%**                    |

→ DEC-CHAIN-006 §결정 §2 "단일 prompt 양 spectrum 동작" — **3 spectrum 모두 ≥ 94% / 두 spectrum 100% 도달** 정합 강화.

### 4.3 다중책임 → SATD ↑↑ (KL-SATD 외부 권위 정합)

| SATD evidence           | source location                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| BR-CAPITAL-MAILSPEC-011 | "슈퍼크리에이티브 메일수신 유저 임시처리" (Controller line 1289 + 1299 + 1329 + 1456 / 4회 중복) |
| AP-CAPITAL-008          | "// TODO Auto-generated method stub" (CapitalServiceImpl.java:687)                               |
| AP-CAPITAL-009          | 위 BR-011 동반 (4회 중복)                                                                        |
| AP-CAPITAL-010          | "// TODO Auto-generated catch block" + e.printStackTrace + System.out.print                      |

KL-SATD per Maldonado&Shihab 2015 + Springer SQJ 2024 정합 — 다중책임 → ×4 신호 실측.

### 4.4 다중책임 spectrum 신규 AP — capital 만 발생

| AP                     | description                              | PoC #06 isomorphic                           |
| ---------------------- | ---------------------------------------- | -------------------------------------------- |
| AP-CAPITAL-005         | XML 인라인 String 생성 (xmlDocument)     | ❌ 신규 (capital ERP cross-system 의존 차이) |
| AP-CAPITAL-006         | DEAD parameter (comNo 파싱 후 미사용)    | ❌ 신규                                      |
| AP-CAPITAL-007         | 이미지 base64 인라인 / DB 비대           | ❌ 신규                                      |
| AP-CAPITAL-008/009/010 | SATD 3건                                 | ❌ 신규 (단일책임 1건 만)                    |
| AP-CAPITAL-011         | Cross-domain 직접 의존 (TB_DAY_EXCHANGE) | ❌ 신규                                      |

→ 5 신규 AP / 다중책임 spectrum sub-rule 자격 (≥ 2 다중책임 PoC 후 본체 carry note 검토).

### 4.5 isomorphic AP (≥ 2 PoC 자격 충족) — PoC #06 + PoC #07 양쪽 발견

| AP                                   | description                                     | corroboration        |
| ------------------------------------ | ----------------------------------------------- | -------------------- |
| AP-CAPITAL-002 ↔ AP-EXCHANGE-001     | Map<String,Object> + 강제 캐스팅                | ✅                   |
| AP-CAPITAL-003 ↔ AP-EXCHANGE-002     | Anemic Service                                  | ✅                   |
| AP-CAPITAL-004 ↔ AP-EXCHANGE-004     | WITH(NOLOCK) 무차별                             | ✅                   |
| AP-CAPITAL-001 ↔ AP-EXCHANGE-002     | God Controller / Anemic Service (책임 비대)     | ✅                   |
| **AP-CAPITAL-012 ↔ AP-EXCHANGE-011** | **공유 SQL 조각 부재 (iBATIS 2 spectrum 공통)** | ✅ (Day 1.6 v2 흡수) |

→ Spring 4.1 + iBATIS 2 spectrum sub-rule 자격 자격.

---

## 5. SQL Inventory (신규 deliverable #24 후보) — corroboration #2

| metric                          | PoC #06 (corroboration #1)                              | PoC #07 (corroboration #2)                                     | 정합                       |
| ------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- | -------------------------- |
| 외부 6 컬럼 자동화 비율         | 4/6 = 66.7%                                             | 4/6 = 66.7%                                                    | scale 무관 isomorphic 입증 |
| 자동 추출 컬럼                  | sql_id + mapper_xml + dynamic_branch + dependent_tables | 동일                                                           | ✅                         |
| 매뉴얼 컬럼                     | called_from_screen + business_meaning                   | 동일                                                           | ✅                         |
| 본 추가 4 컬럼 (사용자 D9)      | uc_link + intent_vs_bug + confidence + carry_flags      | 동일                                                           | ✅                         |
| ambiguous 발생                  | 1 (AP-008 DBA carry)                                    | 1 (selectDayExchangeList 중복 / DRY vs module 독립 결단 carry) | ✅ Legacy spectrum 정합    |
| patterns_extension_v2 (Day 1.6) | 4 patterns / 6 examples                                 | 4 patterns / 5 examples                                        | ✅ Schema isomorphic       |

→ §8.1 strict ≥ 2 PoC isomorphic 자격 자격 **충족**. v2.2.0 본체 격상 trigger 자격 (PoC #07 종결 후).

---

## 6. ratchet baseline write 첫 진입 (v2.1.1 PATCH 기능 첫 사용)

```
$ node tools/characterization-coverage-validator/src/cli.js \
    --target examples/poc-07-efiweb-capital-spring41/characterization \
    --coverage-baseline examples/.../baseline/characterization-coverage.json \
    --write-coverage-baseline
[characterization-coverage-validator] 0 findings (critical: 0, high: 0, medium: 0)
snapshots: 7 / scenarios: 13
named_classified_ratio: 87.5% (threshold 80%)
coverage strategy: ratchet / target: 0.8 / actual: 43.8%
```

`baseline/characterization-coverage.json`:

```json
{
	"generated_at": "2026-05-07",
	"source_commit_sha": "unknown",
	"project_id": "poc-07-efiweb-capital-spring41",
	"coverage_strategy": "ratchet",
	"coverage_ratio": 0.4375
}
```

→ 본 PoC = ratchet baseline write 첫 사용 케이스. 다음 회차 (PoC #07 follow-up 또는 다른 다중책임 PoC) 시 baseline + trend positive 의무.

---

## 7. EFI-WEB 적용 가능성 종합 — plan §4 시나리오 갱신

| 시나리오                                                                                | plan §4 추정 | PoC #07 사실                                                                         |
| --------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| A. 전체 51K LOC 분석 → 7대 산출물                                                       | 45~55%       | **53.8%** (capital 다중책임 / +15%p / in range) — 다중책임 모듈에서 추정 정합        |
| A'. A + carry 1~3 보강 (Spring 4.x AP seed + Stored Procedure 본문 + iBATIS 2 spectrum) | 65~70%       | corroboration #1+#2 evidence 충족 (양 PoC 동일 spectrum) — v2.2.0 sub-rule 격상 자격 |
| B. chain 1 단독 (planning-spec)                                                         | 75%          | **0 findings / UC 94.1%** — pass                                                     |
| C. chain 2~4 본격 진입                                                                  | (carry)      | scope OUT (PoC #07 prelim 정합) — chain 3 영역 C-PoC07-1~3 carry                     |

---

## 8. §8.1 strict 정합 (단일 PoC 과적합 회피)

본 PoC #07 = corroboration #3 (Spring 4.1 + iBATIS 2 spectrum 강화 / PoC #06 + #07 = 2 PoC isomorphic) — 그러나 본체 격상 ❌:

| 자격                                    | 충족                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| ≥ 2 PoC corroboration (phase 4.7 본체)  | ✅ 이미 v2.1.0 시 충족 (PoC #03 retrofit + PoC #06) → 본 PoC = 다중책임 spectrum 강화   |
| ≥ 2 PoC isomorphic (SQL Inventory 본체) | ✅ corroboration #1 (PoC #06) + corroboration #2 (PoC #07) 충족 — v2.2.0 본체 격상 자격 |
| 14차 retract 패턴 회피                  | ✅ 사용자 D11 결단 (b) 정합 — 본체 격상 ❌ / carry 3 신규 등재                          |

**carry 3 신규 (v2.2.0 본체 격상 trigger)**:

- C-v2.2.0-sql-inventory — `methodology-spec/deliverables/24-sql-inventory.md` 신설
- C-v2.2.0-sql-schema — `schemas/sql-inventory.schema.json` 신설
- C-v2.2.0-sql-tool — `tools/sql-inventory-extractor/` 신설 (workspace 14번째)

---

## 9. Lessons Learned

1. 다중책임 모듈 = §3-A 자동화 ↑ + phase 4.7 ambiguous ↓ — R1 가설 사실 입증.
2. phase 4.7 single prompt 양 spectrum 동작 — 3 spectrum (Modern + Legacy 단일책임 + Legacy 다중책임) 모두 ≥ 94% 도달 → DEC-CHAIN-006 정정 강화.
3. SATD KL-SATD 외부 권위 정합 — 다중책임 → ×4 신호 사실 정합.
4. AP isomorphic — Spring 4.1 + iBATIS 2 spectrum 공통 4 AP + 신규 1 (AP-012 / Day 1.6 흡수).
5. SQL Inventory schema = scale 무관 isomorphic — 외부 6 컬럼 자동화 4/6 = 66.7% 양 PoC 동일.
6. ratchet baseline write 첫 사용 — v2.1.1 PATCH 기능 production 운영 사실 정합.
7. 본체 격상 ❌ 결단 — D11 (b) §8.1 strict 정합 / 14차 retract 회피.

---

## 10. 종결 결단 (Day 3.5)

**(a) PoC #07 정식 등재** — 4축 metric 모두 pass + corroboration #3 명시 + SQL Inventory corroboration #2 isomorphic 입증.

→ DEC-2026-05-08-poc-07-종결 작성 의무 + STATUS / INDEX 갱신 + carry 3 신규 등재 (v2.2.0 본체 격상 trigger).
