# plan — 역공학 분석 방법론 본체 갭 반영

> **상태**: 결정 포착 완료 → [`decisions/DEC-2026-06-09-reverse-eng-methodology-gap.md`](../../plugins/context-ops/decisions/DEC-2026-06-09-reverse-eng-methodology-gap.md) (INDEX 등재). CONFLICTS C1·C2·C3 처분 사용자 확정. **델타 구현 = 별도 per-delta DEC + ≥2 PoC corroboration 후(§8.1) — 본 plan 은 그 backlog SSOT**.
> **트리거**: 사용자 지시 — "역공학 관점 체계적 분석 방법론 / step별 / 대형은 스코프 분해 / 산출물 7개 국한 해제". 최우선 지시.
> **선행 산출**: 외부 연구 합성 + repo 갭 분석 = [`methodology-spec/reverse-engineering-methodology.md`](../../plugins/context-ops/methodology-spec/reverse-engineering-methodology.md) (Part A 갭분석 = 권위 / Part B 연구합성 = reference).
> **방법**: 다중 에이전트 워크플로우 2회(연구 합성 → repo 갭 진단 w/ 적대적 refute). diagnose-before-design 적용.

## 1. 결론 요약

외부 연구로 "이상적" 역공학 방법론(스코프-바깥 + 추상화-안쪽 중첩 6단계 + 12산출물)을 설계한 뒤, 본 레포 현행 자산(analysis 24산출물 + chain harness 6-stage + living-sync)에 대조했다.

- **~70% 이미 더 엄밀하게 존재** — code-graph / behavior-spec / characterization-spec / business-rules(DMN) / traceability-matrix / domain+glossary / federation / deterministic-vs-LLM split / intent↔observed 분리 등.
- **2건 의도적 설계와 충돌(CONFLICTS)** — bidirectional sync(forward-only 폐기) / unified risk register. 둘 다 **채택 ❌, 재해석**.
- **진짜 델타 = 7개** (refute 생존). ROI 상위 4개 채택 가치 / 3개 사용자 결단(trust·R19 충돌).

## 2. CONFLICTS 처분 (채택 ❌ — 근거 명확)

| # | 제안 | 레포 현실 | 처분 |
|---|------|-----------|------|
| C1 | discipline#3 "bidirectional sync, forward-only 폐기" | `living-sync-operating-model.md` forward-only = confluence/idempotency/no-ping-pong 의도 설계. 손수정 코드→산출물은 §4 lift/reconcile("의미 천장")이 이미 해결(`lift-anchor.js` 출하) | **비채택**. lift 로 재해석. 유일 잔여 = lift 트리거 **자동 감지**(§7 미배선) = forward-only 보존 enhancement |
| C2 | D8 "unified quality/risk register"(4→1 병합) | antipatterns/migration/static-security/legacy-spectrum/SATD = 의도적 node-granular trust-tier 분리(R19 evidence_trust / ADR-009). 병합 시 provenance 붕괴. 통합 VIEW 는 이미 `findings-aggregator` | **비채택**. read-model 집계만(merged SSOT 산출물 ❌) |
| C3 | discipline#1 "structure-first(Pennington)" | `analysis.phase-flow.json` 위상정렬 = **data-first**(architecture depends_on db-schema → 모듈↔테이블 매핑). 둘 다 의도적 | **사용자 결단**(현행 유지 vs 재논의) |

## 2-b. C1·C3 심층 재논의 결론 (코드 근거 / 사용자 요청 "C1 비용 재검토 + C3 더 논의")

### C1 — lift ceremony 비용: **과중하지 않음 → bidirectional 여전히 불필요**

`lift-anchor.js` / `cli.js cmdLift` 실측: lift는 2레이어. **Layer 1**(anchor 해소 + backward 천장 후보 enumeration) = **이미 결정론·자동·무비용**(graph reachability, LLM 0). **Layer 2**(의미천장 *선택*) = 사람, 의도적(auto-climb 금지 = 날조 회피 / `lift-anchor.js:5`). 비용은 **대부분 비례적**, 단 2곳만 과중:
- (a) **trivial refactor** = ceiling=IMPL이라 forward closure 빈→재생성 0이지만, 한 줄 rename도 "lift 호출+IMPL 확인" 제스처가 고정 부과(과중 체감).
- (d) **bulk mixed-intent** = `--ceiling` 단일값이라 혼합 의도를 한 번에 표현 불가 → 쪼개야 함(최악).

