# graph-integrity-validator

`artifact-graph.json` 무결성 검증 (13번째 validator). release-readiness #13 게이트.

## 검증 항목

| # | 항목 | 알고리즘 | 실패 시 |
|---|---|---|---|
| 1 | **Cycle 감지** | DFS 색칠 (white/gray/black) — back-edge 발견 시 stack 경로를 사이클로 기록 | release-readiness #13 fail. 결정 5의 topological sort 가 작동 불가 → 자동 cascade 차단 |
| 2 | **Orphan 감지** | `state ∈ {active, drift}` 노드 중 in/out 엣지가 모두 없는 것. `propose`/`deprecated`는 제외 | release-readiness #13 fail. graph-synthesizer 가 edge 추론을 빠뜨렸을 가능성 |
| 3 | **Unknown edge** | `source` 또는 `target` 이 `nodes` 배열에 없는 엣지 | release-readiness #13 fail. graph-synthesizer 가 dangling 엣지를 만들었거나 외부 수정 발생 |

## 사용법

```bash
graph-integrity-validator <path-to-artifact-graph.json> [--format text|json]
```

### 옵션

- `--format text` (기본) — 사람용 요약 + 위반 목록
- `--format json` — 기계용 전체 결과 (CI/hook 통합)
- `--help` / `-h` — 도움말

### 종료 코드

| code | 의미 |
|---|---|
| 0 | pass (cycle 0, orphan 0, unknown 0) |
| 1 | fail (위 3 항목 중 ≥ 1 발견) |
| 2 | usage error / 파일 읽기 실패 |

## 입력 형식

`artifact-graph.json` 은 `graph-synthesizer` 가 산출 (Phase 1 다음 작업).

```json
{
  "nodes": [
    {
      "id": "UC-USER-001",
      "artifact_kind": "chain",
      "artifact_subkind": "UC",
      "source_path": "specs/uc/UC-USER-001.md",
      "state": "active"
    }
  ],
  "edges": [
    {
      "source": "UC-USER-001",
      "target": "BHV-USER-001",
      "edge_type": "derived_from",
      "confidence": "hard"
    }
  ]
}
```

각 노드·엣지의 완전한 schema 는:

- `schemas/artifact-graph-node.schema.json`
- `schemas/artifact-graph-edge.schema.json`

## 출력 형식 (`--format json`)

```json
{
  "passed": false,
  "cycles": [["A", "B", "C", "A"]],
  "orphans": [{ "id": "ORPHAN-NODE", "reason": "no incoming or outgoing edges" }],
  "unknown_edges": [
    { "edge": { "source": "A", "target": "GHOST", "edge_type": "derived_from" }, "reason": "target 'GHOST' not in nodes" }
  ],
  "summary": {
    "node_count": 4,
    "edge_count": 3,
    "cycle_count": 1,
    "orphan_count": 1,
    "unknown_edge_count": 1
  }
}
```

## 설계 결정

- **DFS over Tarjan SCC**: Tarjan 은 모든 SCC 를 찾지만 본 그래프(24-node Tier-1)에는 over-engineering. DFS 색칠로 첫 cycle 만 보고하면 운영자 수정 후 다시 돌리는 사이클로도 충분.
- **propose/deprecated 는 orphan 검사 제외**: 결정 1 노드 상태 정의에 따라 둘은 일시적 상태. orphan 으로 잡으면 정상 사용자 confirm 흐름을 false positive 로 막음.
- **unknown edge 는 cycle/orphan 과 동급 fail**: graph-synthesizer 의 합성 자체가 어긋났다는 신호이므로 즉시 게이트.

## 테스트

```bash
npm test
```

10개 골든 케이스 — clean / cycle-3 / self-loop / orphan + propose/deprecated 분리 / unknown edge / 빈 그래프 / 입력 누락 방어 / 동시 발생 / drift orphan / id 누락.

## 운영 plan 참조

- `docs/dependency-graph.md` §2 (그래프 모델) + §3 (도구 맵 / 알고리즘 셋) + §7 (알고리즘 상호작용) + release-readiness #15
- `docs/dependency-graph.md` §1 (요약 / 해소하는 통증)
