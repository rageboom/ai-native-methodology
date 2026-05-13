# PoC #11 EFI-WEB billing — Behavior Spec (chain 2 / UC #1 한정)

> ★ ★ ★ chain 2 stage / behavior-spec.json 사람 읽기 렌더 (★ ★ 두 렌더링 사상 / memory `feedback_two_eyes_principle.md` 정합).
> ★ ★ 본 spec = UC-BILLING-001 (데이터 확정처리 화면 진입) **한정** (★ Agent 3 Senior critique signal 4 흡수 / 본 session = UC #1 만 / UC #2~#4 별도 session).
> ★ ★ ★ **characterization mode** (사용자 결단 Q3 = (b) / 현 behavior 보존 / bug fix ❌) — BR-BILLING-005 + BR-BILLING-006 as-is 보존.

---

## meta

| 항목 | 값 |
|---|---|
| 생성 | 2026-05-13T22:00:00Z |
| methodology | v2.3.4 |
| inputs | source_code + domain_context_md + design_specs |
| confidence | 0.85 |
| derivation | planning-spec.json + analysis 4종 + sql-inventory + characterization snapshot |

---

## BHV-BILLING-001 — 데이터 확정처리 화면 진입 + year/법인 select 동작

### 1. 개요

회계 운영자가 인증 + 권한 보유 상태에서 데이터 확정처리 화면에 진입 시, 시스템은:

1. 현재 연도 (currYear) 계산
2. `currYear - 2015 + 1` 개의 연도 select 옵션 생성 (★ BR-BILLING-005)
3. ★ ★ **COM_NO==2 hardcoded filter** 로 1개 법인 옵션 노출 (★ ★ BR-BILLING-006 ambiguous → characterization mode 보존)
4. JSP `dataConfirm.jsp` 렌더

### 2. UC backward link

- **UC-BILLING-001** (데이터 확정처리 화면 진입)

### 3. BR backward link

| BR | 분류 | 정합 mode |
|---|---|---|
| **BR-BILLING-005** | intent | ★ characterization mode = 시작년도 2015 hardcoded as-is 보존 |
| **BR-BILLING-006** | ★ ★ **ambiguous** | ★ ★ ★ characterization mode = COM_NO==2 hardcoded filter as-is 보존 (★ ★ 결제 도메인 expert carry C-domain-PoC11-1 = 추후 의도/버그 결단) |

> ★ ★ ★ **schema pattern mismatch carry (★ critical / 본 chain 2 발견)** — behavior-spec.json `br_refs` 빈 array (★ ★ schema strict pass 의무 / `additionalProperties: false`) / 사유 = rules.json BR ID 형식 (`"BR-BILLING-005"` / 3 segment) vs behavior-spec.schema.json `br_refs` pattern (`"^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$"` / 4 segment) 불일치 / ★ ★ ★ ★ **C-schema-br-pattern-fix carry 신설** (★ schema fix 별도 sprint / 본 PoC + PoC #06+#07 rules.json 모두 동일 패턴 / ★ schema 자체 정정 또는 rules.json 형식 정합 결단 의무). BR 매핑 fact = ★ description + invariants + source_grounded_evidence 안 자연 보존 (★ 본 절 표).

### 4. 전제 조건 (preconditions)

- session 인증 완료 (★ `ifrs_admin` role)
- `authMap` 권한 (★ 7 속성) 존재
- `currYear` = system year accessor 정상 동작

### 5. 결과 조건 (postconditions)

- `currYear` 모델 attribute 전달 (`'currYear'` key)
- `companyList` 모델 attribute 전달 (`'companyList'` key)
- year select option count == `(currYear - 2015) + 1` (★ BR-BILLING-005)
- 법인 select option count == 1 (★ COM_NO==2 hardcoded filter / BR-BILLING-006 ambiguous → characterization mode 보존)
- JSP `dataConfirm.jsp` 렌더 (HTTP 200)

### 6. ★ ★ ★ invariants (★ characterization mode 핵심)

- ★ ★ **characterization mode invariant #1**: BR-BILLING-005 시작년도 **2015** = ★ as-is 보존 (★ 사용자 결단 Q3 = (b) / 결제 도메인 expert 결단 carry **C-domain-PoC11-2** = chain 4 GREEN test 시 bug 보존 의무)
- ★ ★ **characterization mode invariant #2**: BR-BILLING-006 COM_NO==2 hardcoded filter = ★ as-is 보존 (★ 사용자 결단 Q3 = (b) / 결제 도메인 expert 결단 carry **C-domain-PoC11-1** = chain 4 GREEN test 시 bug 보존 의무 / ★ ★ TDD intent 정면 위배 정합)
- year select option order = ASC (시간순)
- ★ ★ **새 시스템 마이그레이션 시 = ★ invariants 정정 의무** (★ chain 3+4 stack 결단 plan carry **C-stack-결단-chain-3-4-plan**)

### 7. AC forward link

- AC-BILLING-001 (must / 화면 진입 + 모델 전달)
- AC-BILLING-002 (must / year select option count)
- AC-BILLING-003 (should / characterization mode / COM_NO==2 hardcoded)

### 8. source-grounded evidence (★ no-simulation 정합)

- characterization snapshot: `characterization/snapshots/UC-BILLING-001-dataConfirm.json`
- [source absolute]:
  - `BillingController.java:48-62` (dataConfirm method)
  - `dataConfirm.jsp:159` (currYear-2015 / year select)
  - `dataConfirm.jsp:169` (COM_NO==2 hardcoded / 법인 select)

---

## ★ ★ ★ characterization mode 결단 정합 (★ chain 2 핵심 결단)

사용자 결단 (4원칙 §3) Q3 = **(b) characterization mode (현 behavior 보존)** 흡수:

- ★ chain 2 BHV/AC 작성 시 → ★ ★ 현 코드 behavior 그대로 spec 화 (★ bug fix intent 분리 ❌)
- ★ chain 3 RED test → ★ ★ 현 behavior 통과 test (★ Legacy bug 도 expected behavior 로 보존)
- ★ chain 4 GREEN impl → ★ ★ 현 코드 (혹은 동등 modernization) 정합 100% test pass

★ ★ ★ **TDD intent 정면 위배 정합 명시** — 일반 TDD = "expected behavior 정의 → impl" / characterization mode = "현 behavior 입증" (Michael Feathers 2004 *Working Effectively with Legacy Code* 정합).

★ ★ **chain 4 GREEN target stack 결단 carry C-stack-결단-chain-3-4-plan** = chain 3+4 진입 전 4원칙 1원칙 재실행 의무 (★ option (i) Legacy 보존 / (ii) Modern 마이그레이션 / (iii) characterization 만 결단).

---

## 참조

- `~/.claude/plans/k-poc-11-chain-2-plan.md` (★ chain 2 plan / Senior critique 흡수)
- `~/.claude/plans/j-chain-2-4-풀가동.md` (B sprint 진입 plan)
- `decisions/DEC-2026-05-13-r1-prime-본체-명문화.md` + `decisions/DEC-2026-05-13-not-all-code-인용-복원.md`
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.1.2 (★ R1' axis 본체)
- 외부 권위: Cucumber Gherkin + SBE 2011 + Use Case 2.0 + DSDM MoSCoW + Michael Feathers 2004 (★ characterization test)
- F-015 / 가벼운 sub-agent 전략 정합
