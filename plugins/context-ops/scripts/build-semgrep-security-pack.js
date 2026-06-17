#!/usr/bin/env node
// build-semgrep-security-pack.js — tools/semgrep-rules/ 벤더 트리에서 security 카테고리
//   룰만 결정적으로 추려 tools/semgrep-rules-security/ 단일 팩으로 조립한다.
//
// 배경 (DEC-2026-06-17-semgrep-local-security-ruleset / F-DOGFOOD-015 동형):
//   - 사내 SSL 검사 프록시가 semgrep.dev 룰 레지스트리를 가로챔 → `--config p/owasp-top-ten`
//     이 SSL CERTIFICATE_VERIFY_FAILED → semgrep exit 7 → scan FAILED. 사내망 전 PC 동형.
//   - 전체 벤더 트리(2178)를 그냥 `--config` 하면 pro-only·비룰 yaml 혼입으로 exit 7
//     ("config 에 invalid rule 1개+ 존재" / semgrep 은 깨진 룰 skip 불가).
//   - 따라서 security 카테고리만(전 언어 1386 / owasp 의도 보존 / track-agnostic) 추린
//     단일 디렉토리 팩이 필요하고, semgrep 언어 자동필터로 타깃 외 룰은 로드만 된다.
//
// 계약:
//   - 결정적·네트워크 0 — 파일 복사만 (semgrep 미실행 / CI 어디서든 재현). `--verify` 시에만
//     semgrep on PATH 면 smoke 스캔으로 EXIT 0/1 확인 (no-simulation — 실 실행만).
//   - 멱등 — 대상 디렉토리를 비우고 재생성. 룰 트리 업데이트 시 재실행 = SSOT 단일.
//   - 구조 보존 복사 (flatten ❌ — nested rule-id 충돌 회피).
//
// 사용: node scripts/build-semgrep-security-pack.js [--verify] [--json]

import {
	readdirSync,
	mkdirSync,
	copyFileSync,
	rmSync,
	existsSync,
	statSync,
	writeFileSync,
	mkdtempSync,
} from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'tools', 'semgrep-rules');
const DEST_DIR = join(ROOT, 'tools', 'semgrep-rules-security');

// security 룰만 — 경로에 /security/ 세그먼트 + .yaml|.yml + test/fixture 경로 제외.
const EXCLUDED_SEGMENTS = new Set(['test', 'tests', '__tests__', 'fixtures']);
const RULE_EXT = /\.ya?ml$/i;

function isSecurityRule(relPath) {
	const segs = relPath.split(sep);
	if (!RULE_EXT.test(relPath)) return false;
	if (!segs.includes('security')) return false;
	if (segs.some((s) => EXCLUDED_SEGMENTS.has(s))) return false;
	return true;
}

// SRC_DIR 기준 상대경로의 security 룰 전수 수집 (재귀).
function collectRules(dir, acc) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const abs = join(dir, entry.name);
		if (entry.isDirectory()) {
			collectRules(abs, acc);
		} else if (entry.isFile()) {
			const rel = relative(SRC_DIR, abs);
			if (isSecurityRule(rel)) acc.push(rel);
		}
	}
	return acc;
}

function build() {
	if (!existsSync(SRC_DIR) || !statSync(SRC_DIR).isDirectory()) {
		throw new Error(`source 벤더 트리 부재: ${SRC_DIR}`);
	}
	// 멱등 — 대상 비우고 재생성.
	rmSync(DEST_DIR, { recursive: true, force: true });
	mkdirSync(DEST_DIR, { recursive: true });

	const rules = collectRules(SRC_DIR, []);
	for (const rel of rules) {
		const destPath = join(DEST_DIR, rel);
		mkdirSync(dirname(destPath), { recursive: true });
		copyFileSync(join(SRC_DIR, rel), destPath);
	}
	return rules.length;
}

// `--verify` — semgrep on PATH 면 smoke 스캔으로 EXIT 0/1 확인 (조립된 팩이 valid config 인지).
//   semgrep 부재 = honest skip (설치는 SessionStart hook 책임 / 본 스크립트는 네트워크 0 결정론).
function verifySmoke() {
	const probe = spawnSync('sh', ['-c', 'command -v semgrep'], { stdio: 'ignore' });
	if (probe.status !== 0) {
		return { ran: false, reason: 'semgrep not on PATH — smoke skip (honest)' };
	}
	// 작은 합성 타깃 — config 유효성(exit 7 회피)만 확인하면 되므로 전체 트리 스캔 불필요.
	//   깨진 룰이 1개라도 있으면 타깃과 무관하게 semgrep 이 exit 7 로 죽는다.
	const tmp = mkdtempSync(join(tmpdir(), 'sg-smoke-'));
	writeFileSync(
		join(tmp, 's.js'),
		'app.get("/x",(req,res)=>{res.send(req.query.q); eval(req.query.code)});\n',
	);
	writeFileSync(
		join(tmp, 'T.java'),
		'public class T{ void x(String s) throws Exception { Runtime.getRuntime().exec(s); } }\n',
	);
	const res = spawnSync(
		'semgrep',
		['scan', '--config', DEST_DIR, '--metrics', 'off', '--no-git-ignore', '--quiet', tmp],
		{
			env: {
				...process.env,
				SEMGREP_ENABLE_VERSION_CHECK: '0',
				SEMGREP_SEND_METRICS: 'off',
			},
			encoding: 'utf-8',
			timeout: 300_000,
		},
	);
	rmSync(tmp, { recursive: true, force: true });
	const code = res.status;
	// 0=clean / 1=findings = valid config 로딩 성공. 2+ (특히 7=invalid rule) = 팩에 깨진 룰.
	return { ran: true, exitCode: code, ok: code === 0 || code === 1 };
}

function main() {
	const argv = process.argv.slice(2);
	const wantVerify = argv.includes('--verify');
	const wantJson = argv.includes('--json');

	const count = build();
	const out = { pack_dir: DEST_DIR, rule_count: count };

	if (wantVerify) {
		out.verify = verifySmoke();
		if (out.verify.ran && !out.verify.ok) {
			out.error = `smoke 스캔 실패 exit=${out.verify.exitCode} — 팩에 invalid rule 의심`;
		}
	}

	if (wantJson) {
		console.log(JSON.stringify(out, null, 2));
	} else {
		console.log(`[build-semgrep-security-pack] ${count} security rules → ${relative(ROOT, DEST_DIR)}`);
		if (out.verify) {
			console.log(
				out.verify.ran
					? `  smoke: exit=${out.verify.exitCode} ${out.verify.ok ? 'OK' : 'FAIL'}`
					: `  smoke: ${out.verify.reason}`,
			);
		}
	}

	if (out.error) {
		console.error(out.error);
		process.exit(1);
	}
	process.exit(0);
}

main();
