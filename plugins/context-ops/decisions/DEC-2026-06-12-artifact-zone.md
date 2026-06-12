# DEC-2026-06-12-artifact-zone

> **상태: 승인·반영 진행 (2026-06-12 / 사용자[TF Lead] AskUserQuestion 3결정)** — 본체 변경 적용 중(lifecycle-contract zone 규약 + 스키마 additive + 도구 zone-aware + ep-be-gea dogfood 이동). SOFT·opt-in·backward-compat.

**결단**: canonical 분석 산출물의 **물리 저장 레이아웃**을 평면(`.ai-context/output/<f>`)에서 **2-zone** 으로 분리 — `output/shared/`(repo-wide + cross-cutting / 각 1벌) + `output/domains/<BC>/`(per-bounded-context). well-known 진입점(`business-rules.json` index / `antipatterns.json` / `migration-cautions.json`)은 top-level 유지. 목적 = 공통/도메인 산출물이 **서로 안 겹치게**(특히 병렬 CLI / worktree 에서 도메인마다 자기 `domains/<BC>/` 만 write, `shared/` 는 analysis 1회·read-only).

**작성일**: 2026-06-12 (사용자 "다른 CLI 다른 도메인 병렬 가능?" + "공통은 공통대로 도메인은 도메인대로 구조 변경" → 진단 워크플로우(wf_48e156f6) → 3결정 → 구현 → 적대 리뷰(wf_bf7140f5) → 완성).

**version**: plugin.json MINOR bump 예정(v0.40.0 → **v0.41.0** / additive·backward-compat).

## 핵심 (왜 canonical-global 과 충돌 아닌가)

- **read model ⊥ storage layout**. DEC-2026-06-07-subset-retire 가 보호하는 건 **read model**(논리적 1 세트 / scope 는 참조·무복사 → scope-copy 간 drift 제거). 본 결단은 **storage layout**(1 파일 vs 인덱스+샤드)만 바꿈. 샤드는 합쳐서 **여전히 1 세트**(loader 재조립). `sharding_contradicts_canonical=false`.
- **선례 일반화**: DEC-2026-06-09-br-split-step3 가 business-rules 를 index(`business-rules.json` bc_files[]) + per-BC leaf 로 이미 샤딩(canonical-global 아래). 본 결단 = 그 leaf 를 `business-rules/<BC>.json` → `domains/<BC>/business-rules.json` 로 옮기고 같은 zone 에 형제 산출물(openapi·formal-spec·characterization·sql-inventory) 집결. loader(`_shared/load-business-rules.js`)는 indexDir 기준 상대 resolve → **무수정 투명**(실증: ep-be-gea 36 rule 재조립 ✓).

## 분류 (진단 wf_48e156f6 / F-015 코드 교차검증)

- **공통(shared/)**: inventory · architecture · schema(db-schema) · scope-carve(reference-lens) · code-graph(reference-lens) · recovered-adr · run-manifest · error-mapping-spec · legacy-spectrum · static-security-spec · domain.json(BC 카탈로그 = repo-wide).
- **도메인(domains/<BC>/)**: business-rules leaf · openapi · formal-spec · characterization/ · sql-inventory/ · FE(state-map·visual-manifest·a11y·i18n·form-validation·type-spec).
- **top-level 유지**: business-rules.json(index) · antipatterns.json · migration-cautions.json · tool-runs/.

## 안전장치 (guardrail)

