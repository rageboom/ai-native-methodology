// renderers/acceptance-criteria.js — 인수 기준. criteria. **bespoke: gherkin 을 Given/When/Then 시나리오로.**
//   나머지 필드는 Kit generic 위임 (렌더러가 주인, 시그니처 구조만 전용).
RENDERERS['acceptance-criteria'] = {
	sections: [{ key: 'criteria', title: '인수 기준', icon: '✅' }],

	// gherkin {given[], when, then[], tags[]} → 시나리오 스텝. 각 스텝 텍스트는 클릭→프롬프트(공유 인터랙션).
	scenarioNode: function (g, base) {
		var wrap = document.createElement('div');
		wrap.className = 'scenario';
		function step(kw, text, anchor) {
			var row = document.createElement('div'); row.className = 'scn-step';
			var k = document.createElement('span'); k.className = 'scn-kw scn-' + kw.toLowerCase(); k.textContent = kw;
			row.appendChild(k);
			row.appendChild(Kit.prose(text == null ? '' : String(text), anchor, '시나리오 · ' + kw));
			return row;
		}
		(g.given || []).forEach(function (t, i) { wrap.appendChild(step('Given', t, base + '.given[' + i + ']')); });
		if (g.when != null) wrap.appendChild(step('When', g.when, base + '.when'));
		(g.then || []).forEach(function (t, i) { wrap.appendChild(step('Then', t, base + '.then[' + i + ']')); });
		if (Array.isArray(g.tags) && g.tags.length) {
			var tg = document.createElement('div'); tg.className = 'scn-tags'; tg.textContent = '🏷 ' + g.tags.join(' ');
			wrap.appendChild(tg);
		}
		return wrap;
	},

	render: function (root, ctx) {
		var self = this;
		Kit.arrange(root, ctx.data || {}, this.sections, {
			collapsedDefs: Kit.COLLAPSED,
			renderCardBody: function (cardApi, item, base) {
				Object.keys(item).forEach(function (k) {
					if (k === 'gherkin' && item.gherkin && typeof item.gherkin === 'object') {
						var lab = document.createElement('div'); lab.className = 'scenario-label'; lab.textContent = '📋 시나리오';
						cardApi.addNode(lab);
						cardApi.addNode(self.scenarioNode(item.gherkin, base + '.gherkin'));
					} else {
						cardApi.addBlock(Kit.blockify(item[k], base + '.' + k, k));
					}
				});
			},
		});
	},
};
