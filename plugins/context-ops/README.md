# AI-Native 개발 방법론 v0.44.0

> 조직의 개발 방식을 AI-Native로 전환하는 **AX(AI Transformation) 마이그레이션** 사내 표준 방법론. **분석 → 발견 → 스펙 → 계획 → 테스트 → 구현** SDLC 6-stage chain harness — AI가 단계별 산출물을 생성하고 사람은 gate에서 검토·결단 (AI 자동화 ~85% / 사람 ≤15%).
>
> **현재**: v0.44.0 (2026-06-13 / **MINOR — code @DisplayName ↔ test-spec 라벨 정합 lint (SOFT / opt-in) + canonical 라벨 grammar**[dogfood(ep-be-gea golf/event/resv)가 노출한 갭: 테스트 `@DisplayName` 의 BR/AC/TC 토큰이 test-spec SSOT 와 drift + 날조 BR id 인데 검증 부재(기존 spec-test-link=JSON↔JSON·test-impl-pass=runner XML·code-pointer=ast warn = 코드 라벨 무방비). `spec-test-link-validator` 에 opt-in `--test-source <root>` **SOFT 모드** + sibling export `validateCodeLabelConsistency` 추가 — 결정론 subset(날조 id=critical / AC·TC join mismatch=high / intra-label AC↔TC=high) · source_evidence·code_pointers 의 class/method 명 join(라벨 아닌 안정 anchor / 부재 시 `join_anchor_absent` 정직 skip=오탐 0) · short(`AC-007`)↔full 정규화 · Java/JUnit5 extractor(TS·React carry / non-Java skip). **SOFT 보장**: 결과를 별도 키 `result.code_label_consistency` 로만 attach → `result.findings`/`summary` 병합 ❌ → exit-code·aggregator·gate #4 **무영향** / `--test-source` 부재 시 기존 JSON-only 동작 **100% 불변** / REQUIRED-validator map 무변경(count coupling 회피). **§8.1**: golf/event/resv = 단일 마스킹 Java 프로젝트 = **1 datapoint** → **SOFT only**(HARD flip[findings 병합+gate#4 차단]은 ≥2 distinct 도메인 corroboration 후 별도 DEC). canonical 라벨 grammar 를 `test-generate-test-spec` SKILL 문서화(`(BR-full / AC-id / TC-id)` + 일관성 3조건[TC=구현TC·AC=ac_ref·BR=실재] + class_ref/code_pointers populate 권장). 검증 spec-test-link **19 test**(신규 code-label 8) + 수정된 golf 실 dogfood **0 finding**(checked 6 / skipped 19 join_anchor_absent) / release-readiness **42/42**(신 check 무·criteria_total 무변). 4원칙 §2 패널 `wf_40ab04b1-fda`. DEC-2026-06-13-displayname-label-lint-soft / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.44.0]]) — 직전 v0.43.1 (2026-06-13 / **PATCH — validator stdout truncation 수정 (systemic / 게이트 correctness)**[16 validator/tool 의 `console.log(JSON.stringify(result))+process.exit(N)` 가 출력 >~64KB(파이프 커널 버퍼) 시 비동기 flush 전 종료로 게이트(`findings-aggregator` execFileSync)에게 **truncation JSON** 전달→JSON.parse 실패→status='error'+허위 critical. ep-be-gea **BC-WLFR(489 BR / br-cross 69KB)** 통합이 노출(reqmng 364 BR/<64KB 는 통과=규모 임계 / 파일 redirect 는 동기라 멀쩡 = 파이프 소비자 한정). 신규 `_shared/write-stdout-sync.js`(fd 1 동기 write + EAGAIN 재시도=완전 flush 후 반환) 도입 + 16 tool JSON 출력경로 `writeStdoutSync` 교체(**exit-code·출력 내용 무변** / flush 타이밍만 결정론화) + br-cross 회귀 테스트 2(대용량·멀티바이트 파이프 완전 캡처). additive / breaking 0. DEC-2026-06-13-validator-stdout-truncation-fix / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.43.1]]) — 직전 v0.43.0 (2026-06-13 / **방법론 본체 격상 — sql-inventory-extractor §0 MANDATORY 배선 + bc-accumulator-rollup post-merge 직렬 rollup 규약 (≥2 도메인 corroboration 충족)**[ep-be-gea BC-WLFR(복지 7 서브도메인 / 731 java / controller 26·RestService 28·mapper 25) 풀 analysis chain(business-rules 125·characterization 42snap/99scn·sql-inventory 536·openapi 237op·findings 40) 완주가 두 도구의 in-repo corroboration 을 충족시켜 deferred 격상을 시행. **sql-inventory-extractor**: REQMNG 163 + WLFR 536 stmt = MyBatis 3+MSSQL **2-domain** 입증 → `analysis-sql-inventory` **§0 결정론 추출 MANDATORY 선행** 배선(grep 레시피의 실행 SSOT / LLM 은 판단 6컬럼만). 비-XML 스택(Spring JDBC·@NativeQuery·TypeORM·Prisma)은 도구 미커버 = §1 수동 grep 유지 **carry**(stack 다양성 미충족 — 정직 한계). **bc-accumulator-rollup**: REQMNG + WLFR **2 dogfood**(BR index total_rules 60→185 · findings 0→40 버킷 재계산 · 멱등 RUN2 전부 replaced · sibling 보존 EVENT+GOLF+WLFR · live shared 무접촉) → `lifecycle-contract` 병렬 worktree→fragment-only→post-merge 직렬 rollup 규약 SOFT→격상. release-readiness 42/42 유지. DEC-2026-06-12-sql-inventory-extractor / DEC-2026-06-12-parallel-bc-accumulator-rollup / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.43.0]]) — 직전 v0.42.1 (2026-06-12 / **append-catalog writer 헬퍼(F-1) + analysis exit-gate 명문화(F-2) — resve 다중도메인 corroboration**[mtrm+helium/healing/hlum 4 BC 분석이 노출한 **multi-BC 카탈로그 writer 비대칭**(BC#2 가 BC#1·event·golf 카탈로그 통째 재작성으로 덮음) 해소 = `tools/_shared/append-catalog.js`(load-business-rules.js reader 의 writer 짝 / 결정론 upsert-by-id·sibling 보존·total_rules 재계산·indent 보존)+회귀 12. schema-validator gate#0 가 skill-direct·multi-agent fan-out 경로 미강제 → 분석 스킬 '다음' validate→repair 명문화(F-2). 부수: base·athrt=cross_cutting 판정 / bc_scope 0→14 datapoint / 2-zone ≥2 도메인 무충돌 검증. 검증 chain-driver 535/535·skill-citation 0 stale·shipped_provenance_leak pass. DEC-2026-06-12-resve-multidomain-corroboration / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.42.1]]) — 직전 v0.42.0 (2026-06-12 / **golf(BC-RESV-GOLF) 5 chain 풀런 dogfood → 결정론 검증기 wiring 3 fix**[ep-be-gea campaign 예약 메뉴그룹 1번 golf 를 analysis→discovery→spec→plan→test→implement 풀런(fresh)하며 노출. BC-1 discovery-extraction-validator CLI 가 BR-split index 미재조립(false HIGH)→`_shared/loadBusinessRules`(index-aware) 교체 · BC-3 findings-aggregator 에 graph-integrity-validator arg case 부재→항상 evidence_missing(REQUIRED.implement 미작동)→명시 case+단위테스트(작동 즉시 golf orphan 5 적발) · BC-5 traceability-matrix-builder `analysisCandidatePaths` cross-BC 누출(golf 없는 formal-spec 을 BC-EVENT 에서)→`scopeBc` 필터+golf cross_links 보강→orphan 5→0. 전부 event·golf 2 도메인 동일=구조적(§8.1). carry: BC-2(drift=workspace-internal/REQUIRED 제외 deferred)·BC-4(static-runner --plugin 부재=R19 정직 carry). 검증 discovery-ext43·aggregator67·traceability179·chain-driver523 무회귀+release 42/42 / golf 5 chain critical0·high0(test 실 JUnit 8 method GREEN=6 AC char+19 operability 천장 carry). 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.42.0]) — 직전 v0.41.0 (2026-06-12 / **canonical 산출물 2-zone 재구조화 — `output/shared/`(공통) + `output/domains/<BC>/`(도메인별)**[공통(repo-wide/cross-cutting)·도메인(per-BC) 산출물 분리로 병렬 CLI·worktree·누적 무충돌(도메인마다 자기 폴더만 write / shared 는 analysis 1회·read-only). **read model ⊥ storage layout** — canonical-global(논리 1세트·참조·무복사) 불변 / 본 변경=물리 레이아웃만 / business-rules index+leaf 선례 일반화 / loader 무수정 투명. 진입점 basename(business-rules.json index·antipatterns·migration-cautions) top-level 유지 = 디렉토리 이동만·rename ❌ / set-level 인덱스=manifest.analysis_refs.artifacts. bc_scope(antipatterns+migration-cautions optional·additive)=F14 narrow(필드 금지→SOFT 허용 / HARD-gate·물리 per-BC AP split 여전히 보류 / 0-datapoint). 적대 리뷰가 자기검토 편향 적발→고침: traceability-matrix-builder·codegraph-coverage zone-aware + skill EMIT 경로 sweep(다음 도메인 zone 산출). 검증 event dogfood gate 7/7+무회귀(chain-driver 523·aggregator 66·traceability 179·codegraph-coverage 121 등)+release 42/42(zone 작업 회귀 0 / 동반 ticket-sync 선재 노출 allow-identity 보완). §8.1: 1-domain(BC-EVENT) exercised·bc_scope 0-datapoint→SOFT/opt-in/평면 backward-compat. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.41.0]]) — 직전 v0.40.0 (2026-06-12 / **unit 층 HARD flip — SOFT→HARD 게이트 격상 (LEVER A/B)**[GATED 5조건 ①②③④ 충족(poc-21 greenfield designed_from_spec RED→GREEN + in-repo 2nd 도메인 + Stryker mutation 0.9365 + mock-soundness ≥2 협력자+waived) 후 조건⑤ 시행. **LEVER B** `validateUnitTestObligation`(plan gate#3) severity medium→**high**(unit_refs 보유 task 의 obligation 미선언 차단). **LEVER A** `validateMockSoundness`(test gate#4) result.findings 단일 병합 → gate-eval `validator_high` HARD_BLOCK(unsound mock 차단 / 구 advisory 2-객체 stdout = aggregator silent-swallow 함정 폐기). 두 게이트 = **provenance-무관 test-layer hygiene**(validator grep provenance=0 / designed_from_spec 일반화 아님). 회귀 가드 = unit-spec 부재 PoC = mock-soundness skip(무회귀). **over-claim 가드 5항**(designed_from_spec=1 datapoint·paradigm 미검증 / RED→GREEN 순서=human-carry / method-axis·mutation=영구 reference-lens). criteria_total **42 유지**(mock-soundness=spec-side 의도된 게이트라 신규 trust check 불요 / GATED DEC 의 42→43 supersede). 검증 plan-coverage 47·spec-test-link 11·aggregator 66·chain-driver 523·release 42/42 + flip 차단 empirical(exit 0→1). DEC-2026-06-12-unit-layer-hard-flip. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.40.0]]) — 직전 v0.39.0 (2026-06-12 / **unit 층 LEVER C soft-surface + charter R21 정합**[추천 일감 워크플로우(8표면 75후보→dedup 19→상위5 검증) 산출 → 1위 = unit 층 하드게이트 promotion. plan workflow 7 agents(LEVER A/B/C 정밀분석 + GAP-4 실측 + Senior + 업계 4사) **3-입력 전부 CONDITIONAL-GO 수렴** → 전면 HARD flip ❌ / **NOW+GATED 2단 분리**(DEC-2026-06-12-unit-layer-soft-surface-and-promotion-gating). **NOW(시행)** = LEVER C: findings-aggregator `transformTraceabilityMatrix` 에 `unit_coverage` axis — reference-lens pass-through 5필드(`traceability_unit_*` = mergeFindings allowlist 밖 = gate 무진입) + `obligation_satisfied_ratio<threshold`→medium advisory(non-blocking / forward gap 동형) / method_axis_corroboration·mutation_score = 영구 reference-lens(DEC-2026-05-28 게이트 주입 금지). 전부 additive 무회귀. **GATED(보류)** = HARD flip(LEVER B plan-coverage medium→high + LEVER A mock-soundness validator_high 합류)는 5조건(designed_from_spec greenfield RED→GREEN E2E + in-repo 2nd 도메인 + mutation_score + ≥2 협력자 breadth + 후속 promotion DEC/count 42→43) 충족 전 금지 — 두 corroboration PoC 모두 characterized_from_code 단일 provenance라 차단 강제할 경로 미실증(품질1·재작업2 보호). **B** plugin-charter R21 ◐→✅(named carry C-use-scenario-taxonomy-impl·C-codegraph-essential-impl 시행 실측) + phantom ⚠️ 정정. 검증 aggregator 64/64·chain-driver 523·release 42/42. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.39.0]]) — 직전 v0.38.0 (2026-06-12 / **ep-be-gea run #2 backlog 본체 결함 6건 + F-DOGFOOD-STORY-ORPHAN governance**[run #2 high 3건(v0.37.0) 처리 후 나머지 backlog 6건(F-R2-07/01/28/29/41/44) 수정. behavior fix / schema additive·pattern 확장 / backward-compat. diagnose-before-design(6 병렬 진단 workflow 전부 still_present)+senior(F-R2-01/29). **F-R2-07** legacy-korean interceptor-no-rbac.yml `$X.select$Y`·`if(...AUTH...)` Java 파싱불가→semgrep exit2→metavariable-regex 교정(ruleset exit0). **F-R2-01(senior 0.9)** state-store `current_phase:'input.0'`↔state.schema `^P\d+` orphan pattern→`^[A-Za-z][A-Za-z0-9-]*(\.\d+)*$` 확장(init schema-valid / carry runtime 미검증). **F-R2-28** work-unit-manifest stage enum +analysis. **F-R2-29(senior 0.92)** char-cov intent-vs-bug.md 강제 high=ADR-011 위반→§4 제거+둘다부재 medium entry_absent(spec 내장 intent_vs_bug=SSOT). **F-R2-41** test-impl-pass junit-xml report_path 디렉토리 EISDIR→aggregateJunitXmlDir 재귀합산(단일파일 무회귀). **F-R2-44** cli 가 unitSpec 을 synthesizeGraph 에 미전달=반쪽배선→cli+graph-synth UNIT 노드/edge 배선(event orphan 11→0). **B** graph-integrity implement gate blocking 승격(직전 9b8d5238) governance 기록. 검증 static48·matrix179·test-impl-pass59·char-cov24·aggregator61·chain-driver523·release 42/42. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.38.0]) — 직전 v0.37.0 (2026-06-11 / **findings-aggregator 비-analysis scope-aware + test-impl-pass 인자 정정 + code_only severity 재배치**[ep-be-gea event full chain 재실행(run #2 / S2 / 외부격리) dogfood 가 노출한 chain harness 자동화 axis 본체 결함 3건. **F-R2-35(high)** findings-aggregator `buildValidatorArgs` 가 비-analysis 5 stage 에서 평면 경로 하드코딩(analysis 만 DEC-2026-06-06 scope-aware) → per-scope 레이아웃에서 validator 전부 evidence_missing → optional `scopeCtx` overlay(null=평면 byte-identical 무회귀 / 주입=per-scope→canonical→legacy existsSync)+loadScopeCtx. **F-R2-40(medium)** test-impl-pass `--target`→`--project`+`--allow-execute`(실 GREEN reconciliation)+package.json test glob. **F-R2-32(high/senior GO@0.82)** characterization code_only=high 가 analysis-only validator 에서 S2/S3 gate#0 구조 차단(category-error) → medium 환원, R15 진짜 방어는 같은 validator 의 Layer 3 evidence cross-check critical(허위 real-source CLAIM). behavior fix only / schema·gate 의미 무변경 / backward-compat. aggregator 57/57·char-cov 22/22·release-readiness 자체 27/27·event dogfood 실증. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.37.0]) — 직전 v0.36.0 (2026-06-11 / **TDD/unit 층 1급화 — UNIT-* 전체 스레드**[behavior(BDD) 단일 스레드(UC→BHV→AC→TASK→TC→IMPL)에 나란히 TDD/unit 층 추가 — `unit-spec.schema.json`(UNIT-* SSOT) + behavior-spec/task-plan/test-spec(`test_layer`/`class_ref`/`mocks`)/matrix(`unit_id`/`coverage_summary.unit_coverage`) additive 필드 + mocking-soundness 계약(spec-test-link `validateMockSoundness`)+ unit-test obligation(plan-coverage)+ 정책 `test-layering.md`. 시나리오 분기 S2(code-graph∩domain 발견)/greenfield(formal-spec 설계). **신뢰 분리**: spec 파생 UNIT=게이트 후보(현 soft) / code-graph method-axis=reference-lens·propose-only(DEC-2026-05-28 불변). **§8.1 ratchet**: 스캐폴딩 now / 강제 ≥2 PoC 후. PoC #1=ep-be-gea(DrawNumberGenerator 52 + MaskingUtils 6 unit GREEN / 직전 dogfood 가 mock 으로 빼버린 빌딩블록 핀 → mock-soundness sound). additive — 기존 PoC 25/25 무회귀. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.36.0]]) — 직전 v0.35.0 (2026-06-10 / **역공학 델타 #5 test-recovery — `existing_test_file` data_source_status(R15 RUN 의무)**[기존 테스트=characterization 증거 인정, 단 실제 실행(real_tool invocation)했을 때만. plan "additive enum" 오분류 → validator REAL_SOURCE_STATUSES 우회 가드 구멍 → REAL_SOURCE_STATUSES 편입(Layer 3 cross-check) 차단 / 읽기만=code_only. diagnose-before-design: 증거 메커니즘 이미 존재(no-simulation §2 Tier 1). Senior GO@0.88(가드 차단 실측·22/22 무회귀). carry=usage ≥2 도메인. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.35.0]]) — 직전 v0.34.0 (2026-06-10 / **역공학 델타 #2a(run-manifest)+#3(recovered-ADR) draft→official(opt-in) 격상**[diagnose-before-design — "#1~#4 격상" 조사가 #1·#4·#2b 이미 격상/출하 확인 → 잔여 #2a(corroboration 충족 poc-18 Node+poc-10 JVM)·#3. #3 2nd 도메인 = ep-be-gea 사내 dogfood(외부격리·commit❌ / 마스킹: 12 RADR·observed3/inferred6/unverified-intent3·real_extraction). Senior GO@0.88(self-증거 anchor 전수 재현=genuine / over-attribution 0). 격상=official/opt-in(MANDATORY❌ — recovered-ADR=legacy 한정·run-manifest=runnable 한정). carry=validator 부재·vcs-rationale·3rd non-Java paradigm. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.34.0]]) — 직전 v0.33.1 (2026-06-10 / **living-sync subset-precision = OBVIATED → dead `subsetAnalysisRefs` retire**[diagnose-before-design — "subset-precision 진행" 1원칙 조사가 obviation 포착(merge-back 동형). §14 측정 FP(business-rules.json drift)는 v0.14.0 `hashBusinessRulesSubset`(BC 필터)가 이미 해소(가드 테스트). `subsetAnalysisRefs`(prefix 필터)=호출처 0·미배선·BC-hash 보다 부정확 → retire / 실 슬라이싱=drift BC-hash·validation scope-token / `analysis_refs` 필드 KEEP(load-bearing). Senior GO@0.93 / chain-driver 516 무회귀 / breaking 0. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.33.1]]) — 직전 v0.33.0 (2026-06-10 / **ticket cascade-conformance 강제 — 정책 11 trust→enforcement**[verify(cascade-plan↔evidence 대조)+hooks PreToolUse deny / 코드 선행 74e6ec3b·본 release 마감 / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.33.0]]) — 직전 v0.32.0 (2026-06-10 / **ticket-sync 결정론 핵심 → `tools/ticket-cascade-builder` 도구 추출**[breaking 0·행위 보존 — "도구=결정론/skill=LLM 의미"(STRONG-STOP)를 위반하던 유일 outlier 해소. resolve(role→issuetype)·parent_spec(B14)·델타(skip_prebound vs create)·body·cascade 순서·preview 를 LLM pseudo-code 에서 결정론 builder(NO MCP·LLM·network)로 추출 → `cascade-plan.json`(신규 schema). 스킬 잔존=발사+7-field evidence+runtime 400 fallback+gate(비가역/live 의존). SKILL 709→279줄(부수효과 / 정당화=결정론 axis 복원). 도구 15 test / schema ajv valid / citation 0 stale. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.32.0]]) — 직전 v0.31.0 (2026-06-10 / **validator project-root 경로 해석 단일화(F15)**[formal-spec-link(gate#2)가 chain cross-ref 를 spec-dir 기준 해석→`.ai-context/...` project-root-relative 경로 dead-reference 오탐→gate#2 거짓 block 수정. `_shared/project-root.js`(`.ai-context` 부모=root) 신설 — chain-coverage autoDetectProjectRoot(v9.0.4) 일반화·중앙화 + formal-spec-link `--project-root` 배선. golf·event breaking 2→0 / test 21→26 / chain-coverage 41 무회귀. F13 sibling F14/F16=diagnose-before-design 처분(코드❌ / F14 correct-by-design REFRAME, F16 Layer-4 이미 존재 DISSOLVE). 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.31.0]]) — 직전 v0.30.0 (2026-06-10 / **discovery-extraction-validator scope(BC)-aware coverage**[canonical-global 누적 시 domain.json 다중 BC 가 단일 scope discovery coverage 희석 수정 / discovery UC scope-token 보유 BC 만 분모 / ep-be-gea F13 / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.30.0]]) — 직전 v0.29.0 (2026-06-10 / **scope candidate coarse-to-fine 재귀 carve**[측정 도출 scope candidate 도 거칠 수 있다(members=복수 독립 응집 sub-unit 클러스터)→재귀 재-carve 후 절단(advisory/soft gate#0). ADR-CHAIN-016 규칙 4 + source-inventory §4 coarseness 재점검. ep-be-gea dogfooding F12 트리거(reservation=6 하위도메인 클러스터 실증 / golf 분해). gate·trust·schema·code·test 무변경. §8.1: 규칙=paradigm-grounded(measured-coupling 재귀+under_decomposition scope-level 확장) codify / "몇 파일=거침" 정량=1-PoC carry / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.29.0]]) — 직전 v0.28.0 (2026-06-10 / **backbone-first 절차 + shared-kernel factoring codify**[대형 코드베이스 analysis 에서 scope 끊기 전 ⓐDB + ⓑshared-kernel(Martin afferent-hub 공통커널)을 `role=backbone` 으로 먼저 분리→1회 분석→hub 제거로 feature 간 결합 급감→깨끗한 feature scope. ADR-CHAIN-016 §적용절차 확장 + inventory scope_candidates `role` enum(scope|backbone) additive + source-inventory·scope-carve skill operationalize. scope id=의미 명칭(패키지 약칭 ❌). §8.1: 규칙=paradigm-grounded(Martin hub+DDD shared-kernel) codify / kernel 결합 % 수치=ep-be-gea 1-PoC carry / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.28.0]]) — 직전 v0.27.0 (2026-06-10 / **scope-carve draft→official 격상**[역공학 델타 #1 scope-carve 를 §8.1 ≥2 도메인 corroboration(poc-01 소형 legacy + ep-be-gea 대형 modern 4신호 live / co-change 13,137 commit real_tool = target-with-history carry 해소)으로 official 격상 / 수준=대형 conditional 권장(전면 MANDATORY ❌) / caveat 해소=analysis-architecture 정식 재생성(실 layer + violates_layer 100건) / 교차검증=violates_layer 최악(wlfr·req)↔scope_candidates entangled 독립 수렴 / trust 불변(reference-lens) / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.27.0]]) — 직전 v0.26.0 (2026-06-10 / **scope-carve ↔ scope_candidates dedup**[같은 개념의 두 평행 표현(scope-carve=역공학 신호엔진 SCC·Martin·co-change·hotspot / scope_candidates=v0.25.0 출력컨테이너 / 상호 미참조)을 역할분담 일원화 — carve_candidates→soft gate #0 사람확정→scope_candidates. inventory `source` enum +scope_carve + `carve_signals[]` provenance additive / 자동주입 ❌(reference-lens 보존) / scope-carve 도구 MANDATORY 격상은 별개(draft·opt-in 유지) / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.26.0]]) — 직전 v0.25.1 (2026-06-09 / **멀티모듈 repo 산출물 배치 컨벤션 명문화** PATCH[멀티모듈·모노레포에서 `.ai-context/` = repo 루트 단일 / 모듈 내부 분산 ❌ / 근거 scope≠모듈·글로벌 산출물 모듈무소속·federation 단일트리 / 예외=독립배포+독립도메인 모듈 / lifecycle-contract 파일위치 컨벤션 보완 / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.25.1]]) — 직전 v0.25.0 (2026-06-09 / **측정 기반 scope 도출 — 대형/decayed 코드베이스**[최초 analysis 시 scope 절취선을 codegraph 실측 coupling 으로 도출 / 원칙 "패키지 경로 ≠ 경계, 측정된 coupling = 경계" / `inventory.schema` `scope_candidates` 신설(advisory·gate inject ❌) + `modules_for_priority_analysis` coupling 보강 + analysis-source-inventory·analysis-code-graph 단계 + 경계위반(domain→infra 역참조 등)→antipatterns(ARCH)+migration-cautions+finding 라우팅. 트리거 ep-be-gea(Spring Boot 6307 Java / 클린아키텍처 지향하나 decay 실측). research 5선례(CodeScene·Vertical Slice·dependency-cruiser) 지지. carry §8.1 1 PoC→천장수치 미주장 / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.25.0]]) — 직전 v0.24.0 (2026-06-09 / **business-rules 산출물 분할 — BR-split STEP 3**[`business-rules.json` 단일파일 → index(well-known 파일명 보존 / `bc_files[]`+`total_rules`) + `business-rules/<BC-slug>.json`(per-BC leaf). **검증파일(business-rules.schema.json) 무변경** + 신규 schema 2개(index/bc) additive — 사용자 결단 "검증파일 안 바꾸고 산출물만 쪼갠다". **loader 단일 변경점**(`loadBusinessRules` index 감지→per-BC 재조립 / 소비자[br-cross·federator·traceability·graph] 무변경·분할 투명 / 옛 단일파일 backward-compat / input fixture·legacy 시점기록 보존). **living-sync 재배선**(subsetRules→loadBusinessRules·brDiffOrigins=reconstructBrFromGit N+1·`--git`/`sync-converge --git` brChanged per-BC prefix partition). canonical 3 PoC(poc-05/18/19) 마이그레이션(재조립=원본 rule id MATCH) / legacy·input 16 보존. **Senior REVISE@0.83 BLOCKER 3**(①`--git` per-BC prefix ②"8개"→검증파일 무변경+canonical 3만 ③baseline=subset-hash content-based라 분할 불변=non-issue 실증). BR-split 순차안 마지막 STEP(STEP0 subset폐기·STEP1 BC required·STEP2 loader 토대 위) / workspace 1469 GREEN / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.24.0]) — 직전 v0.23.1 (2026-06-08 / **`.aimd-install/` → `.static-tools/` 후속 정리**[v0.23.0 에서 보존했던 정적분석 도구 설치 마커 dir(`.aimd/` 와 무관·플러그인 내부·gitignore·커밋❌)을 후속 리네임 — `.aimd/`→`.ai-context/` 후 잔존 `aimd` 토큰 정리 + 내용 서술성(`.static-tools`=semgrep/PMD 설치 마커). 11곳/6 live 파일(runner.js·install-static-tools.js/.sh·preflight·README·.gitignore) / 내부 마커=동작 무변경=PATCH / static-runner 40/40] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.23.1]) — 직전 v0.23.0 (2026-06-08 / **출력 디렉토리 컨벤션 `.aimd/` → `.ai-context/` 리네임**[폴더명 기준=내용 서술성(안에 AI 운영 컨텍스트가 있음 / 패키지 context-ops 와 짝) — 식별자 정합 아님. v0.x 미배포=채택자 0=리네임 적기·기능변경 0. 정규식 `/\.aimd(?!-install)/g` sweep 281파일 + git mv 14 example dir(history 보존) + 내부 식별자 3종. 보존: `.aimd-install`(무관 install marker)·역사 기록(archive·CHANGELOG-HIST·과거 DEC=시점 사실). 클린 컷(하위호환 불요). Senior REVISE@0.86 2 BLOCKER(.aimd-install 충돌·.github 누락) 반영. chain-driver 502·RR 41/41] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.23.0]) — 직전 v0.22.0 (2026-06-08 / **living-sync 채택자 git 위생 — `--git` 루프 noise 제거**[B: `chain-driver init` 이 `.ai-context/.gitignore` 자동 스캐폴드(런타임 상태 state.json 류만 / artifact-graph·matrix·findings 는 커밋 대상=제외 ❌ / idempotent / early-exit 前=upgrade) · C-lite: `resolveOriginNodeIds {skipDerivedNoise}` opt-in 으로 두 `--git` caller(sync-loop·sync-converge)가 노드 미매핑 도구 파생물(.ai-context/ 한정)을 skip → false `unresolved`/`needs_resynth` 제거 / 미매핑+비-파생물=unresolved 유지=carry2 BLOCKER-1 보존 / lift·--changed 무변경 / §8.1 2-도메인: poc-20 full 루프 fixpoint noise 0 + poc-18 skip corroboration / Senior REVISE@0.78 4건 / chain-driver 502] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.22.0]) — 직전 v0.21.0 (2026-06-08 / **PMD Java-조건부 자동설치 — Tier1 install 갭 해소**[install-static-tools `ensurePmd`: `java` PATH 감지 시 PMD dist zip 자동설치+marker / Java 부재=정직 carry(JVM 부트스트랩 ❌·user-owned) / runner `localPmdBinDir`+`extraPathDirs`=plugin-local PMD 발견(child PATH prepend·Semgrep 등 PATH 불변) / stale "PMD=Tier2" 주석·README tier 표 DEC-2026-06-07 정합 정정 / 사용자 zero-base 재검토 결론=엔진은 OSS 무관·"전부 자동설치"는 정당한 비-목표 / static-runner 40/40] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.21.0]) — 직전 v0.20.1 (2026-06-08 / **chain harness dogfood fix — persisted soft-block 사후 ack + 비-API layer 힌트**[외부 신규 프로젝트 full-chain dogfood 발견 rough-edge 2건: ① `chain-driver next` persisted block 가드가 `--user-decision` 보다 먼저 발화 → soft block(evidence_missing) 을 ack 로 못 풀던 결함 수정(가드 `state.blocked && !args.userDecision` / 명시 결단만 재평가 통과 / anti-bypass·hard-block 무손상 / chain-driver 492→494) ② `layer:be` openapi 강제는 by-design — 비-API 는 application/domain layer 탈출구임을 schema+common-errors Q5.1 명시(계약 약화 ❌)] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.20.1]) — 직전 v0.20.0 (2026-06-08 / **dep-graph 의존 갭 5종 조사 + G2-1 federation FK 읽기-aid**[dep-graph 가 표현하는 의존 차원 진단 → 누락/보강 컨텍스트 5종 등재 + "기존 자산 실측 → 정직 reframe" 조사. 갭1 코드 call-graph=대부분 이미 해소(SSOT 승격 trust·업계 0.85 거부) · 갭3 scope-out · 갭4 격상보류(실발현0) · 갭5 BR-split STEP3 흡수. **G2-1**(유일 코드): context-federator `data_refs.dependent_tables[].foreign_keys`(table↔table FK 위상 reading-aid / db-schema 직읽기 / optional·reference-lens·non-gating) — federator 34/34 + poc-16 dogfood + RR 40/40. **G2-2 reframe**: data_refs=설계상 legacy 데이터 반쪽(modern=codegraph) → "modern data_refs"=category mismatch / G2-1 FK=legacy-스택 한정 scope] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.20.0]) — 직전 v0.19.1 (2026-06-08 / **living-sync ② honest surface — SessionStart 미-baseline scope 표면화(false-health 수정)**[② lifecycle auto-register 는 DEFER 유지(SessionStart 자동등록=drift 흡수 유해 / analysis-hook=수요0). 대신 실재 false-health 버그 수정: SessionStart hook 이 first-touch 없이 markDrift 만 돌아 빈/absent `sync_sources` scope 를 조용히 "ready"(건강)로 보고하던 것을, 신규 read-only `listUnbaselinedScopes`(write 0 / anyCanonical 가드)로 표면화하고 "ready" 주장 억제. **★ Senior REVISE@0.80 BLOCKER-1**: 표면화(empty-or-absent) ⊆ cmdSync 수리가능 집합 정렬 — cmdSync first-touch 를 absent 도 커버하도록 확장(`!Array.isArray||length===0`). carry 2 BLOCKER-1 동형 P0 정직성 수정. 검증 chain-driver 492(+10)] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.19.1]) — 직전 v0.19.0 (2026-06-08 / **living-sync carry 2 — fixpoint 자동 재진입(수렴 원장)**[`sync-converge <project> --graph <g> --git <baseline>`: sync-next 큐 소비 완료 후 고정 baseline 재검출(carry 1b `--git` 재사용) → **cumulative_done dedup**(세션 누적 done 노드 제외 → §33 단조 → 종료 보장 / naive 수동 재실행의 ping-pong 차단) → 수렴 판정(continue 재시드 / fixpoint / non_converging). 도구는 **수렴-제어 half 만 결정론 소유** — 재생성(LLM)·그래프 재합성(외부)은 반복 사이(no-simulation §3.4). **★ Senior BLOCKER-1(REVISE@0.80)**: 재합성 부재 상태의 fixpoint 선언=거짓 건강(P0 역행) → fixpoint 는 **newWork=∅ AND graph fresh(`checkGraphFreshness`) AND unresolved=∅** 3조건 동시일 때만 / 미충족=강등(needs_resynth / derived_from 부재→unverified_fixpoint / exit≠0). MAJOR: M1 session 생명주기(baseline 1회·--reset·fresh-큐 무효화)·M2 단조 trade 명시·M3 non_converging finding(high). §23 carry2 DEFER 해제. 검증 chain-driver 482(+23: 순수 11 + e2e 12 / BLOCKER-1 두 경로[재합성됨→fixpoint·stale→needs_resynth]+2-iter 수렴+cap)] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.19.0]) — 직전 v0.18.0 (2026-06-07 / **living-sync carry 1b — BR 외 범용 git-auto-origin**[`sync-loop --git <ref>`: ref↔worktree git diff(gitDiffNumstat 워크트리 모드 신설) → 변경 산출물 자동 수집 → **business-rules.json=per-rule 정밀 위임**(carry 1)·**기타 산출물=resolveOriginNodeIds coarse** → origins 합류 → regen_queue. carry 1(BR 한정)을 전 산출물로 일반화 = 변경 자동 감지 완성. `brDiffOrigins` helper 추출(--br-diff·--git 공유 / 테스트가능 discriminated result). Senior REVISE@0.82 fix: **BLOCKER-1** BR partition 제외=정규화 --br-path 키(else parent+per-BC over-propagation 부활)·**MAJOR-1** --git+--br-diff 동시=exit3·MAJOR-2 new=worktree fs 불변식·untracked 제외 정직 note. ② 자동등록 lifecycle=DEFER(cli.js:1251 의도 경계). 검증 chain-driver 459(+3 / --git e2e: BR per-rule+domain coarse)] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.18.0]) — 직전 v0.17.0 (2026-06-07 / **living-sync carry 1 — 변경 자동 감지 → per-BR auto-origin**[`sync-loop --br-diff <ref>`: business-rules.json 을 git old↔new **per-rule diff**(canonical hash) → 변경 rule → **per-BR 노드 origin 자동 seed** → regen_queue. S6 per-BR 정밀화를 파일변경 경로에도 실현(기존 resolveOriginNodeIds 는 BR.json 변경 시 parent+전 per-BC+전 per-BR coarse). Senior REVISE@0.84 4-fix: **BLOCKER-1** BC-less rule(per-BR 노드 부재)=부모 coarse fallback(silent drop ❌)·**MAJOR-2** git ref 선검증(bad-ref vs new-file / 날조 drift ❌)·MAJOR-3 결정성·MAJOR-4 arg parser. carry 2(fixpoint 자동 재진입)=DEFER·carry 3(--apply durable write)=DROP(propose-only 패러다임). 검증 chain-driver 456(+8 / tmp-git e2e: 1 rule 수정→그 per-BR+소비 item 만)] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.17.0]) — 직전 v0.16.0 (2026-06-07 / **living-sync S6 — business-rules per-BR granularity (additive)**[per-BC 자식을 한 단계 더 — distinct business rule 당 per-BR 노드(`analysis-business-rules-<BR-id>`) 추가 + route(S1)가 br_id→per-BR 최우선 4-tier dispatch → 한 rule 변경의 영향 = 그 rule 을 개별 참조한 item 만(per-BC over-propagation 제거). **ADDITIVE**(per-BC 노드·엣지 유지 / Phase 4 동형 / 무회귀) — drift=scope-level(per-rule 무관)이라 per-BC Layer-1 은퇴 불요. Senior step-0=DEFER@0.86 권고였으나 사용자 BUILD-NOW 결단 / Senior coupling 우려는 additive(엣지 retire 안 함)로 무효화. §8.1 2-도메인: poc-18(Express/TS 2-BC / BR-POST-AUTHORSHIP-001 영향 10→2 item 5:1 제거) + poc-19(Python numpy-financial 4-BC) / schema business_rule_id additive / graph-synth 170·chain-driver 448] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.16.0]) — 직전 v0.15.0 (2026-06-07 / **living-sync S5 — 부모 coarse 엣지 은퇴(진짜 분할)**[Phase 4 선택적 종단 — per-rule 부모 coarse cross_reference(Layer 1 br_refs·related_brs)를 per-BC 자식이 인수 시 은퇴 → 한 BC rule 변경이 전 BC behavior 로 누수하던 latent over-propagation 차단 / 3-tier fail-open(BC-less·자식부재·non-BR kind=부모 coarse fallback / silent false-health 차단) / whole-artifact 참조(Layer 3/4 meta.related_chain_ids·to_analysis_artifacts)는 per-rule id 부재라 부모 coarse 유지가 정답 / Senior REVISE@0.80 전건 사실검증: emit 4-Layer 범위 정밀화·false-health hole 부재·2285 safety-net flip·stat 변동 RR#13 무영향·golden 재생성❌ / graph-synth 163] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.15.0]) — 직전 v0.14.0 (2026-06-07 / **living-sync S2 — drift subset-hash**[Phase 4 선택적 #2 / 구 Phase 3b — 공유 business-rules.json cross-scope drift FP 제거: scope 가 --bc 로 선언한 BC subset 만 재hash(BR 한정 / 그 외 file-hash) → BC-POST 변경이 BC-USER scope drift ❌ / register·detect·cascade 공유 결정적 subset 헬퍼 / Senior REVISE@0.83: BLOCKER-1 cascade 퇴화 fix·BLOCKER-2 재귀 canonical 직렬화·Ajv 테스트·synthetic opt-in / chain-driver 445] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.14.0]) — 직전 v0.13.0 (2026-06-07 / **living-sync S1 — route-discovery per-BC dispatch**[Phase 4 선택적 #1 — discovery br_intent 매칭 br_id 를 coarse 부모 대신 per-BC 자식 analysis-business-rules-<BC> origin 으로 직접 라우팅(정밀 forward) / 3-tier: 자식 존재→정밀·자식 부재(BC 없음/미재합성)→부모 fallback·둘다 부재→net-new / 무회귀(미재합성 graph=부모 fallback / poc-05 e2e 유지) / Senior REVISE@0.88: 3-tier 순서·analysisBrList 재사용·positive 테스트·stale 주석 / chain-driver 437] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.13.0]) — 직전 v0.12.0 (2026-06-07 / **living-sync Phase 4 펀더멘털 — business-rules BC별 노드 분할**[additive 그래프 의존성 정밀화 — 단일 analysis-business-rules 가 BC 양쪽 coarse 의존 → 부모 유지 + bounded_context 당 자식 노드 추가(per-BC cross_reference·code_pointers / impact(자식)=그 BC만) / replace 3 BLOCKER(dangling·A2·federator) additive 로 소멸=무회귀 / Senior REVISE@0.88: F-B1 스키마+Ajv guard·F-M1 route 정확id·F-m2 결정성 / 소비자재배선·부모은퇴=S1~S5 선택적] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.12.0]) — 직전 v0.11.0 (2026-06-07 / **living-sync Phase 3a — cross-scope drift 기계 활성화**[기존 detectDrift/markDrift/cascade 가 `sync_sources` 미충전으로 dead-fed 였던 것을 live 로 — 신규 `registerCanonicalSources`(canonical 분석 deliverable 존재분을 scope sync_sources[path+hash baseline] 등록) + `chain-driver sync`(no-scope) first-touch 자동 baseline → markDrift / markDrift 코어 순수[SessionStart 무영향] / **Senior REVISE@0.82 전건 사실검증**: #1 BLOCKER=allowlist 개념라벨→실 파일명(business-rules.json/db-schema.json) fix(false-health 차단)·#2 manual→자동 first-touch·#3 stale-baseline·#4 coarse hash=FP>FN trade·#5 2-scope=1도메인 합성] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.11.0]) — 직전 v0.10.0 (2026-06-07 / **living-sync Phase 2c — reconcile 결단 보조**[`lift --reconcile` 출력 강화(순수 reporting·mutation 0) — carry-A: content_drift flag 에 재전파 천장 후보 동봉(anchor-self 제외[IMPL=forward-leaf no-op]·재전파=하류 TASK/TC 재생성[코드 ❌] vs 재앵커 안내) / carry-B′: relocation 에 durable source-locator 동봉(graph=파생물→source 산출물 위치 IMPL=impl-spec·TC=test-spec / write ❌ propose-only) / **findRelocation 실 git 버그 fix**(pathspec 제거 — 구버전 fake 로만 검증돼 잠복한 committed-rename 미탐을 실 git mv fixture 로 노출·수정) / Senior REVISE@0.83 전건 사실검증] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.10.0]) — 직전 v0.9.0 (2026-06-07 / **living-sync Phase 2b — `chain-driver lift --reconcile`**[손수정 코드 ↔ anchor 관측사실 git 신선도 / Phase 2 lift 의 reconcile 절반 — anchor strict_path pointer 를 detectContentDrift(worktree)+findRelocation 재탐지 → 분류: relocation=관측사실 후보·content_drift+intent=flag(자동 덮어쓰기 ❌·propose-only·그래프 mutation ❌) / git 프리미티브 `_shared/code-pointer-git.js` 추출(code-pointer-validator re-export) / Senior REVISE@0.82 전건 사실검증: content_drift 재앵커=의미판정→flag-only·stamp stale 2-도메인 메커니즘·clean=tmp-git] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.9.0]) — 직전 v0.8.0 (2026-06-07 / **living-sync Phase 2 — `chain-driver lift`**[forward-only 의 유일 reverse 예외=손수정 코드 / 변경 코드파일 → 주인 노드 anchor(결정론 code_pointers) → backward 조상=의미 천장 후보 surface → 사람이 `--ceiling` 명시 시 그 천장부터 forward 재전파 → regen_queue / 의미 천장=사람 only·auto-climb ❌ / 명시 천장 없으면 surface-only propose-only / 손수정 anchor closure 제외 / `--ceiling` ancestry guard·오-천장 exit 3 / reconcile=Phase 2b 분리 / Senior REVISE@0.83 전건 사실검증] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.8.0]) — 직전 v0.7.0 (2026-06-07 / **living-sync Phase 1b — `chain-driver route` 의미 라우터**[discovery-spec(LLM 산출)의 명시 매핑 use_cases.id/business_rules_intent.br_id → 진입 origins → regen_queue / UC=노드 직접 매칭·br_id=analysis content 매칭→coarse 노드 / net-new=propose 보고 / br_intent+`--analysis` 부재=fail-closed / 0-origin=propose-only exit 0 / v1 token 버전 Senior 거부 → v2 명시매핑 전환] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.7.0]) — 직전 v0.6.0 (2026-06-07 / **living-sync Phase 1c — `chain-driver sync-next`**[regen_queue 를 **stage 단위**로 소비 → 재생성 지시 surface → stage gate 재실행 → drift 해소 / 죽은 pending_revisit 의 산 대체 / 큐-block 은 regen_queue.blocked 전용·`state.blocked` 미접촉 zero-regression / Senior REVISE node-gate→stage-gate 정정] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.6.0]) — 직전 v0.5.0 (2026-06-07 / **living-sync Phase 1 MVP — `chain-driver sync-loop`**[변경 origin → forward 단방향 영향 closure → 순서화 regen_queue worklist / 결정론·비-gating / drift=파생·그래프 비영속 / analyzeImpact+topo+cascade 재사용] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.5.0]) — 직전 v0.4.0 (2026-06-07 / **BR-split STEP 2 — business-rules 로딩 `_shared` 중앙화**[strict canonical + analysis 4-shape normalizer + loadBusinessRules / STEP 3 분할 single-point 토대] + discovery-extraction silent mis-fire fix[`shape_unrecognized`] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.4.0]) — 직전 v0.3.0 (2026-06-07 / **business-rules `bounded_context` required 승격**[BR↔모듈 추적성 + BC별 분할 토대] + scope-local `*.subset.json` 폐기[SSOT 단일 / subsetAnalysisRefs in-memory 필터] / BR-split 순차안 STEP 0+1 / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.3.0]) — 직전 v0.2.0 (2026-06-07 / PMD Tier 1 in-plugin 자동실행 격상 + R19 Tier 축 "실행 locus" 명문화) — 직전 v0.1.0 (2026-06-06 / 플러그인 식별자 rename ai-native-methodology → context-ops · npm `@mis-plugins/context-ops` · 버전 스킴 **0.x 리셋**[pre-1.0 · 사내 미배포] / 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.1.0]). pre-reset lineage(v12.x) — 직전 v12.15.2 (2026-06-05 / **chain/gate 번호 System Y 정합** — shipped 운영 파일(deliverables·skills·templates·tool README·schema)의 구 System X(test=3·impl=4) → canonical(test=4·implement=5 / chain N=gate #N) 일괄 정정 / PATCH) — 직전 v12.15.1 (2026-06-05 / **잔여 출하 prose provenance 정리 + check40 scope 확장** — guides/templates/flows/hooks 14파일 본문 거버넌스 마커 제거 + `## 인용` footer 일원화 / check40 `SHIPPED_DIRS` 에 4개 디렉토리 추가(`templates/adoption/` skip) / ticket-sync SG-MIS env-config 참조 `allow-identity:` 정당 예외 → identity 게이트 40/40 복구 / 동작 무변경 / PATCH) — 직전 v12.15.0 (2026-06-05 / **shipped 산출물 provenance 정리** — skills/agents/methodology-spec 본문 거버넌스 내용(버전 변천사·DEC·PoC 증거·LL·backlog carry) 제거 + 출처 `## 인용` footer 일원화 / finding-ledger·cycle-carry 반출 / check40 재누적 가드 (39→40 게이트) / 동작 무변경 / MINOR) — 직전 v12.14.0 (2026-06-04 / **codegraph wiring STEP 6** — openapi 정적 검증: codegraph 의 유일 비중복 신규 niche(Specmatic/optic/schemathesis 는 runtime Actuator·spec-only → 정적 "코드有 계약無"·controller-anchor·auth-grounding 을 running app 없이 못 봄). `--openapi-coverage` 3-sub — (a)verb-diff(codegraph route ∖ openapi.yaml / basePath 정규화 / degenerate path=informational) (b)controller-anchor(openapi-extension controller_method ∖ codegraph 심볼 = stale / STEP 4 역방향 set-diff 재사용 / live·stale·informational 3-state) (c)auth-grounding(reading-aid / @PreAuthorize 내용 검증 ❌·finding 미산출) / reference-lens 비차단 check39(+context-federator 간접 leak 가드) / §8.1 2-도메인 dogfood: verb-diff data-2domain(poc-01 19/19 perfect + poc-02 honest) + controller-anchor 3-state(poc-02 live + poc-01 informational + stale=probe) / call-chain·sql-inventory·sequence·migration·plan-org·input-adapters=carry(jurisdiction 중복/semantic) / 로드맵 마지막 슬라이스 / MINOR) — 직전 v12.13.1 (2026-06-04 / **Windows 설치 결함 수정** PATCH — `scripts/` 패키징 누락(files+build-plugin INCLUDE 양쪽) + SessionStart 훅 `bash` → `node` 크로스플랫폼화(install-static-tools.js 신규): Windows 신규 설치 시 SessionStart 훅 실패 해소 / .sh 는 POSIX 직접 실행용 보존) — 직전 v12.13.0 (2026-06-04 / **codegraph wiring STEP 5** — context-cache callees 증분: context-federator 가 심볼에 `callees`(하류 1-hop 직접 협력자)를 기존 callers(상류)+impact(transitive)에 더해 부착 → "이 메서드 고칠 때 알 직접 협력자" 노출 / codegraph 0.9.6 `callees` CLI-native 최소증분 / reference-lens 비차단(check38 = federator 첫 trust 가드) / §8.1 2-도메인 실 dogfood: poc-05 modern TS full e2e(callees_resolved=29 / schema-valid / 무회귀) + poc-08 Java Spring+MyBatis3 mechanism corroboration(insertOrder→OrderMapper.xml MyBatis 매퍼) / 2nd 도메인 full e2e pack=carry / MINOR) — 직전 v12.12.0 (2026-06-04 / **codegraph wiring STEP 4** — ast_symbol stale-anchor verify(함수단위 추적성): 산출물 ast_symbol 앵커 ∖ codegraph 심볼 = **stale/dangling anchor**(STEP 1~3 coverage-hole 의 **역방향 set-diff** / code-pointer-validator 가 못 하는 symbol 실재 검증 / `--verify-anchors` 단일 축 / reference-lens 비차단) + codegraph 사각(미인덱스 file=iBATIS2/동적)=`informational_notes` 구조적 격리(severity 부재·not a defect) + §8.1 = **mechanism corroboration only**(전 도메인 ast_symbol 앵커=0 → real-symbol probe 2-도메인 live/stale/informational 분류 입증 / in-the-wild stale 미관찰=정직표기 / data-corroboration 아님) / (α)함수앵커제안=federator 소관 cut / check37 / MINOR) — 직전 v12.11.0 (2026-06-04 / **codegraph wiring STEP 3** — module dependency coverage-hole: codegraph **cross-file edge**(calls/references/instantiates/extends/implements / imports 제외) 를 architecture.json modules[] 로 rollup → module→module 그래프 ∖ arch.json dependencies[] = **LLM 놓친 결정론 의존** 노출(reference-lens / "대치" 아니라 **결정론 corroboration lens** / arch.json 무수정 / Option B[SKILL 직접 emit] reject) + onlyArch(codegraph 사각=런타임 DI/decorator)=`informational_notes` 구조적 격리(severity 부재·not a defect) / check36 / 2-도메인 corroborated(RealWorld +22 / ecommerce +8) / MINOR) — 직전 v12.10.0 (2026-06-04 / **codegraph wiring STEP 2** — finding 채널(codegraph→finding-list): coverage-hole 을 finding-system shape **promote-ready 레코드**로 export(`--emit-findings` / `discoverer:'codegraph'`+`code_graph_ref`+`status:candidate` / finding_id 는 사람 promote 시 F-XXX 배정) + finding-system.schema.json `code_graph_ref` optional + conditional severity ceiling(code_graph_ref⟹low|medium) + handler-set reading-aid(implements/extends / ecommerce 1-도메인 정직) — cycle·orphan seed 는 실측 false-positive 압도로 **전면 carry**(STEP 3+) / reference-lens 비차단 / check35 / 2-mechanism MINOR) — 직전 v12.9.0 (**codegraph wiring STEP 1** — coverage-hole 공통 메커니즘 / check34) — 직전 v12.8.0 (dep-graph **trace-view** — view-time 렌더 / reference-lens check33) — **v12.0.0 MAJOR json-only 산출물 (`.mermaid` + `.md` dual-rendering twin 전면 폐기 → 산출물 `.json` 단독 SSOT / 완전 AX-native / ADR-008 Superseded + ADR-011)** + v11 paradigm (BE/FE 산출물 분리 + contract 강제 양 axis) + Living dep-graph (analysis↔code 앵커 / A2 drift 동기화) + S2(AX전환 주 타깃) gate block / 사용자 요구사항 18 모두 청산 (R1~R18 / R16·R17 영구 scope-out) / release-readiness strict 전수 통과 / CLAUDE.md·README ↔ plugin.json version drift 자동 enforcement (R2) / 분석 입력 5종 orchestrate (코드 + Figma + Swagger + 기획문서 + 자연어 prompt) / FE skill (React/Vue/Playwright/state-map/visual-manifest/type-spec) / scope·stage 자동 폴더 + `manifest.json` 단독 (v12 ADR-011) / lifecycle 자산 매핑 매트릭스 단일 SSOT. (자산 개수·테스트 수 등 정확한 인벤토리는 [CHANGELOG.md](./CHANGELOG.md) 최신 entry 또는 `/plugin` manager 참조 — 본 README 는 버전·카운트 하드코딩을 최소화.)
>
> Analysis stage = 한 방향 추출 (v1.x 자산 = chain 1 진입 전 단계로 흡수 / AX 전환의 출발 입력). v2.0 paradigm = 분석 stage 위에 chain harness + revisit loop + 70~80% 한계 명시. v3.x = Gap 청산 + enforcement cadence 정착 + 자산 대칭 완성. v9.0 = 6-stage chain (analysis→discovery→spec→plan→test→implement). v10.0.0 = 5 gate 본격 (discovery #1 / spec #2 / plan #3 / test #4 / impl #5 / chain N = gate #N 1:1 INTERNAL CONVENTION). v11.0.0 = BE/FE 산출물 분리 paradigm + contract 강제 양 axis (BE = swagger / FE = state-map + visual-manifest + DTCG token) + ticket = plan stage 단일 (Epic/Story/OP/TASK 4-level).
>
> 자세한 변경 이력 = [CHANGELOG.md](./CHANGELOG.md) (v2.6+) / [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md) (v8.x 이전).

---

## 무엇을 하는가

조직의 SDLC 를 **AI-Native** 협업 구조로 전환한다. AI 가 단계별 산출물을 자동 생성하고, 사람은 각 gate 에서 검토·결단한다. 입력은 기존 시스템 자산(소스/스키마/문서/디자인), 출력은 검증 가능한 산출물 체인과 그 결과로 운영되는 시스템.

```
INPUT:
  기존 시스템 자산 (소스 / ERD / ORM / 운영 DB / 기획 문서 / 디자인 명세)

  ↓ analysis stage (chain 1 진입 전 / 한 방향 추출 — AX 전환 출발 입력)
  ↓
[CHAIN 1] discovery-spec (discovery stage)      ── go/stop gate #1
  ↓
[CHAIN 2] behavior-spec
        + acceptance-criteria
        + 7대 산출물 통합              ── go/stop gate #2
  ↓
[CHAIN 3] task-plan (task 분해 / ADR / NFR / risk)  ── go/stop gate #3
  ↓
[CHAIN 4] test-spec + 실 test 코드 (RED 의무)  ── go/stop gate #4
  ↓
[CHAIN 5] impl-spec + 실 impl 코드 (GREEN / 100% test pass)  ── go/stop gate #5
  ↓
OUTPUT: AI-Native 로 운영되는 시스템 + traceability-matrix (UC→BHV→AC→TASK→TC→IMPL+commit_hash)
```

AI 자동화 ≥ 85% / 사람 검토 (gate별) ≤ 15% / **70~80% 한계 명시 잔존** (**chain harness 전체 자동화 axis** / process 통과율 metric / DEC-2026-05-06-v2.0-i-strict-채택 + DEC-2026-05-06-round-trip-부분-허용).

**analysis 단계 §3-A automation axis = 별도 axis** (R1' / DEC-2026-05-13-r1-prime-본체-명문화 / 6 PoC 사실 robust):

| paradigm                                             | analysis §3-A ceiling | corroboration                             | 측정 환경                          |
| ---------------------------------------------------- | --------------------- | ----------------------------------------- | ---------------------------------- |
| Spring 4.1 + iBATIS 2 (Legacy)                       | **~53~55%**           | 3 사내 PoC isomorphic (PoC #06+#07+#11)   | 사내 EFI-WEB                       |
| Modern stack (MyBatis 3 / TypeORM / Spring Data JPA) | **~60~67%**           | 3 OSS PoC corroboration (PoC #08+#09+#10) | OSS 한정 / 사내 Modern 재측정 의무 |

metric 분모 자체 다름 — chain harness axis = chain 1~5 통합 gate 통과율 / §3-A axis = analysis 단방향 추출률. 외부 권위 STRONG: Wang et al. ICSE 2025 (DUR legacy 70~90% vs up-to-date 9~18%) + LongCodeBench 2025 (context length ↑ → 정확도 ↓) + AWS SCT 자릿수 정합 (Functions 66.4%) + ThoughtWorks "GenAI for forward engineering" 사상 isomorphic. **R1' = industry first paradigm-cross axis quantification (original empirical finding)**. 자세히 `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X 참조.

---

## chain harness validated 자격 (§8.1 strict / release-readiness)

`npm run release:check --target v<version>` 가 **§8.1 strict criterion 전수**를 검사 — 전부 ✅ 일 때만 release-ready. 검사 영역(대표):

- **PoC corroboration / real-tool evidence (5종 물증)** — 다수 PoC 본격 + sha256 검증된 실 도구 물증 (no-simulation R19 Tier).
- **chain·matrix coverage / e2e GREEN** — UC→BHV→AC link ≥ 0.85 + traceability matrix green + chain RED→GREEN cycle pass.
- **validators / analysis / Layer 2 정합** — chain·analysis validator 0 critical/high + Layer 2 per-PoC drift 0.
- **drift enforcement (R2)** — CLAUDE.md·README ↔ plugin.json version sync + 출하 자산 사내 신원 누출 0 + adoption 템플릿 paradigm 정합.
- **graph / code-pointer / gate / template 정합** — artifact-graph cycle 0 + code_pointer coverage 100% + gate enum {#1~#5} + template count drift 0.
- **authoring-spec staleness (R18) / skill-citation / preflight** — 공식 docs pin fresh + active doc 인용 0 stale + 외부 도구 환경 진단.

전체 criterion 목록·개수·상세 = `scripts/release-readiness.js` 또는 `release:check` 출력 (본 README 는 criterion 개수를 하드코딩하지 않음 — drift 회피 / self-test 가 개수·id 정합 보증).

Platform-Agnostic 입증 — Java/Spring + Java/Hexagonal + TypeScript/NestJS + TypeScript/React FSD + Modern ORM (MyBatis 3 / TypeORM / JPA QueryDSL) + 사내 Spring 4.1 + iBATIS 2 (PoC #01~#16).

---

## 시작하기

> **아무것도 안 깔린 PC에서 처음 설치**한다면 → repo 루트의 [`INSTALL.md`](../INSTALL.md) (Node → git/GHE 인증 → Claude Code → plugin install 5단계 / Windows·macOS).

### 사전 요구사항

- Claude Code 설치 (plugin 시스템 지원)
- 분석 대상 프로젝트 git clone (analysis stage 입력 자산)
- (선택) ERD 파일, 운영 DB 메타데이터, 기획 문서
- (Windows 한국어 환경 / Semgrep 사용 시) `PYTHONUTF8=1` 환경변수
- Node ≥ 22 (chain-driver / workspace tool 실행)

### 사용법 — Plugin install

#### A. 편집자 — 워크스페이스 직접 등록 (Phase A self-iteration)

본 repo 를 clone 하여 plugin 본체를 직접 수정. 워크스페이스 path 그대로 등록.

```bash
# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology/ai-native-methodology
/plugin install context-ops@mis-plugins
/reload-plugins
/plugin                  # 대화형 manager — Installed 탭에서 최신 버전 확인
```

#### B. 배포 수신자 — 사내 사용자 install (사내 표준)

##### B-1. 사내 GHE git URL 기반 (Recommended)

사내 GHE (`github.smilegate.net/SGH-ISD/ai-native-methodology`) 의 read 권한 + git 인증만 있으면 install. 별도 dist artifact 전달 ❌.

```bash
# 사내 GHE 인증 1회 (gh CLI 권장 / SSH key 도 가능)
gh auth login --hostname github.smilegate.net

# Claude Code 세션에서:
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
/plugin install context-ops@mis-plugins
/reload-plugins
```

특정 버전 pin (권장 — git tag):

```bash
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git#v<version>
/plugin install context-ops@mis-plugins
```

plugin update — `/plugin` 대화형 manager → Installed 탭 → "Update" → 최신 tag 자동 fetch.

##### B-2. dist artifact 폴더 등록 (오프라인 / 특수 환경)

빌드된 artifact (`dist/ai-native-methodology-v<version>/` 폴더 또는 zip 압축본) 을 받아 install. 폴더 자체에 `.claude-plugin/{plugin.json, marketplace.json}` 가 들어있어 자기완결.

```bash
# 받은 dist 폴더를 임의 위치에 풀기:
#   ~/claude-plugins/context-ops-v<version>/
#   ├── .claude-plugin/{plugin.json, marketplace.json}
#   ├── agents/ skills/ hooks/ flows/ templates/ tools/ methodology-spec/ schemas/
#   ├── CHANGELOG.md / CHANGELOG-HISTORY.md / README.md / CLAUDE.md
#   └── CHECKSUMS.txt   ← SHA256 manifest (무결성 검증)

# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology-v<version>
/plugin install context-ops@mis-plugins
/reload-plugins
```

`CHECKSUMS.txt` 로 무결성 검증 — 배포자가 별도 채널 (사내 wiki / Slack pin) 으로 hash 제공 시 대조.

#### 빌드 (A → B artifact 생성)

편집자가 dist artifact 를 새로 만들 때:

```bash
# version 갱신 시 3-way sync 의무 (source-of-truth = .claude-plugin/plugin.json — ADR-010)
#   .claude-plugin/plugin.json.version  ↔  CHANGELOG.md 첫 ## [vX.Y.Z]  ↔  package.json.version
npm run version:check       # 3-way sync 검증 단독
npm run build               # version-check 강제 → dist/ 생성 + CHECKSUMS.txt
npm run build:check         # dry-run (file count 만 출력)
npm run build:diff-check    # build 후 git diff exit-code 0 검증 (CI 용)
npm run release:check       # §8.1 strict criterion 전수 자동 검사
npm run test                # workspace tool unit test (전수 pass / 0 fail)
```

분석 대상 사내 프로젝트 디렉토리에서 새 Claude Code 세션 시작 → SessionStart hook 메시지 ("chain harness ready") 표시 시 정상 작동.

### 사용법 — chain harness 진입 시나리오

#### 시나리오 A — Analysis stage 만 (분석 단독 / chain 1 미진입)

자연어 prompt → skill 자동 발동:

| 자연어 prompt             | 발동 skill                     |
| ------------------------- | ------------------------------ |
| "이 코드베이스 분석 시작" | `analysis-input-collection`    |
| "inventory 추출해줘"      | `analysis-source-inventory`    |
| "아키텍처 분석"           | `analysis-architecture`        |
| "도메인 모델 추출"        | `analysis-domain-model`        |
| "비즈니스 규칙 추출"      | `analysis-business-rules`      |
| "OpenAPI 만들어줘"        | `analysis-openapi` (BE)        |
| "DB schema + ERD"         | `analysis-db-schema-erd` (DB)  |
| "antipattern 정리"        | `analysis-quality-antipattern` |

aspect skill 4종 (a11y / i18n / static-security / legacy) = 코드베이스 시그널 자동 매칭. cross_cutting (phase 무관).

#### 시나리오 B — chain harness e2e (6-stage paradigm)

```
1. chain-driver init <project>      → state.json 초기화
2. "발견 단계 시작"                  → discovery-from-analysis-output / discovery-decompose-use-cases / discovery-identify-business-intent
   → discovery-spec.{json,md} 산출
   → gate #1 (discovery-extraction-validator) 통과
3. "behavior spec / acceptance criteria 도출"
   → spec-compose-behavior-spec / spec-derive-acceptance-criteria / spec-integrate-deliverables
   → behavior-spec + acceptance-criteria + 7대 통합 (BE = swagger / FE = state-map + visual-manifest + DTCG token)
   → gate #2 (chain-coverage-validator / UC→BHV→AC ≥ 0.85) 통과
4. "plan / task 분해 / ADR / NFR / risk"
   → plan-decompose-and-sequence / plan-architect-decisions / plan-risk-and-nfr
   → task-plan.{json,md} 산출 (Epic / Story / OP / TASK 4-level + ticket = plan stage 단일)
   → gate #3 (plan-coverage-validator / NFR allocation hard gate + ADR alternatives ≥3) 통과
5. "test spec 생성 RED 의무"
   → test-generate-test-spec / test-run-test-evidence / test-verify-coverage
   → test-spec + 실 test code (RED — 실패 입증 / impl 부재)
   → gate #4 (spec-test-link-validator / AC→TC ≥ 0.85 + RED) 통과
6. "impl spec 생성 GREEN 의무"
   → implement-generate-impl-spec / implement-verify-test-pass
   → impl-spec + 실 impl code (GREEN / 100% test pass)
   → gate #5 (test-impl-pass-validator / 실 test runner / 100% pass) 통과
7. "traceability matrix"
   → _base-build-traceability-matrix
   → UC→BHV→AC→TASK→TC→IMPL+commit_hash matrix 산출
```

**Mechanical gate trio** — (i) state.blocked + (ii) cli exit 2 + (iii) PreToolUse permissionDecision=deny. LLM "통과한 척" 시뮬레이션 ❌ enforcement.

**Chain-revisit detector** — git diff 기반 skill auto-invoke / state.blocked 전환 가능.

#### 시나리오 C — manual fallback (plugin 미사용)

`methodology-spec/workflow/phase-*.md` + `methodology-spec/lifecycle-contract.md` 직접 차례로 적용.

---

## 디렉토리 구조 (dist artifact 기준)

```
dist/ai-native-methodology-v<version>/
├── .claude-plugin/
│   ├── plugin.json                   v<version> manifest
│   └── marketplace.json              git-subdir source (자기완결)
├── CLAUDE.md                         사내 적용 정책 inline (자동 로드)
├── README.md                         ← 본 파일 (plugin user 진입점)
├── CHANGELOG.md                      v2.6+ 최근 release entry
├── CHANGELOG-HISTORY.md              v8.x 이전 archive
├── CHECKSUMS.txt                     SHA256 manifest (무결성 검증)
│
├── agents/                           6 chain stage agent (analysis/discovery/spec/plan/test/implement) + design placeholder + _base 3 persona
├── skills/                           skill (flat 디렉토리 / 의미 ID / 개수는 CHANGELOG·/plugin 참조)
│   ├── _base-*                       invoke-go-stop-gate / build-traceability-matrix / log-finding / apply-template / apply-baseline-ratchet
│   ├── analysis-*                    phase 0~6 + aspect 4 (a11y/i18n/static-security/legacy) + 입력 어댑터(figma/swagger/plan-doc/prompt) + FE(form/type/ui-state-map/ui-visual-manifest/html)
│   ├── discovery-*                   6 — from-{analysis-output,swagger,figma,nl-md} / decompose-use-cases / identify-business-intent
│   ├── spec-*                        3 — compose-behavior-spec / derive-acceptance-criteria / integrate-deliverables
│   ├── plan-*                        3 — decompose-and-sequence / architect-decisions / risk-and-nfr (v10.0.0 본격)
│   ├── test-*                        4 — generate-test-spec / run-test-evidence / verify-coverage / playwright
│   ├── implement-*                   4 — generate-impl-spec / verify-test-pass / react / vue
│   ├── ticket-sync                   1 — plan stage Epic/Story/OP/TASK 4-level cascade (v11.0.0)
│   ├── dep-graph-navigator           1 — artifact dependency graph 탐색
│   └── session-handoff               1 — 세션 간 운영 컨텍스트 인계 (.ai-context/HANDOFF.md / 고정 6절)
├── hooks/
│   └── hooks.json                    UserPromptSubmit + PreToolUse (chain-driver hooks-bridge / D21' suppressOutput=true)
├── flows/                            15 file (sdlc-4stage master SSOT + 6 phase-flow {json,mermaid} + README)
│   ├── sdlc-4stage-flow.{json,mermaid}     chain harness master SSOT
│   ├── analysis.phase-flow.{json,mermaid}  v1.x 자산 (chain 1 진입 전)
│   └── {discovery,spec,plan,test,implement}.phase-flow.{json,mermaid}
│
├── tools/                            workspace tool (npm workspace / 개수·test 수는 CHANGELOG 참조)
│   ├── chain-driver/                 harness driver (cli + module / gate trio enforcement)
│   ├── drift-validator/              .json ↔ .md/.mermaid 동일성 + chain layout + state-flow + outputs 비교
│   ├── schema-validator/             chain 산출물 schema 검증
│   ├── analysis-extraction-validator/   analysis stage source-grounded hard gate (v11.0.3)
│   ├── discovery-extraction-validator/  gate #1 / source-grounded ≥ 0.80
│   ├── chain-coverage-validator/        gate #2 / UC→BHV→AC ≥ 0.85
│   ├── plan-coverage-validator/         gate #3 / NFR allocation + ADR alternatives ≥3 + BE/FE 1:1
│   ├── spec-test-link-validator/        gate #4 / AC→TC ≥ 0.85
│   ├── test-impl-pass-validator/        gate #5 / 100% pass + result_hash 정규화
│   ├── traceability-matrix-builder/     release matrix (UC→…→IMPL)
│   ├── graph-integrity-validator/       artifact dep-graph cycle/orphan 검사
│   ├── code-pointer-validator/          code_pointers[] 실존 검증
│   ├── br-cross-consistency-validator/  business-rule 교차 정합 (industry-first)
│   ├── skill-citation-validator/        active doc 인용 dead-link
│   ├── decision-table-validator/        dmn-check 5종
│   ├── formal-spec-link-validator/      Phase 4.5 cross-link
│   ├── sql-inventory-validator/ characterization-coverage-validator/ findings-aggregator/ inflation-lint/
│   ├── spectral-runner/                 OpenAPI lint (진짜 외부 도구)
│   └── static-runner/                   Semgrep (Tier 1) + SARIF import (Tier 2 / PMD·SpotBugs·CodeQL·Daikon) — R19
│
├── templates/                        analysis 21 + chain stage 6 (discovery/spec/plan/test/implement) body
│
├── methodology-spec/                 Single Source of Truth
│   ├── workflow/                     phase-0 ~ phase-6 + 4.5
│   ├── deliverables/                 1-architecture ~ 7-ui-ux + chain (discovery/behavior/acceptance/task-plan/test/impl/matrix)
│   ├── lifecycle-contract.md         SDLC stage 간 data contract + 자산 매핑 매트릭스
│   ├── plugin-charter.md             사용자 요구사항 18 단일 SSOT (R1~R18)
│   ├── plugin-authoring-spec.md      Skill·Hook·Agent·Packaging 저작 규칙 (R18)
│   ├── skills-axis.md                phase ID ↔ skills 디렉토리 axis 분리 정책
│   ├── glossary-ko.md / id-conventions.md / finding-system.md / be-fe-separation.md
│
└── schemas/                          JSON Schema (모두 top-level additionalProperties:false strict / 개수는 CHANGELOG 참조)
    ├── chain: discovery-spec / behavior-spec / acceptance-criteria / task-plan / test-spec / impl-spec / traceability-matrix
    ├── contract: openapi-extension / state-map / visual-manifest / (DTCG token)
    ├── dep-graph: artifact-graph-node / artifact-graph-edge / code-pointer
    ├── state.schema.json / intervention-log.schema.json / work-unit-manifest.schema.json
    └── (BE/FE/analysis 공통 — meta-confidence / architecture / domain / business-rules / db-schema / antipatterns / ui-spec / inventory / formal-spec / finding-system / etc)
```

workspace 본체 (`docs/` / `archive/` / `decisions/` / `examples/` / `scripts/`) 는 dist 미포함 (개발 자산 / build script EXCLUDE).

---

## 7원칙 (헌법)

1. **사상 명시**: Schema-First + Contract-First + DDD-Lite + FSD
2. **Bottom-up Always**: Function → File → Module → System
3. **Deterministic First, LLM Second**
4. **File System as Memory** (단계 간 통신 = 파일)
5. **Confidence as First-Class** (모든 산출물에 신뢰도 메타)
6. **Human-in-the-loop** (chain harness gate 5 (#1~#5) + revisit loop)
7. **Single Source of Truth = Repo** (문서/플러그인은 레포 파생)
8. **한국어 1차** (영어 약어 최소화, 산업 표준 예외)

---

## 검증 도구 사용 (workspace tool / npm workspace)

```bash
# Chain harness driver (진입)
node tools/chain-driver/src/cli.js init <project>
node tools/chain-driver/src/cli.js next         # next stage 진입 / blocked 면 exit 2
node tools/chain-driver/src/cli.js state        # 현재 stage / blocked 여부

# Phase 4.5 검증 (analysis stage)
node tools/drift-validator/src/cli.js {산출물 경로}/formal-spec/
node tools/decision-table-validator/src/cli.js {산출물 경로}/formal-spec/decision-tables/
node tools/formal-spec-link-validator/src/cli.js {산출물 경로}/formal-spec/

# Chain harness validator (gate #1~#5)
node tools/discovery-extraction-validator/src/cli.js  # gate #1 (discovery)
node tools/chain-coverage-validator/src/cli.js        # gate #2 (spec)
node tools/plan-coverage-validator/src/cli.js         # gate #3 (plan)
node tools/spec-test-link-validator/src/cli.js        # gate #4 (test)
node tools/test-impl-pass-validator/src/cli.js --allow-execute  # gate #5 (실 test runner / implement)
node tools/traceability-matrix-builder/src/cli.js     # release

# 외부 도구 (no-simulation 의무)
cd tools/spectral-runner && npx spectral lint <openapi.yaml>
node tools/static-runner/src/cli.js --plugin semgrep --target ./src --output ./out

# Schema 검증 (모든 chain 산출물)
node tools/schema-validator/src/cli.js
```

CI 자동화 = `.github/workflows/drift-check.yml` (PR / nightly / manual dispatch).

---

## 분석 입력 가변성

```
필수: 소스 코드
선택: ERD / ORM / 운영 DB / 기획 문서 / 디자인 명세 / 설정 파일

입력이 많을수록 신뢰도↑:
- 소스만:                      평균 75%
- 소스 + ERD:                  평균 85%
- 소스 + ORM:                  평균 88%
- 소스 + ORM + ERD + 운영DB:   평균 96%
- 모든 입력:                   평균 98%
```

신뢰도 메타데이터를 모든 산출물에 명시 (`schemas/meta-confidence.schema.json`).

---

## 사상적 기반

| 사상                     | 채택          | 출처                                            |
| ------------------------ | ------------- | ----------------------------------------------- |
| Schema-First             | 주축          | Microsoft TypeSpec, OpenAPI 산업 표준           |
| Contract-First           | API 영역      | Hazelcast, Technijian 등 산업 사례              |
| DDD-Lite (B 강도)        | 도메인 영역   | Eric Evans DDD, 풀 DDD 의도적 제외              |
| FSD + Atomic Design      | FE 영역       | Feature-Sliced Design, Brad Frost Atomic Design |
| chain harness (i-strict) | SDLC paradigm | Aider 패턴 + DEC-2026-05-06-v2.0-i-strict-채택  |

명시적 제외:

- Event Sourcing, CQRS, Saga, Anticorruption Layer
- 비기능 요구사항(NFR) 측정 (단 chain 3 task-plan NFR allocation 은 의무)
- 테스트 코드 자동 분석 (단 chain 4 실 test code 산출은 의무)

---

## 라이선스

**UNLICENSED** (사내 표준 / 외부 미공개 — de facto all-rights-reserved). `plugin.json.license` 정합. 외부 OSS 공개는 별도 조직 결단 시 SPDX 라이선스 신설.

---

## 기여

- 변경 제안: GitHub Issue
- 변경 적용: PR + ADR 작성 (ADR-CHAIN-001~012 + ADR-001~010 + ADR-FE-001~007 + ADR-BE-001)
- 방법론 자체 변경: ADR/DEC 신설 → plan.md 갱신 → §8.1 strict 검증대 통과

→ 변경 이력: [CHANGELOG.md](./CHANGELOG.md) (v2.6+) / [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md) (v8.x 이전).
