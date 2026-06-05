// scope-dir.test.js — G3 R5/R7 산출물 폴더 자동 + manifest 이중 렌더링.
// RED 시점 (work-unit-manifest schema / state-store 신규 export 부재).

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
	mkdtempSync,
	rmSync,
	existsSync,
	readFileSync,
	readdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
	validateScopeSlug,
	scopeDirPath,
	ensureScopeDir,
	writeManifest,
	readManifest,
} from '../src/state-store.js';

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), 'chain-driver-scope-'));
});
after(() => {
	rmSync(tmp, { recursive: true, force: true });
});

const STAGES = ['discovery', 'spec', 'plan', 'test', 'impl']; // v9.0 6-stage manifest dirs

describe('validateScopeSlug', () => {
	it('accepts kebab-case lowercase', () => {
		assert.doesNotThrow(() => validateScopeSlug('user-registration'));
		assert.doesNotThrow(() => validateScopeSlug('payment-flow-v2'));
		assert.doesNotThrow(() => validateScopeSlug('a1'));
	});

	it('rejects uppercase', () => {
		assert.throws(
			() => validateScopeSlug('UserRegistration'),
			/invalid scope slug/i,
		);
	});

	it('rejects whitespace', () => {
		assert.throws(
			() => validateScopeSlug('user registration'),
			/invalid scope slug/i,
		);
	});

	it('rejects too short (< 2 chars)', () => {
		assert.throws(() => validateScopeSlug('a'), /invalid scope slug/i);
	});

	it('rejects too long (> 64 chars)', () => {
		assert.throws(
			() => validateScopeSlug('a'.repeat(65)),
			/invalid scope slug/i,
		);
	});

	it('rejects non-ASCII (Korean)', () => {
		assert.throws(() => validateScopeSlug('회원가입'), /invalid scope slug/i);
	});

	it('rejects path traversal', () => {
		assert.throws(() => validateScopeSlug('../etc'), /invalid scope slug/i);
		assert.throws(() => validateScopeSlug('a/b'), /invalid scope slug/i);
	});
});

describe('scopeDirPath', () => {
	it('returns scope root when stage omitted', () => {
		const p = scopeDirPath('/root', 'user-registration');
		assert.equal(p, join('/root', '.aimd', 'user-registration'));
	});

	it('returns stage subdir when stage supplied', () => {
		const p = scopeDirPath('/root', 'user-registration', 'discovery');
		assert.equal(p, join('/root', '.aimd', 'user-registration', 'discovery'));
	});

	it('rejects invalid stage', () => {
		assert.throws(
			() => scopeDirPath('/root', 'user-registration', 'foo'),
			/invalid stage/i,
		);
	});
});

