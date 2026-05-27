// Phase-flow comparator — JSON normalized vs Mermaid normalized → drift list.
// Severity:
//   - breaking: phase 누락 / dependency 누락 (mermaid 측)
//   - non-breaking: mermaid 측 추가 (mermaid 가 더 자세 — 본 방법론 의도된 패턴)
//   - info: 부가 정보 차이

export function comparePhaseFlow({ jsonNorm, mermaidNorm, jsonPath, mermaidPath }) {
  const diffs = [];

  // 1. phases — JSON 측 phase 가 mermaid 에 등장해야 (★ breaking)
  const mermaidPhaseSet = new Set(mermaidNorm.phases);
  for (const pid of jsonNorm.phases) {
    if (!mermaidPhaseSet.has(pid)) {
      diffs.push({
        severity: 'breaking',
        kind: 'phase.missing-in-mermaid',
        json: pid,
        message: `JSON phase "${pid}" not found in mermaid (subgraph 라벨 또는 P{X} id 누락)`,
      });
    }
  }

  // 2. mermaid 측 추가 phase (★ non-breaking — 사람 눈 보강 패턴, 단 cross-cutting 같은 비-phase subgraph 는 derive 단계에서 걸러짐)
  const jsonPhaseSet = new Set(jsonNorm.phases);
  for (const pid of mermaidNorm.phases) {
    if (!jsonPhaseSet.has(pid)) {
      diffs.push({
        severity: 'non-breaking',
        kind: 'phase.extra-in-mermaid',
        mermaid: pid,
        message: `mermaid 측 phase "${pid}" 가 JSON 에 부재 — 사람 눈 보강 또는 phase id 미스매치 점검`,
      });
    }
  }

  // 3. dependencies — JSON 측 의존 edge 가 mermaid 에 부재면 breaking.
  const mermaidEdgeSet = new Set(mermaidNorm.dependencies.map((e) => e.from + '|' + e.to));
  for (const e of jsonNorm.dependencies) {
    // 양쪽 phase 모두 mermaid 에 있어야 의미 있는 edge 비교 (한쪽 phase 누락 시 1번에서 이미 catch).
    if (!jsonPhaseSet.has(e.from) || !jsonPhaseSet.has(e.to)) continue;
    if (!mermaidEdgeSet.has(e.from + '|' + e.to)) {
      diffs.push({
        severity: 'breaking',
        kind: 'dependency.missing-in-mermaid',
        json: { from: e.from, to: e.to },
        message: `JSON depends_on edge ${e.from} → ${e.to} 가 mermaid 에 부재`,
      });
    }
  }

  // 4. mermaid 측 추가 dependency (★ non-breaking — 사람 눈 보강 또는 implicit edge)
  const jsonEdgeSet = new Set(jsonNorm.dependencies.map((e) => e.from + '|' + e.to));
  for (const e of mermaidNorm.dependencies) {
    if (!jsonEdgeSet.has(e.from + '|' + e.to)) {
      diffs.push({
        severity: 'non-breaking',
        kind: 'dependency.extra-in-mermaid',
        mermaid: { from: e.from, to: e.to },
        message: `mermaid 측 edge ${e.from} → ${e.to} 가 JSON depends_on 에 부재`,
      });
    }
  }

  // 5. 산출물 파일명 정합 (★ 이중 렌더링 SSOT — JSON inputs/outputs 가 계약).
  //    mermaid 가 렌더한 산출물 파일명이 JSON 계약에 부재 → breaking (rename 누락 / 산출물명 drift).
  //    JSON 계약 파일명이 mermaid 미렌더 → info (중간 산출물 / config 는 사람 눈 생략 정상).
  const jsonFiles = jsonNorm.artifact_files ?? new Set();
  const mermaidFiles = mermaidNorm.artifact_files ?? new Set();
  for (const f of mermaidFiles) {
    if (!jsonFiles.has(f)) {
      diffs.push({
        severity: 'breaking',
        kind: 'artifact.mermaid-not-in-json',
        mermaid: f,
        message: `mermaid 산출물 파일명 "${f}" 가 JSON inputs/outputs 에 부재 — 산출물명 drift (rename 누락 의심)`,
      });
    }
  }
  for (const f of jsonFiles) {
    if (!mermaidFiles.has(f)) {
      diffs.push({
        severity: 'info',
        kind: 'artifact.json-not-in-mermaid',
        json: f,
        message: `JSON 산출물 파일명 "${f}" 가 mermaid 에 미렌더 (중간 산출물/config 정상 또는 보강 누락 점검)`,
      });
    }
  }

  return diffs;
}
