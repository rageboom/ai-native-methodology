# PoC #07 prelim — EFI-WEB capital (corroboration #3 / 다중책임 + SQL Inventory placeholder)

> 2026-05-07~08 / 등재 = `decisions/DEC-2026-05-08-poc-07-prelim-신설.md`
> **prelim 단계** — chain 1 만 측정 (chain 2~4 미진입). v2.1.1 PATCH (ratchet trend) 후 첫 PoC.
> **corroboration #3** = Spring 4.1 + iBATIS 2 같은 spectrum 강화 (PoC #06 exchange 단일책임 38.75% vs PoC #07 capital 다중책임 ~50% 비교 사실 확보)
> **신규 deliverable #24 후보 (SQL Inventory) 측정** — Opus 4.7 외부 조언 (외부 6 + 본 추가 4 = 10 컬럼) 본 PoC 한정 placeholder
> **SQL Inventory corroboration #2** (DEC-2026-05-08-poc-06-sql-inventory-retrofit 가 #1 / capital 도착 시 #2 자연 충족 → §8.1 strict ≥ 2 PoC isomorphic 자격)

## 의도

EFI-WEB (사내 IFRS 회계 시스템 / Spring 4.1.2 + iBATIS 2 + JSP 248) 의 **다중책임** 모듈 `smilegate.ifrs.capital` (자본 환산 / **3752 Java LOC** = exchange 의 ~10배) 를 추려 다음 4축 동시 측정:

