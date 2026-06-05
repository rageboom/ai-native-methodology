# DEC-2026-05-30-code-pointers-intent-na-backstop

> v11.12.0 MINOR release SSOT. dep-graph 의도/집계 노드 `code_pointers_na` 기본 backstop (F-DOGFOOD-009).
> 상태: **승인 + 시행 완료** (2026-05-30 / session 56차). 사용자 결단 chain — `/clear` 후 "다음 작업 진행하자" → carry queue 정직 평가 (①S2 gate=환경 차단 / ⑤ code_pointers=즉시 시행 가능·dogfood-driven) → AskUserQuestion "⑤ code_pointers 패치" → Senior 설계 리뷰(REVISE @ 82%) → AskUserQuestion "전체 진행" → 시행 + release.

## 배경 (F-DOGFOOD-009)

dep-graph `code-pointer-validator`(release-readiness #16)는 모든 Tier-1 노드(`artifact_kind ∈ {chain, analysis, aspect}`, `state ∈ {active, drift}`)가 `code_pointers`(≥1) 또는 `code_pointers_na=true` 를 갖길 요구한다 (coverage 임계 1.0).

그러나:

- **UC / BHV / AC / TASK** = 의도 노드 (코드 anchor 는 하위 IMPL/TC 가 보유).
- **analysis 15 / aspect 4** = 집계 노드.
- 어떤 템플릿/skill 도 이들에 `code_pointers_na` 를 안 박았고, builder synthesizer 도 기본값을 안 줬다.

→ **RealWorld dogfood 실측** (2026-05-30): artifact-graph 115 노드 / coverage **21.7%** (covered=25 TC / na=**0** / **missing=90** = UC19 + BHV19 + AC25 + TASK19 + analysis8). 의도 노드 전부 `code_pointers:null` + `code_pointers_na:undefined` = "worst combo".

navigate/impact 쿼리는 패치 없이도 정상 작동 (IMPL/TC anchor + chain 엣지 traversal). 패치는 **coverage gate(release-readiness #16) 통과 + 신규/외부 프로젝트의 hand-backfill 제거**용 — dogfood-first 정당화.

## 결단 — "의도/집계 노드 = code_pointers_na 기본" (3-layer backstop / additive / breaking 0)

코드 진입점은 IMPL/TC 면 충분 (둘 다 source_files/source_file 자동 평탄화). UC/BHV/AC/analysis/aspect 는 본질이 의도/집계 → `na=true` 가 정직한 상태. TASK 는 na 기본이되 수정 코드 range 알면 `code_pointers` override 권장 (의존성 추론 정확도↑).

### Layer 1 (load-bearing) — builder backstop

`tools/traceability-matrix-builder/src/graph-synthesizer.js`:

- `defaultNaForIntentNodes(nodes)` 정규화 패스 신설 + 노드 조립 완료 후 1회 호출 (groups dangling prune 뒤 / commit·scope 스탬프 앞).
- 조건: `state==='active'` AND `artifact_kind ∈ {chain,analysis,aspect}` AND `artifact_subkind ∉ {IMPL,TC}` AND `code_pointers` 부재 → `code_pointers_na=true`.
- ** Senior REVISE 반영 — `state==='active'` 게이트**: carry-over deprecated/propose 노드(carry-over loop 가 `pushNode` 한 노드)는 backstop 대상 외 → payload 무변조 (재합성 시 silent content drift 회피). synthesizeGraph 내 drift state 부재(신규=active / carry-over=propose·deprecated만)라 active-only 가 신규 노드 전부 커버 + carried-over 무변조로 정확.
- IMPL/TC 제외 = source fallback 으로 채우거나, 무source 시 `missing` 으로 노출 유지 (**code-bearing 결함 surfacing 보존** = anti-regression 핵심).

### Layer 2 — template 명시성 (작성자 가시화)

schema 가 이미 item-level 에 `code_pointers_na`(boolean / default:false) 정의 → additive / schema-valid:

- `templates/spec/behavior-spec.template.json` — `code_pointers_na: false → true`.
- `templates/discovery/discovery-spec.template.json` (use_cases) / `templates/spec/acceptance-criteria.template.json` (criteria 3) / `templates/plan/task-plan.template.json` (tasks 3) — 각 item 에 `code_pointers_na: true` 추가.

### Layer 3 — skill 한 줄 (작성 규율)

- `discovery-decompose-use-cases` / `spec-compose-behavior-spec` / `spec-derive-acceptance-criteria` — UC/BHV/AC = 의도 노드 → `code_pointers_na:true` 기본.
- `plan-decompose-and-sequence` — TASK = na 기본이되 수정 예정 코드 range 알면 `code_pointers` 채워라 (implicit 의존 추론 range overlap → blocks 정확도↑).

## 검증 (§8.1 1차 corroboration / RealWorld / Type 1.5 external repo / no-simulation)

실 production 경로 (builder CLI → patched synthesizer → code-pointer-validator CLI)로 RealWorld 그래프 재합성 실측 (`_dogfood-realworld/spring-boot-realworld-example-app`):

|                                 | covered | na  | missing | ratio     |
| ------------------------------- | ------- | --- | ------- | --------- |
| **BEFORE** (patch 前 graph)     | 25      | 0   | 90      | **21.7%** |
| **AFTER** (patched synthesizer) | 25      | 90  | 0       | **100%**  |

- node parity 115=115 (chain 107 + analysis 8 / na 만 0→90 변화).
- `na_conflict` findings = 0 (포인터 보유 노드엔 na 미설정).
- `coverage_missing` findings = 0.
- **TC 25 covered 유지** (code-bearing 노드 무회귀 / na 로 전환 ❌).
- release-readiness #16 은 정적 poc-05 corpus(이미 100% 백필) read 라 **무영향**.

test +5 (graph-synthesizer.test.js / builder 105→110): ①intent na 자동 ②포인터 보유 no-op ③IMPL/TC 무source→missing 유지(anti-regression) ④analysis/aspect na + plan(EPIC) 무변경 ⑤carried-over deprecated intent → na 미stamp( Senior 게이트 회귀 anchor).

## carry

1. **C-codepointer-analysis-aspect-enrich** — analysis/aspect `code_pointers` 본격 enrich (Layer 1 backstop na 가 가린 부분 / analysis skill 大 변경 → 별 cycle / 사용자 결단 2026-05-30 = na 기본 + carry).
2. **§8.1 2차 corroboration** — RealWorld 외 1 PoC 재합성 21.7%대→100% 재현 (standing / Type 1.5 second arm 또는 신규 PoC).

## STOP-3

workspace 868→**873(+5)** ✅ + release-readiness **22/22** ✅ + skill-citation 252 doc 0 stale + version 3-way 11.12.0 + breaking 0 = **MINOR**.

## paradigm 정합

- **dogfood-first**: 추측 hard-lock ❌ — 실 RealWorld dogfood(21.7%)가 패치 필요성 입증.
- **self-referential corrective drift 회피** (`feedback_self_referential_corrective_drift`): 본 패치는 실 dogfood 데이터 기반(Type 1.5 external repo 실측)이라 self-referential 아님. F-DOGFOOD-009 = real finding 해결.
- **no-simulation**: 실 CLI·실 synthesizer·실 validator·실 RealWorld 데이터로 before/after 측정 (시뮬레이션 ❌).
- **Senior 사실 검증 보강** (`feedback_senior_fact_check_supplement`): Senior REVISE(state 게이트 버그)를 시행 직전 코드 라인으로 검증 후 흡수.
