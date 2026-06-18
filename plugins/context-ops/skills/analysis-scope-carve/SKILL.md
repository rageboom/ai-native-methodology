---
name: analysis-scope-carve
description: Use during analysis stage when a large legacy codebase must be split into scopes ("scope 분해" / "carve" / "대형 코드베이스 어디서 쪼개나" / "seam 후보" / "추출 순서" / "어디부터 손대나" / "hotspot"). Runs deterministic signals over architecture.json (+ optional git history) — 구조 3신호(WHERE to cut): Tarjan SCC (분할 불가 atomic unit + 안전 추출 순서) + Martin Ca/Ce/I (seam·hub·sink 랭킹 / A·D abstain) + VCS co-change (git log logical-coupling / legacy iBATIS 정적-blind 정조준); 우선순위 axis(WHICH first / 직교): Tornhill hotspot (churn × indentation-complexity — 자주 변경+복잡 = 먼저 carve/hardening). Generates scope-carve.json (reference-lens / NOT gate-injected). trust 모델 — 출력은 reference-lens / finding 으로만 수용, 어떤 결정적 gate 에도 inject ❌ (DEC-2026-05-28 §4.2) — 사용자가 soft gate #0 에서 scope 를 확정한다. Real 결정론 계산만 (no-simulation / architecture.json 부재 시 exit 3). 1차 draft (DEC-2026-06-09-scope-carve-3signal-reference-lens + DEC-2026-06-09-hotspot-prioritization-reference-lens / 본체 격상 = ≥2 PoC). Stage = analysis, aspect = cross-cutting.
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
  - **부재 시 all-or-nothing 회피 — minimal grep import-graph 가 valid 입력**: 전면 `analysis-architecture` 를 아직 돌리지 않았어도, carve 목적에 한해 grep/import-resolution 으로 만든 모듈 그래프(`modules[].id` + `dependencies[].from/to` 만 채운 architecture.json)면 충분하다. carve 는 그 두 필드만 읽기 때문에 코드 무변경으로 즉시 신호를 낼 수 있다. 단 이 그래프는 **정적 import 만** 본다 — 동적 dispatch / lazy route 등록 / DI 주입은 안 잡히므로(codegraph 의 FE arrow-fn blind 와 같은 부류) confidence 를 낮추고 `meta`·finding 에 한계를 명시한다. grep 으로 *측정*한 그래프이지 LLM 이 *추정*한 것이 아니므로 no-simulation 위반은 아니다.
- (선택) co-change 대상 git repo — `--repo`. git 이력이 있어야 logical-coupling mining 동작(없으면 honest skip).

## 절차

