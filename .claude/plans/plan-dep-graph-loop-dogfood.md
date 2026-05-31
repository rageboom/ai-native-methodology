# plan — shipped dep-graph 루프 dogfood (Loop A/B 실 데이터 검증)

**상태**: 1원칙(깊은 숙지) 진행 + 사전 recon 완료. v11.20.0 직후 / session 59차 후속. 사용자 "이어서 진행" → AskUserQuestion "shipped dep-graph 루프 dogfood" 선택.
**목표**: 방금 ship 한 Loop A/B 가 **실 synthesized 그래프에서 실제 작동·유용한지** no-simulation 실측. P0("만들어도 못 쓰면 답 없다 → 쓰게 하라") 직접 검증 + 갭/finding 도출. **코드 변경 ❌ (측정만)** / 발견 갭 fix = 별 승인 gate.

## 대상
- repo: `_dogfood-realworld/spring-boot-realworld-example-app` (HEAD `ee17e31` / **5 src 파일 uncommitted** = S2 augmentation 슬라이스 CurrentUserApi·UserRepository·UserMapper·MyBatisUserRepository·UserMapper.xml).
- graph: `.aimd/output/artifact-graph.json` (115 nodes / 161 edges / synth 2026-05-30 / derived_from 13 .aimd 산출물 / 25 nodes code_pointers / **commit_hash 0** / all state=active).

## 사전 recon 발견 (이미 도출 / dogfood 로 확증)
- **F-DF-A2-001 (후보)**: code_pointer 에 **commit_hash 0건** → A2 content-drift 가 실 그래프에서 발화 불가 (graph-synthesizer 가 commit_hash 미stamp). "built but unusable" = P0 직격.
- **F-DF-ANCHOR-002 (후보)**: 25 code_pointers **전부 `.aimd/output/generated-tests/...`**(방법론 생성 테스트) → 실 `src/main/java/` production 코드는 **무앵커**. 실 코드 변경(5 파일)이 그래프에 안 보임. (IMPL 노드 = na backstop 으로 na=true / 실 src 미연결.)
- **F-DF-A2-003 (후보)**: A2 = `git diff <commit_hash> HEAD` = commit↔commit → **uncommitted working-tree 변경(현 5 파일) 미탐지**. "지금 편집 중" 상태(가장 흔한 drift)를 못 봄.
- code_pointer path 해석 base = `.aimd/output/` (generated-tests 가 거기 위치).

## dogfood 시나리오 (read-only 실측)
- **B1 navigate rollup**: `chain-driver navigate --stage {discovery,spec,plan}` + `--scope` on real graph → honor(backward)/affects(forward)/code_pointers rollup. **유용성 판정**: "이 UC/BHV 가 honor 할 상류 + 바꾸면 영향받는 하류"를 grep/기억 없이 주는가.
- **B2 방향 프리셋(F4)**: `--direction` override vs stage 기본값 실측.
- **A1 freshness**: `code-pointer-validator <graph> --repo-root .aimd/output` (no --git) → `graph.stale` 발화 여부 (derived_from 13 산출물 mtime vs synth 05-30).
- **A2 content-drift**: (a) 현 그래프 `--git` → 발화 0 확인(commit_hash 부재 확증) (b) **positive demo**(temp graph / 실 tracked 파일 + 실 old commit baseline → `--git` → content_drift 발화) = 메커니즘 자체는 정상 입증 (c) working-tree 변경 미탐지 확증.
- **A3 relocation**: path_missing + git rename 시나리오 feasibility (generated-tests = .aimd 추적 여부 의존).

## 성공 기준
각 loop 에 "작동 / 유용 / 갭(어디서 막히나)" 판정 + 실 물증(stdout) + finding 등재. **headline 가설**: Loop B 작동·유용 / Loop A 는 실 RealWorld 그래프에서 대체로 inert (commit_hash 미stamp + generated-test 앵커 + commit↔HEAD diff) → fix 후보 도출. 결론은 **adversarial workflow 로 반증 검증**(loop 가 어떤 config 에서 실제 작동하는지 skeptic 이 찾게).

## trust / §8.1
측정 = read-only. 단일 RealWorld 도메인 → **gate-class 결론 ❌** / finding·usability 판정만. fix(synthesizer commit_hash stamp / IMPL src 앵커 / working-tree diff)는 별 승인 + §8.1 검토.

## 4원칙
1원칙 깊은 숙지(본 plan + recon) → 2원칙 (lightweight / 측정 자체가 evidence — research 경량) → 3원칙 측정은 read-only 진행 / fix 는 승인 → 4원칙 갭=finding 자산화.

---

## ★ 실측 결과 (2026-06-01 / no-simulation / 실 RealWorld 그래프 + 실 git)

