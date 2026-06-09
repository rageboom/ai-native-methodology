---
name: analysis-scope-carve
description: Use during analysis stage when a large legacy codebase must be split into scopes ("scope 분해" / "carve" / "대형 코드베이스 어디서 쪼개나" / "seam 후보" / "추출 순서"). Runs 3 deterministic structural signals over architecture.json (+ optional git history) — Tarjan SCC (분할 불가 atomic unit + 안전 추출 순서) + Martin Ca/Ce/I (seam·hub·sink 랭킹 / A·D abstain) + VCS co-change (git log logical-coupling / legacy iBATIS 정적-blind 정조준). Generates scope-carve.json (reference-lens / NOT gate-injected). trust 모델 — 출력은 reference-lens / finding 으로만 수용, 어떤 결정적 gate 에도 inject ❌ (DEC-2026-05-28 §4.2) — 사용자가 soft gate #0 에서 scope 를 확정한다. Real 결정론 계산만 (no-simulation / architecture.json 부재 시 exit 3). 1차 draft (DEC-2026-06-09-scope-carve-3signal-reference-lens / 본체 격상 = ≥2 PoC). Stage = analysis, aspect = cross-cutting.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-scope-carve — 역공학 scope-carve 3 결정론 신호 (reference-lens)

대형 legacy 코드베이스를 "어떤 경계로 쪼갤 것인가"는 역공학 분석의 첫 관문. scope 컨테이너(work-unit-manifest + soft gate #0)는 완비됐으나 carve **신호**가 부재했다 — 본 skill 이 그 갭을 메운다. 출력은 **사람이 soft gate #0 에서 scope 를 확정하기 위한 evidence**이지 결정이 아니다.

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md`.

- 본 skill 도구(`tools/scope-carve/`)는 진짜 결정론 계산만 산출(`evidence_trust=real_tool`). Tarjan SCC / Martin / git co-change = 추정 0.
- `architecture.json` 부재 = `exit 3` 정직 신호 → `analysis-architecture` 선행 필요 (LLM 추론 대체 ❌).
- git 부재·이력 없음 = co-change `status:no_git_history` honest skip (날조 ❌ / SCC+Martin 은 계속).
- **Martin A(abstractness)·D(distance) = abstain** — architecture.json 에 abstract/concrete 타입 카운트 부재 → `null` + `not_computable`. layer enum 으로 A 를 추정해 measured fact 로 제시하는 것은 no-simulation 위반 → 거부.
- Bunch MQ(확률적 비재현) / EventStorming(human-judgment 워크숍) 신호는 결정론 carve 부적격 → **미포함**(향후 human-in-loop low-trust only).

## trust 모델

- `scope-carve.json` = **reference-lens / finding 으로만 수용**. 어떤 결정적 gate 에도 **inject ❌** (carve 자신의 원칙 "the signals provide scope evidence, not scope approval" 정합 / `DEC-2026-05-28 §4.2`).
- 결정적 검증은 본 방법론 dep-graph(artifact-graph) + chain gate 가 SSOT. carve 는 scope 경계 참고 lens (보완).
- carve 가 발견한 구조 risk(예: 거대 SCC = leverage 소실)는 `_base-log-finding` 으로 **low|medium reference finding 만** 등재(gate blocker ❌).
- **임계치·co-change 파라미터는 soft gate 노출** — 'deterministic'은 파라미터가 pin 된 이후에만 성립(렌즈 내부 hardcode ❌). 사용자가 soft gate #0 에서 조정/확정.

## 사전 조건

- `architecture.json`(`analysis-architecture` 산출물) — SCC + Martin 입력 (필수). 부재 시 exit 3.
- (선택) co-change 대상 git repo — `--repo`. git 이력이 있어야 logical-coupling mining 동작(없으면 honest skip).

## 절차

1. **scope-carve 실 실행** — `tools/scope-carve/` 가 3신호를 결정론 계산:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/scope-carve/src/cli.js \
     --architecture <user-project>/.ai-context/output/architecture.json \
     --repo <target-project-dir> \
     --output <user-project>/.ai-context/output \
     [--min-support N] [--min-confidence F] [--window N] [--max-transaction-size N] \
     [--unstable-instability F] [--hub-afferent N] [--since <date>]
   ```

   - `--repo` 생략 = SCC+Martin 만 (co-change `not_run`).
   - co-change 파라미터·Martin 임계는 모두 출력 JSON `params` 에 기록 = soft gate 가 사람에게 노출.

2. **환경 부재 시 (exit 3)** — `architecture.json` 부재 → `analysis-architecture` 먼저. finding 등재(`Type: gap`).

3. **3신호 검토 (reference-lens)**:
   - **SCC** — `scc.components[].is_atomic=true` = 분할 불가 atomic 단위(함께 carve 또는 cycle 먼저 해소). `condensation_order` = 안전 추출 위상순서.
   - **Martin** — `role`: sink(깨끗 추출) / hub(shared kernel — 쪼개면 파편화, 경계 신중) / unstable / isolated. `instability` 숫자는 결정론, 임계 판정은 convention(soft gate).
   - **co-change** — `pairs[]` 정적 그래프 비가시 결합(config↔code / mapper↔DAO 동시편집). 가르는 cut 은 leaky 후보.

4. **carve_candidates → soft gate #0** — `carve_candidates[]`(atomic_unit / clean_seam / hub_warning / behavioral_cluster)를 사용자에게 제시. 사용자가 scope 경계를 확정(또는 override)한 뒤 `chain-driver init --scope <확정-slug>` 로 scope 를 생성한다. **carve 가 slug 를 자동 생성하거나 manifest 를 만들지 않는다** — carve 는 구조 신호일 뿐, scope 확정은 사람.

5. **finding 등재 (필요 시)** — 구조 risk = `_base-log-finding` 으로 low|medium reference finding (status=open / gate blocker 아님).

## 산출물

- `<user-project>/.ai-context/output/scope-carve.json` (`schemas/scope-carve.schema.json` / reference-lens / NOT gate-injected / soft gate #0 evidence)

## 한계 (정직)

- **SCC garbage-in** — architecture.json deps 가 동적 dispatch/DI/iBATIS XML 매핑 누락 시 false 'sliceable'(codegraph iBATIS2 blind 정합). co-change 가 직교 보완하나 완전성 보장 ❌.
- **co-change = git 이력 필수** — 신규/sparse 이력 = cold-start(구조 중심이어도 신호 0). tangled commit = `max_transaction_size` 로 inflate 제어(soft gate).
- 세 신호 모두 **cohesion·도메인 의미 미포함** — 구조 신호 한정, 의미 경계 확정은 soft gate #0 의 사람.
- 1차 draft (≥2 PoC corroboration 전 / 본체 MANDATORY 격상 아님 / opt-in).

## 인용

- `schemas/scope-carve.schema.json`
- `tools/scope-carve/` (Tarjan SCC + Martin Ca/Ce/I + git co-change mining / real_tool evidence / no-simulation exit 3)
- DEC-2026-06-09-scope-carve-3signal-reference-lens (본 skill 의 결정 / 모DEC = DEC-2026-06-09-reverse-eng-methodology-gap)
- DEC-2026-05-28-codegraph-probe-결과 §4.2 (reference-lens trust 모델 SSOT)
- DEC-2026-06-06-analysis-exit-gate (soft gate #0)
- `.claude/plans/research-reverse-engineering-carve.md` (3신호 적격 / 2신호 부적격 근거)
