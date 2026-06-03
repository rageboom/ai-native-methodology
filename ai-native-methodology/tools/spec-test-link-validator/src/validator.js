// spec-test-link-validator core
// 검증:
//   1. acceptance AC-* → test-spec TC-* 1:N coverage
//   2. test-spec TC-* 의 framework 가 analysis-source-inventory stack 정합
//   3. behavior BHV-* → TC-* link 정합 (TC.bhv_ref)
//   4. coverage ≥ 0.85 ratchet

import { readFileSync, existsSync } from 'node:fs';

// analysis-source-inventory.json 의 detected stack 시그널 → 허용 framework 매핑
const FRAMEWORK_HINTS = {
	java: [
		'junit5',
		'junit',
		'spock',
		'testng',
		'spring-cloud-contract',
		'pact',
		'testcontainers',
	],
	spring: [
		'junit5',
		'junit',
		'spring-cloud-contract',
		'pact',
		'testcontainers',
	],
	kotlin: ['junit5', 'kotest', 'spring-cloud-contract'],
	nodejs: [
		'jest',
		'vitest',
		'mocha',
		'jasmine',
		'supertest',
		'playwright',
		'cypress',
		'playwright-visual',
		'axe-core',
		'percy',
		'chromatic',
	],
	typescript: [
		'jest',
		'vitest',
		'mocha',
		'jasmine',
		'supertest',
		'playwright',
		'cypress',
		'playwright-visual',
		'axe-core',
		'percy',
		'chromatic',
	],
	nestjs: ['jest', 'vitest'],
	react: [
		'jest',
		'vitest',
		'testing-library',
		'cypress',
		'playwright',
		'playwright-visual',
		'axe-core',
		'percy',
		'chromatic',
	],
	python: ['pytest', 'unittest', 'schemathesis'],
	rails: ['rspec', 'minitest'],
	ruby: ['rspec', 'minitest'],
	go: ['gotest', 'go-test'], // T16 token 정합 (load-test-cmd / test-cmd.schema = 'go-test')
};

// T9 (INSPECTION-2026-05-31-test) — v11.0.0 contract/visual framework.
//   test-spec.schema.json if/then 이 openapi_contract_ref / visual_regression_ref 로 검증 (hard gate)
//   → stack-allowlist 추론과 무관 → framework_mismatch(soft medium) 검사 bypass (false-positive 제거).
//   (DEC-2026-05-26-contract-강제-양-axis §1 layer 3 정합.)
const CONTRACT_VISUAL_FRAMEWORKS = new Set([
	'schemathesis',
	'dredd',
	'pact',
	'spring-cloud-contract', // contract (BE axis)
	'playwright-visual',
	'axe-core',
	'percy',
	'chromatic', // visual / a11y (FE axis)
]);

export function validateSpecTestLink(
	behavior,
	acceptance,
	testSpec,
	inventory,
	threshold = 0.85,
) {
	const findings = [];

	// 1. AC → TC coverage
	const acIds = new Set((acceptance?.criteria ?? []).map((a) => a.id));
	const verifiableAcIds = new Set(
		(acceptance?.criteria ?? []).filter((a) => a.verifiable).map((a) => a.id),
	);
	const tcByAC = new Map();
	const allBHVs = new Set((behavior?.behaviors ?? []).map((b) => b.id));

	for (const tc of testSpec?.test_cases ?? []) {
		if (!tc.ac_ref) {
			findings.push({
				kind: 'chain.tc.no_ac_ref',
				severity: 'critical',
				tc_id: tc.id,
				message: `TC ${tc.id} missing ac_ref`,
			});
			continue;
		}
		if (!acIds.has(tc.ac_ref)) {
			findings.push({
				kind: 'chain.tc.unknown_ac',
				severity: 'critical',
				tc_id: tc.id,
				ac_ref: tc.ac_ref,
				message: `TC ${tc.id} references unknown AC ${tc.ac_ref}`,
			});
		} else {
			if (!tcByAC.has(tc.ac_ref)) tcByAC.set(tc.ac_ref, []);
			tcByAC.get(tc.ac_ref).push(tc.id);
		}
		if (tc.bhv_ref && !allBHVs.has(tc.bhv_ref)) {
			findings.push({
				kind: 'chain.tc.unknown_bhv',
				severity: 'critical',
				tc_id: tc.id,
				bhv_ref: tc.bhv_ref,
				message: `TC ${tc.id} references unknown BHV ${tc.bhv_ref}`,
			});
		}
	}

	// verifiable AC → TC coverage
	let acCoveredCount = 0;
	for (const acId of verifiableAcIds) {
		if (tcByAC.has(acId)) acCoveredCount++;
		else
			findings.push({
				kind: 'chain.ac.no_tc',
				severity: 'high',
				ac_id: acId,
				message: `verifiable AC ${acId} has no TC (chain 2→3 link missing)`,
			});
	}
	const acCoverage =
		verifiableAcIds.size === 0 ? 1.0 : acCoveredCount / verifiableAcIds.size;

	// 2. framework match
	const stackHints = inferStackHints(inventory);
	const allowed = new Set();
	for (const hint of stackHints) {
		for (const fw of FRAMEWORK_HINTS[hint] ?? []) allowed.add(fw);
	}
	if (allowed.size > 0) {
		for (const tc of testSpec?.test_cases ?? []) {
			// T9 — contract/visual framework 는 schema if/then(openapi_contract_ref/visual_regression_ref)이
			//   검증 → stack-mismatch 검사 bypass (false-positive medium 제거).
			if (
				tc.framework &&
				!CONTRACT_VISUAL_FRAMEWORKS.has(tc.framework) &&
				!allowed.has(tc.framework)
			) {
				findings.push({
					kind: 'chain.tc.framework_mismatch',
					severity: 'medium',
					tc_id: tc.id,
					framework: tc.framework,
					stack_hints: [...stackHints],
					message: `TC ${tc.id} framework=${tc.framework} not in detected stack [${[...stackHints].join(', ')}]`,
				});
			}
		}
	}

	// 3. coverage threshold
	if (acCoverage < threshold) {
		findings.push({
			kind: 'chain.ac_coverage.below_threshold',
			severity: 'high',
			coverage: acCoverage,
			threshold,
			message: `AC→TC coverage ${acCoverage.toFixed(2)} < ${threshold}`,
		});
	}

	return {
		findings,
		coverage: { ac_to_tc: acCoverage },
		summary: {
			total_findings: findings.length,
			critical: findings.filter((f) => f.severity === 'critical').length,
			high: findings.filter((f) => f.severity === 'high').length,
			medium: findings.filter((f) => f.severity === 'medium').length,
		},
	};
}

function inferStackHints(inventory) {
	const hints = new Set();
	if (!inventory) return hints;
	// simple flat extraction
	const text = JSON.stringify(inventory).toLowerCase();
	for (const key of Object.keys(FRAMEWORK_HINTS)) {
		if (text.includes(key)) hints.add(key);
	}
	return hints;
}

export function loadJson(path) {
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, 'utf-8'));
	} catch (e) {
		throw new Error(`JSON parse error at ${path}: ${e.message}`);
	}
}
