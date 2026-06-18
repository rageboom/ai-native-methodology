# DEC-2026-06-18-discovery-universal-entry-router

- **일자**: 2026-06-18 (**v0.61.0 MINOR** — additive 진입 라우팅 정렬 + 신규 결정론 hard-block)
- **카테고리**: 진입점 맹점 제거 — "분석 외 모든 작업 = discovery(입구·라우터) 진입" 불변식을 진입 라우팅 코드에 결선
- **상태**: 승인 (사용자[TF Lead] 진단 질의 "discovery 에서 시작 안 되는 맹점 / 왜 / 해결책" → 진단 보고 → AskUserQuestion 강제 강도 = **하이브리드** 확정 → plan 승인)
- **관계**: `DEC-2026-06-07-living-sync-operating-model` §4(불변식 SSOT — "자연어 변경 요청은 전부 discovery 로 들어온다 / discovery 는 입구·라우터") 의 **미배선 last-mile 채움**. `DEC-2026-05-17-v4-multi-agent-paradigm` (agentId dispatch 보존). `feedback_chain_driver_deterministic_axis`(hard-block = state+파일명만 / LLM inject ❌) + `feedback_diagnose_before_design_check_existing`(기존 자산 실측 후 reframe) + `feedback_answer_questions_before_acting`(질문 먼저 답).

## 맥락 (왜 — model ↔ implementation drift)

진입 stage 선택의 **실제 경로는 결정론 state machine(`chain-driver init/next` / analysis 서 시작·순차)이 아니라 LLM 의 skill-description 매칭(System B)** 이다. 그 위에 `hooks-bridge`(suppressOutput advisory)가 권고를 얹는다. 그런데 권고가 discovery 를 "6 stage 중 키워드로 고르는 하나"로 취급 → System B 가 `state.current_chain` 과 결합돼 있지 않아, 상태머신이 "지금 analysis"라 해도 LLM 은 무관하게 spec/implement skill 을 부른다.

문서 SSOT(`living-sync-operating-model.md:47` §4)는 명확하다: **"자연어 변경 요청은 전부 discovery 로 들어온다. discovery 는 *입구·라우터*이지 항상 진입 stage 자신은 아니다"** (룰 변경이면 discovery 가 analysis 로 상향 라우팅). 같은 문서 §7 이 진입-라우터 last-mile 을 "단계적/미배선"으로 자인. 그 빈 배선이 맹점. 코드 근거 4 실패모드:

- **① default-to-discovery 폴백 부재 (핵심)**: stage 키워드 없는 일반 변경요청("예약 취소 기능 추가해줘")은 어떤 TRIGGER_PATTERN 에도 안 걸려 `cli.js` UserPromptSubmit 분기에서 **silent pass-through**(`{suppressOutput,continue}`) → 라우팅 0 → LLM skill-description 자유선택. "모든 작업=discovery 진입" 불변식이 진입점에 **코드로 부재**.
- **② skip-ahead 오라우팅**: "구현 시작"/"spec 만들어"는 `TRIGGER_PATTERNS` 가 `implement-generate-impl-spec`/`spec-compose-behavior-spec` 로 **직행 권고** → discovery 건너뜀 → cold-start 면 orphan 산출물(discovery-spec 없는 behavior-spec). 패턴들 = router 가 아니라 stage selector / state 미참조.
- **③ matcher/TRIGGER 동사 비대칭 dead-zone**: layer-2 패턴 동사 리스트 불일치(analysis 만 `해줘` 포함 / spec·plan·test·implement 는 `시작|진입|만들어` 3종) → "구현해줘"는 layer-1 통과·layer-2 미매칭 → 권고 0. (기존 C20 테스트는 키워드 containment 만 검사 / 동사 비대칭 미포착.)
- **④ "route" 명령 착시**: `route-discovery.js`(=`cmd route`)는 *이미 만들어진* discovery-spec 의 명시 매핑(use_cases.id/br_id)을 그래프 origin 으로 바꾸는 **post-discovery** 라우터. raw prompt→discovery **진입** 라우터가 아님(파일 헤더가 "의미 판정 NL→discovery-spec 은 LLM skill 밖" 명시).

## 결정 (하이브리드 — 사용자 AskUserQuestion 확정)

