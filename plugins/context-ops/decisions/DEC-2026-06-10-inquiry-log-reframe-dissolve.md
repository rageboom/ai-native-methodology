# DEC-2026-06-10-inquiry-log-reframe-dissolve

**결단**: 역공학 델타 **#6 (analyst inquiry/hypothesis log + finding-system `finding_type` enum)** = **REFRAME/DROP** (신규 deliverable·enum 빌드 ❌ / 코드 0). 분석가의 가설·불확실성 캡처는 **이미 deliverable-attached 로 분산·충분히 존재** + AX-native 패러다임이 standalone inquiry-log 를 redundant 하게 만듦. finding-system 에 `finding_type` 추가는 **범주 오염**(governance ≠ per-project analyst log). F14/F16 DISSOLVE·merge-back obviated·subset-precision obviated 와 동형 diagnose-before-design 처분.

**작성일**: 2026-06-10 (사용자 결단: 역공학 델타 라인 "진행" → #6 diagnose → REFRAME/DROP 채택). 코드/schema/skill 무변경 / 버전 bump 없음 (decision record only).

**relates to**:
- `DEC-2026-06-09-reverse-eng-methodology-gap` §3 델타 #6 (plan §4-b 가 "범주 정정 → 신규 산출물 결정" 으로 보류)
- `feedback_diagnose_before_design_check_existing` (갭 후보 액면수용 ❌ / 기존 자산 실측)
- `feedback_quality_priority` (§8.1 / YAGNI / 재작업 최소)

---

## 1. 두 framing 의 긴장 (plan §4-b)

- **원 갭분석**: "inquiry/hypothesis log = finding-system `finding_type` enum 추가(enhance / hypothesis→confirmed/refuted 머신검증)".
- **plan diagnose 재분류**: finding-system = "PoC dogfooding 중 방법론이 막히는 spec-gap 기록" = **방법론 governance 도구** ≠ 역공학 분석가의 per-project inquiry log → finding_type 추가 = 범주 오염 / inquiry-log = 신규 산출물 결정(저리스크 아님).

## 2. diagnose 실측 (REFRAME/DROP 근거)

### (a) finding-system = governance 확정 (범주 오염 검증)
`finding-system.schema.json` 필드 실독: `phase`(input/discovery/...), `discoverer`('PoC 진행 중'/'Senior'/'사용자'), **`spec_gap`("어느 명세의 어느 절이 비었나")**, **`decision_made`("본 PoC 는 어떻게 우회했는가")**. = "**방법론 spec 의 빈틈 + PoC 우회**" 기록 = governance/dogfooding. 분석가가 **타깃 코드**에 대해 세우는 가설("모듈 X 가 Y 처리한다")과 다른 범주. ∴ `finding_type: hypothesis` 추가 = 범주 오염 확정.

### (b) 분석가 가설·불확실성 = 이미 deliverable-attached 로 분산 커버
- `recovered-adr` `rationale.certainty=unverified-intent` = 과거 결정 WHY 가설 + 정직 abstention(evidence-grounded).
- `characterization-spec` `data_source_status: carry / domain_expert_interview` + `ambiguous` = 행위 검증 필요.
- `discovery-spec` `intent_certainty` + `human_review_required` = intent/bug 판정 가설.
- `domain` `ambiguous_carry`(rule_id/carry_owner/carry_reason) = rule 분류 모호 expert carry.
- `finding-system` status lifecycle = open→candidate→promoted/**rejected**/deferred (hypothesis→confirmed/refuted 와 동형 lifecycle 이미 보유).

### (c) AX-native 패러다임 = standalone log redundant
LLM 이 분석가 = 가설이 곧 deliverable 내용으로 **직접 grounding**. 예: recovered-adr 의 unverified-intent 항목 = "기록되고 해소된(혹은 abstain 된) 가설" 그 자체. von Mayrhauser/Letovsky 가설 루프는 별도 process-log 없이 **deliverable certainty 필드 + finding lifecycle** 로 실현됨.

### (d) §8.1 / YAGNI
standalone inquiry-log deliverable = 측정된 demand 0 + honor-system markdown 전락 위험(plan 명시) + ≥2 도메인 dogfood 추측 비용. 새 deliverable 빌드 = 능력 재발명(merge-back·subset-precision obviated 동형).

## 3. 결정 내용

- 신규 `inquiry-log` deliverable **빌드 ❌**. finding-system `finding_type` enum **추가 ❌**(범주 오염).
- 분석가 가설·불확실성 캡처 = **현 deliverable-attached 메커니즘이 방법론의 inquiry-log** (by design). 추가 자산 불요.
- 만약 향후 cross-deliverable 가설 lifecycle 추적의 **측정된 demand** 가 ≥2 도메인에서 발생하면 재검토(현재 trigger 0).

## 4. 영향 / 정직 경계

- 코드·schema·skill·flow 무변경 / release-readiness 무관 / 버전 bump 없음.
- 역공학 델타 라인 **완전 종결**: #1 scope-carve(official v0.27.0) · #2a run-manifest + #3 recovered-ADR(official v0.34.0) · #2b secret-scan(live check42) · #4 hotspot(scope-carve 흡수) · #5 test-recovery(official v0.35.0) · **#6 = 본 REFRAME/DROP** · #7 decision-gated 3종(intent round-trip/dynamic-trace/app-code fitness = trust·R19 충돌 / **DEFER 유지** / 별도 정책 결단).

## 5. Non-goal

- #7 decision-gated 처분 아님 (별개 / DEFER 유지).
- 기존 certainty/carry/abstention 메커니즘 변경 아님 (그대로가 inquiry-log 역할).
