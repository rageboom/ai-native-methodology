// plan-coverage-validator core
// 검증 (Senior BLOCKER-2 흡수 / Phase 4-1 / v11.0.0 Phase 1 잔여 확장 / v11.3.0 SP 분류):
//   1. TASK ↔ AC backward link coverage (chain 2 ↔ chain 3)
//   2. TASK ↔ TC forward link coverage (chain 3 ↔ chain 4 / optional / chain 4 진입 전 placeholder 허용)
//   3. validateNfrAllocation — high+critical NFR 누락 시 high finding (DO-178C 정신 기반 사내 해석 / Cluster 2 결단)
//   4. validateTaskGranularity — task.ac_refs.length 1~3 imperative (4+ = warn / --strict 시 high)
//   5. validateDependencyCycle — task.dependencies[] DAG cycle 검출 / cycle 시 critical finding
//   6. validateRiskSeverity — risk.severity high+critical 누락 시 medium finding (additive)
//   7. v11.0.0 — validateBETaskOpenapiRef — layer=be 시 openapi_endpoint_ref 본격 required (high finding)
//   8. v11.0.0 — validateFETaskComponentRef — layer=fe 시 component_ref 본격 required (high finding)
//   9. v11.3.0 — validateSpConversions — chain 3 plan stage SP 4 분류 매트릭스 (α/β/γ/δ) 결단 검증
//                  (sp-conversion-policy §4 정합 / γ 시 adr_ref required / γ + external=false 시 inconsistency)
//
// exit code contract (cli.js):
//   exit 0 = ok
//   exit 1 = blocking findings (critical / high / NFR allocation 누락 / TASK dependency cycle / coverage_pct < threshold / BE/FE contract 부재 / SP γ adr 부재)
//   exit 2 = usage-error (invalid args)
//
// chain-coverage-validator 동형 paradigm (autoDetectProjectRoot + loadJson + finding {kind, severity, ...domain, message}).

import { readFileSync, existsSync } from 'node:fs';

export function loadJson(p) {
	if (!existsSync(p)) throw new Error(`file not found: ${p}`);
	return JSON.parse(readFileSync(p, 'utf-8'));
}

// ──────────────────────────────────────────────────────────────────────
// 1. TASK ↔ AC backward / TASK ↔ TC forward coverage
// ──────────────────────────────────────────────────────────────────────

export function validateTaskCoverage(
	taskPlan,
	acceptance,
	testSpec,
	threshold = 0.85,
) {
	const findings = [];

	const tasks = taskPlan?.tasks ?? [];
	const acAllIds = new Set((acceptance?.criteria ?? []).map((ac) => ac.id));
	const tcAllIds = new Set((testSpec?.test_cases ?? []).map((tc) => tc.id));

	const acByTask = new Map(); // AC -> TASK[] backward
	const tasksWithAc = new Set();
	const tasksWithTc = new Set();

	for (const t of tasks) {
		// TASK ↔ AC backward link 검증
		for (const acRef of t.ac_refs ?? []) {
			if (!acByTask.has(acRef)) acByTask.set(acRef, []);
			acByTask.get(acRef).push(t.id);
			if (!acAllIds.has(acRef)) {
				findings.push({
					kind: 'plan.task.unknown_ac',
					severity: 'critical',
					task_id: t.id,
					ac_ref: acRef,
					message: `TASK ${t.id} references unknown AC ${acRef}`,
				});
			} else {
				tasksWithAc.add(t.id);
			}
		}
		// TASK ↔ TC forward link 검증 (optional / testSpec 없으면 skip)
		if (testSpec) {
			for (const tcRef of t.tc_refs ?? []) {
				if (!tcAllIds.has(tcRef)) {
					findings.push({
						kind: 'plan.task.unknown_tc',
						severity: 'high',
						task_id: t.id,
						tc_ref: tcRef,
						message: `TASK ${t.id} references unknown TC ${tcRef}`,
					});
				} else {
					tasksWithTc.add(t.id);
				}
			}
		}
	}

	// AC → TASK backward coverage (모든 AC 가 ≥ 1 TASK 에 의해 cover)
	let acCoveredCount = 0;
	for (const acId of acAllIds) {
		if (acByTask.has(acId)) acCoveredCount++;
		else {
			findings.push({
				kind: 'plan.ac.no_task',
				severity: 'high',
				ac_id: acId,
				message: `AC ${acId} has no TASK (chain 2→3 link missing)`,
			});
		}
	}
	const acCoverage = acAllIds.size === 0 ? 1.0 : acCoveredCount / acAllIds.size;
	if (acCoverage < threshold) {
		findings.push({
			kind: 'plan.ac_coverage.below_threshold',
			severity: 'high',
			coverage_pct: acCoverage,
			threshold,
			message: `AC→TASK coverage ${(acCoverage * 100).toFixed(1)}% < threshold ${(threshold * 100).toFixed(0)}%`,
		});
	}

	// TASK → TC forward coverage (testSpec 있을 때만)
	let tcCoverage = null;
	if (testSpec) {
		tcCoverage = tasks.length === 0 ? 1.0 : tasksWithTc.size / tasks.length;
		if (tcCoverage < threshold) {
			findings.push({
				kind: 'plan.tc_coverage.below_threshold',
				severity: 'high',
				coverage_pct: tcCoverage,
				threshold,
				message: `TASK→TC coverage ${(tcCoverage * 100).toFixed(1)}% < threshold ${(threshold * 100).toFixed(0)}%`,
			});
		}
	}

	return {
		findings,
		coverage: { ac_to_task: acCoverage, task_to_tc: tcCoverage },
		summary: aggregateSummary(findings),
	};
}

