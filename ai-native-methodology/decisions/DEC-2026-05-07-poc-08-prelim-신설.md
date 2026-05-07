# DEC-2026-05-07-poc-08-prelim-신설

> **카테고리**: methodology / PoC 등재 / paradigm-cross corroboration #1 / v2.2.0 final 격상 trigger placeholder
> **상태**: 진행중 (★ prelim — 별도 session 첫 plan + research + Day 0 진입 의무)
> **일자**: 2026-05-07 (skeleton + 사용자 결단 수합) / Day 0.5~ (별도 session)
> **선행**: DEC-2026-05-08-v2.2.0-rc1-prerelease (★ paradigm-cross carry C-v2.2.0-6 origin)

---

## 1. 결단

v2.2.0-rc1 prerelease (phase 4.8 sql-inventory 본체 격상) 의 ★ paradigm-cross corroboration 의무 (Senior STOP signal 흡수) carry **C-v2.2.0-6 분해 → 6a/6b/6c 단계화** 후 ★ **첫 PoC** = MyBatis 3 측정.

★ ★ ★ **사용자 결단 수합 2026-05-07**: "우선 순위 대로 다 진행" → A1 (MyBatis 3) → A3 (TypeORM raw SQL) → A2 (JPA QueryDSL) 단계화. v2.2.0 final 격상 trigger 핵심 = PoC #09 (A3) ★ 강 corroboration. PoC #10 (A2) = v2.3.0 minor 별도.

★ ★ ★ ★ **사용자 정정 2026-05-07**: "MyBatis 는 내가 잘못 넣은 것 같다" → ★ 사내 = iBATIS 2 단일 / MyBatis ❌ 가 fact (EFI-WEB stack 정합). 따라서 **PoC #08 의 의미 재정합**:
- **(이전)** 사내 마이그레이션 신 stack 정합 + weak~medium paradigm-cross
- **(현재)** 사내 정합 ❌ + 본 방법론 일반화 자격 입증 + MyBatis 3 spectrum sub-rule 자격 + weak corroboration

★ ★ **PoC source 결정** (사용자 결단 2026-05-07): **(b) `mybatis/jpetstore-6`** 공식 reference webapp (XML 위주 / Spring MVC + MyBatis XML / pet store 비즈니스 도메인 / ~수천 LOC / 14d cap 안전 / OSS 일반화 자격 ★ 강).

PoC #08 **prelim** 등재 — 정식 PoC #08 등재는 별도 session 첫 plan + research + Day 0~7.5 측정 종료 + 4축 metric (3/4 이상 pass) 결과 기반 별도 결단 (종결 조건 §8).

## 2. 배경

