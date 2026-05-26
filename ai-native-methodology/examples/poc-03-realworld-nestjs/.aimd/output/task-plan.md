# Task Plan — poc-03-realworld-nestjs

> chain 3 (plan) stage 산출물 / v10.1.0 plan-agent 본격 dispatch / DEC-2026-05-26-discovery-input-bodies §C-v4.1-poc-재실행 carry 종결 / NestJS RealWorld 규약 정합.

## tasks (2 / 1 AC per task)

| id | title | ac_refs | layer | module |
|---|---|---|---|---|
| TASK-USER-SIGNUP-001 | Signup — email/username unique + argon2 + JWT 발급 | AC-USER-SIGNUP-001 | application | user |
| TASK-USER-LOGIN-001 | Login — credential 검증 + JWT 반환 | AC-USER-LOGIN-001 | application | user |

## ADRs (2 / Nygard lib + interface trigger)

- **ADR-USER-001 accepted** — Password 해싱 = **argon2id** (OWASP 2026 1순위 / 대안 bcrypt/scrypt/PBKDF2 비교).
- **ADR-USER-002 accepted** — Authentication token = **JWT** (RealWorld 규약 정합 / stateless / NestJS 통합 / 대안 Session/Opaque/PASETO 비교).

## risks (4 / security 중심)

| id | severity | type | description (요약) |
|---|---|---|---|
| RISK-USER-001 | high | security | Password weak hash → DB leak rainbow table 공격 |
| RISK-USER-002 | high | security | JWT secret leak → token forgery / impersonation |
| RISK-USER-003 | medium | security | JWT 만료 전 revocation 어려움 (logout/lockout) |
| RISK-USER-004 | medium | concurrency | Email/username race (DB UNIQUE 의무) |

## NFR allocation (4 / ISO/IEC 25010:2023)

| id | characteristic | severity | description (요약) |
|---|---|---|---|
| NFR-USER-001 | security | **critical** | argon2id + JWT secret env / production RS256 + rotation |
| NFR-USER-002 | performance_efficiency | medium | Login ≤ 250ms / signup ≤ 350ms (p95) |
| NFR-USER-003 | security | high | JWT expiry ≤ 24h + refresh rotation + revocation strategy |
| NFR-USER-004 | reliability | high | DB UNIQUE constraint (email + username atomic) |

## 인용

- DEC-2026-05-21 + DEC-2026-05-26-discovery-input-bodies (carry 종결)
- `agents/plan-agent.md` v10.0.0 본격 / `schemas/task-plan.schema.json`
- RealWorld spec (gothinkster/realworld) JWT 규약
- OWASP Password Storage Cheat Sheet (argon2id 1순위)
