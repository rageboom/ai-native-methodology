// ai-context-layout.test.js — 경로 구성 SSOT + read-alias 불변식 검증.
// DEC-2026-06-16-ai-context-layout-restructure.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
	AIMD,
	SEG,
	OLD,
	resolveRead,
	statePath,
	inputPath,
	handoffPath,
	baseDirPath,
	baseDirForRead,
	baseFilePath,
	baseFileForRead,
	scopesRootPath,
	scopeDirPath,
	scopeDirForRead,
	scopeFilePath,
	scopeFileForRead,
	runtimeDirPath,
	runtimeFileForRead,
	configDirPath,
	configFileForRead,
	evidenceDirPath,
	findingsFilePath,
	findingsFileForRead,
	interventionLogPathForRead,
	INTERVENTION_LOG_REL,
	INTERVENTION_LOG_REL_OLD,
	bucketDirs,
} from '../ai-context-layout.js';

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), 'ai-context-layout-'));
});
after(() => {
	rmSync(tmp, { recursive: true, force: true });
});

function seed(root, rel, body = '{}') {
	const p = join(root, rel);
	mkdirSync(join(p, '..'), { recursive: true });
	writeFileSync(p, body);
	return p;
}
function freshRoot(name) {
	const r = join(tmp, name);
	mkdirSync(r, { recursive: true });
	return r;
}

describe('constants', () => {
	it('SEG = base/scopes/runtime', () => {
		assert.equal(SEG.base, 'base');
		assert.equal(SEG.scopes, 'scopes');
		assert.equal(SEG.runtime, 'runtime');
	});
	it('OLD.base = output', () => {
		assert.equal(OLD.base, 'output');
	});
	it('AIMD = .ai-context', () => assert.equal(AIMD, '.ai-context'));
});

describe('*Path (write = NEW only, disk-agnostic)', () => {
	const root = '/p';
	it('root singletons unchanged', () => {
		assert.equal(statePath(root), join('/p', '.ai-context', 'state.json'));
		assert.equal(inputPath(root), join('/p', '.ai-context', 'input.json'));
		assert.equal(handoffPath(root), join('/p', '.ai-context', 'HANDOFF.md'));
	});
	it('base/', () => {
		assert.equal(baseDirPath(root), join('/p', '.ai-context', 'base'));
		assert.equal(
			baseFilePath(root, 'domains', 'BC-X', 'business-rules.json'),
			join('/p', '.ai-context', 'base', 'domains', 'BC-X', 'business-rules.json'),
		);
	});
	it('scopes/<scope>/<stage>', () => {
		assert.equal(scopesRootPath(root), join('/p', '.ai-context', 'scopes'));
		assert.equal(
			scopeDirPath(root, 'core'),
			join('/p', '.ai-context', 'scopes', 'core'),
		);
		assert.equal(
			scopeDirPath(root, 'core', 'impl'),
			join('/p', '.ai-context', 'scopes', 'core', 'impl'),
		);
		assert.equal(
			scopeFilePath(root, 'core', 'impl', 'context-cache.json'),
			join('/p', '.ai-context', 'scopes', 'core', 'impl', 'context-cache.json'),
		);
	});
	it('runtime/', () => {
		assert.equal(runtimeDirPath(root), join('/p', '.ai-context', 'runtime'));
		assert.equal(
			configDirPath(root),
			join('/p', '.ai-context', 'runtime', 'config'),
		);
		assert.equal(
			evidenceDirPath(root),
			join('/p', '.ai-context', 'runtime', 'evidence'),
		);
		assert.equal(
			findingsFilePath(root, 'spec'),
			join('/p', '.ai-context', 'runtime', 'findings-spec.json'),
		);
	});
	it('intervention-log default = runtime/', () => {
		assert.equal(INTERVENTION_LOG_REL, '.ai-context/runtime/intervention-log.jsonl');
		assert.equal(INTERVENTION_LOG_REL_OLD, '.ai-context/output/intervention-log.jsonl');
	});
	it('bucketDirs lists the 3 buckets + aimd root', () => {
		const ds = bucketDirs(root);
		assert.deepEqual(ds, [
			join('/p', '.ai-context'),
			join('/p', '.ai-context', 'base'),
			join('/p', '.ai-context', 'scopes'),
			join('/p', '.ai-context', 'runtime'),
		]);
	});
});

