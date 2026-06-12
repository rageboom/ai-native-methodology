#!/usr/bin/env node
// bc-accumulator-rollup CLI — 직렬 post-merge rollup (DEC-2026-06-12-parallel-bc-accumulator-rollup ②).
//
//   사용:
//     bc-accumulator-rollup --bc-dir <domains/BC-X> --output-root <output dir>
//       [--bc <BC-ID>] [--findings-phase <phase>] [--shared-domain <path>] [--dry-run] [--report <path>]
//
//   --bc-dir       : per-BC zone 디렉토리(필수 / business-rules.json·migration-cautions.json·
//                    findings-<phase>.json·domain.json fragment). 부재 시 exit 3.
//   --output-root  : shared 누적기 디렉토리(필수). business-rules.json(index)·migration-cautions.json·
//                    findings-<phase>.json 위치. domain 은 --shared-domain(기본 <root>/shared/domain.json).
//   --dry-run      : 쓰지 않고 무엇이 바뀔지만 리포트(병렬 worktree 규율 — 직렬 머지 전 미리보기).
//
//   exit 0 = 정상 / 2 = usage / 3 = --bc-dir 부재.
//   멱등: 재실행=동일 상태(upsert by id/title). sibling BC 보존.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectIndent, writeJsonPreservingIndent } from '../../_shared/append-catalog.js';
import { rollupBc, TOOL_VERSION } from './rollup.js';

function parseArgs(argv) {
	const o = {
		bcDir: null, outputRoot: null, bc: null,
		findingsPhase: 'analysis', sharedDomain: null, dryRun: false, report: null,
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--bc-dir') o.bcDir = argv[++i];
		else if (a === '--output-root') o.outputRoot = argv[++i];
		else if (a === '--bc') o.bc = argv[++i];
		else if (a === '--findings-phase') o.findingsPhase = argv[++i];
		else if (a === '--shared-domain') o.sharedDomain = argv[++i];
		else if (a === '--dry-run') o.dryRun = true;
		else if (a === '--report') o.report = argv[++i];
	}
	return o;
}

function usage() {
	console.error('usage:');
	console.error('  bc-accumulator-rollup --bc-dir <domains/BC-X> --output-root <output dir>');
	console.error('    [--bc <BC-ID>] [--findings-phase <phase>] [--shared-domain <path>] [--dry-run] [--report <path>]');
	console.error('  (--bc-dir 부재 시 exit 3 / 멱등 / sibling BC 보존)');
}

// 안전 read — 부재/파싱실패 = {obj:null}. 존재 시 indent 보존.
function readJsonSafe(path) {
	if (!existsSync(path)) return { obj: null, indent: 2, trailingNewline: true, exists: false };
	try {
		const text = readFileSync(path, 'utf-8');
		return { obj: JSON.parse(text), indent: detectIndent(text), trailingNewline: text.endsWith('\n'), exists: true };
	} catch (e) {
		console.error(`[bc-accumulator-rollup] 파싱 실패(skip): ${path} — ${e.message}`);
		return { obj: null, indent: 2, trailingNewline: true, exists: false };
	}
}

