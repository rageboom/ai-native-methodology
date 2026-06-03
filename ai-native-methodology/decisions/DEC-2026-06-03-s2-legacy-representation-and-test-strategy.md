# DEC-2026-06-03-s2-legacy-representation-and-test-strategy

**성격**: ★ **설계 분석 + 방향 정리** (release ❌ / 구현 ❌ / 코드·스키마 무변경 — 본 DEC + INDEX entry 만). 본 세션의 대화 주도 분석(사용자 질문 chain: dep-graph 원리 → code-graph.json 효용 → codegraph 필요성 → S2 마이그레이션 test 전략)을 결정 로그에 고정. **모든 구현 항목 = 4원칙(plan→research→승인) 경유 carry** — 본 DEC 는 합의된 findings + 방향 + carry 의 SSOT 일 뿐 구현 승인 ❌.

**작성일**: 2026-06-03

**relates to**:
- `DEC-2026-06-02-context-federation.md` — federation Phase 0~3 / 본 DEC 가 federation 가치 재평가
- `DEC-2026-05-30-codegraph-essential.md` — codegraph 필수화 / 본 DEC 가 "필수"의 의미를 migration-start 역할로 정밀화
- `DEC-2026-06-01-living-dep-graph-loops.md` — 두 루프 / 본 DEC 가 "migration-start 0-edge" 추가 실측
- `DEC-2026-05-30-use-scenario-taxonomy.md` §5 — S2 gate / characterization·augmentation
- `STATUS.md` (2026-06-03 Q3 pass-2 findings) + memory `project_depgraph_codegraph_validation` — federation negative 실측
- 본 세션 실측 probe (analysis-only graph 합성 / RealWorld `_dogfood-realworld` `synthesizeGraph` 직접 실행)

---

## 0. 한 줄 요약

S2(AX전환/마이그레이션)에서 **기존 코드를 어떻게 표현(graph)·검증(test)하는가**를 실측으로 규명:
- ① dep-graph 는 **chain 의존성 그래프**라 migration-start(analysis-only)엔 **엣지 0** = 기존 코드를 연결된 그래프로 못 나타냄(실증).
- ② 따라서 codegraph 는 federation(소형 repo negative) 과 **별개로** "migration-start 기존 코드 구조 표현"이라는 고유·대체불가 역할 보유(방향 / 대형 legacy 미검증).
- ③ 마이그레이션 test 안전망 = **characterization 단독 ❌** → contract/property/rule(강·migration-invariant) core + characterization(약·보충) **다중 oracle**.
- ④ test_intent **사전 라벨 ❌** → **unchanged legacy baseline 실행으로 pass=보존 / fail=작업 경험적 분류**(방향 / 현 S2 약점 보완).

---

## 1. 검증된 findings (이번 세션 실측 / 사실)

### 1.1 dep-graph = chain 의존성 그래프 (legacy-code 그래프 ❌)
- 엣지는 거의 전부 chain forward(`derived_from`/`tests`/`implements`) + analysis↔chain(`cross_reference`). **analysis↔analysis 엣지 없음.**
- **실측** (`synthesizeGraph` analysis-only 입력 직접 실행 / RealWorld): analysis **9 노드 / 엣지 0 / 9 전부 orphan**(코드앵커 6). 대조군 analysis+full chain = 116 노드 / **173 엣지**(derived_from 94 + conforms_to 19 + cross_reference 60) / orphan 0.
- → migration-start(analysis 만, discovery 전)엔 **의존성 그래프가 사실상 없음**(graph-integrity 도 orphan=fail). **dep-graph 는 "chain 을 타야 비로소 그래프가 됨."**
- `code-graph.json` 결정적 소비처 **0**(reference-lens / 어떤 gate·validator 도 안 읽음 / federation 조차 codegraph **DB** 를 직접 읽지 code-graph.json 안 읽음 = federator.js grep no-match). dep-graph 빌드 = **lazy/on-demand**(dep-graph-navigator, 파일 없을 때만 합성) / 매 gate 갱신은 **matrix 만**(graph 는 `--graph` = dep-graph-navigator 한 곳).