// ──────────────────────────────────────────────────────────────────────
// 2. NFR allocation hard gate (Cluster 2 결단 / high+critical 누락 시 high finding)
//   ISO/IEC 25010:2023 SQuaRE 9 quality characteristic 정합
//   severity_floor 0.95/0.90/0.85 = DO-178C 정신 기반 사내 해석 (원본 직접 규정 ❌)
// ──────────────────────────────────────────────────────────────────────

export function validateNfrAllocation(taskPlan) {
	const findings = [];
	const nfrs = taskPlan?.nfr_allocation ?? [];
	const tasks = taskPlan?.tasks ?? [];

	// high+critical NFR 의 task_refs 누락 시 high finding
	for (const nfr of nfrs) {
		if (nfr.severity === 'critical' || nfr.severity === 'high') {
			if (!nfr.task_refs || nfr.task_refs.length === 0) {
				findings.push({
					kind: 'plan.nfr.allocation_missing',
					severity: 'high',
					nfr_id: nfr.id,
					nfr_severity: nfr.severity,
					message: `NFR ${nfr.id} (severity=${nfr.severity}) has no task_refs allocation (Cluster 2 plan hard gate)`,
				});
			}
			// AC ↔ NFR 양방향 link (Cluster 4 cross-cut)
			if (!nfr.acceptance_criteria_ref) {
				findings.push({
					kind: 'plan.nfr.no_ac_link',
					severity: 'medium',
					nfr_id: nfr.id,
					message: `NFR ${nfr.id} has no acceptance_criteria_ref (Cluster 4 cross-cut bidirectional)`,
				});
			}
		}
	}

	// task 의 nfr_allocation field 가 high+critical NFR 와 연결 안 됐을 때 (cross-check)
	if (nfrs.length === 0 && tasks.length > 0) {
		findings.push({
			kind: 'plan.nfr.no_allocation',
			severity: 'medium',
			message: `task-plan has ${tasks.length} tasks but nfr_allocation is empty (Discovery soft → Plan hard 비대칭 위배 가능)`,
		});
	}

	return {
		findings,
		summary: aggregateSummary(findings),
	};
}

// ──────────────────────────────────────────────────────────────────────
// 3. TASK granularity (1~3 AC 묶음 imperative / DEC-2026-05-21 §정책4)
//   default = warn (medium) / --strict = high
// ──────────────────────────────────────────────────────────────────────

export function validateTaskGranularity(taskPlan, strict = false) {
	const findings = [];
	const tasks = taskPlan?.tasks ?? [];

	for (const t of tasks) {
		const acCount = (t.ac_refs ?? []).length;
		if (acCount > 3) {
			findings.push({
				kind: 'plan.task.granularity_exceeded',
				severity: strict ? 'high' : 'medium',
				task_id: t.id,
				ac_count: acCount,
				message: `TASK ${t.id} has ${acCount} ac_refs > 3 (DEC-2026-05-21 §정책4 1~3 AC 묶음 위배 / strict=${strict})`,
			});
		}
		if (acCount === 0) {
			findings.push({
				kind: 'plan.task.no_ac',
				severity: 'high',
				task_id: t.id,
				message: `TASK ${t.id} has 0 ac_refs (chain 2 backward link 부재)`,
			});
		}
	}

	return {
		findings,
		summary: aggregateSummary(findings),
	};
}

// ──────────────────────────────────────────────────────────────────────
// 4. Dependency cycle (DAG)
//   cycle 시 critical finding
// ──────────────────────────────────────────────────────────────────────

