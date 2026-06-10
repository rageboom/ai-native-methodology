# Living-Sync 운영 모델 (변경이 그래프를 따라 전파되어 산출물이 평생 동기화되는 정상 상태)

> **사상**: 산출물은 "시스템 설명 문서"가 아니라 LLM 의 운영 컨텍스트 그 자체다. analysis 는 맨 앞 1회로 끝나지 않고, 기능 추가·수정·삭제마다 그래프를 따라 **증분 동기화**된다. 본 문서 = "변경이 **어떻게** 전파되나"(전파 엔진 의미론). 자매 문서 `baseline-delta-operating-model.md` = "**언제 무엇을** 재분석하나"(cadence). 둘은 상보.
> **관련**: `tools/chain-driver` (sync-loop / impact / sync) · `tools/traceability-matrix-builder` (artifact-graph 합성 / 4-state transition) · `tools/code-pointer-validator` (code↔artifact drift 감지) · `schemas/artifact-graph-node.schema.json` (state) · `lifecycle-contract.md` · `baseline-delta-operating-model.md`.

## 1. 정상 상태 = AX 운영

4 use-scenario(S2 AX전환 = 주 타깃 / S1 / S3 / greenfield)는 bootstrap 입력만 다르고 모두 같은 정상 상태로 수렴한다 — **AX 운영**: LLM 이 동기화된 산출물을 운영 컨텍스트로 삼아 프로젝트를 develop·run·modify·evolve 한다. 따라서 산출물은 평생 유지·동기화 대상이며, 변경이 들어올 때마다 그래프(artifact-graph)에 엮인 영향분이 일관되게 갱신되어야 한다.

## 2. 전파 정책 (절대 원칙)

- **정상 = 무조건 forward 단방향.** 모든 변경은 그래프의 자연 방향(root → … → code)으로만 흐른다. 행동을 바꾸려면 **코드를 직접 고치지 않고 위쪽 노드(룰/스펙)를 고쳐 forward 로 흘린다.** 전파 엔진은 forward 하나뿐.
- **예외 = 누군가 코드를 손으로 직접 수정한 경우, 그것 하나뿐.** harness 외부 자동 코드 생성 금지 원칙의 modification 확장. 처리는 §4 의 lift.
- reverse(code→analysis)는 전파의 *방향*이 아니라 "정책 밖에서 발생한 수정을 정상 forward 경로로 되돌리는 복구 단계"다.

## 3. 전파 엔진 (단방향 · 결정론)

### 3.1 affects 관계 — 저장하지 않고 전파 순간에 계산
의존성 그래프 G(`artifact-graph.json`)의 엣지는 "A 가 B 를 정의한다" 한 방향이다. 전파는 출발점에 따라 같은 엣지를 양쪽으로 타야 하므로, **전파 순간에** G 에서 양방향 인접(forward ∪ reverse)을 in-memory 로 계산해 쓰고 버린다 — 별도 그래프 파일을 저장하지 않는다(원본과 어긋남·이중관리 회피 / SSOT 단일). 이 인접 계산은 impact 분석기가 BFS 직전 이미 수행한다(신설 아님).

### 3.2 단방향 불변식
한 변경 pass = **origin 노드에서 affects 를 따라 바깥으로 한 번의 BFS**. traversal 중 방향을 뒤집지 않는다. "G 에서 양방향처럼 보이는 것"이 "origin 에서 바깥으로 가는 단방향"이 된다. 다중 origin 은 grade(MUST/SHOULD/FYI) max-merge — 순서 무관 동일 결과(confluent).

### 3.3 상태 · fixpoint
- origin = `content_changed` → `drift`. 영향 closure 중 MUST/SHOULD = `drift`(transitively stale) / FYI = 알림만(상태 변경 없음 / 게이트 오염 회피) / 신규 = `propose` / 삭제 = `deprecated`.
- **drift 는 누적 상태가 아니라 파생값**: 그래프 합성마다 active 로 reset 후 감지기가 재계산한다 → drift = (구조, 소스 mtime, git 상태)의 순수 함수 = 강한 idempotency(재실행 무변경 = no-op).
- `revalidated`(drift→active)는 전파하지 않는 sink. `content_changed` 는 단조 증가뿐 → 무한 ping-pong 불가. 순회는 grade dominance 로 cyclic 그래프에서도 유한 종료.

