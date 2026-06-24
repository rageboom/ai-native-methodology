import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// DEC-2026-06-24 — fast-path CLI E2E. triage(신호) + fastpath-gate(종결) 의 실제 cli 배선·exit code 검증.
// ≥3 시나리오 (§8.1 과적합 회피 / Senior Q4): (a) typo trivial / (b) item_remove trivial / (c) 적대 negative BR 거부.
const CLI = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'cli.js');
let dir;

const GRAPH = {
	nodes: [
		{ id: 'code:PayButton.tsx', artifact_kind: 'chain', artifact_subkind: 'IMPL', source_path: 's', state: 'active', layer: 'fe' },
		{ id: 'code:i18n/ko.json', artifact_kind: 'chain', artifact_subkind: 'IMPL', source_path: 's', state: 'active', layer: 'fe' },
		{ id: 'br:DISCOUNT', artifact_kind: 'analysis', artifact_subkind: 'BR', source_path: 'rules.json', state: 'active', layer: 'domain', business_rule_id: 'BR-DISCOUNT-001' },
	],
};

function runJson(args) {
	const out = execFileSync('node', [CLI, ...args], { encoding: 'utf-8' });
	return JSON.parse(out);
}
function runExit(args) {
	try {
		execFileSync('node', [CLI, ...args], { encoding: 'utf-8', stdio: 'pipe' });
		return 0;
	} catch (e) {
		return e.status ?? -1;
	}
}

before(() => {
	dir = mkdtempSync(join(tmpdir(), 'fastpath-e2e-'));
	writeFileSync(join(dir, 'graph.json'), JSON.stringify(GRAPH));
});
after(() => rmSync(dir, { recursive: true, force: true }));

describe('fast-path E2E (cli triage + fastpath-gate / 3 시나리오)', () => {
	it('(a) typo trivial — 단일 IMPL 노드 → predicate true + 적격 record exit 0', () => {
		const sig = runJson(['triage', '--graph', join(dir, 'graph.json'), '--refs', 'code:PayButton.tsx', '--json']);
		assert.equal(sig.predicate_satisfied, true);
		const rec = {
			tier: 'trivial',
			triage_signals: sig,
			verification: { characterization_snapshot_refs: [], oracle_waiver: 'cosmetic typo / 동작 불변' },
			impact_closure_ref: 'impact.jsonl#L1',
			ticket_ref: 'MIS-999',
		};
		writeFileSync(join(dir, 'change-record.json'), JSON.stringify(rec));
		assert.equal(runExit(['fastpath-gate', '--record', join(dir, 'change-record.json')]), 0);
	});

	it('(b) item_remove trivial — i18n 키 제거(단일 IMPL) → snapshot 으로 종결 exit 0', () => {
		const sig = runJson(['triage', '--graph', join(dir, 'graph.json'), '--refs', 'code:i18n/ko.json', '--json']);
		assert.equal(sig.predicate_satisfied, true);
		const rec = {
			tier: 'trivial',
			triage_signals: sig,
			verification: { characterization_snapshot_refs: ['SNAP-I18N-KO-001'], oracle_waiver: null },
			impact_closure_ref: 'impact.jsonl#L2',
			ticket_ref: 'MIS-1000',
		};
		writeFileSync(join(dir, 'rec-b.json'), JSON.stringify(rec));
		// 파일명이 change-record 가 아니어도 gate 는 --record 경로로 직접 평가.
		assert.equal(runExit(['fastpath-gate', '--record', join(dir, 'rec-b.json')]), 0);
	});

	it('(c) 적대 negative — BR 노드 → predicate false (trivial 거부 / deny-list 가드)', () => {
		const sig = runJson(['triage', '--graph', join(dir, 'graph.json'), '--refs', 'br:DISCOUNT', '--json']);
		assert.equal(sig.touched_node_count, 1, '1 노드여도');
		assert.equal(sig.layer_span, 1, '단일 레이어여도');
		assert.equal(sig.predicate_satisfied, false, 'BR touch 는 trivial 절대 불가');
		// 만약 trivial 로 강제 작성해도 fastpath-gate 가 predicate_unsatisfied 로 차단(exit 1).
		const rec = {
			tier: 'trivial',
			triage_signals: sig,
			verification: { characterization_snapshot_refs: ['SNAP-X'], oracle_waiver: null },
			impact_closure_ref: 'x',
			ticket_ref: 'MIS-1',
		};
		writeFileSync(join(dir, 'rec-c.json'), JSON.stringify(rec));
		assert.equal(runExit(['fastpath-gate', '--record', join(dir, 'rec-c.json')]), 1, 'gate 가 이중 차단');
	});

	it('비-trivial(standard) record → gate N/A exit 0', () => {
		writeFileSync(join(dir, 'rec-std.json'), JSON.stringify({ tier: 'standard' }));
		assert.equal(runExit(['fastpath-gate', '--record', join(dir, 'rec-std.json')]), 0);
	});
});
