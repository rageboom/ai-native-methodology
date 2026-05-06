# agents/spec/ — chain 2 (스펙) stage agent (★ v2.0 신규)

★ ★ v2.0 SDLC 4단계 chain harness 의 chain 2 stage (★ 신규 디렉토리). DEC-2026-05-06-v2.0-i-strict-채택 정합. master plan `~/.claude/plans/a-stateful-gadget.md`.

## 역할

chain 2 (spec) = **planning-spec + analysis 7대 산출물 통합 → executable behavioral contract** 추출.

사용자 답변 (3) "현 7대 + 신규 추가 산출물" 정합:
- 현 7대 산출물 = ★ 변경 ❌ / behavior-spec.cross_links 가 모두 reference (cross-link coverage 강제)
- 신규 추가:
  - `behavior-spec.{json,md}` (deliverable 18 / sub-plan-2 신설) — Phase 4.5 (state-machine / sequence / decision-table / invariant / property-test) 의 chain 2 격상 + planning-spec.use_cases 흡수
  - `acceptance-criteria.{json,md}` (deliverable 19 / sub-plan-2 신설) — Gherkin BDD AC-* / verifiable=true 의무 / MoSCoW

## agent persona (sub-plan-4 정식 채움)

| persona | 역할 |
|---|---|
| **spec-architect** | behavior-spec / acceptance-criteria 통합 설계 / chain 2 cross-link |
| **bdd-author** | Gherkin (Given/When/Then) acceptance-criteria 작성 / verifiable 의무 |
| **formal-spec-extractor** | Phase 4.5 산출물 chain 2 격상 / state-machine + decision-table + invariant + property-test 통합 |

## 5 영역 매트릭스 — spec stage

| 영역 | 강도 | 설명 |
|---|---|---|
| 기획 | 약 | planning-spec.use_cases backward link |
| 디자인 | 약 | UI behavior 정합 / state-map cross-link |
| FE | 강 | form-validation BR / FE behavior contract / acceptance-criteria FE |
| BE | 강 | API contract / domain BR / decision-table / invariant |
| DB | 강 | schema 정합 / 데이터 invariant |
| 공통 | 강 | acceptance-criteria cross-link 강제 / drift-validator + chain-coverage-validator |

## 기술 스택 분기 정책

기술 스택별 차이는 SKILL.md 본문 분기로 표현 (★ analysis stage `phase-1-inventory` 패턴 차용). spec 표기 = ★ formal-spec 자산 (state-machine / sequence / decision-table) + Gherkin BDD = framework 무관.

## 인터페이스 (lifecycle-contract.md §chain 2)

- input (planning + analysis → spec): planning-spec.json + 7대 + 8 FE 산출물 + Phase 4.5 산출물 + finding
- 산출물 (spec → test): behavior-spec.json + acceptance-criteria.json + 7대 산출물 통합 reference
- ★ ★ ★ go/stop gate #2 (사용자 검토 / ADR-CHAIN-002 정합)
- ★ ★ chain-coverage-validator 자동 검증 — UC→BHV→AC 1:N 정합 + verifiable=true + coverage ≥ 0.85

## skills

- `skills/spec/compose-behavior-spec/` ★ sub-plan-4 채움 ✅ (chain 2 main)
- `skills/spec/derive-acceptance-criteria/` ★ sub-plan-4 채움 ✅ (Gherkin BDD AC-*)
- `skills/spec/integrate-7대-deliverables/` ★ sub-plan-4 채움 ✅ (cross-link 강제)

## 검증 도구

| 도구 | 역할 | sub-plan |
|---|---|---|
| chain-coverage-validator (★ 신규) | UC→BHV→AC 1:N + verifiable + coverage ≥ 0.85 | sub-plan-3 |
| drift-validator (★ 확장) | behavior-spec state-machine + sequence drift | sub-plan-3 (chain 모드) |
| decision-table-validator | DMN 5-check (chain 2 적용) | reuse |
| formal-spec-link-validator (★ 확장) | planning ↔ behavior ↔ acceptance cross-link | sub-plan-3 (chain 모드) |
| spectral-runner | OpenAPI lint (chain 2 안에서 7대 산출물) | reuse |
