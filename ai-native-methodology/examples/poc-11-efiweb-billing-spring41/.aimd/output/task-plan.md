# Task Plan — poc-11-efiweb-billing-spring41

> chain 3 (plan) stage 산출물 / v10.1.0 plan-agent 본격 dispatch / DEC-2026-05-26-discovery-input-bodies §C-v4.1-poc-재실행 carry 종결 / ★ 사내 EFI-WEB billing characterization mode / Michael Feathers Working Effectively with Legacy Code 정합.

## tasks (6 / 12 AC / 1-3 AC per task)

| id | title (요약) | ac_refs | layer | module |
|---|---|---|---|---|
| TASK-BILLING-001 | 화면 진입 — 인증/권한 + currYear/companyList | AC-001, 002, 003 | presentation | billing |
| TASK-BILLING-002 | 목록 조회 — 12 row + cross-DB JOIN + window func | AC-004, 005, 006 | infrastructure | billing |
| TASK-BILLING-003 | 확정 처리 happy path — 4 SQL 순차 + full overwrite | AC-007, 009 | application | billing |
| TASK-BILLING-004 | ★ critical characterization — 4 SQL 비TX atomicity loss 보존 | AC-008, 010 | application | billing |
| TASK-BILLING-005 | ERP 부재 skip — count=0 + JSP alert + no-op | AC-011 | application | billing |
| TASK-BILLING-006 | Qlik Sense iframe — URL hardcoded as-is | AC-012 | presentation | billing |

## ADRs (2 / characterization mode + interface)

- **ADR-BILLING-001 accepted** — **Characterization mode 채택** (Michael Feathers paradigm / Q3=(b) 사용자 결단). 4 SQL 비TX bug **as-is 보존** (bug fix ❌). 대안: bug fix / 양쪽 모드 병행 / document only — 모두 reject (legacy 깨짐 / 복잡도 / characterization 본질 결여).
- **ADR-BILLING-002 accepted** — **Cross-DB JOIN as-is** (FIM.dbo.TB_USER). characterization 정합 / 새 시스템 마이그레이션 phase 에서 service-level enrichment.

## risks (5 / 사내 legacy 특성)

| id | severity | type | description (요약) |
|---|---|---|---|
| RISK-BILLING-001 | **high** | design | characterization mode 오인 — 신규 개발자 bug fix 시도 → legacy 깨짐 (★ 주석 의무) |
| RISK-BILLING-002 | high | security | 데이터 확정 권한 누락 시 임의 user 가 재무 데이터 변경 |
| RISK-BILLING-003 | medium | performance | cross-DB JOIN + recursive CTE + window function 성능 |
| RISK-BILLING-004 | medium | design | Qlik URL hardcoded (env 변경 시 manual / 마이그레이션 phase) |
| RISK-BILLING-005 | high | design | full overwrite DELETE+INSERT race window (read 빈 결과 risk) |

## NFR allocation (4 / 회계 시스템 특성)

| id | characteristic | severity | description (요약) |
|---|---|---|---|
| NFR-BILLING-001 | security | **critical** | 데이터 확정 권한 + audit log (재무 무결성 / 회계감사 추적) |
| NFR-BILLING-002 | reliability | high | ★ characterization mode invariant — legacy 100% 보존 |
| NFR-BILLING-003 | performance_efficiency | medium | 목록 ≤ 1s / 확정 ≤ 3s (p95 / cross-DB 비용 인정) |
| NFR-BILLING-004 | maintainability | high | characterization 주석 의무 (코드+test+ADR cross-link) |

## 인용

- DEC-2026-05-21 + DEC-2026-05-26-discovery-input-bodies (carry 종결)
- `agents/plan-agent.md` v10.0.0 본격 / `schemas/task-plan.schema.json`
- Michael Feathers, *Working Effectively with Legacy Code* — characterization test paradigm (★ ADR-BILLING-001 source)
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` (legacy Spring 4.1 + iBATIS 2 paradigm)
