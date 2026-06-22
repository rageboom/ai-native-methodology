# AI-Native 개발 방법론 v0.68.0

> 조직의 개발 방식을 AI-Native로 전환하는 **AX(AI Transformation) 마이그레이션** 사내 표준 방법론. **분석 → 발견 → 스펙 → 계획 → 테스트 → 구현** SDLC 6-stage chain harness — AI가 단계별 산출물을 생성하고 사람은 gate에서 검토·결단 (AI 자동화 ~85% / 사람 ≤15%).
>
> **현재**: v0.68.0 (2026-06-23 / **MINOR — gate 진입 시 plan-review-server 자동 띄움 (opt-in → 기본 동작)**[discovery·spec·plan gate 진입 시 plan-review-server 를 `--phase <discovery|spec|plan>` 모드로 **자동 spawn**(브라우저 검토 / Auto Mode 위임 시 skip / 텍스트 prompt 병행) — 종전 opt-in off-ramp 격상. spec=behavior·unit·ac 3종 탭. cli `runPhase` 의 `--summaries` 갭 보완(phase=산출물별 nesting `{ "<artifact-type>": { "<cardBase>": { summary } } }` / 백엔드·프론트는 이미 지원). gate skill `_base-invoke-go-stop-gate` allowed-tools 에 Bash 추가·spec 3종 정정·구 4-stage 명칭 정정. 서버=reference-lens 불변(평결=chain-driver / write=사람 프롬프트만 / 자동 spawn=skill Bash 사용자-호출 경로라 결정론 axis 무오염). DEC-2026-06-19-plan-review-server. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.68.0]]) — 직전 v0.67.0 (2026-06-22 / **MINOR — plan-review-server: chain 산출물 인터랙티브 검토 편집기 (discovery/spec/plan)**[gate 검토에서 사람이 산출물 json 통독+자연어 던지기 대신 로컬 HTTP 서버가 산출물을 의미 카드로 렌더, **항목 클릭→팝오버 프롬프트→apply→AI 재설계→보던 HTML 자동 갱신** 닫힌 루프(stdout `PLAN_REVIEW_APPLY` 마커+라이브 리로드+agent-reply 배너). 값 직접 편집 ❌(모든 변경=프롬프트→AI). **공유 키트 + 스키마별 렌더러**(렌더러가 배치 소유 / 인터랙션 공통 / AC=Gherkin 시나리오 bespoke). **phase 한 페이지**(`--phase spec`=behavior+unit+ac 3종 탭 / apply 산출물별 라우팅→`spec-revisions.json`). **수정불가 잠금**(기계 소유=provenance·id·순서·의존·추적링크·외부ID·계약 클릭/코멘트 ❌, 내용만 / UI+서버 belt 이중화) + **AI 평이 요약**(원문 ≠) + **큐레이션**. 서버=reference-lens(평결=chain-driver / write=사람 프롬프트만 / 결정론 gate inject ❌). plan-review-server 58 + test:release 27/27 green. DEC-2026-06-19-plan-review-server. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.67.0]]) — 직전 v0.66.0 (2026-06-22 / **MINOR — analysis-self-consistency-validator (산출물 summary/count ↔ 자기 배열 정합 결정론 검사)**[DEC-2026-06-13(count=배열 비정규화 캐시 / 배열=SSOT / LLM 정수 불신)을 append-catalog.js 한 곳에서 8 count-bearing 산출물(type-spec/static-security/antipatterns/a11y/form-validation/i18n/visual-manifest/business-rules)로 일반화. 신규 `tools/analysis-self-consistency-validator`(하드코딩 INVARIANTS 맵 / scalar==length·partition group-by 양방향(키합집합·0-default)·filtered·custom reducer / schema 13종 무수정 / `--fix` indent 보존 / 16 test GREEN) + gate#0 conditional_validator wiring(sdlc·phase-flow·findings-aggregator extraValidators / gate-eval REQUIRED 불변 / check26 4중 정합). **구조적 count 필드만**(prose-embedded 숫자="SIX RealGrid"·"useState 16"는 groundedness skeptic 담당 = 대체 아님). 실증=커밋 5도메인 적용 시 schema+skeptic 통과분에서 구조적 미스카운트 5건 신규 검출(salary 3·maternity 2 / 전부 총합 맞고 partition drift)·오탐 0. §8.1 면제(additive·conditional). DEC-2026-06-22-analysis-self-consistency-validator. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.66.0]]) — 직전 v0.65.0 (2026-06-19 / **MINOR — branch-per-task git hygiene (Sub-task별 브랜치 + Sub-task별 PR + 연결 가시화)**[티켓 작업 시 (a) 전용 브랜치 (b) 잘못된 브랜치 소스 작성 결정론 차단 (c) 각 PR 의 Story·Epic·형제·의존·AC 연결 가시화 = 미배선. 신규 `_shared/git-branch.js`(git query/mutation 프리미티브 + `deriveBranchPrefix` 버그/결함→bugfix·그외→feature) + `linkage-builder.js`(`buildLinkageBlock` 결정론 합성 / 부분 evidence graceful) + `chain-driver enter-task <project> --task <TASK-id> [--confirm]`(ticket-sync-evidence Jira 키 lookup→`<prefix>/<KEY>` 브랜치 preflight 6모드[noop/switch/create/detached/unborn/git부재]→current_task set / `--confirm` 없으면 preview) + `finish-task [--confirm]`(implement GREEN 확인→linkage block→`gh pr create` or 수동 graceful→current_task clear) + `clear-task`(stuck 탈출구 / git 미접촉) + PreToolUse 브랜치 가드(`branchGuardReason` / task-major + stage∈{test,implement} + wrong-branch + 가드대상소스(`isGuardedSourcePath`=코드+SQL/template/build/config=`.xml`·`.sql`·`.jsp` 등) + repo-내부 → deny=exit2 / **current_task 부재=allow=scope-wide byte-identical=회귀0** / git query 는 current_task 있을 때만=hot-path 보호 / opt-out `CONTEXT_OPS_BRANCH_GUARD=0` + self-dev 면제) + state.schema `CurrentTask`(additive optional). **첫 git mutation 이나 mutation=`enter-task`/`finish-task` 명시 명령 + `--confirm` · 훅은 deny-only(git 미접촉)**(STRONG-STOP / makeGitRunner read-only 보존 / 가드·브랜치명·linkage 전부 결정론·LLM inject ❌). **5-lens 적대검증 하드닝**: blocker(레거시 .xml/.sql 가드 사각)·high(implement 미-GREEN current_task stuck→clear-task)·stage게이트(revisit 오차단)·repo-membership 수정 / 회귀 lens 0·결정론 위반 0. **v1 GREEN=scope implement-GREEN floor**(force-ack 포함 / per-task TC 게이트 deferred / cmdNext 골격 무변경) / 의존 task stacked PR·bug 전용흐름·scope-verify·hotfix prefix deferred·≥2 PoC(legacy Spring+modern Node) 후 본체 격상. chain-driver 632→664 GREEN(+32 / 회귀 0) / §8.1 면제(additive·deny-only / release check 무변 criteria=42). DEC-2026-06-19-branch-per-task-git-hygiene. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.65.0]]) — 직전 v0.64.0 (2026-06-19 / **MINOR — living dep-graph 자동배선 (Gap A 자동주입 + Gap B 자동유지)**[dep-graph(artifact-graph.json)는 living 인프라가 있으나 ① 프롬프트 시점 관련 노드/이웃 자동 주입 부재(Gap A — 수동 navigate) ② 손수정 코드 lift 후보 자동 감지 부재(Gap B — 수동 lift) = 둘 다 식별된 carry(DEC-2026-06-02 §5 / living-sync §7). **Gap A**: 신규 `scripts/graph-context-nudge.js` + hooks.json UserPromptSubmit sibling — prompt 식별자→artifact-graph 노드 결정론 매칭(matchPromptToNodes / includeTitle)→진짜 1-hop 이웃(incident edge만·≤8 / transitive·centrality ❌)+code_pointers 를 additionalContext 주입. 매칭 0(한글 산문)=침묵 no-op / NEVER blocks(additionalContext only) / default-on(opt-out `CONTEXT_OPS_GRAPH_NUDGE=0` / 그래프 부재 no-op). **Gap B**: `work-unit-manifest` sync_state `lift_candidate_pending[]`(additive optional) + hooks-bridge `detectSourceFileWrite`(.ai-context 밖 source / `_shared/source-ext.js`)·`markLiftCandidatePending`(dedupe+cap50) — PostToolUse 손수정 코드 write→current_scope manifest silent mark(detect+mark only / per-write eager resync ❌ = Senior REJECT 회피 / opt-out `CONTEXT_OPS_LIFT_AUTODETECT=0`). `chain-driver next`·`sync-next` demand 시 drain→liftCandidates(forward-only·surface-only / computeSyncLoop 미호출)→의미천장 후보 advisory(사람이 `lift --ceiling` 확정 / auto-climb ❌). 부수 fix: hooks-bridge `writeManifest` arity 정정. docs: first-prompt-cookbook §2.1.1 discovery grounding 레버 6종. **trust 불변**: artifact-graph=reference-lens / 결정적 chain gate inject ❌ / grep authoritative. Slice 4(UserPromptSubmit drain 자동 surface) deferred. chain-driver 632 GREEN·graph-context-nudge 7·test:release 27/27 / §8.1 면제(additive·non-gating advisory). DEC-2026-06-19-living-graph-autowire. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.64.0]]) — 직전 v0.63.0 (2026-06-18 / **MINOR — revisit 근거 생성 + 자동 감지 (ADR-CHAIN-003 §2·§3 미배선 갭 해소)**[chain revisit loop 가 "자동 감지+사용자 결단" 설계였으나 ① `detectRevisit` 가 revisit_target/LOC/changed_paths 만 산출(ADR §3 영향 trace/cell 미산출=갭1) ② "Write 후 자동 호출" 미배선(수동 명령만=갭2). 도구+skill 하이브리드 / ADR 풀세트 근거. ① 신규 `chain-driver/src/revisit-impact.js` `enrichRevisitImpact`(resolveOriginNodeIds→analyzeImpact forward→subkind 버킷+cell+stage_range / graph 부재 degraded 정직)+`renderRevisitPrompt`(ADR §3 평이) = 결정론·`detectRevisit` 무변 ② PostToolUse `revisitCandidateNote`(upstream 변경 1줄 advisory)+`chain-driver next` enrich(stderr+`--json revisit` / gate 차단 ❌)+수동 revisit-detect enrich. chain-driver 614 GREEN(+12 / 회귀 0) / criteria_total=42 무변. DEC-2026-06-18-revisit-impact-autodetect. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.63.0]]) — 직전 v0.62.0 (2026-06-18 / **MINOR — gate 결정 근거 "평이 요약" 레이어 (한 줄 평결 + [평이 라벨—뜻—행동])**[각 gate(#0~#5)의 go/stop/revisit 판단 근거가 영어 jargon(`validator_critical`·`coverage 0.62<0.85`·`s2_outcome_mismatch`·`forward_coverage`·`5종 물증`) 나열이라 사용자가 "진행이냐 멈춤이냐"를 못 읽던 문제 → 도구+skill 2 레이어로 평이화(균형형). ① 결정론 `chain-driver/src/gate-summary.js`(`REASON_LABELS` 11코드 고정 lookup + `summarizeGate` verdict go/review/stop/revisit[hard-block=`gate-eval.HARD_BLOCK_CODES` SSOT 재사용] + `renderGateSummaryText` 균형형) = 순수 결정론·LLM inject ❌·display-only·gate-eval `detail` 무변(추적 보존) ② `cli.js` next/blockedExit/sync-next stderr + `--json summary` 필드 + `_base-invoke-go-stop-gate` SKILL 프롬프트 한 줄 평결(도구 SSOT)+막는문제/검토권장+영어 필드명 한국어 병기. chain-driver 606 GREEN(+25 / 회귀 0) / criteria_total=42 무변. DEC-2026-06-18-gate-plain-summary. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.62.0]]) — 직전 v0.61.0 (2026-06-18 / **MINOR — discovery 보편-라우터 진입점 정렬 (하이브리드: advisory routeEntry 폴백 + cold-start 결정론 hard-block)**["분석 외 모든 작업=discovery(입구·라우터) 진입" 불변식(living-sync §4)이 진입 라우팅 코드엔 미구현이던 맹점 제거 — 진입 stage 선택은 결정론 state machine 이 아니라 LLM skill-description 매칭(System B)이라 hooks-bridge 권고가 discovery 를 6 stage 중 하나로 취급. ① stage 미지정 변경요청 silent pass-through → `discovery-from-nl-md` 폴백(`routeEntry` / 비-작업 prompt 는 침묵 보존) ② "구현 시작" 등 skip-ahead → discovery 미진입('pending')서 later-stage chain 산출물 write 를 PreToolUse exit2 deny(`coldStartSkipAheadReason` / state+파일명만 = LLM inject ❌ / discovery-spec 허용) ③ TRIGGER_PATTERNS 동사 통일(dead-zone 제거) ④ hooks.json matcher work-verb 확장 + `task-plan.json`→TASK 부수갭. chain-driver 581 GREEN(+18 / 회귀 0). DEC-2026-06-18-discovery-universal-entry-router. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.61.0]]) — 직전 v0.60.0 (2026-06-18 / **MINOR — mis-fe-admin FE dogfood cycle 6: 3rd FE 도메인(apps/gea/healium) 신규 harvest → 38건 반영 (real a-priori 11 + design 27)**[forms+RealGrid+i18n+zustand-rich 도메인으로 produce 9 deliverable 전부 schema-valid → 59 finding 적대검증(real 11·design 29·FP 7·stale 12 / over-claim 필터 재현). **scope-carve carry #1 결판**: Tarjan SCC=0 기여 CONFIRM(acyclic feature-sliced FE 한계)이나 Martin sink→clean_seam 은 eam "8/9 공허"→gea 앱스케일 **12/12 지배신호 REFUTE**(단일도메인 과적합 재입증) + `--scope-root` pathspec 신설(monorepo cross-app VCS noise 71%→0 / 신규테스트 6 / carve 44 GREEN) + DEFAULT_PATH_EXCLUDES 에 methodology markdown(plans/docs/work-log) 추가 + external vendor hub suppression. **form-validation**: RHF-as-value-bag(resolver無) 분기 + central validator store enum(`custom_store`+`validator_ref`) + UI-lib silent constraint(maxLength) 포함(runtime_executable=false). **a11y**: RealGrid canvas=static·runtime axe 둘 다 not_assessable 결판(a11y-05) + requires_tier enum(`manual_expert_audit`/`vendor_dom_mirror`) + static_heuristic vocab. **i18n**: en==ko untranslated-placeholder 탐지(`untranslated_per_locale`) + cross-APP borrow + `logical_namespace`. **state-map**: RealGrid imperative dom_state(`imperative`+`widget_lib`) + RHF value-bag 분류. **visual-manifest**: snapshot 도구 부재 pre-flight gate(`deliverable_value=metadata_only`). **type-spec**: MUI/@sg/ui-bo coupling enum. **ui-spec**: codegraph kind=function TSX caveat + producer-skill 부재 RESOLVED. **characterization**: FE-only precedent degrade + 소표본 named-ratio WARN. 전부 optional·additive(기존 valid 산출물·bundled example 무파손). DEC-2026-06-18-fe-dogfood-cycle6. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.60.0]]) — 직전 v0.59.0 (2026-06-17 / **MINOR — mis-fe-admin FE dogfood cycle 5: cycle4 carry queue 11건 청산 (design 9 + validator TDD 2)**[cycle4 가 §8.1 2nd-도메인으로 거른 carry 11건을 dev v0.57.0 재대조 + 독립 적대검증(12-agent) → **전부 real 확정(stale/FP 0)·전부 additive**. **design 9**(전부 추천 채택): type-spec-05 references[] `resolution` enum(intra_spec/in_repo/external_workspace/node_module/unresolved)+`framework_neutrality_basis`(monorepo 외부참조 채널) / state-map `liveness`(present_unused·present_active)·`url_model`(route_param·pathname_as_truth)·transition `source_ref`·cross_links `to_artifact:findings`+`related_findings[]` / ui-spec `token_ownership`+`external_token_source`·`is_remote_boundary`+`remote_name`(MF lazy-remote 경계) / i18n `manual_pluralization` bool + 표준 AP-id `AP-I18N-PLURALIZE-MISS`(CASE_COUNT 수동복수형 smell) / characterization scenario `realized_in[]`(cross-file 앵커). **validator TDD 2**(RED→GREEN): coverage-validator embedded root `snapshots[]`/`coverage` fallback(char-01) + schema-validator `characterization-spec.json` canonical 강제·consumer rename(char-02 / alias 금지·silent-skip 회귀가드). release:check 42/42 · coverage-validator 25/25 · schema-validator 44/44. DEC-2026-06-17-fe-dogfood-cycle5. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.59.0]]) — 직전 v0.58.0 (2026-06-17 / **MINOR — codegraph 토큰절감 companion 정식 격상: P1(codegraph/headroom MCP default-on) + P2(비차단 nudge 신설)**[토큰절감 기사 #1 레이어(구조검색→파일 안 읽고 압축답)를 보유 자산 codegraph(OSS 0.9.6)로 재현. **P1**(draft→정식): codegraph+headroom companion MCP default-on(opt-out `CONTEXT_OPS_DISABLE_CODEGRAPH=1` / `DISABLE_HEADROOM=1`) + 런처 3중게이트 + SessionStart 자동설치·인덱스 부트스트랩. **P2**(신설): 소스 Read/Glob 직전 비차단 additive-injection 훅(`scripts/codegraph-nudge.js`) — Glob=`codegraph files` 구조맵 / Read=포인터 한 줄 / Grep 영구 비차단(반증밸브) / default-on(opt-out `CONTEXT_OPS_CODEGRAPH_NUDGE=0`) / 단위테스트 15 GREEN. **trust 불변**: codegraph=reference-lens / 결정적 chain gate inject ❌ / chain-driver 분리. **P3 hard-block 은 §8.1-차단 유지**(calibration PASS 타깃 0 + CBM 9%p 품질갭). DEC-2026-06-15-codegraph-search-token-saving. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.58.0]]) — 직전 v0.57.0 (2026-06-17 / **MINOR — mis-fe-admin FE dogfood cycle 4 잔여: 22 finding re-verify + 7건 반영**[produce-stage 신규 22 finding 을 dev v0.56.0 기준 adversarial 재검증(7 real_a_priori · 2 stale · 7 false_positive · 6 design — 2nd 도메인이 over-claim 을 정확히 걸러냄) 후 **즉시반영 7건**: 사용자 design 결단 4(token home = `ui-spec.design_tokens` SSOT(visual-manifest skill rewrite) / i18n runtime `namespaces[]`·`default_ns`·`registration_model` / ui-spec transitions `from`·`to` `^PAGE-` 제약 / a11y `not_assessable[]` 분리) + safe §8.1 2(ui-spec `target_state` back-fill · codegraph 교차점검 = `_base-apply-template` skill) + clean a_priori 1(type-spec `manual_extraction`→`reproduction_command` 강제). **carry**: design-gated a_priori 3 + design 6 + validator TDD 2. DEC-2026-06-17-fe-dogfood-cycle4. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.57.0]]) — 직전 v0.56.0 (2026-06-17 / **MINOR — mis-fe-admin FE dogfood cycle 4: apps/common 2nd FE 도메인 §8.1 corroboration + safe-additive 3건**[apps/common(shell/layout/nav — forms 0 / RealGrid 0)을 **2nd 구별 FE 도메인**으로 v0.54.0 분석 실행(7 FE deliverable schema-valid). cycle3 deferred 의 ≥2 도메인 corroboration. 본 릴리스 = design 불요·검증완료 **safe-additive 3건**: a11y schema `violations[].id` detection-dependent(static_heuristic=jsx-a11y rule-id) + skill vocab(F-C4-a11y-spec-01) / i18n skill host-global 카탈로그 empty source_files≠orphan(i18n-02) / characterization skill 선행산출물 부재 HARD guard(characterization-03). §8.1 **7 corroborated · 3 refuted**(typespec-02 references[] 실제 채워짐 16/19 · typespec-03 0.5 tier 최대 · a11y-05 MUI Dialog contract-assessable = cycle3 단일도메인 과적합 입증) · 1 N/A. **보류**: design 3(visual-manifest token home / i18n-04 namespaces 채널 / ui-spec-05 transitions 참조) + 미검증 15(verify 세션한도 중단). DEC-2026-06-17-fe-dogfood-cycle4. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.56.0]]) — 직전 v0.55.0 (2026-06-17 / **MINOR — Semgrep 기본 룰셋 사내망 로컬화 (security-only 벤더링 팩 / registry 의존 제거)**[사내 SSL 검사가 `semgrep.dev` 룰 레지스트리(`p/owasp-top-ten`)를 가로채 fetch 실패(F-DOGFOOD-015 동형) → 벤더 트리(2178)에서 전 언어 security 카테고리만 추린 로컬 팩 `tools/semgrep-rules-security/`(1386 / `scripts/build-semgrep-security-pack.js` 결정적 조립) 신설 + runner 기본 ruleset 전환(`--ruleset` override 무변경) + static-security/error-mapping SKILL registry 하드코딩 제거. static-runner 50 GREEN(기본값=로컬팩 단언 + 출하 가드 ≥1000) / 사내망 네트워크 0 실측(real_tool:true·scan_status:ok·328룰·3 findings). carry: baseline 재수립·PATH(`~/.local/bin`)·full-tree 유지. DEC-2026-06-17-semgrep-local-security-ruleset. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.55.0]]) — 직전 v0.54.0 (2026-06-17 / **MINOR — mis-fe-admin FE dogfood cycle 3: cycle2 enforcement 짝 완성 (schema/skill 정합 9건)**[integration-authority analysis 전체(8 FE deliverable + scope-carve)를 consumer 설치본 v0.48.2 로 실행 → finding 37: real a-priori 9 반영 / stale 10·defer §8.1 12·false-positive 3 은 dev v0.53.0 직접 재대조로 드롭. 핵심 = **cycle2 가 schema enum / skill note 한쪽만 건드린 enforcement 짝의 완성**: type-spec coupling enum kebab→snake / state-map skill machines·5-truth·cross_links 절차 + schema `to_artifact=state-map` / a11y schema static_source_review allOf·violations.detection / form-validation skill numeric 술어 분해·source_libraries 필드 / i18n skill captured_by·inputs_used provenance. visual-manifest token↔snapshot contradiction(설계결단) + characterization validator 정합 2(별도 TDD) = 보류. DEC-2026-06-17-fe-dogfood-cycle3. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.54.0]]) — 직전 v0.53.0 (2026-06-17 / **MINOR — mis-fe-admin FE dogfood cycle 2: FE-track(L340) per-BC 산출 검증 + 6 정합 수정**[integration-authority 에 analysis step 3~5(FE per-BC deliverable 8종 + EXIT gate) 실행 → "FE-track per-BC 미검증 carry(L340)" 실증: 8/8 산출 schema-valid(works 4 / partial 4). a-priori 결함 6 반영 — ui-spec producer 명문화(`_base-apply-template`) / `analysis-type-spec-fe` dead `npx ts-morph`→라이브러리 스크립트(`npx tsx`) / type-spec 예시 schema 정합 / meta-confidence `applied_penalties` FE 부재축 3종(no_visual_capture·no_a11y_runner·no_storybook) / a11y-spec `captured_by` static_source_review tier / form-validation numeric 술어 5종. #5 gate fail-open 주장 = category error 로 drop / visual-manifest skill(token)↔schema(snapshot) contradiction = 설계결단 defer. scope-carve 38/38·schema-validator shared4+domains7·drift 0 orphan. DEC-2026-06-17-fe-dogfood-cycle2. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.53.0]]) — 직전 v0.52.0 (2026-06-17 / **MINOR — mis-fe-admin FE dogfood cycle 1: scope-carve infra-noise 필터 + FE provenance/계약 정합**[analysis step 0~2 dogfood. scope-carve co-change/hotspot `path_excludes`(parse 단계 단일 chokepoint → fileChurn·txns 양쪽 정화 / 실측 infra pair 21→0·hotspot #1 lockfile→실컴포넌트) + meta-confidence `inputs_used` FE 4종 + id-conventions scope↔module namespace 매핑(members∩path) + analysis SKILL FE/kebab 정합. consumer 설치본 v0.48.2 finding 을 dev 소스 재대조 → 2 drop(F2 오프레이밍·F1-a 기수정). DEC-2026-06-17-fe-dogfood-cycle1. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.52.0]]) — 직전 v0.51.0 (2026-06-17 / **MINOR — `codegraph-coverage --verify-anchors` 에 unit-spec deliverable 추가 (unit-spec code_pointer 심볼 정적 codegraph 실존검증 — LLM grep 대체)**[unit-spec 의 `units[].code_pointer`(단수 객체 / 타 산출물 `code_pointers` 배열과 상이) ast_symbol 앵커를 codegraph sqlite 심볼 인덱스에 정적 대조하는 reference-lens 검증을 `--verify-anchors` 에 추가. 기존 5 산출물(ac/discovery/behavior/impl/test-spec)만 보던 `collectSymbolAnchors` 의 공백 해소(`DELIVERABLE_FILES` + unit-spec 분기 + 배열 래핑). 비차단(severity ceiling low|medium)·환경부재 exit3·결정적 gate inject ❌ 불변(DEC-2026-05-28 신뢰경계 보존). dogfood(ep-be-gea 34 scope/301 UNIT / 300 distinct anchor): 298 live + 2 stale(Java record `BoResveAthrtAssetFavoriteSyncEvent`·중첩 record `BoGolfRestService.TimeRange` = codegraph 심볼추출 사각 / 실소스 grep 으로 실존 재확인 = 날조 0) + issue-acm 내부 dedup 1 → LLM 적대검증(301/301 confirmed)과 교차일치. 신규 테스트 4(단수 code_pointer 수집·부재 스킵·dedup·provenance) / codegraph-coverage 121→125 GREEN. DEC-2026-06-17-unit-spec-anchor-verify. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.51.0]]) — 직전 v0.50.0 (2026-06-16 / **MINOR — TDD/unit 층 `unit-spec.json` EMIT 단계 spec stage 배선 (integration gap 해소)**[unit 층은 v0.36.0 1급화 + v0.40.0 검증기 HARD 격상(mock-soundness·obligation)됐으나 그 게이트 입력(unit-spec.json)을 생성하는 에이전트 경로가 미배선 — 채택처(ep-be-gea 34 BC) 전부 composition-only + 게이트 clean-skip 으로 거짓 GREEN 미점검. 신규 skill `spec-derive-unit-spec`(S2 characterized_from_code / code-graph∩domain.behaviors → unit-spec emit / 보수 obligation 안전판 / read-only BC 미생성) + spec.phase-flow phase `unit-spec-derive` + spec-agent 배선 + doc 3건 정정(emit 단계 analysis→spec). §8.1 면제(스키마·게이트 본체 무변경 / unit 층 ratchet v0.40.0 3-도메인 충족). DEC-2026-06-16-unit-spec-emit-wiring. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.50.0]]) — 직전 v0.49.0 (2026-06-16 / **MINOR — `domain-bc.schema.json` 신설 (per-BC domain 샤드 verdict-optional 라우팅)**[per-BC `domain.json` 샤드(`domains/<BC>`·`shared/cross-cutting`)가 카탈로그용 `domain.schema.json`(bounded_contexts 항목 verdict REQUIRED)에 basename 라우팅돼 schema RED 이던 문제를 per-BC 전용 schema 신설로 해소. `domain.schema.json` 결정론 파생 — delta 2곳(top-level `$schema_ref`/`$schema_origin`/`$comment` 허용 + `bounded_contexts.items.required` 에서 verdict 제거=optional). 샤드 인스턴스는 top-level `$schema_ref` 로 본 schema 명시(basename fallback=카탈로그 schema / `business-rules-bc` 선례 동형) — verdict 는 카탈로그(`shared/domain.json`) SSOT 소유로 불침범. `analysis-domain-model` 스킬에 샤드 emit 시 `$schema_ref`+verdict-미보유 규약 문서화(회귀방지). 검증 ajv2020-regression+schema-ref-routing GREEN / 채택처(ep-be-gea) per-BC domain 26 샤드 schema invalid 26→0 / 카탈로그 strict 유지·verdict-consistency 무회귀. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.49.0]]) — 직전 v0.48.2 (2026-06-16 / **PATCH — chain-driver scope별 진행 상태 독립 분리 (#19 GHE 통합 출하)**[GHE PR #19 를 canonical 라인에 머지·출하. `state.scope_states` map(optional/additive) 신설로 여러 scope 가 한 프로젝트에서 각자 독립 chain 진행 상태 보유(글로벌 single → per-scope). state.schema+cli+state-store +466 / multi-scope-chain.test 13 신규 / backward-compat. v0.48.1 packaging 과 #19 는 다른 파일 → 충돌 0 머지, 검증 chain-driver 563/563 GREEN, 양쪽 원격 525c5ecc 동기화. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.48.2]]) — 직전 v0.48.1 (2026-06-16 / **PATCH — npm 패키지 lean-ification + ticket-cascade js-yaml 동봉 누락 fix**[출하 tarball 에서 tool-local node_modules 트리(spectral-runner stale cruft ~9400파일 등)를 `files` 의 `"!**/node_modules"` 로 제외 → 9.3MB/14730파일 → 3.3MB/5429파일(−65%). 루트 bundledDependencies 는 그대로 동봉(도구가 Node 상향탐색으로 루트에서 해소). 추가로 `ticket-cascade-builder` 가 lazy-require 하는 `js-yaml`(YAML config 파싱)이 0.48.0·이전 출하본 루트 bundle 에 누락돼 YAML 경로가 깨져 있던 잠복 버그를, 루트 dependencies+bundledDependencies 에 js-yaml 추가로 fix. 전 도구 외부 import 합집합 4종(ajv·ajv-formats·fast-xml-parser·js-yaml) 전부 루트 bundle 커버. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.48.1]]) — 직전 v0.48.0 (2026-06-16 / **MINOR — `.ai-context/` 레이아웃 재구조화: 평면 → 3-버킷 `base/`(was output/) + `scopes/<scope>/` + `runtime/` + 루트 싱글톤**[사용자 프로젝트 `.ai-context/` 온-디스크 레이아웃을 평면(scope+output+config 혼재 / `listScopes` deny-list 가 config/evidence/findings 오분류) → 3-버킷으로 재구조화. 경로 구성 SSOT `tools/_shared/ai-context-layout.js` 신설(`*Path` 쓰기=NEW only / `*ForRead` 읽기=NEW→OLD alias) → 배포된 구 `output/`·최상위 scope 디스크 **무손상 비파괴**(semver MINOR / state schema 불변). `listScopes` deny→allow 전환으로 오분류 잠복결함 **구조적 제거** + hooks-bridge `state.blocked` 차단을 `.ai-context/` 전체로 확대(우회 방지) + `chain-driver migrate-layout <project> [--dry-run]` 인플레이스 컷오버 커맨드 신설(멱등·충돌거부 / 기존 `migrate`=state schema 와 직교). 문서 110파일 결정론 sweep(output→base/runtime 분기 / decisions·examples 역사 보존) + 전체 1867 + _shared 34 테스트 GREEN + `.ai-context/output` 잔여 0 + anti-false-green 음성 단언. ep-be-gea 실이주 = 후속(`migrate-layout`). DEC-2026-06-16-ai-context-layout-restructure. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.48.0]]) — 직전 v0.47.0 (2026-06-16 / **MINOR — BC verdict 분류 결정론화: `verdict` REQUIRED 승격 + analysis gate#0 fail-closed enforce 배선 + verdict-consistency cross-cutting glob 일반화 + `$schema_ref` 컨벤션 + `cross-cutting.schema` 신설**[BC 분류(core/supporting/cross_cutting/read_model/operational)를 `domains/<BC>` write_ops 칼 기반 결정론 `verdict` 필드로 승격(`domain.schema.json` bounded_contexts[].required 에 `verdict` 추가) + `verdict-consistency-validator` 를 analysis stage REQUIRED gate#0 로 배선(`CONTEXT_OPS_VERDICT_ENFORCE=1`/`--enforce` 시 fail-closed HARD block, 미설정 시 advisory) + validator 의 cross-cutting concern 매칭을 BC 디렉터리 glob 으로 일반화 + 산출물 `$schema_ref` 자기참조 컨벤션 + `schemas/cross-cutting.schema.json`·`bc-scope.schema.json`·`findings-analysis.schema.json` 신설로 schema-less 산출물 강제. athrt/base 류 이중분류·read-only BC 누수를 분석 전이에서 자동 차단 / backward-compat: verdict 부재 산출물은 advisory(무효화 ❌) / DEC-2026-06-15-bc-verdict-classification. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.47.0]]) — 직전 v0.46.7 (2026-06-15 / **PATCH — 미참조 analysis-zone artifact-graph 노드 → 'propose' 강등 (full-chain 병렬 캠페인 dogfood-found)**[ep-be-gea 22-BC 4-worktree 병렬 캠페인에서 모든 lane gate#5 `graph-integrity-validator` orphan 반복 FAIL. 근본: `traceability-matrix-builder --graph` 의 analysis-zone 노드(`analysis-antipatterns`·`analysis-characterization-spec`)는 chain 참조(AC.related_aps / characterization snapshots[].use_case→UC) 시에만 edge 획득 → 미참조 BC 는 정상인데 in/out edge 0 + active → Tier-1 orphan hard-block(본류 UC→IMPL 무결성 무관한 보조 lens 를 의무 연결로 오인 = false-block / 22 BC systemic). 수정: `graph-synthesizer.js` commit-stamp 직후(derive/na 이후)에 `id^=analysis- && active && incident edge 0` → `state='propose'` 강등(pending-TC propose 패턴 동형 / orphan 검사 제외·가시 / chain 본류 노드 미해당→진짜 끊김 계속 block). builder·schema·validator 무변경. builder 179/179 회귀0 + req-visitprkng 재생성 orphans=0 + 라이브 WT1 3 BC orphan0(wlfr propose=1=실작동) / DEC-2026-06-15-analysis-zone-orphan-propose. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.46.7]]) — 직전 v0.46.6 (2026-06-15 / **PATCH — traceability-matrix schema↔builder contract 정렬**[S5 header `{derived_from, do_not_edit_manually}` ↔ schema meta-required 분기→빌더 산출물 자기 schema FAIL / 방향=schema 를 builder 에 정렬·matrix.json auto-route alias / matrix 10/10 GREEN·builder 179·schema-validator 111·RR 42/42 / DEC-2026-06-15-matrix-schema-builder-align. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.46.6]]) — 직전 v0.46.5 (2026-06-14 / **PATCH — append-catalog cross-BC caution merge (clobber fix / dogfood-found)**[carry ④ req 패밀리 나머지 4 sub-domain(iteqmt 비품·bookreq 도서·bizcard 명함·empcard 사원증) 부분추가 analysis — 병렬 workflow `wf_3d614d66-1be`(28-agent: BC당 3 deep-read → analysis-agent leaf 저작 → 3 적대검증) + 정확성 수정 `wf_2d777a1e-6eb`(bookreq characterization 보강·iteqmt openapi concrete 재구성·bizcard param 정합). `upsertCautionGroup` 이 title 충돌 시 caution_group 통째 교체 → sibling BC 의 cautions silently drop(empcard rollup 이 stdpkng 2 caution 클로버) → `caution.id` union 병합(idempotent·sibling 보존)으로 수정. append-catalog 16/16 + chain-driver 539/539 무회귀 + 수정 tool 재-rollup **caution LOST 0**(HEAD 161 ⊆ 208). req 4-BC: 57 BR·rollup 25 BC/638 rule·결정론 gate 전수 GREEN·iteqmt openapi 컨트롤러↔spec 양방향 55:55. RR 42/42 / DEC-2026-06-14-append-catalog-caution-merge. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.46.5]]) — 직전 v0.46.4 (2026-06-13 / **PATCH — sql-inventory-extractor FROM-less T-SQL DELETE dependent_tables 추출 (dogfood)**[carry ④ req visitprkng(방문주차)+stdpkng(정기주차) 부분추가. `extractTables` 키워드에 DELETE 부재 → FROM-less T-SQL `DELETE <table> WHERE` 미추출 → 별도 패스+negative lookahead. 실테이블 누락 0(per-record DELETE 빈 dependent_tables 141→3 해소). 24 test / RR 42/42. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.46.4]])
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
