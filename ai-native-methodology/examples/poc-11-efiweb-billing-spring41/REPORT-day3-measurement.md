# PoC #11 (EFI-WEB billing) REPORT — Day 3.5 종결 측정 결과

> 2026-05-12 / 4축 metric 모두 측정 / ★ ★ ★ 3 사내 PoC isomorphic 자격 ★ 충족 + R1 가설 ★ 반증 critical finding + sub-rule v1.1 본체 보강 (v2.3.2 PATCH release `ba3ed82`).

---

## 1. ★ ★ ★ 4축 metric 종합 (★ plan 2차 §3-A + §3-B + phase 4.7 + SQL Inventory)

| 축 | metric | plan 2차 expectation | **PoC #11 실측** | 자격 |
|---|---|---|---|---|
| **§3-A 분석 자동화율** | 4 산출물 평균 auto_ratio | 25~40% | **52.5%** (+12.5%p above) | ✅ ★ ★ ★ **R1 가설 ★ 반증** (★ critical methodology finding) |
| **§3-B 설계 자동화율** | planning-extraction-validator | ≥ 90% / 0 critical | **0 findings + UC 100%** | ✅ ★ ★ pass |
| **phase 4.7 acceptance oracle** | named_classified_ratio | 88~95% Day 1 / 100% Day 2.5 후 | **93.3% Day 2 + 93.3% Day 2.5 보존 (★ ambiguous 유지)** | ✅ ★ pass (★ ≥ 80% threshold + ≥ 88% plan 2차 expectation) |
| **SQL Inventory coverage** | auto extraction ratio | ≥ 50% / 66.7% (3 사내 PoC isomorphic) | **66.7%** (★ ★ ★ 3 사내 PoC isomorphic ★ robust) | ✅ ★ ★ ★ corroboration #3 사내 PoC |

★ ★ ★ ★ **4축 모두 pass** (★ §3-A R1 가설 ★ 반증 = critical methodology finding 동시 확보).

---

## 2. ★ ★ ★ §3-A 자동화율 분해 — 52.5% (R1 가설 반증 / R1' 정립 trigger)

| 산출물 | auto_ratio | PoC #06 baseline | PoC #07 baseline | 본 PoC 차이 vs PoC #06 |
|---|---|---|---|---|
| inventory.json | 70% | 60% | 75% | +10%p |
| domain.json | 50% | 44% | 50% | +6%p |
| rules.json | 50% | 29% | 50% | +21%p |
| antipatterns.json | 40% | 22% | 40% | +18%p |
| **평균** | **52.5%** | 38.75% | 53.8% | **+13.75%p** |