- G1 단일 loader chokepoint(직접 readdir bypass ❌). G2 **basename 불변 = 디렉토리 이동만·rename ❌**(drift baseline / traceability ANALYSIS_FILENAMES / sync CANONICAL_ANALYSIS_FILES churn 회피). G3 hash 불변(content-addressed = layout-invariant). G4 backward-compat(평면 계속 valid / 로더·경로해석 manifest 우선→평면 fallback). G5 샤드 = 단일세트 partition(per-scope 복사 ❌).
- **set-level 인덱스** = `work-unit-manifest.analysis_refs.artifacts`(name→repo-rel-path / findings-aggregator gate#0 결정론 resolve). 산출물이 어느 zone 이든 manifest 가 가리키면 검증기 fleet 자동 추종.

## bc_scope 필드 — DEC-2026-06-10-validator-path-convention-unify §F14 **narrow** (supersede 아님)

F14 는 "antipatterns 에 scope-attribution 필드 추가 = 1-PoC 과적합 → ≥2 도메인 mis-attribution 반복 입증까지 **deferred**"였음. 본 결단은 사용자 명시 결정(AskUserQuestion "지금 필드 추가해 분할")으로 `bc_scope`(optional·additive / `^(BC-…|cross_cutting)$`)를 antipatterns + migration-cautions 스키마에 추가하되 **F14 의 경계를 좁힘**:

- F14 "필드 금지" → **"필드 = SOFT·optional·additive 허용"**.
- **불변 유지**: ① 어떤 validator 도 bc_scope 로 **HARD-gate ❌**(F14 silent-omission 우려 보존 — cross-cutting AP 는 top-level 카탈로그 유지·모든 scope 가시 / 미지정=cross_cutting 안전 기본값). ② **물리 per-BC AP 디렉토리 split = 여전히 deferred**(AP loader 필요 / ≥2 도메인). ③ prefix(카테고리)≠scope = 실판단 작성(F14 핵심 경계).
- **정직 GAP**: 현재 bc_scope = **0-datapoint**(아직 어떤 live AP 도 값 미설정 / 디렉토리 zone 은 1-domain=BC-EVENT exercised). over-claim ❌ — "검증됨" 주장 ❌ / ≥2 도메인 corroboration 전까지 SOFT.

## 적대 리뷰(wf_bf7140f5)가 잡은 회귀 2건 — 고침

자기검토 편향 실증: 1차에 findings-aggregator + chain-driver/sync 만 zone-aware 로 고치고 **그래프 합성기를 놓침**(impl gate 가 `--json` 모드라 GREEN 으로 가려짐). 독립 리뷰가 적발 → 고침:

- **R-HIGH-1 `traceability-matrix-builder --graph`** ANALYSIS_FILENAMES 평면 dir 스캔 → 이동 산출물 노드 silent-drop(실측 39 vs 정상). fix = per-kind zone-aware 후보(평면→shared/→domains/<BC>/ +nested). 실증: analysis 노드 **46** 복원(architecture·domain·schema·formal-spec·error-mapping + characterization·sql-inventory 추가 포착). test 179 GREEN.
- **R-HIGH-2 `chain-driver resync-graph`** = R-HIGH-1 production 트리거 → 합성기 fix 가 커버(합성기 `analysis=N` 출력으로 가시화).
- **R-MED-4 `codegraph-coverage`** delivDir 평면 읽기(inventory/architecture/openapi) → zone-aware resolver(`zoneFind`). test 121 GREEN.
- **R-MED-3/5 skill EMIT 경로 sweep** — analysis-* SKILL.md 산출물 경로를 zone 으로(다음 도메인 분석이 평면 재생성 방지 / wf_1ef1cf12).

## STOP / 검증 (event 라이브 dogfood + 방법론 테스트)

- event analysis gate **7/7 validator ok**(새 zone 경로) / schema-validator output/ 재귀 15 valid(+1 선재 invalid=migration-cautions detection_method enum, 무관) / spec·implement gate critical0·high0·coverage1.0 / sync --register manifest-aware 추종 실증.
- 방법론 테스트 무회귀: schema-validator 42 · drift 49 · br-cross 32 · chain-driver 523 · aggregator 66 · plan-coverage 47 · spec-test-link 11 · traceability 179 · codegraph-coverage 121.
- read-model 위반 0 · stale 중복 0(이동은 mv / cp ❌).

## §8.1

- 디렉토리 zone = **1-domain(BC-EVENT) exercised**(degenerate). bc_scope 필드 = **0-datapoint**. → SOFT/opt-in / HARD gate·auto-split ❌ / ≥2 도메인(reservation-golf 등) corroboration 전까지 paradigm·"검증됨" 주장 ❌. 평면 backward-compat 유지 = zero-breakage.

## relates to

- DEC-2026-06-07-subset-retire (read model / 보존·불변) · DEC-2026-06-09-br-split-step3 (샤딩 선례 / 일반화) · DEC-2026-06-07-br-split-step2 (단일 loader chokepoint) · DEC-2026-06-10-subset-slicing-corollary-supersede (slicing = drift BC-hash + validation scope-token)
- **DEC-2026-06-10-validator-path-convention-unify** §F14 — bc_scope narrow (필드 금지→SOFT 허용 / auto-split·HARD-gate 여전히 deferred)
- `methodology-spec/lifecycle-contract.md` (zone 규약 신설) · `schemas/antipatterns.schema.json`·`migration-cautions.schema.json`(bc_scope)·`business-rules-index.schema.json` · `tools/{traceability-matrix-builder,codegraph-coverage,findings-aggregator,chain-driver}` · plan `~/.claude/plans/plan-artifact-zone-restructure.md`
- `feedback_diagnose_before_design_check_existing` · `feedback_quality_priority` · `feedback_methodology_body_priority` · `feedback_self_recorded_fact_validation`(자기검토 편향→독립 적대 리뷰)
