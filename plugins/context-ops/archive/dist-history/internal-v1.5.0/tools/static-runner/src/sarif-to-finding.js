// Sprint 5+ Phase D — SARIF → standardized finding 어댑터 (baseline.js fingerprint 호환).
// SARIF 2.1.0 spec: https://docs.oasis-open.org/sarif/sarif/v2.1.0/csprd02/sarif-v2.1.0-csprd02.html
//
// Semgrep / PMD / SpotBugs / CodeQL 등의 SARIF 출력을 단일 finding 형식으로 정규화.
// finding 형식 (tools/_shared/baseline.js fingerprint 호환): { kind, severity, file, line, message, plugin }.

import { readFileSync, existsSync } from 'node:fs';

// SARIF level → severity 매핑 (ADR-010 §2.3 정합).
const LEVEL_TO_SEVERITY = {
	error: 'breaking',
	warning: 'medium',
	note: 'low',
	none: 'info',
};

/**
 * 단일 SARIF result → standardized finding.
 * finding 의 kind 는 ruleId (결정성 보장 — fingerprint 안정).
 */
export function sarifResultToFinding(result, runIndex = 0, plugin = 'unknown') {
	const ruleId = result.ruleId ?? result.rule?.id ?? 'unknown-rule';
	const message = result.message?.text ?? '';
	const loc = (result.locations ?? [])[0]?.physicalLocation ?? {};
	const file = loc.artifactLocation?.uri ?? null;
	const line = loc.region?.startLine ?? null;
	const level = result.level ?? 'warning';
	return {
		kind: ruleId,
		severity: LEVEL_TO_SEVERITY[level] ?? 'medium',
		file,
		line,
		message: message.slice(0, 500), // fingerprint 안정 위해 message 길이 제한
		plugin,
		sarif_run_index: runIndex,
	};
}

/**
 * SARIF 파일 → findings 배열.
 */
export function readSarifFindings(sarifPath, plugin = 'unknown') {
	if (!sarifPath || !existsSync(sarifPath)) return [];
	const text = readFileSync(sarifPath, 'utf-8');
	let sarif;
	try {
		sarif = JSON.parse(text);
	} catch (e) {
		throw new Error(`SARIF parse error (${sarifPath}): ${e.message}`);
	}

	const findings = [];
	for (let i = 0; i < (sarif.runs ?? []).length; i++) {
		const run = sarif.runs[i];
		const driverName = run.tool?.driver?.name?.toLowerCase() ?? plugin;
		for (const result of run.results ?? []) {
			findings.push(sarifResultToFinding(result, i, driverName));
		}
	}
	return findings;
}
