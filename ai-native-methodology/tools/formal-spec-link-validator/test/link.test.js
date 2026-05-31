import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkLinks, checkFeCrossLinks, checkChainLinks, detectChainArtifact, summarize } from '../src/check-links.js';

function setupFixture() {
  const dir = mkdtempSync(join(tmpdir(), 'fsl-test-'));
  mkdirSync(join(dir, 'formal-spec', 'decision-tables'), { recursive: true });
  mkdirSync(join(dir, 'formal-spec', 'state-machines'), { recursive: true });
  writeFileSync(join(dir, 'formal-spec', 'decision-tables', 'BR-USER-LOGIN-001.md'), '# BR\n');
  writeFileSync(join(dir, 'formal-spec', 'decision-tables', 'BR-USER-LOGIN-001.json'), '{}\n');
  writeFileSync(join(dir, 'formal-spec', 'state-machines', 'User.json'), '{}\n');
  return dir;
}

test('checkLinks — 모든 link 존재 → 0 breaking', () => {
  const dir = setupFixture();
  try {
    const source = {
      file: join(dir, 'api-extension.json'),
      type: 'api',
      item: {
        operation_id: 'Login',
        formal_spec_links: {
          decision_tables: ['./formal-spec/decision-tables/BR-USER-LOGIN-001.md'],
          state_machines: ['./formal-spec/state-machines/User.json'],
        },
      },
    };
    const findings = checkLinks({ source, baseDir: dir });
    const s = summarize(findings);
    assert.equal(s.breaking, 0, `expected 0 breaking, got ${JSON.stringify(s)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('checkLinks — dead link → ≥1 breaking', () => {
  const dir = setupFixture();
  try {
    const source = {
      file: join(dir, 'api-extension.json'),
      type: 'api',
      item: {
        operation_id: 'X',
        formal_spec_links: {
          decision_tables: ['./formal-spec/decision-tables/BR-DOES-NOT-EXIST-001.md'],
        },
      },
    };
    const findings = checkLinks({ source, baseDir: dir });
    const s = summarize(findings);
    assert.ok(s.breaking >= 1, `expected ≥1 breaking, got ${JSON.stringify(s)}`);
    assert.equal(findings[0].kind, 'link.dead-reference');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('checkLinks — formal_spec_links 부재 → 0 finding (optional)', () => {
  const findings = checkLinks({
    source: { type: 'api', file: '/tmp/x.json', item: { operation_id: 'X' } },
    baseDir: '/tmp',
  });
  assert.equal(findings.length, 0);
});

test('checkLinks — 4 category 모두 검증', () => {
  const dir = setupFixture();
  try {
    const source = {
      file: join(dir, 'antipatterns.json'),
      type: 'antipattern',
      item: {
        id: 'AP-AUTH-001',
        formal_spec_links: {
          decision_tables: ['./formal-spec/decision-tables/BR-USER-LOGIN-001.json'],
          state_machines: ['./formal-spec/state-machines/User.json'],
          sequence_diagrams: ['./formal-spec/sequence-diagrams/UC-MISSING.json'],
          invariants: ['./formal-spec/invariants/User.ts'],
        },
      },
    };
    const findings = checkLinks({ source, baseDir: dir });
    const s = summarize(findings);
    // sequence_diagrams + invariants 둘 다 dead → 2 breaking
    assert.equal(s.breaking, 2, `expected 2 breaking (sequence + invariants), got ${JSON.stringify(s)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ★ v1.4 Stage 3-2 Phase E — FE cross_links[] 형식 검증

test('★ FE cross_links — 정합 link → 0 breaking (state-map → api / ui-spec / rules)', () => {
  const source = {
    type: 'fe-artifact',
    file: '/tmp/state-map.json',
    item: {
      cross_links: [
        { from_machine: 'FSM-FE-LOGIN-001', to_artifact: 'api',     to_id: 'postLogin',     link_type: 'triggers' },
        { from_machine: 'FSM-FE-LOGIN-001', to_artifact: 'ui-spec', to_id: 'PAGE-LOGIN-001', link_type: 'implements' },
        { from_machine: 'FSM-FE-LOGIN-001', to_artifact: 'rules',   to_id: 'BR-AUTH-001',    link_type: 'validates' },
      ],
    },
  };
  const findings = checkFeCrossLinks({ source });
  const s = summarize(findings);
  assert.equal(s.breaking, 0, `expected 0 breaking, got ${JSON.stringify(s)}`);
  assert.equal(s['non-breaking'], 0, `expected 0 non-breaking, got ${JSON.stringify(s)}`);
});

test('★ FE cross_links — unknown to_artifact → ≥1 breaking', () => {
  const source = {
    type: 'fe-artifact',
    file: '/tmp/state-map.json',
    item: {
      cross_links: [
        { from_machine: 'FSM-FE-X-001', to_artifact: 'unknown-artifact', to_id: 'X', link_type: 'implements' },
      ],
    },
  };
  const findings = checkFeCrossLinks({ source });
  const s = summarize(findings);
  assert.ok(s.breaking >= 1, `expected ≥1 breaking, got ${JSON.stringify(s)}`);
  assert.equal(findings[0].kind, 'link.fe-unknown-artifact');
});

test('★ FE cross_links — id pattern mismatch → non-breaking', () => {
  const source = {
    type: 'fe-artifact',
    file: '/tmp/state-map.json',
    item: {
      cross_links: [
        // FSM 으로 시작 안 하면 state-map id pattern 위반
        { from_machine: 'X', to_artifact: 'state-map', to_id: 'INVALID-ID', link_type: 'depends_on' },
      ],
    },
  };
  const findings = checkFeCrossLinks({ source });
  const s = summarize(findings);
  assert.ok(s['non-breaking'] >= 1, `expected ≥1 non-breaking, got ${JSON.stringify(s)}`);
  assert.equal(findings[0].kind, 'link.fe-id-pattern-mismatch');
});

test('★ FE cross_links — 부재 → 0 finding (optional)', () => {
  const findings = checkFeCrossLinks({
    source: { type: 'fe-artifact', file: '/tmp/x.json', item: {} },
  });
  assert.equal(findings.length, 0);
});

// ★ ★ v2.0 sub-plan-3a — chain-mode 검증 (planning ↔ behavior ↔ acceptance ↔ test ↔ impl)

function setupChainFixture() {
  const dir = mkdtempSync(join(tmpdir(), 'fsl-chain-'));
  // analysis 산출물 reference 대상
  writeFileSync(join(dir, 'rules.json'), '{}\n');
  writeFileSync(join(dir, 'discovery-spec.json'), '{}\n');
  writeFileSync(join(dir, 'behavior-spec.json'), '{}\n');
  writeFileSync(join(dir, 'acceptance-criteria.json'), '{}\n');
  writeFileSync(join(dir, 'test-spec.json'), '{}\n');
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'user.controller.ts'), '// stub\n');
  writeFileSync(join(dir, 'src', 'user.test.ts'), '// stub\n');
  return dir;
}

test('★ chain detectChainArtifact — 6 artifact 인식', () => {
  assert.equal(detectChainArtifact('discovery-spec.json'), 'discovery-spec');
  assert.equal(detectChainArtifact('behavior-spec.json'), 'behavior-spec');
  assert.equal(detectChainArtifact('acceptance-criteria.json'), 'acceptance-criteria');
  assert.equal(detectChainArtifact('test-spec.json'), 'test-spec');
  assert.equal(detectChainArtifact('impl-spec.json'), 'impl-spec');
  assert.equal(detectChainArtifact('traceability-matrix.json'), 'traceability-matrix');
  assert.equal(detectChainArtifact('foo.json'), null);
});

test('★ chain behavior-spec — derivation_source.discovery_spec_path 부재 → ≥1 breaking', () => {
  const dir = setupChainFixture();
  try {
    const json = {
      derivation_source: { analysis_artifacts: ['./rules.json'] },
      behaviors: [{ id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'], acceptance_criteria_refs: ['AC-USER-001'] }],
    };
    const findings = checkChainLinks({ source: { type: 'chain', file: join(dir, 'behavior-spec.json'), artifact: 'behavior-spec', json }, baseDir: dir });
    const s = summarize(findings);
    assert.ok(s.breaking >= 1, `expected ≥1 breaking (discovery_spec_path missing), got ${JSON.stringify(s)}`);
    assert.ok(findings.some(f => f.kind === 'chain.backward-link.missing'), `expected chain.backward-link.missing, got ${JSON.stringify(findings)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ chain behavior-spec — 정합 link → 0 breaking', () => {
  const dir = setupChainFixture();
  try {
    const json = {
      derivation_source: {
        discovery_spec_path: './discovery-spec.json',
        analysis_artifacts: ['./rules.json'],
      },
      behaviors: [
        { id: 'BHV-USER-001', use_case_refs: ['UC-USER-001'], acceptance_criteria_refs: ['AC-USER-001'] },
      ],
    };
    const findings = checkChainLinks({ source: { type: 'chain', file: join(dir, 'behavior-spec.json'), artifact: 'behavior-spec', json }, baseDir: dir });
    const s = summarize(findings);
    assert.equal(s.breaking, 0, `expected 0 breaking, got ${JSON.stringify(s)} ${JSON.stringify(findings)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ chain behavior-spec — id pattern mismatch → ≥1 non-breaking', () => {
  const dir = setupChainFixture();
  try {
    const json = {
      derivation_source: { discovery_spec_path: './discovery-spec.json', analysis_artifacts: ['./rules.json'] },
      behaviors: [
        { id: 'BHV-USER-001', use_case_refs: ['INVALID-FORMAT'], acceptance_criteria_refs: ['AC-USER-001'] },
      ],
    };
    const findings = checkChainLinks({ source: { type: 'chain', file: join(dir, 'behavior-spec.json'), artifact: 'behavior-spec', json }, baseDir: dir });
    const s = summarize(findings);
    assert.ok(s['non-breaking'] >= 1, `expected ≥1 non-breaking, got ${JSON.stringify(s)}`);
    assert.ok(findings.some(f => f.kind === 'chain.id-pattern-mismatch'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ chain test-spec — source_file dead-reference → ≥1 breaking', () => {
  const dir = setupChainFixture();
  try {
    const json = {
      derivation_source: {
        acceptance_criteria_path: './acceptance-criteria.json',
        behavior_spec_path: './behavior-spec.json',
      },
      test_cases: [
        { id: 'TC-USER-001', ac_ref: 'AC-USER-001', bhv_ref: 'BHV-USER-001', type: 'unit', framework: 'jest', source_file: './src/MISSING.test.ts', expected_outcome: 'pass' },
      ],
    };
    const findings = checkChainLinks({ source: { type: 'chain', file: join(dir, 'test-spec.json'), artifact: 'test-spec', json }, baseDir: dir });
    const s = summarize(findings);
    assert.ok(s.breaking >= 1, `expected ≥1 breaking (dead source_file), got ${JSON.stringify(s)}`);
    assert.ok(findings.some(f => f.kind === 'chain.dead-reference' && f.where.includes('source_file')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ chain impl-spec — source_files 정합 + tc_refs UC-pattern mismatch → 0 breaking + ≥1 non-breaking', () => {
  const dir = setupChainFixture();
  try {
    const json = {
      derivation_source: {
        test_spec_path: './test-spec.json',
        behavior_spec_path: './behavior-spec.json',
      },
      impl_modules: [
        { id: 'IMPL-USER-001', tc_refs: ['UC-WRONG-001'], bhv_refs: ['BHV-USER-001'], framework: 'nestjs', source_files: ['./src/user.controller.ts'], commit_hash: 'abc123' },
      ],
    };
    const findings = checkChainLinks({ source: { type: 'chain', file: join(dir, 'impl-spec.json'), artifact: 'impl-spec', json }, baseDir: dir });
    const s = summarize(findings);
    assert.equal(s.breaking, 0, `expected 0 breaking (source_files exist), got ${JSON.stringify(s)} ${JSON.stringify(findings)}`);
    assert.ok(s['non-breaking'] >= 1, `expected ≥1 non-breaking (tc_refs UC-* not TC-*), got ${JSON.stringify(s)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ chain traceability-matrix — rows ID pattern 검증', () => {
  const json = {
    rows: [
      { uc_id: 'UC-USER-001', bhv_id: 'BHV-USER-001', ac_id: 'AC-USER-001', tc_id: 'TC-USER-001', impl_id: 'IMPL-USER-001' },
      { uc_id: 'INVALID', bhv_id: 'BHV-USER-001' },  // 1 mismatch
    ],
  };
  const findings = checkChainLinks({ source: { type: 'chain', file: '/tmp/traceability-matrix.json', artifact: 'traceability-matrix', json }, baseDir: '/tmp' });
  const s = summarize(findings);
  assert.equal(s.breaking, 0);
  assert.ok(s['non-breaking'] >= 1, `expected ≥1 non-breaking (UC-* mismatch), got ${JSON.stringify(s)}`);
});
