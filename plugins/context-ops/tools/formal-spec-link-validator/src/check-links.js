// formal_spec_links 검증 — link 가 실제 파일을 가리키는지 + 가리키는 산출물의 br_id/aggregate_root 가 정합한지.
// v1.4 Stage 3-2 — FE cross_links[] 형식 추가 인식 (--mode=fe).
// v2.0 sub-plan-3a — chain-mode 추가 (--chain-mode): planning ↔ behavior ↔ acceptance ↔ test ↔ impl link 검증.

import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';

/**
 * source: { type: 'api' | 'antipattern', file: string, item: object }
 * baseDir: source file 의 dirname (link resolve 기준)
 */
export function checkLinks({ source, baseDir }) {
	const findings = [];
	const links = source.item.formal_spec_links;
	if (!links) {
		return findings; // optional 필드 — 부재 자체는 OK
	}

	for (const category of [
		'decision_tables',
		'state_machines',
		'sequence_diagrams',
		'invariants',
	]) {
		const arr = links[category];
		if (!arr) continue;
		for (const linkPath of arr) {
			const resolved = resolve(baseDir, linkPath);
			try {
				statSync(resolved);
			} catch {
				findings.push({
					severity: 'breaking',
					kind: 'link.dead-reference',
					category,
					link: linkPath,
					source_file: source.file,
					source_id: source.item.operation_id ?? source.item.id,
					message: `formal_spec_links.${category}: "${linkPath}" not found (resolved: ${resolved})`,
				});
				continue;
			}

			// 추가 검증 — decision_tables 일 때 br_id 가 source 의 related_rules 또는 finding_refs 와 정합?
			if (
				category === 'decision_tables' &&
				(linkPath.endsWith('.md') || linkPath.endsWith('.json'))
			) {
				const expectedBrId = basename(
					linkPath,
					linkPath.endsWith('.json') ? '.json' : '.md',
				);
				const linkedRules =
					source.item.related_rules ?? source.item.finding_refs ?? [];
				// related_rules 가 비었으면 정합성 검증 skip (optional)
				// 비어있지 않은데 expectedBrId 가 자체 존재 안 하는 BR pattern 이면 finding
				if (
					linkedRules.length > 0 &&
					!expectedBrId.match(/^BR-[A-Z0-9_-]+-\d+$/)
				) {
					findings.push({
						severity: 'non-breaking',
						kind: 'link.br-id-pattern-mismatch',
						link: linkPath,
						expected_pattern: '^BR-[A-Z0-9_-]+-\\d+$',
						actual: expectedBrId,
					});
				}
			}
		}
	}

	return findings;
}

export function summarize(findings) {
	const out = { breaking: 0, 'non-breaking': 0, info: 0 };
	for (const d of findings) out[d.severity] = (out[d.severity] ?? 0) + 1;
	return out;
}

// v1.4 Stage 3-2 — FE cross_links[] 형식 검증.
// FE 산출물 (state-map.json / visual-manifest.json / a11y-spec.json / i18n-spec.json /
//   static-security-spec.json / legacy-spectrum.json / ui-spec.json) 의 cross_links[] 배열 형식:
//   [{ from_*: <id>, to_artifact: <enum>, to_id: <id>, link_type: <enum> }]
//
// 검증 항목 (현 단계 — 정합성):
//   - to_artifact 가 알려진 enum 인가 (link.fe-unknown-artifact)
//   - link_type 이 알려진 enum 인가 (link.fe-unknown-link-type)
//   - to_id 가 ID pattern 정합 인가 (link.fe-id-pattern-mismatch — non-breaking)
//
// link 파일 존재 검증은 BE 형식과 다름 — FE 는 `to_id` 가 다른 산출물 내부 ID 참조 (path ❌).
// 따라서 dead-reference 검증은 cross-artifact ID resolution 로 별도 (Stage 5+ carry).

const FE_TO_ARTIFACT_ENUM = new Set([
	'ui-spec',
	'state-map',
	'api',
	'rules',
	'domain',
	'antipatterns',
	'visual-manifest',
	'a11y-spec',
	'i18n-spec',
	'static-security-spec',
	'legacy-spectrum',
]);

