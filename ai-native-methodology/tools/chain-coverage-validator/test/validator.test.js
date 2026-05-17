import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateChainCoverage, validateCrossRefPaths, validateAntipatternCoverage } from '../src/validator.js';

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
});
