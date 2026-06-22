// renderers/generic.js — 미지정/미상 artifact fallback. Kit.arrange 만으로 전 키 표시.
//   각 스키마 전용 렌더러가 없을 때 쓰임. (renderer 가 주인 / Kit 은 공유 엔진)
RENDERERS['generic'] = {
	render: function (root, ctx) {
		var data = ctx.data || {};
		// 최상위 키를 그대로 섹션으로 (정의 없음 → arrange 가 label 로 제목).
		var sections = Object.keys(data)
			.filter(function (k) { return ['meta', 'derivation_source', 'cross_links'].indexOf(k) < 0; })
			.map(function (k) { return { key: k, title: Kit.label(k), icon: '•' }; });
		Kit.arrange(root, data, sections, { collapsedDefs: Kit.COLLAPSED });
	},
};
