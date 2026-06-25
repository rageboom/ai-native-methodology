# DEC-2026-06-25-discovery-2-gate

**discovery 2-게이트 — 가벼운 draft 로 방향·범위·영향도 확정(PRD 산문 + 공유 묶음 뷰 + 범위/신규 선택) → 디테일 충전 → 최종 검토 (v0.77.0 MINOR)**

**상태**: 승인·시행 (plugin.json 0.76.0 → 0.77.0)

## 맥락 (사용자 발화)

discovery 게이트의 브라우저 검토 화면(`plan-review-server`)이:
1. **읽기 어렵다** — JSON을 그대로 옮겨 압축 언어로 보여줘 "PRD가 아니라 JSON 인스펙터". 말을 풀어 쓰고 이해를 돕는 **도식**이 필요.
2. **사용자 선택이 안 된다** — 검토자가 방향/범위를 골라야 함.
3. **타이밍** — spec을 다 만든 뒤 보여주니 늦다. 가벼운 draft를 **먼저** 보여주고 확정되면 그때 디테일을 채우자. discovery가 모든 산출물·연관 영향도를 파악하는 지점이므로, 방향을 먼저 확정하면 디테일 재작업을 줄인다(품질1/재작업최소2).

## 진단 (조사로 확인)

- **가독성**: 렌더러는 사실상 generic field-walker(`assets/kit.js` `Kit.arrange`). 산문 생성 0, 도식 0. 유일한 사람말은 표시-전용 `--summaries` 주석. → 진단 정확.
- **선택**: 상호작용은 "필드 클릭→프롬프트→누적→/apply(AI 재설계)" 하나뿐. 구조적 선택 UI 전무.
- **타이밍**: discovery-spec.json 은 게이트 전에 완전히 다 써짐(phase `discovery-spec-compose`). 영향도(`uc_dependencies`/`impact_count`)도 게이트 전 계산되나 **시각화 안 됨**.

## 업계 정합 (4원칙 2원칙 / research)

- 프로세스 선례 5종(Copilot Workspace Task→Topic→Spec / Amazon PR-FAQ / Google Design Doc canary→formal / Oxide RFD prediscussion→discussion / Shape Up pitch→bet)이 모두 "싼 draft 로 방향 확정 → 디테일 elaboration" 으로 수렴. **GitHub Spec Kit `/speckit.clarify`(plan 전 질문 / 1차출처 검증)** 동형. → **novel 아님, 정석.**
- SSOT-then-render 검증(OpenAPI Initiative "always keep a single source of truth"). 도식은 **소스에서 생성**해야 drift 없음.
- **함정 3개 → 설계 가드**: ① draft 가볍게(디테일 절대 미충전) ② 게이트①은 Auto Mode skip(이중검토 피로) ③ 표현은 `uc_dependencies` 에서 render-time 생성(hand-draw ❌). 1차 D3 force 그래프 시도 → "연결 안 된 노드 다수 + 인과 오해"로 사용자 검토 후 **공유 묶음 리스트**(연결요소 클러스터 + 평이어 강/약 엮임)로 전환 — 그래프 라이브러리 불요.

## 결정

discovery 를 **2-게이트**로 분할. 핵심: **게이트①은 chain-driver 게이트가 아니라 stage 내부 soft 체크포인트** — chain-driver `next` 는 stage 단위(stage당 게이트 1개), `current_phase`는 표시 전용. 따라서 상태머신·gate-eval 무접촉 = **STRONG-STOP 결정론 axis 보존**. 게이트②(기존 `#1`)가 stage 의 유일한 chain-driver 게이트로 남는다.

