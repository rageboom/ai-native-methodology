<!-- allow-provenance: 정책 SSOT 근거(DEC 인용·업계 출처 grounding)가 본문 핵심 내용 (test-layering.md 동형 정책 doc grounding). -->

# codegraph — 구조적 질문 우선 / grep 검증 권위 정책 (canonical SSOT)

> codegraph(코드 구조 그래프) 활용의 두 축을 분리한다. **축1(불변)**: 결정적 gate 비주입 + grep authoritative. **축2(신규/명시·범위 한정)**: read-only 탐색에서 **구조적 코드 질문(호출/흐름/영향/심볼위치)에 한해** codegraph 가 첫 수. 일반·리터럴 검색은 grep 이 그대로 첫 수. policies SSOT (`no-simulation.md` · `honesty-tiers.md` · `test-layering.md` · `automation-boundary.md` 동렬). 상태: v0.82.0 신설 (DEC-2026-06-26-codegraph-navigation-first).

## 1. 왜 — 탐색에서 codegraph 가 안 쓰인다 (실측) + 그게 부분적으로 정상이다

transcript 1,738개 / tool 호출 45,795건 실측 시 **codegraph 점유율 0.17%** (도구 가용 6/17~ 구간만 봐도 ~1.3%). grep/Read/Bash 가 99.8%. 원인은 둘:

- **설계**: nudge 가 Grep 을 일부러 안 건드림(grep = 보호된 falsification valve) + Read nudge 는 50토큰 포인터만(Read 비대체) + "codegraph 는 gate 에 넣지 마라"는 **게이트용 신뢰 정책이 일상 탐색까지 일반화**됨.
- **현장 실태(정직)**: AI 코딩 에이전트는 **grep-first 가 지배적**이다 — Claude Code 실측에서 LSP/구조도구 호출은 1.1%에 불과(yage.ai 2026), Anthropic 자체 실험도 "grep just worked better"로 grep-first 채택. 즉 **"구조 도구가 탐색 1차"라는 일반 명제는 현장 데이터와 충돌**한다(과잉 주장 금지).

→ 따라서 본 정책은 "codegraph 를 일반 탐색의 첫 수로 격상"이 **아니다**. **구조적 관계 질문(grep 이 원천적으로 약한 도메인)에 한해** codegraph 를 먼저 권하는 **범위 한정 nudge**다.

## 2. 두 축 분리 (본 정책 핵심)

- **축1 — 권위/게이트 (불변)**: codegraph 출력은 **어떤 결정적 gate 에도 inject ❌** (DEC-2026-05-28 §4.2). gate 결정 = 사람 + validator. 정확 검증·리터럴 매칭의 권위는 **grep/Read**. grep 은 PreToolUse 에서 절대 deny 되지 않는다. (업계 강지지 — 아래 §4 명제 B.)
- **축2 — 구조적 질문 한정 우선 (신규/명시)**: 호출그래프·흐름추적·영향범위·심볼위치처럼 **grep 이 따라갈 수 없는** 질문은 codegraph 가 첫 수다(CodeQL/ast-grep/Sourcegraph 정합). 틀려도 Read 로 자기검증되어 위험이 작다(self-correcting). **단 일반/광역/리터럴 검색은 grep 이 첫 수로 유지** — codegraph 로 갈아타지 않는다.

두 축은 직교한다 — "구조 질문 우선"이 "gate 권위 부여"나 "grep 대체"를 뜻하지 않는다.

## 3. 분업표

| 질문 유형 | 첫 수 도구 | 비고 |
| --- | --- | --- |
| 누가/어디서 호출 (callers) | `codegraph_callers` | grep 은 호출그래프를 못 따라감 |
| 무엇을 호출 (callees) | `codegraph_callees` | |
| 흐름/경로 추적 ("X→Y 어떻게") | `codegraph_trace` | 동적 디스패치 hop 포함 |
| 변경 영향 범위 (impact) | `codegraph_impact` | |
| 심볼 정의/위치 | `codegraph_search` · `codegraph_context` | |
| 영역/구조 이해 | `codegraph_context` | |
| **광역/일반 1차 스캔** | **grep/Read** | 구조 질문이 아니면 grep 이 첫 수 |
| **리터럴 문자열·정확 매칭·검증** | **grep/Read (authoritative)** | codegraph 결과 확인도 여기서 |
| **gate 진행 결정** | **사람 + validator** | codegraph inject ❌ |

## 4. 근거

내부 결정:
- DEC-2026-05-28 §4.2 — codegraph = reference-lens, gate 비주입(축1 원점). 부분 커버리지(예: iBATIS2 0) → 제안용만 정당.
- DEC-2026-05-30 — codegraph = analysis 필수 도구 격상.
- 본 세션 실측(0.17% / 1,738 transcript) — 탐색 미사용 표면화.

업계 정합 (4원칙 §2 / 실 fetch):
- **명제 A(구조 질문=구조도구 우위)**: 부분 지지 — CodeQL("grep 으로 불가한 데이터플로우/제어흐름 추적")·ast-grep(lexical→structural→semantic 3계층)·Sourcegraph(precise navigation = compiler-accurate)가 *구조 질문에서의 우위*는 지지. 그러나 *"구조=탐색 1차"* 일반 순서는 **반례**(yage.ai: Claude Code grep-first / Anthropic "grep just worked better"). → 본 정책이 범위를 "구조 질문"으로 좁힌 이유.
- **명제 B(grep=검증 권위)**: 강지지 — yage.ai("grep=hypothesis generation, 구조=verification"), ast-grep("keep grep for exact identifiers / exhaustive matches"), GitHub Blackbird(exact-match 별도 설계 보존). 구조 인덱스는 stale·부분커버 가능 → 최종 확인은 텍스트.
- 출처: yage.ai/why-coding-agents-still-use-grep · sourcegraph.com/docs/code-navigation · codeql.github.com · github.blog Blackbird · ast-grep.github.io/blog/code-search-design-space.

## 5. 시행 + 측정

- 배선: `scripts/graph-context-nudge.js` 가 UserPromptSubmit 에서 artifact-graph 매칭 0 **또는 그래프 부재**(둘 다 순수 코드 질문) + **구조적 코드 질문 감지 시에만** codegraph MCP 도구를 **비차단**으로 권유. 일반 산문·리터럴 검색은 침묵. 강제 라우팅·grep deny ❌. 독립 opt-out `CONTEXT_OPS_CODEGRAPH_NAV=0`.
- 그래프-부재 확장 (DEC-2026-06-29 / OP-CODEGRAPH-002): nav-first 는 dep-graph 1-hop 주입과 달리 artifact-graph.json 이 **불필요**하다 — 그래프 없는 순수 코드베이스(analysis 미적용)가 nav-first 의 가장 전형적 타깃이므로 그래프 부재 시에도 발동한다. (adoption 재측정 발견: 구버전은 `if(!graph) return` 이 nav 경로를 선결 차단해 실사용 genuine 발사 0 이었음 / dep-graph 주입만 그래프 필수.)
- 측정(정직): 현장은 grep-first 관성이 강해 soft nudge 효과 비보장. transcript 점유율을 주기적 재측정해 추이 확인 — 안 오르면 revisit(강제화는 축1·업계 명제 B 위반이라 안 함).

## 인용

- `scripts/graph-context-nudge.js` (`detectStructuralCodeQuestion` / `buildCodegraphNavContext`)
- `decisions/DEC-2026-06-26-codegraph-navigation-first.md`
- `decisions/DEC-2026-05-28-codegraph-probe-결과.md` §4.2 (축1 원점)
