#!/usr/bin/env node
// publish-catalog.js — 카탈로그(repo-root .claude-plugin/marketplace.json)를 Nexus raw repo 에 업로드
//
// npm 패키지 publish(publish.js)와 별개 채널 / 다른 cadence:
//     - npm 패키지: 매 release 고정 버전 bump (publish.js → npm-hosted, npm 토큰 인증)
//     - 카탈로그:   version 은 RANGE(^12.0.0) + metadata → 사용자 autoUpdate 가 범위를 재해석하므로
//                   MAJOR range 이동(^12→^13) / description / 새 플러그인 추가 시에만 변경.
//   → 일반 release(patch/minor)에는 카탈로그 불변 = 재업로드 불요. 카탈로그가 바뀐 release 에서만 실행.
//
// usage:
//   node scripts/publish-catalog.js --dry-run            # 검증 + 미리보기 (업로드 없음)
//   node scripts/publish-catalog.js                      # --user 생략 시 ID 를 대화형 prompt(기본 admin) → curl 이 비번 prompt
//   node scripts/publish-catalog.js --user <nexus-id>    # 업로드 (curl 이 비밀번호를 prompt — 채팅/스크립트에 비번 넣지 말 것)
//   node scripts/publish-catalog.js --user <id> --url <override>
//
// 인증: Nexus raw(serving-static) write 권한 계정 (HTTP Basic). npm 토큰과 별개.
//   ⚠ ID/비번 대화형 prompt 는 실제 터미널(TTY)에서만 동작 — 비대화식(CI/캡처 셸)이면 --user 명시 필요.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = resolve(__filename, '..'); // repo-root/scripts
const REPO_ROOT = resolve(SCRIPT_DIR, '..'); // repo-root

const DEFAULT_URL =
	'https://repo.smiledev.net/repository/serving-static/mis-plugins/marketplace.json';
const CATALOG = join(REPO_ROOT, '.claude-plugin', 'marketplace.json'); // 생성물(build-catalog.js) — 손편집 ❌

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const arg = (flag) => {
	const i = argv.indexOf(flag);
	return i !== -1 ? argv[i + 1] : null;
};
const user = arg('--user');
const url = arg('--url') || DEFAULT_URL;

const fail = (m) => {
	console.error(`[publish-catalog] ${m}`);
	process.exit(1);
};

// drift gate — 카탈로그는 생성물이므로 업로드 전 build-catalog --check 로 최신 여부 강제.
try {
	execSync(`node "${join(SCRIPT_DIR, 'build-catalog.js')}" --check`, {
		stdio: 'inherit',
		cwd: REPO_ROOT,
	});
} catch {
	fail('카탈로그 drift — `npm run catalog:build` 후 커밋하고 다시 업로드할 것.');
}

if (!existsSync(CATALOG)) fail(`카탈로그 없음: ${CATALOG}`);
let cat;
try {
	cat = JSON.parse(readFileSync(CATALOG, 'utf-8'));
} catch (e) {
	fail(`marketplace.json JSON parse 실패: ${e.message}`);
}

// 검증 — URL 카탈로그는 npm/git-url 소스만 (상대경로 './' 는 URL 호스팅 시 파손)
if (!cat.name) fail('marketplace.json: name 없음');
if (!Array.isArray(cat.plugins) || cat.plugins.length === 0)
	fail('marketplace.json: plugins[] 비어있음');
for (const p of cat.plugins) {
	const s = p.source && p.source.source;
	if (s !== 'npm' && s !== 'url' && s !== 'github' && s !== 'git') {
		fail(
			`plugin '${p.name}' source='${s}' — URL 카탈로그는 npm/url/github/git 소스만 (상대경로 ❌).`,
		);
	}
}

console.log(`[publish-catalog] catalog:  ${CATALOG}`);
console.log(
	`[publish-catalog] name:     ${cat.name} / plugins: ${cat.plugins.map((p) => `${p.name}(${p.source.source})`).join(', ')}`,
);
console.log(`[publish-catalog] target:   ${url}`);
console.log(
	`[publish-catalog] mode:     ${DRY ? 'dry-run (검증만)' : 'upload'}`,
);

if (DRY) {
	console.log('\n[publish-catalog] ✅ 검증 통과 (업로드 없음)');
	process.exit(0);
}
// --user 생략 시 — TTY 면 ID 를 대화형 prompt(기본 admin), 비대화식이면 fail(CI 안전).
// 비번은 어느 경로든 curl 이 prompt(-u <user>) — 명령줄/히스토리에 비번 미노출.
let resolvedUser = user;
if (!resolvedUser) {
	if (!process.stdin.isTTY)
		fail(
			'--user <nexus-id> 필요 (비대화식 환경 — TTY 없음 / 채팅·스크립트에 비번 넣지 말 것).',
		);
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	const answer = (
		await rl.question('[publish-catalog] Nexus user ID [admin]: ')
	).trim();
	rl.close();
	resolvedUser = answer || 'admin';
}

console.log(
	`\n[publish-catalog] curl PUT as '${resolvedUser}' (비밀번호 prompt)…`,
);
try {
	execSync(
		`curl -fSs -u ${resolvedUser} --upload-file "${CATALOG}" "${url}" -w "\\n[publish-catalog] HTTP %{http_code}\\n"`,
		{ stdio: 'inherit' },
	);
} catch {
	fail('업로드 실패 — 인증/권한(raw write)/네트워크 확인.');
}

console.log('[publish-catalog] 업로드 검증 (anonymous GET)…');
try {
	JSON.parse(execSync(`curl -fSs "${url}"`, { encoding: 'utf-8' }));
	console.log(
		`[publish-catalog] ✅ ${url} → 200 valid JSON / 통일 설치: /plugin marketplace add ${url}`,
	);
} catch {
	console.warn(
		'[publish-catalog] ⚠ 업로드 직후 GET 검증 실패 — Nexus 인덱싱 지연일 수 있음(잠시 후 재확인).',
	);
}
