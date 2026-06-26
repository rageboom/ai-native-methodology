import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFieldModel } from '../src/field-classify.js';

// 브라우저 전용 코드(kit + renderer + app)를 의존성 0 의 DOM stub 으로 실제 실행 →
// "throw 없음 + 섹션/잠금/요약/agent-reply + AC Gherkin" 검증. node --test 가 런타임 에러를 잡는다.

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..', '..');
const ASSETS = resolve(__dirname, '..', 'assets');
const POC = join(REPO, 'examples', 'poc-14-fsim-corroboration', '.ai-context', 'output');
// unit-spec 는 poc-14 에 없어 별도 fixture (greenfield poc-21).
const FIXTURE = {
	'unit-spec': join(REPO, 'examples', 'poc-21-greenfield-money-allocation', '.ai-context', 'output'),
};
function fixtureDir(art) { return FIXTURE[art] || POC; }

const KIT_SRC = readFileSync(join(ASSETS, 'kit.js'), 'utf-8');
const APP_SRC = readFileSync(join(ASSETS, 'app.js'), 'utf-8');

// ---- 최소 DOM stub ----
function makeStub() {
	const allEls = [];
	function classesOf(el) { return el.className ? String(el.className).split(/\s+/) : []; }
	function matchSel(el, sel) {
		if (sel === '[data-anchor]') return el.dataset && el.dataset.anchor != null;
		if (sel[0] === '.') return classesOf(el).includes(sel.slice(1));
		return false;
	}
	function descendants(el, acc) {
		(el.children || []).forEach((c) => { acc.push(c); descendants(c, acc); });
		return acc;
	}
	function makeEl(tag) {
		const el = {
			tagName: tag, children: [], className: '', textContent: '', value: '', hidden: false,
			title: '', type: '', placeholder: '', rows: 0, style: {}, dataset: {},
			classList: {
				_s: new Set(),
				add(c) { this._s.add(c); sync(el); }, remove(c) { this._s.delete(c); sync(el); },
				toggle(c, on) { if (on === undefined) on = !this._s.has(c); on ? this._s.add(c) : this._s.delete(c); sync(el); return on; },
				contains(c) { return this._s.has(c); },
			},
			appendChild(c) { this.children.push(c); return c; },
			removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); },
			remove() {},
			addEventListener() {},
			querySelector(sel) { return descendants(this, []).find((d) => matchSel(d, sel)) || null; },
			querySelectorAll(sel) { return descendants(this, []).filter((d) => matchSel(d, sel)); },
			getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; },
			contains() { return false; },
			focus() {},
		};
		// className 은 string 인데 classList 와 동기화 (간이): className 세팅 시 classList 초기화.
		allEls.push(el);
		return el;
	}
	function sync() { /* classList 변경은 contains 로만 조회 — className 동기화 불필요 */ }
	return { allEls, makeEl, descendants };
}

