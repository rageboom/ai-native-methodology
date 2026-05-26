// chain-coverage-validator core
// 검증:
//   1. planning UC-* → behavior BHV-* 1:N coverage
//   2. behavior BHV-* → acceptance AC-* 1:N coverage
//   3. acceptance verifiable=true ⇔ test_case_refs.length ≥ 1
//   4. behavior cross_links.to_analysis_artifacts 비어있지 않음
//   5. severity_floor (사용자 답변 D6 — 책임은 schema-validator 에서 강제 / 본 도구는 정보용 보고만)
//   ★ F-SIM-003 (2026-05-18): cross-ref 경로 resolve assert + 경로 컨벤션 단일화
//   - planning.derivation_source.source_artifacts + cross_links.to_analysis_artifacts 의 path 가 실제 존재하는지 검증
//   - behavior.derivation_source.analysis_artifacts + cross_links.to_analysis_artifacts 도 동일
//   - 경로 컨벤션: relative-to-project-root 권장 / repo-absolute (examples/...) = low-severity style warning
//   - strict=false (default, warn-mode) → broken-path = medium / strict=true → high
//   - release-readiness #14 baseline ratchet 와 페어 (v+1 default 전환)

import { readFileSync, existsSync } from 'node:fs';
import { resolve as pathResolve, isAbsolute, dirname } from 'node:path';

// ★ F-MB-VAL-001 (v9.0.4 / 2026-05-24): default projectRoot 자동 감지
// 산출물이 `.aimd/output/<file>.json` 패턴이면 PoC root = `dirname(p)/../..` 로 자동 감지.
// 5 PoC self-corroboration (poc-03/04-mini/05/14/06/07) 모두 PoC root 기준 cross-ref convention 일관 — 도구 default mismatch 해소.
// fallback (비-`.aimd/output/` 위치): dirname(p) 그대로 (backward-compat).
// LL-v903-04 자산화: validator default 와 산출물 convention mismatch silent sink — 5 PoC corroboration ≥ 2 fix.
export function autoDetectProjectRoot(specPath) {
  if (!specPath || typeof specPath !== 'string') return null;
  // ★ cross-platform: Windows backslash path 도 macOS/Linux 에서 처리 (DEC-2026-05-26-gate-renumber-coherence carry §macOS env-dependent test fix)
  // POSIX dirname() 은 \ 를 path separator 로 안 봐서 Windows path 입력 시 '.' 반환 → 사전 정규화 의무
  const d = dirname(specPath.replace(/\\/g, '/'));
  const normalized = d.replace(/\\/g, '/');
  // `.aimd/output` 끝나는 패턴 → PoC root = ../..
  if (/(^|\/)\.aimd\/output$/.test(normalized)) {
    return pathResolve(d, '..', '..');
  }
  // fallback (backward-compat): dirname 그대로
  return d;
}

