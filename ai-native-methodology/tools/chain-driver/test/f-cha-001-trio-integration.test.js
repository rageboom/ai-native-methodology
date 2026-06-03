// f-cha-001-trio-integration.test.js — Phase 4-4' v10.0.0 F-CHA-001 Senior BLOCKER-2 본격 해소.
//
// trio enforcement (ADR-CHAIN-005 §3) plan stage 본격 통합 검증:
//   (i)   state.blocked=true 영속 + intervention_log entry
//   (ii)  cli exit code = 1 (blocked-by-gate)
//   (iii) hooks-bridge PreToolUse → permissionDecision='deny' on .aimd/output/** Write/Edit
//
// 5 시나리오:
//   1. plan stage critical finding → evaluateGate blocked=true (validator_critical)
//   2. cli `chain-driver next` 실 spawn → state.blocked + exit code 1 영속
//   3. shouldBlockToolUse(Write .aimd/output/plan-spec.json + state.blocked) → block reason
//   4. trio 통합 — 단일 critical finding 1개로 3 mechanism 동시 작동 입증
//   5. gate id enum 정합 (stage-graph.getGateForStage 결과 set = state.schema enum set)

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
	mkdtempSync,
	rmSync,
	writeFileSync,
	readFileSync,
	existsSync,
	mkdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { evaluateGate, requiredValidators } from '../src/gate-eval.js';
import { getGateForStage, getStageOrder } from '../src/stage-graph.js';
import { shouldBlockToolUse } from '../src/hooks-bridge.js';
import {
	initState,
	readState,
	writeStateCAS,
	statePath,
} from '../src/state-store.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CLI_PATH = resolve(__dirname, '..', 'src', 'cli.js');
const STATE_SCHEMA_PATH = resolve(
	__dirname,
	'..',
	'..',
	'..',
	'schemas',
	'state.schema.json',
);

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), 'f-cha-001-trio-'));
});
after(() => {
	rmSync(tmp, { recursive: true, force: true });
});

