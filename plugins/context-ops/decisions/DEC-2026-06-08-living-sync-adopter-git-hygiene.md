# DEC-2026-06-08-living-sync-adopter-git-hygiene

**상태**: 승인·시행 (plugin.json 0.21.0 → 0.22.0 MINOR)
**관계**: Extends [DEC-2026-06-07-living-sync-operating-model](DEC-2026-06-07-living-sync-operating-model.md) (carry1b `--git` 변경 자동 감지 + carry2 `sync-converge` 수렴의 **운영 전제** 보강)

## 발단

poc-20(notes) 전체 living-sync 루프(진입 `sync-loop --git` → 소비 `sync-next` → 수렴 `sync-converge`)를 dogfood 하던 중, `sync-converge --git` 이 `.aimd/state.json` 을 `unresolved_paths` 로 잡아 `needs_resynth` 를 반환 → fixpoint 미도달. 1차 자기진단 = "테스트 셋업 실수(임시 repo 에서 `git add -A`)". 

## zero-base 전수조사 → 정정

`git ls-files examples/**/.aimd` 실측:
- **gitignore 됨**(plugin-root .gitignore:15-17): `state.json` · `state.json.tmp` · `output/intervention-log.jsonl` **만**.
- **커밋됨(tracked)**: 산출물 + **`artifact-graph.json` · `matrix.json` · `findings-*.json`** (= LLM 운영 컨텍스트/증거).

따라서 진짜 사실 2층:
1. **채택자 온보딩 갭**: `chain-driver init` 은 `.gitignore` 를 안 만든다. 채택자가 자기 프로젝트에서 `git add` 하면 `state.json`(도구 런타임 상태)이 추적됨 → `--git` diff 에 잡혀 false-unresolved. (이 레포 자체 버그 아님 — 레포는 이미 gitignore.)
2. **도구 자기 파생물 false-unresolved**: `artifact-graph.json` 등은 커밋 대상이라 resync 후 변경 시 `--git` diff 에 잡히는데, 노드 source_path 가 아니라 미매핑 → `unresolved`. gitignore 로 빼면 SSOT/증거 손실(레포 관행 모순) → **도구가 재검출에서 skip 하는 게 정답**.

## 결정 (B + C-lite)

### B — `chain-driver init` 이 `.aimd/.gitignore` 스캐폴드
- `ensureAimdGitignore(root)`: `.aimd/.gitignore` 부재 시만 생성(idempotent / 무클로버). 내용 = `state.json` · `state.json.tmp` · `**/intervention-log.jsonl` (레포 plugin-root .gitignore 동형 / **artifact-graph·matrix·findings 제외 ❌**).
- cmdInit 의 early-exit(`state.json already exists`) **前** 호출 → 기존 채택자 재-init 도 받음(upgrade 경로).

### C-lite — `--git` 재검출이 도구 자기 파생물 skip (opt-in)
- `resolveOriginNodeIds(graph, paths, { skipDerivedNoise })`: 노드 **미매핑 AND** `.aimd/` 하위 도구 파생물(`isAimdDerivedOutput`: basename ∈ {state.json·tmp, artifact-graph.json, matrix.json, context-cache.json, intervention-log.jsonl, findings-*.json})이면 `unresolved` 대신 `skipped_derived` 로 분류.
- 옵션은 **두 `--git` caller 만** 전달(`sync-loop --git`, `sync-converge`) → **lift(lift-anchor.js)·`--changed` 모드 무변경**.
- 미매핑이면서 도구 파생물도 **아님** = `unresolved` 유지 → 진짜 새 구조 산출물 신호 보존(carry2 BLOCKER-1 거짓 fixpoint 차단 철학).
- `.aimd/` prefix 한정(bare basename ❌ — 레포 밖 동명 파일 오skip 방지).

## 범위 밖
- artifact-graph.json 자체 gitignore (SSOT 손실 → reject).
- graph-freshness mtime → content-hash 정밀화 (기존 carry 유지 / `_shared/graph-freshness.js:11`).
- root `.gitignore` 수정 (자기완결 `.aimd/.gitignore` 로 충분).

## 검증
- chain-driver 494 → **502 GREEN** (신규 `test/adopter-git-hygiene.test.js` +8: C-lite opt-in/무회귀/prefix-pin/AND-guard · B 신규/idempotent/upgrade · --git e2e skip).
- **§8.1 2-도메인 dogfood**: poc-20 전체 루프 = artifact-graph **커밋 상태**로 fixpoint noise 0(이전엔 needs_resynth). poc-18(2nd domain) 실 그래프 --git skip(discovery-spec 변경 6 origin / 파생물 2 skip / unresolved 0).
- release-readiness 40/40 + 3-way drift 0.22.0.

## Senior 적대검토 (REVISE@0.78 → 전건 반영 / fact-check supplement)
- **MAJOR(범위)**: 필터를 call-site 가 아니라 `resolveOriginNodeIds` **내부**로 → 두 --git surface(sync-loop 경고 + converge) 단일점 커버. 채택.
- **Senior "무조건 내부" → opt-in 정정**: 코드확인 결과 lift-anchor.js:28·computeSyncLoop(--changed) 도 caller → 무조건 내부는 그쪽 의미 왜곡. **opt-in 옵션**으로 두 --git caller 만 적용(Senior 권고 개선).
- **MINOR**: basename → `.aimd/` prefix pin / B ensure 를 early-exit 前.
- Q1 soundness(노드 source_path ∩ 도구패턴 = 0건)·Q4 version(MINOR)·Q5 BLOCKER-1 보존 = SAFE 확인.

## 교훈
1차 "테스트 셋업 실수" 자기진단을 zero-base 전수조사로 정정 → 진짜 갭(채택자 온보딩 + 도구 self-output false-flag) 발견. 내 carry 주장에 정박하지 말 것. B 단독은 사용자 목표(noise-free)를 못 이룸을 코드 사실(레포가 artifact-graph 커밋)로 확인 후 B+C 로 확장.
