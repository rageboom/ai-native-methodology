# DEC-2026-06-18-fe-dogfood-cycle6

**mis-fe-admin FE dogfood cycle 6 — 3rd FE 도메인(apps/gea/healium) 신규 harvest → 38건 반영 (real a-priori 11 + design 27)**

> v0.60.0 MINOR. cycle5 로 carry queue 청산 후 첫 신규 harvest. 3rd FE 도메인 = `apps/gea/healium`(react-hook-form + zustand + @sg/ui-bo/real-grid + react-i18next, 7 feature slice) — apps/common 이 thin(0 forms / 0 real grids)해 corroborate 못 하던 §8.1 carry 를 정면으로 exercise. Workflow(produce 9 deliverable 전부 schema-valid → 59 finding → 적대검증 59 skeptic vs dev v0.59.0): **real 11 · design 29 · false_positive 7 · stale 12** (cycle3 stale 10 / cycle4 FP 7 처럼 over-claim 필터 재현). 사용자 design 결단 = 전부 추천 채택 + 정책 4 fork 확정.

## 맥락
mis-fe-admin(React18 + MUI + Module-Federation 7-app monorepo) dogfood. 도메인 진행: eam/integration-authority(cycle1~3) → apps/common shell(cycle4~5) → **apps/gea/healium(cycle6, 3rd FE / forms+grid+i18n-rich)**. 산출물 근거: `mis-fe-admin/.ai-context/dogfood-gea/cycle6-findings.json` (9 produce + 59 verify) + `.ai-context/dogfood-gea/domains/healium/*.json` (8 deliverable, 전부 schema-valid) + `.ai-context/dogfood-gea/shared/scope-carve.json`(app-level gea).

## 결정 (사용자 추천 채택 / 전부 optional·additive-safe)

### A. real a-priori (11 / dev v0.59.0 잔존 결함·툴갭)
1. **scope-carve-01 (CODE)** — `tools/scope-carve` co-change/hotspot VCS 신호가 repo-wide → monorepo 1앱 carve 시 cross-app noise(71% pair / 53% hotspot). `--scope-root <path>` 옵션 신설(git log 에 `-- <path>` append, churn 재사용, architecture.json modules[].path 공통 prefix default).
2. **i18n-spec-04** — non-default locale 값이 default 와 byte-identical(번역 안 된 placeholder) 탐지 절차·필드 부재 → SKILL `untranslated-locale detection` step + optional `summary.untranslated_per_locale`(missing 과 구분).
3. **i18n-spec-03** — host-global empty source_files≠orphan(cycle4)을 cross-BC + cross-APP(다른 MF remote 키) borrow 까지 확장(translations=[] + host/remote-owned note).
4. **form-validation-01** — RHF 가 resolver 없이 import 되고 register/control/rules 부재면 value-bag → "Schema 추출" step 무대상. SKILL 분기: (a) imperative onChange/onSubmit guard, (b) shared validator store/util, (c) declarative field config 로 pivot.
5. **a11y-spec-01** — RealGrid canvas a11y 는 static AND runtime axe 둘 다 not_assessable(axe 는 a11y tree 를 읽지 canvas pixel 아님) → carry a11y-05 결판: not_assessable[] 귀속 confirm + runtime tier 가 upgrade 못 함 명시.
6. **ui-spec-01** — codegraph cross-check `kind='component'` 필터는 React arrow-fn 컴포넌트 함정(renderer-temp). TSX 는 `kind IN ('function') AND file_path LIKE '%.tsx'` caveat.
7. **ui-spec-02** — RHF import = 검증 존재의 necessary-not-sufficient. lib-detection 은 실제 resolver/schema 확인 의무(form-validation-01 과 짝).
8. **visual-manifest-01** — cycle4 A안(token home=ui-spec.design_tokens SSOT / visual-manifest=snapshot-only)이 MUI+styled-components 실도메인에서 schema↔skill 모순 0 → CONFIRMED-RESOLVED(2nd 도메인 corroboration). 코드 무변경.
9. **state-map-fe-06** — scxml_export_validated(단계5) 충족할 XState SCXML import 러너 미제공 → SKILL: 러너 부재 시 false 고정 + 단계4 이하 명시(no_a11y_runner/no_visual_capture 대칭, 위장 차단).
10. **form-validation-06** — captured_by=ts_morph_real/babel_traverse_real 가 no-sim credit 조건이나 미프로비저닝. SKILL: static_extraction(grep/Read)은 AST 툴 부재 시 수용(−5%p 없음) — penalized 되는 'simulation' 과 구분.
11. **scope-carve-06** — architecture.json 부재 시 exit-3 만 있고 app-level minimal-input 경로 부재. SKILL: grep import-resolution 모듈 그래프(modules[].id + dependencies from/to)는 carve 목적의 valid minimal architecture.json(confidence flag / dynamic dispatch·lazy route·DI 사각 caveat).

