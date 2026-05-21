#!/usr/bin/env node
// test-impl-pass-validator — ★ ★ ★ chain 4 (impl → done) gate validator.
//
// 사용:
//   node src/cli.js --project <dir> [--inventory <path>] [--test-cmd '<json>']
//                   [--out <path>] [--allow-execute] [--dry-run] [--json]
//                   [--timeout <ms>] [--flaky-retry <n>]
//
// ★ ADR-CHAIN-004 정합:
//   1. .aimd/config/test-cmd.json 우선 / inventory 추론 / --test-cmd override
//   2. --allow-execute 의무 (없으면 dry-run only)
//   3. timeout 600000ms default / maxBuffer 50MB
//   4. flaky retry per-test cap 2 (Playwright 정합)
//   5. result_hash = sha256(sorted_test_names + pass:fail:skip + framework:version)
//
// exit code:
//   0 — 100% pass + 5종 물증 7 필드 정합 / dry-run
//   1 — 1+ fail / evidence 누락 / timeout
//   2 — usage error / config parse error / --allow-execute 부재 + --dry-run 부재

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join, isAbsolute } from 'node:path';
import { loadTestCmd } from './load-test-cmd.js';
import { computeResultHash } from './result-hash.js';
import { parseJestJson } from './runners/jest.js';
import { parseVitestJson } from './runners/vitest.js';
import { parseJunitXml } from './runners/junit-xml.js';
import { parsePytestJson } from './runners/pytest.js';
import { parseStdout as parseOtherStdout } from './runners/other.js';
import { detectMockImplementation } from './mock-detect.js';

function usage(code = 2) {
  console.error([
    'usage: test-impl-pass-validator --project <dir> [options]',
    '  --project <dir>          required — 사용자 프로젝트 root (.aimd/ 위치 기준)',
    '  --inventory <path>       inventory.json (stack_signals 자동 추론용)',
    '  --test-cmd <json>        inline test-cmd JSON override',
    '  --out <path>             test_invocation_evidence 산출 path (default: <project>/.aimd/output/evidence/test-invocation-evidence.json)',
    '  --allow-execute          ADR-CHAIN-004 §4 — 진짜 실행 동의 (없으면 dry-run only)',
    '  --dry-run                config 검증만 / 실행 ❌ / exit 0 강제',
    '  --json                   JSON output',
    '  --timeout <ms>           runner timeout (default 600000)',
    '  --flaky-retry <n>        per-test retry cap (default 2 / max 5)',
    '',
    'v8.8.0 Tier 1.1 — mock_implementation_ratio (experimental opt-in / §8.1 ≥2 PoC carry):',
    '  --detect-mock-impl <mode>   off (default) | experimental (measure + warn) | enforce (degrade ok)',
    '  --impl-dir <dir>            impl 코드 root (default: <project>/src) — mock detect target',
    '  --mock-threshold <ratio>    mock_implementation_ratio threshold (default 0.40)',
  ].join('\n'));
  process.exit(code);
}

function parseArgs(argv) {
  const out = {
    allowExecute: false,
    dryRun: false,
    json: false,
    detectMockImpl: 'off',
    implDir: null,
    mockThreshold: 0.40,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project') out.project = argv[++i];
    else if (a === '--inventory') out.inventory = argv[++i];
    else if (a === '--test-cmd') out.testCmdInline = argv[++i];
    else if (a === '--out') out.outPath = argv[++i];
    else if (a === '--allow-execute') out.allowExecute = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--json') out.json = true;
    else if (a === '--timeout') out.timeoutOverride = Number(argv[++i]);
    else if (a === '--flaky-retry') out.flakyRetryOverride = Number(argv[++i]);
    else if (a === '--detect-mock-impl') out.detectMockImpl = argv[++i];
    else if (a === '--impl-dir') out.implDir = argv[++i];
    else if (a === '--mock-threshold') out.mockThreshold = parseFloat(argv[++i]);
    else if (a === '--help' || a === '-h') usage(0);
  }
  // detect mode 유효성
  if (!['off', 'experimental', 'enforce'].includes(out.detectMockImpl)) {
    console.error(`[test-impl-pass-validator] invalid --detect-mock-impl=${out.detectMockImpl} (must be off|experimental|enforce)`);
    process.exit(2);
  }
  return out;
}

