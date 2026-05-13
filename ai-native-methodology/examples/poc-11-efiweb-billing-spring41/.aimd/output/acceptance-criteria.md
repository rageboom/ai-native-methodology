# PoC #11 EFI-WEB billing — Acceptance Criteria (chain 2 / UC #1 / Gherkin .feature 렌더)

> ★ ★ ★ chain 2 stage / acceptance-criteria.json 사람 읽기 렌더 (★ ★ 두 렌더링 사상 / Gherkin .feature 형식).
> ★ ★ 본 spec = UC-BILLING-001 한정 (BHV-BILLING-001 / 3 AC).
> ★ ★ ★ **characterization mode** — BR-BILLING-005 + BR-BILLING-006 as-is 보존 / TDD intent 정면 위배 정합 (Michael Feathers 2004).

---

```gherkin
# language: ko

Feature: BHV-BILLING-001 — 데이터 확정처리 화면 진입 + year/법인 select 동작
  ★ ★ PoC #11 EFI-WEB billing chain 2 UC #1 한정
  ★ ★ characterization mode (현 behavior 보존 / bug fix ❌)

  Background:
    Given "회계 운영자 (ifrs_admin) 가 인증 완료 + authMap 권한 7 속성 보유 상태이다"
    And "currYear = 시스템 현재 연도 accessor 정상 동작 상태이다"

  # ─────────────────────────────────────────────
  # AC-BILLING-001 (must / @chain2 / @characterization-mode)
  # ─────────────────────────────────────────────

  @must @chain2 @characterization-mode
  Scenario: AC-BILLING-001 — 화면 진입 + 모델 전달 + JSP 렌더
    Given 회계 운영자가 인증 + 권한 보유 상태이다
    And currYear 시스템 accessor 정상 동작 상태이다
    When 회계 운영자가 데이터 확정처리 화면에 진입한다
    Then currYear 모델 attribute 가 응답에 포함된다
    And companyList 모델 attribute 가 응답에 포함된다
    And HTTP 200 응답을 받는다
    And JSP dataConfirm 화면이 렌더링된다

    # verifiable: true / automated_runnable: true / test_case_refs: [TC-BILLING-001]
    # gate_required: true / chain 3 RED 진입 시 TC-BILLING-001 실 test 코드 작성 의무

  # ─────────────────────────────────────────────
  # AC-BILLING-002 (must / @BR-BILLING-005 / @characterization-mode)
  # ─────────────────────────────────────────────

  @must @chain2 @characterization-mode @BR-BILLING-005
  Scenario: AC-BILLING-002 — year select option count = (currYear - 2015) + 1
    Given 회계 운영자가 인증 + 권한 보유 상태이다
    And 시스템 현재 연도 currYear = 2026 이다
    When 회계 운영자가 데이터 확정처리 화면에 진입한다
    Then year select option count == 12 (= 2026 - 2015 + 1) 가 표시된다
    And year select option 의 첫 옵션 값 = 2015 이다
    And year select option 의 마지막 옵션 값 = 2026 이다
    And year select option 순서 = 시간순 (ASC) 이다

    # verifiable: true / automated_runnable: true / test_case_refs: [TC-BILLING-002]
    # characterization mode — BR-BILLING-005 시작년도 2015 hardcoded as-is 보존

  # ─────────────────────────────────────────────
  # AC-BILLING-003 (should / @BR-BILLING-006-ambiguous / @domain-expert-carry)
  # ─────────────────────────────────────────────

  @should @chain2 @characterization-mode @BR-BILLING-006-ambiguous @domain-expert-carry
  Scenario: AC-BILLING-003 — 법인 select option count = 1 (★ ★ COM_NO==2 hardcoded filter 보존)
    Given 회계 운영자가 인증 + 권한 보유 상태이다
    And 시스템에 다수 법인 (COM_NO ∈ {1, 2, 3, ...}) 이 등록되어 있다
    When 회계 운영자가 데이터 확정처리 화면에 진입한다
    Then 법인 select option count == 1 (★ COM_NO==2 hardcoded filter 보존)
    And 표시된 법인의 COM_NO == 2 이다
    And 다른 COM_NO (COM_NO != 2) 의 법인은 노출되지 않는다

    # verifiable: true / automated_runnable: true / test_case_refs: [TC-BILLING-003]
    # ★ ★ ★ characterization mode — BR-BILLING-006 ambiguous as-is 보존
    # ★ ★ ★ TDD intent 정면 위배 정합 (Michael Feathers 2004 characterization test)
    # ★ ★ ★ 결제 도메인 expert carry C-domain-PoC11-1 = 추후 의도/버그 결단
```

