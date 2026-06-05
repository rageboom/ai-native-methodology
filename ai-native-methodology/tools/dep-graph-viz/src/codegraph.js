// codegraph.js — codegraph.db(SQLite) 의 함수·메서드 심볼 + 호출(calls) 연결을 시각화에 보강 (표시 전용).
//   코드 leaf 노드(예: target/src/user.service.ts) 아래로 그 파일의 function/method 를 sub-노드로 달고,
//   심볼 간 calls 엣지(register→findByEmail 등)를 "연결 부위" 로 노출.
//   - 모두 synthetic:true / artifact_kind:'symbol' — SSOT(artifact-graph.json) 와 무관, gate inject ❌.
//   - calls/contains 는 impact-analyzer 의 8 edge_type 이 아님 → analyzeImpact 가 무시(결정론 axis 무오염). 순수 표시.

import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const SYMBOL_KINDS = ['function', 'method'];

// codegraph.db 읽기 — 코드 심볼 + 호출 엣지. (io / cli-side)
export function readCodegraph(dbPath) {
	const db = new DatabaseSync(resolve(dbPath), { readOnly: true });
	try {
		const ph = SYMBOL_KINDS.map(() => '?').join(',');
		const symbols = db
			.prepare(
				`SELECT id, kind, name, qualified_name, file_path, signature, start_line, is_exported
				 FROM nodes WHERE kind IN (${ph})`,
			)
			.all(...SYMBOL_KINDS);
		const calls = db
			.prepare(`SELECT source, target FROM edges WHERE kind = 'calls'`)
			.all();
		return { symbols, calls };
	} finally {
		db.close();
	}
}

// graph 의 code_pointers / code leaf 근처에서 codegraph.db 자동 탐색. 없으면 null.
export function findCodegraphDb(graphPath) {
	// graphPath = <poc>/.aimd/output/artifact-graph.json → pocRoot 추정 후 후보 검사.
	const outputDir = dirname(resolve(graphPath));
	const pocRoot = dirname(dirname(outputDir)); // .aimd/output → .aimd → pocRoot
	const candidates = [
		join(pocRoot, 'target', '.codegraph', 'codegraph.db'),
		join(pocRoot, '.codegraph', 'codegraph.db'),
		join(pocRoot, 'source', '.codegraph', 'codegraph.db'),
	];
	return candidates.find((p) => existsSync(p)) ?? null;
}

// 경로 suffix 매칭 — code leaf 'target/src/x.ts' ↔ codegraph file_path 'src/x.ts'.
function leafMatches(leafPath, cgPath) {
	if (!leafPath || !cgPath) return false;
	const a = leafPath.replace(/^\.\//, '');
	const b = cgPath.replace(/^\.\//, '');
	return a === b || a.endsWith('/' + b) || b.endsWith('/' + a);
}

/**
 * 보강 그래프에 codegraph 심볼/호출 부착 (표시 전용). 입력 graph 를 직접 변형(이미 우리 clone).
 * @param {Object} graph  augmentGraph 결과 (code leaf 포함)
 * @param {{symbols:Array, calls:Array}} cg  readCodegraph 결과
 * @returns {Object} 같은 graph (체이닝용) + graph.symbol_count
 */
export function attachSymbols(graph, cg) {
	const codeLeaves = (graph.nodes ?? []).filter((n) => n.artifact_kind === 'code');
	if (!codeLeaves.length || !cg?.symbols?.length) {
		graph.symbol_count = 0;
		return graph;
	}
	const cgIdToSym = new Map(); // codegraph node id → 합성 symbol 노드 id
	let count = 0;

	for (const s of cg.symbols) {
		const leaf = codeLeaves.find((l) => leafMatches(l.id, s.file_path));
		if (!leaf) continue; // dep-graph 에 없는 파일의 심볼 = skip
		const symId = `sym:${s.id}`;
		cgIdToSym.set(s.id, symId);
		graph.nodes.push({
			id: symId,
			artifact_kind: 'symbol',
			artifact_subkind: s.kind, // function | method
			title: s.name,
			signature: s.signature || null,
			source_path: `${leaf.id}:${s.start_line ?? '?'}`,
			state: 'active',
			synthetic: true,
			scope_id: leaf.scope_id,
		});
		graph.edges.push({
			source: leaf.id,
			target: symId,
			edge_type: 'contains', // 파일→심볼 (표시 전용 / analyzeImpact 무시)
			confidence: 'soft',
			synthetic: true,
		});
		count++;
	}

	for (const c of cg.calls) {
		const s = cgIdToSym.get(c.source);
		const t = cgIdToSym.get(c.target);
		if (!s || !t || s === t) continue;
		graph.edges.push({
			source: s,
			target: t,
			edge_type: 'calls', // 심볼→심볼 호출 (표시 전용 연결 부위)
			confidence: 'soft',
			synthetic: true,
		});
	}

	graph.symbol_count = count;
	return graph;
}
