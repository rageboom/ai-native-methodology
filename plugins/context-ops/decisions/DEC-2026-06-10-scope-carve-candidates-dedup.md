# DEC-2026-06-10-scope-carve-candidates-dedup

**결단**: 같은 개념("측정 신호 → scope 후보")의 두 평행 표현 — **scope-carve.json**(역공학 델타 #1 / 신호 엔진)과 **inventory.json#scope_candidates**(v0.25.0 / 출력 컨테이너) — 을 **역할 분담으로 일원화**. scope-carve = 신호(WHERE/WHICH 결정론: SCC·Martin·co-change·hotspot) / scope_candidates = soft gate #0 사람 확정 출력. carve_candidates → (사람 확정) → scope_candidates. 자동 주입 ❌(reference-lens + 사람 확정 보존). 두 산출물 별도 평행 유지 종료.

**작성일**: 2026-06-10 (사용자: "추가된 내용과 기존 내용 정리해서 잘 동작하는지 확인" → 검증 42/42 통과 + 유일 잔여 = scope-carve↔scope_candidates 개념 중복 → "A: dedup 배선" 결단).

**version**: plugin.json 0.25.1 → 0.26.0 (MINOR — additive schema 필드 + 통합 배선 / 기존 무파괴).

**배경 (왜 중복이 생겼나)**:
- v0.25.0(`ADR-CHAIN-016` / 측정 기반 scope 도출) = `scope_candidates` 슬롯 + 원칙 + codegraph coupling 집계. **릴리스됨.**
- 역공학 델타 #1(`DEC-2026-06-09-scope-carve-3signal-reference-lens`) = 더 정교한 4신호 carve 알고리즘 + 별도 `scope-carve.json`. **draft.**
- 두 워크스트림 **상호 참조 0건**(독립 수렴 — 둘 다 CodeScene temporal-coupling 근거에 도달). 검증 게이트는 통과(둘 다 valid + reference-lens = gate 미검출)하나 **자산 중복**.

**relates to**:
- `ADR-CHAIN-016-measured-coupling-scope-derivation` (scope_candidates 발원 / 본 DEC 가 신호원을 scope-carve 로 확장)
- `DEC-2026-06-09-scope-carve-3signal-reference-lens` + `DEC-2026-06-09-reverse-eng-methodology-gap` (scope-carve 발원 / 델타 #1)
- `schemas/inventory.schema.json`(source enum += scope_carve / `carve_signals` 필드 / 역할분담 description) · `skills/analysis-source-inventory`(신호원 우선순위 1.scope-carve 2.codegraph 3.LOC) · `skills/analysis-scope-carve`(carve_candidates→scope_candidates 일원화) · `skills/analysis-code-graph`(coupling=corroborating 재배치)
- memory: `feedback_diagnose_before_design_check_existing`(두 schema 실측 후 설계) · `feedback_chain_driver_deterministic_axis`(자동 주입 ❌ / reference-lens 보존) · `project_policy_ssot_consolidation`(중복 dedup 정신)

---

## 1. 결정 내용

### 1.1 역할 분담 (일원화)

| | scope-carve.json | inventory.json#scope_candidates |
|---|---|---|
| 역할 | **신호 엔진** (WHERE/WHICH 결정론 신호) | **확정 출력 컨테이너** (분석가 결정) |
| 내용 | SCC atomic / Martin seam·hub·sink / co-change cluster / hotspot 우선순위 | 확정 scope (id slug / members / coupling / decay_grade / source / carve_signals) |
| trust | reference-lens (DEC-2026-05-28 §4.2) | advisory reference-lens (gate inject ❌) |
| 흐름 | carve_candidates 제시 → | soft gate #0 사람 확정 → 일원화 |

### 1.2 신호원 우선순위 (analysis-source-inventory)
1. **scope-carve.json** (권장 / 가장 풍부) → `source=scope_carve` + `carve_signals[]` 근거 인용.
2. **codegraph coupling** (scope-carve 부재 / corroborating — co-change 와 교차검증) → `source=codegraph_measured`.
3. **LOC 추정** (fallback) → `source=loc_estimate` + warnings.

### 1.3 자동 주입 ❌
carve 가 scope_candidates 를 직접 write 하지 않는다. soft gate #0 사람 확정 후 inventory 단계가 일원화 (reference-lens + 사람 확정 보존 / `feedback_chain_driver_deterministic_axis`).

## 2. 변경 (additive / 무파괴)
- `inventory.schema.json`: `source` enum `+scope_carve` / 신규 optional `carve_signals[]` (scc·martin·co_change·hotspot) / 역할분담 description. 기존 source 값·필드 무변경 = backward-compat.
- 3 SKILL 본문 (신호원 우선순위 + 역할분담 + 일원화) / scope-carve.schema·tool 코드 = 무변경.

## 3. §8.1 / 정직 carve
- 본 DEC = **배선/스키마 통합**(stable contract) 격상. scope-carve **도구 자체의 MANDATORY 격상은 별개** — 여전히 draft·opt-in / ≥2 distinct PoC corroboration 후(DEC-2026-06-09-scope-carve §8). 즉 "scope-carve 가 있으면 scope_candidates 로 흐른다"는 계약은 release, scope-carve 강제는 보류.
- ep-be-gea(v0.25.0 dogfood / codegraph_measured scope_candidates 8건) = 향후 scope-carve 4신호와 같은 결론 내는지 교차검증 타깃(B 옵션 / ≥2 PoC).

## 4. 검증
- release-readiness (목표 v0.26.0) 회귀 0 의무 / inventory.schema ajv valid / drift 3-way / scope-carve 38 test 무영향(tool 무변경).

## 인용
- ADR-CHAIN-016 · DEC-2026-06-09-scope-carve-3signal-reference-lens · DEC-2026-06-09-reverse-eng-methodology-gap · DEC-2026-05-28-codegraph-probe-결과 §4.2
- memory: feedback_diagnose_before_design_check_existing · feedback_chain_driver_deterministic_axis · project_policy_ssot_consolidation
