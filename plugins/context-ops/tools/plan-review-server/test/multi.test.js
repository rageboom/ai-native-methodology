import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, copyFileSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { buildHtmlMulti } from '../src/emit.js';
import { buildFieldModel } from '../src/field-classify.js';
import { createServer } from '../src/server.js';
import { PHASES } from '../src/artifact-registry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..', '..');
const POC = join(REPO, 'examples', 'poc-14-fsim-corroboration', '.ai-context', 'output');
const UNIT_POC = join(REPO, 'examples', 'poc-21-greenfield-money-allocation', '.ai-context', 'output');

function loadDoc(artifactType, pocDir) {
	const schema = JSON.parse(readFileSync(join(REPO, 'schemas', `${artifactType}.schema.json`), 'utf-8'));
	const data = JSON.parse(readFileSync(join(pocDir, `${artifactType}.json`), 'utf-8'));
	return { artifactType, label: artifactType, data, fieldModel: buildFieldModel(data, schema) };
}

test('PHASES — spec = behavior+unit+ac 3종', () => {
	assert.deepEqual(PHASES.spec.artifacts, ['behavior-spec', 'unit-spec', 'acceptance-criteria']);
	assert.deepEqual(PHASES.discovery.artifacts, ['discovery-spec']);
	assert.deepEqual(PHASES.plan.artifacts, ['task-plan']);
});

test('buildHtmlMulti — 한 페이지에 3 렌더러 + documents 인라인 + 탭 부트', () => {
	const docs = [
		loadDoc('behavior-spec', POC),
		loadDoc('unit-spec', UNIT_POC),
		loadDoc('acceptance-criteria', POC),
	];
	const html = buildHtmlMulti({ documents: docs, meta: { phase: 'spec', label: 'spec (명세)' } });
	assert.ok(html.includes('var Kit'), 'kit 인라인');
	// 3 렌더러 모두 등록 (RENDERERS['behavior-spec'] 등)
	assert.ok(html.includes("RENDERERS['behavior-spec']"), 'behavior 렌더러');
	assert.ok(html.includes("RENDERERS['unit-spec']"), 'unit 렌더러');
	assert.ok(html.includes("RENDERERS['acceptance-criteria']"), 'ac 렌더러 (Gherkin)');
	assert.ok(html.includes('scenarioNode'), 'AC Gherkin bespoke 포함');
	assert.ok(html.includes('id="documents"'), 'documents 블록');
	assert.equal(/__[A-Z_]+__/.test(html), false, '잔여 placeholder 없음');
});

// ---- 멀티 서버 (GET / + apply 라우팅) ----
let workDir, server, base;
before(async () => {
	workDir = mkdtempSync(join(tmpdir(), 'plan-review-multi-'));
	const out = join(workDir, '.ai-context', 'output');
	mkdirSync(out, { recursive: true });
	copyFileSync(join(POC, 'behavior-spec.json'), join(out, 'behavior-spec.json'));
	copyFileSync(join(UNIT_POC, 'unit-spec.json'), join(out, 'unit-spec.json'));
	copyFileSync(join(POC, 'acceptance-criteria.json'), join(out, 'acceptance-criteria.json'));
	const documents = PHASES.spec.artifacts.map((at) => ({
		artifactType: at,
		path: join(out, `${at}.json`),
		schema: JSON.parse(readFileSync(join(REPO, 'schemas', `${at}.schema.json`), 'utf-8')),
		label: at,
	}));
	server = createServer({ documents, phase: 'spec', phaseLabel: 'spec (명세)' });
	await new Promise((r) => server.listen(0, '127.0.0.1', r));
	base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); rmSync(workDir, { recursive: true, force: true }); });

test('멀티 서버 GET / — 한 페이지에 3 산출물 데이터', async () => {
	const html = await (await fetch(base + '/')).text();
	assert.equal(/__[A-Z_]+__/.test(html), false, '잔여 placeholder 없음');
	assert.ok(html.includes('var Kit'), 'kit 인라인');
	assert.ok(html.includes('id="documents"'), 'documents 블록');
});

