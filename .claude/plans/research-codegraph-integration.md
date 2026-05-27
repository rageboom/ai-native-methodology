# Research — codegraph 통합 design

> 4원칙 §2 (research). 본 doc = `.claude/plans/research-codegraph-integration.md`.
> 작성일: 2026-05-27 (session 49차 / plan-codegraph-integration.md §2 진입).
> 출처: (1) 메인 직접 WebFetch (F-015 cross-validation 정합) + (2) B sub-agent industry-case + (3) D sub-agent Senior critique. C sub-agent (codegraph fact 정제) 는 raw 가 핵심 사실 노출 시점에서 보류 (사용자 결단 후 재발동 검토).
> 관련: `.claude/plans/plan-codegraph-integration.md` (§1 plan) / `docs/dependency-graph.md` / R19 / R7 self-referential corrective drift / §8.1 strict / `feedback_senior_stop_signal_absorption.md`.

---

## 1. raw fetch 핵심 사실 (메인 직접 / 2026-05-27)

### 1.1 codegraph repo (`colbymchenry/codegraph`)

| 항목 | 사실 | 출처 |
|---|---|---|
| 최신 버전 | **v0.9.5 (2026-05-26 / 본 doc 작성 1일 전)** + v0.9.4 (2026-05-24) | github releases |
| 출시 day | **day-one 3일 차 OSS** (v0.9.0 = 2026-05-21 / self-contained runtime 첫 출시) | github releases |
| 총 release | 11 (v0.7.7 ~ v0.9.5) / 371 commits | github repo |
| 핵심 metric | "Average: 35% cheaper · 57% fewer tokens · 46% faster · 71% fewer tool calls" (self-published) | README |
| MCP tool 10종 | search / context / trace / callers / callees / impact / node / explore / files / status | README |
| 지원 언어 | TS / JS / Py / Go / Rust / Java / C# / PHP / Ruby / C / C++ / **Obj-C (v0.9.5)** / Swift / Kotlin / Scala / Dart / Svelte / Vue / Liquid / Pascal / **Lua/Luau (v0.9.0)** | README |
| tree-sitter 버전 | **명시 부재** (version pin 부재) | README |
| **symbol id / anchor schema** | **README 안 명시 부재** | README quote: "Not present. No explicit symbol ID or anchor schema documented in the provided content." |
| SQLite table schema | **README 안 명시 부재** | README |
| FS event debounce | default 2000ms / `CODEGRAPH_WATCH_DEBOUNCE_MS` env / 100ms~60s clamp | README |
| edge provenance | `provenance:'heuristic'` + `metadata.synthesizedBy` (예: `swift-objc-bridge`, `rn-event-channel`) | README |
| **CLAUDE.md instruction** | **"the graph provides context, not requirements"** | CLAUDE.md verbatim |
| 가치 axis | "wall-clock latency + tool-call count" 우선 (token cost ❌) | CLAUDE.md |

### 1.2 ★ critical sub-fact (사실 only / 추측 ❌)

1. **codegraph 의 symbol id 표기 규약 = repo 공식 docs 안 명세 부재**. 본 사실 = plan §1.2 의 "추측 ❌" 와 정합. **Cluster B research carry 의 L0 답변 = "공식 명세 부재"**.

2. **codegraph 의 CLAUDE.md = "graph provides context, not requirements"** — 본 instruction = 본 방법론의 "결정적 검증" paradigm 과 trust 모델 **clash signal**. Senior critique R11 정조준.

3. **codegraph v0.9.5 출시 = 본 doc 작성 1일 전**. 본 plan trigger 시점 = day-one 2일 차 → 1일 차로 갱신. R8 maturity risk 더 심화.

4. **tree-sitter version pin 부재** = 언어별 parser 안정성 risk + 본 방법론 PoC 재현성 risk. R8 보강 사실.

---

## 2. B sub-agent — industry 선행 사례 (요약)

### 2.1 Sourcegraph SCIP

- **schema 단일 SSOT** = `scip.proto` Protobuf. core message 4 (Document / Occurrence / Symbol / Descriptor).
- **symbol id BNF grammar 명시**: `<symbol> ::= <scheme> ' ' <package> ' ' (<descriptor>)+ | 'local ' <local-id>`. 4-tuple (scheme / manager / package-version / descriptor chain).
- **cross-language bridge** = string identity 만 (consumer 가 semantic 가중치 결단).
- **출처**: `github.com/sourcegraph/scip/blob/main/scip.proto`.

### 2.2 Glean (Meta)

- **facts 모델** = immutable terms DAG / RocksDB backend / Angle (Datalog 계 logic language).
- 본문 인용: *"non-recursive queries only"* — query cascade 무한 루프 차단 paradigm.
- IR ↔ source bridge 메커니즘 = location 필드 first-class.
- **출처**: `glean.software/docs/introduction`.

