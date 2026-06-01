// Phase-flow normalizer — flows/*.phase-flow.json 산출물 계약(inputs[]/outputs[]) 추출.
// ★ v12.0.0 (ADR-011) — json 단독. mermaid normalizer(detectPhaseFlowMermaid / normalizePhaseFlow /
//   derivePhaseId*) 전면 제거 (.mermaid 짝 폐기). extractArtifactFiles / META_FILE_RE /
//   NON_DELIVERABLE_META = check-handoff-consistency.js 가 재사용 (export 승격).
//
// JSON: { phases: [{id, name, depends_on, inputs, outputs, ...}] } → 정규형.

const stripDecor = (s) => String(s).replace(/[★⚠️✅❌⏳]/g, '').replace(/\s+/g, ' ').trim();

// ★ 산출물 파일명 추출 — entry 문자열에서 deliverable 파일명만 골라냄.
// `*.json` 와일드카드 / 경로 prefix 는 char class(`/` 불포함)로 자연 분리.
export const ARTIFACT_FILE_RE = /[\w.\-]+\.(?:json|jsonl|md|mermaid|yaml|yml)\b/gi;
// flow 정의 파일(`*.phase-flow.json|mermaid`)은 산출물 아님 — next_chain/이웃 chain 교차참조용. 제외.
export const META_FILE_RE = /\.phase-flow\.(?:json|mermaid)$/i;
// 횡단(cross-cutting) 메타 / SSOT 자기참조 / 결정·finding 로그 — phase data-contract 산출물 아님.
export const NON_DELIVERABLE_META = new Set([
  'phase-flow.json',                 // SSOT 자기참조
  'poc-findings.md', 'findings.md',  // finding-system 횡단
  'index.md', 'status.md',           // decisions 로그 횡단
]);
export function extractArtifactFiles(str) {
  return (String(str).match(ARTIFACT_FILE_RE) ?? []).filter(
    (f) => !META_FILE_RE.test(f) && !NON_DELIVERABLE_META.has(f.toLowerCase()),
  );
}

// ★ phase id 정규화 — 공백/대소문자 무시. 의미 ID 그대로 보존.
const normalizePhaseId = (s) => stripDecor(String(s)).toLowerCase();

export function detectPhaseFlowJson(json) {
  return Array.isArray(json?.phases) && json.phases.length > 0
    && typeof json.phases[0]?.id !== 'undefined'
    && Array.isArray(json.phases[0]?.depends_on);
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

function byEdge(a, b) {
  return (a.from + '|' + a.to).localeCompare(b.from + '|' + b.to);
}

export const __test__ = { normalizePhaseId };
