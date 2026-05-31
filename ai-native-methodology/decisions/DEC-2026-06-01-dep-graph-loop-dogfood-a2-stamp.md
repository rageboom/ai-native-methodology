# DEC-2026-06-01-dep-graph-loop-dogfood-a2-stamp

> ★ v11.21.0 MINOR release SSOT. shipped dep-graph Loop A/B 의 RealWorld dogfood 실측 + fix 1 (synthesizer commit_hash auto-stamp / **F-DF-A2-001 RESOLVED**).
> 상태: **승인 + 시행 완료** (2026-06-01 / session 59차 계속). v11.20.0(Loop A/B v1 release) 직후 사용자 "이어서 진행" → AskUserQuestion "shipped dep-graph 루프 dogfood" → 실측 → finding → AskUserQuestion "fix 1: commit_hash auto-stamp" → 4원칙(plan + 경량 research GO@0.85 + 승인) → 시행 → AskUserQuestion "v11.21.0 MINOR 릴리스". plan `.claude/plans/plan-dep-graph-loop-dogfood.md`.

## 배경 — P0("만들어도 못 쓰면 답 없다 → 쓰게 하라") 직접 검증

v11.20.0 가 ship 한 Loop A(동기화)/Loop B(소비) 가 **실 synthesized 그래프에서 실제 작동·유용한지** no-simulation 실측. 대상 = `_dogfood-realworld/spring-boot-realworld-example-app` (HEAD `ee17e31` / artifact-graph.json 115 nodes / 25 code_pointers / commit_hash 0 / all active).

## dogfood 실측 결과 (실 RealWorld 그래프 + 실 git)

| 루프 | 판정 | 물증 |
|---|---|---|
| **Loop B navigate (소비)** | ✅ 작동 + 유용 | `navigate --stage spec` → 44 노드 rollup / 각 AC 의 honor(backward)=BHV·UC·analysis-business-rules 표시 = "grep 없이 무엇 honor" 답함 |
| **Loop A / A1 freshness (동기화)** | ✅ 작동 + 유의미 | `graph.stale` 발화 — discovery-spec.json(16:37) > synth(05:51) 정확 탐지 |
| **Loop A / A2 content-drift** | ⚠️ 메커니즘 정상 / 실 그래프 inert | positive demo(validator.js+commit_hash=decd28d) `--git` → content_drift 발화 / 실 그래프 → 0건 (commit_hash 부재) |

### finding (적극 반증 후 / source-grep 정정)
- **F-DF-A2-001** — 실 그래프 25 pointer = commit_hash 0 → A2 inert. ~~"synthesizer 가 commit_hash 안 stamp"~~ 는 **반증·정정**: `graph-synthesizer.js:214/562` 조건부 stamp 존재. 정확한 갭 = **현 HEAD 에서 pointer.commit_hash auto-derive 안 함** → 상류 안 실으면 silent no-op. → **본 fix 로 RESOLVED.**
- **F-DF-ANCHOR-002 (carry)** — covered pointer 25 = 전부 `generated-tests/`(생성 테스트) → 실 `src/main/java` production 코드 무앵커(IMPL=na). RealWorld A2 가 실 코드 변경 보려면 IMPL 실 src 앵커 필요.
- **F-DF-A2-003 (carry)** — A2 = `git diff <hash> HEAD` (commit↔commit) → uncommitted working-tree 변경 미탐지.
- **F-DF-FRESH-004** — 실 그래프 stale + pre-backstop(21.7%) → A1 정확 탐지 → 올바른 응답=재synth = 동기화 루프 가치 실증.

## fix 1 — synthesizer commit_hash auto-stamp (read-class·결정론·additive)

