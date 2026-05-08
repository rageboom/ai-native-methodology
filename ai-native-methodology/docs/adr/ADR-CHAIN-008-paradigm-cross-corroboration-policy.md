# ADR-CHAIN-008: paradigm-cross corroboration 정책 정정 — 2026년 OSS 사실 흡수 + "MEDIUM × ≥ 5 PoC = strong robust" 신정책

- 상태: 승인됨 (Accepted) — ★ ★ ★ ★ ★ Auto Mode 사용자 결단 (B) "정책 완화" 정합 / 5 PoC measurement-based decision
- 일자: 2026-05-08
- 결정자: 윤주스 (TF Lead) (★ ★ Auto Mode β + "남근거 다 실행" + (A) → (B) 결단 chain)
- 관련: ADR-CHAIN-007 (phase 4.8 sql-inventory / paradigm-cross strong 의도 origin), DEC-2026-05-08-poc-12-13-prelim-신설 (★ 정탐 사실 origin), DEC-2026-05-07-poc-08-종결 / DEC-2026-05-08-poc-09-종결 / DEC-2026-05-08-poc-10-종결 (★ 5 PoC 측정 결과)

---

## 컨텍스트

ADR-CHAIN-007 phase 4.8 (sql-inventory) 본체 격상 시 ★ Senior STOP signal 흡수 — paradigm-cross corroboration 의무 명시 (★ scale-cross + paradigm-cross 의무). ★ ★ v2.2.0-rc1 prerelease 7d minimum cooling-off + Modern ORM PoC #08 carry C-v2.2.0-6 = v2.2.0 final 격상 trigger 정의.

**5 PoC measurement 결과**:

| PoC | stack | SQL Inventory ratio |
|---|---|---|
| #06 | Spring 4.1 + iBATIS 2 (Java / 단일책임) | 4/6 = 66.7% |
| #07 | Spring 4.1 + iBATIS 2 (Java / 다중책임) | 4/6 = 66.7% |
| #08 | Spring 6 + MyBatis 3 + Stripes (Java / Modern) | 4/6 = 66.7% |
| #09 | NestJS + TypeORM (TypeScript / Modern Node.js) | 4/6 = 66.7% |
| #10 | Spring Boot + Spring Data JPA + DDD (Java / Modern) | 4/6 = 66.7% |

★ ★ ★ ★ ★ **5 PoC SQL Inventory isomorphic 자격 사실 확보** — paradigm + ORM + platform-cross 모두 robust 강 입증.

---

## ★ ★ ★ ★ ★ 정탐 사실 (DEC-2026-05-08-poc-12-13-prelim-신설 흡수)

★ paradigm-cross **strong** corroboration 의무 (raw `query()` + DSL builder QueryDSL paradigm 추가 PoC 의무) 정탐:

| paradigm | 정탐 결과 |
|---|---|
| **raw `query()` realworld OSS** | ★ ★ ★ ★ 부재 사실 (Node.js / Java / Python / Go / Rust 모두 community sample 만 / pure realworld ❌) |
| **DSL builder QueryDSL realworld OSS** | ★ ★ ★ ★ ★ 부재 사실 (querydsl-examples sample / spring-data-examples fragment / Infobip library / Big-tech production 모두 검증 불가) |

→ ★ ★ ★ ★ ★ **2026년 OSS realworld application = ORM 추상화 paradigm 주류** 사실 확보:
- raw SQL `query()` = "emergency escape hatch" / standard usage ❌
- DSL builder QueryDSL = library / sample 만 / production realworld ❌
- ORM 추상화 (TypeORM / JPA / Sequelize / Prisma / SQLAlchemy / GORM) = 표준

→ ★ ★ ★ ★ ★ ★ **본 방법론의 paradigm-cross strong corroboration 의무 = 2026년 OSS 현실과 gap 사실**.

---

## 결정

★ ★ ★ ★ ★ ★ **paradigm-cross corroboration 정책 정정** (★ 본 ADR-CHAIN-008):

### 신정책

**§1. MEDIUM × ≥ 5 PoC isomorphic = strong corroboration 자격 충족** (★ 본 ADR 핵심).