→ 두 과중 지점 모두 **forward-only 보존하며 자동화 가능**:
- **A (trigger 자동감지)**: 이미 있는 `gitDiffNumstat` + `revisit-detect` 의 `src/**→implement` 분류기 재사용 → 손수정 코드를 lift 후보 surface로 라우팅. **잠재 갭 동시 해소**: `sync-loop --git`이 `code_pointers` 매치로 손수정 소스를 IMPL forward **origin**으로 취급 → backward 천장 climb 건너뜀(기술상 forward-only지만 lift 목적 무력화 / `sync-loop.js:91-104`).
- **B (degenerate refactor만 auto-climb)**: forward closure 빈 + content_drift only + 하류 coverage 존재 시 ceiling=IMPL 자동확정 = reconcile-only. 사람 제스처 제거.
- **사람 유지**: non-empty closure(behavior/rule)의 천장 선택 = 환원 불가 의도 판단.
- **defer C**: bulk batch auto-apply.

**§7 prose stale**: lift/reconcile는 STATUS.md상 v0.8~0.10 shipped인데 `living-sync §7`은 "미배선"으로 기술 → **유일 진짜 미배선 = auto-trigger**. 문서 정정 대상.

→ **C1 처분 확정: bidirectional 비채택**(비용은 작고 A+B로 자동화 가능, confluence 보존). A+B + §7 정정 + sync-loop --git 갭 = enhancement backlog.

### C3 — data-first vs structure-first: **가설 확인 → 충돌 대부분 해소, option (a) 권고**

`analysis.phase-flow.json` 실측: **"structure"는 실제로 두 의미**. Pennington Program Model = 제어흐름 = **code-graph**(= `phases[]` 노드 아님, `cross_cutting.aspects` applies_to:all = **미정렬 cross-cutting** / `:144-146`). 레포의 **architecture phase** = 모듈/레이어 구조(`depends_on:[discovery, db-schema]` = data-first / `:49`).
- code-graph는 이미 cross-cutting + **trust-격리**(reference-lens / gate inject 금지 `SKILL.md:19`) → **조기화가 무비용**(depends_on 무변경 / 위상정렬 byte-동일).
- 진짜 잔여 충돌은 좁음: architecture(모듈) phase가 db-schema 뒤. 근거 = 모듈↔테이블 결정론 매핑이 business-logic의 BC 후보 seed(`architecture.md:9,111`). 단 이 edge는 input 표에서 **권장(soft)**인데 depends_on에선 hard = 잠재 불일치.
- architecture는 자기 import 그래프를 Tree-sitter + Tarjan SCC로 직접 생성(`architecture.md:34-42`) → code-graph 불필요(중복 reference-lens).
- 프로젝트 유형: data-centric legacy(DB=도메인)엔 data-first 유리 / modern thin-DB엔 약하나 무해(edge soft).

→ **C3 처분 권고: option (a)** — data-first architecture 유지 + **code-graph(제어흐름)를 분석 진입 시 cross-cutting reference-lens로 명시 조기화**. Pennington을 제어흐름 레벨(연구가 실제 지지하는 레벨)에서 honoring + depends_on 무변경 + 문서/디스패치 관례 변경만. **option (c) 재배치는 비권고**(유일하게 결정론 순서 변경 + 두 의미 혼동).

## 3. 진짜 델타 (ranked / ROI 순)