★ ★ ★ **scale 분포** (PoC #11 257 LOC < PoC #06 345 LOC < PoC #07 3752 LOC) vs **자동화율 분포** (PoC #06 38.75% < PoC #11 52.5% ≈ PoC #07 53.8%) ★ **불일치** → R1 가설 ★ ★ **반증**.

### 2-A. R1' 정립 사실 (★ sub-rule v1.1 §X 등재)

★ ★ ★ **Spring 4.1+iBATIS 2 paradigm = §3-A automation ceiling ~53~55%** (3 사내 PoC isomorphic / scale 무관).

**R1' (revised)**: paradigm × 책임 × trivially deterministic 효과 복합 → ceiling 형성.

★ ★ ★ **외부 권위 STRONG 정합** (3 light sub-agent F-015 cross-validation / plan h-r1-revisit-research.md):
- Zhang ICSE 2025 (arxiv 2406.09834v3) — legacy DUR 70~90% vs up-to-date 9~18% (★ R1' paradigm 방향)
- LongCodeBench (arxiv 2505.07897v3) — Claude 3.5 Sonnet 32K→256K 29%→3% (★ R1' scope 효과)
- Context Length Alone Hurts (arxiv 2510.05381v1) — input 길이 단독 변수 13.9~85% 저하
- Gartner Application Innovation Summit 2025

★ ★ paradigm modernization 시 ceiling 돌파: PoC #08 MyBatis 3 = 66.7% / PoC #09 NestJS TypeORM = 63.6% / PoC #10 Spring Data JPA = 60%.

---

## 3. §3-B 설계 자동화율 — chain 1 planning-extraction-validator pass

```
$ node tools/planning-extraction-validator/src/cli.js \
    --planning examples/poc-11-efiweb-billing-spring41/.aimd/output/planning-spec.json \
    --rules examples/poc-11-efiweb-billing-spring41/input/rules.json \
    --domain examples/poc-11-efiweb-billing-spring41/input/domain.json
[planning-extraction-validator] 0 findings (critical: 0, high: 0)
UC coverage: 100.0%
```

★ ★ ★ **0 findings + UC coverage 100% / gate #1 PASS** (4/4 UC entry 모두 cover).

신뢰도 = **0.82** (작은 단일책임 / cross-DB SP 본문 carry / 결제 도메인 expert carry / scale 작아 use_cases 0.90 정확).

---

## 4. phase 4.7 (characterization) 세 번째 적용 — ★ ★ ★ 3 사내 PoC spectrum 강화

### 4-A. 측정 결과 비교 (3 사내 PoC isomorphic)

| 측정 항목 | PoC #06 단일 (345 LOC) | **PoC #11 작은 단일 (257 LOC)** | PoC #07 다중 (3752 LOC) |
|---|---|---|---|
| BR 총 | 7 | **8** | 15 |
| AP 총 | 10 | **13** | 12 |
| 분류 합계 | 17 | **15** (UC 4 × 분류 + 5 BR 일부) | 27 |
| ambiguous (Day 2 초안) | 3 | **1** (BR-BILLING-006) | 2 |
| named_classified_ratio (Day 2) | 14/17 = 0.82 | **14/15 = 0.933** | 25/27 = 0.926 |
| named_classified_ratio (Day 2.5 후) | 17/18 = **0.94** | **14/15 = 0.933 보존** (★ 사용자 결단 ambiguous 유지) | **27/27 = 1.000** |
| self_recognized SATD | 1 | **0** (★ ★ ★ single-case strict ❌ / Agent 1 cross-validation 해석 정정 carry) | 4 |
| snapshot count | 3 | **4** | 7 |
| scenario count | 10 | **6** | 13 |
| UC coverage | 0.43 | **1.0** (★ ★ ★ scale 작아 전수 cover) | 0.4375 |

### 4-B. ★ ★ ★ 4 spectrum 모두 ≥ 93% 자격 사실 (DEC-CHAIN-006 §2 정합 강화)

| spectrum | named_classified_ratio (D2.5 후) | snapshot count |
|---|---|---|
| Modern (PoC #03 NestJS retrofit) | 30/30 = 100% | 7 |
| Legacy 단일책임 (PoC #06 exchange) | 17/18 = 94% | 3 |
| **★ Legacy 작은 단일책임 (PoC #11 billing)** | **★ 14/15 = 93.3%** | **4** |
| Legacy 다중책임 (PoC #07 capital) | 27/27 = 100% | 7 |

→ ★ ★ ★ ★ **4 spectrum 모두 ≥ 93% / 2 spectrum 100% 도달** = ★ ★ DEC-CHAIN-006 §2 "단일 prompt 양 spectrum 동작" 정합 ★ 강.

### 4-C. ★ R1' 정합 — 작은 scope = trivially deterministic 효과

- 본 PoC = 4 UC × 6 scenario × 1 ambiguous (★ ★ 사용자 결단 유지) = ★ ★ trivially deterministic + 작은 scope = ambiguous ↓
- ★ §3-A 자동화 (52.5%) ↔ phase 4.7 acceptance oracle (93.3%) ★ 양면 정합

---

## 5. ★ ★ ★ SQL Inventory ≥ 3 사내 PoC isomorphic 자격 ★ 충족

```
$ node tools/sql-inventory-extractor/src/cli.js \
    --target examples/poc-11-efiweb-billing-spring41/sql-inventory/
[sql-inventory-extractor] 0 findings (critical: 0, high: 0, medium: 0)
inventory: 6 records
auto_ratio_external_6: 66.7% (threshold 50%)
statement_type distribution: PREPARED=6 / CALLABLE=0 / STATEMENT=0
carry_flags total: 8
```

### 5-A. ★ ★ ★ 3 사내 PoC SQL Inventory isomorphic 자격 사실

| metric | PoC #06 (corroboration #1) | **PoC #11 (corroboration #3 ★ 신규)** | PoC #07 (corroboration #2) | 정합 |
|---|---|---|---|---|
| 외부 6 컬럼 자동화 | 4/6 = 66.7% | **4/6 = 66.7%** | 4/6 = 66.7% | ★ ★ ★ 3 사내 PoC isomorphic / scale 무관 |
| 본 추가 4 컬럼 | ✅ | ✅ | ✅ | ✅ schema isomorphic |
| AP-{X}-005/006 신규 등재 | AP-EXCHANGE-011 (0건) | **AP-BILLING-005 (★ 강화 4 차원)** | AP-CAPITAL-012 (0건) | ★ ★ Spring 4.1 + iBATIS 2 spectrum 강화 |

★ ★ ★ ★ **sub-rule v1.1 §3 표 강화 등재 trigger** (★ C-v2.2.0-spring41-ibatis2-subrule ✅ resolved / v2.3.2 PATCH release).

### 5-B. migration_priority P0~P3 분포 (★ v2.3.0 12번째 컬럼)

| priority | SQL | reason |
|---|---|---|
| P0 (즉시) | insertConfirmHistoryData + insertConfirmData + deleteConfirmData | ★ ★ ★ critical / 비트랜잭션 + cross-DB + 데이터 무결성 risk |
| P1 (단기) | insertConfirmHistory + selectConfirmDataCount | SCOPE_IDENTITY portability + WITH NOLOCK + TOCTOU |
| P2 (중기) | selectDataConfirmList | read-only + T-SQL 종속 4 차원 / 환자 시 복잡 |
| P3 (장기) | (없음) | — |

→ ★ ★ **50% P0** (3/6) = billing modernization = ★ ★ @Transactional + cross-DB 추상화 + Optional<DTO> 의무.

---

## 6. ★ ★ AP isomorphic 5종 sub-rule (v1.1 §3 정합)

| AP isomorphic 5종 | PoC #06 단일 | PoC #11 작은 단일 | PoC #07 다중 | corroboration |
|---|---|---|---|---|
| Map<String,Object> 강제 캐스팅 | AP-EXCHANGE-001 | **AP-BILLING-002** | AP-CAPITAL-002 | ★ ★ ★ 3 사내 PoC |
| Anemic Service | AP-EXCHANGE-002 | ★ N/A (★ thin Service / 단, saveDataConfirm transaction logic 보유 / 형식상 다름) | AP-CAPITAL-003 | ★ 2 PoC (PoC #11 scope 효과 형식상 다름 / R1' 정합) |
| WITH(NOLOCK) 무차별 | AP-EXCHANGE-004 | **AP-BILLING-005 (★ ★ ★ 강화 4 차원)** | AP-CAPITAL-004 | ★ ★ ★ 3 사내 PoC + PoC #11 SCOPE_IDENTITY + getDate + UDF 추가 강화 |
| 공유 SQL 조각 부재 | AP-EXCHANGE-011 | ★ N/A (★ 6 SQL 만 / 4 SQL WHERE 절 동일 DRY violation patterns_extension_v2) | AP-CAPITAL-012 | ★ 2 PoC (PoC #11 scope 효과 등급 차이) |
| 자조 SATD | AP-EXCHANGE-007 | ★ N/A (SATD 0건 / ★ single-case + 작은 모듈 + 잠복 기간 미경과 / Agent 1 해석 정정 carry) | AP-CAPITAL-008+009 | ★ 2 PoC (KL-SATD 패턴) |

★ ★ ★ **5종 중 2종 (Map + WITH NOLOCK) 3 사내 PoC corroboration / 3종 (Anemic + 공유 SQL 부재 + SATD) 2 PoC corroboration + R1' scope 효과 정합 형식상 다름** = sub-rule v1.1 **단계 5 강 (90~95%)** 자격 충족.

---

## 7. ★ ★ AP novel 8종 (작은 단일책임 spectrum + 결제 도메인)

| AP | severity | spectrum 특성 |
|---|---|---|
| ★ ★ ★ AP-BILLING-001 | critical | @Transactional ❌ saveDataConfirm 4 SQL 비원자성 (★ 결제 데이터 무결성 critical) |
| AP-BILLING-003 | low | unused import dead code (ConnectService + DataService) |
| AP-BILLING-004 | medium | param 사후 변경 input/output mix |
| AP-BILLING-006 | critical | cross-DB FQCN hardcoded (FIM + SGERPMA / 3 DB minimum) |
| AP-BILLING-007 | medium | recursive CTE T-SQL 한정 |
| ★ AP-BILLING-009 | high | XSS risk HTML concat (raw insert) |
| AP-BILLING-010 | medium | 시작년도 2015 hardcoded magic year |
| ★ ★ ★ AP-BILLING-011 | critical | 법인 COM_NO==2 hardcoded business logic in view (★ ★ ambiguous BR-BILLING-006 동반) |
| AP-BILLING-013 | medium | 외부 BI URL hardcoded `datacafe.smilegate.net` |

★ ★ ★ **novel 8 + isomorphic 5 = 총 13 AP** (★ PoC #06 10 / PoC #07 12 / 작은 scope BUT critical 다수 = 결제 도메인 risk + cross-DB + hardcoded surface).

---

## 8. ratchet baseline write (v2.1.1 + v2.3.1 mirror)

- ★ `examples/poc-11-efiweb-billing-spring41/.aimd/baseline/characterization-coverage.json` ✅ write (★ ★ ratchet 100% / 사내 PoC 3번째)
- ★ ★ SQL Inventory baseline = `extraction_automation.auto_ratio_baseline: 0.667` / trend: stable (★ 3 사내 PoC robust)

---

## 9. ★ ★ ★ 본 PoC critical methodology findings (★ ★ Day 3.5 종결 시 권고)

### 9-A. ★ ★ ★ R1 가설 반증 → R1' 정립 (★ 본체 sub-rule v1.1 §X 등재 ✅ resolved)

- DEC-2026-05-12-r1-가설-revisit (★ critical / R1 → R1' transition)
- DEC-2026-05-12-sub-rule-v1.1-갱신 (★ ★ sub-rule §X 신규 / 외부 권위 보강)
- v2.3.2 PATCH release `ba3ed82` (★ git tag v2.3.2 / origin push ✅)

### 9-B. ★ ★ ★ KL-SATD 인용 오류 정정 (★ Agent 1 cross-validation)

- "Korean Language" → "Keyword-Labeled" (SQJ 2024 DOI 10.1007/s11219-023-09655-z)
- sub-rule v1.1 §AP-005 정정 완료

### 9-C. ★ ★ in-place read 정책 채택 (★ DEC-2026-05-12-in-place-read-정책-채택)

- 사내 PoC = in-place read / 외부 OSS PoC = clone 보존
- 본 PoC #11 = 첫 적용 / source_root_absolute reference

---

## 10. ★ Day 3.5 carry 종합

### resolved by 본 PoC

- ~~C-in-place-read-policy~~ ✅ (commit `8e8413e` / DEC 등재)
- ~~C-r1-hypothesis-revisit~~ ✅ (sub-rule v1.1 §X 등재 / v2.3.2 PATCH)
- ~~C-automation-ceiling-paradigm~~ ✅
- ~~KL-SATD 인용 오류~~ ✅
- ~~iBATIS 2 dynamic tag sub-classification~~ ✅ (v2.3.1 PATCH 정합)
- ~~C-v2.2.0-spring41-ibatis2-subrule~~ ✅ (★ ★ ★ 3 사내 PoC isomorphic 자격 ★ 충족)

### 신규 carry (★ Day 3.5 종결 시 신설)

- ★ ★ ★ **C-domain-PoC11-1** (★ 결제 도메인 expert / BR-BILLING-006 ambiguous COM_NO==2 hardcoded 재검증 의무)
- ★ ★ **C-domain-PoC11-2** (BR-BILLING-005 시작년도 2015 의미 확인)
- ★ **C-domain-PoC11-3** (Qlik Sense appid/sheet 운영 체계)
- ★ ★ C-poc-11-0-satd-해석-정정 (★ Agent 1 cross-validation 기반 / single-case + 잠복 기간 미경과 해석 명시)
- ★ C-poc-11-source-디렉토리-cleanup (★ examples/poc-11-efiweb-billing-spring41/source/ 4 빈 디렉토리 / 낮은 우선순위)
- C-egovframework-sub-rule (★ Modern stack sub-rule 본격 자산화 시)
- C-PoC07-1~3 (chain 3 영역 / billing 도 동일 carry 정합 / 별도 chain 3 진입 시)
- C-r1-prime-자격-Modern-corroboration (★ Modern stack sub-rule R1' ceiling ~60~67% 명문화)

---

## 11. ★ ★ §8.1 strict 단일 PoC 과적합 회피 강제

| 자격 | 검증 | 결과 |
|---|---|---|
| ≥ 3 사내 PoC isomorphic SQL Inventory | PoC #06 + PoC #07 + ★ PoC #11 / 66.7% × 3 | ✅ ★ ★ ★ 충족 |
| patterns_extension_v3 적용 | sub-rule v1.1 §X 등재 | ✅ |
| ratchet baseline write | `.aimd/baseline/characterization-coverage.json` | ✅ |
| AP isomorphic | 5종 (Map + NOLOCK + Anemic + 공유 SQL 부재 + SATD) | ✅ ★ 2종 3 PoC + 3종 2 PoC corroboration |
| 본체 격상 자격 | ✅ ★ ★ v2.3.2 PATCH release (sub-rule v1.1 minor 본문 보강 + DEC 3건) | ✅ |

★ ★ §8.1 strict pass + ≥ 2 PoC corroboration 의무 충족 (★ 사실 = ≥ 3 사내 PoC).

---

## 12. ★ ★ 종결 조건 판정 (PoC #06+#07 패턴)

- **(a) PoC #11 정식 등재** ★ ★ ★ ★ **충족** — 4축 metric 4/4 pass + 3 사내 PoC isomorphic 자격 충족 + C-v2.2.0-spring41-ibatis2-subrule resolve + R1 가설 반증 critical methodology finding + sub-rule v1.1 본체 보강 ✅
- (b) prelim 보존 ❌
- (c) scope 외 회수 ❌

→ ★ ★ ★ **(a) 정식 등재** 결단 의무 — DEC-2026-05-12-poc-11-종결 신설.

---

## 13. 참조

- DEC prelim: DEC-2026-05-07-poc-11-prelim-신설.md
- DEC 종결: DEC-2026-05-12-poc-11-종결.md (★ 본 REPORT 후 신설)
- plan 1차: `~/.claude/plans/d-poc-11-billing.md`
- plan 2차: `~/.claude/plans/d-poc-11-billing-2.md` (★ §5-A + §5-B + §19 R1 revisit)
- plan h: `~/.claude/plans/h-r1-revisit-본체-검토.md` (★ 본체 검토)
- research h: `~/.claude/plans/h-r1-revisit-research.md` (★ 3 sub-agent F-015)
- DEC in-place: DEC-2026-05-12-in-place-read-정책-채택.md
- DEC r1: DEC-2026-05-12-r1-가설-revisit.md
- DEC sub-rule v1.1: DEC-2026-05-12-sub-rule-v1.1-갱신.md
- v2.3.2 PATCH release commit `ba3ed82` (★ origin push ✅ / git tag v2.3.2)
- 본 PoC: examples/poc-11-efiweb-billing-spring41/ (input + sql-inventory + characterization + .aimd/output + .aimd/baseline)
- 4원칙: CLAUDE.md §"Work Principles (4원칙)"
- sub-rule v1.1: `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md`
