# DEC-2026-06-30-scope-cardinality-min-1

**analysis scope 분해 cardinality ≥1 불변식 — 단일 full-codebase 도 whole-codebase fallback scope 를 항상 물질화 (MINOR / v0.90.0 시행)**

**상태**: **시행 (v0.90.0 MINOR)**. §8.1 ≥2 distinct 도메인 PoC corroboration **충족** — ep-be-gea(legacy Java/iBATIS/SQL Server) + poc-19(modern Python) 둘 다 풀 E2E(atomic carve→0 후보→whole_codebase_fallback inventory VALID→`init --scope` scope 컨테이너 물질화) + 독립 적대적 리뷰 6/6 CLEAR(GO). MIS-537 [OP-ANALYSIS-002] / MIS-366 하위.

## 맥락 (사용자 발화)

어떤 프로젝트를 본 방법론으로 analysis 하던 중, analysis 단계에서 개별 도메인이 scope 로 쪼개지지 않는 현상을 관찰. 직전 세션 설명:

> "빠뜨린 버그가 아니라, full-codebase 단일 스코프로 진행해서 '어떻게 쪼갤지'를 다루는 scope 산출물이 불필요했던 겁니다."

사용자 요청: "무조건 쪼개는 것을 한번 태우고 싶다. 스콥이 하나라도 이렇게 하고 싶다. 나중에 scope 이 생길 수 있잖아." → **단일 scope 라도 scope 컨테이너를 항상 물질화**(seam 날조 ❌ / 컨테이너 항상 존재 ⭕)하여 균일한 scope 패러다임 + 미래 scope 확장 seam 확보.

## 진단 (조사로 확인 / Explore 3-agent)

- **버그 아닌 의도된 설계.** 상태 모델 v0.78.0(DEC-2026-06-25)은 전역 단일 chain + `current_scope` 커서이고 `current_scope=null`(scope 없는 global 모드)이 정당. 전체 코드베이스 단일 분석 → 산출물 `base/shared/` 직행, scope 컨테이너(`scopes/<scope>/`) 미생성.
- `inventory.json#scope_candidates[]` 는 `minItems` 부재 → 빈 배열 valid. carve 빈 후보가 빈 scope_candidates 로 통과.
- 인프라는 이미 ≥1 scope 를 감당(구조적 건전). **유일한 갭 = init/inventory 시점의 기본 scope 물질화 부재.**

## 레이어 분리 (핵심 — 이게 신뢰모델 충돌을 가른다)

- **레이어 A — scope-carve (reference-lens 신호 엔진):** **무수정.** 소형·순환없는 코드베이스에서 `carve_candidates=[]` 는 정직(STRONG-STOP / gate inject ❌ / slug 자동생성 ❌ / DEC-2026-06-09 §2.7). 본 결정은 carve 가 seam 을 날조하게 만들지 **않는다.**
- **레이어 B — inventory scope_candidates + soft gate #0 + init 흐름:** 본 결정이 떨어지는 곳. carve 의 inject 가 아니라 **inventory 산출 계약의 의도적 진화**(v0.78.0 같은 코어 evolution). carve skill 자신의 원칙 "scope_candidates 일원화는 inventory 단계" 정합.

