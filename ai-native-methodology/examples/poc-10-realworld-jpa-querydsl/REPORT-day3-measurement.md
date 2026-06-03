# PoC #10 Day 3.5 측정 보고 — raeperd Spring Data JPA ( paradigm-cross MEDIUM #3 reframe)

> 2026-05-08 / 본 session 종결
> DSL builder QueryDSL ❌ 솔직 / Spring Data JPA method name derived query paradigm 측정 / 본 PoC 본질 reframe / v2.3.0 minor trigger ❌

## 1. 결단 (4축 측정)

    **4축 모두 pass**:

| 축               | metric                 | PoC #08  | PoC #09  | **PoC #10**                                                | 자격                    |
| ---------------- | ---------------------- | -------- | -------- | ---------------------------------------------------------- | ----------------------- |
| §3-A 자동화율    | auto_ratio             | 66.7%    | 63.6%    | **60%** (-3.6%p / method derived logical inference 의존 ↑) | ✅ pass                 |
| §3-B chain 1 UC  | UC / 0 findings        | 100% / 0 | 100% / 0 | **100% / 0**                                               | ✅ pass                 |
| phase 4.7 oracle | named_classified_ratio | 100%     | 86.7%    | **100%**                                                   | ✅ pass                 |
| SQL Inventory    | external 6             | 66.7%    | 66.7%    | **66.7%**                                                  | ✅ **5 PoC isomorphic** |

**5 PoC SQL Inventory isomorphic 자격 사실 확보** (66.7% × 5 / iBATIS 2 + MyBatis 3 + TypeORM + Spring Data JPA / paradigm + ORM + platform-cross 모두 robust).

## 2. paradigm-cross 자격 정직 보고 — DSL builder ❌ 솔직

MEDIUM #3 = **non-isomorphic in the DSL direction**:

| 차원                                                       | 결과                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| ✅ Spring Data JPA method name derived query paradigm 입증 | corroboration ✅ ( findAllByContentsTagsContains 등)                    |
| ✅ DDD Aggregate + Embedded VO 입증                        | corroboration ✅ ( Title.slug + Profile.userName)                       |
| ❌ DSL builder QueryDSL 입증                               | ❌ 솔직 ( raeperd 정탐 후 QueryDSL 부재 발견 / pure realworld OSS 부재) |

### v2.3.0 minor trigger 결과

**trigger ❌** ( DSL builder QueryDSL paradigm 부재) → 본 PoC = 본 방법론 일반화 자격 입증 만 / Spring Data JPA spectrum sub-rule carry.

## 3. AP isomorphic + novel

| 분류                              | 건수 | 항목                                                   |
| --------------------------------- | ---- | ------------------------------------------------------ |
| isomorphic to PoC #06+#07+#08+#09 | 1    | N+1 risk (AP-RAE-002 = 5 PoC 공통 AP 일반성 입증 강화) |
| novel                             | 1    | 긴 method name 가독성 ↓ (AP-RAE-001)                   |

## 4. phase 4.7 spectrum 6번째 적용 (DEC-CHAIN-006 §2)

| spectrum                                           | ratio    |
| -------------------------------------------------- | -------- |
| Modern (PoC #03 NestJS retrofit)                   | 100%     |
| Legacy 단일 (PoC #06)                              | 94%      |
| Legacy 다중 (PoC #07)                              | 100%     |
| Modern + Stripes (PoC #08)                         | 100%     |
| Modern Node.js + TypeORM (PoC #09)                 | 100%     |
| ** Modern Java + Spring Data JPA + DDD (PoC #10)** | **100%** |

→ DEC-CHAIN-006 §2 "spectrum 6번째 적용 강화".

## 5. carry 결산

### ✅ resolved

- C-v2.2.0-6c ( DSL builder ❌ 솔직 / Spring Data JPA paradigm 측정 / v2.3.0 minor trigger ❌)
- C-PoC10-source-결정 (raeperd 채택 / DSL builder 부재 발견 / reframe)
- C-PoC10-DSL-builder-paradigm ( DSL builder QueryDSL = pure realworld OSS 부재 솔직 / 별도 carry)

### 신규 carry

- C-paradigm-cross-DSL-builder-querydsl ( raw query() carry 와 isomorphic / DSL builder QueryDSL OSS 검색 또는 사용자 source 결정)
- C-PoC10-method-derived-paradigm-sub-rule ( Spring Data JPA spectrum sub-rule v2.x carry)
- C-PoC10-N+1-EntityGraph-mandatory ( AP-RAE-002 / 새 시스템 @EntityGraph 의무)

## 6. §8.1 strict 본체 격상 ❌

DSL builder paradigm corroboration 자격 ❌ → v2.3.0 minor trigger ❌. 본 PoC 의미:

1. paradigm-cross MEDIUM #3 사실 확보 (Spring Data JPA method derived)
2. 5 PoC SQL Inventory isomorphic = sql-inventory 본체 자산 paradigm 무관성 robust 입증 강화
3. DDD + Embedded VO + Aggregate cascade paradigm 추가 측정
4. phase 4.7 spectrum 6번째 적용
5. AP N+1 = 5 PoC 공통 ( AP 일반성 입증 강화)
6. DSL builder QueryDSL 별도 carry

## 7. 다음 PoC 단계

- C-paradigm-cross-DSL-builder-querydsl carry = 사용자 결단 (raw query() carry 와 동일 패턴)
- v2.2.0 final 격상 결단 = cooling-off 후 (2026-05-15+) + 사용자 결단
- PoC #11 (EFI-WEB billing) source 위임 대기 (사용자 결단 α #1)
