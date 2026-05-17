---
name: _base-invoke-go-stop-gate
description: ★ ★ ★ v2.0 chain harness gate UX skill. ADR-CHAIN-002 정합. chain stage 종결 시 사용자 검토 prompt (go/stop/revisit) + intervention_log 기록. 묶음 결단 (5~6 cluster) 권고 / Auto Mode 호환 (사용자 명시 위임 시 일괄 go). chain 1~4 모든 gate 의무 호출.
allowed-tools: Read, Write, Edit
---

# invoke-go-stop-gate

★ ★ ★ v2.0 chain harness 의 **gate UX skill** (ADR-CHAIN-002 정합). 매 chain stage (1=planning / 2=spec / 3=test / 4=impl) 종결 시 사용자 검토 + go/stop/revisit 결단 trace 기록.

## 언제 사용

- chain stage skill 종결 직후 의무 호출. 호출 순서:
  1. stage 산출물 생성 (e.g., `planning/extract-from-legacy`)
  2. validator 자동 검증 (e.g., `planning-extraction-validator`)
  3. ★ **invoke-go-stop-gate** ← 본 skill
  4. (go) 다음 stage skill 호출 / (stop) sprint 중단 / (revisit) 임의 stage jump

## 절차

1. **gate 입력 수집**:
   - 본 stage 산출물 path (예: `.aimd/output/planning-spec.json`)
   - validator 결과 (finding 목록 / coverage / 임계 위반)
   - traceability-matrix 현 상태 (forward_coverage / red_count)

2. **사용자 prompt 구성** (3 영역):
   ```
   ★ Gate #N (chain {stage} → {next}) 결단 의무

   ## 산출물 요약
   - planning-spec.use_cases: 12개 (UC-USER-001 ~ UC-PROFILE-003)
   - planning-spec.business_rules_intent: 47 BR-INTENT (business-rules.json 매핑 100%)
   - source_grounded_evidence: 12 UC 모두 존재 / grep_hit_count 합 89

   ## validator 결과
   - planning-extraction-validator: ✅ 0 finding
   - schema-validator: ✅ valid
   - traceability-matrix forward_coverage: 1.0 (UC 단계만)

   ## 결단 cluster (5 항목)
   1. UC-USER-002 의 br_refs 확장 (3 BR → 5 BR)?
   2. UC-PROFILE-003 의 actors 확장 (User → User+Admin)?
   3. business_intent.business_value 우선순위 (DR-INTENT-001 → high)?
   4. (생략 가능) cross_links.to_analysis_artifacts 추가 path?
   5. 다음 stage 진입?

   결단: go (모두 승인) / stop (sprint 중단) / revisit:<stage> (jump)
   ```

3. **사용자 응답 처리**:
   - `go` → intervention_log 에 기록 + 다음 stage skill 호출.
   - `stop` → sprint 중단 / 사용자 carry 등재.
   - `revisit:<stage>` → 임의 stage jump (chain harness gate 안 round-trip 정식 허용 / DEC-2026-05-06-round-trip-부분-허용 정합).

4. **intervention_log 기록** (`<project>/.aimd/output/chain-intervention-log.jsonl`):
   ```jsonl
   {"timestamp":"2026-05-06T11:00:00Z","gate":"#1","stage_in":"analysis","stage_out":"planning","decision":"go","cluster_size":5,"approved_items":[1,2,3,4,5],"rejected_items":[],"revisit_target":null,"user":"sangcl@smilegate.com"}
   ```

5. **traceability-matrix 갱신** — `_base-build-traceability-matrix` skill 호출 (gate 종결 의무 / forward_coverage 갱신).

## ★ ★ Auto Mode 호환

사용자가 "Auto Mode" 위임 시 (예: "전부 알아서 진행해줘"):
- 모든 cluster item = ★ default 승인 (go).
- intervention_log 의 `auto_mode: true` flag 설정.
- 단 ★★★ critical 임계 위반 (red_count > 0 / fail_count > 0) 은 **Auto Mode 도 차단** (사용자 명시 결단 의무 / no-simulation 정합).

## 결단 cluster 묶음 권고 (5~6)

ADR-CHAIN-002 §3 정합 — gate 마찰 (cognitive load) 완화. 5~6 cluster 의무:
- 1번 = 다음 stage 진입 자체 (가장 마지막)
- 2~5번 = stage 산출물 의 ★ ★ 변경 가능 항목 (severity high / coverage 임계 인접)
- low severity finding 은 cluster 제외 (info channel / 사용자 burden 회피)

## 인용

- ADR-CHAIN-002 (go/stop gate UX)
- ADR-CHAIN-003 (revisit loop)
- DEC-2026-05-06-round-trip-부분-허용 (chain harness gate 안 round-trip 정식 허용)
- master plan §J §gate 마찰

## Carry

- chain-revisit-detector 통합 (sub-plan-5) — 자동 revisit prompt trigger.
- intervention_log 분석 dashboard (사용자 결단 패턴 / Auto Mode 사용률 / revisit 빈도) — sub-plan-6 또는 v2.1.
