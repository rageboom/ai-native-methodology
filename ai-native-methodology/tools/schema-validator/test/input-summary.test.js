// input-summary.schema.json (★ ★ v3.3 G2 / analysis-input-orchestrate 산출 schema) registration + 정합 test.
// 5 case: valid 1 + invalid 4 (required 누락 / additionalProperties 위반 / similarity_score 범위 / scope pattern).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '..', 'src', 'cli.js');
const SCHEMA_DIR = resolve(__dirname, '..', '..', '..', 'schemas');

function tmp() {
  return mkdtempSync(join(tmpdir(), 'sv-input-summary-'));
}

function runCli(target) {
  const r = spawnSync('node', [CLI, target, '--schema-dir', SCHEMA_DIR, '--json'], { encoding: 'utf-8' });
  return { stdout: r.stdout || '', stderr: r.stderr || '', code: r.status, parsed: r.stdout ? JSON.parse(r.stdout) : null };
}

function validInstance() {
  return {
    $schema_origin: '../../schemas/input-summary.schema.json',
    scope: 'user-mgmt',
    created_at: '2026-05-15T10:00:00Z',
    raw_prompt: '스웨거는 https://api.example.com/openapi.yaml, 피그마는 https://figma.com/file/abc, 기획은 ./docs/spec.md. 사용자 관리 만들어줘.',
    parsed: {
      swagger_url: 'https://api.example.com/openapi.yaml',
      figma_url: 'https://figma.com/file/abc',
      plan_doc_path: './docs/spec.md',
      residual_intent: '사용자 관리 만들어줘.',
      inline_marker_used: false,
    },
    inputs: {
      swagger: { extract_ref: 'swagger-extract.json', endpoints_count: 12, schemas_count: 5 },
      figma: { extract_ref: 'figma-extract.json', screens_count: 3, components_count: 8, tokens_count: 42 },
      plan_doc: { extract_ref: 'plan-doc-extract.json', sections_count: 4, uc_candidates_count: 3 },
      prompt: { extract_ref: 'prompt-extract.json', intent_summary: '사용자 관리 기능' },
    },
    dispatch_mode: 'direct',
    dispatch_token_estimate: 18420,
    cross_refs: [
      {
        uc_candidate: 'UC-USER-LIST',
        from: ['figma:UserList', 'swagger:GET /users', 'plan-doc:§3', 'prompt:사용자 관리'],
      },
    ],
    conflicts: [
      {
        id: 'CONFLICT-001',
        severity: 'medium',
        between: ['figma:UserDetail.email', 'swagger:userEmail'],
        description: 'Figma 필드명 email vs Swagger schema userEmail — 명명 충돌',
        similarity_score: 0.72,
        score_components: { normalized_levenshtein: 0.42, stem_intersection: 1, stem_union: 2 },
      },
    ],
    user_decisions_pending: [],
  };
}

test('★ G2 — input-summary 정합 instance → valid', () => {
  const dir = tmp();
  try {
    writeFileSync(join(dir, 'input-summary.json'), JSON.stringify(validInstance()));
    const r = runCli(join(dir, 'input-summary.json'));
    const result = r.parsed.results[0];
    assert.notEqual(result.schema_status, 'not-found', `schema not found: ${JSON.stringify(result)}`);
    assert.equal(result.valid, true, `expected valid, got: ${JSON.stringify(result)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ G2 — input-summary required 누락 (raw_prompt 부재) → invalid', () => {
  const dir = tmp();
  try {
    const inst = validInstance();
    delete inst.raw_prompt;
    writeFileSync(join(dir, 'input-summary.json'), JSON.stringify(inst));
    const r = runCli(join(dir, 'input-summary.json'));
    const result = r.parsed.results[0];
    assert.notEqual(result.schema_status, 'not-found');
    assert.equal(result.valid, false, `expected invalid, got: ${JSON.stringify(result)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ G2 — input-summary additionalProperties 위반 → invalid', () => {
  const dir = tmp();
  try {
    const inst = validInstance();
    inst.unknown_extra_field = '허용 안 됨';
    writeFileSync(join(dir, 'input-summary.json'), JSON.stringify(inst));
    const r = runCli(join(dir, 'input-summary.json'));
    const result = r.parsed.results[0];
    assert.equal(result.valid, false, `expected invalid (additionalProperties:false), got: ${JSON.stringify(result)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ G2 — input-summary similarity_score 범위 초과 (> 2) → invalid', () => {
  const dir = tmp();
  try {
    const inst = validInstance();
    inst.conflicts[0].similarity_score = 2.5;
    writeFileSync(join(dir, 'input-summary.json'), JSON.stringify(inst));
    const r = runCli(join(dir, 'input-summary.json'));
    const result = r.parsed.results[0];
    assert.equal(result.valid, false, `expected invalid (score > 2), got: ${JSON.stringify(result)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('★ G2 — input-summary scope pattern 위반 (대문자) → invalid', () => {
  const dir = tmp();
  try {
    const inst = validInstance();
    inst.scope = 'User-Mgmt';
    writeFileSync(join(dir, 'input-summary.json'), JSON.stringify(inst));
    const r = runCli(join(dir, 'input-summary.json'));
    const result = r.parsed.results[0];
    assert.equal(result.valid, false, `expected invalid (scope pattern: kebab-case lowercase only), got: ${JSON.stringify(result)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