1. **scope-carve 실 실행** — `tools/scope-carve/` 가 3신호를 결정론 계산:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/scope-carve/src/cli.js \
     --architecture <user-project>/.ai-context/base/shared/architecture.json \
     --repo <target-project-dir> \
     --output <user-project>/.ai-context/base \
     [--min-support N] [--min-confidence F] [--window N] [--max-transaction-size N] \
     [--unstable-instability F] [--hub-afferent N] [--since <date>] \
     [--hotspot-top-n N] [--min-churn N] [--tab-width N] \
     [--scope-root <path>] [--exclude <glob>] [--no-default-excludes]
   ```

   - `--repo` 생략 = SCC+Martin 만 (co-change·hotspot `not_run` — 둘 다 git 이력 의존).
   - co-change·hotspot 파라미터·Martin 임계는 모두 출력 JSON `params` 에 기록 = soft gate 가 사람에게 노출. `--tab-width` = 들여쓰기 환산(2-space 코드는 2 / 기본 4).
   - **monorepo 1앱 carve = `--scope-root <subtree>` 필수**: `--repo` 가 monorepo 루트면 git log 가 repo 전체 이력을 mining → co-change pair·hotspot 이 형제 앱 변경으로 오염(SCC·Martin 은 architecture.json scope 라 이미 해당 앱으로 한정 = 신호 비대칭). `--scope-root apps/<app>` 으로 git log 를 `-- <path>` pathspec 제한하면 양쪽이 같은 subtree 로 정조준. 미지정 시 architecture.json `modules[].path` 가 공통 prefix 를 공유하면 그 값으로 자동 default(공통 prefix 없으면 repo-wide 유지).
   - **project-level noise 추가 제외 = `--exclude <glob>`(반복가능, 기본목록에 추가)** / `--no-default-excludes`(기본 제외 끔). 기본 제외목록은 lockfile/deploy/CI/build/generated + methodology markdown(spec·plan·work-log)을 거른다 — 프로젝트 고유의 동반-변경 noise 는 `--exclude` 로 추가.

2. **환경 부재 시 (exit 3)** — `architecture.json` 부재 → `analysis-architecture` 먼저. finding 등재(`Type: gap`).

3. **신호 검토 (reference-lens)**:
   - **SCC** — `scc.components[].is_atomic=true` = 분할 불가 atomic 단위(함께 carve 또는 cycle 먼저 해소). `condensation_order` = 안전 추출 위상순서.
   - **Martin** — `role`: sink(깨끗 추출) / hub(shared kernel — 쪼개면 파편화, 경계 신중) / unstable / isolated. `instability` 숫자는 결정론, 임계 판정은 convention(soft gate).
     - **sink→clean_seam 은 형제 feature 가 많은 app-scale 에서 주 WHERE 신호**: 한 도메인만 잘라낸 좁은 슬라이스에서는 sink 가 거의 안 잡혀(공허) 보이지만, 여러 feature 가 공존하는 앱 전체에서는 서로를 의존하지 않는 feature 들이 다수의 깨끗한 추출 후보(clean_seam)로 드러난다. sink 공허는 단일-도메인 슬라이스의 속성이지 FE 일반의 한계가 아니다 — 앱 전체 architecture.json 을 입력하면 sink/clean_seam 이 지배적 신호가 된다.
     - **external 모듈은 hub_warning 에서 자동 suppress**: architecture.json `modules[].external=true`(vendor/외부 패키지 — 예: `@sg/*` workspace 의존)는 Martin afferent 가 높아도 hub_warning 후보로 노출하지 않는다(절대 carve 금지 대상이라 추출-회피 경고가 무의미). architecture.json 의 `modules` 는 **app-internal 만** 두는 것이 원칙이며, 외부 의존은 carve 입력 전에 prune 하는 것을 권장한다(미prune 시 `external` 플래그로 구분).
   - **co-change** — `pairs[]` 정적 그래프 비가시 결합(config↔code / mapper↔DAO 동시편집). 가르는 cut 은 leaky 후보.
   - **hotspot** (우선순위 axis / WHICH-first) — `hotspot.items[]` = churn × indentation-complexity score 내림차순. 자주 변경+복잡 = **먼저** carve/격리/hardening. flat 파일(고churn but 들여쓰기~0)은 저score(Tornhill 의도). WHERE(3 구조신호)에 직교.

4. **carve_candidates → soft gate #0 → scope_candidates** — `carve_candidates[]`(atomic_unit / clean_seam / hub_warning / behavioral_cluster / hotspot_priority)를 사용자에게 제시. 사용자가 scope 경계를 확정(또는 override)한 뒤 `chain-driver init --scope <확정-slug>` 로 scope 를 생성한다. **carve 가 slug 를 자동 생성하거나 manifest 를 만들지 않는다** — carve 는 구조 신호일 뿐, scope 확정은 사람.
   - **scope_candidates 로 일원화 (dedup 배선)**: 확정된 carve_candidates 는 `analysis-source-inventory` 가 `inventory.json#scope_candidates[]` 의 **확정 출력**으로 흡수한다 (`source=scope_carve` + `carve_signals[]` 에 근거 신호 인용). scope-carve = **신호 엔진** / scope_candidates = **확정 결과** — 같은 개념을 두 산출물로 평행 유지 ❌. (carve 가 직접 scope_candidates 를 write 하지 않음 — soft gate #0 사람 확정 후 inventory 단계가 일원화 / reference-lens 보존.)
   - **hub_warning → backbone (backbone-first)**: `hub_warning`(Martin afferent-hub = 공통 커널 cache·base·utils 등)은 **개별 scope 로 쪼개면 파편화** → `scope_candidates[].role=backbone` 으로 빼서 1회 분석(모든 scope 참조). DB 도 동일(db-assets-always-on). backbone 을 먼저 빼면 feature 간 결합 급감 → 남은 feature = `role=scope`. (carve 는 hub 를 신호로 표시할 뿐 backbone 확정은 soft gate #0 사람.)

5. **finding 등재 (필요 시)** — 구조 risk = `_base-log-finding` 으로 low|medium reference finding (status=open / gate blocker 아님).

## 산출물

- `<user-project>/.ai-context/base/shared/scope-carve.json` (`schemas/scope-carve.schema.json` / reference-lens / NOT gate-injected / soft gate #0 evidence)

## 한계 (정직)

- **SCC garbage-in** — architecture.json deps 가 동적 dispatch/DI/iBATIS XML 매핑 누락 시 false 'sliceable'(codegraph iBATIS2 blind 정합). co-change 가 직교 보완하나 완전성 보장 ❌.
- **SCC = acyclic-by-construction FE 에서 confirmatory(생성적 아님)** — feature-sliced FE / 잘 계층화된 앱처럼 구조상 순환이 거의 없는 코드베이스에서 SCC 는 거의 항상 0 atomic-unit 만 낸다(분할-불가 덩어리 부재). 이때 SCC 의 가치는 새 seam 을 *생성*하는 게 아니라 "불법 cut 이 없다"를 *확인*하는 데 있다 — 실질 carve 안내는 Martin(seam/hub) + co-change + hotspot 가 짊어진다. SCC 가 0 을 냈다고 신호가 실패한 게 아니라 그 구조가 안전하게 분할 가능함을 증명한 것.
- **co-change = git 이력 필수** — 신규/sparse 이력 = cold-start(구조 중심이어도 신호 0). tangled commit = `max_transaction_size` 로 inflate 제어(soft gate).
- 구조 3신호 모두 **cohesion·도메인 의미 미포함** — 구조 신호 한정, 의미 경계 확정은 soft gate #0 의 사람.
- **hotspot complexity = indentation proxy**(cyclomatic 아님 / research "약한 proxy"). 우선순위 랭킹엔 충분(결정론)하나 절대 복잡도 아님. `tab_width` 의존(2-space 코드 = `--tab-width 2`). churn 은 co-change 와 동일 `.git` 의존.
- **official / 대형 코드베이스 conditional 권장** (소형은 carving 불요 / 전면 MANDATORY ❌). reference-lens·soft gate #0 evidence·chain-driver 무수정 불변. ≥2 distinct 도메인(소형 legacy + 대형 modern) corroborated. 잔존 carry — co-change·hotspot 의 2nd external target-with-history.

## 인용

- `schemas/scope-carve.schema.json`
- `tools/scope-carve/` (Tarjan SCC + Martin Ca/Ce/I + git co-change mining + Tornhill hotspot / real_tool evidence / no-simulation exit 3)
- DEC-2026-06-09-scope-carve-3signal-reference-lens + DEC-2026-06-09-hotspot-prioritization-reference-lens (본 skill 의 결정 / 모DEC = DEC-2026-06-09-reverse-eng-methodology-gap)
- DEC-2026-06-10-scope-carve-promotion (draft→official 격상 / ≥2 도메인 corroboration / 대형 conditional)
- DEC-2026-05-28-codegraph-probe-결과 §4.2 (reference-lens trust 모델 SSOT)
- DEC-2026-06-06-analysis-exit-gate (soft gate #0)
- `.claude/plans/research-reverse-engineering-carve.md` (3신호 적격 / 2신호 부적격 근거)
- DEC-2026-06-18-fe-dogfood-cycle6 (cycle6 — monorepo scope-root, external hub suppress, markdown excludes, minimal grep-graph 입력, SCC confirmatory·sink app-scale 한계 정정)
