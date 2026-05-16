# plan-skill-invocation-guarantee — Skill 호출 보장성 진단 + 보강 후보

## Context

사용자 질문 (2026-05-16): "지금 프로젝트에 여러 skill 들이 쓰이고 있는데 이것들이 각 단계에서 잘 불릴 수 있을지 장담 할 수 있나?"

본 plan 은 47종 skill 의 호출 보장 메커니즘을 **stage 별 등급화**하고, 양심 의존이 잔존하는 지점에 대해 **구체 보강 후보**를 제시한다. 1차 산출은 진단 보고서 (가시화 / 변경 ❌). 사용자가 채택한 보강만 후속 release 의제로 별도 plan + chain harness gate.

추가 의제 (2026-05-16 사용자): "메인 에이전트가 모든 skill 호출 ❌ / 멀티 에이전트 협업 / 각 에이전트가 자기 skill 보유" → B5 후보로 등재.

paradigm 안정점 (v3.6.9 / session 20차 종결) 직후 = ★ 안정점 점검 cadence 적용 의무 (memory `feedback_paradigm_stable_point_cadence.md`). 새 feature 보다 drift/회귀 차단 enforcement 우선.

## Phase 1 진단 — 호출 보장 등급 (★ 별 3등급)

코드베이스 read 결과 (hooks.json / hooks-bridge.js / invoke-skill.js / sdlc-4stage-flow.json / release-readiness.js / SKILL.md 표본):

