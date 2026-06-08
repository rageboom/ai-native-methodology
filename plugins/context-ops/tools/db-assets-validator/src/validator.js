/**
 * DB 자산 always-on 정책 validator (F-DB-AUTOVAL-001 해소 / db-assets-always-on.md §8.4).
 *
 * work-unit-manifest.json 의 `analysis_refs` 안 DB 자산 4 필드를 검사:
 *   db_tables[]  (string)         — 관련 Table 식별자
 *   db_procedures[] (object)      — { id, sp_conversion_class?, external? }
 *   db_functions[] (string)       — 관련 Function 식별자
 *   db_views[] (string)           — 관련 View 식별자
 *
 * 검사 axis (db-assets-always-on §3 stage 별 입력 의무 + sp-conversion-policy §2 4 분류):
 *   1) 구조 — SP id 누락 / sp_conversion_class enum 위반
 *   2) 논리 — external ↔ gamma 일관성 (γ classification 시 external=true 의무)
 *   3) stage 정책 — plan stage 이후 SP 미분류 = hard-gate (discovery 까지는 nullable)
 *   4) always-on nudge — scope 가 비-DB 자산은 채웠으나 DB 자산 0 (greenfield 면제)
 *
 * axis 분리 (chain-driver 결정론 / feedback_chain_driver_deterministic_axis):
 *   본 validator = 결정론 (LLM 판단 inject ❌). manifest 완성도 검사 only —
 *   canonical global (.ai-context/output/schema.json) 와의 cross-resolution 은 drift-validator 영역.
 *
 * 입력: work-unit-manifest.json (object)
 * 출력: { passed, summary, findings }
 *
 * 운영: release-readiness #23 (golden fixture 판별) + standalone (chain --next 전 audit).
 */

const SP_CLASS_ENUM = ['alpha', 'beta', 'gamma', 'delta'];
// manifest stage enum 은 planning/spec/test/impl (legacy) — chain 은 discovery/spec/plan/test/implement.
// SP 전환 결단은 plan stage 진입 시 의무 (db-assets-always-on §3 chain 3). plan 이후 = {plan,test,impl,implement}.
const PLAN_OR_LATER = new Set(['plan', 'test', 'impl', 'implement']);
const NON_DB_REF_KEYS = [
	'rules',
	'endpoints',
	'schemas',
	'domain',
	'antipatterns',
];

export function validateDbAssets(manifest, opts = {}) {
	const findings = [];
	const m = manifest && typeof manifest === 'object' ? manifest : {};

	const stage = String(opts.stage || m.stage || m.current_stage || 'unknown');
	const scenario = String(m.scenario || 'unknown');
	const isPlanOrLater = PLAN_OR_LATER.has(stage);

	const refs =
		m.analysis_refs && typeof m.analysis_refs === 'object'
			? m.analysis_refs
			: null;
	const tables = arr(refs?.db_tables);
	const procedures = arr(refs?.db_procedures);
	const functions = arr(refs?.db_functions);
	const views = arr(refs?.db_views);

	// 1) + 2) + 3) — db_procedures 구조 / 논리 / stage 정책
	let classifiedCount = 0;
	procedures.forEach((sp, i) => {
		const id = sp && typeof sp === 'object' ? sp.id : undefined;
		const cls =
			sp && typeof sp === 'object' ? sp.sp_conversion_class : undefined;
		const external = sp && typeof sp === 'object' ? sp.external : undefined;
		const label = typeof id === 'string' && id ? id : `db_procedures[${i}]`;

		if (typeof id !== 'string' || id.length === 0) {
			findings.push({
				severity: 'critical',
				code: 'sp_missing_id',
				message: `db_procedures[${i}] 에 required 'id' 부재 (work-unit-manifest.schema analysis_refs.db_procedures.items.required)`,
			});
		}

		if (cls !== undefined) {
			if (!SP_CLASS_ENUM.includes(cls)) {
				findings.push({
					severity: 'critical',
					code: 'sp_invalid_class',
					message: `${label} sp_conversion_class '${cls}' ∉ {${SP_CLASS_ENUM.join(',')}} (sp-conversion-policy §2)`,
				});
			} else {
				classifiedCount++;
				// 2) 논리 — γ ↔ external 일관성
				if (external === true && cls !== 'gamma') {
					findings.push({
						severity: 'high',
						code: 'external_class_mismatch',
						message: `${label} external=true 인데 sp_conversion_class='${cls}' (외부 SP 는 γ 보존 의무 / sp-conversion-policy §2 γ)`,
					});
				}
				if (cls === 'gamma' && external !== true) {
					findings.push({
						severity: 'medium',
						code: 'gamma_external_unset',
						message: `${label} sp_conversion_class='gamma' 인데 external≠true (γ classification 시 external=true 의무 / db-assets-always-on §5)`,
					});
				}
			}
		} else if (isPlanOrLater) {
			// 3) stage 정책 — plan stage 이후 미분류 = hard-gate
			findings.push({
				severity: 'critical',
				code: 'sp_unclassified_at_plan',
				message: `${label} sp_conversion_class 부재 (stage='${stage}' = plan 이후 — SP 전환 결단 의무 / db-assets-always-on §3 chain 3)`,
			});
		}
		// pre-plan + class 부재 = nullable 정상 (finding ❌ / summary.sp_conversion_complete 반영)
	});

	// 4) always-on nudge — 비-DB 자산은 채웠으나 DB 자산 0 (greenfield 면제 / paradigm-aware)
	const dbEmpty =
		tables.length === 0 &&
		procedures.length === 0 &&
		functions.length === 0 &&
		views.length === 0;
	const nonDbPopulated = refs
		? NON_DB_REF_KEYS.some((k) => arr(refs[k]).length > 0)
		: false;
	if (refs && dbEmpty && nonDbPopulated && scenario !== 'greenfield') {
		findings.push({
			severity: 'medium',
			code: 'db_assets_absent',
			message: `analysis_refs 에 비-DB 자산(${NON_DB_REF_KEYS.filter((k) => arr(refs[k]).length > 0).join('/')})은 있으나 DB 자산 4종 모두 0 — DB layer 누락 여부 확인 의무 (db-assets-always-on §3 / scope 에 DB layer 부재면 무시 / greenfield 면제)`,
		});
	}

	const counts = tally(findings);
	const passed = counts.critical === 0 && counts.high === 0;
	const spConversionComplete =
		procedures.length === 0 ? true : classifiedCount === procedures.length;

	return {
		passed,
		summary: {
			stage,
			scenario,
			db_tables_count: tables.length,
			db_procedures_count: procedures.length,
			db_functions_count: functions.length,
			db_views_count: views.length,
			sp_conversion_complete: spConversionComplete,
			db_assets_complete: !findings.some((f) => f.code === 'db_assets_absent'),
			total_findings: findings.length,
			critical: counts.critical,
			high: counts.high,
			medium: counts.medium,
			low: counts.low,
		},
		findings,
	};
}

function arr(v) {
	return Array.isArray(v) ? v : [];
}

function tally(findings) {
	const c = { critical: 0, high: 0, medium: 0, low: 0 };
	for (const f of findings) {
		if (c[f.severity] !== undefined) c[f.severity]++;
	}
	return c;
}