① **흐름** (`flows/discovery.phase-flow.json` v3.2.0): `discovery-spec-draft`(디테일 미충전 / `finalization_status=draft`) → **`gate-1-draft`**(게이트① / `gate` 필드 없음 / review-only) → `discovery-spec-detail`(`in_scope!==false` UC 디테일 / `final`) → `gate-1`(게이트② / `#1` 무변경).
② **가독성/표현** (`plan-review-server`): 신규 `--phase discovery-draft` + `assets/renderers/discovery-draft.js` — 같은 discovery-spec.json 을 **PRD 산문(배경·목적·출처 배너 / 문장 줄바꿈 / 한글 / 이해관계자·성공기준 블록) + "공유 묶음 뷰"** 로 렌더(raw 필드 나열 ❌). 공유 묶음 = `uc_dependencies`(shared_ref) 를 **연결요소로 클러스터링**해 "같은 규칙·API·코드를 쓰는 UC" 를 한 묶음으로 + 평이어 **강/약 엮임**(규칙·API 공유=강 / 코드만=약) + 난이도 랭킹. render-time 생성 / persist ❌ (json 단독 SSOT / ADR-011 / 그래프 라이브러리 불요). 1차 D3 force 그래프 시도 → 사용자 검토 후 묶음 리스트로 전환(함정 ③). 최종(`discovery`) 뷰는 기존 렌더러 유지.
③ **사용자 선택/편집** (`POST /confirm-scope` — 사람 소유 필드만 화이트리스트 직접 write `atomicWrite` / LLM inject ❌ "산출물 write=사람 입력만" 불변식 / `PLAN_REVIEW_CONFIRM` → detail-fill 재진입):
   - 범위 `use_cases[].in_scope` · 충돌 `conflicts[].resolved`+`resolution_ref` · 질문 `open_questions[].status`+`answer` + `finalization_status=confirmed`.
   - **신규 UC 추가** — 게이트① 화면에서 사용자가 새 유스케이스(이름+설명) 직접 추가 → `added_use_cases` → 서버가 **id 결정론 생성**(기존 prefix + 다음 번호) + `change_type=new` + `in_scope=true` write. 내용=사람 입력 / id=기계 생성(AI 단독 추가 ❌). detail-fill 에서 생성(greenfield-style).
   - 자유 의견 `/apply`(AI 재설계) 채널 병행.
④ **schema**: `discovery-spec` `finalization_status`(draft/confirmed/final) + `use_cases[].in_scope`(default true / 부재=true) + **`use_cases[].change_type`(existing/new/modify / 부재=existing)** + `acceptance_criteria_refs` required 완화(draft UC). `intervention-log` `event_type` `scope_confirm` + `stage` enum `discovery`/`plan` 추가(기존 gap 동시 정정).
⑤ **validator**: `discovery-extraction-validator --draft|--final`(또는 `finalization_status` 추론) — draft 는 디테일 finding(source-grounded/UC coverage) skip + `pending_decisions` advisory(low), final 은 `in_scope!==false` UC 만 coverage 분자 + 근거 강제. **`change_type=new`(사용자 추가) UC 는 레거시 근거 면제**(신규라 코드 없음).
⑥ **gate skill / agent**: `_base-invoke-go-stop-gate` 에 discovery 2-spawn 절(`scope_confirm` intervention-log 는 skill 담당) + `discovery-agent` 절차 갱신.
⑦ **URL 결정론 제시** (모든 검토 게이트 공통 / 사용자 요청): cli 가 기동 시 `PLAN_REVIEW_URL <url>` stdout 마커 emit + gate skill 이 spawn 직후 이를 읽어 **사용자에게 클릭 링크 항상 제시**. 브라우저 자동오픈은 보조(headless·명령 부재 시 `child.on('error')` 무시 = 조용히 실패) — 링크 제시를 그것과 분리해 "사람이 못 여는" 상황 차단. (서버 자동 OFF(self-shutdown)는 별도 갭으로 미해결 carry — 본 변경 범위 아님.)

## 검증

- `plan-review-server/test/discovery-draft.test.js`(8): PHASES / buildHtmlMulti draft=공유 묶음 렌더러·final=기존 렌더러 / 서버 renderAs 전파 / `/confirm-scope` 화이트리스트 write + 주입 무시 + onConfirm + 신규 추가(`added_use_cases`→`change_type=new`·id 결정론) + 비-discovery 409 / CLI spawn → `PLAN_REVIEW_CONFIRM` 마커.
- `discovery-extraction-validator` 2-gate(3): draft skip + pending advisory / final 강제 / in_scope coverage 분자 제외.
- drift-validator `--check-chain-layout` 통과(34 phases / 0 orphans). version-check 3-way 0.77.0 sync.
- 전 기존 테스트 회귀 0.

## 본체 격상 / 잔여 (§8.1)

- 1차 시행(코드+스키마+phase-flow+gate skill MANDATORY 배선). 실 dogfood E2E(≥2 PoC 에서 draft→confirm→detail 완주) corroboration = 후속.
- 최종(`discovery`) 뷰 PRD-산문화 = 후속(현 iteration 은 게이트① 가독성에 집중 / 최종 뷰는 상세 검토용 구조 렌더 유지).
- graph_impact UC↔UC 위상(현 artifact-graph) 한계는 `DEC-2026-06-24-discovery-enhance-mis373` 와 동일(shared_ref 로 커버 / 도식은 `uc_dependencies` 직접 소비).

Relates: DEC-2026-06-24-discovery-enhance-mis373(MIS-373 discovery 강화 / uc_dependencies·difficulty SSOT) + DEC-2026-06-24-chain-stage-awareness(plan-review-server statusLine sibling) + feedback_chain_driver_deterministic_axis(STRONG-STOP) + ADR-011(json 단독 SSOT) + DEC-2026-05-21-chain-discovery-plan-stage-도입.