정상경로 = advisory(권고 / LLM 판단 여지 = 70~80% 패러다임 정합), 최악경로(cold-start 에서 later-stage chain 산출물 Write) = 결정론 hard-block. trust 모델·결정론 axis 무침범 — 강제는 state+파일명만.

### 결정 1 — advisory 진입 라우터 (① ③)

`hooks-bridge.js`: 6 stage `TRIGGER_PATTERNS` 동사 셋 통일(`시작|진입|해줘|만들어|드라이브`)로 dead-zone(③) 제거. 신규 pure `routeEntry(prompt)` — stage 명시 트리거(`suggestSkillForPrompt` 위임 / `source:'stage'`)가 아니면서 변경-의도(`WORK_INTENT_KEYWORDS` 양성 리스트) 있으면 `discovery-from-nl-md`(+`discovery-agent`) 폴백(`source:'discovery-default'`). 비-작업 prompt(질문/설명/감사)는 null — **침묵 보존**(오발 회피). `cli.js` UserPromptSubmit 분기가 `routeEntry` 사용 + discovery-default 사유 / cold-start skip-ahead advisory note 주입. `hooks.json` layer-1 matcher 에 work-verb 키워드 확장(일반 기능요청이 hooks-bridge 도달).

### 결정 2 — cold-start skip-ahead 결정론 hard-block (②)

신규 pure `coldStartSkipAheadReason({toolName, toolInput, activeChain})` — `detectGraphArtifactWrite` 재사용으로 chain 산출물 write 만 대상. discovery-spec(UC) 자신 = 허용(입구). `activeChain.stage_progress.discovery.status === 'pending'`(cold-start) + later-stage chain 산출물(BHV/AC/TASK/TC/IMPL) = deny reason. `cli.js` PreToolUse 분기가 `getActiveScopeChain(state)`(scope-aware) 로 결선 → exit 2. **결정론**(state+파일명 / LLM inject ❌). 정상 순차 흐름은 `chain-driver next` 가 discovery 를 in_progress/complete 로 전이하므로 무회귀(트립 = discovery 'pending'서 later-stage 직접 write 만).

### 결정 3 — hard-block 범위 = discovery 진입 게이트만 (full stage-ordering ❌)

보고된 맹점(discovery 보편 진입)에 정조준. spec→plan→test→impl 순서 강제는 기존 gate `next` 의 몫 → PreToolUse 로 일반화하지 않음(revisit 흐름 충돌 회피). state.json 부재 = allow(graceful / 기존 PreToolUse 도 state=null skip 동형 / `init` 전 .ai-context chain 산출물 직접 write 는 비정상 경로 = advisory 가 커버). **정직 한계**: no-init cold-start 는 hard-block 미적용.

### 결정 4 — 부수 갭 수정 (additive)

`ARTIFACT_FILENAME_TO_SUBKIND` 에 `task-plan.json → TASK` 추가 — 이전 누락으로 plan-stage write 가 graph-artifact(PostToolUse impact-pending)로 미감지되던 잠재버그 동시 해소. hard-block 이 task-plan 도 커버하게 됨.

## §8.1 정당화 (진입-라우팅 정렬 면제)

§8.1 ratchet 은 **스키마/게이트 본체 변경**에 ≥2-도메인 corroboration 요구. 본 변경은 스키마 무변경 + advisory 라우팅 정렬(additive) + 신규 결정론 PreToolUse 가드(state+파일명 순수함수). chain 산출물 schema·gate matrix·release check 모두 무변경. 검증 = chain-driver unit 581(신규 18 / 회귀 0) + integration(spawnSync 실 cli.js) + smoke(실 hooks-bridge). dogfood = self(plugin 자기 hooks-bridge 경로). 본체 격상 트리거(MANDATORY 등재 등) 무 — 진입 UX 정렬일 뿐.

## over-claim 가드 (4항)

1. **"진입이 이제 100% discovery 로 강제됨" ❌** — 정상경로는 advisory(LLM 이 무시 가능 / 70~80% 패러다임). 결정론 강제는 cold-start later-stage Write 단 하나(orphan 차단).
2. **"System B 가 결정론화됨" ❌** — skill 발동은 여전히 LLM skill-description 매칭. routeEntry 는 nudge 일 뿐(suppressOutput advisory).
3. **"no-init cold-start 도 막힌다" ❌** — state.json 부재 시 hard-block 미적용(graceful / 정직 한계).
4. **"work-intent 리스트가 완전하다" ❌** — 보수적 양성 리스트(오발 회피 우선). 표현 누락 = finding 보강(cookbook Tip 3 / `WORK_INTENT_KEYWORDS ⊆ matcher` 테스트가 비대칭 회귀만 차단).

