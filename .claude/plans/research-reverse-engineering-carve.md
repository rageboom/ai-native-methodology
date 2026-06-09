# research — scope-carve 신호 5종 (2원칙 / version-pinned 실 fetch)

> plan = [`plan-reverse-engineering-methodology.md`](plan-reverse-engineering-methodology.md) 델타 #1(signal-driven scope-carve) 의 2원칙 research.
> 방법: 5 신호 병렬 fetch(Tarjan SCC / Martin 메트릭 / VCS co-change / Bunch MQ+Tornhill / EventStorming) → 결정성·비용·git-only·carve역할·실패모드 특성화 → reference-lens(evidence-only / soft gate #0 human 확정) 관점 랭킹.
> **결론**: 결정론·reference-lens 적격 = **3개**(SCC + Martin + VCS co-change). **2개**(Bunch MQ=확률적 비재현 / EventStorming=human-judgment 워크숍)는 결정론 헬퍼 부적합 → human-in-loop / low-trust only (EventStorming 자동 재구성 = no-simulation 위반 소지).
> ⚠️ 정직: research agent 가 URL 독립 재fetch 는 안 함(원 verified 플래그 인용). 1차 출처 신뢰도는 본문 종합 참조.

---

# 스코프-카브(scope-carve) 신호 5종 채택 랭킹

결정론적·reference-lens 카브 헬퍼 관점 (산출물 = evidence-only / gate-authoritative 아님 / soft gate #0 에서 사람이 확정).

## 평가 축 요약 표

| # | 신호 | 결정성 | 비용 | git-only 가능 | carve 역할 | 채택 권고 |
|---|------|--------|------|---------------|------------|-----------|
| 1 | SCC / cycle detection (Tarjan) | **deterministic** | cheap | ❌ (구조 그래프 필요) | 분할 불가 atomic 단위 + 추출 순서 (hard constraint) | **1차** |
| 2 | Martin 컴포넌트 메트릭 (Ca/Ce/I/A/D + SDP/ADP) | **deterministic** | cheap | ❌ (구조 그래프 + 추상/구체 분류 필요) | seam·hub·spine 후보 랭킹 + ADP cycle = atomic 단위 | **1차** |
| 3 | VCS change-coupling / co-change (logical coupling) | **deterministic** (단, 파라미터 pin 후) | cheap | ✅ **git-only 가능** | 행위 유래 modularity seam — 정적 그래프에 직교/보완 | **1차 (단, 파라미터를 soft gate 노출)** |
| 4 | Bunch MQ 클러스터링 + Tornhill hotspot | **heuristic** (MQ=확률적 탐색 / hotspot=history-bias) | moderate | ⚠️ 부분 (hotspot=git-only / MQ=구조 그래프 필요) | MQ=클러스터 seam 직접 제안 / hotspot=우선순위 가중 | **신중 (human-in-loop 필수)** |
| 5 | EventStorming pivotal events → bounded context | **llm-or-human-judgment** | expensive | ❌ (도메인 전문가·워크숍 입력 필요) | 도메인 narrative seam (business-level) | **신중 (결정론 헬퍼 부적합 / human 필수)** |

---

## 신호별 상세

### 1. SCC / cycle detection (Tarjan, 1972) — **1차 채택**

- **결정성**: deterministic. 동일 입력 그래프 → 동일 SCC 분할 (단일 DFS 패스, O(V+E)). reference-lens 카브 헬퍼의 이상적 코어.
- **비용**: cheap. 선형 시간, 추가 데이터 0.
- **git-only**: ❌. directed 의존성 그래프(import/call/AST 참조)가 선행 입력. 그래프는 codegraph 등 상위 추출기가 공급.
- **carve 역할**: 가장 강한 신호. multi-node SCC = **분할 불가 atomic 단위**(acyclic cut 으로 cycle 을 못 쪼갬 = 불법 카브를 사전 배제), size-1 SCC = 자유 할당, condensation DAG 의 topo 순서 = 안전한 추출/strangler 순서. soft 제안이 아니라 **증명 가능한 hard 경계 제약**을 준다.
- **채택 권고**: **1차**. 결정론 + cheap + 위반 불가 제약 = 카브 헬퍼의 골격.
- **주의**: garbage-in (동적 dispatch/reflection/DI/config/SQL-mapper 누락 → false 'sliceable', 본 레포의 codegraph iBATIS2 blind spot 정합). granularity 민감 (node 단위 바뀌면 SCC 답이 바뀜 — Tarjan 이 결정 안 함). big-ball-of-mud 시 거대 SCC 가 거의 전부를 삼켜 leverage 소실. cohesion/도메인 의미는 미포함 → 다른 lens 와 결합 의무.

### 2. Martin 컴포넌트 메트릭 (Ca/Ce/I/A/D + SDP/ADP) — **1차 채택**

- **결정성**: deterministic. 정적 컴포넌트 그래프 + 추상/구체 카운트만으로 순수 산술. 의미·런타임 불요.
- **비용**: cheap.
- **git-only**: ❌. 컴포넌트 의존성 그래프 + per-type 추상/구체 분류 필요. 또한 'component' 경계(package/module/dir)가 **선행 partition 입력** — 메트릭은 주어진 partition 을 특성화할 뿐 이상적 partition 을 스스로 발견하지 못함.
- **carve 역할**: 강한 결정론 lens. D(main sequence 거리) 높음 = 오배치/seam 위반 후보, Ca 높음 = hub(shared kernel 근처 거주 의무 / 쪼개면 다수 slice 파편화), Ce 높고 Ca 낮음 = sink(깨끗이 추출 가능). **ADP(cycle/SCC) = 가장 직접적 carve 신호** — 신호 #1 과 일관(SCC = atomic). SDP 위반 = fragile cross-slice edge 노출.
- **채택 권고**: **1차**. 단, 출력 숫자는 결정론이나 **임계치(D/I/Ca 가 '너무 높다')는 convention** — cutoff 선택은 사람/휴리스틱 overlay 이므로 임계 판정은 soft gate 로 넘긴다.
- **주의**: 모든 edge 동일 가중(결합 강도/빈도 미인지). 동적/duck-typed 언어에서 A 계산 어렵거나 무의미 → D 열화. Ca+Ce=0 컴포넌트는 I 미정의. 레거시 스택(iBATIS/MyBatis XML, DI, reflection)에서 cross-language 의존 정적 그래프에 비가시 → undercount(레포 codegraph 한계 정합). 구조 건전성 ≠ 도메인 cohesion.

### 3. VCS change-coupling / co-change (logical coupling, Gall 1998 / ROSE 2004) — **1차 채택 (조건부)**

- **결정성**: deterministic — **단, 파라미터(min-support / min-confidence / window / max-transaction-size) pin 이후에만**. 파라미터 선택 자체는 사람 판단.
- **비용**: cheap (file-level 변형은 git log --name-only 면 충분).
- **git-only**: ✅ **유일하게 git-only 로 완결 가능**. 실행 코드·빌드·AST 불요(file-level). AST 는 fine-grained 정밀도용 옵션일 뿐.
- **carve 역할**: 정적 의존성 그래프에 **직교·보완**되는 행위 유래 신호. co-change 그래프 클러스터링으로 seam 제안(intra 高/cross 低), tightly co-changing set 을 가르는 cut 을 leaky 로 flag. 정적 분석이 못 보는 config↔code, 암묵 계약, schema↔DAO↔mapper 동시편집 포착 = **레거시(Spring/iBATIS) blind spot 정조준**. 본 레포 가치(legacy 전환)와 직접 부합.
- **채택 권고**: **1차**. 단, **파라미터를 soft gate 에 명시 노출**(렌즈 내부에 박지 말 것). 'deterministic'은 파라미터 고정 이후에만 성립.
- **주의**: tangled/대형 commit 이 결합 inflate (bug+feature 한 커밋). merge/squash/micro-commit 워크플로 왜곡. young/sparse history = cold-start(구조적으로 중심이어도 신호 0). recall 낮음(강한 couple 확인엔 강, 완전성엔 약). rename/move 는 --follow 없으면 chain 단절. 소유권/프로세스 교란(한 개발자가 무관 파일 동시 편집) → lift/normalize 필요.

### 4. Bunch MQ 클러스터링 + Tornhill hotspot — **신중 (human-in-loop 필수)**

- **결정성**: **heuristic** ⚠️. MQ 최적 partition 탐색 = NP-hard → **확률적 hill-climbing(랜덤 초기 partition + 랜덤 이동)** → RNG seed 미고정 시 run 마다 클러스터 경계 상이·**비재현**. (주어진 partition 의 MQ 값 계산만 결정론.) Tornhill hotspot = history-bias 휴리스틱(churx×complexity, SLOC/indentation = 약한 proxy).
- **비용**: moderate.
- **git-only**: ⚠️ 부분. hotspot 은 git-only 가능(revision count + SLOC/indentation). MQ 는 정적 MDG 추출기 필요.
- **carve 역할**: MQ = 정적 구조에서 클러스터(=모듈/서브시스템 후보) seam 직접 제안. hotspot = 직교 우선순위(자주 바뀌고 복잡한 region = 먼저 carve/격리/hardening). 결합 시 'MQ 가 cut line, hotspot 이 순서·가중'.
- **채택 권고**: **신중**. 결정성=heuristic 이므로 **결정론 카브 헬퍼에 그대로 부적합** — human-in-loop 또는 (최소한) RNG seed 고정 + 명시적 비재현 flag 없이는 채택 보류. 채택 시 2차 보강 lens 로, 반드시 evidence-only.
- **주의**: MQ 는 local optima(근사적, canonical 아님), 정적 그래프 누락 의존(legacy indirection)에 클러스터 왜곡, 그래프 메트릭 최적화 ≠ 도메인 의미(bounded context 가를 수 있음). hotspot 은 **과거**(변경이 일어난 곳)일 뿐 옳은 신 경계 아님 — history overfit 시 나쁜 구조 고착. MQ+hotspot 순진 결합 = double-count.

### 5. EventStorming pivotal events → bounded context — **신중 (결정론 헬퍼 부적합 / human 필수)**

- **결정성**: **llm-or-human-judgment** ⚠️⚠️. 알고리즘 아님 — 퍼실리테이트 워크숍 프로토콜. 참가자/퍼실리테이터마다 pivotal event·경계가 달라지고 iteration 마다 drift("처음 고른 pivotal event 로 끝나지 않는다") = **비재현**. Brandolini 본인 "범죄 현장 수사이지 체크리스트 대화가 아니다" — 인간 판단 활동으로 명시.
- **비용**: **expensive**. 도메인 전문가 + 퍼실리테이터의 방(또는 async 등가)이 근본 입력.
- **git-only**: ❌. 코드/AST/git 단독으로 도출 불가. LLM 이 레거시 코드에서 event 를 **근사**할 수 있을 뿐이며, 그 근사 자체가 ground truth 없는 휴리스틱.
- **carve 역할**: business/도메인 수준 seam 제안 — pivotal event = bounded context 의 before/after 분기, swimlane·전문성 클러스터·ubiquitous-language 충돌로 보강. "도메인 narrative 가 어디서 끊기나" 응답 = 구조/의존성 lens("코드가 어디서 끊기나")에 보완.
- **채택 권고**: **신중**. 결정성 = judgment 이므로 **결정론 카브 헬퍼에 부적합** (아래 flag). 채택한다면 결과를 **low-trust 증거로만**, soft gate #0 에서 human 확정 전제. 워크숍 미실시 상태의 자동 재구성은 인간 활동의 시뮬레이션 → no-simulation 정책상 measured fact 로 제시 금지, low-trust 로 flag 의무.
- **주의**: 도메인(business-phase) 경계가 레거시 monolith 의 코드/모듈 경계에 깔끔히 매핑되지 않아 pivotal-event seam 이 실제 배포 단위를 cross-cut 가능. re-run drift.

---

## 종합 권고

### 저비용 결정론 우선 (1차 = 카브 헬퍼 골격)

신호 **#1(Tarjan SCC) + #2(Martin 메트릭) + #3(VCS co-change)** 셋이 결정론·cheap 조합으로 reference-lens 카브 헬퍼에 부합. 권장 합성:

1. **#1 Tarjan SCC** = hard 제약 레이어(분할 불가 atomic + 안전 추출 순서). 골격.
2. **#2 Martin** = SCC atom 위에 seam/hub/spine/sink 역할 랭킹. ADP=#1 과 일관(동일 cycle 기반). **임계 판정은 soft gate 위임**.
3. **#3 VCS co-change** = #1·#2(정적)에 **직교 보완** + 본 레포의 legacy(iBATIS) 정적-비가시 의존 정조준 + **유일 git-only**. **파라미터는 soft gate 노출**.

세 신호 모두 cohesion/도메인 의미는 미포함 → 구조 신호로 한정하고 의미 확정은 사람에게.

### 신중 (LLM/human heuristic — 결정론 헬퍼 단독 부적합, human-in-loop 전제)

- **#4 Bunch MQ + Tornhill hotspot** — MQ 가 확률적 비재현(seed 미고정), hotspot 이 history-bias 휴리스틱. 2차 보강 lens 로만, seed 고정 + 비재현 flag + human 확정 없이는 보류.
- **#5 EventStorming** — 본질이 human-judgment 워크숍, expensive, git-only 불가, re-run drift. business-level seam 의 보완 가치는 있으나 결정론 카브 헬퍼에 부적합.

### 결정성=heuristic/judgment FLAG (human-in-loop 없이는 결정론 카브 헬퍼 부적합)

- **#4 (heuristic)** — MQ 탐색이 확률적 → 비재현. RNG seed 고정 + evidence-only + human 확정 없이는 결정론 gate 입력 ❌.
- **#5 (llm-or-human-judgment)** — 비재현 + ground truth 없음. 자동 재구성은 시뮬레이션 → no-simulation 정책상 measured fact 제시 금지, low-trust flag 의무, human 확정 전제.
- (참고) **#3 의 'deterministic'은 파라미터 pin 이후 조건부** — 파라미터 선택은 human 판단이므로 soft gate 에 노출(렌즈 내부 고정 금지). 단 파라미터 고정 시 완전 재현되므로 #4/#5 와 달리 1차 적격.

### 버전/출처 검증 상태 (정직 표기)

- 5종 모두 원본 JSON `verified: true` + source_url 동반. 단 본 작업에서 **나는 URL 을 독립 재fetch 하지 않았다** — verified 플래그는 연구 단계의 표기를 그대로 인용한 것.
- 1차 출처 신뢰도: **#1 Tarjan 1972 SIAM** (foundational, 강), **#2 Martin** (1994 Object Mentor → 2002 APPP → 2017 Clean Architecture, Wikipedia 가 메트릭셋을 2002 책에 귀속), **#3 Gall 1998 ICSM + Zimmermann 2004 ICSE/2005 TSE + D'Ambros 2006/2009 WCRE** (peer-reviewed 다중), **#4 Mancoridis 1998/1999 + Mitchell 2006 TSE + Harman 2011 TSE / Tornhill 2015·2018 서적 + code-maat/CodeScene** (학술+실무), **#5 Brandolini Leanpub + Avanscoperta** (저자 1차 자료, 단 비-peer-reviewed 워크숍 방법론).
- 주의: #2 의 일부 source_url 이 Wikipedia(2차 출처) — 메트릭 정의는 표준적이나 1차 귀속은 Wikipedia 경유. #5 source_url 은 저자 상업 훈련사(Avanscoperta) 페이지 = 1차이나 상업적 맥락.