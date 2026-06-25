// branch-per-task.test.js — branch-per-task git hygiene (DEC-2026-06-19-branch-per-task)
//   커버리지: deriveBranchPrefix(순수) / buildLinkageBlock(순수) / branchGuardReason(순수 / additive) /
//     enter-task(preview·missing·stage·prefix·--confirm git 6모드·멱등) / finish-task(no-task·GREEN미달·preview·graceful) /
//     PreToolUse 가드(deny·allow·opt-out). no-simulation: git mutation 은 실 temp repo (GIT 부재 시 skip).
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
	mkdtempSync,
	mkdirSync,
	writeFileSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

import {
	initState,
	writeStateCAS,
	readState,
} from '../src/state-store.js';
import { deriveBranchPrefix } from '../../_shared/git-branch.js';
import { buildLinkageBlock } from '../src/linkage-builder.js';
import { branchGuardReason } from '../src/hooks-bridge.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');
const run = (args, opts = {}) =>
	spawnSync('node', [CLI, ...args], { encoding: 'utf-8', ...opts });

function gitOk() {
	try {
		execFileSync('git', ['--version'], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}
const GIT = gitOk();

const SCOPE = 'reservation';
const EVIDENCE = {
	meta: { confidence: 0.9 },
	stage: 'plan',
	ticket_cascade: {
		epics: [{ jira_id: 'DWPD-1400', title: '예약 모듈' }],
		stories: [
			{
				jira_id: 'DWPD-1450',
				behavior_ref: 'BHV-RES-001',
				epic_ref: 'DWPD-1400',
				ac_refs: ['AC-RES-003', 'AC-RES-004'],
				title: '예약 기능',
			},
		],
		op_tasks: [],
		subtasks: [
			{ jira_id: 'DWPD-1473', task_id: 'TASK-RES-001', parent_jira_id: 'DWPD-1450', parent_kind: 'story', layer: 'be', title: '예약 생성' },
			{ jira_id: 'DWPD-1474', task_id: 'TASK-RES-002', parent_jira_id: 'DWPD-1450', parent_kind: 'story', layer: 'be', title: '예약 검증' },
			{ jira_id: 'DWPD-1475', task_id: 'TASK-RES-003', parent_jira_id: 'DWPD-1450', parent_kind: 'story', layer: 'fe', title: '예약 화면' },
			{ jira_id: 'DWPD-1599', task_id: 'TASK-RES-009', parent_jira_id: 'DWPD-1450', parent_kind: 'story', layer: 'be', title: '결함 수정' },
		],
	},
	mcp_invocations: [
		{ ticket_id_created: 'DWPD-1473', issue_type: 'Sub-task' },
		{ ticket_id_created: 'DWPD-1599', issue_type: 'Bug' }, // bug-flow prefix 도출 검증용
	],
};
const TASK_PLAN = {
	meta: { confidence: 0.9 },
	derivation_source: { discovery_spec_path: 'x' },
	tasks: [
		{
			id: 'TASK-RES-002',
			title: '예약 검증',
			layer: 'be',
			behavior_ref: 'BHV-RES-001',
			ac_refs: ['AC-RES-003', 'AC-RES-004'],
			dependencies: ['TASK-RES-001'],
			execution_order: 2,
		},
	],
};

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), 'branch-per-task-'));
});
after(() => {
	rmSync(tmp, { recursive: true, force: true });
});

// 비-git 프로젝트 셋업 (state + evidence + task-plan). enter-task --confirm 외 모든 read 경로 검증용.
function setupProject(name, { stage = 'implement', implGreen = false, currentTask = null } = {}) {
	const root = join(tmp, name);
	initState(root, name);
	writeStateCAS(root, (s) => {
		// v2.0 전역 단일 — current_scope 커서 + 전역 chain/stage_progress (scope_states 제거).
		s.current_scope = SCOPE;
		s.current_chain = stage;
		if (implGreen) {
			s.stage_progress.implement = {
				status: 'complete',
				gate_decision: 'go',
				completed_at: '2026-06-19T00:00:00.000Z',
			};
		}
		if (currentTask) s.current_task = currentTask;
		return s;
	});
	const evDir = join(root, '.ai-context', 'runtime', 'evidence');
	mkdirSync(evDir, { recursive: true });
	writeFileSync(
		join(evDir, 'ticket-sync-plan-exit-2026-06-19T00:00:00Z.json'),
		JSON.stringify(EVIDENCE),
		'utf-8',
	);
	const planDir = join(root, '.ai-context', 'scopes', SCOPE, 'plan');
	mkdirSync(planDir, { recursive: true });
	writeFileSync(join(planDir, 'task-plan.json'), JSON.stringify(TASK_PLAN), 'utf-8');
	return root;
}

