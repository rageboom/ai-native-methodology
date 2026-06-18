#!/usr/bin/env node
/**
 * preflight-check — chain harness 외부 도구 환경 검사 (F-V2-05 fix / v8.5.0+).
 *
 * Plugin 의 no-simulation 정책 (R15) 정합 — Semgrep / PMD / Maven / Java 등 외부 도구는
 * "real 실행" 의무. 그러나 환경 부재 시 chain 3/4 의 RED/GREEN proof 측정 차단 →
 * 사용자가 release 직전 본 check 로 환경 진단 가능.
 *
 * 사용:
 *   node scripts/preflight-check.js [--stack java-spring|node-nestjs|python-fastapi|fe-react|all]
 *                                   [--json]
 *
 * exit code:
 *   0 — core 도구 (node ≥18) 모두 존재 (stack-specific 도구는 warning 만)
 *   1 — core 도구 부재
 *   2 — usage error
 *
 * stack 별 expected 도구:
 *   - java-spring: mvn, javac (JDK ≥1.8)
 *   - node-nestjs: npm, npx
 *   - python-fastapi: python3, pip
 *   - fe-react: npm, npx, (eslint, prettier — local install)
 *   - all (default): 위 합집합 + Semgrep, PMD, Spectral, axe-core
 *
 * 참조: ADR-CHAIN-001 §3 (no-simulation), F-V2-05 (검증 환경 vs release 환경 분리),
 *       finding F-SIM-005 (external tool absent fail_mode).
 */

import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// DEC-2026-06-18 — tool probe 무한 hang 차단. `<tool> --version` 은 정상이면 즉시(<2s) 반환하지만,
// semgrep 등 일부 도구는 실행 시 네트워크/업데이트 호출을 하고 사내망 SSL 차단 시 무응답 → 동기
// spawnSync 가 영원히 블록 → release-readiness check#14 전체 hang(외부 30s timeout 도 node-blocked-in-
// sync-spawn 은 SIGTERM 처리 불가라 무력). 내부 timeout 으로 libuv 가 도구 프로세스를 직접 kill →
// 무응답 도구는 absent(timed_out) 정직 처리하고 진행. (R19 "환경 부재 = 정직 신호" 의도 보존 / hang ❌.)
export const TOOL_PROBE_TIMEOUT_MS =
	Number(process.env.CONTEXT_OPS_PREFLIGHT_TIMEOUT_MS) || 10000;

