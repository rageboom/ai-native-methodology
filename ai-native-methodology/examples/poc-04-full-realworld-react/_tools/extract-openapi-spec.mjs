/**
 * extract-openapi-spec.mjs — deliverable 3 api 산출
 *
 * 입력: INPUT/openapi.yaml (RealWorld Conduit API 1.0.0 / OpenAPI 3.0.1)
 * 출력: analysis/5-1-api/{openapi-summary.json, api-extension.json, api.md, _manifest.yml}
 *
 * 추출:
 * - paths × methods → operationId / tags / Auth / requestBody / responses
 * - components.schemas
 * - cross-link to ui-spec.pages.api_calls + form-validation-spec.validations
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENAPI_YAML = resolve(__dirname, '../INPUT/openapi.yaml');
const OUTPUT_DIR = resolve(__dirname, '../analysis/5-1-api');
const OUTPUT_SUMMARY = resolve(OUTPUT_DIR, 'openapi-summary.json');
const OUTPUT_EXTENSION = resolve(OUTPUT_DIR, 'api-extension.json');
const OUTPUT_API_MD = resolve(OUTPUT_DIR, 'api.md');
const OUTPUT_MANIFEST = resolve(OUTPUT_DIR, '_manifest.yml');

async function main() {
	await mkdir(OUTPUT_DIR, { recursive: true });

	const yamlText = await readFile(OPENAPI_YAML, 'utf-8');
	const oas = parseYaml(yamlText);

	const operations = [];
	for (const [pathStr, pathItem] of Object.entries(oas.paths ?? {})) {
		for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
			const op = pathItem[method];
			if (!op) continue;
			const auth =
				(op.security && op.security.length > 0) ||
				(oas.security && oas.security.length > 0);
			operations.push({
				operation_id: op.operationId,
				path: pathStr,
				method: method.toUpperCase(),
				tags: op.tags ?? [],
				summary: op.summary ?? null,
				description: op.description ?? null,
				auth_required: !!auth,
				request_body: op.requestBody
					? {
							required: op.requestBody.required ?? false,
							content_types: Object.keys(op.requestBody.content ?? {}),
							schema_ref:
								op.requestBody.content?.['application/json']?.schema?.$ref ??
								null,
						}
					: null,
				responses: Object.entries(op.responses ?? {}).map(([code, def]) => ({
					status: code,
					description: def.description ?? null,
					schema_ref: def.content?.['application/json']?.schema?.$ref ?? null,
				})),
				parameters: (op.parameters ?? []).map((p) => ({
					name: p.name,
					in: p.in,
					required: p.required ?? false,
					schema_type: p.schema?.type,
					description: p.description,
				})),
			});
		}
	}

	const schemas = oas.components?.schemas ?? {};
	const schemaNames = Object.keys(schemas);

	const summary = {
		$schema_origin: 'OpenAPI 3.0.1',
		meta: {
			poc_id: 'poc-04-full',
			stage: '5',
			sprint: '5-2',
			phase: '5-1-api',
			captured_at: new Date().toISOString().split('T')[0],
			captured_by: 'real',
			tool: 'yaml parser direct',
			source: 'INPUT/openapi.yaml',
		},
		api_meta: {
			title: oas.info?.title,
			version: oas.info?.version,
			openapi: oas.openapi,
			servers: oas.servers,
			tags: oas.tags?.map((t) => t.name) ?? [],
		},
		operations,
		schemas: schemaNames.map((name) => ({
			name,
			type: schemas[name].type ?? 'object',
			property_count: Object.keys(schemas[name].properties ?? {}).length,
			required: schemas[name].required ?? [],
			composition: schemas[name].allOf
				? 'allOf'
				: schemas[name].oneOf
					? 'oneOf'
					: null,
		})),
		summary: {
			total_operations: operations.length,
			operations_per_method: operations.reduce((acc, op) => {
				acc[op.method] = (acc[op.method] || 0) + 1;
				return acc;
			}, {}),
			operations_per_tag: operations.reduce((acc, op) => {
				for (const t of op.tags) acc[t] = (acc[t] || 0) + 1;
				return acc;
			}, {}),
			operations_auth_required: operations.filter((o) => o.auth_required)
				.length,
			schemas_count: schemaNames.length,
		},
	};

	await writeFile(OUTPUT_SUMMARY, JSON.stringify(summary, null, 2), 'utf-8');

	// api-extension.json (Phase 4.5 cross-link 패턴 / FE)
	const extension = {
		$schema_origin: 'ai-native-methodology/schemas/api-extension.schema.json',
		meta: summary.meta,
		operations: operations.map((op) => ({
			operation_id: op.operation_id,
			path: op.path,
			method: op.method,
			auth_required: op.auth_required,
			cross_link_targets: {
				rules: `[BR-FE-${op.operation_id}-*]`,
				form_validation_spec: op.request_body?.schema_ref
					? `[F-VAL-${op.request_body.schema_ref.split('/').pop()}-*]`
					: null,
				ui_spec_pages: `(Sprint 5-2 5-2-a 산출 시 추론 / api_calls cross-link)`,
			},
			formal_spec_links: {
				rules_json: `rules.json#${op.operation_id}`,
				form_validation_spec_json: `form-validation-spec.json#schema-${op.request_body?.schema_ref?.split('/').pop() ?? 'none'}`,
			},
		})),
		summary: {
			total_operations: operations.length,
			cross_link_coverage: 'Sprint 5-2 5-2-a 산출 후 정량 측정 가능',
		},
	};
	await writeFile(
		OUTPUT_EXTENSION,
		JSON.stringify(extension, null, 2),
		'utf-8',
	);

	// api.md
	const md = [
		'# api.md — RealWorld Conduit API 명세 (Stage 5 Sprint 5-2 본격)',
		'',
		`> 분석 대상: yurisldk/realworld-react-fsd § INPUT/openapi.yaml`,
		`> 일자: ${new Date().toISOString().split('T')[0]}`,
		`> 본 명세 = OpenAPI 3.0.1 ground truth + Phase 4.5 cross-link 패턴 (deliverable 14 form-validation-spec + rules.json BR cross-link)`,
		'',
		'---',
		'',
		`## 1. API meta`,
		'',
		`- **Title**: ${oas.info?.title}`,
		`- **Version**: ${oas.info?.version}`,
		`- **OpenAPI**: ${oas.openapi}`,
		`- **Servers**: ${oas.servers?.map((s) => s.url).join(', ')}`,
		`- **Tags**: ${oas.tags?.map((t) => t.name).join(' / ')}`,
		'',
		'---',
		'',
		`## 2. ${operations.length} endpoint 종합`,
		'',
		`| Method | Path | OperationId | Auth | Request Body | Response |`,
		`|---|---|---|---|---|---|`,
		...operations.map(
			(op) =>
				`| ${op.method} | \`${op.path}\` | ${op.operation_id} | ${op.auth_required ? '✅' : '❌'} | ${op.request_body?.schema_ref?.split('/').pop() ?? '—'} | ${op.responses[0]?.schema_ref?.split('/').pop() ?? '—'} |`,
		),
		'',
		'---',
		'',
		`## 3. ${schemaNames.length} components.schemas`,
		'',
		`| Schema | Type | Properties | Required | Composition |`,
		`|---|---|---|---|---|`,
		...summary.schemas.map(
			(s) =>
				`| ${s.name} | ${s.type} | ${s.property_count} | ${s.required.length} | ${s.composition ?? '—'} |`,
		),
		'',
		'---',
		'',
		`## 4. Stage 5 본격 분석 통계`,
		'',
		'```yaml',
		`total_operations: ${operations.length}`,
		`operations_per_method:`,
		...Object.entries(summary.summary.operations_per_method).map(
			([m, c]) => `  ${m}: ${c}`,
		),
		`operations_per_tag:`,
		...Object.entries(summary.summary.operations_per_tag).map(
			([t, c]) => `  ${t.replace(/ /g, '_')}: ${c}`,
		),
		`operations_auth_required: ${summary.summary.operations_auth_required}`,
		`schemas_count: ${schemaNames.length}`,
		'```',
		'',
		'---',
		'',
		`## 5. cross-link 명세 (Phase 4.5 패턴 — deliverable 14 + 5)`,
		'',
		`각 operation 의 cross-link 대상:`,
		`- **rules.json**: BR-FE-{operation_id}-*`,
		`- **form-validation-spec.json**: F-VAL-{schema_ref}-* (request body)`,
		`- **ui-spec.pages.api_calls**: PAGE-* § api_calls (Sprint 5-2-a 산출 시 자동 cross-link)`,
		'',
		`no-simulation 정합 — openapi.yaml 직접 read.`,
		'',
		'**End of api.md.**',
	];
	await writeFile(OUTPUT_API_MD, md.join('\n'), 'utf-8');

	// _manifest.yml
	const manifest = `phase: 5-1-api
poc_id: poc-04-full
stage: "5"
sprint: "5-2"
captured_at: ${new Date().toISOString().split('T')[0]}
captured_by: real
tool: yaml parser direct
source: INPUT/openapi.yaml
artifacts:
  - openapi-summary.json
  - api-extension.json
  - api.md
  - _manifest.yml
ir_layer_mapping:
  L3_Contract:
    - openapi-summary.json (ground truth)
    - api-extension.json (Phase 4.5 cross-link)
api_summary:
  total_operations: ${operations.length}
  schemas_count: ${schemaNames.length}
  operations_auth_required: ${summary.summary.operations_auth_required}
no_simulation_compliance:
  static_tool_simulated: false
  ai_persona_used: false
  evidence: "openapi.yaml YAML parser 직접 / 시뮬 0"
deliverable_3_compliance:
  full_endpoint_extraction: true
  cross_link_pattern: true
  schema_extraction: true
next_phase: 5-2-a-ui-base + 5-2-b-state
`;
	await writeFile(OUTPUT_MANIFEST, manifest, 'utf-8');

	console.log(
		`[openapi-extract] ✅ ${operations.length} operations / ${schemaNames.length} schemas`,
	);
	console.log(`[openapi-extract] ✅ Wrote ${OUTPUT_SUMMARY}`);
	console.log(`[openapi-extract] ✅ Wrote ${OUTPUT_EXTENSION}`);
	console.log(`[openapi-extract] ✅ Wrote ${OUTPUT_API_MD}`);
}

main().catch((err) => {
	console.error('[openapi-extract] ERROR:', err);
	process.exit(1);
});