describe('F-CHA-001 trio enforcement (plan gate #3 / Senior BLOCKER-2)', () => {
	// ──────────────────────────────────────────────────────────────
	// 시나리오 1: gate-eval critical finding → blocked=true
	// ──────────────────────────────────────────────────────────────
	it('시나리오 1: plan stage critical finding → evaluateGate blocked / primary=validator_critical (mechanism i source)', () => {
		const r = evaluateGate('plan', { critical: 1, high: 0, medium: 0 });
		assert.equal(
			r.blocked,
			true,
			'plan stage 의 critical finding 은 blocked=true 의무',
		);
		assert.equal(
			r.primary_reason,
			'validator_critical',
			'primary_reason=validator_critical 의무',
		);
		assert.ok(r.reasons.length >= 1, 'reasons[] ≥ 1 entry 의무');
	});

	// ──────────────────────────────────────────────────────────────
	// 시나리오 2: cli spawn → state.blocked=true 영속 + exit code 1
	// ──────────────────────────────────────────────────────────────
	it('시나리오 2: cli `next` spawn — plan stage critical → exit 1 + state.blocked 영속 (mechanism ii)', () => {
		const root = join(tmp, 'scenario2');
		mkdirSync(root, { recursive: true });
		initState(root, 'scenario2');
		// advance state.current_chain to 'plan' (시뮬레이션: writeStateCAS 직접)
		writeStateCAS(root, (s) => {
			s.current_chain = 'plan';
			return s;
		});

		// findings file 작성 — plan stage critical 1
		const findingsPath = join(root, 'findings.json');
		writeFileSync(
			findingsPath,
			JSON.stringify({ critical: 1, high: 0, medium: 0, low: 0, info: 0 }),
		);

		const result = spawnSync(
			'node',
			[CLI_PATH, 'next', root, '--findings', findingsPath],
			{
				encoding: 'utf-8',
				timeout: 20000,
			},
		);

		assert.equal(
			result.status,
			1,
			`cli exit code = 1 의무 (got ${result.status}) / stderr: ${result.stderr}`,
		);
		const state = readState(root);
		assert.equal(state.blocked, true, 'state.blocked=true 영속 의무');
		assert.equal(
			state.block_reason,
			'validator_critical',
			'block_reason=validator_critical 영속 의무',
		);
		// intervention log 기록 검증
		const logPath = join(root, '.aimd', 'output', 'intervention-log.jsonl');
		assert.ok(existsSync(logPath), 'intervention-log.jsonl 기록 의무');
		const logContent = readFileSync(logPath, 'utf-8');
		assert.match(logContent, /gate_decision/, 'gate_decision event 기록 의무');
		assert.match(logContent, /"exit_code":\s*1/, 'exit_code=1 기록 의무');
	});

	// ──────────────────────────────────────────────────────────────
	// 시나리오 3: hooks-bridge → permissionDecision='deny'
	// ──────────────────────────────────────────────────────────────
	it('시나리오 3: hooks-bridge Write .aimd/output/plan-spec.json + state.blocked → deny (mechanism iii)', () => {
		const state = { blocked: true, block_reason: 'validator_critical' };
		const reason = shouldBlockToolUse({
			toolName: 'Write',
			toolInput: { file_path: '/tmp/proj/.aimd/output/plan-spec.json' },
			state,
		});
		assert.equal(
			reason,
			'validator_critical',
			'.aimd/output/ Write 차단 의무 (block_reason 반환)',
		);
	});

	// ──────────────────────────────────────────────────────────────
	// 시나리오 4 trio 통합 — 단일 critical finding 1개로 3 mechanism 동시 작동
	// ──────────────────────────────────────────────────────────────
	it('시나리오 4 trio 통합: 단일 critical finding 1개 → mechanism (i)+(ii)+(iii) 모두 작동', () => {
		const root = join(tmp, 'scenario4');
		mkdirSync(root, { recursive: true });
		initState(root, 'scenario4');
		writeStateCAS(root, (s) => {
			s.current_chain = 'plan';
			return s;
		});

		// 동일 critical finding 1개 — 3 mechanism 모두 검증
		const critFindings = { critical: 1, high: 0, medium: 0, low: 0, info: 0 };

		// mechanism (i): evaluateGate → blocked
		const gateResult = evaluateGate('plan', critFindings);
		assert.equal(
			gateResult.blocked,
			true,
			'trio mechanism (i): gate-eval blocked=true',
		);

		// mechanism (ii): cli spawn → exit 1 + state.blocked 영속
		const findingsPath = join(root, 'findings.json');
		writeFileSync(findingsPath, JSON.stringify(critFindings));
		const cliResult = spawnSync(
			'node',
			[CLI_PATH, 'next', root, '--findings', findingsPath],
			{
				encoding: 'utf-8',
				timeout: 20000,
			},
		);
		assert.equal(cliResult.status, 1, 'trio mechanism (ii): cli exit code = 1');
		const persistedState = readState(root);
		assert.equal(
			persistedState.blocked,
			true,
			'trio mechanism (ii): state.blocked 영속',
		);

		// mechanism (iii): hooks-bridge → deny (영속된 state 사용)
		const hookReason = shouldBlockToolUse({
			toolName: 'Write',
			toolInput: { file_path: join(root, '.aimd', 'output', 'task-plan.json') },
			state: persistedState,
		});
		assert.ok(hookReason, 'trio mechanism (iii): hooks-bridge deny');
		assert.match(
			hookReason,
			/validator_critical/,
			'trio mechanism (iii): block_reason=validator_critical',
		);
	});

	// ──────────────────────────────────────────────────────────────
	// 시나리오 5: gate id enum 정합 (stage-graph ↔ state.schema)
	// ──────────────────────────────────────────────────────────────
	it('시나리오 5 gate id enum 정합: stage-graph.getGateForStage = state.schema.json gate.id enum', () => {
		// stage-graph 의 모든 chain stage 의 gate id collect
		const stages = getStageOrder().filter((s) => s !== 'analysis'); // analysis = gate null
		const fromStageGraph = new Set(
			stages.map((s) => getGateForStage(s)).filter(Boolean),
		);

		// state.schema.json 의 gate.id enum read (Phase 4-4' v10.0.0)
		const schema = JSON.parse(readFileSync(STATE_SCHEMA_PATH, 'utf-8'));
		// properties.last_gate.properties.id.enum 또는 anyOf 안 const value 탐색
		const lastGate = schema?.properties?.last_gate;
		const gateIdEnumRaw =
			lastGate?.properties?.id?.enum ??
			lastGate?.anyOf?.flatMap((b) => b?.properties?.id?.enum ?? []) ??
			[];
		const fromSchema = new Set(gateIdEnumRaw);

		// 정합 검증 — symmetric difference = 0
		const diffAtoB = [...fromStageGraph].filter((x) => !fromSchema.has(x));
		const diffBtoA = [...fromSchema].filter((x) => !fromStageGraph.has(x));
		assert.deepEqual(
			diffAtoB,
			[],
			`stage-graph 안 있으나 schema 안 부재: ${diffAtoB.join(',')}`,
		);
		assert.deepEqual(
			diffBtoA,
			[],
			`schema 안 있으나 stage-graph 안 부재: ${diffBtoA.join(',')}`,
		);

		// v10.0.0 기대값 명시 — chain N = gate #N 1:1 INTERNAL CONVENTION
		assert.deepEqual(
			[...fromStageGraph].sort(),
			['#1', '#2', '#3', '#4', '#5'],
			'v10.0.0 gate enum = #1~#5',
		);
	});

	// ──────────────────────────────────────────────────────────────
	// 시나리오 5 보강: requiredValidators(plan) = plan-coverage-validator + schema-validator
	// ──────────────────────────────────────────────────────────────
	it('시나리오 5 보강: requiredValidators(plan) = canonical 2종 (plan-coverage-validator + schema-validator)', () => {
		const r = requiredValidators('plan');
		assert.ok(
			r.includes('plan-coverage-validator'),
			'plan-coverage-validator 의무',
		);
		assert.ok(r.includes('schema-validator'), 'schema-validator 의무');
		assert.equal(r.length, 2, 'canonical 2종 (v9.1.1 + v10.0.0 정합)');
	});
});

