// Static runner core — 5 plugin host (Semgrep / PMD / SpotBugs / Daikon / CodeQL).
// 각 plugin 은 (a) preflight 환경 체크, (b) 실행, (c) SARIF 표준 출력 + 5종 물증 반환.
// no-simulation 정책: 환경 부재 시 LLM 추론으로 대체 절대 금지 — 명시적 "환경 부재" 보고만 허용.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, statSync, readFileSync } from 'node:fs';
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

export class PluginEnvironmentMissing extends Error {
	constructor(plugin, detail) {
		super(`[${plugin}] environment missing: ${detail}`);
		this.plugin = plugin;
		this.detail = detail;
		this.code = 'ENV_MISSING';
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
			const v = execFileSync(
				this.executable,
				this.versionArgs ?? ['--version'],
				{ encoding: 'utf-8', timeout: 10_000 },
			);
			return { ok: true, version: v.trim().split('\n')[0] };
		} catch (err) {
			throw new PluginEnvironmentMissing(
				this.name,
				err?.message ?? String(err),
			);
		}
	}

	run({ targetDir, outputDir, ruleset, extraRules, extraArgs }) {
		mkdirSync(outputDir, { recursive: true });
		const stdoutPath = join(outputDir, `${this.name}.stdout.log`);
		const stderrPath = join(outputDir, `${this.name}.stderr.log`);
		const sarifPath = join(outputDir, `${this.name}.sarif`);

		const args = this.mandatoryArgs({
			targetDir,
			sarifPath,
			ruleset,
			extraRules,
			extraArgs,
		});
		const reproductionCommand = `${this.executable} ${args.join(' ')}`;
		const t0 = Date.now();
		let exitCode = 0;
		let stdout = '',
			stderr = '';
		try {
			stdout = execFileSync(this.executable, args, {
				encoding: 'utf-8',
				maxBuffer: 64 * 1024 * 1024,
			});
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
		} catch {
			/* SARIF not produced — handled by caller */
		}

		const evidence = {
			tool_stdout_path: stdoutPath,
			tool_stderr_path: stderrPath,
			tool_version: this.preflight().version,
			invocation_timestamp: new Date(t0).toISOString(),
			duration_ms,
			result_hash: resultHash,
			reproduction_command: reproductionCommand,
		};
		return { plugin: this.name, exitCode, evidence, sarifPath };
	}
}

export const SemgrepPlugin = new Plugin({
	name: 'semgrep',
	executable: 'semgrep',
	versionArgs: ['--version'],
	mandatoryArgs: ({
		targetDir,
		sarifPath,
		ruleset,
		extraRules = [],
		extraArgs = [],
	}) => [
		'scan',
		'--config',
		ruleset ?? 'p/owasp-top-ten',
		...extraRules.flatMap((r) => ['--config', r]),
		'--sarif',
		'--sarif-output',
		sarifPath,
		...extraArgs,
		targetDir,
	],
});

export const PMDPlugin = new Plugin({
	name: 'pmd',
	executable: 'pmd',
	versionArgs: ['--version'],
	mandatoryArgs: ({ targetDir, sarifPath, ruleset, extraArgs = [] }) => [
		'check',
		'-d',
		targetDir,
		'-R',
		ruleset ?? 'rulesets/java/quickstart.xml',
		'-f',
		'sarif',
		'-r',
		sarifPath,
		...extraArgs,
	],
});

export const PLUGINS = {
	semgrep: SemgrepPlugin,
	pmd: PMDPlugin,
	// spotbugs / daikon / codeql: v1.2.x 또는 v1.3 후속 (Sprint 4 plugin skeleton 만, 실 구현 carry-over)
};