> ⚠️ 두 'scope' 구분: 본 결정 = **analysis scope 분해**(`inventory#scope_candidates` → soft gate #0 → `init --scope`). `/confirm-scope`(plan-review-server `uc.in_scope`)는 **discovery gate① UC in/out** — 별개, 미변경.

## 결정

**불변식**: analysis scope 분해(`inventory.json#scope_candidates[]`)는 **카디널리티 ≥1**. 측정 신호(carve/codegraph/loc)가 모두 0 후보여도 빈 배열 ❌ — 전체 코드베이스를 담는 후보 1개(`source=whole_codebase_fallback` · `members`=전체 · `role=scope`)를 항상 emit. 사람이 soft gate #0 에서 확정(자명해도 1-클릭)·이름변경·분할 → 확정 슬러그로 `chain-driver init --scope <slug>` 가 scope 컨테이너를 물질화.

**신뢰모델 정합**: fallback 후보도 **여전히 advisory(reference-lens) — 어떤 결정적 gate 에도 inject ❌.** "항상 ≥1" 은 *제시(offer)* 의 보장이지 *자동 확정(auto-materialize)* 이 아니다. 절단·이름·분할은 사람(soft gate #0). 측정 부재는 source + meta.warnings 로 정직 표기(추정 위장 ❌ / no-simulation 정합).

## 변경 사이트

1. `skills/analysis-source-inventory/SKILL.md` — 신호 사다리에 4번 whole-codebase fallback(cardinality ≥1 바닥) + env-부재에도 ≥1 유지.
2. `schemas/inventory.schema.json` — `source` enum 에 `whole_codebase_fallback` 추가 / `scope_candidates` `minItems:1` / description 교체("미측정 시 빈 배열" → cardinality ≥1 불변식).
3. `methodology-spec/workflow/discovery.md` — 소형·단일 케이스 전이 산문(단일 fallback 제시 → 확정 → init --scope) + 승인 게이트 체크리스트 ≥1 항목.

## 안 하는 것 (명시)

- carve(`tools/scope-carve`, `analysis-scope-carve`) 무수정.
- chain-driver `src/*`(gate-eval / state-store / sync) 무수정 — STRONG-STOP. `rehydrateCursorFromManifests()` mode='none'(scope 0개)은 레거시·확정-전 backward-compat 로 **유지**.
- `state.schema.json` `current_scope` null **제거 ❌** — 기존 global-mode 배포 backward-compat 보존(MAJOR 회피 / over-block·charter R16·R17 축 회피). 따라서 본 변경은 **MINOR·additive**.
- `/confirm-scope`(UC in_scope) 무수정.

## 격상 게이트 (§8.1)

~~1차 = 스킬 + 스키마 + 워크플로 + 본 DEC draft. plugin.json bump / CHANGELOG / lifecycle-contract MANDATORY 등재 = ≥2 distinct 도메인 PoC corroboration + 독립 적대적 리뷰 GO 후.~~ (DEC-2026-06-09 scope-carve draft-first 선례 동형)

**충족 → v0.90.0 시행 (2026-06-30)**: ≥2 distinct 도메인 풀 E2E — **ep-be-gea**(legacy Java/iBATIS, ep-be-gea-batch 78 java) + **poc-19**(modern Python, numpy-financial) 둘 다 실 architecture.json 에 실 carve 실행 → (멀티모듈) 1 후보=fallback 불발(스푸리어스 ❌) / (atomic 단일 모듈) 0 후보 → whole_codebase_fallback inventory schema-valid → `chain-driver init --scope` 가 scope 컨테이너(`scopes/<slug>/{discovery,spec,plan,test,impl}`) 물질화. 독립 적대적 리뷰(senior) 6축(신뢰모델 inject·over-block·backward-compat·no-simulation·carve 무수정·스키마) 전부 CLEAR. lifecycle-contract = 신규 자산 아님(inventory 기존 자산의 산출 계약 refinement)이라 별도 MANDATORY 등재 없음.

## 검증

- schema-validator: 변경 inventory.schema 로 신규/기존 산출물 검증(fallback 후보 통과 / source enum). 기존 examples/fixtures 에 빈 `scope_candidates:[]` 부재 확인 — minItems:1 무회귀.
- chain-driver 단위테스트 + release-readiness 전수 회귀 무손상.
- ≥2 PoC E2E: (a) inventory whole_codebase_fallback 1개 emit, (b) soft gate #0 단일 scope 확정 제시, (c) 확정 → init --scope 컨테이너 1개 물질화.

## Relates

- DEC-2026-06-25-state-model-simplify (global 모드 = null 커서 유지 / 본 결정이 보완) · DEC-2026-06-09-scope-carve-3signal-reference-lens (carve reference-lens 불변 / §2.7 slug) · DEC-2026-05-28 §4.2 (gate-inject ❌ trust 모델) · DEC-2026-06-06-analysis-exit-gate (soft gate #0 surface) · feedback_chain_driver_deterministic_axis (STRONG-STOP) · feedback_quality_priority (§8.1).
