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
			args.some((a) => a.endsWith('.ai-context/output/task-plan.json')),
			'task-plan.json 경로 포함',
		);
	});

	it('unknown validator still falls back to --target default', () => {
		const args = buildValidatorArgs('some-unknown-validator', '/proj');
		assert.deepEqual(args, ['--target', '/proj', '--json']);
	});

	// F-EVENT-CARRY-DANGLING — code-pointer-validator 는 positional <graph> + --repo-root + --strict 계약 (NOT default --target).
	it('code-pointer-validator → positional graph + --repo-root + --strict (NOT default --target)', () => {
		const args = buildValidatorArgs('code-pointer-validator', '/proj');
		assert.ok(
			args[0].endsWith('artifact-graph.json'),
			'positional 첫 인자 = artifact-graph.json',
		);
		assert.ok(args.includes('--repo-root'), 'has --repo-root');
		assert.equal(args[args.indexOf('--repo-root') + 1], '/proj', '--repo-root <projectDir>');
		assert.ok(args.includes('--strict'), 'strict 모드 — path_missing→high(gating)');
		assert.deepEqual(args.slice(-2), ['--format', 'json'], '--format json');
		assert.ok(!args.includes('--target'), 'no generic --target (graph-integrity 와 상이 — 명시 케이스)');
	});

	// scope-aware: scopeCtx 주입 시 per-scope impl/ 경로로 graph 해석 (F-R2-35 정합).
	it('code-pointer-validator — scopeCtx 주입 시 per-scope impl/artifact-graph.json (존재 시)', () => {
		// scopeCtx 경로가 디스크에 없으면 flat output/ fallback → 최소한 artifact-graph.json 로 끝남을 보장.
		const args = buildValidatorArgs('code-pointer-validator', '/proj', 'implement', {
			scope: 'event',
		});
		assert.ok(args[0].endsWith('artifact-graph.json'));
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
		assert.ok(args.includes('--unit-spec'), '--unit-spec 동반 (v0.40.0 mock-soundness HARD flip)');
		assert.ok(args.some((a) => a.endsWith('unit-spec.json')), 'unit-spec.json 경로 해석');
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

// F-R2-40 — test-impl-pass-validator 인자 규약 (--project / --allow-execute, NOT --target)
describe('buildValidatorArgs — test-impl-pass-validator (F-R2-40)', () => {
	it('test-impl-pass-validator → --project + --allow-execute (NOT --target = 이전 exit 2 usage → silent skip)', () => {
		const args = buildValidatorArgs('test-impl-pass-validator', '/p', 'implement');
		assert.ok(args.includes('--project'), 'validator 인자 규약 = --project');
		assert.ok(args.includes('--allow-execute'), 'GREEN reconciliation 실 RUN (no-simulation/i-strict)');
		assert.ok(!args.includes('--target'), '--target = 이전 usage-error 유발 default 아님');
		assert.ok(args.includes('/p'), '--project 값 = projectDir');
	});
});

// F-R2-35 — 비-analysis stage scope-aware overlay (scopeCtx 주입 시 per-scope / null 시 평면 무회귀)
describe('buildValidatorArgs — scope-aware overlay (F-R2-35)', () => {
	const tail2 = (args) => args.map((a) => a.split('/').slice(-2).join('/'));
	it('scopeCtx=null → 평면 .ai-context/output 경로 (backward-compat byte-identical)', () => {
		const args = buildValidatorArgs('chain-coverage-validator', '/p', 'spec', null);
		assert.ok(args.some((a) => a.endsWith('.ai-context/output/discovery-spec.json')), 'flat 경로 유지');
		assert.ok(args.some((a) => a.endsWith('.ai-context/output/behavior-spec.json')));
	});
	it('scopeCtx 주입 + per-scope 파일 부재 → flat fallback (graceful)', () => {
		// /p 에 .ai-context/event/spec/behavior-spec.json 실재 ❌ → existsSync false → flat fallback.
		const args = buildValidatorArgs('chain-coverage-validator', '/p', 'spec', { scope: 'event' });
		assert.ok(
			args.some((a) => a.endsWith('.ai-context/output/behavior-spec.json')),
			'per-scope 파일 부재 시 flat output/ 으로 graceful fallback (fail-closed 아닌 정직 해석)',
		);
	});
	it('br-cross scopeCtx=null → legacy input/business-rules.json (무회귀)', () => {
		const args = buildValidatorArgs('br-cross-consistency-validator', '/p', 'discovery', null);
		assert.ok(args.some((a) => a.endsWith('input/business-rules.json')), 'null 시 legacy 경로 보존');
	});
});

// F-DOGFOOD-014 — analysis-extraction-validator evidence-scan 배선 (analysis stage)
describe('buildAnalysisArgs — analysis-extraction-validator evidence-scan', () => {
	it('REQUIRED.analysis 에 analysis-extraction-validator 포함 + evidence-scan args 형태', async () => {
		// buildAnalysisArgs 는 cli.js 내부 비공개 — manifest 경로 실재가 전제라 여기서는
		// REQUIRED 목록 배선만 단언 (args 형태는 aggregator.test.js mockRun + e2e 가 커버).
		const { REQUIRED_VALIDATORS_PER_STAGE } = await import('../src/aggregator.js');
		assert.ok(
			REQUIRED_VALIDATORS_PER_STAGE.analysis.includes('analysis-extraction-validator'),
			'analysis gate #0 에 evidence-scan validator 배선',
		);
	});
});
