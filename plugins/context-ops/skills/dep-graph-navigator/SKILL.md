---
name: dep-graph-navigator
description: dep-graph P4 (operation.md 결정 7) 신설. artifact 의존성 그래프(artifact-graph.json) 탐색 skill. /dep-graph-navigator <node-id> 로 특정 artifact 노드의 영향 트리(BFS MUST/SHOULD/FYI) + code_pointers(코드 anchor) + graph-wide top-3 impact root(centrality) 를 한 번에 조회. chain-driver navigate 명령에 위임 — AI 추론 0%, 결정적 알고리즘만. LLM context 접근성(I2/P4 통증 해소) — 리뷰어가 "이 artifact 를 바꾸면 무엇이 영향받나"를 grep/기억 없이 즉시 파악.
allowed-tools: Read, Bash
---

# dep-graph-navigator

dep-graph **P4 LLM context 접근성** skill (operation.md 결정 7 / I2·P4 통증 해소).

artifact 의존성 그래프 위에서 **"이 artifact 를 바꾸면 무엇이 영향받나"** 를 결정적 알고리즘으로 답한다. 사람 기억·grep·관습 의존 제거 (conventions.md §9 기계적 동작 우선).

## 언제 사용

| 상황                                | 동작                                                           |
| ----------------------------------- | -------------------------------------------------------------- |
| 특정 artifact 변경 전 영향 파악     | `/dep-graph-navigator <node-id>` → 영향 트리 (MUST/SHOULD/FYI) |
| artifact ↔ 코드 위치 확인           | 노드의 `code_pointers` (anchor_type 별 경로/심볼)              |
| 그래프 전체에서 가장 영향력 큰 노드 | top-3 impact root (centrality)                                 |
| 리뷰어 onboarding                   | 변경 PR 의 chain 노드를 navigate → 영향 범위 즉시 파악 (< 5분) |

## 입력

```
/dep-graph-navigator <node-id>
```

`<node-id>` 예: `UC-USER-001`, `BHV-USER-001`, `TASK-USER-001`, `STORY-USER-001`, `SCREEN-AUTH`(Epic), `OP-USER-001`, `analysis-business-rules`, `aspect-a11y`. (6-layer chain UC→BHV→AC→TASK→TC→IMPL + plan 조직 EPIC/STORY/OP)

## 동작 (AI 추론 0% — chain-driver navigate 위임)

1. **artifact-graph.json 위치 확인** — 기본 `.aimd/output/artifact-graph.json` (scope 별이면 `.aimd/<scope>/artifact-graph.json`). 없으면 사용자에게 합성 안내:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/traceability-matrix-builder/src/cli.js \
     --discovery <d> --behavior <b> --acceptance <a> --task-plan <p> --test-spec <t> --impl-spec <i> \
     --out-dir .aimd/output/ --graph
   ```

2. **navigate 명령 실행** (결정적):

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js navigate \
     --graph .aimd/output/artifact-graph.json \
     --origin <node-id> [--with-spec] [--json]
   ```

   `--with-spec`: 노드의 스펙 본문(chain leaf 6 subkind = UC/BHV/AC + TASK/TC/IMPL)을 source 파일에서 lazy-read 해 함께 표시 — "이 노드가 무엇을 하나"를 grep 없이 즉시. **본문 = reference-lens (gate 주입 ❌)** / TC 의 `expected_outcome`·`test_intent` = 기대 스펙값(실행 결과 아님 / gate 와 무관).

   `--prompt "<자연어>"` (NL 라우팅): 정확 node-id 몰라도 자연어에서 노드를 **결정론 substring 매칭**(id/title/symbol/file)해 해소. confident(strong+unique)면 top-1 자동 탐색, tie·약매칭이면 후보 list 만 표시(`--origin` 으로 명시). 결정론 only — 동의어·임베딩 ❌ (임베딩 의미검색 미지원). 예: `/dep-graph-navigator --prompt "회원가입 BHV 바꾸려는데"`.

   `--origin X --what-if "<op>"` (가설 변경 영향): 그래프에 **아직 없는 변경**(op=`remove-node:ID` | `add-edge:SRC>TGT[:type]`)을 in-memory 사본에 적용해 baseline 대비 영향 delta(newly orphaned/reachable)를 결정론 계산. **그래프 파일 write ❌**(비파괴 / `unsaved:true`). 가설 = op 문자열만(LLM 추론 ❌). origin 필수(op-target 와 다를 수 있음). 지원 op = core_two(remove-node + add-edge / deprecate·remove-edge·add-node 미지원).

3. **결과 해석** — 출력 그대로 사용자에게 전달. LLM 은 등급을 재계산하거나 추정하지 않는다 (결정적 BFS 결과가 권위).

## 출력 형식

```
[dep-graph-navigator] BHV-USER-001 (chain/BHV) state=active
  source: .aimd/output/behavior-spec.json
  code_pointers:
    - strict_path: src/auth/SignupService.kt
    - ast_symbol: src/auth/SignupService.kt #checkDuplicate
  영향 트리:
    MUST: AC-USER-001, IMPL-USER-001, TC-USER-001, UC-USER-001
    SHOULD: analysis-business-rules
    FYI: aspect-a11y
  top-3 impact root (graph-wide): UC-USER-001(3), UC-USER-002(2), BHV-USER-001(1)
```

