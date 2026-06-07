# DEC-2026-06-07-living-sync-operating-model

**결단**: analysis 를 "최초 1회 선형 단계"가 아니라 **그래프를 따라 평생 동기화되는 운영 컨텍스트**로 운영하는 living-sync 모델을 정식 채택. 핵심 = ① **forward 단방향 전파가 정책**(정상 개발은 위쪽 노드 수정 → 자연 방향 forward) ② **손수정 코드만 예외**(의미 천장까지 lift 후 forward) ③ **discovery = 변경의 보편 입구·라우터**(자연어 요청을 그래프에 ground → 진입 노드·등급 산출 / 상향 라우팅 허용) ④ **granularity = 정밀도 다이얼**(정확성 불변) ⑤ **전파 커널은 이미 존재 → last-mile 배선 + soundness 공백 1건만 채움**. **본 결단 = 청사진 정착(Phase 0)** — 구현은 단계화(아래 §5), 분석 시점 release ❌.

**작성일**: 2026-06-07 (사용자: "내 설계가 이상했던것 같다 … analysis 가 최초 이후에도 기능 변경에 열려 계속 동기화되어 LLM 컨텍스트가 되어야 / 변경 시 어디서 시작? / 의도와 다른 방향으로 우회하지 말자").

**version**: 없음 (blueprint 정착 = methodology-spec 문서 + DEC 추가 / 코드·plugin 동작 무변경 / 향후 phase 구현 시 각 release).

**relates to**:
- spec(신규): `methodology-spec/living-sync-operating-model.md` (운영 모델 SSOT / 본 DEC 가 결단 SSOT)
- `methodology-spec/baseline-delta-operating-model.md` (재분석 cadence / 자매 — 본 모델 = 전파 의미론)
- `methodology-spec/use-scenario-taxonomy.md` (4 시나리오 → AX 운영 수렴) · `DEC-2026-06-01-living-dep-graph-loops` (동기화 루프 + 소비 루프)
- plan `.claude/plans/fancy-nibbling-wolf.md` (3 Plan-agent 수렴 청사진 + phase 상세)
- `feedback_senior_fact_check_supplement` (에이전트 주장 코드 사실확인 후 채택) · `feedback_zero_base_no_carry_anchor`

---

## 1. 배경

방법론은 산출물 = LLM 운영 컨텍스트·평생 동기화·역동기화를 **이미 선언**(use-scenario-taxonomy / CLAUDE.md / baseline-delta)했으나, **구현은 선형 1-pass 파이프 + 감지만**이었다. 사용자가 "기능 변경이 계속 들어오는데 analysis 가 최초 1회면 안 된다 / 변경 시 어디서 시작하나"를 제기 → 선언과 구현의 격차가 핵심 문제로 표면화.

3 Plan 에이전트(fidelity / reuse / soundness 렌즈)가 수렴 + 코드 사실확인:
- **격차**: chain-driver forward-only(`current_chain='analysis'`) · 재진입 셸 `pending_revisit.target_stage` 쓰기만·읽지 않음(cli.js:1510 write / :242 display) · 동기화 display-only.
- **반전(검증됨)**: 전파 커널 이미 존재 — `analyzeImpact`(impact-analyzer.js:193 / 방향성 BFS + grade attenuation + cycle-safe) · `topologicalOrder`/`cascadeOrder`(propagation-orderer.js:27,84) · `cmdImpact`(cli.js:1547) · 4-state `transition`(graph-synthesizer.js) · `applyContentDrift`(code-pointer-validator.js:386) + A1/A2/A3.
- **leaf 사실**: `docs/dependency-graph.md:18` "source file·contract leaf = 노드 아님" → 코드-origin reachability 공백(lift 필요).
- **drift reset 사실**: graph-synthesizer 합성마다 drift→active reset 후 hook 재계산(graph-synthesizer.test.js:612) → drift = 파생값.
- **미확인(과대인용 가드)**: `policy-evaluator.js`/`propagation-policy.json`(change_tier_matrix) grep 미확인 → 보조·선택 신설.

## 2. 결정 내용

