# DEC-2026-06-09-scope-carve-3signal-reference-lens

**결단**: 역공학 델타 #1 — **signal-driven scope-carve** 1차 구현을 **3 결정론 신호**(Tarjan SCC + Martin Ca/Ce/I + VCS 논리적-결합 co-change)로 착수. 출력 = **reference-lens**(code-graph 선례 `DEC-2026-05-28` §4.2 verbatim 상속 / 어떤 결정적 gate 에도 inject ❌ / 사용자가 soft gate #0 에서 scope 확정). 구현 형태 = **standalone tool `tools/scope-carve/` + skill `analysis-scope-carve`**(codegraph-runner 선례 / **chain-driver 무수정** = 결정론 axis 보호). Martin **A/D 는 정직 abstain**(abstractness = 입력 architecture.json 에 부재 → no-simulation). 1차 = draft + 1 PoC dogfood. 본체 격상(lifecycle-contract MANDATORY 등재 + plugin.json + CHANGELOG) = **≥2 distinct 도메인 PoC corroboration 후**(§8.1).

**작성일**: 2026-06-09.

**version**: 없음 (1차 draft 완료 / plugin.json·CHANGELOG·lifecycle-contract 무변경 = §8.1 격상 보류 / 본체 격상 = ≥2 PoC corroboration 후).

**relates to**:

