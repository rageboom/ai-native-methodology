# DEC-2026-05-27-codegraph-integration-scope-out

> ⚠️ **SUPERSEDED by [DEC-2026-05-30-codegraph-essential](DEC-2026-05-30-codegraph-essential.md)** (2026-05-30). 본 scope-out 의 게이트 (carry 조건 (a) 외부 사용자 ≥1 + (b) v1.0+ ≥6mo maturity)는 **폐기** — 사용자가 codegraph 를 analysis 단계 필수 도구(Semgrep 동급)로 직접 결정. probe #1~#3(iBATIS/MyBatis/JPA) 작동 입증. 본 doc = 역사 trail 보존 (당시 self-referential trigger 판단은 그 시점 정합). 실 도구 wiring 은 `C-codegraph-essential-impl` carry.

**결단**: `colbymchenry/codegraph` OSS bridge 통합 design 전면 scope-out. plan-codegraph-integration.md §3 채택안 (A4 + B + C + D + E + F2 + G1 + H4) 전면 폐기. carry queue 등록 (Type 2 외부 사용자 자연 요구 발생 시 재발동 조건).

**작성일**: 2026-05-27 (session 49차 — 본 session 직전 v11.0.0 MAJOR pull 후 codegraph axis 진입 시도).

**relates to**: `.claude/plans/plan-codegraph-integration.md` §1 (2026-05-26 작성) + `.claude/plans/research-codegraph-integration.md` §2 (2026-05-27 작성).

---

## 1. 배경 (사실 sequence)

1. **2026-05-26 session 48차** — 사용자 결단 "plan-codegraph-integration.md 작성해줘" → 4원칙 §1 plan 작성 (`.claude/plans/plan-codegraph-integration.md` 246 line / α (code_pointer symbol 격상) + β (chain-driver federation) + γ (MCP 대칭) 3 phase A4 채택안 + Cluster B~H 결단).

2. **2026-05-27 session 49차 본 conversation** — 사용자 결단 "다음 작업으로 무엇을 진행할까요?" → AskUserQuestion 4 선택지 중 "codegraph 통합 §2 research" 채택 → 4원칙 §2 진입.

3. **§2 research 시행** = 3 sub-agent 병렬 + 메인 직접 WebFetch (F-015 cross-validation 정합):
   - **메인 raw fetch** = `github.com/colbymchenry/codegraph` README + releases + CLAUDE.md (2026-05-27 / 출처: WebFetch)
   - **B sub-agent (industry-case)** = Sourcegraph SCIP / Glean (Meta) / FalkorDB code-graph / Continue.dev / Aider repo-map / Cursor codebase indexing / Tabby
   - **D sub-agent (Senior critique)** = plan §3 채택안 + R1~R10 risk senior critique
   - C sub-agent (codegraph fact 정제) 는 raw 핵심 사실 노출 시점 보류 → 본 결단 시점 retract.

4. **research 결과** (research-codegraph-integration.md 통합):
   - **Senior critique = GO @ 35% / REVISE 후 GO @ 60% / scope-out 권고 medium~high**
   - **raw fetch 핵심 사실** 6건 모두 추측 ❌ / 출처 인용 확정.

5. **사용자 1차 결단** (분기 1 채택) = α 단독 v10.x PATCH (실제 v11.0.1 PATCH 자격) 시행 권고 채택.

6. **§4 시행 직전 사실 검증** (LL-fsim-11 paradigm 정합 / 5회 이상 연속 재발) = **PoC corroboration 자격 fundamental 부재 발견**:
   - 14 PoC 중 `impl-spec.json` 보유 = **단 2 PoC** (poc-05 + poc-14)
   - poc-05 (TS) + poc-14 (Python) 의 `impl-spec.json modules[].code_pointers[]` = **0개 (부재)**
   - poc-02 + poc-03 = plan REVISE-1 §R1.4 명시 PoC target = `impl-spec.json` 자체 부재

7. **사용자 2차 결단** (PoC 자격 부재 사실 보고 후) = **전면 scope-out** 채택.

---

## 2. Senior critique 핵심 (D agent)

| Cluster | Senior 결단 | 핵심 근거 |
|---|---|---|
| A (phase 진입 α/β/γ) | REVISE @ 55% | α 단독 사용자 가치 = 0~5% / cooling-off 폐기 ≠ session 무제한 release / LL-v930-02 4 release cap 정합 모호 |
| D (federation 6 단계) | **REVISE @ 40% — 가장 critical** | "참고 차원만" = UX wrapper 가치 / codegraph "trust results" vs 본 방법론 "결정적 검증" trust 모델 clash / bridge 1점 = chain 5 stage 중 implement leaf 만 |
| H (3 stack PoC) | REVISE @ 50% | TS 중복 (NestJS + React 양쪽 TypeScript) / isomorphic 약함 |

