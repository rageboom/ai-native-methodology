# DEC-2026-05-08-poc-10-prelim-신설

> **카테고리**: methodology / PoC 등재 (prelim) / paradigm-cross MEDIUM / DSL builder paradigm 보강 / v2.3.0 minor trigger
> **상태**: 진행중 ( prelim — Day 0.5~ 정탐 + plan 2차 + 4원칙 3원칙 사용자 승인 + Day 1 진입)
> **일자**: 2026-05-08 (skeleton + 본 session prelim)
> **선행**: DEC-2026-05-07-poc-08-종결 ( MEDIUM corroboration #1) + DEC-2026-05-08-poc-09-prelim-신설 ( paradigm-cross strong / v2.2.0 final 핵심)
> **후속**: PoC #10 plan 2차 (정탐) + Day 1~3.5 (별도 session) + v2.3.0 minor 격상 결단 ( v2.2.0 final 후 별도)

---

## 1. 결단

PoC #10 (JPA QueryDSL / Java + Spring Boot + JPA + QueryDSL) 정식 prelim 등재. DSL builder paradigm corroboration / ** v2.3.0 minor trigger** ( DSL builder paradigm 추가 보강 / v2.2.0 final ❌ trigger).

사용자 결단 (β) 2026-05-07 정합: "우선순위 2, 3, 4, 후속 연달아 다 진행" 흡수 → PoC #08 ✅ + PoC #09 ( v2.2.0 final 핵심) prelim 후 PoC #10 (v2.3.0 minor) 우선 진입.

PoC #10 **prelim** 등재 — 정식 PoC #10 등재는 별도 session 첫 plan 2차 + 정탐 + Day 1~3.5 측정 종료 + 4축 metric 결과 기반 별도 결단.

## 2. 배경

- PoC #06~#09 (XML 또는 raw SQL) paradigm = mapper / inline string. DSL builder paradigm 부재 → PoC #10 = DSL builder + compile-time type check 보강
- carry C-v2.2.0-6c (PoC #10 / JPA QueryDSL) = v2.3.0 minor trigger 자격
- 본 PoC ≠ v2.2.0 final 격상 trigger ( paradigm-cross MEDIUM / DSL builder 추가 paradigm 보강 / strong corroboration 자격 ❌)

## 3. paradigm 거리 (vs PoC #06~#09)

| dimension           | XML mapper (PoC #06+#07+#08) | TS raw SQL (PoC #09) | **Java DSL (PoC #10)**                    | 거리                     |
| ------------------- | ---------------------------- | -------------------- | ----------------------------------------- | ------------------------ |
| 양식                | XML                          | TS string            | **type-safe Java DSL builder**            | medium (Java continuity) |
| dynamic SQL         | XML tags                     | TS 조건문            | **`BooleanBuilder` + `where()` chaining** |                          |
| compile-time        | ❌ runtime                   | ❌ runtime           | **✅ compile-time type check**            | paradigm strong          |
| `mapper_xml` schema | XML file path                | "inline"             | **"querydsl" / Repository class**         | schema 정합              |
| Result mapping      | resultType                   | TS interface         | **Q-class build-time generated**          |                          |

→ **MEDIUM corroboration 자격** — DSL builder + compile-time paradigm 추가 / Java continuity 정합.

## 4. 측정 대상 (4축 / PoC #08 패턴)

1. **§3-A 분석 자동화율** — Java + DSL grep 정확도 측정 ( XML 대비 ↓ / TS 대비 ↑ 가능성 / 추정 60~70%)
2. **§3-B 설계 자동화율** — chain 1 UC ≥ 90%
3. **phase 4.7 acceptance oracle** — Modern Java + Spring Boot ambiguous ↓ 예상 / ≥ 80%
4. ** SQL Inventory coverage** ( DSL builder paradigm 자격 자체 도전) — 외부 6 컬럼 자동 추출 ≥ 50% 자격

## 5. source 결정 후보 (정탐 후 결단)

후보 OSS:

- (a) Spring Boot + JPA + QueryDSL realworld webapp ( realworld typescript 의 java 변종)
- (b) NetflixOSS / Square 등 OSS Java + JPA + QueryDSL backend
- (c) GitHub search "querydsl" star ↑ realworld webapp

정탐 후 결단 의무. DSL builder 명시 사용 의무 ( JPQL / native query 단독 ❌).

## 6. scope 제한

### 포함

- JPA QueryDSL realworld OSS source ( source 결정 carry)
- analysis 4종 + SQL Inventory 11 컬럼 ( DSL builder paradigm)
- phase 4.7 + chain 1
- v2.1.1 ratchet trend baseline write

### 명시적 제외

- chain 2~4 본격 진입 ( §8.1 strict)
- **본체 격상 ❌** ( v2.3.0 minor trigger 자격 / v2.2.0 final ❌)

## 7. §8.1 strict 단일 PoC 과적합 회피 강제

본 PoC 1개 결과로 본체 격상 결단 ❌:

| 자산                                                             | 본체 격상 자격                                                          | carry ID               |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------- |
| phase 4.8 sql-inventory v2.3.0 minor 격상 (DSL builder sub-rule) | PoC #10 종결 시 자격 충족 (paradigm-cross MEDIUM #2 / DSL builder 추가) | C-v2.2.0-6c            |
| JPA QueryDSL spectrum sub-rule                                   | PoC #10 종결 시 carry 신설                                              | (PoC #10 종결 시 신규) |

본 PoC 의미 = (1) DSL builder paradigm corroboration 사실 확보 + (2) compile-time type check paradigm 측정 사실 + (3) phase 4.8 sql-inventory 본체 자산 DSL paradigm 적용 가능 입증.

## 8. 작업 시퀀스 (PoC #08 패턴 정합)

PoC #08 동일 패턴. ~14~18h / 14d cap 충분 여유.

## 9. 종결 조건 (a/b/c)

- (a) 4축 모두 pass (3/4 이상) — DSL builder paradigm corroboration 자격 충족 / v2.3.0 minor trigger 활성
- (b) SQL Inventory 4/6 ≥ 50% 자격 충족 = DSL builder paradigm robust 입증
- (c) 1축 이상 fail — v2.3.0 minor trigger ❌ / carry 분석

## 10. carry 매핑

- **C-v2.2.0-6c** ( v2.3.0 minor trigger 자격 / 본 PoC 종결 시 resolve)
- C-PoC10-source-결정 (정탐 후 사용자 결단)
- C-PoC10-DSL-builder-paradigm ( compile-time type check / Q-class build-time generated / sql-inventory schema 정합 의무)
- C-PoC10-domain-결정

## 11. 다음 PoC 단계

PoC #10 종결 후:

- v2.3.0 minor 격상 결단 (DSL builder sub-rule 추가 / 별도 plan + 사용자 결단)
- PoC #11 (EFI-WEB billing) = source 위임 도착 시 우선순위 #1 복귀 / 사내 ROI axis

## 12. 참조

- README: `examples/poc-10-realworld-jpa-querydsl/README.md`
- PoC #08 종결: `decisions/DEC-2026-05-07-poc-08-종결.md`
- PoC #09 prelim: `decisions/DEC-2026-05-08-poc-09-prelim-신설.md`
- 사용자 결단 (β): "우선순위 2, 3, 4, 후속 연달아 다 진행"
- 4원칙: CLAUDE.md §"Work Principles (4원칙)"
