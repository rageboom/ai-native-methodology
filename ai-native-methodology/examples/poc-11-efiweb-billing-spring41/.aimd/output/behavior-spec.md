# PoC #11 EFI-WEB billing — Behavior Spec (chain 2 / 4 UC 종결)

> ★ ★ ★ ★ chain 2 stage 종결 (4 UC 모두 / 5 BHV + 12 AC).
> ★ ★ ★ **characterization mode** (사용자 결단 Q3 = (b) / 현 behavior 보존 / bug fix ❌) — BR-BILLING-CONFIRM-002/005/006 as-is 보존 / Michael Feathers 2004 정합 / ★ ★ TDD intent 정면 위배 정합 명시.

---

## meta

| 항목 | 값 |
|---|---|
| 생성 | 2026-05-13T22:30:00Z |
| methodology | v2.3.5 |
| confidence | 0.83 |
| derivation | planning-spec.json + analysis 4종 + sql-inventory + 4 characterization snapshot |

---

## ★ ★ 5 BHV / 4 UC 매핑 표

| BHV | UC | name | severity |
|---|---|---|---|
| BHV-BILLING-001 | UC-BILLING-001 | 데이터 확정처리 화면 진입 + year/법인 select | high |
| BHV-BILLING-002 | UC-BILLING-002 | 데이터 확정 목록 조회 (12개월 + cross-DB + window function) | high |
| **BHV-BILLING-003** | UC-BILLING-003 | **★ ★ ★ critical — saveDataConfirm atomicity (★ ★ ★ @Transactional ❌ Legacy bug 보존)** | **critical** |
| BHV-BILLING-004 | UC-BILLING-003 | 데이터 확정 처리 — ERP 부재 시 skip + JSP alert | high |
| BHV-BILLING-005 | UC-BILLING-004 | Qlik Sense iframe 임베드 (URL hardcoded as-is 보존) | medium |

---

## ★ ★ ★ characterization mode 핵심 결단 정합

사용자 결단 (4원칙 §3) Q3 = **(b) characterization mode (현 behavior 보존)** 흡수:

- ★ chain 2 BHV/AC 작성 시 → ★ ★ 현 코드 behavior 그대로 spec 화 (★ bug fix intent 분리 ❌)
- ★ chain 3 RED test → ★ ★ 현 behavior 통과 test (★ ★ Legacy bug 도 expected behavior 로 보존 — 예: AC-BILLING-008 부분 commit assertion)
- ★ chain 4 GREEN impl → ★ ★ 현 코드 (혹은 동등 modernization) 정합 100% test pass

★ ★ ★ ★ **TDD intent 정면 위배 정합 명시** — 일반 TDD = "expected behavior 정의 → impl" / characterization mode = "현 behavior 입증" (Michael Feathers 2004 *Working Effectively with Legacy Code* 정합).

★ ★ ★ **chain 4 GREEN target stack 결단 carry C-stack-결단-chain-3-4-plan** = chain 3+4 진입 전 4원칙 1원칙 재실행 의무.

---

## ★ ★ 5 BHV 상세 (description / invariants 핵심 발췌)

### BHV-BILLING-001 — UC #1 화면 진입

- ★ characterization mode invariant: BR-BILLING-BASEYEAR-005 시작년도 2015 hardcoded as-is
- ★ characterization mode invariant: BR-BILLING-ENTITY-006 COM_NO==2 hardcoded filter as-is (★ ambiguous → expert carry C-domain-PoC11-1)
- AC: AC-BILLING-001 (must) + AC-BILLING-002 (must) + AC-BILLING-003 (should)

### BHV-BILLING-002 — UC #2 12 row 조회

- ★ characterization mode invariant: recursive CTE 12개월 강제 (T-SQL 종속 / AP-BILLING-007)
- ★ characterization mode invariant: cross-DB FQCN FIM.dbo.TB_USER hardcoded (AP-BILLING-006)
- ★ characterization mode invariant: dbo.FN_GET_MONTH UDF + SCOPE_IDENTITY (AP-BILLING-005 SQL Server 종속)
- AC: AC-BILLING-004 (must) + AC-BILLING-005 (must) + AC-BILLING-006 (should)

### ★ ★ ★ BHV-BILLING-003 — UC #3 atomicity (★ ★ ★ critical)