export function validateChainCoverage(planning, behavior, acceptance, threshold = 0.85) {
  const findings = [];

  const planningUCs = new Set((planning?.use_cases ?? []).map(u => u.id));
  const behaviorBHVs = new Set();
  const bhvByUC = new Map(); // UC -> BHV[] forward
  for (const b of behavior?.behaviors ?? []) {
    behaviorBHVs.add(b.id);
    for (const ucRef of b.use_case_refs ?? []) {
      if (!bhvByUC.has(ucRef)) bhvByUC.set(ucRef, []);
      bhvByUC.get(ucRef).push(b.id);
      if (!planningUCs.has(ucRef)) {
        findings.push({
          kind: 'chain.bhv.unknown_uc',
          severity: 'critical',
          bhv_id: b.id, uc_ref: ucRef,
          message: `BHV ${b.id} references unknown UC ${ucRef}`
        });
      }
    }
  }

  // UC → BHV coverage
  let ucCoveredCount = 0;
  for (const ucId of planningUCs) {
    if (bhvByUC.has(ucId)) ucCoveredCount++;
    else findings.push({
      kind: 'chain.uc.no_bhv',
      severity: 'high',
      uc_id: ucId,
      message: `UC ${ucId} has no BHV (chain 1→2 link missing)`
    });
  }
  const ucCoverage = planningUCs.size === 0 ? 1.0 : ucCoveredCount / planningUCs.size;

  // BHV → AC coverage
  const acByBHV = new Map();
  const acAllIds = new Set();
  for (const ac of acceptance?.criteria ?? []) {
    acAllIds.add(ac.id);
    if (ac.behavior_ref) {
      if (!acByBHV.has(ac.behavior_ref)) acByBHV.set(ac.behavior_ref, []);
      acByBHV.get(ac.behavior_ref).push(ac.id);
      if (!behaviorBHVs.has(ac.behavior_ref)) {
        findings.push({
          kind: 'chain.ac.unknown_bhv',
          severity: 'critical',
          ac_id: ac.id, bhv_ref: ac.behavior_ref,
          message: `AC ${ac.id} references unknown BHV ${ac.behavior_ref}`
        });
      }
    }
    // verifiable
    if (ac.verifiable === true) {
      const tcRefs = ac.test_case_refs ?? [];
      if (tcRefs.length === 0) {
        findings.push({
          kind: 'chain.ac.verifiable_no_tc',
          severity: 'high',
          ac_id: ac.id,
          message: `AC ${ac.id} verifiable=true but no test_case_refs`
        });
      }
      if (ac.automated_runnable !== true) {
        findings.push({
          kind: 'chain.ac.verifiable_not_runnable',
          severity: 'medium',
          ac_id: ac.id,
          message: `AC ${ac.id} verifiable=true but automated_runnable=${ac.automated_runnable}`
        });
      }
    }
  }

  let bhvCoveredCount = 0;
  for (const bhvId of behaviorBHVs) {
    if (acByBHV.has(bhvId)) bhvCoveredCount++;
    else findings.push({
      kind: 'chain.bhv.no_ac',
      severity: 'high',
      bhv_id: bhvId,
      message: `BHV ${bhvId} has no AC (chain 2 link missing)`
    });
  }
  const bhvCoverage = behaviorBHVs.size === 0 ? 1.0 : bhvCoveredCount / behaviorBHVs.size;

  // 4. cross_links
  const xLinks = behavior?.cross_links?.to_analysis_artifacts ?? [];
  if (xLinks.length === 0) {
    findings.push({
      kind: 'chain.behavior.cross_links_empty',
      severity: 'medium',
      message: 'behavior-spec.cross_links.to_analysis_artifacts is empty (사용자 답변 3 정합 위배 — 7대 산출물 reference 의무)'
    });
  }

  // threshold
  if (ucCoverage < threshold) {
    findings.push({
      kind: 'chain.uc_coverage.below_threshold',
      severity: 'high',
      coverage: ucCoverage, threshold,
      message: `UC→BHV coverage ${ucCoverage.toFixed(2)} < ${threshold}`
    });
  }
  if (bhvCoverage < threshold) {
    findings.push({
      kind: 'chain.bhv_coverage.below_threshold',
      severity: 'high',
      coverage: bhvCoverage, threshold,
      message: `BHV→AC coverage ${bhvCoverage.toFixed(2)} < ${threshold}`
    });
  }

  return {
    findings,
    coverage: { uc_to_bhv: ucCoverage, bhv_to_ac: bhvCoverage },
    summary: {
      total_findings: findings.length,
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
    }
  };
}

