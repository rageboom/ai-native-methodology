// import-verify.test.js — F-DOGFOOD-013: import 도달 결정론 검증 (모노레포 동명 심볼 오연결 분류).
//   fixture = tmp 모노레포 (apps/a·apps/b + packages/ui + tsconfig paths alias).
import { describe, it, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	createImportVerifier,
	annotateImportVerification,
	parseImportSpecifiers,
} from '../src/import-verify.js';

describe('parseImportSpecifiers', () => {
	it('static / side-effect / dynamic / require / re-export 전부 추출', () => {
		const src = `
import { a } from './x';
import './side-effect';
export { b } from '../y';
const m = await import('@/dyn/mod');
const r = require('@sgh/ui');
`;
		const specs = parseImportSpecifiers(src);
		assert.ok(specs.includes('./x'));
		assert.ok(specs.includes('./side-effect'));
		assert.ok(specs.includes('../y'));
		assert.ok(specs.includes('@/dyn/mod'));
		assert.ok(specs.includes('@sgh/ui'));
	});
});

describe('createImportVerifier — 해석 경로 3종 + 부정 케이스', () => {
	let root;
	before(() => {
		root = mkdtempSync(join(tmpdir(), 'imv-'));
		// apps/a — tsconfig paths alias 보유
		mkdirSync(join(root, 'apps/a/src/feat'), { recursive: true });
		mkdirSync(join(root, 'apps/a/src/common'), { recursive: true });
		writeFileSync(
			join(root, 'apps/a/tsconfig.json'),
			JSON.stringify({ compilerOptions: { paths: { '@/*': ['./src/*'] } } }),
		);
		writeFileSync(join(root, 'apps/a/package.json'), JSON.stringify({ name: 'app-a' }));
		writeFileSync(
			join(root, 'apps/a/src/feat/caller.ts'),
			`import { rel } from './relative-target';
import { ali } from '@/common/alias-target';
import { pkg } from '@sgh/ui';
export function caller() { rel(); ali(); pkg(); openCommonToastbar(); }
`,
		);
		writeFileSync(join(root, 'apps/a/src/feat/relative-target.ts'), 'export const rel = () => {};\n');
		writeFileSync(join(root, 'apps/a/src/common/alias-target.ts'), 'export const ali = () => {};\n');
		// apps/b — 동명 심볼 보유 (caller 가 import 하지 않음 = 이름-해석 의심 대상)
		mkdirSync(join(root, 'apps/b/src/utils'), { recursive: true });
		writeFileSync(join(root, 'apps/b/package.json'), JSON.stringify({ name: 'app-b' }));
		writeFileSync(
			join(root, 'apps/b/src/utils/error.ts'),
			'export const openCommonToastbar = () => {};\n',
		);
		// packages/ui — workspace 패키지
		mkdirSync(join(root, 'packages/ui/src'), { recursive: true });
		writeFileSync(join(root, 'packages/ui/package.json'), JSON.stringify({ name: '@sgh/ui' }));
		writeFileSync(join(root, 'packages/ui/src/index.ts'), 'export const pkg = () => {};\n');
	});
	after(() => rmSync(root, { recursive: true, force: true }));

	it('(1) 상대경로 import → verified', () => {
		const v = createImportVerifier(root);
		assert.equal(v.verifyPair('apps/a/src/feat/caller.ts', 'apps/a/src/feat/relative-target.ts'), true);
	});
	it('(2) tsconfig paths alias → verified', () => {
		const v = createImportVerifier(root);
		assert.equal(v.verifyPair('apps/a/src/feat/caller.ts', 'apps/a/src/common/alias-target.ts'), true);
	});
	it('(3) workspace 패키지명 → 패키지 내부 파일 verified (디렉토리-level)', () => {
		const v = createImportVerifier(root);
		assert.equal(v.verifyPair('apps/a/src/feat/caller.ts', 'packages/ui/src/index.ts'), true);
	});
	it('앱 간 동명 심볼 오연결 (import 부재) → unverified (ep-fe-mis 실측 패턴)', () => {
		const v = createImportVerifier(root);
		assert.equal(v.verifyPair('apps/a/src/feat/caller.ts', 'apps/b/src/utils/error.ts'), false);
	});

	it('annotateImportVerification — holes 분류 + file_pairs 제거 + 요약', () => {
		const moduleAxis = {
			holes: [
				{
					from: 'MOD-A-FEAT', to: 'MOD-A-COMMON', weight: 1,
					file_pairs: [{ source_file: 'apps/a/src/feat/caller.ts', target_file: 'apps/a/src/common/alias-target.ts' }],
					file_pairs_truncated: false,
				},
				{
					from: 'MOD-A-FEAT', to: 'MOD-B', weight: 8,
					file_pairs: [{ source_file: 'apps/a/src/feat/caller.ts', target_file: 'apps/b/src/utils/error.ts' }],
					file_pairs_truncated: false,
				},
			],
		};
		annotateImportVerification(moduleAxis, root);
		assert.equal(moduleAxis.holes[0].import_verified, true);
		assert.equal(moduleAxis.holes[1].import_verified, false);
		assert.equal('file_pairs' in moduleAxis.holes[0], false, '내부 입력 제거 (report 비포함)');
		assert.deepEqual(moduleAxis.import_verification, { status: 'done', verified: 1, unverified: 1 });
	});

	it('annotateImportVerification — repoRoot 부재 = skipped (정직 표기 / --db 단독 모드)', () => {
		const moduleAxis = {
			holes: [{ from: 'A', to: 'B', weight: 1, file_pairs: [], file_pairs_truncated: false }],
		};
		annotateImportVerification(moduleAxis, null);
		assert.equal(moduleAxis.import_verification.status, 'skipped');
		assert.equal('import_verified' in moduleAxis.holes[0], false);
		assert.equal('file_pairs' in moduleAxis.holes[0], false);
	});
});
