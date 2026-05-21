// inflation-lint 회귀 — v8.8.0 Tier 3.1
//
// 1) clean .md → 0 findings
// 2) ★ ≥ 5 per file → star_density warning
// 3) ★ ★ ★ ★ 연속 → star_run_long warning
// 4) 과장 형용사 ≥ 3 → inflation_phrases warning
// 5) cycle-7 CLOSURE-like fixture → 3 warning kind 모두 emit
// 6) exit code = 0 (warning only / chain blocking ❌)

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../src/cli.js');
const TMP = resolve(__dirname, '_tmp_inflation_lint');

function ensureTmp() {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
}

function runCli(args) {
  return spawnSync('node', [CLI, ...args, '--json'], { encoding: 'utf-8' });
}

test('★ v8.8.0 — clean .md → 0 findings', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'clean.md'), `# Clean Document

본 문서는 정직한 톤입니다. 과장 없음. 핵심 사실만 정확히 표기.
`);
  const res = runCli([join(TMP, 'clean.md')]);
  assert.equal(res.status, 0);
  const r = JSON.parse(res.stdout);
  assert.equal(r.total_findings, 0);
});

test('★ v8.8.0 — ★ ≥ 5 → star_density warning', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'stars.md'), `# Title

★ first ★ second ★ third ★ fourth ★ fifth ★ sixth
`);
  const res = runCli([join(TMP, 'stars.md')]);
  assert.equal(res.status, 0);
  const r = JSON.parse(res.stdout);
  assert.ok(r.findings.some(f => f.kind === 'star_density'),
    `star_density warning emit 의무: ${JSON.stringify(r.findings)}`);
});

test('★ v8.8.0 — ★ ★ ★ ★ run ≥ 4 → star_run_long warning', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'run.md'), `# Title

본질 가치 ★ ★ ★ ★ ★ — 매우 중요한 발견.
`);
  const res = runCli([join(TMP, 'run.md')]);
  const r = JSON.parse(res.stdout);
  assert.ok(r.findings.some(f => f.kind === 'star_run_long'),
    `star_run_long warning emit 의무: ${JSON.stringify(r.findings)}`);
});

test('★ v8.8.0 — 과장 형용사 ≥ 3 → inflation_phrases warning', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'phrases.md'), `# Inflation Test

cycle-7 가 본격 release 자격 입증. 영구 입증. 결정적.
`);
  const res = runCli([join(TMP, 'phrases.md')]);
  const r = JSON.parse(res.stdout);
  assert.ok(r.findings.some(f => f.kind === 'inflation_phrases'),
    `inflation_phrases warning emit 의무: ${JSON.stringify(r.findings)}`);
});

test('★ v8.8.0 — exit code 0 (chain blocking ❌)', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'allbad.md'), `# All inflation

★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ 본격 release 자격. 영구 입증. 결정적. 본질 가치. 가장 큰 ROI.
`);
  const res = runCli([join(TMP, 'allbad.md')]);
  assert.equal(res.status, 0, '★ chain blocking ❌ 의무 (exit 0)');
});

test('★ v8.8.0 — threshold override (--star-threshold 100 → noisy file 도 clean 처리)', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'noise.md'), `# Noisy
★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ — 11개
`);
  const res = runCli([join(TMP, 'noise.md'), '--star-threshold', '100']);
  const r = JSON.parse(res.stdout);
  // star_density 는 미달이지만 star_run_long 은 여전히 emit (run 은 별도 threshold)
  assert.ok(!r.findings.some(f => f.kind === 'star_density'),
    `star_threshold=100 시 star_density emit ❌: ${JSON.stringify(r.findings)}`);
});

test('★ v8.8.0 — empty dir → 0 findings', () => {
  ensureTmp();
  const res = runCli([TMP]);
  assert.equal(res.status, 0);
  const r = JSON.parse(res.stdout);
  assert.equal(r.files_scanned, 0);
});

// v8.8.2 — 3 신규 rule (claim_absoluteness / emoji_density / korean_overemphasis)

test('★ v8.8.2 — absoluteness claim (100% / 절대 / 완벽 / never / always) ≥ N → claim_absoluteness warning', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'absolute.md'), `# Absolute claim test

100% pass / 절대 fail 없음 / 완벽 정합 / never wrong / always correct / perfect output / guaranteed.
`);
  const res = runCli([join(TMP, 'absolute.md')]);
  const r = JSON.parse(res.stdout);
  assert.ok(r.findings.some(f => f.kind === 'claim_absoluteness'),
    `claim_absoluteness warning emit 의무: ${JSON.stringify(r.findings)}`);
});

test('★ v8.8.2 — emoji density (❌ ⚠️ ✅ ❗ ⭐) ≥ 15 → emoji_density warning', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'emoji.md'), `# Emoji test

✅ done ✅ pass ✅ ok ❌ fail ❌ block ⚠️ warn ⚠️ risk ❗ critical ❗ urgent ⭐ feature
✅ ✅ ✅ ❌ ❌ ⚠️ ⚠️ ❗ ⭐ ⭐
`);
  const res = runCli([join(TMP, 'emoji.md'), '--emoji-threshold', '10']);
  const r = JSON.parse(res.stdout);
  assert.ok(r.findings.some(f => f.kind === 'emoji_density'),
    `emoji_density warning emit 의무: ${JSON.stringify(r.findings)}`);
});

test('★ v8.8.2 — korean overemphasis (본질/진정/정직/결단/핵심) ≥ 8 → korean_overemphasis warning', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'overemphasis.md'), `# 한국어 overemphasis

본질 가치 / 진정 사실 / 정직 표기 / 결단 의무 / 핵심 결과 / 본질 의도 / 진정 결단 / 정직 cleanup
`);
  const res = runCli([join(TMP, 'overemphasis.md'), '--overemphasis-threshold', '6']);
  const r = JSON.parse(res.stdout);
  assert.ok(r.findings.some(f => f.kind === 'korean_overemphasis'),
    `korean_overemphasis warning emit 의무: ${JSON.stringify(r.findings)}`);
});

test('★ v8.8.2 — clean .md (no inflation) → 6 rule 모두 0 findings', () => {
  ensureTmp();
  writeFileSync(join(TMP, 'pristine.md'), `# Pristine

본 문서는 정합한 정보만 기록한다. 측정 결과 = 35 SQL / 7 UC. cycle-7 분석 완료.
`);
  const res = runCli([join(TMP, 'pristine.md')]);
  const r = JSON.parse(res.stdout);
  assert.equal(r.total_findings, 0, `clean .md → 0 findings 의무 (실 ${r.total_findings}): ${JSON.stringify(r.findings)}`);
});
