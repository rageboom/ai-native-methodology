// rollup.js — per-BC fragment → shared 누적기 직렬 post-merge rollup 오케스트레이션 핵심.
//   DEC-2026-06-12-parallel-bc-accumulator-rollup option ② (직렬 rollup 단계).
//
// diagnose-before-design: upsert primitive 는 이미 _shared/append-catalog.js 에 존재
//   (DEC-2026-06-12-resve-multidomain-corroboration §F-1 / resve 트랙). 본 도구는 그 위에
//   ① domains/<BC>/ 전체를 한 번에·멱등으로 굴리는 오케스트레이션 + ② 누락된 findings 누적기만 추가.
//   재발명 ❌ — upsertBcFile/upsertCautionGroup/upsertById/mergeUbiquitousLanguage 재사용.
//
// no-simulation: 결정론 upsert(키 일치=교체 / 아니면 append). sibling BC 보존. 멱등(재실행=동일 상태).
//   shared 누적기는 병렬 worktree 가 직접 수정 ❌ → 머지 후 직렬 1회(본 도구).

import {
	upsertBcFile,
	upsertCautionGroup,
	upsertById,
	mergeUbiquitousLanguage,
} from '../../_shared/append-catalog.js';

export const TOOL_VERSION = '0.1.0';

const SEVERITY_BUCKETS = ['critical', 'high', 'medium', 'low', 'info'];

// 깊은 복제 — dry-run 이 입력(현 shared)을 변형하지 않도록.
function clone(o) {
	return o == null ? o : JSON.parse(JSON.stringify(o));
}

// ── 1) business-rules leaf → index bc_files[] + total_rules ──────────
export function rollupBusinessRules(indexObj, brLeaf, { bcId, leafRelPath }) {
	const rules = Array.isArray(brLeaf?.business_rules) ? brLeaf.business_rules : [];
	const rule_ids = rules.map((r) => r && r.id).filter(Boolean);
	const entry = {
		bounded_context: bcId,
		file: leafRelPath,
		rule_count: rules.length,
		rule_ids,
	};
	const r = upsertBcFile(indexObj, entry);
	return { accumulator: 'business-rules-index', action: r.action, rule_count: rules.length, total_rules: r.total_rules };
}

// ── 2) per-BC caution_groups[] → shared caution_groups[] (upsert by title) ──
export function rollupCautions(mcObj, bcCautions) {
	const groups = Array.isArray(bcCautions?.caution_groups) ? bcCautions.caution_groups : [];
	const actions = [];
	for (const g of groups) {
		const r = upsertCautionGroup(mcObj, g);
		const cnt = Array.isArray(g.cautions) ? g.cautions.length : 0;
		actions.push({ title: g.title, action: r.action, cautions: cnt });
	}
	return { accumulator: 'migration-cautions', groups: actions, group_count: groups.length };
}

// ── 3) per-BC findings[] → shared findings[] (upsert by finding_id) + 버킷 재계산 ──
//   (append-catalog 미커버 4번째 누적기 — 본 도구 추가분 / generic upsertById 재사용)
export function rollupFindings(findingsObj, bcFindings) {
	findingsObj.findings ??= [];
	const incoming = Array.isArray(bcFindings?.findings) ? bcFindings.findings : [];
	const actions = { appended: 0, replaced: 0 };
	for (const f of incoming) {
		if (!f || !f.finding_id) continue; // id 없는 finding = skip(날조 ❌)
		const r = upsertById(findingsObj.findings, f, 'finding_id');
		actions[r.action === 'replaced' ? 'replaced' : 'appended']++;
	}
	// severity 버킷 + total 재계산 (Σ 일치 보장).
	const counts = Object.fromEntries(SEVERITY_BUCKETS.map((s) => [s, 0]));
	for (const f of findingsObj.findings) {
		if (f && SEVERITY_BUCKETS.includes(f.severity)) counts[f.severity]++;
	}
	for (const s of SEVERITY_BUCKETS) findingsObj[s] = counts[s];
	findingsObj.total = findingsObj.findings.length;
	return {
		accumulator: 'findings',
		appended: actions.appended,
		replaced: actions.replaced,
		total: findingsObj.total,
		by_severity: counts,
	};
}

const WRITE_OP_TYPES = ['insert', 'update', 'delete'];

// ── verdict_basis 숫자 도출 — sql-inventory summary.by_type 에서 결정론적 산출 ──
//   write_ops = insert+update+delete, read_ops = select. sql-inventory 부재 = null 반환(미산출).
//   verdict 값 자체는 스킬/사람 결정 — 본 헬퍼는 숫자 basis 만 (verdict-consistency-validator basis-mismatch(HARD) 통과용).
function deriveSqlOps(sqlInventory) {
	const byType = sqlInventory?.summary?.by_type;
	if (!byType || typeof byType !== 'object') return null;
	const num = (v) => (Number.isFinite(v) ? v : 0);
	const write_ops = WRITE_OP_TYPES.reduce((sum, t) => sum + num(byType[t]), 0);
	const read_ops = num(byType.select);
	return { write_ops, read_ops };
}

