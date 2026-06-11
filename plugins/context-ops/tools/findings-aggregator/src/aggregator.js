// aggregator.js — findings 통합 핵심 로직 (선택적 operator 보조 / chain-driver next --findings 입력 편의)
// v2.3.6 PATCH (DEC-2026-05-13-chain-driver-findings-integration-v2.3.6)
// 실상 정정 (refactor: tooling-audit-cleanup) — 본 도구는 자동 호출되지 않으며(harness/CI/gate-eval invoker 0) `next` 도 findings 를 필수로 요구하지 않음(미입력 → 0 findings → pass). v2.3.6 의 '자동 입력 의무' 는 설계 의도였으나 실제론 우회됨(11 PoC 중 1) → 선택적 보조로 표기. gate 강제 = gate-eval + CI(각 validator 직접 실행).
// chain harness 5 요소 변경 ❌ (chain-driver 외부 자산 / findings shape 정합만)

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// chain-driver/src/gate-eval.js REQUIRED_VALIDATORS_PER_STAGE 와 정합 (v2.4.0 br-cross-consistency-validator 추가 / v11.0.0 discovery rename)
export const REQUIRED_VALIDATORS_PER_STAGE = {
	// analysis exit gate #0 (DEC-2026-06-06-analysis-exit-gate) — base 4 (gate-eval REQUIRED.analysis 와 sync 의무).
	//   조건부(characterization-coverage[S2/S3] · sql-inventory[RDB])는 cli 가 opts.extraValidators 로 추가 (sdlc gates[#0].conditional_validators allowlist 정합).
	analysis: [
		'schema-validator',
		'br-cross-consistency-validator',
		'formal-spec-link-validator',
		'decision-table-validator',
		// F-DOGFOOD-014 — evidence-scan: LLM 산출물 {file,line} 증거 실재성 (날조 source_evidence 차단 / analysis-only 는 code-pointer-validator 불가)
		'analysis-extraction-validator',
	],
	discovery: [
		'discovery-extraction-validator',
		'schema-validator',
		'br-cross-consistency-validator',
	],
	spec: [
		'chain-coverage-validator',
		'drift-validator',
		'formal-spec-link-validator',
		'schema-validator',
	],
	plan: ['plan-coverage-validator', 'schema-validator'],
	test: [
		'test-impl-pass-validator',
		'spec-test-link-validator',
		'schema-validator',
	],
	implement: [
		'test-impl-pass-validator',
		'static-runner',
		'traceability-matrix-builder',
	],
};

// validator 출력 → findings shape 변환 의무 (gate-eval.js findings shape 정합)
// findings shape:
// {
//   critical: 0, high: 0, medium: 0, low: 0, info: 0,
//   coverage_pct?: 0.92, coverage_threshold?: 0.85,
//   evidence_missing?: [],
//   tests_total?: 100, tests_passed?: 100, tests_failed?: 0,
//   sources: { <validator_name>: {...} }   // aggregator 자체 보강 / 추적 의무
// }

export function emptyFindings() {
	return {
		critical: 0,
		high: 0,
		medium: 0,
		low: 0,
		info: 0,
		evidence_missing: [],
		sources: {},
	};
}

// discovery-extraction-validator JSON → findings 변환 (v11.0.0 / renamed from planning-extraction-validator)
// 출력 shape (cli.js --json):
// { findings: [], coverage: { use_case: 1 }, summary: { total_findings, critical, high } }
export function transformDiscoveryExtraction(json) {
	const summary = json.summary ?? {};
	return {
		critical: summary.critical ?? 0,
		high: summary.high ?? 0,
		medium: summary.medium ?? 0,
		low: summary.low ?? 0,
		info: summary.info ?? 0,
	};
}

