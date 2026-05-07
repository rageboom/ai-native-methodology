# PoC #08 prelim — MyBatis 3 / `jpetstore-6` (★ paradigm-cross corroboration #1 / weak / 본 방법론 일반화 자격 + sub-rule 자격 입증)

> 2026-05-07 / 등재 = `decisions/DEC-2026-05-07-poc-08-prelim-신설.md`
> ★ **prelim 단계** — 별도 session 첫 plan + research + Day 0 진입 의무 (4원칙 1~3원칙).
> ★ **paradigm-cross corroboration #1** = ★ Senior STOP signal 흡수 (PoC #06+#07 = Spring 4.1 + iBATIS 2 동일 paradigm / scale-cross only) → MyBatis 3 XML 측정으로 paradigm 거리 입증 (★ weak — XML 직계 후속).
> ★ ★ ★ ★ **사용자 정정 2026-05-07** ("MyBatis 는 내가 잘못 넣은 것 같다") → 사내 = iBATIS 2 단일 / MyBatis ❌ → PoC #08 사내 정합 ❌ / **본 방법론 일반화 자격 + MyBatis 3 spectrum sub-rule 자격** 입증용 으로 재정합.
> ★ ★ **source = (b) `mybatis/jpetstore-6`** 공식 reference webapp 결정 (사용자 confirm 2026-05-07 / OSS 공개 / 권위 ★ / 비즈니스 도메인 ★ / 14d cap 안전).

## 의도

★ ★ phase 4.8 (sql-inventory) v2.2.0-rc1 prerelease 본체 격상의 ★ paradigm-cross corroboration carry C-v2.2.0-6a 종결.