function runApp(artifactType, opts = {}) {
	const schema = JSON.parse(readFileSync(join(REPO, 'schemas', `${artifactType}.schema.json`), 'utf-8'));
	const data = JSON.parse(readFileSync(join(fixtureDir(artifactType), `${artifactType}.json`), 'utf-8'));
	const fieldModel = buildFieldModel(data, schema);
	const rendererSrc = readFileSync(join(ASSETS, 'renderers', `${artifactType}.js`), 'utf-8');

	const { allEls, makeEl, descendants } = makeStub();
	const byId = {};
	const ensure = (id) => (byId[id] || (byId[id] = makeEl('div')));
	ensure('artifact-data').textContent = JSON.stringify(data);
	ensure('field-model').textContent = JSON.stringify(fieldModel);
	ensure('gate-summary-data').textContent = 'null';
	ensure('meta-data').textContent = JSON.stringify({
		taskPlanPath: `/x/${artifactType}.json`,
		artifactType,
		label: artifactType,
		agentReply: opts.agentReply || null,
	});
	ensure('ai-summaries').textContent = JSON.stringify(opts.summaries || null);
	[
		'form', 'gate-summary', 'prompt-list', 'pcount', 'btn-apply', 'chat-input', 'chat-add',
		'popover', 'pop-anchor', 'pop-cur', 'pop-sel', 'pop-input', 'pop-save', 'pop-del', 'pop-cancel',
		'verdict-badge', 'headline', 'meta', 'artifact-title', 'result',
	].forEach(ensure);
	// agent-reply 배너 + 자식 .ar-text
	const ar = ensure('agent-reply');
	const arText = makeEl('span'); arText.className = 'ar-text'; ar.appendChild(arText);

	const sessionMem = {};
	const documentStub = {
		getElementById: (id) => ensure(id),
		createElement: (tag) => makeEl(tag),
		createTextNode: (t) => ({ nodeType: 3, textContent: String(t), children: [] }),
		addEventListener() {},
		querySelectorAll(sel) {
			if (sel === '[data-anchor]') return allEls.filter((d) => d.dataset && d.dataset.anchor != null);
			if (sel[0] === '.') return allEls.filter((d) => (d.className ? String(d.className).split(/\s+/) : []).includes(sel.slice(1)));
			return [];
		},
	};
	const windowStub = {
		getSelection: () => ({ isCollapsed: true, rangeCount: 0, toString: () => '' }),
		scrollY: 0, scrollX: 0, innerWidth: 1000, scrollTo() {}, addEventListener() {},
	};
	const sessionStub = { getItem: (k) => (k in sessionMem ? sessionMem[k] : null), setItem: (k, v) => { sessionMem[k] = String(v); }, removeItem: (k) => { delete sessionMem[k]; } };
	const fetchStub = () => Promise.resolve({ json: () => Promise.resolve({ version: '1' }) });
	const setIntervalStub = () => 0;
	const locationStub = { reload() {} };

	const src = KIT_SRC + '\n' + rendererSrc + '\n' + APP_SRC;
	const runner = new Function('document', 'window', 'fetch', 'sessionStorage', 'setInterval', 'location', 'console', src);
	runner(documentStub, windowStub, fetchStub, sessionStub, setIntervalStub, locationStub, console);
	return { byId, allEls, descendants };
}

function collect(root, cls, descendants) {
	return descendants(root, []).filter((d) => (d.className ? String(d.className).split(/\s+/) : []).includes(cls));
}

const ARTS = ['discovery-spec', 'behavior-spec', 'unit-spec', 'acceptance-criteria', 'task-plan'];

for (const art of ARTS) {
	test(`render(${art}) — throw 없이 섹션/카드 그림 (런타임 가드)`, () => {
		let res;
		assert.doesNotThrow(() => { res = runApp(art); }, `${art} 렌더 throw ❌`);
		assert.ok(res.byId['form'].children.length > 0, '섹션 append');
		assert.equal(res.byId['artifact-title'].textContent, art, 'H1 라벨 = artifactType');
	});
}

test('AC 렌더러 — Gherkin 이 Given/When/Then 시나리오 스텝으로', () => {
	const { byId, descendants } = runApp('acceptance-criteria');
	const steps = collect(byId['form'], 'scn-step', descendants);
	assert.ok(steps.length > 0, '시나리오 스텝 존재');
	const kws = collect(byId['form'], 'scn-kw', descendants).map((e) => e.textContent);
	assert.ok(kws.includes('Given'), 'Given 키워드');
	assert.ok(kws.includes('When'), 'When 키워드');
	assert.ok(kws.includes('Then'), 'Then 키워드');
});

// ===== spec·plan 게이트 가독성 (읽기뷰 / 필드워커 대치) =====

test('behavior-spec 읽기뷰 — 동작 카드 + 산문 + 추적 칩(필드워커 ❌)', () => {
	const { byId, descendants } = runApp('behavior-spec'); // poc-14 = behaviors 4
	const cards = collect(byId['form'], 'bs-b', descendants);
	assert.equal(cards.length, 4, '동작 4개 = bespoke 카드 (Kit.arrange 필드워커 아님)');
	assert.ok(collect(byId['form'], 'bs-name', descendants).length === 4, '동작 이름 헤더');
	assert.ok(collect(byId['form'], 'bs-trace', descendants).length > 0, '추적 칩 줄(← UC / → AC)');
	assert.ok(collect(byId['form'], 'bs-ref', descendants).length > 0, 'ref 칩 = json 기존 ref 표시');
	assert.ok(collect(byId['form'], 'bs-blk', descendants).length > 0, '전제/결과 블록');
});

