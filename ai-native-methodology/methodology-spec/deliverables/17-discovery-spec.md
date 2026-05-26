# 산출물 #17: Planning Spec (★ v2.0 chain 1)

> **사상**: ADR-CHAIN-001 (chain 정합 강제) §1 / ADR-008 v2 §10 (이중 렌더링 chain 단계) / ADR-009 v2 §2.5 (planning trust 0.85)
> **schema**: `schemas/discovery-spec.schema.json`
> **생성 phase**: chain 1 (discovery) — `/discovery-from-analysis-output` (skill / ★ v9.0 planning→discovery 개칭 / 산출물 파일명 `planning-spec.json` 은 reuse 유지)
> **gate**: go/stop gate #1 (ADR-CHAIN-002)

## 1. 목적

**답하는 질문**: "legacy 코드베이스의 비즈니스 의도는 무엇이고, 어떤 use case 가 있나?"

**활용**: chain 2 spec stage 의 input. behavior-spec / acceptance-criteria 추출 source.

### 1차 구현 = legacy single-case
- `derivation_source.type = legacy-extraction` 만 (사용자 답변 1번 정합)
- use case 4종 분기 (legacy/신규 PRD/수정/버그) = v2.1+ carry K-1

## 2. 형식

```
.aimd/output/chain-1-discovery/
├── planning-spec.json   # AI 눈
├── planning-spec.md     # 사람 눈 (★ ADR-008 v2 §10 의무)
└── _manifest.yml
```

## 3. 추출 범위 (출처 / 도구 / 신뢰도)

| 항목 | 출처 | 도구 | 신뢰도 (★ ADR-009 v2 §2.5) |
|---|---|---|---|
| business_intent | analysis 산출물 + LLM 추론 | LLM with grounding | 70% (base) → 85% (gate #1) |
| use_cases | domain.json UC-* + 정합 | 결정적 | 90% |
| business_rules_intent | business-rules.json BR-* + reasoning | ★ source-grounded LLM | 75% (★ no-simulation 강화) |
| out_of_scope / risks | analysis finding + AP | LLM 분석 | 70% |
| cross_links | 결정적 grep | 결정적 | 95% |

**입력**: analysis stage 7대 + 8 FE 산출물 (business-rules.json / domain.json / openapi.yaml / schema.json / antipatterns.json / migration-cautions.md + `formal-spec` phase 산출물 + 8 FE).

## 4. 검증 도구

| 도구 | 검증 |
|---|---|
| **discovery-extraction-validator** (★ sub-plan-3 신설 / v11.0.0 rename) | source-grounded coverage / no-hallucination / coverage ≥ 0.80 (analysis BR-/UC- ref 비율) |
| schema-validator (Ajv 8) | discovery-spec.schema.json 구조 정합 |
| traceability-matrix-builder | UC-* row 채움 (matrix.json + matrix.md + matrix.mermaid) |

## 5. 예시 (chain 1 sample)

```yaml
# .aimd/output/chain-1-discovery/planning-spec.json
meta:
  generated_at: "2026-05-06T12:00:00Z"
  confidence: 0.85
  inputs_used: [source_code, planning_docs]
derivation_source:
  type: legacy-extraction
  source_artifacts:
    - .aimd/output/business-rules.json
    - .aimd/output/domain.json
business_intent:
  domain_purpose: "RealWorld blogging platform — article CRUD + social follow"
  stakeholders: [reader, writer, admin]
  success_criteria: [Article CRUD < 200ms, Auth secure]
use_cases:
  - id: UC-USER-001
    name: User Signup
    description: "신규 사용자 등록"
    acceptance_criteria_refs: [AC-USER-001, AC-USER-002]
    source_grounded_evidence:
      - "src/user/UserService.java:30-60 (사용자 작성 / git blame author)"
business_rules_intent:
  - br_id: BR-USER-EMAIL-001
    reasoning: "이메일 unique 제약은 외부 가입 spam 차단 의도"
    source_grounded_evidence: "src/user/UserValidator.java:23"
```

## 6. carry / 후속

| # | 항목 | 시점 |
|---|---|---|
| K-1 | use case 4종 entry flow 분기 | v2.1+ |
| sp2-c1 | framework_neutrality_score 정량 | sub-plan-3 |