| 순위 | 델타 | verdict | 붙일 자산 | 크기 | DEC |
|------|------|---------|-----------|------|-----|
| 🥇1 | **Signal-driven scope-carve** (S0 carve 알고리즘) | MISSING | `chain-driver/src/cli.js` ensureScopeDir 위 pre-init helper(skill). 출력=reference-lens(gate inject ❌) | L | ✅ |
| 🥈2 | **build/run/env-config manifest + 산출물 secret-scan** | MISSING | 신규 analysis 산출물 schema + PostToolUse 스캐너 over `.ai-context/output/**`. D3 sensitivity 조율 | M | ✅ |
| 🥉3 | **Recovered-ADR rationale + `rationale_status:unknown`** | MISSING | 신규 analysis 산출물. abstention 어휘 = `discovery-spec` intent_certainty + human_review_required **재사용**(신규 enum ❌) | M | ✅ |
| 4 | **Hotspot prioritization** (churn × complexity) | MISSING | discovery reference-lens 출력(git log + complexity proxy). S0 carve 와 묶음 | S | (S0 흡수) |
| 5 | **기존 테스트 = 증거 채널**(test-recovery) | ✅ **official v0.35.0** | `data_source_status` `existing_test_file` enum + REAL_SOURCE_STATUSES 편입(R15 RUN 의무 가드) / DEC-2026-06-10-test-recovery-existing-test-evidence / Senior GO@0.88 | M | ✅ |
| 6 | ~~inquiry/hypothesis `finding_type` enum~~ | ✅ **REFRAME/DROP** | finding-system=governance 확정(범주 오염) + 가설캡처 deliverable-attached 분산 커버 + AX-native redundant → 신규 deliverable·enum ❌ / DEC-2026-06-10-inquiry-log-reframe-dissolve(코드 0 / F14·F16 DISSOLVE 동형) | — | ✅(DROP) |
| 7 | **decision-gated 3종** (intent round-trip / dynamic-trace / app-code fitness) | ✅ **DEFER-verified** | dynamic-trace·app-code fitness=빌드 불가(R19+no-unrunnable-tool-citation / 실행 driver 0) · intent-roundtrip=§8.1 추측(demand 0). 재검토 trigger 명시 / DEC-2026-06-10-decision-gated-defer-verified | — | ✅(DEFER) |

> **역공학 델타 라인 완전 종결 (2026-06-10)**: #1 scope-carve(official v0.27.0) · #2a run-manifest + #3 recovered-ADR(official v0.34.0) · #2b secret-scan(live check42) · #4 hotspot(scope-carve 흡수) · #5 test-recovery(official v0.35.0) · #6 inquiry-log(REFRAME/DROP) · #7 decision-gated(DEFER-verified / trigger 명시). diagnose-before-design 이 #1·#4·#2b 기격상·#6 redundant·#7 정책충돌 을 모두 실측으로 차단 — 액면수용 시 재발명/scope-creep/R19 위반 회피. **backlog 0 잔여.**

### 델타 상세 (착수 시 참조)

**🥇1 scope-carve**: 신호 5종 = EventStorming pivotal-event(LLM heuristic — 신중) / Martin Ca-Ce-Instability / SCC(기존 Tarjan 재사용) / VCS change-coupling(git 저렴) / Bunch MQ. carve 출력은 code-graph 선례(DEC-2026-05-28)대로 **reference-lens 고정** — 사용자가 soft gate #0 에서 확정. trust 위반(gate inject) 절대 회피.

> **Phase 0 진행 (2026-06-09)**: per-delta DEC 작성 = [`DEC-2026-06-09-scope-carve-3signal-reference-lens.md`](../../plugins/context-ops/decisions/DEC-2026-06-09-scope-carve-3signal-reference-lens.md) (INDEX 미해결 등재). 1원칙 자산 실측(workflow 7-reader) 완료 — **정정 2건**: ⒜ "기존 Tarjan 재사용" 가정 = **틀림**(repo Tarjan·Martin 구현 전무 / `architecture.schema.json` tarjan_scc = aspirational label) → carve tool 이 자체 구현. ⒝ "VCS change-coupling = git 저렴" → 기존 `gitDiffNumstat` 은 **point-to-point**(역사 co-change 아님) → `git log` 이력 logical-coupling mining 신규(makeGitRunner plumbing 만 재사용). 추가 결단: Martin **A·D abstain**(architecture.json 에 abstractness 부재 = no-simulation) → 1차 = Ca/Ce/I. 형태 = standalone tool+skill(chain-driver 무수정). DEC §6 **일괄 승인 묶음 4결단 대기 → 승인 후 Phase 1 코드 착수**.

**🥈2 build/run/env + secret-scan**: (a) "어떻게 build/run/configure" positive manifest(migration-cautions 는 negative 경고만). (b) 방출 산출물 secret-scan — 실증 리스크(br-cross-consistency 가 산출물에 `SECRET="..."` verbatim 복사한 finding 기록 존재). no-simulation 준수(실 gitleaks/regex, LLM 판단 ❌) + R19 Tier 분류 명시.

