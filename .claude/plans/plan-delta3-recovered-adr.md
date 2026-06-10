# plan — 역공학 델타 #3 recovered-ADR (rationale abstention 산출물)

> **상태**: 1원칙(자산 숙지) + 2원칙(research) 완료 → 본 plan = 설계 락 + 일괄 승인 묶음. 승인 후 코드 착수(3원칙).
> **트리거**: 역공학 갭 델타 #3 (ROI 3위 / `DEC-2026-06-09-reverse-eng-methodology-gap` §2.5 델타3). 채택 4개 중 유일 미착수(#1/#2a/#2b/#4 = main 통합 완료).
> **선행**: research = [`research-delta3-recovered-adr.md`](research-delta3-recovered-adr.md). 모DEC = `DEC-2026-06-09-reverse-eng-methodology-gap`.

## 1. 결론 요약

legacy 시스템의 **과거 architecture 결정**(예: "iBATIS 채택", "batch 모듈 분리")을 code/config/structure 증거에서 역추적해 산출. **차별점 = WHY(rationale)를 복구 못 하면 정직하게 abstain**(날조 ❌). research 검증:
- 전제(과거 결정 역추적)는 **학술 선례 존재**(Jansen&Bosch 2008 / Archie FSE2014) = novel 아님.
- 그러나 **"rationale unknown" abstention 토큰은 어떤 ADR 포맷/도구에도 없음** = 본 산출물 차별점 ("novel field, grounded premise").
- 핵심 anti-pattern = 날조된 그럴듯한 rationale (= no-simulation 위반) → **fail-closed 강제**가 설계 1순위.

## 2. 설계 (락 / run-manifest 델타 #2a precedent 동형)

### 2.1 산출물 = `recovered-adr.json` (analysis 산출물 #17 / cross-cutting aspect)
run-manifest schema 골조 그대로: `meta` + content + `extraction`(evidence_trust `real_extraction|simulated`). top-level `additionalProperties:false`. `$defs` = `source_ref`{file, anchor, method:`code_evidence|config_evidence|structure_evidence|llm_read`} + `confidence`.

### 2.2 핵심 = rationale 축 분리 (research DESIGN IMPLICATION 2)
| 축 | 필드 | enum | 출처 |
|---|---|---|---|
| 결정 lifecycle | `status` | `accepted / deprecated / superseded` (Nygard / recovered 는 이미 구현됨 = proposed 부적용) | task-plan.adrs 정합 |
| **rationale 복구도** | `rationale.certainty` | **discovery-spec `intent_certainty` 재사용** = `observed / inferred-consequence / unverified-intent / source-refuted` | **신규 enum ❌** (DEC 지시) |

`unverified-intent` = **정직한 "rationale unknown"** abstention. (research 의 "별도 축 분리" 권고를 reuse 어휘로 충족 / recovered·inferred·unknown 신규 coin 회피).

### 2.3 recovered_adr item 구조
- `id` — `RADR-<DOMAIN>-NNN` (recovered = forward `ADR-*` 와 구분 / 역추적물 명시).
- `title`, `decision`(observed 사실 / minLength), `status`(위 enum).
- `evidence[]` — `source_ref` 배열 (Archie traceability 차용 / code/config/structure pointer). **결정 자체의 grounding**.
- `rationale` = `{ text: string|null, certainty: <intent_certainty>, basis_evidence: source_ref|null }`.
  - **fail-closed conditional**(schema): `certainty=observed` ⟹ `basis_evidence` 必 + `text` 必. `certainty=unverified-intent` ⟹ `text` = null 또는 `"복구 불가 — 사람 확인"`(날조 ❌) + `basis_evidence`=null 허용.
- `alternatives[]` — **evidence 가 대안 검토를 보일 때만**(MADR Considered Options 정합). **≥3 강제 ❌**(forward task-plan.adrs 와 결정적 차이 — 역추적은 대안을 모름).
- `consequences` = `{positive[], negative[]}` (observed 만 / 추론은 certainty 로 표기).

### 2.4 wiring (run-manifest 동형 / 최소)
- `schemas/recovered-adr.schema.json` 신설.
- `skills/analysis-recovered-adr/SKILL.md` 신설 (no-simulation 절차 / fail-closed abstention / confidence 계층 / 한계).
- `flows/analysis.phase-flow.json` cross_cutting.aspects.skills[] + $comment 추가.
- `agents/analysis-agent.md` skills 목록 추가.
- `methodology-spec/lifecycle-contract.md` 산출물 표 #17 행 + note.
- `DEC-2026-06-09-recovered-adr-rationale-abstention.md` 신설 + INDEX 미해결(1차 draft) 등재.

