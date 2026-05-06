# agents/planning/ — chain 1 (기획) stage agent (★ v2.0)

★ ★ v2.0 SDLC 4단계 chain harness 의 chain 1 stage. DEC-2026-05-06-v2.0-i-strict-채택 정합. master plan `~/.claude/plans/a-stateful-gadget.md`.

## 역할

chain 1 (planning) = **legacy 분석 결과로부터 비즈니스 의도 추출** (1차 single-case / 사용자 답변 1번 정합). 산출물 = `planning-spec.{json,md}` (deliverable 17 / sub-plan-2 신설).

★ 1차 input: analysis stage 7대 + 8 FE 산출물 + finding-system + antipatterns + migration-cautions.
★ use case 4종 (legacy 재구축 / 신규 PRD / 수정 / 버그) 분기 = v2.1+ carry K-1.

## agent persona (sub-plan-4 정식 채움)

| persona | 역할 |
|---|---|
| **PM** | 비즈니스 우선순위 / 이해관계자 align / story decomposition (사용자 명시 / AI 가이드만) |
| **domain-expert** | 도메인 모델링 깊이 / 업종별 표준 (e.g., 금융 / 의료 / e-commerce) — analysis 산출물의 domain.json 보강 |
| **legacy-archaeologist** ★ v2.0 신설 | analysis 산출물 → 사용자 의도 자연어 추론 / 모든 BR-* 의 "왜 이 규칙인가" reasoning + source-grounded evidence 의무 |

## 5 영역 매트릭스 — planning stage

| 영역 | 강도 | 설명 |
|---|---|---|
| 기획 | 강 | stage 의 핵심 — planning-spec.use_cases / business_intent / business_rules_intent |
| 디자인 | 강 | 정보 구조 / 사용자 여정 (chain 2 spec → chain 3 test 까지 forward link) |
| FE | 약 | 화면 단위 우선순위 / FE 영역 분량 추정 |
| BE | 약 | 도메인 영역별 BE API 우선순위 |
| DB | 약 | 도메인 entity 1차 식별 (스키마 ❌ / analysis stage 산출 reuse) |
| 공통 | 약 | 비즈니스 우선순위 / 이해관계자 align |

## 기술 스택 분기 정책

기술 스택별 차이는 SKILL.md 본문 분기로 표현 (★ analysis stage `phase-1-inventory` 패턴 차용 / methodology-spec/skills-axis.md §3 참조). 디렉토리 분리 ❌ / frontmatter enum ❌.

## 인터페이스 (lifecycle-contract.md §chain 1)

- input (analysis → planning): 7대 + 8 FE 산출물 + finding + antipatterns + migration-cautions
- 산출물 (planning → spec): planning-spec.{json,md} (deliverable 17)
- ★ ★ ★ go/stop gate #1 (사용자 검토 / ADR-CHAIN-002 정합)
- ★ ★ no-simulation 강화 — 모든 추출은 source-grounded (`legacy_evidence` 필드 의무 / planning-extraction-validator 자동 검증)

## skills

- `skills/planning/extract-from-legacy/` ★ sub-plan-4 채움 ✅ (chain 1 main)
- `skills/planning/decompose-use-cases/` ★ sub-plan-4 채움 ✅
- `skills/planning/identify-business-intent/` ★ sub-plan-4 채움 ✅

## v2.x carry

- use case 4종 (legacy 재구축 / 신규 PRD / 수정 / 버그) entry flow 분기 → v2.1+ (carry K-1)
- external orchestrator (Jira / Confluence / Notion) integration → v2.x (carry K-4)
