// renderers/discovery-draft.js — 게이트①(DEC-2026-06-25-discovery-2-gate) "방향·범위 확정" 초안 뷰.
//   같은 discovery-spec.json 을 raw 필드 나열(discovery-spec.js) 대신 "읽히는 초안" 으로 렌더:
//     상단 초안 배너  ① 배경·목적(출처 배너 + 산문 + 라벨 블록)  ② 이번 범위 — 공유 묶음(같은 규칙/API/코드 쓰는
//     유스케이스 클러스터 + 범위 체크 + 난이도)  ③ 충돌 해소  ④ 확인할 질문  ⑤ 확정 바(POST /confirm-scope)
//   "공유 묶음" = uc_dependencies.signal=shared_ref 의 shared[] 토큰을 연결요소로 클러스터링(검토 보조 / 인과 아님).
//   산문 = render-time 생성(persist ❌ / json 단독 SSOT / ADR-011). 선택 flow-back = 사람 소유 필드만 직접 write.
(function () {
	function el(tag, cls, text) {
		var n = document.createElement(tag);
		if (cls) n.className = cls;
		if (text != null) n.textContent = text;
		return n;
	}
	// 산문 한 덩이 — 클릭 시 기존 /apply 프롬프트 팝오버(자유 의견). anchor = 실제 JSON path.
	function prose(text, anchor, label) {
		if (window.Kit && typeof Kit.prose === 'function') return Kit.prose(text, anchor, label);
		return el('div', 'prose', String(text));
	}
	// 문장 단위로 줄바꿈 — 마침표 뒤에서 끊어 각 문장을 한 줄로(인식 개선). 클릭 시 같은 anchor /apply.
	function proseSentences(text, anchor, label) {
		var wrap = el('div', 'dd-desc');
		var sents = String(text).split(/(?<=\.)\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
		if (sents.length <= 1) { wrap.appendChild(prose(text, anchor, label)); return wrap; }
		sents.forEach(function (s) { wrap.appendChild(prose(s, anchor, label)); });
		return wrap;
	}
	function ensureStyles() {
		if (document.getElementById('dd-style')) return;
		var s = el('style');
		s.id = 'dd-style';
		s.textContent = [
			// 상단 초안 배너 (이게 초안임을 크게)
			'.dd-draft-head{background:linear-gradient(180deg,#eef2ff,#f8f9ff);border:1px solid #c9cdf7;border-radius:12px;padding:16px 18px;margin:2px 0 18px}',
			'.dd-draft-title{font-size:20px;font-weight:800;color:#312e81;letter-spacing:-.01em}',
			'.dd-draft-tag{font-size:12px;font-weight:800;background:#4f46e5;color:#fff;border-radius:6px;padding:2px 9px;margin-left:8px;vertical-align:middle}',
			'.dd-draft-sub{font-size:13px;color:#4b5563;margin-top:7px;line-height:1.6}',
			// 배경·목적
			'.dd-lead{font-size:14px;color:#333;margin:2px 0 6px;line-height:1.7}',
			'.dd-rank{font-size:12px;color:#717784;margin:0 0 10px}',
			'.dd-rank b{color:#b91c1c}',
			'.dd-block{margin:10px 0;padding:8px 0 8px 13px;border-left:3px solid #c9cdf7}',
			'.dd-block-label{font-size:12px;font-weight:800;color:#3730a3;margin-bottom:5px}',
			'.dd-block-item{font-size:13px;color:#333;line-height:1.6;padding:2px 0}',
			// 읽는 법
			'.dd-howto{font-size:12.5px;color:#444;background:#fafbfd;border:1px solid #eef1f6;border-radius:8px;padding:10px 14px;margin:8px 0 14px}',
			'.dd-howto-t{font-weight:800;color:#161b26;margin-bottom:5px}',
			'.dd-howto ul{margin:0;padding-left:18px}',
			'.dd-howto li{margin:3px 0;line-height:1.6}',
			'.dd-howto b{color:#161b26}',
			// 묶음
			'.dd-group{border:1px solid #e4e7ee;border-radius:10px;margin:12px 0;background:#fff;overflow:hidden}',
			'.dd-group-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:9px 14px;background:linear-gradient(180deg,#fbfbfe,#f4f6fb);border-bottom:1px solid #eef1f6;font-size:13px}',
			'.dd-group-cat{font-size:10.5px;font-weight:800;color:#3730a3;background:#eef0ff;border-radius:4px;padding:1px 7px}',
			'.dd-group-name{font:600 12.5px ui-monospace,Menlo,monospace;color:#161b26}',
			'.dd-group-n{color:#717784;font-size:12px}',
			'.dd-link{font-size:11px;font-weight:800;border-radius:5px;padding:1px 8px;margin-left:auto}',
			'.dd-link-strong{background:#e0e7ff;color:#3730a3}',
			'.dd-link-weak{background:#f1f2f5;color:#717784}',
			'.dd-share{font-size:11.5px;color:#6b6f7a;background:#fafbfd;padding:6px 14px;border-bottom:1px solid #f3f4f7;line-height:1.6}',
			'.dd-share b{color:#3730a3}',
			// 유스케이스 행
			'.dd-uc{display:flex;align-items:flex-start;gap:9px;padding:9px 14px;border-bottom:1px solid #f4f6fb}',
			'.dd-uc:last-child{border-bottom:0}',
			'.dd-uc.out{opacity:.45}',
			'.dd-uc input[type=checkbox]{margin-top:3px;flex:0 0 auto;width:16px;height:16px}',
			'.dd-uc-body{flex:1 1 auto;min-width:0}',
			'.dd-uc-line{display:flex;align-items:center;gap:9px;flex-wrap:wrap}',
			'.dd-uc-id{font:600 11px ui-monospace,Menlo,monospace;color:#4f46e5}',
			'.dd-uc-name{font-weight:600;font-size:13.5px}',
			'.dd-desc{margin-top:3px}',
			'.dd-desc .prose{font-size:12.5px;color:#555;line-height:1.6;display:block;margin:1px 0}',
			'.dd-diff{font-size:11px;font-weight:700;border-radius:4px;padding:1px 7px;white-space:nowrap}',
			'.dd-diff-S{background:#e7f6ed;color:#15803d}.dd-diff-M{background:#fff4d6;color:#92600a}.dd-diff-L{background:#fde2e2;color:#b91c1c}.dd-diff-na{background:#f1f2f5;color:#9aa0ac}',
			'.dd-indep>summary{cursor:pointer;font-size:13px;font-weight:650;color:#555;padding:8px 2px;user-select:none}',
			'.dd-addnew{border:1px dashed #c9cdf7;border-radius:10px;margin:12px 0;background:#fbfcff}',
			'.dd-addnew>summary{cursor:pointer;font-size:13px;font-weight:700;color:#4f46e5;padding:10px 14px;user-select:none}',
			'.dd-addform{padding:0 14px 12px;display:flex;flex-direction:column;gap:7px}',
			'.dd-addform button{align-self:flex-start;font:inherit;font-weight:700;background:#4f46e5;color:#fff;border:0;border-radius:7px;padding:7px 14px;cursor:pointer}',
			'.dd-newbadge{font-size:10.5px;font-weight:800;background:#dcfce7;color:#15803d;border-radius:4px;padding:1px 7px;flex:0 0 auto;margin-top:2px}',
			'.dd-del{font:inherit;font-size:11px;background:transparent;border:1px solid #e0c0c0;color:#b91c1c;border-radius:6px;padding:1px 8px;cursor:pointer;margin-left:6px}',
			'.dd-desc-plain{font-size:12.5px;color:#555;line-height:1.6;margin-top:3px}',
			'.dd-conflict{border:1px solid #f1d9b5;border-radius:10px;padding:10px 14px;margin:8px 0;background:#fffdf7}',
			'.dd-class{font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:.03em}',
			'.dd-q{border:1px solid #e4e7ee;border-radius:10px;padding:10px 14px;margin:8px 0;background:#fff}',
			'.dd-q-cat{font-size:11px;font-weight:700;color:#717784}',
			'.dd-input{width:100%;box-sizing:border-box;font:inherit;font-size:13px;padding:6px 8px;margin-top:6px;border:1px solid #d6dae3;border-radius:7px}',
			'.dd-row{display:flex;gap:10px;align-items:center;margin-top:6px;font-size:12px}',
			'.dd-confirm-bar{position:sticky;bottom:0;background:#fff;border-top:2px solid #4f46e5;padding:12px 4px;margin-top:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
			'.dd-confirm-bar button{font:inherit;font-weight:700;background:#4f46e5;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer}',
			'.dd-confirm-bar button:disabled{opacity:.5;cursor:default}',
			'.dd-confirm-note{font-size:12px;color:#555}',
			'.dd-confirm-ok{background:#ecfdf5;border:1px solid #b7e4c7;color:#14532d;border-radius:8px;padding:8px 14px;font-size:13px;margin-top:8px}',
		].join('\n');
		document.head.appendChild(s);
	}

	var DIFF_NAME = { S: '낮음', M: '중간', L: '높음' };
	function diffChip(d) {
		if (!d || d.degraded) return el('span', 'dd-diff dd-diff-na', '난이도 —');
		return el('span', 'dd-diff dd-diff-' + d.bucket, '난이도 ' + (DIFF_NAME[d.bucket] || d.bucket) + ' · 영향 ' + d.impact_count);
	}
	// 공유 토큰 → 카테고리별 정리(규칙/API/코드), 코드 경로는 파일명만 + 개수 캡.
	function summarizeShared(tokens) {
		var brs = [], apis = [], srcs = [];
		tokens.forEach(function (t) {
			if (t.indexOf('br:') === 0) brs.push(t.slice(3));
			else if (t.indexOf('api:') === 0) apis.push(t.slice(4));
			else srcs.push(t.slice(4).split('/').pop());
		});
		var parts = [];
		if (brs.length) parts.push({ cat: '규칙', txt: brs.join(', ') });
		if (apis.length) parts.push({ cat: 'API', txt: apis.join(', ') });
		if (srcs.length) parts.push({ cat: '코드', txt: srcs.slice(0, 2).join(', ') + (srcs.length > 2 ? ' 외 ' + (srcs.length - 2) + '곳' : '') });
		return { parts: parts, title: brs[0] || apis[0] || srcs[0] || null };
	}

	// 상단 — 이게 "초안" 임을 크게 (point 4)
	function renderDraftHeader(root) {
		var box = el('div', 'dd-draft-head');
		var t = el('div', 'dd-draft-title', '발견 단계 초안');
		t.appendChild(el('span', 'dd-draft-tag', '초안 · 방향 확인'));
		box.appendChild(t);
		box.appendChild(el('div', 'dd-draft-sub', '아직 최종 명세가 아닙니다. 먼저 방향과 범위를 함께 맞추는 초안입니다 — 아래에서 이번에 다룰 유스케이스를 고르고(범위 체크) 확정하면, 선택한 것만 상세 명세를 채워 최종 검토(게이트②)로 갑니다.'));
		root.appendChild(box);
	}

	var DSRC = {
		'legacy-extraction': '<b>기존 코드에서 추출</b> — 아래 유스케이스 = <b>지금 시스템이 하는 일</b>(이미 있는 동작). 새로 만들거나 고칠 것은 아래 범위 체크로 고릅니다.',
		'new-prd': '<b>신규 기획</b> — 아래 유스케이스 = <b>새로 만들</b> 동작.',
		'modification': '<b>기존 동작 수정</b> — 아래 유스케이스 = 바꿀 동작.',
		'bugfix': '<b>버그 수정</b> — 아래 유스케이스 = 고칠 동작.',
	};
	// ① 배경·목적
	function renderIntro(root, data) {
		var sec = Kit.section('배경 · 목적', '🧭');
		var ds = data.derivation_source || {};
		var banner = el('div', 'dd-banner');
		banner.className = 'dd-howto';
		banner.innerHTML = '📑 <b>출처</b>: ' + (DSRC[ds.type] || (ds.type || '미상'));
		sec.el.appendChild(banner);
		var bi = data.business_intent || {};
		var lead = el('div', 'dd-lead');
		lead.appendChild(prose(bi.domain_purpose || data.intent_summary || '(도메인 목적이 적혀 있지 않습니다)', 'business_intent.domain_purpose', '도메인 목적'));
		sec.el.appendChild(lead);
		if ((bi.stakeholders || []).length) {
			var b1 = el('div', 'dd-block');
			b1.appendChild(el('div', 'dd-block-label', '이해관계자 (이 일에 관련된 사람·조직)'));
			bi.stakeholders.forEach(function (s) { b1.appendChild(el('div', 'dd-block-item', '👤 ' + s)); });
			sec.el.appendChild(b1);
		}
		if ((bi.success_criteria || []).length) {
			var b2 = el('div', 'dd-block');
			b2.appendChild(el('div', 'dd-block-label', '성공 기준 (이게 되면 성공)'));
			bi.success_criteria.forEach(function (s) { b2.appendChild(el('div', 'dd-block-item', '✓ ' + s)); });
			sec.el.appendChild(b2);
		}
		root.appendChild(sec.el);
	}

	// ② 이번 범위 — 공유 묶음 (transitively 엮인 유스케이스 클러스터 = 한 묶음)
	function renderScopeGroups(root, data, difficulty, sel) {
		var ucs = Array.isArray(data.use_cases) ? data.use_cases : [];
		var idxById = {}, ucById = {};
		ucs.forEach(function (u, i) { idxById[u.id] = i; ucById[u.id] = u; sel.scope[u.id] = u.in_scope !== false; });

		var edges = (data.uc_dependencies || []).filter(function (e) {
			return e.signal === 'shared_ref' && Array.isArray(e.shared) && e.shared.length && ucById[e.from_uc] && ucById[e.to_uc];
		});
		var adj = {};
		edges.forEach(function (e) { (adj[e.from_uc] = adj[e.from_uc] || []).push(e.to_uc); (adj[e.to_uc] = adj[e.to_uc] || []).push(e.from_uc); });
		var seen = {}, comps = [];
		ucs.forEach(function (u) {
			if (!adj[u.id] || seen[u.id]) return;
			var q = [u.id]; seen[u.id] = true; var c = [];
			while (q.length) { var x = q.shift(); c.push(x); (adj[x] || []).forEach(function (y) { if (!seen[y]) { seen[y] = true; q.push(y); } }); }
			comps.push(c);
		});
		var compOf = {}; comps.forEach(function (c, i) { c.forEach(function (id) { compOf[id] = i; }); });
		var compTok = comps.map(function () { return {}; });
		edges.forEach(function (e) { var ci = compOf[e.from_uc]; if (ci == null) return; e.shared.forEach(function (t) { compTok[ci][t] = true; }); });
		var clusters = comps.map(function (c, i) { return { ids: c.slice().sort(), tokens: Object.keys(compTok[i]) }; })
			.sort(function (a, b) { return b.ids.length - a.ids.length || a.ids[0].localeCompare(b.ids[0]); });
		var grouped = {}; clusters.forEach(function (cl) { cl.ids.forEach(function (id) { grouped[id] = true; }); });
		var independent = ucs.filter(function (u) { return !grouped[u.id]; });
		var groupedCount = Object.keys(grouped).length;

		var sec = Kit.section('이번 범위 — 공유 묶음 기준', '🧩');
		var lead = el('div', 'dd-lead');
		lead.innerHTML = '<b>유스케이스 ' + ucs.length + '개</b> 중 <b>' + groupedCount + '개</b>가 같은 규칙·API·코드를 공유해 <b>' + clusters.length + '개 묶음</b>으로 엮입니다 · 나머지 <b>' + independent.length + '개</b>는 독립.';
		sec.el.appendChild(lead);
		var ranked = ucs.map(function (u) { return { u: u, d: difficulty[u.id] }; })
			.filter(function (x) { return x.d && !x.d.degraded; })
			.sort(function (a, b) { return b.d.impact_count - a.d.impact_count; }).slice(0, 3);
		if (ranked.length) {
			var rk = el('div', 'dd-rank');
			rk.innerHTML = '가장 무거운 유스케이스: ' + ranked.map(function (x) { return '<b>' + x.u.id + '</b> (영향 ' + x.d.impact_count + ')'; }).join(' · ');
			sec.el.appendChild(rk);
		}
		// 읽는 법 (체크박스·난이도·묶음·엮임·풀어보기 한 곳에서 설명)
		var howto = el('div', 'dd-howto');
		howto.appendChild(el('div', 'dd-howto-t', '읽는 법'));
		var ul = el('ul');
		[
			'<b>☑ 이번 범위</b> = 이번 작업에 포함할 유스케이스. 해제하면 이번엔 제외(나중에). 확정하면 체크한 것만 상세 명세를 채웁니다.',
			'<b>난이도</b> = 이 유스케이스가 건드리는 하위 산출물 수. 많을수록 무겁습니다.',
			'<b>묶음</b> = 같은 규칙·API·코드를 써서 함께 검토하면 좋은 유스케이스. <b>강하게 엮임</b> = 같은 규칙/API 공유(하나 바꾸면 다른 것도 영향 가능성↑) · <b>약하게 엮임</b> = 같은 코드 위치만 공유. (엮임 = 검토 보조이지 인과 의존이 아닙니다.)',
			'설명을 <b>더 풀어 보고 싶으면</b> 그 문장을 클릭해 "더 풀어서, 비전문가도 알게 다시 써줘"라고 적으세요. 확정할 때 AI가 다시 씁니다.',
		].forEach(function (h) { var li = el('li'); li.innerHTML = h; ul.appendChild(li); });
		howto.appendChild(ul);
		sec.el.appendChild(howto);

		function setScope(id, val) {
			sel.scope[id] = val;
			Array.prototype.forEach.call(sec.el.querySelectorAll('input[data-uc="' + id + '"]'), function (b) { b.checked = val; });
			Array.prototype.forEach.call(sec.el.querySelectorAll('.dd-uc[data-uc="' + id + '"]'), function (r) { r.className = 'dd-uc' + (val ? '' : ' out'); });
		}
		function ucRow(u) {
			var inScope = sel.scope[u.id];
			var row = el('div', 'dd-uc' + (inScope ? '' : ' out'));
			row.dataset.uc = u.id;
			var cb = el('input'); cb.type = 'checkbox'; cb.checked = inScope; cb.dataset.uc = u.id;
			cb.title = '이번 작업 범위에 포함';
			cb.addEventListener('change', function () { setScope(u.id, cb.checked); });
			row.appendChild(cb);
			var body = el('div', 'dd-uc-body');
			var line = el('div', 'dd-uc-line');
			line.appendChild(el('span', 'dd-uc-id', u.id));
			line.appendChild(el('span', 'dd-uc-name', u.name || ''));
			line.appendChild(diffChip(difficulty[u.id]));
			body.appendChild(line);
			if (u.description) body.appendChild(proseSentences(u.description, 'use_cases[' + idxById[u.id] + '].description', u.id + ' 설명'));
			row.appendChild(body);
			return row;
		}

		clusters.forEach(function (cl, n) {
			var sum = summarizeShared(cl.tokens);
			var strong = sum.parts.some(function (p) { return p.cat === '규칙' || p.cat === 'API'; });
			var box = el('div', 'dd-group');
			var head = el('div', 'dd-group-head');
			head.appendChild(el('span', 'dd-group-cat', '묶음 ' + (n + 1)));
			head.appendChild(el('span', 'dd-group-name', sum.title || (cl.ids.length + '개')));
			head.appendChild(el('span', 'dd-group-n', '· ' + cl.ids.length + '개'));
			head.appendChild(el('span', 'dd-link ' + (strong ? 'dd-link-strong' : 'dd-link-weak'), strong ? '🔗 강하게 엮임' : '🔗 약하게 엮임'));
			box.appendChild(head);
			var shareEl = el('div', 'dd-share');
			shareEl.innerHTML = '공유: ' + (sum.parts.length ? sum.parts.map(function (p) { return '<b>' + p.cat + '</b> ' + p.txt; }).join(' · ') : '(참조)') + ' — 하나를 범위에서 빼면 나머지도 같이 검토하세요.';
			box.appendChild(shareEl);
			cl.ids.map(function (id) { return ucById[id]; }).forEach(function (u) { box.appendChild(ucRow(u)); });
			sec.el.appendChild(box);
		});

		if (independent.length) {
			var det = el('details', 'dd-indep');
			det.appendChild(el('summary', null, '· 독립 유스케이스 ' + independent.length + '개 — 공유 참조 없음 (펼치기)'));
			var ibox = el('div', 'dd-group');
			independent.forEach(function (u) { ibox.appendChild(ucRow(u)); });
			det.appendChild(ibox);
			sec.el.appendChild(det);
		}

		// ➕ 신규 유스케이스 추가 — 이번에 새로 만들 기능을 사용자가 직접 추가(확정 시 change_type=new 로 기록).
		sel.added = [];
		var addDet = el('details', 'dd-addnew');
		addDet.appendChild(el('summary', null, '➕ 새 유스케이스 추가 (이번에 새로 만들 기능)'));
		var addedList = el('div');
		var form = el('div', 'dd-addform');
		var nameI = el('input', 'dd-input'); nameI.placeholder = '새 유스케이스 이름 (예: 경조사 일괄 마감 처리)';
		var descI = el('textarea', 'dd-input'); descI.rows = 2; descI.placeholder = '무엇을 하는 기능인지 한두 문장으로';
		var addBtn = el('button', null, '➕ 추가'); addBtn.type = 'button';
		addBtn.addEventListener('click', function () {
			var nm = nameI.value.trim(); if (!nm) { nameI.focus(); return; }
			var item = { name: nm, description: descI.value.trim() };
			sel.added.push(item);
			var row = el('div', 'dd-uc');
			row.appendChild(el('span', 'dd-newbadge', '신규'));
			var body = el('div', 'dd-uc-body');
			var line = el('div', 'dd-uc-line');
			line.appendChild(el('span', 'dd-uc-name', nm));
			var del = el('button', 'dd-del', '삭제'); del.type = 'button';
			del.addEventListener('click', function () { var i = sel.added.indexOf(item); if (i >= 0) sel.added.splice(i, 1); addedList.removeChild(row); });
			line.appendChild(del);
			body.appendChild(line);
			if (item.description) body.appendChild(el('div', 'dd-desc-plain', item.description));
			row.appendChild(body);
			addedList.appendChild(row);
			nameI.value = ''; descI.value = ''; nameI.focus();
		});
		form.appendChild(nameI); form.appendChild(descI); form.appendChild(addBtn);
		addDet.appendChild(addedList); addDet.appendChild(form);
		sec.el.appendChild(addDet);
		root.appendChild(sec.el);
	}

	// ③ 충돌 해소
	function renderConflicts(root, data, sel) {
		var conflicts = Array.isArray(data.conflicts) ? data.conflicts : [];
		if (conflicts.length === 0) return;
		var sec = Kit.section('충돌 해소', '⚔️');
		sec.setCount(conflicts.length);
		conflicts.forEach(function (c, i) {
			sel.conflicts[c.id] = { resolved: !!c.resolved, resolution_ref: c.resolution_ref || '' };
			var card = el('div', 'dd-conflict');
			if (c.classification || c.type) card.appendChild(el('div', 'dd-class', c.classification || c.type));
			card.appendChild(proseSentences(c.description || c.summary || c.id, 'conflicts[' + i + '].description', c.id));
			var row = el('div', 'dd-row');
			var lab = el('label'); lab.style.display = 'flex'; lab.style.gap = '6px'; lab.style.alignItems = 'center';
			var cb = el('input'); cb.type = 'checkbox'; cb.checked = !!c.resolved;
			var refInput = el('input', 'dd-input'); refInput.placeholder = '어느 쪽으로 갈지 / 결정 근거';
			refInput.value = c.resolution_ref || ''; refInput.style.marginTop = '0'; refInput.style.flex = '1';
			cb.addEventListener('change', function () { sel.conflicts[c.id].resolved = cb.checked; });
			refInput.addEventListener('input', function () { sel.conflicts[c.id].resolution_ref = refInput.value; });
			lab.appendChild(cb); lab.appendChild(document.createTextNode('해소됨'));
			row.appendChild(lab); row.appendChild(refInput);
			card.appendChild(row);
			sec.el.appendChild(card);
		});
		root.appendChild(sec.el);
	}

	// ④ 확인할 질문
	function renderQuestions(root, data, sel) {
		var qs = Array.isArray(data.open_questions) ? data.open_questions : [];
		if (qs.length === 0) return;
		var sec = Kit.section('확인할 질문', '❓');
		sec.setCount(qs.length);
		qs.forEach(function (q) {
			sel.open_questions[q.id] = { answer: q.answer || '', status: q.status || 'answered' };
			var card = el('div', 'dd-q');
			if (q.category) card.appendChild(el('span', 'dd-q-cat', q.category));
			card.appendChild(el('div', null, q.question || q.id));
			var input = el('textarea', 'dd-input'); input.rows = 2;
			input.placeholder = '여기에 답하세요.';
			input.value = q.answer || '';
			input.addEventListener('input', function () {
				sel.open_questions[q.id].answer = input.value;
				sel.open_questions[q.id].status = input.value.trim() ? 'answered' : (q.status || 'open');
			});
			card.appendChild(input);
			sec.el.appendChild(card);
		});
		root.appendChild(sec.el);
	}

	// ⑤ 확정 — POST /confirm-scope
	function renderConfirmBar(root, sel) {
		var bar = el('div', 'dd-confirm-bar');
		var btn = el('button', null, '✓ 방향·범위 확정 → 상세 채우기');
		btn.type = 'button';
		var note = el('span', 'dd-confirm-note', '확정하면 체크한 유스케이스만 상세 명세를 채우고 최종 검토(게이트②)로 갑니다.');
		var okBox = el('div', 'dd-confirm-ok'); okBox.hidden = true;
		btn.addEventListener('click', function () {
			btn.disabled = true; btn.textContent = '확정 전송 중…';
			var payload = {
				scope: Object.keys(sel.scope).map(function (id) { return { uc_id: id, in_scope: sel.scope[id] }; }),
				conflicts: Object.keys(sel.conflicts).map(function (id) { return { id: id, resolved: sel.conflicts[id].resolved, resolution_ref: sel.conflicts[id].resolution_ref }; }),
				open_questions: Object.keys(sel.open_questions).map(function (id) { return { id: id, answer: sel.open_questions[id].answer, status: sel.open_questions[id].status }; }),
				added_use_cases: (sel.added || []).map(function (a) { return { name: a.name, description: a.description }; }),
			};
			fetch('/confirm-scope', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
				.then(function (r) { return r.json(); })
				.then(function (res) {
					var n = res.touched || {};
					okBox.hidden = false;
					okBox.textContent = '✓ 확정했습니다 — 범위 ' + (n.scope || 0) + ' · 충돌 ' + (n.conflicts || 0) + ' · 질문 ' + (n.open_questions || 0) + ' · 신규 추가 ' + (n.added || 0) + ' 반영. 이제 AI 가 상세 명세를 채웁니다.';
					btn.textContent = '확정 완료';
				})
				.catch(function (e) {
					btn.disabled = false; btn.textContent = '✓ 방향·범위 확정 → 상세 채우기';
					okBox.hidden = false; okBox.style.background = '#fef2f2'; okBox.style.color = '#b91c1c';
					okBox.textContent = '확정 실패: ' + (e && e.message ? e.message : e);
				});
		});
		bar.appendChild(btn); bar.appendChild(note);
		root.appendChild(bar);
		root.appendChild(okBox);
	}

	RENDERERS['discovery-draft'] = {
		render: function (root, ctx) {
			ensureStyles();
			var data = ctx.data || {};
			var difficulty = (ctx.difficulty && ctx.difficulty.use_cases) || {};
			var sel = { scope: {}, conflicts: {}, open_questions: {} };
			renderDraftHeader(root);
			renderIntro(root, data);
			renderScopeGroups(root, data, difficulty, sel);
			renderConflicts(root, data, sel);
			renderQuestions(root, data, sel);
			renderConfirmBar(root, sel);
		},
	};
})();
