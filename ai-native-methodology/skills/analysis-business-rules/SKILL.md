---
name: analysis-business-rules
description: Use after analysis-domain-model to extract business rules as DMN-style decision tables. Generates rules.json (산출물 4 일부). DMN 5-check (duplicate / conflict / gap / overlap / type) auto-validated by decision-table-validator. Stage = analysis.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-business-rules — 비즈니스 규칙 추출

조건 → 결과 매핑을 decision table 형태로 추출. DMN 표준.

## 사전 조건

- `<user-project>/.aimd/output/domain.json` 존재 (analysis-domain-model 완료)

## 절차

1. **rule 후보 수집** — 코드의 if/switch/policy / annotation / config / 비즈니스 logic 함수
2. **decision table 변환** — DMN 5-check 알고리즘 적용 가능한 형태:
   ```json
   {
     "id": "DT-USER-VERIFY",
     "inputs": [...],
     "rules": [{ "conditions": {...}, "outputs": {...} }, ...],
     "hit_policy": "first | unique | rule-order"
   }
   ```
3. **rules.json 작성** — `schemas/rules.schema.json`:
   ```json
   {
     "decision_tables": [...],
     "rule_categories": [...],
     "fe_validation": [...],   // FE form validation (auto_extracted=true 분리)
     "meta_confidence": {...}
   }
   ```
4. **decision-table-validator 자동 호출** — DMN 5-check (duplicate / conflict / gap / overlap / type) 정합 검증
5. **finding 등재** — 검출된 conflict / gap / overlap → `log-finding`

## 산출물

`<user-project>/.aimd/output/rules.json`

## 본체 명세

- `methodology-spec/workflow/business-logic.md` (§5.A rules — `business-logic` phase 안 4영역 병렬 / v3.0.0 phase 의미 ID rename 정합)
- `methodology-spec/deliverables/5-business-rules.md`
- `schemas/rules.schema.json`
- ADR-FE-005 (권위 매개체 13 — Zod / Yup / RHF / class-validator 등 fe_validation 자동 등록)

## 다음

- `analysis-formal-spec-validation` 호출 권장 (도메인 ↔ 규칙 ↔ 인벤토리 정합)