test('멀티 서버 POST /apply — 코멘트를 산출물별 그룹으로 라우팅', async () => {
	const r = await fetch(base + '/apply', {
		method: 'POST', headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ comments: [
			{ anchor: 'behaviors[0].description', text: '동작 설명 보강' },
			{ anchor: 'criteria[0].description', text: 'AC 보강' },
			{ anchor: null, text: '전체 의견' },
		] }),
	});
	const out = await r.json();
	assert.equal(out.branch, 'expensive');
	assert.ok(out.groups['behavior-spec'], 'behaviors → behavior-spec 그룹');
	assert.ok(out.groups['acceptance-criteria'], 'criteria → acceptance-criteria 그룹');
	assert.ok(out.groups['_global'], '전역 코멘트 그룹');
	assert.ok(existsSync(join(workDir, '.ai-context', 'output', 'spec-revisions.json')), 'phase revision 파일');
});

test('멀티 서버 /apply — 잠긴 anchor(id) 코멘트는 belt 가 거부', async () => {
	const r = await fetch(base + '/apply', {
		method: 'POST', headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ comments: [{ anchor: 'behaviors[0].id', text: 'ID 바꿔' }] }),
	});
	const out = await r.json();
	assert.ok(out.rejected_locked.includes('behaviors[0].id'), 'id 코멘트 거부');
});

// ---- CLI --phase + --summaries (산출물별 nesting 분배) end-to-end ----
test('CLI --phase + --summaries — nested 요약을 산출물별 document 로 분배', async () => {
	const proj = mkdtempSync(join(tmpdir(), 'plan-review-cli-'));
	const out = join(proj, '.ai-context', 'output');
	mkdirSync(out, { recursive: true });
	copyFileSync(join(POC, 'behavior-spec.json'), join(out, 'behavior-spec.json'));
	copyFileSync(join(UNIT_POC, 'unit-spec.json'), join(out, 'unit-spec.json'));
	copyFileSync(join(POC, 'acceptance-criteria.json'), join(out, 'acceptance-criteria.json'));
	const sumPath = join(proj, 'sum.json');
	// unit-spec 의도적 생략 → 미제공 산출물은 summaries=null 이어야 한다.
	writeFileSync(sumPath, JSON.stringify({
		'behavior-spec': { 'behaviors[0]': { summary: 'BHVSUMMARY_MARKER' } },
		'acceptance-criteria': { 'criteria[0]': { summary: 'ACSUMMARY_MARKER' } },
	}));
	const cli = join(__dirname, '..', 'src', 'cli.js');
	const child = spawn(process.execPath,
		[cli, '--phase', 'spec', '--project', proj, '--summaries', sumPath, '--no-open', '--port', '0'],
		{ stdio: ['ignore', 'ignore', 'pipe'] });
	try {
		const port = await new Promise((res, rej) => {
			let buf = '';
			const to = setTimeout(() => rej(new Error('서버 URL 타임아웃: ' + buf)), 8000);
			child.stderr.on('data', (d) => {
				buf += d.toString();
				const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
				if (m) { clearTimeout(to); res(Number(m[1])); }
			});
			child.on('error', (e) => { clearTimeout(to); rej(e); });
			child.on('exit', (c) => { clearTimeout(to); rej(new Error('조기 종료 code=' + c + ' / ' + buf)); });
		});
		const html = await (await fetch(`http://127.0.0.1:${port}/`)).text();
		const m = html.match(/<script[^>]*id="documents"[^>]*>([\s\S]*?)<\/script>/);
		assert.ok(m, 'documents 인라인 블록 존재');
		const docs = JSON.parse(m[1]);
		const bhv = docs.find((d) => d.artifactType === 'behavior-spec');
		const unit = docs.find((d) => d.artifactType === 'unit-spec');
		const ac = docs.find((d) => d.artifactType === 'acceptance-criteria');
		assert.deepEqual(bhv.summaries, { 'behaviors[0]': { summary: 'BHVSUMMARY_MARKER' } }, 'behavior 요약 분배');
		assert.deepEqual(ac.summaries, { 'criteria[0]': { summary: 'ACSUMMARY_MARKER' } }, 'ac 요약 분배');
		assert.equal(unit.summaries, null, '요약 미제공 산출물은 null');
	} finally {
		child.kill('SIGTERM');
		rmSync(proj, { recursive: true, force: true });
	}
});
