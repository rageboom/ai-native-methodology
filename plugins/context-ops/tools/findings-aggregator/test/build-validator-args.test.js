// build-validator-args.test.js — F2 fix (poc-18 dogfood) 회귀.
// 이전: buildValidatorArgs 에 plan-coverage-validator case 부재 → default '--target' 인자로 호출 →
//   validator 가 --task-plan/--acceptance 요구 → errored → silent skip = plan gate primary validator 미실행(fail-OPEN).
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildValidatorArgs } from '../src/cli.js';

describe('buildValidatorArgs (F2 fix — plan-coverage wiring)', () => {
	it('plan-coverage-validator → --task-plan + --acceptance (NOT default --target)', () => {
		const args = buildValidatorArgs('plan-coverage-validator', '/proj');
		assert.ok(args.includes('--task-plan'), 'has --task-plan');
		assert.ok(args.includes('--acceptance'), 'has --acceptance');
		assert.ok(!args.includes('--target'), 'no generic --target (이전 default = errored skip)');
		assert.ok(
			args.some((a) => a.endsWith('.aimd/output/task-plan.json')),
			'task-plan.json 경로 포함',
		);
	});

	it('unknown validator still falls back to --target default', () => {
		const args = buildValidatorArgs('some-unknown-validator', '/proj');
		assert.deepEqual(args, ['--target', '/proj', '--json']);
	});
});
