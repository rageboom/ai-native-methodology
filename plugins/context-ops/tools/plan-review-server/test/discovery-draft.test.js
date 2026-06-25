// discovery-draft.test.js — 게이트①(DEC-2026-06-25-discovery-2-gate) 검증.
//   ① PHASES['discovery-draft']  ② buildHtmlMulti: draft=D3+renderer 인라인 / final=경량(D3 ❌)
//   ③ multi 서버 renderAs 전파  ④ POST /confirm-scope 화이트리스트 write + onConfirm
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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
const SCHEMA = JSON.parse(readFileSync(join(REPO, 'schemas', 'discovery-spec.schema.json'), 'utf-8'));

function draftSpec() {
	return {
		meta: { confidence: 'medium' },
		finalization_status: 'draft',
		business_intent: { domain_purpose: '메모를 작성/삭제하는 앱', stakeholders: ['user'], success_criteria: ['작성 성공'] },
		use_cases: [
			{ id: 'UC-NOTES-001', name: '메모 작성', description: '사용자가 본문을 입력해 메모를 작성한다.', in_scope: true },
			{ id: 'UC-NOTES-002', name: '메모 삭제', description: '작성자가 자신의 메모를 삭제한다.', in_scope: true },
		],
		uc_dependencies: [{ from_uc: 'UC-NOTES-002', to_uc: 'UC-NOTES-001', grade: 'MUST' }],
		conflicts: [{ id: 'CONF-1', classification: 'requirement-conflict', description: '삭제 권한 범위 충돌', resolved: false }],
		open_questions: [{ id: 'OQ-1', question: '비로그인 작성 허용?', category: 'ambiguity', status: 'open' }],
	};
}

test('PHASES — discovery-draft = discovery-spec 를 renderAs=discovery-draft 로', () => {
	assert.deepEqual(PHASES['discovery-draft'].artifacts, ['discovery-spec']);
	assert.equal(PHASES['discovery-draft'].renderAs, 'discovery-draft');
});

test('buildHtmlMulti — discovery-draft: 공유 묶음 렌더러 + /confirm-scope 인라인 (그래프 라이브러리 불요)', () => {
	const data = draftSpec();
	const doc = { artifactType: 'discovery-spec', renderAs: 'discovery-draft', label: 'discovery (draft)', data, fieldModel: buildFieldModel(data, SCHEMA), summaries: null, difficulty: { degraded: true, use_cases: {} } };
	const html = buildHtmlMulti({ documents: [doc], meta: { phase: 'discovery-draft' } });
	assert.ok(html.includes('renderScopeGroups'), 'discovery-draft 렌더러(공유 묶음 뷰) 인라인');
	assert.ok(html.includes('공유 묶음'), '공유 묶음 섹션 라벨');
	assert.ok(html.includes('/confirm-scope'), '구조적 선택 엔드포인트 배선');
	assert.ok(html.includes('UC-NOTES-001'), 'UC 데이터 포함');
	assert.equal(html.includes('d3js.org'), false, '공유 묶음 뷰는 그래프 라이브러리 미인라인(경량)');
	assert.equal(/__[A-Z_]+__/.test(html), false, '잔여 placeholder 없음');
});

test('buildHtmlMulti — discovery (final): draft 렌더러 미인라인', () => {
	const data = draftSpec();
	data.finalization_status = 'final';
	const doc = { artifactType: 'discovery-spec', label: 'discovery', data, fieldModel: buildFieldModel(data, SCHEMA), summaries: null, difficulty: null };
	const html = buildHtmlMulti({ documents: [doc], meta: { phase: 'discovery' } });
	assert.equal(html.includes('renderScopeGroups'), false, 'draft 렌더러 미인라인(최종 뷰는 기존 렌더러)');
});

