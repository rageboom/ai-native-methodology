// code-pointer-validator core
// operation.md 결정 3 + P2 — artifact ↔ code 연관 강제.
//   "24 artifact 100% code_pointers 또는 명시적 N/A" (P2 완료 기준).
//
// 검증 (release-readiness #12 게이트):
//   1. 각 Tier-1 노드 (chain instance + analysis kind + aspect kind, state ∈ {active, drift})
//      에 code_pointers ≥ 1 또는 code_pointers_na=true 가 있어야 함.
//   2. 각 code_pointer 의 anchor_type 별 검증:
//      - strict_path: path 가 repo-root 기준 존재
//      - glob: path 또는 path+glob 패턴이 ≥ 1 매칭 (간이 검사 — '*' 가 있으면 readdir 매칭 시도)
//      - ast_symbol: warn-only (AST parser 외부)
//      - doc_link: warn-only (네트워크 외부)
//   3. stale 플래그 보존 — pointer.stale=true 면 informational finding emit.
//
// 입력: artifact-graph.json (graph-synthesizer 산출). code_pointers 가 node 에 평탄화돼 있음.
// 출력: { findings, coverage, summary }

import { existsSync, readdirSync } from 'node:fs';
import { join, dirname, basename, isAbsolute, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const TRAVERSABLE_STATES = new Set(['active', 'drift']);
const VALID_ANCHOR_TYPES = new Set([
	'strict_path',
	'glob',
	'ast_symbol',
	'doc_link',
]);

// 간이 glob — '*' 1개를 와일드카드로. 깊이 1 디렉토리 + 단일 와일드카드만 처리.
// 복잡한 패턴(**, [class], 등)은 fast-glob 같은 외부 라이브러리에 위임 (현 구현은 dependency-free).
function simpleGlobMatch(repoRoot, p) {
	const full = isAbsolute(p) ? p : join(repoRoot, p);
	if (!p.includes('*')) {
		return existsSync(full) ? [full] : [];
	}
	// 와일드카드 위치 분리
	const dir = dirname(full);
	const pat = basename(full);
	if (!existsSync(dir)) return [];
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return [];
	}
	const regex = new RegExp(
		'^' + pat.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$',
	);
	return entries.filter((e) => regex.test(e)).map((e) => join(dir, e));
}

// ============================================================================
// Loop A (동기화 루프 / docs/dependency-graph.md §3 Loop A) — 결정론 git 신호.
//   A3 relocation → suggested_path / A2 content-drift → drift 생산자.
//   전부 opt-in (opts.gitRunner 주입 시에만 동작) → 기존 호출부 behavior 무변경 (release-readiness #16 포함).
//   git 부재·repo 아님·추적 불가 = graceful null (no-simulation: 날조 ❌ / 환경 부재 정직 skip).
// ============================================================================

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
			const full = isAbsolute(candidate)
				? candidate
				: join(repoRoot, candidate);
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

