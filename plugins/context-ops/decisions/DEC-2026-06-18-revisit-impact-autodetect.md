# DEC-2026-06-18-revisit-impact-autodetect

- **일자**: 2026-06-18 (**v0.63.0 MINOR** — revisit 근거 생성 + 자동 감지 / ADR-CHAIN-003 §2·§3 미배선 갭 / additive)
- **카테고리**: revisit loop — "왜 되돌아가야 하나" 의미적 근거(영향 ID + cell 수) + "Write 후 자동 감지" 하이브리드 배선
- **상태**: 승인 (사용자[TF Lead] "revisit 근거 생성 + 자동 감지 갭, 다음 plan으로 잡아줘" → 3-에이전트 실측 → AskUserQuestion 자동감지=**하이브리드** / 근거깊이=**ADR 풀세트** 확정 → plan 승인 → "구현해줘")
- **관계**: `ADR-CHAIN-003`(§2 자동 감지 + §3 prompt 형식 / 모) · `ADR-CHAIN-002`(gate UX / v0.62.0 gate 평이 요약 톤 계승) · `feedback_chain_driver_deterministic_axis`(enrich/detect = 결정론 / LLM inject ❌) · `feedback_diagnose_before_design_check_existing`(재사용 자산 실측 후 조립) · `feedback_methodology_body_priority`.

## 맥락 (왜)

ADR-CHAIN-003은 revisit 을 "자동 감지 + 사용자 결단(go/무시/abort)"으로 설계했으나 코드가 2곳에서 미달(직전 gate-decision-basis audit + 본 세션 3-에이전트 실측):

1. **갭1 — 의미적 근거 미산출**: `detectRevisit`(revisit-detect.js)는 `revisit_target`·`confidence_loc`·`changed_paths`만 산출. ADR §3 약속(**영향 stages[from→to] + 영향 trace(UC/BHV/AC/TC/IMPL ID) + traceability cell 수**)은 전혀 계산 안 함 → 사용자가 "왜 이 단계로 되돌아가나" 못 읽음.
2. **갭2 — 자동 감지 미배선**: ADR §2 "PostToolUse 등록 / Write·Edit 후 자동 호출" 미구현. `detectRevisit`는 수동 `chain-driver revisit-detect` 명령으로만 도달.

## 결정 (하이브리드 / ADR 풀세트 — 사용자 AskUserQuestion 확정)

### 결정 1 — 의미적 근거 (갭1) — 신규 `tools/chain-driver/src/revisit-impact.js`

`enrichRevisitImpact(revisitResult, graph, currentChain)`: `resolveOriginNodeIds`(변경파일→그래프 노드 / sync-loop.js) → `analyzeImpact(…, {includeBackward:false})`(forward 영향 / impact-analyzer.js) → subkind 버킷(UC/BHV/AC/TASK/TC/IMPL) + `affected_cells`(leaf 수 = traceability cell 근사) + `stage_range{from,to}`. graph 부재·변경파일 미매핑 시 `degraded:true` 정직 표기. `renderRevisitPrompt` = ADR §3 평이 텍스트. **`detectRevisit` 시그니처/반환 무변**(별도 enrich / 기존 revisit-detect.test.js 보존).

### 결정 2 — 자동 감지 (갭2 / 하이브리드)

- **PostToolUse 가벼운 후보 신호** — `hooks-bridge.revisitCandidateNote`(결정론 / git diff·graph 없음): 변경 산출물 stage 가 현재 chain 의 upstream 이면 1줄 advisory 를 기존 PostToolUse note 에 append (`coldStartSkipAheadReason` 패턴). exit 0.
- **`chain-driver next`(gate 진입) 정식 enrich** — git diff → `detectRevisit` → `enrichRevisitImpact`(graph best-effort) → revisit_target 시 `renderRevisitPrompt` stderr + `--json` 의 `revisit` 필드. **advisory(gate 차단 ❌)** — 사용자가 결단의 `revisit:<stage>`(기존 `applyUserDecision` 경로)로 선택.
- **수동 `chain-driver revisit-detect`** — 동일 enrich 적용(풀세트 근거 출력).

### 결정 3 — advisory only

hard-block ❌ (ADR = 자동 감지 + 사용자 결단). orphan 차단인 `coldStartSkipAheadReason`(PreToolUse hard-block)과 강도 분리.

## §8.1 정당화 (면제)

스키마·gate matrix·release check **무변경** / additive(신규 enrich/render 모듈 + hook 1줄 + next advisory 블록) / `detectRevisit`·`gate-eval` 무변. 검증 = chain-driver unit **606 → 614**(신규 revisit-impact.test.js 12 / 회귀 0). dogfood = self. 본체 격상 트리거(MANDATORY 등재) 무 — revisit UX 근거/배선 보강.

## over-claim 가드 (3항)

1. **"revisit verdict 가 LLM 판단" ❌** — `enrichRevisitImpact`=graph BFS / `detectRevisit`=path regex+LOC / `revisitCandidateNote`=stage upstream 판정 = 전부 결정론. 결단은 사용자.
2. **"graph 없어도 영향 ID 산출" ❌** — `degraded:true` + 변경파일만 정직 표기(날조 0). 영향 0 이 아니라 "미산출".
3. **"cmdNext E2E 통합 풀커버" — 핵심 단위(enrich/render/candidateNote) 12 test 커버 / `cmdNext` revisit wiring 은 try-catch graceful + 기존 cmdNext 경유 테스트(navigate/sync-next) 회귀 0 으로 보증 / git-repo fixture E2E 는 비용 대비 생략(정직 표기).

## 시행 (무엇)

- NEW `tools/chain-driver/src/revisit-impact.js`(enrichRevisitImpact + renderRevisitPrompt) · `test/revisit-impact.test.js`(12 test).
- EDIT `tools/chain-driver/src/hooks-bridge.js`(revisitCandidateNote + SUBKIND_TO_STAGE·isUpstream import) · `src/cli.js`(import + loadArtifactGraphSafe + cmdNext revisit 블록 + PostToolUse note append + cmdRevisitDetect enrich).
- DOC `docs/adr/ADR-CHAIN-003-revisit-loop.md`(§2/§3/이력) · 본 DEC · `decisions/INDEX.md`.
- VERSION v0.62.0 → v0.63.0 (plugin.json · package.json · CHANGELOG · README · CLAUDE.md).

## relates to

- `ADR-CHAIN-003` (§2·§3 / 모).
- `feedback_chain_driver_deterministic_axis` (enrich/detect 결정론 / LLM inject ❌).
- `feedback_diagnose_before_design_check_existing` (재사용 자산 실측 — resolveOriginNodeIds/analyzeImpact/downstreamOf 재발명 ❌).
- `feedback_methodology_body_priority` (본체 격상).