## 시행 (무엇)

- EDIT `tools/chain-driver/src/hooks-bridge.js` — TRIGGER_PATTERNS 동사 통일 / `WORK_INTENT_KEYWORDS`·`routeEntry`·`isLaterStageSkill`·`coldStartSkipAheadReason` 신설 / ARTIFACT_FILENAME_TO_SUBKIND task-plan.
- EDIT `tools/chain-driver/src/cli.js` — UserPromptSubmit(routeEntry + advisory note) / PreToolUse(coldStartSkipAheadReason + getActiveScopeChain) 결선 / 미사용 suggestAgentForPrompt import 제거.
- EDIT `hooks/hooks.json` — UserPromptSubmit matcher work-verb 확장.
- TEST `hooks-bridge.test.js`(+5 describe) · `hooks-contract.test.js`(+3 integration) · `graph-policy-bridge.test.js`(task-plan 매핑) → 581 GREEN.
- DOC `living-sync-operating-model.md` §4·§7(시행 전환) · `first-prompt-cookbook.md`(default-routing + route 구분).
- VERSION v0.60.0 → v0.61.0 (plugin.json · package.json · CHANGELOG · CLAUDE.md "현재" 줄).

## 부수 fix (본 변경 검증 중 발견 / 동일 릴리스 동반)

본 변경의 release gate 검증(`npm run test:release`) 중 **check#14 `preflight-check.js` 가 무한 hang** 하는 잠재 버그 발견 — 라우터와 무관하나 v0.61.0 게이트를 막아 동반 수정. (사용자 질의 "애초에 외부 도구가 탐지 안 된 게 원인 아냐?" 가 진짜 원인을 지목 → timeout 만으로는 거짓 absent 마스킹임을 재진단.)

- **근본 원인 = 탐지 방식 불일치(거짓 absent)** / hang 은 증상. preflight 가 `semgrep --version` 을 **naked**(env 없이) 호출 → version-check 네트워크가 egress 차단 사내망서 ~96s+ 무응답(F-DOGFOOD-016) → 동기 `spawnSync` 무한 블록. 정작 `static-runner`(실제 스캔)는 `SEMGREP_ENABLE_VERSION_CHECK=0`+`SEMGREP_SEND_METRICS=off` 로 semgrep(v1.163.0)을 **정상 실행** 중 — preflight 만 "쓰는 방식과 다르게" 탐지해 멀쩡한 도구를 못 잡음. (외부 30s timeout 도 무력 — node 가 동기 spawnSync 블록 시 이벤트루프 정지로 SIGTERM 처리 불가.)
- **1차 수정(정확한 탐지)**: tool spec `probeEnv` 신설 + `checkTool` 이 probe 자식 env 병합 → semgrep 을 runner 와 동일 오프라인 env 로 probe → ~1s 에 **present(v1.163.0) 정확 탐지**(거짓 absent ❌). "쓰는 방식대로 탐지" 원칙.
- **2차 수정(백스톱)**: `checkTool` `spawnSync` 에 `timeout`(기본 10s / `CONTEXT_OPS_PREFLIGHT_TIMEOUT_MS` override) — probeEnv 로도 무응답인 *다른* 도구가 게이트를 hang 시키지 않도록. timeout 시 `absent`+`timed_out:true`(미설치와 구분 / R19 정직 신호).
- **검증**: 신규 `scripts/test/preflight-check.test.js`(5 test / `test:preflight` — probeEnv 전파·timeout·정상/미설치). preflight `--stack all` 16분+ hang → **2.4s 완주 / semgrep status=ok**. 라이브 full gate 41/42(유일 ❌=의도적 workspace skip).

## relates to

- `DEC-2026-06-07-living-sync-operating-model` (§4 불변식 SSOT / 모) — 미배선 last-mile 채움.
- `feedback_chain_driver_deterministic_axis` (hard-block = 결정론 / LLM inject ❌).
- `feedback_diagnose_before_design_check_existing` (route-discovery 가 진입 라우터 아님을 실측 후 reframe).
- `DEC-2026-05-17-v4-multi-agent-paradigm` (agentId dispatch 보존).