function validateOnePointer(pointer, { repoRoot, opts = {} }) {
	const findings = [];
	const { anchor_type, path, glob, symbol, stale } = pointer;

	if (!VALID_ANCHOR_TYPES.has(anchor_type)) {
		findings.push({
			kind: 'code_pointer.invalid_anchor_type',
			severity: 'high',
			anchor_type,
			message: `unknown anchor_type '${anchor_type}' (allowed: strict_path/glob/ast_symbol/doc_link)`,
		});
		return findings;
	}

	if (stale === true) {
		findings.push({
			kind: 'code_pointer.stale_flag',
			severity: 'medium',
			anchor_type,
			path,
			message: `pointer 가 stale=true 로 표시됨${pointer.suggested_path ? ` (suggested: ${pointer.suggested_path})` : ''} — 결정 5 매트릭스에 따라 갱신 필요`,
		});
	}

	if (anchor_type === 'strict_path') {
		const full = isAbsolute(path) ? path : join(repoRoot, path);
		if (!existsSync(full)) {
			const finding = {
				kind: 'code_pointer.path_missing',
				severity: opts.strict ? 'high' : 'medium',
				anchor_type,
				path,
				resolved_path: full,
				message: `strict_path '${path}' 가 존재하지 않음`,
			};
			// Loop A / A3 — git rename 이력에서 이동처 추정 → suggested_path (opt-in / opts.gitRunner).
			if (opts.gitRunner) {
				const reloc = findRelocation(path, {
					gitRunner: opts.gitRunner,
					repoRoot,
				});
				if (reloc) {
					finding.suggested_path = reloc;
					finding.message += ` — git 이동 추적: '${reloc}' (suggested_path)`;
				}
			}
			findings.push(finding);
			return findings;
		}
		// Loop A / A2 — 파일 존재하나 commit_hash 시점 이후 내용 변경 = content-drift (opt-in).
		//   opts.worktree=true → 미커밋(작업트리) 변경도 탐지 (F-DF-A2-003 / detectContentDrift includeWorktree).
		if (opts.gitRunner && pointer.commit_hash) {
			const wt = opts.worktree === true;
			const drifted = detectContentDrift(path, pointer.commit_hash, {
				gitRunner: opts.gitRunner,
				includeWorktree: wt,
			});
			if (drifted === true) {
				findings.push({
					// §8.1 (DEC-2026-06-01-living-dep-graph-loops) — content_drift 는 --strict 와 무관하게 medium 고정.
					//   단일 도메인(RealWorld/poc-05) git blob-diff verdict → ≥2 distinct 도메인 corroboration 전까지 non-gating.
					//   gate(fail) 제외는 computeGateFail() 가 kind 로 필터 (medium 으로 보고만 / 가시성 유지).
					//   worktree 모드(미커밋 포함)도 동일 kind 재사용 → computeGateFail 의 content_drift 제외 자동 상속
					//     (신규 kind 신설 시 kind-필터 우회 → gating 격상 = §8.1 위반 / Senior REVISE-B).
					kind: 'code_pointer.content_drift',
					severity: 'medium',
					anchor_type,
					path,
					base_commit: pointer.commit_hash,
					...(wt ? { worktree: true } : {}),
					message: `strict_path '${path}' 내용이 commit_hash(${pointer.commit_hash.slice(0, 7)}) 이후 변경됨${wt ? ' (working-tree 모드 — 미커밋 변경 포함)' : ''} — anchor content-drift (노드 state→drift 권고 / non-gating)`,
				});
			}
		}
		return findings;
	}

	if (anchor_type === 'glob') {
		const pat = glob ?? path; // glob 필드 우선, 없으면 path 사용 (synthesizer 가 strict_path 만 평탄화하는 1차 cut 대응)
		const matches = simpleGlobMatch(repoRoot, pat);
		if (matches.length === 0) {
			findings.push({
				kind: 'code_pointer.glob_no_match',
				severity: opts.strict ? 'high' : 'medium',
				anchor_type,
				path,
				glob: pat,
				message: `glob '${pat}' 매칭 파일 없음`,
			});
		}
		return findings;
	}

	if (anchor_type === 'ast_symbol') {
		if (!symbol) {
			findings.push({
				kind: 'code_pointer.ast_symbol_missing_symbol',
				severity: 'high',
				anchor_type,
				path,
				message: `ast_symbol 인데 symbol 필드 비어있음`,
			});
		}
		// path 가 있으면 존재성 정도는 확인 (best-effort)
		if (path) {
			const full = isAbsolute(path) ? path : join(repoRoot, path);
			if (!existsSync(full)) {
				findings.push({
					kind: 'code_pointer.ast_symbol_path_missing',
					severity: 'medium',
					anchor_type,
					path,
					symbol,
					message: `ast_symbol path '${path}' 가 존재하지 않음 — symbol 검증은 AST parser 외부 (warn-only)`,
				});
			}
		}
		return findings;
	}

	if (anchor_type === 'doc_link') {
		// 네트워크 검증 외부. URL 패턴 형식만 sanity check.
		const looksLikeUrl = /^(https?:\/\/|\/\/)/.test(path);
		if (
			!looksLikeUrl &&
			!existsSync(isAbsolute(path) ? path : join(repoRoot, path))
		) {
			findings.push({
				kind: 'code_pointer.doc_link_unreachable',
				severity: 'low',
				anchor_type,
				path,
				message: `doc_link '${path}' 가 URL 도 아니고 로컬 경로도 존재하지 않음 — 사용자 검증 필요 (warn-only)`,
			});
		}
		return findings;
	}

	return findings;
}

function isTier1Node(node) {
	return (
		node &&
		typeof node.id === 'string' &&
		(node.artifact_kind === 'chain' ||
			node.artifact_kind === 'analysis' ||
			node.artifact_kind === 'aspect')
	);
}

