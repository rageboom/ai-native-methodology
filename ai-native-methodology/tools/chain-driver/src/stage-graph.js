// stage-graph.js — flows/sdlc-4stage-flow.json 로드 + stage 전이 graph.
// drift 회피: sdlc-4stage-flow.json single source. state.current_chain enum 정합 검증.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// v9.0 6-stage (analysis→discovery→spec→plan→test→implement / DEC-2026-05-21).
const STAGES = ['analysis', 'discovery', 'spec', 'plan', 'test', 'implement'];

export function loadFlow(repoRoot) {
	const path = resolveFlowPath(repoRoot);
	if (!existsSync(path))
		throw new Error(`sdlc-4stage-flow.json not found at ${path}`);
	return JSON.parse(readFileSync(path, 'utf-8'));
}

export function resolveFlowPath(repoRoot) {
	// repoRoot can be either ai-native-methodology root or its parent.
	const direct = join(repoRoot, 'flows', 'sdlc-4stage-flow.json');
	if (existsSync(direct)) return direct;
	const nested = join(
		repoRoot,
		'ai-native-methodology',
		'flows',
		'sdlc-4stage-flow.json',
	);
	if (existsSync(nested)) return nested;
	return direct;
}

export function getStageOrder() {
	return [...STAGES];
}

export function nextStage(current) {
	const idx = STAGES.indexOf(current);
	if (idx === -1) throw new Error(`unknown stage: ${current}`);
	if (idx === STAGES.length - 1) return null; // implement = terminal
	return STAGES[idx + 1];
}

export function previousStage(current) {
	const idx = STAGES.indexOf(current);
	if (idx <= 0) return null;
	return STAGES[idx - 1];
}

export function getGateForStage(stage) {
	// v10.0.0 MAJOR (DEC-2026-05-25-axis-a-phase-4-4-prime / Phase 4-4') — gate 번호 재정렬 본격 시행.
	//   AS-IS (v9.3.0): plan = '#plan' string placeholder / test=#3 / implement=#4
	//   TO-BE (v10.0.0): chain 번호 = gate 번호 1:1 (INTERNAL CONVENTION / DO-178C SOI isomorphic) — plan=#3 / test=#4 / implement=#5
	//   Senior BLOCKER-2 잔여 본격 해소 + F-CHA-001 trio enforcement plan stage 본격 통합 / widespread breaking.
	const map = {
		discovery: '#1',
		spec: '#2',
		plan: '#3',
		test: '#4',
		implement: '#5',
	};
	return map[stage] ?? null;
}

// upstream(target) = stages that come before target — used by revisit-detect.
export function isUpstream(target, current) {
	const ti = STAGES.indexOf(target);
	const ci = STAGES.indexOf(current);
	if (ti === -1 || ci === -1) return false;
	return ti < ci;
}

// detect cyclic edges in flow.revisit_edges (defense in depth).
export function detectCycles(flow) {
	const edges = flow?.revisit_edges || [];
	const adj = new Map();
	for (const e of edges) {
		if (!adj.has(e.from)) adj.set(e.from, []);
		adj.get(e.from).push(e.to);
	}
	const cycles = [];
	for (const start of adj.keys()) {
		const visited = new Set();
		const stack = [[start, [start]]];
		while (stack.length) {
			const [node, path] = stack.pop();
			if (visited.has(node)) continue;
			visited.add(node);
			for (const next of adj.get(node) || []) {
				if (path.includes(next)) {
					cycles.push([...path, next]);
				} else {
					stack.push([next, [...path, next]]);
				}
			}
		}
	}
	return cycles;
}

export function validateStateAgainstFlow(state, flow) {
	const errors = [];
	if (
		!STAGES.includes(state.current_chain) &&
		state.current_chain !== 'revisit_pending'
	) {
		errors.push(`current_chain '${state.current_chain}' not in flow stages`);
	}
	for (const s of STAGES) {
		if (!state.stage_progress?.[s]) {
			errors.push(`stage_progress.${s} missing`);
		}
	}
	const flowStageIds = (flow.stages || []).map((x) => x.id);
	for (const s of STAGES) {
		if (!flowStageIds.includes(s)) {
			errors.push(`flow.stages missing ${s}`);
		}
	}
	return errors;
}
