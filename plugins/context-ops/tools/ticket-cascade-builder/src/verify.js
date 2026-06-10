// ticket-cascade-builder verify — post-hoc conformance (DEC-2026-06-10-cascade-conformance).
// cascade-plan.json(의도) ↔ ticket-sync-evidence.json(실 발사) 대조 = 정책 11 강제
// → 7(델타)·8(orphan)·9(link_type)·12(B14) transitively 보장. 결정론 (NO MCP/LLM).
//
// aggregate/set 검사 (1:1 summary match 불필요 / 견고). evidence 필드:
//   mcp_invocations[].{mcp_tool_name, ticket_id_created, parent_ticket_id, link_type, ticket_level, issue_type?}

const PARENT_REQUIRED_LEVELS = new Set(['story', 'op_task', 'subtask']); // epic/initiative = top-ok

function isJiraCreate(inv) {
	return typeof inv.mcp_tool_name === 'string' && inv.mcp_tool_name.endsWith('jira_create');
}

// cascade-plan.role(initiative/epic/story/task/subtask) → evidence.ticket_level(epic/story/op_task/subtask) 정규화.
function roleToLevel(role) {
	return role === 'task' ? 'op_task' : role;
}

export function verifyConformance(cascadePlan, evidence) {
	const findings = [];
	const add = (id, msg) => findings.push({ id, msg });

	const calls = cascadePlan?.calls || [];
	const createCalls = calls.filter((c) => c.delta_action === 'create' && c.role !== 'initiative');
	const skipCalls = calls.filter((c) => c.delta_action === 'skip_prebound');
	const invocations = (evidence?.mcp_invocations || []).filter(isJiraCreate);
	const createdIds = new Set(invocations.map((i) => i.ticket_id_created).filter(Boolean));

	// 허용 issue_type 집합 (cascade-plan 이 resolve 한 값만 / 정책 11 hardcode 차단)
	const allowedIssueTypes = new Set(calls.map((c) => c.issue_type).filter(Boolean));

	// Check 7 (델타) — skip_prebound 의 prebound_jira_id 가 새로 created 되면 위반.
	for (const sc of skipCalls) {
		if (sc.prebound_jira_id && createdIds.has(sc.prebound_jira_id)) {
			add('F-TICKETSYNC-014', `pre-bound 티켓 재생성 위반: ${sc.source_ref} (기존 ${sc.prebound_jira_id} 인데 jira_create 됨)`);
		}
	}

	// Check 11 (coverage) — create 의도 수 ↔ 실 jira_create 수 (initiative 제외 / per-level).
	const wantByLevel = {};
	for (const c of createCalls) wantByLevel[roleToLevel(c.role)] = (wantByLevel[roleToLevel(c.role)] || 0) + 1;
	const gotByLevel = {};
	for (const i of invocations) if (i.ticket_level) gotByLevel[i.ticket_level] = (gotByLevel[i.ticket_level] || 0) + 1;
	for (const lvl of new Set([...Object.keys(wantByLevel), ...Object.keys(gotByLevel)])) {
		if ((wantByLevel[lvl] || 0) !== (gotByLevel[lvl] || 0)) {
			add('F-TICKETSYNC-015', `coverage 불일치 (level=${lvl}): cascade-plan create ${wantByLevel[lvl] || 0} ≠ 실 jira_create ${gotByLevel[lvl] || 0}`);
		}
	}

	for (const inv of invocations) {
		const lvl = inv.ticket_level;
		// Check 8 (orphan) — story/op_task/subtask 는 parent_ticket_id 의무.
		if (PARENT_REQUIRED_LEVELS.has(lvl) && !inv.parent_ticket_id) {
			add('F-TICKETSYNC-002', `orphan: ticket_level=${lvl} (created ${inv.ticket_id_created || '?'}) parent_ticket_id 부재`);
		}
		// Check 9 (link_type) — 계층(epic/story/subtask)은 parent-child 의무.
		if (lvl && lvl !== 'op_task' && inv.link_type && inv.link_type !== 'parent-child') {
			add('F-TICKETSYNC-016', `link_type drift: ticket_level=${lvl} link_type=${inv.link_type} (parent-child 의무)`);
		}
		// Check 12 (B14) — subtask 는 parent_ticket_id(parent_key) + parent-child.
		if (lvl === 'subtask') {
			if (!inv.parent_ticket_id) add('F-TICKETSYNC-011', `B14: subtask(${inv.ticket_id_created || '?'}) parent_ticket_id(parent_key) 부재`);
			if (inv.link_type && inv.link_type !== 'parent-child') add('F-TICKETSYNC-011', `B14: subtask link_type=${inv.link_type} (parent-child 의무)`);
		}
		// Check 11 (issue_type) — evidence 가 issue_type 담은 경우만 (additive / optional).
		if (inv.issue_type && allowedIssueTypes.size && !allowedIssueTypes.has(inv.issue_type)) {
			add('F-TICKETSYNC-009', `issue_type hardcode/drift: '${inv.issue_type}' ∉ cascade-plan resolve 집합 {${[...allowedIssueTypes].join(', ')}}`);
		}
	}

	return { ok: findings.length === 0, findings };
}
