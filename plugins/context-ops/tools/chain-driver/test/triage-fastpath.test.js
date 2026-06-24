import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { computeTriageSignals } from '../src/triage.js';
import { evaluateFastPathRecord } from '../src/fastpath-gate.js';

// DEC-2026-06-24-complexity-tier-fastpath — triage(결정론 신호) + fastpath-gate(fail-closed) 검증.
const GRAPH = {
	nodes: [
		{ id: 'code:PayButton.tsx', artifact_kind: 'chain', artifact_subkind: 'IMPL', source_path: 's', state: 'active', layer: 'fe' },
		{ id: 'code:Cart.tsx', artifact_kind: 'chain', artifact_subkind: 'IMPL', source_path: 's', state: 'active', layer: 'be' },
		{ id: 'br:DISCOUNT', artifact_kind: 'analysis', artifact_subkind: 'BR', source_path: 'rules.json', state: 'active', layer: 'domain', business_rule_id: 'BR-DISCOUNT-001' },
		{ id: 'uc:CHECKOUT', artifact_kind: 'chain', artifact_subkind: 'UC', source_path: 'd', state: 'active', layer: 'discovery' },
		// layer 미표기 + business_rule_id 보유(subkind 비-BR 이지만 deny 되어야).
		{ id: 'node:hiddenBR', artifact_kind: 'analysis', artifact_subkind: 'CONSTRAINT', source_path: 'x', state: 'active', business_rule_id: 'BR-X' },
	],
};

describe('triage — 결정론 신호 (tier 판정 ❌ / raw count only)', () => {
	it('단일 IMPL 노드 = trivial 적격 술어 충족', () => {
		const s = computeTriageSignals(GRAPH, ['code:PayButton.tsx']);
		assert.equal(s.touched_node_count, 1);
		assert.equal(s.net_new, false);
		assert.equal(s.layer_span, 1);
		assert.deepEqual(s.touched_subkinds, ['IMPL']);
		assert.equal(s.predicate_satisfied, true);
	});

	it('BR 노드 = deny-list → 술어 false (count1·layer1 이어도) [적대 negative]', () => {
		const s = computeTriageSignals(GRAPH, ['br:DISCOUNT']);
		assert.equal(s.predicate_satisfied, false, 'BR touch 는 절대 trivial 불가');
	});

	it('UC 노드 = deny-list → 술어 false', () => {
		assert.equal(computeTriageSignals(GRAPH, ['uc:CHECKOUT']).predicate_satisfied, false);
	});

	it('business_rule_id 보유 노드(subkind 비-BR) = deny → 술어 false', () => {
		assert.equal(computeTriageSignals(GRAPH, ['node:hiddenBR']).predicate_satisfied, false);
	});

	it('다중 노드 + layer span 2 → 술어 false', () => {
		const s = computeTriageSignals(GRAPH, ['code:PayButton.tsx', 'code:Cart.tsx']);
		assert.equal(s.touched_node_count, 2);
		assert.equal(s.layer_span, 2);
		assert.equal(s.predicate_satisfied, false);
	});

	it('net-new(그래프 부재 ref) → net_new=true, 술어 false', () => {
		const s = computeTriageSignals(GRAPH, ['code:NewThing.tsx']);
		assert.equal(s.net_new, true);
		assert.equal(s.predicate_satisfied, false);
	});

	it('중복 ref dedupe — count 부풀지 않음', () => {
		const s = computeTriageSignals(GRAPH, ['code:PayButton.tsx', 'code:PayButton.tsx']);
		assert.equal(s.touched_node_count, 1);
		assert.equal(s.predicate_satisfied, true);
	});

	it('순수 — 입력 0/누락 방어', () => {
		const s = computeTriageSignals({}, []);
		assert.equal(s.touched_node_count, 0);
		assert.equal(s.layer_span, 0);
		assert.equal(s.predicate_satisfied, false);
	});
});

const okRecord = () => ({
	tier: 'trivial',
	triage_signals: { predicate_satisfied: true },
	verification: { characterization_snapshot_refs: [], oracle_waiver: 'cosmetic typo / 동작 불변' },
	impact_closure_ref: 'impact-log.jsonl#L42',
	ticket_ref: 'MIS-372',
});

describe('fastpath-gate — fail-closed 종결 검증 (⑥⑦ + 최소검증 + 술어)', () => {
	it('적격 record = ok / applicable', () => {
		const r = evaluateFastPathRecord(okRecord());
		assert.equal(r.applicable, true);
		assert.equal(r.ok, true);
		assert.equal(r.violations.length, 0);
	});

	it('snapshot ≥1 만으로도 최소검증 통과 (waiver 없이)', () => {
		const rec = okRecord();
		rec.verification = { characterization_snapshot_refs: ['SNAP-PAY-001'], oracle_waiver: null };
		assert.equal(evaluateFastPathRecord(rec).ok, true);
	});

	it('검증 부재(snapshot 0 + waiver null) → verification_missing', () => {
		const rec = okRecord();
		rec.verification = { characterization_snapshot_refs: [], oracle_waiver: null };
		const r = evaluateFastPathRecord(rec);
		assert.equal(r.ok, false);
		assert.ok(r.violations.some((v) => v.code === 'fastpath.verification_missing'));
	});

	it('impact_closure_ref null → impact_closure_missing', () => {
		const rec = okRecord();
		rec.impact_closure_ref = null;
		assert.ok(evaluateFastPathRecord(rec).violations.some((v) => v.code === 'fastpath.impact_closure_missing'));
	});

	it('ticket_ref 빈문자열 → ticket_missing', () => {
		const rec = okRecord();
		rec.ticket_ref = '  ';
		assert.ok(evaluateFastPathRecord(rec).violations.some((v) => v.code === 'fastpath.ticket_missing'));
	});

	it('술어 false 인데 tier=trivial → predicate_unsatisfied (오라우팅 가드)', () => {
		const rec = okRecord();
		rec.triage_signals = { predicate_satisfied: false };
		assert.ok(evaluateFastPathRecord(rec).violations.some((v) => v.code === 'fastpath.predicate_unsatisfied'));
	});

	it('tier=standard → 비적용(N/A) ok', () => {
		const r = evaluateFastPathRecord({ tier: 'standard' });
		assert.equal(r.applicable, false);
		assert.equal(r.ok, true);
	});

	it('결손 record 4종 위반 동시 검출', () => {
		const r = evaluateFastPathRecord({
			tier: 'trivial',
			triage_signals: { predicate_satisfied: false },
			verification: { characterization_snapshot_refs: [], oracle_waiver: null },
			impact_closure_ref: null,
			ticket_ref: null,
		});
		assert.equal(r.violations.length, 4);
	});
});