### 3.4 결정론 경계 (no-simulation 핵심)
*어느 노드가 영향받는지*는 100% 그래프 reachability 로 정해진다 — LLM 판단 금지. LLM 은 *drift 로 마킹된 노드의 내용을 재생성*할 때만 진입한다. 마킹 로직은 LLM/IO 의존이 없어야 한다(reference-lens / 결정적 gate inject 금지).

## 4. 진입 분류 — discovery = 변경의 보편 입구·라우터

변경 진입은 두 축으로 결정된다: **레벨**(어느 노드에서 시작 = stage) × **등급**(얼마나 큰가 = 번짐 범위·게이트 강도). 예: 표시 문구/오타 = 낮은 레벨(impl) + 작은 등급 → 아래에서 시작, 거의 번지지 않음.

**자연어 변경 요청은 전부 discovery 로 들어온다.** discovery 는 원래 "들어온 의도를 그래프에 ground 하고 닿는 노드를 찾는" 단계다 — 자연어 입력 어댑터로 요청을 받고, discovery-spec 의 use_cases·business_rules_intent·cross_links 로 닿는 노드(=진입 레벨)를 식별하며, intent ↔ 실재 analysis 항목 매칭으로 신규/기존(=등급 단서)을 가린다. gate #1 에서 사람이 확인한다. → 진입 노드·등급의 **제안은 LLM + 검증은 validator·그래프 + 확인은 사람 게이트** (§3.4 경계 그대로).

**판단 책임 분담**:

| 판단 | 주체 | 성격 |
| --- | --- | --- |
| 어디까지 번지나(영향 집합) | 그래프 | 결정론 (판단 아님) |
| 이미 바뀐 *파일*의 레벨·크기 | 변경 감지기(경로 패턴 + 변경량) | 결정론 |
| 자연어 요청의 진입 노드·등급 | discovery 라우터 | LLM 제안 + validator + 사람 게이트 |
| 오판 잡기 | 하위 게이트 검증기 | 상위 모순을 finding 으로 surface (backstop) |

**진입점은 discovery 보다 위일 수 있다**: discovery 는 gate #1, analysis 는 그 위다. 룰 변경이면 discovery 가 "그 룰을 바꾸려는 의도"로 ground 한 뒤 **analysis 로 상향 라우팅**한다. discovery 는 *입구·라우터*이지 항상 진입 stage 자신은 아니다.

**예외(손수정 코드)의 lift**: 코드 파일은 그래프 노드가 아니므로(leaf) 루트할 노드가 없다. ① 변경 파일을 code_pointer 역인덱스로 직접 주인 노드(보통 IMPL)에 anchor → ② 그 변경이 실제로 의미를 바꾼 **가장 높은 노드("의미 천장": 리팩터=IMPL · 동작변경=BHV/AC · 룰변경=BR)까지 사람이 확인하며 상향** → ③ 천장 노드부터 정상 forward. 항상 최상위 root 로 끌어올리지 않는다(없는 상위 의도 날조 회피). 천장 노드 갱신은 reconcile 모드 — 관측 사실(앵커·시그니처)은 코드에서 결정론 재추출·자동 갱신, 사람 작성 의도와 충돌하면 자동 덮어쓰기 없이 propose 로 사람에게 넘긴다. lift 의 완전성은 code_pointer 커버리지 비율을 상한으로 한다(앵커 없는 코드는 의도적으로 추적 밖).

## 5. Node Granularity 원칙

