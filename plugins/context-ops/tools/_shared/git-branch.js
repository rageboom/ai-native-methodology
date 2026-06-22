// git-branch.js — branch-per-task git hygiene 의 git 결정론 query/mutation 프리미티브.
//
// 배경: DEC-2026-06-19-branch-per-task-git-hygiene. enter-task 가 Sub-task 브랜치를 결정론으로
//   생성/전환하고, PreToolUse 가드가 현재 브랜치를 판정하려면 git query/mutation 이 필요하다.
//   code-pointer-git.js 의 makeGitRunner(범용 execFileSync 래퍼)를 재사용하되, read-only 프리미티브
//   (detectContentDrift/findRelocation)와 의미가 다른 MUTATION 을 별 파일로 분리한다
//   (코드 위생 / read-only 래퍼 오염 회피 / plan §5).
//
// 정직 경계(no-simulation): git 부재·repo 아님·detached·unborn = graceful null/false (날조 ❌ /
//   환경 부재 정직 신호). makeGitRunner 는 nonzero exit 시 throw → 여기서 catch.
//   gitmech 1차출처(VERIFIED / git-symbolic-ref(1)): 현재 브랜치 = `symbolic-ref -q HEAD`(plain) —
//   exit 0 → `refs/heads/<name>`, exit 1 → detached(throw). `--short`/`rev-parse --abbrev-ref` 는
//   detached 시 비결정적(전자=리터럴 'HEAD')이라 가드 판정에 부적합 → 채택 ❌.

const HEADS_PREFIX = 'refs/heads/';

// 브랜치 type-prefix 결정론 도출 (DEC-2026-06-19-branch-per-task §3.6 / LLM 추측 ❌).
//   Jira issue type → 버그류면 'bugfix' / 그 외(Sub-task 포함)는 'feature'. 키·type 모두 Jira SSOT.
//   issue type 미상(null/미수집) = 'feature' default (Sub-task cascade 기본 / v1 bug-flow deferred).
//   사내 한글 type('버그'/'결함') + 영문(bug/defect) 모두 매칭.
const BUG_TYPE_RE = /bug|defect|버그|결함|hotfix|핫픽스/i;
export function deriveBranchPrefix(issueType) {
	if (issueType && BUG_TYPE_RE.test(String(issueType))) return 'bugfix';
	return 'feature';
}

// git 사용 가능 여부 (repo + git 바이너리). false = 환경 부재 → 정직 skip.
export function gitAvailable(gitRunner) {
	if (typeof gitRunner !== 'function') return false;
	try {
		gitRunner(['rev-parse', '--git-dir']);
		return true;
	} catch {
		return false;
	}
}

// 현재 브랜치명 (또는 null = detached / unborn / git 부재). 가드 판정용 권위 소스.
export function currentBranch(gitRunner) {
	if (typeof gitRunner !== 'function') return null;
	let out;
	try {
		out = gitRunner(['symbolic-ref', '-q', 'HEAD']);
	} catch {
		return null; // detached HEAD / git 부재 / repo 아님
	}
	if (!out) return null;
	const t = out.trim();
	return t.startsWith(HEADS_PREFIX) ? t.slice(HEADS_PREFIX.length) : t || null;
}

// HEAD 가 unborn(커밋 0개)인가 — 신규 init 레포. (git 부재와 구분: gitAvailable 로 선판정)
export function isUnborn(gitRunner) {
	if (!gitAvailable(gitRunner)) return false;
	try {
		gitRunner(['rev-parse', '--verify', '-q', 'HEAD']);
		return false;
	} catch {
		return true;
	}
}

// 로컬 브랜치 <name> 존재 여부.
export function branchExists(gitRunner, name) {
	if (typeof gitRunner !== 'function' || !name) return false;
	try {
		gitRunner(['rev-parse', '--verify', '-q', `${HEADS_PREFIX}${name}`]);
		return true;
	} catch {
		return false;
	}
}

// MUTATION — 신규 브랜치 생성 + 전환 (현재 HEAD 에서 분기 / start-point·-B reset 명시 ❌).
export function createBranch(gitRunner, name) {
	return gitRunner(['checkout', '-b', name]);
}

// MUTATION — 기존 브랜치로 전환.
export function switchBranch(gitRunner, name) {
	return gitRunner(['checkout', name]);
}
