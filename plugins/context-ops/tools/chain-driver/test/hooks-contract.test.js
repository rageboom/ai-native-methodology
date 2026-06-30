// hooks-contract.test.js — Senior F10. driver ↔ Claude Code hooks 의 stdin/stdout/exit 동작 contract 검증.
// real Claude binary 없이, cli.js hooks-bridge subcommand 를 spawn 해서 검증.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { ensureScopeDir, writeManifest } from '../src/state-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

function runHooksBridge(stdinJson) {
	return spawnSync('node', [CLI, 'hooks-bridge'], {
		input: stdinJson,
		encoding: 'utf-8',
		shell: false,
		timeout: 5000,
	});
}
function runCli(args) {
	return spawnSync('node', [CLI, ...args], { encoding: 'utf-8', timeout: 5000 });
}
function sessionStart(root) {
	return runHooksBridge(JSON.stringify({ hook_event_name: 'SessionStart', cwd: root }));
}

describe('hooks-contract', () => {
	it('UserPromptSubmit with planning trigger → suppressOutput=true + additionalContext + exit 0', () => {
		const r = runHooksBridge(
			JSON.stringify({
				hook_event_name: 'UserPromptSubmit',
				prompt: 'planning 시작',
				session_id: 's1',
				cwd: process.cwd(),
			}),
		);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout);
		assert.equal(out.suppressOutput, true);
		assert.match(
			out.hookSpecificOutput.additionalContext,
			/SHALL NOT auto-invoke/,
		);
		assert.match(r.stderr, /\[chain-driver\] suggested skill/);
	});

	it('UserPromptSubmit with no trigger → suppressOutput=true + continue=true (no skill suggested)', () => {
		const r = runHooksBridge(
			JSON.stringify({
				hook_event_name: 'UserPromptSubmit',
				prompt: 'hello world unrelated',
				cwd: process.cwd(),
			}),
		);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout);
		assert.equal(out.suppressOutput, true);
		assert.equal(out.continue, true);
		assert.equal(out.hookSpecificOutput, undefined);
	});

	it('empty stdin → exit 3 + stderr error', () => {
		const r = runHooksBridge('');
		assert.equal(r.status, 3);
		assert.match(r.stderr, /\[chain-driver\]/);
	});

	it('bad JSON stdin → exit 3', () => {
		const r = runHooksBridge('{not json');
		assert.equal(r.status, 3);
	});

	it('PreToolUse without project state → pass-through suppressOutput=true', () => {
		const r = runHooksBridge(
			JSON.stringify({
				hook_event_name: 'PreToolUse',
				tool_name: 'Edit',
				tool_input: { file_path: '/tmp/no-aimd/src/foo.ts' },
				cwd: '/tmp/no-aimd',
			}),
		);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout);
		assert.equal(out.suppressOutput, true);
	});
});