// ★ F-SIM-003 (2026-05-18): cross-ref path resolve + 경로 컨벤션 검증
// Repo root + project root 모두 받아 path 해석. opts.strict=true 시 broken-path severity=high (blocking) / false=medium (warn-mode).
export function validateCrossRefPaths({ planning, behavior, projectRoot, repoRoot, opts = {} }) {
  const findings = [];
  const { strict = false } = opts;

  function resolveCrossRef(p) {
    if (!p || typeof p !== 'string') return { resolved: null, convention: 'invalid' };
    if (isAbsolute(p)) return { resolved: p, convention: 'absolute' };
    // repo-absolute convention (examples/...) — discouraged but valid
    if (p.startsWith('examples/') || p.startsWith('schemas/') || p.startsWith('methodology-spec/') || p.startsWith('flows/') || p.startsWith('docs/') || p.startsWith('tools/')) {
      return { resolved: pathResolve(repoRoot, p), convention: 'repo-absolute' };
    }
    // relative-to-project (preferred)
    return { resolved: pathResolve(projectRoot, p), convention: 'project-relative' };
  }

  function check(refList, sourceLabel, brokenSeverity) {
    if (!refList || !Array.isArray(refList)) return;
    for (const ref of refList) {
      const { resolved, convention } = resolveCrossRef(ref);
      if (!resolved) {
        findings.push({
          kind: 'chain.cross_links.invalid_path',
          severity: brokenSeverity,
          path: ref, source: sourceLabel,
          message: `${sourceLabel}: invalid path "${ref}"`
        });
        continue;
      }
      if (!existsSync(resolved)) {
        findings.push({
          kind: strict ? 'chain.cross_links.broken_path' : 'chain.cross_links.broken_path_warning',
          severity: brokenSeverity,
          path: ref, source: sourceLabel, resolved_path: resolved,
          message: `${sourceLabel}: cross-ref path does not exist — "${ref}" (resolved: ${resolved})`
        });
      }
      if (convention === 'repo-absolute') {
        findings.push({
          kind: 'chain.cross_links.path_convention_repo_absolute',
          severity: 'low',
          path: ref, source: sourceLabel,
          message: `${sourceLabel}: path uses repo-absolute convention "${ref}" — relative-to-project recommended (e.g., "output/rules/business-rules.json")`
        });
      }
    }
  }

  const brokenSeverity = strict ? 'high' : 'medium';

  // planning
  check(planning?.derivation_source?.source_artifacts, 'planning.derivation_source.source_artifacts', brokenSeverity);
  check(planning?.cross_links?.to_analysis_artifacts, 'planning.cross_links.to_analysis_artifacts', brokenSeverity);
  // behavior
  check(behavior?.derivation_source?.analysis_artifacts, 'behavior.derivation_source.analysis_artifacts', brokenSeverity);
  check(behavior?.cross_links?.to_analysis_artifacts, 'behavior.cross_links.to_analysis_artifacts', brokenSeverity);

  const brokenCount = findings.filter(f => f.kind === 'chain.cross_links.broken_path' || f.kind === 'chain.cross_links.broken_path_warning').length;
  const conventionCount = findings.filter(f => f.kind === 'chain.cross_links.path_convention_repo_absolute').length;

  return {
    findings,
    summary: {
      total_findings: findings.length,
      broken_path_count: brokenCount,
      path_convention_warning_count: conventionCount,
      strict_mode: strict,
    }
  };
}

// ★ F-SIM-001 (2026-05-18): AP→BR→AC coverage lane
// critical/high antipattern 이 AC.related_aps 로 도달하지 못하고 + planning.excluded_antipatterns 에도 명시 carry 가 없으면 finding.
// 권위: SonarQube Sonar Way "Security Hotspots Reviewed == 100%" (F-015 Claim E) + GitHub CodeQL Critical-threshold merge block + Snyk High+ PR block.
// 본 lane = critical AP 무선언 silent omission 차단 = industry-aligned (본 방법론 직전 단계는 industry default 보다 약했음).
export function validateAntipatternCoverage({ antipatterns, acceptanceCriteria, planning }) {
  const findings = [];
  if (!antipatterns || !antipatterns.antipatterns) {
    return {
      findings,
      summary: { total_findings: 0, uncovered_severe_count: 0, severe_ap_count: 0, ap_input_missing: true }
    };
  }

  const acs = acceptanceCriteria?.criteria ?? [];
  const referencedApIds = new Set();
  for (const ac of acs) {
    for (const id of ac.related_aps ?? []) referencedApIds.add(id);
  }
  const explicitlyExcluded = new Set(
    (planning?.excluded_antipatterns ?? []).map(e => e.ap_id)
  );

  const severeAps = antipatterns.antipatterns.filter(ap => ap.severity === 'critical' || ap.severity === 'high');
  for (const ap of severeAps) {
    const referenced = referencedApIds.has(ap.id);
    const excluded = explicitlyExcluded.has(ap.id);
    if (!referenced && !excluded) {
      findings.push({
        kind: 'chain.ap.uncovered_severe',
        severity: ap.severity, // critical / high 그대로 emit
        ap_id: ap.id, ap_severity: ap.severity, ap_title: ap.title ?? null,
        message: `${ap.severity} antipattern ${ap.id}${ap.title ? ` "${ap.title}"` : ''} has no AC.related_aps mapping nor planning.excluded_antipatterns carry — silent omission. AC 매핑 또는 명시 carry 의무.`
      });
    }
  }

  return {
    findings,
    summary: {
      total_findings: findings.length,
      uncovered_severe_count: findings.length,
      severe_ap_count: severeAps.length,
      ap_input_missing: false,
    }
  };
}

