// session-graph-freshness.test.js — Loop A / A1 (B-minimal / DEC-2026-06-03 C-living-graph-autotrigger).
//   SessionStart hooks-bridge 가 stale artifact-graph 를 ⚠️ STALE 로 정직 노출하는지 검증 (false-health 방지).
//   real cli.js hooks-bridge subprocess spawn (no-simulation / hooks-contract.test.js 패턴 정합).

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = resolve(__dirname, '..', 'src', 'cli.js');

// 최소 그래프 — 2 노드 1 엣지 + derived_from 1 source. synthesized_at 로 stale/fresh 제어.
function makeGraph(synthesizedAt) {
	return {
		derived_from: ['src/a.json'],
		synthesized_at: synthesizedAt,
		nodes: [
			{
				id: 'UC-1',
				artifact_kind: 'chain',
				artifact_subkind: 'UC',
				state: 'active',
				code_pointers_na: true,
			},
			{
				id: 'BHV-1',
				artifact_kind: 'chain',
				artifact_subkind: 'BHV',
				state: 'active',
				code_pointers_na: true,
			},
		],
		edges: [
			{
				source: 'UC-1',
				target: 'BHV-1',
				edge_type: 'derived_from',
				confidence: 'hard',
			},
		],
	};
}

// fixture 프로젝트 생성: .ai-context/state.json + .ai-context/output/artifact-graph.json + src/a.json(mtime=now).
function makeFixture(synthesizedAt) {
	const root = mkdtempSync(join(tmpdir(), 'aimd-fresh-'));
	mkdirSync(join(root, '.ai-context', 'output'), { recursive: true });
	mkdirSync(join(root, 'src'), { recursive: true });
	// 유효 live state — version 은 문자열 의무(readState strict / resolveEnforcementContext mode:'live').
	//   숫자 version 은 corrupt 로 분류되어 graph surface 가 fail-closed 메시지로 대체됨(cold-start 갭 / DEC-2026-06-26).
	writeFileSync(
		join(root, '.ai-context', 'state.json'),
		JSON.stringify({ version: '2.0', project_id: 'fresh-fixture', current_chain: 'analysis' }) + '\n',
	);
	writeFileSync(
		join(root, '.ai-context', 'output', 'artifact-graph.json'),
		JSON.stringify(makeGraph(synthesizedAt), null, 2) + '\n',
	);
	writeFileSync(join(root, 'src', 'a.json'), '{}\n'); // mtime = now → synthesized_at 과거면 stale
	return root;
}

function runSessionStart(cwd) {
	const r = spawnSync('node', [CLI, 'hooks-bridge'], {
		input: JSON.stringify({ hook_event_name: 'SessionStart', cwd }),
		encoding: 'utf-8',
		shell: false,
		timeout: 5000,
	});
	return r;
}

describe('session-graph-freshness (B-minimal — SessionStart stale 노출)', () => {
	const fixtures = [];
	after(() => {
		for (const f of fixtures) {
			try {
				rmSync(f, { recursive: true, force: true });
			} catch {
				/* ok */
			}
		}
	});

	it('stale graph (synthesized_at 과거) → additionalContext 에 ⚠️ STALE + source basename + [dep-graph]', () => {
		const root = makeFixture('2020-01-01T00:00:00.000Z'); // source mtime(now) > synth → stale
		fixtures.push(root);
		const r = runSessionStart(root);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout);
		assert.equal(out.suppressOutput, true);
		const ctx = out.hookSpecificOutput.additionalContext;
		assert.match(ctx, /\[dep-graph\] 2 nodes/);
		assert.match(ctx, /STALE/); // false-health 방지 — stale 노출
		assert.match(ctx, /a\.json/); // 변경 source basename
		assert.match(ctx, /traceability-matrix-builder --graph/); // 재합성 안내
	});

	it('fresh graph (synthesized_at 미래) → [dep-graph] 노출하되 STALE 없음', () => {
		const root = makeFixture('2999-01-01T00:00:00.000Z'); // source mtime(now) < synth → fresh
		fixtures.push(root);
		const r = runSessionStart(root);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout);
		const ctx = out.hookSpecificOutput.additionalContext;
		assert.match(ctx, /\[dep-graph\] 2 nodes/);
		assert.doesNotMatch(ctx, /STALE/); // fresh → 거짓 경보 없음
	});
});
