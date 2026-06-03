# PoC #15 EFI-WEB car — 최종 보고서

> 2026-05-28 / D-axis (artifact-graph e2e) 입증 종결.

## 사용자 핵심 의도 검증

> "산출물이 잘 뽑이고 + 그래프로 잘 연결되어 + 코드까지 연결되는지 확인"

| 검증 영역                         | 결과              | 사실                                                                                |
| --------------------------------- | ----------------- | ----------------------------------------------------------------------------------- |
| **산출물 추출**                   | ✅                | 47 산출물 (46 .json/.md/.yaml/.mermaid + raw-grep.txt) / 모든 schema-validator pass |
| **artifact-graph 합성**           | ✅                | **44 nodes / 109 edges** (chain 30 + analysis **14**) v11.2.0 fix 후                |
| **graph cycle / unknown**         | ✅                | 0 / 0                                                                               |
| **graph orphan**                  | ✅ ✅ ✅          | **0** (v11.2.0 ADR-CHAIN-013 fix 후 / 이전 10 → 0)                                  |
| **code-pointer-validator strict** | ✅ ✅ ✅ **PASS** | **coverage.ratio = 1.0 / missing = 0 / finding = 0**                                |
| Gate #1 (discovery)               | ✅                | discovery-extraction-validator 0 finding / UC coverage 100%                         |
| Gate #2 (spec)                    | ✅                | state.stage='plan' 전이                                                             |

**D-axis 100% 본격 달성** (4/4 axis 모두 pass / 이전 3/4 + carry → 4/4 + carry 0).

## v11.2.0 fix 효과 (F-POC15-S5-004 해소)

본 PoC #15 dogfood 가 발견한 graph-synthesizer 한계는 v11.2.0 MINOR 에서 정식 정정 (ADR-CHAIN-013):

| 차원                   | v11.1.0 (fix 전)           | v11.2.0 (fix 후)                                                                          |
| ---------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| graph nodes            | 42 (analysis 12)           | **44 (analysis 14)** — openapi-extension + db-schema file 명 정합                         |
| graph edges            | 54 (cross_reference 34)    | **109 (cross_reference 89)** — 옵션 A (6 kinds self-ref) + 옵션 B (6 kinds meta fallback) |
| **orphan**             | **10** (analysis 노드 83%) | **0** ✅                                                                                  |
| graph-integrity passed | False                      | **True**                                                                                  |

→ **F-POC15-S5-004 (graph-synthesizer 한계 carry) 정식 해소** / 방법론 v11.2.0 MINOR 본격 격상.

## Step 별 결과 종합

| Step | 작업                                      | 산출물                                  | 검증                                              |
| ---- | ----------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| 1    | 폴더 init + 소스 사본 + chain-driver init | source/ 36 파일                         | state.stage='analysis' ✅                         |
| 2    | analysis stage 11 phase + aspect 4        | 46 .json/.md/.yaml                      | 모든 schema ✅ + PMD/cloc/Spectral 실 실행        |
| 3    | chain 1 discovery + 4 phase               | discovery-spec.{json,md}                | discovery-extraction 0 finding ✅ + UC 100%       |
| 4    | Gate #1 통과                              | state 전이                              | stage='spec' / decision='go' ✅                   |
| 5    | chain 2 spec + artifact-graph + 검증      | behavior + AC + artifact-graph + matrix | code-pointer 100% PASS / graph cycle+unknown=0 ✅ |

## R1' axis 4번째 corroboration (안정점)

| PoC          | auto_ratio_external_6 | LOC      |
| ------------ | --------------------- | -------- |
| #06 exchange | 66.7%                 | 345      |
| #07 capital  | 66.7%                 | 3752     |
| #11 billing  | 66.7%                 | 257      |
| **#15 car**  | **66.7%**             | **1750** |
| **delta**    | **0.0%p**             | —        |

→ **사내 EFI-WEB 4 PoC isomorphic 안정점 입증** (Spring 4.1 + iBATIS 2 paradigm).

## 외부 도구 실 실행 (no-simulation 정합 / 3종)

