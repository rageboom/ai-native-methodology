# PoC #15 EFI-WEB car — Intent vs Bug 분류

> phase characterization 4 분류 (intent / bug / ambiguous / self_recognized) — Maldonado & Shihab (2015) SATD/KL-SATD 학술 정합 + Adzic SBE Given/When/Then BDD 정합.

## 분류 요약

| 영역 | total | intent | bug | ambiguous | self_recognized | 분류율 |
|---|---|---|---|---|---|---|
| BR | 12 | 8 | 0 | 4 | 0 | 67% |
| AP | 9 | 0 | 6 | 0 | 3 | 100% |
| **합계** | **21** | **8** | **6** | **4** | **3** | **81%** ✅ |

`named_classified_ratio = (8+6+3) / 21 = 0.81` ≥ 0.80 default threshold ✅

## intent (8 BR — 비즈니스 의도 / 보존 의무)

| ID | 이름 | 처분 |
|---|---|---|
| BR-CAR-MGT-001 | 차량 등록 의무 필드 | snapshot 그대로 유지 |
| BR-CAR-MGT-002 | 차량 사용 여부 (USE_YN) | 그대로 |
| BR-CAR-MGT-004 | 총 누적 거리 자동 갱신 | 그대로 (TOT_DIST update) |
| BR-CAR-MGT-005 | 사용자 기간 매칭 | 그대로 (cross-BC 의존) |
| BR-CAR-MGT-006 | 리더 사용자 식별 | 그대로 (Modern = Spring Security 격상) |
| BR-CAR-COST-001 | 비용 항목 5종 + 조정 | 그대로 |
| BR-CAR-COST-003 ★ | ★ 차량비용 → ERP 회계전표 IF | 그대로 BUT 처분 방식 변경 (saga / outbox) |
| BR-CAR-COST-006 | FN_SPLIT 다중 ID 등록 | 그대로 (Modern = bulk insert API) |

## bug (6 AP — 명확한 결함 / Modern alternative)

| ID | 이름 | Modern Alternative |
|---|---|---|
| AP-FE-001 | JSP scriptlet 8건 | JSTL `<c:forEach>` + EL auto-escape |
| AP-SEC-001 | JSP XSS 20건 | EL `${}` + `<c:out value=''/>` |
| AP-ARCH-001 | DAO 패키지 위치 | `repository/` 별도 패키지 |
| AP-DB-002 | FK CONSTRAINT 부재 | ALTER TABLE ADD CONSTRAINT |
| AP-DB-003 | Cross-DB join | REST API / event-driven 통합 |
| AP-EXT-001 | 외부 SP 호출 | service layer 흡수 또는 ERP API |

## ambiguous (4 BR — 도메인 expert 결단 carry 의무)

| ID | 이름 | carry 이유 |
|---|---|---|
| BR-CAR-MGT-003 | 차량 상태 코드 (STATE) | STATE 코드 값 분포 (등록/사용중/처분?) — sqlmap 안 명시 ❌ / 도메인 expert 결단 의무 |
| BR-CAR-COST-002 | 비용 승인 코드 (cost_accept_cd) | 값 분포 ('Y'/'N'/null?) — 사용자 결단 |
| BR-CAR-COST-004 | NoLog 비용 | "운행 로그 없는 비용" 의 의미 (회사 단위 통합 = 마이그레이션 시 별도 entity?) |
| BR-CAR-COST-005 | CostSumSystem | 합산 시스템의 admin role + scope — domain expert |

**carry 처리**: 4 ambiguous → 도메인 expert (사용자 본인 또는 IFRS 회계팀) 결단 의무. 결단 전까지 chain 4 진입 ❌ (CLAUDE.md no-simulation 정합).

## self_recognized (3 SATD — 자동 bug 처분)

코드 자조 코멘트 grep 결과 (Maldonado & Shihab 2015 / KL-SATD):

| # | 파일 | line | 패턴 | 내용 |
|---|---|---|---|---|
| 1 | `source/ddl/functions/fn_Get_CarUserListView_2.sql` | 39 | `(임시적용)` | "예외 추가, 2020-02-12, 정현초 이사님 비서 인사발령 전 김주아 대리 지원을 위한 예외(임시적용)" — ★ 비즈니스 상황 의존 임시 코드 |
| 2 | `source/java/smilegate/ifrs/car/service/impl/CarMgtDAO.java` | 138 | `TODO` | "TODO Auto-generated method stub" — IDE 잔재 |
| 3 | `source/java/smilegate/ifrs/car/service/impl/CarMgtServiceImpl.java` | 210 | `TODO` | "TODO Auto-generated catch block" — IDE 잔재 |

**처분**:
- # 1 — 비즈니스 임시 예외 → 도메인 expert 결단 + Modern 마이그레이션 시 정식 권한 분기 또는 제거
- # 2, 3 — IDE 자동 생성 잔재 → 확인 + 정식 처리 (UnsupportedOperationException throw 또는 실 구현)

## Modern stack 자연 부재 ❌ 정합 검증

- 본 PoC = Spring 4.1 + iBATIS 2 + JSP (Legacy stack)
- SATD grep count = 3 (Legacy 자연 빈도 정합)
- ★ Modern 스택 (NestJS PoC #03 retrofit / 0건) 와 비교 시 Legacy = SATD 더 많은 자연 사실 입증

## carry → chain 4 진입 차단 (필요 결단)

본 PoC 가 chain 4 (test) 진입 시 ambiguous 4 BR 결단 의무. 본 PoC 진행 = chain 2 (gate #2) 까지 → ambiguous carry 자체는 본 PoC scope 안 blocking ❌.
