# DEC-2026-05-30-codegraph-essential

**결단**: **CodeGraph OSS (`@colbymchenry/codegraph`) = analysis 단계 필수 도구** 로 격상 (Semgrep 동급 / no-simulation 원칙상 무조건 실행 의무). **`DEC-2026-05-27-codegraph-integration-scope-out` 의 scope-out 게이트(외부 사용자 ≥1 + v1.0+ ≥6mo maturity)를 supersede(폐기).** 본 release = 정체성/배치 결정 문서만 (실제 도구 wiring·federation 은 carry). v11.7.0 MINOR (동반 결단 = DEC-2026-05-30-use-scenario-taxonomy).

**작성일**: 2026-05-30 (session 55차 — 사용자 codegraph 필수 명시).

**relates to**:

- `DEC-2026-05-27-codegraph-integration-scope-out.md` ( 본 결단이 supersede)
- `DEC-2026-05-28-codegraph-probe-결과.md` (probe #1 iBATIS) / `DEC-2026-05-30-codegraph-probe-2-mybatis3.md` (#2 MyBatis 3) / `DEC-2026-05-30-codegraph-probe-3-jpa.md` (#3 JPA)
- `DEC-2026-05-30-use-scenario-taxonomy.md` (P3 / 동반 결단)
- memory `project_codegraph_essential_override.md` / `feedback_environment_dependent_tools_scope_out.md`

---

## 1. 배경 (사용자 결정 / 누적 3회 신호)

session 55차 사용자 명시:

> "codegraph 는 보조가 아니고 필수다. CodeGraph OSS 는 무조건 써야 하는 툴이다. 분석단계에서 사용하는 여러 툴들(Semgrep 등)과 같다."

누적 3회째 신호:

1. RealWorld dogfood (memory `project_realworld_dogfood_chain1`) — "codeGraph OSS 안 된 게 잘못" (2회 메타 지적)
2. 본 세션 명시 (필수 / 무조건).

DEC-2026-05-27 은 codegraph 를 self-referential trigger·외부사용자 0·day-one OSS·PoC 자격 부재 근거로 전면 scope-out 했음. 본 결단은 **사용자가 그 게이트의 (a) 외부 사용자 요구를 직접 충족(본인이 필수라 결정)** + **(b) maturity 게이트를 폐기 지시**.

---

## 2. 결단 — codegraph 필수 도구 격상

### 2.1 "폐기" 대상 정밀화 (오해 차단)

폐기하는 것은 **codegraph 가 아니라 그것을 막던 scope-out 게이트**(DEC-2026-05-27 §5.3 carry 조건 (a)(b)). 그 게이트 = scope-out 정당화 논리 → 폐기 = codegraph 를 필수 도구로 의무화.

### 2.2 codegraph 의 위치

- analysis 단계 진짜 외부 도구(실제 실행하는 Semgrep)와 **동급** — no-simulation 원칙상 **무조건 실행 의무** (persona 시뮬레이션 ❌).
- codegraph 산출(code↔code 구조 그래프) = base 컨텍스트(P1)의 일부. dep-graph(artifact↔artifact + artifact↔code)와 **둘 다 필수** (역할 분담: dep-graph=명세/아키텍처 SSOT / codegraph=코드 흐름 레벨).

### 2.3 maturity 우려 = scope-out 사유 아님 (강등)

- 버전 사실: 현재 `@colbymchenry/codegraph` v0.9.7 (2026-05-21 최초 릴리스). "v0.9.x = 미성숙" 은 실측이 아니라 옛 게이트의 잔재 프레이밍 (사용자 명시 거부).
- probe 실측 = 작동 입증: iBATIS Java/Spring layer ⭐⭐⭐ (DEC-2026-05-28) / MyBatis3 mapper XML statement ⭐⭐⭐ + Java 바인딩 ⭐⭐ (probe #2) / JPA 최상·인다이렉션 0 (probe #3) / 인덱싱 10.8s·0 crash.
- "1.0 미만" 은 채택 거부 근거 ❌ → **R19 Tier 2 environment-dependent risk** 로만 표기 (Semgrep Windows 부재 등과 동형 / memory `feedback_environment_dependent_tools_scope_out`).

### 2.4 DEC-2026-05-27 carry 처분

- `C-codegraph-bridge-design` 의 조건 (a)(b) **폐기** (외부 사용자 = 본인 충족 / maturity = environment-risk 강등). (c) PoC ≥2 code_pointers = 실제 wiring 구현 시 corroboration 자격으로 **유지**.
- `C-scip-grammar-adoption-light` / `C-tree-sitter-stability-verify` = 별 axis 유지.

---

## 3. 시행 (본 release = 결정 문서만 / additive / breaking 0)

| 영역                                                                  | 변경                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `decisions/DEC-2026-05-30-codegraph-essential.md`                     | 본 file 신설                                                                          |
| `decisions/DEC-2026-05-27-codegraph-integration-scope-out.md`         | header 에 **superseded by DEC-2026-05-30-codegraph-essential** 표기 (역사 trail 보존) |
| `methodology-spec/use-scenario-taxonomy.md` + `plugin-charter.md` R21 | codegraph 필수 도구 서술                                                              |
| `decisions/INDEX.md` + `CHANGELOG.md` + version 3-way                 | release ceremony                                                                      |

**구현 carry (본 release 제외)**: ① codegraph 를 analysis 도구 목록/`tools/static-runner` 류에 실제 등재 + 의무 실행 wiring ② code↔code 그래프 ↔ 내부 dep-graph federation ③ 매 sync 재실행 timing. → PoC ≥2 code_pointers corroboration + STOP-3 의무 (별도 세션 / `C-codegraph-essential-impl`).

---

## 4. STOP-3

- workspace test: 영향 0 (결정 문서만)
- release-readiness 22/22 ready
- skill-citation 0 stale
- version 3-way 11.7.0
- breaking 0 (결정 문서 / 실 도구 wiring 은 carry) = MINOR

---

## 5. Lessons Learned

### LL-codegraph-essential-01 — scope-out 게이트의 reversal 은 게이트 폐기로 명시

DEC-2026-05-27 의 "v1.0+ ≥6mo maturity + 외부 사용자 ≥1" 게이트는 옳게 적용됐으나(당시 trigger=self-referential), 사용자가 외부 권위로 필수 결정 → 게이트 자체를 폐기. **자산화**: 결정 reversal 시 "무엇을 폐기하는가"(도구 ❌ / 게이트 ✅)를 명시해 오해 차단.

### LL-codegraph-essential-02 — 버전 번호 ≠ 사용 가능성 판단

"v0.9.x = 미성숙" 류의 버전 기반 판단은 probe 실측(작동 입증)을 무시한 scope-out 잔재. 도구 채택 판단 = **실측 + 사용자 가치 결정** > 버전 번호. 미성숙 우려는 environment-risk(R19 Tier 2)로 표기하되 채택 자체를 막지 않음.

---

## 6. carry

- `C-codegraph-essential-impl` — **Slice 1 RESOLVED (2026-05-30) by [DEC-2026-05-30-codegraph-essential-impl-slice1](DEC-2026-05-30-codegraph-essential-impl-slice1.md)** (v11.8.0 / `tools/codegraph-runner/` 신설 + code-graph.json reference-lens). 잔여 = **Slice 2 `C-codegraph-federation`** (dep-graph navigate 증강 + code-pointer staleness + cross-domain finding + MCP serve / §8.1 ≥2 corroboration 후).
- `C-honesty-tool-cleanup` — CLAUDE.md no-simulation 절 실행불가 도구(SpotBugs/Daikon) cleanup (memory `feedback_no_unrunnable_tool_citation`).

## 7. 한 줄 결론

> CodeGraph OSS = analysis 필수 도구 (Semgrep 동급 무조건 실행). DEC-2026-05-27 scope-out 게이트 폐기 (외부 사용자 = 사용자 충족 / maturity = environment-risk 강등 / probe #1~#3 작동 입증). 본 release = 결정 문서만 / 실 wiring carry. v11.7.0 MINOR.