// living-sync ② honest surface (read-only) — SessionStart 미-baseline scope 표면화 e2e (DEC §24 / Senior@0.80).
describe('hooks-contract — SessionStart unbaselined surface (② honest)', () => {
	function setup() {
		const root = mkdtempSync(join(tmpdir(), 'unbaselined-'));
		runCli(['init', root]); // .ai-context/state.json
		mkdirSync(join(root, '.ai-context', 'output'), { recursive: true });
		writeFileSync(join(root, '.ai-context', 'output', 'domain.json'), '{}'); // canonical 존재
		ensureScopeDir(root, 'scope-a');
		writeManifest(root, 'scope-a', null, {
			scope: 'scope-a',
			status: 'active',
			sync_state: { sync_sources: [], drift_detected: false },
		});
		return root;
	}

	it('미-baseline scope → additionalContext 에 unbaselined 경고 + "ready" 부재 (거짓 건강 제거)', () => {
		const root = setup();
		const r = sessionStart(root);
		assert.equal(r.status, 0, r.stderr);
		const out = JSON.parse(r.stdout);
		assert.match(out.hookSpecificOutput.additionalContext, /unbaselined/);
		assert.match(out.hookSpecificOutput.additionalContext, /scope-a/);
		assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /chain harness ready/, '거짓 ready 억제');
		// MIS-428 [OP-SESSION-001] — unbaselined 경고는 additionalContext 전담(위 114-115).
		//   SessionStart exit 0 의 stderr 는 사용자 트랜스크립트 미표출(공식문서)이라 stderr write 제거 → dead 채널 회귀 방지.
		assert.doesNotMatch(r.stderr, /unbaselined/);
		rmSync(root, { recursive: true, force: true });
	});

	it('chain-driver sync first-touch 후 → 경고 소멸 (안내 실효 / BLOCKER-1)', () => {
		const root = setup();
		const s = runCli(['sync', root]); // no-scope first-touch baseline
		assert.equal(s.status, 0, s.stderr);
		const r = sessionStart(root);
		const out = JSON.parse(r.stdout);
		assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /unbaselined/, 'baseline 후 표면화 소멸');
		rmSync(root, { recursive: true, force: true });
	});

	it('cmdSync first-touch 가 absent sync_sources 도 baseline (Senior BLOCKER-1 (B) 회귀)', () => {
		const root = mkdtempSync(join(tmpdir(), 'unbaselined-absent-'));
		runCli(['init', root]);
		mkdirSync(join(root, '.ai-context', 'output'), { recursive: true });
		writeFileSync(join(root, '.ai-context', 'output', 'domain.json'), '{}');
		ensureScopeDir(root, 'scope-a');
		writeManifest(root, 'scope-a', null, { scope: 'scope-a', status: 'active', sync_state: { drift_detected: false } }); // sync_sources absent
		const before = sessionStart(root);
		assert.match(JSON.parse(before.stdout).hookSpecificOutput.additionalContext, /unbaselined/, 'absent → 표면화');
		runCli(['sync', root]); // (B): absent 도 first-touch 해야 안내 실효
		const after = sessionStart(root);
		assert.doesNotMatch(JSON.parse(after.stdout).hookSpecificOutput.additionalContext, /unbaselined/, 'absent도 sync 후 소멸');
		rmSync(root, { recursive: true, force: true });
	});

	it('canonical 부재 프로젝트 → unbaselined 경고 없음 (false-positive 차단 / anyCanonical)', () => {
		const root = mkdtempSync(join(tmpdir(), 'unbaselined-nocanon-'));
		runCli(['init', root]);
		ensureScopeDir(root, 'scope-a');
		writeManifest(root, 'scope-a', null, { scope: 'scope-a', status: 'active', sync_state: { sync_sources: [], drift_detected: false } });
		const r = sessionStart(root);
		const out = JSON.parse(r.stdout);
		assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /unbaselined/);
		rmSync(root, { recursive: true, force: true });
	});
});