### 1.2 기존 코드의 dep-graph 표현 = analysis 앵커뿐 (희박 / 파일수준)
- RealWorld 실측: 코드앵커 노드 = TC 25(test 산물) + analysis 3(business-rules→9파일·domain·error-mapping → legacy `src/main/java`) = **28/115**. 나머지 87 na.
- migration-start(chain·TC 제거)엔 **analysis 3/8 앵커만** = 기존 코드가 희박·파일수준으로만 표현. **"coverage 100%"는 "(앵커 OR na) / missing 0"** 일 뿐 "코드 다 매핑" ❌(na 도 covered 로 셈).

### 1.3 코드 연관(code_pointer)은 추출 시점에 생성, 합성기는 surface
- 연관 **생성** = analysis(evidence file / 도구-driven[sql-inventory·db-schema·ts-morph] 또는 LLM 추출+source_evidence 의무+grep 검증) / IMPL·TC(source_files). 합성기는 **existence-gate** 후 surface(정직 불변식 — 미검증 경로 emit ❌). 앵커는 대부분 **파일수준**(strict_path / ast_symbol 거의 미사용).

### 1.4 S2 설계는 이미 존재 (재발명 ❌)
- 시나리오 선언(`init --scenario`)→`manifest.scenario`→`gate-eval SCENARIO_EXPECTED` 분기(S2=`per_tc_outcome`). `test_intent` enum(characterization=expected `pass` / augmentation=expected `fail`). implement `strategy_chosen`(ai-generate-fresh / **git-restore** / hybrid-restore-and-modify — impl 존재 시 처음부터 생성 ❌). `s2_outcome_mismatch` v11.33.0 **hard-block**. `characterization-spec`(analysis 산출물 23 / Feathers + intent_vs_bug 4분류) = 의도 oracle.
- **test-generate 가 이미 다중 oracle 소비**: AC + behavior `property_tests`(fast-check/jqwik) + **openapi contract**(schemathesis/dredd/pact) + FE a11y/visual. characterization 만 쓰는 게 아님.

## 2. 방향 결정 (committed direction — 단 구현은 carry / §8.1 미검증 명시)

### 2.1 codegraph = "migration-start 기존 코드 구조" 도구로 재프레이밍 (완전제거 ❌)
- **§8.1: federation 무가치(소형 repo 2 distinct) ≠ codegraph 무가치** — 별개 명제(실증으로 분리).
- federation(codegraph×dep-graph join) = 강한 negative(2 distinct 소형 repo / Q3) → **park** (precision HELD / re-apply recipe 보존).
- 그러나 dep-graph 가 migration-start 에 **0-edge**(§1.1)인 이상, **기존 legacy 코드를 연결된 구조 그래프로 표현**하는 건 dep-graph 가 구조적으로 불가 = **codegraph 의 고유·대체불가 역할**(특히 S2 주 타깃 = 대형 legacy).
- 따라서 `DEC-2026-05-30-codegraph-essential` 의 "필수"를 **"federation enhancer" 가 아니라 "S2 migration-start 기존 코드 구조 표현"으로 의미 정밀화.**
- ★ **단 이 가치는 대형 legacy 에서 미검증**(`C-q3-hard-scenario`) — **direction 이지 입증된 결정 ❌**. 완전제거는 §8.1 과적합(소형 2건으로 sweeping)이라 **거부**.

### 2.2 마이그레이션 test 안전망 = 다중 oracle (characterization 단독 ❌)
- characterization 단독 = anti-pattern 경향 — 관찰동작을 핀하니 **버그도 정답으로 굳힘**(그래서 intent_vs_bug 분류 존재).
- 안전망 = **core**(migration-invariant·intent oracle): contract(openapi + error-mapping) + property/invariant(formal-spec) + rule(business-rules) / **backfill**(약·보충): characterization(잔여 관찰동작).
- **다중 oracle cross-check = 충돌 표면화(버그 발견)** — characterization 단독이 못 하는 핵심 가치. (단 contract/e2e 는 running 서비스 필요 = runnable 환경 의존.)
- ★ "characterization = 약한 oracle" 표기 정밀화: **"동작이 옳은지(correct)는 모름"의 의미** — **"동작 보존(sameness)이 목표인 마이그레이션엔 오히려 정답 도구**"임. 약함 ≠ 마이그레이션 부적합.