// git 레포 셋업 (enter-task --confirm + 가드용). main 브랜치 1 커밋.
function setupGitProject(name, opts = {}) {
	const root = setupProject(name, opts);
	const git = (args) =>
		execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
	git(['init', '-q', '-b', 'main']);
	git(['config', 'user.email', 't@t.t']);
	git(['config', 'user.name', 't']);
	writeFileSync(join(root, 'README.md'), '# x\n', 'utf-8');
	git(['add', '.']);
	git(['commit', '-q', '-m', 'init']);
	return { root, git };
}

// ─── 순수 함수: deriveBranchPrefix ───
describe('deriveBranchPrefix — Jira issue type → 브랜치 prefix (결정론)', () => {
	it('Sub-task / null / undefined → feature (default)', () => {
		assert.equal(deriveBranchPrefix('Sub-task'), 'feature');
		assert.equal(deriveBranchPrefix(null), 'feature');
		assert.equal(deriveBranchPrefix(undefined), 'feature');
		assert.equal(deriveBranchPrefix('Story'), 'feature');
	});
	it('Bug / 버그 / 결함 / Defect → bugfix', () => {
		assert.equal(deriveBranchPrefix('Bug'), 'bugfix');
		assert.equal(deriveBranchPrefix('버그'), 'bugfix');
		assert.equal(deriveBranchPrefix('결함'), 'bugfix');
		assert.equal(deriveBranchPrefix('Defect'), 'bugfix');
	});
});

// ─── 순수 함수: buildLinkageBlock ───
describe('buildLinkageBlock — 결정론 linkage block', () => {
	it('full evidence — 이 PR/Story/Epic/형제/의존/AC 전부', () => {
		const md = buildLinkageBlock({ task: TASK_PLAN.tasks[0], evidence: EVIDENCE, jiraKey: 'DWPD-1474' });
		assert.match(md, /이 PR: DWPD-1474 — 예약 검증 \(layer: be\)/);
		assert.match(md, /Story: DWPD-1450 — 예약 기능/);
		assert.match(md, /Epic:\s+DWPD-1400 — 예약 모듈/);
		assert.match(md, /형제 Sub-task \(같은 Story\): .*DWPD-1473/);
		assert.match(md, /형제 Sub-task .*DWPD-1475/);
		assert.doesNotMatch(md, /형제 Sub-task.*DWPD-1474/, 'self 는 형제에서 제외');
		assert.match(md, /의존: depends-on DWPD-1473/);
		assert.match(md, /AC: AC-RES-003, AC-RES-004/);
	});
	it('partial evidence(Story 부재) — graceful, 못 찾은 line 생략 (날조 ❌)', () => {
		const md = buildLinkageBlock({
			task: { id: 'TASK-RES-002', title: '예약 검증', layer: 'be' },
			evidence: { ticket_cascade: { subtasks: [{ jira_id: 'DWPD-1474', task_id: 'TASK-RES-002' }] } },
			jiraKey: 'DWPD-1474',
		});
		assert.match(md, /이 PR: DWPD-1474 — 예약 검증/);
		assert.doesNotMatch(md, /Story:/);
		assert.doesNotMatch(md, /Epic:/);
		assert.doesNotMatch(md, /의존:/);
	});
	it('evidence 전무 — 최소 linkage (이 PR line 만)', () => {
		const md = buildLinkageBlock({ task: { id: 'TASK-RES-002' }, evidence: null, jiraKey: 'DWPD-1474' });
		assert.match(md, /이 PR: DWPD-1474/);
		assert.doesNotMatch(md, /Story:|Epic:|형제|의존:|AC:/);
	});
});

