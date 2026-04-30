// formal-spec.schema.json의 decision_tables[] 정합성 검사 (light weight — full JSON schema validate 는 별도 도구).
// 본 도구는 5종 dmn-check 외 부가 sanity 검사.

const REQUIRED = [
  'br_id', 'trigger', 'condition', 'action', 'expected_result',
  'rejection_method', 'verification_location', 'http_status',
  'error_message', 'current_state',
];

const VALID_CURRENT_STATE = new Set(['complete', 'partial', 'absent']);

export function checkJsonSanity(json, source) {
  const findings = [];

  for (const f of REQUIRED) {
    if (json[f] === undefined || json[f] === null || json[f] === '') {
      findings.push({
        severity: 'breaking',
        kind: 'json.required-missing',
        field: f,
        message: `decision-table JSON missing required field "${f}"`,
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

  if (json.http_status !== undefined && (typeof json.http_status !== 'number' || json.http_status < 100 || json.http_status > 599)) {
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
