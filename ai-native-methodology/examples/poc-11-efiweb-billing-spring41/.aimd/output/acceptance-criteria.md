# PoC #11 EFI-WEB billing — Acceptance Criteria (chain 2 / 4 UC 종결 / 12 AC / Gherkin .feature 렌더)

> ★ ★ ★ ★ chain 2 종결 (4 UC / 5 BHV / 12 AC / must×8 + should×4).
> ★ ★ ★ **characterization mode** — Michael Feathers 2004 정합 / ★ ★ AC-BILLING-008 = ★ critical / TDD intent 정면 위배 정합 명시.

---

## ★ ★ 12 AC 매핑 표

| AC | BHV | UC | severity | 핵심 |
|---|---|---|---|---|
| AC-BILLING-001 | BHV-BILLING-001 | UC-BILLING-001 | must | 화면 진입 + 모델 전달 + JSP 렌더 |
| AC-BILLING-002 | BHV-BILLING-001 | UC-BILLING-001 | must | year select option = (currYear-2015)+1 (BR-BILLING-005) |
| AC-BILLING-003 | BHV-BILLING-001 | UC-BILLING-001 | should | 법인 select count=1 (★ COM_NO==2 hardcoded / BR-BILLING-006 ambiguous) |
| AC-BILLING-004 | BHV-BILLING-002 | UC-BILLING-002 | must | 12 row 강제 (★ recursive CTE / BR-BILLING-001) |
| AC-BILLING-005 | BHV-BILLING-002 | UC-BILLING-002 | must | cross-DB FIM JOIN 데이터 응답 (★ AP-BILLING-006) |
| AC-BILLING-006 | BHV-BILLING-002 | UC-BILLING-002 | should | cross-DB 접근 부재 시 에러 (★ AP-BILLING-006 invariant) |
| AC-BILLING-007 | BHV-BILLING-003 | UC-BILLING-003 | must | 정상 happy path / 4 SQL 순차 commit |
| **AC-BILLING-008** | **BHV-BILLING-003** | **UC-BILLING-003** | **★ ★ ★ critical must** | **★ ★ ★ ★ 4 SQL 중 3 번째 fail 시 ★ ★ 부분 commit (★ ★ ★ AP-BILLING-001 / @Transactional ❌ Legacy bug 보존 / TDD intent 정면 위배)** |
| AC-BILLING-009 | BHV-BILLING-003 | UC-BILLING-003 | must | full overwrite delete + insert (BR-BILLING-003) |
| AC-BILLING-010 | BHV-BILLING-003 | UC-BILLING-003 | must | SCOPE_IDENTITY hisNo PK-FK (BR-BILLING-007 / AP-BILLING-005) |
| AC-BILLING-011 | BHV-BILLING-004 | UC-BILLING-003 | must | ERP 부재 시 skip + JSP alert + no-op (BR-BILLING-004) |
| AC-BILLING-012 | BHV-BILLING-005 | UC-BILLING-004 | should | Qlik iframe + URL hardcoded as-is (AP-BILLING-013) |

---

