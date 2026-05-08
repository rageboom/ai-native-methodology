# SQL Inventory — jpetstore-6 (★ paradigm-cross corroboration #1 / Modern stack)

> 2026-05-07 / DEC-2026-05-07-poc-08-보류-해제 (Day 1.5)
> ★ ★ ★ phase 4.8 sql-inventory 본체 자산 첫 외부 환경 진입 (v2.2.0-rc1)
> Modern stack — Spring 6.2.18 + MyBatis 3.5.19 + Stripes 1.6.0

---

## 1. PoC #08 scope

mybatis/jpetstore-6 reference webapp (★ Modern stack) ★ ★ paradigm-cross corroboration #1. PoC #06 (Spring 4.1 + iBATIS 2 / 단일책임 6 SQL) + PoC #07 (Spring 4.1 + iBATIS 2 / 다중책임 71 SQL) ≥ 2 PoC isomorphic 후 ★ paradigm 진입 (iBATIS 2 → MyBatis 3 / Spring 4 → 6).

### corroboration 자격

★ ★ MEDIUM 정합:
- **standard-MyBatis floor** ✅ 입증 (25 SQL XML / 7 mapper / namespace strict)
- **evolved-tag ceiling** ❌ 입증 ❌ (`<isNotNull>/<dynamic>/<iterate>` = 0 / iBATIS 2 evolved tag 부재)
- **annotation paradigm** ❌ 입증 ❌ (jpetstore-6 = XML 단독 / annotation mapper 0)
- **`<bind>` OGNL** ✅ 입증 (4 occurrence / iBATIS 2 와 paradigm 동일 OGNL)

★ paradigm-cross corroboration **non-isomorphic in the hard direction** = 본 PoC 단독 = v2.2.0 final 격상 trigger ❌ 솔직 인정. PoC #09 (TypeORM raw SQL) ★ 강 corroboration 의무.

---

## 2. 자동 추출 결과 (★ 외부 조언 6 컬럼 기준)

