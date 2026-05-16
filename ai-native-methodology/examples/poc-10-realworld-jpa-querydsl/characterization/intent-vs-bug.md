# Intent vs Bug 분류 — raeperd Spring Data JPA (★ phase 4.7 6번째 spectrum)

## 1. BR (5건)

| ID | 분류 | 근거 |
|---|---|---|
| BR-RAE-AUTH-001 | intent | JWT 즉시 발급 = 표준 |
| BR-RAE-SEARCH-002 | intent | ★ ★ method name derived query paradigm = Spring Data JPA 정합 |
| BR-RAE-SLUG-003 | intent | Embedded VO + slug 자동 = DDD 정합 |
| BR-RAE-CONTENT-004 | intent | Aggregate cascade = DDD 정합 |
| BR-RAE-FOLLOW-005 | intent | uniqueness check 정합 |

## 2. AP (2건)

| ID | 분류 | 근거 |
|---|---|---|
| AP-RAE-001 | ambiguous | 긴 method name = 가독성 ↓ but Spring Data JPA paradigm 정합 / D2.5 결단 ambiguous |
| AP-RAE-002 | bug | ★ ★ N+1 risk on Lazy fetch / @EntityGraph 의무 |

## 3. acceptance oracle

named_classified_ratio = 7/7 = 100% (D2)

## 4. ★ phase 4.7 spectrum 6번째 적용

| spectrum | ratio |
|---|---|
| Modern (PoC #03) | 100% |
| Legacy 단일 (PoC #06) | 94% |
| Legacy 다중 (PoC #07) | 100% |
| Modern + Stripes (PoC #08) | 100% |
| Modern Node.js + TypeORM (PoC #09) | 100% |
| **★ Modern Java + Spring Data JPA (PoC #10)** | **100%** |

→ ★ ★ ★ DEC-CHAIN-006 §2 spectrum 6번째 적용 강화.

## 5. paradigm-cross MEDIUM #3 정직

★ ★ ★ ★ DSL builder QueryDSL ❌ 솔직 (★ pure realworld OSS 부재).
★ Spring Data JPA method name derived query paradigm 입증 ✅ — 본 방법론 일반화 자격 강화.
★ ★ ★ v2.3.0 minor trigger ❌ (DSL builder 의무 vs 실측 부재).