describe('resolveRead primitive', () => {
	it('NEW exists → NEW', () => {
		const root = freshRoot('rr-new');
		const n = seed(root, 'new.json');
		assert.equal(resolveRead(n, join(root, 'old.json')), n);
	});
	it('only OLD exists → OLD', () => {
		const root = freshRoot('rr-old');
		const o = seed(root, 'old.json');
		assert.equal(resolveRead(join(root, 'new.json'), o), o);
	});
	it('neither exists → NEW', () => {
		const root = freshRoot('rr-none');
		const n = join(root, 'new.json');
		assert.equal(resolveRead(n, join(root, 'old.json')), n);
	});
});

describe('*ForRead alias (NEW wins, OLD fallback)', () => {
	it('baseFileForRead: only OLD (output/) seeded → resolves OLD', () => {
		const root = freshRoot('base-old');
		const o = seed(root, '.ai-context/output/domain.json');
		assert.equal(baseFileForRead(root, 'domain.json'), o);
	});
	it('baseFileForRead: NEW (base/) wins when both present', () => {
		const root = freshRoot('base-both');
		seed(root, '.ai-context/output/domain.json');
		const n = seed(root, '.ai-context/base/domain.json');
		assert.equal(baseFileForRead(root, 'domain.json'), n);
	});
	it('baseFileForRead: neither → NEW path', () => {
		const root = freshRoot('base-none');
		assert.equal(
			baseFileForRead(root, 'domain.json'),
			join(root, '.ai-context', 'base', 'domain.json'),
		);
	});
	it('baseDirForRead: old output/ dir → resolves output/', () => {
		const root = freshRoot('basedir-old');
		seed(root, '.ai-context/output/x.json');
		assert.equal(baseDirForRead(root), join(root, '.ai-context', 'output'));
	});
	it('scopeFileForRead: old top-level scope → resolves old', () => {
		const root = freshRoot('scope-old');
		const o = seed(root, '.ai-context/core/discovery/manifest.json');
		assert.equal(scopeFileForRead(root, 'core', 'discovery', 'manifest.json'), o);
	});
	it('scopeFileForRead: NEW scopes/ wins when both', () => {
		const root = freshRoot('scope-both');
		seed(root, '.ai-context/core/discovery/manifest.json');
		const n = seed(root, '.ai-context/scopes/core/discovery/manifest.json');
		assert.equal(scopeFileForRead(root, 'core', 'discovery', 'manifest.json'), n);
	});
	it('scopeDirForRead: old top-level scope dir', () => {
		const root = freshRoot('scopedir-old');
		seed(root, '.ai-context/core/x.json');
		assert.equal(scopeDirForRead(root, 'core'), join(root, '.ai-context', 'core'));
	});
	it('configFileForRead: old top-level config/ → resolves old', () => {
		const root = freshRoot('cfg-old');
		const o = seed(root, '.ai-context/config/test-cmd.json');
		assert.equal(configFileForRead(root, 'test-cmd.json'), o);
	});
	it('configFileForRead: NEW runtime/config wins', () => {
		const root = freshRoot('cfg-both');
		seed(root, '.ai-context/config/test-cmd.json');
		const n = seed(root, '.ai-context/runtime/config/test-cmd.json');
		assert.equal(configFileForRead(root, 'test-cmd.json'), n);
	});
	it('findingsFileForRead: old output/ → resolves old', () => {
		const root = freshRoot('find-old');
		const o = seed(root, '.ai-context/output/findings-spec.json');
		assert.equal(findingsFileForRead(root, 'spec'), o);
	});
	it('runtimeFileForRead: old output/ fallback', () => {
		const root = freshRoot('rt-old');
		const o = seed(root, '.ai-context/output/tool-runs/x.json');
		assert.equal(runtimeFileForRead(root, 'tool-runs', 'x.json'), o);
	});
});

describe('interventionLogPathForRead precedence', () => {
	it('configured path that exists wins', () => {
		const root = freshRoot('il-cfg');
		const cfgRel = '.ai-context/runtime/intervention-log.jsonl';
		const p = seed(root, cfgRel, '');
		assert.equal(interventionLogPathForRead(root, cfgRel), p);
	});
	it('falls back to NEW default when present', () => {
		const root = freshRoot('il-new');
		const p = seed(root, INTERVENTION_LOG_REL, '');
		assert.equal(interventionLogPathForRead(root, null), p);
	});
	it('falls back to OLD default (output/) when only that present', () => {
		const root = freshRoot('il-old');
		const p = seed(root, INTERVENTION_LOG_REL_OLD, '');
		assert.equal(interventionLogPathForRead(root, null), p);
	});
	it('neither → NEW default path', () => {
		const root = freshRoot('il-none');
		assert.equal(
			interventionLogPathForRead(root, null),
			join(root, INTERVENTION_LOG_REL),
		);
	});
});
