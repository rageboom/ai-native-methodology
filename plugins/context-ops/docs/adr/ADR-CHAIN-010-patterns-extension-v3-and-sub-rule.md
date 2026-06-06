# ADR-CHAIN-010: patterns_extension_v3 정식 도입 (MyBatis 3 advanced features 한정) + Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 sub-rule 자산화

- 상태: 승인됨 (Accepted) — v2.3.0 minor sprint Phase 2 정합 / DEC-2026-05-12-v2.3.0-scope-결단 옵션 D §2.2 (Phase 2 scope) origin
- 일자: 2026-05-12
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-CHAIN-007 (phase 4.8 sql-inventory origin), ADR-CHAIN-009 (Gartner TIME SQL 단위 보류 / migration_priority 채택), DEC-2026-05-12-v2.3.0-scope-결단 ( Phase 2 scope 결단 origin), DEC-2026-05-12-v2.3.0-final ( 본 ADR 절차 통합 종결)

---

## 컨텍스트

v2.3.0 minor sprint 옵션 D (Senior critique REVISE 완전 흡수) §2.2 Phase 2 scope:

1. **C-v2.2.0-3**: patterns_extension_v3 (cache / discriminator / typeHandler nested object) — PoC #06+#07 measurement 정합.
2. **C-v2.2.0-4**: Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 sub-rule 자산화 — PoC #06+#07 공통 AP 5종.

**자격 사실 확보** (research / 2026-05-12 / Agent 1 + Agent 2):

| 자격                                                         | 자료                                                                                                                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MyBatis 3 cache / discriminator / typeHandler 공식 docs 정합 | mybatis.org/mybatis-3/sqlmap-xml.html (cache + discriminator) + configuration.html (typeHandler / TypeHandler<T> generic / iBATIS 2 TypeHandlerCallback 비호환) |
| Spring 4.1 + iBATIS 2 AP 5종 isomorphic 사실                 | PoC #06 antipatterns.json (AP-EXCHANGE-001/002/004/007/011) + PoC #07 antipatterns.json (AP-CAPITAL-002/003/004/008+009/012)                                    |
| OSS 사례 부재 (Samsung SDS / LG CNS / 외국계)                | Agent 2 finding — 본 방법론 first-mover 가치                                                                                                                    |

---

## 결정

### §1. patterns_extension_v3 정식 도입 (MyBatis 3 advanced features 한정)

`schemas/sql-inventory.schema.json` 에 `patternsExtensionV3` $def 신설 + root-level `patterns_extension_v3` reference. **optional** (Legacy iBATIS 2 단독 stack 에는 patterns_extension_v2 만 사용 / MyBatis 3+ stack 에 한정 활성).

3 패턴:

| 패턴                      | MyBatis 3 정의                                                                                  | 자동 추출?                              |
| ------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------- |
| `pattern_5_cache`         | `<cache>` namespace 단위 second-level cache + `<cache-ref>` 공유 + `@CacheNamespace` 어노테이션 | ✅ 80%+ (XML/어노테이션 grep)           |
| `pattern_6_discriminator` | `<discriminator>` ResultMap inheritance mapping (column + javaType 필수)                        | ✅ 95%+ (XML grep)                      |
| `pattern_7_typeHandler`   | `<typeHandler>` 설정 / `TypeHandler<T>` 구현체 (`@MappedTypes` / `@MappedJdbcTypes`)            | ✅ 90%+ (configuration XML + Java grep) |

iBATIS 2 vs MyBatis 3 비호환:

- iBATIS 2 = `<cacheModel>` + `TypeHandlerCallback` (API 비호환 / generic ❌ / `<discriminator>` 부재)
- MyBatis 3 = `<cache>` + `TypeHandler<T>` (generic) + `<discriminator>`

**적용 trigger**:

