// code-pointer-git.js — code_pointer ↔ git 결정론 신호 공용 프리미티브 (DEC-2026-06-07-br-split / living-sync Phase 2b).
//
// 추출 배경: living-sync Phase 2b(`chain-driver lift --reconcile`)가 손수정 코드의 anchor 관측사실 신선도를
//   git 으로 재탐지해야 하는데, 탐지 로직(detectContentDrift/findRelocation/makeGitRunner)이 code-pointer-validator
//   패키지에만 있었고 chain-driver 는 cross-import 0(deps=ajv). _shared 추출 = DRY 단일 출처 (선례: load-business-rules.js,
//   graph-freshness.js / cross-tool 프리미티브 확립 패턴). code-pointer-validator 는 re-export 로 API 표면 무변경.
//
// 정직 경계(no-simulation): git 부재·repo 아님·추적 불가·commit 무효 = graceful null (날조 ❌ / 환경 부재 정직 skip).
//   gitRunner 주입형(테스트 seam) — 모듈 자체는 부작용 없는 함수 집합.

import { existsSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';
import { execFileSync } from 'node:child_process';

// 실 git 호출 래퍼 (cross-platform — git 은 native exe). 실패 시 throw → 호출부가 catch.
export function makeGitRunner(repoRoot = process.cwd()) {
	return (args) =>
		execFileSync('git', args, {
			cwd: repoRoot,
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'ignore'],
			timeout: 5000,
			windowsHide: true,
		});
}

// A3 — path 가 사라졌을 때 git rename 이력에서 새 경로 추정 (blob-hash + 유사도).
//   gitRunner(args)->stdout. 추적 불가/실패/새 경로 부재 = null (제안 없음).
export function findRelocation(
	path,
	{ gitRunner, repoRoot = process.cwd() } = {},
) {
	if (typeof gitRunner !== 'function') return null;
	let out;
	try {
		out = gitRunner([
			'log',
			'-M',
			'--diff-filter=R',
			'--name-status',
			'--format=',
			'--',
			path,
		]);
	} catch {
		return null; // git 부재 / repo 아님 / 추적 불가
	}
	if (!out) return null;
	for (const line of out.split('\n')) {
		const m = line.match(/^R\d*\t(.+?)\t(.+)$/); // R<score>\told\tnew (log 최신순 → 첫 매치 = 최근 이동)
		if (m && m[1] === path) {
			const candidate = m[2].trim();
			const full = isAbsolute(candidate) ? candidate : join(repoRoot, candidate);
			return existsSync(full) ? candidate : null; // 현재 실제 존재할 때만 제안
		}
	}
	return null;
}

// A2 — commit_hash 시점 대비 내용 변경 여부. 변경=true / 무변경=false / 판정불가=null.
//   includeWorktree=false (기본) → base→HEAD (커밋된 변경만 / 기존 behavior byte-identical).
//   includeWorktree=true  → base→작업트리 ('HEAD' 인자 제거) = 커밋된 변경 + 미커밋(staged/unstaged) 포함 superset.
//     근거: git-diff(1) Form 4 "changes you have in your working tree relative to the named <commit>" (VERIFIED / 공식문서).
//     untracked(신규·미add) 파일은 git diff 가 미포함 → 본 기능은 "이미 앵커된(추적되는) 파일"만 보므로 무관.
export function detectContentDrift(
	path,
	commitHash,
	{ gitRunner, includeWorktree = false } = {},
) {
	if (typeof gitRunner !== 'function' || !commitHash) return null;
	let out;
	try {
		const args = includeWorktree
			? ['diff', '--name-only', commitHash, '--', path] // base→작업트리 (미커밋 포함)
			: ['diff', '--name-only', commitHash, 'HEAD', '--', path]; // base→HEAD (커밋된 것만)
		out = gitRunner(args);
	} catch {
		return null; // commit 무효 / git 부재
	}
	return out.trim().length > 0;
}
