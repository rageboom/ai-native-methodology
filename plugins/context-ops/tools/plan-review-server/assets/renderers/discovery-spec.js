// renderers/discovery-spec.js — 발견. 의도/유스케이스/규칙의도/계약/NFR/위험/결정…. generic 배치 위임.
RENDERERS['discovery-spec'] = {
	sections: [
		{ key: 'intent_summary', title: '의도 요약', icon: '🧭' },
		{ key: 'business_intent', title: '비즈니스 의도', icon: '🎯' },
		{ key: 'use_cases', title: '유스케이스', icon: '🧩' },
		{ key: 'business_rules_intent', title: '비즈니스 규칙 의도', icon: '📜' },
		{ key: 'io_contracts', title: 'I/O 계약', icon: '🔌' },
		{ key: 'nfr', title: '비기능 요구 (NFR)', icon: '📐' },
		{ key: 'risks_and_constraints', title: '위험·제약', icon: '⚠️' },
		{ key: 'decisions', title: '결정', icon: '🏛' },
		{ key: 'pending_decisions', title: '보류 결정', icon: '🕗' },
		{ key: 'out_of_scope', title: '범위 외', icon: '🚫' },
		{ key: 'excluded_antipatterns', title: '제외 안티패턴', icon: '🛑' },
	],
	render: function (root, ctx) {
		Kit.arrange(root, ctx.data || {}, this.sections, { collapsedDefs: Kit.COLLAPSED });
	},
};
