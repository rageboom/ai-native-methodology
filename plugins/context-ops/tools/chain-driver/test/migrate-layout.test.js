// migrate-layout.test.js — 구 레이아웃 → base/scopes/runtime 인플레이스 이주.
// DEC-2026-06-16-ai-context-layout-restructure.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
	mkdtempSync,
	mkdirSync,
	writeFileSync,
	existsSync,
	readFileSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	planLayoutMigration,
	applyLayoutMigration,
} from '../src/migrate-layout.js';

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), 'migrate-layout-'));
});
after(() => {
	rmSync(tmp, { recursive: true, force: true });
});

let seq = 0;
function seedOldLayout() {
	const root = join(tmp, `p${seq++}`);
	const aimd = join(root, '.ai-context');
	const w = (rel, body = '{}') => {
		const p = join(aimd, rel);
		mkdirSync(join(p, '..'), { recursive: true });
		writeFileSync(p, body);
	};
	// 루트 싱글톤 (이동 ❌)
	w('state.json', JSON.stringify({ version: '1.0', current_chain: 'analysis' }));
	w('input.json');
	w('HANDOFF.md', '# handoff');
	w('baseline-2026-06-11.json');
	// output/ (analysis base + runtime 혼재)
	w('output/shared/domain.json');
	w('output/domains/BC-USER/business-rules.json');
	w('output/business-rules.json');
	w('output/antipatterns.json');
	w('output/findings-analysis.json'); // → runtime
	w('output/intervention-log.jsonl', '{}\n'); // → runtime
	w('output/evidence/test-stdout.log'); // → runtime (dir)
	w('output/codegraph.stdout.log'); // → runtime
	// 최상위 config/ → runtime/config/
	w('config/test-cmd.json');
	// 최상위 scope dir → scopes/
	w('core/manifest.json');
	w('core/impl/impl-spec.json');
	w('user-registration/manifest.json');
	// 스크래치 (미이동)
	w('cal-char-test-aggregate.xml', '<x/>');
	return root;
}

describe('planLayoutMigration', () => {
	it('classifies output/ → base vs runtime correctly', () => {
		const root = seedOldLayout();
		const plan = planLayoutMigration(root);
		const to = (suffix) =>
			plan.moves.find((m) => m.from.endsWith(suffix))?.to.replace(root, '');
		assert.match(to('output/shared'), /\.ai-context\/base\/shared$/);
		assert.match(to('output/domains'), /\.ai-context\/base\/domains$/);
		assert.match(to('output/business-rules.json'), /\.ai-context\/base\/business-rules\.json$/);
		assert.match(to('output/findings-analysis.json'), /\.ai-context\/runtime\/findings-analysis\.json$/);
		assert.match(to('output/intervention-log.jsonl'), /\.ai-context\/runtime\/intervention-log\.jsonl$/);
		assert.match(to('output/evidence'), /\.ai-context\/runtime\/evidence$/);
		assert.match(to('output/codegraph.stdout.log'), /\.ai-context\/runtime\/codegraph\.stdout\.log$/);
	});
	it('config/ → runtime/config/ , scopes → scopes/', () => {
		const root = seedOldLayout();
		const plan = planLayoutMigration(root);
		const to = (suffix) =>
			plan.moves.find((m) => m.from.endsWith(suffix))?.to.replace(root, '');
		assert.match(to('.ai-context/config'), /\.ai-context\/runtime\/config$/);
		assert.match(to('.ai-context/core'), /\.ai-context\/scopes\/core$/);
		assert.match(to('.ai-context/user-registration'), /\.ai-context\/scopes\/user-registration$/);
	});
	it('does NOT plan to move root singletons or scratch', () => {
		const root = seedOldLayout();
		const plan = planLayoutMigration(root);
		const froms = plan.moves.map((m) => m.from);
		assert.ok(!froms.some((f) => f.endsWith('state.json')));
		assert.ok(!froms.some((f) => f.endsWith('input.json')));
		assert.ok(!froms.some((f) => f.endsWith('HANDOFF.md')));
		assert.ok(!froms.some((f) => f.endsWith('baseline-2026-06-11.json')));
		assert.ok(!froms.some((f) => f.endsWith('cal-char-test-aggregate.xml')));
	});
});

