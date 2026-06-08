---
name: analysis-api-rule-mapping
description: Use after analysis-formal-spec-validation to finalize business-rules.json with formal spec links. BE+FE common. Cross-references to openapi.yaml + schema.json + state-map.json. Stage = analysis.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-api-rule-mapping — 규칙 최종화

`business-logic` phase 의 business-rules.json 을 다른 `api` phase 산출물과 cross-link.

## 사전 조건

- analysis-formal-spec-validation 완료
- (있다면) analysis-openapi / analysis-db-schema-erd / analysis-ui-state-map-fe 결과 참조

## 절차

1. **rules ↔ openapi 매핑** — 각 endpoint 가 어떤 rule 적용 받는지 (e.g., POST /users → DT-USER-VERIFY)
2. **rules ↔ schema 매핑** — DB constraint 가 rules 의 어느 항목과 정합 / 불일치
3. **rules ↔ state-map 매핑** (FE) — UI state transition rules
4. **fe_validation 분리** — `auto_extracted=true` (Zod / Yup / RHF / class-validator 자동 추출) + `auto_extraction_source_id` 명시
5. **decision-table-validator 재실행** — link 추가 후 정합 확인

## 산출물

`<user-project>/.ai-context/output/business-rules.json` (cross-link 강화 + meta_confidence 갱신)

## 인용

- 정책: methodology-spec/deliverables/5-business-rules.md
- ADR: ADR-FE-005 (fe_validation 자동 추출 분리)