// ---- 멀티 서버 (renderAs 전파 + /confirm-scope) ----
let workDir, server, base, specPath, confirmCapture;
before(async () => {
	workDir = mkdtempSync(join(tmpdir(), 'discovery-draft-'));
	const out = join(workDir, '.ai-context', 'output');
	mkdirSync(out, { recursive: true });
	specPath = join(out, 'discovery-spec.json');
	writeFileSync(specPath, JSON.stringify(draftSpec(), null, 2));
	const documents = [{ artifactType: 'discovery-spec', path: specPath, schema: SCHEMA, label: 'discovery (draft)' }];
	confirmCapture = null;
	server = createServer({ documents, phase: 'discovery-draft', phaseLabel: 'discovery (draft)', onConfirm: (r) => { confirmCapture = r; } });
	await new Promise((r) => server.listen(0, '127.0.0.1', r));
	base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); rmSync(workDir, { recursive: true, force: true }); });

test('멀티 서버 GET / — discovery-draft phase 가 renderAs 전파', async () => {
	const html = await (await fetch(base + '/')).text();
	const m = html.match(/<script[^>]*id="documents"[^>]*>([\s\S]*?)<\/script>/);
	assert.ok(m, 'documents 인라인');
	const docs = JSON.parse(m[1]);
	assert.equal(docs[0].renderAs, 'discovery-draft', 'renderAs 전파');
	assert.ok(html.includes('renderScopeGroups'), '서버 경로에서도 공유 묶음 렌더러 인라인');
});

test('POST /confirm-scope — 사람 소유 필드만 write + finalization_status=confirmed', async () => {
	const r = await fetch(base + '/confirm-scope', {
		method: 'POST', headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			scope: [{ uc_id: 'UC-NOTES-002', in_scope: false }],
			conflicts: [{ id: 'CONF-1', resolved: true, resolution_ref: 'BR-NOTES-DELETE-01 로 결정' }],
			open_questions: [{ id: 'OQ-1', answer: '아니오 — 로그인 필수', status: 'answered' }],
			use_cases: [{ id: 'HACK', name: 'injected' }], // 화이트리스트 밖 — 무시돼야
			finalization_status: 'final', // 무시 — 서버가 confirmed 강제
		}),
	});
	const res = await r.json();
	assert.equal(r.status, 200);
	assert.equal(res.finalization_status, 'confirmed');
	assert.deepEqual(res.touched, { scope: 1, conflicts: 1, open_questions: 1, added: 0 });

	const spec = JSON.parse(readFileSync(specPath, 'utf-8'));
	assert.equal(spec.finalization_status, 'confirmed', '서버가 confirmed 강제');
	assert.equal(spec.use_cases.length, 2, '화이트리스트 밖 use_cases 주입 무시');
	const uc2 = spec.use_cases.find((u) => u.id === 'UC-NOTES-002');
	const uc1 = spec.use_cases.find((u) => u.id === 'UC-NOTES-001');
	assert.equal(uc2.in_scope, false, '범위 토글 반영');
	assert.equal(uc1.in_scope, true, '미선택 UC 불변');
	assert.equal(spec.conflicts[0].resolved, true, '충돌 해소 반영');
	assert.equal(spec.conflicts[0].resolution_ref, 'BR-NOTES-DELETE-01 로 결정', '결정 ref 반영');
	assert.equal(spec.open_questions[0].answer, '아니오 — 로그인 필수', '질문 답 반영');
	assert.equal(spec.open_questions[0].status, 'answered', '질문 상태 반영');
	assert.ok(confirmCapture && confirmCapture.finalization_status === 'confirmed', 'onConfirm 콜백 발화 (poll 핸드오프)');
});

test('POST /confirm-scope — added_use_cases: 신규 UC 추가 (change_type=new / id 결정론 생성)', async () => {
	const before = JSON.parse(readFileSync(specPath, 'utf-8')).use_cases.length;
	const r = await fetch(base + '/confirm-scope', {
		method: 'POST', headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ scope: [], conflicts: [], open_questions: [], added_use_cases: [{ name: '메모 일괄 삭제', description: '여러 메모를 한 번에 삭제한다.' }] }),
	});
	const res = await r.json();
	assert.equal(res.touched.added, 1, '추가 1건 반영');
	const spec = JSON.parse(readFileSync(specPath, 'utf-8'));
	assert.equal(spec.use_cases.length, before + 1, 'use_cases 1개 증가');
	const added = spec.use_cases[spec.use_cases.length - 1];
	assert.equal(added.change_type, 'new', '신규 표시');
	assert.equal(added.in_scope, true, '신규는 기본 포함');
	assert.match(added.id, /^UC-[A-Z0-9_-]+-\d{3}$/, 'id 패턴 결정론 생성');
	assert.equal(added.name, '메모 일괄 삭제', '사람 입력 이름 보존');
	assert.deepEqual(added.source_grounded_evidence, [], '신규는 레거시 근거 없음(면제)');
});