| Skill 그룹 | 보장 등급 | 메커니즘 | 근거 |
|---|---|---|---|
| **chain 1~4 진입 skill 4종** (`planning-extract-from-legacy` / `spec-compose-behavior-spec` / `test-generate-test-spec` / `implement-generate-impl-spec`) | ★★★ (코드 enforcement) | hooks.json TRIGGER_PATTERNS 매칭 → suggest-skill 권고 (stderr) + state.blocked + PreToolUse deny + D21' suppressOutput | `hooks-bridge.js:50-55` / `sdlc-4stage-flow.json:16-22` `five_required_elements` 모두 complete |
| **chain 1~4 gate skill** (`_base-invoke-go-stop-gate`) | ★★★ (gate 등재 + state.blocked) | sdlc-4stage-flow.json `gates[].skill` 단일 SSOT 등재 / 모든 gate (#1~#4) 동일 skill | `sdlc-4stage-flow.json:100-122` |
| **chain 1~4 sub-skill** (`planning-decompose-use-cases` / `spec-derive-acceptance-criteria` / `test-run-test-evidence` / `implement-verify-test-pass` 등) | ★★ (절차서 명시 + 산출물 검증) | 진입 skill 의 SKILL.md 절차서 안에서 sub-skill 호출 명시 + chain-coverage / matrix.json greenness 가 호출 입증 | `planning-extract-from-legacy/SKILL.md:48-51` (decompose-use-cases / identify-business-intent 호출) |
| **_base-* utility 7종** (`apply-baseline-ratchet` / `apply-template` / `build-traceability-matrix` / `log-finding` / `invoke-go-stop-gate`) | ★★ (사용처 명시 + 일부 gate enforcement) | 다른 skill 의 절차서 안에서 명시 호출. `apply-baseline-ratchet` = analysis-input-collection 의 사전 조건. `invoke-go-stop-gate` = gate 강제 | `analysis-input-collection/SKILL.md:14`, `sdlc-4stage-flow.json:104-122` |
| **analysis-input-collection / analysis-input-orchestrate** | ★★ (description trigger 명확 + ★ hook 매칭 없음) | "Use when starting analysis of a legacy codebase" / "Use when user provides multi-source analysis input" frontmatter / LLM description discovery + 사용자 명시 호출 | `analysis-input-collection/SKILL.md:3`, `analysis-input-orchestrate/SKILL.md:3` |
| **analysis-* 22개 stage skill** (architecture / domain-model / business-rules / openapi / db-schema-erd / quality-antipattern 등) | ★ (양심 의존) | SKILL.md description trigger 만 / hooks TRIGGER_PATTERNS 미매칭 / 사용자 명시 호출 또는 LLM 판단 / release-readiness 가 산출물 schema 로 간접 입증 | `hooks-bridge.js:50-55` (chain 1~4 4 패턴만 / analysis stage 0 패턴) |
| **analysis-aspect-* 4종** (`a11y` / `i18n` / `static-security` / `legacy`) | ★ (조건부 description) | "Use when project contains X" / 조건 부재 시 호출 안 됨 / LLM 판단 의존 / 진짜 도구 실행 의무 | `analysis-aspect-static-security/SKILL.md` description |
| **analysis-from-{prompt,swagger,plan-doc,figma} 4종 (BCDE sub-skill)** | ★★ (orchestrate dispatch + 매뉴얼 호출) | analysis-input-orchestrate 가 자동 dispatch (절차서 2단계) / 또는 사용자 직접 호출 / Hybrid rule (50K token 임계) | `analysis-input-orchestrate/SKILL.md:33-39` |

**종합**: chain 1~4 = ★★★ 코드 enforcement / analysis stage 일부 진입 skill = ★★ description / **analysis stage 22개 stage skill = ★ 양심 의존**.

## Phase 2 위험 요소 7건

진단 결과 호출 보장성을 위협하는 구체 지점:

### W1. `hooks-bridge.js` TRIGGER_PATTERNS 가 chain 1~4 만 커버 (★ 가장 큰 양심 의존 잔존)

```js
// tools/chain-driver/src/hooks-bridge.js:50-55
const TRIGGER_PATTERNS = [
  { regex: /(planning|기획)\s*(시작|진입|만들어|드라이브)/i, skillId: 'planning-extract-from-legacy' },
  { regex: /(spec|명세|behavior)\s*(시작|진입|만들어)/i,       skillId: 'spec-compose-behavior-spec' },
  { regex: /(test|테스트)\s*(시작|진입|만들어)/i,               skillId: 'test-generate-test-spec' },
  { regex: /(implement|구현)\s*(시작|진입|만들어)/i,             skillId: 'implement-generate-impl-spec' },
];
```

- analysis stage 26 skill = **0개 패턴** → "분석해줘" / "검토해줘" 한국어 자연어 매칭 안 됨.
- 정규식이 `시작|진입|만들어|드라이브` 동사+시작 만 매칭 → "기획서 좀 보자", "spec 봐줘" 등 모호 자연어 매칭 실패.

### W2. PreToolUse hook 이 Skill tool 자체는 차단하지 않음

```js
// hooks-bridge.js:67-74 shouldBlockToolUse — Write/Edit/NotebookEdit 만 차단
if (!['Write', 'Edit', 'NotebookEdit'].includes(toolName)) return null;
```

- `state.blocked=true` 시 Skill 호출은 차단 안 됨. LLM 이 잘못된 단계에서 skill 호출해도 hook 가드 없음.
- 단, 산출물 Write 시점에 차단되므로 최종 산출물 drift 는 차단됨 (간접 가드).

### W3. SKILL.md description 형식 일관성 미검증

47종 frontmatter description 의 시작 어휘가 일관 안 됨:
- "Use when ..." (대다수)
- "Use after analysis-source-inventory ..." (의존성 명시)
- "★ ★ v2.0 chain 1 진입 skill ..." (강조 마커 시작)
- "★ ★ ★ v2.5.0 Phase C — BR ..." (버전 강조 시작)

LLM 의 description-based skill discovery 일관성 저하. 표준화 validator 부재.

### W4. release-readiness 11/11 criterion 이 skill **호출 누락** 자체를 detect 안 함

```js
// scripts/release-readiness.js — 11 criterion 모두 산출물 schema / coverage 검증
check1_pocCorroboration       // planning-spec.json 존재 (산출물)
check6_matrixGreenness         // matrix.json forward/backward=1.0 (산출물)
check7_e2eCyclePass            // impl-spec.test_pass_evidence.fail_count==0 (산출물)
```

- 산출물 있으면 skill 호출된 셈 → **간접 입증** 가능
- 그러나 "예: planning-decompose-use-cases skill 이 실제 호출되었는가" 자체는 가드 없음. UC-* 가 manual 작성됐어도 schema validate 통과 가능.

### W5. analysis-input-orchestrate auto-dispatch 의 LLM 양심 의존

본 skill 자체가 LLM 양심으로 BCDE sub-skill 4종을 dispatch (절차서 2단계 Hybrid rule). 검증: input-summary.json schema 가 BCDE 4 extract 파일 존재 의무화하지만 (cross_ref), skill 호출 자체는 산출물 존재로만 입증.

### W6. `round_trip` 정책이 hook enforce 안 됨

`sdlc-4stage-flow.json:134-136` round_trip.scope = "외부 자동 코드 생성 ❌" → 정책 선언일 뿐. LLM 이 chain harness 밖에서 코드 생성해도 hook 차단 없음. 단, PreToolUse 가 `.aimd/output/**` 만 차단 → 외부 코드 생성도 결과적으로는 차단됨 (산출물 경로 의존).

### W7. stage 간 prerequisite 의 LLM 양심 의존

예: `analysis-business-rules.description` = "Use after analysis-domain-model". 실제 prerequisite 검증은 skill 절차서 1단계 ("domain.json 확인") 에서 자체 수행 — hook 차원 가드 없음. domain.json 없는 채 business-rules 호출 시 skill 절차서가 일찍 종료해야 하지만, 일관성은 LLM 양심 의존.

## Phase 3 보강 후보 5종 (영향 범위 + 구현 위치 명시)

각 보강의 채택 여부는 사용자 결단. 본 plan 은 후보 제시만 (변경 ❌).

### B1. TRIGGER_PATTERNS 확장 — analysis stage 진입 패턴 추가 (★ 권고 1순위 / 영향 작음)

**대상**: `tools/chain-driver/src/hooks-bridge.js:50-55`

**변경**:
- 신규 패턴 (analysis stage 진입):
  ```js
  { regex: /(분석|검토|legacy|레거시)\s*(시작|진입|해줘|부탁|좀)/i, skillId: 'analysis-input-collection' },
  { regex: /(figma|swagger|기획\s*문서|plan-?doc)/i, skillId: 'analysis-input-orchestrate' },
  ```
- chain 1~4 패턴 모호 자연어 보강:
  ```js
  { regex: /(planning|기획)(서)?\s*(좀|보자|시작|진입|만들어|드라이브|봐줘)/i, ... },
  ```
- ★ analysis stage 26 skill 모두 매칭 추가는 과한 inflation → **진입 skill 2종 (collection / orchestrate) 만 추가** 권고. 나머지 24 skill = 진입 skill 의 절차서 안에서 chain 호출.

**검증**: `tools/chain-driver/test/hooks-bridge.test.js` 에 신규 매칭 케이스 추가 (한국어 + 영어).

**부작용**: 사용자가 "planning 사례 좀 보자" 라고만 입력해도 hook 권고 발동 → false positive 가능. trade-off: stderr 안내만 (LLM context 미주입) 이므로 비교적 안전.

**총 변경 파일**: 2 파일 (hooks-bridge.js + hooks-bridge.test.js)

### B2. SKILL.md description 표준화 validator 신설 (★ 권고 2순위 / 영향 작음)

**대상**: `tools/skill-description-validator/` 신설 또는 `tools/drift-validator` 확장

**구현**:
- 47종 SKILL.md frontmatter 파싱
- 검증 규칙:
  - `description` 필드는 `Use when ` 또는 `Use after ` 로 시작 (강조 마커 ★ 는 description 끝에)
  - `Stage = {analysis,planning,spec,test,implement}` 필수
  - `Generates {산출물명}.json (산출물 N)` 패턴 또는 명시적 산출물 없음 marker
- release-readiness 12번째 criterion 후보

**부작용**: 47종 모두 신 규약 정합 마이그레이션 필요 → 보조 시간 소요. v3.6.x 안정점 정합 ⇒ 작은 PATCH 로 단계적 마이그레이션.

**총 변경 파일**: 신규 validator 1 폴더 + 47 SKILL.md 단계적 마이그레이션 + release-readiness.js + workspace 등재

### B3. chain harness invocation-log 신설 — 호출 누락 추적 (★ 영향 큼 / 후순위)

**대상**: `tools/chain-driver/src/state-store.js` 확장 또는 `.aimd/invocation-log.json` 신설

**구현**:
- hooks-bridge 의 suggest-skill 호출 시 `.aimd/invocation-log.json` 에 timestamp + skillId + matched_pattern 기록
- release-readiness 12번째 criterion: "chain stage 별 expected skills 모두 invocation-log 에 등재"
- expected skills 매핑은 `sdlc-4stage-flow.json` 의 `gates[].skill` + 각 chain stage `sub_flow` 안 skill 목록 SSOT 차용

**제약**:
- hook 은 suggest 만 → 사용자가 실제 skill 호출했는지는 별도 신호 필요. Skill PostToolUse hook (Claude Code 가 PostToolUse 에서 Skill 도구 인식 가능한지 검증 필요)
- LLM auto-invoke 차단 paradigm 과 충돌 가능 — invocation-log 자체가 호출 강제는 아님 / 단지 가시화

**부작용**: 호출 강제로 오해될 risk → "log 는 가시화 / 강제는 산출물 검증" 명세 의무.

### B4. PreToolUse hook 의 Skill tool 차단 패턴 추가 (★ 영향 큼 / 후순위 / trade-off 큼)

**대상**: `hooks/hooks.json` PreToolUse matcher 확장 (`Write|Edit|NotebookEdit|Skill` 로 격상)

**제약**:
- state.blocked=true 시 Skill 호출도 차단 → LLM auto-invoke 회피 강화
- 단, 사용자의 의도적 skill 호출까지 차단 → trade-off 큼
- 본질적으로 본 방법론은 "사용자 명시 호출" paradigm 이므로 차단 정합. 다만 UX 마찰 증가 risk.

**검증**: PoC #05 chain 4 cycle 재현 + Skill 차단 거동 확인.

### B5. ★ multi-agent 협업 paradigm 으로 전환 (★ ★ ★ v4.0 MAJOR / paradigm 본질 변화 / 24h cooling-off 의무)

**사용자 의제 (2026-05-16)**: "메인 에이전트가 모든 skill 호출 ❌ / 각자 전문 에이전트가 있고 / 멀티 에이전트가 협업 / 각 에이전트는 자기 skill 보유"

**현 paradigm (대비)**:
- `agents/README.md:3,14` — "Stage 별 분리 ❌ (lifecycle-contract.md §자산 매핑 매트릭스 §Agent column 정합)"
- "skill 내부 persona 임베드 (별도 agent 호출 불요)"
- 3 base agent = cross-cutting persona (senior / industry-case / official-docs) 만
- 본 결정 = `DEC-2026-05-15-g5-lifecycle-asset-matrix-종결` (1일 전 / v3.5.0 G5 종결)

**제안 paradigm (변화 후)**:
- main agent = orchestrator (skill 직접 호출 ❌)
- stage 별 sub-agent 신설 (예: `analysis-agent.md` / `planning-agent.md` / `spec-agent.md` / `test-agent.md` / `implement-agent.md`)
- 각 sub-agent system prompt 안에 자기 stage 의 skill 목록 + 호출 의무 명시
- main agent 의 chain stage 진입 = `Task tool` 로 해당 stage agent dispatch
- 산출물 hand-off = `.aimd/output/` 파일 시스템 매개 (현 chain harness paradigm 유지)

**cautions (★ 필수 검토 4건)**:

1. **paradigm 안정점 직후 fact** — memory `feedback_paradigm_stable_point_cadence.md` 정합: "안정점 도달 후 새 feature ≠ default / 점검 + drift 회피 enforcement criterion 우선" → 본 paradigm 변화는 안정점 직후 새 feature → cooling-off 권고
2. **24h cooling-off 의무** — memory `feedback_decision_cadence_24h_cooling_off.md` 정합: "큰 구조 결단만 24h / additive 즉시" → 본 변화 = **큰 구조 결단** → 24h cooling-off 적용 의무 (cosmetic 4 기준 미충족)
3. **DEC-2026-05-15-g5 1일 retract risk** — 14차 결단 1일 retract 사례 (`project_adoption_workspace.md`) 의 lesson: 1일 retract 도 정합 가능했음. 그러나 G5 는 v3.5.0 단일 SSOT 종결 결정 / lifecycle-contract.md 본격 작성 후 → retract 시 lifecycle-contract.md 본격 재작업 의무. 비용 큼.
4. **Claude Code agent 시스템의 Skill tool 접근 검증 의무** — 현재 3 base agent 의 `tools` 권한 = `Read, Grep, Glob, Edit, Bash` (Skill 부재). stage 별 agent 가 47종 skill 을 호출하려면 agent frontmatter `tools` 에 `Skill` 명시 의무 + Claude Code agent 시스템이 sub-agent 의 Skill 호출을 지원하는지 외부 사실 fetch 의무 (`_base-official-docs-checker` 또는 `claude-code-guide` agent 위임 후보)

**옵션별 변경 대상 파일 표**:

| 파일 | 옵션 A (전면 v4.0) | 옵션 B (chain 1~4 만 v3.7) | 옵션 C (스파이크 PoC) |
|---|---|---|---|
| `agents/_spike-planning-agent.md` (신설 → archive 이동) | — | — | ★ 신설 / 2026-05-17 본격 시행 / `archive/v4-spike/_spike-planning-agent.md` 이동 (C-3 carry 본격 종결) |
| `agents/analysis-agent.md` (신설) | ★ 신설 | — | — |
| `agents/planning-agent.md` (신설) | ★ 신설 | ★ 신설 | — |
| `agents/spec-agent.md` (신설) | ★ 신설 | ★ 신설 | — |
| `agents/test-agent.md` (신설) | ★ 신설 | ★ 신설 | — |
| `agents/implement-agent.md` (신설) | ★ 신설 | ★ 신설 | — |
| `agents/README.md` | ★ paradigm 정책 재작성 | ★ 부분 retract 명세 | — (변경 ❌) |
| `methodology-spec/lifecycle-contract.md` §Agent column | ★ 5 row 매핑 재작성 | ★ planning~implement row 만 | — |
| `methodology-spec/skills-axis.md` | ★ skill ↔ agent 매핑 신설 | ★ chain 1~4 부분만 | — |
| `tools/chain-driver/src/hooks-bridge.js` | ★ TRIGGER_PATTERNS → agent dispatch | ★ chain 1~4 만 agent dispatch | — |
| `tools/chain-driver/src/invoke-skill.js` | ★ invoke-agent.js 로 분기 | ★ 일부 분기 | — |
| `hooks/hooks.json` | ★ UserPromptSubmit 권고 문구 변경 | ★ 일부 변경 | — |
| `47종 SKILL.md` (persona 임베드 부분) | ★ 분리 평가 (실 변경은 작을 수 있음) | ★ chain 1~4 진입 4종 만 평가 | — |
| `decisions/INDEX.md` + DEC 신설 | ★ DEC-2026-05-17-v4-multi-agent + DEC-2026-05-15-g5 retract | ★ DEC-2026-05-17-chain-agent-부분-retract | ★ DEC-2026-05-17-spike-planning-agent-실험 |
| `examples/poc-05/.aimd/output/` | (chain harness 재실행) | (chain 1~4 재실행) | ★ planning stage 만 agent dispatch 로 재생성 + cross-validation 자산 |
| `CHANGELOG.md` | ★ v4.0.0 MAJOR | ★ v3.7.0 MINOR | — (PoC 만 / 본체 ❌) |
| `.claude-plugin/plugin.json` | ★ version 4.0.0 | ★ version 3.7.0 | — |
| `CLAUDE.md` | ★ paradigm 설명 갱신 | ★ 일부 갱신 | — |
| **총 변경 파일 수** | **~60+ 파일** | **~15~20 파일** | **3~5 파일** |

**채택 결단 옵션 3종**:

- **옵션 A (전면 retract + v4.0 MAJOR)** — DEC-2026-05-15-g5 retract / agents/ 폴더 1-depth flat 유지하면서 stage 별 agent 5종 + 3 base agent 병존 / 47 skill 의 persona 임베드 평가 / chain harness gate 통과 후 release. ★ 24h cooling-off 권고 / 2026-05-17 이후 결단.
- **옵션 B (부분 적용 — chain 1~4 만 agent 화)** — analysis stage 는 현 paradigm 유지 (description trigger + LLM 양심) / chain 1~4 만 stage agent 5종 신설 (4 chain + traceability cross-cut). 영향 작음. MINOR bump 가능 (v3.7.0).
- **옵션 C (스파이크 PoC 후 결단)** — agents/ 폴더에 1 stage 만 PoC 신설 (예: `_spike-planning-agent.md`) → 1주 fail-fast cadence (Stage 4 mini-PoC 패턴 정합) → corroboration 후 v3.7 또는 v4.0 결단. ★ 권고 / §8.1 strict ≥ 2 PoC corroboration 자산화 정합.

**verification (옵션 C 채택 시)**:
- spike agent 1 stage 만 신설 → PoC #05 에서 planning stage 만 agent dispatch 로 실행 → 기존 paradigm 결과와 cross-validation → 산출물 일치 여부 + 신뢰도 변화 + LLM context 사용량 비교

## Phase 4 verification 절차

진단 자체의 verification (보강 적용 시 별도):

1. **현 메커니즘 입증**: `npm test --workspaces --if-present` 통과 (workspace test 359/359 ✅ / release-readiness check11)
2. **chain harness 호출 실증**: PoC #05 의 `.aimd/output/` 안 산출물 5종 (planning-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec) 모두 schema valid + matrix.json greenness=1.0 → chain 1~4 진입 skill + sub-skill 모두 호출되었음 간접 입증
3. **양심 의존 지점 가시화**: 본 진단의 위험 요소 7건 + 보강 후보 5종을 사용자에게 보고 → 채택 결단

## 비고

- 본 진단은 **읽기 전용**. 보강 후보는 별도 결단 후 PATCH/MINOR/MAJOR release.
- 사용자가 보강 후보 1개 이상 채택 시 → 본 plan 종료 / 별도 plan 파일 신설 + chain harness gate 통과 절차.
- 추천 우선순위:
  - **단기 (안정점 정합 / additive)** — B1 (TRIGGER_PATTERNS 확장) > B2 (description validator)
  - **중기 (paradigm 변화 / cooling-off)** — B3/B4 (invocation-log / Skill 차단)
  - **장기 (v4.0 MAJOR / 본질 변화)** — B5 (multi-agent paradigm) ★ ★ 24h cooling-off 의무 + 옵션 C (스파이크 PoC) 권고
- 본 plan 의 사용자 의제 추가 (multi-agent paradigm) = ★ ★ DEC-2026-05-15-g5 retract 사안 → 1일 미만 retract 시 lifecycle-contract.md 본격 재작업 비용 큼 → 옵션 C (1 stage spike PoC) 로 §8.1 strict ≥ 2 PoC corroboration 확보 후 v4.0 결단 권고

## 참조 파일 (read-only 확인)

- `tools/chain-driver/src/hooks-bridge.js:50-74` (TRIGGER_PATTERNS + shouldBlockToolUse)
- `tools/chain-driver/src/invoke-skill.js:58` (`LLM SHALL NOT auto-invoke` 차단 문구)
- `hooks/hooks.json` (3 event hook 정의)
- `flows/sdlc-4stage-flow.json:16-22` (five_required_elements complete)
- `flows/sdlc-4stage-flow.json:100-122` (gates skill 등재 SSOT)
- `scripts/release-readiness.js` (11/11 criterion / skill 호출 직접 검증 없음)
- `skills/analysis-input-orchestrate/SKILL.md:33-39` (Hybrid rule)
- `skills/planning-extract-from-legacy/SKILL.md:48-51` (sub-skill chain 호출 명시)
- `agents/README.md:3,14` (stage 별 분리 ❌ 정책 / G5 종결 정합)
- `agents/_base-senior-engineer.md` (3 base agent persona 표본)
