#!/usr/bin/env node
// drift-validator CLI — JSON-only 정합 검사 진입점.
// v12.0.0 (ADR-011) — .mermaid + .md twin 폐기. pair-mode(.json↔.mermaid basename 짝 비교) 전면 제거.
// flag dispatcher 만 제공 (각 flag = check-*.js 위임 / exit 0=ok / 1=breaking / 2=usage·workspace-root 부재):
//   --check-layout                   manifest ↔ workflow ↔ skills 3-way layout (analysis)
//   --check-chain-layout             chain stage layout (discovery~implement)
//   --check-state-flow-consistency   state.schema enum ↔ sdlc-4stage-flow stages
//   --check-handoff-consistency      v12 신설 — JSON-only artifact handoff/rename-drift (artifact-registry)

import { existsSync } from 'node:fs';
import { writeStdoutSync } from '../../_shared/write-stdout-sync.js';
import { join, dirname, resolve } from 'node:path';
import {
	checkPhaseSkills,
	summarizeLayoutCheck,
	checkChainStageLayout,
	summarizeChainLayoutCheck,
	checkStateFlowConsistency,
	summarizeStateFlowConsistency,
} from './check-phase-skills.js';
import {
	checkHandoffConsistency,
	summarizeHandoffConsistency,
} from './check-handoff-consistency.js';

function findWorkspaceRoot(start) {
	let cur = resolve(start);
	for (let i = 0; i < 12; i++) {
		if (existsSync(join(cur, 'flows/analysis.phase-flow.json'))) return cur;
		const parent = dirname(cur);
		if (parent === cur) break;
		cur = parent;
	}
	return null;
}

// 공통 workspace-root flag 실행기 (4 check-* flag 동형).
function runWorkspaceCheck(args, flag, runner, summarizer) {
	const targetArg = args.find((a) => !a.startsWith('--')) ?? process.cwd();
	const workspaceRoot = findWorkspaceRoot(targetArg);
	if (!workspaceRoot) {
		console.error(
			`[${flag}] could not locate workspace root (flows/analysis.phase-flow.json) from: ${targetArg}`,
		);
		process.exit(2);
	}
	const result = runner(workspaceRoot);
	if (args.includes('--json')) {
		writeStdoutSync(JSON.stringify(result, null, 2));
	} else {
		console.log(summarizer(result));
		for (const d of result.diffs) {
			console.log(
				`  - [${d.severity}] ${d.kind}${d.message ? ' — ' + d.message : ''}`,
			);
		}
	}
	process.exit(result.ok ? 0 : 1);
}

function main() {
	const args = process.argv.slice(2);

	// v1.4.4 — manifest ↔ workflow ↔ skills 3-way layout 검증.
	if (args.includes('--check-layout')) {
		runWorkspaceCheck(
			args,
			'--check-layout',
			checkPhaseSkills,
			summarizeLayoutCheck,
		);
	}
	// v2.0 sub-plan-4 — chain stage layout 검증.
	if (args.includes('--check-chain-layout')) {
		runWorkspaceCheck(
			args,
			'--check-chain-layout',
			checkChainStageLayout,
			summarizeChainLayoutCheck,
		);
	}
	// v2.0 sub-plan-6 — state.schema enum ↔ sdlc-4stage-flow stages 정합.
	if (args.includes('--check-state-flow-consistency')) {
		runWorkspaceCheck(
			args,
			'--check-state-flow-consistency',
			checkStateFlowConsistency,
			summarizeStateFlowConsistency,
		);
	}
	// v12.0.0 (ADR-011) — JSON-only artifact handoff / rename-drift 검출.
	if (args.includes('--check-handoff-consistency')) {
		runWorkspaceCheck(
			args,
			'--check-handoff-consistency',
			checkHandoffConsistency,
			summarizeHandoffConsistency,
		);
	}

	console.error('usage: drift-validator <flag> [<workspace-root>] [--json]');
	console.error(
		'  --check-layout                   manifest ↔ workflow ↔ skills 3-way layout (analysis)',
	);
	console.error(
		'  --check-chain-layout             chain stage layout (discovery~implement)',
	);
	console.error(
		'  --check-state-flow-consistency   state.schema enum ↔ sdlc-4stage-flow stages',
	);
	console.error(
		'  --check-handoff-consistency      v12 — JSON-only artifact handoff/rename-drift (artifact-registry)',
	);
	console.error(
		'v12.0.0 (ADR-011): .json↔.mermaid pair-mode 폐기 — 산출물 json 단독.',
	);
	process.exit(2);
}

main();