function loadInventory(inventoryPath) {
  if (!inventoryPath) return null;
  if (!existsSync(inventoryPath)) return null;
  try { return JSON.parse(readFileSync(inventoryPath, 'utf-8')); }
  catch { return null; }
}

function selectAdapter(framework) {
  switch (framework) {
    case 'jest':       return { parser: parseJestJson, kind: 'json' };
    case 'vitest':     return { parser: parseVitestJson, kind: 'json' };
    case 'junit5':     return { parser: parseJunitXml, kind: 'xml' };
    case 'pytest':     return { parser: parsePytestJson, kind: 'json' };
    default:           return { parser: null, kind: 'stdout' };
  }
}

function resolvePath(p, baseDir) {
  return isAbsolute(p) ? p : resolve(baseDir, p);
}

function runOnce(testCmd, projectDir) {
  const env = { ...process.env, ...(testCmd.extra_env ?? {}) };
  const cwd = testCmd.working_directory
    ? resolvePath(testCmd.working_directory, projectDir)
    : projectDir;
  const args = testCmd.test_cmd_args ?? [];

  const startedAt = new Date().toISOString();
  const result = spawnSync(testCmd.test_cmd, args, {
    cwd,
    env,
    encoding: 'utf-8',
    timeout: testCmd.timeout_ms ?? 600000,
    maxBuffer: 50 * 1024 * 1024,
    shell: false,  // ★ ADR-CHAIN-004 §1 — shell:true ❌ / array argument
  });
  const finishedAt = new Date().toISOString();

  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status,
    timedOut: result.error?.code === 'ETIMEDOUT' || (result.signal === 'SIGTERM' && result.error),
    spawn_error: result.error ? String(result.error.message ?? result.error) : null,
    started_at: startedAt,
    finished_at: finishedAt,
  };
}

function executeWithRetry(testCmd, projectDir, retryCap) {
  let attempt = 0;
  let last = null;
  let flakyRetries = 0;
  while (attempt <= retryCap) {
    const start = Date.now();
    last = runOnce(testCmd, projectDir);
    last.duration_ms = Date.now() - start;
    if (last.spawn_error || last.timedOut) {
      // 환경 / hang 은 retry ❌ — fast fail
      break;
    }
    if (last.status === 0) break;
    attempt++;
    if (attempt <= retryCap) flakyRetries++;
  }
  last.flaky_retries_count = flakyRetries;
  return last;
}

function parseRunnerOutput(testCmd, runResult, framework, projectDir) {
  const adapter = selectAdapter(framework);

  // 우선순위: report_path 가 있으면 그것을 우선 (sarif/junit-xml/json)
  if (testCmd.report_path) {
    const rp = resolvePath(testCmd.report_path, projectDir);
    if (existsSync(rp)) {
      const content = readFileSync(rp, 'utf-8');
      if (testCmd.report_format === 'junit-xml') return parseJunitXml(content);
      if (framework === 'pytest') return parsePytestJson(content);
      if (framework === 'jest')   return parseJestJson(content);
      if (framework === 'vitest') return parseVitestJson(content);
    }
  }

  // stdout fallback
  if (framework === 'other') {
    return parseOtherStdout(runResult.stdout, testCmd.stdout_parser);
  }
  if (adapter.parser) {
    return adapter.parser(runResult.stdout);
  }

  throw new Error(`unsupported framework: ${framework}`);
}

function buildEvidence(testCmd, framework, parsed, runResult, projectDir, retryCount) {
  const reproduction = `${testCmd.test_cmd} ${(testCmd.test_cmd_args ?? []).join(' ')}`.trim();
  const stdout_path = resolvePath(testCmd.stdout_path ?? '.aimd/output/evidence/test-stdout.txt', projectDir);
  const stderr_path = resolvePath(testCmd.stderr_path ?? '.aimd/output/evidence/test-stderr.txt', projectDir);

  const result_hash = computeResultHash({
    test_names: parsed.test_names,
    pass_count: parsed.pass_count,
    fail_count: parsed.fail_count,
    skip_count: parsed.skip_count,
    framework,
    framework_version: testCmd.framework_version ?? 'unknown',
  });

  return {
    test_runner_version: testCmd.framework_version ?? `${framework}:unknown`,
    test_runner_stdout_path: stdout_path,
    test_runner_stderr_path: stderr_path,
    invocation_timestamp: runResult.started_at,
    duration_ms: runResult.duration_ms ?? 0,
    pass_count: parsed.pass_count,
    fail_count: parsed.fail_count,
    skip_count: parsed.skip_count,
    reproduction_command: reproduction,
    result_hash,
    report_format: testCmd.report_format ?? 'json',
    flaky_retries_count: retryCount,
    coverage_report_path: testCmd.coverage_report_path
      ? resolvePath(testCmd.coverage_report_path, projectDir)
      : undefined,
  };
}

