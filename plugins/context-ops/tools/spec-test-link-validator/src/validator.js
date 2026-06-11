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
		// v0.36.0 (DEC-2026-06-11-tdd-unit-layer-thread) — test_layer=unit TC 는 AC 없이 정당
		//   (빌딩블록을 class_ref 로 검증 / 유닛테스트는 acceptance 시나리오가 아님).
		//   AC coverage 축에서 제외 (no_ac_ref 오탐 차단 / AC 분모 미진입 = behavior-only 무회귀).
		if (tc.test_layer === 'unit') continue;
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

// ──────────────────────────────────────────────────────────────────────
// v0.36.0 (DEC-2026-06-11-tdd-unit-layer-thread) — mocking-soundness 계약.
//   composition TC 가 mock 한 협력자 UNIT 은 자기 test_layer=unit TC 로 핀될 때만 건전.
//   = Fowler "Mocks Aren't Stubs"의 위험('green but mask inherent errors') 형식화 + CDC 합성.
//   ★ SOFT / propose-only — 별도 함수 + cli --unit-spec opt-in 경로로만 호출.
//     gate #4 의 validateSpecTestLink 결과(exit-code 결정)에는 미포함 → 비차단(§8.1 ratchet).
//     ≥2 distinct 도메인 PoC corroboration 후 하드게이트 격상(별도 DEC).
// ──────────────────────────────────────────────────────────────────────
export function validateMockSoundness(testSpec, unitSpec) {
	const findings = [];
	const tcs = testSpec?.test_cases ?? [];
	// UNIT 이 자기 유닛테스트(test_layer=unit + class_ref)를 가지는가?
	const unitTested = new Set(
		tcs
			.filter((t) => t.test_layer === 'unit' && t.class_ref)
			.map((t) => t.class_ref),
	);
	// waived 단위는 mock 건전성 면제 (동작 주장 ❌ — data class 등)
	const waived = new Set(
		(unitSpec?.units ?? [])
			.filter((u) => u.unit_test_obligation === 'waived')
			.map((u) => u.id),
	);
	for (const tc of tcs) {
		for (const m of tc.mocks ?? []) {
			const U = m.collaborator_unit_ref;
			if (!U || waived.has(U)) continue;
			if (!unitTested.has(U)) {
				findings.push({
					kind: 'unit.mock.unsound',
					severity: 'high',
					tc_id: tc.id,
					collaborator_unit_ref: U,
					message: `TC ${tc.id} mocks ${U} but ${U} has no test_layer=unit TC — mock = unverified assumption (propose-only / soft / DEC-2026-06-11)`,
				});
			}
		}
	}
	return {
		findings,
		summary: {
			total_findings: findings.length,
			high: findings.filter((f) => f.severity === 'high').length,
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
