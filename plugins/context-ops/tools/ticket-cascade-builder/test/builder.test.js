// ticket-cascade-builder 단위 테스트 (결정론 / no-simulation).
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
	buildCascadePlan,
	resolveIssueType,
	resolveParentSpec,
	deltaAction,
	DEFAULT_ISSUETYPE_MAP,
} from '../src/builder.js';

const SG_MIS = {
	_env: 'SG-MIS',
	issuetype_map: { epic: 'epic', story: '이야기', subtask: '하위 작업', initiative: 'Initiative', task: '작업', bug: '버그' },
	parent_strategy: 'epic_link_customfield',
	epic_link_customfield_id: 'customfield_10006',
	parent_link_customfield_id: 'customfield_11902',
};
const DWPD = {
	_env: 'DWPD',
	issuetype_map: { epic: 'epic', story: '작업', subtask: '하위 작업', initiative: 'epic', task: '작업', bug: '버그' },
	parent_strategy: 'epic_link_customfield',
	epic_link_customfield_id: 'customfield_10006',
};

function baseTaskPlan(extra = {}) {
	return {
		meta: { scope: 'car' },
		epic_refs: [{ screen_id: 'SCR-CAR-DASH', title: '차량 대시보드', route: '/car/dash' }],
		story_refs: [{ behavior_ref: 'BHV-CAR-001', epic_ref: 'SCR-CAR-DASH', title: '차량 등록', ac_refs: ['AC-CAR-001'] }],
		op_task_refs: [{ op_task_id: 'OP-CAR-001', epic_ref: 'SCR-CAR-DASH', category: 'infra' }],
		tasks: [{ id: 'TASK-CAR-001', ac_refs: ['AC-CAR-001'], behavior_ref: 'BHV-CAR-001', layer: 'be', story_ref: 'BHV-CAR-001', execution_order: 1 }],
		...extra,
	};
}

test('resolveIssueType — 환경별 (SG-MIS story=이야기 / DWPD story=작업 / default)', () => {
	assert.equal(resolveIssueType('story', SG_MIS), '이야기');
	assert.equal(resolveIssueType('story', DWPD), '작업');
	assert.equal(resolveIssueType('story', {}), DEFAULT_ISSUETYPE_MAP.story);
	assert.equal(resolveIssueType('subtask', SG_MIS), '하위 작업');
});

test('resolveIssueType — 미정의 role → throw (F-TICKETSYNC-007)', () => {
	assert.throws(() => resolveIssueType('nonexistent', {}), /issuetype_unresolved/);
});

test('resolveParentSpec — B14: subtask = parent_key only (epic_link customfield 명시 ❌)', () => {
	const ps = resolveParentSpec('subtask', SG_MIS, 'BHV-CAR-001');
	assert.equal(ps.strategy, 'parent_key');
	assert.equal(ps.customfield_id, null);
	assert.equal(ps.parent_ref_key, 'BHV-CAR-001');
});

test('resolveParentSpec — story = epic_link_customfield (set 시)', () => {
	const ps = resolveParentSpec('story', SG_MIS, 'SCR-CAR-DASH');
	assert.equal(ps.strategy, 'epic_link_customfield');
	assert.equal(ps.customfield_id, 'customfield_10006');
});

test('resolveParentSpec — epic = parent_link_customfield (set 시) / 미set 시 parent_key', () => {
	assert.equal(resolveParentSpec('epic', SG_MIS, 'MIS-1').strategy, 'parent_link_customfield');
	assert.equal(resolveParentSpec('epic', DWPD, 'MIS-1').strategy, 'parent_key'); // DWPD = parent_link cf 없음
});

test('resolveParentSpec — initiative = top_level', () => {
	assert.equal(resolveParentSpec('initiative', SG_MIS, null).strategy, 'top_level');
});

test('deltaAction — jira_id 보유 → skip_prebound / pre_existing → skip / 없음 → create', () => {
	assert.equal(deltaAction({ jira_id: 'MIS-201' }), 'skip_prebound');
	assert.equal(deltaAction({ pre_existing: true }), 'skip_prebound');
	assert.equal(deltaAction({}), 'create');
});

test('buildCascadePlan — parent_initiative 없으면 Initiative 생성 ❌ + initiative_required (DEC-2026-06-10-initiative-reference-only)', () => {
	const plan = buildCascadePlan({ scope: 'car', taskPlan: baseTaskPlan(), config: SG_MIS });
	const roles = plan.calls.map((c) => c.role);
	// Initiative 미상 → cascade 는 Epic 부터 (Initiative call ❌)
	assert.deepEqual(roles, ['epic', 'story', 'task', 'subtask']);
	assert.equal(plan.initiative_required, true);
	assert.equal(plan.calls.some((c) => c.role === 'initiative'), false);
});