export function validateDependencyCycle(taskPlan) {
	const findings = [];
	const tasks = taskPlan?.tasks ?? [];

	// adjacency
	const adj = new Map();
	for (const t of tasks) {
		adj.set(t.id, t.dependencies ?? []);
	}

	// DFS cycle detection
	const WHITE = 0,
		GRAY = 1,
		BLACK = 2;
	const color = new Map();
	for (const id of adj.keys()) color.set(id, WHITE);

	const cycles = [];

	function dfs(node, path) {
		color.set(node, GRAY);
		path.push(node);
		for (const next of adj.get(node) ?? []) {
			if (!adj.has(next)) {
				// unknown task dependency
				findings.push({
					kind: 'plan.task.unknown_dependency',
					severity: 'high',
					task_id: node,
					dep_ref: next,
					message: `TASK ${node} dependency ${next} not found in tasks[]`,
				});
				continue;
			}
			const c = color.get(next);
			if (c === GRAY) {
				// cycle detected
				const cycleStart = path.indexOf(next);
				cycles.push(path.slice(cycleStart).concat([next]));
			} else if (c === WHITE) {
				dfs(next, [...path]);
			}
		}
		color.set(node, BLACK);
	}

	for (const id of adj.keys()) {
		if (color.get(id) === WHITE) dfs(id, []);
	}

	for (const cyc of cycles) {
		findings.push({
			kind: 'plan.task.dependency_cycle',
			severity: 'critical',
			cycle: cyc,
			message: `TASK dependency cycle: ${cyc.join(' → ')}`,
		});
	}

	return {
		findings,
		summary: aggregateSummary(findings),
	};
}

// ──────────────────────────────────────────────────────────────────────
// 5. Risk severity (additive / medium finding)
//   high+critical risk 누락 시 medium finding (3중 망 정합 — LLM + industry + human)
// ──────────────────────────────────────────────────────────────────────

export function validateRiskSeverity(taskPlan) {
	const findings = [];
	const risks = taskPlan?.risks ?? [];
	const tasks = taskPlan?.tasks ?? [];

	// high+critical risk 의 mitigation + human_review 누락 시 medium finding
	for (const r of risks) {
		if (r.severity === 'critical' || r.severity === 'high') {
			if (!r.mitigation) {
				findings.push({
					kind: 'plan.risk.no_mitigation',
					severity: 'medium',
					risk_id: r.id,
					risk_severity: r.severity,
					message: `RISK ${r.id} (severity=${r.severity}) has no mitigation strategy (3중 망 정합)`,
				});
			}
			if (r.human_review !== true) {
				findings.push({
					kind: 'plan.risk.no_human_review',
					severity: 'low',
					risk_id: r.id,
					message: `RISK ${r.id} (severity=${r.severity}) has no human_review (3중 망 / DEC-2026-05-21 §정책6 / 사람 보강 권고)`,
				});
			}
		}
	}

	// tasks 가 있는데 risks 가 0 일 때 medium finding (Discovery soft → Plan hard 비대칭 정합)
	if (tasks.length > 0 && risks.length === 0) {
		findings.push({
			kind: 'plan.risk.empty',
			severity: 'medium',
			message: `task-plan has ${tasks.length} tasks but risks[] is empty (3중 망 LLM + industry + human / DEC-2026-05-21 §정책6 정합)`,
		});
	}

	return {
		findings,
		summary: aggregateSummary(findings),
	};
}

// ──────────────────────────────────────────────────────────────────────
// 6. v11.0.0 — BE/FE contract 1:1 matching (DEC-2026-05-26-contract-강제-양-axis §1 layer 2 hard gate)
//   layer=be 시 openapi_endpoint_ref 본격 required (schema-level if/then + validator-level finding dual)
//   layer=fe 시 component_ref 본격 required
//   cross-file (openapi.yaml file system load + endpoint 존재 verify) = v11.x carry
// ──────────────────────────────────────────────────────────────────────

export function validateBETaskOpenapiRef(taskPlan) {
	const findings = [];
	const tasks = taskPlan?.tasks ?? [];

	for (const t of tasks) {
		if (t.layer !== 'be') continue;
		if (!t.openapi_endpoint_ref) {
			findings.push({
				kind: 'plan.task.be_missing_openapi_ref',
				severity: 'high',
				task_id: t.id,
				layer: t.layer,
				message: `BE TASK ${t.id} (layer=be) missing openapi_endpoint_ref (DEC-2026-05-26-contract-강제-양-axis §1 layer 2 hard gate / schema-level if/then dual)`,
			});
			continue;
		}
		const { path, operationId } = t.openapi_endpoint_ref;
		if (!path || !operationId) {
			findings.push({
				kind: 'plan.task.be_invalid_openapi_ref',
				severity: 'high',
				task_id: t.id,
				message: `BE TASK ${t.id} openapi_endpoint_ref missing path or operationId (path=${path ?? 'null'} / operationId=${operationId ?? 'null'})`,
			});
		}
	}

	return {
		findings,
		summary: aggregateSummary(findings),
	};
}