// DEC-2026-06-30-sessionstart-systemmessage-visible-channel — SessionStart 사용자-가시 채널 회귀 가드.
//   additionalContext = 모델 컨텍스트 전용(사용자 미표출 / 공식문서). systemMessage = SessionStart 의 유일한
//   결정론 사용자-가시 채널. 과거 additionalContext-only = dead-on-display(모델 자발 렌더 의존 → 거의 안 보임).
describe('hooks-contract — SessionStart systemMessage 가시 채널 (DEC-2026-06-30)', () => {
	function writeState(root, state) {
		mkdirSync(join(root, '.ai-context'), { recursive: true });
		writeFileSync(join(root, '.ai-context', 'state.json'), JSON.stringify(state));
	}

	it('live + 활성 chain → systemMessage 에 세션 재개 요약(가시) + additionalContext 병행(grounding)', () => {
		const root = mkdtempSync(join(tmpdir(), 'sysmsg-live-'));
		try {
			writeState(root, {
				version: '2.0',
				current_chain: 'spec',
				current_scope: 'BC-ORDER',
				blocked: false,
				stage_progress: {},
				current_task: { task_id: 'TASK-12', branch: 'MIS-440' },
			});
			const r = sessionStart(root);
			assert.equal(r.status, 0, r.stderr);
			const out = JSON.parse(r.stdout);
			assert.match(out.systemMessage, /세션 재개/, 'systemMessage = 결정론 가시 채널');
			assert.match(out.systemMessage, /spec 2\/5/);
			assert.match(
				out.hookSpecificOutput.additionalContext,
				/세션 재개/,
				'additionalContext grounding 병행(하이브리드)',
			);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('corrupt state.json → systemMessage 에 손상 fail-closed 경고 (과거 잠복 → 가시화)', () => {
		const root = mkdtempSync(join(tmpdir(), 'sysmsg-corrupt-'));
		try {
			writeState(root, { current_chain: 'spec' }); // version 누락 = corrupt
			const r = sessionStart(root);
			assert.equal(r.status, 0, r.stderr);
			const out = JSON.parse(r.stdout);
			assert.match(out.systemMessage, /손상/);
			assert.match(out.systemMessage, /fail-closed/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('unbaselined scope → systemMessage 에 unbaselined 경고 (additionalContext 와 양 채널)', () => {
		const root = mkdtempSync(join(tmpdir(), 'sysmsg-unbaselined-'));
		try {
			runCli(['init', root]);
			mkdirSync(join(root, '.ai-context', 'output'), { recursive: true });
			writeFileSync(join(root, '.ai-context', 'output', 'domain.json'), '{}');
			ensureScopeDir(root, 'scope-a');
			writeManifest(root, 'scope-a', null, {
				scope: 'scope-a',
				status: 'active',
				sync_state: { sync_sources: [], drift_detected: false },
			});
			const out = JSON.parse(sessionStart(root).stdout);
			assert.match(out.systemMessage, /unbaselined/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('live·idle(current_chain=null) + drift 무 → systemMessage 미발행 (clean-idle 배너 침묵)', () => {
		const root = mkdtempSync(join(tmpdir(), 'sysmsg-idle-'));
		try {
			writeState(root, { version: '2.0', current_chain: null, stage_progress: {} });
			const r = sessionStart(root);
			assert.equal(r.status, 0, r.stderr);
			const out = JSON.parse(r.stdout);
			assert.equal(out.systemMessage, undefined, 'ready fallback 단독 = 배너 노이즈 없음');
			assert.match(
				out.hookSpecificOutput.additionalContext,
				/chain harness ready/,
				'grounding 은 ready 유지(모델은 알아야 함)',
			);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('absent(.ai-context 없음) → systemMessage 미발행 + pass-through (방법론 미사용 무회귀)', () => {
		const root = mkdtempSync(join(tmpdir(), 'sysmsg-absent-'));
		try {
			const out = JSON.parse(sessionStart(root).stdout);
			assert.equal(out.systemMessage, undefined);
			assert.equal(out.hookSpecificOutput, undefined);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

// session-handoff (DEC-2026-06-11-session-handoff-convention) — SessionStart HANDOFF 표면화 + 라우팅 e2e.
describe('hooks-contract — session-handoff', () => {
	it('SessionStart: HANDOFF.md 존재 + state.json 부재(pre-init) → handoff nudge 만 표면화', () => {
		const root = mkdtempSync(join(tmpdir(), 'handoff-preinit-'));
		try {
			mkdirSync(join(root, '.ai-context'), { recursive: true });
			writeFileSync(join(root, '.ai-context', 'HANDOFF.md'), '# HANDOFF\n');
			const r = sessionStart(root);
			assert.equal(r.status, 0);
			const out = JSON.parse(r.stdout);
			assert.match(
				out.hookSpecificOutput.additionalContext,
				/HANDOFF\.md 를 먼저 읽고/,
			);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('SessionStart: HANDOFF.md 부재 + state.json 부재 → 기존 pass-through 무회귀', () => {
		const root = mkdtempSync(join(tmpdir(), 'handoff-none-'));
		try {
			const r = sessionStart(root);
			assert.equal(r.status, 0);
			const out = JSON.parse(r.stdout);
			assert.equal(out.suppressOutput, true);
			assert.equal(out.hookSpecificOutput, undefined);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('SessionStart: HANDOFF.md + state.json 양존 → nudge 별도 line prepend + ready 신호 보존', () => {
		const root = mkdtempSync(join(tmpdir(), 'handoff-init-'));
		try {
			const init = runCli(['init', root]);
			assert.equal(init.status, 0);
			writeFileSync(join(root, '.ai-context', 'HANDOFF.md'), '# HANDOFF\n');
			const r = sessionStart(root);
			assert.equal(r.status, 0);
			const ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
			assert.match(ctx, /HANDOFF\.md 를 먼저 읽고/);
			assert.match(ctx, /chain harness ready/); // handoff 가 ready 신호를 대체하지 않음
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('UserPromptSubmit: "세션 정리해줘" → session-handoff 라우팅 (agent dispatch 권고 없음)', () => {
		const r = runHooksBridge(
			JSON.stringify({
				hook_event_name: 'UserPromptSubmit',
				prompt: '오늘은 세션 정리해줘',
				session_id: 's1',
				cwd: process.cwd(),
			}),
		);
		assert.equal(r.status, 0);
		const ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
		assert.match(ctx, /session-handoff/);
		assert.doesNotMatch(ctx, /dispatch agent/); // cross-cutting = agentId null
	});
});

// DEC-2026-06-18 — discovery 보편-라우터 진입점 e2e (living-sync §4 "discovery = 입구·라우터").
describe('hooks-contract — discovery 보편-라우터 (DEC-2026-06-18)', () => {
	it('UserPromptSubmit: stage 미지정 변경요청 → discovery 폴백 + 입구·라우터 안내 (① silent 제거)', () => {
		// analysis-state-aware(MIS-433) + draft-first(MIS-435): discovery 폴백은 grounding floor
		//   완성을 전제 → tmpdir 에 floor 3종(architecture/domain/business-rules) 작성.
		//   (분석 부재→analysis-first / floor 미완→analysis-floor-incomplete 는 router-analysis-aware.test.js 커버.)
		const root = mkdtempSync(join(tmpdir(), 'route-default-'));
		try {
			const base = join(root, '.ai-context', 'base');
			mkdirSync(base, { recursive: true });
			for (const f of ['architecture.json', 'domain.json', 'business-rules.json'])
				writeFileSync(join(base, f), '{}');
			const r = runHooksBridge(
				JSON.stringify({
					hook_event_name: 'UserPromptSubmit',
					prompt: '예약 취소 기능 추가해줘',
					session_id: 's1',
					cwd: root,
				}),
			);
			assert.equal(r.status, 0);
			const out = JSON.parse(r.stdout);
			assert.equal(out.suppressOutput, true);
			const ctx = out.hookSpecificOutput.additionalContext;
			assert.match(ctx, /discovery-from-nl-md/);
			assert.match(ctx, /입구·라우터/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('PreToolUse: cold-start(discovery 미진입)에서 behavior-spec write → exit 2 deny (②)', () => {
		const root = mkdtempSync(join(tmpdir(), 'coldstart-skipahead-'));
		try {
			const init = runCli(['init', root]); // current_chain=analysis / discovery=pending
			assert.equal(init.status, 0, init.stderr);
			const r = runHooksBridge(
				JSON.stringify({
					hook_event_name: 'PreToolUse',
					tool_name: 'Write',
					tool_input: {
						file_path: join(root, '.ai-context', 'output', 'behavior-spec.json'),
					},
					cwd: root,
				}),
			);
			assert.equal(r.status, 2, r.stderr);
			const out = JSON.parse(r.stdout);
			assert.equal(out.hookSpecificOutput.permissionDecision, 'deny');
			assert.match(out.reason, /cold-start skip-ahead/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('PreToolUse: discovery-spec write 는 cold-start 여도 허용 (입구 exempt)', () => {
		const root = mkdtempSync(join(tmpdir(), 'coldstart-uc-'));
		try {
			runCli(['init', root]);
			const r = runHooksBridge(
				JSON.stringify({
					hook_event_name: 'PreToolUse',
					tool_name: 'Write',
					tool_input: {
						file_path: join(root, '.ai-context', 'output', 'discovery-spec.json'),
					},
					cwd: root,
				}),
			);
			assert.equal(r.status, 0, r.stderr);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
