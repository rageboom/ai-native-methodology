# DEC-2026-05-30-codegraph-probe-3-jpa

**결단**: codegraph OSS probe #3 (JPA / Spring Data / RealWorld 2nd arm) 시행 — **3세대 persistence 측정 완성** (iBATIS 2 / MyBatis 3 / JPA). 결과 = **JPA 효용 최상** (JPA ≥ MyBatis 3 > iBATIS 2 / 동인 = 인다이렉션 제거 정도). 본 arm 은 **codegraph probe 만** 시행 (사용자 결단) — value (b) §8.1 chain-gap corroboration (F-DOGFOOD-003/007) 은 **미실행 / 보류 패치 잠금 미해제** (별도 세션 carry). carry queue (DEC-2026-05-27 §5.3) 본격 발동 ❌ — 사실 1건 추가 누적.

**작성일**: 2026-05-30 (probe #2 같은 날 / 사용자 옵션 1 "2nd corroboration arm" 결단 → (a) codegraph 완료 후 (b) 보류 결단).

**relates to**:

- `DEC-2026-05-30-codegraph-probe-2-mybatis3.md` (probe #2 / MyBatis 3)
- `DEC-2026-05-28-codegraph-probe-결과.md` (probe #1 / iBATIS 2) + §5.3 carry queue
- `~/Documents/Developments/AI/_dogfood-realworld/realworld-java21-springboot3/.aimd/output/codegraph-jpa-probe.md` (측정 raw)
- `~/.../realworld-java21-springboot3/.aimd/output/findings/jpa-dogfood-findings.md` F-JPADOG-001
- `~/.claude/plans/plan-realworld-jpa-2nd-arm.md` (본 arm plan)

---

## 1. 배경 (사실 sequence)

1. **2026-05-30** = probe #2 (MyBatis 3) push 직후 사용자 "이제 뭐할까?" → 옵션 제시 → **옵션 1 (2nd corroboration arm)** 결단. 목적 2축 = (a) codegraph 3세대 측정 완성 + (b) chain gap §8.1 ≥2 corroboration.
2. **대상 선정**: 통제 실험 위해 도메인(RealWorld) 고정 + persistence 만 JPA 로 변경. 후보 비교 후 `1chz/realworld-java21-springboot3` 확정 — Java 21 LTS(codegraph tree-sitter parse-safe / raeperd Java25·SB4 bleeding-edge parse 리스크 회피) / 순수 Spring Data JPA(XML mapper 0) / MIT / 멀티모듈 hexagonal. pin `93e018e9`.
3. **(a) codegraph probe 시행** → 완료 (아래 §2).
4. **(b) §8.1 corroboration** = 사용자 결단 **"(a)만 정리하고 멈춤"** → analysis baseline + chain 1~5 **미실행** → F-DOGFOOD-003/007 재현 미확인 → 보류 패치 잠금 **미해제** (별도 세션 carry / 정직 표기).

---

## 2. 결정적 사실 (probe 측정)

### 2.1 인덱싱 통계

```
99 files / 1,365 nodes / 2,726 edges / 710ms
route 19 (REST endpoint 19 정확) / interface 14 / class 63 / method 325
멀티모듈 3계층 (server/api + module/core + module/persistence) cross-module 엣지 정상.
```

### 2.2 3세대 비교표 (SSOT / DEC-2026-05-30-mybatis3 §2.2 확장)

| Layer                              | iBATIS 2 (PoC #15)  | MyBatis 3 (arm 1)       | **JPA (arm 2)**                           |
| ---------------------------------- | ------------------- | ----------------------- | ----------------------------------------- |
| Spring route 추출                  | ⭐⭐⭐              | ⭐⭐⭐                  | ⭐⭐⭐                                    |
| controller→service→repository 체인 | ⭐⭐⭐              | ⭐⭐⭐                  | ⭐⭐⭐ (cross-module)                     |
| 쿼리 정의 노드화                   | ❌ (file 1개)       | ⭐⭐⭐ (XML statement)  | ⭐⭐⭐ (derived query method)             |
| 쿼리↔호출부 바인딩                 | ❌ (string literal) | ⭐⭐ (XML namespace+id) | ⭐⭐⭐ (인다이렉션 0)                     |
| 도메인모델↔persistence             | ⭐                  | ⭐                      | ⭐⭐⭐ (@Entity=class+관계)               |
| 쿼리→DB table                      | ❌                  | ❌                      | ❌                                        |
| end-to-end URL→table               | ⭐                  | ⭐⭐                    | ⭐⭐⭐ (엔티티 class까지) / table 직전 ❌ |

### 2.3 핵심 동인 = 인다이렉션 제거 정도

- codegraph(tree-sitter AST) = 정적 해소 가능 구조에 강함.
- iBATIS 2 runtime string literal(해소 불가/0) < MyBatis 3 XML 1중(해소 가능) < **JPA 순수 Java 인터페이스 메서드+@Entity class(인다이렉션 0/최상)**.
- 3세대 공통 한계 = physical DB table 노드 부재 → 우리 방법론 `schema.json`(erd)+`sql-inventory.json` 이 정확히 보완하는 layer (complementary 3세대 모두 재확인).

### 2.4 측정 한계 (정직)

- 본 repo `@Query` JPQL **0건** (전부 derived query) → "JPQL string 이 iBATIS 2 처럼 끊기는가" 가설 측정 불가 (carry / @Query-heavy repo 필요).
- confound = Java 11→21 + SB 2.6→3 + 멀티모듈 (persistence 변수에 부수 / signal 영향 제한).

---

## 3. carry queue 자격 (DEC-2026-05-27 §5.3 / 변동 ❌)

| 조건                                           | 자격                                  |
| ---------------------------------------------- | ------------------------------------- |
| (a) 외부 사용자 자연 요구 ≥ 1                  | ❌ (0 / R1'·MyBatis3·JPA 사실 누적뿐) |
| (b) codegraph v1.0+ ≥ 6개월 maturity           | ❌ (0.9.7 / 여전히 0.9.x)             |
| (c) PoC ≥ 2 우리 artifact code_pointers[] 채움 | △ 1/2 (본 arm chain 미실행 → 무변동)  |

→ **본격 결합 carry 발동 ❌** / 사실 1건 추가 누적 (probe 3 / 3세대 완성).

## 4. 시행 (본 결단)

- plugin 자산 변경 ❌ (schemas/tools/agents/skills/hooks/methodology-spec 0). pure doc trail.
- 자산 변경: ① 본 DEC ② INDEX head ③ JPA repo `codegraph-jpa-probe.md`+`input.json`+`jpa-dogfood-findings.md`(본 레포 외) ④ plan `plan-realworld-jpa-2nd-arm.md` 갱신.
- release ❌ (CHANGELOG/version/STOP-3 무 / workspace test 영향 0).

## 5. Lessons Learned (자산화 후보)

### LL-codegraph-10 — 인다이렉션 제거 정도 = codegraph 효용 단조 축 (3세대 입증)

iBATIS 2(string/0) → MyBatis 3(XML 1중/cover) → JPA(인다이렉션 0/최상) 3점이 **단조 증가** 입증. **자산화 의무** = "외부 코드 그래프 도구 효용 예측 = persistence 의 query 바인딩 인다이렉션 수로 1차 근사 / 정적(AST) 해소 가능성과 반비례". DB table 경계 미도달은 세대 무관 상수 = 본 방법론 erd+sql-inventory 의 영구 보완 가치 재확인.

### LL-codegraph-11 — corroboration arm 의 부분 시행 결단 (정직)

2nd arm 이 (a) codegraph + (b) chain corroboration 2축이었으나 사용자 (a) 후 중단 결단 → (b) 보류 패치(F-DOGFOOD-003/007) 잠금 **미해제 정직 표기**. **자산화 의무** = "multi-목적 arm 의 부분 시행 시 미달성 목적을 carry 로 명시 / 달성분만 사실 누적 / 잠금 해제 과장 ❌ (self-celebration inflation 회피 / feedback_self_referential_corrective_drift 정합)".

## 6. 한 줄 결론

> codegraph 3세대 측정 완성 — **JPA ⭐최상 ≥ MyBatis 3 > iBATIS 2** (동인 = query 바인딩 인다이렉션 제거 정도 / DB table 경계는 세대 무관 ❌). 본 arm = probe 만 / chain corroboration (b) 보류 → F-DOGFOOD-003/007 잠금 미해제 (carry). 본격 결합 발동 ❌ / 사실 1건 누적.
