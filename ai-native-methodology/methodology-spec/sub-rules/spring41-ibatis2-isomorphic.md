# Sub-Rule: Spring 4.1 + iBATIS 2 Spectrum AP Isomorphic 5종

> ★ ★ ★ v2.3.0 Phase 2 신설 — PoC #06 (exchange / 단일책임) + PoC #07 (capital / 다중책임) 양 PoC 공통 AP 5종 isomorphic 입증 → sub-rule 자산화.
> **trigger**: Spring 4.x + iBATIS 2.x stack 분석 시 본 5종 우선 후보 AP.
> **자격**: ≥ 2 PoC isomorphic (PoC #06+#07 / 단일+다중책임 spectrum) 충족.
> **schema 참조**: `schemas/antipatterns.schema.json` AP-* 정합.
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
| signal | 코드/SQL 주석 의 자조 표현 = `★ ★`, `// TODO Auto-generated`, `// XXX`, `폐해`, `짜증나`, `임시처리`, `슈퍼크리에이티브` 등 self_recognized 키워드. Maldonado & Shihab (2015) KL-SATD 패턴 (Korean Language Self-Admitted TD). |
| risk | 기술부채 자체 인지된 상태에서 처리 부재 → 누적 → 시스템 enthropy ↑. SATD 발견 자체가 "이미 알지만 못 고친다" 신호 강. |
| 회피 | SATD 발견 시 antipatterns.json 등재 + migration_priority P0~P2 분류 + tracking issue 생성 |
| PoC 정합 | AP-EXCHANGE-007 (SQL 자조 코멘트 "환율관리 페이지만 생각하고 설계한 폐해라 할 수 있다 ㅋ") + AP-CAPITAL-008 (// TODO Auto-generated method stub) + AP-CAPITAL-009 (★ "슈퍼크리에이티브 메일수신 유저 임시처리 4회 중복") |
| cross-link | characterization-spec.json `self_recognized` 분류 / sql-inventory.json `intent_vs_bug_classification` self_recognized 키워드 |

---

## 3. ★ ★ ≥ 2 PoC isomorphic 자격 사실

| AP isomorphic 5종 | PoC #06 (exchange / 단일책임) | PoC #07 (capital / 다중책임) | scale-cross isomorphic |
|---|---|---|---|
| Map<String,Object> 강제 캐스팅 | AP-EXCHANGE-001 (high) | AP-CAPITAL-002 (high) | ✅ 등급 + 패턴 동일 |
| Anemic Service | AP-EXCHANGE-002 (medium) | AP-CAPITAL-003 (high) | ✅ (severity 등급 다중책임 ↑ 강화) |
| WITH(NOLOCK) 무차별 | AP-EXCHANGE-004 (high) | AP-CAPITAL-004 (high) | ✅ 패턴 동일 |
| 공유 SQL 조각 부재 | AP-EXCHANGE-011 (medium / Day 1.6 신규) | AP-CAPITAL-012 (medium) | ✅ count=0 동일 / 스케일 무관 |
| 자조 SATD | AP-EXCHANGE-007 (low) | AP-CAPITAL-008 + 009 (high) | ✅ KL-SATD 패턴 / 다중책임에서 다중 발현 |

→ ★ ★ ★ scale + responsibility-cross isomorphic 입증 / Spring 4.1 + iBATIS 2 spectrum sub-rule 자격 사실 확보.

---

## 4. ★ 신뢰도 (단계 5 정합)

| 단계 | 조건 | 신뢰도 |
|---|---|---|
| 1 | 단일 PoC measurement 만 | 50~65% |
| 3 | ≥ 2 PoC isomorphic 입증 + spectrum 단일 (단일책임 only / 다중책임 only) | 75~85% |
| 5 | ≥ 2 PoC isomorphic + ≥ 2 spectrum (단일 + 다중책임) + 5 AP 모두 corroboration | 85~95% |

본 sub-rule = **단계 5** (PoC #06 단일 + PoC #07 다중책임 모두 corroboration / 5 AP 모두 isomorphic).

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

## 6. ★ 확장 carry

| 항목 | trigger |
|---|---|
| Modern stack sub-rule (Spring 5+ / MyBatis 3 / JPA / TypeORM) | ≥ 2 Modern PoC isomorphic (PoC #08+#09+#10 분석 후) |
| 다중책임 spectrum 강화 (AP-CAPITAL-005~011 단일 PoC) | ≥ 2 다중책임 PoC isomorphic 후 (PoC #11 EFI-WEB billing 종결 후) |
| iBATIS 2 전용 dynamic 태그 sub-classification | v2.2.x patch / 사용자 finding |

---

## 7. 참조

- ADR-CHAIN-010 (★ 본 sub-rule 정식 자산화 결정)
- DEC-2026-05-12-v2.3.0-final (★ Phase 2 종결)
- PoC #06 antipatterns.json (AP-EXCHANGE-001/002/004/007/011)
- PoC #07 antipatterns.json (AP-CAPITAL-002/003/004/008/009/012)
- `schemas/antipatterns.schema.json` (AP-* schema 정합)
- `methodology-spec/deliverables/24-sql-inventory.md` (sql-inventory cross-link)
- Maldonado & Shihab 2015 (KL-SATD 패턴 / 자조 SATD 외부 권위)
- Michael Feathers, Working Effectively with Legacy Code (2004 / "production = its own specification")
