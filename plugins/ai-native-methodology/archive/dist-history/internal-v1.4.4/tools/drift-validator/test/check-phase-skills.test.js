// check-phase-skills.test.js — 3-way layout 검증 통합 test.
// v1.4.4 신설.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import {
	checkPhaseSkills,
	summarizeLayoutCheck,
} from '../src/check-phase-skills.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// workspace root = tools/drift-validator/test → ../../.. = ai-native-methodology workspace
const WORKSPACE = resolve(__dirname, '../../..');

test('check-phase-skills — current workspace 정합 ok ( 0 orphan / 0 missing 의무)', () => {
	const result = checkPhaseSkills(WORKSPACE);
	if (!result.ok) {
		console.error('[check-phase-skills] layout findings:');
		for (const d of result.diffs) {
			console.error(`  - [${d.severity}] ${d.kind}: ${d.message}`);
		}
	}
	assert.equal(
		result.ok,
		true,
		'current workspace layout must be consistent (manifest ↔ workflow ↔ skills)',
	);
	assert.ok(
		result.counts.phases_checked >= 9,
		`at least 9 phases (got ${result.counts.phases_checked})`,
	);
	assert.ok(
		result.counts.skills_declared >= 14,
		`at least 14 skills declared in manifest (got ${result.counts.skills_declared})`,
	);
});

test('check-phase-skills — manifest 부재 시 graceful', () => {
	const result = checkPhaseSkills('/nonexistent/path/xyz');
	assert.equal(result.ok, false);
	assert.equal(result.diffs.length, 1);
	assert.equal(result.diffs[0].kind, 'manifest.missing');
});

test('summarizeLayoutCheck — pass/fail 메시지 정합', () => {
	const okResult = {
		ok: true,
		diffs: [],
		counts: { phases_checked: 9, skills_declared: 14 },
	};
	assert.match(summarizeLayoutCheck(okResult), /layout check passed/);
	assert.match(summarizeLayoutCheck(okResult), /9 phases/);

	const failResult = {
		ok: false,
		diffs: [{ severity: 'breaking', kind: 'test.fail', message: 'x' }],
		counts: {},
	};
	assert.match(summarizeLayoutCheck(failResult), /layout check failed/);
	assert.match(summarizeLayoutCheck(failResult), /1 breaking/);
});
