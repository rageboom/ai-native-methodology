import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkLinks, summarize } from '../src/check-links.js';

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