**🥉3 recovered-ADR**: legacy 과거 결정 발굴 + 복구불가 WHY 정직 abstain. `task-plan.adrs[]`=forward 전용(unknown 없음). no-simulation honesty("없는 상위 의도 날조 회피") 정합.

## 4. 사용자 일괄 승인 묶음 (3원칙 / 5~6 핵심 결정 / Auto Mode 호환)

1. **scope-carve 채택 범위**: 5신호 전부 vs 저비용 우선(churn + SCC + change-coupling) 먼저. reference-lens 고정 + soft gate #0 연결. → **DEC**
2. **build/run/env manifest + secret-scan**: 신규 analysis 산출물 + PostToolUse 스캐너(`.ai-context/output/**`) + R19 Tier 분류. D3 sensitivity 필드 조율. → **DEC**
3. **recovered-ADR**: 신규 산출물 vs 기존 필드 확장 / intent_certainty 어휘 재사용 확정. → **DEC**
4. **additive enum 일괄(저리스크)**: characterization `existing_test_file` + finding-system `finding_type` + db-schema column sensitivity. → DEC 없이 enhance(승인만)
5. **CONFLICTS 처분 확인**: bidirectional sync 비채택(lift 재해석) + lift auto-detect 만 enhance / D8 read-model 만 / lift-order(data-first) 현행 유지 vs 재논의.
6. **decision-gated 보류**: intent round-trip(WARN-only, gate ❌) / dynamic-trace(R19 Tier-2 import 만) / app-code fitness(R19 allowlist 확장). 본 라운드 보류 여부.

> **§8.1 단일 PoC 과적합 회피**: 채택 델타(carve/hotspot/recovered-ADR)의 실 가치는 ≥2 distinct 도메인 PoC corroboration 후에만 본체 격상. 1차 = schema/skill draft + 1 PoC dogfood.

## 4-b. 1차 착수 진행 현황 (저리스크 batch / 사용자 승인 "저리스크부터")

저리스크 additive enum 3건을 착수했고, diagnose-before-design 재귀 적용으로 2건이 재분류됐다.

| 항목 | 결과 | 근거 |
|------|------|------|
| **db-schema column `sensitivity`** | ✅ **적용** (`db-schema.schema.json` / optional / enum public·internal·pii·credential·regulated·unknown) | grep 전수 — 어떤 validator/스키마도 미참조 = 완전 고립. 컬럼 객체 `additionalProperties:false` 없음 → 순수 additive. 델타 #2(secret-scan) + D3 active data dictionary 의 스키마 레이어 |
| **characterization `existing_test_file` enum** | ⏪ **되돌림 → R15 결단 격상** | `characterization-coverage-validator/src/validator.js:471-481` 하드코딩 `REAL_SOURCE_STATUSES` set 존재. enum 만 추가 시 existing_test_file 스냅샷이 real_* cross-check + code_only carry **둘 다 우회 = R15 silent-simulation 가드 구멍**. evidence 요구(테스트 파일 존재/실행 검증) 정책 + validator 동시 변경 필요 = M-size. 순수 additive 아님 |
| **finding-system `finding_type` enum** | ⚠️ **보류 → 범주 정정** | `finding-system.md` §1 — finding-system = "PoC dogfooding 중 방법론이 막히는 명세 빈틈" 기록 = 방법론 거버넌스 도구. 역공학 분석가의 per-project inquiry/hypothesis log 와 **다른 범주**. finding_type 추가 = 범주 오염/scope creep. inquiry log 는 **신규 산출물** 결정(저리스크 아님) |

