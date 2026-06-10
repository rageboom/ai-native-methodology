# Sub-Rule: Spring 4.1 + iBATIS 2 Spectrum AP Isomorphic 5종

<!-- allow-provenance: corroboration-evidence 문서 — R1' isomorphic 입증(사내 PoC scale-cross + 외부 권위 cross-validation)이 본문의 존재 근거. PoC·DEC·외부 인용이 곧 증거이므로 check40 가드 면제. -->

> **trigger**: Spring 4.x + iBATIS 2.x stack 분석 시 본 5종 우선 후보 AP.
> **자격**: ≥ 3 사내 PoC isomorphic (단일책임 + 다중책임 + 작은 단일책임 spectrum) — scale-cross 충족.
> **schema 참조**: `schemas/antipatterns.schema.json` AP-\* 정합.
> **ADR**: ADR-CHAIN-010 (Spring 4.1 + iBATIS 2 spectrum sub-rule 정식 자산화).

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

## 2. AP isomorphic 5종 명세

### AP-LEGACY-IBATIS2-001: Map<String,Object> + 강제 캐스팅 / Type Safety 부재

| 항목       | 내용                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| severity   | `high`                                                                                                                                          |
| signal     | iBATIS 2 sqlmap `resultClass="java.util.HashMap"` 또는 egovMap (Map<String,Object> 동등) + Controller/Service 에 `(String) map.get("KEY")` 패턴 |
| risk       | 컴파일 타임 type 검증 ❌ / 키 오타 ✗ / 새 시스템 마이그레이션 시 DTO 추출 비용 ↑                                                                |
| 회피       | `resultType` 명시 DTO 클래스 + `@MapperScan` (MyBatis 3) 또는 JPA Repository                                                                    |
| PoC 정합   | AP-EXCHANGE-001 (Map<String,Object> 강제 캐스팅) + AP-CAPITAL-002 (동일 / 다중책임 강화)                                                        |
| cross-link | business-rules.json BR-_ → DTO 추출 후보 / antipatterns.json AP-_-001                                                                           |

### AP-LEGACY-IBATIS2-002: Anemic Service (단순 DAO 위임 / 비즈니스 로직 부재)

| 항목       | 내용                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| severity   | `medium~high`                                                                                                                          |
| signal     | Service 클래스 메서드 본문 = `return dao.method(params);` 단일 라인. 비즈니스 검증/조합/계산 ❌. 도메인 객체 method ❌ (DAO + DTO 만). |
| risk       | 도메인 응집도 부재 / Controller ↔ DAO 직접 의존 외형 강 / DDD 마이그레이션 시 복원 비용 ↑                                              |
| 회피       | 도메인 객체 method 도입 (Aggregate / Entity) + Application Service 패턴 분리                                                           |
| PoC 정합   | AP-EXCHANGE-002 (Anemic Service) + AP-CAPITAL-003 (Anemic Service / 다중책임 spectrum 강화)                                            |
| cross-link | domain.json bounded_contexts → Aggregate 후보                                                                                          |

### AP-LEGACY-IBATIS2-003: WITH(NOLOCK) 무차별 사용 (Dirty Read 위험)

| 항목       | 내용                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| severity   | `high`                                                                                                                              |
| signal     | iBATIS sqlmap XML 의 `FROM TB_XXX (NOLOCK)` / `JOIN TB_YYY (NOLOCK)` 패턴이 대부분 SELECT 에 무차별 적용. MSSQL stack 한정 신호 강. |
| risk       | Dirty Read 발생 가능 (트랜잭션 격리 위반) / 정합성 검증 도메인 (회계 / 환율) 에서 위험 critical. 동시성 결단 부재 외형 강.          |
| 회피       | `READ COMMITTED SNAPSHOT` (MSSQL) 또는 명시적 isolation level / NOLOCK = 정합 비핵심 query 한정                                     |
| PoC 정합   | AP-EXCHANGE-004 (WITH(NOLOCK) 무차별) + AP-CAPITAL-004 (동일 / 다중책임 spectrum)                                                   |
| cross-link | sql-inventory.json `dependent_tables` + `migration_priority` P0~P1 후보                                                             |

### AP-LEGACY-IBATIS2-004: 공유 SQL 조각 부재 (`<sql id>` + `<include refid>` 미사용)

