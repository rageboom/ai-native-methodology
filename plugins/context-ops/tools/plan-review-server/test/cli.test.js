import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openBrowserCommand, inferArtifactType } from '../src/cli.js';

test('openBrowserCommand — 플랫폼별 오픈 커맨드', () => {
	assert.deepEqual(openBrowserCommand('darwin'), { cmd: 'open', args: [] });
	assert.deepEqual(openBrowserCommand('linux'), { cmd: 'xdg-open', args: [] });
	const win = openBrowserCommand('win32');
	assert.equal(win.cmd, 'cmd');
	assert.deepEqual(win.args, ['/c', 'start', '']);
});

test('inferArtifactType — 파일명에서 4종 추론, 미상은 null', () => {
	assert.equal(inferArtifactType('/x/.ai-context/output/discovery-spec.json'), 'discovery-spec');
	assert.equal(inferArtifactType('behavior-spec.json'), 'behavior-spec');
	assert.equal(inferArtifactType('/a/acceptance-criteria.json'), 'acceptance-criteria');
	assert.equal(inferArtifactType('task-plan.json'), 'task-plan');
	assert.equal(inferArtifactType('random.json'), null);
});