### B. design — corroboration / carry-종결 (8 / 코드무변경·SKILL 한계 note)
12. **scope-carve-02** — Tarjan SCC 가 acyclic feature-sliced FE 에서 0 atomic-unit 기여(cycle3 예측 app-scale 확정) → SKILL 한계: SCC = confirmatory(불법 cut 부재 증명) not generative. Martin+co-change 가 주 신호.
13. **scope-carve-03** — Martin sink→clean_seam 이 eam 에서 "8/9 공허"였던 게 gea app-scale 에서 **12/12 지배 useful 신호**로 INVERT → carry #1 부분 REFUTE: sink emptiness 는 eam 단일-도메인 슬라이스 속성이지 일반 FE 한계 아님(단일도메인 과적합 재입증).
14. **ui-spec-06** — ui-spec producer-skill 부재(cycle2 carry)는 더 이상 마찰 아님 — `_base-apply-template` 이 ui-spec 합성 완전 소유(3rd 도메인 corroborate) → carry 종결. (옵션 polish: invoke 예시에 ui-spec trigger 문구.)
15. **form-validation-04** — numeric predicate decomposition(cycle2/3)은 inline regex 도 clean map. 단 int/positive/nonnegative/finite/multipleOf enum 은 Zod number chain 에만(regex `/^[0-9]*$/` = pattern 유지, 재확장 금지) — SKILL note.
16. **characterization-when-string-01** — scenario.when 단일 STRING 비대칭이 FE 멀티핸들러 체인(commitChange→getStatedRows→mutate)에 충분 — gap 아닌 적합 설계(반례 기록).
17. **characterization-satd-fe-01** — self_recognized(SATD) grep 이 FE(.ts/.tsx)에서 실증 동작 confirm. 함정: 한국어 라벨('임시 저장')이 '임시/나중에' false-positive → SKILL 함정절 noise 주의 1줄.
18. **characterization-rhf-native-01** — RHF 가 zod/yup resolver 없이 native imperative 검증(getValues+checkValues/checkDateRange)만 사용 — RHF=선언적 schema 가정 N/A corroboration. char when=자유 STRING 이 imperative 흐름 무마찰 수용 기록.
19. **ui-spec-05** — transitions from/to `^PAGE-` 패턴(cycle4/5)은 유지(스키마 버그 아님)이나, single-route CRUD 화면은 user_flow 가 self-loop 로 degenerate → 의미있는 전이는 state-map FSM 귀속 SKILL note.

### C. design — safe-additive 스키마/enum/SKILL 확장 (11)
20. **type-spec-02** — `framework_coupling_reasons` enum 에 `mui_sx_props` / `mui_component_import` / `design_system_ref`(@sg/ui-bo RealGridRef 등 wrapped-lib) / `ui_library_type` append. core-framework(React/Vue) coupling 과 UI-library coupling 분리.
21. **type-spec-05** — `scope.exported_only` default true 가 zustand store state interface(create<T> 미export)를 silent drop → SKILL note: state lib 은 exported_only=false 또는 create<T>/configureStore type arg 항상 capture.
22. **state-map-fe-02** — `dom_state` 가 imperative grid row-lifecycle FSM(RealGrid RowState)을 모델링할 자리 부재(carry state-map-03 CONFIRM) → `machines[].imperative`(bool) + `widget_lib` optional, SKILL 절차4 'canvas 위젯 내부 상태=React 외부 진실 / finding 등록 의무'.
23. **state-map-fe-04** — RHF 가 getValues/setValue 만 쓰는 non-reactive value-bag 분류 부재 → SKILL 절차4 결정 규칙: 진실이 client_state 면 primary_source_type=mixed + form_state machine 분리 금지(SGH ConditionForm+CodeSelect 표준 패턴).
24. **i18n-spec-02** — single_merged 도메인이 logical-ns(key prefix `gea.healium.status`)와 runtime-ns(`translation`)를 구분 못 함 → optional `resources[].logical_namespace`.
25. **a11y-spec-02** — `not_assessable[].requires_tier` enum 이 'no available tier resolves'(canvas grid) 표현 불가 → `manual_expert_audit` / `vendor_dom_mirror` append (또는 sentinel 문자열).
26. **a11y-spec-04** — SKILL static_heuristic id vocab 에 `tabindex-no-positive`(SC 2.4.3) / `control-has-associated-label`(SC 1.3.1) / `anchor-is-valid` 추가(MUI/RHF FE 흔함) + axe↔jsx-a11y id 매핑 note.
27. **form-validation-02** — `source_libraries.library` / `source_format` enum 에 `custom_store`(shared validator) append + optional `validations[].validator_ref`(예: `useValidationCheckStore.actions.checkDateRange`) — 중앙 공유 validation 표현(SGH 지배 패턴).
28. **form-validation-03** — 선언적 UI field required flag(`isRequired:true`)가 executed required check 와 구분 안 됨 → optional `validations[].declarative_only`(bool) + SKILL: 선언 marker 와 enforcing call 을 1 row(enforcing call=source_line, declarative marker=note)로.
29. **visual-manifest-03** — SKILL step6 가 cross_links to ui-spec 의무인데 schema 가 모든 cross_link 에 from_snapshot 요구 → snapshots 빈 경우 unsatisfiable. SKILL clarify: snapshots 부재 시 cross_links N/A(또는 manifest-level redirect note).
30. **ui-spec-07** — @sg/ui-bo backbone 은 per-BC consumable 이나 token 직접 ref 가 BC 코드서 near-invisible(170파일 중 3 foundation ref) — token-discipline gap 아닌 올바른 encapsulation. SKILL note: token-consuming BC 의 consistency_score 는 hardcoded hex/inline px count 로 측정(foundation ref count 아님).

