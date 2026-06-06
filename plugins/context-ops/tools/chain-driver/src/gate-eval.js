// gate-eval.js — validator 결과 → block/unblock 결정 (mechanical gate trio (i) 의 source).
// ADR-CHAIN-005 §3 (mechanical gate enforcement).
//
// findings shape:
// {
//   critical: 0, high: 0, medium: 0, low: 0, info: 0,
//   coverage_pct: 0.92,             // chain-coverage 결과
//   coverage_threshold: 0.85,       // ratchet
//   evidence_missing: [],           // chain-strict lint
//   tests_total: 100, tests_passed: 100, tests_failed: 0,  // chain 4/5 only (test/implement)
//   // v2.5.0 Phase C session 14차 — Layer 2 LLM 통합 paradigm (ADR-CHAIN-011 §5.4.6 B 정합)
//   llm_consistency_score: 0.85,    // aggregate mean (br-cross-consistency-validator Layer 2 / null = skipped)
//   llm_threshold: 0.7,             // semantic threshold (default 0.7 / caller-configurable)
//   llm_status: 'evaluated',        // 'evaluated' | 'skipped' | null (explicit guard 의무 / REVISE-1 정합)
// }

const REQUIRED_VALIDATORS_PER_STAGE = {
	// v9.0 — planning→discovery 개칭 (gate #1). v11.0.0 — tool rename planning-extraction-validator → discovery-extraction-validator (DEC-2026-05-26-discovery-spec-rename). v9.1.x — plan stage validator 본격 등록 (DEC-2026-05-25-axis-a-phase-4-1 Phase 4-2).
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
// v2.4.0 — discovery(planning) stage 안 br-cross-consistency-validator 추가 (ADR-CHAIN-011 §5.6 정합).
//   BR dual representation paradigm — natural_language + given/when/then 정합 cross-validation.
// v2.5.0 Phase C session 14차 — Layer 2 LLM 통합 (ADR-CHAIN-011 §5.4.6 B 본격 정합).
//   Q-C4 (a) Layer 1 AND Layer 2 양쪽 통과 paradigm + Q-S2 (b) aggregate block + coverage_threshold 수준 severity.
//   Senior STOP-3 흡수 (Q-S3 (a) Phase C 종결 자격 유일 paradigm).

const TEST_STAGE_EXPECTED = 'all_fail'; // RED 의무 (S1 default)
const IMPL_STAGE_EXPECTED = 'all_pass'; // GREEN 의무 (S1 default)

// v11.9.0 — use-scenario taxonomy 별 RED/GREEN 기대 (DEC-2026-05-30-use-scenario-taxonomy §2.2 / F-DOGFOOD-007 구조 해소).
//   S1(재생성)/greenfield(신규) = forward: test all_fail(RED=생성될 코드 부재) → implement all_pass(GREEN).
//   S3(특성화/문서화만) = snapshot: RED 강제 ❌ (기존 동작 snapshot GREEN / test 단계 RED 미요구).
//   S2(AX전환) = per_tc_outcome (v11.11.0 / DEC-2026-05-30-s2-gate-slice / C-use-scenario-s2-gate Track α):
//     legacy in-place 증강 → characterization TC(expected_outcome='pass' / 기존 동작 GREEN) + augmentation TC(expected_outcome='fail' / 신규 RED) 혼합.
//     aggregate all_fail 대신 per-TC expected_outcome ↔ 실 결과 일치 검사 (validator 가 outcome_mismatches emit).
//     v11.33.0 — §8.1 ≥2 distinct domain execution corroboration 충족(RealWorld Spring/JUnit + ecommerce NestJS/jest) → WARN→block 격상.
//       s2_outcome_mismatch rank 1(validator_high 수준) + HARD_BLOCK_CODES 등재 → 사용자 'go' 거부(hard-block). DEC-2026-06-01-s2-gate-block-upgrade.
//   미지정 → 'S1' default (backward-compat / 기존 동작 동일).
const SCENARIO_EXPECTED = Object.freeze({
	S1: { test: 'all_fail', implement: 'all_pass' },
	greenfield: { test: 'all_fail', implement: 'all_pass' },
	S2: { test: 'per_tc_outcome', implement: 'all_pass' }, // v11.11.0 characterization GREEN + augmentation RED 분리
	S3: { test: 'snapshot_green', implement: 'all_pass' },
});

export function requiredValidators(stage) {
	return REQUIRED_VALIDATORS_PER_STAGE[stage] || [];
}

export function evaluateGate(stage, findings, scenario = 'S1') {
	const reasons = [];
	const expected = SCENARIO_EXPECTED[scenario] || SCENARIO_EXPECTED.S1;

	// F-AUDIT-SOFTGATE-001 (=C-13 해소) — findings 미제출 = fail-closed.
	//   chain-driver next 가 --findings 없이 호출되면 loadFindings 가 __findings_absent sentinel 반환.
	//   silent soft-pass 제거 (no-simulation / 양심 의존 차단 원칙). rank 2 = --user-decision go 로 명시 ack 가능 (escape).
	//   gate-eval 순수성 보존 — sentinel in, reason out (validator 실행은 caller 책임).
	if (findings.__findings_absent) {
		reasons.push({
			code: 'findings_unverified',
			detail:
				'no --findings supplied — gate 검증 증거 부재 (fail-closed). 진짜 validator findings 를 --findings <path> 로 공급하거나, --user-decision go 로 명시 ack(intervention-log 기록) 후 전진.',
		});
	}

	if ((findings.critical ?? 0) > 0) {
		reasons.push({
			code: 'validator_critical',
			detail: `critical findings = ${findings.critical}`,
		});
	}
	if ((findings.high ?? 0) > 0) {
		reasons.push({
			code: 'validator_high',
			detail: `high findings = ${findings.high}`,
		});
	}
	if (findings.coverage_pct != null && findings.coverage_threshold != null) {
		if (findings.coverage_pct < findings.coverage_threshold) {
			reasons.push({
				code: 'coverage_threshold',
				detail: `coverage ${findings.coverage_pct} < threshold ${findings.coverage_threshold}`,
			});
		}
	}
	if (
		Array.isArray(findings.evidence_missing) &&
		findings.evidence_missing.length > 0
	) {
		reasons.push({
			code: 'evidence_missing',
			detail: `5종 물증 누락: ${findings.evidence_missing.join(', ')}`,
		});
	}

	// v2.5.0 Phase C session 14차 — Layer 2 LLM 통합 paradigm (Q-S1 (a) + Q-S2 (b) 정합)
	//   REVISE-1 정합 — explicit guard 의무 (implicit JS false 의존 ❌):
	//     1. llm_status === 'skipped' → block 없음 (backward-compat / Layer 2 미시행 허용)
	//     2. llm_status === 'evaluated' && llm_consistency_score >= threshold → block 없음
	//     3. llm_status === 'evaluated' && llm_consistency_score < threshold → block reason 추가
	//   Senior 권장 = layer2_threshold severity rank = coverage_threshold 수준 (rank 2) — user go → go-with-warnings 허용 / semantic drift 도메인 전문가 검토 carry 영역 / Phase D 흐름 정합
	if (
		findings.llm_status === 'evaluated' &&
		findings.llm_consistency_score != null
	) {
		const llmThreshold = findings.llm_threshold ?? 0.7;
		if (findings.llm_consistency_score < llmThreshold) {
			reasons.push({
				code: 'layer2_threshold',
				detail: `Layer 2 llm_consistency_score ${findings.llm_consistency_score} < threshold ${llmThreshold} (NL ↔ GWT semantic 정합 부재 / ADR-CHAIN-011 §5.4.6 B Layer 2 mandatory 정합)`,
			});
		}
	}

	// Stage-specific outcome enforcement (v11.9.0 — scenario-aware / SCENARIO_EXPECTED 매트릭스).
	if (stage === 'test') {
		// RED 요구는 forward 시나리오(S1/greenfield)만. S3(snapshot_green) = RED 강제 ❌.
		if (
			expected.test === 'all_fail' &&
			findings.tests_total != null &&
			findings.tests_failed === 0
		) {
			reasons.push({
				code: 'evidence_missing',
				detail: `chain 4 (test) expected all_fail (RED) for scenario ${scenario}, but all tests passed — RED proof missing (RED 대상 = 생성될 코드)`,
			});
		}
		// v11.11.0 — S2(AX전환) per_tc_outcome: characterization(expected_outcome='pass') GREEN + augmentation(='fail') RED 혼합.
		//   v11.19 F-I05 — test-impl-pass-validator `--scenario S2 --test-spec <path>` 호출 시 s2-outcome-check.js(reconcileOutcomes)가
		//   per-TC expected_outcome vs 실 결과 비교 → outcome_mismatches emit → findings-aggregator 가 surface → 본 gate read (live producer 배선).
		//   corroboration 0 동안 WARN (s2_outcome_mismatch rank 2 / go-with-warnings 허용 / DEC-2026-05-30-s2-gate-slice).
		if (
			expected.test === 'per_tc_outcome' &&
			(findings.outcome_mismatches ?? 0) > 0
		) {
			reasons.push({
				code: 's2_outcome_mismatch',
				detail: `chain 4 (test, S2 AX전환) per-TC expected_outcome mismatch ×${findings.outcome_mismatches} — characterization 은 GREEN(pass) / augmentation 은 RED(fail) 기대 (test_intent ↔ expected_outcome 정합 / v11.33.0 hard-block: §8.1 ≥2 distinct domain corroboration 충족)`,
			});
		}
	}
	if (stage === 'implement') {
		if (
			expected.implement === 'all_pass' &&
			findings.tests_total != null &&
			findings.tests_failed > 0
		) {
			reasons.push({
				code: 'evidence_missing',
				detail: `chain 5 (implement) expected all_pass (GREEN) for scenario ${scenario}, but ${findings.tests_failed} tests failed`,
			});
		}
		// I9 (INSPECTION-2026-05-31-implement) — GREEN fail-OPEN 차단: implement GREEN 의무인데 test 결과(tests_total) 부재 시 evidence_missing.
		//   기존엔 tests_failed>0 만 검사 → tests_total==null(진짜 runner 미실행/미제출)이면 GREEN gate 통과하던 결정론 누수 해소 (fail-closed / no-simulation).
		if (expected.implement === 'all_pass' && findings.tests_total == null) {
			reasons.push({
				code: 'evidence_missing',
				detail: `chain 5 (implement) GREEN 의무인데 test-impl-pass-validator 결과(tests_total) 부재 — 진짜 runner 미실행/미제출 (fail-closed / I9)`,
			});
		}
		// v8.6.0 — R19 evidence_trust 3-tier chain-strict mode 격상 (Senior STRONG-STOP 흡수).
		//   Tier 3 (simulated) emit 검출 시 영구 reject — chain gate block.
		//   findings.simulated_evidence_count > 0 시 block (static-runner evidence_trust=simulated 감지 결과).
		if ((findings.simulated_evidence_count ?? 0) > 0) {
			reasons.push({
				code: 'evidence_missing',
				detail: `R19 Tier 3 (simulated) evidence detected ×${findings.simulated_evidence_count} — no-simulation 정책 정면 위반 / chain gate -5%p + block`,
			});
		}
	}

	if (reasons.length === 0) {
		return { blocked: false, decision: 'go-eligible', reasons: [] };
	}

	// Pick the most severe reason as primary block_reason.
	const severityRank = {
		validator_critical: 0,
		state_corrupt: 0,
		validator_high: 1,
		s2_outcome_mismatch: 1, // v11.33.0 / S2 per-TC outcome mismatch / WARN→block 격상 (§8.1 ≥2 distinct domain 충족: RealWorld+ecommerce) / validator_high 수준 / HARD_BLOCK_CODES 등재 → 'go' 거부 / DEC-2026-06-01-s2-gate-block-upgrade (직전 v11.11.0 rank 2 WARN / DEC-2026-05-30-s2-gate-slice)
		coverage_threshold: 2,
		layer2_threshold: 2, // session 14차 / Senior 권장 / coverage_threshold 수준 / user go → go-with-warnings 허용 / semantic drift Phase D carry
		findings_unverified: 2, // F-AUDIT-SOFTGATE-001 (=C-13) / findings 미제출 fail-closed / coverage_threshold 수준 / --user-decision go 로 명시 ack 가능 (silent pass ❌)
		evidence_missing: 3,
		schema_migration_required: 4,
		user_stop: 5,
	};
	reasons.sort(
		(a, b) => (severityRank[a.code] ?? 99) - (severityRank[b.code] ?? 99),
	);

	return {
		blocked: true,
		decision: 'block',
		reasons,
		primary_reason: reasons[0].code,
	};
}

// v11.33.0 — hard-block code 집합 (사용자 'go' override 거부 / Auto Mode 차단).
//   validator_critical/high = 항상 hard-block. s2_outcome_mismatch = §8.1 ≥2 distinct domain execution corroboration
//   충족(RealWorld Spring/JUnit + ecommerce NestJS/jest)으로 WARN→block 격상 (DEC-2026-06-01-s2-gate-block-upgrade).
//   별도 집합 = layer2_threshold/coverage_threshold/findings_unverified(rank 2, WARN 의도) 와 명시 분리
//     (hasCriticalOrHigh 술어 = "critical/high severity" 의미 오염 회피 / Senior REVISE @0.88).
//   state_corrupt 미포함 = 본 격상 scope 외(기존 override 거부 집합 = critical/high 뿐 / 별도 latent 이슈로 carry / 무관 behavior 변경 회피).
const HARD_BLOCK_CODES = new Set([
	'validator_critical',
	'validator_high',
	's2_outcome_mismatch',
]);

// Auto Mode override 차단 — HARD_BLOCK_CODES 위반 시 사용자 명시 결단도 'go' 거부.
// v2.5.0 Phase C session 14차 — layer2_threshold = critical/high 영역 ❌ / user go → go-with-warnings 허용 (semantic drift 도메인 전문가 검토 carry 영역 / Phase D 흐름 정합).
export function applyUserDecision(gateResult, userDecision) {
	if (!gateResult.blocked) {
		if (userDecision === 'stop')
			return {
				blocked: true,
				decision: 'stop',
				reasons: [{ code: 'user_stop', detail: 'user requested stop' }],
			};
		return gateResult;
	}
	// Blocked: only 'stop' or 'revisit:<stage>' allowed. 'go' rejected for critical/high.
	if (userDecision === 'stop') {
		return { ...gateResult, decision: 'stop' };
	}
	if (userDecision?.startsWith('revisit:')) {
		return { ...gateResult, decision: userDecision };
	}
	if (userDecision === 'go') {
		const hasHardBlock = gateResult.reasons.some((r) =>
			HARD_BLOCK_CODES.has(r.code),
		);
		if (hasHardBlock) {
			return { ...gateResult, decision: 'block', user_override_rejected: true };
		}
		// medium/low only — allow with warning (layer2_threshold/coverage_threshold/findings_unverified 영역 정합)
		return {
			blocked: false,
			decision: 'go-with-warnings',
			reasons: gateResult.reasons,
		};
	}
	return gateResult;
}
