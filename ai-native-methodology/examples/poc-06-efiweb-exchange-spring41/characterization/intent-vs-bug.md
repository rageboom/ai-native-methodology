# Intent vs Bug 분류표 — exchange 모듈 (★ phase 4.7 정식 첫 적용)

> 외부 조언 (Michael Feathers Characterization Testing) 4단계 핵심.
> "유지할 동작 (intent)" 과 "버려야 할 버그 (bug)" 분류 — 새 시스템 재구현 시 acceptance oracle.
> ★ 도메인 expert (사용자 본인 또는 IFRS 회계 담당자) 검증 carry 의무.

---

## 1. Business Rules (7건) 분류

| ID | 제목 | 분류 | 근거 |
|---|---|---|---|
| BR-EXCHANGE-KRW-001 | KRW 환율 = 1 고정 | **intent** | IFRS 회계 기준 통화 — 외화→원화 환산 시 KRW 자체는 환산 불필요. selectExchangeRate 코드의 if 분기는 도메인 정합 |
| BR-EXCHANGE-COMPLETE-002 | E + A 두 GUBUN 모두 등록 = 'Y' | **intent** | IFRS B/S (기말환율) + P/L (평균환율) 동시 평가 의무 — 회계 정합 |
| BR-EXCHANGE-DECIMAL-003 | VND 소수 4자리 / 그 외 2자리 | **intent** | VND 환율 단위가 매우 작아 정밀도 필요 (실무 정합) |
| BR-EXCHANGE-COMMA-004 | 환율 입력 시 콤마 자동 제거 | **intent** | UX 친화 — 사람이 1,300.50 형식 입력 가능 |
| BR-EXCHANGE-ANNUAL-005 | 12개월 환율 일괄 단위 입력 | **★ ambiguous** | (a) IFRS 연간 환율표 정합 vs (b) DB 정규화 (1NF) 위반 폐해 — **도메인 expert 결단 필요** |
| BR-EXCHANGE-GUBUN-006 | 기말(E) / 평균(A) 분리 관리 | **intent** | IFRS B/S vs P/L 회계 기준 |
| BR-EXCHANGE-CALCFN-007 | 외화→원화 환산 currCd 별 환율 | **intent** | 회계 산식의 기본 |

**BR 분류 결과**: intent 6 / ambiguous 1 / bug 0

---

## 2. Antipatterns (10건) 분류

| ID | 제목 | 분류 | 근거 + 처분 |
|---|---|---|---|
| AP-EXCHANGE-001 | Map<String,Object> + 강제 캐스팅 | **bug** | Type Safety 부재 = 명백한 폐해. 새 시스템에서 DTO + Bean Validation 의무 |
| AP-EXCHANGE-002 | Anemic Service | **bug** | Service 의 존재 의의 부재 = 폐해. 새 시스템 Application Service + Domain Service 분리 |
| AP-EXCHANGE-003 | Controller 에 Excel 출력 로직 | **bug** | View/Controller 책임 혼재 = 폐해. 새 시스템 ExcelExportService 분리 |
| AP-EXCHANGE-004 | WITH(NOLOCK) 무차별 사용 | **bug** | Dirty Read 위험 = 명백한 폐해 (회계 데이터에 특히 위험). 새 시스템 READ_COMMITTED_SNAPSHOT |
| AP-EXCHANGE-005 | iBATIS 2 #...# 인라인 | **bug** | deprecated syntax = 폐해 (안전성은 OK 이지만 마이그레이션 의무). 새 시스템 MyBatis 3 + #{...} |
| AP-EXCHANGE-006 | TB_EXCHANGE.MON1~MON12 (1NF 위반) | **★ ambiguous** | BR-EXCHANGE-ANNUAL-005 와 동일 — 도메인 expert 결단 필요 |
| AP-EXCHANGE-007 | SQL 자조 코멘트 | **bug + 자체인지** | 작성자 본인이 폐해로 인지 ("환율관리 페이지만 생각하고 설계한 폐해라 할 수 있다 ㅋ"). 새 시스템 결정표(DMN) 기반 GUBUN 별 검증 분리 |
| AP-EXCHANGE-008 | Stored Procedure (S_ExRateMigration) 비즈니스 로직 | **★ ambiguous** | 외부 환율 데이터 일괄 가져오기는 DB 작업 정합 가능성 ↑ — 도메인 expert + 외부 시스템 spec 확인 carry |
| AP-EXCHANGE-009 | 12 String[] 배열 파싱 | **bug (AP-006 의존)** | AP-006 이 ambiguous 이므로 — AP-006 이 intent 면 AP-009 도 intent / AP-006 이 bug 면 AP-009 도 bug. 동반 처분 |
| AP-EXCHANGE-010 | Reserved keyword [YEAR] 컬럼 | **bug** | 컬럼명 일관성 부재 + reserved keyword 위험 = 폐해. 새 시스템 RATE_YEAR 등 회피 |

