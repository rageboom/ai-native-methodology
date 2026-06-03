# plan — A2 working-tree 모드 (커밋 안 한 변경 탐지 / carry F-DF-A2-003)

> 상태: DRAFT (4원칙 §1). 사용자 승인(§3) 후 착수.
> 선택 경로: session "계속 진행" → (Type 2 감사 폐기) → "dep-graph 이어서" → **A2 '커밋 안 한 변경' 탐지** 선택.

## 목표 (1줄)

A2 content-drift 가 지금은 **커밋된 변경만**(base→HEAD) 본다. **작업 중(uncommitted) 코드 변경도** 탐지하도록 opt-in 모드 추가 → 개발 중 실시간 drift 탐지 (P0 = LLM 운영 컨텍스트 live 동기화).

## 현 상태 (깊은 숙지 / `tools/code-pointer-validator/src/validator.js`)

- `detectContentDrift(path, commitHash, { gitRunner })` (L87) = `git diff --name-only <commitHash> HEAD -- <path>` → base→**HEAD** 비교. **커밋 안 한 변경 안 봄.**
- `validateOnePointer` (L142-157): strict_path 존재 + `opts.gitRunner && pointer.commit_hash` → `detectContentDrift` → `content_drift` finding (medium 고정).
- `computeGateFail` (L301): `content_drift` 는 gate(fail) 제외 (§8.1 non-gating / DEC-2026-06-01-living-dep-graph-loops).
- CLI (`cli.js`): `--git`(gitRunner 주입) / `--strict` / `--apply-drift`(→ --git) / `--format`. opts 평탄 전달.
- 회귀 가드: gitRunner 미주입 = A2 분기 미진입 (release-readiness #16 = poc-05 정적 read, --git 무 → 무영향).

## git 의미 (§2 research 로 교차검증 의무)

- `git diff <base> HEAD -- <path>` = base→HEAD (커밋된 것만). **현재.**
- `git diff <base> -- <path>` (HEAD 생략) = base→**작업트리** = 커밋된 변경 + staged + unstaged 전부 = **superset**. **worktree 모드.**
- drifted=true 의미: "앵커 파일이 검증 시점 baseline 과 (커밋·미커밋 불문) 다르다." → uncommitted-only 케이스를 추가로 잡음.

## 설계 (additive / opt-in / breaking 0)

1. **`detectContentDrift`** — 3번째 옵션 `includeWorktree=false` 추가. true → args 에서 `'HEAD'` 제거. 반환 boolean|null 보존 (caller 무영향).
2. **`validateOnePointer`** — `detectContentDrift(..., { gitRunner, includeWorktree: opts.worktree === true })`. finding 에 `worktree:true` 마커 + 메시지에 "(working-tree 모드 — uncommitted 포함)" 부기. **kind = `content_drift` 유지** → §8.1 non-gating 자동 상속 (uncommitted = 더 transient = gating ❌ 정합).
3. **CLI** — `--worktree` 플래그 (→ `out.git=true` 자동, --apply-drift 와 동형). usage 1줄 + opts 전달.
4. **회귀**: `--worktree` 미지정 = 기존 committed 모드 byte-identical (HEAD 인자 유지).

### 의도적 v1 scope (재작업 최소화)

- worktree 모드 = **superset 단일 diff**. "committed vs uncommitted 분해 보고"는 2nd git call 필요 → v1 제외 (정직: finding 은 worktree 모드 여부만 표기, "순수 uncommitted"라 주장 ❌). v2 후보로 carry.
- `--apply-drift` 와 worktree 조합: 작업트리(미커밋) 변경으로 그래프 파일에 drift 영구 기록은 **위험**(WIP 가 corpus 오염) → worktree 모드는 **보고 전용 권장**, --apply-drift 와의 상호작용은 문서 경고. (기능 차단까진 안 함 — 사용자 opt-in 책임 / 단 dogfood 시 --apply-drift 미사용.)

## 검증 (no-simulation)

### 단위 test (+≥4 / fakeGit 확장)

- `fakeGitWorktree({committedChanged, worktreeChanged})` = args 에 'HEAD' 유무로 분기.
- ① worktree 모드 + uncommitted-only(committed=false/worktree=true) → content_drift 발화 + `worktree:true`.
- ② **회귀 가드** — 동일 fake, worktree opt 미설정(committed 모드) → uncommitted-only 미탐지 (content_drift 없음 / 기존 behavior 보존).
- ③ args shape 검증 (spy) — worktree=`[diff,--name-only,hash,--,path]`(HEAD 없음) / committed=`[...,hash,HEAD,--,path]`.
- ④ §8.1 — worktree content_drift 도 medium 고정 + `computeGateFail` 제외 (strict 여도 fail ❌).
- ⑤ 기존 committed A2 test 전부 무회귀.

### RealWorld dogfood (실 git·실 CLI / 외부 repo)

1. RealWorld 그래프 재합성 `--commit-hash <RealWorld-HEAD>` (baseline=현 HEAD → committed diff 깨끗).
2. committed 모드(`--git`): content_drift 0 (base==HEAD, clean tree).
3. 앵커 파일 1개에 **uncommitted 편집** (예: DDL `V1__create_tables.sql` 주석 1줄 append).
4. committed 모드(`--git`): 여전히 content_drift 0 (HEAD 불변 = uncommitted 안 봄 = 기존 한계 입증).
5. worktree 모드(`--worktree`): **content_drift 발화** (편집 파일 / uncommitted 탐지 입증).
6. **편집 revert** (`git checkout -- <file>` / 작업트리 원복 / --apply-drift 미사용 = 그래프 파일 무변경).
7. evidence = `_dogfood-realworld/.../.aimd/a2-worktree-probe.md`.

## §8.1 (정직)

- read-class·additive·opt-in·non-gating (content_drift kind 상속) → gate-class 아님.
- 단일 RealWorld 도메인 = uncommitted-detection **mechanism 입증** (ceiling 주장 ❌ / ≥2 distinct 도메인 = gate-class carry 유지).
- self-referential 아님: 새 capability (개발 중 live drift) / 실 외부 repo 실 git·CLI measurement.

## STOP-3 (release gate)

workspace test (1008→+N) all pass + release-readiness 26/26 + skill-citation 0 stale + version 3-way + breaking 0 = MINOR (v11.24.0→v11.25.0).

## Lessons Learned (실패 시 기록)

(미발생)