// ★ v8.11.0 — risks_and_constraints string form (legacy carry) warn lane.
// Senior REVISE-1 흡수 (DEC-2026-05-23-analysis-validator-poc06-11-resolve §4) — schemas/planning-spec.schema.json
// 안 risks_and_constraints items polymorphic anyOf[string, object] 도입 후 string 분기 = legacy carry 한정 의무.
// 신규 PoC = object form (id + severity required + description + type?) 권장 (severity 결정적 추출 + drift attractor 차단).
// 본 함수 = string form 검출 시 low finding emit (silent omission 회피 / chain-coverage gate #2 추가 lane).
export function validateRisksForm(planning) {
  const findings = [];
  const risks = Array.isArray(planning?.risks_and_constraints) ? planning.risks_and_constraints : [];
  let stringCount = 0;
  let objectCount = 0;
  const stringIndices = [];

  risks.forEach((item, idx) => {
    if (typeof item === 'string') {
      stringCount++;
      stringIndices.push(idx);
    } else if (item !== null && typeof item === 'object') {
      objectCount++;
    }
  });

  if (stringCount > 0) {
    findings.push({
      kind: 'chain.planning.risks_string_form_warn',
      severity: 'low',
      string_count: stringCount,
      object_count: objectCount,
      affected_indices: stringIndices,
      message: `risks_and_constraints 안 string form ${stringCount} item — legacy carry 한정 (v8.10.0+ object form 권장). object form = {id, severity (enum critical|high|medium|low), description, type?} / severity 결정적 추출 가능 + drift attractor 차단 본질. Senior REVISE-1 (DEC-2026-05-23-analysis-validator-poc06-11-resolve §4).`
    });
  }

  return {
    findings,
    summary: {
      total_findings: findings.length,
      string_count: stringCount,
      object_count: objectCount,
      total_count: risks.length
    }
  };
}

// ★ dep-graph operation.md (수정·신설 파일 표: "confidence 인지") — artifact-graph confidence-aware 검증.
// graph-integrity-validator 의 orphan(엣지 0)과 비중복: 본 검사는 "hard 엣지로 chain 에 연결돼야 할 노드가
// soft 엣지로만 연결된 경우(hard-disconnected)"를 잡는다. soft ref(analysis↔chain)는 있지만 hard chain
// (derived_from/tests/implements/depends_on) 에 미편입 = chain 정합 위반 (결정 1 confidence + 결정 4 정합).
const HARD_EDGE_TYPES = new Set(['derived_from', 'implements', 'tests', 'depends_on']);

export function validateConfidenceCoverage(graph) {
  const findings = [];
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];

  // active/drift chain 노드만 대상 (propose/deprecated 는 일시 상태 — 결정 1)
  const chainNodes = nodes.filter(
    n => n && n.artifact_kind === 'chain' && (n.state === 'active' || n.state === 'drift')
  );
  const nodeIds = new Set(nodes.map(n => n?.id).filter(Boolean));

  // 노드별 hard / soft 인접 카운트 (in + out)
  const hardDeg = new Map();
  const softDeg = new Map();
  for (const id of nodeIds) { hardDeg.set(id, 0); softDeg.set(id, 0); }
  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) continue; // dangling 제외 (implements leaf 등)
    const bucket = HARD_EDGE_TYPES.has(e.edge_type) ? hardDeg : softDeg;
    bucket.set(e.source, bucket.get(e.source) + 1);
    bucket.set(e.target, bucket.get(e.target) + 1);
  }

  let hardConnected = 0;
  let softOnly = 0;
  let isolated = 0;
  for (const node of chainNodes) {
    const h = hardDeg.get(node.id) ?? 0;
    const s = softDeg.get(node.id) ?? 0;
    if (h > 0) {
      hardConnected++;
    } else if (s > 0) {
      // soft 엣지만 있음 — chain 에 hard 로 미편입 (analysis ref 만 받는 고아 chain artifact)
      softOnly++;
      findings.push({
        kind: 'chain.confidence.hard_disconnected',
        severity: 'high',
        node_id: node.id,
        artifact_subkind: node.artifact_subkind,
        soft_degree: s,
        message: `chain 노드 ${node.id} (${node.artifact_subkind}) 가 hard 엣지 없이 soft 엣지(${s})로만 연결됨 — chain 정합 미편입 (cross_reference/informs 만 존재). hard derivation link 필요.`,
      });
    } else {
      // 엣지 0 — graph-integrity orphan 과 중복이지만 confidence 관점 카운트만 (finding 은 integrity 가 emit)
      isolated++;
    }
  }

  return {
    findings,
    confidence_coverage: {
      chain_nodes: chainNodes.length,
      hard_connected: hardConnected,
      soft_only: softOnly,
      isolated,
      ratio: chainNodes.length === 0 ? 1.0 : hardConnected / chainNodes.length,
    },
    summary: {
      total_findings: findings.length,
      high: findings.filter(f => f.severity === 'high').length,
    },
  };
}