### 2.3 test_intent = baseline 실행으로 경험적 분류 (사전 라벨 ❌ / 현 S2 보완)
- intent(discovery→spec→plan→AC)에서 test 도출 → **unchanged legacy baseline 1회 실행** → **pass = 기존 부합**(보존/안전망/characterization-grade) / **fail = 마이그레이션 작업**(augmentation).
- 이점: (a) intent oracle(버그 안 핀) (b) pass/fail 이 분류를 **경험적 결정** = 현 "test_intent 사전 라벨 미강제(silent label drift)" 약점 해소 (c) **analysis 추출 round-trip 검증** 동시 획득(legacy 에서 뽑은 의도로 만든 test 를 legacy 가 통과 = 추출 충실 증거).
- catch: "fail" 3 의미(legacy 버그 / 신규 기능 / 추출 오류) → intent_vs_bug 판단 필요(단 **fail 지점으로 좁혀짐**). expected 는 **intent 독립**(legacy 실행결과를 expected 로 박으면 gate 무의미).

## 3. carry (구현 = 전부 4원칙 경유)

- **`C-codegraph-migration-role`** — codegraph 를 S2 migration-start 기존 코드 구조 표현 도구로 정식 배선 + **대형 legacy 가치 실측**(`C-q3-hard-scenario` 흡수 / 미검증 해소 전제). federation 은 park 유지.
- **`C-1` (multi-oracle 안전망 자동 부트스트랩)** — test-less legacy 에서 contract/property/rule/characterization test **자동 생성**이 chain 4(test-generate)에 어디까지 배선됐는지 정밀 추적 + gap 설계. (oracle → executable test 변환 / 본 세션 미추적.)
- **`C-baseline-run-classification`** — unchanged legacy baseline 실행으로 characterization/augmentation **경험적 분류** 모델을 현 S2(test-generate / s2-outcome-check / gate-eval)에 끼워넣기 설계.
- **`C-s2-gate-hardening`** (기존 갭 통합) — `test_intent`↔`expected_outcome` 코드 강제(현 silent) / `missing_actual` under-enforce(gate 미read) / runner adapter per-test status 의존.
- **`C-living-graph-autotrigger`** (기존) — dep-graph 빌드·동기화(A1/A2/A3) 자동 트리거 미배선(수동 opt-in) / migration-start 시 analysis 앵커 두껍게(slice 보강 canonical 반영).
- **runnable 환경 의존** — 모든 oracle 실 GREEN 확인 = 사용자 환경/CI (no-simulation / RealWorld env-blocked 선례).

## 4. paradigm 정합 / 정직

- 본 DEC = **설계 분석 + 방향**(prod-가치 frontier = S2 주 타깃 "기존 코드 표현·검증" 이해 심화) / **실측 probe 기반**(analysis-only graph 0-edge 직접 실행 / RealWorld 앵커 breakdown) = self-referential 도구-polishing ❌ (memory `feedback_self_referential_corrective_drift` 정합).
- **구현 0 / release ❌ / 코드·스키마 무변경**. 모든 구현 = 4원칙(plan→3-agent research→승인). 본 DEC 는 구현 승인이 아님.
- **§8.1**: codegraph migration-start 가치 = **미검증 direction**(대형 legacy 필요) / federation negative = 소형 2건. 과적합 회피 위해 "완전제거" 거부 + "입증된 결정" 표기 ❌.
- 본 세션 = 사용자 질문 chain 이 주도(dep-graph 원리 → codegraph 효용 → S2 test 전략) / 메타 발화("oracle 이 뭐냐") 시 즉시 plain 재설명(jargon 회피).

## 5. 한 줄 결론

> dep-graph 는 chain 의존성 그래프(migration-start 0-edge / 실증) → 기존 legacy 코드 표현은 **codegraph(구조) + characterization(동작)** 의 몫이고 federation(둘 join)과 별개. 마이그레이션 test = characterization 단독이 아닌 **contract/property/rule core + characterization backfill 다중 oracle**, 분류는 **unchanged legacy baseline 실행으로 경험적 결정**. 전부 방향/finding 이며 구현은 4원칙 carry.