- v2.2.0-rc1 prerelease (2026-05-07 / DEC-2026-05-08-v2.2.0-rc1-prerelease) 후 ★ paradigm-cross corroboration carry C-v2.2.0-6 (Modern ORM PoC #08 / 14d cap)
- ★ ★ ★ Senior STOP signal — PoC #06+#07 모두 Spring 4.1 + iBATIS 2 = 동일 paradigm 변종 (단일/다중책임 차이만 = scale-cross only). §8.1 strict 정신 = paradigm-cross corroboration 의무
- 사용자 결단 D-2026-05-07-α (★ ★ "우선순위 대로 다 진행"):
  - **A1 (PoC #08) = MyBatis 3** — 사내 마이그레이션 신 stack 정합 + weak~medium paradigm-cross
  - **A3 (PoC #09) = TypeORM raw SQL** — paradigm + platform-cross ★ ★ ★ 강 corroboration / v2.2.0 final 격상 trigger 핵심
  - A2 (PoC #10) = JPA QueryDSL — DSL builder paradigm 보강 / v2.3.0 minor
- 사내 마이그레이션 대상 = MyBatis (사용자 직전 발언) → PoC #08 = 사내 ROI ★ 강

## 3. 측정 대상 (4축 동시 / PoC #07 패턴 재사용)

1. **plan §3-A 분석 자동화율** — MyBatis 3 modern stack 추정 50% ± 10%p
2. **plan §3-B 설계 자동화율** — chain 1 planning-extraction-validator 통과 (0 critical / UC ≥ 90%)
3. **phase 4.7 acceptance oracle** — Modern stack ambiguous ↓ 예상 / named_classified_ratio ≥ 80% 자격
4. **★ ★ ★ SQL Inventory coverage** (★ phase 4.8 본체 자산 / paradigm-cross 자격 측정) — 자동 추출 ≥ 50% (PoC #06+#07 baseline 66.7% 대비 paradigm-cross degradation 수용 범위)

## 4. scope 제한

### 포함

- MyBatis 3 (XML / annotation / 혼용 — 사내 양식 confirm 후 정확 결단) realworld OSS source
- analysis 4종 + ★ SQL Inventory 11 컬럼 (★ phase 4.8 본체 자산 적용 / `tools/sql-inventory-extractor` MyBatis 3 spectrum 첫 진입)
- phase 4.7 + chain 1
- v2.1.1 ratchet trend baseline write (Modern stack 첫 진입)

### ★ ★ 명시적 제외

- chain 2~4 본격 진입 (PoC #07 패턴 정합)
- ★ ★ ★ **본체 격상 ❌** — 사용자 D11 정신 정합 / v2.2.0 final 격상 trigger = PoC #08 + PoC #09 (TypeORM) 둘 다 종결 후 (또는 PoC #09 단독)
- DBA 부재 환경 SP 본문 read (carry `proc-body / DBA-read` 정합)

## 5. ★ ★ ★ §8.1 strict 단일 PoC 과적합 회피 강제

본 PoC 1개 결과로 본체 격상 결단 ❌:

| 자산 | 본체 격상 자격 | carry ID |
|---|---|---|
| phase 4.8 sql-inventory v2.2.0 final 격상 | ★ paradigm-cross corroboration ★ 강 의무 = PoC #09 (TypeORM) ★ 핵심 / PoC #08 단독 = weak ~ medium 만 | C-v2.2.0-6a (PoC #08) + 6b (PoC #09 핵심) |
| phase 4.8 sub-rule (MyBatis 3 spectrum) | PoC #08 종결 시 자격 충족 | (PoC #08 종결 시 carry 신설) |

본 PoC 의미 = (1) paradigm-cross corroboration #1 사실 확보 + (2) MyBatis 3 spectrum 측정 사실 + (3) 사내 마이그레이션 신 stack 정합 입증.

## 6. ★ paradigm 거리 (vs PoC #06+#07 iBATIS 2 XML)

| dimension | iBATIS 2 (PoC #06+#07) | MyBatis 3 (PoC #08) | paradigm 거리 |
|---|---|---|---|
| Mapper 양식 | XML SqlMap (`<dynamic>` / `<iterate>` / `isXxx`) | XML Mapper (`<if>/<choose>/<foreach>`) + annotation (`@Select` 등) | ★ 작음 (XML) / ★★ 중간 (annotation) |
| dynamic SQL | iBATIS 2 전용 태그군 | MyBatis 3 표준화 (OGNL) | ★★ 표준화 차이 |
| `statementType` 표준 컬럼 | ❌ (인식 ❌) | ✅ 표준 | ★★ |
| Spring stack | Spring 4.1 (Boot ❌) | Spring Boot 3.x 가능 | ★★★ |
| 테스트 | 0개 | unit + integration 기대 | ★★★ |

→ ★ paradigm-cross corroboration **자격 강도 = weak ~ medium**. 사내 정합 ★ 강함은 보존.

## 7. ★ Day 0 사용자 confirm 2건 ★ resolved (2026-05-07)

본 session 사용자 결단 :

1. **사내 양식**: ★ 사용자 "잘 모르겠어" → ★ source 자체로 자동 처리 ((b) jpetstore-6 = XML 위주 → 본 PoC 측정 양식 = **XML 단독** 자동 결정)
2. **realworld OSS source**: ★ ★ **(b) `mybatis/jpetstore-6`** 결정 — 다음 이유:
   - 공식 reference webapp (mybatis 팀 maintenance / 권위 ★)
   - 비즈니스 도메인 (pet store / 주문 / 상품 / 카테고리) → planning §3-A + phase 4.7 acceptance oracle 측정 정합
   - Spring MVC + MyBatis XML 완전 stack = PoC #06+#07 (Spring 4.1 + iBATIS 2 XML) 패턴 정합 → corroboration 신뢰도 ★ 강
   - ~수천 LOC = 14d cap 안전
   - OSS 공개 자산 = 본 방법론 일반화 자격 ★ 강
3. ★ ★ **사용자 정정 2026-05-07** ("MyBatis 는 내가 잘못 넣은 것 같다") → 사내 = iBATIS 2 단일 / MyBatis ❌ → PoC #08 사내 정합 ❌ 명시 / 본 방법론 일반화 자격 + sub-rule 자격 입증용으로 재정합
4. 후보 (a/c/d) 처분:
   - (a) `mybatis-spring-boot-samples` ❌ (domain ❌ → measurement 부적합)
   - (c) gothinkster/realworld spring-boot-mybatis fork 검색 ❌ (검색 cost + 권위 ❌ + 14d cap 위험)
   - (d) 사내 후속 신 시스템 ❌ (사내 = iBATIS 2 단일 fact / 신 stack 미정 / 마이그레이션 미시작)

## 8. 종결 조건 (Day 7.5 측정 후)

다음 3개 중 1개 (PoC #07 패턴 reuse):

- **(a) PoC #08 정식 등재** — 4축 metric **3/4 이상 pass** + paradigm-cross corroboration #1 명시 + carry C-v2.2.0-6a resolve
- **(b) prelim 보존** — 측정 부족 / 다음 PoC 재시도
- **(c) scope 외 회수** — source 후보 부적합 + 다른 OSS 또는 사내 신 시스템으로 재시작

## 9. 작업 시퀀스 (placeholder / 별도 session 첫 plan 시 정식)

| Day | 작업 | 시간 | 산출 |
|---|---|---|---|
| 0 | (★ 본 session) skeleton + DEC + INDEX/STATUS | ~1h | DEC-prelim + README skeleton + INDEX prelim + STATUS prelim |
| 0.5 | ★ **별도 session 첫 진입** — plan + research + 사용자 confirm 2건 | ~3~4h | plan-poc-08-mybatis3.md + research-poc-08-mybatis3.md |
| 1~3 | source 사본 + analysis 4종 + ★ SQL Inventory 11 컬럼 | ~10~12h | input/{4종} + sql-inventory/{json,md} |
| 3.5 | §3-A 측정 + sql-inventory 자동/수동 비율 | ~1h | inventory.json + sql-inventory.json `extraction_automation` |
| 4~6 | phase 4.7 (snapshot + intent-vs-bug + coverage) | ~6~8h | characterization/{snapshots, intent-vs-bug, coverage} |
| 6.5 | D2 ambiguous 도메인 결단 (사용자 묶음) | ~1.5h | DEC-domain-결단 |
| 7 | chain 1 + validators + ratchet baseline write | ~2~3h | .aimd/output/planning-spec + state.json + baseline |
| 7.5 | REPORT + DEC 종결 + STATUS + INDEX + carry resolve | ~2h | REPORT + DEC-종결 + carry C-v2.2.0-6a resolve |
| 8~14 | (cap 여유 / 측정 결과 따라 carry resolve 의무) | — | — |

★ 누적: ~26~32h (3.5~4일 실제 / 14d cap 여유). 별도 session 첫 plan 시 정식.

## 10. 다음 PoC 단계

PoC #08 종결 후 우선순위 단계화 (사용자 결단 2026-05-07):
- **PoC #09** (A3 TypeORM raw SQL) — paradigm + platform-cross ★ 강 / **★ v2.2.0 final 격상 trigger 핵심** (별도 prelim DEC + plan 의무)
- PoC #10 (A2 JPA QueryDSL) — DSL builder paradigm 보강 / v2.3.0 minor (별도 prelim DEC + plan 의무)

## 11. 참조

- 직전 release: DEC-2026-05-08-v2.2.0-rc1-prerelease (★ paradigm-cross carry C-v2.2.0-6 origin)
- ADR-CHAIN-007 (★ phase 4.8 sql-inventory + paradigm-cross 우려 명문화)
- 직전 PoC: DEC-2026-05-08-poc-07-종결 (corroboration #2 / SQL Inventory 11 컬럼 isomorphic 자격 충족)
- corroboration #1: DEC-2026-05-08-poc-06-sql-inventory-retrofit
- §8.1 strict 의무: 사용자 D11 결단 (b) → ≥ 2 PoC isomorphic 후 v2.x
- 사용자 결단 2026-05-07: "우선 순위 대로 다 진행" (PoC #08+#09+#10 단계화)