```gherkin
# language: ko

Feature: PoC #11 EFI-WEB billing — chain 2 4 UC 종결 (12 AC / characterization mode)

  Background:
    Given "회계 운영자 (ifrs_admin) 가 인증 + 권한 보유 상태이다"

  # ────────────────────────────────────────────────────────────
  # UC #1 — BHV-BILLING-001 (화면 진입)
  # ────────────────────────────────────────────────────────────

  @must @characterization-mode
  Scenario: AC-BILLING-001 — 화면 진입 + 모델 전달 + JSP 렌더
    Given currYear 시스템 accessor 정상 동작
    When 데이터 확정처리 화면에 진입한다
    Then currYear 모델 전달 + companyList 모델 전달 + HTTP 200 + JSP 렌더

  @must @characterization-mode @BR-BILLING-005
  Scenario: AC-BILLING-002 — year select option count = (currYear-2015)+1
    Given currYear = 2026
    When 화면 진입
    Then year select option count == 12 + 첫 2015 + 마지막 2026 + ASC

  @should @characterization-mode @BR-BILLING-006-ambiguous @domain-expert-carry
  Scenario: AC-BILLING-003 — 법인 select count=1 (★ COM_NO==2 hardcoded)
    Given 다수 법인 (COM_NO ∈ {1, 2, 3, ...}) 등록
    When 화면 진입
    Then 법인 select count==1 + COM_NO==2 만 노출

  # ────────────────────────────────────────────────────────────
  # UC #2 — BHV-BILLING-002 (12 row 조회)
  # ────────────────────────────────────────────────────────────

  @must @characterization-mode @BR-BILLING-001 @T-SQL
  Scenario: AC-BILLING-004 — 12 row 강제 (ERP 부재 시도 12 row)
    Given year=2025, comNo=2, comNm='회사명' + TB_SGMA_CONFIRM_HIS row count==0
    When 데이터 확정 목록 조회
    Then JSON 12 row + YEAR==2025 + COM_NO==2 + MONTH 1~12 ASC + PROC_ID/USER_NM/PROC_DT==null + ROW_NUM 1~12 + ROW_COUNT==12

  @must @characterization-mode @AP-BILLING-006
  Scenario: AC-BILLING-005 — 데이터 존재 시 cross-DB FIM JOIN 응답
    Given year=2025, comNo=2 + TB_SGMA_CONFIRM_HIS (MONTH=3, PROC_ID='user1', PROC_DT='2025-03-31') + FIM.dbo.TB_USER (USER_ID='user1', USER_NM='홍길동')
    When 조회
    Then 12 row + MONTH=3 row 의 PROC_ID='user1' + USER_NM='홍길동' + PROC_DT='2025-03-31' + 나머지 month null

  @should @characterization-mode @AP-BILLING-006 @cross-DB
  Scenario: AC-BILLING-006 — cross-DB 접근 부재 시 에러
    Given FIM cross-DB 접근 차단
    When 조회
    Then cross-DB 의존 에러 발생 (★ characterization mode 보존 / 새 시스템 invariant = dataSource 분리)

  # ────────────────────────────────────────────────────────────
  # UC #3 — BHV-BILLING-003 (★ ★ ★ critical atomicity)
  # ────────────────────────────────────────────────────────────

  @must @characterization-mode @BR-BILLING-003 @BR-BILLING-007 @happy-path
  Scenario: AC-BILLING-007 — 정상 happy path (4 SQL 순차 commit)
    Given distYear=2025, distMonth='03', companySeq=1 + SGERPMA row 5건 + TB_SGMA_CONFIRM 빈 상태
    When 데이터 확정 처리
    Then pre-check==5 + 4 SQL 순차 + TB_SGMA_CONFIRM 5 row + TB_SGMA_CONFIRM_HIS 1 row (SCOPE_IDENTITY) + TB_SGMA_CONFIRM_HIS_DATA 5 row + HTTP 200

  @must @characterization-mode @critical @AP-BILLING-001 @TDD-violation @migration-priority-P0
  Scenario: ★ ★ ★ ★ AC-BILLING-008 — 4 SQL 중 3 번째 fail 시 ★ ★ 부분 commit (★ ★ ★ Legacy bug 보존)
    Given distYear=2025, distMonth='03', companySeq=1 + SGERPMA row 5건
    And ★ insertConfirmHistory (3 번째 SQL) 호출 시 DB exception 발생 (PK violation simulation)
    When 데이터 확정 처리
    Then ★ deleteConfirmData (1번째) commit 완료
    And ★ insertConfirmData (2번째) commit 완료
    And ★ insertConfirmHistory (3번째) fail
    And ★ ★ ★ 부분 commit (★ TB_SGMA_CONFIRM = full overwrite / TB_SGMA_CONFIRM_HIS+DATA = 변경 ❌)
    And ★ ★ ★ rollback ❌ (★ @Transactional ❌ Legacy bug 보존)
    And ★ ★ ★ ★ 새 시스템 invariant assertion: 동일 시나리오 ★ ★ ★ 4 SQL 모두 rollback 의무 (★ @Transactional(rollbackFor=Exception.class) / carry C-stack-결단-chain-3-4-plan)

  @must @characterization-mode @BR-BILLING-003
  Scenario: AC-BILLING-009 — full overwrite (기존 3 row 삭제 + 신규 5 row insert)
    Given TB_SGMA_CONFIRM 기존 3 row + SGERPMA 신규 5 row
    When 확정 처리
    Then deleteConfirmData → 0 row + insertConfirmData → 5 row + 최종 count==5 (★ full overwrite)

  @must @characterization-mode @BR-BILLING-007 @AP-BILLING-005
  Scenario: AC-BILLING-010 — SCOPE_IDENTITY hisNo PK-FK
    Given ERP 5건 + SCOPE_IDENTITY 함수 사용 가능
    When 확정 처리
    Then TB_SGMA_CONFIRM_HIS 1 row (HIS_NO PK SCOPE_IDENTITY) + TB_SGMA_CONFIRM_HIS_DATA 5 row (HIS_NO FK = 직전 SCOPE_IDENTITY)
    And ★ characterization mode 보존 / 새 시스템 invariant = PostgreSQL RETURNING + Oracle SEQUENCE carry

  # ────────────────────────────────────────────────────────────
  # UC #3 — BHV-BILLING-004 (ERP 부재 skip)
  # ────────────────────────────────────────────────────────────

  @must @characterization-mode @BR-BILLING-004
  Scenario: AC-BILLING-011 — ERP 부재 시 skip + JSP alert + no-op
    Given SGERPMA row count == 0 + TB_SGMA_CONFIRM 기존 상태
    When 확정 처리
    Then pre-check==0 + 4 SQL skip + DB 변경 ❌ + JSP alert + no-op idempotency

  # ────────────────────────────────────────────────────────────
  # UC #4 — BHV-BILLING-005 (Qlik iframe)
  # ────────────────────────────────────────────────────────────

  @should @characterization-mode @BR-BILLING-008 @AP-BILLING-013 @URL-hardcoded
  Scenario: AC-BILLING-012 — Qlik iframe + URL hardcoded as-is
    Given menuNm='sales', appid='app-uuid-123', sheet='sheet-uuid-456'
    When Qlik View 화면 진입
    Then ModelAndView 모델 전달 + JSP qlikView 렌더 + iframe src = 'https://datacafe.smilegate.net/sense/app/app-uuid-123/sheet/sheet-uuid-456/state/analysis' (★ URL hardcoded)
    And ★ characterization mode 보존 / 새 시스템 invariant = ${qlik.base.url} 환경 변수 의무 (carry C-stack-결단-chain-3-4-plan)
```