// bcEntry.aggregates[].root_entity_id → owned_aggregates (결정론·정렬·중복 제거).
function deriveOwnedAggregates(bcEntry) {
	const ags = Array.isArray(bcEntry?.aggregates) ? bcEntry.aggregates : [];
	const ids = ags.map((a) => a && a.root_entity_id).filter(Boolean);
	return [...new Set(ids)].sort();
}

// bcEntry 의 verdict_basis 숫자(write_ops/read_ops)+owned_aggregates 를 실측으로 채움/보정.
//   verdict 값은 불변(스킬/사람). decided_by 는 human-override 면 보존, 아니면 rule.
//   sql-inventory 부재 시 건드리지 않음(no-simulation).
function reconcileVerdictBasis(bcEntry, sqlInventory) {
	const ops = deriveSqlOps(sqlInventory);
	if (!ops) return null; // sql-inventory 부재 = 미산출(그대로 둠)
	const prior = bcEntry.verdict_basis && typeof bcEntry.verdict_basis === 'object' ? bcEntry.verdict_basis : {};
	const decided_by = prior.decided_by === 'human-override' ? 'human-override' : 'rule';
	const owned_aggregates = deriveOwnedAggregates(bcEntry);
	bcEntry.verdict_basis = {
		...prior,
		write_ops: ops.write_ops,
		read_ops: ops.read_ops,
		owned_aggregates,
		decided_by,
	};
	return { write_ops: ops.write_ops, read_ops: ops.read_ops, owned_aggregates: owned_aggregates.length, decided_by };
}

// ── 4) per-BC domain fragment → shared domain.json bounded_contexts[] (upsert by id) ──
export function rollupDomain(domainObj, bcDomain, { bcId, sqlInventory } = {}) {
	domainObj.bounded_contexts ??= [];
	// fragment 가 bounded_context entry 를 직접 제공하거나, {bounded_context:{...}} 래핑.
	//   clone — verdict_basis 보정이 입력 fragment 를 변형하지 않도록(dry-run/멱등 안전).
	const bcEntry = clone(bcDomain?.bounded_context || bcDomain?.bounded_contexts?.[0] || bcDomain);
	if (!bcEntry || !bcEntry.id || !bcEntry.name) {
		return { accumulator: 'domain', action: 'skipped', reason: 'fragment 에 {id,name} bounded_context 부재' };
	}
	if (bcEntry.id !== bcId) {
		// 정직: bc-dir 와 fragment id 불일치 경고(여전히 fragment id 로 upsert).
	}
	// upsert 직전 verdict_basis 숫자 보정 — sql-inventory 실측. verdict 값은 불변.
	const basis = reconcileVerdictBasis(bcEntry, sqlInventory);
	const r = upsertById(domainObj.bounded_contexts, bcEntry, 'id');
	const addedUl = mergeUbiquitousLanguage(domainObj, bcDomain?.ubiquitous_language_additions || []);
	return { accumulator: 'domain', action: r.action, ubiquitous_language_added: addedUl, verdict_basis: basis };
}

/**
 * 단일 BC 전체 rollup. fragments/accumulators = 파싱된 객체(null=부재). CLI 가 I/O 주입.
 * @returns {{ accumulators: object, report: object }} — 변형된 누적기 새 객체 + 리포트.
 */
export function rollupBc({ bcId, fragments, accumulators, leafRelPath, nowIso }) {
	const out = {
		index: clone(accumulators.index),
		cautions: clone(accumulators.cautions),
		findings: clone(accumulators.findings),
		domain: clone(accumulators.domain),
	};
	const report = { bc: bcId, generated_at: nowIso, tool_version: TOOL_VERSION, results: [], skipped: [] };

	if (fragments.businessRules) {
		out.index ??= { $schema_ref: 'schemas/business-rules-index.schema.json', bc_files: [], total_rules: 0 };
		report.results.push(
			rollupBusinessRules(out.index, fragments.businessRules, { bcId, leafRelPath }),
		);
	} else report.skipped.push({ accumulator: 'business-rules-index', reason: 'leaf 부재' });

	if (fragments.cautions) {
		out.cautions ??= {
			meta: fragments.cautions.meta || { generated_at: nowIso },
			system_context: fragments.cautions.system_context || {},
			caution_groups: [],
		};
		report.results.push(rollupCautions(out.cautions, fragments.cautions));
	} else report.skipped.push({ accumulator: 'migration-cautions', reason: 'fragment 부재' });

	if (fragments.findings) {
		out.findings ??= { findings: [], total: 0 };
		report.results.push(rollupFindings(out.findings, fragments.findings));
	} else report.skipped.push({ accumulator: 'findings', reason: 'fragment 부재' });

	if (fragments.domain) {
		if (out.domain == null) {
			report.skipped.push({
				accumulator: 'domain',
				reason: 'shared domain.json 부재 — domain 은 baseline 선재 의무(fresh 생성 ❌). 선행 analysis-domain-model 필요.',
			});
		} else {
			report.results.push(rollupDomain(out.domain, fragments.domain, { bcId, sqlInventory: fragments.sqlInventory }));
		}
	} else report.skipped.push({ accumulator: 'domain', reason: 'fragment 부재' });

	return { accumulators: out, report };
}
