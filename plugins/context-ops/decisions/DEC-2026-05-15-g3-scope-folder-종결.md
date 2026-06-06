# DEC-2026-05-15 — G3 산출물 폴더 자동 + 지속 운영 인프라 종결

- **결정일**: 2026-05-15
- **결정자**: 윤주스 (TF Lead)
- **상태**: 종결 (v3.2)

## 결정

charter §3 G3 (R5/R7 산출물 폴더 자동 생성) 종결.
v3.1.0 의 ⚠️ → ✅ 전환.

## 본질 재정의 (2026-05-15 사용자 발언)

> "개발자들이 프로젝트를 계속 운영하는 게 가장 중요하고, 매번 신기능이나 수정을 할 때 **참조가 쉬워야** 하고 **동기화도 되어야** 한다."

G3 = 1회성 폴더 자동화 hook ❌ / **지속 운영 인프라** ✅.

## 구현 요약

| 영역 | 구현 |
|---|---|
| Layout | `.aimd/<scope>/{planning,spec,test,impl}/` — feature/도메인 scope (사용자 자유 명명 kebab-case) + stage 내부 폴더 (chain prefix ❌ / v2.6.0 의미 ID paradigm 정합) |
| 5 이식성 산출물 | C 하이브리드 — canonical `.aimd/output/` global + scope local subset 옵션 (큰 프로젝트) + manifest `analysis_refs` 인덱스 |
| Manifest | 이중 렌더링 (`manifest.json` + `manifest.md`) — scope manifest + stage manifest 두 레벨. ADR-008 v2 정합 |
| Sync | **M4** = 자동 drift 감지 + 수동 갱신. SessionStart hook 이 `sync_state.drift_detected=true` 자동 set + 사용자 명시 `chain-driver sync --scope <s>` 호출 시 cascade. M3 자동 cascade 는 v3.x carry (사용자 자동화 신뢰 쌓인 후 재검토) |
| Lookup | `chain-driver query [--scope] [--stage] [--ref] [--stale]` — analysis_refs 역인덱스 + drift filter |

## 신설 / 수정 자산

신설:
- `schemas/work-unit-manifest.schema.json` (scope + stage manifest schema)
- `tools/chain-driver/src/work-unit.js` (manifest 객체 생성 helper + renderManifestMd)
- `tools/chain-driver/src/sync.js` (M4 — hashFile / detectDrift / markDrift / cascade)
- `tools/chain-driver/src/query.js` (executeQuery — D12 Lookup)
- `tools/chain-driver/test/{scope-dir,sync,query}.test.js` (RED → GREEN 42 cases)

수정:
- `tools/chain-driver/src/state-store.js` — `validateScopeSlug` / `scopeDirPath` / `ensureScopeDir` / `writeManifest` / `readManifest` / `listScopes` + DEFAULT_STATE current_scope:null
- `tools/chain-driver/src/cli.js` — cmdInit (--scope) / cmdNext (manifest 자동 갱신) / cmdQuery / cmdSync 신설
- `tools/chain-driver/src/hooks-bridge.js` 와 cli.js cmdHooksBridge — SessionStart event handler 추가 (recover + markDrift + 사용자 안내)
- `hooks/hooks.json` — SessionStart command echo → `chain-driver hooks-bridge`
- `schemas/state.schema.json` — `current_scope` optional 필드 추가
- `methodology-spec/lifecycle-contract.md` — §파일 위치 컨벤션 확장 (scope/stage 트리)
- `methodology-spec/id-conventions.md` — scope slug 항목 신설
- `methodology-spec/plugin-charter.md` — §2 R5/R7 ⚠️→✅ + §3 G3 종결 표기
- `schemas/README.md` — 31 → 32 schema / work-unit-manifest 등재

## 검증

- 114/114 test pass (기존 72 + scope-dir 22 + sync 11 + query 9).
- Plan = `~/.claude/plans/parallel-shimmying-stream.md` 의 §검증 1~5 통과.
- e2e smoke test 는 별도 후속 (Task #10 / validator wiring 마무리).

## 후속 (carry)

- v2.1+ — multi-scope 동시 진행 (state.json `current_scope` 단일 → 배열 확장)
- v2.1+ — semantic-diff (BR 단위 의미 변경) drift 감지 / 현 = git content-hash
- v3.x — M3 자동 cascade mode (사용자 자동화 신뢰 쌓인 후 재검토 / `.aimd/config.json` sync_mode=auto)
- v3.x — scope rename 자동 명령 (현 = 수동 mv + manifest 갱신)
- v3.x — canonical global 도메인 분할 (rules.json 200KB+ 시)
- v3.x — **drift-validator 의 sync_state 정합 검증 통합** — 현 = state-store 의 schema validation 만 (writeManifest 시점). drift-validator pipeline 진입 시 모든 scope manifest 의 sync_sources hash 비교 + dependents 그래프 cycle 검출 추가 의무
- v3.x — **schema-validator 의 .aimd/<scope>/ 자동 scan** — 현 schema-validator 는 hidden dir (`.aimd/`) skip 정책 (`name.startsWith('.')`). manifest 자동 picked-up 위해 예외 처리 또는 명시 인자 (`--scan-aimd`) 추가
- v3.x — `flows/sdlc-4stage-flow.json` gates[].validators 에 `work-unit-manifest-validator` entry 추가 (drift-validator 통합 후)
- v3.x — 산출물 생성 skill 들의 manifest 자동 갱신 통합 (planning skill → planning-spec.json 작성 시 stage manifest.linked_artifacts 자동 update + traceability_refs 자동 추출)

## 정합 관계

- DEC-2026-05-15-plugin-charter-17-requirements-채택 — charter §3 G3 활성 우선순위 1위
- ADR-CHAIN-005 §2 (atomic write + CAS) — `writeManifest` 가 같은 transaction 재사용
- ADR-008 v2 (이중 렌더링) — `manifest.json` + `manifest.md` 의무
- v2.6.0 paradigm (`skills-axis.md` §8 phase-N 폐기) — stage 폴더 `planning/spec/test/impl` 의미 ID