- `DEC-2026-06-09-reverse-eng-methodology-gap` (델타 #1 모(母) DEC — 본 DEC = 그 per-delta 격상 / §8.1 corroboration gate 상속)
- `.claude/plans/plan-reverse-engineering-methodology.md` §3 델타1 + §4 묶음#1 + `.claude/plans/research-reverse-engineering-carve.md` (3신호 적격 / 2신호 부적격 결론 = 본 DEC 의 신호 선택 근거)
- `DEC-2026-05-28-codegraph-probe-결과` §4.2 (reference-lens trust 모델 SSOT — 본 DEC 가 verbatim 상속) + `DEC-2026-05-30-codegraph-essential` (standalone tool+skill 선례 = `codegraph-runner` / `analysis-code-graph`)
- `DEC-2026-06-06-analysis-exit-gate` (soft gate #0 — carve 출력이 surface 되는 지점)
- memory `feedback_chain_driver_deterministic_axis` (chain-driver 무수정 근거 / STRONG-STOP) · `feedback_research_fact_validation` (co-change 신호 정의 = research 권위) · `feedback_diagnose_before_design_check_existing` (기존 자산 실측) · `feedback_no_static_tool_simulation` (Martin A/D abstain)

---

## 1. 배경

모(母) DEC(`DEC-2026-06-09-reverse-eng-methodology-gap` §2.5)가 델타 #1 = **최대 갭**으로 식별: scope **컨테이너**(work-unit-manifest + soft gate #0)는 완비, 그러나 "대형 코드베이스를 어떤 경계로 쪼개나"를 답하는 **carve 알고리즘**이 부재. 2원칙 carve research(`research-reverse-engineering-carve.md`)가 5신호를 특성화 → **결정론·reference-lens 적격 3신호**(SCC / Martin / VCS co-change) + **부적격 2신호**(Bunch MQ = 확률적 비재현 / EventStorming = human-judgment 워크숍, 자동 재구성 = no-simulation 위반 소지).

본 DEC 착수 전 **기존 자산 실측**(diagnose-before-design / 갭 후보 액면 수용 금지):

- **Tarjan SCC 구현 부재** — `graph-integrity-validator/src/validator.js::detectCycles()` = DFS white/gray/black coloring(트리당 단일 cycle 경로 / 전체 SCC 분할 ❌). `architecture.schema.json` 이 `algorithm:"tarjan_scc"` 를 선언하나 **미구현(aspirational label)**. → carve tool 이 Tarjan SCC 를 자체 구현(표준 O(V+E)).
- **Martin 메트릭 구현 전무** — Ca/Ce/I/A/D 계산 자산 0. `architecture.json.dependencies[]`(from/to/type/weight)로 Ca(in-edge)·Ce(out-edge)·I=Ce/(Ca+Ce) 결정론 계산 가능. **A(abstractness)는 module 별 abstract/concrete 타입 카운트 필요 → architecture.json 입력에 부재** → A·D(=|A+I−1|) 계산 불가.
- **co-change 자산 = point-to-point 뿐** — `revisit-detect.js::gitDiffNumstat()` = `git diff --numstat baseSha..headSha`(두 ref 간 1회 diff). research 의 co-change(Gall 1998 / ROSE 2004 logical coupling = `git log` **이력 전체** mining → 함께 바뀌는 파일쌍 support/confidence)와 **다른 것**. → carve 의 co-change 신호 = `git log --name-only` 이력 mining 신규 구현(기존 `makeGitRunner` 결정론 plumbing 만 재사용).
- **architecture.json = SCC/Martin 입력 확정** — `modules[](id/name/path/layer/loc)` + `dependencies[](from/to/type/weight/violates_layer)` + `circular_dependencies[]`. poc-01(legacy Spring) = 10 modules / 13 edges / circular_dependencies 1 (SCC 산출물 corroboration 가능).

## 2. 결정 내용

### 2.1 3 신호 (모두 결정론 / reference-lens evidence-only)

| 신호 | 역할 | 입력 | 결정성 | soft-gate 노출 |
|------|------|------|--------|----------------|
| **Tarjan SCC** | 분할 불가 atomic 단위 + condensation DAG topo = 안전 추출/strangler 순서 (hard 제약 — 불법 carve 사전 배제) | architecture.json deps | 완전 결정론 (O(V+E)) | 없음 (제약은 증명 가능) |
| **Martin Ca/Ce/I** | seam(I 높음=sink, 깨끗 추출) · hub(Ca 높음=shared kernel, 쪼개면 파편화) · spine 랭킹 | architecture.json deps | 완전 결정론 (순수 산술) | **임계치**(I·Ca 가 "너무 높다") = convention → soft gate |
| **VCS co-change** | 정적 그래프에 **직교** 행위-유래 seam (config↔code, iBATIS XML↔DAO 동시편집 = legacy 정적-blind 정조준) | target repo `git log` 이력 | 결정론 (**파라미터 pin 이후**) | **min-support / min-confidence / window / max-transaction-size** = soft gate (렌즈 내부 hardcode ❌) |

세 신호 모두 **cohesion·도메인 의미 미포함** → 구조 신호로 한정, 의미 확정은 soft gate #0 의 사람.

### 2.2 구현 형태 = standalone tool + skill (chain-driver 무수정)

`codegraph-runner` + `analysis-code-graph` 선례 그대로:

- **tool** `tools/scope-carve/` — `src/cli.js`(+ 모듈 분리: `scc.js` / `martin.js` / `co-change.js` / `carve.js`). 입력 `--architecture <architecture.json>`(SCC+Martin) + `--repo <target> --since <ref|date>`(co-change). 출력 `<project>/.ai-context/output/scope-carve.json`. 환경 부재(git 없음 / architecture.json 없음) = **exit 3 정직 신호**(LLM 추론 대체 ❌).
- **skill** `skills/analysis-scope-carve/SKILL.md` — analysis stage / aspect = cross-cutting / reference-lens trust 모델 / no-simulation / soft gate #0 framing.
- **chain-driver `src/*` 무수정** — carve 는 결정론 SSOT 코어(gate-eval / sync-loop / state-store)를 건드리지 않는다. carve 출력은 `.ai-context/output/` 에 쓰는 reference-lens 산출물일 뿐, regen_queue·manifest·gate 에 inject ❌ (memory `feedback_chain_driver_deterministic_axis` STRONG-STOP 준수). 기존 git plumbing(`_shared/code-pointer-git.js::makeGitRunner`)은 **import 재사용**(코어 수정 아님).

### 2.3 trust 모델 = reference-lens (DEC-2026-05-28 §4.2 verbatim 상속)

structural enforcement(prose-only ❌):

- schema `meta.reference_lens: const true` + `meta.trust_note` + title "(reference-lens / NOT gate-injected)" + description 에 `DEC-2026-05-28 §4.2` 인용.
- **Phase 1 정정 (diagnose-before-design / 본 DEC 권고 자체에 재귀 적용)**: `severity_ceiling` 은 **미적용**. 가장 가까운 선례 = `code-graph.json`(순수 구조 reference / severity_ceiling 없음)이며, `severity_ceiling: ["low","medium"]` 은 finding 을 **emit 하는** lens(code-coverage-hole / code-anchor-verify)에만 존재. `scope-carve.json` 은 severity 행을 안 담는 순수 구조 산출물 → 산출물 meta 의 severity_ceiling = 무의미. low|medium finding cap 은 **skill log-layer**(`_base-log-finding`)에서 enforce(SKILL.md trust 모델 명시).
- `meta.evidence`(code-graph 패턴): `evidence_trust ∈ {real_tool, simulated}` — carve = 진짜 결정론 계산 → **real_tool 만** 산출. `derived_from[]` = {tool:"git", method:"git log --name-only ..."} + {tool:"scope-carve", method:"Tarjan SCC / Martin / co-change over architecture.json + git history"}.
- carve 가 emit 하는 reference finding(예: "거대 SCC = leverage 소실")은 `_base-log-finding` 으로 **low|medium 만**(gate blocker ❌).

### 2.4 Martin A/D 정직 abstain (no-simulation)

A(abstractness)는 module 별 abstract/concrete 타입 카운트 필요 → **architecture.json 입력에 부재**. → 1차는 **Ca/Ce/I 만 계산**(deps 에 100% grounded), **A·D = `null` + `not_computable` 사유 명시**("abstractness requires per-type abstract/concrete counts absent from architecture.json"). layer enum(domain=abstract 등)으로 A 를 추정하는 것은 **measured fact 로 제시 = no-simulation 위반** → 거부(추정 ≠ 측정). 모DEC §6 묶음·plan §3 의 "Martin Ca·Ce·I·D" 표기 중 D 는 본 입력에서 환원 불가 = honest carry(향후 type-spec/AST 입력 결합 시 A·D 활성).

### 2.5 co-change = `git log` 이력 logical-coupling mining

research 권위(`feedback_research_fact_validation`): co-change = 이력 전체에서 **함께 변경된 파일쌍**의 support(동시변경 횟수) / confidence(조건부) mining. (asset-map sub-agent 가 living-sync point-to-point 전파를 co-change 로 **오인** — 정정.) 알고리즘: `git log --no-merges --name-only --format=<\x01>%H`(deterministic) → 커밋별 file-set(transaction) → `max-transaction-size` 초과 commit 제외(tangled commit 왜곡 회피) → pairwise support/confidence → `min-support`/`min-confidence` 필터 → `window`(최근 N commit) 또는 `since` 로 cold-start·이력 편향 제어. **4 파라미터 모두 출력 JSON 에 명시**(soft gate 가 사람에게 노출 / 'deterministic'은 pin 이후에만 성립).

- **Phase 1 정정 (git runner buffer)**: 당초 "makeGitRunner 재사용" 계획이었으나 실측 = `_shared/code-pointer-git.js::makeGitRunner`(maxBuffer 기본 1MB / timeout 5s)는 small single-path query(findRelocation)용 → bulk `git log --name-only` 이력 출력에 **ENOBUFS**. 동일 이유로 `gitDiffNumstat`(revisit-detect.js)이 maxBuffer 10MB 사용 = 선례. → co-change 는 makeGitRunner 의 결정론 execFileSync **계약**(no shell / stderr ignore / no --pager / windowsHide)을 따르되 mining-grade(64MB / 30s) 자체 runner(`makeMiningGitRunner`, co-change.js 내). _shared 무수정(blast-radius 0 / chain-driver·code-pointer-validator 영향 0).

### 2.6 1차 dogfood 전략 (PoC target `.git` 부재 대응)

실측: examples/poc-XX/target/ = vendored(자체 `.git` 0). → 신호별 분리 dogfood(정직):

- **SCC + Martin** = `poc-01-realworld-spring`(legacy Spring) architecture.json 에 live 실행(circular_dependencies 1 = SCC corroboration). 가능 시 `poc-18`(modern TS) 보조.
- **co-change** = git 이력 필수. 1차 = (i) **synthetic git fixture unit-test**(결정성·param 동작 입증) + (ii) **본 방법론 repo 자체 이력**에 1회 self-dogfood(`feedback_codegraph_step_dogfood_examples` 동형 — 외부 target 부재해도 self-dogfood 가능). **target-with-history live dogfood = ≥2 PoC 격상 단계로 명시 carry**(1차 honest caveat).

### 2.7 신규 ID 도입 ❌

carve 후보 = ephemeral reference-lens 행(module-id 집합 키) / finding = 기존 `F-*`. **id-conventions 무변경**(신규 prefix = 거버넌스 비용). scope slug = 기존 G3 규칙(사용자 init 시 정의 / carve 가 slug 자동생성 ❌ — carve 는 신호일 뿐 scope 이름 아님).

### 2.8 release scope = draft (격상 deferral / §8.1)

1차 = tool + schema + skill + 본 DEC + 1 dogfood 산출물. **plugin.json bump / CHANGELOG / lifecycle-contract MANDATORY 등재 = 보류**(모DEC db-schema sensitivity 선례 동형 — corroboration 전 의도적 미기재). carve = **opt-in reference-lens**(codegraph 처럼 MANDATORY 격상은 ≥2 PoC 후). release-readiness 41-check = 회귀 0 의무(신규 schema strict + skill citation 정합 / 신규 tool 은 check3 mandatory validator subset 에 **미등록** = analysis reference-lens, gate validator 아님).

## 3. 근거

- **research 3신호 결론** = 결정론 + cheap + reference-lens 적격(2원칙 / version-pinned). 2신호(MQ/EventStorming)는 비재현/human-judgment → 결정론 헬퍼 부적합.
- **standalone tool+skill** = codegraph 선례가 reference-lens 도구의 검증된 패턴. chain-driver subcommand 화 = 결정론 코어 blast-radius ↑ + trust 경계 흐림 → 거부(`feedback_chain_driver_deterministic_axis`).
- **A/D abstain** = no-simulation(`feedback_no_static_tool_simulation`) — 측정 불가량을 측정값으로 제시 ❌. honest null + 사유 = 신뢰도 보존.
- **co-change 정정** = sub-agent 오인을 research 권위로 교정(`feedback_research_fact_validation` — 외부 framework 추정 ❌, 실 정의 우선).
- **§8.1 단일 PoC 과적합 회피** = 1차 draft / 본체 격상은 ≥2 distinct 도메인 corroboration 후.

## 4. Non-goal (1차)

- chain-driver / gate / regen_queue / manifest 수정 ❌ (reference-lens 만).
- carve 가 scope slug·work-unit-manifest 자동 생성 ❌ (사람이 soft gate #0 에서 확정 후 `chain-driver init --scope`).
- Bunch MQ / EventStorming 신호 ❌ (부적격 / 향후 human-in-loop low-trust only).
- Martin A/D 측정 ❌ (입력 부재 / abstain).
- MANDATORY 도구 격상·lifecycle-contract 등재 ❌ (≥2 PoC 후).

## 5. 단계 로드맵

- **Phase 0 (본 DEC)** = 설계 락 + §6 일괄 승인.
- **Phase 1 (1차 draft)** = schema + tool(scc/martin/co-change/cli + node:test) + skill + 1 dogfood(poc-01 SCC+Martin / self+fixture co-change) + release-readiness 회귀 0 확인.
- **Phase 2 (격상)** = ≥2 distinct 도메인 PoC corroboration(예: poc-18 modern + 사내 legacy / co-change = target-with-history) → lifecycle-contract MANDATORY 검토 + plugin.json + CHANGELOG + 별도 격상 DEC.

## 6. 일괄 승인 묶음 (3원칙) — ✅ 4결단 모두 권고 채택 (2026-06-09)

> core(3신호 + reference-lens)는 사용자 지시·research 로 확정. 아래 1차 **구현 형태** 4결단 = 사용자 일괄 승인 **권고 채택**.

1. **구현 형태**: ✅ standalone tool+skill(codegraph 선례 / chain-driver 무수정). (vs chain-driver subcommand)
2. **co-change 1차 범위**: ✅ `git log` 이력 mining(4 param soft-gate / research). (vs SCC+Martin 만 / point-to-point)
3. **co-change dogfood**: ✅ synthetic fixture unit-test + 본 repo self-dogfood. (vs 소형 OSS clone / 전면 보류)
4. **release scope**: ✅ 1차 = draft(version/CHANGELOG/MANDATORY 등재 보류, §8.1). (vs 즉시 MINOR)

(Martin A/D abstain·신규 ID 미도입 = no-simulation·거버넌스 정책상 결단 불요 / 자동 적용.)

## 7. 검증 / 상태

- **Phase 1 draft 완료** (2026-06-09 / §9 시행 로그) — schema + tool(4 모듈 + 28 node:test) + skill + dogfood 2종 land. plugin.json·CHANGELOG·lifecycle-contract 무변경(§8.1 격상 보류 / 모DEC db-schema sensitivity 선례 동형).
- 기존 자산 실측 3건(Tarjan/Martin 부재·architecture.json 입력·gitDiffNumstat point-to-point) = grep + 직독 확인(메인 + sub-agent cross-validation / F-015).
- **§8.1 격상 gate**: 본체 격상(lifecycle-contract MANDATORY 등재 + plugin.json + CHANGELOG + 별도 격상 DEC) = ≥2 distinct 도메인 PoC corroboration 후(co-change = target-with-history live 포함).

## 8. caveat (정직)

- **co-change live dogfood 미수행**(1차) = PoC target `.git` 부재 → synthetic fixture + self-dogfood 로 대체, target-with-history 는 ≥2 PoC 격상 carry.
- **Martin A/D 환원 불가**(현 입력) = honest abstain. D 신호(main sequence 거리) 부재 = seam 랭킹이 I·Ca·Ce 3축에 한정.
- **SCC garbage-in** = architecture.json deps 가 동적 dispatch/DI/iBATIS XML 매핑 누락 시 false 'sliceable'(codegraph iBATIS2 blind 정합) → carve 는 정적 신호로 한정, co-change 가 직교 보완하나 완전성 보장 ❌.
- **신호 ROI 미실증**(1차) = §8.1 — 3신호 carve 의 실 가치(seam 제안 정확도)는 ≥2 PoC corroboration 후에만 본체 격상.
- carve research = agent URL 독립 재fetch 미수행(원 verified 인용 / 1차 출처 신뢰도는 research 본문).

## 9. Phase 1 시행 로그 (2026-06-09 / draft)

**산출 자산** (plugin.json·CHANGELOG 무변경 / §8.1 격상 보류):

- `schemas/scope-carve.schema.json` (reference-lens / additionalProperties:false strict / ajv valid 확인).
- `tools/scope-carve/` — `src/{scc,martin,co-change,carve,cli}.js` + `test/{scc,martin,co-change,carve}.test.js`(**28 node:test 전부 pass**) + README.
- `skills/analysis-scope-carve/SKILL.md` (analysis / cross-cutting / reference-lens / no-simulation / soft gate #0).
- 본 DEC + INDEX 미해결 등재 + plan §3 Phase 0 갱신.

**Dogfood (≥1 / §8.1 1차)**:

- **SCC+Martin live = poc-01-realworld-spring**(legacy Spring / 10 module·13 edge) → `examples/poc-01-realworld-spring/output/scope-carve.json`. **SCC corroboration**: 도구의 Tarjan 이 독립적으로 찾은 atomic cycle `[MOD-DOMAIN-ARTICLE, MOD-DOMAIN-USER]` = architecture.json 의 손기록 `circular_dependencies`(scc_size 2)와 **정확 일치** = 독립 재현. Martin role 타당(app-layer 어댑터=sink/깨끗추출 / domain 엔티티=hub/shared-kernel). co-change = `not_run`(target `.git` 부재).
- **co-change live = 본 방법론 repo self-dogfood**(`feedback_codegraph_step_dogfood_examples` 동형). since=2026-05-20 / commit 262건 중 184건 mining → 121 pair. **top coupling = release-lockstep**(CHANGELOG.md↔package.json sup82 / plugin.json↔package.json sup80 / CLAUDE.md↔plugin.json sup78) = **정적 그래프가 절대 못 보는** 결합을 git-only 신호가 포착(research 가치 명제 실증). (artifact 미커밋 = 메타 / 수치 본 로그 보존.)
- **co-change synthetic fixture** = 9 node:test(support/confidence/window/max-tx-size/no_git_history honest skip/결정성).

**Phase 1 발견 2건**(diagnose-before-design 재귀):

1. `severity_ceiling` 미적용 정정(§2.3) — scope-carve.json = code-graph 동형 순수 구조 reference(severity 행 없음) → finding cap 은 skill log-layer.
2. mining-grade git runner(§2.5) — makeGitRunner(1MB/5s)는 small-query 용 → bulk 이력 ENOBUFS → `makeMiningGitRunner`(64MB/30s / execFileSync 계약 동일 / _shared 무수정).

**검증**: scope-carve 28 test pass + dogfood artifact ajv valid + release-readiness 회귀 0(§검증 절차 별도 확인).

## 10. 후속 — 델타 #4 hotspot 흡수 (2026-06-09 / sibling DEC)

본 DEC 직후 델타 #4(hotspot)가 **동일 scope-carve 자산에 4번째 신호로 흡수**됨 → `DEC-2026-06-09-hotspot-prioritization-reference-lens`. 결과 본 DEC 의 일부 표기 갱신:

- schema title "역공학 scope-carve **3신호**" → "scope-carve **신호**"(구조 3 + 우선순위 axis). scope-carve.json 에 `hotspot` 블록 + `params.hotspot` + `hotspot_priority` candidate kind 추가(additive).
- co-change `mineCoChange` 가 `file_churn` 추가 반환(hotspot churn 재사용 / 단일 git 패스).
- Phase 1 발견(공유): `cli.js` 대용량 `--stdout` + `process.exit(0)` = pipe truncate → 성공 경로 exit 제거.
- 테스트 28 → 38. "3signal" 식별자는 본 DEC 파일명·역사 표기로 보존(hotspot = 직교 우선순위 axis로 별 델타 / 구조 3신호 본질 불변).

## 인용

- spec/plan: `methodology-spec/reverse-engineering-methodology.md` · `.claude/plans/plan-reverse-engineering-methodology.md` §3 · `.claude/plans/research-reverse-engineering-carve.md`
- 입력 자산: `schemas/architecture.schema.json` · `examples/poc-01-realworld-spring/output/architecture/architecture.json`(dogfood 입력)
- 선례: `schemas/code-graph.schema.json` + `skills/analysis-code-graph/SKILL.md`(reference-lens 패턴) · `tools/codegraph-runner/`(standalone tool 패턴) · `tools/_shared/code-pointer-git.js`(`makeGitRunner` 재사용)
- 재사용 후보: `tools/chain-driver/src/revisit-detect.js`(`gitDiffNumstat` / point-to-point 대조 근거)
- 관련 DEC: DEC-2026-06-09-reverse-eng-methodology-gap(모) · DEC-2026-05-28-codegraph-probe-결과 §4.2 · DEC-2026-05-30-codegraph-essential · DEC-2026-06-06-analysis-exit-gate
- memory: `feedback_chain_driver_deterministic_axis` · `feedback_research_fact_validation` · `feedback_no_static_tool_simulation` · `feedback_diagnose_before_design_check_existing` · `feedback_codegraph_step_dogfood_examples` · `feedback_quality_priority`
