# Task Plan — poc-04-mini-realworld-react

> chain 3 (plan) stage 산출물 / DEC-2026-05-21-chain-discovery-plan-stage-도입 정합 / v10.1.0 plan-agent 본격 dispatch 결과 / DEC-2026-05-26-discovery-input-bodies §C-v4.1-poc-재실행 carry 종결.

## meta

- generated_at: 2026-05-26T10:00:00Z
- methodology_version: v10.1.1
- confidence: 0.85
- inputs: behavior-spec.json + acceptance-criteria.json + planning-spec.json

## tasks (1 / 1 AC = 1 task / minimum granularity)

| id | title | ac_refs | layer | module |
|---|---|---|---|---|
| TASK-FE-LOGIN-001 | FE Login form 구현 + JWT 저장 + /settings redirect | AC-FE-LOGIN-001 | presentation | auth |

## ADRs (1 / Nygard 5 category — lib choice trigger)

- **ADR-FE-LOGIN-001 accepted** — Login form 검증 library = **Zod** 채택. 대안 3종 (react-hook-form manual / Yup / Joi) 비교 후 TypeScript 추론 + schema 1곳 정의 + BE/FE 공유 강점 우선.

## risks (2 / 3중 망 sample)

| id | severity | type | description (요약) |
|---|---|---|---|
| RISK-FE-LOGIN-001 | medium | security | localStorage JWT 저장 XSS 노출 (CSP + 장기 httpOnly cookie 마이그레이션) |
| RISK-FE-LOGIN-002 | low | design | client 검증만 신뢰 시 BE 검증 누락 위험 (BE 검증 필수 paradigm) |

## NFR allocation (3 / ISO/IEC 25010:2023 SQuaRE)

| id | characteristic | severity | description (요약) |
|---|---|---|---|
| NFR-FE-LOGIN-001 | performance_efficiency | medium | Login API ≤ 500ms p95 / perceived latency ≤ 800ms |
| NFR-FE-LOGIN-002 | security | high | HTTPS only / token rotation / expiry ≤ 24h |
| NFR-FE-LOGIN-003 | usability | medium | a11y (aria-label / focus mgmt / aria-live error announcement) |

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (plan stage 신설 모 결단)
- DEC-2026-05-26-discovery-input-bodies §C-v4.1-poc-재실행 (본 task-plan 의 carry 종결 결단)
- `agents/plan-agent.md` v10.0.0 본격 (chain 3 = gate #3 / 본 산출 dispatch)
- `schemas/task-plan.schema.json` (산출 schema)
