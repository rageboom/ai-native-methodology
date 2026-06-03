---
name: spec-integrate-deliverables
description: v2.0 chain 2 sub-skill. behavior-spec 의 cross_links.to_analysis_artifacts 에 analysis 7대 + 8 FE 산출물 모두 backward link 등록. 사용자 답변 (3) "현 7대 + 신규 추가 산출물" 정합. chain-coverage-validator 가 모든 reference 강제. formal-spec-extractor persona 책임. 사용자 (자연어 직접 호출 시): "산출물 통합" / "cross_links 등록".
allowed-tools: Read, Glob, Bash, Edit
---

# integrate-deliverables

v2.0 chain 2 의 sub-skill. 사용자 답변 (3) "현 7대 + 신규 추가 산출물" 정합 — 7대 산출물 변경 ❌ / behavior-spec.cross_links 가 모두 reference (chain-coverage-validator 강제).

## 언제 사용

- `compose-behavior-spec` 의 step 5 에서 자동 호출.
- 사용자가 cross_links 보강 시 직접 호출.

## 통합 대상 (analysis stage 산출물 + discovery stage backward link)

| 영역         | 산출물 (변경 ❌)                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 7대 BE       | inventory / domain / rules / architecture / schema / openapi (api-extension) / antipatterns                                               |
| 7대 보강     | finding-system / migration-cautions / `formal-spec` phase (state-machines / sequences / decision-tables / invariants)                     |
| 8 FE         | ui-spec / state-map / visual-manifest / a11y-spec / i18n-spec / static-security-spec / form-validation-spec / type-spec / legacy-spectrum |
| v1.5         | error-mapping-spec                                                                                                                        |
| v11.0.0 신설 | discovery-spec (cross_links.to_discovery_spec / chain discovery backward link / DEC-2026-05-26-discovery-spec-rename)                     |

## 산출

`behavior-spec.json` 의 `cross_links.to_analysis_artifacts[]` 배열 갱신 (in-place edit).
v11.0.0 — `cross_links.to_discovery_spec[]` 본격 추가 (chain discovery backward link / `[".aimd/output/discovery-spec.json"]` 1 entry 본격).

```json
{
	"cross_links": {
		"to_analysis_artifacts": [
			"business-rules.json",
			"domain.json",
			"schema.json",
			"architecture.json",
			"api-extension.json",
			"antipatterns.json",
			"state-machines/auth-flow.json",
			"decision-tables/BR-AUTH-LOGIN-001.json",
			"ui-spec.json",
			"form-validation-spec.json",
			"static-security-spec.json"
		]
	}
}
```

7대 산출물 통합 검토 (LLM/사람 영역 — gate#2 결정론 강제 ❌ / S7 정직 격하):

- 모든 7대 산출물 (inventory 제외) 이 ≥ 1 BHV 의 cross_links / \*\_ref / br_refs 에 등장하도록 검토 권고.
- 주의: chain-coverage-validator 는 `behavior.cross_links` **non-empty + path 유효성**만 결정론 검사 — per-artifact 7대 reference(`chain.7대.unreferenced`)는 **미구현**. 7대 중 1개만 등록해도 gate 통과하므로 본 통합은 LLM/사람 검토 의존 (over-claim 정직 격하 / carry `C-spec-7대-ref-lane` = chain-coverage-validator lane 신설 후보).

## 절차

1. **<project>/.aimd/output/ 안 모든 산출물 path glob** — 7대 + 8 FE + `formal-spec` phase.
2. **각 BHV 마다 명시 reference 추출** — behaviors[].state_transition_ref / decision_table_ref / sequence_ref / br_refs / use_case_refs 에서 도출.
3. **cross_links.to_analysis_artifacts 합집합** — 위에서 도출된 path + 추가 7대 산출물 path 합산.
4. **inventory.json 제외** — inventory 는 `discovery` phase 산출 (분석 메타데이터) → 비즈니스 의도 reference 대상 ❌. 단, `inventory.stack_signals` 는 chain 3 (test) framework match 에 reuse.
5. **dead-reference 검증** — `formal-spec-link-validator --chain-mode` 가 자동 (compose-behavior-spec step 7).

## no-simulation — 모든 cross_link 진짜 path 의무

`cross_links.to_analysis_artifacts[]` 의 모든 path 는 file system 실재 의무. 추측 / 가짜 path 등록 ❌. → `formal-spec-link-validator --chain-mode` 자동 차단 (`chain.dead-reference` finding).

## §8.1 strict 정합 (본 skill 의 corroboration 책임)

본 skill = "현 7대 + 신규 추가" 정책의 **운영 enforcement skill**:

- 7대 (BE) ≥ 1 reference / behavior-spec total
- 8 FE ≥ 1 reference / FE 트랙 PoC 가 있을 때 (스택 분기)
- `formal-spec` phase ≥ 1 reference / behavior-spec total

미달 시 chain 2 gate #2 통과 ❌ (ADR-CHAIN-001 §2 chain coupling violation).

## 인용

- ADR-CHAIN-001 §2 (cross-link coverage ≥ 0.85 ratchet)
- behavior-spec.schema.json `cross_links.to_analysis_artifacts` 정합
- DEC-2026-05-06-v2.0-i-strict-채택 사용자 답변 (3) 정합
- methodology-spec/skills-axis.md §2.3 (skills/\* manifest 매핑)

## Carry

- inventory.json 부분 reference (stack_signals / repos 트리만) — sub-plan-6 PoC #05 시점 검토.
- 산출물 dependency graph 자동 추출 + 시각화 = v2.x carry.
