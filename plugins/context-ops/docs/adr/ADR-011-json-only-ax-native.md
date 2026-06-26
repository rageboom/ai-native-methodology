# ADR-011: 단일 json 렌더링 (AX-native) — `.mermaid` + `.md` twin 산출물 폐기

- 상태: 승인됨 (Accepted)
- 일자: 2026-06-01
- 결정자: sangcl (사용자 결단 — "json 단독 / 완전 AX")
- 관련: ADR-008 ( supersedes — 이중 렌더링 사상), ADR-002 (amends — 산출물), ADR-009 (amends — 산출물 신뢰 모델), ADR-FE-002 (amends — FE 이중 렌더링), ADR-001 (사상적 기반), ADR-CHAIN-011 ( 무관 / non-goal — BR text dual-representation), DEC-2026-06-01-json-only-ax-native (모체), DEC-2026-05-30-use-scenario-taxonomy (P0 AX 운영)

## 컨텍스트

ADR-008 "이중 렌더링 사상"은 모든 산출물을 단일 진실(SSOT)에서 출발해 **두 청중**(AI 눈 = `.json`/`.yaml`, 사람 눈 = `.md`/`.mermaid`)에게 동시 산출했다. 그러나 v11.7.0 이후 P0 가 **"AX 운영"**(산출물 = LLM 의 운영 컨텍스트 그 자체 / DEC-2026-05-30-use-scenario-taxonomy)으로 이동하면서 본 사상의 비용·편익이 역전되었다.

**실측 (2026-06-01 / 2 distinct domain — RealWorld Spring/MyBatis + ecommerce NestJS/Prisma)**:

- LLM·모든 검증 도구는 **`.json`(SSOT)** 을 입력으로 읽는다. `.md`/`.mermaid` 는 **생성-전용 사람-눈 미러**로, 어떤 도구도 입력으로 읽지 않는다 (matrix.md/manifest.md = write-only / validator = json read / stage 간 data contract = json).
- 따라서 `.md`/`.mermaid` twin 은 LLM 운영 컨텍스트에 **0 기여**한다 (삭제해도 무손실 / 유지해도 LLM 무관).
- 동시에 dual/triple-rendering 은 **2차 렌더링 drift 표면**을 만든다 — ADR-009 §1.1 메커니즘 #5 가 명명한 실패. `.mermaid` 는 LLM ROI 최저(메모리 `project_planning_doc_format`: 표 > 자연어 > Mermaid )이면서 drift 위험만 더했다.

→ AX 운영 P0 하에서 산출물은 **json 단독(완전 AX-native)** 이어야 한다.

## 결정

**committed deliverable/phase-flow `.mermaid` + deliverable `.md` dual-rendering twin 을 전면 폐기하고, 산출물을 `.json` 단독 SSOT 로 전환한다.**

