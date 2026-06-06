// formal_spec_links 검증 — link 가 실제 파일을 가리키는지 + 가리키는 산출물의 br_id/aggregate_root 가 정합한지.
//  v1.4 Stage 3-2 — FE cross_links[] 형식 추가 인식 (--mode=fe).

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
				(category === 'decision_tables' && linkPath.endsWith('.md')) ||
				linkPath.endsWith('.json')
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

//  v1.4 Stage 3-2 — FE cross_links[] 형식 검증.
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
