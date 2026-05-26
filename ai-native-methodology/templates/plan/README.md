# templates/plan/ — chain 3 (plan stage) template

★ v10.0.0 chain harness. chain 3 (plan / spec ↔ test 사이 HOW 단계 / hard gate #3) 의 task-plan template placeholder. plan stage 산출물 = `task-plan.{json,md}` (task 분해 + 의존성 + ADR + NFR allocation + risk + rollback).

## 본 디렉토리 자산

현재 active template 파일 부재 (다른 chain stage 와 동형 placeholder). task-plan 골조는 `skills/plan-decompose-and-sequence` 가 `schemas/task-plan.schema.json` 정합으로 직접 생성하고, `_base-apply-template` 는 해당 schema 를 골조 source 로 사용한다.

## 향후 채움 후보

- `task-plan.template.json` (★ `schemas/task-plan.schema.json` 정합 — tasks[] + adrs[] + risks[] + nfr_allocation[] + rollback_strategy 골조)
- `task-plan.template.md` (사람 눈 / ADR-008 v2 이중 렌더링)
- `adr.template.md` (Nygard 5 category + security_compliance + alternatives ≥3)

## 참조

- [`../../skills/`](../../skills/) — chain 3 skill 3종 (plan-decompose-and-sequence · plan-architect-decisions · plan-risk-and-nfr)
- [`../../agents/plan-agent.md`](../../agents/plan-agent.md) — chain 3 단일 entry point
- [`../../schemas/task-plan.schema.json`](../../schemas/task-plan.schema.json) — 산출 schema (deliverable 22)
- [`../../flows/plan.phase-flow.json`](../../flows/plan.phase-flow.json) — chain 3 phase flow (gate-3)
