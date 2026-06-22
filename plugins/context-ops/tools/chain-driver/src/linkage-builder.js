// linkage-builder.js — finish-task PR body 의 "연결(linkage) block" 결정론 생성
//   (DEC-2026-06-19-branch-per-task §3.7 / PR 연결 가시화).
//
// task-plan.tasks[id] + ticket-sync-evidence.ticket_cascade 만으로 Story / Epic / 형제 Sub-task /
//   의존 / AC 를 순수 함수로 합성한다. AI/LLM inject ❌ (STRONG-STOP /
//   feedback_chain_driver_deterministic_axis) — 결정론 lookup 만. 부분 evidence(Story/Epic 부재 등)에
//   graceful: 못 찾은 line 은 생략한다(없는 관계를 날조 ❌ / no-simulation 정직 경계).

// ticket_cascade.subtasks 에서 task_id 매칭 (없으면 null).
function findSubtask(subtasks, taskId) {
	return subtasks.find((s) => s && s.task_id === taskId) || null;
}

// Story 해소: 1차 = self subtask 의 parent(parent_kind==='story'), 2차 = task.behavior_ref 매칭.
function resolveStory(stories, self, behaviorRef) {
	if (self && self.parent_kind === 'story' && self.parent_jira_id) {
		const byParent = stories.find((s) => s && s.jira_id === self.parent_jira_id);
		if (byParent) return byParent;
	}
	if (behaviorRef) {
		const byBhv = stories.find((s) => s && s.behavior_ref === behaviorRef);
		if (byBhv) return byBhv;
	}
	return null;
}

/**
 * 결정론 linkage block (Markdown) 생성.
 * @param {Object} params
 * @param {Object} params.task     task-plan.tasks[id] (id / title / layer / behavior_ref / dependencies / ac_refs).
 * @param {Object} params.evidence ticket-sync-evidence (ticket_cascade.{epics,stories,subtasks}). 부재/부분 허용.
 * @param {string} params.jiraKey  이 task 의 Jira Sub-task 키 (브랜치명 SSOT).
 * @returns {string} Markdown linkage block (trailing \n 포함).
 */
export function buildLinkageBlock({ task, evidence, jiraKey }) {
	const cascade = (evidence && evidence.ticket_cascade) || {};
	const subtasks = Array.isArray(cascade.subtasks) ? cascade.subtasks : [];
	const stories = Array.isArray(cascade.stories) ? cascade.stories : [];
	const epics = Array.isArray(cascade.epics) ? cascade.epics : [];

	const self = findSubtask(subtasks, task.id);
	const lines = ['## 🔗 연결 (Jira / 자동 생성 · 수동 편집 금지)'];

	// 이 PR
	const selfTitle = task.title || (self && self.title) || '';
	const layerSuffix = task.layer ? ` (layer: ${task.layer})` : '';
	lines.push(`- 이 PR: ${jiraKey}${selfTitle ? ` — ${selfTitle}` : ''}${layerSuffix}`);

	// Story
	const story = resolveStory(stories, self, task.behavior_ref);
	if (story) {
		lines.push(`- Story: ${story.jira_id}${story.title ? ` — ${story.title}` : ''}`);
		// Epic (story.epic_ref = Epic Jira ID)
		if (story.epic_ref) {
			const epic = epics.find((e) => e && e.jira_id === story.epic_ref) || null;
			lines.push(
				`- Epic:  ${story.epic_ref}${epic && epic.title ? ` — ${epic.title}` : ''}`,
			);
		}
		// 형제 Sub-task (같은 Story parent / self 제외)
		const siblings = subtasks
			.filter(
				(s) =>
					s &&
					s.parent_jira_id === story.jira_id &&
					s.task_id !== task.id &&
					s.jira_id,
			)
			.map((s) => s.jira_id);
		if (siblings.length)
			lines.push(`- 형제 Sub-task (같은 Story): ${siblings.join(' / ')}`);
	}

	// 의존 (TASK-id → Jira 키 해소 / 미해소면 TASK-id 그대로 정직 표기)
	const deps = Array.isArray(task.dependencies) ? task.dependencies : [];
	if (deps.length) {
		const depRefs = deps.map((d) => {
			const st = findSubtask(subtasks, d);
			return st && st.jira_id ? st.jira_id : d;
		});
		lines.push(`- 의존: depends-on ${depRefs.join(', ')}`);
	}

	// AC
	const acs = Array.isArray(task.ac_refs) ? task.ac_refs : [];
	if (acs.length) lines.push(`- AC: ${acs.join(', ')}`);

	return lines.join('\n') + '\n';
}