**Senior 핵심 한 줄** (verbatim from agent return):
> "본 plan trigger = self-referential 단 1회 / 외부 사용자 자연 요구 = 0건 / federation 가치 = UX wrapper 수준 / codegraph = day-one 3일 차. 본 design 의 본격 prod 가치 진전 = 미입증. carry 정리 직후 신규 axis 추가 = R7 self-referential corrective drift 함정 medium."

---

## 3. 사실 누적 (scope-out 결단 근거)

| # | 사실 | 출처 |
|---|---|---|
| 1 | trigger = self-referential 단 1회 ("plan-codegraph-integration.md 작성해줘") | session 48차 conversation history |
| 2 | 외부 사용자 자연 요구 ≥ 1 = **0건** | session 48~49차 conversation history |
| 3 | codegraph = **day-one 3일 차 OSS** (v0.9.0 self-contained = 2026-05-21 / v0.9.5 = 2026-05-26) | github.com/colbymchenry/codegraph/releases (WebFetch 2026-05-27) |
| 4 | codegraph repo 안 symbol_id schema 명세 **부재** | README WebFetch quote: "Not present. No explicit symbol ID or anchor schema documented" |
| 5 | trust 모델 clash | codegraph CLAUDE.md quote: "the graph provides context, not requirements" vs 본 방법론 결정적 검증 paradigm |
| 6 | tree-sitter version pin 부재 | README WebFetch 확인 |
| 7 | **poc-02 + poc-03 `impl-spec.json` 부재** (plan §R1.4 명시 PoC target) | `examples/poc-02/.aimd/output/` 디렉토리 비어있음 + `poc-03/.aimd/output/` = test-spec.json 만 |
| 8 | **가용 2 PoC (poc-05 + poc-14) `code_pointers[]` 부재** | grep -c '"code_pointers"' = 0 (2 PoC 모두) |

사실 8건 중 7건 = **확정 사실**. R7 self-referential corrective drift paradigm (memory `feedback_self_referential_corrective_drift.md`) 정조준 발동 자격.

---

## 4. 흡수 paradigm (feedback `senior_stop_signal_absorption.md` 정합)

**사실 명확도** = 높음 (7/8 확정) × **비용** = 높음 (≥ 20 자산 변경 + ≥ 2 PoC × 3 stage e2e + heavy PoC code_pointers 채움) → **전면 흡수 자격 본격**.

흡수 결단 = scope-out 전면 (Senior 권고 + 분기 1 도 PoC 자격 부재로 fail).

---

## 5. 시행 (scope-out)

### 5.1 plan-codegraph-integration.md 처분

`.claude/plans/plan-codegraph-integration.md` REVISE-2 추가 — §3 채택안 + §R1.1~R1.6 전면 retract / scope-out reasoning + carry queue 명문화. 본 doc 자산 보존 (역사 trail / 외부 사용자 자연 요구 발생 시 재발동 시 base).

### 5.2 research-codegraph-integration.md 처분

`.claude/plans/research-codegraph-integration.md` 보존 (B/D sub-agent 결과 + raw fetch + SCIP grammar 사실 = 별 axis 활용 가능 자산).

### 5.3 carry queue 3종 (Type 2 외부 사용자 자연 요구 발생 시 재발동 조건)

| carry | 발동 조건 |
|---|---|
| `C-codegraph-bridge-design` | (a) 외부 사용자 (윤주스 외 사내 동료 또는 OSS 사용자) ≥ 1 자연 요구 발생 + (b) codegraph v1.0+ 안정화 (≥ 6 개월 maturity 관찰) + (c) Type 2 corroboration ≥ 2 PoC 자격 자산 (impl-spec.json + code_pointers[] 채워진 PoC ≥ 2) |
| `C-scip-grammar-adoption-light` | (선택 / 분리 axis) SCIP BNF style `code_pointer.symbol_id` 채택 — codegraph 무관 / 본 방법론 표현력 ↑ 자체 가치. Type 2 trigger 부재여도 시행 가능 / 단 PoC corroboration 자격 (code_pointers[] 채워진 PoC ≥ 2) 사전 의무 |
| `C-tree-sitter-stability-verify` | codegraph repo (또는 SCIP indexer / Aider tree-sitter `.scm` query) 안 version pin 명세 시점 시행 |

### 5.4 release 시행 ❌

- 본 결단 = pure doc trail / 실 plugin 자산 변경 0
- CHANGELOG entry ❌ (release 자체 ❌)
- version 3-way sync ❌
- STOP-3 ❌
- workspace test ❌ (영향 0)

### 5.5 자산 변경 list (실 file)