| 출력                          | 의미 (operation.md 정의)                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MUST**                      | sync 강제 — hard chain 또는 cross_reference origin (결정 4 Step 1·2)                                                                                                                                                                                                                                                                                                                                                      |
| **SHOULD**                    | 검토 권고 — soft cross_reference 1-hop                                                                                                                                                                                                                                                                                                                                                                                    |
| **FYI**                       | 알림만 — soft informs 또는 SHOULD 의 1-hop 감쇠                                                                                                                                                                                                                                                                                                                                                                           |
| **code_pointers**             | artifact ↔ 코드 anchor (결정 3). anchor_type = strict_path/glob/ast_symbol/doc_link                                                                                                                                                                                                                                                                                                                                       |
| **spec 본문** (`--with-spec`) | 노드 source 파일의 chain leaf 6 subkind 본문 — UC/BHV/AC(title·description·pre/postconditions·invariants·gherkin) + TASK(behavior_ref·layer·module·ac_refs·dependencies) + TC(type·framework·expected_outcome·test_intent=기대 스펙값) + IMPL(framework·commit_hash·source_files·tc_refs). **reference-lens — gate 주입 ❌** / 배열 5 cap + `… (+N more)` / EPIC·STORY·OP·analysis/aspect·source 부재 = `(불가 — reason)` |
| **top-3 impact root**         | 그래프 전체에서 영향력 상위 노드 (결정 7 centrality / weighted out-degree)                                                                                                                                                                                                                                                                                                                                                |

## 알고리즘 (결정적 — `chain-driver navigate` 내부)

- **영향 트리**: confidence-aware BFS (operation.md 결정 4 / `impact-analyzer.js`). forward+backward 양방향. propose 노드 제외.
- **top-K impact root**: weighted out-degree centrality (operation.md 결정 7 / `centrality.js`). hard 엣지 가중 1.0 / cross_reference 0.5 / informs 0.25.
- **정책 override**: `policies/propagation-policy.json` 의 `edge_grade_overrides` 자동 반영.

## 코드 흐름 lens — context-federator (dep × codegraph)

artifact 영향 트리(의미)에 더해 **코드 구조(심볼·호출자·impact)** 까지 한 번에 보려면 `context-federator` 를 호출한다. 노드의 `code_pointers` 를 codegraph 인덱스와 join 해 `context-cache.json`(reference-lens) 을 만든다.

```bash
# 노드 지정 + 캐시 재사용(--delta)
node ${CLAUDE_PLUGIN_ROOT}/tools/context-federator/src/cli.js \
  .aimd/output/artifact-graph.json --origin BHV-USER-001 \
  --codegraph-project <인덱싱된 소스 루트> --out .aimd/output/context-cache.json --delta

# 자연어 프롬프트 (식별자/파일명/심볼 결정론 매칭)
node ${CLAUDE_PLUGIN_ROOT}/tools/context-federator/src/cli.js \
  .aimd/output/artifact-graph.json --prompt "SignupService 의 checkDuplicate 바꾸려는데" --codegraph-project <src>
```

- **사전**: codegraph 가 소스를 인덱싱(`codegraph index <src>`)했어야 코드 반쪽이 채워짐. 부재 시 dep 반쪽만 (`codegraph.available=false` 정직 표기 / no-simulation).
- **데이터 반쪽**(legacy / `--sql-inventory`·`--db-schema`): `data_refs[].dependent_tables[]` 에 컬럼 + **FK 위상**(`foreign_keys` = references_table·relationship_label / "이 테이블이 어느 테이블을 참조하나" table↔table) 동반. db-schema 직읽기 / reference-lens. FK·table 부재 = `[]`.
- **`--delta`**: 안 바뀐 노드는 재계산 0 (graph→dep / codegraph index→code 2축 무효화) = "다시 작업 안 하기".
- **trust**: codegraph = 휴리스틱 → context-cache = **reference-lens / gate 주입 ❌**. 영향 등급(dep)은 결정론 navigate verbatim, 코드 구조는 codegraph verbatim. LLM 이 재유추하면 ❌.
- 한글 산문만 있고 식별자 0 → 매칭 0 (`--origin` 지정 / 임베딩 의미검색 미지원).

## 관련 도구

- `tools/context-federator/src/cli.js` — dep×codegraph federation (코드 흐름 lens / 위 섹션)
- `tools/chain-driver/src/cli.js navigate` — 본 skill 의 backend
- `tools/chain-driver/src/impact-analyzer.js` — BFS (결정 4)
- `tools/chain-driver/src/centrality.js` — top-K (결정 7)
- `tools/chain-driver/src/cli.js impact` — 정책 평가까지 포함한 변경 영향 분석 (결정 5)
- `tools/chain-driver/src/cli.js query --graph` — raw graph JSON (툴링용)

## 참조

- `docs/dependency-graph.md` §2 (그래프 모델) + §5 (영향 등급 BFS) + §3 P4 (centrality + navigator) + §7 (알고리즘 상호작용)
- `schemas/artifact-graph-node.schema.json` / `artifact-graph-edge.schema.json`
- `docs/dependency-graph.md` §1 (요약 / 해소하는 통증)

## no-simulation 정합

본 skill 은 AI 추론 0% — `chain-driver navigate` 의 결정적 알고리즘 출력을 그대로 전달. LLM 이 영향 등급·centrality 를 추정하면 ❌ (결정적 결과가 SSOT).

## 인용

- 결단: DEC-2026-06-02-context-federation
- schema: schemas/artifact-graph-node.schema.json / schemas/artifact-graph-edge.schema.json