function writeEvidenceFiles(evidence, runResult, outPath, projectDir) {
  // stdout / stderr 파일 작성 (5종 물증 7 필드 의무)
  const stdoutPath = evidence.test_runner_stdout_path;
  const stderrPath = evidence.test_runner_stderr_path;
  mkdirSync(dirname(stdoutPath), { recursive: true });
  mkdirSync(dirname(stderrPath), { recursive: true });
  writeFileSync(stdoutPath, runResult.stdout);
  writeFileSync(stderrPath, runResult.stderr);

  const out = outPath ?? resolvePath('.aimd/output/evidence/test-invocation-evidence.json', projectDir);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(evidence, null, 2));
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.project) usage(2);

  const projectDir = resolve(args.project);
  if (!existsSync(projectDir)) {
    console.error(`error: --project not found: ${projectDir}`);
    process.exit(2);
  }

  const inventory = loadInventory(args.inventory);
  let cliOverride = null;
  if (args.testCmdInline) {
    try { cliOverride = JSON.parse(args.testCmdInline); }
    catch (e) { console.error(`--test-cmd JSON parse error: ${e.message}`); process.exit(2); }
  }

  const { resolved, source, error } = loadTestCmd({
    sourceProjectDir: projectDir,
    inventory,
    cliOverride,
  });

  if (!resolved) {
    const msg = `[test-impl-pass-validator] ★ no test-cmd contract (source=${source}) — ${error ?? 'unresolved'}`;
    if (args.json) console.log(JSON.stringify({ ok: false, error: msg }));
    else console.error(msg);
    process.exit(2);
  }

  // ★ ★ ★ ADR-CHAIN-004 §4 — --allow-execute 의무
  if (!args.allowExecute && !args.dryRun) {
    const msg = '[test-impl-pass-validator] ★ ★ ★ ADR-CHAIN-004 §4 — --allow-execute 의무 (또는 --dry-run). 실제 사용자 코드 실행 동의 명시 필요.';
    if (args.json) console.log(JSON.stringify({ ok: false, error: msg }));
    else console.error(msg);
    process.exit(2);
  }

  if (args.dryRun) {
    const out = {
      ok: true,
      mode: 'dry-run',
      source,
      framework: resolved.framework,
      test_cmd: resolved.test_cmd,
      test_cmd_args: resolved.test_cmd_args,
      timeout_ms: resolved.timeout_ms,
      flaky_retry_per_test: resolved.flaky_retry_per_test,
      allow_execute: resolved.allow_execute,
      message: '[dry-run] config 검증 완료. 실행 ❌ / exit 0 강제 (S3 정합).',
    };
    console.log(args.json ? JSON.stringify(out, null, 2) : out.message);
    process.exit(0);
  }

  // override timeouts
  if (Number.isFinite(args.timeoutOverride)) resolved.timeout_ms = args.timeoutOverride;
  const retryCap = Number.isFinite(args.flakyRetryOverride)
    ? Math.min(5, Math.max(0, args.flakyRetryOverride))
    : (resolved.flaky_retry_per_test ?? 2);

  // 진짜 실행
  const runResult = executeWithRetry(resolved, projectDir, retryCap);

  if (runResult.spawn_error) {
    const msg = `[test-impl-pass-validator] runner spawn error: ${runResult.spawn_error}`;
    if (args.json) console.log(JSON.stringify({ ok: false, error: msg, runResult }));
    else console.error(msg);
    process.exit(1);
  }
  if (runResult.timedOut) {
    const msg = `[test-impl-pass-validator] runner timed out (${resolved.timeout_ms}ms)`;
    if (args.json) console.log(JSON.stringify({ ok: false, error: msg, runResult }));
    else console.error(msg);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = parseRunnerOutput(resolved, runResult, resolved.framework, projectDir);
  } catch (e) {
    const msg = `[test-impl-pass-validator] runner output parse error: ${e.message}`;
    if (args.json) console.log(JSON.stringify({ ok: false, error: msg }));
    else console.error(msg);
    process.exit(1);
  }

  const evidence = buildEvidence(resolved, resolved.framework, parsed, runResult, projectDir, runResult.flaky_retries_count ?? 0);
  const evidencePath = writeEvidenceFiles(evidence, runResult, args.outPath, projectDir);

  const ok100 = parsed.fail_count === 0 && parsed.pass_count > 0;

  // ★ v8.8.0 Tier 1.1 — mock_implementation_ratio detect (experimental opt-in)
  let mockReport = null;
  let okState = ok100 ? 'ok' : 'fail';
  if (args.detectMockImpl !== 'off') {
    const implDir = args.implDir
      ? (isAbsolute(args.implDir) ? args.implDir : resolve(projectDir, args.implDir))
      : resolve(projectDir, 'src');
    if (existsSync(implDir)) {
      mockReport = detectMockImplementation(implDir, {
        mode: args.detectMockImpl,
        threshold: args.mockThreshold,
      });
      if (mockReport.exceeded) {
        if (args.detectMockImpl === 'experimental') {
          okState = ok100 ? 'degraded_mock' : 'fail';
        } else if (args.detectMockImpl === 'enforce') {
          okState = 'fail_mock';
        }
      }
    } else {
      mockReport = {
        mode: args.detectMockImpl,
        skip_reason: `impl_dir_missing: ${implDir}`,
        mock_implementation_ratio: null,
        mock_locations: [],
        files_scanned: 0,
      };
    }
  }

  const out = {
    ok: okState === 'ok' || okState === 'degraded_mock',
    ok_state: okState,
    mode: 'execute',
    source,
    framework: resolved.framework,
    pass_count: parsed.pass_count,
    fail_count: parsed.fail_count,
    skip_count: parsed.skip_count,
    flaky_retries_count: runResult.flaky_retries_count ?? 0,
    result_hash: evidence.result_hash,
    evidence_path: evidencePath,
    mock_detect: mockReport,
  };

  if (args.json) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`[test-impl-pass-validator] framework=${resolved.framework} / pass=${parsed.pass_count} / fail=${parsed.fail_count} / skip=${parsed.skip_count} / flaky_retries=${runResult.flaky_retries_count ?? 0}`);
    console.log(`  result_hash: ${evidence.result_hash}`);
    console.log(`  evidence_path: ${evidencePath}`);
    if (mockReport && mockReport.mock_implementation_ratio !== null) {
      const scorePct = (mockReport.mock_implementation_ratio * 100).toFixed(2);
      const filePct = (mockReport.file_mock_ratio * 100).toFixed(1);
      const scoreThr = (mockReport.score_threshold * 100).toFixed(0);
      const fileThr = (mockReport.file_threshold * 100).toFixed(0);
      console.log(`  mock_detect: score=${scorePct}% (≥${scoreThr}%?) / file=${filePct}% (${mockReport.files_with_indicators}/${mockReport.files_scanned} ≥${fileThr}%?) / locations=${mockReport.mock_locations_total} / mode=${mockReport.mode}`);
      if (mockReport.exceeded) {
        console.log(`  ⚠️  mock threshold 초과 — chain 4 GREEN false signal 의심 (v8.8.0 Tier 1.1 / experimental)`);
      }
    }
    if (okState === 'ok') console.log('✅ 100% pass (gate #4 통과)');
    else if (okState === 'degraded_mock') console.log('⚠️  100% pass but mock_ratio 초과 — degraded_mock (experimental warning / chain blocking ❌)');
    else if (okState === 'fail_mock') console.log('❌ mock_ratio 초과 / enforce mode');
    else console.log(`❌ fail / fail_count=${parsed.fail_count}`);
  }
  // experimental mode = degraded_mock 는 exit 0 (warning only / chain blocking ❌)
  // enforce mode = fail_mock 은 exit 1
  const failExit = okState === 'fail' || okState === 'fail_mock';
  process.exit(failExit ? 1 : 0);
}

main();
