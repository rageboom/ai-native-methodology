# DEC-2026-06-11-session-handoff-convention

> **세션 간 운영 컨텍스트 인계를 출하 자산으로** — `session-handoff` 스킬 (`.ai-context/HANDOFF.md` 고정 6절) + SessionStart 훅 표면화 + 자연어 라우팅. 방법론 repo 자신의 거버넌스 관행(STATUS.md "다음 세션 인계" / SESSION-WRAPUP)을 채택자 자산으로 승격. §8.1 draft — 1st arm = ep-fe-mis dogfood.

**일자**: 2026-06-11
**카테고리**: 신규 자산 (운영 컨텍스트 시간축 연속성 / P0 정합)
**상태**: 승인 — 사용자 결단 ("세션 넘기기 전에 어떤 형식으로 항상 데이터를 남기고 … 컨텍스트를 넘겨 받을 수 있으면" → ep-fe-mis 에서 프로토콜 합의 → "이걸 내 방법론 프로젝트에 넣을 수 있나?")
**Trigger**: ep-fe-mis dogfood 중 세션 연속성 격차 — 산출물 상태(state.json/manifest)는 영속하나 전략·합의 컨텍스트(왜/다음/제약)는 대화와 함께 휘발.

---

## 1. 통찰

P0 가치 = "산출물 = LLM 운영 컨텍스트, 평생 유지·동기화". 기존 자산은 **공간축**(scope/stage/graph)을 커버하나 **시간축**(세션 간)에 구멍 — gate 결정·다음 작업 합의·"바꾸면 안 되는 것"은 어떤 산출물에도 안 남는다. 방법론 repo 자신은 이 격차를 STATUS.md "★ 다음 세션 인계" + SESSION-WRAPUP-\*.md 로 수년치 세션에서 이미 해결해왔다 — 그 관행을 형식 고정해 채택자에게 출하한다.

## 2. 결단

| # | 항목 | 결정 |
|---|------|------|
| 1 | 자산 형태 | **standalone 스킬 `session-handoff`** — `_base-` 미사용: release-readiness §8-2 `_base-` allowlist 가 frozen(정확히 8 / 9번째 = loophole fail). `ticket-sync`·`dep-graph-navigator` standalone 선례 채택 (allowlist·plugin-authoring-spec 무개정) |
| 2 | 파일 위치 | `.ai-context/HANDOFF.md` repo 루트 단일 (멀티모듈 분산 ❌ / v0.25.1 배치 컨벤션). **커밋 대상 ⭕** — state.json(런타임/gitignore)과 달리 타 PC·팀 이식 목적 (DEC-2026-06-08 git 위생 분류 정합) |
| 3 | 형식 | **고정 6절** — ①북극성 ②현재 위치(완료+**증거 포인터 의무** — no-simulation 정합) ③다음 작업(실행 가능 단위/사용자 결단 표시) ④휘발성 상태(작성 시점 스냅샷 — 시작 시 실제 대조 의무가 짝) ⑤제약·합의 ⑥핵심 포인터. 절 추가/생략 ❌ |
| 4 | 역할 분담 | artifact 상태 = state.json/manifest/graph SSOT (중복 기록 ❌) / HANDOFF = 그 위의 전략 층만 (chain stage 진행도 재기록 금지) |
| 5 | 시작 시 보장 | **SessionStart 훅 표면화** — `.ai-context/HANDOFF.md` 존재 시 additionalContext 로 "먼저 읽고 §3 부터" nudge. state.json 부재(pre-init)여도 HANDOFF 만 있으면 표면화 (스킬 양심 의존 ❌ — 결정론 주입). ready/drift 경고와 직교 = 별도 line prepend (ready 신호 보존) |
| 6 | 종료 시 트리거 | UserPromptSubmit 라우팅 — TRIGGER_PATTERNS `/(세션|session)\s*(정리|마무리|인계|종료|wrap[- ]?up)|handoff|인계\s*(문서|갱신|작성)/i` → `session-handoff` (agentId null = cross-cutting / hooks.json matcher 에 세션·session·인계·handoff 추가) |

## 3. 시행

- 신규 `skills/session-handoff/SKILL.md` (6절 형식 SSOT + restore/persist 절차 + state.json 역할 분담 표 + When NOT).
- `tools/chain-driver/src/cli.js` SessionStart: handoffNudge (pre-init 분기 포함) / `src/hooks-bridge.js` TRIGGER_PATTERNS +1 / `hooks/hooks.json` UserPromptSubmit matcher 확장.
- registry: `methodology-spec/skills-axis.md` standalone 2→3 + 총계 55→61 (55 는 pre-existing stale — 실측 61 로 정정) / README 디렉토리 트리 +1 행.

## 4. 검증 (STOP)

- hooks-bridge + hooks-contract 39 GREEN (신규: pre-init nudge / 부재 pass-through 무회귀 / 양존 시 ready 보존 / "세션 정리" 라우팅 + agent 권고 부재 / 과잉 트리거 가드["세션스토리지"·"인계 받았어" = null] / 기존 stage 라우팅 무회귀). chain-driver 전체 + release:check = 본 cycle 마감 수치.
- **1st arm (ep-fe-mis)**: HANDOFF.md 6절 실작성·세션 인계 실사용 (2026-06-11 / Claude Code auto-memory 와 2층 구성 실증). 단 ep-fe-mis 는 `.claude/HANDOFF.md` 에 수동 작성 — 본 컨벤션 확정 위치는 `.ai-context/` (ep-fe-mis 측 이동 = 채택 시).

## 5. carry (정직)

- **§8.1**: draft / 본체 격상(MANDATORY·lifecycle 등재) = ≥2 distinct 도메인 corroboration 후. 2nd arm 후보 = 방법론 repo 자신(STATUS.md 패턴을 HANDOFF 형식으로 수렴) 또는 타 사내 dogfood.
- 세션 종료를 결정론으로 감지하는 훅 이벤트(Stop/SessionEnd)는 Claude Code 의 지원 범위 확인 후 — 현재는 사용자 발화 트리거 (양심 의존이나 시작측 표면화가 결정론이라 루프는 닫힘).
- skills-axis "총 61" = 실측 정정 (구 55 는 누적 stale — 개수 하드코딩 최소화 정책상 차후 동적화 후보).

## 인용

- `skills/session-handoff/SKILL.md` (형식 SSOT)
- DEC-2026-06-08-living-sync-adopter-git-hygiene (커밋 분류) / DEC-2026-05-30-use-scenario-taxonomy (P0 운영 정체성)
- 선례: decisions/STATUS.md 인계 패턴 + ep-fe-mis `.claude/HANDOFF.md` (1st arm)
