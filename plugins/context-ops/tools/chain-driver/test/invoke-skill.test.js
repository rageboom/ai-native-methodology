import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  resolveSkillPath, loadSkill, parseFrontmatter,
  formatSkillSuggestion, formatHookBlockContext, SkillNotFoundError,
} from '../src/invoke-skill.js';

describe('invoke-skill', () => {
  it('parseFrontmatter extracts simple key:value pairs', () => {
    const raw = '---\nname: foo\ndescription: bar baz\n---\nbody';
    const { meta, body } = parseFrontmatter(raw);
    assert.equal(meta.name, 'foo');
    assert.equal(meta.description, 'bar baz');
    assert.equal(body.trim(), 'body');
  });

  it('parseFrontmatter returns empty meta when no frontmatter delimiters', () => {
    const raw = 'just body, no frontmatter';
    const { meta } = parseFrontmatter(raw);
    assert.deepEqual(meta, {});
  });

  it('loadSkill throws SkillNotFoundError when skill missing', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'invoke-skill-'));
    assert.throws(() => loadSkill(tmp, 'nonexistent/skill'), SkillNotFoundError);
    rmSync(tmp, { recursive: true, force: true });
  });

  it('loadSkill reads frontmatter from SKILL.md', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'invoke-skill-'));
    const dir = join(tmp, 'skills', 'planning', 'demo');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'SKILL.md'), '---\nname: demo\ndescription: test skill\n---\nbody');
    const result = loadSkill(tmp, 'planning/demo');
    assert.equal(result.meta.name, 'demo');
    assert.ok(result.path.endsWith('SKILL.md'));
    rmSync(tmp, { recursive: true, force: true });
  });

  it('formatSkillSuggestion includes LLM-blocking notice', () => {
    const out = formatSkillSuggestion('planning/x', { name: 'x', description: 'd' });
    assert.match(out, /LLM SHALL NOT auto-invoke/);
    assert.match(out, /User explicit decision/);
  });

  it('formatHookBlockContext includes blocking sentence', () => {
    const ctx = formatHookBlockContext('spec/y', { name: 'y' });
    assert.match(ctx, /SHALL NOT auto-invoke/);
    assert.match(ctx, /\/chain-next/);
  });
});