### 2.3 FalkorDB code-graph / Continue.dev / Aider / Cursor / Tabby (요약)

- **FalkorDB**: Redis graph DB 위 코드 의존성 표현. node payload schema = README 본문 부재.
- **Continue.dev**: embedding (transformers.js local) + keyword 혼합. `nRetrieve` 25 → `nFinal` 5 rerank.
- **Aider**: NetworkX PageRank on def-ref graph. `--map-tokens` 1k default. tree-sitter `.scm` query + Pygments fallback (reference 부재 언어).
- **Cursor**: Merkle tree (filename + SHA-256) 로 diff branch walk. upload = embedding only / source = local 격리.
- **Tabby**: 공식 IR layer 표현 부재 (사실 only 원칙으로 결론 보류).

### 2.4 통합 활용 패턴 3 종 (본 방법론 적용 권고)

| 차원 | 권고 | 근거 사례 |
|---|---|---|
| **(a) bridge 표기 규약** | `code_pointer.{symbol_id, path, range}` 3 분리 필드 (SCIP BNF style) — path:line 단일 string 은 legacy fallback 만 | SCIP |
| **(b) graceful degradation** | (1) DB 없음 = WARN + grep fallback (2) `.codegraph-ignore` 같은 scope 제한 (3) MCP tool exit 0 + JSON `{status:"degraded", reason:"no_codegraph_db"}` | Aider Pygments fallback / Continue local-first |
| **(c) cross-feed 오염 회피** | (1) codegraph 결과 = evidence pointer 만 (artifact-graph 가중치 ❌) (2) chain-driver gate-eval = codegraph 결과 절대 보지 ❌ (3) 1-방향 bridge (codegraph → artifact-graph evidence ✅ / 역방향 ❌) (4) Glean non-recursive 사상 | SCIP string identity / Glean non-recursive / Aider PageRank 1-방향 / chain-driver 결정론 axis memory 정합 |

### 2.5 Sourcegraph SCIP 채택 시사점