test('task-plan 읽기뷰 — TL;DR + 실행순 작업 + ADR/위험/NFR 섹션', () => {
	const { byId, descendants } = runApp('task-plan'); // poc-14 = tasks4 adrs2 risks4 nfr4
	assert.equal(collect(byId['form'], 'tp-tldr', descendants).length, 1, '한눈 요약(TL;DR) 1개');
	const heads = collect(byId['form'], 'sec-head', descendants).map((e) => e.textContent).join(' | ');
	assert.ok(/작업/.test(heads), '작업 섹션');
	assert.ok(/설계 결정/.test(heads), 'ADR 섹션');
	assert.ok(/위험/.test(heads), '위험 섹션');
	assert.ok(/비기능 요구/.test(heads), 'NFR 섹션');
	// 실행 순서 정렬 — tp-ord 가 비내림차순.
	const orders = collect(byId['form'], 'tp-ord', descendants).map((e) => Number(e.textContent));
	const sorted = orders.slice().sort((a, b) => a - b);
	assert.deepEqual(orders, sorted, '작업이 execution_order 로 정렬');
});

test('unit-spec 읽기뷰 — 유닛 카드 + 커버리지 통계', () => {
	const { byId, descendants } = runApp('unit-spec'); // poc-21 fixture
	assert.ok(collect(byId['form'], 'us-u', descendants).length > 0, '유닛 카드');
	assert.equal(collect(byId['form'], 'us-cov', descendants).length, 1, '커버리지 통계 블록');
});

test('acceptance-criteria 읽기뷰 — 기준 카드 + 추적(시나리오는 위 테스트)', () => {
	const { byId, descendants } = runApp('acceptance-criteria');
	assert.equal(collect(byId['form'], 'ac-c', descendants).length, 4, '인수기준 4개 카드');
	assert.ok(collect(byId['form'], 'ac-trace', descendants).length > 0, '추적 칩(← 동작 / → 테스트)');
});