### C2. design — 추가 (triage 정밀대조 보강 3)
36. **characterization-precedent-01** — precedent-artifact 사전조건(business-rules.json + antipatterns.json)이 FE-only 도메인에서 부재한데 SKILL 이 degrade 경로 미명시(HARD guard 여부 불명) → SKILL FE-only degrade 1줄: 부재 시 차단 ❌, intent_classification.rule 을 code-grounded 합성 id(`BR-<DOMAIN>-*`/`AP-<DOMAIN>-*`)로 생성(grep_hit/파일경로 grounding 의무) + `data_source_status=code_only` + warnings.
37. **scope-carve-04** — external vendor 패키지(@sg/*)가 Martin 출력에서 app-owned hub 와 구분 불가(16 hub_warning 중 8 = 절대 carve 금지 vendor) → 옵션 `modules[].external`(carve.js 가 hub_warning 에서 suppress) + SKILL: architecture.json modules 는 app-internal only, external dep 은 input 전 prune 권고.
38. **scope-carve-05 (CODE)** — carry F8 path_excludes(cycle1) 가 lockfile/deploy/CI 필터 confirm 동작하나 default 가 `docs/**/*.md` / `**/.claude*/plans/**` / work-log 누락 → `DEFAULT_PATH_EXCLUDES` 확장(AI-native repo 의 markdown/spec churn 이 코드와 co-change 하는 noise 차단) + project-level `--exclude` 문서화.

### D. 정책 fork (사용자 결단)
31. **form-validation-05 (포함)** — UI-library silent constraint(MUI inputProps.maxLength / RealGrid editor maxLength)는 form-validation 으로 기록하되 `framework_coupled=true` + `runtime_executable=false` 표시 + `br_auto_extraction_count` 에서 제외(검증 사실은 보존, BR 자동추출은 안 함). SKILL scope 경계 명시.
32. **visual-manifest-02 (pre-flight gate)** — snapshot 캡처 도구 미감지 시: snapshots:[] + confidence 하향 + `deliverable_value=metadata_only` 플래그(빈 manifest 가 '완료'로 위장 차단). gea·common 2도메인 corroborate.
33. **characterization-named-ratio-01 (소표본 인지)** — named_classified_ratio ≥0.80 이 소표본(total<10)의 정직한 ambiguous 1건에 과민 → SKILL §7: total<10 + ambiguous_carry 명시 시 미달은 WARN(medium)으로 충족(절대비율 단독 차단 ❌).
34. **form-validation-07 (phantom 유지)** — package.json 선언됐으나 미사용 validation lib(zod)을 source_libraries 에 detected=false 로 emit 유지(adoption gap 문서화 의도) — SKILL 명시.
35. **visual-manifest-05 (admin 단일-desktop)** — 비반응형 admin 도메인의 1-entry viewport_matrix 는 정상(coverage shortfall 아님) — SKILL note.

## trust / 불변
- codegraph reference-lens / 결정적 gate inject ❌ (DEC-2026-05-28 §4.2) — 불변. ui-spec-01 codegraph cross-check 은 reference-lens caveat 강화일 뿐 gate 진입 아님.
- 전 30건 optional·additive: enum 값 APPEND(기존 값 보존) / 신규 필드 전부 optional / 기존 valid 산출물·bundled example 무파손.
- shipped prose(skills/spec/guides) governance 마커 0 — 본 DEC = provenance SSOT, skill 인용은 `## 인용` footer 포인터로만.

## carry (cycle7+)
- type-spec-07: extraction_completeness(exhaustive|representative_sample|partial) — 1도메인 low, 2nd 도메인 corroborate 후 격상.
- i18n-spec-05: 소비자 측 관찰(healium-search.json empty catalog dead-vs-placeholder) = gea 코드 정리 대상, 플러그인 변경 아님.

## 검증
release:check **42/42 GREEN**(v0.60.0 / shipped_provenance_leak 0 · skill-citation 정합 · readme_version_sync · workspace_test) · scope-carve carve **44/44**(신규 6: scope_root pathspec·no-pathspec-when-absent·DEFAULT_PATH_EXCLUDES markdown filter·external hub suppress·scope_root auto-prefix·null-when-no-paths) · 6 FE schema additive(enum APPEND / optional 필드, JSON parse OK) · bundled example 무파손.

## 인용
- DEC-2026-06-17-fe-dogfood-cycle5 (직전 cycle / carry queue 청산)
- DEC-2026-05-28-codegraph-probe (reference-lens trust 불변)
- ADR-FE-006 (framework-neutral IR / type-spec coupling axis)
- 산출물 근거: mis-fe-admin `.ai-context/dogfood-gea/cycle6-findings.json` + `domains/healium/*.json` (9 produce + 59 adversarial verify)