전파 정확성(soundness)은 노드 granularity 에 불변이다 — 거친 노드는 영향을 절대 놓치지 않고 다만 과하게 포함한다. 정밀도(precision)만 granularity 에 비례한다. 따라서 granularity 는 정밀도·그래프 크기 다이얼이다.

**분할 원칙**: 한 산출물을 여러 노드로 쪼개는 것은 — (1) 그 경계가 독립 결정론 anchor(별도 code_pointer)를 갖고 **그리고** (2) 하류가 그 단위를 개별 참조할 때만. 그 외에는 거칠게(산출물 1개 = 노드 1개) 유지한다. (business-rules 의 BC/BR 단위 분할은 두 조건을 만족하므로 정밀도상 정당하나, 정확성 전제조건은 아니다 — 정밀도가 필요해질 때 도입.)

## 6. 라이프사이클 (한 바퀴)

```
[0] INTAKE     변경 진입 → origin 노드 + 등급 (§4)
                 · 자연어 요청 = discovery 라우터 (필요 시 상위 stage 로 라우팅)
                 · 파일 변경 = 감지기 (정상=바뀐 위쪽 노드 / 예외=손수정 코드 lift)
[1] PROPAGATE  origin 에서 단방향 affects BFS → 영향 closure + grade → MUST/SHOULD = drift
[2] ORDER      위상 정렬로 결정론 재생성 순서 (cycle = 자동 cascade 차단 → 사람)
[3] REGEN+GATE drift 노드만 delta 재생성 → 그 노드의 owning gate 재실행 (gate #0~#5 기준 불변)
                 사람 검토는 blocked / propose / 의도 충돌만 (≤15%)
[4] RESYNC     그래프 재합성 → 통과 노드 revalidated→active
[5] MERGE-BACK scope delta → canonical 산출물의 해당 항목만 병합 (SSOT 단일) → 영향 scope drift 표지
[*] 재생성이 하류의 새 변경이면 [1] 재진입, drift 가 없을 때까지 = fixpoint
```

## 7. 현 구현 상태 (정직 표기)

본 운영 모델은 **목표 패러다임 + 단계화 구현** 이다. 전파 커널(impact 분석 BFS · 위상 정렬 · 4-state transition · code↔artifact drift 감지)은 이미 존재한다. 그 위의 last-mile 배선은 단계적으로 채운다 — 단계·진입점·검증 기준은 ## 인용의 결단 문서가 SSOT 다. 각 단계는 ≥2 distinct 도메인 실 dogfood 후에만 격상한다(단일 PoC 과적합 회피). 미구현 단계를 "동작한다"로 표기하지 않는다.

