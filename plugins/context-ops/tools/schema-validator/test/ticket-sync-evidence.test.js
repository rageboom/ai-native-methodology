// schema-validator 회귀 — ticket-sync-evidence R20-prime (DEC-2026-05-26-ticket-plan-단일).
// ticket-sync-evidence.schema.json 정합 검증 (stage='plan' const + ticket_cascade 4-array 의무):
//   1) valid sample (real MCP / dry_run)
//   2) evidence_trust=simulated reject (R15 영구 거부)
//   3) mcp_tool_name pattern (mcp__wiki-jira-assistant__ prefix only)
//   4) 7-field evidence 누락 reject + result_hash sha256 pattern
//   5) mcp_invocations[].parent_ticket_id + link_type (hierarchy 강제)
//   6) traceability-matrix ticket_ref (R20-prime level/subtask_refs/op_task_refs + status_history + structure)
//   7) 구 enter_task_ids field 폐기 → reject (breaking 회귀 가드)

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../src/cli.js');
const TMP = resolve(__dirname, '_tmp_ticket_sync_evidence');

function runCli(args) {
	return spawnSync('node', [CLI, ...args], {
		encoding: 'utf-8',
		cwd: resolve(__dirname, '../..'),
	});
}

function ensureTmp() {
	if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	mkdirSync(TMP, { recursive: true });
}

const META_OK = {
	generated_at: '2026-05-18T14:30:00+09:00',
	confidence: 0.9,
	inputs_used: ['source_code', 'documentation'],
	methodology_version: 'v12.16.0',
};

const VALID_INVOCATION = {
	mcp_tool_name: 'mcp__wiki-jira-assistant__jira_create',
	tool_stdout_path: '.ai-context/output/evidence/mcp-stdout-1.log',
	tool_stderr_path: '.ai-context/output/evidence/mcp-stderr-1.log',
	tool_version: '1.4.2',
	invocation_timestamp: '2026-05-18T14:30:00+09:00',
	duration_ms: 1234,
	result_hash: 'a'.repeat(64),
	reproduction_command:
		'mcp__wiki-jira-assistant__jira_create with summary=[UC-CAR-007] ...',
};

// R20-prime — ticket-sync-evidence 는 stage='plan' const + ticket_cascade(4 array) 의무.
const VALID_CASCADE = {
	epics: [{ jira_id: 'EPIC-10' }],
	stories: [{ jira_id: 'STORY-101', behavior_ref: 'BHV-CAR-001' }],
	op_tasks: [{ jira_id: 'TASK-42', op_task_id: 'OP-CAR-001' }],
	subtasks: [{ jira_id: 'SUB-201', task_id: 'TASK-CAR-001' }],
};

// 유효한 R20-prime evidence base — extra 로 override / invocation 교체.
function baseEvidence(extra = {}) {
	return {
		meta: META_OK,
		stage: 'plan',
		scope: 'car',
		ticket_cascade: VALID_CASCADE,
		mcp_invocations: [VALID_INVOCATION],
		confirmation_log_ref: '.ai-context/output/intervention-log.jsonl',
		evidence_trust: 'real_tool',
		...extra,
	};
}

function baseMatrix(ticketRef) {
	return {
		meta: META_OK,
		matrix: [
			{
				use_case_id: 'UC-CAR-007',
				status: 'green',
				...(ticketRef ? { ticket_ref: ticketRef } : {}),
			},
		],
		coverage_summary: {
			forward_coverage: 0.85,
			backward_coverage: 0.85,
			threshold: 0.85,
		},
	};
}

function writeEvidence(obj) {
	const f = join(TMP, 'ticket-sync-evidence.json');
	writeFileSync(f, JSON.stringify(obj));
	return f;
}

function writeMatrix(obj) {
	const f = join(TMP, 'traceability-matrix.json');
	writeFileSync(f, JSON.stringify(obj));
	return f;
}

// ─── ticket-sync-evidence (stage=plan / ticket_cascade) ───

