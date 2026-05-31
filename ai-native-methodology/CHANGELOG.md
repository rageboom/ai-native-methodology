# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:
- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

## [11.22.0] — 2026-06-01 MINOR — analysis 노드 실 src/main 앵커 derive (F-DF-ANCHOR-002 해소 / RealWorld A2 가 실 production 코드 drift 탐지)

v11.21.0 carry F-DF-ANCHOR-002 해소. RealWorld(S2/주 타깃) 그래프가 실 `src/main/java` production 코드에 앵커 **0건** → Loop A/A2 content-drift 가 production 코드 변경을 못 봄(inert). 그러나 analysis 산출물(business-rules/domain/error-mapping)은 **이미 실 src/main 경로를 evidence 로 보유** — surface 안 됐을 뿐. 합성기가 이 evidence 를 node code_pointers 로 derive → A2 가 실 production drift 탐지. carry 제목 "IMPL 노드"는 조사 결과 S2 현실(IMPL 노드 부재)과 어긋남 → analysis 노드가 같은 목표를 정확히 달성(연계 carry C-codepointer-analysis-aspect-enrich 동시 해소). 접근 A 채택(4원칙 §2 3-agent research / Senior GO@0.80 / Sourcegraph SCIP auto-derive 선례).

### fix — graph-synthesizer analysis evidence → code_pointers derive (additive / schema·skill 무변경)
- **`graph-synthesizer.js`** — `ANALYSIS_TO_CODE_POINTERS` per-kind 명시 field allowlist (business-rules `business_rules[].source_evidence[].file` / domain `aggregates[].invariants[].evidence[].file`+`value_objects[].evidence[].file` / error-mapping `exception_handlers[].source_file`+`http_status_mapping[].evidence_file`) + `deriveAnalysisCodePointers()` 패스. `defaultNaForIntentNodes` **直前** 호출 (derive→backstop 순서 / hasPtr 면 backstop skip → covered / 추출0 → na).
- **fragility 완화 (Senior REVISE)**: ① 명시 allowlist (자동 `*.java` 재귀 ❌ = `persisted_to` 테이블명 오수집 회피) ② 확장자 화이트리스트 (dir/dotted-class/table-name false-anchor 차단) ③ **existence-gate** (`existsFn` / 미존재 경로 emit ❌ = 정직 불변식 / `mapper/` resource-prefix 류 false `path_missing` 회피) ④ dedup + cap(10).
- **결정성 보존**: `synthesizeGraph({repoRoot, existsFn})` 주입 — default = `existsSync(repoRoot 기준)` / test 는 mock predicate 주입 (execFileSync 미주입 = v11.21 purity 정합). **builder cli `--repo-root`** (default cwd) 추가.
- commit_hash 전파 = 하류 strict_path 스탬프 루프(v11.21.0)가 graph commitHash 부여 (A2 baseline / IMPL·TC 동형).

