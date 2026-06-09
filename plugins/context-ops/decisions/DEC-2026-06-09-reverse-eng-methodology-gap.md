# DEC-2026-06-09-reverse-eng-methodology-gap

**결단**: **역공학 분석 방법론을 외부 연구로 1차원리 재설계(스코프-바깥 + 추상화-안쪽 중첩 6단계 + 12산출물) 후 본 레포 자산에 대조 → ~70% 이미 더 엄밀히 존재. CONFLICTS 3건 처분 확정(C1 bidirectional 비채택 / C2 unified-register 비채택 / C3 lift-order option-a) + 진짜 델타 7개 식별 + 1차 착수 결과 포착.** 결정 포착 DEC(릴리스 ❌ / 구현 = per-delta DEC + ≥2 PoC corroboration 후). 코드 변경 = db-schema 컬럼 `sensitivity` additive 1건만.

**작성일**: 2026-06-09.

**relates to**:

- `methodology-spec/reverse-engineering-methodology.md` (Part A 갭분석=권위 / Part B 외부 연구 합성=reference / 본 DEC 가 그 위 결정 포착)
- `.claude/plans/plan-reverse-engineering-methodology.md` (1원칙 plan / 6-결정 묶음) + `.claude/plans/research-reverse-engineering-carve.md` (2원칙 carve research)
- `DEC-2026-06-07-living-sync-operating-model` (forward-only 전파 정책 SSOT — C1 이 그 결정을 재확인·강화)
- `DEC-2026-06-06-tool-allowlist-pmd-only` + `DEC-2026-05-18-runtime-tool-exclusion` (R19 — gap-dynamic-trace/app-code-fitness 가 충돌)
- `DEC-2026-05-28` codegraph reference-lens (C3 code-graph 조기화 = trust 경계 그대로)
- memory `feedback_diagnose_before_design_check_existing` (본 DEC 의 방법론 / bidirectional 오채택 차단) + `feedback_axis_split_severity_reevaluation` (existing_test_file 재분류) + `feedback_research_fact_validation` (carve research)

---

## 1. 배경

사용자 지시(최우선): "코드를 역공학 관점에서 체계적으로 분석하는 소프트웨어 방법론 — step별 진행 + 대형은 스코프 분해(정의→하나씩) + 산출물 7개 고정 해제. 플러그인에 국한 말고 열린 사고."

