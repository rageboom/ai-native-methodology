# plan — 갭 1 보강 설계: 코드-내부 의존(call-graph) 운영 컨텍스트화

> DEC-2026-06-08-dep-graph-dependency-axis-gaps 갭 1 보강 설계. 4원칙 1단계(깊은 숙지→plan).
> **상태: 종결 (옵션 2 채택 / 2026-06-08 / 코드 0)**. 사용자 결단 = "옵션 2로 진행" → 갭 1 = "이미 대부분 해소" 결론을 DEC-2026-06-08 갭1 항목에 반영 + 잔존(A-1·A-2) living-sync 로드맵 carry 흡수. 핵심 = 갭 1 **reframe** — "SSOT 미구축"이 아니라 "reference-lens 로 구축됨 + 운영 배선 미완". SSOT 승격 명시 거부.

## 1. 깊은 숙지 — 현 상태 전수조사 (코드 실측)

### 1-1. 코드-내부 의존은 3 층위에 흩어져 있다

| 층위 | 무엇 | 결정론 gate 참여? | 코드 위치(실측) |
|---|---|---|---|
| **SSOT** (`artifact-graph.json`) | 코드 = dangling `implements` target + 노드 `code_pointers` 배열 | ❌ (buildIndex 가 dangling drop / code_pointers = 데이터) | `impact-analyzer.js:97` dangling skip |
| **view-time** (`dep-graph-viz`) | code/contract leaf 합성 + codegraph 함수·`calls`·`contains` 부착 | ❌ (synthetic / `calls`·`contains` ∉ 8 edge_type → analyzeImpact 무시) | `codegraph.js:4·88`, `augment.js` |
| **federation** (`context-federator`) | navigate(의미 영향) × codegraph(callers/callees/impact) join → `context-cache.json` | ❌ (reference-lens / non-gating / DEC-2026-06-02) | `federator.js:268·301` |

### 1-2. 이미 구축된 것 (재발명 금지)

- **context-federator** (DEC-2026-06-02 / federator 28/28 / main `8c82fb4b` 미릴리스): 앵커 Tier-1 노드 → `code_refs`(codegraph callers/callees/impact) + `data_refs`(legacy sql-inventory/db-schema/BR). 2축 델타 캐시(graph_stamp/codegraph mtime). `--prompt` 결정론 식별자 매칭. **결정론·reference-lens·non-gating·opt-in.**
- **living-sync anchor-lift** (DEC-2026-06-07): 손수정 코드 → anchor-lift(파일→주인 노드) → 의미 천장(리팩터=IMPL/동작=BHV·AC/룰=BR) human-confirmed 상향 → 천장부터 forward. = **코드 변경의 상향(code→artifact) 전파 경로 이미 정의** (단 파일 granularity).

### 1-3. trust 모델 = codegraph SSOT/gate 승격 **금지** (이미 정립 / 비협상)

- DEC-2026-06-02 §2: codegraph = **휴리스틱 신호** → 어떤 결정론 gate 에도 inject ❌. 실증 함정: codegraph `query "selectDataConfirmList"` = 동명 **Java 메서드** 자신만만 오매칭 / legacy `impact` = DB 영향 **0줄**. gate 가 믿으면 SQL-breaking 통과.
- memory `feedback_chain_driver_deterministic_axis` (STRONG-STOP): 결정론 도구 안 휴리스틱/LLM inject ❌.
- DEC-2026-06-06-codegraph-probe-4: 동적 와이어링(route 일부) 미링크 = 언어무관 상존 → hard 신뢰 상한.

### 1-4. 결론 — 원래 갭 1 "후보 (a) SSOT hard 엣지 승격" 은 trust 모델과 충돌 → **reframe 필요**

IMPL 노드가 결정론 gate 층에서 "블랙박스(leaf)" 인 것은 **의도된 trust 경계** (false-confidence 함정 차단). 보강의 정답 = SSOT/gate 승격이 아니라 **reference-lens 의 운영 배선 강화 + 역방향(code→node) 신설 + 정직 표면화**.

