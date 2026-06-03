# DEC-2026-05-30-codegraph-probe-2-mybatis3

**결단**: codegraph OSS probe #2 (MyBatis 3 / RealWorld dogfood) 시행 — `DEC-2026-05-28 §2.3` 미측정 carry ("MyBatis 3 mapper XML cover 여부 = 별도 OSS 측정 의무") **해소**. 결과 = **MyBatis 3 mapper layer cover 됨** (iBATIS 2=0 과 정반대 / 바인딩 메커니즘 차이). carry queue (DEC-2026-05-27 §5.3) 본격 발동 ❌ — 사실 1건 추가 누적 + 절차 finding 1건 (F-DOGFOOD-011) 신설.

**작성일**: 2026-05-30 (RealWorld OSS dogfood chain 5 종결 후 점검 / 사용자 메타 지적 trigger).

**relates to**:

- `DEC-2026-05-28-codegraph-probe-결과.md` §2.3 (MyBatis 3 측정 carry) + §3 carry queue
- `DEC-2026-05-27-codegraph-integration-scope-out.md` §5.3 carry queue
- `~/Documents/Developments/AI/_dogfood-realworld/spring-boot-realworld-example-app/.aimd/output/codegraph-mybatis3-probe.md` (측정 raw)
- `.aimd/output/findings/dogfood-findings.md` F-DOGFOOD-011 (절차 누락 + 측정 결과)

---

## 1. 배경 (사실 sequence)