test('POST /confirm-scope — discovery-spec 없는 phase 면 409', async () => {
	const proj = mkdtempSync(join(tmpdir(), 'discovery-draft-noc-'));
	const out = join(proj, '.ai-context', 'output');
	mkdirSync(out, { recursive: true });
	const tpPath = join(out, 'task-plan.json');
	writeFileSync(tpPath, JSON.stringify({ meta: {}, tasks: [] }));
	const tpSchema = JSON.parse(readFileSync(join(REPO, 'schemas', 'task-plan.schema.json'), 'utf-8'));
	const srv = createServer({ documents: [{ artifactType: 'task-plan', path: tpPath, schema: tpSchema, label: 'plan' }], phase: 'plan' });
	await new Promise((r) => srv.listen(0, '127.0.0.1', r));
	const b = `http://127.0.0.1:${srv.address().port}`;
	try {
		const r = await fetch(b + '/confirm-scope', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
		assert.equal(r.status, 409, 'discovery-spec 없으면 거부');
	} finally {
		srv.close();
		rmSync(proj, { recursive: true, force: true });
	}
});

// ---- CLI --phase discovery-draft end-to-end (runPhase 배선 + PLAN_REVIEW_CONFIRM 마커) ----
test('CLI --phase discovery-draft — 서버 spawn + /confirm-scope → PLAN_REVIEW_CONFIRM 마커', async () => {
	const proj = mkdtempSync(join(tmpdir(), 'discovery-draft-cli-'));
	const out = join(proj, '.ai-context', 'output');
	mkdirSync(out, { recursive: true });
	writeFileSync(join(out, 'discovery-spec.json'), JSON.stringify(draftSpec(), null, 2));
	const cli = join(__dirname, '..', 'src', 'cli.js');
	const child = spawn(process.execPath, [cli, '--phase', 'discovery-draft', '--project', proj, '--no-open', '--port', '0'], { stdio: ['ignore', 'pipe', 'pipe'] });
	let stdout = '';
	child.stdout.on('data', (d) => { stdout += d.toString(); });
	try {
		const port = await new Promise((res, rej) => {
			let buf = '';
			const to = setTimeout(() => rej(new Error('서버 URL 타임아웃: ' + buf)), 8000);
			child.stderr.on('data', (d) => {
				buf += d.toString();
				const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
				if (m) { clearTimeout(to); res(Number(m[1])); }
			});
			child.on('exit', (c) => { clearTimeout(to); rej(new Error('조기 종료 code=' + c + ' / ' + buf)); });
		});
		const html = await (await fetch(`http://127.0.0.1:${port}/`)).text();
		assert.ok(html.includes('renderScopeGroups'), 'CLI 경로 공유 묶음 렌더러');
		assert.ok(html.includes('공유 묶음'), 'CLI 경로 공유 묶음 섹션');
		const r = await fetch(`http://127.0.0.1:${port}/confirm-scope`, {
			method: 'POST', headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ scope: [{ uc_id: 'UC-NOTES-001', in_scope: true }], conflicts: [], open_questions: [] }),
		});
		const res = await r.json();
		assert.equal(res.finalization_status, 'confirmed');
		// 마커 propagation (poll 핸드오프)
		await new Promise((r) => setTimeout(r, 200));
		assert.ok(stdout.includes('PLAN_REVIEW_URL http://127.0.0.1:' + port + '/'), 'CLI 가 PLAN_REVIEW_URL 결정론 마커 출력(URL 항상 제시)');
		assert.ok(stdout.includes('PLAN_REVIEW_CONFIRM'), 'CLI 가 PLAN_REVIEW_CONFIRM 마커 출력 (detail-fill 트리거)');
	} finally {
		child.kill('SIGTERM');
		rmSync(proj, { recursive: true, force: true });
	}
});
