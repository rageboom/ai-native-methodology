# DEC-2026-05-14-agents-skills-1-depth-flatten

> 2026-05-14 / v2.5.1 PATCH — agents/skills 1-depth 평탄화 — Claude Code plugin install 호환성 본격 회복 ( post-v2.5.0 commit `4d25df8` 본격 자산화) + chain harness 5 요소 변경 ❌

## 1. 결단 사실

**critical 결함 본질 사실**: v2.0.0~v2.5.0 까지 본 plugin 의 agents/skills 자산이 **Claude Code plugin 표준 (1-depth) 과 충돌하는 2-depth lifecycle stage organize** 구조였음. 즉:

- 본 plugin: `agents/_base/<name>/<name>.md` + `skills/<category>/<name>/SKILL.md` (2-depth + category 디렉토리)
- Claude Code 표준: `agents/<name>.md` + `skills/<name>/SKILL.md` (1-depth)

→ 사내 GHE plugin install (`v2.4.1` 시점 첫 검증) 결과:

```
Installed components:
● Agents: README        ← 1 agent (agents/README.md 잘못 인식)
● Skills: (0종)         ← 통째로 누락 ❌
● MCP Servers: _comment ← hooks.json 주석 key 오인식
```

즉 **v2.0.0~v2.5.0 모든 release 가 plugin install 영역에서 skill 본격 작동 ❌** (편집자 path 직접 등록 시나리오 A 만 작동 / 시나리오 B-1 git URL install 영역 본격 작동 ❌).

**사용자 결단** (옵션 B / category prefix flatten):

> agents/skills 디렉토리를 1-depth 로 평탄화하되, **category 정보는 prefix 형태로 보존** (예: `skills/<category>-<name>/SKILL.md`). lifecycle stage organize 사상 axis 자체는 methodology-spec/skills-axis.md + agents-axis.md 안에 사상 명세로 보존.

## 2. 시행 산출 ( post-v2.5.0 commit `4d25df8` + v2.5.1 PATCH 통합)

### 2.1. agents 1-depth 평탄화 (3 mv)

- `agents/_base/industry-case-researcher/industry-case-researcher.md` → `agents/_base-industry-case-researcher.md`
- `agents/_base/official-docs-checker/official-docs-checker.md` → `agents/_base-official-docs-checker.md`
- `agents/_base/senior-engineer/senior-engineer.md` → `agents/_base-senior-engineer.md`

### 2.2. skills 1-depth 평탄화 (38 mv)

| 카테고리  | prefix       | 개수                                                                                                        |
| --------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| \_base    | `_base-`     | 5 (apply-baseline-ratchet / apply-template / build-traceability-matrix / invoke-go-stop-gate / log-finding) |
| analysis  | `analysis-`  | 22 (aspect 4 + br-cross-consistency-check + phase 17)                                                       |
| planning  | `planning-`  | 3 (decompose-use-cases / extract-from-legacy / identify-business-intent)                                    |
| spec      | `spec-`      | 3 (compose-behavior-spec / derive-acceptance-criteria / integrate-7대-deliverables)                         |
| test      | `test-`      | 3 (generate-test-spec / run-test-evidence / verify-coverage)                                                |
| implement | `implement-` | 2 (generate-impl-spec / verify-test-pass)                                                                   |

### 2.3. README 처리 (12 file)

- `agents/README.md` → `methodology-spec/agents-axis.md` git mv ( 사상 명세 자산 위치 정합 + v2.5.1 PATCH 본격 재작성)
- `agents/{analysis,design,implement,planning,spec,test}/README.md` (6) → git rm (사상은 agents-axis.md 단일 axis)
- `skills/README.md` → git rm
- `skills/{design,implement,planning,test}/README.md` (4) → git rm (사상은 skills-axis.md §7 본격 자산화)

### 2.4. frontmatter `name:` 41 갱신

