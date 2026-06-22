---
name: _base-invoke-go-stop-gate
description: v2.0 chain harness gate UX skill. ADR-CHAIN-002 정합. chain stage 종결 시 사용자 검토 prompt (go/stop/revisit) + intervention_log 기록. 묶음 결단 (5~6 cluster) 권고 / Auto Mode 호환 (사용자 명시 위임 시 일괄 go). chain 1~4 모든 gate 의무 호출.
allowed-tools: Read, Write, Edit
---

# invoke-go-stop-gate

chain harness 의 **gate UX skill**. 매 chain stage (1=planning / 2=spec / 3=test / 4=impl) 종결 시 사용자 검토 + go/stop/revisit 결단 trace 기록.

## 언제 사용

- chain stage skill 종결 직후 의무 호출. 호출 순서:
  1. stage 산출물 생성 (e.g., `discovery/extract-from-analysis-output`)
  2. validator 자동 검증 (e.g., `discovery-extraction-validator`)
  3. **invoke-go-stop-gate** ← 본 skill
  4. (go) 다음 stage skill 호출 / (stop) sprint 중단 / (revisit) 임의 stage jump

## 절차

1. **gate 입력 수집**:
   - 본 stage 산출물 path (예: `.ai-context/base/discovery-spec.json`)
   - validator 결과 (finding 목록 / coverage / 임계 위반)
   - traceability-matrix 현 상태 (forward_coverage / red_count)
   - **chain-driver 평이 요약** = `chain-driver next --json` 의 `summary` 필드(`verdict` / `headline` / `blocking[]` / `review[]`). **verdict·headline 은 결정론 도구가 SSOT** — skill 은 문장만 다듬고 판정 자체를 바꾸지 않는다(LLM 재판단 ❌ / gate-summary.js 레이어 1).

2. **사용자 prompt 구성** — **영어 약어·jargon 을 그대로 나열하지 말 것.** 맨 위에 chain-driver `summary.headline`(한 줄 평결)을 그대로 두고, 막는 문제/검토 권장은 **[평이 라벨 — 무슨 뜻 — 권장 행동]**(도구 `summary.blocking[]` / `review[]` 매핑)으로. 영어 code 는 괄호로 병기(추적용), 필드명(forward_coverage / br_refs 등)은 한국어 풀이 병기:

   ```
   Gate #N (chain {stage} → {next}) — 진행 여부 결정

   👉 판정: 검토 후 진행 (REVIEW) — 권장 기준 미달 1건. 승인하면 진행 가능합니다.
      ⮑ chain-driver summary.headline 그대로 (결정론 verdict / 임의 변경 ❌)

   ## 1) 무엇을 만들었나 (산출물 요약)
   - 유스케이스(use_cases): 12개 (UC-USER-001 ~ UC-PROFILE-003)
   - 업무규칙 의도(business_rules_intent): 47건 — 분석 단계 규칙과 100% 연결
   - 출처 근거(source_grounded): 12개 UC 모두 실제 코드 grep 으로 확인 (총 89 hit)

   ## 2) 막는 문제 / 검토 권장   ← chain-driver summary.blocking[] / review[] 매핑
   (막는 문제 = 반드시 해결해야 진행 가능 / 검토 권장 = 승인하면 진행 가능)
   - [검토 권장] 추적 커버리지 미달 (coverage_threshold)
     = 요구사항이 구현·테스트까지 연결되지 않은 항목이 있음 (현재 < 기준 85%)
     → 빠진 연결을 보강하거나, 이대로 승인
   (해당 없으면 "막는 문제·검토 권장 없음" 으로 표기)

   ## 3) 결정할 항목 (5개 묶음)
   1. UC-USER-002 의 업무규칙 연결(br_refs) 확장 (3건 → 5건)?
   2. UC-PROFILE-003 의 수행 주체(actors) 확장 (User → User+Admin)?
   3. 업무 가치 우선순위(business_value): DR-INTENT-001 → 높음?
   4. (생략 가능) 분석 산출물로의 교차 링크(cross_links) 추가?
   5. 다음 단계로 진행?

   결단: go (모두 승인하고 진행) / stop (스프린트 중단) / revisit:<단계> (이전 단계로 되돌아가 다시 검토)
   ```

3. **사용자 응답 처리**:
   - `go` → intervention_log 에 기록 + 다음 stage skill 호출.
   - `stop` → sprint 중단 / 사용자 carry 등재.
   - `revisit:<stage>` → 임의 stage jump (chain harness gate 안 round-trip 정식 허용).

4. **intervention_log 기록** (`<project>/.ai-context/base/chain-intervention-log.jsonl`):

   ```jsonl
   {
   	"timestamp": "2026-05-06T11:00:00Z",
   	"gate": "#1",
   	"stage_in": "analysis",
   	"stage_out": "discovery",
   	"decision": "go",
   	"cluster_size": 5,
   	"approved_items": [
   		1,
   		2,
   		3,
   		4,
   		5
   	],
   	"rejected_items": [],
   	"revisit_target": null,
   	"user": "reviewer@example.com"
   }
   ```

