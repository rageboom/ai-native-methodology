<!-- allow-provenance: 정책 SSOT 근거(DEC 인용·gate-eval authority grounding)가 본문 핵심 내용 (codegraph-navigation-first.md·test-layering.md 동형 정책 doc grounding). -->

# draft-first 점진 analysis — 최소 grounding floor 정책 (canonical SSOT)

> analysis 산출물 ~21종을 처음에 다 만들 필요 없다. **핵심 grounding floor**만 먼저 만들어 discovery 에 진입하고, 나머지는 **per-scope 로 심화**한다. 진입 부담(breadth)을 줄이는 게 목적 — **산출물 *개수*를 줄이지, 산출물을 얕게 만들지 않는다**(breadth-only / depth-thinning ❌). policies SSOT (`no-simulation.md` · `honesty-tiers.md` · `automation-boundary.md` 동렬). 상태: v0.86.0 신설 (DEC-2026-06-29-draft-first-minimal-subset).

## 1. 왜 — 양극단 사이의 중간 경로

analysis 는 soft exit gate #0 (advisory / `automation-boundary.md`). v0.85.0 진입 라우터는 "분석 미완이면 analysis 먼저"로 보내지만, 그게 "21종 전부"로 읽히면 처음 부담이 커서 사용자가 그냥 스킵하게 된다. 결과적으로 1급 경로가 **양극단**뿐이었다:

- (a) analysis 통째로 다 하고 시작 — 부담.
- (b) 그냥 스킵 — grounding 없는 거짓 진행.

→ 본 정책은 **"핵심 floor 만 먼저 → 작업하며 per-scope 심화"** 라는 중간 경로를 1급으로 둔다.

## 2. breadth-only — depth-thinning 이 아니다

- 만든 산출물은 **정상 full-depth · source-grounded** 다. 단지 처음엔 **개수**가 적다(floor 만).
- 미룬 산출물은 **honestly absent** — 빈 stub ❌, 가짜 "partial" 도장 ❌ (no-simulation). 파일이 없는 건 "아직 분석 안 함"의 정직한 표현이다.
- 따라서 산출물 스키마에 `coverage`/`partial` 필드를 **추가하지 않는다**(depth-marker ❌). within-artifact 불완전성 정직성은 §4 finding 으로 처리.

## 3. 최소 grounding floor (authority = `gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.analysis)

discovery/spec 가 **genuinely 의존**하는 것만 floor 에 둔다. 판정 권위는 schema 의 required 목록이 아니라 **gate#0 REQUIRED 검증기가 실제로 필요로 하는 입력**이다.

> **표 = floor *개념* (probe ≠ gate 분리)**: 아래 표는 "무엇이 grounding 에 필요한가"의 개념 목록이다. **`minimalSubsetPresent` probe(§6)는 universal HARD 3종만 AND** 로 본다. **⊙ 트랙 조건부** 산출물의 존재·완전성은 probe 가 아니라 **gate#0 검증기**(spec-stage)가 조건부로 책임진다. `inventory` 는 둘 다 아님(guidance).

| 산출물 | floor? | 근거 |
| --- | --- | --- |
| `architecture.json` | ✅ HARD | `br-cross-consistency-validator` BR↔아키텍처 패턴 정합 입력 |
| `domain.json` | ✅ HARD | `verdict-consistency-validator` + discovery business_intent 추출원 |
| `business-rules.json` | ✅ HARD | discovery-spec `business_rules_intent[].br_id` 1:1 backward link (semantic 필수) |
| `openapi.yaml` | ⊙ 조건부 (BE 트랙) | `formal-spec-link-validator` |
| `schema.json`/`db-schema.json` | ⊙ 조건부 (DB 트랙) | DB-always-on |
| ≥1 FE 산출물 (ui-spec/state-map 등) | ⊙ 조건부 (FE 트랙) | `spec-integrate-deliverables` (FE 트랙일 때 ≥1) |
| ≥1 formal-spec (decision-table/state-machine/sequence/invariant) | ✅ spec 진입 시 | `spec-integrate-deliverables` behavior-spec 당 ≥1 |

