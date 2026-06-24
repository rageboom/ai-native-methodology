# DEC-2026-06-24-complexity-tier-fastpath

**결정**: discovery 를 분석 외 모든 변경의 **보편 입구**로 유지(우회 0)하되, 변경 복잡도에 따라 **체인 깊이**를 조절하는 3-tier(`trivial`/`standard`/`deep`) 라우팅 도입. `trivial` 은 fast-path(thin change-record + impact + 경량 단일-OP 티켓)로 경량 진행하되, **⑥영향도·⑦Jira·최소검증은 tier 무관 공통 의무**로 결정론 fail-closed 게이트(`fastpath-gate`)가 강제(면제 ❌). tier 판정은 결정론 도구에 넣지 않음(STRONG-STOP) — 신호=`triage`(도구) / 제안=discovery skill(LLM) / 확정=사람 gate#1. (MIS-371 / OP-CHAINROUTE-001 / additive·soft)

## 배경

context-ops 사용 시 분석 외 일반 변경은 discovery 가 입구·라우터(`DEC-2026-06-18-discovery-universal-entry-router`)다. 그러나 질의가 **너무 쉬우면** 두 실패 모드가 있었다.
- (A) 체인을 아예 안 타고 LLM 이 그냥 처리 → 거버넌스/추적성 drift.
- (B) 강제로 풀 체인(spec/plan/test/implement 스킬 팬아웃 + multi-agent dispatch)을 태우면 trivial 변경에 토큰 낭비.

실측(diagnose-before-design / `feedback_diagnose_before_design_check_existing`): `routeEntry` 는 이분법(work-intent→discovery / else 침묵)이라 **복잡도 triage 자체가 부재**. 반면 ⑥영향도(`impact-analyzer`+`chain-driver impact`+PostToolUse mark) 와 ⑦Jira(`ticket-sync`+`ticket-cascade-builder`)는 성숙했고, `policy-evaluator` 는 이미 `typo/item_add/item_remove/semantic_change` 변경종류를 구분. `living-sync §4` 에도 "레벨·등급" 개념 존재. → 진짜 델타 = **trivial triage + fast-path** + ⑥⑦를 fast-path 에 결선.

## 옵션

- **옵션 1 (채택)**: discovery 입구 유지 + 3-tier 깊이 조절 + trivial fast-path. ⑥⑦·최소검증 = 경로-무관 공통 의무로 fail-closed 게이트 강제.
- **옵션 2**: 코드 write 까지 PreToolUse 하드블록으로 강제 강도 상향. → 과격(false-block 위험) / PoC 후 별도 DEC 로 deferred.
- **옵션 3**: 현상 유지(triage 없음). → 비채택(drift/낭비 미해소).

사용자(TF Lead) 일괄 승인(2026-06-24): ①3-tier ②trivial=최소검증 유지(완전 면제 ❌) ③강제 강도=advisory+tier gate 시작(코드 하드블록 deferred) ④신규 thin schema. 가벼운 3-에이전트 research(F-015 교차검증 + 산업선례 + Senior 적대검토) 반영.

## 결정 (옵션 1 시행)

