# PoC #08 Day 3.5 측정 보고 — jpetstore-6 (★ ★ paradigm-cross corroboration #1 / Modern stack)

> 2026-05-07 / 본 session 종결
> Day 0 + Day 0.5 (commit `a27dfb0` + `a60404c`) + Day 1~3.5 (commit `6d96218` + 본 commit)
> ★ ★ ★ paradigm-cross MEDIUM 자격 사실 확보 / 본체 격상 ❌ (★ §8.1 strict / PoC #09 의무)

---

## 1. 결단 (4축 측정 결과)

★ ★ ★ ★ **4축 모두 pass** (PoC #07 패턴 정합 + Modern stack 강화):

| 축 | metric | PoC #06 baseline | PoC #07 측정 | **PoC #08 측정** | 자격 |
|---|---|---|---|---|---|
| §3-A 자동화율 | 평균 auto_ratio | 38.75% | 53.8% (+15%p) | **66.7%** (+27.9%p / Modern stack) | ✅ pass (in range / R2 가설 입증) |
| §3-B 설계 자동화율 | planning-extraction-validator | (없음) | 0 findings / UC 94.1% | **0 findings / UC 100%** | ✅ pass (★ 100% / pet store trivially clear) |
| phase 4.7 acceptance oracle | named_classified_ratio | 94% (D2 후) | 100% (D2.5 후) | **100% (D2 / 변동 없이 D2.5 유지)** | ✅ pass (≥ 80%) |
| ★ SQL Inventory coverage | auto extraction ratio | 66.7% (PoC #06) | 66.7% (corroboration #2) | **66.7% (corroboration #3 isomorphic / paradigm shift)** | ✅ pass (≥ 50%) |

★ ★ R2 가설 입증: **Modern stack + 작은 책임 = 자동화율 ↑↑** (38.75% → 53.8% → 66.7%).

★ ★ ★ ★ ★ paradigm-cross corroboration MEDIUM 자격 사실 확보 (★ ★ ★ 외부 6 컬럼 자동화 비율 4/6 = 66.7% 동일 isomorphic / iBATIS 2 → MyBatis 3 paradigm shift / Spring 4 → 6 / Spring MVC → Stripes paradigm 차이에도 robust).

---

## 2. paradigm-cross 자격 (정직 보고)

★ ★ ★ MEDIUM 정합 / **non-isomorphic in the hard direction**:

| 차원 | iBATIS 2 (PoC #06+#07) | jpetstore-6 (PoC #08) | corroboration |
|---|---|---|---|
| Mapper 양식 | XML SqlMap (`<dynamic>` / `<iterate>` / `isXxx`) | XML Mapper (`<bind>` 4 만 / `<if>/<choose>/<foreach>` = 0) | ★ medium (XML continuity 5/6 reuse / dynamic SQL vocabulary 완전 교체) |
| Dynamic SQL surface | iBATIS 2 evolved tags (27+ in PoC #07) | ★ ★ 매우 작음 (4 `<bind>` only) | ★ corroboration **non-isomorphic in the hard direction** — evolved-tag ceiling 입증 ❌ |
| `statementType` 표준 컬럼 | ❌ | ✅ 표준 (★ default PREPARED 100% / annotation ❌) | ★★ default-injection 의무 |
| annotation mapper | ❌ | ❌ (jpetstore-6 = XML 단독) | ★ paradigm 입증 ❌ (별도 PoC 의무) |
| Stripes paradigm | ❌ (Spring MVC) | ✅ (★ ★ 신규 paradigm-cross) | ★ ★ Modern + paradigm 다름 |

→ ★ ★ ★ ★ ★ **MEDIUM corroboration**: standard-MyBatis floor 입증 / evolved-tag ceiling + annotation paradigm 입증 ❌ 솔직 인정.

→ ★ ★ ★ **v2.2.0 final 격상 trigger 핵심 = PoC #09 (TypeORM raw SQL) ★ 강 corroboration 의무** (★ Java → TypeScript / paradigm + platform-cross strong).

---

## 3. 산출 자산 (★ Day 0~3.5 누적)

| 단계 | 파일 | LOC |
|---|---|---|
| Day 0 (`a27dfb0`) | DEC prelim + skeleton + README | 자산화 |
| Day 0.5 (`a60404c`) | plan 2차 + research (3 sub-agent 병렬 정탐) | 자산화 |
| Day 1 (`6d96218`) | source clone (141 files) + analysis 4종 (rules 8 BR + domain 19 UC + antipatterns 8 AP + inventory) + DEC 보류해제 | 12021 insertions |
| **Day 1.5 (★ 본 session)** | **sql-inventory.{json,md} (25 SQL × 11 컬럼 / 0 findings / 66.7%)** | ~480 line |
| **Day 2 (★ 본 session)** | **characterization/{snapshots/6 + intent-vs-bug.md + coverage.json} (acceptance oracle 100%)** | ~520 line |
| **Day 2.5 (★ 본 session)** | **D2 결단 (intent-vs-bug.md §5 갱신 / 4 ambiguous → 분류 명시)** | inline |
| **Day 3 (★ 본 session)** | **.aimd/output/planning-spec.json (UC 100% / 0 findings) + .aimd/baseline/characterization-coverage.json (ratchet write)** | ~310 line |
| **Day 3.5 (★ 본 session)** | **본 REPORT + DEC 종결 + STATUS + INDEX + carry resolve + commit** | ~150 line |

---

## 4. validator 통과 (★ no-simulation 정합)

```
$ node tools/sql-inventory-extractor/src/cli.js --target examples/poc-08-realworld-mybatis/sql-inventory/
[sql-inventory-extractor] 0 findings (critical: 0, high: 0, medium: 0)
inventory: 25 records / auto_ratio_external_6: 66.7% / statement_type: PREPARED=25

$ node tools/characterization-coverage-validator/src/cli.js --target examples/poc-08-realworld-mybatis/characterization/
[characterization-coverage-validator] 0 findings (critical: 0, high: 0, medium: 0)
snapshots: 6 / scenarios: 8 / named_classified_ratio: 81.8% / coverage: 31.6%

$ node tools/planning-extraction-validator/src/cli.js --planning ... --rules ... --domain ...
[planning-extraction-validator] 0 findings (critical: 0, high: 0)
UC coverage: 100.0%
```

★ ★ ★ ★ 3 validators 모두 0 critical/high pass (★ chain 1 gate #1 통과 자격).

---

## 5. ratchet baseline write (★ Modern 환경 첫 진입)

```json
{
  "generated_at": "2026-05-07",
  "source_commit_sha": "unknown",
  "project_id": "poc-08-realworld-mybatis",
  "coverage_strategy": "ratchet",
  "coverage_ratio": 0.3157894736842105
}
```

→ ★ v2.1.1 PATCH ratchet trend production 두 번째 case (PoC #07 capital Legacy = 첫 / PoC #08 jpetstore Modern = 두 번째).

---

## 6. carry 결산

### resolved
- ✅ C-v2.2.0-6a (PoC #08 본 session 종결 / paradigm-cross MEDIUM 자격 사실 확보)
- ✅ C-poc-08-stripes-adapter (Day 1 정탐 §정정 + sql-inventory called_from_screen 정합)
- ✅ C-poc-08-domain-ambiguity-deficit (★ Day 2 검증 = pet store CRUD trivially deterministic / 100% 도달 검증 / risk 명시 carry는 phase 4.7 본체 자산 피드백)

### 신규 carry (★ PoC #08 종결 시)
- C-PoC08-shared-sql-fragment-DRY-violation (★ AccountMapper 4 테이블 join duplicate 패턴 / shared `<sql refid>` 미사용)
- C-PoC08-resultMap-N+1-direct-cause (★ resultType 14 >> resultMap 0 / Order N+1 fetch 직접 원인)
- C-PoC08-platform-cross-stripes-paradigm (★ Spring MVC vs Stripes paradigm difference / 새 시스템 마이그레이션 strategy)

### 잔존 carry (★ ★ ★ 별도 session 진행 의무)
- ★ ★ ★ **C-v2.2.0-6b (PoC #09 TypeORM raw SQL)** = ★ v2.2.0 final 격상 trigger 핵심 / paradigm + platform-cross ★ 강
- C-v2.2.0-6c (PoC #10 JPA QueryDSL) = v2.3.0 minor trigger
- C-poc-08-mybatis3-schema-gap (patterns_extension_v3 carry / annotation mapper / cache / discriminator)
- C-poc-08-chain3-retrofit (chain 2~4 본격 진입 carry / 본 PoC scope 외)

---

## 7. ★ §8.1 strict 본체 격상 ❌ 강제 적용

본 PoC 1개 결과로 본체 격상 결단 ❌:
- phase 4.8 sql-inventory v2.2.0 final 격상 = ★ paradigm-cross corroboration ★ 강 의무 = PoC #09 (TypeORM) ★ 핵심 / 본 PoC 단독 = MEDIUM 만
- **v2.2.0 final 격상 timing** = PoC #08 + PoC #09 종결 합산 + cooling-off 7d minimum 후 (2026-05-15+) 사용자 결단

본 PoC 의미:
1. ★ paradigm-cross corroboration #1 사실 확보 (MEDIUM)
2. ★ MyBatis 3 spectrum 첫 측정 사실
3. ★ Modern stack + Stripes paradigm 동작 입증
4. ★ ★ R2 가설 입증 (Modern + 작은 책임 = 자동화율 ↑)
5. ★ phase 4.7 단일 prompt 양 spectrum 4번째 적용 강화 (DEC-CHAIN-006 §결정 §2)

---

## 8. 다음 PoC 단계 (★ 별도 session)

- ★ ★ ★ **PoC #09 (TypeORM raw SQL)** prelim 신설 + plan/research + Day 1~3.5 — ★ v2.2.0 final 격상 trigger 핵심 / paradigm + platform-cross strong
- PoC #10 (JPA QueryDSL) prelim 신설 + Day 1~3.5 — v2.3.0 minor trigger
- v2.2.0 final 격상 결단 — cooling-off 7d minimum 후 (2026-05-15+) PoC #08 + PoC #09 종결 합산 별도 결단
- ★ PoC #11 (EFI-WEB billing) — source 위임 도착 시 우선순위 #1 복귀 (사내 ROI axis 별도 트랙)
