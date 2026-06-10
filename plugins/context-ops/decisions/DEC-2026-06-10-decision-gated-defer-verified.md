# DEC-2026-06-10-decision-gated-defer-verified

**결단**: 역공학 델타 **#7 decision-gated 3종**(intent-roundtrip / dynamic-trace / app-code fitness) = **DEFER-verified** (코드 0 / 버전 bump 없음 / decision record only). 원 deferral 사유(trust·R19 정책 충돌)가 **여전히 유효함을 실측 확인** — stale carry 가 아니라 grounded park. 각 항목에 **재검토 trigger** 명시. 이로써 역공학 델타 라인(#1~#7) 완전 종결.

**작성일**: 2026-06-10 (사용자 결단: 역공학 델타 라인 "진행" → #7 diagnose → DEFER-verified 채택).

**relates to**:
- `DEC-2026-06-09-reverse-eng-methodology-gap` §3 델타 #7 / §4 결단 6 (plan §4-b 가 "보류 / 사용자 결단" 으로 park)
- charter R19 (runtime-tool-exclusion / Tier 분류) + `no-unrunnable-tool-citation`(실행·import 이력 0 도구 인용 금지)
- `feedback_runtime_tool_exclusion` · `feedback_no_unrunnable_tool_citation`
- `feedback_quality_priority` (§8.1 / 측정된 trigger 우선 / 추측 빌드 회피)

---

## 1. 3종 per-item DEFER 근거 (실측 / grounded)

### (1) intent-roundtrip — DEFER (§8.1 추측 / 안전 framing 은 가능)
복원 intent(behavior-spec+rules)에서 행위 regenerate → characterization baseline diff. **trust·R19 충돌 없음**(WARN-only/reference-lens framing 가능 / br-cross-consistency Layer 2 동형 / gate inject ❌). 그러나:
- **중복**: chain-harness round-trip(impl RED→GREEN) + br-cross-consistency Layer 2(NL↔GWT) 가 정합성을 이미 상당 커버. analysis-stage regenerate-diff 는 distinct 하나 marginal.
- **측정된 demand 0**: 고위험 슬라이스 intent-recovery 실패가 실 dogfood 에서 관찰된 적 없음 → 빌드 = §8.1 추측.
- **비용**: regenerate = LLM 행위 생성(고비용 / tiered 라도).
- **재검토 trigger**: ≥1 실 dogfood 에서 "복원 intent 가 characterization 과 불일치(intent-recovery 오류)" 가 관찰되면 WARN-only(reference-lens)로 빌드. axis 혼동 회피 의무(chain-harness 70~80% / §3-A 분석 축과 별개).

### (2) dynamic-trace — DEFER (R19 + no-unrunnable-tool-citation 위반 / 빌드 불가)
정적이 못 보는 런타임 다형성·DI·리플렉션용 동적 트레이스. **R19 runtime-tool-exclusion 충돌** → Tier-2 import 패턴만 이론상 가능. 그러나:
- 동적 트레이서 **실행·import 이력 0** → allowlist/toolset 등재 = `no-unrunnable-tool-citation` 위반(PMD 의 poc-17 같은 실 import driver 부재).
- 현 정답 = `architecture.json`/`error-mapping` 의 **static-ceiling 정직 carry**(정적 한계 공개 인정). 날조 ❌.
- **재검토 trigger**: 사용자 환경에서 실 동적 트레이스(예: async-profiler/JFR/strace 류)를 돌려 trace 산출물을 import 하는 **실 driver** 가 생기면(PMD Tier-2 선례 동형) `static-runner IMPORTED_DRIVER_ALLOWLIST` 확장으로 흡수.

### (3) app-code fitness (ArchUnit on 타깃 앱코드) — DEFER (no-unrunnable-tool-citation 위반 / 부분 커버)
타깃 앱코드 architecture fitness(ArchUnit). 그러나:
- **ArchUnit 실행 이력 0** → R19 allowlist(현 PMD-only) 확장 = `no-unrunnable-tool-citation` 위반(filters.js 의 ArchUnit=인용만).
- **부분 커버**: `graph-integrity-validator` 가 artifact-graph fitness 를 이미 수행 / scope-carve(Martin Ca·Ce·I) + architecture violates_layer 가 결정론 구조 위반 포착.
- **재검토 trigger**: ArchUnit(또는 dependency-cruiser 등)을 실제 in-plugin 실행(Tier 1)하거나 SARIF-style import(Tier 2) 하는 실 driver + 5종 물증이 생기면 allowlist 명시 확장.

## 2. 결정 내용

- #7 3종 = **DEFER-verified** — 빌드 ❌ (코드·schema·skill·allowlist 무변경). 원 deferral 사유가 정책상 유효함을 실측 확인(grounded park / 1회성 carry 아님).
- 각 재검토 trigger = **측정된 demand(intent-roundtrip) 또는 실 실행/import driver(dynamic-trace·app-code fitness)**. 그 전 빌드 = R19/no-unrunnable-tool-citation 위반 또는 §8.1 추측.

## 3. 영향 / 역공학 델타 라인 종결

- 코드 무변경 / release-readiness 무관 / 버전 bump 없음.
- **역공학 델타 라인(#1~#7) 완전 종결**: #1 scope-carve(official v0.27.0) · #2a run-manifest + #3 recovered-ADR(official v0.34.0) · #2b secret-scan(live check42) · #4 hotspot(scope-carve 흡수) · #5 test-recovery(official v0.35.0) · #6 inquiry-log(REFRAME/DROP) · **#7 decision-gated 3종(DEFER-verified)**.
- diagnose-before-design 누적: 이 라인에서 #1·#4·#2b 기격상·#6 redundant·#7 정책충돌 을 모두 실측으로 차단 — 액면수용 시 재발명/scope-creep/R19 위반을 반복 회피.

## 4. Non-goal

- 3종 영구 폐기 아님 — trigger 충족 시 재검토(DROP 아닌 DEFER).
- R19/no-unrunnable-tool-citation 정책 완화 아님 (오히려 그 정책이 DEFER 의 근거).
