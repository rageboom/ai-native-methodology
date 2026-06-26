// renderers/task-plan.js — 작업 계획 읽기뷰.
//   상단 한눈 요약(작업/ADR/위험/NFR 수) → 작업(실행순 정렬 + 산문 + 의존성 + 추적) →
//   설계결정 ADR(완전문 산문 / Nygard) → 위험 → 비기능요구 NFR. 추적 칩 = json 기존 ref 표시만(계산 ❌).
//   산문 = render-time (persist ❌ / ADR-011). CSS 렌더러 로컬(tp-).
RENDERERS['task-plan'] = {
	sections: [
		{ key: 'tasks', title: '작업', icon: '📋' }, { key: 'adrs', title: '설계 결정 (ADR)', icon: '🏛' },
		{ key: 'risks', title: '위험', icon: '⚠️' }, { key: 'nfr_allocation', title: '비기능 요구 (NFR)', icon: '📐' },
	],

	ensureStyles: function () {
		if (document.getElementById('tp-style')) return;
		var s = Kit.el('style'); s.id = 'tp-style';
		s.textContent = [
			'.tp-tldr{display:flex;gap:16px;flex-wrap:wrap;background:linear-gradient(180deg,#eef2ff,#f8f9ff);border:1px solid #c9cdf7;border-radius:12px;padding:14px 18px;margin:2px 0 16px}',
			'.tp-tldr .tp-stat b{display:block;font-size:20px;color:#312e81}.tp-tldr .tp-stat span{font-size:11px;color:#4b5563}',
			'.tp-c{border:1px solid #e4e7ee;border-radius:10px;margin:10px 0;background:#fff;overflow:hidden}',
			'.tp-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 14px;background:linear-gradient(180deg,#fbfbfe,#f4f6fb);border-bottom:1px solid #eef1f6}',
			'.tp-ord{font:800 11px ui-monospace,Menlo,monospace;color:#fff;background:#4f46e5;border-radius:50%;min-width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;padding:0 5px}',
			'.tp-id{font:600 11px ui-monospace,Menlo,monospace;color:#4f46e5}',
			'.tp-title{font-weight:700;font-size:14px;color:#161b26}',
			'.tp-layer{font-size:10.5px;font-weight:700;border-radius:4px;padding:1px 8px;background:#eef0ff;color:#3730a3}',
			'.tp-body{padding:6px 14px 12px}',
			'.tp-desc{margin:6px 0}',
			'.tp-desc .prose{font-size:13px;color:#444;line-height:1.65;display:block;margin:1px 0}',
			'.tp-blk{margin:8px 0;padding:6px 0 6px 12px;border-left:3px solid #e4e7ee}',
			'.tp-blk-l{font-size:11.5px;font-weight:800;color:#3730a3;margin-bottom:4px}',
			'.tp-blk .prose,.tp-blk-i{font-size:12.5px;color:#333;line-height:1.6;display:block;padding:1px 0}',
			'.tp-status{font-size:10.5px;font-weight:800;border-radius:4px;padding:1px 8px;text-transform:uppercase;background:#e7f6ed;color:#15803d}',
			'.tp-sev{font-size:10.5px;font-weight:800;border-radius:4px;padding:1px 8px;text-transform:uppercase}',
			'.tp-sev-critical{background:#fde2e2;color:#b91c1c}.tp-sev-high{background:#ffe4cc;color:#b45309}.tp-sev-medium{background:#fff4d6;color:#92600a}.tp-sev-low{background:#e7f6ed;color:#15803d}.tp-sev-na{background:#f1f2f5;color:#9aa0ac}',
			'.tp-trace{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;padding-top:8px;border-top:1px dashed #eef1f6}',
			'.tp-trace-l{font-size:11px;color:#9aa0ac;font-weight:700}',
			'.tp-ref{font:600 10.5px ui-monospace,Menlo,monospace;border-radius:4px;padding:1px 7px;background:#eef0ff;color:#3730a3}',
			'.tp-dep{background:#fff4d6;color:#92600a}',
			'.tp-empty{font-size:12px;color:#9aa0ac;padding:6px 0}',
		].join('\n');
		document.head.appendChild(s);
	},

	sevClass: function (v) { v = String(v || 'na').toLowerCase(); return 'tp-sev-' + (/(critical|high|medium|low)/.test(v) ? v : 'na'); },
	// 값(문자열 | 배열 | 객체) → 라벨 블록. 문자열은 산문, 배열은 항목줄.
	block: function (label, val, anchor, ctxLabel) {
		if (val == null || (Array.isArray(val) && !val.length)) return null;
		var b = Kit.el('div', 'tp-blk');
		b.appendChild(Kit.el('div', 'tp-blk-l', label));
		if (Array.isArray(val)) {
			val.forEach(function (it) {
				if (it && typeof it === 'object') b.appendChild(Kit.el('div', 'tp-blk-i', '• ' + (it.option || it.title || it.name || JSON.stringify(it))));
				else b.appendChild(Kit.el('div', 'tp-blk-i', '• ' + String(it)));
			});
		} else if (typeof val === 'object') {
			b.appendChild(Kit.el('div', 'tp-blk-i', JSON.stringify(val)));
		} else {
			b.appendChild(Kit.proseSentences(val, anchor, ctxLabel));
		}
		return b;
	},
	chips: function (parent, label, ids, cls) {
		if (!Array.isArray(ids) || !ids.length) return;
		parent.appendChild(Kit.el('span', 'tp-trace-l', label));
		ids.forEach(function (id) { parent.appendChild(Kit.el('span', 'tp-ref' + (cls ? ' ' + cls : ''), String(id))); });
	},

	renderTasks: function (root, data) {
		var self = this;
		var tasks = (Array.isArray(data.tasks) ? data.tasks : []).slice()
			.sort(function (a, b) { return (a.execution_order || 0) - (b.execution_order || 0); });
		var sec = Kit.section('작업 (실행 순서)', '📋');
		sec.setCount(tasks.length);
		if (!tasks.length) sec.el.appendChild(Kit.el('div', 'tp-empty', '(작업이 비어 있습니다)'));
		// base 는 정렬 전 인덱스가 필요 → id→원본 인덱스 매핑.
		var idxById = {}; (data.tasks || []).forEach(function (t, i) { idxById[t.id] = i; });
		tasks.forEach(function (t) {
			var i = idxById[t.id] != null ? idxById[t.id] : 0;
			var base = 'tasks[' + i + ']';
			var box = Kit.el('div', 'tp-c');
			var head = Kit.el('div', 'tp-head');
			if (t.execution_order != null) head.appendChild(Kit.el('span', 'tp-ord', String(t.execution_order)));
			head.appendChild(Kit.el('span', 'tp-id', t.id || ''));
			head.appendChild(Kit.el('span', 'tp-title', t.title || ''));
			if (t.layer) head.appendChild(Kit.el('span', 'tp-layer', t.layer));
			box.appendChild(head);
			var body = Kit.el('div', 'tp-body');
			if (t.description) body.appendChild(Kit.proseSentences(t.description, base + '.description', (t.id || '') + ' 설명', 'tp-desc'));
			var trace = Kit.el('div', 'tp-trace');
			trace.appendChild(Kit.el('span', 'tp-trace-l', '추적'));
			self.chips(trace, '의존', t.dependencies, 'tp-dep');
			self.chips(trace, '← 인수기준', t.ac_refs);
			if (t.behavior_ref) self.chips(trace, '← 동작', [t.behavior_ref]);
			self.chips(trace, '→ 테스트', t.tc_refs);
			if (trace.children.length > 1) body.appendChild(trace);
			box.appendChild(body);
			sec.el.appendChild(box);
		});
		root.appendChild(sec.el);
	},

	renderAdrs: function (root, data) {
		var self = this;
		var adrs = Array.isArray(data.adrs) ? data.adrs : [];
		if (!adrs.length) return;
		var sec = Kit.section('설계 결정 (ADR)', '🏛');
		sec.setCount(adrs.length);
		adrs.forEach(function (a, i) {
			var base = 'adrs[' + i + ']';
			var box = Kit.el('div', 'tp-c');
			var head = Kit.el('div', 'tp-head');
			head.appendChild(Kit.el('span', 'tp-id', a.id || ''));
			head.appendChild(Kit.el('span', 'tp-title', a.title || ''));
			if (a.status) head.appendChild(Kit.el('span', 'tp-status', a.status));
			box.appendChild(head);
			var body = Kit.el('div', 'tp-body');
			var dec = self.block('결정', a.decision, base + '.decision', (a.id || '') + ' 결정'); if (dec) body.appendChild(dec);
			var alt = self.block('고려한 대안', a.alternatives, base + '.alternatives', (a.id || '') + ' 대안'); if (alt) body.appendChild(alt);
			var con = self.block('영향 (consequences)', a.consequences, base + '.consequences', (a.id || '') + ' 영향'); if (con) body.appendChild(con);
			if (Array.isArray(a.behavior_refs) && a.behavior_refs.length) {
				var tr = Kit.el('div', 'tp-trace'); tr.appendChild(Kit.el('span', 'tp-trace-l', '추적'));
				self.chips(tr, '← 동작', a.behavior_refs); body.appendChild(tr);
			}
			box.appendChild(body);
			sec.el.appendChild(box);
		});
		root.appendChild(sec.el);
	},

	renderRisks: function (root, data) {
		var self = this;
		var risks = Array.isArray(data.risks) ? data.risks : [];
		if (!risks.length) return;
		var sec = Kit.section('위험', '⚠️');
		sec.setCount(risks.length);
		risks.forEach(function (r, i) {
			var base = 'risks[' + i + ']';
			var box = Kit.el('div', 'tp-c');
			var head = Kit.el('div', 'tp-head');
			head.appendChild(Kit.el('span', 'tp-id', r.id || ''));
			head.appendChild(Kit.el('span', 'tp-sev ' + self.sevClass(r.severity), r.severity || '미분류'));
			if (r.type) head.appendChild(Kit.el('span', 'tp-layer', r.type));
			box.appendChild(head);
			var body = Kit.el('div', 'tp-body');
			if (r.description) body.appendChild(Kit.proseSentences(r.description, base + '.description', (r.id || '') + ' 위험', 'tp-desc'));
			var mit = self.block('완화 방안', r.mitigation, base + '.mitigation', (r.id || '') + ' 완화'); if (mit) body.appendChild(mit);
			box.appendChild(body);
			sec.el.appendChild(box);
		});
		root.appendChild(sec.el);
	},

	renderNfr: function (root, data) {
		var self = this;
		var nfrs = Array.isArray(data.nfr_allocation) ? data.nfr_allocation : [];
		if (!nfrs.length) return;
		var sec = Kit.section('비기능 요구 (NFR)', '📐');
		sec.setCount(nfrs.length);
		nfrs.forEach(function (n, i) {
			var base = 'nfr_allocation[' + i + ']';
			var box = Kit.el('div', 'tp-c');
			var head = Kit.el('div', 'tp-head');
			head.appendChild(Kit.el('span', 'tp-id', n.id || ''));
			head.appendChild(Kit.el('span', 'tp-title', n.characteristic || ''));
			head.appendChild(Kit.el('span', 'tp-sev ' + self.sevClass(n.severity), n.severity || '미분류'));
			box.appendChild(head);
			var body = Kit.el('div', 'tp-body');
			if (n.description) body.appendChild(Kit.proseSentences(n.description, base + '.description', (n.id || '') + ' NFR', 'tp-desc'));
			if (n.measurement) { var m = self.block('측정 기준', n.measurement, base + '.measurement', (n.id || '') + ' 측정'); if (m) body.appendChild(m); }
			if (Array.isArray(n.task_refs) && n.task_refs.length) {
				var tr = Kit.el('div', 'tp-trace'); tr.appendChild(Kit.el('span', 'tp-trace-l', '추적'));
				self.chips(tr, '→ 작업', n.task_refs); body.appendChild(tr);
			}
			box.appendChild(body);
			sec.el.appendChild(box);
		});
		root.appendChild(sec.el);
	},

	render: function (root, ctx) {
		this.ensureStyles();
		var data = ctx.data || {};
		// 한눈 요약(TL;DR).
		var tldr = Kit.el('div', 'tp-tldr');
		[
			{ n: (data.tasks || []).length, l: '작업' }, { n: (data.adrs || []).length, l: '설계결정' },
			{ n: (data.risks || []).length, l: '위험' }, { n: (data.nfr_allocation || []).length, l: '비기능요구' },
		].forEach(function (x) {
			var st = Kit.el('div', 'tp-stat'); st.appendChild(Kit.el('b', null, String(x.n))); st.appendChild(Kit.el('span', null, x.l)); tldr.appendChild(st);
		});
		root.appendChild(tldr);
		this.renderTasks(root, data);
		this.renderAdrs(root, data);
		this.renderRisks(root, data);
		this.renderNfr(root, data);
		Kit.arrange(root, { meta: data.meta, derivation_source: data.derivation_source, cross_links: data.cross_links }, [], { collapsedDefs: Kit.COLLAPSED });
	},
};