1. plan §3-A 분석 자동화율 — capital 다중책임 추정 50% ± 10%p
2. plan §3-B 설계 자동화율 — chain 1 planning-extraction-validator 통과
3. phase 4.7 (characterization) acceptance oracle — 다중책임 → ambiguous ↑ 예상 / ≥ 80% 자격
4. **SQL Inventory coverage** (외부 조언 흡수 / 신규 deliverable #24 후보) — 자동 추출 ≥ 50% / 매뉴얼 ≤ 50%

## scope

### 포함

- analysis 4종 (rules / domain / antipatterns / inventory)
- **SQL Inventory 10 컬럼 placeholder** (`sql-inventory/sql-inventory.{json,md}`) — 외부 6 + 본 추가 4 (uc_link / intent_vs_bug_classification / confidence / carry_flags)
- phase 4.7 (snapshot + intent-vs-bug + coverage) — 단일 prompt 양 spectrum 정합
- chain 1 (planning-spec + validator)

### 명시적 제외 (R3 boundary 흐림 회피)

- chain 3 영역 (DAO + DB 통합 테스트 / Testcontainers) — `C-PoC07-1` carry
- chain 3 영역 (MockMvc Replay 테스트) — `C-PoC07-2` carry
- chain 3/4 영역 (DBUnit / @Sql 픽스처) — `C-PoC07-3` carry
- chain 2~4 본격 진입
- 다중 모듈 (51K LOC 전체)
- **본체 격상 ❌** — 사용자 D11 결단 (b) ≥ 2 PoC isomorphic 후 v2.2.0 (§8.1 strict 의무 / 14차 retract 회피)

## 적대성 측정 (PoC #06 mirror)

| 축         | 사실                                        | 적대성    |
| ---------- | ------------------------------------------- | --------- |
| 프레임워크 | Spring 4.1.2 (Boot ❌)                      | 극상      |
| ORM        | iBATIS 2 raw SQL                            | 극상      |
| View       | JSP 248 + AUIGrid + 다음에디터              | 극상      |
| 테스트     | **0개**                                     | 극상      |
| 책임       | **다중책임** (vs PoC #06 exchange 단일책임) | 신규 axis |

다중책임 → 다음 신호 예상:

- §3-A 자동화율 ↓ (UC 분기 ↑)
- phase 4.7 ambiguous ↑ (도메인 expert 결단 의무 ↑)
- SQL Inventory dynamic_branch ↑ (multiple `<isNotEmpty>/<isEqual>` 분기)
- exchange 모듈 (capital → exchange.selectExchangeRate / FN_Get_ExcRate 호출) cross-module 의존 (`carry_flags: ["external_call_out_of_scope"]`)

## 작업 시퀀스 (3.5~4일 / 22~25h)

| Day | 작업                                                        | 산출                                                                                          |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 0   | skeleton + 디렉토리 스캔 + SQL grep 1차 (raw-grep.txt)      | DEC prelim + PROGRESS + sql-inventory/raw-grep.txt                                            |
| 1   | source 사본 + analysis 4종 + SQL Inventory 10 컬럼          | input/{4종} + sql-inventory/sql-inventory.{json,md}                                           |
| 1.5 | §3-A 측정 + sql-inventory 자동/수동 비율                    | inventory.json `phase_3a_automation_measurement` + sql-inventory.json `extraction_automation` |
| 2   | phase 4.7 (snapshot + intent-vs-bug + coverage)             | characterization/snapshots/UC-CAPITAL-\*.json + intent-vs-bug.md + coverage.json              |
| 2.5 | D2 ambiguous 도메인 결단 (사용자 묶음 의뢰)                 | DEC-domain-결단 + intent-vs-bug §3 갱신                                                       |
| 3   | chain 1 + validators (ratchet trend baseline write 첫 진입) | .ai-context/output/planning-spec.{json,md} + validator output                                       |
| 3.5 | REPORT + 종결 + carry 3 신규 등재                           | REPORT + DEC-종결 + STATUS + INDEX + C-v2.2.0-{sql-inventory, sql-schema, sql-tool}           |

## 측정 자격 (4축 / Day 3.5 종결)

| 축                          | metric                        | PoC #06 baseline     | PoC #07 자격          |
| --------------------------- | ----------------------------- | -------------------- | --------------------- |
| §3-A 자동화율               | 평균 auto_ratio               | 38.75%               | **50% ± 10%p**        |
| §3-B 설계 신뢰도            | planning-extraction-validator | 0 findings / 100% UC | 0 critical / ≥ 90% UC |
| phase 4.7 acceptance oracle | named_classified_ratio        | 94% (D2 후)          | **≥ 80%**             |
| SQL Inventory coverage      | auto extraction ratio         | (없음 / 첫 측정)     | **≥ 50% auto**        |

D10 처분 — 4축 모두 pass 의무 ❌ / 3/4 pass + 미달 1축 carry 정합.

## 디렉토리

```
poc-07-efiweb-capital-spring41/
├── README.md                       # 본 파일
├── PROGRESS-2026-05-08.md          # 시간순 작업 로그 (Day 0~3.5)
├── source/                         # capital 모듈 사본 (Day 1 / 사용자 위임)
│   ├── java/                       # *.java
│   ├── sqlmap/                     # iBATIS *.xml
│   ├── jsp/                        # *.jsp
│   └── message/                    # i18n properties
├── input/                          # analysis 4종 (Day 1)
│   ├── inventory.json
│   ├── domain.json
│   ├── rules.json
│   └── antipatterns.json
├── sql-inventory/                  # 신규 deliverable #24 placeholder (Day 1)
│   ├── raw-grep.txt                # Day 0 grep 1차 산출 (Mapper id + dynamic + tables)
│   ├── sql-inventory.json          # AI 눈 (10 컬럼 record 배열)
│   └── sql-inventory.md            # 사람 눈 (markdown 표 + 동적 분기 + 자조 코멘트)
├── characterization/               # phase 4.7 (Day 2)
│   ├── snapshots/UC-CAPITAL-*.json # Given/When/Then BDD
│   ├── coverage.json               # ratchet 권장 / trend_required: true
│   └── intent-vs-bug.md            # 4분류 (intent/bug/ambiguous/self_recognized)
└── .ai-context/                          # chain-driver state (Day 3)
    ├── state.json
    ├── baseline/
    │   └── characterization-coverage.json    # legacy 첫 진입 baseline write
    └── output/
        ├── planning-spec.{json,md}
        └── run-log.md
```

## §8.1 strict 단일 PoC 과적합 회피 강제

본 PoC 1개 결과로 본체 격상 결단 ❌:

- 신규 deliverable #24 (SQL Inventory) 본체 격상 = ≥ 2 PoC isomorphic 후 (carry `C-v2.2.0-sql-inventory`)
- schemas/sql-inventory.schema.json 신설 = 동반 (carry `C-v2.2.0-sql-schema`)
- tools/sql-inventory-extractor 신설 = 동반 (carry `C-v2.2.0-sql-tool`)
- phase 4.7 v2.1.0 본체 = ≥ 2 PoC corroboration 이미 충족 (PoC #06 + PoC #03 retrofit) → 본 PoC = 강화 + sub-rule 자격 trigger

본 PoC 의미 = (1) corroboration #3 사실 확보 + (2) 다중책임 모듈 측정 사실 + (3) SQL Inventory placeholder 측정.

## 종결 조건 (Day 3.5 측정 후)

다음 3개 중 1개 (PoC #06 패턴 reuse):

- **(a) PoC #07 정식 등재** — 4축 metric 3/4 이상 pass + corroboration #3 명시
- **(b) prelim 보존** — 측정 부족 / 다음 PoC 재시도
- **(c) scope 외 회수** — capital 부적합 + 다른 모듈 (billing 257 LOC 등) 재시작

## 외부 조언 (Opus 4.7) 6 항목 처분

| #   | 외부 조언                                                           | PoC #07 처분                                                          |
| --- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | SQL 인벤토리 6 컬럼 표                                              | Day 1 정식 측정 (10 컬럼 확장 — 사용자 D9 결단)                       |
| 2   | iBatis XML = 1차 산출물                                             | ✅ Day 1 sql-inventory.md `mapper_xml` + `business_meaning` 자연 흡수 |
| 3   | DAO + DB 통합 테스트 (Testcontainers)                               | scope ❌ — `C-PoC07-1` carry (chain 3 진입 시 sub-rule)               |
| 4   | MockMvc Replay 테스트                                               | scope ❌ — `C-PoC07-2` carry                                          |
| 5   | DBUnit / @Sql 픽스처                                                | scope ❌ — `C-PoC07-3` carry                                          |
| 6   | 도구 버전 가이드 (JUnit 4.12 / Mockito 2.x / Testcontainers 1.15.x) | ✅ Day 1 inventory.json `stack_signals` 자동 추출                     |

## 참조

- plan: `~/.claude/plans/d7-1-d7-2-peaceful-whistle.md`
- 직전 release: DEC-2026-05-07-v2.1.1-ratchet-trend
- 직전 PoC: DEC-2026-05-07-poc-07-poc03-phase7-retrofit (corroboration #2 / Modern)
- 본 PoC 등재: DEC-2026-05-08-poc-07-prelim-신설
- 외부 조언 origin: 사용자 turn 시 Opus 4.7 별도 CLI 의견 (Spring 4.1 + iBATIS 환경 phase 4.7 적용 전략 / SQL 인벤토리 6 컬럼 신규 자산)
