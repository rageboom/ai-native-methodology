// codegraph-runner core
//
// ★ CodeGraph OSS (@colbymchenry/codegraph) 실제 실행 — analysis 단계 필수 도구.
//   DEC-2026-05-30-codegraph-essential: codegraph = Semgrep 동급 (R19 Tier 1 / no-simulation 무조건 실행).
//
//   ★ ★ ★ no-simulation 정책 (feedback_no_static_tool_simulation.md):
//     - 환경 부재 시 LLM 추론 대체 ❌ — CodeGraphEnvironmentMissing → exit 3 (정직 "환경 부재" 신호)만 허용.
//     - codegraph 는 SARIF 도구 아님 → index ( .codegraph/ SQLite 빌드) + status --json (통계) 모델.
//
//   ★ trust 모델 (DEC-2026-05-28 §4.2): codegraph 출력은 reference-lens / finding 으로만 수용.
//     본 runner 는 산출물(code-graph.json) 만 만들고 어떤 gate 에도 inject 하지 않는다 (manifest.trust_note).
//
//   REQUIRED_EVIDENCE / EVIDENCE_TRUST 의미 = tools/static-runner/src/runner.js 와 동일 (cross-ref).
//   import 결합 회피 위해 경량 자체 정의 (no-simulation 7-field evidence 정합).

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// ★ cross-platform CLI 호출 (Windows 전역 npm bin = codegraph.cmd shim).
//   Node 22 (CVE-2024-27980 완화) 에서 execFileSync('.cmd') = EINVAL → shell 경유 필수.
//   execSync 는 항상 shell 경유 (win=cmd.exe / posix=/bin/sh) → .cmd 정상 해석.
//   경로 인자는 quoting (공백 포함 경로 대응 / embedded quote 제거 = 주입 표면 최소화).
function q(p) {
  return `"${String(p).replace(/"/g, '')}"`;
}
// argString = 이미 적절히 quote 된 인자 문자열. exec 는 실행 파일명.
function cgExec(exec, argString, { timeout = 30_000, maxBuffer = 64 * 1024 * 1024 } = {}) {
  return execSync(`${exec} ${argString}`, { encoding: 'utf-8', timeout, maxBuffer });
}

// ★ static-runner REQUIRED_EVIDENCE 와 동일 7 field (no-simulation 물증 정합).
export const REQUIRED_EVIDENCE = [
  'tool_stdout_path',
  'tool_stderr_path',
  'tool_version',
  'invocation_timestamp',
  'duration_ms',
  'result_hash',
  'reproduction_command',
];

export const EVIDENCE_TRUST = Object.freeze({
  REAL_TOOL: 'real_tool',
  SIMULATED: 'simulated',
});

export const CODEGRAPH_EXECUTABLE = 'codegraph';

export class CodeGraphEnvironmentMissing extends Error {
  constructor(detail) {
    super(`[codegraph] environment missing: ${detail}`);
    this.detail = detail;
    this.code = 'ENV_MISSING';
  }
}

// codegraph --version → throws CodeGraphEnvironmentMissing if absent (no-simulation 정직 신호).
export function preflight(exec = CODEGRAPH_EXECUTABLE) {
  try {
    const v = cgExec(exec, '--version', { timeout: 10_000 });
    return { ok: true, version: v.trim().split('\n')[0] };
  } catch (err) {
    throw new CodeGraphEnvironmentMissing(err?.message ?? String(err));
  }
}

// codegraph status <targetDir> --json → parsed object.
// 미초기화 시 { initialized:false, projectPath } 반환 (codegraph CLI 계약).
export function readStatus(targetDir, exec = CODEGRAPH_EXECUTABLE) {
  const out = cgExec(exec, `status ${q(targetDir)} --json`, { timeout: 30_000 });
  return JSON.parse(out.trim());
}

// 실제 codegraph 실행: (init -i | index) → status --json. 7-field evidence + real_tool.
export function runCodeGraph({ targetDir, outputDir, exec = CODEGRAPH_EXECUTABLE }) {
  mkdirSync(outputDir, { recursive: true });
  const version = preflight(exec).version; // 환경 부재 시 throw (no-simulation)

  const stdoutPath = join(outputDir, 'codegraph.stdout.log');
  const stderrPath = join(outputDir, 'codegraph.stderr.log');

  // 초기화 여부 판단 → init -i (최초) vs index (재인덱싱).
  let pre;
  try { pre = readStatus(targetDir, exec); } catch { pre = { initialized: false }; }
  const indexArgString = pre.initialized ? `index ${q(targetDir)}` : `init -i ${q(targetDir)}`;
  const reproductionCommand = `${exec} ${indexArgString} && ${exec} status ${q(targetDir)} --json`;

  const t0 = Date.now();
  let stdout = '', stderr = '', exitCode = 0;
  try {
    stdout = cgExec(exec, indexArgString, { timeout: 600_000 });
  } catch (err) {
    exitCode = err.status ?? 1;
    stdout = err.stdout?.toString?.() ?? '';
    stderr = err.stderr?.toString?.() ?? String(err.message ?? err);
  }
  const duration_ms = Date.now() - t0;
  writeFileSync(stdoutPath, stdout);
  writeFileSync(stderrPath, stderr);

  const status = readStatus(targetDir, exec); // 최종 통계
  // result_hash = 결정적 graph 통계 요약 해시 (재현 가능).
  const result_hash = createHash('sha256').update(JSON.stringify(status)).digest('hex');

  const evidence = {
    tool_stdout_path: stdoutPath,
    tool_stderr_path: stderrPath,
    tool_version: version,
    invocation_timestamp: new Date(t0).toISOString(),
    duration_ms,
    result_hash,
    reproduction_command: reproductionCommand,
    evidence_trust: EVIDENCE_TRUST.REAL_TOOL,
  };
  return { status, evidence, exitCode };
}
