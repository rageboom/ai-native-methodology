// skill-citation-validator test — 결정적 / no-simulation.
// 1 regression-guard (실 repo 0 finding 의무 / dogfood) + synthetic 양성 검출 + FP 필터 입증.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { checkCitations } from '../src/check-citations.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

describe('skill-citation-validator', () => {
  it('실 repo 47 SKILL.md = 0 stale citation (★ regression-guard / dogfood)', () => {
    const r = checkCitations(REPO_ROOT);
    assert.equal(
      r.finding_count,
      0,
      `stale citation 재유입: ${JSON.stringify(r.findings, null, 2)}`
    );
    assert.ok(r.skill_count >= 40, `skill_count=${r.skill_count} (47 예상)`);
  });

  it('synthetic — 부재 schema / repo-path / DEC 검출 + 부재-context·DEC.md 정규화 FP 필터', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'scv-'));
    try {
      // 최소 ground truth
      mkdirSync(join(tmp, 'schemas'), { recursive: true });
      writeFileSync(join(tmp, 'schemas', 'real.schema.json'), '{}');
      mkdirSync(join(tmp, 'docs', 'adr'), { recursive: true });
      writeFileSync(join(tmp, 'docs', 'adr', 'ADR-001-x.md'), '# x');
      mkdirSync(join(tmp, 'decisions'), { recursive: true });
      writeFileSync(join(tmp, 'decisions', 'DEC-2026-01-01-real.md'), '# d');
      mkdirSync(join(tmp, 'methodology-spec'), { recursive: true });
      writeFileSync(join(tmp, 'methodology-spec', 'exists.md'), '# e');

      const mk = (name, body) => {
        const d = join(tmp, 'skills', name);
        mkdirSync(d, { recursive: true });
        writeFileSync(join(d, 'SKILL.md'), body);
      };
      // bad: 부재 schema + 부재 repo-path + 부재 DEC
      mk('bad-skill', [
        '`schemas/ghost.schema.json` 인용',
        '`methodology-spec/ghost.md` 인용',
        'DEC-2099-12-31-nope 인용',
      ].join('\n'));
      // good + FP-filter: 부재 ADR 이지만 "부재" context → skip / DEC 는 .md 접미 / 실존만
      mk('good-skill', [
        '`schemas/real.schema.json`',
        'ADR-999 부재 → 대체 활용',                // 부재-context → skip
        'DEC-2026-01-01-real.md 참조',              // .md 정규화 → 실존
        '`methodology-spec/exists.md`',
      ].join('\n'));

      const r = checkCitations(tmp);
      const ids = r.findings.map((f) => `${f.skill}:${f.kind}:${f.ref}`);
      // bad-skill 3건 검출
      assert.ok(ids.some((x) => x.includes('bad-skill:schema:ghost.schema.json')), 'ghost schema 검출');
      assert.ok(ids.some((x) => x.includes('bad-skill:repo-path:methodology-spec/ghost.md')), 'ghost path 검출');
      assert.ok(ids.some((x) => x.includes('bad-skill:dec:DEC-2099-12-31-nope')), 'ghost DEC 검출');
      // good-skill 0건 (부재-context ADR skip + DEC .md 정규화 + 실존)
      assert.equal(
        r.findings.filter((f) => f.skill === 'good-skill').length,
        0,
        `good-skill FP: ${JSON.stringify(r.findings.filter((f) => f.skill === 'good-skill'))}`
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
