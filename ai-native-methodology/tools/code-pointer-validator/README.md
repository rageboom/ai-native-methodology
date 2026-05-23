# code-pointer-validator

★ 12번째 validator (operation.md 결정 3 + P2 완료 기준). release-readiness #12 게이트.

`artifact-graph.json` 의 24 Tier-1 노드에 대해 **code_pointers 또는 명시적 N/A** 충족과 **경로 존재성**을 결정적 알고리즘으로 검증.

## 사용법

```bash
code-pointer-validator <artifact-graph.json> [--repo-root <dir>] [--strict] [--format text|json]
```

| flag | 의미 |
|---|---|
| `--repo-root <dir>` | code_pointer.path 해석 base (default: cwd) |
| `--strict` | missing/path-not-found 를 high severity 로 격상 (release 게이트) |
| `--format json` | 기계용 출력 (CI/hook 통합) |

### 종료 코드

| code | 의미 |
|---|---|
| 0 | pass (severity high 없음, strict 모드에서는 medium 도 없음) |
| 1 | fail (severity high 또는 strict 모드의 medium) |
| 2 | usage error / 파일 읽기 실패 |

## 검증 항목

### A. Coverage — Tier-1 노드 100% 룰

- `state ∈ {active, drift}` Tier-1 노드 (chain instance + analysis kind + aspect kind) 는
  - `code_pointers` ≥ 1 개 OR
  - `code_pointers_na: true` (명시적 N/A 마커)
  중 하나 충족.
- `propose` / `deprecated` 노드는 coverage 대상 제외 (operation.md 결정 1 일시 상태).

### B. anchor_type 별 pointer 검증

| anchor_type | 검증 | severity (default / strict) |
|---|---|---|
| `strict_path` | repo-root 기준 path 존재 | medium / high |
| `glob` | path 와일드카드 매칭 ≥ 1 (간이 — `*` 1개) | medium / high |
| `ast_symbol` | `symbol` 필드 필수 (없으면 high). path 존재성은 best-effort | high (symbol 누락) |
| `doc_link` | URL 형식 OR 로컬 경로 존재 (네트워크 검증 외부) | low (warn) |

### C. 상태 플래그

- `pointer.stale=true` → `code_pointer.stale_flag` (medium, informational). `suggested_path` 가 있으면 메시지에 동봉. 결정 5 매트릭스 입력.
- `code_pointers_na: true` + `code_pointers` 동시 존재 → `code_pointer.na_conflict` (low, 의도 모호).

## 출력 (`--format json`)

```json
{
  "findings": [
    { "kind": "code_pointer.coverage_missing", "severity": "medium", "artifact_id": "BHV-USER-001", ... }
  ],
  "coverage": {
    "covered": 22, "explicit_na": 1, "missing": 1,
    "tier1_traversable": 24, "ratio": 0.958, "threshold": 1.0
  },
  "summary": { "total_findings": 1, "high": 0, "medium": 1, "low": 0, "pointers_checked": 24 }
}
```

## 입력 형식

`artifact-graph.json` 은 `graph-synthesizer` 산출. node 형식은 `schemas/artifact-graph-node.schema.json`:

```json
{
  "id": "IMPL-USER-001",
  "artifact_kind": "chain",
  "artifact_subkind": "IMPL",
  "state": "active",
  "code_pointers": [
    { "path": "src/auth/signup.kt", "anchor_type": "strict_path", "commit_hash": "abc1234..." }
  ]
}
```

또는 `code_pointers_na: true` 로 명시적 N/A.

## 설계 결정

- **graph 입력만 받음 (raw artifact 입력 미지원)** — synthesizer 가 이미 frontmatter 의 code_pointers 를 노드에 평탄화하므로 SSOT 가 분기되지 않음. 향후 frontmatter ↔ graph 일관성은 synthesizer 가 보장.
- **ast_symbol 은 warn-only** — 진정한 검증은 언어별 AST parser 필요. 본 validator 는 dependency-free 유지.
- **doc_link 도 warn-only** — 네트워크 호출 외부. URL 형식만 sanity check.
- **propose/deprecated 제외** — operation.md 결정 1 정의에 따라 일시 상태. coverage 대상에 넣으면 정상 사용자 confirm 흐름을 false positive 로 막음 (graph-integrity-validator orphan 정책과 정합).
- **간이 glob (`*` 1개)** — 외부 의존 회피. 복잡 패턴은 strict_path 다중 항목 또는 ast_symbol 권장.

## 운영 plan 참조

- `dep-graph/operation.md` 결정 3 (code_pointers), 결정 5 (stale matrix), Verification #12
- `schemas/code-pointer.schema.json`
- `schemas/artifact-graph-node.schema.json` (`code_pointers` + `code_pointers_na`)
