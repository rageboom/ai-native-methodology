# plan — MIS-371 [OP-CHAINROUTE-001] discovery 강제 진입 + 복잡도 비례 fast-path

> 티켓: [MIS-371](https://jira.smilegate.net/browse/MIS-371) · Epic MIS-366 · 브랜치 `MIS-371` (worktree)
> 절대 우선순위: 품질 1 / 재작업 최소화 2. §8.1 단일 PoC 과적합 회피.
> 4원칙 단계: ① 실측(완료) → **② plan.md(본 문서)** → ③ research.md → ④ 승인 → ⑤ 구현.

## 0. 문제 (사용자 8항목 요약)

discovery 는 분석 외 모든 변경의 입구·라우터인데, **질의가 너무 쉬우면** ⓐ 체인을 아예 안 타거나(drift) ⓑ 강제로 풀 체인을 태워 토큰을 낭비한다. 둘 다 나쁨. → "체인 강제 진입(④) + trivial 경량화(③⑤)"를 동시에 만족시키되, **어느 경로든 영향도·그래프 델타(⑥) + Jira 연동(⑦)은 보존**해야 한다.

## 1. 실측 결론 (재사용 vs 델타)

| 요구 | 현 상태 | 자산 |
| --- | --- | --- |
| ④ discovery 강제 | **부분** — advisory `routeEntry` + `coldStartSkipAheadReason` 하드블록(skip-ahead 만) | `hooks-bridge.js`, DEC-2026-06-18 |
| ⑥ 영향도/그래프 델타 | **성숙** — BFS impact + 변경종류별 정책 + 자동 mark + 시각화 | `impact-analyzer.js`, `chain-driver impact`, PostToolUse hook, dep-graph-viz |
| ⑦ Jira | **존재하나 plan stage 단일 4-level cascade(무거움)** | `ticket-sync` skill, `ticket-cascade-builder` |
| **③ trivial 우회 제거** | ❌ **triage 없음** (routeEntry 이분법) | — |
| **⑤ 경량 fast-path** | ❌ 체인 깊이 조절 없음 | — |
| ⑥⑦ fast-path 결선 | ⚠️ 머신은 있으나 trivial 경로엔 미배선 | — |

**핵심 발견 2가지** (설계 지렛대):
- `evaluatePolicyForEdges` 가 이미 변경종류를 `typo / item_add / item_remove / semantic_change` 로 구분 → **복잡도 축이 영향도 레이어에 이미 존재**.
- `living-sync §4` 표(L43–44): "이미 바뀐 파일의 레벨·크기 = 변경 감지기(결정론)" + "자연어 요청의 진입 노드·등급 = discovery 라우터(LLM 제안 + validator + 사람 게이트)". → **"등급(grade)" 개념이 이미 명세에 있음.** fast-path = 이 등급을 복잡도 tier 로 확장.

> 결론: ⑥⑦은 80% 존재, ④ 절반. 진짜 델타 = **③⑤ (triage + fast-path)** + **⑥⑦를 경로-무관 공통 의무로 결선**.

## 1.5 research 요지 (4원칙 ③ / 2026-06-24 가벼운 3-에이전트)
- **F-015 교차검증 (docs-checker)**: 실측 4주장 모두 사실. 정정 1 — `change_kind` 는 결정론 측정값이 아니라 **CLI 주입 선언값**(기본 semantic_change / `cli.js:2181`). ticket-sync = plan 단일 + 타 stage 호출 시 `F-TICKETSYNC-012` reject (`skills/ticket-sync/SKILL.md:31`).
- **산업 선례 (industry-case)**: 3단 tier + 복잡도 신호 = 산업 타당 (Google small-CL, SRE risk-tiering). 경량 경로 최소 의무(테스트/변경목록/플랫폼 리뷰) 보존 = Google SRE·DORA 선례. ⚠️ "그래프 노드 수" 위상 신호로 tier 가른 선례는 0건 → 의미축(Rust: 가시성+의미변경)과 conjunctive 결합 권고.
- **Senior 적대검토 = REVISE(blocking) 4건**: Q1 보수적 conjunctive 술어+BR deny-list / Q2 최소검증 결정론 하드게이트(snapshot_ref) / Q3 triage.js raw count만(change_kind ingest❌) / Q5 fast-path exit gate fail-closed(impact+ticket ref) + 토큰 실측. → 전부 §2·§4 에 반영 완료.
- 출처: google.github.io/eng-practices small-CLs · rust-lang.github.io/rfcs · sre.google/sre-book release-engineering · dora.dev streamlining-change-approval.

## 2. 설계 — 복잡도-tier discovery 라우팅 (§3.4 경계 준수)

### 2.1 불변식
- discovery = **보편 입구** (우회 0). trivial 도 반드시 거친다 → ③④.
- tier 가 **깊이**만 결정 (진입 여부 아님) → ⑤.
- ⑥ impact + ⑦ Jira = **tier 무관 공통 의무** (fast-path 라도 면제 ❌) → ⑥⑦.

### 2.2 triage (제안=LLM / 검증=결정론 / 확인=사람 — `feedback_chain_driver_deterministic_axis` STRONG-STOP 준수)
- **결정론 신호 (reference-lens / gate inject ❌)** — 신규 `chain-driver triage` (순수, scope-carve 패턴):
  - route-discovery origins 수 (닿는 그래프 노드 개수)
  - net-new 여부 (신규 노드 생성? = 비-trivial 신호)
  - layer span (단일 노드/단일 레이어 = trivial 신호)
  - 닿는 노드 subkind (BR/UC 포함 여부)
  - ⚠️ **`triage.js` 는 raw 그래프 count 만 emit — tier 판정 ❌** (판정은 skill/gate). `change_kind` 는 **LLM 선언값**(CLI 주입 / 기본 semantic_change)이므로 결정론 신호로 ingest 하지 않는다 (Senior Q3 — LLM 의미가 결정론 축에 스며드는 것 차단 / 일방향 skill→tool).
- **LLM 제안** — `discovery-from-nl-md` 가 신호를 받아 tier 제안 + reasoning + change_kind (의미 판정은 LLM 소관).
- **사람 gate #1** — tier 확정 (go/stop). Auto Mode 시 일괄 go.

### 2.2-a trivial 적격 술어 — **보수적 conjunctive + deny-list** (Senior Q1, blocking)
`trivial` 은 아래 **모두** 참일 때만 (하나라도 거짓 = `standard` 이상):
```
touched_node_refs == 1  AND  net_new == false  AND  layer_span == 1
  AND  닿는 노드 subkind ∉ { BR/business_rule, UC }
```
- **deny-list**: `rules.json`/business_rule 노드 또는 UC 노드 touch = **절대 trivial ❌** (선언된 change_kind 무관). → "1 노드지만 의미 큰 BR 변경"이 fast-path 로 새는 경로 차단.
- `change_kind` 는 **advisory tie-breaker 만** — 단독으로 trivial 충분조건 ❌ (선언값이라 위조 가능).
- 산업 선례 정합: Rust RFC = "가시성 + 의미변경" 2축으로 가름. 우리의 "노드 수" 위상 신호는 선례보다 명세적 → 단독 의존 ❌, 의미축(deny-list)과 **conjunctive** 결합 (industry-case: 노드-위상 단독 선례 0건).

### 2.3 tier → 경로
- `trivial` → **fast-path**: 얇은 change-record(아래) + impact + 경량 ticket. spec/plan/test/implement 스킬 팬아웃·multi-agent dispatch **생략**.
- `standard`/`deep` → 기존 풀 체인 (무변경).

### 2.4 fast-path 산출물 = thin change-record
풀 discovery-spec 의 최소 부분집합 — impact 엔진과 ticket 에 먹일 수 있는 최소치:
- `touched_node_refs[]` (route-discovery origins → 그래프 노드)
- `intent` (1줄)
- `change_kind`
- `tier: trivial` + triage 신호 스냅샷 (감사용)
→ schema 신규 1종 (또는 discovery-spec 의 `fast_path` 변형). strict additive.

### 2.5 공통 의무 결선 (⑥⑦) — **fast-path exit gate = fail-closed** (Senior Q5, blocking)
스킬 양심 의존 ❌ — analysis exit gate #0 와 동일한 결정론 fail-closed 패턴:
- **⑥ impact**: fast-path 가 thin record 의 `touched_node_refs` 로 `chain-driver impact --origin …` 호출 → 영향 closure + 정책 결정 기록 → thin record 에 `impact_closure_ref` 기입.
- **⑦ Jira**: trivial 용 **경량 단일-OP ticket** (ticket-sync confirmation gate 보존 / cascade 깊이 1 / ticket-cascade-builder 재사용) → thin record 에 `ticket_ref` 기입.
- **exit gate**: thin record 에 `impact_closure_ref` + `ticket_ref` 둘 다 없으면 **exit non-zero (GREEN 거부)**. → fast-path 라도 ⑥⑦ 가 조용히 빠질 수 없음.

### 2.6 trivial 최소 검증 = **결정론 하드게이트** (Senior Q2 / decision #2, blocking)
"최소 검증"이 이름만 바꾼 면제가 되지 않도록 — `unit-spec-oracle` 거짓 GREEN 함정 회피:
- `trivial ⇒ characterization_snapshot_refs ≥ 1 OR 명시 waiver` (v0.69.0 에 이미 추가된 `^SNAP-` 필드 재사용 / 닿는 노드에 bound).
- 얇은 gate 가 강제 — snapshot 도 waiver 도 없으면 GREEN ❌. 풀 test-spec 생성은 생략하되 검증 흔적은 의무.

## 3. 변경 지점 (예상)
- `tools/chain-driver/src/triage.js` (신규, 순수 결정론 신호)
- `tools/chain-driver/src/cli.js` (`triage` 커맨드 + fast-path glue: impact + ticket 호출)
- `hooks-bridge.js: routeEntry` (tier 분기 추가 / advisory 메시지에 tier 동봉)
- `skills/discovery-from-nl-md/SKILL.md` (tier 제안 책임 추가)
- `flows/discovery.phase-flow.json` (fast-path 분기)
- `schemas/` (thin change-record schema 1종, strict additive)
- `methodology-spec/living-sync-operating-model.md §4` + 신규 `DEC-2026-06-24-complexity-tier-fastpath`
- 본체 우선 (memory `feedback_methodology_body_priority`): schema/spec/flow/tool 먼저, PoC 산출물 후.

## 4. 검증 (≥3 시나리오 + 적대 negative 의무 — §8.1 과적합 회피 / Senior Q4)
서로 다른 종류로 — 단일-additive 한 모양 과적합 방지:
- (a) **cosmetic typo** → fast-path 발동 / 풀 팬아웃 0 / impact 기록 O / OP ticket 1건 / snapshot ref O.
- (b) **item_remove** (additive 아닌 종류) → fast-path 거동 동일 확인.
- (c) ❗ **적대 negative (의무)** — "1 노드만 닿지만 의미 큰 BR 변경" → **trivial 거부**되어 standard 이상으로 라우팅됨을 입증 (deny-list 가드 증명 / happy-path 아님).
- non-trivial: 신규 기능 → 기존 풀 체인 그대로 (회귀 0).
- **토큰 절감 = 실측만** — fast-path vs 풀 체인 fan-out count before/after 실측 (추정 ❌ / Senior).

## 5. 결정 확정 (사용자 승인 2026-06-24)
1. ✅ **tier = 3단** (`trivial` / `standard` / `deep`). 중간 회색지대 흡수.
2. ✅ **trivial = 최소 검증 유지** — 풀 test-spec 생성은 생략, characterization/smoke 수준 최소 검증은 의무. 완전 면제 ❌ (품질 1순위).
3. ✅ **강제 강도 = advisory + tier gate 시작** — 코드 write 하드블록은 PoC 후 별도 DEC (권고 채택).
4. ✅ **fast-path 산출물 = 신규 thin schema 1종** (strict additive / discovery-spec 변형 ❌).

## 6. Lessons / 리스크
- 결정론 도구에 LLM tier 판정 inject ❌ (STRONG-STOP). triage 도구 = 신호만, 판정은 skill/gate.
- 영향도·Jira 면제 유혹 차단 — fast-path 의 존재 이유가 "경량"이지 "생략"이 아님 (⑥⑦ 불변).
- §8.1 — 단일 trivial 예제로 일반화 금지. ≥2 시나리오 + 경계 케이스.