### 2.5 §8.1 = 1차 draft
plugin.json·CHANGELOG·MANDATORY **무변경** (#1/#2/#4 draft 동형). 본체 격상(MANDATORY 등재 + 버전) = **≥2 distinct 도메인 PoC corroboration 후**. 1차 = schema+skill+wiring+DEC + **1 dogfood**.

## 3. 일괄 승인 묶음 (3원칙 / 5 결정 / Auto Mode 호환 / 전부 Recommended)

1. **rationale 어휘** = discovery-spec `intent_certainty` 재사용(신규 enum ❌ / `unverified-intent`=unknown). [DEC·research 합치]
2. **schema 형태** = run-manifest precedent 동형 (meta+recovered_adrs[]+extraction) + rationale 축 분리 + fail-closed conditional.
3. **alternatives ≥3 강제 ❌** (역추적 = 대안 미상 / evidence 보일 때만 / forward adrs 와 의도적 차이).
4. **dogfood 1 PoC = legacy 우선** — recovered-ADR 본질이 legacy 결정 역추적 → **poc-08 jpetstore(Java Spring+MyBatis3)** 또는 poc-01 RealWorld Spring. (≥2 corroboration 은 후속).
5. **release scope = 1차 draft** (plugin.json·CHANGELOG·MANDATORY 무변경 / §8.1).

> 검증 항목(구현 중): 산출물 번호 #17 이 `methodology-spec/deliverables/` 별도 번호 체계와 충돌 없는지 대조(error-mapping=16/characterization=23 등 skill-desc 번호는 다른 list — lifecycle 표가 authoritative 인지 확정). intent_certainty optional/WARN 정합 유지.

## 4. 1원칙 — 숙지 완료 자산
- `schemas/discovery-spec.schema.json:138` intent_certainty enum (재사용 대상) ✅
- `schemas/task-plan.schema.json:304` adrs[] (forward / Nygard status / alt≥3 / consequences) ✅
- `schemas/run-manifest.schema.json` + `skills/analysis-run-manifest/SKILL.md` (precedent 동형) ✅
- `methodology-spec/lifecycle-contract.md:256` 산출물 표 (#16=run-manifest → #17) ✅
- `flows/analysis.phase-flow.json:144` cross_cutting.aspects (등록 지점) ✅

## 5. 정직 caveat
- recovered-ADR 는 **추출 ≠ 검증** — 역추적 결정·rationale 의 사실성은 사람 gate #0 확정 (codegraph reference-lens 와 동급 advisory 아님 / 산출물이나 fail-closed abstention 이 안전판).
- `status=proposed` 부적용(이미 구현된 시스템) — recovered 는 accepted/deprecated/superseded 만.
- 산출물 번호 체계 이중성(lifecycle 표 vs deliverables-spec) = 구현 중 대조 의무.

## 6. Lessons Learned
- **LL-1 (번호 체계 이중성 = 실재 drift)**: plan §3 에서 "산출물 #17" 로 가정했으나 실측 — `#17`=discovery-spec(chain) 점유. canonical = `deliverables/NN-*.md`(1~24 연속 / sql-inventory=24 max) → recovered-adr=**#25**. 게다가 직전 머지된 **run-manifest(델타 #2a)가 "#16"=canonical error-mapping 과 충돌 + deliverables/ doc 미생성** = 들여온 drift. → recovered-adr 는 정확 번호 + `deliverables/25-*.md` doc 생성으로 갭 회피. (diagnose-before-design: "산출물 N" 액면 수용 ❌ / 실측 우선 / memory `feedback_diagnose_before_design_check_existing` 정합).
- **LL-2 (research reuse 가 신규 enum coin 을 이김)**: research 가 `rationale_status: recovered/inferred/unknown` 신규 enum 을 제안했으나, DEC 지시(intent_certainty 재사용)+실측이 더 우수 — `unverified-intent` 가 정확히 "정직 unknown" 이고 validator-aware. research 권고를 액면 채택 안 하고 기존 어휘에 매핑 = 어휘 proliferation 회피 (memory `feedback_diagnose_before_design_check_existing` 재귀 적용).
- **LL-3 (fail-closed 는 negative test 로 입증)**: `observed⟹basis_evidence` if/then 가 실제 차단하는지 임시 invalid fixture(observed+null)로 reject 확인 — 가드가 "있다"고 가정하지 않고 작동 입증 (memory `feedback_self_recorded_fact_validation` 정합 / 차별 기능은 실측 의무).
- **LL-4 (delta 가 doc 카운트 drift 누적)**: getting-started skill 카운트(57/analysis 30)가 브랜치 델타 +2 + 본 델타 +1 만큼 stale — release-check 미강제 영역이라 누적. 실측(60/33) 정정. (count-coupling release-check 부재 = 잠재 carry).