## 2. 잔존 진짜 갭 (보강 대상 = federator 가 아직 못 하는 것)

| # | 잔존 갭 | 현 상태 | 운영 영향(P0) |
|---|---|---|---|
| **G1-a** | federation 이 living-loop 에 미배선 | `context-cache.json` → work-unit `sync_sources` 자동등재 = **carry** (DEC-2026-06-02 carry #2). chain-driver grep `context-cache` = 0건 | 변경 감지(sync-loop) 시 코드-레벨 영향이 자동 동반 안 됨 → 수동 query 의존 |
| **G1-b** | **역방향 부재** (code symbol → 영향 artifact 노드) | federator = node→code 단방향 (`selectOriginNodes`). 역방향은 `--prompt` 식별자 substring 매칭뿐(약함) | "함수 X 바꿨다 → 어느 IMPL/BHV 영향?" 을 symbol granularity 로 못 답함. anchor-lift 는 **파일** granularity |
| **G1-c** | IMPL 노드의 "코드 열림 가능" 미표면화 | navigate/trace-view 가 IMPL 을 leaf 로 표시 — federator 로 callers/impact 회수 가능함을 안내 안 함 | LLM/사람이 코드 블랙박스를 silently leaf 로 오인 (federation 자산 미활용) |

## 2-R. Research 결과 (2원칙 / 2026-06-08) — 설계 대폭 축소

### Senior 적대검토 REVISE@0.72 (전건 실측 검증 완료)

- **reframe(SSOT 승격 거부) = 타당** ✓ (impact-analyzer.js:20-27 8 edge_type 에 calls/contains 부재 + DEC-2026-06-02 §2 삼중잠금 + 실증 함정 확인 / "사용자가 SSOT 통합 원했는데 회피" 가설 기각).
- **B-1 (A-2 과장)**: `federator.js:286-291` 이 `impact.affected`(역 transitive blast)를 **이미 부착**. A-2 역방향 = 그 위 code_pointers 역인덱스 ~30줄 후처리일 뿐 — "신규 결정론 코어" ❌ → federator `--symbol` 모드로 재포지션.
- **B-2 (A-3 이미 출하)**: `skills/dep-graph-navigator/SKILL.md:86-108` 에 **"코드 흐름 lens — context-federator"** 섹션 완비(--origin/--prompt 예시 + reference-lens 주석). navigate 축 표면화는 **이미 존재** → A-3 navigate 부분 DROP. trace-view 잔여는 가치 미입증.
- **C-3 (A-1 의미 오염)**: context-cache(codegraph 파생 / mtime 변동 큼)를 `sync_sources`(canonical analysis baseline)에 직접 등재 시 **markDrift noise 폭증**. → 별도 "동반 회수 hint" 채널 필요 (sync_sources 직접 등재 ❌).
- **C-2 (A-2 수요 미측정)**: symbol-granularity 역질의가 file-granularity anchor-lift 로 부족하다는 **실수요 측정 0** → 동작 dogfood ≠ 수요 입증. 수요 grounding 없으면 carry.
- **C-1**: 방향 B = reject 아닌 **조건부 carry** 보존.

### 산업 corroboration (신뢰도 0.85)

"정적 call-graph 를 직접 hard gate 로 쓰면 위험 / navigation·affected-scope 보조나 명시적 의존선언 기반에서만 신뢰" = 업계 관행 강하게 지지. Sourcegraph(precise/search **trust-tier 분리** / 둘 다 navigation 전용) · CodeQL(raw 그래프 아닌 **정제 query 결과 + 신뢰등급**을 gate) · Nx/Bazel(affected-gate 는 **명시 의존선언/수동 보정**으로 완전화 후에야 성립) · ISSTA 2024(정적 도구 동적 메서드 **평균 61% 누락**). → **heuristic codegraph 를 결정론 gate 로 승격 안 하고 reference-lens 유지 = 업계 정합.**

### 종합 — 갭 1 은 이미 대부분 해소됨

federator(node→code + impact.affected) + SKILL 코드흐름 lens + anchor-lift(code→artifact 파일단위 전파) = 코드-내부 의존의 운영 회수 경로가 **이미 출하**. 잔존 = (1) A-1 living-loop 동반회수 배선(진짜 가치 / 단 채널 설계 미해결 / living-sync 로드맵 중첩) (2) A-2 symbol 역질의(저렴하나 수요 미측정). SSOT 승격은 명시 거부.

## 3. 설계안 — 2 방향 (사용자 결단 fork)

### 방향 A (권고) — reference-lens 운영 배선 강화 (trust 모델 존중)

SSOT·gate 무변경. federation 을 **운영 루프에 배선 + 역방향 신설 + 정직 표면화**.

- **A-1 (G1-a)**: `context-cache.json` 을 work-unit `sync_sources` 에 자동등재 → living-loop markDrift 연동. 변경 감지 시 코드-레벨 reference-lens 가 동반 회수. (DEC-2026-06-02 carry #2 실현 / non-gating 유지)
- **A-2 (G1-b)**: federator 에 **역방향 결정론 조회** `resolveSymbolToNodes(symbol, graph)` 신설 — codegraph `impact(symbol)`(역 transitive) → 영향 파일 집합 → 그 파일을 `code_pointers` 로 가진 artifact 노드 역인덱스 join. **결정론 only** (codegraph 출력 + code_pointers 매칭 / AI 재유추 ❌ / reference-lens). 미해결 = `unresolved:true` 정직.
- **A-3 (G1-c)**: `navigate`/`trace-view` 가 IMPL(또는 code_pointers 보유 노드) 표시 시 "코드 흐름 lens 가능 (`context-federator --origin <id>`)" **포인터 한 줄** 표면화 (reference-lens 명시 / gate inject ❌ / check31·check33 동형 trust 가드).

### 방향 B (비권고) — bounded SSOT 승격 (trust 모델과 긴장)

codegraph `calls` 를 SSOT 에 **별도 confidence tier**(`heuristic`)로 추가 + impact-analyzer 가 gate 모드에선 무시, navigate 표시 모드에선 traverse. → 그래프 폭증(함수 1000s) + 2축 trust tier 복잡도 + false-confidence 함정 재유입 위험. **DEC-2026-06-02 trust 삼중잠금과 정면 긴장.** §8.1 corroboration 부재 시 채택 ❌.

## 4. 권고 (research 후 갱신) — 최소·정직

research 가 "신규 작업"을 대폭 축소시킴. 정직한 권고:

- **갭 1 의 대부분은 이미 reference-lens 로 해소됨** (federator + SKILL lens + anchor-lift). SSOT 승격은 trust 모델 + 업계 정합(0.85)으로 **명시 거부**.
- 잔존 진짜 가치 = **A-1 한 조각** (living-loop 동반회수). 단 sync_sources 오염 회피 채널 설계가 선결 + living-sync 로드맵과 중첩.
- A-2 = 저렴한 `--symbol` opt-in 이나 **수요 미측정** → 측정 후 격상 carry.
- A-3 = navigate 부분 **이미 출하**(DROP) / trace-view 잔여는 가치 미입증.

### 4-1. 권고 시행 옵션 (사용자 결단)

- **옵션 1 (최소 정식)**: A-1 만 정식 — context reference-lens 를 living-loop 에 **별도 동반회수 hint 채널**로 배선(sync_sources 직접 등재 ❌ / markDrift noise 회피). A-2 는 동반 `--symbol` opt-in(저렴). B = 조건부 carry. A-3 = 문서 정합만.
- **옵션 2 (DEC 갱신만 / 코드 0)**: "갭 1 = 이미 해소" 결론을 DEC-2026-06-08 갭1 항목에 반영 + 잔존(A-1) 을 living-sync 로드맵 carry 로 흡수. 지금 코드 변경 0. (재작업 최소·YAGNI 최강 정합)
- **옵션 3 (방향 B / 비권고)**: bounded SSOT 승격 강행 — trust 모델·업계 정합 위배 + 그래프 폭증. 미입증 gate 수요 발생 시에만.

> 권고 = **옵션 2 또는 옵션 1**. 품질 1순위/재작업 최소/no-engineification/YAGNI 정합. "보강 설계" 의 정직한 결론이 "대부분 이미 있다" 일 수 있음 — 없는 일을 만들지 않음.

## 5. 4원칙 추적 / 검증 계획

- **1원칙(숙지)**: 본 plan (impact-analyzer·codegraph·augment·federator·living-sync DEC 전수 실측 / §1).
- **2원칙(research)**: Senior 적대검토(방향 A vs B / SSOT 승격 거부 타당성) + 산업 corroboration(Sourcegraph/CodeQL/Nx 가 코드그래프를 traceability·gate 에 어떻게 trust 하는가 — "heuristic code-graph 를 gate 에 안 건다" 입증). → `research-gap1-code-internal-dependency.md`.
- **3원칙(승인)**: 방향 A/B fork + 시행 슬라이스 순서 사용자 승인 후 코드.
- **4원칙(실패시)**: Lessons Learned 본 plan 기록.
- **검증(no-simulation)**: 실 codegraph(env-gated smoke / poc-18 TS index) + 실 CLI subprocess + workspace 무회귀 + release-readiness 무회귀(federator non-gating 유지 확인).

## 6. 정합성 self-check

| 제약 | 방향 A 정합 |
|---|---|
| json 단독 SSOT | ✓ SSOT·schema 무변경 (역방향=조회 / cache=reference-lens) |
| 결정론 axis (STRONG-STOP) | ✓ resolveSymbolToNodes = codegraph 출력 + code_pointers 결정론 join (AI 재유추 0) |
| trust 모델 (codegraph gate inject ❌) | ✓ reference-lens 유지 / gate 무배선 / 표면화도 명시 reference-lens |
| §8.1 단일 PoC 과적합 | ✓ 각 slice ≥2 도메인 dogfood 의무 |
| no-engineification | ✓ stateless CLI 조회 / 서버·임베딩 ❌(carry) |
| navigate 재발명 ❌ | ✓ navigate/codegraph verbatim, join glue 만 (DEC-2026-06-02 paradigm) |

## 7. Lessons Learned

- 갭 진단 문서의 "후보 (a) SSOT 승격" 을 액면 수용 안 하고 trust 모델·기존 federator 자산을 실측해 reframe → SSOT 승격이 trust 모델·업계(0.85) 양쪽 위배임 확인.
- **research 가 "보강 작업" 을 대폭 축소**: A-3(navigate lens) 이미 출하(SKILL.md:86) / A-2 는 federator impact.affected(L286-291) 위 얇은 join / 진짜 잔존은 A-1 한 조각. → "보강 설계" 의 정직한 결론 = "갭 1 은 대부분 이미 해소" (없는 일 만들지 않음 / YAGNI·재작업 최소 정합).
- Senior 주장도 전건 실측: S4 "trace-view no-op" 인용은 빗나감(실은 per-BC S3 whole-file no-op / L228) — Senior 결론 방향은 유효하나 인용 정밀도는 직접 검증해야 했음 (self-recorded-fact-validation).

## 참고

- DEC-2026-06-08-dep-graph-dependency-axis-gaps (갭 1 원천)
- DEC-2026-06-02-context-federation (federator = 갭 1 절반 이미 구현 / trust 모델 삼중잠금)
- DEC-2026-06-07-living-sync-operating-model (anchor-lift = code→artifact 상향 / leaf reachability 공백 명시)
- DEC-2026-06-06-codegraph-probe-4-python-ts (codegraph 동적 와이어링 사각 = hard 신뢰 상한)
- `tools/context-federator/src/federator.js` · `tools/chain-driver/src/impact-analyzer.js` · `tools/dep-graph-viz/src/codegraph.js`
- memory `feedback_chain_driver_deterministic_axis` (STRONG-STOP)