// chain-coverage-validator JSON → findings 변환
// 출력 shape (cli.js --json):
// { findings: [], coverage: { uc_to_bhv: 1, bhv_to_ac: 1 }, summary: { total_findings, critical, high, medium } }
export function transformChainCoverage(json) {
	const summary = json.summary ?? {};
	const coverage = json.coverage ?? {};
	// coverage_pct = min(uc_to_bhv, bhv_to_ac) (가장 약한 link 반영)
	const ucToBhv = coverage.uc_to_bhv ?? 1;
	const bhvToAc = coverage.bhv_to_ac ?? 1;
	return {
		critical: summary.critical ?? 0,
		high: summary.high ?? 0,
		medium: summary.medium ?? 0,
		low: summary.low ?? 0,
		info: summary.info ?? 0,
		coverage_pct: Math.min(ucToBhv, bhvToAc),
		coverage_threshold: 0.85, // default threshold (chain-coverage-validator default)
	};
}

// schema-validator stdout summary → findings 변환
// 출력 shape: "schema-validator — N file(s)\n  valid: X  invalid: Y  skipped: Z"
// schema-validator = stdout text 만 / JSON 없음 → invalid 개수 = critical
export function transformSchemaValidator(stdout) {
	const m = stdout.match(/valid:\s*(\d+)\s+invalid:\s*(\d+)/);
	if (!m) {
		return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
	}
	const invalid = parseInt(m[2], 10);
	return {
		critical: invalid, // schema invalid = critical 정합 (chain-driver gate block)
		high: 0,
		medium: 0,
		low: 0,
		info: 0,
	};
}

// test-impl-pass-validator JSON → findings 변환 (test=gate#4 / implement=gate#5 shared runner)
// F-I05 (INSPECTION-2026-05-31-implement) — cli.js 는 {pass_count,fail_count,skip_count} shape 를 emit하고
//   test_results.{total,passed,failed} 는 부재 → 두 shape 모두 관용 (live 경로 tests_* 무음 0 차단 = I9 GREEN fail-closed guard 정합).
// 출력 shape(legacy): { test_results: {total,passed,failed}, summary: {...} }
// 출력 shape(cli.js):  { pass_count, fail_count, skip_count, ok_state, outcome_mismatches?, missing_actual? }
export function transformTestImplPass(json) {
	const summary = json.summary ?? {};
	const testResults = json.test_results ?? {};
	const passed = testResults.passed ?? json.pass_count ?? 0;
	const failed = testResults.failed ?? json.fail_count ?? 0;
	const skipped = json.skip_count ?? 0;
	const total = testResults.total ?? passed + failed + skipped;
	const out = {
		critical: summary.critical ?? 0,
		high: summary.high ?? 0,
		medium: summary.medium ?? 0,
		low: summary.low ?? 0,
		info: summary.info ?? 0,
		tests_total: total,
		tests_passed: passed,
		tests_failed: failed,
	};
	// F-I05 — S2 per_tc_outcome reconcile 결과 (cli.js --scenario S2 시 emit) → gate-eval.js outcome_mismatches 로 surface.
	if (json.outcome_mismatches != null)
		out.outcome_mismatches = json.outcome_mismatches;
	if (json.missing_actual != null) out.missing_actual = json.missing_actual;
	return out;
}

// generic JSON findings → severity count
// 기본 shape: { findings: [{severity: 'critical'|'high'|'medium'|'low'|'info'}], summary: {...} }
export function transformGeneric(json) {
	const summary = json.summary ?? {};
	return {
		critical: summary.critical ?? 0,
		high: summary.high ?? 0,
		medium: summary.medium ?? 0,
		low: summary.low ?? 0,
		info: summary.info ?? 0,
	};
}

// decision-table-validator / formal-spec-link-validator JSON → findings 변환 (DEC-2026-06-06-analysis-exit-gate / RR2 어휘버그 해소)
//   이 두 validator 는 summary.{critical,high} 가 없고 totals.{breaking,non-breaking,info} 를 emit → generic transform 이 항상 0 critical (silent pass) 였음.
//   breaking → critical, non-breaking → medium 매핑 (analysis gate #0 가 실효 차단). summary fallback 도 관용.
export function transformDecisionTable(json) {
	const t = json.totals ?? json.summary ?? {};
	return {
		critical: t.breaking ?? t.critical ?? 0,
		high: t.high ?? 0,
		medium: t['non-breaking'] ?? t.non_breaking ?? t.medium ?? 0,
		low: t.low ?? 0,
		info: t.info ?? 0,
	};
}