---

## ★ ★ ★ 본 AC 작성 사상 정합 (★ 4 UC 종결)

### 1. Cucumber.io Better Gherkin (Agent 1 finding)

- ★ Describe Behavior NOT Implementation / Declarative > Imperative / Then = observable output only

### 2. SBE (Gojko Adzic 2011)

- ★ "Examples are the contract" — 12 AC = chain 3+4 executable contract

### 3. MoSCoW (DSDM)

- must×8 (AC-BILLING-001+002+004+005+007+008+009+010+011) + should×4 (AC-BILLING-003+006+012)
- ★ ★ ★ AC-BILLING-008 = ★ critical must (★ TDD intent 정면 위배 / characterization mode 핵심)

### 4. ★ ★ ★ characterization mode 명시 (Michael Feathers 2004)

- 12 AC 모두 = `@characterization-mode` tag
- ★ ★ AC-BILLING-008 = `@critical` + `@TDD-violation` + `@migration-priority-P0` (★ ★ ★ critical / 부분 commit assertion)

### 5. chain 3 forward link (TC-* placeholder 12건)

★ ★ chain 3 진입 전 = ★ ★ **C-stack-결단-chain-3-4-plan** carry 정합 — option (i) Legacy / (ii) Modern / (iii) characterization 만 결단.

---

## 참조

- behavior-spec: `.aimd/output/behavior-spec.json` + `.md`
- planning-spec: `.aimd/output/planning-spec.json`
- traceability-matrix: `.aimd/output/traceability-matrix.json` (chain 2 종결 partial / status=yellow / chain 3+4 종결 후 green)
- chain 2 plan: `~/.claude/plans/k-poc-11-chain-2-plan.md`
- 외부 권위: Cucumber Gherkin + SBE 2011 + MoSCoW + Michael Feathers 2004 + GitHub Spec Kit (★ 4단계 동형) + TDAD arxiv 2603.17973
- 사용자 결단 4건 (Q1 PATCH v2.3.5 + Q2 4 UC + Q3 (b) characterization mode + Q4 carry 2건)