function main() {
	const o = parseArgs(process.argv.slice(2));
	if (!o.bcDir || !o.outputRoot) {
		usage();
		process.exit(2);
	}
	const bcDir = resolve(o.bcDir);
	if (!existsSync(bcDir)) {
		console.error(`[bc-accumulator-rollup] 환경 부재: --bc-dir 없음 (${bcDir}).`);
		process.exit(3);
	}
	const root = resolve(o.outputRoot);
	const bcId = o.bc || basename(bcDir);
	const findingsFile = `findings-${o.findingsPhase}.json`;

	// fragment 경로 (per-BC zone).
	const fragPaths = {
		businessRules: join(bcDir, 'business-rules.json'),
		cautions: join(bcDir, 'migration-cautions.json'),
		findings: join(bcDir, findingsFile),
		domain: join(bcDir, 'domain.json'),
	};
	// shared 누적기 경로.
	const indexPath = join(root, 'business-rules.json');
	const cautionsPath = join(root, 'migration-cautions.json');
	const findingsPath = join(root, findingsFile);
	const domainPath = o.sharedDomain
		? resolve(o.sharedDomain)
		: existsSync(join(root, 'shared', 'domain.json'))
			? join(root, 'shared', 'domain.json')
			: join(root, 'domain.json');

	const fragments = {
		businessRules: readJsonSafe(fragPaths.businessRules).obj,
		cautions: readJsonSafe(fragPaths.cautions).obj,
		findings: readJsonSafe(fragPaths.findings).obj,
		domain: readJsonSafe(fragPaths.domain).obj,
	};
	const sh = {
		index: readJsonSafe(indexPath),
		cautions: readJsonSafe(cautionsPath),
		findings: readJsonSafe(findingsPath),
		domain: readJsonSafe(domainPath),
	};

	// br leaf 경로 = index 파일 dir 기준 상대(loader 계약).
	const leafRelPath = relative(dirname(indexPath), fragPaths.businessRules).split('\\').join('/');

	const { accumulators, report } = rollupBc({
		bcId,
		fragments,
		accumulators: {
			index: sh.index.obj,
			cautions: sh.cautions.obj,
			findings: sh.findings.obj,
			domain: sh.domain.obj,
		},
		leafRelPath,
		nowIso: new Date().toISOString(),
	});
	report.dry_run = o.dryRun;

	// 쓰기 대상 매핑 (fragment 있고 결과 갱신된 것만 / domain 은 shared 선재 시만).
	const writes = [];
	if (fragments.businessRules) writes.push([indexPath, accumulators.index, sh.index]);
	if (fragments.cautions) writes.push([cautionsPath, accumulators.cautions, sh.cautions]);
	if (fragments.findings) writes.push([findingsPath, accumulators.findings, sh.findings]);
	if (fragments.domain && sh.domain.exists) writes.push([domainPath, accumulators.domain, sh.domain]);

	if (!o.dryRun) {
		for (const [p, obj, meta] of writes) {
			mkdirSync(dirname(p), { recursive: true });
			writeJsonPreservingIndent(p, obj, meta.exists ? meta.indent : 2, true);
		}
	}
	if (o.report) {
		mkdirSync(dirname(resolve(o.report)), { recursive: true });
		writeFileSync(resolve(o.report), JSON.stringify(report, null, 2) + '\n');
	}

	// 사람용 요약.
	const tag = o.dryRun ? 'DRY-RUN (미기록)' : '기록 완료';
	console.log(`[bc-accumulator-rollup] v${TOOL_VERSION} ${bcId} → ${root} [${tag}]`);
	for (const r of report.results) {
		if (r.accumulator === 'business-rules-index')
			console.log(`  business-rules index: ${r.action} (rule_count ${r.rule_count} / total_rules ${r.total_rules})`);
		else if (r.accumulator === 'migration-cautions')
			console.log(`  migration-cautions: ${r.group_count} group [${r.groups.map((g) => `${g.action}:${g.cautions}c`).join(', ')}]`);
		else if (r.accumulator === 'findings')
			console.log(`  findings(${o.findingsPhase}): +${r.appended} append / ${r.replaced} replace → total ${r.total} (${Object.entries(r.by_severity).map(([k, v]) => `${k} ${v}`).join('/')})`);
		else if (r.accumulator === 'domain')
			console.log(`  domain: ${r.action}${r.reason ? ` (${r.reason})` : ''}`);
	}
	for (const s of report.skipped) console.log(`  [skip] ${s.accumulator}: ${s.reason}`);
	if (o.dryRun) console.log('[bc-accumulator-rollup] DRY-RUN — 실제 기록은 --dry-run 제거 후. 병렬 worktree 는 머지 후 직렬 1회 실행 권장.');
	// process.exit(0) 안 함 — footgun 회피.
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main();
}
