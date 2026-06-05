# templates/discovery/ — chain 1 (discovery stage) template

chain 1 (discovery / analysis output + swagger/figma/nl-md 어댑터 → discovery-spec) 의 산출물 template.

## 활성 template

| file                                                             | role                                                                                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`discovery-spec.template.json`](./discovery-spec.template.json) | discovery-spec.json placeholder (UC + BR-INTENT + business_intent + cross_links + decisions) — json 단독 SSOT                                                     |
| [`planning-doc-format.md`](./planning-doc-format.md)             | **기획서 입력 형식 design notes** / 6 component (decision table, entity, use case, flow, NFR, 회피) → 7대 산출물 빈칸 매핑 / 미래 기획서 템플릿 툴 요구사항 source |

## 향후 채움 후보

- `prd.template.md` — Product Requirement Document (planning-doc-format.md C1~C6 기반)
- `epic-screen.template.md` — Epic / FE 화면 단위 decomposition (Epic = FE 화면)

## 참조

- [`../../skills/discovery-from-analysis-output/`](../../skills/discovery-from-analysis-output/) — chain 1 진입 어댑터 skill
- [`../../skills/discovery-from-{swagger,figma,nl-md}/`](../../skills/) — 입력 어댑터 3종
- [`../../skills/discovery-decompose-use-cases/`](../../skills/discovery-decompose-use-cases/) — UC 분해
- [`../../skills/discovery-identify-business-intent/`](../../skills/discovery-identify-business-intent/) — BR-INTENT 추출
- [`../../methodology-spec/deliverables/17-discovery-spec.md`](../../methodology-spec/deliverables/17-discovery-spec.md)
- [`../../methodology-spec/lifecycle-contract.md`](../../methodology-spec/lifecycle-contract.md)
- [`../../schemas/discovery-spec.schema.json`](../../schemas/discovery-spec.schema.json)

## 인용

- `DEC-2026-05-26-discovery-spec-rename` — `templates/planning/` → `templates/discovery/` rename
- `ADR-011` — discovery-spec json 단독 SSOT