test('ticket-sync-evidence — valid sample (real MCP / plan cascade)', () => {
	ensureTmp();
	const f = writeEvidence(
		baseEvidence({
			preview_md_digest: 'b'.repeat(64),
			dry_run: false,
			idempotency_skip_count: 0,
		}),
	);
	const r = runCli([f]);
	assert.equal(r.status, 0, `valid sample 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — valid sample (dry_run=true)', () => {
	ensureTmp();
	const f = writeEvidence(baseEvidence({ dry_run: true }));
	const r = runCli([f]);
	assert.equal(r.status, 0, `dry_run sample 의무. stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — stage 는 plan const (planning reject)', () => {
	ensureTmp();
	const f = writeEvidence(baseEvidence({ stage: 'planning' }));
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `stage const plan 의무 — 구 5-stage(planning 등) reject. stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — ticket_cascade 누락 reject (R20-prime 의무)', () => {
	ensureTmp();
	const { ticket_cascade, ...noCascade } = baseEvidence();
	const f = writeEvidence(noCascade);
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `ticket_cascade required 의무. stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — evidence_trust="simulated" reject (R15 영구 거부)', () => {
	ensureTmp();
	const f = writeEvidence(baseEvidence({ evidence_trust: 'simulated' }));
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `simulated 영구 거부 의무. stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — mcp_tool_name pattern (mcp__wiki-jira-assistant__ prefix only)', () => {
	ensureTmp();
	const f = writeEvidence(
		baseEvidence({
			mcp_invocations: [{ ...VALID_INVOCATION, mcp_tool_name: 'mcp__linear__create_issue' }],
		}),
	);
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `Linear MCP reject 의무 (jira-confluence only). stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — 7-field evidence 누락 reject (reproduction_command 의무)', () => {
	ensureTmp();
	const { reproduction_command, ...partial } = VALID_INVOCATION;
	const f = writeEvidence(baseEvidence({ mcp_invocations: [partial] }));
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `reproduction_command 의무 (R15 정합). stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — result_hash sha256 pattern 검증 (64 hex)', () => {
	ensureTmp();
	const f = writeEvidence(
		baseEvidence({ mcp_invocations: [{ ...VALID_INVOCATION, result_hash: 'too_short' }] }),
	);
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `result_hash sha256 pattern 의무. stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

// ─── hierarchy 강제 (parent_ticket_id + link_type) ───

test('ticket-sync-evidence — mcp_invocations[].parent_ticket_id valid (Story 생성 시 Epic id)', () => {
	ensureTmp();
	const f = writeEvidence(
		baseEvidence({
			mcp_invocations: [
				{
					...VALID_INVOCATION,
					ticket_id_created: 'MIG-1234',
					parent_ticket_id: 'MIG-CAR-100',
					link_type: 'parent-child',
				},
			],
		}),
	);
	const r = runCli([f]);
	assert.equal(r.status, 0, `parent_ticket_id Story→Epic valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — mcp_invocations[].parent_ticket_id valid (Sub-task 생성 시 Story id)', () => {
	ensureTmp();
	const f = writeEvidence(
		baseEvidence({
			mcp_invocations: [
				{
					...VALID_INVOCATION,
					ticket_id_created: 'MIG-1236',
					parent_ticket_id: 'MIG-1234',
					link_type: 'parent-child',
				},
			],
		}),
	);
	const r = runCli([f]);
	assert.equal(r.status, 0, `parent_ticket_id Sub-task→Story valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — link_type enum reject (unknown value)', () => {
	ensureTmp();
	const f = writeEvidence(
		baseEvidence({
			mcp_invocations: [
				{ ...VALID_INVOCATION, parent_ticket_id: 'MIG-1', link_type: 'arbitrary-bogus' },
			],
		}),
	);
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `link_type enum reject 의무. stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('ticket-sync-evidence — link_type relates-to valid (cross-cutting Tech Debt Story)', () => {
	ensureTmp();
	const f = writeEvidence(
		baseEvidence({
			mcp_invocations: [
				{
					...VALID_INVOCATION,
					ticket_id_created: 'MIG-AP-001',
					parent_ticket_id: 'MIG-1',
					link_type: 'relates-to',
				},
			],
		}),
	);
	const r = runCli([f]);
	assert.equal(r.status, 0, `link_type=relates-to (Tech Debt) valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
	rmSync(TMP, { recursive: true, force: true });
});

// ─── traceability-matrix ticket_ref (R20-prime) ───

test('traceability-matrix — ticket_ref (level + subtask_refs + op_task_refs) valid', () => {
	ensureTmp();
	const f = writeMatrix(
		baseMatrix({
			platform: 'jira',
			id: 'MIG-1234',
			level: 'story',
			epic_id: 'MIG-1000',
			subtask_refs: ['MIG-1235', 'MIG-1236'],
			op_task_refs: ['MIG-1240'],
		}),
	);
	const r = runCli([f]);
	assert.equal(r.status, 0, `R20-prime ticket_ref valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('traceability-matrix — 구 enter_task_ids field 폐기 → reject (breaking 회귀 가드)', () => {
	ensureTmp();
	const f = writeMatrix(
		baseMatrix({
			platform: 'jira',
			id: 'MIG-1234',
			enter_task_ids: { plan: 'MIG-ENTER-PL' },
		}),
	);
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `구 enter_task_ids 는 R20-prime 에서 폐기 → additionalProperties:false reject 의무. stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('traceability-matrix — 구 subtask_ids{chain*} field 폐기 → reject (breaking 회귀 가드)', () => {
	ensureTmp();
	const m = baseMatrix({
		platform: 'jira',
		id: 'MIG-1234',
		subtask_ids: { chain1_planning: 'MIG-1235' },
	});
	const f = writeMatrix(m);
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `구 subtask_ids{chain*} 폐기 → reject 의무. stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('traceability-matrix — ticket_ref.status_history valid sample', () => {
	ensureTmp();
	const f = writeMatrix(
		baseMatrix({
			platform: 'jira',
			id: 'MIG-1234',
			status_history: [
				{
					transitioned_at: '2026-05-18T14:30:00+09:00',
					to_status: 'To Do',
					mcp_tool: 'mcp__wiki-jira-assistant__jira_create',
				},
				{
					transitioned_at: '2026-05-18T15:00:00+09:00',
					from_status: 'To Do',
					to_status: 'In Progress',
					mcp_tool: 'mcp__wiki-jira-assistant__jira_transition',
					evidence_ref: '.ai-context/output/evidence/ticket-sync-plan-20260518T150000.json',
				},
				{
					transitioned_at: '2026-05-18T16:30:00+09:00',
					from_status: 'In Progress',
					to_status: 'Done',
					mcp_tool: 'mcp__wiki-jira-assistant__jira_transition',
				},
			],
		}),
	);
	const r = runCli([f]);
	assert.equal(r.status, 0, `status_history valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('traceability-matrix — status_history.mcp_tool pattern (mcp__wiki-jira-assistant__ prefix only)', () => {
	ensureTmp();
	const f = writeMatrix(
		baseMatrix({
			platform: 'jira',
			id: 'MIG-1234',
			status_history: [
				{
					transitioned_at: '2026-05-18T14:30:00+09:00',
					to_status: 'To Do',
					mcp_tool: 'mcp__github__create_issue',
				},
			],
		}),
	);
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `GitHub MCP reject 의무 (jira-confluence only). stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('traceability-matrix — ticket_ref.structure_complete=true valid', () => {
	ensureTmp();
	const f = writeMatrix(
		baseMatrix({
			platform: 'jira',
			id: 'MIG-1234',
			level: 'story',
			epic_id: 'MIG-CAR-100',
			initiative_id: 'MIG-1',
			structure_complete: true,
			structure_tree_url: 'https://company.atlassian.net/secure/StructureBoard.jspa?s=42',
		}),
	);
	const r = runCli([f]);
	assert.equal(r.status, 0, `structure_complete + structure_tree_url valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
	rmSync(TMP, { recursive: true, force: true });
});

test('traceability-matrix — structure_tree_url uri format reject (invalid URL)', () => {
	ensureTmp();
	const f = writeMatrix(
		baseMatrix({
			platform: 'jira',
			id: 'MIG-1234',
			structure_tree_url: 'not a url at all spaces here',
		}),
	);
	const r = runCli([f]);
	assert.notEqual(r.status, 0, `structure_tree_url uri format reject 의무. stdout:${r.stdout}`);
	rmSync(TMP, { recursive: true, force: true });
});