★ **B agent 강한 권고** = SCIP grammar 그대로 채택. 근거: (1) Sourcegraph 공식 open spec / 7+ 언어 indexer (Java/TS/Rust/C++/Ruby/Python/C#) (2) 재발명 ❌ (3) codegraph 자체 spec 부재 → 본 방법론이 SCIP 표준 위에 올라타면 codegraph 결과를 SCIP id 로 정규화 가능.

---

## 3. D sub-agent — Senior critique (요약 + 전면 흡수 권고)

### 3.1 Senior 결단

| 항목 | 결단 |
|---|---|
| 현 plan 그대로 §2 진입 GO | **35%** (권고 ❌) |
| REVISE 후 §2 진입 GO | **60%** (R7 측정 평가 통과 시) |
| scope-out 권고 강도 | **medium~high** |
| 최종 한 줄 | **α 단독 시행 (v10.2.0 PATCH 수준) + β/γ scope-out + 6 개월 후 Type 2 trigger 재평가** |

### 3.2 Cluster 별 critique

| Cluster | Senior 결단 | 핵심 근거 |
|---|---|---|
| **A** (phase 진입 α/β/γ) | **REVISE @ 55%** | α 단독 사용자 가치 = 0~5% / cooling-off 폐기 ≠ session 무제한 release / LL-v930-02 4 release cap 정합 모호 |
| **B** (symbol_id research carry) | **GO @ 90%** | research negative 시 폐기 발동조건 명문 추가 의무 |
| **C** (3 mode validator) | **GO @ 85%** | `--symbol-strict` opt-in UX 명세 부재 |
| **D** (federation 6 단계) | **REVISE @ 40% — 가장 critical** | (1) "참고 차원만" = UX wrapper 가치 (2) codegraph "trust results" vs 본 방법론 "결정적 검증" trust 모델 clash (3) bridge 1점 = chain 5 stage 중 implement leaf 만 / surface 작다 (4) Type 2 외부 사용자 자연 trigger 부재 |
| **E** (additive schema) | **GO @ 95%** | 단독 시행 가장 안전 |
| **F** (warn-only criterion) | **REVISE @ F3** | "영구 warn → warn 무시 학습" / R19 noise 증가 |
| **G** (ADR-CHAIN-013 신설) | **REVISE → ADR 보류 + DEC 만** | paradigm 진전 ❌ (단순 wrapper) → ADR 자격 약함 |
| **H** (3 stack PoC) | **REVISE @ 50%** | TS 중복 (NestJS + React 양쪽 TypeScript) / poc-02 + poc-03 2 stack 으로 축소 권고 |

### 3.3 R1~R10 재평가 + R11~R13 신설

| Risk | 현 plan | Senior 권고 |
|---|---|---|
| R4 (자기-도구 simulation 회피) | high | enforcement 메커니즘 추가: (a) validator exit code 4 = "skipped due to env" warn-only / 2 = strict hard fail (b) skill body 명문 (c) PoC fixture `expected_skip_on_no_codegraph` flag — schema 만으로 ❌ |
| R7 (self-referential drift) | medium | **high 격상**. 측정 criterion 명문화: (a) 외부 사용자 자연 요구 ≥ 1 사실 인용 (b) 사용자가 codegraph 직접 호출로 얻을 수 없는 가치 사실 인용 (c) 사후 corroboration ≥ 2 PoC. **현 상태 = (a)❌ (b)❌ (c)hypothesis 부재 → scope-out 자동 발동 검토** |
| R8 (codegraph OSS 수명) | low | **medium 격상**. day-one 3일 차 / 0.x semver / maintainer 1인 / 외부 corroboration 부재 |
| **R11 신설** | — | trust 모델 paradigm clash (medium) |
| **R12 신설** | — | Type 2 외부 사용자 부재 trigger (high) |
| **R13 신설** | — | research negative 시 폐기 발동조건 부재 (low→medium) |

### 3.4 Senior 의 핵심 한 줄

> "본 plan trigger = self-referential 단 1회 / 외부 사용자 자연 요구 = 0건 / federation 가치 = UX wrapper 수준 / codegraph = day-one 3일 차. 본 design 의 본격 prod 가치 진전 = 미입증. **carry 정리 직후 신규 axis 추가 = R7 self-referential corrective drift 함정 medium**."

---

## 4. ★ 사실 명확도 × 비용 평가 (feedback `senior_stop_signal_absorption` paradigm 적용)

본 paradigm = Senior STOP signal 흡수 시 2축 평가 의무. 전면 흡수 vs soft 흡수 vs 거부 분리.

### 4.1 사실 명확도 평가 — **높음**

| Senior 주장 사실 | 검증 | 사실 명확도 |
|---|---|---|
| codegraph = day-one 3일 차 OSS | raw fetch v0.9.5 = 2026-05-26 확인 | **확정** |
| 외부 사용자 자연 요구 ≥ 1 = 0건 | conversation history 안 사용자 발화 1회 ("plan-codegraph-integration.md 작성해줘") | **확정** |
| codegraph repo 안 symbol_id 명세 부재 | raw fetch quote: "Not present. No explicit symbol ID or anchor schema documented" | **확정** |
| trust 모델 clash | CLAUDE.md quote: "the graph provides context, not requirements" vs 본 방법론 결정적 검증 | **확정** |
| federation 가치 = UX wrapper | 사실보다 평가 / debatable but defensible | 평가 |
| tree-sitter version pin 부재 | raw fetch 확인 | **확정** |

→ 6개 중 5개 = **확정 사실**. 사실 명확도 = **높음**.

### 4.2 비용 평가 — **높음**

본 design 시행 시 비용:
- α phase: schema 2 (code-pointer + impl-spec) + validator 3 mode + graph-synthesizer 확장 + PoC ≥ 2 실측 + release-readiness #17 + ADR-CHAIN-013 + DEC = ~10 자산 변경
- β phase: chain-driver federation 알고리즘 + 추가 PoC + ADR 또는 추가 DEC = ~6 자산 변경
- γ phase: MCP 대칭 (Type 2 trigger 후 carry) = ~5 자산 변경
- 종합: ≥ 20 자산 변경 + ≥ 2 PoC × 3 stage = 6 e2e 입증 = **고비용**

### 4.3 흡수 결단 — **전면 흡수 권고**

사실 명확도 높음 (5/6 확정) × 비용 높음 (≥ 20 자산 + ≥ 6 e2e) → memory paradigm 정합 = **전면 흡수**.

---

## 5. 결단 분기 (사용자 선택 4안)

본 doc 끝나면 4원칙 §3 사용자 승인 차례. 현재 §2 research 결과 = Senior 강한 REVISE/scope-out 권고. 사용자 결단 분기 4안:

### 분기 1 — 전면 흡수 / scope-out 권고 채택

- plan-codegraph-integration.md 의 §3 채택안 전체 scope-out 결단 (DEC 신설 / ADR ❌)
- carry queue 등록 = "Type 2 외부 사용자 자연 요구 발생 시 재발동"
- session 종결 + 다른 axis 진입 (Jira 표준 carry 또는 다른 carry)
- **장점**: R7 self-referential corrective drift 회피 / 비용 0 / 본 방법론 안정성 보존
- **단점**: 본 conversation 안 시간 (~25분) 매몰 비용 / "plan-codegraph 작성해줘" 사용자 결단 무효화

### 분기 2 — 부분 흡수 / α 단독 v10.2.0 PATCH 만 시행

- Cluster E (additive schema) 만 시행 — `code_pointer.{symbol_id, path, range}` 3 분리 필드 (SCIP BNF style 채택) + `impl-spec` `symbol_anchors[]` optional
- Cluster C (3 mode validator) skip — α 만으로는 `--symbol-check` 의미 약함 / 단순 schema only
- Cluster D (federation) / G (ADR) scope-out
- Cluster H = poc-02 + poc-03 2 stack 만
- **장점**: 본 방법론 표현력 ↑ (code_pointer SCIP 정합) + breaking 0 / 비용 중간
- **단점**: 사용자 가치 = "schema 격상" 수준 / federation 가치 미입증 / R7 부분 회피

### 분기 3 — 전면 진입 / 현 plan §3 채택안 그대로

- α → β → γ 모두 시행 (single session 안 4 release cap 활용)
- C agent 발사 + research carry 정식 해소 + plan REVISE-1 갱신
- **장점**: 본 plan 결단 사용자 결단 정합 / paradigm 진전 자격 시도
- **단점**: Senior REVISE @ 60% (R7 측정 fail 검토 의무) / 외부 사용자 trigger 0 / R8 medium / R12 high → 자기-결재 risk

### 분기 4 — REVISE 진행 / 부분 흡수 + 본 doc 보강 후 사용자 묶음 결단

- 본 doc 의 Senior 핵심 권고 9 항 (§3.3 + 4.3) 흡수 → plan-codegraph-integration.md REVISE-1 작성
- C sub-agent 추가 발사 (Cluster B symbol_id research carry 정식 정제 — SCIP grammar 채택 권고 흡수 + tree-sitter parser 안정성 정제)
- REVISE-1 작성 후 사용자 결단 묶음 6 항 정식 차례
- **장점**: §2 research 정식 완수 / 분기 1~3 중 어느 쪽이든 사용자 결단 사실 기반 풍부
- **단점**: 본 session 시간 추가 ~30분 + R7 회피 ❌ (계속 self-referential)

### Senior + B agent 통합 권고

★ **분기 2 (α 단독 v10.2.0 PATCH) 권고** — Senior 권고 정합 + B agent SCIP grammar 활용 + 본 방법론 표현력 ↑ + 비용 작음 + R7 부분 회피.

차선 = **분기 1 (전면 scope-out)** — R7 회피 완전. 단 매몰 비용 발생.

비권고 = **분기 3** (R7 함정 medium) / **분기 4** (계속 self-referential).

---

## 6. References

### 출처 (모두 2026-05-27 fetch)

- `github.com/colbymchenry/codegraph` — README (WebFetch)
- `github.com/colbymchenry/codegraph/releases` — v0.7.7 ~ v0.9.5 (11 releases)
- `raw.githubusercontent.com/colbymchenry/codegraph/main/CLAUDE.md`
- `github.com/sourcegraph/scip` + `scip.proto`
- `github.com/facebookincubator/Glean` + `glean.software/docs/introduction`
- `github.com/FalkorDB/code-graph`
- `docs.continue.dev/customize/context/codebase`
- `aider.chat/docs/repomap.html` + `github.com/Aider-AI/aider/blob/main/aider/repomap.py`
- `cursor.com/blog/secure-codebase-indexing` + `cursor.com/docs/context/codebase-indexing`
- `github.com/TabbyML/tabby`

### 정합 / 충돌 paradigm

- `feedback_senior_stop_signal_absorption.md` — 본 doc §4 정합 / 전면 흡수
- `feedback_self_referential_corrective_drift.md` — Senior R7 정조준
- `feedback_quality_priority.md` — §8.1 strict 단일 PoC 과적합 회피
- `feedback_no_simulation_realized.md` — R4 enforcement 정합
- `feedback_sub_agent_validation.md` — F-015 raw fetch 정합 (메인 직접)
- `feedback_research_fact_validation.md` — 추측 ❌ / 본 doc 모든 사실 raw + 출처 표기
- `chain_driver_deterministic_axis.md` — Cluster D federation cross-feed 회피 권고 정합
- `R19 environment-dependent scope-out` — Cluster F F3 권고 정합

### 결단 trail (사용자 결단 후 추가)

- (분기 결단 후) DEC-2026-05-27-codegraph-integration-{scope-out | partial-absorption | revise} 신설 예정
- (분기 2 채택 시) ADR-CHAIN-013 신설 ❌ + plan REVISE-1
- (분기 1 채택 시) carry queue 등록 = "Type 2 외부 사용자 자연 요구 발생 시 재발동"

---

## 7. 본 doc 다음 단계

★ **사용자 결단 대기** — §5 분기 1~4 중 하나 결단 → 4원칙 §3 사용자 승인 + §4 시행.

C sub-agent 발사 = 분기 2~4 채택 시 재발동 / 분기 1 채택 시 skip.