1. `decisions/DEC-2026-05-27-codegraph-integration-scope-out.md` 신설 (본 file)
2. `decisions/INDEX.md` head 추가
3. `decisions/STATUS.md` head 추가 (carry queue 등록)
4. `.claude/plans/plan-codegraph-integration.md` REVISE-2 append
5. (선택) memory 갱신 — `feedback_design_corroboration_pre_check.md` (LL-codegraph-03 자산화)

---

## 6. Lessons Learned (자산화)

### LL-codegraph-01 — research §2 negative signal cascade absorption paradigm

§1 plan 작성 후 §2 research 시행 → 3 sub-agent + raw fetch → Senior REVISE/scope-out + raw fact 6건 누적 → 사용자 분기 1 채택 → §4 시행 직전 PoC 자격 사실 발견 → 전면 scope-out 결단. 사실 누적 paradigm 본격 입증 case. **자산화 의무** = "research §2 negative signal 본격 발견 시 즉시 사용자 결단 의무 (4원칙 §3 묶음 결단 재시도 의무) + 사실 누적 흡수 표 작성 의무".

### LL-codegraph-02 — design 작성 직후 §4 시행 직전 PoC 자격 사전 검증 의무 paradigm

본 conversation = LL-fsim-11 paradigm (시행 직전 사실 검증 보강) **5회 이상 연속 재발** (LL-fsim-11 / LL-v902-01 / LL-v903-01 / LL-v904-01 / LL-v905-01 / LL-v906-01 / 본 v8). **자산화 의무** = "design plan §3 채택안 안 PoC target 명시 시 §1 plan 작성 시점부터 PoC 산출물 (impl-spec.json + code_pointers[]) 존재 사실 검증 의무. §4 시행 직전 발견 = paradigm 본격 재발 = 자산화 강도 ↑".

### LL-codegraph-03 — 외부 OSS bridge 통합 자격 criterion paradigm 본격 입증

외부 OSS bridge 통합 자격 = (a) 외부 사용자 자연 요구 ≥ 1 + (b) OSS v1.0+ 안정화 ≥ 6개월 maturity + (c) Type 2 corroboration ≥ 2 PoC 자격 자산. 본 codegraph case = (a) 0건 / (b) day-one 3일 차 / (c) PoC 자격 fundamental 부재 → 3 criterion 모두 fail. **자산화 의무** = "외부 OSS bridge 통합 design 진입 시 3 criterion 사전 검증 의무 (plan §1 작성 직전 단계)".

### LL-codegraph-04 — self-referential corrective drift 본격 입증 case

memory `feedback_self_referential_corrective_drift.md` paradigm 의 본격 입증 사례. **trigger pattern**: "직전 release (v11.0.0 MAJOR) 종결 직후 신규 axis 진입" — carry 정리 후 새 carry 자동 생성 → carry 무한 증식 paradigm. **회피 시그널** = (a) trigger 단 1회 self-referential / (b) 외부 자연 요구 0건 / (c) 본 release 가치 = paradigm 진전 ❌ / (d) PoC 자격 부재. 4 signal 동시 발동 = scope-out 자동 권고. **자산화 강도** = paradigm-level (memory 기존 entry 보강 자격).

---

## 7. References

- `.claude/plans/plan-codegraph-integration.md` — §1 plan (2026-05-26) + REVISE-1 (2026-05-27 / 본 결단 직전) + REVISE-2 (본 결단 흡수)
- `.claude/plans/research-codegraph-integration.md` — §2 research 통합
- `github.com/colbymchenry/codegraph` — README + releases + CLAUDE.md (WebFetch 2026-05-27)
- `github.com/sourcegraph/scip/blob/main/scip.proto` — SCIP BNF grammar (B agent 권고)
- `decisions/DEC-2026-05-23-dep-graph-ssot-consolidation` — artifact-graph SSOT 단일화 결단 (본 외부 bridge axis 와 정합 paradigm)
- `feedback_self_referential_corrective_drift.md` — LL-codegraph-04 정합
- `feedback_senior_stop_signal_absorption.md` — §4 흡수 paradigm 정합
- `feedback_sub_agent_validation.md` — F-015 raw fetch 정합
- `feedback_research_fact_validation.md` — 추측 ❌ paradigm 정합

---

## 8. 한 줄 결론

> codegraph OSS bridge 통합 design = trigger self-referential 1회 / 외부 요구 0건 / day-one 3일 차 OSS / PoC corroboration 자격 fundamental 부재 → **전면 scope-out + carry queue 3 등록 (Type 2 외부 사용자 자연 요구 발생 시 재발동)**. 본 결단 = R7 함정 회피 + paradigm 진전 자격 검증 강도 ↑ + LL 4종 자산화.
