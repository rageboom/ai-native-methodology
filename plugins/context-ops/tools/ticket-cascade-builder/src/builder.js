// ticket-cascade-builder — 결정론 core (DEC-2026-06-10-ticket-cascade-builder).
// NO MCP / NO LLM / NO network. task-plan + config → cascade-plan.json (실행 계획).
// ticket-sync skill 이 본 plan 을 읽어 MCP 호출을 순차 발사한다.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function loadJson(path) {
	return JSON.parse(readFileSync(path, 'utf-8'));
}

export function loadConfig(path) {
	if (!path) return {};
	const raw = readFileSync(path, 'utf-8');
	// .json 또는 .yaml/.yml 모두 허용 (js-yaml 은 JSON superset 파싱).
	// lazy require — core(buildCascadePlan)는 js-yaml 무의존 (단위 테스트 install 불요).
	const yaml = require('js-yaml');
	return yaml.load(raw) || {};
}

// canonical 6종 (DEC-2026-06-10-ticket-canonical-types). bug 은 cascade 비대상.
export const DEFAULT_ISSUETYPE_MAP = {
	initiative: 'Initiative',
	epic: 'Epic',
	story: 'Story',
	task: 'Task',
	subtask: 'Sub-task',
	bug: 'Bug',
};

export function resolveIssueType(role, config = {}) {
	const map = config.issuetype_map || {};
	const resolved = map[role] ?? DEFAULT_ISSUETYPE_MAP[role];
	if (!resolved) {
		throw new Error(`F-TICKETSYNC-007 issuetype_unresolved: role=${role}`);
	}
	return resolved;
}

// 부모 연결 의도 (happy-path). runtime 400 fallback 은 skill 책임.
// DEC-2026-05-20-r20-environment-bridge + B14(subtask) + DEC-2026-06-10-ticket-canonical-types.
export function resolveParentSpec(role, config, parentRefKey) {
	const epicCf = config.epic_link_customfield_id || null;
	const parentCf = config.parent_link_customfield_id || null;
	const strategy = config.parent_strategy || 'auto';

	if (role === 'initiative') {
		return { strategy: 'top_level', parent_ref_key: null, customfield_id: null, link_type: 'parent-child' };
	}
	if (role === 'subtask') {
		// B14 invariant — Sub-task = parent_key 만 (epic_link customfield 명시 ❌ / auto-inherit).
		return { strategy: 'parent_key', parent_ref_key: parentRefKey ?? null, customfield_id: null, link_type: 'parent-child' };
	}
	if (role === 'epic') {
		// Epic → Initiative: parent_link customfield 우선, 없으면 parent_key.
		if (parentCf) {
			return { strategy: 'parent_link_customfield', parent_ref_key: parentRefKey ?? null, customfield_id: parentCf, link_type: 'parent-child' };
		}
		return { strategy: 'parent_key', parent_ref_key: parentRefKey ?? null, customfield_id: null, link_type: 'parent-child' };
	}
	// story / task / bug → Epic Link customfield (set 시) / 아니면 parent_key.
	if ((strategy === 'epic_link_customfield' || strategy === 'auto') && epicCf) {
		return { strategy: 'epic_link_customfield', parent_ref_key: parentRefKey ?? null, customfield_id: epicCf, link_type: 'parent-child' };
	}
	return { strategy: 'parent_key', parent_ref_key: parentRefKey ?? null, customfield_id: null, link_type: 'parent-child' };
}

// 델타 판정 (DEC-2026-06-10-ticket-delta-creation): jira_id 보유 또는 pre_existing → skip.
export function deltaAction(ref = {}) {
	return ref.jira_id || ref.pre_existing ? 'skip_prebound' : 'create';
}

function bhvDetail(behaviorSpec, ref) {
	const b = (behaviorSpec?.behaviors || []).find((x) => x.id === ref);
	return b?.description || b?.summary || `(behavior-spec ${ref} 참조)`;
}
function acItems(acceptanceCriteria, refs = []) {
	const all = acceptanceCriteria?.criteria || [];
	return refs
		.map((r) => {
			const ac = all.find((x) => x.id === r);
			return `- ${r}${ac?.title ? ` — ${ac.title}` : ''}`;
		})
		.join('\n');
}

