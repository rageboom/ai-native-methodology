// static-runner core
//
// ★ v8.6.0 — Tier 1 (in-plugin native) = Semgrep 단일.
//   Tier 2 (imported SARIF) = 사용자 CI/환경 실행 후 SARIF 결과 import (PMD / SpotBugs / CodeQL / Daikon).
//   Tier 3 (simulated) = 영구 reject (★ no-simulation 정책 enforcement).
//
//   ★ ★ ★ no-simulation 정책 (feedback_no_static_tool_simulation.md):
//     - 환경 부재 시 LLM 추론 대체 ❌ — 명시적 "환경 부재" 보고만 허용.
//     - import 패턴은 사용자가 진짜 사용자 환경에서 실행한 SARIF 결과를 흡수하는 경로 (no-sim 정합).
//     - SARIF driver.name allowlist + 빈 results reject + non_use_rationale 의무 = 우회 표면 차단.
//
// charter R19 (Tool Ecosystem Dependency Classification) 정합.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export const REQUIRED_EVIDENCE = [
  'tool_stdout_path',
  'tool_stderr_path',
  'tool_version',
  'invocation_timestamp',
  'duration_ms',
  'result_hash',
  'reproduction_command',
];

// ★ R19 Tier 2 — imported SARIF driver.name allowlist (대소문자 무관).
// allowlist 외 driver = 'manual' / 'ai-generated' / 미명시 → reject.
export const IMPORTED_DRIVER_ALLOWLIST = ['pmd', 'spotbugs', 'codeql', 'daikon'];

// ★ evidence_trust 등급 (Senior STRONG-STOP 흡수 / chain-strict mode 격상).
export const EVIDENCE_TRUST = Object.freeze({
  REAL_TOOL: 'real_tool',
  IMPORTED_SARIF: 'imported_sarif',
  SIMULATED: 'simulated',
});

export class PluginEnvironmentMissing extends Error {
  constructor(plugin, detail) {
    super(`[${plugin}] environment missing: ${detail}`);
    this.plugin = plugin;
    this.detail = detail;
    this.code = 'ENV_MISSING';
  }
}

export class ImportSarifRejected extends Error {
  constructor(reason, detail) {
    super(`[import-sarif rejected] ${reason}: ${detail}`);
    this.reason = reason;
    this.detail = detail;
    this.code = 'IMPORT_REJECTED';
  }
}

export class Plugin {
  constructor({ name, executable, mandatoryArgs, versionArgs }) {
    this.name = name;
    this.executable = executable;
    this.mandatoryArgs = mandatoryArgs;
    this.versionArgs = versionArgs;
  }

  preflight() {
    try {
      const v = execFileSync(this.executable, this.versionArgs ?? ['--version'], { encoding: 'utf-8', timeout: 10_000 });
      return { ok: true, version: v.trim().split('\n')[0] };
    } catch (err) {
      throw new PluginEnvironmentMissing(this.name, err?.message ?? String(err));
    }
  }

