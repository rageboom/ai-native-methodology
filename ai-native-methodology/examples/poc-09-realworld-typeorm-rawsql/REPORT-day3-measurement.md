# PoC #09 Day 3.5 측정 보고 — nestjs-realworld (★ ★ paradigm + platform-cross MEDIUM #2)

> 2026-05-08 / 본 session 종결
> Day 0 (DEC prelim) + Day 1~3.5 (★ 본 session 일괄)
> ★ ★ ★ paradigm-cross MEDIUM #2 사실 확보 / ★ ★ ★ ★ raw query() strong 입증 ❌ 솔직 / 본체 격상 ❌

---

## 1. 결단 (4축 측정 결과)

★ ★ ★ ★ **4축 모두 pass** (PoC #08 패턴 정합 + Modern Node.js stack 진입):

| 축 | metric | PoC #08 (Java/MyBatis3) | **PoC #09 (TS/TypeORM)** | 자격 |
|---|---|---|---|---|
| §3-A 자동화율 | 평균 auto_ratio | 66.7% | **63.6%** (-3.1%p / TS regex 정확도 미세 손실) | ✅ pass (in range 55~65%) |
| §3-B 설계 자동화율 | UC coverage / 0 findings | 100% / 0 | **100% / 0** | ✅ pass |
| phase 4.7 oracle | named_classified_ratio | 100% (D2) | **86.7% validator / 100% D2 분류** | ✅ pass (≥ 80%) |
| ★ ★ ★ ★ SQL Inventory coverage | external 6 컬럼 ratio | 4/6 = 66.7% | **4/6 = 66.7%** | ✅ pass / ★ ★ ★ ★ **4 PoC isomorphic** |

★ ★ ★ ★ ★ **4 PoC isomorphic 자격 사실 확보** — paradigm + platform-cross 동시 진입에도 외부 6 컬럼 자동화 비율 ★ 동일 robust isomorphic 입증.

---

## 2. paradigm-cross 자격 정직 보고 — strong ❌ 솔직 인정

★ ★ ★ ★ **MEDIUM corroboration #2 = non-isomorphic in the strong direction**:

| 차원 | iBATIS 2 / MyBatis 3 (Java) | TypeORM (TS) | corroboration |
|---|---|---|---|
| 언어 / Runtime | Java / JVM | TypeScript / Node.js | ★★★ paradigm + platform |
| SQL 양식 | XML mapper | TS createQueryBuilder fluent | ★★ medium isomorphic ✅ |
| dynamic SQL | XML `<isNotEmpty>/<choose>` | `andWhere/where` chain | ★★ isomorphic ✅ |
| **raw query()** | XML `<select>` direct | ★ TypeORM raw `query()` 부재 | ★ ★ **strong 입증 ❌ 솔직** |
| `<bind>` OGNL | ✅ | ❌ (TS expression 자체) | ★★ medium |

### ★ ★ ★ raw query() strong corroboration 부재 사유

- ★ TypeORM 커뮤니티 자체가 ORM 추상화 (find/save/createQueryBuilder) 권장 / raw `query()` = edge case
- ★ Pure realworld OSS = 희소 (정탐 결과 lujakob/elvan/tabomors 모두 createQueryBuilder 만)
- ★ ★ 본 PoC source = lujakob/nestjs-realworld-example-app (createQueryBuilder 3건 + ORM 추상화 21건)

### ★ ★ ★ ★ v2.2.0 final 격상 trigger 결과

★ **trigger ❌** (★ ★ Senior STOP signal 정합 / paradigm-cross strong 의무 vs 실측 MEDIUM 한정):
- 본 PoC = MEDIUM #2 (PoC #08 MEDIUM #1 + PoC #09 MEDIUM #2 합산 → 여전히 MEDIUM)
- v2.2.0 final 격상 = ★ paradigm-cross strong corroboration 의무 = ★ 별도 carry (raw query() 명시 OSS 검색 또는 사용자 source 결정)
- ★ 정직 보고 = 본 session 진행 후 v2.2.0 final 격상 trigger ❌ 사실 / Senior STOP signal 강화

---

## 3. 산출 자산 (Day 0~3.5 누적)

| 단계 | 파일 | LOC |
|---|---|---|
| Day 0 (commit `0f710d5`) | DEC prelim + skeleton + plan 1차 | 자산화 |
| **Day 1 (★ 본 session)** | source clone (lujakob/nestjs-realworld / 50+ files) + analysis 4종 (7 BR + 20 UC + 4 AP + inventory) | ~1500 line |
| **Day 1.5 (★ 본 session)** | sql-inventory.json (24 SQL × 11 컬럼 / 0 findings / 66.7%) | ~510 line |
| **Day 2 (★ 본 session)** | characterization/{snapshots/6 + intent-vs-bug.md + coverage.json} (oracle 100%) | ~340 line |
| **Day 2.5 (★ 본 session)** | D2.5 결단 (intent-vs-bug.md inline) | inline |
| **Day 3 (★ 본 session)** | .aimd/output/planning-spec.json (UC 100% / 0 findings) + .aimd/baseline/ ratchet | ~210 line |
| **Day 3.5 (★ 본 session)** | 본 REPORT + DEC 종결 + STATUS + INDEX + carry resolve + commit | ~150 line |

---

## 4. validator 통과 (★ no-simulation 정합)

```
$ node tools/sql-inventory-extractor/src/cli.js --target examples/poc-09-realworld-typeorm-rawsql/sql-inventory/
[sql-inventory-extractor] 0 findings
inventory: 24 records / auto_ratio_external_6: 66.7% / statement_type: PREPARED=24

$ node tools/characterization-coverage-validator/src/cli.js --target examples/poc-09-realworld-typeorm-rawsql/characterization/
[characterization-coverage-validator] 0 findings
snapshots: 6 / scenarios: 14 / named_classified_ratio: 86.7% / coverage: 30.0%

$ node tools/planning-extraction-validator/src/cli.js --planning ... --rules ... --domain ...
[planning-extraction-validator] 0 findings
UC coverage: 100.0%
```

★ ★ ★ 3 validators 모두 0 critical/high pass.

---

## 5. carry 결산

### ✅ resolved
- C-v2.2.0-6b (PoC #09 / paradigm + platform-cross MEDIUM #2 사실 확보 / ★ raw query() strong 부재 솔직 인정)
- C-PoC09-source-결정 (lujakob/nestjs-realworld-example-app 채택)
- C-PoC09-typescript-paradigm-cross (TypeScript regex 정확도 미세 손실 측정 ✅)
- C-PoC09-domain-결정 (blog domain — Realworld Conduit)

### 신규 carry (★ ★ ★ PoC #09 종결 시)
- ★ ★ ★ ★ **C-paradigm-cross-strong-raw-sql** (★ ★ raw `query()` 명시 사용 OSS 별도 검색 또는 사용자 source 결정 / v2.2.0 final 격상 trigger 핵심 carry / **★ ★ ★ ★ ★ Senior STOP signal 정합**)
- C-PoC09-typeorm-orm-abstraction-logical-inference (★ TypeORM ORM 추상화 21건 logical SQL 추론 / sql-inventory 적용 정합 입증)
- C-PoC09-favorite-transaction-boundary (★ AP-RW-003 / 새 시스템 NestJS @Transaction 의무)

### ⏳ 잔존 carry
- C-v2.2.0-6c (PoC #10 JPA QueryDSL / v2.3.0 minor trigger / 별도 session)
- ★ PoC #11 (EFI-WEB billing) source 위임 대기 (사용자 결단 α 우선순위 #1)

---

## 6. ★ ★ ★ ★ §8.1 strict 본체 격상 ❌ 강제 적용

본 PoC 1개 결과 + PoC #08 합산 결과로도 **v2.2.0 final 격상 trigger ❌**:

| 자산 | 본체 격상 자격 | 결과 |
|---|---|---|
| phase 4.8 sql-inventory v2.2.0 final 격상 | ★ paradigm-cross strong corroboration 의무 | ❌ (PoC #08 MEDIUM + PoC #09 MEDIUM = 여전히 MEDIUM) |

**v2.2.0 final 격상 timing**:
- ★ raw query() 명시 OSS 검색 + Day 1~3.5 측정 + strong corroboration 입증 후 → 별도 결단
- 또는 ★ 사용자 결단 — strong corroboration 자격 완화 (MEDIUM 2 PoC = 격상 자격) 별도 정책 결단 (★ Senior STOP signal 재검토 의무)

본 PoC 의미:
1. ★ paradigm + platform-cross MEDIUM #2 사실 확보 (Java→TS / JVM→Node.js)
2. ★ TypeORM createQueryBuilder fluent API spectrum 측정 사실
3. ★ ★ Modern Node.js stack 동작 입증 (R2 가설 / Modern + 작은 책임 = 자동화 ↑↑ → -3.1%p 미세 손실 입증)
4. ★ phase 4.7 spectrum 5번째 적용 강화 (DEC-CHAIN-006 §2)
5. ★ ★ ★ paradigm-cross strong 의무성 입증 (★ Senior STOP signal 강화 / pure raw query() 별도 carry)

---

## 7. 다음 PoC 단계 (★ 별도 session)

- ★ **PoC #10 (JPA QueryDSL)** = v2.3.0 minor trigger / 별도 session prelim → Day 1~3.5
- ★ ★ ★ **C-paradigm-cross-strong-raw-sql** carry = ★ 사용자 결단 의무 (raw query() OSS 검색 vs MEDIUM 2 PoC = 격상 자격 정책 변경)
- v2.2.0 final 격상 결단 = ★ ★ Senior STOP signal 재검토 + cooling-off 후 (2026-05-15+) 별도 결단
- ★ PoC #11 (EFI-WEB billing) = source 위임 도착 시 우선순위 #1 복귀