const FE_LINK_TYPE_ENUM = new Set([
	// state-map cross_links
	'implements',
	'derives_from',
	'validates',
	'triggers',
	'depends_on',
	// visual-manifest cross_links
	'renders',
	'captures_state',
	'validates_visual',
	// a11y-spec / i18n-spec / static-security-spec cross_links
	'inline_in',
	'registers_as_antipattern',
	'shown_on',
	'displayed_in_state',
	'blocks_baseline',
	// legacy-spectrum cross_links
	'pages',
	'validates_5_truths',
	'ssr_safe',
	'registers',
]);

const FE_ID_PATTERNS = {
	'ui-spec': /^(PAGE|CMP|FLOW|SCN)-[A-Z0-9_-]+(-\d+)?$/,
	'state-map': /^FSM-FE-[A-Z0-9_-]+-\d+$/,
	api: null, // operationId — pattern 자유
	rules: /^BR-[A-Z0-9_-]+-\d+$/,
	domain: /^(UC|E|VO|AGG)-[A-Z0-9_-]+(-\d+)?$/,
	antipatterns: /^AP-[A-Z0-9_-]+-\d+$/,
	'visual-manifest': /^VIS-[A-Z0-9_-]+-\d+$/,
	'a11y-spec': null, // axe rule id — pattern 자유
	'i18n-spec': null, // translation key — pattern 자유
	'static-security-spec': /^F-FE-SEC-\d+$/,
	'legacy-spectrum': null, // tier id — pattern 자유
};

/**
 * FE cross_links[] 검증.
 * source: { type: 'fe-artifact', file: string, item: { cross_links: [...] } }
 */
export function checkFeCrossLinks({ source }) {
	const findings = [];
	const links = source.item.cross_links;
	if (!Array.isArray(links)) {
		return findings; // optional 필드
	}

	for (const link of links) {
		const linkRepr = JSON.stringify(link);

		if (!FE_TO_ARTIFACT_ENUM.has(link.to_artifact)) {
			findings.push({
				severity: 'breaking',
				kind: 'link.fe-unknown-artifact',
				link: linkRepr,
				source_file: source.file,
				message: `cross_links.to_artifact: "${link.to_artifact}" not in known FE artifact enum`,
			});
			continue;
		}

		if (link.link_type && !FE_LINK_TYPE_ENUM.has(link.link_type)) {
			findings.push({
				severity: 'non-breaking',
				kind: 'link.fe-unknown-link-type',
				link: linkRepr,
				source_file: source.file,
				message: `cross_links.link_type: "${link.link_type}" not in known FE link_type enum`,
			});
		}

		const idPattern = FE_ID_PATTERNS[link.to_artifact];
		if (idPattern && link.to_id && !idPattern.test(link.to_id)) {
			findings.push({
				severity: 'non-breaking',
				kind: 'link.fe-id-pattern-mismatch',
				link: linkRepr,
				source_file: source.file,
				expected_pattern: idPattern.source,
				actual: link.to_id,
				message: `cross_links.to_id "${link.to_id}" does not match pattern for ${link.to_artifact}`,
			});
		}
	}

	return findings;
}

// v2.0 sub-plan-3a — chain-mode 검증.
// chain 산출물 (discovery-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec /
//   traceability-matrix) 내부의 backward link path (derivation_source.*_path /
//   cross_links.to_analysis_artifacts[] / item-level *_ref) 가 실제 파일을 가리키는지 검증.
//
// 검증 항목:
//   - chain.dead-reference (breaking) — path 가 실재 파일/디렉토리 아님
//   - chain.backward-link.missing (breaking) — derivation_source 의 의무 path 부재 (schema 가
//     이미 required 강제하지만, runtime 추가 안전장치)
//   - chain.id-pattern-mismatch (non-breaking) — UC-* / BHV-* / AC-* / TC-* / IMPL-* pattern 위반
//
// chain 단계는 path/ID 만 검증 — semantic coverage (UC→BHV 1:N 등) 은 chain-coverage-validator 책임.

