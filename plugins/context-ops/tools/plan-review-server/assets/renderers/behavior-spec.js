// renderers/behavior-spec.js — 동작. behaviors. generic 배치 위임(향후 시퀀스/상태전이 bespoke 자리).
RENDERERS['behavior-spec'] = {
	sections: [{ key: 'behaviors', title: '동작', icon: '⚙️' }],
	render: function (root, ctx) {
		Kit.arrange(root, ctx.data || {}, this.sections, { collapsedDefs: Kit.COLLAPSED });
	},
};