**현재 시행분**: ① `sync-loop`(변경 origin → **forward 단방향** 영향 closure → 순서화된 재생성 worklist durable 기록 / forward-only 실 입증). ② `sync-next`(worklist 를 **stage 단위로 소비** → 재생성 지시 surface → 그 stage gate 재실행 → done / gate 입도 = stage / 큐-block 격리). ③ `route`(자연어 변경요청 → LLM 산출 discovery-spec 의 **명시 매핑**[use_cases.id / business_rules_intent.br_id] 결정론 변환 → 진입 origins / existing=①로 seed·net-new=propose / 의미=LLM·라우팅=결정론·차단=gate#1). ④ **`lift`**(forward-only 의 유일 reverse 예외 / 손수정 코드 → anchor[결정론 code_pointers] → backward 의미천장 후보 surface → 사람 `--ceiling` 명시 시 천장부터 forward / **auto-climb ❌**). ⑤ **`lift --reconcile`**(손수정 코드 ↔ anchor 관측사실[path/commit] git 재탐지 → relocation=후보·content_drift/intent=flag-only / 자동 덮어쓰기·그래프 mutation ❌). ⑥ **cross-scope drift 기계 활성화**(`registerCanonicalSources` + `sync` first-touch baseline → markDrift live). scope **merge-back = OBVIATED**(SSOT 단일 = scope-local 사본 부재 → canonical 직접 편집 + ⑥ markDrift 가 타 scope 자동 표지 → 별도 병합 단계 부재). ⟨context-reduction prefix 슬라이스 `subsetAnalysisRefs` = retired·미실현 / 실 슬라이싱 = drift BC-hash·validation scope-token / 근거 ## 인용⟩ **미배선(후속)**: 손수정 코드 **lift 자동 트리거**(현재 수동 `--changed`/`--ceiling` 호출 / `--git` 재검출은 산출물 경로만 자동 — 코드 파일은 IMPL forward-origin 으로 fall-through 하며 IMPL=forward-leaf=빈 closure=no-op 이라 **의미천장 미상향**, 따라서 코드 변경은 `lift` 수동 경유 의무) · 재생성-후 fixpoint 자동 재진입(수렴 원장 코어는 존재 / 자동 재진입 orchestration 미배선) · per-item granularity(BR-split 으로 진행). 자세한 단계·시행 로그는 ## 인용의 결단 문서.

## 8. 운영 전제 — git 위생 (`--git` 변경 자동 감지)

`sync-loop --git` / `sync-converge --git` 은 baseline↔워크트리 git diff 로 변경 산출물을 자동 감지한다. 이 루프가 noise 없이 돌려면 채택자 프로젝트의 git 추적 경계가 다음과 같아야 한다 (결단 출처 = ## 인용):

- **런타임 상태 = 커밋 ❌**: `.ai-context/state.json` · `state.json.tmp` · `**/intervention-log.jsonl` 은 도구 실행 상태이지 AX 산출물이 아니다 → git 추적 제외. `chain-driver init` 이 `<project>/.ai-context/.gitignore` 를 **자동 스캐폴드**(idempotent / 기존 파일 무클로버 / 재-init upgrade 경로). 추적되면 `--git` diff 에 잡혀 `unresolved_paths` → `needs_resynth` false 신호를 낸다.
- **파생물 = 커밋 ✓ (그러나 재검출에서 도구가 skip)**: `artifact-graph.json` · `matrix.json` · `findings-*.json` 은 LLM 운영 컨텍스트/증거라 **커밋 대상**이다(gitignore ❌ — SSOT 손실). 대신 `--git` 재검출이 **노드 미매핑 + `.ai-context/` 도구 파생물**인 경로를 자동 skip 한다(C-lite / `resolveOriginNodeIds {skipDerivedNoise}`) → resync 로 변경된 그래프가 false-`unresolved` 를 만들지 않는다.
- **BLOCKER-1 보존**: 노드 미매핑이면서 도구 파생물도 **아닌** 경로(=진짜 새 구조 산출물)는 `unresolved` 로 유지 → 거짓 fixpoint 차단(carry2 철학). skip 은 `do_not_edit_manually` 파생물에만 적용된다.

## 인용

- 결단: DEC-2026-06-07-living-sync-operating-model (정책·전파 모델·discovery 라우터·granularity 원칙·단계 로드맵 SSOT)
- 결단: DEC-2026-06-08-living-sync-adopter-git-hygiene (§8 git 위생 — init .gitignore 스캐폴드 + --git 도구 파생물 skip)
- 결단: DEC-2026-06-10-subset-slicing-corollary-supersede (subsetAnalysisRefs prefix 슬라이스 retire — 실 슬라이싱 = drift BC-hash·validation scope-token / merge-back obviation 동형)
- spec: `methodology-spec/baseline-delta-operating-model.md` (재분석 cadence — 자매 문서)
- spec: `methodology-spec/use-scenario-taxonomy.md` (4 시나리오 → AX 운영 수렴)
- spec: `methodology-spec/lifecycle-contract.md` (stage × asset / gate)
- schema: `schemas/artifact-graph-node.schema.json` (4-state: active/drift/propose/deprecated)
- tool: `tools/chain-driver` (impact / sync / 향후 sync-loop) · `tools/traceability-matrix-builder` (artifact-graph 합성 · 4-state transition) · `tools/code-pointer-validator` (code↔artifact drift 감지)