| loop | 판정 | 물증 |
|---|---|---|
| **Loop B navigate (소비)** | ✅ **작동 + 유용** | `navigate --stage spec` → 44 노드 rollup / 각 AC 의 honor(backward)=BHV·UC·analysis-business-rules 실제 표시 (AC-ARTICLE-001 → BHV-ARTICLE-001/UC-ARTICLE-001/analysis-business-rules). discovery 19 UC / by_grade MUST/SHOULD. "grep 없이 무엇을 honor 하나" 답함 = P0 "쓰게 하라" 충족. |
| **Loop A / A1 freshness (동기화)** | ✅ **작동 + 유의미** | `code-pointer-validator`(no --git) → `graph.stale` 발화: discovery-spec.json mtime 16:37 > synth 05:51 → 실 그래프 stale 정확 탐지. 동기화 루프 "상태 바뀌면 그래프도" 핵심 신호 작동. |
| **Loop A / A2 content-drift** | ⚠️ **메커니즘 정상 / 실 그래프 inert** | positive demo: temp graph(validator.js + commit_hash=decd28d) `--git` → `content_drift` MEDIUM 발화(§8.1 cap 준수 PASS exit 0). 실 RealWorld 그래프 `--git` → content_drift **0건** (25 pointer 전부 commit_hash 부재). |
| **Loop A / A3 relocation** | (미실측 / feasibility) | path_missing + git rename 시나리오 = .aimd 추적·rename 이력 의존 / 우선순위 낮음. |

### finding (refined / 적극 반증 후)
- **F-DF-A2-001**: RealWorld 그래프 25 code_pointers = pointer.commit_hash **0건** → A2 inert. **★ 반증 정정**: synthesizer 가 commit_hash 를 "절대 안 stamp" 는 **거짓** — `graph-synthesizer.js:214`(ptr.commit_hash ← impl.commit_hash) + `:562`(node-level ← commitHash 입력)이 존재. 정확한 갭 = **synthesizer 가 현 git HEAD 에서 pointer.commit_hash 를 auto-derive 하지 않음** → 상류 impl-spec 이 per-pointer commit_hash 를 안 실으면(RealWorld 의 covered=TC pointer 가 그 경우) A2 가 silently no-op. infra 는 존재(impl-spec.schema 가 source_files commit_hash required), 단 dogfood 파이프라인이 covered pointer 에 미채움.
- **F-DF-ANCHOR-002**: 25 covered pointers = 전부 `.aimd/output/generated-tests/...`(생성 테스트) → 실 `src/main/java/` production 코드 **무앵커** (이 pre-backstop 그래프엔 IMPL = missing / backstop 후엔 na). 실 코드 변경(5 uncommitted src)이 그래프에 invisible.
- **F-DF-A2-003**: A2 = `git diff <commit_hash> HEAD` = commit↔commit → **uncommitted working-tree 변경 미탐지**(현 5 파일이 그 상태). "편집 중" drift 못 봄.
- **F-DF-FRESH-004 (부수)**: 실 그래프가 stale + pre-backstop(coverage 21.7% / na=0 / missing=90) → A1 이 정확히 stale 플래그 → **올바른 응답 = 재synth**(staleness + na backstop coverage 동시 해소). = 동기화 루프 가치 실증.

### fix 후보 (별 승인 + §8.1 / 단일 도메인 → gate-class ❌)
1. ✅ **synthesizer commit_hash auto-stamp — 시행 완료** (사용자 선택 / 4원칙 research GO@0.85 + 공식docs 검증). 설계: D1 uniform synth-HEAD(SLSA 동형 / per-file last-touch 반증) / D2 builder cli.js 가 `git rev-parse HEAD` auto-derive(`--commit-hash` 미지정 시 / makeGitRunner 패턴 inline = cross-package import 회피) + synthesizer `:560` 블록이 strict_path pointer 스탬프 / D3 graceful(git 부재→미스탬프=기존 behavior) / D4 default-on additive / anti-regression: strict_path 만·`!ptr.commit_hash`(상류 :214 보존)·glob/ast_symbol/doc_link 제외. **검증(no-simulation)**: builder test 110→**114**(stamp/backward-compat/anchor-restriction/no-overwrite 4종) / **CLI 실 smoke**: `--graph`(--commit-hash 미지정) → auto-derive HEAD `776dc00…`(40char) → strict_path pointer.commit_hash 스탬프 확인 / A2 positive demo content_drift 발화. workspace 977→**981**. → **F-DF-A2-001 RESOLVED** (A2 out-of-box usable). ※ RealWorld 자체는 pointer 가 generated-tests(untracked) 라 A2 가 여전히 0 drift = F-DF-ANCHOR-002 별 후보(IMPL 실 src 앵커) 영역.
2. **IMPL 노드 실 src 앵커** — C-codepointer-analysis-aspect-enrich carry 와 연계 (analysis/impl → src/main 경로). 큰 작업.
3. **A2 working-tree 모드** — `git diff <commit_hash>`(HEAD 생략) opt-in 으로 uncommitted 변경도 탐지. 설계 결정.

### Lessons
- LL-dogfood-01: dogfood 가 P0("쓰게 하라") 직접 검증 — Loop B/A1 usable, A2 는 data gap(commit_hash 미stamp) 으로 inert. "built ≠ usable" 실증.
- LL-dogfood-02: "synthesizer 가 commit_hash 안 stamp" 초기 주장 = source grep 으로 **반증·정정** (조건부 stamp 존재). 측정 inference 는 적극 반증 의무(feedback_senior_fact_check_supplement 정합).
