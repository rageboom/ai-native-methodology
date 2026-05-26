# Task Plan — poc-14-fsim-corroboration

> chain 3 (plan) stage 산출물 / v10.1.0 plan-agent 본격 dispatch / DEC-2026-05-26-discovery-input-bodies §C-v4.1-poc-재실행 carry 종결 / F-SIM corroboration PoC.

## tasks (4 / 1 AC per task)

| id | title | ac_refs | layer | module |
|---|---|---|---|---|
| TASK-USER-FSIM-001 | Signup — email unique + pwd ≥8 + argon2 + 409/422 | AC-USER-FSIM-001 | application | user |
| TASK-USER-FSIM-002 | Login — credential 검증 + JWT | AC-USER-FSIM-002 | application | user |
| TASK-TODO-FSIM-001 | Todo create — req.user.id 매핑 + title 검증 | AC-TODO-FSIM-001 | application | todo |
| TASK-TODO-FSIM-002 | Todo update — ownership 검증 (IDOR 차단) + NotFound | AC-TODO-FSIM-002 | application | todo |

## ADRs (2 / lib + interface trigger)

- **ADR-USER-001 accepted** — Password 해싱 = **argon2id** (OWASP 1순위).
- **ADR-TODO-001 accepted** — Todo 소유자 검증 = **service-level ownership check** (대안 middleware/DB RLS/CASL 비교 / IDOR 차단 + NotFound enumeration 차단 우선).

## risks (4)

| id | severity | type | description (요약) |
|---|---|---|---|
| RISK-USER-001 | high | security | Password weak hash → DB leak rainbow table |
| RISK-USER-002 | medium | security | Login brute-force / timing attack |
| RISK-TODO-001 | **high** | security | **IDOR** — 타인 todo update / ownership check 누락 |
| RISK-TODO-002 | medium | design | client user_id inject → req.user.id 무시 위험 (DTO 차단) |

## NFR allocation (4)

| id | characteristic | severity | description (요약) |
|---|---|---|---|
| NFR-USER-001 | security | **critical** | argon2id + DB encryption + password 로그 ❌ |
| NFR-TODO-001 | security | **critical** | **IDOR 차단** — service-level ownership + NotFound |
| NFR-API-001 | performance_efficiency | medium | User ≤ 250ms / Todo ≤ 100ms (p95) |
| NFR-USER-002 | reliability | high | DB UNIQUE constraint (email atomic) |

## 인용

- DEC-2026-05-21 + DEC-2026-05-26-discovery-input-bodies (carry 종결)
- `agents/plan-agent.md` v10.0.0 본격 / `schemas/task-plan.schema.json`
- OWASP Password Storage Cheat Sheet / OWASP Top 10 A01:2021 Broken Access Control (IDOR)