**측정 axis 4** (PoC #07 패턴 재사용):

1. plan §3-A 분석 자동화율 — MyBatis 3 modern stack 추정 50% ± 10%p
2. plan §3-B 설계 자동화율 — chain 1 planning-extraction-validator 통과 (0 critical / UC ≥ 90%)
3. phase 4.7 (characterization) acceptance oracle — Modern → ambiguous ↓ 예상 / named_classified_ratio ≥ 80% 자격
4. ★ ★ ★ **SQL Inventory coverage** (★ phase 4.8 본체 자산 / paradigm-cross 자격 측정) — 자동 추출 ≥ 50% (PoC #06+#07 baseline 66.7% 대비 paradigm-cross degradation 수용 범위)

## scope

### 포함

- MyBatis 3 (XML / annotation / 혼용 — 사내 양식 confirm 후 정확 결단) realworld OSS source (별도 plan + sub-agent 검색 의무)
- analysis 4종 (rules / domain / antipatterns / inventory)
- ★ SQL Inventory 11 컬럼 (★ phase 4.8 본체 자산 적용 / `tools/sql-inventory-extractor` MyBatis 3 spectrum 첫 진입)
- phase 4.7 (snapshot + intent-vs-bug + coverage)
- chain 1 (planning-spec + validator)

### ★ ★ 명시적 제외

- chain 2~4 본격 진입 (PoC #07 패턴 정합)
- ★ ★ ★ **본체 격상 ❌** — 사용자 D11 정신 정합 / v2.2.0 final 격상 trigger = PoC #08 + PoC #09 (TypeORM raw SQL) 둘 다 종결 후 (또는 PoC #09 단독)
- DBA 부재 환경 SP 본문 read (carry `proc-body / DBA-read` 정합)

## paradigm 거리 (vs PoC #06+#07 iBATIS 2 XML)

| dimension | iBATIS 2 (PoC #06+#07) | MyBatis 3 (PoC #08) | paradigm 거리 |
|---|---|---|---|
| Mapper 양식 | XML SqlMap (`<dynamic>` / `<iterate>` / `isXxx`) | XML Mapper (`<if>/<choose>/<foreach>`) + annotation (`@Select` 등) | ★ 작음 (XML) / ★★ 중간 (annotation) |
| dynamic SQL | iBATIS 2 전용 태그군 | MyBatis 3 표준화 (OGNL) | ★★ 표준화 차이 |
| `statementType` | ❌ (인식 ❌) | ✅ 표준 컬럼 | ★★ 표준 도구 정합 |
| Spring stack | Spring 4.1 (Boot ❌) | Spring Boot 3.x 가능 | ★★★ |
| 테스트 | 0개 | unit + integration 기대 | ★★★ |

→ ★ paradigm-cross corroboration **자격 강도 = weak ~ medium** (XML 양식 위주면 weak / annotation 위주면 medium / 혼용은 medium). 사내 정합 ★ 강함은 보존.

## 사용자 confirm 2건 ★ resolved (2026-05-07)

본 session 사용자 결단 ✅:

1. **사내 양식** = 사용자 "잘 모르겠어" → source 자체로 자동 처리 ((b) jpetstore-6 XML 위주 → 본 PoC 측정 양식 = **XML 단독** 자동 결정)
2. **realworld OSS source = ★ (b) `mybatis/jpetstore-6`** — 공식 reference webapp / 비즈니스 도메인 / Spring MVC + MyBatis XML 완전 stack / OSS 일반화 자격 ★ 강 / 14d cap 안전

**사용자 정정 흡수**: "MyBatis 는 내가 잘못 넣은 것 같다" → 사내 = iBATIS 2 단일 fact 확정 → PoC #08 사내 ROI ❌ / 본 방법론 일반화 자격 입증용 + sub-rule 자격 입증용으로 재정합.

**후보 (a/c/d) 처분**:
- (a) `mybatis-spring-boot-samples` ❌ (domain ❌)
- (c) gothinkster/realworld fork ❌ (검색 cost + 권위 ❌)
- (d) 사내 후속 신 시스템 ❌ (사내 = iBATIS 2 단일 fact / 신 stack 미정)

## 14d cap (PoC #06+#07 cap 정합)

| Day | 작업 | 산출 |
|---|---|---|
| 0 | (현재) skeleton + DEC prelim + INDEX/STATUS + ★ source 결정 (b) jpetstore-6 + 양식 = XML 자동 + 사용자 정정 흡수 | ✅ |
| 0.5 | ★ 별도 session 첫 진입 — plan + research (사용자 confirm 2건 ✅ resolved) | plan-poc-08-jpetstore6.md + research-poc-08-jpetstore6.md |
| 1~3 | jpetstore-6 git clone + analysis 4종 + ★ SQL Inventory 11 컬럼 | input/{4종} + sql-inventory/{json,md} |
| 3.5 | §3-A 측정 + sql-inventory 자동/수동 비율 | inventory.json + sql-inventory.json `extraction_automation` |
| 4~6 | phase 4.7 (snapshot + intent-vs-bug + coverage) | characterization/{snapshots, intent-vs-bug, coverage} |
| 6.5 | D2 ambiguous 도메인 결단 (사용자 묶음) | DEC-domain-결단 + intent-vs-bug §3 |
| 7 | chain 1 + validators + ratchet baseline write | .aimd/output/planning-spec + state.json + baseline |
| 7.5 | REPORT + DEC 종결 + STATUS + INDEX | REPORT + DEC-종결 |
| 8~14 | (cap 여유 / paradigm-cross corroboration 자격 측정 결과 따라 carry resolve 의무) | C-v2.2.0-6a resolve |

## 종결 조건

다음 3개 중 1개 (PoC #07 패턴 reuse):

- **(a) PoC #08 정식 등재** — 4축 metric 3/4 이상 pass + paradigm-cross corroboration #1 명시 + carry C-v2.2.0-6a resolve
- **(b) prelim 보존** — 측정 부족 / 다음 PoC 재시도
- **(c) scope 외 회수** — source 후보 부적합 + 다른 OSS 또는 사내 신 시스템 으로 재시작

## 다음 PoC 단계

PoC #08 종결 후 우선순위 단계화 (사용자 결단 2026-05-07):
- **PoC #09** (A3 TypeORM raw SQL) — paradigm + platform-cross ★ 강 / **★ v2.2.0 final 격상 trigger 핵심**
- PoC #10 (A2 JPA QueryDSL) — DSL builder paradigm 보강 / v2.3.0 minor

## 참조

- DEC-2026-05-07-poc-08-prelim-신설 (본 PoC prelim 등재 — 작성 의무)
- DEC-2026-05-08-v2.2.0-rc1-prerelease (★ paradigm-cross carry C-v2.2.0-6 origin)
- ADR-CHAIN-007 (★ phase 4.8 sql-inventory + paradigm-cross 우려 명문화)
- DEC-2026-05-08-poc-07-종결 (corroboration #2 / SQL Inventory 11 컬럼 isomorphic 자격 충족)
- DEC-2026-05-08-poc-06-sql-inventory-retrofit (corroboration #1)