| 도구         | 버전                        | phase            | 결과                                                    |
| ------------ | --------------------------- | ---------------- | ------------------------------------------------------- |
| **cloc**     | 2.08                        | discovery        | 9,982 code LOC 결정적 추출                              |
| **PMD JSP**  | 7.24.0 (Java 25 / Homebrew) | template-analyze | 14 JSP / 28 violation (파싱 성공 4) + 10 ParseException |
| **Spectral** | 6.16.0                      | api              | 11 warnings / 0 errors / valid OAS 3.0.3                |

시뮬레이션 ❌ / `cross_validation.simulation_only=true` 명시 (formal-spec phase).

## 주요 finding 카테고리 (35+ 누적)

### Critical ()

- AP-FE-001: JSP scriptlet 0-absolute policy 위반 8건 (4 JSP × 2)
- AP-SEC-001: JSP unsanitized expression (XSS) 20건

### High

- AP-API-001: Exception Handler 부재 (negative-space corroboration)
- AP-DB-002: FK CONSTRAINT 명시 부재 (6 own table)
- AP-DB-003: Cross-DB Join 5 DB
- AP-EXT-001: 외부 SP 호출 (SGERP IF)

### Medium

- AP-ARCH-001: DAO package 위치 (Spring 컨벤션 위반)
- AP-DB-001: Composite PK (TB_CAR_COST_SLIP)
- AP-DB-004: Column 의미 중복 (drive_dist ↔ distance)
- AP-DOMAIN-001: HashMap-based DTO paradigm
- F-POC15-CH-002: code_only data_source / domain expert carry
- F-POC15-S5-004: graph-synthesizer 한계 (10 analysis orphan)

## 본 PoC 핵심 anchor

**BR-CAR-COST-003** = 차량비용 → SGERP 회계전표 IF (cross-DB SP):

- carCost.xml `<procedure id="selectCarCostCalculate">` (CALLABLE)
- `EXEC SGERP.dbo.SG_SACSlipRowCarManagementIFQuery (4 param + 3 hardcoded)`
- TB_CAR_COST_SLIP composite PK 등록 (cross-DB FK)
- cross-DB transaction 보장 ❌ → **eventual consistency / saga or outbox 결단 carry**

→ 본 PoC 가 발견한 **가장 큰 마이그레이션 risk**.

## Domain Expert Carry (4 ambiguous BR)

chain 4 (test stage) 진입 전 결단 의무:

- BR-CAR-MGT-003: STATE 코드 값 분포 ('등록' / '사용중' / '처분'?)
- BR-CAR-COST-002: cost_accept_cd enum 값 ('Y' / 'N' / null?)
- BR-CAR-COST-004: NoLog 비용 의미 (회사 단위 통합?)
- BR-CAR-COST-005: CostSumSystem admin role + scope

## SATD self_recognized 3건

- `fn_Get_CarUserListView_2.sql:39` — (임시적용) / 비서 인사발령 예외 (2020)
- `CarMgtDAO.java:138` — TODO Auto-generated method stub
- `CarMgtServiceImpl.java:210` — TODO Auto-generated catch block

→ Legacy 자연 빈도 (Modern PoC #03 NestJS = 0건) corroboration.

## carry / methodology-spec 개선 후보

1. ~~**graph-synthesizer CHAIN_TO_ANALYSIS_REFS 확장**~~ — ✅ **해소 (v11.2.0 / ADR-CHAIN-013)**
2. **drift-validator architecture comparator 신설** — 현 json/mermaid type=unknown
3. **decision-table-validator http_status + error_message null 허용** — lifecycle BR 정합 (본 PoC 학습)
4. **PMD JSP 7.x HTML5 doctype 호환 한계** — 본 PoC 10 ParseException 사실

## 종결 사실 (정직성)

본 PoC = **사용자 핵심 의도 충족 + 부분 한계 명시**. D-axis 본격 입증 (code-pointer 100% strict PASS) + R1' axis 4번째 corroboration 안정 + 도구 영역 한계 (graph-synthesizer carry) 정직 보고. AX (AI Transformation) 마이그레이션의 본격 첫 단계 (analysis + discovery + spec) chain harness 가 실제 사내 legacy 코드 (Spring 4.1 + iBATIS 2 + MSSQL + JSP) 에서 끝까지 작동 입증.

**PoC #15 종결**.
