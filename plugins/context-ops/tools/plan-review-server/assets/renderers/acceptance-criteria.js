// renderers/acceptance-criteria.js — 인수 기준(criteria) 읽기뷰.
//   기준별 산문 설명 + Given/When/Then 시나리오(style.css 의 scn- 스타일 재사용) + 우선/검증 칩 +
//   추적 칩(← 동작 / ← 유스케이스 / → 테스트케이스 / 규칙 — json 기존 ref 표시만, 계산 ❌).
//   산문 = render-time (persist ❌ / ADR-011). CSS 는 렌더러 로컬(ac-) + scn-(global).
RENDERERS['acceptance-criteria'] = {
	sections: [{ key: 'criteria', title: '인수 기준', icon: '✅' }],

	ensureStyles: function () {
		if (document.getElementById('ac-style')) return;
		var s = Kit.el('style'); s.id = 'ac-style';
		s.textContent = [
			'.ac-c{border:1px solid #e4e7ee;border-radius:10px;margin:10px 0;background:#fff;overflow:hidden}',
			'.ac-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 14px;background:linear-gradient(180deg,#fbfbfe,#f4f6fb);border-bottom:1px solid #eef1f6}',
			'.ac-id{font:600 11px ui-monospace,Menlo,monospace;color:#15803d}',
			'.ac-sev{font-size:10.5px;font-weight:800;border-radius:4px;padding:1px 8px;text-transform:uppercase;letter-spacing:.02em}',
			'.ac-sev-critical{background:#fde2e2;color:#b91c1c}.ac-sev-high{background:#ffe4cc;color:#b45309}.ac-sev-medium{background:#fff4d6;color:#92600a}.ac-sev-low{background:#e7f6ed;color:#15803d}.ac-sev-na{background:#f1f2f5;color:#9aa0ac}',
			'.ac-flag{font-size:10.5px;font-weight:700;border-radius:4px;padding:1px 7px;background:#eef0ff;color:#3730a3}',
			'.ac-flag-off{background:#f1f2f5;color:#9aa0ac}',
			'.ac-body{padding:6px 14px 12px}',
			'.ac-desc{margin:6px 0}',
			'.ac-desc .prose{font-size:13px;color:#444;line-height:1.65;display:block;margin:1px 0}',
			'.ac-scn-l{font-size:11.5px;font-weight:800;color:#3730a3;margin:8px 0 4px}',
			'.ac-trace{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;padding-top:8px;border-top:1px dashed #eef1f6}',
			'.ac-trace-l{font-size:11px;color:#9aa0ac;font-weight:700}',
			'.ac-ref{font:600 10.5px ui-monospace,Menlo,monospace;border-radius:4px;padding:1px 7px;background:#eef0ff;color:#3730a3}',
			'.ac-empty{font-size:12px;color:#9aa0ac;padding:6px 0}',
		].join('\n');
		document.head.appendChild(s);
	},

	// gherkin {given[], when, then[], tags[]} → Given/When/Then 스텝(scn- 스타일 = style.css). 각 스텝 클릭→/apply.
	scenarioNode: function (g, base) {
		var wrap = Kit.el('div', 'scenario');
		function step(kw, text, anchor) {
			var row = Kit.el('div', 'scn-step');
			row.appendChild(Kit.el('span', 'scn-kw scn-' + kw.toLowerCase(), kw));
			row.appendChild(Kit.prose(text == null ? '' : String(text), anchor, '시나리오 · ' + kw));
			return row;
		}
		(g.given || []).forEach(function (t, i) { wrap.appendChild(step('Given', t, base + '.given[' + i + ']')); });
		if (g.when != null) wrap.appendChild(step('When', g.when, base + '.when'));
		(g.then || []).forEach(function (t, i) { wrap.appendChild(step('Then', t, base + '.then[' + i + ']')); });
		if (Array.isArray(g.tags) && g.tags.length) wrap.appendChild(Kit.el('div', 'scn-tags', '🏷 ' + g.tags.join(' ')));
		return wrap;
	},
	flag: function (on, label) {
		return Kit.el('span', 'ac-flag' + (on ? '' : ' ac-flag-off'), (on ? '✓ ' : '✕ ') + label);
	},
	traceRow: function (c) {
		var refs = [];
		if (c.behavior_ref) refs.push({ label: '← 동작', ids: [c.behavior_ref] });
		if (c.use_case_ref) refs.push({ label: '← 유스케이스', ids: [c.use_case_ref] });
		if (Array.isArray(c.test_case_refs) && c.test_case_refs.length) refs.push({ label: '→ 테스트', ids: c.test_case_refs });
		if (Array.isArray(c.related_brs) && c.related_brs.length) refs.push({ label: '규칙', ids: c.related_brs });
		if (!refs.length) return null;
		var row = Kit.el('div', 'ac-trace');
		row.appendChild(Kit.el('span', 'ac-trace-l', '추적'));
		refs.forEach(function (r) {
			row.appendChild(Kit.el('span', 'ac-trace-l', r.label));
			r.ids.forEach(function (id) { row.appendChild(Kit.el('span', 'ac-ref', String(id))); });
		});
		return row;
	},

	render: function (root, ctx) {
		this.ensureStyles();
		var self = this;
		var data = ctx.data || {};
		var crits = Array.isArray(data.criteria) ? data.criteria : [];
		var sec = Kit.section('인수 기준', '✅');
		sec.setCount(crits.length);
		if (!crits.length) sec.el.appendChild(Kit.el('div', 'ac-empty', '(인수 기준이 비어 있습니다)'));
		crits.forEach(function (c, i) {
			var base = 'criteria[' + i + ']';
			var box = Kit.el('div', 'ac-c');
			var head = Kit.el('div', 'ac-head');
			head.appendChild(Kit.el('span', 'ac-id', c.id || ('AC-' + (i + 1))));
			var sev = (c.severity || 'na').toLowerCase();
			head.appendChild(Kit.el('span', 'ac-sev ac-sev-' + (/(critical|high|medium|low)/.test(sev) ? sev : 'na'), c.severity || '미분류'));
			head.appendChild(self.flag(c.verifiable !== false, '검증가능'));
			if (c.automated_runnable != null) head.appendChild(self.flag(!!c.automated_runnable, '자동실행'));
			box.appendChild(head);
			var body = Kit.el('div', 'ac-body');
			if (c.description) body.appendChild(Kit.proseSentences(c.description, base + '.description', (c.id || '') + ' 설명', 'ac-desc'));
			if (c.gherkin && typeof c.gherkin === 'object') {
				body.appendChild(Kit.el('div', 'ac-scn-l', '📋 시나리오'));
				body.appendChild(self.scenarioNode(c.gherkin, base + '.gherkin'));
			}
			var trace = self.traceRow(c); if (trace) body.appendChild(trace);
			box.appendChild(body);
			sec.el.appendChild(box);
		});
		root.appendChild(sec.el);
		Kit.arrange(root, { meta: data.meta, derivation_source: data.derivation_source, cross_links: data.cross_links }, [], { collapsedDefs: Kit.COLLAPSED });
	},
};