각 SKILL.md + agent .md 의 frontmatter `name:` 필드 = 디렉토리 이름과 일치 갱신. MISMATCH 0 확인 ✅.

### 2.5. 외부 참조 정밀 갱신 43 file

negative lookbehind/lookahead + `.md` path 회피 정규식 적용 paradigm:

- `flows/*.json` (13) — `"skills": [...]` 배열 안 string 갱신 / `spec_file: "phase-0-input.md"` path 영역 보존 ✅
- `flows/*.mermaid` (6) — diagram label 갱신
- `methodology-spec/` (12) — 명세 본문 안 skill name 인용 갱신
- `tools/` (17) — chain-driver hooks-bridge.js nested path (`planning/extract-from-legacy` → `planning-extract-from-legacy`) flat 갱신 + 11 validator README + spec-test-link-validator validator.js
- `README.md` — 시나리오 A 자연어 trigger 표 갱신

### 2.6. 사상 명세 본격 자산화

- `methodology-spec/skills-axis.md` §7 신설 — category prefix 1-depth paradigm 본격 자산화 ( runtime axis vs 사상 axis sub-axis 분리)
- `methodology-spec/agents-axis.md` 본격 재작성 — sub-agent invocation paradigm + lifecycle stage organize 사상 보존

### 2.7. 3-way sync 회복

- `plugin.json` v2.5.0 → v2.5.1
- `package.json` v2.4.1 → v2.5.1 ( v2.5.0 release commit `9e6cf55` 갱신 누락 회복)
- `CHANGELOG.md` 새 v2.5.1 헤더 + 본문 신설

## 3. 결정적 사실

| 사실                                                            | 자료                                                                                                                   |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| v2.0.0~v2.5.0 plugin install 영역 작동 ❌ → v2.5.1 본격 회복 ✅ | 사내 GHE install 검증 통과 (사용자 측 / Installed 탭 38 skill + 3 agent 본격 인식)                                     |
| chain harness 5 요소 변경 ❌                                    | chain-driver / 4 gate validator / state.json / 산출물 schema / lifecycle 변경 ❌ — plugin runtime 호환성 fix 영역 한정 |
| v2.5.0 MINOR FINAL release 본질 보존 ✅                         | Layer 2 LLM paradigm / ≥ 2 PoC corroboration / Adzic SBE 함정 회피 / industry-first paradigm 모두 본질 보존            |
| workspace test 312/0 본질 보존 ✅                               | hooks-bridge.test.js 포함 모든 test pass ( skillId nested → flat 정합 갱신)                                            |
| 11 PoC 호환 자격 보존 ✅                                        | plugin 본체 자산 path 변경 ❌ (PoC examples/ 영역 무관)                                                                |

## 4. 영향 영역

### 4.1. 본격 영향

- 사내 동료 plugin install 본격 작동 — 사내 GHE 표준 install 1줄 (`/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git`) + `/plugin install ai-native-methodology@ai-native-methodology` 본격 자격 도달.
- 본 plugin 의 본격 배포 채널 가동 — v2.4.1 PATCH (GHE marketplace 정착) + v2.5.0 MINOR FINAL (paradigm 자산화) + v2.5.1 PATCH (plugin install 호환성 회복) 3 단계 완성.

### 4.2. 영향 영역 외 (보존)

- chain harness 5 요소 (chain-driver / 4 gate validator / state.json / 산출물 schema / lifecycle) 변경 ❌
- 11 PoC 호환 자격 보존
- release-readiness 9/9 strict 자격 보존 ( v2.5.0 격상 본질)
- analysis stage paradigm (Layer 1 + Layer 2 + ≥ 2 PoC corroboration) 보존
- methodology-spec/lifecycle-contract.md + flows/sdlc-4stage-flow.json 사상 보존

## 5. 부속 자산