1. **`.mermaid` 전면 제거** — architecture/domain/erd/behavior-diagrams/matrix + `flows/*.phase-flow.mermaid`. drift-validator 의 `.json↔.mermaid` 비교 모듈 제거.
2. **deliverable `.md` dual-rendering twin 전면 제거** — architecture.md/domain.md/api.md/rules.md/avoid-list.md + discovery-spec.md/behavior-spec.md/acceptance-criteria.md/task-plan.md/test-spec.md/impl-spec.md/matrix.md/manifest.md. skill/agent/builder 는 **편집**(`.md`/`.mermaid` emit 만 제거 / 자산 존속 / `.json` 생성 유지).
3. **cosmetic 흡수** — `.mermaid` 에만 있던 표현 정보(erd 관계 동사 / architecture edge 라벨)는 additive JSON 필드(`db-schema foreign_keys[].relationship_label` / `architecture dependencies[].note`·`detail`)로 흡수 후 삭제 (정보 무손실).
4. **standalone `.md` 산출물 json 化** — `migration-cautions.md`(산출물 #7' / json twin 부재) → `migration-cautions.json`(`schemas/migration-cautions.schema.json`).
5. **consumed functional `.md` json 전환** — `intent-vs-bug.md` 분류 데이터는 `characterization-spec.json`(`intent_vs_bug` 객체 + `snapshots[].intent_classification`)으로 통합 / validator 가 json 소비.
6. **artifact rename-drift = JSON-only 재구현** — 구 `compare-phase-flow.js` 의 `.json↔.mermaid` artifact-filename drift 검사는 mermaid 제거로 moot. **신규 handoff+registry 체크**(`check-handoff-consistency.js` + `flows/artifact-registry.json`)로 대체. 정직 표기: 1:1 replacement 아님 — 원 버그는 source 에서 moot + 신규는 상보적 cross-stage handoff 체크.
7. **사람 눈 = on-demand viz** — committed 미러 대신 view-time 렌더링(graphviz DOT / md-render-on-read CLI)로 대체 = drift 를 source 에서 제거. 현 시점 **DEFER**(carry `C-on-demand-viz`) / 사람 gate-검토는 당분간 raw json.

### 유지 (폐기 아님)

- **방법론 본체 `.md`** — CLAUDE.md / README / `docs/adr/**` / `methodology-spec/**` 스펙 / `guides/**` / `briefing/**`. 이것은 방법론의 명세 문서이지 생성 산출물이 아니다.
- **audit registry** — `findings.md` / `poc-findings.md` (finding-system 의 감사 추적 / json twin 이 아님).
- **functional consumed report** — `tree.md` / `stack-detection.md` / 검증 리포트 (dual-rendering twin 이 아닌 독립 functional 산출 / 향후 json 전환 carry).

## 대안 (검토 후 거부)

### 대안 1: `.mermaid` 만 제거, `.md` twin 유지 (mermaid-only)

- **장점**: 사람 gate-검토 prose 보존 / charter "사람 검토 ≤15%" 정합 / ADR-008 부분 보존(Amend).
- **거부 이유**: `.md` 는 LLM 에게 0 기여(json 만 읽음)이고 사람-눈 전용이라 AX 운영 P0 와 정합도 낮음. 사용자 결단 = "완전 AX json 단독". (단 이 대안의 trade-off 는 정직하게 검토·기각되었음 — 사람 gate ergonomics 저하 수용.)

### 대안 2: `.md` 를 표/ASCII 로 대체

- **거부 이유**: 사용자 결단 "그냥 삭제" (대체 비용 / 품질 저하 수용). category-C illustrative 다이어그램도 동일.

## 결과

### 긍정

1. **drift 표면 제거** — 2차 렌더링 자체가 사라져 `.json↔.md/.mermaid` 발산 불가능.
2. **단일 SSOT** — 산출물 = json 단독 = LLM 운영 컨텍스트 그 자체 (AX-native 정합).
3. **산출 비용 1배** — ADR-008 의 "~2배 산출 비용" 부정적 영향 해소.

### 부정적 / 위험

1. **사람 gate-검토 ergonomics 저하** — gate #1~#5 사람 검토가 prose `.md` → raw `.json`. 완화: on-demand viz (carry / defer).
2. **governance 비용** — ADR-008 supersede + ADR-002/ADR-009/ADR-FE-002/charter R7 amend.
3. **breaking** — schema optional path 필드 제거 + 실 산출물 재emit 필요 → v12.0.0 MAJOR.

## ADR-008 과의 관계

ADR-008 (이중 렌더링 사상) 은 본 ADR 에 의해 **Superseded**. ADR-008 의 "단일 진실(SSOT)" 원칙은 보존(오히려 강화 — json 이 유일 진실)되나, "두 청중 / 사람 눈 = .md·.mermaid 동시 산출" 의무는 폐기된다. ADR-008 본문은 역사 기록으로 보존.

**ADR-CHAIN-011 (BR dual-representation) 은 무관** — natural_language + given/when/then 의 **텍스트** 이중 표현이며 diagram rendering 이 아니다. 본 ADR 의 scope 밖 (혼동 금지).

## 참고

- DEC-2026-06-01-json-only-ax-native (본 ADR 모체)
- DEC-2026-05-30-use-scenario-taxonomy (P0 AX 운영)
- ADR-009 §1.1 (다이어그램 drift 메커니즘 — 본 ADR 이 source 에서 제거)
- `schemas/migration-cautions.schema.json` (standalone .md → json)
- `tools/drift-validator/src/check-handoff-consistency.js` (rename-drift JSON-only 재구현)