### 검증 (no-simulation / 실 CLI·실 git)
- traceability-matrix-builder 114→**126** test (+12: per-kind derive 3 + 확장자 negative + existence-gate + dedup + cap + commit_hash + backward-compat 무회귀 + no-op + hasCodeExtension + active-gate). workspace 981→**993** / 0 fail. release-readiness **26/26** (poc-05 graph 정적 read = 무영향 / #16 covered=4/na=10/missing=0 불변).
- **RealWorld dogfood** (`--repo-root <RW> --commit-hash ee17e31`): BEFORE src/main 앵커 0 → AFTER **13 distinct** (`UserService.java`/`User.java`/`UsersApi.java`/exception handlers 등) / coverage 21.7%→**100%**(covered=28/na=87/missing=0) / false `path_missing` on src/main **0**(existence-gate). `mapper/`(sql-inventory)·dir(architecture) = na fall-through(후속 slice).
- **A2 positive demo** (temp graph / `git fetch --unshallow` 로 실 history / baseline=root commit / working-tree 무변경): content_drift **14건** 실 production 파일 탐지 + `--apply-drift` → analysis 노드 3개(domain/business-rules/error-mapping) `state=drift` 기록. **Loop A 동기화 루프가 RealWorld production 코드 변경 실 탐지 end-to-end 실증.**

### §8.1 / carry
- derive 메커니즘 = read-class·additive·결정론 → **gate-class 아님**. A2 content_drift = medium/non-gating (v11.20.0 cap 유지). 단일 RealWorld 도메인 = usability threshold 격상 ❌ → carry. **carry**: ① C-codepointer-analysis-aspect-enrich 잔여 (sql-inventory mapper-prefix resolve / architecture dir glob / 후속 slice) ② ≥2 distinct 도메인 A2 usability corroboration ③ F-DF-A2-003 working-tree 모드 ④ A3 relocation dogfood.

DEC-2026-06-01-df-anchor-002. Extends DEC-2026-06-01-dep-graph-loop-dogfood-a2-stamp.

## [11.21.0] — 2026-06-01 MINOR — dep-graph Loop A/B RealWorld dogfood + A2 commit_hash auto-stamp (F-DF-A2-001 해소 / A2 out-of-box usable)

v11.20.0 가 ship 한 Loop A/B 를 실 RealWorld 그래프에서 no-simulation dogfood → P0("만들어도 못 쓰면 답 없다 → 쓰게 하라") 직접 검증. **Loop B navigate + Loop A/A1 freshness = 작동·유용 입증 / A2 content-drift = 메커니즘 정상이나 실 그래프 inert(commit_hash 부재)** 발견 → fix 1 시행.

### dogfood 실측 (실 RealWorld 그래프 + 실 git)
- **Loop B navigate** ✅ — `navigate --stage spec` → 44 노드 rollup, 각 AC 의 honor(backward)=BHV·UC·analysis-business-rules 표시 ("grep 없이 무엇 honor" 답함).
- **Loop A / A1 freshness** ✅ — `graph.stale` 발화 (discovery-spec mtime > synth 정확 탐지 = 동기화 루프 핵심 신호).
- **Loop A / A2 content-drift** ⚠️ — positive demo 로 메커니즘 정상 입증 / 실 그래프 0건 (25 pointer 전부 commit_hash 부재 = F-DF-A2-001).

### fix 1 — synthesizer commit_hash auto-stamp (read-class·결정론·additive / 경량 research GO@0.85 + 공식docs 검증)
- **graph-synthesizer.js `:560`** — strict_path code_pointer 에 `commit_hash` 스탬프 (uniform synth-time HEAD frame / SLSA provenance 동형). `!ptr.commit_hash`(상류 `:214` impl.commit_hash 보존) + strict_path 만 (glob/ast_symbol/doc_link 제외 = `git diff -- path` 무의미 → false-drift 회피).
- **builder cli.js** — `--commit-hash` 미지정 시 `git rev-parse HEAD` auto-derive (graceful undefined / makeGitRunner 패턴 inline = cross-package import 회피). execFileSync 를 순수 synthesizer 에 안 넣어 결정성 보존 (derive=cli / stamp=synthesizer 분리).
- 설계: D1 uniform HEAD(per-file last-touch 는 false-drift 위험으로 반증) / D2 derive-in-cli+stamp-in-synthesizer / D3 graceful / D4 default-on additive. `computeGateFail`(v11.20.0)이 content_drift 를 gate 제외하므로 stamp 가 release-readiness #16 fail 유발 불가.
- → **F-DF-A2-001 RESOLVED** (A2 out-of-box usable).

### 검증 (no-simulation / 실 CLI·실 git)
- traceability-matrix-builder 110→**114** test (stamp / backward-compat 미지정→미스탬프 / anchor-restriction strict_path만 / no-overwrite :214 보존) / workspace 977→**981** / 0 fail.
- **CLI 실 smoke**: `--graph`(--commit-hash 미지정 / cwd=git repo) → auto-derive HEAD `776dc00…`(40char) → strict_path pointer.commit_hash 스탬프 확인. A2 positive demo content_drift 발화(non-gating cap 준수).

### carry (별 cycle / §8.1)
- **F-DF-ANCHOR-002** — IMPL 노드 실 src/main 앵커 (RealWorld A2 가 실 코드 변경 보려면 / C-codepointer-analysis-aspect-enrich 연계). **F-DF-A2-003** — A2 working-tree 모드(uncommitted 탐지 / opt-in). A3 relocation dogfood 미실측.

DEC-2026-06-01-dep-graph-loop-dogfood-a2-stamp. Extends DEC-2026-06-01-living-dep-graph-loops.

## [11.20.0] — 2026-06-01 MINOR — Living dep-graph: 동기화 루프(Loop A) + 소비 루프(Loop B) v1 (P0 양방향 역동기화 배선 / 결정론·read-class)

dep-graph 가 "만들기"만 하고 비어 있던 **두 루프**(상태↔그래프 동기화 / 각 stage 의 그래프 소비)를 결정론·read-class 로 채움. P0(산출물 = LLM 운영 컨텍스트를 평생 양방향 역동기화하여 AX 운영)의 운영 배선. trust 선 §2 준수 — 결정론 git 신호만 권위적, 휴리스틱 active 자동쓰기 ❌. gate-class 후보(A4/A5/B5/contract/coverage)는 §8.1 ≥2 distinct 도메인 전 전부 DEFER.

### Loop A — 동기화 루프 (code-pointer-validator / 결정론 git 신호 / 전부 opt-in)
- **A1 freshness** — `checkGraphFreshness()`: graph.synthesized_at vs derived_from source mtime → `graph.stale` finding. git 무관·상시 계산·display-only (exit code 무영향).
- **A2 content-drift** — `detectContentDrift()`: 저장된 commit_hash 기준 git blob-diff(`git diff --name-only <hash> HEAD`) → `code_pointer.content_drift` finding (opt-in `--git`). `applyContentDrift()` 생산자 (active→drift / graph-synthesizer TRANSITIONS 와 isomorphic).
- **A2-wire** — `--apply-drift`: content-drift 노드를 state=drift 로 live artifact-graph.json 에 기록 (변경 시에만 write / 어떤 hook·gate·release-readiness 도 자동 호출 ❌ = 수동 opt-in).
- **A3 relocation** — `findRelocation()`: git `log -M --diff-filter=R` rename 이력 → `path_missing` finding 에 `suggested_path` 첨부 (제안만 / auto-commit ❌ / 이동처 실존 시에만 = 날조 ❌). dead schema 필드 활성화.
- 전부 opt-in (`--git`/`--apply-drift`) / git 부재·repo 아님 = graceful null (no-simulation). 기존 `validateCodePointers` 반환 shape + release-readiness #16(`--git` 미전달) 무영향.

### Loop B — 소비 루프 (chain-driver navigate F3/F4 + 5 stage agent consult / read-class)
- **consult** — discovery/spec/plan/test/implement agent body 에 "dep-graph 소비" 섹션: stage 진입 시 작업 노드를 `chain-driver navigate` 로 조회 (backward=honor / forward=영향 / code_pointers), AI 추론 0% verbatim. PLAN 의 의존성 AI-재유추 → 그래프 조회 전환 명시. frontmatter skills[] 무변경 (Bash+CLI / skills≡phase-flow invariant 보존).
- **F3** — `navigate --stage <s>` / `--scope <id>`: 단일노드→단계 일괄 의존성 rollup (STAGE_SUBKINDS / scope_id·state filter / analyzeImpact·centrality 재사용).
- **F4** — stage 방향 프리셋 (discovery/spec/implement=backward / plan/test=forward) + `--direction` override. presentation-only (analyzeImpact 무변경).

### ★ A2 §8.1 hardening (release 검증 sub-agent finding 흡수)
- content_drift 가 `--strict` 에서 high→exit1 로 격상되던 **latent 단일 도메인 hard-gate 제거**: severity **medium 고정**(--strict 와 무관) + 신규 `computeGateFail()` 가 content_drift 를 gate(fail) 계산에서 **제외** (medium 보고만 / 가시성 유지). ≥2 distinct 도메인 corroboration 전까지 non-gating (trust 선 §2 / §8.1 정합). CLI usage·exit-code 문구 정합. ※ A1 freshness 는 애초에 result.findings 외부 → 자동 non-gating.

### 검증
- code-pointer-validator 35→**39** test (content_drift medium-under-strict + computeGateFail decouple anti-regression anchor 3종) / chain-driver navigate 20/20 / workspace 973→**977** / drift-validator chain-layout 0 orphan·0 missing / skill-citation 0 stale / release-readiness 26/26 + version 3-way 11.20.0.
- 실 CLI 실측 (no-simulation): poc-05 `--git --strict` → 5 MEDIUM content_drift / **PASS exit 0** (decouple 입증).

DEC-2026-06-01-living-dep-graph-loops.

## [11.19.0] — 2026-06-01 MINOR — 배포 6단계 점검 carry-queue 6종 종결 + 결정론 gate 1종 신설 (check26)

v11.18.0(배포 6단계 점검)이 deferred 한 `decisions/INSPECTION-LEDGER.md §3` carry-queue 6종을 전부 종결 (additive / breaking 0 / release-readiness 25→26). 점검이 스스로 찾아 "별도 묶음"으로 미뤄둔 자기 finding — 실제 correctness/결정론 구멍(cosmetic doc drift 아님).

### ★ 신규 결정론 gate (req8 "누가 돌려도 같은 품질")
- `check26` gate-validator-list-consistency (F-S07) — gate validator 목록의 cross-source 정합을 결정론으로 검사. 데코레이션(`(...)`/`--flag`) 정규화 후: gate-eval `REQUIRED_VALIDATORS_PER_STAGE`(blocking) ⊆ `sdlc-4stage-flow.json` gates[].validators(매트릭스) + sdlc gate ≡ `<stage>.phase-flow.json` cross_cutting.validators (`conditional_validators` allowlist 차이 허용). drift-validator 가 gate/validator 목록을 미비교하던 구조적 사각(SEED-3/S10류) 차단. 정정: sdlc gate#1 +br-cross+formal-spec-link / gate#2 conditional spectral / discovery·plan cross_cutting.

### carry 6종 종결
- **F-T05** (evidence 필드명 SSOT / high) — Option α canonical 확정 (per-TC `test_run_evidence` / impl root `test_pass_evidence` = schema 정식 / top-level `test_invocation_evidence` = schema 금지 = runner standalone 산출물명). validator 가 schema-금지 필드를 read 하던 모순 해소 (check-links per-TC+impl read = non-breaking + sentinel skip + base-tolerant `.aimd` resolve / legacy 병존 + lint-no-simulation grep 3-shape alternation) + skill/flow/agent/template prose α 전환. examples PoC 0 신규 finding 실측.
- **F-I05** (S2 gate 배선 / med) — `s2-outcome-check.js` producer 를 test-impl-pass-validator cli 에 배선 (`--scenario S2 --test-spec` → reconcile → `outcome_mismatches` → findings-aggregator → gate-eval `per_tc_outcome`) + adapter per-test `tests[{name,status}]`. ★ findings-aggregator `transformTestImplPass` latent 버그 동반 수정 (cli.js `pass_count` shape 에서 `tests_total` 무음 0 → I9 GREEN fail-closed guard 정합).
- **F-T06** (runner hardening / med) — T9 FRAMEWORK_HINTS contract/visual bypass + T14 report_format enum 정규화(`report-format.js` / `stdout_regex` enum additive) + T16 inference 정직(mocha·go → `framework:'other'` + stdout_parser scaffold / `count_mode:'occurrences'` 신설) + T11 test-spec.template S2 characterization+augmentation 쌍.
- **F-X01** (med) — `code-graph.schema.json` `$schema` draft-07→2020-12 (Ajv2020 메타스키마 로드실패 경고 해소).
- **F-X02** (low) — skill-citation-validator HISTORY_FILE += `decisions/INSPECTION-` (점검 리포트 finding-quote stale 경로 false-positive 차단).

### 검증 / carry
release-readiness **26/26** · workspace test **950/950 pass / 0 fail** · drift 0 · 0 stale citation · version 3-way. 신규/확장 test ~31건(report-format/load-test-cmd/adapter/aggregator/spec-test-link/link/lint-chain/cli/citation/release-readiness). 점검 ledger = `decisions/INSPECTION-LEDGER.md`(§3 carry 6종 resolved / §5 로그). carry: 없음 (전부 종결).

## [11.18.0] — 2026-05-31 MINOR — 배포 6단계 chain harness 전수 점검 + 결정론 gate 2종 신설 (check24/check25)

`배포 플러그인이 프레임워크처럼 동작(LLM=언어 / 플러그인=Spring)` 목표로 analysis→discovery→spec→plan→test→implement 6단계 자산 + 10 패러다임 전수 점검 (Workflow 6회 / ~155 자산 / adversarial 검증 confirmed 99 / CUT 0). 비파괴 / gate 강화 (release-readiness 23→25 / npm test all-pass / drift 0 / 0 stale citation / build 4686).

### ★ 신규 결정론 gate 2종 (req8 "누가 돌려도 같은 품질")
- `check24` agent-skills-phaseflow-sync (C12) — agent frontmatter `skills:[]` ⊇ 해당 stage phase-flow 등록 skill. dispatch preload ↔ orchestration SSOT silent drift 차단 (analysis-agent code-graph/greenfield + implement-agent test-run-test-evidence 누락 노출·정정).
- `check25` template-schema-valid (capstone) — 6 chain stage 템플릿(discovery-spec/behavior-spec/acceptance-criteria/task-plan/test-spec/impl-spec)이 대응 schema 에 valid. ★ #1 systemic(meta.confidence object≠number 가 5/5 템플릿)을 어떤 gate 도 못 잡던 사각 영구 lock — _base-apply-template 가 invalid shape 를 LLM 에 학습시키는 것 차단.
- gate-eval `I9` — implement GREEN gate 가 test 증거(tests_total) 없이 통과하던 fail-OPEN → evidence_missing fail-closed 보강.

### 단계별 정정 (confirmed 99)
- **analysis**: aspect 파일명 canonical `-spec`/`-spectrum` 전수 / dist-dangling case-by-case 정책 / planning-agent→discovery-agent.
- **discovery**: discovery-spec.schema 확장(nfr/io_contracts/intent_summary/decisions/pending_decisions) + discovery-extraction-validator D4 거버넌스 3 check 구현 + UC over/under-decomposition lane + summary medium/low.
- **spec**: handoff plan-agent 교정(plan stage 건너뜀 차단) + integrate over-claim 정직-격하 + SEED-3 scenario_expected 문서화 + check-links BE-mode 연산자 버그 교정.
- **plan**: SP 4분류 wiring(plan-risk-and-nfr + plan-agent db-assets-validator) + work-unit-manifest stage enum System Y additive 확장.
- **test**: RED scenario-conditioned(S2 per_tc_outcome / S3 snapshot_green) + coverage_summary→coverage + validator README System Y.
- **implement**: System Y 번호 prose 정정 + static-runner inflated tool-count 정직화.
- 5 chain stage 템플릿 schema-valid 화(systemic meta.confidence object≠number) + System Y 번호 prose 정정.

### honesty-tier 테마
skill prose 가 validator 미구현 강제를 과대 주장하던 패턴(spec integrate / discovery decisions / implement static-count)을 *구현* 또는 *정직-격하* 로 정정 (self-recorded-fact-validation paradigm 정확 적용).

### 검증 / carry
release-readiness **25/25** · workspace test all-pass · 0 stale · drift 0 · build 4686 · version 3-way. 점검 리포트 7종 + 진행 ledger = `decisions/INSPECTION-2026-05-31-*.md` (워크스페이스 전용 / dist 미포함). ★ test 점검 중 audit agent 무단 write 발견 → implement 점검에 read-only 가드 명시(재발 0). carry(별도 묶음): evidence 필드명 SSOT reconcile(test_run/test_invocation/test_pass) · gate-consistency check · test-runner framework/enum hardening · code-graph.schema draft-07 · skill-citation scope.

## [11.17.0] — 2026-05-31 MINOR — agents·skills 정책 SSOT dedup + chain/gate 번호 정합(System Y) + F-MB-010 종결

`프로젝트 자산(agents/skills/hooks) 리팩토링` 요청 → 3 묶음 (중복 제거 → 정합성 → 잔여 cascade) 순차 시행. 모두 비파괴 / gate-neutral (release-readiness pass-count 비감소 / npm test 24 ws fail-0 / citation 0 / drift 0 breaking).

### 정책 SSOT dedup (methodology-spec/policies/ 신설)
- 공통 정책 boilerplate(no-simulation / 70~80% / Tier 3.1·3.2 / Absolute priorities)가 agents 4곳·skills 33곳에 복붙된 것을 단일 SSOT로 추출. canonical 3종 신설(`no-simulation.md` / `automation-boundary.md` / `honesty-tiers.md`) + `plugin-charter.md` §7(agent 공통 우선순위 / 새 R 아님).
- "스텁+포인터" granularity: skill 고유 delta(도구 Tier 매핑 / modality별 자동화 %)는 inline 유지 + 1줄 포인터. baseline+delta 모델. spec/test/implement agent "호출 절차"의 Tier merge-bug(중복 step 번호) 동반 정리.
- gate-safe 근거: validator는 prose 문자열 아닌 field 값·파일 존재·digest 검사 / skill-citation-validator는 인용 경로 존재만 확인(포인터 추가 = 통과·강화).

### chain/gate 번호 schism 정합 (System X→Y)
- v10.0.0 plan-gate(#3) 삽입 후 test/implement prose가 한 칸 stale("System X": test=3/#3, implement=4/#4)였던 것을 machine SSOT(state.schema + sdlc-flow + "chain N = gate #N" 규약)에 맞춰 정정: **test=chain 4/gate #4, implement=chain 5/gate #5**.
- 범위: agents(test/implement/spec forward-ref/analysis/README) + test·implement 스킬 8개 + CLAUDE.md 다이어그램(plan gate #3 명시 / test #4 / implement #5 / gate #1~#5 / chain 1~5). plan/spec/discovery 불변 / ADR 파일명 불변.
- spec-agent 입력 계약 정정: `planning-spec.json` → `discovery-spec.json` (discovery 가 산출하지 않던 파일 참조 = 기능 결함 해소).

### F-MB-010 잔여 cascade 종결 (planning-spec→discovery-spec rename)
- hard replace: deliverables/ticket-policy/id-conventions/skills-axis/workflow docs + schemas(description) + analysis skills (이력 주석·frozen PoC evidence·finding-system 보존).
- flows: `plan-spec-compose` phase id → `task-plan-compose` (json+mermaid 동시 / drift 0 breaking) + implement.phase-flow inputs `planning`→`discovery`.
- runtime(chain-driver keying)는 v11.1.0 에서 이미 resolved 확인 (npm test 24 ws 통과 입증).

## [11.16.0] — 2026-05-31 MINOR — 잔여 actionable carry sweep 3종 (DB always-on validator 신설 + domain schema stakeholders + chain-coverage strict default)

`잔여 작업 남은거 있나?` 질문 → **91-item carry audit (workflow / 5 소스 fan-out → 검증 → 분류)** → 즉시 착수 가능 actionable 4종 도출. 그 중 **P2(analysis/aspect code_pointers enrich) 보류** (§8.1 — real code_pointers semantics 가 live PoC 없이 모호 = HIGH 과적합 위험 / 현 na=true backstop 이 이미 coverage 100% 라 infra-only 는 소비자 부재). **P1·P3·P4 시행** (각 추천안 / 사용자 batch 승인).

### P1 — `tools/db-assets-validator` 신설 (25번째 validator / F-DB-AUTOVAL-001 ✅ 해소 / db-assets-always-on §8.4)

DB 자산 always-on 정책이 매뉴얼 체크리스트뿐이던 공백을 자동 게이트로 해소. `work-unit-manifest.json` 의 `analysis_refs` 안 `db_tables`/`db_procedures`/`db_functions`/`db_views` 4 필드 검사:
- **finding 6종**: `sp_missing_id`(critical) / `sp_invalid_class`(critical) / `sp_unclassified_at_plan`(critical — plan stage 이후 hard-gate / discovery 까지 nullable) / `external_class_mismatch`(high — external=true ↔ γ 일관성) / `gamma_external_unset`(medium) / `db_assets_absent`(medium — 비-DB 자산만 있고 DB 0 / **greenfield 면제** paradigm-aware).
- **결정론 axis** (feedback_chain_driver_deterministic_axis 정합): manifest **완성도** 검사 only / canonical global cross-resolution 은 `drift-validator` 영역.
- exit 0(pass) / 1(critical·high / --strict 시 finding≥1) / 2(usage). `--warn`... 아니라 `--strict` flag (CI/pre-chain audit).
- **release-readiness #23** = golden fixture 판별 (compliant→PASS(critical/high 0) / violations→FAIL(`sp_unclassified_at_plan`+`external_class_mismatch`) / content-aware — file presence ❌). 커밋된 PoC 에 `analysis_refs.db_*` manifest 부재(poc-17 외부 격리) → 실 corpus 대신 validator discrimination 입증 / db-asset manifest 커밋 시 corpus scan 확장(`C-db-autoval-corpus-extension`).
- **17 test** (unit + CLI exit code spawn).

### P3 — domain.schema `stakeholders` + `business_intent_summary` (C-domain-schema-stakeholders / optional·additive)

carry 명칭은 'mandatory' 이나 `domain.schema.json` = strict(additionalProperties:false) — required 로 넣으면 기존 PoC domain.json 11종 깨짐 → **schema optional + skill 본문 강제** 결단(breaking 회피 / v11.6.0 intent_certainty 선례 동형):
- `schemas/domain.schema.json` 에 `stakeholders`(string array / discovery-spec business_intent.stakeholders 동형) + `business_intent_summary`(string) optional 추가 (required 미추가 / additive).
- `skills/analysis-domain-model/SKILL.md` 절차에 비즈니스 컨텍스트 추출 **의무 step** + 예시 JSON 반영.
- `templates/analysis/domain.template.md` 비즈니스 컨텍스트 절 신설.
- `discovery-extraction-validator` 부재 WARN(`discovery.domain.missing_business_context` / low / non-blocking / +4 test).
- SSOT 경계: 전체 비즈니스 이해관계자·성공 기준 = discovery-spec business_intent / domain = 도메인 actor 초점.
- **backward-compat 실측**: 기존 domain.json(이미 pre-existing 사유로 prelim) 에 2 필드 추가 전후 schema-validator 에러 집합 **동일**(새 에러 미추가) 입증.

### P4 — F-SIM-003 chain-coverage-validator strict default flip + `--warn-paths` escape hatch

cross-ref broken-path 검사를 **strict(high/blocking) 기본**으로 전환. cooling-off paradigm 영구 폐기(v10.0.0) + autoDetectProjectRoot fix(v9.0.4) + 5 PoC 0 broken sweep(v9.0.5)로 false-positive 해소 → §8.1 ≥2 corroboration 충족:
- `tools/chain-coverage-validator/src/cli.js` `strictPaths` 기본 `false`→`true`. `--warn-paths`(옛 warn-mode / 비상 escape hatch / release 시 ❌) 신설. `--strict-paths` = 이제 default no-op(backward-compat 보존).
- **poc-05 strict default 무회귀 실측**: release-readiness check3 호출(--strict-paths 없음) = strict_mode true / broken_path_count 0 / exit 0.
- +3 CLI spawn test (default→exit 1 / --warn-paths→exit 0 / --strict-paths→no-op).

**STOP-3 (전 구간 no-simulation 실측)**: workspace 879→**903 (+24)** / release-readiness 22→**23/23** (target v11.16.0 / check23 신설) / test:release **14/14** (self-test criteria_total 22→23 정합) / skill-citation 0 stale / version 3-way 11.16.0.

**breaking 0**: P1 신규 standalone tool / P3 optional additive / P4 `--warn-paths` escape hatch + poc-05 무회귀 → MINOR.

**carry**: P2 `C-codepointer-analysis-aspect-enrich`(보류 / live PoC 시점 — semantics 결정) + `C-db-autoval-corpus-extension`(db-asset manifest 커밋 시 corpus scan) + README v11.1.0 stale(레포 기존 per-release 미갱신 cadence / 별도).

DEC-2026-05-31-db-assets-validator + DEC-2026-05-31-domain-stakeholders + DEC-2026-05-31-fsim003-strict-default.

---

## [11.15.0] — 2026-05-31 MINOR — tooling-audit cleanup + 2 gate 강화 (planning→discovery 잔재 / dead-gate 복구 / soft-gate fail-closed / git pre-push gate)

multi-agent tooling audit (195 asset / 42 verified finding / 기록 SSOT `.claude/plans/plan-tooling-refactor-audit.md`) 후속 정리 5 commit. **정직 표기**: 대부분 audit self-referential cleanup + soft-gate·pre-push 2 enforcement teeth — 본격 신규 prod feature 아님.

1. **rename 잔재 정리** (refactor) — `planning`→`discovery` rename(v11.0.0)의 미완 cascade: discovery-extraction-validator `--planning` alias + `validatePlanningExtraction` export 제거(canonical 교체) / findings-aggregator `planning-extraction-validator` dispatch case 2벌 + backward-compat test 제거 / chain-coverage·formal-spec-link `--planning`·`planning-spec.json` → `--discovery`·`discovery-spec.json` 정규화 / release-readiness `planning-spec.json` fallback 제거 / 라이브 4 skill 호출 정규화 / charter §4.1 Stop-hook ITSM + §4.6(R16/R17 vestigial) → R20 ticket-sync retarget.
2. **release gate 진실성** (fix) — `check21`(template-count-drift) dead regex 복구(machine marker `check21 SSOT: total N templates` + `.template.*` 전수 + fail-closed) / `check22` baseline broken-ref 해소(`scripts/baseline-data/`) / release-readiness self-test 17→22 stale 정합(5 fail → **14/14**) / charter 요구사항 카운트 자기모순(20/17/18/16) → 21항목·활성 19 단일화.
3. **findings-aggregator 선언 정정** (docs) — "mandatory 양심-차단 auto-feeder"(자동 호출 0 + `next` 필수 아님 + 11 PoC 중 1 사용 = 이중 거짓) → "선택적 operator 보조". 도구·로직 무변경.
4. **F-AUDIT-SOFTGATE-001(=C-13) fail-closed** (feat) — `chain-driver next` 가 `--findings` 미제출 시 0 findings 로 silent 통과하던 soft-gate를 block(`findings_unverified` / rank 2)으로. 통과 = 진짜 `--findings` 공급 OR `--user-decision go` 명시 ack(intervention-log actor:user). gate-eval 순수성 보존(sentinel in, reason out). 4원칙 3-agent research(공식문서 fail-safe defaults·OPA·GitHub required-check·Sigstore·DO-178C 전부 fail-closed) → 사용자 Option C 결단. C-13(2026-05-07 PoC-06 carry) 동시 해소.
5. **git pre-push release gate** (feat) — 사내 GitHub Actions 부재 대응. `scripts/githooks/pre-push`(push 시 `npm run test:release` 강제) + `scripts/setup-git-hooks.js`(core.hooksPath / 클론마다 1회). Claude Code PreToolUse hook 아님(§4.1 "빠를 것" 무관) — 터미널 push 까지 커버. 사용자 Option G 결단. 한계(정직): 클라이언트 hook / `--no-verify` 우회.

**검증 (전 구간 no-simulation 실측)**: chain-driver 255/255 / workspace 875→**879** / release-readiness **22/22** (target v11.15.0) / test:release **14/14** / skill-citation 0 stale / version 3-way 11.15.0. **pre-push gate 도그푸딩** — 본 release push 가 실제 게이트(test:release 14/14)를 통과해 진행.

**breaking 0**: soft-gate fail-closed = `--user-decision go` escape hatch + 기존 테스트 0 깨짐(bare `next` 의존 테스트/스크립트/PoC 부재 확인) → MINOR. (default 동작 변경이나 실 영향 ≈ 0.)

**잔여 (deferred / audit 부록)**: CHANGELOG phantom-alias 문구("transformPlanningExtraction 보존" — 역사 기록) / `tools/README.md` gate 번호 표기 staleness / 라인엔딩(CRLF/LF) 정규화.

---

## [11.14.0] — 2026-05-30 MINOR — S2(AX전환) gate augmentation arm RED→GREEN round-trip: P4 양방향 역동기화 end-to-end 실측 (carry ② RESOLVED / DEC-2026-05-30-s2-augmentation-green-roundtrip)

`/clear` 후 사용자 "다음 작업 시작해줘" → audit 리포트 후속 vs prod 가치 carry AskUserQuestion → **"리팩토링 보류 — prod 가치 carry"** 선택 → feasibility triage → carry ②(augmentation impl 후 GREEN 격상) 추천 + plan 제시 → "진행".

**배경 (carry ② / v11.13.0 잔여)**: DEC-2026-05-30-s2-exec-corroboration(2차)은 augmentation arm `AccountDeletionAugTest`(TC-USER-007 / `DELETE /user`)을 **impl 부재 RED 1건**으로 실측했다. carry ② = 이 augmentation 을 실제 구현해 **RED→GREEN 격상** + 방법론 가치 **P4(양방향 역동기화)** end-to-end 실측.

**feasibility triage (정직)**: carry ①(WARN→block 격상 / 2nd distinct domain) = poc-16 efiweb-car **.java source 부재**(사내 미커밋) + RealWorld 동일 blog 도메인 → **환경 차단 carry 유지**. carry ② = RealWorld repo + augmentation test + UsersApi + JDK 11(`~/jdk11-temurin` 재사용) 모두 present → **완전 실행 가능** = 본 release.

**impl (RealWorld 5-file 수직 슬라이스 / 기존 hexagonal 패턴 그대로 / 외부 dogfood repo)**:
1. `core/user/UserRepository.java` — `void remove(User)` (도메인 인터페이스)
2. `infrastructure/repository/MyBatisUserRepository.java` — `@Override remove → userMapper.delete(id)`
3. `infrastructure/mybatis/mapper/UserMapper.java` — `void delete(@Param("id") String)`
4. `resources/mapper/UserMapper.xml` — `<delete id="delete">delete from users where id = #{id}</delete>`
5. `api/CurrentUserApi.java` — `UserRepository` 주입 + `@DeleteMapping` → `@AuthenticationPrincipal` → `userRepository.remove(currentUser)` → 204

리스크 사전 해소: Security `anyRequest().authenticated()` + 유효 token → 인증 통과 / FK = 신규 user 관계 0 + sqlite test profile FK 비강제 → 안전 (production cascade = scope-out / known-limitation).

**실측 (`gradlew test --tests io.spring.api_gen.*` / JDK 11 + Gradle 7.4 / no-simulation)**: **26 testcases = 26 PASS / 0 FAIL** (직전 25 PASS + 1 FAIL). `AccountDeletionAugTest :: TC-USER-007` = **PASS**(204). JUnit XML 물증.

**★ round-trip 3 상태 실측** (`.aimd/s2-roundtrip-probe.mjs` / 동일 실 XML 에 spec expected_outcome 만 대조 / 실 methodology 모듈 import):

| 상태 | augmentation expected | actual | outcome_mismatches | GATE(S2) |
|---|---|---|---|---|
| 1. impl 부재 (v11.13.0 2차) | fail | fail | 0 | go-eligible |
| 2. impl 후 / **재동기화 전** (BEFORE) | fail (stale) | **pass** | **1** | **`s2_outcome_mismatch` WARN** ← drift 감지 (impl 이 spec 보다 앞섬) |
| 3. **재동기화 후** (AFTER / expected fail→pass) | pass | pass | 0 | go-eligible ← drift 해소 / augmentation 영구 characterization-grade 승격 |

→ gate 가 "impl 이 spec 을 앞지름(drift)"을 `s2_outcome_mismatch` 로 정확히 감지(상태 2) → 운영자가 spec 의 expected_outcome 을 fail→pass 로 역동기화(상태 3) → 해소. **AX 운영 round-trip(생성 RED → impl → 역동기화)이 실 OSS repo 에서 end-to-end 실측.** probe + 재동기화된 harness 모두 exit 0.

**methodology 보강 (additive / breaking 0)**:
- `skills/test-generate-test-spec/SKILL.md` step 3 — "S2 augmentation 재동기화" 1 unit 추가: augmentation TC 는 `expected_outcome="fail"` 생성 → impl 후 **fail→pass 재동기화** 의무 + 재동기화 누락 시 gate 가 `s2_outcome_mismatch` WARN 으로 drift 신호 (gate-eval.js / s2-outcome-check.js 코드 = 이미 올바로 작동 / **변경 ❌**).
- `methodology-spec/use-scenario-taxonomy.md` §5 — `C-use-scenario-s2-gate` carry 행에 augmentation GREEN round-trip(**carry ② RESOLVED**) 추가.
- 외부 evidence: `s2-gate-probe.md §7` + `s2-roundtrip-probe.mjs`(신규) + `s2-exec-harness.mjs` 재동기화(expected→pass).

**§8.1 (정직)**: augmentation **mechanism**(RED→GREEN + 역동기화 round-trip) 실증 = 단일 blog 도메인. WARN→**block** 격상(carry ①)은 여전히 ≥2 **distinct domain** 필요 → 별 carry 유지 (speculative hardening 회피 / cooling-off 폐기 + §8.1 strict + self-referential drift 회피 paradigm 정합). round-trip 문서화는 `reconcileOutcomes` 의 기계적 귀결(expected vs actual)을 실측 입증 = ceiling 주장 아님 → 1 execution 으로 workflow 문서화 충분.

**STOP-3**: workspace 875/875 (methodology 코드 무변경 / doc·skill·taxonomy only → 영향 0) ✅ + release-readiness 22/22 ✅ + skill-citation 0 stale + version 3-way 11.14.0 + breaking 0 = **MINOR**.

**carry**: ① C-use-scenario-s2-gate WARN→block 격상 (2nd distinct domain S2 execution / poc-16 사내 source 부재 → 타 distinct OSS Spring 또는 source 확보 의존) ② (선택) TC-USER-007 canonical test-spec(s2-reframe.json) 정식 등재 + AC/BHV traceability (현 harness/probe embed 로 충분).

## [11.13.1] — 2026-05-30 PATCH — no-simulation 절 정직성 cleanup: CLAUDE.md R19 Tier 정합 (C-honesty-tool-cleanup 종결 / DEC-2026-05-30-honesty-tool-cleanup)

CLAUDE.md "Static Tool 시뮬레이션 절대 금지" 절이 R19(DEC-2026-05-18-runtime-tool-exclusion) 이전의 **flat 표현**으로 남아 6개 도구(Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube)를 모두 "**진짜 외부 도구 실제 실행 의무**"로 나열 — 그러나 SpotBugs·Daikon·CodeQL·SonarQube 는 본 방법론 환경에서 **실 실행 이력 없음**(매 PoC "미실행"/"부재" 표기). 실행 못 하는 도구를 "실행 의무"로 적는 것은 no-simulation 정책 자체의 형해화 (사용자 지적 "쓰지도 못하는데 왜 자꾸 써있냐"). 본 PATCH = 해당 절을 **R19 Tier 정합**으로 reframe (정직 표기).

**시행 (CLAUDE.md only / breaking 0)**:
- ❌ **Tier 3 (simulated)** — AI persona 시뮬레이션 = 영구 reject + -5%p.
- ✅ **Tier 1 (in-plugin 실제 실행)** — Semgrep / ESLint / Spectral / axe-core·Playwright / 테스트 stack runner(Gradle·JUnit·vitest). 실 실행 입증 채널.
- ✅ **Tier 2 (사용자 환경 SARIF import / plugin 자동 실행 ❌)** — PMD / SpotBugs / CodeQL / Daikon / SonarQube. 사용자가 자기 환경서 실행·import 시만 `evidence_trust=imported_sarif`(`tool_stdout_path=null`). 부재=carry(날조 ❌). ★ PMD 는 poc-17 사용자 환경 실 실행 / SpotBugs·Daikon·CodeQL·SonarQube 는 본 환경 실 실행 이력 없음 = 정직 인지.

**scope 정직**: 활성 doc 중 flat-framing 은 CLAUDE.md 가 유일 (agents/methodology-spec/ADR/charter/static-runner 는 이미 R19 Tier framing = 정직). R19 Tier 2 분류·`IMPORTED_DRIVER_ALLOWLIST=[pmd,spotbugs,codeql,daikon]` 는 schema-enforced 정식 기능이라 **이름 삭제 ❌**(reframe = "plugin 미실행/import-only" 명시로 정직 해소 / R19 보존). archive/dist-history·decisions·HISTORY 는 동결 이력 무변경.

**STOP-3**: workspace 875/875 (영향 0) + release-readiness 22/22 + skill-citation 0 stale + version 3-way 11.13.1 + breaking 0 = PATCH. carry `C-honesty-tool-cleanup` ✅ 종결.

## [11.13.0] — 2026-05-30 MINOR — S2(AX전환) gate 2차 execution corroboration: RealWorld 실 구동 + 상관 규약 보강 (DEC-2026-05-30-s2-exec-corroboration)

`C-use-scenario-s2-gate` Track α(v11.11.0)의 1차 corroboration 은 characterization GREEN 을 **"impl 존재의 구조적 귀결"로 추론**했을 뿐 실측이 아니었다(Java/Gradle 부재 = RISK-ENV-001). 본 release = **RealWorld 를 실제로 구동해 execution-grade corroboration** 확보 (no-simulation).

**환경 확보 (admin-free)**: Temurin JDK 11.0.31 zip + Gradle 7.4 + Spring Boot 2.6.3 + sqlite::memory:(test profile). `gradlew compileTestJava` BUILD SUCCESSFUL → **RISK-ENV-001(RealWorld arm) 해소**.

**생성 test 통합 (결정적 변환 / `.aimd/transform-gen-tests.mjs`)**: 생성 characterization test 6파일을 RealWorld test sourceSet 으로 — package `io.spring.api_gen`(충돌 회피) + `@ActiveProfiles("test")`(DB 격리) + @DisplayName TC-id prefix(상관). + augmentation `AccountDeletionAugTest`(TC-USER-007 / `DELETE /user` 미구현 / expected_outcome=fail).

**실측 (`gradlew test --tests io.spring.api_gen.*`)**: **26 testcases = 25 PASS(characterization) + 1 FAIL(augmentation)** (JUnit XML 물증). gate 파이프라인(`.aimd/s2-exec-harness.mjs` / 실 methodology 모듈): correlateByTcId(26/26 / missing_actual=0) → reconcileOutcomes(**outcome_mismatches=0**) → evaluateGate('test',·,'S2') = **blocked=false / go-eligible**. augmentation TC-USER-007: expected=fail ↔ actual=fail match. **음성 대조**(characterization 회귀 가정→fail): outcome_mismatches=1 → `s2_outcome_mismatch` → user 'go' → go-with-warnings(rank 2 WARN) = 회귀 탐지 입증.

**methodology 변경 (상관 규약 보강 / additive / breaking 0)**: dogfood 발견 — JUnit5+Gradle XML `name`=@DisplayName(메서드명 아님) + Java 메서드명 하이픈 불가 → TC-id 상관 규약 보강:
- `tools/test-impl-pass-validator/src/s2-outcome-check.js` — `correlateByTcId` 정규화(`normalizeForMatch`=대문자화+비영숫자 제거) 후 substring → 하이픈 displayName ↔ 언더스코어 메서드명 양쪽 상관 (+2 test / 40→42 / backward-compat).
- `skills/test-generate-test-spec/SKILL.md` — step 4 "TC-id-in-name 규약"(display name/메서드명에 TC-id / JUnit5+Gradle 은 @DisplayName 권장 / 풀-컨텍스트 통합 test 는 @ActiveProfiles).

**§8.1 평가 (정직)**: RealWorld arm = execution-grade 도달이나 §8.1 ≥2 **distinct domain** 미충족(RealWorld 단일 도메인 / structural+execution 양 grade) → gate enforcement = **WARN 유지**(`s2_outcome_mismatch` rank 2 / hard-block ❌). **WARN→block 격상 = 2nd distinct domain(poc-17 사내 Java / 타 OSS Spring) 후 별 release** — speculative hardening 회피(cooling-off 폐기 + §8.1 strict paradigm 정합).

**STOP-3**: workspace 873→**875(+2)** ✅ + release-readiness 22/22 ✅ + skill-citation 0 stale + version 3-way 11.13.0 + breaking 0 = MINOR. carry: ① C-use-scenario-s2-gate 격상(2nd distinct domain) ② augmentation impl 후 GREEN 격상.

## [11.12.0] — 2026-05-30 MINOR — dep-graph 의도 노드 code_pointers_na 기본 backstop (F-DOGFOOD-009 / DEC-2026-05-30-code-pointers-intent-na-backstop)

dep-graph `code-pointer-validator`(release-readiness #16)는 모든 Tier-1 노드(artifact_kind ∈ {chain,analysis,aspect}, state ∈ {active,drift})가 `code_pointers`(≥1) 또는 `code_pointers_na=true` 를 갖길 요구한다. 그러나 UC/BHV/AC/TASK + analysis/aspect 는 본질이 **의도/집계 노드**(코드 anchor 는 하위 IMPL/TC 가 보유)이고, 어떤 템플릿/skill 도 na 를 안 박아 RealWorld dogfood 실측에서 **coverage 21.7%**(covered=25 TC / na=0 / **missing=90** = UC19+BHV19+AC25+TASK19+analysis8)로 나타났다. 본 release = synthesizer 가 의도 노드 na 를 자동 기본하는 **3-layer backstop**.

**시행 (additive / breaking 0)**:
- **Layer 1 (load-bearing)** `tools/traceability-matrix-builder/src/graph-synthesizer.js` — `defaultNaForIntentNodes(nodes)` 정규화 패스 신설 + 호출 1회. `state==='active'` + kind∈{chain,analysis,aspect} + subkind∉{IMPL,TC} + `code_pointers` 없음 → `code_pointers_na=true`. ★ Senior REVISE 반영 — `state==='active'` 게이트로 carry-over deprecated/propose 노드 payload 무변조 (재합성 시 silent content drift 회피). IMPL/TC 제외 = source fallback 으로 채우거나, 무source 시 `missing` 으로 노출 유지(code-bearing 결함 surfacing 보존).
- **Layer 2** template 4종 — `behavior-spec.template.json`(`na:false→true`) + `discovery-spec`(use_cases) / `acceptance-criteria`(criteria 3) / `task-plan`(tasks 3) 각 item 에 `code_pointers_na:true` 추가 (schema 가 이미 item-level 에 `code_pointers_na`(default:false) 정의 → additive / schema-valid).
- **Layer 3** skill 4종 — `discovery-decompose-use-cases`/`spec-compose-behavior-spec`/`spec-derive-acceptance-criteria`(UC/BHV/AC=의도 노드 → na 기본) + `plan-decompose-and-sequence`(TASK=na 기본이되 수정 코드 range 알면 `code_pointers` 채워 의존성 추론 정확도↑).
- **test** +5 (graph-synthesizer.test.js) — ①intent 노드 na 자동 ②포인터 보유 시 no-op(na_conflict 회피) ③IMPL/TC 무source→missing 유지(anti-regression) ④analysis/aspect na + plan(EPIC) 무변경 ⑤carried-over deprecated intent → na 미stamp(★ Senior 게이트 회귀 anchor). builder 105→**110**.

**★ §8.1 1차 corroboration (RealWorld / Type 1.5 external repo / no-simulation)**: 실 production 경로(builder CLI → patched synthesizer → code-pointer-validator)로 RealWorld 그래프 재합성 실측 — **BEFORE** covered=25/na=0/missing=90/**ratio=21.7%** → **AFTER** covered=25/**na=90/missing=0/ratio=100%** (node parity 115=115 / na_conflict=0 / coverage_missing=0). release-readiness #16 은 정적 poc-05 corpus(이미 100% 백필) read 라 **무영향**(무회귀) — 본 패치 가치 = 신규/외부 프로젝트가 hand-backfill 없이 coverage 확보.

**carry**: ① analysis/aspect `code_pointers` enrich (Layer 1 backstop na 가 가린 부분 / analysis skill 大 변경 → 별 cycle / 사용자 결단 2026-05-30) ② §8.1 2차 corroboration (RealWorld 외 1 PoC 재합성 21.7%대→100% / standing).

**STOP-3**: workspace 868→**873(+5)** ✅ + release-readiness 22/22 ✅ + skill-citation 252 doc 0 stale + version 3-way 11.12.0 + breaking 0 = MINOR.

## [11.11.0] — 2026-05-30 MINOR — use-scenario S2(AX전환) gate: characterization GREEN + augmentation RED 분리 enforcement (C-use-scenario-s2-gate Track α / DEC-2026-05-30-s2-gate-slice)

use-scenario taxonomy(v11.7.0)가 **S2(AX전환)를 주 타깃**으로 선언했으나 Slice 1(v11.9.0)의 gate 매트릭스는 `S2: { test: 'all_fail' }` = S1 fallback 으로 공백이었다. S2 의 본질 = legacy **in-place 증강** → test 산출물이 **characterization**(기존 동작 포착 / impl 존재 → GREEN) + **augmentation**(신규 증강분 / impl 부재 → RED) 혼합인데, aggregate `all_fail` 은 characterization 까지 RED 를 요구해 정상 산출물을 오탐 block (= F-DOGFOOD-007 재현). 본 release = gate 를 **per_tc_outcome 분기**로 구현해 혼합을 검증.

**시행 (additive / breaking 0)**:
- **schema** `schemas/test-spec.schema.json` — test_cases[].items 에 optional `test_intent` enum `[characterization, augmentation]` (미지정 = aggregate fallback / additionalProperties:false 정합).
- **gate** `tools/chain-driver/src/gate-eval.js` — `SCENARIO_EXPECTED.S2.test = 'per_tc_outcome'` + evaluateGate test stage 분기 (`findings.outcome_mismatches > 0` → reason `s2_outcome_mismatch` / severityRank 2 = coverage_threshold 수준 / go-with-warnings 허용). **S1/greenfield/S3 매트릭스 무변경** (S2 분기 격리).
- **validator** `tools/test-impl-pass-validator/src/s2-outcome-check.js` (신규) — 순수 모듈: `reconcileOutcomes(testCases, actualByTcId)` (per-TC expected_outcome ↔ 실 결과 대조 → outcome_mismatches/evaluated/missing_actual) + `correlateByTcId(testResults, testCases)` (test-name → TC-id substring 상관 규약).
- **test** +15 — scenario.test.js +5 (per_tc_outcome mismatch=0 통과 / mismatch>0 block / all-pass 허용 / WARN override / implement GREEN) + s2-outcome-check.test.js +10 (reconcile 6 + correlate 4).

**per_tc_outcome 매트릭스**: characterization → expected_outcome='pass' (legacy 존재 GREEN) / augmentation → 'fail' (impl 부재 RED). gate = aggregate 가 아니라 per-TC expected ↔ actual 일치(`outcome_mismatches`)로 판정. implement stage = S2 도 all_pass.

**★ §8.1 ≥2 S2 corroboration = 1/2 → WARN enforcement** (intent_certainty v11.6.0 optional-WARN 선례):
- **1차 corroboration (RealWorld / Track α)**: RealWorld(brownfield) 25 TC 전부 characterization → S2 reframe(`test-spec.s2-reframe.json`) **schema-valid** + real gate 코드로 **S1 false-block(F-DOGFOOD-007) → S2 해소** 실증 (`evaluateGate` S1 blocked=true `evidence_missing` / S2 blocked=false). 측정 = `_dogfood-realworld/.../s2-gate-probe.md` + finding F-DOGFOOD-012.
- **2차 = carry**: 실 characterization GREEN **execution** corroboration = Java/Gradle 부재(RISK-ENV-001) → no-simulation 정책상 GREEN 날조 ❌ / runnable S2 환경(poc-17 사내 Java / RealWorld CI) 의무 + augmentation arm 미실증(RealWorld 신규 기능 부재).

→ enforcement = **WARN** (`s2_outcome_mismatch` rank 2 / 사용자 go → go-with-warnings 허용 / hard-block ❌). ≥2 충족 후 rank 격상 = 별 release.

**paradigm 정합**: gate 를 추측으로 hard-lock ❌ — 실 S2 dogfood(RealWorld)가 구동 (dogfood-first / F-007 = real high finding 해결 = self-referential 아님). brownfield 토글(단순 GREEN 패치) ❌ — 시나리오별 매트릭스로 교정 (S1 의 test 대상=생성될 코드 보존 / taxonomy §2.2).

**STOP-3**: workspace test (chain-driver 250 + test-impl-pass-validator 40 / +15 신규) ✅ + release-readiness 22/22 ✅ + skill-citation 0 stale + version 3-way 11.11.0 + breaking 0 = MINOR. **carry**: `C-use-scenario-s2-gate` 부분 시행 (잔여 = ≥2 execution corroboration + augmentation arm → WARN→block 격상). F-DOGFOOD-007 → resolving.

---

## [11.10.1] — 2026-05-30 PATCH — drift-validator phase-flow false-positive 정리 (CRLF 주석 + 횡단 메타 노드) (DEC-2026-05-30-phase-flow-drift-false-positive)

`drift-validator flows` directory mode 가 `analysis.phase-flow.mermaid` 에서 **4 breaking 오탐** (`phase-flow.json` / `poc-findings.md` / `INDEX.md` / `STATUS.md`). 모두 phase data-contract 산출물이 아님 — root cause 2종:
- **CRLF 주석 누출**: `stripComment` 의 `/%%.*$/` 가 CRLF 파일에서 작동 안 함 (JS `.` 는 `\r` 미매치 + `$` 가 trailing `\r` 앞 미매치 → 주석 전체 미제거). Windows CRLF mermaid 의 `%%` 주석 내용(`phase-flow.json`)이 artifact 스캔에 누출. → `normalizePhaseFlow`/`detectPhaseFlowMermaid` 의 `text.split('\n')` → `split(/\r?\n/)` (CRLF-safe / `\r` 제거).
- **횡단 메타 노드**: `CC_FIND["findings/poc-findings.md…"]` + `CC_DEC["… INDEX.md / STATUS.md"]` = cross-cutting 노드(finding-system / decisions 로그) — phase 산출물 아님. → `NON_DELIVERABLE_META` 제외 집합 추가 (`extractArtifactFiles` 에서 `phase-flow.json`/`poc-findings.md`/`findings.md`/`index.md`/`status.md` 필터 / v11.1.0 `META_FILE_RE` 와 동일 패러다임).

배경: v11.1.0 이 "drift-validator flows 5/5 0 breaking" 기재했으나 이후 CRLF/횡단노드 표면화로 regression. **RED→GREEN 정공법** — `compare-phase-flow-artifacts.test.js` +2 회귀 test (CRLF 주석 / 횡단 메타). mermaid·json 산출물 본문 무변경 (validator 로직만 / 진짜 rename drift 검출력 보존).

**+ 3번째 fix (test wiring 정직 정정)**: `compare-phase-flow-artifacts.test.js` 가 v11.1.0 신설 이후 **drift-validator `package.json` test script 에 미등록 = orphaned** (CI 미실행 / v11.1.0 의 4 회귀 test 가 실제로는 안 돌고 있었음). 본 release 에서 test script 에 추가 → 4 기존(미실행) + 2 신규 = **+6 test** 실 wiring.

**STOP-3**: drift-validator 71→**77** (compare-phase-flow-artifacts 4→6 + orphaned wiring) + `flows` 5/5 **0 breaking** ✅ + workspace test 847→**853(+6)** + release-readiness 22/22 ready + skill-citation 0 stale + version 3-way 11.10.1 + breaking 0 = PATCH.

---

## [11.10.0] — 2026-05-30 MINOR — greenfield 산출물 bootstrap (C-use-scenario-taxonomy-impl Slice 2 / greenfield-bootstrap 도구 + 5 skill greenfield-mode) (DEC-2026-05-30-use-scenario-greenfield-bootstrap-slice2)

v11.9.0 Slice 1(시나리오 선언 + gate)의 토대 위에서, **greenfield(신규 / legacy 코드 없음)가 7대 산출물을 실제로 생성해 chain 에 진입**하게 만드는 Slice 2. 사용자 1차 want("신규도 산출물이 나와야 chain 으로 개발·운영"). 옵션 A(DEC-2026-05-30-use-scenario-taxonomy §2.4) = 기존 `analysis-from-*` 재사용 / "analysis 는 코드가 아니라 입력을 요구" 재프레이밍.

**시행 (additive / breaking 0)**:
- **신규 도구 `tools/greenfield-bootstrap/` (24번째 / zero-dep)** — 결정적·testable anchor: ① `swagger-extract.json → openapi.yaml` elevation (zero-dep block-YAML emitter / 이미 파싱된 OpenAPI 의 결정적 승격 / AI 추론 0) ② legacy-only 산출물 N/A 생성 — `antipatterns.json` 빈 배열 + **`meta.na_reason` embed** (top-level `additionalProperties:false` 회피 / `antipatterns.schema.json` strict 정합) + `migration-cautions.md` stub. CLI `--output [--swagger-extract] [--scope] [--channel]` / 순수 변환(환경 의존 0). **29 test** (yaml-emit 12 + elevate 14 + na-artifacts 5 / §8.1 ≥2 swagger fixture = minimal + RealWorld).
- **5 analysis skill greenfield code-optional mode** — `analysis-{architecture,domain-model,business-rules,db-schema-erd,openapi}` 에 "scenario=greenfield 시 코드 대신 입력어댑터 extract 에서 산출 / `source_grounded_evidence`=입력 출처 인용 / `code_pointers`=N/A" 절 추가. schema 는 code_pointers hard-require ❌ → greenfield 산출물 schema-valid.
- **신규 skill `analysis-greenfield-bootstrap`** (57번째 / analysis input phase 등록) — greenfield 진입점. 입력어댑터 패스(코드-고고학 skip) → 결정적 산출(elevation/N-A) → AI 5종 code-optional 산출 → 검증 조율.
- `analysis-input-orchestrate` greenfield 분기(5단계) + `analysis-input-collection` greenfield redirect note.
- doc: `lifecycle-contract.md`(analysis = 코드-고고학[legacy] + 입력어댑터[greenfield] 두 패스 / asset matrix input row) + `use-scenario-taxonomy.md` §3.2 bootstrap 구체 절차 + §5 carry 갱신.

**1 실 dogfood (no-simulation)**: RealWorld(Conduit) swagger-extract → `tools/greenfield-bootstrap` → `openapi.yaml`(3 endpoint/5 schema) = `@readme/openapi-parser` **valid:true / warnings:[]** + `antipatterns.json` = `schema-validator` PASS (antipatterns.schema.json). **정직 표기**: swagger **1채널** 입증 / figma·PRD 2nd 채널 = carry.

**backward-compat**: scenario ≠ greenfield → 모든 greenfield-mode 절 무시 (legacy 코드 추출 경로 그대로 / 기존 818 test 무회귀).

**Slice 2 잔여 carry**: `C-use-scenario-greenfield-dogfood-2nd-channel` (figma/PRD 실 dogfood / §8.1 ≥2 완성) + `C-use-scenario-greenfield-schema-synthesis` (PRD ER 부재 시 entity→table 합성) + `C-use-scenario-s2-gate` (S2 characterization+augmentation 분리 gate).

**STOP-3**: workspace test 818 → **847 (+29)** ✅ + release-readiness 22/22 ready ✅ + skill-citation 0 stale (252 doc) + version 3-way 11.10.0 + drift layout/chain-layout 0 orphan + breaking 0 = MINOR.

---

## [11.9.0] — 2026-05-30 MINOR — use-scenario 선언 plumbing + scenario-aware gate matrix (C-use-scenario-taxonomy-impl Slice 1) (DEC-2026-05-30-use-scenario-impl-slice1)

v11.7.0 use-scenario taxonomy 형식화의 실 구현 carry(`C-use-scenario-taxonomy-impl`) Slice 1. **시나리오 선언 plumbing + RED/GREEN gate 의 scenario 분기** — taxonomy 의 원인인 F-DOGFOOD-007(brownfield RED 오관측 / gate-eval 이 시나리오 모른 채 하드코딩)을 **구조적 해소**. **greenfield 산출물 bootstrap 은 Slice 2 carry**.

**시행 (additive / breaking 0)**:
- `schemas/work-unit-manifest.schema.json` — top-level optional `scenario` enum `[S1,S2,S3,greenfield]` (scope manifest only / required ❌).
- `tools/chain-driver/` — `init --scenario` flag (cli.js) + `createScopeManifest(scope, scenario)` + `ensureScopeDir` passthrough (state-store) + `renderManifestMd` Scenario 줄 (work-unit.js). 소비자는 readManifest 자동 접근.
- `tools/chain-driver/src/gate-eval.js` — `evaluateGate(stage, findings, scenario='S1')` + `SCENARIO_EXPECTED` 매트릭스. **S1/greenfield**=forward(test all_fail RED="생성될 코드 부재" → implement all_pass GREEN) / **S3 특성화**=snapshot(RED 강제 ❌ / mis-gate 수정) / **S2**=Slice 1 S1 fallback (characterization+augmentation 분리 = Slice 3 carry). cmdNext 가 manifest.scenario 전달.
- `tools/chain-driver/test/scenario.test.js` (신규 14 test) — plumbing + schema enum + gate matrix.

**backward-compat**: scenario 미지정 → gate-eval default 'S1' → 기존 동작 동일 (6/6 e2e + gate-eval/state-store test 무회귀 / 기존 PoC manifest 무영향).

**Slice 2+ carry**: `C-use-scenario-greenfield-bootstrap` (analysis-from-* 재사용 orchestration + planning→output elevation + lifecycle greenfield 경로 / §8.1 ≥2 입력 채널) + `C-use-scenario-s2-gate` (S2 characterization GREEN + augmentation RED 분리 / test-intent labeling).

**STOP-3**: workspace test 804 → **818 (+14)** ✅ + release-readiness 22/22 ready ✅ + skill-citation 0 stale + version 3-way 11.9.0 + breaking 0 = MINOR.

---

## [11.8.0] — 2026-05-30 MINOR — codegraph-runner 신설 (C-codegraph-essential-impl Slice 1 / CodeGraph OSS 필수 도구 wiring) (DEC-2026-05-30-codegraph-essential-impl-slice1)

직전 v11.7.0 이 codegraph = analysis 필수 도구로 결정(DEC-2026-05-30-codegraph-essential)하고 실 wiring 은 carry(`C-codegraph-essential-impl`)했음. 사용자 "C-codegraph-essential-impl 부터 진행" → Slice 1 (도구 실행 + reference-lens 산출물) 시행. **federation(dep-graph 결합)은 Slice 2 carry**.

**사전 검증 (LL-codegraph-02 교훈)**: codegraph v0.9.7 이 환경에 실제 설치·실행 가능 확인 (no-simulation 전제) + CLI 모델 확인 (`init -i`/`index` → `status --json` / SARIF 아님).

**시행 (additive / breaking 0)**:
- `tools/codegraph-runner/` 신설 (23번째 workspace tool) — `codegraph index` 실제 실행(real exec / 7-field evidence / evidence_trust=real_tool) + `codegraph status --json` 통계 → `code-graph.json` manifest. 환경 부재 시 exit 3 정직 신호 (no-simulation / persona 시뮬레이션 ❌). **cross-platform**: Windows 전역 npm bin `.cmd` shim = shell 경유 (Node 22 CVE-2024-27980 완화 정합 / execFileSync('.cmd')=EINVAL → execSync + 경로 quoting). 9 test (manifest 단위 + 실 smoke / §8.1 JS+Java ≥2 stack).
- `schemas/code-graph.schema.json` 신설 — code-graph.json shape (meta/index_stats/evidence) / additionalProperties:false strict / evidence_trust enum {real_tool, simulated}.
- `skills/analysis-code-graph/SKILL.md` 신설 — analysis 단계 cross-cutting aspect (codegraph 필수 도구) / `flows/analysis.phase-flow.json` cross_cutting.aspects.skills[] 등록.

**★ trust 모델 (DEC-2026-05-28 §4.2 준수)**: code-graph.json = **reference-lens / finding 으로만 수용 / 어떤 결정적 gate 에도 inject ❌** (manifest.trust_note 명시 / gate-eval·release-readiness validator 목록 무변경).

**구현 carry (Slice 2 / `C-codegraph-federation`)**: dep-graph navigate 증강 (codegraph callers/impact) + code-pointer staleness query + cross-domain undeclared 호출 finding + MCP serve. → Senior REVISE @ 40% 영역 / §8.1 corroboration 후 별도.

**STOP-3**: workspace test 795 → **804 (+9)** ✅ + release-readiness 22/22 ready ✅ + skill-citation 0 stale + version 3-way 11.8.0 + breaking 0 = MINOR. drift-validator check-phase-skills (신규 aspect skill 등록) 정합.

---

## [11.7.0] — 2026-05-30 MINOR — use-scenario taxonomy + AX 운영 정체성 형식화 + codegraph 필수화 (DEC-2026-05-30-use-scenario-taxonomy + DEC-2026-05-30-codegraph-essential)

session 55차 `/clear` 후 사용자 방법론 정체성 재진술 chain (ExitPlanMode 5회 거절 = 정체성 정밀화 루프) → 직전 v11.6.0 이 carry 한 `C-use-scenario-taxonomy` 의 **형식화 시행**. **본 release = 형식화 문서만** (설계 SSOT 확립 / 코드·스키마·greenfield 실제 빌드 = carry).

**가장 큰 목적 (P0)**: 산출물 = "시스템 설명 문서"가 아니라 **LLM 의 운영 컨텍스트 그 자체**. 방법론의 가장 큰 목적 중 하나 = 이 컨텍스트를 평생 유지·동기화하여 **프로젝트를 AX 로 운영**(LLM 이 정확한 컨텍스트로 develop·run·modify·evolve)하는 것. (P1 산출물=LLM 컨텍스트 / P2 bootstrap 입력만 다르고 유지 동일 / P3 dep-graph+codegraph 동기화 / P4 산출물=전 stage base+양방향 역동기화)

**use-scenario taxonomy 4종** (★ **S2 AX전환 = 주 타깃** / S1 재생성 / S3 특성화 / greenfield): bootstrap 입력에서만 갈리고 모두 같은 정상 상태(AX 운영)로 수렴. 시나리오별 RED/GREEN 매트릭스 = F-DOGFOOD-007 교정 (S1 의 test 대상 = legacy 아니라 생성될 코드). **greenfield = 처음부터 AX-native** — 입력어댑터 analysis(`analysis-from-*`) 재사용(옵션 A)으로 산출물 생성 → gap B(discovery 어댑터가 7대 산출물 미생성 / spec hard-dep 막힘) 해소 설계. 시나리오 선언 = `chain-driver init --scenario`→`work-unit-manifest.scenario` (전 stage 일관 참조).

**codegraph 필수화** (DEC-2026-05-30-codegraph-essential): CodeGraph OSS = analysis 단계 필수 도구(Semgrep 동급 / no-simulation 무조건 실행). **DEC-2026-05-27 codegraph scope-out 의 게이트 폐기** (외부 사용자 = 사용자 직접 결정 / maturity = R19 Tier 2 environment-risk 강등 / probe #1~#3 작동 입증). "폐기" 대상 = codegraph ❌ / 막던 게이트 ✅.

**시행 (additive / breaking 0)**:
- `decisions/DEC-2026-05-30-use-scenario-taxonomy.md` + `decisions/DEC-2026-05-30-codegraph-essential.md` 신설 (SSOT)
- `methodology-spec/use-scenario-taxonomy.md` 신설 (4-case 매트릭스 + greenfield 옵션 A + 선언 위치)
- `CLAUDE.md` + `methodology-spec/lifecycle-contract.md` §가치명세 — INPUT "1차 = legacy single-case" → 4 시나리오 + P0~P4 (additive)
- `methodology-spec/plugin-charter.md` — R21 신설 (요구 20→21 / 활성 19/19) + §2 매핑 ◐ 설계 SSOT
- `decisions/DEC-2026-05-27-codegraph-integration-scope-out.md` — superseded 표기 (역사 trail 보존)
- `decisions/DEC-2026-05-30-fdogfood-003-intent-certainty.md` §6 — carry `C-use-scenario-taxonomy` resolved

**구현 carry (본 release 제외 / §8.1 ≥2 corroboration + STOP-3 의무)**: `C-use-scenario-taxonomy-impl` (chain-driver --scenario flag + manifest.scenario 스키마 + greenfield 재배선 + RED/GREEN gate enforcement) + `C-codegraph-essential-impl` (codegraph 도구 wiring + dep-graph federation) + `C-honesty-tool-cleanup` (no-simulation 절 실행불가 도구 SpotBugs/Daikon 정직 cleanup).

**STOP-3**: workspace test 영향 0 (형식화 문서만) + release-readiness 22/22 ready + skill-citation 0 stale + version 3-way 11.7.0 + breaking 0 = MINOR. 5 LL (LL-usc-01~03 + LL-codegraph-essential-01~02).

---

## [11.6.0] — 2026-05-30 MINOR — discovery `intent_certainty` enum (F-DOGFOOD-003 / MyBatis+JPA arm ≥2 corroboration / DEC-2026-05-30-fdogfood-003-intent-certainty)

RealWorld dogfood 2nd arm(JPA / `1chz/realworld-java21-springboot3`)이 F-DOGFOOD-003(discovery BR-INTENT reasoning 의 intent 과잉귀속)을 재현 → MyBatis arm(#1) + JPA arm(#2) **§8.1 ≥2 corroboration 충족** → 보류 패치(Option B) 잠금 해제 시행.

**문제**: discovery `business_rules_intent.reasoning` 의 의도 과잉귀속을 Option C guardrail(prose marker `[관찰]/[결과]/[미검증]`)로만 막는데, **검사 validator 부재**(skill 자인 / discovery-extraction-validator 는 br_id match 만) = 양심 의존 = no-simulation 안티패턴. JPA arm 에서 validator 0 findings 인데 reasoning 엔 unverified-intent 존재로 재입증 (동일 3 패턴: login 단일메시지 / slug→SEO / updatedAt-vs-createdAt정렬 소스반증).

**해결 (additive / breaking 0)**:
- `schemas/discovery-spec.schema.json` — business_rules_intent.items 에 `intent_certainty` enum (`observed`/`inferred-consequence`/`unverified-intent`/`source-refuted`) **optional** 추가. prose marker 의 구조화 승격.
- `tools/discovery-extraction-validator` — `intent_certainty` 부재 시 **WARN**(low / non-blocking / 채택 nudge) + test 4 신규 (13/13 pass).
- `skills/discovery-identify-business-intent/SKILL.md` — intent_certainty 구조 라벨 의무 instruction + enum↔marker 매핑표 + line 61 "비결정적" 문구 갱신.
- dogfood 산출물 소급: JPA + MyBatis discovery-spec 14 BRI 에 intent_certainty 부여 (분포 observed 8 / unverified-intent 3~4 / inferred-consequence 1~2 / source-refuted 1).

**Patch B (F-DOGFOOD-007 / brownfield RED) = 본 release 제외 / carry** — 사용자 재진단: "brownfield 토글" ❌ / use-scenario(S1 재생성 / S2 AX 전환 / S3 특성화) taxonomy 필요. F-007 은 S1(코드 재생성)에서 대부분 오관측(test 대상=생성될 코드). 별도 설계 결단 (DEC-2026-05-30-fdogfood-003-intent-certainty §carry).

**STOP-3**: workspace test (discovery-extraction-validator 9→13 / +4) + skill-citation **0 stale** (poc-17 forward-ref hygiene 동반 정정) + version 3-way 11.6.0 + breaking 0 = MINOR.

---

## [11.5.1] — 2026-05-29 PATCH — discovery-extraction-validator multi-path BR lookup (paradigm-level resilience / DEC-2026-05-29-validator-multi-path-br-lookup)

> ★ ★ ★ session 54차 = poc-17 chain 1 forward 차단 추정 결함 (LL-poc-17-15 / session 53차 carry queue 본격 promotion `C-validator-dual-key-businessrules`) → Phase 1 validator src + test 시행 → ★ Phase 2 외부 PoC 실측 시점 ★ ★ 본격 사실 정정 발견 ★ ★ — **pre-fix 도 GREEN** (사용자 chain 1 진입 직전 normalize 우회로 chain 1 forward 자격 이미 충족). 본 fix 실제 가치 = ★ paradigm-level resilience 추가 ★ (test 4 신규 / 미래 PoC dual-key + suffix 일관 paradigm 산출 시 자연 인식 / 외부 normalize 우회 불필요). additive only / breaking 0 / 본 PoC 영향 0.

> ★ ★ ★ ★ ★ paradigm A (self-referential drift 회피) 본격 가치 self-입증 사례 ★ ★ ★ ★ ★ — session 53차 LL-poc-17-15 본문 "Phase 3 validator 실행 결과 = 12 CRITICAL" narrative + chain-intervention-log root_cause "validator 는 rules array 만 lookup" 본문 = ★ 실제 validator 코드와 mismatch ★ (validator 는 `rules.business_rules` 를 봄). self-기록 사실 검증 부족 cycle 의 본격 본격 자기-차단 사례 — paradigm A retract 자격 자연 ❌ / paradigm A 본격 강화 axis 자연.

### Added
- `decisions/DEC-2026-05-29-validator-multi-path-br-lookup.md` — 본 release SSOT
- `tools/discovery-extraction-validator/src/validator.js` BR lookup 다중 경로 본격 보강 (additive backward-compat):
  - `analysis?.rules?.business_rules` (기존 가정 / backward-compat / v11.0.0~v11.5.0)
  - `analysis?.business_rules` (top-level array / poc-17 chain 1 normalize paradigm)
  - `analysis?.rules` (top-level rules array / analysis baseline 자연 paradigm)
  - `analysis?.rules_step_4c_carcost` (dual key 두번째 / poc-17 Phase 4c paradigm)
- `tools/discovery-extraction-validator/test/validator.test.js` neuer `describe('multi-path BR lookup (v11.5.1)')` block — 신규 test 4종 (additive):
  - top-level `business_rules` array (poc-17 normalize) 매치 입증
  - top-level `rules` array (suffix 없음 / analysis baseline) 매치 입증
  - `rules_step_4c_carcost` (dual key) 매치 입증
  - 어느 경로에도 없으면 critical 본격 발생 (회귀 차단)

### Changed
- (없음 — 본 release = additive only / 기존 path 보존 / breaking 0)

### Test 영향
- workspace test 787 → **791 (+4)** / 0 fail ✅
- 본 PoC `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/` 안 validator 직접 실행 = **0 findings / UC coverage 100%** (pre-fix + post-fix 동일 / 본 PoC 영향 0 입증)

### Carry resolved
- ✅ `C-validator-dual-key-businessrules` (session 52차 LL-poc-17-09 + session 53차 LL-poc-17-15 promotion) — paradigm-level resilience 본격 추가로 본격 종결
- ★ ★ paradigm A 본격 강화 axis 본격 자산화 (LL-validator-dual-key-01~03 / 본 plan §8)

### Carry (★ 별 cycle)
- C-schema-regex-paradigm-completion (axis 3 Layer 1 schema 자체 본격 검토 / Type 2 외부 사용자 자연 trigger 의무)
- 본 PoC 안 통합 array (`business_rules` top-level / -001 suffix) = 자연 폐기 자격 (선택적 / 본 fix 후 자연 가능 / 본 PoC 차기 cycle 또는 다음 PoC 자연 처분)

---

## [11.5.0] — 2026-05-29 MINOR — analysis-business-rules skill 본문 BR id strict instruction 본격 추가 (axis 3 / paradigm drift 영구 차단 / DEC-2026-05-29-axis-3-skill-strict-instruction)

> ★ ★ ★ poc-17 chain 1 discovery 첫 사내 live 시행 시 표면화된 paradigm drift (★ schema strict regex `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` vs analysis-from-* skill enforcement 부재 → AI meaningful name 자유 paradigm 산출 → chain 진입 시 schema-validator RED → patch fix 임시 우회) 의 ★ ★ 영구 해결 (Path 2 / skill 본문 enforcement). 사용자 의제 결단 ("포맷팅 대로 되는게 좋다" / context engineering 본격 답: prefix 의미 + suffix 식별자 양수 가치 본격). additive only / breaking 0 / methodology body 1 파일 갱신 (skill 본문).

### Added
- `decisions/DEC-2026-05-29-axis-3-skill-strict-instruction.md` — 본 release SSOT
- `skills/analysis-business-rules/SKILL.md` §3 안 ★ BR id 형식 의무 instruction 본격 추가 (1 unit / additive):
  - regex `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` 정합 의무
  - form = `BR-<DOMAIN>-<SUBJECT>-<NNN>` (예: `BR-USER-VERIFY-001` / `BR-RBAC-PRIORITY-001` / `BR-CARLIST-PAGINATION-001`)
  - prefix 의미 직관 (LLM 컨텍스트 read) + suffix 식별자 (machine 매칭 / typo silent fail 차단)
  - meaningful name 단독 산출 ❌ / patch fix 본격 발생 차단
  - paradigm 본격 정합 근거 = poc-17 chain 1 first 표면화 (사실 기록)

### Changed
- (없음 — 본 release = additive only / breaking 0 / 기존 paradigm 본격 보존 / 기 산출 PoC #01~#16 BR id 본격 보존 자격 / 새 PoC analysis baseline 진입 시점 부터 본 instruction 본격 적용)

### Migrated / Backward-compatible
- 본 PoC poc-17 analysis baseline 안 business-rules.json `rules` + `rules_step_4c_carcost` array (legacy meaningful name paradigm) = ★ ★ 본격 보존 (cross-link 자산 영향 회피)
- 본 PoC chain 1 discovery 시행 시 동시 normalize 시행한 `business_rules` 통합 array (additive normalize / -001 suffix) = ★ 본 instruction 본격 1:1 정합 사실

### Carry (★ Type 2 외부 사용자 자연 trigger 시점)
- C-other-analysis-skills-strict-cascade — analysis-api-rule-mapping + discovery-identify-business-intent 등 cross-skill 본격 strict 정합 의무 검토 (paradigm coherence)
- C-other-id-patterns-strict — AP id (`^AP-[A-Z0-9_-]+-[0-9]{3}$`) + UC id + AC id + BHV id + TASK id + TC id + IMPL id 본격 strict pattern 동일 paradigm 정합 의무 검토

---

## [11.4.0] — 2026-05-29 MINOR — sub-rule §X-H v1.2.0 본격 cascade + methodology-spec §사례 3 갱신 (poc-17 Phase 1 첫 corroboration / DEC-2026-05-29-sub-rule-v1.2.0-poc-17-corroboration)

> ★ ★ ★ poc-17 ifrs/car 도메인 Phase 1 analysis baseline 본격 종결 (12 phase 전수 / 25+ 산출물 / 43 finding / 16 AP / cross-DB 18 자산) 직후 본격 사실 누적 본격 자산화 cycle (A+B+C+D 전체 시행 / 사용자 결단). additive only / breaking 0.

### Added
- `decisions/DEC-2026-05-29-sub-rule-v1.2.0-poc-17-corroboration.md` — 본 release SSOT
- sub-rule `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X-H 4 sub-section 본격 신축:
  - (1) 자산 실측 / (2) sub-axis 자동화율 **81.25%** 본격 측정 / (3) §X-H-11 신축 AP / (4) R1'-c DB axis 첫 corroboration
- ★ ★ ★ §X-H-11 신축 AP 11종 본격 자산화 (`AP-LEGACY-IBATIS2-DB-001~011`):
  - N+1 / N+5 subquery / cross-DB direct / 외부 SP EXEC / raw JSP / **★ PII 하드코딩 critical** / dead SQL / magic constants / insert-as-update / debug stdout / parallel array / N1 cross-DB
- methodology-spec §사례 본격 확장 3:
  - `db-assets-always-on.md` §8 — DB Tables 6 정정 + ★ cross-DB 18 자산 본격 가치 입증 + 자동 validator 부재 carry
  - `sp-conversion-policy.md` §10 — γ 1건 + 사내 utility function 2건 (FN_SPLIT + fn_lpad) + `<procedure>` tag 본격 입증
  - `baseline-delta-operating-model.md` §5 신설 — canonical global baseline 첫 본격 적용 + cadence 3 단계 + K + L 정책 통합 입증

### Changed
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.1.2 → **v1.2.0 MINOR**
- `decisions/PROGRESS-poc-17-dogfooding.md` Phase 1 본격 종결 entry (마스킹)
- `decisions/INDEX.md` 시간순 entry 등록
- memory 2 갱신 (외부 / release 본문 변경 ❌):
  - `feedback_composite_view_pattern.md` — PoC #02 4건 → **PoC #17 5건** 본격 확장
  - `feedback_finding_threshold.md` — F-021 임계 paradigm 갱신 (legacy paradigm 별 30~60 신축)

### Preserved (★ 본 cycle 변경 ❌)
- sub-rule §2 core 5 AP (AP-LEGACY-IBATIS2-001~005) 변경 ❌
- ADR-CHAIN-010/014/015 변경 ❌ / schema 변경 ❌ / skill·agent body 변경 ❌
- workspace test 본격 추가 ❌

### M.2 측정 axis 사실 누적 (9종)
K (DB always-on) first live (18 cross-DB) / L (SP α/β/γ/δ) first live (γ 1 + 사내 utility 2) / R1' axis 4번째 corroboration (PoC #06+#07+#11+#17) / R1'-c (DB axis) 첫 sub-axis corroboration / sub-rule §X-H 첫 live (sub-axis 81.25%) / chain harness 5 gate (analysis chain 0 / 12 phase 전수) / baseline-delta (canonical global 첫 본격) / 사내 source 격리 (LL-codegraph-07) 첫 live / Composite View 5건 사내 + Scenario C 첫 사내.

### Finding 누적 (★ ★ ★ 43건 / F-021 임계 본격 초과)
critical 1 (F-PII-HARDCODE-001) / high 6 / medium 14 / low 16 / observation 6 (3 해소). **legacy paradigm 별 임계 신축** (memory): 일반 PoC 5~15 vs legacy PoC 30~60 → poc-17 = 43건 정합 / 명세 부실 ❌.

### LL 후보 4
LL-poc-17-01 (dogfooding live probe 첫 본격 입증) / LL-poc-17-02 (legacy PoC finding 본격 누적 자연 사실) / LL-poc-17-03 (sub-axis = R1' axis 별 metric) / LL-poc-17-04 (Composite View 본격 압축 가치 입증).

### STOP-3 통과
workspace test 영향 ❌ + release-readiness 22/22 보존 + skill-citation 0 stale + version 3-way 11.4.0 + breaking 0 = MINOR.

### carry queue 본 cycle 외
C-sub-axis-3-poc-corroboration (자격 1/3) / C-c-layer-baseline-재측정 / C-jsp-parser-augment / C-db-autoval / F-PII-HARDCODE-001 즉시 정정 (사내 source / 사용자 결단) / chain 1 discovery 진입 (poc-17 car-list pilot).

---

## [11.3.0] — 2026-05-28 MINOR — DB 자산 always-on 정책 + SP 4 분류 매트릭스 (poc-17 ifrs/car dogfooding cascade / ADR-CHAIN-014/015)

> poc-17 ifrs/car dogfooding Phase 1.5 (2026-05-28 / 사용자 명시) carry — K (DB always-on) + L (SP 전환) 정책 cascade. 직전 release 가 methodology-spec 신설 + DEC + ADR 만 정공 → 본 release 가 **schema cascade + validator gate + docs cascade + finding 자산화** 본격 완결. additive only / breaking 0. 첫 carry F-CHA-poc17-001 (chain-driver `init` paradigm 명세 부재) Type 2 외부 사용자 channel 자연 발현 사례 등재.

### Added

- **`schemas/work-unit-manifest.schema.json`** `analysis_refs` 4 DB 자산 필드 additive (★ db-assets-always-on.md §5 정합):
  - `db_tables[]` (string array) — scope 관련 DB Table 식별자
  - `db_procedures[]` (object array — `id` required / `sp_conversion_class` enum α|β|γ|δ / `external` boolean) — scope 관련 SP list + plan stage 결단 carry
  - `db_functions[]` (string array)
  - `db_views[]` (string array)
  - description 갱신: "canonical global 5 이식성 산출물" → "canonical global 9 이식성 산출물 (5 + DB 자산 4)"
- **`schemas/task-plan.schema.json`** `sp_conversions[]` 필드 additive (★ sp-conversion-policy.md §8 정합):
  - 7 properties: `sp_id` / `sp_name` / `external` / `sp_conversion_class` (α/β/γ/δ enum) / `rationale` (minLength 5) / `verification_oracle` / `adr_ref` (pattern `^ADR-[A-Z0-9_-]+-[0-9]{3}$`)
  - `additionalProperties: false` strict / required: sp_id + sp_conversion_class + rationale
  - top-level $comment 권장 필드 list 갱신 (sp_conversions 추가)
- **`tools/plan-coverage-validator/`** gate #3 SP 분류 검증 본격 활성 (★ chain 3 plan stage):
  - `validateSpConversions(taskPlan)` 신규 export — 4 finding kinds:
    - `plan.sp_conversion.no_adr_for_gamma` (high) — γ classification 시 adr_ref required
    - `plan.sp_conversion.gamma_not_external` (medium) — γ + external≠true inconsistency
    - `plan.sp_conversion.weak_rationale` (medium) — rationale 길이 < 10
    - `plan.sp_conversion.delta_no_oracle` (medium) — δ classification + verification_oracle 부재
  - cli.js 갱신 — `--json` 출력에 `sp_conversions` 결과 포함 + help text §9 추가
  - test 8 신규 (β / γ 정합 / γ no adr / γ not external / weak rationale / δ no oracle / α 정합 / empty)
- **`methodology-spec/finding-system.md`** F-CHA namespace F-CHA-poc17-001 정식 등재:
  - chain-driver `init <project>` cwd 기준 상대경로 paradigm 명세 부재 — 자기 디렉토리 안 자기 이름 인수 호출 시 중첩 hit
  - Severity: low~medium / Status: **logged** (v11.3.0 doc fix 시행)
  - Type 2 외부 사용자 dogfood channel 자연 발현 첫 사례 (poc-17 ifrs/car / `feedback_live_probe_vs_retroactive` 정합)
- **`tools/chain-driver/README.md`** `## ★ init <project> 호출 paradigm` 절 신설 — 두 권고 paradigm (부모 디렉토리 호출 / `init .`) + 안티패턴 회피 명세 / 사용자 양심 의존 우회 표지

### Changed

- **`methodology-spec/lifecycle-contract.md`** §자산 매핑 매트릭스 5 column → **6 column** (DB 자산 입력 axis 추가 / db-assets-always-on §6 정합):
  - 9 row 의 DB 자산 의무 명세 — input/analysis(전체)/discovery(scope-related)/spec(schema 변경)/plan(SP 결단)/test(fixture)/implement(migration script)/design(❌)/cross-cut(traceability/aspect)
- **`methodology-spec/baseline-delta-operating-model.md`** canonical global 디렉토리 명시 (★ db-assets-always-on §4 정합):
  - §2 자산 지도에 `.aimd/output/stored-procedures/` + `.aimd/output/functions/` 디렉토리 row 신설 (기존 `schema.json` + `erd.mermaid` 보존)
  - `related_artifacts` (자연어) ↔ `analysis_refs` (schema 정공 명) 동의어 명문화 (SSOT prose drift 정정)
  - §3 운영 cadence (1) baseline 수립 단계에 DB 자산 always-on 정책 인용
  - §4 baseline carry 규약에 DB 자산 drift cascade 항목 추가
  - §6 인용에 db-assets-always-on + sp-conversion-policy 2 SSOT 추가
- `tools/plan-coverage-validator/src/validator.js` 검증 list header 8 → 9 (validateSpConversions 추가)

### Verified

- workspace test: plan-coverage-validator 36 → **44 pass** (8 신규 sp_conversions describe block / 0 fail)
- 3-way version sync: package.json + plugin.json + CHANGELOG = **11.3.0**
- backward-compat: legacy task-plan (sp_conversions 부재) → validateSpConversions = 0 findings (legacy carry 정합 / breaking 0)
- schema additive: work-unit-manifest analysis_refs / task-plan sp_conversions 모두 optional → 기존 PoC 14종 ratchet 분모 미영향

### STOP-3

workspace test 전수 pass ✅ + 3-way version sync 11.3.0 ✅ + breaking 0 (전부 additive 또는 doc cascade) ✅. release-readiness 22/22 검증 = `scripts/release-readiness.js` 실행 의무.

**DEC**: DEC-2026-05-28-db-assets-always-on + DEC-2026-05-28-sp-conversion-policy (직전 cycle 신설)
**ADR**: ADR-CHAIN-014-db-assets-always-on + ADR-CHAIN-015-sp-conversion-policy (직전 cycle 신설)

**Trigger**: poc-17 ifrs/car dogfooding Phase 1.5 (2026-05-28 / 사용자 명시 듀얼 목표 / `decisions/PROGRESS-poc-17-dogfooding.md` 정합).

---

## [11.2.0] — 2026-05-28 MINOR — analysis schema chain-link 일관성 정정 (ADR-CHAIN-013 / PoC #15 dogfood 발견)

> PoC #15 (디렉토리 `examples/poc-16-efiweb-car-spring41/`) 의 12 analysis 적재 후 artifact-graph 안 **83% (10/12) orphan** 발견. 본 결함 = graph-synthesizer 도구 매핑 부족 아닌 ★ **methodology 본체 schema 의 chain-link 일관성 결함**. 3 layer 매핑 표준 (chain-side + analysis-side self-ref + meta fallback) 영구 명문화.

### Added
- `schemas/meta-confidence.schema.json`: optional `related_chain_ids[]` 필드 신설 — 15 analysis + 4 aspect 모두 `$ref` 공유 (DRY / 단일 파일 = 19 schemas 동시 확장). pattern `^(UC|BHV|AC|TASK|TC|IMPL)-[A-Z0-9_-]+$`.
- `tools/traceability-matrix-builder/src/graph-synthesizer.js`:
  - `CHAIN_TO_ANALYSIS_REFS` 확장 — AC 안 추가 매핑 가능 (현 BHV/AC 유지)
  - `ANALYSIS_TO_CHAIN_REFS` 신설 (Layer 2) — 6 kinds 의 self-ref iteration: formal-spec.sequences[].uc_id / characterization-spec.snapshots[].use_case / api.operations[].related_use_case_id / ui-ux.pages[].related_use_cases + components[].related_use_cases / sql-inventory.inventory[].uc_link / domain.bounded_contexts[].aggregates[].related_use_cases (nested 2-deep)
  - meta.related_chain_ids loop (Layer 3 fallback) — 5 schemas (architecture/db-schema/state-map/type-spec/error-mapping-spec) 의무 + universal optional
- `docs/adr/ADR-CHAIN-013-analysis-chain-link-consistency.md`: 3 layer chain-link 매핑 표준 정식 ADR (PoC #15 dogfood 발견 + Layer 1/2/3 권위 표 + 향후 PoC 작성자 의무)
- `tools/traceability-matrix-builder/test/graph-synthesizer.test.js`: `★ v11.2.0 analysis chain-link 일관성 (ADR-CHAIN-013)` describe block 신설 (9 신규 test — Layer 2 6종 + Layer 3 fallback + orphan 회귀 차단 + dangling 가드)

### Changed
- PoC #15 (poc-16-efiweb-car-spring41):
  - artifact-graph 재합성: nodes 42 → **44** / edges 54 → **109** (cross_reference 34 → 89) / orphan **10 → 0**
  - 산출물 파일명 정합: `api-extension.json` → `openapi-extension.json` / `schema.json` → `db-schema.json` (ANALYSIS_FILENAMES 정합)
  - 6 산출물 backfill: domain.aggregates / ui-spec.pages / sql-inventory.inventory 안 ref 필드 명시
  - 6 산출물 meta.related_chain_ids backfill (architecture / db-schema / state-map / type-spec / error-mapping-spec / visual-manifest)
- PoC #15 REPORT.md: D-axis 100% 본격 달성 (4/4 axis pass) + F-POC15-S5-004 (graph-synthesizer 한계 carry) 정식 해소 표기

### Fixed
- F-POC15-S5-004: graph-synthesizer 의 `CHAIN_TO_ANALYSIS_REFS` 매핑 부족 = 본체 schema 결함 = ★ ★ ★ 정식 해소

### Verified
- workspace test: 770 → **779 pass** / 0 fail (신규 9 + 기존 770)
- PoC #05 (sample-user-register) 회귀 0: nodes 18 / edges 29 / orphan 0 / cycle 0 (analysis 2 = BR+AP 만 적재 → 신규 매핑 trigger ❌)
- PoC #15 (poc-16-efiweb-car-spring41) graph-integrity passed=true: orphan 10→0 / cycle 0 / unknown_edges 0
- PoC #15 code-pointer-validator strict: coverage.ratio=1.0 / missing=0 / findings=0 회귀 유지
- 3-way version sync 11.2.0: package.json + plugin.json + CHANGELOG entry

### STOP-3
workspace test 779/779 pass ✅ + 3-way version sync 11.2.0 ✅ + PoC #05 회귀 0 ✅ + PoC #15 orphan 0 ✅. release-readiness 22/22 검증 = §scripts/release-readiness.js 실행.

**DEC**: DEC-2026-05-28-analysis-chain-link-일관성

---

## [11.1.0] — 2026-05-27 MINOR — v11 discovery-spec cascade 완결 + drift-validator outputs 비교 신설 (F-MB-010·F-MB-011)

> end-to-end 흐름 점검 결과, v11.0.0 이 "active doc cascade 완료" 로 기재했으나 실제로는 `planning-spec`→`discovery-spec` rename 이 flows·docs·chain-driver runtime 에 미흡수 (선언↔실상 모순). 본 release 가 잔여 cascade 를 완결하고, 동종 발산을 재발 차단할 drift-validator 산출물명 비교를 신설. RED→GREEN paradigm 정합.

### Added

- **drift-validator phase-flow 산출물명 비교** (F-MB-011 / 신규 capability = MINOR):
  - `normalize-phase-flow.js` — `phases[].inputs[]/outputs[]` (JSON) + mermaid 노드 라벨 (사람 눈) 에서 산출물 파일명 추출 (`extractArtifactFiles` / `*.phase-flow.*` 메타파일 제외).
  - `compare-phase-flow.js` — mermaid 산출물명이 JSON inputs/outputs 에 부재 → **breaking** (rename 누락 / 산출물명 drift) / JSON 만 → info (중간 산출물 정상). 이중 렌더링 SSOT = JSON 계약.
  - `test/compare-phase-flow-artifacts.test.js` 4 케이스 회귀 고정.

### Changed

- **`planning-spec`→`discovery-spec` rename cascade 완결** (F-MB-010 / DEC-2026-05-26-discovery-spec-rename §4 미완료분):
  - **flows**: `discovery.phase-flow.mermaid` OUT 노드 + `sdlc-4stage-flow.{json,mermaid}` + `spec.phase-flow.{json,mermaid}` (입력/NEXT) + `flows/README.md`. spec.phase-flow.mermaid 동반 stale 정정 (NEXT "chain 3 (test)"→"(plan)" / `revisit:planning`→`revisit:discovery`).
  - **docs**: `lifecycle-contract.md` (CHAIN 1·data-contract·tree·schema 목록 + plan stage v11 contract 강제 BE/FE prose 보강) + `README.md` + `guides/chain-harness-guide.md` + `guides/first-prompt-cookbook.md` + `agents/README.md` (plan-agent placeholder→gate #3 본격 표기 동반). `plan-spec`→`task-plan` (chain 3 산출물명) 동반 정정.
  - **runtime hard replace** (PoC frozen 보존 = 사용자 결단): `chain-driver/src/hooks-bridge.js`·`revisit-detect.js`·`work-unit.js` = `discovery-spec.json` keying 으로 교체 (신규 산출물 dep-graph 노드 인식·revisit 감지·traceability 추출) + 4 test fixture 갱신.

### Fixed

- **`finding-system.md:934` brace-notation citation** (`{swagger,plan-doc}-extract.schema.json` → 두 파일명 명시) — skill-citation-validator 오파싱 → `skill_citation_integrity` + `workspace_test_pass` 2 gate regress 해소 (단일 원인 / 외부 figma source-grounding finding 산물).

### Carry (잔여 / 별건)

- `tools/traceability-matrix-builder/src/builder.js` `derived_from` + `tools/formal-spec-link-validator` (CHAIN_ARTIFACT_BY_NAME + `planning_spec_path` schema 필드) = PoC artifact·behavior-spec 필드명 bound → 교체 시 PoC 깨짐 (discovery-spec=chain 1 backward link 없어 실효 영향 ≈ 0). C-dep-graph-v11-paradigm-cascade carry 와 합치.

### STOP-3

- workspace test 전수 pass + release-readiness **22/22 ready** (regress 2 → 0) + skill-citation 0 stale + version 3-way 11.1.0 + drift-validator flows 5/5 0 breaking + chain-layout/state-flow ✅ = MINOR (additive validator capability + corrective cascade).

DEC-2026-05-27-v11-discovery-spec-cascade-완결.

---

## [11.0.3] — 2026-05-27 PATCH — analysis-extraction-validator 신설 (F-162·F-163 구조적 carry 청산)

> F-162 / F-163 의 근본 carry — analysis stage 의 source-grounded hard gate 부재 — 를 validator 신설로 청산. discovery-extraction-validator 가 discovery stage 에 한 것을 analysis stage 입력 어댑터 산출물에 대칭 적용. tools 21종 → 22종.

### Added

- **`tools/analysis-extraction-validator/`** (신규 npm workspace / 13 test pass):
  - figma-extract / plan-doc-extract adapter 자동 감지 (`components`·`screens` → figma / `uc_candidates`·`glossary` → plan-doc)
  - 검증: TEXT 노드 `text_content` 부재 → **critical** (F-162) / `provenance` 부재 또는 가시 텍스트 `inferred` → **high** (F-163) / `inferred` 비율 > threshold(default 0.5) → **medium** (사용자 확인 권고)
  - CLI: `--extract <path> [--threshold <0..1>] [--dry-run] [--json]` / critical·high 시 exit 1
- **`root package.json` workspaces**: `tools/analysis-extraction-validator` 등록.

### Changed

- `skills/analysis-from-figma/SKILL.md` + `skills/analysis-from-plan-doc/SKILL.md`: 산출 자격 조건에 validator 자동 검증 명령 참조 추가.
- `methodology-spec/finding-system.md`: F-162 / F-163 의 validator carry → **resolved** 갱신 (swagger evidence 필드만 잔여 carry).
- `CLAUDE.md`: tools 21종 → 22종.

### 잔여 carry (δ 후속)

- `swagger-extract` evidence 필드 (LOW / parser verbatim 추출이라 후순위).

---

## [11.0.2] — 2026-05-27 PATCH — F-163 input-adapter source-grounded 비대칭 전수 점검 + plan-doc fix

> F-162 후속 sweep. analysis stage 5 adapter vs discovery stage 4 adapter 의 source-grounded 의무 전수 대조 — figma 단발 누락이 아닌 stage 전반 구조적 비대칭 확인.

### 점검 결과 (F-163)

| adapter | figma 동형 위험 | 조치 |
|---|---|---|
| analysis-from-figma | (F-162 resolved) | — |
| **analysis-from-plan-doc** | **MEDIUM** (UC명/정의를 원문 인용 없이 LLM 요약) | ★ 본 cycle fix |
| analysis-from-swagger | LOW (parser verbatim / domain·rules 추정) | carry |
| analysis-from-prompt | 없음 (assumptions+confidence 이미 보유) | no-action |
| analysis-html-template | 없음 (외부 analyzer 실행 의무) | no-action |

### Fixed

- **`schemas/plan-doc-extract.schema.json`**: `uc_candidates[]` + `glossary[]` 에 `source_excerpt` (verbatim quote) + `provenance` (verbatim|inferred) 필드 추가. (optional — PATCH 호환)
- **`skills/analysis-from-plan-doc/SKILL.md`**: 절차 6/7 원문 인용 의무 + "no-simulation 의무 / 산출 자격 조건" 절 신설 (verbatim 우선 / inferred 명시 / inferred 비율 > 0 시 GO-STOP gate 노출).
- **`methodology-spec/finding-system.md`**: F-163 등록 (resolved / plan-doc fix / swagger·validator carry).

### Carry (δ 후속)

- `swagger-extract` evidence 필드 추가 (LOW / parser verbatim 이라 후순위).
- **analysis-extraction-validator 신설** — `discovery-extraction-validator` 패턴 차용 / provenance=inferred 비율 hard gate / analysis 5 adapter 공통 적용 (구조적 비대칭 근본 해소).

---

## [11.0.1] — 2026-05-27 PATCH — F-162 analysis-from-figma verbatim 검증 의무화 (외부 dogfood 발견)

> ★ δ Type 2 외부 consumer repo (mis-fe-admin EAM 통합권한조회) 실전 dogfood 에서 자연 표면화한 첫 corrective fix. `feedback_self_referential_corrective_drift.md` 가 명시적으로 기다리던 외부 채널 발견 → self-referential drift 아님 → 본 cycle fix 정당.

### 배경 (F-162)

`analysis-from-figma` 는 `discovery-from-figma` 가 가진 source-grounded 의무 (LLM 추론 금지 / node 실 인용 / grep_hit 검증) 를 **비대칭으로 결여**. `figma-extract.schema.json` 에 TEXT 노드의 verbatim 표시 텍스트 (`characters`) 를 담을 필드조차 없어, 라벨/버튼/헤더를 `get_metadata` layer name + OpenAPI 파라미터로 **추론**해 채우는 silent fallback 허용. 실 피해: consumer repo spec md 가 추론 라벨을 "✅ Figma 검증 완료" 로 GO-STOP gate 통과 → cycle 13 Figma MCP `get_design_context` 실 verbatim 추출 결과 spec ≠ Figma 갭 8건 실증.

### Fixed

- **`schemas/figma-extract.schema.json`**: `components[]` 에 `text_content` (verbatim 표시 텍스트 / TEXT 노드 의무) + `provenance` (`verbatim` | `inferred`) 필드 추가. `name` description 에 "레이어명 ≠ 표시 텍스트" 명시. (optional 추가라 기존 산출 호환 — PATCH)
- **`skills/analysis-from-figma/SKILL.md`**: 절차 2 verbatim 의무화 + 절차 3 silent skip 금지 (TEXT 노드 sub-frame `get_design_context` 재호출 의무) + provenance 태깅. "산출 자격 조건" 절 신설 (TEXT verbatim 의무 / inferred 금지 대상 / inferred 비율 > 0 시 finding+gate 노출). scope-out 의 "추정 ❌" 을 텍스트 라벨까지 확대.
- **`methodology-spec/finding-system.md`**: F-162 등록 (Status: resolved / schema+SKILL fix / validator 신설은 carry).

### Carry (δ 후속)

- analysis-figma 전용 source-grounded validator 신설 (`discovery-extraction-validator` 패턴 차용 / provenance=inferred 비율 임계 hard gate).
- 동형 비대칭 점검: `analysis-from-swagger` / `analysis-from-prompt` 등 다른 input-adapter 의 source-grounded 의무 일관성.

---

## [11.0.0] — 2026-05-26 MAJOR — v11.0.0 paradigm cascade 본격 시행 종결 (8 결단 + 5 chain stage 산출물 본격 통합)

> ★ ★ ★ ★ ★ session 48차 paradigm SSOT 확립 + session 49차 schema/skill body cascade + 본 session 안 Phase 2f-prime + sub-phase + Phase 3 + Phase 4 + Phase 5 본격 시행 종결. v11.0.0 MAJOR breaking — `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename + BE/FE 산출물 분리 paradigm 본격 + Epic/Story/Task(OP-*)/Sub-task(TASK-*) 4-level cascade + ticket=plan stage 한 곳 (R20-prime) + contract 강제 양 axis (BE swagger / FE state-map+DTCG).
>
> ## 8 결단 본격 시행 종결
>
> | # | 결단 | 시행 |
> |---|---|---|
> | 1 | `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename | ✅ schema/skill/tool/PoC 모두 cascade |
> | 2 | BE/FE 산출물 분리 paradigm (stage 별 axis 다름) | ✅ schema if/then 강제 본격 |
> | 3 | ticket = plan stage 한 곳 (R20→R20-prime) | ✅ skills/ticket-sync SKILL.md 본문 재설계 |
> | 4 | UC 유지 (User Story 추가 부재) | ✅ |
> | 5 | Epic = FE 화면 단위 (또는 BE-domain) | ✅ task-plan.epic_refs 본격 |
> | 6 | Story = cross-cut anchor (BE+FE/DB/E2E) | ✅ task-plan.story_refs + AC.story_ref |
> | 7 | OP-* (Story sibling Task entity) 신설 + TASK-*=Sub-task 명시 | ✅ operational-task.schema.json + task-plan.op_task_refs |
> | 8 | contract 강제 양 axis (BE swagger / FE state-map+DTCG) | ✅ schema if/then layer 1/2/3 hard gate |
>
> ## 본 session 시행 (Phase 2f-prime + sub-phase + Phase 3 + Phase 4 + Phase 5)
>
> ### Phase 2f-prime — `skills/ticket-sync/SKILL.md` 본문 재설계
> - 5 stage matrix (analysis/planning/spec/test/implement) × 2 phase 본격 폐기
> - **plan stage 단일** 4-level cascade 일괄 (Epic + Story + OP-* + TASK-*) 본문 본격
> - phase enum: `enter` / `exit` / `update-test-red` / `update-impl-green`
> - stage paradigm 위반 시 reject (`F-TICKETSYNC-012 stage_paradigm_violation`) 본격 정합
> - 환경 resolve prelude (DWPD issuetype_map / parent_strategy / epic_link_customfield_id / Sub-task auto-inherit B14 / Structure 자동 B15) 본격 보존
>
> ### sub-phase — `tools/planning-extraction-validator` → `tools/discovery-extraction-validator` rename
> - `git mv tools/planning-extraction-validator tools/discovery-extraction-validator`
> - workspace npm rename + package.json name + bin name 본격
> - chain-driver REQUIRED_VALIDATORS_PER_STAGE.discovery 본격
> - flows + scripts/release-readiness + 활성 docs 모두 cascade
> - backward-compat alias (`--planning` flag / `transformPlanningExtraction` function alias / dispatchValidator case 'planning-extraction-validator') 본격 보존
>
> ### Phase 3 — template body 본격 채움
> - `templates/planning/` → `templates/discovery/` rename (`git mv`)
> - `templates/spec/` 신설
> - **13 신규 template body** (`.json` + `.md` 이중 렌더링 / ADR-008 v2):
>   - `templates/discovery/discovery-spec.template.{json,md}` (2)
>   - `templates/spec/behavior-spec.template.{json,md}` + `acceptance-criteria.template.{json,md}` (4)
>   - `templates/plan/task-plan.template.{json,md}` + `epic-story-op.template.md` (3)
>   - `templates/test/test-spec.template.{json,md}` (2)
>   - `templates/implement/impl-spec.template.{json,md}` (2)
> - `templates/README.md` 본격 갱신 (5 chain stage 본격 활성)
> - `skills/_base-apply-template/SKILL.md` 인식 artifact list 21 → 27 (analysis 21 + chain 6) 본격 확장 + chain stage prerequisite 명시
>
> ### Phase 4 — 10 PoC sweep 본격
> - `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename × **10 PoC** (poc-03 / poc-04-mini / poc-05 / poc-06 / poc-07 / poc-08 / poc-09 / poc-10 / poc-11 / poc-14)
> - `derivation_source.planning_spec_path` → `discovery_spec_path` sed batch × 10 PoC (acceptance-criteria + behavior-spec + task-plan)
> - release-readiness `poc_corroboration` discovery-spec.json 우선 인식 본격
> - release-readiness `ANALYSIS_VALIDATOR_TARGETS` set 안 discovery-spec.json 본격 추가 + planning-spec.json legacy carry
> - `analysis_validator_violation` 본격 해소 (20 violations → 0)
> - `validators_violation` poc-05 chain-coverage cmd discovery-spec.json 본격 전환
>
> ### Phase 5 — v11.0.0 release
> - CHANGELOG entry 본 표기
> - version 3-way sync 10.1.1 → 11.0.0
> - workspace test 746/746 pass ✅
> - release-readiness **22/22 ready** ✅
> - skill-citation 0 stale ✅
>
> ## breaking change scope (★ v11.0.0 MAJOR 자격)
>
> ### 직접 breaking
> - 산출물 file 명 `planning-spec.{json,md}` → `discovery-spec.{json,md}` (10 PoC + active doc 정합)
> - schema `derivation_source.planning_spec_path` → `discovery_spec_path` (behavior-spec / acceptance-criteria / task-plan)
> - workspace tool `tools/planning-extraction-validator` → `tools/discovery-extraction-validator` (npm package + bin name)
> - `templates/planning/` → `templates/discovery/` + `templates/spec/` 신설
> - `methodology-spec/deliverables/17-planning-spec.md` → `17-discovery-spec.md`
> - skills/ticket-sync SKILL.md 본문 paradigm 본격 재설계 (5 stage matrix 폐기 / plan 단일 본격)
>
> ### backward-compat carry
> - tools/discovery-extraction-validator/src/cli.js — `--planning` flag alias 보존 (deprecated / 차기 v12.x retract)
> - tools/findings-aggregator — `transformPlanningExtraction` function alias + `'planning-extraction-validator'` dispatchValidator case 보존
> - release-readiness `poc_corroboration` discovery-spec.json OR planning-spec.json (legacy 둘다 인식)
>
> ## STOP-3 + paradigm 적합 점검
>
> | STOP-3 | 상태 |
> |---|---|
> | workspace test 746/746 pass | ✅ |
> | release-readiness 22/22 ready | ✅ (analysis_validator_violation 해소 + poc_corroboration 갱신) |
> | skill-citation 0 stale (245 active doc) | ✅ |
> | version 3-way 11.0.0 | ✅ (CHANGELOG + plugin.json + version-check 3-way) |
> | breaking 본격 (MAJOR 자격) | ✅ (8 결단 본격 cascade) |
>
> ★ ★ ★ ★ ★ **paradigm 본격 진전** (self-referential corrective drift ❌) — v11.0.0 MAJOR 본격 cascade 종결. session 48차 paradigm SSOT → session 49차 schema/skill body cascade → 본 session Phase 2f-prime + Phase 3 + Phase 4 + Phase 5 종결. self-celebration inflation ❌ — 본격 prod 가치 진전 paradigm 결단 8종 시행 종결.
>
> ## Lessons Learned (자산화)
>
> - **LL-v110-04** (template skill citation false-positive) — template 안 placeholder ADR/UC/BHV ID 가 skill-citation-validator 의 `\bADR-(?:[A-Z]+-)?\d{1,3}\b` 패턴 매칭 → 실 ADR 부재 시 stale citation 오류. 해소 = `ADR-<scope>-NNN` 등 `<` 포함 placeholder syntax 사용 (FP_LINE regex `<[a-z-]+>` 정합).
> - **LL-v110-05** (1 session 안 MAJOR release cascade 본격 자격) — paradigm 본격 진전 (8 결단 시행) + ≥ 22/22 release-readiness + ≥ 745+ workspace test + 0 stale citation + 3-way version sync 동시 충족 시 본격 자격. LL-v930-02 cap (1 session 1 MAJOR) 본격 정합.

---

## [10.1.1] — 2026-05-26 PATCH — C-v4.1-poc-재실행 부분 종결 (5 PoC task-plan 생성 / plan-agent e2e 입증)

> 사용자 "마지막 carry 처리하자" → option A 채택 (5 가능 PoC 전부 + spec 부재 5 = 서브-carry). additive PoC artifact / methodology 무변경 / breaking 0 = PATCH.
>
> v10.0.0 plan-agent 본격 구현 후에도 미해소였던 C-v4.1-poc-재실행 carry. 점검 결과 5 PoC (poc-03/04-mini/05/11/14) 만 prerequisite (behavior-spec + AC) 보유. 나머지 5 PoC (poc-06/07/08/09/10) 는 spec stage 미실행 = 서브-carry.
>
> | PoC | tasks | ADRs | risks | NFR | 특성 |
> |---|---|---|---|---|---|
> | poc-04-mini | 1 | 1 | 2 | 3 | FE Login + JWT (Zod ADR) |
> | poc-05 | 2 | 1 | 4 | 4 | signup + login (argon2 ADR) |
> | poc-03 | 2 | 2 | 4 | 4 | RealWorld NestJS (argon2 + JWT ADR) |
> | poc-14 | 4 | 2 | 4 | 4 | user + todo (IDOR 차단) |
> | poc-11 | 6 | 2 | 5 | 4 | ★ 사내 EFI-WEB billing characterization mode |
> | **합계** | **15** | **7** | **18** | **19** | — |
>
> - **schema 정합**: task-plan.schema.json VALID 5/5 (task granularity 1-3 AC / ADR alternatives ≥3 / risks severity enum / NFR ISO 25010:2023 9 characteristic).
> - **Type 1 self-run corroboration ≥ 5** (§8.1 strict ≥ 2 충족 / chain harness plan stage e2e 입증 / 다른 도메인+stack 단일 PoC 과적합 회피).
> - **STOP-3**: release-readiness 20/20 (보존) + skill-citation 0 stale + version 3-way 10.1.1 + breaking 0 = PATCH.
> - **잔여 서브-carry**: poc-06/07/08/09/10 (spec stage 미실행 / 각 PoC × behavior-spec + AC 실행 의무 = task-plan 보다 더 heavy / v10.x).
>
> DEC-2026-05-26-poc-task-plan-5. Partial resolve C-v4.1-poc-재실행 (5/9 = 56%).

## [10.1.0] — 2026-05-26 MINOR — discovery-from-{figma, swagger, nl-md} 3 SKILL.md body 본격 구현 (DEC-2026-05-26-input-skill-roles §2 carry 종결)

> 사용자 "잔여 적용" 결단 (v10.0.4 trigger carry 보류 권고 override) → option α 본격. additive doc / breaking 0 / 신규 기능 = MINOR.
>
> v10.0.4 가 paradigm (analysis-from-* baseline ↔ discovery-from-* scope 진입 timing/책임 분리) 만 명문화하고 `discovery-from-{figma, swagger, nl-md}` 3종은 light placeholder 로 두었던 것을 **본격 SKILL.md body 작성**. `discovery-from-analysis-output` (v9.0.0 본격 / 137 line) pattern 정합 / 책임 범위·입력·산출·no-simulation·절차·인용 6 섹션.
>
> | skill | source 채널 | UC 추출 | NFR axis | line |
> |---|---|---|---|---|
> | `discovery-from-figma` | figma file + selected frame | MCP 4 도구 → frame nodes → 사용자 flow | 부 (a11y/responsive/transition) | ~70 |
> | `discovery-from-swagger` | openapi.yaml / swagger.json | OpenAPI parse → operation 별 summary/description → UC + I/O contract + schema constraint | 부 (security/rate-limit/SLA) | ~65 |
> | `discovery-from-nl-md` | markdown 기획문서 / in-conversation NL | structural parse (heading/paragraph/sentence index) → 사용자 flow 패턴 | ★ **1차 채널** (NL 만이 명시 NFR) | ~80 |
>
> 각 entry source_grounded_evidence 의무: figma=`figma:<file_id>:<node_id>` / swagger=`openapi:<path>:<operationId>` / nl-md=`doc:<filepath>:<para>:<sentence>` 또는 `prompt:<message_id>:<line>`. 산출 = `.aimd/output/planning-spec.json`. LLM fabrication ❌ (특히 nl-md NFR — verbatim quote 권장 + `planning-extraction-validator` grep_hit_count > 0 강제).
>
> - **동반 doc 갱신**: `methodology-spec/lifecycle-contract.md` §Input 어댑터 timing 분리 (4 모두 본격) + `guides/first-prompt-cookbook.md` §2.1 timing note + `decisions/DEC-2026-05-26-input-skill-roles.md` §2 carry resolved 표기.
> - **STOP-3**: release-readiness 20/20 (보존) + skill-citation 0 stale + version 3-way 10.1.0 + breaking 0 = MINOR.
> - **잔여 carry**: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy validation / v10.x / Type 1 self-run).
>
> DEC-2026-05-26-discovery-input-bodies. Resolves DEC-2026-05-26-input-skill-roles §2 carry.

## [10.0.4] — 2026-05-26 PATCH — C-v4.1-input-skill-이관 결단 종결 (analysis-from-* ↔ discovery-from-* timing 분리 paradigm / option α light)

> 사용자 "최초에 분석은 analysis 에서 하는데 한번 분석이 끝난 프로젝트는 그냥 다양한 input 을 받도록 하고 싶다" → option α light 채택. additive doc / breaking 0.
>
> **paradigm 명문화** (baseline-delta 운영 모델 입력 측면 / v10.0.1 정합):
>
> | set | timing | 책임 | skill |
> |---|---|---|---|
> | `analysis-from-*` (4) | 최초 1회 (legacy baseline 수립) | analysis 산출물 (visual-manifest / inventory / domain 등 canonical global) | `analysis-from-{figma, swagger, prompt, plan-doc}` ★ 모두 본격 구현 |
> | `discovery-from-*` (4) | 신규 건마다 (scope 진입 trigger) | UC + intent + flow → planning-spec | `discovery-from-{analysis-output(★본격), figma(light placeholder), swagger(light), nl-md(light)}` |
>
> 같은 source(figma/swagger/NL md) 라도 baseline 시 vs scope 진입 시 = **다른 목적/다른 산출**. 양쪽 set 평행 유지 / 중복 ❌ / 다른 axis ✅.
>
> - **시행** (additive doc / breaking 0):
>   - `skills/discovery-from-{figma, swagger, nl-md}/SKILL.md` 3 placeholder description 갱신 (paradigm 반영 + analysis-from-* timing 분리 명시 + use case 트리거 carry 표기).
>   - `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 다음에 **§Input 어댑터 timing 분리** 신설 (두 set 평행 표).
>   - `guides/first-prompt-cookbook.md` §2.1 discovery 섹션 timing 분리 note.
>   - `decisions/DEC-2026-05-21-chain-discovery-plan-stage-도입.md` carry 표 `C-v4.1-input-skill-이관` ✅ 종결 표기 + option α light 결단 명시.
> - **STOP-3**: release-readiness 20/20 ready (보존) + skill-citation 0 stale + version 3-way 10.0.4 + breaking 0 = PATCH.
> - **잔여 carry (use case 트리거 의존)**: `discovery-from-{figma, swagger, nl-md}` 본격 구현 = 해당 채널로 scope 진입하는 실 사용자 등장 시 별도 PATCH/MINOR. 현 사내 배포 전 단계 ROI 정합 (light placeholder 유지). 그 외: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy / v10.x).
>
> DEC-2026-05-26-input-skill-roles. Resolves C-v4.1-input-skill-이관.

## [10.0.3] — 2026-05-26 PATCH — 잔여 carry quick wins 종결 (macOS env test fix + session-재시작-검증 표기)

> 사용자 "남은 carry 처리하자" → 잔여 4 carry 정밀 점검 → Quick wins(env + session-LL) 채택. corrective / breaking 0.
>
> - **env test fix**: `tools/chain-coverage-validator/src/validator.js` `autoDetectProjectRoot` cross-platform path normalization. POSIX `dirname()` 이 `\` 를 path separator 로 안 봐서 Windows path 입력 시 `'.'` 반환 → dirname **전** backslash→slash 정규화로 해소. → `node --test tools/chain-coverage-validator/test/validator.test.js` **38/38 pass** (이전 37/38) / **release-readiness 19/20 → 20/20 ready**.
> - **C-v4.1-session-재시작-검증 종결 표기**: DEC-2026-05-21 carry 표 안 해당 row 에 ✅ + LL-v4-04 자산화 location 명시 (DEC-05-17 + DEC-05-21 등재 완료 / protocol 자산 = 별도 코드/문서 작업 없음).
> - **STOP-3**: workspace all pass + release-readiness **20/20** + skill-citation 0 stale + version 3-way 10.0.3 + breaking 0 = PATCH.
> - **잔여 carry (사용자 결단 보류)**: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy / v10.x) + C-v4.1-input-skill-이관 (figma·swagger 실 중복 / discovery-from-figma 는 v4.1 PLACEHOLDER 그대로 / 3 옵션 결단 의무).
>
> DEC-2026-05-26-quick-carry-close.

## [10.0.2] — 2026-05-26 PATCH — v10.0.0 gate 재번호 prose+flow coherence (이전 session WIP 통합 + prose 전면 정합)

> v10.0.0 이 machine 층(stage-graph gate map #1~#5)만 하고 **개별 phase-flow gate phase + plan agent/skills/templates + guides·README·lifecycle prose** 를 미정합으로 남긴 drift 청산. corrective / breaking 0.
>
> **발견 경위**: 사용자 "WIP부터 같이 들여다보자" → working tree 의 이전 session 중단 작업(plan-stage gate 정합 WIP) 분석 → v10.0.0 의 chain N = gate #N 가 phase-flow 렌더링 + plan agent/skills + guides·README·lifecycle prose 까지 전파 안 됨 발견. drift-validator 가 chain-flow master mermaid + 개별 phase-flow gate 번호 vs stage-graph map 정합 을 안 봐 v10.0.0/v10.0.1 STOP-3 통과한 잔존 (제 v9.0.1 코herence redux 패턴).
>
> **번호 규칙 확정**: chain N = gate #N 1:1 (#1 discovery / #2 spec / **#3 plan** / #4 test / #5 implement) / "gate id ≠ chain" framing 폐기 / plan placeholder · deferred 표기 전면 해제.
>
> - **WIP 통합** (이전 session 중단 작업 / 정합 + 정확): `flows/plan.phase-flow.{json,mermaid}`(plan **gate-3 phase 추가** / 다른 flow 와 구조 대칭) + `flows/test.phase-flow.{json,mermaid}`(gate-3 → **#4**) + `flows/implement.phase-flow.{json,mermaid}`(gate-4 → **#5**) + `agents/plan-agent.md`("gate #plan/deferred" → "gate #3 hard gate 활성") + `skills/plan-{decompose-and-sequence,risk-and-nfr}/SKILL.md` + `templates/README.md` + `templates/plan/`(신규).
> - **prose 정합 11 파일**:
>   - `methodology-spec/lifecycle-contract.md`: OUTPUT block(plan #3 / test #4 / impl #5) + 5영역 plan row 본격 + 매핑 매트릭스 plan row 본격(skills 7 + gate #3 + plan-coverage-validator) + data-contract plan 절 placeholder 해제 + tree + traceability TASK layer + gate #1~#4 → #1~#5.
>   - `methodology-spec/skills-axis.md`: §4·§7.2·§9.2 plan placeholder 해제 (plan-agent skills 7 / chain 3 본격).
>   - `methodology-spec/id-conventions.md`: plan ID = task-plan TASK-*/ADR-*.
>   - `methodology-spec/deliverables/22-traceability-matrix.md`: gate #1~#5 + TASK layer.
>   - `README.md`: CHAIN block(plan #3 / test #4 / impl #5) + scenario plan step 본격 + validator block(gate #1~#5 + plan-coverage-validator) + tree placeholder 해제.
>   - guides 4종: `chain-harness-guide.md` mermaid + sequenceDiagram + "gate id ≠ chain" 폐기 / `getting-started.md` 5-5 plan 본격 + gate 번호 / `first-prompt-cookbook.md` 2.3 Chain 3 plan skill-map / `common-errors.md`(검증).
>   - briefing 2종: `01-main.md` flow 다이어그램 + skill tree + "5번의 게이트" / `slides/methodology-deck.md` value block + flow + chain 책임 표 + revisit 8 + asset 표 + multiagent.
>   - `flows/README.md`: master SSOT "5 gate (chain N = gate #N)" + plan.phase-flow 본격.
> - **STOP-3**: drift state-flow(6=6) + chain-layout(5 stage / **31 phase** = +1 plan gate-3) + phase-flow 짝(plan/test/implement) 0 breaking + release-readiness 19/20(env fail 1 = macOS Windows-path test / 본 PATCH 무관) + skill-citation 0 stale + version 3-way 10.0.2 + breaking 0 = PATCH.
>
> DEC-2026-05-26-gate-renumber-coherence. Resolves v10.0.0 phase-flow + prose drift 잔존 (machine 층 완성 후 렌더링/prose 미정합).

## [10.0.1] — 2026-05-26 PATCH — baseline-delta 운영 모델 문서화 (v4.1 폐기 브랜치 carry 점검 → 실행)

> 사용자 "정리해줘 그리고 carry 실행해줘". 폐기된 v4.1 브랜치(feat/v4.1-*) 개념을 현 main(v10.0.0)과 대조한 결과, discovery/plan stage·hooks 정합·plan-agent·traceability 확장은 v9.0.0~v10.0.0 에서 모두 완성. **유일 미해소 깨끗한 doc carry = DEC-2026-05-21 `C-v4.1-baseline-delta-운영-문서화`** 실행. additive doc / breaking 0.
>
> - **신설**: `methodology-spec/baseline-delta-operating-model.md` — "초기 1회 full analysis + 신규 건 delta 갱신" 운영 모델.
>   - 두 baseline axis 구분: 분석 baseline(canonical global `.aimd/output/`) vs 품질 baseline(`baseline-<date>.json` / ADR-010 ratchet).
>   - 운영 cadence 3단계: 초기 full 1회 → 신규 건 scope delta(`related_artifacts` 상속 / 재분석 ❌) → 레거시 변경 시 변경 영역만 재분석 + M4 `sync_state` + `chain-driver sync` 통제 cascade.
>   - baseline carry 규약: 단일 source 참조 / drift 자동감지·cascade 수동 / 품질 baseline 단조(ratchet up) / iter-N carry(`inherited_from.carry_artifacts`).
>   - 70~80% axis 정합 (운영 모델 = process cadence / metric 불변).
> - **carry resolve**: DEC-2026-05-21 carry 표 `C-v4.1-baseline-delta-운영-문서화` ✅ 종결 표기 + DEC-2026-05-26-baseline-delta-operating-model 신설.
> - **STOP-3**: workspace 737/737(보존) + release-readiness target 10.0.1 + skill-citation 0 stale + version 3-way 10.0.1 + breaking 0 = PATCH.
> - **carry (점검 중 식별)**: poc-재실행(기존 PoC plan-spec 추가 / v10.x) + input-skill-이관(`analysis-from-*` ↔ `discovery-from-*` 공존 처분 결단) + lifecycle-contract plan placeholder prose drift(v10.0.0 잔존 점검).
>
> DEC-2026-05-26-baseline-delta-operating-model. Resolves DEC-2026-05-21 §carry C-v4.1-baseline-delta-운영-문서화.

## [10.0.0] — 2026-05-25 MAJOR — Phase 4-4' axis A plan stage paradigm 본격 구현 (★ ★ gate 번호 재정렬 widespread breaking / chain N = gate #N 1:1 INTERNAL CONVENTION) + cooling-off paradigm 영구 폐기 재확인

> session 47차 / 본 conversation 안 5 commit cluster 통합 + 1 release ceremony.
>
> **trigger 발화 chain** (★ paradigm dispute → 본격 시행):
> 1. 사용자 "이번 session 에서 뭐하면 되나" → "Phase 4-4' 준비 (plan 작성만)"
> 2. plan-mode 시행 → `~/.claude/plans/jiggly-mapping-hopper.md` 작성 완료
> 3. ExitPlanMode 후 사용자 "진행" → ★ paradigm STRONG-STOP signal 보고 → option A (차기 session 시행)
> 4. 사용자 "cooling-off 를 왜하는건가?" → ★ ★ paradigm 메타 dispute
> 5. 사용자 "cooling-off 아예 없애도 되는거 아닌가?" → AskUserQuestion ★ A. 폐기 + ★ B. 본 conversation Cluster 2~5 시행
>
> **★ ★ ★ ★ ★ ★ ★ paradigm 본격 결단** (★ session 47차 prod 가치 진전):
> - **cooling-off paradigm 영구 폐기 재확인** (DEC-2026-05-25-cooling-off-영구-폐기-재확인) — v2.2.0 (2026-05-08) "패기해줘" 폐기 → v9.x 재도입 cycle (19일 만) → v10.0.0 폐기 재확인 / paradigm-without-teeth 본격 입증 (actual 발동 case 0 / 사용자 push back 2회 / 본 레포 cadence 5 release/1day)
> - **chain N = gate #N 1:1 INTERNAL CONVENTION 본격 정합** (DO-178C SOI / IEC 62304 isomorphic 사상 / 직접 standard 표기 ❌ / official-docs-checker REVISE-1 흡수)
>
> **시행 — 5 Cluster commit (★ widespread breaking)**:
>
> | Cluster | scope | commit |
> |---|---|---|
> | 1 (★ 외부 session) | B1+B2 stage-graph.js gate 재번호 (plan='#3' / test='#4' / impl='#5') + state.schema.json enum +'#5' / +'plan' | `e5c8672` |
> | 2 | B4+B5 sdlc-4stage-flow.json revisit_edges 8→9 + gate 재번호 + plan.phase-flow.json placeholder=false + 2 DEC 신설 + INDEX 갱신 | `676f948` |
> | 3 | B3+B6 ADR-CHAIN-001 chain 4단계→5단계 + ADR-CHAIN-002 4 gate→5 gate + plan gate prompt | `142852e` |
> | 4 | B7 F-CHA-001 trio integration test 6 시나리오 신규 (validator critical + cli exit 1 + hooks deny + trio 통합 + gate enum 정합 + requiredValidators) | `568bcb2` |
> | 5 | B8 CLAUDE.md + README + agents-axis + chain-driver/README sweep + release-readiness #18+#19+#20 신규 criterion | `4e28619` |
>
> **★ ★ ★ ★ ★ ★ ★ STOP-3 달성**:
> - workspace test **737/737 pass** (731 → 737 / +6 / F-CHA-001 trio integration test 신규)
> - **release-readiness 20/20 ready:true** (17 → 20 / #18 gate_enum_consistency + #19 legacy_4_stage_expression_absent + #20 plan_gate_operational 신규)
> - drift-validator 7 pair / 0 breaking / state-flow consistency PASS / chain layout PASS
> - skill-citation 0 stale (★ DEC-2026-05-25-axis-a-phase-4-4-prime 신설로 회복)
> - version 3-way 10.0.0 (CHANGELOG / plugin.json / package.json)
>
> **★ BREAKING CHANGE**:
> - gate.id enum 의미 재할당 — test '#3'→'#4' / implement '#4'→'#5' / plan '#3' 신규
> - state.json 영속 last_gate.stage='plan' 신규 진입 자격 (외부 사용자 state.json reset 또는 manual migration 의무 / 실측 poc-14: last_gate=null 영향 ❌)
> - plan.phase-flow.json version 0.1.0-placeholder → 1.0.0
> - cooling-off ≥24h paradigm = ★ ★ 영구 폐기 재확인 (★ 재도입 자격 ≥2 PoC corroboration + Adzic SBE strict 정합 의무 / 사실상 ❌)
>
> **★ ★ ★ paradigm 메타 인지** (★ session 47차 paradigm 진화 본격):
> - **LL-v1000-01** — cooling-off paradigm-without-teeth 본격 입증 (actual 발동 case 0 / 사용자 push back 2회 / DEC-2026-05-08 "패기해줘" 19일 만 재도입 cycle 차단)
> - **LL-v1000-02** — paradigm 부활 cycle = self-referential corrective drift 의 본격 paradigm 사례 (★ AI 가 ★ 영구 폐기된 paradigm 을 ★ 19일 만 재도입 carry note 안에 표기 = paradigm honesty 위배)
> - **LL-v1000-03** — 사용자 메타 질문 = STRONG-STOP signal + ★ paradigm dispute 자격 (Auto Mode 안에서도 메타 dispute 자격 보고 의무)
> - **LL-v1000-04** — paradigm 격상 자격 = ≥2 PoC corroboration + Adzic SBE strict 정합 의무 (1 사건 일반화 + AI persona 권고 + industry case 단순 인용 = paradigm 격상 자격 부재)
> - **LL-v1000-05** — INTERNAL CONVENTION paradigm framing 본격 정합 (chain N = gate #N 1:1 / DO-178C SOI / IEC 62304 isomorphic / 직접 standard 표기 ❌ / official-docs-checker REVISE-1 흡수)
>
> **★ session 안 4 release cap (LL-v930-02) 정합**: session 47차 = ★ 본 v10.0.0 release **1회** (Cluster 1 외부 session e5c8672 + Cluster 2~5 본 conversation = 통합 1 release).
>
> **차기 carry**:
> - Phase 4-5 (v10.1.0 MAJOR / ticket subsystem 6-stage migration / Type 2 외부 사용자 ≥1 corroboration trigger 의무 / deadline 없음 / OSS 채택 의존)
> - methodology-spec/ + decisions/ + schemas/ + history doc + skill SKILL.md 안 "4단계" 표현 잔존 (≈25 files / historical SSOT 보존 / 별 patch release carry 자격)
> - DEC-2026-05-25-axis-a-phase-4-4-prime + DEC-2026-05-25-cooling-off-영구-폐기-재확인 2 DEC SSOT 보존
>
> Resolves F-CHA-001 본격 해소 (Senior BLOCKER-2 trio integration test 6/6 pass) + F-CHA-003 5 axis 본격 해소 (gate 번호 재정렬 + state.schema enum + flows + ADR + RR criterion).

---

## [9.3.0] — 2026-05-25 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-4 minimal (★ gate #plan trio enforcement 본격 활성 / Senior BLOCKER-2 잔여 본격 해소 / additive only / breaking 0)

> session 46차 연속 4번째 release / v9.2.0 직후 사용자 "다음 진행" + "B cooling-off retract" + "추천 (옵션 1 minimal)" 결단 → Phase 4-4 minimal scope 본격 시행.
>
> **★ ★ paradigm 메타 인지** (LL-v930-01): decision_cadence_24h_cooling_off paradigm retract 자격 본격 ✓ — minimal scope (additive only / breaking 0) + Senior BLOCKER-2 잔여 본격 해소 + 사용자 명시 결단 trigger. ★ ★ Phase 4-4 full scope (Cluster 1 X gate 번호 재정렬 widespread breaking) = ★ retract 자격 ❌ / 별 session v10.0.0 MAJOR cooling-off 의무.
>
> **시행** (additive only / breaking 0 / Senior BLOCKER-2 잔여 본격 해소):
> - **stage-graph.js `getGateForStage('plan')` = null → '#plan'** (1 line / generic trio mechanism 본격 작동 자격 확보 / 번호 부여 ❌ / Cluster 1 X 재번호 = Phase 4-4' v10.0.0 MAJOR carry)
> - **test +1** — `tools/chain-driver/test/stage-graph.test.js` line 41 갱신 + v9.3.0 신규 test (★ '#plan' string ID + Cluster 1 번호 부여 ❌ 정합 검증)
> - **DEC-2026-05-25-axis-a-phase-4-4 신설** (Phase 4-4 minimal scope SSOT)
>
> **★ 본격 변경 ❌ axis** (LL-v911-01 minimal scope 정합 / Phase 4-4' + 4-5 carry):
> - gate 번호 재정렬 (Cluster 1 X / discovery #1 / spec #2 / plan #3 / test #4 / impl #5) = Phase 4-4' v10.0.0 MAJOR carry
> - flows/sdlc-4stage-flow.json revisit_edges 갱신 (8 → 10) = Phase 4-4' carry
> - ADR-CHAIN-002 §1 gate UX prose 갱신 = Phase 4-4' carry
> - state.schema.json gate enum 갱신 = Phase 4-4' carry
> - ticket subsystem 6-stage migration = Phase 4-5 carry
>
> **STOP-3**: workspace 730 → **731/731 pass** (chain-driver 224 → 225 / +1) + skill-citation 0 stale + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.3.0 + breaking 0 = MINOR.
>
> **3 LL 자산화**:
> - **LL-v930-01** — cooling-off retract 자격 paradigm 본격 입증 (decision_cadence "큰 구조 결단만 24h / additive only 즉시" 정합 / Senior BLOCKER-2 잔여 minimal scope retract 자격 ✓ / full scope = 별 session 의무)
> - **LL-v930-02** — session 안 4 release 연속 cadence 본격 paradigm (★ session 43차 4 release self-referential corrective cycle 와 본격 차이 = paradigm-level prod 가치 진전 vs doc drift fix / ★ 단 4 release cap 본격 의무)
> - **LL-v930-03** — Node.js assert API 정합 paradigm (assert.notMatch ❌ / assert.doesNotMatch ✅ / test 작성 시 본격 API 정합 검증 의무)
>
> **본 session 누적 4 release** = v9.1.0 + v9.1.1 + v9.2.0 + v9.3.0.
>
> **carry (Phase 4-4' + 4-5 / 차기 session)**:
> - Phase 4-4' (v10.0.0 MAJOR / ★ ★ cooling-off ≥24h 의무 / structural / widespread breaking) — gate 번호 재정렬 (Cluster 1 X) + flows revisit_edges 갱신 + ADR-CHAIN-002 prose + state.schema gate enum
> - Phase 4-5 (v10.1.0 MAJOR / breaking + ★ ★ Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> DEC-2026-05-25-axis-a-phase-4-4. Resolves F-CHA-001 부분 해소 (plan gate ID 신설로 generic trio mechanism 본격 활성 자격 / 통합 test = Phase 4-4' carry) + F-CHA-003 Phase 4-4 minimal 부분 해소.

---

## [9.2.0] — 2026-05-25 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-3 시행 (★ DO-178C 6 layer 격상 / additive only / breaking 0)

> session 46차 연속 진입 (v9.1.1 직후) / 사용자 결단 "진행" → Phase 4-3 본격 시행. 5 release 분산 cadence (Phase 4-1~4-5).
>
> **★ ★ ★ Cluster 3 결단 본격 시행** — **AC → TASK → TC** paradigm 정합 (DO-178C 5 tier → 6 layer 격상 / System Req ↔ HLR ↔ LLR ↔ Source ↔ Test → UC ↔ BHV ↔ AC ↔ **TASK** ↔ TC ↔ IMPL).
>
> **시행** (additive only / breaking 0 / Senior risk #4 본격 흡수):
> - **A6 `schemas/traceability-matrix.schema.json` cell.task_id additive** — pattern `^TASK-[A-Z0-9_-]+-[0-9]{3}$` / optional (required ❌) / additionalProperties:false strict 정합 (properties 안 추가)
> - **A6 `tools/traceability-matrix-builder/src/builder.js` TASK layer 매핑** — `chain.taskPlan ?? null` optional input + `taskByAC` index (1 AC = 1 task / first-match / 1~3 AC 묶음 paradigm 정합) + cell.task_id 채움 (taskPlan 있을 때만) + derived_from 안 'task-plan.json' 추가
> - **test +3** — `tools/traceability-matrix-builder/test/builder.test.js`:
>   1. backward compat (taskPlan 부재 시 cell.task_id 부재 / 회귀 0)
>   2. green cell + task_id (taskPlan 입력 시 cell.task_id 채움)
>   3. yellow cell + task_id (impl missing 시 task_id 채움 / Senior risk #4 — additive only)
> - **DEC-2026-05-25-axis-a-phase-4-3 신설** (Phase 4-3 SSOT)
>
> **★ Senior risk #4 본격 흡수** (LL-v920-01): DO-178C 6 layer 격상 시 기존 PoC ratchet 분모 미영향 본격 보장 = task_id optional + first-match 매핑 + cell-level 추가만 (required ❌ / 분모 변경 ❌). 기존 PoC #05 + #14 회귀 0 본격 보장.
>
> **STOP-3**: workspace 727 → **730/730 pass** (traceability-matrix-builder 82 → 85 / +3 TASK layer test) + skill-citation 0 stale + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.2.0 + breaking 0 = MINOR.
>
> **3 LL 자산화**:
> - **LL-v920-01** — TASK layer additive only paradigm 본격 입증 (Senior risk #4 회피 / DO-178C 6 layer 격상 + 기존 PoC 분모 미영향 본격 보장)
> - **LL-v920-02** — schema field add MINOR cadence paradigm 본격 입증 (optional schema field + properties 안 추가 + required 불포함 = backward compat / criterion add precedent 동형)
> - **LL-v920-03** — 3 release 연속 cadence 본격 입증 (session 46차 v9.1.0 + v9.1.1 + v9.2.0 / additive only / cooling-off ❌ 자격 본격 / Phase 4-4 v10.0.0 MAJOR = structural / cooling-off ≥24h 의무)
>
> **본 session 누적 3 release** = v9.1.0 (Phase 4-1) + v9.1.1 (Phase 4-2) + v9.2.0 (Phase 4-3).
>
> **carry (Phase 4-4~4-5 / 차기 session)**:
> - Phase 4-4 (v10.0.0 MAJOR / ★ cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 + revisit_edges + gate #plan trio enforcement (★ Senior BLOCKER-2 잔여)
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + ★ ★ Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> DEC-2026-05-25-axis-a-phase-4-3. Resolves F-CHA-003 Phase 4-3 부분 해소 (traceability TASK layer 종결 / 5 axis 종결 / gate trio + ticket migration = Phase 4-4+4-5 carry).

---

## [9.1.1] — 2026-05-25 PATCH — axis A plan stage paradigm 본격 구현 Phase 4-2 시행 (additive only / breaking 0)

> session 46차 연속 진입 (v9.1.0 직후) / 사용자 결단 "gogo" → Phase 4-2 본격 시행. 5 release 분산 cadence (Phase 4-1~4-5).
>
> **시행** (minimal scope / additive only / breaking 0):
> - **A4 `agents/plan-agent.md` body** (placeholder → body) — frontmatter `skills:` 7 skill 사전 주입 (3 plan-* + 4 base utility / spec-agent.md 동형 paradigm) / 책임 범위 + Absolute priorities 7개 + 호출 절차 8 step + 산출 자산 4종
> - **A5 `tools/chain-driver/src/gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.plan 추가** — `plan: ['plan-coverage-validator', 'schema-validator']` 1 line additive
> - **test +1** — `tools/chain-driver/test/gate-eval.test.js` `requiredValidators('plan')` 본격 검증 test 신규
> - **DEC-2026-05-25-axis-a-phase-4-2 신설** (Phase 4-2 SSOT)
>
> **★ minimal scope 본격 결단** (LL-v911-01):
> - hooks-bridge.js TRIGGER_PATTERNS = 이미 v9.0.0 안 plan stage 등록 ✅ (추가 시행 ❌)
> - stage-graph.js getGateForStage('plan') = null 유지 (★ Cluster 1 X 재번호 = Phase 4-4 v10.0.0 MAJOR carry)
> - gate-eval outcome enforcement plan 분기 = ★ plan-coverage-validator 자체 안 본격 작동 / gate-eval generic findings (critical/high/medium/coverage_pct) 본격 작동 = 추가 분기 ❌
>
> **STOP-3**: workspace 726 → **727/727 pass** (chain-driver 223→224 / +1 신규 plan validator test) + skill-citation-validator **0 stale** (plan-agent body 신규 cross-ref 모두 existing) + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.1.1 + breaking 0 = PATCH.
>
> **2 LL 자산화**:
> - **LL-v911-01** — minimal scope Phase 본격 진입 paradigm (A4 body + A5 1 line additive / 본격 변경 ❌ axis 본격 식별 = quality risk 회피 + roll-back 자격 본격 보장)
> - **LL-v911-02** — 후속 Phase 의 자연 cadence 본격 입증 (Phase 4-1 의 자연 후속 = 같은 session 안 본격 연속 시행 자격 / "gogo" 결단 / additive only / cooling-off ❌ / 별도 DEC + 별도 release entry = paradigm 정합)
>
> **carry (Phase 4-3~4-5 / 차기 session)**:
> - Phase 4-3 (v9.x MINOR / additive) — A6 traceability subtask_ids.chain3_plan additive
> - Phase 4-4 (v10.0.0 MAJOR / cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 + revisit_edges + gate #plan trio enforcement (★ Senior BLOCKER-2 잔여 carry)
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> DEC-2026-05-25-axis-a-phase-4-2. Resolves: F-CHA-003 Phase 4-2 부분 해소 (agent body + validator 등록 완료 / gate trio enforcement + traceability layer = Phase 4-3~4-4 carry).

---

## [9.1.0] — 2026-05-25 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-1 시행 (★ ★ ★ ★ ★ paradigm-level / additive only / breaking 0)

> session 46차 / 사용자 결단 "PoC 안 할꺼야 / 플러그인 적용 못했던 것 위주" + "axis A 본격 paradigm 명시 직접 응답" + "β cadence" + "진행" → ★ ★ paradigm-level 결단 (45차 carry "ζ-1 의식적 제외" 본격 retract). 4원칙 ladder full (Phase 1.1~1.6 깊이 숙지 + plan.md 작성 / Phase 2 3 agent 병렬 토론 / Phase 3 묶음 결단 Cluster 1~8 / Phase 4-1 본격 시행).
>
> **Phase 2 3 agent 본격 결과**:
> - Senior **REVISE-2 @ 0.81** — 2 BLOCKER (Phase 4-3 v10.0.0 scope 본격 과대 → 분리 cadence / gate #plan trio enforcement silent sink → exit code contract 명시) + 5 risk + Cluster 4 수정
> - 공식 docs **REVISE-1/2/3** (BLOCKING ❌) — DO-178C 6 layer GREEN + severity_floor 사내 해석 명시 / Nygard ADR 5 기준 "≥30% task 영향" 오귀인 → 사내 구체화 + 보안/규제 axis 추가 / ISO 25010 SQuaRE 8 → 9 (2023 Safety 신설) / estimation 표준 외 신설 paradigm
> - Industry **isomorphic GREEN** + REVISE-1 — 6 production cases (GitHub Copilot Workspace Task→Spec→Plan→Code / Cursor Plan Mode Shift+Tab / Aider /ask↔/code + Architect mode / AWS AI-DLC Workflow / ThoughtWorks GenAI for forward engineering / GitHub Community #142971) / Plan stage 산업 production 다수 isomorphic 본격 입증
>
> **Cluster 1~8 본격 결단** (사용자 묶음 결단 / Phase 3 종결):
> - 1 (gate 번호): X (재번호) + 분리 cadence — Phase 4-4 단독 v10.0.0 carry
> - 2 (NFR severity floor): high+critical + 사내 해석 표기 — DO-178C GREEN
> - 3 (TASK 위치): AC→TASK→TC — DO-178C 6 layer 정합
> - 4 (cross-cut): task→ADR + AC↔NFR 양방향 + task→RISK + adr→behavior 역방향 — Senior REVISE-2
> - 5 (ticket 동반): 분리 carry (v10.1.0 MAJOR) — Senior BLOCKER-1
> - **6 (산출물 명명)** ★ 사용자 명시: **`task-plan.json`** (Senior 권고) — discovery (planning-spec) ↔ plan (task-plan) 명독 분리
> - **7 (ADR 5 기준 출처)** ★ 사용자 명시: Nygard 5 category 기반 사내 구체화 + 보안/규제 axis 추가
> - **8 (Type 2 carry deadline)** ★ 사용자 명시: v10.1.0 release 자격 = Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> **Phase 4-1 본격 시행** (additive only / breaking 0 / Senior REVISE 흡수 + 공식 docs REVISE 흡수 + Industry REVISE 흡수):
>
> - **A1 `schemas/task-plan.schema.json` 신설** — planning-spec.schema.json template 차용 / meta + derivation_source + tasks[] + adrs[] + risks[] + nfr_allocation[] + rollback_strategy + cross_links / additionalProperties:false strict / task granularity schema-level enforce (ac_refs.maxItems:3) / alternatives ≥3 schema-level enforce / ISO 25010:2023 SQuaRE 9 enum (Safety 신설) / Nygard 5 category + security_compliance enum
> - **A2 `tools/plan-coverage-validator` workspace 신설 (npm 21번째)** — exit code contract (0=ok / 1=blocking / 2=usage-error / Senior BLOCKER-2 흡수) + 5 validator 함수 (validateTaskCoverage + validateNfrAllocation + validateTaskGranularity + validateDependencyCycle + validateRiskSeverity) + **28/28 test pass** (5 suite 23 unit + 1 suite 5 Senior BLOCKER-2 integration scenario)
> - **A3 plan-* 3 skill body** (placeholder → body) — `plan-decompose-and-sequence` (task 분해 + DAG topological sort) + `plan-architect-decisions` (ADR 작성 / Nygard 5 category 사내 구체화 + 보안/규제 axis) + `plan-risk-and-nfr` (3중 망 risk + NFR allocation hard gate + rollback)
> - **DEC-2026-05-25-axis-a-phase-4-1 신설** (★ 본 release 의 paradigm SSOT)
>
> **STOP-3**: workspace **726/726 pass** (698 → 698+28 / 무회귀) + skill-citation-validator **0 stale** (DEC 신설 후 7 dead-link 해소) + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.1.0 + breaking 0 = MINOR.
>
> **carry (Phase 4-2~4-5 / 차기 session)**:
> - Phase 4-2 (v9.x PATCH / additive) — A4 plan-agent body + A5 chain-driver stage-graph/gate-eval plan 분기
> - Phase 4-3 (v9.x MINOR / additive) — A6 traceability-matrix subtask_ids.chain3_plan additive
> - Phase 4-4 (v10.0.0 MAJOR / cooling-off ≥24h / structural) — A7+A8 gate 번호 재정렬 + revisit_edges
> - Phase 4-5 (v10.1.0 MAJOR / breaking + Type 2 trigger) — ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무
>
> **4 LL 자산화**:
> - **LL-v910-01** — self-referential corrective drift retract paradigm 본격 입증 (45차 carry "ζ-1 의식적 제외" 의 본격 retract / 사용자 명시 결단 trigger + paradigm-level scope + release-readiness criterion add 가 아닌 stage 본격 신설)
> - **LL-v910-02** — β cadence 본격 활용 paradigm (paradigm-level 결단 시 Phase 1~3 본 session / Phase 4 시행 차기 session default / 단 사용자 명시 "진행" 시 retract 자격 — additive only scope 한정)
> - **LL-v910-03** — Senior BLOCKER-2 exit code contract paradigm 본격 입증 (plan-coverage-validator exit code contract 본격 명시 + ≥ 5 통합 test 의무 = drift-validator silent sink LL-v903-01 + chain-coverage-validator default projectRoot LL-v904-01 동형 paradigm 회피)
> - **LL-v910-04** — 3 agent 병렬 토론 본격 paradigm 입증 (Senior REVISE-2 + 공식 docs REVISE-1/2/3 + Industry isomorphic GREEN 3 axis 본격 토론 정합 / Senior 2 BLOCKER 흡수 → Phase 4-3 v10.0.0 scope 본격 축소)
>
> DEC-2026-05-25-axis-a-phase-4-1. Resolves: F-CHA-003 (plan stage paradigm 위배) Phase 4-1 부분 해소 (schema + validator + skill body / agent body + gate + traceability = Phase 4-2~4-5 carry).

---

## [9.0.6] — 2026-05-24 MINOR — Phase 2 LL-v903 follow-up 묶음 (LL-v903-01 scope-out + LL-v903-03 release-readiness #17 marketplace.json stage sync + LL-v906-01/02 자산화)

> v9.0.5 release 직후 사용자 결단 "진행 하자" → "A. 모두 순차 (3 release)" → Phase 2 = 본 v9.0.6 MINOR. additive criterion / breaking 0. criterion add precedent v8.6.0/v8.9.0 일관 MINOR.
>
> **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v5 / 5회 연속 재발)**: v9.0.3 carry note "LL-v903-01 drift-validator silent sink → exit ≥ 1 hard gate 전환" 시행 직전 사실 검증 시 ★ ★ ★ 사실 오류 발견 — `tools/drift-validator/src/cli.js:292` `process.exit(totals.breaking > 0 || totals.errors > 0 ? 1 : 0)` ★ 이미 hard gate. v9.0.3 점검 명령 `node ... 2>&1 | tail -30; echo "EXIT=$?"` 의 `$?` = ★ tail 의 exit code (= 0 / 정상), drift-validator 자체 exit code 가 아님 (bash pipe + tail exit code misunderstand).
>
> **사용자 묶음 결단**: D1 LL-v903-01 scope-out (★ 사실 오류 / 이미 hard gate) / D2 LL-v903-03 시행 — release-readiness check17 신설 / D3 silent test sink 정정 (release-readiness.test.js 13→17) / D4 v9.0.6 MINOR release.
>
> **시행** (additive criterion / breaking 0):
> - **LL-v903-03 시행**: `scripts/release-readiness.js` `check17_marketplaceStageSync()` 함수 신설 + main results array 추가. 검사 대상 = `.claude-plugin/marketplace.json` `plugins[0].description`. 검사 axes 3종: ① "6단계 chain harness" 또는 "6-stage chain harness" 표기 (regex) ② 5 stage name (discovery/spec/plan/test/implement) 모두 포함 ③ legacy "planning →" 미포함. delegated_to = MAJOR stage change cascade enforcement.
> - **LL-v906-02 silent test sink 정정**: `scripts/test/release-readiness.test.js` 가 hard-coded 13 → 실 16/17 stale 누적 carry 발견. workspace test (`npm test --workspaces`) 가 `scripts/test/` 미포함 = silent test sink. **시행**: hard-coded 13 → 17 갱신 (3 location) + criterion ids array 4 추가 (code_pointer_coverage + graph_integrity + preflight_tools + marketplace_stage_sync). 10/14 fail → **14/14 pass** ✅.
> - **release ceremony**: plugin.json + package.json 9.0.5 → 9.0.6 (3-way sync) + CHANGELOG 본 entry + DEC-2026-05-24-v906-marketplace-stage-sync-check + INDEX 최상단 + STATUS session 43차 v9.0.6 entry + CLAUDE.md sync.
>
> **STOP-3**: workspace 698/698 pass (보존 / scripts/test/ 미포함 = LL-v906-02 carry) + release-readiness.test.js **14/14 pass** (10→14 / 4 fail fix) + release-readiness **17/17 ready:true** (16→17 / check17 신설 통과) + chain-coverage-validator 38/38 (보존) + skill-citation 0 stale (보존) + drift-validator 0 breaking (보존) + version 3-way 9.0.6 + breaking 0 = MINOR.
>
> **3 LL 자산화**:
> - **LL-v906-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v5 (5회 연속 재발 / LL-fsim-11 + LL-v902-01 + LL-v903-01(scope-out 본격 입증) + LL-v904-01 + LL-v905-01 정합 / paradigm enforcement 본격 입증대 v5 / ★ carry note 자체도 검증 의무 / bash pipe + exit code 사실 misunderstand 회피 cadence)
> - **LL-v906-02** — silent test sink paradigm 본격 발견 (`scripts/test/` workspace test 외 / `npm test --workspaces` 미포함 → release-readiness.test.js stale 누적 carry / v+1 carry — workspace 통합 또는 hook gate enforcement)
> - **LL-v906-03** — criterion add cadence paradigm 본격 정착 (v8.6.0 #14 preflight + v8.9.0 #15 graph + v8.9.0 #16 code-pointer + v9.0.6 #17 marketplace = MINOR 일관 / semver 정합 additive)
>
> **차기 session carry** (deadline 없음):
> - F-MB-POC-002 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / cooling-off ≥ 24h)
> - LL-v906-02 follow-up (`scripts/test/` silent sink — workspace 통합 또는 hook gate)
> - F-SIM-003 strict_mode v+1 default 전환 = v9.0.7 Phase 3 (본 session 안 시행 중)
>
> DEC-2026-05-24-v906-marketplace-stage-sync-check. Resolves LL-v903-03 + LL-v903-01 (scope-out).

## [9.0.5] — 2026-05-24 PATCH — Phase 1 F-MB-POC-001 5 PoC sweep (v7.0.0 rules.json → business-rules.json rename PoC 산출물 미전파 / 시행 직전 사실 검증 보강 paradigm 재발 v4)

> v9.0.4 release 직후 사용자 결단 "진행 하자" → "A. 모두 순차 (3 release)" 묶음 결단 → Phase 1 = 본 v9.0.5 PATCH. additive doc / breaking 0.
>
> **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v4 / 4회 연속 재발)**: v9.0.4 carry note "poc-03 산출물 drift 별 plan" single PoC 가정이 시행 직전 사실 검증 시 5 PoC 광범위 drift 로 진화 (poc-03 + 06/07/08/11 모두 v7.0.0 `rules.json` → `business-rules.json` rename 미전파 / F-PA-002 의 PoC 산출물 axis sub-finding) + poc-08/11 더 깊은 별 convention drift 추가 발견 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker).
>
> **사용자 묶음 결단**: D1 5 PoC sweep / D2 poc-08+11 잔여 = F-MB-POC-002 carry (Y 옵션 / Senior 의도 의문 cooling-off 권장) / D3 v9.0.5 PATCH release.
>
> **시행** (additive doc / breaking 0):
> - **poc-03 special case** (2 종류 drift): `examples/poc-03-realworld-nestjs/.aimd/output/{planning,behavior,test}-spec.json` `examples/poc-03-realworld-nestjs/` repo-absolute prefix 제거 + `output/rules/rules.json` → `output/rules/business-rules.json` (replace_all sweep)
> - **poc-06/07/08 + poc-11**: `examples/poc-{06,07,08}-*/​.aimd/output/planning-spec.json` + `examples/poc-11-*/​.aimd/output/{planning,behavior}-spec.json` `input/rules.json` → `input/business-rules.json` (replace_all sweep)
> - **release ceremony**: plugin.json + package.json 9.0.4 → 9.0.5 + CHANGELOG 본 entry + DEC-2026-05-24-v905-poc-rules-rename-sweep + INDEX 최상단 + STATUS session 43차 v9.0.5 entry + CLAUDE.md sync.
>
> **★ ★ ★ self-corroboration ≥ 3 PoC full fix (§8.1 strict 정합 ✓)**:
> | PoC | v9.0.4 baseline | v9.0.5 after |
> |---|---|---|
> | poc-03 | 14 broken | **0 broken** ✅ |
> | poc-06 | 2 broken | **0 broken** ✅ |
> | poc-07 | 2 broken | **0 broken** ✅ |
> | poc-08 | 10 broken | 9 broken (1 fix / path 안 메타 embed 9 잔여 → F-MB-POC-002 carry) |
> | poc-11 | 11 broken | 7 broken (4 fix / "[source absolute]" prefix 7 잔여 → F-MB-POC-002 carry) |
>
> **STOP-3**: workspace 698/698 pass (보존) + chain-coverage-validator 38/38 (보존) + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift-validator 0 breaking (보존) + version 3-way 9.0.5 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
> - **LL-v905-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v4 (LL-fsim-11 + LL-v902-01 + LL-v903-01 + LL-v904-01 정합 / 4회 연속 재발 / paradigm enforcement 본격 입증대 v4)
> - **LL-v905-02** — Senior 의도 의문 cooling-off paradigm 본격 정착 (poc-11 "[source absolute]" prefix marker / Adzic SBE 함정 회피 cadence)
> - **LL-v905-03** — partial fix + carry 명시 paradigm (§8.1 strict 충족 + 잔여 별 axis)
>
> **차기 session carry** (deadline 없음):
> - F-MB-POC-002 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / Senior 의도 의문 cooling-off ≥ 24h)
> - LL-v903-01 + LL-v903-03 follow-up = v9.0.6 Phase 2 (drift-validator hard gate + release-readiness #1 marketplace.json grep)
> - F-SIM-003 strict_mode v+1 default 전환 = v9.0.7 Phase 3 (본 v9.0.5 fix 후 자연 가능)
>
> DEC-2026-05-24-v905-poc-rules-rename-sweep. Resolves F-MB-POC-001.

## [9.0.4] — 2026-05-24 PATCH — G axis F-SIM-003 carry corrective + 시행 직전 사실 검증 보강 paradigm 본격 재발 v3 (F-MB-VAL-001 chain-coverage-validator default projectRoot 결함)

> v9.0.3 release 직후 사용자 결단 "다음 session carry G axis 진행하자" → cooling-off skip (precedent: v8.14.1) + 본 v9.0.4 PATCH. additive tool fix / breaking 0.
>
> **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v3 / v9.0.2 + v9.0.3 동형 패턴 cadence 본격 정착)**: v9.0.3 carry note "F-SIM-003 v+1 default strict_mode 전환 carry / poc-05 14 broken paths" 시행 직전 사실 검증 시 더 깊은 fact-mismatch 발견 — 5 PoC (poc-03/04-mini/05/14/06/07) cross-ref convention 모두 PoC root 기준 일관 + chain-coverage-validator default projectRoot = `dirname(behavior)` = `.aimd/output/` 이라 path resolution 시 `output/output/...` 중복 prefix 발생 = ★ 본격 도구 default 결함. 1차 strict_mode 전환 carry 는 별 axis valid 후보 (본 fix 전 전환 시 false positive 격상 = Adzic SBE 함정).
>
> **사용자 묶음 결단**: D1 fix 옵션 B-1 default auto-detect / D2 finding ID F-MB-VAL-001 별 등재 / D3 v9.0.4 PATCH release ceremony / D4 strict_mode v+1 default 전환 carry 별 axis 보존.
>
> **시행** (additive tool fix / breaking 0):
> - **F-MB-VAL-001** (medium / 도구 default 결함): `tools/chain-coverage-validator/src/validator.js` 안 `autoDetectProjectRoot(specPath)` 함수 신설 + export. `.aimd/output/<file>.json` 패턴 자동 감지 → `dirname(p)/../..` = PoC root (Windows backslash + Unix slash 모두 처리). fallback (non-`.aimd/output/`): dirname(p) backward-compat.
> - `tools/chain-coverage-validator/src/cli.js`: `dirname` import 제거 + `autoDetectProjectRoot` import + line 66 default 변경 + help text 갱신.
> - `tools/chain-coverage-validator/test/validator.test.js`: 신규 describe block 4 test 추가 (autoDetectProjectRoot Unix + Windows + fallback + null 방어). 34 → 38 pass.
> - `tools/chain-coverage-validator/package.json`: version 0.2.0 → 0.3.0 + description 갱신.
> - **release ceremony**: plugin.json + package.json 9.0.3 → 9.0.4 (3-way sync) + CHANGELOG 본 entry + CLAUDE.md sync + DEC-2026-05-24-v904-fsim-003-deeper-fact + INDEX 최상단 + STATUS session 43차 v9.0.4 entry.
>
> **★ ★ ★ 본격 fix 입증**: poc-05 직접 invoke (비명시 `--project-root`) **14 broken paths → 0** ✅. PoC self-corroboration ≥ 2 (poc-05 14→0 + poc-04-mini 0 회귀 ❌ + poc-14 0 회귀 ❌) = §8.1 strict 정합 ✓.
>
> **★ ★ 부산물 발견 (별 axis carry)**: poc-03 비명시 invoke 시 본 fix 후에도 잔여 broken paths = ① rules.json → business-rules.json v7.0.0 rename 미전파 + ② cross_links repo-absolute convention 사용 → **F-MB-POC-001 후보** (별 plan / 본 v9.0.4 외).
>
> **STOP-3**: workspace 694/694 → **698/698 pass** + chain-coverage-validator 34/34 → 38/38 + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift-validator analysis.phase-flow 0 breaking (보존) + version 3-way 9.0.4 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
> - **LL-v904-01** — 시행 직전 사실 검증 보강 paradigm 본격 재발 v3 (LL-fsim-11 + LL-v902-01 정합 / 3회 연속 재발 / paradigm enforcement 본격 입증대 / main agent self-fact-check 의무 + carry note ambiguity 해소 cadence 본격 정착 v3)
> - **LL-v904-02** — silent sink paradigm deeper layer (LL-v903-01 확장 / 결정적 도구 enforcement 가 본격 hook gate cascade 안 될 때 silent sink 잔존 / chain-coverage-validator direct invoke + release-readiness #1 marketplace.json 모두 v+1 carry 후보)
> - **LL-v904-03** — PoC self-corroboration ≥ 2 paradigm 본격 입증 (§8.1 strict 정합 / 도구 fix → 다중 PoC 직접 invoke → 회귀 0 입증 + 부산물 carry 명시 cadence)
>
> **차기 session carry** (deadline 없음):
> - F-SIM-003 strict_mode v+1 default 전환 (별 axis 본격 보존 / 본 v9.0.4 fix 후 자연 가능 / cooling-off ≥ 24h 권장)
> - F-MB-POC-001 poc-03 산출물 drift 별 plan
> - LL-v903-01 follow-up (drift-validator phase-flow breaking exit ≥ 1 v+1)
> - LL-v903-03 follow-up (release-readiness #1 marketplace.json grep v+1)
>
> DEC-2026-05-24-v904-fsim-003-deeper-fact. Resolves F-MB-VAL-001.

## [9.0.3] — 2026-05-24 PATCH — 6-stage chain harness L1 결정적 점검 carry corrective (F-MB-DRIFT-001 + F-MB-DOC-003 / forward-only / additive doc / breaking 0)

> v9.0.2 release 직후 session 43차 L1 결정적 점검 (범위 = 전체 chain e2e 6-stage / 11 axis / 사용자 결단 "분석부터 시작 되는 플로우 점검") 의 후속 시행. 사용자 결단 "1" (의제 1 = 즉시 fix / PATCH / additive doc / cooling-off ❌) → 본 v9.0.3 PATCH. corrective / breaking 0.
>
> **L1 점검 결과**: 8/11 green + 3 ⚠️ silent drift 표면.
>
> | axis | 결과 | drift |
> |---|---|---|
> | C. drift-validator analysis.phase-flow | ⚠️ | 2 breaking — `template-analyze` phase JSON/mermaid 2-way drift (v3.4.0 G4 신설 후 ~6개월 carry / drift-validator emit breaking 하지만 exit 0 = release-readiness gate cascade 안 됨 = silent drift sink) |
> | G. chain-coverage poc-05 cross-refs | ⚠️ | 14 MEDIUM broken paths (strict_mode=false 통과 / F-SIM-003 v+1 default carry / 본 v9.0.3 범위 외 / 별도 plan carry) |
> | K. doc-drift tool/schema count | ⚠️ | 4 area — CLAUDE.md "17종"→실측 20 / "39종"→실측 44 / package.json "16 tools"→20 / marketplace.json "4단계 planning"→6단계 discovery (v9.0 미반영 = plugin install 첫 표면 drift) |
>
> **사용자 묶음 결단**: D1 F-MB-DRIFT-001 시행 / D2 F-MB-DOC-003 시행 / D3 v9.0.3 PATCH release ceremony / D4 G axis F-SIM-003 별도 plan carry (cooling-off ≥ 24h 권장).
>
> **시행** (additive doc / breaking 0):
> - **F-MB-DRIFT-001** (medium / 6개월 silent mermaid drift): `flows/analysis.phase-flow.mermaid` 안 subgraph `P_template_analyze["Phase template-analyze — ★ v3.4.0 G4 (Scenario C only)"]` 신설 + dependency edge `P_input --> P_template_analyze` 추가. **검증**: `node tools/drift-validator/src/cli.js flows/analysis.phase-flow.json` → 0 breaking / 0 non-breaking / 0 info ✅ (시행 직후 실측).
> - **F-MB-DOC-003** (low / 4-area count drift): `CLAUDE.md` line 97 (39→44 + dep-graph 3 부연) + line 99 (17→20 + sql-inventory-validator v8.7 rename + inflation-lint + code-pointer-validator + graph-integrity-validator v8.9.0 P1~P4 enumerate 추가) / `package.json:6` description "16 tools workspace" → "20 tools workspace" + 4 신설 도구 enumerate / `.claude-plugin/marketplace.json:11` description "SDLC 4단계 chain harness (legacy 분석 → planning → spec → test → impl) + chain 4 gate" → "SDLC 6단계 chain harness (legacy 분석 → discovery → spec → plan → test → implement / ★ v9.0 6-stage) + chain 1~5 gate (#1~#4 / plan placeholder)".
> - **release ceremony**: plugin.json + package.json 9.0.2 → 9.0.3 (3-way sync) + CHANGELOG 본 entry + CLAUDE.md sync + DEC-2026-05-24-v903-l1-flow-audit-carry-corrective + INDEX 최상단 + STATUS session 43차 v9.0.3 entry.
>
> **STOP-3**: workspace **694/694** + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift analysis.phase-flow 0 breaking ✅ + version 3-way 9.0.3 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
> - **LL-v903-01** — silent drift sink paradigm 본격 표면화 (drift-validator phase-flow breaking 시 exit 0 = warn-level → release-readiness gate 에 cascade 안 됨 = 6개월 carry 가능 / 후속 carry = exit ≥ 1 hard gate 전환 v+1)
> - **LL-v903-02** — L1 결정적 점검 paradigm enforcement 본격 표면화 cadence (11 axis 결정적 도구 일괄 실행 + 횡단 cross-check = sub-agent 비용 0 + 양심 의존 0% + drift 자동 표면 / paradigm 안정점 본격 재도달 v4 / v9.0.2 동형 패턴 cadence 본격 정착)
> - **LL-v903-03** — marketplace.json description = plugin install 첫 표면 (사용자 1차 접점) / MAJOR release 시 sweep 의무화 carry / release-readiness #1 marketplace.json description grep 추가 후보 v+1
>
> **차기 session carry**: G axis F-SIM-003 strict_mode 별도 plan (cooling-off ≥ 24h / poc-05 산출물 vs 도구 path resolution base 분리 검증 후 결단) + LL-v903-01 follow-up (drift-validator phase-flow breaking exit ≥ 1 v+1) + LL-v903-03 follow-up (release-readiness #1 marketplace.json grep v+1).
>
> DEC-2026-05-24-v903-l1-flow-audit-carry-corrective. Resolves F-MB-DRIFT-001 + F-MB-DOC-003.

## [9.0.2] — 2026-05-24 PATCH — paradigm + dep-graph L2 audit carry corrective (F-PA-DRIFT-001 + F-MB-DOC-002 / forward-only / Senior fact-check paradigm 재발)

> v9.0.1 release 직후 session 42차 L2 audit (paradigm + dep-graph / 14/16 PASS + 2 doc-only drift carry) 의 후속 시행. 사용자 결단 "캐리 실행" → 본 v9.0.2 PATCH. corrective / breaking 0.
>
> **시행 직전 사실 검증 보강 결과 (LL-fsim-11 paradigm 본격 재발)**: F-MB-DOC-002 가 1차로 단순 ambiguity (CLAUDE.md "5종" vs 실측 4) 로 등재됐으나, 시행 직전 사실 검증 시 더 깊은 fact-mismatch 발견 — `b9615d0` commit message + `DEC-2026-05-23-dep-graph-p1-p4 §3.1` + `STATUS` 32차 entry 안 "schema 5 신설 (...discovery-output + plan-spec)" claim 자체가 사실 오류. `discovery-output.schema.json` + `plan-spec.schema.json` = git history 안 전혀 부재 (never created). `cycle-carry.schema.json` = v8.8.0 commit `4523116` 신설 (별 axis carry resolution_kind 추적 / dep-graph history doc 안 5종 list 안 명시 ❌). → v8.9.0 시점 의도 5 / 실 b9615d0 stat = 3 + v8.8.0 cycle-carry carry-over 1 = 현 4종.
>
> **사용자 묶음 결단**: D1 F-PA-DRIFT-001 시행 / D2 F-MB-DOC-002 옵션 B (forward-only / history doc immutable / LL-i-52 paradigm 정합) / D3 v9.0.2 PATCH release ceremony.
>
> **시행** (additive doc / breaking 0):
> - **F-PA-DRIFT-001** (file 내적 drift 해소): `methodology-spec/finding-system.md:474` F-SIM-012 status `"open (v8.4.0 carry)"` → `"closed v8.14.4"` + `DEC-2026-05-23-fsim-012-014-close §1` cross-link / `:476` F-SIM-014 동일 패턴 (DEC §2 cross-link).
> - **F-MB-DOC-002** (forward-only 정정): `CLAUDE.md` line 132 v8.9.0 entry `"schema 5 + validator 2"` → `"schema 4 (★ v9.0.2 정정 / 실 b9615d0 stat = artifact-graph-node + edge + code-pointer 3 신설 + v8.8.0 cycle-carry carry-over 1 = 현 4종 / v8.9.0 commit message + DEC §3.1 "schema 5 신설" claim = 사실 오류 / discovery-output + plan-spec 본 적 없음 — history doc immutable 보존 / DEC-2026-05-24-v902-audit-carry-corrective) + validator 2 + ..."`. history doc (`b9615d0` commit message + `DEC-2026-05-23-dep-graph-p1-p4 §3.1` + `STATUS` 32차 entry) 변경 ❌ (audit-time 기록 보존 / LL-i-52 immutable paradigm 정합).
> - **release ceremony**: plugin.json + package.json 9.0.1 → 9.0.2 (3-way sync) + CHANGELOG 본 entry + CLAUDE.md sync + DEC-2026-05-24-v902-audit-carry-corrective + INDEX 최상단 + STATUS session 42차 v9.0.2 entry.
>
> **STOP-3**: workspace **694/694** + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift 3-way + version 3-way 9.0.2 + breaking 0 = PATCH.
>
> **3 LL 자산화**:
> - **LL-v902-01** — main agent 시행 직전 사실 검증 paradigm 본격 재발 (LL-fsim-11 정합 / Senior 사실 검증 보강 본격 입증대 / L2 audit 의 "ambiguity" finding 이 실 fact-mismatch 로 진화한 case)
> - **LL-v902-02** — history doc immutable forward-only correction paradigm (LL-i-52 본격 재적용 / commit message + DEC + STATUS 의 fact-wrong claim 보존 + CLAUDE.md 만 정정 / 새 reader 추적 = 본 DEC 안)
> - **LL-v902-03** — L2 audit + 시행 분리 paradigm 본격 입증대 (audit → 결단 → 사실 검증 보강 → 시행 cadence / paradigm 안정점 본격 재도달 v3)
>
> DEC-2026-05-24-v902-audit-carry-corrective. Resolves F-PA-DRIFT-001 + F-MB-DOC-002 (session 42차 audit carry).

## [9.0.1] — 2026-05-23 PATCH — v9.0.0 coherence (prose + machine SSOT drift 정합 / planning→discovery + plan 전파)

> v9.0.0 이 런타임 SSOT(state.schema / stage-graph / sdlc.json stages)만 마이그레이션하고 **prose 14파일 + briefing 3파일 + sdlc-4stage-flow.mermaid + phase-flow chain 링크**를 구버전(4·5단계 / "planning")으로 남긴 drift 청산. corrective / breaking 0.
>
> **실 결함 포함**: `lifecycle-contract.md` 의 dead link(`agents/planning-agent.md` — discovery-agent.md 로 git mv 됨) + `chain-harness-guide.md` 의 state enum 모순(`"planning"`/`"done"` vs state.schema `current_chain` 6-stage). skill-citation-validator 가 prose 링크를 안 봐서 v9.0.0 STOP-3 통과했던 잔존.
>
> **사용자 결단**: ① coherence docs 먼저(PATCH) ② briefing/ 포함 ③ machine SSOT(mermaid + phase-flow 링크) 포함.
>
> **번호 규칙**: discovery=chain1/gate#1 · spec=2/#2 · plan=3/**gate deferred** · test=4/#3 · implement=5/#4 (gate 번호 ≠ chain 번호).
>
> - **prose 6-stage 정합 (14)**: `lifecycle-contract.md`(dead link→discovery-agent.md + flow 다이어그램 순서 + 자산 매핑 매트릭스 plan row(9) + data-contract plan 절 신설 + scope tree + 전 chain/gate 재번호) · `skills-axis.md`(§4·§7.2·§9.2 표 — discovery 6 + plan + count 55) · `plugin-charter.md`(R3/R7/R10/R11/R12/R13 + revisit_edges 8종) · `id-conventions.md` · `agents-axis.md` · `deliverables/17-planning-spec.md` · `flows/README.md`(dead ref planning.phase-flow→discovery) · `README.md`(stage 줄 + CHAIN 블록 + tree) · guides 4종(`chain-harness-guide.md` state enum→current_chain 6-stage + mermaid 재작성 + matcher / `first-prompt-cookbook.md` / `getting-started.md` / `common-errors.md`).
> - **briefing 3종**: `01-main.md`(skill·flow tree + 트리거 + flow 다이어그램) · `02-first-5min.md` · `slides/methodology-deck.md`(flow 섹션 + chain 책임 표 + revisit + asset 매핑 + 멀티에이전트).
> - **machine SSOT**: `sdlc-4stage-flow.mermaid` 6-stage 재작성(Planning→Discovery + plan subgraph S3 + revisit 8종 + S0~S5 chain 정합) · `spec/plan/test/implement.phase-flow.json` previous/next chain 링크 정합(dead ref `planning.phase-flow.json` 제거 + plan 경유) + chain 번호(test 3→4 · implement 4→5) + `expected_outcome_chain3/4`→`chain4/5`.
> - **KEEP (reuse/history)**: `planning-spec.json`·`planning-spec.schema.json` 산출물명 + `planning-extraction-validator` 도구 + `subtask_ids.chain1_planning` schema key + `finding-system.md`·`briefing/04-version-history.md` audit history + ticket 서브시스템(`ticket-sync` skill stage=planning + traceability schema 4-chain key).
> - **STOP-3**: workspace **694/694** + release-readiness **16/16** + skill-citation **235 doc 0 stale** + drift state-flow(6=6)+chain-layout(5)+phase-flow 짝 0 breaking + chain-driver 223/223 + version 3-way 9.0.1 + breaking 0 = PATCH.
> - **carry**: plan-agent 본격 구현(plan-* skill 3 + plan-spec schema + plan hard gate) = v9.x+ / README·briefing version·stat refresh(v3.6.9·v8.2.0 → v9.0.x) / ticket 서브시스템 6-stage 마이그레이션(breaking) / templates/planning 폴더 rename.
>
> DEC-2026-05-23-coherence-docs-6stage. Resolves DEC-2026-05-23-discovery-stage-v9 §carry (prose coherence).

## [9.0.0] — 2026-05-23 MAJOR — discovery stage 재통합 (6-stage chain harness / planning→discovery 개칭 + plan 신설)

> DEC-2026-05-21 설계(옵션 A "개칭 + 확장")를 현 main 위에 **machine SSOT 까지 완성**. 기존 `feat/v4.1-hooks-carry-note` 브랜치는 문서·skill·agent 만 바꾸고 state/flows/tooling 을 안 건드려 미완성·drift 상태였음 (그래서 raw merge 시 drift+citation 깨짐 → abort 후 본 재통합).
>
> **breaking**: `state.schema.json` stage enum (`planning`→`discovery` + `plan` 추가) → 기존 state.json 무효화 + skill command-surface rename (planning-*→discovery-*). v7.0.0/v8.0.0 rename 선례 정합 = MAJOR.
>
> **사용자 묶음 결단**: MAJOR v9.0.0 / fresh 재적용(stale 브랜치 merge ❌) / 기존 schema reuse(신규 0) / plan gate deferred(placeholder / gate #1~#4 유지) / chain 1~5 순차 재배치.
>
> **chain**: `analysis → discovery → spec → plan → test → implement`. discovery = planning 개칭 + 입력 어댑터 4종(analysis-output/swagger/figma/nl-md). plan = HOW 단계(task/ADR/NFR/risk) placeholder (plan-agent skills:[] / hard gate deferred).
>
> - **machine SSOT**: `state.schema.json` 6-stage(enum/required/StageRecord/gate/revisit) / `sdlc-4stage-flow.json`(파일명 reuse) stages 6 + revisit_edges 8 + gate #1~#4 / `flows/planning.phase-flow`→`discovery.phase-flow`(git mv) + `plan.phase-flow` 신설(+mermaid 각) / `drift-validator` CHAIN_STAGES / `chain-driver` 8 src(stage-graph STAGES+gate map / state-store / gate-eval / cli MANIFEST_STAGES / hooks-bridge trigger / work-unit / revisit-detect) + **223 test 갱신**.
> - **skills/agents**: 3 rename(planning-*→`discovery-decompose-use-cases`/`discovery-from-analysis-output`/`discovery-identify-business-intent`) + 6 신설 placeholder(`discovery-from-figma`/`nl-md`/`swagger` + `plan-architect-decisions`/`decompose-and-sequence`/`risk-and-nfr`) + `discovery-agent`(planning-agent 흡수) + `plan-agent` placeholder.
> - **schema reuse(신규 0)**: discovery 산출물 = `planning-spec.json`(파일명 reuse) / 어댑터 schema = 기존 `figma-extract`·`prompt-extract`(+`plan-doc-extract`)·`swagger-extract`(+`openapi-extension`)·`intent-classification` 재사용 / plan-spec = defer(placeholder).
> - **기타**: PoC state.json 3 마이그레이션(planning→discovery + plan / poc-11·06 go-eligible→go 정정) / hooks matcher discovery·plan / DEC-2026-05-23-discovery-stage-v9 + DEC-2026-05-21 등재 / CLAUDE.md 6-stage + plugin.json desc.
> - **STOP-3**: workspace **694/694** pass / drift state-flow(6 enum=6 flow)+chain-layout(5 chain stage / 0 missing) / chain-driver 223/223 / skill-citation 235 doc 0 stale / release-readiness **16/16 ready** / version 3-way 9.0.0 = MAJOR.
> - **carry**: plan-agent 본격 구현(plan-* skill 3 + plan-spec schema + plan hard gate) = v9.x+.

---

## Archive

> v8.x 이하 entry 모두 → [`CHANGELOG-HISTORY.md`](CHANGELOG-HISTORY.md) 이전 (★ ★ ★ v9.0.0 paradigm boundary cleanup / 2026-05-25 / 6-stage chain harness 시작점 cutoff). 직전 cutoff = v7.0.0 이하 (v8.13.2 / 2026-05-23). v2.3.x and earlier split = 2026-05-14. v1.3.x and earlier split = 2026-05-06.
