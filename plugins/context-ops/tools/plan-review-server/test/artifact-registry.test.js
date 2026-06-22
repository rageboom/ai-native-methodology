import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARTIFACTS, VALIDATORS, knownArtifact } from '../src/artifact-registry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..', '..');
const ASSETS = resolve(__dirname, '..', 'assets');
const ARTS = ['discovery-spec', 'behavior-spec', 'unit-spec', 'acceptance-criteria', 'task-plan'];

test('레지스트리(슬림) — 4종 등록 + label + 스키마/렌더러 파일 존재', () => {
	for (const a of ARTS) {
		assert.ok(knownArtifact(a), `${a} 등록됨`);
		assert.ok(ARTIFACTS[a].label, `${a} label 있음`);
		assert.ok(existsSync(join(REPO, 'schemas', `${a}.schema.json`)), `${a} 스키마 존재`);
		assert.ok(existsSync(join(ASSETS, 'renderers', `${a}.js`)), `${a} 렌더러 존재`);
	}
	assert.ok(existsSync(join(ASSETS, 'renderers', 'generic.js')), 'generic fallback 렌더러 존재');
});

test('VALIDATORS — task-plan 만 plan-coverage', () => {
	assert.equal(VALIDATORS['task-plan'], 'plan-coverage');
	assert.equal(VALIDATORS['discovery-spec'], undefined);
	assert.equal(VALIDATORS['behavior-spec'], undefined);
});

test('knownArtifact — 미상 false', () => {
	assert.equal(knownArtifact('random'), false);
});
