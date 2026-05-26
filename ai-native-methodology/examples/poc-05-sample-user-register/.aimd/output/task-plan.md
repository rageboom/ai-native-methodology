# Task Plan — poc-05-sample-user-register

> chain 3 (plan) stage 산출물 / v10.1.0 plan-agent 본격 dispatch / DEC-2026-05-26-discovery-input-bodies §C-v4.1-poc-재실행 carry 종결.

## tasks (2 / 1 AC per task)

| id | title | ac_refs | layer | module |
|---|---|---|---|---|
| TASK-USER-001 | 신규 사용자 등록 — email unique + password 해싱 + 409 | AC-USER-001 | application | user |
| TASK-USER-002 | 로그인 — credential 검증 + 401 / user 객체 반환 | AC-USER-002 | application | user |

## ADRs (1 / Nygard lib-choice trigger)

- **ADR-USER-001 accepted** — Password 해싱 = **argon2id** (OWASP 2026 1순위 / memory-hard / side-channel-resistant). 대안 3종 (bcrypt / scrypt / PBKDF2-SHA256) 비교 후 GPU 저항 + OWASP 권장 우선.

## risks (4 / 3중 망 / security 위주)

| id | severity | type | description (요약) |
|---|---|---|---|
| RISK-USER-001 | high | security | Password 평문/weak hash → DB leak 시 rainbow table 공격 |
| RISK-USER-002 | medium | security | Email enumeration via signup 409 → phishing target list |
| RISK-USER-003 | high | security | Login brute-force / timing attack |
| RISK-USER-004 | medium | concurrency | Email uniqueness race (application-only 검증 부족) |

## NFR allocation (4 / ISO/IEC 25010:2023)

| id | characteristic | severity | description (요약) |
|---|---|---|---|
| NFR-USER-001 | security | **critical** | argon2id + DB encryption + password 로그 ❌ |
| NFR-USER-002 | performance_efficiency | medium | Login ≤ 200ms / signup ≤ 300ms (p95) |
| NFR-USER-003 | security | high | rate limit + CAPTCHA + account lockout |
| NFR-USER-004 | reliability | high | DB UNIQUE constraint atomic (race 차단) |

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 / DEC-2026-05-26-discovery-input-bodies (carry 종결)
- `agents/plan-agent.md` v10.0.0 본격 / `schemas/task-plan.schema.json`
- OWASP Password Storage Cheat Sheet (argon2id 1순위 권장 source)