  run({ targetDir, outputDir, ruleset, extraRules, extraArgs }) {
    mkdirSync(outputDir, { recursive: true });
    const stdoutPath = join(outputDir, `${this.name}.stdout.log`);
    const stderrPath = join(outputDir, `${this.name}.stderr.log`);
    const sarifPath = join(outputDir, `${this.name}.sarif`);

    const args = this.mandatoryArgs({ targetDir, sarifPath, ruleset, extraRules, extraArgs });
    const reproductionCommand = `${this.executable} ${args.join(' ')}`;
    const t0 = Date.now();
    let exitCode = 0;
    let stdout = '', stderr = '';
    try {
      stdout = execFileSync(this.executable, args, { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
    } catch (err) {
      exitCode = err.status ?? 1;
      stdout = err.stdout?.toString?.() ?? '';
      stderr = err.stderr?.toString?.() ?? String(err.message ?? err);
    }
    const duration_ms = Date.now() - t0;
    writeFileSync(stdoutPath, stdout);
    writeFileSync(stderrPath, stderr);

    let resultHash = null;
    try {
      const h = createHash('sha256');
      h.update(readFileSync(sarifPath));
      resultHash = h.digest('hex');
    } catch { /* SARIF not produced — handled by caller */ }

    const evidence = {
      tool_stdout_path: stdoutPath,
      tool_stderr_path: stderrPath,
      tool_version: this.preflight().version,
      invocation_timestamp: new Date(t0).toISOString(),
      duration_ms,
      result_hash: resultHash,
      reproduction_command: reproductionCommand,
      evidence_trust: EVIDENCE_TRUST.REAL_TOOL,
    };
    return { plugin: this.name, exitCode, evidence, sarifPath };
  }
}

export const SemgrepPlugin = new Plugin({
  name: 'semgrep',
  executable: 'semgrep',
  versionArgs: ['--version'],
  mandatoryArgs: ({ targetDir, sarifPath, ruleset, extraRules = [], extraArgs = [] }) => [
    'scan',
    '--config', ruleset ?? 'p/owasp-top-ten',
    ...extraRules.flatMap(r => ['--config', r]),
    '--sarif',
    '--sarif-output', sarifPath,
    ...extraArgs,
    targetDir,
  ],
});

export const PLUGINS = {
  semgrep: SemgrepPlugin,
};

// ★ R19 Tier 2 — imported SARIF 결과 흡수 (사용자 CI/환경 위임).
// 4 조건 schema-level 강제:
//   (1) driver.name allowlist 검증
//   (2) results.length > 0 또는 non_use_rationale 첨부 의무
//   (3) reproduction_command 명시 의무 (SARIF runs[].invocations[].commandLine 또는 user 명시)
//   (4) evidence_trust = imported_sarif (real_tool 과 결정적 구분)
export function importSarif({ sarifPath, expectedDriver, nonUseRationale, reproductionCommand, outputDir }) {
  if (!sarifPath || !existsSync(sarifPath)) {
    throw new ImportSarifRejected('sarif_path_missing', `not a file: ${sarifPath}`);
  }
  const text = readFileSync(sarifPath, 'utf-8');
  let sarif;
  try { sarif = JSON.parse(text); }
  catch (e) { throw new ImportSarifRejected('sarif_parse_error', e.message); }

  const runs = sarif.runs ?? [];
  if (runs.length === 0) {
    throw new ImportSarifRejected('sarif_empty_runs', 'sarif.runs[] is empty');
  }

  // (1) driver.name allowlist
  const driverNames = runs.map(r => r.tool?.driver?.name?.toLowerCase() ?? null);
  const rejectedDrivers = driverNames.filter(d => !d || !IMPORTED_DRIVER_ALLOWLIST.includes(d));
  if (rejectedDrivers.length > 0) {
    throw new ImportSarifRejected(
      'driver_name_not_allowlisted',
      `drivers=[${driverNames.join(',')}] / allowlist=[${IMPORTED_DRIVER_ALLOWLIST.join(',')}] / null·manual·ai-generated reject`,
    );
  }
  if (expectedDriver && !driverNames.includes(expectedDriver.toLowerCase())) {
    throw new ImportSarifRejected(
      'driver_name_mismatch',
      `expected=${expectedDriver} / actual=[${driverNames.join(',')}]`,
    );
  }

  // (2) results.length > 0 또는 non_use_rationale 의무
  const totalResults = runs.reduce((sum, r) => sum + (r.results?.length ?? 0), 0);
  if (totalResults === 0 && !nonUseRationale) {
    throw new ImportSarifRejected(
      'empty_sarif_without_rationale',
      'results=[] 시 non_use_rationale 첨부 의무 (Adzic SBE 함정 회피 / F-SIM-004 정합)',
    );
  }

  // (3) reproduction_command 명시 의무 (SARIF invocations 또는 user 명시)
  const sarifCmd = runs[0].invocations?.[0]?.commandLine ?? null;
  const finalReproCmd = reproductionCommand ?? sarifCmd;
  if (!finalReproCmd) {
    throw new ImportSarifRejected(
      'reproduction_command_missing',
      'SARIF invocations[].commandLine 부재 + --reproduction-command 미명시 (재현 가능성 0 = 신뢰 ❌)',
    );
  }

  // 4 조건 통과 → evidence record 생성
  const t0 = Date.now();
  const h = createHash('sha256');
  h.update(text);
  const resultHash = h.digest('hex');

  // stdout/stderr 파일 = 사용자 환경 실행 결과 외부 / static-runner 출력 dir 에 SARIF copy 만 보존
  const driverPrimary = driverNames[0];
  mkdirSync(outputDir, { recursive: true });
  const sarifCopyPath = join(outputDir, `${driverPrimary}.imported.sarif`);
  writeFileSync(sarifCopyPath, text);

  const toolVersion = runs[0].tool?.driver?.version
    ?? runs[0].tool?.driver?.semanticVersion
    ?? 'unspecified';

  const evidence = {
    tool_stdout_path: null,   // ★ import 패턴 = 사용자 환경 stdout 부재 (정직 표기 / 시뮬 ❌)
    tool_stderr_path: null,   // ★ 동일
    tool_version: toolVersion,
    invocation_timestamp: runs[0].invocations?.[0]?.startTimeUtc ?? new Date(t0).toISOString(),
    duration_ms: null,        // ★ 환산 보류 (SARIF endTimeUtc - startTimeUtc 가능 시 보강 carry)
    result_hash: resultHash,
    reproduction_command: finalReproCmd,
    evidence_trust: EVIDENCE_TRUST.IMPORTED_SARIF,
    imported_driver_name: driverPrimary,
    imported_results_count: totalResults,
    non_use_rationale: nonUseRationale ?? null,
  };
  return { plugin: driverPrimary, exitCode: 0, evidence, sarifPath: sarifCopyPath };
}
