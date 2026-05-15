// topological-sort.js — depends_on 그래프 위상정렬 + 순환 검출 + lexicographic tiebreak.
// v3.0.0 신설 (plan-phase-id-semantic-rename.md / D-3 paradigm 정합).
// 본 모듈 책임 = manifest phase[].depends_on 그래프의 결정론적 순서 도출 + 무결성 검증.

/**
 * Kahn's algorithm with lexicographic tiebreak — 결정론적 위상정렬.
 *
 * @param {Array<{id: string, depends_on?: string[]}>} phases
 * @returns {{ order: string[], cycles: string[][], unknown_deps: Array<{phase:string, dep:string}> }}
 *   order: 위상정렬 결과 (cycle 검출 시 부분 순서)
 *   cycles: 순환 component 배열 (없으면 빈 배열)
 *   unknown_deps: depends_on이 가리키는 phase가 manifest에 부재한 경우
 */
export function topologicalSort(phases) {
  const idSet = new Set(phases.map((p) => p.id));
  const indegree = new Map();
  const adj = new Map();
  const unknown_deps = [];

  for (const phase of phases) {
    indegree.set(phase.id, 0);
    adj.set(phase.id, []);
  }
  for (const phase of phases) {
    for (const dep of phase.depends_on ?? []) {
      if (!idSet.has(dep)) {
        unknown_deps.push({ phase: phase.id, dep });
        continue;
      }
      adj.get(dep).push(phase.id);
      indegree.set(phase.id, indegree.get(phase.id) + 1);
    }
  }

  // Kahn's algorithm with lexicographic priority queue
  // (★ CAUTION-1 흡수 / api/ui 동일 레벨 결정론)
  const order = [];
  const ready = [...indegree.entries()].filter(([, d]) => d === 0).map(([id]) => id).sort();

  while (ready.length > 0) {
    const next = ready.shift();
    order.push(next);
    for (const child of adj.get(next).slice().sort()) {
      const newDeg = indegree.get(child) - 1;
      indegree.set(child, newDeg);
      if (newDeg === 0) {
        // insert into ready in lexicographic order
        let i = 0;
        while (i < ready.length && ready[i] < child) i++;
        ready.splice(i, 0, child);
      }
    }
  }

  // cycle detection — order length < phases length 시 순환
  const cycles = [];
  if (order.length < phases.length) {
    const visited = new Set(order);
    const remaining = phases.filter((p) => !visited.has(p.id)).map((p) => p.id);
    // 단일 SCC 검출은 본 범위 외 — 단순히 remaining 묶음 보고 (★ 실용 영역 / 본 plugin manifest는 11 phase 한정)
    cycles.push(remaining);
  }

  return { order, cycles, unknown_deps };
}

/**
 * 그래프 무결성 검증 결과를 drift-validator diff 형식으로 변환.
 *
 * @param {Array<{id:string, depends_on?:string[]}>} phases
 * @returns {Array<{severity, kind, ...}>} diffs
 */
export function checkDependencyGraph(phases) {
  const diffs = [];
  const { cycles, unknown_deps } = topologicalSort(phases);

  for (const ud of unknown_deps) {
    diffs.push({
      severity: 'breaking',
      kind: 'depends-on.unknown-phase',
      phase_id: ud.phase,
      dep: ud.dep,
      message: `phase '${ud.phase}' depends_on '${ud.dep}' but '${ud.dep}' is not declared in manifest.phases[]`,
    });
  }

  for (const cycle of cycles) {
    diffs.push({
      severity: 'breaking',
      kind: 'depends-on.cycle-detected',
      cycle,
      message: `dependency cycle detected among phases: ${cycle.join(', ')} (★ D-3 paradigm — DAG 의무)`,
    });
  }

  return diffs;
}
