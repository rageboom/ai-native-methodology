// difficulty-wire.test.js — S1 통합: GET / 응답에 난이도 reference-lens 가 실리는지 + degrade.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from '../src/server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..', '..');
const SCHEMA = JSON.parse(readFileSync(join(REPO, 'schemas', 'discovery-spec.schema.json'), 'utf-8'));

const SPEC = {
	meta: { generated_at: '2026-06-24', methodology_version: 'test', confidence: 0.8 },
	derivation_source: { type: 'legacy-extraction', source_artifacts: [] },
	business_intent: { domain_purpose: 'test', stakeholders: [], success_criteria: [] },
	use_cases: [
		{ id: 'UC-BIG-001', name: '큰 UC', actors: ['User'], acceptance_criteria_refs: ['AC-BIG-001'] },
		{ id: 'UC-SMALL-001', name: '작은 UC', actors: ['User'], acceptance_criteria_refs: ['AC-SMALL-001'] },
	],
};

function node(id) { return { id, state: 'active' }; }
function edge(source, target, edge_type) { return { source, target, edge_type, confidence: 'hard' }; }
function buildGraph() {
	const nodes = [node('UC-BIG-001'), node('UC-SMALL-001')];
	const edges = [];
	for (let b = 1; b <= 3; b++) {
		const bhv = `BHV-BIG-00${b}`;
		nodes.push(node(bhv));
		edges.push(edge(bhv, 'UC-BIG-001', 'derived_from'));
		for (let a = 1; a <= 2; a++) {
			const ac = `AC-BIG-${b}${a}`; const tc = `TC-BIG-${b}${a}`;
			nodes.push(node(ac), node(tc));
			edges.push(edge(ac, bhv, 'derived_from'), edge(tc, ac, 'tests'));
		}
	}
	nodes.push(node('BHV-SMALL-001'), node('AC-SMALL-001'));
	edges.push(edge('BHV-SMALL-001', 'UC-SMALL-001', 'derived_from'));
	edges.push(edge('AC-SMALL-001', 'BHV-SMALL-001', 'derived_from'));
	return { nodes, edges };
}

function makeServer(withGraph) {
	const work = mkdtempSync(join(tmpdir(), 'plan-review-diff-'));
	const out = join(work, '.ai-context', 'output');
	mkdirSync(out, { recursive: true });
	writeFileSync(join(out, 'discovery-spec.json'), JSON.stringify(SPEC));
	if (withGraph) writeFileSync(join(out, 'artifact-graph.json'), JSON.stringify(buildGraph()));
	const documents = [{ artifactType: 'discovery-spec', path: join(out, 'discovery-spec.json'), schema: SCHEMA, label: 'discovery-spec' }];
	const server = createServer({ documents, phase: 'discovery', phaseLabel: 'discovery (발견)' });
	return { work, server };
}

let withG, noG;
before(async () => {
	withG = makeServer(true);
	noG = makeServer(false);
	await new Promise((r) => withG.server.listen(0, '127.0.0.1', r));
	await new Promise((r) => noG.server.listen(0, '127.0.0.1', r));
});
after(() => {
	withG.server.close(); noG.server.close();
	rmSync(withG.work, { recursive: true, force: true });
	rmSync(noG.work, { recursive: true, force: true });
});

test('GET / — artifact-graph 있으면 난이도 reference-lens 임베드 (L 버킷)', async () => {
	const url = `http://127.0.0.1:${withG.server.address().port}/`;
	const html = await (await fetch(url)).text();
	assert.ok(html.includes('"difficulty"'), 'difficulty 필드 임베드');
	assert.ok(html.includes('"bucket":"L"'), 'UC-BIG → L 버킷');
	assert.ok(html.includes('"bucket":"S"'), 'UC-SMALL → S 버킷');
	assert.ok(html.includes('difficultyBadge'), 'kit 뱃지 렌더 함수 번들');
	assert.equal(/__[A-Z_]+__/.test(html), false, '잔여 placeholder 없음');
});

test('GET / — artifact-graph 부재(greenfield) = degraded 임베드', async () => {
	const url = `http://127.0.0.1:${noG.server.address().port}/`;
	const html = await (await fetch(url)).text();
	assert.ok(html.includes('"degraded":true'), 'degraded:true 임베드');
	assert.ok(!html.includes('"bucket":"L"'), 'degraded 면 버킷 미산출');
});
