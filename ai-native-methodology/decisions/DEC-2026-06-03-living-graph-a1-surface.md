# DEC-2026-06-03-living-graph-a1-surface

> ★ v12.1.0 MINOR release SSOT. dep-graph Loop A 동기화의 첫 소비 슬라이스 (B-minimal) — SessionStart 배너에 graph freshness 정직 노출 (stale 그래프 false-health 방지).
> 상태: **승인 + 시행 완료** (2026-06-03). 4원칙 = `plan-living-dep-graph.md` §8③ "착수 결정 시 plan → DEC 격상" 이행. 사용자 결단 chain — "dep-graph 단계 점검(의도 4종)" → 워크플로우 4-의도 감사 + 적대적 반증 → AskUserQuestion "추천" (방향 위임) → 의도② 동기화 추천 → "계속 진행" (B-minimal 착수 승인).

**작성일**: 2026-06-03

**relates to**:
- `DEC-2026-06-01-living-dep-graph-loops.md` — Loop A(A1/A2/A3)·Loop B v1 / 본 DEC 가 A1-surface(designed-but-never-fired #1) 를 소비로 결선.
- `DEC-2026-06-03-s2-legacy-representation-and-test-strategy.md` §3 — carry `C-living-graph-autotrigger` / 본 DEC 가 그 첫 슬라이스.
- `plan-living-dep-graph.md` §3 Loop A / §6 시퀀스(A1 freshness = 선결조건) / §8 다음.
- `STATUS.md` (2026-06-03) + memory `project_living_dep_graph_two_loops` · `project_methodology_purpose_ax_operation`.

---

## 0. 한 줄 요약

dep-graph 4-의도 점검(① 모든 의존 기록 / ② 변경 포착 / ③ 질의 영향+스펙+코드 / ④ 정적엔지니어링)에서 **4 의도 모두 "부분충족"** 확인. 가장 P0-가깝고 격차가 명확한 **의도② 동기화**의 첫 슬라이스로, SessionStart 배너의 **false-health(stale 그래프를 "0 drift=건강"으로 거짓 보고)** 를 `checkGraphFreshness` 노출로 해소. display-only / 자동 write ❌ / 단일 도메인 안전.

## 1. 점검 findings (워크플로우 4-의도 감사 + 적대적 반증 + 직접 정독)

- **의도① 모든 의존 기록 = 부분충족**: artifact 추적 의존(UC→…→IMPL / analysis↔chain)은 결정론 기록되나 **코드↔코드 의존(import/call) 미기록**(코드파일=implements leaf 문자열 / 노드 아님) · `depends_on` 생산자 0 · analysis↔analysis 0 · migration-start(analysis-only) 코드 의존 0(poc-16 실측 implements/tests/conforms_to=0).
- **의도② 변경 포착 = 부분충족**: **탐지**(A2 content-drift git diff / A3 rename / A1 mtime / M4 sha256)는 결정론 구현 / **동기화(그래프 write)는 전부 수동** — 재합성(`--graph`)·`--apply-drift`·cascade 자동 caller 0. PostToolUse 는 `impact_pending` 마킹만. **★ false-health**: `buildGraphSessionContext`(SessionStart)가 freshness 무시 → poc-05 stale(3 source 변경) 인데 "0 drift" 보고.
- **의도③ 질의 영향+스펙+코드 = 부분충족**: 영향트리(MUST/SHOULD/FYI BFS)·centrality·code anchor 는 됨 / **스펙 본문 미노출**(노드 title 한 줄·navigate 출력엔 title 조차 없음) · **"기능 추가 시" what-if 불가**(origin 노드 기존 존재 필요) · NL 라우팅 부재 · stage agent consult = LLM 산문 권고(결정론 미배선).
- **의도④ 정적엔지니어링 = 부분충족**: artifact-graph 축(DFS cycle/Kahn topo/PageRank/BFS)은 충실+gate강제 / **codegraph(AST) 통합 0**(code-graph.json 결정적 소비처 0·실그래프는 휘발 SQLite·통계요약만 영속) · **ast_symbol 앵커 생산 0**(파일수준 strict_path/glob 천장).

## 2. 결단 — 의도② 첫 슬라이스 = B-minimal (Senior 설계리뷰 0.93)

3-agent research(공식문서/산업사례/Senior) 수렴:
- 공식문서(Nx/Bazel/Turborepo/Sourcegraph/LSP): **stale 표시+lazy 재계산 > 권위적 즉각 덮어쓰기** / content-hash > commit-hash / 트리거 채널 분리.
- 산업사례: **commit 에 그래프 자동 덮어쓰기 = fixture 오염 함정**(우리 poc fixture 직결) / 결정론=auto-flip·휴리스틱=propose / forwarding(변경 노드만).
- Senior(0.88→0.93 실측 후): **B-minimal 채택** / **C(자동 apply-drift) REJECT**(소비자 0 = P0 역전 + committed-path fixture 가드 부재) / **A(증분 재합성) DEFER**.

### 시행 (display-only / 결정론 / 무회귀)
- `tools/_shared/graph-freshness.js` 신설 — `checkGraphFreshness`(fs mtime / `child_process` 무관 = hot-path 경량) 추출(`_shared` 컨벤션 / DRY). `code-pointer-validator/src/validator.js` 는 re-export(export 표면·cli.js #16·test 무변경).
- `chain-driver/src/cli.js buildGraphSessionContext` — stale 시 `⚠️ STALE — N source 변경(basename) → 재합성: traceability-matrix-builder --graph` 를 `[dep-graph] N nodes` 직후 prepend. 실패=non-fatal skip. **자동 재합성·drift write ❌**.

### trust 선 정합
- freshness 노출 = **verdict 아닌 display**(additionalContext / 기존 배너 동급 trust class) → gate 표면 0 / `suppressOutput` 의미 불변 / 단일 도메인 안전. A1 freshness 는 애초에 result.findings 외부(non-gating).

## 3. DEFER (능동 착수 ❌)
- **A** PostToolUse 증분 재합성 — affected-scope diffing = hot-path 새 코드 / `previousGraph` carry-over 부분재합성 미검증. 별도 plan + ≥2 도메인.
- **C** 자동 `--apply-drift` — 소비자(B5/navigate drift-surface) 0 = "동기화 without 소비" P0 역전 / committed `--apply-drift` fixture 오염 가드(repo-self) 부재. consumer + guard 선행 의무.
- **B2-full**(SessionStart per-scope 자동주입 / stage-entry 이벤트 부재) · **A4**(ts-morph/JaCoCo / R19 Tier env) · **A5**(edge propose-state / breaking schema) · **B5 gate** — §8.1 ≥2 distinct 도메인.
- **content-hash freshness 정밀화** — mtime 은 clone 직후 over-report 가능(공식문서 시사점 / Bazel·Turborepo content digest 선례). 별도 carry.

## 4. 정직한 scope 한계 (over-promise 회피)
- `detectContentDrift` 는 HEAD-relative → 미커밋(WIP) production 코드 변경은 `--worktree` 없이 미탐지 = **"commit granularity 에서 live"**(실시간 sync ❌ / Senior watch-item).
- 본 슬라이스는 의도② 의 **소비측 정직화**(stale 노출)일 뿐 — 자동 동기화(그래프 write/재합성)는 여전히 수동(DEFER A/C).

## 5. 검증 (no-simulation / 실 CLI·실 그래프)
- **실측 false-health gap**: poc-05 `code-pointer-validator --format json` → `freshness.stale=true` (3 source: task-plan/business-rules/antipatterns / synthesized_at 2026-05-28 이후 변경) — 8 source 중 3 만 stale = clone-mtime 잡음 아닌 진짜 staleness. 같은 그래프 `by_state.active=18 drift=0` → 기존 배너 false-health 실증.
- 새 통합 test 2 (`session-graph-freshness.test.js` / real `cli.js hooks-bridge` SessionStart spawn): stale→`⚠️ STALE`+basename+재합성 안내 / fresh→`[dep-graph]` 노출하되 STALE 없음.
- code-pointer-validator **45/45**(checkGraphFreshness 3건 re-export 경유 무회귀) / chain-driver **268** / workspace **1046 pass/0 fail** / release-readiness **30/30** / version 3-way 12.1.0 / breaking 0.

## 6. carry
1. **C-living-graph-autotrigger 잔여** — A(증분 재합성) / B2-full(자동주입) / C(자동 apply-drift = consumer+guard 선행). 각 별도 plan + ≥2 도메인.
2. **content-hash freshness 정밀화** — mtime → file SHA digest (clone over-report 해소).
3. **의도③ 신규 후보** — navigate 스펙 본문 노출 / what-if(propose 노드) 시뮬레이션 / NL 영향 질의 라우팅 / stage consult 결정론 배선 (기존 carry 없음).
4. **의도①④** — codegraph 코드축 통합(C-codegraph-migration-role / 대형 legacy §8.1 미검증) / ast_symbol 앵커 생산.

## 7. paradigm 정합
- **navigate/freshness 재발명 ❌** — 기존 결정론 백엔드(`checkGraphFreshness`) glue + 소비 결선.
- **self-referential corrective drift 회피** (`feedback_self_referential_corrective_drift`): 본 release = P0(동기화 루프) 실 prod 가치 진전 — 점검에서 발견한 real false-health gap 해소 (자기 도구 doc sweep 아님). 점검 자체가 사용자 4-의도 driven.
- **no-simulation**: 실 git·실 CLI·실 그래프(poc-05) before 측정 + real spawn test / persona ❌.
- **§8.1 strict**: gate-class(A2-as-gate/B5/codegraph 통합) 전부 DEFER (단일 도메인) / display-class(B-minimal) 만 ship.
- **사용자 결정 gate** (4원칙 3): 방향 위임("추천")→의도② 추천→"계속 진행" 승인 후 시행.