test('잠금 — provenance/구조는 ro-val(비클릭), 클릭 대상에 잠금 경로 없음', () => {
	const { byId, descendants } = runApp('task-plan');
	const roVals = collect(byId['form'], 'ro-val', descendants);
	assert.ok(roVals.length > 0, 'ro-val 존재');
	const clickable = descendants(byId['form'], []).filter((d) => (d.className ? String(d.className).split(/\s+/) : []).includes('val'));
	clickable.forEach((el) => {
		const a = el.dataset.anchor || '';
		assert.ok(!/^meta\b/.test(a) && !/\.id$/.test(a) && !/\.ac_refs\[/.test(a), `잠금 경로(${a}) 클릭 대상 아님`);
	});
});

test('큐레이션 — 잠긴 구조는 card-structure 토글, 내용은 전면', () => {
	const { byId, descendants } = runApp('task-plan');
	const structs = collect(byId['form'], 'card-structure', descendants);
	assert.ok(structs.length > 0, '구조 토글 존재');
	structs.forEach((s) => assert.equal(collect(s, 'prose', descendants).length, 0, '내용 prose 는 토글 밖'));
});

test('AI 요약 — summaries 주입 시 라벨+요약 표시', () => {
	const { byId, descendants } = runApp('discovery-spec', { summaries: { 'use_cases[0]': { summary: '가입 흐름 요약' } } });
	const tags = collect(byId['form'], 'ai-tag', descendants);
	assert.ok(tags.some((t) => /원문 아님/.test(t.textContent)), 'AI 요약 라벨');
	const texts = collect(byId['form'], 'ai-text', descendants);
	assert.ok(texts.some((t) => t.textContent.includes('가입 흐름 요약')), '요약 본문');
});

test('agent-reply — 배너 텍스트 표시 (닫힌 루프)', () => {
	const { byId } = runApp('task-plan', { agentReply: '작업을 둘로 쪼갰습니다' });
	assert.equal(byId['agent-reply'].hidden, false, '배너 표시');
	assert.equal(byId['agent-reply'].querySelector('.ar-text').textContent, '작업을 둘로 쪼갰습니다');
});

// ---- 멀티(phase) 브라우저 경로 런타임 가드 — 탭 + 3 렌더 throw 없음 ----
const ALL_RENDERERS = ['generic', 'task-plan', 'discovery-spec', 'behavior-spec', 'unit-spec', 'acceptance-criteria']
	.map((r) => readFileSync(join(ASSETS, 'renderers', `${r}.js`), 'utf-8')).join('\n');

function runMulti(docTypes) {
	const docs = docTypes.map((at) => {
		const schema = JSON.parse(readFileSync(join(REPO, 'schemas', `${at}.schema.json`), 'utf-8'));
		const data = JSON.parse(readFileSync(join(fixtureDir(at), `${at}.json`), 'utf-8'));
		return { artifactType: at, label: at, data, fieldModel: buildFieldModel(data, schema), summaries: null };
	});
	const { allEls, makeEl, descendants } = makeStub();
	const byId = {};
	const ensure = (id) => (byId[id] || (byId[id] = makeEl('div')));
	ensure('documents').textContent = JSON.stringify(docs);
	ensure('artifact-data').textContent = 'null';
	ensure('field-model').textContent = JSON.stringify({ leaves: [] });
	ensure('gate-summary-data').textContent = 'null';
	ensure('meta-data').textContent = JSON.stringify({ phase: 'spec', label: 'spec (명세)', taskPlanPath: '/x/spec' });
	ensure('ai-summaries').textContent = 'null';
	['form', 'gate-summary', 'prompt-list', 'pcount', 'btn-apply', 'chat-input', 'chat-add',
		'popover', 'pop-anchor', 'pop-cur', 'pop-sel', 'pop-input', 'pop-save', 'pop-del', 'pop-cancel',
		'verdict-badge', 'headline', 'meta', 'artifact-title', 'result'].forEach(ensure);
	const ar = ensure('agent-reply'); const arText = makeEl('span'); arText.className = 'ar-text'; ar.appendChild(arText);

	const sessionMem = {};
	const documentStub = {
		getElementById: (id) => ensure(id), createElement: (t) => makeEl(t),
		createTextNode: (t) => ({ nodeType: 3, textContent: String(t), children: [] }),
		addEventListener() {},
		querySelectorAll(sel) {
			if (sel === '[data-anchor]') return allEls.filter((d) => d.dataset && d.dataset.anchor != null);
			if (sel[0] === '.') return allEls.filter((d) => (d.className ? String(d.className).split(/\s+/) : []).includes(sel.slice(1)));
			return [];
		},
	};
	const windowStub = { getSelection: () => ({ isCollapsed: true, rangeCount: 0, toString: () => '' }), scrollY: 0, scrollX: 0, innerWidth: 1000, scrollTo() {}, addEventListener() {} };
	const sessionStub = { getItem: (k) => (k in sessionMem ? sessionMem[k] : null), setItem: (k, v) => { sessionMem[k] = String(v); }, removeItem: (k) => { delete sessionMem[k]; } };
	const fetchStub = () => Promise.resolve({ json: () => Promise.resolve({ version: '1' }) });
	const src = KIT_SRC + '\n' + ALL_RENDERERS + '\n' + APP_SRC;
	const runner = new Function('document', 'window', 'fetch', 'sessionStorage', 'setInterval', 'location', 'console', src);
	runner(documentStub, windowStub, fetchStub, sessionStub, () => 0, { reload() {} }, console);
	return { byId, allEls, descendants };
}

test('멀티 렌더 — spec 3종 탭 + throw 없음 + AC Gherkin', () => {
	let res;
	assert.doesNotThrow(() => { res = runMulti(['behavior-spec', 'unit-spec', 'acceptance-criteria']); }, '멀티 렌더 throw ❌');
	const tabs = collect(res.byId['form'], 'doc-tab', res.descendants);
	assert.equal(tabs.length, 3, '탭 3개');
	const panels = collect(res.byId['form'], 'doc-panel', res.descendants);
	assert.equal(panels.length, 3, '패널 3개');
	// AC 패널에 Gherkin 시나리오 스텝
	const steps = collect(res.byId['form'], 'scn-step', res.descendants);
	assert.ok(steps.length > 0, '한 페이지 안에 AC Gherkin 시나리오');
});
