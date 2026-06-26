// renderers/behavior-spec.js — 동작(behaviors) 읽기뷰.
//   raw 필드 나열(Kit.arrange) 대신 "읽히는 동작 명세": 동작별 이름 + 산문 설명 + 전제/결과 블록 +
//   추적 칩(← UC / → AC / BR — json 기존 ref 표시만, 계산/검증 ❌ = traceability-builder 책임).
//   산문 = render-time (persist ❌ / json 단독 SSOT / ADR-011). CSS 는 렌더러 로컬(bs-).
RENDERERS['behavior-spec'] = {
	sections: [{ key: 'behaviors', title: '동작', icon: '⚙️' }],

	ensureStyles: function () {
		if (document.getElementById('bs-style')) return;
		var s = Kit.el('style'); s.id = 'bs-style';
		s.textContent = [
			'.bs-b{border:1px solid #e4e7ee;border-radius:10px;margin:10px 0;background:#fff;overflow:hidden}',
			'.bs-head{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;padding:9px 14px;background:linear-gradient(180deg,#fbfbfe,#f4f6fb);border-bottom:1px solid #eef1f6}',
			'.bs-id{font:600 11px ui-monospace,Menlo,monospace;color:#4f46e5}',
			'.bs-name{font-weight:700;font-size:14px;color:#161b26}',
			'.bs-body{padding:6px 14px 12px}',
			'.bs-desc{margin:6px 0}',
			'.bs-desc .prose{font-size:13px;color:#444;line-height:1.65;display:block;margin:1px 0}',
			'.bs-blk{margin:8px 0;padding:6px 0 6px 12px;border-left:3px solid #e4e7ee}',
			'.bs-blk-l{font-size:11.5px;font-weight:800;color:#3730a3;margin-bottom:4px}',
			'.bs-blk-i{font-size:12.5px;color:#333;line-height:1.6;padding:1px 0}',
			'.bs-trace{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;padding-top:8px;border-top:1px dashed #eef1f6}',
			'.bs-trace-l{font-size:11px;color:#9aa0ac;font-weight:700}',
			'.bs-ref{font:600 10.5px ui-monospace,Menlo,monospace;border-radius:4px;padding:1px 7px}',
			'.bs-ref-uc{background:#eef0ff;color:#3730a3}.bs-ref-ac{background:#e7f6ed;color:#15803d}.bs-ref-br{background:#fff4d6;color:#92600a}',
			'.bs-empty{font-size:12px;color:#9aa0ac;padding:6px 0}',
		].join('\n');
		document.head.appendChild(s);
	},

	// 라벨 블록(전제/결과/불변) — 문자열 배열 → 항목 줄.
	block: function (label, items) {
		if (!Array.isArray(items) || !items.length) return null;
		var b = Kit.el('div', 'bs-blk');
		b.appendChild(Kit.el('div', 'bs-blk-l', label));
		items.forEach(function (it) { b.appendChild(Kit.el('div', 'bs-blk-i', '• ' + String(it))); });
		return b;
	},
	// 추적 칩 줄 — json 기존 ref 배열을 그대로 표시(계산 ❌ / read-only).
	traceRow: function (bhv) {
		var refs = [
			{ k: 'uc', label: '← 유스케이스', arr: bhv.use_case_refs },
			{ k: 'ac', label: '→ 인수기준', arr: bhv.acceptance_criteria_refs },
			{ k: 'br', label: '규칙', arr: bhv.br_refs },
		].filter(function (r) { return Array.isArray(r.arr) && r.arr.length; });
		if (!refs.length) return null;
		var row = Kit.el('div', 'bs-trace');
		row.appendChild(Kit.el('span', 'bs-trace-l', '추적'));
		refs.forEach(function (r) {
			row.appendChild(Kit.el('span', 'bs-trace-l', r.label));
			r.arr.forEach(function (id) { row.appendChild(Kit.el('span', 'bs-ref bs-ref-' + r.k, String(id))); });
		});
		return row;
	},

	render: function (root, ctx) {
		this.ensureStyles();
		var self = this;
		var data = ctx.data || {};
		var bhvs = Array.isArray(data.behaviors) ? data.behaviors : [];
		var sec = Kit.section('동작', '⚙️');
		sec.setCount(bhvs.length);
		if (!bhvs.length) sec.el.appendChild(Kit.el('div', 'bs-empty', '(동작이 비어 있습니다)'));
		bhvs.forEach(function (b, i) {
			var base = 'behaviors[' + i + ']';
			var box = Kit.el('div', 'bs-b');
			var head = Kit.el('div', 'bs-head');
			head.appendChild(Kit.el('span', 'bs-id', b.id || ('BHV-' + (i + 1))));
			head.appendChild(Kit.el('span', 'bs-name', b.name || ''));
			box.appendChild(head);
			var body = Kit.el('div', 'bs-body');
			if (b.description) body.appendChild(Kit.proseSentences(b.description, base + '.description', (b.id || '') + ' 설명', 'bs-desc'));
			var pre = self.block('전제 조건 (이 동작 전에 참이어야)', b.preconditions); if (pre) body.appendChild(pre);
			var post = self.block('결과 (이 동작 뒤에 참이 됨)', b.postconditions); if (post) body.appendChild(post);
			var inv = self.block('불변 조건', b.invariants); if (inv) body.appendChild(inv);
			var trace = self.traceRow(b); if (trace) body.appendChild(trace);
			box.appendChild(body);
			sec.el.appendChild(box);
		});
		root.appendChild(sec.el);
		// provenance/구조 섹션은 접어서 뒤로 (기존 동작 보존).
		Kit.arrange(root, { meta: data.meta, derivation_source: data.derivation_source, cross_links: data.cross_links }, [], { collapsedDefs: Kit.COLLAPSED });
	},
};