| 컬럼 | 자동? | 추출 결과 | 신뢰도 |
|---|---|---|---|
| 1. sql_id | ✅ grep | `<select|insert|update|delete id="..."` → 25 entry | 100% |
| 2. mapper_xml | ✅ | src/main/resources/org/mybatis/jpetstore/mapper/*.xml (7) | 100% |
| 3. called_from_screen | ❌ 수동 | Stripes ActionBean → JSP forward path 추적 의무 | 80% (LLM + grounding) |
| 4. business_meaning | ❌ 수동 | 자연어 요약 (★ pet store 단순 도메인 → ↑) | 85% (LLM) |
| 5. dynamic_branch | ✅ grep | MyBatis 3 `<bind>` 4 만 / `<if>/<choose>/<foreach>` = 0 | 100% |
| 6. dependent_tables | ✅ regex | 12 unique tables (account/profile/signon/bannerdata/category/product/item/inventory/orders/orderstatus/lineitem/sequence) | 100% |

### 자동 추출 비율

- **외부 6 컬럼**: 4/6 = ★ **66.7%** ≥ 50% pass
- 외부 7 컬럼 (statement_type 추가): 5/7 = 71.4% (default-injection 100% PREPARED)
- 전체 11 컬럼: 5/11 = 45% (참고 / 본 추가 5 컬럼은 metadata)

★ ★ ★ **3 PoC isomorphic 자격 사실 확보**:
- PoC #06: 4/6 = 66.7% / iBATIS 2 / 단일책임 / Spring 4.1
- PoC #07: 4/6 = 66.7% / iBATIS 2 / 다중책임 / Spring 4.1
- **PoC #08: 4/6 = 66.7% / MyBatis 3 / 단일책임 / Spring 6**
- delta = 0%p — paradigm + scale + responsibility 무관 robust isomorphic

---

## 3. 25 SQL × 11 컬럼 인벤토리 표

| # | sql_id | mapper_xml:line | called_from | business | dynamic | tables | UC | intent/bug | conf | flags |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `AccountMapper.getAccountByUsername` | AccountMapper.xml:27 | EditAccountForm.jsp | 사용자 계정 조회 (4테이블 join) | 0 | ACCOUNT, PROFILE, SIGNON, BANNERDATA | UC-003 | intent (BR-007) | 0.95 | — |
| 2 | `AccountMapper.getAccountByUsernameAndPassword` | :53 | SignonForm.jsp | ★ ★ 평문 password 비교 (4테이블 join) | 0 | ACCOUNT, PROFILE, SIGNON, BANNERDATA | UC-006 | bug (★ AP-004 평문) | 0.95 | — |
| 3 | `AccountMapper.updateAccount` | :81 | EditAccountForm.jsp | ACCOUNT 갱신 | 0 | ACCOUNT | UC-004 | intent (BR-002) | 0.95 | — |
| 4 | `AccountMapper.insertAccount` | :96 | NewAccountForm.jsp | ACCOUNT 신규 (트랜잭션 1/3) | 0 | ACCOUNT | UC-002 | intent (BR-001) | 0.95 | — |
| 5 | `AccountMapper.updateProfile` | :103 | EditAccountForm.jsp | PROFILE 갱신 (`<bind>` boolean→1/0) | 2 (`<bind>`) | PROFILE | UC-004 | intent (BR-007) | 0.90 | — |
| 6 | `AccountMapper.insertProfile` | :116 | NewAccountForm.jsp | PROFILE 신규 (트랜잭션 2/3) | 2 (`<bind>`) | PROFILE | UC-002 | intent (BR-001) | 0.90 | — |
| 7 | `AccountMapper.updateSignon` | :125 | EditAccountForm.jsp (옵션) | ★ SIGNON 평문 갱신 (BR-002 분기) | 0 | SIGNON | UC-004 | ambiguous (intent BR-002 + bug AP-004) | 0.85 | — |
| 8 | `AccountMapper.insertSignon` | :130 | NewAccountForm.jsp | ★ SIGNON 신규 (트랜잭션 3/3 / 평문) | 0 | SIGNON | UC-002 | ambiguous (intent BR-001 + bug AP-004) | 0.85 | — |
| 9 | `CategoryMapper.getCategory` | CategoryMapper.xml:27 | Category.jsp | 단일 카테고리 (CATID PK) | 0 | CATEGORY | UC-012 | intent | 0.98 | — |
| 10 | `CategoryMapper.getCategoryList` | :35 | Main.jsp | 전체 카테고리 목록 | 0 | CATEGORY | UC-011 | intent | 0.98 | — |
| 11 | `ItemMapper.getItemListByProduct` | ItemMapper.xml:27 | Product.jsp | Product → Item 목록 (재고 ❌) | 0 | ITEM, PRODUCT | UC-013 | intent | 0.95 | — |
| 12 | `ItemMapper.getItem` | :47 | Item.jsp | 단일 Item (3테이블 join / 재고 포함) | 0 | ITEM, INVENTORY, PRODUCT | UC-014 | intent | 0.95 | — |
| 13 | `ItemMapper.getInventoryQuantity` | :70 | Item / ConfirmOrder / ViewOrder.jsp | ★ ★ N+1 fetch (Order 내부) | 0 | INVENTORY | UC-008/014/019 | bug (AP-006 N+1) | 0.90 | — |
| 14 | `ItemMapper.updateInventoryQuantity` | :76 | ConfirmOrder.jsp | ★ ★ N+1 update (재고 차감) | 0 | INVENTORY | UC-018 | ambiguous (intent BR-004 + bug AP-006) | 0.85 | — |
| 15 | `LineItemMapper.getLineItemsByOrderId` | LineItemMapper.xml:27 | ViewOrder.jsp | 주문 lineItem 목록 (fetch chain) | 0 | LINEITEM | UC-019 | intent (BR-005) | 0.90 | — |
| 16 | `LineItemMapper.insertLineItem` | :38 | ConfirmOrder.jsp | lineItem 신규 (트랜잭션 5/5) | 0 | LINEITEM | UC-018 | intent (BR-004) | 0.95 | — |
| 17 | `OrderMapper.getOrder` | OrderMapper.xml:27 | ViewOrder.jsp | 단일 주문 (ORDERS+ORDERSTATUS join) | 0 | ORDERS, ORDERSTATUS | UC-019 | intent | 0.95 | — |
| 18 | `OrderMapper.getOrdersByUsername` | :60 | ListOrders.jsp | 사용자별 주문 목록 (ORDER BY) | 0 | ORDERS, ORDERSTATUS | UC-016 | intent | 0.95 | — |
| 19 | `OrderMapper.insertOrder` | :95 | ConfirmOrder.jsp | ORDERS 신규 (25컬럼 ship/bill+credit) | 0 | ORDERS | UC-018 | intent (BR-004) | 0.95 | — |
| 20 | `OrderMapper.insertOrderStatus` | :105 | ConfirmOrder.jsp | ORDERSTATUS 신규 (★ orderId 가 LINENUM 도) | 0 | ORDERSTATUS | UC-018 | ambiguous (schema design) | 0.80 | — |
| 21 | `ProductMapper.getProduct` | ProductMapper.xml:27 | Product.jsp | 단일 Product (PRODUCTID PK) | 0 | PRODUCT | UC-013 | intent | 0.98 | — |
| 22 | `ProductMapper.getProductListByCategory` | :37 | Category.jsp | 카테고리별 Product 목록 | 0 | PRODUCT | UC-012 | intent | 0.98 | — |
| 23 | `ProductMapper.searchProductList` | :47 | SearchProducts.jsp | ★ N+1 검색 (lower(name) LIKE) | 0 | PRODUCT | UC-015 | bug (AP-005 N+1) | 0.90 | — |
| 24 | `SequenceMapper.getSequence` | SequenceMapper.xml:27 | ConfirmOrder.jsp | ★ 자체 sequence (DB native ❌) | 0 | SEQUENCE | UC-018 | ambiguous (intent multi-RDBMS + bug race) | 0.85 | — |
| 25 | `SequenceMapper.updateSequence` | :33 | ConfirmOrder.jsp | ★ sequence 갱신 (race risk) | 0 | SEQUENCE | UC-018 | bug (AP-007 race) | 0.85 | — |

---

## 4. 동적 분기 통계

| 종류 | 건수 | 위치 |
|---|---|---|
| MyBatis 3 `<bind>` (OGNL ternary) | 4 | AccountMapper.xml:104,105,117,118 |
| `<if>` / `<choose>` / `<foreach>` / `<trim>` / `<where>` / `<set>` | 0 | (★ ★ ★ jpetstore-6 = standard CRUD / dynamic SQL surface 매우 작음) |
| SQL CASE WHEN | 0 | (Modern stack / 도메인 단순) |

★ ★ ★ paradigm-cross corroboration **non-isomorphic in the hard direction** — iBATIS 2 evolved-tag (PoC #06+#07 의 27+ `<isNotEmpty>` / 14 SATD CASE WHEN) ↔ MyBatis 3 standard (4 `<bind>` only). standard-MyBatis floor 입증 / evolved-tag ceiling + annotation paradigm 입증 ❌ 솔직.

---

## 5. intent vs bug 분류 통계

| 분류 | 건수 | 비율 |
|---|---|---|
| intent | 16 | 64% |
| bug | 4 | 16% (★ ★ AP-004 평문 password 1 + AP-005 N+1 검색 1 + AP-006 N+1 inventory 1 + AP-007 sequence race 1) |
| ambiguous | 5 | 20% (★ password 분기 2 + sequence 1 + inventory N+1 update 1 + orderId schema 1) |
| self_recognized (SATD) | 0 | 0% (★ ★ jpetstore-6 = SATD 부재 / Modern stack 정합 / vs PoC #07 capital 11 SATD) |

★ ★ pet store CRUD 도메인 = ambiguous 적음 (5/25 = 20%) → phase 4.7 oracle 신호 약화 risk (carry C-poc-08-domain-ambiguity-deficit).

---

## 6. dependent tables 분포

| 테이블 | SQL 호출 수 | 핵심 |
|---|---|---|
| ACCOUNT | 4 | 사용자 마스터 |
| PROFILE | 4 | 사용자 선호 |
| SIGNON | 4 | ★ 평문 password |
| BANNERDATA | 2 | 배너 매핑 |
| CATEGORY | 2 | 카테고리 |
| PRODUCT | 5 | 상품 (★ 검색 포함) |
| ITEM | 2 | SKU |
| INVENTORY | 3 | ★ N+1 fetch 핵심 |
| ORDERS | 3 | 주문 헤더 |
| ORDERSTATUS | 3 | 주문 상태 |
| LINEITEM | 2 | 주문 line |
| SEQUENCE | 2 | ★ 자체 sequence |
| **합계** | **36** (★ 25 SQL × 평균 1.44 tables) | |

unique tables = 12 (★ inventory.json database.tables 정합)

---

## 7. carry (PoC #08 종결 시)

신규 carry 가능:
- C-PoC08-shared-sql-fragment-DRY-violation (★ getAccountByUsername + getAccountByUsernameAndPassword 동일 4 테이블 join pattern duplicate / shared `<sql refid>` 미사용)
- C-PoC08-resultMap-N+1-direct-cause (★ resultType 14 >> resultMap 0 / Order N+1 fetch 직접 원인 / Modern recommendation = nested resultMap)
- C-PoC08-platform-cross-stripes-paradigm (★ Spring MVC vs Stripes paradigm difference / chain 1 planning UC mapping 의 Stripes convention default → @RequestMapping 변환 시 UC 매핑 strategy carry)

기존 carry resolved:
- ✅ C-poc-08-stripes-adapter (Day 1 정탐 §정정 + 본 inventory called_from_screen 정합)
- ⏳ C-poc-08-mybatis3-schema-gap (patterns_extension_v3 carry 별도 / 본 PoC = v2 partial 만 사용)
- ⏳ C-poc-08-domain-ambiguity-deficit (★ phase 4.7 Day 2 측정 시 검증 의무)

---

## 8. 검증 통과

```
$ node tools/sql-inventory-extractor/src/cli.js \
    --target examples/poc-08-realworld-mybatis/sql-inventory/

[sql-inventory-extractor] 0 findings (critical: 0, high: 0, medium: 0)
inventory: 25 records
auto_ratio_external_6: 66.7% (threshold 50%)
statement_type distribution: PREPARED=25 / CALLABLE=0 / STATEMENT=0
carry_flags total: 0
```

→ ★ ★ ★ phase 4.8 sql-inventory 본체 자산 첫 외부 환경 진입 = ★ ★ pass / corroboration #1 사실 확보.