const TOOLS = {
	// core (없으면 exit 1)
	node: {
		kind: 'core',
		cmd: 'node',
		versionFlag: '--version',
		minVersion: '18',
	},
	npm: { kind: 'core', cmd: 'npm', versionFlag: '--version' },

	// BE Java/Spring stack
	mvn: {
		kind: 'be-java',
		cmd: 'mvn',
		versionFlag: '--version',
		fallback:
			'gradle (alternative Java build) 또는 manual javac 컴파일 (chain 4 GREEN 측정 약화)',
	},
	javac: {
		kind: 'be-java',
		cmd: 'javac',
		versionFlag: '--version',
		fallback:
			'sdkman install java + JDK 1.8+ (chain 4 빌드 의무 도구 / 대체 없음)',
	},

	// Python
	python3: {
		kind: 'be-py',
		cmd: 'python3',
		versionFlag: '--version',
		fallback: 'python2 (deprecated / chain 3/4 거의 회피)',
	},
	pip: {
		kind: 'be-py',
		cmd: 'pip',
		versionFlag: '--version',
		fallback: 'python3 -m pip 또는 pipx (chain 3/4 의존성 설치 대체 가능)',
	},

	// analysis stage external (no-simulation 의무)
	semgrep: {
		kind: 'analysis',
		cmd: 'semgrep',
		versionFlag: '--version',
		// DEC-2026-06-18 — runner 와 동일 오프라인 env 로 탐지. naked `semgrep --version` 은 version-check
		// 네트워크 호출을 하고 egress 차단 사내망서 ~96s+ 무응답(F-DOGFOOD-016) → 거짓 absent/hang.
		// static-runner 가 실제 스캔 시 쓰는 env(runner.js extraEnv)를 probe 에도 적용 = "쓰는 방식대로 탐지".
		probeEnv: { SEMGREP_ENABLE_VERSION_CHECK: '0', SEMGREP_SEND_METRICS: 'off' },
		fallback:
			'사내 SSL 차단 시 local rules (e.g. tools/static-runner/rules/legacy-korean/*.yml + 자체 -f inline rule) / cycle-2~7 cache 영구화 paradigm',
	},
	pmd: {
		kind: 'analysis',
		cmd: 'pmd',
		versionFlag: '--version',
		fallback:
			'Java 존재 시 SessionStart hook(install-static-tools.js)이 PMD dist zip 자동설치(.static-tools/) — Java 부재 시 정직 carry(JVM 부트스트랩 ❌). 수동: PMD 7.x (https://pmd.github.io) 또는 sdkman install pmd / 대체: ast-grep + Checkstyle (CyclomaticComplexity = lizard)',
	},
	spectral: {
		kind: 'analysis',
		cmd: 'spectral',
		versionFlag: '--version',
		fallback:
			'npx @stoplight/spectral-cli (one-shot / SSL 차단 시 사전 npm pack 캐시)',
	},
	spotbugs: {
		kind: 'analysis',
		cmd: 'spotbugs',
		versionFlag: '-version',
		fallback:
			'sdkman install spotbugs 또는 SARIF import path (이미 chain harness R19 지원)',
	},

	// v8.8.0 — Tier 5.1 추가 (선택 도구 / fallback hint 만 제공)
	'osv-scanner': {
		kind: 'analysis-opt',
		cmd: 'osv-scanner',
		versionFlag: '--version',
		fallback:
			'npm audit (Node) / mvn dependency-check (Java) / pip-audit (Python) / Snyk Free (signup) / NVD CVE manual lookup',
	},
	lizard: {
		kind: 'analysis-opt',
		cmd: 'lizard',
		versionFlag: '--version',
		fallback:
			'PMD CyclomaticComplexity (Java) 또는 ast-grep + 자체 분기 count (cycle-7 paradigm)',
	},
	'ast-grep': {
		kind: 'analysis-opt',
		cmd: 'ast-grep',
		versionFlag: '--version',
		fallback:
			'cargo install ast-grep --locked 또는 npm i -g @ast-grep/cli (TS/JS pattern) / Semgrep 일부 대체 가능',
	},
	xmllint: {
		kind: 'analysis-opt',
		cmd: 'xmllint',
		versionFlag: '--version',
		fallback:
			'apt/brew install libxml2-utils (sql-inventory-validator L2 의무 도구 / cycle-4~7 R15 silent enabler 차단)',
	},
};

export function checkTool(name, spec, timeoutMs = TOOL_PROBE_TIMEOUT_MS) {
	const probe = spawnSync(spec.cmd, [spec.versionFlag], {
		encoding: 'utf-8',
		shell: true,
		// (1) 1차 = 정확한 탐지: 도구를 "실제 쓰는 방식"의 env 로 probe (spec.probeEnv) — 예: semgrep 은
		//     runner 와 동일 오프라인 env 라 version-check 네트워크 hang 없이 즉시 present 로 탐지(거짓 absent ❌).
		env: spec.probeEnv ? { ...process.env, ...spec.probeEnv } : process.env,
		// (2) 2차 = 백스톱: probeEnv 로도 무응답인 도구가 게이트 전체를 hang 시키지 않도록 상한 (DEC-2026-06-18).
		timeout: timeoutMs,
	});
	if (probe.status === 0 || (probe.stdout && probe.stdout.trim())) {
		const version = (probe.stdout || probe.stderr || '').split('\n')[0].trim();
		return {
			name,
			kind: spec.kind,
			installed: true,
			version,
			status: 'ok',
			fallback: null,
		};
	}
	// timeout = 도구는 설치돼 있으나 --version 이 무응답(네트워크/SSL/stdin 블록 추정) → hang 방지 위해
	// absent 로 처리하되 "미설치"와 구분되게 timed_out 표기(정직 신호). core 아닌 도구라 게이트는 경고만.
	const timedOut =
		probe.error?.code === 'ETIMEDOUT' || probe.signal === 'SIGTERM';
	return {
		name,
		kind: spec.kind,
		installed: false,
		version: null,
		status: 'absent',
		timed_out: timedOut || undefined,
		fallback: timedOut
			? `probe ${Math.round(timeoutMs / 1000)}s 무응답 → absent 처리 (네트워크/SSL 차단 또는 stdin 블록 추정 — 예: semgrep 사내망 version-check). ${spec.fallback || ''}`.trim()
			: spec.fallback || null,
	};
}

