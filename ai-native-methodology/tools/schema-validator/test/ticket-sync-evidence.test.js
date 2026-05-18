// schema-validator 회귀 — v8.6.1+ R20 (DEC-2026-05-18-r20-mcp-ticket-sync-channel).
// ticket-sync-evidence.schema.json 정합 검증:
//   1) valid sample (stage=planning / dry_run=false / real MCP invocation)
//   2) valid sample (stage=analysis / dry_run=true)
//   3) evidence_trust = simulated reject (R15 영구 거부)
//   4) mcp_tool_name pattern (mcp__wiki-jira-assistant__ prefix only)
//   5) 7-field evidence 누락 reject (tool_stdout_path/version/timestamp/duration_ms/result_hash/reproduction_command 의무)
//   6) traceability-matrix status_history monotonic + valid (R20 sibling 확장)

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../src/cli.js');
const TMP = resolve(__dirname, '_tmp_ticket_sync_evidence');

function runCli(args) {
  return spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    cwd: resolve(__dirname, '../..'),
  });
}

function ensureTmp() {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
}

const META_OK = {
  generated_at: '2026-05-18T14:30:00+09:00',
  confidence: 0.9,
  inputs_used: ['source_code', 'documentation'],
  methodology_version: 'v8.6.1',
};

const VALID_INVOCATION = {
  mcp_tool_name: 'mcp__wiki-jira-assistant__jira_create',
  tool_stdout_path: '.aimd/output/evidence/mcp-stdout-1.log',
  tool_stderr_path: '.aimd/output/evidence/mcp-stderr-1.log',
  tool_version: '1.4.2',
  invocation_timestamp: '2026-05-18T14:30:00+09:00',
  duration_ms: 1234,
  result_hash: 'a'.repeat(64),
  reproduction_command: 'mcp__wiki-jira-assistant__jira_create with summary=[UC-CAR-007] ...',
};

