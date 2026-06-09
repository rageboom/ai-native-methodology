# 역공학 분석 방법론 — 연구 합성 + 레포 갭 분석 (draft / reference)

> **상태**: 연구 **draft + reference 자산**. 본체 SSOT 아님 (`lifecycle-contract.md` / `plugin-charter.md` 등이 SSOT). 본 문서 격상 = plan + 사용자 승인 + DEC 후.
> **출처**: 외부 학계·업계 리서치 다중 에이전트 합성 (2026-06-09 / Chikofsky&Cross·Pennington·von Mayrhauser·Feathers·OORP·Tornhill·Evans·DMN·SCIP·RepoGraph 등 fetch 근거). 표기 [연구근거]/[프로젝트맥락]/[추론] = Part B 참조.
> **⚠️ 레포 정합 경고**: Part B(연구 합성)의 산출물 disposition(ADD/DROP/KEEP)은 **generic 7-baseline 기준**이며, 본 레포 **현행 자산**(analysis 24산출물 + chain harness 6-stage + living-sync)과 다르다. 대조 결과 **~70%는 이미 더 엄밀하게 존재**. 특히:
>   - Part B §discipline #3 "bidirectional sync (forward-only 폐기)" = **채택 ❌**. 레포 `living-sync-operating-model.md` 의 forward-only 불변식은 confluence/idempotency 를 위한 의도적 설계이고, 제안의 정당한 needs(손수정 코드→산출물 갱신)는 §4 lift/reconcile("의미 천장")이 이미 더 엄밀히 해결.
>   - Part B §4 "산출물 12개 재설계" 의 ADD 대부분(D0/D1/D2/D4/D5/D5b/D7) = 이미 존재.
> **권위 있는 정합 결론 = 아래 [Part A — 레포 갭 분석]** (repo 실측 기반). Part B 는 그 근거가 된 원 연구 합성(미정합).
> **다음 액션**: Part A 의 진짜 델타 7개 → [`plan-reverse-engineering-methodology.md`](../../../.claude/plans/plan-reverse-engineering-methodology.md) → 사용자 일괄 승인 → DEC 후보.

---

# Part A — 레포 갭 분석 (repo 실측 / 권위)

All claims verified against the actual repo. The audit and refutation results are accurate. Now I'll write the final report.

# 제안 6단계 + ~12산출물 갭분석 — 최종 보고

## 1. 한 줄 결론

제안 요소(S0–S6 7개 stage · D0–D11+inquiry-log 14개 산출물 · 5 discipline · 5 new-gap)를 모두 진단해 본 결과, **약 70%는 이미 본 레포에 더 엄밀하게 존재**(EXISTS 또는 PARTIAL의 본체 부분)하고, **2건은 의도적 설계와 정면 충돌(CONFLICTS)**하며, **refute 후 살아남은 진짜 델타는 7개**입니다. 이 중 ROI 상위 4개(scope-carve / build-run-env+secret-scan / recovered-ADR rationale / hotspot)가 실제 채택 가치가 있고, 나머지 3개는 사용자 결단(R19·trust 정책 충돌)이 필요합니다.

---

## 2. 전체 매핑 표

verdict 범례: EXISTS = 이미 있음 / PARTIAL = 본체는 있고 일부만 신규 / MISSING = 진짜 없음 / CONFLICTS = 의도적 설계와 충돌.
처분 범례: drop = 이미해결-드롭 / adopt = 신규채택 / enhance = 기존강화 / reframe = 재해석-비채택 / decision = 사용자결단.

### Stages (S0–S6) + scope decomposition

| 제안 | verdict | 기존 자산 | 근거 한 줄 | 처분 |
|---|---|---|---|---|
| **S0** Scope&Carve | PARTIAL | `work-unit-manifest.schema.json`(scope slug) + `chain-driver/src/cli.js` ensureScopeDir + soft gate #0 | scope 컨테이너는 완비 / carve 알고리즘만 부재 | enhance(컨테이너) + adopt(carve) |
| **S1** Structural Lift | PARTIAL | `analysis.phase-flow.json` db-schema/architecture + skills 3종 | 출력은 더 풍부 / 단 순서가 data-first(역순) + data-dictionary 미분리 | enhance |
| **S2** Behavior Lift | PARTIAL | `analysis.phase-flow.json` characterization + 산출물 18/23 + `intent-classification.schema.json` | intent↔observed 분리 이미 완비 / seam-map·dynamic-trace·test-recovery만 부재 | enhance + adopt(sub-gaps) |
| **S3** Domain/Intent/Rules | PARTIAL | `business-logic` phase(domain/BR/DMN) + `decision-table-validator` | per-BC domain+DMN 완비 / recovered-ADR·inquiry-log만 부재 | enhance + adopt(sub-gaps) |
| **S4** Slice Done-Cert | PARTIAL | `chain-driver/src/gate-eval.js` REQUIRED_VALIDATORS + sdlc-4stage gates #0–#5 | per-stage done-cert 완비 / 별도 7항목 체크리스트는 중복 | reframe(체크리스트) + adopt(risk-tiered round-trip) |
| **S5** Merge&Federate | EXISTS | `context-federator/src/federator.js`(28/28) + traceability-matrix-builder + living-sync §6[5] MERGE-BACK | stable-ID join federation 축 이미 도구화 | drop |
| **S6** Living-Sync | CONFLICTS | `living-sync-operating-model.md`(forward-only 불변식) + artifact-graph 4-state | bidirectional 클로즈가 의도적 confluence 설계와 충돌 / 나머지는 이미 있음 | reframe + adopt(CI fitness·auto-detect만) |
| **scope-carve-methodology** | MISSING | 없음(scope = 사용자 자유 kebab slug) | 5개 carve 신호 전부 grep 0건 / Tarjan-SCC는 cycle 탐지 전용 | **adopt(최대 갭)** |
| **hotspot-prioritization** | MISSING | discovery LLM 추측 + revisit-detect git --numstat(LOC만) | churn×complexity 정량 모델 0건 | **adopt** |
| **lift-order**(structure-first) | CONFLICTS | `analysis.phase-flow.json` depends_on 위상정렬 | 레포는 의도적으로 data→structure / 제안은 structure-first(역전) | **decision** |

### Deliverables (D0–D11 + inquiry-log)

| 제안 | verdict | 기존 자산 | 근거 한 줄 | 처분 |
|---|---|---|---|---|
| **D0** scope-slice-manifest | EXISTS | `work-unit-manifest.schema.json` | 컨테이너 완비(carve 신호만 skill급 신규) | drop |
| **D1** code-graph(evidence-only) | EXISTS | `code-graph.schema.json` + `analysis-code-graph` skill | reference-lens/NOT-gate-injected 입장까지 동일(DEC-2026-05-28) | drop |
| **D2** domain+glossary(per-BC) | EXISTS | `domain.schema.json`(ubiquitous_language + bounded_contexts) | per-BC glossary 분할은 minor refinement | drop |
| **D3** schema+data-dictionary(sensitivity) | PARTIAL | `db-schema.schema.json`(description+sources) + sql-inventory business_meaning | semantics·provenance 완비 / column-level PII/sensitivity만 부재 | enhance(additive 필드) |
| **D4** business-rules(DMN) | EXISTS | `business-rules.schema.json` + index/bc + `br-cross-consistency-validator` | 가장 성숙(industry-first cross-validator 포함) | drop |
| **D5** behavior-spec(intent) | EXISTS | `behavior-spec.schema.json`(산출물 18) | intent↔observed 분리가 이미 18 vs 23 설계 | drop |
| **D5b** characterization(observed) | EXISTS | `characterization-spec.schema.json`(산출물 23) | Feathers+Adzic+SATD 합성 완비 / existing_test enum만 부재 | enhance(enum 1개) |
| **D6** ADR(recovered rationale) | PARTIAL→MISSING(핵심) | `task-plan.schema.json` adrs[](forward) + discovery-spec intent_certainty(abstention 유사) | forward ADR만 존재 / reverse-recovered + unknown 상태는 부재 | **adopt(reuse intent_certainty 어휘)** |
| **D7** bidirectional traceability-matrix | EXISTS | `traceability-matrix.schema.json`(산출물 22 / DO-178C) | forward+backward coverage 이미 양방향 | drop |
| **D8** unified quality/risk register | CONFLICTS | antipatterns/migration/static-security/legacy-spectrum/finding-system 분리 스키마 | 통합 = 의도적 node-granular trust/provenance 붕괴 / 통합 VIEW는 이미 findings-aggregator | reframe(read-model만) |
| **D9** reflexion-conformance + liveness-ledger | PARTIAL | `code-pointer-validator` detectContentDrift + graph-freshness + 4-state | drift 탐지 절반 완비 / reflexion-loop·CI-fitness만 신규(persistent ledger는 idempotency와 부분 충돌) | enhance(bidirectional 클로즈 제거) |
| **D10** context-map + cross-slice causal | PARTIAL | `domain.schema.json` v12_reserved(DEFERRED) + artifact-graph edges | DDD Context Map은 의도적 deferral(DDD-Lite B) | **decision(parked gap)** |
| **D11** build/run/env-config + secret-scan | MISSING | 없음(근접: migration-cautions build/infra category) | build/run/env positive manifest 부재 + 산출물 secret-scan 부재 | **adopt** |
| **inquiry/hypothesis log** | PARTIAL | `finding-system.schema.json`(open/candidate/deferred) + `_base-log-finding` SKILL.md | hypothesis는 markdown honor-system / 머신검증 finding_type enum 부재 | enhance(enum 1개) |

### 5 Disciplines

| 제안 | verdict | 기존 자산 | 근거 한 줄 | 처분 |
|---|---|---|---|---|
| **(1)** lift order = structure→data→behavior→domain | CONFLICTS | `analysis.phase-flow.json` depends_on(data-first) | 위상정렬이 architecture depends_on db-schema(모듈↔테이블 매핑) | **decision** |
| **(2)** deterministic-extraction vs LLM split | EXISTS | `gate-eval.js` + `meta-confidence.schema.json` extraction_method enum + STRONG-STOP memory | 게이트층 강제 + per-artifact 기록 / 레포의 핵심 불변식 | drop |
| **(3)** sync truly BIDIRECTIONAL | CONFLICTS | `living-sync-operating-model.md` §2/§3 + `lift-anchor.js` | forward-only는 confluence/idempotency 의도 설계 / §3 상세 | **reframe(채택 ❌)** |
| **(4)** behavior(intent) vs characterization(observed) SEPARATED | EXISTS | 산출물 18 vs 23(cross-linked, ≥2 PoC 입증) | 이미 두 별도 산출물+스키마 | drop |
| **(5)** grounding necessary-not-sufficient + intent round-trip | PARTIAL | br-cross-consistency Layer 2 + characterization oracle | grounding 규율은 있음 / regenerate-and-diff round-trip은 부재 | adopt(gap-intent-roundtrip) |

