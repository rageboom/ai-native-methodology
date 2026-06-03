# DEC-2026-05-07-poc-06-domain-결단

> **카테고리**: methodology / PoC #06 도메인 결단 / phase 4.7 ambiguous 영역 처분 / acceptance oracle 안정화
> **상태**: 승인 ( 본 PoC #06 한정 정식 결단 / 새 시스템 재구현 시 도메인 expert 재검증 carry)
> **일자**: 2026-05-07
> **선행**: DEC-2026-05-07-poc-06-종결 (PoC #06 정식 등재)

---

## 1. 결단 — ambiguous 3종 본 PoC 한정 정식 분류

PoC #06 phase 4.7 (characterization) 의 intent-vs-bug 분류표 (§3.1 / §3.2) 의
ambiguous 3건 처분:

| 항목                                                 | 잠정 결단         | **정식 결단 (본 PoC 한정)**                                           | 새 시스템 재구현 시                                               |
| ---------------------------------------------------- | ----------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| BR-EXCHANGE-005 (12개월 일괄 입력)                   | ambiguous         | **bug — 데이터 모델** / **intent — 입력 UX** 분리                     | 데이터 모델 정규화 (TB_EXCHANGE_MONTHLY) + UX 12개월 한 화면 보존 |
| AP-EXCHANGE-006 (TB_EXCHANGE.MON1~MON12 1NF 위반)    | ambiguous         | **bug**                                                               | 정규화 의무                                                       |
| AP-EXCHANGE-009 (12 String[] 배열 파싱)              | bug (AP-006 의존) | **bug** (AP-006 동반)                                                 | List<MonthRate> 정규화 모델 정합                                  |
| AP-EXCHANGE-008 (S_ExRateMigration Stored Procedure) | ambiguous         | ** ambiguous 보존** — DB 함수 본문 read carry C-data-1 충족 후 재결단 | (carry)                                                           |

## 2. 근거

### 2.1 BR-EXCHANGE-005 + AP-EXCHANGE-006/009 = bug (데이터 모델)

**결정적 신호**: AP-EXCHANGE-007 (작성자 자조 코멘트 / SQL 안 `<!-- 환율관리
페이지만 생각하고 설계한 폐해라 할 수 있다 ㅋ -->`) — **작성자 본인이
"폐해" 로 자체 인지**. 이 자조 신호가 ambiguous → bug 결단의 직접 evidence.

**해석 분리** (intent + bug 양립):

- 데이터 모델 (TB_EXCHANGE.MON1~MON12) = bug — 정규화 의무 (1NF)
- 입력 UX (12개월 한 화면 일괄 입력) = intent — IFRS 연간 환율표 정합

→ 새 시스템 재구현 시 데이터 모델은 정규화하되 UX 는 보존.

### 2.2 AP-EXCHANGE-008 = ambiguous 보존

**근거**: S_ExRateMigration 의 본문 (외부 환율 데이터 일괄 가져오기 추정)
이 코드만으로는 추론 불가. DB 함수 본문 + 외부 시스템 spec 부재.

**carry C-data-1 / D7 (DBA read)** 충족 후 재결단:

- 외부 시스템 (한국은행/외환은행 등) 연동이라면 → DB 작업 정합 (intent)
- 단순 SQL 변환이라면 → application layer 이전 정합 (bug)

본 PoC 한정으로 ambiguous 보존 — chain 4 GREEN 진입 시 검증 의무 유지.

### 2.3 결단 권한 — 본 PoC 한정 acceptance oracle

본 결단은 **본 PoC #06 의 acceptance oracle 안정화** 목적. 새 시스템 재구현
시점에는 도메인 expert (IFRS 회계 담당자) 재검증 의무. 사용자 (TF Lead /
윤주스) 의 결단 권한 위임 가정 — 추후 도메인 expert 결단으로 갱신 가능.

## 3. acceptance oracle 갱신

본 결단으로 PoC #06 의 acceptance oracle 적용 가능 비율:

| 분류               | 직전 (Day 2)                     | 본 결단 후                                |
| ------------------ | -------------------------------- | ----------------------------------------- |
| intent (보존)      | 6 BR                             | 6 BR + 1 (BR-005 입력 UX 분리 부분) = 7   |
| bug (회피)         | 7 AP                             | 7 AP + 2 (AP-006 + AP-009 = bug 정식) = 9 |
| ambiguous (carry)  | 3 (BR-005 + AP-006/008/009 동반) | 1 (AP-008 만)                             |
| 자체 인지 (AP-007) | 1                                | 1                                         |
| **명확 분류 비율** | 14/17 = 82%                      | **17/18 = 94%** (BR-005 분리로 +1)        |

acceptance oracle 적용 가능 **94% (직전 82% +12%p)** — D2 결단 효과.

## 4. carry 갱신

| ID                    | 항목                                                        | 변화                                                      |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| C-4                   | intent_vs_bug ambiguous 3종 처분                            | ✅ **3 → 1 (AP-008 만 보존)** — D2 정식 결단으로 2종 종결 |
| C-data-1              | FN_Get_ExcRate DB 함수 본문                                 | (변화 없음)                                               |
| C-data-2              | TB_EXCHANGE 트랜잭션 isolation                              | (변화 없음)                                               |
| 신규 C-domain-revisit | 새 시스템 재구현 시 도메인 expert (IFRS 회계 담당자) 재검증 | 본 결단 임시 정식화 / 도메인 expert 결단 시점에 갱신      |

## 5. 자산 갱신

- ✅ characterization/intent-vs-bug.md §3.1 + §3.2 정식 분류 갱신
- ✅ characterization/coverage.json — acceptance oracle 비율 갱신 (82% → 94%)
- ✅ PROGRESS-2026-05-07.md entry-14 추가
- ✅ STATUS.md PoC #06 종결 섹션 acceptance oracle 비율 갱신

## 6. 참조

- 선행: DEC-2026-05-07-poc-06-종결 (정식 등재)
- intent-vs-bug 분류표: `examples/poc-06-efiweb-exchange-spring41/characterization/intent-vs-bug.md`
- plan: `~/.claude/plans/stateful-painting-orbit.md` §6.5
