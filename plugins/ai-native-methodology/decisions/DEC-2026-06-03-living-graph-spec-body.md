# DEC-2026-06-03-living-graph-spec-body

> v12.3.0 MINOR release SSOT. dep-graph 의도③ "질의 → 영향 + **스펙** + 코드"의 스펙 본문 슬라이스 — `chain-driver navigate --with-spec` 신설.
> 상태: **승인 + 시행 완료** (2026-06-03). 4원칙 = `plan-dep-graph-spec-body.md` → 2-agent research(Senior 적대적 설계리뷰 0.83 + 코드사실 F-015 독립검증) → 사용자 결단 D1(범위=UC+BHV+AC) + D4(trust=+release-readiness grep-gate).

**작성일**: 2026-06-03

**relates to**:

- `DEC-2026-06-03-living-graph-resync-cmd.md` (v12.2.0) / `DEC-2026-06-03-living-graph-a1-surface.md` (v12.1.0) — 의도② 동기화 한 쌍. 본 DEC = 의도③ 첫 슬라이스(소비 루프 / [[project_living_dep_graph_two_loops]] "navigate 가 답을 다 줘야").
- `DEC-2026-05-28-codegraph-probe-결과` — §4.2 reference-lens / 결정적 gate 주입 ❌ trust 모델 (본 DEC 가 동형 적용 + 코드 강제).
- s68 triage(워크플로우 4-agent + Senior 0.84) — "다음 슬라이스 = ③ intent3-spec-body / 사용자 '신규 세션에서' = NEXT SESSION 진입점". 본 release 가 그 진입점.

---

## 0. 한 줄 요약

navigate 가 영향 트리·centrality·code anchor 는 줬으나 **노드 스펙 본문(title 조차) 미노출** → 리뷰어가 source 직접 grep 필요(소비 루프 P0 통증). `--with-spec`(default off) 로 노드 source 파일에서 UC/BHV/AC 본문을 **lazy-read** 해 **reference-lens** 로 표시. display-only·결정론·회귀 0. 본문은 어떤 결정적 gate 에도 inject ❌ — **라벨이 아니라 release-readiness check31 로 코드 강제**.

## 1. 문제 (의도③ 부분충족)

dep-graph 4-의도 감사(s68): ③ "질의→영향+스펙+코드" = 부분충족. 영향 트리(BFS)·centrality·code anchor ✅ / **스펙 본문 미노출** ❌ — `result.node`(cli.js)는 `{id, artifact_kind, artifact_subkind, state, source_path, code_pointers, code_pointers_na}` 만, title 조차 없음. 본문(UC actors/pre/post, BHV invariants, AC gherkin)은 source 파일에 실재하나 navigate 가 안 읽음.

## 2. 결단

### D1 — 본문 범위 = UC + BHV + AC (사용자 승인 / Senior 권고)

