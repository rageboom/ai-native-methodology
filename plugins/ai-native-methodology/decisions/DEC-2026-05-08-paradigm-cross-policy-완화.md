# DEC-2026-05-08-paradigm-cross-policy-완화

> **카테고리**: methodology / 정책 정정 / paradigm-cross corroboration 정책 완화 / Senior critique 재검토 흡수 / Auto Mode (B) 결단 정합
> **상태**: ✅ 승인 ( Auto Mode 사용자 결단 (B) "정책 완화" 정합 / ADR-CHAIN-008 신설 / 5 PoC + 2 정탐 사실 기반)
> **일자**: 2026-05-08 ( Auto Mode β + "남근거 다 실행" + (A) → (B) chain / 본 session)
> **선행**: ADR-CHAIN-007 (paradigm-cross strong 의도 origin) + DEC-2026-05-08-poc-12-13-prelim-신설 ( 정탐 사실 origin) + DEC PoC #08/#09/#10 종결 (5 PoC measurement)
> **후속**: v2.2.0 final 격상 결단 ( cooling-off 후 2026-05-15+ 별도)

---

## 1. 결단

      **paradigm-cross corroboration 정책 완화** —   ADR-CHAIN-008 신설 ( "MEDIUM × ≥ 5 PoC isomorphic = strong corroboration 자격 충족" 신정책).

     Auto Mode 사용자 결단 chain:

- (β) "우선순위 2, 3, 4, 후속 연달아 다 진행"
- "남근거 다 실행"
- (A) "추가 PoC" → 2 정탐 결과 자체가 (B) 회귀 추천 사실
- **(B) "정책 완화"** ← 본 결단

## 2. 근거 ( 5 PoC measurement + 2 정탐 사실)

### 5 PoC SQL Inventory isomorphic robust

| PoC | stack                         | ratio |
| --- | ----------------------------- | ----- |
| #06 | iBATIS 2 / Java / 단일        | 66.7% |
| #07 | iBATIS 2 / Java / 다중        | 66.7% |
| #08 | MyBatis 3 / Java / Modern     | 66.7% |
| #09 | TypeORM / TypeScript / Modern | 66.7% |
| #10 | Spring Data JPA / Java / DDD  | 66.7% |

     paradigm + ORM + platform + language + responsibility + scale 6 차원 robust isomorphic =  사실상 strong corroboration 자체.

### 2 정탐 사실 ( 2026년 OSS 현실)

- raw `query()` realworld OSS = 부재 사실 (Node.js / Java / Python / Go / Rust 모두 sample)
- DSL builder QueryDSL realworld OSS = 부재 사실 (library / sample / fragment 만)
- ORM 추상화 = 2026년 표준

  → 본 방법론의 paradigm-cross strong corroboration 의무 = 2026년 OSS 현실과 gap 사실.

## 3. ADR-CHAIN-008 채택 영향

      **resolved carry**:

- ✅ C-v2.2.0-6 ( Modern ORM PoC #08 → 5 PoC corroboration 합산 자격)
- ✅ C-paradigm-cross-strong-raw-sql ( obsolete 처리 / 본 ADR §1 신정책)
- ✅ C-paradigm-cross-DSL-builder-querydsl ( obsolete 처리)
- ✅ C-ADR-2026-OSS-paradigm-reality ( 본 ADR 채택)

  **자산 보존**:

- PoC #12 prelim (`examples/poc-12-rawsql-userdecided/`) — 사용자 사내 source 또는 synthetic 도입 시 진입 가능 / 의무 ❌
- PoC #13 prelim (`examples/poc-13-querydsl-userdecided/`) — 동일

  **trigger 활성**:

- v2.2.0 final 격상 trigger 활성 = cooling-off 후 (2026-05-15+) 별도 결단 의무

## 4. Senior critique 재검토 흡수

      Senior STOP signal (ADR-CHAIN-007 시점) →  5 PoC + 2 정탐 후 재검토:

1. scale-cross ✅
2. responsibility-cross ✅
3. paradigm-cross (Java ORM 변종) ✅ (iBATIS 2 + MyBatis 3 + Spring Data JPA)
4. platform-cross ✅ (JVM + Node.js)
5. language-cross ✅ (Java + TypeScript)
6. AP isomorphic (N+1) ✅ (5 PoC 공통)
7. phase 4.7 spectrum 6번째 ✅

   **6 차원 corroboration sum = 사실상 strong robust** ( 1 차원 raw query() + 1 차원 DSL builder 만 부재 / OSS 부재 사실).

Senior F4 정합 (14차 retract pattern 차단) — 본 결단 = 5 PoC measurement + 2 정탐 + 정탐 사실 정합 / 결단 burst ❌.

## 5. "본 방법론 가치 명세" 영향

CLAUDE.md §"본 방법론 가치 명세" 보존:

- 70~80% 한계 명시 잔존 = 자동화율 정정 ❌ ( 본 결단은 corroboration 정책만)
- chain harness validated + §8.1 strict + ≥ 2 PoC corroboration 의무 = 보존
-     paradigm-cross 차원 만 정정 ( 6 차원 sum = strong robust 사실 흡수)

## 6. no release / no tag ( 본 결단 자체는 release ❌)

ADR + DEC 신설 = 정책 정정 만 / cooling-off 후 (2026-05-15+) v2.2.0 final 격상 결단 시 release 시점.

## 7. 다음 단계

- cooling-off 7d minimum (2026-05-08 ~ 2026-05-15) 통과 의무:
- release-readiness §8.1 strict 7/7 회귀 ❌
- clean clone 재실행 통과
- Senior F7 carry burst < 3
- 본 ADR-CHAIN-008 absorption
- v2.2.0 final 격상 결단 = cooling-off 후 별도 ( TF Lead 책임)
- PoC #11 (EFI-WEB billing) = 사용자 결단 α #1 source 위임 도착 시 복귀

## 8. 참조

- ADR-CHAIN-008 ( 본 정책 정정 ADR / 본 결단의 기술적 결정)
- ADR-CHAIN-007 ( paradigm-cross strong 의도 origin / 본 ADR-CHAIN-008 §2 갱신)
- DEC-2026-05-08-poc-12-13-prelim-신설 ( 정탐 사실 origin)
- DEC-2026-05-07-poc-08-종결 + DEC-2026-05-08-poc-09-종결 + DEC-2026-05-08-poc-10-종결 (5 PoC measurement)
- DEC-2026-05-08-v2.2.0-rc1-prerelease ( Senior STOP signal origin)
- 사용자 결단 chain: β + "남근거 다 실행" + (A) → (B): 본 session
