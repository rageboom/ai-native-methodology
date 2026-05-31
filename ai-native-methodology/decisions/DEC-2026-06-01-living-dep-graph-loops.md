# DEC-2026-06-01-living-dep-graph-loops

> ★ v11.20.0 MINOR release SSOT. Living dep-graph 두 루프(Loop A 동기화 / Loop B 소비) v1 + A2 §8.1 hardening.
> 상태: **승인 + 시행 완료** (2026-06-01 / session 59차). `plan-living-dep-graph.md` §8③ "착수 결정 시 plan → DEC 격상" 이행. 사용자 결단 chain — "plan-living-dep-graph 이어서" → 5 commit(미released) 검증 workflow(3 verifier + 2 skeptic) → AskUserQuestion 3종 batch 모두 "추천" 선택: ① **Release v11.20.0 MINOR** ② **A2 content_drift medium cap / decouple** ③ **잔여 후보 전부 defer**.

## 배경 — P0 운영 재진술 + "designed-but-never-fired" 3종

사용자 원칙: **"그래프를 만들어도 못 쓰면 답이 없다(→ 쓰게 하라=소비) + 상태가 바뀌면 그래프도 바뀌어야(=동기화)."** = 방법론 P0(산출물 = LLM 운영 컨텍스트를 평생 **양방향 역동기화**하여 AX 운영)의 운영 언어. dep-graph 는 "만들기"(navigate 백엔드 + 4-state schema)만 있고 **두 루프가 모두 비어** P0 미달이었음.

관통 사실 = 거의 다 "배선"이지 신규 발명이 아님. **3 "designed-but-never-fired"**: ① `suggested_path` 필드 있는데 validator 가 계산 안 함 ② `content_changed→drift` 전이 있는데 코드측 생산자 없음 ③ `commit_hash` 저장되는데 수동 timestamp 로만. → 빠진 건 **트리거/생산자(동기화) + 소비 배선**.

## trust 선 (§2 / 두 루프 공통 / 절대 규칙)
- **결정론 신호**(git blob-diff·`--follow`, ts-morph/tsc, coverage, oasdiff) = 자동·권위적 가능 / 출력이 verdict 면 gate-eligible(Semgrep 동급).
- **휴리스틱 신호**(CodeGraph, embeddings, co-change, churn) = propose/finding-only / active 자동쓰기 ❌.
- **경계**: 결정론 추출이어도 **topology 제안**(새 엣지·노드·orphan·centrality)이면 propose 유지. **verdict 일 때만 gate.**

## 결단 — 두 루프 v1 = 전부 결정론·read-class·opt-in (gate-class 전부 DEFER)

### Loop A — 동기화 루프 (`tools/code-pointer-validator` / 결정론 git 신호 / 전부 opt-in)
- **A1 freshness** `checkGraphFreshness()` — synthesized_at vs derived_from source mtime → `graph.stale` finding. git 무관·상시 계산·**display-only**(exit code 무영향 / result.findings 외부).
- **A2 content-drift** `detectContentDrift()` — 저장 commit_hash 기준 `git diff --name-only <hash> HEAD` → `code_pointer.content_drift` finding (opt-in `--git`). `applyContentDrift()` 생산자 = active→drift (graph-synthesizer TRANSITIONS isomorphic / propose·deprecated 보존).
- **A2-wire** `--apply-drift` — content-drift 노드 state=drift 를 live artifact-graph.json 에 기록 (변경 시에만 write). **어떤 hook·gate·release-readiness 도 자동 호출 ❌ = 순수 수동 opt-in.**
- **A3 relocation** `findRelocation()` — `git log -M --diff-filter=R` rename → `path_missing` finding 에 `suggested_path` 첨부. 제안만(auto-commit ❌) / 이동처 실존 시에만(`existsSync` guard = 날조 ❌). dead schema 필드 활성화.
- 전부 opt-in / git 부재·repo 아님 = graceful null (no-simulation). 기존 `validateCodePointers` 반환 shape + release-readiness #16(`--git` 미전달) 무영향 = breaking 0.

### Loop B — 소비 루프 (`tools/chain-driver` navigate F3/F4 + 5 agent consult / read-class)
- **consult** — discovery/spec/plan/test/implement agent body 에 "dep-graph 소비" 섹션: stage 진입 시 작업 노드를 `chain-driver navigate` 로 조회(backward=honor / forward=영향 / code_pointers), **AI 추론 0% verbatim**(등급·centrality 재계산 ❌). PLAN 의 의존성 AI-재유추 → 그래프 조회 전환 명시. frontmatter skills[] **무변경**(Bash+CLI 접근 / drift-validator skills≡phase-flow invariant 보존).
- **F3** `navigate --stage <s>` / `--scope <id>` — 단일노드→단계 일괄 의존성 rollup (STAGE_SUBKINDS + scope_id·state filter / analyzeImpact·centrality 재사용).
- **F4** — stage 방향 프리셋(discovery/spec/implement=backward / plan/test=forward) + `--direction` override. presentation-only(analyzeImpact 무변경).