describe('ensureScopeDir', () => {
	it('creates 5 stage dirs + scope root', () => {
		const root = join(tmp, 'p1');
		ensureScopeDir(root, 'user-registration');
		assert.ok(existsSync(join(root, '.aimd', 'user-registration')));
		for (const stage of STAGES) {
			assert.ok(
				existsSync(join(root, '.aimd', 'user-registration', stage)),
				`${stage} dir missing`,
			);
		}
	});

	it('seeds scope manifest with pending status', () => {
		const root = join(tmp, 'p2');
		ensureScopeDir(root, 'user-registration');
		const scopeManifestPath = join(
			root,
			'.aimd',
			'user-registration',
			'manifest.json',
		);
		assert.ok(existsSync(scopeManifestPath));
		const m = JSON.parse(readFileSync(scopeManifestPath, 'utf-8'));
		assert.equal(m.scope, 'user-registration');
		assert.equal(m.status, 'pending');
		assert.equal(m.current_stage, 'discovery');
		assert.ok(m.sync_state);
		assert.equal(m.sync_state.drift_detected, false);
	});

	it('seeds each stage manifest with pending status', () => {
		const root = join(tmp, 'p3');
		ensureScopeDir(root, 'user-registration');
		for (const stage of STAGES) {
			const p = join(
				root,
				'.aimd',
				'user-registration',
				stage,
				'manifest.json',
			);
			assert.ok(existsSync(p), `${stage} manifest.json missing`);
			const m = JSON.parse(readFileSync(p, 'utf-8'));
			assert.equal(m.scope, 'user-registration');
			assert.equal(m.stage, stage);
			assert.equal(m.status, 'pending');
		}
	});

	it('is idempotent — second call preserves manifests', () => {
		const root = join(tmp, 'p5');
		ensureScopeDir(root, 'user-registration');
		const scopeManifestPath = join(
			root,
			'.aimd',
			'user-registration',
			'manifest.json',
		);
		const before = readFileSync(scopeManifestPath, 'utf-8');
		ensureScopeDir(root, 'user-registration');
		const after = readFileSync(scopeManifestPath, 'utf-8');
		assert.equal(before, after, 'manifest content changed on second call');
	});

	it('rejects invalid scope slug', () => {
		const root = join(tmp, 'p6');
		assert.throws(
			() => ensureScopeDir(root, 'Bad Scope!'),
			/invalid scope slug/i,
		);
	});

	it('leaves no .tmp files', () => {
		const root = join(tmp, 'p7');
		ensureScopeDir(root, 'user-registration');
		const scopeDir = join(root, '.aimd', 'user-registration');
		for (const f of readdirSync(scopeDir)) {
			assert.ok(!f.endsWith('.tmp'), `dangling tmp: ${f}`);
		}
	});
});

describe('writeManifest / readManifest', () => {
	it('writeManifest persists scope manifest', () => {
		const root = join(tmp, 'p8');
		ensureScopeDir(root, 'user-registration');
		writeManifest(root, 'user-registration', null, {
			scope: 'user-registration',
			status: 'in_progress',
			current_stage: 'spec',
			analysis_refs: { rules: ['BR-AUTH-001'] },
		});
		const m = readManifest(root, 'user-registration');
		assert.equal(m.status, 'in_progress');
		assert.equal(m.current_stage, 'spec');
		assert.deepEqual(m.analysis_refs.rules, ['BR-AUTH-001']);
	});

	it('writeManifest persists stage manifest', () => {
		const root = join(tmp, 'p9');
		ensureScopeDir(root, 'user-registration');
		writeManifest(root, 'user-registration', 'discovery', {
			scope: 'user-registration',
			stage: 'discovery',
			status: 'complete',
			linked_artifacts: ['discovery-spec.json'],
			traceability_refs: {
				uc: ['UC-USER-001'],
				bhv: [],
				ac: [],
				tc: [],
				impl: [],
			},
		});
		const m = readManifest(root, 'user-registration', 'discovery');
		assert.equal(m.status, 'complete');
		assert.deepEqual(m.linked_artifacts, ['discovery-spec.json']);
		assert.deepEqual(m.traceability_refs.uc, ['UC-USER-001']);
	});

	it('writeManifest updates updated_at field', async () => {
		const root = join(tmp, 'p10');
		ensureScopeDir(root, 'user-registration');
		const before = readManifest(root, 'user-registration');
		await new Promise((r) => setTimeout(r, 10));
		writeManifest(root, 'user-registration', null, {
			...before,
			status: 'in_progress',
		});
		const after = readManifest(root, 'user-registration');
		assert.notEqual(before.updated_at, after.updated_at);
	});

	it('writeManifest atomic — leaves no .tmp', () => {
		const root = join(tmp, 'p11');
		ensureScopeDir(root, 'user-registration');
		writeManifest(root, 'user-registration', null, {
			scope: 'user-registration',
			status: 'in_progress',
		});
		const dir = join(root, '.aimd', 'user-registration');
		for (const f of readdirSync(dir)) {
			assert.ok(!f.endsWith('.tmp'), `dangling tmp: ${f}`);
		}
	});

	it('readManifest returns null when manifest absent', () => {
		const root = join(tmp, 'p12');
		const m = readManifest(root, 'nonexistent');
		assert.equal(m, null);
	});
});
