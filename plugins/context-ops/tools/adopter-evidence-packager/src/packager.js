// adopter-evidence-packager — 순수 합성 로직 (I/O·ajv 없음 / cli.js 가 read/validate/write).
// Type 2 외부 adopter 의 chain 1 cycle 결과를 익명화 corroboration 객체로 합성.
// 결정론 (AI 추론 0%) — 입력 동일 → 출력 동일.

import { createHash } from 'node:crypto';
import { redactText, scanLeak } from '../../_shared/pii-patterns.js';

const STAGE_GATE_ID = {
	discovery: '#1',
	spec: '#2',
	plan: '#3',
	test: '#4',
	implement: '#5',
};
const STAGE_ORDER = ['discovery', 'spec', 'plan', 'test', 'implement'];

/** opaque 가명화 ID = sha256(salt + raw) 선두 32 hex (비가역 / rainbow-table 회피=salt). */
export function opaqueId(salt, raw) {
	return createHash('sha256')
		.update(String(salt ?? '') + '|' + String(raw ?? ''))
		.digest('hex')
		.slice(0, 32);
}

/** state.json 의 stage_progress + last_gate → gates[] (gate #1~#5). */
export function extractGates(state) {
	const gates = [];
	const sp = state?.stage_progress || {};
	const lastGate = state?.last_gate || null;
	for (const stage of STAGE_ORDER) {
		const rec = sp[stage];
		if (!rec || rec.status !== 'complete') continue;
		const decision =
			rec.gate_decision ||
			(lastGate && lastGate.stage === stage ? lastGate.decision : 'go');
		const gate = { id: STAGE_GATE_ID[stage], stage, decision };
		// validator_findings 는 last_gate 에만 존재 (해당 stage 일 때).
		if (lastGate && lastGate.stage === stage && lastGate.validator_findings) {
			gate.validator_findings = lastGate.validator_findings;
		}
		gates.push(gate);
	}
	return gates;
}

/** terminal_stage / completed 산출. */
export function chainStatus(state) {
	const sp = state?.stage_progress || {};
	let terminal = null;
	for (const stage of STAGE_ORDER) {
		if (sp[stage]?.status === 'complete') terminal = stage;
	}
	const completed = sp.implement?.status === 'complete';
	return { terminal_stage: terminal || undefined, completed };
}

/** findings 카운트 객체 → findings_summary (total 합산). */
export function summarizeFindings(findings) {
	const f = findings || {};
	const c = ['critical', 'high', 'medium', 'low', 'info'];
	const out = {};
	let total = 0;
	for (const k of c) {
		if (typeof f[k] === 'number') {
			out[k] = f[k];
			total += f[k];
		}
	}
	out.total = typeof f.total === 'number' ? f.total : total;
	return out;
}

/** matrix.coverage_summary → coverage (있는 metric 만). */
export function extractCoverage(matrix) {
	const cs = matrix?.coverage_summary || matrix?.summary || null;
	if (!cs) return undefined;
	const cov = {};
	if (typeof cs.forward_coverage === 'number')
		cov.link_coverage = cs.forward_coverage;
	else if (typeof cs.link_coverage === 'number')
		cov.link_coverage = cs.link_coverage;
	if (typeof cs.test_pass_rate === 'number')
		cov.test_pass_rate = cs.test_pass_rate;
	if (typeof cs.line_branch_coverage === 'number')
		cov.line_branch_coverage = cs.line_branch_coverage;
	return Object.keys(cov).length ? cov : undefined;
}

/** free-text 배열/문자열 redact + 누적 카운터. */
function redactInto(value, acc) {
	if (typeof value === 'string') {
		const { text, count, labels } = redactText(value);
		acc.count += count;
		for (const l of labels) if (!acc.labels.includes(l)) acc.labels.push(l);
		return text;
	}
	if (Array.isArray(value)) return value.map((v) => redactInto(v, acc));
	return value;
}

