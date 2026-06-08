// check-handoff-consistency.js — JSON-only artifact handoff / rename-drift detector.
// v12.0.0 (ADR-011 / DEC-2026-06-01-json-only-ax-native).
//   구 compare-phase-flow.js 의 json↔mermaid rename-drift 검출(맹점: both-sides-wrong rename)을
//   mermaid 폐기 후 JSON-only 로 재구현. 1:1 대체 아님(정직) — 원 버그 moot-at-source + 신규 상보 체크.
//
// 알고리즘 (stage-granular / previous_chain 의존 ❌ — 파일명으로 chain order 고정 로드):
//   producer_union(i) = ANALYSIS_BASELINE ∪ outputs(0..i, self 포함) ∪ registry.produced_by self-output 보강.
//   각 stage inputs[]: Arm A input-no-producer(breaking) + Arm B input-unknown-artifact(breaking / registry 부재).
//   각 stage outputs[]: Arm B output-unknown-artifact(breaking / registry 부재) + Arm C output-no-consumer(info).
//   both-sides-wrong rename anchor = Arm B(registry) — Arm A 단독이면 양측 동일 typo 를 놓침.
//   .md/.mermaid 토큰은 DELIVERABLE_EXT_RE 로 무시 → C3-before-C4 green / C4 후도 동일.
//   meta(chain-intervention-log.jsonl / finding-system.findings.json) + config(.ai-context/config/*) = input+output 양쪽 suppress.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { extractArtifactFiles } from './normalize-phase-flow.js';

// chain order — 파일명 기반 로드 (previous_chain 의존 ❌ / analysis 는 stage 필드 부재라 별도 seed 필요).
const CHAIN_FLOW_FILES = [
	{ stage: 'analysis', file: 'flows/analysis.phase-flow.json' },
	{ stage: 'discovery', file: 'flows/discovery.phase-flow.json' },
	{ stage: 'spec', file: 'flows/spec.phase-flow.json' },
	{ stage: 'plan', file: 'flows/plan.phase-flow.json' },
	{ stage: 'test', file: 'flows/test.phase-flow.json' },
	{ stage: 'implement', file: 'flows/implement.phase-flow.json' },
];

const REGISTRY_FILE = 'flows/artifact-registry.json';

// analysis baseline — analysis 는 previous_chain 으로 도달 불가 (analysis.phase-flow.json stage 부재 /
//   discovery.previous_chain 부재). chain stage 가 input 으로 참조하는 analysis 산출물의 producer seed.
const ANALYSIS_BASELINE_ARTIFACTS = new Set([
	'inventory.json',
	'stats.json',
	'schema.json',
	'architecture.json',
	'domain.json',
	'business-rules.json',
	'antipatterns.json',
	'antipatterns-partial.json',
	'characterization-spec.json',
	'coverage.json',
	'sql-inventory.json',
	'api-extension.json',
	'error-mapping-spec.json',
	'openapi.yaml',
	'html-template-extract.json',
	'ui-spec.json',
	'state-map.json',
	'visual-manifest.json',
	'type-spec.json',
	'a11y-spec.json',
	'i18n-spec.json',
	'static-security-spec.json',
	'legacy-spectrum.json',
	'form-validation-spec.json',
	'migration-cautions.json',
	'_manifest.yml',
]);

// 횡단 메타 / 로그 — handoff data-contract 산출물 아님 (input+output 양쪽 suppress).
const HANDOFF_NON_DELIVERABLE = new Set([
	'finding-system.findings.json',
	'chain-intervention-log.jsonl',
]);
// 사용자 환경 config — handoff 계약 아님 (`.ai-context/config/` prefix + basename).
const CONFIG_PREFIX_RE = /(^|\/)\.ai-context\/config\//i;
const CONFIG_BASENAMES = new Set(['test-cmd.json']);

// .json/.jsonl/.yaml 만 비교 → .md/.mermaid 토큰 무시 (C3-before-C4 green).
const DELIVERABLE_EXT_RE = /\.(?:json|jsonl|ya?ml)$/i;

function isSuppressed(filename) {
	return (
		HANDOFF_NON_DELIVERABLE.has(filename) || CONFIG_BASENAMES.has(filename)
	);
}

// entry 문자열 배열 → deliverable filename Set (.json/.jsonl/.yaml only / meta+config suppress).
function deliverableTokens(entries) {
	const out = new Set();
	for (const raw of entries ?? []) {
		if (CONFIG_PREFIX_RE.test(String(raw))) continue; // 원문 .ai-context/config/ prefix pre-filter
		for (const f of extractArtifactFiles(raw)) {
			if (!DELIVERABLE_EXT_RE.test(f)) continue;
			if (isSuppressed(f)) continue;
			out.add(f);
		}
	}
	return out;
}

// flow.phases[] → stage-level raw inputs/outputs 문자열 배열로 flatten.
function flattenStageRaw(flow) {
	const inputs = [];
	const outputs = [];
	for (const phase of flow.phases ?? []) {
		if (Array.isArray(phase.inputs)) inputs.push(...phase.inputs);
		if (Array.isArray(phase.outputs)) outputs.push(...phase.outputs);
	}
	return { inputs, outputs };
}