- **전파 정책**: 정상 = forward 단방향(root→code) 절대. 행동 변경 = 위쪽 노드 수정 후 forward. reverse 는 방향 아님.
- **affects 모델**: 전파 순간 G 에서 forward∪reverse in-memory 계산(저장 ❌) = `analyzeImpact buildIndex`. 한 pass = origin 서 바깥 단방향 BFS. "G 양방향 = origin 단방향".
- **상태·fixpoint**: content_changed(단조 up) + revalidated(비전파 sink) → ping-pong 불가. drift = (구조·mtime·git) 순수 함수. 결정론 경계 = 영향 집합은 그래프(LLM ❌) / LLM 은 drift 노드 내용 재생성만.
- **진입 분류(누가 판단)**: 레벨×등급 두 축. **discovery = 자연어 변경 요청 보편 입구·라우터**(nl-md ground → cross_links/intent → 진입 노드·등급 / discovery-extraction-validator 가 실재 매칭 검증 / gate#1 사람확인 / 룰변경이면 analysis 상향 라우팅). 그래프 = 영향 집합 결정론 / 감지기 = 파일변경 결정론 / 하위 게이트 = 오판 backstop.
- **예외(손수정 코드) lift**: anchor-lift(파일→주인 노드) → 의미 천장(리팩터=IMPL/동작=BHV·AC/룰=BR)까지 human-confirmed 상향 → 천장부터 forward. 항상-root ❌. reconcile 모드(관측사실 자동 / 의도 충돌 propose).
- **granularity**: 정확성 불변 / 정밀도 단조. 분할 = (독립 anchor) AND (하류 개별 참조) 일 때만. business-rules per-BC/BR = 정당하나 정밀도 phase(정확성 전제 아님).

## 3. BR-split 실타래 봉합

진행 중이던 BR-split(v0.3.0 STEP 0/1 + v0.4.0 STEP 2)의 진짜 동기는 "토큰"이 아니라 **living-graph 연동 + 지속 동기화의 granularity**였음이 확인됨. 본 모델에서 BR-split = §5 Phase 4(정밀도 단계)로 재배치. **이미 커밋한 STEP 0/1/2(BC 의무화 + loader 중앙화)는 폐기 아니라 그 토대로 유효** (헛수고 아님 / 드리프트 봉합).

## 4. Non-goal

- 본 DEC = 청사진 정착(문서 + 결단). 구현 코드 변경·release 없음.
- 선형 chain harness(bootstrap 경로) 폐기 ❌ — `operation_mode` 분기로 보존.
- 자동 cascade 기본값 변경 ❌ — M4 "감지 자동 / cascade 수동" 보존(phase 별 opt-in).

## 5. 단계 로드맵 (구현)

| Phase | 내용 | 격상 조건 |
| --- | --- | --- |
| **0** | 청사진 정착 (본 DEC + living-sync-operating-model.md) | — (본 결단) |
| **1** | MVP 루프 (S2 / 1 scope / forward) — INTAKE(파일변경 + discovery 라우터) → pending_revisit jump 활성화 → sync-loop orchestrator(analyzeImpact+topo+cascade) → drift 마킹 → resync → gate | 실 fixture BHV 편집 영향분만 갱신 + NL "BR 변경" discovery 상향 라우팅 입증 |
| **2** | 예외(손수정 코드) lift + reconcile (anchor → 의미천장 → forward) | 실 코드 편집 → 천장 lift → 의도충돌 propose 입증 |
| **3** | Merge-back + cross-scope (subsetAnalysisRefs 활성화 + item 병합 + markDrift) | scope delta → canonical 병합 + 타 scope drift 표지 |
| **4** | 정밀도 granularity (per-item 노드 / business-rules per-BC/BR = STEP 3) | SHOULD-noise 실측 trigger |
| **5** | lateral 엣지 + fixpoint 하드닝 + (≥2 도메인 후) drift/conflict gate 격상 | 수렴 증명 + ≥2 distinct 도메인 corroboration |

각 phase = no-simulation 실 CLI dogfood + release-readiness 무회귀 + 전파 결정론 단위테스트. 미구현 단계 "동작" 표기 ❌.

## 6. 리스크

- **R1 fixpoint 종료(lateral cycle)**: revalidated 후에만 재발화 + iteration cap + non-converging finding. Phase 5 전 소형 증명.
- **R2 의도 보존(역동기화)**: 관측사실/사람의도 분리 = S2 정확성 핵심. reconcile 보수적(의도 propose-only) / ≥2 도메인 전까지 finding·propose only.
- **R3 §8.1 과적합**: 모든 phase 격상 = ≥2 distinct 도메인(RealWorld + ecommerce) 실 dogfood.

## 7. Phase 1 시행 로그 (v0.5.0 / 2026-06-07)

**Phase 1 MVP = `sync-loop` forward 전파 → regen_queue worklist** (결정론 only / 재생성·NL라우터·역동기화·merge-back·per-item = deferred). 본 §은 §5 로드맵 Phase 1 의 구현 로그(별도 release DEC 미생성 — 로드맵 owner 에 append / codegraph-wiring §9 패턴 동형).

- **신규 `tools/chain-driver/src/sync-loop.js`**(순수 코어): `computeSyncLoop`/`resolveOriginNodeIds`/`SUBKIND_TO_STAGE`/`markTransientDrift`. **forward-only**: `analyzeImpact(..., {includeForward:true, includeBackward:false})` (impact-analyzer.js:198-199 기본 양방향 override — 코드 사실확인). drift=파생 → durable=state.json `regen_queue` 단일 필드(§D1 정합) / 그래프 영속 ❌(--mark display-only).
- **`chain-driver sync-loop` 명령**(cli.js): cmdSyncLoop + dispatch + parseArgs(`--origin` 누적/`--changed`/`--mark`) + usage + cmdState 표시. cmdImpact 의 analyzeImpact+topo+cascade 재사용. has_cycle 시 durable write 거부.
- **origin 해소**: source_path 매치(산출물) / code_pointers 매치(코드파일). coarse per-file = SOUND(over-include만 / per-item=Phase 4).
- **검증**: `test/sync-loop.test.js` 15(단위+poc-05 e2e+trust 가드). **forward-only 입증**: poc-05 BHV-USER-001 → closure=[AC,IMPL,TASK,TC]-USER-001 / UC·USER-002 부재. chain-driver 358/358 · release-readiness 40/40 · version 3-way 0.5.0. **trust**: 코어 gate토큰·I/O·비결정 0 + gate-eval/cmdNext 가 regen_queue·sync-loop 미참조(reference-lens).
- **정정**: 청사진 §6/§8 D2 "policy-evaluator.js 미확인" → **실재 확인**(cli.js:74 import / 과대인용 아니었음).
- **carry(deferred)**: Phase 1b NL discovery 라우터 · Phase 2 lift+reconcile · Phase 3 merge-back · Phase 4 per-item · `next`-consumes-worklist+pending_revisit 활성화 · hook auto-fire. 다음 = Phase 2 또는 1b(사용자 결단).