경량 research(공식 git/Node docs 검증 + Senior GO@0.85) 수렴 설계:
- **D1 baseline = uniform synth-time HEAD** (full 40-char `git rev-parse HEAD`). per-file last-touch 는 false-drift(synth 이전 변경 발화) 위험으로 **반증** / SLSA provenance·git blame baseline 관행 동형.
- **D2 = builder cli.js auto-derive + synthesizer stamp** — `--commit-hash` 미지정 시 cli.js 가 `git rev-parse HEAD` derive (makeGitRunner 패턴 inline = cross-package import 회피 컨벤션) → 순수 synthesizer(`:560` 블록)는 입력 commitHash 로 strict_path pointer 스탬프 (execFileSync 를 순수 모듈에 안 넣어 950+ test 결정성 보존).
- **D3 graceful** — git 부재/비-repo/throw → undefined → 미스탬프 = 기존 behavior 무변경 (no-simulation: 날조 ❌).
- **D4 default-on / additive** — `computeGateFail`(v11.20.0)이 content_drift 를 gate 제외하므로 stamp 가 release-readiness #16 fail 유발 불가.
- **anti-regression** — strict_path 만 + `!ptr.commit_hash`(상류 `:214` impl.commit_hash 보존) + glob/ast_symbol/doc_link 제외(`git diff -- path` 무의미 = false-drift 회피).

## 검증 (no-simulation / 실 CLI·실 git)
- builder test 110→**114** (4종 anti-regression anchor: stamp present / backward-compat 미지정→미스탬프 / anchor-restriction strict_path만 / no-overwrite :214 보존).
- **CLI 실 smoke**: `--graph`(--commit-hash 미지정 / cwd=methodology git repo) → auto-derive HEAD `776dc00…`(40char) → IMPL-T strict_path pointer.commit_hash 스탬프 확인.
- A2 positive demo(temp graph + commit_hash=decd28d + 실 drift) → content_drift 발화(§8.1 non-gating cap 준수 PASS exit 0).
- workspace 977→**981(+4)** / 0 fail.

## STOP-3
workspace **981/981** ✅ + release-readiness **26/26** ✅ + skill-citation 0 stale + version 3-way **11.21.0** + breaking 0 = **MINOR**.

## §8.1
fix = read-class·결정론·additive infra(HEAD stamp) → **gate-class 아님** (≥2 도메인 제약 비대상). A2 severity 는 non-gating(v11.20.0 cap) 유지. ★ 정직: dogfood 단일 RealWorld 도메인 — fix **메커니즘**(stamp + A2 발화)은 methodology repo smoke 로도 입증되나, "A2 가 실 프로젝트에서 유용 drift 를 잡는다"의 **threshold/usability** 는 단일 도메인 = inflate ❌ (gate-class 격상 시 ≥2 distinct 도메인 의무).

## carry
1. **F-DF-ANCHOR-002** — IMPL 노드 실 src/main 앵커 (RealWorld A2 가 실 코드 보려면 / C-codepointer-analysis-aspect-enrich carry 연계 / analysis skill 大 변경 / 별 cycle).
2. **F-DF-A2-003** — A2 working-tree 모드 (`git diff <hash>` HEAD 생략 / uncommitted 탐지 / opt-in 설계 결정).
3. **A3 relocation** dogfood 미실측 (path_missing + rename feasibility / 우선순위 낮음).
4. STATUS v11.17~19 backfill (v11.20.0 carry 유지).

## paradigm 정합
- **dogfood-first / "쓰게 하라"** — 추측 ❌, 실 RealWorld 측정이 갭 입증 → fix. self-referential 아님(real finding 해결 / P0 운영 가치).
- **적극 반증 의무** (`feedback_senior_fact_check_supplement` + F-015) — "synthesizer 가 commit_hash 안 stamp" 초기 inference 를 source-grep 으로 정정. research Senior REVISE(D1 uniform vs per-file) 흡수.
- **no-simulation** — 실 git·실 CLI·실 그래프 / persona ❌.
- **사용자 결정 gate** (4원칙) — dogfood→fix→release 각 AskUserQuestion 결단.
Extends DEC-2026-06-01-living-dep-graph-loops.