### New gaps (제안이 명시적으로 신규 주장)

| 제안 | verdict | 기존 자산 | 근거 한 줄 | 처분 |
|---|---|---|---|---|
| **gap-secrets**(산출물 secret/PII 스캔) | MISSING | charter:82 read-time deny(SOURCE) + semgrep pii rule(SOURCE) + charter P8 gitleaks(미출하) | 방출된 .ai-context 산출물 스캔 0건 / hooks.json에 secret matcher 없음 / 실제 누출 사례 기록됨 | **adopt** |
| **gap-intent-roundtrip**(분석단계 정합 체크) | MISSING | lifecycle-contract round-trip(chain-harness codegen) + s2 per_tc_outcome | 모든 round-trip = forward codegen 축 / 분석단계 regenerate-diff 부재 | **decision** |
| **gap-dynamic-trace** | MISSING | error-mapping:58 + architecture:51/104(명시적 scope-out) | 정적 한계 공개 인정 / 동적 트레이서 0건 / R19 충돌 | **decision(Tier-2 import만)** |
| **discipline-test-recovery**(기존 테스트=증거) | MISSING | characterization sources=code+real_db+BR/AP / chain-4는 신규 테스트 생성 | 레거시 테스트를 증거 채널로 harvest 안 함 | **adopt** |
| **rationale_status:unknown**(GAP-rationale-unknown) | MISSING | 없음(근접: intent_certainty + human_review_required) | recovered WHY를 정직하게 unknown 표기하는 construct 부재 | adopt(D6과 동일 항목) |
| **S6-FITNESS**(앱코드 ArchUnit fitness) | PARTIAL | graph-integrity-validator(artifact-graph 대상) + filters.js(ArchUnit 인용만) | artifact-graph fitness는 있음 / 타깃 앱코드 fitness 미실행 | **decision(R19 allowlist)** |

---

## 3. CONFLICTS 상세

### CONFLICT #1 — Discipline #3 "bidirectional sync (drop forward-only)" → **채택 ❌, "이미 더 엄밀히 해결"**

제안의 표면 주장("forward-only를 버리고 양방향으로")은 본 레포의 **의도적·수학적 근거를 갖춘 불변식**과 정면 충돌합니다. 제안이 forward-only를 "한계"로 오인했지만, 실제로는 분석 끝에 양방향 전파를 **검토하고 기각한** 설계입니다.

레포 근거(`living-sync-operating-model.md`, 검증 완료):
- L12: "정상 = 무조건 forward 단방향. … 전파 엔진은 forward 하나뿐."
- L14: "reverse(code→analysis)는 전파의 *방향*이 아니라 '정책 밖에서 발생한 수정을 정상 forward 경로로 되돌리는 복구 단계'다."
- L22: 한 변경 pass = origin에서 바깥으로의 단일 BFS, "순서 무관 동일 결과(confluent)".
- L27: "content_changed 는 단조 증가뿐 → 무한 ping-pong 불가."

양방향 전파를 채택하면 이 설계가 일부러 제거한 실패 모드(non-confluence / ping-pong / SSOT 이중관리)가 **그대로 재유입**됩니다.

**핵심**: 제안의 정당한 needs("손수정 코드가 산출물을 갱신해야 한다")는 **이미 §4 lift/reconcile 경로가 해결**합니다 — 추론이 아니라 출하된 실 명령입니다(`lift-anchor.js` 검증 완료, "forward-only 의 유일 reverse 예외"). 동작:
1. 손수정 코드 → code_pointers 역인덱스로 주인 노드(보통 IMPL) anchor (결정론)
2. 의미를 실제로 바꾼 가장 높은 노드("의미 천장": refactor=IMPL / behavior=BHV/AC / rule=BR)까지 **사람이 확인하며** 상향 (auto-climb 금지 / "없는 상위 의도 날조 회피")
3. 천장부터 정상 forward 재전파
4. `reconcileObserved`: 관측 사실은 결정론 재추출·자동 갱신 / 사람 의도와 충돌하면 **silent overwrite 없이 propose**

즉 제안은 "코드 편집이 문서로 흐른다"(레포 = TRUE, lift 경유)와 "전파 엔진 자체가 양방향이다"(의도적 FALSE)를 혼동했습니다. 처분: **채택하지 말 것. lift/reconcile로 재해석.** 단 하나의 정당한 잔여 델타 = lift 트리거 **자동 감지**(§7 "변경 자동 감지(현재 수동 트리거)" 미배선) — 이건 forward-only를 보존하는 enhancement입니다.

### CONFLICT #2 — lift-order / Discipline #1 "structure-first (Pennington)" → **사용자 결단**

`analysis.phase-flow.json` depends_on 그래프(검증 완료): architecture depends_on `['discovery','db-schema']` → 위상정렬 결과 = inventory → **DATA(db-schema) → STRUCTURE(architecture)** → behavior/domain. 제안의 Pennington 순서는 **structure-FIRST**로, head 순서가 역전입니다. 레포가 data-first인 이유는 architecture가 db-schema에 의존해 "모듈↔테이블 그룹 매핑"을 결정론으로 도출하기 때문입니다. 둘 다 의도적이지만 data-vs-structure 우선순위에서 불일치 → 자동 채택 불가, **사용자 결단** 항목.

### CONFLICT #3 — D8 "unified quality/risk register" → **read-model로만 재해석**

antipatterns / migration-cautions / static-security / legacy-spectrum / characterization SATD는 **의도적으로 분리된 node-granular 스키마**이며 각각 trust/provenance tier가 다릅니다(antipatterns=LLM/static evidence, static-security=R19 real-tool-only `evidence_trust`, SATD=self_recognized intent class). 단일 스키마로 합치면 R19/ADR-009가 일부러 보존한 trust-tier provenance가 붕괴합니다. **통합 VIEW는 이미 finding-system + findings-aggregator로 존재.** 처분: 선택적 집계 read-model로만(merged source-of-truth 산출물 ❌).

---

## 4. 진짜 델타 (ranked shortlist — ROI 순)

refute 후 살아남은 genuine gap만. ROI = (가치 × 채택용이성) / 충돌리스크.