export function transformFormalSpecLink(json) {
	const t = json.totals ?? json.summary ?? {};
	return {
		critical: (t.breaking ?? 0) + (t.errors ?? 0) + (t.critical ?? 0),
		high: t.high ?? 0,
		medium: t['non-breaking'] ?? t.non_breaking ?? t.medium ?? 0,
		low: t.low ?? 0,
		info: t.info ?? 0,
	};
}

// v2.4.0 — br-cross-consistency-validator JSON → findings 변환 (ADR-CHAIN-011 §5.6)
// 출력 shape:
// { stats: { total, with_natural_language, with_gwt, with_both, with_finding },
//   overlap_distribution: { count, mean, median, ... },
//   findings: [{ id, severity, path, br_id, rule, message, ... }],
//   summary: { deterministic_consistency_score, llm_consistency_score, overall_score, overall_threshold, gate_status } }
export function transformBrCrossConsistency(json) {
	const findings = Array.isArray(json.findings) ? json.findings : [];
	const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
	for (const f of findings) {
		const sev = f.severity ?? 'info';
		if (counts[sev] != null) counts[sev] += 1;
	}
	const summary = json.summary ?? {};
	return {
		...counts,
		br_overall_score: summary.overall_score ?? null,
		br_overall_threshold: summary.overall_threshold ?? 0.85,
		br_gate_status: summary.gate_status ?? null,
	};
}

// findings merge — 두 findings 합산 (severity count + 최소 coverage_pct 보존)
export function mergeFindings(a, b) {
	const merged = {
		critical: (a.critical ?? 0) + (b.critical ?? 0),
		high: (a.high ?? 0) + (b.high ?? 0),
		medium: (a.medium ?? 0) + (b.medium ?? 0),
		low: (a.low ?? 0) + (b.low ?? 0),
		info: (a.info ?? 0) + (b.info ?? 0),
		evidence_missing: [
			...(a.evidence_missing ?? []),
			...(b.evidence_missing ?? []),
		],
		sources: { ...(a.sources ?? {}), ...(b.sources ?? {}) },
	};
	// coverage_pct = 가장 약한 link (min)
	const ap = a.coverage_pct;
	const bp = b.coverage_pct;
	if (ap != null || bp != null) {
		merged.coverage_pct = Math.min(ap ?? 1, bp ?? 1);
		merged.coverage_threshold =
			a.coverage_threshold ?? b.coverage_threshold ?? 0.85;
	}
	// tests_* = test(gate#4)/implement(gate#5) only / preserve b (latest) over a
	if (b.tests_total != null || a.tests_total != null) {
		merged.tests_total = b.tests_total ?? a.tests_total;
		merged.tests_passed = b.tests_passed ?? a.tests_passed;
		merged.tests_failed = b.tests_failed ?? a.tests_failed;
	}
	// F-I05 — S2 per_tc_outcome reconcile 결과 보존 (tests_* 와 동일 latest non-null).
	if (b.outcome_mismatches != null || a.outcome_mismatches != null) {
		merged.outcome_mismatches = b.outcome_mismatches ?? a.outcome_mismatches;
	}
	if (b.missing_actual != null || a.missing_actual != null) {
		merged.missing_actual = b.missing_actual ?? a.missing_actual;
	}
	return merged;
}

// validator dispatch — validator_name + stage → transform 호출
// traceability-matrix-builder --json (coverage_summary) → findings (poc-18 dogfood gate wiring / DEC-2026-06-06-non-analysis-gate-fail-closed).
//   builder 가 summary.{critical,high} 가 아니라 coverage_summary 를 emit → generic transform 이 0(blind) 였음.
//   red_count(broken trace)→critical / forward_coverage<threshold(coverage gap)→medium(advisory — 부분 slice 정당 / hard-block ❌) / yellow→low.
export function transformTraceabilityMatrix(json) {
	const cs = json.coverage_summary ?? json ?? {};
	const red = cs.red_count ?? 0;
	const forwardGap =
		cs.forward_coverage != null &&
		cs.threshold != null &&
		cs.forward_coverage < cs.threshold
			? 1
			: 0;
	const yellow = cs.yellow_count ?? 0;
	return {
		critical: red,
		high: 0,
		medium: forwardGap,
		low: yellow,
		info: 0,
		traceability_forward_coverage: cs.forward_coverage ?? null,
		traceability_threshold: cs.threshold ?? null,
	};
}

