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

// ★ v? — 산출물 파일명 추출 (이중 렌더링 정합 — outputs[] ↔ mermaid 노드 라벨 비교용).
// 산출물/입력 entry 문자열 또는 mermaid 라벨에서 deliverable 파일명만 골라냄.
// `*.json` 와일드카드 / 경로 prefix 는 char class(`/` 불포함)로 자연 분리.
const ARTIFACT_FILE_RE = /[\w.\-]+\.(?:json|jsonl|md|mermaid|yaml|yml)\b/gi;
// flow 정의 파일(`*.phase-flow.json|mermaid`)은 산출물 아님 — next_chain/이웃 chain 교차참조용. 제외.
const META_FILE_RE = /\.phase-flow\.(?:json|mermaid)$/i;
function extractArtifactFiles(str) {
  return (String(str).match(ARTIFACT_FILE_RE) ?? []).filter((f) => !META_FILE_RE.test(f));
}

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
  let phaseSubgraphCount = 0;     // analysis 패턴 — phase 단위 subgraph (P_* prefix)
  let phasePlainNodeCount = 0;    // chain v2 패턴 — phase plain node (P_*[label])
  for (const raw of lines) {
    const line = raw.trim();
    if (/^flowchart\b/i.test(line)) hasFlowchart = true;
    if (/^subgraph\s+P[\w_]*(\s|\[|$)/.test(line)) phaseSubgraphCount++;
    // chain v2 — subgraph 키워드 / edge 라인 제외 후 P_*[ 정의 패턴
    if (!line.startsWith('subgraph') && !/-->|-\.->|==>|~~>/.test(line) && /^P[\w_]+\s*\[/.test(line)) phasePlainNodeCount++;
  }
  return hasFlowchart && (phaseSubgraphCount >= 2 || phasePlainNodeCount >= 2);
}

export function normalizePhaseFlowJson(json) {
  const phases = new Set();
  const phaseMeta = new Map();  // id → { name }
  const dependencies = [];      // { from, to }
  const artifactFiles = new Set();  // inputs[] ∪ outputs[] 산출물 파일명 (SSOT 계약)

  for (const p of json.phases ?? []) {
    const id = normalizePhaseId(p.id);
    phases.add(id);
    phaseMeta.set(id, { name: stripDecor(p.name ?? '') });
    for (const dep of p.depends_on ?? []) {
      const fromId = normalizePhaseId(dep);
      dependencies.push({ from: fromId, to: id });
    }
    for (const entry of [...(p.inputs ?? []), ...(p.outputs ?? [])]) {
      for (const f of extractArtifactFiles(entry)) artifactFiles.add(f);
    }
  }

  return {
    type: 'phase-flow',
    phases: Array.from(phases).sort(),
    phase_meta: phaseMeta,
    dependencies: dependencies.sort(byEdge),
    artifact_files: artifactFiles,
  };
}

export function normalizePhaseFlow(text) {
  const lines = text.split('\n').map(stripComment);
  const subgraphs = new Map();    // node/subgraph raw id → derived phase id
  const phases = new Set();
  const dependencies = [];        // { from, to } — derived phase id
  // mermaid 노드 라벨에 등장하는 산출물 파일명 (사람 눈 렌더 — 주석 %% 제거 후 전수 스캔).
  const artifactFiles = new Set();
  for (const ln of lines) {
    for (const f of extractArtifactFiles(ln)) artifactFiles.add(f);
  }

  let depth = 0;
  const depthIsPhaseSubgraph = [];  // stack — true=P_* subgraph (analysis pattern, 자식 line 무시) / false=chain stage subgraph (chain v2 pattern, 자식 phase plain node 인식)

  for (const raw of lines) {
    if (isBlank(raw)) continue;
    const line = raw.trim();

    // subgraph open — P_* prefix (phase 단위 / analysis pattern)
    const phaseSub = line.match(/^subgraph\s+(P[\w_]*)\s*(?:\[(.*)\])?\s*$/);
    if (phaseSub) {
      const subId = phaseSub[1];
      const label = phaseSub[2] ?? '';
      const phaseId = derivePhaseIdFromLabel(label) ?? derivePhaseIdFromSubId(subId);
      subgraphs.set(subId, phaseId);
      phases.add(phaseId);
      depth++;
      depthIsPhaseSubgraph.push(true);
      continue;
    }
    // subgraph open — 다른 prefix (chain stage / external — chain v2 pattern)
    if (/^subgraph\s+/.test(line)) {
      depth++;
      depthIsPhaseSubgraph.push(false);
      continue;
    }
    if (/^end\s*$/i.test(line)) {
      if (depth > 0) {
        depth--;
        depthIsPhaseSubgraph.pop();
      }
      continue;
    }

    // phase 단위 subgraph 안 자식 line 무시 (산출물 / 검증 노드 — analysis pattern)
    if (depthIsPhaseSubgraph.length > 0 && depthIsPhaseSubgraph[depthIsPhaseSubgraph.length - 1]) {
      continue;
    }

    // P_* plain node 정의 = phase (chain v2 pattern — chain stage subgraph 안 또는 외부)
    if (!/-->|-\.->|==>|~~>/.test(line)) {
      const plainNode = line.match(/^(P[\w_]+)\s*\[(.*?)\]/);
      if (plainNode) {
        const nodeId = plainNode[1];
        const label = plainNode[2];
        if (!subgraphs.has(nodeId)) {
          const phaseId = derivePhaseIdFromLabel(label) ?? derivePhaseIdFromSubId(nodeId);
          subgraphs.set(nodeId, phaseId);
          phases.add(phaseId);
        }
        continue;
      }
    }

    // edge — `Px --> Py` (depth 무관 / 점선 -.-> 무시 / cross-cutting 강조 무시)
    const edge = line.match(/^(P[\w_]+)\s*-->\s*(P[\w_]+)\s*$/);
    if (edge) {
      const fromSubId = edge[1];
      const toSubId = edge[2];
      const fromPhaseId = subgraphs.get(fromSubId);
      const toPhaseId = subgraphs.get(toSubId);
      // 미등록 ID 면 무시 (CC_FIND / OUT_X / R1 같은 phase 아닌 노드)
      if (fromPhaseId && toPhaseId) {
        dependencies.push({ from: fromPhaseId, to: toPhaseId });
      }
      continue;
    }
  }

  return {
    type: 'phase-flow',
    phases: Array.from(phases).sort(),
    subgraph_to_phase: subgraphs,
    dependencies: dependencies.sort(byEdge),
    artifact_files: artifactFiles,
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
