# PoC #20 — notes-fullchain-livingsync (Node + raw SQL)

> **full-chain E2E + living-sync 관찰 dogfood.** 외부 신규 프로젝트(tiny 메모 서비스)에 방법론 운영 흐름을 처음부터 끝까지 돌려 **그래프 생성 → 새 요구사항 → 동기화 → 그래프 변경**을 실증한 PoC. (2026-06-08 / v0.20.x)

## 무엇을 입증하나 (관찰 3목표)

| # | 목표 | 결과 |
|---|---|---|
| 1 | **그래프가 잘 그려지는가** | UC→BHV→AC→TASK→TC 체인 + analysis 8노드 = **15 nodes / 23 edges** (Phase 1) |
| 2 | **새 요구사항 → 동기화 → 그래프 변경** | `sync-loop --git` 이 변경 4파일 자동감지 → forward closure → resync → **15→18 nodes / 23→31 edges / FK 1→2** (Phase 2) |
| 3 | **스테이지 흐름** | analysis→discovery→spec→plan→test 전 gate(`chain-driver next`) 실측 + soft-block/ack + intervention-log |

보너스: **G2-1 FK federation** 실작동 (`data_refs[].dependent_tables[].foreign_keys` = notes→users(author) + notes→categories(categorized_as)).

## 스택 / 구조

- **Node ESM + better-sqlite3 (raw SQL / ORM 아님)** — raw SQL 이라 sql-inventory + db-schema(FK) 가 생기는 스택(=data_refs/FK reading-aid 가 legacy 반쪽 메커니즘으로 적용). vitest 러너.
- `src/` — db.js(스키마 부트스트랩) · users.js · categories.js · notes.js(UC1 createNote) · schema.sql(users·notes·categories / FK 2)
- `input/` — analysis 6종(코드-고고학 추출): sql-inventory · db-schema(FK) · business-rules(BC-NOTES / BR-001·002·003) · domain · inventory · antipatterns
- `.aimd/output/` — chain 산출물(discovery·behavior·acceptance·task-plan·test-spec) + **artifact-graph.json** + context-cache.json(FK federation) + findings + intervention-log + state.json
- `test/` — vitest (5 tests / GREEN)

## 여정 (S2 AX전환 경로 / 3 commit)

| 단계 | 내용 | 그래프 |
|---|---|---|
| **C0** | 출발점 앱 + analysis 6종 + `chain-driver init` | — |
| **C1 (Phase 1)** | full chain 완주(gate #0~#3 + 실 vitest GREEN) → artifact-graph 합성 | **15 / 23** |
| **C2 (Phase 2)** | 요구사항2 "메모 카테고리" 투입 → `sync-loop --git` 자동감지 → cascade 재생성(BR-003/AC-003/TC-003) → resync-graph | **18 / 31** (FK 1→2) |

> Phase 2 가 이 PoC 의 핵심: 한 번 만든 운영 컨텍스트(그래프)가 **새 요구사항을 자동 감지하고 정확히 따라 변경**됨(P0 = 평생 동기화). `analysis-business-rules-BR-NOTES-CREATE-003` · `AC-NOTES-003` · `TC-NOTES-003` 노드 + `notes→categories` FK 가 추가됨.

## 재현 (plugin repo 루트에서 / `P=examples/poc-20-notes-fullchain-livingsync`)

```bash
# 그래프 합성
node tools/traceability-matrix-builder/src/cli.js \
  --discovery $P/.aimd/output/discovery-spec.json --behavior $P/.aimd/output/behavior-spec.json \
  --acceptance $P/.aimd/output/acceptance-criteria.json --task-plan $P/.aimd/output/task-plan.json \
  --test-spec $P/.aimd/output/test-spec.json --analysis-dir $P/input --out-dir $P/.aimd/output --graph

# FK federation (data_refs + foreign_keys)
node tools/context-federator/src/cli.js $P/.aimd/output/artifact-graph.json \
  --repo-root $P --sql-inventory $P/input/sql-inventory.json --db-schema $P/input/db-schema.json --no-callers --out /tmp/cc.json

# 앱 테스트 (PoC 디렉토리에서 / better-sqlite3+vitest 설치 후)
cd $P && npm install && npx vitest run   # 5 passed
```

## dogfood 가 찾은 chain harness rough-edge 2건 → 본체 환류

1. **persisted soft-block ack 불가** (gate UX 결함) — 일단 `blocked:true` 가 박히면 `next --user-decision go` 가 가드에 막혀 soft block(evidence_missing) 을 못 풀던 결함. → **v0.20.1 수정**(가드 `state.blocked && !args.userDecision` / 명시 결단만 재평가 통과 / anti-bypass·hard-block 무손상).
2. **`layer:be` openapi 강제** (by-design discoverability) — 비-API 라이브러리는 `application`/`domain` layer 가 탈출구. → **v0.20.1 힌트**(schema description + common-errors Q5.1).

## 정직한 한계

- gate #4/#5(implement) 형식 통과까지는 안 감(3 목표엔 불필요 / 그래프·sync 는 직접 도구로 검증).
- 기존코드 존재(S2)라 test=characterization(GREEN) — 순수 RED 아님.
- FK reading-aid = legacy(raw-SQL) 반쪽 메커니즘(modern ORM 은 codegraph 경로 / DEC-2026-06-08 G2-2).

## 인용

- DEC-2026-06-08-dep-graph-dependency-axis-gaps (G2-1 FK / G2-2 reframe)
- CHANGELOG [0.20.1] (dogfood rough-edge fix)
- guides/chain-harness-guide.md · common-errors.md Q5.1
