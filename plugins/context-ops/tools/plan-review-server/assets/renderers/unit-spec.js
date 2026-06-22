// renderers/unit-spec.js — 유닛 (spec stage / unit). units + coverage. generic 배치 위임.
RENDERERS['unit-spec'] = {
	sections: [
		{ key: 'units', title: '유닛', icon: '🧱' },
		{ key: 'coverage', title: '커버리지', icon: '📊' },
	],
	render: function (root, ctx) {
		Kit.arrange(root, ctx.data || {}, this.sections, { collapsedDefs: Kit.COLLAPSED });
	},
};