export function dispatchValidator(validatorName, output) {
	switch (validatorName) {
		case 'discovery-extraction-validator':
			return transformDiscoveryExtraction(JSON.parse(output));
		case 'chain-coverage-validator':
			return transformChainCoverage(JSON.parse(output));
		case 'schema-validator':
			return transformSchemaValidator(output); // stdout text
		case 'test-impl-pass-validator':
			return transformTestImplPass(JSON.parse(output));
		case 'br-cross-consistency-validator':
			return transformBrCrossConsistency(JSON.parse(output));
		case 'decision-table-validator':
			return transformDecisionTable(JSON.parse(output));
		case 'formal-spec-link-validator':
			return transformFormalSpecLink(JSON.parse(output));
		case 'analysis-extraction-validator':
			// evidence-scan JSON = { findings, coverage, summary:{critical,high,medium} } — generic summary 정합 (F-DOGFOOD-014)
			return transformGeneric(JSON.parse(output));
		case 'traceability-matrix-builder':
			return transformTraceabilityMatrix(JSON.parse(output));
		default:
			// generic JSON fallback (drift / spec-test-link / static-runner)
			try {
				return transformGeneric(JSON.parse(output));
			} catch {
				return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
			}
	}
}

// aggregate — stage 별 validator 실행 + findings 통합 / external runner 의존 (DI 의무 / unit test 정합)
// runValidator: (validatorName, projectDir) => stdout|null
export function aggregateForStage(stage, projectDir, runValidator, opts = {}) {
	const base = REQUIRED_VALIDATORS_PER_STAGE[stage];
	if (!base) {
		throw new Error(
			`unknown stage: ${stage} (expected: analysis / discovery / spec / plan / test / implement)`,
		);
	}
	// DEC-2026-06-06-analysis-exit-gate — opts.extraValidators(조건부) 추가 + opts.failClosedOnNull(analysis fail-closed: null=evidence_missing).
	const extraValidators = Array.isArray(opts.extraValidators)
		? opts.extraValidators
		: [];
	const failClosedOnNull = opts.failClosedOnNull === true;
	const validators = [...base, ...extraValidators];

	let findings = emptyFindings();
	const sources = {};

	for (const validatorName of validators) {
		const output = runValidator(validatorName, projectDir);
		if (output == null) {
			if (failClosedOnNull) {
				// analysis gate #0 fail-closed — required validator 가 target(산출물) 미해석(manifest 미등재/파일부재) 또는 미실행 = 증거 부재 → evidence_missing (gate-eval rank-3 block / soft / --user-decision go 로 ack 가능).
				if (!findings.evidence_missing.includes(validatorName))
					findings.evidence_missing.push(validatorName);
				sources[validatorName] = {
					status: 'evidence_missing',
					reason: 'target 미해석(manifest.analysis_refs.artifacts 미등재/파일부재) 또는 validator 미실행',
				};
			} else {
				sources[validatorName] = {
					status: 'skipped',
					reason: 'validator unavailable or N/A',
				};
			}
			continue;
		}
		try {
			const partial = dispatchValidator(validatorName, output);
			findings = mergeFindings(findings, partial);
			sources[validatorName] = { status: 'ok', findings: partial };
		} catch (err) {
			sources[validatorName] = {
				status: 'error',
				error: String(err.message ?? err),
			};
			// parse fail = critical (aggregator 양심 의존 차단 정합)
			findings.critical += 1;
		}
	}

	findings.sources = sources;
	return findings;
}
