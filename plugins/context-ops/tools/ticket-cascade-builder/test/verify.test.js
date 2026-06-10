// ticket-cascade-builder verify (conformance) 단위 테스트.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { verifyConformance } from '../src/verify.js';

// cascade-plan: Epic(create) + Story(create) + Sub-task(create) + 기존 Story(skip MIS-9)
function plan() {
	return {
		calls: [
			{ order: 1, role: 'initiative', issue_type: 'Initiative', delta_action: 'skip_prebound', prebound_jira_id: 'MIS-1', source_ref: 'MIS-1' },
			{ order: 2, role: 'epic', issue_type: 'epic', delta_action: 'create', source_ref: 'SCR-A' },
			{ order: 3, role: 'story', issue_type: '이야기', delta_action: 'create', source_ref: 'BHV-1' },
			{ order: 4, role: 'story', issue_type: '이야기', delta_action: 'skip_prebound', prebound_jira_id: 'MIS-9', source_ref: 'BHV-9' },
			{ order: 5, role: 'subtask', issue_type: '하위 작업', delta_action: 'create', source_ref: 'TASK-1' },
		],
	};
}
// 정합 evidence: epic 1 + story 1 + subtask 1 created (skip 은 미생성)
function goodEvidence() {
	return {
		mcp_invocations: [
			{ mcp_tool_name: 'mcp__mcp-server-wiki-jira__jira_create', ticket_id_created: 'MIS-100', ticket_level: 'epic', link_type: 'parent-child', issue_type: 'epic', parent_ticket_id: 'MIS-1' },
			{ mcp_tool_name: 'mcp__mcp-server-wiki-jira__jira_create', ticket_id_created: 'MIS-101', ticket_level: 'story', link_type: 'parent-child', issue_type: '이야기', parent_ticket_id: 'MIS-100' },
			{ mcp_tool_name: 'mcp__mcp-server-wiki-jira__jira_create', ticket_id_created: 'MIS-102', ticket_level: 'subtask', link_type: 'parent-child', issue_type: '하위 작업', parent_ticket_id: 'MIS-101' },
		],
	};
}

test('verify — 정합 cascade → ok (위반 0)', () => {
	const r = verifyConformance(plan(), goodEvidence());
	assert.equal(r.ok, true, JSON.stringify(r.findings));
});

test('verify — 정책7: skip_prebound 인데 prebound_jira_id 가 created → F-TICKETSYNC-014', () => {
	const ev = goodEvidence();
	ev.mcp_invocations.push({ mcp_tool_name: 'x_jira_create', ticket_id_created: 'MIS-9', ticket_level: 'story', link_type: 'parent-child', parent_ticket_id: 'MIS-100' });
	const r = verifyConformance(plan(), ev);
	assert.ok(r.findings.some((f) => f.id === 'F-TICKETSYNC-014'), JSON.stringify(r.findings));
});

test('verify — 정책8: story 가 parent_ticket_id 부재 → F-TICKETSYNC-002 (orphan)', () => {
	const ev = goodEvidence();
	ev.mcp_invocations[1].parent_ticket_id = null;
	const r = verifyConformance(plan(), ev);
	assert.ok(r.findings.some((f) => f.id === 'F-TICKETSYNC-002'));
});

test('verify — 정책9: epic link_type 가 relates-to → F-TICKETSYNC-016 (link_type drift)', () => {
	const ev = goodEvidence();
	ev.mcp_invocations[0].link_type = 'relates-to';
	const r = verifyConformance(plan(), ev);
	assert.ok(r.findings.some((f) => f.id === 'F-TICKETSYNC-016'));
});

test('verify — 정책12: subtask 가 parent_key 부재 → F-TICKETSYNC-011 (B14)', () => {
	const ev = goodEvidence();
	ev.mcp_invocations[2].parent_ticket_id = null;
	const r = verifyConformance(plan(), ev);
	assert.ok(r.findings.some((f) => f.id === 'F-TICKETSYNC-011'));
});

test('verify — 정책11: issue_type 가 cascade-plan 집합 밖 → F-TICKETSYNC-009 (hardcode drift)', () => {
	const ev = goodEvidence();
	ev.mcp_invocations[1].issue_type = 'Story'; // cascade-plan 은 '이야기' 인데 영문 하드코딩
	const r = verifyConformance(plan(), ev);
	assert.ok(r.findings.some((f) => f.id === 'F-TICKETSYNC-009'));
});

test('verify — 정책11 coverage: create 의도보다 적게 발사 → F-TICKETSYNC-015', () => {
	const ev = goodEvidence();
	ev.mcp_invocations.pop(); // subtask 누락
	const r = verifyConformance(plan(), ev);
	assert.ok(r.findings.some((f) => f.id === 'F-TICKETSYNC-015'));
});

test('verify — issue_type 미캡쳐(evidence) 시 11 검사 skip (additive optional)', () => {
	const ev = goodEvidence();
	for (const i of ev.mcp_invocations) delete i.issue_type;
	const r = verifyConformance(plan(), ev);
	assert.equal(r.ok, true, JSON.stringify(r.findings)); // issue_type 부재면 9 검사 안 함
});
