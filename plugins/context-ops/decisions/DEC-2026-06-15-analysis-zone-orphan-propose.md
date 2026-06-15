# DEC-2026-06-15-analysis-zone-orphan-propose

**본체 PATCH v0.46.7 — 미참조 analysis-zone artifact-graph 노드 → 'propose' 강등 (full-chain 병렬 캠페인 dogfood-found / graph-integrity false-block 제거)**

## 맥락 (dogfood 발견)

ep-be-gea full-chain 캠페인(나머지 22 BC 4-worktree 병렬)에서 **모든 lane 의 gate#5 `graph-integrity-validator` 가 orphan 으로 반복 FAIL**. 일부 BC(req-visitprkng)는 stop, 나머지는 매 BC repair 로 통과(토큰/시간 낭비 + 비결정적). strict 검증이 latent drift 노출([[feedback_strict_exposes_drift]]).

## 결함 (systemic / 22 BC 재발)

`traceability-matrix-builder --graph` 가 합성하는 artifact-graph 에서 `analysis-antipatterns`·`analysis-characterization-spec` 등 **analysis-zone 노드는 chain artifact 가 그것을 참조할 때만 edge 를 얻는다**:
- antipatterns ← `AC.related_aps` (CHAIN_TO_ANALYSIS_REFS)
- characterization-spec ← `snapshots[].use_case` → UC (ANALYSIS_TO_CHAIN_REFS)

참조하지 않는 BC(해당 AP 부재 / characterization use_case 토큰 unmatch)는 **정상인데도** 그 노드가 in/out edge 0 + `state=active` → graph-integrity 의 Tier-1 orphan(`state ∈ {active,drift}` + degree 0) 정의에 걸려 **hard-block(exit 1, high)**.

- pilot resv-base(통과): AC related_aps + characterization use_case 우연히 매칭 → edge 보유.
- req-visitprkng(fail): 미참조 → 2 노드 active orphan.
- **근본 오류**: 본류(UC→BHV→AC→TC→IMPL) 무결성과 무관한 **보조 reference-lens 노드를 의무 연결로 오인** = false-block. graph-integrity 의 목적은 chain 본류 무결성이지 analysis-zone 강제 연결이 아님.

## 결정 (사용자 확정 2026-06-15)

캠페인 라이브 중 본체 우선 fix([[feedback_methodology_body_priority]]). 방향 = **graph-synthesizer 가 미참조 analysis-zone 노드를 `propose` 로 강등** (기존 pending-TC propose 강등 패턴과 동형 / 코드 주석 "의도적 carry 를 silent-orphan 으로 오인해 hard-block → propose 로 정직 강등" 철학 그대로 확장).

### 수정 (`graph-synthesizer.js` 1곳 / builder·schema·validator 무변경)
- `synthesizeGraph` 의 commit_hash 스탬프 직후 + 통계 계산 직전(= derive/na/스탬프 등 active 처리 **이후**) 에:
  `id.startsWith('analysis-') && state==='active' && incident edge 0` 인 노드를 `state='propose'` 로 강등.
- **derive 이후 배치 이유**: `deriveAnalysisCodePointers`(active 노드만 code_pointers 부여) + `defaultNaForIntentNodes` 가 먼저 active 로 처리하도록 보존 → propose 강등은 마지막에 orphan-회피만 수행(회귀 0). derive **이전** 배치 시 34 test fail(code_pointers 누락) 확인 후 위치 이동.
- propose = graph-integrity orphan 검사 제외(`active|drift` 만 대상) + 가시적(silent-false-health 아님).
- ★ chain 본류 노드(UC/BHV/AC/TC/TASK/IMPL)는 미해당 → 진짜 끊김은 계속 active orphan block(버그 미은폐). analysis-business-rules(-*)는 BHV.br_refs 연결 시 active 유지(미참조 시에만 강등).

## 검증
- `traceability-matrix-builder` 179/179 test pass (회귀 0 / 위치 이동 후).
- req-visitprkng artifact-graph 재생성 → 2 노드 propose 강등 → **orphans=0 passed=True**.
- 라이브 입증: WT1 캠페인 3 BC 전부 orphan=0(issue-secom·issue-visitor propose 불필요 / **wlfr propose=1 = fix 실작동**) / matrix auto-route ✅(v0.46.6 동행).

## §8.1 (단일 PoC 과적합 회피)
correctness 수정(graph false-block) + **다수 datapoint corroboration**(4-worktree 22 BC 캠페인 전반 재발 → 4 lane 전건 적용). HARD-gate/정량 ceiling 아님 → 단일 결정론 강등 + 기존 test 회귀로 충분. 신 check 없음(criteria_total 불변).

## Relates
- DEC-2026-06-15-matrix-schema-builder-align (v0.46.6 / 같은 캠페인 dogfood 자매) · DEC-2026-05-06-v2.0-i-strict-채택(artifact-graph 도입) · [[feedback_strict_exposes_drift]] · [[feedback_methodology_body_priority]] · [[feedback_self_recorded_fact_validation]](gate=arbiter / repair 자동통과 액면수용 ❌ → 직접 orphan 재측정).

## carry
- companion-mcp draft(`feat/headroom-companion-install` 브랜치 `2999ab23`)가 analysis exit-gate 에 `verdict-consistency-validator` 추가하며 findings-aggregator·chain-driver test 4건 미갱신(테스트↔코드 sync 누락) = **본 DEC 범위 외**(별도 작업 영역 / 사용자 지시로 미접촉). 캠페인 gate(chain-coverage/plan-coverage/spec-test-link/graph-integrity/schema 직접 호출)는 findings-aggregator 미사용이라 영향 없음.
