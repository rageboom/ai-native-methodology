// renderers/unit-spec.js — 유닛(units) + 커버리지 읽기뷰.
//   유닛별 이름 + 종류/출처 칩 + 코드 위치 + 불변/협력 추적 칩 + 테스트 의무. 커버리지 = 통계 블록.
//   추적/통계는 json 기존 값 표시만(계산 ❌). CSS 렌더러 로컬(us-).
RENDERERS['unit-spec'] = {
	sections: [{ key: 'units', title: '유닛', icon: '🧱' }, { key: 'coverage', title: '커버리지', icon: '📊' }],

	ensureStyles: function () {
		if (document.getElementById('us-style')) return;
		var s = Kit.el('style'); s.id = 'us-style';
		s.textContent = [
			'.us-u{border:1px solid #e4e7ee;border-radius:10px;margin:10px 0;background:#fff;overflow:hidden}',
			'.us-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 14px;background:linear-gradient(180deg,#fbfbfe,#f4f6fb);border-bottom:1px solid #eef1f6}',
			'.us-id{font:600 11px ui-monospace,Menlo,monospace;color:#7c3aed}',
			'.us-name{font-weight:700;font-size:13.5px;color:#161b26}',
			'.us-kind{font-size:10.5px;font-weight:700;border-radius:4px;padding:1px 7px;background:#f3e8ff;color:#6b21a8}',
			'.us-prov{font-size:10.5px;color:#717784}',
			'.us-body{padding:6px 14px 12px;font-size:12.5px;color:#444;line-height:1.6}',
			'.us-code{font:600 11.5px ui-monospace,Menlo,monospace;color:#374151;background:#f7f7fb;border-radius:5px;padding:2px 7px;display:inline-block;margin:2px 0}',
			'.us-stale{font-size:10.5px;font-weight:800;color:#b91c1c;margin-left:6px}',
			'.us-trace{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px}',
			'.us-trace-l{font-size:11px;color:#9aa0ac;font-weight:700}',
			'.us-ref{font:600 10.5px ui-monospace,Menlo,monospace;border-radius:4px;padding:1px 7px;background:#f3e8ff;color:#6b21a8}',
			'.us-cov{display:flex;gap:18px;flex-wrap:wrap;padding:12px 14px;border:1px solid #e4e7ee;border-radius:10px;background:#fff}',
			'.us-stat b{display:block;font-size:18px;color:#161b26}.us-stat span{font-size:11px;color:#717784}',
			'.us-empty{font-size:12px;color:#9aa0ac;padding:6px 0}',
		].join('\n');
		document.head.appendChild(s);
	},

	pct: function (v) { return (typeof v === 'number') ? Math.round(v * 100) + '%' : String(v == null ? '—' : v); },
	traceRow: function (u) {
		var refs = [];
		if (Array.isArray(u.invariant_refs) && u.invariant_refs.length) refs.push({ label: '불변', ids: u.invariant_refs });
		if (Array.isArray(u.collaborators) && u.collaborators.length) refs.push({ label: '협력', ids: u.collaborators });
		if (u.behavior_method_ref) refs.push({ label: '← 동작', ids: [u.behavior_method_ref] });
		if (u.bc_ref) refs.push({ label: 'BC', ids: [u.bc_ref] });
		if (!refs.length) return null;
		var row = Kit.el('div', 'us-trace');
		row.appendChild(Kit.el('span', 'us-trace-l', '추적'));
		refs.forEach(function (r) {
			row.appendChild(Kit.el('span', 'us-trace-l', r.label));
			r.ids.forEach(function (id) { row.appendChild(Kit.el('span', 'us-ref', String(id))); });
		});
		return row;
	},

	render: function (root, ctx) {
		this.ensureStyles();
		var self = this;
		var data = ctx.data || {};
		var units = Array.isArray(data.units) ? data.units : [];
		var sec = Kit.section('유닛', '🧱');
		sec.setCount(units.length);
		if (!units.length) sec.el.appendChild(Kit.el('div', 'us-empty', '(유닛이 비어 있습니다)'));
		units.forEach(function (u) {
			var box = Kit.el('div', 'us-u');
			var head = Kit.el('div', 'us-head');
			head.appendChild(Kit.el('span', 'us-id', u.id || ''));
			head.appendChild(Kit.el('span', 'us-name', u.name || ''));
			if (u.kind) head.appendChild(Kit.el('span', 'us-kind', u.kind));
			if (u.provenance) head.appendChild(Kit.el('span', 'us-prov', u.provenance));
			box.appendChild(head);
			var body = Kit.el('div', 'us-body');
			var cp = u.code_pointer;
			if (cp && cp.path) {
				var code = Kit.el('span', 'us-code', cp.path + (cp.symbol ? ' › ' + cp.symbol : ''));
				body.appendChild(code);
				if (cp.stale) body.appendChild(Kit.el('span', 'us-stale', '⚠ 코드 위치 stale'));
			}
			if (u.unit_test_obligation != null) {
				body.appendChild(Kit.el('div', null, '테스트 의무: ' + (typeof u.unit_test_obligation === 'object' ? JSON.stringify(u.unit_test_obligation) : String(u.unit_test_obligation))));
			}
			if (u.waiver_reason) body.appendChild(Kit.el('div', null, '면제 사유: ' + u.waiver_reason));
			var trace = self.traceRow(u); if (trace) body.appendChild(trace);
			box.appendChild(body);
			sec.el.appendChild(box);
		});
		root.appendChild(sec.el);

		var cov = data.coverage;
		if (cov && typeof cov === 'object') {
			var cs = Kit.section('커버리지', '📊');
			var grid = Kit.el('div', 'us-cov');
			[
				{ k: 'obligation_satisfied_ratio', l: '의무 충족', pct: true },
				{ k: 'mutation_score', l: '뮤테이션 점수', pct: true },
				{ k: 'threshold', l: '기준선', pct: true },
				{ k: 'coverage_strategy', l: '전략', pct: false },
			].forEach(function (f) {
				if (cov[f.k] == null) return;
				var st = Kit.el('div', 'us-stat');
				st.appendChild(Kit.el('b', null, f.pct ? self.pct(cov[f.k]) : String(cov[f.k])));
				st.appendChild(Kit.el('span', null, f.l));
				grid.appendChild(st);
			});
			cs.el.appendChild(grid);
			root.appendChild(cs.el);
		}
		Kit.arrange(root, { meta: data.meta, derivation_source: data.derivation_source, cross_links: data.cross_links }, [], { collapsedDefs: Kit.COLLAPSED });
	},
};