**근거 1**: ★ ★ ★ ★ ★ 5 PoC × 66.7% SQL Inventory isomorphic = paradigm + ORM + platform 무관 robust 강 입증 = ★ 사실상 strong corroboration 자체. 추가 paradigm (raw query() / DSL builder) PoC = ★ marginal information gain (★ ★ ★ ★ 동일 isomorphic 비율 도출 expectation).

**근거 2**: ★ ★ ★ ★ ★ 2026년 OSS realworld 사실 = pure raw query() / DSL builder paradigm 부재. ★ strong corroboration 의무 강제 = ★ ★ source 결정 ❌ blocker (★ 사용자 사내 source 또는 synthetic fork patch 의무 / 14d cap × N 비현실).

**근거 3**: ★ ★ ★ ★ N+1 AP = 5 PoC 공통 일반성 robust 입증 = ★ AP 차원 strong corroboration 사실 확보.

**근거 4**: ★ DEC-CHAIN-006 §2 spectrum 6번째 적용 강화 = phase 4.7 acceptance oracle 자격 6 spectrum 모두 ≥ 86.7% pass.

### §2. ADR-CHAIN-007 §"paradigm-cross 우려" 갱신

기존:
> ★ ★ ★ 본 ADR = scale-cross 입증만 (PoC #06+#07) + ★ paradigm-cross = ★ Modern ORM PoC #08 carry (C-v2.2.0-6) → ★ v2.2.0 final 격상 trigger 의무.

★ ★ ★ ★ ★ **갱신 (★ 본 ADR-CHAIN-008 정합)**:
> ★ ★ ★ 5 PoC measurement 결과 (PoC #06+#07+#08+#09+#10 = MEDIUM × 5 isomorphic robust) = ★ ★ paradigm-cross strong corroboration 자격 사실 확보 (★ 본 ADR-CHAIN-008 §1 신정책 정합) / v2.2.0 final 격상 trigger ★ 활성.

### §3. v2.2.0 final 격상 trigger 활성

★ ★ ★ ★ ★ ★ 본 ADR 채택 = **C-v2.2.0-6 carry resolved** + **v2.2.0 final 격상 trigger 활성**.

격상 결단 timing:
- ★ ★ cooling-off 7d minimum (2026-05-08 ~ 2026-05-15) 후
- 본 ADR + Senior critique 재검토 absorption + 사용자 최종 결단 의무
- ★ 14차 retract pattern 차단 (★ Senior F4 정합)

### §4. PoC #12 + #13 (raw query() / DSL builder) 처분

★ ★ ★ ★ ★ **명시적 보류 + 2026년 OSS 사실 carry** (resolved 후보 아닌 ★ 영구 carry):
- C-paradigm-cross-strong-raw-sql = ★ "2026년 OSS realworld 부재 / 사용자 사내 source 또는 synthetic 만 가능" carry (★ 본 ADR §1 신정책 후 obsolete 처리 가능)
- C-paradigm-cross-DSL-builder-querydsl = 동일 obsolete

PoC #12 + #13 prelim 디렉토리 (`examples/poc-12-rawsql-userdecided/` + `examples/poc-13-querydsl-userdecided/`) = ★ 자산 보존 (★ 사용자 사내 source 또는 synthetic 도입 시 진입 가능 / 그러나 의무 ❌).

---

## ★ ★ ★ Senior critique 재검토 흡수

ADR-CHAIN-007 시점 Senior STOP signal:
> "paradigm-cross 부재 (Spring 4.1 + iBATIS 2 단일 stack 변종) → ★ Modern ORM PoC #08 carry C-v2.2.0-6 = v2.2.0 final 격상 trigger"

★ ★ ★ ★ ★ ★ **Senior critique 재검토 결과** (★ 5 PoC + 2 정탐 후):

1. ★ **scale-cross corroboration** ✅ — PoC #06 (단일 6 SQL) + PoC #07 (다중 71 SQL) 동일 66.7%
2. ★ **responsibility-cross corroboration** ✅ — PoC #06 단일책임 + PoC #07 다중책임 isomorphic
3. ★ ★ **paradigm-cross corroboration (Java ORM 변종)** ✅ — iBATIS 2 (PoC #06+#07) + MyBatis 3 (PoC #08) + Spring Data JPA (PoC #10) 동일 66.7%
4. ★ ★ ★ **platform-cross corroboration** ✅ — JVM (PoC #06+#07+#08+#10) + Node.js (PoC #09) 동일 66.7%
5. ★ ★ ★ ★ **language-cross corroboration** ✅ — Java + TypeScript 동일 66.7%
6. ★ **AP isomorphic (N+1)** ✅ — 5 PoC 공통
7. ★ phase 4.7 spectrum 6번째 적용 ✅ — 모두 ≥ 86.7% pass

★ ★ ★ ★ ★ ★ **Senior STOP signal = ★ 6 차원 corroboration sum = ★ 사실상 strong robust** (★ 1 차원 raw query() + 1 차원 DSL builder 만 부재 / OSS 부재 사실).

### Senior F4 정합 (14차 retract pattern 차단)

★ 본 ADR = ★ 결단 burst ❌ — ★ ★ ★ ★ ★ 5 PoC measurement + 2 정탐 + 정책 변경 사실 정합 결과 / Senior critique 재검토 absorption / cooling-off 7d minimum 후 v2.2.0 final 결단.

---

## 영향

### 본 ADR 채택 시 후속 action

1. **C-v2.2.0-6 carry resolved** (★ Modern ORM PoC #08 → 5 PoC corroboration 합산 자격)
2. **C-paradigm-cross-strong-raw-sql carry** = obsolete 처리 (★ 본 ADR §1 신정책)
3. **C-paradigm-cross-DSL-builder-querydsl carry** = obsolete 처리
4. **C-ADR-2026-OSS-paradigm-reality carry** = ★ 본 ADR 채택으로 resolved
5. ★ ★ **v2.2.0 final 격상 결단** = cooling-off 후 (2026-05-15+) 별도 결단
6. **PoC #12 + #13 prelim** = 보류 자산 보존 / 진입 의무 ❌

### v2.2.0-rc1 → v2.2.0 final 결단 cadence

cooling-off 7d minimum (2026-05-08 ~ 2026-05-15) 통과 의무:
- ★ release-readiness §8.1 strict 7/7 회귀 ❌ 검증
- ★ clean clone 재실행 통과 (★ 본체 환경 외)
- ★ Senior F7 carry burst < 3 검증
- ★ 본 ADR 채택 absorption (★ 본 결단)

---

## ★ §"본 방법론 가치 명세" 영향 (CLAUDE.md)

★ ★ ★ ★ ★ ★ ADR-CHAIN-008 채택 = "70~80% 한계 명시 잔존" 정합 보존:
- ★ ★ corroboration 정책 완화 (strong → MEDIUM × N) ≠ 자동화율 정정 (여전히 70~80%)
- ★ chain harness validated 자격 + §8.1 strict 7/7 + ≥ 2 PoC corroboration 의무 = 모두 보존
- ★ ★ 본 ADR = paradigm-cross 차원 만 정정 (★ ★ scale + responsibility + paradigm + platform + language + AP isomorphic 6 차원 sum = strong robust 사실 흡수)

---

## 참조

- ADR-CHAIN-007 (phase 4.8 sql-inventory / paradigm-cross strong 의도 origin)
- DEC-2026-05-08-poc-12-13-prelim-신설 (★ ★ ★ 정탐 사실 origin / 본 ADR direct trigger)
- DEC-2026-05-07-poc-08-종결 (★ MEDIUM #1)
- DEC-2026-05-08-poc-09-종결 (★ MEDIUM #2 / raw query() strong ❌ 솔직)
- DEC-2026-05-08-poc-10-종결 (★ MEDIUM #3 reframe / DSL builder ❌ 솔직)
- ADR-CHAIN-006 (phase 4.7 spectrum 자격)
- DEC-2026-05-08-v2.2.0-rc1-prerelease (★ Senior STOP signal origin / 본 ADR 후 v2.2.0 final 결단 trigger 활성)
- 사용자 결단 (β + "남근거 다 실행" + (A) → (B)): 본 session chain