- ★ ★ ★ ★ characterization mode invariant: **@Transactional ❌ saveDataConfirm 4 SQL 비트랜잭션** = ★ Legacy bug as-is 보존 / 새 시스템 invariant = ★ ★ ★ **@Transactional(rollbackFor=Exception.class) + try-catch 의무** (AP-BILLING-001 / BR-BILLING-CONFIRM-002 likely_bug / migration_priority P0)
- ★ ★ characterization mode invariant: full overwrite (delete + insert) 패턴 as-is (BR-BILLING-OVERWRITE-003)
- ★ ★ characterization mode invariant: cross-DB SGERPMA hardcoded as-is (AP-BILLING-006)
- ★ DRY violation invariant: 4 SQL WHERE 절 동일 as-is (patterns_extension_v2)
- AC: AC-BILLING-007 (must) + **AC-BILLING-008 (★ ★ critical must / 부분 commit assertion / TDD intent 정면 위배)** + AC-BILLING-009 (must) + AC-BILLING-010 (must)

### BHV-BILLING-004 — UC #3 ERP 부재 skip

- ★ characterization mode invariant: pre-check skip 정책 as-is (BR-BILLING-ERPDATA-004)
- ★ characterization mode invariant: cross-DB SGERPMA pre-check 의존 as-is (AP-BILLING-006)
- no-op idempotency
- AC: AC-BILLING-011 (must)

### BHV-BILLING-005 — UC #4 Qlik iframe

- ★ characterization mode invariant: Qlik Sense URL `datacafe.smilegate.net` hardcoded as-is (AP-BILLING-013) / 새 시스템 invariant = 환경 변수 `${qlik.base.url}` 의무
- ★ characterization mode invariant: appid + sheet 메뉴별 분기 as-is (BR-BILLING-EXTBI-008)
- AC: AC-BILLING-012 (should)

---

## ★ ★ ★ schema pattern mismatch carry (★ critical / 본 chain 2 발견)

> behavior-spec.json `br_refs` 빈 array (★ ★ schema strict pass 의무 / `additionalProperties: false`) / 사유 = rules.json BR ID 형식 (`"BR-BILLING-BASEYEAR-005"` / 3 segment) vs behavior-spec.schema.json `br_refs` pattern (`"^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$"` / 4 segment) 불일치 / ★ ★ ★ ★ **C-schema-br-pattern-fix carry 신설** (★ schema fix 별도 sprint / 본 PoC + PoC #06+#07 rules.json 모두 동일 패턴 / ★ schema 자체 정정 또는 rules.json 형식 정합 결단 의무). BR 매핑 fact = ★ description + invariants + source_grounded_evidence 안 자연 보존.

---

## ★ ★ chain 2 → chain 3+4 forward link placeholder

| BHV | AC | TC placeholder | IMPL placeholder |
|---|---|---|---|
| BHV-BILLING-001 | AC-BILLING-001~003 | TC-BILLING-001~003 | IMPL-BILLING-001 |
| BHV-BILLING-002 | AC-BILLING-004~006 | TC-BILLING-004~006 | IMPL-BILLING-002 |
| BHV-BILLING-003 | AC-BILLING-007~010 | TC-BILLING-007~010 | IMPL-BILLING-003 |
| BHV-BILLING-004 | AC-BILLING-011 | TC-BILLING-011 | IMPL-BILLING-004 |
| BHV-BILLING-005 | AC-BILLING-012 | TC-BILLING-012 | IMPL-BILLING-005 |

★ ★ chain 3 진입 전 = ★ ★ **C-stack-결단-chain-3-4-plan** carry 정합 — option (i) Legacy / (ii) Modern / (iii) characterization 만 결단.

---

## 참조

- `~/.claude/plans/k-poc-11-chain-2-plan.md`
- `~/.claude/plans/j-chain-2-4-풀가동.md` (B sprint plan)
- `decisions/DEC-2026-05-13-r1-prime-본체-명문화.md` + `decisions/DEC-2026-05-13-not-all-code-인용-복원.md`
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.1.2
- 외부 권위: Cucumber Gherkin + SBE 2011 + Use Case 2.0 + DSDM MoSCoW + Michael Feathers 2004 + GitHub Spec Kit + TDAD arxiv 2603.17973
- F-015 / 가벼운 sub-agent 전략 정합