방법(4원칙 / 다중 에이전트):
1. 외부 학계·업계 연구 합성(workflow #1) — Chikofsky&Cross / Pennington·von Mayrhauser(인지모델) / Feathers·OORP(legacy) / Tornhill·Martin·Bunch(스코프) / SCIP·RepoGraph(LLM 컨텍스트) / DMN·Evans·DO-178C(산출물) 실 fetch → "이상적" 방법론 설계(스코프-바깥 + 추상화-안쪽 중첩 6단계 + CORE 8 + CONDITIONAL 5).
2. repo 갭 진단(workflow #2 / diagnose-before-design + 적대적 refute) — 설계를 현행 자산(analysis 24산출물 + chain harness 6-stage + living-sync)에 대조.
3. carve 신호 research(2원칙) + C1·C3 코드근거 심층 재논의(사용자 요청).

## 2. 결정 내용

### 2.1 갭 verdict — 전면 재설계 ❌ (~70% 이미 존재)

외부 설계의 ~70%가 본 레포에 **이미 더 엄밀히** 존재: code-graph / behavior-spec(18) / characterization-spec(23) / DMN business-rules + br-cross-consistency / traceability-matrix(22, DO-178C) / domain+glossary / context-federator / deterministic-vs-LLM split(chain-driver axis) / intent↔observed 분리 / work-unit scope folder + soft gate #0. → **"산출물 7개 고정 해제"는 사실상 이미 24종으로 달성**. 전면 재설계 불필요.

### 2.2 C1 — bidirectional sync **비채택** (forward-only + lift 보존·강화)

외부 설계의 discipline#3("forward-only 폐기, 양방향")은 `living-sync-operating-model.md`(`DEC-2026-06-07`)의 forward-only 불변식(confluence/idempotency/no-ping-pong)과 충돌. **코드 실측**(`lift-anchor.js`/`cmdLift`): 손수정 코드→산출물의 정당한 needs 는 §4 lift/reconcile("의미 천장")이 이미 해결. lift = 2레이어 — Layer 1(anchor 해소 + backward 천장 후보 enumeration) = 이미 결정론·자동·무비용 / Layer 2(의미천장 *선택*) = 사람(auto-climb 금지 = 날조 회피 `lift-anchor.js:5`). ceremony 비용은 대부분 **비례적**, 과중분(trivial refactor 고정 제스처 / bulk mixed-intent)은 forward-only 보존하며 **자동화 가능**(아래 §4 backlog A+B). → bidirectional 전파 비채택 확정.

### 2.3 C2 — unified quality/risk register **비채택** (분리 SSOT + read-model)

antipatterns/migration-cautions/static-security/legacy-spectrum/SATD = 의도적 node-granular trust-tier 분리(R19 `evidence_trust` / self_recognized / LLM·static). 단일 SSOT 병합 = provenance 붕괴. 통합 "한눈에" needs 는 `findings-aggregator` read-model 로 이미 충족. → SSOT 분리 유지 + 통합은 read-model 레이어만.

### 2.4 C3 — lift-order **option (a)**: data-first 유지 + code-graph 조기화

`analysis.phase-flow.json` 실측: "structure"는 두 의미 — Pennington Program Model(제어흐름) = **code-graph**(`cross_cutting.aspects` applies_to:all = 미정렬 + trust-격리 reference-lens / gate inject 금지) vs **architecture phase**(모듈/레이어 / `depends_on:[discovery, db-schema]` = data-first). code-graph 조기화는 **무비용**(depends_on 무변경 / 위상정렬 byte-동일). architecture 의 data-first 는 모듈↔테이블 결정론 매핑이 BC 후보 seed → data-centric legacy(주 타깃)에 타당. → **data-first architecture 유지 + code-graph(제어흐름)를 분석 진입 시 cross-cutting reference-lens 로 명시 조기화**(문서/디스패치 관례 변경만). 재배치(option c) = 비채택(유일하게 결정론 순서 변경 + 두 의미 혼동).

### 2.5 진짜 델타 7개 (refute 생존 / ROI 순 / 미구현 = backlog)

1. **Signal-driven scope-carve** (MISSING / 최대 갭) — scope 컨테이너(work-unit-manifest + soft gate #0)는 완비, carve **알고리즘** 부재. carve research(2원칙) 결론: 결정론·reference-lens 적격 = **3신호**(Tarjan SCC = atomic+추출순서 / Martin Ca·Ce·I·D = seam·hub·sink, 임계 soft gate / VCS co-change = 유일 git-only + legacy iBATIS 정적-blind 정조준). **부적격 2신호**(Bunch MQ = 확률적 비재현 / EventStorming = human-judgment 워크숍 → 자동 재구성=no-simulation 위반 소지) = human-in-loop / low-trust only.
2. **build/run/env-config manifest + 산출물 secret-scan** (MISSING) — "run" 운영 컨텍스트(P0)의 positive manifest 부재 + 방출 `.ai-context` 산출물 secret/PII 스캔 부재(실증 리스크: 산출물에 secret verbatim 복사 finding 기록). no-simulation 준수(실 gitleaks/regex) + R19 Tier 분류 필요.
3. **Recovered-ADR + `rationale_status:unknown`** (MISSING) — legacy 과거 결정 발굴 + 복구불가 WHY 정직 abstain. `task-plan.adrs[]`=forward 전용. abstention 어휘 = `discovery-spec` intent_certainty 재사용(신규 enum ❌).
4. **Hotspot prioritization (churn×complexity)** (MISSING) — git-only 결정론 reference-lens. S0 carve 와 묶음.
5. **기존 테스트 = 증거 채널** (MISSING) — ⚠️ 1차 착수서 R15 결합 발견(§2.6).
6. **inquiry/hypothesis log** — ⚠️ 범주 정정(§2.6).
7. **decision-gated 3종** (intent round-trip / dynamic-trace / app-code fitness) — trust·R19 충돌 → 사용자 결단 보류.

### 2.6 1차 착수 결과 (사용자 "저리스크부터") + 재분류

diagnose-before-design 를 갭분석 권고 자체에도 재귀 적용 → 저리스크 enum 3건 중 1건만 깨끗:

- **db-schema 컬럼 `sensitivity`** ✅ **적용**(`db-schema.schema.json` / optional enum public·internal·pii·credential·regulated·unknown). grep 전수 미참조 = 고립 / 컬럼 객체 open → 순수 additive. 델타 #2(secret-scan) + D3 active data dictionary 의 스키마 레이어. **main 반영**(commit `59ec67e4`) / release-readiness 무영향(37/41 — schema·graph·lockstep·analysis-validator 전수 통과 / 유일 실 fail=무관 pre-existing skill citation) / CHANGELOG 미기재 = §8.1 corroboration 전 의도적(델타 #2 정식 DEC 시 version+CHANGELOG 포착).
- **characterization `existing_test_file` enum** ⏪ **되돌림** — `characterization-coverage-validator/src/validator.js:471` 하드코딩 `REAL_SOURCE_STATUSES` 결합 → enum-only 추가 시 real_* cross-check + code_only carry **둘 다 우회 = R15 silent-simulation 가드 구멍**. "additive" 액면 분류가 틀림 → R15 evidence 정책 결정 + validator 동시 변경(M-size) 필요.
- **finding-system `finding_type` enum** ⚠️ **보류·범주 정정** — finding-system = "PoC dogfooding 명세 빈틈" 거버넌스 도구(`finding-system.md` §1) ≠ 역공학 분석가의 per-project inquiry log. 추가 = 범주 오염. inquiry log = **신규 산출물** 결정(저리스크 아님).

## 3. 근거

- **diagnose-before-design**(기존 자산 실측 + trust 정책 충돌 대조)이 bidirectional-sync 오채택을 차단 — 외부 합성의 disposition 을 액면 수용했으면 ~70% 재발명. 갭분석 **권고 자체**에도 재귀 적용(existing_test_file/finding_type 재분류)이 R15 구멍·범주 오류를 차단.
- **C1 forward-only** = 수학적 근거(confluence/idempotency)로 의도된 설계 / lift = 코드→산출물의 올바른 시점 처리. bidirectional 은 일부러 제거한 실패 모드 재유입.
- **C3** = Pennington 은 제어흐름 레벨(연구가 실제 지지)에서 honoring 가능 / 데이터-vs-모듈 우선순위는 data-centric legacy 타깃에 맞춰 data-first 유지.
- **no-simulation**: carve 신호 중 EventStorming 자동 재구성 = human 활동 시뮬 → measured fact 제시 금지(low-trust). 산출물 secret-scan = 실 도구(LLM 판단 ❌).
- **§8.1 단일 PoC 과적합 회피**: 채택 델타(carve/hotspot/recovered-ADR)의 본체 격상 = ≥2 distinct 도메인 PoC corroboration 후.

## 4. 잔여 open + backlog (구현 = 별도 per-delta DEC)

- **C1 enhancement (forward-only 보존)**: ⒜ trigger 자동감지(기존 `gitDiffNumstat`+`revisit-detect` 재사용, 손수정 코드를 lift 후보 surface 로 라우팅) ⒝ degenerate refactor(빈 forward closure+content_drift only+coverage) auto-climb.
- **§7 prose stale 정정 ✅ 완료**(저리스크 정리): `living-sync §7` 의 lift/reconcile/cross-scope-drift 를 "현재 시행분"으로 이동, merge-back=OBVIATED 명기, "미배선"은 lift 자동 트리거·fixpoint 자동 재진입·per-item granularity 로 정정(버전 토큰 회피 = shipped provenance 가드 정합).
- **sync-loop --git 갭 조사 결론(bug vs policy) ✅ 완료**: `resolveOriginNodeIds`(`sync-loop.js:96-105`)가 코드파일을 IMPL 노드로 해소 → `computeSyncLoop` forward-only BFS(`:164` includeBackward:false). IMPL=forward-leaf → **빈 closure = no-op**. **잘못된 mutation 없음 / forward-only 불변 유지 → 데이터 손상 버그 ❌**. 정체 = 알려진 **auto-trigger 미배선 갭**(코드 변경이 의미천장으로 안 올라가고 silent no-op). mitigation = §7 doc 명시(완료) + 코드→lift auto-routing(C1 ⒜ 미래). 코드 변경 ❌(behavior 변경 = 정책 / C1 enhancement backlog 에서 처리).
- **R15 evidence 정책**(델타 #5): existing_test_file 이 "real source(파일 존재/실행 검증 의무)"인지 결정 + `REAL_SOURCE_STATUSES` 동시 변경.
- **신규 산출물 결정**: recovered-ADR(델타 #3) / per-project inquiry-hypothesis log(델타 #6) — finding-system 확장 ❌, 별개 산출물.
- **decision-gated 3종**(델타 #7): intent round-trip(WARN-only, gate ❌) / dynamic-trace(R19 Tier-2 import만) / app-code fitness(R19 allowlist 확장) — 사용자 결단.
- **C3 sub**: modern thin-DB 시 architecture 의 db-schema hard edge 를 soft 로 완화할지 / code-graph-first 강제(hook) vs 관례.

## 5. 검증 / 상태

- **릴리스 ❌**(plugin.json 무변경 / CHANGELOG 무변경 — 결정 포착 단계). 코드 변경 = db-schema `sensitivity` additive 1건(JSON 파싱 OK / 컬럼 객체 open·optional → 기존 fixture 회귀 0 / 어떤 validator 도 미참조 = 고립). ajv 정식 검증은 worktree 미설치로 미실행(구조적 안전 + grep 고립 근거).
- characterization-spec / finding-system = **무변경**(실험 되돌림 / 보류).
- 본 DEC = blueprint+결정 포착(`DEC-2026-06-07-living-sync-operating-model` 동형 Phase 0). 델타 격상 = 각 ≥2 PoC corroboration 후.

## 6. caveat (정직)

- 갭 verdict 의 MISSING 판정 = repo-wide grep(0건) + 최유력 후보 직독 (≈55 스키마 전수 통독 아님 / grep 경계 내).
- C1/C3 심층 조사 = drift-validator/chain-driver empirical 미실행(hand-read + STATUS.md corroboration). `sync-loop --git` 갭 = 테스트/dogfood 로그 발화 미확인 = **latent 갭**.
- carve research = agent 가 URL 독립 재fetch 미수행(원 verified 플래그 인용 / 1차 출처 신뢰도는 research 본문).
- per-edit ceremony 비용 = 코드 구조 기반 정성(PoC 실측 아님 / 단일 dogfooder 단계). 비교 대상 bidirectional 모델은 미구현 = 구조적 추론.
- 외부 합성(Part B)은 [연구근거]/[추론] 혼재 — 산출물 disposition 은 generic baseline 기준(현행 24산출물과 다름).

## 7. 인용

- spec/draft: `methodology-spec/reverse-engineering-methodology.md`
- plan/research: `.claude/plans/plan-reverse-engineering-methodology.md` · `.claude/plans/research-reverse-engineering-carve.md`
- 코드: `schemas/db-schema.schema.json`(sensitivity) · `tools/chain-driver/src/lift-anchor.js`·`cli.js`(cmdLift)·`sync-loop.js` · `tools/characterization-coverage-validator/src/validator.js:471` · `flows/analysis.phase-flow.json` · `skills/analysis-code-graph/SKILL.md`
- 관련 DEC: DEC-2026-06-07-living-sync-operating-model · DEC-2026-06-06-tool-allowlist-pmd-only · DEC-2026-05-18-runtime-tool-exclusion · DEC-2026-05-28(codegraph reference-lens)
- memory: `feedback_diagnose_before_design_check_existing` · `feedback_axis_split_severity_reevaluation` · `feedback_research_fact_validation` · `project_reverse_eng_methodology_gap`