// ★ v8.14.0 (F-SIM-005 P1 본격 흡수 / DEC-2026-05-23-fsim-005-corroboration-2-genuine).
// test_cases[].fail_mode 분포 + dry_run_placeholder boolean 강제 lane.
// Senior REVISE-3 흡수 (research-fsim-005-corroboration-2.md §1.1) — dry-run ratio 임계 = warn-only (v8.14.0) / 30% ratchet = v+1 (≥ 2 PoC 실측 후 결정 / §8.1 단일 PoC 함정 회피).
// 권위: Adzic SBE 10년 폐기 함정 (gojko.net/2020/03/17/sbe-10-years.html / F-015 VERIFIED 2026-05-23) 직접 회피.
// 본 lane = corroboration 자격 시 dry_run_placeholder 제외 boolean 만 강제 / 임계 ratio ❌.
// 7번째 export (utility loadJson 제외 시 6번째).
export function validateFailModeDistribution(testSpec, opts = {}) {
  const findings = [];
  const { strict = false } = opts;
  const tcs = Array.isArray(testSpec?.test_cases) ? testSpec.test_cases : [];

  let compileImport = 0;
  let assertion = 0;
  let dryRun = 0;
  let pending = 0;
  let absent = 0;
  let total = 0;
  const dryRunIndices = [];

  tcs.forEach((tc, idx) => {
    if (tc?.expected_outcome !== 'fail') return; // RED 단계 TC 만 대상 (GREEN 시 fail_mode 미사용)
    total++;
    const mode = tc?.fail_mode;
    if (mode === 'compile_import_fail') compileImport++;
    else if (mode === 'assertion_fail') assertion++;
    else if (mode === 'dry_run_placeholder') {
      dryRun++;
      dryRunIndices.push(idx);
    } else if (mode === 'pending') pending++;
    else absent++; // fail_mode 미선언 (legacy carry / v8.13.x 이하)
  });

  // ★ dry_run_placeholder = corroboration 자격 ❌ (boolean / 임계 ratio ❌)
  if (dryRun > 0) {
    findings.push({
      kind: 'chain.test_spec.dry_run_placeholder_present',
      severity: strict ? 'high' : 'low',
      dry_run_count: dryRun,
      total_red_count: total,
      affected_indices: dryRunIndices,
      message: `test_cases 안 dry_run_placeholder ${dryRun} item / 총 RED ${total} — corroboration 자격 ❌ (Adzic SBE 10년 폐기 함정 직접 회피). 진짜 RED (compile_import_fail / assertion_fail) 또는 pending (Cucumber yellow) 으로 재분류 의무. dry_run 임계 ratio = warn-only (v8.14.0) / 30% ratchet = v+1 (≥ 2 PoC 실측 후 결정 / §8.1 단일 PoC 함정 회피).`
    });
  }

  // ★ fail_mode 미선언 (legacy carry warn) — additive optional 이므로 silent OK 이나 표면화
  if (absent > 0) {
    findings.push({
      kind: 'chain.test_spec.fail_mode_absent_warn',
      severity: 'low',
      absent_count: absent,
      total_red_count: total,
      message: `test_cases 안 fail_mode 미선언 ${absent} item / 총 RED ${total} — legacy carry 한정 (v8.14.0+ 권장 = compile_import_fail / assertion_fail / dry_run_placeholder / pending 명시). expected_outcome='fail' TC 만 대상.`
    });
  }

  return {
    findings,
    fail_mode_distribution: {
      compile_import_fail: compileImport,
      assertion_fail: assertion,
      dry_run_placeholder: dryRun,
      pending,
      absent,
      total_red: total,
      dry_run_ratio: total === 0 ? 0 : dryRun / total,
      corroboration_qualified: dryRun === 0 // ★ boolean = corroboration 자격 (dry_run 0건 의무)
    },
    summary: {
      total_findings: findings.length,
      dry_run_count: dryRun,
      corroboration_qualified: dryRun === 0
    }
  };
}

export function loadJson(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf-8')); }
  catch (e) { throw new Error(`JSON parse error at ${path}: ${e.message}`); }
}