- `agents/_base-{senior-engineer, industry-case-researcher, official-docs-checker}.md` (3 mv + frontmatter 갱신)
- `skills/<category>-<name>/SKILL.md` (38 mv + frontmatter 갱신)
- `methodology-spec/agents-axis.md` 본격 재작성 ( 본 paradigm 사상 axis 자산화)
- `methodology-spec/skills-axis.md` §7 신설 ( category prefix 1-depth paradigm 본격 자산화)
- `flows/*.{json,mermaid}` (13) + `tools/chain-driver/src/hooks-bridge.js` + `tools/chain-driver/test/hooks-bridge.test.js` + `README.md` + `methodology-spec/*` (12) + `tools/*/README.md` (10) — 43 file 외부 참조 정밀 갱신
- `plugin.json` + `package.json` + `CHANGELOG.md` 3-way sync 회복
- `README.md` 상단 version 표시 v2.0.0-rc1 → v2.5.1 + 사실 본문 갱신
- ADR-CHAIN-011 §9 LL-i-48+49 자산화
- git tag `v2.5.1` 신설 + push origin main + push tag

## 6. Lessons Learned 2건 (ADR-CHAIN-011 §9 patch v10)

### LL-i-48 — Claude Code plugin 표준 1-depth vs lifecycle organize 2-depth 충돌 본질 결함

- **사실**: v2.0.0~v2.5.0 까지 본 plugin 의 agents/skills 2-depth (`<category>/<name>/`) 구조가 Claude Code plugin 표준 1-depth scan 과 충돌 → install 후 skill 본격 작동 ❌. 5 release (v2.0.0, v2.4.0, v2.4.1, v2.5.0, post-v2.5.0) 모두 동일 결함.
- **plugin lifecycle organize 사상 자체 (skills-axis.md v1.4.4) ≠ Claude Code runtime paradigm**.
- **회피 paradigm**: sub-axis 영역 분리 (사상 axis = methodology-spec / runtime axis = 1-depth + prefix).
- **사실 검증 절차**: v2.4.1 사내 GHE install 검증 시 `/plugin` 상세 출력 (`Agents: README / Skills: 0종 / MCP Servers: _comment`) 자체가 결정적 자료. 검증 절차 부재 시 결함 발견 ❌.

### LL-i-49 — category prefix flatten paradigm 해소

- **사실**: 사용자 결단 옵션 B (category prefix flatten / dual axis 분리). 옵션 A (단순 평탄화 / lifecycle organize 정책 폐기) 와 차이 = 사상 보존.
- **paradigm 본질**: ADR-008 이중 렌더링 사상 (사상 + 자산 분리) 의 plugin runtime 영역 확장. 사상 명세 = methodology-spec/skills-axis.md + agents-axis.md / runtime 자산 = skills/<category>-<name>/ + agents/\_base-<name>.md.
- **사용자 paradigm 정합**: 단순 평탄화 ❌ + 사상 보존 ✅ = 본 방법론의 quality 1순위 + 재작업 최소화 2순위 정합.
- **외부 참조 갱신 paradigm**: negative lookbehind/lookahead + `.md` path 회피 정규식 — runtime skill 자산 path 갱신 ≠ phase spec file path (사상 axis 의 영역) 분리.

## 7. 신규 carry

| ID                                               | 우선순위 | 영역      | 사실                                                                                                                                         |
| ------------------------------------------------ | -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| C-poc-axis-design-vs-runtime-separation-paradigm | medium   | 사상 명세 | 향후 plugin lifecycle organize 사상 vs Claude Code runtime 호환성 충돌 발생 시 본 paradigm (사상 axis 보존 + runtime 평탄화) 정합 적용 carry |

## 8. resolved carry

- ✅ **C-plugin-install-validation** (post-v2.5.0 commit `4d25df8` 시점 신설) — 본 v2.5.1 PATCH 안 본격 install 검증 통과
- ✅ **C-ghe-distribution-validation** (v2.4.1 PATCH 시점 신설) — 본 v2.5.1 PATCH 안 사내 GHE 표준 install 본격 작동
