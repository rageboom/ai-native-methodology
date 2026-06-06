# DEC-2026-06-01-a2-worktree-mode

> dep-graph A2 content-drift working-tree 모드 (커밋 안 한 변경 탐지 / carry F-DF-A2-003 해소). v11.25.0 MINOR.

## 맥락

session "계속 진행" → (Type 2 외부-준비 감사 1회 탐색 후 사용자 "b"=dep-graph 이어서) → dep-graph 남은 carry 중 **A2 '커밋 안 한 변경' 탐지** 선택 (실사용 가치 큼 / 겹침 없음 / 새 도메인 불필요).

A2 `detectContentDrift` 는 `git diff --name-only <base> HEAD -- <path>` 로 **커밋된 변경(base→HEAD)만** 본다. 개발 중(아직 커밋 안 한) 코드 변경은 못 봄 → LLM 운영 컨텍스트 live 동기화(P0)에 공백.

## 결정

opt-in `--worktree` 모드 추가 (additive / breaking 0):
1. `detectContentDrift(..., { gitRunner, includeWorktree=false })` — true 면 args 에서 `'HEAD'` 제거 → `git diff --name-only <base> -- <path>` = base→작업트리 = 커밋된 변경 + 미커밋(staged/unstaged) **superset**. 반환 boolean|null 보존.
2. `validateOnePointer` — `opts.worktree===true` 전달 + finding 에 `worktree:true` 마커. **kind=`code_pointer.content_drift` 유지** (신규 kind ❌ — `computeGateFail` 의 content_drift 제외=§8.1 non-gating 자동 상속 / 신규 kind 면 gate 우회→gating 격상 위험 / Senior REVISE-B).
3. CLI `--worktree`(→ --git 자동). **`--worktree` + `--apply-drift` = exit 2 하드 차단** (Senior REVISE-C — 미커밋 WIP 를 그래프 corpus 에 영구 기록 시 오염).

## 근거 (4원칙)

- §1 plan = `.claude/plans/plan-a2-worktree-mode.md`.
- §2 research: 공식 git 문서 (official-docs-checker) — `git diff <base> -- <path>` = working tree vs base superset / untracked 미포함 / `--name-only` boolean 판정 = 5 claim **VERIFIED**. Senior (GO_WITH_REVISE @0.82) — superset 단일 diff v1 충분(A) / kind 재사용(B) / --apply-drift 조합 하드차단(C 채택) / `= {}` 기본값 보존(D).
- §3 사용자 승인 "진행 (이대로 구현)".

## 검증 (no-simulation)

- code-pointer-validator +5 test (40→45) / workspace 1008→**1013** / 0 fail / release-readiness **26/26**.
- RealWorld dogfood (외부 repo / 실 git): committed 모드 content_drift 0 vs worktree 모드 1 (`UserMapper.xml` 미커밋 변경 탐지) / `--worktree --apply-drift` exit 2 / RW src 무변경. evidence = `_dogfood-realworld/.../.aimd/a2-worktree-probe.md`.

## §8.1

read-class·additive·opt-in·non-gating → gate-class 아님. 단일 RealWorld = mechanism 입증 (≥2 distinct 도메인 A2 usability = gate-class carry 유지).

## 잔여 carry

① committed vs uncommitted 분해 보고(2nd git call / v2) ② ≥2 distinct 도메인 A2 usability ③ db-schema→DDL 앵커(접근 C) ④ A3 relocation dogfood ⑤ FE kinds 앵커.