### 🥇 1. Signal-driven scope-carve (S0/scope-carve-methodology) — **assigned area 최대 갭**
- **무엇이 없나**: scope 컨테이너(work-unit-manifest + soft gate #0)는 완비됐으나, 신호 기반으로 슬라이스 경계를 **제안하는 알고리즘**이 전무. 5개 신호(EventStorming pivotal-event / Martin Ca-Ce-Instability / SCC-clustering / VCS change-coupling / Bunch MQ) 모두 grep 0건. scope = 사용자가 손으로 짓는 kebab slug.
- **왜 가치있나**: AX 운영의 진입점인 scope 선정이 현재 100% 인간 추측. 신호 carve는 결정론·evidence-only로 객관화 가능.
- **붙일 자산**: `chain-driver/src/cli.js` ensureScopeDir **위에** pre-init helper(skill) 신설. 출력은 code-graph 선례(DEC-2026-05-28)대로 reference-lens — 결정론 gate에 inject ❌. 사용자가 soft gate #0에서 확정.
- **크기**: L (5개 신호 중 VCS change-coupling + churn은 git만으로 저렴, SCC는 기존 Tarjan 재사용; EventStorming은 LLM heuristic이라 신중)
- **리스크**: 중. carve 출력을 gate에 넣으면 trust 모델 위반. reference-lens 고정 필수.
- **ADR/DEC**: **DEC 필요**(신호 선정 + reference-lens 고정 + soft gate 연결).

### 🥈 2. build/run/env-config manifest + secret-scan (D11 + gap-secrets)
- **무엇이 없나**: (a) "이 시스템을 어떻게 build/run/configure 하나"를 기술하는 **positive** manifest 부재(migration-cautions는 negative-space 경고만). (b) 방출된 `.ai-context` 산출물에 대한 secret/PII 스캔 부재 — hooks.json엔 chain-driver gate hook만, secret matcher 없음(검증 완료). 기존 secret 매치는 전부 Semgrep SOURCE rule.
- **왜 가치있나**: CLAUDE.md P0("LLM이 develop·**run**·modify·evolve")에서 run 운영의 핵심 입력. secret-scan은 구체적 실증 리스크 — br-cross-consistency가 산출물에 `private static final String SECRET = "..."`를 verbatim 복사한 finding 기록 존재.
- **붙일 자산**: 신규 analysis-stage 산출물 schema(build/run/env) + PostToolUse/preflight 스캐너 over `.ai-context/output/**`. D3 sensitivity 필드와 조율.
- **크기**: M (manifest schema = S, secret-scan hook = M)
- **리스크**: 저~중. secret-scan은 no-simulation 준수(실 gitleaks/regex, LLM 판단 ❌) + R19 Tier 분류 명시 필요.
- **ADR/DEC**: **DEC 필요**(신규 산출물 + secret-scan Tier 분류).

### 🥉 3. Recovered-ADR rationale + rationale_status:unknown abstention (D6 / GAP-rationale-unknown)
- **무엇이 없나**: legacy 시스템의 **과거** 설계 결정을 발굴·기록하면서 복구 불가한 WHY를 정직하게 unknown으로 표기하는 construct. `task-plan.adrs[]`는 forward(proposed/accepted/deprecated/superseded)만, unknown 없음. `rationale_status` grep 0건(검증 완료).
- **왜 가치있나**: 레포의 no-simulation/honesty 윤리("없는 상위 의도 날조 회피")와 정합. tribal knowledge를 환각하지 않고 정직 abstain.
- **붙일 자산**: 신규 analysis-stage recovered-ADR 산출물 — 단 abstention 어휘는 **신규 enum을 만들지 말고** `discovery-spec.schema.json` intent_certainty(unverified-intent/source-refuted) + human_review_required 재사용(drift 회피).
- **크기**: M
- **리스크**: 저(기존 abstention 패턴 재사용). 신규 산출물 vs 기존 필드 확장 선택만 결정 필요.
- **ADR/DEC**: **DEC 필요**(신규 산출물 vs 필드 확장 / 어휘 재사용 확정).

### 4. Hotspot prioritization — churn × complexity (hotspot-prioritization)
- **무엇이 없나**: 정량 churn×complexity 핫스팟 랭킹. 현재 우선순위 = discovery의 soft LLM 추측("큰 모듈/핵심 도메인"). git --numstat은 revisit-loop LOC threshold 전용.
- **왜 가치있나**: 결정론·저비용으로 LLM 추측을 evidence로 대체. S0 ordering(foundation→hotspot) 공급.
- **붙일 자산**: discovery phase reference-lens 출력(git log churn + complexity proxy). S0 carve helper와 묶음 가능.
- **크기**: S
- **리스크**: 저. reference-lens 고정.
- **ADR/DEC**: DEC 불요(S0 DEC에 흡수 가능).

### 5. Recover existing tests as evidence (discipline-test-recovery)
- **무엇이 없나**: 레거시 기존 테스트 스위트(assertion/fixture/golden)를 behavior/characterization 복구의 **증거 채널**로 harvest. characterization sources = code+real_db+BR/AP만 / chain-4는 신규 생성.
- **왜 가치있나**: 기존 테스트 = 관측 의도 계약. characterization snapshot + intent-vs-bug 분류 강화. no-simulation 정합(실 테스트 = 실 증거).
- **붙일 자산**: 산출물 23 `data_source_status`에 `existing_test_file` enum 추가(additive) + behavior-spec evidence 채널. (`existing_test` enum 부재 검증 완료)
- **크기**: S
- **리스크**: 저(enum additive). 신규 산출물 아님.
- **ADR/DEC**: 불요(additive enum).

### 6. inquiry/hypothesis log — finding_type enum (inquiry-log)
- **무엇이 없나**: finding-system은 open/candidate/deferred 라이프사이클 보유하나, hypothesis가 `_base-log-finding` SKILL.md markdown honor-system. `finding-system.schema.json`에 머신검증 finding_type enum 부재(검증 완료).
- **왜 가치있나**: hypothesis→confirmed/refuted를 머신검증으로 격상.
- **붙일 자산**: `finding-system.schema.json`에 `finding_type` enum 추가(gap/anti-pattern/hypothesis/validation-result/...). 4번째 중복 register 신설 ❌.
- **크기**: S
- **리스크**: 저(additive).
- **ADR/DEC**: 불요.

### 7. (decision-gated) risk-tiered intent round-trip + dynamic-trace + app-code fitness
세 항목은 **사용자 결단** 필요:
- **gap-intent-roundtrip** (S4 high-risk slice): regenerate-from-intent → characterization baseline과 diff. 단 chain-harness round-trip 축(70~80%)과 §3-A 분석 축 **혼동 금지**(CLAUDE.md "axis 혼동 회피 의무"). 결정론 gate ❌ → FINDING/WARN로만(br-cross-consistency Layer 2처럼). 비용 vs 기존 커버리지 결단.
- **gap-dynamic-trace**: R19 runtime-tool-exclusion과 충돌 → Tier-2 import 패턴만 가능. trust 모델 확장 vs 정직 static-ceiling carry 유지 결단.
- **S6-FITNESS** (앱코드 ArchUnit/dependency-cruiser): R19 PMD-only allowlist 확장 + codegraph cycle/dead-code가 이미 FP로 non-gating인 점과 충돌. 실 결정론 도구 백킹 없으면 gating ❌.

---

## 5. plan.md 착수 개요 (4원칙)

### 1원칙 — 깊은 숙지 대상 파일 (전수 조사)
- **SSOT**: `methodology-spec/plugin-charter.md`(R1~R18 / P8 gitleaks backlog) · `lifecycle-contract.md` · `methodology-spec/use-scenario-taxonomy.md` · `methodology-spec/living-sync-operating-model.md`(§4 lift / §7 미배선) · `methodology-spec/baseline-delta-operating-model.md` §3(2)
- **flows**: `flows/analysis.phase-flow.json`(depends_on 위상 — lift-order 충돌 근거)
- **schemas**: `work-unit-manifest.schema.json` · `characterization-spec.schema.json`(data_source_status enum) · `finding-system.schema.json`(finding_type 부재) · `db-schema.schema.json`(sensitivity 부재) · `discovery-spec.schema.json`(intent_certainty 재사용 후보) · `task-plan.schema.json`(forward adrs[]) · `intent-classification.schema.json`(SSOT $ref)
- **tools**: `chain-driver/src/cli.js`(ensureScopeDir / cmdLift) · `chain-driver/src/lift-anchor.js` · `chain-driver/src/gate-eval.js`(REQUIRED_VALIDATORS) · `context-federator/src/federator.js` · `hooks/hooks.json`(secret matcher 부재 확인)
- **decisions**: `decisions/INDEX.md` + DEC-2026-05-28(codegraph reference-lens) + DEC-2026-06-06(PMD-only allowlist) + DEC-2026-06-07(living-sync forward-only)

### 2원칙 — 가벼운 sub-agent research (Phase 4~6 전략)
- carve 신호 5종 실 fetch(version-pinned): EventStorming(Brandolini) / Martin Ca-Ce-Instability / Bunch MQ(Mancoridis) / VCS change-coupling(D'Ambros) / Tornhill churn×complexity. research 사실 정정 의무(추정 ❌).

### 3원칙 — 사용자 일괄 승인 묶음 (5~6 핵심 결정)
1. **scope-carve 채택 범위**: 5신호 전부 vs 저비용 우선(churn+SCC+change-coupling) — reference-lens 고정 + soft gate #0 연결 (DEC).
2. **build/run/env manifest + secret-scan**: 신규 analysis 산출물 + PostToolUse 스캐너(`.ai-context/output/**`) Tier 분류 — D3 sensitivity 필드 조율 (DEC).
3. **recovered-ADR**: 신규 산출물 vs 기존 필드 확장 / intent_certainty 어휘 재사용 확정 (DEC).
4. **additive enum 일괄**(저리스크): characterization `existing_test_file` + finding-system `finding_type` + db-schema column sensitivity — DEC 없이 enhance.
5. **CONFLICTS 처분 확인**: bidirectional sync 비채택(lift 재해석) / lift auto-detect만 enhance / D8 read-model만 / lift-order는 현행 유지 vs 재논의.
6. **decision-gated 보류**: intent-roundtrip(WARN) / dynamic-trace(Tier-2) / app-code fitness(allowlist) — 본 라운드 보류 여부.

### 4원칙 — 실패 시 Lessons Learned를 plan.md에 기록, 1원칙 재시작.

---

## 6. 정직 caveat

- **grep-bounded**: rationale_status / existing_test / secret-scan / finding_type MISSING 판정은 전수 스키마 통독이 아니라 repo-wide grep(0건) + 최유력 후보 파일 직독에 근거. ~55개 스키마 전부를 읽지는 않음 — 신뢰도 높으나 grep 경계 내.
- **carve 신호 미검증**: 5개 carve 신호의 ROI/적합성은 외부 research(2원칙) 미수행 상태. EventStorming pivotal-event는 LLM heuristic 성격이라 결정론 carve와 결이 다를 수 있음 — research 후 재평가 필요.
- **federation 잔여**: S5는 EXISTS로 drop했으나 "scope merge-back"은 living-sync §7 미배선 last-mile로 명시 carry 존재(federation 축은 있으나 scope 단위 merge-back은 미완) — context-map nicety도 minor 잔여.
- **D9 liveness-ledger 부분충돌 미정량**: persistent accumulating ledger가 derived/idempotent drift 모델과 어디까지 충돌하는지는 설계 시 정밀 확인 필요(re-run=no-op 보존 범위).
- **decision-gated 3종의 비용**: intent-roundtrip / dynamic-trace / app-code fitness는 trust·R19 정책 충돌만 식별했고 실제 구현 비용·FP율은 미측정 — 사용자 결단 전 추가 검증 항목.
- **단일 PoC 과적합 주의**: 본 갭분석은 코드/스키마 정적 진단 기반. carve·hotspot·recovered-ADR의 실 가치는 §8.1대로 ≥2 PoC corroboration로 입증해야 격상 가능.

---

관련 파일(절대경로): `/Users/sangcl/Documents/Development/Study/ai-native-methodology/.claude/worktrees/wizardly-antonelli-b8319d/plugins/context-ops/methodology-spec/living-sync-operating-model.md` · `.../tools/chain-driver/src/lift-anchor.js` · `.../tools/chain-driver/src/cli.js` · `.../tools/chain-driver/src/gate-eval.js` · `.../flows/analysis.phase-flow.json` · `.../schemas/work-unit-manifest.schema.json` · `.../schemas/characterization-spec.schema.json` · `.../schemas/finding-system.schema.json` · `.../schemas/discovery-spec.schema.json` · `.../schemas/task-plan.schema.json` · `.../hooks/hooks.json`

---

# Part B — 외부 연구 합성 (원본 / 미정합 reference)

> ⚠️ 아래는 본 레포 자산 대조 **이전**의 외부 연구 합성. disposition 은 generic baseline 기준 — 정합 결론은 위 Part A. 6단계 프로세스 설계·인지과학 근거·출처 URL 의 **rationale** 로서 보존.

# AI-Native 역공학 분석 방법론 — 통합 최종본

> 세 제안(A 추상화-상승 우선 / B 스코프 우선 / C 운영컨텍스트-우선)을 비평 가이드에 따라 하나로 합성한 결과다. 핵심 결정: **스코프 우선 바깥 루프 + 추상화 상승 안쪽 루프(중첩)**. 코드를 ground truth로 다루는 역공학의 본성을 존중해 sync는 진짜 양방향으로 설계하고, 결정적(deterministic) 추출 산출물과 LLM 추론 산출물을 분리해 신뢰도를 다르게 관리한다. 모든 주장 끝의 표기: **[연구근거]** = fetch된 출처 기반 / **[프로젝트맥락]** = 본 레포 운영모델에서 가져온 것(연구 미검증, 방향성) / **[추론]** = 합성 판단.

---

## 1. 역공학의 본질 — 추상화 상승(abstraction lifting)

### 1.1 역공학 = 위로 올리는 일 (방향이 정의의 핵심)

Chikofsky & Cross(1990)는 역공학을 "제품의 유지보수·개선·교체를 돕기에 충분한 **설계 수준 이해**를 얻는 과정 ... 이 과정에서 시스템을 어떤 식으로든 바꾸지 않는다"로 정의한다. 추상화 레벨은 `구현 → 설계 → 요구 → 개념`으로 올라가며, 역공학은 **위로 올라가고**(extraction-only), 순공학은 내려간다. 재공학(reengineering) = 역공학 다음에 순공학. **[연구근거: Chikofsky & Cross 1990, IEEE Software 7(1):13-17]**

이 한 줄이 우리 방법론의 골격을 박아준다.
- 분석 단계는 **시스템을 변형하지 않는다**(추출만). 코드 생성은 별도 forward chain에서.
- 올리는 순서가 자의적이지 않다. Pennington의 인지 연구가 그 순서를 강제한다(§1.2).

### 1.2 올리는 순서는 인지과학이 정한다 — Program Model 먼저, Situation Model 나중

von Mayrhauser & Vans(1995)가 정리한 6개 인지 모델은 모두 **지식베이스 + 멘탈모델 + 동화(assimilation) 과정**을 공유하고, 전부 "가설을 세우고 → 해결/수정/폐기하는" 가설 루프로 돈다. **[연구근거: von Mayrhauser & Vans 1995 — 전문 검증]**

- Pennington(1987): 낯선 코드는 먼저 **Program Model**(제어흐름 추상)을 만들고, 그 위에 **Situation Model**(데이터흐름 + 실세계 도메인 용어, 예: `pcboards = pcboards - sold` → "판매분만큼 재고를 줄인다")을 올린다. **[연구근거]**
- Brooks/Soloway: 도메인 지식이 있으면 top-down으로 가설 세우고 **beacon**(인식 가능한 코드 단서)으로 검증한다. **[연구근거]**
- **Integrated Metamodel**(대규모 코드에서 유일하게 검증됨): 도메인 모델 + program model + situation model + 공유 지식베이스를 **상호참조(cross-reference)로 묶고**, 프로그래머는 셋 사이를 **자유롭게 전환**한다. **[연구근거]**

→ 그래서 우리 파이프라인은 **구조 → 데이터 → 행위 → 도메인/의도** 순으로 올라간다. 임의 순서가 아니라 "사람이 실제로 이해하는 순서"다. **[추론]**

### 1.3 왜 산출물 = 문서가 아니라 살아있는 LLM 운영 컨텍스트인가

Biggerstaff(1989)의 design recovery는 "코드 + 기존 문서 + 경험 + 도메인 지식으로 설계 추상을 **재창조**"하며 무엇을/어떻게/**왜**(what/how/why)를 담는다. 그리고 **concept assignment problem** — 코드가 "무엇인가"(IS)와 "무엇을 의미하는가"(MEANS) 사이의 간극 — 을 제기한다. **[연구근거: Biggerstaff 1989]**

이 간극이 핵심이다. 산출물이 단순 "시스템 설명 문서"라면 그건 코드의 IS만 다시 적은 것이다. **운영 컨텍스트**가 되려면 MEANS(의도·규칙·왜)를 코드 anchor에 묶어 기계가 탐색·재검증할 수 있어야 한다. LLM 코드 도구 연구가 그 형태를 확정한다:

- **코드는 그래프다**(def/ref/invoke/contain/imports). 유용한 컨텍스트는 임베딩 유사도가 아니라 그래프 k-hop 탐색으로 선택된다(Aider repo-map, RepoGraph, CodexGraph). **[연구근거]**
- 모든 주장에 **evidence anchor**(file:line/occurrence)를 달아 재검증 가능하게(SCIP, StrictCitations 류의 grounding). **[연구근거]**
- **신선도(freshness)가 최대 실패 모드** — 낡은 컨텍스트는 없는 것보다 나쁘다. mtime 무효화 + just-in-time 로딩 + context rot 회피. **[연구근거: Anthropic context-engineering, Aider mtime]**

> ⚠️ 비평이 약화시킨 주장: RepoGraph "~32.8% 평균 상대 개선"은 **SWE-bench 특정 벤치마크/모델**에서 에이전트가 이슈를 푸는 성능 수치이지, "역공학 산출물 세트가 그래프 모양이어야 한다"의 일반 보증이 아니다. 우리는 "그래프 링크가 유사도보다 코드 컨텍스트에 유리하다"는 **방향성 근거**로만 인용한다. **[연구근거 + 추론]**

따라서 산출물 = **Integrated Metamodel을 기계가독·ID링크·증거고정·양방향동기화된 형태로 구현한 것**. AX 운영(LLM이 정확한 컨텍스트로 develop·run·modify·evolve)의 토대가 바로 이것이다. **[추론, 연구 골격 기반]**

---

## 2. 단계별 분석 프로세스 (STEP-BY-STEP)

### 2.1 골격 결정 — 왜 6단계 / 스코프-바깥, 추상화-안쪽(중첩)인가

세 제안의 가장 큰 충돌은 "바깥 루프가 추상화 레벨(A)인가 슬라이스(B/C)인가"였다. 둘은 자유롭게 합성되지 않는다 — A의 gate #1은 "L2 들어가기 전에 슬라이스 전역 L1 완료"를 전제하는데, B는 한 슬라이스 안에서 구조→행위→도메인을 끝까지 간다.

**해법: 선택이 아니라 중첩.** 큰 프로젝트가 1차 목표이고 attention budget(context rot) + Littman의 as-needed 오류가 "한 번에 전체"를 금지하므로, **스코프 우선을 바깥 골격으로** 채택한다(B). 그 슬라이스 안에서 Pennington 순서의 추상화 상승을 **안쪽 루프**로 돌린다(A/C). **[추론, 비평 synthesis_guidance #1]**

결과: **1(바깥 carve) + 4(슬라이스당 안쪽) + 1(바깥 merge) + 1(연속 sync)** = 6 정식 단계(+ 연속 정상상태). 데이터 모델 회복은 A처럼 독립 gate를 주지 않되 C처럼 구조에 묶고 **별도 sub-gate**를 둔다(절충). 모든 단계는 traceability 링크를 **생성하는 즉시** 방출한다(끝에 재구성 ❌ — DO-178C/IEC 62304). **[연구근거 + 추론]**

또한 모든 슬라이스 ceremony는 **티어드(tiered)**: 저위험·저churn 슬라이스는 경량 경로(가벼운 sub-agent)로 처리해 대형 모놀리스에서도 실제 배달 가능하게 한다. **[프로젝트맥락: lightweight sub-agent memory + 비평 gap #8]**

### 2.2 결정적 vs LLM-추론 분리 (환각 통제의 핵심)

세 제안 모두 못 메운 구멍: "grep으로 확인되는 anchor가 있다"(grounding)와 "복원한 의미가 옳다"(correctness)를 혼동했다. 심볼 이름이 grep된다고 그 **해석**이 충실하다는 보증은 아니다(Biggerstaff concept-assignment). **[비평 gap #1]**

본 레포의 chain-driver 규율(tool=결정적 / skill=LLM 의미)을 산출물 분류에 그대로 적용한다 **[프로젝트맥락]**:

| 분류 | 산출물 | 신뢰 정책 |
|------|--------|-----------|
| **결정적 추출** | code-graph, schema, call-graph, traceability 링크, fitness 룰 | 도구가 산출 / multi-run 안정 / gate 권위 가능(단 call-graph는 evidence-only) |
| **LLM 추론** | 도메인 의도, business rule 의미, ADR rationale | 더 강한 grounding + abstention + human gate / 단독 gate 권위 ❌ |

이것이 비평이 지적한 "없던 환각 통제 메커니즘"이다. C가 "drift 감지는 100% 그래프 도달성, LLM 판단 0"이라 한 것은 **구조 레벨에만 참**이다 — 행위·도메인·규칙의 real-model 재추출은 본질적으로 LLM 해석이 들어가므로 순수 결정적 함수가 아니다. 이 framing은 비구조 레벨에서 **삭제**한다. **[비평 weakest_claim #2 + synthesis_guidance #2,#3]**

### 2.3 파이프라인 (6단계)

---

#### Stage 0 — Scope & Carve (스코프 설정 + 슬라이스 절단) · 바깥

| 항목 | 내용 |
|------|------|
| **목표** | 깊은 이해 전에 싸게 전체를 훑고, 큰 코드베이스를 우선순위화된 슬라이스로 절단. 누구의 관심사를 답해야 하는지 + 시나리오 선언. |
| **입력** | 소스 트리(읽기전용), VCS 이력, CODEOWNERS, stale 문서(미검증 가설로만), DB 접근, stakeholder/SME 맵 |
| **활동** | ① 시나리오 선언(S2 AX전환 / S1 재생성 / S3 특성화 / greenfield) — characterization 강도와 의도-확신도를 결정 **[프로젝트맥락 + 비평 conflict #6]**. ② 시간상자 breadth pass (OORP "Read all the Code in One Hour"): 엔티티를 **소스 그대로** 명명, 스멜 플래그. ③ ISO 42010 stakeholder/concern 먼저 — 관심사를 framing하는 산출물만 살린다. ④ **4-신호 절단**: 의미(EventStorming pivotal event + 언어 불일치) / 구조(Martin Ca·Ce·Instability strata + SCC) / 행위(VCS change-coupling support·confidence) / 자동(Bunch MQ 첫 절단). 신호 합의=강한 절단선 / 불일치=취약경계 finding. ⑤ **SCC(순환)는 분할불가 → 한 슬라이스**(Acyclic Dependencies Principle). ⑥ 2단계 순서: foundation(low-Instability, topological 선행) 먼저 → hotspot(Tornhill churn×complexity) ROI 순. change-coupled 슬라이스는 인접 배치. |
| **산출물** | `D0 scope-slice-manifest`(슬라이스 ID·경계·정당화 신호·멤버파일·SME·status·**tier**), `dependency-strata-graph`(SCC 표시), `hotspot-priority-ranking`, first-contact 요약 |
| **Exit Gate #0** | (soft / opt-in fail-closed) 모든 파일이 정확히 1 슬라이스에 매핑(orphan 0) / 모든 SCC가 분할불가 슬라이스로 / 분석순서가 유효 topological sort / 신호 불일치 경계는 명시 수용 또는 재절단. grep_hit_count=0 엔티티명은 gate 차단. |
| **근거** | OORP Setting Direction + First Contact **[연구근거]**, ISO 42010 **[연구근거]**, Tornhill hotspot **[연구근거]**, Martin 메트릭+ADP **[연구근거]**, EventStorming **[연구근거]**, Bunch MQ **[연구근거]**, Anthropic context-rot **[연구근거]**, 본 레포 analysis exit gate #0 **[프로젝트맥락]** |

> 4-신호 "합의=옳은 경계"는 비평이 **과대 주장**으로 분류했다 — clustering 연구는 "경계 품질은 application-dependent"라고만 한다. 합의는 **휴리스틱**으로 쓰되, 진짜 검증은 §3의 merge 후 cross-slice change-coupling이 한다. **[비평 weakest_claim #7]**

---

#### Stage 1 — Structural Lift (Program Model + 데이터) · 슬라이스당 안쪽

| 항목 | 내용 |
|------|------|
| **목표** | 현재 슬라이스의 제어흐름/의존 **구조**를 먼저 회복(Pennington Program Model = 모든 상위 추상의 기반). 영속 데이터까지 같이 회복하되 **별도 sub-gate**. |
| **입력** | 활성 슬라이스 소스, build/import graph, DDL/ORM/마이그레이션 |
| **활동** | ① tree-sitter def/ref → code-graph(invoke/contain/import), 언어 빌트인·서드파티 필터(RepoGraph 방식, 프로젝트 스코프). ② 모든 노드에 **안정 human-readable string ID + file:line anchor**(SCIP) — merge join key. ③ AST 경계 청킹(cAST: 함수 절대 안 쪼갬, concat=원본 verbatim). ④ PageRank류 랭크 repo-map(예산 fit) = 진입 렌즈. ⑤ 영속 데이터 회복(OORP "Analyze the Persistent Data"): schema + active data dictionary(정의·타입·허용값·제약·provenance·ownership·sensitivity). |
| **산출물** | `D1 code-graph`(안정 ID + anchor), `D3 schema + active data dictionary`, ranked repo-map, liveness fingerprint seed |
| **Exit Gate #1 (+ 데이터 sub-gate)** | 구조 reflexion(가설 모델 vs 추출 call/import 그래프 → convergence/divergence/absence). 모든 inventory 심볼 grep_hit_count>0 / 슬라이스 내 dangling ref 없음(문서화된 cut-edge 제외). **데이터 sub-gate**: 모든 schema 요소가 DDL과 ≥1 코드참조 둘 다에 anchor / orphan 테이블·없는 컬럼 참조는 finding. **code-graph는 evidence-only — gate 권위 ❌**(over-approximate, intent-blind). |
| **근거** | Pennington Program Model-first **[연구근거]**, RepoGraph **[연구근거]**, SCIP 안정 ID **[연구근거]**, cAST **[연구근거]**, Aider repo-map+mtime **[연구근거]**, OORP Analyze Persistent Data **[연구근거]**, Murphy reflexion(구조 레벨에서 검증됨) **[연구근거]** |

---

#### Stage 2 — Behavior Lift (Situation Model + 행위 고정) · 안쪽

| 항목 | 내용 |
|------|------|
| **목표** | 구조를 데이터흐름/기능 행위(도메인 용어)로 올리고(Situation Model), **관찰된 실제 행위**를 characterization 테스트로 고정. **behavior-spec(의도)과 characterization 테스트(관찰)는 분리 유지.** |
| **입력** | D1 구조 + D3 데이터, 슬라이스 소스, **기존 테스트 스위트**(증거원 — §4 신규), 실행환경, 정적 모호 지점용 동적 트레이스 |
| **활동** | ① Situation Model 회복 → `behavior-spec`(Gherkin/SBE, 의도된 행위, 실행가능, **dual prose ❌**). ② seam 식별(Feathers Object/Link/Preprocessing) = 안전 주입·절단점. ③ **characterization/golden-master 테스트**(Feathers; Falco/Bache)로 **관찰된** 행위 핀(=change detector, 정답 검증기 아님). ④ **기존 테스트 회복**: 코드베이스의 기존 테스트는 개발자 의도를 직접 인코딩한 고신호·저비용 증거 → behavior-spec의 1차 입력. ⑤ 2-pass: 싼 정적 먼저 → 정적이 모호한 곳(OO 다형성/DI/리플렉션/Spring)만 동적 트레이스. ⑥ intent-vs-bug 분류(시나리오 의도-확신도 사용): 기존 행위에는 **버그도 포함** — 잡되 분리해서 판정. |
| **산출물** | `D5 behavior-spec`(의도) + `D5b characterization/golden-master 테스트`(관찰, **별도 산출물**), seam-map, intent-vs-bug 분류 |
| **Exit Gate #2** | characterization 테스트 GREEN(행위 핀 완료) / 모든 behavior-spec 요소에 anchor + confidence 플래그 / Situation Model이 슬라이스 program goal 도달 / **실패 beacon·설명불가 코드는 STOP + human 요청**(날조 ❌). |
| **근거** | Pennington Situation Model **[연구근거]**, Feathers characterization+seam **[연구근거]**, Falco/Bache golden master **[연구근거]**, Adzic SBE living doc + dual-rep pitfall **[연구근거]**, OORP Step Through Execution **[연구근거]**, Brooks beacon 실패 모드 **[연구근거]** |

> **동적 분석 운영화**(비평 gap #2): SAR/von Mayrhauser는 정적이 런타임 다형성·동적 바인딩에 **눈먼다**고 못 박는다. **충분 증거 기준**을 명시한다 — 동적 트레이스는 (a) seam에서 다형 호출이 정적으로 단일 타깃으로 안 풀릴 때, (b) DI/리플렉션 와이어링이 정적으로 미해결일 때 **의무**. 트레이스 산출물은 capture 명령 + 관찰된 호출 시퀀스를 anchor로 기록. 동적 증거 없이 다형 행위를 주장하면 gate STOP. **[연구근거 + 추론]**

---

#### Stage 3 — Domain / Intent / Rules Lift (Top-Down Model + Rationale) · 안쪽

| 항목 | 내용 |
|------|------|
| **목표** | 추상화 정상 도달 — 코드에서 복원 불가한 **왜**(why). 도메인 모델, bounded-context별 용어집, 실행가능 business rule, 결정 rationale. 운영 **의도** 컨텍스트가 되는 레이어. |
| **입력** | D5 행위 + intent 분류, D1+D3, VCS 이력(rationale), SME(있으면) |
| **활동** | ① Speculate about Design(OORP): top-down 도메인 모델 가설 → 각 이름 소스 검증 → refine("mismatch는 긍정 신호, 학습 유발" → finding). ② **bounded-context별** 도메인 모델 + ubiquitous-language 용어집(Evans) = merge seam. ③ business rule을 DMN 결정테이블(실행가능, FEEL)로 — duplicate/conflict/gap/overlap/type 5-check 획득. ④ concept assignment(Biggerstaff): 도메인 개념 → 코드 실현 명시 매핑. ⑤ ADR rationale 회복(Nygard 필드) — VCS diff/superseded 코드 마이닝. ⑥ rule 두 표현(자연어↔given/when/then) cross-consistency(Adzic 10년 pitfall 가드: keyword sanity + LLM-semantic 의무). ⑦ Letovsky inquiry(why/how/what 추정+해결) 로그; delocalized plan·실패 beacon은 명시 STOP. |
| **산출물** | `D2 도메인+용어집`(per BC), `D4 business rules`(DMN), `D6 ADR`(rationale + Status), `hypothesis/inquiry 로그`, `D8 quality/risk register` 일부(SATD) |
| **Exit Gate #3** | 모든 도메인 개념이 ≥1 코드 실현에 매핑(concept assignment closed) / 모든 rule이 코드 anchor + behavior-spec에 추적 / DMN 5-check 통과 / 모든 ADR에 Status+Consequences / 미해결 why는 **명시 finding(은밀 gap ❌)** / **human SME가 슬라이스 도메인 의미 확인**. |
| **근거** | Brooks/Soloway top-down **[연구근거]**, OORP Speculate/Learn from Past **[연구근거]**, Evans BC **[연구근거]**, OMG DMN **[연구근거]**, Nygard ADR(arc42 §9 + ISO 42010 rationale 삼중 corroboration) **[연구근거]**, Biggerstaff concept assignment **[연구근거]**, Adzic dual-rep pitfall **[프로젝트맥락 LL + 연구근거]**, Letovsky inquiry **[연구근거]** |

> **복원 불가 rationale 정책**(비평 gap #4): why가 코드에도 없고 VCS도 쓸모없고(`fix`,`wip`) SME도 없으면 — **날조 금지**. ADR을 `rationale_status: unknown` + abstention 마커로 출하한다. "추정 rationale"을 그럴듯하게 채우는 것이 가장 위험한 환각이다. inquiry 로그에 미해결 why-conjecture로 남기고, 그 ADR은 LLM이 "이 결정의 이유는 미확인"으로 다루게 한다. **[연구근거(Biggerstaff: rationale는 코드에 없음) + 추론]**

---

#### Stage 4 — Slice Done-Certification (슬라이스 완료 인증) · 안쪽 gate

| 항목 | 내용 |
|------|------|
| **목표** | 슬라이스를 객관적으로 DONE 처리 — 출하·재개 가능, 재오픈 안 함. |
| **활동** | 슬라이스-내 reflexion conformance 종합 + traceability sub-matrix 구성 + (고위험 슬라이스) **의도 round-trip 검증**. |
| **Exit Gate #4 (슬라이스 done-checklist)** | ① Coverage: 선언 스코프 내 모든 파일 inventory·매핑(orphan 0). ② Boundary closure: 모든 cross-boundary 의존 카탈로그, 문서화된 seam만 통과. ③ Behavior pinned: characterization GREEN. ④ 미해결 내부 순환 없음(ADP). ⑤ L1~L3 reflexion convergence/divergence/absence 계산 — divergence/absence 해결 또는 finding. ⑥ 슬라이스 fitness 룰 CI green. ⑦ cross-slice change-coupling 임계 이하. **각 항목 기계검증** → 결정적 go/stop. 실패 항목은 재절단 또는 깊은 이해로 라우팅. |

> **의도 정확성 round-trip**(비평 gap #1, synthesis_guidance #7): grounding(grep-hit)은 필요조건이지 충분조건이 아니다. **고위험/고churn 슬라이스**에 한해, 복원된 의도(behavior-spec + rules)에서 **행위를 재생성**해 characterization baseline과 diff한다. 차이 = 의도 복원이 틀렸다는 신호. 전 슬라이스 적용은 비용상 불가하므로 **티어드**로 고위험만. **[추론 + 연구(Murphy reflexion 확장)]**

> **임계(threshold) 정직 표기**(비평 weakest_claim #8): "cross-slice coupling 임계 이하"의 임계는 연구가 canonical 값을 주지 않는 **자유 파라미터**다. support/confidence는 측정치이되 컷오프는 프로젝트별 보정 대상으로 명시한다. **[연구근거 + 추론]**

> **도메인/의도 레이어 done의 한계**(비평 gap #9): "모든 개념이 코드에 매핑"은 grounding이지 **완전성**이 아니다 — "발견 못 한 rule"은 정의상 못 센다. 정직한 처리: 도메인 done은 **부분 done**으로 표기하고, inquiry 로그의 미해결 why 수 + concept-coverage 비율을 완전성 **proxy 지표**로 노출하되 "전체 rule 회복 완료"는 주장하지 않는다. **[추론]**

---

#### Stage 5 — Merge & Federate (슬라이스 병합) · 바깥

| 항목 | 내용 |
|------|------|
| **목표** | 독립 분석된 슬라이스를 재작업 없이 하나의 시스템 컨텍스트로 합성 + cross-slice 의미·인과 조정. |
| **활동** | ① 안정 ID 키 글로벌 append-only context-graph에 슬라이스 요소 추가(prose 매칭 ❌). ② DDD context-map: 슬라이스 간 관계(shared kernel / customer-supplier / conformist / anti-corruption layer) — 독립 슬라이스를 전체로 묶는 산출물. ③ ubiquitous-language 조정: 경계를 정한 언어-불일치 신호가 이제 같은 용어 다른 의미를 탐지 → translation/ACL 노트. ④ **cross-slice 인과/데이터흐름 링크 명시 회복**(Littman as-needed 오류 해독제). ⑤ per-slice traceability sub-matrix를 시스템 매트릭스로 합성(uniform link type). ⑥ carve 검증: cross-slice change-coupling 높으면 경계가 틀린 것 → merge 또는 명시 인터페이스. ⑦ 미분석 슬라이스로 가는 cross-edge는 **pending-federation stub**(부분지식 = 추적 상태). |
| **산출물** | `D7 traceability-matrix`(양방향, coverage green/yellow/red), `D10 context-map`(+ cross-slice 인과 링크), cross-reference/level-switch 맵 |
| **Exit Gate #5** | 모순 ID 없음 / 모든 cross-edge가 context-map 관계로 해결 또는 명시 stub / cross-slice coupling 임계 이하 / merge된 매트릭스에 끊긴 링크 없음. 경계가 co-change로 틀렸다 입증되면 STOP + 재절단. **merge 순서 무관(confluent)**. |
| **근거** | Littman as-needed-vs-systematic **[연구근거]**, Evans context-map **[연구근거]**, ISO 42010 correspondences **[연구근거]**, change-coupling carve 검증 **[연구근거]**, SCIP 안정 ID join **[연구근거]**, DO-178C 양방향 traceability **[연구근거]** |

---

#### Stage 6 — Living-Sync (연속 동기화) · 정상상태 fixpoint (one-time gate ❌)

| 항목 | 내용 |
|------|------|
| **목표** | 프로젝트 수명 내내 산출물을 코드와 **양방향** 동기 유지 — staleness가 최대 실패 모드. |
| **활동** | ① 코드/상위노드 변경 시 영향 노드 **결정적 그래프 도달성**으로 마킹(LLM 판단 0). ② drift-마킹 노드 **내용만** 재생성 — 구조 레벨은 결정적 재추출, 행위/도메인/규칙 레벨은 LLM 재추출 + 실행체크(characterization 테스트·DMN 5-check)로 검증. ③ liveness ledger: per-artifact fingerprint(mtime/hash) + last-validated + 무효화 집합(Aider mtime). ④ architecture fitness functions(ArchUnit/dependency-cruiser/Spring Modulith): no-cycle·layering·"X must not depend on Y"를 CI 실행 → carve drift 차단. ⑤ characterization 테스트 매 변경 재실행. ⑥ just-in-time 로딩(경량 ID/그래프 쿼리, context rot 회피). |
| **산출물** | `D9 reflexion-conformance report + liveness ledger`, architecture-fitness-rules(CI), drift findings + revisit prompt(go/stop) |
| **Exit (정상상태)** | fixpoint — 변경 후 MUST/SHOULD 노드 미해결 divergence/absence 0 / fitness green / characterization green / traceability 양방향 완전. 다음 변경마다 재진입. human 검토는 blocked/propose/intent-conflict만(≤15%). |
| **근거** | Murphy reflexion 반복 정제 **[연구근거]**, Ford et al. fitness functions **[연구근거]**, Aider mtime freshness **[연구근거]**, Anthropic JIT/context-rot **[연구근거]**, Adzic living doc **[연구근거]** |

### 2.4 양방향 sync — forward-only를 버린 이유

B/C는 "코드는 정상 경로에서 손으로 안 고치고 forward(intent→code)만"이라는 **forward-only 불변식**을 주장했다. 비평이 정확히 지적했듯 이것은 **연구 어디에도 근거가 없고 본 레포 운영모델에서 수입된 것**이며, **코드가 ground truth인 역공학과 모순**이고 GOAL의 명시 문구 "stay synced BIDIRECTIONALLY"와 충돌한다. **[비평 conflict #3, weakest_claim #4]**

→ sync는 **진짜 대칭**으로 둔다.
- **Direction A (code→deliverable)**: 코드 편집이 1급 진실. cross-reference 그래프가 무효화될 산출물을 정확히 지목, 그것만 재-lift.
- **Direction B (deliverable→code)**: rule/behavior 편집은 실행가능 형태(DMN·Gherkin)가 코드와 RED로 검증.
- "semantic-ceiling lift"는 forward-only 강제가 아니라, 코드 편집을 **올바른 추상화 레벨로 승격하는 메커니즘**으로만 보존한다(refactor=impl / behavior change=behavior / rule change=rule). **[추론 + 비평 synthesis_guidance #4]**

> ⚠️ "active data dictionary = 스키마 변경 시 auto-sync"는 세 제안이 sync 실현 근거로 인용했으나 **과대**다. 연구(data-dictionary)는 active(DBMS 카탈로그 통합) vs passive만 다루며, LLM이 복원한 의미·provenance 딕셔너리가 자동 동기된다는 보증은 없다. "active"는 **은유적 차용**으로 표기하고, 실제 sync는 §6의 reflexion + fitness function이 한다. **[비평 weakest_claim #5]**

---

## 3. 대형 프로젝트 스코프 분해 전략

대형이 **1차 케이스**다 — 편의가 아니라 정확성 전략. 전체-일괄 분석은 attention budget(context rot)으로 비신뢰, as-needed 전체 읽기는 오류 유발(Littman). **[연구근거]**

### 3.1 절단 (carve) — 4-신호 함께

| 신호 | 방법 | 무엇을 잡나 |
|------|------|-------------|
| 의미 | EventStorming pivotal event + 언어/문법 불일치 | DDD bounded context(같은 BC 내 용어 일관, 경계서 변함) |
| 구조 | dependency DAG strata + Martin Ca/Ce/Instability + **SCC** | foundation 식별 + 순환=분할불가 슬라이스(ADP) |
| 행위 | VCS change-coupling(support/confidence) | 정적이 못 보는 실제 결합("shotgun surgery") / never co-change=안전 절단점 |
| 자동 | Bunch MQ clustering(첫 절단) | 도메인 문서 없을 때 후보 파티션(=가설, human 검증) |

자연 seam(Feathers)을 따른다 — 임의 파일/레이어 절단 ❌. CODEOWNERS는 무비용 기성 파티션 + 슬라이스별 SME 식별. **[연구근거]**

### 3.2 우선순위/순서 — 2단계

1. **Foundation 먼저** (topological): low-Instability foundation/shared-kernel + SCC — 모두가 의존하므로.
2. **Hotspot ROI** (Tornhill churn×complexity): "복잡도는 다뤄야 할 때만 문제다" — 제한된 LLM 컨텍스트 예산 ROI 최대, 최고 결함위험 우선.
3. change-coupled 슬라이스를 **인접** 배치 → 완료 슬라이스 재오픈 방지.
4. 고-SATD-밀도 / 고-Distance(zone of pain) 슬라이스는 고노력 가중. **[연구근거]**

### 3.3 병합 (merge) — ID join, 빅뱅 ❌

안정 ID(SCIP) 키 글로벌 append-only context-graph로 prose 매칭 없이 합성. DDD context-map이 병합 산출물(관계 + 용어 translation). **결정적으로 cross-slice 인과/데이터흐름 링크 명시 회복**(Littman 해독제 — 없으면 merged 컨텍스트가 조용히 틀림). per-slice traceability를 시스템 매트릭스로 합성. carve 통합테스트 = merge 후 cross-slice change-coupling. fitness function이 CI에서 carve 고정. **[연구근거]**

### 3.4 "슬라이스 done" 기준

§2.3 Stage 4 Gate #4의 7항목(coverage / boundary closure / behavior pinned / no internal cycle / reflexion 계산 / fitness green / coupling 임계 이하) + (고위험) 의도 round-trip. 각 기계검증.

### 3.5 부분지식 + cross-slice 참조 (정직한 처리)

- 미분석 슬라이스로의 cross-edge = **pending-federation stub**(1급 추적 상태, gap 아님).
- **stub coverage를 1급 완전성 지표**로 추적 — merge가 알아서 잡으리라 가정 ❌. 영원히 미분석되는 cross-edge는 영구 인과 사각지대이므로 명시 노출. **[연구근거 Littman + 비평 risk]**
- Strangler-Fig framing: 각 슬라이스가 facade 뒤에서 독립 완료 가능 → 가치가 점진·가시적 실현. **[연구근거]**
- 변경 시 build-graph DAG + liveness ledger로 **영향 슬라이스만** 재분석(selective re-analysis). **[연구근거]**

---

## 4. 산출물 세트 재설계 (first principles)

7 고정 가정을 버리고, ISO 42010의 "이 산출물이 어떤 관심사를 framing하나"로 재구성. **CORE(항상) 8 + CONDITIONAL(시나리오 게이트) 5 = 12개**. 모든 CORE는 기계가독 + 안정 ID + evidence anchor. **[비평 recommended_deliverable_count]**

| ID | 산출물 | 무엇을 담나 | 형식(기계가독?) | disposition (7 baseline 대비) | 근거 | LLM-context 역할 |
|----|--------|-------------|------------------|------------------------------|------|------------------|
| **D0** | scope-slice-manifest | carve 계획 + 슬라이스 lifecycle + tier | JSON ✅ | **ADD** | Tornhill/Martin/EventStorming **[연구근거]** | 무엇을 먼저·재개 기준 / SCC가 분할불가 슬라이스 강제 |
| **D1** | code-graph (구조 reference-lens) | def/ref/invoke/contain + 안정 ID + file:line | graph JSON ✅ | **KEEP**(demote) | Pennington/RepoGraph/SCIP **[연구근거]** | k-hop 탐색 / 모든 산출물의 join key / **evidence-only, gate 권위 ❌** |
| **D2** | 도메인 모델 + ubiquitous glossary (per BC) | 엔티티/aggregate + 비즈니스 어휘 + concept-to-code | JSON ✅ | KEEP(per-BC 재스코프) | Brooks/Biggerstaff/Evans **[연구근거]** | 코드 식별자→의도 / BC=merge seam (**LLM 추론 — 강한 grounding**) |
| **D3** | data schema + active data dictionary | 엔티티/키/관계 + 의미·provenance·sensitivity | JSON ✅ | KEEP | OORP Analyze Persistent Data **[연구근거]** | 필드의 의미·출처 / 가장 신뢰가능한 증거 다리 |
| **D4** | business rules (DMN 결정테이블) | 조건/결과 실행가능 rule + FEEL | DMN ✅ | KEEP(catalog 흡수) | OMG DMN 5-check **[연구근거]** | 검증가능 rule / 충돌 자동탐지 (**LLM 추론**) |
| **D5** | behavior-spec (Gherkin/SBE — **의도**) | 의도된 행위, 실행가능 Given/When/Then | Gherkin ✅ | KEEP | Pennington/Adzic SBE **[연구근거]** | WHAT의 검증가능 모델 |
| **D5b** | characterization/golden-master (**관찰**) | 실제 관찰 행위 핀(change detector) | 테스트코드 ✅ | **ADD / D5와 분리** | Feathers/Falco-Bache **[연구근거]** | 회귀 안전망 / intent-vs-bug 분류 의존 (**C의 D5 merge 거부**) |
| **D6** | ADR (rationale, **WHY**) | Title/Status/Context/Decision/Consequences + `rationale_status` | JSON/YAML ✅ | **ADD** | Nygard/arc42§9/ISO42010 삼중 **[연구근거]** | 의도적 결정 보호 / 미복원 시 `unknown`+abstention (**LLM 추론**) |
| **D7** | bidirectional traceability matrix | intent↔rule↔behavior↔data/struct↔code↔test, coverage | matrix/graph JSON ✅ | KEEP | DO-178C/IEC 62304 **[연구근거]** | 영향분석 / "no undocumented behavior" gate (**결정적 링크**) |
| **D8** | unified quality/risk register | smell+SATD+anti-pattern+migration risk, type-tagged | JSON(SARIF-import) ✅ | **MERGE**(4→1) | SATD(Potdar/Shihab)/AntiPatterns/arc42§11 **[연구근거]** | 무엇을 신뢰 말지 / SATD=고신호 (조건부: legacy/migration) |
| **D9** | reflexion-conformance + liveness ledger | conv/div/absence + fingerprint + 무효화집합 | JSON ✅ | **ADD** | Murphy reflexion/Aider mtime **[연구근거]** | staleness 탐지 / drift 노드만 재생성 (조건부: 운영 시작 후) |
| **D10** | context-map + cross-slice 인과 링크 | BC 간 관계 + term translation + 데이터흐름 | graph JSON ✅ | **ADD** | Evans/Littman **[연구근거]** | 경계 넘는 안전 변경 (조건부: 슬라이스 >1) |
| **D11** | **build/run/env-config manifest** | 빌드설정, 의존 버전, env var, 배포 토폴로지, feature flag | JSON ✅ | **ADD (신규)** | GOAL "develop·**run**·modify·evolve" / arc42§7 **[연구근거 + 추론]** | 에이전트가 실제 **실행**하게 / characterization 테스트도 이것 없이 실행 불가 (조건부) |
| — | hypothesis/inquiry log | why/how/what 추정 + 해결 + delocalized plan/실패 beacon | JSON(F-XXX) ✅ | ADD | Letovsky/Brooks **[연구근거]** | 감사가능 추론 흔적 / 미해결=명시 STOP |

### 4.1 비평이 제기한 갭들 — 어떻게 메웠나

- **dynamic/runtime 행위**: D5b + §2.3 Stage 2의 동적 트레이스 충분-증거 기준. **[비평 gap #2]**
- **build/config/secrets**: **D11 신규 산출물**. 에이전트가 "run"하려면 필수인데 세 제안 모두 1급으로 안 다뤘다. **[비평 gap #6]**
- **test/coverage 회복**: 기존 테스트 스위트를 **증거원**으로(§2.3 Stage 2 활동④) — 신규 작성만 하던 세 제안 보강. **[비평 gap #7]**
- **undocumented tribal knowledge**: D6 `rationale_status: unknown` 정책 + inquiry 로그(§2.3 Stage 3). **[비평 gap #4]**
- **NFR/품질속성**: D8(품질) + 시나리오 게이트로 NFR 슬라이스. arc42 §10을 coverage 체크리스트로. **[연구근거]**
- **traceability**: D7 — day-one 증분 구축. **[비평 best_idea]**
- **secrets/PII 보안**(비평 gap #5): **신규 cross-cutting 정책** — 산출물 추출 시 secret-scanning을 의무화하고, D3의 sensitivity 필드를 redaction 트리거로 사용. data-dictionary·anchor가 자격증명/규제데이터를 캡처할 수 있으므로 context-graph에 access control. 추출 산출물 자체를 secret-scan 통과시켜야 출하. **[추론 + 비평 gap #5]**

### 4.2 DROP / 시나리오 게이트

- **DROP**: 복원 UML sequence/state 다이어그램은 **독립 SSOT 폐기** — D5+코드에서 **on-demand 파생 뷰**로만. 손유지 dual representation = Adzic 10년 pitfall. **[연구근거 + 프로젝트맥락 LL]**
- **MERGE**: freeform rule catalog → D4가 흡수 / 4개 risk 산출물 → D8 하나로.
- **시나리오 게이트**: greenfield은 D5b(characterization — 관찰할 코드가 없음) + D8(legacy risk) 스킵. legacy는 전체. 4 시나리오 모두 같은 CORE+CONDITIONAL 형태로 수렴. **[비평 conflict #6, synthesis_guidance #10]**

> ⚠️ per-paradigm ceiling(Legacy ~53-55% vs Modern ~60-67%)은 본 레포 CLAUDE.md/STATUS에서 온 것이며 연구 5체 어디에도 없다. 대부분 corroboration이 OSS-Modern이므로 설계 수치로 제시하지 않는다(§8.1 단일-PoC 과적합 함정 회피). **[프로젝트맥락 — 연구 미검증]**

---

## 5. 산출물 = 살아있는 운영 컨텍스트 메커니즘

| 속성 | 구현 | 근거 |
|------|------|------|
| 기계가독 스키마 + 안정 ID | 모든 CORE = JSON-schema strict + SCIP-style human-readable string ID(merge join key) | SCIP **[연구근거]** |
| 그래프 링크 | 각 요소가 관련 요소로 edge(def→ref, requirement→rule→test, entity→table) → k-hop 탐색 | RepoGraph/CodexGraph/Aider **[연구근거]** |
| evidence anchor / provenance | 모든 주장에 file:line + grep-hit / 미검증 항목은 confidence·abstention 마커 | StrictCitations/SCIP occurrences **[연구근거]** |
| ID traceability (양방향) | D7: forward intent→code→test + backward code→intent / day-one 증분 | DO-178C/IEC 62304 **[연구근거]** |
| 양방향 sync | §2.4 — Direction A(code→deliverable, 결정적 무효화) + Direction B(deliverable→code, 실행체크 RED) | Murphy reflexion(구조 검증) **[연구근거]** |
| 결정적 vs 추론 분리 | §2.2 — 구조/링크=결정적 gate 가능 / 도메인·rule·rationale=LLM, 강한 grounding+human gate | 본 레포 chain-driver axis **[프로젝트맥락]** |
| 신선도 | D9 liveness ledger fingerprint + just-in-time 로딩 / drift=fail-closed STOP | Aider mtime / Anthropic context-rot **[연구근거]** |
| 연속 강제 | architecture fitness functions CI(no-cycle/layering) + characterization 재실행 | Ford et al. **[연구근거]** |

> reflexion을 "만능 양방향 sync 엔진"으로 보는 것을 경계한다. 연구상 reflexion은 **아키텍처 conformance(call/dependency 관계)에서만 검증**됐다. behavior-spec/DMN-rule/ADR-rationale drift로의 일반화는 **확장(extension)**이며, characterization 테스트(행위) + DMN 5-check(rule) + LLM 재추출을 **결합**한 것이지 순수 결정적 함수가 아니다. convergence/divergence/absence 용어의 verbatim phrasing은 1차 Murphy 논문 대조 미완(medium confidence). **[비평 weakest_claim #3]**

---

## 6. 리스크와 함정

| 리스크 | 설명 | 완화 |
|--------|------|------|
| **정적 그래프의 거짓 권위** | call/dependency 그래프는 over-approximate + intent-blind(코드가 *할 수 있는* 것) | D1을 evidence-only로 demote. gate 권위는 D7(traceability)·D5b(characterization)만 **[연구근거]** |
| **의도 정확성 ≠ grounding** | grep-hit는 이름 존재만 증명, 의미 충실 아님(concept-assignment) | 고위험 슬라이스 의도 round-trip(재생성→characterization diff) + concept-to-code 매핑 + abstention **[비평 gap #1]** |
| **as-needed merge 오류** | per-slice 분석이 cross-slice 인과를 놓침 → 더 많은 오류(Littman) | merge에서 cross-slice 인과 명시 회복 + stub coverage 1급 지표 + cross-slice coupling 통합테스트 **[연구근거]** |
| **rationale 환각** | why는 코드에 없어 LLM이 그럴듯하게 날조 유혹 | `rationale_status: unknown` 정책 + 실패 beacon STOP + inquiry 로그 abstention **[비평 gap #4]** |
| **LLM 비결정성** | 같은 코드, 두 실행, 다른 도메인 모델/rule | 구조=결정적 추출(단일 진실) / 추론 레이어=다중샘플 합의 + confidence 보정 + human gate. 어느 산출물이 결정적인지 명시 분류 **[비평 gap #3]** |
| **dual-representation drift** | 손유지 prose + 실행 spec = Adzic 10년 pitfall | 단일 실행 SSOT(DMN/Gherkin), 뷰는 on-demand. UML은 파생뷰 **[프로젝트맥락 LL + 연구근거]** |
| **sync drift / staleness** | 저장 컨텍스트가 코드 진화하며 부패(최대 실패 모드) | D9 reflexion 재계산 + mtime fingerprint + CI fitness / drift 임계 초과=fail-closed STOP **[연구근거]** |
| **scope creep / 비용** | per-slice characterization+reflexion+fitness+human gate × 수백 슬라이스 = 운영 불가 | **티어드 ceremony**(저위험 슬라이스 경량 경로) + selective re-analysis **[비평 gap #8 + 프로젝트맥락]** |
| **boundary 오절단 전파** | 4-신호 불일치 경계를 gate가 수용 → 슬라이스 누수 → 다중 재절단 | merge 후 change-coupling 통합테스트 + 취약경계 명시 finding **[연구근거]** |
| **secret/PII 노출** | 영구 컨텍스트인 D3/anchor가 자격증명·규제데이터 캡처 | 추출 산출물 secret-scan 의무 + sensitivity redaction + context-graph access control **[비평 gap #5]** |
| **임계 자유파라미터** | "coupling 임계 이하"가 근거 없는 임의값 | 프로젝트별 보정 명시, canonical 값 주장 ❌ **[비평 weakest_claim #8]** |
| **단일-paradigm 과적합** | ceiling 수치가 OSS-Modern 편향 | ≥2 distinct domain corroboration 전까지 ceiling을 설계수치로 출하 ❌(§8.1) **[프로젝트맥락]** |

---

## 7. 한 장 요약 — "이렇게 하면 된다"

**골격: 스코프 우선 바깥 루프 + 추상화 상승 안쪽 루프(중첩) — 6단계.**

```
[Stage 0] Scope & Carve (바깥) ─ 싼 breadth pass + 4-신호 절단(의미/구조/행위/자동)
          + SCC=분할불가 + foundation→hotspot 순서 → D0 manifest ─ soft gate #0
   │
   └─ 슬라이스마다 (티어드: 저위험=경량) ──────────────────────────┐
        [Stage 1] Structural Lift ─ code-graph(안정 ID) + schema/dict ─ gate #1 + 데이터 sub-gate
        [Stage 2] Behavior Lift ─ behavior-spec(의도) + characterization(관찰, 분리!)
                  + 기존테스트 회복 + 동적트레이스(정적 모호 시) ─ gate #2
        [Stage 3] Domain/Intent/Rules ─ 도메인+용어집(per BC) + DMN rules
                  + ADR rationale(미복원=unknown) + concept-to-code ─ gate #3 (human SME)
        [Stage 4] Slice Done-Cert ─ 7항목 checklist + 고위험 의도 round-trip ─ gate #4
   ┌──────────────────────────────────────────────────────────────┘
   │
[Stage 5] Merge & Federate (바깥) ─ 안정 ID join + context-map
          + cross-slice 인과 명시 회복 + traceability 합성 ─ gate #5 (confluent)
[Stage 6] Living-Sync (정상상태) ─ 결정적 영향마킹 + reflexion drift + CI fitness
          + 양방향(code↔deliverable) ─ fixpoint (one-time gate ❌)
```

**산출물 = LLM 운영 컨텍스트 (CORE 8 + CONDITIONAL 5 = 12):**
CORE: D0 manifest / D1 code-graph(evidence-only) / D2 도메인+용어집 / D3 schema+dict / D4 DMN rules / D5 behavior-spec(의도) + D5b characterization(관찰, **분리**) / D6 ADR(왜) / D7 traceability.
CONDITIONAL: D8 risk register(4→1 merge) / D9 reflexion+liveness / D10 context-map / **D11 build/run/env(신규 — 에이전트가 실제 run하게)** / inquiry log.
DROP: UML 다이어그램 SSOT(파생뷰만). 모든 CORE = 기계가독 + 안정 ID + evidence anchor.

**핵심 규율 5가지:**
1. 올리는 순서는 인지과학(Pennington)이 정한다 — 구조→데이터→행위→도메인.
2. 결정적 추출(code-graph/schema/traceability) ≠ LLM 추론(도메인/rule/rationale) — 후자에 강한 grounding+abstention+human gate.
3. sync는 **진짜 양방향**(forward-only 폐기) — 코드가 ground truth.
4. behavior-spec(의도)과 characterization(관찰)은 **분리** — intent-vs-bug 판정이 거기 의존.
5. grounding(grep-hit)은 필요조건이지 충분조건 아님 — 고위험 슬라이스는 의도 round-trip으로 정확성 검증.

---

## 근거 / 출처 (verified URL)

**인지·역공학 이론**
- Chikofsky & Cross (1990), *Reverse Engineering and Design Recovery: A Taxonomy* — https://dl.acm.org/doi/10.1109/52.43044
- von Mayrhauser & Vans (1995), *Program Comprehension During Software Maintenance and Evolution* — https://www.cs.kent.edu/~jmaletic/cs69995-PC/papers/von_mayrhauser95.pdf
- Storey (2005), *Theories, Methods and Tools in Program Comprehension* — https://www.ptidej.net/courses/inf6306/fall10/slides/course8/Storey06-TheoriesMethodsToolsProgramComprehension.pdf
- Murphy, Notkin, Sullivan, *Software Reflexion Models* (FSE'95/TSE 2001) — https://www.cs.ubc.ca/~murphy/papers/rm/fse95.html
- Kazman, Woods, Carrière (1998), *CORUM II / Horseshoe* — https://www.sei.cmu.edu/documents/200/1998_019_001_29754.pdf
- Biggerstaff (1989), *Design Recovery for Maintenance and Reuse* — https://dl.acm.org/doi/abs/10.1109/2.30731

**실무 legacy/재공학 패턴**
- OORP (Demeyer/Ducasse/Nierstrasz, LibreTexts mirror) — https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_and_Computation_Fundamentals/Book:_Object-Oriented_Reengineering_Patterns_(Demeyer_Ducasse_and_Nierstrasz)
- Characterization test (Feathers; Golden Master) — https://en.wikipedia.org/wiki/Characterization_test
- The Mikado Method — https://www.methodsandtools.com/archive/mikado.php
- Strangler Fig Application (Fowler) — https://martinfowler.com/bliki/StranglerFigApplication.html
- Branch by Abstraction (Fowler) — https://martinfowler.com/bliki/BranchByAbstraction.html

**스코프 분해·우선순위**
- Tornhill hotspot prioritization — https://www.infoq.com/news/2017/04/tornhill-prioritise-tech-debt/
- Change coupling (D'Ambros/Gerosa) — https://www.ime.usp.br/~gerosa/papers/changecoupling.pdf
- Martin component metrics (Instability/ADP/SDP) — https://codergears.com/Blog/?p=585
- Bunch SBSC (Mancoridis & Mitchell, ICSM 1999) — https://www.cs.drexel.edu/~bmitchell/pubs/icsm99.pdf
- EventStorming bounded-context discovery — https://www.infoq.com/presentations/microservices-ddd-bounded-contexts/
- Architecture Fitness Functions (Ford et al.) — https://www.infoq.com/articles/fitness-functions-architecture/

**LLM 코드 컨텍스트**
- Aider repo-map — https://aider.chat/2023/10/22/repomap.html
- SCIP (Sourcegraph) — https://sourcegraph.com/blog/announcing-scip
- Effective context engineering (Anthropic) — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- RepoGraph (ICLR 2025) — https://arxiv.org/html/2410.14684v1
- cAST (EMNLP 2025 Findings) — https://arxiv.org/abs/2506.15655
- Cody hybrid retrieval (Sourcegraph 2024) — https://arxiv.org/html/2408.05344v1
- CodexGraph (NAACL 2025) — https://aclanthology.org/2025.naacl-long.7/
- DO-178C bidirectional traceability — https://en.wikipedia.org/wiki/DO-178C / https://www.parasoft.com/learning-center/do-178c/requirements-traceability/

**산출물 표준**
- C4 model — https://c4model.com/ / Structurizr DSL — https://docs.structurizr.com/dsl
- arc42 — https://arc42.org/overview
- ISO/IEC/IEEE 42010 — https://standards.ieee.org/ieee/42010/5334/
- ADR (Nygard) — https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md
- OMG DMN 1.3 — https://www.omg.org/spec/DMN/1.3/PDF
- Specification by Example (Adzic) — https://www.manning.com/books/specification-by-example
- DDD Reference (Evans) — https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf
- SATD survey (Potdar & Shihab) — https://www.sciencedirect.com/science/article/abs/pii/S0164121219300457

**검증 한계(caveats)**: ① Chikofsky & Cross 정의·6목표는 GA-Tech ISVIS 요약 + IEEE 메타데이터 corroboration(원 PDF verbatim 미대조). ② Murphy reflexion convergence/divergence/absence 용어는 다중 2차출처 일치하나 원 논문 verbatim 미추출(substance high / phrasing medium). ③ 인지모델 저자 연도(Brooks 1983 등)는 survey 참고문헌 기반. ④ Bunch MQ·Martin 메트릭 공식은 2차출처(원 PDF binary). ⑤ per-paradigm ceiling·forward-only·active-dict auto-sync·RepoGraph %는 **프로젝트맥락/벤치마크 특정**으로 표기 — 연구 일반보증 아님. ⑥ 제안된 12개 산출물 세트는 검증된 표준 위 1차원리 **합성/추론**이지 published 표준 아님.