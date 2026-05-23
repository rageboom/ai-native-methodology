# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:
- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

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

## [8.14.4] — 2026-05-23 PATCH — F-SIM-012 + F-SIM-014 closed (잔존 시뮬레이션 carry 0 도달)

> v8.14.3 carry 의 마지막 잔존 F-SIM 2건 종결. 사용자 묶음 결단 (F-SIM-012 close / F-SIM-014 scope-out / 둘 다 권장 채택). additive doc + schema 설명 정정 / breaking 0.
>
> - **F-SIM-012** (severity_distinct_count=1 mask): `severity_distinct_count` gauge 는 F-SIM-002 로 schema+builder 에 **이미 존재** (audit signal). schema 설명이 약속한 "release-readiness #14 sentinel" 은 미구현 → **하드 release-gate sentinel scope-out** (distinct==1 은 작은 all-must PoC[poc-14] 정상값 → gate 화 시 §8.1 단일 PoC false-positive). gauge(감사 신호)로 충분 → **closed**. schema 설명에서 미구현 sentinel 문구 정정.
> - **F-SIM-014** (analysis-form-validation-fe BE cover): skill 은 의도적 FE 전용 (name `-fe` / track=FE / Zod·Yup·RHF 대상). BE schema validation (Pydantic / dataclass / Joi-BE) = 별도 future skill 후보로 문서화 → **scope-out closed** (skill 정체성 보존 + breaking 0 / F-SIM-016 환경-의존 scope-out 선례 동형 / poc-14 BE 표면은 analysis-source-inventory 우회 cover).
> - **결과**: 시뮬레이션 dogfood(F-SIM) ledger 잔존 carry = **0** (F-SIM-001~016 전부 처분).
> - 변경: finding-system.md F-SIM-012/014 status closed + summary / traceability-matrix.schema.json severity_distinct_count 설명 정정 / 3-way version 8.14.3 → 8.14.4 / DEC-2026-05-23-fsim-012-014-close + INDEX + STATUS + CLAUDE.md sync.
> - **STOP-3**: workspace 694/694 pass (보존) / version 3-way 8.14.4 / skill-citation 0 stale / breaking 0 = PATCH.

## [8.14.3] — 2026-05-23 PATCH — F-SIM-016 closed (R19 Tier 2 environment-dependent risk sub-axis paradigm 진화 / Tier 3 격상 ❌)

> v8.14.2 carry F-SIM-016 본격 종결. 사용자 결단 "나머지 진행 하자" → #1 F-SIM-016 영구 scope-out 채택. paradigm 정합 = Tier 2 sub-axis 본격 명시 (Tier 3 격상 ❌ / simulated 와 본질 구분). additive doc only / breaking 0.

### 본질 (paradigm self-correction 본격 입증대)

v8.14.1 정식 ledger 등재 시 carry note = "R19 Tier 3 영구 reject 격상 후보" 명시 = ★ **사실 잘못** (Tier 3 = simulated only). Senior 사실 검증 보강 paradigm 재발 (LL-fsim-11 본격 입증 확장 = ★ main agent self-fact-check).

★ ★ ★ **paradigm self-correction 본격 입증대**:
- Tier 3 = simulated only 본격 재확인
- environment-dependent risk = 사용자 환경 부재 case (simulated 아님)
- paradigm 정합 path = Tier 2 안 **sub-axis** 본격 명시 + carry 정직 표기

### R19 Tier 2 environment-dependent risk sub-axis (paradigm 진화)

charter R19 row sub-axis patch:
- 사용자 환경 부재 (Semgrep Windows MSYS2 / argon2+Node 22+Windows native build / sqlite3 native rebuild 등) = Tier 3 격상 ❌
- carry 정직 표기 의무 (deadline 없음 / 환경 가용 시 본격 진입)
- pre-flight smoke STOP-3 hard gate paradigm (LL-fsim-15) + Senior 사실 검증 보강 paradigm (LL-fsim-11) 정합

### 자산 변경 (additive doc / breaking 0)

- **`methodology-spec/plugin-charter.md`** — §2 R19 row sub-axis patch (environment-dependent risk 본격 명시)
- **`methodology-spec/finding-system.md`** — F-SIM-016 ledger 표 row status open → closed v8.14.3 + body Resolved fix + Status 갱신
- **memory `feedback_environment_dependent_tools_scope_out.md`** — 본격 신설 (feedback type / Tier 3 격상 ❌ paradigm 본격 명시 / Cross-link feedback-commit-block-no-cheat + feedback-senior-fact-check-supplement)
- **memory MEMORY.md** — index 본격 entry 추가
- **`decisions/DEC-2026-05-23-fsim-016-environment-dependent-scope-out.md`** — 본 DEC 신설
- 3-way version sync = plugin.json + package.json + CHANGELOG 8.14.2 → 8.14.3
- INDEX 최상단 + STATUS session 39차 v8.14.3 sub-entry + CLAUDE.md sync

### STOP-3 hard gate (시행 결과)

- ✅ paradigm 정합 (Tier 3 = simulated only) 본격 재확인
- ✅ Tier 2 sub-axis 본격 명시 (additive paradigm 진화)
- ✅ F-SIM-016 status closed v8.14.3
- ✅ skill-citation-validator 0 stale (보존)
- ✅ breaking 0 (PATCH)

### LL 자산화 (2종 / LL-fsim-18 + LL-r19-04)

- LL-fsim-18 — Senior 사실 검증 보강 paradigm 안 main agent self-fact-check 본격 작동 (Tier 3 격상 후보 사실 잘못 발견 + paradigm 정합 path 본격 결정) = LL-fsim-11 본격 확장
- LL-r19-04 — R19 Tier 2 안 environment-dependent risk sub-axis paradigm 진화 (sub-axis 본격 분류 의무 / 14차 retract pattern 회피)

### 본 session 누적 4 release (v8.14.0 MINOR + v8.14.1 PATCH + v8.14.2 PATCH + v8.14.3 PATCH)

### Cross-link

- Resolves F-SIM-016 (v8.4.0 carry / v8.14.1 정식 ledger / v8.14.2 carry note 본격 정정)
- Amends charter R19 (v8.6.0 신설 / v8.14.3 sub-axis patch)
- Cross-link: DEC-2026-05-18-runtime-tool-exclusion + DEC-2026-05-23-poc-03-carry-acknowledged

---

## [8.14.2] — 2026-05-23 PATCH — poc-03 chain 4 GREEN = deadline 없는 carry 정직 표기 (Senior STRONG-STOP signal 2종 본격 입증 + paradigm enforcement 본격 입증대)

> Type 1.5 second arm sprint 본격 종결 = poc-03 carry 정직 표기 paradigm. 사용자 결단 ladder = "이제 진행 하자" → C (Type 1.5 second arm) → A1+B2+C1+D1+E2 + sqlite → Senior REVISE-3 STRONG-STOP 2종 발견 → REVISE 전면 흡수 → C3.5 pre-flight smoke FAIL → 옵션 B (carry 정직 표기). additive doc only / breaking 0.

### 본질 (paradigm enforcement 본격 입증대)

본 release = chain 4 GREEN 미도달이나 ★ ★ ★ **paradigm enforcement 본격 입증대** = 가치 본격 ★★★:
- Senior 사실 검증 보강 paradigm **2회 재발** (v8.14.0 poc-02 source empty + 본 sprint poc-03 npm install fail) = LL-fsim-11 본격 paradigm 입증 확장
- pre-flight smoke = STOP-3 hard gate 의무 paradigm 본격 자산화
- commit-block 회피 꼼수 ❌ paradigm 본격 재작동 (LL-fsim-12 + LL-fsim-17) = pre-flight fail 시 carry 정직 표기 본격 선택 = paradigm maturity signal 본격
- 14차 retract pattern 회피 본격 정합 (본격 시행 후 실패 ❌ / pre-flight 단계 carry 정직 표기)

### Senior REVISE-3 (confidence 0.74) STRONG-STOP signal 2종

- **STRONG-STOP-1 (BLOCKER)**: poc-03 source = impl-only / Senior claim "0 matches" 사실 정정 (실측 1 spec 보유 / SIGNUP+LOGIN spec ❌ 유효) / characterization test paradigm 본격 적용 의무 (Michael Feathers / aspirational test ❌)
- **STRONG-STOP-2 (HIGH)**: sqlite scope expansion 9일 시한 비현실 + argon2 native build Windows + Node 22 = likely install failure → **본격 입증 = npm install fail / jest 본격 install ❌**

### C3.5 pre-flight smoke 시행 결과 (STOP-3 gate #10 FAIL)

| 단계 | 결과 |
|---|---|
| Node v22.11.0 + npm 10.9.0 | 환경 본격 가용 ✅ |
| `**/*.spec.ts` 실측 | 1 spec 본격 보유 (`tag.controller.spec.ts`) — Senior "0 matches" 사실 정정 |
| `npm install --ignore-scripts` | ★ ★ **본격 fail** ("Exit handler never called" / 2020 deps + npm 10 strict peer deps) |
| jest 본격 install | ❌ (npm install 부분 install / jest 자체 install ❌) |
| `npx jest --listTests` | ❌ "jest 본격 인식 불가" |
| **STOP-3 gate #10** | ❌ **FAIL** |

### 자산 변경 (additive doc / breaking 0)

- **`plan-poc-03-chain-4-green.md`** — §9 본 sprint 본격 종결 + Senior STRONG-STOP-2 입증 + carry 정직 표기 paradigm 추가
- **`decisions/DEC-2026-05-23-poc-03-carry-acknowledged.md`** — 본 DEC 신설
- 3-way version sync = plugin.json + package.json + CHANGELOG 8.14.1 → 8.14.2
- INDEX 최상단 entry + STATUS session 39차 v8.14.2 sub-entry + CLAUDE.md sync
- memory `project_v8140_release_status.md` 갱신 (v8.14.2 carry + LL-fsim-14~17 추가)

### STOP-3 hard gate (시행 결과)

- ✅ pre-flight smoke FAIL = paradigm 정합 carry 정직 표기 본격 선택
- ✅ v8.14.0 + v8.14.1 paradigm 본격 보존
- ✅ skill-citation-validator 0 stale (보존)
- ✅ breaking 0 (PATCH)

### LL 자산화 (4종 / LL-fsim-14~17)

- LL-fsim-14 — Senior 사실 검증 보강 paradigm 2회 재발 (LL-fsim-11 본격 입증 확장)
- LL-fsim-15 — pre-flight smoke = STOP-3 hard gate 의무 paradigm
- LL-fsim-16 — 6년 전 OSS fork environment-dependent risk (F-SIM-016 paradigm 동형)
- LL-fsim-17 — commit-block 회피 꼼수 ❌ paradigm 본격 재작동 검증 (LL-fsim-12 재입증)

### 차기 session carry path (deadline 없음)

- poc-03 chain 4 GREEN (npm install environment fail / Docker 또는 Node 14.x downgrade 후보)
- poc-04-mini React chain 4 GREEN (FE 트랙 / 환경 사전 사실 검증 의무)
- poc-02 Spring Boot 3 chain 1~4 (source clone 의무 / 가장 무거운 work-unit)
- Type 2 axis (외부 사용자 / OSS 채택 트리거 의존)

### Cross-link

- Resolves Type 1.5 second arm sprint = paradigm 정합 carry 정직 표기 (poc-03 본격 carry)
- Amends DEC-2026-05-23-fsim-005-corroboration-2-genuine (Type 1.5 second arm carry 본격 명시)

본 session 누적 3 release (v8.14.0 MINOR + v8.14.1 PATCH + v8.14.2 PATCH).

---

## [8.14.1] — 2026-05-23 PATCH — F-SIM-12~16 정식 ledger 등재 + closed 2종 (F-SIM-013 + F-SIM-015 본격 흡수 자산화 / v8.4.0 carry 본격 종결)

> v8.4.0 (2026-05-18) 시뮬레이션 dogfood 5 신규 finding 의 정식 ledger 등재 carry (`project_v84_simulation_carry.md` 의제 B) 본격 종결. v8.14.0 paradigm 진화 후속 sync. 사용자 결단 "α로 진행" (cooling-off cadence 안 additive only 작업). additive doc only / breaking 0.

### 본질 (cooling-off cadence 정합)

v8.14.0 (2026-05-23) MINOR release 직후 paradigm 안정점 cooling-off 24h cadence 안 additive 즉시 작업 진입. v8.13.1 dep-graph SSOT doc only PATCH precedent 동형 = release 후 carry 정식 자산화 의무.

### F-SIM ledger 갱신

`methodology-spec/finding-system.md` F-SIM namespace 표 11 row → **16 row**.

- **closed v8.14.0** (2종 / 본격 자산화):
  - **F-SIM-013** (medium) — Type 1 시뮬레이션 한계 (hook + agent fire 0 / Claude self-run paradigm). v8.14.0 Type 분류 3계층화 paradigm 본격 흡수 (Type 1 정식 분류 + Type 2 carry 정직 표기 / DEC-2026-05-23-fsim-005-corroboration-2-genuine §1).
  - **F-SIM-015** (high) — test-spec.fail_mode schema 미허용 / F-SIM-005 P1 carry 즉시 영향. v8.14.0 fail_mode enum 4종 (compile_import_fail/assertion_fail/dry_run_placeholder/pending) + chain-coverage-validator validateFailModeDistribution 7번째 export 본격 흡수 (DEC-2026-05-23-fsim-005-corroboration-2-genuine §3).

- **open carry** (3종 / 정직 표기 / cooling-off 후 별 결단 / deadline 없음):
  - **F-SIM-012** (medium) — severity_distinct_count=1 mask (모든 AC must → cell critical / F-SIM-002 propagation 가시화 부분 잔존 / paradigm-level 한계 single-PoC carry / proposed fix = severity_distinct_count gauge metric 신설).
  - **F-SIM-014** (low) — analysis-form-validation-fe description "FE-only" → Pydantic BE schema validation cover ❌ / F-SKILL-014 동반 후보 / skill description scope 확장.
  - **F-SIM-016** (low) — static-runner Semgrep wrapper deprecated / Windows MSYS2 환경 fire ❌ / R19 Tier 2 환경 의존 / memory `environment-dependent-tools-scope-out` 정합 영구 scope-out 후보.

### 자산 변경 (additive doc / breaking 0)

- **`methodology-spec/finding-system.md`** — F-SIM ledger 표 11 → 16 row + body 5종 신설 (F-SIM-012/013/014/015/016 각 phase / confidence / type / description / evidence / spec_gap / decision_made / severity / proposed_fix / status)
- 3-way version sync = plugin.json + package.json + CHANGELOG 8.14.0 → 8.14.1
- DEC-2026-05-23-fsim-12-16-ledger-registration 신설 + INDEX 최상단 + STATUS session 39차 v8.14.1 sub-entry + CLAUDE.md sync

### STOP-3 hard gate (시행 결과)

- ✅ skill-citation-validator 227 active doc / 0 stale dead-link
- ✅ 변경 = finding-system.md 만 (additive doc only)
- ✅ breaking 0 (PATCH)
- ✅ version 3-way sync

### LL 자산화 (1종)

- **LL-fsim-13** — release 직후 cooling-off cadence 안 additive only doc-sync paradigm = v8.13.1 dep-graph SSOT doc only PATCH precedent 동형. paradigm preservation = release 후 carry 정식 자산화 의무.

### Cross-link

- Resolves `project_v84_simulation_carry.md` §의제 B (F-SIM-12~16 정식 ledger 등재) — v8.4.0 carry 본격 종결
- Amends DEC-2026-05-23-fsim-005-corroboration-2-genuine (F-SIM-013 + F-SIM-015 closed 본격 등재 추가)
- Open carry = F-SIM-012/014/016 (cooling-off 후 별 결단 / deadline 없음)

---

## [8.14.0] — 2026-05-23 MINOR — F-SIM-005 P1 corroboration #2 본격 해소 + Type 분류 3계층화 paradigm 진화 + fail_mode_qualification boolean 강제 (Adzic SBE 함정 직접 회피)

> F-SIM-005 P1 carry (commit-block deadline 2026-06-01 / D-9) 본격 해소. 사용자 결단 "ㄱㄱ" (4원칙 §1+§2+§3 ladder full / 3-agent Senior REVISE-3 @ 0.83 흡수 + 옵션 α 채택). additive / breaking 0.

### 본질 진화 (paradigm)

본 release = v8.4.0 (2026-05-18) 의 "패러독스 해소" claim 을 ★ ★ ★ **진정 해소** 로 격상. v8.4.0 시점에 PoC #14 corroboration #2 자격 명목 달성 (Type 1 / Claude self-run / Python+pytest) 했으나, 본질 잔존 = Type 1 vs Type 2 분리 미명시 + fail_mode enum 부재 + dry_run_placeholder 자격 mask 가능성 잔존. v8.14.0 = Type 분류 3계층화 paradigm 진화 + fail_mode 4종 enum + boolean 강제로 본격 해소.

★ ★ ★ ★ ★ **self-bootstrap proof 부분 입증** = PoC #05 Type 1.5 single arm 본격 달성 (TypeScript+vitest / 본 user 별도 PoC 적용 / Rust/GCC Stage 3 identity check 동형). Type 1.5 second arm + Type 2 = carry 정직 표기 (commit-block 회피 꼼수 ❌).

### 4원칙 ladder full

