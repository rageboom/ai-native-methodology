# DEC-2026-06-29-codegraph-nav-graph-absent

**codegraph nav-first 그래프-부재 확장 — nav-first 권유는 artifact-graph.json 유무와 무관하게 구조적 코드 질문이면 발동 (v0.87.0 MINOR / 버그픽스 성격 / DEC-2026-06-26 후속 / OP-CODEGRAPH-002)**

**상태**: 승인·시행 (plugin.json 0.86.0 → 0.87.0)

## 맥락 (adoption 재측정)

DEC-2026-06-26(v0.82.0)으로 도입한 codegraph navigation-first nudge 의 adoption 을 2026-06-29 실측(이 repo 128세션 transcript / 하니스 = scratchpad `audit-codegraph-adoption.py`, v0.84.0 설치 epoch 경계 before/after 분할):

- nav-first nudge genuine 발사 = **0**. (대조: PreToolUse codegraph-nudge `💡 심볼 구조질의` 는 33발사/14세션/오늘까지 정상.)
- codegraph 실사용도 여전히 바닥 — 실 tool_use 점유율 before 0.13%(20/15,269) → after 0.19%(1/522, 설치후 6세션 = 표본 부족 무의미). 격상 신호 없음.

## 진단

`scripts/graph-context-nudge.js` 의 `main()`:

```
const graph = loadGraph(projectDir);
if (!graph) return process.exit(0);   // ← nav-first 경로의 선결 게이트
const matches = matchPromptToNodes(...);
if (matches.length === 0) { /* nav-first 권유 */ }
```

nav-first 는 "artifact 매칭 0 = 순수 코드 질문" 분기에 산다. 그러나 그 분기는 `if(!graph) return` **뒤**에 있어 artifact-graph.json 이 없으면 도달 불가. nav-first 가 노리는 사용자(analysis 미적용 순수 코드베이스 탐색자)는 대개 그래프가 없으므로 **타깃 시나리오에서 영영 미발동** = 의도-구현 갭.

라이브 확인: 그래프 있는 cwd(poc-18) + 구조질문이면 nav 정확 발사 → 코드 자체는 alive. genuine 0 의 원인은 전적으로 선결 게이트.

정책/DEC 원문 대조: 트리거 의도는 "순수 코드 질문에 codegraph 첫 수 권유"이며 "그래프 없는 프로젝트엔 권유 안 함"이라는 근거는 정책 어디에도 없음 → 끌어올림은 정책 위반이 아닌 **버그픽스**. (진단 후보 액면 수용 금지 — 정책 충돌 대조 완료.)

## 결정

nav-first 를 `loadGraph` null 분기로 끌어올린다. 그래프 부재여도 구조적 코드 질문이면 nav-first 발동. dep-graph 1-hop 주입(매칭>0 분기)만 그래프 필수로 남긴다.

축1(gate 비주입 · grep authoritative · grep deny ❌) 불변. 축2 nudge 범위만 변경. opt-out(`CONTEXT_OPS_CODEGRAPH_NAV=0`) · once-per-prompt marker · 비차단(exit 0) 보존.

## 시행

- `graph-context-nudge.js`: `if(!graph) return` 제거 → `const matches = graph ? matchPromptToNodes(...) : []`. 매칭 0 분기가 그래프 부재를 자연 흡수. 헤더 주석 정밀화.
- `methodology-spec/policies/codegraph-navigation-first.md` §5: "매칭 0 또는 그래프 부재" + 그래프-부재 확장 항.
- `hooks/hooks.json` UserPromptSubmit $comment: "그래프 부재 no-op" → "dep-graph 주입만 no-op / nav-first 는 발동".
- 신규 스크립트 0 / 새 check 0 (release-readiness 카운트 무변 / 출하 가드 check #43 채널 무변).

## 검증

- `node --test scripts/test/graph-context-nudge.test.js` 14/14 (기존 11 단위 + 신규 통합 3: 그래프 부재+구조질문→발사 / 비코드 산문→침묵 / opt-out→침묵).
- 라이브: 레포 루트(그래프 부재) + 구조질문 → nav 발사(재측정 때 빈출력이던 케이스 해소).
- v0.85.0/0.85.1/0.86.0 누적과 묶어 v0.87.0 단일 Nexus publish → adoption 전파 갭(merge≠publish≠설치≠실행) 해소.

## 관련

- DEC-2026-06-26-codegraph-navigation-first (원조 / Relates)
- 차기 carry: v0.87.0 publish + per-repo update 후 adoption 재측정(nav-first genuine 발사 > 0 확인 / 분모 = running install ≥ 0.87 세션).
