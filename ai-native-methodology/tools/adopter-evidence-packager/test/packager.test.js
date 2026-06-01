import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  opaqueId, extractGates, summarizeFindings, extractCoverage, buildCorroboration,
} from '../src/packager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');
const FX = (n) => join(__dirname, 'fixtures', n);
const fixture = (n) => JSON.parse(readFileSync(FX(n), 'utf8'));
const PV = ['--plugin-version', '11.29.0'];
const AT = ['--captured-at', '2026-06-01T12:00:00Z'];

function runCli(args) {
  return spawnSync('node', [CLI, ...args], { encoding: 'utf8' });
}

// ── 순수 로직 ─────────────────────────────────────────────────────────────────

test('opaqueId — 결정론 + salt 가 hash 변경 + 32 hex', () => {
  const a = opaqueId('s1', 'proj');
  const b = opaqueId('s1', 'proj');
  const c = opaqueId('s2', 'proj');
  assert.equal(a, b, '동일 입력 → 동일 hash');
  assert.notEqual(a, c, 'salt 변경 → hash 변경 (rainbow-table 회피)');
  assert.match(a, /^[a-f0-9]{32}$/);
});

test('extractGates — complete 5 stage → gate #1~#5 + last_gate validator_findings(#5)', () => {
  const gates = extractGates(fixture('state.json'));
  assert.equal(gates.length, 5);
  assert.deepEqual(gates.map((g) => g.id), ['#1', '#2', '#3', '#4', '#5']);
  assert.ok(gates.every((g) => g.decision === 'go'));
  const g5 = gates.find((g) => g.id === '#5');
  assert.equal(g5.validator_findings.medium, 2, '#5 = last_gate validator_findings 첨부');
  assert.equal(gates.find((g) => g.id === '#1').validator_findings, undefined, '비-last gate = findings 없음');
});

test('extractGates — 미완료 stage 제외', () => {
  const partial = { stage_progress: { discovery: { status: 'complete', gate_decision: 'go' }, spec: { status: 'in_progress' }, plan: {}, test: {}, implement: {} } };
  const gates = extractGates(partial);
  assert.deepEqual(gates.map((g) => g.id), ['#1']);
});

test('summarizeFindings — total 합산', () => {
  const s = summarizeFindings(fixture('findings.json'));
  assert.equal(s.total, 0 + 1 + 4 + 3 + 2);
  assert.equal(s.high, 1);
});

test('extractCoverage — forward_coverage → link_coverage + 있는 metric 만', () => {
  const cov = extractCoverage(fixture('matrix.json'));
  assert.equal(cov.link_coverage, 1);
  assert.equal(cov.test_pass_rate, 1);
  assert.equal(cov.line_branch_coverage, 0.91);
});

test('buildCorroboration — redaction: email/path → [redacted-*] + count + leak 0', () => {
  const r = buildCorroboration({
    state: fixture('state.json'), pluginVersion: '11.29.0', capturedAt: '2026-06-01T12:00:00Z',
    stackSignals: ['nestjs', 'prisma'], scenario: 'S2',
    feedback: 'mail me dev@example.com from C:\\Users\\bob\\proj',
  });
  assert.ok(r.redaction_count >= 2, `email+path redact (got ${r.redaction_count})`);
  assert.match(r.corroboration.user_feedback.summary, /\[redacted-email\]/);
  assert.match(r.corroboration.user_feedback.summary, /\[redacted-path\]/);
  assert.doesNotMatch(r.corroboration.user_feedback.summary, /dev@example\.com/);
  assert.equal(r.leak_hits.length, 0, 'redaction 후 leak 0');
  assert.equal(r.corroboration.anonymization.applied, true);
});

test('buildCorroboration — noRedact + PII → leak guard hit (field 경로 보고 / REVISE-5)', () => {
  const r = buildCorroboration({
    state: fixture('state.json'), pluginVersion: '11.29.0', capturedAt: '2026-06-01T12:00:00Z',
    feedback: 'reach dev@example.com', noRedact: true,
  });
  assert.ok(r.leak_hits.length >= 1, 'noRedact → post-redaction PII 잔존 = leak');
  assert.equal(r.leak_hits[0].field, 'user_feedback.summary');
  assert.ok(r.leak_hits[0].labels.includes('email'));
  assert.equal(r.corroboration.anonymization.applied, false);
});