1. **1원칙 (plan)**: `.claude/plans/plan-fsim-005-corroboration-2.md` + REVISE-1+2+3+LOW 흡수 갱신
2. **2원칙 (3-agent)**: `_base-official-docs-checker` (F-015 Claim A VERIFIED / Claim B PARTIAL-VERIFIED / Claim C PARTIAL / STOP 없음) + `_base-industry-case-researcher` (9 case isomorphic / first-mover 자격 ✅ / 함정 회피 3종 ✅) + `_base-senior-engineer` (REVISE-3 @ 0.83 / STRONG-STOP 1 + HIGH 1 + MED 1 + LOW 1 흡수)
3. **3원칙 (사용자 묶음 결단)**: A5 + B3 + C3 + D2 권고 전면 흡수 → Senior REVISE 전면 흡수 (A5' + B3' + C3' + D2 + LOW) → poc-02 source empty 발견 시 옵션 α 채택 (carry 정직 표기 + 현 상태 release)

### Senior REVISE 흡수 (4종)

- **REVISE-1 BLOCKER**: Type 2 9일 시한 안 불가능 → Type 분류 3계층화 (Type 1 / Type 1.5 / Type 2) + Type 2 carry 정직 표기
- **REVISE-2 HIGH**: poc-15 신설 ❌ → poc-02 재검증 → (turn 중 source empty 발견 / 옵션 α 채택) → carry 정직 표기
- **REVISE-3 MED**: dry-run 30% 임계 §8.1 단일 PoC 함정 위배 → warn-only + boolean 강제 (임계 ratio ❌ / 30% ratchet = v+1)
- **LOW**: "5번째 export" 사실 오류 → "7번째 export (utility 제외 6번째)" 정정

### 자산 변경 (additive / breaking 0)

- **`schemas/test-spec.schema.json`** — `test_cases.items.properties.fail_mode` enum 4종 (compile_import_fail / assertion_fail / dry_run_placeholder / pending) 추가 (additive optional)
- **`tools/chain-coverage-validator/src/validator.js`** — `validateFailModeDistribution` 7번째 export 신설 (warn-only / dry_run_placeholder boolean 강제 + corroboration_qualified 반환)
- **`tools/chain-coverage-validator/src/cli.js`** — `--test-spec <path>` flag wire + JSON/human output + exit code 보존 (warn-only)
- **`tools/chain-coverage-validator/test/validator.test.js`** — 신규 4 test 추가 (all-compile_import / any-dry_run / mixed-pending-absent / GREEN+graceful) — 30/30 → **34/34 pass**
- **`flows/sdlc-4stage-flow.json`** — `release_eligibility.corroboration_type_levels` 3계층 신설 (Type 1 / Type 1.5 / Type 2 + 권위 동형 명시) + `fail_mode_qualification` boolean 강제 (qualified_modes 3종 + excluded dry_run_placeholder) + items 7 갱신 + self_consistency_note 정직 표기 (Type 1.5 single arm 본격 + Type 1 partial 보존 + Type 1.5 second arm carry + Type 2 carry)
- **`examples/poc-05-sample-user-register/.aimd/output/test-spec.json`** — `fail_mode: assertion_fail` 표기 2건 (additive)
- **`examples/poc-14-fsim-corroboration/.aimd/output/test-spec.json`** — `fail_mode: assertion_fail` 표기 4건 (additive)
- 3-way version sync = plugin.json + package.json + CHANGELOG.md 8.13.3 → 8.14.0
- DEC-2026-05-23-fsim-005-corroboration-2-genuine 신설 + INDEX 최상단 + STATUS session 39차 + CLAUDE.md sync

### F-015 권위 (3 primary source VERIFIED)

- **Beck-canonical RED** = Kent Beck "Test-Driven Development: By Example" (Addison-Wesley 2002) preface p.x verbatim: "Red — Write a little test that doesn't work, **and perhaps doesn't even compile at first**"
- **DO-178C bidirectional traceability** = Parasoft Learning Center verbatim: "Maintaining the bidirectional correlation between requirements, tests, and the artifacts that implement them is an essential component of traceability"
- **Adzic SBE 10-year lesson** = gojko.net/2020/03/17/sbe-10-years.html verbatim: "about one third of the teams miss out on the potential benefits of examples to create high quality, self-checking documentation"

### Industry case 9 case isomorphic (first-mover 자격)

- **Self-bootstrap 영역**: Rust 4-stage bootstrap (Stage 3 identity check) + GCC 3-stage + Go self-hosting
- **Spec-driven gate 영역**: GitHub Spec Kit (specify→plan→tasks→implement + validator) + ThoughtWorks Radar "big-bang anti-pattern" + SWE-bench static/Live 격차 35~50%p
- **Type 1 vs Type 2 영역**: Waymo CarCraft simulation arm + 실도로 arm 병렬 + Anthropic Bloom auto-eval + NIST/AISI 외부 eval 분리 + HumanEval/SWE-bench gap

### STOP-3 hard gate (시행 결과)

- ✅ workspace test 690 → **694/694 pass** (신규 4 test additive)
- ✅ schema-validator 4 PoC test-spec 모두 VALID (additive optional 회귀 ❌)
- ✅ release-readiness 15/16 ready (1 = --skip-workspace-test 명시 skip / release 시 disable 의무)
- ✅ JSON validity (corroboration_type_levels 3 + qualified_modes 3 + items 7)
- ✅ fail_mode regression: poc-05 + poc-14 모두 corroboration_qualified=true
- ✅ chain-coverage-validator 34/34 pass
- ✅ breaking 0 (additive enum + new export only)

### Carry (정직 표기)

- **Type 1.5 second arm** = poc-02 source empty 발견 (Senior 사실 검증 보강) / poc-03 NestJS chain 4 yellow / poc-04-mini React chain 4 yellow — deadline 없음
- **Type 2** = 외부 사용자 / 외부 repo / 별도 Claude Code session — deadline 없음 / OSS 채택 트리거 의존
- 두 carry 모두 **commit-block 회피 꼼수 ❌** paradigm 정합 = release-readiness 자기 enforcement 본격 입증대

### LL 자산화 (8종 / LL-fsim-05~12)

- F-SIM-011 패러독스 진정 해소 부분 입증 (Type 1.5 single arm)
- Beck-canonical RED = compile-import-fail (F-015 VERIFIED)
- dry_run_placeholder 정직 표기 의무 (Adzic 함정 회피)
- Type 분류 3계층화 paradigm 진화
- Senior STRONG-STOP signal 흡수 paradigm (v8.6.0 동형)
- single-PoC threshold 함정 자기 검출 (warn-only 격하)
- Senior 사실 검증 보강 paradigm (AI 결단 ladder 안 사실 검증 의무 / poc-02 source empty 발견)
- commit-block 회피 꼼수 ❌ paradigm = release-readiness 자기 enforcement 입증대

---

## [8.13.3] — 2026-05-23 PATCH — dist/ 전체 정리 (잔여 v1.4.5 + v1.5.0 archive / cleanup carry 종결)

> v8.13.2 carry "C-dist-v145-v15-cleanup" (low) 종결. v8.13.2 dist/internal-v1.4.3 + v1.4.4 archive paradigm 동형 시행 (gitignored / file system mv / commit 자산 변경 0). 사용자 결단 "케리해줘" (2026-05-23). additive corrective / breaking 0.

### 시행

- `dist/internal-v1.4.5` → `archive/dist-history/internal-v1.4.5` (file system mv)
- `dist/internal-v1.5.0` → `archive/dist-history/internal-v1.5.0` (file system mv)
- `dist/` 폴더 = **empty** (전 4 폴더 archive 완료)
- `archive/dist-history/` = **4 폴더** (v1.4.3 + v1.4.4 + v1.4.5 + v1.5.0)

### 자산 갱신

- `plugin.json` 8.13.2 → 8.13.3 + `package.json` 8.13.2 → 8.13.3 (3-way sync)
- 본 CHANGELOG entry
- DEC-2026-05-23-dist-cleanup-final + INDEX 최상단 + STATUS session 38차

### 검증 — STOP-3 hard gate

- dist/ folder 정리 완료 (4 폴더 → archive/dist-history/) ✅
- workspace test 690/690 pass (보존) ✅
- release-readiness 16/16 ready (보존) ✅
- breaking 0 = PATCH (additive corrective)

### carry (다음 session)

- ✅ **carry 잔존 0 보존** (v8.13.1 paradigm 본격 보존)

### 참고

- DEC-2026-05-23-dist-cleanup-final
- v8.13.2 DEC-2026-05-23-project-cleanup §7 carry C-dist-v145-v15-cleanup 종결
- v8.13.2 Phase D paradigm 동형

---

## [8.13.2] — 2026-05-23 PATCH — 프로젝트 정리 cleanup (4 axis archive)

> v8.13.1 carry 잔존 0 + paradigm 안정점 본격 재도달 후 archive cadence 시행. 사용자 결단 "프로젝트를 정리해 보자" → "추천안 묶음 전체 시행 (4 axis)" (2026-05-23). additive corrective / 정보 손실 0 / breaking 0 / cosmetic 4 기준 충족 (rename 0 + cross-ref 치환 0 + 구조 변경 ❌ + plan 명시).

### 4 axis archive 시행

| File/Dir | 이전 | 이후 | 절감 |
|---|---|---|---|
| `decisions/STATUS.md` | 239 line | **30 line** | 87% ↓ |
| `CHANGELOG.md` | 3210 line | **1255 line** | 61% ↓ |
| `CLAUDE.md` | 154 line | 156 line (본문 byte ~50% ↓ / 자세 본문 5종 → 1줄 요약 7종 통일) | byte 효과 |
| `dist/internal-v1.4.x` | 2 폴더 (v1.4.3 + v1.4.4 / dist/) | `archive/dist-history/` | file system organize |

### archive 적재처

- `decisions/STATUS-HISTORY.md` 1807 → **2030 line** (session 31차 이하 cutoff append)
- `CHANGELOG-HISTORY.md` 2870 → **4837 line** (v7.0.0 이하 cutoff append)

### cutoff 선정 paradigm

- **STATUS.md cutoff = line 25** — session 31차 v8.6.x 이하 archive / 본 session 33차~36차 6 release 활성 보존 (paradigm 자연 분기 cutoff / v3.6.5 R3 precedent 정합)
- **CHANGELOG.md cutoff = line 1252** — v7.0.0 MAJOR (rules.json → business-rules.json rename / breaking 최대) 이하 archive / v8.x 활성 보존 (paradigm 자연 분기 cutoff / v2.4 precedent 정합)
- **CLAUDE.md 압축** — session 33차~35차 자세 본문 (v8.10.0~v8.13.0) → 1줄 요약 통일 / 36차 v8.13.1 활성 / 본 v8.13.2 entry 추가
- **dist/ archive** — v8.13.1 시점 stale build artifact (2026-05-02~03 / `/dist/` gitignored) → archive/dist-history/ file system mv (git 추적 외부 / commit 자산 변경 0)

### 자산 갱신

- `plugin.json` 8.13.1 → 8.13.2 + `package.json` 8.13.1 → 8.13.2 (3-way sync)
- `decisions/DEC-2026-05-23-project-cleanup.md` 신설
- `decisions/INDEX.md` 최상단 entry 등재
- `decisions/STATUS.md` session 37차 entry 추가 (4 axis archive 종결)
- `CLAUDE.md` "plugin.json v8.13.2" sync + 현재 release 본문 갱신

### 검증 — STOP-3 hard gate

- workspace test 690/690 pass (보존 / 본 cleanup 코드 변경 0)
- release-readiness 16/16 ready (보존)
- dead-link active surface 0 match (보존)
- 정보 손실 0 (HISTORY append + cross-link 보존)
- breaking 0 = PATCH (additive corrective / cosmetic 4 기준 충족)

### Lessons Learned 신규

- **LL-cleanup-01** — paradigm 안정점 후 archive cadence 정착 / 비대화 4 axis 동시 처분 paradigm (STATUS + CHANGELOG + CLAUDE + dist 한 release 안 흡수)
- **LL-cleanup-02** — cutoff 선정 = paradigm 자연 분기 우선 (session 31차 이전 / v7.0 이전 / v3.6.5 R3 정합 / v2.4 precedent 정합)
- **LL-cleanup-03** — HISTORY append paradigm = section header + 시점 명시 + cross-link 보존 (정보 손실 0 / cosmetic 4 기준 정합)

### carry (다음 session)

- ✅ **carry 잔존 0 보존** (v8.13.1 precedent 본격 보존)
- **dist/internal-v1.4.5 + internal-v1.5.0 archive 후보** — 본 plan 외 / 차기 session 결단 의무 (gitignored build artifact / file system cleanup carry / 1-low)

### 참고

- DEC-2026-05-23-project-cleanup
- v3.6.5 R3 STATUS archive precedent (session 14차 이전 cutoff)
- v3.6.8 A2 INDEX cutoff precedent

---

## [8.13.1] — 2026-05-23 PATCH — dep-graph SSOT 통합 (dead-link 제거 / docs/dependency-graph.md 자체 SSOT 격상)

> v8.9.0 carry "C-operation-md-work-folder" (low / 마지막 carry) 종결. 사용자 결단 "추천" (2026-05-23 / Option C — 16 file 인용 갱신). DEC-2026-05-23-dep-graph-ssot-consolidation 정합. PATCH (corrective dead-link 제거 / 정보 손실 0 / breaking 0).

### 실측 (dead-link 진단)

16 file 안 `dep-graph/operation.md` / `concept.md` / `conventions.md` 인용 발견. 3 SSOT 파일 모두 git tracked 아님 + file system 부재 (commit `b9615d0` 시 사용자 환경 work folder 안 작업 doc / 본 plugin tracked 외부).

### 결단 — Option C 채택

- A. 3 file 신설 (사용자 원본 복원 / 안정도 ↑ but 사용자 read 의무) ❌
- B. SSOT footer 제거 (decommission / 단순) ❌
- **C. 16 file 인용 갱신** — docs/dependency-graph.md 가 이미 131 line SSOT 역할 → 자체 SSOT 격상 + dead-link redirect ✅ (정보 손실 0)

### 시행 (additive / corrective / breaking 0)

#### docs/dependency-graph.md SSOT 자체 격상
- 머리말 "설계 원본(SSOT): dep-graph/{operation,concept,conventions}.md" → "★ v8.13.1 — 본 문서 = 단일 SSOT (DEC-2026-05-23-dep-graph-ssot-consolidation)"
- §1 "(conventions.md §9 …)" → "(§7 기계적 동작 우선)"
- §9 참조 — 3 dead-link 삭제 + 본 doc 자체 SSOT 명시 + 도구 cross-link 보강

#### 10 활성 file 인용 redirect
- `schemas/artifact-graph-node.schema.json`: "dep-graph/operation.md 결정 1" → "docs/dependency-graph.md §2 (그래프 모델)"
- `schemas/artifact-graph-edge.schema.json`: "dep-graph/operation.md 결정 1 + 결정 4 BFS" → "docs/dependency-graph.md §2 + §5 (영향 등급 BFS)"
- `schemas/code-pointer.schema.json`: "dep-graph/operation.md 결정 3" → "docs/dependency-graph.md §3 P2 (code-pointer-validator)"
- `tools/traceability-matrix-builder/src/graph-synthesizer.js`: "dep-graph/operation.md" → "docs/dependency-graph.md §2 + §3 P1"
- `tools/chain-driver/src/propagation-orderer.js`: "operation.md 결정 8 + 결정 5" → "docs/dependency-graph.md §3 P3 + §6"
- `tools/graph-integrity-validator/src/validator.js`: "dep-graph/operation.md 결정 8" → "docs/dependency-graph.md §3 P1 + §7"
- `tools/graph-integrity-validator/README.md` (2건): "dep-graph/operation.md 결정 1+8" + "dep-graph/concept.md 시나리오" → "docs/dependency-graph.md §2+§3+§7" + "docs/dependency-graph.md §1"
- `tools/code-pointer-validator/README.md`: "dep-graph/operation.md 결정 3, 결정 5" → "docs/dependency-graph.md §3 P2 + §6"
- `skills/dep-graph-navigator/SKILL.md` (2건): "dep-graph/operation.md 결정 1/4/7/8" + "dep-graph/concept.md 시나리오" → "docs/dependency-graph.md §2+§5+§3 P4+§7" + "docs/dependency-graph.md §1"
- `methodology-spec/plugin-charter.md`: "설계 SSOT = dep-graph/operation.md" → "설계 SSOT + 운영 가이드 = docs/dependency-graph.md (★ v8.13.1+ 통합)"

#### History immutable file (변경 ❌)
- `CHANGELOG.md` (3건 — v8.13.0/v8.12.0/v8.9.0 history)
- `decisions/INDEX.md` + `decisions/DEC-2026-05-23-{dep-graph,analysis-validator,xmllint}.md` (history reference 보존)

### 자산 갱신

- `plugin.json` 8.13.0 → 8.13.1 + `package.json` 8.13.0 → 8.13.1 (3-way sync)
- DEC-2026-05-23-dep-graph-ssot-consolidation + INDEX 최상단 + STATUS session 36차 entry

### 검증 — STOP-3 hard gate

- dead-link 0 (active surface) ✅ — `grep dep-graph/operation\|concept\|conventions ./{schemas,tools,skills,methodology-spec,docs}` = 0 match
- workspace test pass (xmllint 환경 회복 / fast-xml-parser 정합)
- release-readiness 16/16 ready (보존)
- breaking 0 = PATCH (corrective dead-link 제거 / 정보 손실 0)

### carry 종결 cascade (본 release = 본 session 종결)

★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **본 session (33차~36차) 누적 6 release / 5 carry cascade 종결**:

| Session | Release | carry 종결 |
|---|---|---|
| 33차 | v8.9.0 | dep-graph release ceremony (b9615d0 명시) |
| 33차 | v8.10.0 | analysis_validator carry |
| 34차 | v8.11.0 | Senior REVISE-1 carry |
| 35차 | v8.12.0 | legacy-risks-poc-migration carry |
| 36차 | v8.13.0 | xmllint-env-absent carry (R19 paradigm 완결) |
| **36차** | **v8.13.1** | **operation-md-work-folder carry (dep-graph SSOT 통합)** ← 본 release |

★ ★ ★ ★ ★ ★ **carry 잔존 = 0** (역사상 최초).

### 참고

- DEC-2026-05-23-dep-graph-ssot-consolidation
- v8.9.0 carry C-operation-md-work-folder 종결 (4 release 보존 carry)

---

## [8.13.0] — 2026-05-23 MINOR — sql-inventory-validator Tier 1 in-plugin XML parser 격상 (xmllint → fast-xml-parser / R19 paradigm 정합)

> v8.12.0 carry "C-xmllint-env-absent" 종결. 사용자 결단 "Option A: Tier 1 격상 (fast-xml-parser 도입)" (2026-05-23). DEC-2026-05-18-runtime-tool-exclusion §R19 (Tool Ecosystem Dependency Classification) paradigm 정합. additive / breaking 0 / Windows/Linux/Mac 동일 동작.

### 신규 자산

- **`fast-xml-parser ^4.5.0`** dependency 추가 (`tools/sql-inventory-validator/package.json`)
  - Node-native XML parser (pure JS / no native deps / Windows/Linux/Mac 동일 동작)
  - libxml2 외부 의존 제거 (xmllint command 부재 OS 호환)

### Tier 분류 변경 (R19 정합)

| 변경 | 이전 (v8.7~v8.12) | 이후 (v8.13.0+) |
|---|---|---|
| Tier | Tier 2 (user-environment OS-native binary) | **Tier 1 (in-plugin Node-native)** |
| 도구 | xmllint (libxml2 binary spawn) | fast-xml-parser (npm dep) |
| OS 호환 | Linux/Mac 한정 (Windows env absent) | Windows/Linux/Mac 동일 |
| spawn 호출 | `xmllint --version` probe + `xmllint --xpath` per file | `XMLParser.parse(xmlContent)` + 재귀 tag count |
| field 호환 | `xmllint_total` + `xmllint_version` | **backward-compat** — 동일 field name (value 만 `fast-xml-parser:<ver>` marker) |

### Tag count 알고리즘 (재귀 traversal)

- `XMLParser({ ignoreAttributes:true, parseTagValue:false, isArray: tag => SQL_TAGS.has(tag) })`
- `SQL_TAGS = { select, insert, update, delete, procedure }` (iBATIS 2 + MyBatis 3 공통)
- 재귀 traversal — nested mapper 대응 (Array 강제 / 동일 tag 중복 정확 count)
- v8.7.1 PATCH (F-CYCLE4-001 fix) `<procedure>` tag 포함 — 정합 보존

### Dead code 제거

- `xmllint_unavailable` status 분기 제거 (v8.13.0+ 도달 불가 / clean code)
- `spawnSync` import 제거 (sql-inventory-validator validator.js 한정)

### 자산 갱신

- `tools/sql-inventory-validator/package.json` 0.2.1 → 0.3.0 + `fast-xml-parser ^4.5.0` dependency
- `tools/sql-inventory-validator/src/validator.js` — `crossCheckLegacyXml` 함수 Node-native paradigm 격상 + `countSqlTagsRecursive` 헬퍼 신설
- `tools/sql-inventory-validator/test/validator.test.js` — v8.7 Layer 2 dir_missing test v8.13.0 noter 갱신
- `plugin.json` 8.12.0 → 8.13.0 + `package.json` 8.12.0 → 8.13.0 (3-way sync)

### 검증 — STOP-3 hard gate

- sql-inventory-validator test **31/31 pass** ✅ (v8.7.1 iBATIS test #25+#26 회복 / OS 무관 동일 동작)
- workspace test **690/690 pass** ✅ (v8.12.0 688/690 → v8.13.0 690/690 / xmllint env absent 2 fail 회복)
- release-readiness **16/16 ready** ✅ (v8.12.0 15/16 → v8.13.0 16/16 / xmllint carry 종결)
- breaking 0 = MINOR (additive — Node-native parser 격상 / field name backward-compat)

### carry (다음 session)

- **C-operation-md-work-folder** (v8.9.0 carry 보존 / low) — work/dep-graph/operation.md 가 git tracked 아님 / docs/ 흡수 후보

★ ★ ★ ★ **R19 paradigm 본격 완결** — sql-inventory-validator = Tier 1 in-plugin / xmllint 외부 의존 제거 / Windows 환경 부재 차단 회피 / workspace_test_pass 회복.

### 참고

- DEC-2026-05-23-xmllint-tier1-migration
- DEC-2026-05-18-runtime-tool-exclusion §R19 (Tool Ecosystem Dependency Classification)
- v8.9.0 carry C-xmllint-env-absent 종결

---

## [8.12.0] — 2026-05-23 MINOR — 5 PoC 18 risks string → object form 마이그레이션 (legacy carry 청산)

> v8.11.0 carry "C-legacy-risks-poc-migration" 종결. 사용자 결단 "ㄱㄱ" → "추천안 묶음 전체 시행" (2026-05-23 / D1~D7 7 cluster). 정보 손실 risk = **0** (실측 입증 / description 자유서술 그대로 보존 + severity enum 추가 metadata).

### 마이그레이션 — 5 PoC 18 items (string → object)

severity ★ prefix 자동 매핑:
- "★ ★ ★" prefix → critical (1건)
- "★ ★" prefix → high (1건)
- "★" prefix → medium (10건)
- prefix 부재 → low (6건)

type 추론 (description 안 키워드 기반):
- methodology — paradigm 본질 / 70~80% 한계 / 본체 격상 결단
- environment — 테스트 0 / in-memory store / 실 DB 부재 / chain harness 일부 dry-run
- legacy-corpus — Spring 4.1 + iBATIS 2 / SP 본문 비가시성 / sql-inventory 자동화율
- legacy-domain — IFRS 회계 / 다중책임 + SATD
- domain-expert-carry — ambiguous BR + AP 도메인 expert 결단 의무
- architecture-carry — cross-module 의존 / service boundary

| PoC | items | severity 분포 | 정보 보존 |
|---|---|---|---|
| poc-03 | 2 | low 1 + medium 1 | ✅ description 그대로 |
| poc-04-mini | 2 | low 1 + medium 1 | ✅ description 그대로 |
| poc-05 | 2 | low 1 + medium 1 | ✅ description 그대로 |
| poc-06 | 6 | low 1 + medium 5 | ✅ ★ prefix → severity / description 그대로 |
| poc-07 | 6 | low 1 + medium 3 + high 1 + critical 1 | ✅ ★★★/★★/★ → severity / description 그대로 |

### 검증 — 9 PoC 분포 (v8.12.0 완료 시점)

| PoC | string | object | 분류 |
|---|---|---|---|
| poc-03 | 0 | 2 | ✅ object form |
| poc-04-mini | 0 | 2 | ✅ object form |
| poc-05 | 0 | 2 | ✅ object form |
| poc-06 | 0 | 6 | ✅ object form |
| poc-07 | 0 | 6 | ✅ object form |
| poc-08 | 0 | 8 | ✅ object form (v8.10.0) |
| poc-09 | 0 | 4 | ✅ object form (v8.10.0) |
| poc-10 | 0 | 2 | ✅ object form (v8.10.0) |
| poc-11 | 0 | 14 | ✅ object form (v8.10.0) |

**string form = 0 (전 9 PoC)** / chain-coverage-validator `validateRisksForm` lane = 0 finding emit. legacy carry 완전 청산.

### 자산 갱신

- 5 PoC planning-spec.json risks_and_constraints array 마이그레이션 (string × 18 → object × 18 / 정보 보존)
- `plugin.json` 8.11.0 → 8.12.0 + `package.json` 8.11.0 → 8.12.0 (3-way sync)
- DEC-2026-05-23-legacy-risks-migration + INDEX 최상단 + STATUS session 35차

### 검증 — STOP-3 hard gate

- schema-validator 5 PoC (poc-03/04-mini/05/06/07) planning-spec.json **VALID** ✅
- chain-coverage-validator `validateRisksForm` string_count = 0 (9 PoC 전수) ✅
- release-readiness 15/16 ready (1 carry = xmllint env absent / 보존)
- 정보 손실 = 0 (description 자유서술 + ★ prefix → severity enum 정합)
- breaking 0 = MINOR (additive metadata 추가 — id + severity + type / description 보존)

### carry (다음 session)

- **C-xmllint-env-absent** (v8.9.0~v8.12.0 carry 보존) — Linux/Mac libxml2 환경 의무
- **C-operation-md-work-folder** (v8.9.0 carry 보존) — docs/ 흡수 후보

### 참고

- DEC-2026-05-23-legacy-risks-migration
- v8.11.0 carry C-legacy-risks-poc-migration 종결
- v8.10.0 polymorphic items + v8.11.0 forward warn lane + v8.12.0 legacy 청산 = paradigm 완결 cycle

---

## [8.11.0] — 2026-05-23 MINOR — chain-coverage-validator validateRisksForm lane (Senior REVISE-1 carry 종결)

> v8.10.0 carry "C-risks-string-form-warn-v811" 종결. v8.10.0 §3 D2 Senior REVISE-1 흡수 — chain-coverage-validator forward lane 신설로 silent omission 결정적 차단. additive only / breaking 0.

### 신규 자산

- **`validateRisksForm(planning)` 함수** (`tools/chain-coverage-validator/src/validator.js`)
  - 5번째 export function (validateChainCoverage + validateCrossRefPaths + validateAntipatternCoverage + validateConfidenceCoverage 다음)
  - risks_and_constraints items 안 string form 검출 시 `chain.planning.risks_string_form_warn` finding emit (severity: low)
  - 정보: `string_count` + `object_count` + `affected_indices` + `total_count`
  - message: "legacy carry 한정 (v8.10.0+ object form 권장) / severity 결정적 추출 가능 + drift attractor 차단 본질 / Senior REVISE-1 (DEC-2026-05-23-analysis-validator-poc06-11-resolve §4)"
- **CLI wire** (`src/cli.js`)
  - `validateRisksForm` import + `--json` output 안 `risks_form` 키 추가 + 사람-친화 출력 (`[risks-form] string=N / object=M / total=K`)
  - severity: low = blocking ❌ (warning만 / chain coverage gate 종결 차단 ❌)
- **test 4종 신설** (`test/validator.test.js`)
  - all-string form → low finding emit
  - all-object form → no finding (신규 paradigm 정합)
  - mixed string + object → low finding emit + count 정확
  - empty/missing field → graceful (no finding)

### 실측 PoC 분포 (v8.11.0 검출)

| PoC | string | object | 분류 |
|---|---|---|---|
| poc-03-realworld-nestjs | 2 | 0 | legacy carry |
| poc-04-mini-realworld-react | 2 | 0 | legacy carry |
| poc-05-sample-user-register | 2 | 0 | legacy carry |
| poc-06-efiweb-exchange-spring41 | 6 | 0 | legacy carry |
| poc-07-efiweb-capital-spring41 | 6 | 0 | legacy carry |
| poc-08-realworld-mybatis | 0 | 8 | object form ✅ |
| poc-09-realworld-typeorm-rawsql | 0 | 4 | object form ✅ |
| poc-10-realworld-jpa-querydsl | 0 | 2 | object form ✅ |
| poc-11-efiweb-billing-spring41 | 0 | 14 | object form ✅ (v8.10.0 정합) |

총 string=18 (5 PoC 영구 carry / legacy 산출물) / object=28 (4 PoC).

### 자산 갱신

- `plugin.json` 8.10.0 → 8.11.0 + `package.json` 8.10.0 → 8.11.0 (3-way sync)
- `chain-coverage-validator/package.json` 0.1.0 → 0.2.0 (workspace MINOR)
- DEC-2026-05-23-risks-string-form-warn + INDEX 최상단 + STATUS session 34차

### 검증 — STOP-3 hard gate

- chain-coverage-validator test **30/30 pass** ✅ (신규 4 + 기존 26)
- release-readiness 15/16 ready (1 carry 보존 — xmllint env absent)
- breaking 0 = MINOR (additive — validate function + CLI flag + test 4)

### carry (다음 session)

- **C-xmllint-env-absent** (v8.9.0+v8.10.0 carry 보존) — sql-inventory-validator iBATIS test #25+#26 / Linux/Mac libxml2 환경 의무
- **C-operation-md-work-folder** (v8.9.0 carry 보존) — work/dep-graph/operation.md git tracked 아님 / docs/ 흡수 후보
- **C-legacy-risks-poc-migration** (medium 신설) — string form 5 PoC (poc-03/04-mini/05/06/07) object form 마이그레이션 — 별도 session / 정보 손실 risk 평가 의무 / 사용자 결단

### 참고

- DEC-2026-05-23-risks-string-form-warn
- v8.10.0 §3 D2 Senior REVISE-1 carry 종결
- DEC-2026-05-23-analysis-validator-poc06-11-resolve §8 차기 session carry C-risks-string-form-warn-v811

---

## [8.10.0] — 2026-05-23 MINOR — planning-spec schema 진화 (5 enum + polymorphic risks + derivation_source 2 properties / 6 PoC analysis_validator carry 해소)

> v8.9.0 carry "C-analysis-validator-poc06-10-placeholder" 종결. 사용자 결단 "추천안 묶음 전체 시행 (Senior REVISE-1 포함)" (2026-05-23 / D1~D6 6건 묶음). Senior critique GO @ 0.87 + REVISE-1 (D2 severity required + $comment legacy-carry warning + chain-coverage-validator risks_string_form_warn lane v8.11.0 carry) 흡수.

### Schema 진화 (additive / breaking 0)

- **D2 — `risks_and_constraints` items polymorphic** (anyOf[string, object{id, severity, description, type?}])
  - 5 PoC 실측 흡수 (poc-08/09/10/11 객체 array + legacy string carry 양쪽)
  - `severity` required enum (`critical|high|medium|low`) — severity-cross-stage-mapping.md SSOT 정합
  - $comment "string 분기 = legacy carry 한정 / 신규 PoC = object 의무" 명시 (Senior REVISE-1)
- **D3 — `cross_links` 5 enum** (Senior 실측 보강 + poc-06 5번째 변종 발견 정합)
  - 기존 `to_analysis_artifacts` (보존)
  - 신규 `to_characterization` (analysis-characterization-test 정합 / poc-06/07/11)
  - 신규 `to_sql_inventory` (analysis-sql-inventory 정합 / poc-07/11)
  - 신규 `to_source` (source-grounded paradigm / poc-11)
  - 신규 `to_decisions` (planning 결단 trace / poc-06/07/11)
  - 신규 `to_phase7_findings` (Phase 4.7 ambiguous 영역 / poc-06)
  - `additionalProperties:false` 유지 = drift attractor 차단 본질 보존
- **D4 — `derivation_source` 2 properties** (DEC-2026-05-12-in-place-read-정책-채택 정합)
  - 신규 `source_handling` (string / in-place read paradigm)
  - 신규 `source_root_absolute` (string / source 절대경로)
  - poc-11 실측 정식 흡수

### PoC 정합

- **poc-06** (chain 1 only)
  - 7 use_cases `acceptance_criteria_refs` placeholder → `AC-EXCHANGE-PLACEHOLDER-001` ~ `AC-EXCHANGE-PLACEHOLDER-007` marker 정합 (chain 2 진입 시 진짜 AC ID 교체 의무)
  - `cross_links` naming canonical 정합 (`to_characterization_artifacts` → `to_characterization`, `to_carry_decisions` → `to_decisions`)
- **poc-11** (chain 2+)
  - `risks_and_constraints` dict (`{critical:[], high:[], medium:[], low:[]}`) → array of 14 objects (id+severity+type+description / severity 보존)

### 검증 — STOP-3 hard gate

- schema-validator 6 PoC planning-spec.json **VALID** ✅ (10+3+8+4+2+7 errors → 0)
- release-readiness `analysis_validator_violation` red → ✅ (v8.9.0 carry 종결)
- breaking 0 = MINOR (additive — schema 3 properties 진화 + PoC naming 정합 / 기존 의무 제거 0)

### carry (다음 session)

- **v8.11.0 carry — chain-coverage-validator `risks_string_form_warn` lane** (Senior REVISE-1 / risks_and_constraints string form = legacy carry 한정 명시 enforcement / 신규 PoC object form 권장)
- **xmllint env absent carry** (sql-inventory-validator iBATIS test #25+#26 / Linux/Mac libxml2 환경 의무 / v8.9.0 carry 보존)

### 참고

- DEC-2026-05-23-analysis-validator-poc06-11-resolve
- v8.9.0 carry C-analysis-validator-poc06-10-placeholder 종결

---

## [8.9.0] — 2026-05-23 MINOR — dep-graph P1~P4 (artifact dependency graph + impact analyzer + 2 validator + chain-driver/matrix-builder 통합)

> charter §5 P3 "Spec change impact analyzer" SHIPPED. 설계 SSOT = `work/dep-graph/operation.md` (8 결정 / 7 알고리즘). 사용자 결단 "추천안 묶음 전체 시행" (2026-05-23) — additive only / breaking 0 / 직전 commit `b9615d0` 의 명시 carry "다음 세션 release ceremony" 시행.

### 신규 자산 (additive / breaking 0)

- **schema 5 신설**: `artifact-graph-node.schema.json` + `artifact-graph-edge.schema.json` + `code-pointer.schema.json` + `discovery-output.schema.json` + `plan-spec.schema.json` (chain schema 6종 안 `code_pointers` optional 추가 — strict 의무 ❌)
- **validator 2 신설**: `graph-integrity-validator` (DFS cycle/orphan/unknown / 13 test) + `code-pointer-validator` (pointer coverage)
- **chain-driver 확장**: `impact-analyzer` (confidence-aware BFS) + `propagation-orderer` (topo sort) + `centrality` (PageRank-lite top-3 root) + `policy-evaluator` (propagation-policy schema-driven) + CLI `impact` / `navigate` / `query --graph` + `hooks-bridge evaluate_policy`
- **matrix-builder 확장**: `graph-synthesizer` (4-state machine: active/propose/drift/deprecated) + diff-view 렌더러
- **skill 신설**: `dep-graph-navigator` (`/dep-graph-navigator <node-id>` — BFS MUST/SHOULD/FYI + code_pointers + centrality)
- **hooks**: PostToolUse + SessionStart `graph-sync` 자동 호출
- **policies**: `propagation-policy.json` + `propagation-policy.schema.json` (4 change-tier × 4 chain-step + 4 anchor_type × 2 patch-kind)
- **release-readiness #15 + #16**: `graph_integrity` + `code_pointer_coverage` (strict default-on / PoC 백필 완료)
- **docs/dependency-graph.md** 운영 가이드 신설 + plugin-charter P3 SHIPPED 마킹

### 회귀 fix

- `tools/chain-driver/package.json` 에 `ajv ^8.17.1` + `ajv-formats ^3.0.1` dependency 등록 (test/policy-schema.test.js 안 ajv import 인데 미등록 = ERR_MODULE_NOT_FOUND regress / 본 release 안 동반 fix)

### 검증 — STOP-3 hard gate

- workspace 686/686 → 685/686 pass (1 fail = xmllint 환경 부재 / Windows / sql-inventory-validator iBATIS test #25+#26 = env absent carry 정당)
- release-readiness 14/16 → 15/16 ready (analysis_validator red 1 carry = poc-06~10 planning-spec placeholder / 본 작업 무관 기존 drift)
- breaking 0 = MINOR (additive — schema 5 + validator 2 + criterion 2 신설 / 기존 의무 제거 0)

### carry (다음 session)

- **analysis_validator red 6건** (poc-06~10 planning-spec.json schema invalid) — placeholder 카리 정리 별도 session
- **xmllint 환경 의존 carry** — Linux/Mac libxml2 환경 의무 (sql-inventory-validator iBATIS 2 test = env absent)

### 참고

- DEC-2026-05-23-dep-graph-p1-p4
- 직전 commit `b9615d0` (b9615d0425ba532468c58f9f169becab43f8c651) "feat(dep-graph): artifact dependency graph P1~P4"

---

## [8.8.2] — 2026-05-21 PATCH — mock detect chain-4 자동 호출 + inflation-lint rule pack 확장 (3 rule)

> v8.8.2 PATCH — v8.8.0 carry 2건 진행. 환경 의존 도구 (Stryker / textlint / PIT) carry 는 영구 scope-out (user memory `environment-dependent-tools-scope-out`).

### 변경 1 — mock detect chain-4 자동 호출 의무 강제 (Tier 1.1 / v8.8.0 → v8.8.2)

- v8.8.0 = `--detect-mock-impl=experimental` 의심 시 호출 (옵션)
- v8.8.2 = chain 4 종결 시 (test-impl-pass-validator 호출 마다) 자동 호출 의무
- `agents/implement-agent.md` 호출 절차 §4 갱신 — verify-test-pass 호출 시 `--detect-mock-impl=experimental --impl-dir <impl_root>` 자동 추가
- impl-spec.json `mock_detect` field 자동 채움 (mode + ratio + threshold + files_scanned + exceeded)
- exceeded=true 시 warning emit (chain blocking ❌ / experimental 정합 유지)
- mandatory 격상 (enforce mode default) = ≥ 2 PoC corroboration carry (v8.9+)

### 변경 2 — inflation-lint rule pack 확장 (3 신규 rule / Tier 3.1)

`tools/inflation-lint/src/cli.js` 확장:
- **claim_absoluteness** — 100% / 절대 / 반드시 / 완벽 / perfect / never / always / guaranteed 등 absoluteness claim ≥ 5 (default)
- **emoji_density** — ❌ ⚠️ ✅ ❗ ⭐ 🎉 🔥 ✨ 💯 status emoji 합 ≥ 15 (default)
- **korean_overemphasis** — 본질 / 진정 / 정직 / 결단 / 핵심 / 명확 / 강조 / 입증 어휘 ≥ 8 (default)

threshold override:
- `--absolute-threshold` / `--emoji-threshold` / `--overemphasis-threshold`

severity = warning only / chain blocking ❌ / scope = markdown text 만 / report semantics ❌

### 회귀

- inflation-lint 11/11 pass (7 baseline + 4 신규 v8.8.2 rule test)
- breaking 0 (신규 rule = 신규 finding kind / 기존 cli 호환)
- 환경 의존 도구 의존성 0 (pure-JS regex)

### v8.9+ carry (영구 carry)

- mock detect mandatory 격상 = ≥ 2 PoC corroboration (cycle-8+)
- 환경 의존 도구 (Stryker / textlint / PIT / osv-scanner) = 영구 scope-out (memory `environment-dependent-tools-scope-out`)

---

## [8.8.1] — 2026-05-21 PATCH — skill-citation pre-existing fail 해소 (tools/_shared/finding-log.js stale ref)

> v8.8.1 PATCH — v8.7+ 부터 carry 의 pre-existing fail 해소. `tools/_shared/finding-log.js` 가 ticket-policy.md + ticket-sync/SKILL.md 에서 인용되지만 실 파일 부재 (재구조화 drift). 본 PATCH 가 stale ref 정정.

### 변경

- `methodology-spec/ticket-policy.md:234` — `tools/_shared/finding-log.js (또는 skill 인라인)` → `_base-log-finding skill 또는 ticket-sync skill 인라인 (별 finding-log 도구 부재)` 로 정합 정정
- `skills/ticket-sync/SKILL.md:52` — `tools/_shared/finding-log.js 로 emit` → `_base-log-finding skill 호출 (또는 인라인 finding emit)` 로 정정. 별 도구 부재 명시.

### 회귀

- skill-citation-validator 2/2 pass (이전 1 fail = stale citation 재유입 → 해소)
- breaking 0 (단순 doc ref 정정)

### Carry

- 향후 cycle 에서 신규 stale ref 발생 시 skill-citation-validator 가 회귀 차단 (dogfood paradigm 유지)

---

## [8.8.0] — 2026-05-21 MINOR — cycle-7 dogfood 9 개선 cluster (chain 4 GREEN false signal 검출 + legacy rule pack + DDL Phantom 자동화 + inflation lint + carry resolution_kind + preflight fallback)

> v8.8.0 MINOR — cycle-7 (car / 2026-05-21) dogfood 가 표면화한 9 개선 batch. cycle-7 의 본질 발견 = chain 4 "GREEN" 이 in-memory fixture mock 통과 (car.service.ts:63 `prisma: unknown` + scenarioState module-level counter + hardcoded return fixture) / vitest pass=44 / line cov 92.59% 만족 / 진정 비즈니스 검증 0 / plugin `test-impl-pass-validator` ok=true 리턴 = false signal. 본 MINOR 가 가장 큰 ROI.

> branch: `v8.8.0-cycle7-evolution` (6 commit / breaking 0 / DEC: `DEC-2026-05-21-v8.8.0-cycle7-evolution.md`).

### 본질 발견 (cycle-7 dogfood)

- chain 4 GREEN false signal — in-memory fixture mock 통과 / 진정 비즈니스 검증 0
- legacy 발견 5건 grep+rg 수동 — plugin rule pack 부재 → 매 cycle 재발견 위험
- sub-agent 산출물 inflation 만연 — `★ ★ ★ ★ ★` 다발 / user memory `no-star-inflation` 영구 위반
- DDL cross-check 수동 — IFRS_split TB_CAR_* 6 매번 수동 검증
- carry 추적 정밀도 부재 — cycle-3 의 'redo' 의도 vs cycle-7 의 '신규 분석' resolution 차이 표기 부재
- preflight fallback 부재 — semgrep SSL 차단 / lizard / osv-scanner 미설치 매번 수동

### 신규 자산 (6 commit / Tier 별)

| commit | Tier | 변경 |
|---|---|---|
| C1 | 5.1 | `scripts/preflight-check.js` 확장 — fallback hint per-tool + analysis-opt 도구 4 (osv-scanner / lizard / ast-grep / xmllint) |
| C2 | 4.1 | `schemas/cycle-carry.schema.json` 신설 — `original_intent` + `resolution_kind` (intended/alternative/drift/pending) + allOf if/then status=completed 의무 |
| C3 | 2.1 | `tools/static-runner/rules/legacy-korean/` 신설 — 5 Semgrep rule (pii-realname / eclipse-todo-catch / jsp-scriptlet-raw / interceptor-no-rbac / sso-bypass) |
| C4 | 2.2 | `tools/sql-inventory-validator --ddl-dir` 신규 옵션 — Phantom 자동 검출 + cross-DB 자동 분류 |
| C5 | 1.1+1.2 | `tools/test-impl-pass-validator/src/mock-detect.js` (experimental opt-in / 6 heuristic / dual metric) + `schemas/impl-spec.schema.json` real_integration_axis optional field |
| C6 | 3.1+3.2 | `tools/inflation-lint/` 신설 + 5 sub-agent SKILL.md (analysis/planning/spec/test/implement) 정직 톤 + 보고 schema 의무 추가 |

### dogfood

- mock-detect on cycle-7 impl-output: score=5.23% / file=29.41% / 5 mock indicator file (prisma_unknown 4건 + scenarioState + fixture_builder)
- DDL cross-check on cycle-7 + IFRS_split 180 .sql: Phantom 3 검출 (TB_CAR_INFO / TB_CAR_USERTERM 오타 자동 발견)
- legacy-korean rule pack: 4/5 rule dogfood (eclipse-todo-catch 1 + pii-realname 7 + jsp-scriptlet 1 + sso-bypass 2)
- inflation-lint on cycle-7 CLOSURE.md: 21 warning (132 ★ + 18 long runs + inflation_phrases)

### 회귀 test

- sql-inventory-validator: 31/31 pass (27 baseline + 4 DDL test)
- schema-validator: 35/35 pass (29 baseline + 6 cycle-carry test)
- test-impl-pass-validator: 30/30 pass (25 baseline + 5 mock-detect test)
- inflation-lint: 7/7 pass (신규)
- breaking 0 (모든 신규 schema field optional / 모든 신규 옵션 flag opt-in)

### v8.9+ carry

- Tier 1.1 mock detect mandatory 격상 (cycle-8+ ≥2 PoC corroboration 후)
- Tier 1.2 real_integration_axis mandatory 격상
- Stryker mutation testing 통합 (Tier 6)
- Java 환경 mock detect (PIT/Pitest 통합)
- textlint plugin 통합 (사내 SSL 차단 영구 회피 후)

### LL (Lessons Learned)

- LL-V8.8-01 — sub-agent dogfood 의 가장 큰 가치 = scaffold pass 가 아니라 scaffold pass 의 본질 결함 (cycle-7 chain 4 mock fixture) 검출. plugin 진화의 가장 큰 ROI.
- LL-V8.8-02 — §8.1 의 ≥2 PoC corroboration 의무 시 single PoC 발견은 experimental opt-in flag 으로 reduction. mandatory 격상 = ≥2 PoC carry.
- LL-V8.8-03 — sub-agent 산출물 inflation 톤 (★ 다발) 은 user memory 위반 + 진정 가치 신호 약화. plugin lint rule 자산화.
- LL-V8.8-04 — vendored upstream subtree (`tools/semgrep-rules/`) 폴루션 ❌. 자체 rule = sibling dir (`tools/static-runner/rules/`) 활용.

---

## [8.7.4] — 2026-05-21 ★ ★ ★ PATCH — ticket-sync Sub-task Epic auto-inherit invariant + Structure 자동 등록 표준화 (R20 v4 amendment / breaking 0)

> ★ **v8.7.4 PATCH — R20 v4 amendment**. mis-fe-admin EAM-AUTH **verify-1 iter-6 cycle 종결** 결과 driver. 5 stage 일주 PASS / 106 ticket / Atlassian Structure 등록 15 row 진행 중 2 carry 식별:
> - **B14** — Stage 1 Sub-task 14건 (DWPD-1668~1681) 생성 시 `extra_fields.customfield_10006` 명시 시도 모두 400 reject. parent Story 의 Epic Link 가 Sub-task 에 native auto-inherit 됨이 본질. SKILL.md v8.7.3 본문 "Sub-task = parent_key" 표기가 약해 사용자/AI 가 dual binding 시도하는 path 가 열려 있었음. → invariant 명문화 + 위반 reject path.
> - **B15** — Stage 마다 사용자가 `jira_structure_add_issues` (DWP-Forge id=676) manual 호출. plugin 본문에 자동화 부재. 5 stage × 1 manual = 5 친화도 손실. → `structure_id` + `structure_auto_add_on_exit` 파라미터 신설 + 모든 phase=exit 자동 호출 표준화.

### 본질 발견 (mis-fe-admin EAM-AUTH verify-1 iter-6 / Stage 1~5 종결 / 47 MCP 호출 + manual Structure 호출 6회)

- **F-VERIFY-015 (★ B14 amended)** — Sub-task `jira_create` 후 `jira_update × 14` 로 customfield_10006 backfill 시도 모두 400 reject. evidence: `jira-trace.json` stage1_analysis.B14 sub_section. Jira native semantic = Sub-task 의 Epic Link 은 parent Story / Task 로부터 auto-inherit. dual binding 시도는 본질 위배.
- **B15 carry** — verify-1 iter-6 jira-trace.json stage1~5 모두 `atlassian_structure` 절에 manual 호출 evidence (version 1 → 6 / 총 106 row 등록). plugin 자동화로 가져오면 사용자 manual 부담 0.

### 시행 (1 commit / branch `v8.7.4-r20-subtask-autoinherit-structure-auto`)

1. **B14 SKILL.md §단계 5 prelude / parent linking resolve** — subtask 분기에 "`extra_fields[epic_link_customfield_id]` 명시 ❌. parent Story 로부터 auto-inherit" 명문화 (auto / epic_link_customfield 두 strategy 모두).
2. **B14 SKILL.md §금지/강제력** — v8.7.4+ Sub-task Epic Link customfield 명시 ❌ 항목 신설 + F-TICKETSYNC-011 subtask_epic_link_violation 신설.
3. **B14 SKILL.md §사용자 결단 8번** — Sub-task Epic auto-inherit invariant (DWPD `customfield_10006` 외 환경 동일).
4. **B14 SKILL.md §단계 5/5b 본문** — phase=exit planning + 5 verification stage 의 Sub-task `jira_create` step 에 B14 주석 추가 (extra_fields 명시 ❌).
5. **B15 SKILL.md §파라미터 표** — `structure_id` + `structure_auto_add_on_exit` 2 파라미터 신설.
6. **B15 SKILL.md §단계 5/5b 본문** — analysis/planning/implement standard 본문 + 5 verification stage 본문 모두 structure_add_issues 자동 호출 step 추가.
7. **B15 SKILL.md §사용자 결단 9번** — Structure 보드 자동 등록 (DWPD reference `structure_id=676`).
8. **DWPD 환경 reference config** — structure_id + structure_auto_add_on_exit 추가 / B14 주석.
9. **DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md** 신설 — v8.7.4 amendment ADR.
10. **3 SSOT bump** — plugin.json + package.json + CLAUDE.md 8.7.3 → 8.7.4.

### Q&A — 사용자 결단 매트릭스 누적 (v8.7.1 ~ v8.7.4)

| 결단 | 신설 cycle | 본질 |
|---|---|---|
| 1. Jira workflow transition target IDs | v8.6.1 R20 charter | project-specific |
| 2. Confluence emit 범위 | v8.6.1 R20 charter | per-stage Tier 2.6 carry |
| 3. Auto-invoke 정책 (chain-driver next stderr) | v8.7.2 verification | Stop hook 직접 등록 ❌ |
| 4. Idempotency | v8.6.1 R20 charter | search-first |
| 5. MCP 미연결 환경 | v8.6.1 R20 charter | silent skip + finding emit |
| 6. mode 선택 (standard / verification) | v8.7.2 verification | parent_epic 의무 (verification) |
| 7. environment bridge (4 단계 1회 setup) | v8.7.3 environment-bridge | issuetype_map + parent_strategy + epic_link_customfield_id |
| **8. Sub-task Epic auto-inherit invariant** | **v8.7.4 본 cycle** | **customfield 명시 ❌ / parent 의존** |
| **9. Structure 보드 자동 등록** | **v8.7.4 본 cycle** | **structure_id env-config / 모든 phase=exit 자동** |

### 정합 cross-ref

- ADR: `decisions/DEC-2026-05-21-r20-subtask-autoinherit-structure-auto.md`
- SKILL: `skills/ticket-sync/SKILL.md` (§파라미터 + §단계 5/5b + §금지 + §사용자 결단 + §DWPD config)
- Evidence: mis-fe-admin `.aimd/output/eam/authority/iter-6/jira-trace.json`
- Memory: [[project-plugin-verification-cycle-verify1]] § carry to next cycle (v8.7.4 PATCH 시 B14 + B15 반영)

---

## [8.7.3] — 2026-05-20 ★ ★ ★ PATCH — ticket-sync environment bridge (issuetype_map + parent_strategy + Pre-flight 정정) (R20 v3 amendment / breaking 0)

> ★ **v8.7.3 PATCH — R20 v3 amendment**. mis-fe-admin EAM-AUTH iter-6 verification cycle **Stage 1 실 진입** 결과 driver. v8.7.2 의 parent_epic + mode=verification 으로 Story 1 (DWPD-1667) + Sub-task 14 (DWPD-1668~1681) 실 생성 / Q4·Q5 PASS 달성한 진행 도중 발견한 6 finding (F-VERIFY-005 ~ F-VERIFY-010) 의 본질 = environment portability 결손. SKILL.md 의 Atlassian Cloud 표준 hardcode (issuetype "Story" / parent_key 단일 path / `.aimd/<scope>/state.json` / ListMcpResourcesTool probe / gate-pass 의무) 를 6축 environment-config 화. DEC-2026-05-20-r20-environment-bridge 신설.

### 본질 발견 (mis-fe-admin EAM-AUTH iter-6 Stage 1 실 진입 / 31 MCP 호출 evidence)

- **F-VERIFY-005** (★ B8) — SKILL.md §단계 1.1 `ListMcpResourcesTool` 호출이 resource-only probe. wiki-jira MCP server 가 resource 0 + tools 50+ deferred 등록 환경 (실 mis-fe-admin) 에서 false negative → silent skip + 잘못된 F-TICKETSYNC-001 emit 위험.
- **F-VERIFY-006** (★ B9) — SKILL.md §단계 1.2 `.aimd/<scope>/state.json` path 와 `chain-driver init` 의 실 산출 위치 `.aimd/state.json` (scope=current_scope 필드) drift. spec 강행 시 file-not-found → reject.
- **F-VERIFY-007** (★ B10) — SKILL.md §단계 1.4 산출물 list (planning/behavior/AC/test/impl-spec) 와 §단계 5b verification analysis 가 enumerate 하는 14 산출물 (inventory/architecture/domain/business-rules/antipatterns/state-map/...) 불일치. analysis 산출물 누락.
- **F-VERIFY-008** (★ B11) — SKILL.md §단계 1.2 "gate 미통과 시 reject" vs `mode=verification` meta-cycle 의 gate 부재 자연성 충돌. 본 verification cycle 의 state.json `last_gate=null` 정상 상태.
- **F-VERIFY-009** (★ ★ HIGH / B12) — SKILL.md §단계 5b issuetype="Story" hardcode. DWPD project (1565 issue 표본) "스토리" 0건 사용. 실 사용 = 작업/버그/하위 작업/개선/새 기능/epic. 우회 path: issue_type="작업" → DWPD-1667 생성 성공.
- **F-VERIFY-010** (★ ★ HIGH / B13) — SKILL.md §v8.6.3+ "parent_ticket_id 의무" vs DWPD 환경 일반 issue 의 `parent` 직접 매핑 ❌ → `customfield_10006` Epic Link 의무. 우회 path: `extra_fields={customfield_10006:DWPD-1442}` → DWPD-1667 생성 성공.

→ 6 finding 모두 본질 = plugin universal claim 보존하려면 SKILL.md 의 Atlassian Cloud 표준 hardcode 를 **role label + env-config substitute** 로 추상화 정합.

### 시행 (1 commit / branch `v8.7.3-r20-environment-bridge`)

1. **B12 `issuetype_map` 파라미터 추가** (`skills/ticket-sync/SKILL.md` §파라미터 7번) — role → name/id resolve table. role enum = `story` / `subtask` / `initiative` / `tech_debt` / `task` / `bug`. env-config (`.aimd/ticket-sync-config.yaml`) 또는 args 명시. default = Atlassian 표준 영문 명명.
2. **B13 `parent_strategy` + `epic_link_customfield_id` 파라미터 추가** (동상 §파라미터 8/9번) — `auto` (default) / `parent_key` / `epic_link_customfield`. role=subtask 는 항상 parent_key / 그 외 role 은 `parent_strategy` 결정. DWPD 환경 reference `customfield_10006`.
3. **§단계 5 prelude 신설** (env resolve algorithm) — role → name/id resolve + parent linking resolve + 호출 sequence 의무. standard mode + verification mode 본문 모두 적용. SKILL.md 본문 영문 명명을 role label 로 추상화 + 실 payload 는 resolve 결과 직접 인용.
4. **B8 §단계 1.1 정정** — MCP probe = tools-deferred-list 우선 + jira_search fallback / `ListMcpResourcesTool` 단독 의존 ❌.
5. **B9 §단계 1.2 정정** — state.json path = `.aimd/state.json` + `state.current_scope === <scope>` 매칭.
6. **B11 §단계 1.2 gate-pass 분기** — `mode=verification` 시 gate-pass check 우회 (gate=null OK).
7. **B10 §단계 1.4 stage 분기** — `stage=analysis` 시 14~16 산출물 명시.
8. **§금지 v8.7.3+ 절 2건 추가** — environment hardcode ❌ (F-TICKETSYNC-009) + parent_strategy 우회 ❌ (F-TICKETSYNC-010).
9. **§금지 v8.6.3+ orphan ticket 절 정정** — environment-aware (parent_strategy 별 분기).
10. **§사용자 결단 7번 신설** — environment bridge setup 4단계 (issuetype 분포 sample → config → parent_strategy → customfield_id).
11. **§Cross-link** — `decisions/DEC-2026-05-20-r20-environment-bridge.md` 등록.
12. **decisions/DEC-2026-05-20-r20-environment-bridge.md** 신설.
13. 3 SSOT version sync — `.claude-plugin/plugin.json` + `package.json` + `CLAUDE.md` 모두 `8.7.2` → `8.7.3`.

### v8.7.3 release 결과

- additive only / breaking 0 (standard + verification mode 본문 무변경 / 신규 args 3개 모두 default 가 v8.7.2 동치 행동)
- standard mode 호출자 (Atlassian Cloud 표준) 영향 0
- env-config 명시 사용자만 새 path (DWPD / 사내 Atlassian DC 등)
- mis-fe-admin EAM-AUTH iter-6 Stage 2 진입 가능 상태

### v8.7.3 가 풀지 않는 본질 (carry)

- **F-VERIFY-004 (Stop hook 부재)** — v8.7.2 의 B6 chain-driver next stderr 로 부분 완화. Stop hook 직접 등록은 noise 회피 carry.
- **B7 onboarding doc** — v8.7.4+ carry.
- **Confluence per-stage 보고서** — Tier 2.6 carry.
- **Trello/Linear/GitHub Issues adapter** — Tier 3 자체 adapter / v9.0+ carry.

---

## [8.7.2] — 2026-05-20 ★ ★ PATCH — ticket-sync verification mode + parent_epic override + chain-driver next stderr auto-suggest (R20 amendment / breaking 0)

> ★ **v8.7.2 PATCH — R20 amendment**. mis-fe-admin EAM-AUTH iter-6 verification cycle Stage 0 dry-run findings 4건 + 보강 candidate 6건 driver. ticket-sync 의 3축 본질 확장: (B3) `parent_epic` override + (B4) `mode=verification` 분기 + (B6) `chain-driver next` 안 ticket-sync auto-suggest stderr. Initiative 생성 권한 부재 환경 / plugin dogfood meta-cycle / 기존 Epic 재사용 시 사용. R20 confirmation gate / 7-field evidence / fire-and-forget ❌ 본질 보존.

### 본질 발견 (mis-fe-admin EAM-AUTH iter-6 verification cycle)

- 사용자가 plugin v8.7.0 의 5-stage chain harness + Jira 자동 연동을 검증 (Figma + Swagger input / parent epic = `DWPD-1442 [2026] AI TF`) 진입 시 4 finding:
  - **F-VERIFY-001**: ticket-sync 는 chain harness state-driven (`.aimd/state.json` + `traceability-matrix.json` 의무) — iter-1~5 가 `chain-driver init` 안 거쳐 state.json 부재 → ticket-sync 호출 reject path. ★ 본질 = chain-driver CLI 가 정식 entry point 인데 사용자가 그것을 모르고 skill 만 직접 호출. plugin 측 보강 = onboarding doc (별 carry).
  - **F-VERIFY-002**: ticket-sync standard flow hierarchy (Initiative + per-BC Epic + per-UC Story) ↔ 사용자 verification 의도 (parent_epic = DWPD-1442 하위 + per-stage Story 5) mismatch. 두 hierarchy 가 본질적으로 다름 (실 도메인 feature ≠ plugin dogfood).
  - **F-VERIFY-003** (예상): Initiative 생성 권한 부재 → standard flow analysis exit 첫 호출 시 jira_create(Initiative) 실패 예상 → 전체 batch abort.
  - **F-VERIFY-004**: `hooks/hooks.json` 에 Stop / PostToolUse hook 미등록 → SKILL.md 가 명시한 "chain stage 종료 동기로 호출" 의 실 auto-trigger 0건 (★ ★ 가설 H1 의 결정적 evidence — SKILL.md ↔ 실 hook 정합 부재).
- → standard mode 본문 유지 + verification mode 분기 신설 + chain-driver next 안 auto-suggest 통합 = 3축 amendment

### 시행 (1 commit / branch `v8.7.2-r20-verification-mode`)

1. **B3 `parent_epic` override 파라미터 추가** (`skills/ticket-sync/SKILL.md` §파라미터) — 명시 시 standard flow 의 Initiative 자동 생성 skip + 기존 Epic 하위 직접 매핑. `mode=verification` 시 의무.
2. **B4 `mode=verification` 메타 모드 추가** (동상 §파라미터 + §단계 5 헤더 + §단계 5b 신설) — per-stage Story 5 (analysis/planning/spec/test/implement 각 1) + 산출물·UC·AC·TC 별 Sub-task. plugin dogfood meta-cycle / verification 작업 전용. `parent_epic` 의무.
3. **§금지·강제력** — F-TICKETSYNC-003 (mode=verification + parent_epic 미명시 reject) + F-TICKETSYNC-004 (mode=standard + parent_epic 명시 시 hybrid info finding) 추가.
4. **§사용자 결단 6번** — mode 선택 결단 추가 / Auto-invoke 정책 갱신 (`chain-driver next` stderr / Stop hook 직접 등록 ❌).
5. **B6 chain-driver next 안 auto-suggest stderr** (`tools/chain-driver/src/cli.js` `cmdNext` line ~286) — stage 전이 직후 ticket-sync auto-suggest stderr 출력 (~10 LOC additive / stdout 무영향). Stop hook 직접 등록 ❌ — Stop event = 매 turn 종료마다 발화 = noise. 의도된 stage 전이 시점 (chain-driver next 호출 후) 에만 발화 = 정합.
6. **decision record 신설** — `decisions/DEC-2026-05-20-r20-verification-mode.md` (R20 amendment / 4 finding driver / 3축 변경 / Tier sub-axis 확장 / 정합 관계).
7. **SSOT 일치** — `.claude-plugin/plugin.json` 8.7.0 → 8.7.2 / `package.json` 8.7.1 → 8.7.2 / `CLAUDE.md` line 99 v8.7.0 → v8.7.2.

### 검증

- SKILL.md standard mode 본문 무변경 — diff = §파라미터 표 신규 2행 + §단계 5 헤더 분기 안내 + §단계 5b 신설 + §금지 신규 2건 + §사용자 결단 6번 + §Cross-link 1줄
- mode=verification 본문 5 phase (analysis/planning/spec/test/implement) parent_ticket_id 의무 + structure_complete=true 의무 + verification_mode=true 표식 + verification_story_ids map 정합
- chain-driver next stderr 출력은 stdout 무영향 (JSON output 정합 보존)
- R20 confirmation gate / 7-field evidence / fire-and-forget ❌ / Sequential MCP / search-first idempotency 전부 보존
- breaking 0 — standard mode 호출자는 영향 없음 (mode default = standard / parent_epic optional)

### dogfood 효과

- mis-fe-admin EAM-AUTH iter-6 verification cycle 의 Stage 1~5 가 본 v8.7.2 patched plugin 으로 진입 가능 — `ticket-sync stage=analysis phase=exit mode=verification parent_epic=DWPD-1442` 호출 자연 fit
- plugin self-verification meta-cycle 의 hierarchy 가 표준화 — 본 release 이후 plugin dogfood 작업 모두 `mode=verification` 사용 권고
- F-VERIFY-001~004 finding 4건 → 해소 path 명확: B1/B2 = chain-driver init onboarding (별 carry) / B3+B4 = mode + parent_epic (본 release) / B6 = stderr auto-suggest (본 release)

### Pre-existing fail (★ v8.7.1 baseline 동등 / 본 PATCH scope 외 / v8.7.3+ carry)

- `analysis_validator_violation` — 6 PoC example (poc-06/07/08/09/10/11) 의 planning-spec.json schema invalid (★ v8.7.0 baseline 부터 inherited / v8.7.1 release 시점 동일 상태)
- `workspace_test_pass` + `skill_citation_integrity` — `methodology-spec/ticket-policy.md:234` 의 `tools/_shared/finding-log.js` stale citation (실 file 부재 — finding emit path 가 skill 인라인 + `finding-system.md` 통합 path 로 진화됐는데 ticket-policy 인용 미갱신 / 1 file 1줄 갱신으로 해소 가능 / 본 PATCH 무관 / v8.7.3+ carry)
- release:check = 11/14 pass (3 fail = 위 inherited / 본 PATCH 회귀 0건)

### dependencies / migration

- `_shared/` 변경 없음 / schema 변경 없음 (단 ticket_ref 의 `verification_mode` boolean + `verification_story_ids` map field 추가는 v8.7.3+ 후속 carry) / cli flag 변경 없음 / data file 변경 없음
- 옛 호출자 break 0 (mode default = standard / parent_epic optional / opt-in)
- 후속 R15 차단 의무 영역 (Layer 3 evidence-dir) 변경 없음
- v8.7.3+ carry: ticket-sync-evidence schema 에 verification_mode field 추가 / traceability-matrix.schema 에 verification_mode + verification_story_ids 추가 / 사용자 onboarding doc (`chain-driver init` 진입 안내) 강화 / ticket-policy.md:234 stale citation 1줄 fix

---

## [8.7.1] — 2026-05-19 ★ PATCH — sql-inventory-validator xmllint XPath 에 iBATIS 2 `//procedure` tag 추가 (F-CYCLE4-001 fix / boundary service 대응 / breaking 0)

> ★ **v8.7.1 PATCH — F-CYCLE4-001 fix**. cycle-4 dogfood (poc-efi-web-1 / rbac scope) 의 정직 발견: rbac.xml 류 stored-procedure-only mapper (iBATIS 2 `<procedure>` tag 만 사용) 가 sql-inventory-validator Layer 2 cross-check 에서 xmllint_total=0 으로 측정 → `zero_xmllint_count` medium finding 오탐. XPath 가 `select | insert | update | delete` 4 tag 만 cover → `procedure` 누락.

### 본질 발견 (cycle-4 dogfood)

- cycle-4 분석 대상: poc-efi-web-1 의 `rbac` 도메인 (boundary service / 외부 MDI DB stored procedure wrapper)
- rbac.xml = 3 `<procedure>` 만 정의 (rbac 인증/메뉴/권한 조회용 stored procedure 호출)
- v8.7.0 까지: xmllint XPath = `count(//select) + count(//insert) + count(//update) + count(//delete)` → rbac.xml count=0 → `zero_xmllint_count` medium finding (오탐 — 실은 3 SQL 정확 존재)
- ★ 본질: iBATIS 2 의 `<procedure>` tag 가 표준 SQL 호출 tag 중 누락 — `select|insert|update|delete` 외 `procedure` 도 의무

### 시행 (1 commit / branch `v8.7.1-xpath-procedure-fix`)

1. **XPath fix** (`validator.js:432`) — `count(//procedure)` 추가. 이전: 4 tag 합산 / 이후: 5 tag 합산 (select + insert + update + delete + procedure).
2. **finding message 갱신** (`validator.js:376`) — `zero_xmllint_count` message 의 "no select/insert/update/delete tags" → "no select/insert/update/delete/procedure tags".
3. **cli.js help 문구 갱신** (line 56) — XPath 표기 정정.
4. **test 신규 3건** (`test/validator.test.js`):
   - "★ v8.7.1 — iBATIS 2 `<procedure>` only mapper xmllint_total > 0 (F-CYCLE4-001 fix / rbac.xml 형식)" — fixture `legacy-xml-ibatis2-procedure/rbac-like.xml` (3 procedure) / 기대 xmllint_total=3.
   - "★ v8.7.1 — select/insert/update/delete/procedure 혼합 mapper xmllint_total 정확 합산" — fixture `legacy-xml-mixed-stmt-proc/mixed-mapper.xml` (5 stmt) / 기대 xmllint_total=5.
   - "★ v8.7.1 — zero_xmllint_count message 갱신 (procedure tag 언급)" — source grep 회귀 보장.
5. **fixture 신규 2개** — `legacy-xml-ibatis2-procedure/` + `legacy-xml-mixed-stmt-proc/`.
6. **package.json version bump** — `0.2.0` → `0.2.1`.

### 검증

- sql-inventory-validator 27 tests pass / 0 fail (★ v8.7.1 신규 3 / 24 기존 정합 — 회귀 0)
- xmllint 직접 검증: rbac-like.xml = 3, mixed-mapper.xml = 5 (예상치 일치)
- breaking 0 — 옛 4 tag 호출자는 영향 없음 (procedure tag 가 누락된 mapper 만 추가 count)

### dogfood 효과

- cycle-4 의 sql-inventory.json (rbac 3 procedure) 가 plugin v8.7.1 의 Layer 2 cross-check 통과 가능 — xmllint_total=3 vs inventory_count=3 → mismatch 0% (정합)
- F-CYCLE4-001 medium finding 해소 (v8.7.0 까지의 plugin XPath 결함)

### dependencies / migration

- `_shared/` 변경 없음 / schema 변경 없음 / cli flag 변경 없음 / data file 변경 없음
- 옛 호출자 break 0 (XPath 만 +1 tag, 옛 count 결과 ≤ 새 count 결과)
- 후속 R15 차단 의무 영역 (Layer 3 evidence-dir) 변경 없음

---

## [8.7.0] — 2026-05-19 ★ MINOR — R15 silent enabler fix (sql-inventory-validator Layer 1~4 + characterization-coverage-validator Layer 3 mirror + _shared/evidence-cross-check.js refactor + bin alias 양쪽 보존 rename) (additive / breaking 0)

> ★ ★ **v8.7.0 MINOR — R15 silent enabler 4 layer fix**. cycle-3 dogfood (poc-efi-web-1) 의 **F-CYCLE3-005** R15 violation 정량 evidence 발견 → plugin 17 validator 중 2 도구 (sql-inventory-extractor + characterization-coverage-validator) 가 `_shared/baseline.js` 공유 = **R15 silent enabler 공범** 확정 → 본 release = **4 layer fix + 정직 명칭 채택 + duplication 청산**.

### 본질 발견 (cycle-3 dogfood)

- `sql-inventory-extractor` plugin validator 가 `findings=0` 통과 → 실 legacy XML 21 SQL vs AI hypothesis sql-inventory.json 7 SQL (★ 67% miss) silent pass
- `extraction_automation.auto_ratio_external_6 = 0.5` 도 AI 자기 보고 (실 외부 도구 invocation 0회 / shell exit log 부재)
- 명칭 fraud — `extractor` 이름 / 실 동작 = `validator` (README L1 자기 시인)
- 본 pattern = ★ ★ 17 validator audit 결과 ★ 2 도구 한정 (sql-inventory-extractor + characterization-coverage-validator / `_shared/baseline.js` 공유 = silent enabler 공범 heuristic)

### 시행 (6 commit cluster / branch `v8.7-r15-silent-enabler-fix`)

1. **Fix #2 Layer 2+4** (`0c53801`) — sql-inventory-extractor `--legacy-xml-dir <dir>` 옵션 + xmllint XPath count vs `inventory_count` cross-check. mismatch ≥ 30% high finding / ≥ 70% critical finding. xmllint 부재 시 medium finding + graceful skip. README scope 정정 (no-simulation 정합 scope 한계 명시).
2. **Fix #3 partial defense 격상** (`3f609f0`) — characterization-coverage-validator `snapshot.code_only_carry_recommended` (medium) → `snapshot.code_only_carry_required` (high) 격상. data_source_status='code_only' snapshot = AI hypothesis 가능성 / 도메인 expert 검증 의무.
3. **Fix #2 Layer 3** (`86bc271`) — sql-inventory-extractor `--evidence-dir <dir>` 옵션 + JSON Lines evidence file schema (`{ tool, version, args, target, timestamp, duration_ms, exit_code, ... }`) + unique `tool` field count 와 `auto_ratio_external_6` N claim cross-check. mismatch 시 critical finding (R15 silent simulation 의심).
4. **Fix #3 Layer 3 mirror** (`ed84f3e`) — characterization-coverage-validator `--evidence-dir` 동일 pattern. claim source = `data_source_status` ∈ {real_db, real_environment, domain_expert_interview} 명시 snapshot count. real-source claim 0 시 medium finding `claim_empty`.
5. **`_shared/evidence-cross-check.js` refactor** (`d020000`) — Fix #2 + Fix #3 Layer 3 helper duplication (95% 동일 코드) 통합 → `_shared/` 로 추출. 각 도구의 claim 계산 (parseClaimedAutoCount / countRealSourceSnapshots) 만 도구별 보존. net -87 LOC.
6. **Task #84 rename** (`7ac6fe7`) — `sql-inventory-extractor` → `sql-inventory-validator` (명칭 fraud 정직 해소). 디렉토리 + test file git mv (file history 보존). **bin alias 양쪽 보존** (`sql-inventory-validator` + `sql-inventory-extractor` 모두 cli.js 매핑) → ★ 옛 호출자 break 0. live source 15 file 갱신 (workspace + characterization mirror 참조 + skill + workflow + flows + finding-system evidence). historical doc 보존 (decisions/ + docs/adr/ + briefing/ + examples/ + dist/ — skill-citation-validator history-summary 제외 list 정합).

### 검증

- sql-inventory-validator 24 tests pass / 0 fail (★ Layer 2 + Layer 3 test 6 신규 / 18 기존 정합)
- characterization-coverage-validator 20 tests pass / 0 fail (★ Layer 3 mirror test 4 신규 + code_only 격상 test 2 신규 / 14 기존 정합)
- workspace test 439/440 pass (★ skill-citation-validator 1 fail = pre-existing `tools/_shared/finding-log.js` stale citation in `ticket-policy.md:234` / 본 PATCH 무관 / v8.6.3 baseline 동등)
- 본 PATCH 추가 stale citation = 0 (finding-system.md F-MB record evidence path 갱신 효과)
- bin alias verify (양쪽 명 cli.js 매핑)
- cli --help 출력 verify (sql-inventory-validator 명 정합)

### Pre-existing fail (★ v8.6.3 baseline 동등 / 본 PATCH scope 외 / v8.7+ carry)

- `analysis_validator_violation` — 6 PoC example 의 planning-spec.json schema invalid
- `claude_md_version_sync` — ★ ★ ★ ★ 본 release 에서 ★ ★ 해소 (CLAUDE.md line 99 "plugin.json v8.6.0" → "v8.7.0" + plugin.json + package.json 3 SSOT 일치)
- `workspace_test_pass` + `skill_citation_integrity` — `methodology-spec/ticket-policy.md:234` 의 `tools/_shared/finding-log.js` stale citation (1 file 갱신으로 해소 가능 / 별 commit / 본 PATCH 무관)

### Charter / heuristic 자산화

- **heuristic**: `_shared/baseline.js` 공유 도구 = ★ R15 silent enabler 의심. 미래 plugin contributor 의무 (CONTRIBUTING.md carry).
- **plugin validator pass = `evidence_trust = schema_valid`** (★ NOT `real_tool`). 실 외부 도구 invocation + cross-check 후만 `evidence_trust = real_tool` 정합.
- **R15 4 layer 정합 (필수 시행)**: Layer 1 명칭 정직 / Layer 2 legacy source cross-check (e.g. xmllint) / Layer 3 evidence cross-check (`--evidence-dir` *.jsonl) / Layer 4 README scope 정정.

### Carry (v8.7+)

- `--test-coverage-report <path>` 옵션 — characterization-coverage-validator 의 더 본격 R15 full 차단 (실 test runner vitest/jest/pytest coverage report cross-check)
- pre-existing skill-citation fail 해소 (`tools/_shared/finding-log.js` reference 갱신 또는 finding-log.js 신설)
- 6 PoC example planning-spec.json schema 갱신 (★ analysis_validator_violation 해소 / 작업량 큼)
- plugin contributor R15 heuristic 자산화 (CONTRIBUTING.md / plugin-authoring-spec patch)

### MINOR rationale

- ★ ★ additive — `--evidence-dir` 옵션 신설 + bin alias 양쪽 보존 + Layer 3 helper `_shared/` 추출 / 기존 의무 제거 0 / 기존 호출자 break 0
- 본 release 의 가장 큰 ★ ★ semantic change = ★ ★ ★ `evidence_trust` 의 plugin validator scope 정확 정의 (schema_valid vs real_tool) → MINOR 격상 (단순 PATCH 이상)

### Evidence

- `poc-efi-web-1/cycle-3/verification/F-CYCLE3-005-r15-violation-quantitative-evidence.md` (★ 원본 finding + LL-CYCLE3-13~16)
- branch `v8.7-r15-silent-enabler-fix` commits `0c53801`·`3f609f0`·`86bc271`·`ed84f3e`·`d020000`·`7ac6fe7`

DEC-2026-05-19-v8.7-r15-silent-enabler-fix. 직전 release 요약 (역순):

## [8.6.3] — 2026-05-18 ★ PATCH — R20 구조 강제 (parent_ticket_id schema + link_type enum + jira_structure_add_issues 통합 + F-TICKETSYNC-002 missing_parent finding) (additive / breaking 0)

> ★ **v8.6.3 PATCH — R20 hierarchy enforcement**. 사용자 "**티켓은 스트럭쳐를 가져야 함**" → v8.6.2 까지 R20 의 parent 명시 = `ticket-policy.md` §Layer mapping 표 + `SKILL.md` MCP call matrix text 뿐 / schema-level 강제 부재 + Atlassian Structure plugin (`jira_structure_*`) 미사용. 본 release = **4 layer 동시 강제** (policy + schema + skill + finding emit).
>
> ### 결단 — Sub-agent 부재 (★ 명시)
>
> 사용자 질의 "티켓 관리자 에이전트가 있어야 되는 거 아냐?" — 불필요 결단. confirmation gate sub-agent 호환 ❌ + 결정론 axis 침범 위험 + YAGNI. v9.0+ MAJOR carry — `ticket-platform-router` (multi-platform abstraction) / `ticket-reconciler` (자동 idempotency loop).
>
> ### 신규 자산 (v8.6.3)
>
> - **`schemas/ticket-sync-evidence.schema.json`** — `mcp_invocations[].parent_ticket_id` (optional / 정책 의무) + `link_type` (enum `parent-child` / `relates-to` / `blocks` / `is-blocked-by` / default `parent-child`)
> - **`schemas/traceability-matrix.schema.json`** — `ticket_ref.structure_complete` boolean + `structure_tree_url` (format=uri) + `epic_id` / `initiative_id` minLength 1 + description v8.6.3+ 의무 명시
> - **`skills/ticket-sync/SKILL.md`** — `mcp__wiki-jira-assistant__jira_structure_add_issues` + `jira_structure_get` allowed-tools 추가 + phase=exit analysis 끝 step #5 jira_structure_add_issues (Initiative tree) + planning step 1-6 parent_ticket_id= 명시
> - **`methodology-spec/ticket-policy.md`** — §Tier 2.5 "★ Hierarchy 의무 (v8.6.3+ 구조 강제)" subsection 추가 (4 layer 동시 강제 / parent 의무 매트릭스 / F-TICKETSYNC-002 finding 정의)
>
> ### car 도메인 ticket 수 영향
>
> v8.6.2 = 82 ticket / **v8.6.3 = 82 ticket 동일** (hierarchy 강제 = 메타 강제만 / ticket 폭증 ❌) + `jira_structure_add_issues` 1회 호출 (Initiative tree / per release cycle).
>
> ### 회귀
>
> - schema-validator: 89 → **95/95 pass** (+6 v8.6.3 hierarchy test — parent_ticket_id Story→Epic + Sub-task→Story + link_type enum reject + link_type=relates-to valid + structure_complete valid + structure_tree_url uri reject)
> - chain-driver hooks-bridge: 15/15 유지
> - 기존 ticket-sync evidence / traceability matrix sample 영향 0 (parent_ticket_id / link_type / structure_complete / structure_tree_url 모두 optional schema-side)
> - backward compat = default link_type=parent-child (기존 R20 호출 무영향)
>
> ### Lessons Learned (v8.6.3)
>
> - **LL-R20-03**: ticket 구조 강제 = (1) policy 문서 (2) schema field (3) skill MCP call (4) finding emit **4 layer 동시** 의무 — 중 어느 하나만 빠지면 결정론 axis 침범
> - **LL-R20-04**: ticket-manager sub-agent 도입 결단 = confirmation gate 호환성 / 결정론 axis 두 axis 동시 통과 의무 — v9.0+ MAJOR charter review 시점 (confirmation 완화 결단 + multi-platform 결단 함께)
>
> ### 결단 출처
>
> - DEC-2026-05-18-r20-mcp-ticket-sync-channel §v8.6.3 PATCH 확장 section (B/C 대안 비교 + 신규 자산 + Lessons Learned)

---

## [8.6.2] — 2026-05-18 ★ PATCH — R20 phase=enter 확장 (stage 진입 시 의무 작업 Task 1개 / analysis-planning = 도메인 단위 / spec-test-implement = per UC 단위) + enter Task 자동 종결 (phase=exit 시) + traceability-matrix `enter_task_ids` (additive / breaking 0)

> ★ **v8.6.2 PATCH — R20 phase=enter 확장**. 사용자 "단지 티켓 따는것 뿐아니라 각 단계에서 일감을 따는 부분도 필요하다" → R20 channel 안에 stage **진입 시점** 동작 추가 (R20 기존 = 종료 시점만 / phase=exit). 의도 = "오늘 무엇 할지 Jira dashboard 만 봐도 가시화".
>
> 본 release = R20 channel 의 phase × stage matrix 확장 — **phase=enter (stage 진입 시 의무 작업 Task 1개)** + **phase=exit (기존 결과 batch + enter Task 자동 종결)**. default phase=exit (backward compat).
>
> ### 신규 자산 (v8.6.2)
>
> - **`schemas/ticket-sync-evidence.schema.json`** — `phase` enum (enter/exit) optional + `uc_id` pattern (phase=enter + stage ∈ spec/test/implement 시 의무)
> - **`schemas/traceability-matrix.schema.json`** — `ticket_ref.enter_task_ids` optional (analysis/planning/spec/test/implement 별 enter Task id)
> - **`skills/ticket-sync/SKILL.md`** — `phase` / `uc_id` / `issuetype_enter` 파라미터 추가 + phase=enter MCP call matrix (5 stage) + phase=exit 에서 enter Task 자동 종결 path
> - **`methodology-spec/ticket-policy.md`** — §Tier 2.5 자동화 행동 = phase × stage matrix 재작성 + car 도메인 ticket 수 예시 (R20 기존 59 → R20 + A 확장 82)
>
> ### 회귀
>
> - schema-validator: 83 → **89/89 pass** (+6 phase=enter test — analysis/spec valid + uc_id pattern + phase enum + enter_task_ids valid + unknown key reject)
> - chain-driver hooks-bridge: 15/15 유지
> - 기존 ticket-sync evidence / traceability matrix sample 영향 0 (모든 신규 field optional)
> - backward compat = default phase=exit (기존 R20 호출 무영향)
>
> ### 대안 비교 (B/C 결단 외)
>
> | 옵션 | 채택 | 사유 |
> |---|---|---|
> | **A. phase=enter stage 진입 시 의무 작업 Task ★** | ✅ | 충돌 0 / ticket 폭증 ❌ / Jira dashboard 가시화 |
> | B. continuous emit (UC 1개당 즉시 Story) | ❌ | 결정론 axis 침범 + plugin TaskCreate 와 중복 + confirmation 과다 |
> | C. BHV/AC/TC/IMPL 별 ticket | ❌ | ticket-policy.md §6 결단 위반 + 폭증 + artifact/process 영역 혼합 |
>
> ### car 도메인 ticket 수 (예시)
>
> - R20 기존 (59) = 1 Initiative + 23 Epic + 7 Story + 28 Sub-task
> - **A 확장 추가 (+23) = +2 (analysis/planning 도메인 단위) + +21 (spec/test/implement × 7 UC)**
> - 합계 = **82 ticket** (car 도메인 7 UC 완주 시)

---

## [8.6.1] — 2026-05-18 ★ MINOR — charter R20 신설 (MCP Ticket Sync Channel / Tier 2.5 — MCP delegation only / R16·R17 부활 ❌ — 신규 채널) + `ticket-sync` skill + 7-field evidence schema + `traceability-matrix.ticket_ref.status_history` + PreToolUse `mcp__wiki-jira-assistant__.*` deny-when-blocked (additive)

> ★ **v8.6.1 MINOR — R20 신설 (MCP Ticket Sync Channel)**. 사용자 "내가 만약에 티켓을 우리 일감과 연동한다고 할때 티켓은 어느시점에 따지는게 맞나? 아니면 각 시점 마다 별도로 따는게 맞나?" (Tier 1 정책 v8.6.0+ 04bd0a1) → "지금 이 티켓 정책도 우리 플러그인의 정책으로 넣을 수 있나?" → "각 단계가 끝날때 마다 상태가 바뀌도 하고 신규 티켓이 생기기도 해야 해 거기에 맞는 방법이야?" → "나는 jira-confluence mcp 가 있고 이를 이용하고 싶어. 결국 뭔가 동작전에 물어보면 되는거 아닌가?" 결단.
>
> 본 release = charter R20 신설 — **Tier 2.5 (MCP delegation)**. R16/R17 부활 ❌ (DEC-2026-05-15-g1-itsm-permanent-scope-out §31 path "별도 charter 요구 신설 (R18+) — R16/R17 부활 ❌" 정합 = 신규 채널 R20). Tier 3 (자체 platform adapter) = v9.0+ carry.
>
> ### 신규 자산
>
> - **`decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md`** — R20 신설 결단 + 비용/가치 재평가 (MCP 위임 비용 매우 작음) + Tier 분리 (Tier 2.5 vs Tier 3) + R15 / R16/R17 정합 점검
> - **`schemas/ticket-sync-evidence.schema.json`** — 7-field evidence (`tool_stdout_path` / `tool_stderr_path` / `tool_version` / `invocation_timestamp` / `duration_ms` / `result_hash` / `reproduction_command`) + `evidence_trust` enum `real_tool|imported_sarif` (simulated 영구 거부) + `confirmation_log_ref` + `mcp_invocations[]`
> - **`skills/ticket-sync/SKILL.md`** — 5 stage matrix (analysis/planning/spec/test/implement) + 사용자 confirmation gate (preview MD → yes/no/dry-run halt) + sequential MCP 호출 (결정론 보호) + search-first idempotency (`jira_search` JQL by UC-*) + graceful MCP-missing (silent skip + `F-TICKETSYNC-001` finding)
> - **`tools/schema-validator/test/ticket-sync-evidence.test.js`** — 회귀 test ≥6 (status_history monotonic / evidence_trust enum strict / dry_run vs real_tool 분리)
> - **`schemas/traceability-matrix.schema.json`** `matrix.items.ticket_ref.status_history[]` optional 신설 (transitioned_at / from_status / to_status / mcp_tool / evidence_ref)
> - **`hooks/hooks.json`** PreToolUse matcher 에 `mcp__wiki-jira-assistant__.*` 추가 (state.blocked 시 MCP deny / `tools/chain-driver/src/hooks-bridge.js::buildBlockOutput` 재사용)
> - **`methodology-spec/plugin-charter.md`** §1 R20 entry / §2 R20 매핑 / 요약 17/17 → 18/18 활성 / 헤더 R20 v8.6.1 신설
> - **`methodology-spec/ticket-policy.md`** Tier 2.5 (MCP delegation) section 신설 / R20 reference / Tier 3 carry 명시
> - **`methodology-spec/id-conventions.md`** §Ticket Binding — status_history example 추가
>
> ### 사용자 결단 5건 (실 사용 시점)
>
> 1. Jira workflow transition target IDs (project-specific / `jira_transitions` 사전 lookup)
> 2. Confluence emit 범위 (Initiative overview default v8.6.1 / per-stage 보고서 page = v8.7.0+ Tier 2.6 후보)
> 3. Auto-invoke 정책 — auto-suggest (confirmation gated) ★ 권고
> 4. Idempotency — search-first ★ 권고
> 5. MCP 미연결 — silent skip + finding emit ★ 권고
>
> ### 사용자 묶음 결단
>
> - 자동화 강도 = **B+A hybrid → MCP 위임으로 변경 (Tier 2.5)** — 비용 (자체 adapter) 회피 + 사용자 환경 MCP 활용
> - Platform = `mcp__wiki-jira-assistant__*` 가정 (사용자 보유 MCP)
> - Confirmation = 모든 호출 직전 사용자 OK 의무

---

## [8.6.0] — 2026-05-18 ★ MINOR — Runtime/JVM 의존 도구 plugin 환경 제외 + charter R19 신설 + SARIF import 4 조건 schema-level 강제 + evidence_trust 3-tier + chain-strict mode 격상 (additive)

> ★ **v8.6.0 MINOR — R19 신설 (Tool Ecosystem Dependency Classification)**. 사용자 "코드 분석에서 런타임 분석이 필요한 툴들은 안쓸거야" → "java runtime 이 필요한것도 못쓸거 같은데?" → "이렇게 해줘" 결단 + Senior STRONG-STOP signal 전면 흡수 (5 concerns / confidence 0.84).
>
> 본 release = charter R19 신설 — **Tier 1 (in-plugin native: Semgrep / Spectral) + Tier 2 (사용자 환경 SARIF import: PMD Java 8 or above / SpotBugs JRE 11+ / CodeQL / Daikon) + Tier 3 (simulated 영구 reject)**. 4 조건 schema-level 강제 (driver allowlist + non-empty results 또는 non_use_rationale + reproduction_command + evidence_trust enum).
>
> ### 신규 자산
>
> - **`tools/static-runner/src/runner.js` `importSarif` 함수** — R19 Tier 2 흡수 / 4 조건 schema-level reject (`ImportSarifRejected` 신규 error class / driver allowlist `[pmd, spotbugs, codeql, daikon]` / empty results without rationale reject / driver mismatch reject / reproduction_command 의무)
> - **`tools/static-runner/src/cli.js`** `--import-sarif` / `--import-driver` / `--reproduction-command` / `--non-use-rationale` flag + exit 4 (`ImportSarifRejected`) 신설
> - **`EVIDENCE_TRUST` enum** — `real_tool` / `imported_sarif` / `simulated` 3-tier
> - **`IMPORTED_DRIVER_ALLOWLIST`** — PMD/SpotBugs/CodeQL/Daikon 4 한정 (대소문자 무관)
> - **`tools/chain-driver/src/gate-eval.js`** implement stage `simulated_evidence_count > 0` block 신규 (chain-strict mode 격상)
> - **charter R19 신설** (`methodology-spec/plugin-charter.md` §1 + §2)
> - **11 신규 import-sarif test** (`tools/static-runner/test/runner.test.js` 15→26)
>
> ### 정정 / sweep
>
> - **PMDPlugin in-plugin 제거** (Java 8 or above JVM 의존 / plugin 환경 비현실)
> - **`tools/static-runner/package.json` description** — R19 Tier 1+2 명시 / 7 evidence + evidence_trust 3-tier
> - **`tools/static-runner/README.md`** 전면 개정 (Tier 1/2/3 + 4 조건 + exit code 4 + custom rule)
> - **agents 4 sweep** — analysis-agent / implement-agent (line 33+58) / spec-agent / _base-senior-engineer
> - **skills 5 sweep** — analysis-aspect-static-security / analysis-formal-spec-validation / _base-apply-baseline-ratchet / implement-generate-impl-spec / (analysis-html-template + test-verify-coverage = 원래도 외부 도구 의무 명시 / 무수정)
> - **methodology-spec 5 sweep** — plugin-charter (R19) / lifecycle-contract (line 69+72+338) / deliverables/21-impl-spec (line 58) / deliverables/12-static-security-spec (line 106) / workflow/formal-spec (line 141)
> - **ADR patch** — ADR-009 §2.1 단계 5 + §2.2 도구 종류 표 + 변경 이력 / ADR-010 변경 이력
> - **`tools/_shared/baseline.js` + `tools/static-runner/src/sarif-to-finding.js`** 주석 정정 (Tier 1+2 통합 어댑터)
> - **`tools/spectral-runner/README.md` + `tools/README.md` + `README.md` (root)** sibling 인용 정합
>
> ### 4원칙 ladder full
>
> - **1원칙 plan**: `.claude/plans/plan-runtime-tool-exclusion.md` (§1-9 본 plan + §10 Senior 5 concerns 흡수 patch)
> - **2원칙 research (lightweight 2-agent)**: F-015 official-docs check (sub-agent `_base-official-docs-checker` / 6/6 1차 출처 verbatim / VERIFIED-IDENTICAL 4 + WITH-DELTA 2 / ★ load-bearing 정정 1건 PMD = **Java 8 or above** / 잔여 carry 4건 LL-rte-01~05) + Senior critique (sub-agent `_base-senior-engineer` / **REVISE-5 + STRONG-STOP signal 1건** SARIF import 우회 표면 / 5 concerns / confidence 0.84)
> - **3원칙 사용자 묶음 결단**: 2 cluster 7/7 추천 채택 (Option A + MINOR + 2-agent + ADR patch / 전면 흡수 + PMD 정정 + R19 신설)
> - **4원칙 시행**: Senior 5 concerns 전면 흡수 (additive / breaking 0)
>
> ### Senior 5 concerns 전면 흡수 결과
>
> 1. **SARIF import 4 조건 schema 강제** — driver allowlist + non-empty results 또는 non_use_rationale + reproduction_command + evidence_trust 3-tier ✅
> 2. **(P1)+(P2) 결합 명시** — "JVM 의존 = plugin scope 외" 솔직 격하 + "사용자 환경 SARIF import 패턴" 명시 ✅
> 3. **인용 13곳 동반 sweep** — agents 4 + skills 5 + methodology-spec 5 = 14 sweep (skill-citation-validator dead-link 차단 회피) ✅
> 4. **charter R19 신설** — R18 §5 patch ❌ / sub-axis evolution paradigm 정합 (plugin-authoring axis ≠ tool-ecosystem axis) ✅
> 5. **evidence_trust 3-tier + chain-strict mode 격상** — gate-eval.js `simulated_evidence_count` block 신규 ✅
>
> ### STOP-3 hard gate
>
> | 검증 | 결과 |
> |---|---|
> | `npm test --workspaces` | ★ **424/424 pass** (414 + import-sarif 10 신규) |
> | `static-runner` 단독 test | 26/26 pass (15 + 11 신규 import-sarif test) |
> | `chain-driver` 단독 test | 114/114 pass (gate-eval.js 변경 후 회귀 0) |
> | `release-readiness.js` | 13/13 ready:true |
> | `drift-validator` 3-way (flow/schema/template) | clean |
> | `skill-citation-validator` (47 SKILL.md + repo-wide active) | 0 stale |
> | `version-check` 3-way | plugin.json + package.json + CLAUDE.md = 8.6.0 |
> | F-021 임계 | ≤ 15 caution band |
>
> ### 잠재 함정 회피 (Adzic SBE 10년 폐기 함정 정공법)
>
> - 시뮬 ❌ + 실 사용자 환경 의무 = 본 결단의 본질
> - evidence_trust 3-tier = Tier 1 (in-plugin 실 실행) / Tier 2 (사용자 환경 실 실행 + import) / Tier 3 (영구 reject)
> - SARIF 4 조건 schema 강제 = 우회 표면 결정적 차단
> - 양심 의존 0 / chain-strict mode trio (state.blocked + cli exit 4 + PreToolUse deny) 정합
>
> ### 10 LL 자산화
>
> - **LL-rte-01** Semgrep install = `pipx install semgrep` (★ `pip install` ❌ — PEP 668 격리)
> - **LL-rte-02** Spectral AsyncAPI = v2.x 한정 명시 (v3 미지원 / Arazzo v1.0 자산 추가)
> - **LL-rte-03** SARIF = 2.1.0 Plus Errata 01 (OASIS Standard 28-Aug-2023) 정밀 표기
> - **LL-rte-04 ★ load-bearing** F-015 시 사실 정정 의무 — PMD = "Java 8 or above"
> - **LL-rte-05** SPA docs WebFetch fail → fall-back cascade carry
> - **LL-runtime-tool-01** charter R 신규 시 plugin-authoring (R18) ↔ tool-ecosystem (R19) axis 분리 의무
> - **LL-runtime-tool-02** evidence_trust 2-tier → 3-tier 격상 의무 (Adzic 함정 회피)
> - **LL-runtime-tool-03** F-015 load-bearing 정정 발견 시 결단 본질 재평가 의무
> - **LL-runtime-tool-04** 사전 배포 + 사용자 0 → breaking 자격 약함 / "additive primary signal" 우선
> - **LL-runtime-tool-05** SARIF import `results=[]` reject 의무 / `non_use_rationale` 첨부 시 허용
>
> ### 잔여 carry (v8.7.0+)
>
> - LL-rte-05 — plugin-authoring-spec §6 SPA fail cascade 보강
> - LL-rte-02 — Spectral AsyncAPI v2.x sweep 보강
> - import SARIF `duration_ms` 환산 보강
> - Tier 2 import 패턴 외부 적용 입증 (사내 CI 실 실행 + SARIF import 시연)
>
> tier = MINOR (additive — import 패턴 신설 + R19 charter 신설 + evidence_trust 신규 + chain-strict mode 격상 / 기존 의무 제거 0 / breaking 0). DEC-2026-05-18-runtime-tool-exclusion. Amends DEC-2026-04-29-static-tool-실행-의무화.

---

## [8.5.0] — 2026-05-18 ★ MINOR — F-SKILL P1 8 finding batch + plugin-authoring-spec §2 S2 강화 + §6 digest baseline refresh (additive)

> ★ **v8.5.0 MINOR — L3 audit P1 batch corrective sweep**. 사용자 "A. P1 9 finding batch (v8.5.0 MINOR / 권장)" → "진행 해줘" 시행.
>
> **4원칙 ladder full**:
> - 1원칙 `plan-v85-p1-batch.md` (lay-of-the-land 후 9 finding 정밀 scope + 시행 순서)
> - 2원칙 2-에이전트 lightweight research (`_base-official-docs-checker` F-015 + `_base-senior-engineer` critique / 산업 비교 skip)
> - 3원칙 사용자 묶음 결단 3 cluster (F-SKILL-016 ABORT / F-SKILL-001 Option A + F-SKILL-020 A only / 즉시 release cadence)
> - 4원칙 N/A (실패 0)
>
> **★ ★ ★ critical research finding**: `_base-official-docs-checker` F-015 cross-check on `disable-model-invocation: true` = ★ Claude 의 모든 invoke 경로 차단 ("Claude can invoke: No") → chain harness body 호출 차단 가능성 높음 → **F-SKILL-016 ABORT → P2 carry** (사용자 결단). 안전한 대안 = `user-invocable: false` (REVISE-2 carry).
>
> **시행** (additive / breaking 0 / 8 finding closed + 1 ABORT):
> - **F-SKILL-001** (medium / closed) — `analysis-domain-model:41` + `analysis-business-rules:52` business-logic.md anchor 정정 Option A (§5 4영역 병렬 + 실 매핑 명시 / domain = §5.A ORM + §5.B FE / rules = §5.A SQL + §5.B FE validation + §5.C 매직 넘버)
> - **F-SKILL-003** (low / closed) — 4 analysis-* descriptions (`architecture` + `domain-model` + `source-inventory` + `business-rules`) Korean trigger keywords 추가
> - **F-SKILL-007** (low / closed) — `_base-apply-template:20` "19 templates" → "21 templates" + drift recurrence carry note (LL-v85-01)
> - **F-SKILL-010** (low / closed) — `analysis-quality-antipattern` + 4 sub-skills (`planning-decompose-use-cases` + `planning-identify-business-intent` + `spec-derive-acceptance-criteria` + `spec-integrate-deliverables`) NL trigger phrase 추가
> - **F-SKILL-013** (low / closed) — `analysis-db-schema-erd` 사전조건 inventory.json 추가 (analysis-* family consistency)
> - **F-SKILL-016** (low / ★ ★ **ABORT → P2 carry**) — F-015 cross-check ABORT 권장 / `user-invocable: false` REVISE-2 carry
> - **F-SKILL-017** (low / closed) — `plugin-authoring-spec.md §2 S2` per-field description ≤ 1,024 char cap 추가 (best-practices)
> - **F-SKILL-018** (low / closed) — `§6` skills + plugins pinned_guidance_digest 갱신 (DELTA-1 `${CLAUDE_EFFORT}` + DELTA-3 1024c + DELTA-4 third-person + DELTA-5 one-level + DELTA-2 root-level SKILL.md) + **`digest_sha` 재계산** (skills `b8b2376312b0` → `e2b44d9d0e53` / plugins `b0e11058b05e` → `4498207cc547`)
> - **F-SKILL-020** (low / closed / A only) — `§2 S2` third-person POV sub-rule 추가 (audit ~25 skill wording 은 P2 carry)
>
> **★ ★ ★ 차기 session carry surface**:
> - **F-SKILL-016 REVISE-2** = `user-invocable: false` 검토 + plugin runtime smoke test (P2 carry)
> - **F-SKILL-020 후속** = ~25 skill descriptions 본격 wording audit (P2 carry / 별도 cooling-off)
> - **F-SKILL-007 drift 재발 방지** = templates/analysis/ enumerated count drift attractor (LL-v85-01 / plugin-authoring-spec sub-rule 후보 P2)
> - **v9.0 charter review carry 3종** = F-021 임계 v2 + skill-citation-validator recursive drift + F-SKILL-024 meta `_base-*` drift attractor
>
> **STOP-3 9-gate**: workspace 414/414·release-readiness **13/13 ready:true**·skill-citation-validator 207 active doc 0 stale·drift-validator 3-way·version 3-way 8.5.0·CLAUDE.md plugin.json v8.5.0·digest_sha 4/4 일치 (재계산 검증)·`_base-` 8 allowlist 변경 없음·description 단독 ≤ 1024 char (47/47 / 변경 없음).
>
> **classification = MINOR (additive / breaking 0 / digest recompute + methodology body change)**: skill body·frontmatter·plugin-authoring-spec §2 + §6 모두 additive (S2 추가 sub-rule + §6 digest 확장 / 기존 의무 제거 0). 산출물 schema·command-surface·산출물 파일명 변경 0.
>
> DEC-2026-05-18-v85-p1-batch.

---

## [8.4.1] — 2026-05-18 ★ PATCH — 47 SKILL.md L3 품질 감사 + P0 3 finding 즉시 fix + F-SKILL namespace 신설

> ★ **v8.4.1 PATCH — L3 skill audit corrective sweep**. 사용자 "나의 스킬들을 분석해 보고 싶다" → 축 "품질 감사 (citations / drift / SSOT)" → 깊이 "L3 + 산업 비교" → Plan A (report only) → 사용자 "진행 해줘" 시행 escalation.
>
> **L3 audit 산출**:
> - 6 sub-agent 병렬 dispatch (B-shard 1~4 / 329 cell × 7 axis × 47 skill / `_base-official-docs-checker` F-015 / `_base-industry-case-researcher` N=3 OSS) + `_base-senior-engineer` D7 synthesis.
> - 산출: `.claude/plans/audit-skill-l3-report.md` (사용자 검토 entry-point) + 5 supporting deliverables (`B-shard-1~4.md` + `C-official-docs.md` + `C-industry-case.md` + `D-senior-conscience.md`) + `plan-skill-l3-audit.md` methodology.
> - **24 unified F-SKILL findings** (31 CAND → 24 + 3 NOT-A-FINDING + 1 Senior gap-find F-SKILL-024 meta). severity 분포: medium 4 / low 11 / info 9. 8 ≥ 2 shard corroboration ✓ / 8 within-shard multi-site / 7 single-source spec-authority. Senior GO @ 0.86 conf.
>
> **P0 3 finding 즉시 시행 (additive / breaking 0 / 12 sites edited)**:
> - **F-SKILL-002** (medium / ghost-taxonomy) — `_base-log-finding/SKILL.md:15` 가 AP-RENDER/AP-FETCH/AP-A11Y/AP-i18n/AP-STATE 인용 / 실 examples/ 안 occurrences = 0 / `id-conventions.md` §3 canonical 9 카테고리 정합 ❌. **★ scope 확장 corroboration**: `analysis-quality-antipattern:18` (5 ghost prefix) + `analysis-aspect-a11y:27` (1 ghost prefix) = 3 skill 통합 fix. 실 PoC #04 사용 패턴 `AP-FE-{SUB}-NNN` (44 occurrence) 정합.
> - **F-SKILL-004** (medium / `_base-` prefix citation drift) — `analysis-input-collection/SKILL.md:14, :55` bare `apply-baseline-ratchet` → `_base-apply-baseline-ratchet` (2 sites / skill-citation-validator v8.1.1 bare-name resolver 사각 표면화).
> - **F-SKILL-005** (medium / slash↔dash citation form) — 7 file × 9 site 가 `_base/<name>` slash form → `_base-<name>` dash form 정규화. Senior 가 5 chain skills 보고 / 실 grep 추가 2 `_base-*` self-cite 확인.
>
> **F-SKILL namespace 신설** — `methodology-spec/finding-system.md` 에 L3 audit 24 finding 등재 (F-SIM/F-PA/F-MB 패턴 정합 / SSOT 표 + P0 closed + P1/P2 open carry).
>
> **★ ★ ★ 본 audit 핵심 발견 surface (사용자 결단 필요 carry)**:
> 1. **F-021 임계 unhealthy** (24 ≥ 20) — 단 actionable = 15 (caution band) / Phase reset ❌ / plugin-authoring-spec S1~S8 maturity signal → v9.0 charter review carry.
> 2. **skill-citation-validator coverage gap** (F-SKILL-001 + 004 + 005 root) — v8.1.0 validator 가 anchor §X.Y 의미 drift + `_base-` prefix bare-name mask + slash↔dash 모호 3 class 미 catch / **validator 자기 motivation class 자기 표면 안 재발 = recursive drift** / v9.0 의제.
> 3. **F-SKILL-024 meta (Senior gap-find)** — `_base-*` documented-exception 이 drift attractor (F-SKILL-004+005+015 공통 root = §8-2 frozen allowlist convention) / v9.0 charter-level 결단 (canonical rename OR validator-level normalization).
>
> **STOP-3**: workspace 414/414 ✓ + release-readiness **13/13 ready:true** for v8.4.1 ✓ + skill-citation-validator 207 active doc 0 stale ✓ + drift-validator 3-way ✓ + 12 site edited / breaking 0.
>
> **차기 session 권장 cadence**:
> - **v8.5.0 MINOR** = P1 9 finding (F-SKILL-001+003+007+010+013+016+017+018+020) + plugin-authoring-spec §2 S2 강화 + §6 pinned digest 갱신 (`${CLAUDE_EFFORT}`) + `digest_sha` 재계산.
> - **P2 12 finding (별도 cooling-off 24h)** = 각 별건 plan / F-SKILL-024 = v9.0 charter review.
>
> **classification = PATCH (additive / breaking 0)**: 12 site edited 모두 citation 정합 corrective + namespace 신설 (additive) / 산출물 schema·command-surface·산출물 파일명 변경 0.
>
> DEC-2026-05-18-skill-l3-audit-p0-corrective.

---

## [8.4.0] — 2026-05-18 ★ MINOR — F-SIM corroboration #2 attained (poc-14 external-user simulation / P1 deadline 14d 전 이행 / 패러독스 해소)

> ★ **v8.4.0 MINOR — corroboration #2 + 외부 사용자 dogfood 일석이조**. 사용자 "시뮬레이션…빌드된 plugins / 기존 PoC ❌ / 사용자 시점 기록 / 사용 빈도+사용 못하는 경우" → plan `peaceful-dreaming-dragonfly.md` 작성·ExitPlanMode 승인 후 시행.
>
> **신설**: `examples/poc-14-fsim-corroboration/` (Python FastAPI 0.115 + SQLAlchemy 2.0 + Pydantic v2 + SQLite / ~319 LOC / 의도된 결함 3종 — AP-FSIM-SEC-001 critical / AP-FSIM-DATA-001 high / AP-FSIM-AUTH-001 medium). poc-05 (TypeScript+vitest) 와 **stack 횡단** corroboration.
>
> **chain harness e2e RED→GREEN 완성**:
> - chain 0 (analysis): 7대 산출물 + aspect 5종 (static-security blocked-by-env carry / 4 FE skill non-fire)
> - chain 1 (planning): `excluded_antipatterns: [AP-FSIM-SEC-001, AP-FSIM-AUTH-001]` (F-SIM-001 lane carry) — planning-extraction-validator 0 findings
> - chain 2 (spec): `AC.related_brs + related_aps` (F-SIM-002/004 propagation source) — chain-coverage-validator + F-SIM-001 lane severe AP=2 / uncovered=0
> - chain 3 (RED): pytest 7/7 fail (Beck-canonical compile-import / `result_hash sha256:e0608e`)
> - chain 4 (GREEN): pytest 7/7 pass / fail_count=0 / `commit_hash 8e83c6f` / `result_hash sha256:47dbad`
> - matrix: 4 rows / 4 green / `severity_propagation_active:true` / `business_rule_ids+antipattern_ids` populated
>
> **사용자 4 조건 충족 (사용자 시점 기록 3 산출)**:
> - `.aimd/simulation/invocation-log.md` (63 entry / 35분 sequential / element 발화 / hook+agent non-fire 표면)
> - `.aimd/simulation/element-frequency.json` (47 skill × stage × fire / 9 agent × dispatch / 17 tool × invoke / 3 hook × fire — 결정적 매트릭스)
> - `.aimd/simulation/non-use-rationale.md` (미 fire 16 skill + 9 agent + 3 hook + 10 tool / 9 category 분류)
>
> **F-SIM-011 패러독스 해소** (`flows/sdlc-4stage-flow.json` release_eligibility): #1/#2/#6/#7 `current_corroboration_count_at_required_strength` **1→2** (poc-05+poc-14) / `self_consistency_note` "패러독스 해소". DEC-2026-05-17 §4.1.2 P1 deadline (2026-06-01) **14일 전 이행**.
>
> **★ ★ ★ element coverage threshold 결과 (정직 표면화)**:
> - skills fire: 31/47 (66%) ✓
> - agents dispatch: **0/9 ✗** (★ Type 1 시뮬레이션 본질 한계 / F-SIM-13)
> - tools invoke: 7/17 (41%) ✗ (phase-simplified + plugin-self-change-only)
> - hooks fire: **0/3 ✗** (★ Type 1 한계 / Claude Code session 외)
>
> → Type 1 (main self-run) ≠ Type 2 (real Claude Code session). **Type 2 별도 시뮬레이션 carry** (F-SIM-13 자산화).
>
> **신규 finding 후보 5종 (F-SIM-12~16 / 등재 carry)**:
> - F-SIM-12 (medium): severity_distinct_count=1 (모든 AC must → cell critical / SSOT mapping 한계)
> - F-SIM-13 (medium): Type 1 시뮬레이션 한계 (hook+agent fire 0)
> - F-SIM-14 (low): analysis-form-validation-fe description "FE-only" — Pydantic BE schema validation cover ❌
> - F-SIM-15 (high): test-spec.fail_mode schema 미허용 (F-SIM-005 P1 carry — 본 시뮬레이션 시 schema 차단)
> - F-SIM-16 (low): static-runner Semgrep wrapper deprecated / Windows MSYS2 환경 fire ❌
>
> **STOP-3 9-gate**: 6.5 pass / 2 partial (F-SIM-12/13 표면화) / honest 결과. **release-readiness 13/13** ✓ + workspace 414/414 + drift 3-way + skill-citation 0.
>
> **classification = MINOR (additive)**: corroboration #2 = 사실 변경 / 정의 변경 아님 / breaking 0.
>
> DEC-2026-05-18-fsim-corroboration-2-attained / plan `peaceful-dreaming-dragonfly.md`.

## [8.3.0] — 2026-05-18 ★ MINOR — chain harness e2e simulation audit + F-SIM-001/002/003/004/011 P0 corrective (additive / breaking 0)

> ★ **v8.3.0 MINOR — additive corrective + industry-aligned**. 사용자 "시뮬레이션…모든 단계에서 목표 정합·비효율 확인" → 데스크 워크스루 감사 (no-simulation 정책 무충돌) / poc-05(reference cycle / §8.1 strict 7/7 #7) + poc-03(retrofit) cross-validation → 11 finding 도출 (**F-SIM-001~011 / Body Finding Ledger F-SIM namespace 신설**). 단일 PoC 특이 0 + 4 finding RealWorld 악화 = **방법론 구조 결함 확정**. 공통 뿌리 1개: "본 방법론은 *링크 존재* 결정적 강제 / *링크가 비즈니스 사실 보존* 미강제" — F-SIM-001/002/003/004/005 동일 뿌리.
>
> **P0 시행 (사용자 "권고안 그대로 시행" 2026-05-18 / 9 결단 묶음 D1~D9)**:
> - **F-SIM-002**: `tools/traceability-matrix-builder/src/builder.js:56,67,77` 의 single-axis MoSCoW 종속 폐기 → **source-grounded max-propagation** (`deriveCellSeverity({ac, brs, aps})`). 권위 ISO 26262 Part 9 ASIL inheritance + IEC 62304 Class A/B/C propagation (F-015 Claim B / DMN 약함 — 인용 교체). SSOT `methodology-spec/severity-cross-stage-mapping.md` §2 정합. 신규 audit signal `coverage_summary.severity_distinct_count` + `severity_propagation_active`.
> - **F-SIM-004**: matrix cell 에 **`business_rule_ids[]`** + `antipattern_ids[]` 신규 1급 축 — DO-178C requirements axis 정합 (F-015 Claim A ★★★). md 컬럼 + mermaid edge `BR --> BHV` 추가.
> - **F-SIM-003**: `tools/chain-coverage-validator/src/validator.js` 에 `validateCrossRefPaths` 신설 — `planning.derivation_source` / `cross_links` + `behavior.derivation_source` / `cross_links` 4 source 경로 resolve assert + 컨벤션(repo-absolute vs project-relative) 검증. **`--strict-paths` flag warn default** (LL-i-55 함정존 회피 / v+1 default 전환 carry).
> - **F-SIM-001**: `validateAntipatternCoverage` 신규 lane — critical/high AP 가 `AC.related_aps` 매핑 또는 `planning.excluded_antipatterns` carry 둘 다 부재 시 finding emit. **industry-aligned** SonarQube Sonar Way + GitHub CodeQL + Snyk (F-015 Claim E + industry case 3종 corroboration). gate #2 validators 에 추가.
> - **F-SIM-011**: `flows/sdlc-4stage-flow.json` `release_eligibility` 강화 — `corroboration_depth_levels` (L0/L1/L2/L3) 명시 + #1/#2/#6/#7 의 `corroboration_strength_required` + `current_corroboration_count_at_required_strength` + `p1_carry` 명시. **poc-03 격하 (L1 — chain 4 미도달)** + `self_consistency_note` ("v8.3.0 = 정의 강화 / 사실 미충족 패러독스 잔존"). **P1 deadline = 2026-06-01** (DEC §4.1.2 commit-block).
>
> **schema 신규 (additive / breaking 0)**:
> - `schemas/acceptance-criteria.schema.json` AC 에 `related_brs[]` (`BR-*` pattern) + `related_aps[]` (`AP-*` pattern) optional.
> - `schemas/planning-spec.schema.json` 최상위 `excluded_antipatterns[]` (`{ap_id, reason, decision_ref?}`) optional.
> - `schemas/traceability-matrix.schema.json` cell `business_rule_ids[]` + `antipattern_ids[]` optional + coverage_summary 신규 audit signal `severity_distinct_count` + `severity_propagation_active`.
>
> **§8.1 자기정합 ≥3 PoC pre-sweep (D9)**: poc-05(BE micro) + poc-03(BE RealWorld) + **poc-04-mini(FE)** = 3 PoC 동형 재현 BE+FE 횡단 ★★★. F-SIM-003 = BE 2 PoC (v7.0.0 collateral 특이 / FE all paths exist). LL-fsim-04 해소.
>
> **3-에이전트 research** (`.claude/researches/research-fsim-p0.md`): Senior critique GO 0.82 + D4/D7/D8 REVISE / Official-docs F-015 ×5 (1차 출처 독립 fetch — DO-178C+ISO 26262+Kent Beck+SLSA+CNCF+OpenSSF+SonarQube) / Industry-case 3 Topic × 3 Case = 9 case all industry-aligned 확인. 권위 H3 반증 = **F-SIM-005 ledger Beck-canonical 수정** (compile-import-fail = valid RED / per-TC granularity 잔존 본질).
>
> **self-bootstrap (#16 STOP-3)**: poc-05 = AC-USER-001 에 `related_brs`/`related_aps` 추가 + planning `excluded_antipatterns: [AP-USER-003]` carry + cross_refs `output/rules/business-rules.json` sync → `chain-coverage-validator` exit=0 / severe AP=2 / uncovered=0. matrix 재생성 — `business_rule_ids` + `antipattern_ids` populated + `severity_propagation_active:true`.
>
> **STOP-3 9-gate**: schema-validator (11 PoC 0-regression) / **workspace test 414/414** (395+ → 414 +19 신규 F-SIM test) / drift-validator 3-way (chain-flow detection-only / state-flow consistency / chain-layout passed) / **release-readiness 13/13 ready:true** (workspace_test_pass 포함) / version-check 3-way 8.3.0 / skill-citation 0 stale / antipattern-coverage lane self-bootstrap pass.
>
> **classification = MINOR (additive)** — 5 schema field 추가 (전부 optional / 11 PoC 0-regression) + 신규 validator lane 1종 (chain-coverage-validator workspace 일부 / 신 도구 ❌) + flow 정의 강화. breaking 0 / cooling-off 사용자 명시 위임 생략 (D6).
>
> **P1 carry (DEC commit-block 2026-06-01 deadline)**: F-SIM-005 (RED fail_mode enum) + corroboration #2 신규 PoC chain 4 GREEN. 미시행 시 release_eligibility 자기충족 패러독스 잔존.
>
> DEC-2026-05-17-chain-harness-e2e-simulation-audit / `.claude/plans/plan-fsim-p0.md` / `.claude/researches/research-fsim-p0.md` / Body Finding Ledger F-SIM-001~011.

## [8.2.3] — 2026-05-17 ★ PATCH — 확장 감사(methodology-body deliverables/schemas/tools) + F-MB-001~009 corrective sweep (breaking 0)

> ★ **v8.2.3 PATCH — corrective / non-breaking**. 사용자 "1,2,3 다하자 순서대로" → "전체 corrective sweep + 릴리즈". 확장 감사 = Area E deliverables 25 + Area F schemas 39 + Area G tools 18 = **82 단위** (L1 + L2 의미·claim accuracy + L3 §8.1·no-simulation / 8 sub-agent 배치 + ground-truth XV). **GREEN 74 / RED 8** (RED 전부 Area G tools README↔cli.js 문서 drift — 코드·테스트·no-simulation 전부 정상). Area E·F 구조 거의 완벽($id↔filename 0 불일치 / F-PA-009=singleton / $ref 0 broken). post-dedupe F-MB 9건 / F-021 band 5~15 "건강한 검증". finding-system.md Body Finding Ledger **F-MB namespace 신설**. DEC-2026-05-17-plugin-authoring-mb-audit / ADR-PLUGIN-001 §7 patch v7 + §8 LL-plugin-05.

### 감사 + 처분 (F-MB-001~009)

- **resolved 8**: F-MB-001(rules.json→business-rules.json 활성 DOC 표면 sweep — flows json+mermaid + guides + methodology-spec docs + deliverables 6 + schemas 2 / ★ cross_links `to_artifact: rules`=logical 자산명 불변 ground-truth 적발 무변경) / F-MB-002(form-validation-spec·formal-spec BR-id 3-seg→canonical 4-seg / 0 PoC consumer + schema-validator 11 PoC 0-regression 입증) / F-MB-003(legacy-spectrum·static-security-spec property 키 `★ ` 제거 / 0 consumer) / F-MB-004(chain-driver README exit 표 → cli.js 권위 / consumer-facing high) / F-MB-005(chain-coverage·schema-validator·test-impl-pass README exit 표 → cli.js header) / F-MB-006(decision-table·drift-validator·sql-inventory README 구현표면 보강) / F-MB-007(spec-test-link README finding-kind → validator.js emit 정합) / F-MB-008(test-impl-pass README src/adapters→src/runners)
- **deferred 1**: F-MB-009(tool src·test·scripts·PHASE-history `rules.json` literal = LL-i-55 함정존 / test fixture·migration script·역사기록 = blanket 시 release gate 자해 → 파일별 forensic 별건 revisit)
- **★ 메타**: ground-truth-before-edit 가 재작업 1건 추가 차단 (cross_links `to_artifact: rules` = lifecycle-contract SSOT logical 자산명 불변 / sub-agent 과탐 = 3번째 위생 적발 / LL-plugin-04 재확인). Area F = F-PA-009($id) singleton 확인(나머지 38 정합).

### 회귀 (STOP-3 hard gate 전부 통과)

- 잔여 grep 0: safe-tier rules.json / ★-prefixed property key / 3-seg BR pattern
- skill-citation-validator finding 0 (207 active doc)
- release-readiness **13/13 ready:true** — ★ analysis_validator_violation = **schema-validator 전 11 PoC pass** (F-MB-002 패턴 tighten + F-MB-003 ★-key rename PoC 회귀 0 결정적 입증) + workspace 395+ + drift-validator 3-way (flows json+mermaid 정합) + version-check 3-way 8.2.3
- P2′ 판정 = **PATCH** — F-MB-002/003 = schema-contract touch 이나 0-consumer 검증 + canonical 정렬(corrective) + schema-validator 전 PoC 0-regression 결정적 입증 → F-PA-009($id 정합 PATCH) 선례 동형 / semver inflation 회피 / 나머지 전부 doc-corrective. breaking 0.

---

## [8.2.2] — 2026-05-17 ★ PATCH — plugin-authoring 4영역 파일별 품질 감사 + L2 인용 drift corrective sweep (F-PA-001~010 / breaking 0)

> ★ **v8.2.2 PATCH — corrective / non-breaking**. 사용자 "각 영역 별 파일별 품질 검증" → plugin-authoring 4영역 60 단위(47 SKILL.md + 9 agents + README + hooks.json + 2 manifests) 파일별 감사(L1 규칙 + L2 의미·claim accuracy + L3 §8.1·no-simulation / 10 sub-agent 배치 + XV 독립 재검증). **L1 구조 60/60 PASS** — 결함 전부 **L2 인용 drift**(근본원인 = v7.0.0 rules.json·v8.0.0 skill rename·v5~6 BR schema rename 후속 전파 누락). post-dedupe finding 10건 (F-021 band 5~15 "건강한 검증" / 명세 부실 ❌). 사용자 "진행" → corrective sweep 시행. DEC-2026-05-17-plugin-authoring-file-audit / ADR-PLUGIN-001 §7 patch v6 + §8 LL-plugin-04.

### 감사 + 처분 (finding-system.md Body Finding Ledger F-PA 신설 namespace)

- **resolved 8**: F-PA-001(spec-compose-behavior-spec:53 dead skill명 `integrate-7대-deliverables`→`spec-integrate-deliverables`) / F-PA-002(13 SKILL.md + **5 workflow SSOT doc** rules.json→business-rules.json / 3-step 안전치환) / F-PA-003(5 chain skill ADR-CHAIN-001 §3↔§6 인용 정정) / F-PA-004(analysis-business-rules inline 예제 canonical) / F-PA-005(implement-react/vue 거부키 react/vue_version → 실재 schema 필드 `modules[].framework` redirect / schema 무변경) / F-PA-006(analysis-architecture·domain-model 산출물 N off-by-one) / F-PA-008(hooks-bridge buildBlockOutput `hookEventName` 추가 / additive optional) / F-PA-009(business-rules.schema.json `$id` 정합 / $ref 의존 0)
- **wontfix 2**: F-PA-007(skill 인용 정확 / stale = ADR 파일명 immutable-history) / F-PA-010(design-agent 의도된 placeholder)
- **★ 메타 가치**: 기존 skill-citation-validator(check #13)가 "본문·CLI 예제 내 맨 artifact 파일명" drift 를 구조적으로 못 보는 사각을 본 감사 L2 가 메움. ground-truth-before-edit 가 재작업 2건 차단(FP-1 `_base-apply-template` 1차 RED 오탐 / F-PA-007 1차 오진).

### 회귀 (STOP-3 hard gate 전부 통과)

- 잔여 grep **0**: standalone rules.json(skill+workflow) / §6-no-sim·§3-test-type miscite / react·vue_version 의무 / integrate-7대
- skill-citation-validator **finding 0** (207 active doc / 자가 회귀 1건 — ledger 내 죽은 `*.schema.json` 토큰 — 발견 즉시 비리터럴화 교정)
- release-readiness **13/13 ready:true** (workspace test 395+ pass / chain-driver hookEventName 변경 무회귀 / validators·analysis·citation green) + drift-validator 3-way 불변
- breaking **0** = PATCH (doc-corrective + schema $id 정합($ref 의존 0 / CHANGELOG v7.0.0 미완 보정) + chain-driver additive optional)

---

## [8.2.1] — 2026-05-17 ★ PATCH — §8-2 `_base-*` documented-exception 종결 (backlog 잔여 0 / Senior GO 0.88 / F-015 = nominal not functional)

> ★ **v8.2.1 PATCH — corrective·additive / non-breaking**. 사용자 "b 하고 a 진행" — briefing deck 버전 drift(v5.0.0→v8.2.0·387→395·11/11→13/13·15/15→16/16·16→17종) 정리 후 plugin-authoring-spec §8-2 backlog 2번 결단. v8.2.0 F-015 ×5 재검 완료 = §8-2 trigger 충족 → `_base-*` skill5+agent3 rename(v9.0.0 MAJOR / ~195 occ·70 file / 0 functional gain) vs documented-exception. 실 F-015(공식 charset verbatim 확인 / violation enforcement·`_`-prefix 거동 **미문서화** = nominal not functional) + Senior GO 0.88 → **documented-exception**. §8 backlog 잔여 **0**. DEC-2026-05-17-base-prefix-documented-exception / ADR-PLUGIN-001 §7 patch v5 + §8 LL-plugin-03.

### 종결 (§8 backlog 2번 / S3·A1 ⚠️→✅)

- **§7 매트릭스** `_base-*` 행 ⚠️→✅ (documented-exception) + 결론 "§8 backlog 잔여 0".
- **§8-2 명세** — 영구 grandfather = 정확 8 frozen allowlist (skill 5: log-finding·apply-template·build-traceability-matrix·apply-baseline-ratchet·invoke-go-stop-gate / agent 3: official-docs-checker·senior-engineer·industry-case-researcher).
- **★ Senior 필수 guardrail 1** — §9 skills digest 가 enforcement-strength encode (charset 문자열뿐 아니라 "violation 거동 미문서화 = advisory-consistent / hard-enforce 전환 시 차기 F-015 CONTRADICTS tripwire"). digest 변경 → skills `digest_sha` 재산출 ea06dc97470e → b8b2376312b0 (★ v8.2.0 digest_sha 메커니즘이 자기 변경 STALE 검출 = 1 release 만에 자기 dogfood 실효).
- **★ Senior 필수 guardrail 2** — release-readiness check #12 = `_base-` 자산 정확 8 allowlist 결정적 assert (9번째 = fail / 예외 loophole 화 차단 / 신규 non-`_base`=S3 ratchet). check #12 내부 강화 (신 check ❌ / 13 유지).
- **release-readiness.test.js** — `_base-` allowlist case 신설 + readdirSync import.

### 회귀

release-readiness 13/13 (check#12 = §6 4행 ≤60d + digest_sha 4행 일치 incl 재산출 skills b8b2 + `_base-` 8 allowlist) · skill-citation 0 stale · version-check 3-way 8.2.1 · workspace green · drift-validator 3-way 불변 · breaking 0 (rename ❌ / 8 자산 무변 / ADR-010 영구 grandfather). tier = PATCH (문서종결+이미참 invariant 형식화 / consumer 영향 0 / LL-i-56 정합).

---

## [8.2.0] — 2026-05-17 ★ MINOR — 공식 docs F-015 ×5 재검 + §6 digest_sha META blind-spot closure (hooks VERIFIED-WITH-DELTA / additive)

> ★ **v8.2.0 MINOR — additive / non-breaking**. 사용자 "Anthropic 공식 skills·agents·hooks best practice 재확인 + 비교 + 개선" → `plugin-authoring-spec.md` §9 Layer i 실 `_base-official-docs-checker` F-015 ×5 (skills/hooks/sub-agents/plugins-reference + matcher/if 정밀). 판정 = skills·sub-agents·plugins **VERIFIED-IDENTICAL** / hooks **VERIFIED-WITH-DELTA**. ★ Explore pre-research 가설 3건(event 30+·sub-agent name-only required·P2 stale) = 실 F-015 가 **모두 반증** (research 수렴 ≠ 사실 / 1차 출처 독립 fetch 의무 / LL-plugin-02). DEC-2026-05-17-plugin-authoring-docs-drift / ADR-PLUGIN-001 §7 patch v4 + §8 LL-plugin-02.

### 규칙 additive 보강 (거짓 규칙 0 / H1~H7·§4·§5 무변)

- **§2 S8 신설** (권장/low) — auto-compaction 재첨부 대비 (`SKILL.md` 선두 ~5000 토큰 self-contained / 재첨부 공유 25000 토큰 budget). 공식 "Skill content lifecycle" verbatim.
- **§3 H8 신설** (권장/medium) — per-handler `if`=permission-rule filter(tool 이벤트 한정) / handler type 5종(command·http·mcp_tool·prompt·agent) / `timeout` 기본 600(command/http/mcp_tool)·30(prompt)·60(agent) / `once`=skills/agents 한정 / ★ `matcher`(event-group)≠`if`(per-handler) 별개·공존·비폐기 (H4 matcher = F-015 verbatim 정합 확인 / 무변).
- **§6 digest enrich** — skills·hooks·plugins 3행 (sub-agents 무변) / 4행 `last_verified`=`retrieved`=2026-05-17 (실 F-015 재검).
- **§7** — hooks.json `if`/`timeout` 미사용=optional 정합 + 29-event·matcher F-015 재확인 주석 + 결론 보강.

### ★ META — §6 digest_sha content-commitment 결정적 결합 (사용자 채택)

- **§6 `digest_sha` 컬럼 신설** = `sha256(trim(pinned_guidance_digest))` 선두 12 hex.
- **release-readiness check #12 강화** — `last_verified` date-math **+ digest_sha 재계산 일치 결정적 assert** (6→7 cell 파싱 / fail-closed-on-`|` 유지). 날짜만 갱신·digest 무단편집 동시 차단. check 수 **13 유지** (check #12 내부 강화 / 신 check ❌).
- **§9 Layer i** — VERIFIED 분기 (IDENTICAL=날짜만 / WITH-DELTA=동일 변경서 digest 재발행+§2~§5 재정합) + 불변식 ("last_verified bump ⟺ 실 F-015 run AND digest_sha 일관") + blind-spot closure note.
- **release-readiness.test.js** — check12 digest_sha assert 갱신 + digest_sha regression-guard case 신설 (실 §6 4행 sha 재계산 dogfood / 7-cell 의무).

### 회귀

release-readiness 13/13 (check #12 4행 ≤60d + digest_sha 일치 / check #13 0 stale) · version-check 3-way 8.2.0 · workspace test green · drift-validator 3-way 불변 (skill/agent/flow 무편집 / chain harness §1 비범위 safety property) · breaking 0 (전부 additive / ADR-010 grandfather 47 skills·9 agents·hooks.json 정합 유지).

---

## [8.1.1] — 2026-05-17 ★ PATCH — skill-citation-validator repo-wide 확장 + 활성 SSOT stale 인용 정합 (FP 교정)

> ★ **v8.1.1 PATCH — corrective / non-breaking**. 사용자 "다른 stale 인용 더 없나 전체 레포 스캔" → repo-wide 결정적 스캔 → 활성 SSOT 문서에 SKILL.md 와 **동일 schema-drift class** 잔존 확인 → validator scope 확장 + FP 교정 + dead-link 수정. check #13·tool 자체는 v8.1.0 기존 (신규 surface ❌) = PATCH. DEC-2026-05-17-repo-wide-citation-scan / ADR-PLUGIN-001 §7 patch v3.

### validator 결함 교정 (skill-citation-validator)

- **scope** SKILL.md 한정 → **repo-wide active 표면** (.md/.mermaid / EXCLUDE = node_modules·.git·.claude·.github·briefing·dist·examples·archive + CHANGELOG*·*HISTORY*·decisions/DEC-*·decisions/STATUS*·decisions/INDEX* + **docs/adr/**(ADR=immutable decision record / LL-i-52) + **templates/adoption/**(downstream scaffold placeholder))
- **DEC/ADR exact-match → prefix-match 교정** (파일명 descriptive suffix 때문에 단축 id 인용 FP 였음 / 결정적 버그)
- **relative-path 해석** 추가 (도구-local `docs/` 등 citing-file-relative 흡수)
- **ABSENCE_CTX 확장** — 의도적 부재 + supersession(격상/승격) + future-carry(carry/후보/예정/미생성) + **흡수**(제거된 구 자산 historical mapping) → 현재-dead-link 주장 아님 skip
- **migration/absorption 표 인식** — header 가 `흡수/보존/migrated/legacy` 면 그 표 region row 인용 = historical mapping skip (agents-axis §5 정합 / LL-i-52)

### 발견·수정 (ground truth 삼중 대조 / LL-i-55)

- repo-wide raw → HISTORY 453 + POC 41 (정직 분리 / 결함 아님) → 활성 표면 정밀 triage → **실 stale 31건 / 15 file → 0**
- 동일 schema-drift class 활성 SSOT 잔존 수정 — `lifecycle-contract.md`(자산매핑 SSOT: rules→business-rules + a11y/i18n/static-security/legacy → -spec/-spectrum + ADR-FE-002/005 정확명) · `id-conventions.md` · `methodology-spec/README.md` · `severity-cross-stage-mapping.md`(severity SSOT) · `schemas/README.md`(+intervention-log.js→state-store.js) · `templates/planning/planning-doc-format.md` · `deliverables/{5-business-rules,4-5-formal-spec,4-db-schema,6-antipatterns}.md`(templates/→templates/analysis/) · `skills/analysis-br-cross-consistency-check`(docs/→tools/br-cross-consistency-validator/docs/)
- FP 정확 분리 무수정 — agents-axis §5 흡수표(historical) · sql-inventory carry 후보 · ADR-FE-001 §결정 신설서술 · ADR-FE-005 ADR-007 격상 · DEC/ADR 산문 약식 인용

### 검증

- skill-citation-validator **0 stale** (207 active doc / dogfood green) + test **2/2** (regression-guard + synthetic history/absence/migration-table/relative FP 입증)
- release-readiness **13/13** (check #13 repo-wide green) + version-check 3-way 8.1.1 + workspace green + chain harness validated 본질 보존

---

## [8.1.0] — 2026-05-17 ★ ★ MINOR — skill-citation-validator 신설 + 47 SKILL.md stale 인용 정합 (R18 내부정합 / release-readiness #13)

> ★ ★ **v8.1.0 MINOR — additive enforcement + 비-breaking 내부 dead-link 수정**. 사용자 "내용 로직도 확인 가능한가" → A(내부 정합 결정적 검사) → "수정 + validator 도구화". skill 지시 설계품질(증명불가 C계층) 아닌 **"인용 문서 실존"(결정적)** 검증. DEC-2026-05-17-skill-citation-integrity / ADR-PLUGIN-001 §7 patch v2.

### 발견 (결정적 스캔 / ground truth 삼중 대조)

- 47 SKILL.md 인용 전수 스캔 → **37 stale dead-link / 14 skills** (휴리스틱) → ground truth 대조 후 false-positive 분리 → **37 실결함 확정** (스캐너 정밀화 후)
- 원인 = doc 재구조화 미전파: deliverables 재번호(`04-rules.md`→`5-business-rules.md`·`08`→`8`) / workflow `phase-N`→semantic(`phase-4-5-cross-validation`→`formal-spec.md`·`phase-5-2-*`→`ui.md`) / schema `-spec`·`-spectrum` 접미(`a11y.schema.json`→`a11y-spec.schema.json` 등 4종) / v7.0.0 `rules.schema.json`→`business-rules.schema.json` / template(`rules.template.json`→`.md`·`openapi.template.yaml`→`openapi-extension.template.json`) / ADR 정확명(`ADR-CHAIN-001.md`→`-chain-4-stage-enforcement.md`)
- ★ 기존 validator 전 사각 (drift=flows / formal-spec-link=chain 산출물 / SKILL.md 산문 인용 무검증) — A 검사가 진짜 사각지대 노출
- false-positive 정확 분리 (LL-i-55) — `implement-react-18`·`-svelte`·`-vue-2`(미존재 carry 정확 기술) / `planning-extraction-validator`(tool) / DEC `.md` 접미 / `ADR-007 부재`(의도적 부재) = 무수정

### 신설 (additive)

- **`tools/skill-citation-validator/`** (npm workspace 17번째) — schema/repo-path/ADR(부재-context 제외)/DEC(.md 정규화) 실존 결정적 검사. AI 추론 0% (no-simulation). cli + check-citations + test(dogfood regression-guard + synthetic + FP 필터 2/2) + README
- **`scripts/release-readiness.js` check #13** (`skill_citation_integrity`) — 12/12 → **13/13**. 향후 doc 재구조화 시 SKILL.md stale 인용 release gate 자동 차단
- **수정 14 SKILL.md / 20 인용** (비-breaking 내부 dead-link 정정 / ground truth 정밀 target / 추정 ❌ LL-i-55)

### 검증

- skill-citation-validator **0 stale** (dogfood green) + test 2/2
- release-readiness **13/13** (A1 본격 spawn) + release-readiness.test.js 13 갱신 + version-check 3-way 8.1.0 + workspace green + drift-validator 불변 + chain harness validated 본질 보존

---

## [8.0.0] — 2026-05-17 ★ ★ ★ MAJOR — skill rename `spec-integrate-7대-deliverables` → `spec-integrate-deliverables` (한글 → kebab / command-surface breaking)

> ★ ★ ★ **v8.0.0 MAJOR — breaking (의도 / semver 정합)**. 사용자 "1 바꾸자" → ADR-PLUGIN-001 §8-1 deferred backlog 본격 시행. Senior critique **GO+REVISE conf 0.88** + STOP-3 hard gate. command-surface(skill `name`) rename = P2′ MAJOR 비협상 (선례 v7.0.0 D1). DEC-2026-05-17-skill-name-rename / ADR-PLUGIN-001 §7 patch v1. ★ plugin-authoring-spec §8-1 종결.

### 결단 (Senior GO+REVISE 3 교정 수용)

- 새 name = **`spec-integrate-deliverables`** — "7" = stale noise (실제 ~17 산출물 통합 / "7대"는 틀린 수) / `spec-` prefix 가 이미 stage 표시 / skills-axis 의미-ID + v2.6.0 무의미 숫자토큰 제거 선례. (후보 `-analysis-deliverables` = redundant / `-7-deliverables` = v2.6.0 안티패턴 재발 → 기각)
- 분류 교정 — SSOT `plugin-authoring-spec.md` §7/§8 = **content-aware (❌→✅ resolved)** not blind swap (거짓 행 방지) / ADR-PLUGIN-001 §2.5 line 57 literal + `DEC-2026-05-17-plugin-authoring-spec` = audit-time 기록 **보존** (역사 무수정 / LL-i-52) / CHANGELOG 구 entry 무수정

### rename (git mv + 활성 ref / 실측 19 occ·13 files)

- **git mv** `skills/spec-integrate-7대-deliverables` → `skills/spec-integrate-deliverables` (history-preserving)
- 활성 코드 5: SKILL.md `name:`+H1 / `agents/spec-agent.md` ×3 / `flows/spec.phase-flow.json` skills[] / `flows/spec.phase-flow.mermaid` 라벨 literal (phase-id `cross-link-7-deliverables` = 유지 / skill 식별자 아님)
- 활성 문서 7: `skills-axis.md` / `lifecycle-contract.md` / `guides/getting-started.md` / `guides/first-prompt-cookbook.md`(link+path) / `README.md` ×2
- ★ LL-i-55 trap 회피 — generic "7대 산출물" 도메인 산문(SKILL.md 본문·templates·spec-compose 등)은 skill 식별자 아님 → 무수정

### STOP-3 hard gate (v7.0.0 LL-i-55·57 정합)

- sweep (A) 활성 코드 literal 0 / (B) tools·scripts hidden consumer 0 / (C) broader-prose false-positive 수동 확인
- drift-validator 3-way (manifest↔skills↔mermaid) + schema-validator 11 PoC + workspace + release-readiness **12/12 incl check #12** (★ dogfood — plugin-authoring-spec 가 자신의 위반 해소를 검증 / check #12 green 의무)

### 검증

- (gate 결과 = 본 commit 직전 실측 기록)
- 버전 trio 8.0.0 (plugin.json + package.json + CHANGELOG / version-check exit 0) + CLAUDE.md sync (check #10)

---

## [7.1.0] — 2026-05-17 ★ ★ MINOR — plugin-authoring-spec SSOT + 외부 docs drift baseline+ratchet (ADR-PLUGIN-001 / charter R18 / release-readiness #12)

> ★ ★ **v7.1.0 MINOR — additive (선행 자산 무수정)**. 사용자 질문 "plugin skill/hooks/agent 작성 시 Anthropic 공식 best practice?" → 저작 규칙 단일 SSOT 신설 + 47 skills·9 agents·hooks·packaging 전수 감사 + 외부 권위(공식 docs) drift 재검증 메커니즘. 4원칙 full (plan + Plan agent Senior 압력테스트 + 실 `_base-official-docs-checker` F-015 ×4 VERIFIED). DEC-2026-05-17-plugin-authoring-spec / ADR-PLUGIN-001. 선행 housekeeping = DEC-2026-05-17-package-version-3way-sync-fix (package.json 4.0.1→7.0.0 별도 commit).

### 신설 (additive)

- **`methodology-spec/plugin-authoring-spec.md`** (★ ★ ★ 단일 SSOT / §1~§11) — Skill(S1~S7)·Hook(H1~H7)·Agent(A1~A6)·Packaging(P1~P4) 저작 규칙 + §6 공식 docs pin baseline(ADR-010 차용) + §7 compliance 매트릭스 + §8 이연 backlog + §9 drift 재검증 2계층
- **`docs/adr/ADR-PLUGIN-001-authoring-spec-and-docs-drift.md`** (신규 namespace = ADR-BE/FE/CHAIN/NEST 컨벤션 정합)
- **`scripts/release-readiness.js` check #12** (`authoring_spec_staleness`) — §6 pin `last_verified` 4행 ≤ 60일 결정적 가드 (date-math only / 네트워크 ❌ / check10 패턴 isomorphic / `--skip-authoring-staleness` flag = skip≠pass / release 시 ❌ 의무). 11/11 → **12/12**
- **`plugin-charter.md` R18** 정식 요구사항 신설 (§1 + §2 매핑 / 사용자 결단 = §5 backlog 아닌 정식 R)

### 감사 결과 (실 F-015 cross-check / false-positive 3건 제거)

- §6 pin = 실 `_base-official-docs-checker` ×4 VERIFIED (canonical `code.claude.com/docs/en/{skills,hooks,sub-agents,plugins-reference}` / 2026-05-17)
- 실 위반 = **S3 1건 ❌ high** (`spec-integrate-7대-deliverables` 한글 → MAJOR rename / §8-1 이연) + **S3/A1 1군 ⚠️ low** (`_base-*` leading `_` / §8-2 이연·수용 후보)
- false-positive 제거 = S1 retrofit 불요(47/47 ≤500L+외부ref) / marketplace.json 위치 공식 정합 / agent `skills:` = 공식 preload 필드(자체확장 ❌). `system_prompt`·`preloaded_skills` over-claim 교정
- ADR-010 grandfather: 위반 = baseline grandfathered / ratchet = 신규·수정 자산만 §2·§4 즉시 강제

### 검증

- release-readiness **12/12** (A1 본격 spawn / `criteria_total=12 passed=12 ready=true exit 0`) + release-readiness.test.js **12/12 pass**
- version-check **3-way 7.1.0** (선행 housekeeping 으로 package.json 청산 후 정상 bump)
- workspace test green / drift-validator 3-way 불변 (skill/agent/flow 무수정 = §8 이연의 안전 속성)
- chain harness validated 본질 보존 / breaking ❌ (선행 자산 무수정 / 감사는 기록만)

### 이연 (별도 user-gated bundle)

- §8-1 `spec-integrate-7대-deliverables` → kebab rename = **별도 MAJOR** (3 ref / cooling-off + Senior + STOP-gate / v7.0.0 선례 정합 / 본 release scope ❌)
- §8-2 `_base-*` charset deviation = 차기 네트워크 재검증서 재평가

---


## Archive

> v7.0.0 이하 entry 모두 → [`CHANGELOG-HISTORY.md`](CHANGELOG-HISTORY.md) 이전 (★ ★ v8.13.2 cleanup / 2026-05-23 / DEC-2026-05-23-project-cleanup 정합).