| 항목       | 내용                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| severity   | `medium`                                                                                                                                                      |
| signal     | iBATIS 2 sqlmap XML 의 `<sql id="...">` + `<include refid="...">` 패턴 0 count. 동일 SELECT/INSERT 조각 (WHERE 절 / 컬럼 list) 이 N statement 에 인라인 중복. |
| risk       | DRY 위반 / 컬럼 추가/제거 시 다중 statement 동기화 부담 ↑ / 모듈성 ↓                                                                                          |
| 회피       | `<sql id>` 공유 조각 추출 + `<include refid>` 재사용 / MyBatis 3 migration 시 `<sql>` element 표준                                                            |
| PoC 정합   | AP-EXCHANGE-011 (Day 1.6 신규 등재 / corroboration #1) + AP-CAPITAL-012 (corroboration #2 / scale 무관 isomorphic)                                            |
| cross-link | sql-inventory.json `patterns_extension_v2.pattern_4_shared_sql_fragments` (count=0 자체가 finding)                                                            |

### AP-LEGACY-IBATIS2-005: 자조 SATD (Self-Admitted Technical Debt)

| 항목       | 내용                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| severity   | `low~high` (SATD 종류별)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| signal     | 코드/SQL 주석 의 자조 표현 = ``, `// TODO Auto-generated`, `// XXX`, `폐해`, `짜증나`, `임시처리`, `슈퍼크리에이티브` 등 self_recognized 키워드. **Keyword-Labeled SATD (KL-SATD)** per Software Quality Journal 2024 (Vol 32 / pp.391–429 / DOI: 10.1007/s11219-023-09655-z) — "consciously admitted debt marked with keywords like TODO, FIXME, HACK". 5 SATD type 분류 (design / requirement / defect / test / documentation) per Maldonado & Shihab 2015 (IEEE 7th International Workshop on Managing Technical Debt). **v1.0 인용 정정** (v1.1 / 2026-05-12): "Korean Language" → "Keyword-Labeled" (Agent 1 F-015 cross-validation 결과 / DOI 10.1007/s11219-023-09655-z 검증). |
| risk       | 기술부채 자체 인지된 상태에서 처리 부재 → 누적 → 시스템 enthropy ↑. SATD 발견 자체가 "이미 알지만 못 고친다" 신호 강. SATD 잠복 기간 median 204~492일 (arxiv 2601.06266) — 신규 개발 시점 측정 시 SATD 검출 ↓ 가능성.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 회피       | SATD 발견 시 antipatterns.json 등재 + migration_priority P0~P2 분류 + tracking issue 생성                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PoC 정합   | AP-EXCHANGE-007 (SQL 자조 코멘트 "환율관리 페이지만 생각하고 설계한 폐해라 할 수 있다 ㅋ") + AP-CAPITAL-008 (// TODO Auto-generated method stub) + AP-CAPITAL-009 ("슈퍼크리에이티브 메일수신 유저 임시처리 4회 중복"). PoC #11 = SATD 0건 (단, single-case + 작은 모듈 + 신규 개발 잠복 기간 미경과 가능성 / "Modern stack pattern" 단순 결론 ❌ — Day 3.5 종결 시 해석 정정 carry C-poc-11-0-satd-해석-정정).                                                                                                                                                                                                                                                                       |
| cross-link | characterization-spec.json `self_recognized` 분류 / sql-inventory.json `intent_vs_bug_classification` self_recognized 키워드                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

---

## 3. ≥ 3 사내 PoC isomorphic 자격 사실 (v1.1 강화 / scale-cross 3 spectrum)

| AP isomorphic 5종              | PoC #06 단일책임 (345 LOC)              | PoC #11 작은 단일책임 (257 LOC)                                                                                                                   | PoC #07 다중책임 (3752 LOC) | scale-cross spectrum                                                                                         |
| ------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Map<String,Object> 강제 캐스팅 | AP-EXCHANGE-001 (high)                  | **AP-BILLING-002 (high)**                                                                                                                         | AP-CAPITAL-002 (high)       | 3 사내 PoC 모두 corroboration                                                                                |
| Anemic Service                 | AP-EXCHANGE-002 (medium)                | N/A (PoC #11 BillingServiceImpl = thin / 단, saveDataConfirm = transaction logic 보유 / 형식상 다름)                                              | AP-CAPITAL-003 (high)       | 2 PoC corroboration (작은 단일책임 spectrum 형식상 다름)                                                     |
| WITH(NOLOCK) 무차별            | AP-EXCHANGE-004 (high)                  | **AP-BILLING-005 (critical / 4 차원 강화)**                                                                                                       | AP-CAPITAL-004 (high)       | 3 사내 PoC + PoC #11 강화 (SCOPE_IDENTITY + getDate + FN_GET_MONTH UDF 추가 / SQL Server vendor 종속 4 차원) |
| 공유 SQL 조각 부재             | AP-EXCHANGE-011 (medium / Day 1.6 신규) | N/A (billing 6 SQL 만 / 단, 4 SQL WHERE 절 동일 = DRY violation / patterns_extension_v2 등재)                                                     | AP-CAPITAL-012 (medium)     | 2 PoC corroboration (작은 scope 등급 차이 / DRY 의 다른 표현형)                                              |
| 자조 SATD                      | AP-EXCHANGE-007 (low)                   | N/A (PoC #11 SATD 0건 / single-case + 작은 모듈 + 신규 개발 잠복 기간 미경과 가능성 / "Modern pattern" 결론 ❌ — carry C-poc-11-0-satd-해석-정정) | AP-CAPITAL-008+009 (high)   | 2 PoC corroboration (KL-SATD 패턴 / 다중책임에서 다중 발현)                                                  |

→ **scale-cross 3 spectrum** (작은 단일 + 단일책임 + 다중책임) **isomorphic 입증 / Spring 4.1 + iBATIS 2 sub-rule 자격 강 사실 확보**:

- 5 AP 중 2종 (Map + WITH NOLOCK) = 3 사내 PoC 모두 corroboration
- 3종 (Anemic + 공유 SQL 부재 + SATD) = 2 PoC corroboration (PoC #11 작은 scope 효과로 형식상 다름)
- **R1' 가설 정합** (작은 scope = trivially deterministic 효과 → AP 발현 형식 다름 / §X 참조)

---

## 4. 신뢰도 (v1.1 강 / scale-cross 3 spectrum)

| 단계                 | 조건                                                                                                                        | 신뢰도                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1                    | 단일 PoC measurement 만                                                                                                     | 50~65%                                           |
| 3                    | ≥ 2 PoC isomorphic 입증 + spectrum 단일 (단일책임 only / 다중책임 only)                                                     | 75~85%                                           |
| 5                    | ≥ 2 PoC isomorphic + ≥ 2 spectrum (단일 + 다중책임) + 5 AP 모두 corroboration                                               | 85~95%                                           |
| **5 강 (v1.1 신설)** | ≥ 3 사내 PoC isomorphic + ≥ 3 spectrum (작은 단일 + 단일 + 다중책임) + 핵심 AP (Map + WITH NOLOCK) 3 PoC 모두 corroboration | **90~95% (R1' original empirical finding 보강)** |

본 sub-rule (v1.1) = **단계 5 강** (PoC #06 단일 + PoC #11 작은 단일 + PoC #07 다중책임 모두 corroboration / 핵심 AP 2종 3 PoC 모두 corroboration / 나머지 3종 2 PoC corroboration + R1' scope 효과 정합 형식 다름).

---

## 5. 적용 절차 (phase 6 antipatterns 자동 추출 통합)

```
1. stack signal 검출 (Spring 4.x + iBATIS 2.x 자동 식별)
2. 본 sub-rule 5 AP 우선 후보 자동 적재 (LLM grep + regex)
3. 사용자/도메인 expert 검증 → 본 sub-rule 5 AP 확정 / 추가 AP 후속 finding
4. antipatterns.json 본 sub-rule 5 AP-LEGACY-IBATIS2-001~005 의무 명시
5. migration_priority P0~P3 분류 (ADR-CHAIN-009 정합) 자동 추론 carry
```

**no-simulation 정합**: 본 sub-rule 의 자동 후보 적재는 grep + regex 기반 / AI 추론 ❌. severity 등급 결단은 도메인 expert / 사용자 결단 carry.

---

## 6. 확장 carry (v1.1 갱신)

| 항목                                                          | trigger                                                                                          | 상태                                                                                                                                                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modern stack sub-rule (Spring 5+ / MyBatis 3 / JPA / TypeORM) | ≥ 2 Modern PoC isomorphic (PoC #08+#09+#10 분석 후)                                              | ⏳ open (5 PoC SQL Inventory 66.7% × 5 robust 사실 / sub-rule 본격 자산화 carry)                                                                                                                                            |
| 다중책임 spectrum 강화 (AP-CAPITAL-005~011 단일 PoC)          | ≥ 2 다중책임 PoC isomorphic 후                                                                   | ⏳ open (PoC #11 = 작은 단일책임 / NOT 다중 → carry 자격 ❌ / 다음 다중책임 PoC = EFI-WEB connect / contract / bod 후보)                                                                                                    |
| ~~iBATIS 2 전용 dynamic 태그 sub-classification~~             | ~~v2.2.x patch / 사용자 finding~~                                                                | ✅ **resolved 2026-05-12** (v2.3.1 PATCH commit `bc48477` / `dynamic_branch.tag_type` enum 26종)                                                                                                                            |
| **R1' automation ceiling 외부 권위 정량 비교 (v1.1 신규)**    | Spring 4.1+iBATIS 2 specific academic 권위 출현 시 (현재 ❌ / paradigm class 추상화 인용만 가능) | ⏳ open (Wang ICSE 2025 + LongCodeBench 2025 + AWS SCT + Amazon Q + ThoughtWorks 외부 권위 = paradigm 방향성 + scope 효과 + 자릿수 sanity 정합 / 정량 ceiling 53~55% = original empirical finding (industry first) 유지)    |
| **PoC #11 0 SATD 해석 정정 (v1.1 신규 carry)**                | PoC #11 Day 3.5 종결 시                                                                          | ⏳ open ("Modern OSS reference 정합" 단순 결론 ❌ / single-case + 작은 모듈 + 잠복 기간 미경과 해석 명시 / `examples/poc-11-efiweb-billing-spring41/input/` + `sql-inventory.json` 갱신)                                    |
| ~~**C-not-all-code-검증 (v1.1.1 신규 carry)**~~               | arxiv 2601.21894 "Not All Code Is Equal" 별도 검증 후 sub-rule §X-C 재인용 vs 영구 제거          | ✅ **resolved 2026-05-13** (session 2차 / DEC-2026-05-13-not-all-code-인용-복원 / 메인 WebFetch + WebSearch 직접 검증 = arxiv ID 정확 / Twist et al. 2026 / 인용 복원 / sub-rule v1.1.1 → v1.1.2 PATCH / 본체 v2.3.4 PATCH) |
| ~~**Modern stack 사내 측정 carry (v1.1.1 신규 critical)**~~       | 사내 Modern stack PoC 진입 시                   | ✅ **재정의/종결 2026-06-10** (DEC-2026-06-10-3a-deflate): 사내 Modern(ep-be-gea) 진입 시 발견 — §3-A paradigm ceiling 정량 주장이 측정 비대칭 산물(미입증) → §3-A 강등 + "재측정 의무"를 auto_ratio → **chain-harness operability** 측정으로 재정의. auto_ratio 재측정 carry = 폐기(저가치).       |

---

## X. analysis 단계 §3-A automation ceiling (R1' 새 가설 / v1.1 신규)

> **⚠️ 강등 (DEC-2026-06-10-3a-automation-ceiling-deflate-operability-reframe / 2026-06-10)**: 본 §X 의 **paradigm-cross 정량 ceiling 주장(Legacy 53~55% < Modern 60~67% / ~10%p gap)은 근거 약함으로 강등** — 정량 paradigm 주장 ❌, **정성 신호로만 유효**. 근거: ⓐ **측정 비대칭** — Legacy(#06/07/11) = 4-산출물 평균(분해표 명시) / Modern(#08/09/10) = **inventory 산출물 1개만**(분해표 없음 / "평균" 오라벨). inventory 끼리는 Legacy 60~75% ≈ Modern 60~67% = **paradigm gap 없음**. ⓑ **metric analyst-noise** — 같은 Legacy·같은 rules.json auto_ratio 가 poc-06 29% ↔ poc-07/11 50% (+21%p 출렁) = paradigm ceiling 떠받칠 정밀도 미달. ⓒ ep-be-gea(사내 Modern) 4-산출물 ≈37.5% ≈ Legacy poc-06 38.75%(analyst 판정). **남는 진실은 정성적**: 의미 계층(의도·도메인 의미·bug-vs-intent)은 결정론 환원 불가 → 진짜 ceiling이고 **paradigm 아닌 산출물 종류**가 가름(사람 gate + characterization 의 존재 이유). 아래 정량 수치는 **역사적 측정 기록**으로 보존(액면 paradigm 주장 ❌). "사내 Modern 재측정 의무" = auto_ratio 재측정 ❌ → **chain-harness operability/correctness 측정**(산출물이 LLM 을 실제 운영하게 하느냐)으로 재정의.

### X-A. 3 사내 PoC 측정 사실

| PoC                  | scale (Java LOC) | 책임          | §3-A 자동화율 (실측) | spectrum                                      |
| -------------------- | ---------------- | ------------- | -------------------- | --------------------------------------------- |
| **PoC #06 exchange** | 345              | 단일          | **38.75%**           | baseline                                      |
| **PoC #11 billing**  | **257**          | **작은 단일** | **52.5%**            | scale-cross floor (corroboration #3 사내 PoC) |
| **PoC #07 capital**  | 3752             | 다중          | **53.8%**            | scale-cross ceiling 다중                      |

→ **Spring 4.1 + iBATIS 2 paradigm = analysis 단계 §3-A automation ceiling ~53~55%** (3 사내 PoC isomorphic / scale 단순 무관).

### X-B. R1 가설 반증 + R1' (revised) 정립

**R1 (반증)**: scale ↓ → §3-A 자동화율 ↓.
→ 반증 사실: PoC #11 (257 LOC) > PoC #06 (345 LOC) **+13.75%p** / scale 작아도 자동화율 높음.

**R1' (revised)**: §3-A 자동화율 = (paradigm × 책임 × trivially deterministic 효과) 복합 함수 → paradigm 별 ceiling 형성.

| 인자                                      | 영향도 | 근거                                                          |
| ----------------------------------------- | ------ | ------------------------------------------------------------- |
| paradigm (Spring 4.1+iBATIS 2 vs Modern)  | 강     | Legacy ceiling ~53~55% vs Modern ceiling ~63~67% (5 PoC 사실) |
| 책임 (단일 vs 다중)                       | 중     | PoC #06 (단일 38.75%) < PoC #07 (다중 53.8%) +15%p            |
| trivially deterministic 효과 (작은 scope) | 중     | PoC #11 (작은 단일 52.5%) > PoC #06 (단일 38.75%) +13.75%p    |
| scale (LOC) 단독                          | 약     | PoC #11 < PoC #06 (작음) BUT 자동화율 ↑ → scale 단독 영향 약  |

### X-C. 외부 권위 보강 (v1.1 신규 / 4원칙 2원칙 research / F-015 cross-validation)

**R1' 방향성 (legacy paradigm < modern paradigm automation)** = STRONG 외부 권위 정합:

1. **Wang et al. ICSE 2025** "How and Why LLMs Use Deprecated APIs in Code Completion? An Empirical Study" (arxiv 2406.09834v3 / DOI 10.1109/ICSE55347.2025.00245 / v1.1.1 정정: First author = Chong Wang (NTU) / Zhang 공저자 3번째)
   - DUR (Deprecated Usage Rate): outdated functions (𝒪) **70~90%** vs up-to-date (𝒰) **9~18%** / overall **25~38%** 범위 (~60~70%p gap)
   - "LLMs lack explicit mechanisms to distinguish between obsolete and current APIs"
   - **iBATIS 2 = 2009 EOL** 정확 적용 — 본 사내 §3-A LLM 의 AP 식별 + mapper XML 의미 해석 시 동일 메커니즘 작동

2. **Gartner Application Innovation Summit 2025**
   - "Bolting GenAI on top of an old existing stack doesn't magically make an application intelligent"
   - "AI 단독 = nondeterministic, lower accuracy outcomes"
   - by 2027 60% legacy 격상 = GenAI 주도 (modernization 후행)

**R1' "작은 scope → 자동화율 ↑" (trivially deterministic)** = STRONG 외부 권위 정합:

3. **LongCodeBench** (arxiv 2505.07897 / v1.1.1 정정: 2025 / v1=2025-05 / v3=2025-10 — "2026" 오표기 정정) "Evaluating Coding LLMs at 1M Context Windows"
   - Claude 3.5 Sonnet LongSWE-Bench 정확도: **29% → 3%** (context length ↑ → 급락)
   - Qwen2.5 = 70.2% → 40%
   - "LLMs display much lower accuracy on code benchmarks than text benchmarks"

4. **Context Length Alone Hurts** (arxiv 2510.05381v1 / EMNLP 2025 Findings / First author = Yufeng Du)
   - retrieval 완벽해도 input 길이만으로 성능 **13.9~85% 저하**

5. **"Beyond Synthetic Benchmarks: Evaluating LLM Performance on Real-World Class-Level Code Generation"** (arxiv 2510.26130 / 2025 / v1.1.1 신규 보강 — Agent 1 추가 권위 후보)
   - synthetic benchmark vs real-world framework integration 갭 명시 (R1' "legacy framework 통합 = synthetic benchmark 외 영역" 보강 적합)

6. **"Where Do LLMs Still Struggle?"** (arxiv 2511.04355 / 2025 / v1.1.1 신규 보강 — Agent 1 추가 권위 후보)
   - code generation benchmark 한계 in-depth 분석 (R1' "ceiling 존재" 방향성 보강)

7. **Twist et al. "Not All Code Is Equal: A Data-Centric Study of Code Complexity and LLM Reasoning"** (arxiv 2601.21894 / 2026-01-29 submission / v1.1.2 인용 복원 — Agent 1 F-015 finding 정정 / 메인 WebFetch + WebSearch 직접 검증)
   - First author = Lukas Twist (+ Shu Yang / Hanqi Yan / Jingzhi Gong / Di Wang / Helen Yannakoudakis / Jie M. Zhang)
   - 핵심 finding: **structural complexity 가 LLM reasoning 에 dominant** / **83% experiments** restricting fine-tuning data to specific structural complexity range outperforms structurally diverse code
   - R1' "trivially deterministic 효과 (작은 scope = structural complexity 단순)" 정합 강 — paradigm specific code 의 structural complexity 가 §3-A automation ceiling 영향 인자 정합
   - critical lesson — Agent 1 F-015 cross-validation (가벼운 sub-agent / 시간 cap 10분) 의 한계: WebFetch 직접 검증 못 한 가능성 / "2601 prefix = 2026-01 / 확인 불가" 단순 결단 ❌ / fallback 메인 cross-check 의무 (memory `feedback_sub_agent_validation.md` 갱신 의무)

### X-D. original empirical finding 명시 (외부 권위 부재 영역)

- R1' **정량 ceiling (Spring 4.1+iBATIS 2 ~53~55% / Modern ~60~67%)** = 외부 권위 부재 / **original empirical finding (industry first paradigm-cross axis quantification)**
  - 본 사내 6 PoC isomorphic 6 차원 corroboration (paradigm + ORM + platform + language + responsibility + scale) = ADR-CHAIN-008 "MEDIUM × ≥ 5 PoC = strong" 정책 정합
  - Spring 4.1 + iBATIS 2 specific academic ❌ — **legacy ORM-less SQL mapper paradigm class** 추상화 후 인용 가능
- R1' **counterexample (PoC #07 다중책임 5509 LOC > PoC #06 단일 345 LOC / 큰 scope 자동화율 ↑)** = 외부 권위 부재 / original finding
  - 본 사내 가설: "다중책임 분기 양 ↑ → 자동 grep 누적 효과 ↑" (5 PoC × 단일 paradigm 표본 한정)

### X-C-2. Big-tech industry isomorphic corroboration (v1.1.1 신규 / Agent 2 정탐)

paradigm-cross axis 정량 측정 = academic + industry 모두 부재 / **자릿수 sanity check 가능**:

| 권위                                                                   | axis           | 정량                                                                                                                                                                         | R1' 비교                                                                                                       |
| ---------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **AWS SCT** (Schema Conversion Tool / Oracle→PostgreSQL heterogeneous) | 객체 종류 axis | Tables 100% / Views 94.5% / Stored Proc **76.8%** / Functions **66.4%** / Triggers 74.2%                                                                                     | Modern ceiling 60~67% vs AWS SCT Functions **66.4%** 자릿수 정합 / Stored Proc 76.8% = Modern upper bound 정합 |
| **Amazon Q Developer Code Transformation** (Java 버전 axis)            | Java 버전 axis | Novacomp 자체 코드 **80%** / 대형 보험사 4 app **36%** / 일반 productivity **20~40%** 시간 단축 / OSS 62 large app **85% higher success rate** / AI 추천 acceptance **60%+** | 본 R1' 자릿수 (50~80%) 정합 / Amazon Q paradigm 별 자동화율 차이 published ❌                                  |
| **ThoughtWorks Tech Radar Vol.32~34** (2025~2026.04)                   | 사상 axis      | "GenAI for forward engineering" 신 기법 등재 (legacy → 의도 추출 → 모던 재생성) + "Spec-driven development for legacy"                                                       | 본 chain harness (planning → behavior → test → impl) 와 **isomorphic 사상** / paradigm 별 자동화율 정량 ❌     |

→ **본 R1' = industry first paradigm-cross axis quantification (original empirical finding)** — Big-tech / 권위 분석사 어디도 "paradigm 별 자동화율 ceiling" 정량 발표 없음. 자릿수 정합 sanity check ✅.

### X-E. paradigm modernization 시 ceiling 돌파 (5 PoC SQL Inventory robust 정합)

| PoC                                         | paradigm                    | §3-A 자동화율                        | 출처                       | 측정 환경    |
| ------------------------------------------- | --------------------------- | ------------------------------------ | -------------------------- | ------------ |
| PoC #06 + #11 + #07 (Spring 4.1 + iBATIS 2) | Legacy                      | **38.75% ~ 53.8%** (ceiling ~53~55%) | 본 sub-rule §X-A           | 사내 EFI-WEB |
| PoC #08 jpetstore-6                         | MyBatis 3 Modern (Spring 6) | **66.7%**                            | DEC-2026-05-07-poc-08-종결 | OSS 한정     |
| PoC #09 lujakob                             | NestJS + TypeORM Modern     | **63.6%**                            | DEC-2026-05-08-poc-09-종결 | OSS 한정     |
| PoC #10 raeperd                             | Spring Data JPA Modern      | **60%**                              | DEC-2026-05-08-poc-10-종결 | OSS 한정     |

→ ~~Legacy ceiling **~53~55%** vs Modern ceiling **~60~67%** (~10%p gap / 6 PoC 사실 robust).~~ **(강등 — §X 배너)**: 이 gap 은 **측정 비대칭의 산물**(Legacy=4-산출물 평균 vs Modern=inventory-only). 비교 가능한 inventory 끼리는 Legacy 60~75% ≈ Modern 60~67% = paradigm gap 없음. 정량 ceiling 주장 ❌.

~~**Modern ceiling = OSS PoC 3건 한정**~~ — **재정의(DEC-2026-06-10-3a-deflate)**: Modern "60~67%" = inventory 산출물 1개만 측정(분해표 없음). 사내 Modern "재측정 의무" = auto_ratio 재측정 ❌ → **chain-harness operability/correctness 측정**으로 재정의(산출물 컨텍스트로 LLM 이 실제 작업 수행하나 / chain-harness axis 가 이미 측정). ep-be-gea reservation-golf god-method 천장(gate#4) = 그 신호 실례.

### X-F. 실용 함의

1. Spring 4.1+iBATIS 2 stack analysis = §3-A 자동화율 35~55% expectation (scale 무관 / responsibility 무관 / paradigm 종속)
2. ~~migration target stack 결정 시 = Modern stack 이전 = §3-A 자동화율 +10%p expectation~~ **(강등)**: "+10%p paradigm 효과"는 측정 비대칭 산물 = 미입증(§X 배너). §3-A 는 산출물 종류(inventory 결정론 ~60% / 의미-heavy ~22~50%)가 가르지 paradigm 아님 — migration 공수 추정은 "의미 계층(BR 의도·도메인)은 사람/LLM 판단 필요"라는 정성 사실로만.
3. 70~80% 한계 (**chain harness 전체 자동화 axis** / process 통과율 metric / gate 의무 ≤ 15% 사용자 검토 / CLAUDE.md / project_methodology_scope memory) 와 **별도 axis** (본 §X = **analysis 단계 §3-A automation axis** / artifact 추출률 metric / paradigm 종속 ceiling). **metric 분모 자체 다름** — chain harness axis 분모 = chain 1~4 통합 gate 통과량 / §3-A axis 분모 = analysis 단계 LLM ↔ rule.json 단방향 추출 row count (v1.1.1 신규 metric semantics 차이 명시 / Agent 3 강화 흡수).
4. ADR-CHAIN-008 "MEDIUM × ≥ 5 PoC = strong" 정책 = 본 R1' 가설에도 정합 적용 가능 (6 PoC isomorphic 6 차원 corroboration 보강 / industry first paradigm-cross axis quantification)

### X-G. R1' carry (Day 3.5 PoC #11 종결 시 결단)

- **C-r1-hypothesis-revisit** (critical / DEC-2026-05-12-r1-가설-revisit origin) = 본 sub-rule §X 등재로 **resolved**
- **C-automation-ceiling-paradigm** = 본 §X 등재로 **resolved**
- **C-poc-11-0-satd-해석-정정** (§6 carry 잔존 / Day 3.5 PoC #11 종결 시 일괄 처리)

### X-H. R1' sub-axis 본격 분리 (poc-17 dogfooding 신설 — 2026-05-28 / poc-17 Phase 1 첫 live 본격 입증 — 2026-05-29 / DEC-2026-05-28-db-assets-always-on)

R1' axis (Spring 4.1 + iBATIS 2 ~53~55%) 는 **단일 paradigm-종속 ceiling** 이지만, 비즈니스 로직의 **3 sub-layer 분포** 가 별도 axis 로 분리되어야 하는 사실이 poc-17 dogfooding 진입 시 본격 노출 / **2026-05-29 Phase 1 analysis baseline 12 phase 전수 산출 종결 시점 본격 입증**:

#### sub-axis 매트릭스

| Sub-layer                         | 위치                        | 자동 추출           | 측정 paradigm                                          | 비고                                                                  |
| --------------------------------- | --------------------------- | ------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| (a) **Java app**                  | Controller / Service / DAO  | △ 부분              | codegraph Java ⭐⭐⭐                                  | LOC 기반 / 의미 추론 한계 — 본격 자동화 ceiling 의 본격 부분          |
| (b) **iBATIS sqlMap XML**         | DAO mapper                  | ❌                  | codegraph 미지원 (DEC-2026-05-28-codegraph-probe-결과) | string literal 의미 추론 불가 — 수동 SQL Inventory 의무 (35 SQL 평균) |
| (c) **DB SP / Function SQL 파일** | Stored Procedure / Function | **✅ 정적 분석 ✅** | SQL AST parse / body extract                           | **R1' axis 의 carry 측정 자산** (paradigm sub-axis 사실)              |

#### 함의 (DEC-2026-05-28-db-assets-always-on cascade)

1. **본격 자동화율은 3 sub-axis 합산** — (a) + (b) + (c) 통합 측정 ↔ 기존 §3-A 53~55% 측정은 (a)+(b) 만 가능 (legacy 측정 ❌ (c))
2. **(c) layer 추가 시 §3-A axis 분모 변동** — DB 자산 always-on 정책 (ADR-CHAIN-014) 적용 후 baseline 재측정 의무
3. **paradigm-cross corroboration ≥ 3 (§8.1 strict)** — poc-17 + 다른 도메인 확대 측정 시 sub-axis 정량 자산화 (carry)

#### poc-17 ifrs/car 첫 측정 (2026-05-29 Phase 1 본격 종결 / 실측 사실 본격 누적)

##### (1) 자산 실측 (Phase 1 종결)

| 자산                       | 실측 갯수                                                                                                                                       | sub-axis 기여                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Java                       | 8 파일 / **1,750 LOC** (Controllers 792 + Services interface 175 + Impls 471 + DAOs 312)                                                        | (a) 측정 baseline                                           |
| iBATIS sqlMap              | carMgt 22 + carCost 13 = **35 SQL id** (PROGRESS.md 추정 정합) + 1 procedure tag (외부 SP γ EXEC)                                               | (b) 측정 — 수동 정리                                        |
| JSP (Scenario C 본격 발견) | 14 파일 / **3,980 LOC**                                                                                                                         | (d) — view layer / Scenario C 활성 / template-analyze phase |
| DB Tables                  | **6** (TB_CAR + TB_CAR_USER_TERM + TB_CAR_DRIVE + TB_CAR_COST + TB_CAR_COST_NOLOG + TB_CAR_COST_SLIP / 163 LOC / PROGRESS.md 추정 5건 정정 6건) | (c) — schema axis                                           |
| DB Functions               | **2** (fn_Get_CarUserListView{,\_2} / 127 LOC)                                                                                                  | (c) — 정적 분석 ✅                                          |
| DB SP (자체)               | 0                                                                                                                                               | (c) — car 비종속                                            |
| DB SP (외부 SGERP 호출)    | **1** (SGERP.dbo.SG_SACSlipRowCarManagementIFQuery / `<procedure>` tag)                                                                         | (c) — γ 분류 (SP 전환 정책 ADR-CHAIN-015)                   |
| Cross-DB 자산              | **18** (FIM 3 + MDI 2 + SGERP 10 + e_hr 1 + IFRS 사내 fn 2)                                                                                     | K 정책 first live 본격 가치 입증                            |

##### (2) sub-axis 자동화율 본격 측정 (AP detection sub-axis / 별 metric)

본 측정 = §3-A 전체 자동화율 (R1' axis ceiling 53~55%) 와는 **별 metric**. AP detection sub-axis 만 한정 측정.

| sub-axis 영역                                                             | 측정값                                                                                     | grounding                                                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| AP detection sub-axis (16 AP / fully automated 11 + partial 2 + manual 3) | **81.25%**                                                                                 | core 5 (Map / NOLOCK / Anemic / Shared SQL / SATD) + §X-H 신축 11 (아래 §X-H-11) 통합 |
| sub-axis 자동화율 분포                                                    | fully automated = 11 / partial = 2 / manual = 3                                            | grep + PMD 7.24.0 실 실행 + manual review 분리                                        |
| 외부 도구 실 실행                                                         | PMD 7.24.0 (JSP) — 28 violations / 14 파일 중 10 ParseException (PMD 7.x JSP grammar 한계) | F-PMD-PARSE-001                                                                       |
| simulation 적용                                                           | **0건** (LLM persona ❌ / 진짜 도구 실행 + LLM grounded review 분리 명시)                  | feedback_no_static_tool_simulation 정합                                               |

→ sub-axis 81.25% = **R1' axis ceiling 53~55% 보다 sub-axis 본격 上** (별 metric / sub-axis 만 / 외부 인용 시 axis 혼동 회피 의무). 본 사실 = poc-17 = sub-axis 정량 자산화 **첫 corroboration**.

##### (3) §X-H-11 신축 AP 본격 등재 (poc-17 첫 live)

R1' core 5 AP (§2) 외에 sub-axis (R1'-c DB layer + cross-cutting) 영역의 신축 AP 11종:

| ID                       | 제목                                                | severity     | 자동화                                | poc-17 사실                                                                 |
| ------------------------ | --------------------------------------------------- | ------------ | ------------------------------------- | --------------------------------------------------------------------------- |
| AP-LEGACY-IBATIS2-DB-001 | N+1 / N+5 subquery (cross-DB row by row)            | medium       | partial (grep)                        | 2건 (selectCarList N+1 / selectCarCostingList N+5 STUFF)                    |
| AP-LEGACY-IBATIS2-DB-002 | cross-DB 직접 참조 (schema.table cross-system)      | high         | fully (grep)                          | 18 자산 (FIM/MDI/SGERP/e_hr)                                                |
| AP-LEGACY-IBATIS2-DB-003 | 외부 stored procedure EXEC (iBATIS `<procedure>`)   | medium       | fully (grep)                          | 1건 (SGERP SP γ)                                                            |
| AP-LEGACY-IBATIS2-DB-004 | JSP unsanitized expression (XSS marker)             | high         | fully (PMD)                           | 19건 (PMD NoUnsanitizedJSPExpression)                                       |
| AP-LEGACY-IBATIS2-DB-005 | PII (개인정보) 하드코딩                             | **critical** | **manual only (LLM grounded review)** | 5명 실명 + 마스킹 패턴 운영 코드 잔존 (F-PII-HARDCODE-001)                  |
| AP-LEGACY-IBATIS2-DB-006 | 주석 처리된 SQL 본문 잔존 (dead code)               | low          | fully (grep)                          | ≥4 (saveCarCost MERGE 47줄 등)                                              |
| AP-LEGACY-IBATIS2-DB-007 | Magic constants (하드코딩 코드/숫자/문자열)         | medium       | manual assisted                       | 11종 ('IF000000096' / PS10 / E10 / 99999999 / state '2' / 비서 예외 3종 등) |
| AP-LEGACY-IBATIS2-DB-008 | iBATIS DAO insert() 호출이 실제는 sqlMap `<update>` | low          | manual                                | 1건 (CarMgtDAO.updateCarDrive)                                              |
| AP-LEGACY-IBATIS2-DB-009 | System.out.println debug 로그 운영 잔존             | medium       | fully (grep)                          | 1건 (CarCostController.saveConfirmList)                                     |
| AP-LEGACY-IBATIS2-DB-010 | Parallel array iterate (index 동기화 / DTO 부재)    | medium       | manual                                | 2건 (saveCarUserTerm 5 array + saveCarDriveRow 12 array)                    |
| AP-LEGACY-IBATIS2-DB-011 | N+1 cross-DB subquery (선행 N+1 정합)               | medium       | fully (grep)                          | 매 row com_nm/dept_nm cross-DB subquery                                     |

**AP-LEGACY-IBATIS2-DB-005 (PII 하드코딩) = LLM grounded review only** — 외부 자동 도구 부재. sub-rule §X-H 의 본격 자산 + memory `feedback_no_static_tool_simulation` 정합 (manual review 도 인정 paradigm).

##### (4) R1'-c (DB axis) 첫 corroboration 사실

| sub-layer            | poc-17 측정 사실                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) Java             | 1,750 LOC / 8 파일 / codegraph Java ⭐⭐⭐ 정합 (PoC #15 사실)                                                                                                       |
| (b) iBATIS sqlMap    | 35 SQL id / 1 procedure tag / codegraph 미지원 = sqlMap layer 정적 분석 ❌ (PoC #15 사실 정합)                                                                       |
| (c) DB SP/Function   | **F-FN-EMPTY-001** (fn_Get_CarUserListView.sql 빈 파일 / IFRS_split export 누락) + **F-MISSING-FN-001** (ifrs.dbo.FN_SPLIT 사내 fn 사용 / export 부재 = K 정책 위반) |
| (d) JSP (Scenario C) | 14 파일 / 3,980 LOC / PMD 7.x grammar 14중 10 ParseException = 71% (도구 한계 보강 carry)                                                                            |

##### (5) sub-axis 분리 carry (갱신)

- ✅ **C-c-layer-baseline-측정** (poc-17 Phase 1 종결 시점 본격 측정 완료 — 18 cross-DB 자산 + 35 SQL + DB 자산 8 사실)
- ⏳ **C-sub-axis-3-poc-corroboration** (poc-17 첫 sub-axis 측정 — ≥ 2 추가 도메인 측정 의무 / 자격 1/3)
- ⏳ **C-codegraph-c-layer-support** (external — codegraph v0.9.6 = iBATIS 2 미지원 + SP/Function AST parse 미지원 / scope-out 결정 = DEC-2026-05-27 / 본 PoC 본격 정합)
- ⏳ **C-jsp-parser-augment** (poc-17 신규 — PMD 7.x JSP grammar 71% parse fail → SonarQube/jsp-lint 보강 의무)
- ⏳ **C-scenario-c-jsp-paradigm** (poc-17 첫 사내 Scenario C 적용 사례 본격 자산화 / 다른 사내 도메인 JSP 도메인 첫 입증)

---

## 7. 참조 (v1.1 갱신)

### v1.0 origin

- ADR-CHAIN-010 (본 sub-rule 정식 자산화 결정 / v1.0 origin)
- DEC-2026-05-12-v2.3.0-final (Phase 2 종결)
- PoC #06 antipatterns.json (AP-EXCHANGE-001/002/004/007/011)
- PoC #07 antipatterns.json (AP-CAPITAL-002/003/004/008/009/012)
- `schemas/antipatterns.schema.json` (AP-\* schema 정합)
- `methodology-spec/deliverables/24-sql-inventory.md` (sql-inventory cross-link)
- Michael Feathers, Working Effectively with Legacy Code (2004 / "production = its own specification")

### v1.1 신규 (2026-05-12)

- **DEC-2026-05-12-r1-가설-revisit** (critical / R1 반증 + R1' 새 가설 origin)
- **DEC-2026-05-12-sub-rule-v1.1-갱신** (본 v1.1 갱신 origin)
- DEC-2026-05-12-in-place-read-정책-채택 (source 정책 변경 / PoC #11 첫 적용)
- PoC #11 antipatterns.json (AP-BILLING-002/005 / 3 사내 PoC isomorphic 자격 사실)
- PoC #11 inventory.json (`phase_3a_automation_measurement` / §3-A 자동화율 52.5% 측정)
- PoC #11 sql-inventory.json (corroboration #3 사내 PoC / 66.7% × 3 robust)
- **Software Quality Journal 2024** (DOI 10.1007/s11219-023-09655-z) — Keyword-Labeled SATD (KL-SATD) 정확 정의 출처 (§AP-005 인용 정정)
- Maldonado & Shihab 2015 "Detecting and quantifying different types of self-admitted technical debt" (IEEE 7th MTD workshop / 5 SATD type) — §AP-005 인용 정정 후 정확 표현
- Gartner Application Innovation Summit 2025 (Moderne.ai recap) — paradigm modernization 후행 권위
- DEC-2026-05-08-poc-{08,09,10}-종결 (Modern paradigm ceiling 돌파 evidence)
- F-015 cross-validation 패턴 (memory `feedback_sub_agent_validation.md`)
- 가벼운 sub-agent 전략 (memory `feedback_lightweight_sub_agent.md`)

### v1.1.1 PATCH 신규 / 정정 (2026-05-13 / DEC-2026-05-13-r1-prime-본체-명문화)

- **DEC-2026-05-13-r1-prime-본체-명문화** (v1.1.1 PATCH origin / 본체 CLAUDE.md + README + memory 3 layer R1' axis 분리 명문화)
- **Wang et al. ICSE 2025** (Agent 1 F-015 정정 / Zhang → Wang / First author = Chong Wang NTU / 공저자 3번째 Zhang / arxiv 2406.09834v3 / DOI 10.1109/ICSE55347.2025.00245) — R1' paradigm 방향 외부 권위 STRONG
- **LongCodeBench** (arxiv 2505.07897 / Agent 1 정정 / 발표년도 2025 / v1=2025-05 / v3=2025-10 / First author = Stefano Rando) — R1' scope 효과 외부 권위 STRONG
- **Context Length Alone Hurts** (arxiv 2510.05381v1 / EMNLP 2025 Findings / First author = Yufeng Du) — input 길이 단독 변수
- **Beyond Synthetic Benchmarks** (arxiv 2510.26130 / 2025 / v1.1.1 신규 추가) — synthetic benchmark vs real-world framework 갭
- **Where Do LLMs Still Struggle?** (arxiv 2511.04355 / 2025 / v1.1.1 신규 추가) — code generation benchmark 한계
- **AWS Schema Conversion Tool** (v1.1.1 신규 추가 / Agent 2 isomorphic corroboration) — Stored Proc 76.8% / Functions 66.4% 자릿수 정합
- **Amazon Q Developer Code Transformation** (v1.1.1 신규 추가 / Agent 2) — Novacomp 80% / 보험사 36% / paradigm 별 정량 ❌
- **ThoughtWorks Tech Radar Vol.32~34** (2025~2026.04 / v1.1.1 신규 추가 / Agent 2) — "GenAI for forward engineering" + "Spec-driven development for legacy" / chain harness 사상 isomorphic
- **Twist et al. "Not All Code Is Equal: A Data-Centric Study of Code Complexity and LLM Reasoning"** (arxiv 2601.21894 / 2026-01-29 submission / v1.1.2 인용 복원 — Agent 1 F-015 finding 정정 / 메인 WebFetch + WebSearch 직접 검증) — First author = Lukas Twist (+ Shu Yang / Hanqi Yan / Jingzhi Gong / Di Wang / Helen Yannakoudakis / Jie M. Zhang) / structural complexity 가 LLM reasoning 에 dominant / 83% experiments 정합

### v1.1.2 PATCH 신규 (2026-05-13 session 2차 / DEC-2026-05-13-not-all-code-인용-복원)

- **DEC-2026-05-13-not-all-code-인용-복원** (v1.1.2 PATCH origin / Agent 1 F-015 finding 정정 + arxiv 2601.21894 인용 복원 + critical lesson F-015 한계 명시)