describe('applyLayoutMigration', () => {
	it('migrates in place — buckets created, files relocated, root kept', () => {
		const root = seedOldLayout();
		const aimd = join(root, '.ai-context');
		const res = applyLayoutMigration(root);
		assert.equal(res.applied, true);
		// base/
		assert.ok(existsSync(join(aimd, 'base', 'shared', 'domain.json')));
		assert.ok(existsSync(join(aimd, 'base', 'domains', 'BC-USER', 'business-rules.json')));
		assert.ok(existsSync(join(aimd, 'base', 'business-rules.json')));
		// runtime/
		assert.ok(existsSync(join(aimd, 'runtime', 'findings-analysis.json')));
		assert.ok(existsSync(join(aimd, 'runtime', 'intervention-log.jsonl')));
		assert.ok(existsSync(join(aimd, 'runtime', 'evidence', 'test-stdout.log')));
		assert.ok(existsSync(join(aimd, 'runtime', 'config', 'test-cmd.json')));
		// scopes/
		assert.ok(existsSync(join(aimd, 'scopes', 'core', 'impl', 'impl-spec.json')));
		assert.ok(existsSync(join(aimd, 'scopes', 'user-registration', 'manifest.json')));
		// root kept
		assert.ok(existsSync(join(aimd, 'state.json')));
		assert.ok(existsSync(join(aimd, 'HANDOFF.md')));
		assert.ok(existsSync(join(aimd, 'baseline-2026-06-11.json')));
		assert.ok(existsSync(join(aimd, 'cal-char-test-aggregate.xml')), 'scratch 보존(미이동)');
		// 구 위치 비워짐
		assert.ok(!existsSync(join(aimd, 'output')), 'output/ 제거');
		assert.ok(!existsSync(join(aimd, 'config')), '최상위 config/ 제거');
		assert.ok(!existsSync(join(aimd, 'core')), '최상위 core/ 제거');
	});

	it('is idempotent — re-run is a no-op', () => {
		const root = seedOldLayout();
		applyLayoutMigration(root);
		const res2 = applyLayoutMigration(root);
		assert.equal(res2.applied, false);
		assert.equal(res2.alreadyMigrated, true);
	});

	it('dry-run does not touch disk', () => {
		const root = seedOldLayout();
		const aimd = join(root, '.ai-context');
		const res = applyLayoutMigration(root, { dryRun: true });
		assert.equal(res.applied, false);
		assert.equal(res.reason, 'dry-run');
		assert.ok(existsSync(join(aimd, 'output')), 'output/ 그대로');
		assert.ok(!existsSync(join(aimd, 'base')), 'base/ 미생성');
	});

	it('refuses on collision (half-migrated target exists)', () => {
		const root = seedOldLayout();
		const aimd = join(root, '.ai-context');
		// base/shared 를 미리 만들어 충돌 유발
		mkdirSync(join(aimd, 'base', 'shared'), { recursive: true });
		writeFileSync(join(aimd, 'base', 'shared', 'pre.json'), '{}');
		const res = applyLayoutMigration(root);
		assert.equal(res.applied, false);
		assert.equal(res.reason, 'collisions');
		assert.ok(res.collisions.length > 0);
		assert.ok(existsSync(join(aimd, 'output', 'shared', 'domain.json')), '충돌 시 원본 무손상');
	});

	it('no .ai-context → reason no .ai-context', () => {
		const root = join(tmp, 'empty-proj');
		mkdirSync(root, { recursive: true });
		const res = applyLayoutMigration(root);
		assert.equal(res.applied, false);
		assert.equal(res.noAimd, true);
	});
});
