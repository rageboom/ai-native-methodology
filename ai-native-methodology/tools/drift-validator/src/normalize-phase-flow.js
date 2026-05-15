// Phase-flow normalizer — methodology-spec/workflow/phase-flow.{mermaid,json} 짝 비교용.
// JSON: { phases: [{id, name, depends_on, outputs, ...}] } → 정규형.
// Mermaid: flowchart TB + subgraph P{X}[...] + 외부 edge P{X} --> P{Y} → 정규형.
//
// 매핑 규칙 (subgraph id ↔ JSON phase id):
//   subgraph 라벨 "Phase N — ..." 에서 N 추출 (★ robust — P45 / P5_1 등 hardcoded 회피).
//   라벨 부재 시 fallback: subgraph id 의 P prefix 제거 + `_` → `-`.
//
// Sprint 5+ Phase B 신설 (★ ADR-008 이중 렌더링 정합).

const stripComment = (line) => line.replace(/%%.*$/, '');
const isBlank = (line) => !line.trim();
const stripDecor = (s) => String(s).replace(/[★⚠️✅❌⏳]/g, '').replace(/\s+/g, ' ').trim();

// ★ phase id 정규화 — 공백/대소문자 무시. "input" / "formal-spec" / "api" 등 의미 ID 그대로 보존 (state-machine normalizer 와 다름 — phase id 는 의미 있는 구분자).
// ★ v3.0.0 — 옛 숫자 ID ("0" / "4.5" / "5-1") 영역 본 정규식은 호환 보존 (mermaid 본문 갱신은 S3-b 영역).
const normalizePhaseId = (s) => stripDecor(String(s)).toLowerCase();

export function detectPhaseFlowJson(json) {
  return Array.isArray(json?.phases) && json.phases.length > 0
    && typeof json.phases[0]?.id !== 'undefined'
    && Array.isArray(json.phases[0]?.depends_on);
}

export function detectPhaseFlowMermaid(text) {
  const lines = text.split('\n').map(stripComment);
  let hasFlowchart = false;
  let phaseSubgraphCount = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^flowchart\b/i.test(line)) hasFlowchart = true;
    if (/^subgraph\s+P[\w_]*(\s|\[|$)/.test(line)) phaseSubgraphCount++;
  }
  return hasFlowchart && phaseSubgraphCount >= 2;  // 최소 2 phase subgraph 가 있어야 phase-flow 로 판정
}

export function normalizePhaseFlowJson(json) {
  const phases = new Set();
  const phaseMeta = new Map();  // id → { name }
  const dependencies = [];      // { from, to }

  for (const p of json.phases ?? []) {
    const id = normalizePhaseId(p.id);
    phases.add(id);
    phaseMeta.set(id, { name: stripDecor(p.name ?? '') });
    for (const dep of p.depends_on ?? []) {
      const fromId = normalizePhaseId(dep);
      dependencies.push({ from: fromId, to: id });
    }
  }

  return {
    type: 'phase-flow',
    phases: Array.from(phases).sort(),
    phase_meta: phaseMeta,
    dependencies: dependencies.sort(byEdge),
  };
}

export function normalizePhaseFlow(text) {
  const lines = text.split('\n').map(stripComment);
  const subgraphs = new Map();    // raw subgraph id (P0/P45/...) → derived phase id ("0"/"4.5"/...)
  const phases = new Set();
  const dependencies = [];        // { from, to } — derived phase id

  let depth = 0;
  // subgraph 내부에서는 외부 edge 추출하지 않음 (★ 외부 phase 간 edge 만 의존 그래프).
  // 단, subgraph 라인 자체는 depth 변경 직전에 처리.

  for (const raw of lines) {
    if (isBlank(raw)) continue;
    const line = raw.trim();

    // subgraph open
    const sub = line.match(/^subgraph\s+(P[\w_]*)\s*(?:\[(.*)\])?\s*$/);
    if (sub) {
      const subId = sub[1];
      const label = sub[2] ?? '';
      const phaseId = derivePhaseIdFromLabel(label) ?? derivePhaseIdFromSubId(subId);
      subgraphs.set(subId, phaseId);
      phases.add(phaseId);
      depth++;
      continue;
    }
    if (/^end\s*$/i.test(line)) {
      if (depth > 0) depth--;
      continue;
    }

    // subgraph 내부 line 무시 (direction / 자식 노드 / 자식 edge)
    if (depth > 0) continue;

    // 외부 edge — `Px --> Py` 또는 `Px -.-> Py` (점선 — cross-cutting). 점선은 의존 아님 → 무시.
    const edge = line.match(/^(P[\w_]+)\s*-->\s*(P[\w_]+)\s*$/);
    if (edge) {
      const fromSubId = edge[1];
      const toSubId = edge[2];
      const fromPhaseId = subgraphs.get(fromSubId);
      const toPhaseId = subgraphs.get(toSubId);
      // subgraph 미선언 ID 면 무시 (CC_FIND 같은 단일 노드 — phase 아님)
      if (fromPhaseId && toPhaseId) {
        dependencies.push({ from: fromPhaseId, to: toPhaseId });
      }
      continue;
    }

    // 점선 edge `-.->`/`-..->`/`==>`/`~~>` 등은 cross-cutting / 강조 — 의존 아님 → 무시.
  }

  return {
    type: 'phase-flow',
    phases: Array.from(phases).sort(),
    subgraph_to_phase: subgraphs,
    dependencies: dependencies.sort(byEdge),
  };
}

// "Phase X — ..." 라벨에서 X 추출. v3.0.0 — 의미 ID 지원 (input/discovery/db-schema/...).
// backward 호환 — 옛 숫자 ID ("4.5", "5-1") 도 매칭.
function derivePhaseIdFromLabel(label) {
  if (!label) return null;
  // 라벨에서 따옴표 / 백틱 제거.
  const cleaned = String(label).replace(/^["'`]+|["'`]+$/g, '');
  const m = cleaned.match(/Phase\s+([\w\-.]+)/i);
  if (m) return normalizePhaseId(m[1]);
  return null;
}

// fallback: P 또는 P_ prefix 제거 + `_` → `-`.
// 예: P_db_schema → "db-schema" (v3.0.0) / P5_1 → "5-1" (옛 호환) / P0 → "0" (옛 호환).
function derivePhaseIdFromSubId(subId) {
  return subId.replace(/^P_?/, '').replace(/_/g, '-');
}

function byEdge(a, b) {
  return (a.from + '|' + a.to).localeCompare(b.from + '|' + b.to);
}

export const __test__ = { normalizePhaseId, derivePhaseIdFromLabel, derivePhaseIdFromSubId };
