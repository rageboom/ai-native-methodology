import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
	classifyPath,
	isIgnoredByGlobs,
	detectRevisit,
} from '../src/revisit-detect.js';

describe('revisit-detect', () => {
	it('classifyPath maps .aimd discovery-spec.json to discovery', () => {
		assert.equal(classifyPath('.aimd/output/discovery-spec.json'), 'discovery'); // v11.0.0 planning-spec → discovery-spec rename / chain=discovery
	});

	it('classifyPath maps src/foo.ts to implement', () => {
		assert.equal(classifyPath('src/foo.ts'), 'implement');
	});

	it('classifyPath maps .test.ts to test', () => {
		assert.equal(classifyPath('src/foo.test.ts'), 'test');
	});

	it('classifyPath returns null for unknown paths', () => {
		assert.equal(classifyPath('docs/notes.md'), null);
	});

	it('isIgnoredByGlobs matches **/*.md', () => {
		assert.equal(isIgnoredByGlobs('docs/x/y.md', ['**/*.md']), true);
		assert.equal(isIgnoredByGlobs('src/foo.ts', ['**/*.md']), false);
	});

	it('detectRevisit returns null when no upstream chain matched', () => {
		const result = detectRevisit({
			changedFiles: [{ path: 'docs/notes.md', added: 100, deleted: 0 }],
			currentChain: 'implement',
		});
		assert.equal(result.revisit_target, null);
	});

	it('detectRevisit returns spec when spec source changed during implement', () => {
		const result = detectRevisit({
			changedFiles: [
				{ path: '.aimd/output/behavior-spec.json', added: 50, deleted: 10 },
				{ path: 'src/feat.ts', added: 5, deleted: 0 },
			],
			currentChain: 'implement',
		});
		assert.equal(result.revisit_target, 'spec');
		assert.equal(result.confidence_loc, 60);
	});

	it('detectRevisit auto-ignores below LOC threshold', () => {
		const result = detectRevisit({
			changedFiles: [
				{ path: '.aimd/output/behavior-spec.json', added: 1, deleted: 1 },
			],
			currentChain: 'implement',
		});
		assert.equal(result.revisit_target, null);
		assert.equal(result.candidate_target, 'spec');
		assert.match(result.reason, /LOC 2 < threshold 5/);
	});

	it('detectRevisit respects ignoreGlobs', () => {
		const result = detectRevisit({
			changedFiles: [
				{ path: '.aimd/output/test-spec.md', added: 100, deleted: 0 },
			],
			currentChain: 'implement',
			ignoreGlobs: ['**/*.md'],
		});
		assert.ok(result.ignored_paths.includes('.aimd/output/test-spec.md'));
	});

	it('detectRevisit downstream chain change does not trigger revisit', () => {
		// current=spec, change in test file (downstream) — not revisit
		const result = detectRevisit({
			changedFiles: [{ path: 'src/foo.test.ts', added: 50, deleted: 10 }],
			currentChain: 'spec',
		});
		assert.equal(result.revisit_target, null);
	});
});
