// formal-spec.schema.json의 decision_tables[] 정합성 검사 (light weight — full JSON schema validate 는 별도 도구).
// 본 도구는 5종 dmn-check 외 부가 sanity 검사.

// 항상 의무 필드 (BR 종류 무관)
const REQUIRED_ALWAYS = [
	'br_id',
	'trigger',
	'condition',
	'action',
	'expected_result',
	'verification_location',
	'current_state',
];

// 옵셔널 (lifecycle hook BR / 비-API BR 등은 null 허용 — 의도된 부재)
const REQUIRED_IF_API = ['rejection_method', 'http_status', 'error_message'];

const VALID_CURRENT_STATE = new Set(['complete', 'partial', 'absent']);

export function checkJsonSanity(json, source) {
	const findings = [];

	for (const f of REQUIRED_ALWAYS) {
		if (json[f] === undefined || json[f] === null || json[f] === '') {
			findings.push({
				severity: 'breaking',
				kind: 'json.required-missing',
				field: f,
				message: `decision-table JSON missing required field "${f}"`,
			});
		}
	}

	// 옵셔널 필드 — undefined / 빈 문자열은 breaking, null 은 info (의도된 부재 — lifecycle / 비-API BR)
	for (const f of REQUIRED_IF_API) {
		const v = json[f];
		if (v === undefined || v === '') {
			findings.push({
				severity: 'breaking',
				kind: 'json.required-missing',
				field: f,
				message: `decision-table JSON missing required field "${f}" (use null for lifecycle/non-API BR)`,
			});
		} else if (v === null) {
			findings.push({
				severity: 'info',
				kind: 'json.field-null-intentional',
				field: f,
				message: `${f}: null — intentional absence (lifecycle hook or non-API BR)`,
			});
		}
	}

	if (json.current_state && !VALID_CURRENT_STATE.has(json.current_state)) {
		findings.push({
			severity: 'breaking',
			kind: 'json.invalid-enum',
			field: 'current_state',
			value: json.current_state,
			message: `current_state must be one of: ${Array.from(VALID_CURRENT_STATE).join(', ')}`,
		});
	}

	// http_status null 은 의도된 부재 (lifecycle BR) — invalid-http-status warning skip
	if (
		json.http_status !== undefined &&
		json.http_status !== null &&
		(typeof json.http_status !== 'number' ||
			json.http_status < 100 ||
			json.http_status > 599)
	) {
		findings.push({
			severity: 'non-breaking',
			kind: 'json.invalid-http-status',
			value: json.http_status,
			message: `http_status should be a valid HTTP code (100-599)`,
		});
	}

	if (!json.rendered_md_path) {
		findings.push({
			severity: 'non-breaking',
			kind: 'json.missing-md-link',
			message: `rendered_md_path missing — paired markdown not linked from JSON`,
		});
	}

	return findings;
}
