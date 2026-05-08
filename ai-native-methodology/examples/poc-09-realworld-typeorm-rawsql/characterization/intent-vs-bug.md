# Intent vs Bug 분류표 — nestjs-realworld (★ phase 4.7 paradigm + platform-cross corroboration #2)

> 외부 조언 (Michael Feathers Characterization Testing) 4단계 분류.
> ★ ★ ★ 5번째 phase 4.7 spectrum 적용 — Modern TypeScript + NestJS + TypeORM.

## 1. Business Rules (7건) 분류

| ID | 제목 | 분류 | 근거 |
|---|---|---|---|
| BR-RW-001 | User 등록 시 username + email uniqueness | **intent** | createQueryBuilder uniqueness check 정합 |
| BR-RW-002 | ★ ★ ★ password = argon2 해시 (★ vs PoC #08 평문 inverse) | **intent** | argon2.verify + hash = 정상 보안 / Modern Node.js stack 정합 |
| BR-RW-003 | Article findAll = 4 동적 분기 | **intent** | TypeORM dynamic SQL paradigm 정합 |
| BR-RW-004 | Article findFeed = follow IN ids | **intent** | feed contract 정합 |
| BR-RW-005 | Article slug 자동 생성 | **intent** | URL-safe slug = REST 표준 |
| BR-RW-006 | Comment cascade save | **intent** | TypeORM cascade relation = 표준 |
| BR-RW-007 | Profile follow uniqueness check | **intent** | findOne + save 패턴 정합 |

**BR 분류 결과**: intent 7 / bug 0 / ambiguous 0 / self_recognized 0

## 2. Antipatterns (4건) 분류

| ID | 제목 | 분류 | 근거 + 처분 |
|---|---|---|---|
| AP-RW-001 | DELETE users/:slug — :slug 가 username | **ambiguous** | REST URL convention 부정합 / 의도된 design 또는 typo / D2.5 결단: ambiguous 유지 |
| AP-RW-002 | findAll `where('1 = 1')` placeholder | **intent** (★ ★ paradigm-cross corroboration #2 핵심) | iBATIS 2 `<dynamic>` 와 isomorphic / placeholder smell but paradigm 정합 / D2.5 결단: intent 격하 |
| AP-RW-003 | ★ ★ Article favorite — 트랜잭션 boundary 부재 | **bug** | @Transactional 부재 / partial commit risk = 명백한 폐해 / 새 시스템 = NestJS @Transaction 의무 |
| AP-RW-004 | Profile follow self-check 늦은 검증 | **ambiguous** | DB call 후 self-check / 모범 = controller validation / D2.5 결단: ambiguous 유지 (효과 미세) |

**AP 분류 결과**: intent 1 / bug 1 / ambiguous 2 / self_recognized 0

## 3. ★ ★ ★ acceptance oracle (named_classified_ratio)

| 항목 | 분류 | 명시 키워드 | 자격 |
|---|---|---|---|
| BR-RW-001 ~ 007 | intent | ✅ "intent" | ✅ |
| AP-RW-001 | ambiguous | ✅ "ambiguous" | ✅ |
| AP-RW-002 | intent (D2.5 격하) | ✅ "intent" | ✅ |
| AP-RW-003 | bug | ✅ "bug" | ✅ |
| AP-RW-004 | ambiguous | ✅ "ambiguous" | ✅ |

**named_classified_ratio Day 2 = 11/11 = 100%** ✅ ≥ 80% pass

## 4. ★ phase 4.7 spectrum 5번째 적용 (DEC-CHAIN-006 §2 강화 #5)

| spectrum | named_classified_ratio (D2 후) |
|---|---|
| Modern (PoC #03 NestJS retrofit) | 100% (30/30) |
| Legacy 단일책임 (PoC #06 exchange) | 94% (17/18) |
| Legacy 다중책임 (PoC #07 capital) | 100% (27/27 D2.5) |
| Modern + Stripes (PoC #08 jpetstore) | 100% (16/16) |
| **★ ★ ★ Modern Node.js + TypeORM (PoC #09 nestjs-realworld)** | **100% (11/11 D2)** |

→ ★ ★ ★ ★ ★ DEC-CHAIN-006 §2 "spectrum 5번째 적용 강화" — Java→TS / JVM→Node.js paradigm + platform-cross 동시에도 oracle robust.

## 5. ★ paradigm-cross corroboration MEDIUM #2 정직 보고

| 차원 | iBATIS 2 / MyBatis 3 (Java) | TypeORM (TS) | corroboration |
|---|---|---|---|
| 언어 | Java | TypeScript | ★★★ paradigm |
| Runtime | JVM | Node.js | ★★★ platform |
| SQL 양식 | XML mapper | TS createQueryBuilder fluent | ★★ medium |
| dynamic SQL | XML `<isNotEmpty>` | `andWhere` chain | ★★ isomorphic 입증 ✅ |
| **raw query() / SP 호출** | XML `<select>` 직접 | ★ TypeORM raw `query()` 부재 | ★ ★ **strong 입증 ❌ 솔직** |

★ ★ ★ ★ MEDIUM corroboration #2 = createQueryBuilder fluent API paradigm 입증 ✅ / ★ raw `query()` paradigm 입증 ❌ 솔직 (★ pure realworld OSS 희소 / TypeORM 커뮤니티 자체가 ORM 추상화 권장).

★ v2.2.0 final 격상 trigger ❌ 솔직 (★ Senior STOP signal 정합) / paradigm-cross strong corroboration = ★ 별도 carry (★ raw query() OSS 검색 또는 사용자 source 결정).

## 6. SATD 분류

★ Modern OSS = SATD 0건 (PoC #08 isomorphic 정합 / vs PoC #07 11 SATD).

## 7. carry — domain expert review

★ Modern blog 도메인 = simple CRUD → expert ❌ (PoC #08 jpetstore 정합 / pet store 와 isomorphic).