1. **2026-05-30** = RealWorld OSS(gothinkster/spring-boot-realworld-example-app @ ee17e31 / Spring Boot 2.6.3 / **MyBatis 3**) dogfood 가 analysis baseline → chain 1~5 + 내부 dep-graph(artifact-graph.json) 까지 한 session 관통.
2. **사용자 메타 지적** = "codeGraph(OSS) 도 동작해야 하는데 안 된 게 잘못된 거야" — dogfood 가 내부 dep-graph 만 돌리고 외부 CodeGraph OSS 를 누락한 절차 결함 지적. `input.json:10` isolation_note + DEC-2026-05-28 §2.3 carry 두 신호가 있었음에도 누락.
3. **사후 probe 시행** (사용자 결단 "진행"):
   - `@colbymchenry/codegraph` **v0.9.7** 설치 (PoC #15 probe 는 v0.9.6 / 마이너 bump).
   - `codegraph init -i` 인덱싱 ✅ — 138 files / 2,296 nodes / 4,452 edges / 955ms / 5.46 MB.
   - layer 별 효용 측정 doc 작성 ✅ (`.aimd/output/codegraph-mybatis3-probe.md`).
   - RealWorld = OSS(MIT) / 사내 source 아님 → LL-codegraph-07(격리) 비적용 / 산출물 .aimd/ 내부.

---

## 2. 결정적 사실 (probe 측정)

### 2.1 인덱싱 통계

```
138 files / 2,296 nodes / 4,452 edges / 955ms / 5.46 MB
Nodes by Kind: import 1177 / method 415 / field 250 / class 141 / file 133 /
               namespace 122 / constant 20 / route 19 / interface 16 / enum 1 / enum_member 2
Files by Language: java 122 / xml 11 / properties 3 / yaml 2
```

### 2.2 layer 별 효용 ( iBATIS 2 = PoC #15 / DEC-2026-05-28 §2.2 대비)

| Layer                                  | iBATIS 2 (PoC #15)      | **MyBatis 3 (본 probe)**                                                    |
| -------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| Spring route 추출                      | ⭐⭐⭐                  | ⭐⭐⭐ (route 19 = endpoint 19 정확)                                        |
| Java interface → impl → DAO            | ⭐⭐⭐                  | ⭐⭐⭐                                                                      |
| **XML SQL statement 노드화**           | **❌ (xml=file 1개)**   | **⭐⭐⭐** (`findBySlug`/`selectArticle`/`selectArticleData` → method 노드) |
| **Java 메서드 ↔ XML statement 바인딩** | **❌ (string literal)** | **⭐⭐** (impact/callees 가 Java+XML+resultMap 연결)                        |
| SQL → DB table                         | ❌                      | **❌** (table 노드 부재)                                                    |
| end-to-end URL→table                   | ⭐                      | **⭐⭐** (table 직전까지)                                                   |

### 2.3 핵심 분기 = 바인딩 메커니즘 차이

- **iBATIS 2**: `sqlMapClient.queryForObject("find", ...)` — runtime string literal sqlMap id 참조 → tree-sitter 의미 추론 불가 → 끊김.
- **MyBatis 3**: `<mapper namespace="...Mapper">` + `<select id="find">` ↔ 인터페이스 메서드 `find()` — **구조적 namespace+메서드명 바인딩** (string literal 없음) → AST 해소 가능 → codegraph 가 XML statement 추출 + 인터페이스 연결.
- **잔존 한계** = SQL `from <table>` 의 DB table 노드 부재 (iBATIS 2 와 공통). 우리 방법론 `schema.json`(erd) + `sql-inventory.json`(44 SQL) 이 보완하는 layer = **complementary** 재확인.

---

## 3. carry queue 자격 갱신 (DEC-2026-05-27 §5.3 / DEC-2026-05-28 §3)

| 조건                                 | DEC-2026-05-28 (이전) | 본 DEC (2026-05-30)                                                         | 자격    |
| ------------------------------------ | --------------------- | --------------------------------------------------------------------------- | ------- |
| (a) 외부 사용자 자연 요구 ≥ 1        | 0 (R1' 사실 1건)      | 0 (MyBatis 3 사실 1건 추가)                                                 | ❌      |
| (b) codegraph v1.0+ ≥ 6개월 maturity | 0.9.6 day-8           | 0.9.7 (여전히 0.9.x)                                                        | ❌      |
| (c) PoC ≥ 2 code_pointers[] 채움     | 1/2 (PoC #15)         | 1/2 (본 probe 는 codegraph index / 우리 artifact code_pointers 아님 → 무관) | △ (1/2) |

→ 3 조건 모두 충족 ❌. **본격 carry 발동 ❌**. 단 **§2.3 MyBatis 3 측정 carry 자체는 해소** (사실 누적 paradigm 진전).

---

## 4. 시행 (본 결단)

### 4.1 plugin 자산 변경 ❌

- schemas / tools / agents / skills / hooks / methodology-spec 0 변경.
- 본 DEC = pure doc trail / 사실 1건 누적 + 절차 finding 1건.

### 4.2 자산 변경 list (실 file)

1. `decisions/DEC-2026-05-30-codegraph-probe-2-mybatis3.md` 신설 (본 file).
2. `decisions/INDEX.md` head 추가.
3. `_dogfood-realworld/.../.aimd/output/codegraph-mybatis3-probe.md` 신설 (본 레포 외 / dogfood 산출물).
4. `_dogfood-realworld/.../.aimd/output/findings/dogfood-findings.md` F-DOGFOOD-011 등재 (본 레포 외).

### 4.3 release 시행 ❌

- pure doc trail / plugin 자산 변경 0 → CHANGELOG ❌ / version 3-way ❌ / STOP-3 ❌ / workspace test 영향 0.

---

## 5. Lessons Learned (자산화 후보)

### LL-codegraph-08 — dogfood 절차에 외부 그래프 도구 누락 (체크리스트 부재)

F-DOGFOOD-011 정합. input.json isolation_note + DEC carry 두 신호가 있었음에도 dogfood 파이프라인이 내부 dep-graph 만 돌리고 외부 CodeGraph 를 누락. **자산화 의무** = "외부 코드 그래프 도구(codegraph) 적용 = 내부 dep-graph 와 별개 axis / dogfood·analysis 절차 체크리스트 1 unit". 단 §8.1 — 본체 절차 격상은 ≥2 corroboration 후 (1 dogfood 노출).

### LL-codegraph-09 — persistence framework 세대별 codegraph 효용 분기 (iBATIS 2 ↔ MyBatis 3)

바인딩 메커니즘(runtime string literal ↔ 구조적 namespace+메서드명)이 정적 추출 가능성을 가른다. **자산화 의무** = "외부 OSS 코드 그래프 결합 시 persistence framework 세대(iBATIS 2 / MyBatis 3 / JPA)별 layer 효용 별도 측정 — 단일 'Java legacy' 일반화 ❌". DEC-2026-05-28 LL-codegraph-06(layer 분리 측정) 의 framework-세대 axis 확장.

---

## 6. 한 줄 결론

> codegraph v0.9.7 MyBatis 3 측정 = **mapper XML statement 노드화 ⭐⭐⭐ + Java 바인딩 ⭐⭐ / DB table 경계 ❌** — iBATIS 2(=0)와 정반대(구조적 바인딩 덕). DEC-2026-05-28 §2.3 carry 해소. 본격 결합 carry 발동 ❌ (a·b 조건 미충족) / 사실 1건 누적 + F-DOGFOOD-011 절차 finding.