/**
 * corroboration 합성.
 * @param {object} o
 * @param {object} o.state — .ai-context/state.json (필수)
 * @param {object} [o.manifest] — scope manifest (scenario / stack)
 * @param {object} [o.findings] — findings 카운트
 * @param {object} [o.matrix] — traceability-matrix
 * @param {string} o.pluginVersion
 * @param {string} [o.salt]
 * @param {string} [o.adopterIdRaw]
 * @param {string} [o.projectIdRaw]
 * @param {string} [o.orgType]
 * @param {string[]} [o.stackSignals]
 * @param {string} [o.scenario]
 * @param {string} [o.locBucket]
 * @param {string} [o.feedback]
 * @param {string[]} [o.frictionPoints]
 * @param {string} o.capturedAt — ISO (cli 가 주입 / 결정성)
 * @param {boolean} [o.noRedact] — redaction skip (guard 는 cli 에서 항상 enforce / 검증 전용)
 * @returns {{ corroboration: object, redaction_count: number, leak_hits: {field:string,labels:string[]}[] }}
 */
export function buildCorroboration(o) {
	const state = o.state || {};
	const manifest = o.manifest || {};
	const acc = { count: 0, labels: [] };

	const scenario = o.scenario || manifest.scenario || 'S1';
	const rawStack =
		o.stackSignals && o.stackSignals.length
			? o.stackSignals
			: Array.isArray(manifest.stack_signals)
				? manifest.stack_signals
				: [];

	// ── redaction (free-text 필드) — noRedact 시 원본 보존 (guard 가 cli 에서 잡음) ──
	const stackSignals = o.noRedact
		? rawStack.slice()
		: redactInto(rawStack, acc);
	let feedback;
	const fbSummary = o.feedback ?? undefined;
	const friction =
		o.frictionPoints && o.frictionPoints.length ? o.frictionPoints : undefined;
	if (fbSummary !== undefined || friction !== undefined) {
		feedback = {};
		if (fbSummary !== undefined)
			feedback.summary = o.noRedact ? fbSummary : redactInto(fbSummary, acc);
		if (friction !== undefined)
			feedback.friction_points = o.noRedact
				? friction.slice()
				: redactInto(friction, acc);
	}

	const { terminal_stage, completed } = chainStatus(state);
	const chain_run = { completed, gates: extractGates(state) };
	if (terminal_stage) chain_run.terminal_stage = terminal_stage;

	const corroboration = {
		$schema_origin: '../../schemas/adopter-corroboration.schema.json',
		schema_version: '1.0.0',
		plugin_version: o.pluginVersion,
		captured_at: o.capturedAt,
		adopter: {
			adopter_id: opaqueId(
				o.salt,
				o.adopterIdRaw ?? state.project_id ?? 'anonymous',
			),
			org_type: o.orgType || 'undisclosed',
		},
		project: {
			project_hash: opaqueId(
				o.salt,
				o.projectIdRaw ?? state.project_id ?? 'anonymous',
			),
			stack_signals: stackSignals,
			scenario,
		},
		chain_run,
		findings_summary: summarizeFindings(o.findings),
		anonymization: {
			applied: !o.noRedact,
			redaction_count: acc.count,
			method:
				'best-effort regex (false-negative 가능) + post-redaction leak guard',
		},
	};
	if (o.locBucket) corroboration.project.loc_bucket = o.locBucket;
	const coverage = extractCoverage(o.matrix);
	if (coverage) corroboration.coverage = coverage;
	if (feedback) corroboration.user_feedback = feedback;

	// ── post-redaction leak guard — 전체 출력 문자열 스캔 (defense-in-depth / Senior REVISE-3) ──
	//    free-text 필드 path 단위 보고 (silent wall ❌).
	const leak_hits = [];
	const scanField = (field, value) => {
		if (typeof value === 'string') {
			const hits = scanLeak(value);
			if (hits.length) leak_hits.push({ field, labels: hits });
		} else if (Array.isArray(value)) {
			value.forEach((v, i) => scanField(`${field}[${i}]`, v));
		}
	};
	scanField('project.stack_signals', corroboration.project.stack_signals);
	if (corroboration.user_feedback?.summary !== undefined)
		scanField('user_feedback.summary', corroboration.user_feedback.summary);
	if (corroboration.user_feedback?.friction_points)
		scanField(
			'user_feedback.friction_points',
			corroboration.user_feedback.friction_points,
		);

	return { corroboration, redaction_count: acc.count, leak_hits };
}
