import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateChainCoverage, validateCrossRefPaths, validateAntipatternCoverage, validateConfidenceCoverage, validateRisksForm, validateFailModeDistribution } from '../src/validator.js';

const validPlanning = { use_cases: [{ id: 'UC-USER-001' }] };
const validBehavior = {
  behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'] }],
  cross_links: { to_analysis_artifacts: ['rules.json'] }
};
const validAcceptance = {
  criteria: [{
    id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', use_case_ref: 'UC-USER-001',
    verifiable: true, automated_runnable: true, test_case_refs: ['TC-USER-001']
  }]
};

describe('chain-coverage-validator', () => {
  it('passes for full chain', () => {
    const r = validateChainCoverage(validPlanning, validBehavior, validAcceptance);
    assert.equal(r.summary.critical, 0);
    assert.equal(r.summary.high, 0);
    assert.equal(r.coverage.uc_to_bhv, 1.0);
    assert.equal(r.coverage.bhv_to_ac, 1.0);
  });

  it('detects BHV unknown UC', () => {
    const behavior = {
      behaviors: [{ id: 'BHV-X-001', use_case_refs: ['UC-UNKNOWN-001'] }],
      cross_links: { to_analysis_artifacts: ['rules.json'] }
    };
    const r = validateChainCoverage(validPlanning, behavior, validAcceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.bhv.unknown_uc' && f.severity === 'critical'));
  });

  it('detects UC without BHV', () => {
    const planning = { use_cases: [{ id: 'UC-USER-001' }, { id: 'UC-USER-002' }] };
    const r = validateChainCoverage(planning, validBehavior, validAcceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.uc.no_bhv' && f.uc_id === 'UC-USER-002'));
  });

  it('detects verifiable AC without test_case_refs', () => {
    const acceptance = {
      criteria: [{
        id: 'AC-USER-001', behavior_ref: 'BHV-USER-001', use_case_ref: 'UC-USER-001',
        verifiable: true, automated_runnable: true, test_case_refs: []
      }]
    };
    const r = validateChainCoverage(validPlanning, validBehavior, acceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.ac.verifiable_no_tc' && f.severity === 'high'));
  });

  it('detects empty cross_links', () => {
    const behavior = {
      behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'] }],
      cross_links: { to_analysis_artifacts: [] }
    };
    const r = validateChainCoverage(validPlanning, behavior, validAcceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.behavior.cross_links_empty'));
  });

  it('detects coverage below threshold', () => {
    const planning = { use_cases: [{ id: 'UC-A-001' }, { id: 'UC-B-001' }, { id: 'UC-C-001' }, { id: 'UC-D-001' }, { id: 'UC-E-001' }] };
    const r = validateChainCoverage(planning, validBehavior, validAcceptance);
    assert.ok(r.findings.some(f => f.kind === 'chain.uc_coverage.below_threshold'));
  });

  // ★ F-SIM-003 (2026-05-18) — cross-ref path resolve tests
  describe('F-SIM-003 validateCrossRefPaths', () => {
    function makeProject() {
      const dir = mkdtempSync(join(tmpdir(), 'fsim003-'));
      mkdirSync(join(dir, 'output', 'rules'), { recursive: true });
      writeFileSync(join(dir, 'output', 'rules', 'business-rules.json'), '{}');
      return dir;
    }

    it('warn-mode default: broken path → severity=medium / non-blocking kind', () => {
      const projectRoot = makeProject();
      try {
        const planning = { derivation_source: { source_artifacts: ['output/rules/business-rules.json', 'input/rules.json'] } };
        const r = validateCrossRefPaths({
          planning, behavior: null,
          projectRoot, repoRoot: projectRoot,
          opts: { strict: false }
        });
        assert.ok(r.findings.some(f => f.kind === 'chain.cross_links.broken_path_warning' && f.severity === 'medium'));
        assert.ok(!r.findings.some(f => f.kind === 'chain.cross_links.broken_path'));
        assert.equal(r.summary.broken_path_count, 1);
      } finally { rmSync(projectRoot, { recursive: true, force: true }); }
    });

    it('strict-mode: broken path → severity=high / blocking kind', () => {
      const projectRoot = makeProject();
      try {
        const planning = { derivation_source: { source_artifacts: ['input/rules.json'] } };
        const r = validateCrossRefPaths({
          planning, behavior: null,
          projectRoot, repoRoot: projectRoot,
          opts: { strict: true }
        });
        assert.ok(r.findings.some(f => f.kind === 'chain.cross_links.broken_path' && f.severity === 'high'));
      } finally { rmSync(projectRoot, { recursive: true, force: true }); }
    });

    it('detects repo-absolute path convention (examples/...) as low severity', () => {
      const projectRoot = makeProject();
      try {
        const behavior = { cross_links: { to_analysis_artifacts: ['examples/poc-X/output/rules/business-rules.json'] } };
        const r = validateCrossRefPaths({
          planning: null, behavior,
          projectRoot, repoRoot: projectRoot,
          opts: { strict: false }
        });
        assert.ok(r.findings.some(f => f.kind === 'chain.cross_links.path_convention_repo_absolute' && f.severity === 'low'));
      } finally { rmSync(projectRoot, { recursive: true, force: true }); }
    });

    it('valid project-relative existing path → 0 findings', () => {
      const projectRoot = makeProject();
      try {
        const planning = { derivation_source: { source_artifacts: ['output/rules/business-rules.json'] } };
        const r = validateCrossRefPaths({
          planning, behavior: null,
          projectRoot, repoRoot: projectRoot,
          opts: { strict: true }
        });
        assert.equal(r.findings.length, 0);
      } finally { rmSync(projectRoot, { recursive: true, force: true }); }
    });

    it('checks all 4 cross-ref sources (planning derivation/cross_links + behavior derivation/cross_links)', () => {
      const projectRoot = makeProject();
      try {
        const planning = {
          derivation_source: { source_artifacts: ['missing1.json'] },
          cross_links: { to_analysis_artifacts: ['missing2.json'] }
        };
        const behavior = {
          derivation_source: { analysis_artifacts: ['missing3.json'] },
          cross_links: { to_analysis_artifacts: ['missing4.json'] }
        };
        const r = validateCrossRefPaths({
          planning, behavior,
          projectRoot, repoRoot: projectRoot,
          opts: { strict: false }
        });
        assert.equal(r.summary.broken_path_count, 4);
        const sources = new Set(r.findings.filter(f => f.kind.includes('broken_path')).map(f => f.source));
        assert.equal(sources.size, 4);
      } finally { rmSync(projectRoot, { recursive: true, force: true }); }
    });
  });

  // ★ F-SIM-001 (2026-05-18) — antipattern coverage lane
  describe('F-SIM-001 validateAntipatternCoverage', () => {
    it('emits finding for critical AP not in AC.related_aps and not excluded', () => {
      const antipatterns = { antipatterns: [{ id: 'AP-USER-003', severity: 'critical', title: 'plaintext password' }] };
      const acceptanceCriteria = { criteria: [{ id: 'AC-USER-001', related_aps: [] }] };
      const planning = {};
      const r = validateAntipatternCoverage({ antipatterns, acceptanceCriteria, planning });
      assert.ok(r.findings.some(f => f.kind === 'chain.ap.uncovered_severe' && f.ap_id === 'AP-USER-003' && f.severity === 'critical'));
      assert.equal(r.summary.uncovered_severe_count, 1);
    });

    it('emits finding for high AP not covered', () => {
      const antipatterns = { antipatterns: [{ id: 'AP-AUTH-NEST-001', severity: 'high' }] };
      const acceptanceCriteria = { criteria: [] };
      const r = validateAntipatternCoverage({ antipatterns, acceptanceCriteria, planning: {} });
      assert.ok(r.findings.some(f => f.severity === 'high'));
    });

    it('passes when critical AP is referenced in AC.related_aps', () => {
      const antipatterns = { antipatterns: [{ id: 'AP-USER-003', severity: 'critical' }] };
      const acceptanceCriteria = { criteria: [{ id: 'AC-USER-001', related_aps: ['AP-USER-003'] }] };
      const r = validateAntipatternCoverage({ antipatterns, acceptanceCriteria, planning: {} });
      assert.equal(r.findings.length, 0);
    });

    it('passes when critical AP is explicitly excluded via planning.excluded_antipatterns', () => {
      const antipatterns = { antipatterns: [{ id: 'AP-USER-003', severity: 'critical' }] };
      const acceptanceCriteria = { criteria: [] };
      const planning = { excluded_antipatterns: [{ ap_id: 'AP-USER-003', reason: 'v2.x carry — bcrypt/argon2 scope OUT' }] };
      const r = validateAntipatternCoverage({ antipatterns, acceptanceCriteria, planning });
      assert.equal(r.findings.length, 0);
    });

    it('ignores low/medium severity APs', () => {
      const antipatterns = { antipatterns: [
        { id: 'AP-X-001', severity: 'low' },
        { id: 'AP-X-002', severity: 'medium' },
        { id: 'AP-X-003', severity: 'info' },
      ]};
      const r = validateAntipatternCoverage({ antipatterns, acceptanceCriteria: { criteria: [] }, planning: {} });
      assert.equal(r.findings.length, 0);
      assert.equal(r.summary.severe_ap_count, 0);
    });

    it('graceful when antipatterns input is missing', () => {
      const r = validateAntipatternCoverage({ antipatterns: null, acceptanceCriteria: { criteria: [] }, planning: {} });
      assert.equal(r.summary.ap_input_missing, true);
      assert.equal(r.findings.length, 0);
    });
  });

  // ★ v8.11.0 — Senior REVISE-1 (DEC-2026-05-23-analysis-validator-poc06-11-resolve §4)
  describe('v8.11.0 validateRisksForm — string form legacy carry warn lane', () => {
    it('all-string form → low finding emit (legacy carry warn)', () => {
      const planning = { risks_and_constraints: ['risk A', 'risk B', 'risk C'] };
      const r = validateRisksForm(planning);
      assert.equal(r.findings.length, 1);
      assert.equal(r.findings[0].kind, 'chain.planning.risks_string_form_warn');
      assert.equal(r.findings[0].severity, 'low');
      assert.equal(r.summary.string_count, 3);
      assert.equal(r.summary.object_count, 0);
      assert.equal(r.summary.total_count, 3);
      assert.deepEqual(r.findings[0].affected_indices, [0, 1, 2]);
    });

    it('all-object form → no finding (신규 paradigm 정합)', () => {
      const planning = {
        risks_and_constraints: [
          { id: 'R-001', severity: 'critical', description: 'risk A', type: 'security' },
          { id: 'R-002', severity: 'high', description: 'risk B', type: 'performance' }
        ]
      };
      const r = validateRisksForm(planning);
      assert.equal(r.findings.length, 0);
      assert.equal(r.summary.string_count, 0);
      assert.equal(r.summary.object_count, 2);
    });

    it('mixed string + object → low finding emit + 양측 count 정확', () => {
      const planning = {
        risks_and_constraints: [
          'legacy risk A',
          { id: 'R-001', severity: 'medium', description: 'new risk' },
          'legacy risk B'
        ]
      };
      const r = validateRisksForm(planning);
      assert.equal(r.findings.length, 1);
      assert.equal(r.findings[0].string_count, 2);
      assert.equal(r.findings[0].object_count, 1);
      assert.deepEqual(r.findings[0].affected_indices, [0, 2]);
    });

    it('empty / missing field → no finding (graceful)', () => {
      assert.equal(validateRisksForm({}).findings.length, 0);
      assert.equal(validateRisksForm({ risks_and_constraints: [] }).findings.length, 0);
      assert.equal(validateRisksForm(null).findings.length, 0);
      assert.equal(validateRisksForm(undefined).findings.length, 0);
    });
  });

  describe('v8.14.0 validateFailModeDistribution — F-SIM-005 P1 본격 흡수 (Adzic SBE 함정 회피)', () => {
    it('all compile_import_fail RED → corroboration_qualified=true / 0 finding (Beck-canonical 정합)', () => {
      const testSpec = {
        test_cases: [
          { id: 'TC-001', expected_outcome: 'fail', fail_mode: 'compile_import_fail' },
          { id: 'TC-002', expected_outcome: 'fail', fail_mode: 'compile_import_fail' }
        ]
      };
      const r = validateFailModeDistribution(testSpec);
      assert.equal(r.findings.length, 0);
      assert.equal(r.fail_mode_distribution.compile_import_fail, 2);
      assert.equal(r.fail_mode_distribution.dry_run_placeholder, 0);
      assert.equal(r.fail_mode_distribution.corroboration_qualified, true);
    });

    it('any dry_run_placeholder → corroboration_qualified=false + low finding emit (warn-only / Senior REVISE-3)', () => {
      const testSpec = {
        test_cases: [
          { id: 'TC-001', expected_outcome: 'fail', fail_mode: 'assertion_fail' },
          { id: 'TC-002', expected_outcome: 'fail', fail_mode: 'dry_run_placeholder' },
          { id: 'TC-003', expected_outcome: 'fail', fail_mode: 'dry_run_placeholder' }
        ]
      };
      const r = validateFailModeDistribution(testSpec);
      assert.equal(r.findings.length, 1);
      assert.equal(r.findings[0].kind, 'chain.test_spec.dry_run_placeholder_present');
      assert.equal(r.findings[0].severity, 'low'); // warn-only default
      assert.equal(r.findings[0].dry_run_count, 2);
      assert.equal(r.fail_mode_distribution.corroboration_qualified, false);
      assert.deepEqual(r.findings[0].affected_indices, [1, 2]);
    });

    it('mixed compile_import + assertion + pending + absent → fail_mode_absent warn / dry_run 0 → qualified=true', () => {
      const testSpec = {
        test_cases: [
          { id: 'TC-001', expected_outcome: 'fail', fail_mode: 'compile_import_fail' },
          { id: 'TC-002', expected_outcome: 'fail', fail_mode: 'assertion_fail' },
          { id: 'TC-003', expected_outcome: 'fail', fail_mode: 'pending' },
          { id: 'TC-004', expected_outcome: 'fail' } // absent legacy carry
        ]
      };
      const r = validateFailModeDistribution(testSpec);
      assert.equal(r.findings.length, 1); // absent_warn only
      assert.equal(r.findings[0].kind, 'chain.test_spec.fail_mode_absent_warn');
      assert.equal(r.fail_mode_distribution.absent, 1);
      assert.equal(r.fail_mode_distribution.pending, 1);
      assert.equal(r.fail_mode_distribution.corroboration_qualified, true); // dry_run = 0
    });

    it('GREEN only (expected_outcome=pass) + empty + null → 0 finding (graceful / chain 4 단계)', () => {
      const testSpec = {
        test_cases: [
          { id: 'TC-001', expected_outcome: 'pass', impl_module_ref: 'IMPL-001' }
        ]
      };
      const r = validateFailModeDistribution(testSpec);
      assert.equal(r.findings.length, 0);
      assert.equal(r.fail_mode_distribution.total_red, 0);
      assert.equal(r.fail_mode_distribution.corroboration_qualified, true);
      // empty / null graceful
      assert.equal(validateFailModeDistribution({}).findings.length, 0);
      assert.equal(validateFailModeDistribution({ test_cases: [] }).findings.length, 0);
      assert.equal(validateFailModeDistribution(null).findings.length, 0);
      assert.equal(validateFailModeDistribution(undefined).findings.length, 0);
    });
  });
});

// ★ dep-graph operation.md (수정·신설 파일 표: chain-coverage-validator "confidence 인지")
describe('validateConfidenceCoverage — hard/soft 인지', () => {
  function cn(id, subkind, state = 'active') {
    return { id, artifact_kind: 'chain', artifact_subkind: subkind, source_path: `${id}.md`, state };
  }
  function an(id) {
    return { id, artifact_kind: 'analysis', artifact_subkind: 'business-rules', source_path: 'br.json', state: 'active' };
  }
  const hard = (s, t, type = 'derived_from') => ({ source: s, target: t, edge_type: type, confidence: 'hard' });
  const soft = (s, t, type = 'cross_reference') => ({ source: s, target: t, edge_type: type, confidence: 'soft' });

  it('hard chain 으로 연결된 노드 → finding 없음', () => {
    const g = {
      nodes: [cn('UC-1', 'UC'), cn('BHV-1', 'BHV')],
      edges: [hard('UC-1', 'BHV-1')],
    };
    const r = validateConfidenceCoverage(g);
    assert.equal(r.findings.length, 0);
    assert.equal(r.confidence_coverage.hard_connected, 2);
    assert.equal(r.confidence_coverage.ratio, 1.0);
  });

  it('soft 엣지로만 연결된 chain 노드 → hard_disconnected high finding', () => {
    const g = {
      nodes: [cn('BHV-1', 'BHV'), an('analysis-business-rules')],
      edges: [soft('analysis-business-rules', 'BHV-1')],
    };
    const r = validateConfidenceCoverage(g);
    const f = r.findings.find(x => x.kind === 'chain.confidence.hard_disconnected');
    assert.ok(f);
    assert.equal(f.severity, 'high');
    assert.equal(f.node_id, 'BHV-1');
    assert.equal(r.confidence_coverage.soft_only, 1);
  });

  it('엣지 0 노드는 isolated 카운트만 (finding 은 graph-integrity 가 emit)', () => {
    const g = { nodes: [cn('BHV-LONELY', 'BHV')], edges: [] };
    const r = validateConfidenceCoverage(g);
    assert.equal(r.confidence_coverage.isolated, 1);
    assert.equal(r.findings.length, 0, 'orphan finding 은 본 validator 가 아닌 graph-integrity 책임');
  });

  it('analysis/aspect 노드는 검사 대상 아님 (chain 만)', () => {
    const g = { nodes: [an('analysis-business-rules')], edges: [] };
    const r = validateConfidenceCoverage(g);
    assert.equal(r.confidence_coverage.chain_nodes, 0);
    assert.equal(r.findings.length, 0);
  });

  it('propose/deprecated chain 노드 제외', () => {
    const g = {
      nodes: [cn('BHV-P', 'BHV', 'propose'), cn('BHV-D', 'BHV', 'deprecated')],
      edges: [],
    };
    const r = validateConfidenceCoverage(g);
    assert.equal(r.confidence_coverage.chain_nodes, 0);
  });

  it('drift 노드는 active 와 동일 검사', () => {
    const g = {
      nodes: [cn('BHV-1', 'BHV', 'drift'), an('analysis-business-rules')],
      edges: [soft('analysis-business-rules', 'BHV-1')],
    };
    const r = validateConfidenceCoverage(g);
    assert.equal(r.findings.length, 1, 'drift 도 hard_disconnected 검사 대상');
  });

  it('implements leaf (dangling target) 는 hard degree 에 포함 안 됨', () => {
    // IMPL → src/foo.kt (코드 leaf, nodes 부재) — dangling 이므로 hardDeg 미반영.
    // IMPL 이 TC 로부터 tests(hard) 받으면 connected.
    const g = {
      nodes: [cn('TC-1', 'TC'), cn('IMPL-1', 'IMPL')],
      edges: [hard('TC-1', 'IMPL-1', 'tests'), { source: 'IMPL-1', target: 'src/foo.kt', edge_type: 'implements', confidence: 'hard' }],
    };
    const r = validateConfidenceCoverage(g);
    assert.equal(r.findings.length, 0, 'IMPL 은 TC→IMPL tests 로 hard connected');
  });

  it('빈 그래프 → ratio 1.0', () => {
    const r = validateConfidenceCoverage({ nodes: [], edges: [] });
    assert.equal(r.confidence_coverage.ratio, 1.0);
  });

  it('null 입력 방어', () => {
    assert.doesNotThrow(() => validateConfidenceCoverage(null));
    assert.doesNotThrow(() => validateConfidenceCoverage({}));
  });
});