**AP 분류 결과**: bug 7 / ambiguous 2 (BR-005 와 연동) / intent 0

---

## 3. ★ ambiguous 3종 → 정식 분류 (2026-05-07 / DEC-2026-05-07-poc-06-domain-결단)

### 3.1 BR-EXCHANGE-ANNUAL-005 + AP-EXCHANGE-006 + AP-EXCHANGE-009 — **★ 정식 결단: bug (데이터 모델) + intent (입력 UX) 분리**

**핵심 질문**: TB_EXCHANGE 의 12개월 컬럼 (MON1~MON12) 구조는 IFRS 회계 정합 의도인가, 1NF 위반 폐해인가?

**intent 가능성**:
- IFRS 회계 보고에서 연간 환율은 12개월 한 번에 보는 표 형식이 표준
- selectCheckExcRate 의 CASE WHEN 12 분기도 "특정 월 환율 등록 여부" 라는 비즈니스 질문에 정합
- 새 시스템도 입력 UX 가 "한 통화의 12개월을 한 번에 입력" 이면 데이터 모델도 그대로 둘 수 있음

**bug 가능성**:
- 13번째 월 (윤달/조정월) 추가 시 schema migration 필요 + 모든 SQL 변경
- "1월 환율만 조회" 같은 질의가 SQL 의 CASE WHEN 으로 강제됨 (정규화 모델은 WHERE month=1 만으로 가능)
- 작성자가 selectCheckExcRate 코멘트에서 자조 ("환율관리 페이지만 생각하고 설계한 폐해라 할 수 있다 ㅋ") — **자체 인지된 기술부채 신호**

**★ 정식 결단** (DEC-2026-05-07-poc-06-domain-결단):
- **데이터 모델 = bug** — AP-EXCHANGE-007 자조 코멘트 자체 인지 신호 결정적. 새 시스템 정규화 의무 (TB_EXCHANGE_MONTHLY: CURR_CD, YEAR, GUBUN, MONTH, RATE).
- **입력 UX = intent** — BR-EXCHANGE-ANNUAL-005 의 "12개월 한 화면 일괄 입력" 은 IFRS 연간 환율표 정합 / UX 보존 의무.
- AP-EXCHANGE-006 = **bug** (정규화 의무)
- AP-EXCHANGE-009 = **bug** (AP-006 동반 / List<MonthRate> 정규화 모델 정합)

**carry**: 새 시스템 재구현 시 도메인 expert (IFRS 회계 담당자) 재검증 carry C-domain-revisit.

### 3.2 AP-EXCHANGE-008 (S_ExRateMigration Stored Procedure) — **★ ambiguous 보존**

**핵심 질문**: 환율 마이그레이션 비즈니스 로직이 DB Stored Procedure 안에 있는 것은 의도인가?

**intent 가능성**:
- 외부 시스템 (한국은행 / 외환은행) 환율 데이터 일괄 가져오기는 대용량 batch — DB 작업이 성능 정합
- 외부 시스템 연동 SQL 이 Procedure 안에 격리되어 application 코드 영향 최소

