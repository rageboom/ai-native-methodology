// diff-view.js
// operation.md 결정 6 (diff/blame/review) + 결정 8 (P4 알고리즘 Set diff).
//   별도 viewer 없이 traceability-matrix.md 의 3번째 렌더링 = diff view.
//   두 artifact-graph.json (before/after) 의 node·edge set diff 를 git diff 스타일로 재투영.
//
// 순수 함수 — I/O 없음. 입력 = 두 graph 객체. 출력 = diff 객체 + markdown.

// === node / edge 키 ===
function nodeKey(n) {
	return n.id;
}
function edgeKey(e) {
	return `${e.source}|${e.edge_type}|${e.target}`;
}

/**
 * 두 graph 의 node·edge set diff.
 * @param {Object} before  artifact-graph.json (이전)
 * @param {Object} after   artifact-graph.json (현재)
 * @returns {Object} { nodes: {added, removed, changed}, edges: {added, removed}, summary }
 */
export function diffGraphs(before, after) {
	const beforeNodes = new Map(
		(before?.nodes ?? []).map((n) => [nodeKey(n), n]),
	);
	const afterNodes = new Map((after?.nodes ?? []).map((n) => [nodeKey(n), n]));
	const beforeEdges = new Map(
		(before?.edges ?? []).map((e) => [edgeKey(e), e]),
	);
	const afterEdges = new Map((after?.edges ?? []).map((e) => [edgeKey(e), e]));

	// --- node diff ---
	const nodesAdded = [];
	const nodesChanged = [];
	for (const [id, node] of afterNodes) {
		const prev = beforeNodes.get(id);
		if (!prev) {
			nodesAdded.push(node);
		} else {
			const changes = nodeChanges(prev, node);
			if (changes.length > 0) nodesChanged.push({ id, changes });
		}
	}
	const nodesRemoved = [];
	for (const [id, node] of beforeNodes) {
		if (!afterNodes.has(id)) nodesRemoved.push(node);
	}

	// --- edge diff ---
	const edgesAdded = [];
	for (const [k, edge] of afterEdges) {
		if (!beforeEdges.has(k)) edgesAdded.push(edge);
	}
	const edgesRemoved = [];
	for (const [k, edge] of beforeEdges) {
		if (!afterEdges.has(k)) edgesRemoved.push(edge);
	}

	// 결정성 — id/key 정렬
	nodesAdded.sort((a, b) => a.id.localeCompare(b.id));
	nodesRemoved.sort((a, b) => a.id.localeCompare(b.id));
	nodesChanged.sort((a, b) => a.id.localeCompare(b.id));
	edgesAdded.sort((a, b) => edgeKey(a).localeCompare(edgeKey(b)));
	edgesRemoved.sort((a, b) => edgeKey(a).localeCompare(edgeKey(b)));

	return {
		nodes: { added: nodesAdded, removed: nodesRemoved, changed: nodesChanged },
		edges: { added: edgesAdded, removed: edgesRemoved },
		summary: {
			nodes_added: nodesAdded.length,
			nodes_removed: nodesRemoved.length,
			nodes_changed: nodesChanged.length,
			edges_added: edgesAdded.length,
			edges_removed: edgesRemoved.length,
		},
	};
}

// 노드 필드별 변경 추적 (state / commit_hash / code_pointers 수 / source_path)
function nodeChanges(prev, curr) {
	const changes = [];
	const tracked = [
		'state',
		'commit_hash',
		'source_path',
		'code_pointers_na',
		'drift_reason',
	];
	for (const field of tracked) {
		if (prev[field] !== curr[field]) {
			changes.push({
				field,
				from: prev[field] ?? null,
				to: curr[field] ?? null,
			});
		}
	}
	const prevCp = Array.isArray(prev.code_pointers)
		? prev.code_pointers.length
		: 0;
	const currCp = Array.isArray(curr.code_pointers)
		? curr.code_pointers.length
		: 0;
	if (prevCp !== currCp) {
		changes.push({ field: 'code_pointers_count', from: prevCp, to: currCp });
	}
	return changes;
}

/**
 * diff 객체 → markdown (traceability-matrix.md 3번째 렌더링).
 * @param {Object} diff  diffGraphs 결과
 * @param {Object} [meta]  { before_commit, after_commit }
 */
export function renderDiffMarkdown(diff, meta = {}) {
	const lines = [];
	lines.push('## Graph Diff View');
	lines.push('');
	if (meta.before_commit || meta.after_commit) {
		lines.push(
			`> ${meta.before_commit ?? '(before)'} → ${meta.after_commit ?? '(after)'}`,
		);
		lines.push('');
	}
	const s = diff.summary;
	lines.push(
		`**Δ nodes**: +${s.nodes_added} / -${s.nodes_removed} / ~${s.nodes_changed}  •  **Δ edges**: +${s.edges_added} / -${s.edges_removed}`,
	);
	lines.push('');

	if (
		s.nodes_added + s.nodes_removed + s.nodes_changed === 0 &&
		s.edges_added + s.edges_removed === 0
	) {
		lines.push('_그래프 변경 없음 (no drift)._');
		return lines.join('\n');
	}

	if (diff.nodes.added.length > 0) {
		lines.push('### + Nodes added');
		for (const n of diff.nodes.added) {
			lines.push(
				`- \`+\` **${n.id}** (${n.artifact_kind}/${n.artifact_subkind}) state=${n.state}`,
			);
		}
		lines.push('');
	}
	if (diff.nodes.removed.length > 0) {
		lines.push('### - Nodes removed');
		for (const n of diff.nodes.removed) {
			lines.push(
				`- \`-\` **${n.id}** (${n.artifact_kind}/${n.artifact_subkind})`,
			);
		}
		lines.push('');
	}
	if (diff.nodes.changed.length > 0) {
		lines.push('### ~ Nodes changed');
		for (const c of diff.nodes.changed) {
			const fields = c.changes
				.map((ch) => `${ch.field}: ${ch.from} → ${ch.to}`)
				.join(', ');
			lines.push(`- \`~\` **${c.id}** — ${fields}`);
		}
		lines.push('');
	}
	if (diff.edges.added.length > 0) {
		lines.push('### + Edges added');
		for (const e of diff.edges.added) {
			lines.push(
				`- \`+\` ${e.source} --${e.edge_type}/${e.confidence}--> ${e.target}`,
			);
		}
		lines.push('');
	}
	if (diff.edges.removed.length > 0) {
		lines.push('### - Edges removed');
		for (const e of diff.edges.removed) {
			lines.push(
				`- \`-\` ${e.source} --${e.edge_type}/${e.confidence}--> ${e.target}`,
			);
		}
		lines.push('');
	}
	return lines.join('\n').trimEnd();
}