// ─── 순수 함수: branchGuardReason (additive / deny-only) ───
describe('branchGuardReason — additive 가드 판정 (deny-only / stage-gate)', () => {
	const SRC = { toolName: 'Write', toolInput: { file_path: 'src/foo.ts' } };
	const CT = { current_chain: 'implement', current_task: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474' } };
	it('current_task 부재 → null (allow / scope-wide 기존 동작 보존 = 회귀 0)', () => {
		assert.equal(branchGuardReason({ ...SRC, activeChain: { current_chain: 'implement' }, currentBranch: 'whatever' }), null);
		assert.equal(branchGuardReason({ ...SRC, activeChain: { current_chain: 'implement', current_task: null }, currentBranch: 'x' }), null);
	});
	it('stage 게이트 — current_chain 이 test/implement 아님(revisit 복귀) → null (allow / false-block 방지)', () => {
		const spec = { current_chain: 'spec', current_task: CT.current_task };
		assert.equal(branchGuardReason({ ...SRC, activeChain: spec, currentBranch: 'main' }), null);
	});
	it('소스 write 아님 → null (allow)', () => {
		assert.equal(branchGuardReason({ toolName: 'Write', toolInput: { file_path: 'README.md' }, activeChain: CT, currentBranch: 'main' }), null);
		assert.equal(branchGuardReason({ toolName: 'Bash', toolInput: {}, activeChain: CT, currentBranch: 'main' }), null);
	});
	it('currentBranch null (detached/git부재/transient) → null (allow / fail-open 정직 한계)', () => {
		assert.equal(branchGuardReason({ ...SRC, activeChain: CT, currentBranch: null }), null);
	});
	it('올바른 브랜치 → null (allow)', () => {
		assert.equal(branchGuardReason({ ...SRC, activeChain: CT, currentBranch: 'feature/DWPD-1474' }), null);
	});
	it('잘못된 브랜치 + 소스 write + task-major → deny (reason 문자열)', () => {
		const r = branchGuardReason({ ...SRC, activeChain: CT, currentBranch: 'main' });
		assert.ok(r && /branch 가드/.test(r) && /TASK-RES-002/.test(r) && /feature\/DWPD-1474/.test(r));
	});
	it('가드 대상 소스 확장 — .xml(iBATIS mapper) / .sql 잘못된 브랜치 → deny (blocker fix)', () => {
		const xml = { toolName: 'Write', toolInput: { file_path: 'src/main/resources/mapper/UserMapper.xml' } };
		const sql = { toolName: 'Write', toolInput: { file_path: 'db/migration/V1__init.sql' } };
		assert.ok(branchGuardReason({ ...xml, activeChain: CT, currentBranch: 'main' }), '.xml mapper deny');
		assert.ok(branchGuardReason({ ...sql, activeChain: CT, currentBranch: 'main' }), '.sql deny');
	});
});

// ─── enter-task (CLI / 비-git read 경로) ───
describe('enter-task — 입력 검증 + preview (git 미접촉)', () => {
	it('--task 누락 → exit 3', () => {
		const root = setupProject('et-notask');
		const r = run(['enter-task', root]);
		assert.equal(r.status, 3);
	});
	it('Jira evidence 부재 task → exit 3 (ticket-sync 선행 요구)', () => {
		const root = setupProject('et-nojira');
		const r = run(['enter-task', root, '--task', 'TASK-RES-404']);
		assert.equal(r.status, 3);
		assert.match(r.stderr, /ticket-sync/);
	});
	it('stage 가 test/implement 아님 → exit 3', () => {
		const root = setupProject('et-stage', { stage: 'spec' });
		const r = run(['enter-task', root, '--task', 'TASK-RES-001']);
		assert.equal(r.status, 3);
		assert.match(r.stderr, /test\|implement/);
	});
	it('preview (--confirm 없음) → exit 0 + feature/<KEY> 표기 + state 미변경', () => {
		const root = setupProject('et-preview');
		const r = run(['enter-task', root, '--task', 'TASK-RES-001']);
		assert.equal(r.status, 0);
		assert.match(r.stdout, /branch: feature\/DWPD-1473/);
		const st = readState(root);
		assert.equal(st.current_task ?? null, null, 'preview 는 state 미변경');
	});
	it('Bug issue_type → bugfix/<KEY> prefix 도출 (preview)', () => {
		const root = setupProject('et-bug');
		const r = run(['enter-task', root, '--task', 'TASK-RES-009']);
		assert.equal(r.status, 0);
		assert.match(r.stdout, /branch: bugfix\/DWPD-1599/);
	});
});

describe('enter-task --confirm (실 git temp repo / 6모드)', () => {
	it('새 브랜치 생성 + current_task set + 멱등 재진입(noop)', { skip: !GIT ? 'git 부재' : false }, () => {
		const { root, git } = setupGitProject('et-confirm');
		const r = run(['enter-task', root, '--task', 'TASK-RES-001', '--confirm']);
		assert.equal(r.status, 0, r.stderr);
		// 브랜치 전환 확인
		const cur = execFileSync('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: root, encoding: 'utf-8' }).trim();
		assert.equal(cur, 'feature/DWPD-1473');
		// state current_task set
		const st = readState(root);
		assert.equal(st.current_task.task_id, 'TASK-RES-001');
		assert.equal(st.current_task.branch, 'feature/DWPD-1473');
		assert.equal(st.current_task.jira_key, 'DWPD-1473');
		// 멱등 — 같은 브랜치에서 재진입 = noop 성공
		const r2 = run(['enter-task', root, '--task', 'TASK-RES-001', '--confirm']);
		assert.equal(r2.status, 0);
		assert.match(r2.stdout, /noop/);
		void git;
	});
	it('기존 브랜치로 전환 (switch)', { skip: !GIT ? 'git 부재' : false }, () => {
		const { root } = setupGitProject('et-switch');
		execFileSync('git', ['branch', 'feature/DWPD-1474'], { cwd: root, stdio: 'ignore' });
		const r = run(['enter-task', root, '--task', 'TASK-RES-002', '--confirm']);
		assert.equal(r.status, 0, r.stderr);
		assert.match(r.stdout, /switch/);
		const cur = execFileSync('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: root, encoding: 'utf-8' }).trim();
		assert.equal(cur, 'feature/DWPD-1474');
	});
});

// ─── finish-task (CLI / 비-git) ───
describe('finish-task — GREEN gate + linkage + graceful PR', () => {
	it('current_task 부재 → exit 3', () => {
		const root = setupProject('ft-notask', { implGreen: true });
		const r = run(['finish-task', root]);
		assert.equal(r.status, 3);
		assert.match(r.stderr, /enter-task/);
	});
	it('GREEN 미달 (implement 미완) → exit 1', () => {
		const root = setupProject('ft-notgreen', {
			implGreen: false,
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		const r = run(['finish-task', root]);
		assert.equal(r.status, 1);
		assert.match(r.stderr, /GREEN 미달/);
	});
	it('GREEN + preview (--confirm 없음) → exit 0 + linkage block (PR 미생성 / current_task 보존)', () => {
		const root = setupProject('ft-preview', {
			implGreen: true,
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		const r = run(['finish-task', root]);
		assert.equal(r.status, 0, r.stderr);
		assert.match(r.stdout, /이 PR: DWPD-1474 — 예약 검증/);
		assert.match(r.stdout, /Story: DWPD-1450/);
		assert.match(r.stdout, /gh pr create --base main --head feature\/DWPD-1474/);
		const st = readState(root);
		assert.equal(st.current_task.task_id, 'TASK-RES-002', 'preview 는 current_task 보존');
	});
	it('--confirm + gh 무효(원격 부재) → graceful exit 0 + current_task clear', () => {
		const root = setupProject('ft-confirm', {
			implGreen: true,
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		const r = run(['finish-task', root, '--confirm']);
		assert.equal(r.status, 0, r.stderr);
		const st = readState(root);
		assert.equal(st.current_task ?? null, null, 'finish-task --confirm → current_task clear');
	});
});

// ─── PreToolUse 가드 (hooks-bridge 통합 / 실 git repo) ───
describe('PreToolUse 브랜치 가드 (deny-only / 실 git)', () => {
	const hook = (root, branch, toolInput, env = {}) => {
		// 대상 브랜치로 checkout
		execFileSync('git', ['checkout', '-q', branch], { cwd: root, stdio: 'ignore' });
		const payload = JSON.stringify({
			hook_event_name: 'PreToolUse',
			cwd: root,
			session_id: 's1',
			tool_name: 'Write',
			tool_input: toolInput,
		});
		return run(['hooks-bridge'], { input: payload, env: { ...process.env, ...env } });
	};

	it('task-major + 소스 write + 잘못된 브랜치 → exit 2 (deny)', { skip: !GIT ? 'git 부재' : false }, () => {
		const { root } = setupGitProject('guard-deny', {
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		execFileSync('git', ['branch', 'feature/DWPD-1474'], { cwd: root, stdio: 'ignore' });
		const r = hook(root, 'main', { file_path: 'src/foo.ts' });
		assert.equal(r.status, 2, r.stdout + r.stderr);
		assert.match(r.stderr, /branch 가드/);
	});
	it('올바른 브랜치 → allow (exit 0)', { skip: !GIT ? 'git 부재' : false }, () => {
		const { root } = setupGitProject('guard-allow', {
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		execFileSync('git', ['branch', 'feature/DWPD-1474'], { cwd: root, stdio: 'ignore' });
		const r = hook(root, 'feature/DWPD-1474', { file_path: 'src/foo.ts' });
		assert.equal(r.status, 0, r.stderr);
	});
	it('current_task 부재 (scope-wide) → allow 어떤 브랜치든 (additive / 회귀 0)', { skip: !GIT ? 'git 부재' : false }, () => {
		const { root } = setupGitProject('guard-additive'); // currentTask 없음
		const r = hook(root, 'main', { file_path: 'src/foo.ts' });
		assert.equal(r.status, 0, r.stderr);
	});
	it('opt-out CONTEXT_OPS_BRANCH_GUARD=0 → allow (deny 안 함)', { skip: !GIT ? 'git 부재' : false }, () => {
		const { root } = setupGitProject('guard-optout', {
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		execFileSync('git', ['branch', 'feature/DWPD-1474'], { cwd: root, stdio: 'ignore' });
		const r = hook(root, 'main', { file_path: 'src/foo.ts' }, { CONTEXT_OPS_BRANCH_GUARD: '0' });
		assert.equal(r.status, 0, r.stderr);
	});
	it('iBATIS .xml mapper 잘못된 브랜치 → deny (blocker fix / legacy 타깃)', { skip: !GIT ? 'git 부재' : false }, () => {
		const { root } = setupGitProject('guard-xml', {
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		execFileSync('git', ['branch', 'feature/DWPD-1474'], { cwd: root, stdio: 'ignore' });
		const r = hook(root, 'main', { file_path: 'src/main/resources/mapper/UserMapper.xml' });
		assert.equal(r.status, 2, r.stdout + r.stderr);
	});
	it('stage 게이트 — revisit 로 spec 복귀(stale current_task) → allow (false-block 방지)', { skip: !GIT ? 'git 부재' : false }, () => {
		const { root } = setupGitProject('guard-revisit', {
			stage: 'spec',
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		const r = hook(root, 'main', { file_path: 'src/foo.ts' });
		assert.equal(r.status, 0, r.stderr);
	});
	it('repo 외부 절대경로 소스 write → allow (외부/scratch 오차단 방지)', { skip: !GIT ? 'git 부재' : false }, () => {
		const { root } = setupGitProject('guard-external', {
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		execFileSync('git', ['checkout', '-q', 'main'], { cwd: root, stdio: 'ignore' });
		const payload = JSON.stringify({
			hook_event_name: 'PreToolUse', cwd: root, session_id: 's1',
			tool_name: 'Write', tool_input: { file_path: join(tmpdir(), 'elsewhere-xyz', 'lib.ts') },
		});
		const r = run(['hooks-bridge'], { input: payload });
		assert.equal(r.status, 0, r.stdout + r.stderr);
	});
});

// ─── clear-task (high-fix: stuck current_task 탈출구) ───
describe('clear-task — current_task 해제 (git 미접촉 / GREEN 무관)', () => {
	it('GREEN 미달 stuck → clear-task 로 current_task 해제 (exit 0)', () => {
		const root = setupProject('clr-stuck', {
			implGreen: false,
			currentTask: { task_id: 'TASK-RES-002', branch: 'feature/DWPD-1474', jira_key: 'DWPD-1474' },
		});
		// finish-task 는 GREEN 미달로 거부(stuck) → clear-task 가 탈출구
		assert.equal(run(['finish-task', root, '--confirm']).status, 1);
		const r = run(['clear-task', root]);
		assert.equal(r.status, 0, r.stderr);
		const st = readState(root);
		assert.equal(st.current_task ?? null, null, 'clear-task → current_task 해제');
	});
	it('current_task 부재 → no-op (exit 0)', () => {
		const root = setupProject('clr-noop');
		const r = run(['clear-task', root]);
		assert.equal(r.status, 0);
		assert.match(r.stdout, /no-op/);
	});
});
