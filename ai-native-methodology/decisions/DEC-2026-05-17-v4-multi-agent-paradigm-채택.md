# DEC-2026-05-17 — v4.0 multi-agent paradigm 채택 (옵션 A 전면 retract)

- **결정일**: 2026-05-17 (session 21차 / v4.0.0 MAJOR)
- **결정자**: 윤주스 (TF Lead) — 사용자 명시 결단 "A로 해줘"
- **상태**: 승인 / 시행중

## 결정

`plan-skill-invocation-guarantee.md` §B5 옵션 A 본격 진입. multi-agent 협업 paradigm 전면 채택. **DEC-2026-05-15-g5 의 "stage 별 분리 ❌ / skill 내부 persona 임베드" 정책 retract**.

- **stage 별 sub-agent 5종 신설** (`agents/{analysis,planning,spec,test,implement}-agent.md`)
- 3 base agent (`_base-senior-engineer` / `_base-industry-case-researcher` / `_base-official-docs-checker`) **병존 보존** (cross-cutting persona)
- spike agent (`archive/v4-spike/_spike-planning-agent.md` / commit `8605652`) ★ ★ ★ **archive 이동** (★ C-3 carry 본격 시행 2026-05-17 / 사용자 명시 결단 "archive 이동") — paradigm 가능 입증 자산 / 역사 기록
- main agent = orchestrator (skill 직접 호출 ❌ 권고 / Task tool 로 stage agent dispatch)
- 산출물 hand-off = `.aimd/output/` 파일 시스템 매개 (현 chain harness paradigm 유지)
- frontmatter `skills: [...]` 사전 주입 paradigm (Sub-agents.md spec line 407~429 정합)

## paradigm 결단 (사용자 결단 2026-05-17)

| 의제 | 결단 | 근거 |
|---|---|---|
| paradigm 변화 진입 | **옵션 A 전면 채택** ✅ | 사용자 명시 "A로 해줘" — multi-agent 협업 vision 본격 |
| DEC-2026-05-15-g5 처분 | **retract** ✅ | "stage 별 분리 ❌" 정책 폐기 / lifecycle-contract.md §Agent column 본격 재작성 의무 |
| spike commit 처분 | **archive 이동** ✅ (★ C-3 carry 본격 시행 2026-05-17) | 역사 기록 / paradigm 가능 입증 자산 / `archive/v4-spike/` 이동 = agents/ 폴더 가시화 ↓ + git history (commit `8605652`) 안 영원 보존 |
| version label | **v4.0.0 MAJOR** ✅ | paradigm 본질 변화 / DEC retract + agent 5종 신설 + lifecycle-contract 본격 재작성 + chain-driver 격상 |
| cooling-off | **무시 (사용자 명시 결단)** ✅ | "without stopping" 모드 + 사용자 옵션 A 명시 선택 / paradigm cooling-off cosmetic 4 기준 미충족이지만 사용자 결단 우선 |
| 47 SKILL.md persona 임베드 분리 | **carry** ⚠️ | 본 commit scope 외 / 후속 v4.1+ 정리 / agent system prompt 가 persona 흡수하므로 실 변경은 작을 수 있음 |

## 외부 사실 (claude-code-guide 검증 — 2026-05-17 / DEC-2026-05-17-spike-planning-agent-실험 정합)

- ❌ frontmatter `tools` 에 `Skill` 명시 불가 (공식 spec / Sub-agents.md line 267)
- ✅ sub-agent 의 Skill tool 자동 활성 (parent scope 상속 / line 272)
- ✅ frontmatter `skills: [...]` 사전 주입 가능 (line 407~429)

## 신설 자산

- `agents/analysis-agent.md` (★ chain 1 sub / analysis stage 22 skill 책임)
- `agents/planning-agent.md` (★ chain 1 / planning stage 5 skill 책임)
- `agents/spec-agent.md` (★ chain 2 / spec stage 4 skill 책임)
- `agents/test-agent.md` (★ chain 3 / test stage 4 skill 책임)
- `agents/implement-agent.md` (★ chain 4 / implement stage 4 skill 책임)

