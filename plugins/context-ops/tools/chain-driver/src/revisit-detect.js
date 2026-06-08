// revisit-detect.js — git diff → 영향 chain 추론 + LOC confidence (Senior F4).
// ADR-CHAIN-003 + ADR-CHAIN-005 §5 정합.

import { spawnSync } from 'node:child_process';
import { isUpstream } from './stage-graph.js';

const MIN_NON_COMMENT_LOC = 5; // < 5 미만은 자동 ignore + log only

// path-to-chain whitelist
const PATH_PATTERNS = [
	{ regex: /\.ai-context\/.*discovery-spec\.json$/, chain: 'discovery' }, // v11.0.0 planning-spec → discovery-spec rename / v12 json 단독
	{ regex: /\.ai-context\/.*behavior-spec\.json$/, chain: 'spec' },
	{ regex: /\.ai-context\/.*acceptance-criteria\.json$/, chain: 'spec' },
	{ regex: /\.ai-context\/.*test-spec\.json$/, chain: 'test' },
	{ regex: /\.test\.[tj]sx?$/, chain: 'test' },
	{ regex: /test\/.*\.(py|java|kt|go|rb|cs)$/, chain: 'test' },
	{ regex: /\.ai-context\/.*impl-spec\.json$/, chain: 'implement' },
	{
		regex: /^src\/.*\.(ts|tsx|js|jsx|py|java|kt|go|rb|cs)$/,
		chain: 'implement',
	},
	{
		regex: /\.ai-context\/.*\/(rules|domain|api-extension)\.json$/,
		chain: 'analysis',
	},
];

export function classifyPath(path) {
	for (const { regex, chain } of PATH_PATTERNS) {
		if (regex.test(path)) return chain;
	}
	return null;
}

export function isIgnoredByGlobs(path, globs = []) {
	for (const g of globs) {
		if (matchGlob(path, g)) return true;
	}
	return false;
}

function matchGlob(path, glob) {
	// minimal glob: ** = anything (incl. /), * = no slash.
	// Token-based assembly avoids escape ordering bugs.
	let i = 0;
	let re = '';
	while (i < glob.length) {
		if (glob[i] === '*' && glob[i + 1] === '*') {
			re += '.*';
			i += 2;
		} else if (glob[i] === '*') {
			re += '[^/]*';
			i += 1;
		} else if (/[.+^${}()|[\]\\]/.test(glob[i])) {
			re += '\\' + glob[i];
			i += 1;
		} else {
			re += glob[i];
			i += 1;
		}
	}
	return new RegExp(`^${re}$`).test(path);
}

export function gitDiffNumstat(repoRoot, baseSha = 'HEAD~1', headSha = 'HEAD') {
	const result = spawnSync(
		'git',
		['diff', '--numstat', headSha ? `${baseSha}..${headSha}` : baseSha], // headSha=null → ref↔worktree (carry 1b)
		{
			cwd: repoRoot,
			encoding: 'utf-8',
			shell: false,
			maxBuffer: 10 * 1024 * 1024,
		},
	);
	if (result.status !== 0) {
		return { ok: false, error: result.stderr || 'git diff failed', files: [] };
	}
	const files = [];
	for (const line of result.stdout.split('\n')) {
		if (!line.trim()) continue;
		const [addedStr, deletedStr, path] = line.split('\t');
		const added = addedStr === '-' ? 0 : Number(addedStr);
		const deleted = deletedStr === '-' ? 0 : Number(deletedStr);
		if (path) files.push({ path, added, deleted });
	}
	return { ok: true, files };
}

export function detectRevisit({
	changedFiles,
	currentChain,
	ignoreGlobs = [],
	minLoc = MIN_NON_COMMENT_LOC,
}) {
	const perChainLoc = new Map();
	const ignoredPaths = [];
	const matchedPaths = [];
	for (const { path, added, deleted } of changedFiles) {
		if (isIgnoredByGlobs(path, ignoreGlobs)) {
			ignoredPaths.push(path);
			continue;
		}
		const chain = classifyPath(path);
		if (!chain) continue;
		matchedPaths.push({ path, chain, added, deleted });
		perChainLoc.set(chain, (perChainLoc.get(chain) || 0) + added + deleted);
	}

	let bestTarget = null;
	let bestLoc = 0;
	for (const [chain, loc] of perChainLoc.entries()) {
		if (chain === currentChain) continue;
		if (!isUpstream(chain, currentChain)) continue;
		if (loc > bestLoc) {
			bestLoc = loc;
			bestTarget = chain;
		}
	}

	if (!bestTarget) {
		return {
			revisit_target: null,
			confidence_loc: 0,
			reason: 'no upstream chain matched',
			changed_paths: matchedPaths.map((m) => m.path),
			ignored_paths: ignoredPaths,
		};
	}

	if (bestLoc < minLoc) {
		return {
			revisit_target: null,
			confidence_loc: bestLoc,
			reason: `LOC ${bestLoc} < threshold ${minLoc} — auto-ignored`,
			candidate_target: bestTarget,
			changed_paths: matchedPaths.map((m) => m.path),
			ignored_paths: ignoredPaths,
		};
	}

	return {
		revisit_target: bestTarget,
		confidence_loc: bestLoc,
		reason: `${bestTarget} files changed (${bestLoc} LOC) — upstream of ${currentChain}`,
		changed_paths: matchedPaths
			.filter((m) => m.chain === bestTarget)
			.map((m) => m.path),
		ignored_paths: ignoredPaths,
	};
}
