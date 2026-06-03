# research — navigate --what-if (가설 변경 영향) 설계 리뷰 (4원칙 §2)

> 워크플로우 `wf_3705cafc-cbb` (Senior 적대적 1-agent / value 정직 판정 요청 = gold-plating 경계).

## 판정: **REVISE @ 0.82** (trust_line_safe: true)

**value_assessment**: "Genuine but NARROW — not gold-plating IF scoped to core_two." navigate --origin 은 이미 "기존 노드 변경 영향"을 답함 → what-if 의 유일한 marginal value = **그래프에 아직 없는 변경 시뮬레이션**. 정확히 2 op 이 이를 전달: remove-node("삭제하면 뭐 끊기나" — navigate 불가: 노드가 아직 존재해 자기 impact tree 에 남음) + add-edge("아직 합성 안 된 의존성"). 실제 S2 AX-마이그레이션 질문("이 legacy artifact 버려도 되나", "이 의존 추가하면?")에 매핑. analyzeImpact pure → 고 ROI. 나머지 op = speculative → carry.

## 결정 (Senior / 전부 채택)

| 결정         | 채택                                            | 근거                                                                                                                                                                                                    |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 op 범위   | **core_two** (remove-node + add-edge)           | 두 op 만 navigate 가 못 답하는 진짜 신규 가치. deprecate-node(impact tree 로 이미 reproducible)·remove-edge(niche)·all_four = §8.1 self-overfitting gold-plating → carry.                               |
| D2 origin    | **origin_required** (op-target 와 다를 수 있음) | --origin diff = 결정론·legible(pure·id-sort). graph-wide centrality diff = muddy(랭킹 noise). remove-node 시 origin = downstream consumer (제거 대상 ≠ origin).                                         |
| D3 add-node  | **carry**                                       | phantom 노드 = schema 필드 부재 → grade 전파·diff under-specified = 최저신뢰 quadrant. 진짜 신규 artifact = add-edge + 실 producer→resync 로 충당.                                                      |
| D4 grep-gate | **skip** → 불변성 unit test                     | what-if = write 경로 자체 없음(pure + structuredClone). grep-gate=존재불가 코드 부재 단언=near-zero(RR 31→32 surface↑). 대신 **원본 graph deep-equal 불변성 test** = 진짜 회귀(in-place mutation) 포착. |

## must-fix (전부 채택)

1. **origin/op-target 분리**: --origin 이 op 대상과 다를 수 있음. remove-node:ID 후 origin==ID 면 analyzeImpact throw → **graceful exit-3** ("origin=제거대상 / downstream consumer 를 --origin").
2. **불변성 회귀 test** (D4 gate 대체): --what-if 실행 전후 원본 graph 객체 deep-equal (structuredClone 우회·sub-ref leak 포착 = 진짜 trust enforcer).
3. **가설 provenance 코드 강제**: op 문자열이 변경의 SOLE source (LLM/heuristic 엣지 추론 0). test 로 단언. "가설/미저장" 라벨 = text + json(`what_if.unsaved:true`) 양쪽.
4. **scope core_two + carry** (deprecate-node/remove-edge/add-node = §8.1 "external pull 필요" 게이트 명시 carry).

## should-consider (채택)

- §8.1 정직: RealWorld+ecommerce = **둘 다 self-dogfood**(외부 adopter ❌). 메커니즘 corroboration 바는 충족하나 release note 가 "prod validation" overclaim ❌ → "2 internal dogfood 도메인 mechanism corroborated / external pull deferred" (self-referential-drift inflation 회피).
- add-edge: 기본 edge_type=derived_from **명시 출력**("가설 엣지 (derived_from 기본)") + EDGE_TYPE_CATALOG 검증(미지 type → exit-3).
- delta 노드 op 귀속 표시(add-edge=newly reachable / remove-node=newly orphaned) — flat +/- 는 WHY under-specify.
- --what-if 부재 = navigate byte-identical (snapshot test).

## regression-risk (반영)

- structuredClone 우회/sub-ref leak → 원본 오염 (불변성 test 가 유일 가드).
- origin=제거노드 throw (must-fix #1).
- deep-copy perf = non-issue (최대 138n/202e = μs / perf scaffolding ❌ = premature).
- label-leak: what_if = navigate-display-only / gate-eval·findings-aggregator 미참조 (check31 동급 trust class이나 별 gate 불필요).

## 결론

core_two(remove-node+add-edge) / origin_required(op-target 분리) / add-node carry / grep-gate→불변성 test. → 구현. release note §8.1 정직 라벨.