---

## ★ ★ ★ 본 AC 작성 사상 정합

### 1. Cucumber.io Better Gherkin (Agent 1 finding)

- ★ **Describe Behavior NOT Implementation** — "When 회계 운영자가 데이터 확정처리 화면에 진입한다" (행위 중심) > "When GET /ifrs/billing/dataConfirm" (구현 중심)
- ★ **Declarative > Imperative** — "회계 운영자가 인증 + 권한 보유 상태" (선언) > "POST /login + cookie session + authMap 7 속성 set" (절차)
- ★ **Then = observable output only** — JSP 렌더 / 응답 모델 attribute / option count = ★ 외부 관찰 가능 / DB state 직접 검증 ❌

### 2. SBE (Gojko Adzic 2011) 정합

- ★ "Examples are the contract" — 본 3 AC = ★ chain 3 (test-spec) + chain 4 (impl-spec) 의 ★ executable contract
- ★ Living documentation — Gherkin .feature 형식 = ★ 사람 + AI 모두 읽기 정합

### 3. MoSCoW Priority (DSDM)

- ★ Must (2): AC-BILLING-001 + AC-BILLING-002 (★ 화면 진입 + year select = ★ chain 4 GREEN 의무)
- ★ Should (1): AC-BILLING-003 (★ ★ COM_NO==2 hardcoded = ambiguous / characterization mode → should / 단 verifiable=true)

### 4. ★ ★ ★ characterization mode 명시 (Michael Feathers 2004)

- "characterization test = test that characterizes the actual behavior of a piece of code" (Feathers 2004 / *Working Effectively with Legacy Code*)
- ★ ★ 본 PoC #11 chain 2 = ★ chain 4 GREEN target = ★ 현 코드 behavior 보존 (★ bug fix intent ❌)
- ★ ★ ★ ★ TDD intent (expected behavior 정의 → impl) vs characterization (현 behavior 입증) = ★ 정면 위배 정합 명시

### 5. chain 3 forward link (TC-* placeholder)

| AC | TC placeholder | chain 3 진입 시 실 test 코드 작성 의무 |
|---|---|---|
| AC-BILLING-001 | TC-BILLING-001 | ★ MockMvc / 화면 진입 + 응답 모델 검증 |
| AC-BILLING-002 | TC-BILLING-002 | ★ MockMvc / year select option count assertion |
| AC-BILLING-003 | TC-BILLING-003 | ★ MockMvc + DB seed (COM_NO 다수) / 법인 option count assertion |

★ ★ chain 3 진입 전 = ★ ★ **C-stack-결단-chain-3-4-plan** carry 정합 — option (i) Legacy / (ii) Modern / (iii) characterization 만 결단.

---

## 참조

- behavior-spec: `.aimd/output/behavior-spec.json` + `.aimd/output/behavior-spec.md`
- planning-spec: `.aimd/output/planning-spec.json`
- chain 2 plan: `~/.claude/plans/k-poc-11-chain-2-plan.md`
- 외부 권위: Cucumber Gherkin + Gojko Adzic SBE 2011 + DSDM MoSCoW + Michael Feathers 2004
- F-015 cross-validation 정합 (Agent 1 F-015 / Agent 3 Senior critique)
- 사용자 결단 4건 (4원칙 §3) — Q1 PATCH v2.3.5 (chain 2 종결 후) + Q2 UC #1 만 + Q3 (b) characterization mode + Q4 carry 2건 신설