carry 원안은 "BHV+AC 만 / UC carry"(UC shape 미확인). 본 세션에서 **UC shape 확정**(discovery-spec `use_cases[]` = BHV 와 동일 config 경로 / ecommerce 2nd 도메인 shape match) → 추가비용 ~0 + carry round-trip 회피(재작업 최소화 2순위) → **3종 포함**. 단 cap allow-list 는 subkind 별 **field-exhaustive**(UC=actors/pre/post, BHV=invariants, AC=gherkin / 공유 가정 ❌ — Senior must-fix #2).

### D2 — source 해석 = hybrid (Senior REVISE 반영 / existsSync 전 branch gate)

`source_path` 는 합성기가 caller 입력 경로 그대로 저장(절대=dogfood 실측 / 상대 가능 / placeholder `'(behavior)'`). 해석: `isAbsolute`→직접 / 아니면 graph-dir(co-located 실측) → repoRoot(schema 계약) → basename(lossy) → cwd. **existsSync 가 모든 후보(절대 포함) gate** — must-fix #1: 원안은 절대경로를 existsSync 없이 readFileSync 직행 → stale/타머신 절대경로(=dogfood common case)에서 uncaught throw → navigate 비정상 exit = 회귀. graceful `{available:false, reason}`.

### D3 — 출력 = result.spec (top-level / node 무변경)

`result.spec` sibling (withSpec 일 때만) → `result.node` byte-identical 보존 = 회귀 0 불변식. nested(`result.node.spec`)는 기존 node shape 변형 → snapshot 소비자 위험.

### D4 — trust 강제 = +release-readiness grep-gate (사용자 승인 / Senior trust_model_ok=false 해소)

본문 = reference-lens. 라벨 `(reference-lens / gate 주입 ❌)` 은 주석일 뿐 → **check31 신설**(content-aware): ① gate-eval + findings-aggregator 에 spec-body accessor 토큰(`readSpecBody`/`SPEC_SUBKIND_CONFIG`/`withSpec`/`with-spec`) 0 (음성) ② cli.js `readSpecBody` 호출 1곳(cmdNavigate 단일 / gate 경로 cmdNext 침투 차단) ③ `reference_lens:true` 라벨(양성). reference-lens 가 aspirational → enforceable.

## 3. 시행 (`chain-driver/src/cli.js`)

- `--with-spec` 플래그(parseArgs / default off) + usage·navigate 주석.
- `SPEC_SUBKIND_CONFIG`(UC/BHV/AC) + `capSpecArray`(5 cap + `… (+N more)` 정직 / 모든 배열 균일 — must-fix #3) + `resolveSpecSource`(hybrid) + `readSpecBody`(reference_lens:true 항상 / graceful).
- cmdNavigate: `if (args.withSpec) result.spec = readSpecBody(node, args.graphPath)` (JSON) + text `spec 본문 (reference-lens / gate 주입 ❌)` 블록 (code_pointers 직후 / 영향 트리 前 = 노드 정체성 먼저 읽힘).
- rollup(`--stage`/`--scope`) 은 origin-mode 분기 前 라우팅 → `--with-spec` 무시(본문 폭증 없음).
- 본체 알고리즘(analyzeImpact/centrality)·노드 스키마 무변경.

## 4. 검증 (no-simulation / 실 CLI·실 그래프)

- 새 test 12 (navigate-cli.test.js 21→33): 3 subkind 본문 + 회귀0(off) + cap 경계 5/6 + AC 빈 then + source 부재 + id miss + 미지원(TASK) + rollup spec-키부재 + text 라벨/불가.
- **2 distinct 도메인 corroboration** (§8.1 — display-class 단일 ship 안전이나 본문필드 일반성): RealWorld[Spring/JUnit] UC/BHV/AC 본문 + ecommerce[NestJS/Prisma] BHV·AC gherkin 실 render = shape match.
- workspace **1063 pass / 0 fail** + release-readiness **31/31**(check31 신설) + version 3-way 12.3.0 + CLAUDE/README sync / breaking 0.

## 5. carry (DEFER / 능동 착수 ❌ / 4원칙 경유)

- 의도③ 잔여: **what-if** = propose 등재 producer 부재 + `do_not_edit_manually` 계약 → in-memory 비파괴+사용자명시입력만 (DEFER) / **NL 라우팅** = `resolvePromptToNodes` 재사용 glue (저위험 / ③ 다음 1순위 DEFER) / TASK·TC·IMPL 본문 + UC discovery-spec 외 채널.
- 의도①④: codegraph 코드축 통합(C-codegraph-migration-role / 대형 legacy §8.1) — 별개 명제.
- 의도② session-lazy auto-resync = REJECT 현시점(tracked fixture surprise-write).
- content-hash freshness 정밀화.

## 6. Why / How to apply

**Why**: 산출물 = LLM 운영 컨텍스트(P0 / [[project_methodology_purpose_ax_operation]]). navigate 가 영향만 주고 "이 노드가 뭐 하는지"는 grep 시키면 소비 루프 미완 → AX 운영 통증. 본문 lazy-read = navigate 가 답을 다 주는 소비 루프 진전 (self-referential 도구 fix 아님 = 정직 prod 가치 / [[feedback_self_referential_corrective_drift]]).
**How to apply**: navigate 출력 spec 본문은 **reference-lens** — LLM 이 등급/결정에 쓰면 ❌ (결정적 BFS·gate 가 SSOT). spec body 를 gate 입력으로 끌어들이는 변경 제안 시 = check31 가 차단 / DEC-2026-05-28 §4.2 trust 선 위반.
