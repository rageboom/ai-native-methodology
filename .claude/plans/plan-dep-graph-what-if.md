# plan — dep-graph 의도③ (b) what-if: `navigate --what-if` (가설 변경 영향 / 비파괴)

> s68 triage 잔여 ③(a) what-if = DEFER(propose 등재 producer 부재 + do_not_edit_manually 계약 + 가설엣지 자동추론=LLM trust선 위반 → **in-memory 비파괴 + 사용자 명시 입력만 안전**). 사용자 "순서대로 진행".
> 4원칙 §1. 코드 착수 = §2 research + §3 승인 후.

## 1. 문제

navigate 는 **기존 그래프에 존재하는** origin 의 영향만 본다. "이 노드를 **제거하면** 뭐가 끊기나? / 이 의존성을 **추가하면** 영향이 어떻게 커지나? / 아직 없는 새 artifact 를 만들면?" = 가설(what-if) 질의 불가.

## 2. recon (검증 완료)

- `analyzeImpact(graph, originId, opts)` = **pure**(impact-analyzer.js:172) — graph 객체 받아 자체 index build / **graph 무변경**. → deep-copy + 가설 변형본을 넘기면 가설 영향 결정론 계산 가능.
- 그래프 노드 state 'deprecated'/'propose' = `nonTraversableStates` 로 BFS 제외됨 → deprecate 시뮬레이션 = state 변경만으로 가능.

## 3. 설계 (in-memory 비파괴 / 결정론 / 사용자 명시 입력만 / additive)

### 3-A. trust 선 (triage 의무)
- **그래프 파일 절대 write ❌** (do_not_edit_manually 계약 / in-memory deep-copy 만).
- **가설 변경 = 사용자 명시 입력만** (LLM/자동 엣지 추론 ❌ = trust선 위반).
- 출력 = **"what-if (가설 / 미저장)"** 명시 라벨.

### 3-B. `--what-if "<op>"` (op = 명시 변경 1건 / 결정론 파싱)
| op | 의미 | use case |
|---|---|---|
| `remove-node:ID` | 노드+인접 엣지 제거 | "이 artifact 삭제하면 뭐가 끊기나" |
| `deprecate-node:ID` | state→deprecated (BFS 제외) | 삭제보다 보수적 |
| `add-edge:SRC>TGT[:edge_type]` | 가설 엣지 추가(기본 derived_from) | "X→Y 의존 추가하면 영향?" |
| `remove-edge:SRC>TGT` | 엣지 제거 | "이 의존 끊으면?" |

(★ 여러 op 동시 = 후순위 carry / 1건만.)

### 3-C. 동작
1. graph deep-copy (structuredClone).
2. op 적용 (copy 만). op 대상 id/엣지 부재 = graceful 거부(exit 3, "대상 부재").
3. `--origin X` 지정 시: baseline impact(원본) vs what-if impact(copy) **diff** — grade 별 added/removed 노드. origin 미지정 시: graph-wide top-impact-root diff(centrality 변화).
4. 출력: `what-if op` + before/after by_grade + delta(+added / -removed) + "가설 / 미저장" 라벨. `--json` 시 `{what_if:{op, baseline, hypothetical, delta}}`.

### 3-D. 본체 무변경
analyzeImpact/centrality/스키마/합성기 무변경 (pure 함수에 변형 copy 주입만). navigate 표시 계층 additive.

## 4. 결정 (§3 사용자 승인 — design space 넓음)
- **D1. op 범위**: (a) 4종 전부(remove-node/deprecate-node/add-edge/remove-edge) vs (b) 핵심 2종(remove-node + add-edge) + 나머지 carry vs (c) 최소 1종(remove-node).
- **D2. origin 모드**: --origin 필수(가설 변경 후 특정 노드 영향 diff) vs origin 옵션(미지정=graph-wide centrality diff).
- **D3. add-node 지원?**: 아직 없는 새 노드 추가(가설 origin) 포함 vs carry (triage "origin 기존존재 필요" 직접 해소 vs 복잡도).

## 5. 검증 계획
- 새 test: 각 op in-memory 적용 + diff 정확성 + 원본 graph 불변(deep-copy 입증) + 대상 부재 graceful + 라벨 + 회귀0(--what-if 없으면 출력 무변경).
- 2 distinct 도메인 실 --what-if(RealWorld remove BHV / ecommerce).
- workspace 전수 + RR(31/31 / 신규 check 검토 — write 금지 강제 grep-gate? D 검토) + version MINOR + doc/skill.

## 6. 위험 / 한계
- ★ trust: 그래프 파일 write 절대 ❌. (코드 강제 = release-readiness grep-gate 검토 — D4 후보 / spec-body check31 동형.)
- 가설은 미저장 — 사용자가 실제 적용하려면 별도(artifact 편집 → 재합성).
- 단일 op (multi-op carry).

## 7. Lessons
- [[feedback_zero_base_no_carry_anchor]] — triage DEFER 근거(trust선)를 설계 제약으로 정면 수용(in-memory 비파괴 + 명시 입력).
- analyzeImpact pure = 변형 copy 주입으로 본체 무변경 가설 계산 (재작업 최소화).