const CHAIN_ARTIFACT_BY_NAME = {
	'discovery-spec.json': 'discovery-spec',
	'behavior-spec.json': 'behavior-spec',
	'acceptance-criteria.json': 'acceptance-criteria',
	'test-spec.json': 'test-spec',
	'impl-spec.json': 'impl-spec',
	'traceability-matrix.json': 'traceability-matrix',
};

// derivation_source 내부의 path 필드 — chain 단계별 의무 backward link.
const CHAIN_DERIVATION_PATHS = {
	'discovery-spec': [], // discovery 는 chain 1차 — analysis 만 backward (cross_links 별도)
	'behavior-spec': ['discovery_spec_path'],
	'acceptance-criteria': ['behavior_spec_path', 'discovery_spec_path'],
	'test-spec': ['acceptance_criteria_path', 'behavior_spec_path'],
	'impl-spec': ['test_spec_path', 'behavior_spec_path'],
	'traceability-matrix': [], // matrix 는 derivation_source 가 별도 — items 단위로 검증
};

const ID_PATTERN = {
	UC: /^UC-[A-Z0-9_-]+-\d+$/,
	BHV: /^BHV-[A-Z0-9_-]+-\d+$/,
	AC: /^AC-[A-Z0-9_-]+-\d+$/,
	TC: /^TC-[A-Z0-9_-]+-\d+$/,
	IMPL: /^IMPL-[A-Z0-9_-]+-\d+$/,
};

function pushDeadIfMissing(
	findings,
	source,
	baseDir,
	p,
	kind,
	extra = {},
	severity = 'breaking',
) {
	if (!p) return;
	let resolvedPath;
	try {
		resolvedPath = resolve(baseDir, p);
		statSync(resolvedPath);
	} catch {
		findings.push({
			severity,
			kind,
			link: p,
			source_file: source.file,
			message: `${kind}: "${p}" not found (resolved: ${resolvedPath ?? p})`,
			...extra,
		});
	}
}

// F-T05 (INSPECTION-2026-05-31-test) — evidence stdout-path 보조 검증.
//   sentinel "(not generated)" / "(not run …)" = 의도적 placeholder (retrofit dry-run) → dead-link 아님.
const isRealEvidencePath = (p) =>
	typeof p === 'string' && p.length > 0 && !p.startsWith('(');

// evidence dump 존재 — baseDir(artifact dir) 와 project-root(.ai-context/ 관례 / project-root-relative) 양 base 허용.
//   (poc-05 evidence path = '.ai-context/output/evidence/…' = project-root-relative / test-spec.json 은 .ai-context/output/ 위치.)
function evidenceDumpExists(baseDir, p) {
	const candidates = [resolve(baseDir, p)];
	const idx = baseDir.replace(/\\/g, '/').indexOf('/.ai-context/');
	if (idx >= 0) candidates.push(resolve(baseDir.slice(0, idx), p));
	return candidates.some((c) => {
		try {
			statSync(c);
			return true;
		} catch {
			return false;
		}
	});
}

function pushIdMismatch(findings, source, prefix, id, where) {
	const pat = ID_PATTERN[prefix];
	if (!pat) return;
	if (!pat.test(id)) {
		findings.push({
			severity: 'non-breaking',
			kind: 'chain.id-pattern-mismatch',
			source_file: source.file,
			where,
			expected_pattern: pat.source,
			actual: id,
			message: `${where}: "${id}" does not match ${prefix}-* pattern`,
		});
	}
}

/**
 * chain 산출물 link 검증.
 * source: { type: 'chain', file: string, artifact: enum, json: object }
 * baseDir: source file 의 dirname
 */
