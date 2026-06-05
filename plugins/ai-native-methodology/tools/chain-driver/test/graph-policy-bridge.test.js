// graph-policy-bridge.test.js
// dep-graph P3 — hooks-bridge 의 graph artifact 감지 + evaluate_policy() 통합.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	detectGraphArtifactWrite,
	evaluatePolicyForEdges,
} from '../src/hooks-bridge.js';
import { loadPolicy, evaluatePolicy } from '../src/policy-evaluator.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const policy = loadPolicy(
	join(__dirname, '..', '..', '..', 'policies', 'propagation-policy.json'),
);

// ============================================================================
// detectGraphArtifactWrite — 파일명 → artifact 종류 매핑
// ============================================================================

describe('detectGraphArtifactWrite', () => {
	it('chain artifact (behavior-spec.json) → chain/BHV', () => {
		const r = detectGraphArtifactWrite({
			toolName: 'Write',
			toolInput: { file_path: '/proj/.aimd/output/behavior-spec.json' },
		});
		assert.equal(r.artifact_kind, 'chain');
		assert.equal(r.artifact_subkind, 'BHV');
		assert.equal(r.filename, 'behavior-spec.json');
	});

	it('chain artifacts 전체 매핑 (discovery/behavior/acceptance/test/impl)', () => {
		const map = {
			'discovery-spec.json': 'UC',
			'behavior-spec.json': 'BHV',
			'acceptance-criteria.json': 'AC',
			'test-spec.json': 'TC',
			'impl-spec.json': 'IMPL',
		};
		for (const [fname, subkind] of Object.entries(map)) {
			const r = detectGraphArtifactWrite({
				toolName: 'Edit',
				toolInput: { file_path: `/p/.aimd/output/${fname}` },
			});
			assert.equal(r.artifact_subkind, subkind, fname);
			assert.equal(r.artifact_kind, 'chain');
		}
	});

	it('analysis artifact (business-rules.json) → analysis/business-rules', () => {
		const r = detectGraphArtifactWrite({
			toolName: 'Write',
			toolInput: { file_path: '/p/.aimd/business-rules.json' },
		});
		assert.equal(r.artifact_kind, 'analysis');
		assert.equal(r.artifact_subkind, 'business-rules');
	});

	// v11.24.0 Slice 3 — db-schema 두 파일명 모두 매핑 (schema.json=canonical skill output / db-schema.json=poc-16 compat)
	it('db-schema: schema.json + db-schema.json 모두 → analysis/db-schema', () => {
		for (const fname of ['schema.json', 'db-schema.json']) {
			const r = detectGraphArtifactWrite({
				toolName: 'Write',
				toolInput: { file_path: `/p/.aimd/output/${fname}` },
			});
			assert.ok(r, `${fname} 매핑 존재`);
			assert.equal(r.artifact_kind, 'analysis', fname);
			assert.equal(r.artifact_subkind, 'db-schema', fname);
		}
	});

	it('aspect artifact (a11y-spec.json) → aspect/a11y', () => {
		const r = detectGraphArtifactWrite({
			toolName: 'Write',
			toolInput: { file_path: '/p/.aimd/a11y-spec.json' },
		});
		assert.equal(r.artifact_kind, 'aspect');
		assert.equal(r.artifact_subkind, 'a11y');
	});

	it('.aimd 밖 파일 → null', () => {
		assert.equal(
			detectGraphArtifactWrite({
				toolName: 'Write',
				toolInput: { file_path: '/p/src/behavior-spec.json' },
			}),
			null,
		);
	});

	it('graph artifact 아닌 파일명 → null', () => {
		assert.equal(
			detectGraphArtifactWrite({
				toolName: 'Write',
				toolInput: { file_path: '/p/.aimd/output/random.json' },
			}),
			null,
		);
	});

	it('Write/Edit/NotebookEdit 외 tool → null', () => {
		assert.equal(
			detectGraphArtifactWrite({
				toolName: 'Read',
				toolInput: { file_path: '/p/.aimd/output/behavior-spec.json' },
			}),
			null,
		);
		assert.equal(
			detectGraphArtifactWrite({ toolName: 'Bash', toolInput: {} }),
			null,
		);
	});

	it('Windows path 도 인식', () => {
		const r = detectGraphArtifactWrite({
			toolName: 'Write',
			toolInput: { file_path: 'C:\\proj\\.aimd\\output\\test-spec.json' },
		});
		assert.equal(r.artifact_subkind, 'TC');
	});
});

// ============================================================================
// evaluatePolicyForEdges — impact 결과 × 정책 → propose record
// ============================================================================

describe('evaluatePolicyForEdges (operation.md evaluate_policy() deliverable)', () => {
	const nodeById = new Map([
		['BHV-1', { id: 'BHV-1', artifact_subkind: 'BHV' }],
		['AC-1', { id: 'AC-1', artifact_subkind: 'AC' }],
		['TC-1', { id: 'TC-1', artifact_subkind: 'TC' }],
		['UC-1', { id: 'UC-1', artifact_subkind: 'UC' }],
	]);
	const originNode = nodeById.get('BHV-1');

	it('인접 단계 (BHV→AC) item_add → propose / matrix', () => {
		const affected = [{ id: 'AC-1', grade: 'MUST', direction: 'forward' }];
		const records = evaluatePolicyForEdges({
			affected,
			originNode,
			nodeById,
			policy,
			evaluatePolicy,
			changeKind: 'item_add',
		});
		assert.equal(records.length, 1);
		assert.equal(records[0].decision, 'propose');
		assert.equal(records[0].source, 'matrix');
		assert.equal(records[0].affected_id, 'AC-1');
		assert.equal(records[0].change_kind, 'item_add');
	});

	it('비인접 multi-hop (BHV→TC) → manual / fallback (conservative)', () => {
		const affected = [{ id: 'TC-1', grade: 'MUST', direction: 'forward' }];
		const records = evaluatePolicyForEdges({
			affected,
			originNode,
			nodeById,
			policy,
			evaluatePolicy,
			changeKind: 'item_add',
		});
		assert.equal(records[0].decision, 'manual');
		assert.equal(records[0].source, 'fallback');
	});

	it('semantic_change → 모든 인접도 manual', () => {
		const affected = [{ id: 'AC-1', grade: 'MUST', direction: 'forward' }];
		const records = evaluatePolicyForEdges({
			affected,
			originNode,
			nodeById,
			policy,
			evaluatePolicy,
			changeKind: 'semantic_change',
		});
		assert.equal(records[0].decision, 'manual');
		assert.equal(records[0].source, 'matrix');
	});

	it('빈 affected → 빈 records', () => {
		const records = evaluatePolicyForEdges({
			affected: [],
			originNode,
			nodeById,
			policy,
			evaluatePolicy,
			changeKind: 'typo',
		});
		assert.deepEqual(records, []);
	});

	it('record 에 grade/direction 보존', () => {
		const affected = [{ id: 'UC-1', grade: 'MUST', direction: 'backward' }];
		const records = evaluatePolicyForEdges({
			affected,
			originNode,
			nodeById,
			policy,
			evaluatePolicy,
			changeKind: 'typo',
		});
		assert.equal(records[0].grade, 'MUST');
		assert.equal(records[0].direction, 'backward');
	});
});