- **schema**(`schemas/change-record.schema.json` 신규 / strict additive): trivial fast-path 산출물. `tier=const "trivial"` + `touched_node_refs`(minItems1) + `triage_signals`{count/net_new/layer_span/subkinds/predicate_satisfied} + `verification`{`characterization_snapshot_refs`(`^SNAP-`)/`oracle_waiver`} + `impact_closure_ref` + `ticket_ref`. standard/deep 은 본 schema 미사용(기존 discovery-spec 풀 경로).
- **`tools/chain-driver/src/triage.js` 신규** — `computeTriageSignals(graph, refs)` 순수 결정론. **raw count 신호만 / tier 판정 ❌**(Senior Q3 / `feedback_chain_driver_deterministic_axis`). `change_kind`(LLM 선언값) 미입력. 보수적 conjunctive 술어: `count==1 ∧ !net_new ∧ layer_span==1 ∧ subkind∉{BR,UC}` + business_rule_id 보유 노드 deny(Senior Q1 — "1노드 高의미 BR" 누수 차단).
- **`tools/chain-driver/src/fastpath-gate.js` 신규** — `evaluateFastPathRecord(record)` 순수 fail-closed. trivial record 종결 전 4 의무 전수: predicate_satisfied + 최소검증(snapshot≥1 OR waiver / Senior Q2 거짓 GREEN 함정 회피) + impact_closure_ref + ticket_ref. 위반=violations(high)→cli exit 1. 비-trivial=N/A(exit 0).
- **cli**(`tools/chain-driver/src/cli.js`): `triage --graph --refs [--json]` + `fastpath-gate --record [--json]` 서브커맨드 + usage.
- **라우터**(`hooks-bridge.js` routeEntry advisory 메시지): discovery-default 안내에 tier triage/fast-path 사용법 동봉(로직 분기 아님 — 안내).
- **skill**(`skills/discovery-from-nl-md/SKILL.md`): "복잡도 tier 분기" 절 추가 — 닿는 노드 식별 → `triage` 신호 → tier 제안 → 사람 gate → trivial 시 fast-path(change-record + impact + 경량 ticket + fastpath-gate).
- **flow**(`flows/discovery.phase-flow.json` cross_cutting.fast_path): tier 분기·도구·공통의무 메타 등재(phases 배열 무변경 / drift 짝 보존).

## 검증

- **신규 20 test GREEN**: `triage-fastpath.test.js` 16(triage 8 / fastpath-gate 8) + `fastpath-e2e.test.js` 4(CLI E2E 3 시나리오 + N/A).
- **≥3 시나리오 실증**(§8.1 / Senior Q4): (a) typo trivial 단일 IMPL → predicate true + 적격 종결 exit 0 / (b) item_remove trivial(i18n 키) → snapshot 으로 종결 exit 0 / (c) **적대 negative** BR 노드 → 1노드·단일레이어여도 predicate false + fastpath-gate 이중 차단 exit 1.
- **fan-out 구조 실측**(추정 ❌ / flows 기반): 풀체인(standard·deep) = discovery5+spec7+plan5+test7+implement8 = **32 phase / 5 stage-agent dispatch**. fast-path(trivial) = discovery skill 1 + triage·impact·ticket·gate(결정론) = **1 LLM skill / 0 추가 stage-agent** → spec+plan+test+implement **27 phase + 4 agent dispatch 생략**.
- **chain-driver 회귀 680/680**(+신규 20) + hooks 65/65 + schema-validator 113/113 + drift-validator 49/49 + skill-citation 0 stale 무회귀.
- **change-record schema E2E**: 유효 record valid / 무효(tier≠trivial·빈 refs·SNAP패턴위반·additionalProperties) 전수 거부 확인.

## 후속 / §8.1

- **carry**: 라이브 세션 실토큰 before/after 실측(fan-out 구조 count 는 위 검증서 완료 / 실제 토큰은 end-to-end 라이브 사용 시 / 본 worktree 외) + committed example PoC 에 fast-path 실적용(메커니즘 신규 = 현 example 미사용 / 첫 dogfood 시 등재).
- **deferred**: 코드 write 하드블록(옵션 2 / PoC 후 별도 DEC) · 경량 ticket 모드의 ticket-sync 정식 결선 · 산업선례상 "노드 수" 위상 신호는 단독 선례 0건 → 의미축(deny-list)과 conjunctive 결합 유지.
- **§8.1**: additive·soft(schema strict 신규 / 도구 신규 / gate matrix·release criteria 무변경). hard 격상(강제 강도 상향 / REQUIRED 등재)은 ≥2 PoC corroboration 후 별도 promotion DEC.
