# PoC #11 prelim — EFI-WEB billing (★ ★ 사내 ROI 우선 / scale + domain-cross axis / paradigm-cross 자격 ❌)

> 2026-05-07 / 등재 = `decisions/DEC-2026-05-07-poc-11-prelim-신설.md`
> ★ **prelim 단계** — Day 0 본 session 자산화 / Day 0.5~ 별도 session 사용자 승인 + Day 1 진입.
> ★ ★ ★ **사용자 결단 (α) 2026-05-07** = "EFI-WEB 가장 우선순위 높다" → billing 모듈 우선 + PoC #08 (jpetstore-6) 보류 + PoC #09 (TypeORM) 별도 axis 후속.
> ★ ★ **사내 ROI axis** = scale-cross + domain-cross 추가 입증 / paradigm-cross 자격 ❌ (Spring 4.1 + iBATIS 2 동일).

## 의도

EFI-WEB 사내 IFRS 회계 시스템의 ★ ★ **billing (결제 / 청구) 모듈** (~257 LOC) chain 1 측정 — PoC #06 exchange (단일책임 345 LOC / 자본 환율) + PoC #07 capital (다중책임 3752 LOC / 자본 환산) 후 ★ **3 사내 PoC isomorphic 자격** 입증.

**측정 axis 4** (PoC #07 패턴 재사용):

1. plan §3-A 분석 자동화율 — billing 작은 책임 추정 30~40% (PoC #06 exchange 38.75% baseline 정합)
2. plan §3-B 설계 자동화율 — chain 1 planning-extraction-validator 통과 (0 critical / UC ≥ 90%)
3. phase 4.7 acceptance oracle — ★ ★ domain-cross 입증 (회계 자본/환율 → 결제 / domain 다름) / named_classified_ratio ≥ 80%
4. ★ SQL Inventory coverage — 자동 추출 ≥ 50% (★ 3 사내 PoC isomorphic 자격 / 66.7% baseline 사내 robust 입증)

## scope

### 포함

- billing 모듈 한정 (~257 LOC / Java + sqlmap XML + JSP)
- analysis 4종 + ★ SQL Inventory 11 컬럼 (★ phase 4.8 본체 자산 사내 환경 ≥ 3 PoC isomorphic 자격)
- phase 4.7 + chain 1
- v2.1.1 ratchet trend baseline write (★ 3 사내 PoC isomorphic baseline)

### ★ 명시적 제외

- chain 2~4 본격 진입 (PoC #06+#07 패턴 정합)
- chain 3 영역 (Testcontainers / MockMvc / DBUnit) → carry C-PoC07-1~3 정합
- 다중 모듈 (51K LOC 전체)
- ★ ★ ★ **본체 격상 ❌** — 사용자 D11 정신 정합
- ★ ★ ★ **paradigm-cross 자격 ❌** (Spring 4.1 + iBATIS 2 동일) — v2.2.0 final 격상 trigger 와 ★ 별도 axis (PoC #09 TypeORM 의무 별도)

## paradigm 매트릭스 (★ 본 PoC 의 axis 명확화)

| dimension | PoC #06 exchange | PoC #07 capital | **PoC #11 billing** | axis |
|---|---|---|---|---|
| 프레임워크 | Spring 4.1.2 | Spring 4.1.2 | **Spring 4.1.2** | 동일 |
| ORM | iBATIS 2 | iBATIS 2 | **iBATIS 2** | 동일 |
| 책임 | 단일 (345 LOC) | 다중 (3752 LOC) | **작음 / 단일 추정 (257 LOC)** | ★ scale-cross |
| 도메인 | 자본 환율 (회계) | 자본 환산 (회계) | **결제 / 청구** | ★ ★ domain-cross |

→ ★ ★ scale-cross + domain-cross 추가 입증 / paradigm-cross ❌. 본체 격상 자격 = sub-rule (Spring 4.1 + iBATIS 2 spectrum) 강화 + phase 4.7 oracle ambiguous 다양성 + SQL Inventory 사내 robust 자격.

## ★ ★ Day 0.5 진입 차단 — 사용자 의뢰 1건 (source 위임)

★ **별도 session 첫 진입 시 사용자 결단**:

1. **billing 모듈 source 위임** — PoC #06 (exchange) + PoC #07 (capital) path 동일:
   - 권장 위치: `examples/poc-11-efiweb-billing-spring41/source/{java,sqlmap,jsp,message}/`
   - 사용자 권한 / 사내 코드베이스 외부 access ❌

대안 결단 (사용자 가용성 ❌ 시):
- (i) billing 가용 시 즉시 Day 1 진입
- (ii) 다른 EFI-WEB 모듈 (connect / contract / bod / 기타) 으로 대체
- (iii) PoC #11 보류 → PoC #08 (jpetstore-6) 또는 PoC #09 (TypeORM) 우선

## 14d cap (PoC #06+#07 cap 정합)

| Day | 작업 | 산출 |
|---|---|---|
| 0 | (★ 본 session) skeleton + DEC prelim + INDEX/STATUS + plan 1차 | ✅ |
| 0.5 | 별도 session 첫 진입 — plan + 사용자 source 위임 + 4원칙 3원칙 승인 | plan-poc-11-billing.md + 위임 ✅ |
| 1 | source 사본 + analysis 4종 + ★ SQL Inventory 11 컬럼 | input/{4종} + sql-inventory/{json,md} |
| 1.5 | §3-A 측정 + sql-inventory 자동/수동 비율 | inventory.json + sql-inventory.json `extraction_automation` |
| 2 | phase 4.7 (snapshot + intent-vs-bug + coverage) | characterization/{snapshots, intent-vs-bug, coverage} |
| 2.5 | D2 ambiguous 도메인 결단 (★ ★ ★ 결제 도메인 expert) | DEC-domain-결단 + intent-vs-bug §3 |
| 3 | chain 1 + validators + ratchet baseline write | .aimd/output/planning-spec + state.json + baseline |
| 3.5 | REPORT + DEC 종결 + STATUS + INDEX + sub-rule carry resolve | REPORT + DEC-종결 |

★ 누적 ~14~18h (~2~3일 실측 / 14d cap ★ 충분 여유 / billing 257 LOC = quick win).

## 종결 조건

다음 3개 중 1개 (PoC #06+#07 패턴):

- **(a) PoC #11 정식 등재** — 4축 metric 3/4 이상 pass + ★ 3 사내 PoC isomorphic 자격 + sub-rule carry resolve
- **(b) prelim 보존** — 측정 부족 / 다음 PoC 재시도
- **(c) scope 외 회수** — billing source 부적합 + 다른 EFI-WEB 모듈 (connect / contract / bod) 으로 재시작

## 다음 PoC 단계

PoC #11 종결 후 우선순위 (사용자 결단 (α) 정합):
- **PoC #08 (jpetstore-6) 보류 해제** — paradigm-cross MEDIUM corroboration 자격 진입 (Day 0+0.5 commit `a27dfb0` + `a60404c` 자산 보존)
- **PoC #09 (TypeORM raw SQL)** — ★ v2.2.0 final 격상 trigger 핵심 / 별도 prelim DEC + plan
- PoC #10 (JPA QueryDSL) — v2.3.0 minor

## 참조

- 직전 release: DEC-2026-05-08-v2.2.0-rc1-prerelease (★ paradigm-cross carry C-v2.2.0-6 origin / 본 PoC ≠ resolve trigger)
- 직전 PoC #06 종결: DEC-2026-05-07-poc-06-종결 (corroboration #1 / 자본 환율)
- 직전 PoC #07 종결: DEC-2026-05-08-poc-07-종결 (corroboration #2 / 자본 환산)
- 보류 PoC #08 prelim: DEC-2026-05-07-poc-08-prelim-신설 (jpetstore-6 / paradigm-cross MEDIUM / Day 0+0.5 자산 보존)
- 사용자 결단 (α) 2026-05-07: "EFI-WEB 가장 우선순위 높다" → billing 우선
