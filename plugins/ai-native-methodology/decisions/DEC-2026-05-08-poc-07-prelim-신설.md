# DEC-2026-05-08-poc-07-prelim-신설

> **카테고리**: methodology / PoC 등재 / corroboration #3 / 신규 deliverable #24 (SQL Inventory) placeholder 측정
> **상태**: 진행중 ( prelim — Day 3.5 측정 종료 시 종결 또는 PoC #07 정식 등재)
> **일자**: 2026-05-07 (skeleton) / 2026-05-08~ (실측 / source 가용성 후)
> **선행**: DEC-2026-05-07-v2.1.1-ratchet-trend (직전 release) + DEC-2026-05-07-v2.1.0-release (phase 4.7 본체 격상)

---

## 1. 결단

v2.1.1 PATCH (ratchet trend baseline 자동 검증) 후 **첫 PoC**. EFI-WEB 사내 IFRS 회계 시스템 의 **다중책임** 모듈 `smilegate.ifrs.capital` (3752 Java LOC = exchange 345 LOC × ~10배) 한정 분석 + chain 1 측정 + **신규 deliverable #24 (SQL Inventory) placeholder 측정** ( 외부 6 + 본 추가 4 = 10 컬럼 / 사용자 D9 결단).

PoC #07 **prelim** 등재 — 정식 PoC #07 등재는 Day 3.5 측정 종료 + 4축 metric (3/4 이상 pass) 결과 기반 별도 결단 (종결 조건 §8).

## 2. 배경

- v2.1.0 (2026-05-07) 같은 날 + v2.1.1 PATCH (2026-05-07 / 같은 날) 후 **다음 PoC** = sub-rule 자격 / 다중책임 spectrum 측정 + 외부 조언 흡수 의도
- 사용자 (윤주스 TF Lead) 가 Opus 4.7 별도 CLI 의견 가져옴 — Spring 4.1 + iBATIS 환경 phase 4.7 적용 전략 + SQL 인벤토리 6 컬럼 신규 자산 제안
- 사용자 결단 D7-1-α + D7-2-α + D7-3-α 일괄 승인 (capital 모듈 / SQL 인벤토리 즉시 흡수 / 즉시 진입)
- 사용자 결단 D9 = SQL Inventory 10 컬럼 (외부 6 + 본 추가 4 [uc_link / intent_vs_bug_classification / confidence / carry_flags]) 채택
- 사용자 결단 D11 = release (b) ≥ 2 PoC isomorphic 후 v2.2.0 ( §8.1 strict 의무 / 14차 retract 회피)
- plan = `~/.claude/plans/d7-1-d7-2-peaceful-whistle.md` (ExitPlanMode 승인 / Work Principles 1+2 원칙 정합)

## 3. 측정 대상 (4축 동시)

1. **plan §3-A 분석 자동화율** — capital 다중책임 추정 50% ± 10%p (vs PoC #06 exchange 단일책임 38.75%) 실측 정합 여부
2. **plan §3-B 설계 자동화율** — chain 1 planning-extraction-validator 통과 (0 critical / UC ≥ 90%)
3. **phase 4.7 acceptance oracle** — 다중책임 → ambiguous ↑ 예상 / named_classified_ratio ≥ 80% 자격
4. ** SQL Inventory coverage** ( 신규 deliverable #24 placeholder) — 자동 추출 ≥ 50% / 매뉴얼 ≤ 50%

## 4. scope 제한

### 포함

- `smilegate.ifrs.capital` 모듈 한정 (3752 Java LOC / sqlmap XML / JSP / message)
- analysis 4종 + SQL Inventory 10 컬럼 placeholder + phase 4.7 + chain 1
- v2.1.1 ratchet trend baseline write ( legacy 첫 진입 / `--write-coverage-baseline`)

### 명시적 제외 (R3 boundary 흐림 회피)

- chain 3 영역 (DAO + DB 통합 테스트 / Testcontainers / MockMvc Replay / DBUnit / @Sql) → carry `C-PoC07-1~3`
- chain 2~4 본격 진입
- 다중 모듈 (51K LOC 전체)
- 본체 격상 ❌ (사용자 D11 결단 정합)

## 5. §8.1 strict 단일 PoC 과적합 회피 강제

본 PoC 1개 결과로 본체 격상 결단 ❌:

| 자산                                                                      | 본체 격상 자격                                                                         | carry ID                 |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------ |
| 신규 deliverable #24 (SQL Inventory)                                      | ≥ 2 PoC isomorphic 후 (PoC #07 = #1 / PoC #08 후보 의무)                               | `C-v2.2.0-sql-inventory` |
| `schemas/sql-inventory.schema.json` ( 31번째)                             | 동반                                                                                   | `C-v2.2.0-sql-schema`    |
| `tools/sql-inventory-extractor/` ( workspace 14번째 / Mapper grep 자동화) | 동반                                                                                   | `C-v2.2.0-sql-tool`      |
| phase 4.7 본체 자산 (deliverable 23 + schema + skill + tool + flow + ADR) | ≥ 2 PoC 이미 충족 (PoC #06 + PoC #03 retrofit) → 본 PoC = 강화 + sub-rule 자격 trigger | (기존 v2.1.0 본체)       |

본 PoC 의미 = (1) corroboration #3 사실 확보 + (2) 다중책임 모듈 측정 사실 + (3) SQL Inventory placeholder 측정.

## 6. 외부 조언 (Opus 4.7) 흡수 매핑

| #   | 외부 조언                             | PoC #07 처분                                 | 본 방법론 정합                                                              |
| --- | ------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | SQL 인벤토리 6 컬럼 표                | Day 1 정식 측정 (10 컬럼 확장)               | 신규 deliverable #24 placeholder                                            |
| 2   | iBatis XML = 1차 산출물               | ✅ 자연 흡수 (mapper_xml + business_meaning) | inventory.json source_files 정합                                            |
| 3   | DAO + DB 통합 테스트 (Testcontainers) | scope ❌ — `C-PoC07-1` carry                 | phase 4.7 `data_source_status: "code_only"` 정합 / chain 3 진입 시 sub-rule |
| 4   | MockMvc Replay 테스트                 | scope ❌ — `C-PoC07-2` carry                 | chain 3 영역                                                                |
| 5   | DBUnit / @Sql 픽스처                  | scope ❌ — `C-PoC07-3` carry                 | chain 3/4 인프라                                                            |
| 6   | 도구 버전 가이드                      | ✅ inventory.json `stack_signals` 자동 추출  | 기존 schema 활용                                                            |

## 7. Day 1 진입 차단 — capital source 가용성 의뢰

**사용자 의뢰 (Day 0 entry-2)**:

- EFI-WEB capital 모듈 source 경로 + 사본 위임 (filesystem scan 권한 제한 정합 / 사내 코드베이스 외부 access ❌)
- 권장 위치: `examples/poc-07-efiweb-capital-spring41/source/{java,sqlmap,jsp,message}/`

대안 결단 (사용자 가용성 ❌ 시):

- (i) capital 가용 시 즉시 Day 1 진입
- (ii) 다른 EFI-WEB 모듈 (billing 257 LOC / connect / contract / bod) 으로 대체 (README + 본 DEC scope 갱신)
- (iii) PoC #07 보류 → 다른 우선순위 carry 진입

## 8. 종결 조건 (Day 3.5 측정 후)

다음 3개 중 1개 (PoC #06 패턴 reuse):

- **(a) PoC #07 정식 등재** — 4축 metric **3/4 이상 pass** + corroboration #3 명시 + carry 3 신규 (`C-v2.2.0-sql-{inventory,schema,tool}`) 등재
- **(b) prelim 보존** — 측정 부족 / 다음 PoC 재시도
- **(c) scope 외 회수** — capital 부적합 + 다른 EFI-WEB 모듈 (billing 등) 으로 재시작

## 9. 작업 시퀀스

| Day | 작업                                               | 시간    | 산출                                                        |
| --- | -------------------------------------------------- | ------- | ----------------------------------------------------------- |
| 0   | skeleton + 디렉토리 + DEC + INDEX/STATUS           | ~1h     | DEC-prelim + PROGRESS + README + skeleton                   |
| 0.5 | **사용자 의뢰 — capital source**                   | ⏳ 대기 | (block)                                                     |
| 1   | source 사본 + analysis 4종 + SQL Inventory 10 컬럼 | ~6~8h   | input/{4종} + sql-inventory/{json,md}                       |
| 1.5 | §3-A 측정 + sql-inventory 자동/수동 비율           | ~1h     | inventory.json + sql-inventory.json `extraction_automation` |
| 2   | phase 4.7 (snapshot + intent-vs-bug + coverage)    | ~5~6h   | characterization/{snapshots, intent-vs-bug, coverage}       |
| 2.5 | D2 ambiguous 도메인 결단 (사용자 묶음)             | ~1.5h   | DEC-domain-결단 + intent-vs-bug §3                          |
| 3   | chain 1 + validators + ratchet baseline write      | ~2~3h   | .aimd/output/planning-spec + state.json + baseline          |
| 3.5 | REPORT + DEC 종결 + STATUS + INDEX + carry 3 등재  | ~2h     | REPORT + DEC-종결 + carry                                   |

누적: ~22~25h (3.5~4일).

## 10. 참조

- plan: `~/.claude/plans/d7-1-d7-2-peaceful-whistle.md`
- 외부 조언 origin: 사용자 turn 시 Opus 4.7 별도 CLI 의견
- 직전 release: DEC-2026-05-07-v2.1.1-ratchet-trend
- 직전 PoC: DEC-2026-05-07-poc-07-poc03-phase7-retrofit (corroboration #2 / Modern)
- PoC #06 baseline (mirror 형식): DEC-2026-05-07-poc-06-종결 + DEC-2026-05-07-poc-06-domain-결단
- v2.1.0 phase 4.7 본체: DEC-2026-05-07-v2.1.0-release + ADR-CHAIN-006
- §8.1 strict 의무: 사용자 D11 결단 (b) → ≥ 2 PoC isomorphic 후 v2.2.0
