#!/usr/bin/env node
// publish.js — plugin npm 패키지를 Nexus npm-hosted 레지스트리에 publish
// (source:npm 배포 채널 / build-plugin.js = git-subdir Claude 아티팩트 채널과 별개)
//
// usage:
//   node scripts/publish.js --dry-run                  # version-check + npm publish --dry-run (업로드 없음 / tarball 내용·bundled deps 확인)
//   node scripts/publish.js                            # publishConfig.registry 로 publish
//   node scripts/publish.js --registry <url>           # 레지스트리 override (verdaccio 검증 / Nexus URL 치환 전)
//
// 인증: .npmrc 의 //<host>/...:_authToken=... (또는 base64 _auth) 에 의존. 이 스크립트는 자격증명을 다루지 않음.
//   ★ source:npm 은 설치 시 deps 를 npm install 하지 않으므로 외부 의존(ajv/ajv-formats/fast-xml-parser)은
//     package.json bundledDependencies 로 tarball 에 동봉됨 (Phase 0 실측). publish 전 `npm install` 로 node_modules 채워둘 것.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = resolve(__filename, '..');
const WORKSPACE = resolve(SCRIPT_DIR, '..');

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const regIdx = argv.indexOf('--registry');
const REGISTRY_OVERRIDE = regIdx !== -1 ? argv[regIdx + 1] : null;

function fail(msg) {
  console.error(`[publish] ★ ${msg}`);
  process.exit(1);
}

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function main() {
  const pkg = readJson(join(WORKSPACE, 'package.json'));
  const registry = REGISTRY_OVERRIDE || pkg.publishConfig?.registry;

  console.log(`[publish] package:  ${pkg.name}@${pkg.version}`);
  console.log(`[publish] registry: ${registry || '(none)'}`);
  console.log(`[publish] mode:     ${DRY_RUN ? 'dry-run (no upload)' : 'publish'}`);

  if (pkg.private) fail('package.json private:true — publish 차단. private:false 로 전환 필요.');
  if (!registry) fail('레지스트리 미지정 — publishConfig.registry 또는 --registry <url> 필요.');

  // ★ gate 1 — version 3-way sync (plugin.json ↔ CHANGELOG ↔ package.json)
  console.log('\n[publish] ★ version-check (3-way sync gate)…');
  try {
    execSync(`node "${join(SCRIPT_DIR, 'version-check.js')}"`, { stdio: 'inherit', cwd: WORKSPACE });
  } catch {
    fail('version-check 실패 — abort.');
  }

  // ★ gate 2 — bundledDependencies node_modules 존재 확인 (없으면 deps 누락 publish 위험)
  const bundled = pkg.bundledDependencies || pkg.bundleDependencies || [];
  for (const dep of bundled) {
    if (!existsSync(join(WORKSPACE, 'node_modules', ...dep.split('/')))) {
      fail(`bundledDependency '${dep}' 가 node_modules 에 없음 — 먼저 'npm install' 실행 필요 (tarball 동봉 불가).`);
    }
  }
  if (bundled.length) console.log(`[publish] ★ bundledDependencies 확인: ${bundled.join(', ')} (node_modules 존재)`);

  // ★ publish (npm 자체 --dry-run 사용 — tarball 내용 + bundled deps 출력)
  const regFlag = `--registry "${registry}"`;
  const dryFlag = DRY_RUN ? '--dry-run' : '';
  const cmd = `npm publish ${dryFlag} ${regFlag}`.replace(/\s+/g, ' ').trim();
  console.log(`\n[publish] ★ ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: WORKSPACE });
  } catch {
    fail('npm publish 실패 — .npmrc 인증(_authToken) / 레지스트리 권한 / 네트워크 확인.');
  }

  console.log(`\n[publish] ✅ ${DRY_RUN ? 'dry-run 완료 (업로드 없음)' : `published ${pkg.name}@${pkg.version} → ${registry}`}`);
  if (!DRY_RUN) {
    console.log('[publish] ℹ 카탈로그(marketplace.json)는 version RANGE(^x) 라 patch/minor 에는 불변 — 사용자 autoUpdate 가 자동 재해석.');
    console.log('[publish] ℹ MAJOR range/description/새 플러그인 변경 시에만: npm run publish:catalog --user <nexus-id>');
  }
}

main();
