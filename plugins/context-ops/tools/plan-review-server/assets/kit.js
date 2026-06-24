// kit.js — 공유 인터랙션 + 위젯 + 블록 헬퍼 (스키마 무관).
//   "어느 산출물이든 똑같은 행위": 팝오버 클릭→프롬프트 · 부분문자열 · 우측 패널 · 전역 채팅 ·
//   apply · 라이브 리로드 · gate 평결 · 헤더 · agent-reply 배너 · 큐 sessionStorage 유지.
//   스키마별 렌더러는 이 위젯/엔진을 가져다 배치만 한다 (렌더러가 주인 / 키트는 공유 자산).
//   값 직접 편집 ❌ — 모든 변경 = 프롬프트. 서버는 reference-lens (판정 ❌).
//
// emit 가 kit + 렌더러(들) + app 부트스트랩을 한 <script> 에 연결 주입 → 같은 스코프에서 var Kit / RENDERERS 가시.

// 스키마별 렌더러 레지스트리 — 각 renderers/*.js 가 RENDERERS['<type>'] = {...} 로 등록.
//   단일 문서: 선택 렌더러 1개 + generic. 멀티(phase) 문서: 여러 렌더러 공존(var Renderer 단일변수 충돌 회피).
var RENDERERS = {};

var Kit = (function () {
	'use strict';

	// ---- 상태 (init 에서 채움) ----
	var _leafByPath = {};
	var _summaries = {};
	var _storeKey = 'planReviewQueue';
	var prompts = new Map(); // key → { key, anchor, label, value, selected_text, text }
	var globalSeq = 0;

	// ---- 라벨 (4종 산출물 키 합집합 / 백엔드 view-model 은퇴로 여기로 이관) ----
	var LABELS = {
		id: 'ID', name: '이름', title: '제목', description: '설명', topic: '주제',
		intent_summary: '의도 요약', business_intent: '비즈니스 의도',
		domain_purpose: '도메인 목적', stakeholders: '이해관계자', success_criteria: '성공 기준',
		ap_id: 'AP ID', reason: '사유', statement: '서술', constraint: '제약',
		actors: '액터', actor: '액터', preconditions: '전제조건', postconditions: '결과조건',
		reasoning: '근거', intent_certainty: '의도 확신도', br_id: 'BR ID',
		source: '출처', rationale: '근거', affected_ids: '영향 ID', revisit_required: '재검토 필요',
		evidence_path: '근거 경로', source_grounded_evidence: '출처 근거', grep_hit_count: 'grep 적중수',
		out_of_scope: '범위 외', excluded_antipatterns: '제외 안티패턴', pending_decisions: '보류 결정',
		io_contracts: 'I/O 계약', acceptance_criteria_refs: '인수기준 링크', existing_ticket_refs: '기존 티켓',
		use_case_refs: '유스케이스 링크', br_refs: 'BR 링크', unit_refs: '유닛 링크',
		invariants: '불변식', state_transition_ref: '상태전이 링크', decision_table_ref: '결정표 링크',
		sequence_ref: '시퀀스 링크', property_tests: '속성 테스트',
		units: '유닛', coverage: '커버리지', kind: '종류', code_pointer: '코드 위치', provenance: '출처',
		domain_ref: '도메인 링크', behavior_method_ref: '동작 메서드 링크', bc_ref: 'BC 링크',
		invariant_refs: '불변식 링크', property_test_refs: '속성 테스트 링크', collaborators: '협력자',
		unit_test_obligation: '유닛 테스트 의무', waiver_reason: '면제 사유',
		gherkin: 'Gherkin', given: 'Given', when: 'When', then: 'Then', scenario: '시나리오', tags: '태그',
		behavior_ref: '동작 링크', use_case_ref: '유스케이스 링크', severity: '심각도',
		verifiable: '검증가능', automated_runnable: '자동실행', test_case_refs: '테스트케이스 링크',
		gate_required: 'gate 필수', related_brs: '관련 BR', related_aps: '관련 AP',
		layer: '레이어', story_ref: 'Story 링크', openapi_path: 'API 경로', operationId: 'operationId',
		state_map_ref: '상태맵 링크', dtcg_token_ref: 'DTCG 토큰 링크', visual_manifest_ref: '비주얼 매니페스트 링크',
		ac_refs: '연결 인수기준', module: '모듈', execution_order: '실행 순서', dependencies: '의존성',
		estimation_ai: 'AI 추정', estimation_human: '사람 추정', code_pointers: '코드 위치',
		code_pointers_na: '코드 위치 N/A', openapi_endpoint_ref: 'API 엔드포인트', component_ref: '컴포넌트',
		method: 'HTTP method', package: '패키지', status: '상태', decision: '결정', alternatives: '대안',
		option: '대안', rejection_reason: '기각 사유', consequences: '결과', positive: '긍정', negative: '부정',
		trigger_category: '트리거 분류', type: '유형', mitigation: '완화 방안', task_refs: '관련 작업',
		industry_case_refs: '업계 사례', human_review: '사람 검토', characteristic: '품질 특성',
		measurement: '측정 기준', acceptance_criteria_ref: '인수기준 링크', strategy: '전략', verification: '검증',
		sp_id: 'SP ID', sp_name: 'SP 이름', sp_conversion_class: '전환 분류', adr_ref: 'ADR 링크',
		external: '외부', verification_oracle: '검증 오라클',
		generated_at: '생성 시각', methodology_version: '방법론 버전', inputs_used: '입력 출처',
		confidence: '신뢰도', formula_version: '수식 버전', behavior_spec_path: 'behavior-spec 경로',
		acceptance_criteria_path: 'acceptance-criteria 경로', discovery_spec_path: 'discovery-spec 경로',
		jira_id: 'Jira ID', pre_existing: '기존 항목', screen_id: '화면 ID', route: '라우트',
		op_task_id: '운영작업 ID', epic_ref: 'Epic 링크', op_task_ref: '운영작업 링크',
		to_behavior_spec: '→ behavior-spec', to_acceptance_criteria: '→ acceptance-criteria',
		to_decisions: '→ decisions', to_source: '→ source', to_operational_tasks: '→ 운영작업',
		to_discovery_spec: '→ discovery-spec',
	};
	function label(k) { return LABELS[k] || k; }

	// ---- 카드 제목/부제 휴리스틱 (registry 에서 이관) ----
	var TITLE_KEYS = ['name', 'title', 'topic', 'reasoning', 'statement', 'constraint', 'description'];
	var SUB_KEYS = ['actor', 'actors', 'severity', 'layer', 'status', 'characteristic', 'intent_certainty', 'source', 'type'];
	function truncate(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
	function firstPresent(item, keys) {
		for (var i = 0; i < keys.length; i++) {
			var v = item && item[keys[i]];
			if (v != null && v !== '' && typeof v !== 'object') return v;
			if (Array.isArray(v) && v.length && typeof v[0] !== 'object') return v.join(', ');
		}
		return '';
	}
	function findId(item) {
		if (!item || typeof item !== 'object') return '';
		if (item.id != null) return String(item.id);
		for (var k in item) if (k.slice(-3) === '_id' && item[k] != null && typeof item[k] !== 'object') return String(item[k]);
		return '';
	}
	function cardTitle(item, i) {
		var t = firstPresent(item, TITLE_KEYS) || findId(item) || ('항목 ' + (i + 1));
		return (i + 1) + '. ' + truncate(t, 80);
	}
	function cardSub(item) {
		var id = findId(item);
		var extras = [];
		for (var j = 0; j < SUB_KEYS.length; j++) {
			var v = item && item[SUB_KEYS[j]];
			if (v != null && typeof v !== 'object') extras.push(String(v));
		}
		return [id].concat(extras.slice(0, 2)).filter(Boolean).join(' · ');
	}

	// ---- lock ----
	function isLocked(path) { var l = _leafByPath[path]; return !!(l && l.locked); }
	function kindOf(path) { var l = _leafByPath[path]; return l ? l.kind : 'readonly'; }
	function leafAt(path) { return _leafByPath[path] || null; }

	// ---- 토큰화 (ID/코드 → 배지) ----
	function tokenizeInto(el, text) {
		var re = /([A-Z][A-Z0-9]+(?:-[A-Z0-9]+){1,})|(\b[1-5]\d{2}\b)/g;
		var last = 0, m;
		while ((m = re.exec(text)) !== null) {
			if (m.index > last) el.appendChild(document.createTextNode(text.slice(last, m.index)));
			var tok = document.createElement('span'); tok.className = 'tok'; tok.textContent = m[0];
			el.appendChild(tok); last = m.index + m[0].length;
		}
		if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
	}

	// ---- 위젯 ----
	function chip(value, anchor, ctxLabel) {
		var span = document.createElement('span');
		span.className = 'val clickable';
		var text = value == null || value === '' ? '(빈 값)' : String(value);
		span.textContent = text;
		span.title = '클릭 = 항목 프롬프트 · 텍스트 드래그 후 클릭 = 부분 지정';
		bindClick(span, anchor, ctxLabel, text);
		return span;
	}
	function roVal(value, kind) {
		var span = document.createElement('span');
		span.className = 'ro-val';
		span.title = kind === 'link' ? '구조 항목 — AI 전담 (수정 불가)' : '자동 생성 항목 — 수정 불가';
		span.textContent = value == null || value === '' ? '(빈 값)' : String(value);
		return span;
	}
	function proseEl(value, anchor, ctxLabel) {
		var prose = document.createElement('div');
		prose.className = 'prose val clickable';
		tokenizeInto(prose, String(value));
		bindClick(prose, anchor, ctxLabel, String(value));
		return prose;
	}
	function fieldRow(labelText, kind) {
		var r = document.createElement('div'); r.className = 'field';
		var lab = document.createElement('label'); lab.textContent = labelText;
		if (kind === 'link') {
			var lk = document.createElement('span'); lk.className = 'lock'; lk.textContent = '🔒';
			lk.title = '구조(ID·연결·순서) — 직접 수정 대신 프롬프트로'; lab.appendChild(lk);
		}
		r.appendChild(lab);
		var ctrl = document.createElement('div'); ctrl.className = 'control'; r.appendChild(ctrl);
		return { r: r, ctrl: ctrl };
	}

	// ---- 블록 (raw 값 → 구조) ----
	function blockify(value, path, key) {
		if (Array.isArray(value)) {
			var allScalar = value.every(function (v) { return v === null || typeof v !== 'object'; });
			if (allScalar) {
				return { type: 'list', label: label(key), key: key, items: value.map(function (v, i) {
					return { path: path + '[' + i + ']', value: v, leaf: leafAt(path + '[' + i + ']') };
				}) };
			}
			return { type: 'group', label: label(key), key: key, rows: value.map(function (v, i) {
				return objectBlocks(v, path + '[' + i + ']');
			}) };
		}
		if (value && typeof value === 'object') {
			return { type: 'subobject', label: label(key), key: key, fields: objectBlocks(value, path) };
		}
		var leaf = leafAt(path);
		var prose = leaf && leaf.kind === 'text' && typeof value === 'string' && (value.length > 60 || value.indexOf('\n') >= 0);
		return { type: 'scalar', label: label(key), key: key, path: path, value: value, leaf: leaf, prose: !!prose };
	}
	function objectBlocks(obj, basePath) {
		if (!obj || typeof obj !== 'object') return [];
		return Object.keys(obj).map(function (k) { return blockify(obj[k], basePath + '.' + k, k); });
	}
	function toBlocks(obj, basePath) { return objectBlocks(obj, basePath); }

	function isLockedBlock(b) {
		if (b.type === 'scalar') return !!(b.leaf && b.leaf.locked);
		if (b.type === 'list') return !!(b.items && b.items[0] && b.items[0].leaf && b.items[0].leaf.locked);
		return false;
	}

	function renderBlock(b, ctxLabel) {
		if (b.type === 'scalar') return scalarRow(b, ctxLabel);
		if (b.type === 'list') return listRow(b, ctxLabel);
		if (b.type === 'group') return groupRow(b, ctxLabel);
		if (b.type === 'subobject') return subobjectRow(b, ctxLabel);
		var d = document.createElement('div'); d.textContent = JSON.stringify(b.value); return d;
	}
	function scalarRow(b, ctx) {
		var kind = b.leaf ? b.leaf.kind : 'readonly';
		if (b.prose) {
			var pr = document.createElement('div'); pr.className = 'field prose-field';
			var lab = document.createElement('label'); lab.textContent = b.label; pr.appendChild(lab);
			pr.appendChild(proseEl(b.value, b.path, ctx + ' · ' + b.label));
			return pr;
		}
		var w = fieldRow(b.label, kind);
		var locked = b.leaf ? b.leaf.locked : kind === 'readonly';
		w.ctrl.appendChild(locked ? roVal(b.value, kind) : chip(b.value, b.path, ctx + ' · ' + b.label));
		return w.r;
	}
	function listRow(b, ctx) {
		var w = fieldRow(b.label, b.items[0] && b.items[0].leaf ? b.items[0].leaf.kind : '');
		if (!b.items.length) { w.ctrl.appendChild(document.createTextNode('(없음)')); return w.r; }
		b.items.forEach(function (it) {
			var k = it.leaf ? it.leaf.kind : 'readonly';
			var locked = it.leaf ? it.leaf.locked : true;
			w.ctrl.appendChild(locked ? roVal(it.value, k) : chip(it.value, it.path, ctx + ' · ' + b.label));
		});
		return w.r;
	}
	function groupRow(b, ctx) {
		var sec = document.createElement('div'); sec.className = 'subgroup';
		var t = document.createElement('div'); t.className = 'subgroup-title'; t.textContent = b.label; sec.appendChild(t);
		b.rows.forEach(function (fields, i) {
			var mini = document.createElement('div'); mini.className = 'subrow';
			var n = document.createElement('div'); n.className = 'subrow-n'; n.textContent = '#' + (i + 1); mini.appendChild(n);
			fields.forEach(function (f) { mini.appendChild(renderBlock(f, ctx + ' · ' + b.label + ' #' + (i + 1))); });
			sec.appendChild(mini);
		});
		return sec;
	}
	function subobjectRow(b, ctx) {
		var sec = document.createElement('div'); sec.className = 'subgroup';
		var t = document.createElement('div'); t.className = 'subgroup-title'; t.textContent = b.label; sec.appendChild(t);
		b.fields.forEach(function (f) { sec.appendChild(renderBlock(f, ctx + ' · ' + b.label)); });
		return sec;
	}

	// ---- 섹션 / 카드 셸 ----
	function section(title, icon, collapsed) {
		var wrap = document.createElement(collapsed ? 'details' : 'section');
		wrap.className = 'sec';
		var head = document.createElement(collapsed ? 'summary' : 'h2');
		head.className = 'sec-head';
		head.textContent = (icon ? icon + ' ' : '') + title;
		wrap.appendChild(head);
		return {
			el: wrap,
			setCount: function (n) { if (n != null) head.textContent = (icon ? icon + ' ' : '') + title + ' (' + n + ')'; },
			addCard: function (cardEl) { wrap.appendChild(cardEl); },
		};
	}

	// 카드: 헤더(클릭→프롬프트) + AI요약 + content 영역 + 잠긴 구조 토글.
	//   renderer 는 content 에 bespoke 노드를 직접 넣거나 addBlock(block) 으로 generic 위임.
	function card(opts) {
		opts = opts || {};
		var base = opts.base;
		var c = document.createElement('div'); c.className = 'card';
		var ctxLabel = opts.header || opts.sectionTitle || '항목';

		if (opts.header) {
			var h = document.createElement('div'); h.className = 'card-head clickable';
			var sepIdx = -1, sep = '';
			['—', ':'].forEach(function (cand) {
				var i = opts.header.indexOf(cand);
				if (i > 0 && (sepIdx === -1 || i < sepIdx)) { sepIdx = i; sep = cand; }
			});
			if (sepIdx > 0) {
				var lead = document.createElement('span'); lead.className = 'ch-lead';
				lead.textContent = opts.header.slice(0, sepIdx).trim();
				var tail = document.createElement('span'); tail.className = 'ch-tail';
				tail.textContent = opts.header.slice(sepIdx + sep.length).trim();
				h.appendChild(lead); h.appendChild(tail);
			} else {
				var leadOnly = document.createElement('span'); leadOnly.className = 'ch-lead';
				leadOnly.textContent = opts.header; h.appendChild(leadOnly);
			}
			if (opts.subtitle) {
				var s = document.createElement('span'); s.className = 'card-sub'; s.textContent = opts.subtitle; h.appendChild(s);
			}
			if (base) bindClick(h, base, opts.header, '(카드 전체)');
			c.appendChild(h);
		}

		// AI 평이 요약 (원문 ≠ / 표시 전용)
		var sum = base && _summaries[base] && _summaries[base].summary;
		if (sum) {
			var box = document.createElement('div'); box.className = 'ai-summary';
			var tag = document.createElement('span'); tag.className = 'ai-tag'; tag.textContent = '🤖 AI 요약 · 원문 아님';
			var txt = document.createElement('div'); txt.className = 'ai-text'; txt.textContent = sum;
			box.appendChild(tag); box.appendChild(txt); c.appendChild(box);
		}

		var content = document.createElement('div'); content.className = 'card-content'; c.appendChild(content);
		var lockedBlocks = [];

		var api = {
			el: c,
			content: content,
			ctxLabel: ctxLabel,
			// generic 위임: block 을 잠금 여부로 라우팅
			addBlock: function (b2) {
				if (isLockedBlock(b2)) lockedBlocks.push(b2);
				else content.appendChild(renderBlock(b2, ctxLabel));
			},
			// 객체 전체를 blocks 로 펼쳐 추가 (renderer 편의)
			addObject: function (obj, objBase) {
				toBlocks(obj, objBase).forEach(api.addBlock);
			},
			// bespoke 노드 직접
			addNode: function (node) { content.appendChild(node); },
			finalize: function () {
				if (lockedBlocks.length) {
					var det = document.createElement('details'); det.className = 'card-structure';
					var sm = document.createElement('summary'); sm.textContent = '🔒 구조·링크 ' + lockedBlocks.length + '개'; det.appendChild(sm);
					lockedBlocks.forEach(function (b2) { det.appendChild(renderBlock(b2, ctxLabel)); });
					c.appendChild(det);
				}
				return c;
			},
		};
		return api;
	}

	// ---- 일반 배치 엔진 (렌더러가 opt-in 으로 사용) ----
	//   sectionDefs: [{key, title, icon}], collapsedDefs: [{key,title,icon}]
	//   opts.renderCardBody(cardApi, item, base): 카드 본문 커스텀 (기본 = addObject).
	function arrange(rootEl, data, sectionDefs, opts) {
		opts = opts || {};
		var collapsedDefs = opts.collapsedDefs || [];
		var collapsedKeys = {}; collapsedDefs.forEach(function (d) { collapsedKeys[d.key] = true; });
		var seen = {};
		var renderBody = opts.renderCardBody || function (cardApi, item, base) { cardApi.addObject(item, base); };

		function pushSection(def, val, collapsed) {
			if (val == null) return;
			var sec = section(def.title, def.icon, collapsed);
			if (Array.isArray(val)) {
				var allScalar = val.every(function (v) { return v === null || typeof v !== 'object'; });
				sec.setCount(val.length);
				if (allScalar) {
					var ca = card({ base: def.key, sectionTitle: def.title });
					ca.addBlock(blockify(val, def.key, def.key));
					sec.addCard(ca.finalize());
				} else {
					val.forEach(function (item, i) {
						var base = def.key + '[' + i + ']';
						var ca = card({ base: base, header: cardTitle(item, i), subtitle: cardSub(item), sectionTitle: def.title });
						renderBody(ca, item, base);
						sec.addCard(ca.finalize());
					});
				}
			} else if (typeof val === 'object') {
				var ca2 = card({ base: def.key, sectionTitle: def.title });
				renderBody(ca2, val, def.key);
				sec.addCard(ca2.finalize());
			} else {
				var ca3 = card({ base: def.key, sectionTitle: def.title });
				ca3.addBlock(blockify(val, def.key, def.key));
				sec.addCard(ca3.finalize());
			}
			rootEl.appendChild(sec.el);
		}

		sectionDefs.forEach(function (def) { if (data[def.key] != null) { seen[def.key] = true; pushSection(def, data[def.key], false); } });
		// 미정의 최상위 → generic (collapsed 제외)
		Object.keys(data).forEach(function (k) {
			if (seen[k] || data[k] == null || collapsedKeys[k]) return;
			seen[k] = true; pushSection({ key: k, title: label(k), icon: '•' }, data[k], false);
		});
		// provenance → 접어서 뒤
		collapsedDefs.forEach(function (def) { if (data[def.key] != null) pushSection(def, data[def.key], true); });
	}

	// ================= 인터랙션 (init 에서 1회 배선) =================
	var pop, popAnchor, popCur, popSel, popInput, popSave, popDel, popCancel, current = null;

	function selectionWithin(el) {
		var sel = window.getSelection();
		if (!sel || sel.isCollapsed || sel.rangeCount === 0) return '';
		var range = sel.getRangeAt(0);
		if (!el.contains(range.commonAncestorContainer)) return '';
		return sel.toString().trim();
	}
	function bindClick(el, anchor, labelText, value) {
		el.dataset.anchor = anchor;
		el.addEventListener('click', function (e) {
			e.stopPropagation();
			openPopover(el, anchor, labelText, value, selectionWithin(el));
		});
	}
	function openPopover(el, anchor, labelText, value, selectedText) {
		current = { anchor: anchor, label: labelText, value: value, selected_text: selectedText || '' };
		popAnchor.textContent = labelText;
		popCur.textContent = '현재: ' + value;
		if (selectedText) { popSel.hidden = false; popSel.textContent = '선택한 부분: “' + selectedText + '”'; }
		else popSel.hidden = true;
		var existing = prompts.get(anchor);
		popInput.value = existing ? existing.text : '';
		popDel.hidden = !existing;
		pop.hidden = false;
		var rect = el.getBoundingClientRect();
		pop.style.top = (rect.bottom + window.scrollY + 6) + 'px';
		pop.style.left = Math.min(rect.left + window.scrollX, window.scrollX + window.innerWidth - pop.offsetWidth - 16) + 'px';
		popInput.focus();
	}
	function closePopover() { pop.hidden = true; current = null; }

	function persist() {
		try {
			var arr = [];
			prompts.forEach(function (p) { arr.push(p); });
			sessionStorage.setItem(_storeKey, JSON.stringify(arr));
		} catch (e) { /* best-effort */ }
	}
	function restore() {
		try {
			var raw = sessionStorage.getItem(_storeKey);
			if (!raw) return;
			JSON.parse(raw).forEach(function (p) {
				prompts.set(p.key, p);
				if (p.key && p.key.indexOf('__global__') === 0) globalSeq++;
			});
		} catch (e) { /* ignore */ }
	}

	function markChips() {
		document.querySelectorAll('[data-anchor]').forEach(function (el) {
			el.classList.toggle('has-prompt', prompts.has(el.dataset.anchor));
		});
	}
	function renderPanel() {
		var list = document.getElementById('prompt-list');
		document.getElementById('pcount').textContent = String(prompts.size);
		list.textContent = '';
		if (prompts.size === 0) {
			var e = document.createElement('div'); e.className = 'pp-empty';
			e.textContent = '항목을 클릭하거나, 아래에 전체 의견을 적어보세요.'; list.appendChild(e);
		} else {
			prompts.forEach(function (p) {
				var item = document.createElement('div'); item.className = 'prompt-item' + (p.anchor == null ? ' global' : '');
				var del = document.createElement('button'); del.type = 'button'; del.className = 'pi-del'; del.textContent = '×';
				del.addEventListener('click', function () { prompts.delete(p.key); persist(); markChips(); renderPanel(); });
				item.appendChild(del);
				var lab = document.createElement('div'); lab.className = 'pi-label'; lab.textContent = (p.anchor == null ? '💬 ' : '') + p.label; item.appendChild(lab);
				if (p.selected_text) { var q = document.createElement('div'); q.className = 'pi-sel'; q.textContent = '“' + p.selected_text + '”'; item.appendChild(q); }
				var txt = document.createElement('div'); txt.className = 'pi-text'; txt.textContent = p.text; item.appendChild(txt);
				list.appendChild(item);
			});
		}
		document.getElementById('btn-apply').disabled = prompts.size === 0;
	}

	function setPrompt(anchor, labelText, value, selectedText, text) {
		if (text) prompts.set(anchor, { key: anchor, anchor: anchor, label: labelText, value: value, selected_text: selectedText || null, text: text });
		else prompts.delete(anchor);
		persist(); markChips(); renderPanel();
	}

	function wireGate(gate) {
		if (!gate || !gate.verdict) return;
		var badge = document.getElementById('verdict-badge');
		badge.textContent = gate.verdict.toUpperCase(); badge.className = 'v-' + gate.verdict;
		document.getElementById('headline').textContent = gate.headline || '';
		var host = document.getElementById('gate-summary');
		[].concat((gate.blocking || []).map(function (r) { return { r: r, block: true }; }))
			.concat((gate.review || []).map(function (r) { return { r: r, block: false }; }))
			.forEach(function (it) {
				var d = document.createElement('div'); d.className = 'reason' + (it.block ? ' block' : '');
				d.textContent = (it.block ? '🚫 막는 문제: ' : '💡 검토 권장: ') + (it.r.meaning || it.r.label || it.r.code || '') + (it.r.action ? ' → ' + it.r.action : '');
				host.appendChild(d);
			});
	}

	function wireHeader(meta) {
		if (meta && meta.label) {
			var at = document.getElementById('artifact-title'); if (at) at.textContent = meta.label;
			document.title = 'plan review — ' + meta.label + ' 검토';
		}
		document.getElementById('meta').textContent = meta && meta.taskPlanPath ? ((meta.artifactType || '산출물') + ': ' + meta.taskPlanPath) : '';
	}

	// agent-reply 배너 — AI 가 "뭘 바꿨다" (닫힌 루프). 표시 전용.
	function wireAgentReply(text) {
		var host = document.getElementById('agent-reply');
		if (!host) return;
		if (text) { host.hidden = false; host.querySelector('.ar-text').textContent = text; }
		else host.hidden = true;
	}

	function wireLiveReload() {
		var baseVersion = null;
		function poll() {
			fetch('version').then(function (r) { return r.json(); }).then(function (v) {
				if (baseVersion == null) baseVersion = v.version;
				else if (v.version !== baseVersion) {
					sessionStorage.setItem('planReviewScroll', String(window.scrollY));
					location.reload();
				}
			}).catch(function () {});
		}
		var saved = sessionStorage.getItem('planReviewScroll');
		if (saved != null) { window.scrollTo(0, Number(saved)); sessionStorage.removeItem('planReviewScroll'); }
		setInterval(poll, 2000); poll();
	}

	function wireApply() {
		document.getElementById('btn-apply').addEventListener('click', function () {
			var btn = this; btn.disabled = true;
			var res = document.getElementById('result'); res.className = 'result'; res.textContent = 'AI 가 재설계 중…';
			var comments = [];
			prompts.forEach(function (p) { comments.push({ anchor: p.anchor, text: p.text, label: p.label, selected_text: p.selected_text || null }); });
			fetch('apply', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ edits: {}, comments: comments }) })
				.then(function (r) { return r.json(); })
				.then(function (out) {
					if (out.branch === 'expensive') {
						res.className = 'result expensive';
						res.textContent = '✓ 전달됨 — AI 가 ' + comments.length + '개 프롬프트로 재설계합니다. 완료되면 이 화면이 자동 갱신됩니다.';
						// 전송 성공 → 큐 비움 (재설계 후 리로드 시 깨끗).
						prompts.clear(); persist(); markChips(); renderPanel();
					} else if (out.branch === 'cheap') {
						res.className = 'result cheap'; res.textContent = '✓ 변경 없음으로 처리됨.'; btn.disabled = false;
					} else {
						res.className = 'result error'; res.textContent = '오류: ' + (out.error || '알 수 없음'); btn.disabled = false;
					}
				})
				.catch(function (e) { res.className = 'result error'; res.textContent = '요청 실패: ' + e.message; btn.disabled = false; });
		});
	}

	function wireChat() {
		var chatInput = document.getElementById('chat-input');
		function addGlobal() {
			var text = chatInput.value.trim(); if (!text) return;
			var key = '__global__' + (++globalSeq);
			prompts.set(key, { key: key, anchor: null, label: '전체 의견', value: '', selected_text: null, text: text });
			chatInput.value = ''; persist(); renderPanel();
		}
		document.getElementById('chat-add').addEventListener('click', addGlobal);
		chatInput.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addGlobal(); });
	}

	function wirePopover() {
		pop = document.getElementById('popover');
		popAnchor = document.getElementById('pop-anchor'); popCur = document.getElementById('pop-cur');
		popSel = document.getElementById('pop-sel'); popInput = document.getElementById('pop-input');
		popSave = document.getElementById('pop-save'); popDel = document.getElementById('pop-del'); popCancel = document.getElementById('pop-cancel');
		popSave.addEventListener('click', function () {
			if (!current) return;
			setPrompt(current.anchor, current.label, current.value, current.selected_text, popInput.value.trim());
			closePopover();
		});
		popDel.addEventListener('click', function () { if (current) setPrompt(current.anchor, current.label, current.value, current.selected_text, ''); closePopover(); });
		popCancel.addEventListener('click', closePopover);
		document.addEventListener('click', function (e) { if (!pop.hidden && !pop.contains(e.target)) closePopover(); });
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') closePopover();
			if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !pop.hidden) popSave.click();
		});
	}

	// init: 컨텍스트 주입 + 전 인터랙션 배선 + 큐/스크롤 복원. (렌더는 호출부가 별도로)
	function init(ctx) {
		ctx = ctx || {};
		_summaries = ctx.summaries || {};
		(ctx.fieldModel && ctx.fieldModel.leaves || []).forEach(function (l) { _leafByPath[l.path] = l; });
		if (ctx.meta && ctx.meta.taskPlanPath) _storeKey = 'planReviewQueue:' + ctx.meta.taskPlanPath;
		wirePopover();
		wireChat();
		wireApply();
		wireGate(ctx.gate);
		wireHeader(ctx.meta);
		wireAgentReply(ctx.agentReply);
		restore();
		renderPanel(); markChips();
		wireLiveReload();
	}

	// ================= 멀티(phase) 문서 =================
	// 한 페이지에 여러 산출물(예: spec = behavior/unit/ac)을 탭으로. 인터랙션은 공유.
	//   문서별 fieldModel/summaries 를 병합(top-level key 가 산출물마다 달라 anchor 충돌 ❌).
	function initMulti(ctx) {
		ctx = ctx || {};
		var docs = ctx.documents || [];
		docs.forEach(function (d) {
			(d.fieldModel && d.fieldModel.leaves || []).forEach(function (l) { _leafByPath[l.path] = l; });
			if (d.summaries) Object.keys(d.summaries).forEach(function (k) { _summaries[k] = d.summaries[k]; });
		});
		if (ctx.meta && ctx.meta.taskPlanPath) _storeKey = 'planReviewQueue:' + ctx.meta.taskPlanPath;
		else if (docs[0] && docs[0].path) _storeKey = 'planReviewQueue:' + docs[0].path;
		wirePopover(); wireChat(); wireApply();
		wireGate(ctx.gate); wireHeader(ctx.meta); wireAgentReply(ctx.agentReply);
		restore(); renderPanel(); markChips(); wireLiveReload();
	}

	// 탭 바 + 문서별 컨테이너 + 각 문서를 자기 렌더러로. pickRenderer(type) → 렌더러.
	function renderMulti(docs, rootEl, pickRenderer) {
		var tabs = document.createElement('div'); tabs.className = 'doc-tabs'; rootEl.appendChild(tabs);
		var panels = document.createElement('div'); panels.className = 'doc-panels'; rootEl.appendChild(panels);
		var btns = [];
		docs.forEach(function (d, i) {
			var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'doc-tab';
			btn.textContent = d.label || d.artifactType;
			var panel = document.createElement('div'); panel.className = 'doc-panel'; panel.hidden = i !== 0;
			panels.appendChild(panel);
			var R = pickRenderer(d.artifactType);
			if (R && typeof R.render === 'function') {
				R.render(panel, { data: d.data || {}, summaries: d.summaries || {}, difficulty: d.difficulty || null });
			}
			btn.addEventListener('click', function () {
				btns.forEach(function (b) { b.classList.remove('active'); });
				btn.classList.add('active');
				Array.prototype.forEach.call(panels.children, function (p, j) { p.hidden = j !== i; });
			});
			if (i === 0) btn.classList.add('active');
			tabs.appendChild(btn); btns.push(btn);
		});
	}

	// 렌더 완료 후 호출 — 칩 강조 갱신(복원된 큐 반영).
	function afterRender() { markChips(); }

	// 난이도 뱃지 (S1 reference-lens / 표시 전용 / verdict 아님). d = use_cases[ucId] 항목.
	var DIFF_NAME = { S: '낮음', M: '중간', L: '높음' };
	function difficultyBadge(d) {
		var b = document.createElement('div');
		b.className = 'diff-badge';
		if (!d || d.degraded) {
			b.className += ' diff-na';
			b.textContent = '난이도 — (그래프 미합성)';
			return b;
		}
		b.className += ' diff-' + d.bucket;
		b.textContent = '난이도 ' + d.bucket + ' (' + (DIFF_NAME[d.bucket] || '') + ') · 영향 '
			+ d.impact_count + '노드 · MUST ' + d.must_count;
		return b;
	}

	// 전 artifact 공통 — 접어서 뒤로 보내는 provenance/구조 섹션.
	var COLLAPSED = [
		{ key: 'meta', title: '메타정보', icon: 'ℹ️' },
		{ key: 'derivation_source', title: '파생 출처', icon: '🔗' },
		{ key: 'cross_links', title: '교차 링크', icon: '🔗' },
	];

	return {
		init: init, initMulti: initMulti, renderMulti: renderMulti, afterRender: afterRender, arrange: arrange,
		section: section, card: card, toBlocks: toBlocks, blockify: blockify, renderBlock: renderBlock,
		chip: chip, roVal: roVal, prose: proseEl, field: fieldRow, tokenizeInto: tokenizeInto,
		isLocked: isLocked, kindOf: kindOf, label: label, cardTitle: cardTitle, cardSub: cardSub,
		difficultyBadge: difficultyBadge,
		LABELS: LABELS, COLLAPSED: COLLAPSED,
	};
})();