// ── CLI ───────────────────────────────────────────────────────────────────────

test('CLI round-trip (dry-run) — exit 0 / ok / scenario=S2 / gates 5 / plugin_version', () => {
  const r = runCli(['--state', FX('state.json'), '--manifest', FX('manifest.json'),
    '--findings', FX('findings.json'), '--matrix', FX('matrix.json'),
    '--stack', 'nestjs,prisma,postgres', '--org-type', 'external-oss', '--salt', 'x',
    '--loc-bucket', '10k-100k', '--dry-run', '--json', ...PV, ...AT]);
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.ok, true);
  assert.equal(out.dry_run, true);
  const c = out.corroboration;
  assert.equal(c.project.scenario, 'S2', 'manifest.scenario 흡수');
  assert.equal(c.chain_run.gates.length, 5);
  assert.equal(c.chain_run.completed, true);
  assert.equal(c.chain_run.terminal_stage, 'implement');
  assert.equal(c.plugin_version, '11.29.0');
  assert.deepEqual(c.project.stack_signals, ['nestjs', 'prisma', 'postgres']);
  assert.equal(c.adopter.org_type, 'external-oss');
  assert.equal(c.project.loc_bucket, '10k-100k');
  assert.equal(c.findings_summary.total, 10);
  assert.equal(c.coverage.link_coverage, 1);
  assert.match(c.adopter.adopter_id, /^[a-f0-9]{32}$/);
});

test('CLI 결정론 — 동일 입력 + captured-at → byte-identical 출력 (check30 golden)', () => {
  const args = ['--state', FX('state.json'), '--manifest', FX('manifest.json'),
    '--stack', 'nestjs', '--salt', 'x', '--dry-run', ...PV, ...AT];
  const a = runCli(args).stdout;
  const b = runCli(args).stdout;
  assert.equal(a, b);
});

test('CLI redaction — --feedback email → [redacted-email] / exit 0 / leak 0', () => {
  const r = runCli(['--state', FX('state.json'), '--stack', 'nestjs',
    '--feedback', 'contact dev@example.com please', '--dry-run', '--json', ...PV, ...AT]);
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.ok(out.redaction_count >= 1);
  assert.match(out.corroboration.user_feedback.summary, /\[redacted-email\]/);
});

test('CLI leak guard — --no-redact + PII → exit 1 / reason pii_leak / field 보고 (REVISE-5)', () => {
  const r = runCli(['--state', FX('state.json'), '--stack', 'nestjs',
    '--feedback', 'contact dev@example.com', '--no-redact', '--json', ...PV, ...AT]);
  assert.equal(r.status, 1);
  const out = JSON.parse(r.stdout);
  assert.equal(out.ok, false);
  assert.equal(out.reason, 'pii_leak');
  assert.equal(out.leak_hits[0].field, 'user_feedback.summary');
});

test('CLI write — --out tmp → 파일 작성 + schema valid + exit 0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aep-'));
  try {
    const out = join(dir, 'corr.json');
    const r = runCli(['--state', FX('state.json'), '--stack', 'nestjs', '--salt', 'x',
      '--out', out, ...PV, ...AT]);
    assert.equal(r.status, 0, r.stderr);
    const written = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(written.schema_version, '1.0.0');
    assert.equal(written.chain_run.gates.length, 5);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI plugin_version auto — plugin.json 자동 (--plugin-version 생략)', () => {
  const r = runCli(['--state', FX('state.json'), '--stack', 'nestjs', '--dry-run', '--json', ...AT]);
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.match(out.corroboration.plugin_version, /^\d+\.\d+\.\d+/);
});

test('CLI usage — --state 부재 → exit 2', () => {
  const r = runCli(['--json']);
  assert.equal(r.status, 2);
});