5. **traceability-matrix 갱신** — `_base-build-traceability-matrix` skill 호출 (gate 종결 의무 / forward_coverage 갱신).

## discovery·spec·plan stage — 인터랙티브 검토 편집기 (opt-in)

discovery/spec/plan gate 에서, json 을 통째로 읽기 어려운 사용자를 위해 `plan-review-server` 로 **브라우저 검토**를 제안할 수 있다 (기본은 위 텍스트 prompt — fallback 유지 / 서버는 opt-in). 대상 산출물: `discovery-spec` / `behavior-spec` / `acceptance-criteria` / `task-plan` (spec stage 는 behavior-spec·acceptance-criteria 2종 → 순차 검토).

절차 (사용자가 "브라우저로 볼게" 류로 수락 시):

1. **AI 평이 요약 생성** (읽기 쉽게 — 의도 적기 쉽게): 각 카드(`tasks[i]`/`use_cases[i]`/`behaviors[i]`/`criteria[i]`)에 "이게 뭐다"를 사람말 1–2줄로 작성 → `summaries.json`:
   `{ "<cardBase>": { "summary": "…" } }` (예: `{"use_cases[0]":{"summary":"사용자가 이메일로 가입하는 흐름"}}`). **산출물에 저장 ❌**(원문 ≠ 요약 / dual-rep 회피) — 검토용 일회성 파일.
2. Bash 로 서버 spawn — 기동 시 클릭 가능한 URL 출력 + 브라우저 자동 오픈(`--no-open` 으로 끔):
   ```
   node ${CLAUDE_PLUGIN_ROOT}/tools/plan-review-server/src/cli.js \
     --input <proj>/.ai-context/output/<artifact>.json \
     --summaries <summaries.json> \
     --project <proj>            # (task-plan 만) gate 평결 위임 (chain-driver next --dry-run)
   ```
   (`--artifact` 는 파일명에서 자동 추론. task-plan 은 acceptance-criteria.json 동일 디렉토리 자동 탐지.)
3. 사용자는 산출물을 의미 카드로 읽고(각 카드에 AI 요약 표시 / 잠긴 구조·링크는 토글로 접힘), **바꾸고 싶은 항목을 클릭(또는 값 안 텍스트 드래그 후 클릭) → 팝오버에 프롬프트(의도)를 입력** → 우측 패널에 누적. 전체 의견은 하단 **채팅 컴포저**로. 다 적으면 **apply**. 값 직접 편집이 아니라 모든 변경 = 자연어 프롬프트. (수정 불가 잠금: provenance·id·순서·의존·추적링크·외부ID·계약 = 클릭/코멘트 ❌ / 내용=제목·설명·결정·enum 만 가능.)
4. **poll 핸드오프** — 서버를 background 로 띄웠으면 그 stdout 을 Monitor 로 watch: apply 시 서버가 `PLAN_REVIEW_APPLY <json>` 한 줄을 emit → 즉시 페이로드(`artifact_type` + comments[{anchor,label,text,selected_text}] / anchor=null=전역)를 입력으로 **해당 stage agent 재dispatch**(discovery→discovery-agent / spec→spec-agent / plan→plan-agent)(revisit). 수동 "파일 읽어" 단계 없음. (durable 채널 = `<artifact>-revisions.json` / `next_action:"replan"`.)
   - Monitor 예: `tail -f <server.log> | grep --line-buffered PLAN_REVIEW_APPLY`
5. 재설계된 새 산출물을 디스크에 쓰면 서버가 **라이브 리로드**(스크롤 보존)로 반영 — 재기동 불필요. 수렴까지 반복. 서버 종료(Ctrl+C) 후 intervention_log 기록은 동일.

**불변**: 서버는 reference-lens — 평결=chain-driver / 재검증=plan-coverage-validator(task-plan 만) / 산출물 write=사람 입력(프롬프트)만 / AI 요약=표시 전용(저장·gate inject ❌). 결정론 gate 에 LLM inject ❌ (본문 §gate 입력 수집과 동일 원칙).

## Auto Mode 호환

사용자가 "Auto Mode" 위임 시 (예: "전부 알아서 진행해줘"):

- 모든 cluster item = default 승인 (go).
- intervention_log 의 `auto_mode: true` flag 설정.
- 단 critical 임계 위반 (red_count > 0 / fail_count > 0) 은 **Auto Mode 도 차단** (사용자 명시 결단 의무 / no-simulation 정합).

## 결단 cluster 묶음 권고 (5~6)

gate 마찰 (cognitive load) 완화. 5~6 cluster 의무:

- 1번 = 다음 stage 진입 자체 (가장 마지막)
- 2~5번 = stage 산출물 의 변경 가능 항목 (severity high / coverage 임계 인접)
- low severity finding 은 cluster 제외 (info channel / 사용자 burden 회피)

## 인용

- ADR: ADR-CHAIN-002 (go/stop gate UX)
- ADR: ADR-CHAIN-003 (revisit loop)
- 결단: DEC-2026-05-06-round-trip-부분-허용
