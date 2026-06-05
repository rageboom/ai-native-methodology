---
name: phase-5-rules
description: Use after phase-4-5-cross-validation to finalize rules.json with formal spec links. BE+FE common. Cross-references to openapi.yaml + schema.json + state-map.json. Stage = analysis.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# phase-5-rules — 규칙 최종화

Phase 4 의 rules.json 을 다른 Phase 5 산출물과 cross-link.

## 사전 조건

- phase-4-5-cross-validation 완료
- (있다면) phase-5-openapi / phase-5-schema-erd / phase-5-state-map 결과 참조

## 절차

1. **rules ↔ openapi 매핑** — 각 endpoint 가 어떤 rule 적용 받는지 (e.g., POST /users → DT-USER-VERIFY)
2. **rules ↔ schema 매핑** — DB constraint 가 rules 의 어느 항목과 정합 / 불일치
3. **rules ↔ state-map 매핑** (FE) — UI state transition rules
4. **fe_validation 분리** — `auto_extracted=true` (Zod / Yup / RHF / class-validator 자동 추출) + `auto_extraction_source_id` 명시 (ADR-FE-005)
5. **decision-table-validator 재실행** — link 추가 후 정합 확인

## 산출물

`<user-project>/.aimd/output/rules.json` (cross-link 강화 + meta_confidence 갱신)

## 본체 명세

- `methodology-spec/deliverables/04-rules.md`
- ADR-FE-005 (권위 매개체 13)