- Spring 5+ / MyBatis 3 결합 stack (PoC #08 spectrum 정합)
- Annotation-based mapper + Modern Spring Boot
- typeHandler 커스텀 (JSON column / enum 매핑) 필요 시

**적용 제외**:

- iBATIS 2 단독 stack (PoC #06+#07 → patterns_extension_v2 만 사용)
- Modern JPA / TypeORM / Prisma (ORM 추상화 / SQL XML ❌)

### §2. Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 sub-rule 자산화

`methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` 신설.

AP 5종:

1. **Map<String,Object> + 강제 캐스팅** (AP-EXCHANGE-001 + AP-CAPITAL-002)
2. **Anemic Service / 단순 위임** (AP-EXCHANGE-002 + AP-CAPITAL-003)
3. **WITH(NOLOCK) 무차별** (AP-EXCHANGE-004 + AP-CAPITAL-004)
4. **공유 SQL 조각 부재 (`<sql id>` + `<include refid>` 미사용)** (AP-EXCHANGE-011 + AP-CAPITAL-012)
5. **자조 SATD (KL-SATD pattern)** (AP-EXCHANGE-007 + AP-CAPITAL-008/009)

scale + responsibility-cross isomorphic = 본 sub-rule 단계 5 신뢰도 자격 사실.

**적용 trigger**:

- Spring 3.x/4.x + iBATIS 2.3.x stack 자동 식별 시 본 5 AP 우선 후보 적재.
- 전자정부표준프레임워크 + egovMap 결합 강 신호.

**적용 제외**:

- Spring 5+ + MyBatis 3 (paradigm 별도)
- Modern JPA / TypeORM / Prisma

### §3. 신뢰도 + sub-rule 단계

본 sub-rule = **단계 5** (≥ 2 PoC isomorphic + 단일 + 다중책임 spectrum 모두 corroboration / 5 AP 모두 isomorphic).

---

## §4. 사상

### §4.1 spectrum 분리 axis

Spring 4.1 + iBATIS 2 = **Legacy spectrum**. Spring 5+ + MyBatis 3 = **Modern spectrum**. ORM (JPA/TypeORM/Prisma) = **추상화 spectrum**. ADR-CHAIN-008 §1 신정책 정합 (paradigm-cross MEDIUM × ≥ 5 PoC strong) 정합 강.

### §4.2 sub-rule = 후속 PoC 강제

본 sub-rule 5 AP 적용 시 새 PoC (Spring 4.x + iBATIS 2.x stack) 분석 시간 ↓ ↓. AI 자동 추출 (grep + regex) + 사용자/도메인 expert 검증 의무. simulation ❌.

### §4.3 patterns_extension_v3 = 명시 optional

본 ADR § 1 명시: patterns_extension_v3 = **optional / MyBatis 3+ 한정**. iBATIS 2 단독 stack 에 강제 ❌ → backward-compat 의무 (PoC #06+#07 patterns_extension_v2 만 사용 / v3 부재 / 회귀 ❌).

---

## §5. 결과 (Consequences)

### 긍정

- ✅ MyBatis 3 advanced features (cache / discriminator / typeHandler) 정식 schema 자격 확보.
- ✅ Spring 4.1 + iBATIS 2 spectrum 5 AP 자동 후보 적재 가능 = 새 PoC 분석 시간 ↓.
- ✅ Big-tech first-mover 신호 보존 (Samsung SDS / LG CNS / 외국계 OSS 공식 사례 0건 사실).
- ✅ ≥ 2 PoC isomorphic + 단일+다중책임 spectrum 양쪽 corroboration = 단계 5 신뢰도 자격.

### 부정

- ❌ patterns_extension_v3 = MyBatis 3+ 한정 / iBATIS 2 stack 부적합 (별도 axis).
- ❌ Modern Spring/MyBatis 3 PoC 측정 부재 → patterns_extension_v3 corroboration carry (Phase 3 / v2.4 후보).

### 중립

- patterns_extension_v3 / sub-rule 양쪽 optional → 사용자 선택 가능 / 강제 ❌.

---

## §6. 참조

- DEC-2026-05-12-v2.3.0-scope-결단 ( 본 ADR Phase 2 scope origin)
- DEC-2026-05-12-v2.3.0-final ( 본 ADR 절차 통합 종결 / commit + git tag v2.3.0)
- ADR-CHAIN-009 (Gartner TIME SQL 단위 보류 / migration_priority 채택 / Phase 1 origin)
- ADR-CHAIN-008 (paradigm-cross 정책 완화 / 5 PoC isomorphic robust strong)
- methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md ( 본 ADR §2 자산화 결과)
- methodology-spec/deliverables/24-sql-inventory.md (patterns_extension_v3 cross-link / §6 보강)
- PoC #06 + PoC #07 antipatterns.json ( 본 ADR §2 5 AP isomorphic 자료)
- MyBatis 3 공식 docs (mybatis.org/mybatis-3/sqlmap-xml.html + configuration.html)
- Maldonado & Shihab 2015 (KL-SATD 외부 권위)
- Agent 1 + Agent 2 research (2026-05-12 / 가벼운 sub-agent 전략)