// Description 본문 템플릿 (구 SKILL.md §이슈 유형 → 도구로 이전 / 결정론 string interp).
export function buildBody(role, ctx = {}) {
	if (role === 'epic') {
		return `■ 화면 개요\n- ${ctx.kind || '신규'} — ${ctx.description || ''}\n\n■ 화면 경로\n${ctx.route || '(경로 미상)'}\n\n■ 비고\n- 본 Epic은 화면이 서비스되는 동안 닫지 않으며(open 유지), 이후 일감은 성격에 따라 하위에 이야기/작업/버그로 계속 추가한다.`;
	}
	if (role === 'story') {
		return `■ 기능 목적\n나는 ${ctx.user_role || '사용자'}으로서 ${ctx.user_action || ctx.title || ''}을 원한다. 왜냐하면 ${ctx.because || '필요하기 때문'}이다.\n\n■ 상세 내용\n${ctx.bhv_detail || ''}\n\n■ 완료 조건\n${ctx.ac_items || ''}`;
	}
	if (role === 'task') {
		return `■ 작업 내용\n${ctx.description || ''}\n\n■ 작업 사유 (왜 Task인가)\n화면 동작이나 결과는 그대로이고 내부 구조만 개선/변경하는 작업으로, 사용자 가치 변화가 없으므로 Task로 등록한다.\n\n■ 완료 조건\n${ctx.acceptance || ''}`;
	}
	if (role === 'subtask') {
		return `■ AC 범위\n${(ctx.ac_refs || []).join(', ')}\n\n■ 레이어\n${ctx.layer || ''}\n\n■ API / 컴포넌트 참조\n${ctx.contract_ref || '(없음)'}`;
	}
	return '';
}

// summary 네이밍 규칙 (구 SKILL.md §Summary 네이밍).
// Epic·Story = 브래킷 ❌ (메뉴명·기능명만). OP·Sub-task = 브래킷 유지.
function epicSummary(e) { return e.title || e.screen_id || e.route || '(Epic)'; }
function storySummary(s) { return s.title || s.behavior_ref || '(Story)'; }
function opSummary(op) { return `[OP-${stripPrefix(op.op_task_id || op.id)}] ${op.title || ''}`.trim(); }
function subSummary(t) { return `[${t.id}] ${t.layer ? t.layer + ' ' : ''}${t.title || ''}`.trim(); }
function stripPrefix(id) { return String(id || '').replace(/^OP-/, ''); }

