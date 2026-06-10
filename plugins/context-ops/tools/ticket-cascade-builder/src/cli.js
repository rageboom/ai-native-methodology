#!/usr/bin/env node
// ticket-cascade-builder CLI (DEC-2026-06-10-ticket-cascade-builder).
// 결정론 — task-plan + config → cascade-plan.json. NO MCP / NO LLM / NO network.
// exit 0 = 산출 성공 / 1 = 입력 부재·오류.
import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCascadePlan, loadJson, loadConfig } from './builder.js';
import { verifyConformance } from './verify.js';

function parseArgs(argv) {
	const args = {};
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (a.startsWith('--')) {
			const key = a.slice(2);
			const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
			args[key] = val;
		}
	}
	return args;
}

// verify subcommand — post-hoc conformance (cascade-plan ↔ evidence / 정책 11).
function runVerify(args) {
	if (!args.plan || !args.evidence) {
		process.stderr.write('usage: ticket-cascade-builder verify --plan <cascade-plan.json> --evidence <ticket-sync-evidence.json>\n');
		process.exit(1);
	}
	try {
		const plan = loadJson(resolve(args.plan));
		const evidence = loadJson(resolve(args.evidence));
		const { ok, findings } = verifyConformance(plan, evidence);
		if (ok) {
			process.stdout.write('✅ cascade conformance — 위반 0 (스킬이 cascade-plan 충실 발사)\n');
			process.exit(0);
		}
		process.stderr.write(`❌ cascade conformance 위반 ${findings.length}건:\n`);
		for (const f of findings) process.stderr.write(`  - [${f.id}] ${f.msg}\n`);
		process.exit(1);
	} catch (e) {
		process.stderr.write(`verify 오류: ${e.message}\n`);
		process.exit(1);
	}
}

function main() {
	const argv = process.argv;
	if (argv[2] === 'verify') {
		return runVerify(parseArgs(['', '', ...argv.slice(3)]));
	}
	const args = parseArgs(argv);
	if (args.help || !args['task-plan']) {
		process.stderr.write(
			'usage: ticket-cascade-builder --task-plan <path> [--operational-task <p>] [--behavior-spec <p>] ' +
				'[--acceptance-criteria <p>] [--config <ticket-sync-config.yaml>] [--scope <slug>] [--out <path>]\n',
		);
		process.exit(args.help ? 0 : 1);
	}

	try {
		const taskPlan = loadJson(resolve(args['task-plan']));
		const operationalTask = args['operational-task'] && existsSync(args['operational-task']) ? loadJson(resolve(args['operational-task'])) : null;
		const behaviorSpec = args['behavior-spec'] && existsSync(args['behavior-spec']) ? loadJson(resolve(args['behavior-spec'])) : null;
		const acceptanceCriteria = args['acceptance-criteria'] && existsSync(args['acceptance-criteria']) ? loadJson(resolve(args['acceptance-criteria'])) : null;
		const config = args.config && existsSync(args.config) ? loadConfig(resolve(args.config)) : {};

		const plan = buildCascadePlan({
			scope: args.scope || taskPlan?.meta?.scope || 'unknown',
			taskPlan,
			operationalTask,
			behaviorSpec,
			acceptanceCriteria,
			config,
			meta: {
				generated_at: new Date().toISOString(),
				confidence: 0.95,
				inputs_used: ['source_code'],
			},
		});

		const out = args.out ? resolve(args.out) : resolve('cascade-plan.json');
		writeFileSync(out, JSON.stringify(plan, null, 2) + '\n');
		process.stdout.write(`cascade-plan → ${out}\n생성 ${plan.counts.create || 0} / 기존재사용 ${plan.counts.skip_prebound || 0} (총 ${plan.calls.length} call)\n`);
		process.exit(0);
	} catch (e) {
		process.stderr.write(`ticket-cascade-builder 오류: ${e.message}\n`);
		process.exit(1);
	}
}

main();