### ★ A2 §8.1 hardening (release 검증 sub-agent finding 흡수 / 사용자 결단 ②)
검증 workflow 가 발견: content_drift severity 가 `opts.strict ? 'high' : 'medium'` 라 `--git --strict` 시 high→exit1 로 격상 = **latent 단일 도메인(RealWorld/poc-05) hard-gate** (trust 선 §2 상 결정론 verdict 는 gate-eligible 이나 §8.1 ≥2 distinct 도메인 전 hard-gate ❌). plan §3 v1 의 "비-gating(medium)" 주장과도 모순. ★ 핵심: `--strict` 는 medium 도 gate 하므로 단순 high→medium cap 만으로는 decouple 불충분.
- **시행**: ① validator.js content_drift severity = **medium 고정**(--strict 무관) ② 신규 export `computeGateFail(findings, {strict})` 가 `code_pointer.content_drift` 를 gate(fail) 계산에서 **제외** ③ cli.js fail/status 가 computeGateFail 사용(release-readiness #16 = --git 미전달이라 무영향 = 무회귀) ④ CLI usage·exit-code 문구 정합.
- → content_drift 는 medium 으로 **보고만**(가시성 유지) / gate 기여 ❌ = ≥2 distinct 도메인 corroboration 전까지 non-gating. ※ A1 freshness 는 애초에 result.findings 외부라 자동 non-gating.

### DEFER (gate-class 후보 / §8.1 ≥2 distinct 도메인 전 진입 ❌ / 사용자 결단 ③)
- **A4** ts-morph/JaCoCo anchor symbol 검증 (env 의존 / R19 Tier).
- **A5** edge propose-state (schema 확장 = breaking risk).
- **B2-full** SessionStart per-scope 자동주입 hook (무거움 / stage-entry event 부재).
- **B5** go/stop gate MUST-backward 미충족·drift surface (유일 gate-class / ≥2 distinct 도메인 의무).
- contract-diff(oasdiff) gate / coverage TC→IMPL gate.

## 검증 (no-simulation / 실 CLI·실 git·실 그래프)
- **5 commit 사전 검증** (workflow `wf_2a79ea7a` / 3 verifier + 2 skeptic): trust 선 compliant / §8.1 active 위반 0 (skeptic 2종 반증 실패) / breaking 0 / MINOR-eligible 확정. applyContentDrift active→drift = `drift` 가 모든 gating consumer 에서 state-neutral(gate-eval 은 node.state 미read / coverage 는 active≡drift)이라 gate-class 아님 = 명시 입증.
- **A2 fix 실측**: code-pointer-validator 35→**39** test(content_drift medium-under-strict + computeGateFail decouple anchor 3종 / pass 39 fail 0). poc-05 `--git --strict` → 5 MEDIUM content_drift / **PASS exit 0** (BEFORE = 5 HIGH exit 1 / decouple 입증).
- chain-driver navigate 20/20 / drift-validator chain-layout 0 orphan·0 missing / skill-citation 0 stale.

## STOP-3
workspace 973→**977(+4)** ✅ + release-readiness **26/26** ✅ + skill-citation 0 stale + version 3-way **11.20.0** + breaking 0 = **MINOR**.

## carry
1. **STATUS.md 3-version catch-up** — STATUS 최상단이 session 58/v11.16.0 라 v11.17/18/19 entry 부재 (CHANGELOG/INDEX/DEC 에는 존재). 본 release session 59 entry 에서 인지·기록 (별 backfill 은 후순위).
2. **gate-class 진입 = §8.1 ≥2 distinct 도메인** — A2-as-gate(`--strict` 재결합) / B5 / contract-diff / coverage gate 는 2nd distinct 도메인(현 RealWorld MyBatis3 단일) corroboration 후 별 release. 능동 착수 ❌.
3. **`--apply-drift` 가 commit_hash stale fixture(poc-05) 수동 실행 시 tracked fixture 변조** (skeptic 2 watch-item) — 자동 caller 0 이라 비-결함이나, A2-wire 를 hook 배선 시 corpus fixture 보호 의무.
4. **A4/A5/B2-full** — env·schema·hook 무거움 각각 별 plan + research.

## paradigm 정합
- **navigate 재발명 ❌** — 두 루프 전부 기존 결정론 백엔드(analyzeImpact/centrality/git) glue.
- **self-referential corrective drift 회피** (`feedback_self_referential_corrective_drift`): 본 release = P0(양방향 역동기화) 운영 배선 = 실 prod 가치 진전 (자기 도구 doc drift sweep 아님). A2 fix 는 release 검증 sub-agent 의 real finding 흡수.
- **no-simulation**: 실 git·실 CLI·실 그래프(poc-05) before/after 측정 / persona simulation ❌.
- **§8.1 strict**: 단일 RealWorld 도메인 근거 gate-class 격상 전부 DEFER / read-class 만 ship.
- **사용자 결정 gate** (4원칙 3): plan §8 의 pursue/후보/DEC-격상 = AskUserQuestion 3종 batch 로 사용자 결단 후 시행.