- **`inventory.json` = recommended / guidance** — stack 신호 추출원이라 실무상 먼저 만들지만 **AND-gate 에 넣지 않는다**(greenfield·FE-first 에서 false-negative 회피 / `ai-context-layout.js` analysisOutputPresent 경고 정합). gate#0 REQUIRED 입력 아님.
  - **단, inventory 가 만들어질 땐 `scope_candidates` 카디널리티 ≥1 불변식**(DEC-2026-06-30 / minItems:1): 소형·단일 코드베이스(carve 빈 후보)여도 `whole_codebase_fallback` 후보 1개를 항상 emit 해 soft gate #0 에서 사람이 확정 → 단일 full-codebase 도 균일 scope 패러다임으로 물질화(global/no-scope 대신 / 나중 scope 확장 seam). advisory 유지(gate-inject ❌) — "per-scope 심화"의 scope 가 항상 ≥1 존재하도록 보장하는 진입 floor.
- **floor 밖(미룸)**: `antipatterns.json` · `migration-cautions.json` · `static-security-spec.json` · `error-mapping-spec.json` · 비-진입 FE 산출물 등 → per-scope 또는 조건부. gate#0 가 강제하지 않는다(chain-coverage cross_links 는 ≥1 medium 만 요구).

## 4. within-artifact 불완전성 정직성 — deferred finding

floor 산출물도 그 자체로 불완전할 수 있다(예: business-rules.json 에 명백한 BR 12개만 — 실제 40개일 수 있고 gate#0 는 *완전성*을 검사하지 않는다). 이를 **draft 도장**이 아니라 **finding** 으로 정직화한다:

- floor 완성 시 **미룬-항목 finding**(finding-system / `F-*`)을 emit — (1) **미룬 산출물 목록**, (2) 정직 노트 *"이 subset 은 시작 baseline (scoped to X) — per-scope 작업하며 BR/도메인이 더 surface 됨"*.
- 이 finding 이 **deferred-tracking 갭도 닫는다** — `bc-accumulator-rollup` 에는 "무엇을 미뤘나" 개념이 없으므로, finding 이 그 추적의 SSOT 역할을 한다.

## 5. 점진 심화 = 기존 메커니즘 재활용 (신규 0)

floor 이후 심화는 새 도구가 필요 없다:

- `analysis-scope-carve` — 도메인/scope 경계 (reference-lens / gate-inject ❌).
- `bc-accumulator-rollup` — per-BC fragment 멱등 upsert (재실행 = deepen / sibling BC 보존). 한 scope 씩 깊게, 나머지는 thin 유지.

## 6. 결정론 axis (STRONG-STOP)

- **`minimalSubsetPresent(root)`** (`tools/_shared/ai-context-layout.js`) — **universal floor 3종**({architecture,domain,business-rules}) 존재의 **AND**. 순수 fs + 상수 파일명 (LLM inject ❌). "discovery 진입 grounding 충분히 됐나" **advisory 신호** — 어떤 결정적 gate 에도 inject ❌ (`analysisOutputPresent` 와 동일 trust). 트랙 조건부 산출물(openapi/schema/FE)은 **AND 에 넣지 않는다** — 트랙 판정이 fs-순수로 불가 + 그 완전성은 gate#0 검증기(spec-stage)가 조건부로 본다(§3 표).
- deferred finding = finding-system reference-lens. 라우터/surface 안내 = additionalContext (display-only).
- 스키마 변경 0 / 새 state 필드 0 / 새 analysis mode 0.

## 7. 인용

- DEC-2026-06-29-draft-first-minimal-subset (본 정책의 모 결단)
- DEC-2026-06-26-analysis-state-aware-router (v0.85.0 진입 라우터 — 본 정책이 "floor 부터"로 안내를 정밀화)
- DEC-2026-06-06-analysis-exit-gate (analysis = soft exit gate #0)
- `tools/chain-driver/src/gate-eval.js` (REQUIRED_VALIDATORS_PER_STAGE.analysis = floor authority)
- `methodology-spec/policies/no-simulation.md` (미룬=absent honest / 가짜 partial ❌)