**bug 가능성**:
- 단위 테스트 ❌ + 도메인 로직 가시성 ↓ + 코드 관리 어려움 (DDL 버전관리 + Java 동시)
- chain 4 GREEN (test pass) 가 Stored Procedure 실행 의존 → 환경 의존성 ↑

**★ 정식 결단**: **ambiguous 보존** (DEC-2026-05-07-poc-06-domain-결단). DB 함수 본문 + 외부 시스템 spec read 후 재결단. carry C-data-1 / D7 (DBA read) 충족 시점에 갱신.

---

## 4. 새 시스템 재구현 시 acceptance oracle 요약

본 분류표 = chain 4 GREEN 검증 시 **acceptance oracle** 기준:

| 처분 | 새 시스템 동작 |
|---|---|
| **intent (6 BR)** | 새 시스템도 동일 동작 보존 의무 — characterization snapshot 그대로 통과 |
| **bug (7 AP)** | 새 시스템에서 의도적으로 **다른 결과** — modern_alternative 적용 |
| **ambiguous (3건)** | 도메인 expert 결단 후 intent 또는 bug 로 분류 — 결단 전까지 chain 4 진입 ❌ |

★ 이게 외부 조언 (Michael Feathers) 4단계 의 핵심 — 새 시스템이 같은 입력에 같은 출력 (intent) 또는 의도적으로 다른 출력 (bug 회피).

---

## 5. carry 항목

| ID | 항목 | 결단 의무 주체 |
|---|---|---|
| C-domain-1 | BR-EXCHANGE-ANNUAL-005 + AP-EXCHANGE-006 + AP-EXCHANGE-009 동반 처분 (intent vs bug) | 사용자 (TF Lead) 또는 IFRS 회계 담당자 |
| C-domain-2 | AP-EXCHANGE-008 (S_ExRateMigration) | 도메인 expert + DB 함수 본문 read |
| C-domain-3 | KRW 환율이 selectExchangeList 결과에도 보일 필요성 (BR-001 vs 화면 일관성) | 사용자 결단 |
| C-data-1 | FN_Get_ExcRate DB 함수 본문 (환율 조회 산식) | DB DDL/함수 정의 read |
| C-data-2 | TB_EXCHANGE 의 트랜잭션 isolation 명시 (4 트랜잭션 vs 단일) | DB DBA 확인 |
| C-data-3 | sessionId DEAD parameter (sql-map 미사용 / 감사 컬럼 부재 가능성) | DB DDL 확인 |

---

## 6. ★ phase 4.7 적용 효과 측정

본 분류표 작성 자체가 phase 4.7 의 본질 가치:

- **소요 시간**: ~1.5시간 (Day 2) + ~30분 (D2 정식화)
- **명확하게 분류된 항목** (D2 후): **17건** = 7 intent (6 BR + 1 BR-005 입력 UX 분리) + 9 bug (7 AP + AP-006 + AP-009) + 1 자체인지
- **ambiguous (carry / DBA read)**: 1건 (AP-EXCHANGE-008 만)
- **새 시스템 재구현 시 acceptance oracle 직접 적용 가능 비율**: 17/18 = **94%** (Day 2 82% +12%p / D2 결단 효과)

**plan §6.5 phase 4.7 효과 측정**:
- 입력: input 4종 (rules.json 7 BR + antipatterns.json 10 AP)
- 출력: 본 분류표 (intent/bug/ambiguous) — chain 1 planning 시 use_cases 추출 cross-link / chain 4 GREEN acceptance oracle
- 효과: **rules.json + antipatterns.json 만으로는 새 시스템 동작이 결정되지 않음** — phase 4.7 가 "어떤 BR/AP 를 보존하고 어떤 것을 버릴지" 명시 의무. 이게 외부 조언이 검증한 결정적 갭.
