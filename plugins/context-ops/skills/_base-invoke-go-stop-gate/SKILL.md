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
