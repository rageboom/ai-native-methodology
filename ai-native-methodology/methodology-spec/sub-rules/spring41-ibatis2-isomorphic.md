# Sub-Rule: Spring 4.1 + iBATIS 2 Spectrum AP Isomorphic 5종

> ★ ★ ★ v2.3.0 Phase 2 신설 (v1.0) → ★ ★ ★ ★ v1.1 갱신 (2026-05-12 / DEC-2026-05-12-sub-rule-v1.1-갱신) — PoC #11 (billing / 작은 단일책임) corroboration #3 추가 + KL-SATD 인용 정정 + §X automation ceiling R1' 신설.
> **trigger**: Spring 4.x + iBATIS 2.x stack 분석 시 본 5종 우선 후보 AP.
> **자격 (v1.1)**: ≥ 3 사내 PoC isomorphic (PoC #06 단일책임 + PoC #07 다중책임 + ★ PoC #11 작은 단일책임 spectrum) — ★ scale-cross 3 spectrum 충족 (v1.0 ≥ 2 PoC → v1.1 ≥ 3 사내 PoC 강화).
> **schema 참조**: `schemas/antipatterns.schema.json` AP-* 정합.
> **ADR**: ADR-CHAIN-010 (Spring 4.1 + iBATIS 2 spectrum sub-rule 정식 자산화 / v1.0 origin).
> **version**: v1.1 (sub-rule 본문 보강 / ADR-CHAIN-010 자체 변경 ❌ / schema 변경 ❌).

---

## 1. 컨텍스트

본 sub-rule = Spring 4.1 + iBATIS 2.x stack 의 Legacy 적대성 4중 환경에서 발견되는 공통 AP 5종 자산화. PoC #06 + PoC #07 양 측정 공통 사실 (≥ 2 PoC isomorphic / 단일책임 + 다중책임 spectrum 모두 입증).

**적용 trigger**:
- Spring 3.x/4.x + iBATIS 2.3.x 결합 stack
- Java 5~8 (Stream API 도입 전 / Map<String,Object> 관행)
- iBATIS 2 sqlmap XML 단독 사용 (MyBatis 3 ❌)
- 전자정부표준프레임워크 또는 동등 SI 환경 (egovMap 등 결합 시 강 신호)

**적용 제외**:
- Spring 5.x+ + MyBatis 3 (paradigm 변화 / PoC #08+#09+#10 spectrum 분리)
- Modern JPA / TypeORM / Prisma (ADR-CHAIN-008 §1 별도 spectrum)

---

## 2. ★ AP isomorphic 5종 명세

### AP-LEGACY-IBATIS2-001: Map<String,Object> + 강제 캐스팅 / Type Safety 부재

| 항목 | 내용 |
|---|---|
| severity | `high` |
| signal | iBATIS 2 sqlmap `resultClass="java.util.HashMap"` 또는 egovMap (Map<String,Object> 동등) + Controller/Service 에 `(String) map.get("KEY")` 패턴 |
| risk | 컴파일 타임 type 검증 ❌ / 키 오타 ✗ / 새 시스템 마이그레이션 시 DTO 추출 비용 ↑ |
| 회피 | `resultType` 명시 DTO 클래스 + `@MapperScan` (MyBatis 3) 또는 JPA Repository |
| PoC 정합 | AP-EXCHANGE-001 (Map<String,Object> 강제 캐스팅) + AP-CAPITAL-002 (동일 / 다중책임 강화) |
| cross-link | rules.json BR-* → DTO 추출 후보 / antipatterns.json AP-*-001 |

### AP-LEGACY-IBATIS2-002: Anemic Service (단순 DAO 위임 / 비즈니스 로직 부재)

| 항목 | 내용 |
|---|---|
| severity | `medium~high` |
| signal | Service 클래스 메서드 본문 = `return dao.method(params);` 단일 라인. 비즈니스 검증/조합/계산 ❌. 도메인 객체 method ❌ (DAO + DTO 만). |
| risk | 도메인 응집도 부재 / Controller ↔ DAO 직접 의존 외형 강 / DDD 마이그레이션 시 복원 비용 ↑ |
| 회피 | 도메인 객체 method 도입 (Aggregate / Entity) + Application Service 패턴 분리 |
| PoC 정합 | AP-EXCHANGE-002 (Anemic Service) + AP-CAPITAL-003 (Anemic Service / 다중책임 spectrum 강화) |
| cross-link | domain.json bounded_contexts → Aggregate 후보 |

### AP-LEGACY-IBATIS2-003: WITH(NOLOCK) 무차별 사용 (Dirty Read 위험)

| 항목 | 내용 |
|---|---|
| severity | `high` |
| signal | iBATIS sqlmap XML 의 `FROM TB_XXX (NOLOCK)` / `JOIN TB_YYY (NOLOCK)` 패턴이 대부분 SELECT 에 무차별 적용. MSSQL stack 한정 신호 강. |
| risk | Dirty Read 발생 가능 (트랜잭션 격리 위반) / 정합성 검증 도메인 (회계 / 환율) 에서 위험 critical. 동시성 결단 부재 외형 강. |
| 회피 | `READ COMMITTED SNAPSHOT` (MSSQL) 또는 명시적 isolation level / NOLOCK = 정합 비핵심 query 한정 |
| PoC 정합 | AP-EXCHANGE-004 (WITH(NOLOCK) 무차별) + AP-CAPITAL-004 (동일 / 다중책임 spectrum) |
| cross-link | sql-inventory.json `dependent_tables` + `migration_priority` P0~P1 후보 |

### AP-LEGACY-IBATIS2-004: 공유 SQL 조각 부재 (`<sql id>` + `<include refid>` 미사용)

| 항목 | 내용 |
|---|---|
| severity | `medium` |
| signal | iBATIS 2 sqlmap XML 의 `<sql id="...">` + `<include refid="...">` 패턴 0 count. 동일 SELECT/INSERT 조각 (WHERE 절 / 컬럼 list) 이 N statement 에 인라인 중복. |
| risk | DRY 위반 / 컬럼 추가/제거 시 다중 statement 동기화 부담 ↑ / 모듈성 ↓ |
| 회피 | `<sql id>` 공유 조각 추출 + `<include refid>` 재사용 / MyBatis 3 migration 시 `<sql>` element 표준 |
| PoC 정합 | AP-EXCHANGE-011 (★ ★ ★ Day 1.6 신규 등재 / corroboration #1) + AP-CAPITAL-012 (★ ★ ★ corroboration #2 / scale 무관 isomorphic) |
| cross-link | sql-inventory.json `patterns_extension_v2.pattern_4_shared_sql_fragments` (count=0 자체가 finding) |

### AP-LEGACY-IBATIS2-005: 자조 SATD (Self-Admitted Technical Debt)

| 항목 | 내용 |
|---|---|
| severity | `low~high` (SATD 종류별) |
| signal | 코드/SQL 주석 의 자조 표현 = `★ ★`, `// TODO Auto-generated`, `// XXX`, `폐해`, `짜증나`, `임시처리`, `슈퍼크리에이티브` 등 self_recognized 키워드. ★ ★ **Keyword-Labeled SATD (KL-SATD)** per Software Quality Journal 2024 (Vol 32 / pp.391–429 / DOI: 10.1007/s11219-023-09655-z) — "consciously admitted debt marked with keywords like TODO, FIXME, HACK". 5 SATD type 분류 (design / requirement / defect / test / documentation) per Maldonado & Shihab 2015 (IEEE 7th International Workshop on Managing Technical Debt). ★ **v1.0 인용 정정** (v1.1 / 2026-05-12): "Korean Language" → "Keyword-Labeled" (★ Agent 1 F-015 cross-validation 결과 / DOI 10.1007/s11219-023-09655-z 검증). |
| risk | 기술부채 자체 인지된 상태에서 처리 부재 → 누적 → 시스템 enthropy ↑. SATD 발견 자체가 "이미 알지만 못 고친다" 신호 강. ★ ★ SATD 잠복 기간 median 204~492일 (arxiv 2601.06266) — 신규 개발 시점 측정 시 SATD 검출 ↓ 가능성. |
| 회피 | SATD 발견 시 antipatterns.json 등재 + migration_priority P0~P2 분류 + tracking issue 생성 |
| PoC 정합 | AP-EXCHANGE-007 (SQL 자조 코멘트 "환율관리 페이지만 생각하고 설계한 폐해라 할 수 있다 ㅋ") + AP-CAPITAL-008 (// TODO Auto-generated method stub) + AP-CAPITAL-009 (★ "슈퍼크리에이티브 메일수신 유저 임시처리 4회 중복"). ★ ★ PoC #11 = ★ SATD 0건 (★ 단, single-case + 작은 모듈 + 신규 개발 잠복 기간 미경과 가능성 / "Modern stack pattern" 단순 결론 ❌ — Day 3.5 종결 시 해석 정정 carry C-poc-11-0-satd-해석-정정). |
| cross-link | characterization-spec.json `self_recognized` 분류 / sql-inventory.json `intent_vs_bug_classification` self_recognized 키워드 |

---

## 3. ★ ★ ★ ≥ 3 사내 PoC isomorphic 자격 사실 (★ v1.1 강화 / scale-cross 3 spectrum)

| AP isomorphic 5종 | PoC #06 단일책임 (345 LOC) | PoC #11 작은 단일책임 (257 LOC) | PoC #07 다중책임 (3752 LOC) | scale-cross spectrum |
|---|---|---|---|---|
| Map<String,Object> 강제 캐스팅 | AP-EXCHANGE-001 (high) | **AP-BILLING-002 (high)** | AP-CAPITAL-002 (high) | ★ ★ ★ 3 사내 PoC 모두 corroboration |
| Anemic Service | AP-EXCHANGE-002 (medium) | ★ N/A (PoC #11 BillingServiceImpl = thin / 단, saveDataConfirm = transaction logic 보유 / 형식상 다름) | AP-CAPITAL-003 (high) | ★ 2 PoC corroboration (작은 단일책임 spectrum 형식상 다름) |
| WITH(NOLOCK) 무차별 | AP-EXCHANGE-004 (high) | **AP-BILLING-005 (★ critical / 4 차원 강화)** | AP-CAPITAL-004 (high) | ★ ★ ★ 3 사내 PoC + PoC #11 ★ 강화 (SCOPE_IDENTITY + getDate + FN_GET_MONTH UDF 추가 / SQL Server vendor 종속 4 차원) |
| 공유 SQL 조각 부재 | AP-EXCHANGE-011 (medium / Day 1.6 신규) | ★ N/A (★ billing 6 SQL 만 / 단, 4 SQL WHERE 절 동일 = DRY violation / patterns_extension_v2 등재) | AP-CAPITAL-012 (medium) | ★ 2 PoC corroboration (작은 scope 등급 차이 / DRY 의 다른 표현형) |
| 자조 SATD | AP-EXCHANGE-007 (low) | ★ N/A (PoC #11 SATD 0건 / ★ single-case + 작은 모듈 + 신규 개발 잠복 기간 미경과 가능성 / "Modern pattern" 결론 ❌ — carry C-poc-11-0-satd-해석-정정) | AP-CAPITAL-008+009 (high) | ★ 2 PoC corroboration (KL-SATD 패턴 / 다중책임에서 다중 발현) |

→ ★ ★ ★ ★ **scale-cross 3 spectrum** (작은 단일 + 단일책임 + 다중책임) **isomorphic 입증 / Spring 4.1 + iBATIS 2 sub-rule 자격 ★ 강 사실 확보**:
- ★ 5 AP 중 2종 (Map + WITH NOLOCK) = ★ ★ ★ 3 사내 PoC 모두 corroboration
- 3종 (Anemic + 공유 SQL 부재 + SATD) = ★ 2 PoC corroboration (PoC #11 작은 scope 효과로 형식상 다름)
- ★ ★ ★ **R1' 가설 정합** (작은 scope = trivially deterministic 효과 → AP 발현 형식 다름 / §X 참조)

---

## 4. ★ ★ 신뢰도 (★ v1.1 강 / scale-cross 3 spectrum)

| 단계 | 조건 | 신뢰도 |
|---|---|---|
| 1 | 단일 PoC measurement 만 | 50~65% |
| 3 | ≥ 2 PoC isomorphic 입증 + spectrum 단일 (단일책임 only / 다중책임 only) | 75~85% |
| 5 | ≥ 2 PoC isomorphic + ≥ 2 spectrum (단일 + 다중책임) + 5 AP 모두 corroboration | 85~95% |
| **5 강 (★ v1.1 신설)** | ≥ 3 사내 PoC isomorphic + ≥ 3 spectrum (작은 단일 + 단일 + 다중책임) + 핵심 AP (Map + WITH NOLOCK) 3 PoC 모두 corroboration | **90~95% (★ ★ R1' original empirical finding 보강)** |

본 sub-rule (v1.1) = **단계 5 강** (PoC #06 단일 + PoC #11 작은 단일 + PoC #07 다중책임 모두 corroboration / 핵심 AP 2종 3 PoC 모두 corroboration / 나머지 3종 2 PoC corroboration + R1' scope 효과 정합 형식 다름).

---

## 5. ★ 적용 절차 (phase 6 antipatterns 자동 추출 통합)

```
1. stack signal 검출 (Spring 4.x + iBATIS 2.x 자동 식별)
2. 본 sub-rule 5 AP 우선 후보 자동 적재 (LLM grep + regex)
3. 사용자/도메인 expert 검증 → 본 sub-rule 5 AP 확정 / 추가 AP 후속 finding
4. antipatterns.json 본 sub-rule 5 AP-LEGACY-IBATIS2-001~005 의무 명시
5. migration_priority P0~P3 분류 (ADR-CHAIN-009 정합) 자동 추론 carry
```

**no-simulation 정합**: 본 sub-rule 의 자동 후보 적재는 grep + regex 기반 / AI 추론 ❌. severity 등급 결단은 도메인 expert / 사용자 결단 carry.

---

## 6. ★ 확장 carry (★ v1.1 갱신)

| 항목 | trigger | 상태 |
|---|---|---|
| Modern stack sub-rule (Spring 5+ / MyBatis 3 / JPA / TypeORM) | ≥ 2 Modern PoC isomorphic (PoC #08+#09+#10 분석 후) | ⏳ open (5 PoC SQL Inventory 66.7% × 5 robust 사실 / sub-rule 본격 자산화 carry) |
| 다중책임 spectrum 강화 (AP-CAPITAL-005~011 단일 PoC) | ≥ 2 다중책임 PoC isomorphic 후 | ⏳ open (★ PoC #11 = ★ 작은 단일책임 / NOT 다중 → carry 자격 ❌ / 다음 다중책임 PoC = EFI-WEB connect / contract / bod 후보) |
| ~~iBATIS 2 전용 dynamic 태그 sub-classification~~ | ~~v2.2.x patch / 사용자 finding~~ | ✅ **resolved 2026-05-12** (v2.3.1 PATCH commit `bc48477` / `dynamic_branch.tag_type` enum 26종) |
| **★ ★ R1' automation ceiling 외부 권위 정량 비교 (★ v1.1 신규)** | Spring 4.1+iBATIS 2 specific academic 권위 출현 시 (★ 현재 ❌ / paradigm class 추상화 인용만 가능) | ⏳ open (★ Zhang ICSE 2025 + LongCodeBench 외부 권위 = paradigm 방향성 + scope 효과 정합 / 정량 ceiling 53~55% = original empirical finding 유지) |
| **★ ★ PoC #11 0 SATD 해석 정정 (★ v1.1 신규 carry)** | PoC #11 Day 3.5 종결 시 | ⏳ open (★ "Modern OSS reference 정합" 단순 결론 ❌ / single-case + 작은 모듈 + 잠복 기간 미경과 해석 명시 / `examples/poc-11-efiweb-billing-spring41/input/` + `sql-inventory.json` 갱신) |

---

## X. ★ ★ ★ ★ analysis 단계 §3-A automation ceiling (R1' 새 가설 / ★ v1.1 신규)

### X-A. 3 사내 PoC 측정 사실

| PoC | scale (Java LOC) | 책임 | §3-A 자동화율 (★ 실측) | spectrum |
|---|---|---|---|---|
| **PoC #06 exchange** | 345 | 단일 | **38.75%** | baseline |
| **★ PoC #11 billing** | **257** | **작은 단일** | **★ 52.5%** | ★ scale-cross floor (corroboration #3 사내 PoC) |
| **PoC #07 capital** | 3752 | 다중 | **53.8%** | scale-cross ceiling 다중 |

→ ★ ★ ★ **Spring 4.1 + iBATIS 2 paradigm = analysis 단계 §3-A automation ceiling ~53~55%** (★ 3 사내 PoC isomorphic / ★ scale 단순 무관).

### X-B. R1 가설 ★ ★ 반증 + R1' (revised) 정립

**R1 (반증)**: scale ↓ → §3-A 자동화율 ↓.
→ ★ ★ 반증 사실: PoC #11 (257 LOC) > PoC #06 (345 LOC) **+13.75%p** / scale 작아도 자동화율 ★ 높음.

**R1' (revised)**: §3-A 자동화율 = (paradigm × 책임 × trivially deterministic 효과) 복합 함수 → paradigm 별 ceiling 형성.

| 인자 | 영향도 | 근거 |
|---|---|---|
| paradigm (Spring 4.1+iBATIS 2 vs Modern) | ★ ★ ★ 강 | Legacy ceiling ~53~55% vs Modern ceiling ~63~67% (5 PoC 사실) |
| 책임 (단일 vs 다중) | ★ ★ 중 | PoC #06 (단일 38.75%) < PoC #07 (다중 53.8%) +15%p |
| trivially deterministic 효과 (작은 scope) | ★ ★ 중 | PoC #11 (작은 단일 52.5%) > PoC #06 (단일 38.75%) +13.75%p |
| scale (LOC) 단독 | ★ 약 | PoC #11 < PoC #06 (작음) BUT 자동화율 ↑ → scale 단독 영향 약 |

### X-C. ★ ★ ★ 외부 권위 보강 (★ v1.1 신규 / 4원칙 2원칙 research / F-015 cross-validation)

**R1' 방향성 (legacy paradigm < modern paradigm automation)** = ★ ★ ★ STRONG 외부 권위 정합:

1. ★ ★ ★ **Zhang et al. ICSE 2025** "How and Why LLMs Use Deprecated APIs in Code Completion? An Empirical Study" (arxiv 2406.09834v3)
   - DUR (Deprecated Usage Rate): legacy/outdated 컨텍스트 = **70~90%** vs up-to-date 컨텍스트 = **9~18%** (★ ★ ★ ~60~70%p gap)
   - "LLMs lack explicit mechanisms to distinguish between obsolete and current APIs"
   - ★ ★ ★ **iBATIS 2 = 2009 EOL** 정확 적용 — 본 사내 §3-A LLM 의 AP 식별 + mapper XML 의미 해석 시 동일 메커니즘 작동

2. ★ ★ **Gartner Application Innovation Summit 2025**
   - "Bolting GenAI on top of an old existing stack doesn't magically make an application intelligent"
   - "AI 단독 = nondeterministic, lower accuracy outcomes"
   - by 2027 60% legacy 격상 = GenAI 주도 (★ modernization 후행)

**R1' "작은 scope → 자동화율 ↑" (trivially deterministic)** = ★ ★ ★ STRONG 외부 권위 정합:

3. ★ ★ ★ **LongCodeBench** (arxiv 2505.07897v3 / 2026) "Evaluating Coding LLMs at 1M Context Windows"
   - Claude 3.5 Sonnet LongSWE-Bench 정확도: **32K context = 29% → 256K context = 3%** (★ ★ ★ 급락)
   - Qwen2.5 = 70.2% → 40%
   - "LLMs display much lower accuracy on code benchmarks than text benchmarks"

4. ★ **Context Length Alone Hurts** (arxiv 2510.05381v1)
   - retrieval 완벽해도 input 길이만으로 성능 **13.9~85% 저하**

5. ★ **"Not All Code Is Equal"** (arxiv 2601.21894)
   - absolute structural complexity 가 LLM 추론에 dominant / code length + 복잡도 결합 효과

### X-D. ★ ★ original empirical finding 명시 (외부 권위 부재 영역)

- ★ ★ ★ R1' **정량 ceiling (Spring 4.1+iBATIS 2 ~53~55% / Modern ~63~67%)** = ★ ★ 외부 권위 부재 / **original empirical finding**
  - 본 사내 5 PoC isomorphic 6 차원 corroboration (paradigm + ORM + platform + language + responsibility + scale) = ADR-CHAIN-008 "MEDIUM × ≥ 5 PoC = strong" 정책 정합
  - Spring 4.1 + iBATIS 2 specific academic ❌ — **legacy ORM-less SQL mapper paradigm class** 추상화 후 인용 가능
- ★ R1' **counterexample (PoC #07 다중책임 5509 LOC > PoC #06 단일 345 LOC / 큰 scope 자동화율 ↑)** = ★ 외부 권위 부재 / original finding
  - 본 사내 가설: "다중책임 분기 양 ↑ → 자동 grep 누적 효과 ↑" (★ 5 PoC × 단일 paradigm 표본 한정)

### X-E. paradigm modernization 시 ceiling 돌파 (★ 5 PoC SQL Inventory robust 정합)

| PoC | paradigm | §3-A 자동화율 | 출처 |
|---|---|---|---|
| PoC #06 + #11 + #07 (Spring 4.1 + iBATIS 2) | Legacy | **38.75% ~ 53.8%** (ceiling ~53~55%) | 본 sub-rule §X-A |
| PoC #08 jpetstore-6 | MyBatis 3 Modern (Spring 6) | **66.7%** | DEC-2026-05-07-poc-08-종결 |
| PoC #09 lujakob | NestJS + TypeORM Modern | **63.6%** | DEC-2026-05-08-poc-09-종결 |
| PoC #10 raeperd | Spring Data JPA Modern | **60%** | DEC-2026-05-08-poc-10-종결 |

→ ★ ★ ★ Legacy ceiling **~53~55%** vs Modern ceiling **~60~67%** (★ ~10%p gap / 5 PoC 사실 robust).

### X-F. ★ ★ 실용 함의

1. ★ Spring 4.1+iBATIS 2 stack analysis = §3-A 자동화율 ★ 35~55% expectation (★ scale 무관 / responsibility 무관 / paradigm 종속)
2. ★ ★ migration target stack 결정 시 = Modern stack 이전 = §3-A 자동화율 ★ +10%p expectation
3. ★ ★ ★ 70~80% 한계 (★ chain harness 전체 자동화 axis / CLAUDE.md L18 / project_methodology_scope memory "70~80% 한계 명시 잔존") 와 ★ **별도 axis** (★ 본 §X = analysis 단계 §3-A automation / 별도 metric)
4. ★ ADR-CHAIN-008 "MEDIUM × ≥ 5 PoC = strong" 정책 = ★ 본 R1' 가설에도 정합 적용 가능 (5 PoC isomorphic 6 차원 corroboration 보강)

### X-G. ★ R1' carry (★ Day 3.5 PoC #11 종결 시 결단)

- ★ ★ ★ **C-r1-hypothesis-revisit** (★ critical / DEC-2026-05-12-r1-가설-revisit origin) = ★ 본 sub-rule §X 등재로 **resolved**
- ★ **C-automation-ceiling-paradigm** = ★ 본 §X 등재로 **resolved**
- **C-poc-11-0-satd-해석-정정** (★ §6 carry 잔존 / Day 3.5 PoC #11 종결 시 일괄 처리)

---

## 7. 참조 (★ v1.1 갱신)

### v1.0 origin

- ADR-CHAIN-010 (★ 본 sub-rule 정식 자산화 결정 / v1.0 origin)
- DEC-2026-05-12-v2.3.0-final (★ Phase 2 종결)
- PoC #06 antipatterns.json (AP-EXCHANGE-001/002/004/007/011)
- PoC #07 antipatterns.json (AP-CAPITAL-002/003/004/008/009/012)
- `schemas/antipatterns.schema.json` (AP-* schema 정합)
- `methodology-spec/deliverables/24-sql-inventory.md` (sql-inventory cross-link)
- Michael Feathers, Working Effectively with Legacy Code (2004 / "production = its own specification")

### ★ v1.1 신규 (2026-05-12)

- ★ ★ ★ **DEC-2026-05-12-r1-가설-revisit** (★ critical / R1 ★ 반증 + R1' 새 가설 origin)
- ★ ★ **DEC-2026-05-12-sub-rule-v1.1-갱신** (본 v1.1 갱신 origin)
- DEC-2026-05-12-in-place-read-정책-채택 (★ source 정책 변경 / PoC #11 첫 적용)
- PoC #11 antipatterns.json (AP-BILLING-002/005 / ★ 3 사내 PoC isomorphic 자격 사실)
- PoC #11 inventory.json (★ `phase_3a_automation_measurement` / §3-A 자동화율 52.5% 측정)
- PoC #11 sql-inventory.json (★ ★ ★ corroboration #3 사내 PoC / 66.7% × 3 robust)
- ★ ★ ★ **Zhang et al. ICSE 2025** "How and Why LLMs Use Deprecated APIs" (arxiv 2406.09834v3) — R1' paradigm 방향 외부 권위 STRONG
- ★ ★ ★ **LongCodeBench** (arxiv 2505.07897v3) — R1' scope 효과 외부 권위 STRONG
- ★ **Context Length Alone Hurts** (arxiv 2510.05381v1) — input 길이 단독 변수
- ★ **Software Quality Journal 2024** (DOI 10.1007/s11219-023-09655-z) — Keyword-Labeled SATD (KL-SATD) 정확 정의 출처 (★ §AP-005 인용 정정)
- Maldonado & Shihab 2015 "Detecting and quantifying different types of self-admitted technical debt" (IEEE 7th MTD workshop / 5 SATD type) — ★ §AP-005 인용 정정 후 정확 표현
- ★ Gartner Application Innovation Summit 2025 (Moderne.ai recap) — paradigm modernization 후행 권위
- DEC-2026-05-08-poc-{08,09,10}-종결 (★ Modern paradigm ceiling 돌파 evidence)
- F-015 cross-validation 패턴 (memory `feedback_sub_agent_validation.md`)
- 가벼운 sub-agent 전략 (memory `feedback_lightweight_sub_agent.md`)
