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

// stage-aware schema args (surfaced fix): schema-validator 는 stage 별 산출물을 검증해야 함
//   (이전엔 stage 무관 chain-2 자산만 → plan/test/implement 에서 잘못된 파일 검증).
describe('buildValidatorArgs — schema-validator stage-aware', () => {
	const tail = (args) => args.map((a) => a.split('/').slice(-1)[0]);
	it('discovery → discovery-spec.json', () => {
		assert.deepEqual(tail(buildValidatorArgs('schema-validator', '/p', 'discovery')), ['discovery-spec.json']);
	});
	it('plan → task-plan.json', () => {
		assert.deepEqual(tail(buildValidatorArgs('schema-validator', '/p', 'plan')), ['task-plan.json']);
	});
	it('test → test-spec.json', () => {
		assert.deepEqual(tail(buildValidatorArgs('schema-validator', '/p', 'test')), ['test-spec.json']);
	});
	it('implement → impl-spec.json (+ traceability-matrix)', () => {
		assert.ok(tail(buildValidatorArgs('schema-validator', '/p', 'implement')).includes('impl-spec.json'));
	});
	it('spec / default → chain-2 자산 (behavior + acceptance)', () => {
		const t = tail(buildValidatorArgs('schema-validator', '/p', 'spec'));
		assert.ok(t.includes('behavior-spec.json') && t.includes('acceptance-criteria.json'));
	});
});

// non-analysis 단계 validator wiring 완성 (fail-closed 가 false-block 하지 않도록)
describe('buildValidatorArgs — non-analysis wiring completeness', () => {
	it('br-cross-consistency-validator → --target <BR file> (was default --target <dir> = errored skip)', () => {
		const args = buildValidatorArgs('br-cross-consistency-validator', '/p', 'discovery');
		assert.ok(args.includes('--target'));
		assert.ok(args.some((a) => a.endsWith('input/business-rules.json')), 'BR 파일 경로');
		assert.ok(!args.includes('/p'), 'dir 자체를 --target 으로 넘기지 않음');
	});
	it('spec-test-link-validator includes --behavior (없으면 bhv_ref 미해석 → false critical)', () => {
		const args = buildValidatorArgs('spec-test-link-validator', '/p', 'test');
		assert.ok(args.includes('--behavior'), '--behavior 동반');
		assert.ok(args.some((a) => a.endsWith('behavior-spec.json')));
	});
	it('traceability-matrix-builder → full chain + --json (이전 default --target = errored skip)', () => {
		const args = buildValidatorArgs('traceability-matrix-builder', '/p', 'implement');
		assert.ok(args.includes('--behavior') && args.includes('--acceptance'), 'full chain args');
		assert.ok(args.includes('--json'), 'findings-only --json 모드');
		assert.ok(!args.includes('--target'), 'errored skip 유발 default --target 아님');
		assert.ok(!args.includes('--out-dir'), 'gate eval 시 side-effect write 없음');
		assert.ok(args.some((a) => a.endsWith('impl-spec.json')));
	});
});
