# plan — RealWorld JPA dogfood (2nd corroboration arm)

> **★ 진행 상태 (2026-05-30)**: (a) codegraph 3세대 측정 = **완료** (probe #3 / JPA 효용 최상 / DEC-2026-05-30-codegraph-probe-3-jpa). (b) §8.1 chain-gap corroboration = **사용자 결단 "(a)만 정리하고 멈춤" → 미실행 / 별도 세션 carry**. 보류 패치(F-DOGFOOD-003/007) 잠금 **미해제**. 재개 시 = 본 plan §3 step 3~9 (analysis baseline + chain 1~5) 시행.

> **목적 (2축)**: ① codegraph **3세대 persistence 측정 완성** (iBATIS2=0 / MyBatis3=cover / **JPA=?**) — DEC-2026-05-30 LL-codegraph-09 확장. ② chain gap **§8.1 ≥2 corroboration** 확보 → 보류된 paradigm 패치 (F-DOGFOOD-003 intent 과잉귀속 / F-DOGFOOD-007 brownfield RED) 잠금 해제 자격.
> **통제 실험 설계**: 도메인(RealWorld 19 endpoint / 동일 BC) **고정** + persistence layer 만 **변수**(MyBatis XML → Spring Data JPA). 1st arm(MyBatis) 과 1:1 대조.

## 1. 대상 (확정)

| 항목 | 값 |
|---|---|
| repo | `1chz/realworld-java21-springboot3` @ `93e018e9a769dadae5a80b922d649bd7c79545cd` |
| stars / license | 192 / MIT (OSS — 격리 의무 ❌ / LL-codegraph-07 비적용) |
| 스택 | **Java 21 LTS** / Spring Boot 3 / **Spring Data JPA** (XML mapper 없음) / H2 / Gradle Kotlin DSL **멀티모듈**(module/ + server/) |
| paradigm | Modern (R1' ~60~67%) |
| 선정 근거 | Java 21 = codegraph tree-sitter parse-safe (raeperd Java25/SB4 = bleeding-edge parse 리스크 회피) / 순수 JPA = MyBatis XML 과 깨끗한 대비 / active+MIT |
| confound (정직) | Java 11→21 + SB 2.6→3 + 멀티모듈 = 버전 gap (persistence 변수에 부수). codegraph 측정은 persistence 추출 signal 이 목표라 영향 제한적이나 명시. |

## 2. 작업 위치

- clone: `~/Documents/Developments/AI/_dogfood-realworld/realworld-java21-springboot3/` (MyBatis arm 의 sibling / 같은 parent).
- 산출물: `<위>/.aimd/output/`. input.json + findings/.
- ★ 등록 working-dir 밖 → git clone + write 시 permission prompt 가능 (사용자 승인 / 또는 settings 추가).

## 3. 파이프라인 (1st arm 과 동일 절차 / ★ codegraph 누락 재발 금지)

1. **clone** (shallow depth=1 @ pinned SHA).
2. **input.json** 작성 (스택/scope/track/surface).
3. **analysis baseline** — 10 phase (template-analyze skip / ui N/A). schema-valid 의무. (db-schema = JPA @Entity → schema.json/erd / sql-inventory = JPA derived query + @Query)
4. **chain 1 discovery** → gate #1 (full-baseline scope / MyBatis arm 대조).
5. **chain 2 spec** → gate #2.
6. **chain 3 plan** → gate #3.
7. **chain 4 test** → gate #4 (brownfield RED 해석 = A 방식 정직 / F-DOGFOOD-007 재현 관찰).
8. **chain 5 implement** — Java/Gradle 환경 부재 시 env-blocked 정직 (no-simulation / F-DOGFOOD-008 동형 예상).
9. **dep-graph** — artifact-graph 합성 + navigate/impact + code-pointer coverage 실측.
10. **★ codegraph** — `codegraph init -i` → **JPA layer 효용 측정** (아래 §4) + compare doc. ★ F-DOGFOOD-011 절차 누락 직접 교정 = 명시 단계.

## 4. codegraph JPA 측정 가설 (3세대 핵심)

JPA 는 SQL 이 코드에 없음 — 바인딩 메커니즘이 또 다름:
- **@Entity / @Table** → table 노드? (MyBatis 는 table ❌ 였음 — JPA 는 @Entity 가 class 노드이자 table 매핑이라 다를 수 있음)
- **Spring Data Repository interface** (`extends JpaRepository<Article,Long>`) → interface 노드 + 메서드.
- **derived query method** (`findBySlug`, `findByAuthorAnd..`) → 메서드명이 곧 쿼리 (string literal ❌ / 메서드 시그니처). codegraph 가 이 메서드를 노드화하고 service↔repository 바인딩하는지.
- **@Query("...JPQL...")** → string literal JPQL (iBATIS 2 string 한계와 유사할 가능성 / 측정).
- 가설: **route→controller→service→repository(interface 메서드) ⭐⭐⭐** 까지는 MyBatis 와 동급 이상 / **JPQL string @Query 는 ❌ 가능** / **@Entity→table 매핑은 MyBatis 보다 나을 수** (entity=class 노드). → end-to-end 가 MyBatis(⭐⭐) 대비 어떻게 나오나.

## 5. 측정 산출 (2 finding 축)

- **codegraph**: `codegraph-jpa-probe.md` — layer 별 효용표 (iBATIS2 / MyBatis3 / **JPA** 3열 비교) + DEC-2026-05-30 §2.2 표 확장.
- **chain gap corroboration**:
  - F-DOGFOOD-003 (intent 과잉귀속) JPA 에서 재현? → 재현 시 §8.1 ≥2 충족 → `intent_certainty` enum 패치 자격.
  - F-DOGFOOD-007 (brownfield RED) JPA 에서 재현? (brownfield 자명 — impl 존재) → ≥2 충족 → brownfield 모드 paradigm 결단 자격.
- finding namespace = `F-JPADOG-*` (1st arm = F-DOGFOOD-*, 분리). 또는 공통 dogfood 누적 — 결단 필요.

## 6. 본 레포 영향
- methodology body 변경 ❌ (산출물 전부 외부 _dogfood / 본 plan + 측정 후 DEC/finding 만).
- self-referential drift 회피 — 패치는 corroboration 확보 후 별도 결단.

## 7. 4원칙 적용 노트
- 본 작업 = dogfood RUN (방법론 적용) ≠ 방법론 body 설계 변경. → 3-agent 토론 무거운 ladder 불필요 (방법론은 고정 / 1st arm 에서 절차 입증됨). target 선정 research(§1) = 본 plan 의 2원칙 대체.
- 실패 시 (analysis schema RED / codegraph parse 실패 등) = revert + LL 기록 + 재시도.

## 8. 예상 carry (정직)
- chain 5 GREEN = Java21/Gradle 환경 의존 (env-blocked 예상 / 1st arm 동형).
- static-security/baseline = Windows 도구 부재 deferred (R19 Tier 2).
- 멀티모듈 = analysis input scope 결단 (module/ + server/ 전체 vs server/ 만).
