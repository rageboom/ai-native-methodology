#!/usr/bin/env node
// dep-consult-cli.js — discovery UC 의존성 reference-lens 러너 (S4 / MIS-373).
//
// 사용:
//   node src/dep-consult-cli.js --spec <discovery-spec.json> [--graph <artifact-graph.json>] [--write] [--json]
//
// --graph 미지정 시 spec 옆 artifact-graph.json 자동 탐색 (없으면 graph_impact degraded / shared_ref 만).
// --write 시 uc_dependencies 를 discovery-spec.json 에 병합 기록 (reference-lens / optional 필드).
//
// exit: 0 (산출) / 2 (usage) / 3 (spec 부재 — 정직 신호 / LLM 추론 대체 ❌ / no-simulation).
// 결정론만 — verdict ❌ / gate inject ❌ (STRONG-STOP).

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { computeUcDependencies } from './dep-consult.js';

function arg(name) {
	const i = process.argv.indexOf(name);
	return i === -1 ? null : process.argv[i + 1];
}
function has(name) {
	return process.argv.includes(name);
}

const specArg = arg('--spec');
if (!specArg) {
	console.error('usage: dep-consult-cli --spec <discovery-spec.json> [--graph <artifact-graph.json>] [--write] [--json]');
	process.exit(2);
}
const specPath = resolve(specArg);
if (!existsSync(specPath)) {
	console.error(`✗ discovery-spec 부재: ${specPath} (DepConsultInputMissing / exit 3 — 정직 신호)`);
	process.exit(3);
}

let spec;
try {
	spec = JSON.parse(readFileSync(specPath, 'utf-8'));
} catch (e) {
	console.error(`✗ discovery-spec 파싱 실패: ${e.message}`);
	process.exit(2);
}

// graph: --graph 우선, 없으면 spec 옆 artifact-graph.json 자동 탐색.
let graph = null;
const graphPath = arg('--graph') ? resolve(arg('--graph')) : join(dirname(specPath), 'artifact-graph.json');
if (existsSync(graphPath)) {
	try {
		graph = JSON.parse(readFileSync(graphPath, 'utf-8'));
	} catch {
		graph = null;
	}
}

const result = computeUcDependencies(spec, graph);

if (has('--write')) {
	spec.uc_dependencies = result.uc_dependencies;
	writeFileSync(specPath, JSON.stringify(spec, null, 2) + '\n');
}

if (has('--json')) {
	console.log(JSON.stringify(result, null, 2));
} else {
	const { total, shared_ref, graph_impact } = result.counts;
	console.error(`  🔗 uc_dependencies: ${total} (shared_ref ${shared_ref} / graph_impact ${graph_impact})`);
	if (result.graph_impact_degraded) console.error(`  · graph_impact degraded — ${result.reason}`);
	if (has('--write')) console.error(`  · uc_dependencies 기록 → ${specPath}`);
}
process.exit(0);
