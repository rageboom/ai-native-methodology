import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from '../src/server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..', '..');
const TOOLS = join(REPO, 'tools');
const SCHEMA = JSON.parse(
	readFileSync(join(REPO, 'schemas', 'task-plan.schema.json'), 'utf-8'),
);
const POC = join(
	REPO,
	'examples',
	'poc-14-fsim-corroboration',
	'.ai-context',
	'output',
);

let workDir, taskPlanPath, acceptancePath, server, base;

before(async () => {
	workDir = mkdtempSync(join(tmpdir(), 'plan-review-srv-'));
	taskPlanPath = join(workDir, 'task-plan.json');
	acceptancePath = join(workDir, 'acceptance-criteria.json');
	copyFileSync(join(POC, 'task-plan.json'), taskPlanPath);
	copyFileSync(join(POC, 'acceptance-criteria.json'), acceptancePath);
	server = createServer({
		taskPlanPath,
		acceptancePath,
		schema: SCHEMA,
		projectRoot: null, // gate 평결 생략 (graceful degrade)
		validatorCli: join(TOOLS, 'plan-coverage-validator', 'src', 'cli.js'),
	});
	await new Promise((r) => server.listen(0, '127.0.0.1', r));
	base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
	server.close();
	rmSync(workDir, { recursive: true, force: true });
});

test('GET / — 폼 HTML (평결 없어도 graceful)', async () => {
	const r = await fetch(base + '/');
	assert.equal(r.status, 200);
	assert.match(r.headers.get('content-type'), /text\/html/);
	const html = await r.text();
	assert.ok(html.includes('TASK-USER-FSIM-001'), 'task-plan 인라인');
	assert.ok(html.includes('id="form"'), '폼 섹션');
	assert.equal(/__[A-Z_]+__/.test(html), false, '잔여 placeholder 없음');
});

test('GET /summary — projectRoot 없으면 null', async () => {
	const r = await fetch(base + '/summary');
	assert.equal(r.status, 200);
	assert.equal(await r.json(), null);
});

test('POST /apply — 싼 변경(title) → cheap + task-plan 반영', async () => {
	const r = await fetch(base + '/apply', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ edits: { 'tasks[0].title': 'HTTP 경유 제목' }, comments: [] }),
	});
	assert.equal(r.status, 200);
	const out = await r.json();
	assert.equal(out.branch, 'cheap');
	const written = JSON.parse(readFileSync(taskPlanPath, 'utf-8'));
	assert.equal(written.tasks[0].title, 'HTTP 경유 제목');
});

test('POST /apply — 코멘트 동반 → expensive', async () => {
	const r = await fetch(base + '/apply', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			edits: {},
			// description = 내용(열림). ac_refs 등 추적링크는 이제 잠겨 belt 가 거부하므로 사용 ❌.
			comments: [{ anchor: 'tasks[0].description', text: '설명을 더 명확히' }],
		}),
	});
	const out = await r.json();
	assert.equal(out.branch, 'expensive');
});

test('GET /version — task-plan mtime 토큰', async () => {
	const r = await fetch(base + '/version');
	assert.equal(r.status, 200);
	const v = await r.json();
	assert.match(v.version, /^\d+$/);
});

test('POST /apply — selected_text + 전역(anchor=null) 코멘트 캐리 → task-plan-revisions.json', async () => {
	const r = await fetch(base + '/apply', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			edits: {},
			comments: [
				{ anchor: 'adrs[0].decision', label: 'ADR1·결정', text: '근거 약함', selected_text: 'argon2id' },
				{ anchor: null, label: '전체 의견', text: '보안 작업을 먼저' },
			],
		}),
	});
	const out = await r.json();
	assert.equal(out.branch, 'expensive');
	const rev = JSON.parse(readFileSync(join(workDir, 'task-plan-revisions.json'), 'utf-8'));
	const sel = rev.comments.find((c) => c.selected_text);
	assert.equal(sel.selected_text, 'argon2id', 'selected_text 캐리');
	assert.ok(rev.comments.some((c) => c.anchor === null), '전역 코멘트(anchor=null) 캐리');
});

test('onApply 콜백 — apply 시 payload 전달 (poll 핸드오프 hook)', async () => {
	let captured = null;
	const srv = createServer({
		taskPlanPath,
		acceptancePath,
		schema: SCHEMA,
		validatorCli: join(TOOLS, 'plan-coverage-validator', 'src', 'cli.js'),
		onApply: (result, parsed) => {
			captured = { branch: result.branch, n: parsed.comments.length };
		},
	});
	await new Promise((r) => srv.listen(0, '127.0.0.1', r));
	const b2 = `http://127.0.0.1:${srv.address().port}`;
	await fetch(b2 + '/apply', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ edits: {}, comments: [{ anchor: null, text: 'x' }] }),
	});
	srv.close();
	assert.ok(captured, 'onApply 호출됨');
	assert.equal(captured.branch, 'expensive');
	assert.equal(captured.n, 1);
});

test('★ 닫힌 루프 — apply → 산출물 v2 덮어쓰기 → /version 변함 (리로드 트리거)', async () => {
	const v1 = (await (await fetch(base + '/version')).json()).version;
	// 1) 사람이 프롬프트 apply (revision 기록 / 산출물 불변 → version 안 변함 = 조기 리로드 ❌)
	await fetch(base + '/apply', {
		method: 'POST', headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ edits: {}, comments: [{ anchor: 'tasks[0].title', text: '쪼개줘' }] }),
	});
	const vAfterApply = (await (await fetch(base + '/version')).json()).version;
	assert.equal(vAfterApply, v1, 'apply 만으로는 version 불변(재설계 중 조기 리로드 방지)');
	// 2) 에이전트 재설계 시뮬 — 산출물을 같은 경로에 덮어씀
	const plan = JSON.parse(readFileSync(taskPlanPath, 'utf-8'));
	plan.tasks[0].title = '재설계됨 — Signup 분리';
	writeFileSync(taskPlanPath, JSON.stringify(plan, null, 2) + '\n');
	const v2 = (await (await fetch(base + '/version')).json()).version;
	assert.notEqual(v2, v1, '산출물 변경 → version 변함 = 브라우저 리로드 트리거');
	// 3) 갱신된 HTML 이 새 내용 반영
	const html = await (await fetch(base + '/')).text();
	assert.ok(html.includes('재설계됨 — Signup 분리'), '리로드 시 새 산출물 내용');
});

test('agent-reply — createServer agentReply 가 meta 에 실려 배너로', async () => {
	const srv = createServer({
		taskPlanPath, acceptancePath, schema: SCHEMA,
		validatorCli: join(TOOLS, 'plan-coverage-validator', 'src', 'cli.js'),
		agentReply: '작업을 둘로 쪼갰습니다',
	});
	await new Promise((r) => srv.listen(0, '127.0.0.1', r));
	const html = await (await fetch(`http://127.0.0.1:${srv.address().port}/`)).text();
	srv.close();
	assert.ok(html.includes('작업을 둘로 쪼갰습니다'), 'agentReply 가 meta 로 인라인 → 배너');
	assert.ok(html.includes('id="agent-reply"'), 'agent-reply 배너 엘리먼트');
});

test('404 — 알 수 없는 경로', async () => {
	const r = await fetch(base + '/nope');
	assert.equal(r.status, 404);
});