// F-AUDIT-SOFTGATE-001 (=C-13 해소) — chain-driver next 가 --findings 미제출 시 fail-closed (silent soft-pass 제거).
describe('F-AUDIT-SOFTGATE-001 fail-closed (=C-13 / findings 미제출)', () => {
	it('bare `next` (--findings 없이) → exit 1 + state.blocked=findings_unverified (e2e)', () => {
		const root = join(tmp, 'softgate-bare');
		mkdirSync(root, { recursive: true });
		initState(root, 'softgate-bare');
		// --findings 미전달 = loadFindings __findings_absent sentinel → evaluateGate findings_unverified block.
		const result = spawnSync('node', [CLI_PATH, 'next', root], {
			encoding: 'utf-8',
			timeout: 20000,
		});
		assert.equal(
			result.status,
			1,
			`bare next 는 fail-closed exit 1 의무 (got ${result.status}) / stderr: ${result.stderr}`,
		);
		const state = readState(root);
		assert.equal(state.blocked, true, 'state.blocked=true 영속 의무');
		assert.equal(
			state.block_reason,
			'findings_unverified',
			'block_reason=findings_unverified 영속 의무',
		);
	});

	it('`next --user-decision go` (--findings 없이) → exit 0 + advanced (명시 ack escape / intervention-log actor:user)', () => {
		const root = join(tmp, 'softgate-ack');
		mkdirSync(root, { recursive: true });
		initState(root, 'softgate-ack');
		const result = spawnSync(
			'node',
			[CLI_PATH, 'next', root, '--user-decision', 'go'],
			{ encoding: 'utf-8', timeout: 20000 },
		);
		assert.equal(
			result.status,
			0,
			`명시 go ack 시 전진 exit 0 의무 (got ${result.status}) / stderr: ${result.stderr}`,
		);
		const state = readState(root);
		assert.equal(
			state.blocked,
			false,
			'명시 ack 후 state.blocked=false (go-with-warnings 전진)',
		);
	});
});
