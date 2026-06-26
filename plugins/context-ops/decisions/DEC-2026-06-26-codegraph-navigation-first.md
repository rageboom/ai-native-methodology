# DEC-2026-06-26-codegraph-navigation-first

**codegraph 구조적 질문 우선 nudge — read-only 탐색의 구조 질문(호출/흐름/영향/심볼)에 한해 codegraph 첫 수 권유 / gate 비주입·grep authoritative 불변 (v0.82.0 MINOR / additive·hook / 상태머신 무접촉)**

**상태**: 승인·시행 (plugin.json 0.81.0 → 0.82.0)

## 맥락 (사용자 발화)

"codegraph 가 실제로 적극 쓰이는지, 항상 최신화되는지" 감사에서 출발. 최신화(데몬 watcher)는 정상이나, **"코드 검색할 때는 codegraph 좀 써도 되지 않나? 왜 아예 못하게 한 거야?"** → "근데 grep/Read 안 쓰고 codegraph 가 동작하면 좋겠는데 이거 잘 안 되는 것 같다" → 실측 후 **"2번(배선)부터 하고 싶고, 방법론에 담고 싶다."**

## 진단 (실측)

- transcript 1,738개 / tool 호출 45,795건 파싱: **codegraph 49건 = 0.17%**. Read 11,185 / Bash grep·find 11,773 / Bash cat·head 5,284 / Grep 19 / Glob 0. codegraph 가용(6/17~) 구간만 봐도 ~1.3%, 최고일(6/18) 3.5%. 그나마 절반이 `codegraph_status`(메타).
- 원인은 고장이 아니라 (1) 설계 — nudge 가 Grep 미접촉(valve 보호) + Read nudge=포인터만 + 게이트용 trust 정책이 일상 탐색까지 일반화, (2) **현장 실태 — AI 에이전트 grep-first 가 지배적**(아래 §업계).

## 업계 정합 (4원칙 §2 / research 1-에이전트 / 실 fetch)

- **명제 A "구조 질문=구조도구 우위"**: 부분 지지 + 역전. CodeQL(데이터플로우/제어흐름 추적은 grep 불가)·ast-grep(lexical→structural→semantic 3계층)·Sourcegraph(precise=compiler-accurate)는 *구조 질문 우위* 지지. 그러나 *"구조=탐색 1차"* 일반 순서는 **반례**: yage.ai(2026) 실측 Claude Code grep-first(LSP 1.1%) + Anthropic 자체 "grep just worked better". → **설계 범위를 "구조 질문"으로 좁힌 직접 근거**.
- **명제 B "grep=검증/리터럴 권위"**: 강지지. yage.ai("grep=hypothesis generation / 구조=verification"), ast-grep("keep grep for exact/exhaustive"), GitHub Blackbird(exact-match 별도 보존). 구조 인덱스 stale·부분커버 → 최종 확인=텍스트.
- 출처: yage.ai/why-coding-agents-still-use-grep · sourcegraph.com/docs/code-navigation · codeql.github.com · github.blog Blackbird · ast-grep.github.io/blog/code-search-design-space.

> research 가 1차 framing("navigation-first 일반 격상")을 **과잉 주장으로 정정**시킴 — 4원칙 §2 가 출하 전 overclaim 차단(품질 신호). 구현(detector)은 이미 구조 질문에만 발동 → 코드 무변경, 정책/DEC 산문만 범위 한정으로 정직화.

## 결단 — 두 축 분리

- **축1 (불변)**: codegraph 출력 = reference-lens, 결정적 gate inject ❌, grep authoritative, grep PreToolUse deny ❌. DEC-2026-05-28 §4.2 그대로.
- **축2 (신규·범위 한정)**: read-only 탐색에서 **구조적 코드 질문(callers/callees/trace/impact/심볼위치)에 한해** codegraph 첫 수 권유. 일반·리터럴 검색은 grep 첫 수 유지.

## 시행

- `scripts/graph-context-nudge.js`(UserPromptSubmit) 확장 — artifact-graph 매칭 0(순수 코드 질문) 분기에 `detectStructuralCodeQuestion(prompt)` + `buildCodegraphNavContext()` 추가. intent 키워드(ko+en) × code-signal(식별자꼴/코드명사) 동시 충족 시에만 비차단 additionalContext 주입. 키워드-only=비차단·additive 라 sanity 레이어로 충분(Adzic SBE 함정 비해당). 신규 스크립트 0개(출하 가드/check #43 무변). 독립 opt-out `CONTEXT_OPS_CODEGRAPH_NAV=0`.
- 신규 canonical `methodology-spec/policies/codegraph-navigation-first.md` + 기존 trust 문서 포인터 1줄(re-inline ❌).

## 검증

- `node --test scripts/test/graph-context-nudge.test.js` 11/11 (detector happy/오탐억제/intent부재 + nav context 형식·disclaimer·차단필드 부재 + C4 gate-inject 방어 유지).
- release-readiness 카운트 유지(새 check 없음 / 새 스크립트 없음).
- (carry) adoption 실측 — soft nudge 효과 비보장(현장 grep-first 관성). transcript 점유율 주기 재측정. 안 오르면 revisit(강제화 ❌ = 축1·명제 B 위반).

## Relates

- DEC-2026-05-28-codegraph-probe-결과 §4.2 (축1 원점 / reference-lens)
- DEC-2026-05-30-codegraph-essential (필수 도구 격상)
- DEC-2026-06-15-codegraph-search-token-saving (codegraph-nudge PreToolUse / Grep 제외 규약)
- feedback_research_fact_validation (research 가 overclaim 정정) + feedback_chain_driver_deterministic_axis