test('R20 ticket-sync-evidence — valid sample (stage=planning / real MCP invocation)', () => {
  ensureTmp();
  const f = join(TMP, 'ticket-sync-evidence.json');
  writeFileSync(f, JSON.stringify({
    meta: META_OK,
    stage: 'planning',
    scope: 'car',
    mcp_invocations: [VALID_INVOCATION],
    confirmation_log_ref: '.aimd/output/intervention-log.jsonl#entry=2026-05-18T14:29:55',
    evidence_trust: 'real_tool',
    preview_md_digest: 'b'.repeat(64),
    dry_run: false,
    idempotency_skip_count: 0,
  }));
  const r = runCli([f]);
  assert.equal(r.status, 0, `valid sample 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('R20 ticket-sync-evidence — valid sample (stage=analysis / dry_run=true)', () => {
  ensureTmp();
  const f = join(TMP, 'ticket-sync-evidence.json');
  writeFileSync(f, JSON.stringify({
    meta: META_OK,
    stage: 'analysis',
    scope: 'car',
    mcp_invocations: [{
      ...VALID_INVOCATION,
      mcp_tool_name: 'mcp__wiki-jira-assistant__wiki_page_create',
      ticket_id_created: 'WIKI-123',
    }],
    confirmation_log_ref: '.aimd/output/intervention-log.jsonl',
    evidence_trust: 'real_tool',
    dry_run: true,
  }));
  const r = runCli([f]);
  assert.equal(r.status, 0, `dry_run sample 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('R20 ticket-sync-evidence — evidence_trust = "simulated" reject (R15 영구 거부)', () => {
  ensureTmp();
  const f = join(TMP, 'ticket-sync-evidence.json');
  writeFileSync(f, JSON.stringify({
    meta: META_OK,
    stage: 'planning',
    mcp_invocations: [VALID_INVOCATION],
    confirmation_log_ref: '.aimd/output/intervention-log.jsonl',
    evidence_trust: 'simulated',
  }));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `simulated 영구 거부 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('R20 ticket-sync-evidence — mcp_tool_name pattern (mcp__wiki-jira-assistant__ prefix only)', () => {
  ensureTmp();
  const f = join(TMP, 'ticket-sync-evidence.json');
  writeFileSync(f, JSON.stringify({
    meta: META_OK,
    stage: 'planning',
    mcp_invocations: [{
      ...VALID_INVOCATION,
      mcp_tool_name: 'mcp__linear__create_issue', // Linear MCP reject (R20 Tier 2.5 = jira-confluence only)
    }],
    confirmation_log_ref: '.aimd/output/intervention-log.jsonl',
    evidence_trust: 'real_tool',
  }));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `Linear MCP reject 의무 (v8.6.1 = jira-confluence only / v8.7.0+ multi-platform carry). stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('R20 ticket-sync-evidence — 7-field evidence 누락 reject (reproduction_command 의무)', () => {
  ensureTmp();
  const f = join(TMP, 'ticket-sync-evidence.json');
  const { reproduction_command, ...partial } = VALID_INVOCATION;
  writeFileSync(f, JSON.stringify({
    meta: META_OK,
    stage: 'planning',
    mcp_invocations: [partial],
    confirmation_log_ref: '.aimd/output/intervention-log.jsonl',
    evidence_trust: 'real_tool',
  }));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `reproduction_command 의무 (R15 정합). stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('R20 ticket-sync-evidence — result_hash sha256 pattern 검증 (64 hex)', () => {
  ensureTmp();
  const f = join(TMP, 'ticket-sync-evidence.json');
  writeFileSync(f, JSON.stringify({
    meta: META_OK,
    stage: 'planning',
    mcp_invocations: [{
      ...VALID_INVOCATION,
      result_hash: 'too_short', // not 64 hex
    }],
    confirmation_log_ref: '.aimd/output/intervention-log.jsonl',
    evidence_trust: 'real_tool',
  }));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `result_hash sha256 pattern 의무. stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('R20 traceability-matrix — ticket_ref.status_history valid sample', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify({
    meta: META_OK,
    matrix: [{
      use_case_id: 'UC-CAR-007',
      status: 'green',
      ticket_ref: {
        platform: 'jira',
        id: 'MIG-1234',
        status_history: [
          { transitioned_at: '2026-05-18T14:30:00+09:00', to_status: 'To Do', mcp_tool: 'mcp__wiki-jira-assistant__jira_create' },
          { transitioned_at: '2026-05-18T15:00:00+09:00', from_status: 'To Do', to_status: 'In Progress', mcp_tool: 'mcp__wiki-jira-assistant__jira_transition', evidence_ref: '.aimd/output/evidence/ticket-sync-spec-20260518T150000.json' },
          { transitioned_at: '2026-05-18T16:30:00+09:00', from_status: 'In Progress', to_status: 'Done', mcp_tool: 'mcp__wiki-jira-assistant__jira_transition' },
        ],
      },
    }],
    coverage_summary: { forward_coverage: 0.85, backward_coverage: 0.85, threshold: 0.85 },
  }));
  const r = runCli([f]);
  assert.equal(r.status, 0, `status_history valid 의무. stdout:${r.stdout}\nstderr:${r.stderr}`);
  rmSync(TMP, { recursive: true, force: true });
});

test('R20 traceability-matrix — status_history.mcp_tool pattern (mcp__wiki-jira-assistant__ prefix only)', () => {
  ensureTmp();
  const f = join(TMP, 'traceability-matrix.json');
  writeFileSync(f, JSON.stringify({
    meta: META_OK,
    matrix: [{
      use_case_id: 'UC-CAR-007',
      status: 'green',
      ticket_ref: {
        platform: 'jira',
        id: 'MIG-1234',
        status_history: [
          { transitioned_at: '2026-05-18T14:30:00+09:00', to_status: 'To Do', mcp_tool: 'mcp__github__create_issue' }, // GitHub reject
        ],
      },
    }],
    coverage_summary: { forward_coverage: 0.85, backward_coverage: 0.85, threshold: 0.85 },
  }));
  const r = runCli([f]);
  assert.notEqual(r.status, 0, `GitHub MCP reject 의무 (R20 Tier 2.5 = jira-confluence only). stdout:${r.stdout}`);
  rmSync(TMP, { recursive: true, force: true });
});