// 순수 분석기 — { flows: [{stage, inputs:[raw], outputs:[raw]}], registry } 모델 입력 (테스트 친화).
export function analyzeHandoffModel({ flows, registry }) {
	const registryNames = new Set((registry?.artifacts ?? []).map((a) => a.name));
	const producedByStage = new Map(); // stage → Set(name) — 비-literal flow 토큰 bridge (impl-spec/matrix)
	for (const a of registry?.artifacts ?? []) {
		if (!a.produced_by) continue;
		if (!producedByStage.has(a.produced_by))
			producedByStage.set(a.produced_by, new Set());
		producedByStage.get(a.produced_by).add(a.name);
	}

	const stages = (flows ?? []).map(({ stage, inputs, outputs }) => {
		const inSet = deliverableTokens(inputs);
		const outSet = deliverableTokens(outputs);
		for (const f of producedByStage.get(stage) ?? []) outSet.add(f); // registry produced_by 보강
		return { stage, inputs: inSet, outputs: outSet };
	});

	const diffs = [];

	// consumer 판정용 — 전 stage inputs 합집합 (output-no-consumer).
	const allConsumedInputs = new Set();
	for (const s of stages) for (const f of s.inputs) allConsumedInputs.add(f);

	// producer 누적 (ANALYSIS_BASELINE seed) — self-output 포함 (gate phase 가 자기 stage output 입력).
	const cumulativeProducers = new Set(ANALYSIS_BASELINE_ARTIFACTS);
	for (const s of stages) {
		for (const f of s.outputs) cumulativeProducers.add(f);

		for (const input of s.inputs) {
			if (!cumulativeProducers.has(input)) {
				diffs.push({
					severity: 'breaking',
					kind: 'handoff.input-no-producer',
					stage: s.stage,
					artifact: input,
					message: `stage '${s.stage}' inputs '${input}' but no upstream/self stage (nor analysis baseline) produces it`,
				});
			}
			if (!registryNames.has(input)) {
				diffs.push({
					severity: 'breaking',
					kind: 'handoff.input-unknown-artifact',
					stage: s.stage,
					artifact: input,
					message: `stage '${s.stage}' inputs '${input}' which is not in artifact-registry (rename drift / typo anchor)`,
				});
			}
		}
		for (const output of s.outputs) {
			if (!registryNames.has(output)) {
				diffs.push({
					severity: 'breaking',
					kind: 'handoff.output-unknown-artifact',
					stage: s.stage,
					artifact: output,
					message: `stage '${s.stage}' outputs '${output}' which is not in artifact-registry (rename drift / typo anchor)`,
				});
			}
		}
	}

	// Arm C — downstream(또는 동 stage) input 에 등장하지 않는 output = info (terminal / baseline).
	for (const s of stages) {
		for (const output of s.outputs) {
			if (!allConsumedInputs.has(output)) {
				diffs.push({
					severity: 'info',
					kind: 'handoff.output-no-consumer',
					stage: s.stage,
					artifact: output,
					message: `stage '${s.stage}' output '${output}' has no consumer (terminal / baseline artifact)`,
				});
			}
		}
	}

	return {
		diffs,
		stages: stages.map((s) => ({
			stage: s.stage,
			inputs: [...s.inputs].sort(),
			outputs: [...s.outputs].sort(),
		})),
	};
}

// workspace 파일에서 모델 로드 후 분석.
export function analyzeHandoff(workspaceRoot) {
	const registryPath = join(workspaceRoot, REGISTRY_FILE);
	const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
	const flows = [];
	for (const { stage, file } of CHAIN_FLOW_FILES) {
		const flowPath = join(workspaceRoot, file);
		if (!existsSync(flowPath)) continue; // graceful
		const flow = JSON.parse(readFileSync(flowPath, 'utf-8'));
		const { inputs, outputs } = flattenStageRaw(flow);
		flows.push({ stage, inputs, outputs });
	}
	return analyzeHandoffModel({ flows, registry });
}

// workspaceRoot(string) 또는 model({flows, registry}) 입력 → { ok, diffs }.
export function checkHandoffConsistency(input) {
	const { diffs } =
		typeof input === 'string'
			? analyzeHandoff(input)
			: analyzeHandoffModel(input);
	const breaking = diffs.filter((d) => d.severity === 'breaking');
	return { ok: breaking.length === 0, diffs };
}

export function summarizeHandoffConsistency(result) {
	const { ok, diffs } = result;
	if (ok) {
		const info = diffs.filter((d) => d.severity === 'info').length;
		return `✅ handoff-consistency passed — 0 breaking / ${info} info (terminal/baseline no-consumer)`;
	}
	const breaking = diffs.filter((d) => d.severity === 'breaking').length;
	return `❌ handoff-consistency failed — ${breaking} breaking / ${diffs.length} total findings`;
}
