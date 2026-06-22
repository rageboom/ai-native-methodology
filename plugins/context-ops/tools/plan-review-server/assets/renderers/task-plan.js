// renderers/task-plan.js — 작업 계획. 작업/ADR/위험/NFR…. 현재는 generic 배치 위임(향후 bespoke 자리).
RENDERERS['task-plan'] = {
	sections: [
		{ key: 'tasks', title: '작업', icon: '📋' },
		{ key: 'adrs', title: '설계 결정 (ADR)', icon: '🏛' },
		{ key: 'risks', title: '위험', icon: '⚠️' },
		{ key: 'nfr_allocation', title: '비기능 요구 (NFR)', icon: '📐' },
		{ key: 'sp_conversions', title: 'SP 전환', icon: '🔁' },
		{ key: 'rollback_strategy', title: '롤백 전략', icon: '↩️' },
		{ key: 'epic_refs', title: 'Epic', icon: '🗂' },
		{ key: 'story_refs', title: 'Story', icon: '📕' },
		{ key: 'op_task_refs', title: '운영 작업', icon: '🛠' },
	],
	render: function (root, ctx) {
		Kit.arrange(root, ctx.data || {}, this.sections, { collapsedDefs: Kit.COLLAPSED });
	},
};