function main() {
	const args = process.argv.slice(2);
	if (args.includes('--help') || args.includes('-h')) {
		console.log(
			`usage: preflight-check [--stack java-spring|node-nestjs|python-fastapi|fe-react|all] [--json]`,
		);
		process.exit(2);
	}
	const stackIdx = args.indexOf('--stack');
	const stack = stackIdx >= 0 ? args[stackIdx + 1] : 'all';
	const jsonOutput = args.includes('--json');

	const results = [];
	for (const [name, spec] of Object.entries(TOOLS)) {
		if (stack !== 'all') {
			if (
				stack === 'java-spring' &&
				!(
					spec.kind === 'core' ||
					spec.kind === 'be-java' ||
					spec.kind === 'analysis' ||
					spec.kind === 'analysis-opt'
				)
			)
				continue;
			if (
				stack === 'node-nestjs' &&
				!(
					spec.kind === 'core' ||
					spec.kind === 'analysis' ||
					spec.kind === 'analysis-opt'
				)
			)
				continue;
			if (
				stack === 'python-fastapi' &&
				!(
					spec.kind === 'core' ||
					spec.kind === 'be-py' ||
					spec.kind === 'analysis' ||
					spec.kind === 'analysis-opt'
				)
			)
				continue;
			if (
				stack === 'fe-react' &&
				!(
					spec.kind === 'core' ||
					spec.kind === 'analysis' ||
					spec.kind === 'analysis-opt'
				)
			)
				continue;
		}
		results.push(checkTool(name, spec));
	}

	const coreAbsent = results.filter((r) => r.kind === 'core' && !r.installed);
	const analysisAbsent = results.filter(
		(r) => r.kind === 'analysis' && !r.installed,
	);
	const analysisOptAbsent = results.filter(
		(r) => r.kind === 'analysis-opt' && !r.installed,
	);
	const stackAbsent = results.filter(
		(r) => (r.kind === 'be-java' || r.kind === 'be-py') && !r.installed,
	);

	const passed = coreAbsent.length === 0;

	// v8.8.0 — Tier 5.1 fallback hint aggregation
	const fallbackHints = results
		.filter((r) => !r.installed && r.fallback)
		.map((r) => ({ tool: r.name, kind: r.kind, fallback: r.fallback }));

	const summary = {
		stack,
		pass: passed,
		core_absent: coreAbsent.map((r) => r.name),
		analysis_absent: analysisAbsent.map((r) => r.name),
		analysis_opt_absent: analysisOptAbsent.map((r) => r.name),
		stack_absent: stackAbsent.map((r) => r.name),
		no_simulation_warning:
			analysisAbsent.length > 0
				? `${analysisAbsent.length} analysis 외부 도구 부재 — chain 2 cross-cutting (static-security/openapi-lint/legacy) 실 실행 차단 / F-SIM 후속 등재 의무`
				: null,
		fallback_hints: fallbackHints,
	};

	if (jsonOutput) {
		console.log(JSON.stringify({ summary, results }, null, 2));
	} else {
		console.log(`preflight-check — stack=${stack}`);
		console.log(
			`  ${passed ? '✅' : '❌'} core: ${coreAbsent.length === 0 ? 'all present' : coreAbsent.map((r) => r.name).join(', ') + ' ABSENT'}`,
		);
		console.log(
			`  ${stackAbsent.length === 0 ? '✅' : '⚠️'} stack: ${stackAbsent.length === 0 ? 'all present' : stackAbsent.map((r) => r.name).join(', ') + ' absent (chain 3/4 RED/GREEN 영향)'}`,
		);
		console.log(
			`  ${analysisAbsent.length === 0 ? '✅' : '⚠️'} analysis: ${analysisAbsent.length === 0 ? 'all present' : analysisAbsent.map((r) => r.name).join(', ') + ' absent (no-simulation = F-SIM 후속 의무)'}`,
		);
		if (analysisOptAbsent.length > 0) {
			console.log(
				`  ${'⚠️'} analysis-opt: ${analysisOptAbsent.map((r) => r.name).join(', ')} absent (선택 도구 / fallback 참고)`,
			);
		}
		console.log('');
		for (const r of results) {
			const icon = r.installed ? '✅' : r.kind === 'core' ? '❌' : '⚠️';
			console.log(
				`  ${icon} ${r.name.padEnd(12)} [${r.kind.padEnd(13)}] ${r.installed ? r.version : 'ABSENT'}`,
			);
		}
		if (fallbackHints.length > 0) {
			console.log('');
			console.log('Fallback hints (v8.8.0 Tier 5.1 — 미가용 도구 대체 path):');
			for (const h of fallbackHints) {
				console.log(`  - ${h.tool} [${h.kind}]: ${h.fallback}`);
			}
		}
	}

	process.exit(passed ? 0 : 1);
}

// CLI 직접 실행 시에만 main() — import(테스트) 시에는 실행 안 함 (checkTool 단위 테스트용).
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
	main();
}