## 수정 자산

- `agents/README.md` — paradigm 정책 재작성 ("Stage 별 분리 ❌" → "Stage 별 분리 ✅ + 3 base agent 병존")
- `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 §Agent column 5 row 재작성 (실 agent 파일 path 명시)
- `methodology-spec/skills-axis.md` — skill ↔ agent 매핑 §추가 (각 agent frontmatter skills 매핑 SSOT)
- `tools/chain-driver/src/hooks-bridge.js` — TRIGGER_PATTERNS → agent dispatch 권고로 격상
- `tools/chain-driver/src/invoke-skill.js` — invoke-agent.js 분기 또는 함수 추가
- `hooks/hooks.json` — UserPromptSubmit additionalContext 문구 갱신 ("invoke skill" → "dispatch agent via Task tool")
- `CHANGELOG.md` — v4.0.0 MAJOR entry
- `.claude-plugin/plugin.json` — version 3.6.9 → 4.0.0
- `CLAUDE.md` — paradigm 설명 갱신 (★ release-readiness check10 sync 의무)
- `decisions/INDEX.md` — 본 DEC 등재 + spike DEC row 흡수

## carry (★ v4.1+ scope)

- **C-v4.0-skill-persona-분리** — 47 SKILL.md persona 임베드 부분 정리 (agent system prompt 흡수 vs SKILL.md 절차 보존 평가)
- **C-v4.0-poc-재실행** — PoC #05 (그리고 추가 PoC) chain harness 를 agent dispatch paradigm 으로 재실행 + 산출물 cross-validation
- ~~**C-v4.0-spike-archive** — `_spike-planning-agent.md` archive 결단~~ ✅ 본격 시행 2026-05-17 (★ archive 이동 / `archive/v4-spike/_spike-planning-agent.md` / 사용자 명시 결단)
- **C-v4.0-design-stage-agent** — design stage agent 신설 (v2.x carry 와 합산)

## 정합 관계

- `plan-skill-invocation-guarantee.md` (★ 본 결단의 모 plan)
- DEC-2026-05-17-spike-planning-agent-실험 (★ 가능 입증 자산 / archive 이동 / `archive/v4-spike/_spike-planning-agent.md`)
- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (★ ★ ★ retract 대상 — "stage 별 분리 ❌" 정책 폐기)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (★ R1~R17 SSOT — 본 v4.0 가 R 정합 유지 의무)
- ADR-CHAIN-001~005 (chain harness paradigm — 본 v4.0 가 chain harness 위에서 agent dispatch 격상)
- memory `feedback_decision_cadence_24h_cooling_off.md` (★ cooling-off 무시 — 사용자 명시 결단 우선)

## Lessons Learned (★ paradigm 진화)

- **LL-v4-01**: 본 paradigm 본질 변화는 reasonable call (옵션 C) 보수적 선택 후 사용자 명시 redirect (옵션 A) 로 진행되었다. without stopping 모드 + 큰 paradigm 결단 = 사용자 명시 confirmation 의무 입증. 1차 보수적 선택은 paradigm 보존 안전망 / 사용자 명시 결단이 본격 진입 trigger.
- **LL-v4-02**: spike 자산 (commit 8605652) 의 보존 = paradigm 가능 입증의 역사 기록 자격. ★ archive 이동 결단 본격 시행 (2026-05-17 / 사용자 명시) — `agents/_spike-planning-agent.md` → `archive/v4-spike/_spike-planning-agent.md` / agents/ 폴더 가시화 ↓ + 역사 기록 보존. paradigm 진화 lineage 유지 + cleanup 강박 회피 (memory `feedback_carry_cleanup_paradigm.md` 정합) 양립.
- **LL-v4-03**: DEC-2026-05-15-g5 retract = lifecycle-contract.md §Agent column 본격 재작성 비용 큼 (plan 본문 caution 3 정합). 본 v4.0 commit 안 본격 흡수.