export function checkChainLinks({ source, baseDir }) {
	const findings = [];
	const { artifact, json } = source;

	// 1) derivation_source path 검증 (chain backward link 의무)
	const requiredPaths = CHAIN_DERIVATION_PATHS[artifact] ?? [];
	const ds = json.derivation_source ?? {};
	for (const key of requiredPaths) {
		const p = ds[key];
		if (!p) {
			findings.push({
				severity: 'breaking',
				kind: 'chain.backward-link.missing',
				source_file: source.file,
				where: `derivation_source.${key}`,
				message: `${artifact}: derivation_source.${key} required but missing`,
			});
			continue;
		}
		pushDeadIfMissing(findings, source, baseDir, p, 'chain.dead-reference', {
			where: `derivation_source.${key}`,
		});
	}

	// analysis_artifacts (planning + behavior 양쪽)
	if (Array.isArray(ds.analysis_artifacts)) {
		for (const p of ds.analysis_artifacts) {
			pushDeadIfMissing(findings, source, baseDir, p, 'chain.dead-reference', {
				where: 'derivation_source.analysis_artifacts[]',
			});
		}
	}

	// 2) cross_links.to_analysis_artifacts (planning / behavior)
	const crossAna = json.cross_links?.to_analysis_artifacts;
	if (Array.isArray(crossAna)) {
		for (const p of crossAna) {
			pushDeadIfMissing(findings, source, baseDir, p, 'chain.dead-reference', {
				where: 'cross_links.to_analysis_artifacts[]',
			});
		}
	}

	// 3) item-level path/ref 검증 (artifact 별 분기)
	switch (artifact) {
		case 'discovery-spec':
			// discovery-spec.json 은 detectChainArtifact 가 반환하는 실 chain 1차 산출물. use_cases[].id UC 패턴 검증.
			// (구 'planning-spec' case = F-MB-010 rename 잔존 dead code 였음 — discovery-spec 으로 활성화 / C8)
			for (const uc of json.use_cases ?? []) {
				if (uc.id)
					pushIdMismatch(
						findings,
						source,
						'UC',
						uc.id,
						`use_cases[id=${uc.id}]`,
					);
			}
			break;
		case 'behavior-spec':
			for (const bhv of json.behaviors ?? []) {
				if (bhv.id)
					pushIdMismatch(
						findings,
						source,
						'BHV',
						bhv.id,
						`behaviors[id=${bhv.id}]`,
					);
				for (const uc of bhv.use_case_refs ?? []) {
					pushIdMismatch(
						findings,
						source,
						'UC',
						uc,
						`behaviors[${bhv.id}].use_case_refs[]`,
					);
				}
				for (const ac of bhv.acceptance_criteria_refs ?? []) {
					pushIdMismatch(
						findings,
						source,
						'AC',
						ac,
						`behaviors[${bhv.id}].acceptance_criteria_refs[]`,
					);
				}
				for (const k of [
					'state_transition_ref',
					'decision_table_ref',
					'sequence_ref',
				]) {
					if (bhv[k])
						pushDeadIfMissing(
							findings,
							source,
							baseDir,
							bhv[k],
							'chain.dead-reference',
							{ where: `behaviors[${bhv.id}].${k}` },
						);
				}
			}
			break;
		case 'acceptance-criteria':
			for (const ac of json.criteria ?? []) {
				if (ac.id)
					pushIdMismatch(
						findings,
						source,
						'AC',
						ac.id,
						`criteria[id=${ac.id}]`,
					);
				if (ac.behavior_ref)
					pushIdMismatch(
						findings,
						source,
						'BHV',
						ac.behavior_ref,
						`criteria[${ac.id}].behavior_ref`,
					);
				if (ac.use_case_ref)
					pushIdMismatch(
						findings,
						source,
						'UC',
						ac.use_case_ref,
						`criteria[${ac.id}].use_case_ref`,
					);
				for (const tc of ac.test_case_refs ?? []) {
					pushIdMismatch(
						findings,
						source,
						'TC',
						tc,
						`criteria[${ac.id}].test_case_refs[]`,
					);
				}
			}
			break;
		case 'test-spec':
			for (const tc of json.test_cases ?? []) {
				if (tc.id)
					pushIdMismatch(
						findings,
						source,
						'TC',
						tc.id,
						`test_cases[id=${tc.id}]`,
					);
				if (tc.ac_ref)
					pushIdMismatch(
						findings,
						source,
						'AC',
						tc.ac_ref,
						`test_cases[${tc.id}].ac_ref`,
					);
				if (tc.bhv_ref)
					pushIdMismatch(
						findings,
						source,
						'BHV',
						tc.bhv_ref,
						`test_cases[${tc.id}].bhv_ref`,
					);
				if (tc.impl_module_ref)
					pushIdMismatch(
						findings,
						source,
						'IMPL',
						tc.impl_module_ref,
						`test_cases[${tc.id}].impl_module_ref`,
					);
				if (tc.source_file)
					pushDeadIfMissing(
						findings,
						source,
						baseDir,
						tc.source_file,
						'chain.dead-reference',
						{ where: `test_cases[${tc.id}].source_file` },
					);
				// F-T05 (α canonical) — schema 정식 필드 = test_cases[].test_run_evidence (top-level test_invocation_evidence 는 schema 금지).
				//   sentinel skip + non-breaking (no-sim 1차 enforcement = lint-no-simulation·test-impl-pass-validator / 경로 base 관례 모호).
				const tcStdout = tc.test_run_evidence?.test_runner_stdout_path;
				if (
					isRealEvidencePath(tcStdout) &&
					!evidenceDumpExists(baseDir, tcStdout)
				) {
					findings.push({
						severity: 'non-breaking',
						kind: 'chain.dead-reference',
						link: tcStdout,
						source_file: source.file,
						where: `test_cases[${tc.id}].test_run_evidence.test_runner_stdout_path`,
						message: `evidence dump not found: ${tcStdout}`,
					});
				}
			}
			// legacy top-level test_invocation_evidence (schema 금지 / dormant — backward-compat 만 유지).
			if (json.test_invocation_evidence?.test_runner_stdout_path) {
				pushDeadIfMissing(
					findings,
					source,
					baseDir,
					json.test_invocation_evidence.test_runner_stdout_path,
					'chain.dead-reference',
					{ where: 'test_invocation_evidence.test_runner_stdout_path' },
				);
			}
			break;
		case 'impl-spec':
			for (const im of json.impl_modules ?? []) {
				if (im.id)
					pushIdMismatch(
						findings,
						source,
						'IMPL',
						im.id,
						`impl_modules[id=${im.id}]`,
					);
				for (const tc of im.tc_refs ?? []) {
					pushIdMismatch(
						findings,
						source,
						'TC',
						tc,
						`impl_modules[${im.id}].tc_refs[]`,
					);
				}
				for (const bhv of im.bhv_refs ?? []) {
					pushIdMismatch(
						findings,
						source,
						'BHV',
						bhv,
						`impl_modules[${im.id}].bhv_refs[]`,
					);
				}
				for (const sf of im.source_files ?? []) {
					pushDeadIfMissing(
						findings,
						source,
						baseDir,
						sf,
						'chain.dead-reference',
						{ where: `impl_modules[${im.id}].source_files[]` },
					);
				}
			}
			// F-T05 (α canonical) — impl-spec root test_pass_evidence (chain 5 GREEN evidence / schema 정식 root 필드).
			const implStdout = json.test_pass_evidence?.test_runner_stdout_path;
			if (
				isRealEvidencePath(implStdout) &&
				!evidenceDumpExists(baseDir, implStdout)
			) {
				findings.push({
					severity: 'non-breaking',
					kind: 'chain.dead-reference',
					link: implStdout,
					source_file: source.file,
					where: 'test_pass_evidence.test_runner_stdout_path',
					message: `evidence dump not found: ${implStdout}`,
				});
			}
			// legacy top-level test_invocation_evidence (dormant — backward-compat).
			if (json.test_invocation_evidence?.test_runner_stdout_path) {
				pushDeadIfMissing(
					findings,
					source,
					baseDir,
					json.test_invocation_evidence.test_runner_stdout_path,
					'chain.dead-reference',
					{ where: 'test_invocation_evidence.test_runner_stdout_path' },
				);
			}
			break;
		case 'traceability-matrix':
			// matrix 는 derived_from + items 의 4 chain ID 정합 검증.
			for (const row of json.rows ?? []) {
				for (const [field, prefix] of [
					['uc_id', 'UC'],
					['bhv_id', 'BHV'],
					['ac_id', 'AC'],
					['tc_id', 'TC'],
					['impl_id', 'IMPL'],
				]) {
					if (row[field])
						pushIdMismatch(
							findings,
							source,
							prefix,
							row[field],
							`rows[].${field}`,
						);
				}
			}
			break;
	}

	return findings;
}

export function detectChainArtifact(filename) {
	return CHAIN_ARTIFACT_BY_NAME[filename] ?? null;
}