**carve research(델타 #1, 2원칙) 완료** → [`research-reverse-engineering-carve.md`](research-reverse-engineering-carve.md). 결정론·reference-lens 적격 = **3신호**(Tarjan SCC = hard 제약/atomic+추출순서 / Martin Ca·Ce·I·D = seam·hub·sink 랭킹, 임계는 soft gate / VCS co-change = 유일 git-only + legacy iBATIS 정적-blind 정조준). **부적격 2신호**: Bunch MQ(확률적 비재현 — seed 미고정) / EventStorming(human-judgment 워크숍, git-only 불가, 자동 재구성=no-simulation 위반 소지) → human-in-loop / low-trust only. → 델타 #1 = **3신호 1차 carve helper** 로 좁힘.

## 5. 1원칙 — 깊은 숙지 대상 (착수 시 전수 조사)

- **SSOT**: `plugin-charter.md`(R1~R18 / P8 gitleaks backlog) · `lifecycle-contract.md` · `use-scenario-taxonomy.md` · `living-sync-operating-model.md`(§4 lift / §7 미배선) · `baseline-delta-operating-model.md` §3(2)
- **flows**: `flows/analysis.phase-flow.json`(depends_on 위상 — lift-order 충돌 근거)
- **schemas**: `work-unit-manifest` · `characterization-spec`(data_source_status) · `finding-system`(finding_type 부재) · `db-schema`(sensitivity 부재) · `discovery-spec`(intent_certainty 재사용) · `task-plan`(forward adrs[]) · `intent-classification`($ref SSOT)
- **tools**: `chain-driver/src/{cli.js,lift-anchor.js,gate-eval.js}` · `context-federator/src/federator.js` · `hooks/hooks.json`(secret matcher 부재)
- **decisions**: `INDEX.md` + DEC-2026-05-28(codegraph reference-lens) · DEC-2026-06-06(PMD-only allowlist) · DEC-2026-06-07(living-sync forward-only)

## 6. 2원칙 — 가벼운 sub-agent research ✅ 완료

carve 신호 5종 실 fetch 완료 → [`research-reverse-engineering-carve.md`](research-reverse-engineering-carve.md). 결정론 3신호(SCC/Martin/co-change) 적격 / 2신호(Bunch MQ/EventStorming) human-in-loop only. (memory `feedback_research_fact_validation` — 단 research agent URL 재fetch 미수행 = 원 verified 플래그 인용 / 1차 출처 신뢰도는 본문 종합)

## 7. 정직 caveat (갭분석 한계)

- **grep-bounded**: rationale_status/existing_test/secret-scan/finding_type MISSING 판정 = repo-wide grep(0건) + 최유력 후보 직독. ~55 스키마 전수 통독 아님.
- **carve 신호 미검증**: 5신호 ROI/적합성 = 2원칙 research 미수행. EventStorming pivotal-event 는 LLM heuristic 성격이라 결정론 carve 와 결이 다를 수 있음.
- **federation 잔여**: S5 EXISTS 로 drop 했으나 "scope merge-back" = living-sync §7 미배선 carry.
- **D9 liveness-ledger 부분충돌 미정량**: persistent ledger vs derived/idempotent drift 모델 충돌 범위는 설계 시 정밀 확인.
- **decision-gated 3종 비용 미측정**: trust/R19 충돌만 식별 / 실 구현비용·FP율 미측정.

## 8. Lessons Learned (4원칙 — 실패 시 기록)

- **LL-1 (선반영)**: 외부 연구 합성의 disposition(ADD/DROP)을 그대로 신뢰하면 ~70% 재발명 위험 — diagnose-before-design(기존 자산 실측 + trust 정책 충돌 대조)이 bidirectional-sync 오채택을 차단함. (memory `feedback_diagnose_before_design_check_existing` 재확인)
- **LL-2 (1차 착수 중 발견)**: 갭분석이 "S-size additive enum DEC 불요"로 분류한 `existing_test_file` 가 실제로는 R15 silent-simulation 가드(`REAL_SOURCE_STATUSES` 하드코딩)에 결합 — enum-only 추가 시 가드 구멍. **"additive 라는 액면 분류도 검증 대상"** (memory `feedback_axis_split_severity_reevaluation` 동형 — cosmetic 추정이 structural 격상). 스키마 변경 전 validator 하드코딩 grep 의무.
- **LL-3 (1차 착수 중 발견)**: 갭분석 "inquiry/hypothesis = finding_type enum" 은 범주 오류 — finding-system 은 방법론 dogfooding spec-gap 기록이지 per-project 분석 산출물 아님. diagnose-before-design 은 갭분석 자체의 권고에도 재귀 적용해야 함(자산 정의를 실제 읽기 전엔 "어디에 붙인다"를 신뢰 ❌).