export function validateCodePointers(
	graph,
	{ repoRoot = process.cwd(), opts = {} } = {},
) {
	const findings = [];
	const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
	const tier1Nodes = nodes.filter(isTier1Node);

	let covered = 0; // code_pointers ≥ 1
	let explicitNA = 0; // code_pointers_na=true
	let missing = 0; // 둘 다 없음
	let pointersChecked = 0;

	for (const node of tier1Nodes) {
		if (!TRAVERSABLE_STATES.has(node.state)) continue; // propose/deprecated 는 coverage 대상 제외

		const pointers = Array.isArray(node.code_pointers)
			? node.code_pointers
			: [];
		const na = node.code_pointers_na === true;

		if (pointers.length === 0 && !na) {
			missing++;
			findings.push({
				kind: 'code_pointer.coverage_missing',
				severity: opts.strict ? 'high' : 'medium',
				artifact_id: node.id,
				artifact_kind: node.artifact_kind,
				artifact_subkind: node.artifact_subkind,
				message: `${node.id} (${node.artifact_kind}/${node.artifact_subkind}) 에 code_pointers 가 없고 code_pointers_na=true 도 없음 — 결정 3 위반`,
			});
			continue;
		}

		if (na && pointers.length > 0) {
			// 모순: N/A 인데 pointer 있음 — operator 의도 모호 → 정보성
			findings.push({
				kind: 'code_pointer.na_conflict',
				severity: 'low',
				artifact_id: node.id,
				message: `${node.id} 는 code_pointers_na=true 이면서 code_pointers ${pointers.length} 개 보유 — 의도 모호`,
			});
		}

		if (na) {
			explicitNA++;
			continue; // pointer 검증 skip
		}

		covered++;
		for (const pointer of pointers) {
			pointersChecked++;
			const pointerFindings = validateOnePointer(pointer, { repoRoot, opts });
			for (const f of pointerFindings) {
				findings.push({ ...f, artifact_id: node.id });
			}
		}
	}

	const traversableCount = covered + explicitNA + missing;
	const coverageRatio =
		traversableCount === 0 ? 1.0 : (covered + explicitNA) / traversableCount;

	return {
		findings,
		coverage: {
			covered,
			explicit_na: explicitNA,
			missing,
			tier1_traversable: traversableCount,
			ratio: coverageRatio,
			threshold: 1.0, // P2 완료 기준 = 100%
		},
		summary: {
			total_findings: findings.length,
			high: findings.filter((f) => f.severity === 'high').length,
			medium: findings.filter((f) => f.severity === 'medium').length,
			low: findings.filter((f) => f.severity === 'low').length,
			pointers_checked: pointersChecked,
		},
	};
}

// gate(fail) 판정 — CLI exit code + release-readiness #16 의 PASS/FAIL 결정.
//   high severity = 항상 gating / medium = --strict 일 때만 gating.
//   §8.1 (DEC-2026-06-01-living-dep-graph-loops): content_drift 는 단일 도메인 git verdict →
//   ≥2 distinct 도메인 corroboration 전까지 gate 제외 (medium 으로 보고만 / --strict 와도 decouple).
//   ※ A1 freshness(graph.stale)는 애초에 result.findings 외부(checkGraphFreshness 별도) → 자동 제외.
export function computeGateFail(findings, { strict = false } = {}) {
	const gating = (findings ?? []).filter(
		(f) => f.kind !== 'code_pointer.content_drift',
	);
	const high = gating.filter((f) => f.severity === 'high').length;
	const medium = gating.filter((f) => f.severity === 'medium').length;
	return high > 0 || (strict && medium > 0);
}

// ============================================================================
// Loop A 그래프 레벨 헬퍼 (validateCodePointers 와 분리 — 기존 반환 shape 무변경)
// ============================================================================

// A2 producer→state — content_drift finding 을 노드 상태로 적용.
//   active --content_changed--> drift (graph-synthesizer TRANSITIONS 와 동형 / cross-package import 회피로 inline).
//   drift = 유지 / propose·deprecated = content_changed 무효 전이이므로 skip.
//   ※ graph 객체 in-place 변형. 디스크 기록(live graph 반영)은 호출부(SessionStart/driver) 책임 = 별도 wiring slice.
export function applyContentDrift(graph, findings) {
	const driftedIds = new Set(
		(findings ?? [])
			.filter((f) => f.kind === 'code_pointer.content_drift' && f.artifact_id)
			.map((f) => f.artifact_id),
	);
	let applied = 0;
	for (const n of graph?.nodes ?? []) {
		if (!driftedIds.has(n.id)) continue;
		if (n.state === 'active') {
			n.state = 'drift';
			if (!n.drift_reason)
				n.drift_reason =
					'code content changed since validated commit (Loop A content-drift)';
			applied++;
		}
	}
	return { applied, drifted_ids: [...driftedIds] };
}

// A1 freshness — _shared/graph-freshness.js 로 추출 (chain-driver SessionStart 배너와 DRY 단일 출처 공유).
//   export 표면 무변경 — 본 모듈 import 처(cli.js / test)는 그대로 동작 (re-export).
export { checkGraphFreshness } from '../../_shared/graph-freshness.js';
