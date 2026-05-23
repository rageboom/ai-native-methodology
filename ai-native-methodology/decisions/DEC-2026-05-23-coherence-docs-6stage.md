# DEC-2026-05-23-coherence-docs-6stage

> v9.0.1 PATCH — v9.0.0 이 런타임 SSOT 만 6-stage 마이그레이션하고 prose·briefing·sdlc mermaid·phase-flow chain 링크를 구버전(4·5단계 / "planning")으로 남긴 drift 청산. corrective / breaking 0.

- **결단 일자**: 2026-05-23 (session 42차 / v9.0.1 PATCH)
- **결단자**: 윤주스 (TF Lead) — "계속 진행하자" → coherence docs 먼저(PATCH) + briefing/ 포함 + machine SSOT(mermaid+phase-flow) 포함 묶음 결단
- **범주**: corrective / 6-stage prose + machine SSOT coherence
- **상태**: 승인 / breaking 0 / PATCH

## 컨텍스트

DEC-2026-05-23-discovery-stage-v9 (v9.0.0) 가 `state.schema.json` / stage-graph / `sdlc-4stage-flow.json` stages 등 **런타임 SSOT** 를 6-stage 로 완성했으나, prose 문서(lifecycle-contract / skills-axis / README / guides / plugin-charter 등 14파일) + briefing 3파일 + `sdlc-4stage-flow.mermaid`(json↔mermaid 짝) + 개별 phase-flow.json 의 previous/next chain 링크를 구버전으로 남겼다. 이 중:

- `lifecycle-contract.md` 가 `agents/planning-agent.md`(discovery-agent.md 로 git mv 됨) 를 링크 = **dead link**.
- `chain-harness-guide.md` 의 state enum(`"planning"`/`"done"`) 이 `state.schema.json` `current_chain`(6-stage) 과 **모순**.
- `spec.phase-flow.json` 이 부재 파일 `planning.phase-flow.json` 참조 + spec.next=test(plan 건너뜀) + test.prev=spec.
- `sdlc-4stage-flow.mermaid` 가 "Planning" + plan stage 누락 (drift-validator 가 chain-flow master mermaid 를 semantic 비교 안 해 v9.0.0 STOP-3 통과 — `skill-citation-validator` 도 prose 링크 미검사).

## 결정

### §1. prose 6-stage 정합 (14파일)

planning→discovery 개칭 + plan 신설을 모든 active prose 에 전파. **번호 규칙** = discovery chain1/gate#1 · spec 2/#2 · plan 3/**gate deferred** · test 4/#3 · implement 5/#4 (gate 번호 ≠ chain 번호).

- `lifecycle-contract.md`: dead link→discovery-agent.md + flow 다이어그램 순서 + 자산 매핑 매트릭스 plan row(9) + data-contract plan 절 신설 + scope tree + 전 chain/gate 재번호.
- `skills-axis.md`: §4·§7.2·§9.2 표 (discovery 6 + plan row + count 55).
- `plugin-charter.md`: R3/R7/R10/R11/R12/R13 + revisit_edges 8종.
- `id-conventions.md` / `agents-axis.md` / `deliverables/17-planning-spec.md` / `flows/README.md`(dead ref planning.phase-flow→discovery) / `README.md`(stage 줄·CHAIN 블록·tree) / guides 4종 (`chain-harness-guide.md` state enum→current_chain 6-stage + mermaid + matcher / `first-prompt-cookbook.md` / `getting-started.md` / `common-errors.md`).

### §2. briefing 3종

`01-main.md` + `02-first-5min.md` + `slides/methodology-deck.md` (flow 섹션 + chain 책임 표 + revisit + asset 매핑 + 멀티에이전트).

### §3. machine SSOT

- `sdlc-4stage-flow.mermaid` 6-stage 재작성 (Planning→Discovery + plan subgraph S3 + revisit 8종 + S0~S5 chain 정합).
- `spec/plan/test/implement.phase-flow.json` previous/next chain 링크 정합 (dead ref `planning.phase-flow.json` 제거 + plan 경유) + chain 번호 (test 3→4 / implement 4→5) + `expected_outcome_chain3/4`→`chain4/5`.

### §4. KEEP (reuse / history / 다른 subsystem)

- `planning-spec.json`·`planning-spec.schema.json` 산출물명 (v9.0.0 reuse) / `planning-extraction-validator` 도구 / `subtask_ids.chain1_planning` schema key (`traceability-matrix.schema.json` validated).
- `finding-system.md`·`briefing/04-version-history.md` = audit/version history (immutable).
- ticket 서브시스템 (`ticket-sync` skill `stage=planning` enum + traceability schema 4-chain key) = 자기 정합 / prose-only rename 시 NEW drift → 별도 breaking carry.

## STOP-3

workspace 694/694 + release-readiness 16/16 + skill-citation 235 doc 0 stale + drift state-flow(6=6)+chain-layout(5)+phase-flow 짝 0 breaking + chain-driver 223/223 + version 3-way 9.0.1 + breaking 0 = PATCH.

## carry

- plan-agent 본격 구현 (plan-* skill 3 + plan-spec schema 신설 + plan hard gate) = v9.x+.
- README·briefing version·stat refresh (v3.6.9·v8.2.0 → v9.0.x / test·skill·tool·schema count).
- ticket 서브시스템 6-stage 마이그레이션 (skill enum + schema key chain1_planning..chain4_impl + ticket-policy prose = breaking).
- `templates/planning/` 폴더 rename → `templates/discovery/` (file mv + skill ref 점검).

## 인용

- DEC-2026-05-23-discovery-stage-v9 (v9.0.0 / 본 DEC 가 그 §carry prose coherence 종결)
- DEC-2026-05-21-chain-discovery-plan-stage-도입 (설계 source)
