# DEC-2026-06-26-analysis-state-aware-router

- **상태**: 시행 (v0.85.0 MINOR)
- **일자**: 2026-06-26
- **티켓**: MIS-433 [OP-CHAINROUTE-002] (MIS-371 [OP-CHAINROUTE-001] 진입 라우터의 연속)
- **관련**: DEC-2026-06-18-discovery-universal-entry-router(보편 진입 라우터 / 본 결정이 완성) · DEC-2026-06-26-cold-start-enforcement(`resolveEnforcementContext`·orphan teeth) · DEC-2026-06-06-analysis-exit-gate(analysis=soft gate #0) · feedback_chain_driver_deterministic_axis(STRONG-STOP)

## 문제

analysis stage 가 한 번도 안 된 프로젝트에서 개발 의도 질의("…기능 추가")를 넣으면 체인이 제대로 안 걸린다(사용자 관측). 추적 결과:

- 진입 라우터 `routeEntry(prompt)`(hooks-bridge.js)는 **prompt 텍스트만 보는 순수 함수** — "분석 여부"를 전혀 안 본다. work-intent 키워드면 무조건 `discovery-from-nl-md`(source=`discovery-default`)로 보낸다.
- UserPromptSubmit 가 매 프롬프트마다 "분석 외 모든 작업은 discovery(입구·라우터)부터 ground" routeNote 를 붙인다. "rule 변경이면 analysis 로 상향"은 조건부 + LLM 재량 prose 라 비강제.
- discovery 는 analysis baseline grounding 을 전제하는데, SessionStart cold-start 안내("코드 분석 → init → discovery")와 **정면 모순**. per-prompt note 가 세션-1회 안내를 덮어 모델이 discovery 직행 또는 소스 직접 수정 → "체인을 잘 안타는" 체감.

## 결정

진입 라우터를 **analysis-state-aware** 로 확장. 강한 advisory(비차단) + 제안 스킬 교체.

1. **결정론 probe `analysisOutputPresent(root)`** (`tools/_shared/ai-context-layout.js`, 순수) — `.ai-context/base/`(read-alias `output/`)에 분석 산출물(`ANALYSIS_ARTIFACT_FILENAMES` = architecture/domain/business-rules/openapi.yaml/schema/db-schema/antipatterns/ui-spec 중 하나라도)이 있으면 true. `baseFileForRead` 가 NEW(base/)↔OLD(output/) alias 처리.
2. **UserPromptSubmit 분기** (cli.js) — `routeEntry` 직후, source=`discovery-default` 이고 `!analysisOutputPresent(cwd)` 면 `route.skillId='analysis-input-collection'` / `route.agentId='analysis-agent'` / `route.source='analysis-default'` 로 교체 → `loadSkill`/`buildSuggestOutput` 가 analysis 스킬을 자연히 기술. analysis-default routeNote = analysis-first 강한 안내(레거시=input-collection / greenfield(PRD·디자인·계약)=bootstrap / 멀티소스=orchestrate / greenfield 도 입력어댑터 analysis 를 거치므로 dead-end ❌).
3. **`discovery-from-nl-md` SKILL.md step 0-a 가드** — 동일 정합(분석 baseline 부재 시 analysis 먼저).

### 왜 advisory(비차단)인가 — 하드 차단 ❌

- 분석 안 된 레포는 `.ai-context/` 자체가 없음(`absent` mode) → over-block 방지 opt-in 신호(`.ai-context/` 존재)가 **목표 시나리오에서 부재** → 하드 게이트는 임의 레포 파괴 없이 못 켜진다.
- 진짜 실패모드("모델이 소스 직접 수정")는 임의 레포 파괴 없이 차단 불가.
- 기존 `coldStartSkipAheadReason`(orphan later-stage write deny)이 유일한 결정론 teeth — **불변**(중복 ❌ / 별개 altitude). advisory 는 그 위의 nudge 층.
- analysis = soft exit gate #0 사상과 정합.

### 결정론 axis (STRONG-STOP)

- probe = fs 존재 + 상수 파일명만. LLM inject ❌. probe 는 cli glue 에서만 호출 — `routeEntry` 는 prompt-only 순수 유지(테스트로 pin).
- state.json `stage_progress.analysis` 는 chain 커서(`initScopeChainState` 가 scope 진입 시 complete flip)일 뿐 "산출물 생산됨" 신호가 아니므로 **별개 축** — 그래서 state 가 아닌 산출물 fs 존재로 판별.
- routeNote/스킬 교체 = additionalContext(suggestion·display) / 어떤 gate 에도 inject ❌.

### OR-any predicate (Senior 정정)

- Senior 1차 리뷰는 "architecture.json 단독 + `baseline/` dual-alias"를 권고했으나 fs 실측으로 **반증**: `baseline/` 은 ADR-010 baseline-ratchet 스냅샷 디렉토리(분석 출력 ❌ / 무관), architecture.json 은 5개 PoC 만 top-level 보유. greenfield·FE-first 는 산출물 subset(예: ui-spec)만 생성 → 특정 1종 require 시 false-negative 과다.
- → **OR-any** 채택. 알려진 한계: 구형 nested 레이아웃(output/architecture/architecture.json)은 flat lookup 이 놓쳐 false-negative → "analysis 먼저" 과보호(비차단이라 무해 / subdir 순회 = over-engineering 회피).

## 검증

- 신규 유닛 `ai-context-layout.test.js`(9: absent/empty/base신규/output구형alias/OR-any/db-schema별칭/chain-only=false/root가드/스코프).
- 신규 e2e `router-analysis-aware.test.js`(7: absent→analysis 교체+analysis-first / present(base·output)→discovery / stage-explicit 불변 / 비-작업 침묵 / routeEntry 순수성 pin).
- chain-driver 762/762 회귀 0 (hooks-contract `discovery-default` 단언을 analysis-present tmpdir 로 정정).
- **≥2 PoC corroboration** (§8.1 / 커밋 PoC 불변 — scratchpad 복사): poc-18(Modern Express/Prisma/TS) + poc-19(Python numpy-financial) 양쪽에서 output/ present→discovery / rename 후→analysis-first 2-arm 재현.
- 3-way 0.85.0 (plugin.json / package.json / CHANGELOG) + CLAUDE.md R2 sync + release-readiness 43/43.

## Carry

- adoption 실측: soft advisory 가 실제로 "analysis 먼저"를 끌어내는지 (안 끌리면 revisit — 단 강제화는 over-block axis 위반).
- nested 레이아웃 false-negative 는 PoC 표준화 시 자연 해소 (현재 무해).
