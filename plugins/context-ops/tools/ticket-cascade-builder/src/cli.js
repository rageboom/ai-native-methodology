#!/usr/bin/env node
// ticket-cascade-builder CLI (DEC-2026-06-10-ticket-cascade-builder).
// 결정론 — task-plan + config → cascade-plan.json. NO MCP / NO LLM / NO network.
// exit 0 = 산출 성공 / 1 = 입력 부재·오류.
import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCascadePlan, loadJson, loadConfig } from './builder.js';

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

function main() {
	const args = parseArgs(process.argv);
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