// validation guard — Epic·Story summary 에 브래킷 시작 ❌.
export function validateNoLeadingBracket(role, summary) {
	if ((role === 'epic' || role === 'story') && /^\[/.test(summary)) {
		throw new Error(`F-TICKETSYNC-019 bracket_in_summary: role=${role} summary="${summary}" — Epic·Story summary 브래킷 시작 금지`);
	}
}

// 메인 — cascade-plan object 산출.
export function buildCascadePlan(inputs) {
	const {
		scope = 'unknown',
		taskPlan = {},
		operationalTask = null,
		behaviorSpec = null,
		acceptanceCriteria = null,
		config = {},
		meta = null,
	} = inputs;

	const calls = [];
	const skip_list = [];
	const evidence_skeleton = { initiative_id: null, epic_id_map: {}, story_id_map: {}, op_task_id_map: {}, subtask_id_map: {} };
	let order = 0;
	const counts = { create: 0, skip_prebound: 0 };

	const push = (call) => {
		call.order = ++order;
		calls.push(call);
		counts[call.delta_action] = (counts[call.delta_action] || 0) + 1;
		if (call.delta_action === 'skip_prebound') {
			skip_list.push({ key: call.source_ref, prebound_jira_id: call.prebound_jira_id, reason: 'prebound_jira_id' });
		}
	};

	// Step 1 — Initiative = 참조 전용 (DEC-2026-06-10-initiative-reference-only).
	//   Initiative = 실 프로젝트명 → ticket-sync 는 **참조만 / 생성 ❌**.
	//   parent_initiative 제공 시 = Epic 부모로 참조(skip_prebound) / 미제공 시 = initiative_required 신호 (도구는 생성 ❌ → 스킬이 사용자에게 키 질문).
	let initiativeKey = config.parent_initiative || null;
	let initiativeRequired = false;
	if (initiativeKey) {
		evidence_skeleton.initiative_id = initiativeKey;
		push({ role: 'initiative', issue_type: resolveIssueType('initiative', config), summary: `(reference) ${initiativeKey}`,
			body: '', parent_spec: resolveParentSpec('initiative', config, null), labels: [],
			delta_action: 'skip_prebound', prebound_jira_id: initiativeKey, source_ref: initiativeKey });
	} else {
		initiativeRequired = true; // 생성 ❌ — Epic 부모 미상 → 스킬이 사용자에게 Initiative 키 질문 후 재실행
	}

	// Step 2 — Epic (per epic_ref / 델타).
	for (const e of taskPlan.epic_refs || []) {
		const key = e.screen_id || e.jira_id || e.title;
		const action = deltaAction(e);
		const eSum = epicSummary(e);
		validateNoLeadingBracket('epic', eSum);
		evidence_skeleton.epic_id_map[key] = e.jira_id || null;
		push({ role: 'epic', issue_type: resolveIssueType('epic', config), summary: eSum,
			body: buildBody('epic', { description: e.title, route: e.route }),
			parent_spec: resolveParentSpec('epic', config, initiativeKey), labels: ['epic'],
			delta_action: action, prebound_jira_id: e.jira_id, source_ref: key });
	}

	// Step 3 — Story (per story_ref / 델타).
	for (const s of taskPlan.story_refs || []) {
		const key = s.behavior_ref || s.jira_id;
		const action = deltaAction(s);
		const sSum = storySummary(s);
		validateNoLeadingBracket('story', sSum);
		evidence_skeleton.story_id_map[key] = s.jira_id || null;
		push({ role: 'story', issue_type: resolveIssueType('story', config), summary: sSum,
			body: buildBody('story', { title: s.title, bhv_detail: bhvDetail(behaviorSpec, s.behavior_ref), ac_items: acItems(acceptanceCriteria, s.ac_refs) }),
			parent_spec: resolveParentSpec('story', config, s.epic_ref || null), labels: [],
			delta_action: action, prebound_jira_id: s.jira_id, source_ref: key });
	}

	// Step 4 — Task (OP-* / per op_task_ref / 델타). operational-task.json 으로 본문 enrich.
	const opDetails = {};
	for (const op of operationalTask?.op_tasks || []) opDetails[op.id] = op;
	for (const ot of taskPlan.op_task_refs || []) {
		const det = opDetails[ot.op_task_id] || {};
		const key = ot.op_task_id;
		const action = deltaAction(ot);
		evidence_skeleton.op_task_id_map[key] = ot.jira_id || null;
		push({ role: 'task', issue_type: resolveIssueType('task', config),
			summary: opSummary({ op_task_id: ot.op_task_id, title: det.title }),
			body: buildBody('task', { description: det.description, acceptance: (det.acceptance_criteria || []).map((a) => `- ${a}`).join('\n') }),
			parent_spec: resolveParentSpec('task', config, ot.epic_ref || null),
			labels: ['op', det.category || ot.category].filter(Boolean),
			delta_action: action, prebound_jira_id: ot.jira_id, source_ref: key });
	}

	// Step 5 — Sub-task (per task / parent = story_ref 또는 op_task_ref / B14).
	for (const t of taskPlan.tasks || []) {
		const parentKey = t.story_ref || t.op_task_ref || null;
		const action = deltaAction(t);
		evidence_skeleton.subtask_id_map[t.id] = t.jira_id || null;
		push({ role: 'subtask', issue_type: resolveIssueType('subtask', config), summary: subSummary(t),
			body: buildBody('subtask', { ac_refs: t.ac_refs, layer: t.layer, contract_ref: contractRef(t) }),
			parent_spec: resolveParentSpec('subtask', config, parentKey), labels: ['layer', t.layer].filter(Boolean),
			delta_action: action, prebound_jira_id: t.jira_id, source_ref: t.id });
	}

	const plan = {
		meta: meta || defaultMeta(),
		scope,
		config_env: config._env || 'default',
		initiative_required: initiativeRequired,
		calls,
		preview_md: '',
		skip_list,
		evidence_skeleton,
		counts,
	};
	plan.preview_md = renderPreview(plan);
	return plan;
}

function contractRef(t) {
	if (t.openapi_endpoint_ref) return `${t.openapi_endpoint_ref.path || ''} ${t.openapi_endpoint_ref.operationId || ''}`.trim();
	if (t.component_ref) return t.component_ref.package || t.component_ref.name || '';
	return '(없음)';
}

function defaultMeta() {
	return { generated_at: '1970-01-01T00:00:00Z', confidence: 0.95, inputs_used: ['source_code'], _note: 'cli 가 실 timestamp 로 덮어씀' };
}

export function renderPreview(plan) {
	const byRole = (r) => plan.calls.filter((c) => c.role === r);
	const line = (c) => `  - ${c.delta_action === 'skip_prebound' ? '↺(기존 ' + c.prebound_jira_id + ')' : '＋신규'} ${c.summary}  ⟶ parent:${c.parent_spec.parent_ref_key || '-'}(${c.parent_spec.strategy})`;
	const sec = (title, role) => {
		const rows = byRole(role).map(line).join('\n');
		return rows ? `\n### ${title}\n${rows}` : '';
	};
	return [
		`## Preview — ticket cascade (scope=${plan.scope})`,
		`생성 ${plan.counts.create || 0} / 기존재사용 ${plan.counts.skip_prebound || 0} (총 ${plan.calls.length} call)`,
		plan.initiative_required ? `\n⚠️ **Initiative 참조 미상** — Initiative=실 프로젝트명(생성 ❌). 사용자에게 기존 Initiative 키를 물어 \`parent_initiative\` 로 재실행 필요 (Epic 부모 미확정).` : '',
		sec('Initiative (참조)', 'initiative'),
		sec('Epic', 'epic'),
		sec('Story', 'story'),
		sec('Task (OP-*)', 'task'),
		sec('Sub-task (TASK-*)', 'subtask'),
	].join('\n');
}