test('buildCascadePlan — parent_initiative 제공 시 Initiative = 참조(skip_prebound) / 생성 ❌ + 순서', () => {
	const plan = buildCascadePlan({ scope: 'car', taskPlan: baseTaskPlan(), config: { ...SG_MIS, parent_initiative: 'MIS-58' } });
	assert.deepEqual(plan.calls.map((c) => c.role), ['initiative', 'epic', 'story', 'task', 'subtask']);
	const init = plan.calls.find((c) => c.role === 'initiative');
	assert.equal(init.delta_action, 'skip_prebound'); // 참조 = 생성 ❌
	assert.equal(plan.initiative_required, false);
	assert.equal(plan.calls.filter((c) => c.delta_action === 'create' && c.role === 'initiative').length, 0); // Initiative create 0
});

test('buildCascadePlan — 델타: 기존 Story(jira_id) → skip_prebound + skip_list 기록', () => {
	const tp = baseTaskPlan({
		story_refs: [{ behavior_ref: 'BHV-CAR-001', epic_ref: 'SCR-CAR-DASH', jira_id: 'MIS-201', pre_existing: true }],
	});
	const plan = buildCascadePlan({ scope: 'car', taskPlan: tp, config: SG_MIS });
	const story = plan.calls.find((c) => c.role === 'story');
	assert.equal(story.delta_action, 'skip_prebound');
	assert.equal(story.prebound_jira_id, 'MIS-201');
	assert.ok(plan.skip_list.some((s) => s.prebound_jira_id === 'MIS-201'));
	assert.equal(plan.evidence_skeleton.story_id_map['BHV-CAR-001'], 'MIS-201');
});

test('buildCascadePlan — 신규 Epic(jira_id 없음) → create + evidence map null placeholder', () => {
	const plan = buildCascadePlan({ scope: 'car', taskPlan: baseTaskPlan(), config: SG_MIS });
	const epic = plan.calls.find((c) => c.role === 'epic');
	assert.equal(epic.delta_action, 'create');
	assert.equal(plan.evidence_skeleton.epic_id_map['SCR-CAR-DASH'], null);
});

test('buildCascadePlan — issue_type resolve 반영 (SG-MIS subtask=하위 작업)', () => {
	const plan = buildCascadePlan({ scope: 'car', taskPlan: baseTaskPlan(), config: SG_MIS });
	assert.equal(plan.calls.find((c) => c.role === 'subtask').issue_type, '하위 작업');
	assert.equal(plan.calls.find((c) => c.role === 'story').issue_type, '이야기');
});

test('buildCascadePlan — Sub-task parent = story_ref (B14 parent_key)', () => {
	const plan = buildCascadePlan({ scope: 'car', taskPlan: baseTaskPlan(), config: SG_MIS });
	const sub = plan.calls.find((c) => c.role === 'subtask');
	assert.equal(sub.parent_spec.strategy, 'parent_key');
	assert.equal(sub.parent_spec.parent_ref_key, 'BHV-CAR-001');
});

test('buildCascadePlan — body 템플릿 채움 (Sub-task AC 범위/레이어)', () => {
	const plan = buildCascadePlan({ scope: 'car', taskPlan: baseTaskPlan(), config: SG_MIS });
	const sub = plan.calls.find((c) => c.role === 'subtask');
	assert.match(sub.body, /AC 범위/);
	assert.match(sub.body, /AC-CAR-001/);
	assert.match(sub.body, /be/);
});

test('buildCascadePlan — Initiative reuse (config.parent_initiative)', () => {
	const plan = buildCascadePlan({ scope: 'car', taskPlan: baseTaskPlan(), config: { ...SG_MIS, parent_initiative: 'MIS-58' } });
	const init = plan.calls.find((c) => c.role === 'initiative');
	assert.equal(init.delta_action, 'skip_prebound');
	assert.equal(plan.evidence_skeleton.initiative_id, 'MIS-58');
});

test('buildCascadePlan — counts + preview_md 산출', () => {
	const plan = buildCascadePlan({ scope: 'car', taskPlan: baseTaskPlan(), config: SG_MIS });
	assert.equal(plan.counts.create + (plan.counts.skip_prebound || 0), plan.calls.length);
	assert.match(plan.preview_md, /Preview — ticket cascade/);
});
