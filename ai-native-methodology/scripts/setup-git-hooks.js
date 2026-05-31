#!/usr/bin/env node
// setup-git-hooks.js — git pre-push release gate 설치 (클론마다 1회).
//
// git 은 보안상 버전관리된 hook 을 자동 실행하지 않으므로, core.hooksPath 를
// 본 repo 의 tracked githooks 디렉토리로 지정해야 pre-push gate 가 작동.
// (F-AUDIT-SOFTGATE-001 후속 — 사내 GitHub Actions 부재 대응 / release gate 를 push 시점에 자동 강제.)
//
// 사용:   node ai-native-methodology/scripts/setup-git-hooks.js
// 해제:   git config --unset core.hooksPath

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPTS_DIR = dirname(__filename);            // <methodology>/scripts
const HOOKS_DIR = join(SCRIPTS_DIR, 'githooks');    // <methodology>/scripts/githooks

function fail(msg) {
  console.error(`[setup-git-hooks] ${msg}`);
  process.exit(1);
}

if (!existsSync(join(HOOKS_DIR, 'pre-push'))) {
  fail(`pre-push hook 부재: ${join(HOOKS_DIR, 'pre-push')}`);
}

let repoRoot;
try {
  repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
} catch {
  fail('git repo 아님 (git rev-parse --show-toplevel 실패).');
}

// core.hooksPath = repo-root 기준 상대 경로 (POSIX 슬래시 / 클론 위치 무관 portable).
const relPath = relative(repoRoot, HOOKS_DIR).split('\\').join('/');

try {
  execSync(`git config core.hooksPath "${relPath}"`, { encoding: 'utf-8' });
} catch (e) {
  fail(`core.hooksPath 설정 실패: ${e.message}`);
}

console.log(`[setup-git-hooks] OK: core.hooksPath = ${relPath}`);
console.log('[setup-git-hooks] 이제 git push 시 release gate(npm run test:release)가 자동 실행됩니다.');
console.log('[setup-git-hooks] 우회: git push --no-verify   /   해제: git config --unset core.hooksPath');
