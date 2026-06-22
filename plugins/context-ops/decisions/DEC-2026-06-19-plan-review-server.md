# DEC-2026-06-19-plan-review-server

**상태**: 승인 (v0.67.0 MINOR)
**일자**: 2026-06-19 (착수) ~ 2026-06-22 (출하)
**관련**: DEC-2026-06-03-dep-graph-trace-view (dep-graph-viz 자산-인라인 self-contained HTML 패턴 모) · feedback_chain_driver_deterministic_axis (서버=reference-lens / 결정론 gate inject ❌) · feedback_adzic_sbe_10yr_pitfall (dual-representation 회피 — AI 요약 저장 ❌) · DEC-2026-06-06-analysis-exit-gate / 산출물 일반화 spec=3종 (spec.phase-flow: behavior+unit+ac)

## 맥락

chain harness gate(discovery #1 / spec #2 / plan #3) 검토에서 사람은 산출물 json(use_cases/behaviors/units/criteria/tasks/ADR/NFR…)을 통째로 읽고, 머릿속으로 "어디가 틀렸나"를 판단한 뒤 자연어로 던져야 했다 — md/json 정독 + cross-artifact ID 체계 파악의 인지부담이 크고 수정이 어렵다. 사용자 요구 = "산출물을 브라우저에서 보고, 바꾸고 싶은 항목을 클릭해 프롬프트로 의도를 적으면 AI 가 재설계 → 보던 HTML 이 자동 갱신". (lavish-axi `github.com/kunchenguid/lavish-axi` 협업 루프를 참고하되, 우리 chain·trust 구조에 맞춰 재해석.)

## 결정

신규 `tools/plan-review-server/` (dep-graph-viz 형제 / ephemeral 로컬 HTTP / self-contained HTML):

1. **상호작용(공유 키트 `assets/kit.js`)** — 어느 산출물이든 동일: 항목 클릭→팝오버 프롬프트(+값 안 텍스트 부분 선택) · 우측 프롬프트 패널 · 전역 채팅 · apply · 라이브 리로드(스크롤 보존) · gate 평결 · 헤더 · agent-reply 배너 · 큐 sessionStorage 유지. **값 직접 편집 ❌ — 모든 변경 = 자연어 프롬프트 → AI 재설계.**
2. **렌더링(스키마별 렌더러 `assets/renderers/*` / `RENDERERS` 맵)** — 렌더러가 섹션 배치를 소유(인터랙션은 공통). discovery-spec/behavior-spec/unit-spec/acceptance-criteria/task-plan + generic fallback. **AC=Gherkin(given/when/then) 시나리오 bespoke.** "generic 코어에 끼우기"가 아니라 "렌더러가 주인, 키트를 가져다 씀"(사용자 결정 — 3 스키마가 근본적으로 다르고 미래 확장).
3. **★ 닫힌 루프** — apply→서버 stdout `PLAN_REVIEW_APPLY <payload>` 마커→에이전트가 해당 stage agent 재dispatch→재설계된 산출물을 서빙 경로에 덮어씀→`/version`(산출물 mtime) 변화→브라우저 라이브 리로드 + agent-reply 배너("뭘 바꿨다"). **apply 만으론 version 불변**(revision 기록만)=재설계 중 조기 리로드 방지.
4. **phase 한 페이지** — `--phase <discovery|spec|plan> --project <dir>` → 페이즈 산출물을 한 페이지(탭)로. **spec = behavior+unit+ac 3종**(spec.phase-flow 정합). apply 가 top-level key→artifact 라우팅(behaviors→behavior-spec / units·coverage→unit-spec / criteria→acceptance-criteria / 전역=`_global`) → `<phase>-revisions.json`.
5. **수정불가 잠금** — 기계 소유(provenance·id·순서·의존·`*_ref(s)` 추적링크·외부ID·계약 path/operationId/method)는 클릭/코멘트 ❌ / 내용(제목·설명·결정·enum)만 가능. **UI 비클릭(`ro-val`) + 서버 belt(locked anchor edit·comment drop) 이중화.**
6. **AI 평이 요약** — 메인 에이전트가 카드별 1–2줄 사람말 요약 생성 → `--summaries` → 원문 옆 "🤖 AI 요약 · 원문 아님" 라벨. **산출물 저장 ❌(dual-rep/Adzic 회피) · gate inject ❌ · 표시 전용.** + **큐레이션**(잠긴 구조·링크는 카드별 토글 / provenance 섹션 접기).

## trust (reference-lens 불변)

서버는 판정을 만들지 않는다: 평결=`chain-driver next --dry-run --json` 위임(byte-identical / state 무변경) · 재검증=`plan-coverage-validator`(task-plan 만) · 산출물 write=사람 프롬프트만(LLM inject ❌) · AI 요약=표시 전용. dep-graph-viz 가 view-time reference-lens 인 것과 동질 — 결정론 chain gate 무오염.

## lavish-axi 대조

차용: agent-reply(대화형 루프) · 큐 sessionStorage 유지 · 부분문자열 anchor. **미채택(우리 구조가 대체/동등)**: 레이아웃 감사 커튼(우리 HTML=통제된 렌더러) · native/custom 인터랙티브 요소(정적 산출물 데이터) · playbooks(=per-schema 렌더러가 그 개념) · 전용 `poll` 명령(stdout 마커 + Monitor 가 동등 / agent-reply 는 서버 재기동 `--agent-reply` 로 충족 / 필요 시 후속).

## §8.1

면제(신규 도구·additive / 기존 chain·schema·gate matrix·release criteria 무변경 / 서버=reference-lens 로 결정론 axis 무오염). discovery/spec/plan PoC 검증 후 test/implement stage 렌더러 및 generic-any-HTML 일반화는 별도(필요 시 파일 추가 구조 확보 / 진짜 generic 필요 시 lavish-axi[MIT] 채택도 고려).

## 검증

plan-review-server 58/58(field-classify·artifact-registry·apply[validator skip+plan]·emit[렌더러 선택]·http[닫힌루프·agent-reply·/version·멀티 apply 라우팅]·cli·dom-render[kit+렌더러 실 실행: 5종 렌더·AC Gherkin·잠금·큐레이션·요약·agent-reply·멀티 탭]) + test:release 27/27 + release-readiness 42/42 / 회귀 0. 4종 + spec phase live E2E.

## carry

test/implement stage 렌더러 · UC/behavior bespoke 레이아웃(현재 kit 위임 / 파일 자리만) · task-plan dependency DAG 시각화(Mermaid) · 전용 `poll` 명령 · generic-any-HTML 일반화.