export function validateFETaskComponentRef(taskPlan) {
	const findings = [];
	const tasks = taskPlan?.tasks ?? [];

	for (const t of tasks) {
		if (t.layer !== 'fe') continue;
		if (!t.component_ref) {
			findings.push({
				kind: 'plan.task.fe_missing_component_ref',
				severity: 'high',
				task_id: t.id,
				layer: t.layer,
				message: `FE TASK ${t.id} (layer=fe) missing component_ref (DEC-2026-05-26-contract-강제-양-axis §1 layer 2 hard gate)`,
			});
			continue;
		}
		const { package: pkg, name } = t.component_ref;
		if (!pkg || !name) {
			findings.push({
				kind: 'plan.task.fe_invalid_component_ref',
				severity: 'high',
				task_id: t.id,
				message: `FE TASK ${t.id} component_ref missing package or name (package=${pkg ?? 'null'} / name=${name ?? 'null'})`,
			});
		}
	}

	return {
		findings,
		summary: aggregateSummary(findings),
	};
}

// ──────────────────────────────────────────────────────────────────────
// 7. v11.3.0 — SP 분류 결단 (sp-conversion-policy §4 정합)
//   γ (외부 시스템 SP) classification 시 adr_ref required → high finding
//   γ classification 인데 external=false (또는 missing) → medium inconsistency
//   rationale 누락 (schema minLength 보완) → high finding
//   DEC-2026-05-28-sp-conversion-policy / ADR-CHAIN-015 정합
// ──────────────────────────────────────────────────────────────────────

export function validateSpConversions(taskPlan) {
	const findings = [];
	const conversions = taskPlan?.sp_conversions ?? [];

	for (const c of conversions) {
		// γ classification 시 adr_ref required (외부 시스템 contract ADR 인용 의무)
		if (c.sp_conversion_class === 'gamma') {
			if (!c.adr_ref) {
				findings.push({
					kind: 'plan.sp_conversion.no_adr_for_gamma',
					severity: 'high',
					sp_id: c.sp_id,
					message: `SP ${c.sp_id} γ classification (외부 시스템 SP 보존) 인데 adr_ref 부재 (sp-conversion-policy §6.2 외부 시스템 contract ADR 의무)`,
				});
			}
			// γ classification 인데 external=false (또는 missing) → inconsistency
			if (c.external !== true) {
				findings.push({
					kind: 'plan.sp_conversion.gamma_not_external',
					severity: 'medium',
					sp_id: c.sp_id,
					message: `SP ${c.sp_id} γ classification 인데 external≠true (sp-conversion-policy §2 γ = 외부 시스템 SP 보존 / external=true 의무)`,
				});
			}
		}

		// rationale 약함 (schema minLength 5 = 형식 / 본 validator 는 의미 보강 — 단순 placeholder 차단)
		if (c.rationale && c.rationale.length < 10) {
			findings.push({
				kind: 'plan.sp_conversion.weak_rationale',
				severity: 'medium',
				sp_id: c.sp_id,
				rationale_length: c.rationale.length,
				message: `SP ${c.sp_id} rationale 길이 ${c.rationale.length} < 10 (sp-conversion-policy §4 분류 결단 근거 빈약 의심 / 체크리스트 §4.1~4.4 정합 의무)`,
			});
		}

		// δ classification 인데 verification_oracle 부재 → medium (DB-specific 기능은 검증 어려움 = oracle 강하게 권고)
		if (c.sp_conversion_class === 'delta' && !c.verification_oracle) {
			findings.push({
				kind: 'plan.sp_conversion.delta_no_oracle',
				severity: 'medium',
				sp_id: c.sp_id,
				message: `SP ${c.sp_id} δ classification (DB-specific 기능) 인데 verification_oracle 부재 (ORM 표현 어려움 → numeric/row equivalence oracle 강하게 권고)`,
			});
		}
	}

	return {
		findings,
		summary: aggregateSummary(findings),
	};
}

// ──────────────────────────────────────────────────────────────────────
// helpers
// ──────────────────────────────────────────────────────────────────────

function aggregateSummary(findings) {
	return {
		total_findings: findings.length,
		critical: findings.filter((f) => f.severity === 'critical').length,
		high: findings.filter((f) => f.severity === 'high').length,
		medium: findings.filter((f) => f.severity === 'medium').length,
		low: findings.filter((f) => f.severity === 'low').length,
		info: findings.filter((f) => f.severity === 'info').length,
	};
}
