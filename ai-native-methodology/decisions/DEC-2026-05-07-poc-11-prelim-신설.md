# DEC-2026-05-07-poc-11-prelim-신설

> **카테고리**: methodology / PoC 등재 / ★ ★ 사내 ROI axis / scale + domain-cross 추가 입증 / sub-rule (Spring 4.1 + iBATIS 2 spectrum) 강화
> **상태**: 진행중 (★ prelim — Day 0.5~ 별도 session 사용자 source 위임 + 4원칙 3원칙 승인 + Day 1 진입 의무)
> **일자**: 2026-05-07 (skeleton + 사용자 결단 (α) 수합 / 본 session) / Day 0.5~ (별도 session)
> **선행**: DEC-2026-05-07-poc-08-prelim-신설 (★ ★ 사용자 결단 (α) 정합 / PoC #08 보류) + DEC-2026-05-08-poc-07-종결 (corroboration #2)

---

## 1. 결단

★ ★ ★ **사용자 결단 (α) 2026-05-07** = "EFI-WEB 가장 우선순위 높다" 흡수. PoC 우선순위 재정렬:
- **PoC #08 (jpetstore-6) = 보류** (Day 0+0.5 commit `a27dfb0` + `a60404c` 자산 보존 / 후순위 진입)
- **★ PoC #11 (EFI-WEB billing) = 우선 진입** — 사내 ROI 직접 입증 + scale + domain-cross 추가
- **PoC #09 (TypeORM raw SQL) = 별도 axis 후속** — ★ v2.2.0 final 격상 trigger 핵심 / 사용자 결단 (α) 채택 후에도 의무 보존

PoC #11 **prelim** 등재 — 정식 PoC #11 등재는 별도 session 첫 plan + 사용자 source 위임 + Day 1~3.5 측정 종료 + 4축 metric (3/4 이상 pass) 결과 기반 별도 결단 (종결 조건 §8).

## 2. 배경

- 본 session 직전 사용자 발언: "지금 efi-web 이 가장 우선순위가 높다"
- 본 session 진단: PoC #08 (jpetstore-6) Day 0+0.5 종결 후 사용자 우선순위 재정렬 가능성 검토
- PoC #06 (exchange / 단일책임 / 자본 환율) + PoC #07 (capital / 다중책임 / 자본 환산) 후 ★ 3번째 사내 PoC 의무
- billing = ★ 사내 EFI-WEB 모듈 中 smallest (~257 LOC) → quick win + scope clear
- ★ ★ ★ paradigm-cross 자격 ❌ (Spring 4.1 + iBATIS 2 동일) — 본 PoC ≠ v2.2.0 final 격상 trigger / **별도 axis** (사내 ROI + scale/domain-cross + sub-rule)
- 사용자 결단 (α) 정합: 사내 ROI > 본 방법론 일반화 (TF Lead 책임 정합)

## 3. 측정 대상 (4축 동시 / PoC #07 패턴 재사용)

1. **plan §3-A 분석 자동화율** — billing 작은 책임 추정 30~40% (PoC #06 exchange 38.75% baseline 정합 / R1 가설 = scale ↓ → 자동화율 ↓)
2. **plan §3-B 설계 자동화율** — chain 1 planning-extraction-validator 통과 (0 critical / UC ≥ 90%)
3. **phase 4.7 acceptance oracle** — ★ ★ ★ **domain-cross 입증** (회계 자본/환율 → 결제 / domain 다름) / named_classified_ratio ≥ 80%
4. **★ SQL Inventory coverage** — 자동 추출 ≥ 50% (★ 3 사내 PoC isomorphic / 66.7% baseline 사내 환경 robust)

## 4. scope 제한

### 포함

- billing 모듈 한정 (~257 LOC / Java + sqlmap XML + JSP + message)
- analysis 4종 + ★ SQL Inventory 11 컬럼 (★ phase 4.8 본체 자산 사내 환경 ≥ 3 PoC isomorphic 자격)
- phase 4.7 + chain 1
- v2.1.1 ratchet trend baseline write (★ 3 사내 PoC isomorphic baseline)

### ★ 명시적 제외

- chain 2~4 본격 진입 (PoC #06+#07 패턴 정합)
- chain 3 영역 → carry C-PoC07-1~3 정합
- 다중 모듈 (51K LOC 전체)
- ★ ★ ★ **본체 격상 ❌** — 사용자 D11 정신 정합
- ★ ★ ★ **paradigm-cross 자격 입증 ❌** — Spring 4.1 + iBATIS 2 동일 / v2.2.0 final 격상 trigger 와 ★ 별도 axis (PoC #09 TypeORM 의무 별도)

## 5. ★ ★ ★ §8.1 strict — 본 PoC axis 명확화

본 PoC 의 본체 격상 자격 ★:

| 자산 | 본체 격상 자격 | carry ID |
|---|---|---|
| sub-rule (Spring 4.1 + iBATIS 2 spectrum) | ★ 3 사내 PoC isomorphic 자격 충족 trigger (PoC #06+#07+#11 = 단일/다중/작은책임 + 자본환율/자본환산/결제 도메인 cross) | C-v2.2.0-spring41-ibatis2-subrule resolve 후보 |
| phase 4.7 oracle ambiguous 다양성 | domain-cross 입증 (회계 → 결제) → ADR-CHAIN-006 sub-rule 강화 | (기존 v2.1.0 본체 강화) |
| SQL Inventory 사내 환경 robust | ≥ 3 PoC isomorphic baseline 신뢰도 ↑ | (기존 v2.2.0-rc1 본체 강화) |
| ★ ★ ★ phase 4.8 본체 격상 v2.2.0 final | ❌ — paradigm-cross 자격 ❌ → 본 PoC = v2.2.0 final trigger ❌ / PoC #09 (TypeORM) 별도 의무 | (별도 axis) |

본 PoC 의미 = (1) 사내 ROI 직접 입증 + (2) scale-cross + domain-cross 추가 입증 + (3) sub-rule 자격 강화 + (4) phase 4.7 oracle 다양성.

## 6. paradigm 매트릭스 (★ 본 PoC 의 axis 명확화)

| dimension | PoC #06 exchange | PoC #07 capital | **PoC #11 billing** | axis 분리 |
|---|---|---|---|---|
| 프레임워크 | Spring 4.1.2 | Spring 4.1.2 | **Spring 4.1.2** | 동일 |
| ORM | iBATIS 2 | iBATIS 2 | **iBATIS 2** | 동일 |
| 책임 | 단일 (345 LOC) | 다중 (3752 LOC) | **작음 / 단일 추정 (257 LOC)** | ★ scale-cross |
| 도메인 | 자본 환율 (회계) | 자본 환산 (회계) | **결제 / 청구** | ★ ★ domain-cross |

→ ★ ★ scale-cross + domain-cross 추가 입증 / paradigm-cross ❌. 본 PoC ≠ v2.2.0 final 격상 trigger.

## 7. ★ ★ Day 0.5 진입 차단 — 사용자 source 위임 의무

★ **별도 session 첫 진입 시 사용자 결단**:
- billing 모듈 source 위임 (PoC #06 exchange + PoC #07 capital path 동일)
- 권장 위치: `examples/poc-11-efiweb-billing-spring41/source/{java,sqlmap,jsp,message}/`

대안 결단 (사용자 가용성 ❌ 시):
- (i) billing 가용 시 즉시 Day 1 진입
- (ii) 다른 EFI-WEB 모듈 (connect / contract / bod / 기타) 으로 대체 (README + 본 DEC scope 갱신)
- (iii) PoC #11 보류 → PoC #08 (jpetstore-6) 또는 PoC #09 (TypeORM) 우선

## 8. 종결 조건 (Day 3.5 측정 후)

다음 3개 중 1개 (PoC #06+#07 패턴 reuse):

- **(a) PoC #11 정식 등재** — 4축 metric **3/4 이상 pass** + ★ 3 사내 PoC isomorphic 자격 명시 + sub-rule carry C-v2.2.0-spring41-ibatis2-subrule resolve
- **(b) prelim 보존** — 측정 부족 / 다음 PoC 재시도
- **(c) scope 외 회수** — billing 부적합 + 다른 EFI-WEB 모듈 (connect / contract / bod) 으로 재시작

## 9. 작업 시퀀스

| Day | 작업 | 시간 | 산출 |
|---|---|---|---|
| 0 | (★ 본 session) skeleton + DEC + INDEX/STATUS + plan 1차 + PoC #08 보류 표시 | ~1h | DEC-prelim + README + INDEX entry + STATUS prelim |
| 0.5 | ★ 별도 session 첫 진입 — plan + 사용자 source 위임 + 4원칙 3원칙 승인 | ⏳ 대기 | plan-poc-11-billing.md + 위임 ✅ |
| 1 | source 사본 + analysis 4종 + ★ SQL Inventory 11 컬럼 | ~3~4h | input/{4종} + sql-inventory/{json,md} |
| 1.5 | §3-A 측정 + sql-inventory 자동/수동 비율 | ~1h | inventory.json + sql-inventory.json `extraction_automation` |
| 2 | phase 4.7 (snapshot + intent-vs-bug + coverage) | ~3~4h | characterization/{snapshots, intent-vs-bug, coverage} |
| 2.5 | D2 ambiguous 도메인 결단 (★ ★ 결제 도메인 expert / IFRS 회계 expert 와 분리 의무) | ~1.5h | DEC-domain-결단 + intent-vs-bug §3 |
| 3 | chain 1 + validators + ratchet baseline write | ~2h | .aimd/output/planning-spec + state.json + baseline |
| 3.5 | REPORT + DEC 종결 + STATUS + INDEX + sub-rule carry resolve | ~2h | REPORT + DEC-종결 |

★ 누적 ~14~18h (~2~3일 실측 / 14d cap ★ 충분 여유).

## 10. 다음 PoC 단계

PoC #11 종결 후 우선순위 (사용자 결단 (α) 정합):
- **PoC #08 (jpetstore-6) 보류 해제** — paradigm-cross MEDIUM 진입 (Day 0+0.5 자산 보존)
- **PoC #09 (TypeORM raw SQL)** — ★ v2.2.0 final 격상 trigger 핵심 (paradigm-cross strong)
- PoC #10 (JPA QueryDSL) — v2.3.0 minor

## 11. 참조

- 사용자 결단 (α) 2026-05-07: 본 session "EFI-WEB 가장 우선순위 높다"
- 보류 PoC #08 prelim: DEC-2026-05-07-poc-08-prelim-신설 (jpetstore-6 / paradigm-cross MEDIUM / Day 0+0.5 자산 보존)
- 직전 PoC #06: DEC-2026-05-07-poc-06-종결 (corroboration #1 / 자본 환율)
- 직전 PoC #07: DEC-2026-05-08-poc-07-종결 (corroboration #2 / 자본 환산)
- 직전 release: DEC-2026-05-08-v2.2.0-rc1-prerelease (★ paradigm-cross carry C-v2.2.0-6 origin / 본 PoC ≠ resolve trigger)
- ADR-CHAIN-006 (phase 4.7) + ADR-CHAIN-007 (phase 4.8)
- 4원칙: CLAUDE.md §"Work Principles (4원칙)"
