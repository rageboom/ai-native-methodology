// load-test-cmd — `.aimd/config/test-cmd.json` 우선 + inventory.stack_signals 자동 추론.
// ADR-CHAIN-004 §1 + §2 정합.

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

// ADR-CHAIN-004 §2 — inventory.stack_signals → inferred test_cmd.
const STACK_INFERENCE = [
  { match: ['nodejs', 'jest'],     test_cmd: 'npm',     test_cmd_args: ['test'],                       framework: 'jest',     timeout_ms: 600000  },
  { match: ['nodejs', 'vitest'],   test_cmd: 'npx',     test_cmd_args: ['vitest', 'run'],              framework: 'vitest',   timeout_ms: 600000  },
  { match: ['nodejs', 'mocha'],    test_cmd: 'npx',     test_cmd_args: ['mocha'],                      framework: 'mocha',    timeout_ms: 600000  },
  { match: ['nestjs'],             test_cmd: 'npm',     test_cmd_args: ['run', 'test:e2e'],            framework: 'jest',     timeout_ms: 1200000 },
  { match: ['java', 'maven'],      test_cmd: 'mvn',     test_cmd_args: ['-B', 'test'],                 framework: 'junit5',   timeout_ms: 1200000 },
  { match: ['java', 'gradle'],     test_cmd: './gradlew', test_cmd_args: ['test', '--no-daemon'],      framework: 'junit5',   timeout_ms: 1200000 },
  { match: ['python', 'pytest'],   test_cmd: 'python',  test_cmd_args: ['-m', 'pytest', '--tb=short'], framework: 'pytest',   timeout_ms: 600000  },
  { match: ['go'],                 test_cmd: 'go',      test_cmd_args: ['test', './...', '-count=1'],  framework: 'go-test',  timeout_ms: 600000  },
];

export function inferFromStackSignals(signals = []) {
  const lower = signals.map(s => String(s).toLowerCase());
  for (const rule of STACK_INFERENCE) {
    const allMatch = rule.match.every(token => lower.some(s => s.includes(token)));
    if (allMatch) {
      return {
        framework: rule.framework,
        test_cmd: rule.test_cmd,
        test_cmd_args: [...rule.test_cmd_args],
        timeout_ms: rule.timeout_ms,
        flaky_retry_per_test: 2,
        report_format: 'json',
        allow_execute: false,
        inference_source: 'inventory.stack_signals',
      };
    }
  }
  return null;
}

/**
 * Load test-cmd contract.
 * Priority:
 *   1. CLI override (cliCmd) — caller should already build a partial config.
 *   2. .aimd/config/test-cmd.json (sourceProjectDir).
 *   3. inventory.stack_signals 자동 추론.
 *   4. null (사용자 명시 의무 / 추론 불가).
 */
export function loadTestCmd({ sourceProjectDir, inventory, cliOverride }) {
  let resolved = null;
  let source = 'unresolved';

  if (cliOverride && cliOverride.test_cmd) {
    resolved = { ...cliOverride };
    source = 'cli-override';
  } else {
    const cfgPath = join(sourceProjectDir, '.aimd', 'config', 'test-cmd.json');
    if (existsSync(cfgPath)) {
      try {
        resolved = JSON.parse(readFileSync(cfgPath, 'utf-8'));
        source = `config:${cfgPath}`;
      } catch (e) {
        return { resolved: null, source: 'config-parse-error', error: e.message };
      }
    }
  }

  if (!resolved && inventory && Array.isArray(inventory.stack_signals)) {
    resolved = inferFromStackSignals(inventory.stack_signals);
    if (resolved) source = 'inventory-inference';
  }

  if (!resolved) {
    return {
      resolved: null,
      source,
      error: '★ no test-cmd contract — `.aimd/config/test-cmd.json` 신설 또는 --test-cmd 명시 의무 (ADR-CHAIN-004 §1)',
    };
  }

  // defaults
  resolved.test_cmd_args = resolved.test_cmd_args ?? [];
  resolved.timeout_ms = resolved.timeout_ms ?? 600000;
  resolved.flaky_retry_per_test = resolved.flaky_retry_per_test ?? 2;
  resolved.report_format = resolved.report_format ?? 'json';
  resolved.allow_execute = resolved.allow_execute ?? false;

  return { resolved, source };
}
