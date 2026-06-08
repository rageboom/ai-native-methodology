// static-runner core
//
// v8.6.0 — Tier 1 (in-plugin native) = Semgrep 단일.
//   Tier 2 (imported SARIF) = 사용자 CI/환경 실행 후 SARIF 결과 import (PMD = 실 import 입증 driver / poc-17).
//   Tier 3 (simulated) = 영구 reject (no-simulation 정책 enforcement).
//
//   no-simulation 정책 (feedback_no_static_tool_simulation.md):
//     - 환경 부재 시 LLM 추론 대체 ❌ — 명시적 "환경 부재" 보고만 허용.
//     - import 패턴은 사용자가 진짜 사용자 환경에서 실행한 SARIF 결과를 흡수하는 경로 (no-sim 정합).
//     - SARIF driver.name allowlist + 빈 results reject + non_use_rationale 의무 = 우회 표면 차단.
//
// charter R19 (Tool Ecosystem Dependency Classification) 정합.

import { execFileSync } from 'node:child_process';
import {
	writeFileSync,
	mkdirSync,
	statSync,
	readFileSync,
	existsSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// plugin-local 자동설치 도구 발견 (install-static-tools.js 와 동일 root 규약).
//   install-static-tools.js 가 Java 존재 시 PMD zip 을 .aimd-install/ 에 풀고
//   bin dir 절대경로를 .pmd-bin-dir marker 에 기록 → runner 가 child PATH 에 prepend.
//   사용자 shell PATH 영구수정 불가 → runner 자동실행 경로만 해결 (DEC-2026-06-07 후속).
const PLUGIN_ROOT =
	process.env.CLAUDE_PLUGIN_ROOT ||
	resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
const MARKER_DIR = join(PLUGIN_ROOT, '.aimd-install');

// .pmd-bin-dir marker → 유효한 PMD bin 디렉터리 또는 null (결정적).
export function localPmdBinDir() {
	try {
		const marker = join(MARKER_DIR, '.pmd-bin-dir');
		if (!existsSync(marker)) return null;
		const dir = readFileSync(marker, 'utf-8').trim();
		if (!dir) return null;
		const launcher = join(dir, process.platform === 'win32' ? 'pmd.bat' : 'pmd');
		return existsSync(launcher) ? dir : null;
	} catch {
		return null;
	}
}

// extraDirs 를 PATH 앞에 prepend 한 env 반환. 빈 배열/undefined → process.env 그대로
// (Semgrep 등 기존 plugin 무영향 / backward-compatible).
export function augmentEnv(extraDirs) {
	if (!extraDirs || extraDirs.length === 0) return process.env;
	const sep = process.platform === 'win32' ? ';' : ':';
	const cur = process.env.PATH || process.env.Path || '';
	return { ...process.env, PATH: extraDirs.join(sep) + sep + cur };
}

export const REQUIRED_EVIDENCE = [
	'tool_stdout_path',
	'tool_stderr_path',
	'tool_version',
	'invocation_timestamp',
	'duration_ms',
	'result_hash',
	'reproduction_command',
];

// R19 Tier 2 — imported SARIF driver.name allowlist (대소문자 무관).
// allowlist 외 driver = 'manual' / 'ai-generated' / 미명시 → reject.
// PMD only — 본 환경에서 실 import 입증된 driver 만 등재 (poc-17 user-env).
//   SpotBugs/CodeQL/Daikon/SonarQube 는 실행·import 이력 0 → "진짜 도구" 나열 = no-simulation
//   위반(feedback_no_unrunnable_tool_citation) → 제거. 필요 시 사용자가 명시 확장 (DEC-2026-06-06-tool-allowlist-pmd-only).
export const IMPORTED_DRIVER_ALLOWLIST = ['pmd'];

// evidence_trust 등급 (Senior STRONG-STOP 흡수 / chain-strict mode 격상).
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
	constructor({
		name,
		executable,
		mandatoryArgs,
		versionArgs,
		shell = false,
		versionParse,
		extraPathDirs,
	}) {
		this.name = name;
		this.executable = executable;
		this.mandatoryArgs = mandatoryArgs;
		this.versionArgs = versionArgs;
		// shell=true: Windows .bat/.cmd 런처(PMD pmd.bat 등) 호출 시 필수.
		//   Node 18.20+/20.12+/22+ 에서 execFileSync('.bat') = EINVAL (CVE-2024-27980) → shell 경유 필요.
		//   default false → Semgrep(네이티브 실행파일) 등 기존 plugin 무영향 (backward-compatible).
		this.shell = shell;
		// extraPathDirs: () => string[] — plugin-local 자동설치 bin 디렉터리.
		//   child process PATH 앞에 prepend (preflight/run 양쪽). 미지정 → PATH 불변.
		this.extraPathDirs = extraPathDirs;
		// versionParse: --version stdout → 버전 문자열 추출 콜백.
		//   default = 첫 줄(Semgrep 등 첫 줄에 버전 출력하는 도구). PMD 처럼 ASCII 배너를
		//   먼저 출력하는 도구는 semver 정규식 override 로 정확 추출 (no-simulation 물증 정합).
		this.versionParse = versionParse ?? ((out) => out.trim().split('\n')[0]);
	}

	preflight() {
		try {
			const v = execFileSync(
				this.executable,
				this.versionArgs ?? ['--version'],
				{
					encoding: 'utf-8',
					timeout: 10_000,
					shell: this.shell,
					env: augmentEnv(this.extraPathDirs?.()),
				},
			);
			return { ok: true, version: this.versionParse(v) };
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
				shell: this.shell,
				env: augmentEnv(this.extraPathDirs?.()),
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
			evidence_trust: EVIDENCE_TRUST.REAL_TOOL,
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

// PMD in-plugin 자동 실행 (R19 Tier 1 / DEC-2026-06-07-pmd-tier1-promotion).
//   Tier 1 축 = "실행 locus"(plugin 직접 실행) — JVM 의존 도구(Gradle/JUnit 테스트 러너 동형)도 Tier 1.
//   전제: PMD on PATH + JAVA_HOME(또는 java on PATH). PMD 부재 시 → install-static-tools.js 가
//     Java 존재 시 PMD zip 을 .aimd-install/ 에 자동설치 → extraPathDirs 가 child PATH 로 노출.
//     Java 부재 시 = 설치 안 함(JVM user-owned / 부트스트랩 ❌) → preflight PluginEnvironmentMissing
//     → cli exit 3 (정직 "환경 부재" 신호 / no-simulation / "항상 자동실행" 아님).
//   Windows pmd.bat 런처 → shell:true 필수. PMD 7.x: check -d <dir> -R <ruleset> -f sarif -r <file>.
//   exit 4 = 위반 발견(정상) / 5 = recoverable error — runner.run() catch 가 흡수 후 SARIF 해시 진행 (Semgrep 동형).
//   §8.1 corroboration: poc-06(legacy Spring4.1) + poc-10(modern JPA) in-plugin auto-run 입증.
//     auto-install(v0.21.0) dogfood: poc-08(modern MyBatis3 jpetstore) — ensurePmd→PMD 7.25.0 다운로드→runner 발견→실 scan 6 findings(real_tool / 2nd modern 스택).
//   import 경로(Tier 2 SARIF import allowlist=['pmd'])는 orthogonal 로 보존 — PMD = in-plugin 자동 + 사용자 CI import 양쪽 유효.
export const PmdPlugin = new Plugin({
	name: 'pmd',
	executable: 'pmd',
	shell: true,
	versionArgs: ['--version'],
	// plugin-local 자동설치 PMD(.aimd-install/pmd/.../bin) 발견 → child PATH prepend.
	extraPathDirs: () => {
		const d = localPmdBinDir();
		return d ? [d] : [];
	},
	// PMD --version 은 ASCII 배너를 먼저 출력 → 첫 줄 = 배너. semver 패턴으로 정확 추출.
	versionParse: (out) => {
		const m = out.match(/PMD\s+(\d+\.\d+\.\d+\S*)/) ?? out.match(/\b(\d+\.\d+\.\d+\S*)/);
		return m ? `PMD ${m[1]}` : out.trim().split('\n').pop();
	},
	mandatoryArgs: ({
		targetDir,
		sarifPath,
		ruleset,
		extraRules = [],
		extraArgs = [],
	}) => [
		'check',
		'-d',
		targetDir,
		'-R',
		ruleset ?? 'rulesets/java/quickstart.xml',
		...extraRules.flatMap((r) => ['-R', r]),
		'-f',
		'sarif',
		'-r',
		sarifPath,
		'--no-progress',
		...extraArgs,
	],
});

export const PLUGINS = {
	semgrep: SemgrepPlugin,
	pmd: PmdPlugin,
};

// R19 Tier 2 — imported SARIF 결과 흡수 (사용자 CI/환경 위임).
// 4 조건 schema-level 강제:
//   (1) driver.name allowlist 검증
//   (2) results.length > 0 또는 non_use_rationale 첨부 의무
//   (3) reproduction_command 명시 의무 (SARIF runs[].invocations[].commandLine 또는 user 명시)
//   (4) evidence_trust = imported_sarif (real_tool 과 결정적 구분)
export function importSarif({
	sarifPath,
	expectedDriver,
	nonUseRationale,
	reproductionCommand,
	outputDir,
}) {
	if (!sarifPath || !existsSync(sarifPath)) {
		throw new ImportSarifRejected(
			'sarif_path_missing',
			`not a file: ${sarifPath}`,
		);
	}
	const text = readFileSync(sarifPath, 'utf-8');
	let sarif;
	try {
		sarif = JSON.parse(text);
	} catch (e) {
		throw new ImportSarifRejected('sarif_parse_error', e.message);
	}

	const runs = sarif.runs ?? [];
	if (runs.length === 0) {
		throw new ImportSarifRejected('sarif_empty_runs', 'sarif.runs[] is empty');
	}

	// (1) driver.name allowlist
	const driverNames = runs.map(
		(r) => r.tool?.driver?.name?.toLowerCase() ?? null,
	);
	const rejectedDrivers = driverNames.filter(
		(d) => !d || !IMPORTED_DRIVER_ALLOWLIST.includes(d),
	);
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
	const totalResults = runs.reduce(
		(sum, r) => sum + (r.results?.length ?? 0),
		0,
	);
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

	const toolVersion =
		runs[0].tool?.driver?.version ??
		runs[0].tool?.driver?.semanticVersion ??
		'unspecified';

	const evidence = {
		tool_stdout_path: null, // import 패턴 = 사용자 환경 stdout 부재 (정직 표기 / 시뮬 ❌)
		tool_stderr_path: null, // 동일
		tool_version: toolVersion,
		invocation_timestamp:
			runs[0].invocations?.[0]?.startTimeUtc ?? new Date(t0).toISOString(),
		duration_ms: null, // 환산 보류 (SARIF endTimeUtc - startTimeUtc 가능 시 보강 carry)
		result_hash: resultHash,
		reproduction_command: finalReproCmd,
		evidence_trust: EVIDENCE_TRUST.IMPORTED_SARIF,
		imported_driver_name: driverPrimary,
		imported_results_count: totalResults,
		non_use_rationale: nonUseRationale ?? null,
	};
	return {
		plugin: driverPrimary,
		exitCode: 0,
		evidence,
		sarifPath: sarifCopyPath,
	};
}
